# Tests And QA

Commands are listed as package scripts. In PowerShell on this machine, `npm.cmd run <script>` avoids the `npm.ps1` execution-policy issue.

| Command                            | Purpose                                                        | Artifacts                                 | CI suitability                            |
| ---------------------------------- | -------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| `npm run build`                    | Vite production build                                          | `dist/`                                   | Yes                                       |
| `npm run lint`                     | ESLint repository scan                                         | none                                      | Yes                                       |
| `npm run test:run`                 | Vitest unit/structural tests from current include patterns     | none by default                           | Yes                                       |
| `npm run test:e2e`                 | Playwright browser tests                                       | Playwright reports/results                | Yes                                       |
| `npm run test:e2e:dark-places`     | Focused Dark Places Playwright flow                            | Playwright reports/results                | Yes                                       |
| `npm run content:validate`         | Shared content registry validation                             | console report                            | Yes                                       |
| `npm run content:export`           | Exports shared content registry                                | generated output under `dist/`            | Yes if output expectations are understood |
| `npm run monster:qa`               | Monster Composer QA runner                                     | console report                            | Yes                                       |
| `npm run qa:maps`                  | Map generation QA, 250 realistic maps                          | console/report output                     | Medium cost                               |
| `npm run qa:maps:debug`            | Debug map QA, 250 maps                                         | console/report output                     | Medium cost                               |
| `npm run qa:maps:adapters`         | Adapter map QA                                                 | console/report output                     | Medium cost                               |
| `npm run qa:composer-assignment`   | Darken composer assignment QA                                  | console/report output                     | Yes                                       |
| `npm run qa:room-design`           | Room design QA                                                 | console/report output                     | Yes                                       |
| `npm run qa:room-design-gallery`   | Room design gallery generation                                 | generated gallery/report                  | Not always needed                         |
| `npm run qa:map-archetypes`        | Map archetype QA                                               | console/report output                     | Yes                                       |
| `npm run qa:map-archetype-gallery` | Archetype gallery generation                                   | generated gallery/report                  | Not always needed                         |
| `npm run qa:circle-connectors`     | Circle connector Vitest diagnostics                            | console report                            | Yes                                       |
| `npm run docs:repo-map`            | Regenerates repository map JSON                                | `docs/repository-map/repository-map.json` | Yes                                       |
| `npm run docs:repo-map:fingerprint-check` | Verifies the order-independent, commit-stable fingerprint contract | console report | Yes |
| `npm run docs:repo-map:check`      | Validates working-tree inventory, fingerprint, imports, hashes, and docs refs | console report | Yes |
| `npm run qa:recovery-e`            | Runs repository-map, content-registry, and A–D ownership gates | console report | Yes |
| `npm run ci:quality`               | Runs lint, Monster QA, Vitest, and production build            | console/build output | Yes |

## Coverage Matrix

| Area                    | Build | Lint | Structural QA                | Visual QA            | Manual Browser                        |
| ----------------------- | ----- | ---- | ---------------------------- | -------------------- | ------------------------------------- |
| Routing/App shell       | Yes   | Yes  | Limited                      | No                   | Recommended                           |
| Shared content registry | Yes   | Yes  | `content:validate`           | No                   | Optional                              |
| Darken composer         | Yes   | Yes  | Acceptance and assignment QA | Partial E2E          | Recommended                           |
| Map generation          | Yes   | Yes  | Extensive map QA             | Gallery/debug checks | Recommended                           |
| Map editor interaction  | Yes   | Yes  | Partial                      | Partial              | Required for pointer/keyboard changes |
| Monster Composer        | Yes   | Yes  | `monster:qa`                 | Limited              | Recommended                           |
| Inspiration Studio      | Yes   | Yes  | Phase 6/7 semantic QA        | No                   | Recommended                           |
| Exports/downloads       | Yes   | Yes  | Partial                      | No                   | Recommended                           |

## Known Test Caveats

