import { SHARED_DARKEN_LOCATION_COMPONENTS } from "./adapters/darken-components.js";
import { SHARED_LOCATION_REGION_COMPONENTS } from "./adapters/location-regions.js";
import { DARK_PLACES_CANONICAL_EXPANSION_COMPONENTS } from "./content-packs/dark-places-canonical-expansion-pack.js";
import {
  defineInspirationModule,
  flattenInspirationModuleCollection,
  modulesToRegistryCollections,
  uniqueById,
} from "./inspiration-module-schema.js";
import {
  CORE_INSPIRATION_MODULES,
} from "./inspiration-modules/core-inspiration-modules.js";
import {
  DECOMPOSITION_SEMANTIC_V2_MODULE,
} from "./content-packs/decomposition-semantic-v2-pack.js";
import { SEDLEC_OSSUARY_SEMANTIC_V2_MODULE } from "./content-packs/sedlec-ossuary-semantic-v2-pack.js";
import { THE_MIST_SEMANTIC_V2_MODULE } from "./content-packs/the-mist-semantic-v2-pack.js";
import { TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE } from "./content-packs/towers-of-silence-semantic-v2-pack.js";
import { WOLF_SPIDERS_SEMANTIC_V2_MODULE } from "./content-packs/wolf-spiders-semantic-v2-pack.js";
import { DECOMPOSITION_SOURCE_ANCHOR_ID } from "./inspiration-modules/decomposition.js";
import { THE_MIST_SOURCE_ANCHOR_ID } from "./inspiration-modules/the-mist.js";
import { TOWERS_OF_SILENCE_SOURCE_ANCHOR_ID } from "./inspiration-modules/towers-of-silence.js";
import { SEDLEC_OSSUARY_SOURCE_ANCHOR_ID } from "./inspiration-modules/sedlec-ossuary.js";
import { WOLF_SPIDERS_SOURCE_ANCHOR_ID } from "./inspiration-modules/wolf-spiders.js";
import { SHARED_INSPIRATIONS } from "./inspirations.js";
import { SHARED_MONSTER_COMPONENTS } from "./monster-components.js";
import { PUBLISHED_SEMANTIC_INSPIRATION_MODULES } from "./published-inspiration-modules.js";
import { normalizeSourceAnchorIds, SHARED_SOURCE_ANCHORS } from "./source-anchors.js";
import { MORTUARY_TOTEMS_SEMANTIC_V2_MODULE } from "./content-packs/mortuary-totems-semantic-v2-pack.js";
import { MORTUARY_TOTEMS_SOURCE_ANCHOR_ID } from "./inspiration-modules/mortuary-totems.js";
import { MUSTARD_GAS_SEMANTIC_V2_MODULE } from "./content-packs/mustard-gas-semantic-v2-pack.js";
import { MUSTARD_GAS_SOURCE_ANCHOR_ID } from "./inspiration-modules/mustard-gas.js";
import { ENDOCANNIBALISM_SEMANTIC_V2_MODULE } from "./content-packs/endocannibalism-semantic-v2-pack.js";
import { ENDOCANNIBALISM_SOURCE_ANCHOR_ID } from "./inspiration-modules/endocannibalism.js";

import { GENETIC_MUTATIONS_SEMANTIC_V2_MODULE } from "./content-packs/genetic-mutations-semantic-v2-pack.js";
import { GENETIC_MUTATIONS_SOURCE_ANCHOR_ID } from "./inspiration-modules/genetic-mutations.js";

import { CRUCIFIXION_SEMANTIC_V2_MODULE } from "./content-packs/crucifixion-semantic-v2-pack.js";
import { CRUCIFIXION_SOURCE_ANCHOR_ID } from "./inspiration-modules/crucifixion.js";

import { IMPALEMENT_SEMANTIC_V2_MODULE } from "./content-packs/impalement-semantic-v2-pack.js";
import { IMPALEMENT_SOURCE_ANCHOR_ID } from "./inspiration-modules/impalement.js";

