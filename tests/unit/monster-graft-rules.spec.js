import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../../features/monster-composer/data/monster-grafts.js";
import { renderStructuredRulesText } from "../../features/monster-composer/model/monster-graft-rules.render.js";
import {
  MONSTER_GRAFT_RULES_SCHEMA_VERSION,
  normalizeMonsterGraftRules,
  summarizeMonsterGraftRules,
  validateMonsterGraftRules,
} from "../../features/monster-composer/model/monster-graft-rules.schema.js";
import {
  classifyBestiaryAbilityText,
  splitBestiaryAbilityEntries,
  summarizeBestiaryRulesCoverage,
} from "../../features/monster-composer/model/monster-rules-coverage.js";
import { buildBestiaryBaselineAudit } from "../../features/monster-composer/model/monster-bestiary-baselines.js";
import { monsterGraftToSharedComponent } from "../../shared/content/monster-components.js";
import {
  buildMonsterAbilityFromGraft,
  buildMonsterAbilitiesFromFeatures,
  MONSTER_ABILITY_MODEL_VERSION,
} from "../../features/monster-composer/model/monster-ability-model.js";

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
  it("defines explicit current rules for the Decomposition pilot grafts", () => {
    PILOT_GRAFT_IDS.forEach((id) => {
      const graft = getGraft(id);
      const validation = validateMonsterGraftRules(graft);

      expect(graft.rules).toBeTruthy();
      expect(validation.rules.schemaVersion).toBe(MONSTER_GRAFT_RULES_SCHEMA_VERSION);
      expect(validation.rules.migration.isStructured).toBe(true);
      expect(validation.valid).toBe(true);
      if (validation.rules.damage?.mode === "budget") {
        expect(validation.rules.damage.budgetRole).toBeTruthy();
        expect(validation.rules.damage.budgetRole).not.toBe("none");
      }
      expect(validation.issues.filter((issue) => issue.severity === "error")).toEqual([]);
    });
  });

  it("keeps all current grafts on explicit structured rules", () => {
    const summary = summarizeMonsterGraftRules(MONSTER_GRAFTS);

    expect(summary.total).toBeGreaterThan(PILOT_GRAFT_IDS.length);
    expect(summary.structured).toBe(summary.total);
    expect(summary.inferred).toBe(0);
    expect(summary.errors).toEqual([]);
  });

  it("still supports legacy rules inference for synthetic migration inputs", () => {
    const graft = {
      id: "legacy-slam",
      title: "Legacy Slam",
      slot: "attack",
      section: "action",
      stats: { dpr: 4 },
      mechanics: "Legacy Slam. Melee Attack Roll: +6, reach 5 ft. Hit: 9 (2d4 + 4) Bludgeoning damage.",
    };
    const rules = normalizeMonsterGraftRules(graft);

    expect(graft.rules).toBeFalsy();
    expect(rules.migration.isStructured).toBe(false);
    expect(rules.section).toBe("action");
    expect(rules.resolution.type).toBe("attackRoll");
  });

  it("hydrates structured save traits into editable ability fields", () => {
    const graft = getGraft("swollen-corpse");
    const rules = normalizeMonsterGraftRules(graft);
    const preview = renderStructuredRulesText(graft, COMPUTED);

    expect(graft.rules).toBeTruthy();
    expect(rules.migration.isStructured).toBe(true);
    expect(rules.resolution.type).toBe("savingThrow");
    expect(rules.resolution.ability).toBe("constitution");
    expect(rules.targeting.shape).toBe("radius");
    expect(rules.targeting.size).toBe(5);
    expect(rules.condition.names).toContain("poisoned");
    expect(rules.condition.duration).toBe("until the end of its next turn");
    expect(preview).toContain("When the creature is first bloodied.");
    expect(preview).toContain("Constitution Saving Throw: DC 15");
    expect(preview).toContain("5-foot Radius");
    expect(preview).not.toContain("Variable damage");
  });

  it("builds system-neutral ability records from structured graft rules", () => {
    const ability = buildMonsterAbilityFromGraft(getGraft("empowered-slam"));
    const model = buildMonsterAbilitiesFromFeatures(MONSTER_GRAFTS);

    expect(ability.version).toBe(MONSTER_ABILITY_MODEL_VERSION);
    expect(ability.resolution.attack.attackType).toBe("melee");
    expect(ability.damage.hasDamage).toBe(true);
    expect(ability.tags).toContain("attack_roll");
    expect(model.total).toBe(MONSTER_GRAFTS.length);
    expect(model.structured).toBe(model.total);
    expect(model.validation.status).toBe("pass");
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

  it("renders damage parts and shared attack/save event text", () => {
    const synthetic = {
      id: "storm-maul",
      title: "Storm Maul",
      rules: {
        section: "action",
        actionEconomy: "action",
        usage: { type: "atWill" },
        resolution: { type: "attackRoll", attackType: "melee", bonus: "monster", reach: "5 ft." },
        secondaryResolution: { type: "savingThrow", ability: "strength", dc: "monster" },
        damage: {
          mode: "parts",
          parts: [
            { id: "weapon", mode: "budget", budgetRole: "mainAttack", budgetShare: 0.45, types: ["bludgeoning"] },
            { id: "shock", mode: "budget", budgetRole: "secondaryAttack", budgetShare: 0.3, types: ["lightning"] },
          ],
        },
        text: {
          hit: "{damage-part:weapon} Bludgeoning damage plus {damage-part:shock} Lightning damage.",
          hitOrMiss: "The maul hums until the end of the turn.",
          failure: "The target has the Prone condition.",
          success: "The target is not knocked prone.",
          failureOrSuccess: "The target cannot take reactions until the start of its next turn.",
        },
        migration: { isStructured: true },
      },
    };

    const text = renderStructuredRulesText(synthetic, COMPUTED);

    expect(text).toContain("Melee Attack Roll: +7, reach 5 ft. Hit:");
    expect(text).toContain("Bludgeoning damage plus");
    expect(text).toContain("Lightning damage");
    expect(text).toContain("Hit or Miss:");
    expect(text).toContain("Strength Saving Throw: DC 15");
    expect(text).toContain("Failure or Success:");
  });


  it("renders structured Multiattack with replacements", () => {
    const synthetic = {
      id: "multiattack-test",
      title: "Multiattack",
      rules: {
        section: "action",
        actionEconomy: "action",
        usage: { type: "atWill" },
        resolution: { type: "none" },
        multiattack: {
          enabled: true,
          mode: "replaceOne",
          count: 3,
          attacks: [{ ref: "rend", label: "Rend", count: 3 }],
          replacements: [{ replace: "oneAttack", with: "spellcasting", label: "Spellcasting" }],
        },
        migration: { isStructured: true },
      },
    };

    const validation = validateMonsterGraftRules(synthetic);
    const text = renderStructuredRulesText(synthetic, COMPUTED);

    expect(validation.valid).toBe(true);
    expect(text).toContain("The monster makes three Rend attacks.");
    expect(text).toContain("It can replace one attack with Spellcasting.");
  });



  it("renders structured Spellcasting from the 5E 2024 spell registry", () => {
    const synthetic = {
      id: "cult-spellcasting",
      title: "Spellcasting",
      rules: {
        section: "action",
        actionEconomy: "action",
        usage: { type: "atWill" },
        resolution: { type: "none" },
        spellcasting: {
          enabled: true,
          ability: "wisdom",
          saveDc: "monster",
          attackBonus: "monster",
          requiresMaterialComponents: false,
          lists: [
            { id: "atWill", usage: "atWill", label: "At will", spellRefs: ["detect-magic", "minor-illusion"] },
            { id: "daily1", usage: "daily1", label: "1/day each", spellRefs: ["fear"], spells: ["Custom Curse"] },
          ],
        },
        migration: { isStructured: true },
      },
    };

    const validation = validateMonsterGraftRules(synthetic);
    const text = renderStructuredRulesText(synthetic, COMPUTED);

    expect(validation.valid).toBe(true);
    expect(text).toContain("Spellcasting");
    expect(text).toContain("requiring no Material components");
    expect(text).toContain("Wisdom as the spellcasting ability");
    expect(text).toContain("spell save DC 15");
    expect(text).toContain("+7 to hit with spell attacks");
    expect(text).toContain("At will: Detect Magic, Minor Illusion.");
    expect(text).toContain("1/day each: Fear, Custom Curse.");
  });

  it("renders condition escape, repeat saves, and ongoing effects", () => {
    const synthetic = {
      id: "crushing-coils",
      title: "Crushing Coils",
      rules: {
        section: "action",
        actionEconomy: "action",
        usage: { type: "atWill" },
        resolution: { type: "attackRoll", attackType: "melee", bonus: "monster", reach: "10 ft." },
        damage: { mode: "budget", budgetRole: "mainAttack", budgetShare: 0.45, types: ["bludgeoning"] },
        condition: {
          names: ["grappled", "restrained"],
          severity: "major",
          duration: "until the grapple ends",
          sizeLimit: "Large or smaller",
          escape: { enabled: true, dc: "monster", ability: "strength" },
          repeatSave: { enabled: true, ability: "strength", timing: "endOfTurn", endsOnSuccess: true },
        },
        ongoing: {
          enabled: true,
          timing: "startOfTargetTurn",
          damage: { mode: "budget", budgetRole: "ongoing", budgetShare: 0.2, types: ["bludgeoning"] },
          endCondition: "until the grapple ends",
        },
        migration: { isStructured: true },
      },
    };

    const validation = validateMonsterGraftRules(synthetic);
    const text = renderStructuredRulesText(synthetic, COMPUTED);

    expect(validation.valid).toBe(true);
    expect(text).toContain("Melee Attack Roll: +7, reach 10 ft. Hit:");
    expect(text).toContain("target that is Large or smaller has the Grappled and Restrained conditions (escape DC 15).");
    expect(text).toContain("The target repeats the Strength Saving Throw at the end of each of its turns");
    expect(text).toContain("At the start of each of the target's turns, the target takes");
  });

  it("renders structured defense features", () => {
    const legendaryResistance = {
      id: "legendary-resistance-test",
      title: "Legendary Resistance",
      rules: {
        section: "trait",
        actionEconomy: "passive",
        usage: { type: "limited", value: "3/Day" },
        resolution: { type: "none" },
        defense: { enabled: true, type: "legendaryResistance", uses: 3, timing: "onFailedSave" },
        migration: { isStructured: true },
      },
    };
    const regeneration = {
      id: "regeneration-test",
      title: "Regeneration",
      rules: {
        section: "trait",
        actionEconomy: "passive",
        usage: { type: "passive" },
        resolution: { type: "none" },
        defense: { enabled: true, type: "regeneration", value: 10, timing: "startOfTurn", breakCondition: "takes Fire damage" },
        migration: { isStructured: true },
      },
    };

    const legendaryValidation = validateMonsterGraftRules(legendaryResistance);
    const regenerationValidation = validateMonsterGraftRules(regeneration);
    const legendaryText = renderStructuredRulesText(legendaryResistance, COMPUTED);
    const regenerationText = renderStructuredRulesText(regeneration, COMPUTED);

    expect(legendaryValidation.valid).toBe(true);
    expect(regenerationValidation.valid).toBe(true);
    expect(legendaryText).toContain("fails a saving throw");
    expect(legendaryText).toContain("3/Day");
    expect(regenerationText).toContain("regains 10 Hit Points");
    expect(regenerationText).toContain("takes Fire damage");
  });


  it("renders inferred outcome text and area timing effects", () => {
    const swollen = getGraft("swollen-corpse");
    const swollenRules = normalizeMonsterGraftRules(swollen);

    expect(swollenRules.text.failure).toContain("Poisoned");
    expect(swollenRules.text.success).toBe("No effect.");

    const aura = {
      id: "rotting-aura",
      title: "Rotting Aura",
      rules: {
        section: "trait",
        actionEconomy: "passive",
        usage: { type: "passive" },
        resolution: { type: "none" },
        areaEffect: {
          enabled: true,
          type: "aura",
          shape: "emanation",
          size: 10,
          unit: "ft",
          origin: "self",
          timing: "startsTurnInArea",
          targets: "enemies",
          excludes: ["undead"],
        },
        condition: { names: ["poisoned"], severity: "moderate", duration: "until the start of its next turn" },
        migration: { isStructured: true },
      },
    };

    const validation = validateMonsterGraftRules(aura);
    const text = renderStructuredRulesText(aura, COMPUTED);

    expect(validation.valid).toBe(true);
    expect(text).toContain("When a creature starts its turn in the area");
    expect(text).toContain("10-foot Emanation from the monster");
    expect(text).toContain("enemies except Undead");
    expect(text).toContain("Poisoned condition");
  });


  it("renders structured summon/create abilities", () => {
    const synthetic = {
      id: "call-shadows",
      title: "Call Shadows",
      rules: {
        section: "action",
        actionEconomy: "action",
        usage: { type: "limited", value: "1/Day" },
        resolution: { type: "none" },
        summon: {
          enabled: true,
          type: "summon",
          creatureName: "Shadow",
          creatureRef: "shadow",
          count: "1d4",
          placement: "unoccupied spaces within 30 feet",
          duration: "until destroyed",
          initiative: "immediatelyAfterSummoner",
          control: "underSummonerControl",
          limit: "1/Day",
        },
        migration: { isStructured: true },
      },
    };

    const validation = validateMonsterGraftRules(synthetic);
    const text = renderStructuredRulesText(synthetic, COMPUTED);

    expect(validation.valid).toBe(true);
    expect(text).toContain("The monster summons 1d4 Shadows in unoccupied spaces within 30 feet.");
    expect(text).toContain("The summoned creatures act immediately after the monster.");
    expect(text).toContain("They obey the monster's commands.");
    expect(text).toContain("They remain until destroyed.");
  });

  it("renders structured special procedures", () => {
    const synthetic = {
      id: "swallow-test",
      title: "Swallow",
      rules: {
        section: "action",
        actionEconomy: "action",
        usage: { type: "atWill" },
        resolution: { type: "none" },
        procedure: {
          enabled: true,
          type: "swallow",
          targetLimit: "Large or smaller",
          prerequisite: "The target must be Grappled.",
          entryEffect: "The target is swallowed.",
          internalState: "The swallowed target has Total Cover and the Blinded and Restrained conditions.",
          ongoingDamage: {
            enabled: true,
            timing: "startOfMonsterTurn",
            damage: { mode: "budget", budgetRole: "ongoing", budgetShare: 0.25, types: ["acid"] },
            endCondition: "until the target escapes",
          },
          escapeCondition: "If the monster takes 20 damage or more on a single turn from inside it, it must succeed on a Constitution Saving Throw or regurgitate the target.",
          releaseCondition: "If the monster dies, the swallowed target is no longer Restrained and can escape using 10 feet of movement.",
        },
        migration: { isStructured: true },
      },
    };

    const validation = validateMonsterGraftRules(synthetic);
    const text = renderStructuredRulesText(synthetic, COMPUTED);

    expect(validation.valid).toBe(true);
    expect(text).toContain("Swallow.");
    expect(text).toContain("Target Limit: Large or smaller.");
    expect(text).toContain("Prerequisite: The target must be Grappled.");
    expect(text).toContain("The target is swallowed.");
    expect(text).toContain("Total Cover");
    expect(text).toContain("At the start of each of the monster's turns, the target takes");
    expect(text).toContain("Acid damage");
    expect(text).toContain("Escape:");
    expect(text).toContain("Release:");
  });



  it("renders structured ability links", () => {
    const synthetic = {
      id: "tail-swipe-link",
      title: "Tail Swipe",
      rules: {
        section: "legendaryAction",
        actionEconomy: "legendaryAction",
        usage: { type: "legendary" },
        resolution: { type: "none" },
        references: [
          { type: "attack", relationship: "makes", ref: "tail", label: "Tail", count: 1 },
          { type: "spellcasting", relationship: "replaceOneAttack", ref: "spellcasting", label: "Spellcasting" },
        ],
        migration: { isStructured: true },
      },
    };

    const validation = validateMonsterGraftRules(synthetic);
    const text = renderStructuredRulesText(synthetic, COMPUTED);

    expect(validation.valid).toBe(true);
    expect(text).toContain("The monster makes one Tail attack.");
    expect(text).toContain("The monster can replace one attack with Spellcasting.");
  });

  it("preserves structured rules when converting grafts into shared components", () => {
    const sharedComponent = monsterGraftToSharedComponent(getGraft("acid-vomit"));

    expect(sharedComponent.monster.rules).toBeTruthy();
    expect(sharedComponent.monster.rules.resolution.type).toBe("savingThrow");
    expect(sharedComponent.monster.rules.usage.value).toBe("5-6");
    expect(sharedComponent.monster.rules.damage.budgetRole).toBe("rechargeControl");
  });

  it("summarizes structured migration state", () => {
    const summary = summarizeMonsterGraftRules(MONSTER_GRAFTS);

    expect(summary.total).toBeGreaterThan(PILOT_GRAFT_IDS.length);
    expect(summary.structured).toBe(summary.total);
    expect(summary.inferred).toBe(0);
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

  it("classifies referenced actions as structured ability links", () => {
    const classification = classifyBestiaryAbilityText({
      monsterName: "Aboleth",
      section: "Legendary Actions",
      text: "Lash. The aboleth makes one Tentacle attack.",
    });

    expect(classification.coverage).toBe("structured");
    expect(classification.structuredPatternIds).toContain("action_reference");
  });

});

describe("Monster Rules Coverage Audit", () => {
  it("keeps spellcasting spell lists attached to the Spellcasting ability block", () => {
    const entries = splitBestiaryAbilityEntries(
      "Spellcasting. The monster casts one of the following spells, requiring no Material components and using Wisdom as the spellcasting ability (spell save DC 13):\n\nAt will: Detect Magic, Minor Illusion\n\n1/day: Fear\n\nClaw. Melee Attack Roll: +5, reach 5 ft. Hit: 7 (1d8 + 3) Slashing damage.",
    );

    expect(entries).toHaveLength(2);
    expect(entries[0]).toContain("At will:");
    expect(entries[0]).toContain("1/day:");
    expect(entries[1]).toContain("Claw.");
  });

  it("classifies complex bestiary abilities against supported rule blocks", () => {
    const classification = classifyBestiaryAbilityText({
      monsterName: "Synthetic Horror",
      section: "Actions",
      text: "Storm Maul. Melee Attack Roll: +7, reach 5 ft. Hit: 10 (2d6 + 3) Bludgeoning damage plus 7 (2d6) Lightning damage. Hit or Miss: The weapon returns to the monster. Strength Saving Throw: DC 15. Failure: The target has the Prone condition. Success: No effect.",
    });

    expect(classification.coverage).toBe("structured");
    expect(classification.structuredPatternIds).toContain("attack_roll");
    expect(classification.structuredPatternIds).toContain("saving_throw");
    expect(classification.structuredPatternIds).toContain("attack_plus_save");
    expect(classification.structuredPatternIds).toContain("damage_parts");
    expect(classification.structuredPatternIds).toContain("text_events");
    expect(classification.structuredPatternIds).toContain("conditions");
  });

  it("flags mythic sections and random tables for manual review", () => {
    const summary = summarizeBestiaryRulesCoverage(
      [
        {
          id: "mythic-test",
          monsterName: "Mythic Horror",
          section: "Mythic Actions",
          text: "Mythic Surge. The monster rolls a d6 and gains one benefit from the table.",
        },
        {
          id: "simple-test",
          monsterName: "Simple Horror",
          section: "Actions",
          text: "Claw. Melee Attack Roll: +5, reach 5 ft. Hit: 7 (1d8 + 3) Slashing damage.",
        },
      ],
      { entriesProvided: true },
    );

    expect(summary.totalAbilities).toBe(2);
    expect(summary.coverageCounts.structured).toBe(1);
    expect(summary.coverageCounts["manual-review"]).toBe(1);
    expect(summary.manualReviewEntries[0].manualReviewPatternIds).toContain("mythic_action");
    expect(summary.manualReviewEntries[0].manualReviewPatternIds).toContain("random_table");
  });
});
