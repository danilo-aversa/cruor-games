import {
  buildCoreInspirationModuleFromCard,
  buildModuleExports,
} from "./inspiration-module.factory.js";

export const WAX_DEATH_MASKS_SOURCE_ANCHOR_ID = "wax-death-masks";
export const WAX_DEATH_MASKS_INSPIRATION_CARD_DEFINITION = Object.freeze({
  sourceAnchorId: "wax-death-masks",
  title: "Wax Death Masks",
  icon: "fa-masks-theater",
  sourceType: "Historical Object",
  caption:
    "Preserved expressions, melting likenesses, false ancestors, copied identity, and faces that remember the dead.",
  logic:
    "A preserved face becomes a portable identity, a false witness, and a relic that remembers expressions better than the living do.",
  card: Object.freeze({
    domain: "relic",
    obscurity: "uncommon",
    collectionId: "existing-inspirations",
    collectionLabel: "Existing Inspirations",
    number: 10,
    description:
      "Wax impressions preserving the likeness of the dead, between memorial, relic, and imitation of life. They retain the face with uncanny fidelity, creating an object that feels intimate and funerary at once. Their disturbing quality comes from suspended identity: the mask is not the person, but it preserves enough of the person to feel like a trace, a substitute, or a body that has become object. The result is a presence that feels both tender and unsettling, as if memory itself had been given a skin.",
  }),
  imageNote: "Wax Death Masks inspiration image.",
  imageKey: "card-wax-death-mask.webp",
});

export const WAX_DEATH_MASKS_INSPIRATION_MODULE =
  buildCoreInspirationModuleFromCard(
    WAX_DEATH_MASKS_INSPIRATION_CARD_DEFINITION,
    {
      metadata: {
        source: "shared/content/inspiration-modules/wax-death-masks.js",
      },
    },
  );

const WAX_DEATH_MASKS_MODULE_EXPORTS = buildModuleExports(
  WAX_DEATH_MASKS_INSPIRATION_MODULE,
);

export const WAX_DEATH_MASKS_SOURCE_ANCHOR =
  WAX_DEATH_MASKS_MODULE_EXPORTS.sourceAnchor;
export const WAX_DEATH_MASKS_INSPIRATION =
  WAX_DEATH_MASKS_MODULE_EXPORTS.inspiration;
export const WAX_DEATH_MASKS_MONSTER_GRAFT_COMPONENTS =
  WAX_DEATH_MASKS_MODULE_EXPORTS.monsterGrafts;
export const WAX_DEATH_MASKS_LOCATION_COMPONENTS =
  WAX_DEATH_MASKS_MODULE_EXPORTS.locationComponents;
export const WAX_DEATH_MASKS_LOCATION_REGION_COMPONENTS =
  WAX_DEATH_MASKS_MODULE_EXPORTS.locationRegions;
export const WAX_DEATH_MASKS_REFERENCED_SOURCE_ANCHORS =
  WAX_DEATH_MASKS_MODULE_EXPORTS.referencedSourceAnchors;
