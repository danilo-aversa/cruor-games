# Graft Weight and Basic Attack Audit

- Pressure/Complexity model: `monster-pressure-complexity-v3.4-graft-weight`
- Basic Attack compiler: `monster-basic-attack-v1.0`
- Catalog: 93 grafts across 9 slots
- Bestiary corpus: 503 Monster Manual 2025 creatures
- Gate: **PASS** (16/16)

## Bestiary findings

A basic attack appears on 99.6% of creatures and is treated as baseline, not graft load. A full Attack Pattern appears on 71.4% of the corpus, while special movement appears on 30.6%. In CR 2–4 specifically, the comparison is 82% Attack Pattern versus 23% special movement. Rarity is not used mechanically on its own: Weakness stays light because it grants counterplay, and Death stays conditional because it resolves only at the end of the creature's life.

## Adjusted slot averages at CR 5

| Slot | Bestiary prevalence | Avg Pressure | Avg Complexity | Pressure range | Complexity range |
|---|---:|---:|---:|---:|---:|
| attack | 71.4% | 3.8 | 2.07 | 1–8 | 1–5 |
| body | 33.8% | 1.5 | 1.25 | 1–3 | 1–3 |
| death | 2.0% | 4 | 3.5 | 3–5 | 2–5 |
| horror | 12.1% | 5.25 | 2.25 | 4–6 | 2–3 |
| lair | 7.0% | 5.43 | 4.86 | 5–7 | 4–5 |
| mind | 25.8% | 2.82 | 2.55 | 2–4 | 1–4 |
| movement | 30.6% | 4.64 | 3.09 | 4–5 | 1–4 |
| twist | 12.1% | 3.92 | 3.5 | 3–5 | 2–5 |
| weakness | 9.1% | 1.54 | 1 | 1–3 | 1–1 |

## Attack Pattern versus Movement across CR

| Target CR | Attack Pressure | Attack Complexity | Movement Pressure | Movement Complexity |
|---:|---:|---:|---:|---:|
| 2 | 2.87 | 1.67 | 4.64 | 3.09 |
| 5 | 3.8 | 2.07 | 4.64 | 3.09 |
| 15 | 5.87 | 2.93 | 4.64 | 3 |

At low and mid CR, special Movement is heavier on both axes. At high CR, some Attack Patterns unlock additional actions and progression, so their player-facing Pressure can legitimately overtake a static Movement graft; this comes from the compiled repertoire rather than from the family prior.

## Basic Attack fallback

- Compiled title: **Zombie Strike**
- Compiled actions: 1
- Pressure contribution: 0
- Complexity contribution: 0
- An authored Attack Pattern removes the fallback rather than stacking with it.

## Gate checks

| Status | Check | Detail |
|---|---|---|
| PASS | catalog-has-93-grafts | 93 grafts |
| PASS | catalog-has-nine-slots | 9 slots |
| PASS | baseline-attack-added | fallback-added |
| PASS | baseline-attack-is-an-action | 1 compiled ability |
| PASS | baseline-attack-pressure-zero | 0 Pressure |
| PASS | baseline-attack-complexity-zero | 0 Complexity |
| PASS | authored-attack-suppresses-fallback | authored-attack-pattern |
| PASS | movement-pressure-heavier-than-attack | 4.64 > 3.8 |
| PASS | movement-complexity-heavier-than-attack | 3.09 > 2.07 |
| PASS | cr2-movement-pressure-heavier | 4.64 > 2.87 |
| PASS | cr2-movement-complexity-heavier | 3.09 > 1.67 |
| PASS | high-cr-attack-progression-visible | 5.87 > 3.8 |
| PASS | weakness-complexity-remains-light | 1 |
| PASS | complex-attack-can-saturate-cr2 | 1 patterns |
| PASS | all-graft-scores-finite | all finite |
| PASS | all-grafts-have-minimum-guidance | all >= 1 |

## Per-graft audit

