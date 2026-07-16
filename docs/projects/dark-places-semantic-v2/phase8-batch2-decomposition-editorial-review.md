# Phase 8 batch 2 — Decomposition editorial review candidate

## Decision

Decomposition is technically complete as the second Phase 8 canonical v2
candidate and the first module with Archive, Dark Places, and Monster Composer
capabilities. The shared module catalog now supplies this candidate to
Inspiration Studio. The pack, module, components, Source Anchor, and Inspiration
remain draft/in-review. Automated QA cannot approve them.

| Tracking field    | Value                              |
| ----------------- | ---------------------------------- |
| Module            | `decomposition`                    |
| Migration status  | `candidate-ready`                  |
| Editorial status  | `awaiting-human-signoff`           |
| Semantic coverage | `complete`                         |
| Sample QA         | `passed-zero-diagnostics`          |
| Reviewer          | _not assigned_                     |
| Reviewed at       | _not recorded_                     |
| Blocking issue    | `human-editorial-signoff-required` |

An approval must record a reviewer, date, and explicit decision. Migration
tooling never infers those fields from passing tests.

## Editorial source boundary

The Archive candidate treats decomposition as a variable biological process,
not a universal clock. Temperature, moisture, access, burial, insects,
treatment, and other conditions change rate and appearance. The authored source
framing names ordinary postmortem change—autolysis, putrefaction, bloating,
insect activity, tissue softening, drying, and grave wax—without presenting the
fictional scenario as forensic fact.

The Second Autopsy is original game content. Its self-operating mortuary,
synchronized vents, four-stage pressure track, backward corpse, identity
exchange, and accelerated effects are explicitly fictional. Human review must
confirm the biological framing, the boundary between source and invention, the
handling of human remains, and the local image credit.

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

## Dark Places candidate

The authored location is **The Second Autopsy**, a sealed mortuary station that
assigns matter and living intruders to a four-stage decay schedule. It contains:

- one complete Place Identity and Site Atmosphere;
- one Accelerated Decay Clock with explicit triggers, scaling, save, duration,
  escalation, reset, and two counterplay procedures;
- four bounded Recurring Signs linked to actionable revelations;
- a multi-sense profile with low, medium, and high intensity pools;
- a Read-Aloud pool with stable unique ids and sufficient unrestricted spatial
  anchors for seven-room builds;
- an operational Session Guide with opening choice, objectives, rule references,
  clue graph, fallback clues, stall moves, and route guidance.

The 27 v1 location and region ids are each assigned exactly once to the
provenance of a reviewed semantic component. The test compares the complete set
against the retained v1 module, so no component can disappear silently.

## Monster Composer preservation

The candidate contains 26 explicit v2 Monster graft components. It does not
import or assemble them from the legacy module at runtime. The retained behavior
is distributed as follows:

| Slot      | Grafts |
| --------- | -----: |
| Attack    |      4 |
| Body      |      4 |
| Death     |      3 |
| Lair      |      2 |
| Mind      |      2 |
| Movement  |      3 |
| Twist     |      5 |
| Weakness  |      3 |
| **Total** | **26** |

For every graft, automated parity checks compare id, slot, summary, table
mechanics, counterplay, complete structured Monster payload, frame fit, and
rules against the retained v1 component. A second check round-trips all 26
through Studio draft hydration and canonical v2-only export.

## Deterministic sample review

Each case compiles twice from the same canonical pack/module and explicit
controls. A failure, warning, fallback, room count below five, or byte mismatch
fails the batch.

| Case                    | Context | Intrusion | Rooms | Fingerprint | Diagnostics |
| ----------------------- | ------- | --------- | ----: | ----------- | ----------: |
| `crypt-baseline`        | Crypt   | Medium    |     5 | `9e8c4247`  |           0 |
| `chapel-pressure`       | Chapel  | High      |     7 | `70983abe`  |           0 |
| `archive-low-intrusion` | Archive | Low       |     6 | `4eb0bda7`  |           0 |

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

| Requirement                                      | Status                      |
| ------------------------------------------------ | --------------------------- |
| Canonical A + D + M module                       | Complete                    |
| No compatibility-normalized candidate provenance | Complete                    |
| All 27 legacy location/region ids accounted for  | Complete                    |
| All 26 Monster grafts preserved                  | Complete                    |
| Studio v2-only Monster round-trip                | Complete                    |
| Required semantic coverage                       | Complete                    |
| Deterministic Dark Places samples                | Complete, zero diagnostics  |
| Existing public behavior preserved               | Complete                    |
| Human editorial sign-off                         | **Open publication gate**   |
| Legacy deletion                                  | Not permitted in this batch |

## Repeatable QA

```powershell
npm run qa:dark-places:semantic-phase8-batch2
npm run qa:dark-places:semantic-phase8
npm run qa:dark-places:semantic-phase6
npm run qa:dark-places:semantic-phase7
npm run content:validate
npm run qa:dark-places:semantic-baseline
npm run build
npm run docs:repo-map:check
git diff --check
```
