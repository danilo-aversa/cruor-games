# Route-to-style map

Audit date: 2026-07-12  
Starting code revision inspected: `be61f98fd2537d367c757bf9796b11735bc7d193`  
Router source of truth: `app/router.jsx` (custom history router; no React Router)

## Reachable route summary

| URL or compatibility input | Router state | Entry surface | Important mount behavior |
| --- | --- | --- | --- |
| `/` and unknown paths | `section=home` | `app/HomePage.jsx` | Unknown paths fall back to Home; there is no 404 component in the runtime router. |
| `/darkplaces` | `section=crucible`, generator `darken`, tab `composer` | `features/darken-location/composer/DarkenLocationComposerPage.jsx` | Rendered inside `#darkenComposerPanel`; the Composer includes the inline map editor surface. |
| `/darkplaces/map` | `section=crucible`, generator `darken`, tab `map-generator` | lazy `features/darken-location/map-generator/map-generator.index.js` | The Darken Composer remains mounted in a hidden tabpanel. The standalone map panel is mounted because the initial route sets `hasOpenedMapGenerator=true`. |
| `/terrifyingmonsters` | `section=crucible`, generator `monster` | `features/monster-composer/monster-composer.page.jsx` | Monster replaces the Darken tabpanel branch; its view modes (Composer/Balance/Run/Export) are feature state, not routes. |
| `/inspirations` | `section=inspirations` | `features/inspirations/inspirations.page.jsx` | Two-column archive/dossier surface; selecting “Use in Monster Composer” routes to `/terrifyingmonsters` with an in-memory seed. |
| `/inspiration-studio` | `section=inspiration-studio` | `features/inspiration-studio/InspirationStudioPage.jsx` | Full-height editor with independently scrolling library, editor, and status rails. |
| `?studio=1` or `?admin=studio` | `section=inspiration-studio` | same as `/inspiration-studio` | Compatibility entry only; history normalization later writes the canonical path. |
| `?section=inspirations` | `section=inspirations` | same as `/inspirations` | Compatibility entry. |
| `?section=crucible`, `?tool=*`, or `?generator=*` plus `view`/`darkenView` | `section=crucible` | Darken Composer/map or Monster | `generator=monster` selects Monster; every other value defaults to Darken. `view=map|map-generator` selects the map tab. |
| `?cruorTest=dark-places` or `?testHarness=dark-places` | Darken Composer | same as `/darkplaces` | Test-harness compatibility input; not a separate component. |

There is **no current standalone Crucible page route**. The current routed “Crucible” is the shell branch in `app/router.jsx` containing `CrucibleTopbar` plus either Darken or Monster. `features/crucible/index.js` exposes an older DOM-mounted `Crucible` wrapper, but the current router does not import or render it.

## Runtime stylesheet graph and coexistence

### Explicit bootstrap imports

`app/main.jsx` declares these imports:

1. `shared/styles/theme.css` → `colors.css`, `typography.css`, Font Awesome and font URLs
2. `shared/styles/components.css` → `colors.css`
3. `shared/styles/composer-system.css` → `colors.css`
4. `shared/styles/tooltips.css` → `colors.css`
5. `features/crucible/crucible.styles.css` → `colors.css` (the file has no other rules)
6. `app/app-shell.css` → `colors.css`
7. `shared/styles/accessibility.css` → `colors.css`

### Styles reached through statically imported router descendants

- `app/HomePage.jsx` → `app/home-page.css`, `app/home-page-video.css`.
- `app/AppShell.jsx` → `shared/styles/tooltips.css` again; `SiteTopbar.jsx` → `SiteMegaMenu.jsx` → `app/navigation/site-mega-menu.css`.
- Darken index → `darken-location-composer.styles.css`, then `shared/styles/composer-internals.css`; `DarkenLocationComposerPage.jsx` also imports `map-generator.styles.css`.
- Inspirations page → `inspirations.styles.css`.
- Inspiration Studio index → `inspiration-studio.styles.css`.
- Monster page → `monster-composer.styles.css`, `shared/styles/composer-internals.css`; `monster-composer.start-flow.jsx` → component-local `monster-composer.start-flow.css`.
- Lazy map index → `map-generator.styles.css` again when loaded.

