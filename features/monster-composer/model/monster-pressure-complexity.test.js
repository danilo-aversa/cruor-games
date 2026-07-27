import { describe, expect, it } from "vitest";
import {
  MONSTER_GRAFT_SLOT_WEIGHT_PROFILES,
  MONSTER_PRESSURE_CR_BANDS,
  buildDmComplexityProfile,
  buildPlayerPressureProfile,
  getComplexityLimitForFrame,
  getPressureLimitForFrame,
  resolveMonsterGuidanceLimits,
  summarizeGraftSlotWeights,
} from "./monster-pressure-complexity.js";
import { buildMonsterFramePowerProfile } from "./monster-frame-power.js";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import { buildMonsterAbilitiesFromFeatures } from "./monster-ability-model.js";
import { ensureMonsterBasicAttackFeature } from "./monster-basic-attack.js";

function ability(id, overrides = {}) {
  return {
    id,
    title: id,
    section: "action",
    actionEconomy: "action",
    usage: { type: "atWill" },
    conditions: [],
    effects: [],
    counterplay: {},
    damage: { hasDamage: true, entries: [{ id: `${id}-damage`, average: 5 }] },
    ...overrides,
  };
}

function complexAttackPattern() {
  const abilities = [
    ability("strike"),
    ability("pin", {
      conditions: [{
        name: "restrained",
        severity: "major",
        repeatSave: { enabled: true },
        escape: { enabled: true },
      }],
      counterplay: { breakCondition: "Escape the pin." },
    }),
    ability("burst", {
      usage: { type: "recharge" },
      targeting: { type: "area" },
      areaEffect: { enabled: true, timing: "startsTurnInArea" },
      ongoing: { enabled: true },
      counterplay: { positioningAnswer: "Leave the area." },
    }),
  ];
  return {
    abilityModel: { abilities },
    attackRoutine: {
      enabled: true,
      mode: "choice",
      count: 2,
      attacks: [{ abilityId: "strike" }, { abilityId: "pin" }],
      replacements: [{ abilityId: "burst" }],
      additions: [],
    },
  };
}

