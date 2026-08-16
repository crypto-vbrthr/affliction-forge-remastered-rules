# Changelog

## 0.1.16.1

- Hotfix for Howl of the Wild alchemical afflictions not appearing after an in-place upgrade.
- Logical Howl of the Wild content is now hosted in the established supplemental compendium instead of requiring a newly initialized physical pack.
- Provider registration continues to expose the same read-only Remastered Rules library and source metadata still identifies Howl of the Wild correctly.
- Added upgrade regression coverage for the physical-pack/bootstrap distinction.

## 0.1.16 - 2026-08-16

### Added

- New `howl-of-the-wild` source pack and ORC attribution for **Howl of the Wild**.
- Complete **3/3 alchemical poison affliction block** from the source's alchemical-items poison section: **Essence of Mandragora**, **Tatzlwyrm's Gasp**, and **Sportlebore Capsule**.
- German/English localized names, mechanics summaries, stage text, source labels, and the Sportlebore GM exception note.
- Regression coverage for the three-entry source count, delivery types, supported stage mechanics, Sportlebore's non-generic Stage 3 handling, localization, manifest wiring, and the 115-definition runtime seed.

### Automation

- **2/3 FULL**: Essence of Mandragora and Tatzlwyrm's Gasp map entirely to existing 0.1.61 staged poison contracts.
- **1/3 manual exception**: Sportlebore Capsule automates onset and staged conditions, but leaves its Stage 3 DC 23 basic Fortitude damage save, forced Stage 3 → Stage 1 cycle, second-cycle doubled damage, and magic-only condition recovery to the GM. Stage 3 uses `expiryAction: "stay"` to avoid inventing an incorrect normal stage save.

### Coverage

- Existing reviewed core and Treasure Vault content remains unchanged.
- Howl of the Wild alchemical poisons: **3/3 published**.
- Total bundled definitions: **115**.

## 0.1.15 - 2026-08-15

### Added

- Complete **33/33 Treasure Vault Remastered poison catalog** in the previously empty `treasure-vault-remastered` pack.
- German and English localized mechanics for all new names, stage text, source labels, and visible GM exception notes.
- Regression coverage for Treasure Vault count/delivery split, virulent progression, omitted stage intervals, secret-stage save policy, permanent petrification, poison-long Sickened persistence, formula clocks, periodic formula intervals, Reserved-Material neutralization, and runtime seeding.
- Add-on content-contract support for Affliction Forge 0.1.61 formula onset/stage/maximum durations plus `timed` residual persistence and per-component timed residual durations.

### Changed

- Minimum Affliction Forge dependency raised to **0.1.61**.
- Both GM Core and Player Core 2 **Lethargy Poison** variants now use the source **1d4-hour** Stage 4 formula directly and are fully automated instead of carrying a manual timing exception.
- **False Hope** uses secret saves for initial/no-effect-stage checks and public progression checks on damaging stages while preserving the source's interval-less Stage 3.
- **Mustard Powder** and **Taster's Folly** keep Sickened as an affliction-persistent condition and lock its removal until the poison ends.
- Runtime content revision raised to **3** so deterministic documents from 0.1.14 are refreshed without changing their IDs.

### Treasure Vault automation notes

- Fully automated entries: **7/33**.
- Intentional manual-exception entries: **26/33**; supported damage, conditions, delivery, virulent progression, repeated exposure, stage timing, and other generic mechanics remain automated inside those templates.
- Formula stage timings are used for **Gnawbone Toxin (1d4 minutes)**, **Sightless Tincture (2d6 hours)**, and **Stupor Poison (1d6 hours)**.
- **Nightmare Salt** uses formula periodic clocks for its supported 1d4-hour recurring effects; the variable-duration Stage 3 confusion remains an explicit GM exception.
- Source omissions of stage intervals are preserved rather than replaced with invented saves.
- One Reserved-Material proper name is replaced by the neutral display identity **Assassin's Kiss / Kuss des Assassinen**.

### Coverage

- GM diseases: **14/14 published**.
- GM curses: **16/16 published**.
- Player II alchemical poisons: **29/29 published**.
- GM Core alchemical poison variants: **19/19 published**.
- Additional GM Core weapon poison afflictions: **1/1 published**.
- Treasure Vault Remastered poisons: **33/33 published**.
- Total bundled definitions: **112**.

