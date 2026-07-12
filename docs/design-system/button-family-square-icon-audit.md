# Square icon button family audit

## Canonical source

The canonical control is the Dark Places `Toggle Grid` button rendered by `MapToolButton` in `features/darken-location/map-generator/map-generator.page.jsx` (the component begins near line 5480). Its runtime classes before migration were `map-tool-button location-map-toolbar__button location-icon-toggle-button cruor-frame-icon-toggle location-map-toolbar__button--secondary is-active`.

The shared implementation is `.cruor-square-icon-button` in `shared/styles/buttons.css`. Reusable variations are `.cruor-square-icon-button--primary` (the existing always-emphasized Regenerate treatment) and `.cruor-square-icon-button--compact` (the existing 24px debug-recorder treatment). The shared stylesheet also preserves the pre-existing 36px surface/state variation when a migrated control is inside a non-composer `.cruor-map-workspace[data-map-context]`.

## Original selector provenance

| Source selector | Source | Contribution to the canonical runtime button |
| --- | --- | --- |
| `*` | `shared/styles/theme.css`, Components section | `box-sizing: border-box` |
| `button` | `shared/styles/theme.css`, Components section | inherited font, zero border fallback, pointer cursor |
| `.cruor-map-workspace .map-tool-button` and its state selectors | `features/darken-location/map-generator/map-generator.styles.css`, Map tools/States | 36px fallback geometry, border radius, base surface, cursor, 0.16s transition, active/focus/hover surface, disabled opacity/cursor; later Dark Places selectors replaced these values on the canonical combined-class button |
| `.location-icon-toggle-button` and descendant/state selectors | `features/darken-location/composer/darken-location-composer.styles.css`, location icon toggles | grid alignment, minimum height/padding fallback, base border/surface/color, 0.12s transition, icon color/size, hover/focus/active surface and outline |
| `.location-composer .cruor-map-workspace[data-map-context="composer-workspace"] .map-tool-button` and descendant/state selectors | same file, embedded map workspace | 36px embedded-map fallback, 16px icon box/14px icon, state surface/icon color, disabled opacity `0.36`; later 38px frame/toolbar geometry wins for the canonical control |
| `.location-composer .location-icon-toggle-button.cruor-frame-icon-toggle` and descendant/state selectors | same file, frame controls | final 38px frame geometry, zero padding, exact border/surface/color/transition, hover/focus surface, selected `translateY(-1px)`, 16px icon box/14px icon, active icon color |
| `.location-map-toolbar__button` and descendant/state selectors | same file, map toolbar | relative positioning, final 38px width constraints/minimum height, exact border/surface/color, cursor/transition, icon box, hover/focus, disabled cursor/opacity |
| `.location-map-toolbar__button.is-active`, `.location-map-toolbar__button[aria-pressed="true"]` | same file, immersive toolbar states near the end | final selected border `--cruor-color-blood-glow-a860`, selected surface/color/shadow |
| mobile `.location-map-toolbar__button` | same file, narrow toolbar media rule | `flex: 0 0 38px`; retained as toolbar layout |
| `.location-map-toolbar__map-tools .map-tool-button i` | `features/darken-location/map-generator/map-generator.styles.css`, inline toolbar | `pointer-events: none`; retained as behavior |
| `html[data-a11y-text=...] :where(... button ...)` | `shared/styles/accessibility.css`, text sizing | user-selected large-text line height |
| reduced-motion universal selectors | same file, Motion | reduces transition duration without removing the declared transition |
| strong-focus `button:focus-visible` selectors | same file, Strong focus | accessibility outline/offset and theme-specific focus shadow; existing `!important` declarations retained |

No canonical-button `::before` or `::after` selector contributes. Tooltip visuals are rendered in the shared tooltip portal; the button only supplies `data-key`, `data-tooltip`, `data-tooltip-description`, and its accessible label. No feature selector set `appearance`, `filter`, or an active-only animation. Native keyboard/click behavior remains on the unchanged `button type="button"`.

## Custom properties consumed

