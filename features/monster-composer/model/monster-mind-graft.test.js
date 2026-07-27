import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import {
  MONSTER_MIND_GRAFT_EDITORIAL_IDS,
  MONSTER_MIND_GRAFT_EDITORIAL_VERSION,
  MONSTER_MIND_GRAFT_SCALED_IDS,
} from "../data/monster-mind-grafts.js";
import {
  buildMonsterMindGraftEditorialCatalogAudit,
  isMonsterMindGraft,
} from "./monster-mind-graft.js";

const mindGrafts = MONSTER_GRAFTS.filter(isMonsterMindGraft);

describe("Phase 6R Mind Graft editorial review", () => {
  it("closes the complete Mind family editorial gate", () => {
    const audit = buildMonsterMindGraftEditorialCatalogAudit(MONSTER_GRAFTS);

    expect(mindGrafts).toHaveLength(11);
    expect(mindGrafts.map((graft) => graft.id).sort()).toEqual(
      [...MONSTER_MIND_GRAFT_EDITORIAL_IDS].sort(),
    );
    expect(audit).toMatchObject({
      total: 11,
      expectedTotal: 11,
      passing: 11,
      warning: 0,
      error: 0,
      abilityCount: 17,
      bundleCount: 6,
      scaledCount: 3,
      pass: true,
    });
    expect(audit.errors).toEqual([]);
  });

  it("records a publishable behavioral decision for every Mind Graft", () => {
    mindGrafts.forEach((graft) => {
      expect(graft.editorial).toMatchObject({
        status: "reviewed",
        phase: "phase6r-mind-editorial-review",
        version: MONSTER_MIND_GRAFT_EDITORIAL_VERSION,
      });
      expect(graft.editorial.decision).toBeTruthy();
      expect(graft.editorial.rationale).toBeTruthy();
      expect(graft.identity.recognitionTags.length).toBeGreaterThanOrEqual(4);
      expect(graft.routine.mode).toBe("procedure");
      expect(graft.routine.defaultPlan).toBeTruthy();
      expect(graft.routine.targetSelection).toBeTruthy();
      expect(graft.counterplayProfile.telegraphs.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.positioningAnswers.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.breakConditions.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.nonDamageAnswers.length).toBeGreaterThan(0);
    });
  });

  it("uses bundles for distinct behavioral procedures", () => {
    const bundles = mindGrafts.filter((graft) => graft.abilities.length > 1);

    expect(bundles.map((graft) => graft.id).sort()).toEqual([
      "corpse-craving",
      "hundred-eyed",
      "hunter-spider",
      "maternal-swarm-instinct",
      "nocturnal-haunting",
      "shame-hunger",
    ]);
  });

  it("limits CR progression to the approved behavioral scalars", () => {
    const scaled = mindGrafts
      .filter((graft) => graft.progression?.bands?.length)
      .map((graft) => graft.id)
      .sort();

    expect(scaled).toEqual([...MONSTER_MIND_GRAFT_SCALED_IDS].sort());
  });
});
