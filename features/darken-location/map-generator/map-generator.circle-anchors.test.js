import { describe, expect, test } from "vitest";
import {
  createCircleDoorRoomExtensionAnchor,
  getCircleGeometryFromRegion,
} from "./map-generator.mask.js";
import {
  createCircleConnectionAnchorCandidates,
  createCircleDragAnchor,
  doesCircleAnchorCellTouchVisualCircle,
  getCircleAnchorCellCenter,
  getCircleAnchorRoutingCell,
} from "./map-generator.circle-anchors.js";
import {
  createCircleDoorMouthPath,
  getCircleCompositeSquareCells,
  getCirclePortalSquareWallSegments,
  getCirclePortalSupportCell,
} from "./map-generator.render.jsx";
import { getCircleRaccordoChainTouchCell } from "./map-generator.circle-raccordo.js";

const gridSize = 20;
const circleRegion = {
  id: "circle-room",
  shape: "circle",
  cellRect: { x: 10, y: 8, w: 8, h: 8 },
  floorCells: [],
};



function cellDistanceFromCircle(cell, circle) {
  return Math.hypot(cell.x + 0.5 - circle.cxCells, cell.y + 0.5 - circle.cyCells);
}

function cellRectCrossesCircle(cell, circle) {
  if (!cell || !circle) return false;
  const minX = cell.x;
  const minY = cell.y;
  const maxX = cell.x + 1;
  const maxY = cell.y + 1;
  const dx = Math.max(minX - circle.cxCells, 0, circle.cxCells - maxX);
  const dy = Math.max(minY - circle.cyCells, 0, circle.cyCells - maxY);
  const minDistance = Math.hypot(dx, dy);
  const maxDistance = Math.max(
    Math.hypot(minX - circle.cxCells, minY - circle.cyCells),
    Math.hypot(maxX - circle.cxCells, minY - circle.cyCells),
    Math.hypot(minX - circle.cxCells, maxY - circle.cyCells),
    Math.hypot(maxX - circle.cxCells, maxY - circle.cyCells),
  );
  return minDistance <= circle.rCells + 0.001 && maxDistance >= circle.rCells - 0.001;
}

function cellKey(cell) {
  return cell ? `${cell.x},${cell.y}` : "null";
}

function raccordoChainTouchesCircle(cells, circle) {
  return Boolean(getCircleRaccordoChainTouchCell(cells, circle, 0.001));
}

function expectExpandedRaccordoChainOutside(expanded, circle) {
  expect(expanded?.expandedCircleDoor).toBe(true);
  expect(expanded.portalRoomCell).toBeTruthy();
  expect(expanded.raccordoCell).toBeTruthy();
  expect(expanded.corridorStartCell || expanded.routingOutsideCell || expanded.outsideCell).toBeTruthy();
  expect(expanded.raccordoCells?.length || 0).toBeGreaterThan(0);
  expect(raccordoChainTouchesCircle(expanded.raccordoCells, circle)).toBe(true);
}

function expectExpandedCircleDoorOutside(expanded, circle) {
  expect(expanded?.expandedCircleDoor).toBe(true);
  expect(expanded.portalRoomCell).toBeTruthy();
  expect(expanded.outsideCell).toBeTruthy();
  const portalDistance = cellDistanceFromCircle(expanded.portalRoomCell, circle);
  const routingDistance = cellDistanceFromCircle(expanded.outsideCell, circle);
  expect(cellRectCrossesCircle(expanded.portalRoomCell, circle)).toBe(true);
  expect(routingDistance).toBeGreaterThan(portalDistance);
  expect(
    Math.abs(expanded.portalRoomCell.x - expanded.outsideCell.x) +
      Math.abs(expanded.portalRoomCell.y - expanded.outsideCell.y),
  ).toBe(1);
}

function distanceFromCircle(point, circle) {
  return Math.hypot(point.x - circle.cx, point.y - circle.cy) - circle.r;
}

function expectExternalCircleAnchor(anchor, circle) {
  expect(anchor).toBeTruthy();
  expect(Number.isFinite(anchor.point?.x)).toBe(true);
  expect(Number.isFinite(anchor.point?.y)).toBe(true);

  const portalCell = anchor.portalRoomCell || anchor.cell;
  const portalCenter = getCircleAnchorCellCenter(portalCell, gridSize);
  const routingCell = getCircleAnchorRoutingCell(anchor);
  const routingCenter = getCircleAnchorCellCenter(routingCell, gridSize);
  const portalDistance = Math.hypot(portalCenter.x - circle.cx, portalCenter.y - circle.cy);
  const routingDistance = Math.hypot(routingCenter.x - circle.cx, routingCenter.y - circle.cy);

  expect(doesCircleAnchorCellTouchVisualCircle(portalCell, circle, gridSize)).toBe(true);
  expect(routingDistance).toBeGreaterThan(portalDistance);
}

