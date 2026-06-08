import { buildCoreInspirationModuleFromCard, buildModuleExports } from "./inspiration-module.factory.js";

export const JIKININKI_SOURCE_ANCHOR_ID = "jikininki";
export const JIKININKI_INSPIRATION_CARD_DEFINITION = Object.freeze({
    sourceAnchorId: "jikininki",
    title: "Jikininki",
    icon: "fa-skull",
    sourceType: "Yokai / Japanese Folklore",
    caption:
      "Corpse hunger, funerary taboo, shame, night feeding, opened graves, and cursed appetite after death.",
    logic:
      "A corpse-eating spirit becomes a toolkit for shame, failed funerary duty, hunger after death, and graveyard mysteries.",
    imageNote: "Jikininki inspiration image.",
    imageKey: "card-jikininki.webp",
  });

export const JIKININKI_INSPIRATION_MODULE = buildCoreInspirationModuleFromCard(
  JIKININKI_INSPIRATION_CARD_DEFINITION,
  {
    metadata: {
      source: "shared/content/inspiration-modules/jikininki.js",
    },
  },
);

const JIKININKI_MODULE_EXPORTS = buildModuleExports(JIKININKI_INSPIRATION_MODULE);

export const JIKININKI_SOURCE_ANCHOR = JIKININKI_MODULE_EXPORTS.sourceAnchor;
export const JIKININKI_INSPIRATION = JIKININKI_MODULE_EXPORTS.inspiration;
export const JIKININKI_MONSTER_GRAFT_COMPONENTS = JIKININKI_MODULE_EXPORTS.monsterGrafts;
export const JIKININKI_LOCATION_COMPONENTS = JIKININKI_MODULE_EXPORTS.locationComponents;
export const JIKININKI_LOCATION_REGION_COMPONENTS = JIKININKI_MODULE_EXPORTS.locationRegions;
export const JIKININKI_REFERENCED_SOURCE_ANCHORS = JIKININKI_MODULE_EXPORTS.referencedSourceAnchors;
