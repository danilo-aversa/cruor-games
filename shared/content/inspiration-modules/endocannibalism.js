import {
  buildCoreInspirationModuleFromCard,
  buildModuleExports,
} from "./inspiration-module.factory.js";

export const ENDOCANNIBALISM_SOURCE_ANCHOR_ID = "endocannibalism";
export const ENDOCANNIBALISM_INSPIRATION_CARD_DEFINITION = Object.freeze({
  sourceAnchorId: "endocannibalism",
  title: "Endocannibalism",
  icon: "fa-bowl-food",
  sourceType: "Funerary Practice",
  caption:
    "Ancestral incorporation, grief made physical, taboo communion, inherited memory, and hunger inside the family line.",
  logic:
    "Ritual incorporation becomes dark fantasy inheritance: the dead are remembered because they are physically carried inside the living.",
  card: Object.freeze({
    domain: "rite",
    obscurity: "uncommon",
    collectionId: "existing-inspirations",
    collectionLabel: "Existing Inspirations",
    number: 6,
    description:
      "A funerary practice in which members of a community consume parts of their own dead as an act of mourning, continuity, or ancestral incorporation. Its disturbing force comes from the collision between intimacy and taboo: remembrance becomes physical, grief enters the body, and the boundary between survivor and deceased is deliberately dissolved. It suggests inheritance that is literal rather than symbolic, along with memories, obligations, or corruption carried inside a family line.",
  }),
  imageNote: "Endocannibalism inspiration image.",
  imageKey: "card-endocannibalism.webp",
});

export const ENDOCANNIBALISM_INSPIRATION_MODULE =
  buildCoreInspirationModuleFromCard(
    ENDOCANNIBALISM_INSPIRATION_CARD_DEFINITION,
    {
      metadata: {
        source: "shared/content/inspiration-modules/endocannibalism.js",
      },
    },
  );

const ENDOCANNIBALISM_MODULE_EXPORTS = buildModuleExports(
  ENDOCANNIBALISM_INSPIRATION_MODULE,
);

export const ENDOCANNIBALISM_SOURCE_ANCHOR =
  ENDOCANNIBALISM_MODULE_EXPORTS.sourceAnchor;
export const ENDOCANNIBALISM_INSPIRATION =
  ENDOCANNIBALISM_MODULE_EXPORTS.inspiration;
export const ENDOCANNIBALISM_MONSTER_GRAFT_COMPONENTS =
  ENDOCANNIBALISM_MODULE_EXPORTS.monsterGrafts;
export const ENDOCANNIBALISM_LOCATION_COMPONENTS =
  ENDOCANNIBALISM_MODULE_EXPORTS.locationComponents;
export const ENDOCANNIBALISM_LOCATION_REGION_COMPONENTS =
  ENDOCANNIBALISM_MODULE_EXPORTS.locationRegions;
export const ENDOCANNIBALISM_REFERENCED_SOURCE_ANCHORS =
  ENDOCANNIBALISM_MODULE_EXPORTS.referencedSourceAnchors;
