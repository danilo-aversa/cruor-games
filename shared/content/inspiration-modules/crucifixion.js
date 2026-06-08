import { buildCoreInspirationModuleFromCard, buildModuleExports } from "./inspiration-module.factory.js";

export const CRUCIFIXION_SOURCE_ANCHOR_ID = "crucifixion";
export const CRUCIFIXION_INSPIRATION_CARD_DEFINITION = Object.freeze({
    sourceAnchorId: "crucifixion",
    title: "Crucifixion",
    icon: "fa-cross",
    sourceType: "Punitive Practice",
    caption:
      "Raised bodies, nails, witnesses, public suffering, sacred shame, and pain turned into spectacle.",
    logic:
      "Public execution becomes religious pressure, transferred pain, witness guilt, and terrain that remembers displayed suffering.",
    imageNote: "Crucifixion inspiration image.",
    imageKey: "card-crucifixion.webp",
  });

export const CRUCIFIXION_INSPIRATION_MODULE = buildCoreInspirationModuleFromCard(
  CRUCIFIXION_INSPIRATION_CARD_DEFINITION,
  {
    metadata: {
      source: "shared/content/inspiration-modules/crucifixion.js",
    },
  },
);

const CRUCIFIXION_MODULE_EXPORTS = buildModuleExports(CRUCIFIXION_INSPIRATION_MODULE);

export const CRUCIFIXION_SOURCE_ANCHOR = CRUCIFIXION_MODULE_EXPORTS.sourceAnchor;
export const CRUCIFIXION_INSPIRATION = CRUCIFIXION_MODULE_EXPORTS.inspiration;
export const CRUCIFIXION_MONSTER_GRAFT_COMPONENTS = CRUCIFIXION_MODULE_EXPORTS.monsterGrafts;
export const CRUCIFIXION_LOCATION_COMPONENTS = CRUCIFIXION_MODULE_EXPORTS.locationComponents;
export const CRUCIFIXION_LOCATION_REGION_COMPONENTS = CRUCIFIXION_MODULE_EXPORTS.locationRegions;
export const CRUCIFIXION_REFERENCED_SOURCE_ANCHORS = CRUCIFIXION_MODULE_EXPORTS.referencedSourceAnchors;
