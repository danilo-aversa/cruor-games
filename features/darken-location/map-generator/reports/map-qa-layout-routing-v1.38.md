# Cruor Map QA — v1.38 Layout/Routing Sanity + Zipped Export

## Scope

Adds procedural quality checks and compressed ZIP export to Map Batch QA without changing map generation, routing, layout, rendering, editor behavior, or production map export.

## New QA Version

`map-batch-qa-v0.3-layout-routing-zipped-export`

## New Checks

- `routing/corridor-room-tunneling`: error when corridor floor cells pass through a non-endpoint room.
- `routing/corridor-excessive-span`: warning when a corridor spans an unusually large portion of the map.
- `routing/corridor-long-straight-run`: warning when a corridor has a very long straight segment.
- `routing/route-detour-ratio`: warning when a corridor route is much longer than the Manhattan distance between endpoint rooms.
- `layout/layout-aspect-ratio-outlier`: warning for oblong generated maps.
- `layout/layout-room-distribution-outlier`: warning for unusually sparse room distribution.
- `layout/layout-unused-canvas-waste`: warning for maps that occupy too little of the available canvas envelope.

## Zipped Export

`MapBatchQaModal` now exports ZIP by default, matching Monster Batch QA.

Export modes:

- `compact`: compact JSON + Markdown summary only.
- `debug`: compact JSON + Markdown summary + debug index + separate debug JSON/SVG files for failed, warning, or outlier maps.
- `full`: debug ZIP contents plus the full in-browser QA report object.

The compact JSON no longer embeds structural SVG inline during ZIP export. It references SVG files under `debug/svg/*.svg` when those files are included.

## SVG Debug Payload

`MapBatchQaModal` exposes:

`Include structural SVG for maps with errors or warnings.`

When enabled, maps with issues produce structural SVG. In ZIP export, those SVG payloads are stored as separate files instead of bloating the compact JSON.

## Non-Goals

No changes to:

- map generation;
- room placement;
- corridor routing;
- renderer styling;
- map editor behavior;
- DungeonBrief data model;
- production SVG export;
- Studio test presets beyond preserving Map Batch QA export parameters.


## v1.38 r3 — Report Calibration

This pass keeps the map generator as a black box and improves QA/reporting only.

Changes:

- `MAP_BATCH_QA_VERSION` is now `map-batch-qa-v0.4-report-calibration`.
- Debug ZIP remains the default analysis export and intentionally excludes the giant `full.json` payload.
- Full ZIP is the only mode that writes the complete browser report object.
- Each generated map now receives `quality` scores: `overallQaScore`, `structureScore`, `routingScore`, `layoutScore`, and `readabilityScore`.
- Analytics now include average quality scores and quality-band counts.
- Markdown reports now include breakdowns by context, theme, room count, and room-count bucket.
- Debug ZIP now includes `debug/worst-cases.json` to provide an ordered index of the worst maps with seed, context, issue summary, score, and debug file paths.
- Studio Test Presets now include official locked Map QA presets: Smoke 25, Standard 100, Regression 250, Stress 500, Chapel Focus, Noble House Focus, and High Room Count.

No map generation, layout, routing, rendering, or correction logic was changed in this pass.


## v1.38 r4 — Debug Export Accuracy

This pass keeps generation and QA checks unchanged and corrects only the debug export layer.

- Failed maps and maps with error-level issues are mandatory debug candidates and are never dropped by `debugLimit`.
- `debugLimit` now limits only additional review/warning/outlier maps after all failed maps have been included.
- `debug/worst-cases.json` is built from the same mandatory-first candidate list, so it always includes every failed map before optional review cases.
- Debug ZIP metadata now distinguishes SVG payloads available in the report from debug files actually written into the ZIP.
- Markdown, compact JSON, README, and `debug/debug-index.json` now report written debug map/SVG counts and failed maps missing debug payloads.

Expected Debug ZIP invariant:

```text
failed maps missing debug payload = 0
all failed map IDs appear in debug/maps/*.json
all failed map IDs with structural SVG appear in debug/svg/*.svg
full.json is absent unless Export Mode is Full ZIP
```


## v1.38 r5 — Label / Version Cleanup

- `MAP_BATCH_QA_VERSION` is now `map-batch-qa-v0.6-label-version-cleanup`.
- Map QA top-level report `version` now mirrors `metadata.qaVersion` when available, so compact JSON no longer appears as the old structural report version.
- The Markdown summary label `SVG Debug Payloads Available` was renamed to `Debug Candidates Available`.
- `Quality Bands` was renamed to `Score Bands` and band IDs now use `score-excellent`, `score-good`, `score-review`, `score-poor`, and `score-broken` to avoid implying that score bands are pass/fail status.
