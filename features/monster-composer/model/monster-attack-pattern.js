import {
  isMonsterGraftV2,
  normalizeMonsterGraftV2,
  validateMonsterGraftV2,
} from "./monster-graft-v2.schema.js";
import { buildMonsterAbilityBundleFromGraft } from "./monster-ability-model.js";
import {
  buildMonsterAttackRoutine,
  renderMonsterAttackRoutineText,
} from "./monster-attack-routine.js";

export const MONSTER_ATTACK_PATTERN_AUDIT_VERSION =
  "monster-attack-pattern-audit-v1.1-cr-scaled";

export const MONSTER_ATTACK_PATTERN_CR_CHECKPOINTS = Object.freeze([
  1, 2, 5, 8, 10, 15,
]);

export const MONSTER_ATTACK_PATTERN_BESTIARY_TARGETS = Object.freeze({
  1: Object.freeze({ meanOptions: 1.33, multiattackRate: 0.1371, medianAttacks: 2 }),
  2: Object.freeze({ meanOptions: 1.72, multiattackRate: 0.7008, medianAttacks: 2 }),
  5: Object.freeze({ meanOptions: 1.91, multiattackRate: 0.9388, medianAttacks: 2 }),
  8: Object.freeze({ meanOptions: 1.91, multiattackRate: 0.9388, medianAttacks: 2 }),
  10: Object.freeze({ meanOptions: 1.98, multiattackRate: 0.9787, medianAttacks: 3 }),
  15: Object.freeze({ meanOptions: 2.6, multiattackRate: 0.9615, medianAttacks: 3 }),
});

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function unique(values = []) {
  return [...new Set(values.map(cleanString).filter(Boolean))];
}

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function median(values = []) {
  const sorted = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function createIssue(severity, code, message, path = "attackPattern", details = null) {
  return { severity, code, message, path, ...(details ? { details } : {}) };
}

function getCounterplayChannels(profile = {}) {
  return [
    ["telegraph", asArray(profile.telegraphs)],
    ["positioning", asArray(profile.positioningAnswers)],
    ["breakCondition", asArray(profile.breakConditions)],
    ["nonDamage", asArray(profile.nonDamageAnswers)],
  ]
    .filter(([, values]) => values.length)
    .map(([channel]) => channel);
}

function buildRecognitionTest(normalized) {
  const tags = unique(normalized.identity?.recognitionTags || []);
  return {
    pass: Boolean(
      cleanString(normalized.identity?.fantasy) &&
        cleanString(normalized.identity?.tacticalRole) &&
        cleanString(normalized.identity?.signature) &&
        tags.length >= 3,
    ),
    tags,
  };
}

function buildCrSnapshot(graft, targetCr, targetDpr = 30) {
  const bundle = buildMonsterAbilityBundleFromGraft(graft, { targetCr });
  const authoredAbilities = bundle.abilities.filter((ability) => !ability.synthetic);
  const syntheticMultiattack = bundle.abilities.find((ability) => ability.synthetic) || null;
  const runtimeRoutine = buildMonsterAttackRoutine({
    abilities: bundle.abilities,
    targetCr,
    targetDpr,
    monsterTier: { id: "normal" },
    computed: { categoryNoun: "monster", targetCr },
  });
  const renderedMultiattack =
    Number(runtimeRoutine.count || 0) > 1
      ? renderMonsterAttackRoutineText(runtimeRoutine, { categoryNoun: "monster" })
      : "";
  return {
    targetCr,
    bandId: bundle.projection?.bandId || null,
    abilityIds: authoredAbilities.map((ability) => ability.localAbilityId),
    abilityTitles: authoredAbilities.map((ability) => ability.title),
    authoredAbilityCount: authoredAbilities.length,
    compiledAbilityCount: bundle.abilities.length,
    multiattackEnabled: Boolean(syntheticMultiattack),
    multiattackCount: syntheticMultiattack
      ? Number(bundle.routine?.multiattack?.count || runtimeRoutine.count || 0)
      : 0,
    routineEnabled: Boolean(runtimeRoutine.enabled),
    routineSource: runtimeRoutine.source,
    allocationKeys: Object.keys(runtimeRoutine.allocations || {}),
    renderedMultiattack,
    validationStatus: bundle.validation.status,
    validationErrors: bundle.validation.errors,
  };
}

function buildProgressionTest(normalized, snapshots) {
  const abilityCounts = snapshots.map((snapshot) => snapshot.authoredAbilityCount);
  const cadenceCounts = snapshots.map((snapshot) => snapshot.multiattackCount);
  const monotonicAbilities = abilityCounts.every(
    (count, index) => index === 0 || count >= abilityCounts[index - 1],
  );
  const monotonicCadence = cadenceCounts.every(
    (count, index) => index === 0 || count >= cadenceCounts[index - 1],
  );
  const low = snapshots[0];
  const apex = snapshots[snapshots.length - 1];
  const authoredCount = normalized.abilities.length;
  return {
    pass: Boolean(
      normalized.progression?.bands?.length >= 4 &&
        monotonicAbilities &&
        monotonicCadence &&
        low.authoredAbilityCount >= 1 &&
        apex.authoredAbilityCount === authoredCount &&
        apex.multiattackCount >= 2,
    ),
    monotonicAbilities,
    monotonicCadence,
    lowCrAbilityCount: low.authoredAbilityCount,
    apexAbilityCount: apex.authoredAbilityCount,
    authoredAbilityCount: authoredCount,
    lowCrMultiattackCount: low.multiattackCount,
    apexMultiattackCount: apex.multiattackCount,
  };
}

export function isMonsterAttackPattern(graft = {}) {
  return Boolean(
    isMonsterGraftV2(graft) &&
      cleanString(graft.kind) === "attackPattern" &&
      cleanString(graft.slot) === "attack",
  );
}

export function buildMonsterAttackPatternReport(graft = {}, options = {}) {
  if (!isMonsterAttackPattern(graft)) {
    return {
      version: MONSTER_ATTACK_PATTERN_AUDIT_VERSION,
      applicable: false,
      id: graft.id || null,
      status: "not-applicable",
      pass: true,
      issues: [],
    };
  }

  const checkpoints = options.checkpoints || MONSTER_ATTACK_PATTERN_CR_CHECKPOINTS;
  const schemaReport = validateMonsterGraftV2(graft);
  const normalized = schemaReport.normalized || normalizeMonsterGraftV2(graft);
  const snapshots = checkpoints.map((targetCr) =>
    buildCrSnapshot(graft, targetCr, Number(options.targetDpr || 30)),
  );
  const recognition = buildRecognitionTest(normalized);
  const progression = buildProgressionTest(normalized, snapshots);
  const counterplayChannels = getCounterplayChannels(normalized.counterplayProfile);
  const counterplay = {
    pass: counterplayChannels.length >= 2,
    channels: counterplayChannels,
  };
  const runtime = {
    pass: snapshots.every(
      (snapshot) =>
        snapshot.validationStatus !== "error" &&
        snapshot.validationErrors.length === 0 &&
        snapshot.authoredAbilityCount >= 1 &&
        (snapshot.multiattackCount <= 1 || Boolean(snapshot.renderedMultiattack)),
    ),
  };

  const issues = [...schemaReport.issues];
  [
    [recognition, "attack-pattern-recognition", "Pattern identity is not independently recognizable.", "identity"],
    [progression, "attack-pattern-progression", "CR progression is missing, regresses, or does not reach the full apex repertoire.", "progression"],
    [counterplay, "attack-pattern-counterplay", "Pattern lacks at least two independent counterplay channels.", "counterplayProfile"],
    [runtime, "attack-pattern-runtime", "One or more CR projections fail bundle or routine compilation.", "progression.bands"],
  ].forEach(([test, code, message, path]) => {
    if (!test.pass) issues.push(createIssue("error", code, message, path, test));
  });

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    version: MONSTER_ATTACK_PATTERN_AUDIT_VERSION,
    applicable: true,
    id: normalized.id,
    title: normalized.title,
    source: normalized.sourceAnchors[0] || null,
    status: errors.length ? "error" : warnings.length ? "warning" : "pass",
    pass: errors.length === 0,
    identity: normalized.identity,
    recognition,
    progression,
    progressionContract: normalized.progression,
    counterplay,
    snapshots,
    migration: normalized.migration,
    issues,
    errors,
    warnings,
  };
}

