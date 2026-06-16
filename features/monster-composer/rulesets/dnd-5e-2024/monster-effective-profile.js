export const MONSTER_EFFECTIVE_PROFILE_VERSION = "dnd-5e-2024-effective-profile-v0.1";

const CONDITION_SEVERITY_WEIGHTS = Object.freeze({
  minor: 0.35,
  moderate: 0.75,
  major: 1.55,
  severe: 2.65,
});

const CONDITION_CR_THRESHOLDS = Object.freeze([
  { min: 8.5, adjustment: 3 },
  { min: 5.25, adjustment: 2 },
  { min: 2.75, adjustment: 1 },
]);

const COMMON_DAMAGE_TYPES = new Set(["bludgeoning", "piercing", "slashing", "fire", "cold", "lightning", "necrotic", "radiant", "force"]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(Number(value || 0));
}

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

function normalizeLower(value) {
  return cleanString(value).toLowerCase();
}

function getUsageType(ability = {}) {
  return ability.usage?.type || ability.rules?.usage?.type || "passive";
}

function getActionEconomy(ability = {}) {
  return ability.actionEconomy || ability.rules?.actionEconomy || ability.section || "passive";
}

function getFrequencyMultiplier(ability = {}) {
  const usageType = getUsageType(ability);
  const actionEconomy = getActionEconomy(ability);
  if (usageType === "recharge") return 0.62;
  if (usageType === "limited") return 0.75;
  if (usageType === "triggered") return 0.7;
  if (actionEconomy === "reaction") return 0.72;
  if (actionEconomy === "legendaryAction") return 1.1;
  if (actionEconomy === "lairAction") return 0.9;
  if (actionEconomy === "deathTrigger") return 0.35;
  if (actionEconomy === "passive" || ability.section === "trait") return 0.82;
  return 1;
}

function getExpectedTargets(ability = {}) {
  const damageTargets = Number(ability.damage?.entries?.[0]?.expectedTargets || 0);
  if (damageTargets > 0) return damageTargets;
  if (ability.areaEffect?.enabled || ability.targeting?.type === "area") return 2;
  if (ability.targeting?.type === "multiple") return 2;
  return 1;
}

function getCounterplayMultiplier(condition = {}, ability = {}) {
  let multiplier = 1;
  if (condition.escape?.enabled) multiplier -= 0.18;
  if (condition.repeatSave?.enabled) multiplier -= 0.2;
  if (ability.counterplay?.breakCondition) multiplier -= 0.18;
  if (ability.counterplay?.telegraph) multiplier -= 0.1;
  if (ability.counterplay?.positioningAnswer) multiplier -= 0.08;
  if (ability.counterplay?.nonDamageAnswer) multiplier -= 0.1;
  if (/until the end|until the start|next turn/i.test(condition.duration || "")) multiplier -= 0.12;
  return clamp(multiplier, 0.45, 1.25);
}

function buildConditionSource(ability = {}, condition = {}) {
  const severity = normalizeLower(condition.severity || "moderate");
  const baseWeight = CONDITION_SEVERITY_WEIGHTS[severity] || CONDITION_SEVERITY_WEIGHTS.moderate;
  const frequencyMultiplier = getFrequencyMultiplier(ability);
  const targetMultiplier = clamp(getExpectedTargets(ability), 1, 3.5);
  const counterplayMultiplier = getCounterplayMultiplier(condition, ability);
  const weightedPressure = baseWeight * frequencyMultiplier * targetMultiplier * counterplayMultiplier;

  return {
    abilityId: ability.id,
    sourceGraftId: ability.sourceGraftId,
    title: ability.title,
    condition: normalizeLower(condition.name),
    severity,
    duration: condition.duration || "",
    hasEscape: Boolean(condition.escape?.enabled),
    hasRepeatSave: Boolean(condition.repeatSave?.enabled),
    hasBreakCondition: Boolean(ability.counterplay?.breakCondition),
    hasTelegraph: Boolean(ability.counterplay?.telegraph),
    frequencyMultiplier: Number(frequencyMultiplier.toFixed(2)),
    expectedTargets: Number(targetMultiplier.toFixed(2)),
    counterplayMultiplier: Number(counterplayMultiplier.toFixed(2)),
    pressure: Number(weightedPressure.toFixed(2)),
  };
}

