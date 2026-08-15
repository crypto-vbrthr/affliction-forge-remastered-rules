# Changelog

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
