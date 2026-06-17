import { ALL_MONSTER_GRAFTS, ALL_MONSTER_SOURCES } from "../data/monster-content-pack-feed.js";
import { MONSTER_FAMILY_PRESETS } from "../data/monster-presets.js";
import { getCompatibilityStatus } from "../model/monster-composer.compatibility.js";
import { validateMonsterGraftRules } from "../model/monster-graft-rules.schema.js";
import { evaluateMonsterFrameFit, getFeatureFrameFit } from "../model/monster-frame-fit.js";
import { buildMonsterPublishGate } from "../model/monster-publish-gate.js";
import {
  REQUIRED_PLAYABLE_SLOTS,
  buildExportArtifacts,
  buildMonsterFrameContext,
  getForgeCandidatesForFrame,
} from "./monster-frame-builders.js";
import {
  asArray,
  buildQaReport,
  groupQaIssues,
  makeQaIssue,
  summarizeQaIssues,
  uniqueArray,
} from "./monster-qa-report.js";

export const MONSTER_PER_GRAFT_QA_VERSION = "monster-per-graft-qa-v1.34-forced-coverage";

const DEFAULT_SEED = "cruor-per-graft-qa";
const DEFAULT_CR_MIN = 1;
const DEFAULT_CR_MAX = 30;
const MAX_FRAME_ATTEMPTS_PER_GRAFT = 48;
const PASSING_STATUSES = new Set(["pass", "review"]);
const COMPATIBLE_KINDS = new Set(["compatible", "soft", "avoid"]);

const DEFAULT_CATEGORIES_BY_TYPE = Object.freeze({
  undead: ["Zombie", "Skeleton", "Spirit"],
  beast: ["Spider", "Wolf", "Bird"],
  aberration: ["Flesh Mass", "Eye Horror", "Parasite", "Psychic Predator"],
});

const DEFAULT_FRAME_VALUES = Object.freeze({
  standard: {
    tacticalRoleId: "brute",
    monsterTierId: "normal",
    tempoProfileId: "standard",
    dangerId: "hard",
    targetCr: 5,
  },
  minion: {
    tacticalRoleId: "brute",
    monsterTierId: "normal",
    tempoProfileId: "standard",
    dangerId: "standard",
    targetCr: 2,
  },
  boss: {
    tacticalRoleId: "controller",
    monsterTierId: "boss",
    tempoProfileId: "fast",
    dangerId: "horror",
    targetCr: 8,
  },
});

function cleanString(value) {
  return String(value || "").trim();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeInteger(value, fallback, min, max) {
  const numeric = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(numeric)) return fallback;
  return clamp(numeric, min, max);
}

function getGraftRules(graft = {}) {
  return graft.rules || graft.monster?.rules || {};
}

function getGraftSection(graft = {}) {
  return graft.section || graft.monster?.section || getGraftRules(graft).section || "trait";
}

function getFeatureById(id) {
  return ALL_MONSTER_GRAFTS.find((feature) => feature.id === id) || null;
}

function getFeatureListFromSelection(selection = {}) {
  const ids = Object.values(selection).flatMap((value) => asArray(value));
  return uniqueArray(ids).map(getFeatureById).filter(Boolean);
}

function setSelectionValue(selection, slotId, featureId) {
  if (!slotId || !featureId) return selection;
  const current = selection[slotId];
  if (!current) {
    selection[slotId] = featureId;
    return selection;
  }
  const ids = uniqueArray([...asArray(current), featureId]);
  selection[slotId] = ids.length === 1 ? ids[0] : ids;
  return selection;
}

function hasSelectedFeature(selection, featureId) {
  return Object.values(selection).flatMap((value) => asArray(value)).includes(featureId);
}

function removeFeatureFromList(features = [], featureId) {
  return features.filter((feature) => feature.id !== featureId);
}

function getCompatibilityTokenCount(status = {}) {
  return asArray(status.tokens).length;
}

function getTargetCompatibility(graft, selectedFeatures, frame) {
  return getCompatibilityStatus(
    graft,
    removeFeatureFromList(selectedFeatures, graft.id),
    frame.typeId,
    frame.category,
    { activePreset: null },
  );
}

function getPreferredCrForGraft(graft, fallback = 5) {
  const fit = getFeatureFrameFit(graft, { includeInferred: true });
  const cr = fit?.cr || {};
  const preferred = cr.recommendedMin ?? cr.min ?? fallback;
  const max = cr.max ?? cr.recommendedMax ?? 30;
  return clamp(Number(preferred || fallback), 0, Number(max || 30));
}