## 0.1.14
- Converted all user-facing bundled content fields to language-neutral `@i18n:` tokens.
- Added complete German and English localization coverage for names, descriptions, stage text, checks, reaction labels, source labels, and GM comments.
- Added a content-revision migration that replaces previously seeded German-only definitions with tokenized definitions while preserving deterministic document IDs.
- Requires Affliction Forge 0.1.60 for per-client provider-content localization.

## 0.1.13 - 2026-08-15

### Added

- **Dolchgift** (`Dagger Venom` mechanics) from the level-5 GM Core weapon activation: Fortitude DC 21, maximum duration 4 rounds, Stage 1 1d8 poison damage and Enfeebled 1.
- Explicit regression coverage for the source's omitted Stage 1 interval: no invented repeat save is scheduled; the single stage persists until the four-round maximum duration expires.
- Coverage metadata distinguishing this weapon-bound poison from the 19 alchemical GM Core / Player Core 2 source variants.

### Coverage

- GM diseases: **14/14 published**.
- GM curses: **16/16 published**.
- Player II alchemical poisons: **29/29 published**.
- GM Core alchemical poison variants: **19/19 published**.
- Additional GM Core weapon poison afflictions: **1/1 published**.
- Total bundled definitions: **79**.

## 0.1.12 - 2026-08-15

### Added

- Complete **19/19 GM Core alchemical poison source-variant catalog** for the same-named poisons also present in Player Core 2.
- Stable GM Core definition identities and shared `variantGroupId` metadata, preserving both official source versions instead of silently overwriting one.
- Explicit GM Core source-work/page metadata for all 19 variants and source-display metadata across existing reviewed content.
- Regression coverage for all eight reviewed GM Core / Player Core 2 mechanical divergences.

### Changed

- All reviewed content carries a human-readable `sourceWorkLabel` in addition to the stable source-work id.
- Minimum Affliction Forge dependency raised to **0.1.58** for source-work/page display in the shared library.

### Coverage

- GM diseases: **14/14 published**.
- GM curses: **16/16 published**.
- Player II alchemical poisons: **29/29 published**.
- GM Core alchemical poison variants: **19/19 published**.
- Total bundled definitions: **78**.

## 0.1.11 - 2026-08-15

### Added

- Complete **29/29 Player Core 2 alchemical poison catalog** as published library content.
- Twelve injury poisons use Affliction Forge 0.1.57 injury delivery metadata.
- Lethargy Poison uses `multipleExposure: "ignore"`, `incapacitation`, and `sleep` traits.
- Native virulent progression for King's Sleep, Black Lotus Extract, and Tears of Death.
- Root condition locks and stage numeric modifiers for poison-specific recovery and movement rules.
- Visible GM guidance for the few source mechanics that remain intentionally non-generic, including variable Stage 4 duration, cross-affliction cure, 24-hour residual condition duration, cumulative Drained, and narrative sleep details.
- Player II poison coverage inventory and regression tests for count, delivery split, repeated exposure, virulent flags, injury metadata, incapacitation, and manual guidance.
- Add-on content contract validation for Affliction Forge 0.1.57 `multipleExposure`.

### Coverage

- GM diseases remain **14/14 published**.
- GM curses remain **16/16 published**.
- Player II alchemical poisons are now **29/29 published**.
- Total bundled definitions: **59**.

### Compatibility

- Minimum Affliction Forge dependency raised to **0.1.57**.


## 0.1.10 - 2026-08-15

### Added

- Completed the **16/16 GM Core curse catalog** as published library content.
- **Fluch des Schlummerns** (`Curse of Slumber` mechanics) as a fully automated 0.1.56 lifecycle curse using finite-stage recovery and damage-triggered reactive recovery.
- Fifteen additional deterministic curse templates beyond the prior single-entry release, including visible GM guidance for intentionally non-generic rules.
- **Söldnerwahn** initiative-trigger automation through `initiative-rolled`; the incapacitation degree adjustment remains an explicit GM exception.
- Automated weekly repeat saves for **Fluch der Gefräßigen** and daily repeat saves for **Unendlicher Durst** while leaving starvation/thirst subsystems external.
- **Grabesfluch** as a variable-level manual exception using an external/dynamic save DC and an explicit technical level placeholder.
- Add-on contract validation for Affliction Forge 0.1.56 lifecycle reaction `controllerActions`, `initiative-rolled` / `turn-start`, and stage `expiryAction`.
- Upgrade-seeding coverage proving 0.1.9 installations receive only the fifteen newly published curse documents.

### Coverage

