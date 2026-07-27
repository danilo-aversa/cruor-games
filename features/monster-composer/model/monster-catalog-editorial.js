import { FEATURE_COMPATIBILITY_OVERRIDES } from "../data/monster-grafts.js";
import { buildMonsterAbilityBundleFromGraft } from "./monster-ability-model.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";

export const MONSTER_CATALOG_EDITORIAL_AUDIT_VERSION =
  "monster-catalog-editorial-audit-v1.0";

export const MONSTER_MANUAL_2025_STYLE_BENCHMARK = Object.freeze({
  source: "Bestiary.csv",
  monsters: 503,
  authoredEntries: 2608,
  sections: Object.freeze({
    trait: Object.freeze({ medianWords: 16, p75Words: 29, p90Words: 37 }),
    action: Object.freeze({ medianWords: 13, p75Words: 25, p90Words: 41 }),
    bonusAction: Object.freeze({ medianWords: 21, p75Words: 39, p90Words: 51 }),
    reaction: Object.freeze({ medianWords: 29, p75Words: 46.5, p90Words: 62 }),
    lairAction: Object.freeze({ medianWords: 19, p75Words: 31, p90Words: 48 }),
  }),
});

const EXPECTED_SLOT_COUNTS = Object.freeze({
  attack: 15,
  body: 12,
  death: 8,
  horror: 4,
  lair: 7,
  mind: 11,
  movement: 11,
  twist: 12,
  weakness: 13,
});

const EXPECTED_SOURCE_COUNTS = Object.freeze({
  decomposition: 27,
  jikininki: 25,
  "wax-death-masks": 8,
  "wolf-spiders": 33,
});

const LONG_FORM_EXEMPTIONS = Object.freeze({
  "mask-phase:changing-mask":
    "Three mutually exclusive modes plus the fire suppression and removal procedure must remain in one trait.",
  "dangerously-unstable:critical-pressure":
    "The visible countdown, blast, self-destruction, and player disarm procedure form one indivisible encounter event.",
  "choking-air:choking-air":
    "The lair action must state the breathing exception, vertical answer, and ventilation break condition explicitly.",
  "broodmother-web-lair:broodmother-web":
    "The maintained prison must include the save, escape action, object statistics, exclusivity, and lair-action commitment.",
});

const REQUIRED_COMPATIBILITY_TOKENS = Object.freeze({
  "spider-climb": "climber",
  "wall-crawler": "climber",
  "web-dancer": "web_infrastructure",
  "web-architect": "web_infrastructure",
  "sticky-surroundings": "web_infrastructure",
  "broodmother-web-lair": "web_infrastructure",
  "dense-web-region": "web_infrastructure",
});

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function cleanString(value) {
  return String(value || "").trim();
}

function wordCount(value) {
  return (cleanString(value).match(/\b[\w'-]+\b/g) || []).length;
}

function median(values = []) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function percentile(values = [], value = 0.9) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * value) - 1);
  return sorted[index];
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalize(entry)]),
  );
}

function stableString(value) {
  return JSON.stringify(canonicalize(value));
}

function stripRuleMetadata(rules = {}) {
  const {
    migration: _migration,
    parity: _parity,
    multiattackParticipation: _participation,
    ...mechanicalRules
  } = rules || {};
  return mechanicalRules;
}

function buildRenderedAbility(graft, ability, targetCr) {
  const renderedText = renderStructuredRulesText(ability, {
    attack: 7,
    dc: 15,
    dpr: 18,
    targetCr,
    category: "Undead",
    categoryNoun: "undead",
    rulesContext: { categoryNoun: "undead" },
  });
  return {
    graftId: graft.id,
    graftTitle: graft.title,
    source: graft.source,
    slot: graft.slot,
    targetCr,
    abilityId: ability.localAbilityId || ability.id,
    title: ability.title,
    section: ability.section || ability.rules?.section || graft.section,
    wordCount: wordCount(renderedText),
    renderedText,
  };
}

