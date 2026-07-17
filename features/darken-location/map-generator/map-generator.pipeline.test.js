import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { DEFAULT_CONFIG } from "./map-generator.input.js";
import { buildDungeonMask } from "./map-generator.mask.js";
import { applyManualConnectionsToGraph } from "./map-generator.graph.js";
import {
  findPathThroughCellSet,
  isSelfAvoidingPathThroughPoints,
  routePathThroughCells,
} from "./map-generator.corridors.js";
import { createMapRequestFromDarkenLocationState } from "../darken-location.map-request.js";
import { getLocationPreviewResetKey } from "../composer/model/location-composer-preview.js";
import {
  MAP_VISUAL_STYLE,
  SVG_STYLE,
  createCorridorSurface,
  createLevelFilteredMap,
  getMapSurface,
  createStairDirectionArrowSegments,
  getCorridorLevelShiftDescription,
  getCorridorLevelShiftLabel,
  getCorridorStairMarkerVirtualDoors,
  getCorridorStairMarkerDragTargets,
  getClosestCorridorStairMarkerDragTarget,
  getMapStairMarkerEditorHandles,
  getStairMarkerId,
  getCorridorStairRenderInfo,
  getRenderOnlyRoomLevelStairInfo,
  getCorridorTypeClassName,
  getRenderedCorridorStairMarkerCount,
  getRoomLevelBadgeLabel,
  renderCorridorTypeWallAccents,
  renderDoorSymbols,
  renderEditorOverlays,
} from "./map-generator.render.jsx";
import { generateMap } from "./map-generator.pipeline.js";
import { MapViewport } from "./map-generator.page.jsx";
import {
  buildMapStatePayload,
  createMapStateExportManifest,
  normalizeMapUiState,
  parseMapStatePayload,
  serializeSvg,
} from "./map-generator.export.js";
import {
  createMapSignature,
  runGoldenSeedChecks,
  validateGeneratedMap,
} from "./map-generator.debug.js";
import {
  MANUAL_OVERRIDE_SCHEMA_VERSION,
  createEditorStairLevelOverrides,
  createStairMarkerPositionOverride,
  createStairMarkerRemovalOverride,
  normalizeManualOverrides,
  stairTransitionKey,
} from "./map-generator.state.js";
import {
  MAP_DEBUG_CATEGORY_DEFINITIONS,
  MAP_QA_SCENARIO_DEFINITIONS,
  createDefaultMapDebugCategories,
  getComposerMapDebugCategories,
  getComposerMapQaScenarios,
  getEditorMapDebugCategories,
  getEditorMapQaScenarios,
  getMapDebugCategory,
} from "./map-generator.debug-options.js";

function buildConfig(overrides = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    regions: overrides.regions || DEFAULT_CONFIG.regions,
  };
}

// Five full map generations take about 8 seconds during the parallel full suite.
const GOLDEN_SEED_TEST_TIMEOUT_MS = 15_000;

function repoPath(...segments) {
  return resolve(process.cwd(), ...segments);
}

function readSourceText(path) {
  return readFileSync(path, "utf8").replace(/\r\n?/g, "\n");
}

