import { mkdir, writeFile } from "node:fs/promises";
import {
  analyzeMapThemeCueSvg,
  analyzeMapVisualCueSvg,
  buildMapAdapterQaMarkdown,
  buildMapBatchQaMarkdown,
  buildMapVisualQaGalleryHtml,
  buildMapVisualQaMarkdown,
  runMapAdapterQa,
  runMapBatchQa,
  runMapVisualQa,
  serializeMapVisualQaReport,
} from "../features/darken-location/map-generator/qa/map-batch-qa.js";
import { DEFAULT_CONFIG } from "../features/darken-location/map-generator/map-generator.input.js";
import { generateMap } from "../features/darken-location/map-generator/map-generator.pipeline.js";

const OUTPUT_DIR = new URL("../dist/qa/", import.meta.url);
const VISUAL_PREVIEW_DIR = new URL("map-visual-previews/", OUTPUT_DIR);
const failOnWarnings = process.argv.includes("--fail-on-warnings");
const adapterQa = process.argv.includes("--adapter-qa") || process.argv.includes("--adapter-harness");
const visualQa = process.argv.includes("--visual-qa") || process.argv.includes("--visual-preview-qa");

function getArgValue(name, fallback) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function getBooleanArg(name, fallback = true) {
  const value = getArgValue(name, null);
  if (value == null) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  return fallback;
}

const qaMode = process.argv.includes("--debug")
  ? "debug"
  : getArgValue("mode", "realistic");

const baseOptions = {
  count: getArgValue("count", 50),
  roomCountMin: getArgValue("room-min", 4),
  roomCountMax: getArgValue("room-max", 12),
  seed: getArgValue("seed", visualQa ? "cruor-map-visual-qa" : "cruor-map-npm-qa"),
  qaMode,
  themeId: getArgValue("theme", "mixed"),
  context: getArgValue("context", "mixed"),
  determinism: getArgValue("determinism", adapterQa ? "off" : "sample"),
  determinismSampleRate: getArgValue("determinism-sample-rate", 10),
};

const manualMoveQa = getBooleanArg("manual-move-qa", qaMode === "debug");

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cellKey(cellOrX, y) {
  if (typeof cellOrX === "object") return `${cellOrX.x},${cellOrX.y}`;
  return `${cellOrX},${y}`;
}

function getCellList(item) {
  if (!item || typeof item !== "object") return [];
  if (Array.isArray(item.floorCells) && item.floorCells.length > 0) return item.floorCells;
  if (Array.isArray(item.pathCells) && item.pathCells.length > 0) return item.pathCells;
  if (Array.isArray(item.cells) && item.cells.length > 0) return item.cells;
  return [];
}

function buildFloorCellComponentMap(map) {
  const cells = new Map();
  const cellSources = new Map();
  const addCellSource = (cell, source) => {
    if (!Number.isFinite(cell?.x) || !Number.isFinite(cell?.y)) return;
    const key = cellKey(cell);
    cells.set(key, { x: cell.x, y: cell.y });
    const sources = cellSources.get(key) || { rooms: new Set(), corridors: new Set() };
    if (source?.roomId) sources.rooms.add(source.roomId);
    if (source?.corridorId) sources.corridors.add(source.corridorId);
    cellSources.set(key, sources);
  };
  asArray(map?.regions).forEach((region) => {
    getCellList(region).forEach((cell) => addCellSource(cell, { roomId: region.id }));
  });
  asArray(map?.corridors).forEach((corridor) => {
    getCellList(corridor).forEach((cell) => addCellSource(cell, { corridorId: corridor.id }));
  });

  const componentByCell = new Map();
  let componentId = 0;
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  for (const [startKey, startCell] of cells.entries()) {
    if (componentByCell.has(startKey)) continue;
    componentId += 1;
    const queue = [startCell];
    componentByCell.set(startKey, componentId);
    while (queue.length) {
      const cell = queue.shift();
      directions.forEach(([dx, dy]) => {
        const nextKey = cellKey(cell.x + dx, cell.y + dy);
        if (!cells.has(nextKey) || componentByCell.has(nextKey)) return;
        componentByCell.set(nextKey, componentId);
        queue.push(cells.get(nextKey));
      });
    }
  }
  const componentSources = new Map();
  componentByCell.forEach((component, key) => {
    const sources = cellSources.get(key);
    const entry = componentSources.get(component) || { component, cellCount: 0, rooms: new Set(), corridors: new Set(), sampleCells: [] };
    entry.cellCount += 1;
    if (entry.sampleCells.length < 8) entry.sampleCells.push(key);
    sources?.rooms?.forEach((roomId) => entry.rooms.add(roomId));
    sources?.corridors?.forEach((corridorId) => entry.corridors.add(corridorId));
    componentSources.set(component, entry);
  });
  return { componentByCell, componentCount: componentId, componentSources };
}

