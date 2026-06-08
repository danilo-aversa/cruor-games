import { buildCoreInspirationModuleFromCard, buildModuleExports } from "./inspiration-module.factory.js";

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
    imageNote: "Endocannibalism inspiration image.",
    imageKey: "card-endocannibalism.webp",
  });

export const ENDOCANNIBALISM_INSPIRATION_MODULE = buildCoreInspirationModuleFromCard(
  ENDOCANNIBALISM_INSPIRATION_CARD_DEFINITION,
  {
    metadata: {
      source: "shared/content/inspiration-modules/endocannibalism.js",
    },
  },
);

const ENDOCANNIBALISM_MODULE_EXPORTS = buildModuleExports(ENDOCANNIBALISM_INSPIRATION_MODULE);

export const ENDOCANNIBALISM_SOURCE_ANCHOR = ENDOCANNIBALISM_MODULE_EXPORTS.sourceAnchor;
export const ENDOCANNIBALISM_INSPIRATION = ENDOCANNIBALISM_MODULE_EXPORTS.inspiration;
export const ENDOCANNIBALISM_MONSTER_GRAFT_COMPONENTS = ENDOCANNIBALISM_MODULE_EXPORTS.monsterGrafts;
export const ENDOCANNIBALISM_LOCATION_COMPONENTS = ENDOCANNIBALISM_MODULE_EXPORTS.locationComponents;
export const ENDOCANNIBALISM_LOCATION_REGION_COMPONENTS = ENDOCANNIBALISM_MODULE_EXPORTS.locationRegions;
export const ENDOCANNIBALISM_REFERENCED_SOURCE_ANCHORS = ENDOCANNIBALISM_MODULE_EXPORTS.referencedSourceAnchors;
