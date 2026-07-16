# Phase 3 — Place identity and site-wide systems

## Outcome

Phase 3 adds the first editorial Sedlec semantic pack and activates compiler
stages for Place Identity, site-wide atmosphere, scaled Global Rules, stakes,
and deterministic Recurring Sign placement. The existing v1 Sedlec module,
fixtures, Composer producer, and export bundle remain intact.

The v2 pack is deliberately `draft`, its module and Inspiration are
`in-review`, and provenance is `editorially-migrated` with
`editorialDecision: needs-revision`. Automated work cannot satisfy the project
requirement for approval by a person. Human approval, verified historical
framing, and final media credit remain publication gates.

## Editorial Sedlec pack

`shared/content/content-packs/sedlec-ossuary-semantic-v2-pack.js` owns one
dedicated Content Pack v0.2 and one `sedlec-ossuary` module. The module declares
only `inspiration-archive` and `dark-places`; Monster Composer is absent.

The pack contains ten specialized components:

| Semantic type      | Count | Phase 3 role                                                                          |
| ------------------ | ----: | ------------------------------------------------------------------------------------- |
| Place Identity     |     1 | origin, transformation, horror truth, current function/conflict, entry points, stakes |
| Site Atmosphere    |     1 | persistent non-mechanical signature and three manifestations                          |
| Global Rule        |     1 | Litany pressure track, scaling, timing, save, effect, counterplay, reset, escalation  |
| Recurring Sign     |     4 | bounded room placement with three authored variations each                            |
| Sensory Profile    |     1 | Phase 4-ready twelve-variant pool and intensity/bias policy                           |
| Read-Aloud Profile |     1 | Phase 4-ready typed fragments and length/grammar policy                               |
| Session Guide      |     1 | opening, objectives, clue flow, pressure reference, stall moves, pacing               |

The Source Anchor notes distinguish historical source material from the
fictional Litany Engine. Historical source context is limited to ossuary
architecture, devotional bonework, memorial/display tension, and material
culture. The hostile count, supernatural pressure, fresh collection, named
bone conflict, and all mechanics are original game content.

`shared/content/static-semantic-content-packs.js` exposes v2 editorial
candidates separately from the active v0.1 `STATIC_CONTENT_PACKS`. This avoids
mixing schema families or replacing the current registry before Phase 4
consumer migration.

## Compiler stages

The public compiler stage list now includes:

1. normalize canonical inputs;
2. resolve selected semantic components;
3. build Place Identity;
4. build site-wide systems;
5. allocate Recurring Signs;
6. build the Location Document skeleton;
7. build semantic map intent;
8. validate the document;
9. emit Location Document v2.

### Place Identity

`location-identity.compiler.js` applies deterministic primary-component
precedence and sentence composition. Explicit Session State identity fields
remain the highest-precedence build override. Otherwise the primary authored
identity supplies origin/change and truth/function/conflict paragraphs,
followed by entry point and stakes. The Sedlec premise is 80–160 words and does
not concatenate fields with middle-dot separators.

### Site-wide systems and scaling

`location-site-wide.compiler.js` keeps atmosphere, Global Rules, and stakes in
separate arrays. The compiler resolves every named rule scaling reference
through the shared `mechanical-scaling.js` authority. The Sedlec Litany resolves
as follows:

| Intrusion | Save DC | Damage |
| --------- | ------: | -----: |
| Low       |      12 |  `1d4` |
| Medium    |      14 |  `1d6` |
| High      |      16 |  `2d6` |
| Extreme   |      18 |  `3d6` |

The emitted rule block retains a structured resolved rule in metadata and a
renderer-ready quick reference containing trigger, state, timing, threshold,
save/check, effect, duration, frequency, reset, escalation, and counterplay.
Pressure-track rules retain the structured metadata consumed by the Phase 5
Session Guide compiler and separate At the Table view.

### Recurring Signs

`location-recurring-signs.compiler.js` uses a stable local hash derived from
the explicit session seed, component id, room id, and selection purpose. Room
role restrictions are hard filters; preferred features add weight; existing
assignments reduce a room's score so signs spread where possible. Stable ids
break ties. Each sign remains between its authored minimum and maximum room
count, and each selected room receives one deterministic authored variation.

Site-wide sign blocks are compact motif summaries marked
`universalEffect: false`. Specific variations live only in
`room.recurringSigns`; they are never merged into atmosphere or universal
effects.

## Output compatibility

The temporary Location Document v2 renderer view now exposes separate
`globalRules`, `recurringSigns`, and `stakesAndConsequences` Overview groups.
The Overview renders:

1. Location Premise, including the player entry point;
2. Site Atmosphere;
3. Global Rules with quick-reference values;
4. Recurring Signs;
5. Stakes & Consequences.

It no longer renders the At the Table block a second time. At the Table remains
a separate navigation destination. V1 documents still render through the same
view using their existing sensory, visible-anomaly, reward/consequence, and
table collections.

## Deterministic fixtures

`scripts/content/snapshot-dark-places-semantic-v2-phase3.mjs` builds the real
five-room v1 Sedlec location seed with the canonical v2 pack and emits:

- `v2-content-pack.json`;
- `v2-session-state.json`;
- `v2-location-document.json`;
- `v2-map-intent.json`;
- `v2-overview.md`;
- `v2-quick-reference.txt`;
- `v2-fixture-files.sha256`.

Check mode performs two independent builds before comparing all six generated
files and their SHA-256 manifest. Write mode is an explicit maintainer action.

```powershell
npm run content:snapshot:dark-places-v2:phase3
npm run qa:dark-places:semantic-phase3
```

## Acceptance status

| Criterion                                                                  | Status                |
| -------------------------------------------------------------------------- | --------------------- |
| Premise answers origin, change, truth, function/conflict, and entry        | Complete              |
| Atmosphere, rules, signs, and stakes are separate                          | Complete              |
| Detailed scaled rule renders values, timing, save, effect, and counterplay | Complete              |
| Specific signs are allocated to rooms rather than universal effects        | Complete              |
| Overview does not duplicate At the Table                                   | Complete              |
| Canonical output is deterministic and input-order independent              | Complete              |
| Existing v1 Sedlec remains readable and unchanged                          | Complete              |
| Human editorial approval                                                   | Open publication gate |

## Phase 4 and Phase 5 handoff

Phase 3 authors the Sensory and Read-Aloud pools but deliberately does not
allocate them in its frozen snapshot. The frozen Phase 3 snapshot also omits the
Session Guide component so later operational output cannot rewrite this
regression boundary. Phase 4 consumes the room profiles for
pressure-aware room intensity, exact-unique sensory selection,
compact/standard/extended composition, spoiler filtering, and standard output
projection. Phase 5 consumes the authored Session Guide for opening, pressure,
clue flow, stall moves, pacing, and room shortcuts. Phase 6 later completed
Studio v2-only writing; active Composer v2 export and full consumer adoption
remain later work.
