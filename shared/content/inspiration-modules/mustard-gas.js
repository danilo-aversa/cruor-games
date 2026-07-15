import {
  buildCoreInspirationModuleFromCard,
  buildModuleExports,
} from "./inspiration-module.factory.js";

export const MUSTARD_GAS_SOURCE_ANCHOR_ID = "mustard-gas";
export const MUSTARD_GAS_INSPIRATION_CARD_DEFINITION = Object.freeze({
  sourceAnchorId: "mustard-gas",
  title: "Mustard Gas",
  icon: "fa-skull-crossbones",
  sourceType: "Weapon",
  caption:
    "Yellow vapor, burning lungs, blistered skin, delayed agony, contaminated cloth, and weaponized air.",
  logic:
    "A historical chemical weapon becomes delayed environmental horror: the air wounds first, and the body understands later.",
  card: Object.freeze({
    domain: "violence",
    obscurity: "familiar",
    collectionId: "existing-inspirations",
    collectionLabel: "Existing Inspirations",
    number: 4,
    description:
      "A chemical weapon whose horror lies in contamination, delayed injury, panic, and invisible spread. Unlike a visible blade or explosion, it attacks through air, skin, and breath, often continuing to harm after the initial release. Its disturbing force comes from helplessness: the victim may not immediately see the danger, may carry it with them, and may realize too late that the environment itself has become hostile. It turns space, atmosphere, and time into instruments of harm rather than neutral elements of the world.",
  }),
  imageNote: "Mustard Gas inspiration image.",
  imageKey: "card-mustard-gas.webp",
});

export const MUSTARD_GAS_INSPIRATION_MODULE =
  buildCoreInspirationModuleFromCard(MUSTARD_GAS_INSPIRATION_CARD_DEFINITION, {
    metadata: {
      source: "shared/content/inspiration-modules/mustard-gas.js",
    },
  });

const MUSTARD_GAS_MODULE_EXPORTS = buildModuleExports(
  MUSTARD_GAS_INSPIRATION_MODULE,
);

export const MUSTARD_GAS_SOURCE_ANCHOR =
  MUSTARD_GAS_MODULE_EXPORTS.sourceAnchor;
export const MUSTARD_GAS_INSPIRATION = MUSTARD_GAS_MODULE_EXPORTS.inspiration;
export const MUSTARD_GAS_MONSTER_GRAFT_COMPONENTS =
  MUSTARD_GAS_MODULE_EXPORTS.monsterGrafts;
export const MUSTARD_GAS_LOCATION_COMPONENTS =
  MUSTARD_GAS_MODULE_EXPORTS.locationComponents;
export const MUSTARD_GAS_LOCATION_REGION_COMPONENTS =
  MUSTARD_GAS_MODULE_EXPORTS.locationRegions;
export const MUSTARD_GAS_REFERENCED_SOURCE_ANCHORS =
  MUSTARD_GAS_MODULE_EXPORTS.referencedSourceAnchors;
