import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useComposerBuildGuidePreference } from "../../components/ui/composer-command-bar.jsx";
import "./monster-composer.styles.css";
import "../../shared/styles/composer-internals.css";
import { getFeatureBalanceEntries, getFeatureBalanceStat, sumFeatureBalanceStats } from "./model/monster-graft-balance-profile.js";
import {
  X,
  BookOpen,
  Shield,
} from "lucide-react";

import {
  CREATURE_TYPES,
  ROLES,
  DANGERS,
  TACTICAL_ROLES,
  MONSTER_TIERS,
  TEMPO_PROFILES,
  getDefaultCreatureCategory,
  isCreatureTypeUnavailable,
} from "./monster-composer.taxonomies.js";

import {
  SLOTS,
  DEFAULT_SLOT_CAPS,
} from "./monster-composer.workflow.js";

import {
  ALL_MONSTER_SOURCES as BASE_SOURCES,
  ALL_MONSTER_GRAFTS as BASE_FEATURES,
} from "./data/monster-content-pack-feed.js";

import { MONSTER_FAMILY_PRESETS as BASE_MONSTER_FAMILY_PRESETS } from "./data/monster-presets.js";
import { resolveLocalizedContentList } from "../../shared/i18n/index.js";
import {
  asArray,
  collapseSelectedToSingle,
  getFeaturesFromSelection as getFeaturesFromSelectionModel,
  getSelectedIdsForSlot,
  hasSelectedSlot,
  trimSelectedToCaps as trimSelectedToCapsModel,
  uniqueArray,
} from "./model/monster-composer.selection.js";
import {
  buildCompatibilityWarning,
  buildFeatureDecisionProfile as buildFeatureDecisionProfileModel,
  buildFeatureImpactPreview as buildFeatureImpactPreviewModel,
  buildSmartSlotPicks as buildSmartSlotPicksModel,
  canShowFeatureForMode,
  getCompatibilityRank,
  getCompatibilityStatus,
  getComposerMode,
  getFeatureDecisionRank,
  getFeatureSafetyScore as getFeatureSafetyScoreModel,
  getFeatureSpiceScore as getFeatureSpiceScoreModel,
} from "./model/monster-composer.compatibility.js";
import {
  buildComplexityProfile,
  buildCounterplayAudit,
  buildPressureProfile,
  getFeatureComplexityWeight,
  getFeatureCounterplayProfile,
  getFeatureMechanicProfile,
  getFeaturePressureWeight,
  getFeatureSection,
  hasFeatureMechanicOverride,
  getTopFeatureByWeight,
  summarizeMechanicProfiles,
} from "./model/monster-composer.balance.js";
import {
  buildExportJson,
  buildDebugExportJson,
  buildExportReadiness,
  buildExportRunSheet,
  buildExportText,
  buildRenderableStatBlock,
  getSectionLabel,
  groupFeaturesBySection,
  normalizeMonsterReferences,
  normalizeRulesText,
} from "./model/monster-composer.export.js";
import { parseMonsterRenderedStatBlock } from "./model/monster-statblock-parser.js";
import { buildRunModeSheet } from "./model/monster-composer.run.js";
import { buildGuidedFlow } from "./model/monster-composer.start-flow.js";
import {
  buildBestiaryBaselineAudit,
  buildMonsterComposerProfileDeltas,
  getMonsterComposerBaselineProfile,
} from "./model/monster-bestiary-baselines.js";
import { evaluateMonsterFrameFit, isMonsterFrameFitAllowed } from "./model/monster-frame-fit.js";
import { validateMonsterGraftRules } from "./model/monster-graft-rules.schema.js";
import { buildMonsterAbilitiesFromFeatures } from "./model/monster-ability-model.js";
import { ensureMonsterBasicAttackFeature } from "./model/monster-basic-attack.js";
import { buildMonsterFramePowerProfile } from "./model/monster-frame-power.js";
import { resolveMonsterGuidanceLimits } from "./model/monster-pressure-complexity.js";
import { buildClosedLoopCrFit } from "./model/monster-cr-fitting.js";
import { shouldSurfaceDiagnosticAsWarning } from "./model/monster-publish-gate.js";
import {
  DEFAULT_MONSTER_RULESET_ID,
  getMonsterRuleset,
  getMonsterRulesetOption,
} from "./rulesets/index.js";
import { GuidedFlowPanel, TemplatePickerModal } from "./components/monster-composer.start-flow.jsx";
import { MonsterSilhouetteMap } from "./components/monster-composer.anatomy.jsx";
import { ComponentNavigatorDrawer } from "./components/monster-composer.navigator.jsx";
import {
  BalanceWorkbench,
  ExportWorkbench,
  RenderedStatBlock,
  RunModePanel,
} from "./components/monster-composer.panels.jsx";

const MONSTER_STAGE_TRANSITION_EXIT_MS = 260;
const MONSTER_STAGE_TRANSITION_ENTER_MS = 760;

