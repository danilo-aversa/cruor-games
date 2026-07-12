# Design-token and raw-value inventory

This is the human-readable companion to `token-inventory.json`. It was generated deterministically by `node scripts/design-system-audit/generate-inventories.mjs` from Git-tracked source at commit `be61f98fd2537d367c757bf9796b11735bc7d193` on branch `refactor/sitewide-design-system`.

No runtime file is changed by the generator. “Unused,” category assignments, migration targets, and raw-value classifications are static heuristics, not deletion or refactor authorization.

## Scope and method

- 23 tracked stylesheets were inventoried; 19 have a confirmed import path from `index.html` / `app/main.jsx`, and 4 do not.
- Custom properties are scanned in tracked CSS, browser modules, tests/QA, scripts, HTML, and SVG source. Documentation, reports, generated outputs, dependencies, and the audit script itself are excluded.
- The current canonical token-file boundary is `shared/styles/colors.css`, `shared/styles/theme.css`, and `shared/styles/typography.css`. This is a description of the present architecture, not an endorsement of keeping all three monolithic.
- Runtime reachability includes literal dynamic imports. Dynamic token names and styles injected by remote stylesheets cannot be proven statically.
- All paths in JSON are repository-relative POSIX paths. Every finding distinguishes confirmed source evidence from heuristic classification.

## Headline counts

| Measure | Count |
| --- | ---: |
| Unique custom-property names | 1814 |
| Definition sites | 3014 |
| Usage sites | 11888 |
| Used without a confirmed definition | 31 |
| Defined without a confirmed tracked usage | 145 |
| Duplicate normalized value groups | 193 |
| Potential circular alias groups across merged selector scopes | 10 |
| Alias/dependency chains at depth 4+ | 44 |
| Raw-value groups outside current canonical files | 1357 |
| Raw-value occurrences outside current canonical files | 13256 |

## Token categories

| Category | Tokens |
| --- | --- |
| alias | 148 |
| component-token | 68 |
| deprecated-or-apparently-unused | 145 |
| feature-domain-token | 64 |
| global-primitive-token | 1184 |
| global-semantic-token | 65 |
| layout-token | 75 |
| page-specific-visual-token | 34 |
| unresolved-or-undefined | 31 |

The split already contains useful migration boundaries:

- `shared/styles/colors.css` is a large primitive/effect catalog. Its RGB primitives, alpha variants, gradients, shadows, and filters are existing design-system work and should be normalized or partitioned only after consumer coverage is locked.
- `shared/styles/typography.css` is the current type-size scale and accessibility scaling boundary. Display sizes intentionally remain unscaled while interface copy depends on `--cruor-text-scale`.
- `shared/styles/theme.css` mixes semantic aliases with spacing, sizing, border, surface, control, component, and z-index values. That mixed ownership is the clearest future partition point.
- `shared/styles/composer-system.css` and `shared/styles/composer-internals.css` are already cross-feature Composer component work. Their APIs should be evaluated and preserved through migration rather than replaced wholesale.
- Feature-prefixed variables divide into two groups: layout/domain values that should usually remain local, and generic visual concepts that should be compared against shared semantic/component tokens.

## Used without a confirmed definition

| Token | Uses | All uses have fallback | First evidence |
| --- | --- | --- | --- |
| `--canvas-action-overlap` | 1 | no | `features/crucible/crucible.events.js:785` |
| `--cruor-color-blood-a100` | 4 | yes | `features/darken-location/composer/darken-location-composer.styles.css:6995`, `features/darken-location/map-generator/map-generator.styles.css:1961`, `features/darken-location/map-generator/map-generator.styles.css:2057` |
| `--cruor-color-blood-a120` | 1 | no | `features/darken-location/map-generator/map-generator.styles.css:1767` |
| `--cruor-color-blood-bright-a780` | 1 | no | `features/darken-location/map-generator/map-generator.styles.css:1814` |
| `--cruor-color-bone` | 1 | yes | `features/darken-location/map-generator/map-generator.styles.css:2549` |
| `--cruor-color-good-a240` | 2 | no | `features/darken-location/composer/darken-location-composer.styles.css:7466`, `features/darken-location/composer/darken-location-composer.styles.css:7526` |
| `--cruor-color-hex-f0b3be` | 1 | yes | `features/darken-location/map-generator/map-generator.styles.css:3189` |
| `--cruor-color-ink-a360` | 1 | no | `features/darken-location/composer/darken-location-composer.styles.css:4053` |
| `--cruor-color-ink-a430` | 1 | no | `features/darken-location/composer/darken-location-composer.styles.css:4817` |
| `--cruor-color-milk-a180` | 1 | no | `features/darken-location/composer/darken-location-composer.styles.css:2357` |
| `--cruor-color-milk-a820` | 3 | no | `features/darken-location/composer/darken-location-composer.styles.css:262`, `features/darken-location/map-generator/map-generator.styles.css:2116`, `features/darken-location/map-generator/map-generator.styles.css:3165` |
| `--cruor-color-r0-g0-b0-a720` | 1 | yes | `features/inspiration-studio/inspiration-studio.styles.css:6453` |
| `--cruor-color-r208-g162-b170-a300` | 1 | no | `app/home-page.css:1082` |
| `--cruor-color-r214-g184-b98-a280` | 2 | no | `features/darken-location/composer/darken-location-composer.styles.css:7470`, `features/darken-location/composer/darken-location-composer.styles.css:7530` |
| `--cruor-color-r240-g215-b220-a700` | 1 | no | `app/home-page.css:2892` |
| `--cruor-color-r255-g126-b139-a900` | 2 | no | `features/inspiration-studio/inspiration-studio.styles.css:5979`, `features/inspiration-studio/inspiration-studio.styles.css:6308` |
| `--cruor-color-r255-g229-b184-a900` | 1 | no | `features/inspiration-studio/inspiration-studio.styles.css:6294` |
| `--cruor-color-r7-g6-b5-a920` | 2 | no | `features/darken-location/map-generator/map-generator.styles.css:1656`, `features/darken-location/map-generator/map-generator.styles.css:1829` |
| `--cruor-color-r8-g6-b7-a820` | 1 | no | `features/inspiration-studio/inspiration-studio.styles.css:6041` |
| `--cruor-color-surface-soft-a320` | 1 | no | `features/darken-location/composer/darken-location-composer.styles.css:2358` |
| `--cruor-color-text-a860` | 1 | yes | `features/darken-location/composer/darken-location-composer.styles.css:6288` |
| `--cruor-composer-rail-surface-background` | 1 | no | `features/darken-location/composer/darken-location-composer.styles.css:8076` |
| `--cruor-composer-rail-surface-filter` | 2 | no | `features/darken-location/composer/darken-location-composer.styles.css:8077`, `features/darken-location/composer/darken-location-composer.styles.css:8078` |
| `--cruor-gradient-linear-006-3a071190` | 1 | no | `features/darken-location/composer/darken-location-composer.styles.css:4817` |
| `--cruor-side-panel-width` | 2 | yes | `shared/styles/composer-primitives.css:13`, `shared/styles/composer-system.css:13` |
| `--font-body` | 1 | no | `features/darken-location/composer/darken-location-composer.styles.css:4081` |
| `--font-heading` | 3 | yes | `features/darken-location/composer/darken-location-composer.styles.css:6116`, `features/darken-location/composer/darken-location-composer.styles.css:6383`, `features/darken-location/composer/darken-location-composer.styles.css:7142` |
| `--monster-stage-transition-enter` | 5 | yes | `features/monster-composer/monster-composer.styles.css:12054`, `features/monster-composer/monster-composer.styles.css:12058`, `features/monster-composer/monster-composer.styles.css:12062` |
| `--monster-stage-transition-exit` | 3 | yes | `features/monster-composer/monster-composer.styles.css:12049`, `features/monster-composer/monster-composer.styles.css:12072`, `features/monster-composer/monster-composer.styles.css:12078` |
| `--text-size-sm` | 9 | no | `app/home-page-video.css:79`, `app/home-page.css:489`, `app/home-page.css:674` |
| `--workbench-sticky-height` | 1 | no | `scripts/diagnose-workbench-scroll.mjs:475` |

