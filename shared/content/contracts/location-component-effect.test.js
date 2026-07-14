import { describe, expect, it } from "vitest";
import {
  LOCATION_COMPONENT_EFFECT_SCHEMA_VERSION,
  normalizeLocationComponentEffect,
} from "./location-component-effect.js";

describe("location component effect contract", () => {
  it("promotes visible anomalies into deterministic map placements", () => {
    const effect = normalizeLocationComponentEffect({
      id: "visible-anomaly-placement",
      title: "Visible Anomaly",
      slots: ["visibleAnomaly"],
      sourceAnchors: ["sedlec-ossuary"],
      location: {
        assignmentMode: "map",
        outputSection: "Visible Anomaly",
      },
    });

    expect(effect).toMatchObject({
      schemaVersion: LOCATION_COMPONENT_EFFECT_SCHEMA_VERSION,
      scope: "map",
      output: {
        sections: ["Visible Anomaly", "visibleAnomaly"],
      },
      placement: {
        strategy: "best-fit-room",
        cardinality: 1,
        preferredRoles: ["landmark", "climax", "discovery", "outcome", "reward", "ritual"],
        forbiddenRoles: ["service", "connector"],
        fallback: "output-only",
      },
      topology: {
        isSecretRoom: false,
      },
      render: {
        markerKind: "clue-marker",
        visualCue: "sedlec-ossuary",
        distribution: "single-room",
      },
      unsupportedPolicy: "output-only",
      provenance: {
        componentId: "visible-anomaly-placement",
        slotId: "visibleAnomaly",
        sourceAnchors: ["sedlec-ossuary"],
      },
      diagnostics: {
        mode: "procedural",
        authoredEffect: false,
        liftedContracts: [],
        warnings: [],
      },
    });
  });

  it("lifts existing room contracts without replacing them", () => {
    const effect = normalizeLocationComponentEffect({
      id: "hazard-central-pit",
      title: "Central Pit",
      slots: ["hazard"],
      location: {
        assignmentMode: "region",
        mapInfluence: {
          preferredRoomArchetypes: ["bone-well"],
          weight: 3,
        },
        roomDesign: {
          shape: { kind: "Round" },
          requiredProps: ["well"],
          topology: { secret: true },
        },
        roomCompatibility: {
          exclusiveGroups: ["Central Hazard"],
          conflictPolicy: "replace",
        },
      },
    });

    expect(effect.scope).toBe("region");
    expect(effect.placement.strategy).toBe("assigned-region");
    expect(effect.mapInfluence).toEqual({
      preferredRoomArchetypes: ["bone-well"],
      weight: 3,
    });
    expect(effect.roomDesign).toMatchObject({
      schemaVersion: "room-design-v0.1",
      shape: { kind: "circle" },
      props: {
        required: [{ kind: "pit", placement: "center" }],
      },
      topology: { secret: true },
    });
    expect(effect.roomCompatibility).toEqual({
      schemaVersion: "room-compatibility-v1",
      exclusiveGroups: ["central-hazard"],
      conflictPolicy: "replace",
    });
    expect(effect.topology.isSecretRoom).toBe(true);
    expect(effect.diagnostics).toMatchObject({
      mode: "procedural",
      liftedContracts: ["mapInfluence", "roomDesign", "roomCompatibility"],
      warnings: [],
    });
  });

  it("normalizes authored placement and never treats secret text as a topology flag", () => {
    const effect = normalizeLocationComponentEffect({
      id: "anomaly-marker",
      slots: ["visibleAnomaly"],
      location: {
        effect: {
          scope: "global",
          placement: {
            strategy: "best-fit",
            cardinality: 1,
            preferredRoles: ["Landmark"],
          },
          topology: {
            secret: "A sentence of clue text.",
          },
          render: {
            markerKind: "Anomaly Marker",
            visualCue: "ossuary",
            distribution: "single-room",
          },
          unsupportedPolicy: "warn",
        },
      },
    });

    expect(effect.scope).toBe("map");
    expect(effect.placement).toMatchObject({
      strategy: "best-fit-room",
      cardinality: 1,
      preferredRoles: ["Landmark"],
      fallback: "warn",
    });
    expect(effect.topology.isSecretRoom).toBe(false);
    expect(effect.render).toEqual({
      markerKind: "anomaly-marker",
      propKind: "",
      visualCue: "ossuary",
      distribution: "single-room",
    });
    expect(effect.unsupportedPolicy).toBe("warn");
    expect(effect.diagnostics).toMatchObject({
      mode: "procedural",
      authoredEffect: true,
      warnings: [],
    });
  });

  it("is idempotent after the effect has been normalized", () => {
    const first = normalizeLocationComponentEffect({
      id: "idempotent-effect",
      title: "Idempotent Effect",
      slots: ["clue"],
      location: {
        roomDesign: {
          topology: { branchBias: "terminal" },
        },
      },
    });
    const second = normalizeLocationComponentEffect(first);

    expect(second).toEqual(first);
  });

  it("defines procedural defaults for every Dark Places slot", () => {
    const premise = normalizeLocationComponentEffect({
      id: "premise",
      slots: ["horrorPremise"],
      sourceAnchors: ["the-mist"],
    });
    const sensory = normalizeLocationComponentEffect({
      id: "sensory",
      slots: ["sensoryLayer"],
    });
    const reward = normalizeLocationComponentEffect({
      id: "reward",
      slots: ["reward"],
    });
    const hazard = normalizeLocationComponentEffect({
      id: "hazard",
      slots: ["hazard"],
    });
    const clue = normalizeLocationComponentEffect({
      id: "clue",
      slots: ["clue"],
    });
    const twist = normalizeLocationComponentEffect({
      id: "twist",
      slots: ["encounterTwist"],
    });

    expect(premise).toMatchObject({
      scope: "map",
      placement: {
        strategy: "best-fit-room",
        preferredRoles: ["entrance", "threshold", "landmark", "ritual"],
      },
      render: { distribution: "single-room" },
    });
    expect(sensory).toMatchObject({
      scope: "map",
      placement: { strategy: "every-room", cardinality: 99 },
      render: { distribution: "every-room" },
    });
    expect(reward).toMatchObject({
      scope: "map",
      placement: { strategy: "best-fit-room" },
      render: { propKind: "chest", distribution: "single-room" },
    });
    expect(hazard).toMatchObject({
      scope: "region",
      placement: { strategy: "assigned-region" },
    });
    expect(clue).toMatchObject({
      scope: "region",
      placement: { strategy: "assigned-region" },
      render: { markerKind: "clue-marker" },
    });
    expect(twist).toMatchObject({
      scope: "region",
      placement: { strategy: "assigned-region" },
    });
  });

});
