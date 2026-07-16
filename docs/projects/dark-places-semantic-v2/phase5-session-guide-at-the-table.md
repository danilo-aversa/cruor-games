# Phase 5 — Session Guide and At the Table dashboard

## Outcome

Phase 5 activates Stage 7 of the pure Dark Places compiler and replaces the
semantic v2 At the Table placeholder with an operational session dashboard.
Sedlec now compiles an opening beat, immediate objectives, pressure controls,
rule quick references, a room-backed clue graph, stall moves, and route-aware
room shortcuts. No guidance is derived from component, clue, hazard, or slot
counts.

The active Composer producer and export bundle remain v1. The temporary
v2-to-v1 renderer view carries the structured Session Guide for Final Output,
but it does not write v1 content. Studio, the active content registry, and all
legacy records remain unchanged. The Sedlec module remains `in-review` and
still requires human editorial approval.

## Compiler Stage 7

`location-session-guide.compiler.js` consumes only canonical compiler data:

- the selected authored Session Guide component;
- compiled Place Identity;
- resolved Global Rule blocks;
- compiled rooms, clues, Recurring Signs, roles, and topology;
- the explicit authored pacing route.

It emits deeply frozen deterministic data and imports no React, output,
Composer, SVG, Map Generator, storage, clock, network, or random-global module.
If no authored Session Guide is selected, the existing seed guide passes
through unchanged so non-migrated content retains its current behavior.

### Opening and objectives

The authored opening beat retains its situation, immediate signal, and player
decision. The compiler resolves the entrance room by semantic role and attaches
its stable id, number, and name. Missing authored fields fall back to Place
Identity and entrance-room semantics rather than administrative counts.

Authored objectives retain their order. Only when they are absent does the
compiler fall back to the player entry point and stakes.

### Pressure and rule references

Session Guide rule ids resolve against compiled Global Rule blocks. A pressure
track receives dashboard metadata containing:

- label, minimum, maximum, and initial value;
- ordered escalation thresholds and consequences;
- trigger, resolution, and reset structures.

The same rule may appear in `alwaysOnRules` when the authored guide explicitly
selects it as a quick reference. The dashboard therefore shows both the mutable
track and the immutable rule procedure without copying mechanics into authored
content.

### Clue graph

Required revelation ids and authored links become explicit nodes and edges.
Recurring Sign `revelationLink` metadata anchors each node to real room
evidence; clue blocks in those rooms are attached as supporting evidence. Every
required Sedlec revelation is reachable in at least one room. Unknown link
endpoints and required revelations without room evidence are compiler errors.

Fallback clues remain authored guidance. They do not silently mark a node as
discovered and do not replace missing room evidence during validation.

### Stall moves and shortcuts

Authored stall moves remain primary. If fewer than three exist, the compiler may
add a bounded move from a placed Recurring Sign that is not already required by
the clue graph. Sedlec supplies all three moves editorially, so no fallback move
is generated.

Room shortcuts follow the authored default route and retain room id, number,
role, level, shape, first signal, danger, clue-node links, escalation status,
and climax guidance. The current five-room Sedlec route is:

```text
location-region-1
→ location-region-3
→ location-region-4
→ location-region-2
→ location-region-5
```

## Separate operational session state

`location-session-dashboard-state.js` owns transient play state:

```text
{
  schemaVersion: "cruor-location-session-dashboard-state-v1",
  buildId,
  documentVersion,
  pressureValues,
  discoveredClueIds
}
```

It never writes into the Location Document, Session Guide component, compiler
input, or content pack. Pressure updates are clamped to authored bounds. Clue
state accepts only ids present in the compiled graph. Reset restores authored
initial values and an empty discovered-clue set without recompiling or changing
the build.

Persistence is optional and disabled by default. When enabled, the storage key
is scoped by build id and document schema version. A different build or version
cannot inherit the previous operational state.

## At the Table dashboard

`LocationAtTheTableDashboard.jsx` renders:

1. Start Here: situation, immediate signal, player decision, objectives;
2. Active Pressure: decrement/increment controls, meter, current consequence,
   thresholds, counterplay;
3. Always On: immutable rule quick reference;
4. Clue Flow: discoverable revelation nodes, room evidence, dependencies, and
   fallback clues;
5. When They Stall: actionable authored moves;
6. Room Shortcuts: buttons that open the existing room section;
7. persistence and reset controls.

Controls are native buttons, checkboxes, meter/output elements, and ordered
lists with explicit labels, `aria-pressed`, `aria-live`, disabled bounds, and
focusable room navigation. Interaction tests cover focus, pressure changes,
clue toggling, persistence, reset, room navigation, and source-document
immutability.

Legacy v1 documents without a structured Session Guide continue rendering the
existing `overview.atTheTable` blocks.

## Deterministic fixtures

`snapshot-dark-places-semantic-v2-phase5.mjs` performs two independent builds
and verifies:

- `v2-phase5-location-document.json`;
- `v2-phase5-session-guide.json`;
- `v2-phase5-table-session-state.json`;
- `v2-phase5-output-view.json`;
- `v2-phase5-at-the-table.md`;
- `v2-phase5-fixture-files.sha256`.

The Phase 3 and Phase 4 snapshot scripts now omit the Session Guide component,
just as the Phase 3 snapshot omits Phase 4 profiles. Those fixtures remain true
regression boundaries for their respective completed compiler stages.

```powershell
npm run content:snapshot:dark-places-v2:phase5
npm run qa:dark-places:semantic-phase5
```

## Acceptance status

| Criterion | Status |
| --- | --- |
| Dashboard contains actionable data rather than component counts | Complete |
| Opening beat, objectives, rules, track, clue graph, stalls, shortcuts | Complete |
| Pressure interaction clamps values and updates consequences | Complete |
| Optional persistence is scoped by build id and document version | Complete |
| Clue state changes without mutating authored or generated data | Complete |
| Room shortcuts open the existing room section | Complete |
| Native keyboard controls and accessibility labels are covered | Complete |
| Compiler remains pure, deterministic, immutable, and dependency-safe | Complete |
| Existing v1 At the Table behavior remains available | Complete |
| Human editorial approval | Open publication gate |

## Deferred work

Phase 6 has completed the Studio v2 foundations and v2-only Studio writer.
Specialized editors and preview remain Phase 7, full Inspiration migration
remains Phase 8, and legacy deletion remains gated until every migration and
consumer is complete.
