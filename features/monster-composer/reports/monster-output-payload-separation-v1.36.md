# v1.36 — Output Text Cleanup / Debug vs Public Payload Separation

## Scope

Separate Monster Composer output into table-facing public payloads and internal debug/editor payloads without changing CR, DPR, HP, frame fitting, graft selection, or publish gate thresholds.

## Changes

- `exportJson` is now the public/table-facing JSON payload.
- Added `debugExportJson` for diagnostics, migration audit, raw legacy authoring fields, balance internals, and full graft records.
- Removed `Designer Notes` from copied stat block text by default.
- Moved rendered stat block designer notes under `statBlock.debug.designerNotes`.
- Export UI shows only Public JSON by default; Debug JSON and Designer Notes are visible only in Debug mode.
- QA parses both public and debug JSON, but public JSON is the default copy/export target.

## Public Payload

The public payload has:

- `exportMeta.payloadType: "public"`;
- `exportMeta.visibility: "table-facing"`;
- normalized stat-block sections;
- compact combat/frame data;
- public run sheet;
- compact selected graft summaries.

It intentionally excludes:

- raw `rulesText.mechanics`;
- `abilityModel` internals;
- `featureMechanics`;
- full `rulesProfile` / CR validation internals;
- catalog migration audit;
- designer notes.

## Debug Payload

The debug payload has:

- `exportMeta.payloadType: "debug"`;
- `exportMeta.visibility: "debug-editorial-internal"`;
- full balance and CR diagnostics;
- full structured graft records;
- legacy authoring/migration fields;
- catalog audit data.

## Migration Markers

Public and debug payloads now report:

```text
migrationStage: rules-v1.16-public-debug-payload-separation
dataModelMigrationStage: rules-v1.15-legacy-stats-adapter
```

## Verification

Local checks run:

```text
node --check monster-composer.export.js
node --check monster-composer.run.js
node --check monster-frame-builders.js
node --check monster-batch-qa.js
node --check monster-per-graft-qa.js
monster-graft-balance-profile-smoke.test.js
Monster Per-Graft QA: 90 passed / 0 failed / 0 publish blocked
Monster Batch QA smoke, 50 realistic cases: 0 errors / 0 warnings / 50 parser passed / 50 publish ready
Public JSON legacy-pattern smoke on core scratch frames: 0 failures
```
