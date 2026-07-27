import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import { buildMonsterAbilityBundleFromGraft } from "./monster-ability-model.js";
import {
  getDamageRoundWeight,
  getDamageTotalBudgetShare,
  getMonsterRuleEffects,
  normalizeMonsterGraftRules,
} from "./monster-graft-rules.schema.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";
import { buildMonsterRulesParityReport } from "./monster-rules-parity.js";

function getGraft(id) {
  const graft = MONSTER_GRAFTS.find((entry) => entry.id === id);
  if (!graft) throw new Error(`Missing test graft: ${id}`);
  return graft;
}

const computed = {
  attack: 6,
  dc: 13,
  dpr: 20,
  targetCr: 2,
  category: "Zombie",
  categoryNoun: "zombie",
  rulesContext: { categoryNoun: "zombie" },
};

describe("monster rules parity", () => {
  it("structures, simulates, and renders Heavy Slam's conditional charge damage", () => {
    const graft = getGraft("slam-decomposition");
    const rules = normalizeMonsterGraftRules(graft);
    const charge = rules.damage.parts.find((part) => part.id === "charge");
    const rendered = renderStructuredRulesText(graft, computed);
    const report = buildMonsterRulesParityReport(graft, { renderedText: rendered });
    const bundle = buildMonsterAbilityBundleFromGraft(graft);
    const chargeEntry = bundle.primaryAbility.damage.entries.find(
      (entry) => entry.id === "charge",
    );

    expect(rules.parity.status).toBe("verified");
    expect(rules.damage.parts.map((part) => part.id)).toEqual(["impact", "charge"]);
    expect(rules.damage.parts.map((part) => part.authoredBudgetShare)).toEqual([0.8, 0.2]);
    expect(getDamageTotalBudgetShare(rules.damage, rules)).toBeCloseTo(1, 8);
    expect(charge.activation).toMatchObject({
      type: "conditional",
      expectedRate: 0.35,
      oncePerTurn: true,
    });
    expect(getDamageRoundWeight(charge, rules)).toEqual([0.35, 0.35, 0.35]);
    expect(chargeEntry).toMatchObject({
      activationRate: 0.35,
      activation: { type: "conditional" },
    });
    expect(rendered).toMatch(/moved at least 10 feet straight/i);
    expect(rendered).toMatch(/extra .*bludgeoning damage/i);
    expect(report).toMatchObject({
      applicable: true,
      pass: true,
      conditionalDamageCount: 1,
      errors: 0,
    });
  });

  it("renders conditional damage triggers from structured parts when authored hit text is unavailable", () => {
    const graft = getGraft("slam-decomposition");
    const rules = normalizeMonsterGraftRules(graft);
    const abilityFallback = {
      id: "heavy-slam-fallback",
      title: "Heavy Slam",
      slot: "attack",
      section: "action",
      source: graft.source,
      mechanics: "",
      rules: {
        ...rules,
        text: {},
      },
    };

    const rendered = renderStructuredRulesText(abilityFallback, computed);
    const report = buildMonsterRulesParityReport(abilityFallback, {
      renderedText: rendered,
    });

    expect(rendered).toMatch(/moved at least 10 feet straight/i);
    expect(rendered).toMatch(/extra .*bludgeoning damage/i);
    expect(report).toMatchObject({
      applicable: true,
      pass: true,
      conditionalDamageCount: 1,
      errors: 0,
    });
  });

  it("preserves both Skin Slippage clauses as structured effects", () => {
    const graft = getGraft("skin-slippage");
    const rules = normalizeMonsterGraftRules(graft);
    const effects = getMonsterRuleEffects(rules);
    const rendered = renderStructuredRulesText(graft, computed);
    const report = buildMonsterRulesParityReport(graft, { renderedText: rendered });
    const bundle = buildMonsterAbilityBundleFromGraft(graft);

    expect(effects.map((effect) => effect.id)).toEqual([
      "slippery-escape",
      "grappler-disruption",
    ]);
    expect(effects.map((effect) => effect.simulation.policy)).toEqual([
      "nonNumeric",
      "proxy",
    ]);
    expect(bundle.primaryAbility.effects).toHaveLength(2);
    expect(rendered).toMatch(/advantage .*escape a grapple/i);
    expect(rendered).toMatch(/DC 13 Constitution Saving Throw/i);
    expect(rendered).toMatch(/disadvantage on the next attack roll/i);
    expect(report).toMatchObject({
      applicable: true,
      pass: true,
      effectCount: 2,
      errors: 0,
    });
  });

  it("rejects a verified effect that has no simulation disposition", () => {
    const graft = {
      id: "broken-parity",
      title: "Broken Parity",
      slot: "body",
      section: "trait",
      source: "decomposition",
      rules: {
        schemaVersion: "monster-graft-rules-v1.16",
        section: "trait",
        actionEconomy: "passive",
        usage: { type: "passive" },
        resolution: { type: "none" },
        damage: { mode: "none", budgetRole: "none", types: [], parts: [] },
        effects: [
          {
            id: "hidden-effect",
            type: "custom",
            subject: "self",
            text: "The monster ignores the first grapple each round.",
            simulation: { policy: "unmodeled" },
          },
        ],
        text: { effect: "The monster ignores the first grapple each round." },
        parity: {
          status: "verified",
          reviewedBy: "test",
          reviewedAt: "2026-07-25",
        },
        migration: { source: "test", isStructured: true },
      },
    };

    const report = buildMonsterRulesParityReport(graft, {
      renderedText: graft.rules.text.effect,
    });

    expect(report.pass).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("effect-unmodeled");
  });
});
