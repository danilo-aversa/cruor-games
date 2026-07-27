import {
  MONSTER_TWIST_GRAFT_EDITORIAL_IDS,
  MONSTER_TWIST_GRAFT_EDITORIAL_VERSION,
  MONSTER_TWIST_GRAFT_SCALED_IDS,
} from "../data/monster-twist-grafts.js";
import { buildMonsterAbilityBundleFromGraft } from "./monster-ability-model.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";
import { buildMonsterRulesParityReport } from "./monster-rules-parity.js";
import { validateMonsterGraftV2 } from "./monster-graft-v2.schema.js";

export const MONSTER_TWIST_GRAFT_EDITORIAL_AUDIT_VERSION =
  "monster-twist-graft-editorial-audit-v1.0";
export const MONSTER_TWIST_GRAFT_EDITORIAL_CR_CHECKPOINTS = Object.freeze([
  1, 5, 10, 15,
]);

const EXPECTED_DECISION_BY_ID = Object.freeze({
  "gas-buildup": "REWRITE_INTO_PRESSURE_PATTERN",
  "unstable-rupture": "REWRITE_AND_SCALE",
  "dangerously-unstable": "REWRITE_AS_COUNTDOWN",
  "undead-fortitude": "KEEP_CANONICAL",
  "siege-corpse": "EXPAND_CANONICAL_SCENE_TWIST",
  "flesh-harvest": "EXPAND_INTO_PHASE",
  "horrific-assault": "REWRITE_AS_AMBUSH_REVEAL",
  "no-witnesses-rage": "RENAME_AND_REWRITE",
  "enrage-broodmother": "REWRITE_AS_DETERMINISTIC_TRIGGER",
  "web-architect": "EXPAND_INTO_TERRAIN_PHASE",
  "corrosive-web": "REWRITE_AS_DESTRUCTION_REVERSAL",
  "mask-phase": "REWRITE_AS_VISIBLE_PHASE_CHOICE",
});

const EXPECTED_SOURCE_BY_ID = Object.freeze({
  "gas-buildup": "decomposition",
  "unstable-rupture": "decomposition",
  "dangerously-unstable": "decomposition",
  "undead-fortitude": "decomposition",
  "siege-corpse": "decomposition",
  "flesh-harvest": "jikininki",
  "horrific-assault": "jikininki",
  "no-witnesses-rage": "jikininki",
  "enrage-broodmother": "wolf-spiders",
  "web-architect": "wolf-spiders",
  "corrosive-web": "wolf-spiders",
  "mask-phase": "wax-death-masks",
});

const EXPECTED_ABILITY_COUNT_BY_ID = Object.freeze({
  "gas-buildup": 2,
  "unstable-rupture": 1,
  "dangerously-unstable": 1,
  "undead-fortitude": 1,
  "siege-corpse": 2,
  "flesh-harvest": 2,
  "horrific-assault": 2,
  "no-witnesses-rage": 1,
  "enrage-broodmother": 1,
  "web-architect": 2,
  "corrosive-web": 1,
  "mask-phase": 1,
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

function createIssue(severity, code, message, path = "twistGraft", details = null) {
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
      category: "Zombie",
      categoryNoun: "corpse",
      rulesContext: { categoryNoun: "corpse" },
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
        "twist-editorial-identity",
        "Twist Graft identity must define fantasy, tactical role, signature, and at least four recognition tags.",
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
    editorial.phase !== "phase6r-twist-editorial-review" ||
    editorial.version !== MONSTER_TWIST_GRAFT_EDITORIAL_VERSION ||
    editorial.decision !== expectedDecision ||
    !cleanString(editorial.rationale)
  ) {
    issues.push(
      createIssue(
        "error",
        "twist-editorial-decision",
        `Twist Graft ${graft.id} is missing its approved editorial decision or rationale.`,
        "editorial",
        { expectedDecision, actual: editorial },
      ),
    );
  }
}

function checkAbilities(graft, issues) {
  const abilities = asArray(graft.abilities);
  const expectedAbilityCount = EXPECTED_ABILITY_COUNT_BY_ID[graft.id];
  if (abilities.length !== expectedAbilityCount) {
    issues.push(
      createIssue(
        "error",
        "twist-editorial-ability-count",
        `Twist Graft ${graft.id} must expose ${expectedAbilityCount} authored ability entries.`,
        "abilities",
        { expectedAbilityCount, actualAbilityCount: abilities.length },
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
          "twist-editorial-ability-copy",
          "Every Twist Graft ability requires ID, title, summary, mechanics, and counterplay copy.",
          `abilities[${index}]`,
        ),
      );
    }
    if (ability.rules?.parity?.status !== "verified") {
      issues.push(
        createIssue(
          "error",
          "twist-editorial-parity-status",
          "Every Twist Graft ability must carry verified structured-rule parity.",
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
        "twist-editorial-counterplay",
        "A publishable Twist Graft must expose telegraph, positioning, break-condition, and non-damage counterplay.",
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
        createIssue("error", "twist-editorial-profile", `Twist Graft is missing ${field}.`, field),
      );
    }
  });
  return counterplayChannels;
}

