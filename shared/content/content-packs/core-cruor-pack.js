import { CONTENT_PACK_STATUS, createContentPack } from "../content-pack-schema.js";
import { SHARED_MONSTER_COMPONENTS } from "../monster-components.js";
import { DECOMPOSITION_SOURCE_ANCHOR_ID } from "../inspiration-modules/decomposition.js";
import { SEDLEC_OSSUARY_SOURCE_ANCHOR_ID } from "../inspiration-modules/sedlec-ossuary.js";
import { SHARED_SOURCE_ANCHORS } from "../source-anchors.js";
import { SHARED_TAXONOMIES } from "../taxonomies.js";
import { SHARED_DARKEN_LOCATION_SLOTS, SHARED_MONSTER_SLOTS, SHARED_WORKFLOWS } from "../workflows.js";

export const CORE_CRUOR_CONTENT_PACK_ID = "core-cruor";

const EXPLICIT_MODULE_SOURCE_ANCHOR_IDS = new Set([
  DECOMPOSITION_SOURCE_ANCHOR_ID,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
]);

function doesNotReferenceExplicitModule(entry) {
  return !(entry?.sourceAnchors || []).some((sourceAnchorId) =>
    EXPLICIT_MODULE_SOURCE_ANCHOR_IDS.has(sourceAnchorId),
  );
}

const CORE_SOURCE_ANCHORS = SHARED_SOURCE_ANCHORS.filter(
  (sourceAnchor) => !EXPLICIT_MODULE_SOURCE_ANCHOR_IDS.has(sourceAnchor.id),
);
const CORE_MONSTER_COMPONENTS = SHARED_MONSTER_COMPONENTS.filter(doesNotReferenceExplicitModule);

export const CORE_CRUOR_CONTENT_PACK = createContentPack({
  id: CORE_CRUOR_CONTENT_PACK_ID,
  title: "Core Cruor Content",
  summary:
    "Built-in Cruor MVP core pack containing the static workflows, Monster Composer slots, Source Anchors, taxonomies, and Monster Components currently bundled with the application.",
  version: "0.1.0",
  status: CONTENT_PACK_STATUS.PUBLISHED,
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: ["core", "static", "mvp"],
  updatedAt: "2026-05-29",
  metadata: {
    bundled: true,
    registryRole: "core",
    source: "static-registry",
    note: "Inspirations are provided by content packs. Explicit Inspiration Modules own their Source Anchors and generator components.",
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
