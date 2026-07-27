# Terrifying Monsters — Final Evaluation v2 Audit

**Evaluation:** `monster-final-evaluation-v2.1-cr-scaled-repertoire`  
**Scenarios:** 8  
**Checks:** 40/40 passed

## Scenario scores

| Scenario | Pressure | Complexity | Counterplay | Spike Risk | Build Budget |
|---|---:|---:|---:|---:|---:|
| baseline | 3.23 | 0.55 | 5 | 0 | 14 |
| burst | 5.6 | 0.55 | 5 | 6.32 | 14 |
| hardControl | 5.32 | 0.55 | 5 | 1.3 | 14 |
| unsafeCounterplay | 3.23 | 0.55 | 1 | 0 | 14 |
| strongCounterplay | 3.23 | 0.55 | 9.5 | 0 | 14 |
| complex | 4.84 | 7.84 | 5 | 0.75 | 14 |
| lowBudget | 3.23 | 0.55 | 5 | 0 | 8 |
| highBudget | 3.23 | 0.55 | 5 | 0 | 24 |

## Invariant checks

| Status | Check | Evidence |
|---|---|---|
| PASS | baseline-pressure-scale | 3.23 is within 0-10 |
| PASS | baseline-complexity-scale | 0.55 is within 0-10 |
| PASS | baseline-counterplay-scale | 5 is within 0-10 |
| PASS | baseline-spikeRisk-scale | 0 is within 0-10 |
| PASS | burst-pressure-scale | 5.6 is within 0-10 |
| PASS | burst-complexity-scale | 0.55 is within 0-10 |
| PASS | burst-counterplay-scale | 5 is within 0-10 |
| PASS | burst-spikeRisk-scale | 6.32 is within 0-10 |
| PASS | hardControl-pressure-scale | 5.32 is within 0-10 |
| PASS | hardControl-complexity-scale | 0.55 is within 0-10 |
| PASS | hardControl-counterplay-scale | 5 is within 0-10 |
| PASS | hardControl-spikeRisk-scale | 1.3 is within 0-10 |
| PASS | unsafeCounterplay-pressure-scale | 3.23 is within 0-10 |
| PASS | unsafeCounterplay-complexity-scale | 0.55 is within 0-10 |
| PASS | unsafeCounterplay-counterplay-scale | 1 is within 0-10 |
| PASS | unsafeCounterplay-spikeRisk-scale | 0 is within 0-10 |
| PASS | strongCounterplay-pressure-scale | 3.23 is within 0-10 |
| PASS | strongCounterplay-complexity-scale | 0.55 is within 0-10 |
| PASS | strongCounterplay-counterplay-scale | 9.5 is within 0-10 |
| PASS | strongCounterplay-spikeRisk-scale | 0 is within 0-10 |
| PASS | complex-pressure-scale | 4.84 is within 0-10 |
| PASS | complex-complexity-scale | 7.84 is within 0-10 |
| PASS | complex-counterplay-scale | 5 is within 0-10 |
| PASS | complex-spikeRisk-scale | 0.75 is within 0-10 |
| PASS | lowBudget-pressure-scale | 3.23 is within 0-10 |
| PASS | lowBudget-complexity-scale | 0.55 is within 0-10 |
| PASS | lowBudget-counterplay-scale | 5 is within 0-10 |
| PASS | lowBudget-spikeRisk-scale | 0 is within 0-10 |
| PASS | highBudget-pressure-scale | 3.23 is within 0-10 |
| PASS | highBudget-complexity-scale | 0.55 is within 0-10 |
| PASS | highBudget-counterplay-scale | 5 is within 0-10 |
| PASS | highBudget-spikeRisk-scale | 0 is within 0-10 |
| PASS | burst-increases-pressure | 3.23 -> 5.6 |
| PASS | burst-increases-spike-risk | 0 -> 6.32 |
| PASS | hard-control-increases-pressure | 3.23 -> 5.32 |
| PASS | counterplay-independent-from-pressure | 3.23 == 3.23 |
| PASS | counterplay-score-remains-independent | 1 -> 9.5 |
| PASS | flattened-repertoire-increases-complexity | 0.55 -> 7.84 |
| PASS | build-budget-independent-from-pressure | 3.23 == 3.23 |
| PASS | build-budget-independent-from-complexity | 0.55 == 0.55 |

## Contract confirmed

- Pressure is calculated from finalized DPR, burst, effective defense, conditions, tempo and reach.
- Complexity is calculated from the flattened ability repertoire and DM-facing handling requirements.
- Counterplay is measured independently and never subtracted from Pressure.
- Spike Risk is separate from average Pressure.
- Build Budget remains a build-points envelope and does not define the 0–10 Pressure scale.