describe("Pressure and Complexity v3", () => {
  it("uses the published CR-scaled Pressure curve", () => {
    expect(MONSTER_PRESSURE_CR_BANDS.map((band) => band.limit)).toEqual([4, 6, 8, 10, 12, 14, 16]);
    expect(getPressureLimitForFrame({ targetCr: 0 })).toBe(4);
    expect(getPressureLimitForFrame({ targetCr: 2 })).toBe(6);
    expect(getPressureLimitForFrame({ targetCr: 5 })).toBe(8);
    expect(getPressureLimitForFrame({ targetCr: 9 })).toBe(10);
    expect(getPressureLimitForFrame({ targetCr: 13 })).toBe(12);
    expect(getPressureLimitForFrame({ targetCr: 17 })).toBe(14);
    expect(getPressureLimitForFrame({ targetCr: 21 })).toBe(16);
  });

  it("never lets Advanced Mode or stale custom values override frame guidance", () => {
    const lowCrFrame = buildMonsterFramePowerProfile({
      role: { id: "standard" },
      tacticalRole: { id: "brute" },
      monsterTier: { id: "normal" },
      tempoProfile: { id: "standard" },
      danger: { id: "hard" },
      targetCr: 4,
    });
    expect(resolveMonsterGuidanceLimits({
      framePowerProfile: lowCrFrame,
      advancedMode: true,
      customPressureLimit: 14,
      customComplexityCap: 10,
    })).toEqual({ pressureLimit: 6, complexityCap: 6 });
  });

  it("keeps Build Budget and the visible Pressure limit as distinct frame values", () => {
    const profile = buildMonsterFramePowerProfile({
      role: { id: "standard" },
      tacticalRole: { id: "brute" },
      monsterTier: { id: "normal" },
      tempoProfile: { id: "standard" },
      danger: { id: "hard" },
      targetCr: 4,
    });
    expect(profile.buildBudget).toBe(14);
    expect(profile.pressureLimit).toBe(6);
    expect(profile.buildBudget).not.toBe(profile.pressureLimit);
  });

  it("caps low-CR role and tier inflation", () => {
    expect(getPressureLimitForFrame({ targetCr: 2, roleId: "boss", monsterTierId: "legendary" })).toBe(8);
    expect(getPressureLimitForFrame({ targetCr: 2, roleId: "minion", monsterTierId: "normal" })).toBe(4);
  });

  it("keeps the DM Complexity limit independent from CR", () => {
    const lowCr = getComplexityLimitForFrame({ roleId: "standard", monsterTierId: "normal", tempoProfileId: "standard" });
    const highCr = getComplexityLimitForFrame({ roleId: "standard", monsterTierId: "normal", tempoProfileId: "standard", targetCr: 25 });
    expect(lowCr).toBe(6);
    expect(highCr).toBe(lowCr);
  });

  it("lets one complex Attack Pattern saturate a CR 2 Pressure allowance", () => {
    const { abilityModel, attackRoutine } = complexAttackPattern();
    const limit = getPressureLimitForFrame({ targetCr: 2 });
    const profile = buildPlayerPressureProfile({ targetCr: 2, limit, abilityModel, attackRoutine });
    expect(profile.score).toBeGreaterThanOrEqual(limit);
    expect(profile.inputs.mainActionCount).toBe(3);
  });

  it("changes Pressure capacity with CR without changing identical content weight", () => {
    const { abilityModel, attackRoutine } = complexAttackPattern();
    const low = buildPlayerPressureProfile({ targetCr: 2, limit: getPressureLimitForFrame({ targetCr: 2 }), abilityModel, attackRoutine });
    const high = buildPlayerPressureProfile({ targetCr: 20, limit: getPressureLimitForFrame({ targetCr: 20 }), abilityModel, attackRoutine });
    expect(high.score).toBe(low.score);
    expect(high.limit).toBeGreaterThan(low.limit);
    expect(high.utilization).toBeLessThan(low.utilization);
  });

  it("ignores damage magnitude while preserving repertoire structure", () => {
    const lowDamage = { abilities: [ability("strike", { damage: { hasDamage: true, entries: [{ average: 4 }] } })] };
    const highDamage = { abilities: [ability("strike", { damage: { hasDamage: true, entries: [{ average: 80 }] } })] };
    expect(buildPlayerPressureProfile({ targetCr: 2, limit: 6, abilityModel: lowDamage }).score)
      .toBe(buildPlayerPressureProfile({ targetCr: 2, limit: 6, abilityModel: highDamage }).score);
    expect(buildDmComplexityProfile({ limit: 6, abilityModel: lowDamage }).score)
      .toBe(buildDmComplexityProfile({ limit: 6, abilityModel: highDamage }).score);
  });

  it("raises Complexity for triggers, state, board objects, and branching", () => {
    const simple = buildDmComplexityProfile({ limit: 6, abilityModel: { abilities: [ability("strike")] } });
    const { abilityModel, attackRoutine } = complexAttackPattern();
    abilityModel.abilities.push(
      ability("retaliation", { actionEconomy: "reaction" }),
      ability("brood", { summon: { enabled: true }, damage: { hasDamage: false, entries: [] } }),
      ability("engulf", { procedure: { enabled: true, type: "engulf" } }),
    );
    const complex = buildDmComplexityProfile({ limit: 6, abilityModel, attackRoutine });
    expect(complex.score).toBeGreaterThan(simple.score);
    expect(complex.breakdown.triggers).toBeGreaterThan(0);
    expect(complex.breakdown.board).toBeGreaterThan(0);
    expect(complex.breakdown.branching).toBeGreaterThan(0);
  });

  it("treats the compiled Basic Attack as baseline rather than graft load", () => {
    const compiled = ensureMonsterBasicAttackFeature([], {
      category: "Zombie",
      typeId: "undead",
      targetCr: 2,
    });
    const abilityModel = buildMonsterAbilitiesFromFeatures(compiled.features, { targetCr: 2 });
    const pressure = buildPlayerPressureProfile({
      targetCr: 2,
      limit: 6,
      abilityModel,
      selectedFeatures: compiled.features,
    });
    const complexity = buildDmComplexityProfile({
      limit: 6,
      abilityModel,
      selectedFeatures: compiled.features,
    });

    expect(abilityModel.abilities.some((entry) => entry.baselineAbility)).toBe(true);
    expect(pressure.score).toBe(0);
    expect(complexity.score).toBe(0);
  });

  it("applies empirically calibrated slot weights instead of treating every graft family equally", () => {
    expect(MONSTER_GRAFT_SLOT_WEIGHT_PROFILES.attack.bestiaryPrevalence).toBeGreaterThan(
      MONSTER_GRAFT_SLOT_WEIGHT_PROFILES.movement.bestiaryPrevalence,
    );
    const attackWeight = summarizeGraftSlotWeights([{ slot: "attack", complexity: 2 }]);
    const movementWeight = summarizeGraftSlotWeights([{ slot: "movement", complexity: 2 }]);
    const weaknessWeight = summarizeGraftSlotWeights([{ slot: "weakness", complexity: 2 }]);

    expect(movementWeight.pressure).toBeGreaterThan(attackWeight.pressure);
    expect(movementWeight.complexity).toBeGreaterThan(attackWeight.complexity);
    expect(weaknessWeight.pressure).toBeLessThan(0);
    expect(weaknessWeight.complexity).toBeLessThan(0);
  });

  it("keeps Movement heavier than Attack Pattern on average across the current catalog", () => {
    const scoreSlot = (slot) => {
      const grafts = MONSTER_GRAFTS.filter((graft) => graft.slot === slot);
      const rows = grafts.map((graft) => {
        const abilityModel = buildMonsterAbilitiesFromFeatures([graft], { targetCr: 5 });
        return {
          pressure: buildPlayerPressureProfile({
            targetCr: 5,
            limit: 8,
            abilityModel,
            selectedFeatures: [graft],
          }).score,
          complexity: buildDmComplexityProfile({
            limit: 6,
            abilityModel,
            selectedFeatures: [graft],
          }).score,
        };
      });
      return {
        pressure: rows.reduce((sum, row) => sum + row.pressure, 0) / rows.length,
        complexity: rows.reduce((sum, row) => sum + row.complexity, 0) / rows.length,
      };
    };

    const attacks = scoreSlot("attack");
    const movement = scoreSlot("movement");
    expect(movement.pressure).toBeGreaterThan(attacks.pressure);
    expect(movement.complexity).toBeGreaterThan(attacks.complexity);
  });

});
