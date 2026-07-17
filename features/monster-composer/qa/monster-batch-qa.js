import { getCompatibilityStatus } from "../model/monster-composer.compatibility.js";
import { evaluateMonsterFrameFit } from "../model/monster-frame-fit.js";
import { hasSelectedSlot } from "../model/monster-composer.selection.js";
import { validateMonsterGraftRules } from "../model/monster-graft-rules.schema.js";
import { buildMonsterPublishGate, normalizeMonsterDiagnosticSeverity } from "../model/monster-publish-gate.js";
import {
  asArray,
  buildQaReport,
  groupQaIssues,
  makeQaIssue,
  summarizeQaIssues,
  uniqueArray,
} from "./monster-qa-report.js";
import {
  MONSTER_FAMILY_PRESETS,
  MONSTER_SOURCES,
  REQUIRED_PLAYABLE_SLOTS,
  buildExportArtifacts,
  buildForgeCoverage,
  buildMonsterFrameContext,
  forgeMonsterSelectionDetailed,
} from "./monster-frame-builders.js";

export const MONSTER_BATCH_QA_VERSION = "monster-batch-qa-v1.2-payload-audit-high-cr-routine";

const DEFAULT_BATCH_COUNT = 100;
const DEFAULT_SEED = "cruor-batch-qa";
const MAX_SAFE_BROWSER_BATCH_COUNT = 250;
const MAX_HARD_BROWSER_BATCH_COUNT = 1000;

const ROLE_IDS = Object.freeze(["standard", "standard", "standard", "minion", "boss"]);
const TACTICAL_ROLE_IDS = Object.freeze(["brute", "skirmisher", "controller", "lurker", "artillery", "support"]);
const MONSTER_TIER_IDS = Object.freeze(["normal", "normal", "normal", "elite", "boss"]);
const TEMPO_PROFILE_IDS = Object.freeze(["slow", "standard", "standard", "fast", "ambusher"]);
const DANGER_IDS = Object.freeze(["standard", "hard", "hard", "horror"]);
const OPTIONAL_BATCH_SLOTS = Object.freeze(["body", "mind", "movement", "attack", "horror", "twist", "weakness", "death", "lair"]);
const BATCH_QA_MODES = Object.freeze(["realistic", "stress"]);
const BATCH_QA_EXPORT_MODES = Object.freeze(["compact", "debug", "full"]);
const DEFAULT_DEBUG_EXPORT_LIMIT = 30;
const REALISTIC_FRAME_ATTEMPTS = 80;

const PUBLIC_PAYLOAD_FORBIDDEN_KEYS = Object.freeze([
  "abilityModel",
  "bestiaryBaselineAudit",
  "computed",
  "crValidation",
  "debugExportJson",
  "designerNotes",
  "dprProfile",
  "effectiveProfile",
  "featureMechanics",
  "mechanics",
  "mechanicsSummary",
  "profileDeltas",
  "rulesProfile",
  "rulesText",
]);
const DEBUG_PAYLOAD_REQUIRED_KEYS = Object.freeze([
  "abilityModel",
  "crValidation",
  "dprProfile",
  "effectiveProfile",
  "featureMechanics",
  "rulesProfile",
]);
const PUBLIC_LEGACY_TEXT_PATTERNS = Object.freeze([
  { code: "hit-target-takes", pattern: /Hit:\s+the target takes/i },
  { code: "failure-target-takes", pattern: /Failure:\s+the target takes/i },
  { code: "legacy-recharge-hyphen", pattern: /Recharge\s+\d\s*-\s*\d/i },
  { code: "legacy-radius-shape", pattern: /\b\d+[- ]foot Radius\b|\b\d+[- ]foot-radius Radius\b/i },
]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cleanString(value) {
  return String(value || "").trim();
}

function findObjectKeyPaths(value, forbiddenKeys = [], path = "") {
  if (value == null || typeof value !== "object") return [];
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => findObjectKeyPaths(entry, forbiddenKeys, `${path}[${index}]`));
  }
  return Object.entries(value).flatMap(([key, entry]) => {
    const currentPath = path ? `${path}.${key}` : key;
    const direct = forbiddenKeys.includes(key) ? [currentPath] : [];
    return [...direct, ...findObjectKeyPaths(entry, forbiddenKeys, currentPath)];
  });
}

function findLegacyTextHits(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value || "");
  return PUBLIC_LEGACY_TEXT_PATTERNS
    .filter((entry) => entry.pattern.test(text))
    .map((entry) => entry.code);
}

function safeParseJson(value) {
  if (!value) return { ok: false, value: null, error: "missing" };
  try {
    return { ok: true, value: JSON.parse(value), error: null };
  } catch (error) {
    return { ok: false, value: null, error: error.message };
  }
}

function buildExportPayloadAudit(artifacts = {}) {
  const publicParsed = safeParseJson(artifacts?.exportJson);
  const debugParsed = safeParseJson(artifacts?.debugExportJson);
  const debugPayloadPresent = Boolean(artifacts?.debugExportJson);
  const publicForbiddenKeyPaths = publicParsed.ok
    ? findObjectKeyPaths(publicParsed.value, PUBLIC_PAYLOAD_FORBIDDEN_KEYS)
    : [];
  const publicLegacyTextHits = publicParsed.ok ? findLegacyTextHits(publicParsed.value) : [];
  const debugMissingInternalKeys = debugParsed.ok
    ? DEBUG_PAYLOAD_REQUIRED_KEYS.filter((key) => !Object.prototype.hasOwnProperty.call(debugParsed.value || {}, key))
    : DEBUG_PAYLOAD_REQUIRED_KEYS;
  const publicPayloadType = publicParsed.value?.exportMeta?.payloadType || null;
  const debugPayloadType = debugParsed.value?.exportMeta?.payloadType || null;
  const debugPayloadVisibility = debugParsed.value?.exportMeta?.visibility || null;
  return {
    version: "monster-output-payload-audit-v1.36-r2",
    publicPayloadPresent: Boolean(artifacts?.exportJson),
    debugPayloadPresent,
    publicPayloadValid: publicParsed.ok,
    debugPayloadValid: debugParsed.ok,
    publicPayloadType,
    debugPayloadType,
    publicPayloadVisibility: publicParsed.value?.exportMeta?.visibility || null,
    debugPayloadVisibility,
    publicPayloadForbiddenKeyCount: publicForbiddenKeyPaths.length,
    publicPayloadForbiddenKeyPaths: publicForbiddenKeyPaths.slice(0, 20),
    publicPayloadLegacyTextCount: publicLegacyTextHits.length,
    publicLegacyTextHits,
    debugMissingInternalKeyCount: debugMissingInternalKeys.length,
    debugMissingInternalKeys,
    publicPayloadError: publicParsed.error,
    debugPayloadError: debugParsed.error,
  };
}

function normalizeInteger(value, fallback, min, max) {
  const numeric = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(numeric)) return fallback;
  return clamp(numeric, min, max);
}

function hashSeed(value) {
  const text = cleanString(value) || DEFAULT_SEED;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed = DEFAULT_SEED) {
  let state = hashSeed(seed) || 1;
  return function rng() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 1000000) / 1000000;
  };
}

function pick(values, rng, fallback = null) {
  const list = asArray(values);
  if (!list.length) return fallback;
  return list[Math.floor(rng() * list.length)] ?? fallback;
}

function getPresetPool() {
  return asArray(MONSTER_FAMILY_PRESETS).filter((preset) => preset?.typeId && preset?.category);
}

function getSourcePool() {
  return asArray(MONSTER_SOURCES).filter((source) => source?.id);
}

function buildBatchSlots(frame = {}) {
  if (["boss", "legendary", "setpiece"].includes(frame.monsterTierId) || frame.roleId === "boss") {
    return OPTIONAL_BATCH_SLOTS;
  }
  return OPTIONAL_BATCH_SLOTS.filter((slotId) => slotId !== "lair");
}

export function normalizeMonsterBatchQaOptions(options = {}) {
  const count = normalizeInteger(options.count, DEFAULT_BATCH_COUNT, 1, MAX_HARD_BROWSER_BATCH_COUNT);
  const crMin = normalizeInteger(options.crMin, 1, 0, 30);
  const crMax = normalizeInteger(options.crMax, Math.max(crMin, 10), 0, 30);
  const qaMode = cleanString(options.qaMode || options.mode || "realistic").toLowerCase();
  return {
    count,
    crMin: Math.min(crMin, crMax),
    crMax: Math.max(crMin, crMax),
    seed: cleanString(options.seed) || DEFAULT_SEED,
    rulesetId: cleanString(options.rulesetId) || undefined,
    qaMode: BATCH_QA_MODES.includes(qaMode) ? qaMode : "realistic",
    includeFullPayloads: Boolean(options.includeFullPayloads),
    includeOptionalSlots: options.includeOptionalSlots !== false,
  };
}

