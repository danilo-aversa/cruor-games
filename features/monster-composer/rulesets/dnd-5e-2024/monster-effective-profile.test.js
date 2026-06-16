import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../../data/monster-grafts.js";
import { buildMonsterAbilitiesFromFeatures } from "../../model/monster-ability-model.js";
import { buildEffectiveMonsterProfile } from "./monster-effective-profile.js";
import { buildMonsterCrValidation } from "./monster-cr-validator.js";

function getGraft(id) {
  const graft = MONSTER_GRAFTS.find((item) => item.id === id);
  expect(graft).toBeTruthy();
  return graft;
}

describe("monster effective profile", () => {
  it("turns condition abilities into condition pressure and CR adjustment", () => {
    const selectedFeatures = [getGraft("venomous-bite"), getGraft("web-recharge")];
    const abilityModel = buildMonsterAbilitiesFromFeatures(selectedFeatures);
    const effectiveProfile = buildEffectiveMonsterProfile({
      printedStats: { hp: 130, ac: 16, attackBonus: 7, saveDc: 15, dpr: 54 },
      dprProfile: {
        effectiveDpr3Round: 54,
        burstDpr: 72,
        sustainedDpr: 45,
        rounds: { round1: 72, round2: 45, round3: 45 },
      },
      abilityModel,
      statMods: {},
      tempoProfile: { id: "standard", pressureMod: 0 },
      monsterTier: { id: "normal" },
      typeId: "beast",
    });

    expect(effectiveProfile.conditionProfile.sourceCount).toBeGreaterThan(0);
    expect(effectiveProfile.conditionProfile.controlPressure).toBeGreaterThan(0);
    expect(effectiveProfile.conditionProfile.crAdjustment).toBeGreaterThanOrEqual(1);
  });

  it("feeds condition pressure into offensive CR validation", () => {
    const effectiveProfile = {
      effectiveHp: 130,
      effectiveAc: 16,
      effectiveAttackBonus: 7,
      effectiveSaveDc: 15,
      effectiveDpr3Round: 54,
      conditionProfile: { crAdjustment: 2, controlPressure: 6, issues: [] },
      defensiveProfile: { issues: [] },
    };
    const validation = buildMonsterCrValidation({
      targetCr: 8,
      printedStats: { hp: 130, ac: 16, attackBonus: 7, saveDc: 15, dpr: 54 },
      effectiveProfile,
      monsterTier: { id: "normal" },
      mechanicsSummary: {},
    });

    expect(validation.offensive.conditionAdjustment).toBe(2);
    expect(validation.offensive.cr).toBeGreaterThanOrEqual(validation.offensive.baseCr + 1);
  });
});
