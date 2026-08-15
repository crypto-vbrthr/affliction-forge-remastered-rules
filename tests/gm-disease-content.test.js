import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateDefinition } from "../tools/lib/content-contract.mjs";
import { BUNDLED_ITEM_SOURCES_BY_PACK } from "../scripts/bundled-content.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const inventory = JSON.parse(fs.readFileSync(path.join(root, "inventory/gm-core-diseases.json"), "utf8"));
const files = fs.readdirSync(path.join(root, "content/gm-core")).filter((name) => name.endsWith(".json")).sort();
const diseases = files.map((name) => JSON.parse(fs.readFileSync(path.join(root, "content/gm-core", name), "utf8")));
const bySource = new Map(diseases.map((entry) => [entry.metadata.sourceName, entry]));

function stage(definition, number) {
  return definition.stages.find((entry) => entry.number === number);
}

test("GM disease inventory tracks all fourteen reviewed source diseases", () => {
  assert.equal(inventory.entries.length, 14);
  assert.equal(inventory.entries.filter((entry) => entry.status === "full").length, 11);
  assert.equal(inventory.entries.filter((entry) => entry.status === "partial").length, 0);
  assert.equal(inventory.entries.filter((entry) => entry.status === "manual").length, 3);
});

test("GM content filenames match the stable language-neutral definition keys", () => {
  for (const filename of files) {
    const disease = JSON.parse(fs.readFileSync(path.join(root, "content/gm-core", filename), "utf8"));
    const key = disease.id.split(".").at(-1);
    assert.equal(filename, `${key}.json`);
  }
});

test("all fourteen published GM diseases pass the 0.1.55 content contract", () => {
  assert.equal(diseases.length, 14);
  for (const disease of diseases) assert.deepEqual(validateDefinition(disease, { pack: "gm-core" }), [], disease.name);
});

test("Sewer Haze remains virulent with its reviewed three-stage progression", () => {
  const disease = bySource.get("Sewer Haze");
  assert.equal(disease.level, 7);
  assert.equal(disease.checks[0].dc, 23);
  assert.deepEqual(disease.onset, { value: 2, unit: "days" });
  assert.equal(disease.progression.virulent, true);
  assert.equal(disease.stages.length, 3);
});

test("Scarlet Fever locks sickened reduction and blocks speech only in stage 3", () => {
  const disease = bySource.get("Scarlet Fever");
  assert.equal(disease.checks[0].dc, 13);
  assert.deepEqual(disease.onset, { value: 2, unit: "days" });
  assert.deepEqual(disease.restrictions.conditionLocks, [{ slug: "sickened", minimum: null }]);
  assert.deepEqual(stage(disease, 3).restrictions.blockedCapabilities, ["speak"]);
  assert.deepEqual(stage(disease, 4).effect.components, [{ type: "death", category: "direct" }]);
});

test("Tetanus models week-long stage 1, speech loss, paralysis, and lethal final stage", () => {
  const disease = bySource.get("Tetanus");
  assert.equal(disease.checks[0].dc, 14);
  assert.deepEqual(disease.onset, { value: 10, unit: "days" });
  assert.deepEqual(stage(disease, 1).duration, { value: 7, unit: "days" });
  assert.deepEqual(stage(disease, 2).restrictions.blockedCapabilities, ["speak"]);
  assert.deepEqual(stage(disease, 3).effect.components, [{ type: "condition", slug: "paralyzed" }]);
  assert.deepEqual(stage(disease, 4).effect.components, [{ type: "death", category: "direct" }]);
});

test("Malaria locks sickened reduction and records recurrence as explicit reapplication policy", () => {
  const disease = bySource.get("Malaria");
  assert.equal(disease.checks[0].dc, 16);
  assert.deepEqual(disease.onset, { value: 10, unit: "days" });
  assert.deepEqual(disease.restrictions.conditionLocks, [{ slug: "sickened", minimum: null }]);
  assert.ok(disease.metadata.automationNotes.some((note) => /reapplying/i.test(note)));
  assert.deepEqual(stage(disease, 4).effect.components, [{ type: "condition", slug: "unconscious" }]);
});

