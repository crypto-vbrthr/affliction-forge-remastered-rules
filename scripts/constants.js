export const MODULE_ID = "affliction-forge-remastered-rules";
export const MODULE_VERSION = "0.1.15";
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

export const PACK_COLLECTIONS = Object.freeze(
  PACK_NAMES.map((name) => `${MODULE_ID}.${name}`)
);

export const SOURCE_WORK_IDS = Object.freeze([
  "player-core",
  "gm-core",
  "player-core-2",
  "treasure-vault-remastered"
]);
