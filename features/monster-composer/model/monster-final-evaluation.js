export const MONSTER_FINAL_EVALUATION_VERSION = "monster-final-evaluation-v2.0";
export const MONSTER_FINAL_EVALUATION_SCALE = Object.freeze({ min: 0, max: 10 });

const PRESSURE_LABELS_V2 = Object.freeze({
  baseline: "Baseline Threat",
  offense: "Sustained Offense",
  burst: "Burst",
  control: "Control",
  defense: "Effective Defense",
  tempo: "Tempo",
  reach: "Reach / Area",
  persistence: "Persistence",
});

const COMPLEXITY_LABELS_V2 = Object.freeze({
  base: "Base Handling",
  repertoire: "Repertoire",
  timing: "Timing Hooks",
  tracking: "Tracking",
  choices: "Turn Choices",
  systems: "Special Systems",
});

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

function getConditionEntries(abilities = []) {
  return abilities.flatMap((ability) => asArray(ability.conditions));
}

function getEffectEntries(abilities = []) {
  return abilities.flatMap((ability) => asArray(ability.effects));
}

function getDamageEntries(abilities = []) {
  return abilities.flatMap((ability) => asArray(ability.damage?.entries));
}

function getDprSources(dprProfile = {}) {
  return asArray(dprProfile?.allSources?.length ? dprProfile.allSources : dprProfile?.sources);
}

function countExpectedAreaSources(dprProfile = {}, abilities = []) {
  const dprSources = getDprSources(dprProfile);
  const sourceCount = dprSources.filter((source) => Number(source.expectedTargets || 1) > 1).length;
  const abilityCount = abilities.filter((ability) => ability.areaEffect?.enabled || ability.targeting?.type === "area").length;
  return Math.max(sourceCount, abilityCount);
}

