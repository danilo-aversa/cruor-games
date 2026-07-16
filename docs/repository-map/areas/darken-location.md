# Darken Location

## Scope

Darken Location includes `features/darken-location/composer/`, `features/darken-location/compiler/`, `features/darken-location/dungeon/`, `features/darken-location/output/`, and the bridge file `features/darken-location/darken-location.map-request.js`.

## Responsibilities

- Own location frame and workflow state.
- Manage active slot/scope, region selection, draft status, summary status, builder mode, drawer state, and export copy state.
- Manage the local immersive-workspace toggle exposed by `LocationMapToolbar`.
- Render room work slots through the shared `ComposerSlotCard` primitive while retaining Dark Places data attributes and missing/suggested workflow states.
- Persist and recover drafts.
- Convert completed location state into map request payloads.
- Adapt compiled Composer output into the presentation-independent `dark-places-document-v1` contract used by web, future PDF/map-pack, Markdown, and JSON renderers.
- Compile canonical semantic pack/module/session inputs into renderer-independent `cruor-location-document-v2` and semantic map intent without clocks, mutation, browser state, or UI imports.
- Preserve document-v1 input and the current Final Output through a temporary pure v2-to-v1 renderer view during migration.
- Render Final Output as a dedicated read-only workspace with its own contents outline, map selection, overview, table summary, semantic room document, and contextual Map Export Studio.

## Data Flow

Composer state is built from local model helpers and shared content. `dungeon-brief-generator.js` resolves each region through the shared Room Constraint Resolver before `dungeon-brief.js` serializes the result. `darken-location.map-request.js` remains the feature boundary to Map Generator. The router stores the resulting request and revision before rendering the map page.

Each normalized assigned component carries a `location-component-effect-v0.1` record. The record preserves explicit effect metadata, lifts existing map/room contracts, and reaches the Dungeon Brief and Map Request. Component placements are consumed by the compiled output and normalized into semantic document blocks.

`features/darken-location/compiler/index.js` is the semantic compiler boundary. `dark-places-semantic-compiler.js` validates canonical Content Pack v0.2, Inspiration Module v2, and compiler Session State v1 inputs before resolving components and emitting a deeply frozen Location Document v2. Phase 3 delegates Place Identity composition to `location-identity.compiler.js`, scaled atmosphere/rule/stake compilation to `location-site-wide.compiler.js`, and seed-stable bounded room placement to `location-recurring-signs.compiler.js`. Phase 4 adds shared stable ranking in `location-compiler-rng.js`, exact-unique pressure-aware room impressions in `location-sensory.compiler.js`, and compact/standard/extended spoiler-filtered composition in `location-read-aloud.compiler.js`. Phase 5 adds `location-session-guide.compiler.js`, which resolves opening, objectives, pressure and always-on rule references, a room-backed clue graph, stall moves, and pacing-aware shortcuts without count-derived guidance. `dark-places-map-intent.adapter.js` converts the canonical module/session pair into renderer-independent map intent and then into the existing map-request vocabulary without importing Map Generator. `dark-places-v1-compatibility.adapter.js` converts the current derived document into a compiler session, compares v1/v2 documents, and supplies a temporary v1 renderer view whose composed room projection uses the standard Read-Aloud variant and whose structured Session Guide feeds Final Output. It does not read or write legacy content modules.

The active Composer export remains `dark-places-document-v1` through Phase 5. The real Sedlec baseline is compiled with the separate in-review semantic v2 candidate; production adoption and human editorial approval remain later gates.

`features/darken-location/output/model/location-document.js` is the canonical output boundary. It consumes the current compile preview, Composer state, Map Request, and generated map; resolves room numbering and connections; separates read-aloud, sensory, features, interactions, hazards, clues, twists, secrets, rewards, audience, mechanics, counterplay, source anchors, and readiness; and exposes `dark-places-document-v1`. Each semantic block also exposes ordered facets such as observation, resolution, counterplay, revelation, escalation, consequence, and guidance without inventing absent rules. The existing `dark-places-export-v1` JSON payload embeds this document during the migration period.

