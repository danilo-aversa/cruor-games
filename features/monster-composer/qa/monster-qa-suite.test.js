import { describe, expect, it } from "vitest";

import { runMonsterQaSuite } from "./monster-qa-suite.js";

const EXPECTED_MONSTER_QA_SUITES = Object.freeze([
  "monster-content",
  "monster-presets",
  "monster-frame-scaling",
  "monster-frame-fit-diversity",
  "monster-generation",
]);

// The combined five-suite smoke report takes about 8 seconds under full-suite load.
const MONSTER_QA_TEST_TIMEOUT_MS = 15_000;

describe("Monster Composer QA suite", () => {
  it(
    "builds the shared npm/Admin Studio QA report shape",
    () => {
      const report = runMonsterQaSuite({ mode: "vitest-smoke" });

      expect(report.reportType).toBe("cruor-monster-qa-report");
      expect(report.suites.map((suite) => suite.id)).toEqual(
        EXPECTED_MONSTER_QA_SUITES,
      );
      expect(report.summary.total).toBe(report.issues.length);
      expect(report.groupedIssues.length).toBeLessThanOrEqual(
        report.issues.length,
      );
    },
    MONSTER_QA_TEST_TIMEOUT_MS,
  );
});
