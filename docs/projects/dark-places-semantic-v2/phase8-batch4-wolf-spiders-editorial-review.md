# Phase 8 batch 4 — Wolf Spiders editorial review

## Decision requested

Review `wolf-spiders-semantic-v2` as the fourth canonical Inspiration v2
candidate and the second A + D + M migration. This batch does **not** request
publication. The candidate remains `in-review`, sample QA requires local
verification, the card image has no verified provenance, and the 32 Monster
grafts still use an explicit parity bridge pending an independent frozen v2
snapshot.

## Naming correction

The audited migration matrix previously called this source **Wolves in
Folklore** and asked for pack behavior, social folklore, and transformation.
That label was incorrect. The real module id, Source Anchor, Archive card, image,
and component vocabulary all concern **Wolf Spiders** (`Lycosidae`) and animal
behavior. This revision removes lupine folklore and social-pack framing from the
editorial target.

## Source boundary

The biological dossier is intentionally narrow:

- wolf spiders are robust ground hunters; species may wander, use burrows, or
  make temporary retreats;
- angled light can reveal eye shine close to the ground;
- females carry a silk egg sac attached to the spinnerets;
- hatchlings ride on the female's back before gradual dispersal;
- maternal duration, habitat, hunting style, and defensive response vary among
  species and conditions.

Primary editorial reference:

- Australian Museum, *Wolf Spiders* and *Egg sacs, spiderlings and dispersal*.

Supporting research boundary:

- Bonte et al. (2007), *Maternal care and reproductive state-dependent mobility
  determine natal dispersal in a wolf spider*, documents gradual dismounting and
  maternally influenced dispersal in `Pardosa monticola`;
- Trabalon et al. (2016), *Physiological costs during the first maternal care in
  the wolf spider Pardosa saltans*, documents egg-sac transport, brood transport,
  and substantial maternal energetic cost in that species.

These observations are source context, not universal claims for every wolf
spider. Giant brood warrens, supernatural carrier swarms, engineered alarm
networks, corrosive silk, and the Monster graft procedures are Cruor fantasy.

## Canonical capability decision

| Capability | Decision | Rationale |
| --- | --- | --- |
| Inspiration Archive | Included | Replaces the incorrect folklore framing with an evidence-bounded animal-behavior dossier. |
| Dark Places | Included | Converts hunting lanes, nursery routes, eye shine, molts, and transmitted vibration into deterministic site procedures. |
| Monster Composer | Included | Preserves all 32 existing graft identities, slots, frame-fit data, structured rules, mechanics, and counterplay. |

## Dark Places editorial model

The candidate contains the seven required semantic profiles:

1. **Place Identity — The Broodward:** a cellar and service complex converted
   into a mobile nursery and low hunting territory;
2. **Site Atmosphere — Low Light, Listening Ground:** eye shine, dry skitter,
   floor tension, dust lanes, molts, and localized nursery warmth;
3. **Global Rule — Tremor Pressure:** a visible 0–4 track with separate combat
   and ten-minute exploration cadence;
4. **Recurring Signs:** eye-shine lanes, oriented molts, carried brood, and
   non-sticky listening silk;
5. **Sensory Profile:** all seven sensory channels with no generic-web default;
6. **Read-Aloud Profile:** 29 bounded fragments with general editorial fallbacks
   in every required group;
7. **Session Guide:** three required revelations, three stall moves, a route,
   and an announced Maternal Intercept climax.

Tremor Pressure advances only from named disturbances and at most once per
combat round or ten-minute exploration turn. At Pressure 4 the GM names the
threatened route and gives one full step of counterplay. A padded retreat remains
available. The procedure cannot create unseen creatures, silently close exits,
or rewrite the real map.

## Legacy coverage

The candidate accounts for:

- 14 authored location components;
- 3 location-region components;
- 32 Monster grafts;
- 49 total legacy components.

Every non-Monster legacy id is mapped exactly once through editorial provenance.
The Monster bridge preserves exact payload parity rather than recreating rules
from prose.

## Temporary Monster bridge

`wolf-spiders-monster-grafts-v2.js` filters the existing normalized shared
Monster components and freezes an exact v2-facing definition set. This keeps
Studio behavior and table rules lossless while the independent snapshot is not
available in this patch environment.

This is a deliberate, machine-visible migration blocker:

- `monster-graft-snapshot-required`

The bridge must be replaced by a standalone frozen snapshot before the legacy
Monster source can be removed. Human editorial approval may accept the content
and source boundary, but it must not clear this technical blocker.

## Publication gates

The migration record remains blocked by:

1. `human-editorial-signoff-required`;
2. `biological-source-review-required`;
3. `monster-graft-snapshot-required`;
4. `image-provenance-required`.

The local `card-wolf-spider.webp` asset has no recorded creator, license, or
source URL. It must remain unpublished until provenance is verified or the image
is replaced and final alt text is written after visual review.

## Reviewer checklist

- [ ] Confirm the source is Wolf Spiders, not wolves in folklore.
- [ ] Confirm biological claims stay within the cited evidence boundary.
- [ ] Confirm fantasy extrapolations are clearly labeled.
- [ ] Confirm Tremor Pressure is fair in combat and exploration.
- [ ] Confirm the four recurring signs reveal actionable information.
- [ ] Confirm all 17 Dark Places/region ids and 32 Monster ids are preserved.
- [ ] Confirm the temporary Monster bridge remains an explicit technical blocker.
- [ ] Confirm the image remains unpublished pending provenance.
- [ ] Record `approved`, `needs-revision`, or `rejected`, reviewer, and date.
