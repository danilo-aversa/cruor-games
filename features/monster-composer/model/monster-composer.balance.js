import { FEATURE_MECHANIC_OVERRIDES } from "../data/monster-grafts.js";
import {
  getDamageBudgetDefaults,
  getDamageBudgetShare,
  getDamageExpectedTargets,
  getDamageParts,
  getDamageRoundWeight,
  getDamageTotalBudgetShare,
  getRulesFallbackSection,
  normalizeMonsterGraftRules,
} from "./monster-graft-rules.schema.js";
import { asArray, hasSelectedSlot, uniqueArray } from "./monster-composer.selection.js";
import { formatToken } from "./monster-composer.compatibility.js";
import { getFeatureBalanceStat } from "./monster-graft-balance-profile.js";
import {
  buildDmComplexityProfile,
  buildPlayerPressureProfile,
} from "./monster-pressure-complexity.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleCase(value) {
  return String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getBudgetDamageBase(feature, rules) {
  if (!rules.damage || rules.damage.mode === "none") return Math.max(0, getFeatureBalanceStat(feature, "dpr"));
  if (rules.damage.mode === "fixed" && rules.damage.average) return Number(rules.damage.average) || 0;
  const baselineDpr = Math.max(1, getFeatureBalanceStat(feature, "dpr", 1));
  const parts = getDamageParts(rules.damage);
  if (parts.length) {
    return parts.reduce((sum, part) => sum + Math.round(baselineDpr * Math.max(0.25, getDamageBudgetShare(part, rules))), 0);
  }
  if (rules.damage.mode !== "budget") return Math.max(0, getFeatureBalanceStat(feature, "dpr"));
  const budgetShare = getDamageBudgetShare(rules.damage, rules);
  return Math.round(baselineDpr * Math.max(0.25, budgetShare));
}

function getOngoingDamageBase(feature, rules) {
  const ongoingDamage = rules.ongoing?.enabled ? rules.ongoing.damage : null;
  if (!ongoingDamage || ongoingDamage.mode === "none") return 0;
  if (ongoingDamage.mode === "fixed" && ongoingDamage.average) return Number(ongoingDamage.average) || 0;
  if (ongoingDamage.mode !== "budget") return 0;
  const baselineDpr = Math.max(1, getFeatureBalanceStat(feature, "dpr", 1));
  return Math.round(baselineDpr * Math.max(0.15, getDamageBudgetShare(ongoingDamage, rules)));
}

export function getFeatureSection(feature) {
  return normalizeMonsterGraftRules(feature).section || getRulesFallbackSection(feature);
}

export function hasFeatureMechanicOverride(featureOrId) {
  const id = typeof featureOrId === "string" ? featureOrId : featureOrId?.id;
  return Boolean(id && FEATURE_MECHANIC_OVERRIDES[id]);
}

