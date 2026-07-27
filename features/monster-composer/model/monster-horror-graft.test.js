import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import {
  buildMonsterHorrorGraftEditorialCatalogAudit,
  isMonsterHorrorGraft,
} from "./monster-horror-graft.js";

const horrorGrafts = MONSTER_GRAFTS.filter(isMonsterHorrorGraft);

describe("Phase 6R Horror editorial review", () => {
  it("publishes one reviewed Horror Graft for every Monster source", () => {
    const audit = buildMonsterHorrorGraftEditorialCatalogAudit(MONSTER_GRAFTS);
    expect(horrorGrafts).toHaveLength(4);
    expect(audit).toMatchObject({
      total: 4,
      passing: 4,
      error: 0,
      abilityCount: 4,
      bundleCount: 0,
      scaledCount: 4,
      pass: true,
    });
    expect(audit.bySource).toEqual({
      decomposition: 1,
      jikininki: 1,
      "wax-death-masks": 1,
      "wolf-spiders": 1,
    });
    expect(audit.errors).toEqual([]);
  });

  it("keeps every Horror reveal bounded and player-answerable", () => {
    horrorGrafts.forEach((graft) => {
      expect(graft.counterplayProfile.telegraphs.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.positioningAnswers.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.breakConditions.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.nonDamageAnswers.length).toBeGreaterThan(0);
      expect(graft.abilities).toHaveLength(1);
      expect(graft.progression.bands.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("preserves canonical names where the Bestiary provides them", () => {
    expect(horrorGrafts.find((graft) => graft.id === "stench")?.title).toBe("Stench");
    expect(horrorGrafts.find((graft) => graft.id === "wail")?.title).toBe("Wail");
  });
});
