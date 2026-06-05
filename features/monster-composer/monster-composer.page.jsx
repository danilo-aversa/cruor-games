import { useEffect, useMemo, useState } from "react";
import "./monster-composer.styles.css";
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
  ALL_MONSTER_SOURCES as SOURCES,
  ALL_MONSTER_GRAFTS as FEATURES,
} from "./data/monster-content-pack-feed.js";

import { MONSTER_FAMILY_PRESETS } from "./data/monster-presets.js";
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
  buildExportReadiness,
  buildExportRunSheet,
  buildExportText,
  buildRenderableStatBlock,
  getSectionLabel,
  groupFeaturesBySection,
  normalizeMonsterReferences,
  normalizeRulesText,
} from "./model/monster-composer.export.js";
import { buildRunModeSheet } from "./model/monster-composer.run.js";
import { buildGuidedFlow } from "./model/monster-composer.start-flow.js";
import { MonsterComposerTopbar } from "./components/monster-composer.shell.jsx";
import { GuidedFlowPanel, TemplatePickerModal } from "./components/monster-composer.start-flow.jsx";
import { MonsterSilhouetteMap } from "./components/monster-composer.anatomy.jsx";
import { ComponentNavigatorDrawer } from "./components/monster-composer.navigator.jsx";
import { BalanceWorkbench, ExportWorkbench, RunModePanel } from "./components/monster-composer.panels.jsx";


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

function getProf(level) {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}

