import { describe, expect, it } from "vitest";
import {
  MONSTER_BASIC_ATTACK_GENERATOR,
  buildMonsterBasicAttackFeature,
  ensureMonsterBasicAttackFeature,
  hasAuthoredAttackPattern,
  isMonsterBasicAttackFeature,
} from "./monster-basic-attack.js";
import { buildMonsterAbilitiesFromFeatures } from "./monster-ability-model.js";
import { buildMonsterPublishGate } from "./monster-publish-gate.js";

function attackPattern() {
  return {
    id: "authored-bite-pattern",
    title: "Bite Pattern",
    slot: "attack",
    section: "action",
    rules: {
      section: "action",
      actionEconomy: "action",
      usage: { type: "atWill" },
      resolution: { type: "attackRoll", attackType: "melee", abilityBasis: "str", bonus: "monster", reach: "5 ft." },
      targeting: { type: "single", targets: "one target" },
      damage: { mode: "computed", budgetRole: "mainAttack", types: ["piercing"], scale: "standard", parts: [] },
      counterplay: { positioningAnswer: true },
      text: { hit: "{damage} piercing damage." },
    },
  };
}

describe("Monster Basic Attack fallback", () => {
  it("adds one baseline attack when no Attack Pattern graft is selected", () => {
    const body = { id: "body", title: "Body", slot: "body", section: "trait", rules: { section: "trait", actionEconomy: "passive", usage: { type: "passive" }, resolution: { type: "none" }, damage: { mode: "none", parts: [] }, counterplay: {} } };
    const result = ensureMonsterBasicAttackFeature([body], {
      category: "Zombie",
      typeId: "undead",
      sourceId: "decomposition",
      targetCr: 2,
    });

    expect(result.profile.status).toBe("fallback-added");
    expect(result.features).toHaveLength(2);
    expect(result.fallbackFeature).toMatchObject({
      slot: "attack",
      baselineAbility: true,
      generatedBy: MONSTER_BASIC_ATTACK_GENERATOR,
    });
    const model = buildMonsterAbilitiesFromFeatures(result.features, { targetCr: 2 });
    expect(model.abilities.some((ability) => ability.actionEconomy === "action" && ability.damage.hasDamage)).toBe(true);
  });

  it("does not add or retain a fallback when an authored Attack Pattern is selected", () => {
    const fallback = buildMonsterBasicAttackFeature({ category: "Zombie", typeId: "undead", targetCr: 2 });
    const pattern = attackPattern();
    const result = ensureMonsterBasicAttackFeature([fallback, pattern], { targetCr: 2 });

    expect(hasAuthoredAttackPattern(result.features)).toBe(true);
    expect(result.fallbackFeature).toBeNull();
    expect(result.features).toEqual([pattern]);
    expect(result.features.some(isMonsterBasicAttackFeature)).toBe(false);
  });

  it("lets a complete frame publish without an authored Attack Pattern when the Basic Attack is exported", () => {
    const compiled = ensureMonsterBasicAttackFeature([], {
      category: "Zombie",
      typeId: "undead",
      targetCr: 2,
    });
    const gate = buildMonsterPublishGate({
      selected: { body: "body-1", weakness: "weakness-1" },
      selectedFeatures: [],
      actions: compiled.features,
      weaknessFeatures: [{ id: "weakness-1" }],
      computed: {
        targetCr: 2,
        estimatedCr: 2,
        pressure: 0,
        pressureLimit: 6,
        complexity: 0,
        complexityCap: 6,
        counterplayAudit: { rating: "Playable" },
      },
    });

    expect(gate.blockers.some((blocker) => blocker.check === "core-anatomy")).toBe(false);
    expect(gate.blockers.some((blocker) => blocker.check === "main-action")).toBe(false);
  });

  it("does not mistake a compiler-generated Multiattack for an authored Attack Pattern", () => {
    const fallback = buildMonsterBasicAttackFeature({ category: "Zombie", typeId: "undead", targetCr: 20 });
    const generatedRoutine = {
      id: "frame-high-cr-routine",
      title: "Multiattack",
      slot: "attack",
      section: "action",
      synthetic: true,
      generatedBy: "high-cr-action-routine-guard-v1.36-r2",
      rules: { section: "action", actionEconomy: "action", multiattack: { enabled: true, count: 2 } },
    };
    const result = ensureMonsterBasicAttackFeature([fallback, generatedRoutine], {
      category: "Zombie",
      typeId: "undead",
      targetCr: 20,
    });

    expect(hasAuthoredAttackPattern(result.features)).toBe(false);
    expect(result.fallbackFeature).not.toBeNull();
    expect(result.features).toContain(generatedRoutine);
  });

  it("uses a recognizable chassis-aware baseline identity", () => {
    expect(buildMonsterBasicAttackFeature({ category: "Skeleton", typeId: "undead" })).toMatchObject({ title: "Skeleton Strike" });
    expect(buildMonsterBasicAttackFeature({ category: "Spirit", typeId: "undead" })).toMatchObject({ title: "Spirit Touch" });
    expect(buildMonsterBasicAttackFeature({ category: "Wolf Spider", typeId: "beast" })).toMatchObject({ title: "Wolf Spider Bite" });
  });
});
