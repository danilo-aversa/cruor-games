# Dark Places Acceptance QA

Generated: 2026-07-09T13:29:21.756Z
Working directory: H:\Users\avers\Documenti\GitHub\cruor-games

## Summary

- Checks: 53
- Passed: 53
- Failed: 0

## Checks

- ✅ required file: features/darken-location/map-generator/map-generator.debug-options.js
- ✅ required file: features/darken-location/map-generator/map-generator.page.jsx
- ✅ required file: features/darken-location/map-generator/map-generator.render.jsx
- ✅ required file: features/darken-location/map-generator/map-generator.corridors.js
- ✅ required file: features/darken-location/map-generator/map-generator.state.js
- ✅ required file: features/darken-location/map-generator/map-generator.export.js
- ✅ required file: features/darken-location/map-generator/map-generator.debug.js
- ✅ required file: features/darken-location/map-generator/map-generator.pipeline.test.js
- ✅ required file: features/darken-location/map-generator/map-generator.circle-anchors.js
- ✅ required file: features/darken-location/map-generator/map-generator.circle-raccordo.js
- ✅ required file: features/darken-location/composer/components/LocationMapDetailsPanel.jsx
- ✅ required file: scripts/run-map-qa.mjs
- ✅ required file: scripts/run-circle-connector-diagnostics.test.js
- ✅ required file: scripts/vitest.circle-connectors.config.mjs
- ✅ required file: package.json
- ✅ phantom LocationMapDetailsPanel path is absent — features/darken-location/components/LocationMapDetailsPanel.jsx must not exist; the mounted Composer panel lives under composer/components.
- ✅ debug registry declares category definitions
- ✅ debug registry declares QA scenario definitions
- ✅ debug registry includes Levels / Stairs category
- ✅ debug registry includes Room Level → Stairs scenario
- ✅ debug registry includes Level View scenario
- ✅ Composer debug panel imports the shared map debug registry
- ✅ Composer debug panel does not duplicate local QA scenario arrays
- ✅ Composer debug panel does not duplicate local debug category arrays
- ✅ Composer debug panel does not duplicate getMapDebugCategory
- ✅ Composer runner exposes data-debug-scenario attributes
- ✅ Composer recorder exposes data-debug-category attributes
- ✅ Map editor imports the shared map debug registry
- ✅ Map editor does not duplicate local QA scenario arrays
- ✅ Map editor does not duplicate local debug category arrays
- ✅ Map editor handles Room Level → Stairs scenario
- ✅ Map editor handles Level View scenario
- ✅ Map editor exposes Level View UI control
- ✅ Map editor exposes room level menu options
- ✅ Corridor metadata supports stairs derived from room levels
- ✅ Corridor metadata exposes stairCount
- ✅ State helpers preserve editor stair level overrides
- ✅ Render layer exposes level-filtered maps
- ✅ Render layer exposes cross-level corridor badges
- ✅ Render layer marks stairs derived from room levels
- ✅ SVG root exposes level-view metadata
- ✅ Map state export includes export manifest
- ✅ Map export/import normalizes Level View UI state
- ✅ SVG export annotates export mode
- ✅ Player SVG export is explicitly marked player-safe
- ✅ Debug validation checks level transition consistency
- ✅ Vitest covers shared debug runner registry
- ✅ Vitest covers room-level derived stairs
- ✅ Vitest covers export/import hardening
- ✅ package exposes circle connector QA
- ✅ package exposes map debug QA
- ✅ package exposes test:run
- ✅ package exposes build

