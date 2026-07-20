function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export const MANUAL_OVERRIDE_SCHEMA_VERSION = 5;

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

export function normalizeStairMarkerOverride(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const corridorId = String(source.corridorId || "").trim();
  const rawMarkerIndex = Number(source.markerIndex);
  const markerIndex = Number.isFinite(rawMarkerIndex)
    ? Math.max(0, Math.round(rawMarkerIndex))
    : 0;
  const removed = source.removed === true;
  if (removed) {
    return {
      corridorId,
      markerIndex,
      pathIndex: 0,
      normalizedOffset: null,
      pathCellKey: "",
      removed: true,
    };
  }
  const rawPathIndex = Number(source.pathIndex);
  const rawOffset = Number(source.normalizedOffset);
  const cell =
    source.cell && typeof source.cell === "object"
      ? { x: Number(source.cell.x), y: Number(source.cell.y) }
      : null;
  const normalizedCell =
    Number.isFinite(cell?.x) && Number.isFinite(cell?.y)
      ? { x: Math.round(cell.x), y: Math.round(cell.y) }
      : null;
  const explicitCellKey = String(source.pathCellKey || "").trim();
  const pathCellKey =
    explicitCellKey ||
    (normalizedCell ? `${normalizedCell.x},${normalizedCell.y}` : "");
  const normalized = {
    corridorId,
    markerIndex,
    pathIndex: Number.isFinite(rawPathIndex)
      ? Math.max(0, Math.round(rawPathIndex))
      : 0,
    normalizedOffset: Number.isFinite(rawOffset)
      ? clamp(rawOffset, 0, 1)
      : null,
    pathCellKey,
    removed: false,
  };
  if (normalizedCell) normalized.cell = normalizedCell;
  return normalized;
}

export function normalizeStairMarkerOverrides(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([markerId, override]) =>
          markerId && override && typeof override === "object",
      )
      .map(([markerId, override]) => [
        markerId,
        normalizeStairMarkerOverride(override),
      ])
      .filter(([, override]) => override.corridorId),
  );
}

export function createStairMarkerPositionOverride({
  corridorId = "",
  markerIndex = 0,
  pathIndex = 0,
  pathLength = 1,
  cell = null,
  normalizedOffset = null,
} = {}) {
  const safePathLength = Math.max(1, Math.round(Number(pathLength) || 1));
  const safePathIndex = clamp(
    Math.round(Number(pathIndex) || 0),
    0,
    Math.max(0, safePathLength - 1),
  );
  const hasExplicitOffset =
    normalizedOffset !== null &&
    typeof normalizedOffset !== "undefined" &&
    Number.isFinite(Number(normalizedOffset));
  const resolvedOffset = hasExplicitOffset
    ? Number(normalizedOffset)
    : safePathLength <= 1
      ? 0
      : safePathIndex / (safePathLength - 1);
  return normalizeStairMarkerOverride({
    corridorId,
    markerIndex,
    pathIndex: safePathIndex,
    normalizedOffset: resolvedOffset,
    cell,
    removed: false,
  });
}

