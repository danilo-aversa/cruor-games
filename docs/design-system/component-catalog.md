# Component Catalog

## Dropdowns, Listboxes and Context Menus

### Purpose

Use this family for custom dropdown triggers, listboxes, context menus, popup selection menus, nested submenu flyouts, menu option rows, and dropdown headers or metadata. It provides one site-wide visual language without replacing each feature’s semantics or popup behavior.

### Canonical source

The Dark Places room style context menu and its flyouts are the visual source of truth.

- Implementation: `shared/styles/dropdowns.css`
- Provenance and state audit: [dropdown-family-audit.md](dropdown-family-audit.md)
- Migrated families and exclusions: [dropdown-family-migration.json](dropdown-family-migration.json)

### Class API

#### Trigger

- `.cruor-dropdown-trigger` — base trigger surface and interaction styling.
- `.cruor-dropdown-trigger__icon` — leading trigger icon.
- `.cruor-dropdown-trigger__label` — primary selected value or label.
- `.cruor-dropdown-trigger__meta` — secondary metadata such as a variant count.
- `.cruor-dropdown-trigger__chevron` — open-state or direction indicator.

#### Menu panels

- `.cruor-dropdown-menu` — base popup surface, glass treatment, border, shadow, scrolling, and stacking language.
- `.cruor-dropdown-menu--context` — context-menu root treatment, including the portal-safe glass layer.
- `.cruor-dropdown-menu--listbox` — listbox density and fixed popup treatment.
- `.cruor-dropdown-menu--submenu` — nested submenu or flyout stacking treatment.

#### Header and grouping

- `.cruor-dropdown-header` — header container and divider.
- `.cruor-dropdown-header__title` — primary header title.
- `.cruor-dropdown-header__meta` — secondary header metadata.
- `.cruor-dropdown-subtitle` — section caption or contextual metadata.
- `.cruor-dropdown-section` — submenu section and flyout anchor grouping.
- `.cruor-dropdown-options` — option-row stack.

#### Options

- `.cruor-dropdown-option` — shared option or menu-item row, including hover, focus, selected, checked, and disabled states.
- `.cruor-dropdown-option__icon` — leading option icon.
- `.cruor-dropdown-option__label` — primary option label.
- `.cruor-dropdown-option__meta` — option description, count, or trailing metadata.
- `.cruor-dropdown-option__chevron` — submenu direction, check, or trailing indicator.
- `.cruor-dropdown-separator` — separator between logical option groups.

### Semantic patterns

Shared classes do not replace semantic roles or ARIA state.

#### Listbox trigger

```html
<button
  class="monster-frame-select-trigger cruor-dropdown-trigger"
  type="button"
  aria-haspopup="listbox"
  aria-expanded="false"
>
  <i class="fa-solid fa-skull cruor-dropdown-trigger__icon" aria-hidden="true"></i>
  <strong class="cruor-dropdown-trigger__label">Undead</strong>
  <small class="cruor-dropdown-trigger__meta">3 variants</small>
</button>
```

#### Listbox panel

```html
<div
  class="monster-frame-select-menu cruor-dropdown-menu cruor-dropdown-menu--listbox"
  role="listbox"
  aria-label="Monster type"
>
  <button
    class="monster-frame-select-option cruor-dropdown-option"
    type="button"
    role="option"
    aria-selected="true"
  >
    <i class="fa-solid fa-skull cruor-dropdown-option__icon" aria-hidden="true"></i>
    <span class="cruor-dropdown-option__label">Undead</span>
  </button>
</div>
```

#### Context menu

```html
<div
  class="room-style-context-menu cruor-dropdown-menu cruor-dropdown-menu--context"
  role="menu"
  aria-label="Room controls"
>
  <div class="cruor-dropdown-header" role="none">
    <strong class="cruor-dropdown-header__title">Room Name</strong>
    <span class="cruor-dropdown-header__meta">Metadata</span>
  </div>
  <div class="cruor-dropdown-options" role="none">
    <button
      class="location-map-toolbar__style-option cruor-dropdown-option"
      type="button"
      role="menuitem"
    >
      <i class="fa-solid fa-rotate-left cruor-dropdown-option__icon" aria-hidden="true"></i>
      <span class="cruor-dropdown-option__label">Reset</span>
    </button>
  </div>
</div>
```

#### Submenu trigger and flyout

```html
<button
  class="location-map-toolbar__style-section-title cruor-dropdown-option"
  type="button"
  role="menuitem"
  aria-haspopup="menu"
  aria-expanded="false"
>
  <span class="cruor-dropdown-option__label">Shape</span>
  <i class="fa-solid fa-chevron-right cruor-dropdown-option__chevron" aria-hidden="true"></i>
</button>

<div
  class="location-map-toolbar__style-panel cruor-dropdown-menu cruor-dropdown-menu--submenu"
  role="menu"
  aria-label="Shape options"
>
  <!-- menu items -->
</div>
```

### Accessibility requirements

Choose semantics for the interaction, not for styling convenience.

