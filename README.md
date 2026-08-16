# Affliction Forge: Remastered Rules Library

Version **0.1.15** publishes the complete reviewed **Treasure Vault Remastered poison catalog** with **33/33** afflictions. It also upgrades both existing **Lethargiegift / Lethargy Poison** source variants to Affliction Forge 0.1.61 formula timing. The library now contains **112 deterministic definitions** and requires **PF2E Affliction Forge 0.1.61+**.

## Current scope

- one external provider
- one visible, read-only Affliction Forge library
- four internal PF2e Item compendium packs
- required dependency on **PF2E Affliction Forge 0.1.61+**
- complete reviewed **14-entry GM disease catalog**
- complete reviewed **16-entry GM curse catalog**
- complete reviewed **29-entry Player II alchemical poison catalog**
- complete reviewed **19-entry GM Core alchemical poison source-variant catalog** plus **Dagger Venom** from the Serpent Dagger item
- complete reviewed **33-entry Treasure Vault Remastered poison catalog**
- **112 bundled affliction definitions** total
- ORC notice and upstream attribution
- mechanics-only content policy
- per-entry license/review metadata contract
- deterministic stable Item IDs for compiled pack content
- GM-only idempotent runtime bootstrap for development installs with uncompiled packs
- Node validation/tests for provider wiring, manifest structure, content gates, restrictions, persistence, periodic effects, numeric modifiers, event reactions, pre-action gates, lifecycle reactions, stage-expiry actions, formula timings, and timed residual persistence

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

The three manual-exception disease templates automate their ordinary staged conditions, saves, virulent progression, and supported event reactions. Unsupported rules are shown directly as **GM-Hinweis** text rather than forcing environment, confusion-behavior, or body-part subsystems into the core engine.

## GM curse catalog

All **16/16 reviewed GM Core curses** are published.

GM Core curses usually apply one lasting post-trigger effect and often depend on removal conditions or world events rather than normal stage progression. Applying a curse template means its external narrative/world trigger has already occurred.

### Fully automated: 2/16

- **Feindselige Erde** (`Reviling Earth` mechanics): Fortitude DC 30; failure applies Doomed 1, critical failure Doomed 2.
- **Fluch des Schlummerns** (`Curse of Slumber` mechanics): Fortitude DC 28; failure sleeps for 1 round and recovers automatically, critical failure sleeps indefinitely; damage triggers a new save and success recovers the controller.

### Intentional manual exceptions: 14/16

The other curses are shipped as usable curse markers with every safely reusable mechanic automated and a visible **GM-Hinweis** for the remaining rule.

Notable partial automation includes:

- **Söldnerwahn**: initiative changes automatically trigger the Will save and apply Confused for 1 round on failure. The source marks this auxiliary effect as **incapacitation**, so degree adjustment remains GM-managed until Affliction Forge has a generic source-level incapacitation contract.
- **Fluch der Gefräßigen**: weekly recovery saves are scheduled automatically; starvation effects remain under the normal survival rules.
- **Unendlicher Durst**: daily recovery saves are scheduled automatically; thirst/dehydration effects remain under the normal survival rules.
- **Grabesfluch**: uses an external/dynamic Will DC because its source level varies. Nightly/graveyard flat checks and temporary undead remain GM-managed. Level 0 in the template is only a technical placeholder for the variable source level.

Other manual-exception curses intentionally leave rest overrides, dynamic skill-rank mutation, perception/identity overlays, turn-start player choices, source-relative damage, promise/theft tracking, death transformation, third-party animal hostility, body-part removal, deity-relative weaknesses, or temporary creature spawning to the GM. Those mechanics are too specific to justify one-off Affliction Forge subsystems.


## Player II alchemical poison catalog

All **29/29 reviewed alchemical poisons** are published. Delivery metadata distinguishes **12 injury**, **9 ingested**, **6 contact**, and **2 inhaled** poisons. Affliction Forge 0.1.57 supplies repeated-exposure handling, injury-poison slashing/piercing delivery rules, one injury poison per host, and incapacitation save adjustment.

Most entries are fully automated. One user-facing poison name is deliberately neutralized as a Reserved-Material precaution. The following source-specific rules remain visible **GM-Hinweis** exceptions rather than one-off engine subsystems:

- **Eisenhut**: surviving Stage 3 can remove lycanthropy; cross-affliction cure remains manual.
- **Grauschattierung**: Enfeebled lasts 24 hours; the condition is preserved beyond poison recovery and must be removed by the GM after 24 hours.
- **Königsschlaf**: Drained is cumulative on every failed save; removal is locked while the poison persists, but extra cumulative increments remain GM-managed.
- **Schlummerwein**: poison-induced unconsciousness is locked; no-food/no-drink and corpse-like presentation remain narrative/GM rules.

**Lethargiegift** is now fully automated under Affliction Forge 0.1.61: Stage 4 rolls and persists its source **1d4-hour** stage duration, while repeated exposure remains ignored and the sleep/incapacitation rules continue to use the shared engine contracts.

## Treasure Vault Remastered poison catalog

All **33/33 reviewed poisons** from the Treasure Vault Remastered poison section are published. The delivery split is **20 injury**, **5 contact**, **5 ingested**, and **3 inhaled** poisons. Seven entries are fully automated with the current reusable engine contracts; the remaining twenty-six still automate every safe generic portion while surfacing source-specific exceptions as localized **GM-Hinweis / GM Note** text.

### Fully automated: 7/33

