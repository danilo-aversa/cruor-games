# Monster Composer — Closed-loop CR Fitting v1.23

## Goal

The Monster Composer now performs a final CR fitting pass after the initial frame, graft, rules, DPR, and effective-profile calculations.

Before this pass, the system could detect that a generated monster was above or below its target CR, but it did not correct the generated HP/DPR targets. The validator was diagnostic only.

## What changed

Added:

```text
features/monster-composer/model/monster-cr-fitting.js
```

The new fitting module runs the D&D 2024 rules pipeline up to four times:

```text
1. Build legal D&D stats from target HP/DPR.
2. Simulate 3-round DPR.
3. Build effective HP/DPR/condition profile.
4. Validate offensive/defensive/estimated CR.
5. If estimated CR is outside tolerance, adjust HP and/or DPR targets.
6. Rebuild legal HP/damage dice and revalidate.
```

The fitting target is not a free stat override. Every pass goes back through the rules engine, so HP remains legal hit dice and damage remains legal dice expression output.

## Policy

```text
policy: closed-loop-hp-dpr-target-fitting
tolerance: ±1 CR
maxPasses: 4
```

The fitter adjusts HP and DPR separately:

```text
Defensive CR too high  -> lower HP target
Offensive CR too high  -> lower DPR target
Defensive CR too low   -> raise HP target
Offensive CR too low   -> raise DPR target
```

The fitter keeps bounded correction ranges so a bad frame cannot collapse into an absurdly weak or inflated stat block.

## Integrated files

```text
features/monster-composer/model/monster-cr-fitting.js
features/monster-composer/monster-composer.page.jsx
features/monster-composer/qa/monster-frame-builders.js
features/monster-composer/qa/monster-batch-qa.js
```

## QA output

Generated monster summaries now include:

```text
crFitApplied
crFitPasses
crFitInitialEstimatedCr
crFitFinalEstimatedCr
crFitInitialHpTarget
crFitFinalHpTarget
crFitInitialDprTarget
crFitFinalDprTarget
crFitDiagnostics
```

Batch analytics now include:

```text
crFitApplied
averageCrFitInitialDelta
averageCrFitDeltaReduction
```

## Diagnostics

The fitter can emit:

```text
closed-loop-applied
remaining-cr-above-target
remaining-cr-below-target
best-pass-selected
no-meaningful-adjustment-available
```

Remaining CR issues after fitting are reported under:

```text
cr-fitting/*
```

## Important limitation

Closed-loop fitting can reliably adjust budget-driven damage and legal HP. It cannot fully correct a graft whose damage is fixed and too high unless that graft exposes a scalable damage budget. If a monster remains above target after fitting, inspect fixed-damage grafts, defensive effective-HP multipliers, or hard control pressure.

## Additional check

The v1.23 smoke test verifies that an intentionally high fake profile is pulled closer to its target CR through repeated HP/DPR target fitting.
