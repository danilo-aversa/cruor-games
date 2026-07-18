import {
  getDarkPlacesSemanticModuleReference,
  normalizeDarkPlacesComposerInput,
  normalizeSessionStateV1,
  resolveDarkPlacesRuntimeContent,
  serializeCanonicalSemanticContent,
} from "../../../../shared/content/content.index.js";
import {
  applyDarkPlacesHybridOverrides,
  compileDarkPlacesSemanticLocation,
  hashLocationCompilerKey,
} from "../../compiler/index.js";

export const DARK_PLACES_COMPOSER_SEMANTIC_PREVIEW_SCHEMA_VERSION =
  "cruor-dark-places-composer-semantic-preview-v1";

function asArray(value) {
  if (value instanceof Set) return [...value].filter(Boolean);
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
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

function createFingerprint(canonicalValue) {
  return `${hashLocationCompilerKey(canonicalValue)
    .toString(16)
    .padStart(8, "0")}-${canonicalValue.length}`;
}

function createMapState(state, mapRequest, generatedMapPreview) {
  return {
    request: {
      source: mapRequest?.source || "darken-location",
      seed: mapRequest?.seed || "",
      title: mapRequest?.title || state.title || "",
      context: mapRequest?.context || state.context || "",
      mapType: mapRequest?.mapType || "",
      requiredRegions: mapRequest?.requiredRegions || [],
      connections: mapRequest?.connections || [],
      metadata: {
        sourceAnchors: mapRequest?.metadata?.sourceAnchors || [],
        horror: mapRequest?.metadata?.horror || [],
        intrusion: mapRequest?.metadata?.intrusion || "",
      },
    },
    generated: {
      seed: generatedMapPreview?.seed || "",
      regions: asArray(generatedMapPreview?.regions).map((region) => ({
        id: region.id,
        sourceRegionId: region.sourceRegionId || region.id,
        name: region.name || region.label || "",
        role: region.role || "",
        level: Number(region.level || 0),
        shape: region.shape || "",
      })),
      connections: asArray(generatedMapPreview?.connections).map(
        (connection) => ({
          id: connection.id,
          from: connection.from,
          to: connection.to,
          kind: connection.kind || "main",
          locked: Boolean(connection.locked),
          secret: Boolean(connection.secret),
        }),
      ),
    },
    manualOverrides: state.mapManualOverrides || {},
  };
}

function createSemanticLocks(state) {
  const authored = state.semanticLocks || state.locks || {};
  return {
    componentIds: authored.componentIds || [],
    roomIds: authored.roomIds || [],
    slotIds: [
      ...asArray(authored.slotIds),
      ...asArray(state.lockedSlots),
    ],
    paths: authored.paths || [],
  };
}

function normalizeStructuralConnection(value = {}, roomLevelById, index) {
  const fromRoomId = slugify(value.fromRoomId || value.from, "");
  const toRoomId = slugify(value.toRoomId || value.to, "");
  if (!fromRoomId || !toRoomId) return null;
  const fromLevel = Number(roomLevelById.get(fromRoomId) || 0);
  const toLevel = Number(roomLevelById.get(toRoomId) || 0);
  return {
    id: slugify(
      value.id || `${fromRoomId}-${toRoomId}-${value.kind || "main"}-${index + 1}`,
    ),
    fromRoomId,
    toRoomId,
    kind: cleanText(value.kind, "main"),
    secret: Boolean(value.secret),
    locked: Boolean(value.locked),
    crossLevel: Boolean(value.crossLevel || fromLevel !== toLevel),
    fromLevel,
    toLevel,
    levelDelta: toLevel - fromLevel,
    stairTransition: cleanText(value.stairTransition),
  };
}

function createComposerStructure(state, digest, mapRequest, generatedMapPreview) {
  const requestedRegions = asArray(mapRequest?.requiredRegions);
  const sourceRegions = requestedRegions.length
    ? requestedRegions
    : asArray(state.locationRegions);
  const generatedBySourceId = new Map();
  asArray(generatedMapPreview?.regions).forEach((region) => {
    [region.sourceRegionId, region.previewTargetId, region.id]
      .map((value) => slugify(value, ""))
      .filter(Boolean)
      .forEach((id) => generatedBySourceId.set(id, region));
  });
  const rooms = sourceRegions.map((region, index) => {
    const id = slugify(
      region.sourceRegionId || region.id,
      `location-region-${index + 1}`,
    );
    const generated = generatedBySourceId.get(id) || {};
    return {
      id,
      number: Number(generated.number || region.number || index + 1),
      name: cleanText(
        region.name || region.label || generated.name || generated.label,
        `Room ${index + 1}`,
      ),
      role: cleanText(region.role || generated.role, "Room"),
      level: Number(region.level ?? generated.level ?? 0),
      shape: cleanText(region.shape || generated.shape),
      sourceRegionId: id,
    };
  });
  const roomLevelById = new Map(rooms.map((room) => [room.id, room.level]));
  const connectionSource = asArray(mapRequest?.connections).length
    ? asArray(mapRequest.connections)
    : asArray(generatedMapPreview?.connections);
  const connections = connectionSource
    .map((connection, index) =>
      normalizeStructuralConnection(connection, roomLevelById, index),
    )
    .filter(Boolean);
  const levels = [...new Set(rooms.map((room) => room.level))].sort(
    (left, right) => left - right,
  );
  const incompleteRooms = rooms.map((room) => ({
    id: room.id,
    number: room.number,
    name: room.name,
    missingSlotIds: [],
    missingSlotLabels: [],
  }));

  return Object.freeze({
    meta: {
      title: cleanText(state.title, "Cursed Location Build"),
      context: cleanText(state.context || mapRequest?.context, "Location"),
      horror: asArray(state.horrors ?? state.horror),
      sourceAnchors: asArray(state.sourceAnchors),
      intrusion: cleanText(state.intrusion || mapRequest?.metadata?.intrusion),
    },
    map: {
      mapType: cleanText(mapRequest?.mapType || mapRequest?.context),
      counts: {
        rooms: rooms.length,
        connections: connections.length,
        levels: levels.length,
      },
      legend: [],
      levels,
      rooms,
      connections,
    },
    rooms,
    coverage: {
      filledSlots: Number(digest?.filledSlots || 0),
      totalSlots: Number(digest?.totalSlots || 0),
      readyRooms: 0,
      incompleteRooms,
    },
  });
}

function createCompilerProjection(input, structure) {
  return {
    moduleId: input.moduleId,
    moduleVersion: input.moduleVersion,
    sourceAnchors: input.sourceAnchors,
    context: input.context,
    horror: input.horror,
    intrusion: input.intrusion,
    seed: input.seed,
    meta: structure.meta,
    rooms: structure.rooms.map((room) => ({
      id: room.id,
      number: room.number,
      name: room.name,
      role: room.role,
      level: room.level,
      shape: room.shape,
      sourceRegionId: room.sourceRegionId,
    })),
    map: {
      mapType: structure.map.mapType,
      rooms: structure.map.rooms,
      connections: structure.map.connections,
      levels: structure.map.levels,
    },
  };
}

function createBaselineCompilerSession(preparation, runtimeContent) {
  const selectedComponentIds = runtimeContent.semanticBaseline.components.map(
    (component) => component.id,
  );
  const provenance = runtimeContent.semanticBaseline.module.provenance;
  const rooms = preparation.structure.rooms.map((room) => ({
    ...room,
    readAloud: {
      compact: "",
      standard: "",
      extended: "",
      fragments: [],
      provenance,
    },
    immediateImpressions: [],
    visibleFeatures: [],
    interactions: [],
    hazards: [],
    clues: [],
    encounterTwists: [],
    secrets: [],
    rewards: [],
    recurringSigns: [],
    connections: preparation.structure.map.connections.filter(
      (connection) =>
        connection.fromRoomId === room.id || connection.toRoomId === room.id,
    ),
    readiness: {
      status: "draft",
      label: "Draft",
      completedSlotIds: [],
      missingSlotIds: [],
      missingSlotLabels: [],
      readyCount: 0,
      totalCount: 0,
    },
    sourceComponentIds: [],
    sourceAnchorIds: preparation.input.sourceAnchors,
    provenance,
  }));
  return normalizeSessionStateV1({
    id: slugify(
      `${runtimeContent.input.moduleId}-${runtimeContent.input.seed}-live`,
      "dark-places-live-session",
    ),
    seed: runtimeContent.input.seed,
    moduleId: runtimeContent.input.moduleId,
    selectedComponentIds,
    locationSeed: {
      meta: preparation.structure.meta,
      identity: {
        historyParagraph: "",
        currentSituationParagraph: "",
        playerEntryPoint: "",
        stakes: [],
        provenance,
      },
      siteWide: {
        atmosphere: [],
        globalRules: [],
        recurringSigns: [],
        stakesAndConsequences: [],
        provenance,
      },
      sessionGuide: {
        openingBeat: {},
        objectives: [],
        pressureTracks: [],
        alwaysOnRules: [],
        clueFlow: {},
        stallMoves: [],
        roomShortcuts: [],
        provenance,
      },
      map: {
        ...preparation.structure.map,
        rooms: preparation.structure.map.rooms.map((room) => ({
          ...room,
          sourceComponentIds: [],
        })),
        provenance,
      },
      rooms,
      coverage: preparation.structure.coverage,
    },
    provenance,
  });
}

function uniqueDiagnostics(values = []) {
  return values.filter(
    (issue, index) =>
      values.findIndex(
        (candidate) =>
          candidate.code === issue.code &&
          candidate.path === issue.path &&
          candidate.message === issue.message,
      ) === index,
  );
}

function createRuntimeError(code, message, details) {
  return {
    code,
    severity: "error",
    path: "semanticPreview",
    message,
    ...(details === undefined ? {} : { details }),
  };
}

export function createDarkPlacesComposerSemanticPreparation({
  state = {},
  digest = {},
  mapRequest = {},
  generatedMapPreview = null,
  selectedComponents = [],
} = {}) {
  const structure = createComposerStructure(
    state,
    digest,
    mapRequest,
    generatedMapPreview,
  );
  const moduleReference = getDarkPlacesSemanticModuleReference({
    moduleId: state.semanticModuleId || state.dungeonThemeId,
    sourceAnchors: state.sourceAnchors,
  });
  const moduleId = moduleReference?.moduleId || state.semanticModuleId || state.dungeonThemeId;
  const seed = cleanText(
    state.seed || mapRequest?.seed,
    `${slugify(moduleId, "dark-places")}-live-preview`,
  );
  const granularSelections = asArray(selectedComponents).length
    ? selectedComponents
    : asArray(state.selectedComponentIds);
  const input = normalizeDarkPlacesComposerInput({
    moduleId,
    moduleVersion:
      state.semanticModuleVersion || moduleReference?.moduleVersion || "",
    sourceAnchors: state.sourceAnchors,
    context: state.context,
    horror: state.horrors ?? state.horror,
    intrusion: state.intrusion,
    seed,
    rooms: structure.rooms,
    mapState: createMapState(state, mapRequest, generatedMapPreview),
    selectedGranularComponents: granularSelections,
    slotAssignments: state.slotAssignments,
    locks: createSemanticLocks(state),
    userOverrides: {
      ...(state.semanticUserOverrides || {}),
      title: state.title || structure.meta.title,
    },
    provenance: {
      adapter: "dark-places-live-composer-v2",
      structureOwner: "dark-places-composer",
      moduleReference: moduleReference || {},
      sourceAnchors: asArray(state.sourceAnchors),
    },
  });
  const canonicalInput = serializeCanonicalSemanticContent(input);
  const compilerKey = serializeCanonicalSemanticContent(
    createCompilerProjection(input, structure),
  );
  const hybridOverrideKey = serializeCanonicalSemanticContent({
    selectedGranularComponents: input.selectedGranularComponents,
    slotAssignments: input.slotAssignments,
    locks: input.locks,
    authoredOverrides: input.userOverrides.hybridOverrides || {},
  });

  return Object.freeze({
    input,
    inputFingerprint: createFingerprint(canonicalInput),
    compilerFingerprint: createFingerprint(compilerKey),
    hybridOverrideFingerprint: createFingerprint(hybridOverrideKey),
    compilerKey,
    structure,
    moduleReference,
  });
}

function compileSemanticCore(
  preparation,
  runtimeContent,
  compileSemanticLocation,
) {
  if (!runtimeContent.semanticBaseline) {
    return {
      compilerInput: null,
      baselineCompileResult: null,
      diagnostics: [],
      error: "Semantic baseline unavailable.",
    };
  }

  try {
    const session = createBaselineCompilerSession(preparation, runtimeContent);
    const compilerInput = {
      pack: runtimeContent.semanticBaseline.pack,
      module: runtimeContent.semanticBaseline.module,
      session,
    };
    const baselineCompileResult = compileSemanticLocation(compilerInput);
    return {
      compilerInput,
      baselineCompileResult,
      diagnostics: baselineCompileResult.diagnostics || [],
      error: "",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      compilerInput: null,
      baselineCompileResult: null,
      diagnostics: [
        createRuntimeError(
          "semantic-preview.compile-failed",
          message,
        ),
      ],
      error: message,
    };
  }
}

function assembleSemanticPreview(preparation, runtimeContent, core) {
  const diagnostics = uniqueDiagnostics([
    ...(runtimeContent.diagnostics || []),
    ...(core.diagnostics || []),
  ]);
  const compileResult = core.compileResult;
  return deepFreeze({
    schemaVersion: DARK_PLACES_COMPOSER_SEMANTIC_PREVIEW_SCHEMA_VERSION,
    inputFingerprint: preparation.inputFingerprint,
    compilerFingerprint: preparation.compilerFingerprint,
    hybridOverrideFingerprint: preparation.hybridOverrideFingerprint,
    input: preparation.input,
    runtimeContent,
    compilerInput: core.compilerInput,
    baselineCompileResult: core.baselineCompileResult,
    compileResult,
    overrides: core.hybridOverrideResult,
    valid:
      runtimeContent.valid &&
      Boolean(compileResult?.valid) &&
      !diagnostics.some((issue) => issue.severity === "error"),
    diagnostics,
    document: compileResult?.document || null,
    mapRequest: compileResult?.mapRequest || null,
    baseline: runtimeContent.semanticBaseline,
    provenance: {
      input: preparation.input.provenance,
      runtime: runtimeContent.provenance,
      document: compileResult?.document?.provenance || null,
    },
    error: core.error || "",
  });
}

export function createDarkPlacesComposerSemanticPreviewMemoizer({
  resolveRuntimeContent = resolveDarkPlacesRuntimeContent,
  compileSemanticLocation = compileDarkPlacesSemanticLocation,
  applyHybridOverrides = applyDarkPlacesHybridOverrides,
} = {}) {
  let cachedCompilerKey = "";
  let cachedCore = null;

  return function getSemanticPreview(preparation) {
    const runtimeContent = resolveRuntimeContent(preparation.input);
    if (!cachedCore || cachedCompilerKey !== preparation.compilerKey) {
      cachedCompilerKey = preparation.compilerKey;
      cachedCore = compileSemanticCore(
        preparation,
        runtimeContent,
        compileSemanticLocation,
      );
    }
    const hybridOverrideResult = cachedCore.baselineCompileResult
      ? applyHybridOverrides({
          compileResult: cachedCore.baselineCompileResult,
          overridePlan: runtimeContent.hybridOverridePlan,
        })
      : null;
    const core = {
      ...cachedCore,
      hybridOverrideResult,
      compileResult:
        hybridOverrideResult?.compileResult ||
        cachedCore.baselineCompileResult ||
        null,
      diagnostics: uniqueDiagnostics([
        ...(cachedCore.diagnostics || []),
        ...(hybridOverrideResult?.diagnostics || []),
      ]),
    };
    return assembleSemanticPreview(preparation, runtimeContent, core);
  };
}
