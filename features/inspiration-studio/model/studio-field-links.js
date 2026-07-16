function slugSegment(value = "") {
  return String(value)
    .replace(/\[(\d+)\]/g, "-$1")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getStudioComponentLocalFieldPath(path = "") {
  const value = String(path || "");
  const match = value.match(/components\[\d+\]\.(.+)$/);
  return match?.[1] || "";
}

export function getStudioFieldDomId(componentId = "", fieldPath = "") {
  if (!componentId || !fieldPath) return "";
  return `studio-field-${slugSegment(componentId)}-${slugSegment(fieldPath)}`;
}

export function getStudioIssueFieldLink(issue = {}) {
  const componentId = issue.componentId || issue.id || "";
  const fieldPath = getStudioComponentLocalFieldPath(issue.path);
  return {
    componentId,
    fieldPath,
    fieldId: getStudioFieldDomId(componentId, fieldPath),
  };
}