Because Home, Darken, Inspirations, Studio, and Monster are static imports of `app/router.jsx`, their CSS is present in the application even when their route is inactive. Map CSS is also already reached eagerly from `DarkenLocationComposerPage.jsx`; the lazy map component therefore does not isolate its stylesheet. Route roots provide some scoping, but broad names and raw-element selectors coexist in one cascade.

The sequence above is the **source import graph**, not a promise about production bundle ordering across module dependencies. Exact emitted order must be verified against the CSS inventory/build before moving any import. `shared/styles/composer-internals.css` explicitly depends on loading after feature styles and intentionally uses higher specificity.

## Global application shell

**Entry components**

- `index.html` → `app/main.jsx` → `app/router.jsx` → `app/AppShell.jsx`.
- `app/navigation/SiteTopbar.jsx`, `SiteMegaMenu.jsx`, and `features/crucible/components/CrucibleTopbar.jsx`.
- Shared tooltip runtime under `shared/tooltips/` creates `#cruorTooltipPortal` under `document.body`.

**Styles**

- Global bootstrap list above, `app/app-shell.css`, and `app/navigation/site-mega-menu.css`.
- `app/AppShell.jsx` duplicates the tooltip stylesheet import.
- Accessibility variants in `shared/styles/accessibility.css` are driven primarily by `html[data-a11y-*]`; the shell mirrors every setting except `scrollbar` on `.app-shell`.

**Major surfaces/overlays**

- Sticky `.site-topbar`; nested utility settings menu and mobile menu.
- `SiteMegaMenu` is portaled to `document.body` and positioned from the trigger rectangle.
- Tooltip portal is document-level and sits outside route roots.
- `CrucibleTopbar` is rendered in the Crucible branch, but current `app-shell.css` sets `.crucible-topbar-shell`, `.crucible-workspace__topbar`, and its inner topbar to `display:none`/hidden. It is a DOM/API dependency, not a currently visible command bar.

**Responsive rules**

- `app-shell.css`: 1100, 1080, 980, 860, 720, and 420 px; a complementary `min-width:861px`; system light-theme query.
- `site-mega-menu.css`: 900 and 560 px.
- `accessibility.css`: 860 px plus system color and reduced-motion queries.

**Regression risk**: critical. Shell CSS changes can alter every route, portaled content is not protected by route ancestry, and `:has(...)` selectors change viewport/scroll locking for Monster, Darken, and Studio.

**Coverage**

- `tests/e2e/accessibility-settings.spec.js` covers opening settings, several dataset values, persistence, reload, and reset, but does not assert the scrollbar option.
- `tests/e2e/app-smoke.spec.js` traverses shell navigation, but some expected Home copy differs from current `HomePage.jsx`; see `baseline-results.md` for the actual baseline result.
- No automated back/forward, mega-menu keyboard, mobile navigation, portal positioning, or screenshot baseline was found.

## Home / landing page (`/`)

**Entry**: `app/HomePage.jsx` (not `HomePageWithVideo.jsx`).

**Styles**

- Global shell/styles plus `app/home-page.css` and `app/home-page-video.css`.
- `app/home-page-overrides.css` is tracked but has no runtime import.

**Shared UI used**

- Global typography/tokens, raw form defaults, topbar, tooltip runtime.
- Home does not use the shared React `Button`, `Card`, `ComposerRail`, or the `.cruor-ui-*` surface classes; its button/card/panel vocabulary is `.cruor-home__*`.

**Major surfaces/overlays**

- Video hero, sticky “How the Workbench Works” gate, tool cards, source carousel, output board, Patreon/support and footer.
- Fixed `HomeScrollProgress` section navigator.
- Contact and zoom dialogs render inline under `.cruor-home`; an effect writes `overflow:hidden` to both `body` and `html` and suppresses wheel/touch scrolling while either is open.

**Responsive rules**: 1080, 1040, 920, 900, 760, and 720 px, `hover:none`, and reduced motion; video stylesheet also uses 720 px.

