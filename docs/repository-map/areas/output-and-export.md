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

Blob/object URL cleanup, clipboard fallbacks, SVG serialization, state-file compatibility, and popout lifecycle should be checked in a real browser after changes. The canonical Dark Places document must remain backward-compatible with the existing export bundle while PDF and document-package exports are implemented. Semantic facets must preserve authored text and structured mechanics without deriving missing DCs, triggers, or effects.

