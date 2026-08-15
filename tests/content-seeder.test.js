import assert from "node:assert/strict";
import test from "node:test";
import { BUNDLED_ITEM_SOURCES_BY_PACK } from "../scripts/bundled-content.js";
import { seedBundledContent } from "../scripts/content-seeder.js";

function fakeIndex(ids = []) {
  const map = new Map(ids.map((id) => [id, { _id: id }]));
  return map;
}

function installFoundryMock({ existing = false, existingIds = null, isGM = true } = {}) {
  const previous = {
    game: globalThis.game,
    CONFIG: globalThis.CONFIG,
    Hooks: globalThis.Hooks,
    Item: globalThis.Item
  };
  const expectedIds = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"].map((entry) => entry._id);
  const expectedId = expectedIds[0];
  const createCalls = [];
  const configureCalls = [];
  const hookCalls = [];
  const packs = new Map();

  for (const name of ["player-core", "gm-core", "player-core-2", "treasure-vault-remastered"]) {
    packs.set(`affliction-forge-remastered-rules.${name}`, {
      collection: `affliction-forge-remastered-rules.${name}`,
      locked: true,
      async getIndex() {
        const ids = name !== "gm-core" ? [] : (Array.isArray(existingIds) ? existingIds : (existing ? expectedIds : []));
        return fakeIndex(ids);
      },
      async configure(value) { configureCalls.push({ name, value }); this.locked = Boolean(value.locked); }
    });
  }

  globalThis.game = { user: { isGM }, packs: { get: (id) => packs.get(id) } };
  globalThis.CONFIG = {
    Item: {
      documentClass: {
        async createDocuments(data, operation) {
          createCalls.push({ data: structuredClone(data), operation: structuredClone(operation) });
          return data.map((entry) => ({ ...entry }));
        }
      }
    }
  };
  globalThis.Hooks = { callAll: (...args) => hookCalls.push(args) };
  globalThis.Item = undefined;

  return {
    expectedId,
    expectedIds,
    createCalls,
    configureCalls,
    hookCalls,
    restore() {
      globalThis.game = previous.game;
      globalThis.CONFIG = previous.CONFIG;
      globalThis.Hooks = previous.Hooks;
      globalThis.Item = previous.Item;
    }
  };
}

test("GM startup seeds a missing bundled template into its compendium and relocks it", async () => {
  const mock = installFoundryMock();
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 15);
    assert.equal(mock.createCalls.length, 1);
    assert.equal(mock.createCalls[0].data.length, 15);
    assert.deepEqual(new Set(mock.createCalls[0].data.map((entry) => entry._id)), new Set(mock.expectedIds));
    assert.equal(mock.createCalls[0].operation.pack, "affliction-forge-remastered-rules.gm-core");
    assert.equal(mock.createCalls[0].operation.keepId, true);
    assert.deepEqual(mock.configureCalls.filter((entry) => entry.name === "gm-core").map((entry) => entry.value.locked), [false, true]);
    assert.equal(mock.hookCalls.at(-1)[0], "pf2eAfflictionForgeLibrariesChanged");
  } finally {
    mock.restore();
  }
});



test("0.1.1 upgrade keeps the existing Sewer Haze document and seeds the fourteen later GM entries", async () => {
  const sewerSource = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"].find((entry) =>
    entry.flags?.["pf2e-affliction-forge"]?.definitionId === "affliction-forge-remastered-rules.gm-core.sewer-haze"
  );
  assert.ok(sewerSource);
  const mock = installFoundryMock({ existingIds: [sewerSource._id] });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 14);
    assert.equal(mock.createCalls.length, 1);
    assert.equal(mock.createCalls[0].data.length, 14);
    assert.ok(mock.createCalls[0].data.every((entry) => entry._id !== sewerSource._id));
    assert.deepEqual(mock.configureCalls.filter((entry) => entry.name === "gm-core").map((entry) => entry.value.locked), [false, true]);
  } finally {
    mock.restore();
  }
});

