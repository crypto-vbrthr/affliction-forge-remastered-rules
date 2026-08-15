import crypto from "node:crypto";

export const MODULE_ID = "affliction-forge-remastered-rules";
export const AFFLICTION_FORGE_ID = "pf2e-affliction-forge";
export const SUPPORTED_PACKS = Object.freeze([
  "player-core",
  "gm-core",
  "player-core-2",
  "treasure-vault-remastered"
]);
export const SOURCE_WORK_IDS = new Set(SUPPORTED_PACKS);
export const AFFLICTION_TYPES = new Set(["poison", "disease", "curse", "other"]);
export const RARITIES = new Set(["common", "uncommon", "rare", "unique"]);
export const DC_MODES = new Set(["fixed", "source"]);
export const SAVE_STATISTICS = new Set(["fortitude", "reflex", "will"]);
export const DURATION_UNITS = new Set(["rounds", "minutes", "hours", "days", "unlimited"]);
export const HEALING_RESTRICTION_MODES = new Set(["none", "all", "affliction-damage"]);
export const STAGE_EFFECT_PERSISTENCE_MODES = new Set(["stage", "affliction", "permanent"]);
export const NUMERIC_MODIFIER_TYPES = new Set(["untyped", "status", "circumstance", "item"]);
export const AFFLICTION_CAPABILITIES = new Set(["speak"]);
export const EVENT_REACTION_EVENTS = new Set(["damage-taken"]);
export const REACTION_OUTCOMES = new Set(["criticalSuccess", "success", "failure", "criticalFailure"]);

// Deliberately short and conservative. This is not a legal classifier. It is a
// release guard for terms already known to be Reserved Material or branding.
export const FORBIDDEN_USER_FACING_TERMS = Object.freeze([
  "pathfinder",
  "paizo",
  "golarion",
  "absalom",
  "achaekek",
  "ulisses"
]);

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateDuration(errors, value, path, { nullable = true } = {}) {
  if (value == null) {
    if (!nullable) errors.push(`${path} is required.`);
    return;
  }
  if (!isObject(value)) {
    errors.push(`${path} must be an object.`);
    return;
  }
  if (!DURATION_UNITS.has(value.unit)) errors.push(`${path}.unit is unsupported: ${value.unit}`);
  if (value.unit === "unlimited") {
    if (Number(value.value) !== -1) errors.push(`${path}.value must be -1 for unlimited duration.`);
  } else if (!Number.isFinite(Number(value.value)) || Number(value.value) <= 0) {
    errors.push(`${path}.value must be a positive number.`);
  }
}


function validateRestrictions(errors, value, path) {
  if (!isObject(value)) {
    errors.push(`${path} must be an object.`);
    return;
  }
  if (!Array.isArray(value.conditionLocks)) errors.push(`${path}.conditionLocks must be an array.`);
  else {
    const slugs = new Set();
    for (const [index, lock] of value.conditionLocks.entries()) {
      const lockPath = `${path}.conditionLocks[${index}]`;
      if (!isObject(lock)) { errors.push(`${lockPath} must be an object.`); continue; }
      if (!nonEmptyString(lock.slug)) errors.push(`${lockPath}.slug is required.`);
      else if (slugs.has(lock.slug)) errors.push(`${lockPath}.slug is duplicated: ${lock.slug}`);
      else slugs.add(lock.slug);
      if (lock.minimum != null && (!Number.isInteger(lock.minimum) || lock.minimum < 1)) {
        errors.push(`${lockPath}.minimum must be null or a positive integer.`);
      }
    }
  }
  if (!HEALING_RESTRICTION_MODES.has(value.healing)) errors.push(`${path}.healing is unsupported: ${value.healing}`);
  if (value.unhealableDamageTypes != null) {
    if (!Array.isArray(value.unhealableDamageTypes)) errors.push(`${path}.unhealableDamageTypes must be an array when present.`);
    else for (const [index, damageType] of value.unhealableDamageTypes.entries()) {
      if (!nonEmptyString(damageType)) errors.push(`${path}.unhealableDamageTypes[${index}] must be a non-empty damage-type slug.`);
    }
  }
  if (!Array.isArray(value.blockedCapabilities)) errors.push(`${path}.blockedCapabilities must be an array.`);
  else for (const capability of value.blockedCapabilities) {
    if (!AFFLICTION_CAPABILITIES.has(capability)) errors.push(`${path}.blockedCapabilities contains unsupported capability: ${capability}`);
  }
}

function collectUserFacingStrings(definition) {
  const values = [definition.name, definition.description];
  for (const stage of definition.stages ?? []) values.push(stage?.name, stage?.description);
  for (const check of definition.checks ?? []) values.push(check?.label);
  return values.filter((value) => typeof value === "string");
}

