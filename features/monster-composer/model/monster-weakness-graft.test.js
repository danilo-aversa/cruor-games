import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import {
  buildMonsterWeaknessGraftEditorialCatalogAudit,
  isMonsterWeaknessGraft,
} from "./monster-weakness-graft.js";

const weaknessGrafts = MONSTER_GRAFTS.filter(isMonsterWeaknessGraft);

describe("Phase 6R Weakness editorial review", () => {
  it("publishes the complete reviewed Weakness family without changing stable IDs", () => {
    const audit = buildMonsterWeaknessGraftEditorialCatalogAudit(MONSTER_GRAFTS);
    expect(weaknessGrafts).toHaveLength(13);
    expect(audit).toMatchObject({
      total: 13,
      passing: 13,
      error: 0,
      abilityCount: 13,
      bundleCount: 0,
      scaledCount: 3,
      pass: true,
    });
    expect(audit.bySource).toEqual({
      decomposition: 3,
      jikininki: 4,
      "wax-death-masks": 1,
      "wolf-spiders": 5,
    });
    expect(audit.errors).toEqual([]);
  });

  it("gives every Weakness a complete player-facing answer", () => {
    weaknessGrafts.forEach((graft) => {
      expect(graft.counterplayProfile.telegraphs.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.positioningAnswers.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.breakConditions.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.nonDamageAnswers.length).toBeGreaterThan(0);
      expect(graft.abilities).toHaveLength(1);
      expect(graft.editorial.phase).toBe("phase6r-weakness-editorial-review");
    });
  });

  it("removes arbitrary called-shot penalties and cross-graft dependencies", () => {
    const publicText = weaknessGrafts
      .flatMap((graft) => [graft.summary, graft.mechanics, graft.counterplay])
      .join(" ")
      .toLowerCase();
    expect(publicText).not.toContain("-5");
    expect(publicText).not.toContain("more than half its maximum hit points");
    expect(publicText).not.toContain("balance check");
    expect(publicText).not.toContain("unstable reactions");
    expect(publicText).not.toContain("incorporeal movement");
  });

  it("uses canonical titles where the mechanic is canonical", () => {
    expect(weaknessGrafts.find((graft) => graft.id === "daytime-weakness")?.title).toBe(
      "Sunlight Weakness",
    );
    expect(weaknessGrafts.find((graft) => graft.id === "fear-of-fire")?.title).toBe(
      "Fear of Fire",
    );
  });
});
