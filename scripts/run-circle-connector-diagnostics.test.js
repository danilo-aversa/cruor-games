import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, test } from "vitest";
import {
  createCircleDoorRoomExtensionAnchor,
  getCircleGeometryFromRegion,
} from "../features/darken-location/map-generator/map-generator.mask.js";
import {
  createCircleConnectionAnchorCandidates,
  createCircleDragAnchor,
  doesCircleAnchorCellTouchVisualCircle,
  getCircleAnchorRoutingCell,
} from "../features/darken-location/map-generator/map-generator.circle-anchors.js";
import {
  createCircleCompositeRegionSurface,
  getCircleCompositeSquareCells,
  getCirclePortalSquareWallSegments,
} from "../features/darken-location/map-generator/map-generator.render.jsx";
import { createDoorFromAnchor } from "../features/darken-location/map-generator/map-generator.corridors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const reportDir = path.join(repoRoot, "reports");
const reportJsonPath = path.join(reportDir, "circle-connector-diagnostics.report.json");
const reportMdPath = path.join(reportDir, "circle-connector-diagnostics.report.md");

const gridSize = 20;
const gridW = 80;
const gridH = 60;
const circleRegion = {
  id: "diagnostic-circle-room",
  shape: "circle",
  cellRect: { x: 42, y: 17, w: 9, h: 9 },
  floorCells: [],
};
const circle = getCircleGeometryFromRegion(circleRegion, gridSize);
const diagnostics = [];

function cellKey(cell) {
  return cell ? `${cell.x},${cell.y}` : "null";
}

function cloneCell(cell) {
  return cell ? { x: cell.x, y: cell.y } : null;
}

function rectPathForCell(cell) {
  return `M${cell.x * gridSize} ${cell.y * gridSize}H${(cell.x + 1) * gridSize}V${(cell.y + 1) * gridSize}H${cell.x * gridSize}Z`;
}

function cellRectDistanceRange(cell) {
  const minX = cell.x * gridSize;
  const minY = cell.y * gridSize;
  const maxX = (cell.x + 1) * gridSize;
  const maxY = (cell.y + 1) * gridSize;
  const dx = Math.max(minX - circle.cx, 0, circle.cx - maxX);
  const dy = Math.max(minY - circle.cy, 0, circle.cy - maxY);
  return {
    min: Math.hypot(dx, dy),
    max: Math.max(
      Math.hypot(minX - circle.cx, minY - circle.cy),
      Math.hypot(maxX - circle.cx, minY - circle.cy),
      Math.hypot(minX - circle.cx, maxY - circle.cy),
      Math.hypot(maxX - circle.cx, maxY - circle.cy),
    ),
  };
}

function cellCrossesCircle(cell) {
  const range = cellRectDistanceRange(cell);
  return range.min <= circle.r + 0.001 && range.max >= circle.r - 0.001;
}

