# Terrifying Monsters — Phase 2 Change Summary

## Outcome

The Monster Composer can now compile one graft into an ability bundle without changing the behavior of the current catalogue.

## Implemented

- Added the `monster-graft-v2.0` schema and validator.
- Added the `monster-ability-bundle-v1.0` compiler boundary.
- Preserved the legacy one-graft/one-ability adapter.
- Added stable nested runtime ids.
- Added ability-level provenance.
- Added graft-level authored Multiattack projection.
- Flattened bundles into the existing ability model consumed by the CR pipeline.
- Fixed same-graft attack allocation collisions by keying allocations with ability ids.
- Preserved complete Graft v2 fields through content-pack adapters and the Phase 1 authority resolver.
- Added bundle-aware Monster content QA.
- Added debug-export visibility for the complete bundle while retaining the legacy primary `ability` field.
- Added deterministic bridge auditing and focused Vitest coverage.

## Verified production compatibility

The deterministic audit reports:

- 90 current grafts;
- 90 compiled abilities;
- 90 legacy-adapter grafts;
- 0 active production Graft v2 records;
- 0 synthetic production abilities;
- unchanged graft order;
- unchanged runtime ids;
- unchanged normalized rules and core runtime projection;
- no bundle validation errors.

A synthetic two-action Attack Pattern compiles into:

```text
Multiattack
Heavy Slam
Corpse Grab
```

with two distinct DPR allocation keys rather than one overwritten graft-level allocation.

## Intentionally unchanged

- React and JSX files;
- CSS and all visual styling;
- slots and slot caps;
- selection behavior;
- Frame controls;
- public output hierarchy;
- current graft content;
- Source Anchor authority modes;
- Pressure and Complexity formulas;
- D&D 5E 2024 ruleset mathematics.

## Phase 3 entry condition

Phase 3 may begin after local repository verification. Its scope is the parity contract:

```text
structured rule = simulated rule = rendered rule
```

It should begin with known discrepancies such as Heavy Slam and Skin Slippage before any broad editorial rewrite of the Attack Pattern catalogue.
