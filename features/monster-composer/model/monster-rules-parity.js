import {
  MONSTER_EFFECT_SIMULATION_POLICIES,
  MONSTER_RULES_PARITY_STATUSES,
  getDamageParts,
  getDamageRoundWeight,
  normalizeMonsterGraftRules,
} from "./monster-graft-rules.schema.js";

export const MONSTER_RULES_PARITY_VERSION = "monster-rules-parity-v1.0";
export { MONSTER_EFFECT_SIMULATION_POLICIES, MONSTER_RULES_PARITY_STATUSES };

function cleanString(value) {
  return String(value || "").trim();
}

const COMPARABLE_STOP_WORDS = new Set([
  "a",
  "ability",
  "an",
  "dc",
  "made",
  "makes",
  "the",
  "if",
  "is",
  "it",
  "its",
  "itself",
  "one",
  "or",
  "that",
  "until",
]);

function normalizeComparableTokens(value) {
  return cleanString(value)
    .toLowerCase()
    .replace(/\bsaving throws?\b/g, "save")
    .replace(/\bsaves\b/g, "save")
    .replace(/\bmoves\b/g, "move")
    .replace(/\bfeeds\b/g, "feed")
    .replace(/\bgrapples (?:the monster|it)\b/g, "grapples")
    .replace(/\bthe monster\b/g, "creature")
    .replace(/\bmonster\b/g, "creature")
    .replace(/\{[^}]+\}/g, " ")
    .replace(/\b\d+\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token && !COMPARABLE_STOP_WORDS.has(token));
}

function normalizeComparableText(value) {
  return normalizeComparableTokens(value).join(" ");
}

