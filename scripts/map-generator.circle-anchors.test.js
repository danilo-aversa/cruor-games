import { describe, expect, test } from "vitest";
import {
  createCircleDoorRoomExtensionAnchor,
  getCircleGeometryFromRegion,
} from "./map-generator.mask.js";
import {
  createCircleConnectionAnchorCandidates,
  createCircleDragAnchor,
  getCircleAnchorCellCenter,
  getCircleAnchorRoutingCell,
} from "./map-generator.circle-anchors.js";
import {
  createCircleDoorMouthPath,
  getCirclePortalSquareWallSegments,
} from "./map-generator.render.jsx";

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

function expectExpandedCircleDoorOutside(expanded, circle) {
  expect(expanded?.expandedCircleDoor).toBe(true);
  expect(expanded.portalRoomCell).toBeTruthy();
  expect(expanded.outsideCell).toBeTruthy();
  const portalDistance = cellDistanceFromCircle(expanded.portalRoomCell, circle);
  const routingDistance = cellDistanceFromCircle(expanded.outsideCell, circle);
  expect(portalDistance).toBeGreaterThanOrEqual(circle.rCells - 0.08);
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
  expect(Math.abs(distanceFromCircle(anchor.point, circle))).toBeLessThan(0.0001);

  const portalCenter = getCircleAnchorCellCenter(anchor.outsideCell, gridSize);
  const routingCell = getCircleAnchorRoutingCell(anchor);
  const routingCenter = getCircleAnchorCellCenter(routingCell, gridSize);
  const portalDistance = Math.hypot(portalCenter.x - circle.cx, portalCenter.y - circle.cy);
  const routingDistance = Math.hypot(routingCenter.x - circle.cx, routingCenter.y - circle.cy);

  expect(portalDistance).toBeGreaterThanOrEqual(circle.r - gridSize * 0.02);
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
    expect(expanded.portalRoomCell.y).toBeGreaterThanOrEqual(26);
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
    expect(anchor.outsideCell).toEqual({ x: 51, y: 21 });

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
  });

  test("expanded circular door mouths render a continuous floor bridge", () => {
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

    expect(mouthPath).toContain("A90.00 90.00");
    expect(mouthPath).toContain("L1020.00 440.00");
    expect(mouthPath).toContain("L1020.00 420.00");
    expect(mouthPath.endsWith("Z")).toBe(true);
  });


});
