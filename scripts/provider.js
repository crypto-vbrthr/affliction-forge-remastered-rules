import {
  LIBRARY_ID,
  MODULE_ID,
  MODULE_VERSION,
  PACK_COLLECTIONS,
  PROVIDER_ID,
  SOURCE_WORK_IDS
} from "./constants.js";

function localize(key, fallback) {
  try {
    const value = globalThis.game?.i18n?.localize?.(key);
    return value && value !== key ? value : fallback;
  } catch {
    return fallback;
  }
}

function installedVersion() {
  return String(globalThis.game?.modules?.get?.(MODULE_ID)?.version ?? MODULE_VERSION);
}

function providerExists(api) {
  try {
    return api?.providers?.list?.().some((entry) => entry?.id === PROVIDER_ID) ?? false;
  } catch {
    return false;
  }
}

export function buildProviderRegistration() {
  return {
    id: PROVIDER_ID,
    label: localize("AFFLICTION_FORGE_REMASTERED.Provider.Label", "Remastered Rules"),
    moduleId: MODULE_ID,
    version: installedVersion(),
    metadata: {
      contentLicense: "ORC",
      contentPolicy: "mechanics-only",
      sourceWorkIds: [...SOURCE_WORK_IDS]
    },
    libraries: [{
      id: LIBRARY_ID,
      label: localize("AFFLICTION_FORGE_REMASTERED.Library.Label", "Remastered Rules"),
      description: localize(
        "AFFLICTION_FORGE_REMASTERED.Library.Description",
        "Read-only Remastered affliction rules from reviewed ORC-licensed source material."
      ),
      packs: [...PACK_COLLECTIONS],
      writable: false,
      enabledByDefault: true,
      metadata: {
        contentLicense: "ORC",
        contentPolicy: "mechanics-only",
        sourceWorkIds: [...SOURCE_WORK_IDS]
      }
    }]
  };
}

export function registerProvider(api) {
  if (!api?.providers?.register || !api?.providers?.list) {
    throw new Error("Affliction Forge provider API is unavailable.");
  }

  if (providerExists(api)) {
    return api.providers.list().find((entry) => entry.id === PROVIDER_ID) ?? null;
  }

  return api.providers.register(buildProviderRegistration());
}