function buildAttackSnapshot(graft, targetCr) {
  const bundle = buildMonsterAbilityBundleFromGraft(graft, { targetCr });
  const abilities = bundle.abilities.filter((ability) => !ability.synthetic);
  const mechanicalAbilitySignatures = abilities
    .map((ability) => stableString(stripRuleMetadata(ability.rules || {})))
    .sort();
  const cadence = {
    enabled: Boolean(bundle.routine?.multiattack?.enabled),
    mode: bundle.routine?.multiattack?.mode || "none",
    count: Number(bundle.routine?.multiattack?.count || 0),
    abilityCount: abilities.length,
  };
  return {
    graftId: graft.id,
    targetCr,
    abilityIds: abilities.map((ability) => ability.localAbilityId || ability.id),
    validationStatus: bundle.validation?.status || "unknown",
    fingerprint: stableString({ mechanicalAbilitySignatures, cadence }),
  };
}

function groupBy(items, getKey) {
  const groups = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  return groups;
}

function countBy(items, getKey) {
  return Object.fromEntries(
    [...groupBy(items, getKey).entries()]
      .map(([key, values]) => [key, values.length])
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

function createIssue(severity, code, message, path = "catalog", details = null) {
  return { severity, code, message, path, ...(details ? { details } : {}) };
}

function buildCrossReview(grafts, issues) {
  const attackGrafts = grafts.filter((graft) => graft.slot === "attack");
  const snapshots = attackGrafts.flatMap((graft) => [5, 15].map((cr) => buildAttackSnapshot(graft, cr)));
  const duplicatePatternGroups = [];
  for (const targetCr of [5, 15]) {
    const atCr = snapshots.filter((snapshot) => snapshot.targetCr === targetCr);
    for (const values of groupBy(atCr, (snapshot) => snapshot.fingerprint).values()) {
      if (values.length < 2) continue;
      duplicatePatternGroups.push({
        targetCr,
        graftIds: values.map((value) => value.graftId).sort(),
      });
    }
  }
  duplicatePatternGroups.forEach((group) =>
    issues.push(
      createIssue(
        "error",
        "cross-catalog-duplicate-attack-pattern",
        `Attack Patterns compile to the same mechanical bundle at CR ${group.targetCr}: ${group.graftIds.join(", ")}.`,
        "attackPatterns",
        group,
      ),
    ),
  );

  const complexityMismatches = grafts.flatMap((graft) => {
    const profile = graft.complexityProfile || {};
    const profileMax = Math.max(
      0,
      ...[
        profile.authoredComplexity,
        profile.decisionLoad,
        profile.sequencing,
        profile.conditionalBranches,
        profile.tracking,
      ].map((value) => Number(value || 0)),
    );
    return Number(graft.complexity || 0) < profileMax
      ? [{ id: graft.id, declared: Number(graft.complexity || 0), profileMax }]
      : [];
  });
  complexityMismatches.forEach((entry) =>
    issues.push(
      createIssue(
        "error",
        "cross-catalog-complexity-underdeclared",
        `${entry.id} declares complexity ${entry.declared} but its authored profile reaches ${entry.profileMax}.`,
        `grafts.${entry.id}.complexity`,
        entry,
      ),
    ),
  );

  const compatibilityChecks = Object.entries(REQUIRED_COMPATIBILITY_TOKENS).map(
    ([id, token]) => {
      const rules = FEATURE_COMPATIBILITY_OVERRIDES[id] || {};
      const grants = asArray(rules.grants);
      const avoidWith = asArray(rules.avoidWith);
      const pass = grants.includes(token) && avoidWith.includes(token);
      if (!pass) {
        issues.push(
          createIssue(
            "error",
            "cross-catalog-tracking-stack-unbounded",
            `${id} must grant and avoid the shared ${token} token so random builds surface a soft conflict.`,
            `compatibility.${id}`,
          ),
        );
      }
      return { id, token, grantsToken: grants.includes(token), avoidsToken: avoidWith.includes(token), pass };
    },
  );

  const allAbilitySignatures = [];
  grafts.forEach((graft) => {
    const bundle = buildMonsterAbilityBundleFromGraft(graft, { targetCr: 5 });
    bundle.abilities
      .filter((ability) => !ability.synthetic)
      .forEach((ability) => {
        allAbilitySignatures.push({
          graftId: graft.id,
          abilityId: ability.localAbilityId || ability.id,
          title: ability.title,
          signature: stableString(stripRuleMetadata(ability.rules || {})),
        });
      });
  });
  const sharedAbilityGroups = [...groupBy(allAbilitySignatures, (entry) => entry.signature).values()]
    .filter((values) => values.length > 1)
    .map((values) => ({
      title: values[0].title,
      occurrences: values.map(({ graftId, abilityId }) => ({ graftId, abilityId })),
    }))
    .sort((left, right) => right.occurrences.length - left.occurrences.length);

  return {
    attackPatternSnapshots: snapshots.map(({ fingerprint: _fingerprint, ...snapshot }) => snapshot),
    duplicatePatternGroups,
    complexityMismatches,
    compatibilityChecks,
    sharedAbilityGroups,
  };
}

function buildStyleReview(grafts, issues) {
  const renderedAbilities = [];
  grafts.forEach((graft) => {
    const bundle = buildMonsterAbilityBundleFromGraft(graft, { targetCr: 5 });
    bundle.abilities
      .filter((ability) => !ability.synthetic)
      .forEach((ability) => renderedAbilities.push(buildRenderedAbility(graft, ability, 5)));
  });
  const counts = renderedAbilities.map((entry) => entry.wordCount);
  const hardOutliers = renderedAbilities.filter((entry) => entry.wordCount > 90);
  const longFormAbilities = renderedAbilities.filter((entry) => entry.wordCount > 75);
  const unreviewedLongForm = longFormAbilities.filter(
    (entry) => !LONG_FORM_EXEMPTIONS[`${entry.graftId}:${entry.abilityId}`],
  );
  hardOutliers.forEach((entry) =>
    issues.push(
      createIssue(
        "error",
        "monster-manual-hard-word-limit",
        `${entry.graftId}:${entry.abilityId} renders at ${entry.wordCount} words; hard limit is 90.`,
        `grafts.${entry.graftId}.abilities.${entry.abilityId}`,
      ),
    ),
  );
  unreviewedLongForm.forEach((entry) =>
    issues.push(
      createIssue(
        "error",
        "monster-manual-unreviewed-long-form",
        `${entry.graftId}:${entry.abilityId} renders at ${entry.wordCount} words and lacks a long-form editorial rationale.`,
        `grafts.${entry.graftId}.abilities.${entry.abilityId}`,
      ),
    ),
  );

  return {
    targetCr: 5,
    hardWordLimit: 90,
    reviewThreshold: 75,
    benchmark: MONSTER_MANUAL_2025_STYLE_BENCHMARK,
    catalog: {
      abilityCount: renderedAbilities.length,
      medianWords: median(counts),
      meanWords: Number((counts.reduce((sum, value) => sum + value, 0) / Math.max(1, counts.length)).toFixed(2)),
      p75Words: percentile(counts, 0.75),
      p90Words: percentile(counts, 0.9),
      maximumWords: Math.max(0, ...counts),
    },
    hardOutliers: hardOutliers.map(({ renderedText: _text, ...entry }) => entry),
    longFormAbilities: longFormAbilities.map(({ renderedText: _text, ...entry }) => ({
      ...entry,
      rationale: LONG_FORM_EXEMPTIONS[`${entry.graftId}:${entry.abilityId}`] || "",
    })),
    unreviewedLongForm: unreviewedLongForm.map(({ renderedText: _text, ...entry }) => entry),
  };
}

function buildPlayabilityReview(grafts, issues) {
  const counterplayFailures = [];
  const routineFailures = [];
  const validationFailures = [];
  grafts.forEach((graft) => {
    const profile = graft.counterplayProfile || {};
    const channels = {
      telegraph: asArray(profile.telegraphs).length,
      positioning: asArray(profile.positioningAnswers).length,
      breakCondition: asArray(profile.breakConditions).length,
      nonDamage: asArray(profile.nonDamageAnswers).length,
    };
    if (Object.values(channels).some((count) => count < 1)) {
      counterplayFailures.push({ id: graft.id, channels });
    }
    const routine = graft.routine || {};
    const procedureRequired = ["attack", "mind", "movement", "twist", "lair"].includes(graft.slot);
    if (
      procedureRequired &&
      !cleanString(routine.defaultPlan) &&
      !asArray(routine.defaultSequence).length &&
      routine.mode !== "none"
    ) {
      routineFailures.push({ id: graft.id, mode: routine.mode || "missing" });
    }
    for (const targetCr of [1, 5, 10, 15]) {
      const bundle = buildMonsterAbilityBundleFromGraft(graft, { targetCr });
      if (bundle.validation?.status === "error") {
        validationFailures.push({ id: graft.id, targetCr, errors: bundle.validation.errors || [] });
      }
    }
  });
  counterplayFailures.forEach((entry) =>
    issues.push(
      createIssue(
        "error",
        "playability-counterplay-channel-missing",
        `${entry.id} lacks at least one required counterplay channel.`,
        `grafts.${entry.id}.counterplayProfile`,
        entry,
      ),
    ),
  );
  routineFailures.forEach((entry) =>
    issues.push(
      createIssue(
        "error",
        "playability-routine-not-executable",
        `${entry.id} lacks an executable default table procedure.`,
        `grafts.${entry.id}.routine`,
        entry,
      ),
    ),
  );
  validationFailures.forEach((entry) =>
    issues.push(
      createIssue(
        "error",
        "playability-runtime-compilation",
        `${entry.id} fails runtime compilation at CR ${entry.targetCr}.`,
        `grafts.${entry.id}.progression`,
        entry,
      ),
    ),
  );

  return {
    sampledCr: [1, 5, 10, 15],
    counterplayFailures,
    routineFailures,
    validationFailures,
    totalCompiledProjections: grafts.length * 4,
  };
}

export function buildMonsterCatalogEditorialAudit(grafts = []) {
  const catalog = asArray(grafts);
  const issues = [];
  if (catalog.length !== 93) {
    issues.push(
      createIssue(
        "error",
        "catalog-count",
        `Expected 93 published grafts, found ${catalog.length}.`,
      ),
    );
  }
  const bySlot = countBy(catalog, (graft) => graft.slot || "unknown");
  const bySource = countBy(catalog, (graft) => graft.source || "unknown");
  if (stableString(bySlot) !== stableString(EXPECTED_SLOT_COUNTS)) {
    issues.push(createIssue("error", "catalog-slot-distribution", "Published slot distribution changed.", "catalog.bySlot", { expected: EXPECTED_SLOT_COUNTS, actual: bySlot }));
  }
  if (stableString(bySource) !== stableString(EXPECTED_SOURCE_COUNTS)) {
    issues.push(createIssue("error", "catalog-source-distribution", "Published source distribution changed.", "catalog.bySource", { expected: EXPECTED_SOURCE_COUNTS, actual: bySource }));
  }

  const crossReview = buildCrossReview(catalog, issues);
  const styleReview = buildStyleReview(catalog, issues);
  const playabilityReview = buildPlayabilityReview(catalog, issues);
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    version: MONSTER_CATALOG_EDITORIAL_AUDIT_VERSION,
    total: catalog.length,
    bySlot,
    bySource,
    crossReview,
    styleReview,
    playabilityReview,
    issues,
    errors,
    warnings,
    pass: errors.length === 0,
  };
}
