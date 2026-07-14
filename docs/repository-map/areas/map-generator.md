# Map Generator

## Scope

Map generation lives under `features/darken-location/map-generator/`. This document covers generation-time data and geometry. Editor interaction is covered in [Map Editor](map-editor.md).

## Core Files

- `map-generator.input.js`: input normalization and defaults.
- `map-generator.pipeline.js`: `generateMap` orchestration.
- `map-generator.graph.js`: region graph behavior.
- `map-generator.layout.js`: placement and candidate layout behavior.
- `map-generator.mask.js`: room and dungeon mask construction.
- `map-generator.corridors.js`: corridor routing and connectivity.
- `map-generator.geometry.js`: geometry helpers.
- `map-generator.details.js`: props/details.
- `map-generator.profile.js`: generator profile behavior plus compatibility re-exports for shared room archetypes.
- `map-generator.room-design.js`: generator-specific shape support, size application, and compatibility re-exports for the shared room-design and shape-capability contracts.
- `map-generator.render.jsx`: SVG rendering, including read-only room-number labels used by Final Output exports.
- `map-generator.export.js`: shared SVG cleanup/profile serialization plus browser SVG and PNG download primitives.

## Shared Room Contract Boundary

Canonical archetype definitions, room-design normalization, and semantic shape capabilities live in `shared/content/contracts/`. The Map Generator wrapper preserves existing public imports while keeping engine-only size application inside the feature. Authored shape kinds now retain identity through generation; no semantic shape is silently remapped to another footprint.

## Pipeline

Generation normalizes input, builds or accepts region graph data, places rooms, applies room size/style overrides, creates semantic room masks, routes corridors against their actual cell boundaries, reconciles accesses, builds the dungeon surface, computes bounds, adds props/details, checks connectivity, and selects the best scored candidate. Explicit room-design shapes take precedence over inferred archetype masks unless the content explicitly supplies a `maskProfile`.

## Export Boundary

`map-generator.export.js` is the single SVG serialization boundary for the standalone Map Generator and Dark Places Final Output. It removes editor/transient overlays, applies GM/Player/Print visibility policies, supports selective grid/texture/props/labels/hatching/stair layers, applies crop viewBoxes and backgrounds, and can rasterize the resulting SVG to PNG at 1×, 2×, or 4×. Player-safe profiles rebuild the renderable map without explicit secret rooms/corridors and remove secret-door cuts and symbols as a second safety layer. Print profiles embed a self-contained monochrome palette.

## Determinism

The generation path is designed around seeded input and deterministic candidate evaluation. Manual overrides can alter deterministic output by changing the effective input model.

## Tests

Use map QA commands from [Tests and QA](../tests-and-qa.md), especially `qa:maps`, `qa:maps:debug`, `qa:maps:adapters`, and `qa:circle-connectors`.

## Findings

- Confirmed: generator logic is modularly split from rendering and editor UI.
- Confirmed: `map-generator.input.js` is high fan-in.
- Confirmed: Square, Gallery, T-Shape, Cross, Niche, and Irregular use dedicated footprints rather than Rect, Hall, Notched, Alcove, or Cave aliases.
- Confirmed: all registered semantic shapes participate in generic boundary, door, corridor, selection, movement, resize, and export flows; Circle retains its specialized vector/raccordo path.
- Risk: high for pipeline, corridor, mask, and rendering changes because geometry regressions can be subtle.
