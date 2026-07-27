export const MONSTER_PRESSURE_COMPLEXITY_VERSION = "monster-pressure-complexity-v3.4-graft-weight";

export const MONSTER_PRESSURE_CR_BANDS = Object.freeze([
  Object.freeze({ minCr: 0, maxCr: 1, limit: 4 }),
  Object.freeze({ minCr: 2, maxCr: 4, limit: 6 }),
  Object.freeze({ minCr: 5, maxCr: 8, limit: 8 }),
  Object.freeze({ minCr: 9, maxCr: 12, limit: 10 }),
  Object.freeze({ minCr: 13, maxCr: 16, limit: 12 }),
  Object.freeze({ minCr: 17, maxCr: 20, limit: 14 }),
  Object.freeze({ minCr: 21, maxCr: 30, limit: 16 }),
]);


/**
 * Returns the editorial guidance limits for the current frame.
 * Advanced Mode changes authoring freedom (for example slot caps), never the
 * Pressure or Complexity guidance. Custom/stale values are intentionally ignored.
 */
export function resolveMonsterGuidanceLimits({ framePowerProfile = {} } = {}) {
  return {
    pressureLimit: Math.max(1, Number(framePowerProfile.pressureLimit || 1)),
    complexityCap: Math.max(1, Number(framePowerProfile.complexityCap || 1)),
  };
}

export const PLAYER_PRESSURE_LABELS = Object.freeze({
  coreRoutine: "Core Routine",
  playerResponses: "Player Responses",
  control: "Control",
  spatial: "Spatial Demands",
  tempo: "Tempo",
  persistence: "Persistence",
  interactions: "Interactions",
  graftWeight: "Graft Weight",
});

export const DM_COMPLEXITY_LABELS = Object.freeze({
  decisions: "Decision Load",
  triggers: "Trigger Load",
  state: "State Tracking",
  board: "Board Tracking",
  branching: "Branching",
  systems: "Special Systems",
  graftWeight: "Graft Weight",
});

/**
 * Editorial priors calibrated against 503 MM'25 stat blocks in Bestiary.csv.
 * Prevalence is guidance, not a direct inverse-frequency formula: activation
 * window and purpose matter. Weaknesses remain light because they expose
 * counterplay; Death Effects remain conditional; Movement, Twist, and Lair
 * rules receive a surcharge because they add exceptional positioning, timing,
 * or board procedures beyond the baseline turn.
 */
