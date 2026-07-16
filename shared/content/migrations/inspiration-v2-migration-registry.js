export const INSPIRATION_V2_MIGRATION_ORDER = Object.freeze([
  "sedlec-ossuary",
  "decomposition",
  "the-mist",
  "wolf-spiders",
  "towers-of-silence",
  "mortuary-totems",
  "mustard-gas",
  "endocannibalism",
  "genetic-mutations",
  "crucifixion",
  "impalement",
  "wax-death-masks",
  "anthropodermic-bibliopegy",
  "jikininki",
]);

const TITLES = Object.freeze({
  "sedlec-ossuary": "Sedlec Ossuary",
  decomposition: "Decomposition",
  "the-mist": "The Mist",
  "wolf-spiders": "Wolf Spiders",
  "towers-of-silence": "Towers of Silence",
  "mortuary-totems": "Mortuary Totems",
  "mustard-gas": "Mustard Gas",
  endocannibalism: "Endocannibalism",
  "genetic-mutations": "Genetic Mutations",
  crucifixion: "Crucifixion",
  impalement: "Impalement",
  "wax-death-masks": "Wax Death Masks",
  "anthropodermic-bibliopegy": "Anthropodermic Bibliopegy",
  jikininki: "Jikininki",
});

function createPendingRecord(moduleId) {
  return Object.freeze({
    moduleId,
    title: TITLES[moduleId],
    sourceFiles: Object.freeze([
      `shared/content/inspiration-modules/${moduleId}.js`,
    ]),
    previousSchema: "legacy-inspiration-module-v1",
    targetSchema: "cruor-inspiration-module-v2",
    migrationStatus: "pending",
    editorialStatus: "not-started",
    semanticCoverageStatus: "not-evaluated",
    sampleQaStatus: "not-run",
    reviewer: "",
    reviewedAt: "",
    blockingIssues: Object.freeze([
      "canonical-v2-module-required",
      "per-module-editorial-review-required",
      "sample-dark-places-review-required",
    ]),
  });
}

const RECORDS = Object.fromEntries(
  INSPIRATION_V2_MIGRATION_ORDER.map((moduleId) => [
    moduleId,
    createPendingRecord(moduleId),
  ]),
);

RECORDS["sedlec-ossuary"] = Object.freeze({
  moduleId: "sedlec-ossuary",
  title: "Sedlec Ossuary",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/sedlec-ossuary-semantic-v2-pack.js",
    "shared/content/inspiration-modules/sedlec-ossuary.js",
    "tests/fixtures/dark-places-semantic-v2/sedlec-ossuary/",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "complete",
  editorialStatus: "approved",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "passed-zero-diagnostics",
  reviewer: "Danilo",
  reviewedAt: "2026-07-16",
  blockingIssues: Object.freeze([]),
});

RECORDS.decomposition = Object.freeze({
  moduleId: "decomposition",
  title: "Decomposition",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/decomposition-semantic-v2-pack.js",
    "shared/content/content-packs/decomposition-monster-grafts-v2.js",
    "shared/content/inspiration-modules/decomposition.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "candidate-ready",
  editorialStatus: "awaiting-human-signoff",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "passed-zero-diagnostics",
  reviewer: "",
  reviewedAt: "",
  blockingIssues: Object.freeze(["human-editorial-signoff-required"]),
});

export const INSPIRATION_V2_MIGRATION_RECORDS = Object.freeze(RECORDS);

export function getInspirationV2MigrationRecord(moduleId = "") {
  return INSPIRATION_V2_MIGRATION_RECORDS[moduleId] || null;
}

export function listInspirationV2MigrationRecords() {
  return INSPIRATION_V2_MIGRATION_ORDER.map(
    (moduleId) => INSPIRATION_V2_MIGRATION_RECORDS[moduleId],
  );
}

export function isInspirationV2EditoriallyApproved(record = {}) {
  return Boolean(
    record.editorialStatus === "approved" &&
    record.reviewer &&
    record.reviewedAt &&
    !record.blockingIssues?.length,
  );
}

function classifyModule(module = {}) {
  const canonical = module.schemaVersion === "cruor-inspiration-module-v2";
  const fallback =
    module.metadata?.generatedFrom === "static-content-registry-fallback";
  return {
    schema: canonical ? module.schemaVersion : "legacy-inspiration-module-v1",
    sourceMode: fallback
      ? "registry-fallback"
      : canonical
        ? "canonical-v2"
        : "legacy-v1",
    canonical,
    fallback,
  };
}

export function buildInspirationV2MigrationAudit(modules = []) {
  const moduleById = new Map(modules.map((module) => [module.id, module]));
  const rows = listInspirationV2MigrationRecords().map((record) => {
    const module = moduleById.get(record.moduleId) || null;
    const classification = classifyModule(module || {});
    return {
      ...record,
      found: Boolean(module),
      observedSchema: classification.schema,
      observedSourceMode: classification.sourceMode,
      canonical: classification.canonical,
      fallback: classification.fallback,
    };
  });
  const summary = rows.reduce(
    (result, row) => {
      result.total += 1;
      if (!row.found) result.missing += 1;
      else if (row.canonical) result.canonicalV2 += 1;
      else result.legacyV1 += 1;
      if (row.fallback) result.registryFallback += 1;
      if (isInspirationV2EditoriallyApproved(row)) result.approved += 1;
      else result.awaitingEditorialApproval += 1;
      return result;
    },
    {
      total: 0,
      canonicalV2: 0,
      legacyV1: 0,
      registryFallback: 0,
      missing: 0,
      approved: 0,
      awaitingEditorialApproval: 0,
    },
  );

  return Object.freeze({
    reportType: "cruor-inspiration-v2-migration-audit-v1",
    summary: Object.freeze(summary),
    rows: Object.freeze(rows.map(Object.freeze)),
  });
}
