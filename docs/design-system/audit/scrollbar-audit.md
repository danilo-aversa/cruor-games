# Scrollbar and scroll-owner audit

Audit date: 2026-07-12  
Starting commit: `be61f98fd2537d367c757bf9796b11735bc7d193`  
Scope: all tracked runtime CSS, JavaScript/JSX, active tests, and scroll-diagnostic tooling. Evidence was read from the starting commit so unrelated edits that appeared later in the live worktree are excluded.

## Executive result

The current `Custom` / `Browser` setting is not a site-wide scrollbar-mode contract.

- The setting is real, validated, persisted in `localStorage`, and applied to `html[data-a11y-scrollbar]` before React renders.
- Only `app/home-page.css` reads `data-a11y-scrollbar`.
- `shared/styles/theme.css` applies Cruor WebKit scrollbar styling to `html` and `body` regardless of the setting. Therefore `Browser` does **not** restore a native Chromium scrollbar; it only stops Home from hiding the already-customized root scrollbar.
- Internal scrollbars are controlled by shared and feature selectors that do not consult the setting. `Browser` leaves those custom rules active.
- Firefox and Chromium are inconsistent. Firefox uses `scrollbar-width`/`scrollbar-color`; Chromium uses `::-webkit-scrollbar*`. Several late rules deliberately set Firefox to `auto` while keeping WebKit custom.
- The route-specific scroll trees are fragile. Dark Places, Terrifying Monsters, and Inspiration Studio lock document scrolling and delegate ownership to internal elements; Home and Inspirations retain document scroll; map and popup surfaces add nested owners.

The wider goal—custom scrollbars everywhere unless the user selects `Browser`—requires a new global mode gate. It cannot be achieved safely by adding more descendant scrollbar selectors.

## Declaration inventory

The starting commit contains 350 scrollbar-related CSS lines; 318 are in runtime-reachable stylesheets. No scrollbar declaration uses a cascade layer.

| Runtime stylesheet | Matching lines | Main responsibility |
| --- | ---: | --- |
| `shared/styles/theme.css` | 144 | Unconditional root WebKit scrollbar; legacy/internal named surfaces; textarea; duplicate `.cruor-scroll-surface` rules |
| `darken-location-composer.styles.css` | 67 | Composer rails, navigator, choices, map menus, room key, inspector, export list |
| `inspiration-studio.styles.css` | 32 | Library/main/right rails, component list, modal/table/health/QA surfaces |
| `monster-composer.styles.css` | 28 | Descendant-wide Monster WebKit rules, rail/list controls, scrollable non-Composer views |
| `map-generator.styles.css` | 25 | Inspector, room key, reports, select/context/style menus |
| `composer-internals.css` | 10 | Import-last Composer normalization; Firefox `auto`, WebKit 6 px custom |
| `components.css` | 5 | Shared `.cruor-scroll-surface` utility |
| `home-page.css` | 3 | Hides the root scrollbar only when Home + `Custom` |
| `inspirations.styles.css` | 3 | Styles every descendant WebKit scrollbar under `.inspirations-page` |
| `accessibility.css` | 1 | Forces the accessibility settings menu to `scrollbar-width: thin` |

`crucible.styles-old.css` has 19 additional scrollbar lines but no confirmed runtime import. It remains a legacy candidate, not deletion authorization.

The only `scrollbar-gutter` declaration is `scrollbar-gutter: stable` on the Dark Places theme-mode `.location-map-wide-details-block`.

## Shared scrollbar implementations

| Implementation | Firefox | Chromium/WebKit | Mode-aware | Notes |
| --- | --- | --- | --- | --- |
| Root `html` / `body` in `theme.css` | No root `scrollbar-color`; browser default | 15 px Cruor track/thumb unconditionally | No | Conflicts directly with the meaning of `Browser` |
| `.cruor-scroll-surface` in `components.css` | `thin` + Cruor colors | 6 px Cruor rules | No | Visual utility only; does not create overflow |
| `.cruor-scroll-surface` in `theme.css` | Later reset to `auto` | Repeats 6 px Cruor rules | No | Duplicates the shared utility with different Firefox behavior |
| Composer internal override | `auto` | 6 px Cruor rules at higher specificity | No | Intentional import-last compatibility layer |
| Feature selectors | Mixed `thin` and `auto` | Feature-local 6/8/10 px or broad descendant rules | No | Source order and ancestry determine the winner |

