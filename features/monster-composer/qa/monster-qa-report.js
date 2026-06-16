export const MONSTER_QA_REPORT_VERSION = "monster-qa-v0.2-publish-gate";

export const QA_SEVERITIES = Object.freeze(["error", "warning", "info"]);

export function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

export function uniqueArray(values = []) {
  return [...new Set(asArray(values).map((value) => String(value).trim()).filter(Boolean))];
}

export function normalizeIssueSeverity(severity) {
  return QA_SEVERITIES.includes(severity) ? severity : "warning";
}

export function makeQaIssue({
  severity = "error",
  area = "monster",
  check = "general",
  id = "",
  title = "",
  message = "",
  path = "",
  recommendation = "",
  details = null,
} = {}) {
  return {
    severity: normalizeIssueSeverity(severity),
    area,
    check,
    id,
    title,
    message,
    path,
    recommendation,
    details,
  };
}

export function summarizeQaIssues(issues = []) {
  return asArray(issues).reduce(
    (summary, issue) => {
      summary.total += 1;
      const severity = normalizeIssueSeverity(issue.severity);
      summary[severity] = (summary[severity] || 0) + 1;
      return summary;
    },
    { total: 0, error: 0, warning: 0, info: 0 },
  );
}

export function groupQaIssues(issues = []) {
  const groups = new Map();

  asArray(issues).forEach((issue) => {
    const key = [issue.severity, issue.area, issue.check, issue.message].join("|");
    const existing = groups.get(key) || {
      key,
      severity: issue.severity,
      area: issue.area,
      check: issue.check,
      message: issue.message,
      count: 0,
      ids: [],
      issues: [],
    };
    existing.count += 1;
    if (issue.id && existing.ids.length < 16 && !existing.ids.includes(issue.id)) {
      existing.ids.push(issue.id);
    }
    existing.issues.push(issue);
    groups.set(key, existing);
  });

  return [...groups.values()].sort(
    (a, b) =>
      severityRank(a.severity) - severityRank(b.severity) ||
      b.count - a.count ||
      a.message.localeCompare(b.message),
  );
}

export function severityRank(severity) {
  if (severity === "error") return 0;
  if (severity === "warning") return 1;
  return 2;
}

export function buildQaReport({ suites = [], metadata = {} } = {}) {
  const normalizedSuites = asArray(suites).map((suite) => ({
    ...suite,
    issues: asArray(suite.issues),
    summary: suite.summary || summarizeQaIssues(suite.issues),
  }));
  const issues = normalizedSuites.flatMap((suite) =>
    asArray(suite.issues).map((issue) => ({ ...issue, suiteId: suite.id, suiteLabel: suite.label })),
  );

  return {
    reportType: "cruor-monster-qa-report",
    version: MONSTER_QA_REPORT_VERSION,
    generatedAt: new Date().toISOString(),
    metadata,
    summary: summarizeQaIssues(issues),
    groupedIssues: groupQaIssues(issues),
    suites: normalizedSuites,
    issues,
  };
}