function conditionCrAdjustment(controlPressure, severeCount, unresolvedHardControlCount) {
  const thresholdAdjustment = CONDITION_CR_THRESHOLDS.find((item) => controlPressure >= item.min)?.adjustment || 0;
  const severeAdjustment = severeCount >= 2 ? 2 : severeCount >= 1 ? 1 : 0;
  const unresolvedAdjustment = unresolvedHardControlCount >= 2 ? 1 : 0;
  return clamp(Math.max(thresholdAdjustment, severeAdjustment) + unresolvedAdjustment, 0, 4);
}

export function buildConditionImpactProfile({ abilityModel = null, abilities = null } = {}) {
  const abilityList = Array.isArray(abilities) ? abilities : abilityModel?.abilities || [];
  const sources = abilityList.flatMap((ability) =>
    asArray(ability.conditions).map((condition) => buildConditionSource(ability, condition)),
  );
  const severeCount = sources.filter((source) => source.severity === "severe").length;
  const majorCount = sources.filter((source) => ["major", "severe"].includes(source.severity)).length;
  const unresolvedHardControl = sources.filter(
    (source) =>
      ["major", "severe"].includes(source.severity) &&
      !source.hasEscape &&
      !source.hasRepeatSave &&
      !source.hasBreakCondition,
  );
  const repeatedHardControl = sources.filter(
    (source) => ["major", "severe"].includes(source.severity) && source.frequencyMultiplier >= 0.9,
  );
  const controlPressure = sources.reduce((sum, source) => sum + source.pressure, 0);
  const crAdjustment = conditionCrAdjustment(controlPressure, severeCount, unresolvedHardControl.length);
  const issues = [];

  if (repeatedHardControl.length) {
    issues.push({
      severity: "high",
      code: "reliable-hard-control",
      message: "Reliable major or severe conditions can make the monster play above its printed CR.",
      detail: repeatedHardControl.map((source) => source.title).join(", "),
    });
  }

  if (unresolvedHardControl.length) {
    issues.push({
      severity: "high",
      code: "hard-control-without-release-valve",
      message: "Hard control needs an escape, repeat save, break condition, or visible counterplay.",
      detail: unresolvedHardControl.map((source) => source.title).join(", "),
    });
  }

  if (controlPressure >= 7) {
    issues.push({
      severity: "warning",
      code: "high-control-pressure",
      message: "Condition pressure is high enough to affect offensive CR and encounter difficulty.",
      detail: `Control pressure ${controlPressure.toFixed(1)}; CR adjustment +${crAdjustment}.`,
    });
  }

  return {
    version: MONSTER_EFFECTIVE_PROFILE_VERSION,
    sourceCount: sources.length,
    controlPressure: Number(controlPressure.toFixed(2)),
    pressureScore: round(controlPressure),
    crAdjustment,
    majorCount,
    severeCount,
    unresolvedHardControlCount: unresolvedHardControl.length,
    repeatedHardControlCount: repeatedHardControl.length,
    byCondition: sources.reduce((acc, source) => {
      acc[source.condition] = (acc[source.condition] || 0) + 1;
      return acc;
    }, {}),
    sources: sources.sort((a, b) => b.pressure - a.pressure || a.title.localeCompare(b.title)),
    issues,
  };
}

function getDefenseEntries(abilities = []) {
  return abilities
    .map((ability) => ({ ability, defense: ability.defense || ability.rules?.defense || null }))
    .filter((entry) => entry.defense?.enabled);
}

function getTypeDefenseProfile(typeId) {
  if (typeId === "undead") {
    return {
      multiplier: 1.04,
      saveBonus: 0.4,
      sources: ["Undead baseline poison resilience and necrotic durability"],
    };
  }
  if (typeId === "aberration") {
    return {
      multiplier: 1.03,
      saveBonus: 0.2,
      sources: ["Aberration baseline mental/necrotic resilience"],
    };
  }
  if (typeId === "beast") {
    return {
      multiplier: 1.01,
      saveBonus: 0,
      sources: ["Beast baseline poison tolerance"],
    };
  }
  return { multiplier: 1, saveBonus: 0, sources: [] };
}

function getDamageTypeMultiplier(damageTypes = []) {
  const types = uniqueArray(damageTypes).map(normalizeLower);
  if (!types.length) return 0;
  const commonCount = types.filter((type) => COMMON_DAMAGE_TYPES.has(type)).length;
  const physicalCount = types.filter((type) => ["bludgeoning", "piercing", "slashing"].includes(type)).length;
  return Math.min(0.18, commonCount * 0.035 + physicalCount * 0.025);
}