- **Blaues Libellengift** (`Blue Dragonfly Poison` mechanics)
- **Falsche Hoffnung** (`False Hope` mechanics), including secret no-effect-stage saves and its deliberately omitted Stage 3 interval
- **Gorgonenatem** (`Gorgon's Breath` mechanics), including permanent final petrification
- **Speerfroschgift** (`Spear Frog Poison` mechanics)
- **Stuporgift** (`Stupor Poison` mechanics), including `multipleExposure: "ignore"` and a formula-based **1d6-hour** Stage 4
- **Vorkosters Torheit** (`Taster's Folly` mechanics), including Sickened persistence/locking until the poison ends
- **Veilchengift** (`Violet Venom` mechanics)

### 0.1.61 timing and persistence use

Treasure Vault is the first source pack in this library to rely directly on Affliction Forge 0.1.61 formula clocks. **Gnawbone Toxin** uses a **1d4-minute** Stage 3, **Sightless Tincture** uses **2d6 hours**, and **Stupor Poison** uses **1d6 hours**. **Nightmare Salt** uses rerolled **1d4-hour** periodic intervals where the source effect duration itself is fixed. The add-on validator now mirrors the core `stage | affliction | permanent | timed` persistence contract and accepts fixed or formula residual durations.

Several Treasure Vault poisons intentionally omit one or more stage intervals. Those omissions are preserved instead of silently inventing repeat saves. Examples include **Blisterwort**, **Breathtaking Vapor**, **False Hope Stage 3**, **Gorgon's Breath Stage 4**, and **Smother Shroud Stage 3**. Repeated poison exposure can still change stages where the shared poison rules allow it, and maximum duration still ends the active poison.

The larger manual-exception group mainly covers mechanics that would otherwise demand one-off subsystems: target-type-dependent damage, dynamic save-DC changes, forced/random movement, action-trait gates not covered by the shared capability API, lie detection, corpse behavior, conditional healing, inventory/Bulk changes, splash propagation from persistent damage, special identification thresholds, and conditional post-poison residuals. Those rules remain visible rather than being approximated incorrectly.

One source proper name is deliberately replaced by the neutral localized display name **Kuss des Assassinen / Assassin's Kiss** to keep Reserved Material out of the distributed rules data.

## GM Core alchemical poison variants

All **19/19 GM Core alchemical poisons that share a name with Player Core 2 poisons** are now published as separate source variants. They retain their own stable `gm-core.*` definition IDs and `poison.<slug>` variant-group metadata; no Player Core 2 entry is overwritten.

Eight same-named poisons have source-specific mechanical differences that are preserved explicitly: **Arsen, Faulbrandharz, Knollenblätterpilzpulver, Riesentausendfüßlergift, Schierling, Schwarzer Lotusextrakt, Schwarzviperngift,** and **Schwefelschwaden**. The remaining eleven retain the GM Core source identity even where the reviewed mechanics match the Player Core 2 version.

Every reviewed definition now supplies `metadata.sourceWorkLabel` and `metadata.sourcePage` where available. Affliction Forge 0.1.61 renders this source line separately from the common Remastered library label, so duplicate names remain unambiguous without changing user-facing affliction names.

### Additional GM Core poison affliction

- **Dolchgift** (`Dagger Venom` mechanics) is published from the level-5 weapon activation in GM Core: Fortitude DC 21, maximum duration 4 rounds, Stage 1 deals 1d8 poison damage and applies Enfeebled 1. The source gives Stage 1 no interval, so the template does not invent repeat stage saves; Stage 1 remains active until the four-round maximum duration ends. It is not tagged as a standard injury poison because the source item injects it through its own activation rather than by coating a weapon.

## Content workflow

1. Extract only functional rules material from an approved ORC source.
2. Independently formulate user-facing mechanics text and maintain German and English locale entries.
3. Remove or replace Reserved Material, including setting-specific proper nouns.
4. Mark faithful entries as `automationStatus: "full"`; use `automationStatus: "manual"` only for intentional exceptions with a visible `GM-Hinweis` and structured `metadata.manualComment`.
5. Prefer partial use of existing generic mechanics over bespoke one-entry runtime hooks.
6. Run `npm test` and `npm run validate`.
7. Run `npm run prepare:packs` and `npm run generate:seed`.
8. Compile prepared Item JSON with the official Foundry VTT CLI into LevelDB packs for release builds. Until a pack is precompiled, the GM-only runtime bootstrap inserts missing bundled entries once and relocks the pack.

Source JSON filenames and definition IDs are language-neutral. Every user-facing content field is stored as an `@i18n:` token and resolved by Affliction Forge 0.1.61+ from this module’s German or English locale. Stable IDs never change with the selected Foundry language.

## Runtime registration

The module listens for `pf2eAfflictionForgeReady`, ensures bundled reviewed content exists in the declared module packs, and then registers a read-only provider library backed by all four packs. A `ready` fallback protects unusual load ordering. Both seeding and registration are idempotent.

## License

Software code is MIT-licensed. Rules data is governed by the ORC License. See `LICENSE` and `ORC_NOTICE.md`.


## Localization

Bundled definitions do not store German or English display text directly. Names, descriptions, stage text, check/reaction labels, source labels, and visible GM comments use `@i18n:` tokens. `lang/de.json` and `lang/en.json` provide the localized text. Affliction Forge 0.1.61+ resolves these tokens per client when listing, opening, or applying provider content.

Version 0.1.15 keeps those stable localized IDs, adds the Treasure Vault pack, and bumps the content revision so existing 0.1.14 installations receive both the new pack and the 0.1.61 timing upgrades automatically.
