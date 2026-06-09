import { MONSTER_GRAFTS as FEATURES } from "../data/monster-grafts.js";
import { MONSTER_FAMILY_PRESETS } from "../data/monster-presets.js";
import { MONSTER_SOURCES } from "../data/monster-sources.js";
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
  buildExportReadiness,
  buildExportRunSheet,
  buildExportText,
  groupFeaturesBySection,
} from "../model/monster-composer.export.js";
import { buildRunModeSheet } from "../model/monster-composer.run.js";
import { getCompatibilityStatus } from "../model/monster-composer.compatibility.js";
import { evaluateMonsterFrameFit, isMonsterFrameFitAllowed } from "../model/monster-frame-fit.js";
import { hasSelectedSlot } from "../model/monster-composer.selection.js";
import { asArray, uniqueArray } from "./monster-qa-report.js";

export const REQUIRED_PLAYABLE_SLOTS = Object.freeze(["body", "attack", "weakness"]);

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

function getExpectedAttackBonus(cr) {
  return Math.round(3.5 + cr / 2);
}

function getExpectedSaveDc(cr) {
  return Math.round(11.5 + cr / 2);
}

function getExpectedAc(cr) {
  return Math.round(13 + cr / 3);
}

function getExpectedHp(cr, tierId = "normal") {
  const base = cr < 20 ? 16 + 16 * cr : 368 + 48 * (cr - 20);
  const tier = MONSTER_TIERS.find((item) => item.id === tierId) || MONSTER_TIERS[0];
  return Math.max(1, Math.round(base * tier.hpMult));
}

