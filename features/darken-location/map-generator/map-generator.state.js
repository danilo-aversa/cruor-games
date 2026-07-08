function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export const MANUAL_OVERRIDE_SCHEMA_VERSION = 2;

export function createEmptyLevelOverrides() {
  return {
    regions: {},
    corridors: {},
    stairs: {},
  };
}

export function normalizeLevelOverrides(
  levels = {},
  legacyStairTransitions = {},
) {
  const source = levels && typeof levels === "object" ? levels : {};
  return {
    regions:
      source.regions && typeof source.regions === "object"
        ? source.regions
        : {},
    corridors:
      source.corridors && typeof source.corridors === "object"
        ? source.corridors
        : {},
    stairs: {
      ...(legacyStairTransitions && typeof legacyStairTransitions === "object"
        ? legacyStairTransitions
        : {}),
      ...(source.stairs && typeof source.stairs === "object"
        ? source.stairs
        : {}),
    },
  };
}

export function getLegacyStairTransitionsFromOverrides(overrides = {}) {
  return overrides.stairTransitions || overrides.manualStairTransitions || {};
}

export function createEmptyManualOverrides() {
  return {
    schemaVersion: MANUAL_OVERRIDE_SCHEMA_VERSION,
    roomPositions: {},
    doorAnchors: {},
    doorTypes: {},
    stairTransitions: {},
    levels: createEmptyLevelOverrides(),
    mapAccesses: {},
    corridorJunctions: {},
    corridorWaypoints: {},
    corridorTypes: {},
    customConnections: [],
    roomStyles: {},
    deletedConnections: [],
    manualConnectionSequence: 0,
  };
}

export function normalizeManualOverrides(overrides = {}) {
  const sequence = Number(
    overrides.manualConnectionSequence ?? overrides.connectionSequence ?? 0,
  );
  const levels = normalizeLevelOverrides(
    overrides.levels || overrides.manualLevels || {},
    getLegacyStairTransitionsFromOverrides(overrides),
  );
  return {
    schemaVersion: MANUAL_OVERRIDE_SCHEMA_VERSION,
    roomPositions:
      overrides.roomPositions || overrides.manualRoomPositions || {},
    doorAnchors: overrides.doorAnchors || overrides.manualDoorAnchors || {},
    doorTypes: overrides.doorTypes || overrides.manualDoorTypes || {},
    stairTransitions: levels.stairs,
    levels,
    mapAccesses: overrides.mapAccesses || overrides.manualMapAccesses || {},
    corridorJunctions:
      overrides.corridorJunctions || overrides.manualCorridorJunctions || {},
    corridorWaypoints:
      overrides.corridorWaypoints || overrides.manualCorridorWaypoints || {},
    corridorTypes:
      overrides.corridorTypes || overrides.manualCorridorTypes || {},
    customConnections: Array.isArray(
      overrides.customConnections || overrides.manualCustomConnections,
    )
      ? overrides.customConnections || overrides.manualCustomConnections
      : [],
    roomStyles: overrides.roomStyles || overrides.manualRoomStyles || {},
    deletedConnections: Array.isArray(
      overrides.deletedConnections || overrides.manualDeletedConnections,
    )
      ? overrides.deletedConnections || overrides.manualDeletedConnections
      : [],
    manualConnectionSequence: Number.isFinite(sequence)
      ? Math.max(0, Math.round(sequence))
      : 0,
  };
}

export function cloneManualOverrides(overrides = {}) {
  return normalizeManualOverrides(
    JSON.parse(JSON.stringify(normalizeManualOverrides(overrides))),
  );
}

export function areManualOverridesEqual(a, b) {
  return (
    JSON.stringify(cloneManualOverrides(a)) ===
    JSON.stringify(cloneManualOverrides(b))
  );
}


function hasObjectEntries(value) {
  return Boolean(value && typeof value === "object" && Object.keys(value).length > 0);
}

function hasArrayEntries(value) {
  return Array.isArray(value) && value.length > 0;
}

