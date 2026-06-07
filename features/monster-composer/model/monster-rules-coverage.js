export const MONSTER_RULES_COVERAGE_AUDIT_VERSION = "monster-rules-coverage-v1.12";

export const BESTIARY_ABILITY_SECTIONS = Object.freeze([
  "Traits",
  "Actions",
  "Bonus Actions",
  "Reactions",
  "Legendary Actions",
  "Mythic Actions",
  "Lair Actions",
  "Regional Effects",
]);

const SPELL_LIST_START = /^(?:at will|cantrips|\d+\/day|\d+\/day each|\d+\/rest|level \d+|\d+(?:st|nd|rd|th) level)\s*:/i;
const ABILITY_START = /^[A-Z][A-Za-z0-9'’()\-/,: ]{1,90}\./;

export const RULES_COVERAGE_PATTERN_DEFINITIONS = Object.freeze([
  {
    id: "multiattack",
    label: "Multiattack",
    support: "structured",
    block: "rules.multiattack",
    test: ({ text }) => /^Multiattack\./i.test(text) || /\bmakes? (?:two|three|four|\d+) .*attacks?\b/i.test(text),
  },
  {
    id: "spellcasting",
    label: "Spellcasting",
    support: "structured",
    block: "rules.spellcasting",
    test: ({ text }) =>
      /^Spellcasting\./i.test(text) ||
      /casts one of the following spells/i.test(text) ||
      /\bcasts? [A-Z][A-Za-z’' -]+(?: in response|, requiring|, using|\.|$)/i.test(text),
  },
  {
    id: "attack_roll",
    label: "Attack Roll",
    support: "structured",
    block: "rules.resolution.attackRoll",
    test: ({ text }) => /\bAttack Roll:/i.test(text),
  },
  {
    id: "saving_throw",
    label: "Saving Throw",
    support: "structured",
    block: "rules.resolution.savingThrow",
    test: ({ text }) => /\bSaving Throw:/i.test(text) || /\b(?:Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) save\b/i.test(text),
  },
  {
    id: "attack_plus_save",
    label: "Attack Roll + Saving Throw",
    support: "structured",
    block: "rules.secondaryResolution",
    test: ({ text }) => /\bAttack Roll:/i.test(text) && (/\bSaving Throw:/i.test(text) || /\b(?:Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) save\b/i.test(text)),
  },
  {
    id: "recharge",
    label: "Recharge",
    support: "structured",
    block: "rules.usage",
    test: ({ text }) => /\bRecharge\s+\d\s*[-–—]\s*\d\b/i.test(text),
  },
  {
    id: "damage_parts",
    label: "Damage Parts",
    support: "structured",
    block: "rules.damage.parts",
    test: ({ text }) => /\bdamage\s+plus\b/i.test(text) || /\bplus\s+\d+\s*\([^)]+\)\s+[A-Z][a-z]+\s+damage\b/i.test(text),
  },
  {
    id: "text_events",
    label: "Hit/Miss or Shared Outcome Text",
    support: "structured",
    block: "rules.text",
    test: ({ text }) => /\b(?:Miss|Hit or Miss|Failure or Success):/i.test(text),
  },
  {
    id: "conditions",
    label: "Conditions",
    support: "structured",
    block: "rules.condition",
    test: ({ text }) => /\b(?:Blinded|Charmed|Deafened|Frightened|Grappled|Incapacitated|Invisible|Paralyzed|Petrified|Poisoned|Prone|Restrained|Stunned|Unconscious) condition\b/i.test(text),
  },
  {
    id: "grapple_escape",
    label: "Grapple / Escape DC",
    support: "structured",
    block: "rules.condition.escape",
    test: ({ text }) => /\bescape DC\b/i.test(text) || /\bhas the Grappled condition\b/i.test(text),
  },
  {
    id: "ongoing",
    label: "Ongoing Damage / Repeat Timing",
    support: "structured",
    block: "rules.ongoing",
    test: ({ text }) => /\b(?:at the start|at the end) of (?:each|the) .*?turns?\b/i.test(text) || /\brepeats? the saving throw\b/i.test(text),
  },
  {
    id: "area_timing",
    label: "Aura / Emanation / Area Timing",
    support: "structured",
    block: "rules.areaEffect",
    test: ({ text }) => /\b(?:Aura|Emanation|Cone|Cube|Cylinder|Line|Sphere|Radius)\b/i.test(text) || /\b(?:enters|starts its turn|ends its turn|while in) (?:the )?(?:area|emanation|aura)\b/i.test(text),
  },
  {
    id: "defense_feature",
    label: "Defense Feature",
    support: "structured",
    block: "rules.defense",
    test: ({ text }) => /\b(?:Legendary Resistance|Magic Resistance|Regeneration|Parry|Evasion|Avoidance|Turn Resistance)\b/i.test(text),
  },
  {
    id: "summon_create",
    label: "Summon / Create / Animate",
    support: "structured",
    block: "rules.summon",
    test: ({ text }) => /\b(?:summons?|creates?|animates?|spawns?|raises?|rises as|transforms? into)\b/i.test(text),
  },
  {
    id: "special_procedure",
    label: "Special Procedure",
    support: "structured",
    block: "rules.procedure",
    test: ({ text }) => /\b(?:Swallow|swallowed|Engulf|Possession|possessed|Shapechange|shapechanger|Burrow|regurgitate|Gaze)\b/i.test(text),
  },

  {
    id: "action_reference",
    label: "Referenced Action / Attack",
    support: "structured",
    block: "rules.references",
    test: ({ text }) =>
      !/^Multiattack\./i.test(text) &&
      !/\bAttack Roll:/i.test(text) &&
      /\bmakes? (?:one|two|three|four|\d+) [A-Z][A-Za-z’' -]+ attacks?\b/i.test(text),
  },
  {
    id: "mythic_action",
    label: "Mythic Action Section",
    support: "manual-review",
    block: "schema.section",
    test: ({ section }) => section === "Mythic Actions",
    reason: "The current stat block section enum has legendary actions, lair actions, and death effects, but no dedicated mythicAction section.",
  },
  {
    id: "random_table",
    label: "Random Table / Roll Result",
    support: "manual-review",
    block: "manualOverride",
    test: ({ text }) => /\broll(?:s)? (?:a|one) d\d+\b|\bd\d+ table\b|\bon a \d+\b/i.test(text),
    reason: "Random tables can be represented with manual override today, but do not have a structured roll-table block yet.",
  },
]);

function cleanString(value) {
  return String(value || "").trim();
}

function isAbilityStart(paragraph) {
  const text = cleanString(paragraph);
  if (!text) return false;
  if (SPELL_LIST_START.test(text)) return false;
  return ABILITY_START.test(text);
}

export function splitBestiaryAbilityEntries(sectionText = "") {
  const paragraphs = cleanString(sectionText)
    .split(/\n\s*\n+/)
    .map(cleanString)
    .filter(Boolean);
  const entries = [];
  let current = "";

  paragraphs.forEach((paragraph) => {
    if (isAbilityStart(paragraph)) {
      if (current) entries.push(current);
      current = paragraph;
    } else if (current) {
      current = `${current}\n\n${paragraph}`;
    } else {
      current = paragraph;
    }
  });

  if (current) entries.push(current);
  return entries;
}

export function extractBestiaryAbilityEntries(rows = [], options = {}) {
  const sections = options.sections || BESTIARY_ABILITY_SECTIONS;
  return rows.flatMap((row, rowIndex) =>
    sections.flatMap((section) => {
      const raw = row?.[section];
      return splitBestiaryAbilityEntries(raw).map((text, entryIndex) => ({
        id: `${row?.Name || `row-${rowIndex + 1}`}::${section}::${entryIndex + 1}`,
        monsterName: row?.Name || "Unknown Monster",
        source: row?.Source || "",
        cr: row?.CR || "",
        section,
        text,
      }));
    }),
  );
}

export function classifyBestiaryAbilityText(entry = {}) {
  const text = cleanString(typeof entry === "string" ? entry : entry.text);
  const section = typeof entry === "string" ? "" : entry.section || "";
  const context = { text, section, entry };
  const patterns = RULES_COVERAGE_PATTERN_DEFINITIONS.filter((definition) => definition.test(context)).map(
    (definition) => ({
      id: definition.id,
      label: definition.label,
      support: definition.support,
      block: definition.block,
      reason: definition.reason || "",
    }),
  );
  const manualReviewPatterns = patterns.filter((pattern) => pattern.support === "manual-review");
  const structuredPatterns = patterns.filter((pattern) => pattern.support === "structured");
  const coverage = manualReviewPatterns.length
    ? "manual-review"
    : structuredPatterns.length
      ? "structured"
      : "plain-text";

  return {
    ...entry,
    text,
    section,
    coverage,
    patterns,
    structuredPatternIds: structuredPatterns.map((pattern) => pattern.id),
    manualReviewPatternIds: manualReviewPatterns.map((pattern) => pattern.id),
    needsManualOverride: coverage !== "structured",
  };
}

function countBy(values = []) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function sortCounts(counts = {}) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id, count]) => ({ id, count }));
}

