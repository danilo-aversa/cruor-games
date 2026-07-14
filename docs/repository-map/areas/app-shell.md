# App Shell

## Scope

The app shell includes `index.html`, `app/main.jsx`, `app/router.jsx`, `app/AppShell.jsx`, `app/navigation/`, `shared/accessibility/`, and `shared/tooltips/`.

## Responsibilities

- Mount the Vite React app.
- Apply global style imports and tooltip runtime setup.
- Own route parsing, history mutation, and top-level page selection.
- Pass UI mode, locale, route callbacks, and map request state into active features.
- Render global navigation/topbar and accessibility controls.
- Resolve all visible Crucible navigation and megamenu accessibility copy from the active locale dictionaries through `getSiteNavItems(locale)` and `SiteMegaMenu`.
- Coordinate the shared darkened and blurred workspace overlay while Crucible or Settings transient navigation is open, including the short closing-presence interval used to keep the Home spy-scroll beneath the fading overlay.

## State And Side Effects

`app/router.jsx` owns the highest-risk app-level state: active section, active UI mode, active locale, Crucible generator, Darken tab, map request, map request revision, Monster inspiration seed, and history state. `AppShell.jsx` owns the transient navigation overlay visibility and short closing-presence state reported by `SiteTopbar.jsx`. `shared/accessibility/accessibility.settings.js` persists settings to `localStorage` key `cruor.accessibility` and writes document dataset attributes.

## Tests

Routing and shell behavior are covered indirectly by `tests/e2e/app-smoke.spec.js` and Playwright Dark Places flows. Back/forward behavior and compatibility query parameters need manual browser checks after router changes.

## Findings

- Confirmed: routing is custom, not React Router.
- Confirmed: `app/router.jsx` is critical risk because it owns URL state and cross-feature callbacks.
- Inferred: navigation states not represented in URLs can diverge from direct deep-link expectations.

