# Terrifying Monsters — Phase 4 Change Summary

## Outcome

Terrifying Monsters now has a final-output evaluation model that separates Build Budget, Pressure, Complexity, Counterplay and Spike Risk.

## Implemented

- Added `monster-final-evaluation-v2.0`.
- Added independent 0–10 Pressure, Complexity, Counterplay and Spike Risk measures.
- Kept Build Budget in build points.
- Calculated Pressure from final DPR, burst, effective defense, conditions, tempo and reach.
- Calculated Complexity from the flattened Ability Model and final routine choices.
- Removed fairness/counterplay subtraction from the v2 Pressure contract.
- Added sum-then-round behavior.
- Added a legacy-profile adapter that preserves the current visible UI values.
- Attached v2 Pressure data at the existing post-CR validation boundary.
- Added the complete final evaluation to debug exports only.
- Added deterministic scenario audit outputs and focused Vitest coverage.

## Deterministic audit

Eight scenarios exercise forty invariants.

Key results:

```text
baseline CR2 Pressure:       3.23
burst CR2 Pressure:          5.60
baseline Spike Risk:         0.00
burst Spike Risk:            6.32
hard-control Pressure:       5.32
simple Complexity:           0.55
complex repertoire:          7.84
unsafe Counterplay:          1.00
strong Counterplay:          9.50
```

Pressure remains `3.23` when only Counterplay changes, and remains `3.23` when Build Budget changes from 8 to 24.

## Compatibility

- The current visible Pressure and Complexity scores are preserved.
- The public JSON payload is unchanged.
- The full v2 profile is available in the debug payload.
- Existing provisional profiles are labelled as selected-graft estimates.
- No source catalogue or graft mechanics are changed.

## Intentionally unchanged

- React and JSX files;
- CSS and visual styling;
- Monster Composer controls and layout;
- slot selection and caps;
- public stat-block structure;
- public export schema;
- Content Studio and Inspiration Studio files;
- Attack Pattern editorial content.

## Fresh-file rule for Content Studio

The Content Studio has been modified substantially since the original context package. Any future phase that needs files under the Studio boundary must request fresh copies before editing them.

## Next phase

Phase 5 revises Attack Patterns using the Graft v2 bundle and authored routine contracts. It can proceed without Content Studio files as long as the work remains inside Monster Composer data, model and QA boundaries.