function buildPressureMeasure({
  targetCr = 0,
  baseline = {},
  printedStats = {},
  dprProfile = {},
  effectiveProfile = {},
  crValidation = {},
  abilityModel = {},
  attackRoutine = null,
  mechanicsSummary = {},
  tempoProfile = {},
  monsterTier = {},
} = {}) {
  const abilities = getAbilityList(abilityModel);
  const conditions = getConditionEntries(abilities);
  const damageSources = getDprSources(dprProfile);
  const baselineDpr = Math.max(1, Number(baseline?.dpr || printedStats?.dpr || 1));
  const baselineHp = Math.max(1, Number(baseline?.hp || printedStats?.hp || 1));
  const baselineAc = Number(baseline?.ac || printedStats?.ac || 10);
  const effectiveDpr = Number(
    effectiveProfile?.effectiveDpr3Round ??
      dprProfile?.effectiveDpr3Round ??
      dprProfile?.averageDpr ??
      printedStats?.dpr ??
      baselineDpr,
  );
  const burstDpr = Number(effectiveProfile?.burstDpr ?? dprProfile?.burstDpr ?? effectiveDpr);
  const sustainedDpr = Number(effectiveProfile?.sustainedDpr ?? dprProfile?.sustainedDpr ?? effectiveDpr);
  const effectiveHp = Number(effectiveProfile?.effectiveHp ?? printedStats?.hp ?? baselineHp);
  const dprRatio = safeRatio(effectiveDpr, baselineDpr, 1);
  const burstRatio = safeRatio(burstDpr, baselineDpr, dprRatio);
  const sustainedRatio = safeRatio(sustainedDpr, baselineDpr, dprRatio);
  const hpRatio = safeRatio(effectiveHp, baselineHp, 1);
  const acDelta = Number(printedStats?.ac ?? baselineAc) - baselineAc;
  const target = Number(targetCr || 0);
  const offensiveCrDelta = Number(crValidation?.offensive?.cr ?? target) - target;
  const defensiveCrDelta = Number(crValidation?.defensive?.cr ?? target) - target;
  const conditionProfile = effectiveProfile?.conditionProfile || {};
  const majorConditionCount = Math.max(
    Number(conditionProfile.majorCount || 0),
    conditions.filter((condition) => cleanString(condition.severity).toLowerCase() === "major").length,
  );
  const severeConditionCount = Math.max(
    Number(conditionProfile.severeCount || 0),
    conditions.filter((condition) => cleanString(condition.severity).toLowerCase() === "severe").length,
  );
  const repeatedHardControlCount = Number(conditionProfile.repeatedHardControlCount || 0);
  const conditionCrAdjustment = Number(conditionProfile.crAdjustment || 0);
  const conditionPressure = Number(conditionProfile.controlPressure || 0);
  const routine = attackRoutine || dprProfile?.attackRoutine || {};
  const routineCount = routine?.enabled ? Math.max(1, Number(routine.count || 1)) : 1;
  const reactionCount = countAbilitiesBy(abilities, (ability) => getActionEconomy(ability) === "reaction");
  const bonusActionCount = countAbilitiesBy(abilities, (ability) => getActionEconomy(ability) === "bonusAction");
  const legendaryCount = countAbilitiesBy(abilities, (ability) => getActionEconomy(ability) === "legendaryAction");
  const lairCount = countAbilitiesBy(abilities, (ability) => getActionEconomy(ability) === "lairAction");
  const summonCount = countAbilitiesBy(abilities, (ability) => Boolean(ability.summon?.enabled));
  const ongoingCount = countAbilitiesBy(abilities, (ability) => Boolean(ability.ongoing?.enabled));
  const rechargeCount = countAbilitiesBy(abilities, (ability) => getUsageType(ability) === "recharge");
  const deathCount = countAbilitiesBy(abilities, (ability) => getActionEconomy(ability) === "deathTrigger");
  const areaSourceCount = countExpectedAreaSources(dprProfile, abilities);
  const expectedTargetsPeak = Math.max(1, ...damageSources.map((source) => Number(source.expectedTargets || 1)));
  const tierPressure = Number(monsterTier?.pressureMod || 0);
  const tempoPressure = Number(tempoProfile?.pressureMod || 0);

  const breakdown = {
    baseline: 1.5,
    offense: clamp(0.65 + dprRatio * 0.85 + Math.max(0, sustainedRatio - 1) * 0.65, 0, 2.4),
    burst: clamp(Math.max(0, burstRatio - 1) * 1.25 + Math.max(0, safeRatio(burstDpr, sustainedDpr, 1) - 1) * 0.9, 0, 2.1),
    control: clamp(
      conditionCrAdjustment * 0.75 +
        conditionPressure * 0.18 +
        majorConditionCount * 0.38 +
        severeConditionCount * 0.65 +
        repeatedHardControlCount * 0.45,
      0,
      2.1,
    ),
    defense: clamp(
      Math.max(0, hpRatio - 0.75) * 0.9 +
        Math.max(0, acDelta) * 0.14 +
        Math.max(0, defensiveCrDelta) * 0.16,
      0,
      1.7,
    ),
    tempo: clamp(
      Math.max(0, routineCount - 1) * 0.16 +
        reactionCount * 0.18 +
        bonusActionCount * 0.12 +
        legendaryCount * 0.22 +
        lairCount * 0.24 +
        summonCount * 0.35 +
        Math.max(0, tierPressure) * 0.1 +
        Math.max(0, tempoPressure) * 0.12 +
        Math.max(0, offensiveCrDelta) * 0.08,
      0,
      1.6,
    ),
    reach: clamp(areaSourceCount * 0.2 + Math.max(0, expectedTargetsPeak - 1) * 0.18, 0, 1.2),
    persistence: clamp(ongoingCount * 0.22 + rechargeCount * 0.12 + deathCount * 0.2, 0, 0.9),
  };

  const score = Object.values(breakdown).reduce((sum, value) => sum + Number(value || 0), 0);
  const measure = buildMeasure(score, breakdown, PRESSURE_LABELS_V2);
  return {
    ...measure,
    inputs: {
      targetCr: target,
      dprRatio: roundTo(dprRatio),
      burstRatio: roundTo(burstRatio),
      sustainedRatio: roundTo(sustainedRatio),
      effectiveHpRatio: roundTo(hpRatio),
      offensiveCrDelta: roundTo(offensiveCrDelta),
      defensiveCrDelta: roundTo(defensiveCrDelta),
      majorConditionCount,
      severeConditionCount,
      repeatedHardControlCount,
      routineCount,
      areaSourceCount,
      expectedTargetsPeak: roundTo(expectedTargetsPeak),
    },
    invariants: {
      counterplaySubtracted: false,
      buildBudgetUsedAsPressure: false,
      roundingPolicy: "sum-then-round",
    },
  };
}