An undefined result means only that no tracked static definition was found. A fallback can reduce immediate breakage, but does not prove that the intended theme value is correct. Dynamic names, remote CSS, and host integration remain possible sources.

## Defined without a confirmed tracked usage

The JSON file contains the complete list. The first 40, sorted by token name, are shown here.

| Token | Inferred role | Definitions | Evidence |
| --- | --- | --- | --- |
| `--component-navigator-smart-min` | layout-token | 1 | `features/monster-composer/monster-composer.styles.css:5214` |
| `--cruor-accent-primary` | global-semantic-token | 1 | `shared/styles/colors.css:1248` |
| `--cruor-accent-secondary` | global-semantic-token | 1 | `shared/styles/colors.css:1249` |
| `--cruor-border-strong` | global-semantic-token | 1 | `shared/styles/theme.css:73` |
| `--cruor-button-bg` | component-token | 1 | `shared/styles/theme.css:81` |
| `--cruor-button-bg-active` | component-token | 1 | `shared/styles/theme.css:83` |
| `--cruor-button-bg-hover` | component-token | 1 | `shared/styles/theme.css:82` |
| `--cruor-button-text` | component-token | 1 | `shared/styles/theme.css:86` |
| `--cruor-button-text-muted` | component-token | 1 | `shared/styles/theme.css:87` |
| `--cruor-color-black-a130` | global-primitive-token | 3 | `shared/styles/colors.css:81`, `shared/styles/colors.css:1989` |
| `--cruor-color-black-a150` | global-primitive-token | 3 | `shared/styles/colors.css:83`, `shared/styles/colors.css:1991` |
| `--cruor-color-black-a780` | global-primitive-token | 3 | `shared/styles/colors.css:113`, `shared/styles/colors.css:2021` |
| `--cruor-color-blood-strong-a140` | global-primitive-token | 1 | `shared/styles/colors.css:227` |
| `--cruor-color-glass` | global-semantic-token | 1 | `shared/styles/colors.css:55` |
| `--cruor-color-glass-line` | global-semantic-token | 1 | `shared/styles/colors.css:63` |
| `--cruor-color-glass-satin` | global-semantic-token | 1 | `shared/styles/colors.css:56` |
| `--cruor-color-glass-satin-strong` | global-semantic-token | 1 | `shared/styles/colors.css:57` |
| `--cruor-color-ink` | global-semantic-token | 1 | `shared/styles/colors.css:50` |
| `--cruor-color-ink-deep` | global-semantic-token | 1 | `shared/styles/colors.css:54` |
| `--cruor-color-ink-muted` | global-semantic-token | 1 | `shared/styles/colors.css:53` |
| `--cruor-color-ink-raised` | global-semantic-token | 1 | `shared/styles/colors.css:52` |
| `--cruor-color-ink-soft` | global-semantic-token | 1 | `shared/styles/colors.css:51` |
| `--cruor-color-milk` | global-semantic-token | 1 | `shared/styles/colors.css:70` |
| `--cruor-color-parchment` | global-semantic-token | 1 | `shared/styles/colors.css:71` |
| `--cruor-color-parchment-ink` | global-semantic-token | 1 | `shared/styles/colors.css:73` |
| `--cruor-color-parchment-line` | global-semantic-token | 1 | `shared/styles/colors.css:72` |
| `--cruor-color-r12-g9-b10-a920` | global-primitive-token | 3 | `shared/styles/colors.css:398`, `shared/styles/colors.css:1388` |
| `--cruor-color-r208-g162-b170-a220` | global-primitive-token | 3 | `shared/styles/colors.css:443`, `shared/styles/colors.css:1433` |
| `--cruor-color-r208-g162-b170-a500` | global-primitive-token | 3 | `shared/styles/colors.css:449`, `shared/styles/colors.css:1439` |
| `--cruor-color-r208-g162-b170-a520` | global-primitive-token | 3 | `shared/styles/colors.css:450`, `shared/styles/colors.css:1440` |
| `--cruor-color-r232-g167-b69-a080` | global-primitive-token | 3 | `shared/styles/colors.css:472`, `shared/styles/colors.css:1462` |
| `--cruor-color-r232-g167-b69-a220` | global-primitive-token | 3 | `shared/styles/colors.css:474`, `shared/styles/colors.css:1464` |
| `--cruor-color-r232-g167-b69-a320` | global-primitive-token | 3 | `shared/styles/colors.css:475`, `shared/styles/colors.css:1465` |
| `--cruor-color-r232-g167-b69-a580` | global-primitive-token | 3 | `shared/styles/colors.css:476`, `shared/styles/colors.css:1466` |
| `--cruor-color-r232-g167-b69-a620` | global-primitive-token | 3 | `shared/styles/colors.css:477`, `shared/styles/colors.css:1467` |
| `--cruor-color-r28-g18-b21-a960` | global-primitive-token | 3 | `shared/styles/colors.css:531`, `shared/styles/colors.css:1521` |
| `--cruor-color-r7-g6-b7-a760` | global-primitive-token | 3 | `shared/styles/colors.css:558`, `shared/styles/colors.css:1548` |
| `--cruor-color-r9-g6-b8-a560` | global-primitive-token | 3 | `shared/styles/colors.css:578`, `shared/styles/colors.css:1568` |
| `--cruor-color-r9-g7-b8-a420` | global-primitive-token | 3 | `shared/styles/colors.css:579`, `shared/styles/colors.css:1569` |
| `--cruor-color-r9-g8-b9-a680` | global-primitive-token | 3 | `shared/styles/colors.css:580`, `shared/styles/colors.css:1570` |

