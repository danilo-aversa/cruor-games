import {
  cleanText,
  collectUnknownFields,
  createParseResult,
  deepFreeze,
  normalizeId,
  normalizeStringSet,
  requireArray,
  requireId,
  requirePlainObject,
  requireSchemaVersion,
  requireText,
} from "./contract-utils.js";
import {
  normalizeLocationDocumentV2,
  validateLocationDocumentV2,
} from "./location-document-v2.js";
import {
  normalizeSemanticProvenance,
  validateSemanticProvenance,
} from "./provenance-v1.js";
import { SEMANTIC_SCHEMA_VERSIONS } from "./schema-versions.js";

const SESSION_FIELDS = Object.freeze([
  "schemaVersion",
  "id",
  "seed",
  "moduleId",
  "selectedComponentIds",
  "locationSeed",
  "provenance",
]);
const LOCATION_SEED_FIELDS = Object.freeze([
  "meta",
  "identity",
  "siteWide",
  "sessionGuide",
  "map",
  "rooms",
  "coverage",
]);

function createSeedDocument(value = {}, session = {}) {
  return normalizeLocationDocumentV2({
    id: session.id,
    seed: session.seed,
    meta: value.meta,
    identity: value.identity,
    siteWide: value.siteWide,
    sessionGuide: value.sessionGuide,
    map: value.map,
    rooms: value.rooms,
    validation: {
      status: "draft",
      issues: [],
      coverage: value.coverage,
    },
    provenance: session.provenance,
  });
}

export function normalizeSessionStateV1(value = {}) {
  const provenance = normalizeSemanticProvenance(value.provenance);
  const session = {
    id: normalizeId(value.id),
    seed: cleanText(value.seed),
    provenance,
  };
  const seedDocument = createSeedDocument(value.locationSeed, session);

  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SESSION_STATE,
    id: session.id,
    seed: session.seed,
    moduleId: normalizeId(value.moduleId),
    selectedComponentIds: normalizeStringSet(value.selectedComponentIds, {
      ids: true,
    }),
    locationSeed: {
      meta: seedDocument.meta,
      identity: seedDocument.identity,
      siteWide: seedDocument.siteWide,
      sessionGuide: seedDocument.sessionGuide,
      map: seedDocument.map,
      rooms: seedDocument.rooms,
      coverage: seedDocument.validation.coverage,
    },
    provenance,
  });
}

export function validateSessionStateV1(value = {}, { path = "session" } = {}) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, SESSION_FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.SESSION_STATE,
    `${path}.schemaVersion`,
    issues,
  );
  requireId(value.id, `${path}.id`, issues);
  requireText(value.seed, `${path}.seed`, issues);
  requireId(value.moduleId, `${path}.moduleId`, issues);
  requireArray(
    value.selectedComponentIds,
    `${path}.selectedComponentIds`,
    issues,
  );
  if (Array.isArray(value.selectedComponentIds)) {
    value.selectedComponentIds.forEach((componentId, index) =>
      requireId(componentId, `${path}.selectedComponentIds[${index}]`, issues),
    );
  }
  issues.push(
    ...validateSemanticProvenance(value.provenance, {
      path: `${path}.provenance`,
    }),
  );

  if (requirePlainObject(value.locationSeed, `${path}.locationSeed`, issues)) {
    collectUnknownFields(
      value.locationSeed,
      LOCATION_SEED_FIELDS,
      `${path}.locationSeed`,
      issues,
    );
    const seedDocument = {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.LOCATION_DOCUMENT,
      id: value.id,
      seed: value.seed,
      meta: value.locationSeed.meta,
      identity: value.locationSeed.identity,
      siteWide: value.locationSeed.siteWide,
      sessionGuide: value.locationSeed.sessionGuide,
      map: value.locationSeed.map,
      rooms: value.locationSeed.rooms,
      validation: {
        status: "draft",
        issues: [],
        coverage: value.locationSeed.coverage,
      },
      provenance: value.provenance,
    };
    issues.push(
      ...validateLocationDocumentV2(seedDocument, {
        path: `${path}.locationSeed`,
      }).filter(
        (issue) =>
          !issue.path.endsWith(".schemaVersion") &&
          !issue.path.endsWith(".id") &&
          !issue.path.endsWith(".seed") &&
          !issue.path.endsWith(".validation.status") &&
          !issue.path.endsWith(".validation.issues"),
      ),
    );
  }

  return issues;
}

export function parseSessionStateV1(value = {}, options = {}) {
  const normalized = normalizeSessionStateV1(value);
  return createParseResult(normalized, validateSessionStateV1(value, options));
}
