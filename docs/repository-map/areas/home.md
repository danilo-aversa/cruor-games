# Home

## Scope

Home is implemented in `app/HomePage.jsx` with related styles imported through the app-level style bundle.

## Responsibilities

- Present the entry surface for the site.
- Link users into major tools and feature areas through router callbacks.
- Stay free of feature-specific generation or content logic.

## Dependencies

Home depends on app-shell navigation contracts and shared styles. It should not import map, Monster, or content registry internals directly unless a future feature explicitly requires it.

## Tests

`tests/e2e/app-smoke.spec.js` loads the home page as part of smoke coverage.

## Findings

- Confirmed: Home is a presentation and navigation surface, not a domain owner.
- Risk: low, unless route contracts or feature link targets change.

