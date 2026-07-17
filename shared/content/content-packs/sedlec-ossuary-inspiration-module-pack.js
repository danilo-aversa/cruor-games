import { CONTENT_PACK_STATUS, createContentPack } from "../content-pack-schema.js";
import { modulesToRegistryCollections } from "../inspiration-module-schema.js";
import {
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
  SEDLEC_OSSUARY_INSPIRATION_MODULE_PACK_ID,
  SEDLEC_OSSUARY_REFERENCED_SOURCE_ANCHORS,
} from "../inspiration-modules/sedlec-ossuary.js";
import { SHARED_DARKEN_LOCATION_SLOTS, SHARED_MONSTER_SLOTS, SHARED_WORKFLOWS } from "../workflows.js";

function uniqueArray(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function getReferencedWorkflowIds(module = SEDLEC_OSSUARY_INSPIRATION_MODULE) {
  return uniqueArray([
    ...(module.sourceAnchor?.workflows || []),
    ...(module.inspiration?.workflows || []),
    ...module.components.flatMap((component) => component.workflows || []),
  ]);
}

function getReferencedSlotIds(module = SEDLEC_OSSUARY_INSPIRATION_MODULE) {
  return uniqueArray(module.components.flatMap((component) => component.slots || []));
}

const MODULE_COLLECTIONS = modulesToRegistryCollections([SEDLEC_OSSUARY_INSPIRATION_MODULE]);
const REFERENCED_WORKFLOW_IDS = new Set(getReferencedWorkflowIds());
const REFERENCED_SLOT_IDS = new Set(getReferencedSlotIds());

export const SEDLEC_OSSUARY_INSPIRATION_MODULE_CONTENT_PACK = createContentPack({
  id: SEDLEC_OSSUARY_INSPIRATION_MODULE_PACK_ID,
  title: "Sedlec Ossuary Inspiration Module",
  summary:
    "Location-heavy Inspiration Module that owns the Sedlec Ossuary source anchor, public inspiration card, Darken components, and map region templates.",
  version: "0.1.0",
  status: CONTENT_PACK_STATUS.PUBLISHED,
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: ["inspiration-module", "pilot", "sedlec-ossuary", "darken-location", "map-generator", "static"],
  updatedAt: "2026-06-07",
  metadata: {
    bundled: true,
    registryRole: "inspiration-module-location-pilot",
    source: "shared/content/inspiration-modules/sedlec-ossuary.js",
    primarySourceAnchorId: SEDLEC_OSSUARY_INSPIRATION_MODULE.id,
  },
  collections: {
    workflows: SHARED_WORKFLOWS.filter((workflow) => REFERENCED_WORKFLOW_IDS.has(workflow.id)),
    slots: [...SHARED_DARKEN_LOCATION_SLOTS, ...SHARED_MONSTER_SLOTS].filter((slot) =>
      REFERENCED_SLOT_IDS.has(slot.id),
    ),
    components: MODULE_COLLECTIONS.components,
    sourceAnchors: SEDLEC_OSSUARY_REFERENCED_SOURCE_ANCHORS,
    inspirations: MODULE_COLLECTIONS.inspirations,
    taxonomies: [],
  },
});
