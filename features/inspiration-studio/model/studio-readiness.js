import { asArray } from "./studio-component-normalizers.js";
import { normalizeModuleForDraft } from "./studio-draft.js";
import {
  buildStudioWarningsFromValidation,
  summarizeStudioWarnings,
} from "./studio-warning-model.js";
import {
  getGroupedValidationIssues,
  getIssueSummary,
} from "./studio-validation.js";
import { buildStudioSemanticCoverage } from "./studio-semantic-coverage.js";

export function getReadinessStateFromSummary(
  summary = {},
  warningSummary = {},
) {
  if (summary.error) return "error";
  if (warningSummary.legacy) return "legacy";
  if (summary.warning) return "warning";
  return "clean";
}

export function getReadinessLabelFromSummary(
  summary = {},
  warningSummary = {},
) {
  if (summary.error) return "Needs Fixes";
  if (warningSummary.legacy) return "Legacy Review";
  if (summary.warning) return "Needs Review";
  return "Ready";
}

export function getReadinessIconFromSummary(summary = {}, warningSummary = {}) {
  if (summary.error) return "fa-circle-xmark";
  if (warningSummary.legacy) return "fa-code-branch";
  if (summary.warning) return "fa-triangle-exclamation";
  return "fa-circle-check";
}

export function buildPublishReadinessReport(draft, validationReport, contentPackExport, moduleExport) {
  const normalized = normalizeModuleForDraft(draft);
  const issues = asArray(validationReport?.issues);
  const groupedIssues = getGroupedValidationIssues(issues, { includeInfo: true });
  const summary = validationReport?.summary || getIssueSummary(issues);
  const studioWarnings = buildStudioWarningsFromValidation(validationReport, normalized);
  const warningSummary = summarizeStudioWarnings(studioWarnings);
  const semanticCoverage = buildStudioSemanticCoverage(normalized);

  return {
    reportType: "cruor-inspiration-studio-publish-readiness",
    generatedAt: new Date().toISOString(),
    module: {
      id: normalized.id,
      title: normalized.title,
      status: normalized.status,
      packId: normalized.packId,
      sourceAnchorId: normalized.sourceAnchor?.id,
      componentCount: asArray(normalized.components).length,
    },
    readiness: {
      state: getReadinessStateFromSummary(summary, warningSummary),
      label: getReadinessLabelFromSummary(summary, warningSummary),
      summary,
      warningSummary,
      semanticCoverage: semanticCoverage.summary,
    },
    groupedIssues: groupedIssues.map((group) => ({
      severity: group.severity,
      message: group.message,
      count: group.count,
      ids: group.ids,
      paths: group.paths,
    })),
    issues: issues.map((issue) => ({
      severity: issue.severity || "warning",
      path: issue.path || "",
      id: issue.id || "",
      message: issue.message || "Validation issue.",
    })),
    studioWarnings: studioWarnings.map((warning) => ({
      id: warning.id,
      severity: warning.severity,
      validationSeverity: warning.validationSeverity,
      area: warning.area,
      componentId: warning.componentId,
      componentTitle: warning.componentTitle,
      path: warning.path,
      fieldPath: warning.fieldPath,
      fieldId: warning.fieldId,
      message: warning.message,
      whyItMatters: warning.whyItMatters,
      suggestedFix: warning.suggestedFix,
      autoFixAvailable: warning.autoFixAvailable,
    })),
    exports: {
      contentPackId: contentPackExport?.id,
      moduleId: moduleExport?.id,
    },
    semanticCoverage: semanticCoverage.rows,
  };
}
