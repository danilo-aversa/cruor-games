import { describe, expect, it } from "vitest";
import {
  buildFinalMonsterEvaluation,
  projectFinalEvaluationToLegacyProfiles,
} from "./monster-final-evaluation.js";

function action(id, overrides = {}) {
  return {
    id,
    title: id,
    section: "action",
    actionEconomy: "action",
    usage: { type: "atWill" },
    damage: { hasDamage: true, entries: [{ id: `${id}-damage`, expectedTargets: 1 }] },
    conditions: [],
    effects: [],
    counterplay: {},
    ...overrides,
  };
}

function baseInput(overrides = {}) {
  return {
    targetCr: 2,
    baseline: { dpr: 15, hp: 45, ac: 13 },
    printedStats: { dpr: 15, hp: 45, ac: 13 },
    dprProfile: {
      effectiveDpr3Round: 15,
      averageDpr: 15,
      burstDpr: 15,
      sustainedDpr: 15,
      openingBurstDelta: 0,
      rounds: { round1: 15, round2: 15, round3: 15 },
      actionEconomy: { mainActionOptionCount: 1 },
      sources: [{ abilityId: "strike", expectedTargets: 1 }],
    },
    effectiveProfile: {
      effectiveDpr3Round: 15,
      burstDpr: 15,
      sustainedDpr: 15,
      effectiveHp: 45,
      conditionProfile: {
        majorCount: 0,
        severeCount: 0,
        repeatedHardControlCount: 0,
        crAdjustment: 0,
        controlPressure: 0,
      },
    },
    crValidation: {
      estimatedCr: 2,
      offensive: { cr: 2 },
      defensive: { cr: 2 },
    },
    abilityModel: { abilities: [action("strike")] },
    attackRoutine: { enabled: false, count: 1, attacks: [], replacements: [], additions: [] },
    mechanicsSummary: { complexityTags: {} },
    tempoProfile: { pressureMod: 0 },
    monsterTier: { pressureMod: 0 },
    counterplayAudit: { score: 50, rating: "Playable", issues: [] },
    selectedFeatures: [],
    buildBudget: 14,
    buildCost: 4,
    complexityCap: 10,
    ...overrides,
  };
}

