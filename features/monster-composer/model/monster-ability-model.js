import {
  BLOCKING_DAMAGE_ISSUE_CODES,
  getDamageBudgetShare,
  getDamageExpectedTargets,
  getDamageParts,
  getDamageRoundWeight,
  normalizeMonsterGraftRules,
  validateMonsterGraftRules,
} from "./monster-graft-rules.schema.js";

export const MONSTER_ABILITY_MODEL_VERSION = "monster-ability-model-v0.2";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function uniqueArray(values = []) {
  return [...new Set(asArray(values).map(cleanString).filter(Boolean))];
}

function countBy(values = []) {
  return values.reduce((acc, value) => {
    const key = cleanString(value) || "none";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function isAttackResolution(resolution = {}) {
  return resolution.type === "attackRoll" || resolution.type === "attackRollSavingThrow";
}

function isSaveResolution(resolution = {}) {
  return resolution.type === "savingThrow" || resolution.type === "attackRollSavingThrow";
}

function normalizeRoundWeightForAbility(damage = {}, rules = {}) {
  const weights = getDamageRoundWeight(damage, rules);
  return Array.isArray(weights) && weights.length ? weights : [1, 1, 1];
}

function buildDamageEntry({ damage, rules, source, parentId = null, index = 0 }) {
  if (!damage || damage.mode === "none") return null;
  return {
    id: cleanString(damage.id) || `${source}-${index + 1}`,
    source,
    parentId,
    mode: damage.mode || "budget",
    budgetRole: damage.budgetRole || "none",
    budgetShare: getDamageBudgetShare(damage, rules),
    expectedTargets: getDamageExpectedTargets(damage, rules),
    roundWeight: normalizeRoundWeightForAbility(damage, rules),
    scale: damage.scale || "standard",
    types: uniqueArray(damage.types || damage.type),
    abilityBasis: cleanString(damage.abilityBasis || rules.resolution?.abilityBasis || ""),
    modifierPolicy: cleanString(damage.modifierPolicy || ""),
    damage,
  };
}

function collectDamageEntries(rules = {}) {
  const entries = [];
  const damage = rules.damage;
  const parts = getDamageParts(damage);

  if (parts.length) {
    parts.forEach((part, index) => {
      const entry = buildDamageEntry({
        damage: part,
        rules,
        source: "damage_part",
        parentId: cleanString(damage?.id || "damage"),
        index,
      });
      if (entry) entries.push(entry);
    });
  } else if (damage && damage.mode !== "none") {
    const entry = buildDamageEntry({ damage, rules, source: "damage", index: 0 });
    if (entry) entries.push(entry);
  }

  if (rules.ongoing?.enabled && rules.ongoing.damage) {
    const entry = buildDamageEntry({
      damage: rules.ongoing.damage,
      rules: { ...rules, actionEconomy: "freeTrigger", usage: { type: "triggered" } },
      source: "ongoing",
      index: entries.length,
    });
    if (entry) entries.push(entry);
  }

  if (rules.procedure?.ongoingDamage?.enabled && rules.procedure.ongoingDamage.damage) {
    const entry = buildDamageEntry({
      damage: rules.procedure.ongoingDamage.damage,
      rules: { ...rules, actionEconomy: "freeTrigger", usage: { type: "triggered" } },
      source: "procedure_ongoing",
      index: entries.length,
    });
    if (entry) entries.push(entry);
  }

  return entries;
}

function buildResolutionProfile(rules = {}) {
  const primary = rules.resolution || { type: "none" };
  const secondary = rules.secondaryResolution || null;
  return {
    type: primary.type || "none",
    primary,
    secondary,
    attack: isAttackResolution(primary)
      ? {
          attackType: primary.attackType || "melee",
          abilityBasis: primary.abilityBasis || "monster",
          bonusSource: primary.bonus || "monster",
          reach: primary.reach || null,
          range: primary.range || null,
        }
      : null,
    save: isSaveResolution(primary)
      ? {
          ability: primary.ability || null,
          dcSource: primary.dc || "monster",
        }
      : null,
    secondarySave: secondary?.type === "savingThrow"
      ? {
          ability: secondary.ability || null,
          dcSource: secondary.dc || "monster",
        }
      : null,
  };
}


function hasBlockingDamageIssue(rulesValidation = {}) {
  const blockingCodes = new Set(BLOCKING_DAMAGE_ISSUE_CODES);
  return (rulesValidation.issues || []).some((issue) => issue.severity === "error" && blockingCodes.has(issue.code));
}

function buildConditionEntries(condition = null) {
  if (!condition?.names?.length) return [];
  return condition.names.map((name) => ({
    name,
    severity: condition.severity || "moderate",
    duration: condition.duration || "",
    sizeLimit: condition.sizeLimit || "",
    special: uniqueArray(condition.special),
    escape: condition.escape || null,
    repeatSave: condition.repeatSave || null,
  }));
}

function buildAbilityTags({ rules, damageEntries, conditions, resolution }) {
  const tags = [];
  if (damageEntries.length) tags.push("damage");
  if (resolution.attack) tags.push("attack_roll");
  if (resolution.save) tags.push("saving_throw");
  if (resolution.secondarySave) tags.push("secondary_save");
  if (conditions.length) tags.push("condition");
  conditions.forEach((condition) => {
    tags.push(`condition:${condition.name}`);
    tags.push(`condition_severity:${condition.severity}`);
  });
  if (rules.usage?.type) tags.push(`usage:${rules.usage.type}`);
  if (rules.actionEconomy) tags.push(`action_economy:${rules.actionEconomy}`);
  if (rules.multiattack?.enabled) tags.push("multiattack");
  if (rules.spellcasting?.enabled) tags.push("spellcasting");
  if (rules.defense?.enabled) tags.push(`defense:${rules.defense.type || "custom"}`);
  if (rules.summon?.enabled) tags.push("summon");
  if (rules.procedure?.enabled) tags.push(`procedure:${rules.procedure.type || "custom"}`);
  if (rules.areaEffect?.enabled) tags.push("area_effect");
  if (rules.ongoing?.enabled) tags.push("ongoing");
  if (rules.counterplay?.telegraph) tags.push("counterplay:telegraph");
  if (rules.counterplay?.breakCondition) tags.push("counterplay:break_condition");
  if (rules.counterplay?.positioningAnswer) tags.push("counterplay:positioning");
  if (rules.counterplay?.nonDamageAnswer) tags.push("counterplay:non_damage");
  return uniqueArray(tags);
}

export function buildMonsterAbilityFromGraft(feature = {}, { index = 0 } = {}) {
  const rules = normalizeMonsterGraftRules(feature);
  const rulesValidation = validateMonsterGraftRules(feature);
  const damageEntries = hasBlockingDamageIssue(rulesValidation) ? [] : collectDamageEntries(rules);
  const conditions = buildConditionEntries(rules.condition);
  const resolution = buildResolutionProfile(rules);
  const tags = buildAbilityTags({ rules, damageEntries, conditions, resolution });

  return {
    version: MONSTER_ABILITY_MODEL_VERSION,
    id: cleanString(feature.id) || `ability-${index + 1}`,
    sourceGraftId: cleanString(feature.id) || null,
    title: cleanString(feature.title) || `Ability ${index + 1}`,
    source: cleanString(feature.source),
    slot: cleanString(feature.slot),
    section: rules.section || feature.section || "trait",
    actionEconomy: rules.actionEconomy || "passive",
    usage: rules.usage || { type: "passive" },
    trigger: rules.trigger || null,
    resolution,
    targeting: rules.targeting || null,
    areaEffect: rules.areaEffect || null,
    damage: {
      hasDamage: damageEntries.length > 0,
      entries: damageEntries,
      totalBudgetShare: damageEntries.reduce((sum, entry) => sum + Number(entry.budgetShare || 0), 0),
      damageTypes: uniqueArray(damageEntries.flatMap((entry) => entry.types)),
    },
    conditions,
    counterplay: rules.counterplay || {},
    multiattack: rules.multiattack || null,
    spellcasting: rules.spellcasting || null,
    defense: rules.defense || null,
    summon: rules.summon || null,
    procedure: rules.procedure || null,
    ongoing: rules.ongoing || null,
    references: rules.references || [],
    rules,
    rulesValidation,
    tags,
    migration: {
      source: rules.migration?.source || "unknown",
      isStructured: Boolean(rules.migration?.isStructured),
      abilityModel: MONSTER_ABILITY_MODEL_VERSION,
    },
  };
}

export function buildMonsterAbilitiesFromFeatures(features = []) {
  const abilities = asArray(features).map((feature, index) => buildMonsterAbilityFromGraft(feature, { index }));
  const errors = abilities.flatMap((ability) =>
    ability.rulesValidation.issues
      .filter((issue) => issue.severity === "error")
      .map((issue) => ({ abilityId: ability.id, title: ability.title, ...issue })),
  );
  const warnings = abilities.flatMap((ability) =>
    ability.rulesValidation.issues
      .filter((issue) => issue.severity === "warning")
      .map((issue) => ({ abilityId: ability.id, title: ability.title, ...issue })),
  );

  return {
    version: MONSTER_ABILITY_MODEL_VERSION,
    total: abilities.length,
    abilities,
    bySection: countBy(abilities.map((ability) => ability.section)),
    byActionEconomy: countBy(abilities.map((ability) => ability.actionEconomy)),
    damaging: abilities.filter((ability) => ability.damage.hasDamage).length,
    controlling: abilities.filter((ability) => ability.conditions.length > 0).length,
    structured: abilities.filter((ability) => ability.migration.isStructured).length,
    inferred: abilities.filter((ability) => !ability.migration.isStructured).length,
    tags: uniqueArray(abilities.flatMap((ability) => ability.tags)),
    validation: {
      status: errors.length ? "error" : warnings.length ? "warning" : "pass",
      errors,
      warnings,
    },
  };
}

export function summarizeMonsterAbilities(features = []) {
  const model = buildMonsterAbilitiesFromFeatures(features);
  return {
    version: model.version,
    total: model.total,
    structured: model.structured,
    inferred: model.inferred,
    damaging: model.damaging,
    controlling: model.controlling,
    bySection: model.bySection,
    byActionEconomy: model.byActionEconomy,
    validationStatus: model.validation.status,
    errorCount: model.validation.errors.length,
    warningCount: model.validation.warnings.length,
  };
}