function cellCenterDistance(cell) {
  return Math.hypot(
    (cell.x + 0.5) * gridSize - circle.cx,
    (cell.y + 0.5) * gridSize - circle.cy,
  );
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function oppositeSide(side) {
  if (side === "north") return "south";
  if (side === "south") return "north";
  if (side === "east") return "west";
  if (side === "west") return "east";
  return null;
}

function edgeLineForCell(cell, side) {
  const x0 = cell.x * gridSize;
  const y0 = cell.y * gridSize;
  const x1 = x0 + gridSize;
  const y1 = y0 + gridSize;
  if (side === "west") return { orientation: "v", value: x0, min: y0, max: y1 };
  if (side === "east") return { orientation: "v", value: x1, min: y0, max: y1 };
  if (side === "north") return { orientation: "h", value: y0, min: x0, max: x1 };
  return { orientation: "h", value: y1, min: x0, max: x1 };
}

function segmentOverlapsEdge(segment, edge, tolerance = 0.01) {
  if (edge.orientation === "v") {
    if (Math.abs(segment.x1 - edge.value) > tolerance || Math.abs(segment.x2 - edge.value) > tolerance) return false;
    const min = Math.min(segment.y1, segment.y2);
    const max = Math.max(segment.y1, segment.y2);
    return max > edge.min + tolerance && min < edge.max - tolerance;
  }
  if (Math.abs(segment.y1 - edge.value) > tolerance || Math.abs(segment.y2 - edge.value) > tolerance) return false;
  const min = Math.min(segment.x1, segment.x2);
  const max = Math.max(segment.x1, segment.x2);
  return max > edge.min + tolerance && min < edge.max - tolerance;
}

function makeMapWithAnchor(anchor, corridorCells = []) {
  return {
    config: { gridSize, seed: "circle-connector-diagnostics" },
    corridors: [
      {
        id: `corridor-${cellKey(anchor.portalRoomCell || anchor.outsideCell)}`,
        from: circleRegion.id,
        to: "other-room",
        fromAnchor: anchor,
        toAnchor: null,
      },
    ],
    dungeonMask: {
      mapAccesses: [],
      corridorFloorCells: corridorCells,
    },
    mapAccesses: [],
  };
}

function expandAnchor(anchor) {
  return createCircleDoorRoomExtensionAnchor(
    circleRegion,
    anchor,
    gridW,
    gridH,
    null,
    gridSize,
  );
}

function record(label, data, failures = []) {
  const entry = {
    label,
    ...data,
    failures,
  };
  diagnostics.push(entry);
  return entry;
}

function getRaccordoContactCells(expanded, doorRaccordoCell) {
  const cells = [];
  const addCell = (cell) => {
    if (!cell) return;
    if (cells.some((existing) => cellKey(existing) === cellKey(cell))) return;
    cells.push(cell);
  };
  if (Array.isArray(expanded?.raccordoCells)) expanded.raccordoCells.forEach(addCell);
  addCell(doorRaccordoCell);
  addCell(expanded?.portalRoomCell);
  addCell(expanded?.cell);
  return cells;
}

function validateExpandedAnchor(anchor, label) {
  const expanded = expandAnchor(anchor);
  const routing = getCircleAnchorRoutingCell(expanded);
  const corridorCells = routing ? [routing] : [];
  const generatedMap = makeMapWithAnchor(expanded, corridorCells);
  const compositeCells = getCircleCompositeSquareCells(generatedMap, circleRegion);
  const renderedPortalCell =
    compositeCells.find((cell) => cell.source === "expanded-door") ||
    expanded?.portalRoomCell ||
    null;
  const surface = createCircleCompositeRegionSurface(circleRegion, generatedMap, gridSize);
  const walls = getCirclePortalSquareWallSegments(circleRegion, generatedMap);
  const door = createDoorFromAnchor(expanded, gridSize, false);
  const doorRaccordoCell = expanded?.raccordoCell || expanded?.portalRoomCell || expanded?.cell || null;
  const expectedDoorEdge = doorRaccordoCell && routing
    ? edgeLineForCell(doorRaccordoCell, expanded.side)
    : null;
  const doorEdgeDelta = door && expectedDoorEdge
    ? Math.min(
        Math.max(
          Math.abs(door.x1 - expectedDoorEdge.x1),
          Math.abs(door.y1 - expectedDoorEdge.y1),
          Math.abs(door.x2 - expectedDoorEdge.x2),
          Math.abs(door.y2 - expectedDoorEdge.y2),
        ),
        Math.max(
          Math.abs(door.x1 - expectedDoorEdge.x2),
          Math.abs(door.y1 - expectedDoorEdge.y2),
          Math.abs(door.x2 - expectedDoorEdge.x1),
          Math.abs(door.y2 - expectedDoorEdge.y1),
        ),
      )
    : Number.POSITIVE_INFINITY;
  const failures = [];

  if (!expanded?.expandedCircleDoor) failures.push("anchor-not-expanded");
  if (!expanded?.portalRoomCell) failures.push("missing-portal-cell");
  if (!routing) failures.push("missing-routing-cell");

  const raccordoContactCells = getRaccordoContactCells(expanded, doorRaccordoCell);
  if (expanded?.portalRoomCell && !raccordoContactCells.some(cellCrossesCircle)) {
    failures.push("raccordo-cell-does-not-touch-circle-outline");
  }

  if (doorRaccordoCell && routing && manhattan(doorRaccordoCell, routing) !== 1) {
    failures.push("routing-cell-not-adjacent-to-door-raccordo");
  }
  if (expanded?.portalRoomCell && routing && cellCenterDistance(routing) <= cellCenterDistance(expanded.portalRoomCell)) {
    failures.push("routing-cell-not-farther-from-circle");
  }
  const expectedRaccordoCells = Array.isArray(expanded?.raccordoCells) && expanded.raccordoCells.length > 0
    ? expanded.raccordoCells
    : [doorRaccordoCell].filter(Boolean);
  if (compositeCells.length < expectedRaccordoCells.length) {
    failures.push("missing-raccordo-chain-cells");
  }
  if (
    renderedPortalCell &&
    !compositeCells.some((cell) => cellKey(cell) === cellKey(renderedPortalCell))
  ) {
    failures.push("composite-cells-missing-portal");
  }
  if (renderedPortalCell && !surface.clipPath.includes(rectPathForCell(renderedPortalCell))) {
    failures.push("clip-path-missing-raccordo-square");
  }
  if (!door) failures.push("missing-door-segment");
  if (door && doorEdgeDelta > gridSize * 0.05) {
    failures.push("door-segment-not-on-raccordo-corridor-edge");
  }

  if (renderedPortalCell && expanded?.side) {
    const corridorEdge = edgeLineForCell(renderedPortalCell, expanded.side);
    const roomEdge = edgeLineForCell(renderedPortalCell, oppositeSide(expanded.side));
    if (walls.some((segment) => segmentOverlapsEdge(segment, corridorEdge))) {
      failures.push("wall-drawn-between-portal-and-corridor");
    }
    if (walls.some((segment) => segmentOverlapsEdge(segment, roomEdge))) {
      failures.push("wall-drawn-between-portal-and-circle");
    }
  }

  record(
    label,
    {
      side: expanded?.side || anchor?.side || null,
      inputPortalCell: cloneCell(anchor.portalRoomCell || anchor.outsideCell),
      portalCell: cloneCell(renderedPortalCell),
      routingCell: cloneCell(routing),
      compositeCells: compositeCells.map((cell) => ({ x: cell.x, y: cell.y, source: cell.source })),
      wallSegmentCount: walls.length,
      clipHasPortalSquare: renderedPortalCell
        ? surface.clipPath.includes(rectPathForCell(renderedPortalCell))
        : false,
      doorEdgeDelta: Number.isFinite(doorEdgeDelta)
        ? Math.round(doorEdgeDelta * 100) / 100
        : null,
    },
    failures,
  );
  return failures;
}

function writeReports() {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportJsonPath, JSON.stringify(diagnostics, null, 2));
  const failures = diagnostics.filter((entry) => entry.failures.length > 0);
  const rows = diagnostics
    .map((entry) => {
      return `| ${entry.label} | ${entry.inputPortalCell ? cellKey(entry.inputPortalCell) : "null"} | ${entry.portalCell ? cellKey(entry.portalCell) : "null"} | ${entry.routingCell ? cellKey(entry.routingCell) : "null"} | ${entry.compositeCells?.map(cellKey).join(", ") || ""} | ${entry.wallSegmentCount ?? ""} | ${entry.failures.length ? entry.failures.join(", ") : "ok"} |`;
    })
    .join("\n");
  const details = failures
    .map((entry, index) => `### ${index + 1}. ${entry.label}\n\n\`\`\`json\n${JSON.stringify(entry, null, 2)}\n\`\`\``)
    .join("\n\n");
  fs.writeFileSync(
    reportMdPath,
    `# Circle Connector Diagnostics\n\nCases: ${diagnostics.length}\nFailures: ${failures.length}\n\n| Case | Input cell | Portal cell | Routing cell | Composite cells | Wall segments | Problems |\n|---|---:|---:|---:|---:|---:|---|\n${rows}\n\n## Failure details\n\n${details || "No failures."}\n`,
  );
  console.log(`Circle connector diagnostic report: ${reportMdPath}`);
}

