# Monster DPR Action Economy — v1.21

## Scope

This pass fixes the Monster Composer DPR simulator so that alternative main actions are no longer summed together.

A monster can have several action options, such as a melee attack, ranged attack, spell-like save effect, or recharge attack. These are alternatives unless explicitly modeled as Multiattack, Bonus Action, Reaction, Legendary Action, Lair Action, or Death Trigger.

## Changes

- Updated `MONSTER_DPR_SIMULATOR_VERSION` to `three-round-dpr-v0.4-action-economy`.
- Main-action damage sources are now grouped by ability.
- Each 3-round DPR round selects one best main-action option for that round.
- Bonus Action, Reaction, Legendary Action, Lair Action, Death Trigger, trait, and other non-action sources remain additive when applicable.
- Multiattack remains inside a single main-action option through its action multiplier.
- DPR profile now includes:
  - `actionEconomy.mainActionPolicy`
  - `actionEconomy.mainActionOptionCount`
  - `actionEconomy.mainActionOptions`
  - `actionEconomy.selectedMainActions`
  - `actionEconomy.rawMainActionTotal`
  - `actionEconomy.selectedMainActionTotal`
  - `actionEconomy.suppressedMainActionDamage`
  - `allSources`
  - `alternativeSources`
  - `rawSourceCount`
- QA summaries now include:
  - `dprMainActionOptionCount`
  - `dprSuppressedMainActionDamage`
  - `dprSelectedMainActions`
- Batch QA emits a `dpr-simulator:multiple-main-actions-alternative` warning when multiple main actions were available and alternative damage was suppressed.

## Expected Result

A build with both `Grave Bite` and `Horrific Apparition` should no longer count both every round. The simulator should pick the stronger main action per round and report the suppressed alternative damage.

## Smoke Test

Synthetic smoke test with `Grave Bite` + `Horrific Apparition`:

```text
round1: 58
round2: 58
round3: 58
suppressed alternative main-action damage: 138
```

Previously, this style of build could be treated as if both actions were used every round.

## Notes

This pass does not yet solve frame power stacking such as low-CR Boss + Legendary/Setpiece durability. That should be handled in a separate Frame Power Cap pass after the next QA batch confirms the DPR issue is fixed.
