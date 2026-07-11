import {
  ROOM_CONSTRAINT_RESOLVER_SCHEMA_VERSION,
  resolveRoomConstraints,
} from "../../../shared/content/contracts/room-constraint-resolver.js";

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function clonePlainObject(value) {
  return isPlainObject(value) ? JSON.parse(JSON.stringify(value)) : null;
}

function getAssignedComponentIds(components = []) {
  return [
    ...new Set(
      asArray(components)
        .map((component) =>
          String(component?.id || component?.componentId || ""),
        )
        .filter(Boolean),
    ),
  ].sort();
}

function getResolvedAssignedComponentIds(resolution = null) {
  const ids = new Set();
  Object.values(resolution?.provenance || {}).forEach((entries) => {
    asArray(entries).forEach((entry) => {
      if (
        entry?.sourceType === "assigned-component" &&
        typeof entry.sourceId === "string" &&
        entry.sourceId
      ) {
        ids.add(entry.sourceId);
      }
    });
  });
  return [...ids].sort();
}

function hasSameAssignedComponentSet(resolution, assignedComponents) {
  const currentIds = getAssignedComponentIds(assignedComponents);
  const resolvedIds = getResolvedAssignedComponentIds(resolution);
  return (
    currentIds.length === resolvedIds.length &&
    currentIds.every((id, index) => id === resolvedIds[index])
  );
}

export function getRoomConstraintResolutionSource(source = {}) {
  if (!isPlainObject(source)) return null;
  return (
    source.roomConstraintResolution ||
    source.metadata?.roomConstraintResolution ||
    source.requestMetadata?.roomConstraintResolution ||
    source.metadata?.dungeonRoomBrief?.roomConstraintResolution ||
    source.requestMetadata?.dungeonRoomBrief?.roomConstraintResolution ||
    null
  );
}

export function isRoomConstraintResolution(value = null) {
  return Boolean(
    isPlainObject(value) &&
    value.schemaVersion === ROOM_CONSTRAINT_RESOLVER_SCHEMA_VERSION &&
    typeof value.status === "string" &&
    Array.isArray(value.conflicts) &&
    Array.isArray(value.warnings) &&
    Array.isArray(value.changes) &&
    isPlainObject(value.provenance),
  );
}

export function resolveDungeonRoomConstraints({
  baseRegion = null,
  directRoomArchetype = "",
  assignedComponents = [],
  existingResolution = null,
  reuseExistingResolution = false,
  engineCapabilities = null,
} = {}) {
  const reusableResolution =
    getRoomConstraintResolutionSource(existingResolution) || existingResolution;
  if (
    reuseExistingResolution &&
    isRoomConstraintResolution(reusableResolution) &&
    hasSameAssignedComponentSet(reusableResolution, assignedComponents)
  ) {
    return clonePlainObject(reusableResolution);
  }

  return resolveRoomConstraints({
    baseRegion,
    archetypeContribution: directRoomArchetype || null,
    assignedComponents,
    engineCapabilities,
  });
}

export function getEffectiveRoomDesign(
  resolution = null,
  fallbackRoomDesign = null,
) {
  return (
    clonePlainObject(resolution?.effectiveRoomDesign) ||
    clonePlainObject(fallbackRoomDesign)
  );
}