export function getFeatureMechanicProfile(feature) {
  const override = FEATURE_MECHANIC_OVERRIDES[feature.id] || {};
  const rules = normalizeMonsterGraftRules(feature);
  const section = rules.section || getFeatureSection(feature);
  const fallbackUsage =
    rules.usage?.type === "recharge"
      ? { frequency: "recharge", recharge: rules.usage.value }
      : rules.actionEconomy === "reaction"
        ? { frequency: "reaction" }
        : rules.actionEconomy === "lairAction"
          ? { frequency: "lair_action" }
          : rules.actionEconomy === "deathTrigger"
            ? { frequency: "death" }
            : { frequency: "at_will" };

  const damageParts = getDamageParts(rules.damage);
  const primaryDamageEntry = damageParts[0] || rules.damage || {};
  const damageBudgetRoles = damageParts.length
    ? damageParts.map((part) => part.budgetRole).filter((role) => role && role !== "none")
    : rules.damage?.budgetRole && rules.damage.budgetRole !== "none"
      ? [rules.damage.budgetRole]
      : [];
  const ongoingDamageRole = rules.ongoing?.enabled && rules.ongoing.damage?.budgetRole && rules.ongoing.damage.budgetRole !== "none"
    ? rules.ongoing.damage.budgetRole
    : null;
  const allDamageBudgetRoles = ongoingDamageRole ? [...damageBudgetRoles, ongoingDamageRole] : damageBudgetRoles;
  const resolutionType = rules.resolution?.type;

  const inferredMechanicTags = [
    resolutionType === "attackRoll" || resolutionType === "attackRollSavingThrow" ? "attack_roll" : null,
    resolutionType === "savingThrow" || resolutionType === "attackRollSavingThrow" ? "saving_throw" : null,
    rules.secondaryResolution?.type === "savingThrow" ? "secondary_save" : null,
    rules.usage?.type === "recharge" ? "recharge" : null,
    rules.multiattack?.enabled ? "multiattack" : null,
    rules.multiattack?.mode ? `multiattack_${rules.multiattack.mode}` : null,
    rules.multiattack?.replacements?.length ? "multiattack_replacement" : null,
    rules.spellcasting?.enabled ? "spellcasting" : null,
    rules.spellcasting?.ability ? `spellcasting_${rules.spellcasting.ability}` : null,
    rules.defense?.enabled ? "defense_feature" : null,
    rules.defense?.type ? `defense_${rules.defense.type}` : null,
    rules.summon?.enabled ? "summon" : null,
    rules.summon?.type ? `summon_${rules.summon.type}` : null,
    rules.procedure?.enabled ? "procedure" : null,
    rules.procedure?.type ? `procedure_${rules.procedure.type}` : null,
    rules.procedure?.ongoingDamage?.enabled ? "procedure_ongoing_damage" : null,
    rules.actionEconomy === "reaction" ? "reaction" : null,
    rules.condition?.names?.length ? "condition" : null,
    rules.condition?.escape?.enabled ? "escape_dc" : null,
    rules.condition?.repeatSave?.enabled ? "repeat_save" : null,
    rules.ongoing?.enabled ? "ongoing_effect" : null,
    rules.areaEffect?.enabled ? "area_effect" : null,
    rules.areaEffect?.type ? `area_${rules.areaEffect.type}` : null,
    rules.areaEffect?.shape ? `area_shape_${rules.areaEffect.shape}` : null,
    rules.resolution?.abilityBasis ? `ability_${rules.resolution.abilityBasis}` : null,
    ...allDamageBudgetRoles.map((role) => `budget_${role}`),
    ...(rules.condition?.names || []),
    ...(rules.condition?.special || []),
  ].filter(Boolean);
  const inferredPressureTags = [
    rules.targeting?.type === "area" || rules.areaEffect?.enabled ? "area" : null,
    rules.areaEffect?.enabled ? "area_timing" : null,
    ["startsTurnInArea", "endsTurnInArea", "entersArea", "whileInArea"].includes(rules.areaEffect?.timing) ? "area_zone_pressure" : null,
    damageBudgetRoles.some((role) => ["rechargeBurst", "deathBurst"].includes(role)) ||
    primaryDamageEntry.scale === "high" ||
    primaryDamageEntry.scale === "heavy"
      ? "burst"
      : null,
    damageBudgetRoles.includes("rechargeControl") ? "control_burst" : null,
    damageBudgetRoles.includes("reactionPunish") || (rules.actionEconomy === "reaction" && rules.damage) ? "reaction_burst" : null,
    damageBudgetRoles.includes("bonusAction") || rules.multiattack?.enabled ? "action_economy" : null,
    rules.spellcasting?.enabled ? "spellcasting_flexibility" : null,
    (rules.spellcasting?.lists || []).some((list) => /fear|hold|dominate|banish|wall|summon|polymorph/i.test([...(list.spellRefs || []), ...(list.spells || [])].join(" "))) ? "spellcasting_control" : null,
    rules.defense?.enabled ? "defense_stack" : null,
    ["legendaryResistance", "magicResistance", "evasion", "avoidance"].includes(rules.defense?.type) ? "save_defense" : null,
    rules.defense?.type === "magicResistance" ? "anti_spell_defense" : null,
    rules.defense?.type === "regeneration" ? "regeneration" : null,
    rules.defense?.type === "parry" || rules.defense?.type === "defensiveReaction" ? "defensive_reaction" : null,
    rules.summon?.enabled ? "action_economy_expansion" : null,
    rules.summon?.enabled ? "extra_creatures" : null,
    rules.procedure?.enabled ? "special_procedure" : null,
    ["swallow", "engulf", "possession"].includes(rules.procedure?.type) ? "containment_pressure" : null,
    rules.procedure?.ongoingDamage?.enabled ? "procedure_ongoing_pressure" : null,
    ["major", "severe"].includes(rules.condition?.severity) ? "hard_control" : null,
    rules.ongoing?.enabled && rules.ongoing.damage ? "ongoing_pressure" : null,
    rules.areaEffect?.enabled && (rules.damage || rules.condition || rules.ongoing?.enabled) ? "area_effect_pressure" : null,
  ].filter(Boolean);
  const inferredComplexityTags = [
    rules.usage?.type === "recharge" ? "recharge" : null,
    damageBudgetRoles.length ? "damage_budget" : null,
    damageParts.length ? "damage_parts" : null,
    rules.multiattack?.enabled ? "multiattack" : null,
    rules.multiattack?.replacements?.length ? "replacement_choice" : null,
    rules.spellcasting?.enabled ? "spellcasting" : null,
    (rules.spellcasting?.lists || []).length > 1 ? "spell_list_choice" : null,
    rules.defense?.enabled ? "defense_feature" : null,
    rules.defense?.type === "defensiveReaction" || rules.defense?.type === "parry" ? "defensive_reaction" : null,
    rules.defense?.type === "regeneration" ? "regeneration_tracking" : null,
    rules.summon?.enabled ? "summon" : null,
    rules.summon?.enabled ? "board_complexity" : null,
    rules.summon?.duration ? "summon_duration" : null,
    rules.procedure?.enabled ? "procedure" : null,
    rules.procedure?.type ? `procedure_${rules.procedure.type}` : null,
    rules.procedure?.ongoingDamage?.enabled ? "procedure_ongoing_tracking" : null,
    rules.procedure?.escapeCondition ? "procedure_escape" : null,
    rules.procedure?.releaseCondition ? "procedure_release" : null,
    rules.actionEconomy === "reaction" ? "reaction_trigger" : null,
    rules.actionEconomy === "deathTrigger" ? "death_trigger" : null,
    rules.condition?.names?.length ? "condition_tracking" : null,
    rules.condition?.escape?.enabled ? "escape_tracking" : null,
    rules.condition?.repeatSave?.enabled ? "repeat_save" : null,
    rules.counterplay?.breakCondition ? "break_condition" : null,
    rules.condition?.special?.includes("healing-denial") || rules.ongoing?.enabled ? "ongoing_tracking" : null,
    rules.areaEffect?.enabled ? "area_timing" : null,
  ].filter(Boolean);

  return {
    abilityType: override.abilityType || rules.actionEconomy || section,
    mechanicTags: uniqueArray([
      ...asArray(feature.mechanicTags),
      ...asArray(override.mechanicTags),
      ...inferredMechanicTags,
    ]),
    pressureTags: uniqueArray([
      ...asArray(feature.pressureTags),
      ...asArray(override.pressureTags),
      ...inferredPressureTags,
    ]),
    complexityTags: uniqueArray([
      ...asArray(feature.complexityTags),
      ...asArray(override.complexityTags),
      ...inferredComplexityTags,
    ]),
    damageProfile: override.damageProfile ||
      feature.damageProfile || {
        baseDamage: getBudgetDamageBase(feature, rules),
        damageType: primaryDamageEntry?.types?.[0] ? titleCase(primaryDamageEntry.types[0]) : "Variable",
        budgetRole: damageBudgetRoles[0] || "none",
        budgetShare: getDamageTotalBudgetShare(rules.damage, rules),
        budgetDefaults: getDamageBudgetDefaults(damageBudgetRoles[0] || "none"),
        abilityBasis: rules.resolution?.abilityBasis || primaryDamageEntry?.abilityBasis || null,
        expectedTargets: getDamageExpectedTargets(primaryDamageEntry, rules) || (rules.targeting?.type === "area" ? 1.75 : getFeatureBalanceStat(feature, "control") ? 1.25 : 1),
        roundWeight: getDamageRoundWeight(primaryDamageEntry, rules),
        parts: damageParts,
        ongoingDamage: getOngoingDamageBase(feature, rules),
        ongoingTiming: rules.ongoing?.enabled ? rules.ongoing.timing : null,
      },
    usageProfile: override.usageProfile || feature.usageProfile || (rules.multiattack?.enabled
      ? { frequency: "at_will", pattern: "multiattack", count: rules.multiattack.count, mode: rules.multiattack.mode }
      : rules.spellcasting?.enabled
        ? { frequency: rules.usage?.type || "at_will", pattern: "spellcasting", lists: rules.spellcasting.lists?.length || 0 }
        : rules.summon?.enabled
          ? { frequency: rules.usage?.type || "at_will", pattern: "summon", summonType: rules.summon.type, count: rules.summon.count }
          : rules.procedure?.enabled
            ? { frequency: rules.usage?.type || "at_will", pattern: "procedure", procedureType: rules.procedure.type }
            : fallbackUsage),
    conditionProfile: override.conditionProfile ||
      feature.conditionProfile ||
      (rules.condition
        ? {
            severity: titleCase(rules.condition.severity),
            conditions: rules.condition.names || [],
            special: rules.condition.special || [],
            duration: rules.condition.duration || null,
            sizeLimit: rules.condition.sizeLimit || null,
            escape: rules.condition.escape || null,
            repeatSave: rules.condition.repeatSave || null,
          }
        : null),
  };
}

