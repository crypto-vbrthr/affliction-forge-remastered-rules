import assert from "node:assert/strict";
import test from "node:test";
import { BUNDLED_ITEM_SOURCES_BY_PACK } from "../scripts/bundled-content.js";
import { seedBundledContent } from "../scripts/content-seeder.js";

function fakeIndex(ids = []) { return new Map(ids.map((id) => [id, { _id: id }])); }

function installFoundryMock({ existing = false, existingIds = null, existingPc2 = true, isGM = true } = {}) {
  const previous = { game: globalThis.game, CONFIG: globalThis.CONFIG, Hooks: globalThis.Hooks, Item: globalThis.Item };
  const expectedByPack = Object.fromEntries(Object.entries(BUNDLED_ITEM_SOURCES_BY_PACK).map(([name, rows]) => [name, rows.map((entry) => entry._id)]));
  const createCalls = [], configureCalls = [], hookCalls = [], packs = new Map();

  for (const name of ["player-core", "gm-core", "player-core-2", "treasure-vault-remastered"]) {
    packs.set(`affliction-forge-remastered-rules.${name}`, {
      collection: `affliction-forge-remastered-rules.${name}`,
      locked: true,
      async getIndex() {
        let ids = [];
        if (name === "gm-core") ids = Array.isArray(existingIds) ? existingIds : (existing ? expectedByPack[name] : []);
        else if (name === "player-core-2") ids = existingPc2 ? expectedByPack[name] : [];
        return fakeIndex(ids);
      },
      async configure(value) { configureCalls.push({ name, value }); this.locked = Boolean(value.locked); }
    });
  }

  globalThis.game = { user: { isGM }, packs: { get: (id) => packs.get(id) } };
  globalThis.CONFIG = { Item: { documentClass: { async createDocuments(data, operation) {
    createCalls.push({ data: structuredClone(data), operation: structuredClone(operation) });
    return data.map((entry) => ({ ...entry }));
  } } } };
  globalThis.Hooks = { callAll: (...args) => hookCalls.push(args) };
  globalThis.Item = undefined;

  return { expectedByPack, createCalls, configureCalls, hookCalls, restore() {
    globalThis.game = previous.game; globalThis.CONFIG = previous.CONFIG; globalThis.Hooks = previous.Hooks; globalThis.Item = previous.Item;
  } };
}

function idsForDefinitions(packName, definitionIds) {
  const wanted = new Set(definitionIds);
  return BUNDLED_ITEM_SOURCES_BY_PACK[packName]
    .filter((entry) => wanted.has(entry.flags?.["pf2e-affliction-forge"]?.definitionId))
    .map((entry) => entry._id);
}

function gmExistingExcluding(excludedIds) {
  return BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"].map((entry) => entry._id).filter((id) => !excludedIds.has(id));
}

test("fresh GM startup seeds thirty GM templates plus twenty-nine Player II poison templates and relocks both packs", async () => {
  const mock = installFoundryMock({ existingPc2: false });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 59);
    assert.equal(mock.createCalls.length, 2);
    const byPack = new Map(mock.createCalls.map((call) => [call.operation.pack, call]));
    assert.equal(byPack.get("affliction-forge-remastered-rules.gm-core").data.length, 30);
    assert.equal(byPack.get("affliction-forge-remastered-rules.player-core-2").data.length, 29);
    assert.equal(byPack.get("affliction-forge-remastered-rules.gm-core").operation.keepId, true);
    assert.equal(byPack.get("affliction-forge-remastered-rules.player-core-2").operation.keepId, true);
    assert.deepEqual(mock.configureCalls.filter((e) => e.name === "gm-core").map((e) => e.value.locked), [false, true]);
    assert.deepEqual(mock.configureCalls.filter((e) => e.name === "player-core-2").map((e) => e.value.locked), [false, true]);
    assert.equal(mock.hookCalls.at(-1)[0], "pf2eAfflictionForgeLibrariesChanged");
  } finally { mock.restore(); }
});

test("0.1.10 upgrade preserves all GM content and seeds exactly the twenty-nine new Player II poisons", async () => {
  const mock = installFoundryMock({ existing: true, existingPc2: false });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 29);
    assert.equal(mock.createCalls.length, 1);
    assert.equal(mock.createCalls[0].operation.pack, "affliction-forge-remastered-rules.player-core-2");
    assert.equal(mock.createCalls[0].data.length, 29);
  } finally { mock.restore(); }
});

test("0.1.9 upgrade preserves the fourteen diseases plus Reviling Earth and seeds the other fifteen curses", async () => {
  const curseIds = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"]
    .filter((entry) => entry.flags?.["pf2e-affliction-forge"]?.definition?.afflictionType === "curse")
    .map((entry) => entry.flags["pf2e-affliction-forge"].definitionId);
  const newCurseIds = curseIds.filter((id) => id !== "affliction-forge-remastered-rules.gm-core.reviling-earth");
  assert.equal(newCurseIds.length, 15);
  const newIds = idsForDefinitions("gm-core", newCurseIds);
  const mock = installFoundryMock({ existingIds: gmExistingExcluding(new Set(newIds)) });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 15);
    assert.equal(mock.createCalls.length, 1);
    assert.deepEqual(new Set(mock.createCalls[0].data.map((entry) => entry._id)), new Set(newIds));
  } finally { mock.restore(); }
});

test("0.1.8 upgrade seeds all sixteen curses", async () => {
  const curseSources = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"].filter((entry) => entry.flags?.["pf2e-affliction-forge"]?.definition?.afflictionType === "curse");
  const curseIds = curseSources.map((entry) => entry._id);
  const mock = installFoundryMock({ existingIds: gmExistingExcluding(new Set(curseIds)) });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 16);
    assert.deepEqual(new Set(mock.createCalls[0].data.map((entry) => entry._id)), new Set(curseIds));
  } finally { mock.restore(); }
});

test("seeding is idempotent when deterministic documents already exist", async () => {
  const mock = installFoundryMock({ existing: true });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 0);
    assert.equal(mock.createCalls.length, 0);
    assert.equal(mock.configureCalls.length, 0);
  } finally { mock.restore(); }
});

test("non-GM clients never attempt to mutate module compendia", async () => {
  const mock = installFoundryMock({ isGM: false });
  try {
    const result = await seedBundledContent();
    assert.equal(result.seeded, false);
    assert.equal(result.reason, "not-gm");
    assert.equal(mock.createCalls.length, 0);
  } finally { mock.restore(); }
});
