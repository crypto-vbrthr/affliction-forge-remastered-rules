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

function collectUserFacingStrings(definition) {
  const values = [definition.name, definition.description];
  for (const stage of definition.stages ?? []) values.push(stage?.name, stage?.description);
  for (const check of definition.checks ?? []) values.push(check?.label);
  return values.filter((value) => typeof value === "string");
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
  if (definition.schemaVersion !== 2) errors.push("schemaVersion must be 2 for Affliction Forge 0.1.47.");
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
