import {
  buildCoreInspirationModuleFromCard,
  buildModuleExports,
} from "./inspiration-module.factory.js";

export const WOLF_SPIDERS_SOURCE_ANCHOR_ID = "wolf-spiders";
export const WOLF_SPIDERS_INSPIRATION_CARD_DEFINITION = Object.freeze({
  sourceAnchorId: "wolf-spiders",
  title: "Wolf Spiders",
  icon: "fa-spider",
  sourceType: "Animal Behavior",
  caption:
    "Eye shine, carried young, sudden scatter, ground hunting, maternal aggression, and bodies that are also nurseries.",
  logic:
    "Wolf spider behavior becomes horror about carried young, sudden dispersal, protective violence, and bodies that are also nurseries.",
  card: Object.freeze({
    domain: "body",
    obscurity: "uncommon",
    collectionId: "existing-inspirations",
    collectionLabel: "Existing Inspirations",
    number: 13,
    description:
      "Wolf spiders hunt across the ground rather than relying on webs, and females may carry an egg sac before transporting newly hatched young across their backs. The image is unsettling because one moving body can suddenly become many. Their horror comes from low visibility, reflected eyes, abrupt dispersal, and fierce maternal protection. They suggest creatures that are simultaneously predator, nursery, and swarm, with danger multiplying at the instant a single body is disturbed.",
  }),
  imageNote: "Wolf Spiders inspiration image.",
  imageKey: "card-wolf-spider.webp",
});

export const WOLF_SPIDERS_INSPIRATION_MODULE =
  buildCoreInspirationModuleFromCard(WOLF_SPIDERS_INSPIRATION_CARD_DEFINITION, {
    metadata: {
      source: "shared/content/inspiration-modules/wolf-spiders.js",
    },
  });

const WOLF_SPIDERS_MODULE_EXPORTS = buildModuleExports(
  WOLF_SPIDERS_INSPIRATION_MODULE,
);

export const WOLF_SPIDERS_SOURCE_ANCHOR =
  WOLF_SPIDERS_MODULE_EXPORTS.sourceAnchor;
export const WOLF_SPIDERS_INSPIRATION = WOLF_SPIDERS_MODULE_EXPORTS.inspiration;
export const WOLF_SPIDERS_MONSTER_GRAFT_COMPONENTS =
  WOLF_SPIDERS_MODULE_EXPORTS.monsterGrafts;
export const WOLF_SPIDERS_LOCATION_COMPONENTS =
  WOLF_SPIDERS_MODULE_EXPORTS.locationComponents;
export const WOLF_SPIDERS_LOCATION_REGION_COMPONENTS =
  WOLF_SPIDERS_MODULE_EXPORTS.locationRegions;
export const WOLF_SPIDERS_REFERENCED_SOURCE_ANCHORS =
  WOLF_SPIDERS_MODULE_EXPORTS.referencedSourceAnchors;