- A listbox trigger uses `aria-haspopup="listbox"` and maintains `aria-expanded`.
- A listbox panel uses `role="listbox"`; its items use `role="option"` and `aria-selected`.
- An action menu uses `role="menu"`; its rows use `role="menuitem"`, `role="menuitemradio"`, or `role="menuitemcheckbox"` as appropriate.
- Radio or checkbox menu items maintain `aria-checked`.
- Unavailable custom items expose native `disabled` and/or `aria-disabled` as required by their semantic pattern.
- Triggers, menus, and items require accessible names.
- Implementations must preserve appropriate keyboard navigation, Escape dismissal, focus restoration, and outside-click dismissal.

Shared CSS classes do not replace semantic ARIA roles or implement keyboard behavior.

### Portal requirements

Popup panels may render outside feature ancestry. Attach `.cruor-dropdown-menu` and its modifier directly to the portal-rendered element; do not depend on a route or feature ancestor for generic visuals.

Feature classes may still control fixed or absolute positioning, flyout direction, collision handling, pointer corridors, feature-specific z-index, and portal anchoring.

### Allowed feature-specific styling

Feature layout hooks may control:

- content-required width or minimum width;
- maximum height and scroll ownership;
- placement and anchoring;
- flyout direction and collision handling;
- responsive geometry;
- feature behavior;
- runtime and test selectors.

### Forbidden feature-specific styling

Feature CSS must not independently redefine the shared visual background, generic border or border color, border radius, generic shadow, backdrop-filter appearance, typography, icon color, canonical option-row padding, hover surface, focus ring, selected or checked state, disabled opacity, or shared transitions.

Exceptions require explicit review and documentation under the [override policy](override-policy.md).

### Excluded components

This system does not automatically include native `select`, autocomplete, navigation or mega menus, modal dialogs, tooltips, ordinary buttons, square icon buttons, card action menus with a materially different interaction pattern, or unique feature controls that are not dropdowns, listboxes, or context menus.

## Composer Right Information Rails

### Purpose and canonical source

Use this family for a right-side Composer rail that summarizes the current generated or configured entity through hero identity, editable name, metadata, fact rows, and meters. Terrifying Monsters Current Monster Frame is the canonical visual source. The shared stylesheet is `shared/styles/composer-system.css`; see [composer-info-rail-audit.md](composer-info-rail-audit.md) and [composer-info-rail-migration.json](composer-info-rail-migration.json).

### Class API

- Rail: `.cruor-composer-rail`, `.cruor-composer-rail--right`, `.cruor-composer-rail--info`, `.cruor-composer-rail--scroll`, `.cruor-scroll-surface`.
- Cards: `.cruor-composer-rail-card`, `.cruor-composer-rail-card--hero`.
- Hero: `.cruor-composer-rail-card__eyebrow`, `__name-editor`, `__name-input`, `__meta`.
- Facts: `.cruor-composer-fact-grid`, `.cruor-composer-fact-row`, `.cruor-composer-fact-label`, `.cruor-composer-fact-value`.
- Meters: `.cruor-composer-meter`, `__head`, `__label`, `__value`, `__track`, `__fill`.

```html
<aside
  class="feature-info cruor-composer-rail cruor-composer-rail--right cruor-composer-rail--info cruor-composer-rail--scroll cruor-scroll-surface"
>
  <section class="cruor-composer-rail-card cruor-composer-rail-card--hero">
    <span class="cruor-composer-rail-card__eyebrow">Current Frame</span>
    <label class="cruor-composer-rail-card__name-editor">
      <span class="sr-only">Entity name</span>
      <input class="cruor-composer-rail-card__name-input" type="text" aria-label="Entity name" />
    </label>
    <em class="cruor-composer-rail-card__meta">Type · Variant</em>
  </section>
  <section class="cruor-composer-rail-card">
    <div class="cruor-composer-fact-grid">
      <span class="cruor-composer-fact-row">
        <small class="cruor-composer-fact-label">Family</small>
        <strong class="cruor-composer-fact-value">Undead</strong>
      </span>
    </div>
  </section>
  <section class="cruor-composer-rail-card">
    <div class="cruor-composer-meter">
      <div class="cruor-composer-meter__head">
        <span class="cruor-composer-meter__label">Pressure</span>
        <span class="cruor-composer-meter__value"><strong>0 / 15</strong></span>
      </div>
      <div class="cruor-composer-meter__track">
        <div class="cruor-composer-meter__fill" style="width: 0%"></div>
      </div>
    </div>
  </section>
</aside>
```

The rail modifier is the single vertical scroll owner. Preserve responsive parent placement, editing behavior, meter calculations, tooltip semantics, ARIA labels, and conditional meter classes.

Feature hooks may control grid placement, width/min/max height required by the parent layout, responsive stage placement, overlay z-index, scroll ownership, behavior, and runtime/test identity. They must not independently redefine rail/card surfaces, borders, backgrounds, shadows, typography, shared spacing, name-editor states, fact rows, or meter visuals. Visual exceptions follow the [override policy](override-policy.md).

Excluded surfaces include left control rails, export rails, navigators, component pickers, map inspectors, debug/action-only cards, toolbars, modals, and ordinary cards.
