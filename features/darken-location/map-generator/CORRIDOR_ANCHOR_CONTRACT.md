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
3. Manual overrides in `manualOverrides.corridorTypes` win over generated/default types.
4. Until generated corridor-type inference is explicitly re-enabled, generator-authored corridors default to `normal`; `narrow` and `secret` remain valid editor-authored values.
5. Type assignment must not mutate `floorCells`, `pathCells`, doors, anchors, level metadata, or connectivity.
6. `stairs` are not a corridor type. Stairs remain a level-transition concept and are handled by the level/stair contract.

Pass 2B adds SVG visual accents for corridor types while preserving the topology contract:

- `narrow` renders an inset/edge accent over the existing corridor floor.
- `collapsed` renders scar and rubble marks over the existing corridor floor.
- `secret` renders a subdued GM/editor trace; player-export hiding remains a later export concern.
- `gallery` renders a broader/processional axis with light ornamental cross-marks.

These accents must never mutate `floorCells`, `pathCells`, doors, anchors, level metadata, or connectivity. True width changes, blocked collapsed routes, secret player hiding, gallery widening, and stair rendering remain future editor/export/level passes.

Pass 2C adds editor controls for the same contract:

- corridor type can be set from corridor point, waypoint, and endpoint context menus;
- setting `normal` is an explicit manual override and may override any generated/default type;
- `Reset Type` removes the manual override and returns the corridor to the current generator default (`normal` until generated type inference is re-enabled);
- deleting a corridor must also remove its `manualOverrides.corridorTypes[corridorId]` entry;
- editor controls must only mutate `manualOverrides.corridorTypes`; they must not mutate corridor topology, doors, anchors, levels, or stairs.


## Corridor waypoint gesture contract

Intermediate corridor waypoints are authored by dragging the insertion handle exposed over a corridor cell.

Rules:

1. Pointer-down only arms a possible waypoint insertion; it must not create an override, freeze the current layout, or render a committed reroute.
2. A waypoint insertion starts only after the pointer travels more than the shared three-pixel drag threshold.
3. The manual edit transaction and live corridor preview start only after that threshold is crossed.
4. Pointer-up without a qualifying drag leaves `manualOverrides.corridorWaypoints`, the generated corridor, and the viewport bounds unchanged.
5. `pointercancel` never commits a waypoint insertion.
6. Once a qualifying drag begins, the release point is normalized through the existing waypoint/grid validation before committing.
7. Route points are ordered constraints: `from door → waypoint(s) → to door`.
8. After reaching a waypoint, every previously traversed cell of the same corridor becomes blocked for the next segment, except the shared waypoint cell itself.
9. Future waypoint and endpoint cells are reserved so an earlier segment cannot consume them before their turn.
10. A committed corridor path must be orthogonally contiguous, visit every route point in order, and contain no repeated cell.
11. If no self-avoiding continuation exists, the preview is suppressed and the waypoint move/insertion is rejected instead of falling back to a route that ignores the waypoint or creates an out-and-back dead end.

### Folded-corridor wall continuity

A self-avoiding corridor may legitimately fold back beside an earlier run, forming an S or U shape. Its floor cells remain one ordered path, but adjacent non-consecutive runs must not visually merge into a room-sized surface.

- Cells that are consecutive in `pathCells` remain open across their shared edge, including the cell pair where the corridor turns.
- Cells of the same structured corridor that share an edge but are not consecutive in `pathCells` receive an internal separation wall.
- The separation wall is derived from corridor topology only; it does not change `floorCells`, `pathCells`, anchors, doors, waypoints, routing, or connectivity.
- Organic tunnels and room links keep their existing surface rules.
- Corridor cells overlapping room floor are excluded so the additional wall cannot be drawn through a room or circular raccordo.

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

## Pass 4D room level scope correction

Room level edits are scoped authorial overrides, not connected-component seeds.