The `.cruor-scroll-surface` name must not be used to infer scroll ownership. `ComposerRail` adds it only when its `scrollable` prop is true, but other consumers can apply the visual class independently of `overflow`.

## `Custom` / `Browser` state flow

| Stage | Current behavior | Finding |
| --- | --- | --- |
| Default | `DEFAULT_ACCESSIBILITY_SETTINGS.scrollbar = "custom"` | Confirmed |
| Validation | Options are limited to `custom` and `browser` | Confirmed |
| Persistence | Full settings object saved under `cruor.accessibility` | Confirmed; storage errors are caught |
| Startup | `app/main.jsx` calls `applyAccessibilitySettingsToDocument(readAccessibilitySettings())` before `root.render()` | Applied before React render; no inline bootstrap exists in `index.html`, so CSS/HTML may be briefly parsed before the module executes |
| DOM contract | Writes `data-a11y-scrollbar` on `<html>` and dispatches `cruor:accessibility-change` | Confirmed |
| React shell | `AppShell` mirrors all other accessibility settings but omits scrollbar from `.app-shell` data attributes | Root-only contract; portaled content can still match `<html>` ancestry |
| Controls | Desktop and mobile settings render from `ACCESSIBILITY_SETTING_GROUPS` | Confirmed |
| CSS consumption | Only Home reads `[data-a11y-scrollbar]` | Incomplete |
| Automated coverage | Accessibility E2E tests assert theme/contrast/motion/text/focus/tooltips but never scrollbar | Missing regression gate |

### Effective engine behavior

| Mode | Home, Chromium | Other routes, Chromium | Firefox |
| --- | --- | --- | --- |
| `Custom` | Root WebKit scrollbar hidden; Cruor Home progress UI represents page progress | Root scrollbar remains Cruor-styled; internal rules vary | Home root hidden with `scrollbar-width:none`; other root scrollbars largely browser-native, internal owners vary between `thin` and `auto` |
| `Browser` | Root scrollbar visible but still Cruor-styled by `theme.css` | Same unconditional Cruor root styling | Root is generally browser-native; internal custom colors/widths remain active |

The current localized strings describe `Browser` as native for the homepage, which is not true in Chromium.

## Scroll-owner map

| Surface | Primary owner | Nested owners | Browser-native scrollbar can appear? | Highest risk |
| --- | --- | --- | --- | --- |
| Global shell menus | Document on ordinary routes; `.site-topbar__mobile-menu` for mobile menu | Settings/mega-menu content | Yes when content lacks matching custom selector | Body portals sit outside feature roots |
| Home | `html`/`body` document scroll | Contact/zoom dialog content where applicable; carousels are clipped, not scroll owners | `Browser` shows root scrollbar, but Chromium styling is still custom | Custom mode hides native root while JavaScript progress/gating depends on document metrics |
| Dark Places Composer | Document, app shell, workspace, panel, Composer shell and stage are locked; visible rails/lists own scrolling | Left/right rails, theme details block, navigator filter rail + result list, slot/program lists, inspector, room key, menus | Yes on selectors reset to `auto` or without WebKit rules | Multiple candidate owners and late overrides; an ancestor/child can both become scrollable |
| Standalone Map | Workspace/canvas layout; inspector/tool rail/room key/test report own internal scroll | Context menus, select menus, style panel, tests dialog | Yes; several map selectors explicitly reset Firefox to `auto` | Hidden Composer remains mounted; changing `hidden`/`:has` scoping can activate the wrong lock |
| Terrifying Monsters Composer | Body and shell locked; anatomy left/right columns and navigator rail/list own scroll | Slot tabs, component details/meta, frame drawer, template grid | Yes where feature rules use `auto` | Broad `.monster-shell ::-webkit-scrollbar` affects every descendant and competes with shared Composer rules |
| Monster Balance/Run/Export | `.monster-shell[data-scrollable-view="true"]` | Tables, textarea, export console | Yes in nested `auto` surfaces | Scroll ownership changes by view mode; removing the data/inline contract can clip entire views |
| Inspirations | Document scroll | Sticky `.inspirations-page__dossier` and select menus | Yes in Firefox; Chromium descendants receive the broad page rule | Intentional document + dossier nesting can trap wheel/keyboard focus at dossier boundaries |
| Inspiration Studio desktop | `html`/`body` and shell are locked; `.inspiration-studio__main`, `.studio-library-list`, `.studio-right-rail` are peers | Modal bodies, ledger/health/coverage/QA table wrappers | Yes where a nested owner has no WebKit match | Three peer owners plus nested tables/modals; resize/collapse rules must keep `min-height:0` |
| Inspiration Studio narrow | Responsive rules relax/rearrange rails; exact document ownership changes below the desktop `:has` gate | Section tabs and modal/table surfaces | Yes | Late ready-state rules and responsive rules can disagree |
| Portaled menus/tooltips | Usually menu panel if capped; tooltip is not scrollable | Context/flyout submenus | Yes if the portal wrapper lacks the feature class | Feature-root descendant scrollbar rules do not cross a body portal |

