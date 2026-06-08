import { buildCoreInspirationModuleFromCard, buildModuleExports } from "./inspiration-module.factory.js";

export const IMPALEMENT_SOURCE_ANCHOR_ID = "impalement";
export const IMPALEMENT_INSPIRATION_CARD_DEFINITION = Object.freeze({
    sourceAnchorId: "impalement",
    title: "Impalement",
    icon: "fa-thumbtack",
    sourceType: "Punitive Practice",
    caption:
      "Stakes, warning displays, border terror, tyrant justice, crows, and bodies made into signs.",
    logic:
      "Impalement becomes a landscape of warnings: authority, cruelty, borders, and bodies turned into signs.",
    imageNote: "Impalement inspiration image.",
    imageKey: "card-impalement.webp",
  });

export const IMPALEMENT_INSPIRATION_MODULE = buildCoreInspirationModuleFromCard(
  IMPALEMENT_INSPIRATION_CARD_DEFINITION,
  {
    metadata: {
      source: "shared/content/inspiration-modules/impalement.js",
    },
  },
);

const IMPALEMENT_MODULE_EXPORTS = buildModuleExports(IMPALEMENT_INSPIRATION_MODULE);

export const IMPALEMENT_SOURCE_ANCHOR = IMPALEMENT_MODULE_EXPORTS.sourceAnchor;
export const IMPALEMENT_INSPIRATION = IMPALEMENT_MODULE_EXPORTS.inspiration;
export const IMPALEMENT_MONSTER_GRAFT_COMPONENTS = IMPALEMENT_MODULE_EXPORTS.monsterGrafts;
export const IMPALEMENT_LOCATION_COMPONENTS = IMPALEMENT_MODULE_EXPORTS.locationComponents;
export const IMPALEMENT_LOCATION_REGION_COMPONENTS = IMPALEMENT_MODULE_EXPORTS.locationRegions;
export const IMPALEMENT_REFERENCED_SOURCE_ANCHORS = IMPALEMENT_MODULE_EXPORTS.referencedSourceAnchors;
