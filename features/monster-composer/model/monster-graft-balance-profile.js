export const MONSTER_GRAFT_BALANCE_PROFILE_VERSION = "monster-graft-balance-v1.0";

export const MONSTER_GRAFT_BALANCE_KEYS = Object.freeze([
  "hp",
  "dpr",
  "ac",
  "control",
  "mobility",
  "fairness",
]);

const DEFAULT_BALANCE_STATS = Object.freeze({
  hp: 0,
  dpr: 0,
  ac: 0,
  control: 0,
  mobility: 0,
  fairness: 0,
});

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeStatsMap(stats = {}) {
  return MONSTER_GRAFT_BALANCE_KEYS.reduce((acc, key) => {
    acc[key] = toNumber(stats?.[key], 0);
    return acc;
  }, {});
}

function getConfiguredBalanceProfile(feature = {}) {
  if (isPlainObject(feature.balanceProfile)) return feature.balanceProfile;
  if (isPlainObject(feature.balance)) return feature.balance;
  if (isPlainObject(feature.monster?.balanceProfile)) return feature.monster.balanceProfile;
  if (isPlainObject(feature.monster?.balance)) return feature.monster.balance;
  return null;
}

function getLegacyStats(feature = {}) {
  if (isPlainObject(feature.stats)) return feature.stats;
  if (isPlainObject(feature.monster?.stats)) return feature.monster.stats;
  return {};
}

export function getMonsterGraftBalanceProfile(feature = {}) {
  const configured = getConfiguredBalanceProfile(feature);
  const legacyStats = getLegacyStats(feature);
  const configuredStats = isPlainObject(configured?.stats) ? configured.stats : configured;
  const stats = normalizeStatsMap(isPlainObject(configuredStats) ? configuredStats : legacyStats);
  const hasConfiguredProfile = Boolean(configured);
  const hasLegacyStats = Object.keys(legacyStats).some((key) => MONSTER_GRAFT_BALANCE_KEYS.includes(key));

  return {
    schemaVersion: MONSTER_GRAFT_BALANCE_PROFILE_VERSION,
    source: hasConfiguredProfile ? "balanceProfile" : hasLegacyStats ? "legacyStats" : "empty",
    migratedFrom: hasConfiguredProfile ? null : hasLegacyStats ? "feature.stats" : null,
    stats: { ...DEFAULT_BALANCE_STATS, ...stats },
    legacyStats: { ...legacyStats },
  };
}

export function getFeatureBalanceStats(feature = {}) {
  return getMonsterGraftBalanceProfile(feature).stats;
}

export function getFeatureBalanceStat(feature = {}, key, fallback = 0) {
  if (!MONSTER_GRAFT_BALANCE_KEYS.includes(key)) return fallback;
  return toNumber(getFeatureBalanceStats(feature)[key], fallback);
}

export function getFeatureBalanceEntries(feature = {}) {
  return Object.entries(getFeatureBalanceStats(feature)).filter(([, value]) => Number(value || 0) !== 0);
}

export function sumFeatureBalanceStats(features = []) {
  return features.reduce(
    (acc, feature) => {
      const stats = getFeatureBalanceStats(feature);
      MONSTER_GRAFT_BALANCE_KEYS.forEach((key) => {
        acc[key] = toNumber(acc[key], 0) + toNumber(stats[key], 0);
      });
      return acc;
    },
    { ...DEFAULT_BALANCE_STATS },
  );
}

export function hasLegacyMonsterStats(feature = {}) {
  return getMonsterGraftBalanceProfile(feature).source === "legacyStats";
}

export function buildLegacyStatsMigrationAudit(features = []) {
  const rows = features.map((feature) => {
    const profile = getMonsterGraftBalanceProfile(feature);
    const nonZeroStats = Object.entries(profile.stats)
      .filter(([, value]) => Number(value || 0) !== 0)
      .map(([key]) => key);
    return {
      id: feature.id,
      title: feature.title,
      slot: feature.slot,
      source: feature.source,
      profileSource: profile.source,
      migratedFrom: profile.migratedFrom,
      nonZeroStats,
    };
  });

  return {
    schemaVersion: MONSTER_GRAFT_BALANCE_PROFILE_VERSION,
    total: rows.length,
    usingLegacyStats: rows.filter((row) => row.profileSource === "legacyStats").length,
    usingBalanceProfile: rows.filter((row) => row.profileSource === "balanceProfile").length,
    empty: rows.filter((row) => row.profileSource === "empty").length,
    byStat: Object.fromEntries(
      MONSTER_GRAFT_BALANCE_KEYS.map((key) => [
        key,
        rows.filter((row) => row.nonZeroStats.includes(key)).length,
      ]),
    ),
    rows,
  };
}