function checkScaling(graft, snapshots, issues) {
  const declared = asArray(graft.progression?.bands).length > 0;
  const expected = MONSTER_TWIST_GRAFT_SCALED_IDS.includes(graft.id);
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
        "twist-editorial-scaling",
        "Twist Graft CR progression does not match the approved editorial scaling plan.",
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

function checkTwistContract(graft, snapshots, issues) {
  const allText = snapshots
    .flatMap((snapshot) => snapshot.renderedAbilities)
    .map((entry) => entry.renderedText)
    .join(" ");
  const lowerText = `${allText} ${JSON.stringify({
    abilities: graft.abilities,
    routine: graft.routine,
    progression: graft.progression,
    mechanics: graft.mechanics,
    counterplay: graft.counterplay,
  })}`.toLowerCase();

  if (/roll a d6|on a 2 or higher|on a 4 or higher|on a 6\b/.test(lowerText)) {
    issues.push(
      createIssue(
        "error",
        "twist-editorial-hidden-random-trigger",
        "Reviewed Twist Grafts cannot rely on hidden random d6 escalation triggers.",
        "abilities",
      ),
    );
  }
  if (/for each corpse consumed|until dawn|max(?:imum)? bonus equal to/.test(lowerText)) {
    issues.push(
      createIssue(
        "error",
        "twist-editorial-unbounded-snowball",
        "Reviewed Twist Grafts cannot use indefinite corpse stacking or campaign-duration combat bonuses.",
        "abilities",
      ),
    );
  }
  if (/any hit.*critical hit|surprised creature is a critical hit/.test(lowerText)) {
    issues.push(
      createIssue(
        "error",
        "twist-editorial-opening-auto-critical",
        "Reviewed Twist Grafts cannot grant automatic ambush critical hits.",
        "abilities",
      ),
    );
  }
  if (!cleanString(graft.routine?.defaultPlan) || !cleanString(graft.routine?.targetSelection)) {
    issues.push(
      createIssue(
        "error",
        "twist-editorial-routine",
        "Each Twist Graft must explain how the GM introduces and resolves the encounter change.",
        "routine",
      ),
    );
  }

  const specificChecks = {
    "undead-fortitude": ["radiant", "critical hit", "1 hit point"],
    "siege-corpse": ["double damage", "objects and structures", "half cover"],
    "dangerously-unstable": ["countdown", "use an action", "no detonation"],
    "horrific-assault": ["medicine", "investigation", "cannot take reactions"],
    "enrage-broodmother": ["once per encounter", "destroys an egg", "half its speed"],
    "web-architect": ["web anchors", "bloodied", "half cover"],
    "corrosive-web": ["first time each round", "destroyed", "difficult terrain"],
    "mask-phase": ["mourner", "accuser", "saint"],
  };
  asArray(specificChecks[graft.id]).forEach((requiredText) => {
    if (!lowerText.includes(requiredText)) {
      issues.push(
        createIssue(
          "error",
          "twist-editorial-specific-contract",
          `${graft.id} must preserve the authored phrase or concept: ${requiredText}.`,
          "abilities",
        ),
      );
    }
  });
}

export function isMonsterTwistGraft(graft = {}) {
  return cleanString(graft.slot) === "twist";
}

export function buildMonsterTwistGraftEditorialReport(graft = {}, options = {}) {
  if (!isMonsterTwistGraft(graft)) {
    return {
      version: MONSTER_TWIST_GRAFT_EDITORIAL_AUDIT_VERSION,
      applicable: false,
      id: graft.id || null,
      status: "not-applicable",
      pass: true,
      issues: [],
    };
  }

  const checkpoints = options.checkpoints || MONSTER_TWIST_GRAFT_EDITORIAL_CR_CHECKPOINTS;
  const schema = validateMonsterGraftV2(graft);
  const snapshots = checkpoints.map((targetCr) => buildCrSnapshot(graft, targetCr));
  const issues = [...schema.issues];

  checkIdentity(graft, issues);
  checkEditorialDecision(graft, issues);
  checkAbilities(graft, issues);
  const counterplayChannels = checkProfiles(graft, issues);
  const scaling = checkScaling(graft, snapshots, issues);
  checkTwistContract(graft, snapshots, issues);

  const expectedSource = EXPECTED_SOURCE_BY_ID[graft.id];
  const source = graft.sourceAnchors?.[0] || graft.source || null;
  if (source !== expectedSource) {
    issues.push(
      createIssue(
        "error",
        "twist-editorial-source",
        `${graft.id} must remain anchored to ${expectedSource}.`,
        "source",
        { expectedSource, actualSource: source },
      ),
    );
  }

  snapshots.forEach((snapshot) => {
    if (snapshot.validationStatus !== "pass" || snapshot.validationErrors.length) {
      issues.push(
        createIssue(
          "error",
          "twist-editorial-runtime-validation",
          `${graft.id} fails its CR ${snapshot.targetCr} ability-bundle validation.`,
          "abilities",
          snapshot,
        ),
      );
    }
    if (!snapshot.parityPass) {
      issues.push(
        createIssue(
          "error",
          "twist-editorial-render-parity",
          `${graft.id} fails structured-rule rendering parity at CR ${snapshot.targetCr}.`,
          "abilities",
          snapshot.parityIssues,
        ),
      );
    }
  });

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    version: MONSTER_TWIST_GRAFT_EDITORIAL_AUDIT_VERSION,
    applicable: true,
    id: graft.id,
    title: graft.title,
    source,
    decision: graft.editorial?.decision || null,
    status: errors.length ? "error" : warnings.length ? "warning" : "pass",
    pass: errors.length === 0 && warnings.length === 0,
    abilityCount: asArray(graft.abilities).length,
    progressionBandCount: asArray(graft.progression?.bands).length,
    counterplayChannels,
    scaling,
    snapshots,
    issues,
    errors,
    warnings,
  };
}

