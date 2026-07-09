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
  "derives stair markers from manually assigned room levels",
  "Vitest covers room-level derived stairs",
);
expectContains(
  "features/darken-location/map-generator/map-generator.pipeline.test.js",
  "hardens map state export manifest and level UI state",
  "Vitest covers export/import hardening",
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
