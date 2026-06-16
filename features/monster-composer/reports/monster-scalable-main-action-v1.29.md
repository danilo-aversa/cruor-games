# Monster Composer v1.29 — Scalable Main Action Gate + Low-CR DPR Spike Clamp

## Goal

Close the remaining v1.28 edge cases:

- Low-CR monsters whose estimated CR is technically within tolerance but whose DPR spike is too swingy for CR 1–2.
- Mid/high-CR monsters whose only Action is a control-heavy, low-damage option that cannot scale up when closed-loop fitting raises DPR.
- Recursive publish-gate blockers that duplicated the same root cause in QA reports.

## Changes

### Low-CR DPR Spike Clamp

`monster-cr-fitting.js` now continues fitting even when estimated CR is within ±1 if target CR is 1–2 and effective DPR remains too far above the CR baseline.

The fitter can now apply `low-cr-dpr-spike-clamp` diagnostics and lower DPR / Save DC targets to reduce swing damage.

### Scalable Main Action Gate

`monster-frame-builders.js` now detects high-CR frames with no scalable damaging Action. In Realistic QA, if the selected action set contains only non-scaling or minor control actions, the system injects a generated fallback Strike.

The fallback is a real exported Action, not just an internal DPR number, so the rendered stat block, ability model, DPR simulator, parser, and publish gate stay aligned.

### Composer Runtime Alignment

`monster-composer.page.jsx` mirrors the same fallback Strike behavior so UI-generated monsters and QA-generated monsters use the same action-economy assumptions.

### Publish Gate Deduplication

`monster-publish-gate.js` and `monster-batch-qa.js` now ignore recursive `publish-gate` readiness blockers when building the final publish gate. The root blocker remains visible; the duplicated wrapper blocker is removed.

### QA Diagnostics

Batch QA now exports scalable-main-action fields:

- `scalableMainActionStatus`
- `scalableMainActionCount`
- `scalableMainActionFallback`

Batch analytics now include:

- `scalableMainActionFallbackAdded`
- `missingScalableMainAction`
- `lowCrDprSpikeWarnings`

## Expected Result

A 200-monster Realistic QA batch should show:

- `Publish Blocked: 0`
- `Parser Failed: 0`
- `CR +2 or more: 0`
- `CR -2 or lower: 0`
- no high-CR monsters whose only main action is a non-scaling control action
- no low-CR publish blockers caused only by DPR spike while CR is within tolerance
