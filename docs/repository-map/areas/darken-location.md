# Darken Location

## Scope

Darken Location includes `features/darken-location/composer/`, `features/darken-location/dungeon/`, and the bridge file `features/darken-location/darken-location.map-request.js`.

## Responsibilities

- Own location frame and workflow state.
- Manage active slot/scope, region selection, draft status, summary status, builder mode, drawer state, and export copy state.
- Manage the local immersive-workspace toggle exposed by `LocationMapToolbar`.
- Render room work slots through the shared `ComposerSlotCard` primitive while retaining Dark Places data attributes and missing/suggested workflow states.
- Persist and recover drafts.
- Convert completed location state into map request payloads.

## Data Flow

Composer state is built from local model helpers and shared content. `dungeon-brief-generator.js` resolves each region through the shared Room Constraint Resolver before `dungeon-brief.js` serializes the result. `darken-location.map-request.js` remains the feature boundary to Map Generator. The router stores the resulting request and revision before rendering the map page.

Each normalized room now carries both the generator-facing `roomDesign`/`effectiveRoomDesign` and a versioned `roomConstraintResolution` report with status, conflicts, warnings, changes, provenance, capabilities, and diagnostics. Hard conflicts remain explicit in the report instead of being hidden by sequential object overwrite. Composer assignment is not blocked yet; candidate-time compatibility belongs to the later picker integration.

Immersive mode is presentation-only state. It closes an open component drawer when entered, removes peripheral panels from the stage render, and expands the existing inline map editor without changing the composer draft, map request, manual overrides, assignments, or generated geometry.

## Tests

Relevant checks include `npm run test:e2e:dark-places`, `npm run qa:dark-places:acceptance`, `npm run qa:composer-assignment`, and `npm run qa:room-design`. `features/darken-location/dungeon/dungeon-brief-room-constraints.test.js` covers multi-component resolution, structured conflicts, map handoff, required props, stale-report invalidation, and legacy adapter preservation.

## Findings

- Confirmed: `DarkenLocationComposerPage.jsx` is a high-risk stateful orchestrator.
- Confirmed: the map request bridge is the correct integration point for map handoff.
- Risk: high for draft schema, request payload, or slot assignment changes.

