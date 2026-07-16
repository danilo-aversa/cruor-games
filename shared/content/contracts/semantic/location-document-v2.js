import {
  cleanText,
  cloneJson,
  collectUnknownFields,
  createParseResult,
  deepFreeze,
  findDuplicates,
  normalizeEnum,
  normalizeId,
  normalizeInteger,
  normalizeStringList,
  normalizeStringSet,
  pushIssue,
  requireArray,
  requireId,
  requirePlainObject,
  requireSchemaVersion,
  requireText,
} from "./contract-utils.js";
import {
  normalizeSemanticProvenance,
  validateSemanticProvenance,
} from "./provenance-v1.js";
import { SEMANTIC_SCHEMA_VERSIONS } from "./schema-versions.js";

export const LOCATION_DOCUMENT_VALIDATION_STATUSES = Object.freeze([
  "draft",
  "valid",
  "invalid",
]);

export const LOCATION_DOCUMENT_BLOCK_KINDS = Object.freeze([
  "atmosphere",
  "global-rule",
  "recurring-sign",
  "stake",
  "read-aloud",
  "sensory",
  "visible-feature",
  "interaction",
  "hazard",
  "clue",
  "encounter-twist",
  "secret",
  "reward",
  "note",
]);

const DOCUMENT_FIELDS = Object.freeze([
  "schemaVersion",
  "id",
  "seed",
  "meta",
  "identity",
  "siteWide",
  "sessionGuide",
  "map",
  "rooms",
  "validation",
  "provenance",
]);
const META_FIELDS = Object.freeze([
  "title",
  "context",
  "horror",
  "sourceAnchors",
  "intrusion",
]);
const IDENTITY_FIELDS = Object.freeze([
  "historyParagraph",
  "currentSituationParagraph",
  "playerEntryPoint",
  "stakes",
  "provenance",
]);
const SITE_WIDE_FIELDS = Object.freeze([
  "atmosphere",
  "globalRules",
  "recurringSigns",
  "stakesAndConsequences",
  "provenance",
]);
const SESSION_GUIDE_FIELDS = Object.freeze([
  "openingBeat",
  "objectives",
  "pressureTracks",
  "alwaysOnRules",
  "clueFlow",
  "stallMoves",
  "roomShortcuts",
  "provenance",
]);
const MAP_FIELDS = Object.freeze([
  "mapType",
  "counts",
  "legend",
  "levels",
  "rooms",
  "connections",
  "provenance",
]);
const MAP_ROOM_FIELDS = Object.freeze([
  "id",
  "number",
  "name",
  "role",
  "level",
  "shape",
  "sourceRegionId",
  "sourceComponentIds",
]);
const CONNECTION_FIELDS = Object.freeze([
  "id",
  "fromRoomId",
  "toRoomId",
  "kind",
  "secret",
  "locked",
  "crossLevel",
  "fromLevel",
  "toLevel",
  "levelDelta",
  "stairTransition",
]);
const ROOM_FIELDS = Object.freeze([
  "id",
  "number",
  "name",
  "role",
  "level",
  "shape",
  "sourceRegionId",
  "readAloud",
  "immediateImpressions",
  "visibleFeatures",
  "interactions",
  "hazards",
  "clues",
  "encounterTwists",
  "secrets",
  "rewards",
  "recurringSigns",
  "connections",
  "readiness",
  "sourceComponentIds",
  "sourceAnchorIds",
  "provenance",
]);
const READ_ALOUD_FIELDS = Object.freeze([
  "compact",
  "standard",
  "extended",
  "fragments",
  "provenance",
]);
const READINESS_FIELDS = Object.freeze([
  "status",
  "label",
  "completedSlotIds",
  "missingSlotIds",
  "missingSlotLabels",
  "readyCount",
  "totalCount",
]);
const BLOCK_FIELDS = Object.freeze([
  "id",
  "kind",
  "subtype",
  "title",
  "text",
  "summary",
  "audience",
  "facets",
  "sourceComponentId",
  "sourceAnchorIds",
  "mechanics",
  "counterplay",
  "narrative",
  "provenance",
  "metadata",
]);
const VALIDATION_FIELDS = Object.freeze(["status", "issues", "coverage"]);
const COVERAGE_FIELDS = Object.freeze([
  "filledSlots",
  "totalSlots",
  "readyRooms",
  "incompleteRooms",
]);

