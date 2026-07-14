# Styles And Design System

## Scope

Styles include global CSS under `shared/styles/`, feature-specific CSS imported by app/bootstrap modules, and CSS classes embedded in React components.

## Responsibilities

- Define the Cruor visual system: dark fantasy surfaces, panels, buttons, chips, inputs, scroll surfaces, modals, menus, toolbars, and focus states.
- Keep the site topbar above the shared transient-navigation overlay, and temporarily lower the Home fixed section-progress controls beneath that overlay without isolating the entire workspace.
- Provide app-wide accessibility variants through document dataset attributes.
- Provide the canonical `ComposerSlotCard` structure and `.cruor-composer-slot-card*` visual system for reusable generator assignment slots.
- Style feature-specific surfaces for Darken, Map Generator, Monster Composer, Inspiration Studio, Inspirations, Home, and Crucible.
- Keep Map Style root and flyout panels on the same sizing and button treatment by modifying the existing `location-map-toolbar__style-*` selectors rather than introducing parallel classes.
- The room right-click style menu deliberately reuses those same `location-map-toolbar__style-*` root, section, flyout, subtitle, options, and option classes. Room-specific selectors should only handle identity metadata, nested shape flyout depth, custom-size inputs, and viewport bridges.
- Apply the portaled root panel glass through its existing selector's `::before` pseudo-element; a direct ancestor `backdrop-filter` creates a Backdrop Root that prevents nested flyouts from filtering the page behind them.
- Scope Dark Places immersive-layout overrides to an active, visible `#darkenComposerPanel` containing `data-location-immersive="true"`; this prevents the hidden composer from suppressing the site topbar while another Crucible view is active.

## Import Order

Global styles are imported from `app/main.jsx` before the app renders. Feature styles depend on that global baseline and may use shared class patterns such as `cruor-ui-panel-surface`, `cruor-button`, and `cruor-scroll-surface`.

## Risks

- Global selectors can affect unrelated features.
- Feature pages use many shared class names, so changing a shared surface class can have broad impact.
- Map editor and Monster Composer include dense DOM structures where selector specificity and state classes are fragile.
- UI changes should inspect both the relevant feature stylesheet and shared styles.
- Topbar, Settings, mega-menu, overlay, and Home fixed-control changes must preserve the stacking contract documented in the component catalog.

## Tests

Build/lint catch syntax/import issues. Visual regressions require browser inspection or Playwright screenshots when available.