function containsComparableText(haystack, needle) {
  const haystackTokens = normalizeComparableTokens(haystack);
  const needleTokens = normalizeComparableTokens(needle);
  if (!needleTokens.length) return true;
  let cursor = 0;
  for (const token of haystackTokens) {
    if (token === needleTokens[cursor]) cursor += 1;
    if (cursor >= needleTokens.length) return true;
  }
  return false;
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function pushIssue(issues, severity, code, message, path = "rules.parity", detail = null) {
  issues.push({ severity, code, message, path, detail });
}

function getAuthoredOutcomeText(rules = {}) {
  return Object.values(rules.text || {})
    .filter((value) => typeof value === "string")
    .join(" ");
}

function getDamageClauses(rules = {}) {
  const parts = getDamageParts(rules.damage);
  if (parts.length) return parts;
  return rules.damage && rules.damage.mode !== "none" ? [rules.damage] : [];
}

function getEffectSimulationPolicy(effect = {}) {
  return cleanString(effect.simulation?.policy || effect.simulationPolicy || "unmodeled");
}

function validateEffectClause(effect, index, rules, renderedText, issues) {
  const id = cleanString(effect.id) || `effect-${index + 1}`;
  const path = `rules.effects.${index}`;
  const text = cleanString(effect.text || effect.renderText);
  const policy = getEffectSimulationPolicy(effect);

  if (!cleanString(effect.id)) {
    pushIssue(issues, "error", "effect-missing-id", "Structured effect clauses require a stable id.", `${path}.id`);
  }
  if (!cleanString(effect.type)) {
    pushIssue(issues, "error", "effect-missing-type", `Effect ${id} has no type.`, `${path}.type`);
  }
  if (!text) {
    pushIssue(issues, "error", "effect-missing-text", `Effect ${id} has no authored render text.`, `${path}.text`);
  }
  if (!MONSTER_EFFECT_SIMULATION_POLICIES.includes(policy)) {
    pushIssue(issues, "error", "effect-invalid-simulation-policy", `Effect ${id} uses unknown simulation policy ${policy || "none"}.`, `${path}.simulation.policy`);
  }
  if (policy === "unmodeled") {
    pushIssue(issues, "error", "effect-unmodeled", `Effect ${id} is declared verified but remains unmodeled.`, `${path}.simulation.policy`);
  }
  if (policy === "proxy" && !cleanString(effect.simulation?.model)) {
    pushIssue(issues, "error", "effect-proxy-missing-model", `Effect ${id} uses proxy simulation without naming the proxy model.`, `${path}.simulation.model`);
  }

  const authoredText = getAuthoredOutcomeText(rules);
  if (text && !containsComparableText(authoredText, text)) {
    pushIssue(issues, "error", "effect-not-authored-in-output", `Effect ${id} is structured but its text is absent from rules.text.`, `${path}.text`);
  }
  if (renderedText != null && text && !containsComparableText(renderedText, text)) {
    pushIssue(issues, "error", "effect-not-rendered", `Effect ${id} is absent from the rendered rule text.`, `${path}.text`);
  }
}

function validateDamageClause(damage, index, rules, renderedText, issues) {
  const id = cleanString(damage.id) || (index === 0 ? "damage" : `damage-${index + 1}`);
  const hasParts = getDamageParts(rules.damage).length > 0;
  const path = hasParts ? `rules.damage.parts.${index}` : "rules.damage";
  const activation = damage.activation || null;
  const authoredText = getAuthoredOutcomeText(rules);
  const token = `{damage-part:${id}}`;

  if (hasParts && !authoredText.includes(token)) {
    pushIssue(issues, "error", "damage-part-token-missing", `Damage part ${id} is not referenced by ${token} in rules.text.`, "rules.text");
  }
  if (hasParts && cleanString(renderedText).includes(token)) {
    pushIssue(issues, "error", "damage-part-token-unresolved", `Damage part ${id} remains unresolved in the rendered rule text.`, "renderedText");
  }

  if (!activation || activation.type === "always") return;

  const expectedRate = Number(activation.expectedRate);
  if (!cleanString(activation.trigger)) {
    pushIssue(issues, "error", "conditional-damage-missing-trigger", `Conditional damage ${id} has no trigger.`, `${path}.activation.trigger`);
  }
  if (!Number.isFinite(expectedRate) || expectedRate <= 0 || expectedRate > 1) {
    pushIssue(issues, "error", "conditional-damage-invalid-rate", `Conditional damage ${id} requires expectedRate greater than 0 and at most 1.`, `${path}.activation.expectedRate`);
  }

  const weights = getDamageRoundWeight(damage, rules);
  if (!weights.some((value) => Number(value || 0) > 0)) {
    pushIssue(issues, "error", "conditional-damage-not-simulated", `Conditional damage ${id} contributes no expected damage to the three-round profile.`, `${path}.roundWeight`);
  }

  if (cleanString(activation.trigger) && !containsComparableText(authoredText, activation.trigger)) {
    pushIssue(issues, "error", "conditional-damage-trigger-not-authored", `Conditional damage ${id} trigger is absent from rules.text.`, `${path}.activation.trigger`);
  }
  if (renderedText != null && cleanString(activation.trigger) && !containsComparableText(renderedText, activation.trigger)) {
    pushIssue(issues, "error", "conditional-damage-trigger-not-rendered", `Conditional damage ${id} trigger is absent from rendered rule text.`, `${path}.activation.trigger`);
  }
}

export function buildMonsterRulesParityReport(feature = {}, { renderedText = null } = {}) {
  const rules = normalizeMonsterGraftRules(feature);
  const parity = rules.parity || {};
  const status = cleanString(parity.status || "unreviewed");
  const applicable = status === "verified";
  const issues = [];
  const effects = asArray(rules.effects);
  const damageClauses = getDamageClauses(rules);

  if (!MONSTER_RULES_PARITY_STATUSES.includes(status)) {
    pushIssue(issues, "error", "parity-invalid-status", `Unknown parity status: ${status || "none"}.`, "rules.parity.status");
  }

  if (applicable) {
    if (!cleanString(parity.reviewedBy)) {
      pushIssue(issues, "error", "parity-missing-reviewer", "Verified parity requires reviewedBy.", "rules.parity.reviewedBy");
    }
    if (!cleanString(parity.reviewedAt)) {
      pushIssue(issues, "error", "parity-missing-review-date", "Verified parity requires reviewedAt.", "rules.parity.reviewedAt");
    }
    if (!cleanString(renderedText)) {
      pushIssue(issues, "error", "parity-empty-render", "Verified rules must produce rendered rule text.", "renderedText");
    }

    effects.forEach((effect, index) =>
      validateEffectClause(effect, index, rules, renderedText, issues),
    );
    damageClauses.forEach((damage, index) =>
      validateDamageClause(damage, index, rules, renderedText, issues),
    );
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return {
    version: MONSTER_RULES_PARITY_VERSION,
    applicable,
    featureId: feature.id || null,
    status,
    pass: applicable ? errors.length === 0 : true,
    renderedText: renderedText == null ? null : cleanString(renderedText),
    effectCount: effects.length,
    damageClauseCount: damageClauses.length,
    conditionalDamageCount: damageClauses.filter(
      (damage) => damage.activation && damage.activation.type !== "always",
    ).length,
    simulation: {
      direct: effects.filter((effect) => getEffectSimulationPolicy(effect) === "direct").length,
      proxy: effects.filter((effect) => getEffectSimulationPolicy(effect) === "proxy").length,
      nonNumeric: effects.filter((effect) => getEffectSimulationPolicy(effect) === "nonNumeric").length,
      unmodeled: effects.filter((effect) => getEffectSimulationPolicy(effect) === "unmodeled").length,
    },
    errors: errors.length,
    warnings: warnings.length,
    issues,
  };
}

export function summarizeMonsterRulesParity(features = [], { render = null } = {}) {
  const reports = asArray(features).map((feature) =>
    buildMonsterRulesParityReport(feature, {
      renderedText: typeof render === "function" ? render(feature) : null,
    }),
  );
  const verified = reports.filter((report) => report.applicable);
  return {
    version: MONSTER_RULES_PARITY_VERSION,
    total: reports.length,
    verified: verified.length,
    passed: verified.filter((report) => report.pass).length,
    failed: verified.filter((report) => !report.pass).length,
    effects: verified.reduce((sum, report) => sum + report.effectCount, 0),
    conditionalDamage: verified.reduce(
      (sum, report) => sum + report.conditionalDamageCount,
      0,
    ),
    reports,
  };
}
