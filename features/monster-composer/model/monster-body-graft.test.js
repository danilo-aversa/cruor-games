import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import {
  MONSTER_BODY_GRAFT_EDITORIAL_IDS,
  MONSTER_BODY_GRAFT_EDITORIAL_VERSION,
  MONSTER_BODY_GRAFT_SCALED_IDS,
} from "../data/monster-body-grafts.js";
import {
  buildMonsterBodyGraftEditorialCatalogAudit,
  isMonsterBodyGraft,
} from "./monster-body-graft.js";

const bodyGrafts = MONSTER_GRAFTS.filter(isMonsterBodyGraft);

describe("Phase 6R Body Graft editorial review", () => {
  it("closes the complete Body family editorial gate", () => {
    const audit = buildMonsterBodyGraftEditorialCatalogAudit(MONSTER_GRAFTS);

    expect(bodyGrafts).toHaveLength(12);
    expect(bodyGrafts.map((graft) => graft.id).sort()).toEqual(
      [...MONSTER_BODY_GRAFT_EDITORIAL_IDS].sort(),
    );
    expect(audit).toMatchObject({
      total: 12,
      expectedTotal: 12,
      passing: 12,
      warning: 0,
      error: 0,
      abilityCount: 14,
      bundleCount: 2,
      scaledCount: 3,
      pass: true,
    });
    expect(audit.errors).toEqual([]);
  });

  it("records a publishable editorial decision for every Body Graft", () => {
    bodyGrafts.forEach((graft) => {
      expect(graft.editorial).toMatchObject({
        status: "reviewed",
        phase: "phase6r-body-editorial-review",
        version: MONSTER_BODY_GRAFT_EDITORIAL_VERSION,
      });
      expect(graft.editorial.decision).toBeTruthy();
      expect(graft.editorial.rationale).toBeTruthy();
      expect(graft.identity.recognitionTags.length).toBeGreaterThanOrEqual(4);
      expect(graft.counterplayProfile.telegraphs.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.positioningAnswers.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.breakConditions.length).toBeGreaterThan(0);
      expect(graft.counterplayProfile.nonDamageAnswers.length).toBeGreaterThan(0);
    });
  });

  it("uses bundles only for independently readable body procedures", () => {
    const bundles = bodyGrafts.filter((graft) => graft.abilities.length > 1);

    expect(bundles.map((graft) => graft.id).sort()).toEqual([
      "egg-carrier",
      "ethereal-sight",
    ]);
    expect(
      bodyGrafts.find((graft) => graft.id === "ethereal-sight").abilities.map(
        (ability) => ability.id,
      ),
    ).toEqual(["grave-sight", "corpse-anchor"]);
    expect(
      bodyGrafts.find((graft) => graft.id === "egg-carrier").abilities.map(
        (ability) => ability.id,
      ),
    ).toEqual(["exposed-clutch", "hatching-cycle"]);
  });

  it("limits CR progression to the three approved chassis", () => {
    const scaled = bodyGrafts
      .filter((graft) => graft.progression?.bands?.length)
      .map((graft) => graft.id)
      .sort();

    expect(scaled).toEqual([...MONSTER_BODY_GRAFT_SCALED_IDS].sort());
  });
});
