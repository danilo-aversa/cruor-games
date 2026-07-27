import {
  MONSTER_HORROR_GRAFT_EDITORIAL_IDS,
  MONSTER_HORROR_GRAFT_EDITORIAL_VERSION,
  MONSTER_HORROR_GRAFT_SCALED_IDS,
} from "../data/monster-horror-grafts.js";
import { buildMonsterAbilityBundleFromGraft } from "./monster-ability-model.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";
import { buildMonsterRulesParityReport } from "./monster-rules-parity.js";
import { validateMonsterGraftV2 } from "./monster-graft-v2.schema.js";

export const MONSTER_HORROR_GRAFT_EDITORIAL_AUDIT_VERSION =
  "monster-horror-graft-editorial-audit-v1.0";
export const MONSTER_HORROR_GRAFT_EDITORIAL_CR_CHECKPOINTS = Object.freeze([
  1, 5, 10, 15,
]);

const EXPECTED_DECISION_BY_ID = Object.freeze({
  stench: "ADD_CANONICAL_SOURCE_HORROR",
  "horrific-apparition": "REWRITE_AND_SCALE",
  "crawling-dread": "ADD_SOURCE_HORROR",
  wail: "ADD_CANONICAL_SOURCE_HORROR",
});

const EXPECTED_SOURCE_BY_ID = Object.freeze({
  stench: "decomposition",
  "horrific-apparition": "jikininki",
  "crawling-dread": "wolf-spiders",
  wail: "wax-death-masks",
});

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

function createIssue(severity, code, message, path = "horrorGraft", details = null) {
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
      category: "Spirit",
      categoryNoun: "spirit",
      rulesContext: { categoryNoun: "spirit" },
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
    renderedAbilities: parityReports.map(({ abilityId, renderedText }) => ({
      abilityId,
      renderedText,
    })),
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
        "horror-editorial-identity",
        "Horror Graft identity must define fantasy, tactical role, signature, and at least four recognition tags.",
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
    editorial.phase !== "phase6r-horror-editorial-review" ||
    editorial.version !== MONSTER_HORROR_GRAFT_EDITORIAL_VERSION ||
    editorial.decision !== expectedDecision ||
    !cleanString(editorial.rationale)
  ) {
    issues.push(
      createIssue(
        "error",
        "horror-editorial-decision",
        `Horror Graft ${graft.id} is missing its approved editorial decision or rationale.`,
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
        "horror-editorial-ability-count",
        "Each current Horror Graft must expose exactly one bounded encounter reveal.",
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
          "horror-editorial-ability-copy",
          "Every Horror Graft ability requires ID, title, summary, mechanics, and counterplay copy.",
          `abilities[${index}]`,
        ),
      );
    }
    if (ability.rules?.parity?.status !== "verified") {
      issues.push(
        createIssue(
          "error",
          "horror-editorial-parity-status",
          "Every Horror Graft ability must carry verified structured-rule parity.",
          `abilities[${index}].rules.parity.status`,
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
        "horror-editorial-counterplay",
        "A publishable Horror Graft must expose telegraph, positioning, break-condition, and non-damage counterplay.",
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
        createIssue("error", "horror-editorial-profile", `Horror Graft is missing ${field}.`, field),
      );
    }
  });
  return counterplayChannels;
}

function checkScaling(graft, snapshots, issues) {
  const declared = asArray(graft.progression?.bands).length > 0;
  const expected = MONSTER_HORROR_GRAFT_SCALED_IDS.includes(graft.id);
  const sampledBandIds = uniqueArray(snapshots.map((snapshot) => snapshot.bandId));
  const sampledRuleVariants = new Set(
    snapshots.flatMap((snapshot) => snapshot.ruleSignatures),
  ).size;
  const pass =
    declared === expected &&
    (!expected || (sampledBandIds.length >= 2 && sampledRuleVariants >= 2));
  if (!pass) {
    issues.push(
      createIssue(
        "error",
        "horror-editorial-scaling",
        "Horror Graft CR progression does not match the approved editorial scaling plan.",
        "progression",
        { expected, declared, sampledBandIds, sampledRuleVariants },
      ),
    );
  }
  return {
    expected,
    declared,
    bandCount: asArray(graft.progression?.bands).length,
    sampledBandIds,
    sampledRuleVariants,
    pass,
  };
}