test("Choking Death uses the speak capability restriction at stage 3", () => {
  const disease = bySource.get("Choking Death");
  assert.equal(disease.checks[0].dc, 22);
  assert.deepEqual(disease.onset, { value: 1, unit: "days" });
  assert.equal(stage(disease, 1).effect, null);
  assert.deepEqual(stage(disease, 3).restrictions.blockedCapabilities, ["speak"]);
  assert.deepEqual(stage(disease, 4).effect.components, [{ type: "death", category: "direct" }]);
});



test("Nightmare Fever uses damage-triggered Will saves and locks disease damage plus fatigue recovery", () => {
  const disease = bySource.get("Nightmare Fever");
  assert.equal(disease.level, 8);
  assert.equal(disease.checks[0].statistic, "will");
  assert.equal(disease.checks[0].dc, 25);
  assert.deepEqual(disease.restrictions.conditionLocks, []);
  assert.equal(disease.restrictions.healing, "affliction-damage");
  assert.deepEqual(stage(disease, 1).restrictions.conditionLocks, [{ slug: "fatigued", minimum: null }]);
  assert.deepEqual(stage(disease, 4).restrictions.conditionLocks, [{ slug: "fatigued", minimum: null }]);
  assert.deepEqual(stage(disease, 5).restrictions.conditionLocks, []);
  assert.deepEqual(stage(disease, 3).reactions[0].trigger, { event: "damage-taken", damageTypes: ["slashing"] });
  assert.deepEqual(stage(disease, 3).reactions[0].applyOn, ["failure", "criticalFailure"]);
  assert.deepEqual(stage(disease, 3).reactions[0].effect.components, [{ type: "condition", slug: "frightened", value: 2 }]);
  assert.deepEqual(stage(disease, 4).reactions[0].effect.duration, { value: 1, unit: "rounds", expiry: null });
  assert.deepEqual(stage(disease, 4).reactions[0].effect.components, [{ type: "condition", slug: "paralyzed" }]);
  assert.deepEqual(stage(disease, 5).effect.components, [
    { type: "damage", formula: "6d6", damageType: "slashing" },
    { type: "condition", slug: "unconscious" }
  ]);
});



test("Blinding Sickness keeps only blindness permanent in stage 4", () => {
  const disease = bySource.get("Blinding Sickness");
  assert.equal(disease.name, "Blindfieber");
  assert.equal(disease.level, 7);
  assert.equal(disease.checks[0].dc, 23);
  assert.equal(disease.onset, null);
  assert.equal(disease.stages.length, 6);
  assert.equal(stage(disease, 1).effect, null);
  assert.deepEqual(stage(disease, 4).effect.components, [
    { type: "condition", slug: "enfeebled", value: 2 },
    { type: "condition", slug: "blinded" }
  ]);
  assert.deepEqual(stage(disease, 4).effectComponentPersistence, [null, "permanent"]);
  assert.deepEqual(stage(disease, 5).effect.components, [{ type: "condition", slug: "unconscious" }]);
  assert.deepEqual(stage(disease, 6).effect.components, [{ type: "death", category: "direct" }]);
});

test("Bog Rot uses 0.1.52 numeric movement modifiers and keeps amputation as a manual cure note", () => {
  const disease = bySource.get("Bog Rot");
  assert.equal(disease.name, "Sumpffäule");
  assert.equal(disease.level, 0);
  assert.equal(disease.checks[0].dc, 13);
  assert.deepEqual(disease.onset, { value: 1, unit: "days" });
  assert.deepEqual(stage(disease, 2).numericModifiers, [{
    id: "speed-penalty", label: "Sumpffäule · Bewegungsrate", selectors: ["all-speeds"], type: "status", value: -5
  }]);
  assert.deepEqual(stage(disease, 3).numericModifiers, [{
    id: "speed-penalty", label: "Sumpffäule · Bewegungsrate", selectors: ["all-speeds"], type: "status", value: -10
  }]);
  assert.ok(disease.metadata.automationNotes.some((note) => /amputat/i.test(note)));
});