The large primitive catalog deliberately exposes more values than current source may consume. Therefore “apparently unused” is a verification queue, especially for `colors.css`; it is not evidence sufficient for deletion.

## Aliases and dependency depth

| Token | Dependency depth | Direct targets |
| --- | --- | --- |
| `--cruor-border-thin` | 5 | `--line` |
| `--cruor-button-bg` | 5 | `--surface-3` |
| `--cruor-button-bg-hover` | 5 | `--cruor-color-hex-1d050a` |
| `--cruor-input-border` | 5 | `--cruor-color-rose-a520`, `--cruor-color-white-a820`, `--line` |
| `--cruor-panel-border` | 5 | `--cruor-border-panel` |
| `--shadow` | 5 | `--cruor-color-black-a550`, `--cruor-color-r74-g46-b24-a280`, `--cruor-panel-shadow`, `--cruor-theme-shadow` |
| `--cruor-border-panel` | 4 | `--cruor-color-white`, `--glass-line` |
| `--cruor-button-text` | 4 | `--text` |
| `--cruor-button-text-muted` | 4 | `--muted` |
| `--cruor-color-hex-070506` | 4 | `--cruor-surface-panel` |
| `--cruor-color-hex-09090a` | 4 | `--cruor-surface-panel` |
| `--cruor-color-hex-1d050a` | 4 | `--cruor-surface-panel` |
| `--cruor-composer-panel-bg` | 4 | `--cruor-color-r12-g10-b12-a740`, `--cruor-ui-panel-bg` |
| `--cruor-composer-panel-border` | 4 | `--cruor-composer-panel-border-color`, `--cruor-ui-panel-border` |
| `--cruor-composer-panel-border-top` | 4 | `--cruor-composer-panel-border-top-color`, `--cruor-ui-panel-border-top` |
| `--cruor-composer-panel-image` | 4 | `--cruor-gradient-linear-029-a37c5252`, `--cruor-ui-panel-image` |
| `--cruor-gradient-linear-204-5851f085` | 4 | `--cruor-color-transparent`, `--panel-milk` |
| `--cruor-panel-bg` | 4 | `--glass-satin` |
| `--cruor-panel-bg-strong` | 4 | `--glass-satin-strong` |
| `--cruor-panel-glow` | 4 | `--panel-white-glow` |
| `--cruor-panel-highlight` | 4 | `--panel-white-line` |
| `--cruor-panel-shadow` | 4 | `--cruor-color-black-a420`, `--cruor-color-black-a620`, `--cruor-color-milk-a034`, `--cruor-color-milk-a045`, `--panel-white-line` |
| `--cruor-shadow-box-119` | 4 | `--cruor-color-black-a420`, `--cruor-color-black-a620`, `--cruor-color-milk-a034`, `--cruor-color-milk-a045`, `--panel-white-line` |
| `--cruor-surface-tooltip` | 4 | `--cruor-rgb-parchment-panel`, `--cruor-surface-panel-strong` |
| `--line` | 4 | `--cruor-color-hex-c2a77a`, `--cruor-color-line`, `--cruor-color-rose-a440`, `--cruor-color-white-a700`, `--cruor-theme-line` |
| `--line-strong` | 4 | `--cruor-color-hex-7e3f2d`, `--cruor-color-line-strong`, `--cruor-color-r255-g212-b220-a700`, `--cruor-color-white`, `--cruor-theme-line-strong` |
| `--monster-card-bg-active` | 4 | `--cruor-ui-card-bg-active` |
| `--monster-card-bg-soft` | 4 | `--cruor-ui-card-bg` |
| `--monster-card-border-active` | 4 | `--cruor-ui-card-border-active`, `--cruor-ui-card-border-color-active` |
| `--monster-card-border-soft` | 4 | `--cruor-ui-card-border`, `--cruor-ui-card-border-color` |

