import assert from "node:assert/strict";
import {
  contentPackToRegistryData,
  createRegistryFromContentPack,
  validateContentPack,
} from "../shared/content/content-pack-schema.js";
import {
  STUDIO_COMPONENT_TEMPLATES,
  buildStudioComponentFromTemplate,
} from "../features/inspiration-studio/model/studio-component-templates.js";
import {
  EMPTY_DRAFT,
  normalizeModuleForDraft,
} from "../features/inspiration-studio/model/studio-draft.js";
import {
  buildContentPackExport,
  buildModuleExport,
} from "../features/inspiration-studio/model/studio-export.js";
import { buildPublishReadinessReport } from "../features/inspiration-studio/model/studio-readiness.js";
import { validateStudioDraft } from "../features/inspiration-studio/model/studio-validation.js";

function buildRoundtripDraft() {
  const draft = normalizeModuleForDraft({
    ...EMPTY_DRAFT,
    id: "studio-roundtrip-suite",
    title: "Studio Roundtrip Suite",
    status: "draft",
    packId: "studio-roundtrip-suite-pack",
    sourceAnchor: {
      ...EMPTY_DRAFT.sourceAnchor,
      id: "studio-roundtrip-suite",
      label: "Studio Roundtrip Suite",
      sourceTypes: ["biological-process"],
      themes: ["qa"],
      motifs: ["roundtrip"],
      horror: ["body-horror"],
      summary: "Internal QA source anchor for Studio roundtrip validation.",
    },
    inspiration: {
      ...EMPTY_DRAFT.inspiration,
      id: "inspiration-studio-roundtrip-suite",
      title: "Studio Roundtrip Suite",
      label: "Studio Roundtrip Suite",
      sourceAnchors: ["studio-roundtrip-suite"],
      sourceTypes: ["biological-process"],
      themes: ["qa"],
      motifs: ["roundtrip"],
      horror: ["body-horror"],
      summary: "Internal QA Inspiration used to verify Studio export roundtrips.",
      media: {
        ...EMPTY_DRAFT.inspiration.media,
        imageKey: "qa-placeholder.webp",
      },
    },
    components: [],
  });

  draft.components = Object.keys(STUDIO_COMPONENT_TEMPLATES).map((templateId, index) => ({
    ...buildStudioComponentFromTemplate(templateId, draft),
    id: `studio-roundtrip-suite-${templateId}`,
    title: `Roundtrip ${STUDIO_COMPONENT_TEMPLATES[templateId].label}`,
    summary: `Internal QA component generated from ${templateId}.`,
    tableText: "The test component renders usable table-facing text.",
    counterplay: "The DM can telegraph this effect before it matters.",
    metadata: {
      qaTemplateId: templateId,
      qaIndex: index,
    },
  }));

  return normalizeModuleForDraft(draft);
}

const draft = buildRoundtripDraft();
const moduleExport = buildModuleExport(draft, null);
const contentPackExport = buildContentPackExport(draft, null);
const contentPackIssues = validateContentPack(contentPackExport, { strict: true });
const registryData = contentPackToRegistryData(contentPackExport);
const registry = createRegistryFromContentPack(contentPackExport);
const validationReport = validateStudioDraft(draft, contentPackExport);
const readinessReport = buildPublishReadinessReport(draft, validationReport, contentPackExport, moduleExport);

assert.equal(moduleExport.components.length, draft.components.length, "Module export changed component count.");
assert.equal(contentPackExport.collections.components.length, draft.components.length, "Content pack export changed component count.");
assert.equal(registryData.components.length, draft.components.length, "Registry data changed component count.");
assert.equal(registry.getComponents().length, draft.components.length, "Registry component API changed component count.");
assert.ok(contentPackExport.collections.sourceAnchors.some((entry) => entry.id === draft.sourceAnchor.id), "Export lost the source anchor.");
assert.ok(contentPackExport.collections.inspirations.some((entry) => entry.id === draft.inspiration.id), "Export lost the Inspiration card.");

const contentPackErrors = contentPackIssues.filter((issue) => issue.severity === "error");
assert.deepEqual(contentPackErrors, [], `Content pack roundtrip has errors: ${contentPackErrors.map((issue) => issue.message).join("; ")}`);
assert.ok(validationReport.summary && typeof validationReport.summary.total === "number", "Studio validation summary is malformed.");
assert.equal(readinessReport.reportType, "cruor-inspiration-studio-publish-readiness", "Readiness report type mismatch.");
assert.equal(readinessReport.module.componentCount, draft.components.length, "Readiness report component count mismatch.");
assert.ok(Array.isArray(readinessReport.studioWarnings), "Readiness report must include studioWarnings array.");

console.log(`Studio draft roundtrip OK — ${draft.components.length} template components, ${contentPackIssues.length} content-pack issues, ${validationReport.summary.total} Studio issues.`);