test("Bubonic Plague locks fatigue and runs a 1d20-minute recurring persistent bleed in stage 3", () => {
  const disease = bySource.get("Bubonic Plague");
  assert.equal(disease.name, "Beulenpest");
  assert.equal(disease.level, 3);
  assert.equal(disease.checks[0].dc, 17);
  assert.deepEqual(disease.onset, { value: 1, unit: "days" });
  assert.deepEqual(disease.restrictions.conditionLocks, [{ slug: "fatigued", minimum: null }]);
  const periodic = stage(disease, 3).periodicEffects[0];
  assert.equal(periodic.id, "recurring-bleed");
  assert.deepEqual(periodic.interval, { formula: "1d20", unit: "minutes" });
  assert.deepEqual(periodic.effect.components, [{ type: "damage", formula: "1d6", damageType: "bleed", persistent: true }]);
});

test("Scarlet Leprosy uses virulent progression, wounded escalation, and layered healing locks", () => {
  const disease = bySource.get("Scarlet Leprosy");
  assert.equal(disease.name, "Karmesin-Lepra");
  assert.equal(disease.level, 4);
  assert.equal(disease.checks[0].statistic, "fortitude");
  assert.equal(disease.checks[0].dc, 19);
  assert.deepEqual(disease.onset, { value: 1, unit: "days" });
  assert.equal(disease.progression.virulent, true);
  assert.equal(disease.restrictions.healing, "affliction-damage");
  assert.deepEqual(stage(disease, 1).effect.components, [{ type: "damage", formula: "2d6", damageType: "bludgeoning" }]);
  const reaction = stage(disease, 2).reactions[0];
  assert.equal(reaction.trigger.event, "condition-increased");
  assert.deepEqual(reaction.trigger.conditionSlugs, ["wounded"]);
  assert.equal(reaction.checkId, null);
  assert.deepEqual(reaction.applyOn, []);
  assert.equal(reaction.conditionValueDelta, 1);
  assert.equal(reaction.effect, null);
  assert.equal(stage(disease, 3).restrictions.healing, "all");
  assert.deepEqual(stage(disease, 3).effect.components, [{ type: "damage", formula: "4d6", damageType: "bludgeoning" }]);
});

test("Tuberculosis uses 0.1.55 concentrate pre-action gates and fatigued locking", () => {
  const disease = bySource.get("Tuberculosis");
  assert.equal(disease.name, "Tuberkulose");
  assert.equal(disease.level, 1);
  assert.equal(disease.checks[0].dc, 15);
  assert.deepEqual(disease.onset, { value: 7, unit: "days" });
  assert.equal(stage(disease, 1).effect, null);
  assert.deepEqual(stage(disease, 2).preActionGates[0], {
    id: "cough-concentrate",
    label: "Husten: Konzentration",
    trigger: { actionKinds: ["spell-cast", "item-activation"], requiredTraits: ["concentrate"] },
    check: { kind: "flat", dc: 5 },
    blockOnFailure: true
  });
  assert.deepEqual(stage(disease, 3).restrictions.conditionLocks, [{ slug: "fatigued", minimum: null }]);
  assert.equal(stage(disease, 3).preActionGates[0].check.dc, 15);
  assert.deepEqual(stage(disease, 4).effect.components, [{ type: "condition", slug: "unconscious" }]);
  assert.deepEqual(stage(disease, 5).effect.components, [{ type: "death", category: "direct" }]);
});

