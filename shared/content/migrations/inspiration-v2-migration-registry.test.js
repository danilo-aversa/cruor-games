import { describe, expect, it } from "vitest";

import {
  CRUOR_INSPIRATION_MODULES,
  buildInspirationV2MigrationAudit,
  getInspirationV2MigrationRecord,
  isInspirationV2EditoriallyApproved,
  listInspirationV2MigrationRecords,
} from "../content.index.js";

describe("Phase 8 Inspiration v2 migration registry", () => {
  it("tracks all 14 Inspirations in the approved batch order", () => {
    const records = listInspirationV2MigrationRecords();

    expect(records).toHaveLength(14);
    expect(records.map((record) => record.moduleId)).toEqual([
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
  });

  it("classifies the first four Phase 8 modules as canonical v2", () => {
    const report = buildInspirationV2MigrationAudit(CRUOR_INSPIRATION_MODULES);

    expect(report.summary).toEqual({
      total: 14,
      canonicalV2: 4,
      legacyV1: 10,
      registryFallback: 0,
      missing: 0,
      approved: 3,
      awaitingEditorialApproval: 11,
    });
    expect(
      report.rows.find((row) => row.moduleId === "sedlec-ossuary"),
    ).toMatchObject({
      found: true,
      observedSchema: "cruor-inspiration-module-v2",
      observedSourceMode: "canonical-v2",
      canonical: true,
      fallback: false,
    });
    expect(
      report.rows.find((row) => row.moduleId === "decomposition"),
    ).toMatchObject({
      found: true,
      observedSchema: "cruor-inspiration-module-v2",
      observedSourceMode: "canonical-v2",
      canonical: true,
      fallback: false,
    });
    expect(
      report.rows.find((row) => row.moduleId === "the-mist"),
    ).toMatchObject({
      found: true,
      observedSchema: "cruor-inspiration-module-v2",
      observedSourceMode: "canonical-v2",
      canonical: true,
      fallback: false,
    });
    expect(
      report.rows.find((row) => row.moduleId === "wolf-spiders"),
    ).toMatchObject({
      found: true,
      observedSchema: "cruor-inspiration-module-v2",
      observedSourceMode: "canonical-v2",
      canonical: true,
      fallback: false,
    });
  });

  it("records explicit human approval separately from publication blockers", () => {
    const sedlec = getInspirationV2MigrationRecord("sedlec-ossuary");

    expect(sedlec).toMatchObject({
      migrationStatus: "complete",
      editorialStatus: "approved",
      semanticCoverageStatus: "complete",
      sampleQaStatus: "passed-zero-diagnostics",
      reviewer: "Danilo",
      reviewedAt: "2026-07-16",
      blockingIssues: [],
    });
    expect(isInspirationV2EditoriallyApproved(sedlec)).toBe(true);

    const decomposition = getInspirationV2MigrationRecord("decomposition");
    expect(decomposition).toMatchObject({
      migrationStatus: "complete",
      editorialStatus: "approved",
      semanticCoverageStatus: "complete",
      sampleQaStatus: "passed-zero-diagnostics",
      reviewer: "Danilo",
      reviewedAt: "2026-07-17",
      blockingIssues: ["image-provenance-required"],
    });
    expect(isInspirationV2EditoriallyApproved(decomposition)).toBe(true);

    const theMist = getInspirationV2MigrationRecord("the-mist");
    expect(theMist).toMatchObject({
      migrationStatus: "complete",
      editorialStatus: "approved",
      semanticCoverageStatus: "complete",
      sampleQaStatus: "passed-zero-diagnostics",
      reviewer: "Danilo",
      reviewedAt: "2026-07-17",
      blockingIssues: ["image-provenance-required"],
    });
    expect(isInspirationV2EditoriallyApproved(theMist)).toBe(true);

    const wolfSpiders = getInspirationV2MigrationRecord("wolf-spiders");
    expect(wolfSpiders).toMatchObject({
      migrationStatus: "candidate-ready",
      editorialStatus: "awaiting-human-signoff",
      semanticCoverageStatus: "complete",
      sampleQaStatus: "pending-local-verification",
      reviewer: "",
      reviewedAt: "",
      blockingIssues: [
        "human-editorial-signoff-required",
        "biological-source-review-required",
        "monster-graft-snapshot-required",
        "image-provenance-required",
      ],
    });
    expect(isInspirationV2EditoriallyApproved(wolfSpiders)).toBe(false);
  });
});
