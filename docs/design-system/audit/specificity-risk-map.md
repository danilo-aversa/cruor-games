# Specificity and cascade risk map

Audit date: 2026-07-12  
Starting commit: `be61f98fd2537d367c757bf9796b11735bc7d193`

## Baseline metrics

- 0 tracked stylesheets use `@layer`.
- 350 `!important` declarations exist: 156 in `shared/styles/accessibility.css`, 114 in Inspiration Studio, 45 in the app shell, 17 in map CSS, 10 in Monster CSS, 5 in Home and 3 in colors.
- 140 selector lines use `:has()`: 56 in Dark Places, 28 in Monster, 10 in shared Composer internals, 7 each in app shell and Studio, plus smaller groups elsewhere. Nineteen more occur in the unimported old Crucible stylesheet.
- 20 of 23 stylesheets contain broad selectors; `theme.css` alone has 37 documented root/raw-element selectors.
- No checked-in visual screenshot baseline protects the final cascade.

Specificity scores mentioned below are heuristic ranking aids, not browser-calculated tuples. The source selectors and declarations are confirmed facts.

## Ranked conflicts

| Severity | Conflict | Evidence | Failure mode | Migration boundary |
| --- | --- | --- | --- | --- |
| Critical | Route viewport locks | `.app-shell:has(#monsterComposerPanel) ...`, `.app-shell:has(#darkenComposerPanel:not([hidden])) ...`, immersive `html:has(...)` chains include up to two IDs plus multiple classes/attributes | Wrong route locks body/app overflow, clips content, or hides topbar | Preserve panel IDs, `hidden`, active state and route roots; test direct loads and route switches |
| Critical | Dark Places late override stack | 8k+ line feature file with repeated stage/rail/toolbar rules, 56 `:has` lines and high-ID selectors | Later rule silently changes overflow, z-index, portal visibility or responsive layout | Migrate one state/mode at a time; keep source-order snapshots |
| Critical | Monster shell ownership | App shell locks document; Monster CSS changes owner by view and applies `.monster-shell ::-webkit-scrollbar` broadly | Composer columns clip or non-Composer views cannot scroll | Keep Composer and Balance/Run/Export validation separate |
| Critical | Portals outside feature roots | Mega menu, tooltip, Dark Places selects, map context/style menus, Monster frame modal and popout render under `body` or another document | Page-root rules no longer match; shared rules or raw tags win | Preserve explicit portal wrapper classes; test body and secondary-window ancestry |
| High | Shared Composer import-last normalization | `composer-internals.css` says it must load after each feature stylesheet and uses repeated `.cruor-composer-shell ...` selectors | Import movement reactivates feature aliases or changes Firefox/WebKit scrollbars | Treat it as a compatibility layer until both Composer implementations migrate together |
| High | Same map toolbar styled by two feature files | `.location-map-toolbar*` exists in Composer and map CSS; both are runtime-present | Embedded and standalone maps diverge based on source order | Migrate as one component with two context tests |
| High | Accessibility `!important` layer without layers | 156 declarations intentionally override shared and feature controls | Canonical components appear inconsistent in high/maximum contrast or strong focus | Every component phase must test accessibility variants before narrowing selectors |
| High | Inspiration Studio ready-state versus responsive rules | 114 `!important` declarations, desktop `[data-studio-ready=true]` rules and multiple min/max-width blocks | A later ready-state rule undoes collapsed/narrow rail behavior | Validate 1281+, 981–1280, 980-, 860-, 760- breakpoints |
| High | Global raw-element styling | `theme.css` styles `button`, `input`, `textarea`, headings, paragraphs, focus/hover and textarea scrollbars | Adding semantic markup changes appearance across routes; feature roots then override inconsistently | Add canonical classes first; narrow raw rules only after all consumers opt in |
| High | Global feature CSS coexistence | Router statically imports Home, Darken, Inspirations, Studio and Monster; map CSS is reached eagerly by Darken | A broad selector can affect inactive or later-opened routes | Do not assume route-based code splitting isolates CSS |
| High | Overlay pseudo-elements | Body/page/stage/panel `::before` layers, including the Map Style portal glass, create stacking/backdrop contexts | Background, border, hover state or scrollbar is obscured; nested backdrop filtering stops working | Preserve pseudo-element pointer events and stacking context; test flyouts over map and page |
| Medium | Generic names | `.panel`, `.icon-btn`, `.active`, `.is-active`, `.component-card`, `.navigator`, `.meta-*`, `.context-menu` | Unscoped additions collide with older DOM Crucible or other features | New canonical names need a `cruor-` prefix and compatibility aliases |
| Medium | Duplicate shared scrollbar rules | `.cruor-scroll-surface` is defined in components, theme and Composer internals with different Firefox values | Engine-specific appearance depends on import order | Centralize only after mode/ownership contract exists |
| Medium | Home ID/state selectors | `#workbenchFlow.is-step-* ...` chains outrank future component classes | Shared card/animation normalization does not apply or breaks sticky progress | Keep Home workbench state selectors feature-local |
| Medium | Responsive redefinition | Dark Places and Monster repeatedly switch `overflow:hidden/auto/visible`, grid columns and portal visibility at late breakpoints | Desktop-neutral refactor regresses only narrow widths | Compare the final rule at every named breakpoint, not only the base declaration |

