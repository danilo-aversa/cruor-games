import { describe, expect, it } from "vitest";
import {
  getComponentsForSlot,
  traceLocationComponentsForSlot,
} from "./location-composer-selectors.js";

const LOCATION_SLOT_IDS = [
  "horrorPremise",
  "sensoryLayer",
  "visibleAnomaly",
  "hazard",
  "clue",
  "encounterTwist",
  "reward",
];

const SEDLEC_STATE = Object.freeze({
  context: "Crypt",
  horrors: new Set(["Religious Horror"]),
  intrusion: "Medium",
  sourceAnchors: new Set(["Sedlec Ossuary"]),
});

const SEDLEC_EXPECTED_IDS = Object.freeze({
  horrorPremise: ["chapel-hungry", "bone-chapel-counts-the-dead", "places-premise-ossuary-litany-engine"],
  sensoryLayer: ["places-sense-bone-dust-breath", "places-sense-clicking-skull-seams"],
  visibleAnomaly: ["places-anomaly-prayer-slip-mortar"],
  hazard: ["altar-drinks", "places-hazard-weight-sermon-slab", "places-hazard-reliquary-tripwire"],
  clue: ["places-clue-miscounted-skull-row", "places-clue-bone-chandelier-map"],
  encounterTwist: ["skulls-turn-toward-confession", "places-twist-bonework-cover-lines", "places-twist-reliquary-alarm-choir"],
  reward: ["reliquary-of-the-unclaimed", "places-reward-counted-among-bones", "places-reward-reliquary-fragment-key"],
});

