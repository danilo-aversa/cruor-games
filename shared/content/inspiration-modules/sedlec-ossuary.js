import {
  buildCoreInspirationModuleFromCard,
  buildModuleExports,
} from "./inspiration-module.factory.js";

export const SEDLEC_OSSUARY_SOURCE_ANCHOR_ID = "sedlec-ossuary";
export const SEDLEC_OSSUARY_INSPIRATION_MODULE_PACK_ID =
  "sedlec-ossuary-inspiration-module";
export const SEDLEC_OSSUARY_INSPIRATION_CARD_DEFINITION = Object.freeze({
  sourceAnchorId: "sedlec-ossuary",
  title: "Sedlec Ossuary",
  icon: "fa-church",
  sourceType: "Historical Site",
  caption:
    "Bone chandeliers, skull garlands, sacred ornament, anonymous dead, and devotional architecture made from remains.",
  logic:
    "The arrangement of human remains as sacred ornament becomes hostile architecture, devotional pressure, and evidence that the dead have been made decorative.",
  card: Object.freeze({
    domain: "place",
    obscurity: "uncommon",
    collectionId: "existing-inspirations",
    collectionLabel: "Existing Inspirations",
    number: 2,
    description:
      "A real ossuary chapel where bones become devotional ornament, geometry, and atmosphere. Human remains are arranged into chandeliers, wall patterns, and ceremonial structures, turning the dead into architecture without fully erasing their identity as bodies. Its power comes from the collision between sacred space, reverence, display, and the uncomfortable beauty of mortality made visible. It is disturbing precisely because it transforms remains into something ordered, meaningful, and almost majestic.",
  }),
  imageNote: "Sedlec Ossuary inspiration image.",
  imageKey: "card-sedlec-ossuary.webp",
});

export const SEDLEC_OSSUARY_INSPIRATION_MODULE =
  buildCoreInspirationModuleFromCard(
    SEDLEC_OSSUARY_INSPIRATION_CARD_DEFINITION,
    {
      metadata: {
        source: "shared/content/inspiration-modules/sedlec-ossuary.js",
      },
    },
  );

const SEDLEC_OSSUARY_MODULE_EXPORTS = buildModuleExports(
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
);

export const SEDLEC_OSSUARY_SOURCE_ANCHOR =
  SEDLEC_OSSUARY_MODULE_EXPORTS.sourceAnchor;
export const SEDLEC_OSSUARY_INSPIRATION =
  SEDLEC_OSSUARY_MODULE_EXPORTS.inspiration;
export const SEDLEC_OSSUARY_MONSTER_GRAFT_COMPONENTS =
  SEDLEC_OSSUARY_MODULE_EXPORTS.monsterGrafts;
export const SEDLEC_OSSUARY_LOCATION_COMPONENTS =
  SEDLEC_OSSUARY_MODULE_EXPORTS.locationComponents;
export const SEDLEC_OSSUARY_LOCATION_REGION_COMPONENTS =
  SEDLEC_OSSUARY_MODULE_EXPORTS.locationRegions;
export const SEDLEC_OSSUARY_REFERENCED_SOURCE_ANCHORS =
  SEDLEC_OSSUARY_MODULE_EXPORTS.referencedSourceAnchors;
