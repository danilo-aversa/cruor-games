# Dark Places Acceptance QA

Generated: 2026-07-14T16:18:52.179Z
Working directory: H:\Users\avers\Documenti\GitHub\cruor-games

## Summary

- Checks: 94
- Passed: 94
- Failed: 0

## Checks

- ✅ required file: features/darken-location/map-generator/map-generator.debug-options.js
- ✅ required file: features/darken-location/map-generator/map-generator.page.jsx
- ✅ required file: features/darken-location/map-generator/map-generator.render.jsx
- ✅ required file: features/darken-location/map-generator/map-generator.corridors.js
- ✅ required file: features/darken-location/map-generator/map-generator.mask.js
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
- ✅ Corridor waypoint insertion uses an explicit drag threshold
- ✅ Vitest covers click-safe corridor waypoint insertion
- ✅ Waypoint routing blocks cells already traversed by the same corridor
- ✅ Corridor routing exposes the self-avoiding continuity contract
- ✅ Map editor rejects waypoint commits with invalid route continuity
- ✅ Generated-map validation checks corridor continuity and self-overlap
- ✅ Vitest covers the reported waypoint dead-end regression
- ✅ Dungeon mask preserves walls between adjacent non-consecutive corridor runs
- ✅ Vitest covers folded S-corridor wall separation
- ✅ Corridor metadata supports stairs derived from room levels
- ✅ Corridor metadata exposes stairCount
- ✅ State helpers preserve editor stair level overrides
- ✅ Render layer exposes level-filtered maps
- ✅ Render layer exposes cross-level corridor badges
- ✅ Render layer marks stairs derived from room levels
- ✅ Render layer exposes selectable stair marker handles
- ✅ Rendered stair markers expose stable editor identities
- ✅ Stair direction arrows are opt-in at render time
- ✅ Map editor defaults wall drawing to Precise
- ✅ Map Style root menu uses the widened shared width
- ✅ Map Style flyouts match the root menu width
- ✅ Map Style root glass uses a pseudo-element so nested flyouts retain backdrop filtering
- ✅ Map Style dropdown glass keeps the WebKit backdrop-filter fallback
- ✅ Map state normalizes stair-arrow visibility
- ✅ Map editor owns stair marker selection state
- ✅ Map editor wires stair marker pointer selection
- ✅ Render layer constrains stair marker drags to valid corridor targets
- ✅ State layer normalizes persistent stair marker positions
- ✅ Map editor resolves stair marker positions from manual overrides
- ✅ Map editor persists valid stair marker drops
- ✅ Map editor records stair marker drag completion
- ✅ State layer exposes stair marker removal tombstones
- ✅ Stair marker context menu exposes position reset
- ✅ Stair marker context menu exposes marker removal
- ✅ Render layer suppresses removed stair markers
- ✅ SVG root exposes level-view metadata
- ✅ Map state export includes export manifest
- ✅ Map export/import normalizes Level View UI state
- ✅ SVG export annotates export mode
- ✅ Player SVG export is explicitly marked player-safe
- ✅ Debug validation checks level transition consistency
- ✅ Vitest covers shared debug runner registry
- ✅ Vitest covers room-level derived stairs
- ✅ Vitest covers map style defaults and aligned menu sizing
- ✅ Vitest covers opt-in stair direction arrows
- ✅ Vitest covers stair selection overlay rendering
- ✅ Vitest covers constrained stair marker drag snapping at door-adjacent endpoints
- ✅ Vitest covers persistent stair marker overrides
- ✅ Map state manifest counts persistent stair markers
- ✅ Map state manifest distinguishes positioned stair markers
- ✅ Map state manifest distinguishes removed stair markers
- ✅ Imported stair removal tombstones discard stale position data
- ✅ Vitest covers export/import hardening
- ✅ Vitest covers positioned and removed stair round trips
- ✅ Vitest covers legacy and malformed stair imports
- ✅ package exposes circle connector QA
- ✅ package exposes map debug QA
- ✅ package exposes test:run
- ✅ package exposes build

