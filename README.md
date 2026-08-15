# Affliction Forge: Remastered Rules Library

Version **0.1.8** completes the reviewed GM disease catalog and requires **PF2E Affliction Forge 0.1.55+**.

## Current scope

- one external provider
- one visible, read-only Affliction Forge library
- four internal PF2e Item compendium packs
- required dependency on **PF2E Affliction Forge 0.1.55+**
- ORC notice and upstream attribution
- mechanics-only content policy
- per-entry license/review metadata contract
- deterministic stable Item IDs for compiled pack content
- GM-only idempotent runtime bootstrap for development installs with uncompiled packs
- Node validation/tests for provider wiring, manifest structure, content gates, restrictions, persistence, periodic effects, numeric modifiers, event reactions, and pre-action gates

## GM disease catalog

**0.1.8 publishes all 14 reviewed GM diseases:**

### Fully automated: 11/14

- **Sumpffäule** (`Bog Rot` mechanics)
- **Scharlachfieber** (`Scarlet Fever` mechanics)
- **Tetanus**
- **Tuberkulose** (`Tuberculosis` mechanics)
- **Malaria**
- **Beulenpest** (`Bubonic Plague` mechanics)
- **Karmesin-Lepra** (`Scarlet Leprosy` mechanics)
- **Erstickungsseuche** (`Choking Death` mechanics)
- **Blindfieber** (`Blinding Sickness` mechanics)
- **Kanalisationsdunst** (`Sewer Haze` mechanics)
- **Albtraumfieber** (`Nightmare Fever` mechanics)

### Intentional manual exceptions: 3/14

- **Knochenfrost** (`Bonechill` mechanics)
- **Hirnwürmer** (`Brain Worms` mechanics)
- **Bluthand** (`Crimson Ooze` mechanics)

The three manual-exception templates still automate their ordinary staged conditions, saves, virulent progression, and supported event reactions. Their unsupported rules are shown directly in the user-facing description and affected stage descriptions as **GM-Hinweis** text. No bespoke environment, confusion-behavior, or body-part subsystem is added just for these entries.

## Tuberkulose coverage

Tuberkulose uses Affliction Forge 0.1.55 pre-action gates. Stage 2 requires a flat check against DC 5 before matching `concentrate` spell casts or item activations; Stage 3 raises this to DC 15 and also locks recovery from `fatigued`. The gate runs before the supported PF2e workflows spend their resource. Carrier status is descriptive/transmission metadata and does not automatically spread the disease.

## Manual-exception policy

- **Knochenfrost:** staged clumsy/paralyzed effects and active typed cold-healing locks are automated. Environmental cold severity changes remain GM-managed. If the disease falls back to Stage 1 after reaching Stage 2+, the already-acquired cold-damage healing restriction must also be carried manually until recovery.
- **Hirnwürmer:** virulent progression and damage-triggered Will saves are automated. Confusion-driven bite replacement and the Stage 4 exception that damage does not end `confused` remain GM-managed.
- **Bluthand:** ordinary stage conditions, virulent progression, and death are automated. The infected hand, hand-use bleed trigger, hand usability/permanent loss, Stage 5 confusion exception, and the optional amputation cure remain GM-managed.

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

## Content workflow

1. Extract only functional rules material from an approved ORC source.
2. Independently formulate German user-facing mechanics text.
3. Remove or replace Reserved Material, including setting-specific proper nouns.
4. Mark faithful entries as `automationStatus: "full"`; use `automationStatus: "manual"` only for intentional exceptions with a visible `GM-Hinweis` and structured `metadata.manualComment`.
5. Run `npm test` and `npm run validate`.
6. Run `npm run prepare:packs` and `npm run generate:seed`.
7. Compile prepared Item JSON with the official Foundry VTT CLI into LevelDB packs for release builds. Until a pack is precompiled, the GM-only runtime bootstrap inserts missing bundled entries once and relocks the pack.

Source JSON filenames are language-neutral and match the final stable definition-ID segment. User-facing localization is never encoded in filenames or stable IDs.

## Runtime registration

The module listens for `pf2eAfflictionForgeReady`, ensures bundled reviewed content exists in the declared module packs, and then registers a read-only provider library backed by all four packs. A `ready` fallback protects unusual load ordering. Both seeding and registration are idempotent.

## License

Software code is MIT-licensed. Rules data is governed by the ORC License. See `LICENSE` and `ORC_NOTICE.md`.
