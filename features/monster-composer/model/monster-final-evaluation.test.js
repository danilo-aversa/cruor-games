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
    damage: { hasDamage: true, entries: [{ id: `${id}-damage`, expectedTargets: 1, average: 5 }] },
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
      },
    },
    abilityModel: { abilities: [action("strike")] },
    attackRoutine: { enabled: false, count: 1, attacks: [], replacements: [], additions: [] },
    counterplayAudit: { score: 50, rating: "Playable", issues: [] },
    selectedFeatures: [],
    buildBudget: 14,
    buildCost: 4,
    pressureLimit: 6,
    complexityCap: 6,
    ...overrides,
  };
}

describe("final monster evaluation v3", () => {
  it("uses independent scales for guidance measures and risk measures", () => {
    const evaluation = buildFinalMonsterEvaluation(baseInput());
    expect(evaluation.pressure).toMatchObject({ limit: 6, question: expect.stringContaining("players") });
    expect(evaluation.complexity).toMatchObject({ limit: 6, question: expect.stringContaining("DM") });
    for (const key of ["counterplay", "spikeRisk"]) {
      expect(evaluation[key].score).toBeGreaterThanOrEqual(0);
      expect(evaluation[key].score).toBeLessThanOrEqual(10);
    }
  });

  it("keeps Pressure independent from damage magnitude while Spike Risk reacts to burst", () => {
    const baseline = buildFinalMonsterEvaluation(baseInput());
    const burst = buildFinalMonsterEvaluation(baseInput({
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
      abilityModel: {
        abilities: [action("strike", {
          damage: { hasDamage: true, entries: [{ id: "strike-damage", expectedTargets: 1, average: 30 }] },
        })],
      },
    }));
    expect(burst.pressure.score).toBe(baseline.pressure.score);
    expect(burst.complexity.score).toBe(baseline.complexity.score);
    expect(burst.spikeRisk.score).toBeGreaterThan(baseline.spikeRisk.score);
  });

  it("raises Pressure when hard control is part of the projected repertoire", () => {
    const baseline = buildFinalMonsterEvaluation(baseInput());
    const controlled = buildFinalMonsterEvaluation(baseInput({
      abilityModel: {
        abilities: [
          action("strike"),
          action("pin", {
            conditions: [{
              name: "restrained",
              severity: "major",
              repeatSave: { enabled: true },
              escape: { enabled: true },
            }],
            counterplay: { breakCondition: "Escape the pin." },
          }),
        ],
      },
    }));
    expect(controlled.pressure.score).toBeGreaterThan(baseline.pressure.score);
    expect(controlled.pressure.breakdown.control).toBeGreaterThan(0);
  });

  it("does not subtract counterplay from Pressure", () => {
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

  it("keeps Pressure and Complexity independent from build-point budget", () => {
    const lowBudget = buildFinalMonsterEvaluation(baseInput({ buildBudget: 8, buildCost: 7 }));
    const highBudget = buildFinalMonsterEvaluation(baseInput({ buildBudget: 24, buildCost: 7 }));
    expect(lowBudget.pressure.score).toBe(highBudget.pressure.score);
    expect(lowBudget.complexity.score).toBe(highBudget.complexity.score);
    expect(lowBudget.buildBudget.limit).not.toBe(highBudget.buildBudget.limit);
  });

  it("changes Pressure capacity with CR without changing the same repertoire weight", () => {
    const low = buildFinalMonsterEvaluation(baseInput({ targetCr: 2, pressureLimit: 6 }));
    const high = buildFinalMonsterEvaluation(baseInput({ targetCr: 20, pressureLimit: 14 }));
    expect(high.pressure.score).toBe(low.pressure.score);
    expect(high.pressure.limit).toBeGreaterThan(low.pressure.limit);
    expect(high.pressure.utilization).toBeLessThan(low.pressure.utilization);
  });

  it("raises both measures for a multi-system repertoire", () => {
    const simple = buildFinalMonsterEvaluation(baseInput());
    const complexAbilities = [
      action("slam"),
      action("grasp", {
        conditions: [{ name: "grappled", severity: "major", repeatSave: { enabled: true }, escape: { enabled: true } }],
      }),
      action("spore-cloud", {
        usage: { type: "recharge" },
        targeting: { type: "area" },
        areaEffect: { enabled: true, timing: "startsTurnInArea" },
        ongoing: { enabled: true },
      }),
      action("retaliation", { actionEconomy: "reaction", section: "reaction" }),
      action("brood", { summon: { enabled: true }, damage: { hasDamage: false, entries: [] } }),
      action("engulf", { procedure: { enabled: true, type: "engulf" } }),
    ];
    const complex = buildFinalMonsterEvaluation(baseInput({
      abilityModel: { abilities: complexAbilities },
      attackRoutine: {
        enabled: true,
        mode: "choice",
        count: 2,
        attacks: [{ abilityId: "slam" }, { abilityId: "grasp" }],
        replacements: [{ abilityId: "engulf" }],
        additions: [{ abilityId: "spore-cloud" }],
      },
    }));
    expect(complex.pressure.score).toBeGreaterThan(simple.pressure.score);
    expect(complex.complexity.score).toBeGreaterThan(simple.complexity.score);
  });

  it("preserves visible legacy values while exposing v3 profiles", () => {
    const evaluation = buildFinalMonsterEvaluation(baseInput());
    const projected = projectFinalEvaluationToLegacyProfiles({
      evaluation,
      pressureProfile: { score: 4, label: "Low", breakdown: {} },
      complexityProfile: { score: 3, label: "Low", breakdown: {} },
      pressureBudget: 6,
      complexityCap: 6,
      preserveVisibleScores: true,
    });
    expect(projected.pressureProfile.score).toBe(4);
    expect(projected.complexityProfile.score).toBe(3);
    expect(projected.pressureProfile.v3.score).toBe(evaluation.pressure.score);
    expect(projected.complexityProfile.v3.score).toBe(evaluation.complexity.score);
  });
});
