export const LOCATION_ROOM_CONSTRAINT_STATE_SCHEMA_VERSION = 1;

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function cloneSerializable(value, fallback = null) {
  if (value === undefined) return fallback;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return fallback;
  }
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableValue(value[key])]),
  );
}

function getRegionAssignments(slotAssignments = {}, regionId = "") {
  return Object.entries(slotAssignments || {})
    .flatMap(([fallbackSlotId, assignments]) =>
      Array.isArray(assignments)
        ? assignments.map((assignment) => ({
            componentId: String(assignment?.componentId || ""),
            slotId: String(assignment?.slotId || fallbackSlotId || ""),
            regionId: String(assignment?.regionId || ""),
          }))
        : [],
    )
    .filter(
      (assignment) =>
        assignment.componentId &&
        assignment.regionId === String(regionId || ""),
    );
}

function getRoomManualOverride(manualOverrides = null, regionId = "") {
  if (!isPlainObject(manualOverrides)) return null;
  if (manualOverrides.roomStyles || manualOverrides.manualRoomStyles) {
    return (
      manualOverrides.roomStyles?.[regionId] ||
      manualOverrides.manualRoomStyles?.[regionId] ||
      null
    );
  }
  return manualOverrides;
}

function getRoomConstraintBaseRegion(region = null) {
  if (!isPlainObject(region)) return null;
  return {
    id: region.id || "",
    roomDesign: region.roomDesign || null,
    roomArchetype: region.roomArchetype || region.roomArchetypeId || "",
    shape: region.shape || "",
    preferredShape: region.preferredShape || "",
    size: region.size || "",
    connectors: region.connectors ?? null,
    role: region.role || "",
    level: region.level ?? null,
  };
}

export function createLocationRoomAssignmentSignature(
  slotAssignments = {},
  regionId = "",
) {
  return getRegionAssignments(slotAssignments, regionId)
    .map(
      (assignment) =>
        `${assignment.slotId || "slot"}:${assignment.componentId}`,
    )
    .sort()
    .join("|");
}

export function createLocationRoomConstraintInputSignature({
  region = null,
  slotAssignments = {},
  manualOverrides = null,
} = {}) {
  const regionId = String(region?.id || "");
  return JSON.stringify(
    stableValue({
      assignmentSignature: createLocationRoomAssignmentSignature(
        slotAssignments,
        regionId,
      ),
      baseRegion: getRoomConstraintBaseRegion(region),
      manualOverride: getRoomManualOverride(manualOverrides, regionId),
    }),
  );
}

export function createLocationRoomConstraintStateEntry({
  region = null,
  slotAssignments = {},
  manualOverrides = null,
  resolution = null,
} = {}) {
  const regionId = String(region?.id || "");
  if (!regionId || !isPlainObject(resolution)) return null;

  return {
    schemaVersion: LOCATION_ROOM_CONSTRAINT_STATE_SCHEMA_VERSION,
    regionId,
    inputSignature: createLocationRoomConstraintInputSignature({
      region,
      slotAssignments,
      manualOverrides,
    }),
    effectiveRoomDesign: cloneSerializable(
      resolution.effectiveRoomDesign,
      null,
    ),
    roomConstraintResolution: cloneSerializable(resolution, null),
  };
}

export function isLocationRoomConstraintStateEntryCurrent(
  entry = null,
  region = null,
  slotAssignments = {},
  manualOverrides = null,
) {
  const regionId = String(region?.id || "");
  return Boolean(
    isPlainObject(entry) &&
    entry.schemaVersion === LOCATION_ROOM_CONSTRAINT_STATE_SCHEMA_VERSION &&
    entry.regionId === regionId &&
    entry.inputSignature ===
      createLocationRoomConstraintInputSignature({
        region,
        slotAssignments,
        manualOverrides,
      }) &&
    isPlainObject(entry.roomConstraintResolution),
  );
}

export function getCurrentLocationRoomConstraintStateEntry(
  roomConstraintStateByRegion = {},
  region = null,
  slotAssignments = {},
  manualOverrides = null,
) {
  const regionId = String(region?.id || "");
  const entry = roomConstraintStateByRegion?.[regionId] || null;
  return isLocationRoomConstraintStateEntryCurrent(
    entry,
    region,
    slotAssignments,
    manualOverrides,
  )
    ? entry
    : null;
}

export function applyLocationRoomConstraintStateToRegions({
  regions = [],
  roomConstraintStateByRegion = {},
  slotAssignments = {},
  manualOverrides = null,
} = {}) {
  return Array.isArray(regions)
    ? regions.map((region) => {
        const entry = getCurrentLocationRoomConstraintStateEntry(
          roomConstraintStateByRegion,
          region,
          slotAssignments,
          manualOverrides,
        );
        if (!entry) return region;

        return {
          ...region,
          effectiveRoomDesign: cloneSerializable(
            entry.effectiveRoomDesign,
            null,
          ),
          roomConstraintResolution: cloneSerializable(
            entry.roomConstraintResolution,
            null,
          ),
        };
      })
    : [];
}

export function sanitizeLocationRoomConstraintState({
  regions = [],
  roomConstraintStateByRegion = {},
  slotAssignments = {},
  manualOverrides = null,
} = {}) {
  return Object.fromEntries(
    (Array.isArray(regions) ? regions : [])
      .map((region) => {
        const entry = getCurrentLocationRoomConstraintStateEntry(
          roomConstraintStateByRegion,
          region,
          slotAssignments,
          manualOverrides,
        );
        return entry
          ? [String(region.id || ""), cloneSerializable(entry)]
          : null;
      })
      .filter(Boolean),
  );
}

export function retainLocationRoomConstraintState(
  roomConstraintStateByRegion = {},
  regionIds = [],
) {
  const allowedIds = new Set(regionIds.map((id) => String(id || "")));
  return Object.fromEntries(
    Object.entries(roomConstraintStateByRegion || {})
      .filter(([regionId]) => allowedIds.has(regionId))
      .map(([regionId, entry]) => [regionId, cloneSerializable(entry, null)])
      .filter(([, entry]) => entry),
  );
}

export function clearLocationRoomConstraintStateForRegion(
  roomConstraintStateByRegion = {},
  regionId = "",
) {
  const next = { ...(roomConstraintStateByRegion || {}) };
  delete next[String(regionId || "")];
  return next;
}

export function createLocationAssignmentHistorySnapshot(state = {}) {
  return {
    slotAssignments: cloneSerializable(state.slotAssignments || {}, {}),
    selectedComponentIds: Array.from(state.selectedComponentIds || []),
    roomConstraintStateByRegion: cloneSerializable(
      state.roomConstraintStateByRegion || {},
      {},
    ),
  };
}

export function restoreLocationAssignmentHistorySnapshot(
  state = {},
  snapshot = null,
) {
  if (!isPlainObject(snapshot)) return state;

  return {
    ...state,
    slotAssignments: cloneSerializable(snapshot.slotAssignments || {}, {}),
    selectedComponentIds: new Set(snapshot.selectedComponentIds || []),
    roomConstraintStateByRegion: cloneSerializable(
      snapshot.roomConstraintStateByRegion || {},
      {},
    ),
  };
}
