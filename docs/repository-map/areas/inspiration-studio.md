# Inspiration Studio

## Scope

Inspiration Studio is centered on `features/inspiration-studio/InspirationStudioPage.jsx` plus components, validators, and model helpers in the same feature folder.

## Responsibilities

- Edit draft inspiration modules and related content structures.
- Inspect and reuse shared content, Monster Composer, and shared room archetype/design metadata.
- Validate/report draft state.
- Export generated JSON/document-style payloads.
- Persist panel rail widths with `localStorage` keys `cruor-studio-library-rail-size` and `cruor-studio-right-rail-size`.

## Dependencies

The page has high fan-out and imports many local components plus shared content contracts. Room archetype and room-design authoring now consume `shared/content/contracts/` through `shared/content/content.index.js`; validation imports those contracts directly. Studio must not depend on Map Generator implementation files for these schemas.

## Tests

Build, lint, and content validation provide indirect coverage. No focused browser E2E coverage was identified for Studio editing workflows.

## Findings

- Confirmed: `InspirationStudioPage.jsx` is a high-risk orchestrator.
- Confirmed: Studio bridges multiple content domains and local draft state.
- Risk: high for schema or export changes, medium for isolated panel UI changes.
