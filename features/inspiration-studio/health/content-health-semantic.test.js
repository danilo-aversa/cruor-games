import { describe, expect, it } from "vitest";

import { SEDLEC_OSSUARY_SEMANTIC_V2_PACK } from "../../../shared/content/content.index.js";
import { buildContentCoverageReport } from "../coverage/content-coverage.model.js";
import { buildContentPackExport } from "../model/studio-export.js";
import { buildPublishReadinessReport } from "../model/studio-readiness.js";
import { validateStudioDraft } from "../model/studio-validation.js";
import { buildContentHealthReport } from "./content-health.model.js";

const EMPTY_REGISTRY = {
  components: [],
  inspirations: [],
  sourceAnchors: [],
  workflows: [],
  slots: [],
};

describe("Phase 7 semantic Health, Coverage and Readiness", () => {
  it("reports v2 schema counts, semantic coverage and editorial state", () => {
    const module = SEDLEC_OSSUARY_SEMANTIC_V2_PACK.modules[0];
    const report = buildContentHealthReport({
      contentPacks: [SEDLEC_OSSUARY_SEMANTIC_V2_PACK],
      registryData: EMPTY_REGISTRY,
      staticIssues: [],
      modules: [module],
    });
    expect(report.summary.schemas).toEqual({ total: 1, v1: 0, v2: 1 });
    expect(report.coverage.semanticComponentsByType).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "place-identity", count: 1 }),
        expect.objectContaining({ id: "recurring-sign", count: 4 }),
      ]),
    );
    expect(module.inspiration.status).toBe("approved");
    expect(
      report.issues.some(
        (issue) =>
          issue.area === "Editorial" &&
          issue.path === "inspiration.status",
      ),
    ).toBe(false);
  });

  it("builds semantic matrix rows and publishes them through readiness", () => {
    const module = SEDLEC_OSSUARY_SEMANTIC_V2_PACK.modules[0];
    const pack = buildContentPackExport(module);
    const validation = validateStudioDraft(module, pack);
    const coverage = buildContentCoverageReport({
      registryData: EMPTY_REGISTRY,
      modules: [module],
      nativeMonsterGrafts: [],
    });
    const readiness = buildPublishReadinessReport(
      module,
      validation,
      pack,
      pack.modules[0],
    );
    expect(
      coverage.semantic.rows[0].semanticTypes["session-guide"],
    ).toMatchObject({
      status: "covered",
      required: true,
    });
    expect(readiness.readiness.semanticCoverage).toMatchObject({
      covered: 7,
      missing: 0,
      partial: 0,
    });
    expect(readiness.semanticCoverage).toHaveLength(7);
  });
});
