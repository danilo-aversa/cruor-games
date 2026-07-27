# Pressure / Complexity v3.1 Wiring Hotfix

## Problem

The runtime model exposed both `buildBudget` and `pressureLimit`, but several UI and review consumers still read `computed.budget`. A CR 4 Standard / Normal frame could therefore render `Pressure 0 / 14`, where 14 was the Forge build budget rather than the CR-scaled Pressure guidance of 6.

## Contract

- `computed.buildBudget`: automatic Forge selection envelope.
- `computed.budget`: legacy alias for the Forge build budget.
- `computed.pressureLimit`: only valid denominator for Pressure meters, utilization, review guidance, compatibility previews, and publish warnings.
- `computed.complexityCap`: DM-facing Complexity guidance.

Pressure and Complexity remain advisory and do not block navigation, export, or publication.

## Regression fixture

For CR 4, Standard footprint, Brute role, Normal tier, Standard tempo, Hard danger:

- Build Budget: 14
- Pressure Limit: 6
- Complexity Cap: 6

The visible Pressure meter must render `0 / 6`, never `0 / 14`.