test("0.1.2 upgrade keeps the five existing GM diseases and seeds the ten later GM entries", async () => {
  const current = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"];
  const newDefinitions = new Set([
    "affliction-forge-remastered-rules.gm-core.nightmare-fever",
    "affliction-forge-remastered-rules.gm-core.blinding-sickness",
    "affliction-forge-remastered-rules.gm-core.bog-rot",
    "affliction-forge-remastered-rules.gm-core.bubonic-plague",
    "affliction-forge-remastered-rules.gm-core.scarlet-leprosy",
    "affliction-forge-remastered-rules.gm-core.tuberculosis",
    "affliction-forge-remastered-rules.gm-core.bonechill",
    "affliction-forge-remastered-rules.gm-core.brain-worms",
    "affliction-forge-remastered-rules.gm-core.crimson-ooze",
    "affliction-forge-remastered-rules.gm-core.reviling-earth"
  ]);
  const newSources = current.filter((entry) => newDefinitions.has(entry.flags?.["pf2e-affliction-forge"]?.definitionId));
  assert.equal(newSources.length, 10);
  const existingIds = current.filter((entry) => !newDefinitions.has(entry.flags?.["pf2e-affliction-forge"]?.definitionId)).map((entry) => entry._id);
  const mock = installFoundryMock({ existingIds });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 10);
    assert.equal(mock.createCalls.length, 1);
    assert.deepEqual(new Set(mock.createCalls[0].data.map((entry) => entry._id)), new Set(newSources.map((entry) => entry._id)));
    assert.deepEqual(mock.configureCalls.filter((entry) => entry.name === "gm-core").map((entry) => entry.value.locked), [false, true]);
  } finally {
    mock.restore();
  }
});

test("0.1.4 upgrade seeds the eight later diseases plus Reviling Earth", async () => {
  const current = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"];
  const newDefinitions = new Set([
    "affliction-forge-remastered-rules.gm-core.blinding-sickness",
    "affliction-forge-remastered-rules.gm-core.bog-rot",
    "affliction-forge-remastered-rules.gm-core.bubonic-plague",
    "affliction-forge-remastered-rules.gm-core.scarlet-leprosy",
    "affliction-forge-remastered-rules.gm-core.tuberculosis",
    "affliction-forge-remastered-rules.gm-core.bonechill",
    "affliction-forge-remastered-rules.gm-core.brain-worms",
    "affliction-forge-remastered-rules.gm-core.crimson-ooze",
    "affliction-forge-remastered-rules.gm-core.reviling-earth"
  ]);
  const newSources = current.filter((entry) => newDefinitions.has(entry.flags?.["pf2e-affliction-forge"]?.definitionId));
  assert.equal(newSources.length, 9);
  const existingIds = current.filter((entry) => !newDefinitions.has(entry.flags?.["pf2e-affliction-forge"]?.definitionId)).map((entry) => entry._id);
  const mock = installFoundryMock({ existingIds });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 9);
    assert.deepEqual(new Set(mock.createCalls[0].data.map((entry) => entry._id)), new Set(newSources.map((entry) => entry._id)));
  } finally {
    mock.restore();
  }
});

test("0.1.5 upgrade seeds the seven later diseases plus Reviling Earth", async () => {
  const current = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"];
  const newDefinitions = new Set([
    "affliction-forge-remastered-rules.gm-core.bog-rot",
    "affliction-forge-remastered-rules.gm-core.bubonic-plague",
    "affliction-forge-remastered-rules.gm-core.scarlet-leprosy",
    "affliction-forge-remastered-rules.gm-core.tuberculosis",
    "affliction-forge-remastered-rules.gm-core.bonechill",
    "affliction-forge-remastered-rules.gm-core.brain-worms",
    "affliction-forge-remastered-rules.gm-core.crimson-ooze",
    "affliction-forge-remastered-rules.gm-core.reviling-earth"
  ]);
  const newSources = current.filter((entry) => newDefinitions.has(entry.flags?.["pf2e-affliction-forge"]?.definitionId));
  assert.equal(newSources.length, 8);
  const existingIds = current.filter((entry) => !newDefinitions.has(entry.flags?.["pf2e-affliction-forge"]?.definitionId)).map((entry) => entry._id);
  const mock = installFoundryMock({ existingIds });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 8);
    assert.equal(mock.createCalls.length, 1);
    assert.deepEqual(new Set(mock.createCalls[0].data.map((entry) => entry._id)), new Set(newSources.map((entry) => entry._id)));
  } finally {
    mock.restore();
  }
});

