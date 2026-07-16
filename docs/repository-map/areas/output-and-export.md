# Output And Export

## Scope

Output/export behavior appears across Map Generator, Monster Composer, Inspiration Studio, shared content export scripts, and QA scripts.

## Browser Exports

- Map Generator serializes SVG, validates export strings, writes clipboard text, and downloads SVG/JSON/text debug payloads.
- Map state JSON preserves normalized manual stair-marker positions and removal tombstones. Its export manifest reports total, positioned, and removed stair-marker overrides plus the manual-override schema version.
- Map UI state persists stair-direction-arrow visibility; missing or legacy values normalize to hidden.
- Monster Composer copies stat blocks and export payloads and can open a live export popout.
- Inspiration Studio exports generated draft/module payloads.
- Darken composer supports copy/export status around compiled location output.
- `features/darken-location/output/model/location-document.js` adapts the current Composer output into the presentation-independent `dark-places-document-v1` contract. The canonical document separates metadata, overview blocks, map topology, room content, audience, source references, readiness, and semantic block facets before UI/PDF rendering.
- `features/darken-location/compiler/dark-places-v1-compatibility.adapter.js` supplies the temporary output normalization boundary: existing `dark-places-document-v1` passes through unchanged, while `cruor-location-document-v2` is projected into the same renderer view without writing legacy content. Phase 4 projects compiler-composed `room.readAloud.standard` as the sole room Read-Aloud block while retaining compact/extended variants in metadata. Phase 5 also carries the structured Session Guide and source build identity into Final Output. The active export bundle remains v1.
- In Phase 3 the renderer view exposes separate atmosphere, Global Rule, Recurring Sign, and stake collections. Overview renders scaled rule quick references and no longer duplicates the separate At the Table content.
- In Phase 4 semantic rooms expose exact-unique Immediate Impressions and three structured Read-Aloud variants. Final Output displays and copies the standard variant; spoiler-tagged fragments never enter the player-facing projection.
- In Phase 5 Final Output replaces generic semantic table notes with an operational dashboard: opening, objectives, pressure thresholds, rule reference, clue discovery, stall moves, and room shortcuts. Transient pressure/clue state is separate from the document, optionally persisted by build id plus document version, and reset without build mutation. Legacy documents retain their previous table-note rendering.
- `features/darken-location/output/LocationOutputWorkspace.jsx` renders Final Output as a dedicated Run-at-Table surface instead of an overlay on the map editor and owns the contextual Map Export Studio state.
- `features/darken-location/output/components/LocationRoomOutput.jsx` renders read-aloud, immediate impressions, hazards/traps, clues, encounter twists, GM-only secrets, rewards/consequences, and navigable room connections through distinct editorial layouts.
- `features/darken-location/output/components/LocationMapExportStudio.jsx` exposes GM, Player, and Print profiles; SVG/PNG; raster scale; content/full-canvas crop; per-level export; background; and visible map layers.
- `features/darken-location/output/model/location-map-export.js` owns `dark-places-map-export-v1`, preset normalization, crop/viewBox calculation, per-level bounds, filenames, render options, and serialization options.
- `features/darken-location/map-generator/map-generator.export.js` is the shared browser serializer for both Composer and standalone map exports. It removes transient overlays and disabled layers, enforces player-safe secret removal, embeds the print palette, and rasterizes SVG to PNG.

## Node Exports

- `scripts/export-content-registry.mjs` exports content registry data.
- Map and room QA gallery scripts can write generated reports/galleries.
- Repository-map generation writes `docs/repository-map/repository-map.json`.

## Risks

Blob/object URL cleanup, clipboard fallbacks, SVG serialization, state-file compatibility, and popout lifecycle should be checked in a real browser after changes. Location Document v2 must remain consumable through the temporary renderer view until the export bundle migrates. Semantic facets must preserve authored text and structured mechanics without deriving missing DCs, triggers, or effects.
