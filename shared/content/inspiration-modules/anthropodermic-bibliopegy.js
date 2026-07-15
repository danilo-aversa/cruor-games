import {
  buildCoreInspirationModuleFromCard,
  buildModuleExports,
} from "./inspiration-module.factory.js";

export const ANTHROPODERMIC_BIBLIOPEGY_SOURCE_ANCHOR_ID =
  "anthropodermic-bibliopegy";
export const ANTHROPODERMIC_BIBLIOPEGY_INSPIRATION_CARD_DEFINITION =
  Object.freeze({
    sourceAnchorId: "anthropodermic-bibliopegy",
    title: "Anthropodermic Bibliopegy",
    icon: "fa-book-open",
    sourceType: "Historical Object",
    caption:
      "Skin-bound books, warm pages, birthmarks on leather, marginal scars, and archives that violate the body.",
    logic:
      "Human-bound books turn knowledge into bodily trespass: the archive reads the reader back.",
    card: Object.freeze({
      domain: "relic",
      obscurity: "esoteric",
      collectionId: "existing-inspirations",
      collectionLabel: "Existing Inspirations",
      number: 11,
      description:
        "Books bound in human skin collapse the distance between knowledge, ownership, and the body. The material may preserve pores, scars, or irregularities that reveal what polite cataloguing attempts to hide. Its horror comes from intimacy and institutional calm: a violated person can be transformed into an object, placed on a shelf, and handled as culture. It suggests archives built from bodies, texts that inherit the identity of their bindings, and scholarship sustained by concealed violence.",
    }),
    imageNote: "Anthropodermic Bibliopegy inspiration image.",
    imageKey: "card-anthropodermic-bibliopegy.webp",
  });

export const ANTHROPODERMIC_BIBLIOPEGY_INSPIRATION_MODULE =
  buildCoreInspirationModuleFromCard(
    ANTHROPODERMIC_BIBLIOPEGY_INSPIRATION_CARD_DEFINITION,
    {
      metadata: {
        source:
          "shared/content/inspiration-modules/anthropodermic-bibliopegy.js",
      },
    },
  );

const ANTHROPODERMIC_BIBLIOPEGY_MODULE_EXPORTS = buildModuleExports(
  ANTHROPODERMIC_BIBLIOPEGY_INSPIRATION_MODULE,
);

export const ANTHROPODERMIC_BIBLIOPEGY_SOURCE_ANCHOR =
  ANTHROPODERMIC_BIBLIOPEGY_MODULE_EXPORTS.sourceAnchor;
export const ANTHROPODERMIC_BIBLIOPEGY_INSPIRATION =
  ANTHROPODERMIC_BIBLIOPEGY_MODULE_EXPORTS.inspiration;
export const ANTHROPODERMIC_BIBLIOPEGY_MONSTER_GRAFT_COMPONENTS =
  ANTHROPODERMIC_BIBLIOPEGY_MODULE_EXPORTS.monsterGrafts;
export const ANTHROPODERMIC_BIBLIOPEGY_LOCATION_COMPONENTS =
  ANTHROPODERMIC_BIBLIOPEGY_MODULE_EXPORTS.locationComponents;
export const ANTHROPODERMIC_BIBLIOPEGY_LOCATION_REGION_COMPONENTS =
  ANTHROPODERMIC_BIBLIOPEGY_MODULE_EXPORTS.locationRegions;
export const ANTHROPODERMIC_BIBLIOPEGY_REFERENCED_SOURCE_ANCHORS =
  ANTHROPODERMIC_BIBLIOPEGY_MODULE_EXPORTS.referencedSourceAnchors;
