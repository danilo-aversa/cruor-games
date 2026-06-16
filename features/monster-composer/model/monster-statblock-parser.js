import { getBestiaryWordingIssues } from "./monster-bestiary-wording.js";

export const MONSTER_STAT_BLOCK_PARSER_VERSION = "rendered-statblock-parser-v1.32";

const DND_CONDITIONS = Object.freeze([
  "Blinded",
  "Charmed",
  "Deafened",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
]);


const CONDITION_CANONICAL = Object.freeze(
  Object.fromEntries(DND_CONDITIONS.map((condition) => [condition.toLowerCase(), condition]))
);

const DND_CONDITION_KEYS = new Set(DND_CONDITIONS.map((condition) => condition.toLowerCase()));

function normalizeConditionKey(value) {
  return String(value || "").trim().toLowerCase();
}

function canonicalConditionName(value) {
  const key = normalizeConditionKey(value);
  return CONDITION_CANONICAL[key] || String(value || "").trim();
}

const DAMAGE_TYPES = Object.freeze([
  "Acid",
  "Bludgeoning",
  "Cold",
  "Fire",
  "Force",
  "Lightning",
  "Necrotic",
  "Piercing",
  "Poison",
  "Psychic",
  "Radiant",
  "Slashing",
  "Thunder",
]);

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function normalizeDashNumber(value) {
  return Number.parseInt(String(value || "").replace("−", "-"), 10);
}

