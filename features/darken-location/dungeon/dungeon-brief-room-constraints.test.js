import { describe, expect, test } from "vitest";
import { legacyDarkenComponentToSharedComponent } from "../../../shared/content/adapters/darken-components.js";
import { createMapRequestFromDarkenLocationState } from "../darken-location.map-request.js";
import { createConfigFromNormalizedMapRequest } from "../map-generator/map-generator.input.js";
import { generateMap } from "../map-generator/map-generator.pipeline.js";
import { DUNGEON_BRIEF_SCHEMA_VERSION } from "./dungeon-brief.js";
import { createLocationRegionsFromDungeonBrief } from "./dungeon-brief-generator.js";

function createSnapshot(selectedComponents) {
  return {
    workflow: "darken-location",
    title: "Room Constraint Handoff",
    seed: "room-constraint-handoff",
    context: "Crypt",
    slotAssignments: {
      hazard: [
        {
          componentId: selectedComponents[0].id,
          slotId: "hazard",
          regionId: "region-a",
        },
      ],
      clue: [
        {
          componentId: selectedComponents[1].id,
          slotId: "clue",
          regionId: "region-a",
        },
      ],
    },
    selectedComponents,
    locationRegions: [
      {
        id: "region-a",
        name: "Constraint Chamber",
        role: "Clue Room",
        shape: "rect",
        size: "Medium",
      },
    ],
  };
}

function createCompatibleComponents() {
  return [
    {
      id: "hazard-circular-pit",
      title: "Circular Pit",
      tags: ["hazard", "pit"],
      location: {
        roomDesign: {
          shape: { kind: "circle", modifiers: ["central-void"] },
          size: { minWidthCells: 7, minAreaCells: 30 },
          props: {
            required: [{ kind: "pit", placement: "center" }],
          },
          topology: { branchBias: "terminal" },
        },
      },
    },
    {
      id: "clue-pillared-altar",
      title: "Pillared Altar",
      tags: ["clue", "altar"],
      location: {
        roomDesign: {
          shape: { kind: "circle", modifiers: ["pillared"] },
          size: { minHeightCells: 6 },
          props: {
            required: [{ kind: "altar", placement: "center" }],
          },
          topology: { secret: true },
        },
      },
    },
  ];
}

