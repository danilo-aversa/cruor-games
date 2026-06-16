export const MONSTER_BESTIARY_WORDING_VERSION = "monster-bestiary-wording-normalizer-v1.32";

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

const DAMAGE_TYPE_PATTERN = DAMAGE_TYPES.join("|");
const RECHARGE_PREFIX_PATTERN = /^\s*Recharge\s+(\d+)\s*[-–]\s*(\d+)\.\s*/i;
const RECHARGE_ANY_PATTERN = /\bRecharge\s+(\d+)\s*[-–]\s*(\d+)\b/g;

function cleanString(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripTrailingPeriod(value) {
  return cleanString(value).replace(/[.]+$/, "");
}

function formatRechargeRange(start, end) {
  return `${start}–${end}`;
}

function normalizeRechargeDash(text = "") {
  return String(text || "").replace(RECHARGE_ANY_PATTERN, (_match, start, end) => `Recharge ${formatRechargeRange(start, end)}`);
}

function normalizeHitAndFailureDamageSubjects(text = "") {
  let output = String(text || "");

  output = output.replace(
    /\b(Hit|Failure):\s*(?:the\s+target|target)\s+takes\s+/gi,
    (_match, label) => `${label}: `,
  );

  output = output.replace(
    new RegExp(`\\b(Hit|Failure):\\s*([^.!?]*?\\b(?:${DAMAGE_TYPE_PATTERN})\\s+damage)\\s+and\\s+(?:the\\s+target\\s+)?has\\s+the\\s+`, "gi"),
    (_match, label, damageClause) => `${label}: ${damageClause}, and the target has the `,
  );

  output = output.replace(
    new RegExp(`\\b(Hit|Failure):\\s*([^.!?]*?\\b(?:${DAMAGE_TYPE_PATTERN})\\s+damage)\\s+and\\s+(?:the\\s+target\\s+)?is\\s+given\\s+the\\s+`, "gi"),
    (_match, label, damageClause) => `${label}: ${damageClause}, and the target has the `,
  );

  output = output.replace(
    new RegExp(`\\b(Hit|Failure):\\s*([^.!?]*?\\b(?:${DAMAGE_TYPE_PATTERN})\\s+damage)\\s+and\\s+the\\s+target\\s+gains\\s+the\\s+`, "gi"),
    (_match, label, damageClause) => `${label}: ${damageClause}, and the target has the `,
  );

  return output;
}



function normalizeCoreGameTerms(text = "") {
  return String(text || "")
    .replace(/\bHit\s+points\b/g, "Hit Points")
    .replace(/\bhit\s+points\b/g, "Hit Points")
    .replace(/\bHit\s+point\b/g, "Hit Point")
    .replace(/\bhit\s+point\b/g, "Hit Point");
}

function normalizeAreaTargetQuantifiers(text = "") {
  return String(text || "")
    .replace(
      /\b((?:Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+Saving Throw:\s+DC\s+[^,.]+,\s*)(creatures|enemies|allies)\b(?=\s+(?:in|within|that|who|whose)\b)/gi,
      (_match, prefix, targetNoun) => {
        const normalized = String(targetNoun || "").toLowerCase();
        const singular = normalized === "enemies" ? "enemy" : normalized === "allies" ? "ally" : "creature";
        return `${prefix}each ${singular}`;
      },
    );
}

function normalizeRadiusAreaWording(text = "") {
  return String(text || "")
    .replace(
      /\b(each|any|one)\s+(creature|enemy|ally)\s+in\s+a\s+(\d+)-foot\s+Radius\s+centered\s+on\s+([^.,]+)/gi,
      (_match, quantifier, target, size, origin) => `${quantifier} ${target} in a ${size}-foot-radius Sphere centered on ${origin}`,
    )
    .replace(
      /\b(each|any|one)\s+(creature|enemy|ally)\s+in\s+a\s+(\d+)-foot\s+Radius\s+at\s+a\s+point\s+([^.,]+)/gi,
      (_match, quantifier, target, size, pointText) => `${quantifier} ${target} in a ${size}-foot-radius Sphere centered on a point ${pointText}`,
    )
    .replace(
      /\b(each|any|one)\s+(creature|enemy|ally)\s+in\s+a\s+(\d+)-foot\s+Radius\b/gi,
      (_match, quantifier, target, size) => `${quantifier} ${target} in a ${size}-foot Radius`,
    )
    .replace(
      /\bchoose\s+a\s+(\d+)-foot\s+Radius\s+at\s+a\s+point\s+([^.,]+)/gi,
      (_match, size, pointText) => `choose a ${size}-foot-radius Sphere centered on a point ${pointText}`,
    )
    .replace(/\ba\s+(\d+)-foot\s+Radius\s+patch\b/gi, (_match, size) => `a ${size}-foot-radius patch`);
}


function normalizeLegacyConditionSubjects(text = "") {
  let output = String(text || "");
  output = output.replace(/\b(Failure|Hit):\s*a\s+target\s+has\s+the\s+/gi, (_match, label) => `${label}: the target has the `);

  for (const condition of DND_CONDITIONS) {
    const conditionPattern = new RegExp(`\\b(Failure|Hit):\\s*it\\s+is\\s+${condition}\\b`, "gi");
    output = output.replace(conditionPattern, (_match, label) => `${label}: the target has the ${condition} condition`);
  }

  return output;
}

function normalizeAreaNotation(text = "") {
  return String(text || "")
    .replace(/\b(\d+)\s*ft\.?(?=\s+(?:Cone|Cube|Cylinder|Emanation|Line|Radius|Sphere)\b)/gi, "$1-foot")
    .replace(/\b(\d+)\s+feet(?=\s+(?:Cone|Cube|Cylinder|Emanation|Line|Radius|Sphere)\b)/gi, "$1-foot")
    .replace(/\bfoot\s+long\b/gi, "foot-long")
    .replace(/\bfoot\s+wide\b/gi, "foot-wide");
}

export function normalizeBestiaryRulesText(text = "") {
  return cleanString(
    normalizeAreaNotation(
      normalizeRadiusAreaWording(
        normalizeAreaTargetQuantifiers(
          normalizeLegacyConditionSubjects(
            normalizeCoreGameTerms(
              normalizeHitAndFailureDamageSubjects(
                normalizeRechargeDash(text),
              ),
            ),
          ),
        ),
      ),
    )
      .replace(/\s+([,.])/g, "$1")
      .replace(/\.\s*\./g, "."),
  );
}

export function extractRechargePrefix(text = "") {
  const normalized = normalizeRechargeDash(text);
  const match = normalized.match(RECHARGE_PREFIX_PATTERN);
  if (!match) return null;
  return {
    label: `Recharge ${formatRechargeRange(match[1], match[2])}`,
    range: formatRechargeRange(match[1], match[2]),
    prefix: match[0],
    text: normalized.slice(match[0].length).trim(),
  };
}

export function normalizeBestiaryFeatureWording({ title = "", text = "" } = {}) {
  const normalizedTitle = normalizeRechargeDash(stripTrailingPeriod(title));
  const normalizedText = normalizeBestiaryRulesText(text);
  const recharge = extractRechargePrefix(normalizedText);
  const titleHasRecharge = /\(\s*Recharge\s+\d+\s*[-–]\s*\d+\s*\)/i.test(normalizedTitle);

  if (!recharge) {
    return {
      title: normalizedTitle,
      text: normalizedText,
    };
  }

  return {
    title: titleHasRecharge ? normalizedTitle : `${normalizedTitle} (${recharge.label})`,
    text: normalizeBestiaryRulesText(recharge.text),
  };
}

export function getBestiaryWordingIssues({ title = "", text = "" } = {}) {
  const issues = [];
  const normalizedTitle = String(title || "");
  const normalizedText = String(text || "");
  const combined = `${normalizedTitle}. ${normalizedText}`;

  if (/\bHit:\s*(?:the\s+target|target)\s+takes\s+\d/iu.test(normalizedText)) {
    issues.push({
      check: "bestiary-hit-damage-wording",
      message: "Hit damage uses 'the target takes' instead of starting with the damage amount.",
      recommendation: "Use 'Hit: 10 (2d6 + 3) Damage Type damage.' wording.",
    });
  }

  if (/\bFailure:\s*(?:the\s+target|target)\s+takes\s+\d/iu.test(normalizedText)) {
    issues.push({
      check: "bestiary-failure-damage-wording",
      message: "Failure damage uses 'the target takes' instead of starting with the damage amount.",
      recommendation: "Use 'Failure: 10 (2d6 + 3) Damage Type damage.' wording.",
    });
  }

  if (/\bRecharge\s+\d+\s*-\s*\d+\b/i.test(combined)) {
    issues.push({
      check: "bestiary-recharge-dash",
      message: "Recharge wording uses a hyphen instead of an en dash.",
      recommendation: "Use '(Recharge 5–6)' with an en dash.",
    });
  }

  if (/^\s*Recharge\s+\d+\s*[-–]\s*\d+\./i.test(normalizedText) || /\.\s*Recharge\s+\d+\s*[-–]\s*\d+\./i.test(combined)) {
    issues.push({
      check: "bestiary-recharge-title",
      message: "Recharge appears as a separate sentence instead of a title parenthetical.",
      recommendation: "Move recharge to the title, as in 'Web (Recharge 5–6).'.",
    });
  }

  if (/\b(?:Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+Saving Throw:\s+DC\s+[^,.]+,\s*(?:creatures|enemies|allies)\b(?=\s+(?:in|within|that|who|whose)\b)/iu.test(normalizedText)) {
    issues.push({
      check: "bestiary-area-target-quantifier",
      message: "Area save target uses a bare plural noun instead of a quantified target.",
      recommendation: "Use 'each creature', 'each enemy', or another explicit quantified target.",
    });
  }

  if (/\b\d+-foot\s+Radius\b/u.test(normalizedText) || /\bRadius\b/u.test(normalizedText)) {
    issues.push({
      check: "bestiary-radius-shape",
      message: "Area wording uses Radius as a standalone shape, which is not the 2024 Bestiary pattern.",
      recommendation: "Use a 2024 area shape such as Emanation, Sphere, Cone, Cube, Line, or Cylinder.",
    });
  }

  if (/\b(?:each|any|one)\s+(?:creature|enemy|ally)\s+in\s+a\s+\d+-foot\s+Emanation\b(?!\s+(?:originating|centered))/iu.test(normalizedText)) {
    issues.push({
      check: "bestiary-emanation-origin",
      message: "Emanation wording is missing an explicit origin.",
      recommendation: "Use 'in a 10-foot Emanation originating from the creature' or another explicit origin.",
    });
  }

  return issues;
}
