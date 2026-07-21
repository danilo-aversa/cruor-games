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
  "thesis",
  "whatItIs",
  "cruorLensThesis",
  "cruorLens",
  "facts",
  "horrorStructures",
  "triggerWarnings",
  "tableSafety",
  "lowIntensityAlternative",
  "sources",
  "furtherReading",
  "relatedDossiers",
  "whyItDisturbs",
  "creativeUses",
  "cautions",
]);
const MEDIA_FIELDS = Object.freeze([
  "imageTitle",
  "imageKey",
  "imageProvider",
  "imageAlt",
  "imageCredit",
  "icon",
]);
const FACT_FIELDS = Object.freeze(["label", "value"]);
const HORROR_STRUCTURE_FIELDS = Object.freeze([
  "id",
  "title",
  "description",
  "feeds",
  "keywords",
  "componentIds",
]);
const RESEARCH_ENTRY_FIELDS = Object.freeze([
  "title",
  "url",
  "description",
  "meta",
]);
const RELATED_DOSSIER_FIELDS = Object.freeze([
  "sourceAnchorId",
  "title",
  "relationship",
  "description",
]);

function isPlainObject(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null),
  );
}

function normalizeObjectList(value, normalizeEntry) {
  if (!Array.isArray(value)) return [];
  return value.filter(isPlainObject).map(normalizeEntry).filter(Boolean);
}

function normalizeFacts(value) {
  return normalizeObjectList(value, (entry) => {
    const label = cleanText(entry.label);
    const factValue = cleanText(entry.value);
    return label || factValue ? { label, value: factValue } : null;
  });
}

function normalizeHorrorStructures(value) {
  return normalizeObjectList(value, (entry, index) => {
    const title = cleanText(entry.title);
    const description = cleanText(entry.description);
    if (!title && !description) return null;
    return {
      id: normalizeId(entry.id || title || `structure-${index + 1}`),
      title,
      description,
      feeds: cleanText(entry.feeds),
      keywords: normalizeStringSet(entry.keywords),
      componentIds: normalizeStringSet(entry.componentIds, { ids: true }),
    };
  });
}

function normalizeResearchEntries(value) {
  return normalizeObjectList(value, (entry) => {
    const title = cleanText(entry.title);
    const url = cleanText(entry.url);
    const description = cleanText(entry.description);
    const meta = cleanText(entry.meta);
    return title || url || description
      ? { title, url, description, meta }
      : null;
  });
}

function normalizeRelatedDossiers(value) {
  return normalizeObjectList(value, (entry) => {
    const sourceAnchorId = normalizeId(entry.sourceAnchorId);
    const title = cleanText(entry.title);
    const relationship = cleanText(entry.relationship);
    const description = cleanText(entry.description);
    return sourceAnchorId || title || description
      ? { sourceAnchorId, title, relationship, description }
      : null;
  });
}