export function getMonsterBatchQaCostWarning(count = DEFAULT_BATCH_COUNT) {
  const normalizedCount = normalizeInteger(count, DEFAULT_BATCH_COUNT, 1, MAX_HARD_BROWSER_BATCH_COUNT);
  if (normalizedCount > 500) {
    return {
      severity: "danger",
      message: "This batch is heavy and may freeze or crash the browser tab. Prefer exporting after smaller runs unless you need a stress test.",
    };
  }
  if (normalizedCount > MAX_SAFE_BROWSER_BATCH_COUNT) {
    return {
      severity: "warning",
      message: "This batch may take noticeable time in the browser. Keep DevTools open and export the report if issues appear.",
    };
  }
  return null;
}


function getRealisticTierPool({ targetCr, roleId }) {
  const cr = Number(targetCr || 0);
  if (roleId === "boss") {
    if (cr <= 4) return ["elite", "boss"];
    if (cr <= 7) return ["elite", "boss", "boss"];
    if (cr <= 10) return ["boss", "boss", "elite", "setpiece"];
    return ["boss", "legendary", "setpiece", "elite"];
  }
  if (cr <= 4) return ["normal", "normal", "elite"];
  if (cr <= 10) return ["normal", "normal", "elite", "boss"];
  return MONSTER_TIER_IDS;
}

function getStressTierPool({ roleId }) {
  return roleId === "boss" ? ["boss", "legendary", "setpiece", "elite"] : MONSTER_TIER_IDS;
}

function buildRandomFrame({ index, normalized, rng, presets, sources }) {
  const preset = pick(presets, rng, {}) || {};
  const source = pick(sources, rng, null);
  const targetCr = normalized.crMin + Math.floor(rng() * (normalized.crMax - normalized.crMin + 1));
  const roleId = pick(ROLE_IDS, rng, preset.roleId || "standard");
  const tierPool = normalized.qaMode === "stress"
    ? getStressTierPool({ roleId })
    : getRealisticTierPool({ targetCr, roleId });
  const monsterTierId = pick(tierPool, rng, preset.monsterTierId || "normal");

  return {
    id: `batch-${String(index + 1).padStart(4, "0")}`,
    typeId: preset.typeId || "undead",
    category: preset.category || "Zombie",
    roleId,
    sourceId: source?.id || preset.source || "decomposition",
    targetCr,
    tacticalRoleId: pick(TACTICAL_ROLE_IDS, rng, preset.tacticalRoleId || "brute"),
    monsterTierId,
    tempoProfileId: pick(TEMPO_PROFILE_IDS, rng, preset.tempoProfileId || "standard"),
    dangerId: pick(DANGER_IDS, rng, preset.dangerId || "hard"),
    seed: `${normalized.seed}:${index + 1}`,
  };
}

function scoreRealisticFrame(frame) {
  const coverage = buildForgeCoverage(frame, { slots: REQUIRED_PLAYABLE_SLOTS });
  const missingPenalty = coverage.missingRequiredSlots.length * -100;
  const coverageScore = REQUIRED_PLAYABLE_SLOTS.reduce((sum, slotId) => sum + Math.min(coverage.countsBySlot[slotId] || 0, 6), 0);
  return { coverage, score: missingPenalty + coverageScore + coverage.totalCandidates * 0.05 };
}

function buildRealisticFrame(args) {
  const attempts = [];
  for (let attempt = 0; attempt < REALISTIC_FRAME_ATTEMPTS; attempt += 1) {
    const frame = buildRandomFrame(args);
    const scored = scoreRealisticFrame(frame);
    attempts.push({ frame, ...scored });
    if (scored.coverage.requiredSlotsMet) {
      return {
        ...frame,
        qaFrameMode: "realistic",
        qaFrameStatus: "compatible",
        qaCoverage: scored.coverage,
      };
    }
  }

  const best = attempts.sort((a, b) => b.score - a.score)[0];
  return {
    ...best.frame,
    qaFrameMode: "realistic",
    qaFrameStatus: "coverage-gap",
    qaCoverage: best.coverage,
  };
}

export function buildMonsterBatchQaFrames(options = {}) {
  const normalized = normalizeMonsterBatchQaOptions(options);
  const rng = createRng(normalized.seed);
  const presets = getPresetPool();
  const sources = getSourcePool();

  return Array.from({ length: normalized.count }, (_, index) => {
    const frame = normalized.qaMode === "stress"
      ? buildRandomFrame({ index, normalized, rng, presets, sources })
      : buildRealisticFrame({ index, normalized, rng, presets, sources });

    if (normalized.qaMode === "stress") {
      const coverage = buildForgeCoverage(frame, { slots: REQUIRED_PLAYABLE_SLOTS });
      return {
        ...frame,
        qaFrameMode: "stress",
        qaFrameStatus: coverage.requiredSlotsMet ? "compatible" : "stress-coverage-gap",
        qaCoverage: coverage,
      };
    }

    return frame;
  });
}

function addRulesValidationIssues({ frame, context, issues }) {
  context.selectedFeatures.forEach((feature) => {
    validateMonsterGraftRules(feature).issues.forEach((issue) => {
      issues.push(makeQaIssue({
        severity: issue.severity === "error" ? "error" : "warning",
        area: "rules-schema",
        check: issue.code || "rules-validation",
        id: frame.id,
        title: context.computed?.name || frame.id,
        path: `selection.${feature.slot}.${feature.id}`,
        message: `${feature.title}: ${issue.message}`,
        recommendation: issue.recommendation || "Fix the graft rules payload before trusting balance output.",
        details: { featureId: feature.id, featureTitle: feature.title, issue },
      }));
    });
  });
}