describe("circle door anchors", () => {
  test("snap dragged circular door anchors to external grid portals", () => {
    const circle = getCircleGeometryFromRegion(circleRegion, gridSize);
    const dragPoints = [
      { x: circle.cx, y: circle.cy - circle.r - gridSize * 0.15 },
      { x: circle.cx, y: circle.cy + circle.r + gridSize * 0.15 },
      { x: circle.cx - circle.r - gridSize * 0.15, y: circle.cy },
      { x: circle.cx + circle.r + gridSize * 0.15, y: circle.cy },
      { x: circle.cx + circle.r * 0.72, y: circle.cy - circle.r * 0.72 },
    ];

    dragPoints.forEach((point) => {
      expectExternalCircleAnchor(
        createCircleDragAnchor(circleRegion, point, gridSize),
        circle,
      );
    });
  });

  test("generated circular wall handles expose a routing cell outside the portal cell", () => {
    const circle = getCircleGeometryFromRegion(circleRegion, gridSize);
    const anchors = createCircleConnectionAnchorCandidates(
      circleRegion,
      circle,
      gridSize,
    );

    expect(anchors.length).toBeGreaterThan(0);
    anchors.forEach((anchor) => expectExternalCircleAnchor(anchor, circle));
  });

  test("expanded circular door mouths stay outside the visual circle", () => {
    const circle = getCircleGeometryFromRegion(circleRegion, gridSize);
    const dragPoints = [
      { x: circle.cx, y: circle.cy - circle.r - gridSize * 0.15 },
      { x: circle.cx, y: circle.cy + circle.r + gridSize * 0.15 },
      { x: circle.cx - circle.r - gridSize * 0.15, y: circle.cy },
      { x: circle.cx + circle.r + gridSize * 0.15, y: circle.cy },
    ];

    dragPoints.forEach((point) => {
      const anchor = createCircleDragAnchor(circleRegion, point, gridSize);
      const expanded = createCircleDoorRoomExtensionAnchor(
        circleRegion,
        anchor,
        80,
        60,
      );
      expectExpandedCircleDoorOutside(expanded, circle);
    });
  });

  test("legacy south circular anchors are projected back outside", () => {
    const legacyCircleRegion = {
      id: "legacy-circle-room",
      shape: "circle",
      cellRect: { x: 42, y: 17, w: 9, h: 9 },
      floorCells: [],
    };
    const circle = getCircleGeometryFromRegion(legacyCircleRegion, gridSize);
    const legacyAnchor = {
      regionId: legacyCircleRegion.id,
      regionShape: "circle",
      side: "south",
      cell: { x: 47, y: 23 },
      outsideCell: { x: 47, y: 24 },
      normal: { x: 0, y: 1 },
      circular: {
        cx: circle.cxCells,
        cy: circle.cyCells,
        r: circle.rCells,
        normal: { x: 0.316, y: 0.949 },
      },
      finalGeometry: true,
      point: { x: 950, y: 500 },
      segment: { x1: 940, y1: 500, x2: 960, y2: 500 },
    };

    const expanded = createCircleDoorRoomExtensionAnchor(
      legacyCircleRegion,
      legacyAnchor,
      80,
      60,
    );

    expectExpandedCircleDoorOutside(expanded, circle);
    expect(cellRectCrossesCircle(expanded.portalRoomCell, circle)).toBe(true);
    expect(expanded.outsideCell.y).toBeGreaterThan(expanded.portalRoomCell.y);
  });

  test("circle portal walls do not redraw the edge facing the circular room", () => {
    const circle = getCircleGeometryFromRegion(circleRegion, gridSize);
    const anchor = createCircleDragAnchor(
      circleRegion,
      { x: circle.cx - circle.r - gridSize * 0.15, y: circle.cy },
      gridSize,
    );
    const expanded = createCircleDoorRoomExtensionAnchor(
      circleRegion,
      anchor,
      80,
      60,
    );
    const generatedMap = {
      config: { gridSize, seed: "circle-portal-wall-test" },
      corridors: [
        {
          id: "corridor-1",
          from: circleRegion.id,
          to: "other-room",
          fromAnchor: expanded,
          toAnchor: null,
        },
      ],
      dungeonMask: { mapAccesses: [] },
      mapAccesses: [],
    };

    const inwardX = (expanded.portalRoomCell.x + 1) * gridSize;
    const inwardSegments = getCirclePortalSquareWallSegments(
      circleRegion,
      generatedMap,
    ).filter(
      (segment) =>
        Math.abs(segment.x1 - inwardX) < 0.01 &&
        Math.abs(segment.x2 - inwardX) < 0.01,
    );

    expect(inwardSegments).toHaveLength(0);
  });
  test("east circular drag anchors stay on the eastmost grid portal", () => {
    const legacyCircleRegion = {
      id: "east-circle-room",
      shape: "circle",
      cellRect: { x: 42, y: 17, w: 9, h: 9 },
      floorCells: [],
    };
    const circle = getCircleGeometryFromRegion(legacyCircleRegion, gridSize);
    const anchor = createCircleDragAnchor(
      legacyCircleRegion,
      { x: circle.cx + circle.r + gridSize * 0.35, y: circle.cy },
      gridSize,
    );

    expect(anchor.side).toBe("east");
    expect(anchor.portalRoomCell).toEqual({ x: 51, y: 21 });
    expect(anchor.outsideCell).toEqual({ x: 52, y: 21 });
    expect(anchor.raccordoCells?.map(cellKey)).toEqual(["50,21", "51,21"]);

    const expanded = createCircleDoorRoomExtensionAnchor(
      legacyCircleRegion,
      anchor,
      80,
      60,
      null,
      gridSize,
    );

    expect(expanded.portalRoomCell).toEqual({ x: 51, y: 21 });
    expect(expanded.outsideCell).toEqual({ x: 52, y: 21 });
    expect(expanded.raccordoCells?.map(cellKey)).toEqual(["50,21", "51,21"]);
  });

  test("expanded circular door mouths stay as regular portal squares", () => {
    const legacyCircleRegion = {
      id: "mouth-circle-room",
      shape: "circle",
      cellRect: { x: 42, y: 17, w: 9, h: 9 },
      floorCells: [],
    };
    const circle = getCircleGeometryFromRegion(legacyCircleRegion, gridSize);
    const anchor = createCircleDragAnchor(
      legacyCircleRegion,
      { x: circle.cx + circle.r + gridSize * 0.35, y: circle.cy },
      gridSize,
    );
    const expanded = createCircleDoorRoomExtensionAnchor(
      legacyCircleRegion,
      anchor,
      80,
      60,
      null,
      gridSize,
    );
    const mouthPath = createCircleDoorMouthPath(
      legacyCircleRegion,
      expanded,
      gridSize,
    );

    expect(expanded.portalRoomCell).toEqual({ x: 51, y: 21 });
    expect(expanded.raccordoCells?.map(cellKey)).toEqual(["50,21", "51,21"]);
    expect(mouthPath).toBe("");
  });


});