export const MONSTER_GRAFT_SLOT_WEIGHT_PROFILES = Object.freeze({
  attack: Object.freeze({
    bestiaryPrevalence: 0.714,
    pressureBase: -2,
    pressurePerComplexity: 0,
    complexityBase: -1,
    complexityPerComplexity: 0,
    rationale: "Attack routines are the normal language of a stat block and should not be charged like exceptional subsystems.",
  }),
  body: Object.freeze({
    bestiaryPrevalence: 0.338,
    pressureBase: -0.25,
    pressurePerComplexity: 0,
    complexityBase: -0.25,
    complexityPerComplexity: 0,
    rationale: "Most Body grafts are passive, visible, and resolved without additional turn choices.",
  }),
  mind: Object.freeze({
    bestiaryPrevalence: 0.258,
    pressureBase: 0.5,
    pressurePerComplexity: 0,
    complexityBase: 0.5,
    complexityPerComplexity: 0,
    rationale: "Mind grafts often add targeting priorities, control, or conditional behavior.",
  }),
  movement: Object.freeze({
    bestiaryPrevalence: 0.306,
    pressureBase: 2,
    pressurePerComplexity: 0.5,
    complexityBase: 0.75,
    complexityPerComplexity: 0.5,
    rationale: "Special movement changes threat geometry, safe positions, and the DM's turn-by-turn route choices.",
  }),
  twist: Object.freeze({
    bestiaryPrevalence: 0.121,
    pressureBase: 1,
    pressurePerComplexity: 0,
    complexityBase: 0.75,
    complexityPerComplexity: 0,
    rationale: "Twists add phase changes, exception timing, or a second operating rule.",
  }),
  horror: Object.freeze({
    bestiaryPrevalence: 0.121,
    pressureBase: 0.75,
    pressurePerComplexity: 0,
    complexityBase: 0.5,
    complexityPerComplexity: 0,
    rationale: "Horror grafts usually impose a distinct player response even when they trigger only once.",
  }),
  weakness: Object.freeze({
    bestiaryPrevalence: 0.091,
    pressureBase: -1.25,
    pressurePerComplexity: 0,
    complexityBase: -0.5,
    complexityPerComplexity: 0,
    rationale: "Weaknesses add information but primarily reduce pressure by giving the party a readable answer.",
  }),
  death: Object.freeze({
    bestiaryPrevalence: 0.02,
    pressureBase: 0.75,
    pressurePerComplexity: 0,
    complexityBase: 0.75,
    complexityPerComplexity: 0,
    rationale: "Death Effects are rare but have a narrow activation window, so their surcharge stays below an always-active subsystem.",
  }),
  lair: Object.freeze({
    bestiaryPrevalence: 0.07,
    pressureBase: 1.5,
    pressurePerComplexity: 0,
    complexityBase: 1.25,
    complexityPerComplexity: 0,
    rationale: "Lair rules add off-turn timing, environmental state, and board-wide consequences.",
  }),
});

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function idOf(value, fallback = "normal") {
  return cleanString(value?.id || value || fallback) || fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function roundTo(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function unique(values = []) {
  return [...new Set(values.map(cleanString).filter(Boolean))];
}

function getActionEconomy(ability = {}) {
  return cleanString(ability.actionEconomy || ability.rules?.actionEconomy || ability.section || "passive");
}

function getUsageType(ability = {}) {
  return cleanString(ability.usage?.type || ability.rules?.usage?.type || "passive");
}

function getAbilities(abilityModel = {}) {
  return asArray(abilityModel.abilities);
}

function isBaselineAbility(ability = {}) {
  return Boolean(
    ability.baselineAbility === true ||
      ability.generatedBy === "basic-attack-fallback-v1" ||
      ability.rules?.migration?.convertedFrom === "basic-attack-fallback-v1" ||
      cleanString(ability.sourceGraftId).startsWith("frame-basic-strike-"),
  );
}

function isBaselineFeature(feature = {}) {
  return Boolean(
    feature.baselineAbility === true ||
      feature.generatedBy === "basic-attack-fallback-v1" ||
      feature.rules?.migration?.convertedFrom === "basic-attack-fallback-v1" ||
      cleanString(feature.id).startsWith("frame-basic-strike-"),
  );
}

function getGraftSlotWeight(feature = {}) {
  if (isBaselineFeature(feature)) return { pressure: 0, complexity: 0 };
  const profile = MONSTER_GRAFT_SLOT_WEIGHT_PROFILES[cleanString(feature.slot)] || null;
  if (!profile) return { pressure: 0, complexity: 0 };
  const declaredComplexity = clamp(Number(feature.complexity || 0), 0, 3);
  const complexitySteps = Math.max(0, declaredComplexity - 1);
  return {
    pressure:
      Number(profile.pressureBase || 0) +
      Number(profile.pressurePerComplexity || 0) * complexitySteps,
    complexity:
      Number(profile.complexityBase || 0) +
      Number(profile.complexityPerComplexity || 0) * complexitySteps,
  };
}

export function summarizeGraftSlotWeights(selectedFeatures = []) {
  const weightedFeatures = asArray(selectedFeatures).filter(
    (feature) => feature.synthetic !== true && !isBaselineFeature(feature),
  );
  const bySlot = {};
  let pressure = 0;
  let complexity = 0;
  weightedFeatures.forEach((feature) => {
    const weight = getGraftSlotWeight(feature);
    const slot = cleanString(feature.slot) || "unknown";
    pressure += weight.pressure;
    complexity += weight.complexity;
    if (!bySlot[slot]) bySlot[slot] = { count: 0, pressure: 0, complexity: 0 };
    bySlot[slot].count += 1;
    bySlot[slot].pressure += weight.pressure;
    bySlot[slot].complexity += weight.complexity;
  });
  return {
    featureCount: weightedFeatures.length,
    pressure: roundTo(pressure),
    complexity: roundTo(complexity),
    bySlot: Object.fromEntries(
      Object.entries(bySlot).map(([slot, value]) => [slot, {
        count: value.count,
        pressure: roundTo(value.pressure),
        complexity: roundTo(value.complexity),
      }]),
    ),
  };
}

function isSyntheticMultiattack(ability = {}) {
  return Boolean(
    ability.synthetic &&
      (ability.localAbilityId === "multiattack" || ability.rules?.multiattack?.enabled),
  );
}

function countAbilities(abilities, predicate) {
  return abilities.filter(predicate).length;
}

function getConditions(abilities) {
  return abilities.flatMap((ability) => asArray(ability.conditions));
}

function getEffects(abilities) {
  return abilities.flatMap((ability) => asArray(ability.effects));
}

function getRoutineStats(attackRoutine = null, abilities = []) {
  const routine = attackRoutine || {};
  const syntheticMultiattack = abilities.find(isSyntheticMultiattack);
  const multiattack = syntheticMultiattack?.rules?.multiattack || syntheticMultiattack?.multiattack || null;
  const routineEnabled = Boolean(routine.enabled || multiattack?.enabled);
  const routineMode = cleanString(routine.mode || multiattack?.mode || "");
  const routineCount = Math.max(1, Number(routine.count || multiattack?.count || 1));
  const routineAttacks = asArray(routine.attacks?.length ? routine.attacks : multiattack?.attacks);
  const replacements = asArray(routine.replacements?.length ? routine.replacements : multiattack?.replacements);
  const additions = asArray(routine.additions);
  const choiceCount = routineMode === "choice"
    ? Math.max(1, routineAttacks.length || Number(routine.mainActionOptionCount || 1))
    : 0;

  return {
    enabled: routineEnabled,
    mode: routineMode,
    count: routineCount,
    attacks: routineAttacks,
    replacements,
    additions,
    choiceCount,
  };
}

function getFeatureComplexityDimensions(feature = {}) {
  const profile = feature.complexityProfile || {};
  const fallback = clamp(Number(feature.complexity || 0), 0, 3);
  return {
    decision: clamp(profile.decisionLoad ?? profile.decision ?? fallback, 0, 3),
    sequencing: clamp(profile.sequencing ?? 0, 0, 3),
    branches: clamp(profile.conditionalBranches ?? profile.branches ?? 0, 0, 3),
    tracking: clamp(profile.tracking ?? fallback, 0, 3),
  };
}

function profileBand(score, limit) {
  const safeLimit = Math.max(1, Number(limit || 1));
  const ratio = Number(score || 0) / safeLimit;
  if (ratio <= 0.45) return "Low";
  if (ratio <= 0.75) return "Moderate";
  if (ratio <= 1) return "High";
  if (ratio <= 1.25) return "Over Target";
  return "Critical";
}

function buildSources(breakdown, labels, limit = 4) {
  return Object.entries(breakdown || {})
    .filter(([, value]) => Number(value || 0) > 0)
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0) || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, value]) => `${labels[key] || key} +${roundTo(value)}`);
}

