import {
  MONSTER_LAIR_GRAFT_EDITORIAL_IDS,
  MONSTER_LAIR_GRAFT_EDITORIAL_VERSION,
  MONSTER_LAIR_GRAFT_SCALED_IDS,
} from "../data/monster-lair-grafts.js";
import { buildMonsterAbilityBundleFromGraft } from "./monster-ability-model.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";
import { buildMonsterRulesParityReport } from "./monster-rules-parity.js";
import { validateMonsterGraftV2 } from "./monster-graft-v2.schema.js";

export const MONSTER_LAIR_GRAFT_EDITORIAL_AUDIT_VERSION =
  "monster-lair-graft-editorial-audit-v1.0";
export const MONSTER_LAIR_GRAFT_EDITORIAL_CR_CHECKPOINTS = Object.freeze([
  5, 10, 15, 20,
]);

const EXPECTED_DECISION_BY_ID = Object.freeze({
  "choking-air": "REWRITE_AND_SCALE_LOW_GROUND_HAZARD",
  "corpse-pressure-room": "REWRITE_AND_SCALE_CORPSE_MINEFIELD",
  "funeral-silence-lair": "REWRITE_AND_SCALE_ANCHORED_SILENCE",
  "graveyard-offerings-lair": "REWRITE_AS_RITUAL_LURE",
  "sticky-surroundings": "REWRITE_AS_ONE_SHOT_WEB_TRAPS",
  "broodmother-web-lair": "REWRITE_AND_SCALE_MAINTAINED_PRISON",
  "dense-web-region": "REWRITE_AS_PERSISTENT_VIBRATION_TERRAIN",
});

const EXPECTED_SOURCE_BY_ID = Object.freeze({
  "choking-air": "decomposition",
  "corpse-pressure-room": "decomposition",
  "funeral-silence-lair": "jikininki",
  "graveyard-offerings-lair": "jikininki",
  "sticky-surroundings": "wolf-spiders",
  "broodmother-web-lair": "wolf-spiders",
  "dense-web-region": "wolf-spiders",
});

const PROHIBITED_LEGACY_PATTERNS = Object.freeze([
  /spellcasting ability check/i,
  /immune to this lair action for 24 hours/i,
  /disadvantage on Dexterity Saving Throws and Dexterity \(Acrobatics\) checks/i,
  /attacking surprised targets.*advantage/i,
]);

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function uniqueArray(values = []) {
  return [...new Set(asArray(values).map(cleanString).filter(Boolean))];
}

function createIssue(severity, code, message, path = "lairGraft", details = null) {
  return { severity, code, message, path, ...(details ? { details } : {}) };
}

function getCounterplayChannels(profile = {}) {
  return [
    ["telegraph", asArray(profile.telegraphs)],
    ["positioning", asArray(profile.positioningAnswers)],
    ["breakCondition", asArray(profile.breakConditions)],
    ["nonDamage", asArray(profile.nonDamageAnswers)],
  ]
    .filter(([, entries]) => entries.length > 0)
    .map(([channel]) => channel);
}

function getRuleSignature(ability = {}) {
  const rules = ability.rules || {};
  return JSON.stringify({
    section: rules.section || null,
    actionEconomy: rules.actionEconomy || null,
    usage: rules.usage || null,
    trigger: rules.trigger || null,
    resolution: rules.resolution || null,
    targeting: rules.targeting || null,
    areaEffect: rules.areaEffect || null,
    damage: rules.damage || null,
    condition: rules.condition || null,
    procedure: rules.procedure || null,
    effects: rules.effects || [],
    text: rules.text || null,
  });
}

