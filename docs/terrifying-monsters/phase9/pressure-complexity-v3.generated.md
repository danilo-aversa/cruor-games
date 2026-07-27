# Terrifying Monsters — Pressure / Complexity v3 Audit

**Model:** `monster-pressure-complexity-v3.4-graft-weight`

**Catalog:** 93 grafts

**Checks:** 11/11 passed

## Pressure capacity by CR

| Target CR | Pressure limit |
|---|---:|
| 0–1 | 4 |
| 2–4 | 6 |
| 5–8 | 8 |
| 9–12 | 10 |
| 13–16 | 12 |
| 17–20 | 14 |
| 21–30 | 16 |

Role and Tier can modify this capacity, but CR 0–4 positive inflation is capped at +2.

## CR 2 Attack Pattern calibration

1 of 15 Attack Patterns consume at least the complete standard CR 2 Pressure allowance; 1 exceed it.

| Attack Pattern | Abilities | Pressure | Complexity | Guidance |
|---|---:|---:|---:|---|
| Web Hunter | 3 | 7/6 | 3/6 | Over |
| Venom Spitter | 3 | 5/6 | 2/6 | Within |
| Crusher | 3 | 4/6 | 3/6 | Within |
| Broodmaker | 3 | 4/6 | 2/6 | Within |
| Shadow Weaver | 3 | 4/6 | 2/6 | Within |
| Venom Hunter | 3 | 4/6 | 2/6 | Within |
| Corpse Binder | 2 | 3/6 | 2/6 | Within |
| Grave Eater | 3 | 3/6 | 2/6 | Within |
| Impaler | 3 | 3/6 | 1/6 | Within |
| Acid Brute | 1 | 1/6 | 1/6 | Within |
| Cold Touch | 1 | 1/6 | 1/6 | Within |
| Grappler | 1 | 1/6 | 1/6 | Within |
| Juggernaut | 1 | 1/6 | 1/6 | Within |
| Plague Eater | 3 | 1/6 | 1/6 | Within |
| Rot Eater | 3 | 1/6 | 1/6 | Within |

## Full-catalog stress case

Selecting all 93 grafts at CR 2 compiles 131 abilities and produces Pressure 116/6 and Complexity 170/10. This is intentionally advisory rather than blocked.

## Checks

| Status | Check | Evidence |
|---|---|---|
| PASS | catalog-has-93-grafts | 93 grafts |
| PASS | catalog-has-15-attack-patterns | 15 Attack Patterns |
| PASS | pressure-curve-seven-bands | 7 bands |
| PASS | cr2-pressure-limit-six | limit 6 |
| PASS | cr20-pressure-limit-fourteen | limit 14 |
| PASS | low-cr-tier-inflation-capped | limit 8 |
| PASS | complexity-cr-independent | same frame gives same Complexity limit |
| PASS | complex-attack-pattern-can-saturate-cr2 | 1/15 Attack Patterns use at least 6 Pressure |
| PASS | full-catalog-overloads-cr2 | 116/6 |
| PASS | damage-magnitude-does-not-change-pressure | 1 == 1 |
| PASS | damage-magnitude-does-not-change-complexity | 1 == 1 |
