import { buildCoreInspirationModuleFromCard, buildModuleExports } from "./inspiration-module.factory.js";

export const GENETIC_MUTATIONS_SOURCE_ANCHOR_ID = "genetic-mutations";
export const GENETIC_MUTATIONS_INSPIRATION_CARD_DEFINITION = Object.freeze({
    sourceAnchorId: "genetic-mutations",
    title: "Genetic Mutations",
    icon: "fa-dna",
    sourceType: "Medical / Genetic Concept",
    caption:
      "Heritable corruption, recessive horror, repeated traits, unstable inheritance, and bodies that remember bloodlines.",
    logic:
      "Mutation and inheritance become family horror, visible lineage, unstable bodies, and the terror of what blood remembers.",
    imageNote: "Mutation inspiration image.",
    imageKey: "card-mutations.webp",
  });

export const GENETIC_MUTATIONS_INSPIRATION_MODULE = buildCoreInspirationModuleFromCard(
  GENETIC_MUTATIONS_INSPIRATION_CARD_DEFINITION,
  {
    metadata: {
      source: "shared/content/inspiration-modules/genetic-mutations.js",
    },
  },
);

const GENETIC_MUTATIONS_MODULE_EXPORTS = buildModuleExports(GENETIC_MUTATIONS_INSPIRATION_MODULE);

export const GENETIC_MUTATIONS_SOURCE_ANCHOR = GENETIC_MUTATIONS_MODULE_EXPORTS.sourceAnchor;
export const GENETIC_MUTATIONS_INSPIRATION = GENETIC_MUTATIONS_MODULE_EXPORTS.inspiration;
export const GENETIC_MUTATIONS_MONSTER_GRAFT_COMPONENTS = GENETIC_MUTATIONS_MODULE_EXPORTS.monsterGrafts;
export const GENETIC_MUTATIONS_LOCATION_COMPONENTS = GENETIC_MUTATIONS_MODULE_EXPORTS.locationComponents;
export const GENETIC_MUTATIONS_LOCATION_REGION_COMPONENTS = GENETIC_MUTATIONS_MODULE_EXPORTS.locationRegions;
export const GENETIC_MUTATIONS_REFERENCED_SOURCE_ANCHORS = GENETIC_MUTATIONS_MODULE_EXPORTS.referencedSourceAnchors;
