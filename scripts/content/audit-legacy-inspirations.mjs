import {
  CRUOR_INSPIRATION_MODULES,
  buildInspirationV2MigrationAudit,
} from "../../shared/content/content.index.js";
import {
  formatSummary,
  parseCliOptions,
} from "./inspiration-v2-script-utils.mjs";

const options = parseCliOptions();
const expectedV2 = String(options["expect-v2"] || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const report = buildInspirationV2MigrationAudit(CRUOR_INSPIRATION_MODULES);
const issues = [
  ...report.rows
    .filter((row) => !row.found)
    .map((row) => `Missing tracked Inspiration module: ${row.moduleId}`),
  ...expectedV2
    .filter(
      (moduleId) =>
        !report.rows.some(
          (row) => row.moduleId === moduleId && row.canonical && !row.fallback,
        ),
    )
    .map((moduleId) => `Expected canonical v2 module not found: ${moduleId}`),
];

console.log(formatSummary("Inspiration v2 migration audit", report.summary));
report.rows.forEach((row) => {
  console.log(
    `[${row.observedSourceMode}] ${row.moduleId}: ${row.migrationStatus}; ${row.editorialStatus}`,
  );
});

if (issues.length) {
  issues.forEach((issue) => console.error(`[error] ${issue}`));
  process.exitCode = 1;
}
