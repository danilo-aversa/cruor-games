# Map Editor

## Scope

Map editor behavior is concentrated in `features/darken-location/map-generator/map-generator.page.jsx`, with state contracts in `map-generator.state.js`, SVG rendering in `map-generator.render.jsx`, and export helpers in `map-generator.export.js`.

## Responsibilities

- Own selected room/corridor/anchor state.
- Apply manual room position, size, shape, style, and corridor overrides.
- Handle dragging, endpoint edits, drag-gated intermediate waypoint insertion, self-avoiding waypoint routing, folded-corridor internal wall separation, invalid-route rejection, snapping, circular room behavior, selectable, corridor-constrained, persistently positioned stair-marker dragging, stair-marker reset/removal, context menus, zoom, pan, reset, tests modal, and debug recording.
- Own map appearance controls, including Precise/Drawn walls, aligned root/flyout style menus, and optional stair-direction arrows.
- Serialize rendered SVG and debug payloads for copy/download.

## Event Ownership

The page registers document/window listeners for pointer, keyboard, wheel, resize, scroll, modal, menu, and custom QA events. It also queries the DOM for `#cruor-map-svg` during export validation and SVG serialization.

## Source Of Truth

Generated map data comes from the pipeline. Editor state overlays manual overrides and preview-only geometry. Final rendering depends on the reconciled model passed to `MapSvg`.

## Tests

Automated map generation QA is strong. Corridor interaction tests verify that clicking an insertion handle without crossing the drag threshold does not start a manual edit or commit a waypoint, while a qualifying drag still produces the existing preview/commit flow. Waypoint routing tests require ordered, orthogonally contiguous paths with no repeated cells, reserve future route points, and reject commits when the only continuation would retrace the corridor. Map-style tests cover Precise as the default wall treatment, equal 210 px root/flyout menu sizing, and stair arrows hidden by default with explicit opt-in rendering. Pass 4F-A structurally covers stable stair-marker identities and hit-zone wiring; Pass 4F-B covers valid corridor-cell targets, including terminal corridor cells immediately outside door edges, occupied-target rejection, preview rendering, and topology immutability; Pass 4F-C covers normalized `stairMarkers` overrides, collision-safe resolution, manual-history persistence, and state round trips. Pass 4F-D covers right-click actions, automatic-position reset, removal tombstones, and topology-safe undoable updates. Pass 4F-E covers positioned/removed marker export-import round trips, manifest counts, legacy alias normalization, malformed-entry rejection, canonical tombstones, and duplicate prevention. Pointer capture, live preview, and release behavior still require manual browser verification.

## Findings

- Confirmed: `map-generator.page.jsx` is critical risk due size, state ownership, and browser side effects.
- Confirmed: editor-time and generation-time geometry are separate but synchronized.
- Risk: critical for drag, corridor, selection, export, and manual override changes.

