import { asArray } from "./studio-component-normalizers.js";
import { normalizeModuleForDraft } from "./studio-draft.js";
import { listStudioSemanticEditorDefinitions } from "../schema/studio-semantic-editor-registry.js";

function buildCoverageIssue({
  code,
  componentId = "",
  message,
  path,
  semanticType,
  severity = "warning",
}) {
  return {
    code,
    id: componentId,
    componentId,
    semanticType,
    severity,
    path,
    message,
    studioSeverity: severity === "error" ? "blocking" : "editorial",
  };
}

function buildSemanticTypeCoverage(module, definition) {
  const components = asArray(module.components).filter(
    (component) => component.semanticType === definition.semanticType,
  );
  const componentCoverage = components.map((component) => ({
    componentId: component.id,
    title: component.title,
    ...definition.evaluateCoverage(component.semantic),
  }));
  const required = asArray(module.capabilities).includes("dark-places");
  const targetComponents = definition.coverage.targetComponents || 1;
  const authoredCount = componentCoverage.filter(
    (entry) => entry.complete,
  ).length;
  const missing = components.length === 0;
  const belowTarget = components.length < targetComponents;
  const incomplete = componentCoverage.some((entry) => !entry.complete);
  const status =
    !required && missing
      ? "not-applicable"
      : missing
        ? "missing"
        : incomplete || belowTarget
          ? "partial"
          : "covered";

  return {
    semanticType: definition.semanticType,
    label: definition.label,
    icon: definition.icon,
    navigationGroup: definition.navigationGroup,
    required,
    status,
    componentCount: components.length,
    authoredCount,
    targetComponents,
    componentCoverage,
  };
}

function buildCoverageIssues(module, rows) {
  const issues = [];
  rows.forEach((row) => {
    if (!row.required) return;
    if (row.status === "missing") {
      issues.push(
        buildCoverageIssue({
          code: "studio.semantic-coverage.missing-type",
          semanticType: row.semanticType,
          path: "components",
          message: `Dark Places coverage is missing ${row.label}.`,
          severity: module.status === "published" ? "error" : "warning",
        }),
      );
      return;
    }

    row.componentCoverage.forEach((entry) => {
      const componentIndex = module.components.findIndex(
        (component) => component.id === entry.componentId,
      );
      entry.missingPaths.forEach((missingPath) => {
        issues.push(
          buildCoverageIssue({
            code: "studio.semantic-coverage.missing-field",
            componentId: entry.componentId,
            semanticType: row.semanticType,
            path: `components[${componentIndex}].semantic.${missingPath}`,
            message: `${row.label} requires authored ${missingPath}.`,
          }),
        );
      });
      if (entry.targetCount && entry.itemCount < entry.targetCount) {
        issues.push(
          buildCoverageIssue({
            code: "studio.semantic-coverage.item-target",
            componentId: entry.componentId,
            semanticType: row.semanticType,
            path: `components[${componentIndex}].semantic.${entry.targetPath}`,
            message: `${row.label} has ${entry.itemCount}/${entry.targetCount} target ${entry.targetPath} entries.`,
          }),
        );
      }
    });

    if (row.componentCount < row.targetComponents) {
      issues.push(
        buildCoverageIssue({
          code: "studio.semantic-coverage.component-target",
          semanticType: row.semanticType,
          path: "components",
          message: `${row.label} coverage has ${row.componentCount}/${row.targetComponents} target components.`,
        }),
      );
    }
  });
  return issues;
}

export function buildStudioSemanticCoverage(module = {}) {
  const normalized = normalizeModuleForDraft(module);
  const rows = listStudioSemanticEditorDefinitions().map((definition) =>
    buildSemanticTypeCoverage(normalized, definition),
  );
  const issues = buildCoverageIssues(normalized, rows);
  const summary = rows.reduce(
    (result, row) => {
      result.total += 1;
      result[row.status] += 1;
      if (row.required) result.required += 1;
      return result;
    },
    {
      total: 0,
      required: 0,
      covered: 0,
      partial: 0,
      missing: 0,
      "not-applicable": 0,
    },
  );

  return {
    reportType: "cruor-studio-semantic-coverage-v1",
    moduleId: normalized.id,
    capabilities: [...asArray(normalized.capabilities)],
    rows,
    issues,
    summary,
    ready: summary.missing === 0 && summary.partial === 0,
  };
}

export function buildStudioSemanticCoverageMatrix(modules = []) {
  return asArray(modules).map((module) => {
    const normalized = normalizeModuleForDraft(module);
    const coverage = buildStudioSemanticCoverage(normalized);
    return {
      moduleId: normalized.id,
      inspirationId: normalized.inspiration?.id || "",
      title: normalized.title,
      status: normalized.status,
      capabilities: [...asArray(normalized.capabilities)],
      semanticTypes: Object.fromEntries(
        coverage.rows.map((row) => [
          row.semanticType,
          {
            status: row.status,
            required: row.required,
            count: row.componentCount,
            authored: row.authoredCount,
          },
        ]),
      ),
      summary: coverage.summary,
    };
  });
}
