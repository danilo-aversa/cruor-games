# Studio QA Tests v1.16 — Batch Runner + Modal UI Pass

## Scope

This pass updates the Studio QA Tests tool after the first 100-monster batch report.

## QA Runner Changes

- Upgraded Monster Batch QA to `monster-batch-qa-v0.2`.
- Added `qaMode` with two modes:
  - `realistic`: tries to generate only source/type/category frames with required graft coverage.
  - `stress`: allows unlikely combinations and labels them as stress coverage gaps.
- Added compatibility-aware frame generation through forge coverage checks.
- Added frame coverage metadata to generated records.
- Separated forge status from balance status and export status.
- Skips balance and export checks when the Forge fails required slots.
- Added aggregate counts for complete forge outputs, incomplete forge outputs, balance analyzed, balance skipped, and export skipped.
- Updated Markdown export to include QA mode and separated status counts.

## UI Changes

- Added QA Mode select to the Monster Batch QA modal.
- Restyled checkbox controls with fixed-size custom checkboxes.
- Removed the hover-size jump on checkbox rows.
- Restyled run/copy buttons to match compact Studio header typography.
- Changed QA controls/results layout from side-by-side columns to stacked rows.
- Added decorative icons to summary tiles.
- Restyled QA panel eyebrows to match the global modal header eyebrow.
- Added a short QA mode note below options.

## Intended Behavior

A Realistic QA run should produce fewer impossible Forge failures and cleaner balance data.
A Stress QA run remains available when intentionally testing content coverage gaps.

If a monster lacks required playable slots, it is counted as Forge incomplete and excluded from balance outlier analysis.
