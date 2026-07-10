# Styles And Design System

## Scope

Styles include global CSS under `shared/styles/`, feature-specific CSS imported by app/bootstrap modules, and CSS classes embedded in React components.

## Responsibilities

- Define the Cruor visual system: dark fantasy surfaces, panels, buttons, chips, inputs, scroll surfaces, modals, menus, toolbars, and focus states.
- Provide app-wide accessibility variants through document dataset attributes.
- Style feature-specific surfaces for Darken, Map Generator, Monster Composer, Inspiration Studio, Inspirations, Home, and Crucible.

## Import Order

Global styles are imported from `app/main.jsx` before the app renders. Feature styles depend on that global baseline and may use shared class patterns such as `cruor-ui-panel-surface`, `cruor-button`, and `cruor-scroll-surface`.

## Risks

- Global selectors can affect unrelated features.
- Feature pages use many shared class names, so changing a shared surface class can have broad impact.
- Map editor and Monster Composer include dense DOM structures where selector specificity and state classes are fragile.
- UI changes should inspect both the relevant feature stylesheet and shared styles.

## Tests

Build/lint catch syntax/import issues. Visual regressions require browser inspection or Playwright screenshots when available.

