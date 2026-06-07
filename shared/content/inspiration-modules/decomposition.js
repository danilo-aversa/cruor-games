import { SHARED_DARKEN_LOCATION_COMPONENTS } from "../adapters/darken-components.js";
import { SHARED_LOCATION_REGION_COMPONENTS } from "../adapters/location-regions.js";
import { defineInspirationModule, uniqueById } from "../inspiration-module-schema.js";
import { SHARED_INSPIRATIONS } from "../inspirations.js";
import { SHARED_MONSTER_COMPONENTS } from "../monster-components.js";
import { normalizeSourceAnchorIds, SHARED_SOURCE_ANCHORS } from "../source-anchors.js";

export const DECOMPOSITION_SOURCE_ANCHOR_ID = "decomposition";
export const DECOMPOSITION_INSPIRATION_MODULE_PACK_ID = "decomposition-inspiration-module";

function referencesSourceAnchor(entry, sourceAnchorId = DECOMPOSITION_SOURCE_ANCHOR_ID) {
  return normalizeSourceAnchorIds(entry?.sourceAnchors).includes(sourceAnchorId);
}

function getPrimarySourceAnchor(sourceAnchorId = DECOMPOSITION_SOURCE_ANCHOR_ID) {
  return SHARED_SOURCE_ANCHORS.find((sourceAnchor) => sourceAnchor.id === sourceAnchorId) || null;
}

function getPrimaryInspiration(sourceAnchorId = DECOMPOSITION_SOURCE_ANCHOR_ID) {
  return SHARED_INSPIRATIONS.find((inspiration) => referencesSourceAnchor(inspiration, sourceAnchorId)) || null;
}

export const DECOMPOSITION_SOURCE_ANCHOR = getPrimarySourceAnchor();
export const DECOMPOSITION_INSPIRATION = getPrimaryInspiration();
export const DECOMPOSITION_MONSTER_GRAFT_COMPONENTS = SHARED_MONSTER_COMPONENTS.filter((component) =>
  referencesSourceAnchor(component),
);
export const DECOMPOSITION_LOCATION_COMPONENTS = SHARED_DARKEN_LOCATION_COMPONENTS.filter((component) =>
  referencesSourceAnchor(component),
);
export const DECOMPOSITION_LOCATION_REGION_COMPONENTS = SHARED_LOCATION_REGION_COMPONENTS.filter((component) =>
  referencesSourceAnchor(component),
);

export const DECOMPOSITION_INSPIRATION_MODULE = defineInspirationModule({
  id: DECOMPOSITION_SOURCE_ANCHOR_ID,
  title: DECOMPOSITION_SOURCE_ANCHOR?.label || "Decomposition",
  status: DECOMPOSITION_SOURCE_ANCHOR?.status || "published",
  packId: DECOMPOSITION_INSPIRATION_MODULE_PACK_ID,
  sourceAnchor: DECOMPOSITION_SOURCE_ANCHOR,
  inspiration: DECOMPOSITION_INSPIRATION,
  components: [
    ...DECOMPOSITION_MONSTER_GRAFT_COMPONENTS,
    ...DECOMPOSITION_LOCATION_COMPONENTS,
    ...DECOMPOSITION_LOCATION_REGION_COMPONENTS,
  ],
  metadata: {
    moduleRole: "pilot",
    source: "decomposition-inspiration-module",
    generatedFrom: [
      "shared/content/source-anchors.js",
      "shared/content/inspirations.js",
      "shared/content/monster-components.js",
      "shared/content/adapters/darken-components.js",
      "shared/content/adapters/location-regions.js",
    ],
  },
});

export const DECOMPOSITION_REFERENCED_SOURCE_ANCHORS = uniqueById(
  [
    DECOMPOSITION_SOURCE_ANCHOR,
    ...DECOMPOSITION_INSPIRATION_MODULE.components
      .flatMap((component) => normalizeSourceAnchorIds(component.sourceAnchors))
      .map((sourceAnchorId) => getPrimarySourceAnchor(sourceAnchorId)),
  ].filter(Boolean),
);