- GM diseases remain **14/14 published**: 11 FULL and 3 intentional manual exceptions.
- GM curses are now **16/16 published**: 2 FULL and 14 intentional manual exceptions with visible GM guidance.
- No bespoke rest, inventory, body-part, third-party AI, proficiency, deity-relative weakness, promise tracking, or creature-spawning subsystem is introduced only to satisfy individual curses.

### Compatibility

- Minimum Affliction Forge dependency raised to **0.1.56**.

## 0.1.9 - 2026-08-15

### Added

- Complete **16-entry GM Core curse coverage inventory** with explicit generic blocker categories.
- First fully supported GM curse template: **Feindselige Erde** (`Reviling Earth` mechanics), level 12, Fortitude DC 30, applying Doomed 1 on failure and Doomed 2 on critical failure.
- Curse-specific review policy: external narrative/location triggers are treated as application context rather than engine blockers.
- Upgrade-seeding coverage proving a 0.1.8 installation receives only the new deterministic curse document.

### Coverage

- GM disease catalog remains **14/14 published**: 11 FULL and 3 intentional manual exceptions.
- GM curse catalog is **16/16 reviewed**, with **1/16 FULL published** and **15/16 inventory-only** pending reusable runtime contracts or future explicit manual-exception treatment.
- No bespoke rest, inventory, body-part, third-party AI, proficiency, or source-relative weakness subsystem is introduced solely for one curse.

### Compatibility

- Minimum Affliction Forge dependency remains **0.1.55**.

## 0.1.8 - 2026-08-15

### Added

- **Tuberkulose** as the eleventh fully automated GM disease, using Affliction Forge 0.1.55 pre-action concentrate gates (DC 5 in Stage 2, DC 15 in Stage 3) and Stage 3 fatigue locking.
- Published the three intentional manual-exception templates with visible **GM-Hinweis** guidance:
  - **Knochenfrost** (`Bonechill`)
  - **Hirnwürmer** (`Brain Worms`)
  - **Bluthand** (`Crimson Ooze`)
- Manual-exception content-contract support requiring both structured `metadata.manualComment` and visible GM guidance in the template description.
- Add-on contract validation for Affliction Forge 0.1.55 `preActionGates`.

### Coverage

- GM disease catalog is now **14/14 published**.
- **11/14 FULL** and **3/14 intentional manual exceptions**.
- No disease remains in the partial/unpublished state.

### Compatibility

- Minimum Affliction Forge dependency raised to **0.1.55**.

## 0.1.7 - 2026-08-15

### Added

- **Karmesin-Lepra** (`Scarlet Leprosy` mechanics) as the tenth FULL GM disease.
- Stage 2 uses Affliction Forge 0.1.54 `condition-increased` reactions to add one extra point of `wounded` whenever the condition is gained or increased.
- Disease-wide `affliction-damage` healing protection and a Stage 3 complete healing lock.
- Native virulent progression for the two-consecutive-success recovery rule.
- Content-contract validation for 0.1.54 direct condition-event reactions without an auxiliary saving throw.

### Coverage

- GM disease coverage is now **10/14 FULL**, **1/14 partial**, **3/14 intentional manual exceptions**.
- `Tuberculosis` remains the only partial disease pending a generic pre-action/concentrate gate.
- `Bonechill`, `Brain Worms`, and `Crimson Ooze` remain intentional manual exceptions and will receive explicit GM guidance instead of bespoke engine subsystems.

### Compatibility

- Minimum Affliction Forge dependency raised to **0.1.54**.

## 0.1.4 - 2026-08-15

### Changed

- Standardized reviewed content JSON filenames on language-neutral stable keys rather than German display names.
- Renamed `albtraumfieber.json` → `nightmare-fever.json`, `erstickungsseuche.json` → `choking-death.json`, `kanalisationsdunst.json` → `sewer-haze.json`, and `scharlachfieber.json` → `scarlet-fever.json`.
- `malaria.json` and `tetanus.json` already matched their stable language-neutral keys and remain unchanged.
- User-facing German names and all deterministic definition/document IDs remain unchanged, so existing seeded compendium entries are not duplicated or migrated.
- Content validation now rejects a JSON filename that does not match the final segment of its stable definition ID.

### Validation

- No rules-content changes.
- Six GM disease definitions remain publishable.
- **36/36 module tests green**; content validation **6/6 green**; pack-source and runtime-seed generation complete.

## 0.1.3 - 2026-08-15

### Added

