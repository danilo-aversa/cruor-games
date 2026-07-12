# Site-wide design-system audit

Audit date: 2026-07-12  
Starting branch: `refactor/sitewide-design-system`  
Starting commit: `be61f98fd2537d367c757bf9796b11735bc7d193`  
Starting repository state: clean `main` synchronized with `origin/main`; requested branch did not exist and was created from that commit.

## Executive summary

Cruor Games already contains meaningful design-system work—especially `colors.css`, `components.css`, `ComposerRail`, `composer-system.css`, `composer-internals.css`, typography/accessibility infrastructure and the shared tooltip runtime—but it does not yet have one authoritative site-wide component or token API.

The tracked runtime has 23 stylesheets; 19 are runtime-reachable and most feature CSS coexists in the initial app bundle. The system defines 1,814 custom-property names and 3,014 definition sites, yet still has 31 statically undefined names, 145 apparently unused names, 193 duplicate-value groups and 13,256 raw visual-value occurrences outside the current canonical token files. No stylesheet uses cascade layers.

Reusable visual families are repeatedly reimplemented under page-specific names. Generic and shared-looking selectors are also behavior, layout and test contracts: 317 unique selector dependencies aggregate 600 consumer occurrences. Portals, route-level `:has()` locks, import-last Composer normalization, responsive overrides and multiple scroll owners make class deletion or import reordering unsafe without visual baselines.

The scrollbar setting is incomplete. It persists `Custom`/`Browser` and applies a dataset before React renders, but only Home reads it. `theme.css` still applies Cruor WebKit root styling in `Browser`, while internal custom scrollbars ignore the setting.

**No runtime refactor, class rename, style deletion, token migration or intentional UI change was performed.** Runtime source files were not intentionally modified by this audit.

## Repository state and audit boundary

- The worktree was clean when the branch and baseline hash were recorded.
- Unrelated user edits appeared in runtime and repository-map files while long-running QA commands were executing. They were preserved untouched.
- Both audit generators read the exact starting commit object rather than the live worktree, so machine inventories remain reproducible and do not absorb those later edits.
- `npm run docs:repo-map:check` failed on the untouched baseline with 60 errors and 164 warnings.
- `npm run docs:repo-map` was not run after concurrent unrelated edits appeared because regeneration would hash and document out-of-scope work. Repository-map regeneration remains required once the worktree is coordinated.

## Major findings

1. **The cascade is global despite feature folders.** Static router imports make Home, Dark Places, Inspirations, Studio and Monster styles coexist; map CSS is reached eagerly through the Composer. Twenty stylesheets contain broad selectors.
2. **The Composer system is the strongest existing shared pattern.** Dark Places and Terrifying Monsters both consume `ComposerRail` and shared Composer semantic classes. `composer-internals.css` is an intentional compatibility layer, not redundant CSS.
3. **Tokens are broad but not cleanly partitioned.** `colors.css` is a large primitive/effect catalog, `typography.css` owns scaling, and `theme.css` mixes reset, semantic tokens, components, raw controls, scrollbars and z-index. Undefined and duplicate aliases remain.
4. **Shared component APIs are mostly visual ingredients.** `.cruor-ui-*`, `.btn`, `.icon-btn`, `.panel`, `.cruor-scroll-surface` and tooltip infrastructure exist, but route-specific implementations dominate. The React `Button` and `Card` wrappers have no tracked consumers or default styling.
5. **Selector contracts block naïve cleanup.** Runtime behavior, measurements, portals, export, state mutation, active/legacy tests and QA consume 317 selectors. Visual classes cannot be removed until these consumers migrate.
6. **Scrollbar mode is not global or cross-engine consistent.** `Browser` is not truly native in Chromium, and feature/internal rules remain active in both modes.
7. **The repository map is materially stale.** Baseline commits/counts disagree, current tracked files are missing, older architecture docs use `src/`, and the route map names absent `CruciblePage.jsx` while omitting hidden Composer/map and scrollbar boundaries.

## Highest regression risks

