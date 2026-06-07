import { CONTENT_PACK_STATUS, createContentPack } from "../content-pack-schema.js";
import { CORE_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS } from "../inspiration-modules/core-inspiration-modules.js";
import { SHARED_MONSTER_COMPONENTS } from "../monster-components.js";
import { SHARED_SOURCE_ANCHORS } from "../source-anchors.js";
import { SHARED_TAXONOMIES } from "../taxonomies.js";
import { SHARED_DARKEN_LOCATION_SLOTS, SHARED_MONSTER_SLOTS, SHARED_WORKFLOWS } from "../workflows.js";

export const CORE_CRUOR_CONTENT_PACK_ID = "core-cruor";

const INSPIRATION_MODULE_SOURCE_ANCHOR_IDS = new Set(CORE_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS);

function doesNotReferenceInspirationModule(entry) {
  return !(entry?.sourceAnchors || []).some((sourceAnchorId) =>
    INSPIRATION_MODULE_SOURCE_ANCHOR_IDS.has(sourceAnchorId),
  );
}

const CORE_SOURCE_ANCHORS = SHARED_SOURCE_ANCHORS.filter(
  (sourceAnchor) => !INSPIRATION_MODULE_SOURCE_ANCHOR_IDS.has(sourceAnchor.id),
);
const CORE_MONSTER_COMPONENTS = SHARED_MONSTER_COMPONENTS.filter(doesNotReferenceInspirationModule);

export const CORE_CRUOR_CONTENT_PACK = createContentPack({
  id: CORE_CRUOR_CONTENT_PACK_ID,
  title: "Core Cruor Content",
  summary:
    "Built-in Cruor MVP core pack containing static workflows, slots, taxonomies, and any system-level components that are not owned by an Inspiration Module.",
  version: "0.2.0",
  status: CONTENT_PACK_STATUS.PUBLISHED,
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: ["core", "static", "mvp"],
  updatedAt: "2026-06-07",
  metadata: {
    bundled: true,
    registryRole: "core",
    source: "static-registry",
    note: "Source Anchors, public Inspiration cards, and source-linked components are now owned by Inspiration Module content packs.",
  },
  collections: {
    workflows: SHARED_WORKFLOWS,
    slots: [...SHARED_DARKEN_LOCATION_SLOTS, ...SHARED_MONSTER_SLOTS],
    components: CORE_MONSTER_COMPONENTS,
    sourceAnchors: CORE_SOURCE_ANCHORS,
    inspirations: [],
    taxonomies: SHARED_TAXONOMIES,
  },
});
