import { mkdir, writeFile } from "node:fs/promises";
import { runMonsterQaSuite } from "../features/monster-composer/qa/monster-qa-suite.js";

const OUTPUT_DIR = new URL("../dist/qa/", import.meta.url);
const failOnWarnings = process.argv.includes("--fail-on-warnings");
const report = runMonsterQaSuite({ failOnWarnings, mode: "npm-script" });

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(new URL("monster-qa-report.json", OUTPUT_DIR), `${JSON.stringify(report, null, 2)}\n`, "utf8");

const { total, error, warning, info } = report.summary;
console.log(`Monster QA: ${total} issues (${error} errors, ${warning} warnings, ${info} info).`);

report.groupedIssues.slice(0, 20).forEach((group) => {
  const ids = group.ids.length ? ` — ${group.ids.join(", ")}` : "";
  console.log(`[${group.severity}] ${group.count}× ${group.area}/${group.check}: ${group.message}${ids}`);
});

if (error || (failOnWarnings && warning)) {
  process.exitCode = 1;
}
