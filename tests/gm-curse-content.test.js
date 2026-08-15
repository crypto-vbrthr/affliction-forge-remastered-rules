import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateDefinition } from "../tools/lib/content-contract.mjs";
import { BUNDLED_ITEM_SOURCES_BY_PACK } from "../scripts/bundled-content.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const inventory = JSON.parse(fs.readFileSync(path.join(root, "inventory/gm-core-curses.json"), "utf8"));
const files = fs.readdirSync(path.join(root, "content/gm-core")).filter((name) => name.endsWith(".json")).sort();
const allGmDefinitions = files.map((name) => JSON.parse(fs.readFileSync(path.join(root, "content/gm-core", name), "utf8")));
const curses = allGmDefinitions.filter((entry) => entry.afflictionType === "curse");
const bySource = new Map(curses.map((entry) => [entry.metadata.sourceName, entry]));

function stage(definition, number) {
  return definition.stages.find((entry) => entry.number === number);
}

test("GM curse inventory tracks all sixteen reviewed source curses", () => {
  assert.equal(inventory.entries.length, 16);
  assert.equal(inventory.entries.filter((entry) => entry.status === "full").length, 1);
  assert.equal(inventory.entries.filter((entry) => entry.status !== "full").length, 15);
});

test("0.1.9 publishes only the curse whose complete post-trigger mechanics fit the current contract", () => {
  assert.equal(curses.length, 1);
  assert.deepEqual(validateDefinition(curses[0], { pack: "gm-core" }), []);
  assert.equal(curses[0].metadata.sourceName, "Reviling Earth");
});

test("Reviling Earth maps failure and critical failure to stable unlimited doomed stages", () => {
  const curse = bySource.get("Reviling Earth");
  assert.ok(curse);
  assert.equal(curse.name, "Feindselige Erde");
  assert.equal(curse.level, 12);
  assert.equal(curse.checks[0].statistic, "fortitude");
  assert.equal(curse.checks[0].dc, 30);
  assert.equal(curse.defaultStageCheck, null);
  assert.equal(curse.initialCheck.outcomes.failure.stage, 1);
  assert.equal(curse.initialCheck.outcomes.criticalFailure.stage, 2);
  assert.deepEqual(stage(curse, 1).duration, { value: -1, unit: "unlimited" });
  assert.deepEqual(stage(curse, 1).effect.components, [{ type: "condition", slug: "doomed", value: 1 }]);
  assert.deepEqual(stage(curse, 2).effect.components, [{ type: "condition", slug: "doomed", value: 2 }]);
});

test("curse inventory identifies reusable lifecycle blockers rather than inventing bespoke mechanics", () => {
  const byName = new Map(inventory.entries.map((entry) => [entry.sourceName, entry]));
  assert.ok(byName.get("Curse of Nightmares").blockers.includes("rest-benefit-block"));
  assert.ok(byName.get("Cowards's Roots").blockers.includes("turn-start-condition-choice"));
  assert.ok(byName.get("Sellsword's Folly").blockers.includes("combat-initiative-trigger"));
  assert.ok(byName.get("Theft of Thought").blockers.includes("dynamic-skill-proficiency-downgrade"));
  assert.ok(byName.get("Thief's Retribution").blockers.includes("body-part-loss"));
});

test("runtime seed contains the reviewed full curse in the GM pack", () => {
  const sources = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"];
  const curseSources = sources.filter((source) => source.flags?.["pf2e-affliction-forge"]?.definition?.afflictionType === "curse");
  assert.equal(curseSources.length, 1);
  assert.equal(curseSources[0].flags["pf2e-affliction-forge"].definitionId, "affliction-forge-remastered-rules.gm-core.reviling-earth");
  assert.equal(curseSources[0]._key, undefined);
});
