import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import {
  buildMonsterTwistGraftCatalogAudit,
  isMonsterTwistGraft,
} from "./monster-twist-graft.js";

const twistGrafts = MONSTER_GRAFTS.filter(isMonsterTwistGraft);

describe("Phase 6R Twist editorial review", () => {
  it("publishes the complete reviewed Twist catalog", () => {
    const audit = buildMonsterTwistGraftCatalogAudit(MONSTER_GRAFTS);
    expect(twistGrafts).toHaveLength(12);
    expect(audit).toMatchObject({
      total: 12,
      passing: 12,
      error: 0,
      abilityCount: 17,
      bundleCount: 5,
      progressionCount: 6,
      pass: true,
    });
    expect(audit.errors).toEqual([]);
  });

  it("gives every Twist a visible state change and four counterplay channels", () => {
    twistGrafts.forEach((graft) => {
      expect(graft.routine.defaultPlan).not.toBe("");
      expect(graft.routine.targetSelection).not.toBe("");
      expect(graft.counterplayProfile.telegraphs.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.positioningAnswers.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.breakConditions.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.nonDamageAnswers.length).toBeGreaterThan(0);
    });
  });

  it("preserves canonical Bestiary names where the feature remains recognizable", () => {
    expect(twistGrafts.find((graft) => graft.id === "undead-fortitude")?.title).toBe(
      "Undead Fortitude",
    );
    expect(twistGrafts.find((graft) => graft.id === "siege-corpse")?.title).toBe(
      "Siege Monster",
    );
  });

  it("removes hidden random escalation and automatic ambush criticals", () => {
    const text = JSON.stringify(twistGrafts).toLowerCase();
    expect(text).not.toMatch(/roll a d6/);
    expect(text).not.toMatch(/any hit[^.]*critical hit/);
  });
});
