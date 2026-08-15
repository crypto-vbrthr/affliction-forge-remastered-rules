# Building the Compendium Packs

The repository keeps reviewed Affliction definitions in `content/<source-pack>/` and compiled Foundry LevelDB databases in `packs/<source-pack>/`.

## 1. Validate and prepare Item sources

```bash
npm test
npm run validate
npm run prepare:packs
```

`prepare:packs` converts each reviewed Affliction definition into the PF2e `effect` Item wrapper expected by Affliction Forge 0.1.47. Stable definition IDs are deterministically mapped to stable 16-character Foundry document IDs.

## 2. Compile LevelDB packs

Use the official Foundry VTT CLI. From the module project, compile each non-empty prepared directory into its matching `packs/` path. The CLI supports compiling serialized JSON documents into LevelDB compendium directories.

Example pattern:

```bash
fvtt package pack -n "player-core" \
  --inputDirectory ".build/pack-sources/player-core" \
  --outputDirectory "packs"
```

Repeat for `gm-core`, `player-core-2`, and `treasure-vault-remastered` when they contain reviewed entries.

Do not ship `.build/`. Do ship the generated LevelDB directories in `packs/`.
