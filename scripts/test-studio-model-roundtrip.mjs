import { buildContentPackExport, buildModuleExport } from "../features/inspiration-studio/model/studio-export.js";
import { EMPTY_DRAFT, buildComponentTemplate, normalizeModuleForDraft } from "../features/inspiration-studio/model/studio-draft.js";
import { buildPublishReadinessReport } from "../features/inspiration-studio/model/studio-readiness.js";
import { validateStudioDraft } from "../features/inspiration-studio/model/studio-validation.js";

const draft = normalizeModuleForDraft({
  ...EMPTY_DRAFT,
  id: "studio-roundtrip-test",
  title: "Studio Roundtrip Test",
  packId: "studio-roundtrip-test-pack",
  sourceAnchor: {
    ...EMPTY_DRAFT.sourceAnchor,
    id: "studio-roundtrip-test",
    label: "Studio Roundtrip Test",
    sourceTypes: ["Biological Process"],
    themes: ["Internal QA"],
  },
  inspiration: {
    ...EMPTY_DRAFT.inspiration,
    id: "inspiration-studio-roundtrip-test",
    title: "Studio Roundtrip Test",
    sourceAnchors: ["studio-roundtrip-test"],
    summary: "Internal roundtrip smoke test.",
    media: {
      ...EMPTY_DRAFT.inspiration.media,
      imageKey: "qa-placeholder.webp",
    },
  },
  components: [],
});

draft.components = [
  {
    ...buildComponentTemplate("monster-graft", draft),
    id: "studio-roundtrip-test-graft",
    title: "Roundtrip Graft",
    summary: "A simple test graft.",
    counterplay: "Visible before it is used.",
  },
  {
    ...buildComponentTemplate("location-component", draft),
    id: "studio-roundtrip-test-location",
    title: "Roundtrip Location Detail",
    summary: "A simple test location detail.",
    tableText: "Cold dust gathers around the threshold.",
  },
  {
    ...buildComponentTemplate("location-region", draft),
    id: "studio-roundtrip-test-region",
    title: "Roundtrip Region",
    summary: "A simple test region.",
  },
];

const moduleExport = buildModuleExport(draft, null);
const contentPackExport = buildContentPackExport(draft, null);
const validationReport = validateStudioDraft(draft, contentPackExport);
const readinessReport = buildPublishReadinessReport(draft, validationReport, contentPackExport, moduleExport);

if (!moduleExport?.components?.length) {
  throw new Error("Module export lost all components.");
}

if (!contentPackExport?.collections?.components?.length) {
  throw new Error("Content pack export lost all components.");
}

if (!validationReport?.summary || typeof validationReport.summary.total !== "number") {
  throw new Error("Validation report summary is missing or malformed.");
}

if (!readinessReport?.readiness?.summary) {
  throw new Error("Readiness report is missing summary data.");
}

console.log(`Studio model roundtrip OK — ${contentPackExport.collections.components.length} components, ${validationReport.summary.error} errors, ${validationReport.summary.warning} warnings`);
