#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const reportDir = path.join(rootDir, "reports");
const reportPath = path.join(reportDir, "dark-places-acceptance-qa.report.md");
const issues = [];
const checks = [];

function repoPath(relativePath) {
  return path.join(rootDir, relativePath);
}

function posixPath(relativePath) {
  return relativePath.replaceAll("\\\\", "/");
}

function addCheck(label, passed, detail = "") {
  checks.push({ label, passed, detail });
  if (!passed) issues.push({ label, detail });
}

function fileExists(relativePath) {
  return existsSync(repoPath(relativePath));
}

function readText(relativePath) {
  return readFileSync(repoPath(relativePath), "utf8");
}

function requireFile(relativePath) {
  const exists = fileExists(relativePath);
  addCheck(`required file: ${posixPath(relativePath)}`, exists);
  return exists;
}

function expectContains(relativePath, text, label = `${posixPath(relativePath)} contains ${text}`) {
  const passed = fileExists(relativePath) && readText(relativePath).includes(text);
  addCheck(label, passed, passed ? "" : `Missing text: ${text}`);
}

function expectRegex(relativePath, pattern, label = `${posixPath(relativePath)} matches ${pattern}`) {
  const passed = fileExists(relativePath) && pattern.test(readText(relativePath));
  addCheck(label, passed, passed ? "" : `Missing pattern: ${pattern}`);
}

function expectNotRegex(relativePath, pattern, label = `${posixPath(relativePath)} does not match ${pattern}`) {
  const passed = fileExists(relativePath) && !pattern.test(readText(relativePath));
  addCheck(label, passed, passed ? "" : `Unexpected pattern: ${pattern}`);
}

const requiredFiles = [
  "features/darken-location/map-generator/map-generator.debug-options.js",
  "features/darken-location/map-generator/map-generator.page.jsx",
  "features/darken-location/map-generator/map-generator.render.jsx",
  "features/darken-location/map-generator/map-generator.corridors.js",
  "features/darken-location/map-generator/map-generator.mask.js",
  "features/darken-location/map-generator/map-generator.state.js",
  "features/darken-location/map-generator/map-generator.export.js",
  "features/darken-location/map-generator/map-generator.debug.js",
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "features/darken-location/map-generator/map-generator.circle-anchors.js",
  "features/darken-location/map-generator/map-generator.circle-raccordo.js",
  "features/darken-location/composer/components/LocationMapDetailsPanel.jsx",
  "scripts/run-map-qa.mjs",
  "scripts/run-circle-connector-diagnostics.test.js",
  "scripts/vitest.circle-connectors.config.mjs",
  "package.json",
];

for (const relativePath of requiredFiles) requireFile(relativePath);

addCheck(
  "phantom LocationMapDetailsPanel path is absent",
  !fileExists("features/darken-location/components/LocationMapDetailsPanel.jsx"),
  "features/darken-location/components/LocationMapDetailsPanel.jsx must not exist; the mounted Composer panel lives under composer/components.",
);

expectContains(
  "features/darken-location/map-generator/map-generator.debug-options.js",
  "MAP_DEBUG_CATEGORY_DEFINITIONS",
  "debug registry declares category definitions",
);
expectContains(
  "features/darken-location/map-generator/map-generator.debug-options.js",
  "MAP_QA_SCENARIO_DEFINITIONS",
  "debug registry declares QA scenario definitions",
);
expectContains(
  "features/darken-location/map-generator/map-generator.debug-options.js",
  'id: "levels"',
  "debug registry includes Levels / Stairs category",
);
expectContains(
  "features/darken-location/map-generator/map-generator.debug-options.js",
  'id: "level-stairs"',
  "debug registry includes Room Level → Stairs scenario",
);
expectContains(
  "features/darken-location/map-generator/map-generator.debug-options.js",
  'id: "level-view"',
  "debug registry includes Level View scenario",
);