function modText(value) {
  return value >= 0 ? `+${value}` : `−${Math.abs(value)}`;
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripMarkdown(value) {
  return cleanString(value).replace(/\*\*/g, "");
}

function flattenRenderedSections(statBlock = {}) {
  return asArray(statBlock.sections).flatMap((section) =>
    asArray(section.items).map((item) => ({
      sectionId: section.id || "unknown",
      sectionTitle: section.title || section.id || "Unknown",
      id: item.id || item.title,
      title: item.title || item.id || "Untitled",
      text: stripMarkdown(item.text),
    }))
  );
}

function buildFeatureMap(selectedFeatures = []) {
  const byId = new Map();
  const byTitle = new Map();
  asArray(selectedFeatures).forEach((feature) => {
    if (feature?.id) byId.set(feature.id, feature);
    if (feature?.title) byTitle.set(cleanString(feature.title).toLowerCase(), feature);
  });
  return { byId, byTitle };
}

function buildAbilityMap(abilityModel = {}) {
  const byFeatureId = new Map();
  const byTitle = new Map();
  asArray(abilityModel.abilities).forEach((ability) => {
    if (ability?.sourceGraftId) byFeatureId.set(ability.sourceGraftId, ability);
    if (ability?.id) byFeatureId.set(ability.id, ability);
    if (ability?.title) byTitle.set(cleanString(ability.title).toLowerCase(), ability);
  });
  return { byFeatureId, byTitle };
}

function findFeatureForItem(item, featureMap) {
  return featureMap.byId.get(item.id) || featureMap.byTitle.get(cleanString(item.title).toLowerCase()) || null;
}

function findAbilityForItem(item, feature, abilityMap) {
  return abilityMap.byFeatureId.get(feature?.id) || abilityMap.byFeatureId.get(item.id) || abilityMap.byTitle.get(cleanString(item.title).toLowerCase()) || null;
}

function getTextDamagePattern() {
  const typePattern = DAMAGE_TYPES.join("|");
  return new RegExp(
    String.raw`(?:\b\d+\s*\([^)]*\d+d\d+[^)]*\)\s*(?:${typePattern})\s+damage\b|\b\d+d\d+\b|\b\d+\s+(?:${typePattern})\s+damage\b)`,
    "i"
  );
}

function textMentionsDamage(text = "") {
  return /\bdamage\b/i.test(text) || /\bHit:\b/i.test(text) || /\bFailure:\b/i.test(text);
}

function textHasDamageAmount(text = "") {
  return (
    getTextDamagePattern().test(text) ||
    /\bdamage\s+equal\s+to\s+(?:its|the\s+monster[’']s|the\s+creature[’']s)?\s*(?:Proficiency\s+Bonus|PB)\b/i.test(text) ||
    /\b(?:Proficiency\s+Bonus|PB)\s+(?:[A-Z][a-z]+\s+)?damage\b/i.test(text)
  );
}

function textMentionsCondition(text = "") {
  return DND_CONDITIONS.some((condition) => new RegExp(`\\b${escapeRegExp(condition)}\\b`, "i").test(text));
}

function extractConditionNames(text = "") {
  return DND_CONDITIONS.filter((condition) => new RegExp(`\\b${escapeRegExp(condition)}\\b`, "i").test(text));
}

function has2024ConditionPhrase(text = "", condition = "") {
  const canonical = canonicalConditionName(condition);
  const escaped = escapeRegExp(canonical);
  return new RegExp(`\\b(?:the\\s+target|target|the\\s+creature|creature|it|they|one\\s+creature)?\\s*(?:has|have|gains?|gain|is\\s+given|are\\s+given)\\s+the\\s+[^.]*\\b${escaped}\\b[^.]*condition`, "i").test(text);
}

function hasLegacyConditionPhrase(text = "", condition = "") {
  const escaped = escapeRegExp(canonicalConditionName(condition));
  return new RegExp(`\\b(?:is|are|becomes|become|falls|falling|knocked)\\s+(?:also\\s+)?${escaped}\\b`, "i").test(text);
}

function isConditionReferenceOnly(text = "", condition = "") {
  if (has2024ConditionPhrase(text, condition) || hasLegacyConditionPhrase(text, condition)) return false;
  const escaped = escapeRegExp(canonicalConditionName(condition));
  const referencePatterns = [
    `\\bimmune\\s+to\\s+the\\s+${escaped}\\s+condition`,
    `\\bimmunity\\s+to\\s+the\\s+${escaped}\\s+condition`,
    `\\blocates?\\s+[^.]*\\b${escaped}\\b`,
    `\\bsee\\s+[^.]*\\b${escaped}\\b`,
    `\\bagainst\\s+[^.]*\\b${escaped}\\b`,
    `\\bwhile\\s+[^.]*\\b${escaped}\\b`,
    `\\bstarts?\\s+[^.]*\\b${escaped}\\b`,
    `\\bends?\\s+[^.]*\\b${escaped}\\b`,
    `\\bif\\s+[^.]*\\b${escaped}\\b`,
    `\\bwould\\s+[^.]*\\b${escaped}\\b`,
    `\\bcan\\s+[^.]*\\b${escaped}\\b`,
    `\\bends?\\s+one\\s+condition\\b`,
  ];
  return referencePatterns.some((pattern) => new RegExp(pattern, "i").test(text));
}

function isKnownDndCondition(condition = "") {
  return DND_CONDITION_KEYS.has(normalizeConditionKey(condition));
}

function pushIssue(issues, issue) {
  const entry = {
    severity: ["error", "warning", "info"].includes(issue.severity) ? issue.severity : "warning",
    area: "stat-block-parser",
    check: cleanString(issue.check),
    path: cleanString(issue.path),
    message: cleanString(issue.message),
    recommendation: cleanString(issue.recommendation),
    details: issue.details || undefined,
  };
  const key = [entry.severity, entry.area, entry.check, entry.path, entry.message].join("|");
  if (!issues.some((existing) => [existing.severity, existing.area, existing.check, existing.path, existing.message].join("|") === key)) {
    issues.push(entry);
  }
}

function checkGlobalText({ exportText = "", computed = {}, issues }) {
  if (/\{[^}]+\}/.test(exportText)) {
    pushIssue(issues, {
      severity: "error",
      check: "unresolved-token",
      path: "exportText",
      message: "Rendered stat block contains unresolved template tokens.",
      recommendation: "Resolve all rules-text tokens before publishing.",
    });
  }

  if (/\b(?:undefined|null|NaN)\b/.test(exportText)) {
    pushIssue(issues, {
      severity: "error",
      check: "invalid-placeholder",
      path: "exportText",
      message: "Rendered stat block contains undefined/null/NaN placeholder text.",
      recommendation: "Inspect export data and rules-text rendering for missing values.",
    });
  }

  const expectedCr = Number(computed.targetCr ?? 0);
  const crMatch = exportText.match(/\bCR\s+(\d+)/i);
  if (crMatch && Number(crMatch[1]) !== expectedCr) {
    pushIssue(issues, {
      severity: "error",
      check: "cr-text-mismatch",
      path: "exportText.challenge",
      message: `Rendered CR ${crMatch[1]} does not match target CR ${expectedCr}.`,
      recommendation: "Regenerate export text from the final fitted CR profile.",
    });
  }
}

