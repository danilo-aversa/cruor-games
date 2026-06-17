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

function tagCount(counts, tag) {
  return Number(counts?.[tag] || 0);
}

function roundBreakdown(breakdown) {
  return Object.fromEntries(
    Object.entries(breakdown).map(([key, value]) => [key, Math.round(value)])
  );
}

function sumBreakdown(breakdown) {
  return Object.values(breakdown).reduce((sum, value) => sum + value, 0);
}

function buildProfileSources(breakdown, labelMap, limit = 4) {
  return Object.entries(breakdown)
    .filter(([, value]) => Math.abs(value) > 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, limit)
    .map(([key, value]) => `${labelMap[key] || titleCase(key)} ${value > 0 ? "+" : ""}${value}`);
}

function profileBand(score, limit) {
  if (score <= limit * 0.55) return "Low";
  if (score <= limit * 0.85) return "Moderate";
  if (score <= limit) return "High";
  if (score <= limit * 1.25) return "Over Target";
  return "Critical";
}

export const PRESSURE_LABELS = {
  base: "Base Grafts",
  offense: "Offense",
  area: "Area",
  control: "Control",
  tempo: "Tempo",
  defense: "Defense",
  sustain: "Sustain",
  validation: "Validation",
  other: "Other",
};

export const COMPLEXITY_LABELS = {
  base: "Base Grafts",
  actions: "Actions",
  timing: "Timing",
  conditions: "Conditions",
  environment: "Environment",
  other: "Other",
};

export function buildPressureProfile({
  cost,
  monsterTier,
  tempoProfile,
  statMods,
  mechanicsSummary,
  budget,
}) {
  const pressureTags = mechanicsSummary.pressureTags || {};
  const positiveCost = Math.max(0, cost);
  const fairnessRelief = Math.max(0, statMods.fairness || 0);
  const offensePressure =
    Math.max(0, statMods.dpr || 0) * 0.2 +
    tagCount(pressureTags, "single_target") * 0.5 +
    tagCount(pressureTags, "reaction_burst") * 1.1 +
    tagCount(pressureTags, "burst") * 1.4;
  const areaPressure = tagCount(pressureTags, "area") * 1 + tagCount(pressureTags, "death_burst") * 0.6;
  const controlPressure =
    Math.max(0, statMods.control || 0) * 0.45 +
    tagCount(pressureTags, "control") * 0.9 +
    tagCount(pressureTags, "ranged_lockdown") * 1 +
    tagCount(pressureTags, "single_target_lockdown") * 1 +
    tagCount(pressureTags, "control_synergy") * 0.4;
  const tempoPressure =
    monsterTier.pressureMod * 0.55 +
    tempoProfile.pressureMod * 0.7 +
    tagCount(pressureTags, "tempo") * 1 +
    tagCount(pressureTags, "action_economy") * 1.1 +
    tagCount(pressureTags, "retaliation") * 0.8;
  const defensePressure =
    Math.max(0, statMods.hp || 0) / 28 +
    Math.max(0, statMods.ac || 0) * 0.85 +
    tagCount(pressureTags, "defense_stack") * 0.8 +
    tagCount(pressureTags, "save_defense") * 1.1 +
    tagCount(pressureTags, "anti_spell_defense") * 0.7 +
    tagCount(pressureTags, "defensive_reaction") * 0.8;
  const sustainPressure =
    tagCount(pressureTags, "sustain") * 0.8 +
    tagCount(pressureTags, "regeneration") * 1.2 +
    tagCount(pressureTags, "escalation") * 1 +
    tagCount(pressureTags, "campaign_pressure") * 0.5;
  const positiveSubtotal =
    positiveCost * 0.35 + offensePressure + areaPressure + controlPressure + tempoPressure + defensePressure + sustainPressure;
  const fairnessCredit = Math.min(fairnessRelief * 0.85, 3, positiveSubtotal * 0.35);
  const breakdown = roundBreakdown({
    base: positiveCost * 0.35,
    offense: offensePressure,
    area: areaPressure,
    control: controlPressure,
    tempo: tempoPressure,
    defense: defensePressure,
    sustain: sustainPressure,
    other: Math.max(0, statMods.mobility || 0) * 0.35 - fairnessCredit,
  });
  const score = Math.max(0, Math.round(sumBreakdown(breakdown)));
  return {
    score,
    label: profileBand(score, budget),
    breakdown,
    sources: buildProfileSources(breakdown, PRESSURE_LABELS),
  };
}

