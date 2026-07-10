# Entry Points

## Browser Runtime

- `index.html`: browser HTML entry. It declares the root mount node and loads `/app/main.jsx`.
- `app/main.jsx`: React bootstrap. It imports shared styles such as `shared/styles/theme.css`, `shared/styles/components.css`, `shared/styles/composer-system.css`, `shared/styles/tooltips.css`, feature styles, tooltip runtime, and accessibility setup before rendering `AppRouter`.
- `app/router.jsx`: custom application router and top-level state coordinator.
- `app/AppShell.jsx`: top-level visual shell for the active page and global topbar.

## Feature Page Entries

- `app/HomePage.jsx`: home route surface.
- `features/darken-location/composer/DarkenLocationComposerPage.jsx`: Darken a Location workspace.
- `features/darken-location/map-generator/map-generator.page.jsx`: Map Generator page and embedded editor.
- `features/monster-composer/monster-composer.page.jsx`: Monster Composer workspace.
- `features/inspirations/inspirations.page.jsx`: Inspirations archive.
- `features/inspiration-studio/InspirationStudioPage.jsx`: Inspiration Studio workspace.
- `features/crucible/index.js`: Crucible React wrapper and mount entry.

## Package Script Entries

`package.json` is the command registry. Important entries:

- `npm run dev`: starts Vite development server.
- `npm run build`: Vite production build.
- `npm run lint`: ESLint over the repository.
- `npm run test:run`: Vitest configured by `vitest.config.js`.
- `npm run test:e2e`: Playwright configured by `playwright.config.js`.
- `npm run content:validate`: validates shared content registry.
- `npm run content:export`: exports content registry artifacts.
- `npm run monster:qa`: Monster Composer QA runner with SVG loader.
- `npm run qa:maps`, `npm run qa:maps:debug`, `npm run qa:maps:adapters`: map generation QA variants.
- `npm run qa:circle-connectors`: Vitest circle connector diagnostics through `scripts/vitest.circle-connectors.config.mjs`.
- `npm run docs:repo-map`: generates `docs/repository-map/repository-map.json`.
- `npm run docs:repo-map:check`: validates repository-map freshness and references.

## Script Entries

Representative script entry points include:

- `scripts/validate-content-registry.mjs`
- `scripts/export-content-registry.mjs`
- `scripts/run-map-qa.mjs`
- `scripts/run-dark-places-acceptance-qa.mjs`
- `scripts/run-monster-qa.mjs`
- `scripts/run-composer-assignment-qa.mjs`
- `scripts/run-room-design-qa.mjs`
- `scripts/run-map-archetype-qa.mjs`
- `scripts/repository-map/generate-repository-map.mjs`
- `scripts/repository-map/validate-repository-map.mjs`

## CI And Deployment Entries

- `.github/workflows/ci.yml`: installs dependencies, installs Playwright Chromium, builds, runs Vitest, and runs Playwright.
- `.github/workflows/deploy-pages.yml`: builds and deploys the Vite app to GitHub Pages.