function checkHorrorSpecificRules(graft, snapshots, issues) {
  const allText = snapshots
    .flatMap((snapshot) => snapshot.renderedAbilities)
    .map((entry) => entry.renderedText)
    .join(" ")
    .toLowerCase();

  if (/supernatural aging|1d4 years|permanent aging/.test(allText)) {
    issues.push(
      createIssue(
        "error",
        "horror-editorial-permanent-campaign-harm",
        "Horror Grafts cannot impose vague permanent aging or campaign harm without a dedicated recovery subsystem.",
        "abilities",
      ),
    );
  }
  if (graft.id === "stench" && !allText.includes("poisoned")) {
    issues.push(createIssue("error", "horror-editorial-stench", "Stench must retain its canonical Poisoned outcome.", "abilities"));
  }
  if (graft.id === "crawling-dread" && !allText.includes("avert")) {
    issues.push(createIssue("error", "horror-editorial-avert-eyes", "Crawling Dread must preserve the explicit avert-eyes response.", "abilities"));
  }
  if (graft.id === "wail" && !allText.includes("cannot hear")) {
    issues.push(createIssue("error", "horror-editorial-auditory-answer", "Wail must explicitly exempt creatures that cannot hear it.", "abilities"));
  }
}

export function isMonsterHorrorGraft(graft = {}) {
  return cleanString(graft.slot) === "horror";
}

export function buildMonsterHorrorGraftEditorialReport(graft = {}, options = {}) {
  if (!isMonsterHorrorGraft(graft)) {
    return {
      version: MONSTER_HORROR_GRAFT_EDITORIAL_AUDIT_VERSION,
      applicable: false,
      id: graft.id || null,
      status: "not-applicable",
      pass: true,
      issues: [],
    };
  }

  const checkpoints = options.checkpoints || MONSTER_HORROR_GRAFT_EDITORIAL_CR_CHECKPOINTS;
  const schema = validateMonsterGraftV2(graft);
  const snapshots = checkpoints.map((targetCr) => buildCrSnapshot(graft, targetCr));
  const issues = [...schema.issues];

  checkIdentity(graft, issues);
  checkEditorialDecision(graft, issues);
  checkAbility(graft, issues);
  const counterplayChannels = checkProfiles(graft, issues);
  const scaling = checkScaling(graft, snapshots, issues);
  checkHorrorSpecificRules(graft, snapshots, issues);

  const expectedSource = EXPECTED_SOURCE_BY_ID[graft.id];
  const source = graft.sourceAnchors?.[0] || graft.source || null;
  if (source !== expectedSource) {
    issues.push(
      createIssue(
        "error",
        "horror-editorial-source",
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
        "horror-editorial-runtime",
        "One or more CR projections fail bundle compilation or verified renderer parity.",
        "progression",
        snapshots,
      ),
    );
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    version: MONSTER_HORROR_GRAFT_EDITORIAL_AUDIT_VERSION,
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

export function buildMonsterHorrorGraftEditorialCatalogAudit(grafts = [], options = {}) {
  const reports = asArray(grafts)
    .filter(isMonsterHorrorGraft)
    .map((graft) => buildMonsterHorrorGraftEditorialReport(graft, options))
    .sort((left, right) => left.source.localeCompare(right.source));
  const issues = reports.flatMap((report) =>
    report.issues.map((issue) => ({ graftId: report.id, ...issue })),
  );
  const errors = issues.filter((issue) => issue.severity === "error");
  const expectedIds = [...MONSTER_HORROR_GRAFT_EDITORIAL_IDS].sort();
  const actualIds = reports.map((report) => report.id).sort();
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    errors.push(
      createIssue(
        "error",
        "horror-editorial-catalog-membership",
        "The Horror catalog does not match the approved four-source family.",
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
    version: MONSTER_HORROR_GRAFT_EDITORIAL_AUDIT_VERSION,
    editorialVersion: MONSTER_HORROR_GRAFT_EDITORIAL_VERSION,
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