function addBalanceIssues({ frame, context, issues }) {
  const computed = context.computed || {};
  const baseline = computed.baseline || {};
  const crValidation = computed.crValidation || {};
  const effectiveProfile = computed.effectiveProfile || {};
  const pressureProfile = computed.pressureProfile || {};
  const targetCr = Number(computed.targetCr ?? frame.targetCr ?? 0);
  const estimatedCr = Number(computed.estimatedCr ?? crValidation.estimatedCr ?? targetCr);
  const crDelta = estimatedCr - targetCr;
  const dprRatio = baseline.dpr ? Number(effectiveProfile.effectiveDpr3Round || computed.dpr || 0) / baseline.dpr : 1;
  const burstRatio = baseline.dpr ? Number(effectiveProfile.burstDpr || 0) / baseline.dpr : 0;
  const hpRatio = baseline.hp ? Number(effectiveProfile.effectiveHp || computed.hp || 0) / baseline.hp : 1;
  const dprProfile = computed.dprProfile || {};
  const actionEconomy = dprProfile.actionEconomy || {};

  if (Number(actionEconomy.mainActionOptionCount || 0) > 1 && Number(actionEconomy.suppressedMainActionDamage || 0) > 0) {
    issues.push(makeQaIssue({
      severity: "info",
      area: "dpr-simulator",
      check: "multiple-main-actions-alternative",
      id: frame.id,
      title: computed.name || frame.id,
      path: "computed.dprProfile.actionEconomy",
      message: `Multiple main actions were available; DPR used one best main action per round and did not add ${actionEconomy.suppressedMainActionDamage} alternative damage.`,
      recommendation: "This is expected for melee/ranged/spell alternatives. If the monster should use more than one option in the same turn, model it as Multiattack, Bonus Action, Legendary Action, or Lair Action.",
      details: { actionEconomy },
    }));
  }

  asArray(computed.framePowerProfile?.diagnostics).forEach((diagnostic) => {
    const severity = normalizeMonsterDiagnosticSeverity(
      { ...diagnostic, area: "frame-power-stack", check: diagnostic.code || "frame-power-diagnostic" },
      { computed, targetCr, estimatedCr },
    );
    issues.push(makeQaIssue({
      severity,
      area: "frame-power-stack",
      check: diagnostic.code || "frame-power-diagnostic",
      id: frame.id,
      title: computed.name || frame.id,
      path: "computed.framePowerProfile",
      message: diagnostic.message,
      recommendation: severity === "info"
        ? "Informational: frame power normalization handled this overlap/cap within final CR tolerance."
        : "Review role/tier/tempo/danger stacking. Realistic QA dampens overlapping power axes instead of multiplying them freely.",
      details: { diagnostic, framePowerProfile: computed.framePowerProfile, normalizedSeverity: severity },
    }));
  });

  asArray(computed.crFitProfile?.diagnostics).forEach((diagnostic) => {
    const severity = normalizeMonsterDiagnosticSeverity(
      { ...diagnostic, area: "cr-fitting", check: diagnostic.code || "cr-fitting-diagnostic" },
      { computed, targetCr, estimatedCr },
    );
    issues.push(makeQaIssue({
      severity,
      area: "cr-fitting",
      check: diagnostic.code || "cr-fitting-diagnostic",
      id: frame.id,
      title: computed.name || frame.id,
      path: "computed.crFitProfile",
      message: diagnostic.message,
      recommendation: severity === "info"
        ? "Informational: closed-loop fitting reached publish tolerance."
        : "Inspect fixed-damage grafts, effective defense, or hard control that closed-loop HP/DPR fitting could not fully normalize.",
      details: { diagnostic, crFitProfile: computed.crFitProfile, normalizedSeverity: severity },
    }));
  });

  const lowCrHardControlProfile = computed.lowCrHardControlProfile || {};
  if (lowCrHardControlProfile.overLimit) {
    issues.push(makeQaIssue({
      severity: crDelta >= 2 ? "warning" : "info",
      area: "control-gate",
      check: "low-cr-hard-control-stack",
      id: frame.id,
      title: computed.name || frame.id,
      path: "computed.lowCrHardControlProfile",
      message: `${lowCrHardControlProfile.hardControlCount} reliable hard-control features are selected at target CR ${targetCr}.`,
      recommendation: crDelta >= 2
        ? "Use Stress QA for this combination, raise target CR, or remove one hard-control graft below CR 4."
        : "Informational: control-aware fitting kept this low-CR control stack inside publish tolerance.",
      details: { lowCrHardControlProfile, crValidation, crDelta },
    }));
  }

  const scalableMainActionGateProfile = computed.scalableMainActionGateProfile || {};
  if (scalableMainActionGateProfile.status === "fallback-added") {
    issues.push(makeQaIssue({
      severity: "info",
      area: "action-gate",
      check: "scalable-main-action-fallback-added",
      id: frame.id,
      title: computed.name || frame.id,
      path: "computed.scalableMainActionGateProfile",
      message: "High-CR frame lacked a scalable damaging main action, so Forge generated a fallback Strike.",
      recommendation: "Informational: this keeps math and rendered stat block aligned. Replace with a thematic scalable attack graft when available.",
      details: { scalableMainActionGateProfile },
    }));
  } else if (scalableMainActionGateProfile.needsFallback) {
    issues.push(makeQaIssue({
      severity: crDelta <= -2 ? "error" : "warning",
      area: "action-gate",
      check: "missing-scalable-main-action",
      id: frame.id,
      title: computed.name || frame.id,
      path: "computed.scalableMainActionGateProfile",
      message: "High-CR frame has no scalable damaging main action.",
      recommendation: "Add a scalable attack graft, multiattack-equivalent action, or generated fallback Strike.",
      details: { scalableMainActionGateProfile, crValidation, crDelta },
    }));
  }

  if (crDelta >= 4) {
    issues.push(makeQaIssue({
      severity: "error",
      area: "balance",
      check: "estimated-cr-high",
      id: frame.id,
      title: computed.name || frame.id,
      path: "computed.crValidation.estimatedCr",
      message: `Estimated CR is ${estimatedCr}, ${crDelta} above target CR ${targetCr}.`,
      recommendation: "Treat as a higher-CR frame, lower offensive/defensive grafts, or tune the Forge gate for this combination.",
      details: { targetCr, estimatedCr, crDelta, crValidation },
    }));
  } else if (crDelta >= 2) {
    issues.push(makeQaIssue({
      severity: "warning",
      area: "balance",
      check: "estimated-cr-above-target",
      id: frame.id,
      title: computed.name || frame.id,
      path: "computed.crValidation.estimatedCr",
      message: `Estimated CR is ${estimatedCr}, ${crDelta} above target CR ${targetCr}.`,
      recommendation: "Review as a borderline higher-CR monster or trim one graft if the target CR must stay fixed.",
      details: { targetCr, estimatedCr, crDelta, crValidation },
    }));
  }

  if (dprRatio >= 1.6) {
    const lowCrSpike = targetCr <= 2;
    const spikeSeverity = dprRatio >= 2.4 || (!lowCrSpike && dprRatio >= 2) ? "error" : "warning";
    issues.push(makeQaIssue({
      severity: spikeSeverity,
      area: "balance",
      check: lowCrSpike ? "low-cr-dpr-spike" : "effective-dpr-high",
      id: frame.id,
      title: computed.name || frame.id,
      path: "computed.effectiveProfile.effectiveDpr3Round",
      message: `Effective DPR is ${dprRatio.toFixed(2)}× the CR baseline.`,
      recommendation: lowCrSpike
        ? "Low-CR DPR spike clamp should reduce swing damage; inspect fixed sources if the ratio remains high."
        : "Reduce attack/recharge/burst pressure, or force Elite/Boss tier for this combination.",
      details: { dprRatio, baselineDpr: baseline.dpr, effectiveDpr: effectiveProfile.effectiveDpr3Round, targetCr, crDelta },
    }));
  }

  if (burstRatio >= 2.25) {
    issues.push(makeQaIssue({
      severity: burstRatio >= 3 ? "error" : "warning",
      area: "balance",
      check: "burst-dpr-high",
      id: frame.id,
      title: computed.name || frame.id,
      path: "computed.effectiveProfile.burstDpr",
      message: `Burst DPR is ${burstRatio.toFixed(2)}× the CR DPR baseline.`,
      recommendation: "Add telegraph/recharge/setup, reduce burst budget, or keep it as a death-only risk.",
      details: { burstRatio, baselineDpr: baseline.dpr, burstDpr: effectiveProfile.burstDpr },
    }));
  }

  if (hpRatio >= 1.65 && ["normal", undefined].includes(computed.monsterTier?.id)) {
    issues.push(makeQaIssue({
      severity: "warning",
      area: "balance",
      check: "effective-hp-high",
      id: frame.id,
      title: computed.name || frame.id,
      path: "computed.effectiveProfile.effectiveHp",
      message: `Effective HP is ${hpRatio.toFixed(2)}× the CR baseline on a Normal-tier frame.`,
      recommendation: "Move this frame to Elite/Boss or reduce defensive grafts.",
      details: { hpRatio, baselineHp: baseline.hp, effectiveHp: effectiveProfile.effectiveHp },
    }));
  }

  if (crDelta >= 2 && pressureProfile.label === "Low") {
    issues.push(makeQaIssue({
      severity: "error",
      area: "balance-ui",
      check: "pressure-label-floor",
      id: frame.id,
      title: computed.name || frame.id,
      path: "computed.pressureProfile.label",
      message: "Pressure label is Low even though CR validation puts the monster at least +2 CR above target.",
      recommendation: "Raise the pressure floor or inspect pressure sources for overpowered negative offsets.",
      details: { pressureProfile, targetCr, estimatedCr, crDelta },
    }));
  }
}

function addForgeIssues({ frame, context, issues }) {
  const statusSummary = {
    status: "complete",
    missingRequiredSlots: [],
    compatibilityIssues: 0,
    frameFitIssues: 0,
    relaxedSlots: asArray(context.forgeMeta?.relaxedSlots),
  };

  statusSummary.relaxedSlots.forEach((slotId) => {
    issues.push(makeQaIssue({
      severity: "warning",
      area: "forge",
      check: "relaxed-required-slot",
      id: frame.id,
      title: context.computed?.name || frame.id,
      path: `selection.${slotId}`,
      message: `Forge selected ${slotId} through relaxed compatibility fallback.`,
      recommendation: "Inspect compatibility metadata for this required slot. The QA runner found raw candidates, but strict compatibility could not select one.",
      details: { qaMode: frame.qaFrameMode, qaFrameStatus: frame.qaFrameStatus, coverage: frame.qaCoverage, forgeMeta: context.forgeMeta },
    }));
  });

  REQUIRED_PLAYABLE_SLOTS.forEach((slotId) => {
    if (!hasSelectedSlot(context.selected, slotId)) {
      statusSummary.missingRequiredSlots.push(slotId);
      issues.push(makeQaIssue({
        severity: "error",
        area: "forge",
        check: "required-slot",
        id: frame.id,
        title: context.computed?.name || frame.id,
        path: `selection.${slotId}`,
        message: `Forge did not select required ${slotId} slot.`,
        recommendation: "Add valid compatible graft candidates or tune Frame Fit gates for this frame.",
        details: {
          qaMode: frame.qaFrameMode,
          qaFrameStatus: frame.qaFrameStatus,
          coverage: frame.qaCoverage,
          missingRequiredSlots: frame.qaCoverage?.missingRequiredSlots || [],
        },
      }));
    }
  });

  context.selectedFeatures.forEach((feature) => {
    const status = getCompatibilityStatus(feature, context.selectedFeatures, context.typeId, context.category, { activePreset: null });
    if (["missing", "incompatible"].includes(status.kind)) {
      statusSummary.compatibilityIssues += 1;
      issues.push(makeQaIssue({
        severity: "error",
        area: "forge-compatibility",
        check: status.kind,
        id: frame.id,
        title: context.computed?.name || frame.id,
        path: `selection.${feature.slot}`,
        message: `${feature.title}: ${status.message}`,
        recommendation: "Adjust graft compatibility metadata or Forge selection order.",
        details: status,
      }));
    }

    const frameFit = evaluateMonsterFrameFit(feature, {
      roleId: context.roleId,
      tacticalRoleId: context.tacticalRoleId,
      monsterTierId: context.monsterTierId,
      tempoProfileId: context.tempoProfileId,
      dangerId: context.dangerId,
      targetCr: context.targetCr,
    });
    if (frameFit.hardBlock) {
      statusSummary.frameFitIssues += 1;
      issues.push(makeQaIssue({
        severity: "error",
        area: "forge-frame-fit",
        check: "frame-fit",
        id: frame.id,
        title: context.computed?.name || frame.id,
        path: `selection.${feature.slot}`,
        message: `${feature.title} does not fit forged frame: ${frameFit.message}`,
        recommendation: "Fix Frame Fit metadata or prevent this selection during Forge.",
      }));
    }
  });

  if (statusSummary.missingRequiredSlots.length) statusSummary.status = "incomplete";
  else if (statusSummary.compatibilityIssues || statusSummary.frameFitIssues) statusSummary.status = "invalid";
  return statusSummary;
}

