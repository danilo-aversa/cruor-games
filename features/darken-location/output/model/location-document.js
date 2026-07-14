export const DARK_PLACES_DOCUMENT_SCHEMA_VERSION = "dark-places-document-v1";

export const DARK_PLACES_DOCUMENT_AUDIENCES = Object.freeze([
  "gm",
  "player",
  "both",
]);

export const DARK_PLACES_DOCUMENT_BLOCK_KINDS = Object.freeze([
  "premise",
  "readAloud",
  "sensory",
  "feature",
  "interaction",
  "hazard",
  "clue",
  "encounterTwist",
  "secret",
  "reward",
  "note",
]);

export const DARK_PLACES_DOCUMENT_FACET_IDS = Object.freeze([
  "premise",
  "readAloud",
  "impression",
  "description",
  "interaction",
  "observation",
  "openingSign",
  "trigger",
  "detection",
  "discovery",
  "revelation",
  "resolution",
  "change",
  "effect",
  "cost",
  "escalation",
  "consequence",
  "counterplay",
  "guidance",
  "note",
]);

const SLOT_KIND_MAP = Object.freeze({
  horrorPremise: "premise",
  sensoryLayer: "sensory",
  visibleAnomaly: "feature",
  hazard: "hazard",
  clue: "clue",
  encounterTwist: "encounterTwist",
  reward: "reward",
});

function asArray(value) {
  if (!value) return [];
  if (value instanceof Set) return [...value].filter(Boolean);
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function uniqueStrings(values = []) {
  return [
    ...new Set(
      asArray(values)
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  ];
}

function cleanText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function hasMeaningfulText(value) {
  const text = cleanText(value);
  if (!text) return false;
  const normalized = text.toLowerCase();
  if (["—", "_missing._", "missing", "no table text yet."].includes(normalized)) {
    return false;
  }
  return !/^no .+ assigned yet\.?$/.test(normalized);
}

function clonePlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? JSON.parse(JSON.stringify(value))
    : null;
}

function finiteNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeAudience(value, fallback = "gm") {
  const audience = cleanText(value).toLowerCase();
  return DARK_PLACES_DOCUMENT_AUDIENCES.includes(audience) ? audience : fallback;
}

function normalizeFacetEntries(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value)
    .map(([key, nestedValue]) => {
      const normalizedValue = Array.isArray(nestedValue)
        ? nestedValue.map((entry) => cleanText(entry)).filter(Boolean).join(", ")
        : typeof nestedValue === "object" && nestedValue !== null
          ? JSON.stringify(nestedValue)
          : cleanText(nestedValue);
      return normalizedValue
        ? {
            key,
            label: key
              .replace(/([A-Z])/g, " $1")
              .replace(/[-_]+/g, " ")
              .replace(/^./, (letter) => letter.toUpperCase()),
            value: normalizedValue,
          }
        : null;
    })
    .filter(Boolean);
}

function createDocumentFacet(id, value, audience = "gm") {
  if (!DARK_PLACES_DOCUMENT_FACET_IDS.includes(id) || value === null || value === undefined) {
    return null;
  }

  const facet = {
    id,
    audience: normalizeAudience(audience),
    text: "",
    items: [],
    entries: [],
  };

  if (typeof value === "string") {
    facet.text = cleanText(value);
  } else if (Array.isArray(value)) {
    facet.items = uniqueStrings(value);
  } else if (typeof value === "object") {
    facet.entries = normalizeFacetEntries(value);
  } else {
    facet.text = cleanText(value);
  }

  return facet.text || facet.items.length || facet.entries.length ? facet : null;
}

