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

  if (error || (failOnWarnings && warning)) {
    process.exitCode = 1;
  }
}