export function createStairMarkerRemovalOverride({
  corridorId = "",
  markerIndex = 0,
} = {}) {
  return normalizeStairMarkerOverride({
    corridorId,
    markerIndex,
    removed: true,
  });
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
    stairMarkers: {},
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

export function normalizeRoomStyleOverride(style = {}) {
  if (!style || typeof style !== "object" || Array.isArray(style)) return {};
  const rawShape = String(style.shape || "").trim().toLowerCase();
  const legacyNotchedShape = ["notched", "notch", "cutout"].includes(rawShape);
  return {
    ...style,
    ...(legacyNotchedShape ? { shape: "rect", notch: true } : {}),
  };
}

export function normalizeRoomStyleOverrides(styles = {}) {
  if (!styles || typeof styles !== "object" || Array.isArray(styles)) return {};
  return Object.fromEntries(
    Object.entries(styles)
      .filter(([regionId, style]) => regionId && style && typeof style === "object")
      .map(([regionId, style]) => [regionId, normalizeRoomStyleOverride(style)]),
  );
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
    stairMarkers: normalizeStairMarkerOverrides(
      overrides.stairMarkers || overrides.manualStairMarkers || {},
    ),
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
    roomStyles: normalizeRoomStyleOverrides(
      overrides.roomStyles || overrides.manualRoomStyles || {},
    ),
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
    manualStairMarkers: preferObjectOverride(
      normalizedOverrides.stairMarkers,
      config.manualStairMarkers,
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
      normalizeRoomStyleOverrides(config.manualRoomStyles),
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
export const LEVEL_TRANSITION_TYPE_OPTIONS = ["none", "stairs"];
export const LEVEL_TRANSITION_DIRECTION_OPTIONS = STAIR_TRANSITION_OPTIONS;
export const LEVEL_TRANSITION_PLACEMENT_OPTIONS = [
  "from-endpoint",
  "to-endpoint",
  "shared",
  "whole-corridor",
];
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

export function normalizeLevelNumber(value, fallback = 0) {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? value.level ?? value.value ?? value.id
      : value;
  const number = Number(raw);
  return Number.isFinite(number) ? Math.round(number) : fallback;
}

export function normalizeLevelId(value, fallback = 0) {
  return normalizeLevelNumber(value, fallback);
}

export function normalizeLevelTransitionDirection(value, fallback = "none") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
  const aliases = {
    upstairs: "up",
    ascend: "up",
    ascending: "up",
    above: "up",
    downstairs: "down",
    descend: "down",
    descending: "down",
    below: "down",
    no: "none",
    false: "none",
    off: "none",
  };
  const candidate = aliases[normalized] || normalized;
  return LEVEL_TRANSITION_DIRECTION_OPTIONS.includes(candidate)
    ? candidate
    : fallback;
}

export function normalizeStairTransition(value, fallback = "none") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return normalizeLevelTransitionDirection(
      value.direction ?? value.stairTransition ?? value.transition,
      fallback,
    );
  }
  return normalizeLevelTransitionDirection(value, fallback);
}

export function normalizeLevelTransitionPlacement(value, fallback = "shared") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
  const aliases = {
    from: "from-endpoint",
    start: "from-endpoint",
    source: "from-endpoint",
    a: "from-endpoint",
    to: "to-endpoint",
    end: "to-endpoint",
    target: "to-endpoint",
    b: "to-endpoint",
    both: "shared",
    endpoint: "shared",
    door: "shared",
    corridor: "whole-corridor",
    whole: "whole-corridor",
    full: "whole-corridor",
  };
  const candidate = aliases[normalized] || normalized;
  return LEVEL_TRANSITION_PLACEMENT_OPTIONS.includes(candidate)
    ? candidate
    : fallback;
}

function getEndpointLevelTransitionPlacement(endpoint = "shared") {
  if (endpoint === "from") return "from-endpoint";
  if (endpoint === "to") return "to-endpoint";
  return "shared";
}

export function normalizeLevelTransitionType(value, fallback = "none") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
  const aliases = {
    stair: "stairs",
    stairway: "stairs",
    staircase: "stairs",
    steps: "stairs",
    up: "stairs",
    down: "stairs",
    no: "none",
    false: "none",
    off: "none",
  };
  const candidate = aliases[normalized] || normalized;
  return LEVEL_TRANSITION_TYPE_OPTIONS.includes(candidate) ? candidate : fallback;
}

