import {
  MONSTER_MIND_GRAFT_EDITORIAL_IDS,
  MONSTER_MIND_GRAFT_EDITORIAL_VERSION,
  MONSTER_MIND_GRAFT_SCALED_IDS,
} from "../data/monster-mind-grafts.js";
import { buildMonsterAbilityBundleFromGraft } from "./monster-ability-model.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";
import { buildMonsterRulesParityReport } from "./monster-rules-parity.js";
import { validateMonsterGraftV2 } from "./monster-graft-v2.schema.js";

export const MONSTER_MIND_GRAFT_EDITORIAL_AUDIT_VERSION =
  "monster-mind-graft-editorial-audit-v1.0";
export const MONSTER_MIND_GRAFT_EDITORIAL_CR_CHECKPOINTS = Object.freeze([
  1, 5, 10, 15,
]);

const EXPECTED_DECISION_BY_ID = Object.freeze({
  "mindless-command": "RENAME_AND_REWRITE",
  "pressure-agony": "REWRITE_AND_SCALE",
  "shame-hunger": "EXPAND_INTO_BUNDLE_AND_SCALE",
  "corpse-craving": "EXPAND_INTO_BUNDLE",
  "nocturnal-haunting": "RENAME_AND_EXPAND_INTO_BUNDLE",
  "deceitful-apparition": "RENAME_AND_REWRITE",
  "mortal-afterlife": "RENAME_AND_REWRITE",
  "maternal-swarm-instinct": "RENAME_AND_EXPAND_INTO_BUNDLE",
  "hundred-eyed": "RENAME_AND_EXPAND_INTO_BUNDLE",
  "hunter-spider": "RENAME_AND_EXPAND_INTO_PATTERN_BUNDLE",
  "borrowed-face": "RENAME_REWRITE_AND_SCALE",
});

const EXPECTED_ABILITY_COUNT_BY_ID = Object.freeze({
  "shame-hunger": 2,
  "corpse-craving": 2,
  "nocturnal-haunting": 2,
  "maternal-swarm-instinct": 2,
  "hundred-eyed": 2,
  "hunter-spider": 2,
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

function createIssue(
  severity,
  code,
  message,
  path = "mindGraft",
  details = null,
) {
  return {
    severity,
    code,
    message,
    path,
    ...(details ? { details } : {}),
  };
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
    damage: rules.damage || null,
    condition: rules.condition || null,
    defense: rules.defense || null,
    summon: rules.summon || null,
    procedure: rules.procedure || null,
    effects: rules.effects || [],
    text: rules.text || null,
  });
}