function buildComplexityMeasure({
  abilityModel = {},
  dprProfile = {},
  attackRoutine = null,
  mechanicsSummary = {},
} = {}) {
  const abilities = getAbilityList(abilityModel);
  const conditions = getConditionEntries(abilities);
  const effects = getEffectEntries(abilities);
  const damageEntries = getDamageEntries(abilities);
  const actionableAbilities = abilities.filter((ability) => !["passive", "trait"].includes(getActionEconomy(ability)));
  const distinctSections = new Set(abilities.map((ability) => cleanString(ability.section)).filter(Boolean));
  const reactionCount = countAbilitiesBy(abilities, (ability) => getActionEconomy(ability) === "reaction");
  const bonusActionCount = countAbilitiesBy(abilities, (ability) => getActionEconomy(ability) === "bonusAction");
  const legendaryCount = countAbilitiesBy(abilities, (ability) => getActionEconomy(ability) === "legendaryAction");
  const lairCount = countAbilitiesBy(abilities, (ability) => getActionEconomy(ability) === "lairAction");
  const deathCount = countAbilitiesBy(abilities, (ability) => getActionEconomy(ability) === "deathTrigger");
  const rechargeCount = countAbilitiesBy(abilities, (ability) => getUsageType(ability) === "recharge");
  const limitedCount = countAbilitiesBy(abilities, (ability) => getUsageType(ability) === "limited");
  const repeatSaveCount = conditions.filter((condition) => condition.repeatSave?.enabled).length;
  const escapeCount = conditions.filter((condition) => condition.escape?.enabled).length;
  const ongoingCount = countAbilitiesBy(abilities, (ability) => Boolean(ability.ongoing?.enabled));
  const procedureCount = countAbilitiesBy(abilities, (ability) => Boolean(ability.procedure?.enabled));
  const summonCount = countAbilitiesBy(abilities, (ability) => Boolean(ability.summon?.enabled));
  const spellcastingCount = countAbilitiesBy(abilities, (ability) => Boolean(ability.spellcasting?.enabled));
  const defenseTrackingCount = countAbilitiesBy(
    abilities,
    (ability) => ["regeneration", "parry", "defensiveReaction", "damageReduction"].includes(cleanString(ability.defense?.type)),
  );
  const multiPartDamageCount = abilities.filter((ability) => asArray(ability.damage?.entries).length > 1).length;
  const unresolvedEffectCount = effects.filter((effect) => ["proxy", "unmodeled"].includes(cleanString(effect.simulation?.policy))).length;
  const routine = attackRoutine || dprProfile?.attackRoutine || {};
  const routineChoiceCount = routine?.mode === "choice" ? Math.max(0, asArray(routine.attacks).length - 1) : 0;
  const routineReplacementCount = asArray(routine?.replacements).length;
  const routineAdditionCount = asArray(routine?.additions).length;
  const mainActionOptionCount = Math.max(0, Number(dprProfile?.actionEconomy?.mainActionOptionCount || 0) - 1);
  const authoredComplexityTags = Object.keys(mechanicsSummary?.complexityTags || {}).length;

  const breakdown = {
    base: abilities.length ? 0.55 : 0,
    repertoire: clamp(
      Math.max(0, actionableAbilities.length - 1) * 0.34 +
        Math.max(0, distinctSections.size - 1) * 0.18 +
        multiPartDamageCount * 0.2,
      0,
      2.7,
    ),
    timing: clamp(
      reactionCount * 0.45 +
        bonusActionCount * 0.22 +
        legendaryCount * 0.28 +
        lairCount * 0.35 +
        deathCount * 0.25 +
        rechargeCount * 0.3 +
        limitedCount * 0.18,
      0,
      2.2,
    ),
    tracking: clamp(
      conditions.length * 0.18 +
        repeatSaveCount * 0.36 +
        escapeCount * 0.28 +
        ongoingCount * 0.42 +
        defenseTrackingCount * 0.34 +
        unresolvedEffectCount * 0.3,
      0,
      2.5,
    ),
    choices: clamp(
      routineChoiceCount * 0.32 +
        routineReplacementCount * 0.38 +
        routineAdditionCount * 0.34 +
        mainActionOptionCount * 0.26,
      0,
      1.8,
    ),
    systems: clamp(
      procedureCount * 0.72 +
        summonCount * 0.9 +
        spellcastingCount * 1.05 +
        Math.max(0, authoredComplexityTags - abilities.length) * 0.04 +
        Math.max(0, damageEntries.length - abilities.length) * 0.08,
      0,
      2.5,
    ),
  };
  const score = Object.values(breakdown).reduce((sum, value) => sum + Number(value || 0), 0);
  const measure = buildMeasure(score, breakdown, COMPLEXITY_LABELS_V2);
  return {
    ...measure,
    inputs: {
      abilityCount: abilities.length,
      actionableAbilityCount: actionableAbilities.length,
      distinctSectionCount: distinctSections.size,
      reactionCount,
      rechargeCount,
      conditionCount: conditions.length,
      repeatSaveCount,
      escapeCount,
      ongoingCount,
      procedureCount,
      summonCount,
      spellcastingCount,
      routineChoiceCount,
      routineReplacementCount,
      routineAdditionCount,
      mainActionOptionCount,
    },
    invariants: {
      crIndependent: true,
      damageMagnitudeIndependent: true,
      roundingPolicy: "sum-then-round",
    },
  };
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
  printedStats = {},
  dprProfile = {},
  effectiveProfile = {},
  crValidation = {},
  abilityModel = {},
  attackRoutine = null,
  mechanicsSummary = {},
  tempoProfile = {},
  monsterTier = {},
  counterplayAudit = {},
  selectedFeatures = [],
  buildBudget = null,
  buildCost = null,
  complexityCap = null,
} = {}) {
  const pressure = buildPressureMeasure({
    targetCr,
    baseline,
    printedStats,
    dprProfile,
    effectiveProfile,
    crValidation,
    abilityModel,
    attackRoutine,
    mechanicsSummary,
    tempoProfile,
    monsterTier,
  });
  const complexity = buildComplexityMeasure({
    abilityModel,
    dprProfile,
    attackRoutine,
    mechanicsSummary,
  });
  const counterplay = buildCounterplayMeasure({ counterplayAudit, abilityModel, selectedFeatures });
  const spikeRisk = buildSpikeRiskMeasure({ targetCr, baseline, dprProfile, effectiveProfile, abilityModel });
  const budget = buildBudgetMeasure({ buildBudget, buildCost });

  return {
    version: MONSTER_FINAL_EVALUATION_VERSION,
    status: "final-compiled-monster",
    scale: { ...MONSTER_FINAL_EVALUATION_SCALE },
    buildBudget: budget,
    pressure,
    complexity: {
      ...complexity,
      legacyCap: Number.isFinite(Number(complexityCap)) ? Number(complexityCap) : null,
    },
    counterplay,
    spikeRisk,
    invariants: {
      pressureUsesFinalCompiledOutput: true,
      complexityUsesFlattenedAbilityModel: true,
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
  const projectedPressureScore = Number.isFinite(Number(pressureBudget))
    ? Math.round((Number(evaluation.pressure?.score || 0) / 10) * Number(pressureBudget))
    : Number(evaluation.pressure?.score || 0);
  const projectedComplexityScore = Number.isFinite(Number(complexityCap))
    ? Math.round((Number(evaluation.complexity?.score || 0) / 10) * Number(complexityCap))
    : Number(evaluation.complexity?.score || 0);

  return {
    pressureProfile: {
      ...(pressureProfile || {}),
      score: preserveVisibleScores && pressureProfile ? pressureProfile.score : projectedPressureScore,
      label: preserveVisibleScores && pressureProfile ? pressureProfile.label : scoreLabel(evaluation.pressure?.score),
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
      label: preserveVisibleScores && complexityProfile ? complexityProfile.label : scoreLabel(evaluation.complexity?.score),
      v2: evaluation.complexity,
      finalEvaluationVersion: evaluation.version,
      legacyProjection: {
        score: projectedComplexityScore,
        cap: Number.isFinite(Number(complexityCap)) ? Number(complexityCap) : null,
      },
    },
  };
}
