# Monster Composer v1.33 — Passive / Weakness Renderer Templates

## Scope

This pass reduces stat-block reliance on legacy `mechanics` fallback for passive, weakness, and self-condition grafts.

No DPR, CR, HP, fitting, frame power, graft selection, or publish thresholds were changed.

## Audit Result

Before this pass, 39 grafts still rendered through `mechanics` fallback when no structured renderer text was available.

The highest-priority cases were passive/weakness conditions where the condition is not applied to an enemy target:

- `mechanical-stress`
- `fear-of-fire`
- `eyes-weak-spot`
- `umbral-skin`
- `vanish-spirit`
- `shameful-feeding`

## Added Metadata

`rules.condition.direction` now supports:

- `enemy` — default target/enemy-facing condition text.
- `self` — the monster gains the condition itself.
- `playerApplied` — a player action applies the condition to the monster.
- `weakness` — a weakness/tell creates or exposes the condition on the monster.
- `referenceOnly` — condition metadata exists for QA/balance, but the renderer should not auto-print a generic condition clause.

The Inspiration Studio now exposes this as `Condition Direction` inside the Conditions block.

## Renderer Changes

The structured renderer now supports passive condition rendering when a graft has condition metadata but no attack/save resolution.

If a passive condition has `rules.text.effect`, that effect remains the primary printed text.

If no effect text exists, the renderer can fall back to a condition clause using `condition.direction`.

## Graft Migration

Converted these pure mechanics-fallback grafts to structured renderer output:

- `mechanical-stress` uses `referenceOnly` plus explicit structured effect text because it has multiple choice outcomes.
- `eyes-weak-spot` uses `playerApplied` plus structured effect text; player damage was removed from monster outgoing damage metadata.
- `umbral-skin` uses `self` plus structured effect text.

Also normalized condition direction semantics on these already-structured grafts:

- `vanish-spirit` uses `self` and prints the Invisible condition on the monster.
- `fear-of-fire` uses `weakness` and prints the Frightened condition on the monster.
- `shameful-feeding` uses `weakness` plus structured effect text instead of incorrectly rendering as a standard target saving throw.

## Remaining Fallbacks

The fallback count is reduced from 39 to 36.

Remaining fallback grafts are mostly bespoke traits, movement tools, death/investigation beats, weak spot procedures, or DM-facing operational notes that need separate structured models before they should be migrated.

Do not claim that all passive/weakness/death grafts are fully metadata-rendered yet.

## Verification

- `node --check` on changed JS files.
- Custom smoke test for six migrated grafts.
- Full 90-graft render pass.
- Validation pass: 90/90 grafts, 0 errors.