export function expectedContentFilename(definitionId) {
  if (!nonEmptyString(definitionId)) return null;
  const slug = definitionId.trim().split(".").at(-1);
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return `${slug}.json`;
}

export function deterministicDocumentId(definitionId) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const digest = crypto.createHash("sha256").update(String(definitionId)).digest();
  let result = "";
  for (let index = 0; index < 16; index += 1) result += alphabet[digest[index] % alphabet.length];
  return result;
}

export function validateDefinition(definition, { pack }) {
  const errors = [];
  if (!isObject(definition)) return ["Definition must be an object."];
  if (definition.schemaVersion !== 2) errors.push("schemaVersion must be 2 for Affliction Forge 0.1.53.");
  if (!nonEmptyString(definition.id)) errors.push("id is required.");
  if (nonEmptyString(definition.id) && !definition.id.startsWith(`${MODULE_ID}.`)) {
    errors.push(`id must use stable ${MODULE_ID}. prefix.`);
  }
  if (!nonEmptyString(definition.name)) errors.push("name is required.");
  if (!nonEmptyString(definition.img)) errors.push("img is required.");
  if (!AFFLICTION_TYPES.has(definition.afflictionType)) errors.push(`Unsupported afflictionType: ${definition.afflictionType}`);
  if (!Number.isInteger(definition.level) || definition.level < 0 || definition.level > 25) errors.push("level must be an integer from 0 to 25.");
  if (!RARITIES.has(definition.rarity)) errors.push(`Unsupported rarity: ${definition.rarity}`);
  if (!Array.isArray(definition.traits)) errors.push("traits must be an array.");
  if (!Array.isArray(definition.themes)) errors.push("themes must be an array.");
  validateRestrictions(errors, definition.restrictions, "restrictions");

  if (!Array.isArray(definition.checks) || definition.checks.length === 0) {
    errors.push("checks must contain at least one save check.");
  } else {
    const ids = new Set();
    for (const [index, check] of definition.checks.entries()) {
      const path = `checks[${index}]`;
      if (!isObject(check)) {
        errors.push(`${path} must be an object.`);
        continue;
      }
      if (!nonEmptyString(check.id)) errors.push(`${path}.id is required.`);
      else if (ids.has(check.id)) errors.push(`${path}.id is duplicated: ${check.id}`);
      else ids.add(check.id);
      if (check.kind !== "save") errors.push(`${path}.kind must be save.`);
      if (!SAVE_STATISTICS.has(check.statistic)) errors.push(`${path}.statistic is unsupported: ${check.statistic}`);
      if (!DC_MODES.has(check.dcMode)) errors.push(`${path}.dcMode is unsupported: ${check.dcMode}`);
      if (check.dcMode === "fixed" && (!Number.isInteger(check.dc) || check.dc < 1 || check.dc > 100)) {
        errors.push(`${path}.dc must be an integer from 1 to 100 for fixed DCs.`);
      }
      if (check.dcMode === "source" && check.dc != null && (!Number.isInteger(check.dc) || check.dc < 1 || check.dc > 100)) {
        errors.push(`${path}.dc must be null or an integer from 1 to 100 for source DCs.`);
      }
    }
  }

  validateDuration(errors, definition.onset, "onset");
  validateDuration(errors, definition.maximumDuration, "maximumDuration");

  if (!isObject(definition.progression)) errors.push("progression is required.");
  else if (typeof definition.progression.virulent !== "boolean") errors.push("progression.virulent must be boolean.");

  if (!Array.isArray(definition.stages) || definition.stages.length === 0) {
    errors.push("stages must contain at least one stage.");
  } else {
    for (const [index, stage] of definition.stages.entries()) {
      const path = `stages[${index}]`;
      if (!isObject(stage)) {
        errors.push(`${path} must be an object.`);
        continue;
      }
      if (stage.number !== index + 1) errors.push(`${path}.number must be ${index + 1}.`);
      if (!nonEmptyString(stage.id)) errors.push(`${path}.id is required.`);
      validateDuration(errors, stage.duration, `${path}.duration`, { nullable: false });
      validateRestrictions(errors, stage.restrictions, `${path}.restrictions`);
      if (!STAGE_EFFECT_PERSISTENCE_MODES.has(stage.effectPersistence)) errors.push(`${path}.effectPersistence is unsupported: ${stage.effectPersistence}`);
      if (stage.effectComponentPersistence != null) {
        if (!Array.isArray(stage.effectComponentPersistence)) errors.push(`${path}.effectComponentPersistence must be an array when present.`);
        else {
          const componentCount = Array.isArray(stage.effect?.components) ? stage.effect.components.length : 0;
          if (stage.effectComponentPersistence.length > componentCount) errors.push(`${path}.effectComponentPersistence has more entries than effect components.`);
          for (const [componentIndex, mode] of stage.effectComponentPersistence.entries()) {
            if (mode != null && !STAGE_EFFECT_PERSISTENCE_MODES.has(mode)) errors.push(`${path}.effectComponentPersistence[${componentIndex}] is unsupported: ${mode}`);
          }
        }
      }
      if (stage.numericModifiers != null) {
        if (!Array.isArray(stage.numericModifiers)) errors.push(`${path}.numericModifiers must be an array.`);
        else {
          const modifierIds = new Set();
          for (const [modifierIndex, modifier] of stage.numericModifiers.entries()) {
            const modifierPath = `${path}.numericModifiers[${modifierIndex}]`;
            if (!isObject(modifier)) { errors.push(`${modifierPath} must be an object.`); continue; }
            if (!nonEmptyString(modifier.id)) errors.push(`${modifierPath}.id is required.`);
            else if (modifierIds.has(modifier.id)) errors.push(`${modifierPath}.id is duplicated: ${modifier.id}`);
            else modifierIds.add(modifier.id);
            if (!Array.isArray(modifier.selectors) || modifier.selectors.length === 0) errors.push(`${modifierPath}.selectors must contain at least one PF2e selector.`);
            else if (modifier.selectors.some((entry) => !nonEmptyString(entry))) errors.push(`${modifierPath}.selectors must contain only non-empty strings.`);
            if (!NUMERIC_MODIFIER_TYPES.has(modifier.type)) errors.push(`${modifierPath}.type is unsupported: ${modifier.type}`);
            if (!Number.isFinite(modifier.value) || modifier.value === 0) errors.push(`${modifierPath}.value must be a non-zero finite number.`);
          }
        }
      }
      if (stage.periodicEffects != null) {
        if (!Array.isArray(stage.periodicEffects)) errors.push(`${path}.periodicEffects must be an array.`);
        else {
          const periodicIds = new Set();
          for (const [periodicIndex, periodic] of stage.periodicEffects.entries()) {
            const periodicPath = `${path}.periodicEffects[${periodicIndex}]`;
            if (!isObject(periodic)) { errors.push(`${periodicPath} must be an object.`); continue; }
            if (!nonEmptyString(periodic.id)) errors.push(`${periodicPath}.id is required.`);
            else if (periodicIds.has(periodic.id)) errors.push(`${periodicPath}.id is duplicated: ${periodic.id}`);
            else periodicIds.add(periodic.id);
            const interval = periodic.interval;
            if (!isObject(interval)) errors.push(`${periodicPath}.interval must be an object.`);
            else {
              if (!DURATION_UNITS.has(interval.unit) || interval.unit === "unlimited") errors.push(`${periodicPath}.interval.unit is unsupported: ${interval.unit}`);
              const hasFormula = nonEmptyString(interval.formula);
              const hasValue = Number.isFinite(interval.value) && interval.value > 0;
              if (!hasFormula && !hasValue) errors.push(`${periodicPath}.interval requires a positive value or a dice formula.`);
            }
            if (!isObject(periodic.effect)) errors.push(`${periodicPath}.effect must be an effect object.`);
            else {
              if (periodic.effect.schemaVersion !== 2) errors.push(`${periodicPath}.effect.schemaVersion must be 2.`);
              if (!nonEmptyString(periodic.effect.id)) errors.push(`${periodicPath}.effect.id is required.`);
              if (!nonEmptyString(periodic.effect.name)) errors.push(`${periodicPath}.effect.name is required.`);
              validateDuration(errors, periodic.effect.duration, `${periodicPath}.effect.duration`, { nullable: false });
              if (!Array.isArray(periodic.effect.components)) errors.push(`${periodicPath}.effect.components must be an array.`);
            }
          }
        }
      }
      if (stage.reactions != null) {
        if (!Array.isArray(stage.reactions)) errors.push(`${path}.reactions must be an array.`);
        else {
          const checkIds = new Set((definition.checks ?? []).map((check) => check?.id).filter(Boolean));
          const reactionIds = new Set();
          for (const [reactionIndex, reaction] of stage.reactions.entries()) {
            const reactionPath = `${path}.reactions[${reactionIndex}]`;
            if (!isObject(reaction)) { errors.push(`${reactionPath} must be an object.`); continue; }
            if (!nonEmptyString(reaction.id)) errors.push(`${reactionPath}.id is required.`);
            else if (reactionIds.has(reaction.id)) errors.push(`${reactionPath}.id is duplicated: ${reaction.id}`);
            else reactionIds.add(reaction.id);
            if (!isObject(reaction.trigger)) errors.push(`${reactionPath}.trigger must be an object.`);
            else {
              if (!EVENT_REACTION_EVENTS.has(reaction.trigger.event)) errors.push(`${reactionPath}.trigger.event is unsupported: ${reaction.trigger.event}`);
              if (!Array.isArray(reaction.trigger.damageTypes)) errors.push(`${reactionPath}.trigger.damageTypes must be an array.`);
              else if (reaction.trigger.damageTypes.some((entry) => !nonEmptyString(entry))) errors.push(`${reactionPath}.trigger.damageTypes must contain only non-empty strings.`);
            }
            if (!checkIds.has(reaction.checkId)) errors.push(`${reactionPath}.checkId references an unknown check: ${reaction.checkId}`);
            if (!Array.isArray(reaction.applyOn) || reaction.applyOn.length === 0) errors.push(`${reactionPath}.applyOn must contain at least one outcome.`);
            else for (const outcome of reaction.applyOn) if (!REACTION_OUTCOMES.has(outcome)) errors.push(`${reactionPath}.applyOn contains unsupported outcome: ${outcome}`);
            if (reaction.effect != null) {
              if (!isObject(reaction.effect)) errors.push(`${reactionPath}.effect must be an object or null.`);
              else {
                if (reaction.effect.schemaVersion !== 2) errors.push(`${reactionPath}.effect.schemaVersion must be 2.`);
                if (!nonEmptyString(reaction.effect.id)) errors.push(`${reactionPath}.effect.id is required.`);
                if (!nonEmptyString(reaction.effect.name)) errors.push(`${reactionPath}.effect.name is required.`);
                validateDuration(errors, reaction.effect.duration, `${reactionPath}.effect.duration`, { nullable: false });
                if (!Array.isArray(reaction.effect.components)) errors.push(`${reactionPath}.effect.components must be an array.`);
              }
            }
          }
        }
      }
    }
  }

  const metadata = definition.metadata;
  if (!isObject(metadata)) errors.push("metadata is required.");
  else {
    if (metadata.originModule !== MODULE_ID) errors.push(`metadata.originModule must be ${MODULE_ID}.`);
    if (metadata.originFeature !== "remastered-rules-library") errors.push("metadata.originFeature must be remastered-rules-library.");
    if (metadata.license !== "ORC") errors.push("metadata.license must be ORC.");
    if (!SOURCE_WORK_IDS.has(metadata.sourceWorkId)) errors.push(`Unsupported metadata.sourceWorkId: ${metadata.sourceWorkId}`);
    if (metadata.sourceWorkId !== pack) errors.push(`metadata.sourceWorkId must match pack ${pack}.`);
    if (metadata.contentLanguage !== "de") errors.push("metadata.contentLanguage must be de for the first library release.");
    if (metadata.translation !== "independent-from-english-orc-source") {
      errors.push("metadata.translation must declare independent-from-english-orc-source.");
    }
    if (metadata.automationStatus !== "full") errors.push("Only automationStatus=full entries may ship in the first release set.");
    if (!isObject(metadata.licenseReview)) errors.push("metadata.licenseReview is required.");
    else {
      if (metadata.licenseReview.mechanicsOnly !== true) errors.push("licenseReview.mechanicsOnly must be true.");
      if (metadata.licenseReview.reservedMaterial !== "passed") errors.push("licenseReview.reservedMaterial must be passed.");
      if (metadata.licenseReview.nameReview !== "passed") errors.push("licenseReview.nameReview must be passed.");
    }
  }

  for (const value of collectUserFacingStrings(definition)) {
    const normalized = value.toLocaleLowerCase("en-US");
    for (const term of FORBIDDEN_USER_FACING_TERMS) {
      if (normalized.includes(term)) errors.push(`Reserved/branding guard matched user-facing term: ${term}`);
    }
  }

  return errors;
}

export function buildItemSource(definition) {
  const id = deterministicDocumentId(definition.id);
  return {
    _id: id,
    name: definition.name,
    type: "effect",
    img: definition.img,
    system: {
      description: { value: definition.description ?? "", gm: "" },
      rules: [],
      slug: null,
      traits: {
        value: [...(definition.traits ?? [])],
        otherTags: [...(definition.themes ?? [])]
      },
      level: { value: definition.level },
      duration: { value: -1, unit: "unlimited", expiry: null, sustained: false },
      start: { value: 0, initiative: null },
      badge: null,
      tokenIcon: { show: true },
      unidentified: false
    },
    flags: {
      [AFFLICTION_FORGE_ID]: {
        managed: true,
        documentKind: "affliction-template",
        schemaVersion: 2,
        definitionId: definition.id,
        definitionVersion: 1,
        definition,
        originModule: MODULE_ID,
        originFeature: "remastered-rules-library"
      }
    },
    effects: [],
    folder: null,
    sort: 0,
    ownership: { default: 0 }
  };
}

export function buildPackSource(definition) {
  const item = buildItemSource(definition);
  return {
    _key: `!items!${item._id}`,
    ...item
  };
}
