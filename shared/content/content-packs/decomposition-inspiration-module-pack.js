import { CONTENT_PACK_STATUS, createContentPack } from "../content-pack-schema.js";
import {
  DECOMPOSITION_INSPIRATION_MODULE,
  DECOMPOSITION_INSPIRATION_MODULE_PACK_ID,
  DECOMPOSITION_REFERENCED_SOURCE_ANCHORS,
} from "../inspiration-modules.js";
import { modulesToRegistryCollections } from "../inspiration-module-schema.js";
import { SHARED_DARKEN_LOCATION_SLOTS, SHARED_MONSTER_SLOTS, SHARED_WORKFLOWS } from "../workflows.js";

function uniqueArray(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function getReferencedWorkflowIds(module = DECOMPOSITION_INSPIRATION_MODULE) {
  return uniqueArray([
    ...(module.sourceAnchor?.workflows || []),
    ...(module.inspiration?.workflows || []),
    ...module.components.flatMap((component) => component.workflows || []),
  ]);
}

function getReferencedSlotIds(module = DECOMPOSITION_INSPIRATION_MODULE) {
  return uniqueArray(module.components.flatMap((component) => component.slots || []));
}

const MODULE_COLLECTIONS = modulesToRegistryCollections([DECOMPOSITION_INSPIRATION_MODULE]);
const REFERENCED_WORKFLOW_IDS = new Set(getReferencedWorkflowIds());
const REFERENCED_SLOT_IDS = new Set(getReferencedSlotIds());

export const DECOMPOSITION_INSPIRATION_MODULE_CONTENT_PACK = createContentPack({
  id: DECOMPOSITION_INSPIRATION_MODULE_PACK_ID,
  title: "Decomposition Inspiration Module",
  summary:
    "Pilot Inspiration Module that owns the Decomposition source anchor, public inspiration card, monster grafts, Darken components, and map region templates.",
  version: "0.1.0",
  status: CONTENT_PACK_STATUS.PUBLISHED,
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: ["inspiration-module", "pilot", "decomposition", "static"],
  updatedAt: "2026-06-07",
  metadata: {
    bundled: true,
    registryRole: "inspiration-module-pilot",
    source: "shared/content/inspiration-modules/decomposition.js",
    primarySourceAnchorId: DECOMPOSITION_INSPIRATION_MODULE.id,
  },
  collections: {
    workflows: SHARED_WORKFLOWS.filter((workflow) => REFERENCED_WORKFLOW_IDS.has(workflow.id)),
    slots: [...SHARED_DARKEN_LOCATION_SLOTS, ...SHARED_MONSTER_SLOTS].filter((slot) =>
      REFERENCED_SLOT_IDS.has(slot.id),
    ),
    components: MODULE_COLLECTIONS.components,
    sourceAnchors: DECOMPOSITION_REFERENCED_SOURCE_ANCHORS,
    inspirations: MODULE_COLLECTIONS.inspirations,
    taxonomies: [],
  },
});