function normalizeMonsterPerGraftQaOptions(options = {}) {
  const crMin = normalizeInteger(options.crMin, DEFAULT_CR_MIN, 0, 30);
  const crMax = normalizeInteger(options.crMax, DEFAULT_CR_MAX, 0, 30);
  return {
    seed: cleanString(options.seed) || DEFAULT_SEED,
    crMin: Math.min(crMin, crMax),
    crMax: Math.max(crMin, crMax),
    includeFullPayloads: Boolean(options.includeFullPayloads),
    includeReviewPayloads: options.includeReviewPayloads !== false,
    maxFrameAttemptsPerGraft: normalizeInteger(
      options.maxFrameAttemptsPerGraft,
      MAX_FRAME_ATTEMPTS_PER_GRAFT,
      8,
      160,
    ),
  };
}

export { normalizeMonsterPerGraftQaOptions };

function frameMatchesGraftBias(graft, frame) {
  const typeBias = asArray(graft.typeBias || graft.monster?.typeBias);
  const roleBias = asArray(graft.roleBias || graft.monster?.roleBias);
  if (typeBias.length && !typeBias.includes(frame.typeId)) return false;
  if (roleBias.length && !roleBias.includes(frame.roleId)) return false;
  return !evaluateMonsterFrameFit(graft, frame, { includeInferred: false }).hardBlock;
}

function normalizePresetFrame(preset, graft, options) {
  const preferredCr = getPreferredCrForGraft(graft, preset.targetCr || DEFAULT_FRAME_VALUES[preset.roleId]?.targetCr || 5);
  return {
    id: `per-graft-${graft.id}-${preset.id}`,
    typeId: preset.typeId || "undead",
    category: preset.category || "Zombie",
    roleId: preset.roleId || "standard",
    sourceId: graft.source || preset.source || "decomposition",
    targetCr: clamp(preferredCr, options.crMin, options.crMax),
    tacticalRoleId: preset.tacticalRoleId || DEFAULT_FRAME_VALUES[preset.roleId]?.tacticalRoleId || "brute",
    monsterTierId: preset.monsterTierId || DEFAULT_FRAME_VALUES[preset.roleId]?.monsterTierId || "normal",
    tempoProfileId: preset.tempoProfileId || DEFAULT_FRAME_VALUES[preset.roleId]?.tempoProfileId || "standard",
    dangerId: preset.dangerId || DEFAULT_FRAME_VALUES[preset.roleId]?.dangerId || "hard",
    seed: `${options.seed}:${graft.id}:${preset.id}`,
    qaFrameMode: "per-graft",
    qaFrameStatus: "forced-graft",
  };
}

function getCandidateTypes(graft) {
  const typeBias = asArray(graft.typeBias || graft.monster?.typeBias);
  return typeBias.length ? typeBias : Object.keys(DEFAULT_CATEGORIES_BY_TYPE);
}

function getCandidateRoles(graft) {
  const roleBias = asArray(graft.roleBias || graft.monster?.roleBias);
  return roleBias.length ? roleBias : ["standard", "boss", "minion"];
}

function getRecommendedValues(fitDimension = {}, fallback = []) {
  return uniqueArray([
    ...asArray(fitDimension.allowed),
    ...asArray(fitDimension.recommended),
    ...fallback,
  ]);
}

function buildSyntheticFramesForGraft(graft, options) {
  const fit = getFeatureFrameFit(graft, { includeInferred: true }) || {};
  const preferredCr = getPreferredCrForGraft(graft, 5);
  const types = getCandidateTypes(graft);
  const roles = getRecommendedValues(fit.encounterRoles, getCandidateRoles(graft));
  const tacticalRoles = getRecommendedValues(fit.tacticalRoles, ["brute", "controller", "lurker"]);
  const tiers = getRecommendedValues(fit.tiers, ["normal", "elite", "boss"]);
  const tempos = getRecommendedValues(fit.tempo, ["standard", "slow", "fast", "ambusher"]);
  const dangers = getRecommendedValues(fit.danger, ["hard", "standard", "horror"]);
  const frames = [];

  types.forEach((typeId) => {
    const categories = DEFAULT_CATEGORIES_BY_TYPE[typeId] || ["Zombie"];
    categories.forEach((category) => {
      roles.forEach((roleId) => {
        const defaults = DEFAULT_FRAME_VALUES[roleId] || DEFAULT_FRAME_VALUES.standard;
        const targetCr = clamp(preferredCr || defaults.targetCr, options.crMin, options.crMax);
        tacticalRoles.slice(0, 3).forEach((tacticalRoleId) => {
          frames.push({
            id: `per-graft-${graft.id}-${typeId}-${category}-${roleId}-${tacticalRoleId}`,
            typeId,
            category,
            roleId,
            sourceId: graft.source || "decomposition",
            targetCr,
            tacticalRoleId,
            monsterTierId: tiers[0] || defaults.monsterTierId,
            tempoProfileId: tempos[0] || defaults.tempoProfileId,
            dangerId: dangers[0] || defaults.dangerId,
            seed: `${options.seed}:${graft.id}:${typeId}:${category}:${roleId}:${tacticalRoleId}`,
            qaFrameMode: "per-graft",
            qaFrameStatus: "forced-graft",
          });
        });
      });
    });
  });

  return frames;
}

