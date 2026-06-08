import { buildCoreInspirationModuleFromCard, buildModuleExports } from "./inspiration-module.factory.js";

export const DECOMPOSITION_SOURCE_ANCHOR_ID = "decomposition";
export const DECOMPOSITION_INSPIRATION_MODULE_PACK_ID = "decomposition-inspiration-module";
export const DECOMPOSITION_INSPIRATION_CARD_DEFINITION = Object.freeze({
    sourceAnchorId: "decomposition",
    title: "Decomposition",
    icon: "fa-biohazard",
    sourceType: "Biological Process",
    caption:
      "Forensic decay, gases, bloating, grave wax, insects, skin slippage, and the strange timeline after death.",
    logic:
      "Biological decay becomes pressure, evidence, transformation, contamination, and time out of joint.",
    imageNote: "Decomposition inspiration image.",
    imageKey: "card-decomposition.webp",
  });

export const DECOMPOSITION_INSPIRATION_MODULE = buildCoreInspirationModuleFromCard(
  DECOMPOSITION_INSPIRATION_CARD_DEFINITION,
  {
    metadata: {
      source: "shared/content/inspiration-modules/decomposition.js",
    },
  },
);

const DECOMPOSITION_MODULE_EXPORTS = buildModuleExports(DECOMPOSITION_INSPIRATION_MODULE);

export const DECOMPOSITION_SOURCE_ANCHOR = DECOMPOSITION_MODULE_EXPORTS.sourceAnchor;
export const DECOMPOSITION_INSPIRATION = DECOMPOSITION_MODULE_EXPORTS.inspiration;
export const DECOMPOSITION_MONSTER_GRAFT_COMPONENTS = DECOMPOSITION_MODULE_EXPORTS.monsterGrafts;
export const DECOMPOSITION_LOCATION_COMPONENTS = DECOMPOSITION_MODULE_EXPORTS.locationComponents;
export const DECOMPOSITION_LOCATION_REGION_COMPONENTS = DECOMPOSITION_MODULE_EXPORTS.locationRegions;
export const DECOMPOSITION_REFERENCED_SOURCE_ANCHORS = DECOMPOSITION_MODULE_EXPORTS.referencedSourceAnchors;
