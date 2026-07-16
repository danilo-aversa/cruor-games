import { describe, expect, it } from "vitest";

import { SEDLEC_OSSUARY_SEMANTIC_V2_PACK } from "../../../shared/content/content.index.js";
import { getStudioIssueFieldLink } from "./studio-field-links.js";
import {
  buildStudioSemanticCoverage,
  buildStudioSemanticCoverageMatrix,
} from "./studio-semantic-coverage.js";

describe("Studio semantic coverage", () => {
  it("reports complete capability-dependent coverage for the Sedlec reference module", () => {
    const module = SEDLEC_OSSUARY_SEMANTIC_V2_PACK.modules[0];
    const report = buildStudioSemanticCoverage(module);
    expect(report.ready).toBe(true);
    expect(report.summary).toMatchObject({
      required: 7,
      covered: 7,
      partial: 0,
      missing: 0,
    });
    expect(report.issues).toEqual([]);
  });

  it("reports missing semantic types and exact component field paths", () => {
    const module = structuredClone(SEDLEC_OSSUARY_SEMANTIC_V2_PACK.modules[0]);
    module.components = module.components.filter(
      (component) => component.semanticType !== "sensory-profile",
    );
    const globalRule = module.components.find(
      (component) => component.semanticType === "global-rule",
    );
    globalRule.semantic.trigger.events = [];

    const report = buildStudioSemanticCoverage(module);
    expect(report.ready).toBe(false);
    expect(
      report.rows.find((row) => row.semanticType === "sensory-profile").status,
    ).toBe("missing");
    const fieldIssue = report.issues.find(
      (issue) =>
        issue.componentId === globalRule.id &&
        issue.path.endsWith("semantic.trigger.events"),
    );
    expect(fieldIssue).toBeTruthy();
    expect(getStudioIssueFieldLink(fieldIssue)).toMatchObject({
      componentId: globalRule.id,
      fieldPath: "semantic.trigger.events",
      fieldId: expect.stringContaining(globalRule.id),
    });
  });

  it("builds Inspiration × capability × semantic type matrix rows", () => {
    const rows = buildStudioSemanticCoverageMatrix(
      SEDLEC_OSSUARY_SEMANTIC_V2_PACK.modules,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      moduleId: "sedlec-ossuary",
      capabilities: expect.arrayContaining(["dark-places"]),
      semanticTypes: {
        "place-identity": { status: "covered", required: true, count: 1 },
        "recurring-sign": { status: "covered", required: true, count: 4 },
      },
    });
  });
});
