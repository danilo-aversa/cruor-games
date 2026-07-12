# Shared Class Decision Tree

Search the [component catalog](component-catalog.md) before creating a visual component class.

## Dropdown branch

Does the new component open a popup containing selectable items or actions?

```text
No
└─ Continue through the normal component decision process.

Yes
├─ Is it a list of mutually selectable values?
│  Use:
│  - cruor-dropdown-trigger
│  - cruor-dropdown-menu
│  - cruor-dropdown-menu--listbox
│  - cruor-dropdown-option
│
├─ Is it an action context menu?
│  Use:
│  - cruor-dropdown-menu
│  - cruor-dropdown-menu--context
│  - cruor-dropdown-option
│
├─ Does it open a nested flyout?
│  Add:
│  - cruor-dropdown-menu--submenu
│  - cruor-dropdown-option__chevron
│
└─ Does the feature need unique positioning or geometry?
   Add one feature-specific class for layout or behavior only.
   Do not recreate the visual style.
```

## Mandatory rules

1. Search the component catalog before creating any dropdown class.
2. Use `.cruor-dropdown-*` classes for every equivalent new dropdown, listbox, context menu, option row, or submenu.
3. Do not create parallel visual classes such as `.monster-dropdown-style`, `.location-choice-popup-surface`, or `.page-menu-option` when the shared system covers the component.
4. A feature class is acceptable only for layout, positioning, anchoring, scroll ownership, behavior, or runtime/test selectors.
5. Create a shared modifier only when the difference is reusable, is not feature identity, cannot be represented by the existing API, and is documented in the component catalog.

Positive:

```html
<button class="monster-frame-select-trigger cruor-dropdown-trigger"></button>
```

The legacy class remains a feature hook while the shared class owns the visual implementation.

Negative:

```css
.monster-frame-select-trigger {
  background: /* feature-specific surface */;
  border: /* feature-specific border */;
  box-shadow: /* feature-specific shadow */;
}
```

Do not let a retained legacy class independently own generic dropdown visuals.

## Composer right information rail branch

Does the new page need a right-side rail summarizing the current generated or configured entity?

- No: continue through the normal component decision process.
- Yes: use `.cruor-composer-rail`, `--right`, `--info`, `.cruor-composer-rail-card`, `.cruor-composer-fact-grid`, `.cruor-composer-fact-row`, and `.cruor-composer-meter`; add `--scroll` and `.cruor-scroll-surface` to the actual scroll owner.

Do not create a new feature-specific visual sidebar implementation. A feature hook may supplement the shared system only for placement, layout, required geometry, scroll ownership, behavior, and runtime/test selectors. Any reusable missing element belongs in the shared API and must be added to the [component catalog](component-catalog.md#composer-right-information-rails).