| Potential circular group | Internal edges |
| --- | --- |
| `--accent` -> `--cruor-color-accent` | --accent -> --cruor-color-accent, --cruor-color-accent -> --accent |
| `--accent-2` -> `--cruor-color-accent-2` | --accent-2 -> --cruor-color-accent-2, --cruor-color-accent-2 -> --accent-2 |
| `--accent-3` -> `--cruor-color-accent-3` | --accent-3 -> --cruor-color-accent-3, --cruor-color-accent-3 -> --accent-3 |
| `--bg` -> `--cruor-color-bg` | --bg -> --cruor-color-bg, --cruor-color-bg -> --bg |
| `--cruor-accent-bright` -> `--cruor-color-hex-9a3b36` -> `--cruor-theme-accent-3` | --cruor-accent-bright -> --cruor-theme-accent-3, --cruor-color-hex-9a3b36 -> --cruor-accent-bright, --cruor-theme-accent-3 -> --cruor-color-hex-9a3b36 |
| `--cruor-gradient-linear-026-1ad4f65f` -> `--cruor-gradient-parchment-control` | --cruor-gradient-linear-026-1ad4f65f -> --cruor-gradient-parchment-control, --cruor-gradient-parchment-control -> --cruor-gradient-linear-026-1ad4f65f |
| `--cruor-gradient-linear-057-7894e977` -> `--cruor-gradient-parchment-flat` | --cruor-gradient-linear-057-7894e977 -> --cruor-gradient-parchment-flat, --cruor-gradient-parchment-flat -> --cruor-gradient-linear-057-7894e977 |
| `--cruor-gradient-linear-059-8e6bc32f` -> `--cruor-gradient-parchment-soft` | --cruor-gradient-linear-059-8e6bc32f -> --cruor-gradient-parchment-soft, --cruor-gradient-parchment-soft -> --cruor-gradient-linear-059-8e6bc32f |
| `--cruor-gradient-parchment-accent` -> `--cruor-gradient-radial-230-4b421825` | --cruor-gradient-parchment-accent -> --cruor-gradient-radial-230-4b421825, --cruor-gradient-radial-230-4b421825 -> --cruor-gradient-parchment-accent |
| `--cruor-gradient-parchment-accent-right` -> `--cruor-gradient-radial-262-81e4e47e` | --cruor-gradient-parchment-accent-right -> --cruor-gradient-radial-262-81e4e47e, --cruor-gradient-radial-262-81e4e47e -> --cruor-gradient-parchment-accent-right |

Depth counts custom-property dependencies in definitions, including composite values such as `rgb(var(...))`. A deep chain is a migration/order risk even when it is not a pure one-to-one alias. Potential cycles merge definitions from every selector scope; their edges are confirmed, but whether all edges are simultaneously active is a cascade question that must be verified before migration.

## Duplicate values under different names