- **Albtraumfieber** (`Nightmare Fever` mechanics) as the first library disease using Affliction Forge 0.1.50 event reactions.
- Stage 3 reacts to positive slashing damage with a Will save against the disease DC and applies Frightened 2 on a failed result.
- Stage 4 reacts in the same way and applies Paralyzed for 1 round on a failed result.
- Native `affliction-damage` healing restriction and a fatigue condition lock preserve the disease's recovery restrictions.
- Content-contract validation for `damage-taken` reactions, referenced checks, result filters, and reaction effect envelopes.

### Coverage review

- The GM disease pack now contains **6/14 FULL** entries.
- `Brain Worms` is **not** promoted to FULL yet. Affliction Forge 0.1.50 covers its damage-triggered Will saves, but the disease also rewrites attacks made due to Confused into bites and later prevents damage from ending Confused. Those two mechanics still need generic engine support.
- The published slashing-damage form of Nightmare Fever is the bundled definition. The optional bludgeoning/piercing variants can be created from an editable copy.

### Validation

- **34/34 module tests green** and content validation **6/6 green**.
- Upgrade seeding tests cover 0.1.1 → 0.1.3 and 0.1.2 → 0.1.3 without duplicating deterministic documents.
- Minimum Affliction Forge dependency raised to **0.1.50**.

## 0.1.2 - 2026-08-15

### Added

- Four additional reviewed GM disease definitions enabled by Affliction Forge 0.1.49:
  - **Scharlachfieber** (`Scarlet Fever` mechanics)
  - **Tetanus**
  - **Malaria**
  - **Erstickungsseuche** (`Choking Death` mechanics)
- Native use of Affliction Forge condition locks for diseases whose sickened condition cannot be reduced normally.
- Native use of the `speak` capability restriction for disease stages that prevent speech.
- Direct lethal final stages through the Critical Forge-backed instant `death` component.
- Explicit Malaria recurrence policy: later recurrence is represented by reapplying the same definition instead of retaining a dormant controller.
- Content-contract coverage for 0.1.49 restrictions and stage effect-persistence fields.

### Coverage review

- The GM disease pack now contains **5/14 FULL** entries.
- `Blinding Sickness` remains partial: Affliction Forge 0.1.49 can preserve an entire stage effect permanently, but its Stage 4 needs only blindness to persist while the simultaneous enfeebled condition remains stage-bound.
- `Bubonic Plague` still needs a repeating random sub-timer.
- `Scarlet Leprosy` still needs a wounded-value trigger.
- `Tuberculosis`, `Nightmare Fever`, and `Brain Worms` still need event-triggered check support.
- `Bonechill` still needs damage-type-wide healing restrictions and environment severity modification.

### Validation

- 30/30 module tests green.
- Content validation: 5/5 publishable definitions green.
- Upgrade seeding test confirms a 0.1.1 installation keeps its existing Sewer Haze entry and receives only the four new deterministic documents.

## 0.1.1 - 2026-08-15

### Added

- First reviewed rules entry in the GM source pack: **Kanalisationsdunst**, an independently named German presentation of the ORC-licensed `Sewer Haze` mechanics.
- Complete 14-entry GM disease coverage inventory with explicit `full` vs. `partial` automation status and blocker reasons.
- Idempotent GM-only runtime pack bootstrap for development/test installs whose LevelDB packs have not yet been precompiled. The bootstrap unlocks only the affected module pack, inserts missing deterministic IDs, and restores the prior lock state.
- Generated runtime seed artifact and tests for missing-content insertion, idempotency, and non-GM safety.
- Official CLI pack-source `_key` generation (`!items!<id>`), kept separate from runtime Document sources.

### Content review

- Only one of the 14 GM diseases qualified as `automationStatus: full` under the 0.1.47 strict policy.
- Malaria recurrence remains a manual reapplication note rather than a new long-term scheduler feature.

## 0.1.0 - 2026-08-15

### Added

- Initial external-library add-on module scaffold.
- One Affliction Forge provider and one read-only logical library.
- Four source-pack declarations for the Remastered core/player/GM/treasure rules sets.
- ORC notice and upstream attribution for the four approved source works.
- Conservative mechanics-only content policy and Reserved Material review gate.
- Build-time content validator with stable ID, source, automation, translation, and license-review checks.
- Deterministic 16-character Foundry Item ID generation from stable Affliction definition IDs.
- Pack-source preparation tool mirroring the Affliction Forge template Item wrapper.
- Provider/manifest/content-contract tests.

### Content

- No Affliction definitions were shipped in this architecture release.
