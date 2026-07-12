# Legacy and dead-code candidates

Audit date: 2026-07-12  
Starting commit: `be61f98fd2537d367c757bf9796b11735bc7d193`

Names such as `old`, `legacy` and `unused` were not accepted as proof. Import reachability, router/package/CI references, active test includes and textual consumers were checked. Every item remains in the repository.

## Confidence model

- **High import-status confidence**: no tracked import/reference path from current browser/package entry points.
- **Medium deletion confidence**: external/manual consumers or historical intent cannot be disproved statically.
- **Reference-only** does not mean safe to delete; it means not selected by current configured runtime/QA.

## Stylesheet candidates

| Candidate | Evidence | Current status | Confidence | Required proof before removal |
| --- | --- | --- | --- | --- |
| `app/home-page-overrides.css` | Two lines/83 bytes; no tracked runtime import; filename references occur only in `chatgpt-zip-apply-log.md` | Apparently unreferenced | High import status, medium deletion | Check deployment templates and any nontracked local injection |
| `features/crucible/crucible.styles-old.css` | 9,858 lines/258,458 bytes; no `@import`/ESM/link path; no tracked filename reference outside generated inventory | Legacy/reference candidate | High import status, medium deletion | Prove old DOM Crucible is not mounted externally and compare any selectors absent from current files |
| `features/monster-composer/monster-composer.start-flow.css` | No runtime import; component-local sibling is imported. Files have equal 945-line counts and 827/835 common nonblank lines. Root copy's `../../../shared/styles/colors.css` path is unresolved from its location. | Near-duplicate copy | High | Diff the eight differing nonblank lines and check external/manual loaders |
| `shared/styles/composer-primitives.css` | No runtime import. Historical reports say `app/main.jsx` replaced it with `composer-system.css` after the former layer overrode feature DOM and caused regressions. | Superseded design-system attempt/reference | High transitional status, medium deletion | Confirm no external import and retain historical migration evidence elsewhere |

The four files above are the only tracked stylesheets without a confirmed runtime path in `css-inventory.json`.

## Code and component candidates

| Candidate | Evidence | Status | Confidence | Boundary |
| --- | --- | --- | --- | --- |
| `components/ui/button.jsx` | No tracked runtime import; pass-through wrapper supplies no default class/variant | Unused shared primitive candidate | High within tracked repo | External consumers are unknown; decide whether to build a real API or retire later |
| `components/ui/card.jsx` | Same evidence; pass-through `Card`/`CardContent` | Unused shared primitive candidate | High within tracked repo | Same external-consumer caveat |
| `features/crucible/index.js` and DOM Crucible modules | Current router does not import them; route branch is inline in `app/router.jsx` with `CrucibleTopbar` + Darken/Monster. Reports and docs still reference the wrapper. | Transitional runtime-capable subsystem, not dead code | High router-status, low deletion | Search hosting/manual mounts and migrate unique behavior/data before any removal |
| `features/darken-location/map-generator/legacy/map-generator-mvp.js` | No tracked source/import reference; only historical repository file lists name it | Reference candidate | High import status, medium deletion | Compare any unique behavior/export contracts against current map modules |
| Exported `ComponentNavigatorModal` in Monster navigator | Current page uses drawer implementation; no current instantiation found | Unused export / compatibility candidate | Medium-high | Check external imports and preserve portal behavior if a future modal consumer exists |
| `.cruor-button*` and `.cruor-panel--modal` marker classes | Runtime markup uses them, but no active stylesheet defines the markers themselves; co-applied feature classes provide visuals | Compatibility/intent markers, not dead selectors | High | Do not remove; they are likely migration hooks for the future canonical API |

## Test and QA candidates

| Candidate | Evidence | Status | Confidence |
| --- | --- | --- | --- |
| `tests/tests/` and `tests/tests/tests/` | `vitest.config.js` includes only `app/**`, `features/**`, `shared/**`; Playwright uses `tests/e2e`; nested copies have stale relative imports | Legacy duplicate paths | High |
| `tests/unit/` and `tests/smoke.test.js` if retained in the tree | Outside active Vitest and Playwright includes, as recorded by selector audit | Inactive test references | High configuration status |
| `scripts/map-generator.circle-anchors.test.js` | Repository map identifies stale local imports; active circle diagnostics use a separate Vitest config and `run-circle-connector-diagnostics.test.js` | Reference-only test | High |
| Tracked `reports/*.md|json` and feature report folders | Not runtime imports; repository map classifies them as historical/generated evidence | Reference/generated artifacts | High runtime status, low deletion recommendation |
| `test-results/.last-run.json` | Tracked Playwright artifact, rewritten by normal E2E output | Generated artifact | High | Decide artifact policy separately; do not mix with design-system cleanup |

## Token and selector candidates

- `token-inventory.json` records 145 custom-property names with no confirmed tracked usage. This is a static heuristic: dynamic `var()` construction, remote CSS, scope and fallback behavior can invalidate an unused conclusion.
- Ten potential alias-cycle groups are scope-dependent heuristics. They must be evaluated within actual selector ancestry before any change.
- Generic DOM-era selectors (`.panel`, `.btn`, `.icon-btn`, `.navigator`, `.filter-combobox*`, `.context-menu`, `.empty`) are still defined and/or used by runtime-capable Crucible/map/Composer code. They are compatibility candidates, not dead code.
- The 317 selector dependencies in `selector-dependencies.json` are unsafe to remove until their runtime/test consumers move.
- A class used only in JSX is not necessarily dead merely because it has no JavaScript selector consumer; visual usage and CSS definitions are separate evidence sets.

## Duplicate artifact risks

1. The two Monster start-flow stylesheets can drift silently; only one is imported.
2. Nested test copies look active by filename but are excluded by configuration.
3. Historical reports contain CSS/file names that are not runtime consumers and can inflate naïve text-search results.
4. The old Crucible stylesheet contains broad Monster/shared-looking selectors; accidentally importing it would add nearly 10k lines to the live cascade.
5. `docs/ARCHITECTURE.md` describes an obsolete `src/` layout and can misdirect cleanup work.

## Safe cleanup protocol for a later task

1. Start from a clean worktree and record the commit.
2. Re-run both audit generators against that commit.
3. Check ESM/CSS/HTML imports, package scripts, CI, dynamic imports, portals and external mount documentation.
4. Compare candidate files for unique selectors/exports/tests.
5. Remove one candidate group per commit with build, relevant tests and route screenshots.
6. Update the repository map and this legacy report.

No candidate was deleted, renamed, disabled or modified during this audit.
