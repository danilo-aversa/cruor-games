import { CONTENT_PACK_STATUS, createContentPack } from "../content-pack-schema.js";
import { DECOMPOSITION_SOURCE_ANCHOR_ID } from "../inspiration-modules/decomposition.js";
import { SEDLEC_OSSUARY_SOURCE_ANCHOR_ID } from "../inspiration-modules/sedlec-ossuary.js";
import { SHARED_INSPIRATIONS } from "../inspirations.js";
import { SHARED_SOURCE_ANCHORS } from "../source-anchors.js";
import { SHARED_WORKFLOWS } from "../workflows.js";

export const EXISTING_INSPIRATIONS_CONTENT_PACK_ID = "existing-inspirations";

const EXPLICIT_MODULE_SOURCE_ANCHOR_IDS = new Set([
  DECOMPOSITION_SOURCE_ANCHOR_ID,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
]);

const EXISTING_ARCHIVE_INSPIRATIONS = SHARED_INSPIRATIONS.filter(
  (inspiration) => !(inspiration.sourceAnchors || []).some((sourceAnchorId) =>
    EXPLICIT_MODULE_SOURCE_ANCHOR_IDS.has(sourceAnchorId),
  ),
);

function getReferencedSourceAnchors(inspirations = EXISTING_ARCHIVE_INSPIRATIONS) {
  const sourceAnchorIds = new Set(
    inspirations.flatMap((inspiration) => inspiration.sourceAnchors || []).filter(Boolean)
  );

  return SHARED_SOURCE_ANCHORS.filter((sourceAnchor) => sourceAnchorIds.has(sourceAnchor.id));
}

export const EXISTING_INSPIRATIONS_CONTENT_PACK = createContentPack({
  id: EXISTING_INSPIRATIONS_CONTENT_PACK_ID,
  title: "Existing Inspirations Archive",
  summary:
    "Pilot content pack containing the current Inspiration Archive cards and their linked Source Anchors.",
  version: "0.1.0",
  status: CONTENT_PACK_STATUS.PUBLISHED,
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: ["pilot", "inspirations", "archive", "source-anchors"],
  updatedAt: "2026-05-29",
  metadata: {
    bundled: true,
    registryRole: "content-pack-pilot",
    source: "legacy-inspirations-archive",
  },
  collections: {
    workflows: SHARED_WORKFLOWS.filter((workflow) => workflow.id === "inspiration-archive"),
    slots: [],
    components: [],
    sourceAnchors: getReferencedSourceAnchors(),
    inspirations: EXISTING_ARCHIVE_INSPIRATIONS,
    taxonomies: [],
  },
});