export function normalizeLevelTransition(value, fallback = {}) {
  const fallbackTransition =
    fallback && typeof fallback === "object" && !Array.isArray(fallback)
      ? fallback
      : {};
  const fallbackEndpoint = fallbackTransition.endpoint || "shared";
  const fallbackPlacement = normalizeLevelTransitionPlacement(
    fallbackTransition.placement,
    getEndpointLevelTransitionPlacement(fallbackEndpoint),
  );
  const fallbackDirection = normalizeLevelTransitionDirection(
    fallbackTransition.direction ?? fallbackTransition.stairTransition,
    "none",
  );

  if (value === undefined || value === null || value === "") {
    return {
      type: fallbackDirection === "none" ? "none" : "stairs",
      direction: fallbackDirection,
      placement: fallbackPlacement,
      endpoint: fallbackEndpoint,
    };
  }

  if (typeof value === "string") {
    const direction = normalizeLevelTransitionDirection(value, fallbackDirection);
    return {
      type: direction === "none" ? "none" : "stairs",
      direction,
      placement: fallbackPlacement,
      endpoint: fallbackEndpoint,
    };
  }

  if (typeof value === "number") {
    return {
      type: "none",
      direction: "none",
      placement: fallbackPlacement,
      endpoint: fallbackEndpoint,
      level: normalizeLevelNumber(value),
    };
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    const endpoint = value.endpoint || fallbackEndpoint;
    const direction = normalizeLevelTransitionDirection(
      value.direction ?? value.stairTransition ?? value.transition,
      fallbackDirection,
    );
    const type = normalizeLevelTransitionType(
      value.type ?? value.transitionType ?? (direction === "none" ? "none" : "stairs"),
      direction === "none" ? "none" : "stairs",
    );
    const placement = normalizeLevelTransitionPlacement(
      value.placement,
      getEndpointLevelTransitionPlacement(endpoint),
    );
    return {
      type: type === "none" || direction === "none" ? "none" : type,
      direction: type === "none" ? "none" : direction,
      placement,
      endpoint,
      ...(Number.isFinite(Number(value.fromLevel))
        ? { fromLevel: normalizeLevelNumber(value.fromLevel) }
        : {}),
      ...(Number.isFinite(Number(value.toLevel))
        ? { toLevel: normalizeLevelNumber(value.toLevel) }
        : {}),
      ...(Number.isFinite(Number(value.level))
        ? { level: normalizeLevelNumber(value.level) }
        : {}),
    };
  }

  return {
    type: fallbackDirection === "none" ? "none" : "stairs",
    direction: fallbackDirection,
    placement: fallbackPlacement,
    endpoint: fallbackEndpoint,
  };
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

export function getManualLevelTransition(
  levelTransitions,
  corridorId,
  endpoint,
  fallback = {},
) {
  const key = stairTransitionKey(corridorId, endpoint);
  const raw = levelTransitions?.[key] ?? levelTransitions?.[corridorId];
  return normalizeLevelTransition(raw, {
    endpoint: endpoint || "shared",
    placement: getEndpointLevelTransitionPlacement(endpoint || "shared"),
    ...fallback,
  });
}

export function resolveLevelTransition(
  config,
  corridorId,
  endpoint,
  fallback = {},
) {
  return getManualLevelTransition(
    {
      ...(config?.manualStairTransitions || {}),
      ...(config?.manualLevels?.stairs || {}),
    },
    corridorId,
    endpoint,
    fallback,
  );
}

export function resolveStairTransition(
  config,
  corridorId,
  endpoint,
  fallback = "none",
) {
  const transition = resolveLevelTransition(config, corridorId, endpoint, {
    direction: fallback,
  });
  return normalizeStairTransition(transition, fallback);
}


export function getExpectedLevelDeltaForStairTransition(endpoint, stairTransition) {
  const direction = normalizeStairTransition(stairTransition, "none");
  if (direction === "none") return 0;
  if (endpoint === "to") return direction === "up" ? -1 : 1;
  return direction === "up" ? 1 : -1;
}

function isEditorStairLevelOverride(value, corridorId) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value.source === "editor-stair" &&
      (!value.corridorId || value.corridorId === corridorId),
  );
}

function shouldWriteEditorStairLevelOverride(value, corridorId) {
  return value === undefined || isEditorStairLevelOverride(value, corridorId);
}

function getLevelOverrideValue(value, fallback = 0) {
  return normalizeLevelNumber(value, fallback);
}

