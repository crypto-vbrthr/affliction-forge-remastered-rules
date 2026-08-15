# Adding a Reviewed Affliction

Add one JSON definition to the matching `content/<source-pack>/` directory.

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