function buildCrSnapshot(graft, targetCr) {
  const bundle = buildMonsterAbilityBundleFromGraft(graft, { targetCr });
  const authoredAbilities = bundle.abilities.filter((ability) => !ability.synthetic);
  const parityReports = authoredAbilities.map((ability) => {
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
      abilityId: ability.localAbilityId,
      renderedText,
      report: buildMonsterRulesParityReport(ability, { renderedText }),
    };
  });

  return {
    targetCr,
    bandId: bundle.projection?.bandId || null,
    abilityCount: authoredAbilities.length,
    abilityIds: authoredAbilities.map((ability) => ability.localAbilityId),
    ruleSignatures: authoredAbilities.map(getRuleSignature),
    validationStatus: bundle.validation.status,
    validationErrors: bundle.validation.errors,
    parityPass: parityReports.every(({ report }) => report.pass),
    parityIssues: parityReports.flatMap(({ report }) => report.issues || []),
  };
}

function checkIdentity(graft, issues) {
  const identity = graft.identity || {};
  if (
    !cleanString(identity.fantasy) ||
    !cleanString(identity.tacticalRole) ||
    !cleanString(identity.signature) ||
    uniqueArray(identity.recognitionTags).length < 4
  ) {
    issues.push(
      createIssue(
        "error",
        "lair-editorial-identity",
        "Lair Effect identity must define fantasy, tactical role, signature, and at least four recognition tags.",
        "identity",
      ),
    );
  }
}

function checkEditorialDecision(graft, issues) {
  const expectedDecision = EXPECTED_DECISION_BY_ID[graft.id];
  const editorial = graft.editorial || {};
  if (
    editorial.status !== "reviewed" ||
    editorial.phase !== "phase6r-lair-editorial-review" ||
    editorial.version !== MONSTER_LAIR_GRAFT_EDITORIAL_VERSION ||
    editorial.decision !== expectedDecision ||
    !cleanString(editorial.rationale)
  ) {
    issues.push(
      createIssue(
        "error",
        "lair-editorial-decision",
        `Lair Effect ${graft.id} is missing its approved editorial decision or rationale.`,
        "editorial",
        { expectedDecision, actual: editorial },
      ),
    );
  }
}

function checkAbility(graft, issues) {
  const abilities = asArray(graft.abilities);
  if (abilities.length !== 1) {
    issues.push(
      createIssue(
        "error",
        "lair-editorial-ability-count",
        "Each Lair Effect must expose exactly one complete initiative-count ability.",
        "abilities",
        { actualAbilityCount: abilities.length },
      ),
    );
  }

  abilities.forEach((ability, index) => {
    if (
      !cleanString(ability.id) ||
      !cleanString(ability.title) ||
      !cleanString(ability.summary) ||
      !cleanString(ability.mechanics) ||
      !cleanString(ability.counterplay)
    ) {
      issues.push(
        createIssue(
          "error",
          "lair-editorial-ability-copy",
          "Every Lair ability requires ID, title, summary, mechanics, and counterplay copy.",
          `abilities[${index}]`,
        ),
      );
    }

    const rules = ability.rules || {};
    if (rules.parity?.status !== "verified") {
      issues.push(
        createIssue(
          "error",
          "lair-editorial-parity-status",
          "Every Lair ability must carry verified structured-rule parity.",
          `abilities[${index}].rules.parity.status`,
        ),
      );
    }
    if (
      rules.section !== "lairAction" ||
      rules.actionEconomy !== "lairAction" ||
      rules.usage?.type !== "lair"
    ) {
      issues.push(
        createIssue(
          "error",
          "lair-editorial-timing-contract",
          "Every authored Lair ability must compile as a Lair Action.",
          `abilities[${index}].rules`,
        ),
      );
    }
    if (!/initiative count 20/i.test(cleanString(rules.trigger))) {
      issues.push(
        createIssue(
          "error",
          "lair-editorial-trigger",
          "Every Lair Effect must state initiative count 20 timing explicitly.",
          `abilities[${index}].rules.trigger`,
        ),
      );
    }
    if (!rules.areaEffect?.enabled || !Number(rules.areaEffect?.size || 0)) {
      issues.push(
        createIssue(
          "error",
          "lair-editorial-area",
          "Every Lair Effect must define a bounded, measurable environmental area.",
          `abilities[${index}].rules.areaEffect`,
        ),
      );
    }
    if (!rules.procedure?.enabled || !cleanString(rules.procedure?.text)) {
      issues.push(
        createIssue(
          "error",
          "lair-editorial-procedure",
          "Every Lair Effect must define its environmental procedure and cleanup or release logic.",
          `abilities[${index}].rules.procedure`,
        ),
      );
    }
  });
}

