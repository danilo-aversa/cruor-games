import {
  cleanText,
  collectUnknownFields,
  countWords,
  createParseResult,
  deepFreeze,
  findDuplicates,
  isPlainObject,
  normalizeEnum,
  normalizeId,
  normalizeInteger,
  normalizeStringList,
  pushIssue,
  requireArray,
  requireId,
  requirePlainObject,
  requireSchemaVersion,
  requireText,
  slugifyLegacyId,
} from "./contract-utils.js";
import {
  normalizeSemanticProvenance,
  validateSemanticProvenance,
} from "./provenance-v1.js";
import { SEMANTIC_SCHEMA_VERSIONS } from "./schema-versions.js";

export const READ_ALOUD_FRAGMENT_GROUPS = Object.freeze([
  "spatialAnchors",
  "sensoryBeats",
  "visibleFeatures",
  "unsettlingDetails",
  "motionOrChange",
  "exitsAndDepth",
]);

const FIELDS = Object.freeze([
  "schemaVersion",
  "fragments",
  "constraints",
  "grammar",
  "provenance",
]);
const FRAGMENT_FIELDS = Object.freeze([
  "id",
  "text",
  "roomRoles",
  "geometry",
  "visibleFeatures",
  "intensity",
  "tags",
  "sourceComponentId",
  "provenance",
]);
const CONSTRAINT_FIELDS = Object.freeze([
  "forbiddenSpoilerTags",
  "maximumSentences",
  "wordRanges",
]);
const LENGTH_FIELDS = Object.freeze(["compact", "standard", "extended"]);
const GRAMMAR_FIELDS = Object.freeze([
  "openingOrder",
  "allowSecondPerson",
  "tense",
]);

function normalizeFragment(value, group, index, parentProvenance) {
  const source = isPlainObject(value) ? value : { text: value };
  const text = cleanText(source.text);
  return {
    id: normalizeId(
      source.id ||
        `${group}-${index + 1}-${slugifyLegacyId(text).slice(0, 40)}`,
    ),
    text,
    roomRoles: normalizeStringList(source.roomRoles, { ids: true }),
    geometry: normalizeStringList(source.geometry, { ids: true }),
    visibleFeatures: normalizeStringList(source.visibleFeatures, { ids: true }),
    intensity: cleanText(source.intensity),
    tags: normalizeStringList(source.tags, { ids: true }),
    sourceComponentId: normalizeId(source.sourceComponentId),
    provenance: normalizeSemanticProvenance(
      source.provenance || parentProvenance,
    ),
  };
}

function normalizeRange(value, fallback) {
  const source = Array.isArray(value) ? value : fallback;
  const minimum = normalizeInteger(source[0], fallback[0], {
    min: 1,
    max: 500,
  });
  const maximum = normalizeInteger(source[1], fallback[1], {
    min: minimum,
    max: 500,
  });
  return [minimum, maximum];
}

export function normalizeReadAloudProfileV1(value = {}) {
  const fragments = value.fragments || {};
  const constraints = value.constraints || {};
  const maximumSentences = constraints.maximumSentences || {};
  const wordRanges = constraints.wordRanges || {};
  const grammar = value.grammar || {};
  const provenance = normalizeSemanticProvenance(value.provenance);

  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.READ_ALOUD_PROFILE,
    fragments: Object.fromEntries(
      READ_ALOUD_FRAGMENT_GROUPS.map((group) => [
        group,
        (Array.isArray(fragments[group]) ? fragments[group] : []).map(
          (fragment, index) =>
            normalizeFragment(fragment, group, index, provenance),
        ),
      ]),
    ),
    constraints: {
      forbiddenSpoilerTags: normalizeStringList(
        constraints.forbiddenSpoilerTags,
        {
          ids: true,
        },
      ),
      maximumSentences: {
        compact: normalizeInteger(maximumSentences.compact, 2, {
          min: 1,
          max: 12,
        }),
        standard: normalizeInteger(maximumSentences.standard, 4, {
          min: 1,
          max: 12,
        }),
        extended: normalizeInteger(maximumSentences.extended, 6, {
          min: 1,
          max: 12,
        }),
      },
      wordRanges: {
        compact: normalizeRange(wordRanges.compact, [20, 35]),
        standard: normalizeRange(wordRanges.standard, [45, 75]),
        extended: normalizeRange(wordRanges.extended, [80, 120]),
      },
    },
    grammar: {
      openingOrder: normalizeStringList(grammar.openingOrder, { ids: true }),
      allowSecondPerson: grammar.allowSecondPerson === true,
      tense: normalizeEnum(grammar.tense, ["present", "past"], "present"),
    },
    provenance,
  });
}

function validateFragment(fragment, path, issues) {
  if (!requirePlainObject(fragment, path, issues)) return;
  collectUnknownFields(fragment, FRAGMENT_FIELDS, path, issues);
  requireId(fragment.id, `${path}.id`, issues);
  requireText(fragment.text, `${path}.text`, issues);
  ["roomRoles", "geometry", "visibleFeatures", "tags"].forEach((field) =>
    requireArray(fragment[field], `${path}.${field}`, issues),
  );
  issues.push(
    ...validateSemanticProvenance(fragment.provenance, {
      path: `${path}.provenance`,
    }),
  );
}

