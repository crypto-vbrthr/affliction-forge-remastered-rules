import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { MODULE_ID, PACK_NAMES } from "../scripts/constants.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "module.json"), "utf8"));

test("manifest requires Affliction Forge 0.1.53 and PF2e", () => {
  assert.equal(manifest.id, MODULE_ID);
  assert.equal(manifest.compatibility.minimum, "14");
  assert.equal(manifest.relationships.systems[0].id, "pf2e");
  const dependency = manifest.relationships.requires.find((entry) => entry.id === "pf2e-affliction-forge");
  assert.ok(dependency);
  assert.equal(dependency.compatibility.minimum, "0.1.53");
});

test("manifest declares exactly the four planned Item packs", () => {
  assert.equal(manifest.packs.length, 4);
  assert.deepEqual(manifest.packs.map((entry) => entry.name), [...PACK_NAMES]);
  for (const pack of manifest.packs) {
    assert.equal(pack.type, "Item");
    assert.equal(pack.system, "pf2e");
    assert.equal(pack.path, `packs/${pack.name}`);
  }
});

test("module title does not use Paizo brand names", () => {
  assert.doesNotMatch(manifest.title, /pathfinder|paizo|golarion/i);
});
