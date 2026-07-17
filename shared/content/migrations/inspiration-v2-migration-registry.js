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

const MODERN_MONSTER_CAPABILITY_LINKS = Object.freeze({
  decomposition: Object.freeze({
    capability: "monster-composer",
    ownership: "external-modern-source",
    sourceFile: "features/monster-composer/data/monster-grafts.js",
    sourceAnchorId: "decomposition",
    expectedEntries: 26,
    verification: "source-anchor-parity",
  }),
  "wolf-spiders": Object.freeze({
    capability: "monster-composer",
    ownership: "external-modern-source",
    sourceFile: "features/monster-composer/data/monster-grafts.js",
    sourceAnchorId: "wolf-spiders",
    expectedEntries: 32,
    verification: "source-anchor-parity",
  }),
  "wax-death-masks": Object.freeze({
    capability: "monster-composer",
    ownership: "external-modern-source",
    sourceFile: "features/monster-composer/data/monster-grafts.js",
    sourceAnchorId: "wax-death-masks",
    expectedEntries: 7,
    verification: "source-anchor-parity",
  }),
  jikininki: Object.freeze({
    capability: "monster-composer",
    ownership: "external-modern-source",
    sourceFile: "features/monster-composer/data/monster-grafts.js",
    sourceAnchorId: "jikininki",
    expectedEntries: 25,
    verification: "source-anchor-parity",
  }),
});

function getModernCapabilityLinks(moduleId) {
  const link = MODERN_MONSTER_CAPABILITY_LINKS[moduleId];
  return Object.freeze(link ? [link] : []);
}

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
    ownedSemanticCapabilities: Object.freeze([
      "inspiration-archive",
      "dark-places",
    ]),
    modernCapabilityLinks: getModernCapabilityLinks(moduleId),
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
  ownedSemanticCapabilities: Object.freeze([
    "inspiration-archive",
    "dark-places",
  ]),
  modernCapabilityLinks: Object.freeze([]),
  reviewer: "Danilo",
  reviewedAt: "2026-07-16",
  blockingIssues: Object.freeze(["image-provenance-required"]),
});

RECORDS.decomposition = Object.freeze({
  moduleId: "decomposition",
  title: "Decomposition",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/decomposition-semantic-v2-pack.js",
    "shared/content/inspiration-modules/decomposition.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "complete",
  editorialStatus: "approved",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "passed-zero-diagnostics",
  ownedSemanticCapabilities: Object.freeze([
    "inspiration-archive",
    "dark-places",
  ]),
  modernCapabilityLinks: getModernCapabilityLinks("decomposition"),
  reviewer: "Danilo",
  reviewedAt: "2026-07-17",
  blockingIssues: Object.freeze(["image-provenance-required"]),
});

RECORDS["the-mist"] = Object.freeze({
  moduleId: "the-mist",
  title: "The Mist",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/the-mist-semantic-v2-pack.js",
    "shared/content/inspiration-modules/the-mist.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "complete",
  editorialStatus: "approved",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "passed-zero-diagnostics",
  ownedSemanticCapabilities: Object.freeze([
    "inspiration-archive",
    "dark-places",
  ]),
  modernCapabilityLinks: Object.freeze([]),
  reviewer: "Danilo",
  reviewedAt: "2026-07-17",
  blockingIssues: Object.freeze(["image-provenance-required"]),
});

RECORDS["wolf-spiders"] = Object.freeze({
  moduleId: "wolf-spiders",
  title: "Wolf Spiders",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/wolf-spiders-semantic-v2-pack.js",
    "shared/content/inspiration-modules/wolf-spiders.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "complete",
  editorialStatus: "approved",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "passed-zero-diagnostics",
  ownedSemanticCapabilities: Object.freeze([
    "inspiration-archive",
    "dark-places",
  ]),
  modernCapabilityLinks: getModernCapabilityLinks("wolf-spiders"),
  reviewer: "Danilo",
  reviewedAt: "2026-07-17",
  blockingIssues: Object.freeze(["image-provenance-required"]),
  candidate: Object.freeze({
    reviewVersion: "phase8-wolf-spiders-editorial-candidate-v2",
    createdAt: "2026-07-17",
    ownershipModel: "archive-dark-places-with-external-monster-parity",
  }),
  withdrawnCandidate: Object.freeze({
    reviewVersion: "phase8-wolf-spiders-editorial-candidate-v1",
    withdrawnAt: "2026-07-17",
    reason: "duplicated-modern-monster-ownership",
    reusableScope: Object.freeze([
      "source-research",
      "archive-editorial-draft",
      "dark-places-editorial-draft",
    ]),
  }),
});

