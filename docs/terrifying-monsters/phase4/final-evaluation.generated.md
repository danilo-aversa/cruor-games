# Terrifying Monsters — Final Evaluation v3 Audit

**Evaluation:** `monster-final-evaluation-v3.0-pressure-complexity`  
**Scenarios:** 9  
**Checks:** 65/65 passed

## Scenario scores

| Scenario | Pressure | Complexity | Counterplay | Spike Risk | Build Budget |
|---|---:|---:|---:|---:|---:|
| baseline | 1/6 | 1/6 | 5 | 0 | 14 |
| burst | 1/6 | 1/6 | 5 | 6.32 | 14 |
| hardControl | 4/6 | 2/6 | 5 | 0 | 14 |
| unsafeCounterplay | 1/6 | 1/6 | 1 | 0 | 14 |
| strongCounterplay | 1/6 | 1/6 | 9.5 | 0 | 14 |
| complex | 16/6 | 12/6 | 5 | 0.75 | 14 |
| lowBudget | 1/6 | 1/6 | 5 | 0 | 8 |
| highBudget | 1/6 | 1/6 | 5 | 0 | 24 |
| highCrSameRepertoire | 1/14 | 1/6 | 5 | 0 | 14 |

## Invariant checks

| Status | Check | Evidence |
|---|---|---|
| PASS | baseline-pressure-nonnegative | 1 is nonnegative |
| PASS | baseline-pressure-limit | 6 is a positive guidance limit |
| PASS | baseline-complexity-nonnegative | 1 is nonnegative |
| PASS | baseline-complexity-limit | 6 is a positive guidance limit |
| PASS | baseline-counterplay-scale | 5 is within 0-10 |
| PASS | baseline-spikeRisk-scale | 0 is within 0-10 |
| PASS | burst-pressure-nonnegative | 1 is nonnegative |
| PASS | burst-pressure-limit | 6 is a positive guidance limit |
| PASS | burst-complexity-nonnegative | 1 is nonnegative |
| PASS | burst-complexity-limit | 6 is a positive guidance limit |
| PASS | burst-counterplay-scale | 5 is within 0-10 |
| PASS | burst-spikeRisk-scale | 6.32 is within 0-10 |
| PASS | hardControl-pressure-nonnegative | 4 is nonnegative |
| PASS | hardControl-pressure-limit | 6 is a positive guidance limit |
| PASS | hardControl-complexity-nonnegative | 2 is nonnegative |
| PASS | hardControl-complexity-limit | 6 is a positive guidance limit |
| PASS | hardControl-counterplay-scale | 5 is within 0-10 |
| PASS | hardControl-spikeRisk-scale | 0 is within 0-10 |
| PASS | unsafeCounterplay-pressure-nonnegative | 1 is nonnegative |
| PASS | unsafeCounterplay-pressure-limit | 6 is a positive guidance limit |
| PASS | unsafeCounterplay-complexity-nonnegative | 1 is nonnegative |
| PASS | unsafeCounterplay-complexity-limit | 6 is a positive guidance limit |
| PASS | unsafeCounterplay-counterplay-scale | 1 is within 0-10 |
| PASS | unsafeCounterplay-spikeRisk-scale | 0 is within 0-10 |
| PASS | strongCounterplay-pressure-nonnegative | 1 is nonnegative |
| PASS | strongCounterplay-pressure-limit | 6 is a positive guidance limit |
| PASS | strongCounterplay-complexity-nonnegative | 1 is nonnegative |
| PASS | strongCounterplay-complexity-limit | 6 is a positive guidance limit |
| PASS | strongCounterplay-counterplay-scale | 9.5 is within 0-10 |
| PASS | strongCounterplay-spikeRisk-scale | 0 is within 0-10 |
| PASS | complex-pressure-nonnegative | 16 is nonnegative |
| PASS | complex-pressure-limit | 6 is a positive guidance limit |
| PASS | complex-complexity-nonnegative | 12 is nonnegative |
| PASS | complex-complexity-limit | 6 is a positive guidance limit |
| PASS | complex-counterplay-scale | 5 is within 0-10 |
| PASS | complex-spikeRisk-scale | 0.75 is within 0-10 |
| PASS | lowBudget-pressure-nonnegative | 1 is nonnegative |
| PASS | lowBudget-pressure-limit | 6 is a positive guidance limit |
| PASS | lowBudget-complexity-nonnegative | 1 is nonnegative |
| PASS | lowBudget-complexity-limit | 6 is a positive guidance limit |
| PASS | lowBudget-counterplay-scale | 5 is within 0-10 |
| PASS | lowBudget-spikeRisk-scale | 0 is within 0-10 |
| PASS | highBudget-pressure-nonnegative | 1 is nonnegative |
| PASS | highBudget-pressure-limit | 6 is a positive guidance limit |
| PASS | highBudget-complexity-nonnegative | 1 is nonnegative |
| PASS | highBudget-complexity-limit | 6 is a positive guidance limit |
| PASS | highBudget-counterplay-scale | 5 is within 0-10 |
| PASS | highBudget-spikeRisk-scale | 0 is within 0-10 |
| PASS | highCrSameRepertoire-pressure-nonnegative | 1 is nonnegative |
| PASS | highCrSameRepertoire-pressure-limit | 14 is a positive guidance limit |
| PASS | highCrSameRepertoire-complexity-nonnegative | 1 is nonnegative |
| PASS | highCrSameRepertoire-complexity-limit | 6 is a positive guidance limit |
| PASS | highCrSameRepertoire-counterplay-scale | 5 is within 0-10 |
| PASS | highCrSameRepertoire-spikeRisk-scale | 0 is within 0-10 |
| PASS | burst-does-not-change-pressure | 1 == 1 |
| PASS | burst-increases-spike-risk | 0 -> 6.32 |
| PASS | hard-control-increases-pressure | 1 -> 4 |
| PASS | counterplay-independent-from-pressure | 1 == 1 |
| PASS | counterplay-score-remains-independent | 1 -> 9.5 |
| PASS | multi-system-repertoire-increases-pressure | 1 -> 16 |
| PASS | multi-system-repertoire-increases-complexity | 1 -> 12 |
| PASS | build-budget-independent-from-pressure | 1 == 1 |
| PASS | build-budget-independent-from-complexity | 1 == 1 |
| PASS | same-repertoire-same-pressure-weight | 1 == 1 |
| PASS | higher-cr-higher-pressure-capacity | 6 -> 14 |

## Contract confirmed

- Pressure measures the tactical load presented to players, not DPR, HP, AC, or estimated CR.
- Target CR changes the Pressure limit, not the weight of identical content.
- Complexity measures DM decisions, triggers, state, board objects, branching, and special systems.
- Counterplay remains independent and never subtracts from Pressure.
- Spike Risk remains a separate 0–10 damage-volatility measure.
- Build Budget remains an internal build-points envelope and is not a Pressure limit.
