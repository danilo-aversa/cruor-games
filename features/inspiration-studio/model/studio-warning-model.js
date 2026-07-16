import { asArray, hasText, isPlainObject } from "./studio-component-normalizers.js";
import { normalizeModuleForDraft } from "./studio-draft.js";
import { getStudioIssueFieldLink } from "./studio-field-links.js";

export const STUDIO_WARNING_SEVERITIES = Object.freeze({
  blocking: {
    id: "blocking",
    label: "Blocking",
    icon: "fa-circle-xmark",
    validationSeverity: "error",
  },
  editorial: {
    id: "editorial",
    label: "Editorial",
    icon: "fa-triangle-exclamation",
    validationSeverity: "warning",
  },
  suggestion: {
    id: "suggestion",
    label: "Suggestion",
    icon: "fa-circle-info",
    validationSeverity: "info",
  },
  legacy: {
    id: "legacy",
    label: "Legacy",
    icon: "fa-code-branch",
    validationSeverity: "warning",
  },
});

export function getStudioWarningSeverityMeta(severity = "editorial") {
  return STUDIO_WARNING_SEVERITIES[severity] || STUDIO_WARNING_SEVERITIES.editorial;
}

export function mapValidationSeverityToStudioWarningSeverity(severity = "warning") {
  if (severity === "error") return "blocking";
  if (severity === "info") return "suggestion";
  return "editorial";
}

export function mapStudioWarningSeverityToValidationSeverity(severity = "editorial") {
  return getStudioWarningSeverityMeta(severity).validationSeverity;
}

export function getStudioWarningArea(path = "") {
  const cleanPath = String(path || "");
  if (cleanPath.startsWith("components")) return "Component";
  if (cleanPath.startsWith("sourceAnchor")) return "Source Anchor";
  if (cleanPath.startsWith("inspiration")) return "Public Card";
  if (cleanPath.startsWith("contentPack")) return "Content Pack";
  if (cleanPath.startsWith("module")) return "Module";
  return "Studio";
}

function getSuggestedFix(issue = {}) {
  const message = String(issue.message || "").toLowerCase();
  const path = String(issue.path || "").toLowerCase();

  if (path.includes("counterplay")) return "Add a readable tell, limitation, repeat save, escape, or disruption method.";
  if (path.includes("trigger")) return "Add an exact trigger phrase so the timing is clear at the table.";
  if (path.includes("recharge")) return "Set a recharge value such as 5–6 or 6.";
  if (path.includes("resolution.ability")) return "Choose the saving throw ability used by the effect.";
  if (path.includes("sourceanchors")) return "Link this entry to the current Source Anchor or confirm it intentionally belongs elsewhere.";
  if (path.includes("workflows")) return "Add the workflow that consumes this content, such as monster-composer or darken-location.";
  if (path.includes("slots")) return "Choose a valid generator slot for this content type.";
  if (path.includes("media")) return "Add an imageKey, imageUrl, or intentional visual fallback before publication.";
  if (path.includes("copy") || message.includes("summary")) return "Add concise public-facing copy that explains what the DM can use.";
  if (message.includes("duplicate")) return "Rename or merge one of the duplicate entries so every exported ID is stable.";
  return "Review the field and add the missing structured data before publishing.";
}

function getWhyItMatters(issue = {}) {
  const area = getStudioWarningArea(issue.path);
  if (area === "Component") return "Generator content needs stable metadata so the Composer can filter, combine, validate, and export it safely.";
  if (area === "Source Anchor") return "Source metadata drives archive filtering and inherited defaults for linked components.";
  if (area === "Public Card") return "Public Inspiration cards need enough copy and media metadata to work in the archive.";
  if (area === "Content Pack") return "Content Pack issues can prevent the static registry or future CMS migration from accepting the export.";
  return "Studio data should remain stable enough for export, review, and future automation.";
}

function buildComponentLookup(draft = {}) {
  const normalized = normalizeModuleForDraft(draft);
  return new Map(asArray(normalized.components).map((component) => [component.id, component]));
}

