import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import {
  buildMonsterLairGraftEditorialCatalogAudit,
  isMonsterLairGraft,
} from "./monster-lair-graft.js";

const lairGrafts = MONSTER_GRAFTS.filter(isMonsterLairGraft);

describe("Phase 6R Lair editorial review", () => {
  it("publishes the complete reviewed Lair family without changing stable IDs", () => {
    const audit = buildMonsterLairGraftEditorialCatalogAudit(MONSTER_GRAFTS);
    expect(lairGrafts).toHaveLength(7);
    expect(audit).toMatchObject({
      total: 7,
      passing: 7,
      error: 0,
      abilityCount: 7,
      bundleCount: 0,
      scaledCount: 4,
      pass: true,
    });
    expect(audit.bySource).toEqual({
      decomposition: 2,
      jikininki: 2,
      "wolf-spiders": 3,
    });
    expect(audit.errors).toEqual([]);
  });

  it("gives every Lair Effect a bounded area and four player-facing answers", () => {
    lairGrafts.forEach((graft) => {
      expect(graft.abilities).toHaveLength(1);
      const ability = graft.abilities[0];
      expect(ability.rules.section).toBe("lairAction");
      expect(ability.rules.actionEconomy).toBe("lairAction");
      expect(ability.rules.usage.type).toBe("lair");
      expect(ability.rules.areaEffect.enabled).toBe(true);
      expect(ability.rules.areaEffect.size).toBeGreaterThan(0);
      expect(ability.rules.procedure.enabled).toBe(true);
      expect(graft.counterplayProfile.telegraphs.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.positioningAnswers.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.breakConditions.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.nonDamageAnswers.length).toBeGreaterThan(0);
    });
  });

  it("keeps the three Wolf Spider Lair Effects mechanically distinct", () => {
    const snapping = lairGrafts.find((graft) => graft.id === "sticky-surroundings");
    const prison = lairGrafts.find((graft) => graft.id === "broodmother-web-lair");
    const terrain = lairGrafts.find((graft) => graft.id === "dense-web-region");

    expect(snapping.mechanics).toMatch(/first creature/i);
    expect(snapping.mechanics).toMatch(/can't trigger again/i);
    expect(prison.mechanics).toMatch(/maintain only one/i);
    expect(prison.mechanics).toMatch(/can't use another Lair Effect/i);
    expect(terrain.mechanics).toMatch(/no more than two Dense Web regions/i);
    expect(terrain.mechanics).toMatch(/can't take the Hide action/i);
  });

  it("removes the legacy global and noncanonical Lair mechanics", () => {
    const combined = lairGrafts.map((graft) => graft.mechanics).join("\n");
    expect(combined).not.toMatch(/spellcasting ability check/i);
    expect(combined).not.toMatch(/immune to this lair action for 24 hours/i);
    expect(combined).not.toMatch(/disadvantage on Dexterity Saving Throws/i);
    expect(combined).not.toMatch(/surprised targets.*advantage/i);
  });
});
