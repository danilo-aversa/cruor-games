import { SHARED_DARKEN_LOCATION_COMPONENTS } from "../adapters/darken-components.js";
import { SHARED_LOCATION_REGION_COMPONENTS } from "../adapters/location-regions.js";
import { DARK_PLACES_CANONICAL_EXPANSION_COMPONENTS } from "../content-packs/dark-places-canonical-expansion-pack.js";
import {
  defineInspirationModule,
  uniqueById,
} from "../inspiration-module-schema.js";
import { SHARED_MONSTER_COMPONENTS } from "../monster-components.js";
import {
  normalizeSourceAnchorIds,
  SHARED_SOURCE_ANCHORS,
} from "../source-anchors.js";

export const CORE_INSPIRATION_MODULE_PACK_ID = "existing-inspirations";
export const INSPIRATION_ASSET_PROVIDER = "local";

const CRUOR_PUBLIC_BASE_PATH = import.meta.env?.BASE_URL || "/";

/**
 * Base path for public inspiration-card images.
 *
 * The files are stored in:
 *   public/assets/inspiration-cards
 *
 * In local dev they resolve as:
 *   /assets/inspiration-cards
 *
 * On GitHub Pages, with Vite base set to /cruor-games/, they resolve as:
 *   /cruor-games/assets/inspiration-cards
 */
export const INSPIRATION_ASSET_BASE_PATH = `${CRUOR_PUBLIC_BASE_PATH.replace(/\/+$/, "")}/assets/inspiration-cards`;

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeStringArray(value) {
  return asArray(value)
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueArray(values) {
  return [...new Set(normalizeStringArray(values))];
}

function normalizeObjectArray(value) {
  return asArray(value)
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({ ...item }));
}

function normalizeCardNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null;
}

function normalizeInspirationCardMetadata(card = {}) {
  const metadata = card.card || {};

  return Object.freeze({
    domain: String(metadata.domain || "")
      .trim()
      .toLowerCase(),
    obscurity: String(metadata.obscurity || "uncommon")
      .trim()
      .toLowerCase(),
    collectionId: String(
      metadata.collectionId || CORE_INSPIRATION_MODULE_PACK_ID,
    ).trim(),
    collectionLabel: String(metadata.collectionLabel || "").trim(),
    number: normalizeCardNumber(metadata.number),
    description: String(metadata.description || card.caption || "").trim(),
  });
}

const SOURCE_ANCHOR_BY_ID = new Map(
  SHARED_SOURCE_ANCHORS.map((sourceAnchor) => [sourceAnchor.id, sourceAnchor]),
);
const COMPONENT_SOURCES = [
  ...SHARED_MONSTER_COMPONENTS,
  ...SHARED_DARKEN_LOCATION_COMPONENTS,
  ...SHARED_LOCATION_REGION_COMPONENTS,
  ...DARK_PLACES_CANONICAL_EXPANSION_COMPONENTS,
];

export function buildInspirationAssetUrl(
  imageKey,
  basePath = INSPIRATION_ASSET_BASE_PATH,
) {
  if (!imageKey) return "";

  const cleanBasePath = String(basePath || "").replace(/\/+$/, "");
  const cleanImageKey = String(imageKey || "").replace(/^\/+/, "");

  return `${cleanBasePath}/${cleanImageKey}`;
}

export function resolveInspirationCardAsset(
  card,
  basePath = INSPIRATION_ASSET_BASE_PATH,
) {
  return {
    ...card,
    imageProvider: card.imageProvider || INSPIRATION_ASSET_PROVIDER,
    imageUrl: buildInspirationAssetUrl(card.imageKey, basePath),
  };
}

