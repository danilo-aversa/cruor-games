import { buildStudioSemanticCoverage } from "../../features/inspiration-studio/model/studio-semantic-coverage.js";
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
  selected.forEach(({ module }) => {
    const report = buildStudioSemanticCoverage(module);
    console.log(
      formatSummary(`${module.id} semantic coverage`, report.summary),
    );
    report.issues.forEach((issue) =>
      console.error(`[${issue.severity}] ${issue.path}: ${issue.message}`),
    );
    if (!report.ready || report.issues.length) failed = true;
  });
  if (failed) process.exitCode = 1;
}
