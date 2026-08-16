import { BUNDLED_ITEM_SOURCES_BY_PACK } from "./bundled-content.js";
import { MODULE_ID, PACK_NAMES } from "./constants.js";

const LIBRARY_CHANGED_HOOK = "pf2eAfflictionForgeLibrariesChanged";
const CONTENT_REVISION = 3;

function collectionId(packName) {
  return `${MODULE_ID}.${packName}`;
}

function cleanItemSource(source) {
  const clone = structuredClone(source);
  delete clone._key;
  return clone;
}

function updateItemSource(source) {
  const clone = cleanItemSource(source);
  return {
    _id: clone._id,
    name: clone.name,
    img: clone.img,
    system: clone.system,
    flags: clone.flags
  };
}

function indexRows(index) {
  if (!index) return [];
  if (typeof index.values === "function") return [...index.values()];
  return Array.isArray(index) ? index : [...index];
}

function revisionOf(row) {
  return Number(row?.flags?.[MODULE_ID]?.contentRevision ?? 0);
}

async function ensurePackContent(packName) {
  const sources = BUNDLED_ITEM_SOURCES_BY_PACK[packName] ?? [];
  if (sources.length === 0) return { packName, created: 0, updated: 0, skipped: 0 };

  const pack = globalThis.game?.packs?.get?.(collectionId(packName));
  if (!pack) throw new Error(`Compendium not found: ${collectionId(packName)}`);

  const index = await pack.getIndex({ fields: ["flags"] });
  const rows = indexRows(index);
  const byId = new Map(rows.map((row) => [row._id ?? row.id, row]));
  const missing = sources.filter((source) => !byId.has(source._id)).map(cleanItemSource);
  const outdated = sources.filter((source) => {
    const row = byId.get(source._id);
    return row && revisionOf(row) < CONTENT_REVISION;
  }).map(updateItemSource);
  if (missing.length === 0 && outdated.length === 0) return { packName, created: 0, updated: 0, skipped: sources.length };

  const wasLocked = Boolean(pack.locked);
  if (wasLocked) await pack.configure({ locked: false });
  try {
    const ItemClass = globalThis.CONFIG?.Item?.documentClass ?? globalThis.Item?.implementation ?? globalThis.Item;
    if (typeof ItemClass?.createDocuments !== "function") throw new Error("Foundry Item.createDocuments API is unavailable.");
    if (outdated.length && typeof ItemClass?.updateDocuments !== "function") throw new Error("Foundry Item.updateDocuments API is unavailable.");
    const created = missing.length ? await ItemClass.createDocuments(missing, { pack: pack.collection, keepId: true, render: false }) : [];
    const updated = outdated.length ? await ItemClass.updateDocuments(outdated, { pack: pack.collection, render: false }) : [];
    return {
      packName,
      created: created?.length ?? missing.length,
      updated: updated?.length ?? outdated.length,
      skipped: sources.length - missing.length - outdated.length
    };
  } finally {
    if (wasLocked) await pack.configure({ locked: true });
  }
}

export async function seedBundledContent() {
  if (!globalThis.game?.user?.isGM) return { seeded: false, reason: "not-gm", packs: [] };
  const results = [];
  for (const packName of PACK_NAMES) results.push(await ensurePackContent(packName));
  const created = results.reduce((sum, result) => sum + result.created, 0);
  const updated = results.reduce((sum, result) => sum + result.updated, 0);
  if (created > 0 || updated > 0) {
    globalThis.Hooks?.callAll?.(LIBRARY_CHANGED_HOOK, {
      source: MODULE_ID,
      reason: "bundled-content-synchronized",
      created,
      updated
    });
  }
  return { seeded: created > 0 || updated > 0, created, updated, packs: results };
}