function buildCheckpointSummary(reports, targetCr) {
  const snapshots = reports
    .map((report) => report.snapshots.find((snapshot) => snapshot.targetCr === targetCr))
    .filter(Boolean);
  const target = MONSTER_ATTACK_PATTERN_BESTIARY_TARGETS[targetCr] || null;
  const meanOptions = snapshots.length
    ? snapshots.reduce((sum, snapshot) => sum + snapshot.authoredAbilityCount, 0) / snapshots.length
    : 0;
  const multiattackSnapshots = snapshots.filter((snapshot) => snapshot.multiattackEnabled);
  const multiattackRate = snapshots.length ? multiattackSnapshots.length / snapshots.length : 0;
  const medianAttacks = median(multiattackSnapshots.map((snapshot) => snapshot.multiattackCount));
  const threePlusOptionsRate = snapshots.length
    ? snapshots.filter((snapshot) => snapshot.authoredAbilityCount >= 3).length / snapshots.length
    : 0;
  const deltas = target
    ? {
        meanOptions: round(meanOptions - target.meanOptions),
        multiattackRate: round(multiattackRate - target.multiattackRate),
        medianAttacks: round(medianAttacks - target.medianAttacks),
      }
    : null;
  const calibrationPass = !target || (
    Math.abs(deltas.meanOptions) <= 0.3 &&
    Math.abs(deltas.multiattackRate) <= 0.1 &&
    Math.abs(deltas.medianAttacks) <= 1
  );
  return {
    targetCr,
    patterns: snapshots.length,
    meanOptions: round(meanOptions),
    multiattackRate: round(multiattackRate),
    medianAttacks: round(medianAttacks),
    threePlusOptionsRate: round(threePlusOptionsRate),
    bestiaryTarget: target,
    deltas,
    calibrationPass,
  };
}

