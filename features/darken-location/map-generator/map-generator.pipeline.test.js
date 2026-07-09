import { describe, expect, test } from "vitest";
import { DEFAULT_CONFIG } from "./map-generator.input.js";
import { applyManualConnectionsToGraph } from "./map-generator.graph.js";
import { createMapRequestFromDarkenLocationState } from "../darken-location.map-request.js";
import { getLocationPreviewResetKey } from "../composer/model/location-composer-preview.js";
import {
  MAP_VISUAL_STYLE,
  SVG_STYLE,
  createLevelFilteredMap,
  createStairDirectionArrowSegments,
  getCorridorStairMarkerVirtualDoors,
  getCorridorTypeClassName,
  getRenderedCorridorStairMarkerCount,
  getRoomLevelBadgeLabel,
} from "./map-generator.render.jsx";
import { generateMap } from "./map-generator.pipeline.js";
import { buildMapStatePayload, parseMapStatePayload } from "./map-generator.export.js";
import {
  createMapSignature,
  runGoldenSeedChecks,
  validateGeneratedMap,
} from "./map-generator.debug.js";
import {
  createEditorStairLevelOverrides,
  stairTransitionKey,
} from "./map-generator.state.js";

function buildConfig(overrides = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    regions: overrides.regions || DEFAULT_CONFIG.regions,
  };
}