function checkAttackText({ item, ability, computed, issues }) {
  const attack = ability?.resolution?.attack;
  if (!attack) return;
  const text = item.text || "";
  const attackMatches = [...text.matchAll(/(?:Melee|Ranged)\s+Attack\s+Roll:\s*([+−-]\d+)/gi)];
  if (!attackMatches.length) {
    pushIssue(issues, {
      severity: "error",
      check: "missing-attack-roll",
      path: `sections.${item.sectionId}.${item.id}`,
      message: `${item.title} is modeled as an attack roll but the rendered text has no Attack Roll bonus.`,
      recommendation: "Render this ability with the 2024 Attack Roll wording and computed attack bonus.",
    });
    return;
  }

  const expected = Number(computed.attack ?? computed.printedStats?.attackBonus ?? 0);
  attackMatches.forEach((match) => {
    const actual = normalizeDashNumber(match[1]);
    if (Number.isFinite(actual) && actual !== expected) {
      pushIssue(issues, {
        severity: "error",
        check: "attack-bonus-mismatch",
        path: `sections.${item.sectionId}.${item.id}`,
        message: `${item.title} renders attack bonus ${match[1]}, but the fitted monster attack bonus is ${modText(expected)}.`,
        recommendation: "Render attack bonuses from computed.attack / rulesProfile instead of hardcoded text.",
        details: { expected, actual },
      });
    }
  });

  if (attack.attackType === "melee" && !/\breach\s+\d+/i.test(text)) {
    pushIssue(issues, {
      severity: "warning",
      check: "missing-melee-reach",
      path: `sections.${item.sectionId}.${item.id}`,
      message: `${item.title} is a melee attack without explicit reach.`,
      recommendation: "Render melee attacks with reach in feet.",
    });
  }

  if (attack.attackType === "ranged" && !/\brange\s+\d+/i.test(text)) {
    pushIssue(issues, {
      severity: "warning",
      check: "missing-ranged-range",
      path: `sections.${item.sectionId}.${item.id}`,
      message: `${item.title} is a ranged attack without explicit range.`,
      recommendation: "Render ranged attacks with range in feet.",
    });
  }
}

function checkSaveText({ item, ability, computed, issues }) {
  const hasSave = ability?.resolution?.save || ability?.resolution?.secondarySave;
  if (!hasSave) return;
  const text = item.text || "";
  const specialDc = [ability?.resolution?.save?.dcSource, ability?.resolution?.secondarySave?.dcSource, ability?.rules?.resolution?.dc, ability?.rules?.secondaryResolution?.dc]
    .map((value) => cleanString(value).toLowerCase())
    .includes("special");
  const saveMatches = [...text.matchAll(/Saving\s+Throw:\s*DC\s*(\d+)/gi)];
  if (!saveMatches.length) {
    if (specialDc && /Saving\s+Throw\s+with\s+a\s+DC\s+equal\s+to/i.test(text)) {
      return;
    }
    pushIssue(issues, {
      severity: "error",
      check: "missing-save-dc",
      path: `sections.${item.sectionId}.${item.id}`,
      message: `${item.title} is modeled as a saving throw but the rendered text has no Saving Throw DC.`,
      recommendation: "Render saving throws with 'Saving Throw: DC X' wording, or explicit special DC wording when the rules model uses dc: special.",
    });
    return;
  }

  const expected = Number(computed.dc ?? computed.printedStats?.saveDc ?? 0);
  saveMatches.forEach((match) => {
    const actual = Number.parseInt(match[1], 10);
    if (Number.isFinite(actual) && actual !== expected) {
      pushIssue(issues, {
        severity: "error",
        check: "save-dc-mismatch",
        path: `sections.${item.sectionId}.${item.id}`,
        message: `${item.title} renders save DC ${actual}, but the fitted monster save DC is ${expected}.`,
        recommendation: "Render save DCs from computed.dc / rulesProfile instead of hardcoded text.",
        details: { expected, actual },
      });
    }
  });

  if (!/\b(?:Failure|Success):/i.test(text)) {
    pushIssue(issues, {
      severity: "warning",
      check: "save-outcome-wording",
      path: `sections.${item.sectionId}.${item.id}`,
      message: `${item.title} has a saving throw but does not use explicit Failure:/Success: outcome wording.`,
      recommendation: "Use 2024-style Failure and Success clauses for save-based abilities.",
    });
  }
}

