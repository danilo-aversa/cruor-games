# Phase 8 batch 4 — Wolf Spiders Candidate 2 approval record

## Decision recorded

Wolf Spiders Candidate 2 was approved as the fourth canonical Inspiration v2
module by Danilo on 2026-07-17. Candidate 2 owns **Inspiration Archive + Dark Places only**. It does
not own, embed, bridge, snapshot, or rewrite Monster Composer content.

The module remains a draft content pack with module records `in-review`, while the
Inspiration editorial status is `approved`. Publication remains blocked only by
missing provenance for the local card image.

| Tracking field | Value |
| --- | --- |
| Module | `wolf-spiders` |
| Candidate | `phase8-wolf-spiders-editorial-candidate-v2` |
| Candidate status | Approved |
| Migration status | `complete` |
| Editorial status | `approved` |
| Semantic coverage | `complete` |
| Sample QA | `passed-zero-diagnostics` |
| Owned capabilities | Inspiration Archive + Dark Places |
| External modern link | 32 Monster grafts in the native Monster catalog |
| Reviewer | Danilo |
| Reviewed at | 2026-07-17 |

## Candidate 1 correction

Candidate 1 was withdrawn because it copied or bridged 32 already-modern Monster
grafts into a second semantic owner. Candidate 2 retains the useful biological
research and Dark Places draft while removing the invalid architecture:

- no `monster-composer` capability on the v2 module;
- zero `monster-graft` components in the semantic pack;
- no import from `wolf-spiders-monster-grafts-v2.js`;
- no import from Monster Composer data;
- no Monster snapshot blocker;
- external parity verification against
  `features/monster-composer/data/monster-grafts.js`;
- Candidate 1 withdrawal history remains machine-visible.

The retired bridge remains an inert tombstone only because ZIP application does
not guarantee deletion of stale files.

## Source boundary

The biological dossier is deliberately narrow:

- wolf spiders are active ground-associated hunters rather than social pack
  hunters;
- species may wander, use burrows, or use temporary retreats;
- angled light may reveal reflected eyes close to the ground;
- females carry a silk egg sac attached to the spinnerets;
- hatchlings ride on the female's back before dispersal;
- habitat, maternal duration, mobility, and defensive response vary among
  species and conditions.

Primary editorial reference:

- Australian Museum, *Wolf Spiders* and its linked material on egg sacs,
  spiderlings, and dispersal.

Supporting research retained from the withdrawn dossier:

- Bonte et al. (2007), *Maternal care and reproductive state-dependent mobility
  determine natal dispersal in a wolf spider*;
- Trabalon et al. (2016), *Physiological costs during the first maternal care in
  the wolf spider Pardosa saltans*.

These observations are source context, not universal claims for every species.
The Broodward, giant nursery warrens, Tremor Pressure, listening silk, supernatural
carrier swarms, corrosive silk, and all game procedures are Cruor fantasy.

## Capability decision

| Capability | Decision | Rationale |
| --- | --- | --- |
| Inspiration Archive | Owned | Provides an evidence-bounded animal-behavior dossier and explicit cautions against wolf folklore and generic web-building stereotypes. |
| Dark Places | Owned | Converts eye shine, ground hunting, nursery transport, transmitted vibration, and dispersal into deterministic site procedures. |
| Monster Composer | External modern link | The existing 32 grafts remain solely in the native Monster catalog and are verified by source-anchor count and rules-schema parity. |

Module capabilities describe only content owned by Candidate 2. The Monster
relationship is stored separately in `modernCapabilityLinks`.

## Dark Places editorial model

Candidate 2 contains the seven required semantic profiles:

1. **Place Identity — The Broodward:** a cellar and service complex converted
   into a mobile nursery and low hunting territory;
2. **Site Atmosphere — Low Light, Listening Ground:** eye shine, dry skitter,
   floor tension, dust lanes, molts, and localized nursery warmth;
3. **Global Rule — Tremor Pressure:** a visible 0–4 track with separate combat
   and ten-minute exploration cadence;
4. **Recurring Signs:** eye-shine lanes, oriented molts, carried brood, and
   non-sticky listening silk;
5. **Sensory Profile:** all seven sensory channels without a generic
   prey-capture-web default;
6. **Read-Aloud Profile:** bounded fragments with general editorial fallbacks in
   every required group;
7. **Session Guide:** three required revelations, three stall moves, a default
   route, and an announced Maternal Intercept climax.

Tremor Pressure advances only from named disturbances and at most once per
combat round or ten-minute exploration turn. At Pressure 4 the GM names the
threatened route and gives one full step of counterplay. A padded retreat remains
available. The procedure cannot create unseen creatures, silently close exits,
or rewrite the real map.

## Legacy coverage

Candidate 2 accounts for all non-Monster Wolf Spiders legacy content:

- 14 authored location components;
- 3 location-region components;
- 17 unique legacy ids mapped exactly once.

The 32 Monster grafts are deliberately absent from semantic provenance because
they were already modern before this project. Their relationship is verified
externally rather than migrated.

## Monster parity gate

The Candidate 2 test must verify:

1. exactly 32 native Monster grafts reference `wolf-spiders`;
2. every graft retains `monster-graft-rules-v1.12`;
3. the semantic module contains zero Monster components;
4. the retired bridge exports an empty definition list;
5. no semantic source imports or copies native Monster payloads.

A failed parity check blocks the candidate, but it does not transfer ownership
to the semantic pack.

## Publication gates

Human editorial signoff, biological-source review, and repeatable local sample QA
were completed on 2026-07-17. Candidate 2 remains blocked only by
`image-provenance-required`.

The local `card-wolf-spider.webp` asset has no recorded creator, license, or
source URL. It must remain unpublished until provenance is verified or the image
is replaced and final alt text is written after visual review.

## Reviewer checklist

- [x] Confirm the source is Wolf Spiders, not wolves in folklore.
- [x] Confirm biological claims remain inside the stated evidence boundary.
- [x] Confirm fantasy extrapolations are clearly labeled.
- [x] Confirm Candidate 2 owns only Archive and Dark Places.
- [x] Confirm all 17 non-Monster legacy ids are preserved exactly once.
- [x] Confirm the 32 Monster grafts are parity-checked externally and never copied.
- [x] Confirm Tremor Pressure is fair in combat and exploration.
- [x] Confirm the four recurring signs reveal actionable information.
- [x] Confirm the image remains unpublished pending provenance.
- [x] Record `approved`, reviewer Danilo, and date 2026-07-17.

## Recorded approval

> Approvo Wolf Spiders Candidate 2 per la Fase 8. Reviewer: Danilo.

The approval clears the human and biological-source review gates after local QA.
Image publication remains blocked independently.
