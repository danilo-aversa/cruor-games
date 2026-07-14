import { describe, expect, it } from "vitest";
import {
  DARK_PLACES_DOCUMENT_SCHEMA_VERSION,
  createLocationDocument,
} from "./location-document.js";

function createFixture() {
  const state = {
    workflow: "darken-location",
    title: "The Ossuary Below",
    context: "Crypt",
    horrors: ["Religious Horror"],
    sourceAnchors: ["Sedlec Ossuary"],
    intrusion: "Medium",
  };
  const digest = { filledSlots: 6, totalSlots: 7 };
  const roomSections = [
    {
      id: "region-entrance",
      region: {
        id: "region-entrance",
        name: "Bone-Lit Vestibule",
      },
      room: {
        id: "map-region-1",
        number: 1,
        level: 0,
        shape: "rect",
        cellRect: { x: 2, y: 3, w: 5, h: 4 },
      },
      roomNumber: 1,
      role: "Entrance",
      mapLabel: "Map Room 1",
      heading: "Room 1: Bone-Lit Vestibule",
      readAloud: "The doorway counts every visitor in bone-white clicks.",
      sensory: "Cold wax and chalk dust cling to the air.",
      feature: "A skull arch frames the inner passage.",
      danger: "The arch drops when a living name is spoken.",
      secret: "One skull bears a fresh inscription.",
      reward: "The hidden jaw contains a funerary key.",
      detailRows: [
        { label: "Interaction", value: "The skulls can be rotated to change the count." },
      ],
      components: [
        {
          id: "hazard-skull-arch",
          title: "Counting Arch",
          slotId: "hazard",
          slotLabel: "Environmental Hazard",
          regionId: "region-entrance",
          text: "The arch drops when a living name is spoken.",
          mechanics: "DC 14 Dexterity save.",
          counterplay: "Speak the name of one of the interred dead.",
          narrative: "Dustless hinges and a carved warning telegraph the drop.",
          location: { tableRole: "rules", hazardType: "trap" },
          sourceAnchors: ["Sedlec Ossuary"],
        },
        {
          id: "clue-fresh-inscription",
          title: "Fresh Inscription",
          slotId: "clue",
          slotLabel: "Disturbing Clue",
          regionId: "region-entrance",
          text: "The newest skull carries tomorrow's date.",
          mechanics: "The date predicts the next burial chosen by the cult.",
          narrative: "Use the date to point toward the ritual clock.",
          sourceAnchors: ["Sedlec Ossuary"],
        },
      ],
      placedComponents: [],
      completedSlotIds: ["hazard", "clue"],
      missingSlotIds: ["encounterTwist"],
      missingSlotLabels: ["Encounter Twist"],
      readinessStatus: "partial",
      readinessLabel: "Partial",
      readySlotCount: 2,
      readySlotTotal: 3,
    },
    {
      id: "region-reliquary",
      region: {
        id: "region-reliquary",
        name: "Sealed Reliquary",
      },
      room: {
        id: "map-region-2",
        number: 2,
        level: -1,
        shape: "circle",
      },
      roomNumber: 2,
      role: "Reward",
      mapLabel: "Map Room 2",
      heading: "Room 2: Sealed Reliquary",
      readAloud: "A round chamber waits below the stair, perfectly silent.",
      sensory: "The air is dry and metallic.",
      feature: "A reliquary hangs from three black chains.",
      danger: "—",
      secret: "—",
      reward: "The reliquary grants a blessing at a cost.",
      detailRows: [],
      components: [],
      placedComponents: [
        {
          id: "reward-blood-key",
          placementId: "placement-reward-blood-key",
          title: "Blood Key",
          slotId: "reward",
          slotLabel: "Reward / Consequence",
          regionId: "region-reliquary",
          text: "The key opens one sealed door and marks the bearer.",
          sourceAnchors: ["Sedlec Ossuary"],
          effect: {
            schemaVersion: "location-component-effect-v0.1",
            output: { gmFacingOnly: true },
          },
        },
      ],
      completedSlotIds: ["hazard", "clue", "encounterTwist"],
      missingSlotIds: [],
      missingSlotLabels: [],
      readinessStatus: "ready",
      readinessLabel: "Ready",
      readySlotCount: 3,
      readySlotTotal: 3,
    },
  ];
  const compilePreview = {
    title: state.title,
    locationPremiseText: "The crypt continues a prayer through arranged remains.",
    premiseSection: {
      premise: "The crypt continues a prayer through arranged remains.",
    },
    atTheTableRows: [
      { label: "Pressure", value: "The count rises whenever the party speaks a name." },
    ],
    componentSections: [
      {
        id: "premise-litany",
        title: "Litany Engine",
        slotId: "horrorPremise",
        slotLabel: "Location Premise",
        regionId: "",
        text: "The crypt continues a prayer through arranged remains.",
        sourceAnchors: ["Sedlec Ossuary"],
      },
      {
        id: "sensory-bone-clicks",
        title: "Bone Clicks",
        slotId: "sensoryLayer",
        slotLabel: "Sensory Layer",
        regionId: "",
        text: "Dry clicks travel from chamber to chamber.",
        sourceAnchors: ["Sedlec Ossuary"],
      },
    ],
    roomSections,
    regionSections: roomSections,
  };
  const mapRequest = {
    source: "dungeon-brief",
    workflow: "darken-location",
    seed: "ossuary-document",
    context: "Crypt",
    mapType: "Crypt",
    requiredRegions: [
      { id: "map-region-1", sourceRegionId: "region-entrance" },
      { id: "map-region-2", sourceRegionId: "region-reliquary" },
    ],
    connections: [
      {
        id: "edge-entrance-reliquary",
        from: "map-region-1",
        to: "map-region-2",
        kind: "main",
      },
    ],
  };
  const generatedMapPreview = {
    seed: "ossuary-document",
    bounds: { x: 0, y: 0, width: 1000, height: 640 },
    contentBounds: { x: 40, y: 40, width: 800, height: 520 },
    regions: roomSections.map((section) => section.room),
    corridors: [
      {
        id: "edge-entrance-reliquary",
        from: "map-region-1",
        to: "map-region-2",
        corridorType: "normal",
        fromLevel: 0,
        toLevel: -1,
        crossLevel: true,
        stairTransition: "stairs",
      },
    ],
  };

  return { state, digest, mapRequest, generatedMapPreview, compilePreview };
}

