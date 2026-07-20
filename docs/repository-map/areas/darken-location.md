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
- Export the compiler-owned `cruor-location-document-v2` directly to web,
  Markdown, JSON, room-key, session-insert, and table-ready projections.
- Compile canonical semantic pack/module/session inputs into renderer-independent `cruor-location-document-v2` and semantic map intent without clocks, mutation, browser state, or UI imports.
- Keep document-v1 support inside the explicit historical read-compatibility
  adapter; no live Composer producer or Final Output path writes v1.
- Render Final Output as a dedicated read-only workspace with its own contents outline, map selection, overview, table summary, semantic room document, and contextual Map Export Studio.

## Data Flow

Composer state is built from local model helpers and shared content. `dungeon-brief-generator.js` resolves each region through the shared Room Constraint Resolver before `dungeon-brief.js` serializes the result. `darken-location.map-request.js` remains the feature boundary to Map Generator. The router stores the resulting request and revision before rendering the map page.

In Theme mode, changing Theme, Context, or Horror atomically regenerates the
theme room program instead of leaving the initial Sedlec regions attached to a
new semantic frame. Explicit generation uses the same state transition. Because
the replacement can change every region id, the transition clears component
assignments, slot locks, room-constraint state, and manual map overrides rather
than retaining directives that target removed rooms.

The first Composer render also uses that generated Theme pipeline, so its map is
the same deterministic baseline that an immediate regeneration produces. Frame
mode owns no room selection; entering Rooms selects the first room by default.
Regenerate Map and Refresh Seed live in the right information rail rather than
the map toolbar. Both require a second confirming click, clear incompatible
assignments and manual edits, and return to the unselected Frame view; Refresh
Seed additionally creates a new seed before rebuilding.

Generated room names contain only the thematic room-type label; ordinal room
numbers remain a separate topology/display field so map ordering cannot become
stale text inside a name. Theme generation owns structural choices such as room
role, type, size, level, and connectors, but leaves sensory, feature, hazard,
clue, reward, and encounter content empty. Those table-facing fields are owned
by explicit Composer slot assignments; future procedural detail generation must
enter through a separate user action.

The shared Content Repository exposes a pure, version-pinned `resolveDarkPlacesRuntimeContent()` boundary. It separates the selected semantic v2 baseline, production granular candidate pools, location regions, external capability links, provenance, and diagnostics.

Phase 3 connects that boundary to the live Composer through `model/location-composer-semantic-preview.js`. The model resolves a module reference from the selected theme or Source Anchor, builds `cruor-dark-places-composer-input-v1`, derives a structural compiler session from the current rooms, and invokes `compileDarkPlacesSemanticLocation()`. A deterministic compiler fingerprint excludes UI focus and manual coordinate changes, while the full input fingerprint still records map state and manual overrides. A per-Composer memoizer reuses the compiler result until semantic structure changes. Compilation is pure, synchronous, DOM-free, and does not mutate the draft.

The semantic result is attached to the Composer preview model as `semanticRuntime` and exposes validity, diagnostics, Location Document v2, semantic map request, baseline, provenance, and hybrid override operations in the right information rail. Granular selections remain outside the canonical semantic module and the baseline compiler session.

Live-integration Phase 4 applies granular components after baseline compilation through `dark-places-hybrid-overrides.js`. Every assignment normalizes to a versioned directive with one explicit strategy: `append`, `replace`, `suppress`, `force`, `lock`, `prefer`, or `exclude`. Map-scoped and region-scoped plans are stored separately; region directives require a stable region id, while map directives cannot carry one. The applicator creates discrete Location Document v2 blocks and never concatenates granular prose with semantic baseline text. Destructive strategies preserve locked blocks, legacy-id provenance can target the corresponding semantic baseline block, and every applied operation records its target path and affected block ids.

Granular blocks keep override strategy/scope metadata under
`metadata.hybridOverride`; their editorial `facets` remain empty unless authored
as structured facet objects. Final Output ignores malformed or legacy scalar
facet entries and falls back to the block text, mechanics, counterplay, and
narrative so an applied clue or hazard cannot produce an empty visual section.

The baseline compiler fingerprint deliberately excludes granular operations. A separate hybrid-override fingerprint changes with assignments, targets, locks, or authored override settings. The Composer memoizer therefore reuses baseline compiler work for granular edits and reapplies the pure override plan to the cached baseline.

Live-integration Phase 5 promotes the compiler's adapted semantic map request through `model/location-composer-semantic-map-handoff.js`. The pure, versioned handoff keeps the semantic request and Map Generator manual override schema as separate immutable values. The semantic request owns seed, context, room topology and connections; generator-only room size, archetype, room-design and map-influence hints are retained from the structural request where Location Document v2 cannot represent them yet. The live preview and embedded editor consume an emitted semantic map request even when unrelated document-content diagnostics remain visible; a legacy request is used only as a fail-closed fallback when semantic compilation emits no map request.