| Slot | Graft | Raw Pressure | Adjusted Pressure | Raw Complexity | Adjusted Complexity |
|---|---|---:|---:|---:|---:|
| attack | Shadow Weaver | 10 | 8 | 5 | 5 |
| attack | Web Hunter | 9 | 7 | 3 | 3 |
| attack | Grappler | 7 | 5 | 3 | 2 |
| attack | Venom Spitter | 7 | 5 | 3 | 2 |
| attack | Crusher | 6 | 4 | 4 | 3 |
| attack | Broodmaker | 6 | 4 | 2 | 2 |
| attack | Corpse Binder | 6 | 4 | 3 | 2 |
| attack | Juggernaut | 6 | 4 | 2 | 2 |
| attack | Venom Hunter | 6 | 4 | 3 | 2 |
| attack | Acid Brute | 5 | 3 | 3 | 2 |
| attack | Grave Eater | 5 | 3 | 3 | 2 |
| attack | Impaler | 5 | 3 | 2 | 1 |
| attack | Cold Touch | 1 | 1 | 1 | 1 |
| attack | Plague Eater | 3 | 1 | 1 | 1 |
| attack | Rot Eater | 3 | 1 | 1 | 1 |
| body | Swollen Corpse | 3 | 3 | 1 | 1 |
| body | Egg Carrier | 2 | 2 | 3 | 3 |
| body | Anchored Spirit | 2 | 2 | 2 | 2 |
| body | Bloat Hide | 2 | 2 | 1 | 1 |
| body | Broodling | 2 | 2 | 1 | 1 |
| body | Barbed Chitin | 1 | 1 | 1 | 1 |
| body | Clinging Body | 1 | 1 | 1 | 1 |
| body | Corpse Mass | 1 | 1 | 1 | 1 |
| body | Shadow Skin | 1 | 1 | 1 | 1 |
| body | Shedding Skin | 1 | 1 | 1 | 1 |
| body | Waxen Flesh | 1 | 1 | 1 | 1 |
| body | Web Sense | 1 | 1 | 1 | 1 |
| death | Death Cocoon | 4 | 5 | 3 | 5 |
| death | Corpse Bloom | 4 | 5 | 3 | 4 |
| death | Brood Burst | 3 | 4 | 3 | 4 |
| death | Purge Flood | 4 | 4 | 3 | 4 |
| death | Spectral Dust | 4 | 4 | 3 | 4 |
| death | Toxic Detonation | 3 | 4 | 2 | 3 |
| death | Last Face Curse | 3 | 3 | 1 | 2 |
| death | Last Meal Memory | 3 | 3 | 1 | 2 |
| horror | Horrific Apparition | 5 | 6 | 2 | 2 |
| horror | Wail | 5 | 6 | 2 | 2 |
| horror | Crawling Dread | 5 | 5 | 1 | 2 |
| horror | Stench | 4 | 4 | 2 | 3 |
| lair | Broodmother Web | 6 | 7 | 4 | 5 |
| lair | Snapping Webs | 5 | 6 | 3 | 5 |
| lair | Dense Webs | 3 | 5 | 3 | 5 |
| lair | Funeral Silence | 4 | 5 | 3 | 5 |
| lair | Graveyard Offerings | 3 | 5 | 3 | 5 |
| lair | Pressure Corpses | 4 | 5 | 3 | 5 |
| lair | Choking Air | 3 | 5 | 3 | 4 |
| mind | Corpse Hunger | 3 | 4 | 3 | 4 |
| mind | Brood Guard | 2 | 3 | 2 | 3 |
| mind | Many Eyes | 2 | 3 | 2 | 3 |
| mind | Night Hunter | 2 | 3 | 2 | 3 |
| mind | Pain Fixation | 3 | 3 | 2 | 3 |
| mind | Patient Hunter | 2 | 3 | 2 | 3 |
| mind | Stolen Life | 2 | 3 | 2 | 3 |
| mind | Funeral Hunger | 2 | 3 | 1 | 2 |
| mind | Borrowed Face | 2 | 2 | 1 | 2 |
| mind | Dead Impostor | 2 | 2 | 1 | 1 |
| mind | Single Command | 2 | 2 | 1 | 1 |
| movement | Cunning Hunt | 2 | 5 | 2 | 4 |
| movement | Shadow Step | 2 | 5 | 2 | 4 |
| movement | Unseen Advance | 2 | 5 | 2 | 4 |
| movement | Vanish | 2 | 5 | 2 | 4 |
| movement | Rupture Charge | 2 | 5 | 2 | 3 |
| movement | Wall Stalker | 2 | 5 | 2 | 3 |
| movement | Web Swing | 2 | 5 | 2 | 3 |
| movement | Ghost Passage | 2 | 4 | 2 | 3 |
| movement | Predatory Leap | 2 | 4 | 2 | 3 |
| movement | Dead March | 2 | 4 | 2 | 2 |
| movement | Crawling Ruin | 2 | 4 | 1 | 1 |
| twist | Flesh Harvest | 4 | 5 | 3 | 5 |
| twist | Web Architect | 4 | 5 | 3 | 4 |
| twist | Horrific Assault | 3 | 4 | 3 | 5 |
| twist | Changing Mask | 3 | 4 | 3 | 4 |
| twist | Gas Buildup | 3 | 4 | 3 | 4 |
| twist | Dangerously Unstable | 3 | 4 | 2 | 3 |
| twist | Unstable Rupture | 3 | 4 | 2 | 3 |
| twist | Corrosive Web | 3 | 4 | 1 | 2 |
| twist | Siege Monster | 3 | 4 | 1 | 2 |
| twist | Enrage | 2 | 3 | 2 | 4 |
| twist | Witness Rage | 2 | 3 | 2 | 4 |
| twist | Undead Fortitude | 2 | 3 | 1 | 2 |
| weakness | Consecrated Bait | 3 | 3 | 1 | 1 |
| weakness | Eye Cluster | 2 | 2 | 1 | 1 |
| weakness | Fear of Fire | 3 | 2 | 1 | 1 |
| weakness | Salt and True Names | 3 | 2 | 1 | 1 |
| weakness | Sunlight Weakness | 3 | 2 | 1 | 1 |
| weakness | Unsteady Legs | 3 | 2 | 1 | 1 |
| weakness | Brood Sac | 2 | 1 | 1 | 1 |
| weakness | Dismemberment | 2 | 1 | 1 | 1 |
| weakness | Exposed Skull | 2 | 1 | 1 | 1 |
| weakness | Exposed Underbelly | 2 | 1 | 1 | 1 |
| weakness | Radiant Disruption | 2 | 1 | 1 | 1 |
| weakness | Shame | 2 | 1 | 1 | 1 |
| weakness | Softened Wax | 2 | 1 | 1 | 1 |
