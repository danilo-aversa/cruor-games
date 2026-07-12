# Baseline test and QA results

Audit date: 2026-07-12 (Europe/Paris)  
Branch: `refactor/sitewide-design-system`  
Starting commit: `be61f98fd2537d367c757bf9796b11735bc7d193`  
Environment: Windows PowerShell, Node `v22.18.0`, npm `10.9.3`, Playwright `1.60.0`

The worktree was clean when the branch and commit were recorded. The commands below were run before any intentional runtime edit (none was made). Unrelated user changes appeared later; audit generators were subsequently pinned to the starting commit so those changes are excluded from inventory verification.

Durations are wall-clock values captured by the audit wrapper and are approximate to two decimals.

## Commands executed

| Command | Exit/result | Duration | Exact result summary |
| --- | --- | ---: | --- |
| `npm.cmd run docs:repo-map:check` | Failed, exit 1 | 13.99s | `60 error(s), 164 warning(s)`. Stale hashes and tracked files missing from the map. This failure predates audit artifacts. |
| `npm.cmd run format:check` | Failed, exit 1 | 35.39s | Prettier reported code-style issues in 430 files. No formatting rewrite was run. |
| `npm.cmd run lint` | Failed, exit 1 | 150.3s isolated run | ESLint emitted 7,631 output lines before tool truncation. The configured `eslint .` traverses `.vscode/cruor-tools/backups/*.zip` virtual trees and reports many repeated errors/warnings from archived copies, obscuring current tracked-code counts. An earlier concurrent attempt timed out at 186.5s. |
| `npm.cmd run content:validate` | Passed, exit 0 | 1.22s | `Static content validation: 0 issues (0 errors, 0 warnings).` |
| `npm.cmd run build` | Passed, exit 0 | 51.45s | Vite transformed 2,198 modules and built in 49.97s. CSS 1,105.13 kB (139.72 kB gzip); JS 3,384.14 kB (921.03 kB gzip). |
| `npm.cmd run test:run` | Passed, exit 0 | 52.09s | 25 test files passed; 163 tests passed; Vitest duration 48.46s. |
| `npm.cmd run monster:qa` | Failed, exit 1 | 2.47s | 18 issues: 7 errors, 0 warnings, 11 info. Details below. |
| `npm.cmd run qa:composer-assignment` | Passed, exit 0 | 1.17s | 0 issues. |
| `npm.cmd run qa:room-design` | Passed, exit 0 | 1.83s | 0 issues. Report written only to ignored `dist/qa`. |
| `npm.cmd run qa:map-archetypes -- --no-report` | Passed, exit 0 | 1.58s | 0 issues; report writing disabled. |
| `npm.cmd run qa:maps` | Passed, exit 0 | 286.78s | 250 realistic maps; 0 issues. |
| `npm.cmd run qa:maps:debug` | Passed, exit 0 | 325.10s | 250 debug maps; map QA 0 issues; manual-move QA 0 issues. |
| `npm.cmd run qa:maps:adapters` | Timed out | 904.4s | No completion summary; it ran concurrently with the other full map batches and was CPU-bound. Treat as unverified, not failed assertions. |
| `npm.cmd run test:e2e -- --output=<external-playwright-results>` | Environment-blocked; wrapper timed out | 902.7s | Playwright scheduled 10 tests using 10 workers, but every worker reported `browserType.launch: Executable doesn't exist ... chromium_headless_shell-1223`. No application assertion result is available. |
| `node scripts/design-system-audit/generate-inventories.mjs --check` | Passed, exit 0 | 19.0s final check | CSS JSON, token JSON and token Markdown exactly match a fresh scan of the starting commit. |
| `node docs/design-system/audit/.selector-audit-generator.cjs --check` | Passed, exit 0 | 13.7s final check | Selector JSON is valid and exactly matches a fresh scan of the starting commit. |

The E2E result directory and HTML report were redirected outside the repository. The tracked `test-results/.last-run.json` was not modified.

## Pre-existing failures and warnings

### Repository map

The untouched map validation failed with 60 errors and 164 warnings. Confirmed examples:

- stale structural hashes for app, shared Composer styles, Dark Places/map files, package scripts and map docs;
- tracked tests, constraint/transaction modules and context-menu files missing from `repository-map.json`;
- narrative `index.md` baseline is `main@2155e52...`, while generated JSON metadata is `main@b84541d...`; both are behind the starting commit;
- `docs/ARCHITECTURE.md` still describes a `src/` tree;
- route docs refer to absent `CruciblePage.jsx` and omit key current scroll/hidden-mount behavior.