export function buildCoreInspirationFromCard(card) {
  const resolvedCard = resolveInspirationCardAsset(card);
  const sourceAnchorId = card.sourceAnchorId;
  const sourceAnchor = SOURCE_ANCHOR_BY_ID.get(sourceAnchorId) || null;
  const sourceAnchors = normalizeSourceAnchorIds(sourceAnchorId);
  const sourceTypes = uniqueArray([
    card.sourceType,
    ...(sourceAnchor?.sourceTypes || []),
  ]);
  const themes = uniqueArray([
    ...(card.themes || []),
    ...(sourceAnchor?.themes || []),
  ]);
  const motifs = uniqueArray([
    ...(card.motifs || []),
    ...(sourceAnchor?.motifs || []),
  ]);
  const horror = uniqueArray(sourceAnchor?.horror || []);
  const summary = card.caption || sourceAnchor?.summary || "";
  const cardMetadata = normalizeInspirationCardMetadata(card);
  const editorial = card.editorial || {};
  const media = card.media || {};

  return {
    id: `inspiration-${sourceAnchorId}`,
    legacyId: card.title,
    title: card.title,
    label: card.title,
    type: "Source Inspiration",
    contentType: "source-inspiration-card",
    status: sourceAnchor?.status || card.status || "draft",
    workflows: ["inspiration-archive"],
    sourceAnchors,
    sourceTypes,
    themes,
    motifs,
    contexts: normalizeStringArray(card.contexts),
    horror,
    summary,
    narrative: card.logic || sourceAnchor?.summary || summary,
    caption: card.caption || "",
    card: cardMetadata,
    editorial: {
      deck: String(editorial.deck || summary).trim(),
      thesis: String(editorial.thesis || "").trim(),
      whatItIs: String(
        editorial.whatItIs || cardMetadata.description || "",
      ).trim(),
      cruorLensThesis: String(editorial.cruorLensThesis || "").trim(),
      cruorLens: String(editorial.cruorLens || card.logic || "").trim(),
      facts: normalizeObjectArray(editorial.facts),
      horrorStructures: normalizeObjectArray(editorial.horrorStructures),
      triggerWarnings: normalizeStringArray(editorial.triggerWarnings),
      tableSafety: normalizeStringArray(editorial.tableSafety),
      lowIntensityAlternative: String(
        editorial.lowIntensityAlternative || "",
      ).trim(),
      sources: normalizeObjectArray(editorial.sources),
      furtherReading: normalizeObjectArray(editorial.furtherReading),
      relatedDossiers: normalizeObjectArray(editorial.relatedDossiers),
      whyItDisturbs: String(editorial.whyItDisturbs || "").trim(),
      creativeUses: normalizeStringArray(editorial.creativeUses),
      cautions: normalizeStringArray(editorial.cautions),
    },
    media: {
      icon: media.icon || card.icon || "fa-book-open",
      imageTitle: String(media.imageTitle || card.title || "").trim(),
      imageKey: media.imageKey || card.imageKey || "",
      imageNote: media.imageNote || card.imageNote || "",
      imageProvider: media.imageProvider || resolvedCard.imageProvider || "",
      imageUrl: media.imageUrl || resolvedCard.imageUrl || "",
      imageAlt: String(
        media.imageAlt || card.imageNote || `${card.title} reference image.`,
      ).trim(),
      imageCredit: String(media.imageCredit || "").trim(),
    },
    inspiration: {
      anchor: card.title,
      sourceType: card.sourceType || sourceAnchor?.type || "",
      logic: card.logic || "",
      imageNote: card.imageNote || "",
    },
    tags: [
      ...sourceAnchors.map((id) => `source:${id}`),
      ...sourceTypes.map((sourceType) => `source-type:${slugify(sourceType)}`),
      ...themes.map((theme) => `theme:${slugify(theme)}`),
      ...motifs.map((motif) => `motif:${slugify(motif)}`),
    ],
  };
}

export function entryReferencesSourceAnchor(entry, sourceAnchorId) {
  return normalizeSourceAnchorIds(entry?.sourceAnchors).includes(
    sourceAnchorId,
  );
}

export function getComponentsForSourceAnchor(sourceAnchorId) {
  return uniqueById(
    COMPONENT_SOURCES.filter((component) =>
      entryReferencesSourceAnchor(component, sourceAnchorId),
    ),
  );
}

export function getReferencedSourceAnchorsForModule(module) {
  return uniqueById(
    [
      module.sourceAnchor,
      ...module.components
        .flatMap((component) =>
          normalizeSourceAnchorIds(component.sourceAnchors),
        )
        .map((sourceAnchorId) => SOURCE_ANCHOR_BY_ID.get(sourceAnchorId)),
    ].filter(Boolean),
  );
}

export function buildCoreInspirationModuleFromCard(
  card,
  { metadata = {}, packId = CORE_INSPIRATION_MODULE_PACK_ID } = {},
) {
  const sourceAnchor = SOURCE_ANCHOR_BY_ID.get(card.sourceAnchorId) || null;
  const inspiration = buildCoreInspirationFromCard(card);

  return defineInspirationModule({
    id: card.sourceAnchorId,
    title: sourceAnchor?.label || card.title,
    status: sourceAnchor?.status || inspiration.status || "draft",
    packId,
    sourceAnchor,
    inspiration,
    components: getComponentsForSourceAnchor(card.sourceAnchorId),
    metadata: {
      moduleRole: "converted-inspiration",
      migratedFrom: [
        "features/crucible/crucible.sources-data.js",
        "shared/content/source-anchors.js",
        "shared/content/monster-components.js",
        "shared/content/adapters/darken-components.js",
        "shared/content/adapters/location-regions.js",
      ],
      ...metadata,
    },
  });
}

export function buildModuleExports(module) {
  return {
    sourceAnchor: module?.sourceAnchor || null,
    inspiration: module?.inspiration || null,
    monsterGrafts: Object.freeze((module?.monsterGrafts || []).filter(Boolean)),
    locationComponents: Object.freeze(
      (module?.locationComponents || []).filter(Boolean),
    ),
    locationRegions: Object.freeze(
      (module?.locationRegions || []).filter(Boolean),
    ),
    referencedSourceAnchors: Object.freeze(
      module ? getReferencedSourceAnchorsForModule(module) : [],
    ),
  };
}