function validateObjectList(
  value,
  { path, fields, requiredTextFields = [], requireUrl = false, issues },
) {
  if (value === undefined) return;
  if (!requireArray(value, path, issues)) return;

  value.forEach((entry, index) => {
    const entryPath = `${path}[${index}]`;
    if (!requirePlainObject(entry, entryPath, issues)) return;
    collectUnknownFields(entry, fields, entryPath, issues);
    requiredTextFields.forEach((field) =>
      requireText(entry[field], `${entryPath}.${field}`, issues),
    );

    if (
      requireUrl &&
      cleanText(entry.url) &&
      !/^https?:\/\//i.test(cleanText(entry.url))
    ) {
      pushIssue(
        issues,
        "inspiration.invalid-research-url",
        `${entryPath}.url`,
        "Research links must use an absolute http or https URL.",
      );
    }
  });
}

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
      thesis: cleanText(editorial.thesis),
      whatItIs: cleanText(editorial.whatItIs),
      cruorLensThesis: cleanText(editorial.cruorLensThesis),
      cruorLens: cleanText(editorial.cruorLens),
      facts: normalizeFacts(editorial.facts),
      horrorStructures: normalizeHorrorStructures(editorial.horrorStructures),
      triggerWarnings: normalizeStringList(editorial.triggerWarnings),
      tableSafety: normalizeStringList(editorial.tableSafety),
      lowIntensityAlternative: cleanText(editorial.lowIntensityAlternative),
      sources: normalizeResearchEntries(editorial.sources),
      furtherReading: normalizeResearchEntries(editorial.furtherReading),
      relatedDossiers: normalizeRelatedDossiers(editorial.relatedDossiers),
      whyItDisturbs: cleanText(editorial.whyItDisturbs),
      creativeUses: normalizeStringList(editorial.creativeUses),
      cautions: normalizeStringList(editorial.cautions),
    },
    media: {
      imageTitle: cleanText(media.imageTitle),
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
    ["creativeUses", "cautions"].forEach((field) =>
      requireArray(
        value.editorial[field],
        `${path}.editorial.${field}`,
        issues,
      ),
    );
    ["triggerWarnings", "tableSafety"].forEach((field) => {
      if (value.editorial[field] !== undefined) {
        requireArray(
          value.editorial[field],
          `${path}.editorial.${field}`,
          issues,
        );
      }
    });

    validateObjectList(value.editorial.facts, {
      path: `${path}.editorial.facts`,
      fields: FACT_FIELDS,
      requiredTextFields: ["label", "value"],
      issues,
    });
    validateObjectList(value.editorial.horrorStructures, {
      path: `${path}.editorial.horrorStructures`,
      fields: HORROR_STRUCTURE_FIELDS,
      requiredTextFields: ["title", "description"],
      issues,
    });
    value.editorial.horrorStructures?.forEach((structure, index) => {
      if (structure.keywords !== undefined) {
        requireArray(
          structure.keywords,
          `${path}.editorial.horrorStructures[${index}].keywords`,
          issues,
        );
      }
      if (structure.componentIds !== undefined) {
        requireArray(
          structure.componentIds,
          `${path}.editorial.horrorStructures[${index}].componentIds`,
          issues,
        );
      }
    });
    validateObjectList(value.editorial.sources, {
      path: `${path}.editorial.sources`,
      fields: RESEARCH_ENTRY_FIELDS,
      requiredTextFields: ["title"],
      requireUrl: true,
      issues,
    });
    validateObjectList(value.editorial.furtherReading, {
      path: `${path}.editorial.furtherReading`,
      fields: RESEARCH_ENTRY_FIELDS,
      requiredTextFields: ["title"],
      requireUrl: true,
      issues,
    });
    validateObjectList(value.editorial.relatedDossiers, {
      path: `${path}.editorial.relatedDossiers`,
      fields: RELATED_DOSSIER_FIELDS,
      requiredTextFields: ["title", "relationship"],
      issues,
    });

    if (value.status === "approved") {
      requireText(
        value.editorial.whatItIs,
        `${path}.editorial.whatItIs`,
        issues,
      );
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
      thesis: "",
      whatItIs,
      cruorLensThesis: "",
      cruorLens: cleanText(
        value.inspiration?.logic || value.narrative || sourceAnchor.summary,
      ),
      facts: [],
      horrorStructures: [],
      triggerWarnings: normalizeStringList(value.editorial?.cautions),
      tableSafety: [],
      lowIntensityAlternative: "",
      sources: [],
      furtherReading: [],
      relatedDossiers: [],
      whyItDisturbs: "",
      creativeUses: [],
      cautions: [],
    },
    media: {
      imageTitle: cleanText(value.media?.imageTitle) || title,
      imageKey,
      imageProvider: cleanText(value.media?.imageProvider),
      imageAlt:
        cleanText(value.media?.imageNote) ||
        (imageKey ? `${title} reference image.` : ""),
      imageCredit: cleanText(value.media?.imageCredit),
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