function createBlockFacets({
  kind,
  text,
  mechanics,
  counterplay,
  narrative,
  audience,
} = {}) {
  const primaryFacetByKind = {
    premise: "premise",
    readAloud: "readAloud",
    sensory: "impression",
    feature: "description",
    interaction: "interaction",
    hazard: "description",
    clue: "observation",
    encounterTwist: "openingSign",
    secret: "revelation",
    reward: "discovery",
    note: "note",
  };
  const mechanicsFacetByKind = {
    premise: "resolution",
    feature: "resolution",
    interaction: "resolution",
    hazard: "resolution",
    clue: "revelation",
    encounterTwist: "change",
    secret: "discovery",
    reward: "effect",
  };
  const primaryFacetId = primaryFacetByKind[kind] || "note";
  const mechanicsFacetId = mechanicsFacetByKind[kind] || "resolution";
  const narrativeFacetId = "guidance";

  return [
    createDocumentFacet(primaryFacetId, text, audience),
    createDocumentFacet(mechanicsFacetId, mechanics, "gm"),
    createDocumentFacet("counterplay", counterplay, "gm"),
    createDocumentFacet(narrativeFacetId, narrative, "gm"),
  ].filter(Boolean);
}

function getComponentAudience(component = {}, fallback = "gm") {
  if (component.slotId === "secret") return "gm";
  const output = component.effect?.output || component.locationEffect?.output || {};
  if (output.gmFacingOnly === true) return "gm";
  if (output.playerFacing === true && output.gmFacingOnly !== true) return "both";
  if (output.readAloud === true) return "both";
  return normalizeAudience(component.audience, fallback);
}

function createDocumentBlock({
  id,
  kind,
  subtype = "",
  title = "",
  text = "",
  summary = "",
  audience = "gm",
  sourceComponentId = "",
  sourceAnchorIds = [],
  mapReference = null,
  mechanics = null,
  counterplay = "",
  narrative = "",
  provenance = null,
  metadata = null,
} = {}) {
  const normalizedText = cleanText(text || summary);
  if (!hasMeaningfulText(normalizedText)) return null;
  const normalizedKind = DARK_PLACES_DOCUMENT_BLOCK_KINDS.includes(kind) ? kind : "note";
  const normalizedAudience = normalizeAudience(audience);

  return {
    id: cleanText(id, `${kind || "note"}-${sourceComponentId || "authored"}`),
    kind: normalizedKind,
    subtype: cleanText(subtype, normalizedKind),
    title: cleanText(title),
    text: normalizedText,
    summary: cleanText(summary),
    audience: normalizedAudience,
    facets: createBlockFacets({
      kind: normalizedKind,
      text: normalizedText,
      mechanics,
      counterplay,
      narrative,
      audience: normalizedAudience,
    }),
    sourceComponentId: cleanText(sourceComponentId),
    sourceAnchorIds: uniqueStrings(sourceAnchorIds),
    mapReference: mapReference ? { ...mapReference } : null,
    mechanics:
      typeof mechanics === "string"
        ? cleanText(mechanics)
        : clonePlainObject(mechanics),
    counterplay: cleanText(counterplay),
    narrative: cleanText(narrative),
    provenance: clonePlainObject(provenance) || {},
    metadata: clonePlainObject(metadata) || {},
  };
}

function getComponentKind(component = {}) {
  return SLOT_KIND_MAP[component.slotId] || "note";
}

function createComponentBlock(component = {}, mapReference = null) {
  const kind = getComponentKind(component);
  return createDocumentBlock({
    id: component.placementId || component.id,
    kind,
    subtype: component.subtype || component.location?.subtype || component.location?.hazardType || kind,
    title: component.title || component.slotLabel,
    text: component.text || component.summary,
    summary: component.summary,
    audience: getComponentAudience(component),
    sourceComponentId: component.id,
    sourceAnchorIds:
      component.sourceAnchors ||
      component.effect?.provenance?.sourceAnchors ||
      component.provenance?.sourceAnchors,
    mapReference,
    mechanics: component.mechanics,
    counterplay: component.counterplay,
    narrative: component.narrative,
    provenance: component.provenance,
    metadata: {
      slotId: component.slotId || "",
      slotLabel: component.slotLabel || "",
      componentType: component.type || "",
      tableRole: component.tableRole || component.location?.tableRole || "",
      subtype: component.subtype || component.location?.subtype || component.location?.hazardType || kind,
      strategy: component.strategy || "",
      visualCue: component.visualCue || "",
      effectSchemaVersion: component.effect?.schemaVersion || "",
    },
  });
}