- Setting `manualOverrides.levels.regions[regionId]` must change only that room's manual level override.
- Normal same-level corridors have configured level delta `0` and must not propagate one edited room level to every connected room.
- Only explicit stair / level-transition constraints may propagate derived levels across rooms.
- If one manually edited room differs from an otherwise default neighboring room, the connecting corridor derives stair metadata from the two endpoint room levels.
- Resetting a room level removes only that room's region override and any editor-created stair overrides attached to its connected corridors.

## Pass 4D-B room level stability correction

Room Level editing is scoped before automatic stair placement is enabled.

- Setting `manualOverrides.levels.regions[regionId]` changes only that room's displayed level.
- Normal corridors must not become cross-level routes merely because two endpoint rooms have different manual levels.
- Room-level-derived stair metadata is disabled by default behind `enableDerivedRoomLevelStairs`; future stair-placement passes can enable it deliberately.
- Until that future pass, corridor topology, door positions, anchors, floor cells, wall segments, and render cells must remain stable when a room level is changed.
- Explicit editor/authored stair overrides still create coherent corridor `fromLevel`, `toLevel`, `levelDelta`, `crossLevel`, and `stairCount` metadata.

## Pass 4D-C room level stability correction

Room level edits are metadata edits, not geometry edits.

- `updateRoomLevel()` and `resetRoomLevel()` must only mutate `manualOverrides.levels.regions` and any connected editor-stair overrides that explicitly depend on that room.
- They must not call `freezeCurrentRoomLayout()` when no geometric edit has occurred.
- Setting a room level must not create `manualOverrides.roomPositions`, `manualOverrides.roomStyles`, door anchors, waypoints, custom connections, or deleted connections.
- Setting a room level must not reroute corridors, move corridor endpoints, change room shapes, or lock a previously unlocked manual layout.
- Room-derived stair placement remains disabled until the dedicated stair placement pass enables it explicitly.

## Pass 4D-D render-only room-level stair markers

Room level editing must not reroute or mutate corridor metadata, but connected rooms with different manual levels still need visible stair markers.

- `updateRoomLevel()` and `resetRoomLevel()` remain metadata-only operations for `manualOverrides.levels.regions`.
- Generated corridor geometry, door anchors, `fromLevel`, `toLevel`, `levelDelta`, `crossLevel`, and `stairTransition` stay neutral unless there is an explicit stair/corridor override.
- The SVG render layer may derive stair markers from the current connected room levels without mutating the generated corridor object.
- Render-only stair markers use `renderOnlyRoomLevelStair: true` and `derivedRoomLevelStair: true` on their virtual doors.
- A one-level room difference renders one marker on the first available corridor cell after the source door; larger differences render endpoint markers plus evenly distributed interior markers.


## Pass 4D-E render-only stair direction consistency

Render-only stair markers derived from room levels must follow one coherent corridor travel direction.

- Multi-marker stairs use the corridor path order from `from` to `to` for every marker.
- The last marker of a corridor uses `current - previous`, not `previous - current`, so endpoint markers do not point back toward one another.
- Virtual stair doors expose `stairTravelDirection` so stair step and arrow rendering can use the fixed render-only travel vector without changing real door semantics.

## Pass 4F-A stair marker selection contract

Pass 4F-A makes render-only stair markers selectable without turning selection into map data.

- Every rendered stair marker exposes a stable editor identity in the form `stair-marker:<corridorId>:<markerIndex>`.
- Editor hit zones are derived from the same virtual stair marker objects used by the renderer.
- Selection stores marker id, corridor id, and marker index only in viewport/editor UI state.
- Selecting or highlighting a stair marker must not write manual overrides or mutate `pathCells`, `floorCells`, doors, anchors, levels, `crossLevel`, or connectivity.
- Selection is cleared when the marker ceases to exist, when editor mode is disabled, or when another map object/empty canvas is selected.
- Dragging, persisted positions, reset/remove actions, and stair marker context menus belong to later Pass 4F patches.

## Pass 4F-B stair marker drag contract

Pass 4F-B lets a selected render-only stair marker move along its owning corridor without turning the result into persisted map data yet.