RECORDS["towers-of-silence"] = Object.freeze({
  moduleId: "towers-of-silence",
  title: "Towers of Silence",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/towers-of-silence-semantic-v2-pack.js",
    "shared/content/inspiration-modules/towers-of-silence.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "complete",
  editorialStatus: "approved",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "passed-zero-diagnostics",
  ownedSemanticCapabilities: Object.freeze([
    "inspiration-archive",
    "dark-places",
  ]),
  modernCapabilityLinks: Object.freeze([]),
  reviewer: "Danilo",
  reviewedAt: "2026-07-17",
  blockingIssues: Object.freeze(["image-provenance-required"]),
  candidate: Object.freeze({
    reviewVersion: "phase8-towers-of-silence-editorial-approved-v1",
    createdAt: "2026-07-17",
    ownershipModel: "archive-dark-places-only",
  }),
});

RECORDS["mortuary-totems"] = Object.freeze({
  moduleId: "mortuary-totems",
  title: "Mortuary Totems",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/mortuary-totems-semantic-v2-pack.js",
    "shared/content/inspiration-modules/mortuary-totems.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "complete",
  editorialStatus: "approved",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "passed-zero-diagnostics",
  ownedSemanticCapabilities: Object.freeze(["inspiration-archive", "dark-places"]),
  modernCapabilityLinks: Object.freeze([]),
  reviewer: "Danilo",
  reviewedAt: "2026-07-17",
  blockingIssues: Object.freeze(["image-provenance-required"]),
  candidate: Object.freeze({
    reviewVersion: "phase8-mortuary-totems-editorial-approved-v1",
    createdAt: "2026-07-17",
    ownershipModel: "archive-dark-places-only",
  }),
});

RECORDS["mustard-gas"] = Object.freeze({
  moduleId: "mustard-gas",
  title: "Mustard Gas",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/mustard-gas-semantic-v2-pack.js",
    "shared/content/inspiration-modules/mustard-gas.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "complete",
  editorialStatus: "approved",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "passed-zero-diagnostics",
  ownedSemanticCapabilities: Object.freeze(["inspiration-archive", "dark-places"]),
  modernCapabilityLinks: Object.freeze([]),
  reviewer: "Danilo",
  reviewedAt: "2026-07-17",
  blockingIssues: Object.freeze(["image-provenance-required"]),
  candidate: Object.freeze({
    reviewVersion: "phase8-mustard-gas-editorial-approved-v1",
    createdAt: "2026-07-17",
    ownershipModel: "archive-dark-places-only",
  }),
});

RECORDS["endocannibalism"] = Object.freeze({
  moduleId: "endocannibalism",
  title: "Endocannibalism",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/endocannibalism-semantic-v2-pack.js",
    "shared/content/inspiration-modules/endocannibalism.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "complete",
  editorialStatus: "approved",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "passed-zero-diagnostics",
  ownedSemanticCapabilities: Object.freeze(["inspiration-archive", "dark-places"]),
  modernCapabilityLinks: Object.freeze([]),
  reviewer: "Danilo",
  reviewedAt: "2026-07-17",
  blockingIssues: Object.freeze(["image-provenance-required"]),
  candidate: Object.freeze({
    reviewVersion: "phase8-endocannibalism-editorial-approved-v1",
    createdAt: "2026-07-17",
    ownershipModel: "archive-dark-places-only",
  }),
});

RECORDS["genetic-mutations"] = Object.freeze({
  moduleId: "genetic-mutations",
  title: "Genetic Mutations",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/genetic-mutations-semantic-v2-pack.js",
    "shared/content/inspiration-modules/genetic-mutations.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "complete",
  editorialStatus: "approved",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "passed-zero-diagnostics",
  ownedSemanticCapabilities: Object.freeze(["inspiration-archive", "dark-places"]),
  modernCapabilityLinks: Object.freeze([]),
  reviewer: "Danilo",
  reviewedAt: "2026-07-17",
  blockingIssues: Object.freeze(["image-provenance-required"]),
  candidate: Object.freeze({
    reviewVersion: "phase8-genetic-mutations-editorial-approved-v1",
    createdAt: "2026-07-17",
    ownershipModel: "archive-dark-places-only",
  }),
});

