# Monster Graft Rules Cleanup v1.13

## Scope

This cleanup pass focuses on rules completeness for monster grafts before further DPR/CR balancing work. The goal is to prevent incomplete or illegal graft data from entering the rules engine and producing misleading balance output.

## Main Fixes

- Added rules-content cleanup normalization for known bad or ambiguous grafts.
- Reclassified non-damaging passive/weakness grafts so they no longer expose structured damage entries.
- Added explicit `budgetShare`, `expectedTargets`, and `roundWeight` values to normalized budget damage entries.
- Corrected death/reaction/recharge damage roles where they were previously treated as normal main attacks.
- Corrected `Toxic Detonation` from `mainAttack` to `deathBurst` and gave it explicit `{damage}` text.
- Discounted death-trigger burst damage so it is tracked as death-burst risk instead of normal sustained DPR.
- Added blocking validation for damage text that mentions damage or half damage without a `{damage}`, `{damage-part:id}`, `{pb}`, Proficiency Bonus, or explicit dice/average amount.
- Added fail-closed behavior so abilities with blocking damage errors do not contribute damage to the ability model or DPR simulator.

## Validation Result

- Grafts audited: 90
- Rules validation errors: 0
- Rules validation warnings: 0
- Ability model status: pass
- Structured damaging abilities after cleanup: 19

## Toxic Detonation Smoke Test

CR 5 target DPR baseline: 36

- Role: `deathBurst`
- Budget share: `0.45`
- Expected targets: `1.25`
- Round weight: `[0, 0, 0.25]`
- DPR contribution over three rounds: round 1 = 0, round 2 = 0, round 3 = 5
- Average DPR contribution: 2
- Burst DPR contribution: 5

This confirms that the graft no longer explodes the monster into a false CR 14+ profile simply because its damage text was incomplete.

## Remaining Notes

This pass makes the current graft dataset rules-complete enough to resume balancing work. It does not mean every graft is final from an editorial design perspective. Future passes should still refine exact wording, localized text, source-pack flavor, and per-system conversion for D&D 2014/PF2E.
