# Monster Composer v1.28 — Low-CR Hard-Control Gate + Control-Aware Fitting

## Goal

Prevent low-CR monsters, especially CR 1–3 outputs, from publishing above target because they combine multiple reliable hard-control effects such as Frightened plus Restrained.

## Changes

- Added control-aware CR fitting in `monster-cr-fitting.js`.
- Closed-loop fitting can now reduce Save DC, not only HP and DPR, when low-CR hard-control pressure keeps Offensive CR above target.
- Added low-CR hard-control gate helpers in `monster-frame-builders.js`.
- Realistic Forge avoids adding a second reliable hard-control feature below CR 4 when alternatives exist.
- Added `lowCrHardControlProfile` to computed output.
- Added batch QA diagnostics and summary fields for low-CR hard-control stacks.

## Policy

At CR 1–3, reliable major/severe conditions should be limited unless the run is Stress QA or the final CR remains inside publish tolerance.

Stress QA still allows these combinations for coverage testing.

## Smoke Test

The previous blocker profile:

- Grave-Hungry Zombie
- Target CR 2
- Horrific Apparition + Corpse Tendrils
- Previous Estimated CR 4

After control-aware fitting:

- Initial Estimated CR 5
- Final Estimated CR 3
- Target CR 2
- Save DC 16 → 14
- Publish tolerance reached

## Files

- `features/monster-composer/model/monster-cr-fitting.js`
- `features/monster-composer/model/monster-publish-gate.js`
- `features/monster-composer/qa/monster-frame-builders.js`
- `features/monster-composer/qa/monster-batch-qa.js`