function averageDamageText(value) {
  if (value <= 5) return "1d6 + 1";
  if (value <= 8) return "1d8 + 3";
  if (value <= 12) return "2d8 + 3";
  if (value <= 18) return "3d8 + 4";
  if (value <= 26) return "4d10 + 4";
  return "6d10 + 5";
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

  if (roleId === "minion") {
    scores.con -= 2;
  }

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

function buildName(type, category, selectedFeatures) {
  const sourceFeature =
    selectedFeatures.find((f) => f.slot === "horror") ||
    selectedFeatures.find((f) => f.slot === "body") ||
    selectedFeatures[0];
  const source = sourceFeature ? SOURCES.find((s) => s.id === sourceFeature.source)?.label : null;

  if (!source) return `Cruor ${category}`;
  if (source === "Wolf Spiders") return `Brood-Bearing ${category}`;
  if (source === "Wax Death Masks") return `Wax-Faced ${category}`;
  if (source === "Gashadokuro") return `Many-Boned ${category}`;
  if (source === "Jikininki") return `Grave-Hungry ${category}`;
  if (source === "Decomposition") return `Rot-Swollen ${category}`;
  return `${source} ${titleCase(type)}`;
}

function featureMatchesSource(feature, sourceIdOrIds) {
  const sourceIds = Array.isArray(sourceIdOrIds) ? sourceIdOrIds : [sourceIdOrIds];
  return sourceIds.filter(Boolean).includes(feature.source);
}

function featureMatchesFrame(feature, sourceId, typeId, roleId, slotId = null) {
  const sourceMatch = featureMatchesSource(feature, sourceId);
  const typeMatch = !feature.typeBias?.length || feature.typeBias.includes(typeId);
  const roleMatch = !feature.roleBias?.length || feature.roleBias.includes(roleId);
  const slotMatch = !slotId || feature.slot === slotId;
  return sourceMatch && typeMatch && roleMatch && slotMatch;
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
  return MONSTER_FAMILY_PRESETS.find((preset) => preset.id === presetId) || null;
}

function normalizePresetSelection(preset) {
  if (!preset?.selection) return {};
  return Object.fromEntries(
    Object.entries(preset.selection)
      .map(([slotId, value]) => {
        const ids = asArray(value).filter((id) =>
          FEATURES.some((feature) => feature.id === id && feature.slot === slotId)
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
    getFeatureMechanicProfile,
    summarizeMechanicProfiles,
    buildPressureProfile,
    buildComplexityProfile,
    getFeatureCounterplayProfile,
  });
}

function getOneClickFixCandidates({
  slotId,
  selected,
  selectedFeatures,
  typeId,
  category,
  roleId,
  sourceId,
  composerMode,
  customMode,
  excludeFeatureId = "",
}) {
  return FEATURES.map((feature) => ({
    feature,
    status: getCompatibilityStatus(feature, selectedFeatures, typeId, category),
  }))
    .filter(({ feature, status }) => {
      if (feature.id === excludeFeatureId) return false;
      if (feature.slot !== slotId) return false;
      if (getSelectedIdsForSlot(selected, feature.slot).includes(feature.id)) return false;
      const frameMatch = customMode
        ? featureMatchesSourceAndSlot(feature, sourceId, slotId)
        : featureMatchesFrame(feature, sourceId, typeId, roleId, slotId);
      return frameMatch && canShowFeatureForMode(status, composerMode);
    })
    .map(({ feature, status }) => {
      const profile = getFeatureDecisionProfile(feature, {
        status,
        selected,
        selectedFeatures,
        typeId,
        category,
        roleId,
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
        (b.feature.stats?.fairness || 0) - (a.feature.stats?.fairness || 0) ||
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
  roleId,
  sourceId,
  composerMode,
  customMode,
  reason = "pressure",
}) {
  if (!feature) return null;
  const reducedFeatures = selectedFeatures.filter((item) => item.id !== feature.id);
  const reducedSelected = getSelectedWithoutFeature(selected, feature);
  const originalWeight =
    reason === "complexity"
      ? getFeatureComplexityWeight(feature)
      : getFeaturePressureWeight(feature);
  const candidates = FEATURES.map((candidate) => ({
    candidate,
    status: getCompatibilityStatus(candidate, reducedFeatures, typeId, category),
  }))
    .filter(({ candidate, status }) => {
      if (candidate.id === feature.id) return false;
      if (candidate.slot !== feature.slot) return false;
      if (getSelectedIdsForSlot(reducedSelected, candidate.slot).includes(candidate.id))
        return false;
      const frameMatch = customMode
        ? featureMatchesSourceAndSlot(candidate, sourceId, feature.slot)
        : featureMatchesFrame(candidate, sourceId, typeId, roleId, feature.slot);
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
        roleId,
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

function buildOneClickFixes({
  issue,
  selected,
  selectedFeatures,
  typeId,
  category,
  roleId,
  sourceId,
  composerMode,
  customMode,
  topPressureFeature,
  topComplexityFeature,
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
  });

  if (["missing-weakness", "counterplay", "conditions"].includes(issue) && weaknessFix) {
    pushFix({ label: `Add ${weaknessFix.title}`, kind: "addFeature", featureId: weaknessFix.id });
  }

  if (["pressure", "damage", "hp"].includes(issue) && topPressureFeature) {
    const replacement = findReplacementFix({
      feature: topPressureFeature,
      selected,
      selectedFeatures,
      typeId,
      category,
      roleId,
      sourceId,
      composerMode,
      customMode,
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

  if (["complexity", "reactions"].includes(issue) && topComplexityFeature) {
    const replacement = findReplacementFix({
      feature: topComplexityFeature,
      selected,
      selectedFeatures,
      typeId,
      category,
      roleId,
      sourceId,
      composerMode,
      customMode,
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
  roleId,
  sourceId,
  composerMode,
  customMode,
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
}) {
  const recommendations = [];
  const addRecommendation = (item) => {
    if (recommendations.some((recommendation) => recommendation.id === item.id)) return;
    recommendations.push(item);
  };

  const topPressureFeature = getTopFeatureByWeight(selectedFeatures, getFeaturePressureWeight);
  const topComplexityFeature = getTopFeatureByWeight(selectedFeatures, getFeatureComplexityWeight);
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
          roleId,
          sourceId,
          composerMode,
          customMode,
          topPressureFeature,
          topComplexityFeature,
        }),
        { label: "Open Weakness Slot", kind: "slot", slotId: "weakness" },
      ],
    });
  }

  if (pressure > budget) {
    addRecommendation({
      id: "reduce-pressure",
      severity: pressure > budget * 1.25 ? "critical" : "major",
      title: "Reduce Pressure",
      detail: topPressureFeature
        ? `${topPressureFeature.title} is the first graft to review.`
        : "The pressure score is above the current budget.",
      actions: [
        ...buildOneClickFixes({
          issue: "pressure",
          selected,
          selectedFeatures,
          typeId,
          category,
          roleId,
          sourceId,
          composerMode,
          customMode,
          topPressureFeature,
          topComplexityFeature,
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
      title: "Simplify Table Handling",
      detail: topComplexityFeature
        ? `${topComplexityFeature.title} is the first tracking-heavy graft to review.`
        : "Complexity is above the current cap.",
      actions: [
        ...buildOneClickFixes({
          issue: "complexity",
          selected,
          selectedFeatures,
          typeId,
          category,
          roleId,
          sourceId,
          composerMode,
          customMode,
          topPressureFeature,
          topComplexityFeature,
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
          roleId,
          sourceId,
          composerMode,
          customMode,
          topPressureFeature,
          topComplexityFeature,
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
          roleId,
          sourceId,
          composerMode,
          customMode,
          topPressureFeature,
          topComplexityFeature,
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
          roleId,
          sourceId,
          composerMode,
          customMode,
          topPressureFeature,
          topComplexityFeature,
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
          roleId,
          sourceId,
          composerMode,
          customMode,
          topPressureFeature,
          topComplexityFeature,
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
          roleId,
          sourceId,
          composerMode,
          customMode,
          topPressureFeature,
          topComplexityFeature,
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
    addRecommendation({
      id: "damage-spike",
      severity: "major",
      title: "Limit the Damage Spike",
      detail: "Damage or burst is above the expected profile.",
      actions: [
        ...buildOneClickFixes({
          issue: "damage",
          selected,
          selectedFeatures,
          typeId,
          category,
          roleId,
          sourceId,
          composerMode,
          customMode,
          topPressureFeature,
          topComplexityFeature,
        }),
        { label: "Open Attack Slot", kind: "slot", slotId: "attack" },
        { label: "Open Weakness Slot", kind: "slot", slotId: "weakness" },
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
  return getFeaturesFromSelectionModel(selected, FEATURES);
}

function trimSelectedToCaps(current, slotCaps) {
  return trimSelectedToCapsModel(current, slotCaps, { getSlotCap });
}

function getSlotCap(slotCaps, slotId) {
  return Math.max(1, Number(slotCaps?.[slotId] || 1));
}



function pickForgeCandidate(candidates, slotId, remainingBudget, roleId) {
  if (!candidates.length) return null;

  const coreSlots = new Set(["body", "attack", "weakness"]);
  const sorted = [...candidates].sort((a, b) => {
    const weaknessBiasA = a.slot === "weakness" ? -8 : 0;
    const weaknessBiasB = b.slot === "weakness" ? -8 : 0;
    const lairBiasA = roleId === "boss" && a.slot === "lair" ? -2 : 0;
    const lairBiasB = roleId === "boss" && b.slot === "lair" ? -2 : 0;
    return (
      Math.max(0, a.cost) +
      a.complexity * 0.45 +
      weaknessBiasA +
      lairBiasA -
      (Math.max(0, b.cost) + b.complexity * 0.45 + weaknessBiasB + lairBiasB)
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




export default function CruorMonsterComposerMvp({ inspirationSeed = null } = {}) {
  const [typeId, setTypeId] = useState("undead");
  const [category, setCategory] = useState("Zombie");
  const [roleId, setRoleId] = useState("standard");
  const [sourceId, setSourceId] = useState("decomposition");
  const [navigatorSourceFilters, setNavigatorSourceFilters] = useState(["decomposition"]);
  const [partyLevel, setPartyLevel] = useState(5);
  const [partySize, setPartySize] = useState(4);
  const [dangerId, setDangerId] = useState("hard");
  const [targetCr, setTargetCr] = useState(5);
  const [tacticalRoleId, setTacticalRoleId] = useState("brute");
  const [monsterTierId, setMonsterTierId] = useState("normal");
  const [tempoProfileId, setTempoProfileId] = useState("standard");
  const [selected, setSelected] = useState({});
  const [composerStarted, setComposerStarted] = useState(false);
  const [startMode, setStartMode] = useState("");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [, setDraggedFeatureId] = useState(null);
  const [activeSlot, setActiveSlot] = useState("body");
  const [composerStageMode, setComposerStageMode] = useState("frame");
  const [customMonsterName, setCustomMonsterName] = useState("");
  const [viewMode, setViewMode] = useState("composer");
  const [advancedMode, setAdvancedMode] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customPressureBudget, setCustomPressureBudget] = useState(15);
  const [customComplexityCap, setCustomComplexityCap] = useState(10);
  const [slotCaps, setSlotCaps] = useState(DEFAULT_SLOT_CAPS);
  const [activePresetId, setActivePresetId] = useState("");
  const [navigatorSearch, setNavigatorSearch] = useState("");
  const [navigatorFiltersOpen, setNavigatorFiltersOpen] = useState(false);
  const [navigatorPackFilter, setNavigatorPackFilter] = useState("all");
  const [componentNavigatorOpen, setComponentNavigatorOpen] = useState(false);
  const [componentNavigatorMode, setComponentNavigatorMode] = useState("slot");
  const [navigatorSlotFilter, setNavigatorSlotFilter] = useState("all");
  const [exportCopyStatus, setExportCopyStatus] = useState("");

  const creatureType = CREATURE_TYPES.find((type) => type.id === typeId) || CREATURE_TYPES[0];
  const role = ROLES.find((item) => item.id === roleId) || ROLES[1];
  const danger = DANGERS.find((item) => item.id === dangerId) || DANGERS[0];
  const source = SOURCES.find((item) => item.id === sourceId) || SOURCES[0];
  const tacticalRole =
    TACTICAL_ROLES.find((item) => item.id === tacticalRoleId) || TACTICAL_ROLES[0];
  const monsterTier = MONSTER_TIERS.find((item) => item.id === monsterTierId) || MONSTER_TIERS[0];
  const tempoProfile =
    TEMPO_PROFILES.find((item) => item.id === tempoProfileId) || TEMPO_PROFILES[1];

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

  const defaultPressureBudget =
    role.budget +
    danger.budgetOffset +
    monsterTier.budgetOffset +
    tacticalRole.budgetMod +
    tempoProfile.budgetMod +
    Math.max(0, partySize - 4);
  const defaultComplexityCap =
    role.complexityCap +
    monsterTier.complexityCapOffset +
    tacticalRole.complexityMod +
    tempoProfile.complexityMod;
  const effectivePressureBudget = advancedMode ? customPressureBudget : defaultPressureBudget;
  const effectiveComplexityCap = advancedMode ? customComplexityCap : defaultComplexityCap;
  const composerMode = getComposerMode(advancedMode, customMode);
  const activePreset = getPresetById(activePresetId);
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
  }, []);

  const selectedFeatures = useMemo(() => getFeaturesFromSelection(selected), [selected]);

  const availableFeatures = useMemo(() => {
    const slotFilter = currentNavigatorSlot === "all" ? null : currentNavigatorSlot;
    const activeNavigatorSourceFilters =
      Array.isArray(navigatorSourceFilters) && navigatorSourceFilters.length > 0
        ? navigatorSourceFilters
        : [sourceId].filter(Boolean);
    return FEATURES.map((feature) => ({
      feature,
      status: getCompatibilityStatus(feature, selectedFeatures, typeId, category),
    }))
      .filter(({ feature, status }) => {
        const packMatch =
          navigatorPackFilter === "all" || getContentPackId(feature) === navigatorPackFilter;
        const frameMatch = customMode
          ? featureMatchesSourceAndSlot(feature, activeNavigatorSourceFilters, slotFilter)
          : featureMatchesFrame(feature, activeNavigatorSourceFilters, typeId, roleId, slotFilter);
        return packMatch && frameMatch && canShowFeatureForMode(status, composerMode);
      })
      .sort((a, b) => {
        const aDecision = getFeatureDecisionProfile(a.feature, {
          status: a.status,
          selected,
          selectedFeatures,
          typeId,
          category,
          roleId,
          tacticalRoleId,
          monsterTierId,
          currentSlot: currentNavigatorSlot,
        });
        const bDecision = getFeatureDecisionProfile(b.feature, {
          status: b.status,
          selected,
          selectedFeatures,
          typeId,
          category,
          roleId,
          tacticalRoleId,
          monsterTierId,
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
    sourceId,
    navigatorSourceFilters,
    typeId,
    roleId,
    navigatorPackFilter,
    currentNavigatorSlot,
    selectedFeatures,
    selected,
    category,
    composerMode,
    customMode,
    tacticalRoleId,
    monsterTierId,
  ]);

  const compatibleCount = useMemo(() => {
    return FEATURES.map((feature) => ({
      feature,
      status: getCompatibilityStatus(feature, selectedFeatures, typeId, category),
    })).filter(({ feature, status }) => {
      const frameMatch = customMode
        ? feature.source === sourceId
        : featureMatchesFrame(feature, sourceId, typeId, roleId);
      return frameMatch && canShowFeatureForMode(status, composerMode);
    }).length;
  }, [sourceId, typeId, roleId, selectedFeatures, category, composerMode, customMode]);

  const computed = useMemo(() => {
    const partyTier = getTier(partyLevel);
    const prof = getProfForCr(targetCr);
    const baseline = getBaselineProfile(targetCr, monsterTier.id);
    const baseHp = Math.round(baseline.hp * role.hpMult * tacticalRole.hpMult);
    const baseDpr = Math.round(
      baseline.dpr * role.dprMult * danger.dprMod * tacticalRole.dprMult * tempoProfile.dprMult
    );
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
      { hp: 0, dpr: 0, ac: 0, control: 0, mobility: 0, fairness: 0 }
    );

    const featureMechanics = selectedFeatures.map((feature) => ({
      id: feature.id,
      title: feature.title,
      ...getFeatureMechanicProfile(feature),
    }));
    const mechanicsSummary = summarizeMechanicProfiles(featureMechanics);
    const counterplayProfiles = selectedFeatures.map((feature) =>
      getFeatureCounterplayProfile(feature)
    );
    const cost = selectedFeatures.reduce((sum, feature) => sum + feature.cost, 0);
    const rawComplexity = selectedFeatures.reduce((sum, feature) => sum + feature.complexity, 0);
    const budget = effectivePressureBudget;
    const pressureProfile = buildPressureProfile({
      cost,
      monsterTier,
      tempoProfile,
      statMods,
      mechanicsSummary,
      budget,
    });
    const complexityProfile = buildComplexityProfile({
      complexity: rawComplexity,
      mechanicsSummary,
      featureMechanics,
      limit: effectiveComplexityCap,
    });
    const counterplayAudit = buildCounterplayAudit({
      selected,
      roleId,
      monsterTier,
      pressureProfile,
      complexityProfile,
      mechanicsSummary,
      counterplayProfiles,
    });
    const pressure = pressureProfile.score;
    const complexity = complexityProfile.score;
    const hp = Math.max(1, Math.round(baseHp + (statMods.hp || 0)));
    const ac = clamp(baseAc + (statMods.ac || 0), 10, 28);
    const dpr = Math.max(1, Math.round(baseDpr + (statMods.dpr || 0)));
    const dc = clamp(baseDc + Math.floor((statMods.control || 0) / 3), 10, 30);
    const attack = clamp(baseAttack, 2, 18);
    const printedStats = {
      ac,
      hp,
      dpr,
      attackBonus: attack,
      saveDc: dc,
      initiativeMod: tempoProfile.initiativeMod,
      speed: creatureType.defaults.speed,
    };
    const effectiveProfile = {
      effectiveAc: ac + Math.floor((statMods.mobility || 0) / 4),
      effectiveHp: Math.round(hp * (1 + Math.max(0, statMods.fairness || 0) * 0.015)),
      effectiveAttackBonus: attack + (tempoProfile.id === "ambusher" ? 1 : 0),
      effectiveSaveDc: dc,
      printedDpr: dpr,
      effectiveDpr3Round: Math.max(
        Math.round(
          dpr *
            (1 +
              Math.max(0, statMods.control || 0) * 0.035 +
              Math.max(0, statMods.mobility || 0) * 0.02 +
              (tempoProfile.id === "ambusher" ? 0.08 : 0))
        ),
        Math.round(dpr + mechanicsSummary.structuredDamage * 0.2)
      ),
      burstDpr: Math.round(
        dpr *
          (1 +
            (tempoProfile.id === "ambusher" ? 0.35 : 0.12) +
            Math.max(0, statMods.dpr || 0) * 0.01)
      ),
      tempoFactor: 1 + tempoProfile.pressureMod * 0.05,
      defenseFactor:
        1 + Math.max(0, statMods.hp || 0) / Math.max(1, hp) + Math.max(0, statMods.ac || 0) * 0.04,
    };
    effectiveProfile.combatPowerEstimate = Math.round(
      effectiveProfile.effectiveHp *
        effectiveProfile.effectiveDpr3Round *
        ((effectiveProfile.effectiveAc + effectiveProfile.effectiveAttackBonus - 2) / 13)
    );
    const profileDeltas = buildProfileDeltas(printedStats, effectiveProfile, baseline);
    const estimatedCr = clamp(
      Math.round(
        targetCr +
          (pressure - budget) / 6 +
          ((effectiveProfile.effectiveDpr3Round - baseline.dpr) / Math.max(8, baseline.dpr)) * 2
      ),
      0,
      30
    );
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
    if (pressure > budget)
      warnings.push(
        "Threat budget is above target. Reduce one high-cost twist or treat this as a boss/setpiece."
      );
    if (complexity > effectiveComplexityCap)
      warnings.push(
        "Table complexity is high. Remove one feature with a reaction, recharge, or delayed effect, or increase the custom Complexity limit in Advanced Mode."
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
        getCompatibilityStatus(feature, selectedFeatures, typeId, category)
      );
      if (compatibilityWarning) warnings.push(compatibilityWarning);
    });

    const balanceRecommendations = buildBalanceRecommendations({
      selected,
      selectedFeatures,
      typeId,
      category,
      roleId,
      sourceId,
      composerMode,
      customMode,
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
    });

    return {
      tier: partyTier,
      targetCr,
      tacticalRole,
      monsterTier,
      tempoProfile,
      rulesContext,
      baseline,
      printedStats,
      effectiveProfile,
      profileDeltas,
      pressureProfile,
      complexityProfile,
      counterplayAudit,
      counterplayProfiles,
      featureMechanics,
      mechanicsSummary,
      baselinePower,
      effectivePower,
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
      complexityCap: effectiveComplexityCap,
      estimatedCr,
      name,
      warnings: uniqueArray(warnings),
      balanceRecommendations,
      damageText: averageDamageText(dpr),
      statMods,
    };
  }, [
    partyLevel,
    role,
    roleId,
    danger,
    creatureType,
    selectedFeatures,
    customMonsterName,
    selected,
    typeId,
    category,
    sourceId,
    composerMode,
    customMode,
    effectivePressureBudget,
    effectiveComplexityCap,
    targetCr,
    tacticalRole,
    monsterTier,
    tempoProfile,
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
    setActiveSlot(Object.keys(nextSelection)[0] || "body");
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
    setSelected({});
    setActivePresetId("");
    setCustomMonsterName("");
    setStartMode("scratch");
    setComposerStarted(true);
    setTemplatePickerOpen(false);
    setComponentNavigatorOpen(false);
    setComponentNavigatorMode("slot");
    setNavigatorSlotFilter("body");
    setNavigatorSearch("");
    setNavigatorSourceFilters(["decomposition"]);
    setNavigatorFiltersOpen(false);
    setNavigatorPackFilter("all");
    setActiveSlot("body");
    setViewMode("composer");
  }

  function startOver() {
    setSelected({});
    setActivePresetId("");
    setCustomMonsterName("");
    setStartMode("");
    setComposerStarted(false);
    setTemplatePickerOpen(false);
    setComponentNavigatorOpen(false);
    setComponentNavigatorMode("slot");
    setNavigatorSlotFilter("body");
    setNavigatorSearch("");
    setNavigatorSourceFilters(["decomposition"]);
    setNavigatorFiltersOpen(false);
    setNavigatorPackFilter("all");
    setActiveSlot("body");
    setViewMode("composer");
  }

  function addFeature(feature) {
    const status = getCompatibilityStatus(feature, selectedFeatures, typeId, category);
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
    const budget = effectivePressureBudget;
    const next = {};
    let runningCost = 0;

    priority.forEach((slotId) => {
      const slotCap = advancedMode ? getSlotCap(slotCaps, slotId) : 1;
      const picks = [];

      for (let index = 0; index < slotCap; index += 1) {
        const partialFeatures = getFeaturesFromSelection(next);
        const candidates = FEATURES.map((feature) => ({
          feature,
          status: getCompatibilityStatus(feature, partialFeatures, typeId, category),
        }))
          .filter(({ feature, status }) => {
            const alreadyPicked =
              picks.includes(feature.id) ||
              getSelectedIdsForSlot(next, slotId).includes(feature.id);
            const frameMatch = customMode
              ? featureMatchesSourceAndSlot(feature, sourceId, slotId)
              : featureMatchesFrame(feature, sourceId, typeId, roleId, slotId);
            return !alreadyPicked && frameMatch && canShowFeatureForMode(status, composerMode);
          })
          .sort(
            (a, b) =>
              getCompatibilityRank(a.status) - getCompatibilityRank(b.status) ||
              a.feature.cost - b.feature.cost
          )
          .map(({ feature }) => feature);
        const remainingBudget = Math.max(0, budget - runningCost + (roleId === "boss" ? 3 : 0));
        const picked = pickForgeCandidate(candidates, slotId, remainingBudget, roleId);
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

    setCustomPressureBudget(defaultPressureBudget);
    setCustomComplexityCap(defaultComplexityCap);
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

  const pressurePercent = clamp((computed.pressure / computed.budget) * 100, 0, 160);
  const complexityPercent = clamp((computed.complexity / computed.complexityCap) * 100, 0, 160);
  const abilityProfile = buildAbilityProfile(
    typeId,
    category,
    roleId,
    selectedFeatures,
    computed.prof
  );
  const sectionGroups = useMemo(() => groupFeaturesBySection(selectedFeatures), [selectedFeatures]);
  const traits = sectionGroups.trait || [];
  const actions = sectionGroups.action || [];
  const bonusActions = sectionGroups.bonusAction || [];
  const reactions = sectionGroups.reaction || [];
  const legendaryActions = sectionGroups.legendaryAction || [];
  const lairActions = sectionGroups.lairAction || [];
  const deathEffects = sectionGroups.death || [];
  const hasLegendaryActions = roleId === "boss";
  const xp = xpForCr(computed.targetCr).toLocaleString("en-US");
  const selectedSlotCount = SLOTS.filter((slot) => hasSelectedSlot(selected, slot.id)).length;
  const selectedGraftCount = selectedFeatures.length;
  const slotCompletionPercent = clamp(Math.round((selectedSlotCount / SLOTS.length) * 100), 0, 100);
  const activeSlotData = SLOTS.find((slot) => slot.id === activeSlot) || SLOTS[0];
  const activeSlotFeatureIds = getSelectedIdsForSlot(selected, activeSlot);
  const activeSlotFeatures = activeSlotFeatureIds
    .map((id) => FEATURES.find((feature) => feature.id === id))
    .filter(Boolean);
  const activeSlotAvailableFeatures = useMemo(() => {
    return FEATURES.map((feature) => ({
      feature,
      status: getCompatibilityStatus(feature, selectedFeatures, typeId, category),
    }))
      .filter(({ feature, status }) => {
        const frameMatch = customMode
          ? featureMatchesSourceAndSlot(feature, sourceId, activeSlot)
          : featureMatchesFrame(feature, sourceId, typeId, roleId, activeSlot);
        return frameMatch && canShowFeatureForMode(status, composerMode);
      })
      .map(({ feature }) => feature);
  }, [sourceId, typeId, roleId, activeSlot, selectedFeatures, category, composerMode, customMode]);
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
  }, [availableFeatures, navigatorSearch]);
  const guidedFlow = buildGuidedFlow({
    composerStarted,
    startMode,
    selected,
    computed,
    activePreset,
  });

  function openSlotNavigator(slotId) {
    if (!composerStarted) return;
    setComposerStageMode("grafts");
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
    setComposerStageMode("grafts");
    setComponentNavigatorMode("global");
    setNavigatorSlotFilter("all");
    setNavigatorSearch("");
    setNavigatorSourceFilters([sourceId]);
    setNavigatorFiltersOpen(false);
    setComponentNavigatorOpen(true);
  }

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
      setComponentNavigatorOpen(false);
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
      onClose={() => setComponentNavigatorOpen(false)}
      visibleFeatures={visibleFeatures}
      selected={selected}
      selectedFeatures={selectedFeatures}
      typeId={typeId}
      category={category}
      roleId={roleId}
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


  return (
    <div
      className="cruor-composer-shell monster-composer monster-shell"
      data-composer-started={composerStarted ? "true" : "false"}
      data-start-mode={startMode || "unstarted"}
      data-template-picker-open={templatePickerOpen ? "true" : "false"}
    >
      <main className="monster-workspace">
        <MonsterComposerTopbar
          activePreset={activePreset}
          targetCr={targetCr}
          tacticalRole={tacticalRole}
          monsterTier={monsterTier}
          tempoProfile={tempoProfile}
          viewMode={viewMode}
          onSetViewMode={setViewMode}
          composerStageMode={composerStageMode}
          onSetComposerStageMode={setComposerStageMode}
        />

        {viewMode === "composer" && (
          <section className="monster-layout">
            <section
              className="panel build-canvas monster-canvas"
              aria-label="The Crucible build canvas"
            >
              <MonsterSilhouetteMap
                typeId={typeId}
                category={category}
                activePreset={activePreset}
                selected={selected}
                activeSlot={activeSlot}
                guidedSlotId={guidedFlow.recommendedSlotId}
                computed={computed}
                started={composerStarted}
                startMode={startMode}
                presetsCount={MONSTER_FAMILY_PRESETS.length}
                stageMode={composerStageMode}
                onSetStageMode={setComposerStageMode}
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
                onOpenComponents={() => {
                  setComposerStageMode("grafts");
                  openGlobalNavigator();
                }}
                onStartOver={composerStarted ? startOver : undefined}
                composerStarted={composerStarted}
                onPickTemplate={openTemplatePicker}
                onBuildFromScratch={startFromScratch}
                onOpenFrame={() => setComposerStageMode("frame")}
                onFocusSlot={(slotId) => {
                  setComposerStageMode("grafts");
                  openSlotNavigator(slotId);
                }}
                selectType={selectType}
                setCategory={setCategory}
                setActivePresetId={setActivePresetId}
                setRoleId={setRoleId}
                setTargetCr={setTargetCr}
                setTacticalRoleId={setTacticalRoleId}
                setMonsterTierId={setMonsterTierId}
                setTempoProfileId={setTempoProfileId}
                setDangerId={setDangerId}
                componentNavigatorPanel={componentNavigatorDrawer}
                guidedFlowPanel={(
                  <GuidedFlowPanel
                    guidedFlow={guidedFlow}
                    onOpenStart={openTemplatePicker}
                    onFocusSlot={(slotId) => {
                      setComposerStageMode("grafts");
                      openSlotNavigator(slotId);
                    }}
                    onOpenBalance={() => setViewMode("balance")}
                    onOpenExport={() => setViewMode("export")}
                  />
                )}
              />

              {composerStarted && composerStageMode === "grafts" && (
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
            </section>
          </section>
        )}

        {viewMode === "balance" && (
          <BalanceWorkbench
            computed={computed}
            pressurePercent={pressurePercent}
            complexityPercent={complexityPercent}
            onRecommendationAction={handleBalanceRecommendationAction}
          />
        )}

        {viewMode === "run" &&
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

        {viewMode === "export" &&
          (() => {
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
              hasLegendaryActions,
              xp,
            });
            const exportJson = buildExportJson({
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
              activePreset,
              xp,
            });
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
              hasLegendaryActions,
              xp,
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
            return (
              <ExportWorkbench
                exportText={exportText}
                exportJson={exportJson}
                statBlock={statBlock}
                exportReadiness={exportReadiness}
                exportRunSheet={exportRunSheet}
                exportCopyStatus={exportCopyStatus}
                onCopyExportPayload={copyExportPayload}
                onOpenBalance={() => setViewMode("balance")}
              />
            );
          })()}

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
              const statEntries = Object.entries(feature.stats || {});
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
