import assert from "node:assert/strict";
import {
  assertValidStudioWarningShape,
  summarizeStudioWarnings,
} from "../features/inspiration-studio/model/studio-warning-model.js";
import {
  EMPTY_DRAFT,
  buildComponentTemplate,
  normalizeModuleForDraft,
} from "../features/inspiration-studio/model/studio-draft.js";
import {
  buildContentPackExport,
  buildModuleExport,
} from "../features/inspiration-studio/model/studio-export.js";
import { buildPublishReadinessReport } from "../features/inspiration-studio/model/studio-readiness.js";
import { validateStudioDraft } from "../features/inspiration-studio/model/studio-validation.js";

const draft = normalizeModuleForDraft({
  ...EMPTY_DRAFT,
  id: "readiness-suite",
  title: "Readiness Suite",
  status: "draft",
  packId: "readiness-suite-pack",
  sourceAnchor: {
    ...EMPTY_DRAFT.sourceAnchor,
    id: "readiness-suite",
    label: "Readiness Suite",
    sourceTypes: ["qa-source"],
    themes: ["qa-theme"],
    summary: "Internal source anchor for readiness report tests.",
  },
  inspiration: {
    ...EMPTY_DRAFT.inspiration,
    id: "inspiration-readiness-suite",
    title: "Readiness Suite",
    sourceAnchors: ["readiness-suite"],
    summary: "Internal Inspiration for readiness report tests.",
    media: { ...EMPTY_DRAFT.inspiration.media, imageKey: "qa-placeholder.webp" },
  },
  components: [
    {
      ...buildComponentTemplate("monster-reaction", {
        ...EMPTY_DRAFT,
        id: "readiness-suite",
        sourceAnchor: { ...EMPTY_DRAFT.sourceAnchor, id: "readiness-suite" },
      }),
      id: "readiness-suite-reaction",
      title: "Readiness Reaction",
      summary: "A reaction intentionally missing some review fields.",
      counterplay: "The trigger is visible before the reaction happens.",
      monster: {
        ...buildComponentTemplate("monster-reaction", EMPTY_DRAFT).monster,
        rules: {
          ...buildComponentTemplate("monster-reaction", EMPTY_DRAFT).monster.rules,
          trigger: "",
        },
      },
    },
  ],
});

const moduleExport = buildModuleExport(draft, null);
const contentPackExport = buildContentPackExport(draft, null);
const validationReport = validateStudioDraft(draft, contentPackExport);
const readinessReport = buildPublishReadinessReport(draft, validationReport, contentPackExport, moduleExport);

assert.equal(readinessReport.reportType, "cruor-inspiration-studio-publish-readiness", "Unexpected readiness report type.");
assert.ok(readinessReport.generatedAt, "Readiness report must include generatedAt.");
assert.ok(readinessReport.module.id, "Readiness report must include module metadata.");
assert.ok(readinessReport.readiness.label, "Readiness report must include readiness label.");
assert.ok(readinessReport.readiness.summary, "Readiness report must include validation summary.");
assert.ok(readinessReport.readiness.warningSummary, "Readiness report must include warning summary.");
assert.ok(Array.isArray(readinessReport.groupedIssues), "Readiness report groupedIssues must be an array.");
assert.ok(Array.isArray(readinessReport.issues), "Readiness report issues must be an array.");
assert.ok(Array.isArray(readinessReport.studioWarnings), "Readiness report studioWarnings must be an array.");

for (const warning of readinessReport.studioWarnings) {
  const result = assertValidStudioWarningShape(warning);
  assert.equal(result.valid, true, result.reason);
}

const summary = summarizeStudioWarnings(readinessReport.studioWarnings);
assert.deepEqual(readinessReport.readiness.warningSummary, summary, "Readiness warning summary must match Studio warning summary.");

console.log(`Studio readiness report OK — ${readinessReport.issues.length} issues, ${readinessReport.studioWarnings.length} Studio warnings.`);