const SOURCE_EXPECTED_IDS = Object.freeze({
  "sedlec-ossuary": {
    horrorPremise: ["places-premise-ossuary-litany-engine"],
    sensoryLayer: ["places-sense-bone-dust-breath"],
    visibleAnomaly: ["places-anomaly-prayer-slip-mortar"],
    hazard: ["places-hazard-weight-sermon-slab"],
    clue: ["places-clue-miscounted-skull-row"],
    encounterTwist: ["places-twist-bonework-cover-lines"],
    reward: ["places-reward-counted-among-bones"],
  },
  decomposition: {
    horrorPremise: ["places-premise-breathing-burial"],
    sensoryLayer: ["places-sense-sweet-wet-lime"],
    visibleAnomaly: ["places-anomaly-grave-wax-bloom"],
    hazard: ["places-hazard-lime-pocket-collapse"],
    clue: ["places-clue-insect-free-corpse"],
    encounterTwist: ["places-twist-soft-floor-grapple"],
    reward: ["places-reward-grave-wax-seal"],
  },
  "the-mist": {
    horrorPremise: ["places-premise-white-wall-siege"],
    sensoryLayer: ["places-sense-distant-glass-tap"],
    visibleAnomaly: ["places-anomaly-handprint-in-mist"],
    hazard: ["places-hazard-white-out-step"],
    clue: ["places-clue-fog-shadow-delay"],
    encounterTwist: ["places-twist-mist-repositions-exits"],
    reward: ["places-reward-mist-safe-phrase"],
  },
  "wolf-spiders": {
    horrorPremise: ["places-premise-burdened-brood-warren"],
    sensoryLayer: ["places-sensory-many-pinpoint-eyes"],
    visibleAnomaly: ["places-anomaly-back-brood-effigy"],
    hazard: ["places-hazard-scattering-brood"],
    clue: ["places-clue-molted-eye-husks"],
    encounterTwist: ["places-twist-mother-guards-key"],
    reward: ["places-reward-brood-silk-marker"],
  },
  "towers-of-silence": {
    horrorPremise: ["places-premise-sun-judgment-court"],
    sensoryLayer: ["places-sense-high-carrion-shadow"],
    visibleAnomaly: ["places-anomaly-sun-ring-outline"],
    hazard: ["places-hazard-exposure-edge"],
    clue: ["places-clue-bird-path-scratch"],
    encounterTwist: ["places-twist-open-sky-no-privacy"],
    reward: ["places-reward-bird-shadow-warning"],
  },
  "mortuary-totems": {
    horrorPremise: ["places-premise-ancestor-boundary"],
    sensoryLayer: ["places-sense-old-wood-listening"],
    visibleAnomaly: ["places-anomaly-reversed-totem-face"],
    hazard: ["places-hazard-ancestor-snare"],
    clue: ["places-clue-totem-facing-order"],
    encounterTwist: ["places-twist-ancestor-facing-judgment"],
    reward: ["places-reward-ancestor-permission-token"],
  },
  "mustard-gas": {
    horrorPremise: ["places-premise-poisoned-airline"],
    sensoryLayer: ["places-sense-yellow-metal-air"],
    visibleAnomaly: ["places-anomaly-mask-filter-reliquary"],
    hazard: ["places-hazard-low-gas-sump"],
    clue: ["places-clue-mask-filter-name"],
    encounterTwist: ["places-twist-low-air-tactics"],
    reward: ["places-reward-clean-air-route"],
  },
  endocannibalism: {
    horrorPremise: ["places-premise-communion-of-ash"],
    sensoryLayer: ["places-sense-ash-on-tongue"],
    visibleAnomaly: ["places-anomaly-communion-bowl-residue"],
    hazard: ["places-hazard-feast-bench-lock"],
    clue: ["places-clue-ash-recipe-note"],
    encounterTwist: ["places-twist-feast-obligation"],
    reward: ["places-reward-shared-ash-memory"],
  },
  "genetic-mutations": {
    horrorPremise: ["places-premise-bloodline-correction"],
    sensoryLayer: ["places-sense-portrait-eye-strain"],
    visibleAnomaly: ["places-anomaly-corrected-portrait-hand"],
    hazard: ["places-hazard-corrective-nursery-wire"],
    clue: ["places-clue-family-trait-ledger"],
    encounterTwist: ["places-twist-inherited-weakness-display"],
    reward: ["places-reward-corrected-family-map"],
  },
  crucifixion: {
    horrorPremise: ["places-premise-witnessed-shame"],
    sensoryLayer: ["places-sense-splintered-prayer"],
    visibleAnomaly: ["places-anomaly-empty-cross-shadow"],
    hazard: ["places-hazard-splinter-gallows-beam"],
    clue: ["places-clue-clean-nail-hole"],
    encounterTwist: ["places-twist-witness-benches"],
    reward: ["places-reward-witness-pardon"],
  },
  impalement: {
    horrorPremise: ["places-premise-border-of-stakes"],
    sensoryLayer: ["places-sense-crow-air"],
    visibleAnomaly: ["places-anomaly-clean-empty-stake"],
    hazard: ["one-stake-empty"],
    clue: ["places-clue-nameless-iron-ring"],
    encounterTwist: ["places-twist-stake-line-chokepoint"],
    reward: ["places-reward-empty-stake-claim"],
  },
  "wax-death-masks": {
    horrorPremise: ["places-premise-mask-memory-house"],
    sensoryLayer: ["places-sensory-warm-wax-skin"],
    visibleAnomaly: ["places-anomaly-expression-mismatch"],
    hazard: ["places-hazard-melting-identity-seal"],
    clue: ["places-clue-fingerprint-in-wax-throat"],
    encounterTwist: ["places-twist-mask-remembers-last-room"],
    reward: ["places-reward-witness-face-impression"],
  },
  "anthropodermic-bibliopegy": {
    horrorPremise: ["places-premise-skinbound-archive"],
    sensoryLayer: ["places-sense-warm-paper-skin"],
    visibleAnomaly: ["places-anomaly-porous-book-spine"],
    hazard: ["places-hazard-skin-page-snap"],
    clue: ["places-clue-errata-in-skin"],
    encounterTwist: ["places-twist-bookcase-breathing-wall"],
    reward: ["places-reward-indexed-secret"],
  },
  jikininki: {
    horrorPremise: ["graveyard-eats-its-mourners"],
    sensoryLayer: ["chewing-below-the-prayers"],
    visibleAnomaly: ["grave-offerings-have-teeth-marks"],
    hazard: ["hunger-follows-the-name"],
    clue: ["mourner-eats-after-midnight"],
    encounterTwist: ["the-eater-weeps-first"],
    reward: ["bone-bowl-of-appeasement"],
  },
});

