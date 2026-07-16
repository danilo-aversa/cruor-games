import {
  cleanText,
  collectUnknownFields,
  createParseResult,
  deepFreeze,
  findDuplicates,
  normalizeInteger,
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

export const SENSORY_CHANNELS = Object.freeze([
  "sight",
  "sound",
  "smell",
  "touch",
  "taste",
  "temperature",
  "proprioception",
]);
export const SENSORY_INTENSITY_TIERS = Object.freeze(["low", "medium", "high"]);
export const SENSORY_ROOM_ROLES = Object.freeze([
  "entrance",
  "threshold",
  "ritual",
  "secret",
  "climax",
  "connector",
]);
export const SENSORY_GEOMETRY_BIASES = Object.freeze([
  "circular",
  "narrow",
  "large",
  "vertical",
  "ruined",
]);

const FIELDS = Object.freeze([
  "schemaVersion",
  "signature",
  "variants",
  "intensityTiers",
  "roomRoleBias",
  "geometryBias",
  "exclusions",
  "repetitionPolicy",
  "provenance",
]);
const REPETITION_FIELDS = Object.freeze([
  "exactTextCooldown",
  "senseCooldown",
  "allowSignatureRepeat",
]);

function normalizeStringMap(value, keys) {
  const source = value || {};
  return Object.fromEntries(
    keys.map((key) => [key, normalizeStringList(source[key])]),
  );
}

export function normalizeSensoryProfileV1(value = {}) {
  const repetitionPolicy = value.repetitionPolicy || {};
  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SENSORY_PROFILE,
    signature: cleanText(value.signature),
    variants: normalizeStringMap(value.variants, SENSORY_CHANNELS),
    intensityTiers: normalizeStringMap(
      value.intensityTiers,
      SENSORY_INTENSITY_TIERS,
    ),
    roomRoleBias: normalizeStringMap(value.roomRoleBias, SENSORY_ROOM_ROLES),
    geometryBias: normalizeStringMap(
      value.geometryBias,
      SENSORY_GEOMETRY_BIASES,
    ),
    exclusions: normalizeStringList(value.exclusions),
    repetitionPolicy: {
      exactTextCooldown:
        cleanText(repetitionPolicy.exactTextCooldown) || "all-rooms",
      senseCooldown: normalizeInteger(repetitionPolicy.senseCooldown, 1, {
        min: 0,
        max: 99,
      }),
      allowSignatureRepeat: repetitionPolicy.allowSignatureRepeat === true,
    },
    provenance: normalizeSemanticProvenance(value.provenance),
  });
}

function validateStringMap(value, keys, path, issues) {
  if (!requirePlainObject(value, path, issues)) return;
  collectUnknownFields(value, keys, path, issues);
  keys.forEach((key) => requireArray(value[key], `${path}.${key}`, issues));
}

export function getSensoryProfileCoverage(value = {}) {
  const variants = value.variants || {};
  const intensityTiers = value.intensityTiers || {};
  const variantTexts = SENSORY_CHANNELS.flatMap(
    (sense) => variants[sense] || [],
  );
  const representedSenses = SENSORY_CHANNELS.filter(
    (sense) => variants[sense]?.length,
  );
  const representedTiers = SENSORY_INTENSITY_TIERS.filter(
    (tier) => intensityTiers[tier]?.length,
  );
  const biasGroups = [
    value.roomRoleBias || {},
    value.geometryBias || {},
  ].flatMap((group) => Object.values(group));
  return deepFreeze({
    totalVariants: variantTexts.length,
    representedSenses,
    representedTiers,
    populatedBiases: biasGroups.filter((entries) => entries?.length).length,
    duplicateTexts: findDuplicates([
      ...variantTexts,
      ...SENSORY_INTENSITY_TIERS.flatMap((tier) => intensityTiers[tier] || []),
    ]),
  });
}

export function validateSensoryProfileV1(
  value = {},
  { path = "semantic", published = false } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.SENSORY_PROFILE,
    `${path}.schemaVersion`,
    issues,
  );
  requireText(value.signature, `${path}.signature`, issues);
  validateStringMap(
    value.variants,
    SENSORY_CHANNELS,
    `${path}.variants`,
    issues,
  );
  validateStringMap(
    value.intensityTiers,
    SENSORY_INTENSITY_TIERS,
    `${path}.intensityTiers`,
    issues,
  );
  validateStringMap(
    value.roomRoleBias,
    SENSORY_ROOM_ROLES,
    `${path}.roomRoleBias`,
    issues,
  );
  validateStringMap(
    value.geometryBias,
    SENSORY_GEOMETRY_BIASES,
    `${path}.geometryBias`,
    issues,
  );
  requireArray(value.exclusions, `${path}.exclusions`, issues);

  if (
    requirePlainObject(
      value.repetitionPolicy,
      `${path}.repetitionPolicy`,
      issues,
    )
  ) {
    collectUnknownFields(
      value.repetitionPolicy,
      REPETITION_FIELDS,
      `${path}.repetitionPolicy`,
      issues,
    );
    if (!Number.isInteger(value.repetitionPolicy.senseCooldown)) {
      pushIssue(
        issues,
        "sensory-profile.invalid-cooldown",
        `${path}.repetitionPolicy.senseCooldown`,
        "senseCooldown must be an integer.",
      );
    }
  }

  const coverage = getSensoryProfileCoverage(value);
  coverage.duplicateTexts.forEach((text) => {
    pushIssue(
      issues,
      "sensory-profile.duplicate-text",
      path,
      `Duplicate sensory text: ${text}.`,
    );
  });

  if (published) {
    if (coverage.totalVariants < 12) {
      pushIssue(
        issues,
        "sensory-profile.variant-coverage",
        `${path}.variants`,
        "Published Sensory Profiles require at least 12 variants.",
      );
    }
    if (coverage.representedSenses.length < 3) {
      pushIssue(
        issues,
        "sensory-profile.sense-coverage",
        `${path}.variants`,
        "Published Sensory Profiles require at least three represented senses.",
      );
    }
    if (coverage.representedTiers.length < 2) {
      pushIssue(
        issues,
        "sensory-profile.tier-coverage",
        `${path}.intensityTiers`,
        "Published Sensory Profiles require at least two intensity tiers.",
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

export function parseSensoryProfileV1(value = {}, options = {}) {
  const normalized = normalizeSensoryProfileV1(value);
  return createParseResult(
    normalized,
    validateSensoryProfileV1(value, options),
  );
}