function sortById(values = []) {
  return [...values].sort((left, right) =>
    `${left.id || ""}`.localeCompare(`${right.id || ""}`),
  );
}

function normalizeBlock(value = {}) {
  return {
    id: normalizeId(value.id),
    kind: normalizeEnum(value.kind, LOCATION_DOCUMENT_BLOCK_KINDS, "note"),
    subtype: cleanText(value.subtype),
    title: cleanText(value.title),
    text: cleanText(value.text),
    summary: cleanText(value.summary),
    audience: cleanText(value.audience) || "gm",
    facets: cloneJson(value.facets, []),
    sourceComponentId: normalizeId(value.sourceComponentId),
    sourceAnchorIds: normalizeStringSet(value.sourceAnchorIds, { ids: true }),
    mechanics:
      typeof value.mechanics === "string"
        ? cleanText(value.mechanics)
        : cloneJson(value.mechanics, null),
    counterplay: cleanText(value.counterplay),
    narrative: cleanText(value.narrative),
    provenance: normalizeSemanticProvenance(value.provenance),
    metadata: cloneJson(value.metadata, {}),
  };
}

function normalizeBlocks(value) {
  return sortById((Array.isArray(value) ? value : []).map(normalizeBlock));
}

function normalizeConnection(value = {}) {
  return {
    id: normalizeId(value.id),
    fromRoomId: normalizeId(value.fromRoomId),
    toRoomId: normalizeId(value.toRoomId),
    kind: cleanText(value.kind) || "main",
    secret: Boolean(value.secret),
    locked: Boolean(value.locked),
    crossLevel: Boolean(value.crossLevel),
    fromLevel: normalizeInteger(value.fromLevel, 0),
    toLevel: normalizeInteger(value.toLevel, 0),
    levelDelta: normalizeInteger(value.levelDelta, 0),
    stairTransition: cleanText(value.stairTransition),
  };
}

function normalizeReadAloud(value = {}, provenance = {}) {
  return {
    compact: cleanText(value.compact),
    standard: cleanText(value.standard),
    extended: cleanText(value.extended),
    fragments: normalizeBlocks(value.fragments),
    provenance: normalizeSemanticProvenance(value.provenance || provenance),
  };
}

function normalizeReadiness(value = {}) {
  return {
    status: cleanText(value.status) || "draft",
    label: cleanText(value.label) || "Draft",
    completedSlotIds: normalizeStringSet(value.completedSlotIds, { ids: true }),
    missingSlotIds: normalizeStringSet(value.missingSlotIds, { ids: true }),
    missingSlotLabels: normalizeStringSet(value.missingSlotLabels),
    readyCount: normalizeInteger(value.readyCount, 0, { min: 0 }),
    totalCount: normalizeInteger(value.totalCount, 0, { min: 0 }),
  };
}

function normalizeRoom(value = {}, fallbackProvenance = {}) {
  const provenance = value.provenance || fallbackProvenance;
  return {
    id: normalizeId(value.id),
    number: normalizeInteger(value.number, 0, { min: 0 }),
    name: cleanText(value.name),
    role: cleanText(value.role),
    level: normalizeInteger(value.level, 0),
    shape: cleanText(value.shape),
    sourceRegionId: normalizeId(value.sourceRegionId || value.id),
    readAloud: normalizeReadAloud(value.readAloud, provenance),
    immediateImpressions: normalizeBlocks(value.immediateImpressions),
    visibleFeatures: normalizeBlocks(value.visibleFeatures),
    interactions: normalizeBlocks(value.interactions),
    hazards: normalizeBlocks(value.hazards),
    clues: normalizeBlocks(value.clues),
    encounterTwists: normalizeBlocks(value.encounterTwists),
    secrets: normalizeBlocks(value.secrets),
    rewards: normalizeBlocks(value.rewards),
    recurringSigns: normalizeBlocks(value.recurringSigns),
    connections: sortById(
      (Array.isArray(value.connections) ? value.connections : []).map(
        normalizeConnection,
      ),
    ),
    readiness: normalizeReadiness(value.readiness),
    sourceComponentIds: normalizeStringSet(value.sourceComponentIds, {
      ids: true,
    }),
    sourceAnchorIds: normalizeStringSet(value.sourceAnchorIds, { ids: true }),
    provenance: normalizeSemanticProvenance(provenance),
  };
}