function pressureFloorScore({
  pressureProfile,
  budget,
  targetCr,
  baseline,
  printedStats,
  effectiveProfile,
  crValidation,
}) {
  const limit = Math.max(1, Number(budget || 1));
  const target = Math.max(0, Number(targetCr || 0));
  const estimatedCr = Number(crValidation?.estimatedCr ?? target);
  const offensiveCr = Number(crValidation?.offensive?.cr ?? target);
  const defensiveCr = Number(crValidation?.defensive?.cr ?? target);
  const crDelta = estimatedCr - target;
  const offensiveDelta = offensiveCr - target;
  const defensiveDelta = defensiveCr - target;
  const baselineDpr = Math.max(1, Number(baseline?.dpr || 1));
  const baselineHp = Math.max(1, Number(baseline?.hp || 1));
  const printedDprRatio = Number(printedStats?.dpr || 0) / baselineDpr;
  const effectiveDprRatio = Number(effectiveProfile?.effectiveDpr3Round || 0) / baselineDpr;
  const burstRatio = Number(effectiveProfile?.burstDpr || 0) / baselineDpr;
  const effectiveHpRatio = Number(effectiveProfile?.effectiveHp || 0) / baselineHp;
  const conditionAdjustment = Number(effectiveProfile?.conditionProfile?.crAdjustment || 0);
  let floor = 0;

  if (crDelta >= 2) floor = Math.max(floor, Math.ceil(limit * 0.62));
  if (crDelta >= 3 || offensiveDelta >= 4 || defensiveDelta >= 4) floor = Math.max(floor, Math.ceil(limit * 0.86));
  if (crDelta >= 5 || offensiveDelta >= 6 || burstRatio >= 3) floor = Math.max(floor, limit + 1);
  if (printedDprRatio >= 1.35 || effectiveDprRatio >= 1.35) floor = Math.max(floor, Math.ceil(limit * 0.62));
  if (burstRatio >= 1.75) floor = Math.max(floor, Math.ceil(limit * 0.62));
  if (effectiveHpRatio >= 1.35) floor = Math.max(floor, Math.ceil(limit * 0.62));
  if (conditionAdjustment >= 1) floor = Math.max(floor, Math.ceil(limit * 0.62));

  return Math.max(Number(pressureProfile?.score || 0), floor);
}

export function applyPressureValidationFloor({
  pressureProfile,
  budget,
  targetCr,
  baseline,
  printedStats,
  effectiveProfile,
  crValidation,
}) {
  if (!pressureProfile) return pressureProfile;
  const currentScore = Math.max(0, Number(pressureProfile.score || 0));
  const flooredScore = pressureFloorScore({
    pressureProfile,
    budget,
    targetCr,
    baseline,
    printedStats,
    effectiveProfile,
    crValidation,
  });
  if (flooredScore <= currentScore) {
    return {
      ...pressureProfile,
      label: profileBand(currentScore, budget),
      sources: buildProfileSources(pressureProfile.breakdown || {}, PRESSURE_LABELS),
    };
  }

  const validationDelta = Math.round(flooredScore - currentScore);
  const breakdown = roundBreakdown({
    ...(pressureProfile.breakdown || {}),
    validation: Number(pressureProfile.breakdown?.validation || 0) + validationDelta,
  });
  const score = Math.max(0, Math.round(sumBreakdown(breakdown)));
  return {
    ...pressureProfile,
    score,
    label: profileBand(score, budget),
    breakdown,
    sources: buildProfileSources(breakdown, PRESSURE_LABELS),
    floor: {
      applied: true,
      from: currentScore,
      to: score,
      reason: "CR/DPR/Burst validation floor",
    },
  };
}

