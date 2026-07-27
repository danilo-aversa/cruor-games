import { getComplexityLimitForFrame, getPressureLimitForFrame } from "./monster-pressure-complexity.js";
export const MONSTER_FRAME_POWER_VERSION = "frame-power-normalization-v1.25-pressure-complexity-v3";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function idOf(value, fallback = "normal") {
  return String(value?.id || value || fallback);
}

function isBossRole(roleId) {
  return idOf(roleId, "standard") === "boss";
}

function isMinionRole(roleId) {
  return idOf(roleId, "standard") === "minion";
}

function isHighTier(tierId) {
  return ["boss", "legendary", "setpiece"].includes(idOf(tierId));
}

function tierHpBonus(tierId) {
  switch (idOf(tierId)) {
    case "elite": return 0.26;
    case "boss": return 0.42;
    case "legendary": return 0.48;
    case "setpiece": return 0.36;
    default: return 0;
  }
}

function tierDprBonus(tierId) {
  switch (idOf(tierId)) {
    case "elite": return 0.08;
    case "boss": return 0.12;
    case "legendary": return 0.26;
    case "setpiece": return 0.06;
    default: return 0;
  }
}

function tierBudgetBonus(tierId) {
  switch (idOf(tierId)) {
    case "elite": return 2;
    case "boss": return 4;
    case "legendary": return 5;
    case "setpiece": return 5;
    default: return 0;
  }
}

function roleHpBase(roleId, targetCr = 0) {
  switch (idOf(roleId, "standard")) {
    case "minion": {
      const cr = Number(targetCr || 0);
      if (cr >= 11) return 0.72;
      if (cr >= 5) return 0.62;
      return 0.45;
    }
    case "boss": return 1.42;
    default: return 1;
  }
}

function roleDprBase(roleId, targetCr = 0) {
  switch (idOf(roleId, "standard")) {
    case "minion": {
      const cr = Number(targetCr || 0);
      if (cr >= 11) return 0.9;
      if (cr >= 5) return 0.84;
      return 0.75;
    }
    case "boss": return 1.07;
    default: return 1;
  }
}

function roleBudgetBase(roleId) {
  switch (idOf(roleId, "standard")) {
    case "minion": return 7;
    case "boss": return 16;
    default: return 12;
  }
}

function dangerDprBonus(dangerId) {
  switch (idOf(dangerId, "hard")) {
    case "standard": return 0;
    case "horror": return 0.12;
    default: return 0.07;
  }
}

function dangerBudgetBonus(dangerId) {
  switch (idOf(dangerId, "hard")) {
    case "standard": return 0;
    case "horror": return 3;
    default: return 2;
  }
}

function tempoDprBonus(tempoId) {
  switch (idOf(tempoId, "standard")) {
    case "slow": return -0.08;
    case "fast": return 0.04;
    case "ambusher": return 0.07;
    case "legendary": return 0.12;
    default: return 0;
  }
}

function tempoBudgetBonus(tempoId) {
  switch (idOf(tempoId, "standard")) {
    case "slow": return -1;
    case "fast": return 1;
    case "ambusher": return 1;
    case "legendary": return 2;
    default: return 0;
  }
}

function getHpCap(targetCr, roleId, tierId) {
  if (isMinionRole(roleId)) {
    const cr = Number(targetCr || 0);
    if (cr >= 11) return 1;
    if (cr >= 5) return 0.9;
    return 0.65;
  }
  if (Number(targetCr || 0) <= 4) return isBossRole(roleId) || isHighTier(tierId) ? 1.5 : 1.38;
  if (Number(targetCr || 0) <= 10) return isBossRole(roleId) || isHighTier(tierId) ? 1.7 : 1.52;
  return isBossRole(roleId) || isHighTier(tierId) ? 1.85 : 1.65;
}

function getDprCap(targetCr, roleId, tierId) {
  if (isMinionRole(roleId)) {
    const cr = Number(targetCr || 0);
    if (cr >= 11) return 1.08;
    if (cr >= 5) return 1;
    return 0.92;
  }
  if (Number(targetCr || 0) <= 4) return isBossRole(roleId) || isHighTier(tierId) ? 1.38 : 1.28;
  if (Number(targetCr || 0) <= 10) return isBossRole(roleId) || isHighTier(tierId) ? 1.55 : 1.4;
  return isBossRole(roleId) || isHighTier(tierId) ? 1.7 : 1.5;
}

function getBudgetCap(targetCr, roleId, tierId) {
  if (isMinionRole(roleId)) return 8;
  if (Number(targetCr || 0) <= 4) return isBossRole(roleId) || isHighTier(tierId) ? 16 : 14;
  if (Number(targetCr || 0) <= 10) return isBossRole(roleId) || isHighTier(tierId) ? 20 : 17;
  return isBossRole(roleId) || isHighTier(tierId) ? 23 : 19;
}

function capWithDiagnostic(value, cap, diagnostics, code, message, detail, severity = "warning") {
  if (value <= cap + 0.001) return value;
  diagnostics.push({ severity, code, message, detail: `${round(value)} capped to ${round(cap)}${detail ? `. ${detail}` : ""}` });
  return cap;
}