function preferObjectOverride(value, fallback = {}) {
  return hasObjectEntries(value)
    ? value
    : fallback && typeof fallback === "object"
      ? fallback
      : {};
}

function preferArrayOverride(value, fallback = []) {
  return hasArrayEntries(value)
    ? value
    : Array.isArray(fallback)
      ? fallback
      : [];
}

function hasLevelOverrideEntries(levels = {}) {
  return (
    hasObjectEntries(levels.regions) ||
    hasObjectEntries(levels.corridors) ||
    hasObjectEntries(levels.stairs)
  );
}

function preferLevelOverrides(value, fallback = createEmptyLevelOverrides()) {
  return hasLevelOverrideEntries(value)
    ? value
    : fallback && typeof fallback === "object"
      ? fallback
      : createEmptyLevelOverrides();
}

export function applyManualOverridesToConfig(config, manualOverrides = {}) {
  const normalizedOverrides = normalizeManualOverrides(manualOverrides);
  const preferredLevels = preferLevelOverrides(
    normalizedOverrides.levels,
    config.manualLevels,
  );
  return {
    ...config,
    manualRoomPositions: preferObjectOverride(
      normalizedOverrides.roomPositions,
      config.manualRoomPositions,
    ),
    manualDoorAnchors: preferObjectOverride(
      normalizedOverrides.doorAnchors,
      config.manualDoorAnchors,
    ),
    manualDoorTypes: preferObjectOverride(
      normalizedOverrides.doorTypes,
      config.manualDoorTypes,
    ),
    manualStairTransitions: preferObjectOverride(
      normalizedOverrides.levels.stairs,
      config.manualStairTransitions,
    ),
    manualLevels: preferredLevels,
    manualMapAccesses: preferObjectOverride(
      normalizedOverrides.mapAccesses,
      config.manualMapAccesses,
    ),
    manualCorridorJunctions: preferObjectOverride(
      normalizedOverrides.corridorJunctions,
      config.manualCorridorJunctions,
    ),
    manualCorridorWaypoints: preferObjectOverride(
      normalizedOverrides.corridorWaypoints,
      config.manualCorridorWaypoints,
    ),
    manualCorridorTypes: preferObjectOverride(
      normalizedOverrides.corridorTypes,
      config.manualCorridorTypes,
    ),
    manualCustomConnections: preferArrayOverride(
      normalizedOverrides.customConnections,
      config.manualCustomConnections,
    ),
    manualRoomStyles: preferObjectOverride(
      normalizedOverrides.roomStyles,
      config.manualRoomStyles,
    ),
    manualDeletedConnections: preferArrayOverride(
      normalizedOverrides.deletedConnections,
      config.manualDeletedConnections,
    ),
  };
}

export function resetManualOverrides() {
  return createEmptyManualOverrides();
}

export const GRID_STYLE_OPTIONS = ["solid", "dotted", "dashed", "none"];
export const GRID_WEIGHT_OPTIONS = ["fine", "normal", "bold"];
export const GRID_COLOR_OPTIONS = ["default", "light", "darker", "blood", "sepia", "black"];
export const DOOR_TYPE_OPTIONS = ["default", "secret", "locked", "open"];
export const CORRIDOR_TYPE_OPTIONS = ["normal", "narrow", "collapsed", "secret", "gallery"];
export const STAIR_TRANSITION_OPTIONS = ["none", "up", "down"];
export const JUNCTION_TYPE_OPTIONS = ["merge", "wall", "door"];
export const LEVEL_VIEW_ALL = "all";

export function normalizeGridStyle(value) {
  return GRID_STYLE_OPTIONS.includes(value) ? value : "solid";
}

export function normalizeGridWeight(value) {
  return GRID_WEIGHT_OPTIONS.includes(value) ? value : "normal";
}

export function normalizeGridColor(value) {
  return GRID_COLOR_OPTIONS.includes(value) ? value : "default";
}


