# Monster Composer — Lower-Bound CR Fitting + Warning Hygiene v1.24

## Goal

This update closes the remaining gap after v1.23: a small number of medium/high-CR monsters could end below their target CR when `roleId: minion` suppressed HP/DPR too aggressively.

## Changes

- `monster-frame-power.js`
  - Updated to `frame-power-normalization-v1.24`.
  - Minion HP/DPR suppression is now CR-aware.
  - Low-CR minions still stay fragile/simple.
  - Medium/high-CR minions keep reduced complexity and budget, but no longer suppress combat math enough to violate the target CR.
  - `frame-power-stack/capped-budget` is now informational because it is expected normalization behavior.

- `monster-cr-fitting.js`
  - Updated to `closed-loop-cr-fitting-v1.24`.
  - Added lower-bound fitting authority.
  - When a monster remains below `target CR - 1`, the fitter can raise HP/DPR targets more aggressively, especially for CR 5+ minions.
  - Added diagnostics:
    - `lower-bound-authority-enabled`
    - `pass-N-lower-bound-hardening`

- `monster-batch-qa.js`
  - Updated to `monster-batch-qa-v0.7-lower-bound-fitting`.
  - `dpr-simulator/multiple-main-actions-alternative` is now `info`, not `warning`.
  - Frame-power diagnostics preserve their own severity, so expected capped-budget diagnostics no longer inflate warning counts.
  - Per-monster `issueCount` now counts only error/warning issues; `infoCount` is tracked separately.

- `monster-composer.page.jsx`
  - Informational frame-power diagnostics are no longer shown as user-facing warnings in the Composer.

## Expected QA Outcome

Compared to v1.23, the next 100-monster Realistic QA batch should retain:

- 100/100 forge complete.
- 0 CR +2 or higher.
- 0 CR +4 or higher.
- No high-CR minion output below target by 2+ CR.
- Fewer visible warnings because expected diagnostic information is now classified as `info`.

## Design Principle

`targetCr` remains the source of truth. `roleId: minion` should primarily mean:

- Lower complexity.
- Lower graft budget.
- Simpler action profile.
- Less scene dominance.

It should not mean that a CR 10 monster resolves as CR 7 after validation.
