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
| `npm run docs:repo-map:check`      | Validates repository map freshness, imports, hashes, docs refs | console report                            | Yes                                       |

## Coverage Matrix

| Area                    | Build | Lint | Structural QA                 | Visual QA            | Manual Browser                        |
| ----------------------- | ----- | ---- | ----------------------------- | -------------------- | ------------------------------------- |
| Routing/App shell       | Yes   | Yes  | Limited                       | No                   | Recommended                           |
| Shared content registry | Yes   | Yes  | `content:validate`            | No                   | Optional                              |
| Darken composer         | Yes   | Yes  | Acceptance and assignment QA  | Partial E2E          | Recommended                           |
| Map generation          | Yes   | Yes  | Extensive map QA              | Gallery/debug checks | Recommended                           |
| Map editor interaction  | Yes   | Yes  | Partial                       | Partial              | Required for pointer/keyboard changes |
| Monster Composer        | Yes   | Yes  | `monster:qa`                  | Limited              | Recommended                           |
| Inspiration Studio      | Yes   | Yes  | Content validation indirectly | No                   | Recommended                           |
| Exports/downloads       | Yes   | Yes  | Partial                       | No                   | Recommended                           |

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

### Room corner resize and shared map menus

- `features/darken-location/map-generator/map-generator.room-resize.test.js` covers grid snapping, bottom-left anchoring, equal-dimension shapes, circular radius serialization, shape minimums, final layout anchoring, and Cave exclusion.
- `tests/e2e/dark-places-pipeline.spec.js` covers the visible top-right handle, non-committing drag preview, one atomic Custom-size/position commit with Undo, and shared dropdown classes for Map Actions and More Map Tools.