function evaluateDefenseEntry({ ability, defense, baseHp }) {
  const type = defense.type || "custom";
  const uses = Number(defense.uses || 0);
  const value = Number(defense.value || 0);
  const damageTypeMultiplier = getDamageTypeMultiplier(defense.damageTypes);
  let additiveHp = 0;
  let hpMultiplier = 0;
  let acBonus = 0;
  let saveBonus = 0;
  let pressure = 0;
  let complexity = 0;
  const notes = [];

  if (type === "legendaryResistance") {
    additiveHp += Math.max(12, baseHp * 0.055) * Math.max(1, uses || 1);
    saveBonus += Math.min(3, Math.max(1, uses || 1) * 0.8);
    pressure += 2;
    complexity += 1;
    notes.push(`${uses || 1}/day failed-save override`);
  } else if (type === "magicResistance") {
    hpMultiplier += 0.08;
    saveBonus += 2;
    pressure += 1;
    notes.push("Advantage-like protection against spell saves");
  } else if (type === "regeneration") {
    const rounds = defense.breakCondition ? 2.1 : 3;
    additiveHp += Math.max(0, value || Math.max(5, baseHp * 0.04)) * rounds;
    hpMultiplier += defense.breakCondition ? 0.02 : 0.08;
    pressure += defense.breakCondition ? 1 : 2;
    complexity += 1;
    notes.push(defense.breakCondition ? `Regeneration stopped by ${defense.breakCondition}` : "Regeneration without clear stop condition");
  } else if (type === "damageReduction") {
    additiveHp += Math.max(0, value || 3) * 2.25;
    hpMultiplier += damageTypeMultiplier;
    pressure += 1;
    notes.push("Flat damage reduction");
  } else if (type === "parry") {
    acBonus += Math.max(1, value || 2) * 0.65;
    pressure += 1;
    complexity += 1;
    notes.push("Reaction AC bump");
  } else if (type === "defensiveReaction") {
    additiveHp += Math.max(6, value || baseHp * 0.04) * 1.35;
    acBonus += value ? Math.min(2, value * 0.3) : 0.5;
    pressure += 1;
    complexity += 1;
    notes.push("Defensive reaction");
  } else if (type === "evasion" || type === "avoidance") {
    hpMultiplier += 0.07;
    saveBonus += 1.2;
    pressure += 1;
    notes.push("Area/save damage mitigation");
  } else if (type === "turnResistance") {
    hpMultiplier += 0.02;
    saveBonus += 0.5;
    notes.push("Turn resistance");
  } else {
    additiveHp += value ? value * 1.5 : 0;
    hpMultiplier += damageTypeMultiplier;
    if (value || damageTypeMultiplier) notes.push("Custom defensive feature");
  }

  return {
    abilityId: ability.id,
    sourceGraftId: ability.sourceGraftId,
    title: ability.title,
    type,
    uses: uses || null,
    value: value || null,
    damageTypes: uniqueArray(defense.damageTypes),
    breakCondition: defense.breakCondition || "",
    additiveHp: round(additiveHp),
    hpMultiplier: Number(hpMultiplier.toFixed(3)),
    acBonus: Number(acBonus.toFixed(2)),
    saveBonus: Number(saveBonus.toFixed(2)),
    pressure: Number(pressure.toFixed(2)),
    complexity: Number(complexity.toFixed(2)),
    notes,
  };
}