function buildProfile({ score, limit, breakdown, labels, question, stage }) {
  const roundedBreakdown = Object.fromEntries(
    Object.entries(breakdown || {}).map(([key, value]) => [key, roundTo(value)]),
  );
  const roundedScore = Math.max(0, Math.round(Number(score || 0)));
  const safeLimit = Math.max(1, Math.round(Number(limit || 1)));
  const excess = Math.max(0, roundedScore - safeLimit);

  return {
    version: MONSTER_PRESSURE_COMPLEXITY_VERSION,
    stage,
    question,
    score: roundedScore,
    limit: safeLimit,
    label: profileBand(roundedScore, safeLimit),
    utilization: roundTo(roundedScore / safeLimit),
    overLimit: excess > 0,
    excess,
    breakdown: roundedBreakdown,
    sources: buildSources(roundedBreakdown, labels),
  };
}

function pressureBaseForCr(targetCr = 0) {
  const cr = clamp(Number(targetCr || 0), 0, 30);
  return MONSTER_PRESSURE_CR_BANDS.find((band) => cr >= band.minCr && cr <= band.maxCr)?.limit || 16;
}

export function getPressureLimitForFrame({
  targetCr = 0,
  roleId = "standard",
  monsterTierId = "normal",
} = {}) {
  const cr = clamp(Number(targetCr || 0), 0, 30);
  const base = pressureBaseForCr(cr);
  const roleModifier = {
    minion: -2,
    standard: 0,
    boss: 1,
  }[idOf(roleId, "standard")] ?? 0;
  const tierModifier = {
    normal: 0,
    elite: 1,
    boss: 2,
    legendary: 3,
    setpiece: 3,
  }[idOf(monsterTierId, "normal")] ?? 0;
  const maximumPositiveModifier = cr <= 4 ? 2 : 3;
  const combinedModifier = clamp(roleModifier + tierModifier, -2, maximumPositiveModifier);
  return Math.max(2, Math.round(base + combinedModifier));
}

