export const MONSTER_PUBLISH_GATE_VERSION = "publish-gate-v1.29-scalable-action";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function normalizeSeverity(severity = "warning") {
  return ["error", "warning", "info"].includes(severity) ? severity : "warning";
}

function hasSelectedSlotValue(selected = {}, slotId = "") {
  const value = selected?.[slotId];
  if (Array.isArray(value)) return value.some(Boolean);
  return Boolean(value);
}

function getCrDelta({ targetCr = 0, estimatedCr = 0, computed = null } = {}) {
  const target = Number(computed?.targetCr ?? targetCr ?? 0);
  const estimated = Number(computed?.estimatedCr ?? computed?.crValidation?.estimatedCr ?? estimatedCr ?? target);
  return estimated - target;
}

function isCrWithinTolerance(args = {}, tolerance = 1) {
  return Math.abs(getCrDelta(args)) <= tolerance;
}

const ROUTINE_FRAME_DIAGNOSTICS = new Set([
  "frame-power-stack/capped-budget",
  "frame-power-stack/high-tier-boss",
  "frame-power-stack/capped-hp-multiplier",
  "frame-power-stack/capped-dpr-multiplier",
  "frame-power-stack/low-cr-high-tier",
]);

const ROUTINE_DPR_DIAGNOSTICS = new Set([
  "dpr-simulator/multiple-main-actions-alternative",
]);

const ROUTINE_CR_FIT_DIAGNOSTICS = new Set([
  "lower-bound-authority-enabled",
  "best-pass-selected",
  "closed-loop-applied",
  "pass-1-adjusted",
  "pass-2-adjusted",
  "pass-3-adjusted",
  "pass-4-adjusted",
  "pass-1-control-aware-hardening",
  "pass-2-control-aware-hardening",
  "pass-3-control-aware-hardening",
  "pass-4-control-aware-hardening",
  "pass-1-low-cr-dpr-spike-clamp",
  "pass-2-low-cr-dpr-spike-clamp",
  "pass-3-low-cr-dpr-spike-clamp",
  "pass-4-low-cr-dpr-spike-clamp",
  "pass-1-reduced-dpr",
  "pass-2-reduced-dpr",
  "pass-3-reduced-dpr",
  "pass-4-reduced-dpr",
]);

const ROUTINE_CR_FIT_WHEN_STABLE = new Set([
  "cr-fitting/no-meaningful-adjustment-available",
  "cr-fitting/remaining-cr-above-target",
  "cr-fitting/remaining-cr-below-target",
]);

export function normalizeMonsterDiagnosticSeverity(diagnostic = {}, context = {}) {
  const code = cleanString(diagnostic.code || diagnostic.check);
  const area = cleanString(diagnostic.area);
  const baseSeverity = normalizeSeverity(diagnostic.severity);
  const crStable = isCrWithinTolerance(context, 1);

  if (baseSeverity === "error") return "error";
  if (baseSeverity === "info") return "info";
  if (ROUTINE_DPR_DIAGNOSTICS.has(code)) return "info";
  if (ROUTINE_FRAME_DIAGNOSTICS.has(code) && crStable) return "info";
  if (ROUTINE_FRAME_DIAGNOSTICS.has(code) && code === "frame-power-stack/capped-budget") return "info";
  if (ROUTINE_CR_FIT_DIAGNOSTICS.has(code)) return "info";
  if (ROUTINE_CR_FIT_WHEN_STABLE.has(code) && crStable) return "info";
  if (area === "frame-power-stack" && crStable) return "info";
  if (area === "cr-fitting" && crStable) return "info";
  return baseSeverity;
}

export function shouldSurfaceDiagnosticAsWarning(diagnostic = {}, context = {}) {
  return normalizeMonsterDiagnosticSeverity(diagnostic, context) === "warning";
}

function issueEntry(issue = {}) {
  const severity = normalizeSeverity(issue.severity);
  return {
    severity,
    area: cleanString(issue.area),
    check: cleanString(issue.check),
    message: cleanString(issue.message),
    path: cleanString(issue.path),
    recommendation: cleanString(issue.recommendation),
  };
}

function pushUniqueIssue(list, issue) {
  const entry = issueEntry(issue);
  const key = [entry.severity, entry.area, entry.check, entry.message, entry.path].join("|");
  if (!list.some((existing) => [existing.severity, existing.area, existing.check, existing.message, existing.path].join("|") === key)) {
    list.push(entry);
  }
}