function buildCandidateFramesForGraft(graft, options) {
  const presetFrames = MONSTER_FAMILY_PRESETS
    .filter((preset) => preset.source === graft.source)
    .map((preset) => normalizePresetFrame(preset, graft, options));
  const syntheticFrames = buildSyntheticFramesForGraft(graft, options);
  const seen = new Set();
  return [...presetFrames, ...syntheticFrames]
    .filter((frame) => frameMatchesGraftBias(graft, frame))
    .filter((frame) => {
      const key = [frame.typeId, frame.category, frame.roleId, frame.tacticalRoleId, frame.monsterTierId, frame.tempoProfileId, frame.dangerId, frame.targetCr].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, options.maxFrameAttemptsPerGraft);
}

function scoreCandidateForSlot(feature, slotId, selectedFeatures, frame) {
  const compatibility = getCompatibilityStatus(feature, selectedFeatures, frame.typeId, frame.category, { activePreset: null });
  if (["missing", "incompatible"].includes(compatibility.kind)) return Number.POSITIVE_INFINITY;
  const frameFit = evaluateMonsterFrameFit(feature, frame);
  if (frameFit.hardBlock) return Number.POSITIVE_INFINITY;
  const slotBias = feature.slot === slotId ? 0 : 20;
  return Math.max(0, Number(feature.cost || 0)) + Number(feature.complexity || 0) * 0.45 + frameFit.rankModifier + slotBias;
}

function pickCandidateForSlot(slotId, selectedFeatures, frame, excludedIds = new Set()) {
  const candidates = getForgeCandidatesForFrame(frame, { slotId, selectedFeatures, includeCompatibility: true })
    .filter((feature) => !excludedIds.has(feature.id));
  return candidates
    .map((feature) => ({ feature, score: scoreCandidateForSlot(feature, slotId, selectedFeatures, frame) }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((a, b) => a.score - b.score)[0]?.feature || null;
}

function findProviderForTarget(graft, selectedFeatures, frame, excludedIds = new Set()) {
  const currentStatus = getTargetCompatibility(graft, selectedFeatures, frame);
  const currentTokenCount = getCompatibilityTokenCount(currentStatus);
  const candidates = getForgeCandidatesForFrame(frame, { selectedFeatures, includeCompatibility: false })
    .filter((feature) => feature.id !== graft.id && !excludedIds.has(feature.id));

  return candidates
    .map((feature) => {
      const providerStatus = getCompatibilityStatus(feature, selectedFeatures, frame.typeId, frame.category, { activePreset: null });
      if (["missing", "incompatible"].includes(providerStatus.kind)) return null;
      const nextStatus = getTargetCompatibility(graft, [...selectedFeatures, feature], frame);
      const nextTokenCount = getCompatibilityTokenCount(nextStatus);
      const improves = COMPATIBLE_KINDS.has(nextStatus.kind) || nextTokenCount < currentTokenCount;
      if (!improves) return null;
      return {
        feature,
        score:
          (COMPATIBLE_KINDS.has(nextStatus.kind) ? -100 : 0) +
          nextTokenCount * 25 +
          Math.max(0, Number(feature.cost || 0)) +
          Number(feature.complexity || 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)[0]?.feature || null;
}

function completeForcedSelectionForFrame(graft, frame) {
  const selection = {};
  const selectedIds = new Set();

  function addFeature(feature) {
    if (!feature || selectedIds.has(feature.id)) return false;
    setSelectionValue(selection, feature.slot, feature.id);
    selectedIds.add(feature.id);
    return true;
  }

  addFeature(graft);

  for (let pass = 0; pass < 4; pass += 1) {
    const selectedFeatures = getFeatureListFromSelection(selection);
    const status = getTargetCompatibility(graft, selectedFeatures, frame);
    if (COMPATIBLE_KINDS.has(status.kind)) break;
    const provider = findProviderForTarget(graft, selectedFeatures, frame, selectedIds);
    if (!provider) break;
    addFeature(provider);
  }

  REQUIRED_PLAYABLE_SLOTS.forEach((slotId) => {
    if (asArray(selection[slotId]).length) return;
    const selectedFeatures = getFeatureListFromSelection(selection);
    addFeature(pickCandidateForSlot(slotId, selectedFeatures, frame, selectedIds));
  });

  for (let pass = 0; pass < 4; pass += 1) {
    const selectedFeatures = getFeatureListFromSelection(selection);
    const status = getTargetCompatibility(graft, selectedFeatures, frame);
    if (COMPATIBLE_KINDS.has(status.kind)) break;
    const provider = findProviderForTarget(graft, selectedFeatures, frame, selectedIds);
    if (!provider) break;
    addFeature(provider);
  }

  return {
    selection,
    selectedFeatures: getFeatureListFromSelection(selection),
  };
}

function getForcedRenderedItems(statBlock = {}, graftId) {
  return asArray(statBlock.sections)
    .flatMap((section) => asArray(section.items).map((item) => ({ sectionId: section.id, sectionTitle: section.title, ...item })))
    .filter((item) => item.id === graftId);
}

function buildGraftCoverageFlags(graft, renderedItems = []) {
  const rules = getGraftRules(graft);
  const renderedText = renderedItems.map((item) => `${item.title || ""}. ${item.text || ""}`).join("\n");
  const hasRenderedText = cleanString(renderedText).length > 0;
  const conditionNames = asArray(rules.condition?.names).map((name) => cleanString(name).toLowerCase()).filter(Boolean);
  const damageTypes = uniqueArray([
    ...asArray(rules.damage?.types),
    rules.damage?.type,
    rules.damage?.damageType,
  ]).map((type) => type.toLowerCase());
  const areaSource = rules.areaEffect?.enabled ? rules.areaEffect : rules.targeting || {};
  const areaShape = cleanString(areaSource.shape).toLowerCase();
  const areaSize = Number(areaSource.size || 0);
  const normalizedRenderedText = renderedText.toLowerCase();
  const areaSizeMentioned = areaSize > 0 && (
    normalizedRenderedText.includes(`${areaSize} feet`) ||
    normalizedRenderedText.includes(`${areaSize}-foot`) ||
    normalizedRenderedText.includes(`${areaSize} ft`) ||
    normalizedRenderedText.includes(`${areaSize}-ft`)
  );
  const usageType = cleanString(rules.usage?.type).toLowerCase();

  return {
    hasRenderedText,
    hasDamageRule: Boolean(rules.damage?.mode && rules.damage.mode !== "none"),
    damageMentioned: !damageTypes.length || damageTypes.some((type) => normalizedRenderedText.includes(type)),
    hasConditionRule: Boolean(conditionNames.length),
    conditionMentioned: !conditionNames.length || conditionNames.some((name) => normalizedRenderedText.includes(`${name} condition`)),
    hasAreaRule: rules.targeting?.type === "area" || Boolean(rules.areaEffect?.enabled),
    areaMentioned: !areaShape || areaShape === "custom" || normalizedRenderedText.includes(areaShape) || (areaShape === "radius" && normalizedRenderedText.includes("sphere")) || areaSizeMentioned,
    hasRechargeRule: usageType === "recharge",
    rechargeMentioned: usageType !== "recharge" || /\(Recharge\s+\d+[–-]\d+\)/.test(renderedText),
    renderedText,
  };
}

function addCoverageFlagIssues({ graft, coverageFlags, caseIssues }) {
  if (!coverageFlags.hasRenderedText) {
    caseIssues.push(makeQaIssue({
      severity: "error",
      area: "per-graft-render",
      check: "forced-graft-not-rendered",
      id: graft.id,
      title: graft.title,
      path: "statBlock.sections",
      message: "Forced graft was selected but did not render a stat block item.",
      recommendation: "Check section mapping, slot grouping, and export stat block mode.",
    }));
  }

  if (coverageFlags.hasDamageRule && !coverageFlags.damageMentioned) {
    caseIssues.push(makeQaIssue({
      severity: "error",
      area: "per-graft-render",
      check: "damage-not-rendered",
      id: graft.id,
      title: graft.title,
      path: "rules.damage",
      message: "Forced damaging graft rendered without its declared damage type.",
      recommendation: "Check damage metadata and structured renderer output.",
    }));
  }

  if (coverageFlags.hasConditionRule && !coverageFlags.conditionMentioned) {
    caseIssues.push(makeQaIssue({
      severity: "warning",
      area: "per-graft-render",
      check: "condition-not-rendered",
      id: graft.id,
      title: graft.title,
      path: "rules.condition",
      message: "Forced condition graft rendered without an explicit condition phrase.",
      recommendation: "Check condition.direction, condition.names, and text templates. Use referenceOnly only for non-printing condition metadata.",
    }));
  }

  if (coverageFlags.hasAreaRule && !coverageFlags.areaMentioned) {
    caseIssues.push(makeQaIssue({
      severity: "warning",
      area: "per-graft-render",
      check: "area-not-rendered",
      id: graft.id,
      title: graft.title,
      path: "rules.targeting",
      message: "Forced area graft rendered without its declared area shape.",
      recommendation: "Check targeting shape/size/origin metadata or custom targeting text.",
    }));
  }

  if (coverageFlags.hasRechargeRule && !coverageFlags.rechargeMentioned) {
    caseIssues.push(makeQaIssue({
      severity: "error",
      area: "per-graft-render",
      check: "recharge-not-in-title",
      id: graft.id,
      title: graft.title,
      path: "rules.usage",
      message: "Forced recharge graft rendered without title-form Recharge wording.",
      recommendation: "Use Bestiary title wording: Feature (Recharge 5–6).",
    }));
  }
}

function addRulesSchemaIssues(graft, caseIssues) {
  validateMonsterGraftRules(graft).issues.forEach((issue) => {
    caseIssues.push(makeQaIssue({
      severity: issue.severity === "error" ? "error" : "warning",
      area: "rules-schema",
      check: issue.code || "rules-validation",
      id: graft.id,
      title: graft.title,
      path: issue.path || "rules",
      message: issue.message,
      recommendation: issue.recommendation || "Fix the graft rules payload before trusting publish output.",
      details: issue,
    }));
  });
}

function buildPublishIssues({ graft, publishGate, caseIssues }) {
  asArray(publishGate?.blockers).forEach((blocker) => {
    caseIssues.push(makeQaIssue({
      severity: "error",
      area: "publish-gate",
      check: blocker.id || "blocker",
      id: graft.id,
      title: graft.title,
      path: "publishGate.blockers",
      message: `${blocker.label || "Publish blocker"}. ${blocker.detail || ""}`.trim(),
      recommendation: "Fix publish-critical output before accepting the graft.",
      details: blocker,
    }));
  });

  asArray(publishGate?.reviews).forEach((review) => {
    caseIssues.push(makeQaIssue({
      severity: "warning",
      area: "publish-gate",
      check: review.id || "review",
      id: graft.id,
      title: graft.title,
      path: "publishGate.reviews",
      message: `${review.label || "Publish review"}. ${review.detail || ""}`.trim(),
      recommendation: "Review this graft/frame combination before publishing if the warning is not expected.",
      details: review,
    }));
  });
}

function buildPerGraftCaseSummary({ graft, frame, selection, context, artifacts, caseIssues, publishGate, coverageFlags }) {
  const parserStatus = artifacts?.statBlockParse?.status || "not-run";
  const publishStatus = publishGate?.status || "unknown";
  const errors = caseIssues.filter((issue) => issue.severity === "error").length;
  const warnings = caseIssues.filter((issue) => issue.severity === "warning").length;
  const status = errors ? "fail" : warnings ? "review" : "pass";

  return {
    id: graft.id,
    title: graft.title,
    slot: graft.slot,
    section: getGraftSection(graft),
    source: graft.source,
    status,
    issueCount: errors + warnings,
    errorCount: errors,
    warningCount: warnings,
    frame: {
      typeId: frame.typeId,
      category: frame.category,
      roleId: frame.roleId,
      sourceId: frame.sourceId,
      targetCr: frame.targetCr,
      tacticalRoleId: frame.tacticalRoleId,
      monsterTierId: frame.monsterTierId,
      tempoProfileId: frame.tempoProfileId,
      dangerId: frame.dangerId,
    },
    selected: selection,
    selectedFeatureIds: context?.selectedFeatures?.map((feature) => feature.id) || [],
    forcedRendered: coverageFlags.hasRenderedText,
    hasDamageRule: coverageFlags.hasDamageRule,
    hasConditionRule: coverageFlags.hasConditionRule,
    hasAreaRule: coverageFlags.hasAreaRule,
    hasRechargeRule: coverageFlags.hasRechargeRule,
    parserStatus,
    parserErrors: artifacts?.statBlockParse?.summary?.error || 0,
    parserWarnings: artifacts?.statBlockParse?.summary?.warning || 0,
    publishStatus,
    publishReady: Boolean(publishGate?.ready),
    publishBlockerCount: publishGate?.counts?.blockers || 0,
    publishReviewCount: publishGate?.counts?.reviews || 0,
    targetCr: context?.computed?.targetCr,
    estimatedCr: context?.computed?.estimatedCr,
    crDelta: Number(context?.computed?.estimatedCr || 0) - Number(context?.computed?.targetCr || frame.targetCr || 0),
  };
}

function runForcedGraftCase(graft, options) {
  const candidateFrames = buildCandidateFramesForGraft(graft, options);
  const attempts = [];

  if (!candidateFrames.length) {
    const issue = makeQaIssue({
      severity: "error",
      area: "per-graft-frame",
      check: "no-compatible-frame",
      id: graft.id,
      title: graft.title,
      path: "fit/typeBias/roleBias/source",
      message: "No compatible frame could be built for this graft.",
      recommendation: "Check source, typeBias, roleBias, and Frame Fit hard gates.",
    });
    return {
      summary: {
        id: graft.id,
        title: graft.title,
        slot: graft.slot,
        section: getGraftSection(graft),
        source: graft.source,
        status: "fail",
        issueCount: 1,
        errorCount: 1,
        warningCount: 0,
        parserStatus: "not-run",
        publishStatus: "not-run",
        forcedRendered: false,
        selectedFeatureIds: [],
      },
      issues: [issue],
      debugPayload: { graft, candidateFrames: [] },
    };
  }

  for (const frame of candidateFrames) {
    const caseIssues = [];
    let context = null;
    let artifacts = null;
    let publishGate = null;
    let selection = null;
    let coverageFlags = { hasRenderedText: false };

    try {
      const forced = completeForcedSelectionForFrame(graft, frame);
      selection = forced.selection;
      const targetCompatibility = getTargetCompatibility(graft, forced.selectedFeatures, frame);
      if (!COMPATIBLE_KINDS.has(targetCompatibility.kind)) {
        caseIssues.push(makeQaIssue({
          severity: "error",
          area: "per-graft-compatibility",
          check: targetCompatibility.kind || "incompatible",
          id: graft.id,
          title: graft.title,
          path: "selection",
          message: `${graft.title}: ${targetCompatibility.message}`,
          recommendation: "Add prerequisite metadata providers, adjust anatomy constraints, or update Frame Fit so this graft can be forced in a minimal legal build.",
          details: targetCompatibility,
        }));
      }

      addRulesSchemaIssues(graft, caseIssues);
      context = buildMonsterFrameContext({ ...frame, selection, rulesetId: options.rulesetId });

      if (!context.selectedFeatures.some((feature) => feature.id === graft.id)) {
        caseIssues.push(makeQaIssue({
          severity: "error",
          area: "per-graft-selection",
          check: "forced-graft-dropped",
          id: graft.id,
          title: graft.title,
          path: `selection.${graft.slot}`,
          message: "Forced graft was not present in the normalized Monster Composer context.",
          recommendation: "Check slot id, graft id, and selection normalization.",
        }));
      }

      artifacts = buildExportArtifacts(context);
      try {
        JSON.parse(artifacts.exportJson);
      } catch (error) {
        caseIssues.push(makeQaIssue({
          severity: "error",
          area: "per-graft-export",
          check: "json-parse",
          id: graft.id,
          title: graft.title,
          message: `Export JSON is invalid: ${error.message}`,
        }));
      }

      asArray(artifacts.statBlockParse?.issues).forEach((issue) => {
        caseIssues.push(makeQaIssue({
          severity: issue.severity || "warning",
          area: issue.area || "stat-block-parser",
          check: issue.check || "rendered-stat-block",
          id: graft.id,
          title: graft.title,
          path: issue.path || "statBlock",
          message: issue.message || "Rendered stat block parser issue.",
          recommendation: issue.recommendation || "Inspect rendered stat block output.",
          details: issue.details,
        }));
      });

      const renderedItems = getForcedRenderedItems(artifacts.statBlock, graft.id);
      coverageFlags = buildGraftCoverageFlags(graft, renderedItems);
      addCoverageFlagIssues({ graft, coverageFlags, caseIssues });

      publishGate = buildMonsterPublishGate({
        computed: context.computed,
        selected: context.selected,
        selectedFeatures: context.selectedFeatures,
        actions: context.actions,
        weaknessFeatures: context.weaknessFeatures,
        issues: caseIssues,
        exportReadiness: artifacts.exportReadiness,
        statBlockParse: artifacts.statBlockParse,
      });
      buildPublishIssues({ graft, publishGate, caseIssues });
    } catch (error) {
      caseIssues.push(makeQaIssue({
        severity: "error",
        area: "per-graft-runtime",
        check: "crash",
        id: graft.id,
        title: graft.title,
        message: `Forced graft QA crashed: ${error.message}`,
        recommendation: "Inspect the frame, selected grafts, and stack trace.",
        details: { stack: error.stack, frame },
      }));
    }

    const summary = buildPerGraftCaseSummary({ graft, frame, selection, context, artifacts, caseIssues, publishGate, coverageFlags });
    const debugPayload = {
      graft,
      frame,
      selection,
      summary,
      context: options.includeFullPayloads || summary.status !== "pass" || (options.includeReviewPayloads && summary.status === "review") ? context : null,
      artifacts: options.includeFullPayloads || summary.status !== "pass" || (options.includeReviewPayloads && summary.status === "review") ? artifacts : null,
      publishGate,
      coverageFlags,
      issues: caseIssues,
    };

    attempts.push({ summary, issues: caseIssues, debugPayload });
    if (summary.status === "pass") return attempts[attempts.length - 1];
  }

  return attempts.find((attempt) => attempt.summary.status === "review") || attempts[0];
}

function buildPerGraftAnalytics(cases = [], issues = []) {
  const bySlot = new Map();
  const bySource = new Map();
  const byCheck = new Map();

  function bump(map, key) {
    const normalized = cleanString(key) || "unknown";
    map.set(normalized, (map.get(normalized) || 0) + 1);
  }

  cases.forEach((item) => {
    bump(bySlot, item.slot);
    bump(bySource, item.source);
  });
  issues.forEach((issue) => bump(byCheck, `${issue.area}:${issue.check}`));

  return {
    totalGrafts: cases.length,
    passed: cases.filter((item) => item.status === "pass").length,
    review: cases.filter((item) => item.status === "review").length,
    failed: cases.filter((item) => item.status === "fail").length,
    forcedRendered: cases.filter((item) => item.forcedRendered).length,
    parserPassed: cases.filter((item) => item.parserStatus === "pass").length,
    parserReview: cases.filter((item) => item.parserStatus === "warning").length,
    parserFailed: cases.filter((item) => item.parserStatus === "error").length,
    publishReady: cases.filter((item) => item.publishReady).length,
    publishBlocked: cases.filter((item) => item.publishStatus === "blocked").length,
    publishReview: cases.filter((item) => item.publishStatus === "review").length,
    damagingGrafts: cases.filter((item) => item.hasDamageRule).length,
    conditionGrafts: cases.filter((item) => item.hasConditionRule).length,
    areaGrafts: cases.filter((item) => item.hasAreaRule).length,
    rechargeGrafts: cases.filter((item) => item.hasRechargeRule).length,
    bySlot: [...bySlot.entries()].sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ id, count })),
    bySource: [...bySource.entries()].sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ id, count })),
    topChecks: [...byCheck.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16).map(([key, count]) => ({ key, count })),
  };
}

