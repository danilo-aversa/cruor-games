import { describe, expect, it } from "vitest";
import { buildMonsterAttackRoutine } from "./monster-attack-routine.js";
import { projectMonsterAbilityModelForCr } from "./monster-attack-pattern-progression.js";
import {
  MONSTER_ABILITY_BUNDLE_VERSION,
  buildMonsterAbilitiesFromFeatures,
  buildMonsterAbilityBundleFromGraft,
} from "./monster-ability-model.js";

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

const attackPattern = {
  schemaVersion: "monster-graft-v2.0",
  id: "pressure-collapse",
  title: "Pressure Collapse",
  kind: "attackPattern",
  slot: "attack",
  source: "decomposition",
  sourceAnchors: ["decomposition"],
  registry: { componentId: "component-pressure-collapse" },
  identity: {
    fantasy: "A swollen corpse collapses into its victim.",
    tacticalRole: "single-target displacement",
    signature: "impact and rupture",
    recognitionTags: ["impact", "rupture", "swollen-corpse"],
  },
  abilities: [
    { id: "slam", title: "Heavy Slam", rules: buildRules() },
    {
      id: "grab",
      title: "Corpse Grab",
      rules: buildRules({ budgetRole: "secondaryAttack", budgetShare: 0.4 }),
    },
  ],
  progression: {
    schemaVersion: "monster-attack-pattern-progression-v1.0",
    basis: "targetCr",
    bands: [
      { id: "low", minCr: 0, maxCr: 1, abilityIds: ["slam"], multiattack: { enabled: false, count: 0 } },
      { id: "mid", minCr: 2, maxCr: 8, abilityIds: ["slam", "grab"], multiattack: { enabled: true, mode: "choice", count: 2 } },
      { id: "high", minCr: 9, maxCr: 30, abilityIds: ["slam", "grab"], multiattack: { enabled: true, mode: "choice", count: 3 } },
    ],
  },
  routine: {
    mode: "authored",
    defaultPlan: "Strike and then pin the same target.",
    targetSelection: "Prefer an isolated target.",
    defaultSequence: ["slam", "grab"],
    opener: [],
    alternatives: [],
    intentionalRepetition: false,
    repetitionReason: "",
    multiattack: {
      enabled: true,
      mode: "choice",
      count: 2,
      attacks: [
        { ref: "slam", count: 1 },
        { ref: "grab", count: 1 },
      ],
      choices: ["slam", "grab"],
      replacements: [],
    },
  },
  counterplayProfile: {
    telegraphs: ["The corpse lowers its shoulder."],
    positioningAnswers: ["Stay outside a straight charge lane."],
    breakConditions: [],
    nonDamageAnswers: [],
  },
  complexityProfile: {},
  spikeRiskProfile: {},
  authoring: { origin: "inspiration-module", canonical: true },
  migration: { status: "draft" },
};