test("0.1.6 upgrade seeds Scarlet Leprosy, the four 0.1.8 disease entries, and Reviling Earth", async () => {
  const current = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"];
  const newDefinitions = new Set([
    "affliction-forge-remastered-rules.gm-core.scarlet-leprosy",
    "affliction-forge-remastered-rules.gm-core.tuberculosis",
    "affliction-forge-remastered-rules.gm-core.bonechill",
    "affliction-forge-remastered-rules.gm-core.brain-worms",
    "affliction-forge-remastered-rules.gm-core.crimson-ooze",
    "affliction-forge-remastered-rules.gm-core.reviling-earth"
  ]);
  const newSources = current.filter((entry) => newDefinitions.has(entry.flags?.["pf2e-affliction-forge"]?.definitionId));
  assert.equal(newSources.length, 6);
  const existingIds = current.filter((entry) => !newDefinitions.has(entry.flags?.["pf2e-affliction-forge"]?.definitionId)).map((entry) => entry._id);
  const mock = installFoundryMock({ existingIds });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 6);
    assert.equal(mock.createCalls.length, 1);
    assert.deepEqual(new Set(mock.createCalls[0].data.map((entry) => entry._id)), new Set(newSources.map((entry) => entry._id)));
  } finally {
    mock.restore();
  }
});

test("0.1.7 upgrade seeds Tuberculosis, the three manual-exception templates, and Reviling Earth", async () => {
  const current = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"];
  const newDefinitions = new Set([
    "affliction-forge-remastered-rules.gm-core.tuberculosis",
    "affliction-forge-remastered-rules.gm-core.bonechill",
    "affliction-forge-remastered-rules.gm-core.brain-worms",
    "affliction-forge-remastered-rules.gm-core.crimson-ooze",
    "affliction-forge-remastered-rules.gm-core.reviling-earth"
  ]);
  const newSources = current.filter((entry) => newDefinitions.has(entry.flags?.["pf2e-affliction-forge"]?.definitionId));
  assert.equal(newSources.length, 5);
  const existingIds = current.filter((entry) => !newDefinitions.has(entry.flags?.["pf2e-affliction-forge"]?.definitionId)).map((entry) => entry._id);
  const mock = installFoundryMock({ existingIds });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 5);
    assert.deepEqual(new Set(mock.createCalls[0].data.map((entry) => entry._id)), new Set(newSources.map((entry) => entry._id)));
  } finally {
    mock.restore();
  }
});

test("0.1.8 upgrade seeds only Reviling Earth", async () => {
  const current = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"];
  const curse = current.find((entry) =>
    entry.flags?.["pf2e-affliction-forge"]?.definitionId === "affliction-forge-remastered-rules.gm-core.reviling-earth"
  );
  assert.ok(curse);
  const existingIds = current.filter((entry) => entry._id !== curse._id).map((entry) => entry._id);
  const mock = installFoundryMock({ existingIds });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 1);
    assert.equal(mock.createCalls.length, 1);
    assert.equal(mock.createCalls[0].data.length, 1);
    assert.equal(mock.createCalls[0].data[0]._id, curse._id);
    assert.deepEqual(mock.configureCalls.filter((entry) => entry.name === "gm-core").map((entry) => entry.value.locked), [false, true]);
  } finally {
    mock.restore();
  }
});

test("seeding is idempotent when the deterministic document already exists", async () => {
  const mock = installFoundryMock({ existing: true });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 0);
    assert.equal(mock.createCalls.length, 0);
    assert.equal(mock.configureCalls.length, 0);
  } finally {
    mock.restore();
  }
});

test("non-GM clients never attempt to mutate module compendia", async () => {
  const mock = installFoundryMock({ isGM: false });
  try {
    const result = await seedBundledContent();
    assert.equal(result.seeded, false);
    assert.equal(result.reason, "not-gm");
    assert.equal(mock.createCalls.length, 0);
  } finally {
    mock.restore();
  }
});
