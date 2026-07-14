# Darken Location

## Scope

Darken Location includes `features/darken-location/composer/`, `features/darken-location/dungeon/`, `features/darken-location/output/`, and the bridge file `features/darken-location/darken-location.map-request.js`.

## Responsibilities

- Own location frame and workflow state.
- Manage active slot/scope, region selection, draft status, summary status, builder mode, drawer state, and export copy state.
- Manage the local immersive-workspace toggle exposed by `LocationMapToolbar`.
- Render room work slots through the shared `ComposerSlotCard` primitive while retaining Dark Places data attributes and missing/suggested workflow states.
- Persist and recover drafts.
- Convert completed location state into map request payloads.
- Adapt compiled Composer output into the presentation-independent `dark-places-document-v1` contract used by web, future PDF/map-pack, Markdown, and JSON renderers.
- Render Final Output as a dedicated read-only workspace with its own contents outline, map selection, overview, table summary, semantic room document, and contextual Map Export Studio.

## Data Flow

Composer state is built from local model helpers and shared content. `dungeon-brief-generator.js` resolves each region through the shared Room Constraint Resolver before `dungeon-brief.js` serializes the result. `darken-location.map-request.js` remains the feature boundary to Map Generator. The router stores the resulting request and revision before rendering the map page.

Each normalized assigned component carries a `location-component-effect-v0.1` record. The record preserves explicit effect metadata, lifts existing map/room contracts, and reaches the Dungeon Brief and Map Request. Component placements are consumed by the compiled output and normalized into semantic document blocks.

`features/darken-location/output/model/location-document.js` is the canonical output boundary. It consumes the current compile preview, Composer state, Map Request, and generated map; resolves room numbering and connections; separates read-aloud, sensory, features, interactions, hazards, clues, twists, secrets, rewards, audience, mechanics, counterplay, source anchors, and readiness; and exposes `dark-places-document-v1`. Each semantic block also exposes ordered facets such as observation, resolution, counterplay, revelation, escalation, consequence, and guidance without inventing absent rules. The existing `dark-places-export-v1` JSON payload embeds this document during the migration period.

`LocationOutputWorkspace.jsx` owns the Final Output shell, synchronized map/outline selection, and map-export state. `output/components/LocationRoomOutput.jsx` owns the room-facing editorial grammar: Read Aloud, Immediate Impressions, semantic hazard/clue/twist/secret/reward cards, and navigable exits. `output/components/LocationMapExportStudio.jsx` exposes GM, Player, and Print presets plus SVG/PNG, crop, level, background, and layer controls. `output/model/location-map-export.js` normalizes these choices and converts them into the shared Map Generator serialization contract. The output route no longer mounts map-editor rails, toolbar, guided flow, or Map Details.

Each normalized room carries both the generator-facing `roomDesign`/`effectiveRoomDesign` and a versioned `roomConstraintResolution` report with status, conflicts, warnings, changes, provenance, capabilities, and diagnostics. Hard conflicts remain explicit in the report instead of being hidden by sequential object overwrite. Composer assignment is not blocked yet; candidate-time compatibility belongs to the later picker integration.

Immersive mode is presentation-only state. It closes an open component drawer when entered, removes peripheral panels from the stage render, and expands the existing inline map editor without changing the composer draft, map request, manual overrides, assignments, or generated geometry.

## Tests

Relevant checks include `npm run test:e2e:dark-places`, `npm run qa:dark-places:acceptance`, `npm run qa:composer-assignment`, and `npm run qa:room-design`. `features/darken-location/dungeon/dungeon-brief-room-constraints.test.js` covers multi-component resolution, structured conflicts, map handoff, required props, stale-report invalidation, and legacy adapter preservation. `features/darken-location/output/model/location-document.test.js` covers semantic output sections and facets, audience boundaries, canonical map connections, levels, and readiness. `features/darken-location/output/LocationOutputWorkspace.test.jsx` covers the dedicated Final Output shell, semantic room hierarchy, and Map Export Studio surface. `features/darken-location/output/model/location-map-export.test.js` covers presets, crop bounds, levels, serializer options, and filenames.

## Findings

- Confirmed: `DarkenLocationComposerPage.jsx` is a high-risk stateful orchestrator.
- Confirmed: the map request bridge is the correct integration point for map handoff.
- Risk: high for draft schema, request payload, or slot assignment changes.

