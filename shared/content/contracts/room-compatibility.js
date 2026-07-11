import { normalizeRoomCapabilityIds } from "./room-capabilities.js";

export const ROOM_COMPATIBILITY_SCHEMA_VERSION = "room-compatibility-v1";

export const ROOM_COMPATIBILITY_STATUSES = Object.freeze([
  "compatible",
  "transforms-room",
  "warning",
  "incompatible",
  "unsupported",
]);

export const ROOM_COMPATIBILITY_CONFLICT_POLICIES = Object.freeze([
  "block",
  "replace",
  "warn",
]);

export const ROOM_CONFLICT_REASON_CODES = Object.freeze([
  "ROOM_SHAPE_REQUIRED_CONFLICT",
  "ROOM_SHAPE_UNREGISTERED",
  "ROOM_SHAPE_FORBIDDEN",
  "ROOM_SIZE_RANGE_EMPTY",
  "ROOM_AREA_RANGE_EMPTY",
  "ROOM_MODIFIER_CONFLICT",
  "ROOM_SHAPE_MODIFIER_UNSUPPORTED",
  "ROOM_PROP_CAPACITY_EXCEEDED",
  "ROOM_TOPOLOGY_CONFLICT",
  "ROOM_EXCLUSIVE_GROUP_CONFLICT",
  "ROOM_REQUIRED_CAPABILITY_MISSING",
  "ROOM_FORBIDDEN_CAPABILITY_PRESENT",
  "ROOM_REQUIRED_COMPONENT_TAG_MISSING",
  "ROOM_FORBIDDEN_COMPONENT_TAG_PRESENT",
  "ROOM_ARCHETYPE_CONFLICT",
  "ROOM_MANUAL_OVERRIDE_CONFLICT",
]);

const ROOM_COMPATIBILITY_CONFLICT_POLICY_SET = new Set(
  ROOM_COMPATIBILITY_CONFLICT_POLICIES,
);

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeRuleToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeRuleTokens(values = []) {
  return [...new Set(asArray(values).map(normalizeRuleToken).filter(Boolean))];
}

export function normalizeRoomConflictPolicy(value = "block") {
  const normalized = normalizeRuleToken(value);
  return ROOM_COMPATIBILITY_CONFLICT_POLICY_SET.has(normalized)
    ? normalized
    : "block";
}

export function normalizeRoomCompatibility(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const exclusiveGroups = normalizeRuleTokens(value.exclusiveGroups);
  const requiresComponentTags = normalizeRuleTokens(
    value.requiresComponentTags,
  );
  const forbidsComponentTags = normalizeRuleTokens(value.forbidsComponentTags);
  const requiresCapabilities = normalizeRoomCapabilityIds(
    value.requiresCapabilities,
  );
  const forbidsCapabilities = normalizeRoomCapabilityIds(
    value.forbidsCapabilities,
  );

  const hasRules = Boolean(
    exclusiveGroups.length ||
    requiresComponentTags.length ||
    forbidsComponentTags.length ||
    requiresCapabilities.length ||
    forbidsCapabilities.length,
  );
  if (!hasRules) return null;

  return {
    schemaVersion: ROOM_COMPATIBILITY_SCHEMA_VERSION,
    ...(exclusiveGroups.length ? { exclusiveGroups } : {}),
    ...(requiresComponentTags.length ? { requiresComponentTags } : {}),
    ...(forbidsComponentTags.length ? { forbidsComponentTags } : {}),
    ...(requiresCapabilities.length ? { requiresCapabilities } : {}),
    ...(forbidsCapabilities.length ? { forbidsCapabilities } : {}),
    conflictPolicy: normalizeRoomConflictPolicy(value.conflictPolicy),
  };
}