function createEditorStairRegionLevel(level, corridorId, endpoint) {
  return {
    level: normalizeLevelNumber(level, 0),
    source: "editor-stair",
    corridorId,
    endpoint,
  };
}

function createEditorStairCorridorLevel({
  corridorId,
  endpoint,
  stairTransition,
  fromLevel,
  toLevel,
}) {
  return {
    level: endpoint === "from" ? toLevel : fromLevel,
    fromLevel,
    toLevel,
    source: "editor-stair",
    corridorId,
    stairEndpoint: endpoint,
    stairTransition,
  };
}

export function createEditorStairTransitionOverride(
  corridorId,
  endpoint,
  stairTransition,
) {
  const direction = normalizeStairTransition(stairTransition, "none");
  if (direction === "none") return null;
  return {
    type: "stairs",
    direction,
    placement: getEndpointLevelTransitionPlacement(endpoint),
    endpoint,
    source: "editor-stair",
    corridorId,
  };
}

export function createEditorStairLevelOverrides({
  levels = createEmptyLevelOverrides(),
  corridor = null,
  endpoint = "from",
  stairTransition = "none",
} = {}) {
  const safeLevels = normalizeLevelOverrides(levels);
  const corridorId = corridor?.id || "";
  const safeEndpoint = endpoint === "to" ? "to" : "from";
  const key = stairTransitionKey(corridorId, safeEndpoint);
  const direction = normalizeStairTransition(stairTransition, "none");
  const regions = { ...(safeLevels.regions || {}) };
  const corridors = { ...(safeLevels.corridors || {}) };
  const stairs = { ...(safeLevels.stairs || {}) };

  if (!corridorId || direction === "none") {
    if (corridorId) {
      delete stairs[key];
      if (isEditorStairLevelOverride(corridors[corridorId], corridorId)) {
        delete corridors[corridorId];
      }
      [corridor?.from, corridor?.to].filter(Boolean).forEach((regionId) => {
        if (isEditorStairLevelOverride(regions[regionId], corridorId)) {
          delete regions[regionId];
        }
      });
    }
    return {
      levels: { regions, corridors, stairs },
      stairTransitions: stairs,
    };
  }

  stairs[key] = createEditorStairTransitionOverride(
    corridorId,
    safeEndpoint,
    direction,
  );

  const fromRegionId = corridor?.from || null;
  const toRegionId = corridor?.to || null;
  const expectedDelta = getExpectedLevelDeltaForStairTransition(
    safeEndpoint,
    direction,
  );
  const existingFromLevel = getLevelOverrideValue(
    fromRegionId ? regions[fromRegionId] : undefined,
    Number.isFinite(corridor?.fromLevel) ? corridor.fromLevel : 0,
  );
  const existingToLevel = getLevelOverrideValue(
    toRegionId ? regions[toRegionId] : undefined,
    Number.isFinite(corridor?.toLevel) ? corridor.toLevel : existingFromLevel,
  );
  const fromLevel =
    safeEndpoint === "to" ? existingToLevel - expectedDelta : existingFromLevel;
  const toLevel =
    safeEndpoint === "to" ? existingToLevel : fromLevel + expectedDelta;

  corridors[corridorId] = createEditorStairCorridorLevel({
    corridorId,
    endpoint: safeEndpoint,
    stairTransition: direction,
    fromLevel,
    toLevel,
  });

  if (
    fromRegionId &&
    shouldWriteEditorStairLevelOverride(regions[fromRegionId], corridorId)
  ) {
    regions[fromRegionId] = createEditorStairRegionLevel(
      fromLevel,
      corridorId,
      "from",
    );
  }
  if (
    toRegionId &&
    shouldWriteEditorStairLevelOverride(regions[toRegionId], corridorId)
  ) {
    regions[toRegionId] = createEditorStairRegionLevel(
      toLevel,
      corridorId,
      "to",
    );
  }

  return {
    levels: { regions, corridors, stairs },
    stairTransitions: stairs,
  };
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