export function corridorTypeKey(corridorId) {
  return String(corridorId || "");
}

export function normalizeCorridorType(value, fallback = "normal") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
  const aliases = {
    default: "normal",
    standard: "normal",
    regular: "normal",
    slim: "narrow",
    tight: "narrow",
    crawlspace: "narrow",
    crawl: "narrow",
    rubble: "collapsed",
    ruined: "collapsed",
    broken: "collapsed",
    hidden: "secret",
    concealed: "secret",
    passage: "secret",
    arcade: "gallery",
    aisle: "gallery",
    hall: "gallery",
  };
  const candidate = aliases[normalized] || normalized;
  return CORRIDOR_TYPE_OPTIONS.includes(candidate) ? candidate : fallback;
}

export function getManualCorridorType(
  corridorTypes,
  corridorId,
  fallback = null,
) {
  const key = corridorTypeKey(corridorId);
  const raw = corridorTypes?.[key] ?? corridorTypes?.[corridorId];
  if (raw === undefined || raw === null || raw === "") return fallback;
  return normalizeCorridorType(raw, fallback || "normal");
}

export function resolveManualCorridorType(config, corridorId, fallback = null) {
  return getManualCorridorType(
    config?.manualCorridorTypes || {},
    corridorId,
    fallback,
  );
}

export function doorTypeKey(corridorId, endpoint) {
  return `${corridorId}:${endpoint || "shared"}`;
}

export function normalizeDoorType(value, fallback = "default") {
  return DOOR_TYPE_OPTIONS.includes(value) ? value : fallback;
}

export function stairTransitionKey(corridorId, endpoint) {
  return `${corridorId}:${endpoint || "shared"}`;
}

export function normalizeStairTransition(value, fallback = "none") {
  return STAIR_TRANSITION_OPTIONS.includes(value) ? value : fallback;
}

export function getManualStairTransition(
  stairTransitions,
  corridorId,
  endpoint,
  fallback = "none",
) {
  return normalizeStairTransition(
    stairTransitions?.[stairTransitionKey(corridorId, endpoint)],
    fallback,
  );
}

export function resolveStairTransition(
  config,
  corridorId,
  endpoint,
  fallback = "none",
) {
  return getManualStairTransition(
    config.manualStairTransitions || {},
    corridorId,
    endpoint,
    fallback,
  );
}

export function normalizeJunctionType(value, fallback = "merge") {
  return JUNCTION_TYPE_OPTIONS.includes(value) ? value : fallback;
}

export function normalizeJunctionOverride(value, fallback = "merge") {
  if (typeof value === "string")
    return { type: normalizeJunctionType(value, fallback), sideIndex: 0 };
  if (value && typeof value === "object") {
    return {
      type: normalizeJunctionType(value.type, fallback),
      sideIndex: Number.isFinite(value.sideIndex)
        ? clamp(Math.round(value.sideIndex), 0, 3)
        : 0,
    };
  }
  return { type: normalizeJunctionType(fallback, "merge"), sideIndex: 0 };
}

export function getManualJunctionOverride(junctions, key, fallback = "merge") {
  return normalizeJunctionOverride(junctions?.[key], fallback);
}

export function getManualJunctionType(junctions, key, fallback = "merge") {
  return getManualJunctionOverride(junctions, key, fallback).type;
}

export function getManualJunctionSideIndex(junctions, key, fallback = "merge") {
  return getManualJunctionOverride(junctions, key, fallback).sideIndex;
}

export function getManualDoorType(
  doorTypes,
  corridorId,
  endpoint,
  fallback = "default",
) {
  return normalizeDoorType(
    doorTypes?.[doorTypeKey(corridorId, endpoint)],
    fallback,
  );
}

export function resolveDoorType(
  config,
  corridorId,
  endpoint,
  fallbackSecret = false,
) {
  return getManualDoorType(
    config.manualDoorTypes || {},
    corridorId,
    endpoint,
    fallbackSecret ? "secret" : "default",
  );
}