**Regression risk**: high. The page has long scroll-driven JavaScript, sticky gating, document scrollbar replacement, fixed progress UI, inline style variables, modal scroll locking, video sizing, and many page-specific raw-tag rules.

**Coverage**

- `tests/e2e/homepage.spec.js` asserts only that `body` is visible.
- `tests/e2e/accessibility-settings.spec.js` starts on Home but does not validate Home scroll progress or `Browser`/`Custom` behavior.
- `tests/e2e/app-smoke.spec.js` attempts stronger Home/navigation assertions; actual baseline status is recorded separately.
- `scripts/diagnose-workbench-scroll.mjs` can capture diagnostic screenshots/timelines, but it is not an assertion-based visual test.

## Dark Places Composer (`/darkplaces`)

**Entry**: `DarkenLocationComposerPage.jsx` through `darken-location-composer.index.js`, mounted in `#darkenComposerPanel` under the Crucible workspace.

**Styles**

- Global/bootstrap styles.
- `features/darken-location/composer/darken-location-composer.styles.css`.
- `shared/styles/composer-internals.css` after the feature stylesheet.
- `features/darken-location/map-generator/map-generator.styles.css` because the Composer embeds the map editor.
- App-shell rules for `#darkenComposerPanel`, the hidden Crucible topbar, tabpanels, and viewport locking.

**Shared UI used**

- `ComposerRail` and `ComposerCollapsibleSection` from `components/ui/composer-rail.jsx`.
- `.cruor-composer-*`, `.cruor-ui-*`, `.cruor-scroll-surface`, shared tooltip runtime, and shared Component Navigator internals.

**Primary surfaces**

- `LocationMapStage` central inline map editor and map toolbar.
- Builder-mode left/right rails: frame/theme, scratch/room program and inspector, slots/details, export/recap.
- Draft controls, compile preview, guided-flow dock/drawer, map context/details panels, export room key.
- Inline map SVG/canvas, editor overlays and handles.

**Overlays and portals**

- `LocationComponentPickerModal` currently renders an inline Component Navigator drawer (`role=region`) despite its filename.
- `LocationChoiceField` listboxes are portaled to `document.body` and repositioned on resize/ancestor scroll.
- Embedded map context menus and style/level flyouts use map-generator portals; toolbar controls can be portaled into a Composer toolbar target.
- Immersive mode hides the global site topbar and peripheral rails through high-specificity `:has` rules, while retaining the center editor and toolbar.

**Responsive rules**: 1320, 1180, 1120, 980, 900, 860, 760, and 720 px. Several selectors are repeated in late override blocks, so source order matters at each breakpoint.

**Regression risk**: critical. The route combines fixed-viewport locking, multiple candidate scroll owners, embedded map CSS, portaled menus, `:has`, high-specificity page-root overrides, dynamic builder modes, immersive mode, and shared Composer overrides.

**Coverage**

- Strongest route-level coverage: `tests/e2e/dark-places-pipeline.spec.js` covers Frame → Rooms → picker → Export, room indicators, review-missing, clipboard status, and immersive mode.
- `LocationComponentPickerModal.test.jsx` and `LocationMapToolbar.test.jsx` cover key component semantics.
- Assignment, draft, room constraints, and map handoff have targeted unit/QA tests.
- No screenshot assertions or narrow/mobile scroll-owner tests were found.

## Standalone Map Generator (`/darkplaces/map`)

**Entry**: lazy `map-generator.index.js` → `CruorMapGeneratorMvp` in `map-generator.page.jsx`, mounted in `#darkenMapGeneratorPanel`.

**Mount boundary**

- `#darkenComposerPanel` remains mounted with `hidden`. Its effects/state and feature stylesheet remain present.
- CSS correctly scopes the normal Darken body lock to `#darkenComposerPanel:not([hidden])`; changing `hidden`, the panel ID, or that selector can lock the wrong route.

**Styles**

- Global/bootstrap, app shell, Darken/Composer CSS already present, and `map-generator.styles.css`.
- Shared `theme.css` also names map inspector, tests, room-key, and report scrollbar selectors.

