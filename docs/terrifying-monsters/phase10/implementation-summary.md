# Phase 10 Implementation Summary

## Engine

- Added a compiler-owned Basic Attack when no authored Attack Pattern is selected.
- Kept the fallback outside user selection and slot occupancy.
- Routed the compiled fallback through ability compilation, CR fitting, stat-block grouping, export actions, and QA frame construction.
- Suppressed the fallback as soon as an authored Attack Pattern is present.
- Retained the existing high-CR routine projection for action-economy scaling.

## Authoring flow

- Body and Weakness / Tell remain the required publishable core.
- Attack Pattern is optional in guided flow and publish gating.
- Forge still attempts Body, Attack Pattern, and Weakness / Tell by default.
- Pressure and Complexity limits remain advisory and non-blocking.

## Pressure / Complexity

- Added a slot-family prior after the mechanical ability analysis.
- Calibrated the prior against 503 Monster Manual 2025 creatures in `Bestiary.csv`.
- Movement, Twist, Horror, Death, and Lair now carry differentiated exceptional-system weight.
- Ordinary Attack Patterns receive a baseline discount without erasing the cost of complex routines.
- Weakness remains light because it exposes counterplay.
- Compiler-generated Basic Attack and routine helpers add no graft-family weight.

## Generated evidence

- `graft-weight-audit.generated.json`
- `graft-weight-audit.generated.md`
- updated Phase 9 Pressure / Complexity audit