function normalizeMapRoom(value = {}) {
  return {
    id: normalizeId(value.id),
    number: normalizeInteger(value.number, 0, { min: 0 }),
    name: cleanText(value.name),
    role: cleanText(value.role),
    level: normalizeInteger(value.level, 0),
    shape: cleanText(value.shape),
    sourceRegionId: normalizeId(value.sourceRegionId || value.id),
    sourceComponentIds: normalizeStringSet(value.sourceComponentIds, {
      ids: true,
    }),
  };
}

function normalizeCoverage(value = {}) {
  return {
    filledSlots: normalizeInteger(value.filledSlots, 0, { min: 0 }),
    totalSlots: normalizeInteger(value.totalSlots, 0, { min: 0 }),
    readyRooms: normalizeInteger(value.readyRooms, 0, { min: 0 }),
    incompleteRooms: sortById(
      (Array.isArray(value.incompleteRooms) ? value.incompleteRooms : []).map(
        (room) => ({
          id: normalizeId(room.id || room.roomId),
          number: normalizeInteger(room.number ?? room.roomNumber, 0, {
            min: 0,
          }),
          name: cleanText(room.name || room.roomName),
          missingSlotIds: normalizeStringSet(room.missingSlotIds, {
            ids: true,
          }),
          missingSlotLabels: normalizeStringSet(room.missingSlotLabels),
        }),
      ),
    ),
  };
}

export function normalizeLocationDocumentBlockV2(value = {}) {
  return deepFreeze(normalizeBlock(value));
}

export function normalizeLocationDocumentV2(value = {}) {
  const provenance = normalizeSemanticProvenance(value.provenance);
  const meta = value.meta || {};
  const identity = value.identity || {};
  const siteWide = value.siteWide || {};
  const sessionGuide = value.sessionGuide || {};
  const map = value.map || {};
  const validation = value.validation || {};

  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.LOCATION_DOCUMENT,
    id: normalizeId(value.id),
    seed: cleanText(value.seed),
    meta: {
      title: cleanText(meta.title),
      context: cleanText(meta.context),
      horror: normalizeStringSet(meta.horror),
      sourceAnchors: normalizeStringSet(meta.sourceAnchors, { ids: true }),
      intrusion: cleanText(meta.intrusion),
    },
    identity: {
      historyParagraph: cleanText(identity.historyParagraph),
      currentSituationParagraph: cleanText(identity.currentSituationParagraph),
      playerEntryPoint: cleanText(identity.playerEntryPoint),
      stakes: normalizeStringList(identity.stakes),
      provenance: normalizeSemanticProvenance(
        identity.provenance || provenance,
      ),
    },
    siteWide: {
      atmosphere: normalizeBlocks(siteWide.atmosphere),
      globalRules: normalizeBlocks(siteWide.globalRules),
      recurringSigns: normalizeBlocks(siteWide.recurringSigns),
      stakesAndConsequences: normalizeBlocks(siteWide.stakesAndConsequences),
      provenance: normalizeSemanticProvenance(
        siteWide.provenance || provenance,
      ),
    },
    sessionGuide: {
      openingBeat: cloneJson(sessionGuide.openingBeat, {}),
      objectives: normalizeStringList(sessionGuide.objectives),
      pressureTracks: normalizeBlocks(sessionGuide.pressureTracks),
      alwaysOnRules: normalizeBlocks(sessionGuide.alwaysOnRules),
      clueFlow: cloneJson(sessionGuide.clueFlow, {}),
      stallMoves: cloneJson(sessionGuide.stallMoves, []),
      roomShortcuts: cloneJson(sessionGuide.roomShortcuts, []),
      provenance: normalizeSemanticProvenance(
        sessionGuide.provenance || provenance,
      ),
    },
    map: {
      mapType: cleanText(map.mapType),
      counts: cloneJson(map.counts, {}),
      legend: normalizeStringSet(map.legend),
      levels: [
        ...new Set(
          (Array.isArray(map.levels) ? map.levels : []).map((level) =>
            normalizeInteger(level, 0),
          ),
        ),
      ].sort((left, right) => left - right),
      rooms: (Array.isArray(map.rooms) ? map.rooms : [])
        .map(normalizeMapRoom)
        .sort(
          (left, right) =>
            left.number - right.number || left.id.localeCompare(right.id),
        ),
      connections: sortById(
        (Array.isArray(map.connections) ? map.connections : []).map(
          normalizeConnection,
        ),
      ),
      provenance: normalizeSemanticProvenance(map.provenance || provenance),
    },
    rooms: (Array.isArray(value.rooms) ? value.rooms : [])
      .map((room) => normalizeRoom(room, provenance))
      .sort(
        (left, right) =>
          left.number - right.number || left.id.localeCompare(right.id),
      ),
    validation: {
      status: normalizeEnum(
        validation.status,
        LOCATION_DOCUMENT_VALIDATION_STATUSES,
        "draft",
      ),
      issues: cloneJson(validation.issues, []),
      coverage: normalizeCoverage(validation.coverage),
    },
    provenance,
  });
}

