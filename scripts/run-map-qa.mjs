import { mkdir, writeFile } from "node:fs/promises";
import { buildMapBatchQaMarkdown, runMapBatchQa } from "../features/darken-location/map-generator/qa/map-batch-qa.js";

const OUTPUT_DIR = new URL("../dist/qa/", import.meta.url);
const failOnWarnings = process.argv.includes("--fail-on-warnings");

function getArgValue(name, fallback) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

const qaMode = process.argv.includes("--debug")
  ? "debug"
  : getArgValue("mode", "realistic");

const report = runMapBatchQa({
  count: getArgValue("count", 50),
  roomCountMin: getArgValue("room-min", 4),
  roomCountMax: getArgValue("room-max", 12),
  seed: getArgValue("seed", "cruor-map-npm-qa"),
  qaMode,
  themeId: getArgValue("theme", "mixed"),
  context: getArgValue("context", "mixed"),
  determinism: getArgValue("determinism", "sample"),
  determinismSampleRate: getArgValue("determinism-sample-rate", 10),
});

await mkdir(OUTPUT_DIR, { recursive: true });
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
