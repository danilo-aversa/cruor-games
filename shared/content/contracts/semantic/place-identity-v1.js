import {
  cleanText,
  collectUnknownFields,
  createParseResult,
  deepFreeze,
  normalizeStringList,
  pushIssue,
  requireArray,
  requirePlainObject,
  requireSchemaVersion,
  requireText,
} from "./contract-utils.js";
import {
  normalizeSemanticProvenance,
  validateSemanticProvenance,
} from "./provenance-v1.js";
import { SEMANTIC_SCHEMA_VERSIONS } from "./schema-versions.js";

const FIELDS = Object.freeze([
  "schemaVersion",
  "originalPurpose",
  "originalUsers",
  "historicalChange",
  "horrorTruth",
  "currentFunction",
  "currentConflict",
  "playerEntryPoints",
  "stakes",
  "toneKeywords",
  "provenance",
]);

export function normalizePlaceIdentityV1(value = {}) {
  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.PLACE_IDENTITY,
    originalPurpose: cleanText(value.originalPurpose),
    originalUsers: normalizeStringList(value.originalUsers),
    historicalChange: cleanText(value.historicalChange),
    horrorTruth: cleanText(value.horrorTruth),
    currentFunction: cleanText(value.currentFunction),
    currentConflict: cleanText(value.currentConflict),
    playerEntryPoints: normalizeStringList(value.playerEntryPoints),
    stakes: normalizeStringList(value.stakes),
    toneKeywords: normalizeStringList(value.toneKeywords),
    provenance: normalizeSemanticProvenance(value.provenance),
  });
}

export function validatePlaceIdentityV1(
  value = {},
  { path = "semantic", published = false } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.PLACE_IDENTITY,
    `${path}.schemaVersion`,
    issues,
  );

  ["originalUsers", "playerEntryPoints", "stakes", "toneKeywords"].forEach(
    (field) => requireArray(value[field], `${path}.${field}`, issues),
  );

  if (published) {
    [
      "originalPurpose",
      "historicalChange",
      "horrorTruth",
      "currentFunction",
    ].forEach((field) => requireText(value[field], `${path}.${field}`, issues));
    if (!value.playerEntryPoints?.length) {
      pushIssue(
        issues,
        "place-identity.entry-point-required",
        `${path}.playerEntryPoints`,
        "Published Place Identity requires at least one player entry point.",
      );
    }
    if (!value.stakes?.length) {
      pushIssue(
        issues,
        "place-identity.stake-required",
        `${path}.stakes`,
        "Published Place Identity requires at least one stake.",
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

export function parsePlaceIdentityV1(value = {}, options = {}) {
  const normalized = normalizePlaceIdentityV1(value);
  return createParseResult(normalized, validatePlaceIdentityV1(value, options));
}
