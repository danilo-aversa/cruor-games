# Legacy And Transitional Systems

## Confirmed Transitional Systems

| System | Evidence | Current Consumer | Risk |
| --- | --- | --- | --- |
| Monster content model overlap | Native `monster-grafts.js` plus registry-fed `monster-content-pack-feed.js` | Monster Composer | Medium: schema changes need both paths reviewed |
| Content adapters | `shared/content/content-repository.adapter.js` bridges static registry into repository-style access | Inspirations, Studio, Monster/Darken adapters | Medium: adapter output can hide upstream schema drift |
| Legacy content packs | Files with legacy naming and adapter references | Shared content consumers | Medium: removal risk depends on registry provenance |
| Nested tests | `tests/tests/` and `tests/tests/tests/` | No current Vitest include consumer | Low runtime risk, medium maintenance confusion |
| Circle anchor reference test | `scripts/map-generator.circle-anchors.test.js` | Reference-only | Low runtime risk, can confuse QA selection |

## Reference-Only Areas

`reports/` and feature-local report folders are historical evidence. They are useful for understanding previous work but are not current runtime truth unless imported by source files.

## Documentation Drift

Older docs and reports may use names or architecture descriptions that no longer match current code. Prefer this repository map and direct source inspection when there is a conflict.

## Removal Risk

Do not delete legacy or transitional files during ordinary feature work. First prove import status, script usage, CI usage, and generated artifact ownership.

