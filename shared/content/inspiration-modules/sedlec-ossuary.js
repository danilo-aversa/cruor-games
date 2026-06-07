import { SHARED_DARKEN_LOCATION_COMPONENTS } from "../adapters/darken-components.js";
import { SHARED_LOCATION_REGION_COMPONENTS } from "../adapters/location-regions.js";
import { defineInspirationModule, uniqueById } from "../inspiration-module-schema.js";
import { SHARED_INSPIRATIONS } from "../inspirations.js";
import { SHARED_MONSTER_COMPONENTS } from "../monster-components.js";
import { normalizeSourceAnchorIds, SHARED_SOURCE_ANCHORS } from "../source-anchors.js";

export const SEDLEC_OSSUARY_SOURCE_ANCHOR_ID = "sedlec-ossuary";
export const SEDLEC_OSSUARY_INSPIRATION_MODULE_PACK_ID = "sedlec-ossuary-inspiration-module";

function referencesSourceAnchor(entry, sourceAnchorId = SEDLEC_OSSUARY_SOURCE_ANCHOR_ID) {
  return normalizeSourceAnchorIds(entry?.sourceAnchors).includes(sourceAnchorId);
}

function getPrimarySourceAnchor(sourceAnchorId = SEDLEC_OSSUARY_SOURCE_ANCHOR_ID) {
  return SHARED_SOURCE_ANCHORS.find((sourceAnchor) => sourceAnchor.id === sourceAnchorId) || null;
}

function getPrimaryInspiration(sourceAnchorId = SEDLEC_OSSUARY_SOURCE_ANCHOR_ID) {
  return SHARED_INSPIRATIONS.find((inspiration) => referencesSourceAnchor(inspiration, sourceAnchorId)) || null;
}

export const SEDLEC_OSSUARY_SOURCE_ANCHOR = getPrimarySourceAnchor();
export const SEDLEC_OSSUARY_INSPIRATION = getPrimaryInspiration();
export const SEDLEC_OSSUARY_MONSTER_GRAFT_COMPONENTS = SHARED_MONSTER_COMPONENTS.filter((component) =>
  referencesSourceAnchor(component),
);
export const SEDLEC_OSSUARY_LOCATION_COMPONENTS = SHARED_DARKEN_LOCATION_COMPONENTS.filter((component) =>
  referencesSourceAnchor(component),
);
export const SEDLEC_OSSUARY_LOCATION_REGION_COMPONENTS = SHARED_LOCATION_REGION_COMPONENTS.filter((component) =>
  referencesSourceAnchor(component),
);

export const SEDLEC_OSSUARY_INSPIRATION_MODULE = defineInspirationModule({
  id: SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
  title: SEDLEC_OSSUARY_SOURCE_ANCHOR?.label || "Sedlec Ossuary",
  status: SEDLEC_OSSUARY_SOURCE_ANCHOR?.status || "draft",
  packId: SEDLEC_OSSUARY_INSPIRATION_MODULE_PACK_ID,
  sourceAnchor: SEDLEC_OSSUARY_SOURCE_ANCHOR,
  inspiration: SEDLEC_OSSUARY_INSPIRATION,
  components: [
    ...SEDLEC_OSSUARY_MONSTER_GRAFT_COMPONENTS,
    ...SEDLEC_OSSUARY_LOCATION_COMPONENTS,
    ...SEDLEC_OSSUARY_LOCATION_REGION_COMPONENTS,
  ],
  metadata: {
    moduleRole: "location-map-pilot",
    source: "sedlec-ossuary-inspiration-module",
    generatedFrom: [
      "shared/content/source-anchors.js",
      "shared/content/inspirations.js",
      "shared/content/monster-components.js",
      "shared/content/adapters/darken-components.js",
      "shared/content/adapters/location-regions.js",
    ],
  },
});

export const SEDLEC_OSSUARY_REFERENCED_SOURCE_ANCHORS = uniqueById(
  [
    SEDLEC_OSSUARY_SOURCE_ANCHOR,
    ...SEDLEC_OSSUARY_INSPIRATION_MODULE.components
      .flatMap((component) => normalizeSourceAnchorIds(component.sourceAnchors))
      .map((sourceAnchorId) => getPrimarySourceAnchor(sourceAnchorId)),
  ].filter(Boolean),
);