function getTaggedManualOverrideUpdateBody(source, label) {
  const labelToken = `"${label}"`;
  const labelIndex = source.indexOf(labelToken);
  if (labelIndex < 0) return "";

  const invocationStart = source.lastIndexOf(
    "setManualOverridesFromCurrent((current) => {",
    labelIndex,
  );
  if (invocationStart < 0) return "";

  return source.slice(invocationStart, labelIndex + labelToken.length);
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

  test("routes waypoint segments without retracing previously occupied cells", () => {
    const points = [
      { x: 1, y: 2 },
      { x: 5, y: 2 },
      { x: 1, y: 4 },
    ];
    const options = {
      gridW: 9,
      gridH: 8,
      blocked: new Set(),
      softBlocked: new Set(),
      existingCorridors: new Set(),
      adjacentToExistingCorridors: new Set(),
      routingProfile: { turnCost: 0 },
    };

    const path = routePathThroughCells(points, options);
    const keys = path.map((cell) => `${cell.x},${cell.y}`);

    expect(path[0]).toEqual(points[0]);
    expect(path.at(-1)).toEqual(points.at(-1));
    expect(keys).toContain("5,2");
    expect(new Set(keys).size).toBe(keys.length);
    expect(isSelfAvoidingPathThroughPoints(path, points)).toBe(true);

    const cellNetwork = new Set();
    for (let x = 1; x <= 5; x += 1) {
      cellNetwork.add(`${x},2`);
      cellNetwork.add(`${x},3`);
      cellNetwork.add(`${x},4`);
    }
    const rebuiltPath = findPathThroughCellSet(cellNetwork, points);
    const rebuiltKeys = rebuiltPath.map((cell) => `${cell.x},${cell.y}`);
    expect(new Set(rebuiltKeys).size).toBe(rebuiltKeys.length);
  });

  test("keeps the reported corridor anchor route continuous instead of creating a dead end", () => {
    const points = [
      { x: 34, y: 23 },
      { x: 36, y: 26 },
      { x: 40, y: 21 },
    ];
    const path = routePathThroughCells(points, {
      gridW: 80,
      gridH: 50,
      blocked: new Set(),
      softBlocked: new Set(),
      existingCorridors: new Set(),
      adjacentToExistingCorridors: new Set(),
      routingProfile: { turnCost: 0 },
    });
    const keys = path.map((cell) => `${cell.x},${cell.y}`);

    expect(keys).toContain("36,26");
    expect(keys.at(0)).toBe("34,23");
    expect(keys.at(-1)).toBe("40,21");
    expect(new Set(keys).size).toBe(keys.length);
  });

  test("keeps an internal wall between adjacent non-consecutive S-corridor runs", () => {
    const pathCells = [
      { x: 3, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
    ];
    const dungeonMask = buildDungeonMask(
      [],
      [
        {
          id: "corridor-s-fold",
          floorCells: pathCells,
          pathCells,
          doors: [],
        },
      ],
      20,
    );

    expect(dungeonMask.internalWallSegments).toContainEqual({
      x1: 20,
      y1: 20,
      x2: 80,
      y2: 20,
    });
    expect(dungeonMask.wallSegments).toContainEqual({
      x1: 20,
      y1: 20,
      x2: 100,
      y2: 20,
    });
    expect(dungeonMask.internalWallSegments).not.toContainEqual({
      x1: 0,
      y1: 20,
      x2: 20,
      y2: 20,
    });
  });

  test("rejects a waypoint route when continuity would require backtracking", () => {
    const openCells = new Set([
      "1,2",
      "2,2",
      "3,2",
      "1,3",
      "1,4",
    ]);
    const blocked = new Set();
    for (let y = 1; y <= 4; y += 1) {
      for (let x = 1; x <= 4; x += 1) {
        const key = `${x},${y}`;
        if (!openCells.has(key)) blocked.add(key);
      }
    }
    const points = [
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 1, y: 4 },
    ];
    const options = {
      gridW: 6,
      gridH: 6,
      blocked,
      softBlocked: new Set(),
      existingCorridors: new Set(),
      adjacentToExistingCorridors: new Set(),
      routingProfile: { turnCost: 0 },
    };

    expect(routePathThroughCells(points, options)).toEqual([]);
    expect(findPathThroughCellSet(openCells, points)).toEqual([]);
    expect(
      isSelfAvoidingPathThroughPoints(
        [
          { x: 1, y: 2 },
          { x: 2, y: 2 },
          { x: 3, y: 2 },
          { x: 2, y: 2 },
          { x: 1, y: 2 },
          { x: 1, y: 3 },
          { x: 1, y: 4 },
        ],
        points,
      ),
    ).toBe(false);
  });

  test("keeps map debug runner options centralized for editor and composer", () => {
    const categoryIds = MAP_DEBUG_CATEGORY_DEFINITIONS.map((category) => category.id);
    const scenarioIds = MAP_QA_SCENARIO_DEFINITIONS.map((scenario) => scenario.id);

    expect(new Set(categoryIds).size).toBe(categoryIds.length);
    expect(new Set(scenarioIds).size).toBe(scenarioIds.length);
    expect(categoryIds).toContain("levels");
    expect(scenarioIds).toEqual(
      expect.arrayContaining(["smoke", "circle-anchor-sweep", "corridor-create", "level-stairs", "level-view", "room-move-reroute"]),
    );

    expect(getEditorMapQaScenarios().find((scenario) => scenario.id === "level-view")?.icon).toBe("layer-group");
    expect(getComposerMapQaScenarios().find((scenario) => scenario.id === "level-view")?.icon).toBe("fa-solid fa-layer-group");
    expect(getEditorMapDebugCategories().find((category) => category.id === "levels")?.icon).toBe("stairs");
    expect(getComposerMapDebugCategories().find((category) => category.id === "levels")?.icon).toBe("fa-solid fa-stairs");
    expect(createDefaultMapDebugCategories(getEditorMapDebugCategories()).levels).toBe(true);

    expect(getMapDebugCategory("Set room level override")).toBe("levels");
    expect(getMapDebugCategory("CreateConnection draft committed")).toBe("corridor-create");
    expect(getMapDebugCategory("MoveWaypoint applied")).toBe("corridor-move");
  });

  test("keeps Dark Places debug runner wired to real mounted files", () => {
    const registryPath = repoPath(
      "features",
      "darken-location",
      "map-generator",
      "map-generator.debug-options.js",
    );
    const mapPagePath = repoPath(
      "features",
      "darken-location",
      "map-generator",
      "map-generator.page.jsx",
    );
    const composerPanelPath = repoPath(
      "features",
      "darken-location",
      "composer",
      "components",
      "LocationMapDetailsPanel.jsx",
    );
    const phantomPanelPath = repoPath(
      "features",
      "darken-location",
      "components",
      "LocationMapDetailsPanel.jsx",
    );

    expect(existsSync(registryPath)).toBe(true);
    expect(existsSync(mapPagePath)).toBe(true);
    expect(existsSync(composerPanelPath)).toBe(true);
    expect(existsSync(phantomPanelPath)).toBe(false);

    const registry = readSourceText(registryPath);
    const mapPage = readSourceText(mapPagePath);
    const composerPanel = readSourceText(composerPanelPath);

    expect(registry).toContain('id: "levels"');
    expect(registry).toContain('id: "level-stairs"');
    expect(registry).toContain('id: "level-view"');
    expect(mapPage).toContain('./map-generator.debug-options.js');
    expect(composerPanel).toContain('../../map-generator/map-generator.debug-options.js');
    expect(mapPage).not.toMatch(/const\s+MAP_QA_SCENARIO_OPTIONS\s*=\s*\[/);
    expect(composerPanel).not.toMatch(/const\s+MAP_QA_SCENARIO_OPTIONS\s*=\s*\[/);
    expect(composerPanel).toContain("data-debug-scenario={scenario.id}");
    expect(composerPanel).toContain("data-debug-category={category.id}");
  });

  test("generates normal corridor type metadata by default without changing topology", () => {
    const seeds = [
      "corridor-type-contract",
      "generated-secret-role-normalized",
      "generated-narrow-role-normalized",
    ];

    seeds.forEach((seed) => {
      const config = buildConfig({ seed, roomCount: 7 });
      const generatedMap = generateMap(config);
      const validation = validateGeneratedMap(generatedMap, config);

      expect(validation.passed, validation.errors.join("\n")).toBe(true);
      expect(generatedMap.corridors.length).toBeGreaterThan(0);
      generatedMap.corridors.forEach((corridor) => {
        expect(corridor.corridorType).toBe("normal");
        expect(corridor.corridorRenderProfile).toEqual(
          expect.objectContaining({ type: "normal" }),
        );
        expect(Array.isArray(corridor.floorCells)).toBe(true);
        expect(Array.isArray(corridor.pathCells)).toBe(true);
      });
    });
  });

  test("can opt into generated corridor type inference for future generator passes", () => {
    const config = buildConfig({
      seed: "corridor-type-contract-opt-in",
      roomCount: 5,
      enableGeneratedCorridorTypes: true,
    });
    const inferredCorridorId = "manual-edge-region-1-region-2-inferred-secret";
    const generatedMap = generateMap(config, {
      customConnections: [
        {
          id: inferredCorridorId,
          from: "region-1",
          to: "region-2",
          kind: "secret",
          locked: true,
        },
      ],
    });
    const validation = validateGeneratedMap(generatedMap, config);
    const inferredCorridor = generatedMap.corridors.find(
      (corridor) => corridor.id === inferredCorridorId,
    );

    expect(validation.passed, validation.errors.join("\n")).toBe(true);
    expect(inferredCorridor).toBeTruthy();
    expect(inferredCorridor.corridorType).toBe("secret");
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


  test("rejects waypoint commits when the preview route would cross itself", () => {
    const pageSource = readFileSync(
      repoPath(
        "features",
        "darken-location",
        "map-generator",
        "map-generator.page.jsx",
      ),
      "utf8",
    );

    expect(pageSource).toContain("function canCommitCorridorWaypointRoute");
    expect(pageSource).toContain("isSelfAvoidingPathThroughPoints");
    expect(pageSource.match(/canCommitCorridorWaypointRoute/g)).toHaveLength(3);
    expect(pageSource).toContain(
      "Waypoint rejected: the corridor cannot continue without crossing itself.",
    );
  });

  test("clicking a corridor insertion handle does not create a waypoint", async () => {
    const generatedMap = generateMap(
      buildConfig({ seed: "click-safe-waypoint-insert", roomCount: 5 }),
    );
    const onWaypointInsert = vi.fn(() => true);
    const onEditStart = vi.fn();
    const onEditCommit = vi.fn();
    const originalResizeObserver = globalThis.ResizeObserver;
    const originalActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      disconnect() {}
    };
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const dispatchPointer = (target, type, options = {}) => {
      const EventConstructor = window.PointerEvent || window.MouseEvent;
      const event = new EventConstructor(type, {
        bubbles: true,
        cancelable: true,
        button: options.button ?? 0,
        clientX: options.clientX ?? 0,
        clientY: options.clientY ?? 0,
      });
      if (!("pointerId" in event)) {
        Object.defineProperty(event, "pointerId", {
          value: options.pointerId ?? 1,
        });
      }
      target.dispatchEvent(event);
    };

    try {
      await act(async () => {
        root.render(
          createElement(MapViewport, {
            generatedMap,
            showGrid: true,
            showEditor: true,
            showNames: false,
            showProps: false,
            manualOverrides: {},
            onWaypointInsert,
            onEditStart,
            onEditCommit,
            showViewportChrome: false,
          }),
        );
      });

      const corridorZone = container.querySelector(".corridor-hover-zone");
      expect(corridorZone).toBeTruthy();
      await act(async () => {
        dispatchPointer(corridorZone, "pointermove", {
          pointerId: 7,
          clientX: 120,
          clientY: 120,
        });
      });
      const addHandle = container.querySelector(".corridor-add-handle");
      const svg = container.querySelector("#cruor-map-svg");
      expect(addHandle).toBeTruthy();
      expect(svg).toBeTruthy();
      const initialViewBox = svg.getAttribute("viewBox");

      await act(async () => {
        dispatchPointer(addHandle, "pointerdown", {
          pointerId: 7,
          clientX: 120,
          clientY: 120,
        });
        dispatchPointer(svg, "pointerup", {
          pointerId: 7,
          clientX: 120,
          clientY: 120,
        });
      });

      expect(onWaypointInsert).not.toHaveBeenCalled();
      expect(onEditStart).not.toHaveBeenCalled();
      expect(onEditCommit).not.toHaveBeenCalled();
      expect(svg.getAttribute("viewBox")).toBe(initialViewBox);

      await act(async () => {
        dispatchPointer(corridorZone, "pointermove", {
          pointerId: 8,
          clientX: 120,
          clientY: 120,
        });
      });
      const dragHandle = container.querySelector(".corridor-add-handle");
      expect(dragHandle).toBeTruthy();
      await act(async () => {
        dispatchPointer(dragHandle, "pointerdown", {
          pointerId: 8,
          clientX: 120,
          clientY: 120,
        });
        dispatchPointer(svg, "pointermove", {
          pointerId: 8,
          clientX: 132,
          clientY: 120,
        });
        dispatchPointer(svg, "pointerup", {
          pointerId: 8,
          clientX: 132,
          clientY: 120,
        });
      });

      expect(onWaypointInsert).toHaveBeenCalledTimes(1);
      expect(onEditStart).toHaveBeenCalledTimes(1);
      expect(onEditCommit).toHaveBeenCalledTimes(1);
    } finally {
      await act(async () => root.unmount());
      container.remove();
      if (originalResizeObserver === undefined) delete globalThis.ResizeObserver;
      else globalThis.ResizeObserver = originalResizeObserver;
      if (originalActEnvironment === undefined) delete globalThis.IS_REACT_ACT_ENVIRONMENT;
      else globalThis.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
    }
  });


  test("room level edits do not freeze layout or reroute corridors", () => {
    const pagePath = repoPath(
      "features",
      "darken-location",
      "map-generator",
      "map-generator.page.jsx",
    );
    const mapPage = readSourceText(pagePath);
    const updateRoomLevelBody = mapPage.match(/function updateRoomLevel\([\s\S]*?\n  }\n\n  function resetRoomLevel/)?.[0] || "";
    const resetRoomLevelBody = mapPage.match(/function resetRoomLevel\([\s\S]*?\n  }\n\n  function setGridRenderingStyle/)?.[0] || "";
    const qaRoomLevelSetBody = getTaggedManualOverrideUpdateBody(
      mapPage,
      "qaRoomLevelStairs:setLevels",
    );
    const qaLevelViewSetBody = getTaggedManualOverrideUpdateBody(
      mapPage,
      "qaLevelView:setLevels",
    );

    expect(qaRoomLevelSetBody).not.toBe("");
    expect(qaLevelViewSetBody).not.toBe("");
    expect(updateRoomLevelBody).toContain("levels.regions[regionId]");
    expect(updateRoomLevelBody).not.toContain("freezeCurrentRoomLayout");
    expect(resetRoomLevelBody).toContain("delete levels.regions[regionId]");
    expect(resetRoomLevelBody).not.toContain("freezeCurrentRoomLayout");
    expect(qaRoomLevelSetBody).not.toContain("freezeCurrentRoomLayout");
    expect(qaLevelViewSetBody).not.toContain("freezeCurrentRoomLayout");

    const config = buildConfig({
      seed: "darken-cursed-location-build-crypt-sedlec-ossuary-sedlec-ossuary-bone-lit-vesti",
      context: "Crypt",
      mapType: "Crypt",
      roomCount: 3,
    });
    const baseMap = generateMap(config);
    const editedRegion = baseMap.regions[baseMap.regions.length - 1];
    const leveledMap = generateMap(config, {
      levels: {
        regions: {
          [editedRegion.id]: -1,
        },
      },
    });

    const summarizeGeometry = (map) => ({
      regions: map.regions.map((region) => ({
        id: region.id,
        shape: region.shape,
        cellRect: region.cellRect,
        floorCells: region.floorCells.map((cell) => `${cell.x},${cell.y}`),
      })),
      corridors: map.corridors.map((corridor) => ({
        id: corridor.id,
        from: corridor.from,
        to: corridor.to,
        fromAnchor: corridor.fromAnchor?.cell,
        toAnchor: corridor.toAnchor?.cell,
        fromOutside: corridor.fromAnchor?.outsideCell,
        toOutside: corridor.toAnchor?.outsideCell,
        floorCells: corridor.floorCells.map((cell) => `${cell.x},${cell.y}`),
        pathCells: corridor.pathCells.map((cell) => `${cell.x},${cell.y}`),
      })),
    });

    expect(summarizeGeometry(leveledMap)).toEqual(summarizeGeometry(baseMap));
    expect(leveledMap.regions.find((region) => region.id === editedRegion.id)?.level).toBe(-1);
  });

  test("keeps a manual room level scoped to the selected region", () => {
    const config = buildConfig({ seed: "room-level-scope", roomCount: 5 });
    const manualCorridorId = "manual-edge-region-1-region-2-level-scope";
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
          "region-2": -1,
        },
      },
    });
    const region1 = generatedMap.regions.find((region) => region.id === "region-1");
    const region2 = generatedMap.regions.find((region) => region.id === "region-2");
    const uneditedRegions = generatedMap.regions.filter((region) => region.id !== "region-2");
    const corridor = generatedMap.corridors.find(
      (candidate) => candidate.id === manualCorridorId,
    );

    expect(region1?.level).toBe(0);
    expect(region1?.levelSource).toBe("derived");
    expect(region2?.level).toBe(-1);
    expect(region2?.levelSource).toBe("manual");
    expect(uneditedRegions.every((region) => region.level === 0)).toBe(true);
    expect(corridor).toBeTruthy();
    expect(corridor.fromLevel).toBe(0);
    expect(corridor.toLevel).toBe(0);
    expect(corridor.levelDelta).toBe(0);
    expect(corridor.crossLevel).toBe(false);
    expect(corridor.verticalTransition).toBe(false);
    expect(corridor.stairTransition).toBe("none");
    expect(corridor.stairCount).toBe(0);
    expect(corridor.levelTransition).toEqual(
      expect.objectContaining({
        type: "none",
        direction: "none",
        derivedFromRoomLevels: false,
        stairCount: 0,
      }),
    );
    expect(getRenderOnlyRoomLevelStairInfo(corridor, generatedMap)).toEqual(
      expect.objectContaining({
        direction: "down",
        levelDelta: -1,
        stairCount: 1,
        renderOnly: true,
      }),
    );
    expect(getCorridorStairRenderInfo(corridor, generatedMap)).toEqual(
      expect.objectContaining({
        direction: "down",
        stairCount: 1,
        renderOnly: true,
      }),
    );
    expect(getRenderedCorridorStairMarkerCount(corridor, generatedMap)).toBe(1);
    expect(getCorridorStairMarkerVirtualDoors(corridor, generatedMap)).toEqual([
      expect.objectContaining({
        derivedRoomLevelStair: true,
        renderOnlyRoomLevelStair: true,
        markerIndex: 0,
        markerCount: 1,
      }),
    ]);
  });

  test("keeps multi-marker render-only stairs aligned with corridor travel direction", () => {
    const corridor = {
      id: "corridor-render-only-stair-direction",
      from: "region-1",
      to: "region-2",
      floorCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: -1 },
      ],
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: -1 },
      ],
      corridorType: "normal",
      isRoomLink: false,
    };
    const generatedMap = {
      config: buildConfig({ seed: "render-only-stair-direction" }),
      regions: [
        { id: "region-1", level: 0, cells: [] },
        { id: "region-2", level: -2, cells: [] },
      ],
      corridors: [corridor],
      dungeonMask: { doorSegments: [] },
    };

    const markers = getCorridorStairMarkerVirtualDoors(corridor, generatedMap);

    expect(markers).toHaveLength(2);
    expect(markers[0]).toEqual(
      expect.objectContaining({
        markerIndex: 0,
        stairTransition: "down",
        stairTravelDirection: { x: 1, y: 0 },
      }),
    );
    expect(markers[1]).toEqual(
      expect.objectContaining({
        markerIndex: 1,
        stairTransition: "down",
        stairTravelDirection: { x: 0, y: -1 },
      }),
    );
  });

  test("exposes stable selectable stair marker handles without mutating corridor topology", () => {
    const corridor = {
      id: "editor-stair-selection",
      from: "region-1",
      to: "region-2",
      cells: [
        { x: 4, y: 5 },
        { x: 5, y: 5 },
        { x: 6, y: 5 },
      ],
      pathCells: [
        { x: 4, y: 5 },
        { x: 5, y: 5 },
        { x: 6, y: 5 },
      ],
      corridorType: "normal",
      isRoomLink: false,
    };
    const generatedMap = {
      config: buildConfig({ seed: "stair-selection" }),
      regions: [
        { id: "region-1", level: 0, cells: [] },
        { id: "region-2", level: 2, cells: [] },
      ],
      corridors: [corridor],
      dungeonMask: { doorSegments: [] },
    };
    const originalPathCells = structuredClone(corridor.pathCells);
    const handles = getMapStairMarkerEditorHandles(generatedMap);

    expect(handles).toHaveLength(2);
    expect(handles.map((handle) => handle.id)).toEqual([
      "stair-marker:editor-stair-selection:0",
      "stair-marker:editor-stair-selection:1",
    ]);
    expect(handles[0]).toEqual(
      expect.objectContaining({
        corridorId: corridor.id,
        markerIndex: 0,
        markerCount: 2,
        transition: "up",
      }),
    );
    expect(getStairMarkerId(handles[1].door)).toBe(handles[1].id);
    expect(Number.isFinite(handles[0].x)).toBe(true);
    expect(Number.isFinite(handles[0].y)).toBe(true);
    expect(corridor.pathCells).toEqual(originalPathCells);
  });

  test("snaps stair marker drags to free corridor cells including door-adjacent endpoints without changing topology", () => {
    const corridor = {
      id: "editor-stair-drag",
      from: "region-1",
      to: "region-2",
      floorCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      doors: [
        { corridorId: "editor-stair-drag", outsideCell: { x: 1, y: 0 } },
        { corridorId: "editor-stair-drag", outsideCell: { x: 4, y: 0 } },
      ],
      corridorType: "normal",
      isRoomLink: false,
    };
    const generatedMap = {
      config: buildConfig({ seed: "stair-drag", gridSize: 20 }),
      regions: [
        { id: "region-1", level: 0, cells: [{ x: 0, y: 0 }] },
        { id: "region-2", level: 2, cells: [{ x: 5, y: 0 }] },
      ],
      corridors: [corridor],
      dungeonMask: {
        doorSegments: [
          { corridorId: corridor.id, outsideCell: { x: 1, y: 0 } },
          { corridorId: corridor.id, outsideCell: { x: 4, y: 0 } },
        ],
      },
    };
    const originalPathCells = structuredClone(corridor.pathCells);
    const originalFloorCells = structuredClone(corridor.floorCells);
    const targets = getCorridorStairMarkerDragTargets(corridor, generatedMap);

    expect(targets.map((target) => target.pathIndex)).toEqual([1, 2, 3, 4]);
    expect(targets.map((target) => target.cell)).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ]);
    expect(
      getClosestCorridorStairMarkerDragTarget(
        corridor,
        generatedMap,
        { x: 50, y: 10 },
      ),
    ).toEqual(expect.objectContaining({ pathIndex: 2, cell: { x: 2, y: 0 } }));
    expect(
      getClosestCorridorStairMarkerDragTarget(
        corridor,
        generatedMap,
        { x: 10, y: 10 },
      ),
    ).toBeNull();
    expect(
      getClosestCorridorStairMarkerDragTarget(
        corridor,
        generatedMap,
        { x: 30, y: 10 },
        { maxDistance: 30 },
      ),
    ).toEqual(expect.objectContaining({ pathIndex: 1, cell: { x: 1, y: 0 } }));
    expect(
      getClosestCorridorStairMarkerDragTarget(
        corridor,
        generatedMap,
        { x: 50, y: 80 },
      ),
    ).toBeNull();
    expect(
      getClosestCorridorStairMarkerDragTarget(
        corridor,
        generatedMap,
        { x: 60, y: 10 },
        { occupiedPathIndexes: [2], maxDistance: 30 },
      ),
    ).toEqual(expect.objectContaining({ pathIndex: 3, cell: { x: 3, y: 0 } }));

    const initialHandles = getMapStairMarkerEditorHandles(generatedMap);
    const markerId = initialHandles[0].id;
    const movedHandles = getMapStairMarkerEditorHandles(generatedMap, {
      [markerId]: {
        corridorId: corridor.id,
        markerIndex: 0,
        pathIndex: 2,
      },
    });
    const movedHandle = movedHandles.find((handle) => handle.id === markerId);

    expect(movedHandle).toEqual(
      expect.objectContaining({
        pathIndex: 2,
        x: 50,
        y: 10,
        positionSource: "manual-override",
      }),
    );
    expect(corridor.pathCells).toEqual(originalPathCells);
    expect(corridor.floorCells).toEqual(originalFloorCells);
  });

  test("persists stair marker positions as render-only manual overrides", () => {
    const corridor = {
      id: "persistent-stair-corridor",
      from: "region-1",
      to: "region-2",
      floorCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      pathCells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
        { x: 5, y: 0 },
      ],
      doors: [
        { corridorId: "persistent-stair-corridor", outsideCell: { x: 1, y: 0 } },
        { corridorId: "persistent-stair-corridor", outsideCell: { x: 4, y: 0 } },
      ],
      corridorType: "normal",
      isRoomLink: false,
    };
    const generatedMap = {
      config: buildConfig({ seed: "persistent-stair-position", gridSize: 20 }),
      regions: [
        { id: "region-1", level: 0, cells: [{ x: 0, y: 0 }] },
        { id: "region-2", level: 2, cells: [{ x: 5, y: 0 }] },
      ],
      corridors: [corridor],
      dungeonMask: {
        doorSegments: [
          { corridorId: corridor.id, outsideCell: { x: 1, y: 0 } },
          { corridorId: corridor.id, outsideCell: { x: 4, y: 0 } },
        ],
      },
    };
    const originalPathCells = structuredClone(corridor.pathCells);
    const originalFloorCells = structuredClone(corridor.floorCells);
    const markerIds = getMapStairMarkerEditorHandles(generatedMap).map((handle) => handle.id);
    const sharedTarget = { x: 2, y: 0 };
    const normalized = normalizeManualOverrides({
      stairMarkers: {
        [markerIds[0]]: createStairMarkerPositionOverride({
          markerId: markerIds[0],
          corridorId: corridor.id,
          markerIndex: 0,
          pathIndex: 2,
          pathLength: corridor.pathCells.length,
          cell: sharedTarget,
        }),
        [markerIds[1]]: createStairMarkerPositionOverride({
          markerId: markerIds[1],
          corridorId: corridor.id,
          markerIndex: 1,
          pathIndex: 2,
          pathLength: corridor.pathCells.length,
          cell: sharedTarget,
        }),
      },
    });
    const handles = getMapStairMarkerEditorHandles(
      generatedMap,
      normalized.stairMarkers,
    );

    expect(normalized.schemaVersion).toBe(MANUAL_OVERRIDE_SCHEMA_VERSION);
    expect(MANUAL_OVERRIDE_SCHEMA_VERSION).toBe(4);
    expect(normalized.stairMarkers[markerIds[0]]).toEqual(
      expect.objectContaining({
        corridorId: corridor.id,
        markerIndex: 0,
        pathIndex: 2,
        pathCellKey: "2,0",
        normalizedOffset: 0.4,
        cell: sharedTarget,
      }),
    );
    const resolvedPathIndexes = handles.map((handle) => handle.pathIndex);
    const validPathIndexes = new Set(
      getCorridorStairMarkerDragTargets(corridor, generatedMap).map(
        (target) => target.pathIndex,
      ),
    );
    expect(resolvedPathIndexes[0]).toBe(2);
    expect(new Set(resolvedPathIndexes).size).toBe(2);
    expect(resolvedPathIndexes.every((pathIndex) => validPathIndexes.has(pathIndex))).toBe(true);
    expect(handles.every((handle) => handle.positionSource === "manual-override")).toBe(true);
    expect(corridor.pathCells).toEqual(originalPathCells);
    expect(corridor.floorCells).toEqual(originalFloorCells);
  });

  test("suppresses removed stair markers with resettable render-only tombstones", () => {
    const config = buildConfig({
      seed: "removed-stair-marker",
      roomCount: 5,
      enableDerivedRoomLevelStairs: true,
    });
    const corridorId = "manual-edge-region-1-region-2-removed-stair";
    const generatedMap = generateMap(config, {
      customConnections: [
        {
          id: corridorId,
          from: "region-1",
          to: "region-2",
          kind: "manual",
          locked: true,
        },
      ],
      levels: {
        regions: {
          "region-1": 0,
          "region-2": 2,
        },
      },
    });
    const corridor = generatedMap.corridors.find((candidate) => candidate.id === corridorId);
    const originalPathCells = structuredClone(corridor.pathCells);
    const originalFloorCells = structuredClone(corridor.floorCells);
    const automaticHandles = getMapStairMarkerEditorHandles(generatedMap).filter(
      (handle) => handle.corridorId === corridorId,
    );
    const removedMarker = automaticHandles[0];
    const tombstone = createStairMarkerRemovalOverride({
      corridorId,
      markerIndex: removedMarker.markerIndex,
    });
    const markerOverrides = {
      [removedMarker.id]: tombstone,
    };
    const remainingHandles = getMapStairMarkerEditorHandles(
      generatedMap,
      markerOverrides,
    ).filter((handle) => handle.corridorId === corridorId);
    const resetHandles = getMapStairMarkerEditorHandles(
      generatedMap,
      {},
    ).filter((handle) => handle.corridorId === corridorId);

    expect(tombstone).toEqual(
      expect.objectContaining({
        corridorId,
        markerIndex: removedMarker.markerIndex,
        removed: true,
      }),
    );
    expect(automaticHandles).toHaveLength(2);
    expect(remainingHandles).toHaveLength(1);
    expect(remainingHandles.map((handle) => handle.id)).not.toContain(removedMarker.id);
    expect(resetHandles.map((handle) => handle.id)).toEqual(
      automaticHandles.map((handle) => handle.id),
    );
    expect(corridor.pathCells).toEqual(originalPathCells);
    expect(corridor.floorCells).toEqual(originalFloorCells);
  });

  test("wires stair marker reset and remove actions without generation changes", () => {
    const pagePath = repoPath(
      "features",
      "darken-location",
      "map-generator",
      "map-generator.page.jsx",
    );
    const mapPage = readSourceText(pagePath);
    const resetBody =
      mapPage.match(
        /function resetStairMarkerPosition\([\s\S]*?\n  }\n\n  function removeStairMarker/,
      )?.[0] || "";
    const removeBody =
      mapPage.match(
        /function removeStairMarker\([\s\S]*?\n  }\n\n  function moveRoom/,
      )?.[0] || "";

    expect(mapPage).toContain("onStairMarkerContextMenu");
    expect(mapPage).toContain("Reset Position");
    expect(mapPage).toContain("Remove Stair Marker");
    expect(resetBody).toContain("delete stairMarkers[markerId]");
    expect(resetBody).toContain("updateManualOverridesWithHistory");
    expect(resetBody).not.toContain("generateMap");
    expect(removeBody).toContain("createStairMarkerRemovalOverride");
    expect(removeBody).toContain("updateManualOverridesWithHistory");
    expect(removeBody).not.toContain("freezeCurrentRoomLayout");
    expect(removeBody).not.toContain("generateMap");
  });

  test("keeps persistent stair positions out of map generation inputs", () => {
    const pagePath = repoPath(
      "features",
      "darken-location",
      "map-generator",
      "map-generator.page.jsx",
    );
    const mapPage = readSourceText(pagePath);
    const generationOverrideBody =
      mapPage.match(
        /function createGenerationManualOverrides\([\s\S]*?\n}\n\nfunction createLockedGenerationManualSnapshot/,
      )?.[0] || "";
    const moveStairMarkerBody =
      mapPage.match(/function moveStairMarker\([\s\S]*?\n  }\n\n  function moveRoom/)?.[0] || "";

    expect(generationOverrideBody).toContain("delete generationOverrides.stairMarkers");
    expect(moveStairMarkerBody).toContain("updateManualOverridesWithHistory");
    expect(moveStairMarkerBody).toContain("stairMarkers");
    expect(moveStairMarkerBody).not.toContain("freezeCurrentRoomLayout");
    expect(moveStairMarkerBody).not.toContain("generateMap");
  });

  test("exposes live composer room hotspots with readiness instrumentation", () => {
    const pageSource = readSourceText(
      repoPath("features", "darken-location", "map-generator", "map-generator.page.jsx"),
    );
    const renderSource = readSourceText(
      repoPath("features", "darken-location", "map-generator", "map-generator.render.jsx"),
    );
    const stageSource = readSourceText(
      repoPath("features", "darken-location", "composer", "components", "LocationMapStage.jsx"),
    );

    expect(pageSource).toContain("enablePreviewRegionHotspots={inlineComposerEditor}");
    expect(pageSource).toContain("previewRegionStatuses={previewRegionStatuses}");
    expect(renderSource).toContain('data-testid="dark-places-room-node"');
    expect(renderSource).toContain("data-room-status={roomStatus}");
    expect(renderSource).toContain("data-room-status={getPreviewRegionStatus(editorOptions.previewRegionStatuses, region)}");
    expect(renderSource).toContain("aria-pressed={isPreviewRegionTarget(region, editorOptions.selectedRegionId)}");
    expect(stageSource).toContain("getRoomProgramEntries(state, generatedMapPreview)");
  });

  test("renders stair selection hit zones and a selected marker highlight", () => {
    const config = buildConfig({
      seed: "stair-selection-overlay",
      roomCount: 5,
      enableDerivedRoomLevelStairs: true,
    });
    const manualCorridorId = "manual-edge-region-1-region-2-stair-selection";
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
          "region-2": 2,
        },
      },
    });
    const allHandles = getMapStairMarkerEditorHandles(generatedMap);
    const handles = allHandles.filter(
      (handle) => handle.corridorId === manualCorridorId,
    );

    expect(handles).toHaveLength(2);
    const markup = renderToStaticMarkup(
      renderEditorOverlays(generatedMap, {
        selectedStairMarkerId: handles[0].id,
      }),
    );

    expect(markup).toContain('class="stair-marker-selection"');
    expect(markup).toContain(`data-stair-marker-id="${handles[0].id}"`);
    expect(markup).toContain('class="stair-marker-hit-zone is-selected"');
    expect(markup).toContain('aria-pressed="true"');
    allHandles.forEach((handle) => {
      expect(markup).toContain(`data-stair-marker-id="${handle.id}"`);
    });
  });

  test("can derive stair markers from manually assigned room levels when enabled", () => {
    const config = buildConfig({
      seed: "room-level-derived-stairs",
      roomCount: 5,
      enableDerivedRoomLevelStairs: true,
    });
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
    expect(getRenderedCorridorStairMarkerCount(corridor, generatedMap)).toBe(3);
    expect(getCorridorStairMarkerVirtualDoors(corridor, generatedMap)).toHaveLength(3);
    expect(getCorridorLevelShiftLabel(corridor)).toBe("↓3");
    expect(getCorridorLevelShiftDescription(corridor)).toContain("Level 0 to Level -3");
    expect(getCorridorStairMarkerVirtualDoors(corridor, generatedMap)[0]).toEqual(
      expect.objectContaining({
        derivedRoomLevelStair: true,
        markerIndex: 0,
        markerCount: 3,
      }),
    );
  });

  test("filters level views and labels nonzero room levels", () => {
    const config = buildConfig({
      seed: "level-view-filter",
      roomCount: 5,
      enableDerivedRoomLevelStairs: true,
    });
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
    expect(SVG_STYLE).toContain(".corridor-level-shift__badge");
    expect(MAP_VISUAL_STYLE).toContain(".map-style-cruor .corridor-level-shift__badge");
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

  test(
    "changes topology when seed, room count, or context changes",
    () => {
      const checks = runGoldenSeedChecks(buildConfig());

      expect(
        checks.passed,
        checks.tests
          .filter((item) => !item.passed)
          .map((item) => item.label)
          .join("\n"),
      ).toBe(true);
    },
    GOLDEN_SEED_TEST_TIMEOUT_MS,
  );

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

  test("defaults map walls to precise and keeps style menu widths aligned", () => {
    const page = readFileSync(
      repoPath("features", "darken-location", "map-generator", "map-generator.page.jsx"),
      "utf8",
    );
    const styles = readFileSync(
      repoPath("features", "darken-location", "map-generator", "map-generator.styles.css"),
      "utf8",
    );
    const dropdownStyles = readFileSync(
      repoPath("shared", "styles", "dropdowns.css"),
      "utf8",
    );

    expect(page).toContain('const [wallDrawingStyle, setWallDrawingStyle] = useState("precise")');
    expect(page).toContain("const rootWidth = 210");
    expect(page).toContain("const flyoutWidth = 210");
    expect(styles).toContain('width: min(210px, calc(100vw - 48px))');
    expect(styles).toContain("box-sizing: border-box");
    expect(styles).toContain('width: min(210px, calc(100vw - 230px))');
    expect(styles).not.toContain('width: min(318px, calc(100vw - 230px))');

    const portalPanelRule =
      styles.match(
        /\.location-map-toolbar__style-panel\[data-style-floating="portal"\] \{[\s\S]*?\n\}/,
      )?.[0] || "";
    const portalGlassRule =
      dropdownStyles.match(
        /\.cruor-dropdown-menu--context\[data-style-floating="portal"\]::before \{[\s\S]*?\n\}/,
      )?.[0] || "";
    const portalFlyoutRule =
      dropdownStyles.match(
        /\.cruor-dropdown-menu \{[\s\S]*?\n\}/,
      )?.[0] || "";

    expect(portalPanelRule).toContain("backdrop-filter: none");
    expect(portalGlassRule).toContain("backdrop-filter: blur(18px) saturate(128%)");
    expect(portalFlyoutRule).toContain("backdrop-filter: blur(18px) saturate(128%)");
  });

  test("uses opaque floor fills in generated SVG styles", () => {
    expect(SVG_STYLE).toContain(".floor-fill{fill:#685D61;stroke:none}");
    expect(SVG_STYLE).toContain(".door-symbols .stair-mark__arrow path");
    expect(SVG_STYLE).toContain(".stair-marker-hit-zone");
    expect(SVG_STYLE).toContain(".stair-marker-selection__edge");
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

  test("hides stair direction arrows by default and renders them when enabled", () => {
    const config = buildConfig({
      seed: "stair-arrow-visibility",
      roomCount: 5,
      enableDerivedRoomLevelStairs: true,
    });
    const manualCorridorId = "manual-edge-region-1-region-2-stair-arrow-visibility";
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
      },
    });

    const hiddenMarkup = renderToStaticMarkup(renderDoorSymbols(generatedMap));
    const visibleMarkup = renderToStaticMarkup(
      renderDoorSymbols(generatedMap, { showStairArrows: true }),
    );

    expect(hiddenMarkup).toContain('class="stair-mark ');
    expect(hiddenMarkup).not.toContain('class="stair-mark__arrow"');
    expect(visibleMarkup).toContain('class="stair-mark__arrow"');
  });

  test("exposes visual SVG classes for advanced corridor types", () => {
    expect(SVG_STYLE).toContain(".corridor-type-narrow__wall-main");
    expect(SVG_STYLE).toContain(".corridor-type-secret__wall-main path{stroke-dasharray:10 10}");
    expect(SVG_STYLE).not.toContain("corridor-type-secret__shadow-erase");
    expect(SVG_STYLE).not.toContain("corridor-type-narrow__wall-erase");
    expect(SVG_STYLE).toContain(".corridor-type-collapsed__rubble");
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

  test("renders narrow and secret corridors with wall-grammar overlays", () => {
    const config = buildConfig({ seed: "corridor-wall-grammar", roomCount: 5 });
    const narrowId = "manual-edge-region-1-region-2-narrow-wall-grammar";
    const secretId = "manual-edge-region-2-region-3-secret-wall-grammar";
    const generatedMap = generateMap(config, {
      customConnections: [
        { id: narrowId, from: "region-1", to: "region-2", kind: "manual", locked: true },
        { id: secretId, from: "region-2", to: "region-3", kind: "manual", locked: true },
      ],
      corridorTypes: {
        [narrowId]: "narrow",
        [secretId]: "secret",
      },
    });
    const accentLayer = renderCorridorTypeWallAccents(generatedMap);

    expect(accentLayer).toBeTruthy();
    const children = Array.isArray(accentLayer.props.children)
      ? accentLayer.props.children
      : [accentLayer.props.children];
    const narrowLayer = children.find((child) => child?.props?.["data-corridor-visual-width"] === "half-cell");
    expect(narrowLayer).toBeTruthy();
    expect(children.some((child) => child?.props?.["data-corridor-wall-style"] === "dashed")).toBe(true);
    expect(JSON.stringify(children)).not.toContain("shadow-erase");
    expect(JSON.stringify(children)).not.toContain("wall-erase");
    expect(JSON.stringify(narrowLayer)).not.toContain("corridor-type-narrow__erase-fill");
    expect(JSON.stringify(narrowLayer)).not.toContain("corridor-type-narrow__floor-ribbon");
    expect(JSON.stringify(narrowLayer)).not.toContain("corridor-type-narrow__floor-line");
  });

  test("uses the narrow corridor surface as the actual floor and grid clip", () => {
    const config = buildConfig({ seed: "narrow-surface-clip", roomCount: 5 });
    const narrowId = "manual-edge-region-1-region-2-narrow-surface-clip";
    const generatedMap = generateMap(config, {
      customConnections: [
        { id: narrowId, from: "region-1", to: "region-2", kind: "manual", locked: true },
      ],
      corridorTypes: {
        [narrowId]: "narrow",
      },
    });
    const corridor = generatedMap.corridors.find((candidate) => candidate.id === narrowId);
    expect(corridor).toBeTruthy();

    const surface = createCorridorSurface(corridor, generatedMap, config.gridSize);
    const fullCellPath = corridor.floorCells
      .map((cell) => `M${cell.x * config.gridSize} ${cell.y * config.gridSize}`)
      .find(Boolean);

    expect(surface.geometryKind).toBe("narrow-corridor-mask");
    expect(surface.visualFloorPath).toContain("Z");
    expect(surface.visualFloorPath).not.toContain(fullCellPath);
    expect(getMapSurface(generatedMap).visualFloorPath).toContain(surface.visualFloorPath);
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

  test("hardens map state export manifest and level UI state", () => {
    const config = buildConfig({
      seed: "state-export-manifest",
      roomCount: 5,
      enableDerivedRoomLevelStairs: true,
    });
    const manualCorridorId = "manual-edge-region-1-region-2-export-manifest";
    const manualOverrides = {
      corridorTypes: {
        [manualCorridorId]: "secret",
      },
      levels: {
        regions: {
          "region-1": 0,
          "region-2": -2,
        },
      },
      stairMarkers: {
        [`stair-marker:${manualCorridorId}:0`]: {
          corridorId: manualCorridorId,
          markerIndex: 0,
          pathIndex: 2,
          normalizedOffset: 0.5,
          pathCellKey: "2,0",
          cell: { x: 2, y: 0 },
        },
      },
      customConnections: [
        { id: manualCorridorId, from: "region-1", to: "region-2", kind: "manual", locked: true },
      ],
    };
    const generatedMap = generateMap(config, manualOverrides);
    const manifest = createMapStateExportManifest(
      config,
      manualOverrides,
      generatedMap,
      { levelView: -2, fadeOtherLevels: false, showStairArrows: true },
    );
    const payload = buildMapStatePayload(
      config,
      manualOverrides,
      { levelView: -2, fadeOtherLevels: false, showStairArrows: true },
      generatedMap,
    );
    const parsed = parseMapStatePayload(JSON.stringify(payload));

    expect(normalizeMapUiState({ levelView: 99 }, generatedMap).levelView).toBe("all");
    expect(normalizeMapUiState({}, generatedMap).showStairArrows).toBe(false);
    expect(manifest.schema).toBe("cruor-map-generator-export-manifest");
    expect(manifest.levelView).toBe(-2);
    expect(manifest.fadeOtherLevels).toBe(false);
    expect(manifest.levels.available).toContain(-2);
    expect(manifest.counts.manualCorridorTypes).toBe(1);
    expect(manifest.counts.manualRoomLevels).toBe(2);
    expect(manifest.counts.manualStairMarkers).toBe(1);
    expect(manifest.counts.manualPositionedStairMarkers).toBe(1);
    expect(manifest.counts.manualRemovedStairMarkers).toBe(0);
    expect(manifest.manualOverrideSchemaVersion).toBe(
      MANUAL_OVERRIDE_SCHEMA_VERSION,
    );
    expect(manifest.counts.crossLevelCorridors).toBeGreaterThan(0);
    expect(manifest.counts.derivedStairCorridors).toBeGreaterThan(0);
    expect(manifest.corridorTypes.secret).toBeGreaterThan(0);
    expect(payload.version).toBe(3);
    expect(payload.exportManifest).toEqual(manifest);
    expect(parsed.uiState.levelView).toBe(-2);
    expect(parsed.uiState.fadeOtherLevels).toBe(false);
    expect(parsed.uiState.showStairArrows).toBe(true);
    expect(parsed.exportManifest.levelView).toBe(-2);
  });

  test("round-trips positioned and removed stair markers without duplication", () => {
    const config = buildConfig({
      seed: "stair-export-import-roundtrip",
      gridSize: 20,
    });
    const corridor = {
      id: "stair-export-import-corridor",
      from: "region-1",
      to: "region-2",
      floorCells: Array.from({ length: 8 }, (_, x) => ({ x, y: 0 })),
      pathCells: Array.from({ length: 8 }, (_, x) => ({ x, y: 0 })),
      doors: [
        { corridorId: "stair-export-import-corridor", outsideCell: { x: 1, y: 0 } },
        { corridorId: "stair-export-import-corridor", outsideCell: { x: 6, y: 0 } },
      ],
      corridorType: "normal",
      isRoomLink: false,
    };
    const generatedMap = {
      seed: config.seed,
      config,
      regions: [
        { id: "region-1", level: 0, cells: [{ x: 0, y: 0 }] },
        { id: "region-2", level: 2, cells: [{ x: 7, y: 0 }] },
      ],
      corridors: [corridor],
      dungeonMask: {
        doorSegments: [
          { corridorId: corridor.id, outsideCell: { x: 1, y: 0 } },
          { corridorId: corridor.id, outsideCell: { x: 6, y: 0 } },
        ],
      },
    };
    const originalTopology = {
      pathCells: structuredClone(corridor.pathCells),
      floorCells: structuredClone(corridor.floorCells),
    };
    const automaticHandles = getMapStairMarkerEditorHandles(generatedMap).filter(
      (handle) => handle.corridorId === corridor.id,
    );
    const dragTargets = getCorridorStairMarkerDragTargets(corridor, generatedMap);
    const movedTarget = dragTargets.find(
      (target) =>
        !automaticHandles.some((handle) => handle.pathIndex === target.pathIndex),
    );

    expect(automaticHandles).toHaveLength(2);
    expect(movedTarget).toBeTruthy();

    const manualOverrides = {
      stairMarkers: {
        [automaticHandles[0].id]: createStairMarkerPositionOverride({
          corridorId: corridor.id,
          markerIndex: automaticHandles[0].markerIndex,
          pathIndex: movedTarget.pathIndex,
          pathLength: movedTarget.pathLength,
          cell: movedTarget.cell,
        }),
        [automaticHandles[1].id]: createStairMarkerRemovalOverride({
          corridorId: corridor.id,
          markerIndex: automaticHandles[1].markerIndex,
        }),
      },
    };
    const originalOverrides = structuredClone(manualOverrides);
    const payload = buildMapStatePayload(
      config,
      manualOverrides,
      { levelView: "all" },
      generatedMap,
    );
    const parsed = parseMapStatePayload(JSON.stringify(payload));
    const restoredHandles = getMapStairMarkerEditorHandles(
      generatedMap,
      parsed.manualOverrides.stairMarkers,
    ).filter((handle) => handle.corridorId === corridor.id);
    const restoredDoors = getCorridorStairMarkerVirtualDoors(
      corridor,
      generatedMap,
      parsed.manualOverrides.stairMarkers,
    );
    const reparsed = parseMapStatePayload(
      JSON.stringify(
        buildMapStatePayload(
          config,
          parsed.manualOverrides,
          parsed.uiState,
          generatedMap,
        ),
      ),
    );

    expect(payload.exportManifest.counts.manualStairMarkers).toBe(2);
    expect(payload.exportManifest.counts.manualPositionedStairMarkers).toBe(1);
    expect(payload.exportManifest.counts.manualRemovedStairMarkers).toBe(1);
    expect(restoredHandles).toHaveLength(1);
    expect(restoredDoors).toHaveLength(1);
    expect(restoredHandles[0]).toEqual(
      expect.objectContaining({
        id: automaticHandles[0].id,
        pathIndex: movedTarget.pathIndex,
        positionSource: "manual-override",
      }),
    );
    expect(restoredHandles.map((handle) => handle.id)).not.toContain(
      automaticHandles[1].id,
    );
    expect(parsed.manualOverrides.stairMarkers[automaticHandles[1].id]).toEqual({
      corridorId: corridor.id,
      markerIndex: automaticHandles[1].markerIndex,
      pathIndex: 0,
      normalizedOffset: null,
      pathCellKey: "",
      removed: true,
    });
    expect(reparsed.manualOverrides.stairMarkers).toEqual(
      parsed.manualOverrides.stairMarkers,
    );
    expect(manualOverrides).toEqual(originalOverrides);
    expect(corridor.pathCells).toEqual(originalTopology.pathCells);
    expect(corridor.floorCells).toEqual(originalTopology.floorCells);
  });

  test("canonicalizes legacy and malformed stair marker overrides during import", () => {
    const parsed = parseMapStatePayload(
      JSON.stringify({
        schema: "cruor-map-generator-state",
        version: 2,
        config: { seed: "legacy-stair-import" },
        manualOverrides: {
          manualStairMarkers: {
            "legacy-position": {
              corridorId: "legacy-corridor",
              markerIndex: "1.6",
              pathIndex: "-5",
              normalizedOffset: "1.4",
              cell: { x: 2.6, y: 3.2 },
            },
            "legacy-removed": {
              corridorId: "legacy-corridor",
              markerIndex: 0,
              pathIndex: 99,
              normalizedOffset: 0.9,
              pathCellKey: "99,99",
              cell: { x: 99, y: 99 },
              removed: true,
            },
            "missing-corridor": {
              markerIndex: 0,
              pathIndex: 1,
            },
          },
        },
        uiState: {},
      }),
    );

    expect(parsed.version).toBe(2);
    expect(parsed.manualOverrides.schemaVersion).toBe(
      MANUAL_OVERRIDE_SCHEMA_VERSION,
    );
    expect(parsed.manualOverrides.stairMarkers["legacy-position"]).toEqual({
      corridorId: "legacy-corridor",
      markerIndex: 2,
      pathIndex: 0,
      normalizedOffset: 1,
      pathCellKey: "3,3",
      removed: false,
      cell: { x: 3, y: 3 },
    });
    expect(parsed.manualOverrides.stairMarkers["legacy-removed"]).toEqual({
      corridorId: "legacy-corridor",
      markerIndex: 0,
      pathIndex: 0,
      normalizedOffset: null,
      pathCellKey: "",
      removed: true,
    });
    expect(
      parsed.manualOverrides.stairMarkers["missing-corridor"],
    ).toBeUndefined();
  });

  test("serializes SVG export modes and strips player-only secret hints", () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "cruor-map-svg");
    svg.setAttribute("data-level-view", "-1");

    const editor = document.createElementNS("http://www.w3.org/2000/svg", "g");
    editor.setAttribute("class", "editor-overlays");
    editor.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "path"));
    svg.appendChild(editor);

    const labels = document.createElementNS("http://www.w3.org/2000/svg", "g");
    labels.setAttribute("class", "labels");
    svg.appendChild(labels);

    const secretCorridor = document.createElementNS("http://www.w3.org/2000/svg", "g");
    secretCorridor.setAttribute("class", "corridor-type-accent corridor-type-secret");
    secretCorridor.setAttribute("data-corridor-type", "secret");
    svg.appendChild(secretCorridor);

    const secretDoor = document.createElementNS("http://www.w3.org/2000/svg", "path");
    secretDoor.setAttribute("class", "secret-door-opening");
    svg.appendChild(secretDoor);

    const gm = serializeSvg(svg, { mode: "gm" });
    const player = serializeSvg(svg, {
      mode: "player",
      hideSecretDoors: true,
      hideSecretCorridorHints: true,
      removeLabels: true,
    });

    expect(gm).toContain('data-export-mode="gm"');
    expect(gm).toContain("corridor-type-secret");
    expect(player).toContain('data-export-mode="player"');
    expect(player).toContain('data-export-player-safe="true"');
    expect(player).not.toContain("editor-overlays");
    expect(player).not.toContain('class="labels"');
    expect(player).not.toContain("corridor-type-secret");
    expect(player).not.toContain("secret-door-opening");
    expect(player).toContain('data-level-view="-1"');
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
      stairMarkers: {
        "stair-marker:manual-edge-region-1-region-2-1:0": {
          corridorId: "manual-edge-region-1-region-2-1",
          markerIndex: 0,
          pathIndex: 3,
          normalizedOffset: 0.375,
          pathCellKey: "35,20",
          cell: { x: 35, y: 20 },
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
    expect(parsed.manualOverrides.stairMarkers["stair-marker:manual-edge-region-1-region-2-1:0"]).toEqual(
      expect.objectContaining({
        corridorId: "manual-edge-region-1-region-2-1",
        markerIndex: 0,
        pathIndex: 3,
        normalizedOffset: 0.375,
        pathCellKey: "35,20",
        cell: { x: 35, y: 20 },
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
