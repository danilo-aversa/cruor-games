import { normalizeDungeonTheme } from "./dungeon-theme.js";

export const DUNGEON_BRIEF_SCHEMA_VERSION = "0.3";

export const DUNGEON_BRIEF_MODE_THEME = "theme";
export const DUNGEON_BRIEF_MODE_SCRATCH = "scratch";

const ROOM_SIZE_SET = new Set(["Small", "Medium", "Large"]);
const CONNECTION_KIND_SET = new Set(["main", "secondary", "secret", "service"]);

function asArray(value) {
  if (!value) return [];
  if (value instanceof Set) return [...value].filter(Boolean);
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeInteger(value, fallback = 0, { min = 0, max = 999 } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function unique(values) {
  return [...new Set(asArray(values).map((value) => String(value).trim()).filter(Boolean))];
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getMapInfluenceSource(source = {}) {
  if (!isPlainObject(source)) return null;
  return (
    source.mapInfluence ||
    source.location?.mapInfluence ||
    source.locationRegion?.mapInfluence ||
    source.map?.mapInfluence ||
    source.map?.influence ||
    null
  );
}

function normalizeMapInfluence(value = {}) {
  if (!isPlainObject(value)) return null;
  const forcedRoomArchetype = normalizeString(
    value.forcedRoomArchetype || value.forcedRoomArchetypeId,
  );
  const directRoomArchetype = normalizeString(
    forcedRoomArchetype || value.roomArchetype || value.roomArchetypeId,
  );
  const preferredRoomArchetypes = unique([
    directRoomArchetype && !forcedRoomArchetype ? directRoomArchetype : "",
    value.preferredRoomArchetype,
    value.preferredRoomArchetypeId,
    ...asArray(value.preferredRoomArchetypes),
    ...asArray(value.preferredRoomArchetypeIds),
  ]);
  const forbiddenRoomArchetypes = unique([
    value.forbiddenRoomArchetype,
    value.forbiddenRoomArchetypeId,
    ...asArray(value.forbiddenRoomArchetypes),
    ...asArray(value.forbiddenRoomArchetypeIds),
  ]);
  const sources = unique([
    ...asArray(value.sources),
    value.source,
    value.componentId,
    value.componentTitle,
  ]);
  const hasInfluence = Boolean(
    directRoomArchetype ||
      preferredRoomArchetypes.length ||
      forbiddenRoomArchetypes.length ||
      value.forceRoomArchetype ||
      value.force ||
      value.required,
  );
  if (!hasInfluence) return null;
  return {
    roomArchetype: directRoomArchetype,
    preferredRoomArchetypes,
    forbiddenRoomArchetypes,
    forceRoomArchetype: Boolean(value.forceRoomArchetype || value.force || value.required || forcedRoomArchetype),
    weight: normalizeNumber(value.weight ?? value.priority, 1),
    source: sources[0] || "",
    sources,
  };
}

function normalizeInfluenceToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getRoomArchetypeFromMapInfluence(influence = {}) {
  if (!isPlainObject(influence)) return "";
  const forbidden = new Set(asArray(influence.forbiddenRoomArchetypes).map(normalizeInfluenceToken));
  const isForced = Boolean(influence.forceRoomArchetype || influence.force || influence.required);
  const candidates = unique([
    influence.roomArchetype,
    influence.roomArchetypeId,
    influence.forcedRoomArchetype,
    influence.forcedRoomArchetypeId,
    ...asArray(influence.preferredRoomArchetypes),
    ...asArray(influence.preferredRoomArchetypeIds),
  ]);
  return candidates.find((candidate) => isForced || !forbidden.has(normalizeInfluenceToken(candidate))) || "";
}

function mergeMapInfluences(influences = []) {
  const normalized = asArray(influences).map(normalizeMapInfluence).filter(Boolean);
  if (!normalized.length) return null;
  const ordered = [...normalized].sort((a, b) => {
    if (a.forceRoomArchetype !== b.forceRoomArchetype) return a.forceRoomArchetype ? -1 : 1;
    return normalizeNumber(b.weight, 1) - normalizeNumber(a.weight, 1);
  });
  const primary = ordered.find((item) => getRoomArchetypeFromMapInfluence(item)) || ordered[0];
  return {
    roomArchetype: getRoomArchetypeFromMapInfluence(primary),
    preferredRoomArchetypes: unique(ordered.flatMap((item) => item.preferredRoomArchetypes)),
    forbiddenRoomArchetypes: unique(ordered.flatMap((item) => item.forbiddenRoomArchetypes)),
    forceRoomArchetype: ordered.some((item) => item.forceRoomArchetype),
    weight: ordered.reduce((sum, item) => sum + normalizeNumber(item.weight, 1), 0),
    sources: unique(ordered.flatMap((item) => [...asArray(item.sources), item.source])),
  };
}

function normalizeRoomSize(value, fallback = "Medium") {
  const text = normalizeString(value, fallback);
  return ROOM_SIZE_SET.has(text) ? text : fallback;
}

function createRoomId(index) {
  return `room-${String(index + 1).padStart(2, "0")}`;
}

function createRoomNameFallback(index, theme) {
  const themeRoomTypes = asArray(theme?.roomTypeBias);
  const roomType = themeRoomTypes[index % Math.max(1, themeRoomTypes.length)] || "Location Region";
  return `${String(index + 1).padStart(2, "0")} ${roomType.replace(/^./, (letter) => letter.toUpperCase())}`;
}

function normalizeConnectionKind(value, fallback = "main") {
  const normalized = normalizeString(value, fallback).toLowerCase();
  if (normalized === "critical" || normalized === "path") return "main";
  if (normalized === "side" || normalized === "loop" || normalized === "branch") return "secondary";
  if (normalized === "hidden") return "secret";
  return CONNECTION_KIND_SET.has(normalized) ? normalized : fallback;
}

function createConnectionId(from, to, index, kind = "main") {
  return `connection-${String(index + 1).padStart(2, "0")}-${kind}-${from}-${to}`;
}

function getRoomConnectionRole(room) {
  return [room?.role, room?.type, room?.name, ...(asArray(room?.tags))]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isSecretRoom(room) {
  const text = getRoomConnectionRole(room);
  return Boolean(room?.secret || text.includes("secret") || text.includes("hidden"));
}

function isServiceRoom(room) {
  const text = getRoomConnectionRole(room);
  return text.includes("service") || text.includes("utility") || text.includes("storage");
}

function isLoopRoom(room) {
  const text = getRoomConnectionRole(room);
  return text.includes("loop") || text.includes("return") || text.includes("false return");
}

function isConnectorRoom(room) {
  const text = getRoomConnectionRole(room);
  return text.includes("connector") || text.includes("passage") || text.includes("hall") || text.includes("threshold");
}

function isClueRoom(room) {
  const text = getRoomConnectionRole(room);
  return text.includes("clue") || text.includes("evidence") || text.includes("archive") || text.includes("lore");
}

function isHazardRoom(room) {
  const text = getRoomConnectionRole(room);
  return text.includes("hazard") || text.includes("danger") || text.includes("ambush") || text.includes("nest");
}

function isFinalRoom(room) {
  const text = getRoomConnectionRole(room);
  return text.includes("final") || text.includes("climax") || text.includes("outcome") || text.includes("reward") || text.includes("exit");
}

function addUniqueRoom(target, room) {
  if (!room || target.some((item) => item.id === room.id)) return;
  target.push(room);
}

function selectFirstRoom(rooms, predicate) {
  return rooms.find(predicate) || null;
}

function sortRoomsByIndex(rooms) {
  return [...rooms].sort(
    (a, b) => Number(a?.index || 0) - Number(b?.index || 0) || String(a?.id || "").localeCompare(String(b?.id || "")),
  );
}

function buildInferredMainPath(roomBriefs = []) {
  if (!Array.isArray(roomBriefs) || roomBriefs.length <= 1) return roomBriefs;
  const usable = roomBriefs.filter((room) => !isSecretRoom(room) && !isServiceRoom(room));
  const pool = usable.length > 1 ? sortRoomsByIndex(usable) : sortRoomsByIndex(roomBriefs);
  const entrance = pool[0];
  const finalRoom = [...pool].reverse().find(isFinalRoom) || pool[pool.length - 1];
  const middlePool = pool.filter((room) => room.id !== entrance?.id && room.id !== finalRoom?.id);
  const required = [];
  addUniqueRoom(required, selectFirstRoom(middlePool, isConnectorRoom));
  addUniqueRoom(required, selectFirstRoom(middlePool, isClueRoom));
  addUniqueRoom(required, selectFirstRoom(middlePool, isHazardRoom));
  const remaining = middlePool.filter((room) => !required.some((item) => item.id === room.id));
  const mainBudget = Math.max(
    0,
    Math.ceil(pool.length * 0.62) - required.length - (entrance ? 1 : 0) - (finalRoom ? 1 : 0),
  );
  const extras = remaining.slice(0, mainBudget);
  const mainPath = [];
  addUniqueRoom(mainPath, entrance);
  sortRoomsByIndex([...required, ...extras]).forEach((room) => addUniqueRoom(mainPath, room));
  addUniqueRoom(mainPath, finalRoom);
  return mainPath.length > 1 ? mainPath : pool;
}

function selectBranchAnchor(pathRooms = [], room, fallbackIndex = 0) {
  if (!pathRooms.length) return null;
  const previous = [...pathRooms]
    .reverse()
    .find((candidate) => Number(candidate.index || 0) < Number(room.index || fallbackIndex + 1));
  if (previous) return previous;
  if (isSecretRoom(room)) return pathRooms[Math.max(0, pathRooms.length - 2)] || pathRooms[0];
  if (isHazardRoom(room)) return pathRooms[Math.min(2, pathRooms.length - 1)] || pathRooms[0];
  if (isClueRoom(room)) return pathRooms[Math.min(1, pathRooms.length - 1)] || pathRooms[0];
  return pathRooms[Math.max(0, Math.min(pathRooms.length - 1, fallbackIndex - 1))] || pathRooms[0];
}

function addConnection(connections, connection, roomIdSet) {
  const from = normalizeString(connection?.from);
  const to = normalizeString(connection?.to);
  if (!from || !to || from === to) return null;
  if (!roomIdSet.has(from) || !roomIdSet.has(to)) return null;

  const duplicate = connections.find(
    (existing) =>
      (existing.from === from && existing.to === to) ||
      (existing.from === to && existing.to === from),
  );
  if (duplicate) return duplicate;

  const kind = normalizeConnectionKind(connection.kind);
  const index = connections.length;
  const normalized = {
    id: normalizeString(connection.id, createConnectionId(from, to, index, kind)),
    from,
    to,
    kind,
    locked: Boolean(connection.locked),
    secret: Boolean(connection.secret || kind === "secret"),
    tags: unique(connection.tags),
    source: normalizeString(connection.source),
    reason: normalizeString(connection.reason, "explicit-dungeon-connection"),
  };
  connections.push(normalized);
  return normalized;
}

function normalizeDungeonConnections(inputConnections = [], roomBriefs = []) {
  const roomIds = roomBriefs.map((room) => room.id).filter(Boolean);
  const roomIdSet = new Set(roomIds);
  const connections = [];

  asArray(inputConnections).forEach((connection) => addConnection(connections, connection, roomIdSet));
  if (connections.length > 0 || roomBriefs.length <= 1) return connections;

  const pathRooms = buildInferredMainPath(roomBriefs);
  for (let index = 0; index < pathRooms.length - 1; index += 1) {
    addConnection(
      connections,
      {
        from: pathRooms[index].id,
        to: pathRooms[index + 1].id,
        kind: "main",
        tags: ["inferred", "critical-path"],
        source: "inferred",
        reason: "inferred-compact-main-path",
      },
      roomIdSet,
    );
  }

  const pathIndexById = new Map(pathRooms.map((room, index) => [room.id, index]));
  roomBriefs.forEach((room, roomIndex) => {
    if (pathIndexById.has(room.id)) return;
    const anchor = selectBranchAnchor(pathRooms, room, roomIndex);
    if (!anchor || anchor.id === room.id) return;
    const kind = isSecretRoom(room) ? "secret" : isServiceRoom(room) ? "service" : "secondary";
    addConnection(
      connections,
      {
        from: anchor.id,
        to: room.id,
        kind,
        secret: kind === "secret",
        tags: ["inferred", kind, "branch"],
        source: "inferred",
        reason: `inferred-${kind}-branch`,
      },
      roomIdSet,
    );
  });

  roomBriefs.forEach((room) => {
    if (!isLoopRoom(room)) return;
    const roomPathIndex = pathIndexById.get(room.id);
    if (!Number.isFinite(roomPathIndex)) return;
    const exitRoom = pathRooms[Math.min(pathRooms.length - 1, roomPathIndex + 2)];
    if (!exitRoom || exitRoom.id === room.id) return;
    addConnection(
      connections,
      {
        from: room.id,
        to: exitRoom.id,
        kind: "secondary",
        tags: ["inferred", "loop"],
        source: "inferred",
        reason: "inferred-loop-return",
      },
      roomIdSet,
    );
  });

  return connections;
}

function createConnectionEndpointMap(roomBriefs, requiredRegions) {
  const endpointMap = new Map();
  roomBriefs.forEach((room, index) => {
    const requiredRegion = requiredRegions[index];
    const targetId = requiredRegion?.id;
    if (!targetId) return;
    [room.id, room.sourceRegionId, room.name, `room-${room.index}`, String(room.index)]
      .filter(Boolean)
      .forEach((key) => endpointMap.set(String(key), targetId));
  });
  return endpointMap;
}

function mapDungeonConnectionsToMapConnections(brief, requiredRegions) {
  const endpointMap = createConnectionEndpointMap(brief.roomBriefs, requiredRegions);
  const regionIds = new Set(requiredRegions.map((region) => region.id).filter(Boolean));

  return asArray(brief.connections)
    .map((connection, index) => {
      const from = endpointMap.get(String(connection.from)) || connection.from;
      const to = endpointMap.get(String(connection.to)) || connection.to;
      if (!regionIds.has(from) || !regionIds.has(to) || from === to) return null;
      return {
        id: normalizeString(connection.id, createConnectionId(from, to, index, connection.kind)),
        from,
        to,
        kind: normalizeConnectionKind(connection.kind),
        locked: Boolean(connection.locked),
        secret: Boolean(connection.secret || connection.kind === "secret"),
        tags: unique(connection.tags),
        source: normalizeString(connection.source),
        reason: normalizeString(connection.reason, "dungeon-brief-connection"),
        dungeonConnectionId: connection.id,
      };
    })
    .filter(Boolean);
}

export function createRoomBrief(input = {}, index = 0, { theme = null } = {}) {
  const normalizedTheme = normalizeDungeonTheme(theme);
  const metadata = input.metadata && typeof input.metadata === "object" ? input.metadata : {};
  const assignedComponents = asArray(input.assignedComponents || metadata.assignedComponents).filter(Boolean);
  const hasMergedMapInfluence = Boolean(
    input.schemaVersion ||
      input.mapInfluence?.sources ||
      metadata.mapInfluence?.sources ||
      metadata.dungeonRoomBrief,
  );
  const componentInfluences = hasMergedMapInfluence
    ? []
    : assignedComponents
        .map((component) => normalizeMapInfluence(getMapInfluenceSource(component)))
        .filter(Boolean);
  const declaredRoomArchetypeSource = normalizeString(
    input.roomArchetypeSource || metadata.roomArchetypeSource,
  );
  const rawDirectRoomArchetype =
    input.roomArchetype ||
    input.roomArchetypeId ||
    input.archetype ||
    metadata.roomArchetype ||
    metadata.roomArchetypeId ||
    metadata.archetype ||
    "";
  const directRoomArchetype = normalizeString(
    declaredRoomArchetypeSource === "map-influence" ? "" : rawDirectRoomArchetype,
  );
  const regionInfluence = normalizeMapInfluence({
    ...(getMapInfluenceSource(input) || {}),
    ...(getMapInfluenceSource(metadata) || {}),
    roomArchetype:
      rawDirectRoomArchetype ||
      getMapInfluenceSource(input)?.roomArchetype ||
      getMapInfluenceSource(metadata)?.roomArchetype ||
      "",
  });
  const mapInfluence = mergeMapInfluences([regionInfluence, ...componentInfluences]);
  const influencedRoomArchetype = getRoomArchetypeFromMapInfluence(mapInfluence);
  const roomArchetype = normalizeString(directRoomArchetype || influencedRoomArchetype);
  const roomArchetypeSource = directRoomArchetype ? "explicit" : roomArchetype ? "map-influence" : "";
  const sourceRegionId = normalizeString(input.sourceRegionId || input.id || metadata.sourceRegionId, createRoomId(index));
  const role = normalizeString(input.role, normalizedTheme.roomRoleSequence[index % Math.max(1, normalizedTheme.roomRoleSequence.length)] || "location region");
  const type = normalizeString(input.type || input.roomType || input.shape || input.preferredShape, normalizedTheme.roomTypeBias[index % Math.max(1, normalizedTheme.roomTypeBias.length)] || "room");
  const sensoryLayer = normalizeString(input.sensoryLayer || metadata.sensoryLayer, normalizedTheme.sensoryPalette[index % Math.max(1, normalizedTheme.sensoryPalette.length)] || "");
  const visualSigns = normalizeString(input.visualSigns || input.feature || metadata.feature, normalizedTheme.visualPalette[index % Math.max(1, normalizedTheme.visualPalette.length)] || "");

  return {
    schemaVersion: DUNGEON_BRIEF_SCHEMA_VERSION,
    id: normalizeString(input.roomBriefId || metadata.roomBriefId, createRoomId(index)),
    index: normalizeInteger(input.index, index + 1, { min: 1, max: 99 }),
    name: normalizeString(input.name || input.label, createRoomNameFallback(index, normalizedTheme)),
    role,
    type,
    size: normalizeRoomSize(input.size || metadata.size),
    level: normalizeInteger(input.level ?? metadata.level, 0, { min: -9, max: 9 }),
    connectors: normalizeInteger(input.connectors, index === 0 ? 2 : 1, { min: 0, max: 8 }),
    density: normalizeString(input.density || metadata.density, "interactive"),
    shape: normalizeString(input.shape || input.preferredShape, type),
    roomArchetype,
    roomArchetypeSource,
    mapInfluence,
    sourceRegionId,
    sourceAnchors: unique(input.sourceAnchors || metadata.sourceAnchors || normalizedTheme.sourceAnchorIds),
    horror: unique(input.horror || metadata.horror),
    contexts: unique(input.contexts || metadata.contexts),
    tags: unique(input.tags || metadata.tags),
    sensoryLayer,
    visualSigns,
    hazard: normalizeString(input.hazard || input.danger || metadata.danger),
    reward: normalizeString(input.reward || metadata.reward),
    encounter: normalizeString(input.encounter || input.encounterTwist || metadata.encounterTwist),
    clue: normalizeString(input.clue || input.secret || metadata.secret),
    interaction: normalizeString(input.interaction || input.interact || metadata.interaction || metadata.interact),
    readAloud:
      input.readAloud && typeof input.readAloud === "object"
        ? { ...input.readAloud }
        : input.readAloud || metadata.readAloud || "",
    secret: Boolean(input.secret || metadata.secret || unique(input.tags).some((tag) => tag.toLowerCase().includes("secret"))),
    locked: Boolean(input.locked),
    links: unique(input.links),
    notes: normalizeString(input.notes),
    assignedComponents,
    assignedSlotIds: unique(input.assignedSlotIds || metadata.assignedSlotIds || assignedComponents.map((component) => component.slotId)),
  };
}

export function createDungeonBrief(input = {}) {
  const theme = normalizeDungeonTheme(input.theme);
  const mode = input.mode === DUNGEON_BRIEF_MODE_SCRATCH ? DUNGEON_BRIEF_MODE_SCRATCH : DUNGEON_BRIEF_MODE_THEME;
  const roomInputs = asArray(input.roomBriefs);
  const roomBriefs = roomInputs.map((room, index) => createRoomBrief(room, index, { theme }));
  const roomCount = normalizeInteger(input.roomCount, roomBriefs.length || 1, { min: 1, max: 16 });
  const connections = normalizeDungeonConnections(input.connections, roomBriefs);

  return {
    schemaVersion: DUNGEON_BRIEF_SCHEMA_VERSION,
    id: normalizeString(input.id, `dungeon-brief-${normalizeString(input.seed, "draft")}`),
    mode,
    title: normalizeString(input.title, "Cursed Location Build"),
    seed: normalizeString(input.seed, ""),
    workflow: normalizeString(input.workflow, "darken-location"),
    theme,
    themeId: normalizeString(input.themeId, theme.id),
    themeName: normalizeString(input.themeName, theme.name),
    archetype: normalizeString(input.archetype, theme.defaultArchetype),
    context: normalizeString(input.context, theme.mapTypeBias[0] || "Crypt"),
    mapType: normalizeString(input.mapType, theme.mapTypeBias[0] || input.context || "Crypt"),
    roomCount,
    levelCount: normalizeInteger(input.levelCount, 1, { min: 1, max: 6 }),
    density: normalizeString(input.density, theme.layoutBias?.density || "standard"),
    connectionStyle: normalizeString(input.connectionStyle, theme.layoutBias?.connectionStyle || "branching"),
    verticality: normalizeString(input.verticality, theme.layoutBias?.verticality || "flat"),
    danger: normalizeString(input.danger, "standard"),
    secrets: normalizeString(input.secrets, "few"),
    sourceAnchors: unique(input.sourceAnchors || theme.sourceAnchorIds),
    horror: unique(input.horror),
    globalPalette: {
      sensory: unique(input.globalPalette?.sensory || theme.sensoryPalette),
      visual: unique(input.globalPalette?.visual || theme.visualPalette),
      hazards: unique(input.globalPalette?.hazards || theme.hazardBias),
      rewards: unique(input.globalPalette?.rewards || theme.rewardBias),
    },
    roomBriefs,
    connections,
    metadata: {
      ...(input.metadata || {}),
      createdFrom: normalizeString(input.metadata?.createdFrom, "darken-location-composer"),
      connectionCount: connections.length,
    },
  };
}

export function roomBriefToRequiredRegion(roomBrief, index = 0) {
  const room = createRoomBrief(roomBrief, index);

  return {
    id: `map-region-${index + 1}`,
    label: room.name,
    role: room.role,
    size: room.size,
    shape: room.shape,
    roomArchetype: room.roomArchetype,
    roomArchetypeSource: room.roomArchetypeSource,
    mapInfluence: room.mapInfluence,
    connectors: room.connectors,
    density: room.density,
    links: room.links,
    sourceRegionId: room.sourceRegionId,
    metadata: {
      roomBriefId: room.id,
      roomIndex: room.index,
      roomType: room.type,
      roomArchetype: room.roomArchetype,
      roomArchetypeSource: room.roomArchetypeSource,
      mapInfluence: room.mapInfluence,
      level: room.level,
      contexts: room.contexts,
      horror: room.horror,
      sourceAnchors: room.sourceAnchors,
      feature: room.visualSigns,
      interaction: room.interaction,
      interact: room.interaction,
      danger: room.hazard,
      secret: room.clue,
      reward: room.reward,
      encounter: room.encounter,
      sensoryLayer: room.sensoryLayer,
      readAloud: room.readAloud,
      assignedComponents: room.assignedComponents,
      assignedSlotIds: room.assignedSlotIds,
      dungeonRoomBrief: room,
    },
  };
}

export function createMapRequestFromDungeonBrief(dungeonBrief = {}, { snapshot = {} } = {}) {
  const brief = createDungeonBrief(dungeonBrief);
  const requiredRegions = brief.roomBriefs.map(roomBriefToRequiredRegion);
  const connections = mapDungeonConnectionsToMapConnections(brief, requiredRegions);

  return {
    source: "dungeon-brief",
    workflow: brief.workflow,
    title: brief.title,
    seed: brief.seed,
    context: brief.context,
    mapType: brief.mapType,
    roomCount: requiredRegions.length || brief.roomCount || undefined,
    requiredRegions,
    connections,
    dungeonBrief: brief,
    metadata: {
      horror: brief.horror,
      sourceAnchors: brief.sourceAnchors,
      intrusion: normalizeString(snapshot?.intrusion),
      activeSlot: normalizeString(snapshot?.activeSlot),
      activeRegionId: normalizeString(snapshot?.activeRegionId),
      activeSlotScope: normalizeString(snapshot?.activeSlotScope),
      slotAssignments: snapshot?.slotAssignments || {},
      selectedComponents: asArray(brief.metadata?.selectedComponents || snapshot?.selectedComponents),
      dungeonConnections: brief.connections,
      regionComponentLinks: asArray(brief.metadata?.selectedComponents || snapshot?.selectedComponents)
        .filter((component) => component?.regionId)
        .map((component) => ({
          regionId: component.regionId,
          slotId: component.slotId,
          componentId: component.id,
          title: component.title,
        })),
      dungeonBrief: brief,
    },
  };
}
