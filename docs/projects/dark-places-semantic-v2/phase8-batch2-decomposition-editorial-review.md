# Phase 8 batch 2 — Decomposition editorial revision 2

## Decision

Decomposition revision 2 is the approved canonical v2 migration for Archive,
Dark Places, and Monster Composer. Danilo recorded the explicit Phase 8
editorial decision on 2026-07-17 after the repeatable local QA passed.

Review state is intentionally stored in the migration registry rather than
rewriting the canonical payload, so the module, Source Anchor, Inspiration,
components, and pack retain their draft or `in-review` content status. The
current local card image must not be published until its creator, license, source
URL, and final alt text are verified or the asset is replaced.

| Tracking field    | Value                                                       |
| ----------------- | ----------------------------------------------------------- |
| Module            | `decomposition`                                             |
| Review version    | `phase8-decomposition-editorial-revision-v2`                |
| Migration status  | `complete`                                                  |
| Editorial status  | `approved`                                                  |
| Semantic coverage | `complete`                                                  |
| Sample QA         | `passed-zero-diagnostics`                                   |
| Reviewer          | Danilo                                                      |
| Reviewed at       | 2026-07-17                                                  |
| Blocking issues   | image provenance                                            |

The approval closes the human editorial gate. It does not infer or waive image
rights, source attribution, licensing, or final accessibility review.

## Revision scope

Revision 2 changes only the canonical Decomposition v2 candidate, its Phase 8
checks, migration state, and project documentation. It does not delete or alter
legacy consumers, the active v0.1 Archive registry, or the retained legacy
Monster module.

The revision makes five editorial interventions:

1. replaces the generic internal source label with a published forensic source;
2. records a second human-donor study as an uncertainty check;
3. separates exploration-turn timing from combat-round timing;
4. gives Decay Stage 4 an announced counterplay window before resolution;
5. identifies two exceptional Monster grafts as scoped Cruor conventions.

## Editorial source boundary

The Source Anchor now cites:

- Iancu, Dean, and Purcarea, “Temperature Influence on Prevailing
  Necrophagous Diptera and Bacterial Taxa With Forensic Implications for
  Postmortem Interval Estimation: A Review,” *Journal of Medical Entomology*
  55(6), 2018, doi:10.1093/jme/tjy136;
- Owings et al., “Not by the Book: Observations of Delayed Oviposition and
  Re-Colonization of Human Remains by Blow Flies,” *Insects* 13(10), 2022,
  doi:10.3390/insects13100879.

The first source supports the statement that temperature, humidity,
precipitation, geography, injury, insects, and microbial activity affect rate
and appearance. The second documents delayed and repeated blow-fly colonization
in human donors and supports the warning that decomposition is not a universal
linear clock.

The Second Autopsy remains explicit fictional game content. Its self-operating
mortuary, synchronized vents, four-stage pressure track, backward corpse,
identity exchange, and accelerated effects are not presented as forensic fact.

## Archive review candidate

- **What it is:** postmortem biological and chemical change used as a design
  vocabulary rather than a fixed timeline.
- **Why it disturbs:** identity remains legible while familiar human form becomes
  a material process involving pressure, microbes, insects, fluids, drying, and
  transformation.
- **Creative use:** sequence and contradiction become clues; environmental
  controls become counterplay; distinct processes become distinct location and
  Monster behaviors.
- **Cautions:** avoid universal forensic claims, separate factual framing from
  supernatural acceleration, and retain evidence of personhood rather than
  using remains as anonymous decoration.
- **Asset gate:** the current local image has no recorded original creator,
  license, or source URL. It must remain unpublished until verified or replaced.
  Descriptive alt text also requires visual review of the final approved asset.

## Dark Places revision

The authored location remains **The Second Autopsy**, now described with a more
setting-flexible mortuary vocabulary. Modern-sounding phrases such as “mortuary
station,” “forensic examiners,” “mass-fatality emergency,” and “case number”
have been replaced with mortuary archive, death examiners and anatomists,
season of mass death, and registry number.

