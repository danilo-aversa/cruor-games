import {
  MONSTER_DEATH_GRAFT_EDITORIAL_IDS,
  MONSTER_DEATH_GRAFT_EDITORIAL_VERSION,
  MONSTER_DEATH_GRAFT_SCALED_IDS,
} from "../data/monster-death-grafts.js";
import { buildMonsterAbilityBundleFromGraft } from "./monster-ability-model.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";
import { buildMonsterRulesParityReport } from "./monster-rules-parity.js";
import { validateMonsterGraftV2 } from "./monster-graft-v2.schema.js";

export const MONSTER_DEATH_GRAFT_EDITORIAL_AUDIT_VERSION =
  "monster-death-graft-editorial-audit-v1.0";
export const MONSTER_DEATH_GRAFT_EDITORIAL_CR_CHECKPOINTS = Object.freeze([
  1, 5, 10, 15,
]);

const EXPECTED_DECISION_BY_ID = Object.freeze({
  "corpse-bloom-death": "REWRITE_PERSISTENT_HEALING_ZONE",
  "toxic-detonation": "REWRITE_AND_SCALE_DEATH_BURST",
  "purge-fluid-flood": "REWRITE_AND_SCALE_PERSISTENT_HAZARD",
  "spectral-dust-death": "REWRITE_AS_REVEAL_AND_TRACE_BUNDLE",
  "last-meal-memory": "REWRITE_AS_INFORMATION_BARGAIN",
  "egg-hatch-death": "REWRITE_AND_SCALE_BOUNDED_SUMMON",
  "silk-cocoon-remains": "REWRITE_AS_SNARE_AND_REMAINS_BUNDLE",
  "face-curse": "REWRITE_AND_SCALE_GAZE_CURSE",
});

const EXPECTED_SOURCE_BY_ID = Object.freeze({
  "corpse-bloom-death": "decomposition",
  "toxic-detonation": "decomposition",
  "purge-fluid-flood": "decomposition",
  "spectral-dust-death": "jikininki",
  "last-meal-memory": "jikininki",
  "egg-hatch-death": "wolf-spiders",
  "silk-cocoon-remains": "wolf-spiders",
  "face-curse": "wax-death-masks",
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

function createIssue(severity, code, message, path = "deathGraft", details = null) {
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
    summon: rules.summon || null,
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
        "death-editorial-identity",
        "Death Effect identity must define fantasy, tactical role, signature, and at least four recognition tags.",
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
    editorial.phase !== "phase6r-death-editorial-review" ||
    editorial.version !== MONSTER_DEATH_GRAFT_EDITORIAL_VERSION ||
    editorial.decision !== expectedDecision ||
    !cleanString(editorial.rationale)
  ) {
    issues.push(
      createIssue(
        "error",
        "death-editorial-decision",
        `Death Effect ${graft.id} is missing its approved editorial decision or rationale.`,
        "editorial",
        { expectedDecision, actual: editorial },
      ),
    );
  }
}

function checkAbilities(graft, issues) {
  const abilities = asArray(graft.abilities);
  if (abilities.length < 1 || abilities.length > 2) {
    issues.push(
      createIssue(
        "error",
        "death-editorial-ability-count",
        "Each Death Effect must expose one or two bounded aftermath abilities.",
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
          "death-editorial-ability-copy",
          "Every Death ability requires ID, title, summary, mechanics, and counterplay copy.",
          `abilities[${index}]`,
        ),
      );
    }
    if (ability.rules?.parity?.status !== "verified") {
      issues.push(
        createIssue(
          "error",
          "death-editorial-parity-status",
          "Every Death ability must carry verified structured-rule parity.",
          `abilities[${index}].rules.parity.status`,
        ),
      );
    }
    if (
      ability.rules?.section !== "death" ||
      ability.rules?.actionEconomy !== "deathTrigger" ||
      ability.rules?.usage?.type !== "death"
    ) {
      issues.push(
        createIssue(
          "error",
          "death-editorial-trigger-contract",
          "Every authored Death ability must compile as a death-triggered section entry.",
          `abilities[${index}].rules`,
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
        "death-editorial-counterplay",
        "A publishable Death Effect must expose telegraph, positioning, break-condition, and non-damage counterplay.",
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
        createIssue("error", "death-editorial-profile", `Death Effect is missing ${field}.`, field),
      );
    }
  });
  return counterplayChannels;
}

