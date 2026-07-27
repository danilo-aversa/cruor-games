import {
  MONSTER_WEAKNESS_GRAFT_EDITORIAL_IDS,
  MONSTER_WEAKNESS_GRAFT_EDITORIAL_VERSION,
  MONSTER_WEAKNESS_GRAFT_SCALED_IDS,
} from "../data/monster-weakness-grafts.js";
import { buildMonsterAbilityBundleFromGraft } from "./monster-ability-model.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";
import { buildMonsterRulesParityReport } from "./monster-rules-parity.js";
import { validateMonsterGraftV2 } from "./monster-graft-v2.schema.js";

export const MONSTER_WEAKNESS_GRAFT_EDITORIAL_AUDIT_VERSION =
  "monster-weakness-graft-editorial-audit-v1.0";
export const MONSTER_WEAKNESS_GRAFT_EDITORIAL_CR_CHECKPOINTS = Object.freeze([
  1, 5, 10, 15,
]);

const EXPECTED_DECISION_BY_ID = Object.freeze({
  "head-weak-spot": "REWRITE_SETUP_PRECISION",
  "mechanical-stress": "REWRITE_AND_SCALE",
  "radiant-preservation-failure": "REWRITE_SUPPRESSION_WINDOW",
  "daytime-weakness": "RENAME_CANONICAL_AND_REWRITE",
  "shameful-feeding": "REWRITE_REACTION_ANSWER",
  "dangerous-hunger": "REWRITE_AND_SCALE",
  "salt-and-names": "REWRITE_RITUAL_CONTROL",
  "thin-legs": "REWRITE_POSITIONAL_ANSWER",
  "fear-of-fire": "REWRITE_CANONICAL",
  "underbelly-weak-spot": "REWRITE_AND_SCALE",
  "eyes-weak-spot": "REWRITE_PRECISION_TRADEOFF",
  "brood-tell": "REPLACE_WITH_DESTROYABLE_WEAKNESS",
  "fire-softens-it": "REWRITE_COMBO_WINDOW",
});

const EXPECTED_SOURCE_BY_ID = Object.freeze({
  "head-weak-spot": "decomposition",
  "mechanical-stress": "decomposition",
  "radiant-preservation-failure": "decomposition",
  "daytime-weakness": "jikininki",
  "shameful-feeding": "jikininki",
  "dangerous-hunger": "jikininki",
  "salt-and-names": "jikininki",
  "thin-legs": "wolf-spiders",
  "fear-of-fire": "wolf-spiders",
  "underbelly-weak-spot": "wolf-spiders",
  "eyes-weak-spot": "wolf-spiders",
  "brood-tell": "wolf-spiders",
  "fire-softens-it": "wax-death-masks",
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

function createIssue(severity, code, message, path = "weaknessGraft", details = null) {
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
        "weakness-editorial-identity",
        "Weakness identity must define fantasy, tactical role, signature, and at least four recognition tags.",
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
    editorial.phase !== "phase6r-weakness-editorial-review" ||
    editorial.version !== MONSTER_WEAKNESS_GRAFT_EDITORIAL_VERSION ||
    editorial.decision !== expectedDecision ||
    !cleanString(editorial.rationale)
  ) {
    issues.push(
      createIssue(
        "error",
        "weakness-editorial-decision",
        `Weakness ${graft.id} is missing its approved editorial decision or rationale.`,
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
        "weakness-editorial-ability-count",
        "Each current Weakness must expose exactly one bounded exploit procedure.",
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
          "weakness-editorial-ability-copy",
          "Every Weakness ability requires ID, title, summary, mechanics, and counterplay copy.",
          `abilities[${index}]`,
        ),
      );
    }
    if (ability.rules?.parity?.status !== "verified") {
      issues.push(
        createIssue(
          "error",
          "weakness-editorial-parity-status",
          "Every Weakness ability must carry verified structured-rule parity.",
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
        "weakness-editorial-counterplay",
        "A publishable Weakness must expose telegraph, positioning, break-condition, and non-damage counterplay.",
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
        createIssue("error", "weakness-editorial-profile", `Weakness is missing ${field}.`, field),
      );
    }
  });
  return counterplayChannels;
}