describe("dark places document adapter", () => {
  it("creates the canonical document identity and overview", () => {
    const document = createLocationDocument(createFixture());

    expect(document.schemaVersion).toBe(DARK_PLACES_DOCUMENT_SCHEMA_VERSION);
    expect(document.meta).toMatchObject({
      title: "The Ossuary Below",
      context: "Crypt",
      horror: ["Religious Horror"],
      sourceAnchors: ["Sedlec Ossuary"],
    });
    expect(document.overview.premise[0].kind).toBe("premise");
    expect(document.overview.sensory[0].text).toContain("Dry clicks");
    expect(document.overview.atTheTable[0]).toMatchObject({
      kind: "note",
      title: "Pressure",
      audience: "gm",
    });
  });

  it("separates room content into stable semantic sections without inventing mechanics", () => {
    const document = createLocationDocument(createFixture());
    const entrance = document.rooms[0];

    expect(entrance.readAloud[0]).toMatchObject({
      kind: "readAloud",
      audience: "both",
    });
    expect(entrance.immediateImpressions.features[0].text).toContain("skull arch");
    expect(entrance.immediateImpressions.interactions[0].text).toContain("rotated");
    expect(entrance.hazards).toHaveLength(1);
    expect(entrance.hazards[0]).toMatchObject({
      sourceComponentId: "hazard-skull-arch",
      subtype: "trap",
      mechanics: "DC 14 Dexterity save.",
      counterplay: "Speak the name of one of the interred dead.",
    });
    expect(entrance.hazards[0].facets.map((facet) => facet.id)).toEqual([
      "description",
      "resolution",
      "counterplay",
      "guidance",
    ]);
    expect(entrance.hazards[0].facets.find((facet) => facet.id === "resolution")?.text)
      .toBe("DC 14 Dexterity save.");
    expect(entrance.clues[0].text).toContain("tomorrow's date");
    expect(entrance.clues[0].facets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "observation", audience: "gm" }),
        expect.objectContaining({ id: "revelation", text: "The date predicts the next burial chosen by the cult." }),
        expect.objectContaining({ id: "guidance", text: "Use the date to point toward the ritual clock." }),
      ]),
    );
    expect(entrance.encounterTwists).toEqual([]);
    expect(entrance.secrets[0].audience).toBe("gm");
  });

  it("resolves canonical room connections and level transitions from the map", () => {
    const document = createLocationDocument(createFixture());

    expect(document.map.levels).toEqual([-1, 0]);
    expect(document.map.connections).toHaveLength(1);
    expect(document.map.connections[0]).toMatchObject({
      fromRoomId: "region-entrance",
      toRoomId: "region-reliquary",
      crossLevel: true,
      fromLevel: 0,
      toLevel: -1,
    });
    expect(document.rooms[0].connections[0]).toMatchObject({
      targetRoomId: "region-reliquary",
      targetRoomNumber: 2,
      targetRoomName: "Sealed Reliquary",
      levelDelta: -1,
    });
    expect(document.rooms[1].connections[0].levelDelta).toBe(1);
  });

  it("reports incomplete rooms without exposing internal sync diagnostics", () => {
    const document = createLocationDocument(createFixture());

    expect(document.readiness).toMatchObject({
      filledSlots: 6,
      totalSlots: 7,
      readyRooms: 1,
      complete: false,
    });
    expect(document.readiness.incompleteRooms).toEqual([
      {
        roomId: "region-entrance",
        roomNumber: 1,
        roomName: "Bone-Lit Vestibule",
        missingSlotIds: ["encounterTwist"],
        missingSlotLabels: ["Encounter Twist"],
      },
    ]);
    expect(document).not.toHaveProperty("mapSyncStatus");
  });
});