afterAll(writeReports);

describe("circle connector diagnostics", () => {
  test("all generated circle anchors use outside raccordo squares with external routing cells", () => {
    const anchors = createCircleConnectionAnchorCandidates(circleRegion, circle, gridSize);
    expect(anchors.length).toBeGreaterThanOrEqual(32);
    const failures = anchors.flatMap((anchor, index) =>
      validateExpandedAnchor(anchor, `generated:${index}:${cellKey(anchor.outsideCell)}`),
    );
    expect(failures).toEqual([]);
  });

  test("dragging around the whole perimeter never chooses an inside raccordo square", () => {
    const failures = [];
    for (let step = 0; step < 144; step += 1) {
      const angle = (Math.PI * 2 * step) / 144;
      const point = {
        x: circle.cx + Math.cos(angle) * (circle.r + gridSize * 1.35),
        y: circle.cy + Math.sin(angle) * (circle.r + gridSize * 1.35),
      };
      const anchor = createCircleDragAnchor(circleRegion, point, gridSize);
      const portalCell = anchor?.portalRoomCell || anchor?.cell;
      if (!doesCircleAnchorCellTouchVisualCircle(portalCell, circle, gridSize)) {
        const entry = record(
          `drag:${step}`,
          { inputPortalCell: null, portalCell: cloneCell(portalCell), routingCell: cloneCell(getCircleAnchorRoutingCell(anchor)) },
          ["drag-picked-inside-raccordo"],
        );
        failures.push(entry);
        continue;
      }
      failures.push(...validateExpandedAnchor(anchor, `drag:${step}:${cellKey(getCircleAnchorRoutingCell(anchor))}`));
    }
    expect(failures).toEqual([]);
  });

  test("stale saved portals from prior builds are repaired before rendering", () => {
    const staleCases = [
      {
        label: "stale-west-gap:41,23-to-42,23",
        anchor: {
          regionId: circleRegion.id,
          regionShape: "circle",
          side: "west",
          normal: { x: -1, y: 0 },
          expandedCircleDoor: true,
          portalRoomCell: { x: 41, y: 23 },
          outsideCell: { x: 40, y: 23 },
          routingOutsideCell: { x: 40, y: 23 },
        },
        expectedPortal: { x: 41, y: 23 },
      },
      {
        label: "stale-north-tangent:46,16",
        anchor: {
          regionId: circleRegion.id,
          regionShape: "circle",
          side: "north",
          normal: { x: 0, y: -1 },
          expandedCircleDoor: true,
          portalRoomCell: { x: 46, y: 16 },
          outsideCell: { x: 46, y: 15 },
          routingOutsideCell: { x: 46, y: 15 },
        },
        expectedPortal: { x: 46, y: 16 },
      },
    ];

    const failures = [];
    staleCases.forEach((testCase) => {
      const caseFailures = validateExpandedAnchor(testCase.anchor, testCase.label);
      const expanded = expandAnchor(testCase.anchor);
      if (cellKey(expanded.portalRoomCell) !== cellKey(testCase.expectedPortal)) {
        const entry = record(
          `${testCase.label}:expected-portal`,
          {
            inputPortalCell: cloneCell(testCase.anchor.portalRoomCell),
            portalCell: cloneCell(expanded.portalRoomCell),
            routingCell: cloneCell(getCircleAnchorRoutingCell(expanded)),
            compositeCells: [],
            wallSegmentCount: null,
          },
          ["stale-portal-not-repaired-to-outside-raccordo-cell"],
        );
        failures.push(entry);
      }
      failures.push(...caseFailures);
    });

    expect(failures).toEqual([]);
  });
});
