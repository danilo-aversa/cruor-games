# Phase 8 batch 1 — Sedlec Ossuary approval record

## Decision

Sedlec Ossuary is the first approved canonical Inspiration Module v2. Danilo
recorded the editorial decision on 2026-07-16 after deterministic sample QA
passed with zero diagnostics.

| Tracking field | Value |
| --- | --- |
| Module | `sedlec-ossuary` |
| Migration status | `complete` |
| Editorial status | `approved` |
| Semantic coverage | `complete` |
| Sample QA | `passed-zero-diagnostics` |
| Reviewer | Danilo |
| Reviewed at | 2026-07-16 |
| Remaining blocker | `image-provenance-required` |

Editorial approval is distinct from publication. The module and pack remain
`in-review`/`draft` runtime content while the local card image lacks verified
creator, license, source URL, and final visual review.

## Approved scope

The approved Archive and Dark Places material separates the historical ossuary
from the fictional Litany Engine. It includes:

- one Place Identity;
- one Site Atmosphere;
- one complete Global Rule;
- four Recurring Signs;
- a six-sense, three-intensity sensory pool;
- compact, standard, and extended Read-Aloud material;
- one operational Session Guide with clue flow, pressure, stall moves, and
  pacing guidance.

The sample-driven revision expanded taste and temperature variants and added
broadly compatible visible and unsettling fragments to prevent fallback prose
in reviewed five-to-seven-room builds.

## Deterministic sample review

The approved sample set contains Crypt/Medium with 5 rooms, Chapel/High with 7
rooms, and Archive/Low with 6 rooms. Each case must compile twice to identical
canonical bytes with zero diagnostics. Fingerprints are runtime-derived
determinism checks rather than permanent publication identifiers; Recovery C
changes approved metadata and therefore does not preserve the earlier candidate
fingerprint values.

## Ownership and compatibility

The canonical semantic module belongs to the migration/Studio catalog. The
production Archive registry remains on its existing production modules during
the staged migration, so current Inspirations and Dark Places behavior remain
available. No legacy file is removed by this batch.

## Acceptance

| Requirement | Status |
| --- | --- |
| Canonical Archive + Dark Places module | Complete |
| Human editorial review | Approved |
| Required semantic coverage | Complete |
| Warning-free deterministic samples | Complete |
| Production registry preserved | Complete |
| Image rights and final visual review | Open publication gate |
| Legacy deletion | Not permitted |

## Repeatable QA

```powershell
npm run content:migrate:v2 -- --module=sedlec-ossuary --check
npm run content:validate:v2
npm run content:coverage:v2 -- --module=sedlec-ossuary
npm run qa:dark-places:semantic -- --module=sedlec-ossuary --fail-on-warnings
npm run qa:dark-places:semantic-phase8
```