export function countValues(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

export function summarizeMechanicProfiles(profiles) {
  const mechanicTags = profiles.flatMap((profile) => profile.mechanicTags);
  const pressureTags = profiles.flatMap((profile) => profile.pressureTags);
  const complexityTags = profiles.flatMap((profile) => profile.complexityTags);
  const usageProfiles = profiles.map((profile) => profile.usageProfile || {});
  const conditionProfiles = profiles.map((profile) => profile.conditionProfile).filter(Boolean);
  const structuredDamage = profiles.reduce((sum, profile) => {
    const damage = profile.damageProfile || {};
    const weights = Array.isArray(damage.roundWeight) ? damage.roundWeight : [1, 1, 1];
    const averageWeight =
      weights.reduce((total, value) => total + value, 0) / Math.max(1, weights.length);
    return (
      sum +
      Math.max(0, damage.baseDamage || 0) * Math.max(1, damage.expectedTargets || 1) * averageWeight +
      Math.max(0, damage.ongoingDamage || 0)
    );
  }, 0);

  return {
    mechanicTags: countValues(mechanicTags),
    pressureTags: countValues(pressureTags),
    complexityTags: countValues(complexityTags),
    rechargeCount: usageProfiles.filter((profile) => profile.frequency === "recharge").length,
    reactionCount: usageProfiles.filter((profile) => profile.frequency === "reaction").length,
    deathEffectCount: usageProfiles.filter((profile) => profile.frequency === "death").length,
    conditionCount: conditionProfiles.length,
    majorConditionCount: conditionProfiles.filter((profile) =>
      ["Major", "Severe"].includes(profile.severity)
    ).length,
    structuredDamage: Math.round(structuredDamage),
  };
}

export function topMechanicTags(counts, limit = 6) {
  return Object.entries(counts || {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag, count]) => `${formatToken(tag)} ×${count}`);
}

