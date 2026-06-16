# Monster Composer — Ability Model / Rendered Text Alignment v1.27

## Scope

This pass tightens the rendered stat block parser and aligns several graft records whose metadata described references, triggers, or counterplay as if they were inflicted conditions.

## Changes

- Bumped the rendered stat block parser to `rendered-statblock-parser-v1.27`.
- Bumped the publish gate integration to `publish-gate-v1.27-parser-alignment`.
- Normalized condition comparison case-insensitively, so `poisoned` in the ability model and `Poisoned` in rendered text are treated as the same condition.
- Allowed special DC wording such as `Saving Throw with a DC equal to 5 plus the damage taken` for features that explicitly use `dc: special`.
- Allowed Proficiency Bonus damage wording as parseable damage text.
- Prevented the area-effect renderer from producing broken text like `The target takes .` when a feature has no damage amount.
- Made condition parsing distinguish actual condition application from condition references such as immunity, triggers, counters, or targets already affected by another feature.
- Treated weakness-slot damage/condition references as counterplay references unless the ability model explicitly declares them.

## Graft alignment

Updated or clarified the following grafts:

- `rupture-charge`: renders structured bonus-action damage text and uses bonus-action damage budget.
- `undead-fortitude`: special DC wording is accepted by the parser.
- `corpse-bloom-death`: no longer renders an empty damage clause.
- `ethereal-sight`: Invisible is treated as a sensing reference, not an inflicted condition.
- `underbelly-weak-spot`: Prone and extra damage are player-facing counterplay references, not monster-inflicted effects.
- `collapsed-crawler`: Prone is an immunity/trigger reference, not an inflicted condition.
- `empowered-slam`: forced movement is not modeled as a D&D condition.
- `face-curse`: death-trigger text now uses 2024 condition wording.
- `mechanical-stress`: fallback mechanics now use 2024 condition wording for Blinded and Prone.
- `corrosive-web`: Restrained is treated as a dependency on web state, not a condition applied by this graft.

## Expected QA impact

Expected improvements in batch QA:

- `Parser Failed` should drop to 0 for the previously blocked Rot-Swollen Zombie cases.
- `missing-damage-amount` for `Rupture Charge` should be removed.
- `missing-save-dc` for `Undead Fortitude` should be removed.
- `condition-text-without-model` warnings caused by case mismatch or condition references should drop sharply.
- `Publish Blocked` should return to 0 unless a genuinely broken rendered stat block appears.