Manual room positions, corridor routes and types, doors, anchors, levels, map accesses, custom/deleted connections, room shapes and sizes remain in `mapManualOverrides`. Semantic recompilation no longer clears that overlay. A room-constraint fingerprint triggers recomputation with the existing manual overlay instead of deleting it. Explicit **Refresh from Composer** and workflows that deliberately replace the room program retain their existing reset semantics.

The handoff publishes deterministic request, topology, content, metadata and room-constraint fingerprints. Seed, context, map type/dimensions, room geometry/archetype/role/level and connections regenerate topology. Titles and room names update content. Component placements, palette, provenance and markers update metadata. Shape, size, archetype, room design, map influence or assigned semantic components invalidate the affected room constraint resolution. Final Output is now Location Document v2-native.

Each normalized assigned component carries a `location-component-effect-v0.1` record. The record preserves explicit effect metadata, lifts existing map/room contracts, and reaches the Dungeon Brief and Map Request. Component placements are consumed by the compiled output and normalized into semantic document blocks.

`features/darken-location/compiler/index.js` is the semantic compiler boundary. `dark-places-semantic-compiler.js` validates canonical Content Pack v0.2, Inspiration Module v2, and compiler Session State v1 inputs before resolving components and emitting a deeply frozen Location Document v2. Phase 3 delegates Place Identity composition to `location-identity.compiler.js`, scaled atmosphere/rule/stake compilation to `location-site-wide.compiler.js`, and seed-stable bounded room placement to `location-recurring-signs.compiler.js`. Phase 4 adds shared stable ranking in `location-compiler-rng.js`, exact-unique pressure-aware room impressions in `location-sensory.compiler.js`, and compact/standard/extended spoiler-filtered composition in `location-read-aloud.compiler.js`. Phase 5 adds `location-session-guide.compiler.js`, which resolves opening, objectives, pressure and always-on rule references, a room-backed clue graph, stall moves, and pacing-aware shortcuts without count-derived guidance. `dark-places-map-intent.adapter.js` converts the canonical module/session pair into renderer-independent map intent and then into the existing map-request vocabulary without importing Map Generator. `dark-places-v1-compatibility.adapter.js` is now restricted to explicit historical import, parity, and downstream-v1 compatibility calls.

The active Composer compiles a structural Session State directly from the room program and map request, then exports the resulting `cruor-location-document-v2`. `features/darken-location/output/model/location-document-output-v2.js` owns Final Output projections and all text serializers. The legacy compile preview, v1 document writer, and duplicate export panels have been removed.

`LocationOutputWorkspace.jsx` owns the Final Output shell, synchronized map/outline selection, map-export state, and separate At the Table operational state. Its right summary rail renders map preview, file/framing, map style, and layer facts inside shared `ComposerCollapsibleSection` containers, while retaining shared `ComposerFactRow` content and the canonical right-side `ComposerRail`. This Export-only structure matches the left output outline and does not alter non-Export information rails. `output/components/LocationAtTheTableDashboard.jsx` renders Start Here, interactive pressure, always-on rules, clue discovery, stall moves, room shortcuts, persistence, and reset controls. `output/model/location-session-dashboard-state.js` clamps updates and optionally persists them under build id plus document version without mutating the source document. `output/components/LocationRoomOutput.jsx` owns the room-facing editorial grammar: Read Aloud, Immediate Impressions, semantic hazard/clue/twist/secret/reward cards, and navigable exits. `output/components/LocationMapExportStudio.jsx` exposes GM, Player, and Print presets plus SVG/PNG, crop, level, background, and layer controls. `output/model/location-map-export.js` normalizes these choices and converts them into the shared Map Generator serialization contract. The output route no longer mounts map-editor rails, toolbar, guided flow, or Map Details.

The Composer map's room recap waits 500 ms after pointer or keyboard focus
before opening and closes immediately when the room is left. It no longer reads
legacy procedural `feature` or `danger` fields. Its fact rows are derived only
from explicitly assigned regional `hazard`, `clue`, and `encounterTwist` slots,
using their user-facing labels.

The Rooms left rail uses the same shared hero-card and fact-row composition as
the right information rail. Room assignment slots remain shared
`ComposerSlotCard` instances below that summary.

The Composer map stage uses the semantic topology fingerprint to identify full
map replacements. It keeps the previous map mounted during fade-out, shows a
centered, unboxed busy state for at least one second while swapping the request,
and fades the replacement in.
Non-structural edits continue without triggering this transition, and reduced
motion preferences skip the fades while retaining a brief loading announcement.

Each normalized room carries both the generator-facing `roomDesign`/`effectiveRoomDesign` and a versioned `roomConstraintResolution` report with status, conflicts, warnings, changes, provenance, capabilities, and diagnostics. Hard conflicts remain explicit in the report instead of being hidden by sequential object overwrite. Composer assignment is not blocked yet; candidate-time compatibility belongs to the later picker integration.

Immersive mode is presentation-only state. It closes an open component drawer when entered, removes peripheral panels from the stage render, and expands the existing inline map editor without changing the composer draft, map request, manual overrides, assignments, or generated geometry.

## Tests