function addExportIssues({ frame, context, issues }) {
  let artifacts;
  try {
    artifacts = buildExportArtifacts(context);
  } catch (error) {
    issues.push(makeQaIssue({
      severity: "error",
      area: "forge-export",
      check: "crash",
      id: frame.id,
      title: context.computed?.name || frame.id,
      message: `Forge export crashed: ${error.message}`,
      details: { stack: error.stack },
    }));
    return null;
  }

  const payloadAudit = buildExportPayloadAudit(artifacts);
  artifacts.payloadAudit = payloadAudit;

  if (!payloadAudit.publicPayloadValid) {
    issues.push(makeQaIssue({
      severity: "error",
      area: "forge-export",
      check: "json-parse",
      id: frame.id,
      title: context.computed?.name || frame.id,
      message: `Forged monster public export JSON is invalid: ${payloadAudit.publicPayloadError}`,
      details: { payloadAudit },
    }));
  }

  if (!payloadAudit.debugPayloadValid) {
    issues.push(makeQaIssue({
      severity: "error",
      area: "forge-export",
      check: "debug-json-parse",
      id: frame.id,
      title: context.computed?.name || frame.id,
      message: `Forged monster debug export JSON is invalid: ${payloadAudit.debugPayloadError}`,
      details: { payloadAudit },
    }));
  }

  if (payloadAudit.publicPayloadType !== "public" || payloadAudit.publicPayloadVisibility !== "table-facing") {
    issues.push(makeQaIssue({
      severity: "error",
      area: "forge-export",
      check: "public-payload-meta",
      id: frame.id,
      title: context.computed?.name || frame.id,
      message: "Public export payload metadata does not identify it as table-facing public JSON.",
      details: { payloadAudit },
    }));
  }

  if (payloadAudit.debugPayloadType !== "debug" || payloadAudit.debugPayloadVisibility !== "debug-editorial-internal") {
    issues.push(makeQaIssue({
      severity: "warning",
      area: "forge-export",
      check: "debug-payload-meta",
      id: frame.id,
      title: context.computed?.name || frame.id,
      message: "Debug export payload metadata does not identify it as internal debug JSON.",
      details: { payloadAudit },
    }));
  }

  if (payloadAudit.publicPayloadForbiddenKeyCount > 0) {
    issues.push(makeQaIssue({
      severity: "error",
      area: "forge-export",
      check: "public-payload-debug-fields",
      id: frame.id,
      title: context.computed?.name || frame.id,
      message: `Public export payload contains ${payloadAudit.publicPayloadForbiddenKeyCount} debug/editorial field(s).`,
      recommendation: "Move internals to debugExportJson and keep exportJson table-facing only.",
      details: { payloadAudit },
    }));
  }

  if (payloadAudit.publicPayloadLegacyTextCount > 0) {
    issues.push(makeQaIssue({
      severity: "error",
      area: "forge-export",
      check: "public-payload-legacy-text",
      id: frame.id,
      title: context.computed?.name || frame.id,
      message: `Public export payload contains legacy wording pattern(s): ${payloadAudit.publicPayloadLegacyTextHits.join(", ")}.`,
      recommendation: "Normalize table-facing text before it enters the public export payload.",
      details: { payloadAudit },
    }));
  }

  if (payloadAudit.debugMissingInternalKeyCount > 0) {
    issues.push(makeQaIssue({
      severity: "warning",
      area: "forge-export",
      check: "debug-payload-missing-internals",
      id: frame.id,
      title: context.computed?.name || frame.id,
      message: `Debug export payload is missing expected internal field(s): ${payloadAudit.debugMissingInternalKeys.join(", ")}.`,
      details: { payloadAudit },
    }));
  }

  asArray(artifacts.exportReadiness?.blockers).filter((blocker) => !["rendered-stat-block", "publish-gate"].includes(blocker.id)).forEach((blocker) => {
    issues.push(makeQaIssue({
      severity: "error",
      area: "forge-readiness",
      check: blocker.id,
      id: frame.id,
      title: context.computed?.name || frame.id,
      path: "exportReadiness",
      message: `Forge readiness blocker: ${blocker.label}. ${blocker.detail}`,
      recommendation: "Fix the underlying content/export blocker before publishing this generated monster.",
    }));
  });

  asArray(artifacts.statBlockParse?.issues).forEach((issue) => {
    issues.push(makeQaIssue({
      severity: issue.severity || "warning",
      area: issue.area || "stat-block-parser",
      check: issue.check || "rendered-stat-block",
      id: frame.id,
      title: context.computed?.name || frame.id,
      path: issue.path || "statBlock",
      message: issue.message || "Rendered stat block parser issue.",
      recommendation: issue.recommendation || "Inspect rendered stat block output.",
      details: issue.details,
    }));
  });

  return artifacts;
}