export function summarizeBestiaryRulesCoverage(rowsOrEntries = [], options = {}) {
  const entries = options.entriesProvided ? rowsOrEntries : extractBestiaryAbilityEntries(rowsOrEntries, options);
  const classifications = entries.map(classifyBestiaryAbilityText);
  const patternCounts = {};
  classifications.forEach((item) => {
    item.patterns.forEach((pattern) => {
      patternCounts[pattern.id] = (patternCounts[pattern.id] || 0) + 1;
    });
  });
  const coverageCounts = countBy(classifications.map((item) => item.coverage));
  const sectionCounts = countBy(classifications.map((item) => item.section));
  const manualReviewEntries = classifications.filter((item) => item.coverage === "manual-review");
  const plainTextEntries = classifications.filter((item) => item.coverage === "plain-text");

  return {
    version: MONSTER_RULES_COVERAGE_AUDIT_VERSION,
    totalAbilities: classifications.length,
    coverageCounts,
    coverageRates: {
      structured: classifications.length ? (coverageCounts.structured || 0) / classifications.length : 0,
      manualReview: classifications.length ? (coverageCounts["manual-review"] || 0) / classifications.length : 0,
      plainText: classifications.length ? (coverageCounts["plain-text"] || 0) / classifications.length : 0,
    },
    sectionCounts: sortCounts(sectionCounts),
    patternCounts: sortCounts(patternCounts),
    manualReviewEntries,
    plainTextEntries,
    classifications,
  };
}

