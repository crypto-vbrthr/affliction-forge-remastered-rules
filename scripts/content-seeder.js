import { BUNDLED_ITEM_SOURCES_BY_PACK } from "./bundled-content.js";
import { MODULE_ID, PACK_NAMES } from "./constants.js";

const LIBRARY_CHANGED_HOOK = "pf2eAfflictionForgeLibrariesChanged";

function collectionId(packName) {
  return `${MODULE_ID}.${packName}`;
}

function cleanItemSource(source) {
  const clone = structuredClone(source);
  delete clone._key;
  return clone;
}

async function ensurePackContent(packName) {
  const sources = BUNDLED_ITEM_SOURCES_BY_PACK[packName] ?? [];
  if (sources.length === 0) return { packName, created: 0, skipped: 0 };

  const pack = globalThis.game?.packs?.get?.(collectionId(packName));
  if (!pack) throw new Error(`Compendium not found: ${collectionId(packName)}`);

  const index = await pack.getIndex();
  const knownIds = new Set(Array.from(index?.keys?.() ?? []));
  const missing = sources.filter((source) => !knownIds.has(source._id)).map(cleanItemSource);
  if (missing.length === 0) return { packName, created: 0, skipped: sources.length };

  const wasLocked = Boolean(pack.locked);
  if (wasLocked) await pack.configure({ locked: false });
  try {
    const ItemClass = globalThis.CONFIG?.Item?.documentClass ?? globalThis.Item?.implementation ?? globalThis.Item;
    if (typeof ItemClass?.createDocuments !== "function") throw new Error("Foundry Item.createDocuments API is unavailable.");
    const created = await ItemClass.createDocuments(missing, {
      pack: pack.collection,
      keepId: true,
      render: false
    });
    return { packName, created: created?.length ?? missing.length, skipped: sources.length - missing.length };
  } finally {
    if (wasLocked) await pack.configure({ locked: true });
  }
}

export async function seedBundledContent() {
  if (!globalThis.game?.user?.isGM) return { seeded: false, reason: "not-gm", packs: [] };
  const results = [];
  for (const packName of PACK_NAMES) results.push(await ensurePackContent(packName));
  const created = results.reduce((sum, result) => sum + result.created, 0);
  if (created > 0) {
    globalThis.Hooks?.callAll?.(LIBRARY_CHANGED_HOOK, {
      source: MODULE_ID,
      reason: "bundled-content-seeded",
      created
    });
  }
  return { seeded: created > 0, created, packs: results };
}
