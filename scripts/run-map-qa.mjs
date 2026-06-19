import { mkdir, writeFile } from "node:fs/promises";
import { buildMapAdapterQaMarkdown, buildMapBatchQaMarkdown, runMapAdapterQa, runMapBatchQa } from "../features/darken-location/map-generator/qa/map-batch-qa.js";

const OUTPUT_DIR = new URL("../dist/qa/", import.meta.url);
const failOnWarnings = process.argv.includes("--fail-on-warnings");
const adapterQa = process.argv.includes("--adapter-qa") || process.argv.includes("--adapter-harness");

function getArgValue(name, fallback) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const qaMode = process.argv.includes("--debug")
  ? "debug"
  : getArgValue("mode", "realistic");

const baseOptions = {
  count: getArgValue("count", 50),
  roomCountMin: getArgValue("room-min", 4),
  roomCountMax: getArgValue("room-max", 12),
  seed: getArgValue("seed", "cruor-map-npm-qa"),
  qaMode,
  themeId: getArgValue("theme", "mixed"),
  context: getArgValue("context", "mixed"),
  determinism: getArgValue("determinism", adapterQa ? "off" : "sample"),
  determinismSampleRate: getArgValue("determinism-sample-rate", 10),
};

const report = adapterQa
  ? runMapAdapterQa({
      ...baseOptions,
      adapterModes: getArgValue("adapters", "off,crypt,mine,ruins,noble-house"),
    })
  : runMapBatchQa({
      ...baseOptions,
      contextGraphAdapterMode: getArgValue("graph-adapter", getArgValue("adapter", "off")),
    });

await mkdir(OUTPUT_DIR, { recursive: true });

if (adapterQa) {
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