`npm run docs:repo-map` was not run after unrelated user changes appeared because regeneration would hash and document those out-of-scope changes. This is an explicit remaining documentation task once the worktree is coordinated.

### Build warnings

1. `public\fonts\cruor-font.otf` did not resolve at build time and remains a runtime URL.
2. Rollup warned that chunks exceed 500 kB after minification. The emitted JS and CSS sizes above provide the baseline.

### Monster QA errors

- Four grafts lack an explicit Frame Fit block: `collapsed-crawler`, `empowered-slam`, `ethereal-sight`, `flesh-harvest`.
- Ambusher DPR is not greater than Slow DPR: 32 versus 35 (`tempo-scaling`).
- Boss HP is not greater than Standard HP: 102 versus 105 (`encounter-footprint-scaling`).
- Boss Tier HP is not greater than Normal Tier HP: 90 versus 105 (`monster-tier-scaling`).

The 11 info findings are export-readiness review, pressure and complexity notices. No Monster data/runtime fix was attempted.

### Formatting and lint scope

- Prettier's 430-file baseline means a later design-system change must use targeted formatting or a separately approved repository formatting task; otherwise diffs will be dominated by unrelated churn.
- ESLint's root scope includes `.vscode/cruor-tools/backups/*.zip`. The output repeats archived source errors and makes `npm run lint` slow and noisy. No ignore rule was added in this phase.

### Browser QA blocker

The installed Playwright package expects Chromium headless shell revision 1223, but that executable is absent. CI explicitly installs Chromium before E2E and treats E2E failure as non-blocking. Local E2E requires a separately authorized browser install before it can establish product results.

## Commands intentionally not run in-place

| Command | Reason |
| --- | --- |
| `npm run qa:dark-places:acceptance` | Script unconditionally overwrites tracked `reports/dark-places-acceptance-qa.report.md`. The audit forbids modifying existing reports. |
| `npm run qa:circle-connectors` | Test writes tracked `reports/circle-connector-diagnostics.report.{json,md}` in `afterAll`. |
| `npm run qa:room-design-gallery` / `qa:map-archetype-gallery` | Generate gallery/report artifacts; structural QA commands were used instead. |
| `npm run content:export` | Writes generated export data under `dist`; content validation was the relevant read-only gate. |
| `npm run qa:all`, `qa:dark-places:full`, `test:all` | Aggregate commands repeat expensive checks and include report-writing or environment-blocked steps. Individual results are clearer. |
| `npm run diagnose:workbench` | Requires a running server and Chromium and writes screenshots/timeline/report files. Chromium is missing; this is diagnostic rather than assertion-based QA. |
| `npm run format` / `lint:fix` | Mutating commands are outside audit scope. |

## Available QA command map

| Category | Available commands / coverage |
| --- | --- |
| Build | `build`, `dev`, `preview` |
| Unit/structural | `test`, `test:run`, `test:ui` |
| Integration/E2E | `test:e2e`, `test:e2e:ui`, `test:e2e:headed`, `test:e2e:dark-places`, `test:e2e:dark-places:headed`, `qa:dark-places` |
| Dark Places | `qa:dark-places:acceptance`, `qa:dark-places:full`, `qa:composer-assignment`, `qa:room-design`, `qa:room-design-gallery` |
| Map | `qa:maps`, `qa:maps:debug`, `qa:maps:adapters`, `qa:map-archetypes`, `qa:map-archetype-gallery`, `qa:circle-connectors` |
| Monster | `monster:qa` plus active Vitest model/rules tests |
| Shared content | `content:validate`, `content:export` |
| Accessibility | No dedicated axe/accessibility command. `tests/e2e/accessibility-settings.spec.js` covers settings except scrollbar; lint/build provide no behavioral accessibility validation. |
| Visual/screenshot | No `toHaveScreenshot` baseline. Playwright captures screenshots only on failure. `diagnose:workbench` and `scripts/compare-site-elements.mjs` are diagnostic/comparison tools, not CI assertions. Gallery commands produce review artifacts. |
| Static hygiene | `lint`, `lint:fix`, `format`, `format:check` |
| Repository map | `docs:repo-map`, `docs:repo-map:check` |
| Aggregates | `qa:all`, `test:all` |

## Baseline interpretation

Blocking for a design-system implementation branch before CSS deletion:

1. install the expected Playwright Chromium revision and obtain real E2E results;
2. add screenshot baselines and scrollbar-mode assertions;
3. coordinate/regenerate the repository map from a clean worktree;
4. treat Monster QA, formatting and lint/map-adapter status as known baseline exceptions rather than attributing them to the refactor.

No unrelated baseline failure was repaired in this phase.