| Normalized value | Token names | Kind | Examples |
| --- | --- | --- | --- |
| `rgba(var(--cruor-rgb-parchment-ink), 0.18)` | 18 | alias-or-derived-duplicate | `--cruor-color-black-a540`, `--cruor-color-black-a550`, `--cruor-color-black-a560`, `--cruor-color-black-a580`, `--cruor-color-black-a620`, `--cruor-color-black-a640` … |
| `100%` | 12 | literal-duplicate | `--component-stage-list-width`, `--component-stage-rail-width`, `--guided-flow-toggle-width`, `--location-flow-toggle-width`, `--location-workspace-max`, `--stage-center-height` … |
| `var(--cruor-color-muted)` | 11 | alias-or-derived-duplicate | `--cruor-color-hex-7e3f2d`, `--cruor-color-hex-bec8c5`, `--cruor-color-hex-c2a77a`, `--cruor-color-hex-c3a1a8`, `--cruor-color-hex-c8a2a8`, `--cruor-color-hex-d0a2aa` … |
| `var(--cruor-color-text)` | 11 | alias-or-derived-duplicate | `--cruor-color-hex-241711`, `--cruor-color-hex-aeb6b3`, `--cruor-color-hex-e1cbd0`, `--cruor-color-hex-f4d9df`, `--cruor-color-hex-ffccd2`, `--cruor-color-hex-ffd7dc` … |
| `rgba(245, 232, 203, 0.96)` | 9 | literal-duplicate | `--cruor-color-r10-g4-b6-a960`, `--cruor-color-r14-g5-b8-a960`, `--cruor-color-r28-g18-b21-a960`, `--cruor-color-r28-g5-b9-a960`, `--cruor-color-r4-g3-b4-a960`, `--cruor-color-r5-g4-b5-a960` … |
| `0` | 8 | literal-duplicate | `--brief-progress`, `--cruor-composer-rail-scroll-padding-inline-end`, `--cruor-composer-stage-min`, `--cruor-radius-none`, `--cruor-z-base`, `--diamond-fill` … |
| `rgba(245, 232, 203, 0.9)` | 8 | literal-duplicate | `--cruor-color-r10-g5-b7-a900`, `--cruor-color-r12-g6-b8-a900`, `--cruor-color-r18-g1-b5-a900`, `--cruor-color-r20-g5-b8-a900`, `--cruor-color-r28-g5-b9-a900`, `--cruor-color-r5-g4-b5-a900` … |
| `var(--cruor-accent-bright)` | 8 | alias-or-derived-duplicate | `--cruor-color-hex-5b1418`, `--cruor-color-hex-84232b`, `--cruor-color-hex-9a3b36`, `--cruor-color-hex-9d626a`, `--cruor-color-hex-b33b4e`, `--cruor-color-hex-be4052` … |
| `10px` | 7 | literal-duplicate | `--component-stage-drawer-gap`, `--cruor-composer-fact-row-gap`, `--cruor-composer-info-rail-gap`, `--cruor-composer-rail-card-gap`, `--cruor-control-padding-x-sm`, `--location-component-drawer-gap` … |
| `rgba(245, 232, 203, 0.92)` | 7 | literal-duplicate | `--cruor-color-r10-g5-b7-a920`, `--cruor-color-r12-g16-b15-a920`, `--cruor-color-r12-g9-b10-a920`, `--cruor-color-r18-g1-b5-a920`, `--cruor-color-r22-g6-b9-a920`, `--cruor-color-r30-g7-b11-a920` … |
| `12px` | 6 | literal-duplicate | `--anatomy-card-gap`, `--cruor-composer-rail-card-hero-padding-block`, `--cruor-composer-rail-gap`, `--cruor-space-md`, `--location-card-gap`, `--text-size-l-base` |
| `rgba(245, 232, 203, 0.88)` | 6 | literal-duplicate | `--cruor-color-r10-g5-b7-a880`, `--cruor-color-r11-g8-b10-a880`, `--cruor-color-r18-g7-b9-a880`, `--cruor-color-r30-g7-b11-a880`, `--cruor-color-r7-g5-b6-a880`, `--cruor-color-r8-g5-b6-a880` |
| `rgba(245, 232, 203, 0.98)` | 6 | literal-duplicate | `--cruor-color-r10-g5-b7-a980`, `--cruor-color-r12-g9-b10-a980`, `--cruor-color-r13-g10-b12-a980`, `--cruor-color-r6-g5-b6-a980`, `--cruor-color-r7-g5-b6-a980`, `--cruor-color-r8-g5-b6-a980` |
| `var(--cruor-gradient-parchment-accent)` | 6 | alias-or-derived-duplicate | `--cruor-gradient-radial-218-978d4e82`, `--cruor-gradient-radial-221-c916ee33`, `--cruor-gradient-radial-225-870fca15`, `--cruor-gradient-radial-226-47db204b`, `--cruor-gradient-radial-230-4b421825`, `--cruor-gradient-radial-231-78348717` |
| `0px` | 5 | literal-duplicate | `--app-shell-bar-height`, `--component-navigator-smart-min`, `--darken-workspace-topbar-height`, `--stage-left-width`, `--stage-right-width` |
| `var(--cruor-color-blood-glow-a420)` | 5 | alias-or-derived-duplicate | `--cruor-composer-card-border-color-active`, `--cruor-composer-compatibility-soft-border`, `--cruor-composer-slot-border-color-active`, `--cruor-ui-card-border-color-active`, `--inspirations-line-strong` |
| `var(--cruor-color-faint)` | 5 | alias-or-derived-duplicate | `--cruor-color-hex-5e4537`, `--cruor-color-hex-826b58`, `--cruor-color-hex-8f7278`, `--cruor-text-faint`, `--cruor-theme-faint` |
| `var(--cruor-gradient-parchment-flat)` | 5 | alias-or-derived-duplicate | `--cruor-gradient-linear-057-7894e977`, `--cruor-gradient-linear-103-4f46f041`, `--cruor-gradient-linear-163-3f5e7ee3`, `--cruor-gradient-linear-191-64ae9c1c`, `--cruor-gradient-linear-199-c2b7262f` |
| `var(--cruor-workspace-max, 1540px)` | 5 | alias-or-derived-duplicate | `--cruor-composer-workspace-max`, `--darken-workspace-max`, `--inspirations-workspace-max`, `--monster-crucible-workspace-max`, `--monster-workspace-max` |
| `126, 63, 45` | 4 | literal-duplicate | `--cruor-rgb-glass-line`, `--cruor-rgb-line-strong`, `--cruor-rgb-parchment-border`, `--cruor-rgb-rose` |
| `245, 232, 203` | 4 | literal-duplicate | `--cruor-rgb-glass-satin`, `--cruor-rgb-ink`, `--cruor-rgb-ink-raised`, `--cruor-rgb-parchment-panel-2` |
| `32px` | 4 | literal-duplicate | `--cruor-control-height-xs`, `--cruor-space-2xl`, `--flow-step-size`, `--location-flow-step-size` |
| `8px` | 4 | literal-duplicate | `--cruor-space-sm`, `--engine-arrow-inset`, `--engine-arrow-size`, `--text-size-xxs-base` |
| `minmax(0, 1fr)` | 4 | literal-duplicate | `--cruor-composer-frame-center-column-width`, `--guided-flow-stage-btn-width`, `--location-flow-stage-btn-width`, `--studio-component-list-column` |
| `rgba(245, 232, 203, 0.94)` | 4 | literal-duplicate | `--cruor-color-r10-g12-b12-a940`, `--cruor-color-r12-g7-b9-a940`, `--cruor-color-r30-g7-b11-a940`, `--cruor-color-r7-g5-b6-a940` |
| `var(--cruor-color-hex-d0a2aa)` | 4 | alias-or-derived-duplicate | `--cruor-composer-compatibility-soft-text`, `--cruor-composer-rail-hero-subtitle-color`, `--home-accent-pale`, `--inspirations-chip` |
| `var(--cruor-color-hex-fff0f2)` | 4 | alias-or-derived-duplicate | `--cruor-composer-control-text-active`, `--cruor-composer-fact-value-color`, `--cruor-composer-rail-hero-title-color`, `--cruor-ui-control-text-active` |
| `var(--cruor-color-white)` | 4 | alias-or-derived-duplicate | `--cruor-text-inverse`, `--line-strong`, `--muted`, `--text` |
| `var(--cruor-surface-panel)` | 4 | alias-or-derived-duplicate | `--cruor-color-hex-070506`, `--cruor-color-hex-09090a`, `--cruor-color-hex-1d050a`, `--studio-panel` |
| `0 0 0 1px var(--cruor-color-blood-glow-a110), 0 0 24px var(--cruor-color-blood-bright-a220), 0 12px 28px var(--cruor-color-black-a340)` | 3 | alias-or-derived-duplicate | `--location-room-node-ready-shadow`, `--location-slot-filled-shadow`, `--monster-anatomy-filled-shadow` |
| `0 10px 24px var(--cruor-color-black-a280)` | 3 | alias-or-derived-duplicate | `--location-room-node-empty-shadow`, `--location-slot-empty-shadow`, `--monster-anatomy-empty-shadow` |
| `0%` | 3 | literal-duplicate | `--hero-pan-x`, `--hero-pan-y`, `--workbench-progress` |
| `14px` | 3 | literal-duplicate | `--inspirations-page-pad-y`, `--text-size-2xl-base`, `--workbench-handle-width` |
| `16px` | 3 | literal-duplicate | `--cruor-control-padding-x-lg`, `--cruor-space-lg`, `--text-size-4xl-base` |
| `239, 221, 184` | 3 | literal-duplicate | `--cruor-rgb-glass-satin-strong`, `--cruor-rgb-ink-muted`, `--cruor-rgb-parchment-panel-3` |

Duplicate literals are candidate primitives. Duplicate aliases can be intentional semantic names and should not be collapsed merely because their current resolved value is equal.

## Page-prefixed variables describing generic visual concepts

