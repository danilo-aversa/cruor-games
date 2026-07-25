import { describe, expect, it } from "vitest";
import {
  MONSTER_GRAFT_V2_SCHEMA_VERSION,
  isMonsterGraftV2,
  normalizeMonsterGraftV2,
  validateMonsterGraftV2,
} from "./monster-graft-v2.schema.js";

function buildRules({ budgetRole = "mainAttack", budgetShare = 0.6 } = {}) {
  return {
    schemaVersion: "monster-graft-rules-v1.15",
    section: "action",
    actionEconomy: "action",
    usage: { type: "atWill" },
    trigger: null,
    resolution: {
      type: "attackRoll",
      attackType: "melee",
      abilityBasis: "strength",
      bonus: "monster",
    },
    secondaryResolution: null,
    targeting: { type: "single", targets: "one creature" },
    areaEffect: null,
    damage: {
      mode: "budget",
      budgetRole,
      budgetShare,
      expectedTargets: 1,
      roundWeight: [1, 1, 1],
      types: ["bludgeoning"],
      scale: "standard",
      parts: [],
    },
    condition: null,
    counterplay: {
      telegraph: true,
      breakCondition: false,
      positioningAnswer: true,
      nonDamageAnswer: false,
    },
    text: {},
    multiattack: null,
    multiattackParticipation: null,
    spellcasting: null,
    defense: null,
    summon: null,
    procedure: null,
    references: [],
    ongoing: null,
    migration: { source: "test", isStructured: true },
  };
}

function buildAttackPattern(overrides = {}) {
  return {
    schemaVersion: MONSTER_GRAFT_V2_SCHEMA_VERSION,
    id: "pressure-collapse",
    title: "Pressure Collapse",
    kind: "attackPattern",
    slot: "attack",
    source: "decomposition",
    sourceAnchors: ["decomposition"],
    identity: {
      fantasy: "A gas-swollen corpse weaponizes its mass.",
      tacticalRole: "single-target displacement",
      signature: "impact and rupture",
      recognitionTags: ["impact", "rupture"],
    },
    abilities: [
      { id: "slam", title: "Heavy Slam", rules: buildRules() },
      {
        id: "grab",
        title: "Corpse Grab",
        rules: buildRules({ budgetRole: "secondaryAttack", budgetShare: 0.4 }),
      },
    ],
    routine: {
      mode: "authored",
      defaultSequence: ["slam", "grab"],
      multiattack: {
        enabled: true,
        attacks: 2,
        choices: ["slam", "grab"],
      },
    },
    migration: { status: "draft", legacyGraftIds: ["slam-decomposition"] },
    ...overrides,
  };
}

describe("monster Graft v2 schema", () => {
  it("keeps legacy grafts outside the v2 contract", () => {
    const graft = { id: "legacy-slam", title: "Legacy Slam", slot: "attack" };
    expect(isMonsterGraftV2(graft)).toBe(false);
    expect(validateMonsterGraftV2(graft)).toMatchObject({
      applicable: false,
      status: "legacy",
      issues: [],
    });
  });

  it("normalizes and validates an authored multi-ability attack pattern", () => {
    const graft = buildAttackPattern();
    const normalized = normalizeMonsterGraftV2(graft);
    const report = validateMonsterGraftV2(graft);

    expect(normalized.schemaVersion).toBe(MONSTER_GRAFT_V2_SCHEMA_VERSION);
    expect(normalized.routine.multiattack).toMatchObject({
      enabled: true,
      mode: "choice",
      count: 2,
    });
    expect(normalized.routine.multiattack.attacks.map((entry) => entry.ref)).toEqual([
      "slam",
      "grab",
    ]);
    expect(report.status).toBe("pass");
    expect(report.errors).toEqual([]);
  });

  it("allows a zero-ability modifier graft while preserving the explicit bundle", () => {
    const graft = buildAttackPattern({
      id: "pressure-modifier",
      title: "Pressure Modifier",
      kind: "combatTwist",
      slot: "twist",
      abilities: [],
      routine: { mode: "none" },
      modifiers: [{ target: "attack", operation: "append" }],
    });
    const report = validateMonsterGraftV2(graft);

    expect(report.status).toBe("pass");
    expect(report.normalized.abilities).toEqual([]);
    expect(report.normalized.modifiers).toHaveLength(1);
  });

  it("blocks duplicate local ids and unresolved routine references", () => {
    const graft = buildAttackPattern({
      abilities: [
        { id: "slam", title: "Heavy Slam", rules: buildRules() },
        { id: "slam", title: "Second Slam", rules: buildRules() },
      ],
      routine: {
        mode: "authored",
        defaultSequence: ["slam", "missing"],
        multiattack: { enabled: true, attacks: 2, choices: ["slam", "missing"] },
      },
    });
    const report = validateMonsterGraftV2(graft);
    const codes = report.errors.map((issue) => issue.code);

    expect(report.status).toBe("error");
    expect(codes).toContain("graft-v2-duplicate-ability-id");
    expect(codes).toContain("graft-v2-routine-reference");
  });
});