function summarizeTrace(trace, expectedIds = []) {
  return JSON.stringify({
    candidateIds: trace.candidates.map((component) => component.id),
    criteria: trace.criteria,
    exclusionCounts: Object.fromEntries(
      Object.entries(trace.exclusions).map(([reason, exclusions]) => [reason, exclusions.length]),
    ),
    expectedIds,
    slot: trace.slotId,
    stages: trace.stages.map((stage) => ({ count: stage.count, id: stage.id })),
  }, null, 2);
}

describe("Dark Places production picker feed", () => {
  it("keeps every Sedlec slot populated after the complete production filter chain", () => {
    LOCATION_SLOT_IDS.forEach((slotId) => {
      const trace = traceLocationComponentsForSlot(slotId, SEDLEC_STATE);
      const expectedIds = SEDLEC_EXPECTED_IDS[slotId];
      const diagnostic = summarizeTrace(trace, expectedIds);
      const candidateIds = trace.candidates.map((component) => component.id);

      expect(trace.candidates.length, diagnostic).toBeGreaterThan(0);
      expect(candidateIds, diagnostic).toEqual(expect.arrayContaining(expectedIds));
    });
  });

  it("resolves semantic-style ids and structured filter values like the legacy UI labels", () => {
    const semanticState = {
      context: { id: "crypt" },
      horrors: new Set([{ id: "religious-horror" }]),
      intrusion: { value: "medium" },
      sourceAnchors: new Set([{ sourceAnchorId: "sedlec-ossuary" }]),
    };

    LOCATION_SLOT_IDS.forEach((slotId) => {
      expect(
        getComponentsForSlot(slotId, semanticState).map((component) => component.id),
      ).toEqual(
        getComponentsForSlot(slotId, SEDLEC_STATE).map((component) => component.id),
      );
    });
  });

  it("attributes every exclusion to the filter stage that removed it", () => {
    LOCATION_SLOT_IDS.forEach((slotId) => {
      const trace = traceLocationComponentsForSlot(slotId, SEDLEC_STATE);
      const stages = Object.fromEntries(trace.stages.map((stage) => [stage.id, stage.count]));
      const diagnostic = summarizeTrace(trace, SEDLEC_EXPECTED_IDS[slotId]);

      expect(stages.registry - stages.context, diagnostic).toBe(trace.exclusions.context.length);
      expect(stages.context - stages.intrusion, diagnostic).toBe(trace.exclusions.intrusion.length);
      expect(stages.intrusion - stages.source, diagnostic).toBe(trace.exclusions.source.length);
      expect(stages.source - stages.horror, diagnostic).toBe(trace.exclusions.horror.length);
      expect(stages.limit, diagnostic).toBe(Math.min(16, stages.horror));
    });
  });

  it.each(Object.entries(SOURCE_EXPECTED_IDS))(
    "keeps the authored granular pools reachable for %s",
    (sourceAnchorId, expectedBySlot) => {
      const state = {
        context: "Any",
        horrors: [],
        intrusion: "Any",
        sourceAnchors: [sourceAnchorId],
      };

      Object.entries(expectedBySlot).forEach(([slotId, expectedIds]) => {
        const trace = traceLocationComponentsForSlot(slotId, state);
        const diagnostic = summarizeTrace(trace, expectedIds);
        const candidateIds = trace.candidates.map((component) => component.id);

        expect(trace.candidates.length, diagnostic).toBeGreaterThan(0);
        expect(candidateIds, diagnostic).toEqual(expect.arrayContaining(expectedIds));
      });

      const expectedEmptySlots = [];
      const unexpectedEmptySlots = LOCATION_SLOT_IDS.filter(
        (slotId) =>
          !expectedEmptySlots.includes(slotId) &&
          traceLocationComponentsForSlot(slotId, state).candidates.length === 0,
      );

      expect(unexpectedEmptySlots).toEqual([]);
      expectedEmptySlots.forEach((slotId) => {
        expect(traceLocationComponentsForSlot(slotId, state).candidates).toEqual([]);
      });
    },
  );
});
