import {
  SEMANTIC_SCHEMA_VERSIONS,
  canonicalizeJsonValue,
  normalizeSemanticProvenance,
  serializeCanonicalSemanticContent,
  validateInspirationModuleV2,
  validateSessionStateV1,
} from "../../../shared/content/content.index.js";

export const DARK_PLACES_MAP_INTENT_SCHEMA_VERSION =
  "cruor-dark-places-map-intent-v1";
export const DARK_PLACES_SEMANTIC_MAP_REQUEST_SCHEMA_VERSION =
  "dark-places-semantic-map-request-v1";

const SUPPORTED_MAP_TYPES = Object.freeze([
  "Crypt",
  "Chapel",
  "Cave",
  "Mine",
  "Ruins",
  "Noble House",
]);

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function cloneJson(value, fallback) {
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

function mapContextToMapType(context) {
  const text = cleanText(context).toLowerCase();
  if (text.includes("cave") || text.includes("cavern")) return "Cave";
  if (text.includes("mine")) return "Mine";
  if (text.includes("chapel") || text.includes("temple")) return "Chapel";
  if (text.includes("ruin")) return "Ruins";
  if (text.includes("noble") || text.includes("manor")) return "Noble House";
  return "Crypt";
}

function sortById(values = []) {
  return [...values].sort((left, right) =>
    `${left.id || ""}`.localeCompare(`${right.id || ""}`),
  );
}

function assertCanonicalInputs(module, session) {
  if (module?.schemaVersion !== SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE) {
    throw new Error("Map intent requires a canonical Inspiration Module v2.");
  }
  if (session?.schemaVersion !== SEMANTIC_SCHEMA_VERSIONS.SESSION_STATE) {
    throw new Error("Map intent requires a canonical Session State v1.");
  }
  const errors = [
    ...validateInspirationModuleV2(module),
    ...validateSessionStateV1(session),
  ].filter((issue) => issue.severity === "error");
  if (errors.length) {
    throw new Error(
      `Map intent input validation failed: ${errors
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join(" | ")}`,
    );
  }
}

function createComponentIntent(component = {}) {
  return {
    id: component.id,
    semanticType: component.semanticType,
    sourceAnchorIds: [...component.sourceAnchors],
    compatibility: cloneJson(component.compatibility, {}),
    generation: cloneJson(component.generation, {}),
  };
}

export function createDarkPlacesMapIntent({ module, session } = {}) {
  assertCanonicalInputs(module, session);
  const location = session.locationSeed;
  const selectedIds = new Set(
    session.selectedComponentIds.length
      ? session.selectedComponentIds
      : module.components.map((component) => component.id),
  );
  const components = sortById(
    module.components
      .filter((component) => selectedIds.has(component.id))
      .map(createComponentIntent),
  );
  const componentById = new Map(
    components.map((component) => [component.id, component]),
  );
  const requestedMapType = cleanText(location.map.mapType);
  const mapType = SUPPORTED_MAP_TYPES.includes(requestedMapType)
    ? requestedMapType
    : mapContextToMapType(location.meta.context);

  return deepFreeze(
    canonicalizeJsonValue({
      schemaVersion: DARK_PLACES_MAP_INTENT_SCHEMA_VERSION,
      id: `${session.id}-map-intent`,
      seed: session.seed,
      moduleId: module.id,
      title: location.meta.title,
      context: location.meta.context,
      mapType,
      rooms: location.map.rooms.map((room) => ({
        id: room.id,
        sourceRegionId: room.sourceRegionId,
        number: room.number,
        name: room.name,
        role: room.role,
        level: room.level,
        shape: room.shape,
        size: "medium",
        componentIds: room.sourceComponentIds.filter((id) =>
          componentById.has(id),
        ),
      })),
      connections: location.map.connections.map((connection) => ({
        id: connection.id,
        from: connection.fromRoomId,
        to: connection.toRoomId,
        kind: connection.kind,
        secret: connection.secret,
        locked: connection.locked,
        crossLevel: connection.crossLevel,
        levelDelta: connection.levelDelta,
        stairTransition: connection.stairTransition,
      })),
      components,
      metadata: {
        horror: [...location.meta.horror],
        intrusion: location.meta.intrusion,
        sourceAnchors: [...location.meta.sourceAnchors],
      },
      provenance: normalizeSemanticProvenance(session.provenance),
    }),
  );
}

export function adaptDarkPlacesMapIntentToMapRequest(intent = {}) {
  if (intent.schemaVersion !== DARK_PLACES_MAP_INTENT_SCHEMA_VERSION) {
    throw new Error(
      `Expected ${DARK_PLACES_MAP_INTENT_SCHEMA_VERSION}; received ${cleanText(intent.schemaVersion, "unversioned")}.`,
    );
  }
  const componentById = new Map(
    (Array.isArray(intent.components) ? intent.components : []).map(
      (component) => [component.id, component],
    ),
  );
  const requiredRegions = [...intent.rooms]
    .sort(
      (left, right) =>
        left.number - right.number || left.id.localeCompare(right.id),
    )
    .map((room) => ({
      id: room.id,
      sourceRegionId: room.sourceRegionId,
      label: room.name,
      name: room.name,
      role: room.role,
      level: room.level,
      size: room.size,
      shape: room.shape,
      metadata: {
        assignedComponentIds: [...room.componentIds],
        semanticComponents: room.componentIds
          .map((id) => componentById.get(id))
          .filter(Boolean)
          .map((component) => ({
            id: component.id,
            semanticType: component.semanticType,
            compatibility: cloneJson(component.compatibility, {}),
            generation: cloneJson(component.generation, {}),
          })),
      },
    }));

  return deepFreeze(
    canonicalizeJsonValue({
      schemaVersion: DARK_PLACES_SEMANTIC_MAP_REQUEST_SCHEMA_VERSION,
      source: "semantic-map-intent",
      workflow: "darken-location",
      title: intent.title,
      seed: intent.seed,
      context: intent.context,
      mapType: intent.mapType,
      roomCount: requiredRegions.length,
      requiredRegions,
      connections: [...intent.connections]
        .sort((left, right) => left.id.localeCompare(right.id))
        .map((connection) => ({
          id: connection.id,
          from: connection.from,
          to: connection.to,
          kind: connection.kind,
          secret: connection.secret,
          locked: connection.locked,
          crossLevel: connection.crossLevel,
          levelDelta: connection.levelDelta,
          stairTransition: connection.stairTransition,
        })),
      componentPlacements: requiredRegions.flatMap((room) =>
        room.metadata.assignedComponentIds.map((componentId) => ({
          id: `${room.id}-${componentId}`,
          componentId,
          sourceRegionId: room.sourceRegionId,
          regionId: room.id,
          effect: cloneJson(
            componentById.get(componentId)?.generation?.effect,
            null,
          ),
        })),
      ),
      manualOverrides: {},
      metadata: {
        ...cloneJson(intent.metadata, {}),
        mapIntentId: intent.id,
        moduleId: intent.moduleId,
        provenance: cloneJson(intent.provenance, {}),
      },
    }),
  );
}

export function serializeDarkPlacesMapIntent(intent = {}) {
  return serializeCanonicalSemanticContent(intent);
}
