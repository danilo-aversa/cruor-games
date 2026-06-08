import { buildCoreInspirationModuleFromCard, buildModuleExports } from "./inspiration-module.factory.js";

export const MORTUARY_TOTEMS_SOURCE_ANCHOR_ID = "mortuary-totems";
export const MORTUARY_TOTEMS_INSPIRATION_CARD_DEFINITION = Object.freeze({
    sourceAnchorId: "mortuary-totems",
    title: "Mortuary Totems",
    icon: "fa-monument",
    sourceType: "Funerary Practice",
    caption:
      "Carved memorial guardians, ancestral faces, taboo boundaries, and wood that remembers names and blood.",
    logic:
      "Memorial carving and ancestral guardianship become boundaries that watch, remember blood, and punish trespass without becoming a generic fantasy stereotype.",
    imageNote: "Funerary pole / carved ancestor placeholder.",
    imageKey: "card-mortuary-totem-pole.webp",
  });

export const MORTUARY_TOTEMS_INSPIRATION_MODULE = buildCoreInspirationModuleFromCard(
  MORTUARY_TOTEMS_INSPIRATION_CARD_DEFINITION,
  {
    metadata: {
      source: "shared/content/inspiration-modules/mortuary-totems.js",
    },
  },
);

const MORTUARY_TOTEMS_MODULE_EXPORTS = buildModuleExports(MORTUARY_TOTEMS_INSPIRATION_MODULE);

export const MORTUARY_TOTEMS_SOURCE_ANCHOR = MORTUARY_TOTEMS_MODULE_EXPORTS.sourceAnchor;
export const MORTUARY_TOTEMS_INSPIRATION = MORTUARY_TOTEMS_MODULE_EXPORTS.inspiration;
export const MORTUARY_TOTEMS_MONSTER_GRAFT_COMPONENTS = MORTUARY_TOTEMS_MODULE_EXPORTS.monsterGrafts;
export const MORTUARY_TOTEMS_LOCATION_COMPONENTS = MORTUARY_TOTEMS_MODULE_EXPORTS.locationComponents;
export const MORTUARY_TOTEMS_LOCATION_REGION_COMPONENTS = MORTUARY_TOTEMS_MODULE_EXPORTS.locationRegions;
export const MORTUARY_TOTEMS_REFERENCED_SOURCE_ANCHORS = MORTUARY_TOTEMS_MODULE_EXPORTS.referencedSourceAnchors;
