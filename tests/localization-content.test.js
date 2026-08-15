import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { localizeTree } from "./helpers/localization.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const de = JSON.parse(fs.readFileSync(path.join(root, "lang/de.json"), "utf8"));
const en = JSON.parse(fs.readFileSync(path.join(root, "lang/en.json"), "utf8"));
const userKeys = new Set(["name", "description", "label", "manualComment", "sourceWorkLabel", "sourceSection"]);

function walk(value, findings = [], pathName = "") {
  if (Array.isArray(value)) value.forEach((entry, index) => walk(entry, findings, `${pathName}[${index}]`));
  else if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      const next = pathName ? `${pathName}.${key}` : key;
      if (userKeys.has(key) && typeof entry === "string" && entry.trim()) findings.push({ path: next, value: entry });
      walk(entry, findings, next);
    }
  }
  return findings;
}

test("all bundled user-facing content is tokenized and translated in both locales", () => {
  let definitions = 0;
  for (const pack of ["player-core", "gm-core", "player-core-2", "treasure-vault-remastered"]) {
    const dir = path.join(root, "content", pack);
    for (const filename of fs.readdirSync(dir).filter((name) => name.endsWith(".json"))) {
      definitions += 1;
      const definition = JSON.parse(fs.readFileSync(path.join(dir, filename), "utf8"));
      for (const field of walk(definition)) {
        assert.match(field.value, /^@i18n:/, `${pack}/${filename}:${field.path}`);
        const key = field.value.slice(6);
        assert.equal(typeof de[key], "string", `missing de key ${key}`);
        assert.equal(typeof en[key], "string", `missing en key ${key}`);
        assert.ok(de[key].trim(), `empty de key ${key}`);
        assert.ok(en[key].trim(), `empty en key ${key}`);
      }
    }
  }
  assert.equal(definitions, 79);
});

test("the same tokenized definition resolves to German and English without changing its stable id", () => {
  const raw = JSON.parse(fs.readFileSync(path.join(root, "content/gm-core/nightmare-fever.json"), "utf8"));
  const german = localizeTree(raw, "de");
  const english = localizeTree(raw, "en");
  assert.equal(raw.id, german.id);
  assert.equal(raw.id, english.id);
  assert.equal(german.name, "Albtraumfieber");
  assert.equal(english.name, "Nightmare Fever");
  assert.equal(german.metadata.sourceWorkLabel, "Kernregeln: Spielleitung");
  assert.equal(english.metadata.sourceWorkLabel, "GM Core");
  assert.match(english.stages[2].description, /slashing damage/i);
});

test("manual GM comments are localized instead of embedded German prose", () => {
  const raw = JSON.parse(fs.readFileSync(path.join(root, "content/gm-core/bonechill.json"), "utf8"));
  assert.match(raw.metadata.manualComment, /^@i18n:/);
  assert.match(localizeTree(raw, "de").metadata.manualComment, /^GM-Hinweis:/);
  assert.match(localizeTree(raw, "en").metadata.manualComment, /^GM Note:/);
});

test("locale files contain no parent-child key collisions", () => {
  for (const translations of [de, en]) {
    const keys = new Set(Object.keys(translations));
    const collisions = [];
    for (const key of keys) {
      const parts = key.split(".");
      for (let index = 1; index < parts.length; index += 1) {
        const parent = parts.slice(0, index).join(".");
        if (keys.has(parent)) collisions.push(`${parent} < ${key}`);
      }
    }
    assert.deepEqual(collisions, []);
  }
});
