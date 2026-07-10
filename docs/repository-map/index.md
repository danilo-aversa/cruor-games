# Cruor Games Repository Map

This repository map is the current developer-facing architecture guide for Cruor Games. It combines narrative docs with the generated file inventory in [repository-map.json](repository-map.json) and the validation contract in [repository-map.schema.json](repository-map.schema.json).

Current baseline: branch `main`, commit `2155e52e79bcbf6aa46a21371d1e5f4b5f618498`, inspected on 2026-07-10. The first generated baseline covered 532 Git-tracked files, including 229 source files, 41 assets, 64 test or QA entries, and 15 documentation files. Regenerate the map after documentation changes for exact current counts.

## Project Summary

Cruor Games is a Vite and React web application for tabletop RPG tooling. The app is organized around feature folders, with a custom router selecting Home, Darken a Location, Map Generator, Monster Composer, Inspirations, Inspiration Studio, and Crucible views. Shared content packs and registries feed multiple features. The map generator is a high-risk subsystem with separate generation, rendering, export, and editor layers.

## Architecture Documents

- [Architecture](architecture.md)
- [Repository Structure](repository-structure.md)
- [Entry Points](entry-points.md)
- [Routes and Navigation](routes-and-navigation.md)
- [Runtime Flows](runtime-flows.md)
- [State and Data Flow](state-and-data-flow.md)
- [Dependency Graph](dependency-graph.md)
- [Tests and QA](tests-and-qa.md)
- [Storage and Side Effects](storage-and-side-effects.md)
- [Assets and Generated Files](assets-and-generated-files.md)
- [Legacy and Transitional Systems](legacy-and-transitional-systems.md)
- [Maintenance](maintenance.md)

## Area Documents

- [App Shell](areas/app-shell.md)
- [Home](areas/home.md)
- [Inspirations](areas/inspirations.md)
- [Inspiration Studio](areas/inspiration-studio.md)
- [Shared Content](areas/shared-content.md)
- [Content Packs](areas/content-packs.md)
- [Crucible](areas/crucible.md)
- [Darken Location](areas/darken-location.md)
- [Map Generator](areas/map-generator.md)
- [Map Editor](areas/map-editor.md)
- [Monster Composer](areas/monster-composer.md)
- [Output and Export](areas/output-and-export.md)
- [Styles and Design System](areas/styles-and-design-system.md)
- [Scripts and Tooling](areas/scripts-and-tooling.md)
- [Tests and QA Area](areas/tests-and-qa.md)
- [Public Assets](areas/public-assets.md)

## Where Should I Look?

To change routing:
- Read [Routes and Navigation](routes-and-navigation.md).
- Inspect `app/router.jsx`, `app/AppShell.jsx`, and the target feature page.

To change map generation:
- Read [Map Generator](areas/map-generator.md).
- Read [Map Editor](areas/map-editor.md) for interaction behavior.
- Run the relevant commands in [Tests and QA](tests-and-qa.md).

To change content data:
- Read [Shared Content](areas/shared-content.md).
- Read [Content Packs](areas/content-packs.md).
- Inspect `shared/content/static-registry.js`, `shared/content/registry.js`, and relevant adapters.

To change Monster Composer:
- Read [Monster Composer](areas/monster-composer.md).
- Inspect native graft data, registry-fed adapters, and Monster QA scripts.

To change browser storage or exports:
- Read [Storage and Side Effects](storage-and-side-effects.md).
- Read [Output and Export](areas/output-and-export.md).

## Warnings

- `docs/repository-map/repository-map.json` is generated; do not hand-edit generated structural fields.
- `reports/`, nested report folders, and `test-results/.last-run.json` are reference or generated artifacts, not primary runtime code.
- `tests/tests/` and `tests/tests/tests/` contain legacy duplicate test paths with stale imports and are not part of the current Vitest include set.
- `scripts/map-generator.circle-anchors.test.js` is retained as reference-only; active circle connector QA uses `scripts/run-circle-connector-diagnostics.test.js` through the configured Vitest script.

