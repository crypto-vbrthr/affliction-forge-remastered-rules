# Affliction Forge: Remastered Rules Library

Version **0.1.17** adds the second **Howl of the Wild** source block: all **9 staged creature afflictions** from the menagerie creature stat blocks. Eight are fully automated with the current generic contracts; **Sky Fisher Venom** keeps only its Stage 1 whisper-only speech restriction as a visible GM exception. Together with the existing three alchemical poisons, the Howl source now contains **12 definitions**. The library now contains **124 deterministic definitions** and requires **PF2E Affliction Forge 0.1.61+**.

## Current scope

- one external provider
- one visible, read-only Affliction Forge library
- four physical PF2e Item compendium packs hosting five logical source packs
- required dependency on **PF2E Affliction Forge 0.1.61+**
- complete reviewed **14-entry GM disease catalog**
- complete reviewed **16-entry GM curse catalog**
- complete reviewed **29-entry Player II alchemical poison catalog**
- complete reviewed **19-entry GM Core alchemical poison source-variant catalog** plus **Dagger Venom** from the Serpent Dagger item
- complete reviewed **33-entry Treasure Vault Remastered poison catalog**
- reviewed **3-entry Howl of the Wild alchemical poison catalog**
- complete reviewed **9-entry Howl of the Wild creature-affliction catalog**
- **124 bundled affliction definitions** total
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


## Howl of the Wild alchemical poison catalog

All **3/3 alchemical poisons** from the alchemical-items poison section are published from source page 111. The source contains one injury, one inhaled, and one ingested poison.

### Fully automated: 2/3

- **Alraunenessenz** (`Essence of Mandragora` mechanics): injury poison, level 4, Fortitude DC 21, three one-round stages with poison damage, Stupefied, and Confused.
- **Tatzelwurmodem** (`Tatzlwyrm's Gasp` mechanics): inhaled poison, level 2, Fortitude DC 15, three one-round stages with Sickened, poison damage, and Enfeebled.

### Intentional manual exception: 1/3

- **Wegzehrerkapsel** (`Sportlebore Capsule` mechanics): onset and ordinary stage conditions are automated. Stage 3's separate DC 23 basic Fortitude save against bludgeoning damage is not approximated as automatic damage; its forced Stage 3 → Stage 1 cycle, doubled damage on the second Stage 3, and magic-only recovery from its Sickened/Enfeebled conditions remain visible **GM-Hinweis / GM Note** rules. Stage 3 uses `expiryAction: "stay"` so the engine does not invent an incorrect ordinary progression save before the GM performs the source-specific cycle.


## Howl of the Wild creature-affliction catalog

All **9/9 staged creature afflictions** from the menagerie stat blocks are published. Where a creature affliction does not print a separate level, the template uses the causing creature's level, matching the general affliction format rules. These creature poisons are **not** marked as alchemical injury poisons, even when a creature delivers them with a Strike, so they cannot accidentally enter the weapon-coating/charge workflow.

### Fully automated: 8/9

- **Königsbasiliskengift** (`Royal Basilisk Venom`), level 13, Fortitude DC 36.
- **Steinfischgift** (`Stonefish Venom`), level 0, Fortitude DC 16.
- **Steinfischschwarmgift** (`Stonefish Swarm Venom`), level 2, Fortitude DC 18.
- **Kupferkopfgift** (`Coppermouth Venom`), level 7, Fortitude DC 25, including poison/electricity damage. Its printed Stage 3 has no interval; the template preserves that omission rather than inventing another save.
- **Berührung der Sonne** (`Sun's Touch`), level 14, Fortitude DC 34.
- **Stachelgift** (`Spiny Venom`), level 8, Fortitude DC 26 and incapacitation. The printed stat block gives no stage intervals; those omissions are preserved, while the six-round maximum duration remains authoritative.
- **Mantikorgift** (`Manticore Venom`), level 12, Fortitude DC 32.
- **Gift der Weinenden Zikade** (`Crying Cicada Poison`), level 3, Fortitude DC 19 and inhaled.

### Intentional manual exception: 1/9

- **Himmelsfischergift** (`Sky Fisher Venom`), level 11, Fortitude DC 25. Damage, Clumsy, Stage 2's complete speaking prohibition, and Stage 3 paralysis are automated. Stage 1 allows whispering but forbids louder speech; the current capability contract is binary and therefore leaves only this graded speech restriction as a localized **GM-Hinweis / GM Note**.

The creature review also records poison- or disease-trait abilities that are **not staged afflictions** and therefore are intentionally not converted into templates, including Chimera Rot, Chimera Venom, Soporific Spores, Choking Fumes, Abysium, Stinging Anemones, and Full Bloom. This keeps the library focused on actual affliction stat blocks instead of forcing ordinary save riders or direct poison effects into the staged engine.

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

The module listens for `pf2eAfflictionForgeReady`, ensures bundled reviewed content exists in the declared module packs, and then registers a read-only provider library backed by the four physical packs. A `ready` fallback protects unusual load ordering. Both seeding and registration are idempotent.

## License

Software code is MIT-licensed. Rules data is governed by the ORC License. See `LICENSE` and `ORC_NOTICE.md`.


## Localization

Bundled definitions do not store German or English display text directly. Names, descriptions, stage text, check/reaction labels, source labels, and visible GM comments use `@i18n:` tokens. `lang/de.json` and `lang/en.json` provide the localized text. Affliction Forge 0.1.61+ resolves these tokens per client when listing, opening, or applying provider content.

Version 0.1.17 keeps those stable localized IDs, adds the nine reviewed Howl of the Wild creature afflictions to the same logical source, and continues hosting all Howl content through the established supplemental physical compendium.
