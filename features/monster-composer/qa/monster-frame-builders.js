import { MONSTER_FAMILY_PRESETS } from "../data/monster-presets.js";
import {
  ALL_MONSTER_GRAFTS as FEATURES,
  ALL_MONSTER_SOURCES as MONSTER_SOURCES,
} from "../data/monster-content-pack-feed.js";
import { getFeatureBalanceStat, sumFeatureBalanceStats } from "../model/monster-graft-balance-profile.js";
import { SLOTS } from "../monster-composer.workflow.js";
import {
  CREATURE_TYPES,
  DANGERS,
  MONSTER_TIERS,
  ROLES,
  TACTICAL_ROLES,
  TEMPO_PROFILES,
} from "../monster-composer.taxonomies.js";
import {
  buildComplexityProfile,
  buildCounterplayAudit,
  buildPressureProfile,
  getFeatureCounterplayProfile,
  getFeatureMechanicProfile,
  getFeatureSection,
  summarizeMechanicProfiles,
} from "../model/monster-composer.balance.js";
import {
  buildExportJson,
  buildDebugExportJson,
  buildExportReadiness,
  buildExportRunSheet,
  buildExportText,
  buildRenderableStatBlock,
  groupFeaturesBySection,
} from "../model/monster-composer.export.js";
import { buildRunModeSheet } from "../model/monster-composer.run.js";
import { parseMonsterRenderedStatBlock } from "../model/monster-statblock-parser.js";
import { getCompatibilityStatus } from "../model/monster-composer.compatibility.js";
import { evaluateMonsterFrameFit, isMonsterFrameFitAllowed } from "../model/monster-frame-fit.js";
import { hasSelectedSlot } from "../model/monster-composer.selection.js";
import {
  buildMonsterComposerProfileDeltas,
  getMonsterComposerBaselineProfile,
} from "../model/monster-bestiary-baselines.js";
import { validateMonsterGraftRules } from "../model/monster-graft-rules.schema.js";
import { buildMonsterAbilitiesFromFeatures } from "../model/monster-ability-model.js";
import {
  ensureMonsterBasicAttackFeature,
  hasAuthoredAttackPattern,
  isMonsterBasicAttackFeature,
} from "../model/monster-basic-attack.js";
import { buildMonsterFramePowerProfile } from "../model/monster-frame-power.js";
import { buildClosedLoopCrFit } from "../model/monster-cr-fitting.js";
import {
  DEFAULT_MONSTER_RULESET_ID,
  getMonsterRuleset,
  getMonsterRulesetOption,
} from "../rulesets/index.js";
import { asArray, uniqueArray } from "./monster-qa-report.js";