export function getComplexityLimitForFrame({
  roleId = "standard",
  monsterTierId = "normal",
  tempoProfileId = "standard",
} = {}) {
  const roleBase = {
    minion: 3,
    standard: 6,
    boss: 8,
  }[idOf(roleId, "standard")] ?? 6;
  const tierModifier = {
    normal: 0,
    elite: 1,
    boss: 1,
    legendary: 2,
    setpiece: 2,
  }[idOf(monsterTierId, "normal")] ?? 0;
  const tempoModifier = {
    slow: 0,
    standard: 0,
    fast: 1,
    ambusher: 1,
    legendary: 1,
  }[idOf(tempoProfileId, "standard")] ?? 0;
  return Math.round(clamp(roleBase + tierModifier + tempoModifier, 3, 10));
}

export function buildPlayerPressureProfile({
  targetCr = 0,
  limit = null,
  abilityModel = {},
  attackRoutine = null,
  selectedFeatures = [],
} = {}) {
  const abilities = getAbilities(abilityModel);
  const authoredAbilities = abilities.filter((ability) => !isSyntheticMultiattack(ability) && !isBaselineAbility(ability));
  const conditions = getConditions(authoredAbilities);
  const effects = getEffects(authoredAbilities);
  const routine = getRoutineStats(attackRoutine, abilities);
  const graftSlotWeights = summarizeGraftSlotWeights(selectedFeatures);
  const mainActions = authoredAbilities.filter((ability) => getActionEconomy(ability) === "action");
  const reactions = countAbilities(authoredAbilities, (ability) => getActionEconomy(ability) === "reaction");
  const bonusActions = countAbilities(authoredAbilities, (ability) => getActionEconomy(ability) === "bonusAction");
  const legendaryActions = countAbilities(authoredAbilities, (ability) => getActionEconomy(ability) === "legendaryAction");
  const lairActions = countAbilities(authoredAbilities, (ability) => getActionEconomy(ability) === "lairAction");
  const deathEffects = countAbilities(authoredAbilities, (ability) => getActionEconomy(ability) === "deathTrigger");
  const rechargeCount = countAbilities(authoredAbilities, (ability) => getUsageType(ability) === "recharge");
  const summonCount = countAbilities(authoredAbilities, (ability) => Boolean(ability.summon?.enabled));
  const ongoingCount = countAbilities(authoredAbilities, (ability) => Boolean(ability.ongoing?.enabled));
  const procedureCount = countAbilities(authoredAbilities, (ability) => Boolean(ability.procedure?.enabled));
  const areaAbilities = authoredAbilities.filter(
    (ability) => ability.areaEffect?.enabled || ability.targeting?.type === "area",
  );
  const persistentAreas = areaAbilities.filter((ability) =>
    ["startsTurnInArea", "endsTurnInArea", "entersArea", "whileInArea"].includes(ability.areaEffect?.timing),
  );
  const hardConditions = unique(
    conditions
      .filter((condition) => ["major", "severe"].includes(cleanString(condition.severity).toLowerCase()))
      .map((condition) => condition.name),
  );
  const allConditionNames = unique(conditions.map((condition) => condition.name));
  const repeatSaveCount = conditions.filter((condition) => condition.repeatSave?.enabled).length;
  const escapeCount = conditions.filter((condition) => condition.escape?.enabled).length;
  const counterplayTypes = new Set();
  authoredAbilities.forEach((ability) => {
    if (ability.counterplay?.positioningAnswer) counterplayTypes.add("positioning");
    if (ability.counterplay?.breakCondition) counterplayTypes.add("break-condition");
    if (ability.counterplay?.nonDamageAnswer) counterplayTypes.add("non-damage");
  });
  if (escapeCount) counterplayTypes.add("escape");
  if (repeatSaveCount) counterplayTypes.add("repeat-save");
  if (areaAbilities.length) counterplayTypes.add("area-positioning");
  if (asArray(selectedFeatures).some((feature) => feature.slot === "weakness")) counterplayTypes.add("weakness");

  const effectTokens = effects
    .map((effect) => `${effect.type || ""} ${effect.subtype || ""} ${effect.text || ""}`.toLowerCase())
    .join(" ");
  const forcedMovementOrContainment = /push|pull|move|teleport|displace|grapple|restrain|contain|swallow|engulf|prone/.test(effectTokens) ||
    authoredAbilities.some((ability) => ["swallow", "engulf", "possession"].includes(cleanString(ability.procedure?.type)));
  const phaseTriggers = authoredAbilities.filter((ability) => {
    const trigger = `${ability.trigger?.type || ""} ${ability.trigger?.text || ability.trigger || ""}`.toLowerCase();
    return /bloodied|half hit points|phase|transform|changes form|first reduced/.test(trigger);
  }).length;
  const otherTriggers = authoredAbilities.filter((ability) => Boolean(ability.trigger) && getActionEconomy(ability) !== "reaction").length;
  const defenseResponses = countAbilities(
    authoredAbilities,
    (ability) => Boolean(ability.defense?.enabled),
  );

  const coreRoutine =
    (mainActions.length ? 1 : 0) +
    Math.max(0, mainActions.length - 1) * 0.9 +
    (routine.enabled ? Math.max(0, routine.count - 1) * 0.35 : 0) +
    (routine.mode === "choice" ? 0.75 : 0) +
    routine.replacements.length * 0.5 +
    routine.additions.length * 0.35;
  const playerResponses =
    counterplayTypes.size * 0.42 +
    Math.max(0, allConditionNames.length - 1) * 0.22 +
    (defenseResponses ? 0.35 : 0);
  const control =
    hardConditions.length * 0.75 +
    Math.max(0, allConditionNames.length - hardConditions.length) * 0.25 +
    repeatSaveCount * 0.2 +
    escapeCount * 0.25 +
    (forcedMovementOrContainment ? 0.65 : 0);
  const spatial =
    areaAbilities.length * 0.45 +
    persistentAreas.length * 0.35 +
    (counterplayTypes.has("positioning") ? 0.25 : 0) +
    (forcedMovementOrContainment ? 0.35 : 0);
  const tempo =
    reactions * 0.48 +
    bonusActions * 0.3 +
    legendaryActions * 0.42 +
    lairActions * 0.5 +
    rechargeCount * 0.28 +
    summonCount * 0.55;
  const persistence =
    ongoingCount * 0.55 +
    persistentAreas.length * 0.4 +
    summonCount * 0.65 +
    procedureCount * 0.4 +
    deathEffects * 0.28;
  const activeSystemCount = [
    hardConditions.length > 0,
    areaAbilities.length > 0,
    ongoingCount > 0,
    summonCount > 0,
    reactions > 0,
    lairActions > 0,
    phaseTriggers > 0,
  ].filter(Boolean).length;
  const interactions =
    phaseTriggers * 0.55 +
    otherTriggers * 0.2 +
    Math.max(0, activeSystemCount - 2) * 0.28 +
    (areaAbilities.length && hardConditions.length ? 0.4 : 0) +
    (summonCount && areaAbilities.length ? 0.3 : 0) +
    (reactions && hardConditions.length ? 0.25 : 0);

  const breakdown = {
    coreRoutine,
    playerResponses,
    control,
    spatial,
    tempo,
    persistence,
    interactions,
    graftWeight: graftSlotWeights.pressure,
  };
  const resolvedLimit = limit ?? pressureBaseForCr(targetCr);
  const rawScore = Object.values(breakdown).reduce((sum, value) => sum + Number(value || 0), 0);
  const score = Math.max(authoredAbilities.length || graftSlotWeights.featureCount ? 1 : 0, rawScore);
  return {
    ...buildProfile({
      score,
      limit: resolvedLimit,
      breakdown,
      labels: PLAYER_PRESSURE_LABELS,
      question: "How much tactical load does this monster place on the players?",
      stage: "final-cr-projected-repertoire",
    }),
    inputs: {
      targetCr: Number(targetCr || 0),
      abilityCount: authoredAbilities.length,
      mainActionCount: mainActions.length,
      routineCount: routine.count,
      routineMode: routine.mode || null,
      reactionCount: reactions,
      bonusActionCount: bonusActions,
      legendaryActionCount: legendaryActions,
      lairActionCount: lairActions,
      deathEffectCount: deathEffects,
      hardConditionCount: hardConditions.length,
      areaAbilityCount: areaAbilities.length,
      persistentAreaCount: persistentAreas.length,
      summonCount,
      ongoingCount,
      activeSystemCount,
      graftSlotWeight: graftSlotWeights.pressure,
      graftSlotWeightsBySlot: graftSlotWeights.bySlot,
    },
    invariants: {
      damageMagnitudeIndependent: true,
      hitPointIndependent: true,
      challengeRatingChangesCapacityNotContentWeight: true,
      projectedRepertoireRequired: true,
    },
  };
}

