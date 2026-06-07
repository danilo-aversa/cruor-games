import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../../features/monster-composer/data/monster-grafts.js";
import { renderStructuredRulesTemplate, renderStructuredRulesText } from "../../features/monster-composer/model/monster-graft-rules.render.js";
import {
  normalizeMonsterGraftRules,
  summarizeMonsterGraftRules,
  validateMonsterGraftRules,
} from "../../features/monster-composer/model/monster-graft-rules.schema.js";
import { buildBestiaryBaselineAudit } from "../../features/monster-composer/model/monster-bestiary-baselines.js";
import { monsterGraftToSharedComponent } from "../../shared/content/monster-components.js";

const PILOT_GRAFT_IDS = [
  "empowered-slam",
  "acid-vomit",
  "corpse-grab",
  "dangerously-unstable",
  "undead-fortitude",
];

const COMPUTED = {
  attack: 7,
  dc: 15,
  dpr: 42,
  prof: 3,
  baseline: { dpr: 54 },
};

function getGraft(id) {
  const graft = MONSTER_GRAFTS.find((item) => item.id === id);
  expect(graft).toBeTruthy();
  return graft;
}

describe("Monster Graft Rules Schema", () => {
  it("defines explicit v1.1 rules for the Decomposition pilot grafts", () => {
    PILOT_GRAFT_IDS.forEach((id) => {
      const graft = getGraft(id);
      const validation = validateMonsterGraftRules(graft);

      expect(graft.rules).toBeTruthy();
      expect(validation.rules.schemaVersion).toBe("monster-graft-rules-v1.1");
      expect(validation.rules.migration.isStructured).toBe(true);
      expect(validation.valid).toBe(true);
      if (validation.rules.damage?.mode === "budget") {
        expect(validation.rules.damage.budgetRole).toBeTruthy();
        expect(validation.rules.damage.budgetRole).not.toBe("none");
      }
      expect(validation.issues.filter((issue) => issue.severity === "error")).toEqual([]);
    });
  });

  it("keeps legacy grafts readable through rules inference", () => {
    const graft = getGraft("slam-decomposition");
    const rules = normalizeMonsterGraftRules(graft);

    expect(graft.rules).toBeFalsy();
    expect(rules.migration.isStructured).toBe(false);
    expect(rules.section).toBe("action");
    expect(rules.resolution.type).toBe("attackRoll");
  });

  it("renders structured 2024-style save and attack text", () => {
    const acidVomit = renderStructuredRulesText(getGraft("acid-vomit"), COMPUTED);
    const empoweredSlam = renderStructuredRulesText(getGraft("empowered-slam"), COMPUTED);

    expect(acidVomit).toContain("Recharge 5-6.");
    expect(acidVomit).toContain("Dexterity Saving Throw: DC 15");
    expect(acidVomit).toContain("Failure:");
    expect(acidVomit).toContain("Success: Half damage only.");
    expect(acidVomit).toContain("36 (");
    expect(empoweredSlam).toContain("Melee Attack Roll: +7, reach 5 ft. Hit:");
    expect(empoweredSlam).toContain("36 (");
    expect(empoweredSlam).toContain("Strength Saving Throw: DC 15");
  });


  it("renders tokenized templates and resolves manual override text", () => {
    const template = renderStructuredRulesTemplate(getGraft("empowered-slam"));

    expect(template).toContain("Melee Attack Roll: {attack-bonus}, reach 5 ft. Hit:");
    expect(template).toContain("{damage}");
    expect(template).toContain("Strength Saving Throw: DC {save-dc}");

    const manual = {
      ...getGraft("empowered-slam"),
      rules: {
        ...getGraft("empowered-slam").rules,
        text: {
          mode: "manual",
          manual: "{title}. Melee Attack Roll: {attack-bonus}, reach 10 ft. Hit: {average-damage} ({damage-scale:standard}) Bludgeoning damage.",
        },
      },
    };

    expect(renderStructuredRulesTemplate(manual)).toContain("{average-damage} ({damage-scale:standard})");
    expect(renderStructuredRulesText(manual, COMPUTED)).toContain("Empowered Slam. Melee Attack Roll: +7, reach 10 ft. Hit: 36 (6d10 + 3) Bludgeoning damage.");
  });

  it("preserves structured rules when converting grafts into shared components", () => {
    const sharedComponent = monsterGraftToSharedComponent(getGraft("acid-vomit"));

    expect(sharedComponent.monster.rules).toBeTruthy();
    expect(sharedComponent.monster.rules.resolution.type).toBe("savingThrow");
    expect(sharedComponent.monster.rules.usage.value).toBe("5-6");
    expect(sharedComponent.monster.rules.damage.budgetRole).toBe("rechargeControl");
  });

  it("summarizes structured vs inferred migration state", () => {
    const summary = summarizeMonsterGraftRules(MONSTER_GRAFTS);

    expect(summary.total).toBeGreaterThan(PILOT_GRAFT_IDS.length);
    expect(summary.structured).toBeGreaterThanOrEqual(PILOT_GRAFT_IDS.length);
    expect(summary.inferred).toBeGreaterThan(0);
  });

  it("builds a 2024-derived bestiary baseline audit", () => {
    const audit = buildBestiaryBaselineAudit({
      targetCr: 8,
      monsterTier: { id: "normal" },
      printedStats: {
        ac: 16,
        hp: 144,
        dpr: 62,
        attackBonus: 7,
        saveDc: 15,
      },
      effectiveProfile: {
        effectiveDpr3Round: 78,
      },
      mechanicsSummary: {
        reactionCount: 0,
        majorConditionCount: 1,
        rechargeCount: 1,
      },
    });

    expect(audit.baseline.version).toBe("mm2024-derived-v0.2");
    expect(audit.baseline.cr).toBe(8);
    expect(audit.baseline.saveDc).toBe(16);
    expect(audit.bands.effectiveDpr).not.toBe("low");
  });
});
