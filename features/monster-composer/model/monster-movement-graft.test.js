import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import {
  MONSTER_MOVEMENT_GRAFT_EDITORIAL_IDS,
  MONSTER_MOVEMENT_GRAFT_EDITORIAL_VERSION,
  MONSTER_MOVEMENT_GRAFT_SCALED_IDS,
} from "../data/monster-movement-grafts.js";
import {
  buildMonsterMovementGraftEditorialCatalogAudit,
  isMonsterMovementGraft,
} from "./monster-movement-graft.js";

const movementGrafts = MONSTER_GRAFTS.filter(isMonsterMovementGraft);

describe("Phase 6R Movement Graft editorial review", () => {
  it("closes the complete Movement family editorial gate", () => {
    const audit = buildMonsterMovementGraftEditorialCatalogAudit(MONSTER_GRAFTS);

    expect(movementGrafts).toHaveLength(11);
    expect(movementGrafts.map((graft) => graft.id).sort()).toEqual(
      [...MONSTER_MOVEMENT_GRAFT_EDITORIAL_IDS].sort(),
    );
    expect(audit).toMatchObject({
      total: 11,
      expectedTotal: 11,
      passing: 11,
      warning: 0,
      error: 0,
      abilityCount: 13,
      bundleCount: 2,
      scaledCount: 6,
      pass: true,
    });
    expect(audit.errors).toEqual([]);
  });

  it("records a publishable movement decision for every Movement Graft", () => {
    movementGrafts.forEach((graft) => {
      expect(graft.editorial).toMatchObject({
        status: "reviewed",
        phase: "phase6r-movement-editorial-review",
        version: MONSTER_MOVEMENT_GRAFT_EDITORIAL_VERSION,
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

  it("uses bundles for distinct movement procedures", () => {
    const bundles = movementGrafts.filter((graft) => graft.abilities.length > 1);

    expect(bundles.map((graft) => graft.id).sort()).toEqual([
      "wall-crawler",
      "web-dancer",
    ]);
  });

  it("limits CR progression to the approved movement scalars", () => {
    const scaled = movementGrafts
      .filter((graft) => graft.progression?.bands?.length)
      .map((graft) => graft.id)
      .sort();

    expect(scaled).toEqual([...MONSTER_MOVEMENT_GRAFT_SCALED_IDS].sort());
  });
  it("keeps Predatory Leap positional at low CR and unlocks the isolation reward later", () => {
    const leap = movementGrafts.find((graft) => graft.id === "predatory-jump");
    const lowBand = leap.progression.bands.find((band) => band.minCr === 0);
    const highBand = leap.progression.bands.find((band) => band.minCr === 5);
    const lowText = lowBand.abilityPatches["predatory-leap"].mechanics.toLowerCase();
    const highText = highBand.abilityPatches["predatory-leap"].mechanics.toLowerCase();

    expect(leap.stats.mobility).toBe(1);
    expect(lowText).not.toContain("advantage");
    expect(highText).toContain("advantage");
  });

});
