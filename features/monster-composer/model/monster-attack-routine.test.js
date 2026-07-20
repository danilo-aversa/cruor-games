import { describe, expect, it } from "vitest";
import {
  buildGeneratedMultiattackFeature,
  buildMonsterAttackRoutine,
  renderMonsterAttackRoutineText,
} from "./monster-attack-routine.js";

function buildAttack(id, title, overrides = {}) {
  const rules = {
    section: "action",
    actionEconomy: "action",
    usage: { type: "atWill" },
    resolution: { type: "attackRoll", attackType: "melee" },
    damage: { mode: "computed", budgetRole: "mainAttack" },
    ...(overrides.rules || {}),
  };
  return {
    id,
    sourceGraftId: id,
    title,
    section: "action",
    actionEconomy: rules.actionEconomy,
    usage: rules.usage,
    resolution: { attack: { attackType: "melee" } },
    damage: {
      entries: [
        {
          source: "damage",
          mode: rules.damage.mode,
          budgetRole: rules.damage.budgetRole,
          damage: rules.damage,
        },
      ],
    },
    conditions: [],
    multiattackParticipation: overrides.multiattackParticipation || null,
    multiattack: overrides.multiattack || null,
    rules,
    ...overrides,
  };
}

describe("monster attack routine planner", () => {
  it("splits a CR 5 routine budget into two ordinary attacks", () => {
    const routine = buildMonsterAttackRoutine({
      abilities: [buildAttack("slam", "Slam")],
      targetCr: 5,
      targetDpr: 36,
      computed: { categoryNoun: "zombie" },
    });

    expect(routine.enabled).toBe(true);
    expect(routine.source).toBe("auto");
    expect(routine.count).toBe(2);
    expect(routine.attacks).toEqual([
      expect.objectContaining({ featureId: "slam", count: 2 }),
    ]);
    expect(routine.allocations.slam.averagePerUse).toBe(18);
    expect(
      renderMonsterAttackRoutineText(routine, { categoryNoun: "zombie" }),
    ).toBe("The zombie makes two Slam attacks.");
  });

  it("builds any-combination wording across attacks from different grafts", () => {
    const routine = buildMonsterAttackRoutine({
      abilities: [
        buildAttack("claw", "Claw", {
          multiattackParticipation: {
            enabled: true,
            role: "choice",
            maxUses: 3,
          },
        }),
        buildAttack("ice-throw", "Ice Throw", {
          multiattackParticipation: {
            enabled: true,
            role: "choice",
            maxUses: 3,
          },
        }),
      ],
      targetCr: 8,
      targetDpr: 54,
      computed: { categoryNoun: "horror" },
    });

    expect(routine.mode).toBe("choice");
    expect(routine.count).toBe(3);
    expect(routine.allocations.claw.averagePerUse).toBe(18);
    expect(routine.allocations["ice-throw"].averagePerUse).toBe(18);
    expect(
      renderMonsterAttackRoutineText(routine, { categoryNoun: "horror" }),
    ).toBe(
      "The horror makes three attacks, using Claw or Ice Throw in any combination.",
    );
  });

  it("adds replacement and additional abilities without counting them as repeated attacks", () => {
    const routine = buildMonsterAttackRoutine({
      abilities: [
        buildAttack("lash", "Tentacle Lash"),
        buildAttack("mind-rot", "Mind Rot", {
          multiattackParticipation: {
            enabled: true,
            role: "replacement",
            replacementScope: "anyAttack",
          },
        }),
        buildAttack("gaze", "Chilling Gaze", {
          multiattackParticipation: {
            enabled: true,
            role: "additionalAbility",
            availability: "ifAvailable",
            timing: "beforeAttacks",
          },
        }),
      ],
      targetCr: 5,
      targetDpr: 36,
      computed: { categoryNoun: "cultist" },
    });

    expect(routine.attacks).toHaveLength(1);
    expect(routine.replacements).toEqual([
      expect.objectContaining({ featureId: "mind-rot", replace: "anyAttack" }),
    ]);
    expect(routine.additions).toEqual([
      expect.objectContaining({ featureId: "gaze", timing: "beforeAttacks" }),
    ]);
    expect(
      renderMonsterAttackRoutineText(routine, { categoryNoun: "cultist" }),
    ).toBe(
      "The cultist uses Chilling Gaze if available and makes two Tentacle Lash attacks. It can replace any attack with a use of Mind Rot.",
    );
  });

  it("does not force automatic Multiattack onto ordinary CR 1 attacks", () => {
    const routine = buildMonsterAttackRoutine({
      abilities: [buildAttack("bite", "Bite")],
      targetCr: 1,
      targetDpr: 12,
    });

    expect(routine.enabled).toBe(false);
    expect(routine.allocations).toEqual({});
  });

  it("renders mutually available additional abilities with D&D-style either/or wording", () => {
    const routine = buildMonsterAttackRoutine({
      abilities: [
        buildAttack("lash", "Tentacle Lash"),
        buildAttack("consume-memories", "Consume Memories", {
          multiattackParticipation: {
            enabled: true,
            role: "additionalAbility",
            availability: "ifAvailable",
          },
        }),
        buildAttack("dominate-mind", "Dominate Mind", {
          multiattackParticipation: {
            enabled: true,
            role: "additionalAbility",
            availability: "ifAvailable",
          },
        }),
      ],
      targetCr: 5,
      targetDpr: 36,
      computed: { categoryNoun: "aboleth" },
    });

    expect(
      renderMonsterAttackRoutineText(routine, { categoryNoun: "aboleth" }),
    ).toBe(
      "The aboleth uses either Consume Memories or Dominate Mind if available and makes two Tentacle Lash attacks.",
    );
  });

  it("respects an explicit one-use cap as a single-heavy-attack override", () => {
    const routine = buildMonsterAttackRoutine({
      abilities: [
        buildAttack("crushing-blow", "Crushing Blow", {
          multiattackParticipation: {
            enabled: true,
            role: "primary",
            maxUses: 1,
          },
        }),
      ],
      targetCr: 5,
      targetDpr: 36,
    });

    expect(routine.enabled).toBe(false);
    expect(routine.source).toBe("none");
  });

  it("keeps an authored manual Multiattack override authoritative", () => {
    const slam = buildAttack("slam", "Slam");
    const manual = {
      id: "authored-multiattack",
      sourceGraftId: "authored-multiattack",
      title: "Multiattack",
      section: "action",
      actionEconomy: "action",
      usage: { type: "atWill" },
      resolution: { attack: null },
      damage: { entries: [] },
      conditions: [],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [{ ref: "slam", label: "Slam", count: 2 }],
      },
      rules: {
        section: "action",
        actionEconomy: "action",
        multiattack: {
          enabled: true,
          mode: "fixed",
          count: 2,
          attacks: [{ ref: "slam", label: "Slam", count: 2 }],
        },
      },
    };

    const routine = buildMonsterAttackRoutine({
      abilities: [slam, manual],
      targetCr: 5,
      targetDpr: 36,
      computed: { categoryNoun: "zombie" },
    });

    expect(routine.enabled).toBe(true);
    expect(routine.source).toBe("manual");
    expect(routine.count).toBe(2);
    expect(routine.attacks).toEqual([
      expect.objectContaining({ featureId: "slam", count: 2 }),
    ]);
    expect(
      buildGeneratedMultiattackFeature(routine, { categoryNoun: "zombie" }),
    ).toBeNull();
  });

  it("creates a synthetic output action only for automatic routines", () => {
    const routine = buildMonsterAttackRoutine({
      abilities: [buildAttack("slam", "Slam")],
      targetCr: 5,
      targetDpr: 36,
      computed: { categoryNoun: "zombie" },
    });
    const feature = buildGeneratedMultiattackFeature(routine, {
      categoryNoun: "zombie",
    });

    expect(feature).toEqual(
      expect.objectContaining({
        id: "generated-multiattack",
        title: "Multiattack",
        section: "action",
        mechanics: "The zombie makes two Slam attacks.",
      }),
    );
  });
});
