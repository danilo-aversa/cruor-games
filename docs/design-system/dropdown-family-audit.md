# Dropdown family audit

## Canonical implementation

The visual reference is `RoomStyleContextMenu` in `features/darken-location/map-generator/map-generator.page.jsx`, with reusable rows and flyouts produced by `RoomStyleMenuOption` and `RoomStyleMenuSection`. The root is portaled to `document.body` by `ContextMenuPortal` and positioned by `resolveContextMenuViewportLayout` from `map-generator.context-menu-position.js`.

The root contains Type, Shape, Size, Level, and Modifiers flyouts. Shape contains the nested Building and Cavern shape-group flyouts. Reset to Content and Close are terminal rows; Reset does not open another level.

## Original selector provenance

| Selector/source | Contribution |
| --- | --- |
| `*`, `button` in `shared/styles/theme.css` | border-box sizing, inherited button font, zero-border/cursor fallback |
| `.cruor-ui-panel-surface` in `shared/styles/components.css` | generic panel border, background image/color, inset/top border, shadow; overridden by the later canonical menu surface |
| `.location-map-toolbar__style-panel` in `map-generator.styles.css` | panel positioning, grid, width/height, padding, scroll ownership, border, dark surface, shadow, backdrop filter and selection behavior |
| `.location-map-toolbar__style-section` | relative flyout anchor, grid grouping and overflow bridge ownership |
| `.location-map-toolbar__style-section-title` and descendants | 30px submenu row, flex alignment, typography, leading icon, trailing value and chevron |
| `.location-map-toolbar__style-subtitle` | uppercase 0.58rem section captions and metadata |
| `.location-map-toolbar__style-options` | four-pixel option stack; compact two-column variation where applicable |
| `.location-map-toolbar__style-option` and state selectors | three-column row, 30px minimum height, icon/label typography, hover/focus/active surface and disabled treatment |
| root/flyout `[data-style-menu]` rules | aligned 210px root/flyout widths, overflow containment, flyout offset, 24000/24001 stacking and hover/focus visibility |
| `[data-style-floating="portal"]` and `::before` | fixed portal root, transparent ancestor, isolated glass pseudo-element, 18px blur/saturation and canonical shadow |
| `[data-flyout-side="left"|"right"]` | collision-selected opening direction and pointer corridor side |
| `.room-style-context-menu*` | isolation, header hierarchy, requirements metadata, explicit submenu-open state, nested Shape overflow/z-index and disabled descendant colors |
| max-width 760px rules | 210px viewport-bounded panels and downward mobile flyouts; Shape flyout receives bounded internal scrolling |
| strong-focus and reduced-motion selectors in `shared/styles/accessibility.css` | user-selected forced focus ring and reduced transition duration |

The shared extraction is `shared/styles/dropdowns.css`. It is imported from `app/main.jsx` after `buttons.css` and before feature styles. Migrated feature visual selectors are retained only as guarded compatibility fallbacks; geometry, portal placement and runtime selectors remain feature-owned.

## Variables and exact authored values

The canonical system consumes `--cruor-color-blood-strong-a320`, `--cruor-color-blood-strong-a640`, `--cruor-color-blood-glow-a780`, `--cruor-color-blood-a100`, `--cruor-color-hex-c8a2a8`, `--cruor-color-hex-b33b4e`, `--cruor-color-hex-f0b9c2`, `--cruor-color-hex-fff0f2`, `--cruor-color-text-a540`, `--cruor-color-black-a760`, `--cruor-color-blood-bright-a520`, `--cruor-gradient-radial-001-2127711c`, and `--cruor-shadow-box-075`. The glass layers retain their authored rgba gradients and 18px/128% backdrop filter rather than introducing new tokens.

## Shared states

- Triggers: default, hover, focus-visible and `[aria-expanded="true"]`.
- Rows: hover, focus-visible, `.is-active`, `.is-selected`, `[aria-selected="true"]`, and `[aria-checked="true"]`.
- Disabled rows: `:disabled`, `.is-disabled`, and `[aria-disabled="true"]`, including canonical non-highlighted hover/focus behavior.
- Submenus: normal hidden geometry remains feature-owned; hover, focus-within and explicit `.is-submenu-open` behavior remain unchanged.
- Portal behavior: fixed/absolute inline placement, collision resolution, `data-flyout-side`, outside-click dismissal, Escape dismissal and current focus behavior are unchanged.

## Confirmed migrated families

- Dark Places room style context menu: root, header, requirements, all five first-level flyouts, nested Shape group flyouts, section triggers, options and terminal actions.
- Dark Places Map Style and Level View menus, which already use the same panel/section/option implementation.
- Dark Places custom choice trigger, portaled listbox and options.
- Terrifying Monsters frame select trigger, portaled listbox and options.

## Excluded and ambiguous candidates

- Site topbar and mega menu: navigation-specific hierarchy and surface.
- Crucible dropdowns/context menus: legacy DOM/runtime engine and distinct styling.
- Inspirations custom controls: materially different selection and layout language.
- Map entity action context menus (`room-context-menu`, corridor/access/stair actions): compact action-menu system with different structure; retained as an explicit exclusion.
- Monster navigator/component menus and Dark Places room-target menu: workflow/menu-row controls rather than the canonical selection family.
- Native `select`, autocomplete, modal, tooltip, square-icon, card and ordinary action controls: outside scope.

## Legacy hooks retained

`location-map-toolbar__style-*`, `room-style-context-menu*`, `monster-frame-select-*`, `location-choice-*`, and `cruor-frame-select-*` remain for geometry, placement, portal transforms, scroll ownership, event anchoring, runtime queries, tests and feature identity. No role, accessible state, label, option order, icon, event handler or positioning calculation changed.

