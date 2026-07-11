export const ROOM_CAPABILITIES_SCHEMA_VERSION = "room-capabilities-v1";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

export function normalizeRoomCapabilityId(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeRoomCapabilityIds(values = []) {
  return [
    ...new Set(asArray(values).map(normalizeRoomCapabilityId).filter(Boolean)),
  ];
}

export function createRoomCapabilitySet(values = []) {
  return new Set(normalizeRoomCapabilityIds(values));
}

export function hasRoomCapability(capabilities = [], capability = "") {
  const normalized = normalizeRoomCapabilityId(capability);
  if (!normalized) return false;
  const set =
    capabilities instanceof Set
      ? capabilities
      : createRoomCapabilitySet(capabilities);
  return set.has(normalized);
}
