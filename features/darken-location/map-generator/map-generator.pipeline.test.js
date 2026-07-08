import { describe, expect, test } from "vitest";
import { DEFAULT_CONFIG } from "./map-generator.input.js";
import { applyManualConnectionsToGraph } from "./map-generator.graph.js";
import { createMapRequestFromDarkenLocationState } from "../darken-location.map-request.js";
import { getLocationPreviewResetKey } from "../composer/model/location-composer-preview.js";
import { MAP_VISUAL_STYLE, SVG_STYLE } from "./map-generator.render.jsx";
import { generateMap } from "./map-generator.pipeline.js";
import {
  createMapSignature,
  runGoldenSeedChecks,
  validateGeneratedMap,
} from "./map-generator.debug.js";

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

  test("uses an opaque Cruor floor fill in generated SVG styles", () => {
    expect(SVG_STYLE).toContain(".floor-fill{fill:#685D61;stroke:none}");
    expect(MAP_VISUAL_STYLE).toContain(".map-style-cruor .floor-fill{fill:#685D61");
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

});
