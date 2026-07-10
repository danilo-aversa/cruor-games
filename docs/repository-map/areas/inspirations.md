# Inspirations

## Scope

Inspirations are centered on `features/inspirations/inspirations.page.jsx` and shared content modules under `shared/content/`.

## Responsibilities

- Read normalized inspiration records from the shared content registry.
- Own search, filters, sorting, selected inspiration, and detail modal state.
- Link selected inspiration context to Monster Composer through router callbacks.

## Data Flow

Content packs and inspiration modules are normalized by shared content registry code. The Inspirations page consumes those records and produces filtered UI state, selected item state, and optional Monster Composer seed data.

## Tests

Coverage is indirect through build/lint, content validation, and app smoke paths. Detailed filtering and modal behavior should be manually checked after changes.

## Findings

- Confirmed: Inspirations is registry-driven.
- Inferred: detailed UI state is feature-local and not URL-backed.
- Risk: medium when changing registry shape; low for isolated presentation changes.