export const PRESSURE_LABELS = {
  coreRoutine: "Core Routine",
  playerResponses: "Player Responses",
  control: "Control",
  spatial: "Spatial Demands",
  tempo: "Tempo",
  persistence: "Persistence",
  interactions: "Interactions",
  graftWeight: "Graft Weight",
};

export const COMPLEXITY_LABELS = {
  decisions: "Decision Load",
  triggers: "Trigger Load",
  state: "State Tracking",
  board: "Board Tracking",
  branching: "Branching",
  systems: "Special Systems",
  graftWeight: "Graft Weight",
};

export function buildPressureProfile({
  targetCr = 0,
  limit = null,
  budget = null,
  abilityModel = {},
  attackRoutine = null,
  selectedFeatures = [],
} = {}) {
  return buildPlayerPressureProfile({
    targetCr,
    limit: limit ?? budget,
    abilityModel,
    attackRoutine,
    selectedFeatures,
  });
}

/**
 * Retained as a compatibility boundary for older callers. Pressure v3 describes
 * player-facing tactical load, so CR/DPR/HP validation must never raise it.
 */
export function applyPressureValidationFloor({ pressureProfile } = {}) {
  return pressureProfile;
}

export function buildComplexityProfile({
  limit = 6,
  abilityModel = {},
  attackRoutine = null,
  selectedFeatures = [],
} = {}) {
  return buildDmComplexityProfile({
    limit,
    abilityModel,
    attackRoutine,
    selectedFeatures,
  });
}