function summarizeGeneratedMonster({ frame, context, artifacts, issueCount, infoCount = 0, publishGate, forgeStatus, balanceStatus = "analyzed", exportStatus = "analyzed" }) {
  const computed = context.computed || {};
  return {
    id: frame.id,
    seed: frame.seed,
    name: computed.name,
    frame: {
      typeId: context.typeId,
      category: context.category,
      roleId: context.roleId,
      sourceId: context.sourceId,
      targetCr: context.targetCr,
      tacticalRoleId: context.tacticalRoleId,
      monsterTierId: context.monsterTierId,
      tempoProfileId: context.tempoProfileId,
      dangerId: context.dangerId,
    },
    selected: context.selected,
    selectedFeatureIds: context.selectedFeatures.map((feature) => feature.id),
    selectedFeatureTitles: context.selectedFeatures.map((feature) => feature.title),
    qaMode: frame.qaFrameMode || "realistic",
    qaFrameStatus: frame.qaFrameStatus || "unknown",
    qaCoverage: frame.qaCoverage,
    forgeStatus: forgeStatus?.status || "unknown",
    missingRequiredSlots: forgeStatus?.missingRequiredSlots || [],
    relaxedSlots: forgeStatus?.relaxedSlots || [],
    balanceStatus,
    exportStatus,
    targetCr: Number(computed.targetCr || frame.targetCr || 0),
    estimatedCr: Number(computed.estimatedCr || 0),
    crDelta: Number(computed.estimatedCr || 0) - Number(computed.targetCr || frame.targetCr || 0),
    offensiveCr: computed.crValidation?.offensive?.cr,
    defensiveCr: computed.crValidation?.defensive?.cr,
    pressure: computed.pressureProfile?.score ?? computed.pressure,
    pressureLabel: computed.pressureProfile?.label,
    complexity: computed.complexityProfile?.score ?? computed.complexity,
    complexityLabel: computed.complexityProfile?.label,
    dpr: computed.effectiveProfile?.effectiveDpr3Round ?? computed.dpr,
    baselineDpr: computed.baseline?.dpr,
    burstDpr: computed.effectiveProfile?.burstDpr,
    dprMainActionOptionCount: computed.dprProfile?.actionEconomy?.mainActionOptionCount || 0,
    dprSuppressedMainActionDamage: computed.dprProfile?.actionEconomy?.suppressedMainActionDamage || 0,
    dprSelectedMainActions: computed.dprProfile?.actionEconomy?.selectedMainActions || null,
    hp: computed.printedStats?.hp,
    effectiveHp: computed.effectiveProfile?.effectiveHp,
    ac: computed.printedStats?.ac,
    attackBonus: computed.printedStats?.attackBonus,
    saveDc: computed.printedStats?.saveDc,
    framePowerHpMult: computed.framePowerProfile?.hpMult,
    framePowerDprMult: computed.framePowerProfile?.dprMult,
    framePowerBudget: computed.framePowerProfile?.budget,
    framePowerDiagnostics: asArray(computed.framePowerProfile?.diagnostics).map((diagnostic) => diagnostic.code),
    crFitApplied: Boolean(computed.crFitProfile?.applied),
    crFitPasses: asArray(computed.crFitProfile?.passes).length,
    crFitInitialEstimatedCr: computed.crFitProfile?.initial?.estimatedCr,
    crFitFinalEstimatedCr: computed.crFitProfile?.final?.estimatedCr,
    crFitInitialHpTarget: computed.crFitProfile?.initial?.hpTarget,
    crFitFinalHpTarget: computed.crFitProfile?.final?.hpTarget,
    crFitInitialDprTarget: computed.crFitProfile?.initial?.dprTarget,
    crFitFinalDprTarget: computed.crFitProfile?.final?.dprTarget,
    crFitDiagnostics: asArray(computed.crFitProfile?.diagnostics).map((diagnostic) => diagnostic.code),
    crFitFinalSaveDcTarget: computed.crFitProfile?.final?.saveDcTarget,
    crFitFinalPrintedSaveDc: computed.crFitProfile?.final?.printedSaveDc,
    lowCrHardControlStatus: computed.lowCrHardControlProfile?.status || "not-run",
    lowCrHardControlCount: computed.lowCrHardControlProfile?.hardControlCount || 0,
    lowCrHardControlFeatures: asArray(computed.lowCrHardControlProfile?.hardControlFeatures).map((feature) => feature.title || feature.id),
    scalableMainActionStatus: computed.scalableMainActionGateProfile?.status || "not-run",
    scalableMainActionCount: computed.scalableMainActionGateProfile?.scalableActionCount || 0,
    scalableMainActionFallback: computed.scalableMainActionGateProfile?.fallbackFeature?.title || null,
    warningCount: asArray(computed.warnings).length,
    issueCount,
    infoCount,
    publishStatus: publishGate?.status || "unknown",
    publishReady: Boolean(publishGate?.ready),
    publishBlockerCount: publishGate?.counts?.blockers || 0,
    publishReviewCount: publishGate?.counts?.reviews || 0,
    publishInfoCount: publishGate?.counts?.info || 0,
    statBlockParserStatus: artifacts?.statBlockParse?.status || "not-run",
    statBlockParserErrors: artifacts?.statBlockParse?.summary?.error || 0,
    statBlockParserWarnings: artifacts?.statBlockParse?.summary?.warning || 0,
    statBlockParserInfo: artifacts?.statBlockParse?.summary?.info || 0,
    exportSize: artifacts?.exportJson?.length || 0,
    debugExportSize: artifacts?.debugExportJson?.length || 0,
    payloadAudit: artifacts?.payloadAudit || null,
    publicPayloadValid: Boolean(artifacts?.payloadAudit?.publicPayloadValid),
    debugPayloadValid: Boolean(artifacts?.payloadAudit?.debugPayloadValid),
    publicPayloadForbiddenKeyCount: artifacts?.payloadAudit?.publicPayloadForbiddenKeyCount || 0,
    publicPayloadLegacyTextCount: artifacts?.payloadAudit?.publicPayloadLegacyTextCount || 0,
    debugMissingInternalKeyCount: artifacts?.payloadAudit?.debugMissingInternalKeyCount || 0,
  };
}

function shouldIncludeDebugPayload(summary = {}) {
  if (!summary) return false;
  return (
    Number(summary.issueCount || 0) > 0 ||
    Number(summary.publishBlockerCount || 0) > 0 ||
    Number(summary.publishReviewCount || 0) > 0 ||
    Number(summary.crDelta || 0) >= 2 ||
    summary.forgeStatus !== "complete" ||
    summary.balanceStatus !== "analyzed" ||
    summary.exportStatus !== "analyzed" ||
    summary.publishReady === false
  );
}

function buildGeneratedDebugPayload({ summary, frame, context, artifacts, forgeStatus, balanceStatus, exportStatus, publishGate }) {
  return {
    ...summary,
    frameInput: frame,
    forgeStatusDetail: forgeStatus,
    balanceStatus,
    exportStatus,
    publishGate,
    context,
    artifacts,
  };
}

function buildBatchAnalytics(generated = [], issues = []) {
  const byGraft = new Map();
  const byCheck = new Map();
  const bySource = new Map();
  const byCategory = new Map();
  const byType = new Map();

  function bump(map, key) {
    const normalizedKey = cleanString(key) || "unknown";
    map.set(normalizedKey, (map.get(normalizedKey) || 0) + 1);
  }

  issues.forEach((issue) => {
    const key = `${issue.area}:${issue.check}`;
    byCheck.set(key, (byCheck.get(key) || 0) + 1);
    const selection = issue.details?.featureId ? [issue.details.featureId] : [];
    selection.forEach((id) => byGraft.set(id, (byGraft.get(id) || 0) + 1));
  });

  generated.forEach((item) => {
    bump(bySource, item.frame?.sourceId);
    bump(byCategory, item.frame?.category);
    bump(byType, item.frame?.typeId);
  });

  const completeGenerated = generated.filter((item) => item.forgeStatus === "complete");
  const balanceAnalyzed = generated.filter((item) => item.balanceStatus === "analyzed");
  const crDeltas = balanceAnalyzed.map((item) => Number(item.crDelta || 0));
  const averageCrDelta = crDeltas.length ? crDeltas.reduce((sum, value) => sum + value, 0) / crDeltas.length : 0;
  const aboveTargetBy2 = balanceAnalyzed.filter((item) => Number(item.crDelta || 0) >= 2).length;
  const aboveTargetBy4 = balanceAnalyzed.filter((item) => Number(item.crDelta || 0) >= 4).length;
  const belowTargetBy2 = balanceAnalyzed.filter((item) => Number(item.crDelta || 0) <= -2).length;
  const publishReady = generated.filter((item) => item.publishReady === true).length;
  const publishBlocked = generated.filter((item) => item.publishStatus === "blocked").length;
  const publishReview = generated.filter((item) => item.publishStatus === "review").length;
  const publishUnknown = generated.filter((item) => !item.publishStatus || item.publishStatus === "unknown").length;
  const lowPressureMismatch = balanceAnalyzed.filter((item) => Number(item.crDelta || 0) >= 2 && item.pressureLabel === "Low").length;
  const statBlockParserPassed = generated.filter((item) => item.statBlockParserStatus === "pass").length;
  const statBlockParserReview = generated.filter((item) => item.statBlockParserStatus === "warning").length;
  const statBlockParserFailed = generated.filter((item) => item.statBlockParserStatus === "error").length;
  const statBlockParserNotRun = generated.filter((item) => !item.statBlockParserStatus || item.statBlockParserStatus === "not-run").length;
  const scalableMainActionFallbackAdded = generated.filter((item) => item.scalableMainActionStatus === "fallback-added").length;
  const missingScalableMainAction = generated.filter((item) => item.scalableMainActionStatus === "fallback-required").length;
  const lowCrDprSpikeWarnings = issues.filter((issue) => issue.area === "balance" && issue.check === "low-cr-dpr-spike").length;
  const crFitApplied = balanceAnalyzed.filter((item) => item.crFitApplied).length;
  const averageCrFitInitialDelta = balanceAnalyzed.length
    ? balanceAnalyzed.reduce((sum, item) => sum + (Number(item.crFitInitialEstimatedCr ?? item.estimatedCr ?? 0) - Number(item.targetCr || 0)), 0) / balanceAnalyzed.length
    : 0;
  const averageCrFitDeltaReduction = balanceAnalyzed.length
    ? balanceAnalyzed.reduce((sum, item) => {
        const initialDelta = Number(item.crFitInitialEstimatedCr ?? item.estimatedCr ?? 0) - Number(item.targetCr || 0);
        const finalDelta = Number(item.estimatedCr || 0) - Number(item.targetCr || 0);
        return sum + (initialDelta - finalDelta);
      }, 0) / balanceAnalyzed.length
    : 0;
  const forgeIncomplete = generated.filter((item) => item.forgeStatus === "incomplete").length;
  const forgeInvalid = generated.filter((item) => item.forgeStatus === "invalid").length;
  const balanceSkipped = generated.filter((item) => item.balanceStatus === "skipped_due_to_incomplete_forge").length;
  const exportSkipped = generated.filter((item) => item.exportStatus === "skipped_due_to_incomplete_forge").length;
  const publicPayloads = generated.filter((item) => item.publicPayloadValid === true).length;
  const debugPayloads = generated.filter((item) => item.debugPayloadValid === true).length;
  const publicPayloadsWithDebugFields = generated.filter((item) => Number(item.publicPayloadForbiddenKeyCount || 0) > 0).length;
  const publicPayloadsWithLegacyText = generated.filter((item) => Number(item.publicPayloadLegacyTextCount || 0) > 0).length;
  const debugPayloadsMissingInternals = generated.filter((item) => Number(item.debugMissingInternalKeyCount || 0) > 0).length;

  return {
    generated: generated.length,
    completeGenerated: completeGenerated.length,
    forgeIncomplete,
    forgeInvalid,
    balanceAnalyzed: balanceAnalyzed.length,
    balanceSkipped,
    exportSkipped,
    publicPayloads,
    debugPayloads,
    publicPayloadsWithDebugFields,
    publicPayloadsWithLegacyText,
    debugPayloadsMissingInternals,
    averageCrDelta: Number(averageCrDelta.toFixed(2)),
    aboveTargetBy2,
    aboveTargetBy4,
    belowTargetBy2,
    publishReady,
    publishBlocked,
    publishReview,
    publishUnknown,
    lowPressureMismatch,
    statBlockParserPassed,
    statBlockParserReview,
    statBlockParserFailed,
    statBlockParserNotRun,
    scalableMainActionFallbackAdded,
    missingScalableMainAction,
    lowCrDprSpikeWarnings,
    crFitApplied,
    averageCrFitInitialDelta: Number(averageCrFitInitialDelta.toFixed(2)),
    averageCrFitDeltaReduction: Number(averageCrFitDeltaReduction.toFixed(2)),
    topChecks: [...byCheck.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([key, count]) => ({ key, count })),
    topProblematicGrafts: [...byGraft.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([id, count]) => ({ id, count })),
    bySource: [...bySource.entries()].sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ id, count })),
    byCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ id, count })),
    byType: [...byType.entries()].sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ id, count })),
  };
}

