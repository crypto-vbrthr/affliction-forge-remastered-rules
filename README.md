# Affliction Forge: Remastered Rules Library

Version **0.1.2** expands the reviewed GM disease content made possible by Affliction Forge 0.1.49.

## Current scope

- one external provider
- one visible, read-only Affliction Forge library
- four internal PF2e Item compendium packs
- required dependency on **PF2E Affliction Forge 0.1.49+**
- ORC notice and upstream attribution
- mechanics-only content policy
- per-entry license/review metadata contract
- deterministic stable Item IDs for compiled pack content
- GM-only idempotent runtime bootstrap for development installs with uncompiled packs
- Node validation/tests for provider wiring, manifest structure, content gates, restrictions, and persistence fields

**0.1.2 ships five fully reviewed GM disease entries:**

- **Scharlachfieber** (`Scarlet Fever` mechanics)
- **Tetanus** (`Tetanus` mechanics)
- **Malaria** (`Malaria` mechanics)
- **Erstickungsseuche** (`Choking Death` mechanics)
- **Kanalisationsdunst** (`Sewer Haze` mechanics)

The names and descriptions presented to users are independently formulated German mechanics text. The source-work names are retained only in internal source/review metadata where needed for traceability.

The 14-entry GM disease coverage inventory records the remaining blockers. Version 0.1.49 resolves condition-reduction locks and speech restrictions, but several diseases still need more general engine capabilities such as triggered checks, repeating sub-timers, speed/status modifiers, damage-type-wide healing locks, or component-specific permanent consequences.

## Malaria recurrence

The later recurrence rule does **not** keep a dormant Affliction controller alive for months. If recurrence occurs, the same Malaria definition is applied again. This is an explicit content/runtime policy rather than a missing scheduler feature.

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

1. Extract only functional rules material from an approved ORC source.
2. Independently formulate German user-facing mechanics text.
3. Remove or replace Reserved Material, including setting-specific proper nouns.
4. Mark only sufficiently automatable entries as `automationStatus: "full"`.
5. Run `npm test` and `npm run validate`.
6. Run `npm run prepare:packs` and `npm run generate:seed`.
7. Compile prepared Item JSON with the official Foundry VTT CLI into LevelDB packs for release builds. Until a pack is precompiled, the GM-only runtime bootstrap inserts missing bundled entries once and relocks the pack.

See `docs/CONTENT_POLICY.md`, `docs/ADDING_CONTENT.md`, and `docs/BUILDING_PACKS.md`.

## Runtime registration

The module listens for `pf2eAfflictionForgeReady`, ensures bundled reviewed content exists in the declared module packs, and then registers a read-only provider library backed by all four packs. A `ready` fallback protects unusual load ordering. Both seeding and registration are idempotent.

## License

Software code is MIT-licensed. Rules data is governed by the ORC License. See `LICENSE` and `ORC_NOTICE.md`.
