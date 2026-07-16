import {
  cleanText,
  cloneJson,
  collectUnknownFields,
  createParseResult,
  deepFreeze,
  isPlainObject,
  normalizeEnum,
  normalizeId,
  normalizeStringSet,
  pushIssue,
  requireArray,
  requireId,
  requirePlainObject,
  requireSchemaVersion,
  requireText,
  slugifyLegacyId,
} from "./contract-utils.js";
import {
  normalizeGlobalRuleV1,
  validateGlobalRuleV1,
} from "./global-rule-v1.js";
import {
  normalizePlaceIdentityV1,
  validatePlaceIdentityV1,
} from "./place-identity-v1.js";
import {
  createCompatibilityProvenance,
  normalizeSemanticProvenance,
  validateSemanticProvenance,
} from "./provenance-v1.js";
import {
  normalizeReadAloudProfileV1,
  validateReadAloudProfileV1,
} from "./read-aloud-profile-v1.js";
import {
  normalizeRecurringSignV1,
  validateRecurringSignV1,
} from "./recurring-sign-v1.js";
import {
  COMPONENT_SEMANTIC_TYPES,
  COMPONENT_STATUSES,
  SEMANTIC_SCHEMA_VERSIONS,
} from "./schema-versions.js";
import {
  normalizeSensoryProfileV1,
  validateSensoryProfileV1,
} from "./sensory-profile-v1.js";
import {
  normalizeSessionGuideV1,
  validateSessionGuideV1,
} from "./session-guide-v1.js";
import {
  normalizeSiteAtmosphereV1,
  validateSiteAtmosphereV1,
} from "./site-atmosphere-v1.js";

const COMPONENT_FIELDS = Object.freeze([
  "schemaVersion",
  "id",
  "title",
  "status",
  "contentType",
  "semanticType",
  "workflows",
  "slots",
  "sourceAnchors",
  "sourceTypes",
  "themes",
  "motifs",
  "horror",
  "contexts",
  "compatibility",
  "generation",
  "semantic",
  "provenance",
]);

const GENERIC_SEMANTIC_FIELDS = Object.freeze([
  "summary",
  "tableText",
  "mechanics",
  "narrative",
  "details",
]);

const SPECIALIZED_NORMALIZERS = Object.freeze({
  "place-identity": normalizePlaceIdentityV1,
  "site-atmosphere": normalizeSiteAtmosphereV1,
  "global-rule": normalizeGlobalRuleV1,
  "recurring-sign": normalizeRecurringSignV1,
  "sensory-profile": normalizeSensoryProfileV1,
  "read-aloud-profile": normalizeReadAloudProfileV1,
  "session-guide": normalizeSessionGuideV1,
});

const SPECIALIZED_VALIDATORS = Object.freeze({
  "place-identity": validatePlaceIdentityV1,
  "site-atmosphere": validateSiteAtmosphereV1,
  "global-rule": validateGlobalRuleV1,
  "recurring-sign": validateRecurringSignV1,
  "sensory-profile": validateSensoryProfileV1,
  "read-aloud-profile": validateReadAloudProfileV1,
  "session-guide": validateSessionGuideV1,
});

const LEGACY_SLOT_TO_SEMANTIC_TYPE = Object.freeze({
  horrorPremise: "location-stake",
  sensoryLayer: "site-atmosphere",
  visibleAnomaly: "visible-feature",
  hazard: "hazard",
  clue: "clue",
  encounterTwist: "encounter-twist",
  secret: "secret",
  reward: "reward",
  roomDesign: "room-design",
  locationRegion: "location-region",
});

function normalizeGenericSemantic(value = {}) {
  return {
    summary: cleanText(value.summary),
    tableText: cleanText(value.tableText),
    mechanics: cloneJson(value.mechanics, {}),
    narrative: cleanText(value.narrative),
    details: cloneJson(value.details, {}),
  };
}

