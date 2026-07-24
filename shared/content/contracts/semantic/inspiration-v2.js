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
import {
  isKnownTriggerWarning,
  normalizeTriggerWarnings,
} from "../../trigger-warnings.js";

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
  "card",
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
const CARD_FIELDS = Object.freeze([
  "domain",
  "obscurity",
  "collectionId",
  "collectionLabel",
  "number",
  "description",
]);
const INSPIRATION_CARD_DOMAINS = Object.freeze([
  "tale",
  "place",
  "body",
  "relic",
  "violence",
  "rite",
]);
const INSPIRATION_CARD_OBSCURITY = Object.freeze([
  "familiar",
  "uncommon",
  "esoteric",
]);
export const INSPIRATION_IMAGE_RIGHTS_STATUSES = Object.freeze([
  "unverified",
  "public-domain",
  "creative-commons",
  "licensed",
  "permission",
  "owned",
]);
const MEDIA_FIELDS = Object.freeze([
  "imageTitle",
  "imageKey",
  "imageProvider",
  "imageAlt",
  "imageCredit",
  "imageCreator",
  "imageSourceTitle",
  "imageSourceUrl",
  "imageLicense",
  "imageLicenseUrl",
  "imageRightsStatus",
  "imageRightsVerifiedAt",
  "imageModifications",
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

function normalizePositiveInteger(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null;
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
  const card = value.card || {};
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
    card: {
      domain: normalizeId(card.domain),
      obscurity: normalizeId(card.obscurity),
      collectionId: slugifyLegacyId(card.collectionId),
      collectionLabel: cleanText(card.collectionLabel),
      number: normalizePositiveInteger(card.number),
      description: cleanText(card.description),
    },
    editorial: {
      deck: cleanText(editorial.deck),
      thesis: cleanText(editorial.thesis),
      whatItIs: cleanText(editorial.whatItIs),
      cruorLensThesis: cleanText(editorial.cruorLensThesis),
      cruorLens: cleanText(editorial.cruorLens),
      facts: normalizeFacts(editorial.facts),
      horrorStructures: normalizeHorrorStructures(editorial.horrorStructures),
      triggerWarnings: normalizeTriggerWarnings(editorial.triggerWarnings),
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
      imageCreator: cleanText(media.imageCreator),
      imageSourceTitle: cleanText(media.imageSourceTitle),
      imageSourceUrl: cleanText(media.imageSourceUrl),
      imageLicense: cleanText(media.imageLicense),
      imageLicenseUrl: cleanText(media.imageLicenseUrl),
      imageRightsStatus: normalizeEnum(
        media.imageRightsStatus,
        INSPIRATION_IMAGE_RIGHTS_STATUSES,
        "unverified",
      ),
      imageRightsVerifiedAt: cleanText(media.imageRightsVerifiedAt),
      imageModifications: cleanText(media.imageModifications),
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

  if (
    value.card !== undefined &&
    requirePlainObject(value.card, `${path}.card`, issues)
  ) {
    collectUnknownFields(value.card, CARD_FIELDS, `${path}.card`, issues);
    if (cleanText(value.card.collectionId)) {
      requireId(
        value.card.collectionId,
        `${path}.card.collectionId`,
        issues,
      );
    }
    if (
      cleanText(value.card.domain) &&
      !INSPIRATION_CARD_DOMAINS.includes(normalizeId(value.card.domain))
    ) {
      pushIssue(
        issues,
        "inspiration.invalid-card-domain",
        `${path}.card.domain`,
        `Unknown Inspiration card domain: ${cleanText(value.card.domain)}.`,
      );
    }
    if (
      cleanText(value.card.obscurity) &&
      !INSPIRATION_CARD_OBSCURITY.includes(normalizeId(value.card.obscurity))
    ) {
      pushIssue(
        issues,
        "inspiration.invalid-card-obscurity",
        `${path}.card.obscurity`,
        `Unknown Inspiration card obscurity: ${cleanText(value.card.obscurity)}.`,
      );
    }
    if (
      value.card.number !== undefined &&
      value.card.number !== null &&
      (!Number.isInteger(Number(value.card.number)) ||
        Number(value.card.number) <= 0)
    ) {
      pushIssue(
        issues,
        "inspiration.invalid-card-number",
        `${path}.card.number`,
        "Inspiration card number must be a positive integer.",
      );
    }
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
    if (Array.isArray(value.editorial.triggerWarnings)) {
      value.editorial.triggerWarnings.forEach((warning, index) => {
        if (isKnownTriggerWarning(warning)) return;
        pushIssue(
          issues,
          "inspiration.unknown-trigger-warning",
          `${path}.editorial.triggerWarnings[${index}]`,
          `Unknown Trigger Warning: ${cleanText(warning)}. Choose a value from the shared library.`,
          value.status === "approved" ? "error" : "warning",
        );
      });
    }

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
    ["imageSourceUrl", "imageLicenseUrl"].forEach((field) => {
      if (
        cleanText(value.media[field]) &&
        !/^https?:\/\//i.test(cleanText(value.media[field]))
      ) {
        pushIssue(
          issues,
          "inspiration.invalid-image-url",
          `${path}.media.${field}`,
          "Image provenance links must use an absolute http or https URL.",
        );
      }
    });
    if (
      cleanText(value.media.imageRightsStatus) &&
      !INSPIRATION_IMAGE_RIGHTS_STATUSES.includes(
        cleanText(value.media.imageRightsStatus),
      )
    ) {
      pushIssue(
        issues,
        "inspiration.invalid-image-rights-status",
        `${path}.media.imageRightsStatus`,
        `Unknown image rights status: ${cleanText(
          value.media.imageRightsStatus,
        )}.`,
      );
    }
    if (
      cleanText(value.media.imageRightsVerifiedAt) &&
      !/^\d{4}-\d{2}-\d{2}$/.test(
        cleanText(value.media.imageRightsVerifiedAt),
      )
    ) {
      pushIssue(
        issues,
        "inspiration.invalid-image-rights-date",
        `${path}.media.imageRightsVerifiedAt`,
        "Image rights verification date must use YYYY-MM-DD.",
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
    status: value.status === "published" ? "pending-review" : "draft",
    sourceAnchors,
    sourceTypes: value.sourceTypes,
    themes: value.themes,
    motifs: value.motifs,
    horror: value.horror,
    contexts: value.contexts,
    card: value.card,
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
      triggerWarnings: normalizeTriggerWarnings(value.editorial?.cautions),
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
      imageCreator: cleanText(value.media?.imageCreator),
      imageSourceTitle: cleanText(value.media?.imageSourceTitle),
      imageSourceUrl: cleanText(value.media?.imageSourceUrl),
      imageLicense: cleanText(value.media?.imageLicense),
      imageLicenseUrl: cleanText(value.media?.imageLicenseUrl),
      imageRightsStatus: cleanText(value.media?.imageRightsStatus),
      imageRightsVerifiedAt: cleanText(value.media?.imageRightsVerifiedAt),
      imageModifications: cleanText(value.media?.imageModifications),
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