export function buildDmComplexityProfile({
  limit = 6,
  abilityModel = {},
  attackRoutine = null,
  selectedFeatures = [],
} = {}) {
  const abilities = getAbilities(abilityModel);
  const authoredAbilities = abilities.filter((ability) => !isSyntheticMultiattack(ability) && !isBaselineAbility(ability));
  const conditions = getConditions(authoredAbilities);
  const effects = getEffects(authoredAbilities);
  const routine = getRoutineStats(attackRoutine, abilities);
  const graftSlotWeights = summarizeGraftSlotWeights(selectedFeatures);
  const mainActions = authoredAbilities.filter((ability) => getActionEconomy(ability) === "action");
  const reactions = countAbilities(authoredAbilities, (ability) => getActionEconomy(ability) === "reaction");
  const bonusActions = countAbilities(authoredAbilities, (ability) => getActionEconomy(ability) === "bonusAction");
  const legendaryActions = countAbilities(authoredAbilities, (ability) => getActionEconomy(ability) === "legendaryAction");
  const lairActions = countAbilities(authoredAbilities, (ability) => getActionEconomy(ability) === "lairAction");
  const deathEffects = countAbilities(authoredAbilities, (ability) => getActionEconomy(ability) === "deathTrigger");
  const rechargeCount = countAbilities(authoredAbilities, (ability) => getUsageType(ability) === "recharge");
  const limitedCount = countAbilities(authoredAbilities, (ability) => getUsageType(ability) === "limited");
  const triggeredCount = countAbilities(
    authoredAbilities,
    (ability) => Boolean(ability.trigger) && getActionEconomy(ability) !== "reaction",
  );
  const repeatSaveCount = conditions.filter((condition) => condition.repeatSave?.enabled).length;
  const escapeCount = conditions.filter((condition) => condition.escape?.enabled).length;
  const ongoingCount = countAbilities(authoredAbilities, (ability) => Boolean(ability.ongoing?.enabled));
  const procedureCount = countAbilities(authoredAbilities, (ability) => Boolean(ability.procedure?.enabled));
  const summonCount = countAbilities(authoredAbilities, (ability) => Boolean(ability.summon?.enabled));
  const spellcastingCount = countAbilities(authoredAbilities, (ability) => Boolean(ability.spellcasting?.enabled));
  const defenseTrackingCount = countAbilities(
    authoredAbilities,
    (ability) => ["regeneration", "parry", "defensiveReaction", "damageReduction"].includes(cleanString(ability.defense?.type)),
  );
  const areaAbilities = authoredAbilities.filter(
    (ability) => ability.areaEffect?.enabled || ability.targeting?.type === "area",
  );
  const persistentAreas = areaAbilities.filter((ability) =>
    ["startsTurnInArea", "endsTurnInArea", "entersArea", "whileInArea"].includes(ability.areaEffect?.timing),
  );
  const multiPartDamageCount = authoredAbilities.filter(
    (ability) => asArray(ability.damage?.entries).length > 1,
  ).length;
  const unresolvedEffectCount = effects.filter((effect) =>
    ["proxy", "unmodeled"].includes(cleanString(effect.simulation?.policy)),
  ).length;
  const referenceCount = authoredAbilities.reduce(
    (sum, ability) => sum + asArray(ability.references).length,
    0,
  );
  const authoredDimensions = asArray(selectedFeatures).map(getFeatureComplexityDimensions);
  const authoredDecision = authoredDimensions.reduce((sum, profile) => sum + profile.decision, 0);
  const authoredSequencing = authoredDimensions.reduce((sum, profile) => sum + profile.sequencing, 0);
  const authoredBranches = authoredDimensions.reduce((sum, profile) => sum + profile.branches, 0);
  const authoredTracking = authoredDimensions.reduce((sum, profile) => sum + profile.tracking, 0);

  const decisions =
    (authoredAbilities.length ? 0.5 : 0) +
    Math.max(0, mainActions.length - 1) * 0.55 +
    (routine.mode === "choice" ? 0.7 : 0) +
    routine.replacements.length * 0.5 +
    routine.additions.length * 0.35 +
    (reactions + bonusActions + legendaryActions + lairActions) * 0.18 +
    authoredDecision * 0.05;
  const triggers =
    reactions * 0.55 +
    rechargeCount * 0.42 +
    deathEffects * 0.3 +
    lairActions * 0.45 +
    legendaryActions * 0.36 +
    triggeredCount * 0.32 +
    limitedCount * 0.2;
  const state =
    conditions.length * 0.24 +
    repeatSaveCount * 0.52 +
    escapeCount * 0.42 +
    ongoingCount * 0.62 +
    defenseTrackingCount * 0.46 +
    unresolvedEffectCount * 0.3 +
    authoredTracking * 0.06;
  const board =
    areaAbilities.length * 0.35 +
    persistentAreas.length * 0.5 +
    summonCount * 0.9 +
    procedureCount * 0.48;
  const branching =
    (routine.mode === "choice" ? 0.45 : 0) +
    routine.replacements.length * 0.42 +
    routine.additions.length * 0.32 +
    multiPartDamageCount * 0.14 +
    authoredBranches * 0.07 +
    authoredSequencing * 0.05;
  const systems =
    procedureCount * 0.58 +
    summonCount * 0.85 +
    spellcastingCount * 1.05 +
    Math.max(0, referenceCount - authoredAbilities.length) * 0.12;

  const breakdown = {
    decisions,
    triggers,
    state,
    board,
    branching,
    systems,
    graftWeight: graftSlotWeights.complexity,
  };
  const rawScore = Object.values(breakdown).reduce((sum, value) => sum + Number(value || 0), 0);
  const score = Math.max(authoredAbilities.length || graftSlotWeights.featureCount ? 1 : 0, rawScore);
  return {
    ...buildProfile({
      score,
      limit,
      breakdown,
      labels: DM_COMPLEXITY_LABELS,
      question: "How much operational load does this monster place on the DM?",
      stage: "final-cr-projected-repertoire",
    }),
    inputs: {
      abilityCount: authoredAbilities.length,
      mainActionCount: mainActions.length,
      reactionCount: reactions,
      rechargeCount,
      conditionCount: conditions.length,
      repeatSaveCount,
      escapeCount,
      ongoingCount,
      procedureCount,
      summonCount,
      spellcastingCount,
      areaAbilityCount: areaAbilities.length,
      persistentAreaCount: persistentAreas.length,
      routineMode: routine.mode || null,
      routineReplacementCount: routine.replacements.length,
      routineAdditionCount: routine.additions.length,
      graftSlotWeight: graftSlotWeights.complexity,
      graftSlotWeightsBySlot: graftSlotWeights.bySlot,
    },
    invariants: {
      challengeRatingIndependent: true,
      damageMagnitudeIndependent: true,
      projectedRepertoireRequired: true,
    },
  };
}

export function buildMonsterPressureComplexityProfile({
  targetCr = 0,
  pressureLimit,
  complexityLimit,
  abilityModel = {},
  attackRoutine = null,
  selectedFeatures = [],
} = {}) {
  return {
    version: MONSTER_PRESSURE_COMPLEXITY_VERSION,
    pressure: buildPlayerPressureProfile({
      targetCr,
      limit: pressureLimit,
      abilityModel,
      attackRoutine,
      selectedFeatures,
    }),
    complexity: buildDmComplexityProfile({
      limit: complexityLimit,
      abilityModel,
      attackRoutine,
      selectedFeatures,
    }),
  };
}