describe("monster ability bundle compiler", () => {
  it("preserves the one-graft/one-ability legacy projection", () => {
    const graft = {
      id: "legacy-slam",
      title: "Legacy Slam",
      slot: "attack",
      section: "action",
      source: "decomposition",
      rules: buildRules(),
    };
    const bundle = buildMonsterAbilityBundleFromGraft(graft);

    expect(bundle.version).toBe(MONSTER_ABILITY_BUNDLE_VERSION);
    expect(bundle.compilation).toBe("legacy-adapter");
    expect(bundle.abilities).toHaveLength(1);
    expect(bundle.primaryAbility).toMatchObject({
      id: "legacy-slam",
      sourceGraftId: "legacy-slam",
      localAbilityId: "legacy-slam",
      synthetic: false,
    });
  });

  it("compiles stable authored ability ids plus a synthetic routine ability", () => {
    const bundle = buildMonsterAbilityBundleFromGraft(attackPattern);

    expect(bundle.validation.status).toBe("pass");
    expect(bundle.compilation).toBe("graft-v2-bundle");
    expect(bundle.abilities.map((ability) => ability.id)).toEqual([
      "pressure-collapse:multiattack",
      "pressure-collapse:slam",
      "pressure-collapse:grab",
    ]);
    expect(bundle.primaryAbility.id).toBe("pressure-collapse:slam");
    expect(bundle.abilities[0]).toMatchObject({
      title: "Multiattack",
      synthetic: true,
      provenance: {
        sourceGraftId: "pressure-collapse",
        sourceComponentId: "component-pressure-collapse",
        sourceAnchor: "decomposition",
        localAbilityId: "multiattack",
        authorship: "compiler-generated",
        compilation: "graft-v2-bundle",
      },
    });
  });

  it("changes the same graft from one action to a larger high-CR routine", () => {
    const low = buildMonsterAbilityBundleFromGraft(attackPattern, { targetCr: 1 });
    const mid = buildMonsterAbilityBundleFromGraft(attackPattern, { targetCr: 5 });
    const high = buildMonsterAbilityBundleFromGraft(attackPattern, { targetCr: 10 });

    expect(low.abilities.map((ability) => ability.localAbilityId)).toEqual(["slam"]);
    expect(mid.abilities.map((ability) => ability.localAbilityId)).toEqual([
      "multiattack",
      "slam",
      "grab",
    ]);
    expect(mid.routine.multiattack.count).toBe(2);
    expect(high.routine.multiattack.count).toBe(3);
  });

  it("updates the synthetic Multiattack inside a projected full Ability Model", () => {
    const full = buildMonsterAbilitiesFromFeatures([attackPattern]);
    const low = projectMonsterAbilityModelForCr(full, 1);
    const high = projectMonsterAbilityModelForCr(full, 10);
    const highMultiattack = high.abilities.find((ability) => ability.synthetic);

    expect(low.abilities.map((ability) => ability.localAbilityId)).toEqual(["slam"]);
    expect(highMultiattack.rules.multiattack.count).toBe(3);
    expect(
      highMultiattack.rules.multiattack.attacks.reduce(
        (sum, attack) => sum + Number(attack.count || 0),
        0,
      ),
    ).toBe(3);
  });

  it("flattens multiple graft bundles without changing legacy ability ids", () => {
    const legacy = {
      id: "legacy-trait",
      title: "Legacy Trait",
      slot: "body",
      section: "trait",
      source: "decomposition",
      rules: {
        ...buildRules(),
        section: "trait",
        actionEconomy: "passive",
        usage: { type: "passive" },
        resolution: { type: "none" },
        damage: { mode: "none", budgetRole: "none", types: [], parts: [] },
      },
    };
    const model = buildMonsterAbilitiesFromFeatures([legacy, attackPattern]);

    expect(model).toMatchObject({
      grafts: 2,
      total: 4,
      legacyGrafts: 1,
      v2Grafts: 1,
      synthetic: 1,
    });
    expect(model.abilities.map((ability) => ability.id)).toContain("legacy-trait");
    expect(model.byGraft).toEqual({
      "legacy-trait": 1,
      "pressure-collapse": 3,
    });
  });

  it("keeps authored routine allocations distinct for abilities from the same graft", () => {
    const bundle = buildMonsterAbilityBundleFromGraft(attackPattern);
    const routine = buildMonsterAttackRoutine({
      abilities: bundle.abilities,
      targetDpr: 20,
      targetCr: 2,
      computed: { categoryNoun: "zombie" },
    });

    expect(routine.source).toBe("manual");
    expect(routine.mode).toBe("choice");
    expect(Object.keys(routine.allocations).sort()).toEqual([
      "pressure-collapse:grab",
      "pressure-collapse:slam",
    ]);
    expect(routine.allocations["pressure-collapse:slam"].sourceGraftId).toBe(
      "pressure-collapse",
    );
  });
});