function isNonOffensiveDamageReference(text = "", ability = {}) {
  const slot = cleanString(ability?.slot).toLowerCase();
  if (slot === "weakness") return true;
  return /\b(?:extra\s+damage\s+against\s+it|hit\s+against\s+it|attacker\s+chooses|vulnerability\s+to|takes?\s+extra\s+damage)\b/i.test(text);
}

function checkDamageText({ item, ability, issues }) {
  const text = item.text || "";
  const modeledDamage = Boolean(ability?.damage?.hasDamage);
  const mentionsDamage = textMentionsDamage(text);
  const hasAmount = textHasDamageAmount(text);

  if (modeledDamage && !hasAmount) {
    pushIssue(issues, {
      severity: "error",
      check: "missing-damage-amount",
      path: `sections.${item.sectionId}.${item.id}`,
      message: `${item.title} has damage in the ability model but the rendered text has no parseable damage amount.`,
      recommendation: "Render average damage and dice from the ability model / ruleset.",
    });
  }

  if (!modeledDamage && mentionsDamage && hasAmount && !isNonOffensiveDamageReference(text, ability)) {
    pushIssue(issues, {
      severity: "warning",
      check: "damage-text-without-model",
      path: `sections.${item.sectionId}.${item.id}`,
      message: `${item.title} renders damage text but has no damage entry in the ability model.`,
      recommendation: "Add structured damage metadata or remove damage from the rendered text.",
    });
  }
}

function checkConditionText({ item, ability, issues }) {
  const text = item.text || "";
  const modeledConditions = asArray(ability?.conditions)
    .map((condition) => normalizeConditionKey(condition.name))
    .filter((condition) => condition && isKnownDndCondition(condition));
  const modeledSet = new Set(modeledConditions);
  const renderedConditions = extractConditionNames(text).map(normalizeConditionKey);

  modeledConditions.forEach((condition) => {
    if (!has2024ConditionPhrase(text, condition) && !isConditionReferenceOnly(text, condition)) {
      pushIssue(issues, {
        severity: "warning",
        check: "condition-wording-missing",
        path: `sections.${item.sectionId}.${item.id}`,
        message: `${item.title} models the ${canonicalConditionName(condition)} condition but the rendered text does not use explicit 2024 condition wording.`,
        recommendation: `Use wording such as 'the target has the ${canonicalConditionName(condition)} condition'.`,
      });
    }
  });

  renderedConditions.forEach((condition) => {
    if (hasLegacyConditionPhrase(text, condition)) {
      pushIssue(issues, {
        severity: "warning",
        check: "legacy-condition-wording",
        path: `sections.${item.sectionId}.${item.id}`,
        message: `${item.title} appears to use legacy condition wording for ${canonicalConditionName(condition)}.`,
        recommendation: `Use 'has the ${canonicalConditionName(condition)} condition' instead.`,
      });
    }
    if (!modeledSet.has(condition) && cleanString(ability?.slot).toLowerCase() !== "weakness" && !isConditionReferenceOnly(text, condition) && /condition/i.test(text)) {
      pushIssue(issues, {
        severity: "warning",
        check: "condition-text-without-model",
        path: `sections.${item.sectionId}.${item.id}`,
        message: `${item.title} renders the ${canonicalConditionName(condition)} condition but the ability model does not declare it.`,
        recommendation: "Add structured condition metadata or remove the condition from rendered text.",
      });
    }
  });
}

