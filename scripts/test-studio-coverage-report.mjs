import assert from "node:assert/strict";
import { buildContentCoverageReport } from "../features/inspiration-studio/coverage/content-coverage.model.js";
import { ALL_MONSTER_GRAFTS } from "../features/monster-composer/data/monster-content-pack-feed.js";
import { STATIC_CONTENT_REGISTRY_DATA } from "../shared/content/static-registry.js";
import { loadInspirationModules } from "../shared/content/content.index.js";

const modules = await loadInspirationModules();
const report = buildContentCoverageReport({
  registryData: STATIC_CONTENT_REGISTRY_DATA,
  modules,
  nativeMonsterGrafts: ALL_MONSTER_GRAFTS,
});

assert.equal(report.reportType, "cruor-studio-content-coverage-report");
assert.ok(report.summary.components > 0, "Coverage report should include components.");
assert.ok(report.summary.monsterComponents > 0, "Coverage report should include monster entries.");
assert.ok(report.monster.bySlot.length > 0, "Monster slot coverage missing.");
assert.ok(report.monster.slotByActionMatrix.length > 0, "Monster slot/action matrix missing.");
assert.ok(report.location.bySlot.length > 0, "Location slot coverage missing.");
assert.ok(Array.isArray(report.gaps), "Coverage gaps should be an array.");

console.log(`Studio coverage OK — ${report.summary.monsterComponents} monster entries, ${report.summary.locationComponents} location entries, ${report.gaps.length} gaps.`);