The Accelerated Decay Clock now has two explicit cadences:

- **Combat:** triggers and exposure resolve at most once per combat round.
- **Exploration:** triggers and exposure resolve at most once per ten-minute
  exploration turn.

Correcting a registry entry takes one action in combat or one minute during
exploration. Cross-ventilation takes one minute during exploration, or two
creatures using one action each at opposed vents in the same combat round. A
full reset is available only outside combat after one uninterrupted ten-minute
exploration turn with compartments resealed and opposed vents open.

At Stage 4, **Final Processing** begins rather than resolving immediately. The GM
announces one full combat round or ten-minute exploration turn of counterplay.
At the end of that window, exits seal and the identity exchange completes unless
the track has been reduced below 4 or the ledger decision has resolved the
process.

## Monster Composer preservation and scoped conventions

All 26 Monster grafts remain explicit canonical v2 components and preserve their
legacy slot, summary, mechanics, counterplay, structured Monster payload, frame
fit, and rules.

Two rules receive explicit editorial classification without changing their
mechanics:

- **Dangerously Unstable** is a Cruor-specific setpiece convention. Its 5-in-6
  self-detonation and nested 40/80-foot radii do not define the default
  death-burst template.
- **Head Weak Spot** is a Cruor-specific called-shot exception. Its -5 attack
  penalty and automatic critical hit do not establish a general called-shot
  subsystem.

The approval confirms that these two exceptions are intentionally retained as
scoped Cruor conventions.

## Deterministic sample review

Revision 2 changes compiled Dark Places bytes. The three previous candidate
fingerprints are therefore obsolete and must not be treated as approved
snapshots.

The Phase 8 test still requires:

- three successful samples;
- zero errors and zero warnings;
- identical bytes across two compiles with the same controls;
- the expected room counts of 5, 7, and 6;
- valid, unique eight-character fingerprints;
- fingerprints different from the first candidate values.

The repeatable local QA passed before the approval was recorded. Fingerprints
remain runtime-derived checks rather than publication snapshots in this batch.

## Preserved legacy behavior

The active v0.1 static registry remains unchanged:

- 14 public Inspiration records remain available;
- Decomposition still exposes one public Archive record;
- the public registry still exposes all 53 Decomposition component links;
- the legacy module and dedicated v0.1 pack remain present;
- no v1 writer, producer, consumer, or adapter is deleted.

Only Studio and module-repository consumers select the canonical v2 candidate.
The public Archive and current Monster runtime continue to use the retained
legacy registry during staged migration.

## Batch acceptance

| Requirement                                       | Status                                      |
| ------------------------------------------------- | ------------------------------------------- |
| Canonical A + D + M module                        | Complete                                    |
| Published biological source recorded              | Complete                                    |
| Non-linear human-donor caution recorded           | Complete                                    |
| Fantasy-facing terminology revision               | Complete                                    |
| Exploration/combat clock cadence                  | Complete                                    |
| Stage 4 counterplay window                        | Complete                                    |
| All 27 legacy location/region ids accounted for   | Complete                                    |
| All 26 Monster grafts preserved                   | Complete                                    |
| Exceptional graft conventions identified         | Complete                                    |
| Existing public behavior preserved                | Complete                                    |
| Human editorial sign-off                          | Approved by Danilo on 2026-07-17             |
| Image creator, license, source, and final alt text | **Open publication gate**                   |
| Legacy deletion                                   | Not permitted in this batch                 |

## Repeatable QA

```powershell
npm run qa:dark-places:semantic-phase8-batch2
npm run qa:dark-places:semantic-phase8
npm run qa:dark-places:semantic-phase6
npm run qa:dark-places:semantic-phase7
npm run content:validate
npm run qa:dark-places:semantic-baseline
npm run qa:dark-places:acceptance
npm run test:run
npm run build
npm run docs:repo-map:check
git diff --check
```
