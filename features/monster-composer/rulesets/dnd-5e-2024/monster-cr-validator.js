import { getBestiaryBaselineProfile } from "../../model/monster-bestiary-baselines.js";

export const MONSTER_CR_VALIDATOR_VERSION = "offensive-defensive-cr-v0.1";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(Number(value || 0));
}

function ratio(value, baseline) {
  return baseline ? Number(value || 0) / baseline : 0;
}

function closestCrByMetric(value, metric, { legendaryLike = false } = {}) {
  let best = { cr: 0, value: 0, delta: Infinity };
  for (let cr = 0; cr <= 30; cr += 1) {
    const baseline = getBestiaryBaselineProfile(cr, { legendaryLike });
    const metricValue = Math.max(1, Number(baseline[metric] || 1));
    const delta = Math.abs(Number(value || 0) - metricValue) / metricValue;
    if (delta < best.delta) best = { cr, value: metricValue, delta };
  }
  return best;
}

function adjustmentByTwoPointDelta(actual, expected, max = 4) {
  const delta = Number(actual || 0) - Number(expected || 0);
  if (Math.abs(delta) < 2) return 0;
  return clamp(Math.trunc(delta / 2), -max, max);
}

function buildIssue(severity, code, message, detail = "") {
  return { severity, code, message, detail };
}

function severityForDelta(delta) {
  const abs = Math.abs(delta);
  if (abs >= 4) return "critical";
  if (abs >= 3) return "high";
  if (abs >= 2) return "warning";
  return "info";
}

export function buildMonsterCrValidation({
  targetCr = 0,
  printedStats = {},
  effectiveProfile = {},
  monsterTier = {},
  mechanicsSummary = {},
} = {}) {
  const legendaryLike = ["boss", "legendary", "setpiece"].includes(monsterTier?.id);
  const hp = Math.max(1, Number(effectiveProfile.effectiveHp || printedStats.hp || 1));
  const ac = Number(effectiveProfile.effectiveAc || printedStats.ac || 10);
  const dpr = Math.max(1, Number(effectiveProfile.effectiveDpr3Round || printedStats.dpr || 1));
  const attackBonus = Number(effectiveProfile.effectiveAttackBonus || printedStats.attackBonus || 0);
  const saveDc = Number(effectiveProfile.effectiveSaveDc || printedStats.saveDc || 0);

  const defensiveBase = closestCrByMetric(hp, "hp", { legendaryLike });
  const defensiveBaseline = getBestiaryBaselineProfile(defensiveBase.cr, { legendaryLike });
  const defensiveAdjustment = adjustmentByTwoPointDelta(ac, defensiveBaseline.ac);
  const defensiveCr = clamp(defensiveBase.cr + defensiveAdjustment, 0, 30);

  const offensiveBase = closestCrByMetric(dpr, "dpr", { legendaryLike });
  const offensiveBaseline = getBestiaryBaselineProfile(offensiveBase.cr, { legendaryLike });
  const attackAdjustment = adjustmentByTwoPointDelta(attackBonus, offensiveBaseline.attackBonus);
  const dcAdjustment = adjustmentByTwoPointDelta(saveDc, offensiveBaseline.saveDc);
  const accuracyAdjustment = Math.max(attackAdjustment, dcAdjustment);
  const offensiveCr = clamp(offensiveBase.cr + accuracyAdjustment, 0, 30);

  const estimatedCr = clamp(round((defensiveCr + offensiveCr) / 2), 0, 30);
  const targetDelta = estimatedCr - Number(targetCr || 0);
  const issues = [];

  if (targetDelta >= 2) {
    issues.push(
      buildIssue(
        severityForDelta(targetDelta),
        "estimated-cr-above-target",
        "Estimated CR is above target after offensive and defensive validation.",
        `Estimated CR ${estimatedCr}; target CR ${targetCr}.`,
      ),
    );
  }

  if (targetDelta <= -2) {
    issues.push(
      buildIssue(
        severityForDelta(targetDelta),
        "estimated-cr-below-target",
        "Estimated CR is below target after offensive and defensive validation.",
        `Estimated CR ${estimatedCr}; target CR ${targetCr}.`,
      ),
    );
  }

  if (offensiveCr - defensiveCr >= 4) {
    issues.push(
      buildIssue(
        "warning",
        "offensive-defensive-cr-split",
        "Offensive CR is much higher than Defensive CR.",
        `Offensive CR ${offensiveCr}; Defensive CR ${defensiveCr}.`,
      ),
    );
  }

  if (defensiveCr - offensiveCr >= 4) {
    issues.push(
      buildIssue(
        "warning",
        "defensive-offensive-cr-split",
        "Defensive CR is much higher than Offensive CR.",
        `Defensive CR ${defensiveCr}; Offensive CR ${offensiveCr}.`,
      ),
    );
  }

  if (mechanicsSummary?.majorConditionCount >= 2 && dpr > getBestiaryBaselineProfile(targetCr, { legendaryLike }).dpr) {
    issues.push(
      buildIssue(
        "high",
        "control-plus-dpr-risk",
        "Major control plus above-baseline DPR can make the monster play above its printed CR.",
        `${mechanicsSummary.majorConditionCount} major conditions; DPR ${round(dpr)}.`,
      ),
    );
  }

  return {
    version: MONSTER_CR_VALIDATOR_VERSION,
    targetCr: Number(targetCr || 0),
    legendaryLike,
    defensive: {
      baseCr: defensiveBase.cr,
      baseMetric: "effectiveHp",
      value: round(hp),
      baselineValue: defensiveBase.value,
      ac,
      expectedAcAtBaseCr: defensiveBaseline.ac,
      acAdjustment: defensiveAdjustment,
      cr: defensiveCr,
      ratioToTargetBaseline: ratio(hp, getBestiaryBaselineProfile(targetCr, { legendaryLike }).hp),
    },
    offensive: {
      baseCr: offensiveBase.cr,
      baseMetric: "effectiveDpr3Round",
      value: round(dpr),
      baselineValue: offensiveBase.value,
      attackBonus,
      expectedAttackBonusAtBaseCr: offensiveBaseline.attackBonus,
      attackAdjustment,
      saveDc,
      expectedSaveDcAtBaseCr: offensiveBaseline.saveDc,
      dcAdjustment,
      accuracyAdjustment,
      cr: offensiveCr,
      ratioToTargetBaseline: ratio(dpr, getBestiaryBaselineProfile(targetCr, { legendaryLike }).dpr),
    },
    estimatedCr,
    deltaFromTarget: targetDelta,
    status: issues.some((issue) => ["critical", "high"].includes(issue.severity))
      ? "high-risk"
      : issues.length
        ? "warning"
        : "pass",
    issues,
  };
}
