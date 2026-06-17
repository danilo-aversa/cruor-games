import { getFeatureBalanceStat, getFeatureBalanceStats } from "./monster-graft-balance-profile.js";
const FIT_LIST_DIMENSIONS = Object.freeze([
  "encounterRoles",
  "tacticalRoles",
  "tiers",
  "tempo",
  "danger",
]);

export const MONSTER_FRAME_FIT_SCHEMA_VERSION = "monster-frame-fit-v1.0";

export const MONSTER_FRAME_FIT_VALUES = Object.freeze({
  encounterRoles: ["minion", "standard", "boss"],
  tacticalRoles: ["brute", "skirmisher", "controller", "lurker", "artillery", "support"],
  tiers: ["normal", "elite", "boss", "legendary", "setpiece"],
  tempo: ["slow", "standard", "fast", "ambusher", "legendary"],
  danger: ["standard", "hard", "horror"],
});

export const MONSTER_FRAME_FIT_ORDERS = Object.freeze({
  tiers: MONSTER_FRAME_FIT_VALUES.tiers,
  danger: MONSTER_FRAME_FIT_VALUES.danger,
  tempo: MONSTER_FRAME_FIT_VALUES.tempo,
});

const DIMENSION_LABELS = Object.freeze({
  encounterRoles: "Encounter Footprint",
  tacticalRoles: "Tactical Role",
  tiers: "Tier",
  cr: "Target CR",
  tempo: "Tempo",
  danger: "Danger",
});

const DIMENSION_VALUE_LABELS = Object.freeze({
  encounterRoles: {
    minion: "Minion",
    standard: "Standard",
    boss: "Boss",
  },
  tacticalRoles: {
    brute: "Brute",
    skirmisher: "Skirmisher",
    controller: "Controller",
    lurker: "Lurker",
    artillery: "Artillery",
    support: "Support",
  },
  tiers: {
    normal: "Normal",
    elite: "Elite",
    boss: "Boss",
    legendary: "Legendary",
    setpiece: "Setpiece",
  },
  tempo: {
    slow: "Slow",
    standard: "Standard",
    fast: "Fast",
    ambusher: "Ambusher",
    legendary: "Legendary",
  },
  danger: {
    standard: "Standard",
    hard: "Hard",
    horror: "Horror Setpiece",
  },
});

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeString(value) {
  return String(value || "").trim();
}