export function validateReadAloudProfileV1(
  value = {},
  { path = "semantic", published = false } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.READ_ALOUD_PROFILE,
    `${path}.schemaVersion`,
    issues,
  );

  const allFragments = [];
  if (requirePlainObject(value.fragments, `${path}.fragments`, issues)) {
    collectUnknownFields(
      value.fragments,
      READ_ALOUD_FRAGMENT_GROUPS,
      `${path}.fragments`,
      issues,
    );
    READ_ALOUD_FRAGMENT_GROUPS.forEach((group) => {
      if (
        requireArray(
          value.fragments[group],
          `${path}.fragments.${group}`,
          issues,
        )
      ) {
        value.fragments[group].forEach((fragment, index) => {
          validateFragment(
            fragment,
            `${path}.fragments.${group}[${index}]`,
            issues,
          );
          allFragments.push(fragment);
        });
      }
    });
  }

  findDuplicates(allFragments, (fragment) => fragment.id).forEach((id) => {
    pushIssue(
      issues,
      "read-aloud.duplicate-fragment-id",
      `${path}.fragments`,
      `Duplicate read-aloud fragment id: ${id}.`,
    );
  });
  findDuplicates(allFragments, (fragment) => fragment.text).forEach((text) => {
    pushIssue(
      issues,
      "read-aloud.duplicate-fragment-text",
      `${path}.fragments`,
      `Duplicate read-aloud fragment text: ${text}.`,
    );
  });

  if (requirePlainObject(value.constraints, `${path}.constraints`, issues)) {
    collectUnknownFields(
      value.constraints,
      CONSTRAINT_FIELDS,
      `${path}.constraints`,
      issues,
    );
    requireArray(
      value.constraints.forbiddenSpoilerTags,
      `${path}.constraints.forbiddenSpoilerTags`,
      issues,
    );
    for (const field of ["maximumSentences", "wordRanges"]) {
      if (
        requirePlainObject(
          value.constraints[field],
          `${path}.constraints.${field}`,
          issues,
        )
      ) {
        collectUnknownFields(
          value.constraints[field],
          LENGTH_FIELDS,
          `${path}.constraints.${field}`,
          issues,
        );
      }
    }
    LENGTH_FIELDS.forEach((length) => {
      const sentenceCount = value.constraints.maximumSentences?.[length];
      if (!Number.isInteger(sentenceCount) || sentenceCount < 1) {
        pushIssue(
          issues,
          "read-aloud.invalid-sentence-limit",
          `${path}.constraints.maximumSentences.${length}`,
          "Sentence limit must be a positive integer.",
        );
      }
      const range = value.constraints.wordRanges?.[length];
      if (
        !Array.isArray(range) ||
        range.length !== 2 ||
        !Number.isInteger(range[0]) ||
        !Number.isInteger(range[1]) ||
        range[0] > range[1]
      ) {
        pushIssue(
          issues,
          "read-aloud.invalid-word-range",
          `${path}.constraints.wordRanges.${length}`,
          "Word range must be [minimum, maximum] integers in ascending order.",
        );
      }
    });

    const forbidden = new Set(value.constraints.forbiddenSpoilerTags || []);
    allFragments.forEach((fragment, index) => {
      const leakedTags = (fragment.tags || []).filter((tag) =>
        forbidden.has(tag),
      );
      if (leakedTags.length) {
        pushIssue(
          issues,
          "read-aloud.forbidden-spoiler-tag",
          `${path}.fragments`,
          `Fragment ${fragment.id || index} carries forbidden spoiler tags: ${leakedTags.join(", ")}.`,
        );
      }
    });
  }

  if (requirePlainObject(value.grammar, `${path}.grammar`, issues)) {
    collectUnknownFields(
      value.grammar,
      GRAMMAR_FIELDS,
      `${path}.grammar`,
      issues,
    );
    requireArray(
      value.grammar.openingOrder,
      `${path}.grammar.openingOrder`,
      issues,
    );
    if (!["present", "past"].includes(value.grammar.tense)) {
      pushIssue(
        issues,
        "read-aloud.invalid-tense",
        `${path}.grammar.tense`,
        `Unsupported read-aloud tense: ${cleanText(value.grammar.tense)}.`,
      );
    }
  }

  if (published && !allFragments.length) {
    pushIssue(
      issues,
      "read-aloud.fragments-required",
      `${path}.fragments`,
      "Published Read-Aloud Profiles require authored fragments.",
    );
  }
  if (published) {
    const targets = {
      spatialAnchors: 3,
      sensoryBeats: 4,
      visibleFeatures: 4,
      unsettlingDetails: 4,
    };
    Object.entries(targets).forEach(([group, minimum]) => {
      if ((value.fragments?.[group]?.length || 0) < minimum) {
        pushIssue(
          issues,
          "read-aloud.coverage-target",
          `${path}.fragments.${group}`,
          `Published profile target is at least ${minimum} ${group} fragments.`,
          "warning",
        );
      }
    });
  }

  allFragments.forEach((fragment) => {
    if (countWords(fragment.text) > 120) {
      pushIssue(
        issues,
        "read-aloud.fragment-too-long",
        `${path}.fragments`,
        `Fragment ${fragment.id} exceeds 120 words.`,
        "warning",
      );
    }
  });

  issues.push(
    ...validateSemanticProvenance(value.provenance, {
      path: `${path}.provenance`,
    }),
  );
  return issues;
}

export function parseReadAloudProfileV1(value = {}, options = {}) {
  const normalized = normalizeReadAloudProfileV1(value);
  return createParseResult(
    normalized,
    validateReadAloudProfileV1(value, options),
  );
}
