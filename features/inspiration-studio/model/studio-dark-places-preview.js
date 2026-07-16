import { DARK_PLACES_SEMANTIC_TYPES } from "../../../shared/content/contracts/semantic/index.js";
import {
  compileDarkPlacesSemanticLocation,
  createSessionStateFromLocationDocumentV1,
  serializeCompiledLocationDocument,
} from "../../darken-location/compiler/index.js";

export const STUDIO_PREVIEW_CONTEXTS = Object.freeze([
  "Crypt",
  "Chapel",
  "Cave",
  "Noble House",
  "Archive",
  "Dungeon",
]);

export const STUDIO_PREVIEW_INTRUSIONS = Object.freeze([
  "Low",
  "Medium",
  "High",
]);

export const STUDIO_PREVIEW_ROOM_ROLES = Object.freeze([
  "entrance",
  "threshold",
  "connector",
  "clue",
  "final",
  "ritual",
  "secret",
]);

export const STUDIO_PREVIEW_OUTPUT_TABS = Object.freeze([
  "overview",
  "at-the-table",
  "rooms",
]);

export const DEFAULT_STUDIO_PREVIEW_CONTROLS = Object.freeze({
  seed: "studio-semantic-preview-001",
  context: "Crypt",
  intrusion: "Medium",
  roomCount: 5,
  selectedRoomRole: "entrance",
  outputTab: "overview",
  showProvenance: false,
  showValidationIssues: true,
});

function clampRoomCount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric))
    return DEFAULT_STUDIO_PREVIEW_CONTROLS.roomCount;
  return Math.max(1, Math.min(12, Math.round(numeric)));
}

export function normalizeStudioPreviewControls(value = {}) {
  return {
    seed: String(value.seed || DEFAULT_STUDIO_PREVIEW_CONTROLS.seed).trim(),
    context: STUDIO_PREVIEW_CONTEXTS.includes(value.context)
      ? value.context
      : DEFAULT_STUDIO_PREVIEW_CONTROLS.context,
    intrusion: STUDIO_PREVIEW_INTRUSIONS.includes(value.intrusion)
      ? value.intrusion
      : DEFAULT_STUDIO_PREVIEW_CONTROLS.intrusion,
    roomCount: clampRoomCount(value.roomCount),
    selectedRoomRole: STUDIO_PREVIEW_ROOM_ROLES.includes(value.selectedRoomRole)
      ? value.selectedRoomRole
      : DEFAULT_STUDIO_PREVIEW_CONTROLS.selectedRoomRole,
    outputTab: STUDIO_PREVIEW_OUTPUT_TABS.includes(value.outputTab)
      ? value.outputTab
      : DEFAULT_STUDIO_PREVIEW_CONTROLS.outputTab,
    showProvenance: value.showProvenance === true,
    showValidationIssues: value.showValidationIssues !== false,
  };
}

export function nextStudioPreviewSeed(seed = "studio-semantic-preview-001") {
  const match = String(seed).match(/^(.*?)(\d+)$/);
  if (!match) return `${String(seed || "studio-semantic-preview")}-002`;
  const next = String(Number(match[2]) + 1).padStart(match[2].length, "0");
  return `${match[1]}${next}`;
}

function createRoomRoleSequence(selectedRole, roomCount) {
  const roles = [
    selectedRole,
    ...STUDIO_PREVIEW_ROOM_ROLES.filter((role) => role !== selectedRole),
  ];
  return Array.from(
    { length: roomCount },
    (_, index) => roles[index % roles.length],
  );
}

function createPreviewRoom(role, index, sourceAnchorId) {
  const roomId = `studio-preview-room-${index + 1}`;
  return {
    id: roomId,
    sourceRegionId: roomId,
    number: index + 1,
    name: `${role.charAt(0).toUpperCase()}${role.slice(1)} ${index + 1}`,
    role,
    level: 0,
    shape: role === "ritual" || role === "final" ? "circular" : "rect",
    sourceComponentIds: [],
    sourceAnchorIds: [sourceAnchorId],
    readAloud: [],
    immediateImpressions: { sensory: [], features: [], interactions: [] },
    hazards: [],
    clues: [],
    encounterTwists: [],
    secrets: [],
    rewards: [],
    connections: [],
    readiness: {
      status: "draft",
      label: "Preview",
      completedSlotIds: [],
      missingSlotIds: [],
      missingSlotLabels: [],
      readyCount: 0,
      totalCount: 0,
    },
  };
}