function checkScaling(graft, snapshots, issues) {
  const declared = asArray(graft.progression?.bands).length > 0;
  const expected = MONSTER_DEATH_GRAFT_SCALED_IDS.includes(graft.id);
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
        "death-editorial-scaling",
        "Death Effect CR progression does not match the approved editorial scaling plan.",
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

function checkDeathProcedure(graft, snapshots, issues) {
  const allText = snapshots
    .flatMap((snapshot) => snapshot.renderedAbilities)
    .map((entry) => entry.renderedText)
    .join(" ");
  const normalized = allText.toLowerCase();
  const bannedPatterns = [
    [/hatches on a 13 or higher/, "random mass-hatch roll"],
    [/one clue tied to the source anchor/, "undefined source-anchor clue"],
    [/until cleaned or burned away/, "condition duration confused with hazard duration"],
    [/if the body was burned before death/, "undefined whole-body burn prerequisite"],
  ];
  bannedPatterns.forEach(([pattern, label]) => {
    if (pattern.test(normalized)) {
      issues.push(
        createIssue(
          "error",
          "death-editorial-legacy-procedure",
          `Death Effect still contains ${label}.`,
          "abilities",
        ),
      );
    }
  });

  if (!/dies|drops to 0 hit points/.test(normalized)) {
    issues.push(
      createIssue(
        "error",
        "death-editorial-missing-trigger",
        "Death Effect output must state the death trigger explicitly.",
        "abilities",
      ),
    );
  }

  const consequencePatterns =
    /damage|difficult terrain|can't regain hit points|cannot regain hit points|poisoned|prone|frightened|restrained|invisible|hide action|spider minion|learns|reveals/;
  if (!consequencePatterns.test(normalized)) {
    issues.push(
      createIssue(
        "error",
        "death-editorial-consequence",
        "Death Effect must produce a concrete tactical, investigative, or action-economy aftermath.",
        "abilities",
      ),
    );
  }

  if (graft.id === "egg-hatch-death" && !/up to (?:one|two|three)/.test(normalized)) {
    issues.push(
      createIssue(
        "error",
        "death-editorial-bounded-brood",
        "Brood Burst must use explicit bounded hatch counts rather than a random roll over every egg.",
        "abilities",
      ),
    );
  }
  if (graft.id === "silk-cocoon-remains" && asArray(graft.abilities).length !== 2) {
    issues.push(
      createIssue(
        "error",
        "death-editorial-cocoon-bundle",
        "Death Cocoon must separate its restraint and evidence-object procedures into two abilities.",
        "abilities",
      ),
    );
  }
  if (graft.id === "spectral-dust-death" && asArray(graft.abilities).length !== 2) {
    issues.push(
      createIssue(
        "error",
        "death-editorial-dust-bundle",
        "Spectral Dust must separate the reveal zone from the later investigation trace.",
        "abilities",
      ),
    );
  }
}

export function isMonsterDeathGraft(graft = {}) {
  return cleanString(graft.slot) === "death";
}

export function buildMonsterDeathGraftEditorialReport(graft = {}, options = {}) {
  if (!isMonsterDeathGraft(graft)) {
    return {
      version: MONSTER_DEATH_GRAFT_EDITORIAL_AUDIT_VERSION,
      applicable: false,
      id: graft.id || null,
      status: "not-applicable",
      pass: true,
      issues: [],
    };
  }

  const checkpoints =
    options.checkpoints || MONSTER_DEATH_GRAFT_EDITORIAL_CR_CHECKPOINTS;
  const schema = validateMonsterGraftV2(graft);
  const snapshots = checkpoints.map((targetCr) => buildCrSnapshot(graft, targetCr));
  const issues = [...schema.issues];

  checkIdentity(graft, issues);
  checkEditorialDecision(graft, issues);
  checkAbilities(graft, issues);
  const counterplayChannels = checkProfiles(graft, issues);
  const scaling = checkScaling(graft, snapshots, issues);
  checkDeathProcedure(graft, snapshots, issues);

  const expectedSource = EXPECTED_SOURCE_BY_ID[graft.id];
  const source = graft.sourceAnchors?.[0] || graft.source || null;
  if (source !== expectedSource) {
    issues.push(
      createIssue(
        "error",
        "death-editorial-source",
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
        snapshot.abilityCount !== asArray(graft.abilities).length ||
        !snapshot.parityPass,
    )
  ) {
    issues.push(
      createIssue(
        "error",
        "death-editorial-runtime",
        "One or more CR projections fail bundle compilation or verified renderer parity.",
        "progression",
        snapshots,
      ),
    );
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    version: MONSTER_DEATH_GRAFT_EDITORIAL_AUDIT_VERSION,
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

export function buildMonsterDeathGraftEditorialCatalogAudit(grafts = [], options = {}) {
  const reports = asArray(grafts)
    .filter(isMonsterDeathGraft)
    .map((graft) => buildMonsterDeathGraftEditorialReport(graft, options))
    .sort((left, right) =>
      left.source === right.source
        ? left.id.localeCompare(right.id)
        : left.source.localeCompare(right.source),
    );
  const issues = reports.flatMap((report) =>
    report.issues.map((issue) => ({ graftId: report.id, ...issue })),
  );
  const errors = issues.filter((issue) => issue.severity === "error");
  const expectedIds = [...MONSTER_DEATH_GRAFT_EDITORIAL_IDS].sort();
  const actualIds = reports.map((report) => report.id).sort();
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    errors.push(
      createIssue(
        "error",
        "death-editorial-catalog-membership",
        "The Death catalog does not match the approved eight-ID family.",
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
    version: MONSTER_DEATH_GRAFT_EDITORIAL_AUDIT_VERSION,
    editorialVersion: MONSTER_DEATH_GRAFT_EDITORIAL_VERSION,
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
