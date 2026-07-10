# Output And Export

## Scope

Output/export behavior appears across Map Generator, Monster Composer, Inspiration Studio, shared content export scripts, and QA scripts.

## Browser Exports

- Map Generator serializes SVG, validates export strings, writes clipboard text, and downloads SVG/JSON/text debug payloads.
- Map state JSON preserves normalized manual stair-marker positions and removal tombstones. Its export manifest reports total, positioned, and removed stair-marker overrides plus the manual-override schema version.
- Monster Composer copies stat blocks and export payloads and can open a live export popout.
- Inspiration Studio exports generated draft/module payloads.
- Darken composer supports copy/export status around compiled location output.

## Node Exports

- `scripts/export-content-registry.mjs` exports content registry data.
- Map and room QA gallery scripts can write generated reports/galleries.
- Repository-map generation writes `docs/repository-map/repository-map.json`.

## Risks

Blob/object URL cleanup, clipboard fallbacks, SVG serialization, state-file compatibility, and popout lifecycle should be checked in a real browser after changes.

