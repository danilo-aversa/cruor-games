import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyRoomCornerResizeToManualOverrides,
  canResizeRoomFromCorner,
  createRoomCornerResizeDraft,
  getRoomCornerResizeHandleGeometry,
} from "./map-generator.room-resize.js";
import { resizeRoomAroundCenter } from "./map-generator.layout.js";

const baseRegion = {
  id: "room-a",
  shape: "rect",
  cellRect: { x: 10, y: 8, w: 6, h: 4 },
};

function createDraft(region, pointerCell) {
  return createRoomCornerResizeDraft({
    region,
    pointer: { x: pointerCell.x * 20, y: pointerCell.y * 20 },
    gridSize: 20,
    mapWidth: 1200,
    mapHeight: 800,
  });
}

describe("room corner resize", () => {
  it("keeps the visible L above the generic SVG overlay path reset", () => {
    const styles = readFileSync(
      resolve(
        process.cwd(),
        "features/darken-location/map-generator/map-generator.styles.css",
      ),
      "utf8",
    );

    expect(styles).toContain(
      ".editor-overlays .room-resize-handle__backdrop",
    );
    expect(styles).toContain(
      ".editor-overlays .room-resize-handle__glyph",
    );
    expect(styles).toContain("stroke-width: 7");
    expect(styles).toContain("stroke-width: 3.5");
  });

  it("renders an offset L glyph outside the top-right wall", () => {
    const geometry = getRoomCornerResizeHandleGeometry(baseRegion, 20);

    expect(geometry).not.toBeNull();
    expect(geometry.path).toContain(`M ${geometry.cornerX - geometry.arm}`);
    expect(geometry.path).toContain(
      `L ${geometry.cornerX + geometry.outsideOffset}`,
    );
    expect(geometry.outsideOffset).toBeGreaterThan(0);
    expect(geometry.hitRect.x).toBeLessThan(geometry.cornerX);
    expect(geometry.hitRect.y).toBeLessThan(geometry.cornerY);
  });

  it("keeps a transparent hit bridge on both sides of the room corner", () => {
    const geometry = getRoomCornerResizeHandleGeometry(baseRegion, 20);
    const hitRight = geometry.hitRect.x + geometry.hitRect.width;
    const hitBottom = geometry.hitRect.y + geometry.hitRect.height;

    expect(geometry.hitRect.x).toBeLessThan(geometry.cornerX);
    expect(geometry.hitRect.y).toBeLessThan(geometry.cornerY);
    expect(hitRight).toBeGreaterThan(geometry.cornerX);
    expect(hitBottom).toBeGreaterThan(geometry.cornerY);
  });

  it("keeps the bottom-left anchor while resizing the top-right corner", () => {
    const draft = createDraft(baseRegion, { x: 19, y: 5 });

    expect(draft.cellRect).toEqual({ x: 10, y: 5, w: 9, h: 7 });
    expect(draft.position).toEqual({ x: 10, y: 5 });
    expect(draft.dragAnchorCorner).toBe("bottom-left");
    expect(draft.patch).toMatchObject({
      sizePreset: "Custom",
      customSize: {
        widthCells: 9,
        heightCells: 7,
        layoutAnchor: "top-left",
      },
    });
  });

  it("enforces equal dimensions for square shapes", () => {
    const draft = createDraft(
      { ...baseRegion, shape: "square" },
      { x: 18, y: 7 },
    );

    expect(draft.cellRect).toEqual({ x: 10, y: 4, w: 8, h: 8 });
    expect(draft.patch.customSize).toMatchObject({
      widthCells: 8,
      heightCells: 8,
    });
  });

  it("stores circular custom sizes as a radius", () => {
    const draft = createDraft(
      { ...baseRegion, shape: "circle", cellRect: { x: 10, y: 6, w: 6, h: 6 } },
      { x: 18, y: 4 },
    );

    expect(draft.widthCells).toBe(8);
    expect(draft.heightCells).toBe(8);
    expect(draft.patch.customSize).toMatchObject({
      radiusCells: 4,
      layoutAnchor: "top-left",
    });
  });

  it("respects shape minimum dimensions", () => {
    const draft = createDraft(
      { ...baseRegion, shape: "gallery" },
      { x: 11, y: 11 },
    );

    expect(draft.widthCells).toBeGreaterThanOrEqual(7);
    expect(draft.heightCells).toBeGreaterThanOrEqual(3);
  });

  it("applies the custom size without shifting the committed top-left position", () => {
    const positionedRegion = {
      ...baseRegion,
      cellRect: { ...baseRegion.cellRect, x: 10, y: 5 },
    };
    const resized = resizeRoomAroundCenter(
      positionedRegion,
      "Custom",
      {
        mapWidth: 1200,
        mapHeight: 800,
        gridSize: 20,
      },
      {
        shape: "rect",
        sizePreset: "Custom",
        customSize: {
          widthCells: 9,
          heightCells: 7,
          layoutAnchor: "top-left",
        },
      },
    );

    expect(resized.cellRect).toMatchObject({ x: 10, y: 5, w: 9, h: 7 });
  });

  it("commits position and Custom size in one manual override value", () => {
    const draft = createDraft(baseRegion, { x: 19, y: 5 });
    const previous = {
      roomPositions: { "room-b": { x: 2, y: 3 } },
      roomStyles: { "room-a": { ruined: true } },
    };
    const next = applyRoomCornerResizeToManualOverrides(
      previous,
      baseRegion.id,
      draft,
    );

    expect(next.roomPositions).toEqual({
      "room-b": { x: 2, y: 3 },
      "room-a": { x: 10, y: 5 },
    });
    expect(next.roomStyles["room-a"]).toMatchObject({
      ruined: true,
      sizePreset: "Custom",
      customSize: { widthCells: 9, heightCells: 7, layoutAnchor: "top-left" },
    });
    expect(previous.roomPositions["room-a"]).toBeUndefined();
  });

  it("does not expose the handle for Cave", () => {
    expect(canResizeRoomFromCorner({ ...baseRegion, shape: "cave" })).toBe(
      false,
    );
    expect(
      createDraft({ ...baseRegion, shape: "cave" }, { x: 20, y: 4 }),
    ).toBeNull();
  });
});
