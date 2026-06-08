import { buildCoreInspirationModuleFromCard, buildModuleExports } from "./inspiration-module.factory.js";

export const TOWERS_OF_SILENCE_SOURCE_ANCHOR_ID = "towers-of-silence";
export const TOWERS_OF_SILENCE_INSPIRATION_CARD_DEFINITION = Object.freeze({
    sourceAnchorId: "towers-of-silence",
    title: "Towers of Silence",
    icon: "fa-tower-observation",
    sourceType: "Funerary Practice",
    caption:
      "Funerary exposure, sun, carrion birds, ritual purity, and bodies that refuse completion.",
    logic:
      "Funerary exposure becomes a vertical dungeon language of sun, carrion, judgment, ritual purity, and bodies that refuse completion.",
    imageNote: "Towers of Silence inspiration image.",
    imageKey: "card-tower-of-silence.webp",
  });

export const TOWERS_OF_SILENCE_INSPIRATION_MODULE = buildCoreInspirationModuleFromCard(
  TOWERS_OF_SILENCE_INSPIRATION_CARD_DEFINITION,
  {
    metadata: {
      source: "shared/content/inspiration-modules/towers-of-silence.js",
    },
  },
);

const TOWERS_OF_SILENCE_MODULE_EXPORTS = buildModuleExports(TOWERS_OF_SILENCE_INSPIRATION_MODULE);

export const TOWERS_OF_SILENCE_SOURCE_ANCHOR = TOWERS_OF_SILENCE_MODULE_EXPORTS.sourceAnchor;
export const TOWERS_OF_SILENCE_INSPIRATION = TOWERS_OF_SILENCE_MODULE_EXPORTS.inspiration;
export const TOWERS_OF_SILENCE_MONSTER_GRAFT_COMPONENTS = TOWERS_OF_SILENCE_MODULE_EXPORTS.monsterGrafts;
export const TOWERS_OF_SILENCE_LOCATION_COMPONENTS = TOWERS_OF_SILENCE_MODULE_EXPORTS.locationComponents;
export const TOWERS_OF_SILENCE_LOCATION_REGION_COMPONENTS = TOWERS_OF_SILENCE_MODULE_EXPORTS.locationRegions;
export const TOWERS_OF_SILENCE_REFERENCED_SOURCE_ANCHORS = TOWERS_OF_SILENCE_MODULE_EXPORTS.referencedSourceAnchors;
