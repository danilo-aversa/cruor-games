import {
  cleanText,
  collectUnknownFields,
  createParseResult,
  deepFreeze,
  findDuplicates,
  normalizeEnum,
  normalizeId,
  normalizeStringList,
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

export const ATMOSPHERE_INTENSITIES = Object.freeze(["low", "medium", "high"]);
export const ATMOSPHERE_FREQUENCIES = Object.freeze([
  "pervasive",
  "recurring",
  "rare",
]);

const FIELDS = Object.freeze([
  "schemaVersion",
  "signature",
  "manifestations",
  "exclusions",
  "escalationLinks",
  "provenance",
]);
const MANIFESTATION_FIELDS = Object.freeze([
  "id",
  "text",
  "senses",
  "intensity",
  "frequency",
]);

function normalizeManifestation(value = {}) {
  return {
    id: normalizeId(value.id),
    text: cleanText(value.text),
    senses: normalizeStringList(value.senses, { ids: true }),
    intensity: normalizeEnum(value.intensity, ATMOSPHERE_INTENSITIES, "low"),
    frequency: normalizeEnum(
      value.frequency,
      ATMOSPHERE_FREQUENCIES,
      "recurring",
    ),
  };
}

export function normalizeSiteAtmosphereV1(value = {}) {
  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SITE_ATMOSPHERE,
    signature: cleanText(value.signature),
    manifestations: (Array.isArray(value.manifestations)
      ? value.manifestations
      : []
    ).map(normalizeManifestation),
    exclusions: normalizeStringList(value.exclusions),
    escalationLinks: normalizeStringList(value.escalationLinks, { ids: true }),
    provenance: normalizeSemanticProvenance(value.provenance),
  });
}

export function validateSiteAtmosphereV1(
  value = {},
  { path = "semantic", published = false } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.SITE_ATMOSPHERE,
    `${path}.schemaVersion`,
    issues,
  );
  requireText(value.signature, `${path}.signature`, issues);
  requireArray(value.exclusions, `${path}.exclusions`, issues);
  requireArray(value.escalationLinks, `${path}.escalationLinks`, issues);

  if (requireArray(value.manifestations, `${path}.manifestations`, issues)) {
    value.manifestations.forEach((manifestation, index) => {
      const itemPath = `${path}.manifestations[${index}]`;
      if (!requirePlainObject(manifestation, itemPath, issues)) return;
      collectUnknownFields(
        manifestation,
        MANIFESTATION_FIELDS,
        itemPath,
        issues,
      );
      requireId(manifestation.id, `${itemPath}.id`, issues);
      requireText(manifestation.text, `${itemPath}.text`, issues);
      requireArray(manifestation.senses, `${itemPath}.senses`, issues);
      if (!ATMOSPHERE_INTENSITIES.includes(manifestation.intensity)) {
        pushIssue(
          issues,
          "site-atmosphere.invalid-intensity",
          `${itemPath}.intensity`,
          `Unknown atmosphere intensity: ${cleanText(manifestation.intensity)}.`,
        );
      }
      if (!ATMOSPHERE_FREQUENCIES.includes(manifestation.frequency)) {
        pushIssue(
          issues,
          "site-atmosphere.invalid-frequency",
          `${itemPath}.frequency`,
          `Unknown atmosphere frequency: ${cleanText(manifestation.frequency)}.`,
        );
      }
    });

    findDuplicates(value.manifestations, (entry) => entry.id).forEach((id) => {
      pushIssue(
        issues,
        "site-atmosphere.duplicate-manifestation-id",
        `${path}.manifestations`,
        `Duplicate manifestation id: ${id}.`,
      );
    });
    findDuplicates(value.manifestations, (entry) => entry.text).forEach(
      (text) => {
        pushIssue(
          issues,
          "site-atmosphere.duplicate-manifestation-text",
          `${path}.manifestations`,
          `Duplicate manifestation text: ${text}.`,
        );
      },
    );

    if (published && value.manifestations.length < 3) {
      pushIssue(
        issues,
        "site-atmosphere.coverage",
        `${path}.manifestations`,
        "Published Site Atmosphere should provide at least three manifestations.",
        "warning",
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

export function parseSiteAtmosphereV1(value = {}, options = {}) {
  const normalized = normalizeSiteAtmosphereV1(value);
  return createParseResult(
    normalized,
    validateSiteAtmosphereV1(value, options),
  );
}
