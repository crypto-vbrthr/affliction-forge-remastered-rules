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
const pack = "howl-of-the-wild";
const inventory = JSON.parse(fs.readFileSync(path.join(root, "inventory/howl-of-the-wild-creature-afflictions.json"), "utf8"));
const definitions = inventory.entries.map((entry) => readLocalizedJson(
  path.join(root, "content", pack, `${entry.definitionId.split(".").at(-1)}.json`),
  "de"
));
const byKey = new Map(definitions.map((entry) => [entry.id.split(".").at(-1), entry]));
const stage = (definition, number) => definition.stages.find((entry) => entry.number === number);

test("Howl of the Wild publishes all nine reviewed staged creature afflictions", () => {
  assert.equal(inventory.entries.length, 9);
  assert.equal(inventory.reviewedExclusions.length, 7);
  assert.equal(definitions.length, 9);
  assert.equal(definitions.filter((p) => p.metadata.automationStatus === "full").length, 8);
  assert.equal(definitions.filter((p) => p.metadata.automationStatus === "manual").length, 1);
  assert.equal(definitions.filter((p) => p.delivery.injuryPoison).length, 0);
  for (const poison of definitions) assert.deepEqual(validateDefinition(poison, { pack }), [], poison.name);
});

test("creature-affliction levels and DCs match their source creatures/stat blocks", () => {
  const expected = new Map([
    ["royal-basilisk-venom", [13, 36]],
    ["stonefish-venom", [0, 16]],
    ["stonefish-swarm-venom", [2, 18]],
    ["coppermouth-venom", [7, 25]],
    ["suns-touch", [14, 34]],
    ["sky-fisher-venom", [11, 25]],
    ["spiny-venom", [8, 26]],
    ["manticore-venom", [12, 32]],
    ["crying-cicada-poison", [3, 19]]
  ]);
  for (const [slug, [level, dc]] of expected) {
    const poison = byKey.get(slug);
    assert.equal(poison.level, level, slug);
    assert.equal(poison.checks[0].dc, dc, slug);
    assert.equal(poison.checks[0].statistic, "fortitude", slug);
  }
});

test("Stonefish Venom preserves its long mixed stage intervals", () => {
  const poison = byKey.get("stonefish-venom");
  assert.deepEqual(poison.maximumDuration, { value: 3, unit: "hours" });
  assert.deepEqual(stage(poison, 1).duration, { value: 1, unit: "rounds" });
  assert.deepEqual(stage(poison, 2).duration, { value: 10, unit: "minutes" });
  assert.deepEqual(stage(poison, 3).duration, { value: 1, unit: "hours" });
  assert.equal(stage(poison, 3).effect.components[0].formula, "3d6");
});

test("Coppermouth Venom combines poison/electricity damage and preserves its omitted Stage 3 interval", () => {
  const poison = byKey.get("coppermouth-venom");
  assert.deepEqual(stage(poison, 2).effect.components.slice(0, 2), [
    { type: "damage", formula: "2d6", damageType: "poison" },
    { type: "damage", formula: "1d6", damageType: "electricity" }
  ]);
  assert.deepEqual(stage(poison, 3).duration, { value: -1, unit: "unlimited" });
});

test("Spiny Venom preserves source-omitted stage intervals and incapacitation", () => {
  const poison = byKey.get("spiny-venom");
  assert.ok(poison.traits.includes("incapacitation"));
  assert.deepEqual(poison.maximumDuration, { value: 6, unit: "rounds" });
  assert.ok(poison.stages.every((entry) => entry.duration.value === -1 && entry.duration.unit === "unlimited"));
  assert.equal(stage(poison, 3).effect.components.at(-1).slug, "paralyzed");
});

test("Sky Fisher Venom automates full silence from Stage 2 and leaves whisper-only Stage 1 explicit", () => {
  const poison = byKey.get("sky-fisher-venom");
  assert.equal(poison.metadata.automationStatus, "manual");
  assert.deepEqual(stage(poison, 1).restrictions.blockedCapabilities, []);
  assert.deepEqual(stage(poison, 2).restrictions.blockedCapabilities, ["speak"]);
  assert.equal(stage(poison, 3).effect.components.at(-1).slug, "paralyzed");
  assert.match(poison.metadata.manualComment, /Flüster|Phase 1/i);
});

test("Crying Cicada Poison retains inhaled delivery metadata", () => {
  const poison = byKey.get("crying-cicada-poison");
  assert.ok(poison.traits.includes("inhaled"));
  assert.equal(poison.delivery.injuryPoison, false);
  assert.equal(stage(poison, 3).effect.components.at(-1).slug, "stupefied");
});

test("runtime seed contains twelve Howl definitions and 124 definitions overall", () => {
  assert.equal(BUNDLED_ITEM_SOURCES_BY_PACK[pack].length, 12);
  assert.equal(Object.values(BUNDLED_ITEM_SOURCES_BY_PACK).flat().length, 124);
});