export function buildMonsterFramePowerProfile({
  role,
  tacticalRole,
  monsterTier,
  tempoProfile,
  danger,
  targetCr,
} = {}) {
  const roleId = idOf(role, "standard");
  const tacticalRoleId = idOf(tacticalRole, "brute");
  const monsterTierId = idOf(monsterTier, "normal");
  const tempoProfileId = idOf(tempoProfile, "standard");
  const dangerId = idOf(danger, "hard");
  const diagnostics = [];
  const bossRole = isBossRole(roleId);
  const highTier = isHighTier(monsterTierId);
  const tierStackFactor = bossRole ? 0.35 : 1;
  const tacticalHpDelta = (Number(tacticalRole?.hpMult || 1) - 1) * 0.65;
  const tacticalDprDelta = (Number(tacticalRole?.dprMult || 1) - 1) * 0.65;

  if (bossRole && highTier) {
    diagnostics.push({
      severity: "warning",
      code: "frame-power-stack/high-tier-boss",
      message: "Boss role and high monster tier are overlapping power axes; tier bonuses are dampened instead of fully stacked.",
      detail: `${roleId} + ${monsterTierId}`,
    });
  }

  if (Number(targetCr || 0) <= 4 && ["legendary", "setpiece"].includes(monsterTierId)) {
    diagnostics.push({
      severity: "warning",
      code: "frame-power-stack/low-cr-high-tier",
      message: "Low-CR Legendary/Setpiece frames are capped heavily and should usually be avoided outside Stress QA.",
      detail: `CR ${targetCr}, tier ${monsterTierId}`,
    });
  }

  let hpMult = roleHpBase(roleId, targetCr) + tierHpBonus(monsterTierId) * tierStackFactor + tacticalHpDelta;
  let dprMult = roleDprBase(roleId, targetCr) + tierDprBonus(monsterTierId) * tierStackFactor + tacticalDprDelta + dangerDprBonus(dangerId) + tempoDprBonus(tempoProfileId);
  const hpCap = getHpCap(targetCr, roleId, monsterTierId);
  const dprCap = getDprCap(targetCr, roleId, monsterTierId);
  hpMult = capWithDiagnostic(hpMult, hpCap, diagnostics, "frame-power-stack/capped-hp-multiplier", "Frame HP multiplier was capped to keep the printed stat block near target CR.");
  dprMult = capWithDiagnostic(dprMult, dprCap, diagnostics, "frame-power-stack/capped-dpr-multiplier", "Frame DPR multiplier was capped to keep the printed stat block near target CR.");

  const rawBudget = roleBudgetBase(roleId) + dangerBudgetBonus(dangerId) + Math.max(-1, Math.min(2, Number(tacticalRole?.budgetMod || 0))) + tierBudgetBonus(monsterTierId) * (bossRole ? 0.4 : 1) + tempoBudgetBonus(tempoProfileId);
  const budgetCap = getBudgetCap(targetCr, roleId, monsterTierId);
  const budget = Math.round(capWithDiagnostic(rawBudget, budgetCap, diagnostics, "frame-power-stack/capped-budget", "Frame graft budget was capped to avoid overfilling high-power builds.", "", "info"));

  const pressureLimit = getPressureLimitForFrame({
    targetCr,
    roleId,
    monsterTierId,
  });
  const complexityCap = getComplexityLimitForFrame({
    roleId,
    monsterTierId,
    tempoProfileId,
  });

  const acMod = Math.round(clamp(Number(monsterTier?.acMod || 0) + Number(tacticalRole?.acMod || 0), -1, Number(targetCr || 0) <= 4 ? 1 : 2));
  const attackMod = Math.round(clamp(Number(tacticalRole?.attackMod || 0) + Number(tempoProfile?.attackMod || 0), 0, Number(targetCr || 0) <= 4 ? 1 : 2));
  const dcMod = Math.round(clamp(Number(tacticalRole?.dcMod || 0), 0, 1));
  const pressureMod = Math.round(clamp(Number(monsterTier?.pressureMod || 0) * (bossRole ? 0.65 : 1) + Number(tempoProfile?.pressureMod || 0), -2, 7));

  return {
    version: MONSTER_FRAME_POWER_VERSION,
    roleId,
    tacticalRoleId,
    monsterTierId,
    tempoProfileId,
    dangerId,
    targetCr: Number(targetCr || 0),
    baselineTierId: "normal",
    hpMult: round(hpMult),
    dprMult: round(dprMult),
    acMod,
    attackMod,
    dcMod,
    buildBudget: Math.max(1, budget),
    budget: Math.max(1, budget),
    pressureLimit: Math.max(1, pressureLimit),
    complexityCap: Math.max(1, complexityCap),
    pressureMod,
    diagnostics,
    raw: {
      hpMult: round(roleHpBase(roleId, targetCr) + tierHpBonus(monsterTierId) * tierStackFactor + tacticalHpDelta),
      dprMult: round(roleDprBase(roleId, targetCr) + tierDprBonus(monsterTierId) * tierStackFactor + tacticalDprDelta + dangerDprBonus(dangerId) + tempoDprBonus(tempoProfileId)),
      buildBudget: round(rawBudget),
      budget: round(rawBudget),
      pressureLimit,
      complexityCap,
      tierStackFactor,
    },
  };
}

export function getMonsterFramePowerDiagnostics(profile = {}) {
  return Array.isArray(profile.diagnostics) ? profile.diagnostics : [];
}

export function isMonsterFrameHighPowerStack(profileOrFrame = {}) {
  const roleId = idOf(profileOrFrame.roleId || profileOrFrame.role, "standard");
  const tierId = idOf(profileOrFrame.monsterTierId || profileOrFrame.monsterTier, "normal");
  return isBossRole(roleId) && isHighTier(tierId);
}