export function buildComplexityProfile({ complexity, mechanicsSummary, featureMechanics, limit }) {
  const complexityTags = mechanicsSummary.complexityTags || {};
  const uniqueTagCount = Object.keys(complexityTags).length;
  const breakdown = roundBreakdown({
    base: Math.max(0, complexity) * 0.35,
    actions:
      mechanicsSummary.rechargeCount * 0.55 +
      mechanicsSummary.reactionCount * 0.7 +
      mechanicsSummary.deathEffectCount * 0.35 +
      tagCount(complexityTags, "action_cost") * 0.6 +
      tagCount(complexityTags, "summon_tracking") * 0.8,
    timing:
      tagCount(complexityTags, "recharge") * 0.45 +
      tagCount(complexityTags, "reaction_trigger") * 0.65 +
      tagCount(complexityTags, "defensive_reaction") * 0.55 +
      tagCount(complexityTags, "regeneration_tracking") * 0.55 +
      tagCount(complexityTags, "random_trigger") * 0.55 +
      tagCount(complexityTags, "death_trigger") * 0.35 +
      tagCount(complexityTags, "round_tracking") * 0.75 +
      tagCount(complexityTags, "delayed_tracking") * 0.7,
    conditions:
      mechanicsSummary.conditionCount * 0.35 +
      mechanicsSummary.majorConditionCount * 0.55 +
      tagCount(complexityTags, "condition_tracking") * 0.5 +
      tagCount(complexityTags, "repeat_save") * 0.65 +
      tagCount(complexityTags, "ongoing_tracking") * 0.65 +
      tagCount(complexityTags, "escape_check") * 0.55,
    environment:
      tagCount(complexityTags, "object_hp") * 0.65 +
      tagCount(complexityTags, "object_tracking") * 0.65 +
      tagCount(complexityTags, "corpse_anchor") * 0.55 +
      tagCount(complexityTags, "corpse_tracking") * 0.55 +
      tagCount(complexityTags, "terrain_anchor") * 0.45 +
      tagCount(complexityTags, "cleanup_action") * 0.55,
    other: Math.max(0, uniqueTagCount - featureMechanics.length) * 0.2,
  });
  const score = Math.max(0, Math.round(sumBreakdown(breakdown)));
  return {
    score,
    label: profileBand(score, limit),
    breakdown,
    sources: buildProfileSources(breakdown, COMPLEXITY_LABELS),
  };
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
  const counterplayProfile = getFeatureCounterplayProfile(feature);
  return (
    Math.max(0, feature.cost) * 2 +
    feature.complexity +
    Math.max(0, getFeatureBalanceStat(feature, "dpr")) +
    Math.max(0, getFeatureBalanceStat(feature, "control")) * 1.5 +
    (counterplayProfile.burst ? 3 : 0) +
    (counterplayProfile.hardControl ? 3 : 0)
  );
}

export function getFeatureComplexityWeight(feature) {
  const mechanicProfile = getFeatureMechanicProfile(feature);
  return (
    feature.complexity * 2 +
    mechanicProfile.complexityTags.length +
    (mechanicProfile.usageProfile?.frequency === "reaction" ? 2 : 0) +
    (mechanicProfile.usageProfile?.frequency === "recharge" ? 1 : 0) +
    (mechanicProfile.conditionProfile ? 1 : 0)
  );
}

export function getTopFeatureByWeight(features, weightFn) {
  return (
    [...features].sort(
      (a, b) => weightFn(b) - weightFn(a) || b.cost - a.cost || a.title.localeCompare(b.title)
    )[0] || null
  );
}