export const REQUIRED_PLAYABLE_SLOTS = Object.freeze(["body", "weakness"]);
export const DEFAULT_FORGE_SLOTS = Object.freeze(["body", "attack", "weakness"]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleCase(value) {
  return String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function abilityMod(score) {
  return Math.floor((score - 10) / 2);
}

function averageDamageText(value) {
  if (value <= 5) return "1d6 + 1";
  if (value <= 8) return "1d8 + 3";
  if (value <= 12) return "2d8 + 3";
  if (value <= 18) return "3d8 + 4";
  if (value <= 26) return "4d10 + 4";
  return "6d10 + 5";
}

function getTier(level) {
  if (level <= 4) return 1;
  if (level <= 10) return 2;
  if (level <= 16) return 3;
  return 4;
}

function getProfForCr(cr) {
  if (cr <= 4) return 2;
  if (cr <= 8) return 3;
  if (cr <= 12) return 4;
  if (cr <= 16) return 5;
  if (cr <= 20) return 6;
  if (cr <= 24) return 7;
  if (cr <= 28) return 8;
  return 9;
}

function xpForCr(cr) {
  const table = {
    0: 10,
    1: 200,
    2: 450,
    3: 700,
    4: 1100,
    5: 1800,
    6: 2300,
    7: 2900,
    8: 3900,
    9: 5000,
    10: 5900,
    11: 7200,
    12: 8400,
    13: 10000,
    14: 11500,
    15: 13000,
    16: 15000,
    17: 18000,
    18: 20000,
    19: 22000,
    20: 25000,
    21: 33000,
    22: 41000,
    23: 50000,
    24: 62000,
    25: 75000,
    26: 90000,
    27: 105000,
    28: 120000,
    29: 135000,
    30: 155000,
  };
  return table[clamp(cr, 0, 30)] || 0;
}

function buildAbilityProfile(typeId, category, roleId, selectedFeatures, prof) {
  const bases = {
    undead: { str: 14, dex: 8, con: 16, int: 5, wis: 10, cha: 8 },
    beast: { str: 12, dex: 16, con: 12, int: 3, wis: 14, cha: 6 },
    aberration: { str: 14, dex: 12, con: 14, int: 12, wis: 14, cha: 10 },
  };
  const scores = { ...(bases[typeId] || bases.undead) };
  const categoryAdjustments = {
    Zombie: { dex: -2, con: 2 },
    Skeleton: { dex: 2, con: -2 },
    Spirit: { str: -2, dex: 4, cha: 2 },
    Spider: { str: -2, dex: 2 },
    Wolf: { str: 2, wis: 1 },
    Bird: { dex: 3, wis: 1 },
    "Flesh Mass": { dex: -2, con: 4 },
    "Eye Horror": { dex: 1, int: 2, wis: 2 },
    Parasite: { dex: 3, con: -1 },
    "Psychic Predator": { int: 3, wis: 2, cha: 2 },
  };
  Object.entries(categoryAdjustments[category] || {}).forEach(([ability, value]) => {
    scores[ability] += value;
  });
  if (roleId === "boss") {
    scores.str += 2;
    scores.con += 2;
    scores.wis += 2;
  }
  if (roleId === "minion") scores.con -= 2;
  selectedFeatures.forEach((feature) => {
    if ((getFeatureBalanceStat(feature, "hp")) >= 12) scores.con += 1;
    if ((getFeatureBalanceStat(feature, "mobility")) >= 1) scores.dex += 1;
    if ((getFeatureBalanceStat(feature, "control")) >= 2) scores.wis += 1;
  });
  const proficientSaves = new Set(["con", "wis"]);
  if (typeId === "beast") proficientSaves.add("dex");
  if (typeId === "aberration") proficientSaves.add("int");
  if (roleId === "boss") {
    proficientSaves.add("str");
    proficientSaves.add("dex");
  }
  function row(key, label) {
    const score = clamp(scores[key], 1, 30);
    const mod = abilityMod(score);
    const save = mod + (proficientSaves.has(key) ? prof : 0);
    return { key, label, score, mod, save };
  }
  return {
    physical: [row("str", "Str"), row("dex", "Dex"), row("con", "Con")],
    mental: [row("int", "Int"), row("wis", "Wis"), row("cha", "Cha")],
  };
}

function buildName(typeId, category, selectedFeatures) {
  const sourceFeature =
    selectedFeatures.find((feature) => feature.slot === "horror") ||
    selectedFeatures.find((feature) => feature.slot === "body") ||
    selectedFeatures[0];
  const source = sourceFeature ? MONSTER_SOURCES.find((item) => item.id === sourceFeature.source)?.label : null;

  if (!source) return `Cruor ${category}`;
  if (source === "Wolf Spiders") return `Brood-Bearing ${category}`;
  if (source === "Wax Death Masks") return `Wax-Faced ${category}`;
  if (source === "Jikininki") return `Grave-Hungry ${category}`;
  if (source === "Decomposition") return `Rot-Swollen ${category}`;
  return `${source} ${titleCase(typeId)}`;
}

function normalizeSelection(selection = {}) {
  return Object.fromEntries(
    Object.entries(selection)
      .map(([slotId, value]) => {
        const ids = asArray(value).filter((id) => FEATURES.some((feature) => feature.id === id && feature.slot === slotId));
        return [slotId, ids.length > 1 ? ids : ids[0]];
      })
      .filter(([, value]) => (Array.isArray(value) ? value.length : Boolean(value))),
  );
}

function getFeaturesFromSelection(selection = {}) {
  const ids = new Set(Object.values(normalizeSelection(selection)).flatMap((value) => asArray(value)));
  return FEATURES.filter((feature) => ids.has(feature.id));
}

function getFrameValue(collection, id, fallbackIndex = 0) {
  return collection.find((item) => item.id === id) || collection[fallbackIndex];
}

export function groupMonsterFeaturesForExport(selectedFeatures = []) {
  const sectionGroups = groupFeaturesBySection(selectedFeatures);
  return {
    sectionGroups,
    traits: sectionGroups.trait || [],
    actions: sectionGroups.action || [],
    bonusActions: sectionGroups.bonusAction || [],
    reactions: sectionGroups.reaction || [],
    legendaryActions: sectionGroups.legendaryAction || [],
    lairActions: sectionGroups.lairAction || [],
    deathEffects: sectionGroups.death || [],
    weaknessFeatures: selectedFeatures.filter((feature) => feature.slot === "weakness"),
  };
}

export function buildMonsterFrameContext({
  selection = {},
  preset = null,
  typeId = preset?.typeId || "undead",
  category = preset?.category || "Zombie",
  roleId = preset?.roleId || "standard",
  sourceId = preset?.source || "decomposition",
  targetCr = preset?.targetCr || 5,
  tacticalRoleId = preset?.tacticalRoleId || "brute",
  monsterTierId = preset?.monsterTierId || "normal",
  tempoProfileId = preset?.tempoProfileId || "standard",
  dangerId = preset?.dangerId || "hard",
  partyLevel = 5,
  rulesetId = DEFAULT_MONSTER_RULESET_ID,
  qaFrameMode = "realistic",
} = {}) {
  const selected = normalizeSelection(selection || preset?.selection || {});
  let selectedFeatures = getFeaturesFromSelection(selected);
  const qaMode = preset?.qaMode || preset?.qaFrameMode || qaFrameMode || "realistic";
  const scalableMainActionGate = ensureScalableMainActionForHighCr({
    selectedFeatures,
    targetCr,
    qaMode,
    category,
    sourceId,
    typeId,
  });
  selectedFeatures = scalableMainActionGate.selectedFeatures;
  const highCrActionRoutine = ensureHighCrActionRoutine({
    selectedFeatures,
    targetCr,
    qaMode,
    category,
    sourceId,
  });
  selectedFeatures = highCrActionRoutine.selectedFeatures;
  const creatureType = getFrameValue(CREATURE_TYPES, typeId);
  const role = getFrameValue(ROLES, roleId, 1);
  const source = getFrameValue(MONSTER_SOURCES, sourceId);
  const danger = getFrameValue(DANGERS, dangerId, 1);
  const tacticalRole = getFrameValue(TACTICAL_ROLES, tacticalRoleId);
  const monsterTier = getFrameValue(MONSTER_TIERS, monsterTierId);
  const tempoProfile = getFrameValue(TEMPO_PROFILES, tempoProfileId, 1);
  const prof = getProfForCr(targetCr);
  const framePowerProfile = buildMonsterFramePowerProfile({
    role,
    tacticalRole,
    monsterTier,
    tempoProfile,
    danger,
    targetCr,
  });
  const baseline = getMonsterComposerBaselineProfile(targetCr, framePowerProfile.baselineTierId, MONSTER_TIERS);
  const baseHp = Math.round(baseline.hp * framePowerProfile.hpMult);
  const baseDpr = Math.round(baseline.dpr * framePowerProfile.dprMult);
  const baseAc = baseline.ac + framePowerProfile.acMod;
  const baseAttack = baseline.attackBonus + framePowerProfile.attackMod;
  const baseDc = baseline.saveDc + framePowerProfile.dcMod;
  const statMods = sumFeatureBalanceStats(selectedFeatures);
  const featureMechanics = selectedFeatures.map((feature) => ({
    id: feature.id,
    title: feature.title,
    ...getFeatureMechanicProfile(feature),
  }));
  const mechanicsSummary = summarizeMechanicProfiles(featureMechanics);
  const counterplayProfiles = selectedFeatures.map((feature) => getFeatureCounterplayProfile(feature));
  const cost = selectedFeatures.reduce((sum, feature) => sum + feature.cost, 0);
  const buildBudget = Math.max(1, framePowerProfile.buildBudget ?? framePowerProfile.budget);
  const pressureLimit = Math.max(1, framePowerProfile.pressureLimit);
  const complexityCap = Math.max(1, framePowerProfile.complexityCap);
  const targetHpValue = Math.max(1, Math.round(baseHp + (statMods.hp || 0)));
  const targetAcValue = clamp(baseAc + (statMods.ac || 0), 10, 28);
  const targetDprValue = Math.max(1, Math.round(baseDpr + (statMods.dpr || 0)));
  const targetDcValue = clamp(baseDc + Math.floor((statMods.control || 0) / 3), 10, 30);
  const targetAttackValue = clamp(baseAttack, 2, 18);
  const activeRuleset = getMonsterRuleset(rulesetId);
  const activeRulesetOption = getMonsterRulesetOption(rulesetId);
  const abilityModel = buildMonsterAbilitiesFromFeatures(selectedFeatures);
  const lowCrHardControlProfile = buildLowCrHardControlGateProfile({
    targetCr,
    selectedFeatures,
    qaMode,
  });
  const crFit = buildClosedLoopCrFit({
    activeRuleset,
    targetCr,
    typeId,
    category,
    roleId,
    selectedFeatures,
    baseline,
    abilityModel,
    statMods,
    tempoProfile,
    monsterTier,
    mechanicsSummary,
    speed: creatureType.defaults.speed,
    targetHp: targetHpValue,
    targetAc: targetAcValue,
    targetDpr: targetDprValue,
    targetAttackBonus: targetAttackValue,
    targetSaveDc: targetDcValue,
    maxPasses: 4,
    tolerance: 1,
  });
  const dndRules = crFit.dndRules;
  const printedStats = crFit.printedStats;
  const hp = printedStats.hp;
  const ac = printedStats.ac;
  const dpr = printedStats.dpr;
  const dc = printedStats.saveDc;
  const attack = printedStats.attackBonus;
  const dprProfile = crFit.dprProfile;
  const effectiveProfile = crFit.effectiveProfile;
  const crValidation = crFit.crValidation;
  const crFitProfile = crFit.fitProfile;
  const pressureComplexityAbilityModel = buildMonsterAbilitiesFromFeatures(selectedFeatures, { targetCr });
  const pressureProfile = buildPressureProfile({
    targetCr,
    limit: pressureLimit,
    abilityModel: pressureComplexityAbilityModel,
    attackRoutine: dprProfile?.attackRoutine || null,
    selectedFeatures,
  });
  const complexityProfile = buildComplexityProfile({
    limit: complexityCap,
    abilityModel: pressureComplexityAbilityModel,
    attackRoutine: dprProfile?.attackRoutine || null,
    selectedFeatures,
  });
  const pressure = pressureProfile.score;
  const complexity = complexityProfile.score;
  const counterplayAudit = buildCounterplayAudit({ selected, roleId, monsterTier, pressureProfile, complexityProfile, mechanicsSummary, counterplayProfiles });
  const profileDeltas = buildMonsterComposerProfileDeltas(printedStats, effectiveProfile, baseline);
  const estimatedCr = crValidation.estimatedCr;
  const name = preset?.label || buildName(typeId, category, selectedFeatures);
  const rulesContext = { typeId, creatureType: creatureType.label, category, categoryNoun: String(category || "monster").toLowerCase() };
  const baselinePower = Math.round(baseline.hp * baseline.dpr * ((baseline.ac + baseline.attackBonus - 2) / 13));
  const warnings = [];
  framePowerProfile.diagnostics.forEach((diagnostic) => {
    warnings.push(`Frame Power: ${diagnostic.message}${diagnostic.detail ? ` ${diagnostic.detail}` : ""}`);
  });
  crFitProfile.diagnostics
    .filter((diagnostic) => diagnostic.severity !== "info")
    .forEach((diagnostic) => {
      warnings.push(`CR Fitting: ${diagnostic.message}${diagnostic.detail ? ` ${diagnostic.detail}` : ""}`);
    });
  if (lowCrHardControlProfile.overLimit) {
    warnings.push(`Low-CR Hard Control: ${lowCrHardControlProfile.hardControlCount} reliable hard-control features selected at CR ${targetCr}.`);
  }
  if (scalableMainActionGate.profile?.needsFallback || scalableMainActionGate.fallbackFeature) {
    warnings.push("Basic Attack Fallback: generated a baseline attack because no Attack Pattern graft was selected.");
  }
  if (highCrActionRoutine.profile?.routineAdded) {
    warnings.push("High-CR Action Routine: generated Multiattack because this high-CR frame relied on a single scalable attack.");
  }
  if (pressure > pressureLimit) warnings.push(`Player-facing Pressure exceeds the CR ${targetCr} guidance by ${pressure - pressureLimit}.`);
  if (complexity > complexityCap) warnings.push(`DM Complexity exceeds the handling guidance by ${complexity - complexityCap}.`);
  if (!hasSelectedSlot(selected, "weakness")) warnings.push("No Weakness / Tell selected.");
  counterplayAudit.issues.forEach((issue) => warnings.push(`Counterplay Audit: ${issue.label}. ${issue.detail}`));

  if (effectiveProfile.effectiveDpr3Round > baseline.dpr * 1.35 && monsterTier.id === "normal") {
    warnings.push("Effective DPR is above the normal CR baseline once control, mobility, and tempo are considered. Consider Elite/Boss tier or lower offensive pressure.");
  }
  if (effectiveProfile.burstDpr > baseline.dpr * 1.75) {
    warnings.push("Burst DPR spike is high. Add a recharge, telegraph, setup requirement, or reduce opening damage.");
  }
  crValidation.issues.forEach((issue) => {
    warnings.push(`CR Validator: ${issue.message}${issue.detail ? ` ${issue.detail}` : ""}`);
  });
  dndRules.validation.issues.forEach((issue) => {
    warnings.push(`D&D Rules: ${issue.message}${issue.detail ? ` ${issue.detail}` : ""}`);
  });
  abilityModel.validation.errors.forEach((issue) => {
    warnings.push(`Ability Model: ${issue.title}. ${issue.message}`);
  });
  selectedFeatures.forEach((feature) => {
    validateMonsterGraftRules(feature).issues
      .filter((issue) => issue.severity === "error")
      .forEach((issue) => {
        warnings.push(`Rules Schema: ${feature.title}. ${issue.message}`);
      });
  });

  const computed = {
    tier: getTier(partyLevel),
    targetCr,
    tacticalRole,
    monsterTier,
    tempoProfile,
    rulesetId: activeRuleset.id,
    ruleset: activeRulesetOption,
    rulesContext,
    baseline,
    printedStats,
    effectiveProfile,
    profileDeltas,
    bestiaryBaselineAudit: { issues: [] },
    framePowerProfile,
    lowCrHardControlProfile,
    scalableMainActionGateProfile: scalableMainActionGate.profile,
    highCrActionRoutineProfile: highCrActionRoutine.profile,
    crFitProfile,
    dprProfile,
    crValidation,
    pressureProfile,
    complexityProfile,
    counterplayAudit,
    counterplayProfiles,
    featureMechanics,
    mechanicsSummary,
    abilityModel,
    pressureComplexityAbilityModel,
    baselinePower,
    effectivePower: effectiveProfile.combatPowerEstimate,
    prof,
    rulesProfile: dndRules.rulesProfile,
    rulesValidation: dndRules.validation,
    abilityProfile: dndRules.abilityProfile,
    hpFormula: dndRules.rulesProfile.hp.formula,
    hp,
    ac,
    dpr,
    dc,
    attack,
    budget: buildBudget,
    pressureLimit,
    buildBudget,
    cost,
    pressure,
    complexity,
    complexityCap,
    estimatedCr,
    name,
    warnings: uniqueArray(warnings),
    balanceRecommendations: [],
    damageText: dndRules.damage.defaultAttack.text,
    statMods,
  };
  const abilityProfile = dndRules.abilityProfile;
  const groups = groupMonsterFeaturesForExport(selectedFeatures);
  const hasLegendaryActions = roleId === "boss";
  const xp = xpForCr(computed.targetCr).toLocaleString("en-US");

  return {
    preset,
    selected,
    selectedFeatures,
    typeId,
    category,
    roleId,
    sourceId,
    targetCr,
    tacticalRoleId,
    monsterTierId,
    tempoProfileId,
    dangerId,
    creatureType,
    role,
    source,
    danger,
    tacticalRole,
    monsterTier,
    tempoProfile,
    computed,
    abilityProfile,
    hasLegendaryActions,
    xp,
    ...groups,
  };
}

export function buildPresetFrameContext(preset) {
  return buildMonsterFrameContext({ preset, selection: preset?.selection || {} });
}

export function buildCoreScratchFrames() {
  const sourceById = new Map(MONSTER_SOURCES.map((source) => [source.id, source]));
  return [
    { id: "scratch-zombie-decomposition", typeId: "undead", category: "Zombie", roleId: "standard", sourceId: sourceById.has("decomposition") ? "decomposition" : MONSTER_SOURCES[0]?.id, targetCr: 5, tacticalRoleId: "brute", monsterTierId: "normal", tempoProfileId: "standard", dangerId: "hard" },
    { id: "scratch-spider-wolf-spiders", typeId: "beast", category: "Spider", roleId: "standard", sourceId: sourceById.has("wolf-spiders") ? "wolf-spiders" : MONSTER_SOURCES[0]?.id, targetCr: 5, tacticalRoleId: "lurker", monsterTierId: "normal", tempoProfileId: "ambusher", dangerId: "hard" },
    { id: "scratch-spider-boss", typeId: "beast", category: "Spider", roleId: "boss", sourceId: sourceById.has("wolf-spiders") ? "wolf-spiders" : MONSTER_SOURCES[0]?.id, targetCr: 7, tacticalRoleId: "controller", monsterTierId: "boss", tempoProfileId: "fast", dangerId: "hard" },
    { id: "scratch-spirit-jikininki", typeId: "undead", category: "Spirit", roleId: "standard", sourceId: sourceById.has("jikininki") ? "jikininki" : MONSTER_SOURCES[0]?.id, targetCr: 6, tacticalRoleId: "lurker", monsterTierId: "normal", tempoProfileId: "ambusher", dangerId: "hard" },
  ];
}


function normalizeLower(value) {
  return String(value || "").trim().toLowerCase();
}

function getFeatureConditionSeverity(feature = {}) {
  return normalizeLower(feature.rules?.condition?.severity || feature.condition?.severity || "");
}

function isReliableHardControlFeature(feature = {}) {
  const severity = getFeatureConditionSeverity(feature);
  if (!["major", "severe"].includes(severity)) return false;
  const actionEconomy = normalizeLower(feature.rules?.actionEconomy || feature.section || "passive");
  const usageType = normalizeLower(feature.rules?.usage?.type || "passive");
  const control = Number(getFeatureBalanceStat(feature, "control"));
  const repeatedUse = ["action", "bonusaction", "reaction"].includes(actionEconomy) && !["limited", "deathtrigger"].includes(usageType);
  return Boolean(repeatedUse || control >= 3);
}

function shouldApplyLowCrHardControlGate(frame = {}) {
  const cr = Number(frame.targetCr || 0);
  if (cr > 3) return false;
  if (frame.qaFrameMode === "stress") return false;
  return true;
}

function applyLowCrHardControlGate(candidates = [], selectedFeatures = [], frame = {}) {
  if (!shouldApplyLowCrHardControlGate(frame)) return candidates;
  const selectedHardControls = selectedFeatures.filter((feature) => isReliableHardControlFeature(feature));
  if (!selectedHardControls.length) return candidates;
  const filtered = candidates.filter((feature) => !isReliableHardControlFeature(feature));
  return filtered.length ? filtered : candidates;
}

export function buildLowCrHardControlGateProfile({ targetCr = 0, selectedFeatures = [], qaMode = "realistic" } = {}) {
  const hardControlFeatures = asArray(selectedFeatures)
    .filter((feature) => isReliableHardControlFeature(feature))
    .map((feature) => ({
      id: feature.id,
      title: feature.title,
      slot: feature.slot,
      source: feature.source,
      condition: asArray(feature.rules?.condition?.names).join(", "),
      severity: getFeatureConditionSeverity(feature),
      actionEconomy: feature.rules?.actionEconomy || feature.section || "passive",
      control: Number(getFeatureBalanceStat(feature, "control")),
    }));
  const lowCr = Number(targetCr || 0) <= 3;
  const stackLimit = lowCr ? 1 : 2;
  const overLimit = lowCr && qaMode !== "stress" && hardControlFeatures.length > stackLimit;
  return {
    version: "low-cr-hard-control-gate-v1.28",
    targetCr: Number(targetCr || 0),
    qaMode,
    lowCr,
    stackLimit,
    hardControlCount: hardControlFeatures.length,
    hardControlFeatures,
    overLimit,
    status: overLimit ? "review" : "pass",
  };
}

function getDamageEntriesFromRules(rules = {}) {
  const damage = rules.damage || null;
  if (!damage || damage.mode === "none") return [];
  if (Array.isArray(damage.parts) && damage.parts.length) return damage.parts.filter((part) => part && part.mode !== "none");
  return [damage];
}

function isScalableDamageEntry(damage = {}) {
  const mode = normalizeLower(damage.mode || "");
  const scale = normalizeLower(damage.scale || "standard");
  const budgetShare = Number(damage.budgetShare || 0);
  const budgetRole = normalizeLower(damage.budgetRole || "");
  if (!["mainattack", "attack", "primary"].includes(budgetRole)) return false;
  if (["computed", "budget"].includes(mode)) {
    if (budgetShare >= 0.65) return true;
    return !["minor", "light"].includes(scale);
  }
  return false;
}

export function isScalableMainActionFeature(feature = {}) {
  const rules = feature.rules || {};
  if (normalizeLower(rules.actionEconomy || feature.section || "") !== "action") return false;
  if (rules.multiattack?.enabled) return true;
  return getDamageEntriesFromRules(rules).some(isScalableDamageEntry);
}

export function buildScalableMainActionGateProfile({ targetCr = 0, selectedFeatures = [], qaMode = "realistic" } = {}) {
  const highCr = Number(targetCr || 0) >= 5;
  const authoredFeatures = asArray(selectedFeatures).filter(
    (feature) => !isMonsterBasicAttackFeature(feature),
  );
  const attackPatterns = authoredFeatures
    .filter((feature) => feature.slot === "attack")
    .map((feature) => ({
      id: feature.id,
      title: feature.title,
      slot: feature.slot,
      source: feature.source,
      scalable: isScalableMainActionFeature(feature),
      damageModes: getDamageEntriesFromRules(feature.rules || {}).map((damage) => damage.mode || "unknown"),
      damageScales: getDamageEntriesFromRules(feature.rules || {}).map((damage) => damage.scale || "standard"),
      budgetRoles: getDamageEntriesFromRules(feature.rules || {}).map((damage) => damage.budgetRole || "none"),
    }));
  const scalableFeatures = attackPatterns.filter((feature) => feature.scalable);
  const needsFallback = !hasAuthoredAttackPattern(authoredFeatures);
  return {
    version: "scalable-main-action-gate-v1.32-basic-fallback",
    targetCr: Number(targetCr || 0),
    qaMode,
    highCr,
    actionCount: attackPatterns.length,
    attackPatternCount: attackPatterns.length,
    scalableActionCount: scalableFeatures.length,
    actionFeatures: attackPatterns,
    needsFallback,
    status: needsFallback ? "fallback-required" : "pass",
  };
}

function ensureScalableMainActionForHighCr({ selectedFeatures = [], targetCr = 0, qaMode = "realistic", category, sourceId, typeId } = {}) {
  const profile = buildScalableMainActionGateProfile({ targetCr, selectedFeatures, qaMode });
  const compilation = ensureMonsterBasicAttackFeature(selectedFeatures, {
    category,
    sourceId,
    typeId,
    targetCr,
  });
  return {
    selectedFeatures: compilation.features,
    profile: {
      ...profile,
      status: compilation.profile.status,
      fallbackFeature: compilation.profile.fallbackFeature || null,
    },
    fallbackFeature: compilation.fallbackFeature,
  };
}

function clonePrimaryDamageForRoutine(feature = {}) {
  const rules = feature.rules || {};
  const damage = rules.damage || {};
  const primary = Array.isArray(damage.parts) && damage.parts.length ? damage.parts[0] : damage;
  const types = asArray(primary.types || primary.type || damage.types || damage.type);
  return {
    mode: "budget",
    budgetRole: "mainAttack",
    modifierPolicy: primary.modifierPolicy || damage.modifierPolicy || "sameAsAttack",
    abilityBasis: primary.abilityBasis || damage.abilityBasis || rules.resolution?.abilityBasis,
    types: types.length ? types : ["bludgeoning"],
    scale: primary.scale || damage.scale || "standard",
    budgetShare: primary.budgetShare ?? damage.budgetShare ?? 1,
    expectedTargets: primary.expectedTargets || damage.expectedTargets || 1,
    parts: [],
  };
}

function getHighCrRoutineAttackCount(targetCr = 0) {
  const cr = Number(targetCr || 0);
  if (cr >= 21) return 3;
  return 2;
}

function buildHighCrMultiattackRoutineFeature({ baseFeature = null, category = "Monster", sourceId = "frame", targetCr = 0 } = {}) {
  const noun = String(category || "Monster").trim() || "Monster";
  const baseTitle = String(baseFeature?.title || `${noun} Strike`).trim();
  const baseRules = baseFeature?.rules || {};
  const count = getHighCrRoutineAttackCount(targetCr);
  return {
    id: `frame-high-cr-routine-cr-${targetCr}-${String(baseFeature?.id || "strike").replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}`,
    title: "Multiattack",
    slot: "attack",
    section: "action",
    source: sourceId || "frame",
    typeBias: [],
    roleBias: [],
    cost: 0,
    complexity: 0,
    stats: { dpr: 0 },
    synthetic: true,
    generatedBy: "high-cr-action-routine-guard-v1.36-r2",
    rules: {
      schemaVersion: "monster-graft-rules-v1.16",
      section: "action",
      actionEconomy: "action",
      usage: { type: "atWill" },
      resolution: baseRules.resolution || {
        type: "attackRoll",
        attackType: "melee",
        abilityBasis: "str",
        bonus: "monster",
        reach: "5 ft.",
      },
      targeting: baseRules.targeting || { type: "single", targets: "one target" },
      multiattack: {
        enabled: true,
        mode: "fixed",
        count,
        attacks: [{ ref: baseFeature?.id || baseTitle, label: baseTitle, count }],
      },
      damage: clonePrimaryDamageForRoutine(baseFeature || {}),
      condition: null,
      counterplay: {
        telegraph: false,
        breakCondition: false,
        positioningAnswer: true,
        nonDamageAnswer: false,
      },
      text: {
        effect: `The monster makes ${count === 2 ? "two" : "three"} ${baseTitle} attacks.`,
      },
      migration: {
        source: "frame-generated-high-cr-routine",
        isStructured: true,
        convertedFrom: "high-cr-action-routine-guard",
      },
    },
    summary: "Generated high-CR action routine used when a high-CR frame relies on a single scalable attack that cannot preserve the target CR by itself.",
    mechanics: `The monster makes ${count === 2 ? "two" : "three"} ${baseTitle} attacks.`,
    counterplay: "Standard positioning, armor class, and action denial counterplay apply.",
  };
}

function shouldAddHighCrActionRoutine({ selectedFeatures = [], targetCr = 0, qaMode = "realistic" } = {}) {
  const cr = Number(targetCr || 0);
  if (qaMode === "stress" || cr < 16) return false;
  if (selectedFeatures.some((feature) => feature.rules?.multiattack?.enabled)) return false;
  const actionFeatures = selectedFeatures.filter((feature) => normalizeLower(feature.rules?.actionEconomy || feature.section || "") === "action");
  const scalableActions = actionFeatures.filter((feature) => isScalableMainActionFeature(feature));
  return scalableActions.length === 1;
}

function ensureHighCrActionRoutine({ selectedFeatures = [], targetCr = 0, qaMode = "realistic", category, sourceId } = {}) {
  if (!shouldAddHighCrActionRoutine({ selectedFeatures, targetCr, qaMode })) {
    return {
      selectedFeatures,
      profile: {
        version: "high-cr-action-routine-guard-v1.36-r2",
        targetCr: Number(targetCr || 0),
        qaMode,
        status: "not-needed",
        routineAdded: false,
      },
      routineFeature: null,
    };
  }
  const baseFeature = selectedFeatures.find((feature) => normalizeLower(feature.rules?.actionEconomy || feature.section || "") === "action" && isScalableMainActionFeature(feature));
  const routineFeature = buildHighCrMultiattackRoutineFeature({ baseFeature, category, sourceId, targetCr });
  return {
    selectedFeatures: [routineFeature, ...selectedFeatures],
    profile: {
      version: "high-cr-action-routine-guard-v1.36-r2",
      targetCr: Number(targetCr || 0),
      qaMode,
      status: "routine-added",
      routineAdded: true,
      routineFeature: { id: routineFeature.id, title: routineFeature.title },
      baseFeature: baseFeature ? { id: baseFeature.id, title: baseFeature.title } : null,
      attackCount: getHighCrRoutineAttackCount(targetCr),
    },
    routineFeature,
  };
}

export function pickForgeCandidate(candidates, slotId, remainingBudget, roleId, frame = {}) {
  if (!candidates.length) return null;
  const coreSlots = new Set(REQUIRED_PLAYABLE_SLOTS);
  const sorted = [...candidates].sort((a, b) => {
    const weaknessBiasA = a.slot === "weakness" ? -8 : 0;
    const weaknessBiasB = b.slot === "weakness" ? -8 : 0;
    const lairBiasA = roleId === "boss" && a.slot === "lair" ? -2 : 0;
    const lairBiasB = roleId === "boss" && b.slot === "lair" ? -2 : 0;
    const aFrameFit = evaluateMonsterFrameFit(a, frame);
    const bFrameFit = evaluateMonsterFrameFit(b, frame);
    return (
      Math.max(0, a.cost) + a.complexity * 0.45 + aFrameFit.rankModifier + weaknessBiasA + lairBiasA -
      (Math.max(0, b.cost) + b.complexity * 0.45 + bFrameFit.rankModifier + weaknessBiasB + lairBiasB)
    );
  });
  if (slotId === "weakness") return sorted[0];
  const affordable = sorted.find((feature) => Math.max(0, feature.cost) <= remainingBudget);
  if (affordable) return affordable;
  if (coreSlots.has(slotId)) return sorted[0];
  return null;
}

function featureMatchesSource(feature, sourceIdOrIds) {
  const sourceIds = Array.isArray(sourceIdOrIds) ? sourceIdOrIds : [sourceIdOrIds];
  return sourceIds.filter(Boolean).includes(feature.source);
}

function featureMatchesFrame(feature, sourceId, typeId, roleId, slotId = null, frame = null) {
  const sourceMatch = featureMatchesSource(feature, sourceId);
  const typeMatch = !feature.typeBias?.length || feature.typeBias.includes(typeId);
  const roleMatch = !feature.roleBias?.length || feature.roleBias.includes(roleId);
  const slotMatch = !slotId || feature.slot === slotId;
  const frameFitMatch = !frame || isMonsterFrameFitAllowed(feature, frame, { includeInferred: false });
  return sourceMatch && typeMatch && roleMatch && slotMatch && frameFitMatch;
}

export function getForgeCandidatesForFrame(frame = {}, { slotId = null, selectedFeatures = [], includeCompatibility = true } = {}) {
  const candidates = FEATURES.filter((feature) => {
    if (!featureMatchesFrame(feature, frame.sourceId, frame.typeId, frame.roleId, slotId, frame)) return false;
    if (!includeCompatibility) return true;
    const status = getCompatibilityStatus(feature, selectedFeatures, frame.typeId, frame.category, { activePreset: null });
    return ["compatible", "soft"].includes(status.kind);
  });
  return applyLowCrHardControlGate(candidates, selectedFeatures, frame);
}

function orderForgeSlots(slots = DEFAULT_FORGE_SLOTS) {
  const requested = asArray(slots);
  return uniqueArray([
    ...DEFAULT_FORGE_SLOTS.filter((slotId) => requested.includes(slotId)),
    ...requested.filter((slotId) => !DEFAULT_FORGE_SLOTS.includes(slotId)),
  ]);
}

function getCompatibleForgeCandidates(frame, slotId, selectedFeatures = []) {
  const candidates = FEATURES.filter((feature) => {
    if (!featureMatchesFrame(feature, frame.sourceId, frame.typeId, frame.roleId, slotId, frame)) return false;
    const status = getCompatibilityStatus(feature, selectedFeatures, frame.typeId, frame.category, { activePreset: null });
    return ["compatible", "soft"].includes(status.kind);
  });
  return applyLowCrHardControlGate(candidates, selectedFeatures, frame);
}

export function forgeMonsterSelectionDetailed(frame, { slots = DEFAULT_FORGE_SLOTS, allowRelaxedCoreFallback = true } = {}) {
  const selected = {};
  const relaxedSlots = [];
  const skippedSlots = [];
  let selectedFeatures = [];
  const framePowerProfile = buildMonsterFramePowerProfile({
    role: getFrameValue(ROLES, frame.roleId, 1),
    tacticalRole: getFrameValue(TACTICAL_ROLES, frame.tacticalRoleId),
    monsterTier: getFrameValue(MONSTER_TIERS, frame.monsterTierId),
    tempoProfile: getFrameValue(TEMPO_PROFILES, frame.tempoProfileId, 1),
    danger: getFrameValue(DANGERS, frame.dangerId, 1),
    targetCr: Number(frame.targetCr || 0),
  });
  let remainingBudget = Math.max(1, Number((framePowerProfile.buildBudget ?? framePowerProfile.budget) || 1));

  orderForgeSlots(slots).forEach((slotId) => {
    const strictCandidates = getCompatibleForgeCandidates(frame, slotId, selectedFeatures);
    let candidates = strictCandidates;
    let relaxed = false;

    if (!candidates.length && allowRelaxedCoreFallback && REQUIRED_PLAYABLE_SLOTS.includes(slotId)) {
      candidates = getForgeCandidatesForFrame(frame, { slotId, selectedFeatures, includeCompatibility: false });
      relaxed = candidates.length > 0;
    }

    const picked = pickForgeCandidate(candidates, slotId, remainingBudget, frame.roleId, frame);
    if (!picked) {
      skippedSlots.push(slotId);
      return;
    }

    selected[slotId] = picked.id;
    if (relaxed) relaxedSlots.push(slotId);
    selectedFeatures = getFeaturesFromSelection(selected);
    remainingBudget -= Math.max(0, picked.cost || 0);
  });

  return {
    selected,
    meta: {
      relaxedSlots,
      skippedSlots,
      missingRequiredSlots: REQUIRED_PLAYABLE_SLOTS.filter((slotId) => !hasSelectedSlot(selected, slotId)),
    },
  };
}

export function buildForgeCoverage(frame = {}, { slots = DEFAULT_FORGE_SLOTS } = {}) {
  const countsBySlot = {};
  const eligibleCountsBySlot = {};
  const candidateIdsBySlot = {};
  const eligibleCandidateIdsBySlot = {};
  asArray(slots).forEach((slotId) => {
    const rawCandidates = getForgeCandidatesForFrame(frame, { slotId, includeCompatibility: false });
    const eligibleCandidates = getCompatibleForgeCandidates(frame, slotId, []);
    countsBySlot[slotId] = rawCandidates.length;
    eligibleCountsBySlot[slotId] = eligibleCandidates.length;
    candidateIdsBySlot[slotId] = rawCandidates.slice(0, 12).map((feature) => feature.id);
    eligibleCandidateIdsBySlot[slotId] = eligibleCandidates.slice(0, 12).map((feature) => feature.id);
  });

  const strictForge = forgeMonsterSelectionDetailed(frame, { slots, allowRelaxedCoreFallback: false });
  const missingRequiredSlots = strictForge.meta.missingRequiredSlots;
  return {
    slots: asArray(slots),
    countsBySlot,
    eligibleCountsBySlot,
    candidateIdsBySlot,
    eligibleCandidateIdsBySlot,
    simulatedSelected: strictForge.selected,
    missingRequiredSlots,
    requiredSlotsMet: missingRequiredSlots.length === 0,
    totalCandidates: Object.values(countsBySlot).reduce((sum, value) => sum + Number(value || 0), 0),
    totalEligibleCandidates: Object.values(eligibleCountsBySlot).reduce((sum, value) => sum + Number(value || 0), 0),
  };
}

export function forgeMonsterSelection(frame, { slots = DEFAULT_FORGE_SLOTS, allowRelaxedCoreFallback = true } = {}) {
  return forgeMonsterSelectionDetailed(frame, { slots, allowRelaxedCoreFallback }).selected;
}

export function buildExportArtifacts(context, { includeDebugExport = true } = {}) {
  const args = {
    name: context.computed.name,
    creatureType: context.creatureType,
    category: context.category,
    role: context.role,
    danger: context.danger,
    source: context.source,
    computed: context.computed,
    abilityProfile: context.abilityProfile,
    traits: context.traits,
    actions: context.actions,
    bonusActions: context.bonusActions,
    reactions: context.reactions,
    legendaryActions: context.legendaryActions,
    lairActions: context.lairActions,
    deathEffects: context.deathEffects,
    selectedFeatures: context.selectedFeatures,
    hasLegendaryActions: context.hasLegendaryActions,
    activePreset: context.preset,
    xp: context.xp,
  };
  const exportText = buildExportText(args);
  const exportJson = buildExportJson(args);
  const debugExportJson = includeDebugExport ? buildDebugExportJson(args) : "";
  const statBlock = buildRenderableStatBlock(args);
  const statBlockParse = parseMonsterRenderedStatBlock({
    exportText,
    statBlock,
    selectedFeatures: context.selectedFeatures,
    computed: context.computed,
  });
  return {
    exportText,
    exportJson,
    debugExportJson,
    statBlock,
    statBlockParse,
    exportReadiness: buildExportReadiness({
      computed: context.computed,
      selected: context.selected,
      selectedFeatures: context.selectedFeatures,
      traits: context.traits,
      actions: context.actions,
      weaknessFeatures: context.weaknessFeatures,
      deathEffects: context.deathEffects,
      lairActions: context.lairActions,
      statBlockParse,
    }),
    exportRunSheet: buildExportRunSheet({
      computed: context.computed,
      selectedFeatures: context.selectedFeatures,
      traits: context.traits,
      actions: context.actions,
      bonusActions: context.bonusActions,
      reactions: context.reactions,
      deathEffects: context.deathEffects,
      lairActions: context.lairActions,
    }),
    runModeSheet: buildRunModeSheet({
      name: context.computed.name,
      creatureType: context.creatureType,
      category: context.category,
      role: context.role,
      danger: context.danger,
      computed: context.computed,
      selectedFeatures: context.selectedFeatures,
      actions: context.actions,
      bonusActions: context.bonusActions,
      reactions: context.reactions,
      lairActions: context.lairActions,
      deathEffects: context.deathEffects,
    }),
  };
}

export { FEATURES, MONSTER_FAMILY_PRESETS, MONSTER_SOURCES, SLOTS };
