import { describe, expect, test } from "vitest";
import { createMapRequestFromDarkenLocationState } from "../darken-location.map-request.js";
import { createConfigFromNormalizedMapRequest } from "../map-generator/map-generator.input.js";
import { generateMap } from "../map-generator/map-generator.pipeline.js";
import {
  createInitialLocationComposerState,
  createLocationComposerSnapshot,
} from "../composer/model/location-composer-state.js";

function createSnapshot(region, overrides = {}) {
  return {
    workflow: "darken-location",
    title: "Pipeline Integrity",
    seed: "pipeline-integrity",
    context: "Crypt",
    slotAssignments: {},
    selectedComponents: [],
    locationRegions: [region],
    ...overrides,
  };
}

describe("Dark Places pipeline integrity", () => {
  test("keeps legacy clue copy without turning the room into a secret branch", () => {
    const request = createMapRequestFromDarkenLocationState(
      createSnapshot({
        id: "clue-room",
        name: "Witness Chamber",
        role: "Clue Room",
        tags: ["clue"],
        secret: "The wax face remembers the victim's final expression.",
      }),
    );

    const region = request.requiredRegions[0];
    const config = createConfigFromNormalizedMapRequest(request);

    expect(region.metadata.clue).toContain("wax face");
    expect(region.metadata.clueText).toContain("wax face");
    expect(region.isSecretRoom).toBe(false);
    expect(region.metadata.isSecretRoom).toBe(false);
    expect(region.metadata.secret).toBe(false);
    expect(config.regions[0].secret).toBe(false);
  });

  test("preserves an explicitly secret room as secret topology", () => {
    const request = createMapRequestFromDarkenLocationState(
      createSnapshot({
        id: "secret-room",
        name: "Hidden Reliquary",
        role: "Secret Room",
        clue: "A loose stone reveals the catch.",
        isSecretRoom: true,
      }),
    );

    const region = request.requiredRegions[0];
    const config = createConfigFromNormalizedMapRequest(request);

    expect(region.metadata.clue).toContain("loose stone");
    expect(region.isSecretRoom).toBe(true);
    expect(region.metadata.secret).toBe(true);
    expect(config.regions[0].secret).toBe(true);
  });

  test("rejects explicit contexts that the Map Generator does not support", () => {
    expect(() =>
      createMapRequestFromDarkenLocationState(
        createSnapshot(
          {
            id: "forest-room",
            name: "Thorn Clearing",
            role: "Entrance",
          },
          { context: "Forest" },
        ),
      ),
    ).toThrow(/does not support the "Forest" context yet/i);
  });

  test("carries manual map overrides through snapshot and Map Request", () => {
    const state = createInitialLocationComposerState([
      {
        id: "region-a",
        name: "Manual Chamber",
        role: "Entrance",
      },
    ]);
    state.mapManualOverrides = {
      roomPositions: {
        "region-a": { x: 12, y: 8 },
      },
      corridorWaypoints: {
        "corridor-a": [{ x: 4, y: 5 }],
      },
    };

    const snapshot = createLocationComposerSnapshot(state, []);
    const request = createMapRequestFromDarkenLocationState(snapshot);

    expect(snapshot.mapManualOverrides).toEqual(state.mapManualOverrides);
    expect(request.manualOverrides).toEqual(state.mapManualOverrides);
    expect(request.metadata.manualOverrides).toEqual(state.mapManualOverrides);
  });
  test("places a visible anomaly deterministically and renders it without changing topology", () => {
    const visibleAnomaly = {
      id: "ossuary-crown",
      title: "Ossuary Crown",
      slots: ["visibleAnomaly"],
      summary: "A crown of articulated bones hangs above the chamber.",
      tableText: "The crown turns to face whoever speaks first.",
      sourceAnchors: ["sedlec-ossuary"],
      location: { assignmentMode: "map" },
    };
    const snapshot = createSnapshot(
      {
        id: "entrance",
        name: "Threshold",
        role: "Entrance",
      },
      {
        locationRegions: [
          { id: "entrance", name: "Threshold", role: "Entrance" },
          { id: "service", name: "Storage Passage", role: "Service Connector" },
          { id: "landmark", name: "Crown Chapel", role: "Climax Landmark", size: "Large" },
        ],
        slotAssignments: {
          visibleAnomaly: [
            { componentId: visibleAnomaly.id, slotId: "visibleAnomaly", regionId: "" },
          ],
        },
        selectedComponents: [visibleAnomaly],
      },
    );

    const firstRequest = createMapRequestFromDarkenLocationState(snapshot);
    const secondRequest = createMapRequestFromDarkenLocationState(snapshot);
    const placement = firstRequest.componentPlacements[0];

    expect(firstRequest.componentPlacements).toEqual(secondRequest.componentPlacements);
    expect(firstRequest.componentPlacements).toHaveLength(1);
    expect(placement).toMatchObject({
      componentId: "ossuary-crown",
      slotId: "visibleAnomaly",
      sourceRegionId: "landmark",
      markerKind: "clue-marker",
    });
    expect(firstRequest.globalPalette.visual).toContain(visibleAnomaly.summary);

    const targetRegion = firstRequest.requiredRegions.find(
      (region) => region.sourceRegionId === placement.sourceRegionId,
    );
    expect(targetRegion.componentPlacements).toHaveLength(1);

    const config = createConfigFromNormalizedMapRequest(firstRequest);
    expect(config.globalPalette.visual).toContain(visibleAnomaly.summary);
    expect(
      config.regions.find((region) => region.sourceRegionId === "landmark")
        .componentPlacements,
    ).toHaveLength(1);

    const generatedMap = generateMap(config);
    expect(generatedMap.props).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "clue-marker",
          locationEffect: true,
          locationEffectComponentId: "ossuary-crown",
        }),
      ]),
    );

    const removedRequest = createMapRequestFromDarkenLocationState({
      ...snapshot,
      slotAssignments: {},
      selectedComponents: [],
    });
    expect(removedRequest.componentPlacements).toEqual([]);
  });


  test("applies the remaining Dark Places slots through placement, room data, rendering, and output metadata", () => {
    const components = [
      {
        id: "premise-bells",
        title: "The Bells Know Your Name",
        slots: ["horrorPremise"],
        summary: "The burial bells answer each visitor by name.",
        location: { assignmentMode: "map" },
      },
      {
        id: "sensory-cold-incense",
        title: "Cold Incense",
        slots: ["sensoryLayer"],
        summary: "Cold incense catches in the throat.",
        location: { assignmentMode: "map" },
      },
      {
        id: "reward-bone-key",
        title: "Bone Key",
        slots: ["reward"],
        summary: "A bone key opens the sealed family vault.",
        location: { assignmentMode: "map" },
      },
      {
        id: "hazard-falling-slab",
        title: "Falling Slab",
        slots: ["hazard"],
        summary: "A sermon slab falls when the central aisle is crossed.",
        location: { assignmentMode: "region" },
      },
      {
        id: "clue-missing-skull",
        title: "Missing Skull",
        slots: ["clue"],
        summary: "One numbered skull is missing from the ossuary row.",
        location: { assignmentMode: "region" },
      },
      {
        id: "twist-borrowed-voice",
        title: "Borrowed Voice",
        slots: ["encounterTwist"],
        summary: "The guardian speaks with the voice of a trusted ally.",
        location: { assignmentMode: "region" },
      },
    ];
    const snapshot = createSnapshot(
      { id: "entrance", name: "Bell Threshold", role: "Entrance Threshold" },
      {
        seed: "all-slot-effects",
        locationRegions: [
          { id: "entrance", name: "Bell Threshold", role: "Entrance Threshold" },
          { id: "pressure", name: "Sermon Nave", role: "Hazard Ritual Chamber" },
          { id: "outcome", name: "Sealed Reliquary", role: "Outcome Reward Vault" },
        ],
        slotAssignments: {
          horrorPremise: [{ componentId: "premise-bells", slotId: "horrorPremise", regionId: "" }],
          sensoryLayer: [{ componentId: "sensory-cold-incense", slotId: "sensoryLayer", regionId: "" }],
          reward: [{ componentId: "reward-bone-key", slotId: "reward", regionId: "" }],
          hazard: [{ componentId: "hazard-falling-slab", slotId: "hazard", regionId: "pressure" }],
          clue: [{ componentId: "clue-missing-skull", slotId: "clue", regionId: "pressure" }],
          encounterTwist: [{ componentId: "twist-borrowed-voice", slotId: "encounterTwist", regionId: "pressure" }],
        },
        selectedComponents: components,
      },
    );

    const request = createMapRequestFromDarkenLocationState(snapshot);
    const placementsBySlot = request.componentPlacements.reduce((groups, placement) => {
      groups[placement.slotId] = [...(groups[placement.slotId] || []), placement];
      return groups;
    }, {});

    expect(request.premise).toContain("burial bells");
    expect(placementsBySlot.horrorPremise).toHaveLength(1);
    expect(placementsBySlot.horrorPremise[0].sourceRegionId).toBe("entrance");
    expect(placementsBySlot.sensoryLayer).toHaveLength(3);
    expect(placementsBySlot.reward).toHaveLength(1);
    expect(placementsBySlot.reward[0]).toMatchObject({
      sourceRegionId: "outcome",
      propKind: "chest",
    });
    expect(placementsBySlot.hazard[0].sourceRegionId).toBe("pressure");
    expect(placementsBySlot.clue[0]).toMatchObject({
      sourceRegionId: "pressure",
      markerKind: "clue-marker",
    });
    expect(placementsBySlot.encounterTwist[0].sourceRegionId).toBe("pressure");

    const entrance = request.requiredRegions.find((region) => region.sourceRegionId === "entrance");
    const pressure = request.requiredRegions.find((region) => region.sourceRegionId === "pressure");
    const outcome = request.requiredRegions.find((region) => region.sourceRegionId === "outcome");

    expect(entrance.metadata.premise).toContain("burial bells");
    request.requiredRegions.forEach((region) => {
      expect(region.metadata.sensoryLayer).toContain("Cold incense");
    });
    expect(pressure.metadata.danger).toContain("sermon slab");
    expect(pressure.metadata.clueText).toContain("numbered skull");
    expect(pressure.metadata.encounter).toContain("trusted ally");
    expect(outcome.metadata.reward).toContain("bone key");
    expect(request.globalPalette.hazards).toContain(components[3].summary);
    expect(request.globalPalette.rewards).toContain(components[2].summary);

    const generatedMap = generateMap(createConfigFromNormalizedMapRequest(request));
    const locationEffectProps = generatedMap.props.filter((prop) => prop.locationEffect);
    expect(locationEffectProps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "chest",
          locationEffectComponentId: "reward-bone-key",
          locationEffectSlotId: "reward",
        }),
        expect.objectContaining({
          kind: "clue-marker",
          locationEffectComponentId: "clue-missing-skull",
          locationEffectSlotId: "clue",
        }),
      ]),
    );
    expect(locationEffectProps).toHaveLength(2);
  });

});
