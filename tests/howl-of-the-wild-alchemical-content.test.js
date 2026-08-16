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
const inventory = JSON.parse(fs.readFileSync(path.join(root, "inventory/howl-of-the-wild-alchemical-poisons.json"), "utf8"));
const files = inventory.entries.map((entry) => `${entry.definitionId.split(".").at(-1)}.json`).sort();
const poisons = files.map((name) => readLocalizedJson(path.join(root, "content", pack, name), "de"));
const byKey = new Map(poisons.map((entry) => [entry.id.split(".").at(-1), entry]));
const stage = (definition, number) => definition.stages.find((entry) => entry.number === number);

test("Howl of the Wild publishes all three reviewed alchemical poison afflictions", () => {
  assert.equal(inventory.entries.length, 3);
  assert.equal(poisons.length, 3);
  assert.equal(poisons.filter((p) => p.metadata.automationStatus === "full").length, 2);
  assert.equal(poisons.filter((p) => p.metadata.automationStatus === "manual").length, 1);
  assert.equal(poisons.filter((p) => p.delivery.injuryPoison).length, 1);
  for (const poison of poisons) assert.deepEqual(validateDefinition(poison, { pack }), [], poison.name);
});

test("Essence of Mandragora preserves damage and mental conditions", () => {
  const poison = byKey.get("essence-of-mandragora");
  assert.equal(poison.level, 4);
  assert.equal(poison.checks[0].dc, 21);
  assert.deepEqual(poison.maximumDuration, { value: 6, unit: "rounds" });
  assert.deepEqual(stage(poison, 1).effect.components, [
    { type: "damage", formula: "1d6", damageType: "poison" },
    { type: "condition", slug: "stupefied", value: 1 }
  ]);
  assert.equal(stage(poison, 2).effect.components.some((c) => c.type === "condition" && c.slug === "confused"), true);
  assert.equal(stage(poison, 3).effect.components[0].formula, "2d6");
});

test("Tatzlwyrm's Gasp is a three-round inhaled poison", () => {
  const poison = byKey.get("tatzlwyrms-gasp");
  assert.equal(poison.level, 2);
  assert.ok(poison.traits.includes("inhaled"));
  assert.equal(poison.checks[0].dc, 15);
  assert.deepEqual(poison.maximumDuration, { value: 3, unit: "rounds" });
  assert.equal(stage(poison, 1).effect.components[0].slug, "sickened");
  assert.equal(stage(poison, 3).effect.components[0].formula, "4d6");
});

test("Sportlebore Capsule exposes its non-generic Stage 3 cycle as a manual exception", () => {
  const poison = byKey.get("sportlebore-capsule");
  assert.equal(poison.metadata.automationStatus, "manual");
  assert.deepEqual(poison.onset, { value: 1, unit: "minutes" });
  assert.deepEqual(poison.maximumDuration, { value: 6, unit: "minutes" });
  assert.equal(stage(poison, 3).expiryAction, "stay");
  assert.deepEqual(stage(poison, 3).effect.components, [{ type: "condition", slug: "enfeebled", value: 2 }]);
  assert.doesNotMatch(JSON.stringify(stage(poison, 3).effect.components), /4d6|bludgeoning/i);
  assert.match(poison.metadata.manualComment, /SG 23|4W6|Phase 1/i);
});

test("runtime seed contains the complete 124-definition library", () => {
  assert.equal(BUNDLED_ITEM_SOURCES_BY_PACK[pack].length, 12);
  assert.equal(Object.values(BUNDLED_ITEM_SOURCES_BY_PACK).flat().length, 124);
});