Relevant checks include `npm run test:e2e:dark-places`, `npm run qa:dark-places:acceptance`, `npm run qa:dark-places:semantic-compiler`, `npm run qa:dark-places:semantic-phase3`, `npm run qa:dark-places:semantic-phase4`, `npm run qa:dark-places:semantic-phase5`, `npm run qa:composer-assignment`, and `npm run qa:room-design`. Compiler tests cover real Sedlec compatibility compilation, v1/v2 parity, premise coverage, rule scaling, Recurring Sign bounds, exact-unique sensory allocation, isolated room changes, multi-role/shape matching, Read-Aloud word ranges, spoiler filtering, Session Guide playability, clue availability, standard export projection, order-independent bytes, immutability, provenance, map intent, forbidden dependencies, and rejection of non-canonical inputs. `features/darken-location/composer/model/location-composer-selectors.test.js` executes the final production registry, traces context, intrusion, source, and horror exclusions, protects the initial Sedlec pools, accepts canonical ids as well as legacy labels, and audits granular availability across all 14 migrated Inspirations. The picker rendering test verifies that the final Sedlec registry pool reaches the live drawer. `location-composer-semantic-preview.test.js` covers direct v2 session seeding, the real live Sedlec compile, deterministic baseline memoization, granular override reapplication, manual-map/UI-only stability, draft immutability, and missing-module failure. `LocationMapDetailsPanel.test.jsx` verifies the visible semantic validity, document, map request, baseline, override counts, provenance, and diagnostics surface. `features/darken-location/dungeon/dungeon-brief-room-constraints.test.js` covers multi-component resolution, structured conflicts, map handoff, required props, stale-report invalidation, and legacy adapter preservation. `features/darken-location/output/model/location-document-output-v2.test.js` covers canonical projections, v1 import compatibility, serializers, connections, readiness, and the DOM-free output boundary. `features/darken-location/output/LocationOutputWorkspace.test.jsx` covers both document schemas, the separated Phase 3 Overview, Phase 4 standard Read-Aloud projection, Phase 5 operational dashboard, the dedicated Final Output shell, semantic room hierarchy, and Map Export Studio surface. Dashboard interaction and state-model tests cover keyboard focus, pressure bounds, thresholds, clue toggling, persistence identity, reset, room navigation, and source immutability. `features/darken-location/output/model/location-map-export.test.js` covers presets, crop bounds, levels, serializer options, and filenames.

Live Phase 4 adds `dark-places-hybrid-overrides.test.js` for all seven strategies, lock precedence, deterministic ordering, scope separation, Location Document validation, and baseline immutability. The Composer semantic preview test now verifies that granular changes reapply the hybrid plan without rerunning the baseline compiler, while the right-rail test covers map/region override counts.

Live Phase 5 adds `location-composer-semantic-map-handoff.test.js`. It covers the DOM-free boundary, semantic/fallback selection, deterministic fingerprints, explicit change classification, non-mutation, preservation of every manual override family, generator-only room hints, selected seed, and an integration pass through the real Map Generator pipeline. `location-composer-preview.js` now exposes request-driven preview generation and keeps a small deterministic cache so the structural compiler preparation and semantic live preview do not evict each other on every render. The right rail reports whether the live map is using the semantic handoff or the fail-closed fallback.

Final live Phase 8 adds
`model/dark-places-phase8-live-acceptance.test.js` and the
`qa:dark-places:live-phase8` gate. It compiles all 14 canonical Inspirations
through the actual Composer preparation/memoizer boundary, checks deterministic
v2 output and zero diagnostics, exercises Inspiration/seed/context/room changes,
preserves manual map overrides, and covers the full seven-slot granular
assignment, lock, change, clear, and remove lifecycle. The default Composer
mount test also fails on console errors or warnings.

Composer mount/state coverage also changes the live Theme picker to
Decomposition, verifies that the Sedlec room program is replaced with the
Decomposition vocabulary, and checks that stale assignments and locks are
cleared. Final Output coverage renders a granular Disturbing Clue carrying
legacy scalar facet metadata and asserts that its title and observation remain
visible.

`features/darken-location/composer/components/LocationMapStage.test.jsx` covers
the delayed room recap, immediate
close behavior, and explicit-assignment-only facts. Composer generation coverage
also rejects ordinal prefixes inside room names and verifies that newly generated
rooms do not receive procedural sensory, feature, danger, clue, reward, or
encounter values.

## Findings

- Confirmed: `DarkenLocationComposerPage.jsx` is a high-risk stateful orchestrator.
- Confirmed: the map request bridge is the correct integration point for map handoff.
- Confirmed: the Phase 5 compiler/dashboard and in-review pack are additive; production Composer export remains v1 until human approval and consumer migration.
- Confirmed: Location Document v2 contains semantic map topology but no renderer geometry.
- Confirmed: the live semantic preview compiles the macro baseline once per structural fingerprint, applies explicit granular overrides, and supplies the request used by the live Map Generator through the Phase 5 handoff.
- Confirmed: semantic state and manual map state are separate; a semantic request change cannot erase unrelated manual geometry or editor overrides.
- Risk: high for draft schema, request payload, or slot assignment changes.
