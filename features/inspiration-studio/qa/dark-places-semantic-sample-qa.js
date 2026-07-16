import {
  compileStudioDarkPlacesPreview,
  normalizeStudioPreviewControls,
} from "../model/studio-dark-places-preview.js";

export const DARK_PLACES_SEMANTIC_SAMPLE_QA_VERSION =
  "dark-places-semantic-sample-qa-v1";

export const DEFAULT_DARK_PLACES_SEMANTIC_QA_CASES = Object.freeze([
  {
    id: "crypt-baseline",
    seed: "studio-semantic-qa-crypt-001",
    context: "Crypt",
    intrusion: "Medium",
    roomCount: 5,
    selectedRoomRole: "entrance",
  },
  {
    id: "chapel-pressure",
    seed: "studio-semantic-qa-chapel-001",
    context: "Chapel",
    intrusion: "High",
    roomCount: 7,
    selectedRoomRole: "clue",
  },
  {
    id: "archive-low-intrusion",
    seed: "studio-semantic-qa-archive-001",
    context: "Archive",
    intrusion: "Low",
    roomCount: 6,
    selectedRoomRole: "connector",
  },
]);

function countDiagnostics(diagnostics = []) {
  return diagnostics.reduce(
    (summary, issue) => {
      const severity = issue.severity || "warning";
      summary.total += 1;
      summary[severity] = (summary[severity] || 0) + 1;
      return summary;
    },
    { total: 0, error: 0, warning: 0, info: 0 },
  );
}

export function runDarkPlacesSemanticSampleQa({
  cases = DEFAULT_DARK_PLACES_SEMANTIC_QA_CASES,
  module,
  pack,
} = {}) {
  const results = cases.map((testCase) => {
    const controls = normalizeStudioPreviewControls(testCase);
    const first = compileStudioDarkPlacesPreview({ pack, module, controls });
    const second = compileStudioDarkPlacesPreview({ pack, module, controls });
    const deterministic = first.bytes === second.bytes;
    const diagnostics = countDiagnostics(first.diagnostics);
    const passed = first.status === "ready" && deterministic;
    return {
      id: testCase.id,
      controls,
      status: passed ? "passed" : "failed",
      compilerStatus: first.status,
      deterministic,
      fingerprint: first.fingerprint,
      roomCount: first.document?.rooms?.length || 0,
      diagnostics,
      issues: first.diagnostics,
    };
  });

  const summary = results.reduce(
    (result, entry) => {
      result.total += 1;
      result[entry.status] += 1;
      result.error += entry.diagnostics.error;
      result.warning += entry.diagnostics.warning;
      if (!entry.deterministic) result.determinismFailures += 1;
      return result;
    },
    {
      total: 0,
      passed: 0,
      failed: 0,
      error: 0,
      warning: 0,
      determinismFailures: 0,
    },
  );

  return {
    reportType: DARK_PLACES_SEMANTIC_SAMPLE_QA_VERSION,
    moduleId: module?.id || "",
    packId: pack?.id || "",
    summary,
    results,
    passed: summary.failed === 0 && summary.determinismFailures === 0,
  };
}
