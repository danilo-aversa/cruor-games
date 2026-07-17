# Phase 8 batch 3 — The Mist approval record

## Decision

The Mist candidate 1 is the approved canonical v2 migration for Inspiration
Archive and Dark Places. Danilo approved its editorial and transformative-use
boundary on 2026-07-17 after repeatable local QA passed.

| Tracking field | Value |
| --- | --- |
| Module | `the-mist` |
| Review version | `phase8-the-mist-editorial-candidate-v1` |
| Migration status | `complete` |
| Editorial status | `approved` |
| Semantic coverage | `complete` |
| Sample QA | `passed-zero-diagnostics` |
| Reviewer | Danilo |
| Reviewed at | 2026-07-17 |
| Remaining blocker | `image-provenance-required` |

Canonical Inspiration status, provenance, review date, and the migration record
now agree. Module/component `in-review` and pack `draft` continue to represent
publication/runtime state. The local card image remains unpublished until its
creator, license, source URL, and final alt text are verified.

## Capability and source boundary

The module owns Archive + Dark Places only: 22 location components and 2
regions are accounted for; Monster Composer is unsupported rather than
incomplete.

The literary source contributes only high-level principles of enclosure,
obscured threat, shelter versus exposure, consequential thresholds, and social
fracture. The White Refuge, Orientation Drift, route anchors, paired
observation, copied landmarks, borrowed memories, safe protocol, clue flow, and
announced White Breach are original Cruor game structures. The approved module
does not reproduce source characters, place names, quoted prose, scene order,
adaptation imagery, or distinctive creature designs.

## Fair-navigation rule

Orientation Drift may alter perception and expectation but never silently
rewrite authored topology. The procedure requires:

- visible discrepancies;
- physical route anchors and paired verification;
- an anchored retreat;
- explicit counterplay;
- an announced final breach with a full response window.

Four progressive Recurring Signs, sensory material, Read-Aloud pools, and the
Session Guide convert uncertainty into learnable evidence rather than arbitrary
GM negation.

## Ownership and compatibility

The semantic module belongs to the migration/Studio catalog. The production
Archive registry continues using the production module catalog during staged
migration; no The Mist bridge pack is needed and no legacy producer or consumer
is deleted.

## Acceptance

| Requirement | Status |
| --- | --- |
| Canonical Archive + Dark Places module | Complete |
| All 24 Dark Places legacy IDs accounted for | Complete |
| Transformative-use boundary | Approved |
| Stable-topology and counterplay invariants | Complete |
| Warning-free deterministic samples | Complete |
| Production registry preserved | Complete |
| Image rights and final visual review | Open publication gate |
| Legacy deletion | Not permitted |

## Repeatable QA

```powershell
npm run qa:dark-places:semantic-phase8-batch3
npm run qa:dark-places:semantic-phase8
npm run content:validate
npm run test:run
npm run build
```
