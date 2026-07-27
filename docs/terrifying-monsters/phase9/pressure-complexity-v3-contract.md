# Terrifying Monsters — Pressure / Complexity v3 Contract

## Purpose

Pressure and Complexity are the two public guidance values for deciding whether a generated monster is appropriate for the intended encounter and practical for the DM to run.

They answer different questions:

- **Pressure:** How much tactical load does this monster place on the players?
- **Complexity:** How much operational load does this monster place on the DM?

Neither value is a replacement for Challenge Rating validation.

## Pressure contract

Pressure is calculated from the CR-projected compiled ability repertoire. It measures:

1. core combat routine and main-action alternatives;
2. distinct player responses and counterplay channels;
3. conditions, containment, and forced movement;
4. areas, positioning, and persistent battlefield demands;
5. reactions, bonus actions, recharge, legendary, and lair tempo;
6. ongoing effects, summons, procedures, and death effects;
7. simultaneous systems, phase changes, and cross-system interactions.

Pressure must not increase directly because DPR, HP, AC, or estimated CR is high. Those values belong to CR Fit, Spike Risk, and other balance diagnostics.

### CR-scaled capacity

| Target CR | Standard Pressure limit |
|---|---:|
| 0–1 | 4 |
| 2–4 | 6 |
| 5–8 | 8 |
| 9–12 | 10 |
| 13–16 | 12 |
| 17–20 | 14 |
| 21–30 | 16 |

Encounter Footprint and Tier may modify the limit. Positive inflation is capped at +2 for CR 0–4 and +3 thereafter, preventing low-CR Boss or Legendary frames from becoming unrestricted containers.

The same compiled repertoire has the same Pressure weight at every CR. CR changes the available capacity. A graft progression that adds abilities at higher CR may legitimately raise the score because the content itself changed.

## Complexity contract

Complexity is calculated from the same CR-projected ability repertoire, but measures DM-facing work:

1. decisions and competing actions;
2. reactions, recharge, triggers, and timing windows;
3. conditions, repeat saves, escape procedures, and ongoing state;
4. zones, summons, and board objects;
5. Multiattack choices, replacements, additions, and branching;
6. spellcasting, special procedures, references, and exceptional subsystems.

Complexity is independent from CR and damage magnitude. Its recommended limit is derived mainly from Encounter Footprint, Tier, and Tempo and remains between 3 and 10.

## Build Budget separation

The existing graft-cost budget remains an internal Forge constraint and is exposed as `buildBudget`. It is not Pressure.

`computed.pressureLimit` is the only canonical limit for visible Pressure meters, warnings, percentages, and review guidance. `computed.buildBudget` is the Forge selection envelope. `computed.budget` remains a legacy build-budget alias and must never drive Pressure UI.

## Advisory overflow

Pressure or Complexity above its limit must:

- remain visible in the sidebar and Review view;
- apply an `is-over` state to the meter;
- show a pulsing/glowing fill and a concise advisory;
- expose accessible progressbar values and live status text;
- respect `prefers-reduced-motion` with a static high-contrast state;
- create warnings and recommendations;
- never disable navigation, Review, Stat Block, Export, or publication by itself.

Missing core grafts, invalid counterplay, invalid rendered output, and out-of-tolerance CR may remain blockers. Pressure and Complexity overages may not.

## Compatibility requirements

- Preserve public graft IDs and ability IDs.
- Preserve the old `buildPressureProfile` and `buildComplexityProfile` call boundaries as adapters where needed.
- Preserve `applyPressureValidationFloor` only as an identity compatibility boundary; power validation may not alter Pressure.
- Keep final evaluation projections available under `v3`; a temporary `v2` alias may remain for consumers not yet migrated.
- Add deterministic model tests, guided-flow tests, final-evaluation tests, catalog calibration, and generated audit artifacts.
