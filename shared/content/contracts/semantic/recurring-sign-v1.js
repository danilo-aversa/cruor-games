import {
  cleanText,
  cloneJson,
  collectUnknownFields,
  createParseResult,
  deepFreeze,
  findDuplicates,
  normalizeId,
  normalizeInteger,
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

const FIELDS = Object.freeze([
  "schemaVersion",
  "id",
  "description",
  "placement",
  "variations",
  "interaction",
  "revelationLink",
  "provenance",
]);
const PLACEMENT_FIELDS = Object.freeze([
  "frequency",
  "minimumRooms",
  "maximumRooms",
  "allowedRoomRoles",
  "forbiddenRoomRoles",
  "preferredFeatures",
]);
const INTERACTION_FIELDS = Object.freeze(["trigger", "effect", "counterplay"]);

export function normalizeRecurringSignV1(value = {}) {
  const placement = value.placement || {};
  const interaction = value.interaction;
  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.RECURRING_SIGN,
    id: normalizeId(value.id),
    description: cleanText(value.description),
    placement: {
      frequency: cleanText(placement.frequency) || "recurring",
      minimumRooms: normalizeInteger(placement.minimumRooms, 1, {
        min: 0,
        max: 99,
      }),
      maximumRooms: normalizeInteger(placement.maximumRooms, 1, {
        min: 0,
        max: 99,
      }),
      allowedRoomRoles: normalizeStringList(placement.allowedRoomRoles, {
        ids: true,
      }),
      forbiddenRoomRoles: normalizeStringList(placement.forbiddenRoomRoles, {
        ids: true,
      }),
      preferredFeatures: normalizeStringList(placement.preferredFeatures, {
        ids: true,
      }),
    },
    variations: normalizeStringList(value.variations),
    interaction:
      interaction && typeof interaction === "object"
        ? {
            trigger: cleanText(interaction.trigger),
            effect: cleanText(interaction.effect),
            counterplay: cleanText(interaction.counterplay),
          }
        : null,
    revelationLink: normalizeId(value.revelationLink),
    provenance: normalizeSemanticProvenance(value.provenance),
  });
}

export function validateRecurringSignV1(
  value = {},
  { path = "semantic", published = false } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.RECURRING_SIGN,
    `${path}.schemaVersion`,
    issues,
  );
  requireId(value.id, `${path}.id`, issues);
  requireText(value.description, `${path}.description`, issues);

  if (requirePlainObject(value.placement, `${path}.placement`, issues)) {
    collectUnknownFields(
      value.placement,
      PLACEMENT_FIELDS,
      `${path}.placement`,
      issues,
    );
    ["minimumRooms", "maximumRooms"].forEach((field) => {
      if (
        !Number.isInteger(value.placement[field]) ||
        value.placement[field] < 0
      ) {
        pushIssue(
          issues,
          "recurring-sign.invalid-room-count",
          `${path}.placement.${field}`,
          `${field} must be a non-negative integer.`,
        );
      }
    });
    if (value.placement.maximumRooms < value.placement.minimumRooms) {
      pushIssue(
        issues,
        "recurring-sign.invalid-room-range",
        `${path}.placement.maximumRooms`,
        "maximumRooms cannot be lower than minimumRooms.",
      );
    }
    ["allowedRoomRoles", "forbiddenRoomRoles", "preferredFeatures"].forEach(
      (field) =>
        requireArray(
          value.placement[field],
          `${path}.placement.${field}`,
          issues,
        ),
    );
  }

  if (requireArray(value.variations, `${path}.variations`, issues)) {
    findDuplicates(value.variations).forEach((duplicate) => {
      pushIssue(
        issues,
        "recurring-sign.duplicate-variation",
        `${path}.variations`,
        `Duplicate recurring-sign variation: ${duplicate}.`,
      );
    });
    if (published && value.variations.length < 3) {
      pushIssue(
        issues,
        "recurring-sign.variation-coverage",
        `${path}.variations`,
        "Published Recurring Signs require at least three variations.",
      );
    }
  }

  if (value.interaction !== null) {
    const interactionPath = `${path}.interaction`;
    if (requirePlainObject(value.interaction, interactionPath, issues)) {
      collectUnknownFields(
        value.interaction,
        INTERACTION_FIELDS,
        interactionPath,
        issues,
      );
      requireText(
        value.interaction.trigger,
        `${interactionPath}.trigger`,
        issues,
      );
      requireText(
        value.interaction.effect,
        `${interactionPath}.effect`,
        issues,
      );
      requireText(
        value.interaction.counterplay,
        `${interactionPath}.counterplay`,
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

export function parseRecurringSignV1(value = {}, options = {}) {
  const normalized = normalizeRecurringSignV1(value);
  return createParseResult(normalized, validateRecurringSignV1(value, options));
}

export function cloneRecurringSignV1(value = {}) {
  return cloneJson(normalizeRecurringSignV1(value));
}
