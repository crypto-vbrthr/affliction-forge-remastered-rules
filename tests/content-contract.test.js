import assert from "node:assert/strict";
import test from "node:test";
import {
  MODULE_ID,
  buildItemSource,
  deterministicDocumentId,
  validateDefinition
} from "../tools/lib/content-contract.mjs";

function validDefinition(overrides = {}) {
  return {
    schemaVersion: 2,
    id: `${MODULE_ID}.gm-core.test-affliction`,
    name: "Testleiden",
    description: "",
    img: "icons/svg/biohazard.svg",
    afflictionType: "disease",
    level: 1,
    rarity: "common",
    traits: ["disease"],
    themes: [],
    saveDefaults: { execution: "player", visibility: "public" },
    identification: { initialState: "identified" },
    delivery: { injuryPoison: false },
    checks: [{ id: "primary", label: "", kind: "save", statistic: "fortitude", dcMode: "fixed", dc: 15, policy: null }],
    initialCheck: {
      checkIds: ["primary"],
      combine: "single",
      outcomes: {
        criticalSuccess: { action: "reject" },
        success: { action: "reject" },
        failure: { action: "set-stage", stage: 1 },
        criticalFailure: { action: "set-stage", stage: 1 }
      }
    },
    onset: null,
    maximumDuration: { value: 1, unit: "days" },
    defaultStageCheck: {
      checkIds: ["primary"],
      combine: "single",
      outcomes: {
        criticalSuccess: { action: "stage-delta", delta: -2 },
        success: { action: "stage-delta", delta: -1 },
        failure: { action: "stage-delta", delta: 1 },
        criticalFailure: { action: "stage-delta", delta: 2 }
      }
    },
    progression: { belowStageOne: "recover", aboveMaximumStage: "clamp", virulent: false },
    stages: [{ id: "stage-1", number: 1, name: "", description: "", duration: { value: 1, unit: "days" }, check: null, effect: null }],
    metadata: {
      originModule: MODULE_ID,
      originFeature: "remastered-rules-library",
      sourceWorkId: "gm-core",
      contentLanguage: "de",
      translation: "independent-from-english-orc-source",
      license: "ORC",
      automationStatus: "full",
      licenseReview: { mechanicsOnly: true, reservedMaterial: "passed", nameReview: "passed" }
    },
    ...overrides
  };
}

test("valid publishable definition passes content guard", () => {
  assert.deepEqual(validateDefinition(validDefinition(), { pack: "gm-core" }), []);
});

test("source-DC definitions are accepted with null DC", () => {
  const definition = validDefinition();
  definition.checks[0].dcMode = "source";
  definition.checks[0].dc = null;
  assert.deepEqual(validateDefinition(definition, { pack: "gm-core" }), []);
});

test("virulent flag is accepted by the contract", () => {
  const definition = validDefinition();
  definition.progression.virulent = true;
  assert.deepEqual(validateDefinition(definition, { pack: "gm-core" }), []);
});

test("known Reserved Material term is blocked in user-facing content", () => {
  const definition = validDefinition({ name: "Achaekek Test" });
  const issues = validateDefinition(definition, { pack: "gm-core" });
  assert.ok(issues.some((issue) => /achaekek/i.test(issue)));
});

test("pack/source mismatch is rejected", () => {
  const definition = validDefinition();
  definition.metadata.sourceWorkId = "player-core";
  const issues = validateDefinition(definition, { pack: "gm-core" });
  assert.ok(issues.some((issue) => /must match pack/i.test(issue)));
});

test("stable document ID is deterministic and Foundry-sized", () => {
  const first = deterministicDocumentId(`${MODULE_ID}.gm-core.test-affliction`);
  const second = deterministicDocumentId(`${MODULE_ID}.gm-core.test-affliction`);
  assert.equal(first, second);
  assert.match(first, /^[A-Za-z0-9]{16}$/);
});

test("prepared Item source is an Affliction Forge template Effect", () => {
  const definition = validDefinition();
  const item = buildItemSource(definition);
  assert.equal(item.type, "effect");
  assert.equal(item.system.rules.length, 0);
  assert.equal(item.flags["pf2e-affliction-forge"].managed, true);
  assert.equal(item.flags["pf2e-affliction-forge"].documentKind, "affliction-template");
  assert.equal(item.flags["pf2e-affliction-forge"].definitionId, definition.id);
  assert.equal(item.flags["pf2e-affliction-forge"].originModule, MODULE_ID);
});
