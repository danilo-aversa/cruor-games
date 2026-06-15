import assert from "node:assert/strict";
import { STATIC_CONTENT_REGISTRY_DATA } from "../shared/content/static-registry.js";
import { MONSTER_GRAFTS } from "../features/monster-composer/data/monster-grafts.js";

const CONDITION_NAMES = [
  "blinded",
  "charmed",
  "deafened",
  "frightened",
  "grappled",
  "incapacitated",
  "invisible",
  "paralyzed",
  "petrified",
  "poisoned",
  "prone",
  "restrained",
  "stunned",
  "unconscious",
  "exhausted",
];

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function stringifyValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(stringifyValue).filter(Boolean).join("\n");
  if (typeof value === "object") return Object.values(value).map(stringifyValue).filter(Boolean).join("\n");
  return "";
}

function collectText(entry = {}) {
  return [
    entry.title,
    entry.label,
    entry.summary,
    entry.tableText,
    entry.mechanics,
    entry.narrative,
    entry.counterplay,
    entry.description,
    entry.readAloud,
    entry.effect,
    entry.rules,
    entry.monster?.rules,
    entry.location,
    entry.locationRegion,
    entry.map,
  ].map(stringifyValue).filter(Boolean).join("\n");
}

function pushIssue(issues, { severity = "warning", id = "", title = "", path = "text", message, match = "" }) {
  issues.push({ severity, id, title, path, message, match });
}

function lintText(entry, { id, title, path }) {
  const text = collectText(entry);
  const issues = [];
  if (!text.trim()) return issues;

  const blockingPatterns = [
    { regex: /\bundefined\b/i, message: "Text contains literal undefined." },
    { regex: /\bnull\b/i, message: "Text contains literal null." },
    { regex: /\bNaN\b/i, message: "Text contains literal NaN." },
    { regex: /\[object Object\]/i, message: "Text contains [object Object]." },
  ];

  blockingPatterns.forEach(({ regex, message }) => {
    const match = text.match(regex);
    if (match) pushIssue(issues, { severity: "error", id, title, path, message, match: match[0] });
  });

  const templateTokenMatch = text.match(/\{\{[^}]+\}\}|\{[a-zA-Z0-9_.-]+\}/);
  if (templateTokenMatch) {
    pushIssue(issues, {
      severity: "warning",
      id,
      title,
      path,
      message: "Text contains a template token. Confirm this is resolved before final public export.",
      match: templateTokenMatch[0],
    });
  }

  CONDITION_NAMES.forEach((condition) => {
    const oldConditionPattern = new RegExp(`\\b(?:is|are|becomes|become)\\s+${condition}\\b`, "i");
    const match = text.match(oldConditionPattern);
    if (match) {
      pushIssue(issues, {
        severity: "warning",
        id,
        title,
        path,
        message: `Use 2024 condition wording: "has the ${condition[0].toUpperCase()}${condition.slice(1)} condition."`,
        match: match[0],
      });
    }
  });

  const attackMatch = text.match(/\b(?:Melee|Ranged) Attack Roll:/i);
  if (attackMatch && !/\bHit:/i.test(text)) {
    pushIssue(issues, {
      severity: "warning",
      id,
      title,
      path,
      message: "Attack wording uses Attack Roll but has no Hit: clause.",
      match: attackMatch[0],
    });
  }

  const dcMatch = text.match(/\bDC\s+\d{2}\b/i);
  if (dcMatch && !/\b(?:Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+Saving Throw:/i.test(text)) {
    pushIssue(issues, {
      severity: "warning",
      id,
      title,
      path,
      message: "DC appears without 2024-style ability Saving Throw wording.",
      match: dcMatch[0],
    });
  }

  const damageMatch = text.match(/\b\d+\s*\([^)]*\)\s+damage\b/i);
  if (damageMatch && !/\b(Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder)\s+damage\b/i.test(text)) {
    pushIssue(issues, {
      severity: "warning",
      id,
      title,
      path,
      message: "Damage expression appears without an explicit damage type.",
      match: damageMatch[0],
    });
  }

  return issues;
}

const entries = [
  ...asArray(STATIC_CONTENT_REGISTRY_DATA.inspirations).map((entry) => ({ entry, type: "inspiration" })),
  ...asArray(STATIC_CONTENT_REGISTRY_DATA.components).map((entry) => ({ entry, type: "component" })),
  ...asArray(MONSTER_GRAFTS).map((entry) => ({ entry, type: "native-monster-graft" })),
];

const issues = entries.flatMap(({ entry, type }, index) => lintText(entry, {
  id: entry.id || entry.slug || `${type}-${index}`,
  title: entry.title || entry.label || entry.id || `${type}-${index}`,
  path: type,
}));

const summary = issues.reduce((acc, issue) => {
  const severity = issue.severity || "warning";
  acc.total += 1;
  acc[severity] = (acc[severity] || 0) + 1;
  return acc;
}, { total: 0, error: 0, warning: 0, info: 0 });

const errors = issues.filter((issue) => issue.severity === "error");
const warnings = issues.filter((issue) => issue.severity === "warning");

if (errors.length) {
  console.error("Content wording blocking issues:");
  errors.slice(0, 25).forEach((issue) => {
    console.error(`- ${issue.id}: ${issue.message} [${issue.match}]`);
  });
}

if (warnings.length) {
  console.log("Content wording warnings:");
  warnings.slice(0, 10).forEach((issue) => {
    console.log(`- ${issue.id}: ${issue.message} [${issue.match}]`);
  });
  if (warnings.length > 10) console.log(`- … ${warnings.length - 10} more warnings`);
}

assert.equal(errors.length, 0, `${errors.length} blocking wording errors found.`);
console.log(`Content wording linter OK — ${entries.length} entries scanned, ${summary.warning} warnings.`);
