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

test("GM curse inventory and library publish all sixteen reviewed source curses", () => {
  assert.equal(inventory.entries.length, 16);
  assert.equal(curses.length, 16);
  assert.equal(inventory.entries.filter((entry) => entry.status === "full").length, 2);
  assert.equal(inventory.entries.filter((entry) => entry.status === "manual").length, 14);
  for (const curse of curses) assert.deepEqual(validateDefinition(curse, { pack: "gm-core" }), [], curse.name);
});

test("Reviling Earth preserves failure and critical-failure doomed values", () => {
  const curse = bySource.get("Reviling Earth");
  assert.ok(curse);
  assert.equal(curse.name, "Feindselige Erde");
  assert.equal(curse.level, 12);
  assert.equal(curse.checks[0].statistic, "fortitude");
  assert.equal(curse.checks[0].dc, 30);
  assert.equal(curse.initialCheck.outcomes.failure.stage, 1);
  assert.equal(curse.initialCheck.outcomes.criticalFailure.stage, 2);
  assert.deepEqual(stage(curse, 1).effect.components, [{ type: "condition", slug: "doomed", value: 1 }]);
  assert.deepEqual(stage(curse, 2).effect.components, [{ type: "condition", slug: "doomed", value: 2 }]);
});

test("Curse of Slumber uses expiry recovery and damage-triggered reactive recovery", () => {
  const curse = bySource.get("Curse of Slumber");
  assert.ok(curse);
  assert.equal(curse.metadata.automationStatus, "full");
  assert.equal(curse.checks[0].statistic, "fortitude");
  assert.equal(curse.checks[0].dc, 28);
  assert.equal(curse.initialCheck.outcomes.failure.stage, 1);
  assert.equal(curse.initialCheck.outcomes.criticalFailure.stage, 2);
  assert.deepEqual(stage(curse, 1).duration, { value: 1, unit: "rounds" });
  assert.equal(stage(curse, 1).expiryAction, "recover");
  assert.deepEqual(stage(curse, 1).effect.components, [{ type: "condition", slug: "unconscious" }]);
  assert.deepEqual(stage(curse, 2).duration, { value: -1, unit: "unlimited" });
  for (const number of [1, 2]) {
    const reaction = stage(curse, number).reactions[0];
    assert.equal(reaction.trigger.event, "damage-taken");
    assert.equal(reaction.checkId, "primary");
    assert.deepEqual(reaction.applyOn, []);
    assert.equal(reaction.controllerActions.success, "recover");
    assert.equal(reaction.controllerActions.criticalSuccess, "recover");
    assert.equal(reaction.effect, null);
  }
});

test("Sellsword's Folly automates initiative saves and confusion but keeps incapacitation adjustment explicit", () => {
  const curse = bySource.get("Sellsword's Folly");
  assert.ok(curse);
  assert.equal(curse.metadata.automationStatus, "manual");
  assert.match(curse.description, /GM-Hinweis/i);
  const reaction = stage(curse, 1).reactions[0];
  assert.equal(reaction.trigger.event, "initiative-rolled");
  assert.equal(reaction.checkId, "primary");
  assert.deepEqual(reaction.applyOn, ["failure", "criticalFailure"]);
  assert.deepEqual(reaction.effect.duration, { value: 1, unit: "rounds", expiry: null });
  assert.deepEqual(reaction.effect.components, [{ type: "condition", slug: "confused" }]);
  assert.match(curse.metadata.manualComment, /Kampfunfähigkeits/i);
});

test("Ravenous and Unending Thirst automate their repeat-save cadence while survival rules remain manual", () => {
  const ravenous = bySource.get("Curse of the Ravenous");
  const thirst = bySource.get("Unending Thirst");
  assert.deepEqual(stage(ravenous, 1).duration, { value: 7, unit: "days" });
  assert.ok(ravenous.defaultStageCheck);
  assert.deepEqual(stage(thirst, 1).duration, { value: 1, unit: "days" });
  assert.ok(thirst.defaultStageCheck);
  assert.equal(ravenous.metadata.automationStatus, "manual");
  assert.equal(thirst.metadata.automationStatus, "manual");
});

test("Grave Curse uses an external save DC and declares variable level as a manual exception", () => {
  const curse = bySource.get("Grave Curse");
  assert.ok(curse);
  assert.equal(curse.level, 0);
  assert.equal(curse.metadata.sourceLevel, "varies");
  assert.equal(curse.checks[0].dcMode, "source");
  assert.equal(curse.checks[0].dc, null);
  assert.match(curse.description, /technischer Platzhalter/i);
  assert.match(curse.description, /GM-Hinweis/i);
});

test("all fourteen manual curse exceptions surface structured and visible GM guidance", () => {
  const manualInventory = inventory.entries.filter((entry) => entry.status === "manual");
  assert.equal(manualInventory.length, 14);
  for (const entry of manualInventory) {
    assert.deepEqual(entry.blockers, [], entry.sourceName);
    assert.match(entry.manualComment, /GM-Hinweis/i, entry.sourceName);
    const curse = bySource.get(entry.sourceName);
    assert.ok(curse, entry.sourceName);
    assert.equal(curse.metadata.automationStatus, "manual", entry.sourceName);
    assert.match(curse.description, /GM-Hinweis/i, entry.sourceName);
    assert.match(curse.metadata.manualComment, /GM-Hinweis/i, entry.sourceName);
  }
});

test("runtime seed contains all sixteen curses, fourteen diseases, and nineteen GM poison variants", () => {
  const sources = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"];
  assert.ok(sources.every((source) => source._key === undefined));
  const curseSources = sources.filter((source) => source.flags?.["pf2e-affliction-forge"]?.definition?.afflictionType === "curse");
  const diseaseSources = sources.filter((source) => source.flags?.["pf2e-affliction-forge"]?.definition?.afflictionType === "disease");
  const poisonSources = sources.filter((source) => source.flags?.["pf2e-affliction-forge"]?.definition?.afflictionType === "poison");
  assert.equal(curseSources.length, 16);
  assert.equal(diseaseSources.length, 14);
  assert.equal(poisonSources.length, 19);
  assert.equal(sources.length, 49);
});
