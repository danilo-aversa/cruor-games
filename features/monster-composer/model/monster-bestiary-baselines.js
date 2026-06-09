export const BESTIARY_BASELINE_VERSION = "mm2024-derived-v0.2";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(Number(value || 0));
}

export function getExpectedAttackBonus(cr) {
  return round(3.5 + Number(cr || 0) / 2);
}

export function getExpectedSaveDc(cr) {
  return round(11.5 + Number(cr || 0) / 2);
}

export function getExpectedAc(cr) {
  return round(13 + Number(cr || 0) / 3);
}

export function getExpectedAverageSaveBonus(cr) {
  return round(1 + Number(cr || 0) / 3);
}

export function getExpectedHp(cr) {
  const numericCr = Number(cr || 0);
  return numericCr < 20 ? round(16 + 16 * numericCr) : round(368 + 48 * (numericCr - 20));
}

export function getExpectedDpr(cr, { legendaryLike = false } = {}) {
  const numericCr = Number(cr || 0);
  if (numericCr < 20) return round((legendaryLike ? 7.5 : 6) + (legendaryLike ? 7.5 : 6) * numericCr);
  return round((legendaryLike ? 165 : 132) + (legendaryLike ? 15 : 12) * (numericCr - 20));
}

export function getBestiaryBaselineProfile(cr, { legendaryLike = false } = {}) {
  return {
    version: BESTIARY_BASELINE_VERSION,
    cr: Number(cr || 0),
    legendaryLike,
    ac: getExpectedAc(cr),
    hp: getExpectedHp(cr),
    dpr: getExpectedDpr(cr, { legendaryLike }),
    attackBonus: getExpectedAttackBonus(cr),
    saveDc: getExpectedSaveDc(cr),
    averageSaveBonus: getExpectedAverageSaveBonus(cr),
  };
}

export function isLegendaryLikeTier(tierId) {
  return ["boss", "legendary", "setpiece"].includes(tierId);
}

export function getMonsterComposerBaselineProfile(cr, tierId = "normal", monsterTiers = []) {
  const tier = monsterTiers.find((item) => item.id === tierId) || monsterTiers[0] || {
    hpMult: 1,
    dprMult: 1,
  };
  const legendaryLike = isLegendaryLikeTier(tierId);
  const bestiaryBaseline = getBestiaryBaselineProfile(cr, { legendaryLike });

  return {
    ...bestiaryBaseline,
    tierId,
    ac: bestiaryBaseline.ac,
    hp: Math.max(1, Math.round(bestiaryBaseline.hp * (tier.hpMult || 1))),
    dpr: Math.max(1, Math.round(bestiaryBaseline.dpr * (legendaryLike ? 1 : tier.dprMult || 1))),
    attackBonus: bestiaryBaseline.attackBonus,
    saveDc: bestiaryBaseline.saveDc,
  };
}

export function buildMonsterComposerProfileDeltas(printedStats, effectiveProfile, baseline) {
  return {
    acDelta: printedStats.ac - baseline.ac,
    hpDelta: printedStats.hp - baseline.hp,
    dprDelta: printedStats.dpr - baseline.dpr,
    effectiveDprDelta: effectiveProfile.effectiveDpr3Round - baseline.dpr,
    attackDelta: printedStats.attackBonus - baseline.attackBonus,
    dcDelta: printedStats.saveDc - baseline.saveDc,
  };
}

function ratioDelta(actual, expected) {
  if (!expected) return 0;
  return (Number(actual || 0) - Number(expected || 0)) / expected;
}

function bandRatio(delta) {
  if (delta >= 0.35) return "high";
  if (delta >= 0.18) return "elevated";
  if (delta <= -0.35) return "low";
  if (delta <= -0.18) return "reduced";
  return "aligned";
}

function pushIf(issues, condition, severity, code, message, detail) {
  if (condition) issues.push({ severity, code, message, detail });
}

export function buildBestiaryBaselineAudit({
  targetCr,
  monsterTier,
  printedStats,
  effectiveProfile,
  mechanicsSummary,
}) {
  const legendaryLike = ["boss", "legendary", "setpiece"].includes(monsterTier?.id);
  const baseline = getBestiaryBaselineProfile(targetCr, { legendaryLike });
  const deltas = {
    ac: printedStats.ac - baseline.ac,
    hpRatio: ratioDelta(printedStats.hp, baseline.hp),
    dprRatio: ratioDelta(printedStats.dpr, baseline.dpr),
    effectiveDprRatio: ratioDelta(effectiveProfile.effectiveDpr3Round, baseline.dpr),
    attack: printedStats.attackBonus - baseline.attackBonus,
    dc: printedStats.saveDc - baseline.saveDc,
  };
  const issues = [];

  pushIf(
    issues,
    deltas.effectiveDprRatio > 0.35,
    "warning",
    "effective-dpr-above-bestiary-baseline",
    "Effective 3-round DPR is above the 2024-derived baseline.",
    `${effectiveProfile.effectiveDpr3Round} vs ${baseline.dpr}`,
  );
  pushIf(
    issues,
    deltas.hpRatio > 0.45 && !legendaryLike,
    "warning",
    "hp-above-normal-bestiary-baseline",
    "Printed HP is above the normal bestiary baseline for this CR.",
    `${printedStats.hp} vs ${baseline.hp}`,
  );
  pushIf(
    issues,
    deltas.attack > 2,
    "warning",
    "attack-above-bestiary-baseline",
    "Attack bonus is more than +2 above the expected bestiary baseline.",
    `${printedStats.attackBonus} vs ${baseline.attackBonus}`,
  );
  pushIf(
    issues,
    deltas.dc > 2,
    "warning",
    "dc-above-bestiary-baseline",
    "Save DC is more than +2 above the expected bestiary baseline.",
    `${printedStats.saveDc} vs ${baseline.saveDc}`,
  );
  pushIf(
    issues,
    mechanicsSummary?.reactionCount >= 2 && !legendaryLike,
    "warning",
    "off-turn-load-above-normal-profile",
    "Multiple reactions/off-turn hooks are usually boss-like and should be reviewed for action economy.",
    `${mechanicsSummary.reactionCount} reactions`,
  );
  pushIf(
    issues,
    mechanicsSummary?.majorConditionCount >= 2 && mechanicsSummary?.rechargeCount >= 1,
    "warning",
    "control-and-recharge-stack",
    "Recharge pressure plus multiple major conditions can exceed printed CR expectations.",
    `${mechanicsSummary.majorConditionCount} major conditions; ${mechanicsSummary.rechargeCount} recharge abilities`,
  );

  return {
    version: BESTIARY_BASELINE_VERSION,
    baseline,
    deltas,
    bands: {
      hp: bandRatio(deltas.hpRatio),
      dpr: bandRatio(deltas.dprRatio),
      effectiveDpr: bandRatio(deltas.effectiveDprRatio),
      ac: Math.abs(deltas.ac) <= 1 ? "aligned" : deltas.ac > 1 ? "elevated" : "reduced",
      attack: Math.abs(deltas.attack) <= 1 ? "aligned" : deltas.attack > 1 ? "elevated" : "reduced",
      dc: Math.abs(deltas.dc) <= 1 ? "aligned" : deltas.dc > 1 ? "elevated" : "reduced",
    },
    score: clamp(
      round(
        100 -
          Math.abs(deltas.hpRatio) * 22 -
          Math.abs(deltas.effectiveDprRatio) * 28 -
          Math.abs(deltas.ac) * 4 -
          Math.abs(deltas.attack) * 5 -
          Math.abs(deltas.dc) * 5,
      ),
      0,
      100,
    ),
    issues,
  };
}
