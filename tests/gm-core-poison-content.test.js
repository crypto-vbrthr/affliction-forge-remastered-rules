import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateDefinition } from "../tools/lib/content-contract.mjs";
import { BUNDLED_ITEM_SOURCES_BY_PACK } from "../scripts/bundled-content.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const inventory = JSON.parse(fs.readFileSync(path.join(root, "inventory/gm-core-poisons.json"), "utf8"));
const gmDir = path.join(root, "content/gm-core");
const pc2Dir = path.join(root, "content/player-core-2");
const entries = inventory.entries;
const gmPoisons = entries.map((entry) => JSON.parse(fs.readFileSync(path.join(gmDir, `${entry.definitionId.split(".").at(-1)}.json`), "utf8")));
const byKey = new Map(gmPoisons.map((entry) => [entry.id.split(".").at(-1), entry]));
const pc2ByKey = new Map(entries.map((entry) => {
  const slug = entry.definitionId.split(".").at(-1);
  return [slug, JSON.parse(fs.readFileSync(path.join(pc2Dir, `${slug}.json`), "utf8"))];
}));

function stage(definition, number) { return definition.stages.find((entry) => entry.number === number); }
function damageFormula(definition, number) {
  return stage(definition, number).effect.components.find((entry) => entry.type === "damage")?.formula ?? null;
}

test("GM Core poison inventory publishes all nineteen source variants", () => {
  assert.equal(entries.length, 19);
  assert.equal(gmPoisons.length, 19);
  assert.equal(new Set(gmPoisons.map((entry) => entry.id)).size, 19);
  for (const poison of gmPoisons) {
    assert.match(poison.id, /^affliction-forge-remastered-rules\.gm-core\./);
    assert.equal(poison.metadata.sourceWorkId, "gm-core");
    assert.equal(poison.metadata.sourceWorkLabel, "Kernregeln: Spielleitung");
    assert.ok([248, 249, 250].includes(poison.metadata.sourcePage));
    assert.equal(poison.metadata.sourceVariant, true);
    assert.equal(poison.metadata.variantGroupId, `poison.${poison.id.split(".").at(-1)}`);
    assert.deepEqual(validateDefinition(poison, { pack: "gm-core" }), [], poison.name);
  }
});

test("same-named GM Core and Player II poisons remain distinct variants with shared variant groups", () => {
  for (const gmPoison of gmPoisons) {
    const slug = gmPoison.id.split(".").at(-1);
    const pc2 = pc2ByKey.get(slug);
    assert.ok(pc2, slug);
    assert.equal(pc2.name, gmPoison.name, slug);
    assert.notEqual(pc2.id, gmPoison.id, slug);
    assert.equal(pc2.metadata.variantGroupId, gmPoison.metadata.variantGroupId, slug);
    assert.equal(pc2.metadata.sourceWorkLabel, "Kernregeln: Spieler 2", slug);
  }
});

test("the eight reviewed GM Core mechanical divergences are preserved", () => {
  const expected = {
    "arsenic": { dc: 18, damage: ["1d4", "1d6", "2d6"] },
    "blightburn-resin": { dc: 31, damage: ["8d6", "10d6", "15d6"] },
    "deathcap-powder": { dc: 33, damage: ["13d6", "17d6", "20d6"] },
    "giant-centipede-venom": { dc: 17, damage: ["1d6", "1d4", "1d4"] },
    "hemlock": { dc: 38, damage: ["16d6", "17d6", "16d6"] },
    "black-lotus-extract": { dc: 42, damage: ["15d6", "17d6", "20d6"] },
    "black-viper-venom": { dc: 18, damage: ["1d8", "1d10", "2d6"] },
    "sulfur-fumes": { dc: 36, damage: ["7d6", "8d6", "10d6"] }
  };
  for (const [slug, values] of Object.entries(expected)) {
    const gmPoison = byKey.get(slug);
    const pc2 = pc2ByKey.get(slug);
    assert.equal(gmPoison.checks[0].dc, values.dc, slug);
    assert.deepEqual(gmPoison.stages.map((_, index) => damageFormula(gmPoison, index + 1)), values.damage, slug);
    const sameDc = gmPoison.checks[0].dc === pc2.checks[0].dc;
    const sameDamage = JSON.stringify(gmPoison.stages.map((_, index) => damageFormula(gmPoison, index + 1))) === JSON.stringify(pc2.stages.map((_, index) => damageFormula(pc2, index + 1)));
    assert.equal(sameDc && sameDamage, false, `${slug} must remain mechanically distinguishable from Player II`);
  }
});

test("GM Core poison special handling carries over to the source variant", () => {
  const lethargy = byKey.get("lethargy-poison");
  assert.equal(lethargy.multipleExposure, "ignore");
  assert.equal(lethargy.delivery.injuryPoison, true);
  assert.ok(lethargy.traits.includes("incapacitation"));
  const virulent = gmPoisons.filter((entry) => entry.progression.virulent).map((entry) => entry.id.split(".").at(-1)).sort();
  assert.deepEqual(virulent, ["black-lotus-extract", "tears-of-death"]);
});

test("runtime seed contains forty-nine GM Core and twenty-nine Player II definitions", () => {
  assert.equal(BUNDLED_ITEM_SOURCES_BY_PACK["gm-core"].length, 49);
  assert.equal(BUNDLED_ITEM_SOURCES_BY_PACK["player-core-2"].length, 29);
  assert.equal(Object.values(BUNDLED_ITEM_SOURCES_BY_PACK).flat().length, 78);
});