export function buildMonsterTwistGraftCatalogAudit(grafts = [], options = {}) {
  const twistGrafts = grafts.filter(isMonsterTwistGraft);
  const reports = twistGrafts.map((graft) =>
    buildMonsterTwistGraftEditorialReport(graft, options),
  );
  const ids = reports.map((report) => report.id);
  const missingIds = MONSTER_TWIST_GRAFT_EDITORIAL_IDS.filter((id) => !ids.includes(id));
  const unexpectedIds = ids.filter((id) => !MONSTER_TWIST_GRAFT_EDITORIAL_IDS.includes(id));
  const errors = reports.flatMap((report) =>
    report.errors.map((issue) => ({ id: report.id, title: report.title, ...issue })),
  );
  missingIds.forEach((id) => {
    errors.push(
      createIssue(
        "error",
        "twist-editorial-missing-graft",
        `Approved Twist Graft ${id} is missing from the catalog.`,
        "catalog",
      ),
    );
  });
  unexpectedIds.forEach((id) => {
    errors.push(
      createIssue(
        "error",
        "twist-editorial-unreviewed-graft",
        `Twist Graft ${id} exists without an approved editorial review.`,
        "catalog",
      ),
    );
  });

  const byDecision = reports.reduce((counts, report) => {
    const key = report.decision || "UNSET";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const bySource = reports.reduce((counts, report) => {
    const key = report.source || "unknown";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const warning = reports.filter((report) => report.status === "warning").length;
  const error = reports.filter((report) => report.status === "error").length;

  return {
    version: MONSTER_TWIST_GRAFT_EDITORIAL_AUDIT_VERSION,
    editorialVersion: MONSTER_TWIST_GRAFT_EDITORIAL_VERSION,
    checkpoints: [...MONSTER_TWIST_GRAFT_EDITORIAL_CR_CHECKPOINTS],
    expectedIds: [...MONSTER_TWIST_GRAFT_EDITORIAL_IDS],
    expectedTotal: MONSTER_TWIST_GRAFT_EDITORIAL_IDS.length,
    scaledIds: [...MONSTER_TWIST_GRAFT_SCALED_IDS],
    total: reports.length,
    passing: reports.filter((report) => report.pass).length,
    warning,
    error,
    abilityCount: reports.reduce((total, report) => total + report.abilityCount, 0),
    bundleCount: reports.filter((report) => report.abilityCount > 1).length,
    progressionCount: reports.filter((report) => report.progressionBandCount > 0).length,
    scaledCount: reports.filter((report) => report.scaling.declared).length,
    byDecision,
    bySource,
    missingIds,
    unexpectedIds,
    reports,
    errors,
    pass:
      reports.length === MONSTER_TWIST_GRAFT_EDITORIAL_IDS.length &&
      missingIds.length === 0 &&
      unexpectedIds.length === 0 &&
      errors.length === 0 &&
      reports.every((report) => report.pass),
  };
}