export function normalizeStudioWarning(issue = {}, { draft, index = 0 } = {}) {
  const componentLookup = buildComponentLookup(draft);
  const componentId = issue.id && componentLookup.has(issue.id) ? issue.id : "";
  const component = componentId ? componentLookup.get(componentId) : null;
  const severity =
    issue.studioSeverity ||
    (String(issue.code || "").startsWith("compatibility.")
      ? "legacy"
      : mapValidationSeverityToStudioWarningSeverity(issue.severity));
  const fieldLink = getStudioIssueFieldLink({
    ...issue,
    componentId: componentId || issue.componentId,
  });

  return {
    id: issue.warningId || `${severity}-${issue.id || "draft"}-${index}`,
    severity,
    validationSeverity: mapStudioWarningSeverityToValidationSeverity(severity),
    area: issue.area || getStudioWarningArea(issue.path),
    componentId,
    componentTitle: component?.title || component?.label || "",
    path: issue.path || "",
    fieldPath: fieldLink.fieldPath,
    fieldId: fieldLink.fieldId,
    message: issue.message || "Studio warning.",
    whyItMatters: issue.whyItMatters || getWhyItMatters(issue),
    suggestedFix: issue.suggestedFix || getSuggestedFix(issue),
    autoFixAvailable: Boolean(issue.autoFixAvailable),
    rawIssue: issue,
  };
}

export function buildStudioWarningsFromValidation(
  validationReport = {},
  draft = {},
) {
  const normalized = normalizeModuleForDraft(draft);
  const issues = [...asArray(validationReport?.issues)];
  if (normalized.__studio?.sourceMode === "v1-compatibility") {
    issues.push({
      code: "compatibility.studio-transitional-draft",
      severity: "warning",
      studioSeverity: "legacy",
      path: "module.schemaVersion",
      message:
        "This draft was imported from v1 and remains transitional until editorial review.",
      suggestedFix:
        "Review every normalized semantic field and export canonical v2 before publication.",
    });
  }
  return issues.map((issue, index) =>
    normalizeStudioWarning(issue, { draft: normalized, index }),
  );
}

export function summarizeStudioWarnings(warnings = []) {
  return asArray(warnings).reduce(
    (summary, warning) => {
      const severity = warning?.severity || "editorial";
      summary.total += 1;
      summary[severity] = (summary[severity] || 0) + 1;
      return summary;
    },
    { total: 0, blocking: 0, editorial: 0, suggestion: 0, legacy: 0 },
  );
}

export function getStudioWarningsForEntry(warnings = [], entryId = "") {
  if (!entryId) return [];
  return asArray(warnings).filter((warning) => warning.componentId === entryId || String(warning.path || "").includes(entryId));
}

export function getStudioWarningState(warnings = []) {
  const summary = summarizeStudioWarnings(warnings);
  if (summary.blocking) return "blocking";
  if (summary.legacy) return "legacy";
  if (summary.editorial) return "editorial";
  if (summary.suggestion) return "suggestion";
  return "clean";
}

export function groupStudioWarningsByComponent(warnings = [], draft = {}) {
  const normalized = normalizeModuleForDraft(draft);
  const componentLookup = buildComponentLookup(normalized);
  const groups = new Map();

  asArray(warnings).forEach((warning) => {
    const key = warning.componentId || warning.area || "draft";
    const component = warning.componentId ? componentLookup.get(warning.componentId) : null;
    const current = groups.get(key) || {
      key,
      componentId: warning.componentId || "",
      title: component?.title || component?.label || warning.area || "Current Draft",
      area: warning.area || "Studio",
      warnings: [],
      summary: {
        total: 0,
        blocking: 0,
        editorial: 0,
        suggestion: 0,
        legacy: 0,
      },
    };

    current.warnings.push(warning);
    current.summary = summarizeStudioWarnings(current.warnings);
    groups.set(key, current);
  });

  return [...groups.values()].sort((a, b) => {
    if (b.summary.blocking !== a.summary.blocking)
      return b.summary.blocking - a.summary.blocking;
    if (b.summary.legacy !== a.summary.legacy)
      return b.summary.legacy - a.summary.legacy;
    if (b.summary.editorial !== a.summary.editorial)
      return b.summary.editorial - a.summary.editorial;
    return b.summary.total - a.summary.total;
  });
}

export function assertValidStudioWarningShape(warning = {}) {
  const requiredStringFields = ["id", "severity", "area", "path", "message", "whyItMatters", "suggestedFix"];
  const missing = requiredStringFields.filter((field) => !hasText(warning[field]));
  if (missing.length) return { valid: false, reason: `Missing fields: ${missing.join(", ")}` };
  if (!STUDIO_WARNING_SEVERITIES[warning.severity]) return { valid: false, reason: `Unknown severity: ${warning.severity}` };
  if (typeof warning.autoFixAvailable !== "boolean") return { valid: false, reason: "autoFixAvailable must be boolean" };
  if (!isPlainObject(warning.rawIssue) && warning.rawIssue !== undefined) return { valid: false, reason: "rawIssue must be an object when present" };
  return { valid: true, reason: "OK" };
}
