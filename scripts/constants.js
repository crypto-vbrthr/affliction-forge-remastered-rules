export const MODULE_ID = "affliction-forge-remastered-rules";
export const MODULE_VERSION = "0.1.17";
export const AFFLICTION_FORGE_ID = "pf2e-affliction-forge";
export const MIN_AFFLICTION_FORGE_VERSION = "0.1.61";

export const PROVIDER_ID = MODULE_ID;
export const LIBRARY_ID = `${MODULE_ID}.rules`;

export const PACK_NAMES = Object.freeze([
  "player-core",
  "gm-core",
  "player-core-2",
  "treasure-vault-remastered"
]);

// Logical content-source packs can outnumber physical Foundry compendia.
// New supplement sources are hosted in the already-established supplemental
// compendium so upgrades do not depend on Foundry initializing a brand-new
// empty LevelDB pack before the runtime bootstrap runs.
export const CONTENT_PACK_NAMES = Object.freeze([
  ...PACK_NAMES,
  "howl-of-the-wild"
]);

export const CONTENT_PACK_HOSTS = Object.freeze({
  "howl-of-the-wild": "treasure-vault-remastered"
});

export const PACK_COLLECTIONS = Object.freeze(
  PACK_NAMES.map((name) => `${MODULE_ID}.${name}`)
);

export const SOURCE_WORK_IDS = Object.freeze([
  "player-core",
  "gm-core",
  "player-core-2",
  "treasure-vault-remastered",
  "howl-of-the-wild"
]);