| Token | Current role | Evidence | Future review target |
| --- | --- | --- | --- |
| `--home-accent` | page-specific-visual-token | `app/home-page.css:13` | verify-runtime-and-test-consumers-before-deprecation |
| `--home-accent-pale` | page-specific-visual-token | `app/home-page.css:14` | retain-as-compatibility-alias-until-consumers-migrate |
| `--home-line` | page-specific-visual-token | `app/home-page.css:11` | retain-as-compatibility-alias-until-consumers-migrate |
| `--home-line-strong` | page-specific-visual-token | `app/home-page.css:12` | retain-as-compatibility-alias-until-consumers-migrate |
| `--inspirations-accent` | page-specific-visual-token | `features/inspirations/inspirations.styles.css:31` | verify-runtime-and-test-consumers-before-deprecation |
| `--inspirations-accent-hot` | page-specific-visual-token | `features/inspirations/inspirations.styles.css:32` | verify-runtime-and-test-consumers-before-deprecation |
| `--inspirations-bg` | page-specific-visual-token | `features/inspirations/inspirations.styles.css:26` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--inspirations-line` | page-specific-visual-token | `features/inspirations/inspirations.styles.css:29` | retain-as-compatibility-alias-until-consumers-migrate |
| `--inspirations-line-strong` | page-specific-visual-token | `features/inspirations/inspirations.styles.css:30` | verify-runtime-and-test-consumers-before-deprecation |
| `--inspirations-muted` | page-specific-visual-token | `features/inspirations/inspirations.styles.css:34` | verify-runtime-and-test-consumers-before-deprecation |
| `--inspirations-surface` | page-specific-visual-token | `features/inspirations/inspirations.styles.css:27` | verify-runtime-and-test-consumers-before-deprecation |
| `--inspirations-surface-soft` | page-specific-visual-token | `features/inspirations/inspirations.styles.css:28` | retain-as-compatibility-alias-until-consumers-migrate |
| `--inspirations-text` | page-specific-visual-token | `features/inspirations/inspirations.styles.css:33` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--location-flow-line-y` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:5334`, `features/darken-location/composer/darken-location-composer.styles.css:5471` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--location-map-stage-grid-line` | layout-token | `features/darken-location/composer/darken-location-composer.styles.css:3101` | retain-as-compatibility-alias-until-consumers-migrate |
| `--location-room-node-empty-bg` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6630` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--location-room-node-empty-border` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6629` | retain-as-compatibility-alias-until-consumers-migrate |
| `--location-room-node-empty-color` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6631` | retain-as-compatibility-alias-until-consumers-migrate |
| `--location-room-node-empty-shadow` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6632` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--location-room-node-partial-bg` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6634` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--location-room-node-partial-border` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6633` | retain-as-compatibility-alias-until-consumers-migrate |
| `--location-room-node-partial-color` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6635` | retain-as-compatibility-alias-until-consumers-migrate |
| `--location-room-node-partial-shadow` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6636` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--location-room-node-ready-bg` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6638` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--location-room-node-ready-border` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6637` | retain-as-compatibility-alias-until-consumers-migrate |
| `--location-room-node-ready-color` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6639` | retain-as-compatibility-alias-until-consumers-migrate |
| `--location-room-node-ready-shadow` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6640` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--location-slot-empty-bg` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6642` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--location-slot-empty-border` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6641` | retain-as-compatibility-alias-until-consumers-migrate |
| `--location-slot-empty-color` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6643` | retain-as-compatibility-alias-until-consumers-migrate |
| `--location-slot-empty-shadow` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6644` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--location-slot-filled-bg` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6646` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--location-slot-filled-border` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6645` | retain-as-compatibility-alias-until-consumers-migrate |
| `--location-slot-filled-color` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6647` | retain-as-compatibility-alias-until-consumers-migrate |
| `--location-slot-filled-shadow` | page-specific-visual-token | `features/darken-location/composer/darken-location-composer.styles.css:6648` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--monster-anatomy-empty-bg` | page-specific-visual-token | `features/monster-composer/monster-composer.styles.css:10852` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--monster-anatomy-empty-border` | page-specific-visual-token | `features/monster-composer/monster-composer.styles.css:10851` | retain-as-compatibility-alias-until-consumers-migrate |
| `--monster-anatomy-empty-color` | page-specific-visual-token | `features/monster-composer/monster-composer.styles.css:10853` | retain-as-compatibility-alias-until-consumers-migrate |
| `--monster-anatomy-empty-shadow` | page-specific-visual-token | `features/monster-composer/monster-composer.styles.css:10854` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--monster-anatomy-filled-bg` | page-specific-visual-token | `features/monster-composer/monster-composer.styles.css:10856` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--monster-anatomy-filled-border` | page-specific-visual-token | `features/monster-composer/monster-composer.styles.css:10855` | retain-as-compatibility-alias-until-consumers-migrate |
| `--monster-anatomy-filled-color` | page-specific-visual-token | `features/monster-composer/monster-composer.styles.css:10857` | retain-as-compatibility-alias-until-consumers-migrate |
| `--monster-anatomy-filled-shadow` | page-specific-visual-token | `features/monster-composer/monster-composer.styles.css:10858` | compare-with-shared-semantic-or-component-token-before-keeping-local |
| `--monster-card-bg-active` | page-specific-visual-token | `features/crucible/crucible.styles-old.css:4408`, `features/monster-composer/monster-composer.styles.css:4223` | verify-runtime-and-test-consumers-before-deprecation |
| `--monster-card-bg-soft` | page-specific-visual-token | `features/crucible/crucible.styles-old.css:4407`, `features/monster-composer/monster-composer.styles.css:4222` | retain-as-compatibility-alias-until-consumers-migrate |

These are strong comparison candidates for shared colors, surfaces, borders, status tones, or component tokens. Variables describing rail width, grid geometry, map masks, room nodes, anatomy measurements, or stage mechanics are different: their names encode feature behavior/layout and they should remain local unless another route proves the same contract.

## Raw visual values outside current canonical token files