let LOCALIZED_MONSTER_SOURCES = BASE_SOURCES;
let LOCALIZED_MONSTER_FEATURES = BASE_FEATURES;
let LOCALIZED_MONSTER_PRESETS = BASE_MONSTER_FAMILY_PRESETS;


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleCase(value) {
  return String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getTier(level) {
  if (level <= 4) return 1;
  if (level <= 10) return 2;
  if (level <= 16) return 3;
  return 4;
}

function abilityMod(score) {
  return Math.floor((score - 10) / 2);
}

function modText(value) {
  return value >= 0 ? `+${value}` : `−${Math.abs(value)}`;
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


function buildAbilityProfile(typeId, category, roleId, selectedFeatures, prof, rulesProfile = null) {
  if (rulesProfile?.abilityProfile?.physical && rulesProfile?.abilityProfile?.mental) {
    return rulesProfile.abilityProfile;
  }
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

  if (roleId === "minion") {
    scores.con -= 2;
  }

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

function buildName(type, category, selectedFeatures) {
  const sourceFeature =
    selectedFeatures.find((f) => f.slot === "horror") ||
    selectedFeatures.find((f) => f.slot === "body") ||
    selectedFeatures[0];
  const sourceId = sourceFeature?.source || "";
  const source = sourceFeature ? LOCALIZED_MONSTER_SOURCES.find((s) => s.id === sourceId)?.label : null;

  if (!source) return `Cruor ${category}`;
  if (sourceId === "wolf-spiders") return `Brood-Bearing ${category}`;
  if (sourceId === "wax-death-masks") return `Wax-Faced ${category}`;
  if (sourceId === "jikininki") return `Grave-Hungry ${category}`;
  if (sourceId === "decomposition") return `Rot-Swollen ${category}`;
  return `${source} ${titleCase(type)}`;
}

function getDamageEntriesFromRules(rules = {}) {
  const damage = rules.damage || null;
  if (!damage || damage.mode === "none") return [];
  if (Array.isArray(damage.parts) && damage.parts.length) return damage.parts.filter((part) => part && part.mode !== "none");
  return [damage];
}

function isScalableMainActionFeature(feature = {}) {
  const rules = feature.rules || {};
  if (String(rules.actionEconomy || feature.section || "").toLowerCase() !== "action") return false;
  if (rules.multiattack?.enabled) return true;
  return getDamageEntriesFromRules(rules).some((damage) => {
    const mode = String(damage.mode || "").toLowerCase();
    const scale = String(damage.scale || "standard").toLowerCase();
    const budgetRole = String(damage.budgetRole || "").toLowerCase();
    const budgetShare = Number(damage.budgetShare || 0);
    if (!["mainattack", "attack", "primary"].includes(budgetRole)) return false;
    if (!["computed", "budget"].includes(mode)) return false;
    if (budgetShare >= 0.65) return true;
    return !["minor", "light"].includes(scale);
  });
}

function featureMatchesSource(feature, sourceIdOrIds) {
  const sourceIds = Array.isArray(sourceIdOrIds) ? sourceIdOrIds : [sourceIdOrIds];
  return sourceIds.filter(Boolean).includes(feature.source);
}

function featureMatchesFrame(feature, sourceId, typeId, roleId, slotId = null, frameContext = null) {
  const sourceMatch = featureMatchesSource(feature, sourceId);
  const typeMatch = !feature.typeBias?.length || feature.typeBias.includes(typeId);
  const roleMatch = !feature.roleBias?.length || feature.roleBias.includes(roleId);
  const slotMatch = !slotId || feature.slot === slotId;
  const frameFitMatch = !frameContext || isMonsterFrameFitAllowed(feature, frameContext, { includeInferred: false });
  return sourceMatch && typeMatch && roleMatch && slotMatch && frameFitMatch;
}

function featureMatchesSourceAndSlot(feature, sourceId, slotId = null) {
  const sourceMatch = featureMatchesSource(feature, sourceId);
  const slotMatch = !slotId || feature.slot === slotId;
  return sourceMatch && slotMatch;
}

function getContentPackId(entry) {
  return entry?.contentPack?.id || "core-cruor";
}

function getContentPackTitle(entry) {
  return entry?.contentPack?.title || "Core Monster Composer";
}

function getPresetById(presetId) {
  return LOCALIZED_MONSTER_PRESETS.find((preset) => preset.id === presetId) || null;
}

function normalizePresetSelection(preset) {
  if (!preset?.selection) return {};
  return Object.fromEntries(
    Object.entries(preset.selection)
      .map(([slotId, value]) => {
        const ids = asArray(value).filter((id) =>
          LOCALIZED_MONSTER_FEATURES.some((feature) => feature.id === id && feature.slot === slotId)
        );
        return [slotId, ids.length > 1 ? ids : ids[0]];
      })
      .filter(([, value]) => (Array.isArray(value) ? value.length : Boolean(value)))
  );
}


function getFeatureDecisionProfile(feature, context = {}) {
  return buildFeatureDecisionProfileModel(feature, {
    ...context,
    getFeatureSection,
  hasFeatureMechanicOverride,
    getFeatureMechanicProfile,
    getFeatureCounterplayProfile,
    titleCase,
  });
}

function getFeatureSpiceScore(feature, profile) {
  return getFeatureSpiceScoreModel(feature, profile, {
    getFeatureSection,
  hasFeatureMechanicOverride,
    getFeatureCounterplayProfile,
  });
}

function getFeatureSafetyScore(feature, profile) {
  return getFeatureSafetyScoreModel(feature, profile, {
    getFeatureMechanicProfile,
    getFeatureCounterplayProfile,
  });
}

function buildSmartSlotPicks(args) {
  return buildSmartSlotPicksModel({
    ...args,
    getFeatureDecisionProfile,
    getFeatureSafetyScore,
    getFeatureSpiceScore,
  });
}

function buildFeatureImpactPreview(args) {
  return buildFeatureImpactPreviewModel({
    ...args,
    buildPressureProfile,
    buildComplexityProfile,
    getFeatureCounterplayProfile,
    buildMonsterAbilitiesFromFeatures,
  });
}

function getOneClickFixCandidates({
  slotId,
  selected,
  selectedFeatures,
  typeId,
  category,
  activePreset,
  roleId,
  sourceId,
  composerMode,
  customMode,
  tacticalRoleId,
  monsterTierId,
  tempoProfileId,
  dangerId,
  targetCr,
  excludeFeatureId = "",
}) {
  return LOCALIZED_MONSTER_FEATURES.map((feature) => ({
    feature,
    status: getCompatibilityStatus(feature, selectedFeatures, typeId, category, { activePreset }),
  }))
    .filter(({ feature, status }) => {
      if (feature.id === excludeFeatureId) return false;
      if (feature.slot !== slotId) return false;
      if (getSelectedIdsForSlot(selected, feature.slot).includes(feature.id)) return false;
      const frameMatch = customMode
        ? featureMatchesSourceAndSlot(feature, sourceId, slotId)
        : featureMatchesFrame(feature, sourceId, typeId, roleId, slotId, {
            roleId,
            tacticalRoleId,
            monsterTierId,
            tempoProfileId,
            dangerId,
            targetCr,
          });
      return frameMatch && canShowFeatureForMode(status, composerMode);
    })
    .map(({ feature, status }) => {
      const profile = getFeatureDecisionProfile(feature, {
        status,
        selected,
        selectedFeatures,
        typeId,
        category,
        activePreset,
        roleId,
        tacticalRoleId,
        monsterTierId,
        tempoProfileId,
        dangerId,
        targetCr,
        currentSlot: slotId,
      });
      return { feature, status, profile, safety: getFeatureSafetyScore(feature, profile) };
    });
}

function getBestAddFeatureFix(args) {
  const candidates = getOneClickFixCandidates(args);
  if (!candidates.length) return null;
  const sorted = [...candidates].sort((a, b) => {
    if (args.slotId === "weakness") {
      return (
        (getFeatureBalanceStat(b.feature, "fairness")) - (getFeatureBalanceStat(a.feature, "fairness")) ||
        b.safety - a.safety ||
        getFeatureDecisionRank(a.profile) - getFeatureDecisionRank(b.profile) ||
        a.feature.title.localeCompare(b.feature.title)
      );
    }
    return (
      getFeatureDecisionRank(a.profile) - getFeatureDecisionRank(b.profile) ||
      b.safety - a.safety ||
      Math.max(0, a.feature.cost) - Math.max(0, b.feature.cost) ||
      a.feature.title.localeCompare(b.feature.title)
    );
  });
  return sorted[0]?.feature || null;
}

function getSelectedWithoutFeature(selected, feature) {
  if (!feature) return selected;
  const currentIds = getSelectedIdsForSlot(selected, feature.slot).filter(
    (id) => id !== feature.id
  );
  const next = { ...selected };
  if (!currentIds.length) delete next[feature.slot];
  else next[feature.slot] = Array.isArray(selected[feature.slot]) ? currentIds : currentIds[0];
  return next;
}

function findReplacementFix({
  feature,
  selected,
  selectedFeatures,
  typeId,
  category,
  activePreset,
  roleId,
  sourceId,
  composerMode,
  customMode,
  tacticalRoleId,
  monsterTierId,
  tempoProfileId,
  dangerId,
  targetCr,
  reason = "pressure",
}) {
  if (!feature) return null;
  const reducedFeatures = selectedFeatures.filter((item) => item.id !== feature.id);
  const reducedSelected = getSelectedWithoutFeature(selected, feature);
  const originalWeight =
    reason === "complexity"
      ? getFeatureComplexityWeight(feature)
      : getFeaturePressureWeight(feature);
  const candidates = LOCALIZED_MONSTER_FEATURES.map((candidate) => ({
    candidate,
    status: getCompatibilityStatus(candidate, reducedFeatures, typeId, category, { activePreset }),
  }))
    .filter(({ candidate, status }) => {
      if (candidate.id === feature.id) return false;
      if (candidate.slot !== feature.slot) return false;
      if (getSelectedIdsForSlot(reducedSelected, candidate.slot).includes(candidate.id))
        return false;
      const frameMatch = customMode
        ? featureMatchesSourceAndSlot(candidate, sourceId, feature.slot)
        : featureMatchesFrame(candidate, sourceId, typeId, roleId, feature.slot, {
          roleId,
          tacticalRoleId,
          monsterTierId,
          tempoProfileId,
          dangerId,
          targetCr,
        });
      if (!frameMatch || !canShowFeatureForMode(status, composerMode)) return false;
      const candidateWeight =
        reason === "complexity"
          ? getFeatureComplexityWeight(candidate)
          : getFeaturePressureWeight(candidate);
      return (
        candidateWeight < originalWeight ||
        candidate.cost < feature.cost ||
        candidate.complexity < feature.complexity
      );
    })
    .map(({ candidate, status }) => ({
      feature: candidate,
      status,
      weight:
        reason === "complexity"
          ? getFeatureComplexityWeight(candidate)
          : getFeaturePressureWeight(candidate),
      profile: getFeatureDecisionProfile(candidate, {
        status,
        selected: reducedSelected,
        selectedFeatures: reducedFeatures,
        typeId,
        category,
        activePreset,
        roleId,
        tacticalRoleId,
        monsterTierId,
        tempoProfileId,
        dangerId,
        targetCr,
        currentSlot: feature.slot,
      }),
    }))
    .sort(
      (a, b) =>
        originalWeight - b.weight - (originalWeight - a.weight) ||
        getFeatureDecisionRank(a.profile) - getFeatureDecisionRank(b.profile) ||
        a.feature.title.localeCompare(b.feature.title)
    );
  return candidates[0]?.feature || null;
}

function getTopDamageSpikeFeature({ dprProfile, selectedFeatures, baseline, includeDeathBurst = false }) {
  const byId = new Map(selectedFeatures.map((feature) => [feature.id, feature]));
  const baselineDpr = Math.max(1, Number(baseline?.dpr || 1));
  const sources = Array.isArray(dprProfile?.sources) ? dprProfile.sources : [];
  const rankedSources = sources
    .filter((source) => {
      const feature = byId.get(source.featureId);
      if (!feature) return false;
      const isDeathBurst = source.actionEconomy === "deathTrigger" || source.budgetRole === "deathBurst";
      if (isDeathBurst && !includeDeathBurst) return false;
      return Number(source.averageDpr || source.totalThreeRound || 0) > 0;
    })
    .sort((a, b) =>
      Number(b.averageDpr || 0) - Number(a.averageDpr || 0) ||
      Number(b.totalThreeRound || 0) - Number(a.totalThreeRound || 0) ||
      String(a.title || "").localeCompare(String(b.title || ""))
    );

  const source = rankedSources[0];
  if (!source) return null;
  const isLargeEnough =
    Number(source.averageDpr || 0) >= baselineDpr * 0.35 ||
    Number(source.totalThreeRound || 0) >= baselineDpr * 0.9;
  return isLargeEnough ? byId.get(source.featureId) : null;
}

function shouldTargetDeathBurstForDamageFix({ effectiveProfile, baseline }) {
  const baselineDpr = Math.max(1, Number(baseline?.dpr || 1));
  return Number(effectiveProfile?.burstDpr || 0) >= baselineDpr * 2.5;
}

function buildOneClickFixes({
  issue,
  selected,
  selectedFeatures,
  typeId,
  category,
  activePreset,
  roleId,
  sourceId,
  composerMode,
  customMode,
  tacticalRoleId,
  monsterTierId,
  tempoProfileId,
  dangerId,
  targetCr,
  topPressureFeature,
  topComplexityFeature,
  topDamageFeature,
}) {
  const fixes = [];
  const pushFix = (fix) => {
    if (!fix) return;
    if (
      fixes.some(
        (item) =>
          item.kind === fix.kind &&
          item.featureId === fix.featureId &&
          item.addFeatureId === fix.addFeatureId &&
          item.removeFeatureId === fix.removeFeatureId
      )
    )
      return;
    fixes.push(fix);
  };

  const frameArgs = { tacticalRoleId, monsterTierId, tempoProfileId, dangerId, targetCr };

  const weaknessFix = getBestAddFeatureFix({
    slotId: "weakness",
    selected,
    selectedFeatures,
    typeId,
    category,
    roleId,
    sourceId,
    composerMode,
    customMode,
    ...frameArgs,
  });
  const twistFix = getBestAddFeatureFix({
    slotId: "twist",
    selected,
    selectedFeatures,
    typeId,
    category,
    roleId,
    sourceId,
    composerMode,
    customMode,
    ...frameArgs,
  });
  const lairFix = getBestAddFeatureFix({
    slotId: "lair",
    selected,
    selectedFeatures,
    typeId,
    category,
    roleId,
    sourceId,
    composerMode,
    customMode,
    ...frameArgs,
  });

  if (["missing-weakness", "counterplay", "conditions"].includes(issue) && weaknessFix) {
    pushFix({ label: `Add ${weaknessFix.title}`, kind: "addFeature", featureId: weaknessFix.id });
  }

  if (["pressure", "hp"].includes(issue) && topPressureFeature) {
    const replacement = findReplacementFix({
      feature: topPressureFeature,
      selected,
      selectedFeatures,
      typeId,
      category,
      activePreset,
      roleId,
      sourceId,
      composerMode,
      customMode,
      ...frameArgs,
      reason: "pressure",
    });
    if (replacement)
      pushFix({
        label: `Replace with ${replacement.title}`,
        kind: "replaceFeature",
        removeFeatureId: topPressureFeature.id,
        addFeatureId: replacement.id,
      });
    pushFix({
      label: `Remove ${topPressureFeature.title}`,
      kind: "removeFeature",
      featureId: topPressureFeature.id,
    });
  }

  if (issue === "damage" && topDamageFeature) {
    const replacement = findReplacementFix({
      feature: topDamageFeature,
      selected,
      selectedFeatures,
      typeId,
      category,
      activePreset,
      roleId,
      sourceId,
      composerMode,
      customMode,
      ...frameArgs,
      reason: "pressure",
    });
    if (replacement)
      pushFix({
        label: `Replace with ${replacement.title}`,
        kind: "replaceFeature",
        removeFeatureId: topDamageFeature.id,
        addFeatureId: replacement.id,
      });
    pushFix({
      label: `Remove ${topDamageFeature.title}`,
      kind: "removeFeature",
      featureId: topDamageFeature.id,
    });
  }

  if (["complexity", "reactions"].includes(issue) && topComplexityFeature) {
    const replacement = findReplacementFix({
      feature: topComplexityFeature,
      selected,
      selectedFeatures,
      typeId,
      category,
      activePreset,
      roleId,
      sourceId,
      composerMode,
      customMode,
      ...frameArgs,
      reason: "complexity",
    });
    if (replacement)
      pushFix({
        label: `Replace with ${replacement.title}`,
        kind: "replaceFeature",
        removeFeatureId: topComplexityFeature.id,
        addFeatureId: replacement.id,
      });
    pushFix({
      label: `Remove ${topComplexityFeature.title}`,
      kind: "removeFeature",
      featureId: topComplexityFeature.id,
    });
  }

  if (issue === "boss-action") {
    if (twistFix)
      pushFix({ label: `Add ${twistFix.title}`, kind: "addFeature", featureId: twistFix.id });
    if (lairFix)
      pushFix({ label: `Add ${lairFix.title}`, kind: "addFeature", featureId: lairFix.id });
  }

  return fixes.slice(0, 2);
}

function buildBalanceRecommendations({
  selected,
  selectedFeatures,
  typeId,
  category,
  activePreset,
  roleId,
  sourceId,
  composerMode,
  customMode,
  tacticalRoleId,
  monsterTierId,
  tempoProfileId,
  dangerId,
  targetCr,
  monsterTier,
  tempoProfile,
  pressure,
  budget,
  complexity,
  complexityCap,
  counterplayAudit,
  mechanicsSummary,
  baseline,
  hp,
  dpr,
  effectiveProfile,
  dprProfile,
  crValidation,
}) {
  const recommendations = [];
  const addRecommendation = (item) => {
    if (recommendations.some((recommendation) => recommendation.id === item.id)) return;
    recommendations.push(item);
  };

  const topPressureFeature = getTopFeatureByWeight(selectedFeatures, getFeaturePressureWeight);
  const topComplexityFeature = getTopFeatureByWeight(selectedFeatures, getFeatureComplexityWeight);
  const deathBurstIsPrimarySpike = shouldTargetDeathBurstForDamageFix({ effectiveProfile, baseline });
  const topDamageFeature = getTopDamageSpikeFeature({
    dprProfile,
    selectedFeatures,
    baseline,
    includeDeathBurst: deathBurstIsPrimarySpike,
  });
  const crDelta = Number(crValidation?.deltaFromTarget || 0);
  const offensiveDelta = Number(crValidation?.offensive?.cr || targetCr || 0) - Number(targetCr || 0);
  const frameArgs = { tacticalRoleId, monsterTierId, tempoProfileId, dangerId, targetCr };
  const hasWeakness = hasSelectedSlot(selected, "weakness");
  const hasTwist = hasSelectedSlot(selected, "twist");
  const hasLair = hasSelectedSlot(selected, "lair");
  const nextTier =
    monsterTier.id === "normal"
      ? "elite"
      : monsterTier.id === "elite"
        ? "boss"
        : monsterTier.id === "boss"
          ? "legendary"
          : "setpiece";

  if (!hasWeakness) {
    addRecommendation({
      id: "add-weakness",
      severity: "critical",
      title: "Add a Weakness / Tell",
      detail: "The monster has no explicit player-facing answer.",
      actions: [
        ...buildOneClickFixes({
          issue: "missing-weakness",
          selected,
          selectedFeatures,
          typeId,
          category,
          activePreset,
          roleId,
          sourceId,
          composerMode,
          customMode,
          ...frameArgs,
          topPressureFeature,
          topComplexityFeature,
          topDamageFeature,
        }),
        { label: "Open Weakness Slot", kind: "slot", slotId: "weakness" },
      ],
    });
  }

  if (pressure > budget) {
    addRecommendation({
      id: "reduce-pressure",
      severity: pressure > budget * 1.25 ? "critical" : "major",
      title: "Pressure Above CR Guidance",
      detail: topPressureFeature
        ? `${topPressureFeature.title} is the first player-facing load to review. You may keep the build when the extra tactical density is intentional.`
        : "The party-facing tactical load is above the recommendation for this CR. This does not block the build.",
      actions: [
        ...buildOneClickFixes({
          issue: "pressure",
          selected,
          selectedFeatures,
          typeId,
          category,
          activePreset,
          roleId,
          sourceId,
          composerMode,
          customMode,
          ...frameArgs,
          topPressureFeature,
          topComplexityFeature,
          topDamageFeature,
        }),
        topPressureFeature
          ? {
              label: `Open ${titleCase(topPressureFeature.slot)}`,
              kind: "slot",
              slotId: topPressureFeature.slot,
            }
          : null,
        { label: `Set ${titleCase(nextTier)} Tier`, kind: "tier", tierId: nextTier },
      ].filter(Boolean),
    });
  }

  if (complexity > complexityCap) {
    addRecommendation({
      id: "reduce-complexity",
      severity: complexity > complexityCap * 1.25 ? "critical" : "major",
      title: "DM Load Above Guidance",
      detail: topComplexityFeature
        ? `${topComplexityFeature.title} is the first handling-heavy graft to review. You may keep it when the added table load is deliberate.`
        : "DM handling load is above the current recommendation. This does not block the build.",
      actions: [
        ...buildOneClickFixes({
          issue: "complexity",
          selected,
          selectedFeatures,
          typeId,
          category,
          activePreset,
          roleId,
          sourceId,
          composerMode,
          customMode,
          ...frameArgs,
          topPressureFeature,
          topComplexityFeature,
          topDamageFeature,
        }),
        topComplexityFeature
          ? {
              label: `Open ${titleCase(topComplexityFeature.slot)}`,
              kind: "slot",
              slotId: topComplexityFeature.slot,
            }
          : null,
        { label: "Use Advanced Limits", kind: "advanced" },
      ].filter(Boolean),
    });
  }

  if (
    counterplayAudit.rating === "Unsafe" ||
    counterplayAudit.issues.some((issue) => issue.severity === "critical")
  ) {
    addRecommendation({
      id: "counterplay-release-valves",
      severity: "critical",
      title: "Add Release Valves",
      detail: "Hard control, burst damage, or scene pressure needs a clear answer.",
      actions: [
        ...buildOneClickFixes({
          issue: "counterplay",
          selected,
          selectedFeatures,
          typeId,
          category,
          activePreset,
          roleId,
          sourceId,
          composerMode,
          customMode,
          ...frameArgs,
          topPressureFeature,
          topComplexityFeature,
          topDamageFeature,
        }),
        { label: "Open Weakness Slot", kind: "slot", slotId: "weakness" },
      ],
    });
  }

  if (
    mechanicsSummary.majorConditionCount >= 2 &&
    counterplayAudit.summary.breakConditionCount < mechanicsSummary.majorConditionCount
  ) {
    addRecommendation({
      id: "condition-breaks",
      severity: "major",
      title: "Give Hard Conditions an Exit",
      detail: "Major conditions currently outnumber clear break conditions.",
      actions: [
        ...buildOneClickFixes({
          issue: "conditions",
          selected,
          selectedFeatures,
          typeId,
          category,
          activePreset,
          roleId,
          sourceId,
          composerMode,
          customMode,
          ...frameArgs,
          topPressureFeature,
          topComplexityFeature,
          topDamageFeature,
        }),
        { label: "Open Weakness Slot", kind: "slot", slotId: "weakness" },
      ],
    });
  }

  if (
    mechanicsSummary.reactionCount >= 3 &&
    !["boss", "legendary", "setpiece"].includes(monsterTier.id)
  ) {
    addRecommendation({
      id: "too-many-reactions",
      severity: "major",
      title: "Reduce Reactions",
      detail: "Too many reaction hooks can slow turns and feel like hidden punishment.",
      actions: [
        ...buildOneClickFixes({
          issue: "reactions",
          selected,
          selectedFeatures,
          typeId,
          category,
          activePreset,
          roleId,
          sourceId,
          composerMode,
          customMode,
          ...frameArgs,
          topPressureFeature,
          topComplexityFeature,
          topDamageFeature,
        }),
        topComplexityFeature
          ? {
              label: `Open ${titleCase(topComplexityFeature.slot)}`,
              kind: "slot",
              slotId: topComplexityFeature.slot,
            }
          : null,
        { label: "Set Boss Tier", kind: "tier", tierId: "boss" },
      ].filter(Boolean),
    });
  }

  if (roleId === "boss" && !hasTwist && !hasLair) {
    addRecommendation({
      id: "boss-action-economy",
      severity: "minor",
      title: "Add Boss-Level Action Pressure",
      detail: "A boss with no Twist or Lair may play like a high-HP standard monster.",
      actions: [
        ...buildOneClickFixes({
          issue: "boss-action",
          selected,
          selectedFeatures,
          typeId,
          category,
          activePreset,
          roleId,
          sourceId,
          composerMode,
          customMode,
          ...frameArgs,
          topPressureFeature,
          topComplexityFeature,
          topDamageFeature,
        }),
        { label: "Open Twist Slot", kind: "slot", slotId: "twist" },
        { label: "Open Lair Slot", kind: "slot", slotId: "lair" },
      ],
    });
  }

  if (hp > baseline.hp * 1.45 && monsterTier.id === "normal") {
    addRecommendation({
      id: "hp-tier-mismatch",
      severity: "major",
      title: "HP Reads Above Normal",
      detail: "Durability is far above the current CR baseline.",
      actions: [
        ...buildOneClickFixes({
          issue: "hp",
          selected,
          selectedFeatures,
          typeId,
          category,
          activePreset,
          roleId,
          sourceId,
          composerMode,
          customMode,
          ...frameArgs,
          topPressureFeature,
          topComplexityFeature,
          topDamageFeature,
        }),
        topPressureFeature
          ? {
              label: `Open ${titleCase(topPressureFeature.slot)}`,
              kind: "slot",
              slotId: topPressureFeature.slot,
            }
          : null,
        { label: "Set Elite Tier", kind: "tier", tierId: "elite" },
      ].filter(Boolean),
    });
  }

  if (dpr > baseline.dpr * 1.4 || effectiveProfile.burstDpr > baseline.dpr * 1.75) {
    const isSystemicOvertarget = crDelta >= 2 && offensiveDelta <= 3 && !topDamageFeature;
    addRecommendation({
      id: "damage-spike",
      severity: crDelta >= 3 || offensiveDelta >= 4 ? "major" : "minor",
      title: isSystemicOvertarget ? "Tune Overall Damage" : "Limit the Damage Spike",
      detail: topDamageFeature
        ? `${topDamageFeature.title} is the first damaging graft to review.`
        : "Damage is above the expected profile, but no single damaging graft is clearly responsible.",
      actions: [
        ...buildOneClickFixes({
          issue: "damage",
          selected,
          selectedFeatures,
          typeId,
          category,
          activePreset,
          roleId,
          sourceId,
          composerMode,
          customMode,
          ...frameArgs,
          topPressureFeature,
          topComplexityFeature,
          topDamageFeature,
        }),
        { label: "Open Attack Slot", kind: "slot", slotId: "attack" },
        { label: "Open Weakness Slot", kind: "slot", slotId: "weakness" },
        crDelta >= 2 ? { label: `Set ${titleCase(nextTier)} Tier`, kind: "tier", tierId: nextTier } : null,
      ].filter(Boolean),
    });
  }

  if (crDelta >= 2 && dpr <= baseline.dpr * 1.45 && effectiveProfile.burstDpr <= baseline.dpr * 2) {
    addRecommendation({
      id: "cr-above-target-tune-frame",
      severity: crDelta >= 3 ? "major" : "minor",
      title: "Treat as Higher CR or Trim One Graft",
      detail: `Validation estimates CR ${crValidation?.estimatedCr}; target CR ${targetCr}. This looks like a general frame mismatch, not a single broken graft.`,
      actions: [
        { label: `Set ${titleCase(nextTier)} Tier`, kind: "tier", tierId: nextTier },
        { label: "Open Monster Frame", kind: "frame" },
        { label: "Open Attack Slot", kind: "slot", slotId: "attack" },
      ],
    });
  }

  if (
    tempoProfile.id === "legendary" &&
    !["boss", "legendary", "setpiece"].includes(monsterTier.id)
  ) {
    addRecommendation({
      id: "tempo-tier-mismatch",
      severity: "major",
      title: "Legendary tempo needs boss framing",
      detail:
        "Legendary tempo on a non-boss tier can feel overtuned. Slow the tempo or raise the monster tier to match the action economy.",
      actions: [
        { label: "Set Boss Tier", kind: "tier", tierId: "boss" },
        { label: "Open Monster Frame", kind: "frame" },
      ],
    });
  }

  return recommendations.slice(0, 6);
}

function getForgePriority(roleId) {
  if (roleId === "minion") return ["body", "attack", "weakness", "death"];
  if (roleId === "boss")
    return ["body", "mind", "movement", "attack", "horror", "twist", "weakness", "lair", "death"];
  return ["body", "mind", "movement", "attack", "horror", "weakness", "twist", "death"];
}

function getFeaturesFromSelection(selected) {
  return getFeaturesFromSelectionModel(selected, LOCALIZED_MONSTER_FEATURES);
}

function trimSelectedToCaps(current, slotCaps) {
  return trimSelectedToCapsModel(current, slotCaps, { getSlotCap });
}

function getSlotCap(slotCaps, slotId) {
  return Math.max(1, Number(slotCaps?.[slotId] || 1));
}



function pickForgeCandidate(candidates, slotId, remainingBudget, roleId, frame = {}) {
  if (!candidates.length) return null;

  const coreSlots = new Set(["body", "attack", "weakness"]);
  const sorted = [...candidates].sort((a, b) => {
    const weaknessBiasA = a.slot === "weakness" ? -8 : 0;
    const weaknessBiasB = b.slot === "weakness" ? -8 : 0;
    const lairBiasA = roleId === "boss" && a.slot === "lair" ? -2 : 0;
    const lairBiasB = roleId === "boss" && b.slot === "lair" ? -2 : 0;
    const aFrameFit = evaluateMonsterFrameFit(a, frame);
    const bFrameFit = evaluateMonsterFrameFit(b, frame);
    return (
      Math.max(0, a.cost) +
      a.complexity * 0.45 +
      aFrameFit.rankModifier +
      weaknessBiasA +
      lairBiasA -
      (Math.max(0, b.cost) +
        b.complexity * 0.45 +
        bFrameFit.rankModifier +
        weaknessBiasB +
        lairBiasB)
    );
  });

  if (slotId === "weakness") return sorted[0];
  const affordable = sorted.find((feature) => Math.max(0, feature.cost) <= remainingBudget);
  if (affordable) return affordable;
  if (coreSlots.has(slotId)) return sorted[0];
  return null;
}


function copyTextFallback(text) {
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    // Clipboard fallback can fail in restricted browser contexts.
  }
  document.body.removeChild(textarea);
  return copied;
}




export default function CruorMonsterComposerMvp({ uiMode = "simple", inspirationSeed = null, locale = "en" } = {}) {
  const SOURCES = useMemo(() => resolveLocalizedContentList(BASE_SOURCES, locale), [locale]);
  const FEATURES = useMemo(() => resolveLocalizedContentList(BASE_FEATURES, locale), [locale]);
  const MONSTER_FAMILY_PRESETS = useMemo(
    () => resolveLocalizedContentList(BASE_MONSTER_FAMILY_PRESETS, locale),
    [locale],
  );

  LOCALIZED_MONSTER_SOURCES = SOURCES;
  LOCALIZED_MONSTER_FEATURES = FEATURES;
  LOCALIZED_MONSTER_PRESETS = MONSTER_FAMILY_PRESETS;
  const [typeId, setTypeId] = useState("undead");
  const [category, setCategory] = useState("Zombie");
  const [roleId, setRoleId] = useState("standard");
  const [sourceId, setSourceId] = useState("decomposition");
  const [navigatorSourceFilters, setNavigatorSourceFilters] = useState(["decomposition"]);
  const [partyLevel, setPartyLevel] = useState(5);
  const [dangerId, setDangerId] = useState("hard");
  const [targetCr, setTargetCr] = useState(5);
  const [tacticalRoleId, setTacticalRoleId] = useState("brute");
  const [monsterTierId, setMonsterTierId] = useState("normal");
  const [tempoProfileId, setTempoProfileId] = useState("standard");
  const [rulesetId] = useState(DEFAULT_MONSTER_RULESET_ID);
  const [selected, setSelected] = useState({});
  const [composerStarted, setComposerStarted] = useState(false);
  const [startMode, setStartMode] = useState("");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [, setDraggedFeatureId] = useState(null);
  const [activeSlot, setActiveSlot] = useState("");
  const [composerStageMode, setComposerStageMode] = useState("frame");
  const [stageTransition, setStageTransition] = useState("");
  const stageTransitionTimersRef = useRef([]);
  const [customMonsterName, setCustomMonsterName] = useState("");
  const [viewMode, setViewMode] = useState("composer");
  const [advancedMode, setAdvancedMode] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [slotCaps, setSlotCaps] = useState(DEFAULT_SLOT_CAPS);
  const [activePresetId, setActivePresetId] = useState("");
  const [navigatorSearch, setNavigatorSearch] = useState("");
  const [navigatorFiltersOpen, setNavigatorFiltersOpen] = useState(false);
  const [navigatorPackFilter, setNavigatorPackFilter] = useState("all");
  const [componentNavigatorOpen, setComponentNavigatorOpen] = useState(false);
  const [componentNavigatorMode, setComponentNavigatorMode] = useState("slot");
  const [navigatorSlotFilter, setNavigatorSlotFilter] = useState("all");
  const [exportCopyStatus, setExportCopyStatus] = useState("");
  const [statBlockMode, setStatBlockMode] = useState("standard");
  const [liveExportPopoutOpen, setLiveExportPopoutOpen] = useState(false);
  const [showBuildGuide, setShowBuildGuide] = useComposerBuildGuidePreference(true);

  const creatureType = CREATURE_TYPES.find((type) => type.id === typeId) || CREATURE_TYPES[0];
  const role = ROLES.find((item) => item.id === roleId) || ROLES[1];
  const danger = DANGERS.find((item) => item.id === dangerId) || DANGERS[0];
  const source = SOURCES.find((item) => item.id === sourceId) || SOURCES[0];
  const tacticalRole =
    TACTICAL_ROLES.find((item) => item.id === tacticalRoleId) || TACTICAL_ROLES[0];
  const monsterTier = MONSTER_TIERS.find((item) => item.id === monsterTierId) || MONSTER_TIERS[0];
  const tempoProfile =
    TEMPO_PROFILES.find((item) => item.id === tempoProfileId) || TEMPO_PROFILES[1];
  const activeRuleset = getMonsterRuleset(rulesetId);
  const activeRulesetOption = getMonsterRulesetOption(rulesetId);

  useEffect(() => {
    if (!inspirationSeed?.sourceAnchorId) return;

    const sourceExists = SOURCES.some((item) => item.id === inspirationSeed.sourceAnchorId);
    if (!sourceExists) return;

    setSourceId(inspirationSeed.sourceAnchorId);
    setNavigatorSourceFilters([inspirationSeed.sourceAnchorId]);
    setComposerStarted(true);
    setStartMode("scratch");
    setComposerStageMode("grafts");
    setViewMode("composer");
    setComponentNavigatorMode("global");
    setComponentNavigatorOpen(true);
  }, [inspirationSeed?.revision, inspirationSeed?.sourceAnchorId]);

  useEffect(() => {
    if (uiMode !== "debug") {
      setLiveExportPopoutOpen(false);
    }
  }, [uiMode]);

  useEffect(() => {
    if (uiMode === "debug") return;
    if (viewMode === "run") {
      setViewMode("export");
    }
  }, [uiMode, viewMode]);

  useEffect(() => () => clearStageTransitionTimers(), []);

  const framePowerProfile = useMemo(() => buildMonsterFramePowerProfile({
    role,
    tacticalRole,
    monsterTier,
    tempoProfile,
    danger,
    targetCr,
  }), [role, tacticalRole, monsterTier, tempoProfile, danger, targetCr]);

  const defaultBuildBudget = framePowerProfile.buildBudget ?? framePowerProfile.budget;
  const effectiveBuildBudget = defaultBuildBudget;
  const {
    pressureLimit: effectivePressureLimit,
    complexityCap: effectiveComplexityCap,
  } = resolveMonsterGuidanceLimits({
    framePowerProfile,
    advancedMode,
  });
  const composerMode = getComposerMode(advancedMode, customMode);
  const activePreset = getPresetById(activePresetId);
  const currentFrameContext = {
    roleId,
    tacticalRoleId,
    monsterTierId,
    tempoProfileId,
    dangerId,
    targetCr,
  };
  const currentNavigatorSlot =
    componentNavigatorMode === "global" ? navigatorSlotFilter : activeSlot;

  const contentPackOptions = useMemo(() => {
    const packsById = new Map();
    FEATURES.forEach((feature) => {
      const id = getContentPackId(feature);
      if (!id || packsById.has(id)) return;
      packsById.set(id, { id, title: getContentPackTitle(feature) });
    });
    return [...packsById.values()].sort((a, b) => a.title.localeCompare(b.title));
  }, [FEATURES]);

  const selectedFeatures = useMemo(
    () => getFeaturesFromSelection(selected),
    [selected, FEATURES],
  );
  const basicAttackCompilation = useMemo(
    () => ensureMonsterBasicAttackFeature(selectedFeatures, {
      targetCr,
      category,
      typeId,
      sourceId,
    }),
    [selectedFeatures, targetCr, category, typeId, sourceId],
  );
  const engineFeatures = basicAttackCompilation.features;

  const availableFeatures = useMemo(() => {
    const slotFilter = currentNavigatorSlot === "all" ? null : currentNavigatorSlot;
    const activeNavigatorSourceFilters = Array.isArray(navigatorSourceFilters)
      ? navigatorSourceFilters
      : [];
    return LOCALIZED_MONSTER_FEATURES.map((feature) => ({
      feature,
      status: getCompatibilityStatus(feature, selectedFeatures, typeId, category, { activePreset }),
    }))
      .filter(({ feature, status }) => {
        const packMatch =
          navigatorPackFilter === "all" || getContentPackId(feature) === navigatorPackFilter;
        const frameMatch = customMode
          ? featureMatchesSourceAndSlot(feature, activeNavigatorSourceFilters, slotFilter)
          : featureMatchesFrame(feature, activeNavigatorSourceFilters, typeId, roleId, slotFilter, currentFrameContext);
        return packMatch && frameMatch && canShowFeatureForMode(status, composerMode);
      })
      .sort((a, b) => {
        const aDecision = getFeatureDecisionProfile(a.feature, {
          status: a.status,
          selected,
          selectedFeatures,
          typeId,
          category,
          activePreset,
          roleId,
          tacticalRoleId,
          monsterTierId,
          tempoProfileId,
          dangerId,
          targetCr,
          currentSlot: currentNavigatorSlot,
        });
        const bDecision = getFeatureDecisionProfile(b.feature, {
          status: b.status,
          selected,
          selectedFeatures,
          typeId,
          category,
          activePreset,
          roleId,
          tacticalRoleId,
          monsterTierId,
          tempoProfileId,
          dangerId,
          targetCr,
          currentSlot: currentNavigatorSlot,
        });
        const slotSort =
          SLOTS.findIndex((slot) => slot.id === a.feature.slot) -
          SLOTS.findIndex((slot) => slot.id === b.feature.slot);
        return (
          getFeatureDecisionRank(aDecision) - getFeatureDecisionRank(bDecision) ||
          slotSort ||
          a.feature.cost - b.feature.cost ||
          a.feature.title.localeCompare(b.feature.title)
        );
      })
      .map(({ feature }) => feature);
  }, [
    FEATURES,
    sourceId,
    navigatorSourceFilters,
    typeId,
    roleId,
    navigatorPackFilter,
    currentNavigatorSlot,
    selectedFeatures,
    selected,
    category,
    activePreset,
    composerMode,
    customMode,
    tacticalRoleId,
    monsterTierId,
    tempoProfileId,
    dangerId,
    targetCr,
  ]);

  const compatibleCount = useMemo(() => {
    return LOCALIZED_MONSTER_FEATURES.map((feature) => ({
      feature,
      status: getCompatibilityStatus(feature, selectedFeatures, typeId, category, { activePreset }),
    })).filter(({ feature, status }) => {
      const frameMatch = customMode
        ? feature.source === sourceId
        : featureMatchesFrame(feature, sourceId, typeId, roleId, null, currentFrameContext);
      return frameMatch && canShowFeatureForMode(status, composerMode);
    }).length;
  }, [FEATURES, sourceId, typeId, roleId, selectedFeatures, category, activePreset, composerMode, customMode, tacticalRoleId, monsterTierId, tempoProfileId, dangerId, targetCr]);

  const computed = useMemo(() => {
    const partyTier = getTier(partyLevel);
    const prof = getProfForCr(targetCr);
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
    const abilityModel = buildMonsterAbilitiesFromFeatures(engineFeatures);
    const counterplayProfiles = selectedFeatures.map((feature) =>
      getFeatureCounterplayProfile(feature)
    );
    const cost = selectedFeatures.reduce((sum, feature) => sum + feature.cost, 0);
    const buildBudget = effectiveBuildBudget;
    const budget = effectivePressureLimit;
    const targetHpValue = Math.max(1, Math.round(baseHp + (statMods.hp || 0)));
    const targetAcValue = clamp(baseAc + (statMods.ac || 0), 10, 28);
    const targetDprValue = Math.max(1, Math.round(baseDpr + (statMods.dpr || 0)));
    const targetDcValue = clamp(baseDc + Math.floor((statMods.control || 0) / 3), 10, 30);
    const targetAttackValue = clamp(baseAttack, 2, 18);
    const crFit = buildClosedLoopCrFit({
      activeRuleset,
      targetCr,
      typeId,
      category,
      roleId,
      selectedFeatures: engineFeatures,
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
    const pressureComplexityAbilityModel = buildMonsterAbilitiesFromFeatures(engineFeatures, { targetCr });
    const pressureProfile = buildPressureProfile({
      targetCr,
      limit: effectivePressureLimit,
      abilityModel: pressureComplexityAbilityModel,
      attackRoutine: dprProfile?.attackRoutine || null,
      selectedFeatures,
    });
    const complexityProfile = buildComplexityProfile({
      limit: effectiveComplexityCap,
      abilityModel: pressureComplexityAbilityModel,
      attackRoutine: dprProfile?.attackRoutine || null,
      selectedFeatures,
    });
    const pressure = pressureProfile.score;
    const complexity = complexityProfile.score;
    const counterplayAudit = buildCounterplayAudit({
      selected,
      roleId,
      monsterTier,
      pressureProfile,
      complexityProfile,
      mechanicsSummary,
      counterplayProfiles,
    });
    const profileDeltas = buildMonsterComposerProfileDeltas(printedStats, effectiveProfile, baseline);
    const bestiaryBaselineAudit = buildBestiaryBaselineAudit({
      targetCr,
      monsterTier,
      printedStats,
      effectiveProfile,
      mechanicsSummary,
    });
    const estimatedCr = crValidation.estimatedCr;
    const generatedName = buildName(typeId, category, selectedFeatures);
    const name = customMonsterName.trim() || generatedName;
    const rulesContext = {
      typeId,
      creatureType: creatureType.label,
      category,
      categoryNoun: String(category || "monster").toLowerCase(),
    };
    const effectivePower = effectiveProfile.combatPowerEstimate;
    const baselinePower = Math.round(
      baseline.hp * baseline.dpr * ((baseline.ac + baseline.attackBonus - 2) / 13)
    );

    const warnings = [];
    framePowerProfile.diagnostics
      .filter((diagnostic) => shouldSurfaceDiagnosticAsWarning(
        { ...diagnostic, area: "frame-power-stack", check: diagnostic.code || "frame-power-diagnostic" },
        { targetCr, estimatedCr },
      ))
      .forEach((diagnostic) => {
        warnings.push(`Frame Power: ${diagnostic.message}${diagnostic.detail ? ` ${diagnostic.detail}` : ""}`);
      });
    crFitProfile.diagnostics
      .filter((diagnostic) => shouldSurfaceDiagnosticAsWarning(
        { ...diagnostic, area: "cr-fitting", check: diagnostic.code || "cr-fitting-diagnostic" },
        { targetCr, estimatedCr },
      ))
      .forEach((diagnostic) => {
        warnings.push(`CR Fitting: ${diagnostic.message}${diagnostic.detail ? ` ${diagnostic.detail}` : ""}`);
      });
    if (pressure > budget)
      warnings.push(
        `Player-facing Pressure exceeds the recommended CR ${targetCr} limit by ${pressure - budget}. You can continue, but the monster asks the party to process more tactical systems than this CR normally supports.`
      );
    if (complexity > effectiveComplexityCap)
      warnings.push(
        `DM Complexity exceeds the recommended handling limit by ${complexity - effectiveComplexityCap}. You can continue, but the monster will require additional decisions, triggers, or state tracking at the table.`
      );
    if (!hasSelectedSlot(selected, "weakness"))
      warnings.push(
        "No Weakness / Tell selected. Add counterplay before using this as horror, otherwise it may feel arbitrary."
      );
    if (
      roleId === "boss" &&
      !hasSelectedSlot(selected, "twist") &&
      !hasSelectedSlot(selected, "lair")
    )
      warnings.push(
        "Boss lacks action-economy pressure. Add a Combat Twist, Lair Effect, or minions."
      );
    if ((statMods.control || 0) >= 5 && !hasSelectedSlot(selected, "weakness"))
      warnings.push("Control pressure is high and currently has no clear player-facing answer.");
    if (roleId === "minion" && complexity > 4)
      warnings.push("Minions should be simple. Keep only one memorable feature.");
    if (hp > baseline.hp * 1.45 && monsterTier.id === "normal")
      warnings.push(
        "HP is far above the normal CR baseline. Consider Elite, Boss, Legendary, or reduce defensive grafts."
      );
    if (dpr > baseline.dpr * 1.4 && monsterTier.id !== "legendary")
      warnings.push(
        "Printed DPR is far above baseline. Treat this as an Elite/Boss profile or reduce offensive grafts."
      );
    if (effectiveProfile.effectiveDpr3Round > baseline.dpr * 1.35 && monsterTier.id === "normal")
      warnings.push(
        "Effective DPR is above the normal CR baseline once control, mobility, and tempo are considered. Consider Elite/Boss tier or lower offensive pressure."
      );
    if (effectiveProfile.burstDpr > baseline.dpr * 1.75)
      warnings.push(
        "Burst DPR spike is high. Add a recharge, telegraph, setup requirement, or reduce opening damage."
      );
    if (effectiveProfile.combatPowerEstimate > baselinePower * 1.7 && monsterTier.id === "normal")
      warnings.push(
        "Effective combat power is much higher than baseline. Consider raising Tier or lowering HP/DPR/control grafts."
      );
    bestiaryBaselineAudit.issues.forEach((issue) => {
      warnings.push(`Bestiary Baseline: ${issue.message} ${issue.detail}`);
    });
    dprProfile.assumptions.forEach((assumption) => {
      if (dprProfile.fallbackUsed && assumption.includes("fallback")) warnings.push(`DPR Simulator: ${assumption}`);
    });
    const attackRoutine = dprProfile.attackRoutine;
    if (Number(targetCr || 0) >= 5 && !attackRoutine?.enabled && selectedFeatures.some(isScalableMainActionFeature)) {
      warnings.push("Multiattack Planner: no attack routine was generated for a high-CR scalable action. Confirm that this is an intentional single heavy attack or enable Multiattack participation in Content Studio.");
    }
    if (attackRoutine?.enabled) {
      const largestPerUseAverage = Math.max(
        0,
        ...Object.values(attackRoutine.allocations || {}).map((allocation) => Number(allocation.averagePerUse || 0)),
      );
      if (largestPerUseAverage > Number(attackRoutine.preferredSingleHitCap || largestPerUseAverage) * 1.25) {
        warnings.push("Multiattack Planner: one routine attack remains substantially above the bestiary-derived per-hit range. Increase the attack count or review its maximum-use and rider constraints.");
      }
      (attackRoutine.diagnostics || [])
        .filter((diagnostic) => diagnostic.severity !== "info")
        .forEach((diagnostic) => warnings.push(`Multiattack Planner: ${diagnostic.message}`));
    }
    // Multiple main-action alternatives are expected on many D&D monsters. The DPR simulator
    // records this as informational diagnostics instead of surfacing it as a publish warning.
    crValidation.issues.forEach((issue) => {
      warnings.push(`CR Validator: ${issue.message}${issue.detail ? ` ${issue.detail}` : ""}`);
    });
    dndRules.validation.issues.forEach((issue) => {
      warnings.push(`D&D Rules: ${issue.message}${issue.detail ? ` ${issue.detail}` : ""}`);
    });
    abilityModel.validation.errors.forEach((issue) => {
      warnings.push(`Ability Model: ${issue.title}. ${issue.message}`);
    });
    if (
      tempoProfile.id === "legendary" &&
      !["boss", "legendary", "setpiece"].includes(monsterTier.id)
    )
      warnings.push(
        "Legendary tempo on a non-boss tier can feel overtuned. Consider Boss, Legendary, or a slower tempo profile."
      );
    if (mechanicsSummary.rechargeCount >= 3)
      warnings.push(
        "Too many recharge abilities. Consider converting one recharge effect into an at-will minor action or a phase trigger."
      );
    if (
      mechanicsSummary.reactionCount >= 3 &&
      !["boss", "legendary", "setpiece"].includes(monsterTier.id)
    )
      warnings.push(
        "Too many reaction hooks for a non-boss monster. Reduce reactions or raise the monster Tier."
      );
    if (mechanicsSummary.majorConditionCount >= 3)
      warnings.push(
        "Major condition load is high. Make sure at least one condition has a clear break condition, repeat save, or visible setup."
      );
    counterplayAudit.issues.forEach((issue) => {
      warnings.push(`Counterplay Audit: ${issue.label}. ${issue.detail}`);
    });

    selectedFeatures.forEach((feature) => {
      const compatibilityWarning = buildCompatibilityWarning(
        feature,
        getCompatibilityStatus(feature, selectedFeatures, typeId, category, { activePreset })
      );
      if (compatibilityWarning) warnings.push(compatibilityWarning);

      const rulesValidation = validateMonsterGraftRules(feature);
      rulesValidation.issues
        .filter((issue) => issue.severity === "error")
        .forEach((issue) => {
          warnings.push(`Rules Schema: ${feature.title}. ${issue.message}`);
        });
    });

    const balanceRecommendations = buildBalanceRecommendations({
      selected,
      selectedFeatures,
      typeId,
      category,
      activePreset,
      roleId,
      sourceId,
      composerMode,
      customMode,
      tacticalRoleId,
      monsterTierId,
      tempoProfileId,
      dangerId,
      targetCr,
      monsterTier,
      tempoProfile,
      pressure,
      budget,
      complexity,
      complexityCap: effectiveComplexityCap,
      counterplayAudit,
      mechanicsSummary,
      baseline,
      hp,
      dpr,
      effectiveProfile,
      dprProfile,
      crValidation,
    });

    return {
      tier: partyTier,
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
      bestiaryBaselineAudit,
      framePowerProfile,
      basicAttackFallbackProfile: {
        version: basicAttackCompilation.version,
        targetCr,
        ...basicAttackCompilation.profile,
      },
      scalableMainActionGateProfile: {
        version: "scalable-main-action-gate-v1.32-basic-fallback",
        targetCr,
        highCr: Number(targetCr || 0) >= 5,
        scalableActionCount: engineFeatures.filter(isScalableMainActionFeature).length,
        status: basicAttackCompilation.profile.status,
        fallbackFeature: basicAttackCompilation.profile.fallbackFeature || null,
      },
      crFitProfile,
      dprProfile,
      attackRoutine: dprProfile?.attackRoutine || null,
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
      effectivePower,
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
      pressureLimit: effectivePressureLimit,
      buildBudget,
      cost,
      pressure,
      complexity,
      complexityCap: effectiveComplexityCap,
      estimatedCr,
      name,
      warnings: uniqueArray(warnings),
      balanceRecommendations,
      damageText: dndRules.damage.defaultAttack.text,
      statMods,
    };
  }, [
    partyLevel,
    role,
    roleId,
    danger,
    creatureType,
    selectedFeatures,
    engineFeatures,
    basicAttackCompilation,
    customMonsterName,
    selected,
    typeId,
    category,
    sourceId,
    composerMode,
    customMode,
    framePowerProfile,
    effectiveBuildBudget,
    effectivePressureLimit,
    effectiveComplexityCap,
    targetCr,
    tacticalRole,
    monsterTier,
    tempoProfile,
    rulesetId,
    activeRuleset,
    activeRulesetOption,
  ]);

  function selectType(nextTypeId) {
    if (isCreatureTypeUnavailable(nextTypeId)) return;
    const nextType = CREATURE_TYPES.find((type) => type.id === nextTypeId) || CREATURE_TYPES[0];
    setTypeId(nextType.id);
    setCategory(getDefaultCreatureCategory(nextType));
    setSelected({});
    setActivePresetId("");
  }

  function applyPreset(preset) {
    if (!preset) return;
    const presetType =
      CREATURE_TYPES.find((type) => type.id === preset.typeId) || CREATURE_TYPES[0];
    const nextCategory = presetType.categories.includes(preset.category)
      ? preset.category
      : getDefaultCreatureCategory(presetType);
    const nextSelection = normalizePresetSelection(preset);
    setTypeId(preset.typeId);
    setCategory(nextCategory);
    setRoleId(preset.roleId);
    setSourceId(preset.source);
    setDangerId(preset.dangerId);
    setTargetCr(preset.targetCr);
    setTacticalRoleId(preset.tacticalRoleId);
    setMonsterTierId(preset.monsterTierId);
    setTempoProfileId(preset.tempoProfileId);
    setSelected(nextSelection);
    setActiveSlot("");
    setActivePresetId(preset.id);
  }

  function startFromTemplate(preset) {
    if (!preset) return;
    applyPreset(preset);
    setStartMode("template");
    setComposerStarted(true);
    setTemplatePickerOpen(false);
    setCustomMonsterName("");
  }

  function openTemplatePicker() {
    setTemplatePickerOpen(true);
  }

  function startFromScratch() {
    function enterScratchComposer() {
      setSelected({});
      setActivePresetId("");
      setCustomMonsterName("");
      setStartMode("scratch");
      setComposerStageMode("frame");
      setComposerStarted(true);
      setTemplatePickerOpen(false);
      setComponentNavigatorOpen(false);
      setComponentNavigatorMode("slot");
      setNavigatorSlotFilter("body");
      setNavigatorSearch("");
      setNavigatorSourceFilters(["decomposition"]);
      setNavigatorFiltersOpen(false);
      setNavigatorPackFilter("all");
      setActiveSlot("");
      setViewMode("composer");
    }

    clearStageTransitionTimers();

    if (shouldReduceMonsterMotion() || typeof window === "undefined") {
      setStageTransition("");
      enterScratchComposer();
      return;
    }

    setStageTransition("start-to-frame-exit");

    const exitTimer = window.setTimeout(() => {
      enterScratchComposer();
      setStageTransition("start-to-frame-enter");

      const enterTimer = window.setTimeout(() => {
        setStageTransition("");
        stageTransitionTimersRef.current = [];
      }, MONSTER_STAGE_TRANSITION_ENTER_MS);

      stageTransitionTimersRef.current = [enterTimer];
    }, MONSTER_STAGE_TRANSITION_EXIT_MS);

    stageTransitionTimersRef.current = [exitTimer];
  }

  function startOver() {
    clearStageTransitionTimers();
    setSelected({});
    setActivePresetId("");
    setCustomMonsterName("");
    setStartMode("");
    setComposerStarted(false);
    setComposerStageMode("frame");
    setStageTransition("");
    setTemplatePickerOpen(false);
    setComponentNavigatorOpen(false);
    setComponentNavigatorMode("slot");
    setNavigatorSlotFilter("body");
    setNavigatorSearch("");
    setNavigatorSourceFilters(["decomposition"]);
    setNavigatorFiltersOpen(false);
    setNavigatorPackFilter("all");
    setActiveSlot("");
    setViewMode("composer");
  }

  function addFeature(feature) {
    const status = getCompatibilityStatus(feature, selectedFeatures, typeId, category, { activePreset });
    if (!canShowFeatureForMode(status, composerMode)) return;

    setActivePresetId("");
    setSelected((current) => {
      const slotCap = advancedMode ? getSlotCap(slotCaps, feature.slot) : 1;
      const currentIds = getSelectedIdsForSlot(current, feature.slot);
      if (currentIds.includes(feature.id)) return current;
      if (slotCap > 1 && currentIds.length >= slotCap) return current;
      const nextIds = slotCap <= 1 ? [feature.id] : [...currentIds, feature.id];
      return { ...current, [feature.slot]: slotCap <= 1 ? nextIds[0] : nextIds };
    });
    setActiveSlot(feature.slot);
  }

  function removeSlot(slotId) {
    setActivePresetId("");
    setSelected((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
  }

  function removeFeature(slotId, featureId) {
    setActivePresetId("");
    setSelected((current) => {
      const currentIds = getSelectedIdsForSlot(current, slotId);
      const nextIds = currentIds.filter((id) => id !== featureId);
      const next = { ...current };
      if (!nextIds.length) {
        delete next[slotId];
        return next;
      }
      next[slotId] = Array.isArray(current[slotId]) ? nextIds : nextIds[0];
      return next;
    });
  }


  function forgeMonster() {
    setComposerStarted(true);
    setStartMode((current) => current || "scratch");
    setTemplatePickerOpen(false);
    const priority = getForgePriority(roleId);
    const budget = effectiveBuildBudget;
    const next = {};
    let runningCost = 0;

    priority.forEach((slotId) => {
      const slotCap = advancedMode ? getSlotCap(slotCaps, slotId) : 1;
      const picks = [];

      for (let index = 0; index < slotCap; index += 1) {
        const partialFeatures = getFeaturesFromSelection(next);
        const candidates = FEATURES.map((feature) => ({
          feature,
          status: getCompatibilityStatus(feature, partialFeatures, typeId, category, { activePreset }),
        }))
          .filter(({ feature, status }) => {
            const alreadyPicked =
              picks.includes(feature.id) ||
              getSelectedIdsForSlot(next, slotId).includes(feature.id);
            const frameMatch = customMode
              ? featureMatchesSourceAndSlot(feature, sourceId, slotId)
              : featureMatchesFrame(feature, sourceId, typeId, roleId, slotId, currentFrameContext);
            return !alreadyPicked && frameMatch && canShowFeatureForMode(status, composerMode);
          })
          .sort((a, b) => {
            const aDecision = getFeatureDecisionProfile(a.feature, {
              status: a.status,
              selected: next,
              selectedFeatures: partialFeatures,
              typeId,
              category,
              activePreset,
              roleId,
              tacticalRoleId,
              monsterTierId,
              tempoProfileId,
              dangerId,
              targetCr,
              currentSlot: slotId,
            });
            const bDecision = getFeatureDecisionProfile(b.feature, {
              status: b.status,
              selected: next,
              selectedFeatures: partialFeatures,
              typeId,
              category,
              activePreset,
              roleId,
              tacticalRoleId,
              monsterTierId,
              tempoProfileId,
              dangerId,
              targetCr,
              currentSlot: slotId,
            });
            return (
              getFeatureDecisionRank(aDecision) - getFeatureDecisionRank(bDecision) ||
              getCompatibilityRank(a.status) - getCompatibilityRank(b.status) ||
              a.feature.cost - b.feature.cost
            );
          })
          .map(({ feature }) => feature);
        const remainingBudget = Math.max(0, budget - runningCost + (roleId === "boss" ? 3 : 0));
        const picked = pickForgeCandidate(candidates, slotId, remainingBudget, roleId, currentFrameContext);
        if (!picked) break;
        picks.push(picked.id);
        runningCost += Math.max(0, picked.cost);
        if (!advancedMode) break;
      }

      if (!picks.length) return;
      next[slotId] = slotCap <= 1 ? picks[0] : picks;
    });

    setSelected(next);
    setActivePresetId("");
    setActiveSlot(priority.find((slotId) => !next[slotId]) || "attack");
  }

  function resetBuild() {
    startOver();
  }

  function handleAdvancedModeToggle() {
    if (advancedMode) {
      setSelected((current) => collapseSelectedToSingle(current));
      setSlotCaps(DEFAULT_SLOT_CAPS);
      setAdvancedMode(false);
      return;
    }

    setAdvancedMode(true);
  }

  function handleSlotCapChange(slotId, value) {
    const nextValue = clamp(Number(value || 1), 1, 4);
    setActivePresetId("");
    setSlotCaps((current) => {
      const next = { ...current, [slotId]: nextValue };
      setSelected((selectedCurrent) => trimSelectedToCaps(selectedCurrent, next));
      return next;
    });
  }

  function handleCustomModeToggle() {
    setActivePresetId("");
    setCustomMode((current) => !current);
  }

  const pressurePercent = clamp((computed.pressure / computed.pressureLimit) * 100, 0, 160);
  const complexityPercent = clamp((computed.complexity / computed.complexityCap) * 100, 0, 160);
  const abilityProfile = computed.abilityProfile || buildAbilityProfile(
    typeId,
    category,
    roleId,
    selectedFeatures,
    computed.prof,
    computed.rulesProfile
  );
  const sectionGroups = useMemo(() => groupFeaturesBySection(engineFeatures), [engineFeatures]);
  const traits = sectionGroups.trait || [];
  const actions = sectionGroups.action || [];
  const bonusActions = sectionGroups.bonusAction || [];
  const reactions = sectionGroups.reaction || [];
  const legendaryActions = sectionGroups.legendaryAction || [];
  const lairActions = sectionGroups.lairAction || [];
  const deathEffects = sectionGroups.death || [];
  const hasLegendaryActions = roleId === "boss";
  const xpValue = xpForCr(computed.targetCr);
  const xp = String(xpValue);
  const lairXp = hasSelectedSlot(selected, "lair") || lairActions.length
    ? String(xpForCr(Math.min(computed.targetCr + 1, 30)))
    : "";
  const selectedSlotCount = SLOTS.filter((slot) => hasSelectedSlot(selected, slot.id)).length;
  const selectedGraftCount = selectedFeatures.length;
  const slotCompletionPercent = clamp(Math.round((selectedSlotCount / SLOTS.length) * 100), 0, 100);
  const activeSlotData = SLOTS.find((slot) => slot.id === activeSlot) || null;
  const activeSlotFeatureIds = activeSlot ? getSelectedIdsForSlot(selected, activeSlot) : [];
  const activeSlotFeatures = activeSlotFeatureIds
    .map((id) => FEATURES.find((feature) => feature.id === id))
    .filter(Boolean);
  const activeSlotAvailableFeatures = useMemo(() => {
    if (!activeSlot) return [];
    return LOCALIZED_MONSTER_FEATURES.map((feature) => ({
      feature,
      status: getCompatibilityStatus(feature, selectedFeatures, typeId, category, { activePreset }),
    }))
      .filter(({ feature, status }) => {
        const frameMatch = customMode
          ? featureMatchesSourceAndSlot(feature, sourceId, activeSlot)
          : featureMatchesFrame(feature, sourceId, typeId, roleId, activeSlot, currentFrameContext);
        return frameMatch && canShowFeatureForMode(status, composerMode);
      })
      .map(({ feature }) => feature);
  }, [FEATURES, sourceId, typeId, roleId, activeSlot, selectedFeatures, category, activePreset, composerMode, customMode, tacticalRoleId, monsterTierId, tempoProfileId, dangerId, targetCr]);
  const activeAlternatives = activeSlotAvailableFeatures.filter(
    (feature) => !activeSlotFeatureIds.includes(feature.id)
  ).length;
  const visibleFeatures = useMemo(() => {
    const query = navigatorSearch.trim().toLowerCase();
    if (!query) return availableFeatures;
    return availableFeatures.filter((feature) => {
      const sourceLabel = SOURCES.find((item) => item.id === feature.source)?.label || "";
      const packLabel = getContentPackTitle(feature);
      const haystack = [
        feature.title,
        feature.summary,
        feature.mechanics,
        feature.counterplay,
        sourceLabel,
        packLabel,
        feature.slot,
        getSectionLabel(getFeatureSection(feature)),
        ...asArray(feature.tags),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [SOURCES, availableFeatures, navigatorSearch]);
  const guidedFlow = buildGuidedFlow({
    composerStarted,
    startMode,
    selected,
    computed,
    activePreset,
    stageMode: composerStageMode,
    viewMode,
    context: {
      name: computed.name,
      category,
      role: role.label,
      targetCr,
      source: source.label,
    },
  });

  const exportPayload = useMemo(() => {
    const exportText = buildExportText({
      name: computed.name,
      creatureType,
      category,
      role,
      danger,
      computed,
      abilityProfile,
      traits,
      actions,
      bonusActions,
      reactions,
      legendaryActions,
      lairActions,
      deathEffects,
      selectedFeatures,
      statBlockMode,
      hasLegendaryActions,
      xp,
      lairXp,
    });
    const exportJsonArgs = {
      name: computed.name,
      creatureType,
      category,
      role,
      danger,
      source,
      computed,
      abilityProfile,
      traits,
      actions,
      bonusActions,
      reactions,
      legendaryActions,
      lairActions,
      deathEffects,
      selectedFeatures,
      statBlockMode,
      activePreset,
      xp,
      lairXp,
    };
    const exportJson = buildExportJson(exportJsonArgs);
    const debugExportJson = buildDebugExportJson(exportJsonArgs);
    const statBlock = buildRenderableStatBlock({
      name: computed.name,
      creatureType,
      category,
      role,
      danger,
      computed,
      abilityProfile,
      traits,
      actions,
      bonusActions,
      reactions,
      legendaryActions,
      lairActions,
      deathEffects,
      selectedFeatures,
      statBlockMode,
      hasLegendaryActions,
      xp,
      lairXp,
    });
    const statBlockParse = parseMonsterRenderedStatBlock({
      exportText,
      statBlock,
      selectedFeatures,
      computed,
    });
    const exportReadiness = buildExportReadiness({
      computed,
      selected,
      selectedFeatures,
      traits,
      actions,
      weaknessFeatures: selectedFeatures.filter((feature) => feature.slot === "weakness"),
      deathEffects,
      lairActions,
      statBlockParse,
    });
    const exportRunSheet = buildExportRunSheet({
      computed,
      selectedFeatures,
      traits,
      actions,
      bonusActions,
      reactions,
      deathEffects,
      lairActions,
    });

    return {
      exportText,
      exportJson,
      debugExportJson,
      statBlock,
      statBlockParse,
      exportReadiness,
      exportRunSheet,
    };
  }, [
    computed,
    creatureType,
    category,
    role,
    danger,
    source,
    abilityProfile,
    traits,
    actions,
    bonusActions,
    reactions,
    legendaryActions,
    lairActions,
    deathEffects,
    selectedFeatures,
    statBlockMode,
    activePreset,
    xp,
    selected,
    hasLegendaryActions,
  ]);

  const liveExportButton = uiMode === "debug" ? (
    <button
      className={`monster-persistent-view-toolbar__debug cruor-stat-block__popout-btn ${liveExportPopoutOpen ? "is-active" : ""}`}
      type="button"
      aria-label={liveExportPopoutOpen ? "Close live export popout" : "Open live export popout"}
      title={liveExportPopoutOpen ? "Close live export popout" : "Open live export popout"}
      aria-pressed={liveExportPopoutOpen}
      onClick={() => setLiveExportPopoutOpen((open) => !open)}
    >
      <i className="fa-solid fa-up-right-from-square" aria-hidden="true" />
      <span className="sr-only">{liveExportPopoutOpen ? "Close live export" : "Open live export"}</span>
    </button>
  ) : null;

  const monsterViewToolbar = viewMode !== "composer" ? (
    <MonsterPersistentViewToolbar
      activeView={viewMode}
      uiMode={uiMode}
      onSetView={setViewMode}
    />
  ) : null;

  const persistentViewToolbar = viewMode !== "composer" && viewMode !== "export" ? monsterViewToolbar : null;

  const monsterWorkflowFooter = composerStarted ? (
    <GuidedFlowPanel
      guidedFlow={guidedFlow}
      onOpenStart={openTemplatePicker}
      onFocusSlot={openSlotNavigator}
      onOpenBalance={() => setViewMode("balance")}
      onOpenExport={() => setViewMode("export")}
      onOpenTemplates={openTemplatePicker}
      onOpenChassis={() => {
        setViewMode("composer");
        setComposerStageModeFromNavigation("frame");
      }}
      onOpenGrafts={() => {
        setViewMode("composer");
        setComposerStageModeFromNavigation("grafts");
      }}
      showBuildGuide={showBuildGuide}
      onShowBuildGuideChange={setShowBuildGuide}
    />
  ) : null;

  const renderExportWorkbench = ({ includeViewToolbar = viewMode === "export" } = {}) => (
    <ExportWorkbench
      exportText={exportPayload.exportText}
      exportJson={exportPayload.exportJson}
      debugExportJson={exportPayload.debugExportJson}
      statBlock={exportPayload.statBlock}
      exportReadiness={exportPayload.exportReadiness}
      exportRunSheet={exportPayload.exportRunSheet}
      exportCopyStatus={exportCopyStatus}
      statBlockMode={statBlockMode}
      uiMode={uiMode}
      onSetStatBlockMode={setStatBlockMode}
      onCopyExportPayload={copyExportPayload}
      onOpenBalance={() => setViewMode("balance")}
      viewToolbar={includeViewToolbar ? monsterViewToolbar : null}
      liveExportButton={includeViewToolbar ? liveExportButton : null}
      workflowFooter={monsterWorkflowFooter}
    />
  );

  function clearStageTransitionTimers() {
    stageTransitionTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    stageTransitionTimersRef.current = [];
  }

  function shouldReduceMonsterMotion() {
    return typeof window !== "undefined"
      && typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setComposerStageModeImmediately(nextStageMode, { clearSlot = nextStageMode === "grafts" } = {}) {
    clearStageTransitionTimers();
    setStageTransition("");
    setComposerStageMode(nextStageMode);
    if (clearSlot) {
      setActiveSlot("");
    }
  }

  function setComposerStageModeFromNavigation(nextStageMode) {
    if (!nextStageMode || nextStageMode === composerStageMode) {
      if (nextStageMode === "grafts") {
        setActiveSlot("");
      }
      return;
    }

    const transitionName = `${composerStageMode}-to-${nextStageMode}`;
    const canAnimateStageTransition = composerStarted
      && viewMode === "composer"
      && !componentNavigatorOpen
      && !stageTransition
      && !shouldReduceMonsterMotion()
      && (transitionName === "frame-to-grafts" || transitionName === "grafts-to-frame");

    if (!canAnimateStageTransition) {
      setComposerStageModeImmediately(nextStageMode);
      return;
    }

    clearStageTransitionTimers();
    setStageTransition(`${transitionName}-exit`);

    const exitTimer = window.setTimeout(() => {
      setComposerStageMode(nextStageMode);
      if (nextStageMode === "grafts") {
        setActiveSlot("");
      }
      setStageTransition(`${transitionName}-enter`);

      const enterTimer = window.setTimeout(() => {
        setStageTransition("");
        stageTransitionTimersRef.current = [];
      }, MONSTER_STAGE_TRANSITION_ENTER_MS);

      stageTransitionTimersRef.current = [enterTimer];
    }, MONSTER_STAGE_TRANSITION_EXIT_MS);

    stageTransitionTimersRef.current = [exitTimer];
  }

  function openSlotNavigator(slotId) {
    if (!composerStarted) return;
    setComposerStageModeImmediately("grafts", { clearSlot: false });
    setActiveSlot(slotId);
    setNavigatorSlotFilter(slotId);
    setNavigatorSearch("");
    setNavigatorSourceFilters([sourceId]);
    setNavigatorFiltersOpen(false);
    setComponentNavigatorMode("slot");
    setComponentNavigatorOpen(true);
  }

  function openGlobalNavigator() {
    if (!composerStarted) return;
    setComposerStageModeImmediately("grafts");
    setComponentNavigatorMode("global");
    setNavigatorSlotFilter("all");
    setNavigatorSearch("");
    setNavigatorSourceFilters([sourceId]);
    setNavigatorFiltersOpen(false);
    setComponentNavigatorOpen(true);
  }


  function closeComponentNavigator() {
    setComponentNavigatorOpen(false);
    setActiveSlot("");
  }

  useEffect(() => {
    if (!componentNavigatorOpen) return;

    function handleComponentNavigatorOutsidePointerDown(event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".component-navigator-modal__panel, .component-navigator-modal__rail, .anatomy-stage__navigator-column")) {
        return;
      }
      closeComponentNavigator();
    }

    document.addEventListener("pointerdown", handleComponentNavigatorOutsidePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handleComponentNavigatorOutsidePointerDown, true);
    };
  }, [componentNavigatorOpen]);

  function handleBalanceRecommendationAction(action) {
    if (!action) return;

    if (action.kind === "addFeature" && action.featureId) {
      const feature = FEATURES.find((item) => item.id === action.featureId);
      if (!feature) return;
      addFeature(feature);
      setActiveSlot(feature.slot);
      setViewMode("balance");
      return;
    }

    if (action.kind === "removeFeature" && action.featureId) {
      const feature = FEATURES.find((item) => item.id === action.featureId);
      if (!feature) return;
      removeFeature(feature.slot, feature.id);
      setViewMode("balance");
      return;
    }

    if (action.kind === "replaceFeature" && action.removeFeatureId && action.addFeatureId) {
      const removeTarget = FEATURES.find((item) => item.id === action.removeFeatureId);
      const addTarget = FEATURES.find((item) => item.id === action.addFeatureId);
      if (!removeTarget || !addTarget) return;
      setActivePresetId("");
      setSelected((current) => {
        const next = getSelectedWithoutFeature(current, removeTarget);
        const slotCap = advancedMode ? getSlotCap(slotCaps, addTarget.slot) : 1;
        const currentIds = getSelectedIdsForSlot(next, addTarget.slot);
        if (currentIds.includes(addTarget.id)) return next;
        if (slotCap <= 1) return { ...next, [addTarget.slot]: addTarget.id };
        if (currentIds.length >= slotCap) return next;
        return { ...next, [addTarget.slot]: [...currentIds, addTarget.id] };
      });
      setActiveSlot(addTarget.slot);
      setViewMode("balance");
      return;
    }

    if (action.kind === "slot" && action.slotId) {
      setViewMode("composer");
      openSlotNavigator(action.slotId);
      return;
    }

    if (action.kind === "tier" && action.tierId) {
      setMonsterTierId(action.tierId);
      setActivePresetId("");
      setViewMode("balance");
      return;
    }

    if (action.kind === "advanced") {
      if (!advancedMode) handleAdvancedModeToggle();
      setViewMode("balance");
      return;
    }

    if (action.kind === "frame") {
      setComposerStageMode("frame");
      setViewMode("composer");
      return;
    }

    if (action.kind === "view" && action.viewMode) {
      setViewMode(action.viewMode);
    }
  }

  function copyExportPayload(kind, payload) {
    if (!payload) return;
    setExportCopyStatus(`${kind}-copying`);
    const finish = (status) => {
      setExportCopyStatus(`${kind}-${status}`);
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          setExportCopyStatus((current) => (current === `${kind}-${status}` ? "" : current));
        }, 1600);
      }
    };

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(payload)
        .then(() => finish("copied"))
        .catch(() => finish(copyTextFallback(payload) ? "copied" : "failed"));
      return;
    }

    finish(copyTextFallback(payload) ? "copied" : "failed");
  }

  function handleAddFeatureFromNavigator(feature) {
    addFeature(feature);
    if (
      componentNavigatorMode === "slot" &&
      !(advancedMode && getSlotCap(slotCaps, feature.slot) > 1)
    ) {
      closeComponentNavigator();
    }
  }

  const componentNavigatorDrawer = (
    <ComponentNavigatorDrawer
      open={componentNavigatorOpen && viewMode === "composer" && composerStarted && composerStageMode === "grafts"}
      mode={componentNavigatorMode}
      activeSlot={activeSlot}
      navigatorSlotFilter={navigatorSlotFilter}
      setNavigatorSlotFilter={setNavigatorSlotFilter}
      navigatorPackFilter={navigatorPackFilter}
      setNavigatorPackFilter={setNavigatorPackFilter}
      navigatorSourceFilters={navigatorSourceFilters}
      setNavigatorSourceFilters={setNavigatorSourceFilters}
      contentPackOptions={contentPackOptions}
      setActiveSlot={setActiveSlot}
      onClose={closeComponentNavigator}
      visibleFeatures={visibleFeatures}
      selected={selected}
      selectedFeatures={selectedFeatures}
      typeId={typeId}
      category={category}
      activePreset={activePreset}
      roleId={roleId}
      tempoProfileId={tempoProfileId}
      dangerId={dangerId}
      targetCr={targetCr}
      computed={computed}
      sourceId={sourceId}
      setSourceId={setSourceId}
      setActivePresetId={setActivePresetId}
      navigatorSearch={navigatorSearch}
      setNavigatorSearch={setNavigatorSearch}
      navigatorFiltersOpen={navigatorFiltersOpen}
      setNavigatorFiltersOpen={setNavigatorFiltersOpen}
      advancedMode={advancedMode}
      slotCaps={slotCaps}
      composerMode={composerMode}
      customMode={customMode}
      addFeature={handleAddFeatureFromNavigator}
      setDraggedFeatureId={setDraggedFeatureId}
      getSlotCap={getSlotCap}
      buildSmartSlotPicks={buildSmartSlotPicks}
      buildFeatureDecisionProfile={getFeatureDecisionProfile}
      buildFeatureImpactPreview={buildFeatureImpactPreview}
    />
  );


  const isScrollableMonsterView = viewMode !== "composer";
  const monsterShellStyle = isScrollableMonsterView
    ? { height: "100%", minHeight: 0, overflowY: "auto", overflowX: "hidden" }
    : undefined;
  const monsterWorkspaceStyle = isScrollableMonsterView
    ? { minHeight: "100%", overflow: "visible", paddingBottom: "48px" }
    : undefined;

  return (
    <div
      className="cruor-composer-shell monster-composer monster-shell"
      data-composer-started={composerStarted ? "true" : "false"}
      data-start-mode={startMode || "unstarted"}
      data-template-picker-open={templatePickerOpen ? "true" : "false"}
      data-view-mode={viewMode}
      data-scrollable-view={isScrollableMonsterView ? "true" : "false"}
      style={monsterShellStyle}
    >
      <main
        className={`monster-workspace ${isScrollableMonsterView ? "monster-workspace--scrollable-view" : ""}`}
        style={monsterWorkspaceStyle}
      >
        {viewMode === "composer" && (
          <>
            <MonsterSilhouetteMap
                typeId={typeId}
                category={category}
                activePreset={activePreset}
                selected={selected}
                activeSlot={activeSlot}
                features={FEATURES}
                guidedSlotId={activeSlot ? guidedFlow.recommendedSlotId : ""}
                computed={computed}
                started={composerStarted}
                startMode={startMode}
                presetsCount={MONSTER_FAMILY_PRESETS.length}
                stageMode={composerStageMode}
                stageTransition={stageTransition}
                onSetStageMode={setComposerStageModeFromNavigation}
                creatureType={creatureType}
                role={role}
                roleId={roleId}
                targetCr={targetCr}
                tacticalRole={tacticalRole}
                tacticalRoleId={tacticalRoleId}
                monsterTier={monsterTier}
                monsterTierId={monsterTierId}
                tempoProfile={tempoProfile}
                tempoProfileId={tempoProfileId}
                danger={danger}
                dangerId={dangerId}
                monsterName={computed.name}
                onMonsterNameChange={setCustomMonsterName}
                onForgeMonster={forgeMonster}
                onOpenComponents={openGlobalNavigator}
                onOpenExport={() => setViewMode("export")}
                onStartOver={composerStarted ? startOver : undefined}
                composerStarted={composerStarted}
                onPickTemplate={openTemplatePicker}
                onBuildFromScratch={startFromScratch}
                showBuildGuide={showBuildGuide}
                onShowBuildGuideChange={setShowBuildGuide}
                onOpenFrame={() => setComposerStageModeFromNavigation("frame")}
                onFocusSlot={openSlotNavigator}
                selectType={selectType}
                setCategory={setCategory}
                setActivePresetId={setActivePresetId}
                setRoleId={setRoleId}
                setTargetCr={setTargetCr}
                setTacticalRoleId={setTacticalRoleId}
                setMonsterTierId={setMonsterTierId}
                setTempoProfileId={setTempoProfileId}
                setDangerId={setDangerId}
                componentNavigatorPanel={componentNavigatorOpen && viewMode === "composer" && composerStarted && composerStageMode === "grafts" ? componentNavigatorDrawer : null}
                workflowFooter={monsterWorkflowFooter}
              />

              {composerStarted && composerStageMode === "grafts" && activeSlotData && (
                <GraftInspector
                  slot={activeSlotData}
                  features={activeSlotFeatures}
                  alternatives={activeAlternatives}
                  source={source}
                  computed={computed}
                  onClear={() => removeSlot(activeSlot)}
                  onRemoveFeature={(featureId) => removeFeature(activeSlot, featureId)}
                />
              )}
          </>
        )}

        {persistentViewToolbar}

        {viewMode === "balance" && (
          <BalanceWorkbench
            computed={computed}
            pressurePercent={pressurePercent}
            complexityPercent={complexityPercent}
            showDiagnostics={uiMode === "debug"}
            onRecommendationAction={handleBalanceRecommendationAction}
            workflowFooter={monsterWorkflowFooter}
          />
        )}

        {uiMode === "debug" && viewMode === "run" &&
          (() => {
            const runSheet = buildRunModeSheet({
              name: computed.name,
              creatureType,
              category,
              role,
              danger,
              computed,
              selectedFeatures,
              traits,
              actions,
              bonusActions,
              reactions,
              lairActions,
              deathEffects,
            });
            return (
              <RunModePanel
                sheet={runSheet}
                recommendations={computed.balanceRecommendations}
                onAction={handleBalanceRecommendationAction}
                onOpenComposer={() => setViewMode("composer")}
                onOpenBalance={() => setViewMode("balance")}
                onOpenExport={() => setViewMode("export")}
              />
            );
          })()}

        {viewMode === "export" && renderExportWorkbench()}

        {uiMode === "debug" && liveExportPopoutOpen && (
          <LiveExportPopout
            title={`Cruor Stat Block · ${computed.name} · ${statBlockMode === "custom" ? "Custom" : "Standard"}`}
            onClose={() => setLiveExportPopoutOpen(false)}
          >
            <div className="monster-export-popout-stat-block">
              <RenderedStatBlock statBlock={exportPayload.statBlock} />
            </div>
          </LiveExportPopout>
        )}

        <TemplatePickerModal
          open={templatePickerOpen}
          presets={MONSTER_FAMILY_PRESETS}
          activePresetId={activePresetId}
          onApply={startFromTemplate}
          onClose={() => setTemplatePickerOpen(false)}
        />
      </main>
    </div>
  );
}



function MonsterPersistentViewToolbar({
  activeView,
  uiMode,
  onSetView,
}) {
  const views = [
    ["composer", "Composer"],
    ["balance", "Review"],
    ...(uiMode === "debug" ? [["run", "Run"]] : []),
    ["export", "Stat Block"],
  ];

  return (
    <nav className="monster-persistent-view-toolbar" aria-label="Monster view navigation">
      <div className="monster-persistent-view-toolbar__left">
        <div className="monster-persistent-view-toolbar__tabs" role="tablist" aria-label="Monster views">
          {views.map(([id, label]) => (
            <button
              key={id}
              className={`monster-persistent-view-toolbar__tab ${activeView === id ? "is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeView === id}
              onClick={() => onSetView?.(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}


function copyDocumentStylesToPopout(sourceDocument, targetDocument) {
  Array.from(sourceDocument.querySelectorAll('link[rel="stylesheet"], style')).forEach((node) => {
    targetDocument.head.appendChild(node.cloneNode(true));
  });
}

function LiveExportPopout({ title, children, onClose }) {
  const popoutRef = useRef(null);
  const [container, setContainer] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return undefined;

    const width = Math.min(1120, Math.max(820, Math.floor((window.screen?.availWidth || 1280) * 0.46)));
    const height = Math.min(1180, Math.max(720, Math.floor((window.screen?.availHeight || 900) * 0.9)));
    const left = Math.max(0, (window.screen?.availWidth || width) - width - 24);
    const top = 24;
    const popout = window.open(
      "",
      "cruor-monster-live-export",
      `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popout) {
      onClose?.();
      return undefined;
    }

    popoutRef.current = popout;
    popout.document.open();
    popout.document.write("<!doctype html><html><head></head><body></body></html>");
    popout.document.close();
    popout.document.title = title;
    popout.document.body.className =
      "cruor-composer-shell monster-composer monster-shell monster-export-popout-body";

    copyDocumentStylesToPopout(document, popout.document);

    const localStyle = popout.document.createElement("style");
    localStyle.textContent = `
      html, body {
        min-height: 100%;
        margin: 0;
        background: #050506;
      }
      body.monster-export-popout-body {
        overflow: auto;
        padding: 16px;
      }
      .monster-export-popout-root {
        display: grid;
        min-width: 0;
        place-items: start center;
      }
      .monster-export-popout-stat-block {
        max-width: 820px;
        width: 100%;
      }
    `;
    popout.document.head.appendChild(localStyle);

    const mountNode = popout.document.createElement("div");
    mountNode.className = "monster-export-popout-root";
    popout.document.body.appendChild(mountNode);
    setContainer(mountNode);
    popout.focus();

    const handleBeforeUnload = () => onClose?.();
    popout.addEventListener("beforeunload", handleBeforeUnload);

    const closeWatcher = window.setInterval(() => {
      if (popout.closed) {
        window.clearInterval(closeWatcher);
        onClose?.();
      }
    }, 500);

    return () => {
      window.clearInterval(closeWatcher);
      popout.removeEventListener("beforeunload", handleBeforeUnload);
      if (!popout.closed) popout.close();
      popoutRef.current = null;
    };
  }, []);

  useEffect(() => {
    const popout = popoutRef.current;
    if (!popout || popout.closed) return;
    popout.document.title = title;
  }, [title]);

  if (!container) return null;

  return createPortal(children, container);
}



function GraftInspector({
  slot,
  features,
  alternatives,
  source,
  computed,
  onClear,
  onRemoveFeature,
}) {
  const Icon = slot.icon;
  const installed = features.length > 0;

  return (
    <details
      className={`graft-inspector ${installed ? "has-feature" : "is-empty"}`}
      aria-label="Selected graft inspector"
    >
      <summary className="graft-inspector__head">
        <div>
          <h3>
            <Icon aria-hidden="true" /> {slot.label}
          </h3>
        </div>
        <div className="graft-inspector__status">
          <span>{source.label}</span>
          <strong>{installed ? `${features.length} Installed` : `${alternatives} Options`}</strong>
        </div>
      </summary>

      {installed ? (
        <div className="graft-inspector__content">
          <div className="graft-inspector__stack">
            {features.map((feature) => {
              const statEntries = getFeatureBalanceEntries(feature);
              const mechanicProfile = getFeatureMechanicProfile(feature);
              return (
                <article key={feature.id} className="graft-inspector__item">
                  <div className="graft-inspector__main">
                    <div className="graft-inspector__title-row">
                      <h4>{feature.title}</h4>
                      <button
                        type="button"
                        aria-label={`Remove ${feature.title}`}
                        onClick={() => onRemoveFeature(feature.id)}
                      >
                        <X aria-hidden="true" />
                      </button>
                    </div>
                    <p>{normalizeMonsterReferences(feature.summary, computed)}</p>
                  </div>

                  <div className="graft-inspector__rules">
                    <article>
                      <BookOpen aria-hidden="true" />
                      <div>
                        <strong>Mechanics</strong>
                        <p>{normalizeRulesText(feature.mechanics, computed)}</p>
                      </div>
                    </article>
                    <article>
                      <Shield aria-hidden="true" />
                      <div>
                        <strong>Counterplay</strong>
                        <p>{normalizeMonsterReferences(feature.counterplay, computed)}</p>
                      </div>
                    </article>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="graft-inspector__footer">
            <span>
              {alternatives} alternative{alternatives === 1 ? "" : "s"}
            </span>
            <button type="button" onClick={onClear}>
              Clear Slot
            </button>
          </div>
        </div>
      ) : (
        <div className="graft-inspector__empty">
          <p>{slot.hint}</p>
          <span>
            {alternatives} compatible graft{alternatives === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </details>
  );
}
