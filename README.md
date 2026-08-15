# Affliction Forge: Remastered Rules Library

Version **0.1.9** begins the reviewed **GM curse catalog** and retains the complete 14-entry GM disease catalog. It requires **PF2E Affliction Forge 0.1.55+**.

## Current scope

- one external provider
- one visible, read-only Affliction Forge library
- four internal PF2e Item compendium packs
- required dependency on **PF2E Affliction Forge 0.1.55+**
- complete reviewed GM disease catalog
- reviewed inventory of all 16 GM Core curses
- first fully supported GM curse published
- ORC notice and upstream attribution
- mechanics-only content policy
- per-entry license/review metadata contract
- deterministic stable Item IDs for compiled pack content
- GM-only idempotent runtime bootstrap for development installs with uncompiled packs
- Node validation/tests for provider wiring, manifest structure, content gates, restrictions, persistence, periodic effects, numeric modifiers, event reactions, and pre-action gates

## GM disease catalog

All **14/14 reviewed GM diseases** are published.

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

The three manual-exception templates still automate their ordinary staged conditions, saves, virulent progression, and supported event reactions. Unsupported rules are shown directly in the user-facing description and affected stages as **GM-Hinweis** text. No bespoke environment, confusion-behavior, or body-part subsystem is added only for these entries.

## GM curse catalog: first pass

GM Core presents curses differently from most diseases: they usually apply a single lasting effect after a failed save, and many are removed only by a specific action or condition rather than normal stage recovery. The external narrative/world trigger is therefore **not** treated as an Affliction Forge blocker. Applying a curse template means that its trigger has already occurred.

All **16 GM Core curses** have been reviewed for the 0.1.55 runtime contract.

### Published FULL: 1/16

- **Feindselige Erde** (`Reviling Earth` mechanics), level 12. Fortitude DC 30; failure applies Doomed 1, critical failure Doomed 2. The geographical trigger remains GM/world context.

### Reviewed, inventory-only: 15/16

The remaining curses currently require mechanics that are broader than a single curse template, including rest-system overrides, dynamic skill-proficiency changes, turn-start choices, starvation/thirst integration, source-relative damage, promise or theft tracking, initiative/death triggers, third-party hostility, or undead spawning.

They remain in `inventory/gm-core-curses.json` until a genuinely reusable engine contract exists. We do **not** add bespoke one-off subsystems merely to force a curse into FULL automation. Later, where partial automation is useful and the missing rule is clearly explainable, a curse may instead ship as an explicit manual-exception template with a visible GM note.

## Tuberkulose coverage

Tuberkulose uses Affliction Forge 0.1.55 pre-action gates. Stage 2 requires a flat check against DC 5 before matching `concentrate` spell casts or item activations; Stage 3 raises this to DC 15 and also locks recovery from `fatigued`. The gate runs before supported PF2e workflows spend their resource. Carrier status is descriptive/transmission metadata and does not automatically spread the disease.

## Manual-exception policy

- **Knochenfrost:** staged clumsy/paralyzed effects and active typed cold-healing locks are automated. Environmental cold severity changes remain GM-managed. If the disease falls back to Stage 1 after reaching Stage 2+, the already-acquired cold-damage healing restriction must also be carried manually until recovery.
- **Hirnwürmer:** virulent progression and damage-triggered Will saves are automated. Confusion-driven bite replacement and the Stage 4 exception that damage does not end `confused` remain GM-managed.
- **Bluthand:** ordinary stage conditions, virulent progression, and death are automated. The infected hand, hand-use bleed trigger, hand usability/permanent loss, Stage 5 confusion exception, and optional amputation cure remain GM-managed.

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
5. Keep reviewed-but-unpublished entries in inventory files with explicit blocker categories rather than weakening their rules.
6. Run `npm test` and `npm run validate`.
7. Run `npm run prepare:packs` and `npm run generate:seed`.
8. Compile prepared Item JSON with the official Foundry VTT CLI into LevelDB packs for release builds. Until a pack is precompiled, the GM-only runtime bootstrap inserts missing bundled entries once and relocks the pack.

Source JSON filenames are language-neutral and match the final stable definition-ID segment. User-facing localization is never encoded in filenames or stable IDs.

## Runtime registration

The module listens for `pf2eAfflictionForgeReady`, ensures bundled reviewed content exists in the declared module packs, and then registers a read-only provider library backed by all four packs. A `ready` fallback protects unusual load ordering. Both seeding and registration are idempotent.

## License

Software code is MIT-licensed. Rules data is governed by the ORC License. See `LICENSE` and `ORC_NOTICE.md`.
