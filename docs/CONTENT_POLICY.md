# Content and License Policy

This module is intentionally conservative. It is a software library provider plus ORC-licensed game-mechanics data, not a reproduction of any source book.

## Release gates for every Affliction entry

1. Use the English ORC-licensed rules source as the mechanics source.
2. Store only mechanics required by the Affliction Forge data/runtime model.
3. Write the German wording independently; do not copy longer prose from a localized edition.
4. Do not ship book artwork, logos, proprietary fonts, layout, trade dress, lore paragraphs, dialogue, plots, or setting descriptions.
5. Review names separately. Proper nouns, deity/character/place/organization names, and names derived from them are blocked or replaced by a neutral original name.
6. Every entry must identify one of the four approved upstream source works through a neutral `sourceWorkId` and must carry `license: "ORC"`.
7. Every entry must pass `licenseReview.mechanicsOnly`, `licenseReview.reservedMaterial`, and `licenseReview.nameReview` before it can be compiled.
8. Entries that Affliction Forge 0.1.55 can faithfully automate ship as `automationStatus: "full"`. Intentional exceptions may ship as `automationStatus: "manual"` when adding a generic subsystem would be disproportionate. Manual exceptions must carry both a structured `metadata.manualComment` and a visible `GM-Hinweis` in the template description; supported portions should still be automated.
9. Same-name source variants remain separate definitions with separate stable IDs. The library must not silently decide that one source supersedes another.

## Automated guard

`npm run validate` scans all source definitions, enforces the required metadata and stable-ID policy, and rejects a small list of known Reserved Material / branding terms in user-facing Affliction text. This guard is deliberately not treated as a substitute for human review.

See `ORC_NOTICE.md` for upstream attribution and `LICENSE` for the split between software code and game-content licensing.
