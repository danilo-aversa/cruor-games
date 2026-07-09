# Dark Places Acceptance QA

This document defines the stabilization gate for the Dark Places map engine after the advanced corridor, level, stair, Level View, export/import, and debug-runner registry passes.

## Scope

The acceptance gate covers the mounted Dark Places system, not only isolated level/stair helpers:

- map generation and structural validation;
- circle anchors and outside raccordo cells;
- manual overrides, including room levels, corridor types, door anchors, waypoints, custom connections, and deleted connections;
- level transitions and stairs derived from room levels;
- Level View UI state and SVG metadata;
- Composer debug recorder and map editor scenario runner wiring;
- map state export/import and SVG export modes.

## Required source of truth

The debug recorder and QA scenario runner must use a single registry:

```text
features/darken-location/map-generator/map-generator.debug-options.js
```

Both mounted surfaces must consume it:

```text
features/darken-location/map-generator/map-generator.page.jsx
features/darken-location/composer/components/LocationMapDetailsPanel.jsx
```

The following path must not exist:

```text
features/darken-location/components/LocationMapDetailsPanel.jsx
```

That path is a phantom/non-mounted panel path and must not receive patches.

## Acceptance command

Run:

```bash
npm run qa:dark-places:acceptance
```

The command writes:

```text
reports/dark-places-acceptance-qa.report.md
```

It is a static integration audit. It does not replace runtime tests.

## Full recommended local gate

Run:

```bash
npm run qa:dark-places:acceptance
npm run qa:circle-connectors
npm run qa:maps:debug
npm run test:run
npm run build
```

or:

```bash
npm run qa:dark-places:full
```

## Manual editor acceptance

After the automated gate passes, verify these flows in the browser:

1. Composer debug recorder shows `Levels / Stairs` category.
2. Composer scenario runner shows `Room Level → Stairs Test`.
3. Composer scenario runner shows `Level View Test`.
4. Right-click a room and set Level `-2` or `+2`.
5. Corridors connected to rooms on different levels show stair markers and cross-level badges.
6. Level View can switch between `All Levels` and an explicit level.
7. Export/import preserves room levels, corridor types, derived stairs, and Level View state.
8. Player SVG export removes secret/editor hints while preserving player-safe geometry.

## Non-goals

This gate does not introduce new map semantics, real multi-floor routing, or player/GM geometry splitting. It only protects the foundation that already exists.
