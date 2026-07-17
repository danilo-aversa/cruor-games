# Phase 8 batch 2 — Decomposition editorial revision 2

## Decision

Decomposition revision 2 is the approved canonical v2 migration for
**Inspiration Archive and Dark Places**. Danilo approved it on 2026-07-17 after
repeatable local QA passed.

The 26 Decomposition Monster grafts were already modern before this project.
They remain owned exclusively by
`features/monster-composer/data/monster-grafts.js`. Recovery A–D removes their
copied semantic source and replaces duplicate ownership with a source-anchor
parity check.

| Tracking field | Value |
| --- | --- |
| Module | `decomposition` |
| Review version | `phase8-decomposition-editorial-revision-v2` |
| Migration status | `complete` |
| Editorial status | `approved` |
| Owned semantic capabilities | Archive + Dark Places |
| External modern link | Monster Composer, 26 grafts |
| Semantic coverage | `complete` |
| Sample QA | `passed-zero-diagnostics` |
| Reviewer | Danilo |
| Reviewed at | 2026-07-17 |
| Remaining blocker | `image-provenance-required` |

Editorial approval is recorded in both canonical provenance and the migration
registry. Module/component `in-review` and pack `draft` remain publication and
runtime states, not contradictory editorial decisions.

## Source boundary

The dossier records published forensic sources on environmental variation and
non-linear insect colonization. The real biological process is used as a
vocabulary, not as a universal fixed clock. The Second Autopsy, synchronized
vents, backward corpse, identity exchange, and all supernatural procedures are
fictional game content.

Revision 2 also uses setting-flexible terminology such as mortuary archive,
death examiners, season of mass death, and registry number.

## Dark Places procedure

The Accelerated Decay Clock distinguishes:

- at most one advance per combat round;
- at most one advance per ten-minute exploration turn;
- explicit actions for correcting records and cross-ventilation;
- an announced Stage 4 counterplay window before Final Processing resolves.

The ten authored semantic components account exactly once for all 27 legacy
Dark Places location/region IDs.

## Monster ownership boundary

The semantic pack contains **zero** Monster graft components. Recovery A–D:

- retires the copied `decomposition-monster-grafts-v2.js` payload;
- preserves all 26 modern grafts without editing their mechanics, balance,
  anatomy, frame fit, IDs, or rules;
- verifies the modern graft count and shared-adapter parity by source anchor;
- keeps Monster editing and QA inside the existing Monster Composer system.

## Preserved behavior

The active production registry retains 14 Archive Inspirations and the existing
Decomposition-linked production data. The semantic candidate is used by the
migration/Studio catalog only. No current Monster or Dark Places runtime source
is deleted.

## Acceptance

| Requirement | Status |
| --- | --- |
| Canonical Archive + Dark Places module | Complete |
| Published biological source and uncertainty framing | Complete |
| Exploration/combat cadence and Stage 4 response | Complete |
| All 27 Dark Places legacy IDs accounted for | Complete |
| 26 modern Monster grafts verified externally | Complete |
| Duplicated Monster payload removed | Complete |
| Human editorial review | Approved |
| Image rights and final visual review | Open publication gate |
| Legacy deletion | Not permitted |

## Repeatable QA

```powershell
npm run qa:dark-places:semantic-phase8-batch2
npm run qa:dark-places:semantic-phase8
npm run monster:qa
npm run content:validate
npm run test:run
npm run build
```
