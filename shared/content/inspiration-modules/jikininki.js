import {
  buildCoreInspirationModuleFromCard,
  buildModuleExports,
} from "./inspiration-module.factory.js";

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
  card: Object.freeze({
    domain: "tale",
    obscurity: "esoteric",
    collectionId: "existing-inspirations",
    collectionLabel: "Existing Inspirations",
    number: 14,
    description:
      "A corpse-eating spirit tied to failed funerary duty, shame, and hunger that survives death. It is not simply a ghost of appetite, but a figure of moral corruption: a dead being condemned to feed on corpses because it betrayed sacred obligations to the dead. The horror lies in the mix of ritual failure, pollution, secrecy, and the idea that even burial cannot protect a body from desecration. It suggests a world in which neglect of the dead leaves a wound that keeps feeding long after death itself.",
  }),
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

const JIKININKI_MODULE_EXPORTS = buildModuleExports(
  JIKININKI_INSPIRATION_MODULE,
);

export const JIKININKI_SOURCE_ANCHOR = JIKININKI_MODULE_EXPORTS.sourceAnchor;
export const JIKININKI_INSPIRATION = JIKININKI_MODULE_EXPORTS.inspiration;
export const JIKININKI_MONSTER_GRAFT_COMPONENTS =
  JIKININKI_MODULE_EXPORTS.monsterGrafts;
export const JIKININKI_LOCATION_COMPONENTS =
  JIKININKI_MODULE_EXPORTS.locationComponents;
export const JIKININKI_LOCATION_REGION_COMPONENTS =
  JIKININKI_MODULE_EXPORTS.locationRegions;
export const JIKININKI_REFERENCED_SOURCE_ANCHORS =
  JIKININKI_MODULE_EXPORTS.referencedSourceAnchors;
