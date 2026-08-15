import {
  AFFLICTION_FORGE_ID,
  LIBRARY_ID,
  MODULE_ID,
  PROVIDER_ID
} from "./constants.js";
import { seedBundledContent } from "./content-seeder.js";
import { registerProvider } from "./provider.js";

let registered = false;
let seeded = false;
let seedPromise = null;

function log(level, message, data = undefined) {
  const fn = console[level] ?? console.log;
  if (data === undefined) fn(`${MODULE_ID} | ${message}`);
  else fn(`${MODULE_ID} | ${message}`, data);
}

async function ensureSeeded() {
  if (seeded) return null;
  seedPromise ??= seedBundledContent()
    .then((result) => {
      seeded = true;
      if (result?.created || result?.updated) log("info", `Synchronized bundled Affliction templates (created ${result.created ?? 0}, updated ${result.updated ?? 0}).`, result);
      return result;
    })
    .catch((error) => {
      seedPromise = null;
      throw error;
    });
  return seedPromise;
}

function tryRegister(api, source) {
  if (registered) return true;
  if (!api) return false;

  try {
    const provider = registerProvider(api);
    registered = true;
    log("info", "Registered Affliction Forge Remastered Rules provider.", {
      source,
      providerId: PROVIDER_ID,
      libraryId: LIBRARY_ID,
      provider
    });
    return true;
  } catch (error) {
    log("error", `Failed to register provider from ${source}.`, error);
    return false;
  }
}

Hooks.once("pf2eAfflictionForgeReady", async (api) => {
  try {
    await ensureSeeded();
  } catch (error) {
    log("error", "Bundled content seeding failed before provider registration.", error);
  }
  tryRegister(api, "pf2eAfflictionForgeReady");
});

Hooks.once("ready", async () => {
  try {
    await ensureSeeded();
  } catch (error) {
    log("error", "Bundled content seeding failed at ready.", error);
  }

  if (registered) return;
  const api = game.modules.get(AFFLICTION_FORGE_ID)?.api;
  if (!tryRegister(api, "ready-fallback")) {
    log("error", "Affliction Forge API was unavailable at ready; the library was not registered.");
  }
});
