import { describe, expect, it } from "vitest";

import {
  EMPTY_DRAFT,
  buildComponentTemplate,
  normalizeModuleForDraft,
} from "./studio-draft.js";
import {
  buildContentPackExport,
  buildModuleExport,
} from "./studio-export.js";
import {
  buildMonsterRulesFeature,
  getStudioMonsterGraftValidation,
  getStudioMonsterPayload,
  isStudioMonsterGraftV2,
} from "./studio-component-normalizers.js";
import { validateStudioDraft } from "./studio-validation.js";

function buildRules({ role = "mainAttack", share = 0.6 } = {}) {
  return {
    schemaVersion: "monster-graft-rules-v1.16",
    section: "action",
    actionEconomy: "action",
    usage: { type: "atWill" },
    resolution: {
      type: "attackRoll",
      attackType: "melee",
      abilityBasis: "strength",
      bonus: "monster",
    },
    targeting: { type: "single", targets: "one creature" },
    damage: {
      mode: "budget",
      budgetRole: role,
      budgetShare: share,
      expectedTargets: 1,
      roundWeight: [1, 1, 1],
      types: ["bludgeoning"],
      scale: "standard",
      parts: [],
    },
    effects: [],
    parity: { status: "unreviewed" },
    condition: null,
    counterplay: {
      telegraph: true,
      positioningAnswer: true,
    },
    text: {},
    references: [],
    migration: { source: "studio-test", isStructured: true },
  };
}

function buildAttackPatternPayload() {
  return {
    graftId: "studio-pressure-collapse",
    graftSchemaVersion: "monster-graft-v2.0",
    kind: "attackPattern",
    slot: "attack",
    section: "action",
    cost: 3,
    complexity: 2,
    identity: {
      fantasy: "A corpse folds its full weight into the victim.",
      tacticalRole: "single-target pressure",
      signature: "impact followed by restraint",
      recognitionTags: ["impact", "restraint", "corpse-weight"],
    },
    abilities: [
      {
        id: "slam",
        title: "Heavy Slam",
        section: "action",
        rules: buildRules(),
      },
      {
        id: "grab",
        title: "Corpse Grab",
        section: "action",
        counterplay: "Break line of approach or force the corpse away.",
        rules: buildRules({ role: "secondaryAttack", share: 0.4 }),
      },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Strike, then restrain the same target.",
      targetSelection: "Prefer an isolated creature.",
      defaultSequence: ["slam", "grab"],
      opener: [],
      alternatives: [],
      intentionalRepetition: false,
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
    progression: {
      schemaVersion: "monster-attack-pattern-progression-v1.0",
      basis: "targetCr",
      bands: [
        {
          id: "low",
          minCr: 0,
          maxCr: 1,
          abilityIds: ["slam"],
          defaultSequence: ["slam"],
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "mid",
          minCr: 2,
          maxCr: 8,
          abilityIds: ["slam", "grab"],
          defaultSequence: ["slam", "grab"],
          multiattack: { enabled: true, mode: "choice", count: 2 },
        },
        {
          id: "high",
          minCr: 9,
          maxCr: 30,
          abilityIds: ["slam", "grab"],
          defaultSequence: ["slam", "grab", "slam"],
          multiattack: { enabled: true, mode: "choice", count: 3 },
        },
      ],
    },
    balanceProfile: { buildBudget: 3 },
    complexityProfile: { tracking: 2 },
    counterplayProfile: {
      telegraphs: ["It lowers one shoulder before surging forward."],
      positioningAnswers: ["Keep another creature between it and the target."],
      breakConditions: [],
      nonDamageAnswers: [],
    },
    spikeRiskProfile: { opening: "moderate" },
    migration: { status: "authored-v2" },
  };
}

describe("Content Studio Graft v2 boundary", () => {
  it("round-trips the complete payload without creating legacy top-level rules", () => {
    const draft = normalizeModuleForDraft(EMPTY_DRAFT);
    const graft = buildComponentTemplate("monster-action", draft);
    const payload = buildAttackPatternPayload();
    graft.monster = payload;
    graft.slots = ["attack"];
    graft.counterplay = "";
    draft.components.push(graft);

    expect(isStudioMonsterGraftV2(graft)).toBe(true);
    expect(getStudioMonsterPayload(graft)).toEqual(payload);
    expect(getStudioMonsterGraftValidation(graft)).toMatchObject({
      applicable: true,
      status: "pass",
    });
    expect(buildMonsterRulesFeature(graft)).not.toHaveProperty("rules");

    const moduleExport = buildModuleExport(draft);
    const exportedGraft = moduleExport.components.find(
      (component) => component.id === graft.id,
    );

    expect(exportedGraft.semantic.details.monster).toEqual(payload);
    expect(exportedGraft.semantic.details.monster).not.toHaveProperty("rules");
  });

  it("validates ability-level rules instead of requiring monster.rules", () => {
    const draft = normalizeModuleForDraft(EMPTY_DRAFT);
    const graft = buildComponentTemplate("monster-action", draft);
    graft.monster = buildAttackPatternPayload();
    graft.slots = ["attack"];
    draft.components.push(graft);

    const pack = buildContentPackExport(draft);
    const report = validateStudioDraft(draft, pack);
    const messages = report.issues.map((issue) => issue.message);

    expect(messages).not.toContain(
      "Legacy Monster graft has no structured monster.rules object.",
    );
    expect(
      report.issues.filter(
        (issue) => issue.id === graft.id && issue.severity === "error",
      ),
    ).toEqual([]);
  });
});
