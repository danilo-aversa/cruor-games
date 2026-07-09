# Corridor and Anchor Contract

Dark Places treats the generated map as a structural model first and an SVG drawing second. Corridors, doors, and anchors must remain valid through generation, manual override, export/import, preview, debug validation, and render.

## Generated versus manual connections

Generated graph edges are deduped by unordered room pair. The procedural engine should not create two accidental corridors between the same two rooms.

Manual override connections may duplicate a generated pair or another manual pair. A duplicate manual corridor is an intentional user-authored feature: alternate passage, secret route, loop, service corridor, balcony path, vertical transition, or other edited structure.

## Rectangular room anchors

A rectangular room anchor is a wall-cell contract:

- `cell`: the room-side boundary cell
- `outsideCell`: the first grid cell outside the room
- `side`: the side crossed by the door/corridor
- door segment: the shared edge between `cell` and `outsideCell`

The corridor endpoint must route from the outside cell, not through the room interior.

## Circular room anchors

Circular rooms use a raccordo chain because a square grid corridor cannot connect directly to a vector circle edge.

A circular anchor is valid when the whole chain is valid, not necessarily when the preserved portal cell alone crosses the mathematical circle:

```text
circle visual boundary
→ optional support cell(s)
→ door-bearing portal/raccordo cell
→ corridorStartCell / routingOutsideCell
→ corridor path
```

Important fields:

- `portalRoomCell`: preserved user-facing portal identity. It may sit outside the mathematical circle.
- `raccordoCells`: ordered room-floor chain, including support cells and the door-bearing raccordo cell.
- `raccordoCell`: door-bearing raccordo cell, normally the last cell in `raccordoCells`.
- `corridorStartCell` / `routingOutsideCell` / `outsideCell`: first corridor-floor cell outside the raccordo.

Validity rules:

1. `raccordoCells` must be orthogonally contiguous.
2. At least one raccordo chain cell must touch/cross the visual circle boundary.
3. The door-bearing raccordo cell must be orthogonally adjacent to the corridor start cell.
4. The shared door edge between the door-bearing raccordo cell and corridor start cell must lie outside the visual circle.
5. The corridor start cell must not be rendered as room-extension floor.

## Manual override persistence

Manual overrides are the durable editor layer. They store user intent, not only final SVG geometry. Export/import must preserve:

- room positions
- door anchors, including circular `raccordoCells`
- corridor waypoints
- custom manual connections, including duplicate room pairs
- deleted generated connections
- manual connection sequence
- explicit level/stair snapshots

## Render and debug expectations

Render, debug, QA, and tests must use the same circular raccordo helpers. A stale/imported circular anchor should be normalized or interpreted through the shared raccordo chain contract before validating walls, door cuts, portal squares, or floor connectivity.

## Advanced corridor type contract

`corridorType` describes the authored meaning of a corridor without changing its routing topology. Pass 2A treats corridor type as metadata plus a render profile contract; visual rendering and editor controls are layered on top in later passes.

Supported values:

- `normal`: standard traversable passage.
- `narrow`: tight or claustrophobic passage; still physically open.
- `collapsed`: damaged, rubbled, or unstable passage; still physically open in this pass.
- `secret`: hidden/GM-only passage intent. Player export hiding is handled by render/export in a later pass.
- `gallery`: broad/processional/circulation passage or corridor-room intent.

Rules:

1. Every final corridor must expose a normalized `corridorType`.
2. Every final corridor must expose a matching `corridorRenderProfile.type`.
3. Manual overrides in `manualOverrides.corridorTypes` win over inferred types.
4. Type inference must not mutate `floorCells`, `pathCells`, doors, anchors, level metadata, or connectivity.
5. `stairs` are not a corridor type. Stairs remain a level-transition concept and are handled by the level/stair contract.

Pass 2B adds SVG visual accents for corridor types while preserving the topology contract:

- `narrow` renders an inset/edge accent over the existing corridor floor.
- `collapsed` renders scar and rubble marks over the existing corridor floor.
- `secret` renders a subdued GM/editor trace; player-export hiding remains a later export concern.
- `gallery` renders a broader/processional axis with light ornamental cross-marks.

These accents must never mutate `floorCells`, `pathCells`, doors, anchors, level metadata, or connectivity. True width changes, blocked collapsed routes, secret player hiding, gallery widening, and stair rendering remain future editor/export/level passes.

