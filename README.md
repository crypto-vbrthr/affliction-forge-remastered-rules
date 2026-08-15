# Affliction Forge: Remastered Rules Library

Version **0.1.0** is the architecture and licensing scaffold for the first external Affliction Forge content library.

## Current scope

- one external provider
- one visible, read-only Affliction Forge library
- four internal PF2e Item compendium packs
- required dependency on **PF2E Affliction Forge 0.1.47+**
- ORC notice and upstream attribution
- mechanics-only content policy
- per-entry license/review metadata contract
- deterministic stable Item IDs for compiled pack content
- Node validation/tests for provider wiring, manifest structure, and content gates

**0.1.0 intentionally ships no Affliction rules entries yet.** The next block populates the first fully automatable, license-reviewed entries.

## Library architecture

```text
Affliction Forge: Remastered Rules Library
└─ Provider: affliction-forge-remastered-rules
   └─ Library: affliction-forge-remastered-rules.rules
      ├─ Core Rules: Player I
      ├─ Core Rules: GM
      ├─ Core Rules: Player II
      └─ Treasure Rules (Remastered)
```

The four compendium packs are internal source partitions. Affliction Forge sees them as one provider library through `api.providers.register()`.

## Why the source labels are neutral

The module does not use Paizo branding or compatibility logos. Exact upstream product titles appear only where needed for ORC attribution in `ORC_NOTICE.md`. The Foundry system package ID `pf2e` and the dependency ID `pf2e-affliction-forge` are technical identifiers required for integration.

## Content workflow

1. Extract only functional rules material from an approved English ORC source.
2. Independently formulate German user-facing text.
3. Remove or replace Reserved Material, including setting-specific proper nouns.
4. Mark only fully automatable entries as `automationStatus: "full"`.
5. Run `npm test` and `npm run validate`.
6. Run `npm run prepare:packs`.
7. Compile prepared Item JSON with the official Foundry VTT CLI into LevelDB packs.

See `docs/CONTENT_POLICY.md`, `docs/ADDING_CONTENT.md`, and `docs/BUILDING_PACKS.md`.

## Runtime registration

The module listens for `pf2eAfflictionForgeReady` and registers a read-only provider library backed by all four packs. A `ready` fallback exists only to protect against unusual load ordering. Registration is idempotent from this module's side.

## License

Software code is MIT-licensed. Rules data is governed by the ORC License. See `LICENSE` and `ORC_NOTICE.md`.