**Shared UI used**

- `.cruor-ui-panel-surface`, `.cruor-ui-card-surface`, `.cruor-ui-control-surface`, `.cruor-scroll-surface`, `.cruor-composer-fact-*`, and tooltip runtime.
- Toolbar visuals are shared with the embedded Dark Places editor through `.location-map-toolbar*`, not through a standalone shared React component.

**Primary surfaces**

- Map tool rail, map canvas/topbar/bottombar, pan/zoom viewport, inspector, room key, tests/report and debug recorder/QA overlay.
- SVG render/export surface is `#cruor-map-svg`/`.cruor-map-svg` from `map-generator.render.jsx`.

**Overlays and portals**

- Room, door, corridor, stair-marker, and map action context menus are portaled to `body`.
- Map Style and level-view panels can be portaled to `body`; custom control listboxes target `.location-map-stage` when present or fall back to `body`.
- Structural-tests modal is fixed within the map tree; QA runner overlay is positioned over the workspace.

**Responsive rules**: 1180, 1120, 980, 760, and 520 px.

**Regression risk**: critical. Portal positioning, SVG hit zones, menu footprint measurement, viewport overflow, inspector/tool-rail scroll, CSS shared with the inline Composer, and export selectors are all sensitive.

**Coverage**

- `tests/e2e/app-smoke.spec.js` opens the map through the Composer and checks visible SVG.
- Map pipeline/shape/context-menu-position tests and map QA are extensive for model/geometry behavior.
- No direct-route visual baseline, pointer/keyboard interaction screenshot test, or portal-collision E2E was found.

## Terrifying Monsters (`/terrifyingmonsters`)

**Entry**: `monster-composer.index.js` → `monster-composer.page.jsx`.

**Styles**

- Global/bootstrap and app shell.
- `features/monster-composer/monster-composer.styles.css`.
- `shared/styles/composer-internals.css`.
- `features/monster-composer/components/monster-composer.start-flow.css` through the start-flow component.
- The same-named root-level `features/monster-composer/monster-composer.start-flow.css` is not imported by the current runtime.

**Shared UI used**

- `ComposerRail`/`ComposerCollapsibleSection` in `monster-composer.anatomy.jsx`.
- Shared Composer Component Navigator class vocabulary and internals, `.panel`, `.icon-btn`, `.cruor-ui-*`, `.cruor-scroll-surface`, shared tooltips.

**Primary surfaces**

- Start/template flow, frame controls, silhouette/anatomy stage, graft rails, Component Navigator drawer, selected graft inspector.
- Feature-local views: Composer, Balance, Run, and Export, selected by `viewMode` and a persistent toolbar.

**Overlays and portals**

- Current Component Navigator is an inline drawer. The same module exports a body-portaled modal implementation, but `monster-composer.page.jsx` does not instantiate it.
- Monster Frame fullscreen dialog is portaled to `document.body` and locks body overflow.
- Template picker is an inline dialog; chassis menu is an in-stage menu; frame-select listboxes portal into `.monster-shell`.
- Debug live stat-block export opens a secondary window and portals React into its document.

**Responsive rules**: min 1600 and 1380 px; 1500–1321 range; max 1320, 1280, 1240, 1220, 1180, 1040, 980, 760, 720, 700, and 520 px; reduced motion. The unusually dense breakpoint set is a migration risk.

**Regression risk**: critical. The app shell locks the document to the Monster viewport using `:has`; Composer mode relies on internal anatomy/rail scroll, while Balance/Run/Export make `.monster-shell` the scroll owner through an inline style. Component Navigator, frame popover, portal styles, and popout document CSS have separate ancestry requirements.

**Coverage**

- `tests/e2e/app-smoke.spec.js` covers opening Monster, starting from scratch, opening the Body graft navigator, adding one graft, and seeing the inspector.
- `monster:qa`, model/ruleset tests, and QA-suite tests cover data/export behavior.
- No visual, responsive, frame-modal, Balance/Run/Export scroll, or secondary-window E2E baseline was found.

