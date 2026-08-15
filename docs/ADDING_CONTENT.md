# Adding a Reviewed Affliction

Add one JSON definition to the matching `content/<source-pack>/` directory.

Use a language-neutral, lowercase kebab-case filename that exactly matches the final segment of the stable definition ID. Example:

```text
content/gm-core/nightmare-fever.json
affliction-forge-remastered-rules.gm-core.nightmare-fever
```

The visible `name` may be localized; filenames and stable IDs must not be localized.

Required metadata shape:

```json
{
  "metadata": {
    "originModule": "affliction-forge-remastered-rules",
    "originFeature": "remastered-rules-library",
    "sourceWorkId": "gm-core",
    "contentLanguage": "de",
    "translation": "independent-from-english-orc-source",
    "license": "ORC",
    "automationStatus": "full",
    "licenseReview": {
      "mechanicsOnly": true,
      "reservedMaterial": "passed",
      "nameReview": "passed"
    }
  }
}
```

Stable definition IDs must begin with `affliction-forge-remastered-rules.`. Keep source variants distinct, for example by including the neutral source key in the ID.

A source file is not publishable until `npm test` and `npm run validate` are green. `npm run prepare:packs` then creates serialized PF2e Item sources for the official Foundry pack compiler.