import { WAX_DEATH_MASKS_SEMANTIC_V2_MODULE } from "./content-packs/wax-death-masks-semantic-v2-pack.js";
import { WAX_DEATH_MASKS_SOURCE_ANCHOR_ID } from "./inspiration-modules/wax-death-masks.js";

import { ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE } from "./content-packs/anthropodermic-bibliopegy-semantic-v2-pack.js";
import { ANTHROPODERMIC_BIBLIOPEGY_SOURCE_ANCHOR_ID } from "./inspiration-modules/anthropodermic-bibliopegy.js";

import { JIKININKI_SEMANTIC_V2_MODULE } from "./content-packs/jikininki-semantic-v2-pack.js";
import { JIKININKI_SOURCE_ANCHOR_ID } from "./inspiration-modules/jikininki.js";

function asArray(value) {
  if (!value) return [];
  if (value instanceof Set) return [...value].filter(Boolean);
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function entryReferencesSourceAnchor(entry, sourceAnchorId) {
  return normalizeSourceAnchorIds(entry?.sourceAnchors).includes(sourceAnchorId);
}

function getPrimaryInspirationForSourceAnchor(sourceAnchorId, inspirations = SHARED_INSPIRATIONS) {
  return asArray(inspirations).find((inspiration) => entryReferencesSourceAnchor(inspiration, sourceAnchorId)) || null;
}

export const SEMANTIC_MIGRATION_MODULES = Object.freeze([
  DECOMPOSITION_SEMANTIC_V2_MODULE,
  SEDLEC_OSSUARY_SEMANTIC_V2_MODULE,
  THE_MIST_SEMANTIC_V2_MODULE,
  WOLF_SPIDERS_SEMANTIC_V2_MODULE,
  TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE,
  MORTUARY_TOTEMS_SEMANTIC_V2_MODULE,
  MUSTARD_GAS_SEMANTIC_V2_MODULE,
  ENDOCANNIBALISM_SEMANTIC_V2_MODULE,
  GENETIC_MUTATIONS_SEMANTIC_V2_MODULE,
  CRUCIFIXION_SEMANTIC_V2_MODULE,
  IMPALEMENT_SEMANTIC_V2_MODULE,
  WAX_DEATH_MASKS_SEMANTIC_V2_MODULE,
  ANTHROPODERMIC_BIBLIOPEGY_SEMANTIC_V2_MODULE,
  JIKININKI_SEMANTIC_V2_MODULE,
].filter(Boolean));

export const SEMANTIC_MIGRATION_MODULE_SOURCE_ANCHOR_IDS = Object.freeze([
  DECOMPOSITION_SOURCE_ANCHOR_ID,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
  THE_MIST_SOURCE_ANCHOR_ID,
  WOLF_SPIDERS_SOURCE_ANCHOR_ID,
  TOWERS_OF_SILENCE_SOURCE_ANCHOR_ID,
  MORTUARY_TOTEMS_SOURCE_ANCHOR_ID,
  MUSTARD_GAS_SOURCE_ANCHOR_ID,
  ENDOCANNIBALISM_SOURCE_ANCHOR_ID,
  GENETIC_MUTATIONS_SOURCE_ANCHOR_ID,
  CRUCIFIXION_SOURCE_ANCHOR_ID,
  IMPALEMENT_SOURCE_ANCHOR_ID,
  WAX_DEATH_MASKS_SOURCE_ANCHOR_ID,
  ANTHROPODERMIC_BIBLIOPEGY_SOURCE_ANCHOR_ID,
  JIKININKI_SOURCE_ANCHOR_ID,
]);

export const SEMANTIC_MIGRATION_MODULE_SOURCE_ANCHOR_ID_SET = new Set(
  SEMANTIC_MIGRATION_MODULE_SOURCE_ANCHOR_IDS,
);

const PUBLISHED_SEMANTIC_MODULE_BY_ID = new Map(
  PUBLISHED_SEMANTIC_INSPIRATION_MODULES.map((module) => [module.id, module]),
);

function createPendingReviewModuleView(module = {}) {
  if (!module?.id) return module;
  const publishedModule = PUBLISHED_SEMANTIC_MODULE_BY_ID.get(module.id);
  if (publishedModule) return publishedModule;
  return Object.freeze({
    ...module,
    status: "pending-review",
    sourceAnchor: module.sourceAnchor
      ? { ...module.sourceAnchor, status: "pending-review" }
      : module.sourceAnchor,
    inspiration: module.inspiration
      ? { ...module.inspiration, status: "pending-review" }
      : module.inspiration,
  });
}

// Backward-compatible names for module-catalog consumers. Studio uses the
// published semantic replacement when available and keeps every other card in
// the library as Pending Review.
export const EXPLICIT_INSPIRATION_MODULES = Object.freeze(
  SEMANTIC_MIGRATION_MODULES.map(createPendingReviewModuleView),
);
export const EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS =
  SEMANTIC_MIGRATION_MODULE_SOURCE_ANCHOR_IDS;
export const EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET =
  SEMANTIC_MIGRATION_MODULE_SOURCE_ANCHOR_ID_SET;

export const CONVERTED_CORE_INSPIRATION_MODULES = Object.freeze(
  CORE_INSPIRATION_MODULES.filter(
    (module) =>
      !SEMANTIC_MIGRATION_MODULE_SOURCE_ANCHOR_ID_SET.has(module.id),
  ).map(createPendingReviewModuleView),
);

/**
 * Canonical static Inspiration Module collection.
 *
 * This is the source consumed by Inspiration Studio. It keeps canonical semantic
 * migration modules first, then appends compatibility-normalized archive modules.
 * Production registry assembly uses the separate PRODUCTION_* catalog above, so
 * selecting a semantic candidate can never remove a public Archive entry.
 */
export const CRUOR_INSPIRATION_MODULES = Object.freeze(
  uniqueById([
    ...EXPLICIT_INSPIRATION_MODULES,
    ...CONVERTED_CORE_INSPIRATION_MODULES,
  ]),
);

export const CRUOR_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS = Object.freeze(
  CRUOR_INSPIRATION_MODULES.map((module) => module.id).filter(Boolean),
);

export const CRUOR_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET = new Set(
  CRUOR_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS,
);

export function buildInspirationModules({
  sourceAnchors = SHARED_SOURCE_ANCHORS,
  inspirations = SHARED_INSPIRATIONS,
  components = [
    ...SHARED_MONSTER_COMPONENTS,
    ...SHARED_DARKEN_LOCATION_COMPONENTS,
    ...SHARED_LOCATION_REGION_COMPONENTS,
    ...DARK_PLACES_CANONICAL_EXPANSION_COMPONENTS,
  ],
  packId = "core-cruor",
  excludedSourceAnchorIds = CRUOR_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET,
} = {}) {
  const excludedIds = new Set(asArray(excludedSourceAnchorIds));

  return asArray(sourceAnchors)
    .filter((sourceAnchor) => sourceAnchor?.id && !excludedIds.has(sourceAnchor.id))
    .map((sourceAnchor) =>
      defineInspirationModule({
        id: sourceAnchor.id,
        title: sourceAnchor.label,
        status: sourceAnchor.status,
        packId,
        sourceAnchor,
        inspiration: getPrimaryInspirationForSourceAnchor(sourceAnchor.id, inspirations),
        components: asArray(components).filter((component) => entryReferencesSourceAnchor(component, sourceAnchor.id)),
        metadata: {
          generatedFrom: "static-content-registry-fallback",
        },
      }),
    );
}

function createStudioInspirationModuleView(module, registryComponents = []) {
  const sourceAnchorId = module.sourceAnchor?.id || module.id;
  const externalComponents = asArray(registryComponents).filter((component) =>
    entryReferencesSourceAnchor(component, sourceAnchorId),
  );
  const components = uniqueById([
    ...asArray(module.components),
    ...externalComponents,
  ]);

  return Object.freeze({
    ...module,
    components: Object.freeze(components),
    monsterGrafts: Object.freeze(
      components.filter((component) => component.contentType === "monster-graft"),
    ),
    locationComponents: Object.freeze(
      components.filter(
        (component) => component.contentType === "location-component",
      ),
    ),
    locationRegions: Object.freeze(
      components.filter((component) => component.contentType === "location-region"),
    ),
  });
}

export function buildStudioInspirationModulesFromRegistry(
  registry,
) {
  if (!registry) return CRUOR_INSPIRATION_MODULES;

  return CRUOR_INSPIRATION_MODULES.map((module) =>
    createStudioInspirationModuleView(module, registry.components || []),
  );
}

export {
  PRODUCTION_CONVERTED_CORE_INSPIRATION_MODULES,
  PRODUCTION_EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET,
  PRODUCTION_EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS,
  PRODUCTION_EXPLICIT_INSPIRATION_MODULES,
  PRODUCTION_INSPIRATION_MODULES,
} from "./production-inspiration-modules.js";

export {
  defineInspirationModule,
  flattenInspirationModuleCollection,
  modulesToRegistryCollections,
  uniqueById,
};

export {
  CORE_INSPIRATION_CARD_DEFINITIONS,
  CORE_INSPIRATION_MODULES,
  CORE_INSPIRATION_MODULE_COMPONENTS,
  CORE_INSPIRATION_MODULE_INSPIRATIONS,
  CORE_INSPIRATION_MODULE_PACK_ID,
  CORE_INSPIRATION_MODULE_REFERENCED_SOURCE_ANCHORS,
  CORE_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET,
  CORE_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS,
  CORE_INSPIRATION_MODULE_SOURCE_ANCHORS,
  INSPIRATION_ASSET_BASE_PATH,
  INSPIRATION_ASSET_PROVIDER,
  buildCoreInspirationFromCard,
  buildInspirationAssetUrl,
  getCoreInspirationModule,
  getCoreInspirationModuleReferencedSourceAnchors,
  resolveInspirationCardAsset,
} from "./inspiration-modules/core-inspiration-modules.js";

export {
  DECOMPOSITION_INSPIRATION,
  DECOMPOSITION_INSPIRATION_MODULE,
  DECOMPOSITION_INSPIRATION_MODULE_PACK_ID,
  DECOMPOSITION_LOCATION_COMPONENTS,
  DECOMPOSITION_LOCATION_REGION_COMPONENTS,
  DECOMPOSITION_MONSTER_GRAFT_COMPONENTS,
  DECOMPOSITION_REFERENCED_SOURCE_ANCHORS,
  DECOMPOSITION_SOURCE_ANCHOR,
  DECOMPOSITION_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/decomposition.js";

export {
  SEDLEC_OSSUARY_INSPIRATION,
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
  SEDLEC_OSSUARY_INSPIRATION_MODULE_PACK_ID,
  SEDLEC_OSSUARY_LOCATION_COMPONENTS,
  SEDLEC_OSSUARY_LOCATION_REGION_COMPONENTS,
  SEDLEC_OSSUARY_MONSTER_GRAFT_COMPONENTS,
  SEDLEC_OSSUARY_REFERENCED_SOURCE_ANCHORS,
  SEDLEC_OSSUARY_SOURCE_ANCHOR,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/sedlec-ossuary.js";

export {
  TOWERS_OF_SILENCE_INSPIRATION,
  TOWERS_OF_SILENCE_INSPIRATION_CARD_DEFINITION,
  TOWERS_OF_SILENCE_INSPIRATION_MODULE,
  TOWERS_OF_SILENCE_LOCATION_COMPONENTS,
  TOWERS_OF_SILENCE_LOCATION_REGION_COMPONENTS,
  TOWERS_OF_SILENCE_MONSTER_GRAFT_COMPONENTS,
  TOWERS_OF_SILENCE_REFERENCED_SOURCE_ANCHORS,
  TOWERS_OF_SILENCE_SOURCE_ANCHOR,
  TOWERS_OF_SILENCE_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/towers-of-silence.js";

export {
  MORTUARY_TOTEMS_INSPIRATION,
  MORTUARY_TOTEMS_INSPIRATION_CARD_DEFINITION,
  MORTUARY_TOTEMS_INSPIRATION_MODULE,
  MORTUARY_TOTEMS_LOCATION_COMPONENTS,
  MORTUARY_TOTEMS_LOCATION_REGION_COMPONENTS,
  MORTUARY_TOTEMS_MONSTER_GRAFT_COMPONENTS,
  MORTUARY_TOTEMS_REFERENCED_SOURCE_ANCHORS,
  MORTUARY_TOTEMS_SOURCE_ANCHOR,
  MORTUARY_TOTEMS_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/mortuary-totems.js";

export {
  MUSTARD_GAS_INSPIRATION,
  MUSTARD_GAS_INSPIRATION_CARD_DEFINITION,
  MUSTARD_GAS_INSPIRATION_MODULE,
  MUSTARD_GAS_LOCATION_COMPONENTS,
  MUSTARD_GAS_LOCATION_REGION_COMPONENTS,
  MUSTARD_GAS_MONSTER_GRAFT_COMPONENTS,
  MUSTARD_GAS_REFERENCED_SOURCE_ANCHORS,
  MUSTARD_GAS_SOURCE_ANCHOR,
  MUSTARD_GAS_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/mustard-gas.js";

export {
  THE_MIST_INSPIRATION,
  THE_MIST_INSPIRATION_CARD_DEFINITION,
  THE_MIST_INSPIRATION_MODULE,
  THE_MIST_LOCATION_COMPONENTS,
  THE_MIST_LOCATION_REGION_COMPONENTS,
  THE_MIST_MONSTER_GRAFT_COMPONENTS,
  THE_MIST_REFERENCED_SOURCE_ANCHORS,
  THE_MIST_SOURCE_ANCHOR,
  THE_MIST_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/the-mist.js";

export {
  ENDOCANNIBALISM_INSPIRATION,
  ENDOCANNIBALISM_INSPIRATION_CARD_DEFINITION,
  ENDOCANNIBALISM_INSPIRATION_MODULE,
  ENDOCANNIBALISM_LOCATION_COMPONENTS,
  ENDOCANNIBALISM_LOCATION_REGION_COMPONENTS,
  ENDOCANNIBALISM_MONSTER_GRAFT_COMPONENTS,
  ENDOCANNIBALISM_REFERENCED_SOURCE_ANCHORS,
  ENDOCANNIBALISM_SOURCE_ANCHOR,
  ENDOCANNIBALISM_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/endocannibalism.js";

export {
  GENETIC_MUTATIONS_INSPIRATION,
  GENETIC_MUTATIONS_INSPIRATION_CARD_DEFINITION,
  GENETIC_MUTATIONS_INSPIRATION_MODULE,
  GENETIC_MUTATIONS_LOCATION_COMPONENTS,
  GENETIC_MUTATIONS_LOCATION_REGION_COMPONENTS,
  GENETIC_MUTATIONS_MONSTER_GRAFT_COMPONENTS,
  GENETIC_MUTATIONS_REFERENCED_SOURCE_ANCHORS,
  GENETIC_MUTATIONS_SOURCE_ANCHOR,
  GENETIC_MUTATIONS_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/genetic-mutations.js";

export {
  CRUCIFIXION_INSPIRATION,
  CRUCIFIXION_INSPIRATION_CARD_DEFINITION,
  CRUCIFIXION_INSPIRATION_MODULE,
  CRUCIFIXION_LOCATION_COMPONENTS,
  CRUCIFIXION_LOCATION_REGION_COMPONENTS,
  CRUCIFIXION_MONSTER_GRAFT_COMPONENTS,
  CRUCIFIXION_REFERENCED_SOURCE_ANCHORS,
  CRUCIFIXION_SOURCE_ANCHOR,
  CRUCIFIXION_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/crucifixion.js";

export {
  IMPALEMENT_INSPIRATION,
  IMPALEMENT_INSPIRATION_CARD_DEFINITION,
  IMPALEMENT_INSPIRATION_MODULE,
  IMPALEMENT_LOCATION_COMPONENTS,
  IMPALEMENT_LOCATION_REGION_COMPONENTS,
  IMPALEMENT_MONSTER_GRAFT_COMPONENTS,
  IMPALEMENT_REFERENCED_SOURCE_ANCHORS,
  IMPALEMENT_SOURCE_ANCHOR,
  IMPALEMENT_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/impalement.js";

export {
  WAX_DEATH_MASKS_INSPIRATION,
  WAX_DEATH_MASKS_INSPIRATION_CARD_DEFINITION,
  WAX_DEATH_MASKS_INSPIRATION_MODULE,
  WAX_DEATH_MASKS_LOCATION_COMPONENTS,
  WAX_DEATH_MASKS_LOCATION_REGION_COMPONENTS,
  WAX_DEATH_MASKS_MONSTER_GRAFT_COMPONENTS,
  WAX_DEATH_MASKS_REFERENCED_SOURCE_ANCHORS,
  WAX_DEATH_MASKS_SOURCE_ANCHOR,
  WAX_DEATH_MASKS_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/wax-death-masks.js";

export {
  ANTHROPODERMIC_BIBLIOPEGY_INSPIRATION,
  ANTHROPODERMIC_BIBLIOPEGY_INSPIRATION_CARD_DEFINITION,
  ANTHROPODERMIC_BIBLIOPEGY_INSPIRATION_MODULE,
  ANTHROPODERMIC_BIBLIOPEGY_LOCATION_COMPONENTS,
  ANTHROPODERMIC_BIBLIOPEGY_LOCATION_REGION_COMPONENTS,
  ANTHROPODERMIC_BIBLIOPEGY_MONSTER_GRAFT_COMPONENTS,
  ANTHROPODERMIC_BIBLIOPEGY_REFERENCED_SOURCE_ANCHORS,
  ANTHROPODERMIC_BIBLIOPEGY_SOURCE_ANCHOR,
  ANTHROPODERMIC_BIBLIOPEGY_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/anthropodermic-bibliopegy.js";

export {
  WOLF_SPIDERS_INSPIRATION,
  WOLF_SPIDERS_INSPIRATION_CARD_DEFINITION,
  WOLF_SPIDERS_INSPIRATION_MODULE,
  WOLF_SPIDERS_LOCATION_COMPONENTS,
  WOLF_SPIDERS_LOCATION_REGION_COMPONENTS,
  WOLF_SPIDERS_MONSTER_GRAFT_COMPONENTS,
  WOLF_SPIDERS_REFERENCED_SOURCE_ANCHORS,
  WOLF_SPIDERS_SOURCE_ANCHOR,
  WOLF_SPIDERS_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/wolf-spiders.js";

export {
  JIKININKI_INSPIRATION,
  JIKININKI_INSPIRATION_CARD_DEFINITION,
  JIKININKI_INSPIRATION_MODULE,
  JIKININKI_LOCATION_COMPONENTS,
  JIKININKI_LOCATION_REGION_COMPONENTS,
  JIKININKI_MONSTER_GRAFT_COMPONENTS,
  JIKININKI_REFERENCED_SOURCE_ANCHORS,
  JIKININKI_SOURCE_ANCHOR,
  JIKININKI_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/jikininki.js";