function getRegionComponentIds(region, componentByCell) {
  return [
    ...new Set(
      getCellList(region)
        .map((cell) => componentByCell.get(cellKey(cell)))
        .filter(Number.isFinite),
    ),
  ];
}

function validatePhysicalFloorConnectivity(map, mapId) {
  const regions = asArray(map?.regions);
  if (regions.length <= 1) return [];
  const { componentByCell, componentCount, componentSources } = buildFloorCellComponentMap(map);
  if (componentCount <= 1) return [];
  const issues = [];
  const entranceComponent = getRegionComponentIds(regions[0], componentByCell)[0];
  const disconnectedRooms = regions
    .map((region) => ({
      id: region.id,
      components: getRegionComponentIds(region, componentByCell),
    }))
    .filter((row) => !row.components.includes(entranceComponent));
  if (disconnectedRooms.length) {
    issues.push({
      id: mapId,
      severity: "error",
      area: "routing",
      check: "physical-floor-connectivity",
      message: "One or more rooms are not connected to the entrance through the physical floor/corridor cell network.",
      data: { componentCount, entranceComponent, disconnectedRooms },
    });
  }
  const orphanComponents = [...(componentSources?.values?.() || [])]
    .filter((component) => component.rooms.size === 0 && component.corridors.size > 0)
    .map((component) => ({
      component: component.component,
      cellCount: component.cellCount,
      corridors: [...component.corridors].slice(0, 12),
      sampleCells: component.sampleCells,
    }));
  if (orphanComponents.length) {
    issues.push({
      id: mapId,
      severity: "error",
      area: "routing",
      check: "orphan-corridor-floor",
      message: "One or more corridor floor components are disconnected from every room.",
      data: { componentCount, orphanComponents },
    });
  }
  return issues;
}

function getContextSamples(context = "mixed") {
  const contexts = ["Crypt", "Chapel", "Cave", "Mine", "Noble House", "Ruins"];
  const requested = String(context || "mixed").trim().toLowerCase();
  if (requested === "mixed") return contexts;
  return contexts.filter((item) => item.toLowerCase() === requested) || contexts;
}

