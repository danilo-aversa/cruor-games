# Repository Structure

This tree is intentionally oriented around maintained project responsibilities rather than every file.

```text
.
  .github/workflows/       CI and GitHub Pages deployment
  app/                     Vite React bootstrap, router, shell, home, navigation
  components/ui/           Shared UI primitives
  data/i18n/               Locale dictionaries
  dev/                     Development reference material
  docs/                    Developer documentation and repository map
  features/                Feature modules
    crucible/
    darken-location/
    inspirations/
    inspiration-studio/
    monster-composer/
  public/                  Static browser assets
  reports/                 Historical QA and implementation reports
  scripts/                 Node tooling and QA scripts
  shared/                  Cross-feature infrastructure and content
  tests/                   Playwright and legacy test files
  test-results/            Tracked Playwright metadata artifact
```

## Root Files

Root files configure package management, Vite, Vitest, Playwright, Git ignore behavior, Pages hosting, and agent instructions. New root files should be rare and should normally represent project-wide tooling or documentation.

## app

`app/` is runtime code. It owns browser startup after `index.html`, custom routing, app shell layout, home page presentation, navigation controls, accessibility integration, and global style imports. Feature-specific logic should not be added here unless it is route coordination or app-shell presentation.

## features

`features/` is the primary runtime feature boundary. New feature code should normally be added under the relevant feature folder. Map generator logic is under `features/darken-location/map-generator/` because it is part of the Darken location toolchain, but it is also used as its own route.

## shared

`shared/` contains reusable infrastructure. It is appropriate for cross-feature content registries, i18n helpers, accessibility settings, tooltip runtime, and design-system styles. Feature-specific logic should not move into `shared/` unless more than one feature consumes it through a stable contract.

## scripts

`scripts/` contains Node entry points for content validation/export, map QA, Monster QA, diagnostics, repository-map generation, and support loaders. Scripts may write reports or generated outputs. They are not browser runtime modules unless explicitly imported by a build/test harness.

## docs and reports

`docs/` is maintained documentation. `reports/` and feature-local `reports/` directories are historical or generated evidence. They should not be treated as current implementation truth unless a current source file imports or references them.

## public

`public/` contains assets served directly by Vite. Binary files are individually represented in `repository-map.json` but are grouped conceptually in [Public Assets](areas/public-assets.md).

## tests

`tests/e2e/` contains active Playwright coverage. Nested `tests/tests/` and `tests/tests/tests/` directories are legacy duplicate paths with stale imports and are documented as legacy.