`LocationOutputWorkspace.jsx` owns the Final Output shell, synchronized map/outline selection, map-export state, and separate At the Table operational state. `output/components/LocationAtTheTableDashboard.jsx` renders Start Here, interactive pressure, always-on rules, clue discovery, stall moves, room shortcuts, persistence, and reset controls. `output/model/location-session-dashboard-state.js` clamps updates and optionally persists them under build id plus document version without mutating the source document. `output/components/LocationRoomOutput.jsx` owns the room-facing editorial grammar: Read Aloud, Immediate Impressions, semantic hazard/clue/twist/secret/reward cards, and navigable exits. `output/components/LocationMapExportStudio.jsx` exposes GM, Player, and Print presets plus SVG/PNG, crop, level, background, and layer controls. `output/model/location-map-export.js` normalizes these choices and converts them into the shared Map Generator serialization contract. The output route no longer mounts map-editor rails, toolbar, guided flow, or Map Details.

Each normalized room carries both the generator-facing `roomDesign`/`effectiveRoomDesign` and a versioned `roomConstraintResolution` report with status, conflicts, warnings, changes, provenance, capabilities, and diagnostics. Hard conflicts remain explicit in the report instead of being hidden by sequential object overwrite. Composer assignment is not blocked yet; candidate-time compatibility belongs to the later picker integration.

Immersive mode is presentation-only state. It closes an open component drawer when entered, removes peripheral panels from the stage render, and expands the existing inline map editor without changing the composer draft, map request, manual overrides, assignments, or generated geometry.

## Tests

Relevant checks include `npm run test:e2e:dark-places`, `npm run qa:dark-places:acceptance`, `npm run qa:dark-places:semantic-compiler`, `npm run qa:dark-places:semantic-phase3`, `npm run qa:dark-places:semantic-phase4`, `npm run qa:dark-places:semantic-phase5`, `npm run qa:composer-assignment`, and `npm run qa:room-design`. Compiler tests cover real Sedlec compatibility compilation, v1/v2 parity, premise coverage, rule scaling, Recurring Sign bounds, exact-unique sensory allocation, isolated room changes, multi-role/shape matching, Read-Aloud word ranges, spoiler filtering, Session Guide playability, clue availability, standard export projection, order-independent bytes, immutability, provenance, map intent, forbidden dependencies, and rejection of non-canonical inputs. `features/darken-location/dungeon/dungeon-brief-room-constraints.test.js` covers multi-component resolution, structured conflicts, map handoff, required props, stale-report invalidation, and legacy adapter preservation. `features/darken-location/output/model/location-document.test.js` covers semantic output sections and facets, audience boundaries, canonical map connections, levels, and readiness. `features/darken-location/output/LocationOutputWorkspace.test.jsx` covers both document schemas, the separated Phase 3 Overview, Phase 4 standard Read-Aloud projection, Phase 5 operational dashboard, the dedicated Final Output shell, semantic room hierarchy, and Map Export Studio surface. Dashboard interaction and state-model tests cover keyboard focus, pressure bounds, thresholds, clue toggling, persistence identity, reset, room navigation, and source immutability. `features/darken-location/output/model/location-map-export.test.js` covers presets, crop bounds, levels, serializer options, and filenames.

## Findings

- Confirmed: `DarkenLocationComposerPage.jsx` is a high-risk stateful orchestrator.
- Confirmed: the map request bridge is the correct integration point for map handoff.
- Confirmed: the Phase 5 compiler/dashboard and in-review pack are additive; production Composer export remains v1 until human approval and consumer migration.
- Confirmed: Location Document v2 contains semantic map topology but no renderer geometry.
- Risk: high for draft schema, request payload, or slot assignment changes.
