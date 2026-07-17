# Inspiration Studio

## Scope

Inspiration Studio is centered on `features/inspiration-studio/InspirationStudioPage.jsx` plus components, validators, and model helpers in the same feature folder.

## Responsibilities

- Edit draft inspiration modules and related content structures.
- Import canonical Content Pack v0.2 or Inspiration Module v2 JSON and read v1
  modules through the shared compatibility boundary.
- Copy and download canonical v2-only module or pack output.
- Author every Dark Places semantic component through specialized form controls.
- Compile deterministic Dark Places previews with explicit generation controls.
- Report semantic Health, Coverage, Readiness, Warnings, and sample QA.
- Inspect and reuse shared content, Monster Composer, and shared room archetype/design metadata.
- Validate/report draft state.
- Export generated JSON/document-style payloads.
- Persist panel rail widths with `localStorage` keys `cruor-studio-library-rail-size` and `cruor-studio-right-rail-size`.

## Dependencies

The page has high fan-out and imports many local components plus shared content
contracts. `model/studio-v2-io.js` owns schema detection and compatibility
imports, `model/studio-draft.js` owns the mutable v2-aware editor projection,
`model/studio-export.js` owns canonical v2-only writes, and
`model/studio-editor-registry.js` resolves every semantic discriminant without
React. `schema/studio-semantic-editor-registry.js` binds the shared semantic
normalizers and validators to specialized editor metadata and coverage targets.
`model/studio-dark-places-preview.js` is the only Studio preview adapter to the
real pure compiler. Room archetype and room-design authoring consume
`shared/content/contracts/` through `shared/content/content.index.js`;
validation imports those contracts directly. Studio must not depend on Map
Generator implementation files for these schemas.

Phase 8 changes the shared module catalog, not Studio's write boundary: Sedlec,
Decomposition, and The Mist now enter Studio as canonical v2 modules while the
remaining 11 modules still cross the compatibility reader. Decomposition's 26
Monster grafts round-trip through the existing Studio editor family without a
v1 write. The Mist has Archive + Dark Places capability only and round-trips its
semantic location payload without placeholder Monster data. All three canonical
modules have explicit human approval records; the migration registry keeps those
decisions separate from remaining image-publication blockers.

## Tests

`npm run qa:dark-places:semantic-phase6` provides focused model coverage for v1
transitional import, canonical v2 module/pack round trips, v2-only output,
editor-registry completeness, invalid input, and existing Monster graft rule
editing. `npm run qa:dark-places:semantic-phase7` covers specialized editors,
semantic coverage, exact field links, compiled preview determinism, semantic
sample QA, and migration-aware Health. Build and content validation provide
broader integration coverage. Full pointer/keyboard browser coverage remains a
later hardening task.
`npm run qa:dark-places:semantic-phase8` additionally proves that Sedlec,
Decomposition, and The Mist are canonical catalog entries with complete
semantic coverage. `npm run qa:dark-places:semantic-phase8-batch2` proves exact
Decomposition graft parity and Studio v2-only round-trip behavior;
`npm run qa:dark-places:semantic-phase8-batch3` verifies The Mist provenance,
fair-navigation constraints, A + D round trip, and deterministic sample QA.

## Findings

- Confirmed: `InspirationStudioPage.jsx` is a high-risk orchestrator.
- Confirmed: schema normalization, migration, serialization, and registry logic
  are separated from the page.
- Confirmed: Studio has no v1 serializer; v1 input becomes a compatibility v2
  draft and cannot infer editorial approval.
- Confirmed: Studio bridges multiple content domains and local draft state.
- Confirmed: normal Dark Places authoring no longer requires raw JSON.
- Confirmed: preview calls the canonical compiler and never imports Map Generator
  UI, React, or SVG into shared contracts.
- Risk: high for schema or export changes, medium for isolated panel UI changes.
