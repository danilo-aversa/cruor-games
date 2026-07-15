import {
  buildCoreInspirationModuleFromCard,
  buildModuleExports,
} from "./inspiration-module.factory.js";

export const THE_MIST_SOURCE_ANCHOR_ID = "the-mist";
export const THE_MIST_INSPIRATION_CARD_DEFINITION = Object.freeze({
  sourceAnchorId: "the-mist",
  title: "The Mist",
  icon: "fa-smog",
  sourceType: "Literary Inspiration",
  caption:
    "Fog as predatory enclosure: collapsed distance, muffled voices, false silhouettes, and things hidden by whiteout.",
  logic:
    "Mist becomes an enclosure that collapses distance, hides impossible life, and turns survival into a visibility problem.",
  card: Object.freeze({
    domain: "tale",
    obscurity: "familiar",
    collectionId: "existing-inspirations",
    collectionLabel: "Existing Inspirations",
    number: 5,
    description:
      "A wall of mist removes distance, orientation, and reliable sight without appearing solid. Familiar roads shorten or vanish, voices lose their sources, and silhouettes become impossible to judge until they are close enough to matter. Its horror comes from uncertainty rather than direct attack: the environment refuses to confirm what is present, how far away it is, or whether escape is still possible. It turns visibility into a scarce resource and makes every step an act of commitment.",
  }),
  imageNote: "The Mist inspiration image.",
  imageKey: "card-the-mist.webp",
});

export const THE_MIST_INSPIRATION_MODULE = buildCoreInspirationModuleFromCard(
  THE_MIST_INSPIRATION_CARD_DEFINITION,
  {
    metadata: {
      source: "shared/content/inspiration-modules/the-mist.js",
    },
  },
);

const THE_MIST_MODULE_EXPORTS = buildModuleExports(THE_MIST_INSPIRATION_MODULE);

export const THE_MIST_SOURCE_ANCHOR = THE_MIST_MODULE_EXPORTS.sourceAnchor;
export const THE_MIST_INSPIRATION = THE_MIST_MODULE_EXPORTS.inspiration;
export const THE_MIST_MONSTER_GRAFT_COMPONENTS =
  THE_MIST_MODULE_EXPORTS.monsterGrafts;
export const THE_MIST_LOCATION_COMPONENTS =
  THE_MIST_MODULE_EXPORTS.locationComponents;
export const THE_MIST_LOCATION_REGION_COMPONENTS =
  THE_MIST_MODULE_EXPORTS.locationRegions;
export const THE_MIST_REFERENCED_SOURCE_ANCHORS =
  THE_MIST_MODULE_EXPORTS.referencedSourceAnchors;
