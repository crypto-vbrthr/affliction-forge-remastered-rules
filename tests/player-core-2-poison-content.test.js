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
const inventory = JSON.parse(fs.readFileSync(path.join(root, "inventory/player-core-2-poisons.json"), "utf8"));
const files = fs.readdirSync(path.join(root, "content/player-core-2")).filter((name) => name.endsWith(".json")).sort();
const poisons = files.map((name) => readLocalizedJson(path.join(root, "content/player-core-2", name), "de"));
const byKey = new Map(poisons.map((entry) => [entry.id.split(".").at(-1), entry]));

function stage(definition, number) { return definition.stages.find((entry) => entry.number === number); }

test("Player II poison inventory and library publish all twenty-nine reviewed poisons", () => {
  assert.equal(inventory.entries.length, 29);
  assert.equal(poisons.length, 29);
  assert.equal(poisons.filter((p) => p.delivery.injuryPoison).length, 12);
  assert.equal(poisons.filter((p) => p.traits.includes("ingested")).length, 9);
  assert.equal(poisons.filter((p) => p.traits.includes("contact")).length, 6);
  assert.equal(poisons.filter((p) => p.traits.includes("inhaled")).length, 2);
  for (const poison of poisons) assert.deepEqual(validateDefinition(poison, { pack: "player-core-2" }), [], poison.name);
});

test("all poisons default to repeated exposure except Lethargy Poison", () => {
  const ignored = poisons.filter((p) => p.multipleExposure === "ignore");
  assert.equal(ignored.length, 1);
  assert.equal(ignored[0].id, "affliction-forge-remastered-rules.player-core-2.lethargy-poison");
  assert.equal(ignored[0].delivery.injuryPoison, true);
  assert.ok(ignored[0].traits.includes("incapacitation"));
  assert.ok(ignored[0].traits.includes("sleep"));
});

test("virulent poisons are King's Sleep, Black Lotus Extract, and Tears of Death", () => {
  const ids = poisons.filter((p) => p.progression.virulent).map((p) => p.id).sort();
  assert.deepEqual(ids, [
    "affliction-forge-remastered-rules.player-core-2.black-lotus-extract",
    "affliction-forge-remastered-rules.player-core-2.kings-sleep",
    "affliction-forge-remastered-rules.player-core-2.tears-of-death"
  ]);
});

test("Arsenic locks sickened recovery and Root Orchid applies stage speed penalties", () => {
  const arsenic = byKey.get("arsenic");
  assert.deepEqual(arsenic.restrictions.conditionLocks, [{ slug: "sickened", minimum: null }]);
  const root = byKey.get("root-orchid-poison");
  assert.deepEqual(root.stages.map((s) => s.numericModifiers?.[0]?.value), [-10, -20, -30]);
  assert.deepEqual(stage(root, 3).effect.components.at(-1), { type: "condition", slug: "off-guard" });
});

test("Gray Shadow preserves its 24-hour enfeebled condition for GM-timed cleanup", () => {
  const poison = byKey.get("gray-shadow");
  assert.equal(poison.metadata.automationStatus, "manual");
  assert.match(poison.description, /24 Stunden/i);
  assert.equal(stage(poison, 2).effectComponentPersistence.at(-1), "permanent");
  assert.equal(stage(poison, 3).effectComponentPersistence.at(-1), "permanent");
});

test("King's Sleep locks drained removal and keeps cumulative saves as visible GM guidance", () => {
  const poison = byKey.get("kings-sleep");
  assert.equal(poison.progression.virulent, true);
  assert.deepEqual(poison.restrictions.conditionLocks, [{ slug: "drained", minimum: null }]);
  assert.equal(poison.metadata.automationStatus, "manual");
  assert.match(poison.metadata.manualComment, /kumulativ/i);
});

test("Lethargy Poison uses the 0.1.61 formula duration for Stage 4", () => {
  const poison = byKey.get("lethargy-poison");
  assert.deepEqual(poison.maximumDuration, { value: 4, unit: "hours" });
  assert.deepEqual(stage(poison, 4).duration, { formula: "1d4", unit: "hours" });
  assert.equal(poison.metadata.automationStatus, "full");
  assert.equal(poison.metadata.manualComment, undefined);
  assert.deepEqual(stage(poison, 4).restrictions.conditionLocks, [{ slug: "unconscious", minimum: null }]);
});

test("runtime seed contains all 124 definitions including Treasure Vault and Howl of the Wild", () => {
  assert.equal(BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"].length, 50);
  assert.equal(BUNDLED_ITEM_SOURCES_BY_PACK["player-core-2"].length, 29);
  assert.equal(BUNDLED_ITEM_SOURCES_BY_PACK["treasure-vault-remastered"].length, 33);
  assert.equal(BUNDLED_ITEM_SOURCES_BY_PACK["howl-of-the-wild"].length, 12);
  assert.equal(Object.values(BUNDLED_ITEM_SOURCES_BY_PACK).flat().length, 124);
});
