import {
  cleanText,
  collectUnknownFields,
  createParseResult,
  deepFreeze,
  normalizeEnum,
  normalizeId,
  normalizeStringSet,
  pushIssue,
  requireArray,
  requireId,
  requirePlainObject,
  requireSchemaVersion,
  requireText,
} from "./contract-utils.js";
import { SEMANTIC_SCHEMA_VERSIONS } from "./schema-versions.js";

export const PROVENANCE_RELATIONS = Object.freeze([
  "direct",
  "derived",
  "inspired-by",
  "editorial-constraint",
]);

export const PROVENANCE_MIGRATION_METHODS = Object.freeze([
  "authored-v2",
  "editorially-migrated",
  "compatibility-normalized",
]);

export const PROVENANCE_EDITORIAL_DECISIONS = Object.freeze([
  "approved",
  "needs-revision",
  "rejected",
]);

const PROVENANCE_FIELDS = Object.freeze([
  "schemaVersion",
  "sources",
  "legacyIds",
  "migration",
]);
const SOURCE_FIELDS = Object.freeze(["sourceAnchorId", "relation", "note"]);
const MIGRATION_FIELDS = Object.freeze([
  "fromSchema",
  "method",
  "editorialDecision",
  "reviewVersion",
  "note",
]);

function normalizeSource(source = {}) {
  return {
    sourceAnchorId: normalizeId(source.sourceAnchorId),
    relation: normalizeEnum(source.relation, PROVENANCE_RELATIONS, "derived"),
    note: cleanText(source.note),
  };
}

export function normalizeSemanticProvenance(value = {}) {
  const migration = value.migration || {};
  const sources = (Array.isArray(value.sources) ? value.sources : [])
    .map(normalizeSource)
    .filter((source) => source.sourceAnchorId)
    .sort((left, right) =>
      `${left.sourceAnchorId}:${left.relation}:${left.note}`.localeCompare(
        `${right.sourceAnchorId}:${right.relation}:${right.note}`,
      ),
    );

  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.PROVENANCE,
    sources,
    legacyIds: normalizeStringSet(value.legacyIds, { ids: true }),
    migration: {
      ...(cleanText(migration.fromSchema)
        ? { fromSchema: cleanText(migration.fromSchema) }
        : {}),
      method: normalizeEnum(
        migration.method,
        PROVENANCE_MIGRATION_METHODS,
        "authored-v2",
      ),
      editorialDecision: normalizeEnum(
        migration.editorialDecision,
        PROVENANCE_EDITORIAL_DECISIONS,
        "needs-revision",
      ),
      reviewVersion: cleanText(migration.reviewVersion),
      note: cleanText(migration.note),
    },
  });
}

export function createCompatibilityProvenance({
  sourceAnchorIds = [],
  legacyIds = [],
  fromSchema = "legacy-v1",
  reviewVersion = "compatibility-v1",
  note = "Compatibility-normalized draft; editorial review is required.",
} = {}) {
  return normalizeSemanticProvenance({
    sources: normalizeStringSet(sourceAnchorIds, { ids: true }).map(
      (sourceAnchorId) => ({
        sourceAnchorId,
        relation: "derived",
        note: "Read through the v1 compatibility boundary.",
      }),
    ),
    legacyIds,
    migration: {
      fromSchema,
      method: "compatibility-normalized",
      editorialDecision: "needs-revision",
      reviewVersion,
      note,
    },
  });
}

export function validateSemanticProvenance(
  value = {},
  { path = "provenance" } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;

  collectUnknownFields(value, PROVENANCE_FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.PROVENANCE,
    `${path}.schemaVersion`,
    issues,
  );

  if (requireArray(value.sources, `${path}.sources`, issues)) {
    if (!value.sources.length) {
      pushIssue(
        issues,
        "provenance.source-required",
        `${path}.sources`,
        "At least one provenance source is required.",
      );
    }
    value.sources.forEach((source, index) => {
      const sourcePath = `${path}.sources[${index}]`;
      if (!requirePlainObject(source, sourcePath, issues)) return;
      collectUnknownFields(source, SOURCE_FIELDS, sourcePath, issues);
      requireId(source.sourceAnchorId, `${sourcePath}.sourceAnchorId`, issues);
      if (!PROVENANCE_RELATIONS.includes(source.relation)) {
        pushIssue(
          issues,
          "provenance.invalid-relation",
          `${sourcePath}.relation`,
          `Unknown provenance relation: ${cleanText(source.relation)}.`,
        );
      }
      requireText(source.note, `${sourcePath}.note`, issues);
    });
  }

  requireArray(value.legacyIds, `${path}.legacyIds`, issues);

  if (requirePlainObject(value.migration, `${path}.migration`, issues)) {
    collectUnknownFields(
      value.migration,
      MIGRATION_FIELDS,
      `${path}.migration`,
      issues,
    );
    if (!PROVENANCE_MIGRATION_METHODS.includes(value.migration.method)) {
      pushIssue(
        issues,
        "provenance.invalid-method",
        `${path}.migration.method`,
        `Unknown migration method: ${cleanText(value.migration.method)}.`,
      );
    }
    if (
      !PROVENANCE_EDITORIAL_DECISIONS.includes(
        value.migration.editorialDecision,
      )
    ) {
      pushIssue(
        issues,
        "provenance.invalid-editorial-decision",
        `${path}.migration.editorialDecision`,
        `Unknown editorial decision: ${cleanText(value.migration.editorialDecision)}.`,
      );
    }
    requireText(
      value.migration.reviewVersion,
      `${path}.migration.reviewVersion`,
      issues,
    );
    requireText(value.migration.note, `${path}.migration.note`, issues);

    if (
      value.migration.method === "compatibility-normalized" &&
      value.migration.editorialDecision === "approved"
    ) {
      pushIssue(
        issues,
        "provenance.compatibility-cannot-approve",
        `${path}.migration.editorialDecision`,
        "Compatibility normalization cannot grant editorial approval.",
      );
    }
  }

  return issues;
}

export function parseSemanticProvenance(value = {}, options = {}) {
  const normalized = normalizeSemanticProvenance(value);
  return createParseResult(
    normalized,
    validateSemanticProvenance(value, options),
  );
}
