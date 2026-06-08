import { CONTENT_PACK_STATUS, createContentPack } from "../content-pack-schema.js";
import { modulesToRegistryCollections, uniqueById } from "../inspiration-module-schema.js";
import {
  CORE_INSPIRATION_MODULE_PACK_ID,
} from "../inspiration-modules/core-inspiration-modules.js";
import { CONVERTED_CORE_INSPIRATION_MODULES } from "../inspiration-modules.js";
import { normalizeSourceAnchorIds, SHARED_SOURCE_ANCHORS } from "../source-anchors.js";
import { SHARED_DARKEN_LOCATION_SLOTS, SHARED_MONSTER_SLOTS, SHARED_WORKFLOWS } from "../workflows.js";

export const EXISTING_INSPIRATIONS_CONTENT_PACK_ID = CORE_INSPIRATION_MODULE_PACK_ID;

export const EXISTING_INSPIRATION_MODULES = CONVERTED_CORE_INSPIRATION_MODULES;

function uniqueArray(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function getReferencedWorkflowIds(modules = EXISTING_INSPIRATION_MODULES) {
  return uniqueArray(
    modules.flatMap((module) => [
      ...(module.sourceAnchor?.workflows || []),
      ...(module.inspiration?.workflows || []),
      ...module.components.flatMap((component) => component.workflows || []),
    ]),
  );
}

function getReferencedSlotIds(modules = EXISTING_INSPIRATION_MODULES) {
  return uniqueArray(modules.flatMap((module) => module.components.flatMap((component) => component.slots || [])));
}

function getReferencedSourceAnchors(modules = EXISTING_INSPIRATION_MODULES) {
  const sourceAnchorById = new Map(SHARED_SOURCE_ANCHORS.map((sourceAnchor) => [sourceAnchor.id, sourceAnchor]));
  const sourceAnchorIds = new Set(
    modules.flatMap((module) => [
      module.sourceAnchor?.id,
      ...(module.inspiration?.sourceAnchors || []),
      ...module.components.flatMap((component) => normalizeSourceAnchorIds(component.sourceAnchors)),
    ]).filter(Boolean),
  );

  return uniqueById([...sourceAnchorIds].map((sourceAnchorId) => sourceAnchorById.get(sourceAnchorId)).filter(Boolean));
}

const MODULE_COLLECTIONS = modulesToRegistryCollections(EXISTING_INSPIRATION_MODULES);
const REFERENCED_WORKFLOW_IDS = new Set(getReferencedWorkflowIds());
const REFERENCED_SLOT_IDS = new Set(getReferencedSlotIds());

export const EXISTING_INSPIRATIONS_CONTENT_PACK = createContentPack({
  id: EXISTING_INSPIRATIONS_CONTENT_PACK_ID,
  title: "Existing Inspiration Modules",
  summary:
    "Converted Inspiration Modules for the existing Cruor source archive. Each module owns its Source Anchor, public Inspiration card, and linked reusable components.",
  version: "0.2.0",
  status: CONTENT_PACK_STATUS.PUBLISHED,
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: ["inspiration-module", "converted", "archive", "source-anchors"],
  updatedAt: "2026-06-07",
  metadata: {
    bundled: true,
    registryRole: "converted-inspiration-modules",
    source: "shared/content/inspiration-modules/*.js",
    migratedFrom: "legacy-inspirations-archive",
  },
  collections: {
    workflows: SHARED_WORKFLOWS.filter((workflow) => REFERENCED_WORKFLOW_IDS.has(workflow.id)),
    slots: [...SHARED_DARKEN_LOCATION_SLOTS, ...SHARED_MONSTER_SLOTS].filter((slot) =>
      REFERENCED_SLOT_IDS.has(slot.id),
    ),
    components: MODULE_COLLECTIONS.components,
    sourceAnchors: getReferencedSourceAnchors(),
    inspirations: MODULE_COLLECTIONS.inspirations,
    taxonomies: [],
  },
});