RECORDS["crucifixion"] = Object.freeze({
  moduleId: "crucifixion",
  title: "Crucifixion",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/crucifixion-semantic-v2-pack.js",
    "shared/content/inspiration-modules/crucifixion.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "complete",
  editorialStatus: "approved",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "passed-zero-diagnostics",
  ownedSemanticCapabilities: Object.freeze(["inspiration-archive", "dark-places"]),
  modernCapabilityLinks: Object.freeze([]),
  reviewer: "Danilo",
  reviewedAt: "2026-07-17",
  blockingIssues: Object.freeze(["image-provenance-required"]),
  candidate: Object.freeze({
    reviewVersion: "phase8-crucifixion-editorial-approved-v1",
    createdAt: "2026-07-17",
    ownershipModel: "archive-dark-places-only",
  }),
});

RECORDS["impalement"] = Object.freeze({
  moduleId: "impalement",
  title: "Impalement",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/impalement-semantic-v2-pack.js",
    "shared/content/inspiration-modules/impalement.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "complete",
  editorialStatus: "approved",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "passed-zero-diagnostics",
  ownedSemanticCapabilities: Object.freeze(["inspiration-archive", "dark-places"]),
  modernCapabilityLinks: Object.freeze([]),
  reviewer: "Danilo",
  reviewedAt: "2026-07-17",
  blockingIssues: Object.freeze(["image-provenance-required"]),
  candidate: Object.freeze({
    reviewVersion: "phase8-impalement-editorial-approved-v1",
    createdAt: "2026-07-17",
    ownershipModel: "archive-dark-places-only",
  }),
});


RECORDS["wax-death-masks"] = Object.freeze({
  moduleId: "wax-death-masks",
  title: "Wax Death Masks",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/wax-death-masks-semantic-v2-pack.js",
    "shared/content/inspiration-modules/wax-death-masks.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "candidate-ready",
  editorialStatus: "awaiting-human-signoff",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "pending-local-verification",
  ownedSemanticCapabilities: Object.freeze(["inspiration-archive", "dark-places"]),
  modernCapabilityLinks: getModernCapabilityLinks("wax-death-masks"),
  reviewer: "",
  reviewedAt: "",
  blockingIssues: Object.freeze([
    "human-editorial-signoff-required",
    "museum-ethics-review-required",
    "sample-qa-local-verification-required",
    "image-provenance-required",
  ]),
  candidate: Object.freeze({
    reviewVersion: "phase8-wax-death-masks-editorial-candidate-v1",
    createdAt: "2026-07-17",
    ownershipModel: "archive-dark-places-with-external-monster-parity",
  }),
});


RECORDS["anthropodermic-bibliopegy"] = Object.freeze({
  moduleId: "anthropodermic-bibliopegy",
  title: "Anthropodermic Bibliopegy",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/anthropodermic-bibliopegy-semantic-v2-pack.js",
    "shared/content/inspiration-modules/anthropodermic-bibliopegy.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "candidate-ready",
  editorialStatus: "awaiting-human-signoff",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "pending-local-verification",
  ownedSemanticCapabilities: Object.freeze(["inspiration-archive", "dark-places"]),
  modernCapabilityLinks: Object.freeze([]),
  reviewer: "",
  reviewedAt: "",
  blockingIssues: Object.freeze([
    "human-editorial-signoff-required",
    "human-remains-ethics-review-required",
    "sample-qa-local-verification-required",
    "image-provenance-required",
  ]),
  candidate: Object.freeze({
    reviewVersion: "phase8-anthropodermic-bibliopegy-editorial-candidate-v1",
    createdAt: "2026-07-17",
    ownershipModel: "archive-dark-places-only",
  }),
});


RECORDS["jikininki"] = Object.freeze({
  moduleId: "jikininki",
  title: "Jikininki",
  sourceFiles: Object.freeze([
    "shared/content/content-packs/jikininki-semantic-v2-pack.js",
    "shared/content/inspiration-modules/jikininki.js",
  ]),
  previousSchema: "legacy-inspiration-module-v1",
  targetSchema: "cruor-inspiration-module-v2",
  migrationStatus: "candidate-ready",
  editorialStatus: "awaiting-human-signoff",
  semanticCoverageStatus: "complete",
  sampleQaStatus: "pending-local-verification",
  ownedSemanticCapabilities: Object.freeze(["inspiration-archive", "dark-places"]),
  modernCapabilityLinks: getModernCapabilityLinks("jikininki"),
  reviewer: "",
  reviewedAt: "",
  blockingIssues: Object.freeze([
    "human-editorial-signoff-required",
    "japanese-folklore-review-required",
    "sample-qa-local-verification-required",
    "image-provenance-required",
  ]),
  candidate: Object.freeze({
    reviewVersion: "phase8-jikininki-editorial-candidate-v1",
    createdAt: "2026-07-17",
    ownershipModel: "archive-dark-places-with-external-monster-parity",
  }),
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
    record.reviewedAt,
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