export function createStudioPreviewLocationSeed(module = {}, controls = {}) {
  const normalizedControls = normalizeStudioPreviewControls(controls);
  const sourceAnchorId =
    module.sourceAnchor?.id || module.id || "studio-preview";
  const roles = createRoomRoleSequence(
    normalizedControls.selectedRoomRole,
    normalizedControls.roomCount,
  );
  const rooms = roles.map((role, index) =>
    createPreviewRoom(role, index, sourceAnchorId),
  );
  const connections = rooms.slice(1).map((room, index) => ({
    id: `studio-preview-connection-${index + 1}`,
    fromRoomId: rooms[index].id,
    toRoomId: room.id,
    kind: "main",
    secret: false,
    locked: false,
  }));

  return {
    schemaVersion: "dark-places-document-v1",
    meta: {
      title: `${module.title || "Untitled Inspiration"} — Studio Preview`,
      context: normalizedControls.context,
      horror: module.inspiration?.horror || [],
      sourceAnchors: [sourceAnchorId],
      intrusion: normalizedControls.intrusion,
      workflow: "darken-location",
    },
    overview: {
      premise: [],
      sensory: [],
      visibleAnomalies: [],
      rewardConsequences: [],
      atTheTable: [],
    },
    map: {
      seed: normalizedControls.seed,
      mapType: normalizedControls.context,
      counts: { rooms: rooms.length, connections: connections.length },
      legend: [],
      levels: [0],
      rooms: rooms.map((room) => ({
        id: room.id,
        number: room.number,
        name: room.name,
        role: room.role,
        level: room.level,
        shape: room.shape,
        sourceRegionId: room.sourceRegionId,
        sourceComponentIds: [],
      })),
      connections,
    },
    rooms: rooms.map((room, index) => ({
      ...room,
      connections: [
        ...(index > 0
          ? [
              {
                id: connections[index - 1].id,
                fromRoomId: rooms[index - 1].id,
                toRoomId: room.id,
                kind: "main",
              },
            ]
          : []),
        ...(index < connections.length
          ? [
              {
                id: connections[index].id,
                fromRoomId: room.id,
                toRoomId: rooms[index + 1].id,
                kind: "main",
              },
            ]
          : []),
      ],
    })),
    readiness: {
      filledSlots: 0,
      totalSlots: 0,
      readyRooms: rooms.length,
      incompleteRooms: [],
    },
  };
}

function getSelectedDarkPlacesComponentIds(module = {}) {
  const supportedTypes = new Set(DARK_PLACES_SEMANTIC_TYPES);
  return (module.components || [])
    .filter(
      (component) =>
        supportedTypes.has(component.semanticType) &&
        component.workflows?.includes("darken-location"),
    )
    .map((component) => component.id)
    .sort();
}

function createPreviewFingerprint(bytes = "") {
  let hash = 2166136261;
  for (let index = 0; index < bytes.length; index += 1) {
    hash ^= bytes.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function compileStudioDarkPlacesPreview({
  pack,
  module,
  controls,
} = {}) {
  const normalizedControls = normalizeStudioPreviewControls(controls);
  try {
    if (!pack || !module)
      throw new Error("Preview requires a canonical pack and module.");
    const legacySeed = createStudioPreviewLocationSeed(
      module,
      normalizedControls,
    );
    const selectedComponentIds = getSelectedDarkPlacesComponentIds(module);
    const session = createSessionStateFromLocationDocumentV1(legacySeed, {
      id: `${module.id}-studio-preview`,
      seed: normalizedControls.seed,
      moduleId: module.id,
      selectedComponentIds,
      preserveLegacySemanticOverview: false,
    });
    const result = compileDarkPlacesSemanticLocation({ pack, module, session });
    const bytes = serializeCompiledLocationDocument(result.document);
    return {
      status: result.valid ? "ready" : "invalid",
      controls: normalizedControls,
      session,
      result,
      document: result.document,
      diagnostics: result.diagnostics,
      bytes,
      fingerprint: createPreviewFingerprint(bytes),
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      controls: normalizedControls,
      session: null,
      result: null,
      document: null,
      diagnostics: [
        {
          code: "studio.preview.compile-failed",
          severity: "error",
          path: "preview",
          message: error instanceof Error ? error.message : String(error),
        },
      ],
      bytes: "",
      fingerprint: "",
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export function selectStudioPreviewRoom(
  document = {},
  selectedRole = "entrance",
) {
  return (
    document.rooms?.find((room) => room.role === selectedRole) ||
    document.rooms?.[0] ||
    null
  );
}
