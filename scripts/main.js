import {
  AFFLICTION_FORGE_ID,
  LIBRARY_ID,
  MODULE_ID,
  PROVIDER_ID
} from "./constants.js";
import { registerProvider } from "./provider.js";

let registered = false;

function log(level, message, data = undefined) {
  const fn = console[level] ?? console.log;
  if (data === undefined) fn(`${MODULE_ID} | ${message}`);
  else fn(`${MODULE_ID} | ${message}`, data);
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

Hooks.once("pf2eAfflictionForgeReady", (api) => {
  tryRegister(api, "pf2eAfflictionForgeReady");
});

Hooks.once("ready", () => {
  // Defensive fallback for unusual module load orders. Normal registration is
  // expected to happen through pf2eAfflictionForgeReady.
  if (registered) return;
  const api = game.modules.get(AFFLICTION_FORGE_ID)?.api;
  if (!tryRegister(api, "ready-fallback")) {
    log("error", "Affliction Forge API was unavailable at ready; the library was not registered.");
  }
});
