import {
  SEMANTIC_SCHEMA_VERSIONS,
  createCompatibilityProvenance,
  normalizeLocationDocumentV2,
  normalizeSessionStateV1,
} from "../../../shared/content/content.index.js";

export const LEGACY_LOCATION_DOCUMENT_SCHEMA_VERSION =
  "dark-places-document-v1";

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function slugify(value, fallback = "entry") {
  return (
    cleanText(value)
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

function cloneJson(value, fallback) {
  try {
    return value === undefined ? fallback : JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function uniqueStrings(values = []) {
  return [...new Set(asArray(values).map(cleanText).filter(Boolean))].sort();
}

function createProvenance(sourceAnchorIds, legacyIds = [], fromSchema = "") {
  return createCompatibilityProvenance({
    sourceAnchorIds: uniqueStrings(sourceAnchorIds).map(slugify),
    legacyIds: uniqueStrings(legacyIds).map(slugify),
    fromSchema: fromSchema || LEGACY_LOCATION_DOCUMENT_SCHEMA_VERSION,
    reviewVersion: "phase2-document-compatibility-v1",
    note: "Location output compatibility-normalized for the Phase 2 compiler; editorial review is still required.",
  });
}

const LEGACY_BLOCK_KIND_MAP = Object.freeze({
  sensory: "sensory",
  feature: "visible-feature",
  interaction: "interaction",
  hazard: "hazard",
  clue: "clue",
  encounterTwist: "encounter-twist",
  secret: "secret",
  reward: "reward",
  note: "note",
  readAloud: "read-aloud",
});

const V2_BLOCK_KIND_MAP = Object.freeze({
  atmosphere: "sensory",
  "global-rule": "note",
  "recurring-sign": "feature",
  stake: "reward",
  sensory: "sensory",
  "visible-feature": "feature",
  interaction: "interaction",
  hazard: "hazard",
  clue: "clue",
  "encounter-twist": "encounterTwist",
  secret: "secret",
  reward: "reward",
  note: "note",
  "read-aloud": "readAloud",
});

function normalizeLegacyBlock(
  value = {},
  {
    kind = "note",
    sourceAnchorIds = [],
    idPrefix = "compatibility",
    fromSchema = LEGACY_LOCATION_DOCUMENT_SCHEMA_VERSION,
  } = {},
) {
  const id = slugify(value.id || `${idPrefix}-${value.title || kind}`);
  const anchors = uniqueStrings([
    ...sourceAnchorIds,
    ...asArray(value.sourceAnchorIds),
  ]).map(slugify);
  return {
    id,
    kind,
    subtype: cleanText(value.subtype || kind),
    title: cleanText(value.title),
    text: cleanText(value.text || value.summary),
    summary: cleanText(value.summary),
    audience: cleanText(value.audience, "gm"),
    facets: cloneJson(value.facets, []),
    sourceComponentId: slugify(value.sourceComponentId || "", ""),
    sourceAnchorIds: anchors,
    mechanics:
      typeof value.mechanics === "string"
        ? cleanText(value.mechanics)
        : cloneJson(value.mechanics, null),
    counterplay: cleanText(value.counterplay),
    narrative: cleanText(value.narrative),
    provenance: createProvenance(
      anchors,
      [value.id, value.sourceComponentId],
      fromSchema,
    ),
    metadata: {
      ...cloneJson(value.metadata, {}),
      compatibilitySourceKind: cleanText(value.kind),
    },
  };
}

function normalizeLegacyBlocks(values, options = {}) {
  return asArray(values).map((value, index) =>
    normalizeLegacyBlock(value, {
      ...options,
      idPrefix: `${options.idPrefix || "compatibility"}-${index + 1}`,
    }),
  );
}

function normalizeRoomConnection(connection = {}, roomId = "", index = 0) {
  return {
    id: slugify(
      connection.id || connection.connectionId || `connection-${index + 1}`,
    ),
    fromRoomId: slugify(connection.fromRoomId || roomId),
    toRoomId: slugify(connection.toRoomId || connection.targetRoomId),
    kind: cleanText(connection.kind, "main"),
    secret: Boolean(connection.secret),
    locked: Boolean(connection.locked),
    crossLevel: Boolean(connection.crossLevel),
    fromLevel: Number(connection.fromLevel || 0),
    toLevel: Number(connection.toLevel || 0),
    levelDelta: Number(connection.levelDelta || 0),
    stairTransition: cleanText(connection.stairTransition),
  };
}

function createLocationSeedFromV1(document, provenance) {
  const sourceAnchorIds = uniqueStrings(document.meta?.sourceAnchors).map(
    slugify,
  );
  const premiseTexts = asArray(document.overview?.premise)
    .map((block) => cleanText(block?.text))
    .filter(Boolean);
  const rooms = asArray(document.rooms).map((room, roomIndex) => {
    const roomId = slugify(room.id || `room-${roomIndex + 1}`);
    const roomSources = uniqueStrings([
      ...sourceAnchorIds,
      ...asArray(room.sourceAnchorIds),
    ]).map(slugify);
    const blockOptions = {
      sourceAnchorIds: roomSources,
      idPrefix: roomId,
    };
    const readAloudFragments = normalizeLegacyBlocks(room.readAloud, {
      ...blockOptions,
      kind: "read-aloud",
    });

    return {
      id: roomId,
      number: Number(room.number || roomIndex + 1),
      name: cleanText(room.name, `Room ${roomIndex + 1}`),
      role: cleanText(room.role, "Room"),
      level: Number(room.level || 0),
      shape: cleanText(room.shape),
      sourceRegionId: slugify(room.sourceRegionId || roomId),
      readAloud: {
        compact: "",
        standard: readAloudFragments
          .map((block) => block.text)
          .filter(Boolean)
          .join("\n\n"),
        extended: "",
        fragments: readAloudFragments,
        provenance: createProvenance(roomSources, [room.id]),
      },
      immediateImpressions: normalizeLegacyBlocks(
        room.immediateImpressions?.sensory,
        { ...blockOptions, kind: "sensory" },
      ),
      visibleFeatures: normalizeLegacyBlocks(
        room.immediateImpressions?.features,
        { ...blockOptions, kind: "visible-feature" },
      ),
      interactions: normalizeLegacyBlocks(
        room.immediateImpressions?.interactions,
        { ...blockOptions, kind: "interaction" },
      ),
      hazards: normalizeLegacyBlocks(room.hazards, {
        ...blockOptions,
        kind: "hazard",
      }),
      clues: normalizeLegacyBlocks(room.clues, {
        ...blockOptions,
        kind: "clue",
      }),
      encounterTwists: normalizeLegacyBlocks(room.encounterTwists, {
        ...blockOptions,
        kind: "encounter-twist",
      }),
      secrets: normalizeLegacyBlocks(room.secrets, {
        ...blockOptions,
        kind: "secret",
      }),
      rewards: normalizeLegacyBlocks(room.rewards, {
        ...blockOptions,
        kind: "reward",
      }),
      recurringSigns: [],
      connections: asArray(room.connections).map((connection, index) =>
        normalizeRoomConnection(connection, roomId, index),
      ),
      readiness: {
        status: cleanText(room.readiness?.status, "draft"),
        label: cleanText(room.readiness?.label, "Draft"),
        completedSlotIds: asArray(room.readiness?.completedSlotIds),
        missingSlotIds: asArray(room.readiness?.missingSlotIds),
        missingSlotLabels: asArray(room.readiness?.missingSlotLabels),
        readyCount: Number(room.readiness?.readyCount || 0),
        totalCount: Number(room.readiness?.totalCount || 0),
      },
      sourceComponentIds: uniqueStrings(room.sourceComponentIds).map(slugify),
      sourceAnchorIds: roomSources,
      provenance: createProvenance(roomSources, [room.id]),
    };
  });
  const mapRoomsById = new Map(
    asArray(document.map?.rooms).map((room) => [slugify(room.id), room]),
  );

  return {
    meta: {
      title: cleanText(document.meta?.title, "Cursed Location Build"),
      context: cleanText(document.meta?.context, "Location"),
      horror: asArray(document.meta?.horror),
      sourceAnchors: sourceAnchorIds,
      intrusion: cleanText(document.meta?.intrusion, "Medium"),
    },
    identity: {
      historyParagraph: premiseTexts[0] || "",
      currentSituationParagraph: premiseTexts.slice(1).join("\n\n"),
      playerEntryPoint: "",
      stakes: [],
      provenance,
    },
    siteWide: {
      atmosphere: normalizeLegacyBlocks(document.overview?.sensory, {
        kind: "atmosphere",
        sourceAnchorIds,
        idPrefix: "site-atmosphere",
      }),
      globalRules: [],
      recurringSigns: normalizeLegacyBlocks(
        document.overview?.visibleAnomalies,
        {
          kind: "recurring-sign",
          sourceAnchorIds,
          idPrefix: "site-sign",
        },
      ),
      stakesAndConsequences: normalizeLegacyBlocks(
        document.overview?.rewardConsequences,
        {
          kind: "stake",
          sourceAnchorIds,
          idPrefix: "site-stake",
        },
      ),
      provenance,
    },
    sessionGuide: {
      openingBeat: {},
      objectives: [],
      pressureTracks: [],
      alwaysOnRules: normalizeLegacyBlocks(document.overview?.atTheTable, {
        kind: "note",
        sourceAnchorIds,
        idPrefix: "table-note",
      }),
      clueFlow: {},
      stallMoves: [],
      roomShortcuts: [],
      provenance,
    },
    map: {
      mapType: cleanText(document.map?.mapType || document.meta?.context),
      counts: cloneJson(document.map?.counts, {}),
      legend: asArray(document.map?.legend),
      levels: asArray(document.map?.levels),
      rooms: rooms.map((room) => {
        const mapRoom = mapRoomsById.get(room.id) || {};
        return {
          id: room.id,
          number: room.number,
          name: room.name,
          role: room.role,
          level: room.level,
          shape: room.shape,
          sourceRegionId: room.sourceRegionId,
          sourceComponentIds: uniqueStrings([
            ...room.sourceComponentIds,
            ...asArray(mapRoom.sourceComponentIds),
          ]),
        };
      }),
      connections: asArray(document.map?.connections).map((connection, index) =>
        normalizeRoomConnection(connection, "", index),
      ),
      provenance,
    },
    rooms,
    coverage: {
      filledSlots: Number(document.readiness?.filledSlots || 0),
      totalSlots: Number(document.readiness?.totalSlots || 0),
      readyRooms: Number(document.readiness?.readyRooms || 0),
      incompleteRooms: asArray(document.readiness?.incompleteRooms),
    },
  };
}

function collectLegacySourceComponentIds(document = {}) {
  const overviewBlocks = [
    ...asArray(document.overview?.premise),
    ...asArray(document.overview?.sensory),
    ...asArray(document.overview?.visibleAnomalies),
    ...asArray(document.overview?.rewardConsequences),
    ...asArray(document.overview?.atTheTable),
  ];
  const roomBlocks = asArray(document.rooms).flatMap((room) => [
    ...asArray(room.readAloud),
    ...asArray(room.immediateImpressions?.sensory),
    ...asArray(room.immediateImpressions?.features),
    ...asArray(room.immediateImpressions?.interactions),
    ...asArray(room.hazards),
    ...asArray(room.clues),
    ...asArray(room.encounterTwists),
    ...asArray(room.secrets),
    ...asArray(room.rewards),
  ]);
  return uniqueStrings(
    [...overviewBlocks, ...roomBlocks].map((block) => block?.sourceComponentId),
  ).map(slugify);
}

export function createSessionStateFromLocationDocumentV1(
  document = {},
  {
    id = "compatibility-location-session",
    seed = "compatibility-location-seed",
    moduleId = "compatibility-location-module",
    selectedComponentIds = [],
    preserveLegacySemanticOverview = true,
  } = {},
) {
  if (document.schemaVersion !== LEGACY_LOCATION_DOCUMENT_SCHEMA_VERSION) {
    throw new Error(
      `Expected ${LEGACY_LOCATION_DOCUMENT_SCHEMA_VERSION}; received ${cleanText(document.schemaVersion, "unversioned")}.`,
    );
  }
  const sourceAnchorIds = uniqueStrings(document.meta?.sourceAnchors).map(
    slugify,
  );
  const provenance = createProvenance(
    sourceAnchorIds,
    [id],
    document.schemaVersion,
  );
  const locationSeed = createLocationSeedFromV1(document, provenance);
  if (!preserveLegacySemanticOverview) {
    locationSeed.identity = {
      historyParagraph: "",
      currentSituationParagraph: "",
      playerEntryPoint: "",
      stakes: [],
      provenance,
    };
    locationSeed.siteWide = {
      atmosphere: [],
      globalRules: [],
      recurringSigns: [],
      stakesAndConsequences: [],
      provenance,
    };
    locationSeed.sessionGuide = {
      openingBeat: {},
      objectives: [],
      pressureTracks: [],
      alwaysOnRules: [],
      clueFlow: {},
      stallMoves: [],
      roomShortcuts: [],
      provenance,
    };
  }
  return normalizeSessionStateV1({
    id: slugify(id),
    seed: cleanText(seed),
    moduleId: slugify(moduleId),
    selectedComponentIds: selectedComponentIds.length
      ? selectedComponentIds
      : collectLegacySourceComponentIds(document),
    locationSeed,
    provenance,
  });
}

function toLegacyBlock(value = {}, kind = "note") {
  return {
    id: value.id,
    kind,
    subtype: value.subtype || kind,
    title: value.title,
    text: value.text,
    summary: value.summary,
    audience: value.audience,
    facets: cloneJson(value.facets, []),
    sourceComponentId: value.sourceComponentId,
    sourceAnchorIds: asArray(value.sourceAnchorIds),
    mapReference: null,
    mechanics: cloneJson(value.mechanics, value.mechanics || null),
    counterplay: value.counterplay,
    narrative: value.narrative,
    provenance: cloneJson(value.provenance, {}),
    metadata: cloneJson(value.metadata, {}),
  };
}

function toLegacyBlocks(values, forcedKind = "") {
  return asArray(values).map((block) =>
    toLegacyBlock(block, forcedKind || V2_BLOCK_KIND_MAP[block.kind] || "note"),
  );
}

function toLegacyRoomReadAloud(room) {
  const composedFragments = asArray(room.readAloud?.fragments).filter(
    (fragment) => fragment.metadata?.compilerStage === "compose-read-aloud",
  );
  if (!composedFragments.length || !cleanText(room.readAloud?.standard)) {
    return toLegacyBlocks(room.readAloud?.fragments, "readAloud");
  }
  return [
    toLegacyBlock(
      {
        id: `${room.id}-read-aloud-standard`,
        kind: "read-aloud",
        subtype: "standard",
        title: "Read-Aloud",
        text: room.readAloud.standard,
        summary: room.readAloud.compact,
        audience: "both",
        facets: [],
        sourceComponentId: composedFragments[0]?.sourceComponentId || "",
        sourceAnchorIds: uniqueStrings(
          composedFragments.flatMap(
            (fragment) => fragment.sourceAnchorIds || [],
          ),
        ),
        mechanics: null,
        counterplay: "",
        narrative: "",
        provenance: room.readAloud.provenance,
        metadata: {
          compilerStage: "compose-read-aloud",
          exportVariant: "standard",
          variants: {
            compact: room.readAloud.compact,
            standard: room.readAloud.standard,
            extended: room.readAloud.extended,
          },
          sourceFragmentIds: uniqueStrings(
            composedFragments.map(
              (fragment) => fragment.metadata?.sourceFragmentId,
            ),
          ),
        },
      },
      "readAloud",
    ),
  ];
}

function createLegacyPremiseBlocks(document) {
  return [
    document.identity.historyParagraph
      ? {
          id: "location-history",
          title: "Location History",
          text: document.identity.historyParagraph,
        }
      : null,
    document.identity.currentSituationParagraph
      ? {
          id: "location-situation",
          title: "Current Situation",
          text: document.identity.currentSituationParagraph,
        }
      : null,
    document.identity.playerEntryPoint
      ? {
          id: "location-entry-point",
          title: "Why the Characters Enter",
          text: document.identity.playerEntryPoint,
        }
      : null,
  ]
    .filter(Boolean)
    .map((block) =>
      toLegacyBlock(
        {
          ...block,
          kind: "note",
          subtype: "premise",
          summary: "",
          audience: "gm",
          facets: [],
          sourceComponentId: "",
          sourceAnchorIds: document.meta.sourceAnchors,
          mechanics: null,
          counterplay: "",
          narrative: "",
          provenance: document.identity.provenance,
          metadata: {},
        },
        "premise",
      ),
    );
}

export function adaptLocationDocumentV2ToV1(value = {}) {
  const document = normalizeLocationDocumentV2(value);
  if (document.schemaVersion !== SEMANTIC_SCHEMA_VERSIONS.LOCATION_DOCUMENT) {
    throw new Error("Expected a canonical Location Document v2.");
  }
  const roomById = new Map(document.rooms.map((room) => [room.id, room]));

  return {
    schemaVersion: LEGACY_LOCATION_DOCUMENT_SCHEMA_VERSION,
    sessionGuide: cloneJson(document.sessionGuide, {}),
    meta: {
      ...document.meta,
      workflow: "darken-location",
    },
    overview: {
      premise: createLegacyPremiseBlocks(document),
      sensory: toLegacyBlocks(document.siteWide.atmosphere, "sensory"),
      globalRules: toLegacyBlocks(document.siteWide.globalRules, "note"),
      recurringSigns: toLegacyBlocks(
        document.siteWide.recurringSigns,
        "feature",
      ),
      stakesAndConsequences: toLegacyBlocks(
        document.siteWide.stakesAndConsequences,
        "reward",
      ),
      visibleAnomalies: toLegacyBlocks(
        document.siteWide.recurringSigns,
        "feature",
      ),
      rewardConsequences: toLegacyBlocks(
        document.siteWide.stakesAndConsequences,
        "reward",
      ),
      atTheTable: toLegacyBlocks(
        [
          ...document.sessionGuide.pressureTracks,
          ...document.sessionGuide.alwaysOnRules,
        ],
        "note",
      ),
      blocks: [],
    },
    map: {
      seed: document.seed,
      mapType: document.map.mapType,
      bounds: null,
      contentBounds: null,
      levels: document.map.levels,
      rooms: document.map.rooms.map((room) => ({
        ...room,
        generatedRoomId: "",
        geometry: null,
      })),
      connections: document.map.connections,
      legend: document.map.legend,
      counts: document.map.counts,
    },
    rooms: document.rooms.map((room) => ({
      id: room.id,
      sourceRegionId: room.sourceRegionId,
      generatedRoomId: "",
      number: room.number,
      name: room.name,
      role: room.role,
      level: room.level,
      shape: room.shape,
      mapLabel: "",
      readiness: room.readiness,
      readAloud: toLegacyRoomReadAloud(room),
      immediateImpressions: {
        sensory: toLegacyBlocks(room.immediateImpressions, "sensory"),
        features: toLegacyBlocks(
          [...room.visibleFeatures, ...room.recurringSigns],
          "feature",
        ),
        interactions: toLegacyBlocks(room.interactions, "interaction"),
      },
      recurringSigns: toLegacyBlocks(room.recurringSigns, "feature"),
      hazards: toLegacyBlocks(room.hazards, "hazard"),
      clues: toLegacyBlocks(room.clues, "clue"),
      encounterTwists: toLegacyBlocks(room.encounterTwists, "encounterTwist"),
      secrets: toLegacyBlocks(room.secrets, "secret"),
      rewards: toLegacyBlocks(room.rewards, "reward"),
      notes: [],
      blocks: [],
      connections: room.connections.map((connection) => ({
        connectionId: connection.id,
        targetRoomId:
          connection.fromRoomId === room.id
            ? connection.toRoomId
            : connection.fromRoomId,
        targetRoomNumber:
          roomById.get(
            connection.fromRoomId === room.id
              ? connection.toRoomId
              : connection.fromRoomId,
          )?.number || null,
        targetRoomName:
          roomById.get(
            connection.fromRoomId === room.id
              ? connection.toRoomId
              : connection.fromRoomId,
          )?.name || "",
        kind: connection.kind,
        secret: connection.secret,
        locked: connection.locked,
        crossLevel: connection.crossLevel,
        fromLevel: connection.fromLevel,
        toLevel: connection.toLevel,
        levelDelta:
          connection.fromRoomId === room.id
            ? connection.levelDelta
            : -connection.levelDelta,
        stairTransition: connection.stairTransition,
      })),
      geometry: null,
      sourceComponentIds: room.sourceComponentIds,
      sourceAnchorIds: room.sourceAnchorIds,
      metadata: {},
    })),
    readiness: {
      ...document.validation.coverage,
      incompleteRooms: document.validation.coverage.incompleteRooms.map(
        (room) => ({
          roomId: room.id,
          roomNumber: room.number,
          roomName: room.name,
          missingSlotIds: room.missingSlotIds,
          missingSlotLabels: room.missingSlotLabels,
        }),
      ),
      complete:
        document.rooms.length > 0 &&
        document.validation.coverage.incompleteRooms.length === 0,
    },
    source: {
      adapter: "location-document-v2-output-view",
      documentId: document.id,
      documentSchemaVersion: document.schemaVersion,
      compilePreviewSchemaVersion: "",
      mapRequestSource: "semantic-map-intent",
    },
  };
}

export function normalizeLocationDocumentForOutput(value = {}) {
  if (value.schemaVersion === LEGACY_LOCATION_DOCUMENT_SCHEMA_VERSION) {
    return cloneJson(value, {});
  }
  if (value.schemaVersion === SEMANTIC_SCHEMA_VERSIONS.LOCATION_DOCUMENT) {
    return adaptLocationDocumentV2ToV1(value);
  }
  throw new Error(
    `Unsupported Location Document schema for output: ${cleanText(value.schemaVersion, "unversioned")}.`,
  );
}

function blockTexts(values) {
  return uniqueStrings(asArray(values).map((block) => block?.text));
}

function compareValue(differences, path, expected, actual) {
  if (JSON.stringify(expected) === JSON.stringify(actual)) return;
  differences.push({ path, expected, actual });
}

export function compareLocationDocumentsV1V2(legacy = {}, semantic = {}) {
  const document = normalizeLocationDocumentV2(semantic);
  const differences = [];
  compareValue(
    differences,
    "meta.title",
    legacy.meta?.title,
    document.meta.title,
  );
  compareValue(
    differences,
    "meta.context",
    legacy.meta?.context,
    document.meta.context,
  );
  compareValue(
    differences,
    "meta.horror",
    uniqueStrings(legacy.meta?.horror),
    uniqueStrings(document.meta.horror),
  );
  compareValue(
    differences,
    "meta.sourceAnchors",
    uniqueStrings(legacy.meta?.sourceAnchors).map(slugify),
    uniqueStrings(document.meta.sourceAnchors),
  );

  const premiseText = [
    document.identity.historyParagraph,
    document.identity.currentSituationParagraph,
  ].join("\n\n");
  asArray(legacy.overview?.premise).forEach((block, index) => {
    if (!cleanText(block?.text) || premiseText.includes(cleanText(block.text)))
      return;
    differences.push({
      path: `overview.premise[${index}]`,
      expected: cleanText(block.text),
      actual: premiseText,
    });
  });
  compareValue(
    differences,
    "overview.sensory",
    blockTexts(legacy.overview?.sensory),
    blockTexts(document.siteWide.atmosphere),
  );
  compareValue(
    differences,
    "overview.visibleAnomalies",
    blockTexts(legacy.overview?.visibleAnomalies),
    blockTexts(document.siteWide.recurringSigns),
  );
  compareValue(
    differences,
    "overview.rewardConsequences",
    blockTexts(legacy.overview?.rewardConsequences),
    blockTexts(document.siteWide.stakesAndConsequences),
  );

  const semanticRoomById = new Map(
    document.rooms.map((room) => [room.id, room]),
  );
  const roomFields = [
    ["readAloud", (room) => room.readAloud.fragments],
    ["sensory", (room) => room.immediateImpressions],
    ["features", (room) => room.visibleFeatures],
    ["interactions", (room) => room.interactions],
    ["hazards", (room) => room.hazards],
    ["clues", (room) => room.clues],
    ["encounterTwists", (room) => room.encounterTwists],
    ["secrets", (room) => room.secrets],
    ["rewards", (room) => room.rewards],
  ];
  asArray(legacy.rooms).forEach((legacyRoom, index) => {
    const roomId = slugify(legacyRoom.id || `room-${index + 1}`);
    const semanticRoom = semanticRoomById.get(roomId);
    if (!semanticRoom) {
      differences.push({
        path: `rooms.${roomId}`,
        expected: "present",
        actual: "missing",
      });
      return;
    }
    compareValue(
      differences,
      `rooms.${roomId}.name`,
      legacyRoom.name,
      semanticRoom.name,
    );
    roomFields.forEach(([field, getSemantic]) => {
      const legacyBlocks =
        field === "sensory" || field === "features" || field === "interactions"
          ? legacyRoom.immediateImpressions?.[field]
          : legacyRoom[field];
      compareValue(
        differences,
        `rooms.${roomId}.${field}`,
        blockTexts(legacyBlocks),
        blockTexts(getSemantic(semanticRoom)),
      );
    });
  });

  compareValue(
    differences,
    "map.room-count",
    asArray(legacy.rooms).length,
    document.rooms.length,
  );
  compareValue(
    differences,
    "map.connection-count",
    asArray(legacy.map?.connections).length,
    document.map.connections.length,
  );

  return Object.freeze({
    equal: differences.length === 0,
    differences: Object.freeze(differences.map(Object.freeze)),
    coverage: Object.freeze({
      legacyRooms: asArray(legacy.rooms).length,
      semanticRooms: document.rooms.length,
      comparedRoomFields: roomFields.length,
    }),
  });
}