function buildCrSnapshot(graft, targetCr) {
  const bundle = buildMonsterAbilityBundleFromGraft(graft, { targetCr });
  const authoredAbilities = bundle.abilities.filter(
    (ability) => !ability.synthetic,
  );
  const parityReports = authoredAbilities.map((ability) => {
    const renderedText = renderStructuredRulesText(ability, {
      attack: 7,
      dc: 15,
      dpr: 18,
      targetCr,
      category: "Zombie",
      categoryNoun: "zombie",
      rulesContext: { categoryNoun: "zombie" },
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
        "mind-editorial-identity",
        "Mind Graft identity must define fantasy, tactical role, signature, and at least four recognition tags.",
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
    editorial.phase !== "phase6r-mind-editorial-review" ||
    editorial.version !== MONSTER_MIND_GRAFT_EDITORIAL_VERSION ||
    editorial.decision !== expectedDecision ||
    !cleanString(editorial.rationale)
  ) {
    issues.push(
      createIssue(
        "error",
        "mind-editorial-decision",
        `Mind Graft ${graft.id} is missing its approved editorial decision or rationale.`,
        "editorial",
        { expectedDecision, actual: editorial },
      ),
    );
  }
}

function checkAbilities(graft, issues) {
  const abilities = asArray(graft.abilities);
  const expectedAbilityCount = EXPECTED_ABILITY_COUNT_BY_ID[graft.id] || 1;
  if (abilities.length !== expectedAbilityCount) {
    issues.push(
      createIssue(
        "error",
        "mind-editorial-ability-count",
        `${graft.id} must expose ${expectedAbilityCount} authored ability${expectedAbilityCount === 1 ? "" : "ies"}.`,
        "abilities",
        { expectedAbilityCount, actualAbilityCount: abilities.length },
      ),
    );
  }

  const abilityIds = abilities.map((ability) => cleanString(ability.id));
  if (
    abilityIds.some((id) => !id) ||
    uniqueArray(abilityIds).length !== abilityIds.length
  ) {
    issues.push(
      createIssue(
        "error",
        "mind-editorial-ability-identity",
        "Mind Graft abilities require unique non-empty IDs.",
        "abilities",
      ),
    );
  }

  abilities.forEach((ability, index) => {
    if (
      !cleanString(ability.title) ||
      !cleanString(ability.summary) ||
      !cleanString(ability.mechanics) ||
      !cleanString(ability.counterplay)
    ) {
      issues.push(
        createIssue(
          "error",
          "mind-editorial-ability-copy",
          "Every Mind Graft ability requires title, summary, mechanics, and counterplay copy.",
          `abilities[${index}]`,
        ),
      );
    }
    if (ability.rules?.parity?.status !== "verified") {
      issues.push(
        createIssue(
          "error",
          "mind-editorial-parity-status",
          "Every Mind Graft ability must carry verified structured-rule parity.",
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
        "mind-editorial-counterplay",
        "A publishable Mind Graft must expose telegraph, positioning, break-condition, and non-damage counterplay.",
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
        createIssue(
          "error",
          "mind-editorial-profile",
          `Mind Graft is missing ${field}.`,
          field,
        ),
      );
    }
  });

  return counterplayChannels;
}

function checkScaling(graft, snapshots, issues) {
  const declared = asArray(graft.progression?.bands).length > 0;
  const expected = MONSTER_MIND_GRAFT_SCALED_IDS.includes(graft.id);
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
        "mind-editorial-scaling",
        "Mind Graft CR progression does not match the approved editorial scaling plan.",
        "progression",
        {
          expected,
          declared,
          sampledBandIds,
          sampledRuleVariants,
        },
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

export function isMonsterMindGraft(graft = {}) {
  return cleanString(graft.slot) === "mind";
}

export function buildMonsterMindGraftEditorialReport(
  graft = {},
  options = {},
) {
  if (!isMonsterMindGraft(graft)) {
    return {
      version: MONSTER_MIND_GRAFT_EDITORIAL_AUDIT_VERSION,
      applicable: false,
      id: graft.id || null,
      status: "not-applicable",
      pass: true,
      issues: [],
    };
  }

  const checkpoints =
    options.checkpoints || MONSTER_MIND_GRAFT_EDITORIAL_CR_CHECKPOINTS;
  const issues = [];
  const schema = validateMonsterGraftV2(graft);
  issues.push(...schema.issues);

  if (!MONSTER_MIND_GRAFT_EDITORIAL_IDS.includes(graft.id)) {
    issues.push(
      createIssue(
        "error",
        "mind-editorial-unreviewed-id",
        `Unexpected Mind Graft ${graft.id} has not been through the approved editorial review.`,
        "id",
      ),
    );
  }
  if (graft.kind !== "traitBundle") {
    issues.push(
      createIssue(
        "error",
        "mind-editorial-kind",
        "Mind Grafts must use the traitBundle contract.",
        "kind",
      ),
    );
  }
  if (!graft.fit || typeof graft.fit !== "object") {
    issues.push(
      createIssue(
        "error",
        "mind-editorial-fit",
        "Mind Graft requires an explicit Monster Frame fit profile.",
        "fit",
      ),
    );
  }

  checkIdentity(graft, issues);
  checkEditorialDecision(graft, issues);
  checkAbilities(graft, issues);
  const counterplayChannels = checkProfiles(graft, issues);

  const snapshots = checkpoints.map((targetCr) =>
    buildCrSnapshot(graft, targetCr),
  );
  if (
    snapshots.some(
      (snapshot) =>
        snapshot.validationStatus === "error" ||
        snapshot.validationErrors.length > 0 ||
        snapshot.abilityCount < 1 ||
        !snapshot.parityPass,
    )
  ) {
    issues.push(
      createIssue(
        "error",
        "mind-editorial-runtime",
        "At least one CR projection fails bundle compilation or structured-rule parity.",
        "progression",
        snapshots,
      ),
    );
  }

  const scaling = checkScaling(graft, snapshots, issues);
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return {
    version: MONSTER_MIND_GRAFT_EDITORIAL_AUDIT_VERSION,
    applicable: true,
    id: graft.id,
    title: graft.title,
    source: graft.sourceAnchors?.[0] || graft.source || null,
    slot: graft.slot,
    kind: graft.kind,
    decision: graft.editorial?.decision || null,
    rationale: graft.editorial?.rationale || "",
    status: errors.length ? "error" : warnings.length ? "warning" : "pass",
    pass: errors.length === 0,
    abilityCount: asArray(graft.abilities).length,
    abilityIds: asArray(graft.abilities).map((ability) => ability.id),
    counterplayChannels,
    scaling,
    snapshots,
    issues,
    errors,
    warnings,
  };
}

export function buildMonsterMindGraftEditorialCatalogAudit(
  grafts = [],
  options = {},
) {
  const reports = asArray(grafts)
    .filter(isMonsterMindGraft)
    .map((graft) => buildMonsterMindGraftEditorialReport(graft, options));
  const issues = reports.flatMap((report) =>
    report.issues.map((issue) => ({ graftId: report.id, ...issue })),
  );
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  const normalizedIdentityFields = reports.flatMap((report) => {
    const graft = asArray(grafts).find((entry) => entry.id === report.id) || {};
    return [
      ["fantasy", cleanString(graft.identity?.fantasy).toLowerCase()],
      ["signature", cleanString(graft.identity?.signature).toLowerCase()],
    ].map(([field, value]) => ({ graftId: report.id, field, value }));
  });
  const duplicateIdentityFields = normalizedIdentityFields.filter(
    (entry, index, values) =>
      entry.value &&
      values.findIndex(
        (candidate) =>
          candidate.field === entry.field && candidate.value === entry.value,
      ) !== index,
  );
  duplicateIdentityFields.forEach((entry) => {
    errors.push(
      createIssue(
        "error",
        "mind-editorial-duplicate-identity",
        `Mind Graft ${entry.graftId} duplicates another ${entry.field}.`,
        `identity.${entry.field}`,
      ),
    );
  });

  const byDecision = reports.reduce((acc, report) => {
    const decision = report.decision || "UNREVIEWED";
    acc[decision] = (acc[decision] || 0) + 1;
    return acc;
  }, {});
  const bySource = reports.reduce((acc, report) => {
    const source = report.source || "unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const pass =
    reports.length === MONSTER_MIND_GRAFT_EDITORIAL_IDS.length &&
    reports.every((report) => report.pass) &&
    errors.length === 0;

  return {
    version: MONSTER_MIND_GRAFT_EDITORIAL_AUDIT_VERSION,
    editorialVersion: MONSTER_MIND_GRAFT_EDITORIAL_VERSION,
    total: reports.length,
    expectedTotal: MONSTER_MIND_GRAFT_EDITORIAL_IDS.length,
    passing: reports.filter((report) => report.pass).length,
    warning: reports.filter((report) => report.status === "warning").length,
    error: reports.filter((report) => report.status === "error").length,
    abilityCount: reports.reduce(
      (total, report) => total + report.abilityCount,
      0,
    ),
    bundleCount: reports.filter((report) => report.abilityCount > 1).length,
    scaledCount: reports.filter((report) => report.scaling.declared).length,
    byDecision,
    bySource,
    reports,
    issues,
    warnings,
    errors,
    pass,
  };
}