1. Route/immersive viewport locks using `:has()`, panel IDs and `hidden` can lock the wrong page or remove all scrolling.
2. Body/stage/secondary-document portals lose route ancestry, changing component styling, z-index, backdrop filtering and scrollbar rules.
3. Import order is behavior: shared Composer internals, accessibility overrides and dual Composer/map toolbar owners depend on the current cascade.
4. Nested scroll owners in Dark Places, Monster Navigator, map inspector/report surfaces and Studio can create double bars, clipping or wheel traps.
5. Dense responsive override stacks in Dark Places, Monster and Studio can undo desktop-neutral normalization only at narrow widths.
6. Global raw element and generic class selectors can leak between statically bundled routes.
7. No checked-in screenshot baseline currently detects these failures.

## Recommended migration sequence

1. Establish executable Chromium E2E, route screenshots, portal coverage and Custom/Browser assertions.
2. Freeze and document final Vite CSS order; then introduce a manifest without changing order.
3. Split token primitives/semantics with compatibility aliases and resolved-value checks.
4. Separate reset/document/native-control rules from components.
5. Correct the scrollbar mode contract without changing scroll ownership.
6. Migrate low-risk component families, then surfaces/forms.
7. Consolidate the shared Composer/Navigator pattern across Dark Places and Monster together.
8. Migrate popup/menu/modal behavior with portal adapters.
9. Clean routes one at a time, introduce layers only after order dependencies are removed, and delete legacy candidates last.

Intentional appearance changes belong in a later phase after visually neutral parity. See `migration-roadmap.md` for dependencies, rollback and validation gates.

## Audit artifacts

| File | Purpose |
| --- | --- |
| `css-inventory.json` | Stable schema, complete stylesheet list, import graph, runtime reachability/order model, layers and broad selectors |
| `token-inventory.json` | Definitions, usages, categories, aliases, duplicates, undefined/unused findings and raw-value groups |
| `token-inventory.md` | Human analysis of tokens, raw values and migration boundaries |
| `component-inventory.md` | Component families, variants, duplication, behavior boundaries and proposed canonical APIs |
| `route-style-map.md` | Every route/major surface, entry, styles, overlays, breakpoints, coverage and risk |
| `scrollbar-audit.md` | Declarations, mode flow, cross-engine behavior, actual owners and double-scroll risks |
| `selector-dependencies.json` | Runtime/test/QA selector consumers, roles, evidence, confidence and unresolved dynamic expressions |
| `duplicate-patterns.md` | Repeated component/value/file patterns and consolidation gates |
| `specificity-risk-map.md` | Ranked specificity, cascade, import-order, leakage and layer risks |
| `legacy-candidates.md` | Potentially obsolete/duplicate/transitional artifacts with evidence and confidence |
| `baseline-results.md` | Commands, exact outcomes, known failures, blockers and skipped side-effecting QA |
| `migration-roadmap.md` | Incremental phases, dependencies, rollback boundaries, validation and CSS decision process |

## Reproduction

```text
node scripts/design-system-audit/generate-inventories.mjs --check
node docs/design-system/audit/.selector-audit-generator.cjs --check
```

Both commands read the starting commit and passed after the artifacts were finalized. The scripts do not rewrite runtime code.

## Repository-map drift requiring follow-up

- Narrative index baseline: `main@2155e52...` on 2026-07-10.
- Generated JSON baseline: `main@b84541d...` on 2026-07-11.
- Audit baseline: `refactor/sitewide-design-system@be61f98...` on 2026-07-12.
- `docs/ARCHITECTURE.md` describes obsolete `src/app`, `src/shared` and `src/features` paths.
- `routes-and-navigation.md` points to nonexistent `CruciblePage.jsx`; current Crucible composition is inline in `app/router.jsx`.
- Current route docs omit that `/darkplaces/map` keeps the Composer mounted under `hidden`.
- Current style docs imply `.cruor-button` is an active shared visual class, but no runtime stylesheet defines it.
- Test docs omit the current accessibility and shallow Home E2E files.
- Scrollbar mode and its Home-only effect are undocumented.

These are documentation defects, not runtime changes made by this audit.