function clampInteger(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function runManualMovePhysicalQa(options = {}) {
  const contexts = getContextSamples(options.context);
  const sampleCount = clampInteger(options.count, 1, 30, 8);
  const roomMin = clampInteger(options.roomCountMin, 3, 14, 4);
  const roomMax = clampInteger(options.roomCountMax, roomMin, 14, 8);
  const issues = [];
  const samples = [];
  for (let index = 0; index < sampleCount; index += 1) {
    const context = contexts[index % Math.max(1, contexts.length)] || "Crypt";
    const roomCount = roomMin + (index % Math.max(1, roomMax - roomMin + 1));
    const seed = `${options.seed || "cruor-map-manual-move-qa"}-manual-${String(index + 1).padStart(3, "0")}`;
    const baseMap = generateMap({
      ...DEFAULT_CONFIG,
      seed,
      context,
      biome: context,
      roomCount,
      contextGraphAdapterMode: options.contextGraphAdapterMode || "safe",
    });
    const movableRegion = asArray(baseMap.regions).find((region, regionIndex) => regionIndex > 0 && region?.cellRect);
    if (!movableRegion?.cellRect) continue;
    const attempts = [
      { x: -2, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: -2 },
      { x: 0, y: 2 },
    ];
    attempts.forEach((delta, attemptIndex) => {
      const targetPosition = {
        x: Math.max(1, Number(movableRegion.cellRect.x) + delta.x),
        y: Math.max(1, Number(movableRegion.cellRect.y) + delta.y),
      };
      const movedMap = generateMap({
        ...(baseMap.config || {}),
        seed,
        manualRoomPositions: { [movableRegion.id]: targetPosition },
      });
      const mapId = `manual-move-qa-${String(index + 1).padStart(3, "0")}-${attemptIndex + 1}`;
      const sampleIssues = validatePhysicalFloorConnectivity(movedMap, mapId);
      issues.push(...sampleIssues);
      samples.push({
        id: mapId,
        seed,
        context,
        roomCount,
        movedRegionId: movableRegion.id,
        targetPosition,
        issueCount: sampleIssues.length,
        status: sampleIssues.some((issue) => issue.severity === "error") ? "failed" : "passed",
      });
    });
  }
  return {
    reportType: "cruor-map-manual-move-physical-qa-report",
    generatedAt: new Date().toISOString(),
    options: { count: sampleCount, roomCountMin: roomMin, roomCountMax: roomMax, context: options.context },
    summary: {
      samples: samples.length,
      total: issues.length,
      error: issues.filter((issue) => issue.severity === "error").length,
      warning: issues.filter((issue) => issue.severity === "warning").length,
      info: issues.filter((issue) => issue.severity === "info").length,
    },
    samples,
    issues,
  };
}

async function writeManualMoveQaReport() {
  if (!manualMoveQa || visualQa || adapterQa) return null;
  const report = runManualMovePhysicalQa({
    ...baseOptions,
    count: getArgValue("manual-move-count", 8),
    contextGraphAdapterMode: getArgValue("graph-adapter", getArgValue("adapter", "safe")),
  });
  await writeFile(new URL("map-manual-move-qa-report.json", OUTPUT_DIR), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  const { total, error, warning, info } = report.summary;
  console.log(`Map Manual Move QA: ${total} issues (${error} errors, ${warning} warnings, ${info} info).`);
  report.issues.slice(0, 20).forEach((issue) => {
    console.log(`[${issue.severity}] ${issue.area}/${issue.check}: ${issue.message} — ${issue.id}`);
  });
  if (error || (failOnWarnings && warning)) process.exitCode = 1;
  return report;
}

async function renderVisualPreviewSvgs(report) {
  await mkdir(VISUAL_PREVIEW_DIR, { recursive: true });

  const [{ createServer }, React, ReactDOMServer] = await Promise.all([
    import("vite"),
    import("react"),
    import("react-dom/server"),
  ]);

  const vite = await createServer({
    appType: "custom",
    logLevel: "error",
    optimizeDeps: {
      entries: [],
      noDiscovery: true,
    },
    server: { middlewareMode: true },
  });

  try {
    const { MapSvg } = await vite.ssrLoadModule("/features/darken-location/map-generator/map-generator.render.jsx");
    for (const preview of report.previews || []) {
      if (!preview.generatedMap) continue;
      const element = React.createElement(MapSvg, {
        generatedMap: preview.generatedMap,
        showGrid: report.options?.showGrid ?? true,
        gridStyle: "standard",
        showEditor: false,
        showNames: report.options?.showNames ?? true,
        showRoomBadges: true,
        showProps: report.options?.showProps ?? true,
        gridOpacity: 0.72,
      });
      const svg = ReactDOMServer.renderToStaticMarkup(element);
      preview.visualCueUsage = analyzeMapVisualCueSvg(svg, preview);
      preview.themeCueUsage = analyzeMapThemeCueSvg(svg, preview);
      const content = `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`;
      await writeFile(new URL(preview.filename, VISUAL_PREVIEW_DIR), content, "utf8");
      preview.svgPath = `dist/qa/map-visual-previews/${preview.filename}`;
    }
  } finally {
    await vite.close();
  }
}

await mkdir(OUTPUT_DIR, { recursive: true });

if (visualQa) {
  const report = runMapVisualQa({
    ...baseOptions,
    samplesPerContext: getArgValue("samples", getArgValue("samples-per-context", 2)),
    roomCountMin: getArgValue("room-min", 6),
    roomCountMax: getArgValue("room-max", 10),
    theme: getArgValue("visual-theme", getArgValue("theme", "mixed")),
    samplesPerTheme: getArgValue("theme-samples", getArgValue("samples-per-theme", getArgValue("samples", 2))),
    contextGraphAdapterMode: getArgValue("graph-adapter", getArgValue("adapter", "safe")),
    showGrid: getBooleanArg("show-grid", true),
    showNames: getBooleanArg("show-names", true),
    showProps: getBooleanArg("show-props", true),
  });
  await renderVisualPreviewSvgs(report);
  const serializableReport = serializeMapVisualQaReport(report);
  await writeFile(new URL("map-visual-qa-report.json", OUTPUT_DIR), `${JSON.stringify(serializableReport, null, 2)}\n`, "utf8");
  await writeFile(new URL("map-visual-qa-report.md", OUTPUT_DIR), `${buildMapVisualQaMarkdown(serializableReport)}\n`, "utf8");
  await writeFile(new URL("index.html", VISUAL_PREVIEW_DIR), buildMapVisualQaGalleryHtml(serializableReport), "utf8");
  console.log(`Map Visual QA: ${serializableReport.summary?.totalPreviews || 0} SVG previews.`);
  console.log("[gallery] dist/qa/map-visual-previews/index.html");
  serializableReport.previews.forEach((preview) => {
    const usage = preview.adapterUsage || {};
    const visualCueUsage = preview.visualCueUsage || {};
    const themeCueUsage = preview.themeCueUsage || {};
    const visualCueText = `${visualCueUsage.status || "unknown"}; cues ${visualCueUsage.renderedCount || 0}`;
    const themeCueText = preview.themeKey
      ? `; theme ${themeCueUsage.status || "unknown"}; theme cues ${themeCueUsage.renderedCount || 0}`
      : "";
    console.log(`[preview] ${preview.label}: ${preview.roomCount} rooms; adapter ${usage.status || "baseline"}; visual ${visualCueText}${themeCueText}; ${preview.svgPath}.`);
  });
} else if (adapterQa) {
  const report = runMapAdapterQa({
    ...baseOptions,
    adapterModes: getArgValue("adapters", "off,safe,crypt,mine,ruins,noble-house"),
  });
  await writeFile(new URL("map-adapter-qa-report.json", OUTPUT_DIR), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(new URL("map-adapter-qa-report.md", OUTPUT_DIR), `${buildMapAdapterQaMarkdown(report)}\n`, "utf8");
  console.log(`Map Adapter QA: ${report.comparisons.length} adapter comparisons.`);
  report.variants.forEach((variant) => {
    const { error = 0, warning = 0, total = 0 } = variant.summary || {};
    const usage = variant.adapterUsage || {};
    const usageText = `used ${usage.used || 0}; fallback ${usage.fallback || 0}; n/a ${usage.notApplicable || 0}`;
    console.log(`[variant] ${variant.label}: ${total} issues (${error} errors, ${warning} warnings); ${usageText}.`);
  });
  report.comparisons.forEach((comparison) => {
    const delta = comparison.delta || {};
    const usage = comparison.adapterUsage || {};
    const usageText = `used ${usage.used || 0}; fallback ${usage.fallback || 0}; n/a ${usage.notApplicable || 0}`;
    console.log(`[compare] ${comparison.label}: ${comparison.recommendation}; ${usageText}; Δwarnings ${delta.warnings || 0}; Δerrors ${delta.errors || 0}; Δscore ${delta.averageOverallQaScore || 0}.`);
  });
  if (report.comparisons.some((comparison) => comparison.delta?.errors > 0)) {
    process.exitCode = 1;
  }
} else {
  const report = runMapBatchQa({
    ...baseOptions,
    contextGraphAdapterMode: getArgValue("graph-adapter", getArgValue("adapter", "off")),
  });
  await writeFile(new URL("map-qa-report.json", OUTPUT_DIR), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(new URL("map-qa-report.md", OUTPUT_DIR), `${buildMapBatchQaMarkdown(report)}\n`, "utf8");

  const { total, error, warning, info } = report.summary;
  console.log(`Map QA: ${total} issues (${error} errors, ${warning} warnings, ${info} info).`);

  report.groupedIssues.slice(0, 20).forEach((group) => {
    const ids = group.ids.length ? ` — ${group.ids.join(", ")}` : "";
    console.log(`[${group.severity}] ${group.count}× ${group.area}/${group.check}: ${group.message}${ids}`);
  });

  await writeManualMoveQaReport();

  if (error || (failOnWarnings && warning)) {
    process.exitCode = 1;
  }
}
