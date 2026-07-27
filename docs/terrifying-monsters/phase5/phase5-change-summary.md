# Terrifying Monsters — Phase 5.1 Cumulative Change Summary

## Status of the previous Phase 5

The original Phase 5 successfully converted all 15 Attack grafts into multi-ability Attack Pattern v2 bundles, but those bundles were static: the same actions and two-attack Multiattack were compiled at every CR. Phase 5.1 supersedes that behavior while retaining the Phase 5 editorial content and public IDs.

## Scope completed

- All 15 Attack Patterns now have CR 0–30 progression bands.
- Repertoire and Multiattack cadence scale independently.
- The same graft can compile to one action at low CR, two actions at mid CR, and up to three actions at high CR.
- Multiattack can be absent, contain two attacks, or contain three attacks according to the active band.
- Projection occurs before Ability Model consumers, DPR simulation, final evaluation, rendering, and export.
- Presets, selected graft IDs, Source Anchors, slot occupancy, fit data, and compatibility data remain stable.

## Bestiary calibration result

The generated 15-pattern catalogue tracks the observed 503-monster distribution:

| Checkpoint | Mean options | Multiattack | Median attacks |
|---|---:|---:|---:|
| CR 1 | 1.267 | 13.3% | 2 |
| CR 2 | 1.733 | 66.7% | 2 |
| CR 5 | 1.933 | 93.3% | 2 |
| CR 8 | 2.133 | 100% | 3 |
| CR 10 | 2.133 | 100% | 3 |
| CR 15 | 2.400 | 100% | 3 |

The catalogue intentionally varies by tactical identity. Fast venomous predators unlock cadence earlier; heavy collision patterns unlock it later; `cold-funeral-touch` remains a narrow repertoire even at high CR while its cadence increases.

## Runtime changes

- Added a pure CR projection model.
- Graft v2 schema now validates progression bands and ability references.
- Ability bundles can compile directly for a target CR.
- The projected Ability Model updates both available actions and the synthetic Multiattack count.
- The D&D 5E 2024 ruleset routes DPR simulation through the CR-scaled adapter.
- Attack Routine filters unavailable abilities before allocating DPR.
- Final Evaluation v2 uses the projected model.
- Stat-block export removes static Multiattack entries and emits only the active routine.
- Registry and Content Pack adapters preserve progression metadata.

## QA and reporting

- Six CR checkpoints: 1, 2, 5, 8, 10, 15.
- Per-pattern monotonicity, schema, reference, routine, and rendering checks.
- Catalogue-level Bestiary tolerance checks.
- Generated Markdown and JSON reports.
- Monster Content QA now promotes catalogue progression failures to blocking issues.

## Files to delete

None. Phase 5.1 overwrites the existing Phase 5 implementation and generated reports, then adds the progression model and the CR-scaled DPR adapter. No Phase 5 path becomes obsolete.

## Intentionally unchanged

- no JSX or CSS;
- no layout, navigator, sidebar, or slot-cap changes;
- no Creator Studio, Content Studio, or Inspiration Studio files;
- no public graft ID changes;
- no changes to non-Attack graft content.