## Highest-specificity examples

Confirmed examples include:

- `html:has(#darkenComposerPanel:not([hidden]) .location-composer[data-location-immersive="true"]) #darkenComposerPanel > .cruor-composer-shell.location-composer`
- `.app-shell:has(#darkenComposerPanel:not([hidden])) #darkenComposerPanel .cruor-composer-workspace.location-composer__workspace`
- `.app-shell:has(#monsterComposerPanel) #monsterComposerPanel > .monster-shell`
- `html:has(#darkenComposerPanel:not([hidden]) .location-composer[data-location-immersive="true"]) .app-shell[data-active-section="crucible"] > .app-shell__workspace > section`
- `#workbenchFlow.is-step-3 .cruor-home__process-step[data-step="3"] .cruor-home__process-card-inner`

These selectors encode state and layout safety, not only visuals. Replacing them with a shorter canonical component selector before moving the state contract would change behavior.

## Import-order dependencies

The source graph has 19 runtime-reachable stylesheets. The deterministic first-encounter order is documented in `css-inventory.json`, but Vite's extracted bundle is the final cascade authority.

Known dependencies:

1. `components.css` assumes token definitions from `colors.css` and coexists with later feature rules.
2. `composer-internals.css` must follow Dark Places and Monster feature styles.
3. Map CSS is loaded both through the Dark Places Composer and the lazy map entry; importing the component lazily does not isolate the CSS.
4. `theme.css` and `components.css` both define `.cruor-scroll-surface`; later Composer rules change it again.
5. Accessibility CSS is imported from `app/main.jsx` after direct global imports and uses `!important` to cross feature boundaries.
6. App-shell selectors style feature roots and therefore intentionally cross the `app/` / `features/` architecture boundary.

Before changing imports, extract the built CSS order and save it as baseline evidence. Source import statements alone do not prove final Vite order across dependency traversal.

## Global leakage

- `theme.css`: document/root, universal and raw form/typography rules; named legacy Crucible/map surfaces.
- `accessibility.css`: broad `:where(...)` groups and `!important` overrides spanning shell, menus, panels, cards and controls.
- `monster-composer.styles.css`: descendant-wide raw controls and WebKit scrollbar styling.
- `inspirations.styles.css`: every descendant WebKit scrollbar under the page root.
- Home CSS: ancestry-based raw headings/buttons/forms plus ID-driven workbench state.
- Feature CSS is bundled together, so a generic class collision can leak even when only one route is visible.

## Cascade-layer evaluation

Layers are useful, but introducing them piecemeal is dangerous because **unlayered legacy CSS outranks layered author CSS regardless of selector specificity**. Putting new canonical components into a layer while leaving feature overrides unlayered would make the new design system lose unexpectedly.

Recommended eventual order:

```css
@layer reset, tokens, base, components, patterns, feature-layout, utilities, compatibility, overrides;
```

Adjustments from the proposed example:

- `patterns` holds Composer-specific shared structures above primitives.
- `feature-layout` follows component visuals so feature geometry can be explicit without redefining surfaces.
- `compatibility` is a temporary home for old aliases and import-order bridges.
- `overrides` is reserved for documented accessibility/emergency cases, not ordinary page styling.

Safest introduction sequence:

1. freeze and test current emitted order;
2. declare the layer order without moving rules;
3. move token definitions whose resolved values can be compared mechanically;
4. move a complete component family and all its compatibility aliases together;
5. keep unlayered legacy rules until their route migration is complete, acknowledging they still win;
6. move feature layout only after component visuals no longer depend on page-root overrides;
7. migrate accessibility overrides last and reduce `!important` only with variant tests.

Do not introduce layers in the same change that renames classes or changes portals/overflow.

## Anti-regression checks

- Computed-style snapshots for representative controls and panels on every route.
- Screenshots at desktop and narrow breakpoints, including accessibility modes.
- Direct route loads plus back/forward and route switching.
- Body-portaled menus, modal backdrops, tooltip and Monster secondary-window export.
- Dark Places theme/scratch/slots/immersive modes and standalone map.
- Monster Composer plus Balance/Run/Export scroll modes.
- Browser/Custom scrollbar behavior in Chromium and Firefox.
- Selector dependency check before removing any class or data attribute.

No selector, import, specificity or runtime style was changed in this audit.
