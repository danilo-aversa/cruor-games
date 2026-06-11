import { describe, expect, it } from "vitest";

import { runMonsterQaSuite } from "./monster-qa-suite.js";

describe("Monster Composer QA suite", () => {
  it("runs the shared npm/Admin Studio QA engine without errors", () => {
    const report = runMonsterQaSuite({ mode: "vitest" });

    expect(report.summary.error, JSON.stringify(report.groupedIssues.filter((issue) => issue.severity === "error"), null, 2)).toBe(0);
    expect(report.suites.map((suite) => suite.id)).toEqual([
      "monster-content",
      "monster-presets",
      "monster-frame-scaling",
      "monster-frame-fit-diversity",
      "monster-generation",
    ]);
  });
});
