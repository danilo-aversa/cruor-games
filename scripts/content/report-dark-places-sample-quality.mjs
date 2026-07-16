import { runDarkPlacesSemanticSampleQa } from "../../features/inspiration-studio/qa/dark-places-semantic-sample-qa.js";
import {
  formatSummary,
  parseCliOptions,
  selectSemanticModules,
} from "./inspiration-v2-script-utils.mjs";

const options = parseCliOptions();
const selected = selectSemanticModules(String(options.module || ""));
let failed = false;

if (!selected.length) {
  console.error(
    "[error] No canonical semantic modules matched the requested scope.",
  );
  process.exitCode = 1;
} else {
  selected
    .filter(({ module }) => module.capabilities.includes("dark-places"))
    .forEach(({ pack, module }) => {
      const report = runDarkPlacesSemanticSampleQa({ pack, module });
      console.log(formatSummary(`${module.id} sample QA`, report.summary));
      report.results.forEach((result) =>
        console.log(
          `[${result.status}] ${result.id}: ${result.roomCount} rooms; fingerprint ${result.fingerprint}; diagnostics ${result.diagnostics.total}`,
        ),
      );
      const hasWarnings = report.summary.warning > 0;
      if (
        !report.passed ||
        report.summary.error > 0 ||
        report.summary.determinismFailures > 0 ||
        (options["fail-on-warnings"] && hasWarnings) ||
        report.results.some((result) => result.roomCount < 5)
      ) {
        failed = true;
      }
    });
  if (failed) process.exitCode = 1;
}
