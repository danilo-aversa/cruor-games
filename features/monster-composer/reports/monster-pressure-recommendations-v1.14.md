# Monster Composer — Pressure & Recommendation Cleanup v1.14

## Scope

This pass keeps the graft cleanup intact and focuses on the Balance panel interpretation layer:

- Pressure score floors driven by CR/DPR/Burst validation.
- Recommendation targeting for damage spikes.
- General CR-over-target guidance that does not blame a single graft when the mismatch is systemic.

## Changes

### Pressure Validation Floor

`buildPressureProfile()` still computes the raw pressure score from graft cost, tags, tempo, defense, control, area, sustain, and fairness. The new `applyPressureValidationFloor()` then raises the displayed pressure floor when validation data proves that the monster plays above its printed frame.

Floor inputs:

- Estimated CR delta.
- Offensive CR delta.
- Defensive CR delta.
- Printed DPR ratio.
- Effective DPR ratio.
- Burst DPR ratio.
- Effective HP ratio.
- Condition CR adjustment.

A target CR 5 monster with Estimated CR 7 can no longer display `Pressure: Low`; it is floored to at least `Moderate` and records the added pressure as `Validation +X`.

### Fairness Relief Cap

The previous `Other -X` contribution could over-neutralize real danger. Fairness still lowers pressure, but it is capped so it cannot erase validated DPR, HP, CR, burst, or condition risk.

### Recommendation Targeting

Damage recommendations now distinguish between:

- A clear damaging graft culprit.
- A true large death burst.
- A general frame mismatch where several values are mildly above target.

Death-trigger damage is no longer targeted for removal unless it is the primary spike by a large margin. This prevents `Toxic Detonation` from being blamed automatically when the monster is simply around CR +2 overall.

### General CR Mismatch Recommendation

A new recommendation appears when validation estimates a monster above target without a single obvious broken graft:

`Treat as Higher CR or Trim One Graft`

This suggests changing the frame/tier or opening the attack slot, rather than directly removing a flavorful death effect.

## Smoke Test

Synthetic CR 5 case:

- Target CR: 5
- Estimated CR: 7
- Printed DPR: 45 vs baseline 36
- Burst: 50 vs baseline 36
- Effective HP: 123 vs baseline 96
- Raw pressure: 3
- Final pressure: 10
- Label: Moderate

Result: pass.
