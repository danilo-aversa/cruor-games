# Studio QA Tests v1.15

Implemented a Studio-side QA Tests entry point for Monster Composer batch validation.

## Added

- `StudioTestsMenu` beside the existing `StudioToolsMenu`.
- `MonsterBatchQaModal` using the shared `StudioToolModalShell` pattern.
- Configurable Monster Batch QA count, CR range, seed, optional slot inclusion, and optional full payload export.
- Browser warning for batches above 250 monsters and stronger warning above 500 monsters.
- JSON and Markdown report export.
- Markdown copy action for quick ChatGPT review.
- `monster-batch-qa.js` batch runner.

## QA Scope

Each generated frame is run through Forge, compatibility checks, frame-fit checks, rules schema validation, modern D&D 2024 ruleset math, DPR simulation, effective profile, CR validation, pressure validation, and export readiness.

## Intended Workflow

1. Open `http://localhost:5173/?admin=studio`.
2. Click the new QA Tests button next to Studio Tools.
3. Open Monster Batch QA.
4. Choose count and CR range.
5. Run the test.
6. Export JSON or Markdown and attach the report for analysis.