function createAuthoredBlock({
  roomId,
  kind,
  title,
  text,
  audience = "gm",
  sourceRegionId = "",
} = {}) {
  return createDocumentBlock({
    id: `${roomId || sourceRegionId || "room"}-${kind}`,
    kind,
    title,
    text,
    audience,
    mapReference: roomId
      ? {
          roomId,
          sourceRegionId,
        }
      : null,
    provenance: {
      source: "location-region",
      sourceRegionId,
    },
  });
}

function dedupeBlocks(blocks = []) {
  const seen = new Set();
  return asArray(blocks).filter((block) => {
    if (!block) return false;
    const key = [
      block.kind,
      block.text.toLowerCase(),
    ].join("::");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getDetailValue(section = {}, label = "") {
  return asArray(section.detailRows).find((row) => row?.label === label)?.value || "";
}

function getRoomLevel(section = {}) {
  return finiteNumber(
    section.room?.level ??
      section.room?.requestMetadata?.level ??
      section.region?.level ??
      section.region?.metadata?.level,
    0,
  );
}

function getRoomShape(section = {}) {
  return cleanText(
    section.room?.shape ||
      section.room?.surfaceKind ||
      section.region?.shape ||
      section.region?.preferredShape,
  );
}

function createEndpointResolver(roomSections = [], mapRequest = {}) {
  const endpointToRoomId = new Map();
  const roomById = new Map();
  const requiredRegions = asArray(mapRequest.requiredRegions);

  roomSections.forEach((section, index) => {
    const canonicalId = cleanText(section.region?.id || section.id, `room-${index + 1}`);
    roomById.set(canonicalId, section);
    const requiredRegion = requiredRegions[index] || {};
    [
      canonicalId,
      section.id,
      section.room?.id,
      section.room?.sourceRegionId,
      section.room?.requestMetadata?.sourceRegionId,
      requiredRegion.id,
      requiredRegion.sourceRegionId,
      requiredRegion.metadata?.sourceRegionId,
    ]
      .map((value) => cleanText(value))
      .filter(Boolean)
      .forEach((value) => endpointToRoomId.set(value, canonicalId));
  });

  return {
    resolve(value) {
      const endpoint = cleanText(value);
      return endpointToRoomId.get(endpoint) || endpoint;
    },
    getRoom(roomId) {
      return roomById.get(roomId) || null;
    },
  };
}

function normalizeConnection(connection = {}, resolver, index = 0) {
  const fromRoomId = resolver.resolve(connection.from || connection.fromRegionId);
  const toRoomId = resolver.resolve(connection.to || connection.toRegionId);
  if (!fromRoomId || !toRoomId || fromRoomId === toRoomId) return null;

  const kind = cleanText(
    connection.corridorRenderProfile?.type || connection.corridorType || connection.kind,
    "main",
  );
  const secret = Boolean(connection.secret || kind === "secret");
  const fromLevel = finiteNumber(connection.fromLevel, null);
  const toLevel = finiteNumber(connection.toLevel, null);

  return {
    id: cleanText(connection.id, `connection-${index + 1}`),
    fromRoomId,
    toRoomId,
    kind,
    secret,
    locked: Boolean(connection.locked),
    crossLevel: Boolean(
      connection.crossLevel ||
        connection.verticalTransition ||
        (fromLevel !== null && toLevel !== null && fromLevel !== toLevel),
    ),
    fromLevel,
    toLevel,
    levelDelta: finiteNumber(
      connection.levelDelta,
      fromLevel !== null && toLevel !== null ? toLevel - fromLevel : 0,
    ),
    stairTransition: cleanText(
      connection.stairTransition?.type ||
        connection.stairTransition ||
        connection.levelTransition?.type,
    ),
    source: cleanText(connection.source, "map"),
  };
}

function createConnections(roomSections = [], mapRequest = {}, generatedMapPreview = null) {
  const resolver = createEndpointResolver(roomSections, mapRequest);
  const candidates = [
    ...asArray(generatedMapPreview?.corridors).map((corridor) => ({
      ...corridor,
      source: corridor.source || "generated-map",
    })),
    ...asArray(mapRequest.connections).map((connection) => ({
      ...connection,
      source: connection.source || "map-request",
    })),
  ];
  const connectionById = new Map();
  const order = [];

  candidates.forEach((candidate, index) => {
    const connection = normalizeConnection(candidate, resolver, index);
    if (!connection) return;
    const key = connection.id;
    const current = connectionById.get(key);
    if (!current) {
      connectionById.set(key, connection);
      order.push(key);
      return;
    }

    connectionById.set(key, {
      ...current,
      kind:
        current.kind === "normal" || current.kind === "main"
          ? connection.kind || current.kind
          : current.kind,
      secret: current.secret || connection.secret,
      locked: current.locked || connection.locked,
      crossLevel: current.crossLevel || connection.crossLevel,
      fromLevel: current.fromLevel ?? connection.fromLevel,
      toLevel: current.toLevel ?? connection.toLevel,
      levelDelta:
        current.crossLevel || current.levelDelta
          ? current.levelDelta
          : connection.levelDelta,
      stairTransition: current.stairTransition || connection.stairTransition,
      source: uniqueStrings([current.source, connection.source]).join("+") || "map",
    });
  });

  return {
    connections: order.map((key) => connectionById.get(key)).filter(Boolean),
    resolver,
  };
}

function createRoomConnections(roomId, connections = [], resolver) {
  return connections
    .filter((connection) => connection.fromRoomId === roomId || connection.toRoomId === roomId)
    .map((connection) => {
      const targetRoomId =
        connection.fromRoomId === roomId
          ? connection.toRoomId
          : connection.fromRoomId;
      const targetSection = resolver.getRoom(targetRoomId);
      return {
        connectionId: connection.id,
        targetRoomId,
        targetRoomNumber: targetSection?.roomNumber || null,
        targetRoomName: cleanText(targetSection?.region?.name),
        kind: connection.kind,
        secret: connection.secret,
        locked: connection.locked,
        crossLevel: connection.crossLevel,
        fromLevel: connection.fromLevel,
        toLevel: connection.toLevel,
        levelDelta:
          connection.fromRoomId === roomId
            ? connection.levelDelta
            : -connection.levelDelta,
        stairTransition: connection.stairTransition,
      };
    })
    .sort((left, right) => {
      const leftNumber = finiteNumber(left.targetRoomNumber, Number.MAX_SAFE_INTEGER);
      const rightNumber = finiteNumber(right.targetRoomNumber, Number.MAX_SAFE_INTEGER);
      return leftNumber - rightNumber || left.targetRoomName.localeCompare(right.targetRoomName);
    });
}

function createRoomDocument(section = {}, connections = [], resolver) {
  const roomId = cleanText(section.region?.id || section.id);
  const roomNumber = finiteNumber(section.roomNumber, 0);
  const mapReference = {
    roomId,
    sourceRegionId: roomId,
    generatedRoomId: cleanText(section.room?.id),
    roomNumber,
  };
  const componentBlocks = dedupeBlocks(
    [...asArray(section.components), ...asArray(section.placedComponents)].map((component) =>
      createComponentBlock(component, mapReference),
    ),
  );
  const componentBlocksByKind = componentBlocks.reduce((groups, block) => {
    groups[block.kind] ||= [];
    groups[block.kind].push(block);
    return groups;
  }, {});

  const authoredBlocks = [
    createAuthoredBlock({
      roomId,
      sourceRegionId: roomId,
      kind: "readAloud",
      title: "Read-Aloud",
      text: section.readAloud,
      audience: "both",
    }),
    createAuthoredBlock({
      roomId,
      sourceRegionId: roomId,
      kind: "sensory",
      title: "Sensory",
      text: section.sensory,
    }),
    createAuthoredBlock({
      roomId,
      sourceRegionId: roomId,
      kind: "feature",
      title: "Feature",
      text: section.feature,
    }),
    createAuthoredBlock({
      roomId,
      sourceRegionId: roomId,
      kind: "interaction",
      title: "Interaction",
      text: getDetailValue(section, "Interaction"),
    }),
    createAuthoredBlock({
      roomId,
      sourceRegionId: roomId,
      kind: "hazard",
      title: "Danger",
      text: section.danger,
    }),
    createAuthoredBlock({
      roomId,
      sourceRegionId: roomId,
      kind: "secret",
      title: "Secret",
      text: section.secret,
      audience: "gm",
    }),
    createAuthoredBlock({
      roomId,
      sourceRegionId: roomId,
      kind: "reward",
      title: "Reward / Consequence",
      text: section.reward,
    }),
  ].filter(Boolean);

  const blocks = dedupeBlocks([...componentBlocks, ...authoredBlocks]);
  const blocksOfKind = (kind) => blocks.filter((block) => block.kind === kind);
  const missingSlotIds = uniqueStrings(section.missingSlotIds);

  return {
    id: roomId,
    sourceRegionId: roomId,
    generatedRoomId: cleanText(section.room?.id),
    number: roomNumber,
    name: cleanText(section.region?.name, `Room ${roomNumber || "—"}`),
    role: cleanText(section.role, "Room"),
    level: getRoomLevel(section),
    shape: getRoomShape(section),
    mapLabel: cleanText(section.mapLabel),
    readiness: {
      status: cleanText(section.readinessStatus, "empty"),
      label: cleanText(section.readinessLabel, "Empty"),
      completedSlotIds: uniqueStrings(section.completedSlotIds),
      missingSlotIds,
      missingSlotLabels: uniqueStrings(section.missingSlotLabels),
      readyCount: finiteNumber(section.readySlotCount, 0),
      totalCount: finiteNumber(section.readySlotTotal, 0),
    },
    readAloud: blocksOfKind("readAloud"),
    immediateImpressions: {
      sensory: blocksOfKind("sensory"),
      features: blocksOfKind("feature"),
      interactions: blocksOfKind("interaction"),
    },
    hazards: blocksOfKind("hazard"),
    clues: blocksOfKind("clue"),
    encounterTwists: blocksOfKind("encounterTwist"),
    secrets: blocksOfKind("secret"),
    rewards: blocksOfKind("reward"),
    notes: blocksOfKind("note"),
    blocks,
    connections: createRoomConnections(roomId, connections, resolver),
    geometry: section.room
      ? {
          cellRect: clonePlainObject(section.room.cellRect),
          labelPoint: clonePlainObject(section.room.labelPoint),
          surfaceKind: cleanText(section.room.surfaceKind),
        }
      : null,
    sourceComponentIds: uniqueStrings(
      componentBlocks.map((block) => block.sourceComponentId),
    ),
    sourceAnchorIds: uniqueStrings(
      componentBlocks.flatMap((block) => block.sourceAnchorIds),
    ),
    metadata: {
      heading: cleanText(section.heading),
      detailRows: asArray(section.detailRows).map((row) => ({
        label: cleanText(row?.label),
        value: cleanText(row?.value),
      })),
      componentKinds: Object.fromEntries(
        Object.entries(componentBlocksByKind).map(([kind, entries]) => [kind, entries.length]),
      ),
    },
  };
}

function createOverview(compilePreview = {}) {
  const mapScopedComponents = asArray(compilePreview.componentSections).filter(
    (component) => !component.regionId,
  );
  const blocks = dedupeBlocks(mapScopedComponents.map((component) => createComponentBlock(component)));
  const blocksOfKind = (kind) => blocks.filter((block) => block.kind === kind);
  const fallbackPremise = createDocumentBlock({
    id: "location-premise",
    kind: "premise",
    title: "Location Premise",
    text: compilePreview.locationPremiseText || compilePreview.premiseSection?.premise,
    audience: "gm",
    provenance: { source: "compile-preview" },
  });

  return {
    premise: dedupeBlocks([...blocksOfKind("premise"), fallbackPremise]),
    sensory: blocksOfKind("sensory"),
    visibleAnomalies: blocksOfKind("feature"),
    rewardConsequences: blocksOfKind("reward"),
    atTheTable: asArray(compilePreview.atTheTableRows)
      .map((row, index) =>
        createDocumentBlock({
          id: `at-the-table-${index + 1}`,
          kind: "note",
          title: row?.label,
          text: row?.value,
          audience: "gm",
          provenance: { source: "compile-preview" },
        }),
      )
      .filter(Boolean),
    blocks,
  };
}

function createMapDocument(roomSections, rooms, connections, mapRequest, generatedMapPreview) {
  const levels = uniqueStrings(
    rooms.map((room) => String(finiteNumber(room.level, 0))),
  )
    .map(Number)
    .sort((left, right) => left - right);

  return {
    seed: cleanText(generatedMapPreview?.seed || mapRequest?.seed),
    mapType: cleanText(mapRequest?.mapType || mapRequest?.context),
    bounds: clonePlainObject(generatedMapPreview?.bounds),
    contentBounds: clonePlainObject(generatedMapPreview?.contentBounds),
    levels,
    rooms: rooms.map((room, index) => ({
      id: room.id,
      generatedRoomId: room.generatedRoomId,
      number: room.number,
      name: room.name,
      role: room.role,
      level: room.level,
      shape: room.shape,
      geometry: room.geometry,
      sourceRegionId: room.sourceRegionId || room.id,
    })),
    connections,
    legend: uniqueStrings(
      connections.flatMap((connection) => [
        connection.secret ? "Secret connection" : "",
        connection.crossLevel ? "Level transition" : "",
        connection.kind && connection.kind !== "main" ? connection.kind : "",
      ]),
    ),
    counts: {
      rooms: rooms.length,
      connections: connections.length,
      levels: levels.length,
      secretConnections: connections.filter((connection) => connection.secret).length,
      crossLevelConnections: connections.filter((connection) => connection.crossLevel).length,
    },
  };
}

export function createLocationDocument({
  state = {},
  digest = {},
  mapRequest = {},
  generatedMapPreview = null,
  compilePreview = {},
} = {}) {
  const roomSections = asArray(compilePreview.roomSections || compilePreview.regionSections);
  const { connections, resolver } = createConnections(
    roomSections,
    mapRequest,
    generatedMapPreview,
  );
  const rooms = roomSections
    .map((section) => createRoomDocument(section, connections, resolver))
    .sort((left, right) => left.number - right.number || left.name.localeCompare(right.name));
  const incompleteRooms = rooms.filter((room) => room.readiness.missingSlotIds.length > 0);

  return {
    schemaVersion: DARK_PLACES_DOCUMENT_SCHEMA_VERSION,
    meta: {
      title: cleanText(compilePreview.title || state.title, "Cursed Location Build"),
      context: cleanText(state.context || mapRequest.context, "Location"),
      horror: uniqueStrings(state.horrors || mapRequest.metadata?.horror),
      sourceAnchors: uniqueStrings(
        state.sourceAnchors || mapRequest.metadata?.sourceAnchors,
      ),
      intrusion: cleanText(state.intrusion || mapRequest.metadata?.intrusion),
      workflow: cleanText(mapRequest.workflow || state.workflow, "darken-location"),
    },
    overview: createOverview(compilePreview),
    map: createMapDocument(
      roomSections,
      rooms,
      connections,
      mapRequest,
      generatedMapPreview,
    ),
    rooms,
    readiness: {
      filledSlots: finiteNumber(digest.filledSlots, 0),
      totalSlots: finiteNumber(digest.totalSlots, 0),
      readyRooms: rooms.length - incompleteRooms.length,
      incompleteRooms: incompleteRooms.map((room) => ({
        roomId: room.id,
        roomNumber: room.number,
        roomName: room.name,
        missingSlotIds: room.readiness.missingSlotIds,
        missingSlotLabels: room.readiness.missingSlotLabels,
      })),
      complete: rooms.length > 0 && incompleteRooms.length === 0,
    },
    source: {
      adapter: "location-composer-output",
      compilePreviewSchemaVersion: cleanText(compilePreview.schemaVersion),
      mapRequestSource: cleanText(mapRequest.source),
    },
  };
}
