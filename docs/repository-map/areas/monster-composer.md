# Monster Composer

## Scope

Monster Composer is centered on `features/monster-composer/monster-composer.page.jsx` plus data, model, QA, and style files under `features/monster-composer/`.

## Responsibilities

- Own Monster Composer page state and workflow.
- Combine source/category/role/tactical/tier/tempo/danger/target CR controls with selected grafts and presets.
- Merge native graft data with registry-fed content-pack components.
- Compile public and debug export payloads.
- Support clipboard copy and live stat-block popout.

## Content Models

The composer currently uses multiple overlapping models:

- native graft data in `features/monster-composer/data/monster-grafts.js`.
- registry-fed grafts via `features/monster-composer/data/monster-content-pack-feed.js`.
- rules/schema helpers under `features/monster-composer/model/`.

This is a confirmed transitional architecture, not a single canonical model.

## Tests

Run `npm run monster:qa` for targeted QA. Build, lint, and content validation provide additional coverage.

## Findings

- Confirmed: `monster-composer.page.jsx` is a high-risk orchestrator with browser side effects.
- Confirmed: live export uses `window.open` and writes to a popout document.
- Risk: high for content-model, export, balancing, and popout changes.

