# Affliction Forge: Remastered Rules Library

Version **0.1.6** expands the reviewed GM disease pack to nine fully automated entries and requires **PF2E Affliction Forge 0.1.53+**.

## Current scope

- one external provider
- one visible, read-only Affliction Forge library
- four internal PF2e Item compendium packs
- ORC notice and upstream attribution
- mechanics-only content policy
- stable language-neutral definition IDs and JSON filenames
- deterministic Foundry Item IDs
- GM-only idempotent bootstrap for development installs with uncompiled packs
- content-contract validation for restrictions, reactions, component persistence, typed healing locks, numeric modifiers, and periodic stage effects

## GM disease coverage

**Nine of fourteen reviewed GM diseases currently ship as FULL:**

- **Sumpffäule** (`Bog Rot` mechanics)
- **Scharlachfieber** (`Scarlet Fever` mechanics)
- **Tetanus**
- **Malaria**
- **Beulenpest** (`Bubonic Plague` mechanics)
- **Erstickungsseuche** (`Choking Death` mechanics)
- **Blindfieber** (`Blinding Sickness` mechanics)
- **Kanalisationsdunst** (`Sewer Haze` mechanics)
- **Albtraumfieber** (`Nightmare Fever` mechanics)

Sumpffäule uses Affliction Forge numeric PF2e modifiers for its phase-dependent movement penalties. Beulenpest uses a formula-based periodic stage effect for its recurring `1d20`-minute persistent bleed effect.

Two diseases remain **partial** because a reusable engine feature is still worthwhile:

- **Tuberculosis**: pre-action check for concentrate spells/item activations
- **Scarlet Leprosy**: reaction to gaining/increasing Wounded

Three diseases are intentionally classified as **manual exceptions**, rather than reasons to grow specialized engine subsystems:

- **Bonechill**: cold-environment severity is one step worse in later stages
- **Brain Worms**: confusion-forced attacks become bites and later damage does not end Confused
- **Crimson Ooze**: infected-hand use/usability/permanent loss plus the late Confused exception

Their inventory records carry explicit GM comments. When these entries are later published as partially automated templates, those comments must remain visible rather than being hidden behind approximated automation.

## Manual-rule policy

A source rule does not automatically justify a new generic Affliction Forge subsystem. If a mechanic is narrow, invasive, or depends on concepts Foundry/PF2e does not model generically, the library may preserve the automatable core and surface the remaining rule as a GM comment.

Examples:

- Malaria recurrence is handled by reapplying the same definition when recurrence occurs.
- Sumpffäule's alternate cure by amputation is a manual cure option.
- The three manual exceptions above do not drive environment, body-part, or confusion-behavior subsystems.

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

The four compendium packs are internal source partitions. Affliction Forge sees them as one provider library.

## Content and licensing policy

The module does not use Paizo branding, compatibility logos, artwork, trade dress, or setting prose. Rules entries contain only the functional mechanics needed by Affliction Forge plus independently formulated German mechanics text. Exact upstream product titles appear only where required for ORC attribution in `ORC_NOTICE.md`.

Source JSON filenames are language-neutral and match the final stable definition-ID segment, for example `bubonic-plague.json` for `affliction-forge-remastered-rules.gm-core.bubonic-plague`.

## Content workflow

1. Extract only functional rules material from an approved ORC source.
2. Independently formulate German user-facing mechanics text.
3. Remove or replace Reserved Material.
4. Classify the entry as `full`, `partial`, or intentional `manual` in the coverage inventory.
5. Ship only definitions that satisfy the current release policy.
6. Run `npm test` and `npm run validate`.
7. Run `npm run prepare:packs` and `npm run generate:seed`.
8. Compile prepared Item JSON with the Foundry VTT pack tooling for release builds. Until a pack is precompiled, the GM-only runtime bootstrap inserts missing deterministic IDs once and relocks the pack.

See `docs/CONTENT_POLICY.md`, `docs/ADDING_CONTENT.md`, and `docs/BUILDING_PACKS.md`.

## License

Software code is MIT-licensed. Rules data is governed by the ORC License. See `LICENSE` and `ORC_NOTICE.md`.