| Category | Groups | Occurrences |
| --- | --- | --- |
| border | 182 | 1121 |
| color | 386 | 1139 |
| effect | 28 | 116 |
| font-family | 3 | 12 |
| font-size | 68 | 146 |
| gradient | 71 | 80 |
| line-height | 41 | 680 |
| motion-duration | 48 | 660 |
| motion-easing | 6 | 625 |
| opacity | 42 | 410 |
| radius | 6 | 80 |
| scrollbar | 6 | 92 |
| shadow | 71 | 251 |
| sizing | 197 | 2842 |
| spacing | 151 | 4588 |
| z-index | 51 | 414 |

### Most repeated raw values

| Category | Value | Uses | Files | Disposition | Evidence |
| --- | --- | --- | --- | --- | --- |
| spacing | `0` | 868 | 16 | structural-or-mathematical-value | `app/app-shell.css:13`, `app/app-shell.css:30` |
| sizing | `0` | 786 | 16 | structural-or-mathematical-value | `app/app-shell.css:18`, `app/app-shell.css:53` |
| motion-easing | `ease` | 597 | 12 | likely-design-token | `app/app-shell.css:152`, `app/app-shell.css:152` |
| spacing | `10px` | 468 | 16 | candidate-layout-or-sizing-token | `app/app-shell.css:124`, `app/app-shell.css:208` |
| spacing | `8px` | 453 | 15 | candidate-layout-or-sizing-token | `app/app-shell.css:268`, `app/app-shell.css:1065` |
| motion-duration | `0.12s` | 369 | 9 | likely-design-token | `app/app-shell.css:277`, `app/app-shell.css:277` |
| spacing | `7px` | 286 | 15 | candidate-layout-or-sizing-token | `app/app-shell.css:420`, `app/app-shell.css:432` |
| spacing | `12px` | 262 | 12 | candidate-layout-or-sizing-token | `app/app-shell.css:44`, `app/app-shell.css:224` |
| border | `0` | 254 | 13 | structural-or-mathematical-value | `app/app-shell.css:79`, `app/app-shell.css:142` |
| spacing | `6px` | 247 | 15 | candidate-layout-or-sizing-token | `app/app-shell.css:879`, `app/home-page-video.css:75` |
| line-height | `1` | 234 | 15 | likely-design-token | `app/app-shell.css:67`, `app/app-shell.css:370` |
| spacing | `5px` | 190 | 14 | candidate-layout-or-sizing-token | `app/app-shell.css:1185`, `app/app-shell.css:1362` |
| spacing | `9px` | 177 | 14 | candidate-layout-or-sizing-token | `app/app-shell.css:1462`, `app/app-shell.css:1517` |
| opacity | `1` | 175 | 11 | likely-design-token | `app/app-shell.css:765`, `app/app-shell.css:1029` |
| spacing | `14px` | 149 | 9 | candidate-layout-or-sizing-token | `app/app-shell.css:411`, `app/app-shell.css:466` |
| shadow | `none` | 149 | 11 | likely-design-token | `app/app-shell.css:137`, `app/app-shell.css:151` |
| sizing | `24px` | 124 | 13 | candidate-layout-or-sizing-token | `app/app-shell.css:1154`, `app/home-page.css:3213` |
| spacing | `4px` | 121 | 10 | candidate-layout-or-sizing-token | `app/app-shell.css:723`, `app/home-page.css:312` |
| spacing | `16px` | 118 | 13 | candidate-layout-or-sizing-token | `app/app-shell.css:19`, `app/app-shell.css:124` |
| sizing | `32px` | 117 | 11 | candidate-layout-or-sizing-token | `app/app-shell.css:141`, `app/app-shell.css:1050` |
| sizing | `34px` | 111 | 11 | candidate-layout-or-sizing-token | `app/app-shell.css:1146`, `app/app-shell.css:1191` |
| spacing | `2px` | 109 | 10 | candidate-layout-or-sizing-token | `app/app-shell.css:133`, `app/app-shell.css:1190` |
| spacing | `18px` | 103 | 12 | candidate-layout-or-sizing-token | `app/app-shell.css:198`, `app/app-shell.css:204` |
| z-index | `1` | 97 | 10 | likely-design-token | `app/app-shell.css:40`, `app/app-shell.css:734` |
| motion-duration | `0.14s` | 90 | 7 | likely-design-token | `app/app-shell.css:152`, `app/app-shell.css:152` |
| color | `transparent` | 84 | 8 | likely-design-token | `app/home-page.css:134`, `app/home-page.css:135` |
| opacity | `0` | 82 | 11 | likely-design-token | `app/home-page.css:252`, `app/home-page.css:324` |
| spacing | `11px` | 82 | 12 | candidate-layout-or-sizing-token | `app/app-shell.css:52`, `app/app-shell.css:1055` |
| sizing | `28px` | 82 | 9 | candidate-layout-or-sizing-token | `app/app-shell.css:1854`, `app/app-shell.css:1858` |
| sizing | `16px` | 76 | 9 | candidate-layout-or-sizing-token | `app/app-shell.css:1002`, `app/app-shell.css:1955` |
| spacing | `3px` | 76 | 14 | candidate-layout-or-sizing-token | `app/home-page.css:2673`, `features/crucible/crucible.styles-old.css:210` |
| radius | `0` | 74 | 13 | likely-design-token | `app/app-shell.css:143`, `app/app-shell.css:271` |
| effect | `none` | 71 | 8 | likely-design-token | `app/app-shell.css:23`, `app/home-page.css:371` |
| z-index | `2` | 66 | 10 | likely-design-token | `app/app-shell.css:854`, `app/app-shell.css:1270` |
| line-height | `1.35` | 62 | 13 | likely-design-token | `app/app-shell.css:1381`, `app/home-page-video.css:52` |
| sizing | `100vw` | 61 | 9 | structural-or-mathematical-value | `app/app-shell.css:1154`, `app/app-shell.css:1256` |
| sizing | `38px` | 61 | 7 | candidate-layout-or-sizing-token | `app/app-shell.css:75`, `app/app-shell.css:76` |
| sizing | `42px` | 59 | 11 | candidate-layout-or-sizing-token | `app/app-shell.css:1518`, `app/app-shell.css:1718` |
| sizing | `36px` | 58 | 9 | candidate-layout-or-sizing-token | `app/app-shell.css:351`, `app/app-shell.css:598` |
| sizing | `30px` | 55 | 8 | candidate-layout-or-sizing-token | `app/home-page.css:2496`, `app/home-page.css:2805` |
| z-index | `0` | 54 | 11 | likely-design-token | `app/app-shell.css:31`, `app/app-shell.css:757` |
| color | `#fff0f2` | 53 | 3 | likely-design-token | `dev/create-a-monster-mvp.jsx:6698`, `dev/create-a-monster-mvp.jsx:6771` |
| border | `1px solid var(--cruor-color-milk-a075)` | 51 | 9 | structural-or-mathematical-value | `app/app-shell.css:1304`, `app/app-shell.css:1519` |
| color | `#1d1915` | 48 | 2 | likely-design-token | `features/darken-location/map-generator/map-generator.render.jsx:201`, `features/darken-location/map-generator/map-generator.render.jsx:201` |
| sizing | `40px` | 47 | 8 | candidate-layout-or-sizing-token | `app/home-page.css:3718`, `features/crucible/crucible.styles-old.css:76` |
| line-height | `1.1` | 46 | 8 | likely-design-token | `app/home-page.css:2784`, `app/home-page.css:2835` |
| spacing | `13px` | 46 | 8 | candidate-layout-or-sizing-token | `app/app-shell.css:146`, `app/app-shell.css:1896` |
| sizing | `18px` | 46 | 8 | candidate-layout-or-sizing-token | `app/app-shell.css:1495`, `app/home-page.css:262` |
| motion-duration | `0.16s` | 44 | 4 | likely-design-token | `app/home-page.css:198`, `app/home-page.css:198` |
| scrollbar | `thin` | 43 | 7 | likely-design-token | `features/crucible/crucible.styles-old.css:5635`, `features/crucible/crucible.styles-old.css:6924` |
| sizing | `6px` | 42 | 8 | candidate-layout-or-sizing-token | `app/navigation/site-mega-menu.css:126`, `app/navigation/site-mega-menu.css:127` |
| scrollbar | `auto` | 40 | 4 | likely-design-token | `features/crucible/crucible.styles-old.css:4002`, `features/crucible/crucible.styles-old.css:4003` |
| border | `1px solid var(--cruor-color-milk-a070)` | 39 | 6 | structural-or-mathematical-value | `features/crucible/crucible.styles-old.css:1850`, `features/crucible/crucible.styles-old.css:3437` |
| sizing | `12px` | 38 | 9 | candidate-layout-or-sizing-token | `app/app-shell.css:1692`, `app/home-page.css:296` |
| border | `1px solid var(--cruor-color-blood-strong-a560)` | 38 | 5 | structural-or-mathematical-value | `features/crucible/crucible.styles-old.css:5219`, `features/crucible/crucible.styles-old.css:5275` |
| color | `#d0a2aa` | 37 | 2 | likely-design-token | `dev/create-a-monster-mvp.jsx:6647`, `dev/create-a-monster-mvp.jsx:6887` |
| line-height | `1.45` | 36 | 6 | likely-design-token | `app/home-page.css:854`, `app/home-page.css:2517` |
| sizing | `10px` | 36 | 5 | candidate-layout-or-sizing-token | `app/app-shell.css:1271`, `app/app-shell.css:1272` |
| sizing | `13px` | 36 | 5 | candidate-layout-or-sizing-token | `features/crucible/crucible.styles-old.css:425`, `features/crucible/crucible.styles-old.css:426` |
| sizing | `14px` | 36 | 6 | candidate-layout-or-sizing-token | `features/crucible/crucible.styles-old.css:1260`, `features/crucible/crucible.styles-old.css:1261` |