export function buildMonsterAttackPatternCatalogAudit(grafts = [], options = {}) {
  const checkpoints = options.checkpoints || MONSTER_ATTACK_PATTERN_CR_CHECKPOINTS;
  const reports = asArray(grafts)
    .filter(isMonsterAttackPattern)
    .map((graft) => buildMonsterAttackPatternReport(graft, { ...options, checkpoints }));
  const checkpointSummary = checkpoints.map((targetCr) =>
    buildCheckpointSummary(reports, targetCr),
  );
  const issues = reports.flatMap((report) =>
    report.issues.map((issue) => ({ patternId: report.id, ...issue })),
  );
  checkpointSummary
    .filter((summary) => !summary.calibrationPass)
    .forEach((summary) => {
      issues.push(createIssue(
        "error",
        "attack-pattern-bestiary-calibration",
        `CR ${summary.targetCr} projection falls outside Bestiary calibration tolerance.`,
        "checkpointSummary",
        summary,
      ));
    });
  const bySource = reports.reduce((acc, report) => {
    const source = report.source || "unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  const errors = issues.filter((issue) => issue.severity === "error");
  return {
    version: MONSTER_ATTACK_PATTERN_AUDIT_VERSION,
    total: reports.length,
    passing: reports.filter((report) => report.pass).length,
    warning: reports.filter((report) => report.status === "warning").length,
    error: reports.filter((report) => report.status === "error").length,
    bySource,
    checkpoints,
    checkpointSummary,
    reports,
    issues,
    errors,
    pass: reports.length > 0 && errors.length === 0,
  };
}
