import {
  CONTENT_PACK_STATUS,
  createContentPack,
} from "../content-pack-schema.js";
import { modulesToRegistryCollections } from "../inspiration-module-schema.js";
import {
  THE_MIST_INSPIRATION_MODULE,
  THE_MIST_REFERENCED_SOURCE_ANCHORS,
} from "../inspiration-modules.js";
import {
  SHARED_DARKEN_LOCATION_SLOTS,
  SHARED_MONSTER_SLOTS,
  SHARED_WORKFLOWS,
} from "../workflows.js";

export const THE_MIST_INSPIRATION_MODULE_CONTENT_PACK_ID =
  "the-mist-inspiration-module";

function uniqueArray(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function getReferencedWorkflowIds(module = THE_MIST_INSPIRATION_MODULE) {
  return uniqueArray([
    ...(module.sourceAnchor?.workflows || []),
    ...(module.inspiration?.workflows || []),
    ...module.components.flatMap((component) => component.workflows || []),
  ]);
}

function getReferencedSlotIds(module = THE_MIST_INSPIRATION_MODULE) {
  return uniqueArray(
    module.components.flatMap((component) => component.slots || []),
  );
}

const MODULE_COLLECTIONS = modulesToRegistryCollections([
  THE_MIST_INSPIRATION_MODULE,
]);
const REFERENCED_WORKFLOW_IDS = new Set(getReferencedWorkflowIds());
const REFERENCED_SLOT_IDS = new Set(getReferencedSlotIds());

export const THE_MIST_INSPIRATION_MODULE_CONTENT_PACK = createContentPack({
  id: THE_MIST_INSPIRATION_MODULE_CONTENT_PACK_ID,
  title: "The Mist Inspiration Module",
  summary:
    "Inspiration Module bridge that preserves The Mist's public Archive card and linked legacy components while Studio consumes the canonical semantic v2 module.",
  version: "0.1.0",
  status: CONTENT_PACK_STATUS.PUBLISHED,
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: ["inspiration-module", "the-mist", "darken-location", "static"],
  updatedAt: "2026-07-17",
  metadata: {
    bundled: true,
    registryRole: "inspiration-module-v2-bridge",
    source: "shared/content/inspiration-modules/the-mist.js",
    primarySourceAnchorId: THE_MIST_INSPIRATION_MODULE.id,
  },
  collections: {
    workflows: SHARED_WORKFLOWS.filter((workflow) =>
      REFERENCED_WORKFLOW_IDS.has(workflow.id),
    ),
    slots: [...SHARED_DARKEN_LOCATION_SLOTS, ...SHARED_MONSTER_SLOTS].filter(
      (slot) => REFERENCED_SLOT_IDS.has(slot.id),
    ),
    components: MODULE_COLLECTIONS.components,
    sourceAnchors: THE_MIST_REFERENCED_SOURCE_ANCHORS,
    inspirations: MODULE_COLLECTIONS.inspirations,
    taxonomies: [],
  },
});