function normalizeSemanticPayload(semanticType, value = {}) {
  const normalizer = SPECIALIZED_NORMALIZERS[semanticType];
  return normalizer ? normalizer(value) : normalizeGenericSemantic(value);
}

export function normalizeComponentV2(value = {}) {
  const semanticType = cleanText(value.semanticType).toLowerCase();
  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
    id: normalizeId(value.id),
    title: cleanText(value.title),
    status: normalizeEnum(value.status, COMPONENT_STATUSES, "draft"),
    contentType: cleanText(value.contentType),
    semanticType,
    workflows: normalizeStringSet(value.workflows, { ids: true }),
    slots: normalizeStringSet(value.slots, { ids: true }),
    sourceAnchors: normalizeStringSet(value.sourceAnchors, { ids: true }),
    sourceTypes: normalizeStringSet(value.sourceTypes),
    themes: normalizeStringSet(value.themes),
    motifs: normalizeStringSet(value.motifs),
    horror: normalizeStringSet(value.horror),
    contexts: normalizeStringSet(value.contexts),
    compatibility: cloneJson(value.compatibility, {}),
    generation: cloneJson(value.generation, {}),
    semantic: normalizeSemanticPayload(semanticType, value.semantic),
    provenance: normalizeSemanticProvenance(value.provenance),
  });
}

function validateGenericSemantic(value, path, issues, published) {
  if (!requirePlainObject(value, path, issues)) return;
  collectUnknownFields(value, GENERIC_SEMANTIC_FIELDS, path, issues);
  if (!isPlainObject(value.mechanics)) {
    pushIssue(
      issues,
      "component.mechanics-object-required",
      `${path}.mechanics`,
      "Generic semantic mechanics must be an object.",
    );
  }
  if (!isPlainObject(value.details)) {
    pushIssue(
      issues,
      "component.details-object-required",
      `${path}.details`,
      "Generic semantic details must be an object.",
    );
  }
  if (published && !cleanText(value.summary) && !cleanText(value.tableText)) {
    pushIssue(
      issues,
      "component.semantic-text-required",
      path,
      "Published generic components require summary or tableText.",
    );
  }
}

export function validateComponentV2(value = {}, { path = "component" } = {}) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, COMPONENT_FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
    `${path}.schemaVersion`,
    issues,
  );
  requireId(value.id, `${path}.id`, issues);
  requireText(value.title, `${path}.title`, issues);
  if (!COMPONENT_STATUSES.includes(value.status)) {
    pushIssue(
      issues,
      "component.invalid-status",
      `${path}.status`,
      `Unknown component status: ${cleanText(value.status)}.`,
    );
  }
  requireText(value.contentType, `${path}.contentType`, issues);
  if (!COMPONENT_SEMANTIC_TYPES.includes(value.semanticType)) {
    pushIssue(
      issues,
      "component.unknown-semantic-type",
      `${path}.semanticType`,
      `Unknown semantic type: ${cleanText(value.semanticType)}.`,
    );
  }
  [
    "workflows",
    "slots",
    "sourceAnchors",
    "sourceTypes",
    "themes",
    "motifs",
    "horror",
    "contexts",
  ].forEach((field) => requireArray(value[field], `${path}.${field}`, issues));
  if (!value.sourceAnchors?.length) {
    pushIssue(
      issues,
      "component.source-required",
      `${path}.sourceAnchors`,
      "At least one Source Anchor is required.",
    );
  }
  requirePlainObject(value.compatibility, `${path}.compatibility`, issues);
  requirePlainObject(value.generation, `${path}.generation`, issues);

  const validator = SPECIALIZED_VALIDATORS[value.semanticType];
  if (validator) {
    issues.push(
      ...validator(value.semantic, {
        path: `${path}.semantic`,
        published: value.status === "published",
      }),
    );
  } else {
    validateGenericSemantic(
      value.semantic,
      `${path}.semantic`,
      issues,
      value.status === "published",
    );
  }

  issues.push(
    ...validateSemanticProvenance(value.provenance, {
      path: `${path}.provenance`,
    }),
  );
  return issues;
}