export function formatBreakdownCompact(profile, labelMap) {
  return Object.entries(profile.breakdown || {})
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => `${labelMap[key] || titleCase(key)} ${value > 0 ? "+" : ""}${value}`)
    .join("; ");
}

const COUNTERPLAY_TERMS = {
  telegraph: [
    "visible",
    "before",
    "obvious",
    "telegraph",
    "see",
    "shines",
    "creaks",
    "bulges",
    "distends",
    "leaks",
    "audible",
    "readable",
    "warning",
    "notices",
    "reveals",
  ],
  breakCondition: [
    "save",
    "escape",
    "destroyed",
    "burned",
    "clean",
    "cleaned",
    "ends",
    "end the effect",
    "until",
    "action",
    "medicine",
    "healing",
    "removed",
    "short rest",
    "long rest",
  ],
  nonDamageAnswer: [
    "fire",
    "radiant",
    "holy",
    "salt",
    "rite",
    "name",
    "true name",
    "bait",
    "corpse",
    "distance",
    "range",
    "cover",
    "light",
    "bright light",
    "burn",
    "destroy",
    "avoid",
    "move",
    "forced movement",
    "medicine",
    "healing",
    "clean",
    "antitoxin",
    "scouting",
    "watch",
    "formation",
    "readied",
  ],
  positioning: [
    "distance",
    "range",
    "cover",
    "spacing",
    "formation",
    "avoid",
    "move",
    "position",
    "lane",
    "path",
    "surface",
    "terrain",
    "wall",
    "ceiling",
    "light",
  ],
  prep: [
    "prepared",
    "bait",
    "holy water",
    "salt",
    "rite",
    "investigation",
    "scouting",
    "watch",
    "records",
    "offering",
    "antitoxin",
    "cleansing",
    "consecrated",
  ],
};

function textHasAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

export function getFeatureCounterplayProfile(feature) {
  const mechanicProfile = getFeatureMechanicProfile(feature);
  const text =
    `${feature.summary || ""} ${feature.mechanics || ""} ${feature.counterplay || ""}`.toLowerCase();
  const counterplayText = String(feature.counterplay || "").trim();
  const control = Math.max(0, getFeatureBalanceStat(feature, "control"));
  const dpr = Math.max(0, getFeatureBalanceStat(feature, "dpr"));
  const majorCondition = ["Major", "Severe"].includes(mechanicProfile.conditionProfile?.severity);
  const hardControl =
    control >= 2 ||
    majorCondition ||
    mechanicProfile.mechanicTags.some((tag) =>
      ["restrained", "grapple", "condition", "exhaustion", "healing_denial"].includes(tag)
    );
  const burst =
    dpr >= 6 ||
    mechanicProfile.pressureTags.some((tag) =>
      ["burst", "death_burst", "reaction_burst"].includes(tag)
    );
  const agencyTags = uniqueArray([
    textHasAny(text, COUNTERPLAY_TERMS.telegraph) ? "telegraph" : null,
    textHasAny(text, COUNTERPLAY_TERMS.breakCondition) ? "break_condition" : null,
    textHasAny(text, COUNTERPLAY_TERMS.nonDamageAnswer) ? "non_damage_answer" : null,
    textHasAny(text, COUNTERPLAY_TERMS.positioning) ? "positioning_answer" : null,
    textHasAny(text, COUNTERPLAY_TERMS.prep) ? "prep_answer" : null,
    feature.slot === "weakness" ? "explicit_weakness" : null,
    getFeatureBalanceStat(feature, "fairness") ? "fairness_graft" : null,
  ]);

  return {
    id: feature.id,
    title: feature.title,
    slot: feature.slot,
    section: getFeatureSection(feature),
    isOppressive: hardControl || burst || feature.cost >= 5,
    hardControl,
    burst,
    hasCounterplayText: counterplayText.length >= 24,
    hasTelegraph: agencyTags.includes("telegraph"),
    hasBreakCondition: agencyTags.includes("break_condition") || feature.slot === "weakness",
    hasNonDamageAnswer: agencyTags.includes("non_damage_answer") || feature.slot === "weakness",
    agencyTags,
    mechanicTags: mechanicProfile.mechanicTags,
    risk: hardControl ? "Control" : burst ? "Burst" : feature.cost >= 5 ? "High Cost" : "Routine",
  };
}