function checkProfiles(graft, issues) {
  const counterplayChannels = getCounterplayChannels(graft.counterplayProfile);
  if (counterplayChannels.length !== 4) {
    issues.push(
      createIssue(
        "error",
        "lair-editorial-counterplay",
        "A publishable Lair Effect must expose telegraph, positioning, break-condition, and non-damage counterplay.",
        "counterplayProfile",
        { counterplayChannels },
      ),
    );
  }
  [
    ["balanceProfile", graft.balanceProfile],
    ["complexityProfile", graft.complexityProfile],
    ["spikeRiskProfile", graft.spikeRiskProfile],
  ].forEach(([field, profile]) => {
    if (!profile || typeof profile !== "object") {
      issues.push(
        createIssue("error", "lair-editorial-profile", `Lair Effect is missing ${field}.`, field),
      );
    }
  });
  return counterplayChannels;
}

function checkScaling(graft, snapshots, issues) {
  const declared = asArray(graft.progression?.bands).length > 0;
  const expected = MONSTER_LAIR_GRAFT_SCALED_IDS.includes(graft.id);
  const sampledBandIds = uniqueArray(snapshots.map((snapshot) => snapshot.bandId));
  const sampledRuleVariants = new Set(
    snapshots.flatMap((snapshot) => snapshot.ruleSignatures),
  ).size;
  const pass =
    declared === expected &&
    (!expected || (sampledBandIds.length >= 3 && sampledRuleVariants >= 3));
  if (!pass) {
    issues.push(
      createIssue(
        "error",
        "lair-editorial-scaling",
        "Lair scaling must match the approved family and produce distinct CR projections when declared.",
        "progression",
        { declared, expected, sampledBandIds, sampledRuleVariants },
      ),
    );
  }
  return {
    declared,
    expected,
    bandCount: asArray(graft.progression?.bands).length,
    sampledBandIds,
    sampledRuleVariants,
    pass,
  };
}

function checkLegacyPatterns(graft, issues) {
  const text = [
    graft.summary,
    graft.mechanics,
    graft.counterplay,
    ...asArray(graft.abilities).flatMap((ability) => [
      ability.summary,
      ability.mechanics,
      ability.counterplay,
      ability.rules?.text?.effect,
      ability.rules?.areaEffect?.text,
    ]),
  ]
    .filter(Boolean)
    .join(" ");
  PROHIBITED_LEGACY_PATTERNS.forEach((pattern) => {
    if (pattern.test(text)) {
      issues.push(
        createIssue(
          "error",
          "lair-editorial-legacy-pattern",
          `Lair Effect retains prohibited legacy wording: ${pattern}.`,
          "mechanics",
        ),
      );
    }
  });
}

export function isMonsterLairGraft(graft = {}) {
  return (
    graft.slot === "lair" &&
    graft.editorial?.phase === "phase6r-lair-editorial-review"
  );
}