describe("circle connector snap coverage", () => {
  test("every generated circular portal square is reachable by dragging inside that square", () => {
    const legacyCircleRegion = {
      id: "snap-coverage-circle-room",
      shape: "circle",
      cellRect: { x: 42, y: 17, w: 9, h: 9 },
      floorCells: [],
    };
    const circle = getCircleGeometryFromRegion(legacyCircleRegion, gridSize);
    const anchors = createCircleConnectionAnchorCandidates(
      legacyCircleRegion,
      circle,
      gridSize,
    );

    expect(anchors.length).toBeGreaterThan(24);
    anchors.forEach((anchor) => {
      const routingCell = getCircleAnchorRoutingCell(anchor);
      const point = getCircleAnchorCellCenter(routingCell, gridSize);
      const dragged = createCircleDragAnchor(
        legacyCircleRegion,
        point,
        gridSize,
      );
      expect(getCircleAnchorRoutingCell(dragged)).toEqual(routingCell);
    });
  });


  test("cardinal tangent routing squares are reachable by drag", () => {
    const cardinalRegion = {
      id: "south-cardinal-circle-room",
      shape: "circle",
      cellRect: { x: 42, y: 17, w: 9, h: 9 },
      floorCells: [],
    };
    const anchor = createCircleDragAnchor(
      cardinalRegion,
      getCircleAnchorCellCenter({ x: 46, y: 26 }, gridSize),
      gridSize,
    );

    expect(anchor?.side).toBe("south");
    expect(anchor?.portalRoomCell).toEqual({ x: 46, y: 26 });
    expect(anchor?.raccordoCells?.map(cellKey)).toEqual(["46,25", "46,26"]);
    expect(getCircleAnchorRoutingCell(anchor)).toEqual({ x: 46, y: 27 });
  });


  test("cardinal-adjacent routing squares keep distinct snap cells", () => {
    const cardinalRegion = {
      id: "south-adjacent-circle-room",
      shape: "circle",
      cellRect: { x: 42, y: 17, w: 9, h: 9 },
      floorCells: [],
    };
    const left = createCircleDragAnchor(
      cardinalRegion,
      getCircleAnchorCellCenter({ x: 45, y: 26 }, gridSize),
      gridSize,
    );
    const center = createCircleDragAnchor(
      cardinalRegion,
      getCircleAnchorCellCenter({ x: 46, y: 26 }, gridSize),
      gridSize,
    );
    const right = createCircleDragAnchor(
      cardinalRegion,
      getCircleAnchorCellCenter({ x: 47, y: 26 }, gridSize),
      gridSize,
    );

    expect(left?.snapCell).toEqual({ x: 45, y: 26 });
    expect(center?.snapCell).toEqual({ x: 46, y: 26 });
    expect(right?.snapCell).toEqual({ x: 47, y: 26 });
    expect(new Set([left?.point?.x, center?.point?.x, right?.point?.x])).toHaveProperty("size", 3);
  });

  test("corner-skimming circular portals get one regular support square", () => {
    const cornerRegion = {
      id: "corner-support-circle-room",
      shape: "circle",
      cellRect: { x: 42, y: 17, w: 9, h: 9 },
      floorCells: [],
    };
    const support = getCirclePortalSupportCell(
      cornerRegion,
      { x: 42, y: 18, anchor: { side: "west" } },
      gridSize,
    );

    expect(support).toEqual({ x: 43, y: 18 });
  });
});