export function runMonsterBatchQa(options = {}) {
  const normalized = normalizeMonsterBatchQaOptions(options);
  const frames = asArray(options.frames).length ? asArray(options.frames) : buildMonsterBatchQaFrames(normalized);
  const issues = [];
  const generated = [];

  frames.forEach((frame) => {
    let context;
    let artifacts;
    let forgeStatus;
    let balanceStatus = "analyzed";
    let exportStatus = "analyzed";
    const frameIssueStart = issues.length;

    try {
      const forgeResult = forgeMonsterSelectionDetailed(frame, {
        slots: normalized.includeOptionalSlots ? buildBatchSlots(frame) : REQUIRED_PLAYABLE_SLOTS,
        allowRelaxedCoreFallback: true,
      });
      const selection = forgeResult.selected;
      context = buildMonsterFrameContext({ ...frame, selection, rulesetId: normalized.rulesetId });
      context.forgeMeta = forgeResult.meta;
    } catch (error) {
      issues.push(makeQaIssue({
        severity: "error",
        area: "forge",
        check: "crash",
        id: frame.id,
        title: frame.id,
        message: `Monster generation crashed: ${error.message}`,
        details: { frame, stack: error.stack },
      }));
      generated.push({ id: frame.id, seed: frame.seed, frame, forgeStatus: "crashed", balanceStatus: "skipped_due_to_forge_crash", exportStatus: "skipped_due_to_forge_crash", issueCount: issues.length - frameIssueStart, fatal: true });
      return;
    }

    forgeStatus = addForgeIssues({ frame, context, issues });
    addRulesValidationIssues({ frame, context, issues });

    if (forgeStatus.status === "complete") {
      addBalanceIssues({ frame, context, issues });
      artifacts = addExportIssues({ frame, context, issues });
    } else {
      balanceStatus = "skipped_due_to_incomplete_forge";
      exportStatus = "skipped_due_to_incomplete_forge";
    }

    const frameIssues = issues.slice(frameIssueStart);
    const publishGate = buildMonsterPublishGate({
      computed: context.computed,
      selected: context.selected,
      selectedFeatures: context.selectedFeatures,
      actions: context.actions,
      weaknessFeatures: context.weaknessFeatures,
      issues: frameIssues,
      exportReadiness: artifacts?.exportReadiness,
      statBlockParse: artifacts?.statBlockParse,
    });
    const issueCount = frameIssues.filter((issue) => issue.severity !== "info").length;
    const infoCount = frameIssues.filter((issue) => issue.severity === "info").length;
    const summary = summarizeGeneratedMonster({ frame, context, artifacts, issueCount, infoCount, publishGate, forgeStatus, balanceStatus, exportStatus });
    const debugPayload = shouldIncludeDebugPayload(summary)
      ? buildGeneratedDebugPayload({ summary, frame, context, artifacts, forgeStatus, balanceStatus, exportStatus, publishGate })
      : null;
    generated.push(normalized.includeFullPayloads
      ? { ...summary, context, artifacts, debugPayload }
      : debugPayload
        ? { ...summary, debugPayload }
        : summary);
  });

  const suite = {
    id: "monster-batch-generation",
    label: "Monster Batch Generation QA",
    summary: summarizeQaIssues(issues),
    issues,
    metrics: {
      version: MONSTER_BATCH_QA_VERSION,
      options: normalized,
      frames: frames.length,
      generated,
      analytics: buildBatchAnalytics(generated, issues),
    },
  };

  return buildQaReport({
    suites: [suite],
    metadata: {
      mode: "studio-browser-batch",
      qaVersion: MONSTER_BATCH_QA_VERSION,
      options: normalized,
    },
  });
}

export function buildMonsterBatchQaMarkdown(report = {}) {
  const suite = asArray(report.suites).find((item) => item.id === "monster-batch-generation") || report.suites?.[0] || {};
  const analytics = suite.metrics?.analytics || {};
  const generated = asArray(suite.metrics?.generated);
  const grouped = groupQaIssues(report.issues || []);
  const summary = report.summary || summarizeQaIssues(report.issues || []);
  const options = suite.metrics?.options || report.metadata?.options || {};
  const lines = [];

  lines.push("# Cruor Monster Batch QA Report");
  lines.push("");
  lines.push(`Generated At: ${report.generatedAt || new Date().toISOString()}`);
  lines.push(`Count: ${options.count ?? generated.length}`);
  lines.push(`Seed: ${options.seed || DEFAULT_SEED}`);
  lines.push(`CR Range: ${options.crMin ?? "?"}–${options.crMax ?? "?"}`);
  lines.push(`QA Mode: ${options.qaMode || "realistic"}`);
  lines.push("");
  lines.push("## Summary");
  lines.push(`- Total Issues: ${summary.total || 0}`);
  lines.push(`- Errors: ${summary.error || 0}`);
  lines.push(`- Warnings: ${summary.warning || 0}`);
  lines.push(`- Info: ${summary.info || 0}`);
  lines.push(`- Complete Forge Outputs: ${analytics.completeGenerated ?? 0}`);
  lines.push(`- Incomplete Forge Outputs: ${analytics.forgeIncomplete ?? 0}`);
  lines.push(`- Balance Analyzed: ${analytics.balanceAnalyzed ?? 0}`);
  lines.push(`- Balance Skipped: ${analytics.balanceSkipped ?? 0}`);
  lines.push(`- Average CR Delta: ${analytics.averageCrDelta ?? 0}`);
  lines.push(`- Average Initial CR Delta: ${analytics.averageCrFitInitialDelta ?? analytics.averageCrDelta ?? 0}`);
  lines.push(`- Average CR Delta Reduction: ${analytics.averageCrFitDeltaReduction ?? 0}`);
  lines.push(`- CR Fit Applied: ${analytics.crFitApplied ?? 0}`);
  lines.push(`- CR +2 or more: ${analytics.aboveTargetBy2 ?? 0}`);
  lines.push(`- CR +4 or more: ${analytics.aboveTargetBy4 ?? 0}`);
  lines.push(`- CR -2 or lower: ${analytics.belowTargetBy2 ?? 0}`);
  lines.push(`- Publish Ready: ${analytics.publishReady ?? 0}`);
  lines.push(`- Publish Review: ${analytics.publishReview ?? 0}`);
  lines.push(`- Publish Blocked: ${analytics.publishBlocked ?? 0}`);
  lines.push(`- Stat Block Parser Passed: ${analytics.statBlockParserPassed ?? 0}`);
  lines.push(`- Stat Block Parser Review: ${analytics.statBlockParserReview ?? 0}`);
  lines.push(`- Stat Block Parser Failed: ${analytics.statBlockParserFailed ?? 0}`);
  lines.push(`- Scalable Main Action Fallback Added: ${analytics.scalableMainActionFallbackAdded ?? 0}`);
  lines.push(`- Missing Scalable Main Action: ${analytics.missingScalableMainAction ?? 0}`);
  lines.push(`- Low-CR DPR Spike Warnings: ${analytics.lowCrDprSpikeWarnings ?? 0}`);
  lines.push(`- Low Pressure Mismatch: ${analytics.lowPressureMismatch ?? 0}`);
  lines.push(`- Public Payloads Valid: ${analytics.publicPayloads ?? 0}`);
  lines.push(`- Debug Payloads Valid: ${analytics.debugPayloads ?? 0}`);
  lines.push(`- Public Payloads With Debug Fields: ${analytics.publicPayloadsWithDebugFields ?? 0}`);
  lines.push(`- Public Payloads With Legacy Text: ${analytics.publicPayloadsWithLegacyText ?? 0}`);
  lines.push(`- Debug Payloads Missing Internals: ${analytics.debugPayloadsMissingInternals ?? 0}`);
  lines.push("");
  lines.push("## Most Common Issues");
  if (!grouped.length) {
    lines.push("No grouped issues.");
  } else {
    grouped.slice(0, 24).forEach((group) => {
      lines.push(`- ${group.severity.toUpperCase()} · ${group.area}/${group.check} · ${group.count}× — ${group.message}`);
      if (group.ids?.length) lines.push(`  - Examples: ${group.ids.join(", ")}`);
    });
  }
  lines.push("");
  lines.push("## Generated Monster Outliers");
  generated
    .filter((item) => item.balanceStatus === "analyzed" && (Number(item.crDelta || 0) >= 2 || Number(item.issueCount || 0) > 0 || item.publishStatus === "blocked" || item.publishStatus === "review"))
    .slice(0, 40)
    .forEach((item) => {
      lines.push(`- ${item.id} · ${item.name || "Unnamed"} · Target CR ${item.targetCr}, Est. CR ${item.estimatedCr}, Δ ${item.crDelta}, Issues ${item.issueCount}, Publish ${item.publishStatus || "unknown"}`);
      lines.push(`  - Frame: ${item.frame?.roleId || "?"} / ${item.frame?.monsterTierId || "?"} / ${item.frame?.tempoProfileId || "?"} / ${item.frame?.dangerId || "?"}`);
      lines.push(`  - Frame Power: HP ×${item.framePowerHpMult ?? "?"}, DPR ×${item.framePowerDprMult ?? "?"}, Budget ${item.framePowerBudget ?? "?"}`);
      if (item.crFitApplied) {
        lines.push(`  - CR Fit: Est. CR ${item.crFitInitialEstimatedCr ?? "?"} → ${item.crFitFinalEstimatedCr ?? item.estimatedCr}; HP target ${item.crFitInitialHpTarget ?? "?"} → ${item.crFitFinalHpTarget ?? "?"}; DPR target ${item.crFitInitialDprTarget ?? "?"} → ${item.crFitFinalDprTarget ?? "?"}`);
      }
      lines.push(`  - Grafts: ${asArray(item.selectedFeatureTitles).join(", ") || asArray(item.selectedFeatureIds).join(", ")}`);
    });
  lines.push("");

  return lines.join("\n");
}



