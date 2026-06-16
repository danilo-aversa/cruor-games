# Monster Composer v1.32 — Bestiary Wording Normalizer

## Scope

This pass normalizes final rendered stat-block wording only. It does not change DPR, CR fitting, HP fitting, frame power, graft selection, publish gate thresholds, or damage/legalization formulas.

## Changes

- Added a Bestiary wording normalizer for rendered rules text.
- Normalized `Hit: the target takes X...` to `Hit: X...`.
- Normalized `Failure: the target takes X...` to `Failure: X...`.
- Normalized damage-plus-condition failure clauses to use `, and the target has...`.
- Normalized recharge dash style from `5-6` to `5–6`.
- Moved leading `Recharge 5–6.` text into the rendered feature title as `(Recharge 5–6)`.
- Normalized bare area-save targets such as `creatures in...` to explicit quantified targets such as `each creature in...`.
- Normalized explicit centered `Radius` wording toward 2024 area shapes:
  - explicit centered radius -> `N-foot-radius Sphere centered on...`.
- Area origins are now rendered from `targeting.origin` / `targeting.originText` metadata, with fallback only when metadata is blank.
- Normalized core game term casing for `Hit Points`.
- Added parser warnings for Bestiary wording regressions:
  - `bestiary-hit-damage-wording`
  - `bestiary-failure-damage-wording`
  - `bestiary-recharge-dash`
  - `bestiary-recharge-title`
  - `bestiary-area-target-quantifier`
  - `bestiary-radius-shape`
- Added a smoke test covering direct normalizer behavior and representative rendered grafts.

## Bestiary Pattern Check

The loaded `Bestiary.csv` overwhelmingly uses:

```text
Hit: 7 (1d8 + 3) Bludgeoning damage.
Failure: 27 (6d8) Psychic damage, and the target has the Poisoned condition.
Acid Breath (Recharge 5–6). Dexterity Saving Throw...
```

It does not generally use `Hit: the target takes...`, separate `Recharge 5-6.` sentences, bare plural area-save targets such as `creatures in a...`, or standalone capitalized `Radius` as an area shape.

## Files

```text
features/inspiration-studio/InspirationStudioPage.jsx
features/monster-composer/model/monster-bestiary-wording.js
features/monster-composer/model/monster-bestiary-wording-smoke.test.js
features/monster-composer/model/monster-composer.export.js
features/monster-composer/model/monster-graft-rules.render.js
features/monster-composer/model/monster-statblock-parser.js
features/monster-composer/reports/monster-bestiary-wording-normalizer-v1.32.md
```

## Expected QA

After extraction, run the normal Monster Composer QA batch in Realistic mode with 200 monsters. Expected target:

```text
Publish Blocked: 0
Parser Failed: 0
0 Bestiary wording warnings
Recharge rendered in titles
Hit/Failure damage clauses in Bestiary style
CR still within the already-stabilized v1.30/v1.31 range
```

## r3 Batch Follow-up

The Realistic 200 batch after r2 reported zero Bestiary wording warnings, but manual review found 8 `Corpse Tendrils` outputs with `each creature in a 10-foot Emanation.`. The Bestiary CSV consistently writes Emanation effects with an explicit origin, so r3 adds `bestiary-emanation-origin` and normalizes those clauses to `originating from the creature`.

## r4 Targeting Origin Metadata Follow-up

The r3 fallback showed that Emanation origin cannot be treated only as a text-normalizer concern. The origin is editorial/mechanical metadata belonging to the graft targeting model.

Changes:

- Added `targeting.origin` and `targeting.originText` editing fields to Inspiration Studio's Monster Graft Targeting block.
- Added structured targeting origin rendering in `monster-graft-rules.render.js`.
- Kept a default fallback for blank origin metadata, so older grafts still render publish-clean text.
- Stopped the Bestiary normalizer from inventing missing Emanation origins in arbitrary rendered/manual text. Missing Emanation origins remain parser-detectable through `bestiary-emanation-origin`.
- Kept explicit centered Radius normalization for cases such as `15-foot Radius centered on the corpse` -> `15-foot-radius Sphere centered on the corpse`.

Metadata examples:

```js
targeting: {
  type: "area",
  shape: "emanation",
  size: 10,
  unit: "ft",
  targets: "creatures",
  origin: "corpse"
}
```

renders as:

```text
Dexterity Saving Throw: DC 15, each creature in a 10-foot Emanation originating from the corpse.
```

```js
targeting: {
  type: "area",
  shape: "radius",
  size: 15,
  unit: "ft",
  targets: "creatures",
  originText: "centered on the corpse"
}
```

renders as:

```text
Dexterity Saving Throw: DC 15, each creature in a 15-foot Sphere centered on the corpse.
```
