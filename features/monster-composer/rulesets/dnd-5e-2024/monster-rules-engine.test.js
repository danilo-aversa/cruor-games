import { describe, expect, it } from "vitest";
import {
  buildDndCompliantMonsterStats,
  buildLegalDamageRoll,
} from "./monster-rules-engine.js";

describe("monster rules engine", () => {
  it("keeps physical damage modifiers tied to the attack ability modifier", () => {
    const roll = buildLegalDamageRoll(72, {
      abilityModifier: 2,
      size: "Large",
      damage: { types: ["bludgeoning"], budgetRole: "mainAttack" },
      rules: { resolution: { type: "attackRoll", abilityBasis: "strength" } },
    });

    expect(roll.legal).toBe(true);
    expect(roll.formula).toMatch(/\+ 2$/);
    expect(roll.formula).not.toMatch(/− 6|- 6/);
  });

  it("derives attack bonus from CR proficiency and attack ability modifier", () => {
    const monster = buildDndCompliantMonsterStats({
      targetCr: 22,
      typeId: "undead",
      category: "Zombie",
      roleId: "boss",
      selectedFeatures: [],
      baseline: { attackBonus: 15, saveDc: 22 },
      targetHp: 400,
      targetAc: 20,
      targetDpr: 160,
      targetAttackBonus: 9,
      targetSaveDc: 20,
      tempoProfile: { initiativeMod: 0 },
    });

    expect(monster.proficiencyBonus).toBe(7);
    expect(monster.rulesProfile.attackModifier).toBe(2);
    expect(monster.printedStats.attackBonus).toBe(9);
    expect(monster.validation.issues.find((issue) => issue.code === "attack-bonus-not-derived")).toBeUndefined();
  });

  it("prints HP from legal size hit dice plus Constitution modifier", () => {
    const monster = buildDndCompliantMonsterStats({
      targetCr: 8,
      typeId: "undead",
      category: "Zombie",
      roleId: "boss",
      selectedFeatures: [],
      baseline: { attackBonus: 7, saveDc: 15 },
      targetHp: 145,
      targetAc: 16,
      targetDpr: 54,
      targetAttackBonus: 7,
      targetSaveDc: 15,
      tempoProfile: { initiativeMod: 0 },
    });

    expect(monster.rulesProfile.size).toBe("Large");
    expect(monster.rulesProfile.hp.formula).toMatch(/^\d+d10/);
    expect(monster.rulesProfile.hp.legal).toBe(true);
  });
});