describe("Dungeon Brief room constraint handoff", () => {
  test("resolves multiple component roomDesign contributions without losing fields", () => {
    const request = createMapRequestFromDarkenLocationState(
      createSnapshot(createCompatibleComponents()),
    );
    const region = request.requiredRegions[0];
    const design = region.effectiveRoomDesign;
    const resolution = region.roomConstraintResolution;

    expect(request.dungeonBrief.schemaVersion).toBe(
      DUNGEON_BRIEF_SCHEMA_VERSION,
    );
    expect(design).toEqual(region.roomDesign);
    expect(design.shape.kind).toBe("circle");
    expect(design.size).toMatchObject({
      minWidthCells: 7,
      minHeightCells: 6,
      minAreaCells: 30,
    });
    expect(design.shape.modifiers).toEqual(["central-void", "pillared"]);
    expect(design.props.required.map((prop) => prop.kind)).toEqual([
      "altar",
      "pit",
    ]);
    expect(design.topology).toMatchObject({
      branchBias: "terminal",
      secret: true,
    });

    expect(resolution.schemaVersion).toBe("room-constraint-resolution-v1");
    expect(resolution.status).toBe("transforms-room");
    expect(resolution.conflicts).toEqual([]);
    expect(resolution.diagnostics.sourceIds).toEqual([
      "clue-pillared-altar",
      "hazard-circular-pit",
      "region-a",
    ]);
    expect(
      resolution.provenance["shape.kind"].map((item) => item.sourceId),
    ).toEqual(["clue-pillared-altar", "hazard-circular-pit"]);

    expect(region.metadata.effectiveRoomDesign).toEqual(design);
    expect(region.metadata.roomConstraintResolution).toEqual(resolution);
    expect(request.metadata.roomConstraintResolutions).toEqual([
      {
        regionId: region.id,
        sourceRegionId: "region-a",
        roomBriefId: region.metadata.roomBriefId,
        resolution,
      },
    ]);
  });

  test("carries the effective design through normalized map config and generation", () => {
    const request = createMapRequestFromDarkenLocationState(
      createSnapshot(createCompatibleComponents()),
    );
    const config = createConfigFromNormalizedMapRequest(request);
    const generatedMap = generateMap(config);
    const generatedRegion = generatedMap.regions.find(
      (region) => region.sourceRegionId === "region-a",
    );

    expect(config.regions[0].roomDesign).toEqual(
      request.requiredRegions[0].effectiveRoomDesign,
    );
    expect(generatedRegion?.shape).toBe("circle");
    expect(
      generatedMap.props.some(
        (prop) =>
          prop.regionId === generatedRegion?.id &&
          prop.kind === "pit" &&
          prop.roomDesignRequired,
      ),
    ).toBe(true);
    expect(
      generatedMap.props.some(
        (prop) =>
          prop.regionId === generatedRegion?.id &&
          prop.kind === "altar" &&
          prop.roomDesignRequired,
      ),
    ).toBe(true);
  });

  test("reports incompatible hard shapes instead of silently overwriting one", () => {
    const components = createCompatibleComponents();
    components[1] = {
      ...components[1],
      location: {
        roomDesign: {
          shape: { kind: "l-shape" },
        },
      },
    };

    const request = createMapRequestFromDarkenLocationState(
      createSnapshot(components),
    );
    const region = request.requiredRegions[0];

    expect(region.effectiveRoomDesign?.shape?.kind).toBeUndefined();
    expect(region.roomDesign?.shape?.kind).toBeUndefined();
    expect(region.roomConstraintResolution.status).toBe("incompatible");
    expect(region.roomConstraintResolution.conflicts).toEqual([
      expect.objectContaining({
        code: "ROOM_SHAPE_REQUIRED_CONFLICT",
        field: "shape.kind",
        blocking: true,
        sources: ["clue-pillared-altar", "hazard-circular-pit"],
      }),
    ]);
  });

  test("recomputes a carried resolution when the assigned component set changes", () => {
    const compatibleComponents = createCompatibleComponents();
    const initialRequest = createMapRequestFromDarkenLocationState(
      createSnapshot(compatibleComponents),
    );
    const carriedRegions = createLocationRegionsFromDungeonBrief(
      initialRequest.dungeonBrief,
    );
    const conflictingComponents = [
      compatibleComponents[0],
      {
        id: "clue-new-l-shape",
        title: "New L-shaped Clue",
        location: { roomDesign: { shape: { kind: "l-shape" } } },
      },
    ];
    const nextSnapshot = createSnapshot(conflictingComponents);
    nextSnapshot.locationRegions = carriedRegions;

    const nextRequest = createMapRequestFromDarkenLocationState(nextSnapshot);
    const resolution = nextRequest.requiredRegions[0].roomConstraintResolution;

    expect(resolution.status).toBe("incompatible");
    expect(resolution.conflicts).toEqual([
      expect.objectContaining({
        code: "ROOM_SHAPE_REQUIRED_CONFLICT",
        sources: ["clue-new-l-shape", "hazard-circular-pit"],
      }),
    ]);
  });

  test("preserves legacy room metadata in the shared Darken adapter", () => {
    const roomDesign = {
      shape: { kind: "circle" },
      size: { minAreaCells: 24 },
    };
    const roomCompatibility = {
      exclusiveGroups: ["central-hazard"],
      conflictPolicy: "block",
    };
    const source = {
      id: "legacy-room-metadata",
      title: "Legacy Room Metadata",
      type: "Hazard",
      workflows: ["location"],
      slots: ["hazard"],
      roomDesign,
      roomCompatibility,
    };

    const adapted = legacyDarkenComponentToSharedComponent(source);

    expect(adapted.location.roomDesign).toEqual(roomDesign);
    expect(adapted.location.roomCompatibility).toEqual(roomCompatibility);
    expect(adapted.location.roomDesign).not.toBe(roomDesign);
    expect(adapted.location.roomCompatibility).not.toBe(roomCompatibility);
  });
});
