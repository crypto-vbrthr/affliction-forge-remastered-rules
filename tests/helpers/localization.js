import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const cache = new Map();

function translations(lang) {
  if (!cache.has(lang)) cache.set(lang, JSON.parse(fs.readFileSync(path.join(root, `lang/${lang}.json`), "utf8")));
  return cache.get(lang);
}

export function localizeTree(value, lang = "de") {
  if (typeof value === "string" && value.startsWith("@i18n:")) {
    const key = value.slice(6);
    return translations(lang)[key] ?? key;
  }
  if (Array.isArray(value)) return value.map((entry) => localizeTree(entry, lang));
  if (!value || typeof value !== "object") return value;
  const clone = structuredClone(value);
  for (const [key, entry] of Object.entries(clone)) clone[key] = localizeTree(entry, lang);
  return clone;
}

export function readLocalizedJson(filename, lang = "de") {
  return localizeTree(JSON.parse(fs.readFileSync(filename, "utf8")), lang);
}