- `--cruor-color-blood-strong-a560`
- `--cruor-gradient-linear-009-2802abdc`
- `--cruor-surface-card`
- `--cruor-color-hex-c8a2a8`
- `--cruor-color-hex-b33b4e`
- `--cruor-color-blood-glow-a780`
- `--cruor-color-blood-glow-a860`
- `--cruor-gradient-radial-001-2127711c`
- `--cruor-gradient-linear-002-09673f8e`
- `--cruor-color-hex-fff0f2`
- `--cruor-color-hex-f0b9c2`
- `--cruor-shadow-box-003`

Definitions and theme remaps remain in `shared/styles/colors.css`; no color-token refactor was performed.

## Final visual state mapping

| State | Shared selector/result |
| --- | --- |
| Default | 38px constrained width, 38px minimum height, zero padding/radius, canonical border/gradient/card surface, muted text, red 14px icon in a 16px box, no shadow |
| Hover | blood-glow `a780` border, canonical active gradients, light text, `--cruor-shadow-box-003`, pale icon |
| Focus-visible | same feature appearance as hover with `outline: none`; global strong-focus accessibility mode still supplies its existing forced outline |
| Active pointer | no separate authored `:active` appearance existed; browser button behavior is unchanged |
| Selected/pressed | `.is-active`, `[aria-pressed="true"]`, and `[aria-checked="true"]` share the canonical `a860` border, active gradients/shadow, pale icon, and `translateY(-1px)` |
| Disabled | native `:disabled`, `.is-disabled`, or `[aria-disabled="true"]` uses not-allowed cursor and canonical embedded-toolbar opacity `0.36`; native disabled behavior is unchanged |

## Migrated families

- Dark Places location frame icon-radio grids: Scale and Complexity.
- Dark Places composer toolbar actions rendered by `LocationMapToolbarButton`.
- Dark Places map toolbar actions rendered by `MapToolButton`, including zoom/view/grid/badge/name/access toggles, style/level/more-tools triggers, and the structural-tests modal close control.
- Dark Places debug recorder icon toggles, using the compact modifier.
- Monster frame radio selectors: Encounter Footprint, Role, Tier, Tempo, and Danger.

## Excluded or ambiguous families

- Legacy standalone `.map-tool-button` controls (old zoom cluster, level fade, inspector toggle) retain their established 36px map-workspace treatment because they do not carry the canonical combined toolbar/frame structure.
- Site shell, Home, Crucible, Inspiration Studio, Inspirations, composer navigator, slot/component controls, modal close families, help buttons, scratch-room controls, and menu-row actions were excluded: their sizes, shapes, layout, or interaction language are intentionally different.
- Rectangular text actions, map menu rows, navigation links, card Add/Replace actions, circular controls, and destructive text actions were excluded by definition.

## Legacy classes retained

`map-tool-button`, `location-map-toolbar__button`, `location-icon-toggle-button`, `cruor-frame-icon-toggle`, their toolbar variant/trigger classes, `map-debug-recorder__icon-toggle`, and `monster-frame-icon-toggle` remain for layout, responsive rules, feature identity, tests, tooltip anchoring, and compatibility. Their old visual rules are guarded with `:not(.cruor-square-icon-button)` where an unmigrated legacy control still needs the old fallback.

## Files modified

- `app/main.jsx`
- `shared/styles/buttons.css`
- `features/darken-location/composer/components/LocationBriefPanel.jsx`
- `features/darken-location/composer/components/LocationMapToolbar.jsx`
- `features/darken-location/composer/components/LocationMapDetailsPanel.jsx`
- `features/darken-location/composer/darken-location-composer.styles.css`
- `features/darken-location/map-generator/map-generator.page.jsx`
- `features/darken-location/map-generator/map-generator.styles.css`
- `features/monster-composer/components/monster-composer.anatomy.jsx`
- `features/monster-composer/monster-composer.styles.css`
- `docs/design-system/button-family-square-icon-audit.md`
- `docs/design-system/button-family-square-icon-migration.json`
