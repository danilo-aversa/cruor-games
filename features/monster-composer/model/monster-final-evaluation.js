import { projectMonsterAbilityModelForCr } from "./monster-attack-pattern-progression.js";
import {
  buildDmComplexityProfile,
  buildPlayerPressureProfile,
} from "./monster-pressure-complexity.js";
export const MONSTER_FINAL_EVALUATION_VERSION = "monster-final-evaluation-v3.0-pressure-complexity";
export const MONSTER_FINAL_EVALUATION_SCALE = Object.freeze({ min: 0, max: 10 });

const SPIKE_LABELS_V2 = Object.freeze({
  burstRatio: "Burst Ratio",
  openingBurst: "Opening Burst",
  volatileSources: "Volatile Sources",
  hardControl: "Hard Control",
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundTo(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function safeRatio(value, baseline, fallback = 0) {
  const denominator = Number(baseline || 0);
  if (!Number.isFinite(denominator) || denominator <= 0) return fallback;
  const numerator = Number(value || 0);
  if (!Number.isFinite(numerator)) return fallback;
  return numerator / denominator;
}

function scoreLabel(score) {
  const value = Number(score || 0);
  if (value < 2) return "Low";
  if (value < 4) return "Moderate";
  if (value < 6) return "High";
  if (value < 8) return "Severe";
  return "Critical";
}

function counterplayLabel(score) {
  const value = Number(score || 0);
  if (value < 2) return "Unsafe";
  if (value < 4) return "Weak";
  if (value < 6) return "Playable";
  if (value < 8) return "Strong";
  return "Excellent";
}

function buildMeasure(score, breakdown, labels) {
  const roundedBreakdown = Object.fromEntries(
    Object.entries(breakdown || {}).map(([key, value]) => [key, roundTo(value)]),
  );
  const total = clamp(roundTo(score), MONSTER_FINAL_EVALUATION_SCALE.min, MONSTER_FINAL_EVALUATION_SCALE.max);
  return {
    score: total,
    label: scoreLabel(total),
    scale: { ...MONSTER_FINAL_EVALUATION_SCALE },
    breakdown: roundedBreakdown,
    sources: Object.entries(roundedBreakdown)
      .filter(([, value]) => Number(value || 0) !== 0)
      .map(([key, value]) => ({ key, label: labels[key] || key, value })),
  };
}

function getAbilityList(abilityModel = {}) {
  return asArray(abilityModel?.abilities);
}

function countAbilitiesBy(abilities, predicate) {
  return abilities.filter(predicate).length;
}

function getActionEconomy(ability = {}) {
  return cleanString(ability.actionEconomy || ability.rules?.actionEconomy || ability.section || "passive");
}

function getUsageType(ability = {}) {
  return cleanString(ability.usage?.type || ability.rules?.usage?.type || "passive");
}

function buildPressureMeasure({
  targetCr = 0,
  pressureLimit = 10,
  abilityModel = {},
  attackRoutine = null,
  selectedFeatures = [],
} = {}) {
  return buildPlayerPressureProfile({
    targetCr,
    limit: pressureLimit,
    abilityModel,
    attackRoutine,
    selectedFeatures,
  });
}

function buildComplexityMeasure({
  complexityCap = 6,
  abilityModel = {},
  attackRoutine = null,
  selectedFeatures = [],
} = {}) {
  return buildDmComplexityProfile({
    limit: complexityCap,
    abilityModel,
    attackRoutine,
    selectedFeatures,
  });
}

function buildCounterplayMeasure({ counterplayAudit = {}, abilityModel = {}, selectedFeatures = [] } = {}) {
  if (Number.isFinite(Number(counterplayAudit?.score))) {
    const score = clamp(Number(counterplayAudit.score) / 10, 0, 10);
    return {
      score: roundTo(score),
      label: counterplayLabel(score),
      scale: { ...MONSTER_FINAL_EVALUATION_SCALE },
      source: "counterplay-audit",
      auditRating: counterplayAudit.rating || null,
      issues: asArray(counterplayAudit.issues),
    };
  }

  const abilities = getAbilityList(abilityModel);
  const explicitWeakness = asArray(selectedFeatures).some((feature) => feature.slot === "weakness");
  const counters = abilities.flatMap((ability) => {
    const counterplay = ability.counterplay || {};
    return [
      counterplay.telegraph ? "telegraph" : null,
      counterplay.breakCondition ? "breakCondition" : null,
      counterplay.positioningAnswer ? "positioningAnswer" : null,
      counterplay.nonDamageAnswer ? "nonDamageAnswer" : null,
    ].filter(Boolean);
  });
  const uniqueCounters = new Set(counters);
  const score = clamp(2 + (explicitWeakness ? 2 : 0) + uniqueCounters.size * 1.2, 0, 10);
  return {
    score: roundTo(score),
    label: counterplayLabel(score),
    scale: { ...MONSTER_FINAL_EVALUATION_SCALE },
    source: "structured-counterplay-fallback",
    explicitWeakness,
    answerTypes: [...uniqueCounters],
  };
}

function buildSpikeRiskMeasure({ targetCr = 0, baseline = {}, dprProfile = {}, effectiveProfile = {}, abilityModel = {} } = {}) {
  const abilities = getAbilityList(abilityModel);
  const baselineDpr = Math.max(1, Number(baseline?.dpr || dprProfile?.averageDpr || 1));
  const effectiveDpr = Number(effectiveProfile?.effectiveDpr3Round ?? dprProfile?.effectiveDpr3Round ?? dprProfile?.averageDpr ?? baselineDpr);
  const burstDpr = Number(effectiveProfile?.burstDpr ?? dprProfile?.burstDpr ?? effectiveDpr);
  const sustainedDpr = Number(effectiveProfile?.sustainedDpr ?? dprProfile?.sustainedDpr ?? effectiveDpr);
  const openingBurstDelta = Number(dprProfile?.openingBurstDelta ?? Math.max(0, Number(dprProfile?.rounds?.round1 || 0) - effectiveDpr));
  const burstToSustained = safeRatio(burstDpr, sustainedDpr, 1);
  const burstToBaseline = safeRatio(burstDpr, baselineDpr, 1);
  const rechargeCount = countAbilitiesBy(abilities, (ability) => getUsageType(ability) === "recharge");
  const reactionCount = countAbilitiesBy(abilities, (ability) => getActionEconomy(ability) === "reaction" && ability.damage?.hasDamage);
  const deathCount = countAbilitiesBy(abilities, (ability) => getActionEconomy(ability) === "deathTrigger" && ability.damage?.hasDamage);
  const conditionProfile = effectiveProfile?.conditionProfile || {};
  const hardControlCount = Number(conditionProfile.repeatedHardControlCount || 0) + Number(conditionProfile.severeCount || 0);
  const lowCrMultiplier = Number(targetCr || 0) <= 3 ? 1 : 0.45;
  const breakdown = {
    burstRatio: clamp(Math.max(0, burstToSustained - 1) * 2.3 + Math.max(0, burstToBaseline - 1.25) * 1.15, 0, 4.5),
    openingBurst: clamp(safeRatio(openingBurstDelta, baselineDpr, 0) * 2.1, 0, 2),
    volatileSources: clamp(rechargeCount * 0.35 + reactionCount * 0.4 + deathCount * 0.55, 0, 1.8),
    hardControl: clamp(hardControlCount * 0.65 * lowCrMultiplier, 0, 1.7),
  };
  const score = Object.values(breakdown).reduce((sum, value) => sum + Number(value || 0), 0);
  const measure = buildMeasure(score, breakdown, SPIKE_LABELS_V2);
  return {
    ...measure,
    inputs: {
      burstToSustained: roundTo(burstToSustained),
      burstToBaseline: roundTo(burstToBaseline),
      openingBurstDelta: roundTo(openingBurstDelta),
      rechargeCount,
      reactionCount,
      deathCount,
      hardControlCount,
    },
  };
}

function buildBudgetMeasure({ buildBudget = null, buildCost = null } = {}) {
  const limit = Number.isFinite(Number(buildBudget)) ? Number(buildBudget) : null;
  const used = Number.isFinite(Number(buildCost)) ? Number(buildCost) : null;
  return {
    unit: "build-points",
    limit,
    used,
    remaining: limit == null || used == null ? null : roundTo(limit - used),
    utilization: limit == null || used == null || limit <= 0 ? null : roundTo(used / limit),
    independentFromPressure: true,
  };
}

export function buildFinalMonsterEvaluation({
  targetCr = 0,
  baseline = {},
  dprProfile = {},
  effectiveProfile = {},
  abilityModel = {},
  attackRoutine = null,
  counterplayAudit = {},
  selectedFeatures = [],
  buildBudget = null,
  buildCost = null,
  pressureLimit = null,
  complexityCap = null,
} = {}) {
  const projectedAbilityModel = projectMonsterAbilityModelForCr(abilityModel, targetCr);
  const pressure = buildPressureMeasure({
    targetCr,
    pressureLimit: Number.isFinite(Number(pressureLimit)) ? Number(pressureLimit) : 10,
    abilityModel: projectedAbilityModel,
    attackRoutine,
    selectedFeatures,
  });
  const complexity = buildComplexityMeasure({
    complexityCap: Number.isFinite(Number(complexityCap)) ? Number(complexityCap) : 6,
    abilityModel: projectedAbilityModel,
    attackRoutine,
    selectedFeatures,
  });
  const counterplay = buildCounterplayMeasure({ counterplayAudit, abilityModel: projectedAbilityModel, selectedFeatures });
  const spikeRisk = buildSpikeRiskMeasure({ targetCr, baseline, dprProfile, effectiveProfile, abilityModel: projectedAbilityModel });
  const budget = buildBudgetMeasure({ buildBudget, buildCost });

  return {
    version: MONSTER_FINAL_EVALUATION_VERSION,
    status: "final-compiled-monster",
    scale: { ...MONSTER_FINAL_EVALUATION_SCALE },
    buildBudget: budget,
    pressure,
    complexity,
    counterplay,
    spikeRisk,
    invariants: {
      pressureUsesFinalCompiledOutput: true,
      pressureMeasuresPlayerLoadNotPower: true,
      pressureCapacityScalesWithCr: true,
      complexityUsesFlattenedAbilityModel: true,
      complexityMeasuresDmLoad: true,
      repertoireUsesCrProjection: true,
      buildBudgetIsNotPressure: true,
      counterplayDoesNotReducePressure: true,
      spikeRiskIsNotAveragePressure: true,
    },
  };
}

export function projectFinalEvaluationToLegacyProfiles({
  evaluation,
  pressureProfile = null,
  complexityProfile = null,
  pressureBudget = null,
  complexityCap = null,
  preserveVisibleScores = true,
} = {}) {
  if (!evaluation) return { pressureProfile, complexityProfile };
  const projectedPressureScore = Number(evaluation.pressure?.score || 0);
  const projectedComplexityScore = Number(evaluation.complexity?.score || 0);

  return {
    pressureProfile: {
      ...(pressureProfile || {}),
      score: preserveVisibleScores && pressureProfile ? pressureProfile.score : projectedPressureScore,
      label: preserveVisibleScores && pressureProfile ? pressureProfile.label : evaluation.pressure?.label,
      v3: evaluation.pressure,
      v2: evaluation.pressure,
      finalEvaluationVersion: evaluation.version,
      legacyProjection: {
        score: projectedPressureScore,
        budget: Number.isFinite(Number(pressureBudget)) ? Number(pressureBudget) : null,
      },
    },
    complexityProfile: {
      ...(complexityProfile || {}),
      score: preserveVisibleScores && complexityProfile ? complexityProfile.score : projectedComplexityScore,
      label: preserveVisibleScores && complexityProfile ? complexityProfile.label : evaluation.complexity?.label,
      v3: evaluation.complexity,
      v2: evaluation.complexity,
      finalEvaluationVersion: evaluation.version,
      legacyProjection: {
        score: projectedComplexityScore,
        cap: Number.isFinite(Number(complexityCap)) ? Number(complexityCap) : null,
      },
    },
  };
}