## Inspirations (`/inspirations`)

**Entry**: `inspirations.index.js` → `inspirations.page.jsx`.

**Styles**: global/bootstrap, app shell, and `features/inspirations/inspirations.styles.css`.

**Shared UI used**: global tokens/raw controls/topbar/tooltip infrastructure. The page uses its own `.inspirations-panel`, cards, custom selects, chips and actions rather than shared React primitives.

**Primary surfaces/overlays**

- Hero/stats, search and three custom filter selects, card library, sticky independently scrolling dossier, and the Monster Composer handoff action.
- Select menus are inline absolute listboxes; there is no detail modal or React portal.

**Responsive rules**: 1320, 1080, and 760 px. At the responsive breakpoint the dossier becomes static with no height cap.

**Regression risk**: high. Desktop has document scroll plus a sticky dossier scroll owner; `.inspirations-page ::-webkit-scrollbar` styles every descendant scrollbar; changing grid/sticky height or broad descendant selectors can alter wheel ownership and layout.

**Coverage**

- `tests/e2e/app-smoke.spec.js` navigates to Inspirations and checks broad text only.
- Content registry validation is indirect model coverage.
- No filter, select, dossier-scroll, Monster handoff, responsive, or visual test was found.

## Inspiration Studio (`/inspiration-studio`)

**Entry**: `inspiration-studio.index.js` → `InspirationStudioPage.jsx`.

**Styles**: global/bootstrap, app shell, and `features/inspiration-studio/inspiration-studio.styles.css`.

**Shared UI used**: global tokens/raw form styles/topbar/tooltips. Studio has its own panel, card, field, tab, chip, warning, rail, menu and modal vocabulary. `StudioToolModalShell` is reusable inside Studio only.

**Primary surfaces**

- Full-height library rail, section tabs, editor main pane, resizable/collapsible right rail.
- Source, card, taxonomy/component editing and export workspaces.
- Tools for graft ledger, content health, coverage matrix, Monster batch/per-graft QA, map QA, presets, warnings and audit exports.

**Overlays**

- Inline tool/test popover menus.
- `StudioToolModalShell` dialogs for ledger/health/coverage/QA; modal body owns scrolling. They do not portal or establish their own body-lock effect because the route already locks document/app overflow.

**Responsive rules**: max 1280, 1180, 980, 860, 760, and 720 px; min 981 and 1281 px; combined 981–1280 range; system light query. Late `[data-studio-ready=true]` rules have higher specificity than some responsive rail rules and must be checked at each width.

**Regression risk**: critical. The route explicitly locks `html`, `body`, app shell, workspace and page root, then gives independent scroll ownership to library, editor main, and right rail. Nested validation/QA tables and modal bodies add more scroll boundaries. Rail widths persist in local storage.

**Coverage**

- Numerous script/model checks cover Studio draft/export/readiness/health/coverage/ledger data.
- No focused Playwright UI route, modal/menu, rail-resize, scroll-owner, responsive, or screenshot test was found.

## Output and export surfaces

| Surface | Entry and styling | Boundary/risk | Existing automated coverage |
| --- | --- | --- | --- |
| Dark Places room-key/export mode | Builder mode inside `DarkenLocationComposerPage`; `LocationExportRoomKeyPanel.jsx`; Darken CSS | Shares the same fixed viewport/rails and Component state; clipboard status and review-missing controls | Dark Places pipeline E2E covers room key, copy status, and return to missing room. |
| Map SVG/state/debug export | `map-generator.page.jsx`, `map-generator.render.jsx`, `map-generator.export.js`; map CSS | `#cruor-map-svg` is a DOM/export contract; visibility and SVG styling must be preserved in popups/downloads | Model/structural tests; basic visible SVG smoke. No screenshot/export appearance baseline. |
| Monster Export view | `monster-composer.panels.jsx` through `viewMode=export`; Monster CSS | Changes scroll owner to `.monster-shell`; raw textarea and stat-block layouts differ from Composer mode | Model/QA export coverage, no route UI baseline. |
| Monster live stat-block popout | `LiveExportPopout` in `monster-composer.page.jsx`; secondary `window`/document portal | Popout requires its own copied/embedded style context and lifecycle; app-root selectors may not match | No browser popout test found. |
| Studio Export and audit/QA downloads | Studio export section, `studio-export.js`, audit/report helpers and QA modals | Full-height route and modal scroll owners; several downloads are browser side effects | Model/script coverage, no UI/download E2E. |

