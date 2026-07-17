# Phase 8 batch 4 — Wolf Spiders Candidate 1 withdrawal

## Decision

Wolf Spiders Candidate 1 is **withdrawn**. It is not a canonical Phase 8 module
and receives no editorial approval.

The recovery audit found that the candidate copied or bridged 32 already-modern
Monster Composer grafts into a second semantic owner. That architecture was
incorrect: Monster Composer had already completed its content modernization
before the Dark Places semantic project.

| Tracking field | Value |
| --- | --- |
| Module | `wolf-spiders` |
| Candidate | `phase8-wolf-spiders-editorial-candidate-v1` |
| Candidate status | Withdrawn |
| Migration status | `pending` |
| Editorial status | `not-started` |
| Semantic coverage | `not-evaluated` |
| Sample QA | `not-run` |
| Reviewer | None |
| Reviewed at | None |

## Invalidated work

The following Candidate 1 decisions are invalid and must not be reused:

- ownership of Monster grafts inside the semantic pack;
- `wolf-spiders-monster-grafts-v2.js` as an active bridge or snapshot source;
- a `monster-composer` capability declared only to embed existing grafts;
- any future “standalone snapshot” requirement;
- the Candidate 1 approval and completion tests.

The retired files remain as inert tombstones so ZIP application does not depend
on deleting stale files. No active catalog imports them.

## Reusable work

A future clean Wolf Spiders candidate may reuse, after fresh review:

- source research on active ground hunting, burrows/retreats, eye shine, egg-sac
  transport, spiderlings carried on the female, and dispersal;
- the distinction from wolf folklore, social pack behavior, and generic
  prey-capture-web stereotypes;
- Archive editorial framing;
- the Broodward Dark Places premise, Tremor Pressure, signs, sensory material,
  Read-Aloud fragments, and Session Guide, provided they are revalidated against
  the corrected ownership boundary.

Reuse does not confer approval.

## Modern Monster boundary

The 32 Wolf Spiders grafts remain solely in
`features/monster-composer/data/monster-grafts.js`. A future Phase 8 batch may
verify:

- exact source-anchor association;
- expected count;
- adapter parity;
- absence of any copied payload.

It must not revise, snapshot, or re-own those grafts.

## Replacement acceptance rules

A replacement Wolf Spiders migration must:

1. own only Archive and Dark Places semantic content;
2. contain zero Monster graft components;
3. keep the production Archive catalog independent from the semantic frontier;
4. verify the 32 existing modern grafts externally;
5. pass fresh source, editorial, deterministic sample, Studio round-trip, and
   human approval gates;
6. retain image provenance as a separate publication blocker.

Until then Wolf Spiders remains a production/legacy catalog entry and a pending
Phase 8 migration.
