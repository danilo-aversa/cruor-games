# Design-System Override Policy

Use shared component classes without visual overrides by default.

## Dropdown overrides

A dropdown override is permitted only when the shared component cannot represent a confirmed requirement, the requirement is not feature identity, the rule is scoped to the shared class, the reason is documented, and the override changes the smallest possible property set.

Acceptable when content requires it:

```css
/* Species descriptions require a wider listbox. */
.monster-frame-species-menu.cruor-dropdown-menu {
  min-width: 22rem;
}
```

Not acceptable:

```css
.monster-frame-species-menu {
  background: /* replacement surface */;
  border: /* replacement border */;
  color: /* replacement color */;
  box-shadow: /* replacement shadow */;
}
```

Layout, placement, anchoring, collision handling, feature-required dimensions, and scroll ownership may be feature-specific. Visual overrides to colors, borders, surfaces, shadows, typography, icons, or interaction states require explicit design-system review and a documented rationale.

## Composer information rail overrides

Feature classes may adjust placement, parent-grid geometry, content-required width or height, responsive movement, scroll ownership, and feature mechanics. They must not replace shared card surfaces, borders, shadows, hero/name typography, fact-row visuals, meter track/fill visuals, or shared spacing. Any visual exception must target the shared class, change the smallest possible property set, document the confirmed requirement, and receive explicit design-system review.
