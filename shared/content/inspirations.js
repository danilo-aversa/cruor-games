import {
  CORE_INSPIRATION_CARD_DEFINITIONS,
  CORE_INSPIRATION_MODULE_INSPIRATIONS,
  buildCoreInspirationFromCard,
} from "./inspiration-modules/core-inspiration-modules.js";

export function inspirationCardToSharedInspiration(card) {
  return buildCoreInspirationFromCard(card);
}

export function buildSharedInspirations(cards = CORE_INSPIRATION_CARD_DEFINITIONS) {
  return cards.map(inspirationCardToSharedInspiration);
}

export const SHARED_INSPIRATIONS = CORE_INSPIRATION_MODULE_INSPIRATIONS;