test("three high-cost disease exceptions are published with visible GM guidance", () => {
  for (const sourceName of ["Bonechill", "Brain Worms", "Crimson Ooze"]) {
    const entry = inventory.entries.find((item) => item.sourceName === sourceName);
    assert.equal(entry.status, "manual", sourceName);
    assert.deepEqual(entry.blockers, [], sourceName);
    assert.match(entry.manualComment, /GM-Hinweis/i, sourceName);
    const disease = bySource.get(sourceName);
    assert.equal(disease.metadata.automationStatus, "manual", sourceName);
    assert.match(disease.description, /GM-Hinweis/i, sourceName);
    assert.match(disease.metadata.manualComment, /GM-Hinweis/i, sourceName);
  }
});

test("Bonechill automates staged conditions and active cold healing locks while leaving environmental severity manual", () => {
  const disease = bySource.get("Bonechill");
  assert.equal(disease.name, "Knochenfrost");
  assert.equal(disease.checks[0].dc, 20);
  assert.deepEqual(disease.onset, { value: 1, unit: "days" });
  assert.deepEqual(stage(disease, 2).restrictions.unhealableDamageTypes, ["cold"]);
  assert.deepEqual(stage(disease, 3).effect.components, [{ type: "condition", slug: "clumsy", value: 3 }]);
  assert.deepEqual(stage(disease, 4).effect.components, [{ type: "condition", slug: "paralyzed" }]);
});

test("Brain Worms automates virulent progression and damage-triggered Will saves while keeping confusion behavior manual", () => {
  const disease = bySource.get("Brain Worms");
  assert.equal(disease.name, "Hirnwürmer");
  assert.equal(disease.progression.virulent, true);
  assert.equal(disease.checks.find((check) => check.id === "mind").statistic, "will");
  assert.equal(disease.checks.find((check) => check.id === "mind").dc, 28);
  assert.deepEqual(stage(disease, 2).reactions[0].trigger, { event: "damage-taken", damageTypes: [] });
  assert.deepEqual(stage(disease, 2).reactions[0].effect.duration, { value: 1, unit: "rounds", expiry: null });
  assert.deepEqual(stage(disease, 3).reactions[0].effect.duration, { value: 1, unit: "minutes", expiry: null });
  assert.deepEqual(stage(disease, 4).effect.components, [
    { type: "condition", slug: "stupefied", value: 4 },
    { type: "condition", slug: "confused" }
  ]);
});

test("Crimson Ooze/Bluthand automates ordinary stage conditions and death while hand-specific rules remain manual", () => {
  const disease = bySource.get("Crimson Ooze");
  assert.equal(disease.name, "Bluthand");
  assert.equal(disease.progression.virulent, true);
  assert.equal(disease.checks[0].dc, 34);
  assert.deepEqual(disease.onset, { value: 1, unit: "days" });
  assert.deepEqual(stage(disease, 2).effect.components, [{ type: "condition", slug: "clumsy", value: 2 }]);
  assert.deepEqual(stage(disease, 3).effect.components, [
    { type: "condition", slug: "clumsy", value: 2 },
    { type: "condition", slug: "stupefied", value: 2 }
  ]);
  assert.deepEqual(stage(disease, 5).effect.components, [{ type: "condition", slug: "confused" }]);
  assert.deepEqual(stage(disease, 6).effect.components, [{ type: "death", category: "direct" }]);
});

test("no GM disease remains partial after the 0.1.55 concentrate gate", () => {
  const partial = inventory.entries.filter((entry) => entry.status === "partial");
  assert.deepEqual(partial, []);
});

test("runtime seed contains all fourteen GM diseases and no CLI-only _key", () => {
  const sources = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"];
  assert.equal(sources.length, 14);
  assert.ok(sources.every((source) => source._key === undefined));
  const ids = new Set(sources.map((source) => source.flags["pf2e-affliction-forge"].definitionId));
  assert.deepEqual(ids, new Set(diseases.map((entry) => entry.id)));
});
