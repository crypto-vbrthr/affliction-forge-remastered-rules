# Changelog

## 0.1.1 - 2026-08-15

### Added

- First reviewed rules entry in the GM source pack: **Kanalisationsdunst**, an independently named German presentation of the ORC-licensed `Sewer Haze` mechanics.
- Complete 14-entry GM disease coverage inventory with explicit `full` vs. `partial` automation status and blocker reasons.
- Idempotent GM-only runtime pack bootstrap for development/test installs whose LevelDB packs have not yet been precompiled. The bootstrap unlocks only the affected module pack, inserts missing deterministic IDs, and restores the prior lock state.
- Generated runtime seed artifact and tests for missing-content insertion, idempotency, and non-GM safety.
- Official CLI pack-source `_key` generation (`!items!<id>`), kept separate from runtime Document sources.

### Content review

- Only one of the 14 GM diseases qualifies as `automationStatus: full` under the current strict policy. The other 13 remain unshipped because their rules require mechanics such as condition-reduction locks, speech restrictions, triggered secondary saves, permanent consequences, special healing restrictions, or timed sub-effects that Affliction Forge 0.1.47 does not yet model completely.
- Malaria recurrence remains a manual reapplication note rather than a new long-term scheduler feature.

### Validation

- 22/22 module tests green.
- Content validation: 1/1 publishable definition green.
- The shipped definition also passes Affliction Forge 0.1.47 schema validation with no warnings.

## 0.1.0 - 2026-08-15

### Added

- Initial external-library add-on module scaffold.
- One Affliction Forge provider and one read-only logical library.
- Four source-pack declarations for the Remastered core/player/GM/treasure rules sets.
- ORC notice and upstream attribution for the four approved source works.
- Conservative mechanics-only content policy and Reserved Material review gate.
- Build-time content validator with stable ID, source, automation, translation, and license-review checks.
- Deterministic 16-character Foundry Item ID generation from stable Affliction definition IDs.
- Pack-source preparation tool mirroring the Affliction Forge 0.1.47 template Item wrapper.
- Provider/manifest/content-contract tests.

### Content

- No Affliction definitions are shipped in this architecture release.
