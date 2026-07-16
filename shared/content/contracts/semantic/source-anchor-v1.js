import {
  cleanText,
  collectUnknownFields,
  createParseResult,
  deepFreeze,
  normalizeEnum,
  normalizeId,
  normalizeStringList,
  normalizeStringSet,
  pushIssue,
  requireArray,
  requireId,
  requirePlainObject,
  requireSchemaVersion,
  requireText,
} from "./contract-utils.js";
import { SEMANTIC_SCHEMA_VERSIONS } from "./schema-versions.js";

export const SOURCE_ANCHOR_KINDS = Object.freeze([
  "place",
  "practice",
  "object",
  "event",
  "text",
  "folklore",
  "other",
]);

export const SOURCE_RELIABILITY = Object.freeze([
  "primary",
  "secondary",
  "tertiary",
  "uncertain",
]);

export const SOURCE_ANCHOR_STATUSES = Object.freeze([
  "draft",
  "in-review",
  "published",
  "retired",
]);

const SOURCE_ANCHOR_FIELDS = Object.freeze([
  "schemaVersion",
  "id",
  "title",
  "kind",
  "status",
  "citation",
  "summary",
  "reliability",
  "editorialNotes",
  "tags",
]);
const CITATION_FIELDS = Object.freeze(["label", "url", "accessedVersion"]);

export function normalizeSourceAnchorV1(value = {}) {
  const citation = value.citation || {};
  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SOURCE_ANCHOR,
    id: normalizeId(value.id),
    title: cleanText(value.title),
    kind: normalizeEnum(value.kind, SOURCE_ANCHOR_KINDS, "other"),
    status: normalizeEnum(value.status, SOURCE_ANCHOR_STATUSES, "draft"),
    citation: {
      label: cleanText(citation.label),
      ...(cleanText(citation.url) ? { url: cleanText(citation.url) } : {}),
      ...(cleanText(citation.accessedVersion)
        ? { accessedVersion: cleanText(citation.accessedVersion) }
        : {}),
    },
    summary: cleanText(value.summary),
    reliability: normalizeEnum(
      value.reliability,
      SOURCE_RELIABILITY,
      "uncertain",
    ),
    editorialNotes: normalizeStringList(value.editorialNotes),
    tags: normalizeStringSet(value.tags, { ids: true }),
  });
}

export function validateSourceAnchorV1(
  value = {},
  { path = "sourceAnchor" } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;

  collectUnknownFields(value, SOURCE_ANCHOR_FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.SOURCE_ANCHOR,
    `${path}.schemaVersion`,
    issues,
  );
  requireId(value.id, `${path}.id`, issues);
  requireText(value.title, `${path}.title`, issues);
  if (!SOURCE_ANCHOR_KINDS.includes(value.kind)) {
    pushIssue(
      issues,
      "source-anchor.invalid-kind",
      `${path}.kind`,
      `Unknown Source Anchor kind: ${cleanText(value.kind)}.`,
    );
  }
  if (!SOURCE_ANCHOR_STATUSES.includes(value.status)) {
    pushIssue(
      issues,
      "source-anchor.invalid-status",
      `${path}.status`,
      `Unknown Source Anchor status: ${cleanText(value.status)}.`,
    );
  }
  if (requirePlainObject(value.citation, `${path}.citation`, issues)) {
    collectUnknownFields(
      value.citation,
      CITATION_FIELDS,
      `${path}.citation`,
      issues,
    );
    requireText(value.citation.label, `${path}.citation.label`, issues);
  }
  requireText(value.summary, `${path}.summary`, issues);
  if (!SOURCE_RELIABILITY.includes(value.reliability)) {
    pushIssue(
      issues,
      "source-anchor.invalid-reliability",
      `${path}.reliability`,
      `Unknown source reliability: ${cleanText(value.reliability)}.`,
    );
  }
  requireArray(value.editorialNotes, `${path}.editorialNotes`, issues);
  requireArray(value.tags, `${path}.tags`, issues);
  return issues;
}

export function parseSourceAnchorV1(value = {}, options = {}) {
  const normalized = normalizeSourceAnchorV1(value);
  return createParseResult(normalized, validateSourceAnchorV1(value, options));
}

function inferSourceAnchorKind(type = "") {
  const token = cleanText(type).toLowerCase();
  if (/architecture|place|site/.test(token)) return "place";
  if (/practice|ritual|punitive/.test(token)) return "practice";
  if (/object|material|weapon|creature|process|concept/.test(token))
    return "object";
  if (/event/.test(token)) return "event";
  if (/text|literary|film|cinematic/.test(token)) return "text";
  if (/folklore|tale/.test(token)) return "folklore";
  return "other";
}

export function normalizeLegacySourceAnchor(value = {}) {
  const title = cleanText(value.title || value.label || value.id);
  return normalizeSourceAnchorV1({
    id: value.id,
    title,
    kind: inferSourceAnchorKind(value.type),
    status: value.status === "published" ? "in-review" : "draft",
    citation: { label: title },
    summary: value.summary || `Editorial source summary required for ${title}.`,
    reliability: "uncertain",
    editorialNotes: [
      "Compatibility-normalized from a v1 Source Anchor; citation and framing require editorial review.",
    ],
    tags: [
      ...normalizeStringList(value.sourceTypes),
      ...normalizeStringList(value.themes),
      ...normalizeStringList(value.motifs),
      ...normalizeStringList(value.horror),
    ],
  });
}