export function validateLocationDocumentBlockV2(
  value = {},
  { path = "block" } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, BLOCK_FIELDS, path, issues);
  requireId(value.id, `${path}.id`, issues);
  if (!LOCATION_DOCUMENT_BLOCK_KINDS.includes(value.kind)) {
    pushIssue(
      issues,
      "location-document.invalid-block-kind",
      `${path}.kind`,
      `Unknown Location Document block kind: ${cleanText(value.kind)}.`,
    );
  }
  requireText(value.text, `${path}.text`, issues);
  requireArray(value.facets, `${path}.facets`, issues);
  requireArray(value.sourceAnchorIds, `${path}.sourceAnchorIds`, issues);
  requirePlainObject(value.metadata, `${path}.metadata`, issues);
  issues.push(
    ...validateSemanticProvenance(value.provenance, {
      path: `${path}.provenance`,
    }),
  );
  return issues;
}

function validateBlocks(value, path, issues) {
  if (!requireArray(value, path, issues)) return;
  value.forEach((block, index) =>
    issues.push(
      ...validateLocationDocumentBlockV2(block, {
        path: `${path}[${index}]`,
      }),
    ),
  );
  findDuplicates(value, (block) => block.id).forEach((id) => {
    pushIssue(
      issues,
      "location-document.duplicate-block-id",
      path,
      `Duplicate Location Document block id: ${id}.`,
    );
  });
}

function validateSectionProvenance(value, path, fields, issues) {
  if (!requirePlainObject(value, path, issues)) return false;
  collectUnknownFields(value, fields, path, issues);
  issues.push(
    ...validateSemanticProvenance(value.provenance, {
      path: `${path}.provenance`,
    }),
  );
  return true;
}

