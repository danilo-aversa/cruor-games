import { describe, expect, it } from "vitest";

import {
  CRUOR_INSPIRATION_MODULES,
  buildInspirationV2MigrationAudit,
  getInspirationV2MigrationRecord,
  isInspirationV2EditoriallyApproved,
  listInspirationV2MigrationRecords,
} from "../content.index.js";

const ORDER = [
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
  "jikininki"
];
const APPROVED = ORDER.slice(0, 11);
const CANDIDATES = [
  "wax-death-masks",
  "anthropodermic-bibliopegy",
  "jikininki"
];

describe("Phase 8 Inspiration v2 migration registry", () => {
  it("tracks all 14 Inspirations in the approved batch order", () => {
    expect(listInspirationV2MigrationRecords().map((record) => record.moduleId)).toEqual(ORDER);
  });

  it("classifies 14 canonical v2 modules", () => {
    const report = buildInspirationV2MigrationAudit(CRUOR_INSPIRATION_MODULES);
    expect(report.summary).toEqual({
      total: 14,
      canonicalV2: 14,
      legacyV1: 0,
      registryFallback: 0,
      missing: 0,
      approved: 11,
      awaitingEditorialApproval: 3,
    });
    [...APPROVED, ...CANDIDATES].forEach((moduleId) => {
      expect(report.rows.find((row) => row.moduleId === moduleId)).toMatchObject({
        found: true,
        observedSchema: "cruor-inspiration-module-v2",
        observedSourceMode: "canonical-v2",
        canonical: true,
        fallback: false,
      });
    });
  });

  it("records 11 approvals and the current final candidates", () => {
    APPROVED.forEach((moduleId) => {
      const record = getInspirationV2MigrationRecord(moduleId);
      expect(record).toMatchObject({
        migrationStatus: "complete",
        editorialStatus: "approved",
        semanticCoverageStatus: "complete",
        sampleQaStatus: "passed-zero-diagnostics",
        reviewer: "Danilo",
        blockingIssues: ["image-provenance-required"],
      });
      expect(isInspirationV2EditoriallyApproved(record)).toBe(true);
    });
    {
      const record = getInspirationV2MigrationRecord("wax-death-masks");
      expect(record).toMatchObject({
        migrationStatus: "candidate-ready",
        editorialStatus: "awaiting-human-signoff",
        semanticCoverageStatus: "complete",
        sampleQaStatus: "pending-local-verification",
        reviewer: "",
        candidate: { reviewVersion: "phase8-wax-death-masks-editorial-candidate-v1" },
      });
      expect(isInspirationV2EditoriallyApproved(record)).toBe(false);
    }
    {
      const record = getInspirationV2MigrationRecord("anthropodermic-bibliopegy");
      expect(record).toMatchObject({
        migrationStatus: "candidate-ready",
        editorialStatus: "awaiting-human-signoff",
        semanticCoverageStatus: "complete",
        sampleQaStatus: "pending-local-verification",
        reviewer: "",
        candidate: { reviewVersion: "phase8-anthropodermic-bibliopegy-editorial-candidate-v1" },
      });
      expect(isInspirationV2EditoriallyApproved(record)).toBe(false);
    }
    {
      const record = getInspirationV2MigrationRecord("jikininki");
      expect(record).toMatchObject({
        migrationStatus: "candidate-ready",
        editorialStatus: "awaiting-human-signoff",
        semanticCoverageStatus: "complete",
        sampleQaStatus: "pending-local-verification",
        reviewer: "",
        candidate: { reviewVersion: "phase8-jikininki-editorial-candidate-v1" },
      });
      expect(isInspirationV2EditoriallyApproved(record)).toBe(false);
    }

  });

  it("tracks modern Monster ownership externally", () => {
    expect(getInspirationV2MigrationRecord("decomposition").modernCapabilityLinks).toEqual([
      expect.objectContaining({ sourceAnchorId: "decomposition", expectedEntries: 26 }),
    ]);
    expect(getInspirationV2MigrationRecord("wolf-spiders").modernCapabilityLinks).toEqual([
      expect.objectContaining({ sourceAnchorId: "wolf-spiders", expectedEntries: 32 }),
    ]);
    expect(getInspirationV2MigrationRecord("wax-death-masks").modernCapabilityLinks).toEqual([
      expect.objectContaining({ sourceAnchorId: "wax-death-masks", expectedEntries: 7 }),
    ]);
    expect(getInspirationV2MigrationRecord("jikininki").modernCapabilityLinks).toEqual([
      expect.objectContaining({ sourceAnchorId: "jikininki", expectedEntries: 25 }),
    ]);
  });
});