function createCrc32Table() {
  const table = new Uint32Array(256);
  for (let index = 0; index < table.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

const CRC32_TABLE = createCrc32Table();
const ZIP_REVOKE_DELAY_MS = 60_000;
const HEAVY_EXPORT_KEYS = new Set([
  "artifacts",
  "context",
  "computed",
  "exportJson",
  "exportMarkdown",
  "exportReadiness",
  "fullPayload",
  "html",
  "markup",
  "renderedHtml",
  "rulesProfile",
  "debugPayload",
  "fullPayload",
]);
const LONG_EXPORT_STRING_LIMIT = 4_000;
const MAX_EXPORT_DEPTH = 8;

function calculateCrc32(bytes) {
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = CRC32_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function pushUint16(bytes, value) {
  bytes.push(value & 0xff, (value >>> 8) & 0xff);
}

function pushUint32(bytes, value) {
  bytes.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function concatUint8Arrays(parts) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function getExportTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function stripHeavyQaExportPayload(value, depth = 0) {
  if (value == null) return value;
  if (typeof value === "string") {
    if (value.length <= LONG_EXPORT_STRING_LIMIT) return value;
    return `${value.slice(0, LONG_EXPORT_STRING_LIMIT)}… [truncated ${value.length - LONG_EXPORT_STRING_LIMIT} chars]`;
  }
  if (typeof value !== "object") return value;
  if (depth >= MAX_EXPORT_DEPTH) return "[truncated: depth limit]";
  if (Array.isArray(value)) return value.map((item) => stripHeavyQaExportPayload(item, depth + 1));

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !HEAVY_EXPORT_KEYS.has(key))
      .map(([key, entry]) => [key, stripHeavyQaExportPayload(entry, depth + 1)]),
  );
}

function compactGeneratedMonsterForExport(monster = {}) {
  const selectedSlotIds = monster.selected && typeof monster.selected === "object"
    ? Object.entries(monster.selected)
        .filter(([, graftId]) => Boolean(graftId))
        .map(([slotId, graftId]) => `${slotId}:${graftId}`)
    : undefined;

  return stripHeavyQaExportPayload({
    ...monster,
    selected: undefined,
    selectedSlotIds,
    qaCoverage: monster.qaCoverage ? {
      requiredSlotsMet: monster.qaCoverage.requiredSlotsMet,
      missingRequiredSlots: monster.qaCoverage.missingRequiredSlots,
      totalCandidates: monster.qaCoverage.totalCandidates,
      totalEligibleCandidates: monster.qaCoverage.totalEligibleCandidates,
      countsBySlot: monster.qaCoverage.countsBySlot,
      eligibleCountsBySlot: monster.qaCoverage.eligibleCountsBySlot,
      simulatedSelected: monster.qaCoverage.simulatedSelected,
      candidateIdsBySlot: monster.qaCoverage.candidateIdsBySlot,
      eligibleCandidateIdsBySlot: monster.qaCoverage.eligibleCandidateIdsBySlot,
    } : undefined,
  });
}

export function buildMonsterBatchQaCompactReport(report = {}) {
  const compactReport = stripHeavyQaExportPayload(report);
  compactReport.exportProfile = {
    kind: "compact-browser-qa-report",
    note: "Heavy generated payloads, rendered exports, and full computed contexts are intentionally omitted to keep the ZIP small. Re-run with the same seed if a full browser payload is needed.",
  };
  compactReport.suites = asArray(report.suites).map((suite) => ({
    ...stripHeavyQaExportPayload(suite),
    metrics: {
      ...stripHeavyQaExportPayload(suite.metrics || {}),
      generated: asArray(suite.metrics?.generated).map(compactGeneratedMonsterForExport),
    },
  }));
  compactReport.issues = asArray(report.issues).map((issue) => stripHeavyQaExportPayload(issue));
  compactReport.groupedIssues = groupQaIssues(compactReport.issues);
  compactReport.summary = report.summary || summarizeQaIssues(compactReport.issues);
  return compactReport;
}

function normalizeExportMode(value) {
  const mode = cleanString(value || "debug").toLowerCase();
  return BATCH_QA_EXPORT_MODES.includes(mode) ? mode : "debug";
}

function getBatchSuite(report = {}) {
  return asArray(report.suites).find((item) => item.id === "monster-batch-generation") || asArray(report.suites)[0] || {};
}

function getGeneratedMonsters(report = {}) {
  return asArray(getBatchSuite(report).metrics?.generated);
}

function scoreDebugExportCandidate(monster = {}) {
  return (
    Number(monster.issueCount || 0) * 100 +
    Number(monster.publishBlockerCount || 0) * 125 +
    Number(monster.publishReviewCount || 0) * 45 +
    Math.max(0, Number(monster.crDelta || 0)) * 25 +
    (monster.publishStatus === "blocked" ? 90 : 0) +
    (monster.forgeStatus !== "complete" ? 75 : 0) +
    (monster.balanceStatus !== "analyzed" ? 40 : 0) +
    (monster.exportStatus !== "analyzed" ? 40 : 0) +
    (Number(monster.burstDpr || 0) > Number(monster.baselineDpr || 0) * 2 ? 35 : 0)
  );
}

function getDebugExportCandidates(report = {}, limit = DEFAULT_DEBUG_EXPORT_LIMIT) {
  const normalizedLimit = normalizeInteger(limit, DEFAULT_DEBUG_EXPORT_LIMIT, 1, 200);
  return getGeneratedMonsters(report)
    .filter((monster) => monster?.debugPayload || Number(monster?.issueCount || 0) > 0 || Number(monster?.publishBlockerCount || 0) > 0 || Number(monster?.publishReviewCount || 0) > 0 || Number(monster?.crDelta || 0) >= 2 || monster?.publishReady === false || monster?.forgeStatus !== "complete")
    .sort((a, b) => scoreDebugExportCandidate(b) - scoreDebugExportCandidate(a))
    .slice(0, normalizedLimit);
}

function getSafeDebugPayload(monster = {}) {
  return monster.debugPayload || monster.fullPayload || monster;
}

function buildMonsterBatchQaDebugIndex(report = {}, candidates = []) {
  const suite = getBatchSuite(report);
  return {
    exportProfile: {
      kind: "debug-browser-qa-report",
      note: "Compact report plus full debug payloads for the highest-priority failed/outlier generated monsters.",
      debugPayloadCount: candidates.length,
    },
    generatedAt: report.generatedAt,
    metadata: report.metadata,
    summary: report.summary,
    analytics: suite.metrics?.analytics,
    candidates: candidates.map((monster) => ({
      id: monster.id,
      name: monster.name,
      issueCount: monster.issueCount,
      infoCount: monster.infoCount,
      publishStatus: monster.publishStatus,
      publishReady: monster.publishReady,
      publishBlockerCount: monster.publishBlockerCount,
      publishReviewCount: monster.publishReviewCount,
      forgeStatus: monster.forgeStatus,
      balanceStatus: monster.balanceStatus,
      exportStatus: monster.exportStatus,
      targetCr: monster.targetCr,
      estimatedCr: monster.estimatedCr,
      crDelta: monster.crDelta,
      selectedFeatureIds: monster.selectedFeatureIds,
      selectedFeatureTitles: monster.selectedFeatureTitles,
      debugFilename: `debug/${monster.id || "monster"}.json`,
    })),
  };
}

function buildMonsterBatchQaReadme({ exportMode, debugCount, timestamp }) {
  const mode = normalizeExportMode(exportMode);
  const lines = [
    "Cruor Monster Batch QA Export",
    "",
    `Export Mode: ${mode}`,
    `Timestamp: ${timestamp}`,
    "",
  ];

  if (mode === "compact") {
    lines.push("This ZIP contains a compact JSON report and Markdown summary for aggregate analysis.");
    lines.push("Heavy generated payloads are omitted.");
  } else if (mode === "debug") {
    lines.push("This ZIP contains a compact JSON report, Markdown summary, and full debug payloads for the most important failed/outlier monsters.");
    lines.push(`Debug payload files: ${debugCount}`);
    lines.push("Use debug/debug-index.json to see which generated monsters were included.");
  } else {
    lines.push("This ZIP contains the full in-browser QA report object plus Markdown summary.");
    lines.push("It may still only include full payloads for all monsters if the run kept full payloads enabled; otherwise it includes debug payloads for failures/outliers.");
  }

  return `${lines.join("\n")}\n`;
}

async function deflateRawBytes(bytes) {
  if (typeof CompressionStream === "undefined") return null;
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch (error) {
    return null;
  }
}

async function buildZipBlob(files = [], { compress = true } = {}) {
  const encoder = new TextEncoder();
  const now = new Date();
  const dos = getDosDateTime(now);
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = typeof file.content === "string" ? encoder.encode(file.content) : file.content;
    const compressedBytes = compress ? await deflateRawBytes(contentBytes) : null;
    const shouldUseCompression = compressedBytes && compressedBytes.length > 0 && compressedBytes.length < contentBytes.length;
    const payloadBytes = shouldUseCompression ? compressedBytes : contentBytes;
    const compressionMethod = shouldUseCompression ? 8 : 0;
    const crc = calculateCrc32(contentBytes);
    const compressedSize = payloadBytes.length;
    const uncompressedSize = contentBytes.length;

    const localHeader = [];
    pushUint32(localHeader, 0x04034b50);
    pushUint16(localHeader, 20);
    pushUint16(localHeader, 0x0800);
    pushUint16(localHeader, compressionMethod);
    pushUint16(localHeader, dos.time);
    pushUint16(localHeader, dos.date);
    pushUint32(localHeader, crc);
    pushUint32(localHeader, compressedSize);
    pushUint32(localHeader, uncompressedSize);
    pushUint16(localHeader, nameBytes.length);
    pushUint16(localHeader, 0);

    const localPart = concatUint8Arrays([new Uint8Array(localHeader), nameBytes, payloadBytes]);
    localParts.push(localPart);

    const centralHeader = [];
    pushUint32(centralHeader, 0x02014b50);
    pushUint16(centralHeader, 20);
    pushUint16(centralHeader, 20);
    pushUint16(centralHeader, 0x0800);
    pushUint16(centralHeader, compressionMethod);
    pushUint16(centralHeader, dos.time);
    pushUint16(centralHeader, dos.date);
    pushUint32(centralHeader, crc);
    pushUint32(centralHeader, compressedSize);
    pushUint32(centralHeader, uncompressedSize);
    pushUint16(centralHeader, nameBytes.length);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint16(centralHeader, 0);
    pushUint32(centralHeader, 0);
    pushUint32(centralHeader, offset);

    centralParts.push(concatUint8Arrays([new Uint8Array(centralHeader), nameBytes]));
    offset += localPart.length;
  }

  const centralDirectory = concatUint8Arrays(centralParts);
  const centralOffset = offset;
  const endRecord = [];
  pushUint32(endRecord, 0x06054b50);
  pushUint16(endRecord, 0);
  pushUint16(endRecord, 0);
  pushUint16(endRecord, files.length);
  pushUint16(endRecord, files.length);
  pushUint32(endRecord, centralDirectory.length);
  pushUint32(endRecord, centralOffset);
  pushUint16(endRecord, 0);

  return new Blob([concatUint8Arrays([...localParts, centralDirectory, new Uint8Array(endRecord)])], { type: "application/zip" });
}

export async function buildMonsterBatchQaZipBlob(report = {}, {
  filenamePrefix = "cruor-monster-batch-qa",
  timestamp = getExportTimestamp(),
  exportMode = "debug",
  debugLimit = DEFAULT_DEBUG_EXPORT_LIMIT,
} = {}) {
  const mode = normalizeExportMode(exportMode);
  const compactReport = buildMonsterBatchQaCompactReport(report);
  const debugCandidates = mode === "debug" ? getDebugExportCandidates(report, debugLimit) : [];
  const files = [
    {
      name: `${filenamePrefix}-${timestamp}.compact.json`,
      content: JSON.stringify(compactReport, null, 2),
    },
    {
      name: `${filenamePrefix}-${timestamp}.md`,
      content: buildMonsterBatchQaMarkdown(report),
    },
  ];

  if (mode === "debug") {
    files.push({
      name: "debug/debug-index.json",
      content: JSON.stringify(buildMonsterBatchQaDebugIndex(report, debugCandidates), null, 2),
    });
    debugCandidates.forEach((monster) => {
      files.push({
        name: `debug/${monster.id || "monster"}.json`,
        content: JSON.stringify(getSafeDebugPayload(monster), null, 2),
      });
    });
  }

  if (mode === "full") {
    files.push({
      name: `${filenamePrefix}-${timestamp}.full.json`,
      content: JSON.stringify(report, null, 2),
    });
  }

  files.push({
    name: "README.txt",
    content: buildMonsterBatchQaReadme({ exportMode: mode, debugCount: debugCandidates.length, timestamp }),
  });

  return buildZipBlob(files, { compress: true });
}

export async function downloadMonsterBatchQaReport(report, {
  format = "zip",
  filenamePrefix = "cruor-monster-batch-qa",
  exportMode = "debug",
  debugLimit = DEFAULT_DEBUG_EXPORT_LIMIT,
} = {}) {
  if (typeof document === "undefined") return;
  const timestamp = getExportTimestamp();
  const mode = normalizeExportMode(exportMode);
  const isMarkdown = format === "markdown";
  const isZip = format === "zip";
  const blob = isZip
    ? await buildMonsterBatchQaZipBlob(report, { filenamePrefix, timestamp, exportMode: mode, debugLimit })
    : new Blob([
        isMarkdown ? buildMonsterBatchQaMarkdown(report) : JSON.stringify(buildMonsterBatchQaCompactReport(report), null, 2),
      ], { type: isMarkdown ? "text/markdown;charset=utf-8" : "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filenamePrefix}-${timestamp}${isZip ? `-${mode}` : ""}.${isZip ? "zip" : isMarkdown ? "md" : "json"}`;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, ZIP_REVOKE_DELAY_MS);
}

export {
  DEFAULT_BATCH_COUNT,
  MAX_SAFE_BROWSER_BATCH_COUNT,
  MAX_HARD_BROWSER_BATCH_COUNT,
  BATCH_QA_MODES,
  BATCH_QA_EXPORT_MODES,
  DEFAULT_DEBUG_EXPORT_LIMIT,
};