function checkBestiaryWording({ item, issues }) {
  getBestiaryWordingIssues({ title: item.title, text: item.text }).forEach((issue) => {
    pushIssue(issues, {
      severity: "warning",
      check: issue.check,
      path: `sections.${item.sectionId}.${item.id}`,
      message: `${item.title}: ${issue.message}`,
      recommendation: issue.recommendation,
    });
  });
}

function checkUsageText({ item, ability, issues }) {
  const usageType = cleanString(ability?.usage?.type).toLowerCase();
  const text = `${item.title}. ${item.text}`;
  if (usageType === "recharge" && !/\bRecharge\b/i.test(text)) {
    pushIssue(issues, {
      severity: "warning",
      check: "missing-recharge-wording",
      path: `sections.${item.sectionId}.${item.id}`,
      message: `${item.title} is modeled as recharge but the rendered text/title does not say Recharge.`,
      recommendation: "Render recharge abilities with Recharge X–Y in the title or lead sentence.",
    });
  }

  if (ability?.areaEffect?.enabled && !/\b(?:Cone|Cube|Cylinder|Emanation|Line|Sphere|Radius|foot|feet|ft\.)\b/i.test(item.text)) {
    pushIssue(issues, {
      severity: "warning",
      check: "area-effect-missing-size",
      path: `sections.${item.sectionId}.${item.id}`,
      message: `${item.title} is modeled as an area effect but the rendered text has no clear area size/shape.`,
      recommendation: "Render area effects with explicit 2024 area wording.",
    });
  }
}

function summarizeIssues(issues = []) {
  return issues.reduce(
    (summary, issue) => {
      summary.total += 1;
      summary[issue.severity] = (summary[issue.severity] || 0) + 1;
      return summary;
    },
    { total: 0, error: 0, warning: 0, info: 0 }
  );
}

export function parseMonsterRenderedStatBlock({
  exportText = "",
  statBlock = null,
  selectedFeatures = [],
  computed = {},
} = {}) {
  const issues = [];
  const items = flattenRenderedSections(statBlock);
  const featureMap = buildFeatureMap(selectedFeatures);
  const abilityMap = buildAbilityMap(computed.abilityModel);

  checkGlobalText({ exportText, computed, issues });

  if (!items.some((item) => item.sectionId === "actions")) {
    pushIssue(issues, {
      severity: "error",
      check: "missing-actions-section",
      path: "statBlock.sections.actions",
      message: "Renderable stat block has no Actions section.",
      recommendation: "Ensure at least one main action is rendered before publishing.",
    });
  }

  items.forEach((item) => {
    if (/\{[^}]+\}/.test(item.text)) {
      pushIssue(issues, {
        severity: "error",
        check: "unresolved-item-token",
        path: `sections.${item.sectionId}.${item.id}`,
        message: `${item.title} contains unresolved template tokens.`,
        recommendation: "Resolve all rules-text tokens before publishing.",
      });
    }

    checkBestiaryWording({ item, issues });

    const feature = findFeatureForItem(item, featureMap);
    const ability = findAbilityForItem(item, feature, abilityMap);
    if (!ability) {
      if (!["legendary-action-uses", "press-the-horror", "fallback-strike", "unfinished-horror"].includes(item.id)) {
        pushIssue(issues, {
          severity: "info",
          check: "rendered-item-without-ability-model",
          path: `sections.${item.sectionId}.${item.id}`,
          message: `${item.title} is rendered without a matched ability model entry.`,
          recommendation: "This is acceptable for generated fallback/notes, but publish content should usually map rendered items to graft metadata.",
        });
      }
      return;
    }

    checkAttackText({ item, ability, computed, issues });
    checkSaveText({ item, ability, computed, issues });
    checkDamageText({ item, ability, issues });
    checkConditionText({ item, ability, issues });
    checkUsageText({ item, ability, issues });
  });

  return {
    version: MONSTER_STAT_BLOCK_PARSER_VERSION,
    status: issues.some((issue) => issue.severity === "error")
      ? "error"
      : issues.some((issue) => issue.severity === "warning")
        ? "warning"
        : "pass",
    summary: summarizeIssues(issues),
    issues,
    inspected: {
      itemCount: items.length,
      featureCount: asArray(selectedFeatures).length,
      abilityCount: asArray(computed.abilityModel?.abilities).length,
    },
  };
}
