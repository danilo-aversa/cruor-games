import assert from "node:assert/strict";
import { buildContentHealthReport } from "../features/inspiration-studio/health/content-health.model.js";
import { STATIC_CONTENT_PACKS, STATIC_CONTENT_PACK_ISSUES, STATIC_CONTENT_REGISTRY_DATA } from "../shared/content/static-registry.js";
import { loadInspirationModules } from "../shared/content/content.index.js";

const modules = await loadInspirationModules();
const report = buildContentHealthReport({
  contentPacks: STATIC_CONTENT_PACKS,
  registryData: STATIC_CONTENT_REGISTRY_DATA,
  staticIssues: STATIC_CONTENT_PACK_ISSUES,
  modules,
});

assert.equal(report.reportType, "cruor-studio-content-health-report");
assert.ok(report.summary.components > 0, "Health report should include components.");
assert.ok(report.summary.sourceAnchors > 0, "Health report should include source anchors.");
assert.ok(Array.isArray(report.issues), "Health report should include issues array.");
assert.ok(report.coverage.componentsByType.length > 0, "Health report should include component type coverage.");
assert.ok(report.moduleReports.length >= modules.length, "Health report should include module reports.");

const blocking = report.issues.filter((issue) => issue.severity === "error");
console.log(`Studio content health OK — ${report.summary.components} components, ${report.issues.length} issues (${blocking.length} errors).`);