export function buildEffectiveDefenseProfile({
  printedStats = {},
  abilityModel = null,
  abilities = null,
  statMods = {},
  typeId = "undead",
} = {}) {
  const abilityList = Array.isArray(abilities) ? abilities : abilityModel?.abilities || [];
  const baseHp = Math.max(1, Number(printedStats.hp || 1));
  const baseAc = Number(printedStats.ac || 10);
  const typeDefense = getTypeDefenseProfile(typeId);
  const entries = getDefenseEntries(abilityList).map((entry) => evaluateDefenseEntry({ ...entry, baseHp }));
  const additiveHp = entries.reduce((sum, entry) => sum + entry.additiveHp, 0);
  const defenseMultiplier = entries.reduce((sum, entry) => sum + entry.hpMultiplier, 0);
  const fairnessMultiplier = Math.max(0, Number(statMods.fairness || 0)) * 0.01;
  const mobilityAcBonus = Math.floor(Math.max(0, Number(statMods.mobility || 0)) / 4);
  const defenseAcBonus = entries.reduce((sum, entry) => sum + entry.acBonus, 0);
  const saveBonus = typeDefense.saveBonus + entries.reduce((sum, entry) => sum + entry.saveBonus, 0);
  const totalMultiplier = clamp(typeDefense.multiplier - 1 + defenseMultiplier + fairnessMultiplier, 0, 0.65);
  const effectiveHp = round((baseHp + additiveHp) * (1 + totalMultiplier));
  const effectiveAc = round(baseAc + mobilityAcBonus + defenseAcBonus);
  const issues = [];

  const strongDefenseCount = entries.filter((entry) => entry.additiveHp >= Math.max(12, baseHp * 0.08) || entry.hpMultiplier >= 0.08 || entry.acBonus >= 1).length;
  const regenWithoutBreak = entries.filter((entry) => entry.type === "regeneration" && !entry.breakCondition);

  if (strongDefenseCount >= 2) {
    issues.push({
      severity: "warning",
      code: "defense-stack",
      message: "Multiple defensive features increase Effective HP beyond printed HP.",
      detail: entries.map((entry) => entry.title).join(", "),
    });
  }

  if (regenWithoutBreak.length) {
    issues.push({
      severity: "high",
      code: "regeneration-without-counterplay",
      message: "Regeneration should have a clear damage type, condition, or scene action that stops it.",
      detail: regenWithoutBreak.map((entry) => entry.title).join(", "),
    });
  }

  if (effectiveHp >= baseHp * 1.35) {
    issues.push({
      severity: "warning",
      code: "effective-hp-above-printed",
      message: "Effective HP is substantially higher than printed HP.",
      detail: `Printed HP ${baseHp}; Effective HP ${effectiveHp}.`,
    });
  }

  return {
    version: MONSTER_EFFECTIVE_PROFILE_VERSION,
    printedHp: round(baseHp),
    effectiveHp,
    additiveHp: round(additiveHp),
    multiplier: Number((1 + totalMultiplier).toFixed(3)),
    printedAc: round(baseAc),
    effectiveAc,
    acBonus: round(effectiveAc - baseAc),
    saveBonus: Number(saveBonus.toFixed(2)),
    typeDefense,
    sources: entries,
    issues,
    pressureScore: round(entries.reduce((sum, entry) => sum + entry.pressure, 0)),
    complexityScore: round(entries.reduce((sum, entry) => sum + entry.complexity, 0)),
  };
}

export function buildEffectiveMonsterProfile({
  printedStats = {},
  dprProfile = {},
  abilityModel = null,
  statMods = {},
  tempoProfile = {},
  monsterTier = {},
  typeId = "undead",
} = {}) {
  const defensiveProfile = buildEffectiveDefenseProfile({ printedStats, abilityModel, statMods, typeId });
  const conditionProfile = buildConditionImpactProfile({ abilityModel });
  const effectiveAttackBonus = Number(printedStats.attackBonus || 0) + (tempoProfile?.id === "ambusher" ? 1 : 0);
  const effectiveSaveDc = Number(printedStats.saveDc || 0);
  const effectiveDpr3Round = Number(dprProfile.effectiveDpr3Round || printedStats.dpr || 1);
  const effectiveAc = defensiveProfile.effectiveAc;
  const effectiveHp = defensiveProfile.effectiveHp;
  const tempoFactor = 1 + Number(tempoProfile?.pressureMod || 0) * 0.05;
  const defenseFactor =
    effectiveHp / Math.max(1, Number(printedStats.hp || 1)) +
    Math.max(0, effectiveAc - Number(printedStats.ac || 10)) * 0.04 +
    Math.max(0, defensiveProfile.saveBonus) * 0.025;
  const controlFactor = 1 + Math.min(0.35, conditionProfile.controlPressure * 0.025);
  const tierFactor = ["boss", "legendary", "setpiece"].includes(monsterTier?.id) ? 1.05 : 1;
  const combatPowerEstimate = round(
    effectiveHp * effectiveDpr3Round * controlFactor * tierFactor * ((effectiveAc + effectiveAttackBonus - 2) / 13),
  );

  return {
    version: MONSTER_EFFECTIVE_PROFILE_VERSION,
    effectiveAc,
    effectiveHp,
    effectiveAttackBonus,
    effectiveSaveDc,
    printedDpr: printedStats.dpr,
    effectiveDpr3Round,
    burstDpr: dprProfile.burstDpr,
    sustainedDpr: dprProfile.sustainedDpr,
    round1Dpr: dprProfile.rounds?.round1 || 0,
    round2Dpr: dprProfile.rounds?.round2 || 0,
    round3Dpr: dprProfile.rounds?.round3 || 0,
    tempoFactor,
    defenseFactor: Number(defenseFactor.toFixed(3)),
    controlFactor: Number(controlFactor.toFixed(3)),
    combatPowerEstimate,
    defensiveProfile,
    conditionProfile,
    issues: [...defensiveProfile.issues, ...conditionProfile.issues],
  };
}
