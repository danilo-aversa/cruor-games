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
import { DECOMPOSITION_SOURCE_ANCHOR_ID } from "./inspiration-modules/decomposition.js";
import {
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/sedlec-ossuary.js";
import { SHARED_INSPIRATIONS } from "./inspirations.js";
import { SHARED_MONSTER_COMPONENTS } from "./monster-components.js";
import { normalizeSourceAnchorIds, SHARED_SOURCE_ANCHORS } from "./source-anchors.js";

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

export const EXPLICIT_INSPIRATION_MODULES = Object.freeze([
  DECOMPOSITION_SEMANTIC_V2_MODULE,
  SEDLEC_OSSUARY_SEMANTIC_V2_MODULE,
].filter(Boolean));

export const EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS = Object.freeze([
  DECOMPOSITION_SOURCE_ANCHOR_ID,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
]);

export const EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET = new Set(
  EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS,
);

export const CONVERTED_CORE_INSPIRATION_MODULES = Object.freeze(
  CORE_INSPIRATION_MODULES.filter((module) => !EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET.has(module.id)),
);

/**
 * Canonical static Inspiration Module collection.
 *
 * This is the source consumed by Inspiration Studio. It keeps the explicit/standalone
 * modules first, then appends the converted archive modules. Registry-based module
 * generation remains available below only as a compatibility fallback for source
 * anchors that do not yet have an authored module.
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

export function buildInspirationModulesFromRegistry(registry, { packId = "static-registry" } = {}) {
  if (!registry) return CRUOR_INSPIRATION_MODULES;

  const generatedFallbackModules = buildInspirationModules({
    sourceAnchors: registry.sourceAnchors || [],
    inspirations: registry.inspirations || [],
    components: registry.components || [],
    packId,
    excludedSourceAnchorIds: CRUOR_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET,
  });

  return uniqueById([
    ...CRUOR_INSPIRATION_MODULES,
    ...generatedFallbackModules,
  ]);
}

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