expectContains(
  "features/darken-location/composer/components/LocationMapDetailsPanel.jsx",
  "../../map-generator/map-generator.debug-options.js",
  "Composer debug panel imports the shared map debug registry",
);
expectNotRegex(
  "features/darken-location/composer/components/LocationMapDetailsPanel.jsx",
  /const\s+MAP_QA_SCENARIO_OPTIONS\s*=\s*\[/,
  "Composer debug panel does not duplicate local QA scenario arrays",
);
expectNotRegex(
  "features/darken-location/composer/components/LocationMapDetailsPanel.jsx",
  /const\s+MAP_DEBUG_CATEGORY_OPTIONS\s*=\s*\[/,
  "Composer debug panel does not duplicate local debug category arrays",
);
expectNotRegex(
  "features/darken-location/composer/components/LocationMapDetailsPanel.jsx",
  /function\s+getMapDebugCategory\s*\(/,
  "Composer debug panel does not duplicate getMapDebugCategory",
);
expectContains(
  "features/darken-location/composer/components/LocationMapDetailsPanel.jsx",
  "data-debug-scenario={scenario.id}",
  "Composer runner exposes data-debug-scenario attributes",
);
expectContains(
  "features/darken-location/composer/components/LocationMapDetailsPanel.jsx",
  "data-debug-category={category.id}",
  "Composer recorder exposes data-debug-category attributes",
);

expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "./map-generator.debug-options.js",
  "Map editor imports the shared map debug registry",
);
expectNotRegex(
  "features/darken-location/map-generator/map-generator.page.jsx",
  /const\s+MAP_QA_SCENARIO_OPTIONS\s*=\s*\[/,
  "Map editor does not duplicate local QA scenario arrays",
);
expectNotRegex(
  "features/darken-location/map-generator/map-generator.page.jsx",
  /const\s+MAP_DEBUG_CATEGORY_OPTIONS\s*=\s*\[/,
  "Map editor does not duplicate local debug category arrays",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  'scenarioId === "level-stairs"',
  "Map editor handles Room Level → Stairs scenario",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  'scenarioId === "level-view"',
  "Map editor handles Level View scenario",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  'id="level-view"',
  "Map editor exposes Level View UI control",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "ROOM_LEVEL_MENU_OPTIONS",
  "Map editor exposes room level menu options",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "CORRIDOR_WAYPOINT_INSERT_DRAG_THRESHOLD_PX",
  "Corridor waypoint insertion uses an explicit drag threshold",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "clicking a corridor insertion handle does not create a waypoint",
  "Vitest covers click-safe corridor waypoint insertion",
);
expectContains(
  "features/darken-location/map-generator/map-generator.corridors.js",
  "createSelfAvoidingSegmentBlockedSet",
  "Waypoint routing blocks cells already traversed by the same corridor",
);
expectContains(
  "features/darken-location/map-generator/map-generator.corridors.js",
  "isSelfAvoidingPathThroughPoints",
  "Corridor routing exposes the self-avoiding continuity contract",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "canCommitCorridorWaypointRoute",
  "Map editor rejects waypoint commits with invalid route continuity",
);
expectContains(
  "features/darken-location/map-generator/map-generator.debug.js",
  '"corridor-paths-are-continuous"',
  "Generated-map validation checks corridor continuity and self-overlap",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "keeps the reported corridor anchor route continuous instead of creating a dead end",
  "Vitest covers the reported waypoint dead-end regression",
);
expectContains(
  "features/darken-location/map-generator/map-generator.mask.js",
  "computeCorridorSelfSeparationWallSegments",
  "Dungeon mask preserves walls between adjacent non-consecutive corridor runs",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "keeps an internal wall between adjacent non-consecutive S-corridor runs",
  "Vitest covers folded S-corridor wall separation",
);

expectContains(
  "features/darken-location/map-generator/map-generator.corridors.js",
  "derivedFromRoomLevels",
  "Corridor metadata supports stairs derived from room levels",
);
expectContains(
  "features/darken-location/map-generator/map-generator.corridors.js",
  "stairCount",
  "Corridor metadata exposes stairCount",
);
expectContains(
  "features/darken-location/map-generator/map-generator.state.js",
  "createEditorStairLevelOverrides",
  "State helpers preserve editor stair level overrides",
);
expectContains(
  "features/darken-location/map-generator/map-generator.render.jsx",
  "createLevelFilteredMap",
  "Render layer exposes level-filtered maps",
);
expectContains(
  "features/darken-location/map-generator/map-generator.render.jsx",
  "corridor-level-shift__badge",
  "Render layer exposes cross-level corridor badges",
);
expectContains(
  "features/darken-location/map-generator/map-generator.render.jsx",
  "stair-mark--derived-room-level",
  "Render layer marks stairs derived from room levels",
);
expectContains(
  "features/darken-location/map-generator/map-generator.render.jsx",
  "getMapStairMarkerEditorHandles",
  "Render layer exposes selectable stair marker handles",
);
expectContains(
  "features/darken-location/map-generator/map-generator.render.jsx",
  "data-stair-marker-id",
  "Rendered stair markers expose stable editor identities",
);
expectContains(
  "features/darken-location/map-generator/map-generator.render.jsx",
  "renderOptions.showStairArrows === true",
  "Stair direction arrows are opt-in at render time",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  'const [wallDrawingStyle, setWallDrawingStyle] = useState("precise")',
  "Map editor defaults wall drawing to Precise",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "const rootWidth = 210",
  "Map Style root menu uses the widened shared width",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "const flyoutWidth = 210",
  "Map Style flyouts match the root menu width",
);
expectContains(
  "features/darken-location/map-generator/map-generator.styles.css",
  '.location-map-toolbar__style-panel[data-style-floating="portal"]::before',
  "Map Style root glass uses a pseudo-element so nested flyouts retain backdrop filtering",
);
expectContains(
  "features/darken-location/map-generator/map-generator.styles.css",
  '-webkit-backdrop-filter: blur(18px) saturate(128%)',
  "Map Style dropdown glass keeps the WebKit backdrop-filter fallback",
);
expectContains(
  "features/darken-location/map-generator/map-generator.export.js",
  "normalized.showStairArrows = source.showStairArrows === true",
  "Map state normalizes stair-arrow visibility",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "selectedStairMarkerId",
  "Map editor owns stair marker selection state",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "onStairMarkerPointerDown",
  "Map editor wires stair marker pointer selection",
);
expectContains(
  "features/darken-location/map-generator/map-generator.render.jsx",
  "getClosestCorridorStairMarkerDragTarget",
  "Render layer constrains stair marker drags to valid corridor targets",
);
expectContains(
  "features/darken-location/map-generator/map-generator.state.js",
  "createStairMarkerPositionOverride",
  "State layer normalizes persistent stair marker positions",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "manualOverrides?.stairMarkers",
  "Map editor resolves stair marker positions from manual overrides",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "onStairMarkerMove",
  "Map editor persists valid stair marker drops",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "drag:end stair marker",
  "Map editor records stair marker drag completion",
);
expectContains(
  "features/darken-location/map-generator/map-generator.state.js",
  "createStairMarkerRemovalOverride",
  "State layer exposes stair marker removal tombstones",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "Reset Position",
  "Stair marker context menu exposes position reset",
);
expectContains(
  "features/darken-location/map-generator/map-generator.page.jsx",
  "Remove Stair Marker",
  "Stair marker context menu exposes marker removal",
);
expectContains(
  "features/darken-location/map-generator/map-generator.render.jsx",
  "markerPositions?.[markerId]?.removed === true",
  "Render layer suppresses removed stair markers",
);
expectContains(
  "features/darken-location/map-generator/map-generator.render.jsx",
  "data-level-view",
  "SVG root exposes level-view metadata",
);
expectContains(
  "features/darken-location/map-generator/map-generator.export.js",
  "exportManifest",
  "Map state export includes export manifest",
);
expectContains(
  "features/darken-location/map-generator/map-generator.export.js",
  "normalizeMapUiState",
  "Map export/import normalizes Level View UI state",
);
expectContains(
  "features/darken-location/map-generator/map-generator.export.js",
  "data-export-mode",
  "SVG export annotates export mode",
);
expectContains(
  "features/darken-location/map-generator/map-generator.export.js",
  "data-export-player-safe",
  "Player SVG export is explicitly marked player-safe",
);
expectContains(
  "features/darken-location/map-generator/map-generator.debug.js",
  "level-transition-metadata-consistent",
  "Debug validation checks level transition consistency",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "keeps map debug runner options centralized for editor and composer",
  "Vitest covers shared debug runner registry",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "can derive stair markers from manually assigned room levels when enabled",
  "Vitest covers room-level derived stairs",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "defaults map walls to precise and keeps style menu widths aligned",
  "Vitest covers map style defaults and aligned menu sizing",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "hides stair direction arrows by default and renders them when enabled",
  "Vitest covers opt-in stair direction arrows",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "renders stair selection hit zones and a selected marker highlight",
  "Vitest covers stair selection overlay rendering",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "snaps stair marker drags to free corridor cells including door-adjacent endpoints without changing topology",
  "Vitest covers constrained stair marker drag snapping at door-adjacent endpoints",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "persists stair marker positions as render-only manual overrides",
  "Vitest covers persistent stair marker overrides",
);
expectContains(
  "features/darken-location/map-generator/map-generator.export.js",
  "manualStairMarkers",
  "Map state manifest counts persistent stair markers",
);
expectContains(
  "features/darken-location/map-generator/map-generator.export.js",
  "manualPositionedStairMarkers",
  "Map state manifest distinguishes positioned stair markers",
);
expectContains(
  "features/darken-location/map-generator/map-generator.export.js",
  "manualRemovedStairMarkers",
  "Map state manifest distinguishes removed stair markers",
);
expectContains(
  "features/darken-location/map-generator/map-generator.state.js",
  "if (removed)",
  "Imported stair removal tombstones discard stale position data",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "hardens map state export manifest and level UI state",
  "Vitest covers export/import hardening",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "round-trips positioned and removed stair markers without duplication",
  "Vitest covers positioned and removed stair round trips",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "canonicalizes legacy and malformed stair marker overrides during import",
  "Vitest covers legacy and malformed stair imports",
);
expectContains(
  "package.json",
  '"qa:circle-connectors"',
  "package exposes circle connector QA",
);
expectContains(
  "package.json",
  '"qa:maps:debug"',
  "package exposes map debug QA",
);
expectContains(
  "package.json",
  '"test:run"',
  "package exposes test:run",
);
expectContains(
  "package.json",
  '"build"',
  "package exposes build",
);

const passedCount = checks.filter((check) => check.passed).length;
const failedCount = checks.length - passedCount;
const reportLines = [
  "# Dark Places Acceptance QA",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Working directory: ${rootDir}`,
  "",
  "## Summary",
  "",
  `- Checks: ${checks.length}`,
  `- Passed: ${passedCount}`,
  `- Failed: ${failedCount}`,
  "",
  "## Checks",
  "",
  ...checks.map((check) => `- ${check.passed ? "✅" : "❌"} ${check.label}${check.detail ? ` — ${check.detail}` : ""}`),
  "",
];

mkdirSync(reportDir, { recursive: true });
writeFileSync(reportPath, `${reportLines.join("\n")}\n`, "utf8");

console.log(`Dark Places Acceptance QA: ${failedCount} issue${failedCount === 1 ? "" : "s"}.`);
console.log(`Report: ${reportPath}`);

if (issues.length) {
  for (const issue of issues) {
    console.error(`- ${issue.label}${issue.detail ? `: ${issue.detail}` : ""}`);
  }
  process.exitCode = 1;
}
