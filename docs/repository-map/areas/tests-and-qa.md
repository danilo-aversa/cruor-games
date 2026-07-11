# Tests And QA Area

## Scope

The test area includes `tests/e2e/`, active `.test.*` files under configured include paths, script-backed QA commands, and legacy nested test copies.

## Active Coverage

- Playwright smoke and Dark Places pipeline specs under `tests/e2e/`.
- Vitest tests included by `vitest.config.js`: `app/**/*.test`, `features/**/*.test`, and `shared/**/*.test`.
- Circle connector diagnostics through `scripts/vitest.circle-connectors.config.mjs`.
- Script-backed QA for content, maps, Monster Composer, room design, and assignments.
- Focused Dungeon Brief room-constraint tests cover multi-component handoff, blocking conflict reports, stale-report invalidation, required map props, and legacy Darken adapter metadata.

## Legacy Coverage

`tests/tests/` and `tests/tests/tests/` contain duplicate legacy paths. Their relative imports resolve incorrectly from their nested locations and they are excluded from current Vitest includes.

## Risk

Do not assume a file has automated coverage just because a similarly named legacy test exists. Check `repository-map.json` and the active package scripts.

