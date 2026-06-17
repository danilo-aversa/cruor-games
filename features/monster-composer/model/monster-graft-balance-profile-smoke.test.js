import assert from "node:assert/strict";
import { ALL_MONSTER_GRAFTS } from "../data/monster-content-pack-feed.js";
import {
  buildLegacyStatsMigrationAudit,
  getFeatureBalanceStat,
  getFeatureBalanceStats,
  getMonsterGraftBalanceProfile,
  sumFeatureBalanceStats,
} from "./monster-graft-balance-profile.js";

function runBalanceProfileSmokeTest() {
  assert.equal(ALL_MONSTER_GRAFTS.length, 90, "expected current graft catalog size");

  ALL_MONSTER_GRAFTS.forEach((feature) => {
    const profile = getMonsterGraftBalanceProfile(feature);
    assert.equal(profile.schemaVersion, "monster-graft-balance-v1.0");
    Object.entries(profile.stats).forEach(([key, value]) => {
      assert.equal(Number.isFinite(value), true, `${feature.id} ${key} must be numeric`);
    });
    Object.entries(feature.stats || {}).forEach(([key, value]) => {
      if (!(key in profile.stats)) return;
      assert.equal(getFeatureBalanceStat(feature, key), Number(value || 0), `${feature.id} ${key} must preserve legacy stat value`);
    });
  });

  const firstFive = ALL_MONSTER_GRAFTS.slice(0, 5);
  const summed = sumFeatureBalanceStats(firstFive);
  const manualHp = firstFive.reduce((sum, feature) => sum + Number(feature.stats?.hp || 0), 0);
  assert.equal(summed.hp, manualHp, "summed hp must match legacy aggregate");

  const audit = buildLegacyStatsMigrationAudit(ALL_MONSTER_GRAFTS);
  assert.equal(audit.total, 90);
  assert.equal(audit.usingLegacyStats, 90);
  assert.equal(audit.usingBalanceProfile, 0);
  assert.equal(getFeatureBalanceStats({ id: "empty" }).dpr, 0);
}

runBalanceProfileSmokeTest();
console.log("monster-graft-balance-profile smoke test passed");
