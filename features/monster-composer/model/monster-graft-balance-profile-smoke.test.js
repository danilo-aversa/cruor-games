import { describe, expect, it } from "vitest";

import { ALL_MONSTER_GRAFTS } from "../data/monster-content-pack-feed.js";
import {
  buildLegacyStatsMigrationAudit,
  getFeatureBalanceStat,
  getFeatureBalanceStats,
  getMonsterGraftBalanceProfile,
  sumFeatureBalanceStats,
} from "./monster-graft-balance-profile.js";

describe("Monster graft balance profile smoke", () => {
  it("normalizes legacy stats into stable balance profiles", () => {
    expect(ALL_MONSTER_GRAFTS).toHaveLength(90);

    ALL_MONSTER_GRAFTS.forEach((feature) => {
      const profile = getMonsterGraftBalanceProfile(feature);
      expect(profile.schemaVersion).toBe("monster-graft-balance-v1.0");

      Object.entries(profile.stats).forEach(([key, value]) => {
        expect(Number.isFinite(value), `${feature.id} ${key} must be numeric`).toBe(true);
      });

      Object.entries(feature.stats || {}).forEach(([key, value]) => {
        if (!(key in profile.stats)) return;
        expect(getFeatureBalanceStat(feature, key), `${feature.id} ${key} must preserve legacy stat value`).toBe(Number(value || 0));
      });
    });

    const firstFive = ALL_MONSTER_GRAFTS.slice(0, 5);
    const summed = sumFeatureBalanceStats(firstFive);
    const manualHp = firstFive.reduce((sum, feature) => sum + Number(feature.stats?.hp || 0), 0);
    expect(summed.hp).toBe(manualHp);

    const audit = buildLegacyStatsMigrationAudit(ALL_MONSTER_GRAFTS);
    expect(audit.total).toBe(90);
    expect(audit.usingLegacyStats).toBe(90);
    expect(audit.usingBalanceProfile).toBe(0);
    expect(getFeatureBalanceStats({ id: "empty" }).dpr).toBe(0);
  });
});