## Double-scroll-owner risks

### Critical / high

1. **Dark Places rail nesting.** Theme/scratch rules have historically assigned `overflow-y:auto` to both `.location-map-frame-rail` and content inside `.location-brief-panel__fields`. The latest theme-mode rule correctly locks the outer rail (`overflow:hidden`) and delegates to `.location-map-wide-details-block`; this is a known-good boundary that must be preserved. Scratch/frame/slots modes still have multiple source-order candidates and need computed-style verification.
2. **Dark Places Component Navigator.** `.component-navigator-modal__rail` and `.component-navigator-modal__list` are both scrollable. This may be intentional (filters versus results), but height/min-height changes can turn the whole drawer and the list into competing vertical owners.
3. **Monster Component Navigator.** The drawer rail, slot tabs, list, open-card meta list, and details panel can all use `overflow:auto`. Shared Composer rules later reset some Firefox styling but do not simplify ownership.
4. **Inspiration Studio.** Main, library and right rail are legitimate peer owners; modal bodies and table wrappers become nested owners. Missing `min-height:0`, a changed grid track, or a global modal overflow rule can re-enable document scroll or create double bars.
5. **Map inspector/report stack.** Inspector panel scroll, inspector sections, room key, test dialog, and report list are separately styled. If both a containing inspector and a section receive bounded heights, two adjacent/nested bars appear.

### Medium

- Inspirations intentionally combines document scroll with a sticky dossier scroll. Wheel propagation and keyboard focus should be tested at the top and bottom of the dossier.
- Home dialog scroll locking writes inline `overflow:hidden` to both `html` and `body`. The setting and modal cleanup must not leave the page locked.
- Menu panels use bounded internal scrolling. Portaled menu ancestry and viewport collision code must be tested together; moving only the CSS can expose a document scrollbar behind an open menu.
- Scrollbar styling selectors sometimes target descendants broadly (`.monster-shell ::-webkit-scrollbar`, `.inspirations-page ::-webkit-scrollbar`, Dark Places theme rail descendants), so a new nested scroll owner can silently acquire visuals without an explicit contract.

## Recommended future contract (not implemented)

1. Put the mode on `<html>` before first paint, ideally with a minimal inline bootstrap or equivalent pre-render mechanism that reads only the validated persisted value.
2. Gate every scrollbar visual rule under one contract, for example `html[data-a11y-scrollbar="custom"]`; define `Browser` resets for both Firefox and WebKit.
3. Separate **visual styling** (`.cruor-scroll-surface`) from **ownership** (`data-scroll-owner` or a layout class). Neither should imply the other.
4. Keep one root implementation and one internal implementation. Feature CSS should declare overflow/geometry only unless a component is genuinely unique.
5. Preserve the Dark Places theme-mode outer-hidden/inner-auto boundary as a regression fixture.
6. Add Playwright coverage for both settings on Home, Dark Places, Monster non-Composer view, Inspirations dossier, Studio, and a body-portaled menu in Chromium; add a Firefox project or targeted manual matrix for `scrollbar-width`/`scrollbar-color`.
7. Do not migrate scrollbars in the same change as rail/grid geometry. Roll back mode styling independently from ownership changes.

No scrollbar, overflow, setting, or runtime source was changed by this audit.
