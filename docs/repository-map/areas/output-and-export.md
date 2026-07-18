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
- `features/darken-location/output/model/location-document-output-v2.js` is the canonical Final Output projection and serializer boundary. JSON, Markdown, room key, session insert, and table-ready text all derive from `cruor-location-document-v2`.
- `features/darken-location/compiler/dark-places-v1-compatibility.adapter.js` is restricted to explicit historical import and parity operations. Final Output does not project v2 back into a v1 renderer view.
- In Phase 3 the renderer view exposes separate atmosphere, Global Rule, Recurring Sign, and stake collections. Overview renders scaled rule quick references and no longer duplicates the separate At the Table content.
- In Phase 4 semantic rooms expose exact-unique Immediate Impressions and three structured Read-Aloud variants. Final Output displays and copies the standard variant; spoiler-tagged fragments never enter the player-facing projection.
- In Phase 5 Final Output replaces generic semantic table notes with an operational dashboard: opening, objectives, pressure thresholds, rule reference, clue discovery, stall moves, and room shortcuts. Transient pressure/clue state is separate from the document, optionally persisted by build id plus document version, and reset without build mutation. Legacy documents retain their previous table-note rendering.
- `features/darken-location/output/LocationOutputWorkspace.jsx` renders Final Output as a dedicated Run-at-Table surface instead of an overlay on the map editor and owns the contextual Map Export Studio state.
- `features/darken-location/output/components/LocationRoomOutput.jsx` renders read-aloud, immediate impressions, hazards/traps, clues, encounter twists, GM-only secrets, rewards/consequences, and navigable room connections through distinct editorial layouts.
- Semantic room cards accept authored structured facet objects. If a block has
  no structured facets, including legacy granular blocks containing only scalar
  override tags, the renderer derives its visible fields from `text`,
  `mechanics`, `counterplay`, and `narrative` instead of emitting an empty
  section.
- `features/darken-location/output/components/LocationMapExportStudio.jsx` exposes GM, Player, and Print profiles; SVG/PNG; raster scale; content/full-canvas crop; per-level export; background; and visible map layers.
- `features/darken-location/output/model/location-map-export.js` owns `dark-places-map-export-v1`, preset normalization, crop/viewBox calculation, per-level bounds, filenames, render options, and serialization options.
- `features/darken-location/map-generator/map-generator.export.js` is the shared browser serializer for both Composer and standalone map exports. It removes transient overlays and disabled layers, enforces player-safe secret removal, embeds the print palette, and rasterizes SVG to PNG.
- Final live Phase 8 verifies that all 14 Inspirations reach this boundary as
  deterministic `cruor-location-document-v2` builds and that Composer export
  fails closed instead of reconstructing a legacy document.

## Node Exports

- `scripts/export-content-registry.mjs` exports content registry data.
- Map and room QA gallery scripts can write generated reports/galleries.
- Repository-map generation writes `docs/repository-map/repository-map.json`.

## Risks

Blob/object URL cleanup, clipboard fallbacks, SVG serialization, state-file compatibility, and popout lifecycle should be checked in a real browser after changes. Semantic facets must preserve authored text and structured mechanics without deriving missing DCs, triggers, or effects.
