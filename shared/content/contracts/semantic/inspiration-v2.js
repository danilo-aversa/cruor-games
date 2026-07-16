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
  slugifyLegacyId,
} from "./contract-utils.js";
import {
  createCompatibilityProvenance,
  normalizeSemanticProvenance,
  validateSemanticProvenance,
} from "./provenance-v1.js";
import {
  INSPIRATION_STATUSES,
  SEMANTIC_SCHEMA_VERSIONS,
} from "./schema-versions.js";

const INSPIRATION_FIELDS = Object.freeze([
  "schemaVersion",
  "id",
  "slug",
  "title",
  "status",
  "sourceAnchors",
  "sourceTypes",
  "themes",
  "motifs",
  "horror",
  "contexts",
  "editorial",
  "media",
  "tags",
  "provenance",
]);
const EDITORIAL_FIELDS = Object.freeze([
  "deck",
  "whatItIs",
  "whyItDisturbs",
  "creativeUses",
  "cautions",
]);
const MEDIA_FIELDS = Object.freeze([
  "imageKey",
  "imageProvider",
  "imageAlt",
  "imageCredit",
  "icon",
]);

export function normalizeInspirationV2(value = {}) {
  const editorial = value.editorial || {};
  const media = value.media || {};
  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
    id: normalizeId(value.id),
    slug: normalizeId(value.slug),
    title: cleanText(value.title),
    status: normalizeEnum(value.status, INSPIRATION_STATUSES, "draft"),
    sourceAnchors: normalizeStringSet(value.sourceAnchors, { ids: true }),
    sourceTypes: normalizeStringSet(value.sourceTypes),
    themes: normalizeStringSet(value.themes),
    motifs: normalizeStringSet(value.motifs),
    horror: normalizeStringSet(value.horror),
    contexts: normalizeStringSet(value.contexts),
    editorial: {
      deck: cleanText(editorial.deck),
      whatItIs: cleanText(editorial.whatItIs),
      whyItDisturbs: cleanText(editorial.whyItDisturbs),
      creativeUses: normalizeStringList(editorial.creativeUses),
      cautions: normalizeStringList(editorial.cautions),
    },
    media: {
      imageKey: cleanText(media.imageKey),
      imageProvider: cleanText(media.imageProvider),
      imageAlt: cleanText(media.imageAlt),
      imageCredit: cleanText(media.imageCredit),
      icon: cleanText(media.icon),
    },
    tags: normalizeStringSet(value.tags, { ids: true }),
    provenance: normalizeSemanticProvenance(value.provenance),
  });
}

export function validateInspirationV2(
  value = {},
  { path = "inspiration" } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;

  collectUnknownFields(value, INSPIRATION_FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
    `${path}.schemaVersion`,
    issues,
  );
  requireId(value.id, `${path}.id`, issues);
  requireId(value.slug, `${path}.slug`, issues);
  requireText(value.title, `${path}.title`, issues);
  if (!INSPIRATION_STATUSES.includes(value.status)) {
    pushIssue(
      issues,
      "inspiration.invalid-status",
      `${path}.status`,
      `Unknown Inspiration status: ${cleanText(value.status)}.`,
    );
  }

  [
    "sourceAnchors",
    "sourceTypes",
    "themes",
    "motifs",
    "horror",
    "contexts",
    "tags",
  ].forEach((field) => requireArray(value[field], `${path}.${field}`, issues));

  if (!value.sourceAnchors?.length) {
    pushIssue(
      issues,
      "inspiration.source-required",
      `${path}.sourceAnchors`,
      "At least one Source Anchor is required.",
    );
  }

  if (requirePlainObject(value.editorial, `${path}.editorial`, issues)) {
    collectUnknownFields(
      value.editorial,
      EDITORIAL_FIELDS,
      `${path}.editorial`,
      issues,
    );
    requireText(value.editorial.deck, `${path}.editorial.deck`, issues);
    requireArray(
      value.editorial.creativeUses,
      `${path}.editorial.creativeUses`,
      issues,
    );
    requireArray(
      value.editorial.cautions,
      `${path}.editorial.cautions`,
      issues,
    );
    if (value.status === "approved") {
      requireText(
        value.editorial.whatItIs,
        `${path}.editorial.whatItIs`,
        issues,
      );
      requireText(
        value.editorial.whyItDisturbs,
        `${path}.editorial.whyItDisturbs`,
        issues,
      );
      if (!value.editorial.creativeUses?.length) {
        pushIssue(
          issues,
          "inspiration.creative-use-required",
          `${path}.editorial.creativeUses`,
          "Approved Inspirations require at least one creative use.",
        );
      }
    }
  }

  if (requirePlainObject(value.media, `${path}.media`, issues)) {
    collectUnknownFields(value.media, MEDIA_FIELDS, `${path}.media`, issues);
    if (cleanText(value.media.imageKey) && !cleanText(value.media.imageAlt)) {
      pushIssue(
        issues,
        "inspiration.image-alt-required",
        `${path}.media.imageAlt`,
        "An imageAlt is required when imageKey is present.",
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

export function parseInspirationV2(value = {}, options = {}) {
  const normalized = normalizeInspirationV2(value);
  return createParseResult(normalized, validateInspirationV2(value, options));
}

export function normalizeLegacyInspiration(value = {}, sourceAnchor = {}) {
  const sourceAnchors = normalizeStringSet(
    value.sourceAnchors?.length ? value.sourceAnchors : [sourceAnchor.id],
    { ids: true },
  );
  const title = cleanText(
    value.title || value.label || sourceAnchor.title || value.id,
  );
  const imageKey = cleanText(value.media?.imageKey);
  const legacyIds = [value.legacyId, value.id, value.slug].filter(Boolean);
  const abstract = cleanText(value.caption || value.summary);
  const whatItIs = cleanText(
    value.narrative || value.inspiration?.logic || sourceAnchor.summary,
  );

  return normalizeInspirationV2({
    id: slugifyLegacyId(value.id || `inspiration-${sourceAnchor.id || title}`),
    slug: slugifyLegacyId(value.slug || sourceAnchor.id || title),
    title,
    status: value.status === "published" ? "in-review" : "draft",
    sourceAnchors,
    sourceTypes: value.sourceTypes,
    themes: value.themes,
    motifs: value.motifs,
    horror: value.horror,
    contexts: value.contexts,
    editorial: {
      deck: abstract || whatItIs || `Editorial deck required for ${title}.`,
      whatItIs,
      whyItDisturbs: "",
      creativeUses: [],
      cautions: [],
    },
    media: {
      imageKey,
      imageProvider: cleanText(value.media?.imageProvider),
      imageAlt:
        cleanText(value.media?.imageNote) ||
        (imageKey ? `${title} reference image.` : ""),
      imageCredit: "",
      icon: cleanText(value.media?.icon),
    },
    tags: value.tags,
    provenance: createCompatibilityProvenance({
      sourceAnchorIds: sourceAnchors,
      legacyIds,
      fromSchema: "legacy-inspiration-v1",
    }),
  });
}
