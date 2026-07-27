
import { buildMonsterAbilityBundleFromGraft } from "./monster-ability-model.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";
import { buildMonsterRulesParityReport } from "./monster-rules-parity.js";
import {
  isMonsterGraftV2,
  validateMonsterGraftV2,
} from "./monster-graft-v2.schema.js";

export const MONSTER_SUPPORT_GRAFT_AUDIT_VERSION =
  "monster-support-graft-audit-v1.0";
export const MONSTER_SUPPORT_GRAFT_CR_CHECKPOINTS = Object.freeze([
  1, 5, 10, 15,
]);

const SUPPORT_SLOTS = new Set([
  "body",
  "mind",
  "movement",
  "horror",
  "twist",
  "weakness",
  "death",
  "lair",
]);

const EXPECTED_KIND_BY_SLOT = Object.freeze({
  body: "traitBundle",
  mind: "traitBundle",
  movement: "movementPattern",
  horror: "horrorFeature",
  twist: "combatTwist",
  weakness: "weakness",
  death: "deathEffect",
  lair: "lairEffect",
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
  path = "supportGraft",
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
    .filter(([, values]) => values.length)
    .map(([channel]) => channel);
}

function getRuleSignature(ability = {}) {
  const rules = ability.rules || {};
  return JSON.stringify({
    mechanics: ability.mechanics || "",
    usage: rules.usage || null,
    targeting: rules.targeting || null,
    defense: rules.defense || null,
    summon: rules.summon || null,
    procedure: rules.procedure || null,
    text: rules.text || null,
  });
}

function buildCrSnapshot(graft, targetCr) {
  const bundle = buildMonsterAbilityBundleFromGraft(graft, { targetCr });
  const authored = bundle.abilities.filter((ability) => !ability.synthetic);
  const parityReports = authored.map((ability) => {
    const renderedText = renderStructuredRulesText(ability, {
      attack: 5,
      dc: 13,
      dpr: 12,
      targetCr,
      category: "Zombie",
      categoryNoun: "zombie",
      rulesContext: { categoryNoun: "zombie" },
    });
    return buildMonsterRulesParityReport(ability, { renderedText });
  });
  return {
    targetCr,
    bandId: bundle.projection?.bandId || null,
    abilityCount: authored.length,
    abilityIds: authored.map((ability) => ability.localAbilityId),
    ruleSignatures: authored.map(getRuleSignature),
    targetingSizes: authored
      .map((ability) => Number(ability.rules?.targeting?.size))
      .filter(Number.isFinite),
    summonCounts: authored
      .map((ability) => cleanString(ability.rules?.summon?.count))
      .filter(Boolean),
    validationStatus: bundle.validation.status,
    validationErrors: bundle.validation.errors,
    parityPass: parityReports.every((report) => report.pass),
    parityErrors: parityReports.flatMap((report) => report.errors ? report.issues : []),
  };
}

export function isMonsterSupportGraft(graft = {}) {
  return Boolean(
    isMonsterGraftV2(graft) &&
      SUPPORT_SLOTS.has(cleanString(graft.slot)) &&
      cleanString(graft.kind) !== "attackPattern",
  );
}

export function buildMonsterSupportGraftReport(graft = {}, options = {}) {
  if (!isMonsterSupportGraft(graft)) {
    return {
      version: MONSTER_SUPPORT_GRAFT_AUDIT_VERSION,
      applicable: false,
      id: graft.id || null,
      status: "not-applicable",
      pass: true,
      issues: [],
    };
  }

  const checkpoints =
    options.checkpoints || MONSTER_SUPPORT_GRAFT_CR_CHECKPOINTS;
  const schema = validateMonsterGraftV2(graft);
  const snapshots = checkpoints.map((targetCr) =>
    buildCrSnapshot(graft, targetCr),
  );
  const issues = [...schema.issues];

  if (EXPECTED_KIND_BY_SLOT[graft.slot] !== graft.kind) {
    issues.push(
      createIssue(
        "error",
        "support-graft-kind-slot",
        `Slot ${graft.slot} requires ${EXPECTED_KIND_BY_SLOT[graft.slot]}, not ${graft.kind}.`,
        "kind",
      ),
    );
  }

  if (
    !cleanString(graft.identity?.fantasy) ||
    !cleanString(graft.identity?.tacticalRole) ||
    !cleanString(graft.identity?.signature) ||
    uniqueArray(graft.identity?.recognitionTags).length < 3
  ) {
    issues.push(
      createIssue(
        "error",
        "support-graft-identity",
        "Support graft identity is incomplete or not independently recognizable.",
        "identity",
      ),
    );
  }

  const counterplayChannels = getCounterplayChannels(
    graft.counterplayProfile,
  );
  if (counterplayChannels.length < 2) {
    issues.push(
      createIssue(
        "error",
        "support-graft-counterplay",
        "Support graft requires at least two counterplay channels.",
        "counterplayProfile",
      ),
    );
  }

  [
    ["balanceProfile", graft.balanceProfile],
    ["complexityProfile", graft.complexityProfile],
    ["spikeRiskProfile", graft.spikeRiskProfile],
  ].forEach(([field, value]) => {
    if (!value || typeof value !== "object") {
      issues.push(
        createIssue(
          "error",
          "support-graft-profile",
          `Support graft is missing ${field}.`,
          field,
        ),
      );
    }
  });

  if (
    snapshots.some(
      (snapshot) =>
        snapshot.validationStatus === "error" ||
        snapshot.validationErrors.length ||
        snapshot.abilityCount < 1 ||
        !snapshot.parityPass,
    )
  ) {
    issues.push(
      createIssue(
        "error",
        "support-graft-runtime",
        "One or more CR projections fail bundle compilation or verified renderer parity.",
        "progression",
        snapshots,
      ),
    );
  }

  const progressionBands = asArray(graft.progression?.bands);
  const uniqueBandIds = uniqueArray(
    snapshots.map((snapshot) => snapshot.bandId),
  );
  const uniqueRuleSignatures = new Set(
    snapshots.flatMap((snapshot) => snapshot.ruleSignatures),
  ).size;
  const scaling = {
    declared: progressionBands.length > 0,
    bandCount: progressionBands.length,
    sampledBandIds: uniqueBandIds,
    sampledRuleVariants: uniqueRuleSignatures,
    pass:
      !progressionBands.length ||
      (uniqueBandIds.length >= 2 && uniqueRuleSignatures >= 2),
  };
  if (!scaling.pass) {
    issues.push(
      createIssue(
        "error",
        "support-graft-scaling",
        "Declared CR scaling does not produce distinct compiled rule variants.",
        "progression.bands",
        scaling,
      ),
    );
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    version: MONSTER_SUPPORT_GRAFT_AUDIT_VERSION,
    applicable: true,
    id: graft.id,
    title: graft.title,
    source: graft.sourceAnchors?.[0] || graft.source || null,
    slot: graft.slot,
    kind: graft.kind,
    status: errors.length ? "error" : warnings.length ? "warning" : "pass",
    pass: errors.length === 0,
    identity: graft.identity,
    counterplayChannels,
    scaling,
    snapshots,
    parityStatuses: uniqueArray(
      asArray(graft.abilities).map(
        (ability) => ability.rules?.parity?.status || "unreviewed",
      ),
    ),
    migration: graft.migration,
    issues,
    errors,
    warnings,
  };
}

export function buildMonsterSupportGraftCatalogAudit(
  grafts = [],
  options = {},
) {
  const reports = asArray(grafts)
    .filter(isMonsterSupportGraft)
    .map((graft) => buildMonsterSupportGraftReport(graft, options));
  const issues = reports.flatMap((report) =>
    report.issues.map((issue) => ({
      graftId: report.id,
      ...issue,
    })),
  );
  const errors = issues.filter((issue) => issue.severity === "error");
  const bySlot = reports.reduce((acc, report) => {
    acc[report.slot] = (acc[report.slot] || 0) + 1;
    return acc;
  }, {});
  const bySource = reports.reduce((acc, report) => {
    const source = report.source || "unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  return {
    version: MONSTER_SUPPORT_GRAFT_AUDIT_VERSION,
    total: reports.length,
    passing: reports.filter((report) => report.pass).length,
    warning: reports.filter((report) => report.status === "warning").length,
    error: reports.filter((report) => report.status === "error").length,
    scaled: reports.filter((report) => report.scaling.declared).length,
    verifiedParity: reports.filter((report) =>
      report.parityStatuses.includes("verified"),
    ).length,
    candidateParity: reports.filter((report) =>
      report.parityStatuses.includes("candidate"),
    ).length,
    bySlot,
    bySource,
    reports,
    issues,
    errors,
    pass: reports.length === 78 && errors.length === 0,
  };
}