describe("final monster evaluation v2", () => {
  it("keeps all public measures on the 0-10 scale", () => {
    const evaluation = buildFinalMonsterEvaluation(baseInput());
    for (const key of ["pressure", "complexity", "counterplay", "spikeRisk"]) {
      expect(evaluation[key].score).toBeGreaterThanOrEqual(0);
      expect(evaluation[key].score).toBeLessThanOrEqual(10);
    }
  });

  it("raises pressure and spike risk when the final compiled damage becomes burstier", () => {
    const baseline = buildFinalMonsterEvaluation(baseInput());
    const burst = buildFinalMonsterEvaluation(baseInput({
      printedStats: { dpr: 17, hp: 45, ac: 13 },
      dprProfile: {
        effectiveDpr3Round: 17,
        averageDpr: 17,
        burstDpr: 30,
        sustainedDpr: 10,
        openingBurstDelta: 13,
        rounds: { round1: 30, round2: 10, round3: 10 },
        actionEconomy: { mainActionOptionCount: 1 },
        sources: [{ abilityId: "strike", expectedTargets: 1 }],
      },
      effectiveProfile: {
        effectiveDpr3Round: 17,
        burstDpr: 30,
        sustainedDpr: 10,
        effectiveHp: 45,
        conditionProfile: {},
      },
      crValidation: {
        estimatedCr: 3,
        offensive: { cr: 4 },
        defensive: { cr: 2 },
      },
    }));
    expect(burst.pressure.score).toBeGreaterThan(baseline.pressure.score);
    expect(burst.spikeRisk.score).toBeGreaterThan(baseline.spikeRisk.score);
  });

  it("raises pressure for hard control in the finalized condition profile", () => {
    const baseline = buildFinalMonsterEvaluation(baseInput());
    const controlled = buildFinalMonsterEvaluation(baseInput({
      effectiveProfile: {
        effectiveDpr3Round: 15,
        burstDpr: 15,
        sustainedDpr: 15,
        effectiveHp: 45,
        conditionProfile: {
          majorCount: 1,
          severeCount: 1,
          repeatedHardControlCount: 1,
          crAdjustment: 1,
          controlPressure: 3,
        },
      },
    }));
    expect(controlled.pressure.score).toBeGreaterThan(baseline.pressure.score);
    expect(controlled.spikeRisk.score).toBeGreaterThan(baseline.spikeRisk.score);
  });

  it("does not subtract counterplay from pressure", () => {
    const unsafe = buildFinalMonsterEvaluation(baseInput({
      counterplayAudit: { score: 10, rating: "Unsafe", issues: [{ severity: "critical" }] },
    }));
    const excellent = buildFinalMonsterEvaluation(baseInput({
      counterplayAudit: { score: 95, rating: "Strong", issues: [] },
    }));
    expect(excellent.counterplay.score).toBeGreaterThan(unsafe.counterplay.score);
    expect(excellent.pressure.score).toBe(unsafe.pressure.score);
    expect(excellent.spikeRisk.score).toBe(unsafe.spikeRisk.score);
  });

  it("keeps pressure independent from the build-point budget", () => {
    const lowBudget = buildFinalMonsterEvaluation(baseInput({ buildBudget: 8, buildCost: 7 }));
    const highBudget = buildFinalMonsterEvaluation(baseInput({ buildBudget: 24, buildCost: 7 }));
    expect(lowBudget.pressure.score).toBe(highBudget.pressure.score);
    expect(lowBudget.complexity.score).toBe(highBudget.complexity.score);
    expect(lowBudget.buildBudget.limit).not.toBe(highBudget.buildBudget.limit);
  });

  it("raises complexity from the flattened ability repertoire without using CR or damage magnitude", () => {
    const simple = buildFinalMonsterEvaluation(baseInput());
    const complexAbilities = [
      action("slam"),
      action("grasp", {
        conditions: [{ name: "grappled", severity: "major", repeatSave: { enabled: true }, escape: { enabled: true } }],
      }),
      action("spore-cloud", {
        usage: { type: "recharge" },
        targeting: { type: "area" },
        areaEffect: { enabled: true },
        ongoing: { enabled: true },
      }),
      action("retaliation", { actionEconomy: "reaction", section: "reaction" }),
      action("brood", { summon: { enabled: true }, damage: { hasDamage: false, entries: [] } }),
      action("engulf", { procedure: { enabled: true, type: "engulf" } }),
    ];
    const complex = buildFinalMonsterEvaluation(baseInput({
      targetCr: 20,
      baseline: { dpr: 100, hp: 300, ac: 19 },
      printedStats: { dpr: 15, hp: 45, ac: 13 },
      abilityModel: { abilities: complexAbilities },
      attackRoutine: {
        enabled: true,
        mode: "choice",
        count: 2,
        attacks: [{ abilityId: "slam" }, { abilityId: "grasp" }],
        replacements: [{ abilityId: "engulf" }],
        additions: [{ abilityId: "spore-cloud" }],
      },
      dprProfile: {
        ...baseInput().dprProfile,
        actionEconomy: { mainActionOptionCount: 4 },
      },
    }));
    expect(complex.complexity.score).toBeGreaterThan(simple.complexity.score);
  });

  it("preserves visible legacy values while exposing the v2 projections", () => {
    const evaluation = buildFinalMonsterEvaluation(baseInput());
    const projected = projectFinalEvaluationToLegacyProfiles({
      evaluation,
      pressureProfile: { score: 4, label: "Low", breakdown: {} },
      complexityProfile: { score: 3, label: "Low", breakdown: {} },
      pressureBudget: 14,
      complexityCap: 10,
      preserveVisibleScores: true,
    });
    expect(projected.pressureProfile.score).toBe(4);
    expect(projected.complexityProfile.score).toBe(3);
    expect(projected.pressureProfile.v2.score).toBe(evaluation.pressure.score);
    expect(projected.complexityProfile.v2.score).toBe(evaluation.complexity.score);
  });
});
