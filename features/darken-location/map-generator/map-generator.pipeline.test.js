import { existsSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { DEFAULT_CONFIG } from "./map-generator.input.js";
import { applyManualConnectionsToGraph } from "./map-generator.graph.js";
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
  getCorridorTypeClassName,
  getRenderedCorridorStairMarkerCount,
  getRoomLevelBadgeLabel,
  renderCorridorTypeWallAccents,
} from "./map-generator.render.jsx";
import { generateMap } from "./map-generator.pipeline.js";
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
  createEditorStairLevelOverrides,
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
    const registryPath = new URL("./map-generator.debug-options.js", import.meta.url);
    const mapPagePath = new URL("./map-generator.page.jsx", import.meta.url);
    const composerPanelPath = new URL("../composer/components/LocationMapDetailsPanel.jsx", import.meta.url);
    const phantomPanelPath = new URL("../components/LocationMapDetailsPanel.jsx", import.meta.url);

    expect(existsSync(registryPath)).toBe(true);
    expect(existsSync(mapPagePath)).toBe(true);
    expect(existsSync(composerPanelPath)).toBe(true);
    expect(existsSync(phantomPanelPath)).toBe(false);

    const registry = readFileSync(registryPath, "utf8");
    const mapPage = readFileSync(mapPagePath, "utf8");
    const composerPanel = readFileSync(composerPanelPath, "utf8");

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
    const config = buildConfig({ seed: "state-export-manifest", roomCount: 5 });
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
      customConnections: [
        { id: manualCorridorId, from: "region-1", to: "region-2", kind: "manual", locked: true },
      ],
    };
    const generatedMap = generateMap(config, manualOverrides);
    const manifest = createMapStateExportManifest(
      config,
      manualOverrides,
      generatedMap,
      { levelView: -2, fadeOtherLevels: false },
    );
    const payload = buildMapStatePayload(
      config,
      manualOverrides,
      { levelView: -2, fadeOtherLevels: false },
      generatedMap,
    );
    const parsed = parseMapStatePayload(JSON.stringify(payload));

    expect(normalizeMapUiState({ levelView: 99 }, generatedMap).levelView).toBe("all");
    expect(manifest.schema).toBe("cruor-map-generator-export-manifest");
    expect(manifest.levelView).toBe(-2);
    expect(manifest.fadeOtherLevels).toBe(false);
    expect(manifest.levels.available).toContain(-2);
    expect(manifest.counts.manualCorridorTypes).toBe(1);
    expect(manifest.counts.manualRoomLevels).toBe(2);
    expect(manifest.counts.crossLevelCorridors).toBeGreaterThan(0);
    expect(manifest.counts.derivedStairCorridors).toBeGreaterThan(0);
    expect(manifest.corridorTypes.secret).toBeGreaterThan(0);
    expect(payload.version).toBe(3);
    expect(payload.exportManifest).toEqual(manifest);
    expect(parsed.uiState.levelView).toBe(-2);
    expect(parsed.uiState.fadeOtherLevels).toBe(false);
    expect(parsed.exportManifest.levelView).toBe(-2);
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