- Drag targets come only from the owning corridor's ordered visible topology cells.
- Cells occupied by room floor or circular raccordo floor are excluded from the valid target set.
- A door is an edge between the room/raccordo cell and `outsideCell`; therefore the terminal `outsideCell` / `corridorStartCell` remains a valid stair-marker target.
- A target already occupied by another stair marker on the same corridor is excluded.
- The pointer snaps to the nearest remaining valid corridor-cell center and becomes invalid when it is inside a room or farther than the corridor snap threshold.
- The live preview may move the rendered virtual marker, but an invalid release restores its previous position.
- A valid release commits only to viewport session state; Pass 4F-C will define the persisted `manualOverrides` representation and migration behavior.
- Dragging must not mutate corridor `pathCells`, `floorCells`, doors, anchors, room levels, `crossLevel`, routing, or connectivity.
- Changing the map/view reset key clears session-only stair positions so stale path indexes cannot leak into a regenerated layout.


## Pass 4F-C stair marker persistence contract

Pass 4F-C promotes valid stair-marker drops from viewport session state to render-only manual overrides.

- Persisted positions live in `manualOverrides.stairMarkers`; `manualOverrides.levels.stairs` remains reserved for authored vertical-transition semantics.
- Each marker override records its stable marker id key, corridor id, marker index, snapped path index, snapped cell identity, and normalized path offset.
- Resolution prefers the exact saved corridor cell, then uses the normalized offset/path index to find the nearest valid corridor target if the route length changes.
- Multiple persisted markers on the same corridor may not resolve to the same path cell; later markers fall back to the nearest unoccupied valid target.
- Stair-marker overrides are render-only and are excluded from generation-affecting manual override signatures, so moving a stair does not rerun or reroute the map pipeline.
- Valid drops participate in manual history and survive workspace state export/import through the normalized manual override schema.
- Dedicated export/import QA hardening remains Pass 4F-E.

## Pass 4F-D stair marker reset/remove contract

Pass 4F-D adds the MVP context menu for visible stair markers without changing their level semantics.

- Right-clicking a visible marker selects it and opens a stair-specific context menu.
- `Reset Position` deletes that marker's `manualOverrides.stairMarkers` entry, returning it to the automatic path position while preserving its stable id and derived direction.
- `Remove Stair Marker` stores a render-only tombstone with `removed: true`; the renderer suppresses that stable marker instead of generating a replacement.
- Removed markers remain absent until their tombstone is cleared by reset-all, import replacement, undo, or another explicit override clear.
- Reset and remove participate in manual undo/redo history and never call `generateMap`, freeze room layout, reroute corridors, or mutate `pathCells`, `floorCells`, doors, anchors, room levels, `crossLevel`, or connectivity.
- Reverse Direction and Lock Stair remain outside the MVP because direction continues to derive from the connected room level delta.

## Pass 4F-E stair marker export/import QA contract

Pass 4F-E closes Manual Stair Placement by hardening state round trips and compatibility checks without adding new editor actions.

- Positioned markers and removal tombstones must survive JSON export/import under `manualOverrides.stairMarkers` with the same stable marker ids.
- A restored position must resolve to one valid corridor target and a restored tombstone must suppress only its own marker; import must never duplicate automatic markers.
- Legacy `manualStairMarkers` input remains accepted through manual-override normalization.
- Imported marker indexes, path indexes, normalized offsets, and cell coordinates are normalized; entries without a corridor id are discarded.
- Removal tombstones are canonicalized to transition identity only, discarding stale path/cell data that must not influence future reset or rendering behavior.
- The export manifest reports total, positioned, and removed manual stair-marker counts plus the manual-override schema version.
- Export/import must not mutate the supplied manual overrides, corridor `pathCells`, corridor `floorCells`, doors, anchors, levels, routing, or connectivity.
- The map-state payload remains version 3; this pass strengthens the existing normalized manual-override contract rather than introducing a new persistence model.
