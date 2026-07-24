import {
  defineInspirationModule,
  uniqueById,
} from "./inspiration-module-schema.js";
import {
  CORE_INSPIRATION_MODULES,
  buildInspirationAssetUrl,
} from "./inspiration-modules/core-inspiration-modules.js";
import { normalizeTriggerWarnings } from "./trigger-warnings.js";
import { PUBLISHED_SEMANTIC_INSPIRATION_MODULES } from "./published-inspiration-modules.js";
import {
  DECOMPOSITION_INSPIRATION_MODULE,
  DECOMPOSITION_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/decomposition.js";
import {
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/sedlec-ossuary.js";

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function adaptPublishedSemanticInspirationModule(module = {}) {
  const inspiration = module.inspiration || {};
  const editorial = inspiration.editorial || {};
  const media = inspiration.media || {};
  const sourceAnchorId = module.sourceAnchor?.id || module.id;
  const title =
    module.title || module.sourceAnchor?.title || inspiration.title || sourceAnchorId;
  const sourceTypes = asArray(inspiration.sourceTypes);
  const sourceType =
    sourceTypes[0] || module.sourceAnchor?.kind || "Source Inspiration";
  const sourceAnchor = {
    ...(module.sourceAnchor || {}),
    id: sourceAnchorId,
    label: module.sourceAnchor?.label || title,
    title,
    type: module.sourceAnchor?.type || sourceType,
    status: "published",
    workflows: ["inspiration-archive"],
    sourceTypes,
    themes: asArray(inspiration.themes),
    motifs: asArray(inspiration.motifs),
    horror: asArray(inspiration.horror),
    summary:
      module.sourceAnchor?.summary || editorial.deck || editorial.whatItIs || "",
  };
  const publicInspiration = {
    ...inspiration,
    id: inspiration.id || `inspiration-${sourceAnchorId}`,
    legacyId: inspiration.legacyId || title,
    title,
    label: title,
    type: "Source Inspiration",
    contentType: "source-inspiration-card",
    status: "published",
    workflows: ["inspiration-archive"],
    sourceAnchors: [sourceAnchorId],
    summary: editorial.deck || sourceAnchor.summary || "",
    narrative: editorial.whatItIs || editorial.cruorLens || "",
    caption: editorial.deck || "",
    editorial: {
      ...editorial,
      triggerWarnings: normalizeTriggerWarnings(editorial.triggerWarnings),
    },
    media: {
      ...media,
      imageUrl:
        media.imageUrl ||
        (media.imageKey ? buildInspirationAssetUrl(media.imageKey) : ""),
    },
    inspiration: {
      anchor: title,
      sourceType,
      logic: editorial.cruorLens || editorial.cruorLensThesis || "",
    },
  };

  return defineInspirationModule({
    ...module,
    id: sourceAnchorId,
    title,
    status: "published",
    sourceAnchor,
    inspiration: publicInspiration,
    components: asArray(module.components),
    metadata: {
      ...(module.metadata || {}),
      promotedFromSemanticV2: true,
    },
  });
}

function isPublishableSemanticModule(module = {}) {
  return Boolean(
    module.status === "published" &&
      module.inspiration?.status === "approved" &&
      asArray(module.capabilities).includes("inspiration-archive"),
  );
}

const PUBLISHED_PRODUCTION_MODULES = Object.freeze(
  PUBLISHED_SEMANTIC_INSPIRATION_MODULES.filter(
    isPublishableSemanticModule,
  ).map(adaptPublishedSemanticInspirationModule),
);
const PUBLISHED_PRODUCTION_MODULE_BY_ID = new Map(
  PUBLISHED_PRODUCTION_MODULES.map((module) => [module.id, module]),
);

function createPendingReviewProductionModule(module = {}) {
  if (!module?.id) return module;
  return defineInspirationModule({
    ...module,
    status: "pending-review",
    sourceAnchor: module.sourceAnchor
      ? { ...module.sourceAnchor, status: "pending-review" }
      : module.sourceAnchor,
    inspiration: module.inspiration
      ? {
          ...module.inspiration,
          status: "pending-review",
          editorial: {
            ...(module.inspiration.editorial || {}),
            triggerWarnings: normalizeTriggerWarnings(
              module.inspiration.editorial?.triggerWarnings,
            ),
          },
        }
      : module.inspiration,
    metadata: {
      ...(module.metadata || {}),
      dossierReviewStatus: "pending-review",
    },
  });
}

function selectPublishedReplacement(module) {
  return (
    PUBLISHED_PRODUCTION_MODULE_BY_ID.get(module.id) ||
    createPendingReviewProductionModule(module)
  );
}

const BASE_PRODUCTION_EXPLICIT_INSPIRATION_MODULES = Object.freeze([
  DECOMPOSITION_INSPIRATION_MODULE,
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
]);

export const PRODUCTION_EXPLICIT_INSPIRATION_MODULES = Object.freeze(
  BASE_PRODUCTION_EXPLICIT_INSPIRATION_MODULES.map(
    selectPublishedReplacement,
  ),
);

export const PRODUCTION_EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS =
  Object.freeze([
    DECOMPOSITION_SOURCE_ANCHOR_ID,
    SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
  ]);

export const PRODUCTION_EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET =
  new Set(PRODUCTION_EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS);

export const PRODUCTION_CONVERTED_CORE_INSPIRATION_MODULES = Object.freeze(
  CORE_INSPIRATION_MODULES.filter(
    (module) =>
      !PRODUCTION_EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET.has(
        module.id,
      ),
  ).map(selectPublishedReplacement),
);

export const PRODUCTION_INSPIRATION_MODULES = Object.freeze(
  uniqueById([
    ...PRODUCTION_EXPLICIT_INSPIRATION_MODULES,
    ...PRODUCTION_CONVERTED_CORE_INSPIRATION_MODULES,
  ]),
);

export function getProductionInspirationModule(moduleId = "") {
  return (
    PRODUCTION_INSPIRATION_MODULES.find((module) => module.id === moduleId) ||
    null
  );
}
