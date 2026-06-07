import { CONTENT_PACK_STATUS, createContentPack } from "../content-pack-schema.js";
import { SHARED_DARKEN_LOCATION_COMPONENTS } from "../adapters/darken-components.js";
import { DECOMPOSITION_SOURCE_ANCHOR_ID } from "../inspiration-modules/decomposition.js";
import { SHARED_LOCATION_REGION_COMPONENTS } from "../adapters/location-regions.js";
import { SHARED_SOURCE_ANCHORS } from "../source-anchors.js";
import { SHARED_DARKEN_LOCATION_SLOTS, SHARED_WORKFLOWS } from "../workflows.js";

export const LEGACY_DARKEN_LOCATION_CONTENT_PACK_ID = "legacy-darken-location";

function doesNotReferenceDecomposition(entry) {
  return !(entry?.sourceAnchors || []).includes(DECOMPOSITION_SOURCE_ANCHOR_ID);
}

const LEGACY_DARKEN_COMPONENTS = [
  ...SHARED_DARKEN_LOCATION_COMPONENTS,
  ...SHARED_LOCATION_REGION_COMPONENTS,
].filter(doesNotReferenceDecomposition);

function getReferencedSourceAnchors(components = LEGACY_DARKEN_COMPONENTS) {
  const sourceAnchorIds = new Set(
    components.flatMap((component) => component.sourceAnchors || []).filter(Boolean),
  );

  return SHARED_SOURCE_ANCHORS.filter((sourceAnchor) => sourceAnchorIds.has(sourceAnchor.id));
}

export const LEGACY_DARKEN_LOCATION_CONTENT_PACK = createContentPack({
  id: LEGACY_DARKEN_LOCATION_CONTENT_PACK_ID,
  title: "Legacy Darken Location Content",
  summary:
    "Registry-format adapter pack for the existing Darken a Location components and map region templates.",
  version: "0.1.0",
  status: CONTENT_PACK_STATUS.PUBLISHED,
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: ["darken-location", "map-generator", "legacy-adapter", "static"],
  updatedAt: "2026-06-07",
  metadata: {
    bundled: true,
    registryRole: "legacy-adapter",
    source: "features/crucible",
    canonicalWorkflow: "darken-location",
  },
  collections: {
    workflows: SHARED_WORKFLOWS.filter((workflow) =>
      ["darken-location", "map-generator"].includes(workflow.id),
    ),
    slots: SHARED_DARKEN_LOCATION_SLOTS,
    components: LEGACY_DARKEN_COMPONENTS,
    sourceAnchors: getReferencedSourceAnchors(),
    inspirations: [],
    taxonomies: [],
  },
});
