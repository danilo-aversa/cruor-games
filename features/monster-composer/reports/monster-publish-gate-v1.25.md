# Monster Composer — Publish-Grade QA Gate v1.25

## Scope

This pass separates publish blockers, actionable review warnings, and informational diagnostics in Monster Batch QA and export readiness.

## Changes

- Added `features/monster-composer/model/monster-publish-gate.js`.
- Added a publish gate for generated monsters with `ready`, `status`, `blockers`, `reviews`, and `info` buckets.
- Export readiness now blocks only required publish blockers; review notes no longer make an otherwise valid monster non-ready.
- Routine frame-power diagnostics are downgraded to `info` when final CR is within ±1.
- Routine DPR diagnostics such as multiple alternative main actions are always informational.
- Closed-loop fitting diagnostics are downgraded to `info` when fitting reaches publish tolerance.
- Batch analytics now tracks `publishReady`, `publishReview`, `publishBlocked`, and `belowTargetBy2`.
- Debug ZIP candidate selection now prioritizes publish blockers/reviews instead of info-only diagnostics.
- Studio QA summary now shows Publish Ready / Publish Blocked and separates Info from Warnings.

## Publish Gate Rules

A generated monster is blocked if it has any of the following:

- missing Body, Attack, or Weakness / Tell;
- no exported Action;
- missing or non-playable counterplay;
- Estimated CR outside target ±1;
- export-readiness blockers;
- true QA errors.

A generated monster is marked `review` if it has actionable review items but no blockers, such as pressure over budget or complexity over cap.

Routine diagnostics such as capped frame budget, capped multipliers, high-tier boss dampening, and alternative main actions are kept as `info` if the final stat block remains inside publish tolerance.

## Expected QA Outcome

For the current v1.24 baseline, a 100-monster Realistic QA run should keep CR within target ±1. v1.25 should reduce warning noise further and move expected diagnostics into the Info bucket while preserving true blockers.
