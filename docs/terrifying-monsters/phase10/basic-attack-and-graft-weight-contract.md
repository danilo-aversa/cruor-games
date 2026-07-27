# Basic Attack and Graft Weight Contract

## Scope

This phase establishes two engine guarantees:

1. every compiled creature has at least one damaging Action even when the author selects no Attack Pattern;
2. Pressure and Complexity account for the editorial role of each graft family, not only the raw number of rules in its compiled abilities.

## Basic Attack guarantee

- A selection with no authored `attack` graft receives exactly one compiler-generated Basic Attack.
- The Basic Attack is part of the compiled ability repertoire and therefore appears in the rendered stat block, exports, CR fitting, and DPR simulation.
- It is not exposed as a selected graft and does not occupy the Attack Pattern slot.
- It has zero graft cost, zero Pressure, and zero Complexity. It represents the baseline action almost every D&D creature already possesses.
- Selecting any authored Attack Pattern removes the Basic Attack fallback instead of stacking with it.
- The fallback identity follows the chassis where possible: skeleton strike, spirit touch, beast bite, or a neutral strike.
- At very high CR, the existing action-routine guard may compile Multiattack from the Basic Attack when a single strike cannot sustain the target CR. This is a CR/action-economy projection, not an additional graft.

## Bestiary calibration

The reference corpus contains 503 Monster Manual 2025 creatures. A regex-assisted classification of authored stat-block entries, followed by manual review of the slot semantics, produced these prevalence estimates:

| Capability proxy | Prevalence |
|---|---:|
| Basic damaging attack | 99.6% |
| Full Attack Pattern | 71.4% |
| Special Movement | 30.6% |
| Body | 33.8% |
| Mind | 25.8% |
| Twist | 12.1% |
| Horror | 12.1% |
| Weakness | 9.1% |
| Death Effect | 2.0% |
| Lair or regional procedure | 7.0% |

At CR 2–4, the contrast is stronger: approximately 82% of creatures expose an Attack Pattern proxy, while approximately 23% expose special movement.

Prevalence is evidence, not a direct inverse-frequency formula. Each family is also evaluated for activation window, simultaneity, player response, board state, and DM tracking.

## Slot-weight principles

### Attack Pattern

Attack routines are the normal language of a stat block. Their compiled abilities still generate Pressure and Complexity from choices, conditions, recharge, areas, and interactions, but the family receives a baseline discount so ordinary attacks are not priced like exceptional systems.

### Movement

Special movement changes threat geometry, safe positions, pursuit, disengagement, and the DM's route decisions. It receives a Pressure and Complexity surcharge, increasing with declared graft complexity.

### Body

Most Body grafts are visible passive rules and receive a small discount. Complex transformations or procedures still score through their compiled mechanics.

### Mind

Mind grafts often change targeting priorities, control, or conditional behavior and receive a modest surcharge.

### Twist and Horror

These families usually introduce a separate operating rule, phase, reveal, or player response. They receive moderate surcharges.

### Weakness

Weaknesses add information but primarily expose a readable answer to the party. They receive a discount even though they are rare.

### Death

Death Effects are rare and tactically meaningful, but their activation window is narrow. Their surcharge remains lower than an always-active subsystem of equivalent raw complexity.

### Lair

Lair rules add off-turn timing, environmental state, and board-wide consequences. They receive one of the strongest family surcharges.

## Current catalog targets

At CR 5, the 93-graft catalog should maintain these family-level relationships:

- at low and mid CR, average Movement Pressure is greater than average Attack Pattern Pressure;
- average Movement Complexity remains greater than average Attack Pattern Complexity across the audited CR checkpoints;
- at high CR, Attack Pattern Pressure may overtake Movement when CR-gated progression unlocks additional authored actions;
- Weakness remains the lightest family for DM handling;
- the Basic Attack contributes 0 Pressure and 0 Complexity;
- a sufficiently complex Attack Pattern can still saturate the standard CR 2 Pressure allowance by itself.

The generated per-graft audit is authoritative for the exact current values:

- `graft-weight-audit.generated.json`
- `graft-weight-audit.generated.md`

## Non-blocking guidance

Pressure and Complexity remain advisory. Exceeding a limit changes meter styling and review diagnostics but never prevents selection, review, export, or publication.