export function parseComponentV2(value = {}, options = {}) {
  const normalized = normalizeComponentV2(value);
  return createParseResult(normalized, validateComponentV2(value, options));
}

function inferLegacySemanticType(component = {}) {
  if (component.contentType === "monster-graft") return "monster-graft";
  if (component.contentType === "location-region") return "location-region";
  const slot = (
    Array.isArray(component.slots) ? component.slots : [component.slotId]
  ).find((entry) => LEGACY_SLOT_TO_SEMANTIC_TYPE[entry]);
  return LEGACY_SLOT_TO_SEMANTIC_TYPE[slot] || "interaction";
}

function createLegacySemantic(component, semanticType, provenance) {
  const text = cleanText(
    component.tableText ||
      component.summary ||
      component.description ||
      component.narrative ||
      component.title,
  );
  if (semanticType === "site-atmosphere") {
    return {
      signature: text,
      manifestations: [
        {
          id: `${slugifyLegacyId(component.id || component.title)}-manifestation`,
          text,
          senses: component.sensoryKind ? [component.sensoryKind] : [],
          intensity: "low",
          frequency: "recurring",
        },
      ],
      exclusions: [],
      escalationLinks: [],
      provenance,
    };
  }
  return {
    summary: cleanText(
      component.summary || component.description || component.title,
    ),
    tableText: cleanText(component.tableText || text),
    mechanics: isPlainObject(component.mechanics)
      ? component.mechanics
      : cleanText(component.mechanics)
        ? { text: cleanText(component.mechanics) }
        : {},
    narrative: cleanText(component.narrative),
    details: {
      legacySchemaVersion: cleanText(
        component.location?.schemaVersion ||
          component.locationRegion?.schemaVersion ||
          component.map?.schemaVersion,
      ),
    },
  };
}

export function normalizeLegacyComponentV2(
  component = {},
  moduleSourceAnchorIds = [],
) {
  const sourceAnchors = normalizeStringSet(
    component.sourceAnchors?.length
      ? component.sourceAnchors
      : moduleSourceAnchorIds,
    { ids: true },
  );
  const provenance = createCompatibilityProvenance({
    sourceAnchorIds: sourceAnchors,
    legacyIds: [component.legacyId, component.id].filter(Boolean),
    fromSchema:
      component.location?.schemaVersion ||
      component.locationRegion?.schemaVersion ||
      component.map?.schemaVersion ||
      "legacy-component-v1",
  });
  const semanticType = inferLegacySemanticType(component);
  const location =
    component.location || component.locationRegion || component.map || {};

  return normalizeComponentV2({
    id: slugifyLegacyId(component.id || component.legacyId || component.title),
    title: cleanText(component.title || component.label || component.id),
    status: "draft",
    contentType: cleanText(
      component.contentType || component.type || "semantic-component",
    ),
    semanticType,
    workflows: component.workflows,
    slots: component.slots || component.slotId,
    sourceAnchors,
    sourceTypes: component.sourceTypes,
    themes: component.themes,
    motifs: component.motifs,
    horror: component.horror,
    contexts: component.contexts,
    compatibility:
      component.roomCompatibility ||
      location.roomCompatibility ||
      component.compatibility ||
      {},
    generation: {
      ...(isPlainObject(component.mapInfluence)
        ? { mapInfluence: component.mapInfluence }
        : {}),
      ...(isPlainObject(location.mapInfluence)
        ? { mapInfluence: location.mapInfluence }
        : {}),
      ...(isPlainObject(component.roomDesign)
        ? { roomDesign: component.roomDesign }
        : {}),
      ...(isPlainObject(location.roomDesign)
        ? { roomDesign: location.roomDesign }
        : {}),
      ...(isPlainObject(component.effect) ? { effect: component.effect } : {}),
      ...(isPlainObject(location.effect) ? { effect: location.effect } : {}),
    },
    semantic: createLegacySemantic(component, semanticType, provenance),
    provenance,
  });
}