export function buildMonsterLairGraftEditorialReport(graft = {}, options = {}) {
  if (!isMonsterLairGraft(graft)) {
    return {
      version: MONSTER_LAIR_GRAFT_EDITORIAL_AUDIT_VERSION,
      applicable: false,
      id: graft.id || null,
      pass: true,
      status: "not-applicable",
      issues: [],
      errors: [],
      warnings: [],
    };
  }

  const checkpoints =
    options.checkpoints || MONSTER_LAIR_GRAFT_EDITORIAL_CR_CHECKPOINTS;
  const schema = validateMonsterGraftV2(graft);
  const snapshots = checkpoints.map((targetCr) => buildCrSnapshot(graft, targetCr));
  const issues = [...schema.issues];

  checkIdentity(graft, issues);
  checkEditorialDecision(graft, issues);
  checkAbility(graft, issues);
  const counterplayChannels = checkProfiles(graft, issues);
  const scaling = checkScaling(graft, snapshots, issues);
  checkLegacyPatterns(graft, issues);

  const expectedSource = EXPECTED_SOURCE_BY_ID[graft.id];
  const source = graft.sourceAnchors?.[0] || graft.source || null;
  if (source !== expectedSource) {
    issues.push(
      createIssue(
        "error",
        "lair-editorial-source",
        `${graft.id} must remain anchored to ${expectedSource}.`,
        "source",
        { expectedSource, actualSource: source },
      ),
    );
  }

  if (
    snapshots.some(
      (snapshot) =>
        snapshot.validationStatus === "error" ||
        snapshot.validationErrors.length ||
        snapshot.abilityCount !== 1 ||
        !snapshot.parityPass,
    )
  ) {
    issues.push(
      createIssue(
        "error",
        "lair-editorial-runtime",
        "One or more CR projections fail bundle compilation or verified renderer parity.",
        "progression",
        snapshots,
      ),
    );
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    version: MONSTER_LAIR_GRAFT_EDITORIAL_AUDIT_VERSION,
    applicable: true,
    id: graft.id,
    title: graft.title,
    source,
    decision: graft.editorial?.decision || null,
    status: errors.length ? "error" : warnings.length ? "warning" : "pass",
    pass: errors.length === 0,
    abilityCount: asArray(graft.abilities).length,
    counterplayChannels,
    scaling,
    snapshots,
    issues,
    errors,
    warnings,
  };
}

export function buildMonsterLairGraftEditorialCatalogAudit(grafts = [], options = {}) {
  const reports = asArray(grafts)
    .filter(isMonsterLairGraft)
    .map((graft) => buildMonsterLairGraftEditorialReport(graft, options))
    .sort((left, right) =>
      left.source === right.source
        ? left.id.localeCompare(right.id)
        : left.source.localeCompare(right.source),
    );
  const issues = reports.flatMap((report) =>
    report.issues.map((issue) => ({ graftId: report.id, ...issue })),
  );
  const errors = issues.filter((issue) => issue.severity === "error");
  const expectedIds = [...MONSTER_LAIR_GRAFT_EDITORIAL_IDS].sort();
  const actualIds = reports.map((report) => report.id).sort();
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    errors.push(
      createIssue(
        "error",
        "lair-editorial-catalog-membership",
        "The Lair catalog does not match the approved seven-ID family.",
        "catalog",
        { expectedIds, actualIds },
      ),
    );
  }

  const bySource = reports.reduce((acc, report) => {
    acc[report.source] = (acc[report.source] || 0) + 1;
    return acc;
  }, {});
  const byDecision = reports.reduce((acc, report) => {
    acc[report.decision] = (acc[report.decision] || 0) + 1;
    return acc;
  }, {});

  return {
    version: MONSTER_LAIR_GRAFT_EDITORIAL_AUDIT_VERSION,
    editorialVersion: MONSTER_LAIR_GRAFT_EDITORIAL_VERSION,
    expectedTotal: expectedIds.length,
    total: reports.length,
    passing: reports.filter((report) => report.pass).length,
    warning: reports.filter((report) => report.status === "warning").length,
    error: reports.filter((report) => report.status === "error").length,
    abilityCount: reports.reduce((sum, report) => sum + report.abilityCount, 0),
    bundleCount: reports.filter((report) => report.abilityCount > 1).length,
    scaledCount: reports.filter((report) => report.scaling.declared).length,
    bySource,
    byDecision,
    reports,
    issues,
    errors,
    pass:
      reports.length === expectedIds.length &&
      reports.every((report) => report.pass) &&
      errors.length === 0,
  };
}
