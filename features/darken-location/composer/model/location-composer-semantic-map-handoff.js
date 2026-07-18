import { serializeCanonicalSemanticContent } from "../../../../shared/content/content.index.js";
import {
  cloneManualOverrides,
  createEmptyManualOverrides,
} from "../../map-generator/map-generator.state.js";

export const DARK_PLACES_SEMANTIC_MAP_HANDOFF_SCHEMA_VERSION =
  "cruor-dark-places-semantic-map-handoff-v1";

export const DARK_PLACES_MAP_CHANGE_EFFECTS = Object.freeze({
  topology: Object.freeze([
    "seed",
    "context",
    "map type or dimensions",
    "room identity, role, level, shape, size or archetype",
    "connections",
  ]),
  content: Object.freeze(["map title", "room label or name"]),
  metadata: Object.freeze([
    "component placements",
    "palette",
    "provenance",
    "map and room markers",
  ]),
  roomConstraints: Object.freeze([
    "room shape, size, archetype or design",
    "room map influence",
    "assigned semantic components",
  ]),
});

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function cloneJson(value, fallback = null) {
  try {
    return value === undefined ? fallback : JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function createFingerprint(value) {
  const canonical = serializeCanonicalSemanticContent(value);
  let hash = 2166136261;
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${(hash >>> 0).toString(16).padStart(8, "0")}-${canonical.length}`;
}

function getRoomId(room = {}, index = 0) {
  return room.sourceRegionId || room.id || `room-${index + 1}`;
}

function getRoomDesign(room = {}) {
  return (
    room.roomDesign ||
    room.effectiveRoomDesign ||
    room.metadata?.roomDesign ||
    room.metadata?.effectiveRoomDesign ||
    null
  );
}

function getMapInfluence(room = {}) {
  return room.mapInfluence || room.metadata?.mapInfluence || null;
}

function getRoomArchetype(room = {}) {
  return (
    room.roomArchetype ||
    room.roomArchetypeId ||
    room.metadata?.roomArchetype ||
    room.metadata?.roomArchetypeId ||
    ""
  );
}

function createTopologyProjection(request = {}) {
  return {
    seed: request.seed || "",
    context: request.context || "",
    mapType: request.mapType || "",
    mapWidth: request.mapWidth || null,
    mapHeight: request.mapHeight || null,
    contextGraphAdapterMode:
      request.contextGraphAdapterMode ||
      request.metadata?.contextGraphAdapterMode ||
      "",
    rooms: asArray(request.requiredRegions).map((room, index) => ({
      id: getRoomId(room, index),
      requestId: room.id || "",
      role: room.role || "",
      level: Number(room.level || 0),
      shape: room.shape || room.preferredShape || "",
      size: room.size || "",
      roomArchetype: getRoomArchetype(room),
      roomDesign: getRoomDesign(room),
      mapInfluence: getMapInfluence(room),
      connectors: Number(room.connectors || 0),
      links: asArray(room.links),
      entrance: Boolean(room.isEntrance),
      exit: Boolean(room.isExit),
      secret: Boolean(room.secret || room.isSecretRoom),
    })),
    connections: asArray(request.connections)
      .map((connection) => ({
        id: connection.id || "",
        from: connection.from || "",
        to: connection.to || "",
        kind: connection.kind || "main",
        locked: Boolean(connection.locked),
        secret: Boolean(connection.secret),
        crossLevel: Boolean(connection.crossLevel),
        levelDelta: Number(connection.levelDelta || 0),
        stairTransition: connection.stairTransition || null,
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
  };
}

function createContentProjection(request = {}) {
  return {
    title: request.title || "",
    rooms: asArray(request.requiredRegions).map((room, index) => ({
      id: getRoomId(room, index),
      label: room.label || "",
      name: room.name || "",
    })),
  };
}

function createMetadataProjection(request = {}) {
  return {
    componentPlacements: asArray(request.componentPlacements),
    globalPalette: request.globalPalette || {},
    metadata: request.metadata || {},
    rooms: asArray(request.requiredRegions).map((room, index) => ({
      id: getRoomId(room, index),
      componentPlacements:
        room.componentPlacements || room.metadata?.componentPlacements || [],
      metadata: room.metadata || {},
    })),
  };
}

function createRoomConstraintProjection(room = {}, index = 0) {
  return {
    id: getRoomId(room, index),
    shape: room.shape || room.preferredShape || "",
    size: room.size || "",
    roomArchetype: getRoomArchetype(room),
    roomDesign: getRoomDesign(room),
    mapInfluence: getMapInfluence(room),
    assignedComponentIds:
      room.metadata?.assignedComponentIds ||
      room.metadata?.assignedComponents?.map(
        (component) => component.id || component.componentId,
      ) ||
      [],
    semanticComponents: room.metadata?.semanticComponents || [],
  };
}

function createRequestFingerprints(request = {}) {
  const roomConstraints = asArray(request.requiredRegions).map(
    createRoomConstraintProjection,
  );
  return {
    requestFingerprint: createFingerprint(request),
    topologyFingerprint: createFingerprint(createTopologyProjection(request)),
    contentFingerprint: createFingerprint(createContentProjection(request)),
    metadataFingerprint: createFingerprint(createMetadataProjection(request)),
    roomConstraintFingerprint: createFingerprint(roomConstraints),
    roomConstraints,
  };
}

function getInvalidatedRoomIds(previousRooms = [], nextRooms = []) {
  const previousById = new Map(
    previousRooms.map((room) => [room.id, serializeCanonicalSemanticContent(room)]),
  );
  const nextById = new Map(
    nextRooms.map((room) => [room.id, serializeCanonicalSemanticContent(room)]),
  );
  return [...new Set([...previousById.keys(), ...nextById.keys()])]
    .filter((roomId) => previousById.get(roomId) !== nextById.get(roomId))
    .sort();
}

export function classifyDarkPlacesSemanticMapChange(
  previousRequest = null,
  nextRequest = null,
) {
  const previous = previousRequest
    ? createRequestFingerprints(previousRequest)
    : null;
  const next = createRequestFingerprints(nextRequest || {});
  const initial = !previous;
  const topologyChanged =
    initial || previous.topologyFingerprint !== next.topologyFingerprint;
  const contentChanged =
    initial || previous.contentFingerprint !== next.contentFingerprint;
  const metadataChanged =
    initial || previous.metadataFingerprint !== next.metadataFingerprint;
  const roomConstraintsInvalidated =
    initial ||
    previous.roomConstraintFingerprint !== next.roomConstraintFingerprint;

  return deepFreeze({
    initial,
    topologyChanged,
    contentChanged,
    metadataChanged,
    roomConstraintsInvalidated,
    invalidatedRoomIds: initial
      ? next.roomConstraints.map((room) => room.id).sort()
      : getInvalidatedRoomIds(previous.roomConstraints, next.roomConstraints),
    effect: topologyChanged
      ? "regenerate-topology"
      : roomConstraintsInvalidated
        ? "invalidate-room-constraints"
        : contentChanged
          ? "update-content"
          : metadataChanged
            ? "update-metadata-markers"
            : "none",
  });
}

function normalizeHandoffRequest(request = {}) {
  const normalized = cloneJson(request, {});
  delete normalized.manualOverrides;
  return normalized;
}

function getPlacementIdentity(placement = {}, index = 0) {
  return (
    placement.id ||
    [
      placement.componentId || "component",
      placement.sourceRegionId || placement.regionId || "map",
      placement.effect?.kind || placement.markerKind || index,
    ].join(":")
  );
}

function mergeComponentPlacements(...collections) {
  const byId = new Map();
  collections.flatMap(asArray).forEach((placement, index) => {
    byId.set(getPlacementIdentity(placement, index), cloneJson(placement, {}));
  });
  return [...byId.values()].sort((left, right) =>
    getPlacementIdentity(left).localeCompare(getPlacementIdentity(right)),
  );
}

function findFallbackRoom(fallbackRooms, semanticRoom, index) {
  const identities = new Set(
    [semanticRoom.id, semanticRoom.sourceRegionId].filter(Boolean),
  );
  return (
    fallbackRooms.find((room) =>
      [room.id, room.sourceRegionId].some((id) => identities.has(id)),
    ) || fallbackRooms[index] || null
  );
}

function mergeSemanticRoomWithGeneratorHints(
  semanticRoom,
  fallbackRoom,
) {
  if (!fallbackRoom) return cloneJson(semanticRoom, {});
  const fallbackMetadata = fallbackRoom.metadata || {};
  const semanticMetadata = semanticRoom.metadata || {};
  return {
    ...cloneJson(fallbackRoom, {}),
    ...cloneJson(semanticRoom, {}),
    size: fallbackRoom.size || semanticRoom.size || "medium",
    roomArchetype:
      getRoomArchetype(fallbackRoom) || getRoomArchetype(semanticRoom),
    roomArchetypeSource:
      fallbackRoom.roomArchetypeSource ||
      fallbackMetadata.roomArchetypeSource ||
      semanticRoom.roomArchetypeSource ||
      semanticMetadata.roomArchetypeSource ||
      "",
    roomDesign: getRoomDesign(fallbackRoom) || getRoomDesign(semanticRoom),
    mapInfluence: getMapInfluence(fallbackRoom) || getMapInfluence(semanticRoom),
    componentPlacements: mergeComponentPlacements(
      fallbackRoom.componentPlacements || fallbackMetadata.componentPlacements,
      semanticRoom.componentPlacements || semanticMetadata.componentPlacements,
    ),
    metadata: {
      ...cloneJson(fallbackMetadata, {}),
      ...cloneJson(semanticMetadata, {}),
    },
  };
}

function mergeSemanticRequestWithGeneratorHints(
  semanticRequest = {},
  fallbackRequest = {},
) {
  const fallbackRooms = asArray(fallbackRequest.requiredRegions);
  const requiredRegions = asArray(semanticRequest.requiredRegions).map(
    (semanticRoom, index) =>
      mergeSemanticRoomWithGeneratorHints(
        semanticRoom,
        findFallbackRoom(fallbackRooms, semanticRoom, index),
      ),
  );
  return {
    ...cloneJson(fallbackRequest, {}),
    ...cloneJson(semanticRequest, {}),
    seed: semanticRequest.seed || fallbackRequest.seed || "",
    requiredRegions,
    connections: cloneJson(semanticRequest.connections, []),
    componentPlacements: mergeComponentPlacements(
      fallbackRequest.componentPlacements,
      semanticRequest.componentPlacements,
    ),
    metadata: {
      ...cloneJson(fallbackRequest.metadata, {}),
      ...cloneJson(semanticRequest.metadata, {}),
    },
  };
}

export function createDarkPlacesSemanticMapHandoff({
  semanticPreview = null,
  fallbackMapRequest = null,
  manualOverrides = createEmptyManualOverrides(),
} = {}) {
  const semanticReady = Boolean(
    semanticPreview?.mapRequest?.source === "semantic-map-intent",
  );
  const selectedRequest = semanticReady
    ? mergeSemanticRequestWithGeneratorHints(
        semanticPreview.mapRequest,
        fallbackMapRequest || {},
      )
    : fallbackMapRequest || semanticPreview?.mapRequest || {};
  const mapRequest = normalizeHandoffRequest(selectedRequest);
  const fingerprints = createRequestFingerprints(mapRequest);
  const normalizedManualOverrides = cloneManualOverrides(manualOverrides);

  return deepFreeze({
    schemaVersion: DARK_PLACES_SEMANTIC_MAP_HANDOFF_SCHEMA_VERSION,
    mode: semanticReady ? "semantic" : "legacy-fallback",
    semanticPreviewFingerprint: semanticPreview?.compilerFingerprint || "",
    mapRequest,
    manualOverrides: normalizedManualOverrides,
    requestFingerprint: fingerprints.requestFingerprint,
    topologyFingerprint: fingerprints.topologyFingerprint,
    contentFingerprint: fingerprints.contentFingerprint,
    metadataFingerprint: fingerprints.metadataFingerprint,
    roomConstraintFingerprint: fingerprints.roomConstraintFingerprint,
    policy: DARK_PLACES_MAP_CHANGE_EFFECTS,
  });
}