- `tests/e2e/app-smoke.spec.js` covers home, Darken/map entry, and Monster start.
- `tests/e2e/dark-places-pipeline.spec.js` covers frame-to-room-to-slot-picker-to-export behavior.
- `features/darken-location/dungeon/dungeon-brief-room-constraints.test.js` covers multi-component `roomDesign` resolution, conflict reporting, stale-report invalidation, map request propagation, generated required props, and legacy adapter preservation.
- `features/darken-location/room-constraint-evaluation.test.js` covers candidate compatibility, transformations, replacement policies, pre-existing conflict attribution, manual override blocking, and order independence.
- `shared/content/contracts/room-shapes.test.js` covers canonical support metadata, the editor-selectable shape set, and shape-specific modifier rejection; `map-generator.room-shapes.test.js` covers dedicated footprints, connectivity, sizing, modifier effects, archetype-mask precedence, and corridor routing for semantic shapes; `map-generator.context-menu-position.test.js` covers adaptive context-menu placement, viewport bounds, flyout direction, overflow behavior, nested-flyout width reservation, and measurement that excludes nested overflow.
- `tests/e2e/dark-places-pipeline.spec.js` verifies that the Special Shapes flyout remains open and the parent Shape flyout stays vertically stable while the pointer enters the repositioned third-level menu.
- `features/darken-location/composer/components/LocationComponentPickerModal.test.jsx` verifies that blocked candidates expose a concrete reason, compatible transformations remain assignable, and selected components expose the active Remove action.
- `features/darken-location/composer/components/LocationMapToolbar.test.jsx` verifies that every toolbar mode exposes the immersive toggle, reflects its active pressed state and icon, and dispatches the toggle callback.
- `features/darken-location/composer/model/location-room-assignment-transaction.test.js` covers atomic assignment, conflict rejection without mutation, explicit cross-slot replacement, residual recalculation after removal, Undo/Redo snapshots, draft recovery, and stale derived-state omission.
- `qa:room-design` includes a multi-component Composer snapshot → Dungeon Brief → Map Request → normalized config → generated map bridge check and a semantic shape matrix covering Square, Gallery, T-Shape, Cross, Niche, and Irregular.
- `scripts/map-generator.circle-anchors.test.js` is reference-only and has stale local imports.
- `tests/tests/` and `tests/tests/tests/` are legacy duplicate paths and are excluded by current Vitest includes.
- Many source files have no direct test/QA link in `repository-map.json`; validation reports these as warnings, not failures.
- Map validation includes `corridor-paths-are-continuous`: every structured corridor path must remain orthogonally contiguous, visit manual waypoints in order, and avoid repeated cells. Pipeline tests include the reported out-and-back waypoint regression, the no-alternative rejection case, and folded-corridor wall separation so adjacent non-consecutive S-runs remain visually distinct.
- The golden-seed topology test and the combined Monster QA report test use explicit 15-second budgets because each performs several complete generation/validation passes and measured about 8 seconds under the parallel full suite.
- Monster frame-axis QA validates role, tier, tactical-role, tempo, and danger intent against `computed.framePowerProfile`; final printed HP/DPR remain governed by the closed-loop CR fitter and are not required to preserve strict axis ordering at an equal target CR.

### Room corner resize and shared map menus

- `features/darken-location/map-generator/map-generator.room-resize.test.js` covers grid snapping, bottom-left anchoring, equal-dimension shapes, circular radius serialization, shape minimums, final layout anchoring, and Cave exclusion.
- `tests/e2e/dark-places-pipeline.spec.js` covers the visible top-right handle, non-committing drag preview, one atomic Custom-size/position commit with Undo, and shared dropdown classes for Map Actions and More Map Tools.
- `npm run qa:dark-places:semantic-phase7` covers specialized semantic editor
  rendering, semantic coverage and field links, deterministic real-compiler
  preview, semantic sample QA, and migration-aware Health reporting.

### Site navigation and page transitions

- `tests/e2e/app-smoke.spec.js` verifies that primary site destinations are exposed as links with stable `href` values.
- Existing smoke journeys click those links through the client-side router and continue to verify that Home, Inspirations, Dark Places, the map workspace, and Terrifying Monsters mount correctly.
- Playwright runs with reduced motion, so route tests exercise the no-animation accessibility path rather than waiting for visual transitions.
- Manual browser QA should additionally cover right-click/open-in-new-tab, middle-click, Ctrl/Cmd-click, browser Back/Forward, and both full and reduced motion settings.

## CI Gate Structure

`.github/workflows/ci.yml` runs on `push` to `main`, pull requests targeting `main`, and manual dispatch.

- **Content and architecture gates** are blocking: fingerprint self-check, repository-map freshness, content validation, and Recovery A–D ownership QA.
- **Lint, Monster QA, unit tests, and build** are blocking; Recovery F aligns these gates with the current runtime and QA contracts.
- **Browser tests** remain non-blocking but visible, with the Playwright report uploaded on every run.

The repository map no longer compares `metadata.inspectedCommit` with `HEAD`. Exact commit equality was self-invalidating when the generated map was committed. Freshness is now based on file paths and bytes, excluding the generated map itself.
