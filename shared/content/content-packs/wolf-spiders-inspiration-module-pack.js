import {
  CONTENT_PACK_STATUS,
  createContentPack,
} from "../content-pack-schema.js";
import { modulesToRegistryCollections } from "../inspiration-module-schema.js";
import {
  WOLF_SPIDERS_INSPIRATION_MODULE,
  WOLF_SPIDERS_REFERENCED_SOURCE_ANCHORS,
} from "../inspiration-modules/wolf-spiders.js";
import {
  SHARED_DARKEN_LOCATION_SLOTS,
  SHARED_MONSTER_SLOTS,
  SHARED_WORKFLOWS,
} from "../workflows.js";

export const WOLF_SPIDERS_INSPIRATION_MODULE_CONTENT_PACK_ID =
  "wolf-spiders-inspiration-module";

function uniqueArray(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function getReferencedWorkflowIds(module = WOLF_SPIDERS_INSPIRATION_MODULE) {
  return uniqueArray([
    ...(module.sourceAnchor?.workflows || []),
    ...(module.inspiration?.workflows || []),
    ...module.components.flatMap((component) => component.workflows || []),
  ]);
}

function getReferencedSlotIds(module = WOLF_SPIDERS_INSPIRATION_MODULE) {
  return uniqueArray(
    module.components.flatMap((component) => component.slots || []),
  );
}

const MODULE_COLLECTIONS = modulesToRegistryCollections([
  WOLF_SPIDERS_INSPIRATION_MODULE,
]);
const REFERENCED_WORKFLOW_IDS = new Set(getReferencedWorkflowIds());
const REFERENCED_SLOT_IDS = new Set(getReferencedSlotIds());

export const WOLF_SPIDERS_INSPIRATION_MODULE_CONTENT_PACK = createContentPack({
  id: WOLF_SPIDERS_INSPIRATION_MODULE_CONTENT_PACK_ID,
  title: "Wolf Spiders Inspiration Module",
  summary:
    "Inspiration Module bridge that preserves the Wolf Spiders public Archive card and linked legacy components while Studio consumes the canonical semantic v2 module.",
  version: "0.1.0",
  status: CONTENT_PACK_STATUS.PUBLISHED,
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: [
    "inspiration-module",
    "wolf-spiders",
    "monster-composer",
    "darken-location",
    "static",
  ],
  updatedAt: "2026-07-17",
  metadata: {
    bundled: true,
    registryRole: "inspiration-module-v2-bridge",
    source: "shared/content/inspiration-modules/wolf-spiders.js",
    primarySourceAnchorId: WOLF_SPIDERS_INSPIRATION_MODULE.id,
  },
  collections: {
    workflows: SHARED_WORKFLOWS.filter((workflow) =>
      REFERENCED_WORKFLOW_IDS.has(workflow.id),
    ),
    slots: [...SHARED_DARKEN_LOCATION_SLOTS, ...SHARED_MONSTER_SLOTS].filter(
      (slot) => REFERENCED_SLOT_IDS.has(slot.id),
    ),
    components: MODULE_COLLECTIONS.components,
    sourceAnchors: WOLF_SPIDERS_REFERENCED_SOURCE_ANCHORS,
    inspirations: MODULE_COLLECTIONS.inspirations,
    taxonomies: [],
  },
});