function getExpectedDpr(cr, tierId = "normal") {
  const legendaryLike = tierId === "legendary" || tierId === "boss" || tierId === "setpiece";
  const base =
    cr < 20
      ? legendaryLike
        ? 7.5 + 7.5 * cr
        : 6 + 6 * cr
      : legendaryLike
        ? 165 + 15 * (cr - 20)
        : 132 + 12 * (cr - 20);
  const tier = MONSTER_TIERS.find((item) => item.id === tierId) || MONSTER_TIERS[0];
  return Math.max(1, Math.round(base * (legendaryLike ? 1 : tier.dprMult)));
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

function getBaselineProfile(cr, tierId) {
  return {
    ac: getExpectedAc(cr),
    hp: getExpectedHp(cr, tierId),
    dpr: getExpectedDpr(cr, tierId),
    attackBonus: getExpectedAttackBonus(cr),
    saveDc: getExpectedSaveDc(cr),
  };
}

function buildProfileDeltas(printedStats, effectiveProfile, baseline) {
  return {
    acDelta: printedStats.ac - baseline.ac,
    hpDelta: printedStats.hp - baseline.hp,
    dprDelta: printedStats.dpr - baseline.dpr,
    effectiveDprDelta: effectiveProfile.effectiveDpr3Round - baseline.dpr,
    attackDelta: printedStats.attackBonus - baseline.attackBonus,
    dcDelta: printedStats.saveDc - baseline.saveDc,
  };
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
    if ((feature.stats?.hp || 0) >= 12) scores.con += 1;
    if ((feature.stats?.mobility || 0) >= 1) scores.dex += 1;
    if ((feature.stats?.control || 0) >= 2) scores.wis += 1;
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
} = {}) {
  const selected = normalizeSelection(selection || preset?.selection || {});
  const selectedFeatures = getFeaturesFromSelection(selected);
  const creatureType = getFrameValue(CREATURE_TYPES, typeId);
  const role = getFrameValue(ROLES, roleId, 1);
  const source = getFrameValue(MONSTER_SOURCES, sourceId);
  const danger = getFrameValue(DANGERS, dangerId, 1);
  const tacticalRole = getFrameValue(TACTICAL_ROLES, tacticalRoleId);
  const monsterTier = getFrameValue(MONSTER_TIERS, monsterTierId);
  const tempoProfile = getFrameValue(TEMPO_PROFILES, tempoProfileId, 1);
  const prof = getProfForCr(targetCr);
  const baseline = getBaselineProfile(targetCr, monsterTier.id);
  const baseHp = Math.round(baseline.hp * role.hpMult * tacticalRole.hpMult);
  const baseDpr = Math.round(baseline.dpr * role.dprMult * danger.dprMod * tacticalRole.dprMult * tempoProfile.dprMult);
  const baseAc = baseline.ac + monsterTier.acMod + tacticalRole.acMod;
  const baseAttack = baseline.attackBonus + tacticalRole.attackMod + tempoProfile.attackMod;
  const baseDc = baseline.saveDc + tacticalRole.dcMod;
  const statMods = selectedFeatures.reduce(
    (acc, feature) => {
      Object.entries(feature.stats || {}).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value;
      });
      return acc;
    },
    { hp: 0, dpr: 0, ac: 0, control: 0, mobility: 0, fairness: 0 },
  );
  const featureMechanics = selectedFeatures.map((feature) => ({
    id: feature.id,
    title: feature.title,
    ...getFeatureMechanicProfile(feature),
  }));
  const mechanicsSummary = summarizeMechanicProfiles(featureMechanics);
  const counterplayProfiles = selectedFeatures.map((feature) => getFeatureCounterplayProfile(feature));
  const cost = selectedFeatures.reduce((sum, feature) => sum + feature.cost, 0);
  const rawComplexity = selectedFeatures.reduce((sum, feature) => sum + feature.complexity, 0);
  const budget = Math.max(1, role.budget + danger.budgetOffset + tacticalRole.budgetMod + monsterTier.budgetOffset + tempoProfile.budgetMod);
  const complexityCap = Math.max(1, role.complexityCap + tacticalRole.complexityMod + monsterTier.complexityCapOffset + tempoProfile.complexityMod);
  const pressureProfile = buildPressureProfile({ cost, monsterTier, tempoProfile, statMods, mechanicsSummary, budget });
  const complexityProfile = buildComplexityProfile({ complexity: rawComplexity, mechanicsSummary, featureMechanics, limit: complexityCap });
  const counterplayAudit = buildCounterplayAudit({ selected, roleId, monsterTier, pressureProfile, complexityProfile, mechanicsSummary, counterplayProfiles });
  const pressure = pressureProfile.score;
  const complexity = complexityProfile.score;
  const hp = Math.max(1, Math.round(baseHp + (statMods.hp || 0)));
  const ac = clamp(baseAc + (statMods.ac || 0), 10, 28);
  const dpr = Math.max(1, Math.round(baseDpr + (statMods.dpr || 0)));
  const dc = clamp(baseDc + Math.floor((statMods.control || 0) / 3), 10, 30);
  const attack = clamp(baseAttack, 2, 18);
  const printedStats = { ac, hp, dpr, attackBonus: attack, saveDc: dc, initiativeMod: tempoProfile.initiativeMod, speed: creatureType.defaults.speed };
  const effectiveProfile = {
    effectiveAc: ac + Math.floor((statMods.mobility || 0) / 4),
    effectiveHp: Math.round(hp * (1 + Math.max(0, statMods.fairness || 0) * 0.015)),
    effectiveAttackBonus: attack + (tempoProfile.id === "ambusher" ? 1 : 0),
    effectiveSaveDc: dc,
    printedDpr: dpr,
    effectiveDpr3Round: Math.max(
      Math.round(dpr * (1 + Math.max(0, statMods.control || 0) * 0.035 + Math.max(0, statMods.mobility || 0) * 0.02 + (tempoProfile.id === "ambusher" ? 0.08 : 0))),
      Math.round(dpr + mechanicsSummary.structuredDamage * 0.2),
    ),
    burstDpr: Math.round(dpr * (1 + (tempoProfile.id === "ambusher" ? 0.35 : 0.12) + Math.max(0, statMods.dpr || 0) * 0.01)),
    tempoFactor: 1 + tempoProfile.pressureMod * 0.05,
    defenseFactor: 1 + Math.max(0, statMods.hp || 0) / Math.max(1, hp) + Math.max(0, statMods.ac || 0) * 0.04,
  };
  effectiveProfile.combatPowerEstimate = Math.round(effectiveProfile.effectiveHp * effectiveProfile.effectiveDpr3Round * ((effectiveProfile.effectiveAc + effectiveProfile.effectiveAttackBonus - 2) / 13));
  const profileDeltas = buildProfileDeltas(printedStats, effectiveProfile, baseline);
  const estimatedCr = clamp(
    Math.round(targetCr + (pressure - budget) / 6 + ((effectiveProfile.effectiveDpr3Round - baseline.dpr) / Math.max(8, baseline.dpr)) * 2),
    0,
    30,
  );
  const name = preset?.label || buildName(typeId, category, selectedFeatures);
  const rulesContext = { typeId, creatureType: creatureType.label, category, categoryNoun: String(category || "monster").toLowerCase() };
  const baselinePower = Math.round(baseline.hp * baseline.dpr * ((baseline.ac + baseline.attackBonus - 2) / 13));
  const warnings = [];
  if (pressure > budget) warnings.push("Threat budget is above target.");
  if (complexity > complexityCap) warnings.push("Table complexity is high.");
  if (!hasSelectedSlot(selected, "weakness")) warnings.push("No Weakness / Tell selected.");
  counterplayAudit.issues.forEach((issue) => warnings.push(`Counterplay Audit: ${issue.label}. ${issue.detail}`));

  const computed = {
    tier: getTier(partyLevel),
    targetCr,
    tacticalRole,
    monsterTier,
    tempoProfile,
    rulesContext,
    baseline,
    printedStats,
    effectiveProfile,
    profileDeltas,
    bestiaryBaselineAudit: { issues: [] },
    pressureProfile,
    complexityProfile,
    counterplayAudit,
    counterplayProfiles,
    featureMechanics,
    mechanicsSummary,
    baselinePower,
    effectivePower: effectiveProfile.combatPowerEstimate,
    prof,
    hp,
    ac,
    dpr,
    dc,
    attack,
    budget,
    cost,
    pressure,
    complexity,
    complexityCap,
    estimatedCr,
    name,
    warnings: uniqueArray(warnings),
    balanceRecommendations: [],
    damageText: averageDamageText(dpr),
    statMods,
  };
  const abilityProfile = buildAbilityProfile(typeId, category, roleId, selectedFeatures, computed.prof);
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