## Component Navigator surfaces

| Feature | Entry | Surface and styles | Coverage/risk |
| --- | --- | --- | --- |
| Dark Places | `LocationComponentPickerModal.jsx` | Inline drawer/region; Darken aliases plus shared `.cruor-composer-*` internals; filter rail and list can both scroll | Focused component test and Dark Places E2E cover core add/block behavior; no responsive/scroll/portal screenshot. |
| Monster | `monster-composer.navigator.jsx` | Current inline drawer; exported unused modal portal; Monster aliases plus the same shared internals | App-smoke adds one graft; no modal/responsive/scroll visual coverage. |
| Tracked DOM Crucible | `crucible.template.js` + `crucible.events.js` | Older `.navigator`, `.component-list`, `.filter-combobox*` implementation; not selected by current router | Must be treated as transitional tracked code, not as a current route surface. Verify external mounting before any deletion. |

## Cross-route regression ranking

1. **Portals outside route roots**: site mega menu, tooltip portal, Dark Places choices, map context/style/level menus, Monster frame modal and secondary window lose feature ancestry unless explicit portal wrapper classes are retained.
2. **All feature CSS coexists**: static router imports and broad/raw selectors mean route-local changes can affect inactive or later-opened routes.
3. **Viewport and scroll ownership**: Darken, Monster and Studio use different `:has`/inline-style locking strategies; a shared overflow rule can cause clipping or double scrollbars.
4. **Shared map toolbar names have two owners**: Composer CSS and map CSS both style `.location-map-toolbar*`; import order and context selectors are deliberate.
5. **Responsive override density**: Monster and Darken have many repeated breakpoints and late normalization blocks; desktop canonicalization can be undone on narrow layouts.
6. **Hidden but mounted Darken Composer on map route**: changing the `hidden`/ID/scoping contract can activate the wrong global body lock or immersive override.
7. **No visual baseline**: no checked-in `toHaveScreenshot` assertions were found for any route.

## Repository-map drift and missing information

The narrative repository map is useful, but the following statements are stale or incomplete relative to the inspected code:

1. `docs/repository-map/index.md` identifies branch `main`, commit `2155e52e...`, inspected 2026-07-10; this audit starts from `refactor/sitewide-design-system` at `be61f98f...` on 2026-07-12. Generated counts/hashes must be refreshed after audit artifacts are finalized.
2. `routes-and-navigation.md` draws a route edge to `CruciblePage.jsx`; no such file exists. Current Crucible routing is an inline branch in `app/router.jsx` plus `CrucibleTopbar`.
3. `entry-points.md` lists `features/crucible/index.js` as the Crucible React wrapper/mount entry without explaining that the current router does not consume it. It is tracked transitional/runtime-capable code, not a reachable site route.
4. The map does not state that `/darkplaces/map` keeps the Darken Composer mounted under `hidden`, a critical CSS `:has` and side-effect boundary.
5. The styles area describes `.cruor-button` as a shared class pattern, but active CSS has no `.cruor-button` rule; current appearances come from co-applied feature/surface classes.
6. The narrative test coverage omits the active `tests/e2e/accessibility-settings.spec.js` and `tests/e2e/homepage.spec.js`, and therefore does not describe the current accessibility-menu baseline or the very shallow Home test.
7. The map does not document the `scrollbar` accessibility setting, its homepage-only CSS effect, or the engine-specific current scrollbar coverage. See `scrollbar-audit.md`.
8. The entry/style narrative does not make explicit that static router imports cause nearly all route styles to coexist at startup and that map CSS is reached eagerly from the Darken Composer despite the lazy map page component.

No runtime route, import, class, or UI behavior was changed during this audit.