export function runMonsterPerGraftCoverageQa(options = {}) {
  const normalized = normalizeMonsterPerGraftQaOptions(options);
  const issues = [];
  const cases = [];
  const debugPayloads = [];

  ALL_MONSTER_GRAFTS.forEach((graft) => {
    const result = runForcedGraftCase(graft, normalized);
    issues.push(...result.issues);
    cases.push(result.summary);
    if (result.debugPayload && (!PASSING_STATUSES.has(result.summary.status) || normalized.includeFullPayloads || (normalized.includeReviewPayloads && result.summary.status === "review"))) {
      debugPayloads.push(result.debugPayload);
    }
  });

  const suite = {
    id: "monster-per-graft-coverage",
    label: "Monster Forced Per-Graft Coverage QA",
    summary: summarizeQaIssues(issues),
    issues,
    metrics: {
      version: MONSTER_PER_GRAFT_QA_VERSION,
      options: normalized,
      sourceCount: ALL_MONSTER_SOURCES.length,
      graftCount: ALL_MONSTER_GRAFTS.length,
      cases,
      analytics: buildPerGraftAnalytics(cases, issues),
      debugPayloads,
    },
  };

  return buildQaReport({
    suites: [suite],
    metadata: {
      mode: "studio-forced-per-graft",
      qaVersion: MONSTER_PER_GRAFT_QA_VERSION,
      options: normalized,
    },
  });
}

