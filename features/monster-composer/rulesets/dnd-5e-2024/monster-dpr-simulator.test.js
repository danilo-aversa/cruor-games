import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../../data/monster-grafts.js";
import { buildMonsterAbilitiesFromFeatures } from "../../model/monster-ability-model.js";
import { buildDndCompliantMonsterStats } from "./monster-rules-engine.js";
import { buildThreeRoundDprProfile } from "./monster-dpr-simulator.js";
import { buildMonsterCrValidation } from "./monster-cr-validator.js";

function getGraft(id) {
  const graft = MONSTER_GRAFTS.find((item) => item.id === id);
  expect(graft).toBeTruthy();
  return graft;
}

function buildComputedRules(targetDpr = 54) {
  const dnd = buildDndCompliantMonsterStats({
    targetCr: 8,
    typeId: "undead",
    category: "Zombie",
    roleId: "standard",
    selectedFeatures: [getGraft("empowered-slam")],
    baseline: { attackBonus: 7, saveDc: 15 },
    targetHp: 145,
    targetAc: 16,
    targetDpr,
    targetAttackBonus: 7,
    targetSaveDc: 15,
    tempoProfile: { initiativeMod: 0 },
  });
  return {
    dpr: targetDpr,
    attack: dnd.printedStats.attackBonus,
    dc: dnd.printedStats.saveDc,
    targetCr: 8,
    rulesProfile: dnd.rulesProfile,
  };
}

describe("monster DPR simulator", () => {
  it("builds a 3-round profile from structured damaging grafts", () => {
    const selectedFeatures = [getGraft("empowered-slam"), getGraft("acid-vomit")];
    const abilityModel = buildMonsterAbilitiesFromFeatures(selectedFeatures);
    const profile = buildThreeRoundDprProfile({
      selectedFeatures,
      abilities: abilityModel.abilities,
      targetDpr: 54,
      computed: buildComputedRules(54),
    });

    expect(profile.fallbackUsed).toBe(false);
    expect(profile.abilityCount).toBe(2);
    expect(profile.sourceCount).toBeGreaterThanOrEqual(2);
    expect(profile.rounds.round1).toBeGreaterThan(profile.rounds.round2);
    expect(profile.burstDpr).toBe(profile.rounds.round1);
    expect(profile.effectiveDpr3Round).toBeGreaterThan(0);
  });

  it("uses a legal fallback strike when no damaging graft exists", () => {
    const profile = buildThreeRoundDprProfile({
      selectedFeatures: [],
      targetDpr: 54,
      computed: buildComputedRules(54),
    });

    expect(profile.fallbackUsed).toBe(true);
    expect(profile.sources[0].roll.legal).toBe(true);
    expect(profile.sources[0].roll.formula).not.toMatch(/− 6|- 6/);
  });
});

describe("monster CR validator", () => {
  it("returns offensive and defensive CR from effective HP, DPR, AC, AB, and DC", () => {
    const validation = buildMonsterCrValidation({
      targetCr: 8,
      printedStats: { hp: 145, ac: 16, attackBonus: 7, saveDc: 15, dpr: 54 },
      effectiveProfile: {
        effectiveHp: 145,
        effectiveAc: 16,
        effectiveAttackBonus: 7,
        effectiveSaveDc: 15,
        effectiveDpr3Round: 54,
      },
      monsterTier: { id: "normal" },
      mechanicsSummary: {},
    });

    expect(validation.defensive.cr).toBeGreaterThanOrEqual(0);
    expect(validation.offensive.cr).toBeGreaterThanOrEqual(0);
    expect(validation.estimatedCr).toBeGreaterThanOrEqual(0);
    expect(validation.estimatedCr).toBeLessThanOrEqual(30);
  });
});
