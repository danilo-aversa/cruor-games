# Bestiary Attack-Action Distribution Audit

Source: `/mnt/data/Bestiary.csv` (503 monsters).

## Method
- `Action headings`: named entries in the Actions field, including Multiattack and Spellcasting.
- `Offensive options`: named entries excluding Multiattack whose text contains an Attack Roll, Saving Throw, or damage.
- `Multiattack prevalence`: share of monsters with a named Multiattack action.
- `Median attacks`: parsed attack count from Multiattack text when present.

## CR bands

| CR band | N | Median action headings | Mean offensive options | 2+ offensive options | 3+ offensive options | Multiattack | Median attacks when present |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0–1 | 175 | 1 | 1.33 | 31.43% | 2.29% | 13.71% | 2 |
| 2–4 | 127 | 3 | 1.72 | 58.27% | 11.81% | 70.08% | 2 |
| 5–8 | 98 | 3 | 1.91 | 72.45% | 14.29% | 93.88% | 2 |
| 9–12 | 47 | 4 | 1.98 | 78.72% | 17.02% | 97.87% | 3 |
| 13–16 | 26 | 4 | 2.96 | 96.15% | 38.46% | 96.15% | 3 |
| 17+ | 30 | 4 | 2.67 | 100.00% | 50.00% | 100.00% | 3 |

## Current Phase 5 mismatch

All 15 current Attack Pattern v2 grafts compile with a fixed Multiattack count of 2.
Their authored repertoires contain 1–3 abilities regardless of target CR.
`targetCr` is passed to the audit/runtime routine, but it does not filter or unlock authored abilities and does not alter the authored Multiattack descriptor.

Therefore the current Phase 5 implementation is not CR-dynamic.