export function buildMonsterPublishGate({
  computed = {},
  selected = {},
  selectedFeatures = [],
  actions = [],
  weaknessFeatures = [],
  issues = [],
  exportReadiness = null,
  statBlockParse = null,
} = {}) {
  const blockers = [];
  const reviews = [];
  const info = [];
  const targetCr = Number(computed.targetCr ?? 0);
  const estimatedCr = Number(computed.estimatedCr ?? computed.crValidation?.estimatedCr ?? targetCr);
  const crDelta = estimatedCr - targetCr;

  asArray(issues).forEach((issue) => {
    const severity = normalizeMonsterDiagnosticSeverity(issue, { computed, targetCr, estimatedCr });
    const normalizedIssue = { ...issue, severity };
    if (severity === "error") pushUniqueIssue(blockers, normalizedIssue);
    else if (severity === "warning") pushUniqueIssue(reviews, normalizedIssue);
    else pushUniqueIssue(info, normalizedIssue);
  });


  asArray(statBlockParse?.issues).forEach((issue) => {
    const severity = normalizeSeverity(issue.severity);
    const normalizedIssue = {
      severity,
      area: issue.area || "stat-block-parser",
      check: issue.check || "rendered-stat-block",
      path: issue.path || "statBlock",
      message: issue.message || "Rendered stat block parser issue.",
      recommendation: issue.recommendation || "Inspect rendered stat block output.",
    };
    if (severity === "error") pushUniqueIssue(blockers, normalizedIssue);
    else if (severity === "warning") pushUniqueIssue(reviews, normalizedIssue);
    else pushUniqueIssue(info, normalizedIssue);
  });

  if (!hasSelectedSlotValue(selected, "body") || !hasSelectedSlotValue(selected, "attack") || !hasSelectedSlotValue(selected, "weakness")) {
    pushUniqueIssue(blockers, {
      severity: "error",
      area: "publish-gate",
      check: "core-anatomy",
      path: "selection",
      message: "Generated monster must include Body, Attack, and Weakness / Tell before publish export.",
      recommendation: "Add compatible required grafts before publishing.",
    });
  }

  if (!asArray(actions).length) {
    pushUniqueIssue(blockers, {
      severity: "error",
      area: "publish-gate",
      check: "main-action",
      path: "statBlock.actions",
      message: "Generated monster must have at least one exported Action.",
      recommendation: "Add or fix an attack/action graft.",
    });
  }

  const counterplayRating = cleanString(computed.counterplayAudit?.rating);
  if (!asArray(weaknessFeatures).length || !["Strong", "Playable"].includes(counterplayRating)) {
    pushUniqueIssue(blockers, {
      severity: "error",
      area: "publish-gate",
      check: "counterplay",
      path: "selection.weakness",
      message: "Generated monster needs explicit player-facing counterplay before publish export.",
      recommendation: "Add a Weakness / Tell with playable counterplay.",
    });
  }

  if (Math.abs(crDelta) >= 2) {
    pushUniqueIssue(blockers, {
      severity: "error",
      area: "publish-gate",
      check: crDelta > 0 ? "estimated-cr-above-tolerance" : "estimated-cr-below-tolerance",
      path: "computed.crValidation.estimatedCr",
      message: `Estimated CR ${estimatedCr} is outside publish tolerance for target CR ${targetCr}.`,
      recommendation: "Run closed-loop fitting again or adjust frame/graft budget before publishing.",
    });
  }

  if (Number(computed.pressure || 0) > Number(computed.budget || 0)) {
    pushUniqueIssue(reviews, {
      severity: "warning",
      area: "publish-gate",
      check: "pressure-over-budget",
      path: "computed.pressure",
      message: "Threat pressure is above the current frame budget.",
      recommendation: "Review counterplay and pressure pacing before table use.",
    });
  }

  if (Number(computed.complexity || 0) > Number(computed.complexityCap || 0)) {
    pushUniqueIssue(reviews, {
      severity: "warning",
      area: "publish-gate",
      check: "complexity-over-cap",
      path: "computed.complexity",
      message: "Table complexity is above the current frame cap.",
      recommendation: "Remove or simplify one reaction, recharge, delayed effect, or triggered feature.",
    });
  }

  asArray(exportReadiness?.blockers)
    .filter((blocker) => !["publish-gate", "rendered-stat-block"].includes(blocker.id))
    .forEach((blocker) => {
      pushUniqueIssue(blockers, {
        severity: "error",
        area: "export-readiness",
        check: blocker.id,
        path: "exportReadiness",
        message: `${blocker.label}: ${blocker.detail}`,
        recommendation: "Fix this export blocker before publishing.",
      });
    });

  return {
    version: MONSTER_PUBLISH_GATE_VERSION,
    status: blockers.length ? "blocked" : reviews.length ? "review" : "ready",
    ready: blockers.length === 0,
    label: blockers.length ? "Blocked" : reviews.length ? "Ready With Review" : "Publish Ready",
    blockers,
    reviews,
    info,
    counts: {
      blockers: blockers.length,
      reviews: reviews.length,
      info: info.length,
    },
  };
}
