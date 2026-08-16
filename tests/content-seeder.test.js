import assert from "node:assert/strict";
import test from "node:test";
import { BUNDLED_ITEM_SOURCES_BY_PACK } from "../scripts/bundled-content.js";
import { seedBundledContent } from "../scripts/content-seeder.js";

function fakeIndex(ids = [], revision = 0) { return new Map(ids.map((id) => [id, { _id: id, flags: { "affliction-forge-remastered-rules": { contentRevision: revision } } }])); }

function installFoundryMock({ existing = false, existingIds = null, existingPc2 = true, existingTreasure = true, existingHowl = true, isGM = true, currentRevision = false, revision = null } = {}) {
  const previous = { game: globalThis.game, CONFIG: globalThis.CONFIG, Hooks: globalThis.Hooks, Item: globalThis.Item };
  const expectedByPack = Object.fromEntries(Object.entries(BUNDLED_ITEM_SOURCES_BY_PACK).map(([name, rows]) => [name, rows.map((entry) => entry._id)]));
  const createCalls = [], updateCalls = [], configureCalls = [], hookCalls = [], packs = new Map();

  for (const name of ["player-core", "gm-core", "player-core-2", "treasure-vault-remastered"]) {
    packs.set(`affliction-forge-remastered-rules.${name}`, {
      collection: `affliction-forge-remastered-rules.${name}`,
      locked: true,
      async getIndex() {
        let ids = [];
        if (name === "gm-core") ids = Array.isArray(existingIds) ? existingIds : (existing ? expectedByPack[name] : []);
        else if (name === "player-core-2") ids = existingPc2 ? expectedByPack[name] : [];
        else if (name === "treasure-vault-remastered") ids = existingTreasure ? [...expectedByPack[name], ...(existingHowl ? expectedByPack["howl-of-the-wild"] : [])] : [];
        return fakeIndex(ids, revision ?? (currentRevision ? 3 : 0));
      },
      async configure(value) { configureCalls.push({ name, value }); this.locked = Boolean(value.locked); }
    });
  }

  globalThis.game = { user: { isGM }, packs: { get: (id) => packs.get(id) } };
  globalThis.CONFIG = { Item: { documentClass: {
    async createDocuments(data, operation) {
      createCalls.push({ data: structuredClone(data), operation: structuredClone(operation) });
      return data.map((entry) => ({ ...entry }));
    },
    async updateDocuments(data, operation) {
      updateCalls.push({ data: structuredClone(data), operation: structuredClone(operation) });
      return data.map((entry) => ({ ...entry }));
    }
  } } };
  globalThis.Hooks = { callAll: (...args) => hookCalls.push(args) };
  globalThis.Item = undefined;

  return { expectedByPack, createCalls, updateCalls, configureCalls, hookCalls, restore() {
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

test("fresh GM startup seeds all 115 bundled templates across the populated source packs", async () => {
  const mock = installFoundryMock({ existingPc2: false, existingTreasure: false, existingHowl: false });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 115);
    assert.equal(result.updated, 0);
    assert.equal(mock.createCalls.length, 4);
    const callsFor = (collection) => mock.createCalls.filter((call) => call.operation.pack === collection);
    assert.equal(callsFor("affliction-forge-remastered-rules.gm-core").reduce((sum, call) => sum + call.data.length, 0), 50);
    assert.equal(callsFor("affliction-forge-remastered-rules.player-core-2").reduce((sum, call) => sum + call.data.length, 0), 29);
    assert.equal(callsFor("affliction-forge-remastered-rules.treasure-vault-remastered").reduce((sum, call) => sum + call.data.length, 0), 36);
    for (const call of mock.createCalls) assert.equal(call.operation.keepId, true);
    assert.deepEqual(mock.configureCalls.filter((e) => e.name === "gm-core").map((e) => e.value.locked), [false, true]);
    assert.deepEqual(mock.configureCalls.filter((e) => e.name === "player-core-2").map((e) => e.value.locked), [false, true]);
    assert.deepEqual(mock.configureCalls.filter((e) => e.name === "treasure-vault-remastered").map((e) => e.value.locked), [false, true, false, true]);
    assert.equal(mock.hookCalls.at(-1)[0], "pf2eAfflictionForgeLibrariesChanged");
  } finally { mock.restore(); }
});

test("0.1.15 upgrade seeds the three new Howl definitions into the established supplemental pack", async () => {
  const mock = installFoundryMock({ existing: true, existingPc2: true, existingTreasure: true, existingHowl: false, currentRevision: true });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 3);
    assert.equal(result.updated, 0);
    assert.equal(mock.createCalls.length, 1);
    assert.equal(mock.createCalls[0].operation.pack, "affliction-forge-remastered-rules.treasure-vault-remastered");
    assert.equal(mock.createCalls[0].data.length, 3);
    assert.equal(mock.createCalls[0].operation.keepId, true);
  } finally { mock.restore(); }
});

