# Terrifying Monsters — Pressure / Complexity v3 Implementation Review

## Baseline

The implementation was developed against the fresh `v34.0.0a` context supplied on 2026-07-27. Only paths present in that archive were treated as existing inputs. New files are explicitly identified below.

## Structural changes

### New canonical model

`features/monster-composer/model/monster-pressure-complexity.js` now owns:

- the seven-band CR Pressure curve;
- Footprint and Tier modifiers with low-CR caps;
- CR-independent Complexity limits;
- player-facing Pressure scoring;
- DM-facing Complexity scoring;
- breakdowns, labels, utilization, excess, and invariants.

### Frame capacity

`monster-frame-power.js` now returns two separate capacities:

- `buildBudget`: internal graft-cost capacity used by Forge;
- `pressureLimit`: public CR-scaled tactical-load guidance.

`budget` remains a compatibility alias for the old internal value inside the frame profile, while the computed Composer payload uses `budget` as the visible Pressure limit during migration.

### Runtime computation

The Composer and QA builders now compile a CR-projected ability model specifically for Pressure and Complexity. The values are derived after the current graft selection is known and are not raised by DPR, HP, AC, CR validation, or party size.

Feature impact previews use the same projected repertoire and show the real score delta produced by installing a graft.

### Non-blocking guidance

The guided flow no longer creates Pressure or Complexity blockers. Both remain Review advisories. Counterplay and missing core slots still block clean handoff where appropriate.

The publish gate reports overages under `reviews`, not `blockers`, and returns `ready: true` when no unrelated blocker exists.

## UI behavior

Both sidebar meters and Review meters receive an `is-over` state when their value exceeds the recommendation. The fill pulses with a restrained blood-colored glow, while text explains the excess and explicitly states that the build remains available.

Reduced-motion users receive the same visible warning without animation.

## Calibration results

The generated audit validates all 93 grafts and 15 Attack Patterns.

At CR 2, the standard Pressure limit is 6:

- Web Hunter: 9/6;
- Venom Spitter: 7/6;
- Crusher: 6/6;
- Broodmaker: 6/6;
- Shadow Weaver: 6/6;
- Venom Hunter: 6/6;
- Cold Touch: 1/6.

Therefore a complex Attack Pattern can saturate or exceed the complete CR 2 allowance before Body, Mind, Movement, Horror, Twist, Death, or Lair grafts are installed, while simple patterns still leave room for additional identity.

The full-catalog CR 2 stress case compiles 131 abilities and exceeds both guidance values by a wide margin. The system reports this condition but does not prevent the user from continuing.

## QA changes

Legacy QA assumptions were corrected:

- CR/DPR mismatch no longer forces a minimum Pressure label;
- Pressure capacity is explicitly checked across CR bands;
- Danger is verified not to alter Pressure capacity;
- Tempo is checked against Complexity guidance rather than Pressure;
- final evaluation verifies damage-magnitude independence;
- guided flow verifies that both overages are advisory;
- catalog audit verifies real Attack Pattern saturation at CR 2.

## New files

- `features/monster-composer/model/monster-pressure-complexity.js`
- `features/monster-composer/model/monster-pressure-complexity.test.js`
- `scripts/monster/report-monster-pressure-complexity.mjs`
- `docs/terrifying-monsters/phase9/pressure-complexity-v3-contract.md`
- `docs/terrifying-monsters/phase9/pressure-complexity-v3-review.md`
- `docs/terrifying-monsters/phase9/pressure-complexity-v3.generated.json`
- `docs/terrifying-monsters/phase9/pressure-complexity-v3.generated.md`