function normalizeList(value) {
  return [...new Set(asArray(value).map((item) => normalizeString(item)).filter(Boolean))];
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function normalizeRange(value = {}) {
  if (!isPlainObject(value)) return {};
  const normalized = {};
  const min = normalizeNumber(value.min);
  const max = normalizeNumber(value.max);
  const recommendedMin = normalizeNumber(value.recommendedMin);
  const recommendedMax = normalizeNumber(value.recommendedMax);
  if (min !== undefined) normalized.min = min;
  if (max !== undefined) normalized.max = max;
  if (recommendedMin !== undefined) normalized.recommendedMin = recommendedMin;
  if (recommendedMax !== undefined) normalized.recommendedMax = recommendedMax;
  return normalized;
}

function normalizeListDimension(value = {}) {
  if (!isPlainObject(value)) return {};
  const normalized = {
    allowed: normalizeList(value.allowed),
    recommended: normalizeList(value.recommended),
    forbidden: normalizeList(value.forbidden),
  };
  const min = normalizeString(value.min);
  const max = normalizeString(value.max);
  if (min) normalized.min = min;
  if (max) normalized.max = max;
  return normalized;
}

function mergeDimension(left = {}, right = {}) {
  const merged = {
    allowed: normalizeList([...(left.allowed || []), ...(right.allowed || [])]),
    recommended: normalizeList([...(left.recommended || []), ...(right.recommended || [])]),
    forbidden: normalizeList([...(left.forbidden || []), ...(right.forbidden || [])]),
  };
  if (left.min || right.min) merged.min = right.min || left.min;
  if (left.max || right.max) merged.max = right.max || left.max;
  return compactDimension(merged);
}

function compactDimension(value = {}) {
  const normalized = normalizeListDimension(value);
  const compact = {};
  if (normalized.allowed.length) compact.allowed = normalized.allowed;
  if (normalized.recommended.length) compact.recommended = normalized.recommended;
  if (normalized.forbidden.length) compact.forbidden = normalized.forbidden;
  if (normalized.min) compact.min = normalized.min;
  if (normalized.max) compact.max = normalized.max;
  return compact;
}

function compactRange(value = {}) {
  const normalized = normalizeRange(value);
  const compact = {};
  if (normalized.min !== undefined) compact.min = normalized.min;
  if (normalized.max !== undefined) compact.max = normalized.max;
  if (normalized.recommendedMin !== undefined) compact.recommendedMin = normalized.recommendedMin;
  if (normalized.recommendedMax !== undefined) compact.recommendedMax = normalized.recommendedMax;
  return compact;
}

function hasFitData(fit = {}) {
  if (!isPlainObject(fit)) return false;
  return Boolean(
    FIT_LIST_DIMENSIONS.some((dimension) => Object.keys(compactDimension(fit[dimension])).length) ||
      Object.keys(compactRange(fit.cr)).length ||
      normalizeString(fit.note),
  );
}

function addRecommended(target, dimension, values) {
  const list = normalizeList(values);
  if (!list.length) return;
  target[dimension] = mergeDimension(target[dimension], { recommended: list });
}

function setRecommendedRange(target, dimension, range) {
  if (!isPlainObject(range)) return;
  target[dimension] = { ...(target[dimension] || {}), ...compactRange(range) };
}

function getRules(feature = {}) {
  return feature.rules || feature.monster?.rules || {};
}

function hasCondition(feature = {}) {
  const rules = getRules(feature);
  return Boolean(rules.condition?.names?.length || rules.condition?.severity);
}

function hasAreaEffect(feature = {}) {
  const rules = getRules(feature);
  return Boolean(rules.areaEffect?.enabled || rules.targeting?.type === "area");
}

function hasSave(feature = {}) {
  const rules = getRules(feature);
  return rules.resolution?.type === "savingThrow" || rules.secondaryResolution?.type === "savingThrow";
}

function hasDefense(feature = {}) {
  const rules = getRules(feature);
  return Boolean(rules.defense?.enabled);
}

function hasSummon(feature = {}) {
  const rules = getRules(feature);
  return Boolean(rules.summon?.enabled);
}

function hasBurstUsage(feature = {}) {
  const rules = getRules(feature);
  return rules.usage?.type === "recharge" || rules.actionEconomy === "deathTrigger";
}

function hasOffTurnAction(feature = {}) {
  const rules = getRules(feature);
  return ["reaction", "legendaryAction", "lairAction"].includes(rules.actionEconomy);
}

function getSection(feature = {}) {
  return feature.section || feature.monster?.section || getRules(feature).section || "trait";
}

function getFeaturePressure(feature = {}) {
  return Math.max(
    0,
    Number(feature.cost || feature.monster?.cost || 0),
    Number(getFeatureBalanceStat(feature, "dpr")),
    Number(getFeatureBalanceStat(feature, "control")) + Number(getFeatureBalanceStat(feature, "mobility")),
  );
}

export function inferMonsterFrameFit(feature = {}) {
  const inferred = {};
  const stats = getFeatureBalanceStats(feature);
  const section = getSection(feature);
  const cost = Number(feature.cost || feature.monster?.cost || 0);
  const complexity = Number(feature.complexity || feature.monster?.complexity || 0);
  const pressure = getFeaturePressure(feature);

  const roleBias = normalizeList(feature.roleBias || feature.monster?.roleBias);
  if (roleBias.length && roleBias.length < MONSTER_FRAME_FIT_VALUES.encounterRoles.length) {
    addRecommended(inferred, "encounterRoles", roleBias);
  }

  if (section === "lairAction" || section === "legendaryAction" || (roleBias.length > 0 && roleBias.every((role) => role === "boss"))) {
    addRecommended(inferred, "encounterRoles", ["boss"]);
    addRecommended(inferred, "tiers", ["boss", "legendary", "setpiece"]);
    setRecommendedRange(inferred, "cr", { recommendedMin: 7 });
  }

  if (feature.slot === "lair" || feature.slot === "twist" || feature.slot === "death") {
    addRecommended(inferred, "tiers", ["elite", "boss", "legendary", "setpiece"]);
  }

  if ((stats.control || 0) >= 2 || hasCondition(feature) || hasAreaEffect(feature) || hasSave(feature)) {
    addRecommended(inferred, "tacticalRoles", ["controller"]);
    addRecommended(inferred, "danger", ["hard", "horror"]);
  }

  if ((stats.mobility || 0) >= 2 || /ambush|pounce|leap|skitter|rush|climb|web line/i.test(`${feature.title || ""} ${feature.summary || ""} ${feature.mechanics || ""}`)) {
    addRecommended(inferred, "tacticalRoles", ["skirmisher", "lurker"]);
    addRecommended(inferred, "tempo", ["fast", "ambusher"]);
  }

  if ((stats.dpr || 0) >= 5 || getRules(feature).resolution?.type === "attackRoll") {
    addRecommended(inferred, "tacticalRoles", ["brute", "artillery"]);
  }

  if (hasDefense(feature) || hasSummon(feature)) {
    addRecommended(inferred, "tacticalRoles", ["support", "controller"]);
    addRecommended(inferred, "tiers", ["elite", "boss", "legendary", "setpiece"]);
  }

  if (hasOffTurnAction(feature)) {
    addRecommended(inferred, "tempo", ["fast", "ambusher", "legendary"]);
    addRecommended(inferred, "tiers", ["boss", "legendary", "setpiece"]);
  }

  if (hasBurstUsage(feature) || pressure >= 6 || complexity >= 4 || cost >= 6) {
    addRecommended(inferred, "encounterRoles", ["standard", "boss"]);
    addRecommended(inferred, "tiers", ["elite", "boss", "legendary", "setpiece"]);
    addRecommended(inferred, "danger", ["hard", "horror"]);
    setRecommendedRange(inferred, "cr", { recommendedMin: cost >= 7 || complexity >= 5 ? 8 : 5 });
  }

  if (cost <= 2 && complexity <= 1 && !hasOffTurnAction(feature) && !hasSummon(feature)) {
    addRecommended(inferred, "encounterRoles", ["minion", "standard"]);
    addRecommended(inferred, "tiers", ["normal", "elite"]);
    addRecommended(inferred, "tempo", ["slow", "standard", "fast"]);
    addRecommended(inferred, "danger", ["standard", "hard"]);
  }

  return normalizeMonsterFrameFit(inferred);
}

export function normalizeMonsterFrameFit(value = {}) {
  if (!isPlainObject(value)) return null;
  const source = value.fit && isPlainObject(value.fit) ? value.fit : value;
  const normalized = {
    schemaVersion: source.schemaVersion || MONSTER_FRAME_FIT_SCHEMA_VERSION,
  };

  const aliasMap = {
    encounterRoles: source.encounterRoles || source.encounterFootprint || source.footprint || source.roles,
    tacticalRoles: source.tacticalRoles || source.tacticalRole,
    tiers: source.tiers || source.tier || source.monsterTiers,
    tempo: source.tempo || source.tempoProfiles || source.tempoProfile,
    danger: source.danger || source.dangers,
  };

  FIT_LIST_DIMENSIONS.forEach((dimension) => {
    const compact = compactDimension(aliasMap[dimension]);
    if (Object.keys(compact).length) normalized[dimension] = compact;
  });

  const cr = compactRange(source.cr || source.targetCr || source.challengeRating);
  if (Object.keys(cr).length) normalized.cr = cr;

  if (normalizeString(source.note)) normalized.note = normalizeString(source.note);

  return hasFitData(normalized) ? normalized : null;
}

export function mergeMonsterFrameFit(explicit = null, inferred = null) {
  const left = normalizeMonsterFrameFit(explicit) || {};
  const right = normalizeMonsterFrameFit(inferred) || {};
  const merged = {
    schemaVersion: MONSTER_FRAME_FIT_SCHEMA_VERSION,
  };

  FIT_LIST_DIMENSIONS.forEach((dimension) => {
    const value = mergeDimension(left[dimension], right[dimension]);
    if (Object.keys(value).length) merged[dimension] = value;
  });

  const cr = compactRange({ ...(left.cr || {}), ...(right.cr || {}) });
  if (Object.keys(cr).length) merged.cr = cr;
  if (left.note || right.note) merged.note = left.note || right.note;

  return hasFitData(merged) ? merged : null;
}

export function getFeatureFrameFit(feature = {}, { includeInferred = false } = {}) {
  const explicit = normalizeMonsterFrameFit(feature.fit || feature.monster?.fit || feature.frameFit || null);
  if (!includeInferred) return explicit;
  return mergeMonsterFrameFit(explicit, inferMonsterFrameFit(feature));
}

export function buildMonsterFrameContext(input = {}) {
  return {
    encounterRoleId: input.encounterRoleId || input.roleId || input.role?.id || "standard",
    tacticalRoleId: input.tacticalRoleId || input.tacticalRole?.id || "brute",
    monsterTierId: input.monsterTierId || input.tierId || input.monsterTier?.id || "normal",
    tempoProfileId: input.tempoProfileId || input.tempoId || input.tempoProfile?.id || "standard",
    dangerId: input.dangerId || input.danger?.id || "hard",
    targetCr: Number(input.targetCr || 1),
  };
}

function getOrderIndex(dimension, value) {
  const order = MONSTER_FRAME_FIT_ORDERS[dimension] || [];
  const index = order.indexOf(value);
  return index >= 0 ? index : null;
}

function formatValue(dimension, value) {
  return DIMENSION_VALUE_LABELS[dimension]?.[value] || String(value || "");
}

function formatValues(dimension, values = []) {
  return normalizeList(values).map((value) => formatValue(dimension, value)).join(", ");
}

function evaluateListDimension({ dimension, fitValue = {}, currentValue, source = "explicit", hard = true }) {
  const issues = [];
  const label = DIMENSION_LABELS[dimension] || dimension;
  const allowed = normalizeList(fitValue.allowed);
  const forbidden = normalizeList(fitValue.forbidden);
  const recommended = normalizeList(fitValue.recommended);

  if (hard && allowed.length && !allowed.includes(currentValue)) {
    issues.push({
      kind: "incompatible",
      source,
      dimension,
      label,
      message: `${label} must be ${formatValues(dimension, allowed)}.`,
    });
  }

  if (hard && forbidden.includes(currentValue)) {
    issues.push({
      kind: "incompatible",
      source,
      dimension,
      label,
      message: `${label} forbids ${formatValue(dimension, currentValue)}.`,
    });
  }

  ["min", "max"].forEach((field) => {
    const bound = fitValue[field];
    if (!hard || !bound) return;
    const currentIndex = getOrderIndex(dimension, currentValue);
    const boundIndex = getOrderIndex(dimension, bound);
    if (currentIndex === null || boundIndex === null) return;
    if (field === "min" && currentIndex < boundIndex) {
      issues.push({
        kind: "incompatible",
        source,
        dimension,
        label,
        message: `${label} must be at least ${formatValue(dimension, bound)}.`,
      });
    }
    if (field === "max" && currentIndex > boundIndex) {
      issues.push({
        kind: "incompatible",
        source,
        dimension,
        label,
        message: `${label} must be at most ${formatValue(dimension, bound)}.`,
      });
    }
  });

  if (recommended.includes(currentValue)) {
    issues.push({
      kind: "recommended",
      source,
      dimension,
      label,
      message: `${label} matches ${formatValue(dimension, currentValue)}.`,
    });
  } else if (recommended.length) {
    issues.push({
      kind: "discouraged",
      source,
      dimension,
      label,
      message: `${label} works best with ${formatValues(dimension, recommended)}.`,
    });
  }

  return issues;
}

function evaluateCrDimension({ fitValue = {}, targetCr = 1, source = "explicit", hard = true }) {
  const issues = [];
  const cr = Number(targetCr || 0);
  if (hard && fitValue.min !== undefined && cr < fitValue.min) {
    issues.push({
      kind: "incompatible",
      source,
      dimension: "cr",
      label: DIMENSION_LABELS.cr,
      message: `Target CR must be at least ${fitValue.min}.`,
    });
  }
  if (hard && fitValue.max !== undefined && cr > fitValue.max) {
    issues.push({
      kind: "incompatible",
      source,
      dimension: "cr",
      label: DIMENSION_LABELS.cr,
      message: `Target CR must be at most ${fitValue.max}.`,
    });
  }
  if (fitValue.recommendedMin !== undefined && cr < fitValue.recommendedMin) {
    issues.push({
      kind: "discouraged",
      source,
      dimension: "cr",
      label: DIMENSION_LABELS.cr,
      message: `Works best at CR ${fitValue.recommendedMin}+.`,
    });
  }
  if (fitValue.recommendedMax !== undefined && cr > fitValue.recommendedMax) {
    issues.push({
      kind: "discouraged",
      source,
      dimension: "cr",
      label: DIMENSION_LABELS.cr,
      message: `Works best at CR ${fitValue.recommendedMax} or lower.`,
    });
  }
  return issues;
}

export function evaluateMonsterFrameFit(feature = {}, frameInput = {}, options = {}) {
  const includeInferred = options.includeInferred !== false;
  const frame = buildMonsterFrameContext(frameInput);
  const explicit = normalizeMonsterFrameFit(feature.fit || feature.monster?.fit || feature.frameFit || null);
  const inferred = includeInferred ? inferMonsterFrameFit(feature) : null;
  const issues = [];

  const contexts = [
    { fit: explicit, source: "explicit", hard: true },
    { fit: inferred, source: "inferred", hard: false },
  ].filter((entry) => entry.fit);

  contexts.forEach(({ fit, source, hard }) => {
    issues.push(
      ...evaluateListDimension({
        dimension: "encounterRoles",
        fitValue: fit.encounterRoles,
        currentValue: frame.encounterRoleId,
        source,
        hard,
      }),
      ...evaluateListDimension({
        dimension: "tacticalRoles",
        fitValue: fit.tacticalRoles,
        currentValue: frame.tacticalRoleId,
        source,
        hard,
      }),
      ...evaluateListDimension({
        dimension: "tiers",
        fitValue: fit.tiers,
        currentValue: frame.monsterTierId,
        source,
        hard,
      }),
      ...evaluateListDimension({
        dimension: "tempo",
        fitValue: fit.tempo,
        currentValue: frame.tempoProfileId,
        source,
        hard,
      }),
      ...evaluateListDimension({
        dimension: "danger",
        fitValue: fit.danger,
        currentValue: frame.dangerId,
        source,
        hard,
      }),
      ...evaluateCrDimension({
        fitValue: fit.cr,
        targetCr: frame.targetCr,
        source,
        hard,
      }),
    );
  });

  const hardIssues = issues.filter((issue) => issue.kind === "incompatible");
  const recommendedIssues = issues.filter((issue) => issue.kind === "recommended");
  const discouragedIssues = issues.filter((issue) => issue.kind === "discouraged");

  const kind = hardIssues.length
    ? "incompatible"
    : discouragedIssues.length
      ? "discouraged"
      : recommendedIssues.length
        ? "recommended"
        : "neutral";

  const score =
    recommendedIssues.length * 3 -
    discouragedIssues.length * 2 -
    hardIssues.length * 100 +
    (explicit ? 1 : 0);

  const label =
    kind === "incompatible"
      ? "Frame Mismatch"
      : kind === "discouraged"
        ? "Frame Warning"
        : kind === "recommended"
          ? "Frame Fit"
          : "Frame Neutral";

  const message = hardIssues[0]?.message || discouragedIssues[0]?.message || recommendedIssues[0]?.message || "No frame-specific fit constraints.";

  return {
    kind,
    label,
    message,
    hardBlock: hardIssues.length > 0,
    score,
    rankModifier: hardIssues.length ? 1000 : discouragedIssues.length * 12 - recommendedIssues.length * 5,
    issues,
    explicit,
    inferred,
    fit: mergeMonsterFrameFit(explicit, inferred),
    frame,
  };
}

export function isMonsterFrameFitAllowed(feature = {}, frameInput = {}, options = {}) {
  return !evaluateMonsterFrameFit(feature, frameInput, options).hardBlock;
}

export function summarizeMonsterFrameFit(fitInput = null) {
  const fit = normalizeMonsterFrameFit(fitInput);
  if (!fit) return [];
  const rows = [];

  FIT_LIST_DIMENSIONS.forEach((dimension) => {
    const value = fit[dimension];
    if (!value) return;
    ["allowed", "recommended", "forbidden"].forEach((field) => {
      const values = normalizeList(value[field]);
      if (values.length) {
        rows.push({
          dimension,
          label: `${DIMENSION_LABELS[dimension]} ${field}`,
          values: values.map((entry) => formatValue(dimension, entry)),
        });
      }
    });
    if (value.min) rows.push({ dimension, label: `${DIMENSION_LABELS[dimension]} min`, values: [formatValue(dimension, value.min)] });
    if (value.max) rows.push({ dimension, label: `${DIMENSION_LABELS[dimension]} max`, values: [formatValue(dimension, value.max)] });
  });

  const cr = compactRange(fit.cr);
  if (cr.min !== undefined) rows.push({ dimension: "cr", label: "CR min", values: [String(cr.min)] });
  if (cr.max !== undefined) rows.push({ dimension: "cr", label: "CR max", values: [String(cr.max)] });
  if (cr.recommendedMin !== undefined) rows.push({ dimension: "cr", label: "Recommended CR min", values: [String(cr.recommendedMin)] });
  if (cr.recommendedMax !== undefined) rows.push({ dimension: "cr", label: "Recommended CR max", values: [String(cr.recommendedMax)] });
  if (fit.note) rows.push({ dimension: "note", label: "Note", values: [fit.note] });

  return rows;
}

export function validateMonsterFrameFit(fitInput = null, { id = "", title = "" } = {}) {
  const issues = [];
  const fit = normalizeMonsterFrameFit(fitInput);
  if (!fit) return { fit: null, issues };

  FIT_LIST_DIMENSIONS.forEach((dimension) => {
    const known = new Set(MONSTER_FRAME_FIT_VALUES[dimension] || []);
    const value = fit[dimension] || {};
    ["allowed", "recommended", "forbidden"].forEach((field) => {
      normalizeList(value[field]).forEach((entry) => {
        if (!known.has(entry)) {
          issues.push({
            severity: "error",
            area: "frame-fit",
            check: "unknown-value",
            id,
            title,
            path: `fit.${dimension}.${field}`,
            message: `Unknown ${DIMENSION_LABELS[dimension]} value: ${entry}`,
            recommendation: "Use a known frame selector value or add it to the Frame Fit vocabulary.",
          });
        }
      });
    });

    const allowed = new Set(normalizeList(value.allowed));
    normalizeList(value.forbidden).forEach((entry) => {
      if (allowed.has(entry)) {
        issues.push({
          severity: "error",
          area: "frame-fit",
          check: "allowed-forbidden-overlap",
          id,
          title,
          path: `fit.${dimension}`,
          message: `${DIMENSION_LABELS[dimension]} cannot both allow and forbid ${formatValue(dimension, entry)}.`,
          recommendation: "Remove the value from either allowed or forbidden.",
        });
      }
    });

    ["min", "max"].forEach((field) => {
      if (!value[field]) return;
      if (!known.has(value[field])) {
        issues.push({
          severity: "error",
          area: "frame-fit",
          check: "unknown-bound",
          id,
          title,
          path: `fit.${dimension}.${field}`,
          message: `Unknown ${DIMENSION_LABELS[dimension]} ${field}: ${value[field]}`,
        });
      }
    });

    if (value.min && value.max) {
      const minIndex = getOrderIndex(dimension, value.min);
      const maxIndex = getOrderIndex(dimension, value.max);
      if (minIndex !== null && maxIndex !== null && minIndex > maxIndex) {
        issues.push({
          severity: "error",
          area: "frame-fit",
          check: "invalid-range",
          id,
          title,
          path: `fit.${dimension}`,
          message: `${DIMENSION_LABELS[dimension]} min is higher than max.`,
        });
      }
    }
  });

  const cr = compactRange(fit.cr);
  if (cr.min !== undefined && cr.max !== undefined && cr.min > cr.max) {
    issues.push({
      severity: "error",
      area: "frame-fit",
      check: "invalid-cr-range",
      id,
      title,
      path: "fit.cr",
      message: "CR min is higher than CR max.",
    });
  }
  if (cr.recommendedMin !== undefined && cr.recommendedMax !== undefined && cr.recommendedMin > cr.recommendedMax) {
    issues.push({
      severity: "warning",
      area: "frame-fit",
      check: "invalid-recommended-cr-range",
      id,
      title,
      path: "fit.cr",
      message: "Recommended CR min is higher than recommended CR max.",
    });
  }

  return { fit, issues };
}

export function formatMonsterFrameFitIssue(issue = {}) {
  return issue.message || "Frame fit issue.";
}
