import {
  cleanText,
  createIssue,
  deepFreeze,
  normalizeInteger,
} from "./contract-utils.js";
import { SEMANTIC_SCHEMA_VERSIONS } from "./schema-versions.js";

export const INTRUSION_TIERS = Object.freeze([
  "low",
  "medium",
  "high",
  "extreme",
]);

export const MECHANICAL_SCALING_PROFILES = deepFreeze({
  intrusion: {
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.MECHANICAL_SCALING,
    id: "intrusion",
    tiers: {
      low: { dc: 12, damage: "1d4" },
      medium: { dc: 14, damage: "1d6" },
      high: { dc: 16, damage: "2d6" },
      extreme: { dc: 18, damage: "3d6" },
    },
  },
});

export function normalizeScalingTier(value = "medium") {
  const tier = cleanText(value).toLowerCase();
  return INTRUSION_TIERS.includes(tier) ? tier : "medium";
}

export function getMechanicalScalingProfile(profileId = "intrusion") {
  return (
    MECHANICAL_SCALING_PROFILES[cleanText(profileId).toLowerCase()] || null
  );
}

export function resolveMechanicalScaling({
  profileId = "intrusion",
  tier = "medium",
  dc,
  damage,
} = {}) {
  const profile = getMechanicalScalingProfile(profileId);
  const normalizedTier = normalizeScalingTier(tier);
  const scaled = profile?.tiers?.[normalizedTier] || {};

  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.MECHANICAL_SCALING,
    profileId: profile?.id || cleanText(profileId),
    tier: normalizedTier,
    dc: Number.isFinite(Number(dc))
      ? normalizeInteger(dc, scaled.dc || 0, { min: 0, max: 99 })
      : scaled.dc || 0,
    damage: cleanText(damage) || cleanText(scaled.damage),
  });
}

export function validateScalingReference(profileId, path = "scalingKey") {
  if (!cleanText(profileId)) return [];
  if (getMechanicalScalingProfile(profileId)) return [];
  return [
    createIssue({
      code: "scaling.unknown-profile",
      path,
      message: `Unknown mechanical scaling profile: ${cleanText(profileId)}.`,
    }),
  ];
}