describe("map generator pipeline", () => {
  test("generates a structurally valid default map", () => {
    const config = buildConfig();
    const generatedMap = generateMap(config);
    const validation = validateGeneratedMap(generatedMap, config);

    expect(validation.passed, validation.errors.join("\n")).toBe(true);
    expect(generatedMap.regions).toHaveLength(config.roomCount);
    expect(generatedMap.corridors.length).toBeGreaterThan(0);
    expect(generatedMap.dungeonMask.floorCells.length).toBeGreaterThan(0);
    expect(generatedMap.dungeonMask.wallSegments.length).toBeGreaterThan(0);
  });

  test("assigns advanced corridor type metadata without changing topology", () => {
    const config = buildConfig({ seed: "corridor-type-contract", roomCount: 7 });
    const generatedMap = generateMap(config);
    const validation = validateGeneratedMap(generatedMap, config);

    expect(validation.passed, validation.errors.join("\n")).toBe(true);
    expect(generatedMap.corridors.length).toBeGreaterThan(0);
    generatedMap.corridors.forEach((corridor) => {
      expect(["normal", "narrow", "collapsed", "secret", "gallery"]).toContain(corridor.corridorType);
      expect(corridor.corridorRenderProfile).toEqual(
        expect.objectContaining({ type: corridor.corridorType }),
      );
      expect(Array.isArray(corridor.floorCells)).toBe(true);
      expect(Array.isArray(corridor.pathCells)).toBe(true);
    });
  });

  test("manual corridor type overrides win over inferred corridor types", () => {
    const config = buildConfig({ seed: "manual-corridor-type", roomCount: 5 });
    const manualCorridorId = "manual-edge-region-1-region-2-type";
    const generatedMap = generateMap(config, {
      customConnections: [
        {
          id: manualCorridorId,
          from: "region-1",
          to: "region-2",
          kind: "manual",
          locked: true,
        },
      ],
      corridorTypes: {
        [manualCorridorId]: "collapsed",
      },
    });
    const manualCorridor = generatedMap.corridors.find(
      (corridor) => corridor.id === manualCorridorId,
    );

    expect(manualCorridor).toBeTruthy();
    expect(manualCorridor.corridorType).toBe("collapsed");
    expect(manualCorridor.corridorRenderProfile).toEqual(
      expect.objectContaining({
        type: "collapsed",
        traversal: "difficult",
      }),
    );
  });

  test("promotes explicit level transitions into corridor metadata", () => {
    const config = buildConfig({ seed: "explicit-level-transition", roomCount: 5 });
    const manualCorridorId = "manual-edge-region-1-region-2-levels";
    const generatedMap = generateMap(config, {
      customConnections: [
        {
          id: manualCorridorId,
          from: "region-1",
          to: "region-2",
          kind: "manual",
          locked: true,
        },
      ],
      levels: {
        regions: {
          "region-1": 0,
          "region-2": -1,
        },
        corridors: {
          [manualCorridorId]: { level: -1 },
        },
        stairs: {
          [`${manualCorridorId}:from`]: {
            type: "stairs",
            direction: "down",
            placement: "from-endpoint",
          },
        },
      },
    });
    const corridor = generatedMap.corridors.find(
      (candidate) => candidate.id === manualCorridorId,
    );

    expect(corridor).toBeTruthy();
    expect(corridor.fromLevel).toBe(0);
    expect(corridor.toLevel).toBe(-1);
    expect(corridor.level).toBe(-1);
    expect(corridor.levelDelta).toBe(-1);
    expect(corridor.crossLevel).toBe(true);
    expect(corridor.verticalTransition).toBe(true);
    expect(corridor.stairEndpoint).toBe("from");
    expect(corridor.stairTransition).toBe("down");
    expect(corridor.stairCount).toBe(1);
    expect(corridor.levelTransition).toEqual(
      expect.objectContaining({
        type: "stairs",
        direction: "down",
        placement: "from-endpoint",
        endpoint: "from",
        fromLevel: 0,
        toLevel: -1,
        levelDelta: -1,
        stairCount: 1,
        corridorId: manualCorridorId,
      }),
    );
  });


  test("derives stair markers from manually assigned room levels", () => {
    const config = buildConfig({ seed: "room-level-derived-stairs", roomCount: 5 });
    const manualCorridorId = "manual-edge-region-1-region-2-room-levels";
    const generatedMap = generateMap(config, {
      customConnections: [
        {
          id: manualCorridorId,
          from: "region-1",
          to: "region-2",
          kind: "manual",
          locked: true,
        },
      ],
      levels: {
        regions: {
          "region-1": 0,
          "region-2": -3,
        },
      },
    });
    const validation = validateGeneratedMap(generatedMap, config);
    const corridor = generatedMap.corridors.find(
      (candidate) => candidate.id === manualCorridorId,
    );

    expect(validation.passed, validation.errors.join("\n")).toBe(true);
    expect(corridor).toBeTruthy();
    expect(corridor.fromLevel).toBe(0);
    expect(corridor.toLevel).toBe(-3);
    expect(corridor.levelDelta).toBe(-3);
    expect(corridor.crossLevel).toBe(true);
    expect(corridor.stairTransition).toBe("down");
    expect(corridor.stairCount).toBe(3);
    expect(corridor.levelTransition).toEqual(
      expect.objectContaining({
        type: "stairs",
        direction: "down",
        derivedFromRoomLevels: true,
        stairCount: 3,
      }),
    );
    expect(getRenderedCorridorStairMarkerCount(corridor)).toBe(3);
    expect(getCorridorStairMarkerVirtualDoors(corridor, generatedMap)).toHaveLength(3);
  });

  test("filters level views and labels nonzero room levels", () => {
    const config = buildConfig({ seed: "level-view-filter", roomCount: 5 });
    const manualCorridorId = "manual-edge-region-1-region-2-level-view";
    const generatedMap = generateMap(config, {
      customConnections: [
        {
          id: manualCorridorId,
          from: "region-1",
          to: "region-2",
          kind: "manual",
          locked: true,
        },
      ],
      levels: {
        regions: {
          "region-1": 0,
          "region-2": -2,
        },
      },
    });
    const activeLevelMap = createLevelFilteredMap(generatedMap, -2, "active");
    const inactiveLevelMap = createLevelFilteredMap(generatedMap, -2, "inactive");
    const activeRegionIds = activeLevelMap.regions.map((region) => region.id);
    const inactiveRegionIds = inactiveLevelMap.regions.map((region) => region.id);
    const targetRegion = generatedMap.regions.find((region) => region.id === "region-2");
    const visibleStairCorridor = activeLevelMap.corridors.find(
      (corridor) => corridor.id === manualCorridorId,
    );

    expect(activeRegionIds).toContain("region-2");
    expect(activeRegionIds).not.toContain("region-1");
    expect(inactiveRegionIds).toContain("region-1");
    expect(getRoomLevelBadgeLabel(targetRegion)).toBe("L-2");
    expect(SVG_STYLE).toContain(".labels .room-level-badge");
    expect(visibleStairCorridor).toEqual(
      expect.objectContaining({
        crossLevel: true,
        stairCount: 2,
        stairTransition: "down",
      }),
    );
  });

  test("editor stair overrides create coherent level metadata", () => {
    const config = buildConfig({ seed: "editor-stair-levels", roomCount: 5 });
    const manualCorridorId = "manual-edge-region-1-region-2-editor-stair";
    const customConnection = {
      id: manualCorridorId,
      from: "region-1",
      to: "region-2",
      kind: "manual",
      locked: true,
    };
    const baseMap = generateMap(config, {
      customConnections: [customConnection],
    });
    const baseCorridor = baseMap.corridors.find(
      (candidate) => candidate.id === manualCorridorId,
    );
    const stairOverrides = createEditorStairLevelOverrides({
      levels: {},
      corridor: baseCorridor,
      endpoint: "from",
      stairTransition: "down",
    });
    const generatedMap = generateMap(config, {
      customConnections: [customConnection],
      levels: stairOverrides.levels,
      stairTransitions: stairOverrides.stairTransitions,
    });
    const validation = validateGeneratedMap(generatedMap, config);
    const corridor = generatedMap.corridors.find(
      (candidate) => candidate.id === manualCorridorId,
    );
    const stairKey = stairTransitionKey(manualCorridorId, "from");

    expect(validation.passed, validation.errors.join("\n")).toBe(true);
    expect(stairOverrides.levels.stairs[stairKey]).toEqual(
      expect.objectContaining({
        type: "stairs",
        direction: "down",
        placement: "from-endpoint",
        source: "editor-stair",
      }),
    );
    expect(stairOverrides.levels.corridors[manualCorridorId]).toEqual(
      expect.objectContaining({
        level: -1,
        fromLevel: 0,
        toLevel: -1,
        source: "editor-stair",
      }),
    );
    expect(corridor.fromLevel).toBe(0);
    expect(corridor.toLevel).toBe(-1);
    expect(corridor.stairTransition).toBe("down");

    const cleared = createEditorStairLevelOverrides({
      levels: stairOverrides.levels,
      corridor,
      endpoint: "from",
      stairTransition: "none",
    });
    expect(cleared.levels.stairs[stairKey]).toBeUndefined();
    expect(cleared.levels.corridors[manualCorridorId]).toBeUndefined();
  });

  test("is deterministic for the same seed and config", () => {
    const config = buildConfig({ seed: "deterministic-crypt", roomCount: 7 });
    const first = generateMap(config);
    const second = generateMap(config);

    expect(createMapSignature(first)).toBe(createMapSignature(second));
  });

  test("changes topology when seed, room count, or context changes", () => {
    const checks = runGoldenSeedChecks(buildConfig());

    expect(checks.passed, checks.tests.filter((item) => !item.passed).map((item) => item.label).join("\n")).toBe(true);
  });

  test("normalizes requested room count into rendered region count", () => {
    const config = buildConfig({ seed: "room-count-check", roomCount: 5 });
    const generatedMap = generateMap(config);

    expect(generatedMap.config.roomCount).toBe(5);
    expect(generatedMap.regions).toHaveLength(5);
  });

  test("carries regional slot metadata into map requests", () => {
    const snapshot = {
      workflow: "location",
      title: "Preview Quality Check",
      context: "Crypt",
      sourceAnchors: ["Sedlec Ossuary"],
      horrors: ["Religious Horror"],
      slotAssignments: {
        hazard: [{ componentId: "hazard-a", slotId: "hazard", regionId: "region-a" }],
        clue: [{ componentId: "clue-a", slotId: "clue", regionId: "region-a" }],
      },
      selectedComponents: [
        { id: "hazard-a", title: "Dropping Ossuary Slab" },
        { id: "clue-a", title: "Wax Mask Witness" },
      ],
      locationRegions: [
        { id: "region-a", name: "Bone Witness Room", role: "Clue Room" },
      ],
    };

    const request = createMapRequestFromDarkenLocationState(snapshot);

    expect(request.requiredRegions[0].metadata.assignedSlotIds).toEqual([
      "hazard",
      "clue",
    ]);
    expect(request.requiredRegions[0].metadata.assignedComponents).toHaveLength(2);
  });

  test("changes preview reset key when target or assignments change", () => {
    const mapRequest = {
      seed: "preview-reset",
      context: "Crypt",
      mapType: "Crypt",
      requiredRegions: [
        { id: "map-region-1", sourceRegionId: "region-a", label: "A", metadata: { assignedSlotIds: [] } },
      ],
      metadata: {},
    };
    const digest = { filledSlots: 1, totalSlots: 7 };
    const first = getLocationPreviewResetKey(mapRequest, digest, {
      activeSlotScope: "map",
      activeRegionId: "region-a",
      slotAssignments: {},
    });
    const second = getLocationPreviewResetKey(mapRequest, digest, {
      activeSlotScope: "region",
      activeRegionId: "region-a",
      slotAssignments: {
        hazard: [{ componentId: "hazard-a", slotId: "hazard", regionId: "region-a" }],
      },
    });

    expect(second).not.toBe(first);
  });

  test("uses opaque floor fills in generated SVG styles", () => {
    expect(SVG_STYLE).toContain(".floor-fill{fill:#685D61;stroke:none}");
    expect(SVG_STYLE).toContain(".door-symbols .stair-mark__arrow path");
    expect(MAP_VISUAL_STYLE).toContain(
      ".map-style-cruor .floor-fill{fill:#21191d;stroke:none;mix-blend-mode:normal}",
    );
  });

  test("creates deterministic stair direction arrows for up and down markers", () => {
    const generatedMap = generateMap(
      buildConfig({ seed: "stair-arrow-render", roomCount: 5 }),
      {
        customConnections: [
          {
            id: "manual-edge-region-1-region-2-stair-arrow",
            from: "region-1",
            to: "region-2",
            kind: "manual",
            locked: true,
          },
        ],
      },
    );
    const corridor = generatedMap.corridors.find(
      (candidate) => candidate.id === "manual-edge-region-1-region-2-stair-arrow",
    );
    const door = generatedMap.dungeonMask.doorSegments.find(
      (candidate) =>
        candidate.corridorId === corridor.id && candidate.endpoint === "from",
    );
    const down = createStairDirectionArrowSegments(door, generatedMap, "down");
    const up = createStairDirectionArrowSegments(door, generatedMap, "up");

    expect(down).toHaveLength(3);
    expect(up).toHaveLength(3);
    expect(down[0]).not.toEqual(up[0]);
  });

  test("exposes visual SVG classes for advanced corridor types", () => {
    expect(SVG_STYLE).toContain(".corridor-type-narrow__inset");
    expect(SVG_STYLE).toContain(".corridor-type-collapsed__rubble");
    expect(SVG_STYLE).toContain(".corridor-type-secret__trace");
    expect(SVG_STYLE).toContain(".corridor-type-gallery__ornament");

    expect(getCorridorTypeClassName({ corridorType: "narrow" })).toBe("corridor-type-narrow");
    expect(getCorridorTypeClassName({ corridorType: "collapsed" }, "rubble")).toBe(
      "corridor-type-collapsed__rubble",
    );
    expect(
      getCorridorTypeClassName({
        corridorRenderProfile: { type: "gallery", renderClassName: "corridor-type-gallery" },
      }, "axis"),
    ).toBe("corridor-type-gallery__axis");
  });

  test("keeps manual duplicate corridors while generated graph pairs remain deduped", () => {
    const graph = [
      { id: "base-a-b", from: "room-a", to: "room-b", kind: "critical" },
    ];
    const config = buildConfig({
      manualCustomConnections: [
        { id: "manual-edge-room-a-room-b-1", from: "room-a", to: "room-b" },
      ],
    });

    const next = applyManualConnectionsToGraph(config, graph);

    expect(next.map((edge) => edge.id)).toEqual([
      "base-a-b",
      "manual-edge-room-a-room-b-1",
    ]);
    expect(next.filter((edge) => edge.from === "room-a" && edge.to === "room-b")).toHaveLength(2);
  });

  test("preserves manual overrides through map state export and import", () => {
    const config = buildConfig({ seed: "manual-override-roundtrip", roomCount: 5 });
    const manualOverrides = {
      roomPositions: {
        "region-1": { x: 12, y: 8 },
      },
      doorAnchors: {
        "manual-edge-region-1-region-2-1:from": {
          regionId: "region-1",
          regionShape: "circle",
          side: "west",
          normal: { x: -1, y: 0 },
          expandedCircleDoor: true,
          portalRoomCell: { x: 41, y: 23 },
          raccordoCell: { x: 41, y: 23 },
          raccordoCells: [
            { x: 42, y: 23 },
            { x: 41, y: 23 },
          ],
          outsideCell: { x: 40, y: 23 },
          routingOutsideCell: { x: 40, y: 23 },
          corridorStartCell: { x: 40, y: 23 },
        },
      },
      corridorWaypoints: {
        "manual-edge-region-1-region-2-1": [{ x: 35, y: 20 }],
      },
      corridorTypes: {
        "manual-edge-region-1-region-2-1": "secret",
        "manual-edge-region-1-region-2-2": "gallery",
      },
      levels: {
        regions: {
          "region-1": 0,
          "region-2": -1,
        },
        corridors: {
          "manual-edge-region-1-region-2-1": { level: -1 },
        },
        stairs: {
          "manual-edge-region-1-region-2-1:from": {
            type: "stairs",
            direction: "down",
            placement: "from-endpoint",
          },
        },
      },
      customConnections: [
        { id: "manual-edge-region-1-region-2-1", from: "region-1", to: "region-2", kind: "manual", locked: true },
        { id: "manual-edge-region-1-region-2-2", from: "region-1", to: "region-2", kind: "manual", locked: true },
      ],
      deletedConnections: ["edge-region-4-region-5"],
      manualConnectionSequence: 2,
    };
    const generatedMap = generateMap(config, manualOverrides);
    const payload = buildMapStatePayload(
      config,
      manualOverrides,
      { zoom: 1.25, levelView: "all" },
      generatedMap,
    );
    const parsed = parseMapStatePayload(JSON.stringify(payload));

    expect(parsed.manualOverrides.roomPositions["region-1"]).toEqual({ x: 12, y: 8 });
    expect(parsed.manualOverrides.doorAnchors["manual-edge-region-1-region-2-1:from"].raccordoCells).toEqual([
      { x: 42, y: 23 },
      { x: 41, y: 23 },
    ]);
    expect(parsed.manualOverrides.corridorWaypoints["manual-edge-region-1-region-2-1"]).toEqual([{ x: 35, y: 20 }]);
    expect(parsed.manualOverrides.corridorTypes["manual-edge-region-1-region-2-1"]).toBe("secret");
    expect(parsed.manualOverrides.corridorTypes["manual-edge-region-1-region-2-2"]).toBe("gallery");
    expect(parsed.manualOverrides.levels.regions["region-2"]).toBe(-1);
    expect(parsed.manualOverrides.levels.corridors["manual-edge-region-1-region-2-1"]).toEqual({ level: -1 });
    expect(parsed.manualOverrides.levels.stairs["manual-edge-region-1-region-2-1:from"]).toEqual(
      expect.objectContaining({
        type: "stairs",
        direction: "down",
        placement: "from-endpoint",
      }),
    );
    expect(parsed.manualOverrides.customConnections.map((connection) => connection.id)).toEqual([
      "manual-edge-region-1-region-2-1",
      "manual-edge-region-1-region-2-2",
    ]);
    expect(parsed.manualOverrides.deletedConnections).toEqual(["edge-region-4-region-5"]);
    expect(parsed.manualOverrides.manualConnectionSequence).toBe(2);
    expect(Object.keys(parsed.manualOverrides.levels.regions).length).toBeGreaterThan(0);
    expect(Object.keys(parsed.manualOverrides.levels.corridors).length).toBeGreaterThan(0);
  });

});
