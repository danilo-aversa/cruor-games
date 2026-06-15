import assert from "node:assert/strict";
import { buildStudioAuditBundle } from "../features/inspiration-studio/reports/studio-audit-bundle.model.js";
import { ALL_MONSTER_GRAFTS } from "../features/monster-composer/data/monster-content-pack-feed.js";
import { loadInspirationModules } from "../shared/content/content.index.js";

const modules = await loadInspirationModules();
const draft = modules[0];
const bundle = buildStudioAuditBundle({
  draft,
  modules,
  libraryGrafts: ALL_MONSTER_GRAFTS,
});

assert.equal(bundle.reportType, "cruor-studio-audit-bundle");
assert.ok(bundle.files["studio-health-report.json"], "Audit bundle missing health report.");
assert.ok(bundle.files["coverage-report.json"], "Audit bundle missing coverage report.");
assert.ok(bundle.files["graft-ledger-report.json"], "Audit bundle missing ledger report.");
assert.ok(bundle.files["readiness-report.json"], "Audit bundle missing readiness report.");
assert.ok(bundle.files["content-pack-export.json"], "Audit bundle missing content pack export.");
assert.ok(bundle.files["validation-issues.json"], "Audit bundle missing validation report.");
assert.ok(bundle.summary.health.components > 0, "Audit bundle health summary should include components.");
assert.ok(bundle.summary.ledger.total > 0, "Audit bundle ledger summary should include grafts.");

console.log(`Studio audit bundle OK — ${Object.keys(bundle.files).length} bundled reports for ${bundle.scope.currentModuleTitle}.`);
