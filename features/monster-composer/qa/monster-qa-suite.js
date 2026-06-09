import { runMonsterContentQa } from "./monster-content-qa.js";
import { runMonsterFrameFitDiversityQa, runMonsterFrameScalingQa, runMonsterGenerationQa } from "./monster-generation-qa.js";
import { runMonsterPresetQa } from "./monster-preset-qa.js";
import { buildQaReport } from "./monster-qa-report.js";

export { groupQaIssues, summarizeQaIssues } from "./monster-qa-report.js";
export { runMonsterContentQa } from "./monster-content-qa.js";
export { runMonsterFrameFitDiversityQa, runMonsterFrameScalingQa, runMonsterGenerationQa } from "./monster-generation-qa.js";
export { runMonsterPresetQa } from "./monster-preset-qa.js";

export function runMonsterQaSuite(options = {}) {
  const suites = [
    runMonsterContentQa(options),
    runMonsterPresetQa(options),
    runMonsterFrameScalingQa(options),
    runMonsterFrameFitDiversityQa(options),
    runMonsterGenerationQa(options),
  ];

  return buildQaReport({
    suites,
    metadata: {
      mode: options.mode || "static-local",
      failOnWarnings: Boolean(options.failOnWarnings),
    },
  });
}