function checkScaling(graft, snapshots, issues) {
  const declared = asArray(graft.progression?.bands).length > 0;
  const expected = MONSTER_WEAKNESS_GRAFT_SCALED_IDS.includes(graft.id);
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
        "weakness-editorial-scaling",
        "Weakness CR progression does not match the approved editorial scaling plan.",
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

function checkWeaknessProcedure(graft, snapshots, issues) {
  const allText = snapshots
    .flatMap((snapshot) => snapshot.renderedAbilities)
    .map((entry) => entry.renderedText)
    .join(" ");
  const normalized = allText.toLowerCase();
  const bannedPatterns = [
    [/\-5\b/, "arbitrary called-shot penalty"],
    [/more than half (?:of )?(?:its )?maximum hit points/, "unreachable half-maximum-HP trigger"],
    [/balance check/, "undefined balance check"],
    [/medium or larger blaze/, "oversized blaze requirement"],
    [/unstable reactions/, "cross-graft Unstable Reactions dependency"],
    [/incorporeal movement/, "cross-graft Incorporeal Movement dependency"],
  ];
  bannedPatterns.forEach(([pattern, label]) => {
    if (pattern.test(normalized)) {
      issues.push(
        createIssue(
          "error",
          "weakness-editorial-legacy-procedure",
          `Weakness still contains ${label}.`,
          "abilities",
        ),
      );
    }
  });

  if (!/advantage|critical hit|restrained|prone|disadvantage|can't take reactions|cannot take reactions|can't willingly move|cannot willingly move|speed becomes 0|speed is 0|blinded|exhaustion/.test(normalized)) {
    issues.push(
      createIssue(
        "error",
        "weakness-editorial-consequence",
        "Weakness must create a concrete player-facing consequence rather than only describing a tell.",
        "abilities",
      ),
    );
  }
  if (graft.id === "brood-tell" && !/ac 12/.test(normalized)) {
    issues.push(
      createIssue(
        "error",
        "weakness-editorial-brood-sac",
        "Brood Tell must be replaced by a visible, destroyable Brood Sac procedure.",
        "abilities",
      ),
    );
  }
  if (graft.id === "daytime-weakness" && graft.title !== "Sunlight Weakness") {
    issues.push(
      createIssue(
        "error",
        "weakness-editorial-canonical-name",
        "The daylight weakness must use the canonical Sunlight Weakness title.",
        "title",
      ),
    );
  }
  if (graft.id === "fear-of-fire" && graft.title !== "Fear of Fire") {
    issues.push(
      createIssue(
        "error",
        "weakness-editorial-canonical-name",
        "Fear of Fire must retain its canonical title.",
        "title",
      ),
    );
  }
}

export function isMonsterWeaknessGraft(graft = {}) {
  return cleanString(graft.slot) === "weakness";
}

export function buildMonsterWeaknessGraftEditorialReport(graft = {}, options = {}) {
  if (!isMonsterWeaknessGraft(graft)) {
    return {
      version: MONSTER_WEAKNESS_GRAFT_EDITORIAL_AUDIT_VERSION,
      applicable: false,
      id: graft.id || null,
      status: "not-applicable",
      pass: true,
      issues: [],
    };
  }

  const checkpoints =
    options.checkpoints || MONSTER_WEAKNESS_GRAFT_EDITORIAL_CR_CHECKPOINTS;
  const schema = validateMonsterGraftV2(graft);
  const snapshots = checkpoints.map((targetCr) => buildCrSnapshot(graft, targetCr));
  const issues = [...schema.issues];

  checkIdentity(graft, issues);
  checkEditorialDecision(graft, issues);
  checkAbility(graft, issues);
  const counterplayChannels = checkProfiles(graft, issues);
  const scaling = checkScaling(graft, snapshots, issues);
  checkWeaknessProcedure(graft, snapshots, issues);

  const expectedSource = EXPECTED_SOURCE_BY_ID[graft.id];
  const source = graft.sourceAnchors?.[0] || graft.source || null;
  if (source !== expectedSource) {
    issues.push(
      createIssue(
        "error",
        "weakness-editorial-source",
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
        "weakness-editorial-runtime",
        "One or more CR projections fail bundle compilation or verified renderer parity.",
        "progression",
        snapshots,
      ),
    );
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    version: MONSTER_WEAKNESS_GRAFT_EDITORIAL_AUDIT_VERSION,
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

export function buildMonsterWeaknessGraftEditorialCatalogAudit(grafts = [], options = {}) {
  const reports = asArray(grafts)
    .filter(isMonsterWeaknessGraft)
    .map((graft) => buildMonsterWeaknessGraftEditorialReport(graft, options))
    .sort((left, right) =>
      left.source === right.source
        ? left.id.localeCompare(right.id)
        : left.source.localeCompare(right.source),
    );
  const issues = reports.flatMap((report) =>
    report.issues.map((issue) => ({ graftId: report.id, ...issue })),
  );
  const errors = issues.filter((issue) => issue.severity === "error");
  const expectedIds = [...MONSTER_WEAKNESS_GRAFT_EDITORIAL_IDS].sort();
  const actualIds = reports.map((report) => report.id).sort();
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    errors.push(
      createIssue(
        "error",
        "weakness-editorial-catalog-membership",
        "The Weakness catalog does not match the approved thirteen-ID family.",
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
    version: MONSTER_WEAKNESS_GRAFT_EDITORIAL_AUDIT_VERSION,
    editorialVersion: MONSTER_WEAKNESS_GRAFT_EDITORIAL_VERSION,
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