export function validateLocationDocumentV2(
  value = {},
  { path = "document" } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, DOCUMENT_FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.LOCATION_DOCUMENT,
    `${path}.schemaVersion`,
    issues,
  );
  requireId(value.id, `${path}.id`, issues);
  requireText(value.seed, `${path}.seed`, issues);

  if (requirePlainObject(value.meta, `${path}.meta`, issues)) {
    collectUnknownFields(value.meta, META_FIELDS, `${path}.meta`, issues);
    requireText(value.meta.title, `${path}.meta.title`, issues);
    requireText(value.meta.context, `${path}.meta.context`, issues);
    requireArray(value.meta.horror, `${path}.meta.horror`, issues);
    if (
      requireArray(
        value.meta.sourceAnchors,
        `${path}.meta.sourceAnchors`,
        issues,
      ) &&
      !value.meta.sourceAnchors.length
    ) {
      pushIssue(
        issues,
        "location-document.source-required",
        `${path}.meta.sourceAnchors`,
        "Location Document v2 requires at least one Source Anchor.",
      );
    }
    requireText(value.meta.intrusion, `${path}.meta.intrusion`, issues);
  }

  if (
    validateSectionProvenance(
      value.identity,
      `${path}.identity`,
      IDENTITY_FIELDS,
      issues,
    )
  ) {
    requireArray(value.identity.stakes, `${path}.identity.stakes`, issues);
  }

  if (
    validateSectionProvenance(
      value.siteWide,
      `${path}.siteWide`,
      SITE_WIDE_FIELDS,
      issues,
    )
  ) {
    validateBlocks(
      value.siteWide.atmosphere,
      `${path}.siteWide.atmosphere`,
      issues,
    );
    validateBlocks(
      value.siteWide.globalRules,
      `${path}.siteWide.globalRules`,
      issues,
    );
    validateBlocks(
      value.siteWide.recurringSigns,
      `${path}.siteWide.recurringSigns`,
      issues,
    );
    validateBlocks(
      value.siteWide.stakesAndConsequences,
      `${path}.siteWide.stakesAndConsequences`,
      issues,
    );
  }

  if (
    validateSectionProvenance(
      value.sessionGuide,
      `${path}.sessionGuide`,
      SESSION_GUIDE_FIELDS,
      issues,
    )
  ) {
    requirePlainObject(
      value.sessionGuide.openingBeat,
      `${path}.sessionGuide.openingBeat`,
      issues,
    );
    requireArray(
      value.sessionGuide.objectives,
      `${path}.sessionGuide.objectives`,
      issues,
    );
    validateBlocks(
      value.sessionGuide.pressureTracks,
      `${path}.sessionGuide.pressureTracks`,
      issues,
    );
    validateBlocks(
      value.sessionGuide.alwaysOnRules,
      `${path}.sessionGuide.alwaysOnRules`,
      issues,
    );
    requirePlainObject(
      value.sessionGuide.clueFlow,
      `${path}.sessionGuide.clueFlow`,
      issues,
    );
    requireArray(
      value.sessionGuide.stallMoves,
      `${path}.sessionGuide.stallMoves`,
      issues,
    );
    requireArray(
      value.sessionGuide.roomShortcuts,
      `${path}.sessionGuide.roomShortcuts`,
      issues,
    );
  }

  if (validateSectionProvenance(value.map, `${path}.map`, MAP_FIELDS, issues)) {
    requirePlainObject(value.map.counts, `${path}.map.counts`, issues);
    requireArray(value.map.legend, `${path}.map.legend`, issues);
    requireArray(value.map.levels, `${path}.map.levels`, issues);
    if (requireArray(value.map.rooms, `${path}.map.rooms`, issues)) {
      value.map.rooms.forEach((room, index) => {
        const roomPath = `${path}.map.rooms[${index}]`;
        if (!requirePlainObject(room, roomPath, issues)) return;
        collectUnknownFields(room, MAP_ROOM_FIELDS, roomPath, issues);
        requireId(room.id, `${roomPath}.id`, issues);
        requireText(room.name, `${roomPath}.name`, issues);
        requireArray(
          room.sourceComponentIds,
          `${roomPath}.sourceComponentIds`,
          issues,
        );
      });
    }
    if (
      requireArray(value.map.connections, `${path}.map.connections`, issues)
    ) {
      value.map.connections.forEach((connection, index) => {
        const connectionPath = `${path}.map.connections[${index}]`;
        if (!requirePlainObject(connection, connectionPath, issues)) return;
        collectUnknownFields(
          connection,
          CONNECTION_FIELDS,
          connectionPath,
          issues,
        );
        requireId(connection.id, `${connectionPath}.id`, issues);
        requireId(
          connection.fromRoomId,
          `${connectionPath}.fromRoomId`,
          issues,
        );
        requireId(connection.toRoomId, `${connectionPath}.toRoomId`, issues);
      });
    }
  }

  if (requireArray(value.rooms, `${path}.rooms`, issues)) {
    value.rooms.forEach((room, index) => {
      const roomPath = `${path}.rooms[${index}]`;
      if (!requirePlainObject(room, roomPath, issues)) return;
      collectUnknownFields(room, ROOM_FIELDS, roomPath, issues);
      requireId(room.id, `${roomPath}.id`, issues);
      requireText(room.name, `${roomPath}.name`, issues);
      requireArray(
        room.sourceComponentIds,
        `${roomPath}.sourceComponentIds`,
        issues,
      );
      requireArray(room.sourceAnchorIds, `${roomPath}.sourceAnchorIds`, issues);
      issues.push(
        ...validateSemanticProvenance(room.provenance, {
          path: `${roomPath}.provenance`,
        }),
      );
      if (requirePlainObject(room.readAloud, `${roomPath}.readAloud`, issues)) {
        collectUnknownFields(
          room.readAloud,
          READ_ALOUD_FIELDS,
          `${roomPath}.readAloud`,
          issues,
        );
        validateBlocks(
          room.readAloud.fragments,
          `${roomPath}.readAloud.fragments`,
          issues,
        );
        issues.push(
          ...validateSemanticProvenance(room.readAloud.provenance, {
            path: `${roomPath}.readAloud.provenance`,
          }),
        );
      }
      [
        "immediateImpressions",
        "visibleFeatures",
        "interactions",
        "hazards",
        "clues",
        "encounterTwists",
        "secrets",
        "rewards",
        "recurringSigns",
      ].forEach((field) =>
        validateBlocks(room[field], `${roomPath}.${field}`, issues),
      );
      requireArray(room.connections, `${roomPath}.connections`, issues);
      if (requirePlainObject(room.readiness, `${roomPath}.readiness`, issues)) {
        collectUnknownFields(
          room.readiness,
          READINESS_FIELDS,
          `${roomPath}.readiness`,
          issues,
        );
        requireArray(
          room.readiness.completedSlotIds,
          `${roomPath}.readiness.completedSlotIds`,
          issues,
        );
        requireArray(
          room.readiness.missingSlotIds,
          `${roomPath}.readiness.missingSlotIds`,
          issues,
        );
        requireArray(
          room.readiness.missingSlotLabels,
          `${roomPath}.readiness.missingSlotLabels`,
          issues,
        );
      }
    });
    findDuplicates(value.rooms, (room) => room.id).forEach((id) => {
      pushIssue(
        issues,
        "location-document.duplicate-room-id",
        `${path}.rooms`,
        `Duplicate Location Document room id: ${id}.`,
      );
    });
  }

  if (requirePlainObject(value.validation, `${path}.validation`, issues)) {
    collectUnknownFields(
      value.validation,
      VALIDATION_FIELDS,
      `${path}.validation`,
      issues,
    );
    if (
      !LOCATION_DOCUMENT_VALIDATION_STATUSES.includes(value.validation.status)
    ) {
      pushIssue(
        issues,
        "location-document.invalid-validation-status",
        `${path}.validation.status`,
        `Unknown validation status: ${cleanText(value.validation.status)}.`,
      );
    }
    requireArray(value.validation.issues, `${path}.validation.issues`, issues);
    if (
      requirePlainObject(
        value.validation.coverage,
        `${path}.validation.coverage`,
        issues,
      )
    ) {
      collectUnknownFields(
        value.validation.coverage,
        COVERAGE_FIELDS,
        `${path}.validation.coverage`,
        issues,
      );
      requireArray(
        value.validation.coverage.incompleteRooms,
        `${path}.validation.coverage.incompleteRooms`,
        issues,
      );
    }
  }

  issues.push(
    ...validateSemanticProvenance(value.provenance, {
      path: `${path}.provenance`,
    }),
  );
  return issues;
}

export function parseLocationDocumentV2(value = {}, options = {}) {
  const normalized = normalizeLocationDocumentV2(value);
  return createParseResult(
    normalized,
    validateLocationDocumentV2(value, options),
  );
}