function getPerGraftSuite(report = {}) {
  return asArray(report.suites).find((suite) => suite.id === "monster-per-graft-coverage") || asArray(report.suites)[0] || {};
}

export function buildMonsterPerGraftQaCompactReport(report = {}) {
  const suite = getPerGraftSuite(report);
  return {
    reportType: report.reportType,
    version: report.version,
    generatedAt: report.generatedAt,
    metadata: report.metadata,
    summary: report.summary,
    groupedIssues: groupQaIssues(report.issues || []),
    analytics: suite.metrics?.analytics || {},
    cases: asArray(suite.metrics?.cases),
    issues: asArray(report.issues),
  };
}

export function buildMonsterPerGraftQaMarkdown(report = {}) {
  const suite = getPerGraftSuite(report);
  const analytics = suite.metrics?.analytics || {};
  const cases = asArray(suite.metrics?.cases);
  const summary = report.summary || summarizeQaIssues(report.issues || []);
  const grouped = groupQaIssues(report.issues || []);
  const lines = [];

  lines.push("# Cruor Monster Forced Per-Graft Coverage QA Report");
  lines.push("");
  lines.push(`Generated At: ${report.generatedAt || new Date().toISOString()}`);
  lines.push(`Version: ${suite.metrics?.version || MONSTER_PER_GRAFT_QA_VERSION}`);
  lines.push(`Grafts: ${analytics.totalGrafts ?? cases.length}`);
  lines.push("");
  lines.push("## Summary");
  lines.push(`- Total Issues: ${summary.total || 0}`);
  lines.push(`- Errors: ${summary.error || 0}`);
  lines.push(`- Warnings: ${summary.warning || 0}`);
  lines.push(`- Info: ${summary.info || 0}`);
  lines.push(`- Passed: ${analytics.passed || 0}`);
  lines.push(`- Review: ${analytics.review || 0}`);
  lines.push(`- Failed: ${analytics.failed || 0}`);
  lines.push(`- Forced Rendered: ${analytics.forcedRendered || 0}/${analytics.totalGrafts || cases.length}`);
  lines.push(`- Parser Passed: ${analytics.parserPassed || 0}`);
  lines.push(`- Parser Review: ${analytics.parserReview || 0}`);
  lines.push(`- Parser Failed: ${analytics.parserFailed || 0}`);
  lines.push(`- Publish Ready: ${analytics.publishReady || 0}`);
  lines.push(`- Publish Blocked: ${analytics.publishBlocked || 0}`);
  lines.push(`- Publish Review: ${analytics.publishReview || 0}`);
  lines.push("");
  lines.push("## Rules Coverage");
  lines.push(`- Damaging Grafts: ${analytics.damagingGrafts || 0}`);
  lines.push(`- Condition Grafts: ${analytics.conditionGrafts || 0}`);
  lines.push(`- Area Grafts: ${analytics.areaGrafts || 0}`);
  lines.push(`- Recharge Grafts: ${analytics.rechargeGrafts || 0}`);
  lines.push("");

  if (grouped.length) {
    lines.push("## Issue Groups");
    grouped.slice(0, 30).forEach((group) => {
      lines.push(`- ${group.severity.toUpperCase()} · ${group.area}/${group.check} · ${group.count}× · ${group.message}`);
      if (group.ids?.length) lines.push(`  - Examples: ${group.ids.join(", ")}`);
    });
    lines.push("");
  }

  lines.push("## Per-Graft Cases");
  cases.forEach((item) => {
    lines.push(`- ${item.status.toUpperCase()} · ${item.id} · ${item.title} · ${item.slot}/${item.section} · parser=${item.parserStatus} · publish=${item.publishStatus}`);
  });
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function getExportTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function downloadMonsterPerGraftQaReport(report, { format = "json", filenamePrefix = "cruor-monster-per-graft-qa" } = {}) {
  if (typeof document === "undefined") return;
  const timestamp = getExportTimestamp();
  const isMarkdown = format === "markdown";
  const content = isMarkdown ? buildMonsterPerGraftQaMarkdown(report) : JSON.stringify(buildMonsterPerGraftQaCompactReport(report), null, 2);
  const blob = new Blob([content], { type: isMarkdown ? "text/markdown;charset=utf-8" : "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filenamePrefix}-${timestamp}.${isMarkdown ? "md" : "json"}`;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 8000);
}