export function forgeMonsterSelection(frame, { slots = REQUIRED_PLAYABLE_SLOTS } = {}) {
  const selected = {};
  let selectedFeatures = [];
  let remainingBudget = (getFrameValue(ROLES, frame.roleId, 1)?.budget || 12) + (getFrameValue(DANGERS, frame.dangerId, 1)?.budgetOffset || 0);

  slots.forEach((slotId) => {
    const candidates = FEATURES.filter((feature) => {
      if (!featureMatchesFrame(feature, frame.sourceId, frame.typeId, frame.roleId, slotId, frame)) return false;
      const status = getCompatibilityStatus(feature, selectedFeatures, frame.typeId, frame.category, { activePreset: null });
      return ["compatible", "soft"].includes(status.kind);
    });
    const picked = pickForgeCandidate(candidates, slotId, remainingBudget, frame.roleId, frame);
    if (!picked) return;
    selected[slotId] = picked.id;
    selectedFeatures = getFeaturesFromSelection(selected);
    remainingBudget -= Math.max(0, picked.cost || 0);
  });

  return selected;
}

export function buildExportArtifacts(context) {
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
  return {
    exportText: buildExportText(args),
    exportJson: buildExportJson(args),
    exportReadiness: buildExportReadiness({
      computed: context.computed,
      selected: context.selected,
      selectedFeatures: context.selectedFeatures,
      traits: context.traits,
      actions: context.actions,
      weaknessFeatures: context.weaknessFeatures,
      deathEffects: context.deathEffects,
      lairActions: context.lairActions,
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