function summarizeCounterplayProfiles(profiles) {
  const oppressive = profiles.filter((profile) => profile.isOppressive);
  return {
    total: profiles.length,
    oppressiveCount: oppressive.length,
    withCounterplayText: profiles.filter((profile) => profile.hasCounterplayText).length,
    telegraphedCount: profiles.filter((profile) => profile.hasTelegraph).length,
    breakConditionCount: profiles.filter((profile) => profile.hasBreakCondition).length,
    nonDamageAnswerCount: profiles.filter((profile) => profile.hasNonDamageAnswer).length,
    hardControlCount: profiles.filter((profile) => profile.hardControl).length,
    burstCount: profiles.filter((profile) => profile.burst).length,
    agencyTags: countValues(profiles.flatMap((profile) => profile.agencyTags)),
    untelegraphedOppressive: oppressive.filter((profile) => !profile.hasTelegraph),
    unresolvedOppressive: oppressive.filter(
      (profile) => !profile.hasBreakCondition && !profile.hasNonDamageAnswer
    ),
  };
}

export function buildCounterplayAudit({
  selected,
  roleId,
  monsterTier,
  pressureProfile,
  complexityProfile,
  mechanicsSummary,
  counterplayProfiles,
}) {
  const summary = summarizeCounterplayProfiles(counterplayProfiles);
  const issues = [];
  const recommendations = [];
  const hasWeakness = hasSelectedSlot(selected, "weakness");
  const hasLair = hasSelectedSlot(selected, "lair");
  const hasDeath = hasSelectedSlot(selected, "death");

  if (!hasWeakness) {
    issues.push({
      severity: "critical",
      label: "Missing Weakness / Tell",
      detail:
        "Add at least one explicit player-facing answer before using this as a horror monster.",
    });
    recommendations.push(
      "Add a Weakness / Tell graft with a visible trigger or non-damage solution."
    );
  }

  if (summary.unresolvedOppressive.length) {
    issues.push({
      severity: "major",
      label: "Oppressive Grafts Need Answers",
      detail: summary.unresolvedOppressive.map((profile) => profile.title).join(", "),
    });
    recommendations.push(
      "Give high-pressure grafts a break condition, destroyable object, repeat save, positioning answer, or preparation answer."
    );
  }

  if (summary.untelegraphedOppressive.length >= 2) {
    issues.push({
      severity: "major",
      label: "Too Many Untelegraphed Threats",
      detail: summary.untelegraphedOppressive.map((profile) => profile.title).join(", "),
    });
    recommendations.push(
      "Add visual, audio, timing, or behavior tells before the most punishing abilities resolve."
    );
  }

  if (
    mechanicsSummary.majorConditionCount >= 2 &&
    summary.breakConditionCount < mechanicsSummary.majorConditionCount
  ) {
    issues.push({
      severity: "major",
      label: "Hard Conditions Need Release Valves",
      detail: "Major conditions outnumber clear break conditions.",
    });
    recommendations.push(
      "Prefer repeat saves, escape checks, destroyed anchors, visible setup, or one-round durations for hard control."
    );
  }

  if (mechanicsSummary.deathEffectCount && !hasDeath) {
    issues.push({
      severity: "minor",
      label: "Implicit Death Pressure",
      detail: "Structured mechanics imply death pressure, but no Death Effect slot is occupied.",
    });
  }

  if (pressureProfile.label === "Critical" && summary.nonDamageAnswerCount < 2) {
    issues.push({
      severity: "critical",
      label: "Critical Pressure Needs Non-Damage Answers",
      detail: "The build is highly pressuring but has few non-damage answers.",
    });
    recommendations.push(
      "Add answers such as fire, radiant damage, distance, cover, bait, rites, medicine, object destruction, or light management."
    );
  }

  if (["boss", "legendary", "setpiece"].includes(monsterTier.id) && !hasLair && roleId === "boss") {
    issues.push({
      severity: "minor",
      label: "Boss Has No Scene Counterplay",
      detail:
        "A boss can work without lair rules, but scene-level interaction would make counterplay clearer.",
    });
  }

  const score = clamp(
    40 +
      (hasWeakness ? 20 : 0) +
      Math.min(18, summary.nonDamageAnswerCount * 6) +
      Math.min(16, summary.telegraphedCount * 4) +
      Math.min(16, summary.breakConditionCount * 4) -
      issues.filter((issue) => issue.severity === "critical").length * 22 -
      issues.filter((issue) => issue.severity === "major").length * 12 -
      issues.filter((issue) => issue.severity === "minor").length * 5,
    0,
    100
  );

  return {
    score,
    rating:
      score >= 82 ? "Strong" : score >= 64 ? "Playable" : score >= 45 ? "Needs Work" : "Unsafe",
    summary,
    issues,
    recommendations: uniqueArray(recommendations),
    agencyTags: summary.agencyTags,
  };
}