Pass 2C adds editor controls for the same contract:

- corridor type can be set from corridor point, waypoint, and endpoint context menus;
- setting `normal` is an explicit manual override and may override inferred `secret`, `collapsed`, or `gallery`;
- `Reset Type` removes the manual override and returns the corridor to inference;
- deleting a corridor must also remove its `manualOverrides.corridorTypes[corridorId]` entry;
- editor controls must only mutate `manualOverrides.corridorTypes`; they must not mutate corridor topology, doors, anchors, levels, or stairs.


## Level and stair transition contract

Pass 2D promotes the existing level prototype into an explicit metadata contract while preserving the legacy `stairTransitions` API.

Level state has three explicit containers:

- `manualOverrides.levels.regions`: manual room level overrides by region id.
- `manualOverrides.levels.corridors`: manual corridor level overrides by corridor id.
- `manualOverrides.levels.stairs`: level-transition overrides by `corridorId:endpoint`.

Legacy `manualOverrides.stairTransitions` / `config.manualStairTransitions` remain supported. A legacy value such as `"up"` or `"down"` is interpreted as a stair transition with the corresponding direction.

A resolved corridor must expose:

- `fromLevel` and `toLevel`: endpoint room levels.
- `level`: the planar level where the corridor is drawn.
- `levelDelta`: `toLevel - fromLevel`.
- `levelTransition`: normalized object metadata.
- `stairTransition`: legacy direction mirror, still `none`, `up`, or `down`.
- `verticalTransition` / `crossLevel`: true when the endpoints sit on different levels.

A normalized stair transition has this shape:

```js
{
  type: "stairs",
  direction: "up" | "down",
  placement: "from-endpoint" | "to-endpoint" | "shared" | "whole-corridor",
  endpoint: "from" | "to" | "shared",
  fromLevel: 0,
  toLevel: -1,
  levelDelta: -1,
  corridorId: "edge-id"
}
```

Rules:

1. `stairs` remain a level-transition concept, not a `corridorType`.
2. Old string overrides and new object overrides must both resolve to the same door symbols and level deltas.
3. Explicit stair overrides may create unit deltas, while room-level-derived stairs may create multi-level deltas.
4. Cross-level corridors must expose a non-`none` `levelTransition`.
5. Same-level corridors must continue to expose `levelTransition.type === "none"`.
6. Level metadata must not mutate corridor topology, anchors, doors, or render cells.
7. Region/corridor manual level overrides win over derived levels, but debug validation must surface contradictory stair constraints.
8. `stairCount` must match `abs(levelDelta)` for rendered stair transitions.

Pass 2D does not add a full stairs UI and does not change routing. It hardens the data model so Pass 2E can implement visual/editable stair behavior safely.

Pass 2E adds editable stair behavior on top of the Pass 2D level-transition model:

- the door context menu still exposes `No Stair`, `Stairs Up`, and `Stairs Down`;
- choosing `up` or `down` now writes an object transition into `manualOverrides.levels.stairs` instead of a bare legacy string;
- the editor also writes scoped corridor level metadata so the stair immediately resolves to a coherent `fromLevel`, `toLevel`, `levelDelta`, and planar draw level;
- editor-created level overrides carry `source: "editor-stair"` and `corridorId`, allowing `No Stair` to remove only level data it created itself;
- user-authored region/corridor levels without the editor-stair source are preserved;
- rendered stair marks now include directional arrow strokes in addition to step strokes, making `up` and `down` visually distinct.

Pass 2E still does not implement full multi-level routing, whole-corridor stairs, shafts, ramps, or a dedicated level-management UI.


Pass 2F promotes room levels to the primary editor workflow:

- right-clicking a room exposes a `Level` submenu with manual levels from `-3` to `+3` and `Reset Level`;
- room level edits write to `manualOverrides.levels.regions[regionId]`;
- connected editor-created stair overrides are cleared when a room level is edited, so room levels can drive the corridor result;
- if two connected rooms have different levels and no explicit authorial stair override blocks them, the corridor derives `levelTransition.type === "stairs"` automatically;
- derived stair direction is based on `toLevel - fromLevel`: positive is `up`, negative is `down` from the corridor's `from` endpoint toward `to`;
- derived `stairCount` equals `abs(levelDelta)`, and render distributes that many stair markers along the corridor path;
- the direct site QA scenario `Room Level → Stairs Test` sets two connected room levels, validates the derived stair metadata, and then restores the previous manual overrides.