test("0.1.14 upgrade seeds Treasure Vault plus Howl and refreshes the prior localized definitions", async () => {
  const mock = installFoundryMock({ existing: true, existingPc2: true, existingTreasure: false, existingHowl: false, revision: 2 });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 36);
    assert.equal(result.updated, 79);
    assert.equal(mock.createCalls.length, 2);
    assert.ok(mock.createCalls.every((call) => call.operation.pack === "affliction-forge-remastered-rules.treasure-vault-remastered"));
    assert.deepEqual(mock.createCalls.map((call) => call.data.length), [33, 3]);
    const updatedByPack = new Map(mock.updateCalls.map((call) => [call.operation.pack, call.data.length]));
    assert.equal(updatedByPack.get("affliction-forge-remastered-rules.gm-core"), 50);
    assert.equal(updatedByPack.get("affliction-forge-remastered-rules.player-core-2"), 29);
  } finally { mock.restore(); }
});

test("0.1.12 upgrade preserves the prior forty-nine GM documents and seeds only Dagger Venom", async () => {
  const dagger = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"].find((entry) => entry.flags?.["pf2e-affliction-forge"]?.definitionId === "affliction-forge-remastered-rules.gm-core.dagger-venom");
  assert.ok(dagger);
  const mock = installFoundryMock({ existingIds: gmExistingExcluding(new Set([dagger._id])), existingPc2: true });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 1);
    assert.ok(result.updated > 0);
    assert.equal(mock.createCalls.length, 1);
    assert.equal(mock.createCalls[0].operation.pack, "affliction-forge-remastered-rules.gm-core");
    assert.deepEqual(mock.createCalls[0].data.map((entry) => entry._id), [dagger._id]);
  } finally { mock.restore(); }
});

test("0.1.11 upgrade preserves thirty GM disease/curse documents plus Player II content and seeds nineteen GM poison variants plus Dagger Venom", async () => {
  const gmPoisonIds = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"]
    .filter((entry) => entry.flags?.["pf2e-affliction-forge"]?.definition?.afflictionType === "poison")
    .map((entry) => entry._id);
  assert.equal(gmPoisonIds.length, 20);
  const mock = installFoundryMock({ existingIds: gmExistingExcluding(new Set(gmPoisonIds)), existingPc2: true });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 20);
    assert.ok(result.updated > 0);
    assert.equal(mock.createCalls.length, 1);
    assert.equal(mock.createCalls[0].operation.pack, "affliction-forge-remastered-rules.gm-core");
    assert.deepEqual(new Set(mock.createCalls[0].data.map((entry) => entry._id)), new Set(gmPoisonIds));
  } finally { mock.restore(); }
});

test("0.1.10 upgrade preserves thirty GM disease/curse documents and seeds Player II poisons plus GM poison variants", async () => {
  const gmPoisonIds = BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"]
    .filter((entry) => entry.flags?.["pf2e-affliction-forge"]?.definition?.afflictionType === "poison")
    .map((entry) => entry._id);
  const mock = installFoundryMock({ existingIds: gmExistingExcluding(new Set(gmPoisonIds)), existingPc2: false });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 49);
    assert.ok(result.updated > 0);
    assert.equal(mock.createCalls.length, 2);
    const byPack = new Map(mock.createCalls.map((call) => [call.operation.pack, call]));
    assert.equal(byPack.get("affliction-forge-remastered-rules.gm-core").data.length, 20);
    assert.equal(byPack.get("affliction-forge-remastered-rules.player-core-2").data.length, 29);
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
    assert.ok(result.updated > 0);
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
    assert.ok(result.updated > 0);
    assert.deepEqual(new Set(mock.createCalls[0].data.map((entry) => entry._id)), new Set(curseIds));
  } finally { mock.restore(); }
});

test("seeding is idempotent when deterministic documents already exist", async () => {
  const mock = installFoundryMock({ existing: true, currentRevision: true });
  try {
    const result = await seedBundledContent();
    assert.equal(result.created, 0);
    assert.equal(mock.createCalls.length, 0);
    assert.equal(mock.updateCalls.length, 0);
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
