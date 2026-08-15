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
  assert.equal(inventory.entries.filter((entry) => entry.status === "full").length, 7);
  assert.equal(inventory.entries.filter((entry) => entry.status === "partial").length, 7);
});

test("GM content filenames match the stable language-neutral definition keys", () => {
  for (const filename of files) {
    const disease = JSON.parse(fs.readFileSync(path.join(root, "content/gm-core", filename), "utf8"));
    const key = disease.id.split(".").at(-1);
    assert.equal(filename, `${key}.json`);
  }
});

test("all seven publishable GM diseases pass the 0.1.51 content contract", () => {
  assert.equal(diseases.length, 7);
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

test("Bonechill is still partial only because cold-environment severity shifting is unsupported", () => {
  const entry = inventory.entries.find((item) => item.sourceName === "Bonechill");
  assert.equal(entry.status, "partial");
  assert.deepEqual(entry.blockers, ["environment-severity-shift"]);
  assert.ok(entry.notes.some((note) => /cold-damage healing lock/i.test(note)));
});
test("Brain Worms remains partial because confusion attack rewriting and confused-ending exception are still unsupported", () => {
  const entry = inventory.entries.find((item) => item.sourceName === "Brain Worms");
  assert.equal(entry.status, "partial");
  assert.deepEqual(entry.blockers, ["confusion-attack-rewrite", "confused-ending-exception"]);
  assert.ok(entry.notes.some((note) => /damage-triggered secondary Will saves/i.test(note)));
});

test("runtime seed contains exactly the seven publishable GM diseases and no CLI-only _key", () => {
  const sources = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"];
  assert.equal(sources.length, 7);
  assert.ok(sources.every((source) => source._key === undefined));
  const ids = new Set(sources.map((source) => source.flags["pf2e-affliction-forge"].definitionId));
  assert.deepEqual(ids, new Set(diseases.map((entry) => entry.id)));
});
