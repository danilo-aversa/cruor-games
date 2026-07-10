# Darken Location

## Scope

Darken Location includes `features/darken-location/composer/`, `features/darken-location/dungeon/`, and the bridge file `features/darken-location/darken-location.map-request.js`.

## Responsibilities

- Own location frame and workflow state.
- Manage active slot/scope, region selection, draft status, summary status, builder mode, drawer state, and export copy state.
- Persist and recover drafts.
- Convert completed location state into map request payloads.

## Data Flow

Composer state is built from local model helpers and shared content. `darken-location.map-request.js` is the feature boundary to Map Generator. The router stores the resulting request and revision before rendering the map page.

## Tests

Relevant checks include `npm run test:e2e:dark-places`, `npm run qa:dark-places:acceptance`, and `npm run qa:composer-assignment`.

## Findings

- Confirmed: `DarkenLocationComposerPage.jsx` is a high-risk stateful orchestrator.
- Confirmed: the map request bridge is the correct integration point for map handoff.
- Risk: high for draft schema, request payload, or slot assignment changes.

