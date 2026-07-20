import { describe, expect, it } from "vitest";
import { ROOM_SHAPE_KIND_OPTIONS } from "../../../shared/content/contracts/room-shapes.js";
import {
  applyRoomDesignSizeConstraints,
  getEngineShapeFromRoomDesignKind,
} from "./map-generator.room-design.js";
import {
  createPlacedRegion,
  resolveRoomShapeSelection,
} from "./map-generator.layout.js";
import { normalizeManualOverrides } from "./map-generator.state.js";
import { generateMap } from "./map-generator.pipeline.js";
import {
  buildRoomMask,
  cellKey,
  getCellNeighbors,
  normalizeLegacyRoomShapeForMask,
  parseCellKey,
} from "./map-generator.mask.js";

function createRng(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function buildShape(kind, seed = 1, modifiers = []) {
  return buildRoomMask(
    {
      id: `shape-${kind}`,
      shape: kind,
      cellRect: { x: 3, y: 4, w: 9, h: 9 },
      shapeOptions: { roomDesignModifiers: modifiers },
    },
    createRng(seed),
  );
}

function isConnected(cells) {
  const keys = [...cells];
  if (!keys.length) return false;
  const visited = new Set([keys[0]]);
  const queue = [parseCellKey(keys[0])];
  while (queue.length) {
    const cell = queue.shift();
    getCellNeighbors(cell).forEach((neighbor) => {
      const key = cellKey(neighbor.x, neighbor.y);
      if (!cells.has(key) || visited.has(key)) return;
      visited.add(key);
      queue.push(neighbor);
    });
  }
  return visited.size === cells.size;
}

function sortedCells(cells) {
  return [...cells].sort();
}

describe("semantic room shape geometry", () => {
  it("preserves every semantic shape identity at the engine boundary", () => {
    ROOM_SHAPE_KIND_OPTIONS.forEach((kind) => {
      expect(getEngineShapeFromRoomDesignKind(kind)).toBe(kind);
    });
  });

  it("builds a viable connected footprint for every supported shape", () => {
    ROOM_SHAPE_KIND_OPTIONS.forEach((kind, index) => {
      const cells = buildShape(kind, index + 1);
      expect(cells.size, kind).toBeGreaterThan(0);
      expect(isConnected(cells), kind).toBe(true);
      [...cells].map(parseCellKey).forEach((cell) => {
        expect(cell.x, kind).toBeGreaterThanOrEqual(3);
        expect(cell.x, kind).toBeLessThan(12);
        expect(cell.y, kind).toBeGreaterThanOrEqual(4);
        expect(cell.y, kind).toBeLessThan(13);
      });
    });
  });

  it("keeps a minimum niche footprint large enough for authored area constraints", () => {
    for (let seed = 1; seed <= 24; seed += 1) {
      const cells = buildRoomMask(
        {
          id: `minimum-niche-${seed}`,
          shape: "niche",
          cellRect: { x: 3, y: 4, w: 5, h: 4 },
          shapeOptions: { roomDesignModifiers: [] },
        },
        createRng(seed),
      );
      expect(cells.size, `seed ${seed}`).toBeGreaterThanOrEqual(14);
      expect(isConnected(cells), `seed ${seed}`).toBe(true);
    }
  });

  it("uses dedicated footprints for the formerly collapsed shapes", () => {
    const hall = buildShape("hall", 11);
    const gallery = buildShape("gallery", 11);
    const tShape = buildShape("t-shape", 11);
    const cross = buildShape("cross", 11);
    const alcove = buildShape("alcove", 11);
    const niche = buildShape("niche", 11);
    const irregular = buildShape("irregular", 11);
    const cave = buildShape("cave", 11);

    expect(sortedCells(gallery)).not.toEqual(sortedCells(hall));
    expect(sortedCells(tShape)).not.toEqual(sortedCells(cross));
    expect(sortedCells(niche)).not.toEqual(sortedCells(alcove));
    expect(sortedCells(irregular)).not.toEqual(sortedCells(cave));
  });

  it("creates true T and cross footprints instead of generic notches", () => {
    const tShape = buildShape("t-shape", 7);
    const cross = buildShape("cross", 7);
    const center = cellKey(7, 8);

    expect(tShape.has(center)).toBe(true);
    expect(cross.has(center)).toBe(true);
    expect(cross.has(cellKey(3, 4))).toBe(false);
    expect(cross.has(cellKey(11, 12))).toBe(false);
    expect(tShape.size).toBeLessThan(81);
    expect(cross.size).toBeLessThan(81);
  });

  it("enforces shape-specific minimums and equal dimensions", () => {
    expect(
      applyRoomDesignSizeConstraints(
        { w: 4, h: 3 },
        { shape: { kind: "square" } },
      ),
    ).toEqual({ w: 4, h: 4 });
    expect(
      applyRoomDesignSizeConstraints(
        { w: 4, h: 3 },
        { shape: { kind: "gallery" } },
      ),
    ).toEqual({ w: 7, h: 3 });
    expect(
      applyRoomDesignSizeConstraints(
        { w: 3, h: 3 },
        { shape: { kind: "t-shape" } },
      ),
    ).toEqual({ w: 5, h: 5 });
  });

  it("preserves semantic footprints through placement, archetype inference, and routing", () => {
    const semanticShapes = [
      "square",
      "gallery",
      "t-shape",
      "cross",
      "niche",
      "irregular",
    ];
    const map = generateMap({
      seed: "semantic-shape-pipeline",
      context: "Crypt",
      biome: "Crypt",
      roomCount: semanticShapes.length,
      gridSize: 20,
      mapWidth: 1600,
      mapHeight: 900,
      contextGraphAdapterMode: "safe",
      regions: semanticShapes.map((shape, index) => ({
        id: `semantic-${shape}`,
        name: shape,
        role:
          index === 0
            ? "Entrance"
            : index === semanticShapes.length - 1
              ? "Final Room"
              : "Side Room",
        size: "Large",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: shape },
          size: {
            minWidthCells: shape === "niche" ? 4 : 7,
            minHeightCells: shape === "niche" ? 4 : 6,
          },
        },
      })),
    });

    semanticShapes.forEach((shape) => {
      const region = map.regions.find(
        (item) => item.id === `semantic-${shape}`,
      );
      expect(region?.shape).toBe(shape);
      expect(region?.shapeOptions?.maskProfile || "").toBe("");
      expect(region?.floorCells?.length).toBeGreaterThan(0);
      expect(
        map.corridors.some(
          (corridor) =>
            corridor.from === region.id || corridor.to === region.id,
        ),
      ).toBe(true);
    });

    const square = map.regions.find((region) => region.shape === "square");
    expect(square.floorCells).toHaveLength(
      square.cellRect.w * square.cellRect.h,
    );
  });

  it("makes the symmetrical modifier geometrically effective", () => {
    const base = buildShape("irregular", 19);
    const symmetrical = buildShape("irregular", 19, ["symmetrical"]);
    expect(sortedCells(symmetrical)).not.toEqual(sortedCells(base));

    const { x, y, w, h } = { x: 3, y: 4, w: 9, h: 9 };
    [...symmetrical].map(parseCellKey).forEach((cell) => {
      expect(symmetrical.has(cellKey(x + w - 1 - (cell.x - x), cell.y))).toBe(
        true,
      );
      expect(symmetrical.has(cellKey(cell.x, y + h - 1 - (cell.y - y)))).toBe(
        true,
      );
    });
  });
  it("uses Rectangle plus Notch for generated Mine structural rooms", () => {
    const region = {
      id: "mine-office",
      name: "Mine office",
      role: "Side Room",
      tags: [],
      sourceAnchors: [],
    };
    const selection = resolveRoomShapeSelection(region, "mine");
    const placed = createPlacedRegion(
      region,
      selection.shape,
      { x: 3, y: 4, w: 7, h: 6 },
      { gridSize: 20 },
      "mine",
      1,
      selection.modifiers,
    );

    expect(selection).toEqual({ shape: "rect", modifiers: ["notch"] });
    expect(placed.shape).toBe("rect");
    expect(placed.shapeOptions?.notch).toBe(true);
    expect(placed.shapeOptions?.roomDesignModifiers).toContain("notch");
  });

  it("stores legacy notched intent as Rectangle plus the Notch modifier", () => {
    const region = {
      id: "legacy-notched-room",
      name: "Legacy notched room",
      role: "Side Room",
      preferredShape: "notched",
      roomDesign: { shape: { kind: "notched" } },
    };
    const selection = resolveRoomShapeSelection(region, "crypt");
    const placed = createPlacedRegion(
      region,
      selection.shape,
      { x: 3, y: 4, w: 7, h: 6 },
      { gridSize: 20 },
      "crypt",
      1,
      selection.modifiers,
    );

    expect(selection.shape).toBe("rect");
    expect(placed.shape).toBe("rect");
    expect(placed.shapeOptions?.notch).toBe(true);
    expect(placed.shapeOptions?.roomDesignModifiers).toContain("notch");
  });

  it("migrates saved manual Notched shapes into Rectangle plus Notch", () => {
    const normalized = normalizeManualOverrides({
      schemaVersion: 4,
      roomStyles: {
        legacy: { shape: "notched", sizePreset: "Large" },
      },
    });

    expect(normalized.schemaVersion).toBe(5);
    expect(normalized.roomStyles.legacy).toMatchObject({
      shape: "rect",
      notch: true,
      sizePreset: "Large",
    });
  });

  it("renders legacy Notched masks through the canonical modifier path", () => {
    const legacyRoom = {
      id: "legacy-mask",
      shape: "notched",
      cellRect: { x: 3, y: 4, w: 9, h: 9 },
    };
    const canonicalRoom = {
      ...legacyRoom,
      shape: "rect",
      shapeOptions: {
        notch: true,
        roomDesignModifiers: ["notch"],
      },
    };

    expect(normalizeLegacyRoomShapeForMask(legacyRoom)).toMatchObject({
      shape: "rect",
      shapeOptions: {
        notch: true,
        roomDesignModifiers: ["notch"],
      },
    });
    expect(sortedCells(buildRoomMask(legacyRoom, createRng(23)))).toEqual(
      sortedCells(buildRoomMask(canonicalRoom, createRng(23))),
    );
  });
});
