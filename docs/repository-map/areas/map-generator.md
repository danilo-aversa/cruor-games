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
- `map-generator.profile.js`: profile/archetype inputs.
- `map-generator.render.jsx`: SVG rendering.

## Pipeline

Generation normalizes input, builds or accepts region graph data, places rooms, applies room size/style overrides, creates masks, routes corridors, reconciles accesses, builds the dungeon surface, computes bounds, adds props/details, checks connectivity, and selects the best scored candidate.

## Determinism

The generation path is designed around seeded input and deterministic candidate evaluation. Manual overrides can alter deterministic output by changing the effective input model.

## Tests

Use map QA commands from [Tests and QA](../tests-and-qa.md), especially `qa:maps`, `qa:maps:debug`, `qa:maps:adapters`, and `qa:circle-connectors`.

## Findings

- Confirmed: generator logic is modularly split from rendering and editor UI.
- Confirmed: `map-generator.input.js` is high fan-in.
- Risk: high for pipeline, corridor, mask, and rendering changes because geometry regressions can be subtle.

