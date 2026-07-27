import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import {
  buildMonsterDeathGraftEditorialCatalogAudit,
  isMonsterDeathGraft,
} from "./monster-death-graft.js";

const deathGrafts = MONSTER_GRAFTS.filter(isMonsterDeathGraft);

describe("Phase 6R Death editorial review", () => {
  it("publishes the complete reviewed Death family without changing stable IDs", () => {
    const audit = buildMonsterDeathGraftEditorialCatalogAudit(MONSTER_GRAFTS);
    expect(deathGrafts).toHaveLength(8);
    expect(audit).toMatchObject({
      total: 8,
      passing: 8,
      error: 0,
      abilityCount: 10,
      bundleCount: 2,
      scaledCount: 4,
      pass: true,
    });
    expect(audit.bySource).toEqual({
      decomposition: 3,
      jikininki: 2,
      "wax-death-masks": 1,
      "wolf-spiders": 2,
    });
    expect(audit.errors).toEqual([]);
  });

  it("gives every Death Effect a readable trigger and complete player answer", () => {
    deathGrafts.forEach((graft) => {
      expect(graft.counterplayProfile.telegraphs.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.positioningAnswers.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.breakConditions.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.nonDamageAnswers.length).toBeGreaterThan(0);
      expect(graft.abilities.length).toBeGreaterThanOrEqual(1);
      expect(graft.abilities.length).toBeLessThanOrEqual(2);
      expect(graft.editorial.phase).toBe("phase6r-death-editorial-review");
      graft.abilities.forEach((ability) => {
        expect(ability.rules.section).toBe("death");
        expect(ability.rules.actionEconomy).toBe("deathTrigger");
        expect(ability.rules.usage.type).toBe("death");
      });
    });
  });

  it("removes random mass hatching and vague legacy clue procedures", () => {
    const publicText = deathGrafts
      .flatMap((graft) => [graft.summary, graft.mechanics, graft.counterplay])
      .join(" ")
      .toLowerCase();
    expect(publicText).not.toContain("hatches on a 13 or higher");
    expect(publicText).not.toContain("one clue tied to the source anchor");
    expect(publicText).not.toContain("until cleaned or burned away");
  });

  it("uses bundles only where the aftermath contains two distinct procedures", () => {
    expect(deathGrafts.find((graft) => graft.id === "spectral-dust-death")?.abilities)
      .toHaveLength(2);
    expect(deathGrafts.find((graft) => graft.id === "silk-cocoon-remains")?.abilities)
      .toHaveLength(2);
    expect(deathGrafts.find((graft) => graft.id === "egg-hatch-death")?.abilities)
      .toHaveLength(1);
  });
});
