import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateDefinition } from "../tools/lib/content-contract.mjs";
import { BUNDLED_ITEM_SOURCES_BY_PACK } from "../scripts/bundled-content.js";
import { readLocalizedJson } from "./helpers/localization.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const pack = "treasure-vault-remastered";
const inventory = JSON.parse(fs.readFileSync(path.join(root, "inventory/treasure-vault-remastered-poisons.json"), "utf8"));
const files = fs.readdirSync(path.join(root, "content", pack)).filter((name) => name.endsWith(".json")).sort();
const poisons = files.map((name) => readLocalizedJson(path.join(root, "content", pack, name), "de"));
const byKey = new Map(poisons.map((entry) => [entry.id.split(".").at(-1), entry]));
const stage = (definition, number) => definition.stages.find((entry) => entry.number === number);

function deliveryOf(definition) {
  return ["injury", "contact", "ingested", "inhaled"].find((trait) => definition.traits.includes(trait));
}

test("Treasure Vault publishes all thirty-three reviewed poison afflictions", () => {
  assert.equal(inventory.entries.length, 33);
  assert.equal(poisons.length, 33);
  assert.equal(poisons.filter((p) => p.metadata.automationStatus === "full").length, 7);
  assert.equal(poisons.filter((p) => p.metadata.automationStatus === "manual").length, 26);
  assert.equal(poisons.filter((p) => deliveryOf(p) === "injury").length, 20);
  assert.equal(poisons.filter((p) => deliveryOf(p) === "contact").length, 5);
  assert.equal(poisons.filter((p) => deliveryOf(p) === "ingested").length, 5);
  assert.equal(poisons.filter((p) => deliveryOf(p) === "inhaled").length, 3);
  assert.equal(poisons.filter((p) => p.delivery.injuryPoison).length, 20);
  for (const poison of poisons) assert.deepEqual(validateDefinition(poison, { pack }), [], poison.name);
});

test("the four virulent poisons and Stupor repeated-exposure exception are explicit", () => {
  assert.deepEqual(poisons.filter((p) => p.progression.virulent).map((p) => p.id.split(".").at(-1)).sort(), [
    "antipode-oil", "astringent-venom", "false-hope", "unending-itch"
  ]);
  const stupor = byKey.get("stupor-poison");
  assert.equal(stupor.multipleExposure, "ignore");
  assert.ok(stupor.traits.includes("incapacitation"));
  assert.ok(stupor.traits.includes("sleep"));
  assert.deepEqual(stage(stupor, 4).duration, { formula: "1d6", unit: "hours" });
});

test("0.1.61 formula stage timings preserve Gnawbone and Sightless source durations", () => {
  assert.deepEqual(stage(byKey.get("gnawbone-toxin"), 3).duration, { formula: "1d4", unit: "minutes" });
  assert.deepEqual(stage(byKey.get("sightless-tincture"), 3).duration, { formula: "2d6", unit: "hours" });
});

test("source entries with omitted stage intervals do not invent progression saves", () => {
  const blisterwort = byKey.get("blisterwort");
  assert.ok(blisterwort.stages.every((s) => s.duration.unit === "unlimited"));
  const vapor = byKey.get("breathtaking-vapor");
  assert.ok(vapor.stages.every((s) => s.duration.unit === "unlimited"));
  assert.deepEqual(stage(byKey.get("false-hope"), 3).duration, { value: -1, unit: "unlimited" });
  assert.deepEqual(stage(byKey.get("smother-shroud"), 3).duration, { value: -1, unit: "unlimited" });
});

test("False Hope keeps secret saves on the no-effect stages and public damaging-stage saves", () => {
  const poison = byKey.get("false-hope");
  assert.equal(poison.checks.find((c) => c.id === "primary").policy.visibility, "gmOnly");
  assert.equal(poison.checks.find((c) => c.id === "public").policy.visibility, "public");
  assert.deepEqual(stage(poison, 1).check.checkIds, ["primary"]);
  assert.deepEqual(poison.defaultStageCheck.checkIds, ["public"]);
  assert.deepEqual(stage(poison, 3).check.checkIds, ["primary"]);
});

test("Gorgon's Breath leaves only final petrification as a permanent residual", () => {
  const poison = byKey.get("gorgons-breath");
  assert.deepEqual(stage(poison, 4).duration, { value: -1, unit: "unlimited" });
  assert.deepEqual(stage(poison, 4).effectComponentPersistence, ["permanent"]);
  assert.equal(stage(poison, 4).effect.components[0].slug, "petrified");
});

test("Mustard Powder and Taster's Folly keep Sickened until the whole poison ends", () => {
  for (const slug of ["mustard-powder", "tasters-folly"]) {
    const poison = byKey.get(slug);
    assert.deepEqual(poison.restrictions.conditionLocks, [{ slug: "sickened", minimum: null }]);
    for (const s of poison.stages) {
      const components = s.effect?.components ?? [];
      const index = components.findIndex((c) => c.type === "condition" && c.slug === "sickened");
      if (index >= 0) assert.equal(s.effectComponentPersistence[index], "affliction");
    }
  }
});

test("Nightmare Salt uses formula periodic clocks where the engine can model them and direct death at Stage 4", () => {
  const poison = byKey.get("nightmare-salt");
  assert.deepEqual(stage(poison, 1).periodicEffects[0].interval, { formula: "1d4", unit: "hours" });
  assert.deepEqual(stage(poison, 2).periodicEffects[0].interval, { formula: "1d4", unit: "hours" });
  assert.equal(stage(poison, 3).periodicEffects.length, 0);
  assert.deepEqual(stage(poison, 4).effect.components, [{ type: "death", category: "direct" }]);
  assert.equal(poison.metadata.automationStatus, "manual");
});

test("reserved proper names do not leak into the published Treasure Vault definition", () => {
  const poison = byKey.get("assassins-kiss");
  assert.equal(poison.name, "Kuss des Assassinen");
  assert.doesNotMatch(JSON.stringify(poison), /achaekek/i);
});

test("runtime seed contains the complete 124-definition library", () => {
  assert.equal(BUNDLED_ITEM_SOURCES_BY_PACK[pack].length, 33);
  assert.equal(BUNDLED_ITEM_SOURCES_BY_PACK["howl-of-the-wild"].length, 12);
  assert.equal(Object.values(BUNDLED_ITEM_SOURCES_BY_PACK).flat().length, 124);
});