export function formatCounterplayIssues(issues) {
  if (!issues.length) return "No major counterplay issues.";
  return issues.map((issue) => `${issue.label}: ${issue.detail}`).join("; ");
}

export function getFeaturePressureWeight(feature) {
  const mechanicProfile = getFeatureMechanicProfile(feature);
  const counterplayProfile = getFeatureCounterplayProfile(feature);
  const authoredAbilities = asArray(feature.abilities);
  const routine = feature.routine || {};
  const multiattack = routine.multiattack || {};
  const actionOptions = authoredAbilities.filter((ability) =>
    ["action", "bonusAction", "reaction", "legendaryAction", "lairAction", "deathTrigger"].includes(
      String(ability.rules?.actionEconomy || ability.section || ""),
    )
  ).length;
  return (
    Math.max(1, actionOptions || authoredAbilities.length || 1) * 1.2 +
    (multiattack.enabled ? 1 : 0) +
    (multiattack.mode === "choice" ? 1 : 0) +
    asArray(multiattack.replacements).length * 0.7 +
    mechanicProfile.pressureTags.length * 0.35 +
    (counterplayProfile.hardControl ? 1.5 : 0) +
    (feature.slot === "lair" || feature.slot === "death" ? 0.6 : 0)
  );
}

export function getFeatureComplexityWeight(feature) {
  const mechanicProfile = getFeatureMechanicProfile(feature);
  const profile = feature.complexityProfile || {};
  const authoredLoad =
    Number(profile.decisionLoad ?? profile.decision ?? 0) +
    Number(profile.sequencing || 0) +
    Number(profile.conditionalBranches ?? profile.branches ?? 0) +
    Number(profile.tracking || 0);
  return (
    Math.max(0, authoredLoad) +
    Math.max(0, Number(feature.complexity || 0)) +
    mechanicProfile.complexityTags.length * 0.6 +
    (mechanicProfile.usageProfile?.frequency === "reaction" ? 1.5 : 0) +
    (mechanicProfile.usageProfile?.frequency === "recharge" ? 1 : 0) +
    (mechanicProfile.conditionProfile ? 0.75 : 0)
  );
}

export function getTopFeatureByWeight(features, weightFn) {
  return (
    [...features].sort(
      (a, b) => weightFn(b) - weightFn(a) || b.cost - a.cost || a.title.localeCompare(b.title)
    )[0] || null
  );
}