Interpretation boundaries:

- Repeated colors, gradients, shadows, radii, opacity, type sizes, motion, effects, and z-index values are likely token candidates.
- Spacing and sizing require semantic review. Percentages, viewport units, zeroes, `calc()`/`clamp()`, grid tracks, and geometry-derived dimensions are often structural or mathematical rather than design tokens.
- Map-generator geometry, room/corridor dimensions, anatomy placement, SVG coordinates, canvas behavior, and export-rendering values may legitimately remain feature-local even when repeated.
- Studio rail widths and transitions, Dark Places grid/rail mechanics, Monster anatomy/stage dimensions, and Home workbench/carousel math are migration boundaries, not automatic global-token candidates.
- One-off values remain review items. Their uniqueness alone neither justifies a global token nor proves dead code.

## Import and documentation drift relevant to token work

- The repository-map narrative baseline names branch `main` at commit `2155e52…`, while this audit runs at `be61f98fd2537d367c757bf9796b11735bc7d193` on `refactor/sitewide-design-system`; generated-map freshness must be validated independently after all audit documentation is assembled.
- `docs/ARCHITECTURE.md` still describes a `src/app`, `src/shared`, and `src/features` layout, while the current tracked implementation uses root-level `app/`, `shared/`, and `features/`.
- `docs/repository-map/routes-and-navigation.md` diagrams a `CruciblePage.jsx`; no such tracked file exists. Current Crucible workspace composition is inline in `app/router.jsx` with `CrucibleTopbar.jsx` and the Darken/Monster pages.
- The claim that global CSS precedes feature CSS should be treated as an intended boundary, not assumed final cascade fact: `app/main.jsx` imports `AppRouter` before its direct CSS imports, and feature modules also import styles transitively. The CSS inventory records confirmed edges and a medium-confidence source-graph encounter order; the built Vite CSS remains the final order check.

## Migration boundary recommendation

Partition by responsibility before renaming consumers: primitives (color/type/spacing/sizing/motion/z), semantic aliases, shared component tokens, and feature layout/domain tokens. Preserve compatibility aliases and current import order while each family moves. Verify visual neutrality route-by-route, then consider cascade layers in a separate guarded phase; none of the tracked stylesheets currently proves a layer-based cascade contract unless `css-inventory.json` reports otherwise.
