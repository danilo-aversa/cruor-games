import {
  STATIC_CONTENT_PACKS,
  STATIC_CONTENT_PACK_ISSUES,
  STATIC_CONTENT_REGISTRY_DATA,
} from "../../../shared/content/static-registry.js";
import { normalizeModuleForDraft } from "../model/studio-draft.js";
import { validateStudioDraft } from "../model/studio-validation.js";
import { buildContentPackExport } from "../model/studio-export.js";
import {
  buildStudioWarningsFromValidation,
  summarizeStudioWarnings,
} from "../model/studio-warning-model.js";
import { buildStudioSemanticCoverage } from "../model/studio-semantic-coverage.js";
import { isStudioSpecializedSemanticType } from "../schema/studio-semantic-editor-registry.js";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function hasText(value) {
  return String(value || "").trim().length > 0;
}

function entryId(entry = {}) {
  return String(entry.id || entry.slug || entry.legacyId || "").trim();
}

function summarizeBy(entries = [], getter) {
  const buckets = new Map();
  asArray(entries).forEach((entry) => {
    const values = asArray(typeof getter === "function" ? getter(entry) : entry?.[getter]);
    const bucketValues = values.length ? values : ["unassigned"];
    bucketValues.forEach((value) => {
      const id = String(value || "unassigned").trim() || "unassigned";
      const current = buckets.get(id) || { id, label: formatLabel(id), count: 0, ids: [] };
      current.count += 1;
      const idValue = entryId(entry);
      if (idValue && !current.ids.includes(idValue)) current.ids.push(idValue);
      buckets.set(id, current);
    });
  });
  return [...buckets.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function summarizeStatus(entries = []) {
  return asArray(entries).reduce((summary, entry) => {
    const status = entry?.status || "draft";
    summary.total += 1;
    summary[status] = (summary[status] || 0) + 1;
    return summary;
  }, { total: 0, draft: 0, "in-review": 0, published: 0, retired: 0 });
}

function summarizeIssues(issues = []) {
  return asArray(issues).reduce((summary, issue) => {
    const severity = issue?.severity || "warning";
    summary.total += 1;
    summary[severity] = (summary[severity] || 0) + 1;
    return summary;
  }, { total: 0, error: 0, warning: 0, info: 0, blocking: 0, editorial: 0, suggestion: 0 });
}

function formatLabel(value) {
  return String(value || "unassigned")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function createIssue({ severity = "warning", area = "Content", id = "", title = "", path = "content", message, suggestedFix = "Review this entry before publishing.", source = "content-health" }) {
  return { severity, area, id, title, path, message, suggestedFix, source };
}

function collectModuleReports(modules = []) {
  return asArray(modules).map((module) => {
    const draft = normalizeModuleForDraft(module);
    const contentPack = buildContentPackExport(draft, "");
    const validation = validateStudioDraft(draft, contentPack);
    const warnings = buildStudioWarningsFromValidation(validation, draft);
    const semanticCoverage = buildStudioSemanticCoverage(draft);
    return {
      id: draft.id,
      title: draft.title,
      status: draft.status,
      packId: draft.packId,
      componentCount: asArray(draft.components).length,
      sourceMode: draft.__studio?.sourceMode || "v2",
      sourceSchema: draft.__studio?.sourceSchema || draft.schemaVersion,
      semanticCoverage: semanticCoverage.summary,
      validationSummary:
        validation.summary || summarizeIssues(validation.issues),
      warningSummary: summarizeStudioWarnings(warnings),
      issues: asArray(validation.issues),
      warnings,
    };
  });
}

function collectEntries(registryData = {}, modules = []) {
  const draftModules = asArray(modules).map(normalizeModuleForDraft);
  const moduleComponents = draftModules.flatMap((module) => asArray(module.components).map((component) => ({
    ...component,
    __moduleId: module.id,
    __moduleTitle: module.title,
    __origin: "studio-module",
  })));
  const moduleInspirations = draftModules.map((module) => ({
    ...(module.inspiration || {}),
    __moduleId: module.id,
    __moduleTitle: module.title,
    __origin: "studio-module",
  }));
  const moduleSourceAnchors = draftModules.map((module) => ({
    ...(module.sourceAnchor || {}),
    __moduleId: module.id,
    __moduleTitle: module.title,
    __origin: "studio-module",
  }));

  return {
    components: [...asArray(registryData.components), ...moduleComponents],
    inspirations: [...asArray(registryData.inspirations), ...moduleInspirations],
    sourceAnchors: [...asArray(registryData.sourceAnchors), ...moduleSourceAnchors],
    workflows: asArray(registryData.workflows),
    slots: asArray(registryData.slots),
    modules: draftModules,
  };
}

function buildContentHealthIssues(entries, staticIssues = STATIC_CONTENT_PACK_ISSUES) {
  const issues = asArray(staticIssues).map((issue) => createIssue({
    severity: issue.severity || "warning",
    area: "Static Registry",
    id: issue.id || issue.packId || "static-registry",
    title: issue.packId || "Static Registry",
    path: issue.path || "contentPack",
    message: issue.message || "Static registry issue.",
    suggestedFix: "Fix the source content pack or registry schema issue.",
    source: "static-content-pack",
  }));

  const sourceAnchorIds = new Set(asArray(entries.sourceAnchors).map(entryId).filter(Boolean));
  const inspirationSourceAnchorIds = new Set(asArray(entries.inspirations).flatMap((inspiration) => asArray(inspiration.sourceAnchors)));

  asArray(entries.components).forEach((component, index) => {
    const id = entryId(component) || `component-${index}`;
    const title = component.title || component.label || id;
    const sourceAnchors = asArray(component.sourceAnchors);
    const status = component.status || "draft";
    const isPublished = status === "published";

    if (!sourceAnchors.length) {
      issues.push(createIssue({ severity: "error", area: "Component", id, title, path: "component.sourceAnchors", message: "Component has no Source Anchor.", suggestedFix: "Link this component to at least one Source Anchor." }));
    }
    sourceAnchors.forEach((sourceAnchorId) => {
      if (!sourceAnchorIds.has(sourceAnchorId)) {
        issues.push(createIssue({ severity: "error", area: "Component", id, title, path: "component.sourceAnchors", message: `Component references missing Source Anchor: ${sourceAnchorId}.`, suggestedFix: "Create the Source Anchor or replace the reference with an existing one." }));
      }
    });
    if (isPublished && !hasText(component.summary) && !hasText(component.tableText) && !hasText(component.mechanics)) {
      issues.push(createIssue({ severity: "warning", area: "Component", id, title, path: "component.copy", message: "Published component has no summary, table text, or mechanics.", suggestedFix: "Add compact DM-facing text before publishing." }));
    }
    if (component.contentType === "monster-graft") {
      const rules = component.monster?.rules || component.rules || {};
      if (!rules || !Object.keys(rules).length) {
        issues.push(createIssue({ severity: "error", area: "Monster Graft", id, title, path: "component.monster.rules", message: "Monster graft has no structured rules.", suggestedFix: "Add monster.rules so the Monster Composer can score and render the graft." }));
      }
      if (!hasText(component.counterplay) && !rules.counterplay && component.monster?.section !== "trait") {
        issues.push(createIssue({ severity: "warning", area: "Monster Graft", id, title, path: "component.counterplay", message: "Monster graft has no readable counterplay.", suggestedFix: "Add a tell, limitation, repeat save, escape method, or disruption trigger." }));
      }
    }
    if (component.contentType === "location-region" && !component.locationRegion) {
      issues.push(createIssue({ severity: "warning", area: "Location Region", id, title, path: "component.locationRegion", message: "Location region has no locationRegion metadata.", suggestedFix: "Add role, size, shape, connectors, density, and read-aloud metadata." }));
    }
  });

  asArray(entries.inspirations).forEach((inspiration, index) => {
    const id = entryId(inspiration) || `inspiration-${index}`;
    const title = inspiration.title || inspiration.label || id;
    const sourceAnchors = asArray(inspiration.sourceAnchors);
    const status = inspiration.status || "draft";
    const media = inspiration.media || {};

    if (!sourceAnchors.length) {
      issues.push(createIssue({ severity: "error", area: "Inspiration", id, title, path: "inspiration.sourceAnchors", message: "Inspiration has no Source Anchor.", suggestedFix: "Link the public Inspiration card to its Source Anchor." }));
    }
    if (status === "published" && !hasText(inspiration.summary) && !hasText(inspiration.narrative)) {
      issues.push(createIssue({ severity: "warning", area: "Inspiration", id, title, path: "inspiration.copy", message: "Published Inspiration lacks public-facing summary/narrative copy.", suggestedFix: "Add short public copy explaining what the source is and why it matters." }));
    }
    if (status === "published" && !hasText(media.imageKey) && !hasText(media.imageUrl) && !hasText(media.icon)) {
      issues.push(createIssue({ severity: "warning", area: "Inspiration", id, title, path: "inspiration.media", message: "Published Inspiration has no image, image key, image URL, or icon fallback.", suggestedFix: "Add image metadata or an intentional icon fallback." }));
    }
  });

  asArray(entries.sourceAnchors).forEach((sourceAnchor, index) => {
    const id = entryId(sourceAnchor) || `source-anchor-${index}`;
    const title = sourceAnchor.label || sourceAnchor.title || id;
    if (!inspirationSourceAnchorIds.has(id)) {
      issues.push(createIssue({ severity: "info", area: "Source Anchor", id, title, path: "sourceAnchor.inspirations", message: "Source Anchor has no linked public Inspiration card.", suggestedFix: "Create an Inspiration card or keep this anchor internal intentionally." }));
    }
  });

  asArray(entries.modules).forEach((module) => {
    const capabilities = new Set(asArray(module.capabilities));
    const semanticCoverage = buildStudioSemanticCoverage(module);
    const sourceMode = module.__studio?.sourceMode || "v2";
    const serializedMetadata = JSON.stringify(
      module.metadata || {},
    ).toLowerCase();

    if (sourceMode === "v1-compatibility") {
      issues.push(
        createIssue({
          severity: "warning",
          area: "Migration",
          id: module.id,
          title: module.title,
          path: "module.schemaVersion",
          message: "Module is still a transitional v1 compatibility draft.",
          suggestedFix:
            "Editorially review every semantic payload and export canonical v2.",
          source: "semantic-health",
        }),
      );
    }
    if (
      /fallback|converted-inspiration|static-content-registry-fallback/.test(
        serializedMetadata,
      )
    ) {
      issues.push(
        createIssue({
          severity: "warning",
          area: "Migration",
          id: module.id,
          title: module.title,
          path: "module.metadata",
          message: "Module relies on fallback or conversion metadata.",
          suggestedFix:
            "Replace runtime fallback generation with explicitly authored v2 content during Phase 8.",
          source: "semantic-health",
        }),
      );
    }
    if (module.inspiration?.status !== "approved") {
      issues.push(
        createIssue({
          severity: "warning",
          area: "Editorial",
          id: module.inspiration?.id || module.id,
          title: module.title,
          path: "inspiration.status",
          message: "Inspiration has not received editorial approval.",
          suggestedFix: "Complete human editorial review before publication.",
          source: "semantic-health",
        }),
      );
    }

    const hasDarkPlacesComponents = asArray(module.components).some(
      (component) => isStudioSpecializedSemanticType(component.semanticType),
    );
    if (hasDarkPlacesComponents && !capabilities.has("dark-places")) {
      issues.push(
        createIssue({
          severity: "error",
          area: "Capability",
          id: module.id,
          title: module.title,
          path: "module.capabilities",
          message:
            "Module contains specialized Dark Places components without the dark-places capability.",
          suggestedFix:
            "Declare dark-places or remove the unused semantic components.",
          source: "semantic-health",
        }),
      );
    }

    semanticCoverage.issues.forEach((issue) => {
      issues.push(
        createIssue({
          severity: issue.severity,
          area:
            issue.semanticType === "global-rule"
              ? "Global Mechanics"
              : "Semantic Coverage",
          id: issue.componentId || module.id,
          title: module.title,
          path: issue.path,
          message: issue.message,
          suggestedFix:
            "Open the linked specialized editor field and complete the authored semantic payload.",
          source: "semantic-health",
        }),
      );
    });

    asArray(module.components).forEach((component, componentIndex) => {
      if (
        isStudioSpecializedSemanticType(component.semanticType) &&
        (!asArray(component.workflows).includes("darken-location") ||
          !capabilities.has("dark-places"))
      ) {
        issues.push(
          createIssue({
            severity: "warning",
            area: "Unused Semantic Content",
            id: component.id,
            title: component.title,
            path: `components[${componentIndex}].workflows`,
            message:
              "Specialized semantic component is not reachable by the Dark Places capability.",
            suggestedFix:
              "Link it to darken-location and declare the capability, or retire the component intentionally.",
            source: "semantic-health",
          }),
        );
      }
    });
  });

  return issues;
}

function summarizeSchemaModes(modules = []) {
  return asArray(modules).reduce(
    (summary, module) => {
      const mode =
        module.__studio?.sourceMode === "v1-compatibility" ? "v1" : "v2";
      summary.total += 1;
      summary[mode] += 1;
      return summary;
    },
    { total: 0, v1: 0, v2: 0 },
  );
}

export function buildContentHealthReport({
  contentPacks = STATIC_CONTENT_PACKS,
  registryData = STATIC_CONTENT_REGISTRY_DATA,
  staticIssues = STATIC_CONTENT_PACK_ISSUES,
  modules = [],
} = {}) {
  const entries = collectEntries(registryData, modules);
  const issues = buildContentHealthIssues(entries, staticIssues);
  const moduleReports = collectModuleReports(modules);
  const issueSummary = summarizeIssues(issues);
  const schemaModes = summarizeSchemaModes(entries.modules);
  const semanticComponents = asArray(entries.modules).flatMap((module) =>
    asArray(module.components).filter((component) =>
      isStudioSpecializedSemanticType(component.semanticType),
    ),
  );

  return {
    reportType: "cruor-studio-content-health-report",
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    summary: {
      packs: asArray(contentPacks).length,
      modules: asArray(modules).length,
      sourceAnchors: asArray(entries.sourceAnchors).length,
      inspirations: asArray(entries.inspirations).length,
      components: asArray(entries.components).length,
      workflows: asArray(entries.workflows).length,
      slots: asArray(entries.slots).length,
      issues: issueSummary,
      schemas: schemaModes,
    },
    status: {
      contentPacks: summarizeStatus(contentPacks),
      modules: summarizeStatus(entries.modules),
      sourceAnchors: summarizeStatus(entries.sourceAnchors),
      inspirations: summarizeStatus(entries.inspirations),
      components: summarizeStatus(entries.components),
    },
    coverage: {
      componentsByType: summarizeBy(entries.components, "contentType"),
      componentsByWorkflow: summarizeBy(entries.components, "workflows"),
      componentsBySlot: summarizeBy(entries.components, "slots"),
      componentsBySourceAnchor: summarizeBy(
        entries.components,
        "sourceAnchors",
      ),
      inspirationsBySourceAnchor: summarizeBy(
        entries.inspirations,
        "sourceAnchors",
      ),
      semanticComponentsByType: summarizeBy(semanticComponents, "semanticType"),
    },
    moduleReports,
    issues: issues.sort((a, b) => {
      const rank = { error: 0, warning: 1, info: 2 };
      return (rank[a.severity] ?? 1) - (rank[b.severity] ?? 1) || a.area.localeCompare(b.area) || a.title.localeCompare(b.title);
    }),
  };
}

export function filterContentHealthIssues(issues = [], filters = {}) {
  const search = String(filters.search || "").trim().toLowerCase();
  return asArray(issues).filter((issue) => {
    if (filters.severity && filters.severity !== "all" && issue.severity !== filters.severity) return false;
    if (filters.area && filters.area !== "all" && issue.area !== filters.area) return false;
    if (!search) return true;
    return [issue.id, issue.title, issue.area, issue.path, issue.message, issue.suggestedFix].join(" ").toLowerCase().includes(search);
  });
}

export function getContentHealthIssueAreas(issues = []) {
  return [...new Set(asArray(issues).map((issue) => issue.area).filter(Boolean))].sort();
}
