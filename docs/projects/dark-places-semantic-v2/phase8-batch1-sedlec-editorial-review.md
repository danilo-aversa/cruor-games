# Phase 8 batch 1 — Sedlec Ossuary editorial review

## Decision

Sedlec Ossuary is technically complete as the first Phase 8 canonical v2
candidate. It is now the Sedlec module used by the shared Inspiration Module
catalog and therefore by Inspiration Studio. The module and its Inspiration
remain `in-review`; the separate migration record is
`awaiting-human-signoff`. This batch does not publish Sedlec, alter the active
v0.1 Archive registry, or delete a legacy file.

| Tracking field    | Value                              |
| ----------------- | ---------------------------------- |
| Module            | `sedlec-ossuary`                   |
| Migration status  | `candidate-ready`                  |
| Editorial status  | `awaiting-human-signoff`           |
| Semantic coverage | `complete`                         |
| Sample QA         | `passed-zero-diagnostics`          |
| Reviewer          | _not assigned_                     |
| Reviewed at       | _not recorded_                     |
| Blocking issue    | `human-editorial-signoff-required` |

Automated validation cannot replace the missing reviewer, review date, and
explicit decision. A later approval must update the authored status and the
tracking record intentionally; the migration tooling never infers approval.

## Archive review candidate

The existing canonical Sedlec module already separates the historical ossuary
from the fictional Litany Engine and records this distinction in the Source
Anchor editorial notes. The title, slug, source types, factual context,
interpretive framing, themes, motifs, horror tags, contexts, creative uses,
media metadata, source links, and component links remain available for the
human reviewer to accept or revise.

This batch does not mechanically copy legacy cards into a new wrapper. It keeps
the manually authored Place Identity, atmosphere, rule, signs, sensory model,
Read-Aloud model, and Session Guide from the earlier vertical slice, then
performs a sample-driven editorial pass. That pass adds:

- taste and temperature variants so larger sites do not exhaust the sensory
  pool;
- broadly compatible visible-feature fragments so generated rooms do not need
  generic fallback prose;
- a broadly compatible unsettling detail so standard Read-Aloud remains within
  its authored range across the reviewed contexts.

## Dark Places coverage

| Publication target               | Sedlec candidate | Result |
| -------------------------------- | ---------------: | ------ |
| Place Identity profiles          |                1 | Pass   |
| Player entry points              |                2 | Pass   |
| Stakes                           |                2 | Pass   |
| Atmosphere manifestations        |                3 | Pass   |
| Complete mechanical Global Rules |                1 | Pass   |
| Recurring Signs                  |                4 | Pass   |
| Sensory variants                 |               16 | Pass   |
| Senses represented               |                6 | Pass   |
| Intensity tiers                  |                3 | Pass   |
| Read-Aloud spatial fragments     |                3 | Pass   |
| Read-Aloud sensory fragments     |                4 | Pass   |
| Read-Aloud visible fragments     |                6 | Pass   |
| Read-Aloud unsettling fragments  |                5 | Pass   |
| Stall moves                      |                3 | Pass   |
| Sample compiled rooms reviewed   |     5–7 per case | Pass   |

Studio coverage reports all seven required semantic types covered, with no
missing field or component-target issue. Shared pack validation reports zero
issues and no component retains `compatibility-normalized` provenance.

## Deterministic sample review

Each case is compiled twice by the real pure compiler. Equal canonical bytes are
required, a case must contain at least five rooms, and this batch treats any
warning as a failure.

| Case                    | Context | Intrusion | Rooms | Fingerprint | Diagnostics |
| ----------------------- | ------- | --------- | ----: | ----------- | ----------: |
| `crypt-baseline`        | Crypt   | Medium    |     5 | `aafeba2d`  |           0 |
| `chapel-pressure`       | Chapel  | High      |     7 | `31788093`  |           0 |
| `archive-low-intrusion` | Archive | Low       |     6 | `d67ccd51`  |           0 |

The three cases pass with zero errors, zero warnings, and zero determinism
failures. Overview, At the Table data, and room output are produced by the same
compiler path used by the Phase 7 Studio preview.

## Integration and compatibility boundary

`CRUOR_INSPIRATION_MODULES` now selects the canonical Sedlec v2 module before
the remaining 13 legacy modules. This is the shared module source used by
Studio and repository module consumers. The legacy Sedlec exports remain
available for dual-read and regression coverage.

The active `STATIC_CONTENT_REGISTRY` is deliberately unchanged in this batch:
it still exposes 14 Archive Inspirations and 28 Sedlec-linked legacy
components. That preserves current Inspirations and downstream behavior while
the remaining modules migrate. Full Phase 8 is not complete while the public
runtime registry still requires legacy assembly; its removal remains gated to
Phase 9 after every module and consumer has passed review.

## Batch acceptance

| Requirement                                   | Status                      |
| --------------------------------------------- | --------------------------- |
| Canonical v2 module                           | Complete                    |
| No legacy warnings in the canonical candidate | Complete                    |
| Required semantic coverage                    | Complete                    |
| Deterministic Dark Places samples reviewed    | Complete, zero diagnostics  |
| Existing Inspirations behavior preserved      | Complete                    |
| Human editorial sign-off                      | **Open publication gate**   |
| Legacy deletion                               | Not permitted in this batch |

## Repeatable QA

```powershell
npm run content:audit:legacy -- --expect-v2=sedlec-ossuary
npm run content:migrate:v2 -- --module=sedlec-ossuary --check
npm run content:validate:v2
npm run content:coverage:v2 -- --module=sedlec-ossuary
npm run qa:dark-places:semantic -- --module=sedlec-ossuary --fail-on-warnings
npm run qa:dark-places:semantic-phase8
```

The migration command is idempotent. With `--check` it writes nothing; with an
output path it refuses to replace different existing bytes unless the caller
passes `--force` explicitly.