Pass 2F still does not split a cross-level corridor into separate level-specific physical routes. The corridor remains a single 2D editorial connection with stair markers indicating vertical travel.


## Pass 2G level-view readability contract

Pass 2G makes the existing Level View easier to audit without changing physical routing:

- nonzero room levels render a compact `L±N` badge next to the room number badge;
- the SVG root exposes `data-level-view`, `data-level-filtered`, and `data-active-level` so exported/debug SVGs carry their current level context;
- Level View still filters visible room geometry by room level;
- cross-level stair corridors remain visible on both endpoint levels as editorial stair connectors;
- faded Level View remains a visual overlay only and does not mutate generated map data;
- the direct site QA scenario `Level View Test` assigns two connected rooms to different levels, switches to the target level, validates active/faded subsets, checks the stair connector remains visible, and restores the previous state.

Pass 2G still does not split cross-level corridors into separate per-level route fragments. That remains a future multi-level routing/export pass.

## Pass 3A Level View UI contract

Pass 3A exposes Level View as a first-class editor control instead of leaving it only inside inspector/debug surfaces:

- the full map workspace topbar includes a compact `Level View` select with `All Levels` plus every level present in the generated map;
- the same topbar includes a `Fade Other Levels` / `Solo Active Level` toggle so the current level filter is not hidden behind the inspector;
- the inline Composer map toolbar includes a dedicated layer-group button with a Level View flyout using the same `All Levels`, per-level, `Fade Others`, and `Solo Active` controls;
- both controls mutate only the UI state (`levelView` and `fadeOtherLevels`) and never mutate manual overrides, room levels, corridor levels, stair metadata, routing, anchors, or geometry;
- the existing right-click map actions Level submenu remains valid as a secondary access path;
- controls expose `data-level-view-control`, `data-level-view-value`, and `data-level-view-fade-other-levels` attributes so outerHTML/debug captures can confirm the active UI state directly.

Pass 3A still does not implement per-level physical routing, per-level export splitting, or automatic hiding of cross-level connector geometry beyond the existing active/faded Level View behavior.

## Pass 3B Level/Stair UX polish contract

Pass 3B improves readability of the level/stair system without changing the data model:

- cross-level stair corridors render a compact `↑N` or `↓N` badge near the corridor centerline;
- `N` is the same rendered stair count used by distributed stair markers, so the label and marker count stay in sync;
- room level badges expose `data-room-level` and differentiate above/below-zero levels with dedicated classes;
- stair marker groups expose `data-stair-transition`, marker index/count metadata, and SVG `<title>` labels for debug/inspection;
- corridor level-shift badges expose `data-corridor-id`, `data-level-delta`, `data-stair-count`, and `data-stair-direction` attributes;
- the visual labels are derived from existing `fromLevel`, `toLevel`, `levelDelta`, `stairTransition`, and `levelTransition` metadata and never mutate state.

Pass 3B still does not split cross-level corridors into per-level physical route fragments and does not change Level View filtering semantics.

## Pass 3C Export/Import hardening contract

Pass 3C hardens state and SVG export/import without changing generation or editor geometry:

- state export now writes version `3` and keeps the explicit-level model as the durable state model;
- exported UI state is normalized before writing, including `levelView` and `fadeOtherLevels`;
- state export includes an `exportManifest` with generated-map counts, manual override counts, available levels, cross-level corridor count, derived stair corridor count, and corridor type histogram;
- parsing older state files remains supported through `normalizeManualOverrides` and legacy stair-transition normalization;
- SVG serialization stamps `data-export-mode` and `data-export-player-safe` on the exported root SVG so exports can be audited from the file alone;
- player SVG export removes labels, editor overlays, secret door hints, and secret corridor accent hints while preserving the underlying structural map geometry;
- corridor type accent groups expose `data-corridor-id` and `data-corridor-type` so exported SVGs can be inspected and filtered safely.

Pass 3C still does not implement true per-level SVG bundle export, player-safe removal of hidden secret corridor topology, or physical multi-level route splitting. Those remain future export/routing passes.

## Pass 3D Regression audit contract

Pass 3D consolidates the debug recorder and QA runner metadata so the editor canvas and the Composer side panel cannot drift apart again:

- debug listener categories live in `map-generator.debug-options.js` as shared definitions;
- QA scenario definitions live in the same shared module;
- the map editor projects those definitions with editor Font Awesome icon names;
- the Composer debug recorder projects the same definitions with full Composer icon classes and descriptions;
- `getMapDebugCategory()` is shared by both recorders, so new labels such as room levels or stairs are categorized consistently;
- the pipeline test now checks the shared category/scenario registry, including `Levels / Stairs`, `Room Level → Stairs Test`, and `Level View Test`.

Pass 3D is intentionally a regression-hardening pass: it does not change routing, render geometry, manual override data, Level View behavior, export/import payloads, or the browser QA scenario implementations.

## Pass 4A stabilization / acceptance QA contract

Pass 4A is a stabilization pass. It must not change corridor routing, room placement, level derivation, stair rendering, SVG geometry, or manual override semantics.

It adds an explicit acceptance gate for the mounted Dark Places system:

- `map-generator.debug-options.js` is the only source of truth for debug categories and QA scenarios;
- `map-generator.page.jsx` and `composer/components/LocationMapDetailsPanel.jsx` must both consume that registry;
- `features/darken-location/components/LocationMapDetailsPanel.jsx` is a phantom path and must not exist;
- room-level derived stairs, Level View, export/import, player-safe SVG export, circle connectors, and debug runner wiring must remain covered by automated checks.

The acceptance command is:

```bash
npm run qa:dark-places:acceptance
```

The broader local gate is:

```bash
npm run qa:dark-places:full
```

## Pass 4B corridor render correction contract

Pass 4B corrects the visual grammar for manually selected corridor types without changing corridor topology:

- `narrow` remains a full-cell logical corridor for routing, collision, anchors, doors, export/import, and QA;
- `narrow` is visually redrawn as a half-cell passage by erasing only the full-cell visual corridor layer, drawing a centered narrow floor strip, and redrawing its two side walls with the same `wall-main` / `wall-sketch` classes used by ordinary dungeon walls;
- `secret` remains a full-cell logical corridor, but its wall overlay is redrawn with dashed walls using the same wall classes and stroke variables as ordinary walls;
- `secret` must not use centerline traces or large unrelated overlays as its primary visual language;
- `collapsed` and `gallery` remain valid data-model corridor types but are disabled in the editor menu until their visual behavior is explicitly designed;
- the correction does not mutate `floorCells`, `pathCells`, routing, door anchors, room levels, stair metadata, Level View, or serialized manual overrides.

### Pass 4B follow-up: narrow/secret render correction

- `secret` corridors keep the wall-grammar render path, but their dashed walls use longer and more separated dashes.
- `narrow` corridors must not be rendered by per-cell strip rectangles. The visual override is a single half-cell centerline floor stroke plus two continuous rail paths, after the full-width logical corridor is masked.
- `narrow` remains full-width in topology, routing, collision, anchors, export/import and QA. The half-cell behavior is visual-only.

## Pass 4B narrow corridor render correction follow-up

Narrow corridor rendering must not use the normal corridor centerline texture and must not draw a stroked center floor line with square caps. A narrow corridor remains full-cell in logical topology, but the visual overlay erases the full-cell corridor and replaces it with a filled half-cell ribbon plus two rail paths generated through the same rough wall renderer used by normal walls. Endpoint geometry must include the real door boundary centers so the narrow ribbon connects to door openings instead of stopping or continuing straight past them.

## Pass 4B narrow surface correction follow-up

Narrow corridor rendering must be handled by the corridor surface contract, not by a late overlay.

- `narrow` corridors stay full-cell for topology, routing, door anchors, collision, serialization, and editor hit-testing.
- The rendered `createCorridorSurface()` for a narrow corridor uses `geometryKind: "narrow-corridor-mask"` and exposes a half-cell `visualFloorPath`.
- `getMapSurface()` must therefore remove the full logical corridor cells from the base floor and add back only the narrow visual floor path.
- The root `clip-dungeon-floor` must include the narrow half-cell surface, so `floor-fill`, `corridor-floor-accent`, floor texture, and `floor-grid` are clipped to the narrow corridor instead of being drawn full-cell underneath it.
- The late corridor type wall layer may erase/redraw only the full-width wall outlines and rail walls; it must not paint a replacement floor over the grid.
- `secret` keeps the dashed wall grammar from the previous correction.