describe("circle composite connector regression", () => {
  test("stale circular portal cells preserve the external portal and build a support chain", () => {
    const staleRegion = {
      id: "stale-west-circle-room",
      shape: "circle",
      cellRect: { x: 42, y: 17, w: 9, h: 9 },
      floorCells: [],
    };
    const staleAnchor = {
      regionId: staleRegion.id,
      regionShape: "circle",
      side: "west",
      normal: { x: -1, y: 0 },
      expandedCircleDoor: true,
      portalRoomCell: { x: 41, y: 23 },
      outsideCell: { x: 40, y: 23 },
      routingOutsideCell: { x: 40, y: 23 },
    };
    const generatedMap = {
      config: { gridSize, seed: "stale-circle-portal-repair" },
      corridors: [
        {
          id: "corridor-1",
          from: staleRegion.id,
          to: "other-room",
          fromAnchor: staleAnchor,
          toAnchor: null,
        },
      ],
      dungeonMask: {
        mapAccesses: [],
        corridorFloorCells: [{ x: 40, y: 23 }],
      },
      mapAccesses: [],
    };

    const circle = getCircleGeometryFromRegion(staleRegion, gridSize);
    const expanded = createCircleDoorRoomExtensionAnchor(
      staleRegion,
      staleAnchor,
      80,
      60,
      null,
      gridSize,
    );
    generatedMap.corridors[0].fromAnchor = expanded;
    const compositeCells = getCircleCompositeSquareCells(generatedMap, staleRegion);
    const walls = getCirclePortalSquareWallSegments(staleRegion, generatedMap);

    expectExpandedRaccordoChainOutside(expanded, circle);
    expect(expanded.portalRoomCell).toEqual({ x: 41, y: 23 });
    expect(expanded.raccordoCell).toEqual({ x: 41, y: 23 });
    expect(expanded.raccordoCells.map(cellKey)).toEqual(["42,23", "41,23"]);

    expect(compositeCells).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ x: 41, y: 23, source: "expanded-door" }),
        expect.objectContaining({ x: 42, y: 23, source: "expanded-door" }),
      ]),
    );
    expect(raccordoChainTouchesCircle(compositeCells, circle)).toBe(true);
    expect(doesCircleAnchorCellTouchVisualCircle({ x: 41, y: 23 }, circle, gridSize)).toBe(true);
    expect(doesCircleAnchorCellTouchVisualCircle({ x: 42, y: 23 }, circle, gridSize)).toBe(true);
    expect(walls.length).toBeGreaterThan(0);
    expect(walls).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({ x1: 840, x2: 840, y1: 460, y2: 480 }),
      ]),
    );
  });
});