function formatPercent(value) {
  return `${Math.round(Number(value || 0) * 1000) / 10}%`;
}

function formatCountLines(items = [], limit = 20) {
  return items
    .slice(0, limit)
    .map((item) => `- ${item.id}: ${item.count}`)
    .join("\n");
}

export function buildBestiaryRulesCoverageMarkdown(summary) {
  const manualSamples = summary.manualReviewEntries
    .slice(0, 10)
    .map((entry) => `- ${entry.monsterName} — ${entry.section}: ${entry.patterns.map((pattern) => pattern.label).join(", ")}`)
    .join("\n");
  const plainSamples = summary.plainTextEntries
    .slice(0, 10)
    .map((entry) => `- ${entry.monsterName} — ${entry.section}: ${entry.text.slice(0, 120).replace(/\s+/g, " ")}`)
    .join("\n");

  return `# Monster Rules Coverage Audit\n\nVersion: ${summary.version}\n\n## Summary\n\n- Total ability blocks: ${summary.totalAbilities}\n- Structured coverage: ${summary.coverageCounts.structured || 0} (${formatPercent(summary.coverageRates.structured)})\n- Manual-review patterns: ${summary.coverageCounts["manual-review"] || 0} (${formatPercent(summary.coverageRates.manualReview)})\n- Plain text / no structural signal: ${summary.coverageCounts["plain-text"] || 0} (${formatPercent(summary.coverageRates.plainText)})\n\n## Pattern Counts\n\n${formatCountLines(summary.patternCounts, 40)}\n\n## Section Counts\n\n${formatCountLines(summary.sectionCounts, 20)}\n\n## Manual Review Samples\n\n${manualSamples || "- None"}\n\n## Plain Text Samples\n\n${plainSamples || "- None"}\n`;
}
