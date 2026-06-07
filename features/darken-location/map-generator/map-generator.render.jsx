import React from "react";
import {
  DEFAULT_CONFIG,
  normalizeRoomCount,
  normalizeVisualStyle,
} from "./map-generator.input.js";
import {
  LEVEL_VIEW_ALL,
  getManualJunctionOverride,
  normalizeDoorType,
  normalizeGridStyle,
  normalizeStairTransition,
} from "./map-generator.state.js";
import {
  getContextKey,
  getRegionSemanticFlags,
} from "./map-generator.profile.js";
import {
  getAvailableMapLevels,
  getRegionLevel,
  hasRenderableGeometry,
  normalizeLevelView,
} from "./map-generator.layout.js";
import {
  cellKey,
  parseCellKey,
  ORTHOGONAL_DIRECTIONS,
  getCellNeighbors,
  pointKey,
  buildDungeonMask,
  computeBoundarySegments,
  mergeCollinearWallSegments,
  getCircleGeometryFromRegion,
  getCircleExtensionCellKeys,
  getSharedEdgeSegment,
  getCellBoundarySegmentsForCell,
  getNeighborForCellSide,
  getRegionSurfaceKind,
  segmentKey,
} from "./map-generator.mask.js";
import {
  isOrganicCorridor,
  isValidPoint,
  getBoundaryCells,
  getFinalConnectionAnchors,
  createFinalAnchorFromSegment,
  getDoorBoundaryCells,
  getAnchorHandlePoint,
  getSnappedCirclePortalCellFromAnchor,
  getCorridorTopologyCells,
  createDoorFromAnchor,
  isCorridorVisibleOnLevel,
  getCorridorPlanarLevel,
  getCorridorIntersectionCells,
  getCrossLevelCorridorIntersectionCells,
  getCorridorCellDirection,
  inferCorridorJunctionOrientation,
  getCorridorJunctionGeometry,
  getCorridorCrossingOrientation,
  getCorridorLocalWallSegmentsForCell,
  getCorridorEndpointCell,
  getWallSegmentAdjacentCells,
} from "./map-generator.corridors.js";
import {
  createCaveMapSurfaceFromCaveSurface as createGeometryCaveMapSurfaceFromCaveSurface,
  finalizeCaveGeometry as finalizeGeometryCaveGeometry,
} from "./map-generator.geometry.js";
import {
  createCaveAccessBoundaryAnchor,
  getCaveAccessBounds,
} from "./map-generator.details.js";

function hashStringToSeed(...parts) {
  const text = parts.join("::");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRng(seed) {
  let state =
    typeof seed === "number" ? seed >>> 0 : hashStringToSeed(String(seed));
  return function rng() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickOne(rng, values) {
  return values[Math.floor(rng() * values.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export const SVG_STYLE = `
.paper{fill:#dccaa6}.paper-texture{opacity:.75}.map-grid line{stroke:rgba(58,46,32,.17);stroke-width:1;vector-effect:non-scaling-stroke}.map-grid circle{fill:rgba(58,46,32,.22)}.floor-grid line{stroke:rgba(29,25,21,.16);stroke-width:1.05;vector-effect:non-scaling-stroke}.floor-grid circle{fill:rgba(29,25,21,.18)}.grid-style-dotted line{display:none}.grid-style-dashed line{stroke-linecap:round}.floor-fill{fill:#685D61;stroke:none}.floor-speckle circle{fill:rgba(29,25,21,.12)}.floor-grain path{fill:none;stroke:rgba(29,25,21,.11);stroke-width:.7;stroke-linecap:round;vector-effect:non-scaling-stroke}.room-floor-accent{fill:rgba(255,248,226,.26);stroke:none}.corridor-floor-accent{fill:rgba(116,91,57,.075);stroke:none}.organic-floor-accent{fill:rgba(29,25,21,.06);stroke:rgba(29,25,21,.18);stroke-width:1.15;vector-effect:non-scaling-stroke}.shape-detail{fill:none;stroke:rgba(29,25,21,.2);stroke-width:1.05;stroke-linecap:round;vector-effect:non-scaling-stroke}.ritual-floor-ring{fill:none;stroke:rgba(29,25,21,.18);stroke-width:1.25;vector-effect:non-scaling-stroke}.corridor-centerline{fill:none;stroke:rgba(29,25,21,.18);stroke-width:1.1;stroke-dasharray:2 8;stroke-linecap:round;vector-effect:non-scaling-stroke}.external-hatching-underlay .halo-buffer{fill:none;stroke:#dccaa6;stroke-linecap:square;stroke-linejoin:bevel;stroke-miterlimit:1}.external-hatching path{fill:none;stroke:rgba(42,33,24,.28);stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.wall-shadow path{stroke:rgba(42,33,24,.32);stroke-width:7.2;stroke-linecap:round;stroke-linejoin:round;fill:none;vector-effect:non-scaling-stroke}.wall-main path{stroke:#1d1915;stroke-width:4.05;stroke-linecap:round;stroke-linejoin:round;fill:none;vector-effect:non-scaling-stroke}.wall-sketch path{stroke:rgba(29,25,21,.32);stroke-width:1.15;stroke-linecap:round;stroke-linejoin:round;fill:none;vector-effect:non-scaling-stroke}.wall-breaks path{fill:none;stroke:#1d1915;stroke-width:1.45;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.wall-breaks .crack{stroke:rgba(29,25,21,.58);stroke-width:1.1}.door-cuts .door-opening{stroke:#efe4ca;stroke-width:7;stroke-linecap:square;vector-effect:non-scaling-stroke}.door-cuts .secret-door-opening{stroke:#efe4ca;stroke-width:5;stroke-linecap:square;stroke-dasharray:4 4;vector-effect:non-scaling-stroke}.door-symbols .door-wall-line{stroke:#1d1915;stroke-width:4.1;stroke-linecap:round;stroke-linejoin:round;fill:none;vector-effect:non-scaling-stroke}.door-symbols .door-wall-sketch{stroke:rgba(29,25,21,.3);stroke-width:1.15;stroke-linecap:round;stroke-linejoin:round;fill:none;vector-effect:non-scaling-stroke}.door-symbols .door-panel{fill:#efe4ca;stroke:#1d1915;stroke-width:2.25;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.door-symbols .secret-door-panel{stroke-dasharray:3 3}.door-symbols .locked-door-panel{stroke-width:2.35}.door-symbols .locked-door-mark line{stroke:#1d1915;stroke-width:2.05;stroke-linecap:round;vector-effect:non-scaling-stroke}.door-symbols .stair-mark__main path{fill:none;stroke:#1d1915;stroke-width:3.05;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.door-symbols .stair-mark__sketch path{fill:none;stroke:rgba(29,25,21,.3);stroke-width:1.05;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.corridor-overpass-patches .overpass-corridor-floor{fill:#efe4ca;stroke:none;pointer-events:none}.corridor-overpass-patches .overpass-corridor-walls path{stroke:#1d1915;stroke-width:4.05;stroke-linecap:round;stroke-linejoin:round;fill:none;vector-effect:non-scaling-stroke}.corridor-overpass-patches .overpass-corridor-wall-sketch path{stroke:rgba(29,25,21,.32);stroke-width:1.15;stroke-linecap:round;stroke-linejoin:round;fill:none;vector-effect:non-scaling-stroke}.map-accesses .map-access-line,.map-accesses .map-access-head-line{fill:none;stroke:#1d1915;stroke-width:3.05;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.map-accesses .map-access-stem-sketch,.map-accesses .map-access-head-sketch{fill:none;stroke:rgba(29,25,21,.3);stroke-width:1.05;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.map-accesses .map-access-label{fill:#1d1915;font-size:8px;font-weight:900;font-family:Inter,ui-sans-serif,system-ui;letter-spacing:.08em;paint-order:stroke;stroke:#efe4ca;stroke-width:2.5px;stroke-linejoin:round}.corridor-junctions .junction-wall-line{stroke:#1d1915;stroke-width:4.0;stroke-linecap:round;stroke-linejoin:round;fill:none;vector-effect:non-scaling-stroke}.corridor-junctions .junction-wall-sketch{stroke:rgba(29,25,21,.3);stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round;fill:none;vector-effect:non-scaling-stroke}.corridor-junctions .junction-door-panel{fill:#efe4ca;stroke:#1d1915;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.props rect,.props circle,.props path,.props line,.props polygon,.props ellipse{fill:none;stroke:rgba(29,25,21,.62);stroke-width:1.35;vector-effect:non-scaling-stroke}.props .prop-fill{fill:rgba(29,25,21,.045)}.props .prop-light-fill{fill:rgba(255,248,226,.16)}.props .prop-fog{fill:rgba(255,248,226,.22);stroke:rgba(29,25,21,.18);stroke-width:1.05}.props .prop-water{fill:rgba(143,161,150,.24);stroke:rgba(29,25,21,.28);stroke-width:1.1}.props .prop-pit{fill:rgba(29,25,21,.12);stroke:rgba(29,25,21,.62);stroke-width:1.4}.props .prop-rubble{fill:rgba(29,25,21,.06)}.props .prop-bones{stroke:rgba(29,25,21,.7);stroke-width:1.15}.props .prop-crack{stroke:rgba(29,25,21,.5);stroke-width:1.05}.props .prop-stairs line{stroke-width:1.05}.props .prop-altar,.props .prop-tomb,.props .prop-shelf{fill:rgba(29,25,21,.045)}.labels .room-number-badge{fill:#efe4ca;stroke:#1d1915;stroke-width:2;rx:2}.labels text{fill:#1d1915;font-size:13px;font-weight:800;font-family:Inter,ui-sans-serif,system-ui}.labels .room-number{font-size:12px;font-weight:900;letter-spacing:.01em}.labels .room-name{font-size:12px;font-family:Inter,ui-sans-serif,system-ui;font-weight:700;paint-order:stroke;stroke:#efe4ca;stroke-width:4px;stroke-linejoin:round}.editor-overlays path{fill:rgba(122,67,36,0);stroke:rgba(122,67,36,0);stroke-width:0;vector-effect:non-scaling-stroke}.room-hover-highlight{pointer-events:none}.editor-overlays .room-hover-highlight__halo path,.editor-overlays .room-hover-highlight__halo line{fill:none;stroke:rgba(214,184,98,.32);stroke-width:8;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.editor-overlays .room-hover-highlight__edge path,.editor-overlays .room-hover-highlight__edge line{fill:none;stroke:rgba(255,231,143,.92);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.corridor-hover-highlight{pointer-events:none}.editor-overlays .corridor-hover-highlight__halo{fill:none;stroke:rgba(214,184,98,.34);stroke-width:9;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.editor-overlays .corridor-hover-highlight__line{fill:none;stroke:rgba(255,231,143,.95);stroke-width:3;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.editor-overlays .room-drag-handle{cursor:move;pointer-events:all}.editor-overlays .room-drag-handle:hover{fill:rgba(122,67,36,0)}.editor-overlays .room-drag-handle.is-dragging{fill:rgba(122,67,36,0);stroke:rgba(29,25,21,0);stroke-width:0}.wall-hover-zone{stroke:rgba(122,67,36,0);stroke-width:14;stroke-linecap:square;fill:none;cursor:crosshair;pointer-events:stroke}.wall-hover-zone:hover{stroke:rgba(122,67,36,0)}.endpoint-handle{fill:#1d1915;stroke:#efe4ca;stroke-width:2;cursor:grab;pointer-events:all}.endpoint-handle.is-dragging{fill:#7a4324;cursor:grabbing}.waypoint-handle{fill:#efe4ca;stroke:#1d1915;stroke-width:1.5;cursor:grab;pointer-events:all}.waypoint-handle.is-junction{fill:#d6b862;stroke:#1d1915;stroke-width:2.2}.waypoint-handle.is-dragging{fill:#7a4324;stroke:#efe4ca;cursor:grabbing}.corridor-hover-zone{fill:rgba(122,67,36,0);stroke:none;cursor:crosshair;pointer-events:all}.corridor-hover-zone:hover{fill:rgba(122,67,36,.12)}.corridor-hover-zone.is-junction:hover{fill:rgba(214,184,98,.22);stroke:rgba(214,184,98,.54);stroke-width:1.2;vector-effect:non-scaling-stroke}.corridor-add-handle{fill:#efe4ca;stroke:#7a4324;stroke-width:2;cursor:crosshair;pointer-events:all}.corridor-add-handle:hover{fill:#7a4324;stroke:#efe4ca}.corridor-add-handle.is-junction{fill:#d6b862;stroke:#1d1915;stroke-width:2.4}.corridor-add-handle.is-junction:hover{fill:#1d1915;stroke:#d6b862}.wall-connect-handle{fill:#7a4324;stroke:#efe4ca;stroke-width:2;cursor:crosshair;pointer-events:all}.wall-connect-handle:hover{fill:#1d1915}.map-access-handle{fill:#efe4ca;stroke:#1d1915;stroke-width:2.1;cursor:grab;pointer-events:all}.map-access-handle:hover{fill:#d6b862}.map-access-handle.is-dragging{fill:#7a4324;stroke:#efe4ca;cursor:grabbing}.map-access-handle__icon{fill:none;stroke:#1d1915;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}.connection-preview{stroke:#7a4324;stroke-width:2.4;stroke-dasharray:7 5;stroke-linecap:round;fill:none;vector-effect:non-scaling-stroke;pointer-events:none}.connection-preview__endpoint{fill:#efe4ca;stroke:#7a4324;stroke-width:2;pointer-events:none}.circular-room-surface-cover{pointer-events:none}.level-layer--faded{opacity:.26}.level-layer--active{opacity:1}
`;

export const MAP_VISUAL_STYLE = `
.map-style-cruor .paper{fill:url(#cruorMapBackground)}
.map-style-cruor .paper-texture{opacity:.12;mix-blend-mode:screen}
.map-style-cruor .map-grid line{stroke:rgba(255,238,242,.11);stroke-width:1;vector-effect:non-scaling-stroke}
.map-style-cruor .map-grid circle{fill:rgba(255,238,242,.14)}
.map-style-cruor .floor-grid line{stroke:rgba(255,255,255,.09);stroke-width:1;vector-effect:non-scaling-stroke}
.map-style-cruor .floor-grid circle{fill:rgba(255,255,255,.12)}
.map-style-cruor .floor-fill{fill:#685D61;stroke:none;mix-blend-mode:normal}
.map-style-cruor .room-floor-accent{fill:rgba(104,93,97,.92);mix-blend-mode:normal}
.map-style-cruor .corridor-floor-accent{fill:rgba(104,93,97,.88);mix-blend-mode:normal}
.map-style-cruor .organic-floor-accent{fill:#685D61;stroke:rgba(255,255,255,.26)}
.map-style-cruor .floor-speckle circle{fill:rgba(255,255,255,.16)}
.map-style-cruor .floor-grain path,.map-style-cruor .shape-detail,.map-style-cruor .ritual-floor-ring,.map-style-cruor .corridor-centerline{stroke:rgba(255,255,255,.28)}
.map-style-cruor .external-hatching-underlay .halo-buffer{stroke:rgba(28,2,8,.94)}
.map-style-cruor .external-hatching path{stroke:rgba(255,255,255,.20)}
.map-style-cruor .wall-shadow path{stroke:rgba(255,255,255,.16);stroke-width:8.2}
.map-style-cruor .wall-main path,.map-style-cruor .door-symbols .door-wall-line,.map-style-cruor .corridor-overpass-patches .overpass-corridor-walls path,.map-style-cruor .corridor-junctions .junction-wall-line{stroke:#fff;stroke-width:4.15}
.map-style-cruor .wall-sketch path,.map-style-cruor .door-symbols .door-wall-sketch,.map-style-cruor .corridor-overpass-patches .overpass-corridor-wall-sketch path,.map-style-cruor .corridor-junctions .junction-wall-sketch{stroke:rgba(255,255,255,.36)}
.map-style-cruor .wall-breaks path,.map-style-cruor .wall-breaks .crack{stroke:rgba(255,255,255,.74)}
.map-style-cruor .door-cuts .door-opening{stroke:rgba(255,255,255,.30);stroke-width:7}
.map-style-cruor .door-cuts .secret-door-opening{stroke:rgba(255,255,255,.30)}
.map-style-cruor .door-symbols .door-panel,.map-style-cruor .corridor-junctions .junction-door-panel{fill:rgba(18,1,6,.92);stroke:#fff}
.map-style-cruor .door-symbols .locked-door-mark line,.map-style-cruor .door-symbols .stair-mark__main path,.map-style-cruor .map-accesses .map-access-line,.map-style-cruor .map-accesses .map-access-head-line{stroke:#fff}
.map-style-cruor .door-symbols .stair-mark__sketch path,.map-style-cruor .map-accesses .map-access-stem-sketch,.map-style-cruor .map-accesses .map-access-head-sketch{stroke:rgba(255,255,255,.42)}
.map-style-cruor .corridor-overpass-patches .overpass-corridor-floor{fill:#685D61}
.map-style-cruor .map-accesses .map-access-label{fill:#fff;stroke:rgba(20,2,8,.92);font-family:Inter,ui-sans-serif,system-ui}
.map-style-cruor .props rect,.map-style-cruor .props circle,.map-style-cruor .props path,.map-style-cruor .props line,.map-style-cruor .props polygon,.map-style-cruor .props ellipse{stroke:rgba(255,255,255,.82)}
.map-style-cruor .props .prop-fill,.map-style-cruor .props .prop-altar,.map-style-cruor .props .prop-tomb,.map-style-cruor .props .prop-shelf{fill:rgba(255,255,255,.08)}
.map-style-cruor .props .prop-light-fill,.map-style-cruor .props .prop-fog{fill:rgba(255,255,255,.18)}
.map-style-cruor .labels .room-number-badge{fill:rgba(0,0,0,.42);stroke:rgba(255,255,255,.86);stroke-width:1.7}
.map-style-cruor .labels text{fill:#fff;font-family:Inter,ui-sans-serif,system-ui}
.map-style-cruor .labels .room-name{stroke:rgba(20,2,8,.92);stroke-width:4px}
.map-style-blood .paper{fill:url(#bloodMapBackground)}
.map-style-blood .paper-texture{opacity:.18}
.map-style-blood .map-grid line,.map-style-blood .floor-grid line{stroke:rgba(255,238,242,.10)}
.map-style-blood .floor-fill{fill:rgba(255,238,242,.22)}
.map-style-blood .wall-main path,.map-style-blood .door-symbols .door-wall-line,.map-style-blood .corridor-junctions .junction-wall-line{stroke:#f5d7dc}
.map-style-blood .wall-shadow path{stroke:rgba(0,0,0,.42)}
.map-style-blood .door-cuts .door-opening{stroke:rgba(255,238,242,.22)}
.map-style-blood .labels .room-number-badge{fill:rgba(51,3,12,.78);stroke:#f5d7dc}.map-style-blood .labels text{fill:#fff0f2;font-family:Inter,ui-sans-serif,system-ui}.map-style-blood .labels .room-name{stroke:rgba(20,2,8,.92)}
.map-style-bone .paper{fill:#e8dfcf}.map-style-bone .paper-texture{opacity:.28}.map-style-bone .floor-fill{fill:rgba(255,255,255,.42)}.map-style-bone .wall-main path,.map-style-bone .door-symbols .door-wall-line,.map-style-bone .corridor-junctions .junction-wall-line{stroke:#1d1915}.map-style-bone .labels .room-number-badge{fill:#fff8e6;stroke:#1d1915}.map-style-bone .labels text{fill:#1d1915;font-family:Inter,ui-sans-serif,system-ui}
.map-style-midnight .paper{fill:url(#midnightMapBackground)}.map-style-midnight .paper-texture{opacity:.14}.map-style-midnight .map-grid line,.map-style-midnight .floor-grid line{stroke:rgba(224,238,255,.10)}.map-style-midnight .floor-fill{fill:rgba(224,238,255,.20)}.map-style-midnight .wall-main path,.map-style-midnight .door-symbols .door-wall-line,.map-style-midnight .corridor-junctions .junction-wall-line{stroke:#dcecff}.map-style-midnight .door-cuts .door-opening{stroke:rgba(224,238,255,.20)}.map-style-midnight .labels .room-number-badge{fill:rgba(2,8,22,.72);stroke:#dcecff}.map-style-midnight .labels text{fill:#ecf5ff;font-family:Inter,ui-sans-serif,system-ui}.map-style-midnight .labels .room-name{stroke:rgba(2,8,22,.92)}
.map-style-print .paper{fill:#fff}.map-style-print .paper-texture{opacity:0}.map-style-print .map-grid line,.map-style-print .floor-grid line{stroke:rgba(0,0,0,.10)}.map-style-print .floor-fill{fill:rgba(0,0,0,.035)}.map-style-print .room-floor-accent,.map-style-print .corridor-floor-accent{fill:rgba(0,0,0,.025)}.map-style-print .wall-main path,.map-style-print .door-symbols .door-wall-line,.map-style-print .corridor-junctions .junction-wall-line{stroke:#000}.map-style-print .wall-shadow path,.map-style-print .wall-sketch path{stroke:none}.map-style-print .door-cuts .door-opening{stroke:#fff}.map-style-print .labels .room-number-badge{fill:#fff;stroke:#000}.map-style-print .labels text{fill:#000;font-family:Inter,ui-sans-serif,system-ui}.map-style-print .labels .room-name{stroke:#fff}
`;

export const EDITOR_CAVE_STYLE = `
.editor-overlays .cave-zone-overlay path{fill:rgba(214,184,98,.11);stroke:none;pointer-events:none}
.editor-overlays .cave-zone-overlay--hovered path{fill:rgba(214,184,98,.18)}
.editor-overlays .cave-zone-overlay--selected path{fill:rgba(255,231,143,.23)}
.cave-zone-overlay__node{fill:rgba(239,228,202,.78);stroke:rgba(29,25,21,.48);stroke-width:1.4;pointer-events:none}
.cave-zone-overlay__label{fill:#1d1915;font-size:8px;font-weight:900;font-family:Inter,ui-sans-serif,system-ui;pointer-events:none;paint-order:stroke;stroke:#efe4ca;stroke-width:2px;stroke-linejoin:round}
.editor-overlays .cave-tunnel-trace{fill:none;stroke:rgba(122,67,36,.34);stroke-width:4.8;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:7 8;vector-effect:non-scaling-stroke;pointer-events:none}
.editor-overlays .cave-tunnel-trace--active{stroke:rgba(255,231,143,.78);stroke-width:6.2}
.cave-passage-handle{fill:rgba(239,228,202,.86);stroke:#7a4324;stroke-width:2;cursor:grab;pointer-events:all}
.cave-passage-handle.is-dragging{fill:#7a4324;stroke:#efe4ca;cursor:grabbing}
`;

export const HEX_CAVE_DIRECTIONS = [
  { q: 1, r: 0, edge: [5, 0] },
  { q: 1, r: -1, edge: [0, 1] },
  { q: 0, r: -1, edge: [1, 2] },
  { q: -1, r: 0, edge: [2, 3] },
  { q: -1, r: 1, edge: [3, 4] },
  { q: 0, r: 1, edge: [4, 5] },
];

export function hexKey(q, r) {
  return `${q},${r}`;
}

export function parseHexKey(key) {
  const [q, r] = key.split(",").map(Number);
  return { q, r };
}

export function getCaveHexSize(config) {
  return config.gridSize * 0.78;
}

export function getCaveHexOrigin(config) {
  return { x: config.gridSize * 0.35, y: config.gridSize * 0.25 };
}

export function axialHexToPixel(hex, size, origin) {
  return {
    x: origin.x + size * Math.sqrt(3) * (hex.q + hex.r / 2),
    y: origin.y + size * 1.5 * hex.r,
  };
}

export function roundAxialHex(q, r) {
  let x = q;
  let z = r;
  const y = -x - z;
  let rx = Math.round(x);
  const ry = Math.round(y);
  let rz = Math.round(z);
  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);

  if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz;
  else if (yDiff <= zDiff) rz = -rx - ry;

  return { q: rx, r: rz };
}

export function pixelToAxialHex(point, size, origin) {
  const x = point.x - origin.x;
  const y = point.y - origin.y;
  return roundAxialHex(
    ((Math.sqrt(3) / 3) * x - y / 3) / size,
    ((2 / 3) * y) / size,
  );
}

export function getHexDistance(a, b) {
  return (
    (Math.abs(a.q - b.q) +
      Math.abs(a.q + a.r - b.q - b.r) +
      Math.abs(a.r - b.r)) /
    2
  );
}

export function addHexDisc(hexes, center, radius) {
  const r = Math.max(0, Math.round(radius));
  for (let dq = -r; dq <= r; dq += 1) {
    for (let dr = Math.max(-r, -dq - r); dr <= Math.min(r, -dq + r); dr += 1) {
      hexes.set(hexKey(center.q + dq, center.r + dr), {
        q: center.q + dq,
        r: center.r + dr,
      });
    }
  }
}

export function getHexCornerPoints(hex, size, origin) {
  const center = axialHexToPixel(hex, size, origin);
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 180) * (30 + index * 60);
    return {
      x: center.x + Math.cos(angle) * size,
      y: center.y + Math.sin(angle) * size,
    };
  });
}

export function getHexNeighbors(hex) {
  return HEX_CAVE_DIRECTIONS.map((direction) => ({
    q: hex.q + direction.q,
    r: hex.r + direction.r,
  }));
}

export function getLargestConnectedHexMap(hexMap) {
  const unvisited = new Set(hexMap.keys());
  let best = new Map();

  while (unvisited.size > 0) {
    const startKey = unvisited.values().next().value;
    const queue = [parseHexKey(startKey)];
    const component = new Map();
    unvisited.delete(startKey);

    while (queue.length > 0) {
      const current = queue.shift();
      const currentKey = hexKey(current.q, current.r);
      component.set(currentKey, current);
      getHexNeighbors(current).forEach((neighbor) => {
        const key = hexKey(neighbor.q, neighbor.r);
        if (!unvisited.has(key)) return;
        unvisited.delete(key);
        queue.push(neighbor);
      });
    }

    if (component.size > best.size) best = component;
  }

  return best;
}

export function addNoisyHexBlob(
  target,
  center,
  radius,
  config,
  seedParts = [],
  options = {},
) {
  const reach = Math.max(1, Math.ceil(radius + (options.reachBonus || 1.5)));
  const thresholdBias = Number.isFinite(options.thresholdBias)
    ? options.thresholdBias
    : 0;
  for (let dq = -reach; dq <= reach; dq += 1) {
    for (let dr = -reach; dr <= reach; dr += 1) {
      const cell = { q: center.q + dq, r: center.r + dr };
      const distance = getHexDistance(center, cell);
      if (distance > reach) continue;
      const noise =
        ((hashStringToSeed(
          config.seed,
          ...seedParts,
          cell.q,
          cell.r,
          "blob-noise",
        ) %
          1000) /
          1000 -
          0.5) *
        (options.noiseScale || 1.25);
      if (distance <= radius + noise + thresholdBias)
        target.set(hexKey(cell.q, cell.r), cell);
    }
  }
}

export function subtractNoisyHexBite(
  target,
  center,
  radius,
  config,
  seedParts = [],
) {
  Array.from(target.values()).forEach((cell) => {
    const distance = getHexDistance(center, cell);
    const noise =
      ((hashStringToSeed(
        config.seed,
        ...seedParts,
        cell.q,
        cell.r,
        "bite-noise",
      ) %
        1000) /
        1000 -
        0.5) *
      0.85;
    if (distance <= radius + noise) target.delete(hexKey(cell.q, cell.r));
  });
}

export function createHexCaveRoomCells(hexes, region, centerHex, config, rng) {
  const singleCaveRegion =
    normalizeRoomCount(config.roomCount, config.regions?.length || 1) <= 1;
  const maxRectSide = Math.max(region.cellRect.w, region.cellRect.h);
  const minRectSide = Math.min(region.cellRect.w, region.cellRect.h);
  const baseRadius = singleCaveRegion
    ? clamp(Math.round(maxRectSide * 0.42 + minRectSide * 0.16), 7, 14)
    : clamp(Math.round(maxRectSide * 0.38), 2, 6);
  const local = new Map();

  addNoisyHexBlob(local, centerHex, baseRadius, config, [region.id, "main"], {
    noiseScale: singleCaveRegion ? 1.85 : 1.2,
    thresholdBias: singleCaveRegion ? 0.2 : 0,
  });

  const lobeCount = singleCaveRegion
    ? randomInt(rng, 9, 15)
    : randomInt(rng, 3, 6);
  const dominantDirection =
    hashStringToSeed(config.seed, region.id, "dominant-cave-direction") %
    HEX_CAVE_DIRECTIONS.length;

  for (let index = 0; index < lobeCount; index += 1) {
    const dirIndex = singleCaveRegion
      ? (dominantDirection +
          randomInt(rng, -2, 3) +
          HEX_CAVE_DIRECTIONS.length) %
        HEX_CAVE_DIRECTIONS.length
      : hashStringToSeed(config.seed, region.id, index, "hex-cave-lobe-dir") %
        HEX_CAVE_DIRECTIONS.length;
    const sideIndex =
      (dirIndex + (rng() > 0.5 ? 1 : -1) + HEX_CAVE_DIRECTIONS.length) %
      HEX_CAVE_DIRECTIONS.length;
    const direction = HEX_CAVE_DIRECTIONS[dirIndex];
    const sideDirection = HEX_CAVE_DIRECTIONS[sideIndex];
    const distance = singleCaveRegion
      ? randomInt(rng, 2, baseRadius + 5)
      : randomInt(rng, 1, Math.max(2, baseRadius + 1));
    const sideShift = singleCaveRegion
      ? randomInt(rng, -2, 2)
      : randomInt(rng, -1, 1);
    const lobe = {
      q: centerHex.q + direction.q * distance + sideDirection.q * sideShift,
      r: centerHex.r + direction.r * distance + sideDirection.r * sideShift,
    };
    const lobeRadius = singleCaveRegion
      ? randomInt(
          rng,
          Math.max(3, Math.round(baseRadius * 0.28)),
          Math.max(4, Math.round(baseRadius * 0.58)),
        )
      : randomInt(rng, 1, Math.max(2, Math.round(baseRadius * 0.55)));
    addNoisyHexBlob(
      local,
      lobe,
      lobeRadius,
      config,
      [region.id, index, "lobe"],
      {
        noiseScale: singleCaveRegion ? 1.65 : 1.05,
        thresholdBias: singleCaveRegion ? 0.1 : 0,
      },
    );
  }

  if (singleCaveRegion) {
    const spurCount = randomInt(rng, 3, 6);
    for (let index = 0; index < spurCount; index += 1) {
      const direction =
        HEX_CAVE_DIRECTIONS[
          (dominantDirection + index + randomInt(rng, 0, 2)) %
            HEX_CAVE_DIRECTIONS.length
        ];
      const length = randomInt(
        rng,
        Math.max(4, Math.round(baseRadius * 0.42)),
        Math.max(6, Math.round(baseRadius * 0.9)),
      );
      const spurCenter = { q: centerHex.q, r: centerHex.r };
      for (let step = 1; step <= length; step += 1) {
        spurCenter.q += direction.q;
        spurCenter.r += direction.r;
        if (rng() > 0.64) {
          const drift =
            HEX_CAVE_DIRECTIONS[
              (HEX_CAVE_DIRECTIONS.indexOf(direction) + (rng() > 0.5 ? 1 : 5)) %
                HEX_CAVE_DIRECTIONS.length
            ];
          spurCenter.q += drift.q;
          spurCenter.r += drift.r;
        }
        addNoisyHexBlob(
          local,
          spurCenter,
          step < length * 0.72 ? 2 : 1,
          config,
          [region.id, index, step, "spur"],
          { noiseScale: 0.8 },
        );
      }
    }
  }

  const biteCount = singleCaveRegion
    ? randomInt(rng, 7, 12)
    : randomInt(rng, 1, 3);
  for (let index = 0; index < biteCount; index += 1) {
    const direction =
      HEX_CAVE_DIRECTIONS[
        hashStringToSeed(config.seed, region.id, index, "hex-cave-bite-dir") %
          HEX_CAVE_DIRECTIONS.length
      ];
    const distance = singleCaveRegion
      ? randomInt(rng, Math.max(4, baseRadius - 1), baseRadius + 5)
      : randomInt(rng, Math.max(2, baseRadius - 1), baseRadius + 2);
    const bite = {
      q: centerHex.q + direction.q * distance,
      r: centerHex.r + direction.r * distance,
    };
    const radius = singleCaveRegion
      ? randomInt(rng, 2, 5)
      : randomInt(rng, 1, 2);
    subtractNoisyHexBite(local, bite, radius, config, [
      region.id,
      index,
      "bite",
    ]);
  }

  const connected = getLargestConnectedHexMap(local);
  connected.forEach((cell, key) => hexes.set(key, cell));
}

export function createHexCaveTunnelCells(
  hexes,
  fromRegion,
  toRegion,
  config,
  rng,
  edgeId,
) {
  if (!fromRegion || !toRegion) return;
  const size = getCaveHexSize(config);
  const origin = getCaveHexOrigin(config);
  const start = fromRegion.labelPoint;
  const end = toRegion.labelPoint;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const bend =
    ((hashStringToSeed(config.seed, edgeId, "hex-cave-tunnel-bend") % 100) /
      100 -
      0.5) *
    config.gridSize *
    5.2;
  const sampleCount = clamp(Math.ceil(length / (size * 0.62)), 8, 44);

  for (let index = 0; index <= sampleCount; index += 1) {
    const t = index / sampleCount;
    const arch = Math.sin(Math.PI * t);
    const jitter =
      ((hashStringToSeed(config.seed, edgeId, index, "hex-cave-tunnel-jitter") %
        100) /
        100 -
        0.5) *
      size *
      0.82;
    const point = {
      x: start.x + dx * t + nx * (bend * arch + jitter * arch),
      y: start.y + dy * t + ny * (bend * arch + jitter * arch),
    };
    const hex = pixelToAxialHex(point, size, origin);
    const local =
      hashStringToSeed(config.seed, edgeId, index, "hex-cave-tunnel-width") %
      100;
    const radius =
      index < 2 || index > sampleCount - 2 ? 2 : local > 78 ? 2 : 1;
    addHexDisc(hexes, hex, radius);
  }
}

export function smoothHexCaveCells(hexes, passes = 2) {
  let current = new Map(hexes);
  for (let pass = 0; pass < passes; pass += 1) {
    const neighborCounts = new Map();
    current.forEach((hex) => {
      HEX_CAVE_DIRECTIONS.forEach((direction) => {
        const key = hexKey(hex.q + direction.q, hex.r + direction.r);
        neighborCounts.set(key, (neighborCounts.get(key) || 0) + 1);
      });
    });
    const next = new Map(current);
    neighborCounts.forEach((count, key) => {
      if (current.has(key)) return;
      if (count >= 4) next.set(key, parseHexKey(key));
    });
    current = next;
  }
  return current;
}

export function createHexCaveCells(generatedMap) {
  const { config, regions, graph = [] } = generatedMap;
  const size = getCaveHexSize(config);
  const origin = getCaveHexOrigin(config);
  const hexes = new Map();
  const singleCaveRegion =
    normalizeRoomCount(config.roomCount, regions.length || 1) <= 1;

  regions.forEach((region) => {
    const rng = createSeededRng(
      hashStringToSeed(config.seed, region.id, "hex-cave-region"),
    );
    const centerHex = pixelToAxialHex(region.labelPoint, size, origin);
    createHexCaveRoomCells(hexes, region, centerHex, config, rng);
  });

  if (!singleCaveRegion) {
    graph.forEach((edge) => {
      const fromRegion = regions.find((region) => region.id === edge.from);
      const toRegion = regions.find((region) => region.id === edge.to);
      const rng = createSeededRng(
        hashStringToSeed(config.seed, edge.id, "hex-cave-edge"),
      );
      createHexCaveTunnelCells(
        hexes,
        fromRegion,
        toRegion,
        config,
        rng,
        edge.id,
      );
    });
  }

  const smoothed = smoothHexCaveCells(hexes, singleCaveRegion ? 1 : 2);
  const connected = getLargestConnectedHexMap(smoothed);
  return Array.from(
    connected.size > 0 ? connected.values() : smoothed.values(),
  );
}

export function roundGeometryPoint(point) {
  return {
    x: Math.round(point.x * 100) / 100,
    y: Math.round(point.y * 100) / 100,
  };
}

export function createHexCaveBoundarySegments(hexCells, config) {
  const size = getCaveHexSize(config);
  const origin = getCaveHexOrigin(config);
  const hexSet = new Set(hexCells.map((hex) => hexKey(hex.q, hex.r)));
  const segments = [];

  hexCells.forEach((hex) => {
    const corners = getHexCornerPoints(hex, size, origin).map(
      roundGeometryPoint,
    );
    HEX_CAVE_DIRECTIONS.forEach((direction) => {
      if (hexSet.has(hexKey(hex.q + direction.q, hex.r + direction.r))) return;
      const [aIndex, bIndex] = direction.edge;
      const a = corners[aIndex];
      const b = corners[bIndex];
      segments.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    });
  });

  return segments;
}

export function createHexCavePathFromSegments(
  segments,
  config,
  layer = "floor",
) {
  const loops = buildBoundaryLoops(segments)
    .filter((loop) => loop.length > 3)
    .sort((a, b) => Math.abs(polygonArea(b)) - Math.abs(polygonArea(a)));
  const seed = hashStringToSeed(config.seed, layer, "hex-cave-contour");
  return loops
    .slice(0, 4)
    .map((loop, loopIndex) => {
      const smoothed = chaikinClosed(loop, layer === "wall" ? 2 : 3);
      const jittered = jitterCaveContourPoints(
        smoothed,
        `${seed}:${loopIndex}`,
        config.gridSize * (layer === "floor" ? 0.22 : 0.16),
      );
      const softened = chaikinClosed(jittered, 1);
      return catmullRomClosedPath(softened);
    })
    .filter(Boolean)
    .join(" ");
}

export function getApproximateSquareCellsForHexCave(hexCells, config) {
  const size = getCaveHexSize(config);
  const origin = getCaveHexOrigin(config);
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const cells = new Map();
  hexCells.forEach((hex) => {
    const center = axialHexToPixel(hex, size, origin);
    const cell = {
      x: clamp(Math.floor(center.x / config.gridSize), 0, gridW - 1),
      y: clamp(Math.floor(center.y / config.gridSize), 0, gridH - 1),
    };
    cells.set(cellKey(cell.x, cell.y), cell);
  });
  return Array.from(cells.values());
}

export function createHexCaveSurface(generatedMap) {
  const hexCells = createHexCaveCells(generatedMap);
  const boundarySegments = createHexCaveBoundarySegments(
    hexCells,
    generatedMap.config,
  );
  const visualFloorPath = createHexCavePathFromSegments(
    boundarySegments,
    generatedMap.config,
    "floor",
  );
  const wallPath = createHexCavePathFromSegments(
    boundarySegments,
    generatedMap.config,
    "wall",
  );
  const floorCells = getApproximateSquareCellsForHexCave(
    hexCells,
    generatedMap.config,
  );
  return {
    kind: "hex-cave-map",
    geometryKind: "hex-cave-map",
    surfaceKind: "cave",
    hexCells,
    floorCells,
    visualFloorPath,
    clipPath: visualFloorPath,
    wallPath,
    boundarySegments,
  };
}

export function createOrganicMapBoundaryPath(
  segments,
  config,
  layer = "floor",
) {
  const loops = buildBoundaryLoops(segments)
    .filter((loop) => loop.length > 3)
    .sort((a, b) => Math.abs(polygonArea(b)) - Math.abs(polygonArea(a)));
  const roughConfig = {
    ...config,
    seed: hashStringToSeed(config.seed, layer, "organic-map-boundary"),
  };
  return loops
    .map((loop, loopIndex) => {
      const rough = roughenBoundaryLoop(loop, roughConfig, loopIndex);
      if (rough.length <= 2) return "";
      const rounded = chaikinClosed(rough, layer === "floor" ? 2 : 1);
      const softened = chaikinClosed(rounded, 1);
      return catmullRomClosedPath(softened);
    })
    .filter(Boolean)
    .join(" ");
}

export function countCellsAround(set, cell, diagonal = true) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      if (!diagonal && Math.abs(dx) + Math.abs(dy) !== 1) continue;
      if (set.has(cellKey(cell.x + dx, cell.y + dy))) count += 1;
    }
  }
  return count;
}

export function createNaturalCaveVisualCells(floorCells, config) {
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  let current = new Set(
    (floorCells || []).map((cell) => cellKey(cell.x, cell.y)),
  );

  for (let pass = 0; pass < 3; pass += 1) {
    const candidates = new Set(current);
    current.forEach((key) => {
      const cell = parseCellKey(key);
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const next = { x: cell.x + dx, y: cell.y + dy };
          if (
            next.x < 1 ||
            next.y < 1 ||
            next.x >= gridW - 1 ||
            next.y >= gridH - 1
          )
            continue;
          candidates.add(cellKey(next.x, next.y));
        }
      }
    });

    const next = new Set(current);
    candidates.forEach((key) => {
      const cell = parseCellKey(key);
      const neighbors8 = countCellsAround(current, cell, true);
      const neighbors4 = countCellsAround(current, cell, false);
      const noise =
        hashStringToSeed(config.seed, key, pass, "natural-cave-visual-cell") %
        100;
      if (
        !current.has(key) &&
        (neighbors8 >= 5 || neighbors4 >= 3 || (neighbors8 >= 4 && noise < 42))
      )
        next.add(key);
      if (current.has(key) && neighbors4 <= 1 && neighbors8 <= 2 && noise < 62)
        next.delete(key);
    });
    current = next;
  }

  return Array.from(current).map(parseCellKey);
}

export function addBoundaryEdge(edges, a, b) {
  edges.push({ a, b, used: false });
}

export function traceBoundaryLoops(edges) {
  const starts = new Map();
  edges.forEach((edge, index) => {
    const key = pointKey(edge.a);
    if (!starts.has(key)) starts.set(key, []);
    starts.get(key).push(index);
  });

  const loops = [];
  edges.forEach((edge, startIndex) => {
    if (edge.used) return;
    edge.used = true;
    const loop = [{ ...edge.a }, { ...edge.b }];
    let current = edge.b;
    let guard = 0;

    while (guard < edges.length + 4) {
      guard += 1;
      if (current.x === loop[0].x && current.y === loop[0].y) break;
      const candidates = starts.get(pointKey(current)) || [];
      const nextIndex = candidates.find(
        (candidateIndex) => !edges[candidateIndex].used,
      );
      if (nextIndex == null) break;
      const nextEdge = edges[nextIndex];
      nextEdge.used = true;
      current = nextEdge.b;
      loop.push({ ...current });
    }

    if (loop.length >= 5) loops.push(loop);
  });

  return loops;
}

export function polygonArea(points) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const a = points[index];
    const b = points[(index + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
}

export function simplifyCollinearPoints(points) {
  if (!points || points.length <= 4) return points || [];
  return points.filter((point, index) => {
    const previous = points[(index - 1 + points.length) % points.length];
    const next = points[(index + 1) % points.length];
    const sameX = previous.x === point.x && point.x === next.x;
    const sameY = previous.y === point.y && point.y === next.y;
    return !sameX && !sameY;
  });
}

export function chaikinClosed(points, iterations = 2) {
  let current = [...points];
  for (let pass = 0; pass < iterations; pass += 1) {
    const next = [];
    current.forEach((point, index) => {
      const following = current[(index + 1) % current.length];
      next.push({
        x: point.x * 0.75 + following.x * 0.25,
        y: point.y * 0.75 + following.y * 0.25,
      });
      next.push({
        x: point.x * 0.25 + following.x * 0.75,
        y: point.y * 0.25 + following.y * 0.75,
      });
    });
    current = next;
  }
  return current;
}

export function jitterCaveContourPoints(points, seed, amount) {
  if (!points || points.length === 0) return [];
  const center = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 },
  );
  center.x /= points.length;
  center.y /= points.length;

  return points.map((point, index) => {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const length = Math.hypot(dx, dy) || 1;
    const outward = { x: dx / length, y: dy / length };
    const noiseA =
      (hashStringToSeed(seed, index, "cave-contour-a") % 1000) / 1000;
    const noiseB =
      (hashStringToSeed(seed, index, "cave-contour-b") % 1000) / 1000;
    const radial = (noiseA - 0.5) * amount;
    const tangent = (noiseB - 0.5) * amount * 0.45;
    return {
      x: point.x + outward.x * radial + -outward.y * tangent,
      y: point.y + outward.y * radial + outward.x * tangent,
    };
  });
}

export function catmullRomClosedPath(points) {
  if (!points || points.length < 3) return "";
  const p = points;
  let d = `M ${roundTo(p[0].x, 2)} ${roundTo(p[0].y, 2)}`;
  for (let index = 0; index < p.length; index += 1) {
    const p0 = p[(index - 1 + p.length) % p.length];
    const p1 = p[index];
    const p2 = p[(index + 1) % p.length];
    const p3 = p[(index + 2) % p.length];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${roundTo(c1.x, 2)} ${roundTo(c1.y, 2)} ${roundTo(c2.x, 2)} ${roundTo(c2.y, 2)} ${roundTo(p2.x, 2)} ${roundTo(p2.y, 2)}`;
  }
  return `${d} Z`;
}

export function buildOrganicCaveContourPath(floorCells, gridSize, seed) {
  const cells = new Set(
    (floorCells || []).map((cell) => cellKey(cell.x, cell.y)),
  );
  if (cells.size === 0) return "";

  const edges = [];
  cells.forEach((key) => {
    const cell = parseCellKey(key);
    const x = cell.x;
    const y = cell.y;
    if (!cells.has(cellKey(x, y - 1)))
      addBoundaryEdge(edges, { x, y }, { x: x + 1, y });
    if (!cells.has(cellKey(x + 1, y)))
      addBoundaryEdge(edges, { x: x + 1, y }, { x: x + 1, y: y + 1 });
    if (!cells.has(cellKey(x, y + 1)))
      addBoundaryEdge(edges, { x: x + 1, y: y + 1 }, { x, y: y + 1 });
    if (!cells.has(cellKey(x - 1, y)))
      addBoundaryEdge(edges, { x, y: y + 1 }, { x, y });
  });

  const loops = traceBoundaryLoops(edges)
    .map(simplifyCollinearPoints)
    .filter((loop) => loop.length >= 4)
    .sort((a, b) => Math.abs(polygonArea(b)) - Math.abs(polygonArea(a)));

  if (loops.length === 0) return "";

  return loops
    .slice(0, 3)
    .map((loop, loopIndex) => {
      const pixelLoop = loop.map((point) => ({
        x: point.x * gridSize,
        y: point.y * gridSize,
      }));
      const rounded = chaikinClosed(pixelLoop, loopIndex === 0 ? 3 : 2);
      const jittered = jitterCaveContourPoints(
        rounded,
        `${seed}:loop:${loopIndex}`,
        gridSize * (loopIndex === 0 ? 0.34 : 0.16),
      );
      const softened = chaikinClosed(jittered, 1);
      return catmullRomClosedPath(softened);
    })
    .filter(Boolean)
    .join(" ");
}

export function isSingleRegionCaveMap(generatedMap) {
  const regions = Array.isArray(generatedMap?.regions)
    ? generatedMap.regions
    : [];
  return isPureCaveMap(generatedMap) && regions.length <= 1;
}

export function createSeededRandom(seed) {
  let state = 2166136261;
  const input = String(seed ?? "cruor-map-seed");
  for (let i = 0; i < input.length; i += 1) {
    state ^= input.charCodeAt(i);
    state = Math.imul(state, 16777619);
  }
  state >>>= 0;

  return function seededRandom() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function valueNoise2D(x, y, scaleOrRandom = 1, maybeRandom) {
  let scale = 1;
  let random = maybeRandom;

  if (typeof scaleOrRandom === "function") {
    random = scaleOrRandom;
  } else if (Number.isFinite(scaleOrRandom) && scaleOrRandom !== 0) {
    scale = scaleOrRandom;
  }

  const sx = Number.isFinite(x) ? x / scale : 0;
  const sy = Number.isFinite(y) ? y / scale : 0;
  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  const tx = sx - x0;
  const ty = sy - y0;

  const smooth = (t) => t * t * (3 - 2 * t);
  const mix = (a, b, t) => a + (b - a) * t;

  const hash = (ix, iy) => {
    let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };

  const n00 = hash(x0, y0);
  const n10 = hash(x0 + 1, y0);
  const n01 = hash(x0, y0 + 1);
  const n11 = hash(x0 + 1, y0 + 1);

  const u = smooth(tx);
  const v = smooth(ty);
  const base = mix(mix(n00, n10, u), mix(n01, n11, u), v);

  if (typeof random !== "function") return base;
  return mix(base, random(), 0.08);
}

export function getCellBounds(cells) {
  if (!Array.isArray(cells) || cells.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  cells.forEach((cell) => {
    if (!cell) return;
    const x = Number(cell.x);
    const y = Number(cell.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  return { minX, minY, maxX, maxY };
}

export function createSingleRegionWildCaveCells(floorCells, config) {
  if (!Array.isArray(floorCells) || floorCells.length === 0) return [];
  const gridSize = config.gridSize || DEFAULT_CONFIG.gridSize;
  const baseSeed = hashStringToSeed(
    config.seed,
    "single-region-wild-cave-cells",
  );
  const bounds = getCellBounds(floorCells);
  const width = Math.max(1, bounds.maxX - bounds.minX + 1);
  const height = Math.max(1, bounds.maxY - bounds.minY + 1);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const longAxisBias =
    createSeededRandom(baseSeed, "axis-bias")() < 0.5 ? "x" : "y";
  const stretch = 1.25 + createSeededRandom(baseSeed, "stretch")() * 0.85;
  const indentationStrength =
    0.28 + createSeededRandom(baseSeed, "indentation")() * 0.22;
  const spikeStrength = 0.2 + createSeededRandom(baseSeed, "spikes")() * 0.22;
  const keep = new Set();
  const baseSet = new Set(floorCells.map((cell) => cellKey(cell.x, cell.y)));

  floorCells.forEach((cell) => {
    const nx = width <= 1 ? 0 : (cell.x - centerX) / Math.max(1, width / 2);
    const ny = height <= 1 ? 0 : (cell.y - centerY) / Math.max(1, height / 2);
    const sx = longAxisBias === "x" ? nx / stretch : nx * stretch;
    const sy = longAxisBias === "y" ? ny / stretch : ny * stretch;
    const angle = Math.atan2(sy, sx);
    const radius = Math.hypot(sx, sy);
    const radialNoise =
      Math.sin(angle * 3 + baseSeed * 0.00011) * indentationStrength +
      Math.sin(angle * 5.7 + baseSeed * 0.00017) * 0.18 +
      Math.sin(angle * 9.3 + baseSeed * 0.00023) * spikeStrength;
    const localNoise =
      valueNoise2D(cell.x * 0.43, cell.y * 0.43, baseSeed) * 0.24;
    const edgeNoise =
      valueNoise2D(cell.x * 0.91, cell.y * 0.91, baseSeed + 971) * 0.18;
    const threshold = 1.02 + radialNoise + localNoise + edgeNoise;
    const randomPocket = createSeededRandom(
      baseSeed,
      cell.x,
      cell.y,
      "single-cave-pocket",
    )();
    if (radius <= threshold || (radius <= 1.22 && randomPocket > 0.78)) {
      keep.add(cellKey(cell.x, cell.y));
    }
  });

  const boundary = [...keep].map(parseCellKey).filter((cell) => {
    const neighbors = ORTHOGONAL_DIRECTIONS.map((dir) =>
      cellKey(cell.x + dir.x, cell.y + dir.y),
    );
    return neighbors.some((key) => !keep.has(key));
  });

  boundary.forEach((cell) => {
    const angle = Math.atan2(cell.y - centerY, cell.x - centerX);
    const spikeRoll = createSeededRandom(
      baseSeed,
      cell.x,
      cell.y,
      "single-cave-spike",
    )();
    if (spikeRoll < 0.18) {
      const length =
        1 +
        Math.floor(
          createSeededRandom(
            baseSeed,
            cell.x,
            cell.y,
            "single-cave-spike-length",
          )() * 3,
        );
      const dx = Math.round(Math.cos(angle));
      const dy = Math.round(Math.sin(angle));
      for (let step = 1; step <= length; step += 1) {
        const x = cell.x + dx * step;
        const y = cell.y + dy * step;
        const key = cellKey(x, y);
        if (baseSet.has(key)) keep.add(key);
      }
    }
  });

  const cells = [...keep].map(parseCellKey);
  const naturalized = createNaturalCaveVisualCells(cells, {
    ...config,
    gridSize,
  });
  return naturalized.length > 0 ? naturalized : cells;
}

export function createCellBasedCaveSurface(generatedMap) {
  const { config, dungeonMask } = generatedMap;
  const floorCells = dungeonMask.floorCells || [];
  const visualFloorCells = isSingleRegionCaveMap(generatedMap)
    ? createSingleRegionWildCaveCells(floorCells, config)
    : createNaturalCaveVisualCells(floorCells, config);
  const renderCells =
    visualFloorCells.length > 0 ? visualFloorCells : floorCells;
  const boundarySegments = computeBoundarySegments(
    renderCells,
    config.gridSize,
  );
  const organicContourPath = buildOrganicCaveContourPath(
    renderCells,
    config.gridSize,
    hashStringToSeed(config.seed, "cell-cave-unified-contour"),
  );
  const visualFloorPath =
    organicContourPath ||
    createOrganicMapBoundaryPath(boundarySegments, config, "floor") ||
    buildFloorPath(renderCells, config.gridSize);
  const wallPath =
    createOrganicMapBoundaryPath(boundarySegments, config, "wall") ||
    visualFloorPath;
  const sketchPath =
    createOrganicMapBoundaryPath(boundarySegments, config, "sketch") ||
    wallPath;
  return {
    kind: "organic-cave-map",
    geometryKind: "organic-cave-map",
    surfaceKind: "cave",
    floorCells,
    visualFloorCells,
    visualFloorPath,
    clipPath: visualFloorPath,
    wallPath,
    sketchPath,
    boundarySegments,
  };
}

export function isPureCaveMap(generatedMap) {
  return (
    getContextKey(
      generatedMap?.config?.context || generatedMap?.config?.biome,
    ) === "cave"
  );
}

export function createRenderableSubsetMap(
  generatedMap,
  regionPredicate,
  corridorPredicate,
) {
  const regions = generatedMap.regions.filter(regionPredicate);
  const regionIds = new Set(regions.map((region) => region.id));
  const corridors = generatedMap.corridors.filter((corridor) =>
    corridorPredicate(corridor, regionIds),
  );
  const baseDungeonMask = buildDungeonMask(
    regions,
    corridors,
    generatedMap.config.gridSize,
  );
  const mapAccesses = (
    generatedMap.dungeonMask.mapAccesses ||
    generatedMap.mapAccesses ||
    []
  ).filter((access) => regionIds.has(access.regionId));
  const dungeonMask = { ...baseDungeonMask, mapAccesses };
  return {
    ...generatedMap,
    regions,
    corridors,
    dungeonMask,
    mapAccesses,
    props: (generatedMap.props || []).filter((prop) =>
      regionIds.has(prop.regionId),
    ),
    contentBounds: computeContentBounds(
      dungeonMask.floorCells,
      generatedMap.config.gridSize,
      generatedMap.contentBounds || {
        x: 0,
        y: 0,
        width: generatedMap.config.mapWidth,
        height: generatedMap.config.mapHeight,
      },
    ),
  };
}

export function createLevelFilteredMap(
  generatedMap,
  levelView,
  variant = "active",
) {
  const level = normalizeLevelView(
    levelView,
    getAvailableMapLevels(generatedMap),
  );
  if (level === LEVEL_VIEW_ALL) return generatedMap;
  const active = variant === "active";
  return createRenderableSubsetMap(
    generatedMap,
    (region) =>
      active
        ? getRegionLevel(region) === level
        : getRegionLevel(region) !== level,
    (corridor) =>
      active
        ? isCorridorVisibleOnLevel(corridor, level)
        : !isCorridorVisibleOnLevel(corridor, level),
  );
}

export function cellRectToPath(cell, gridSize) {
  const x = cell.x * gridSize;
  const y = cell.y * gridSize;
  const g = gridSize;
  return `M${x} ${y}H${x + g}V${y + g}H${x}Z`;
}

export function buildFloorPath(floorCells, gridSize) {
  return floorCells.map((cell) => cellRectToPath(cell, gridSize)).join(" ");
}

export function buildOrganicCellBoundaryPath(
  region,
  generatedMap = null,
  gridSize = DEFAULT_CONFIG.gridSize,
) {
  const sourceCells = Array.isArray(region.floorCells) ? region.floorCells : [];
  if (sourceCells.length === 0) return "";
  const seed = generatedMap?.config?.seed || DEFAULT_CONFIG.seed;
  const floorCells = isSingleRegionCaveMap(generatedMap)
    ? createSingleRegionWildCaveCells(sourceCells, {
        ...(generatedMap?.config || DEFAULT_CONFIG),
        gridSize,
        seed: hashStringToSeed(seed, region.id, "single-region-path"),
      })
    : sourceCells;
  const organicContourPath = buildOrganicCaveContourPath(
    floorCells,
    gridSize,
    hashStringToSeed(
      seed,
      region.id,
      region.shape || "cave",
      "organic-region-contour",
    ),
  );
  if (organicContourPath) return organicContourPath;
  const boundarySegments = computeBoundarySegments(floorCells, gridSize);
  const loops = buildBoundaryLoops(boundarySegments);
  const roughConfig = {
    gridSize,
    seed: hashStringToSeed(
      seed,
      region.id,
      region.shape || "cave",
      "organic-region-surface",
    ),
  };
  return loops
    .map((loop, loopIndex) => roughenBoundaryLoop(loop, roughConfig, loopIndex))
    .filter((points) => points.length > 2)
    .map((points) => catmullRomClosedPath(chaikinClosed(points, 1)))
    .filter(Boolean)
    .join(" ");
}

export function buildOrganicCorridorBoundaryPath(
  corridor,
  generatedMap = null,
  gridSize = DEFAULT_CONFIG.gridSize,
  layer = "surface",
) {
  const floorCells = Array.isArray(corridor.floorCells)
    ? corridor.floorCells
    : [];
  if (!isOrganicCorridor(corridor) || floorCells.length === 0) return "";
  const seed = generatedMap?.config?.seed || DEFAULT_CONFIG.seed;
  const organicContourPath = buildOrganicCaveContourPath(
    floorCells,
    gridSize,
    hashStringToSeed(seed, corridor.id, layer, "organic-corridor-contour"),
  );
  if (organicContourPath) return organicContourPath;
  const boundarySegments = computeBoundarySegments(floorCells, gridSize);
  const loops = buildBoundaryLoops(boundarySegments);
  const roughConfig = {
    gridSize,
    seed: hashStringToSeed(
      seed,
      corridor.id,
      layer,
      "organic-corridor-surface",
    ),
  };
  return loops
    .map((loop, loopIndex) => roughenBoundaryLoop(loop, roughConfig, loopIndex))
    .filter((points) => points.length > 2)
    .map((points) => catmullRomClosedPath(chaikinClosed(points, 1)))
    .filter(Boolean)
    .join(" ");
}

export function createCorridorSurface(
  corridor,
  generatedMap = null,
  gridSizeFallback = DEFAULT_CONFIG.gridSize,
) {
  const gridSize =
    generatedMap?.config?.gridSize ||
    gridSizeFallback ||
    DEFAULT_CONFIG.gridSize;
  const floorCells = Array.isArray(corridor.floorCells)
    ? corridor.floorCells
    : [];
  const organicPath = buildOrganicCorridorBoundaryPath(
    corridor,
    generatedMap,
    gridSize,
    "surface",
  );
  const visualFloorPath = organicPath || buildFloorPath(floorCells, gridSize);
  const organicSurface = Boolean(organicPath);
  return {
    corridorId: corridor.id,
    surfaceKind: isOrganicCorridor(corridor) ? "cave" : "dungeon",
    kind: organicSurface ? "organic-corridor-mask" : "corridor-cell-mask",
    geometryKind: organicSurface
      ? "organic-corridor-mask"
      : "corridor-cell-mask",
    gridSize,
    floorCells,
    pathCells: getCorridorTopologyCells(corridor),
    visualFloorPath,
    clipPath: visualFloorPath,
    wallPath: organicSurface
      ? buildOrganicCorridorBoundaryPath(
          corridor,
          generatedMap,
          gridSize,
          "wall",
        )
      : "",
    boundarySegments: computeBoundarySegments(floorCells, gridSize),
  };
}

export function buildCorridorsVisualFloorPath(
  corridors,
  generatedMap,
  gridSize,
) {
  return corridors
    .map(
      (corridor) =>
        createCorridorSurface(corridor, generatedMap, gridSize).visualFloorPath,
    )
    .filter(Boolean)
    .join(" ");
}

export function isOrganicRegionSurface(region, generatedMap = null) {
  const contextKey = generatedMap?.config
    ? getContextKey(generatedMap.config.context || generatedMap.config.biome)
    : getContextKey(region?.placementProfile || "");
  if (contextKey === "cave") {
    return (
      region?.shape === "cave" ||
      region?.surfaceKind === "cave" ||
      region?.placementProfile === "cave"
    );
  }
  if (contextKey === "mine") {
    return region?.surfaceKind === "cave" || region?.surfaceKind === "hybrid";
  }
  return false;
}

export function buildCircleRoomPath(region, gridSize) {
  const circle = getCircleGeometryFromRegion(region, gridSize);
  const { cx, cy, r } = circle;
  return `M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx} ${cy + r}A${r} ${r} 0 1 1 ${cx} ${cy - r}Z`;
}

export function getCirclePortalCellFromAnchor(region, anchor) {
  if (!anchor) return null;
  if (anchor.portalRoomCell)
    return { x: anchor.portalRoomCell.x, y: anchor.portalRoomCell.y };
  return getSnappedCirclePortalCellFromAnchor(anchor) || anchor.cell;
}

export function getCirclePortalSupportCell(region, portal) {
  if (!portal?.anchor || region.shape !== "circle") return null;
  const anchor = portal.anchor;
  const portalCell = { x: portal.x, y: portal.y };
  const supportCell = anchor.originalCell
    ? { x: anchor.originalCell.x, y: anchor.originalCell.y }
    : anchor.expandedCircleDoor && anchor.normal
      ? { x: portalCell.x - anchor.normal.x, y: portalCell.y - anchor.normal.y }
      : null;

  if (!supportCell) return null;
  const distance =
    Math.abs(supportCell.x - portalCell.x) +
    Math.abs(supportCell.y - portalCell.y);
  if (distance !== 1) return null;

  return {
    x: supportCell.x,
    y: supportCell.y,
    side: anchor.side,
    anchor,
    support: true,
  };
}

export function isCellCenterOutsideCircle(cell, circle) {
  const cx = cell.x + 0.5;
  const cy = cell.y + 0.5;
  return (
    Math.hypot(cx - circle.cxCells, cy - circle.cyCells) > circle.rCells - 0.04
  );
}

export function getCirclePortalCells(generatedMap, region) {
  if (!generatedMap || region.shape !== "circle") return [];
  const seen = new Set();
  const cells = [];
  const addCell = (cell, source = {}) => {
    if (!cell) return;
    const key = cellKey(cell.x, cell.y);
    if (seen.has(key)) return;
    seen.add(key);
    cells.push({
      x: cell.x,
      y: cell.y,
      side: source.side || cell.side || null,
      anchor: source.anchor || cell.anchor || null,
      support: Boolean(source.support),
    });
  };

  generatedMap.corridors.forEach((corridor) => {
    [
      corridor.from === region.id ? corridor.fromAnchor : null,
      corridor.to === region.id ? corridor.toAnchor : null,
    ]
      .filter(Boolean)
      .forEach((anchor) => {
        const portalCell = getCirclePortalCellFromAnchor(region, anchor);
        const portal = {
          x: portalCell.x,
          y: portalCell.y,
          side: anchor.side,
          anchor,
        };
        addCell(portal, portal);
        addCell(getCirclePortalSupportCell(region, portal), {
          anchor,
          side: anchor.side,
          support: true,
        });
      });
  });
  return cells;
}

export function getCircleCompositeSquareCells(generatedMap, region) {
  if (!generatedMap || region.shape !== "circle") return [];
  const cellsByKey = new Map();
  const addCompositeCell = (cell, source, anchor = null) => {
    if (!cell) return;
    const key = cellKey(cell.x, cell.y);
    if (cellsByKey.has(key)) return;
    cellsByKey.set(key, {
      x: cell.x,
      y: cell.y,
      source,
      anchor,
      support: source === "support",
    });
  };

  (Array.isArray(region.circleExtensionCells)
    ? region.circleExtensionCells
    : []
  ).forEach((cell) => {
    addCompositeCell(cell, "extension");
  });

  generatedMap.corridors.forEach((corridor) => {
    [
      corridor.from === region.id ? corridor.fromAnchor : null,
      corridor.to === region.id ? corridor.toAnchor : null,
    ]
      .filter((anchor) => anchor?.expandedCircleDoor && anchor.portalRoomCell)
      .forEach((anchor) => {
        const portal = {
          x: anchor.portalRoomCell.x,
          y: anchor.portalRoomCell.y,
          side: anchor.side,
          anchor,
        };
        addCompositeCell(portal, "expanded-door", anchor);
        addCompositeCell(
          getCirclePortalSupportCell(region, portal),
          "support",
          anchor,
        );
      });
  });

  return Array.from(cellsByKey.values());
}

export function createCellMaskRegionSurface(
  region,
  generatedMap = null,
  gridSizeFallback = DEFAULT_CONFIG.gridSize,
) {
  const storedRegionSurface = generatedMap?.finalGeometry?.regions?.[region.id];
  if (storedRegionSurface) return storedRegionSurface;

  const gridSize =
    generatedMap?.config?.gridSize ||
    gridSizeFallback ||
    DEFAULT_CONFIG.gridSize;
  const floorCells = Array.isArray(region.floorCells) ? region.floorCells : [];
  const boundarySegments = computeBoundarySegments(floorCells, gridSize);
  const organicPath = isOrganicRegionSurface(region, generatedMap)
    ? buildOrganicCellBoundaryPath(region, generatedMap, gridSize)
    : "";
  const visualFloorPath = organicPath || buildFloorPath(floorCells, gridSize);
  const organicSurface = Boolean(organicPath);
  return {
    regionId: region.id,
    surfaceKind: getRegionSurfaceKind(region, generatedMap),
    kind: organicSurface ? "organic-cell-mask" : "cell-mask",
    geometryKind: organicSurface ? "organic-cell-mask" : "cell-mask",
    gridSize,
    floorCells,
    extensionCells: [],
    visualFloorPath,
    clipPath: visualFloorPath,
    hoverPath: organicSurface ? visualFloorPath : "",
    hoverSegments: boundarySegments,
    wallArcPath: organicSurface ? visualFloorPath : "",
    wallSegments: boundarySegments,
    boundarySegments,
    connectionAnchors: getDoorBoundaryCells(region),
  };
}

export function createCircleCompositeRegionSurface(
  region,
  generatedMap = null,
  gridSizeFallback = DEFAULT_CONFIG.gridSize,
) {
  const storedRegionSurface = generatedMap?.finalGeometry?.regions?.[region.id];
  if (storedRegionSurface) return storedRegionSurface;

  const gridSize =
    generatedMap?.config?.gridSize ||
    gridSizeFallback ||
    DEFAULT_CONFIG.gridSize;
  const floorCells = Array.isArray(region.floorCells) ? region.floorCells : [];
  const circlePath = buildCircleRoomPath(region, gridSize);
  const extensionCells = getCircleCompositeSquareCells(generatedMap, region);
  const extensionPath = extensionCells
    .map((cell) => cellRectToPath(cell, gridSize))
    .join(" ");
  const visualFloorPath = [circlePath, extensionPath].filter(Boolean).join(" ");
  const hoverPath = generatedMap
    ? createCircleCompositeArcPath(region, generatedMap)
    : circlePath;
  const hoverSegments = generatedMap
    ? getCirclePortalSquareWallSegments(region, generatedMap)
    : [];
  return {
    regionId: region.id,
    surfaceKind: getRegionSurfaceKind(region, generatedMap),
    kind: "circle-composite",
    geometryKind: "circle-composite",
    gridSize,
    floorCells,
    extensionCells,
    visualFloorPath,
    clipPath: visualFloorPath,
    hoverPath,
    hoverSegments,
    wallArcPath: hoverPath,
    wallSegments: hoverSegments,
    boundarySegments: hoverSegments,
    connectionAnchors: getDoorBoundaryCells(region),
  };
}

export function getRegionSurface(
  region,
  generatedMap = null,
  gridSizeFallback = DEFAULT_CONFIG.gridSize,
) {
  if (region.shape === "circle")
    return createCircleCompositeRegionSurface(
      region,
      generatedMap,
      gridSizeFallback,
    );
  return createCellMaskRegionSurface(region, generatedMap, gridSizeFallback);
}

export function getRegionCompositeShape(
  region,
  generatedMap = null,
  gridSizeFallback = DEFAULT_CONFIG.gridSize,
) {
  return getRegionSurface(region, generatedMap, gridSizeFallback);
}

export function buildCircleRoomVisualPath(
  region,
  gridSize,
  generatedMap = null,
) {
  return getRegionSurface(region, generatedMap, gridSize).visualFloorPath;
}

export function buildRegionVisualFloorPath(
  region,
  gridSize,
  generatedMap = null,
) {
  return getRegionSurface(region, generatedMap, gridSize).visualFloorPath;
}

export function isUsableSvgPath(path) {
  return (
    typeof path === "string" &&
    path.trim().length > 0 &&
    !/(NaN|undefined|null)/i.test(path)
  );
}

export function createCaveMapSurfaceFromCaveSurface(generatedMap, caveSurface) {
  const { config, dungeonMask } = generatedMap;
  return {
    kind: "map-surface",
    geometryKind:
      caveSurface.geometryKind || caveSurface.kind || "hex-cave-map",
    surfaceKind: "cave",
    gridSize: config.gridSize,
    caveSurface,
    floorCells: caveSurface.floorCells || dungeonMask.floorCells || [],
    roomFloorCells: dungeonMask.roomFloorCells || [],
    corridorFloorCells: dungeonMask.corridorFloorCells || [],
    visualFloorPath: caveSurface.visualFloorPath,
    clipPath: caveSurface.clipPath || caveSurface.visualFloorPath,
    externalWallSegments: caveSurface.boundarySegments || [],
    internalWallSegments: [],
    wallSegments: caveSurface.boundarySegments || [],
    doorSegments: dungeonMask.doorSegments || [],
    mapAccesses: dungeonMask.mapAccesses || [],
  };
}

export function createFinalCaveRegionSurface(
  region,
  generatedMap,
  caveSurface,
) {
  const baseSurface =
    region.shape === "circle"
      ? createCircleCompositeRegionSurface(
          region,
          generatedMap,
          generatedMap.config.gridSize,
        )
      : createCellMaskRegionSurface(
          region,
          generatedMap,
          generatedMap.config.gridSize,
        );
  if (!isPureCaveMap(generatedMap) || generatedMap.regions.length !== 1)
    return baseSurface;

  const boundarySegments =
    caveSurface.boundarySegments || baseSurface.boundarySegments || [];
  return {
    ...baseSurface,
    finalGeometry: true,
    kind: caveSurface.kind || baseSurface.kind,
    geometryKind: caveSurface.geometryKind || baseSurface.geometryKind,
    surfaceKind: "cave",
    floorCells: caveSurface.floorCells || baseSurface.floorCells,
    visualFloorCells:
      caveSurface.visualFloorCells ||
      caveSurface.floorCells ||
      baseSurface.floorCells,
    visualFloorPath: caveSurface.visualFloorPath || baseSurface.visualFloorPath,
    clipPath:
      caveSurface.clipPath ||
      caveSurface.visualFloorPath ||
      baseSurface.clipPath,
    hoverPath: caveSurface.visualFloorPath || baseSurface.hoverPath,
    hoverSegments: boundarySegments,
    wallArcPath:
      caveSurface.wallPath ||
      caveSurface.visualFloorPath ||
      baseSurface.wallArcPath,
    wallPath: caveSurface.wallPath || baseSurface.wallPath,
    sketchPath: caveSurface.sketchPath || baseSurface.sketchPath,
    wallSegments: boundarySegments,
    boundarySegments,
    labelPoint: region.labelPoint,
  };
}

export function finalizeCaveGeometry(generatedMap) {
  if (!isPureCaveMap(generatedMap)) return null;

  const hexCaveSurface = createHexCaveSurface(generatedMap);
  const caveSurface = isUsableSvgPath(hexCaveSurface.visualFloorPath)
    ? hexCaveSurface
    : createCellBasedCaveSurface(generatedMap);
  const mapSurface = createCaveMapSurfaceFromCaveSurface(
    generatedMap,
    caveSurface,
  );
  const regions = Object.fromEntries(
    generatedMap.regions.map((region) => [
      region.id,
      createFinalCaveRegionSurface(region, generatedMap, caveSurface),
    ]),
  );
  const corridors = Object.fromEntries(
    (generatedMap.corridors || []).map((corridor) => [
      corridor.id,
      createCorridorSurface(
        corridor,
        generatedMap,
        generatedMap.config.gridSize,
      ),
    ]),
  );

  return {
    kind: "final-cave-geometry",
    surfaceKind: "cave",
    mapSurface,
    caveSurface,
    regions,
    corridors,
  };
}

export function getMapSurface(generatedMap) {
  const { config, dungeonMask, regions, corridors = [] } = generatedMap;
  const gridSize = config.gridSize;

  if (isPureCaveMap(generatedMap)) {
    const finalGeometry = generatedMap.finalGeometry?.mapSurface
      ? generatedMap.finalGeometry
      : finalizeGeometryCaveGeometry(generatedMap);
    const caveSurface =
      finalGeometry?.caveSurface ||
      finalGeometry?.mapSurface?.caveSurface ||
      createHexCaveSurface(generatedMap);
    const regionSurfaces = regions.map((region) =>
      getRegionSurface(region, generatedMap, gridSize),
    );
    const corridorSurfaces = corridors.map((corridor) =>
      createCorridorSurface(corridor, generatedMap, gridSize),
    );
    return {
      ...createGeometryCaveMapSurfaceFromCaveSurface(generatedMap, caveSurface),
      caveSurface,
      regionSurfaces,
      corridorSurfaces,
    };
  }

  const regionSurfaces = regions.map((region) =>
    getRegionSurface(region, generatedMap, gridSize),
  );
  const corridorSurfaces = corridors.map((corridor) =>
    createCorridorSurface(corridor, generatedMap, gridSize),
  );
  const vectorRegionIds = new Set(
    regionSurfaces
      .filter((surface) => surface.geometryKind !== "cell-mask")
      .map((surface) => surface.regionId),
  );
  const vectorCorridorIds = new Set(
    corridorSurfaces
      .filter((surface) => surface.geometryKind !== "corridor-cell-mask")
      .map((surface) => surface.corridorId),
  );
  const vectorFloorKeys = new Set();
  regions.forEach((region) => {
    if (!vectorRegionIds.has(region.id)) return;
    region.floorCells.forEach((cell) =>
      vectorFloorKeys.add(cellKey(cell.x, cell.y)),
    );
  });
  corridors.forEach((corridor) => {
    if (!vectorCorridorIds.has(corridor.id)) return;
    corridor.floorCells.forEach((cell) =>
      vectorFloorKeys.add(cellKey(cell.x, cell.y)),
    );
  });
  const baseFloorCells =
    vectorFloorKeys.size === 0
      ? dungeonMask.floorCells
      : dungeonMask.floorCells.filter(
          (cell) => !vectorFloorKeys.has(cellKey(cell.x, cell.y)),
        );
  const vectorRegionFloorPath = regionSurfaces
    .filter((surface) => vectorRegionIds.has(surface.regionId))
    .map((surface) => surface.visualFloorPath)
    .filter(Boolean)
    .join(" ");
  const vectorCorridorFloorPath = corridorSurfaces
    .filter((surface) => vectorCorridorIds.has(surface.corridorId))
    .map((surface) => surface.visualFloorPath)
    .filter(Boolean)
    .join(" ");
  const visualFloorPath = [
    buildFloorPath(baseFloorCells, gridSize),
    vectorRegionFloorPath,
    vectorCorridorFloorPath,
  ]
    .filter(Boolean)
    .join(" ");
  return {
    kind: "map-surface",
    surfaceKind:
      regionSurfaces.some((surface) => surface.surfaceKind === "cave") ||
      corridorSurfaces.some((surface) => surface.surfaceKind === "cave")
        ? "mixed"
        : "dungeon",
    gridSize,
    regionSurfaces,
    corridorSurfaces,
    floorCells: dungeonMask.floorCells || [],
    roomFloorCells: dungeonMask.roomFloorCells || [],
    corridorFloorCells: dungeonMask.corridorFloorCells || [],
    visualFloorPath,
    clipPath: visualFloorPath,
    externalWallSegments: dungeonMask.externalWallSegments || [],
    internalWallSegments: dungeonMask.internalWallSegments || [],
    wallSegments: dungeonMask.wallSegments || [],
    doorSegments: dungeonMask.doorSegments || [],
    mapAccesses: dungeonMask.mapAccesses || [],
  };
}

export function buildVisualFloorPath(generatedMap) {
  return getMapSurface(generatedMap).visualFloorPath;
}

export function computeContentBounds(floorCells, gridSize, fallback) {
  if (!floorCells.length) return fallback;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  floorCells.forEach((cell) => {
    minX = Math.min(minX, cell.x * gridSize);
    minY = Math.min(minY, cell.y * gridSize);
    maxX = Math.max(maxX, (cell.x + 1) * gridSize);
    maxY = Math.max(maxY, (cell.y + 1) * gridSize);
  });
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function createGridElements(config, gridStyle, keyPrefix) {
  const style = normalizeGridStyle(gridStyle);
  if (style === "none") return [];
  const elements = [];
  const g = config.gridSize;

  if (style === "solid") {
    for (let x = 0; x <= config.mapWidth; x += g)
      elements.push(
        <line
          key={`${keyPrefix}-x-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={config.mapHeight}
        />,
      );
    for (let y = 0; y <= config.mapHeight; y += g)
      elements.push(
        <line
          key={`${keyPrefix}-y-${y}`}
          x1={0}
          y1={y}
          x2={config.mapWidth}
          y2={y}
        />,
      );
    return elements;
  }

  if (style === "dotted") {
    for (let x = 0; x <= config.mapWidth; x += g) {
      for (let y = 0; y <= config.mapHeight; y += g) {
        elements.push(
          <circle key={`${keyPrefix}-dot-${x}-${y}`} cx={x} cy={y} r={0.85} />,
        );
      }
    }
    return elements;
  }

  const seen = new Set();
  const addDash = (x1, y1, x2, y2) => {
    const key = `${Math.round(x1)},${Math.round(y1)}:${Math.round(x2)},${Math.round(y2)}`;
    if (seen.has(key)) return;
    seen.add(key);
    elements.push(
      <line key={`${keyPrefix}-dash-${key}`} x1={x1} y1={y1} x2={x2} y2={y2} />,
    );
  };

  for (let x = 0; x < config.mapWidth; x += g) {
    for (let y = 0; y < config.mapHeight; y += g) {
      const xA = x + g * 0.34;
      const xB = x + g * 0.66;
      const yA = y + g * 0.34;
      const yB = y + g * 0.66;
      addDash(xA, y, xB, y);
      addDash(xA, y + g, xB, y + g);
      addDash(x, yA, x, yB);
      addDash(x + g, yA, x + g, yB);
    }
  }
  return elements;
}

export function renderGrid(config, gridStyle = "solid") {
  const style = normalizeGridStyle(gridStyle);
  if (style === "none") return null;
  return (
    <g className={`map-grid grid-style-${style}`}>
      {createGridElements(config, style, "mg")}
    </g>
  );
}

export function createOrganicPath(region, gridSize) {
  const { x, y, w, h } = region.cellRect;
  const px = x * gridSize;
  const py = y * gridSize;
  const pw = w * gridSize;
  const ph = h * gridSize;
  const rng = createSeededRng(
    hashStringToSeed(region.id, region.name, "organic-path"),
  );
  const inset = Math.min(gridSize * 0.65, Math.min(pw, ph) * 0.12);
  const jitter = (amount) => (rng() - 0.5) * amount;
  const left = px + inset;
  const top = py + inset;
  const right = px + pw - inset;
  const bottom = py + ph - inset;
  const cx = px + pw / 2;
  const cy = py + ph / 2;

  if (region.shape === "circle") {
    return buildCircleRoomPath(region, gridSize);
  }

  if (
    region.shape === "oval" ||
    region.shape === "shaft" ||
    region.shape === "ritual"
  ) {
    const rx = (right - left) / 2;
    const ry = (bottom - top) / 2;
    return `M${cx} ${cy - ry}C${cx + rx * 0.56} ${cy - ry},${cx + rx} ${cy - ry * 0.56},${cx + rx} ${cy}C${cx + rx} ${cy + ry * 0.56},${cx + rx * 0.56} ${cy + ry},${cx} ${cy + ry}C${cx - rx * 0.56} ${cy + ry},${cx - rx} ${cy + ry * 0.56},${cx - rx} ${cy}C${cx - rx} ${cy - ry * 0.56},${cx - rx * 0.56} ${cy - ry},${cx} ${cy - ry}Z`;
  }

  if (
    region.shape === "irregular" ||
    region.shape === "cave" ||
    region.shape === "broken" ||
    region.shape === "ruined-rect"
  ) {
    const p1 = { x: left + pw * 0.08 + jitter(8), y: top + jitter(8) };
    const p2 = { x: cx + jitter(14), y: top + ph * 0.04 + jitter(10) };
    const p3 = {
      x: right - pw * 0.08 + jitter(8),
      y: top + ph * 0.12 + jitter(8),
    };
    const p4 = { x: right + jitter(6), y: cy + jitter(14) };
    const p5 = {
      x: right - pw * 0.12 + jitter(8),
      y: bottom - ph * 0.1 + jitter(8),
    };
    const p6 = { x: cx + jitter(14), y: bottom + jitter(6) };
    const p7 = {
      x: left + pw * 0.12 + jitter(8),
      y: bottom - ph * 0.06 + jitter(8),
    };
    const p8 = { x: left + jitter(6), y: cy + jitter(14) };
    return `M${p1.x} ${p1.y}C${p1.x + pw * 0.18} ${p1.y - 4},${p2.x - pw * 0.14} ${p2.y - 8},${p2.x} ${p2.y}C${p2.x + pw * 0.18} ${p2.y + 4},${p3.x - pw * 0.16} ${p3.y - 4},${p3.x} ${p3.y}C${p4.x} ${p4.y - ph * 0.18},${p4.x + 6} ${p4.y - ph * 0.05},${p4.x} ${p4.y}C${p4.x - 2} ${p4.y + ph * 0.16},${p5.x + pw * 0.16} ${p5.y - 2},${p5.x} ${p5.y}C${p5.x - pw * 0.18} ${p5.y + 4},${p6.x + pw * 0.14} ${p6.y + 4},${p6.x} ${p6.y}C${p6.x - pw * 0.18} ${p6.y - 2},${p7.x + pw * 0.16} ${p7.y + 4},${p7.x} ${p7.y}C${p8.x} ${p8.y + ph * 0.18},${p8.x - 6} ${p8.y + ph * 0.05},${p8.x} ${p8.y}C${p8.x + 2} ${p8.y - ph * 0.16},${p1.x - pw * 0.16} ${p1.y + 2},${p1.x} ${p1.y}Z`;
  }

  if (region.shape === "apse") {
    return `M${left} ${top}H${right - gridSize * 0.6}Q${right} ${cy} ${right - gridSize * 0.6} ${bottom}H${left}Z`;
  }

  return `M${left} ${top}H${right}V${bottom}H${left}Z`;
}

export function renderShapeDetails(region, gridSize) {
  const { x, y, w, h } = region.cellRect;
  const px = x * gridSize;
  const py = y * gridSize;
  const pw = w * gridSize;
  const ph = h * gridSize;
  const details = [];
  if (
    region.shape === "archive" ||
    region.shapeOptions?.roomType === "archive"
  ) {
    for (let i = 1; i < Math.max(2, Math.floor(w / 2)); i += 1) {
      details.push(
        <line
          key={`archive-${region.id}-${i}`}
          className="shape-detail"
          x1={px + i * gridSize * 2}
          y1={py + gridSize * 0.55}
          x2={px + i * gridSize * 2}
          y2={py + ph - gridSize * 0.55}
        />,
      );
    }
  }
  if (region.shape === "alcove" || region.shapeOptions?.roomType === "alcove") {
    for (let i = 1; i < w - 1; i += 3) {
      details.push(
        <path
          key={`alcove-n-${region.id}-${i}`}
          className="shape-detail"
          d={`M${px + i * gridSize + gridSize * 0.25} ${py + gridSize * 0.35}h${gridSize * 0.5}`}
        />,
      );
      details.push(
        <path
          key={`alcove-s-${region.id}-${i}`}
          className="shape-detail"
          d={`M${px + i * gridSize + gridSize * 0.25} ${py + ph - gridSize * 0.35}h${gridSize * 0.5}`}
        />,
      );
    }
  }
  if (region.shape === "shaft") {
    details.push(
      <circle
        key={`shaft-ring-${region.id}`}
        className="shape-detail"
        cx={px + pw / 2}
        cy={py + ph / 2}
        r={Math.max(gridSize * 0.65, Math.min(pw, ph) * 0.22)}
      />,
    );
  }
  return details.length > 0 ? (
    <g clipPath={`url(#clip-${region.id})`}>{details}</g>
  ) : null;
}

export function renderRegionClipPaths(generatedMap) {
  if (isPureCaveMap(generatedMap)) return null;
  return generatedMap.regions.map((region) => {
    const shape = getRegionCompositeShape(
      region,
      generatedMap,
      generatedMap.config.gridSize,
    );
    return (
      <clipPath key={`clip-${region.id}`} id={`clip-${region.id}`}>
        <path d={shape.clipPath} fillRule="nonzero" />
      </clipPath>
    );
  });
}

export function getMapAccessCenter(access) {
  if (access?.wallGap) {
    return {
      x: (access.wallGap.x1 + access.wallGap.x2) / 2,
      y: (access.wallGap.y1 + access.wallGap.y2) / 2,
    };
  }
  if (access?.floorExtension?.inner) return access.floorExtension.inner;
  if (access?.end) return access.end;
  return { x: 0, y: 0 };
}

export function getMapAccessBasis(access) {
  const normal = normalizeDirectionVector(access?.normal || { x: 1, y: 0 });
  const tangent = normalizeDirectionVector(
    access?.tangent || { x: -normal.y, y: normal.x },
  );
  return { normal, tangent };
}

export function createMapAccessOrganicFloorPath(access, config) {
  if (!access?.caveAccessBoundary && !access?.floorExtension) return "";
  const g = config.gridSize;
  const center = getMapAccessCenter(access);
  const { normal, tangent } = getMapAccessBasis(access);
  const seed = access.id || `${center.x}:${center.y}`;
  const mouthHalf = g * 0.7;
  const outerHalf = g * 0.44;
  const innerDepth = g * 0.22;
  const outerDepth = g * 1.18;
  const jitter = (index, amount) =>
    ((hashStringToSeed(config.seed, seed, index, "access-organic-floor") %
      1000) /
      1000 -
      0.5) *
    amount;
  const p = (along, outward, tangentJitter = 0, normalJitter = 0) => ({
    x:
      center.x +
      tangent.x * (along + tangentJitter) +
      normal.x * (outward + normalJitter),
    y:
      center.y +
      tangent.y * (along + tangentJitter) +
      normal.y * (outward + normalJitter),
  });
  const points = [
    p(-mouthHalf, -innerDepth, jitter(1, g * 0.08), jitter(2, g * 0.06)),
    p(-outerHalf, outerDepth * 0.42, jitter(3, g * 0.12), jitter(4, g * 0.08)),
    p(-outerHalf * 0.92, outerDepth, jitter(5, g * 0.14), jitter(6, g * 0.09)),
    p(outerHalf * 0.92, outerDepth, jitter(7, g * 0.14), jitter(8, g * 0.09)),
    p(outerHalf, outerDepth * 0.42, jitter(9, g * 0.12), jitter(10, g * 0.08)),
    p(mouthHalf, -innerDepth, jitter(11, g * 0.08), jitter(12, g * 0.06)),
  ];
  return `M ${roundTo(points[0].x, 2)} ${roundTo(points[0].y, 2)} ${points
    .slice(1)
    .map((point) => `L ${roundTo(point.x, 2)} ${roundTo(point.y, 2)}`)
    .join(" ")} Z`;
}

export function getMapAccessFloorExtensionPath(generatedMap) {
  if (isPureCaveMap(generatedMap)) return "";
  const accesses =
    generatedMap?.dungeonMask?.mapAccesses || generatedMap?.mapAccesses || [];
  return accesses
    .map(
      (access) =>
        createMapAccessOrganicFloorPath(access, generatedMap.config) ||
        access?.floorExtension?.path ||
        "",
    )
    .filter(Boolean)
    .join(" ");
}

export function renderDungeonFloorClipPath(generatedMap) {
  const mapSurface = getMapSurface(generatedMap);
  const baseClipPath =
    mapSurface.clipPath ||
    mapSurface.visualFloorPath ||
    buildVisualFloorPath(generatedMap);
  const accessExtensionPath = getMapAccessFloorExtensionPath(generatedMap);
  const clipPath = [baseClipPath, accessExtensionPath]
    .filter(Boolean)
    .join(" ");
  return (
    <clipPath id="clip-dungeon-floor">
      <path d={clipPath} fillRule="nonzero" />
    </clipPath>
  );
}

export function renderFloorGrid(generatedMap, gridStyle = "solid") {
  const { config } = generatedMap;
  const style = normalizeGridStyle(gridStyle);
  if (style === "none") return null;
  return (
    <g
      className={`floor-grid grid-style-${style}`}
      clipPath="url(#clip-dungeon-floor)"
    >
      {createGridElements(config, style, "fg")}
    </g>
  );
}

export function renderVisualAccents(generatedMap) {
  const { config, dungeonMask, regions, corridors } = generatedMap;
  const contextKey = getContextKey(config.context || config.biome);
  const shouldRenderOrganicFloorAccent = (region) => {
    if (
      contextKey === "mine" &&
      (region.surfaceKind === "cave" || region.surfaceKind === "hybrid")
    )
      return false;
    return [
      "irregular",
      "cave",
      "oval",
      "shaft",
      "ritual",
      "broken",
      "ruined-rect",
      "apse",
    ].includes(region.shape);
  };
  return (
    <>
      <path
        className="room-floor-accent"
        d={regions
          .map((region) =>
            buildRegionVisualFloorPath(region, config.gridSize, generatedMap),
          )
          .join(" ")}
        fillRule="nonzero"
      />
      <path
        className="corridor-floor-accent"
        d={buildCorridorsVisualFloorPath(
          corridors,
          generatedMap,
          config.gridSize,
        )}
        fillRule="nonzero"
      />
      <g className="room-shape-accents">
        {regions.filter(shouldRenderOrganicFloorAccent).map((region) => (
          <g key={`organic-${region.id}`} clipPath={`url(#clip-${region.id})`}>
            <path
              className="organic-floor-accent"
              d={createOrganicPath(region, config.gridSize)}
            />
            {region.shape === "ritual" && (
              <path
                className="ritual-floor-ring"
                d={createOrganicPath(region, config.gridSize)}
                transform={`scale(.72) translate(${region.labelPoint.x * 0.38} ${region.labelPoint.y * 0.38})`}
              />
            )}
          </g>
        ))}
        {regions.map((region) => (
          <React.Fragment key={`shape-details-${region.id}`}>
            {renderShapeDetails(region, config.gridSize)}
          </React.Fragment>
        ))}
      </g>
      <g className="corridor-texture">
        {corridors.map((corridor) => {
          if (corridor.centerline.length < 2) return null;
          const d = corridor.centerline
            .map(
              (point, index) =>
                `${index === 0 ? "M" : "L"}${point.x} ${point.y}`,
            )
            .join("");
          return (
            <path
              key={`corridor-center-${corridor.id}`}
              className="corridor-centerline"
              d={d}
            />
          );
        })}
      </g>
    </>
  );
}

export function createFloorTexture(generatedMap) {
  const { config, dungeonMask } = generatedMap;
  const rng = createSeededRng(
    hashStringToSeed(config.seed, config.context, "floor-texture"),
  );
  const cells = dungeonMask.floorCells.filter(
    (cell) =>
      hashStringToSeed(config.seed, cell.x, cell.y, "speckle") % 100 < 18,
  );
  const grains = dungeonMask.floorCells.filter(
    (cell) => hashStringToSeed(config.seed, cell.x, cell.y, "grain") % 100 < 10,
  );
  return (
    <g clipPath="url(#clip-dungeon-floor)">
      <g className="floor-speckle">
        {cells.map((cell, index) => (
          <circle
            key={`speckle-${cell.x}-${cell.y}-${index}`}
            cx={(cell.x + 0.25 + rng() * 0.5) * config.gridSize}
            cy={(cell.y + 0.25 + rng() * 0.5) * config.gridSize}
            r={0.55 + rng() * 0.75}
          />
        ))}
      </g>
      <g className="floor-grain">
        {grains.map((cell, index) => {
          const x = (cell.x + 0.24 + rng() * 0.42) * config.gridSize;
          const y = (cell.y + 0.24 + rng() * 0.42) * config.gridSize;
          const len = 3 + rng() * 7;
          return (
            <path
              key={`grain-${cell.x}-${cell.y}-${index}`}
              d={`M${x} ${y}l${len} ${rng() > 0.5 ? 1.5 : -1.5}`}
            />
          );
        })}
      </g>
    </g>
  );
}

const HATCH_PATTERN_LIBRARY = [
  {
    cellLines: [
      [
        [24, 10],
        [0, 25],
      ],
      [
        [28, 22],
        [1, 39],
      ],
      [
        [34, 30],
        [-3, 50],
      ],
    ],
    centre: [15, 32],
  },
  {
    cellLines: [
      [
        [25, 10],
        [88, 8],
      ],
      [
        [30, 21],
        [88, 16],
      ],
      [
        [34, 30],
        [91, 22],
      ],
    ],
    centre: [58, 17],
  },
  {
    cellLines: [
      [
        [86, 0],
        [91, 24],
      ],
      [
        [97, -6],
        [103, 19],
      ],
      [
        [106, -14],
        [117, 11],
      ],
    ],
    centre: [101, 6],
  },
  {
    cellLines: [
      [
        [77, 33],
        [121, 8],
      ],
      [
        [124, 18],
        [80, 41],
      ],
      [
        [86, 51],
        [125, 29],
      ],
    ],
    centre: [106, 30],
  },
  {
    cellLines: [
      [
        [125, 19],
        [141, 32],
      ],
      [
        [123, 7],
        [158, 34],
      ],
      [
        [131, 0],
        [174, 30],
      ],
    ],
    centre: [142, 21],
  },
  {
    cellLines: [
      [
        [126, 30],
        [194, 35],
      ],
      [
        [114, 39],
        [195, 46],
      ],
      [
        [124, 49],
        [196, 53],
      ],
    ],
    centre: [155, 44],
  },
  {
    cellLines: [
      [
        [110, 40],
        [138, 63],
      ],
      [
        [132, 69],
        [98, 47],
      ],
      [
        [89, 53],
        [120, 78],
      ],
    ],
    centre: [113, 58],
  },
  {
    cellLines: [
      [
        [148, 12],
        [175, -13],
      ],
      [
        [158, 19],
        [186, -5],
      ],
      [
        [167, 26],
        [198, 0],
      ],
    ],
    centre: [173, 5],
  },
  {
    cellLines: [
      [
        [177, 20],
        [176, 36],
      ],
      [
        [188, 11],
        [187, 36],
      ],
      [
        [196, 6],
        [195, 36],
      ],
    ],
    centre: [187, 24],
  },
  {
    cellLines: [
      [
        [196, 4],
        [229, 27],
      ],
      [
        [197, 16],
        [229, 35],
      ],
      [
        [197, 26],
        [231, 45],
      ],
    ],
    centre: [214, 27],
  },
  {
    cellLines: [
      [
        [206, 11],
        [236, -13],
      ],
      [
        [216, 19],
        [243, -4],
      ],
      [
        [226, 24],
        [246, 2],
      ],
    ],
    centre: [230, 8],
  },
  {
    cellLines: [
      [
        [229, 27],
        [232, 46],
      ],
      [
        [240, 14],
        [243, 39],
      ],
      [
        [249, -1],
        [254, 35],
      ],
      [
        [260, -9],
        [266, 28],
      ],
    ],
    centre: [246, 20],
  },
  {
    cellLines: [
      [
        [233, 44],
        [270, 26],
      ],
      [
        [232, 55],
        [270, 41],
      ],
      [
        [235, 64],
        [264, 52],
      ],
    ],
    centre: [251, 50],
  },
  {
    cellLines: [
      [
        [265, 9],
        [286, -13],
      ],
      [
        [267, 19],
        [297, -13],
      ],
      [
        [276, 27],
        [301, -2],
      ],
    ],
    centre: [282, 6],
  },
  {
    cellLines: [
      [
        [296, 7],
        [303, 46],
      ],
      [
        [290, 15],
        [293, 49],
      ],
      [
        [284, 22],
        [288, 52],
      ],
    ],
    centre: [292, 32],
  },
  {
    cellLines: [
      [
        [275, 31],
        [253, 77],
      ],
      [
        [285, 41],
        [264, 88],
      ],
      [
        [288, 52],
        [272, 97],
      ],
    ],
    centre: [274, 61],
  },
  {
    cellLines: [
      [
        [290, 52],
        [316, 58],
      ],
      [
        [286, 61],
        [315, 69],
      ],
      [
        [284, 71],
        [312, 78],
      ],
    ],
    centre: [298, 65],
  },
  {
    cellLines: [
      [
        [278, 84],
        [295, 75],
      ],
      [
        [275, 96],
        [300, 79],
      ],
      [
        [280, 106],
        [301, 93],
      ],
    ],
    centre: [289, 91],
  },
  {
    cellLines: [
      [
        [251, 77],
        [284, 108],
      ],
      [
        [277, 120],
        [243, 89],
      ],
      [
        [240, 98],
        [271, 134],
      ],
    ],
    centre: [261, 106],
  },
  {
    cellLines: [
      [
        [223, 65],
        [259, 69],
      ],
      [
        [213, 78],
        [252, 78],
      ],
      [
        [198, 92],
        [244, 89],
      ],
      [
        [197, 102],
        [241, 99],
      ],
    ],
    centre: [227, 84],
  },
  {
    cellLines: [
      [
        [195, 35],
        [198, 60],
      ],
      [
        [204, 33],
        [209, 62],
      ],
      [
        [218, 39],
        [222, 69],
      ],
      [
        [231, 46],
        [234, 67],
      ],
    ],
    centre: [213, 49],
  },
  {
    cellLines: [
      [
        [182, 75],
        [197, 60],
      ],
      [
        [208, 63],
        [187, 85],
      ],
      [
        [191, 96],
        [221, 69],
      ],
    ],
    centre: [200, 76],
  },
  {
    cellLines: [
      [
        [149, 95],
        [188, 53],
      ],
      [
        [135, 91],
        [174, 53],
      ],
      [
        [117, 91],
        [164, 53],
      ],
      [
        [109, 89],
        [151, 52],
      ],
    ],
    centre: [150, 72],
  },
  {
    cellLines: [
      [
        [162, 85],
        [170, 100],
      ],
      [
        [169, 77],
        [184, 105],
      ],
      [
        [177, 67],
        [201, 109],
      ],
    ],
    centre: [178, 89],
  },
  {
    cellLines: [
      [
        [72, 27],
        [88, 54],
      ],
      [
        [59, 28],
        [72, 53],
      ],
      [
        [45, 31],
        [59, 54],
      ],
    ],
    centre: [65, 39],
  },
  {
    cellLines: [
      [
        [47, 36],
        [29, 88],
      ],
      [
        [5, 94],
        [19, 42],
      ],
      [
        [20, 90],
        [34, 32],
      ],
    ],
    centre: [28, 61],
  },
  {
    cellLines: [
      [
        [42, 55],
        [87, 55],
      ],
      [
        [39, 67],
        [78, 66],
      ],
      [
        [50, 75],
        [72, 76],
      ],
    ],
    centre: [61, 65],
  },
  {
    cellLines: [
      [
        [45, 68],
        [79, 112],
      ],
      [
        [37, 75],
        [66, 112],
      ],
      [
        [31, 87],
        [51, 112],
      ],
    ],
    centre: [51, 92],
  },
  {
    cellLines: [
      [
        [62, 89],
        [88, 55],
      ],
      [
        [71, 103],
        [97, 60],
      ],
      [
        [80, 113],
        [107, 68],
      ],
    ],
    centre: [84, 81],
  },
  {
    cellLines: [
      [
        [216, 102],
        [201, 141],
      ],
      [
        [211, 140],
        [227, 101],
      ],
      [
        [240, 102],
        [225, 139],
      ],
    ],
    centre: [219, 121],
  },
  {
    cellLines: [
      [
        [236, 114],
        [249, 108],
      ],
      [
        [253, 114],
        [232, 126],
      ],
      [
        [228, 139],
        [263, 123],
      ],
    ],
    centre: [244, 120],
  },
  {
    cellLines: [
      [
        [283, 106],
        [266, 144],
      ],
      [
        [282, 141],
        [295, 98],
      ],
    ],
    centre: [281, 122],
  },
  {
    cellLines: [
      [
        [241, 176],
        [232, 141],
      ],
      [
        [241, 136],
        [251, 173],
      ],
      [
        [249, 132],
        [263, 169],
      ],
      [
        [259, 127],
        [272, 166],
      ],
    ],
    centre: [250, 152],
  },
  {
    cellLines: [
      [
        [268, 144],
        [302, 140],
      ],
      [
        [302, 153],
        [270, 154],
      ],
      [
        [273, 165],
        [301, 165],
      ],
    ],
    centre: [282, 154],
  },
  {
    cellLines: [
      [
        [295, 101],
        [329, 88],
      ],
      [
        [293, 113],
        [321, 103],
      ],
      [
        [288, 126],
        [315, 115],
      ],
    ],
    centre: [302, 111],
  },
  {
    cellLines: [
      [
        [8, 130],
        [27, 91],
      ],
      [
        [36, 96],
        [19, 134],
      ],
      [
        [44, 104],
        [28, 137],
      ],
      [
        [50, 111],
        [38, 140],
      ],
    ],
    centre: [34, 117],
  },
  {
    cellLines: [
      [
        [51, 112],
        [94, 114],
      ],
      [
        [49, 122],
        [96, 124],
      ],
      [
        [44, 129],
        [100, 135],
      ],
    ],
    centre: [72, 125],
  },
  {
    cellLines: [
      [
        [90, 101],
        [104, 151],
      ],
      [
        [95, 91],
        [112, 148],
      ],
      [
        [100, 82],
        [119, 139],
      ],
    ],
    centre: [103, 121],
  },
  {
    cellLines: [
      [
        [102, 90],
        [151, 95],
      ],
      [
        [108, 106],
        [153, 109],
      ],
      [
        [111, 120],
        [155, 121],
      ],
    ],
    centre: [131, 108],
  },
  {
    cellLines: [
      [
        [150, 96],
        [160, 139],
      ],
      [
        [158, 91],
        [166, 125],
      ],
    ],
    centre: [159, 111],
  },
  {
    cellLines: [
      [
        [161, 98],
        [212, 112],
      ],
      [
        [163, 110],
        [210, 123],
      ],
      [
        [166, 124],
        [204, 136],
      ],
    ],
    centre: [185, 117],
  },
  {
    cellLines: [
      [
        [-1, 124],
        [43, 146],
      ],
      [
        [-12, 133],
        [42, 158],
      ],
      [
        [1, 150],
        [33, 163],
      ],
    ],
    centre: [21, 149],
  },
  {
    cellLines: [
      [
        [43, 147],
        [60, 143],
      ],
      [
        [41, 160],
        [65, 150],
      ],
      [
        [31, 176],
        [69, 157],
      ],
    ],
    centre: [49, 160],
  },
  {
    cellLines: [
      [
        [51, 132],
        [85, 178],
      ],
      [
        [64, 132],
        [96, 175],
      ],
      [
        [74, 134],
        [92, 157],
      ],
    ],
    centre: [76, 150],
  },
  {
    cellLines: [
      [
        [86, 135],
        [100, 186],
      ],
      [
        [95, 137],
        [107, 184],
      ],
      [
        [106, 155],
        [118, 182],
      ],
    ],
    centre: [101, 163],
  },
  {
    cellLines: [
      [
        [107, 156],
        [132, 121],
      ],
      [
        [113, 168],
        [138, 137],
      ],
      [
        [130, 166],
        [142, 153],
      ],
    ],
    centre: [124, 152],
  },
  {
    cellLines: [
      [
        [133, 123],
        [146, 165],
      ],
      [
        [144, 123],
        [154, 152],
      ],
    ],
    centre: [143, 140],
  },
  {
    cellLines: [
      [
        [146, 168],
        [166, 126],
      ],
      [
        [177, 129],
        [158, 171],
      ],
      [
        [189, 133],
        [172, 177],
      ],
    ],
    centre: [168, 149],
  },
  {
    cellLines: [
      [
        [187, 143],
        [231, 139],
      ],
      [
        [183, 152],
        [234, 147],
      ],
      [
        [181, 161],
        [236, 158],
      ],
    ],
    centre: [206, 149],
  },
  {
    cellLines: [
      [
        [16, 157],
        [8, 201],
      ],
      [
        [17, 204],
        [23, 160],
      ],
      [
        [32, 164],
        [26, 207],
      ],
    ],
    centre: [19, 184],
  },
  {
    cellLines: [
      [
        [29, 181],
        [68, 193],
      ],
      [
        [72, 181],
        [42, 173],
      ],
      [
        [57, 165],
        [79, 171],
      ],
    ],
    centre: [59, 176],
  },
  {
    cellLines: [
      [
        [72, 182],
        [98, 176],
      ],
      [
        [68, 194],
        [100, 185],
      ],
      [
        [82, 200],
        [121, 192],
      ],
    ],
    centre: [90, 189],
  },
  {
    cellLines: [
      [
        [28, 206],
        [56, 191],
      ],
      [
        [47, 188],
        [29, 198],
      ],
    ],
    centre: [41, 197],
  },
  {
    cellLines: [
      [
        [1, 153],
        [13, 175],
      ],
      [
        [-3, 167],
        [10, 189],
      ],
      [
        [-12, 167],
        [8, 202],
      ],
    ],
    centre: [3, 175],
  },
  {
    cellLines: [
      [
        [112, 169],
        [147, 167],
      ],
      [
        [116, 180],
        [158, 173],
      ],
      [
        [119, 187],
        [173, 178],
      ],
    ],
    centre: [137, 177],
  },
  {
    cellLines: [
      [
        [181, 162],
        [217, 188],
      ],
      [
        [211, 199],
        [175, 172],
      ],
      [
        [169, 178],
        [202, 208],
      ],
    ],
    centre: [194, 185],
  },
  {
    cellLines: [
      [
        [203, 178],
        [209, 161],
      ],
      [
        [226, 159],
        [214, 186],
      ],
      [
        [236, 159],
        [223, 192],
      ],
    ],
    centre: [219, 175],
  },
  {
    cellLines: [
      [
        [241, 176],
        [227, 184],
      ],
      [
        [224, 196],
        [251, 174],
      ],
      [
        [275, 167],
        [245, 189],
      ],
    ],
    centre: [241, 182],
  },
  {
    cellLines: [
      [
        [272, 172],
        [295, 181],
      ],
      [
        [263, 178],
        [301, 191],
      ],
      [
        [257, 183],
        [302, 200],
      ],
    ],
    centre: [283, 186],
  },
  {
    cellLines: [
      [
        [240, 185],
        [258, 205],
      ],
      [
        [231, 193],
        [255, 219],
      ],
      [
        [220, 201],
        [252, 232],
      ],
    ],
    centre: [242, 206],
  },
  {
    cellLines: [
      [
        [258, 204],
        [253, 234],
      ],
      [
        [268, 205],
        [263, 238],
      ],
      [
        [275, 207],
        [273, 245],
      ],
    ],
    centre: [265, 223],
  },
  {
    cellLines: [
      [
        [257, 201],
        [283, 211],
      ],
      [
        [247, 191],
        [284, 203],
      ],
    ],
    centre: [268, 200],
  },
  {
    cellLines: [
      [
        [283, 194],
        [283, 224],
      ],
      [
        [293, 197],
        [290, 229],
      ],
      [
        [300, 201],
        [300, 235],
      ],
    ],
    centre: [291, 214],
  },
  {
    cellLines: [
      [
        [275, 221],
        [302, 237],
      ],
      [
        [274, 232],
        [302, 250],
      ],
      [
        [273, 248],
        [302, 260],
      ],
    ],
    centre: [288, 241],
  },
  {
    cellLines: [
      [
        [3, 200],
        [36, 207],
      ],
      [
        [42, 220],
        [1, 206],
      ],
      [
        [1, 217],
        [47, 230],
      ],
    ],
    centre: [25, 212],
  },
  {
    cellLines: [
      [
        [1, 228],
        [13, 221],
      ],
      [
        [27, 226],
        [1, 237],
      ],
      [
        [2, 248],
        [42, 229],
      ],
    ],
    centre: [13, 236],
  },
  {
    cellLines: [
      [
        [35, 205],
        [52, 242],
      ],
      [
        [44, 200],
        [61, 241],
      ],
      [
        [54, 197],
        [73, 237],
      ],
    ],
    centre: [52, 220],
  },
  {
    cellLines: [
      [
        [58, 209],
        [69, 193],
      ],
      [
        [67, 224],
        [83, 202],
      ],
      [
        [73, 236],
        [100, 199],
      ],
    ],
    centre: [77, 212],
  },
  {
    cellLines: [
      [
        [109, 197],
        [136, 222],
      ],
      [
        [101, 202],
        [130, 229],
      ],
      [
        [95, 208],
        [124, 235],
      ],
    ],
    centre: [115, 217],
  },
  {
    cellLines: [
      [
        [118, 206],
        [129, 188],
      ],
      [
        [144, 185],
        [126, 212],
      ],
      [
        [135, 220],
        [155, 183],
      ],
    ],
    centre: [135, 200],
  },
  {
    cellLines: [
      [
        [154, 189],
        [180, 189],
      ],
      [
        [148, 199],
        [190, 197],
      ],
      [
        [144, 207],
        [199, 207],
      ],
    ],
    centre: [169, 197],
  },
  {
    cellLines: [
      [
        [2, 250],
        [1, 281],
      ],
      [
        [12, 246],
        [11, 278],
      ],
      [
        [21, 242],
        [21, 275],
      ],
      [
        [30, 237],
        [30, 270],
      ],
    ],
    centre: [15, 259],
  },
  {
    cellLines: [
      [
        [31, 250],
        [48, 232],
      ],
      [
        [53, 242],
        [31, 263],
      ],
      [
        [39, 267],
        [62, 243],
      ],
    ],
    centre: [44, 254],
  },
  {
    cellLines: [
      [
        [88, 219],
        [104, 219],
      ],
      [
        [81, 228],
        [111, 227],
      ],
      [
        [73, 238],
        [120, 238],
      ],
    ],
    centre: [96, 229],
  },
  {
    cellLines: [
      [
        [141, 233],
        [154, 209],
      ],
      [
        [165, 209],
        [145, 244],
      ],
      [
        [177, 208],
        [148, 252],
      ],
    ],
    centre: [154, 228],
  },
  {
    cellLines: [
      [
        [169, 225],
        [199, 207],
      ],
      [
        [183, 230],
        [220, 210],
      ],
    ],
    centre: [192, 218],
  },
  {
    cellLines: [
      [
        [213, 215],
        [197, 242],
      ],
      [
        [208, 253],
        [227, 209],
      ],
      [
        [233, 215],
        [220, 252],
      ],
    ],
    centre: [217, 230],
  },
  {
    cellLines: [
      [
        [230, 227],
        [265, 240],
      ],
      [
        [228, 235],
        [266, 249],
      ],
      [
        [225, 245],
        [257, 256],
      ],
    ],
    centre: [246, 243],
  },
  {
    cellLines: [
      [
        [239, 267],
        [273, 246],
      ],
      [
        [243, 273],
        [278, 257],
      ],
      [
        [247, 283],
        [279, 268],
      ],
    ],
    centre: [260, 265],
  },
  {
    cellLines: [
      [
        [277, 251],
        [286, 289],
      ],
      [
        [291, 258],
        [297, 289],
      ],
    ],
    centre: [287, 272],
  },
  {
    cellLines: [
      [
        [284, 282],
        [263, 299],
      ],
      [
        [283, 275],
        [249, 298],
      ],
    ],
    centre: [269, 289],
  },
  {
    cellLines: [
      [
        [232, 249],
        [251, 298],
      ],
      [
        [221, 253],
        [236, 288],
      ],
      [
        [208, 253],
        [229, 295],
      ],
    ],
    centre: [228, 271],
  },
  {
    cellLines: [
      [
        [180, 274],
        [207, 253],
      ],
      [
        [195, 280],
        [211, 262],
      ],
      [
        [218, 272],
        [206, 284],
      ],
    ],
    centre: [203, 272],
  },
  {
    cellLines: [
      [
        [191, 227],
        [204, 258],
      ],
      [
        [195, 264],
        [183, 231],
      ],
      [
        [187, 269],
        [171, 226],
      ],
    ],
    centre: [189, 248],
  },
  {
    cellLines: [
      [
        [176, 242],
        [152, 283],
      ],
      [
        [172, 229],
        [151, 266],
      ],
    ],
    centre: [161, 256],
  },
  {
    cellLines: [
      [
        [163, 268],
        [226, 291],
      ],
      [
        [157, 276],
        [214, 301],
      ],
    ],
    centre: [191, 283],
  },
  {
    cellLines: [
      [
        [114, 240],
        [127, 270],
      ],
      [
        [123, 236],
        [139, 270],
      ],
      [
        [130, 230],
        [147, 268],
      ],
    ],
    centre: [131, 256],
  },
  {
    cellLines: [
      [
        [108, 268],
        [151, 270],
      ],
      [
        [116, 284],
        [152, 284],
      ],
      [
        [122, 298],
        [160, 299],
      ],
    ],
    centre: [135, 284],
  },
  {
    cellLines: [
      [
        [62, 241],
        [106, 261],
      ],
      [
        [66, 253],
        [100, 271],
      ],
      [
        [65, 265],
        [93, 284],
      ],
    ],
    centre: [84, 263],
  },
  {
    cellLines: [
      [
        [84, 254],
        [91, 240],
      ],
      [
        [106, 239],
        [94, 258],
      ],
      [
        [116, 242],
        [105, 264],
      ],
    ],
    centre: [102, 246],
  },
  {
    cellLines: [
      [
        [71, 309],
        [115, 282],
      ],
      [
        [110, 269],
        [58, 307],
      ],
    ],
    centre: [89, 293],
  },
  {
    cellLines: [
      [
        [-4, 285],
        [42, 266],
      ],
      [
        [0, 293],
        [41, 274],
      ],
      [
        [1, 302],
        [45, 283],
      ],
    ],
    centre: [20, 286],
  },
  {
    cellLines: [
      [
        [41, 269],
        [48, 294],
      ],
      [
        [49, 257],
        [61, 304],
      ],
      [
        [64, 245],
        [72, 299],
      ],
    ],
    centre: [56, 280],
  },
  {
    cellLines: [
      [
        [1, 302],
        [7, 319],
      ],
      [
        [15, 299],
        [20, 311],
      ],
      [
        [29, 293],
        [40, 311],
      ],
      [
        [40, 287],
        [54, 311],
      ],
    ],
    centre: [23, 300],
  },
];

export function distancePointToSegment(point, segment) {
  const vx = segment.x2 - segment.x1;
  const vy = segment.y2 - segment.y1;
  const wx = point.x - segment.x1;
  const wy = point.y - segment.y1;
  const lengthSq = vx * vx + vy * vy;
  if (lengthSq <= 0) {
    const dx = point.x - segment.x1;
    const dy = point.y - segment.y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  const t = clamp((wx * vx + wy * vy) / lengthSq, 0, 1);
  const px = segment.x1 + vx * t;
  const py = segment.y1 + vy * t;
  const dx = point.x - px;
  const dy = point.y - py;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isPointCloseToExternalWall(point, wallSegments, wallDistance) {
  return wallSegments.some(
    (segment) => distancePointToSegment(point, segment) <= wallDistance,
  );
}

export function getExternalHatchingBounds(
  generatedMap,
  tileSize,
  wallDistance,
) {
  const bounds = generatedMap.contentBounds || {
    x: 0,
    y: 0,
    width: generatedMap.config.mapWidth,
    height: generatedMap.config.mapHeight,
  };
  const pad = tileSize + wallDistance;
  return {
    minTileX: Math.floor((bounds.x - pad) / tileSize),
    maxTileX: Math.ceil((bounds.x + bounds.width + pad) / tileSize),
    minTileY: Math.floor((bounds.y - pad) / tileSize),
    maxTileY: Math.ceil((bounds.y + bounds.height + pad) / tileSize),
  };
}

export function createHatchLineFromPattern(origin, scale, rawLine) {
  const start = rawLine[0];
  const end = rawLine[1];
  return {
    x1: origin.x + start[0] * scale,
    y1: origin.y + start[1] * scale,
    x2: origin.x + end[0] * scale,
    y2: origin.y + end[1] * scale,
  };
}

export function createExternalHatchingLines(generatedMap) {
  const { config, dungeonMask } = generatedMap;
  const wallSegments = trimWallSegmentsAgainstMineCaveOpenings(
    (dungeonMask.externalWallSegments || []).flatMap((wall) =>
      splitWallIntoGridSegments(wall, config.gridSize),
    ),
    generatedMap,
  );
  if (wallSegments.length === 0) return [];

  const tileSize = config.gridSize * 7.5;
  const wallDistance = config.gridSize * 1.45;
  const scale = tileSize / 300;
  const bounds = getExternalHatchingBounds(
    generatedMap,
    tileSize,
    wallDistance,
  );
  const lines = [];

  for (let tileX = bounds.minTileX; tileX <= bounds.maxTileX; tileX += 1) {
    for (let tileY = bounds.minTileY; tileY <= bounds.maxTileY; tileY += 1) {
      const origin = { x: tileX * tileSize, y: tileY * tileSize };
      HATCH_PATTERN_LIBRARY.forEach((pattern) => {
        const centre = {
          x: origin.x + pattern.centre[0] * scale,
          y: origin.y + pattern.centre[1] * scale,
        };
        if (!isPointCloseToExternalWall(centre, wallSegments, wallDistance))
          return;
        pattern.cellLines.forEach((rawLine) => {
          lines.push(createHatchLineFromPattern(origin, scale, rawLine));
        });
      });
    }
  }

  return lines;
}

export function renderExternalHatching(generatedMap) {
  const lines = createExternalHatchingLines(generatedMap);
  if (lines.length === 0) return null;
  const d = lines
    .map(
      (line) =>
        `M${line.x1.toFixed(2)} ${line.y1.toFixed(2)}L${line.x2.toFixed(2)} ${line.y2.toFixed(2)}`,
    )
    .join(" ");
  return (
    <g className="external-hatching">
      <path d={d} />
    </g>
  );
}

export function isMapPointInsideFloor(point, floorSet, gridSize) {
  return floorSet.has(
    cellKey(Math.floor(point.x / gridSize), Math.floor(point.y / gridSize)),
  );
}

export function inferExternalWallNormal(segment, floorSet, gridSize) {
  const horizontal = segment.y1 === segment.y2;
  const mid = {
    x: (segment.x1 + segment.x2) / 2,
    y: (segment.y1 + segment.y2) / 2,
  };
  const offset = gridSize * 0.5;

  if (horizontal) {
    const above = isMapPointInsideFloor(
      { x: mid.x, y: mid.y - offset },
      floorSet,
      gridSize,
    );
    const below = isMapPointInsideFloor(
      { x: mid.x, y: mid.y + offset },
      floorSet,
      gridSize,
    );
    if (above && !below) return { x: 0, y: 1 };
    if (below && !above) return { x: 0, y: -1 };
    return null;
  }

  const left = isMapPointInsideFloor(
    { x: mid.x - offset, y: mid.y },
    floorSet,
    gridSize,
  );
  const right = isMapPointInsideFloor(
    { x: mid.x + offset, y: mid.y },
    floorSet,
    gridSize,
  );
  if (left && !right) return { x: 1, y: 0 };
  if (right && !left) return { x: -1, y: 0 };
  return null;
}

export function boundaryPointKey(point) {
  return `${point.x},${point.y}`;
}

export function boundaryEdgeKey(a, b) {
  const ka = boundaryPointKey(a);
  const kb = boundaryPointKey(b);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}

export function parseBoundaryPoint(key) {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
}

export function addBoundaryAdjacency(adjacency, from, to) {
  const key = boundaryPointKey(from);
  if (!adjacency.has(key)) adjacency.set(key, []);
  adjacency.get(key).push(to);
}

export function buildBoundaryLoops(segments) {
  const adjacency = new Map();
  const edges = [];
  segments.forEach((segment) => {
    const a = { x: segment.x1, y: segment.y1 };
    const b = { x: segment.x2, y: segment.y2 };
    if (a.x === b.x && a.y === b.y) return;
    edges.push({ a, b, key: boundaryEdgeKey(a, b) });
    addBoundaryAdjacency(adjacency, a, b);
    addBoundaryAdjacency(adjacency, b, a);
  });

  const unused = new Set(edges.map((edge) => edge.key));
  const loops = [];

  while (unused.size > 0) {
    const startEdgeKey = unused.values().next().value;
    const startEdge = edges.find((edge) => edge.key === startEdgeKey);
    if (!startEdge) break;
    const start = startEdge.a;
    let previous = startEdge.a;
    let current = startEdge.b;
    const loop = [start];
    unused.delete(startEdge.key);

    for (let guard = 0; guard < edges.length + 8; guard += 1) {
      loop.push(current);
      if (current.x === start.x && current.y === start.y) break;
      const currentKey = boundaryPointKey(current);
      const candidates = (adjacency.get(currentKey) || [])
        .filter(
          (candidate) =>
            !(candidate.x === previous.x && candidate.y === previous.y),
        )
        .filter((candidate) => unused.has(boundaryEdgeKey(current, candidate)));
      if (candidates.length === 0) break;
      const next = candidates.sort((a, b) => {
        const da = Math.abs(a.x - current.x) + Math.abs(a.y - current.y);
        const db = Math.abs(b.x - current.x) + Math.abs(b.y - current.y);
        return (
          da - db || boundaryPointKey(a).localeCompare(boundaryPointKey(b))
        );
      })[0];
      unused.delete(boundaryEdgeKey(current, next));
      previous = current;
      current = next;
    }

    const closed =
      loop.length > 3 &&
      loop[0].x === loop[loop.length - 1].x &&
      loop[0].y === loop[loop.length - 1].y;
    if (closed) loops.push(loop.slice(0, -1));
  }

  return loops;
}

export function createRoughBoundaryPoint(
  point,
  tangent,
  normal,
  config,
  loopIndex,
  segmentIndex,
  stepIndex,
) {
  const rng = createSeededRng(
    hashStringToSeed(
      config.seed,
      loopIndex,
      segmentIndex,
      stepIndex,
      point.x,
      point.y,
      "halo-geometry",
    ),
  );
  const maxNormalOffset = config.gridSize * 0.32;
  const broad = (rng() - 0.5) * config.gridSize * 0.34;
  const chip =
    rng() > 0.86
      ? (rng() > 0.5 ? 1 : -1) * config.gridSize * (0.06 + rng() * 0.1)
      : 0;
  const normalOffset = clamp(broad + chip, -maxNormalOffset, maxNormalOffset);
  const tangentOffset = clamp(
    (rng() - 0.5) * config.gridSize * 0.1,
    -config.gridSize * 0.05,
    config.gridSize * 0.05,
  );
  return {
    x: point.x + normal.x * normalOffset + tangent.x * tangentOffset,
    y: point.y + normal.y * normalOffset + tangent.y * tangentOffset,
  };
}

export function limitRoughBoundaryDeltas(points, config) {
  if (points.length < 3) return points;
  const maxDistance = config.gridSize * 1.16;
  const limited = [points[0]];
  for (let index = 1; index < points.length; index += 1) {
    const previous = limited[limited.length - 1];
    const current = points[index];
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const distance = Math.hypot(dx, dy);
    if (distance > maxDistance) {
      const ratio = maxDistance / distance;
      limited.push({
        x: previous.x + dx * ratio,
        y: previous.y + dy * ratio,
      });
    } else {
      limited.push(current);
    }
  }
  const first = limited[0];
  const last = limited[limited.length - 1];
  const closingDx = first.x - last.x;
  const closingDy = first.y - last.y;
  const closingDistance = Math.hypot(closingDx, closingDy);
  if (closingDistance > maxDistance) {
    const ratio = maxDistance / closingDistance;
    limited[0] = {
      x: last.x + closingDx * ratio,
      y: last.y + closingDy * ratio,
    };
  }
  return limited;
}

export function roughenBoundaryLoop(loop, config, loopIndex) {
  const points = [];
  const stepLength = config.gridSize * 0.4;
  for (let segmentIndex = 0; segmentIndex < loop.length; segmentIndex += 1) {
    const a = loop[segmentIndex];
    const b = loop[(segmentIndex + 1) % loop.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    if (length <= 0) continue;
    const tangent = { x: dx / length, y: dy / length };
    const normal = { x: -tangent.y, y: tangent.x };
    const steps = Math.max(1, Math.ceil(length / stepLength));
    for (let stepIndex = 0; stepIndex < steps; stepIndex += 1) {
      if (segmentIndex > 0 || stepIndex > 0) {
        const t = stepIndex / steps;
        const base = { x: a.x + dx * t, y: a.y + dy * t };
        points.push(
          createRoughBoundaryPoint(
            base,
            tangent,
            normal,
            config,
            loopIndex,
            segmentIndex,
            stepIndex,
          ),
        );
      } else {
        points.push(
          createRoughBoundaryPoint(
            a,
            tangent,
            normal,
            config,
            loopIndex,
            segmentIndex,
            stepIndex,
          ),
        );
      }
    }
  }
  return limitRoughBoundaryDeltas(points, config);
}

export function createExternalHaloBufferPath(generatedMap) {
  const loops = buildBoundaryLoops(
    trimWallSegmentsAgainstMineCaveOpenings(
      (generatedMap.dungeonMask.externalWallSegments || []).flatMap((wall) =>
        splitWallIntoGridSegments(wall, generatedMap.config.gridSize),
      ),
      generatedMap,
    ),
  );
  return loops
    .map((loop, loopIndex) =>
      roughenBoundaryLoop(loop, generatedMap.config, loopIndex),
    )
    .filter((points) => points.length > 2)
    .map(
      (points) =>
        points
          .map(
            (point, index) =>
              `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
          )
          .join("") + "Z",
    )
    .join(" ");
}

export function renderExternalHatchingUnderlay(generatedMap) {
  const path = createExternalHaloBufferPath(generatedMap);
  if (!path) return null;
  const bufferWidth = generatedMap.config.gridSize * 1.34;
  return (
    <g className="external-hatching-underlay">
      <path className="halo-buffer" d={path} strokeWidth={bufferWidth} />
    </g>
  );
}

export function createRoughWallPath(wall, config, index, layer = "main") {
  const length = Math.hypot(wall.x2 - wall.x1, wall.y2 - wall.y1);
  if (length <= 0) return "";
  const rng = createSeededRng(
    hashStringToSeed(
      config.seed,
      index,
      wall.x1,
      wall.y1,
      wall.x2,
      wall.y2,
      layer,
      "wall-rough-path",
    ),
  );
  const dx = (wall.x2 - wall.x1) / length;
  const dy = (wall.y2 - wall.y1) / length;
  const nx = -dy;
  const ny = dx;
  const stepLength =
    config.gridSize *
    (layer === "main"
      ? 0.54
      : layer === "door"
        ? 0.32
        : layer === "door-sketch"
          ? 0.36
          : 0.66);
  const steps = Math.max(1, Math.ceil(length / stepLength));
  const jitterAmount =
    layer === "main"
      ? 1.02
      : layer === "door"
        ? 1.28
        : layer === "door-sketch"
          ? 1.55
          : 1.52;
  const tangentJitterAmount =
    layer === "main"
      ? 0.28
      : layer === "door"
        ? 0.32
        : layer === "door-sketch"
          ? 0.42
          : 0.48;
  const points = [];

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const endpointFactor = step === 0 || step === steps ? 0.26 : 1;
    const normalJitter = (rng() - 0.5) * jitterAmount * endpointFactor;
    const tangentJitter = (rng() - 0.5) * tangentJitterAmount * endpointFactor;
    points.push({
      x:
        wall.x1 +
        (wall.x2 - wall.x1) * t +
        nx * normalJitter +
        dx * tangentJitter,
      y:
        wall.y1 +
        (wall.y2 - wall.y1) * t +
        ny * normalJitter +
        dy * tangentJitter,
    });
  }

  return points
    .map(
      (point, pointIndex) =>
        `${pointIndex === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join("");
}

export function normalizeAngle(angle) {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

export function angleDistance(a, b) {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, Math.PI * 2 - diff);
}

export function isCirclePointInsideRectAtAngle(circle, rect, angle, inset = 0) {
  const x = circle.cx + Math.cos(angle) * circle.r;
  const y = circle.cy + Math.sin(angle) * circle.r;
  return (
    x >= rect.x + inset &&
    x <= rect.x + rect.w - inset &&
    y >= rect.y + inset &&
    y <= rect.y + rect.h - inset
  );
}

export function getCircleRectIntersectionAngles(circle, rect) {
  const angles = [];
  const addPoint = (x, y) => {
    if (
      x < rect.x - 0.01 ||
      x > rect.x + rect.w + 0.01 ||
      y < rect.y - 0.01 ||
      y > rect.y + rect.h + 0.01
    )
      return;
    angles.push(normalizeAngle(Math.atan2(y - circle.cy, x - circle.cx)));
  };

  [rect.x, rect.x + rect.w].forEach((x) => {
    const dx = x - circle.cx;
    const remaining = circle.r * circle.r - dx * dx;
    if (remaining < 0) return;
    const dy = Math.sqrt(Math.max(0, remaining));
    addPoint(x, circle.cy - dy);
    addPoint(x, circle.cy + dy);
  });

  [rect.y, rect.y + rect.h].forEach((y) => {
    const dy = y - circle.cy;
    const remaining = circle.r * circle.r - dy * dy;
    if (remaining < 0) return;
    const dx = Math.sqrt(Math.max(0, remaining));
    addPoint(circle.cx - dx, y);
    addPoint(circle.cx + dx, y);
  });

  return Array.from(
    new Set(angles.map((angle) => Math.round(angle * 100000) / 100000)),
  );
}

export function getCircleRectInsideIntervals(circle, rect, gridSize) {
  const full = Math.PI * 2;
  const intersections = getCircleRectIntersectionAngles(circle, rect);
  if (intersections.length === 0) {
    const centerAngle = normalizeAngle(
      Math.atan2(
        rect.y + rect.h / 2 - circle.cy,
        rect.x + rect.w / 2 - circle.cx,
      ),
    );
    return isCirclePointInsideRectAtAngle(circle, rect, centerAngle)
      ? [{ start: 0, end: full }]
      : [];
  }

  const cuts = [0, full, ...intersections].sort((a, b) => a - b);
  const intervals = [];
  const inset = Math.min(gridSize * 0.015, 0.5);
  for (let index = 0; index < cuts.length - 1; index += 1) {
    const start = cuts[index];
    const end = cuts[index + 1];
    if (end - start <= 0.0001) continue;
    const mid = (start + end) / 2;
    if (isCirclePointInsideRectAtAngle(circle, rect, mid, inset))
      intervals.push({ start, end });
  }

  const wrapMid = normalizeAngle((cuts[cuts.length - 1] + full + cuts[0]) / 2);
  if (isCirclePointInsideRectAtAngle(circle, rect, wrapMid, inset)) {
    intervals.push({ start: cuts[cuts.length - 1], end: full });
    intervals.push({ start: 0, end: cuts[0] });
  }

  return mergeAngleIntervals(intervals);
}

export function shrinkCircleDoorGapForWallOverlap(interval, circle, gridSize) {
  const overlap = Math.max(0.01, (gridSize * 0.025) / Math.max(1, circle.r));
  const length = interval.end - interval.start;
  if (length <= overlap * 2.6) return interval;
  return {
    start: interval.start + overlap,
    end: interval.end - overlap,
  };
}

export function getCircleDoorGaps(region, generatedMap) {
  const circle = getCircleGeometryFromRegion(
    region,
    generatedMap.config.gridSize,
  );
  const g = generatedMap.config.gridSize;
  const squareGaps = getCircleCompositeSquareCells(
    generatedMap,
    region,
  ).flatMap((cell) => {
    const rect = { x: cell.x * g, y: cell.y * g, w: g, h: g };
    return getCircleRectInsideIntervals(circle, rect, g)
      .map((interval) => shrinkCircleDoorGapForWallOverlap(interval, circle, g))
      .filter((interval) => interval.end - interval.start > 0.025);
  });
  const accessGaps = (
    generatedMap.dungeonMask?.mapAccesses ||
    generatedMap.mapAccesses ||
    []
  )
    .filter((access) => access.regionId === region.id)
    .flatMap((access) => {
      const rect = { x: access.cell.x * g, y: access.cell.y * g, w: g, h: g };
      return getCircleRectInsideIntervals(circle, rect, g)
        .map((interval) =>
          shrinkCircleDoorGapForWallOverlap(interval, circle, g),
        )
        .filter((interval) => interval.end - interval.start > 0.025);
    });
  return [...squareGaps, ...accessGaps];
}

export function mergeAngleIntervals(intervals) {
  if (intervals.length === 0) return [];
  const expanded = intervals.flatMap((interval) =>
    interval.start <= interval.end
      ? [interval]
      : [
          { start: 0, end: interval.end },
          { start: interval.start, end: Math.PI * 2 },
        ],
  );
  expanded.sort((a, b) => a.start - b.start);
  const merged = [];
  expanded.forEach((interval) => {
    const last = merged[merged.length - 1];
    if (!last || interval.start > last.end) merged.push({ ...interval });
    else last.end = Math.max(last.end, interval.end);
  });
  return merged;
}

export function getVisibleCircleIntervals(gaps) {
  const full = Math.PI * 2;
  const merged = mergeAngleIntervals(gaps);
  if (merged.length === 0) return [{ start: 0, end: full }];
  const visible = [];
  let cursor = 0;
  merged.forEach((gap) => {
    if (gap.start > cursor) visible.push({ start: cursor, end: gap.start });
    cursor = Math.max(cursor, gap.end);
  });
  if (cursor < full) visible.push({ start: cursor, end: full });
  return visible.filter((interval) => interval.end - interval.start > 0.035);
}

export function createCircleArcPathFromInterval(circle, interval) {
  const startX = circle.cx + Math.cos(interval.start) * circle.r;
  const startY = circle.cy + Math.sin(interval.start) * circle.r;
  const endX = circle.cx + Math.cos(interval.end) * circle.r;
  const endY = circle.cy + Math.sin(interval.end) * circle.r;
  const largeArc = interval.end - interval.start > Math.PI ? 1 : 0;
  return `M${startX.toFixed(2)} ${startY.toFixed(2)}A${circle.r.toFixed(2)} ${circle.r.toFixed(2)} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
}

export function createCircleCompositeArcPath(region, generatedMap) {
  const circle = getCircleGeometryFromRegion(
    region,
    generatedMap.config.gridSize,
  );
  const gaps = getCircleDoorGaps(region, generatedMap);
  const intervals = getVisibleCircleIntervals(gaps);
  return intervals
    .map((interval) => createCircleArcPathFromInterval(circle, interval))
    .join(" ");
}

export function createRoughCircleWallPath(
  region,
  generatedMap,
  layer = "main",
) {
  const circle = getCircleGeometryFromRegion(
    region,
    generatedMap.config.gridSize,
  );
  const gaps = getCircleDoorGaps(region, generatedMap);
  const intervals = getVisibleCircleIntervals(gaps);
  const rng = createSeededRng(
    hashStringToSeed(generatedMap.config.seed, region.id, layer, "circle-wall"),
  );
  const stepAngle = Math.max(
    0.035,
    (generatedMap.config.gridSize * 0.42) / Math.max(1, circle.r),
  );
  const jitter = layer === "main" ? 0.8 : 1.15;
  return intervals
    .map((interval, intervalIndex) => {
      const steps = Math.max(
        3,
        Math.ceil((interval.end - interval.start) / stepAngle),
      );
      const points = [];
      for (let step = 0; step <= steps; step += 1) {
        const t = step / steps;
        const angle = interval.start + (interval.end - interval.start) * t;
        const endpointFactor = step === 0 || step === steps ? 0.28 : 1;
        const radiusJitter = (rng() - 0.5) * jitter * endpointFactor;
        const tangentJitter = (rng() - 0.5) * 0.35 * endpointFactor;
        const nx = Math.cos(angle);
        const ny = Math.sin(angle);
        const tx = -ny;
        const ty = nx;
        const r = circle.r + radiusJitter;
        points.push({
          x: circle.cx + nx * r + tx * tangentJitter,
          y: circle.cy + ny * r + ty * tangentJitter,
        });
      }
      return points
        .map(
          (point, pointIndex) =>
            `${pointIndex === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
        )
        .join("");
    })
    .join(" ");
}

export function renderCircleRoomWalls(generatedMap) {
  const circles = generatedMap.regions.filter(
    (region) => region.shape === "circle",
  );
  if (circles.length === 0) return null;
  return (
    <>
      <g className="wall-main circular-room-walls">
        {circles.map((region) => (
          <React.Fragment key={`circle-composite-wall-${region.id}`}>
            <path d={createRoughCircleWallPath(region, generatedMap, "main")} />
            {getCirclePortalSquareWallSegments(region, generatedMap).map(
              (segment, index) => (
                <path
                  key={`circle-portal-wall-${region.id}-${index}`}
                  d={createRoughWallPath(
                    segment,
                    generatedMap.config,
                    `circle-portal-${region.id}-${index}`,
                    "main",
                  )}
                />
              ),
            )}
          </React.Fragment>
        ))}
      </g>
      <g className="wall-sketch circular-room-wall-sketch">
        {circles.map((region) => (
          <React.Fragment key={`circle-composite-wall-sketch-${region.id}`}>
            <path
              d={createRoughCircleWallPath(region, generatedMap, "sketch")}
            />
            {getCirclePortalSquareWallSegments(region, generatedMap).map(
              (segment, index) => (
                <path
                  key={`circle-portal-wall-sketch-${region.id}-${index}`}
                  d={createRoughWallPath(
                    segment,
                    generatedMap.config,
                    `circle-portal-sketch-${region.id}-${index}`,
                    "sketch",
                  )}
                />
              ),
            )}
          </React.Fragment>
        ))}
      </g>
    </>
  );
}

export function createRoughOrganicCorridorWallPath(
  corridor,
  generatedMap,
  layer = "main",
) {
  return buildOrganicCorridorBoundaryPath(
    corridor,
    generatedMap,
    generatedMap.config.gridSize,
    layer,
  );
}

export function getHybridLocalCaveRegionSurfaces(generatedMap) {
  if (isPureCaveMap(generatedMap)) return [];
  if (
    getContextKey(
      generatedMap?.config?.context || generatedMap?.config?.biome,
    ) !== "mine"
  )
    return [];
  const storedSurfaces =
    generatedMap?.finalGeometry?.kind === "final-hybrid-geometry"
      ? generatedMap.finalGeometry.regions || {}
      : {};
  return generatedMap.regions
    .filter(
      (region) =>
        region.surfaceKind === "cave" || region.surfaceKind === "hybrid",
    )
    .map((region) => storedSurfaces[region.id])
    .filter((surface) => surface?.geometryQuality === "organic")
    .filter((surface) => surface?.geometryKind === "organic-cell-mask")
    .filter((surface) => surface?.wallPath);
}

export function getHybridLocalCaveWallPath(surface) {
  return (
    surface.wallPath || surface.wallArcPath || surface.visualFloorPath || ""
  );
}

export function getMineCaveEndpointSeams(generatedMap) {
  if (isPureCaveMap(generatedMap)) return [];
  if (
    getContextKey(
      generatedMap?.config?.context || generatedMap?.config?.biome,
    ) !== "mine"
  )
    return [];
  return Object.values(generatedMap?.finalGeometry?.regions || {})
    .flatMap((surface) => surface?.passMouths || [])
    .map(
      (mouth) =>
        mouth.seam || {
          corridorId: mouth.corridorId,
          endpoint: mouth.endpoint,
          regionId: mouth.regionId,
          surfaceKind: "cave",
          corridorTerminalCenter: mouth.corridorTerminalCenter,
          corridorTerminalLeft: mouth.corridorTerminalLeft || mouth.outerLeft,
          corridorTerminalRight:
            mouth.corridorTerminalRight || mouth.outerRight,
          mouthCenter: mouth.center,
          mouthLeft: mouth.mouthLeft,
          mouthRight: mouth.mouthRight,
          outerCenter: mouth.corridorTerminalCenter,
          outerLeft: mouth.outerLeft,
          outerRight: mouth.outerRight,
          tangent: mouth.tangent,
          normal: mouth.normal,
          width: mouth.width,
          depth: mouth.depth,
        },
    )
    .filter(
      (seam) => seam?.corridorTerminalLeft && seam?.corridorTerminalRight,
    );
}

export function getMineCaveEndpointCapSegments(generatedMap) {
  return getMineCaveEndpointSeams(generatedMap).flatMap((seam) =>
    [
      {
        x1: seam.corridorTerminalLeft.x,
        y1: seam.corridorTerminalLeft.y,
        x2: seam.corridorTerminalRight.x,
        y2: seam.corridorTerminalRight.y,
      },
      seam.mouthLeft && seam.mouthRight
        ? {
            x1: seam.mouthLeft.x,
            y1: seam.mouthLeft.y,
            x2: seam.mouthRight.x,
            y2: seam.mouthRight.y,
          }
        : null,
    ].filter(Boolean),
  );
}

export function getMineCaveEndpointOpeningSegments(generatedMap) {
  return getMineCaveEndpointSeams(generatedMap).flatMap((seam) =>
    [
      {
        kind: "corridor-terminal",
        seam,
        x1: seam.corridorTerminalLeft.x,
        y1: seam.corridorTerminalLeft.y,
        x2: seam.corridorTerminalRight.x,
        y2: seam.corridorTerminalRight.y,
      },
      seam.mouthLeft && seam.mouthRight
        ? {
            kind: "cave-mouth",
            seam,
            x1: seam.mouthLeft.x,
            y1: seam.mouthLeft.y,
            x2: seam.mouthRight.x,
            y2: seam.mouthRight.y,
          }
        : null,
    ].filter(Boolean),
  );
}

export function wallSegmentsCollinearAndOverlap(a, b, tolerance = 0.75) {
  if (!a || !b) return false;
  const aHorizontal = Math.abs(a.y1 - a.y2) <= tolerance;
  const bHorizontal = Math.abs(b.y1 - b.y2) <= tolerance;
  const aVertical = Math.abs(a.x1 - a.x2) <= tolerance;
  const bVertical = Math.abs(b.x1 - b.x2) <= tolerance;
  if (aHorizontal && bHorizontal) {
    if (Math.abs(a.y1 - b.y1) > tolerance) return false;
    const aMin = Math.min(a.x1, a.x2);
    const aMax = Math.max(a.x1, a.x2);
    const bMin = Math.min(b.x1, b.x2);
    const bMax = Math.max(b.x1, b.x2);
    return Math.min(aMax, bMax) - Math.max(aMin, bMin) > tolerance;
  }
  if (aVertical && bVertical) {
    if (Math.abs(a.x1 - b.x1) > tolerance) return false;
    const aMin = Math.min(a.y1, a.y2);
    const aMax = Math.max(a.y1, a.y2);
    const bMin = Math.min(b.y1, b.y2);
    const bMax = Math.max(b.y1, b.y2);
    return Math.min(aMax, bMax) - Math.max(aMin, bMin) > tolerance;
  }
  return segmentMatches(a, b);
}

export function trimWallSegmentAgainstMineCaveOpening(
  segment,
  opening,
  tolerance = 0.75,
) {
  if (!wallSegmentsCollinearAndOverlap(segment, opening, tolerance))
    return [segment];
  const horizontal =
    Math.abs(segment.y1 - segment.y2) <= tolerance &&
    Math.abs(opening.y1 - opening.y2) <= tolerance;
  const vertical =
    Math.abs(segment.x1 - segment.x2) <= tolerance &&
    Math.abs(opening.x1 - opening.x2) <= tolerance;
  if (!horizontal && !vertical)
    return segmentMatches(segment, opening) ? [] : [segment];

  const axis = horizontal ? "x" : "y";
  const crossAxis = horizontal ? "y" : "x";
  if (Math.abs(segment[`${crossAxis}1`] - opening[`${crossAxis}1`]) > tolerance)
    return [segment];

  const reversed = segment[`${axis}2`] < segment[`${axis}1`];
  const segmentStart = Math.min(segment[`${axis}1`], segment[`${axis}2`]);
  const segmentEnd = Math.max(segment[`${axis}1`], segment[`${axis}2`]);
  const openingStart = Math.min(opening[`${axis}1`], opening[`${axis}2`]);
  const openingEnd = Math.max(opening[`${axis}1`], opening[`${axis}2`]);
  const overlapStart = Math.max(segmentStart, openingStart);
  const overlapEnd = Math.min(segmentEnd, openingEnd);
  if (overlapEnd - overlapStart <= tolerance) return [segment];

  const line = segment[`${crossAxis}1`];
  const makePart = (start, end) => {
    if (end - start <= tolerance) return null;
    if (horizontal) {
      return reversed
        ? { x1: end, y1: line, x2: start, y2: line }
        : { x1: start, y1: line, x2: end, y2: line };
    }
    return reversed
      ? { x1: line, y1: end, x2: line, y2: start }
      : { x1: line, y1: start, x2: line, y2: end };
  };

  return [
    makePart(segmentStart, overlapStart),
    makePart(overlapEnd, segmentEnd),
  ].filter(Boolean);
}

export function trimWallSegmentAgainstMineCaveOpenings(
  segment,
  openings,
  tolerance = 0.75,
) {
  let parts = [segment];
  openings.forEach((opening) => {
    parts = parts.flatMap((part) =>
      trimWallSegmentAgainstMineCaveOpening(part, opening, tolerance),
    );
  });
  return parts;
}

export function trimWallSegmentsAgainstMineCaveOpenings(
  segments,
  generatedMap,
  tolerance = 0.75,
) {
  const openings = getMineCaveEndpointOpeningSegments(generatedMap);
  if (openings.length === 0) return segments;
  return segments.flatMap((segment) =>
    trimWallSegmentAgainstMineCaveOpenings(segment, openings, tolerance),
  );
}

export function shouldSuppressMineCaveEndpointCapSegment(
  segment,
  generatedMap,
) {
  return (
    trimWallSegmentsAgainstMineCaveOpenings([segment], generatedMap).length ===
    0
  );
}

export function renderHybridLocalCaveRegionWalls(generatedMap) {
  const surfaces = getHybridLocalCaveRegionSurfaces(generatedMap);
  if (surfaces.length === 0) return null;
  return (
    <>
      <g className="wall-main hybrid-cave-region-walls">
        {surfaces.map((surface) => (
          <path
            key={`hybrid-cave-wall-${surface.regionId}`}
            d={getHybridLocalCaveWallPath(surface)}
          />
        ))}
      </g>
      <g className="wall-sketch hybrid-cave-region-wall-sketch">
        {surfaces.map((surface) => (
          <path
            key={`hybrid-cave-wall-sketch-${surface.regionId}`}
            d={surface.sketchPath || getHybridLocalCaveWallPath(surface)}
          />
        ))}
      </g>
    </>
  );
}

export function getHybridCaveBreachMouths(generatedMap) {
  return [];
}

export function breachMouthFloorPath(mouth) {
  const points = [
    mouth.leftAttach,
    mouth.leftOuter,
    mouth.terminalLeft,
    mouth.terminalRight,
    mouth.rightOuter,
    mouth.rightAttach,
  ].filter(Boolean);
  if (points.length < 4) return "";
  return `M ${points.map((point) => `${point.x} ${point.y}`).join(" L ")} Z`;
}

export function renderHybridCaveBreachFloors(generatedMap) {
  const mouths = getHybridCaveBreachMouths(generatedMap);
  if (mouths.length === 0) return null;
  return (
    <g className="hybrid-cave-breach-floors">
      {mouths.map((mouth, index) => {
        const d = breachMouthFloorPath(mouth);
        return d ? (
          <path
            key={`hybrid-cave-breach-floor-${mouth.corridorId}-${mouth.regionId}-${index}`}
            className="floor-fill"
            d={d}
          />
        ) : null;
      })}
    </g>
  );
}

export function renderHybridCaveBreachWalls(generatedMap) {
  const mouths = getHybridCaveBreachMouths(generatedMap);
  if (mouths.length === 0) return null;
  return (
    <>
      <g className="wall-main hybrid-cave-breach-walls">
        {mouths.flatMap((mouth, index) => [
          <path
            key={`hybrid-cave-breach-left-${mouth.corridorId}-${mouth.regionId}-${index}`}
            d={createRoughWallPath(
              {
                x1: mouth.leftAttach.x,
                y1: mouth.leftAttach.y,
                x2: (mouth.terminalLeft || mouth.leftOuter).x,
                y2: (mouth.terminalLeft || mouth.leftOuter).y,
              },
              generatedMap.config,
              `hybrid-breach-left-${mouth.corridorId}-${index}`,
              "main",
            )}
          />,
          <path
            key={`hybrid-cave-breach-right-${mouth.corridorId}-${mouth.regionId}-${index}`}
            d={createRoughWallPath(
              {
                x1: (mouth.terminalRight || mouth.rightOuter).x,
                y1: (mouth.terminalRight || mouth.rightOuter).y,
                x2: mouth.rightAttach.x,
                y2: mouth.rightAttach.y,
              },
              generatedMap.config,
              `hybrid-breach-right-${mouth.corridorId}-${index}`,
              "main",
            )}
          />,
        ])}
      </g>
      <g className="wall-sketch hybrid-cave-breach-wall-sketch">
        {mouths.flatMap((mouth, index) => [
          <path
            key={`hybrid-cave-breach-left-sketch-${mouth.corridorId}-${mouth.regionId}-${index}`}
            d={createRoughWallPath(
              {
                x1: mouth.leftAttach.x,
                y1: mouth.leftAttach.y,
                x2: (mouth.terminalLeft || mouth.leftOuter).x,
                y2: (mouth.terminalLeft || mouth.leftOuter).y,
              },
              generatedMap.config,
              `hybrid-breach-left-sketch-${mouth.corridorId}-${index}`,
              "sketch",
            )}
          />,
          <path
            key={`hybrid-cave-breach-right-sketch-${mouth.corridorId}-${mouth.regionId}-${index}`}
            d={createRoughWallPath(
              {
                x1: (mouth.terminalRight || mouth.rightOuter).x,
                y1: (mouth.terminalRight || mouth.rightOuter).y,
                x2: mouth.rightAttach.x,
                y2: mouth.rightAttach.y,
              },
              generatedMap.config,
              `hybrid-breach-right-sketch-${mouth.corridorId}-${index}`,
              "sketch",
            )}
          />,
        ])}
      </g>
    </>
  );
}

export function renderOrganicCorridorWalls(generatedMap) {
  const organicCorridors = generatedMap.corridors.filter(isOrganicCorridor);
  if (organicCorridors.length === 0) return null;
  return (
    <>
      <g className="wall-main organic-corridor-walls">
        {organicCorridors.map((corridor) => (
          <path
            key={`organic-corridor-wall-${corridor.id}`}
            d={createRoughOrganicCorridorWallPath(
              corridor,
              generatedMap,
              "main",
            )}
          />
        ))}
      </g>
      <g className="wall-sketch organic-corridor-wall-sketch">
        {organicCorridors.map((corridor) => (
          <path
            key={`organic-corridor-wall-sketch-${corridor.id}`}
            d={createRoughOrganicCorridorWallPath(
              corridor,
              generatedMap,
              "sketch",
            )}
          />
        ))}
      </g>
    </>
  );
}

export function renderCircularRoomSurfaceOverlay(generatedMap) {
  const circles = generatedMap.regions.filter(
    (region) => region.shape === "circle",
  );
  if (circles.length === 0) return null;
  const d = circles
    .map((region) => buildCircleRoomPath(region, generatedMap.config.gridSize))
    .join(" ");
  return (
    <g className="circular-room-surface-cover">
      <path className="floor-fill" d={d} fillRule="nonzero" />
      <path className="room-floor-accent" d={d} fillRule="nonzero" />
    </g>
  );
}

export function createRoughDoorPanelPath(rect, config, index) {
  if (!rect || rect.width <= 0 || rect.height <= 0) return "";
  const rng = createSeededRng(
    hashStringToSeed(
      config.seed,
      index,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      "door-panel-rough-path",
    ),
  );
  const corners = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];
  const stepLength = config.gridSize * 0.22;
  const points = [];

  for (let sideIndex = 0; sideIndex < corners.length; sideIndex += 1) {
    const a = corners[sideIndex];
    const b = corners[(sideIndex + 1) % corners.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    if (length <= 0) continue;
    const tangent = { x: dx / length, y: dy / length };
    const normal = { x: -tangent.y, y: tangent.x };
    const steps = Math.max(1, Math.ceil(length / stepLength));
    for (let step = 0; step < steps; step += 1) {
      const t = step / steps;
      const endpointFactor = step === 0 ? 0.34 : 1;
      const normalJitter = (rng() - 0.5) * 1.05 * endpointFactor;
      const tangentJitter = (rng() - 0.5) * 0.42 * endpointFactor;
      points.push({
        x: a.x + dx * t + normal.x * normalJitter + tangent.x * tangentJitter,
        y: a.y + dy * t + normal.y * normalJitter + tangent.y * tangentJitter,
      });
    }
  }

  return (
    points
      .map(
        (point, pointIndex) =>
          `${pointIndex === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
      )
      .join("") + "Z"
  );
}

export function renderWallShadows(generatedMap) {
  const { config } = generatedMap;
  const walls = getDrawableWallSegments(generatedMap);
  const circles = generatedMap.regions.filter(
    (region) => region.shape === "circle",
  );
  const organicCorridors = generatedMap.corridors.filter(isOrganicCorridor);
  const crossings = getCrossLevelCorridorIntersectionCells(
    generatedMap.corridors,
  )
    .map((crossing) => {
      const topLevel = Math.max(...crossing.levels);
      const topCorridor =
        crossing.corridors.find(
          (corridor) => getCorridorPlanarLevel(corridor) === topLevel,
        ) || crossing.corridors[0];
      return {
        ...crossing,
        topLevel,
        topCorridor,
        topWalls: getCorridorLocalWallSegmentsForCell(
          topCorridor,
          crossing.cell,
          config.gridSize,
        ),
      };
    })
    .filter((crossing) => crossing.topCorridor && crossing.topWalls.length > 0)
    .sort((a, b) => a.topLevel - b.topLevel);

  return (
    <g
      className="wall-shadow"
      clipPath="url(#clip-dungeon-floor)"
      aria-hidden="true"
    >
      {walls.map((wall, index) => (
        <path
          key={`wall-shadow-${index}`}
          d={createRoughWallPath(wall, config, index, "main")}
        />
      ))}
      {getHybridLocalCaveRegionSurfaces(generatedMap).map((surface) => (
        <path
          key={`hybrid-cave-wall-shadow-${surface.regionId}`}
          d={getHybridLocalCaveWallPath(surface)}
        />
      ))}
      {circles.map((region) => (
        <React.Fragment key={`circle-wall-shadow-${region.id}`}>
          <path d={createRoughCircleWallPath(region, generatedMap, "main")} />
          {getCirclePortalSquareWallSegments(region, generatedMap).map(
            (segment, index) => (
              <path
                key={`circle-portal-wall-shadow-${region.id}-${index}`}
                d={createRoughWallPath(
                  segment,
                  config,
                  `circle-portal-${region.id}-${index}`,
                  "main",
                )}
              />
            ),
          )}
        </React.Fragment>
      ))}
      {organicCorridors.map((corridor) => (
        <path
          key={`organic-corridor-wall-shadow-${corridor.id}`}
          d={createRoughOrganicCorridorWallPath(corridor, generatedMap, "main")}
        />
      ))}
      {crossings.flatMap((crossing, index) =>
        crossing.topWalls.map((wall, wallIndex) => (
          <path
            key={`cross-level-wall-shadow-${crossing.key}-${wallIndex}`}
            d={createRoughWallPath(
              wall,
              config,
              `cross-level-top-${crossing.key}-${index}-${wallIndex}`,
              "main",
            )}
          />
        )),
      )}
    </g>
  );
}

export function renderRoughWalls(generatedMap) {
  const { config } = generatedMap;
  const walls = getDrawableWallSegments(generatedMap);
  return (
    <g className="wall-main">
      {walls.map((wall, index) => (
        <path
          key={`wall-${index}`}
          d={createRoughWallPath(wall, config, index, "main")}
        />
      ))}
    </g>
  );
}

export function renderWallSketch(generatedMap) {
  const { config } = generatedMap;
  const walls = getDrawableWallSegments(generatedMap);
  return (
    <g className="wall-sketch">
      {walls.map((wall, index) => (
        <path
          key={`wall-sketch-${index}`}
          d={createRoughWallPath(wall, config, index, "sketch")}
        />
      ))}
    </g>
  );
}

export function renderWallImperfections(generatedMap) {
  const { config } = generatedMap;
  return (
    <g className="wall-breaks">
      {generatedMap.regions.flatMap((region) => {
        const flags = getRegionSemanticFlags(region);
        const intensity =
          (flags.hazard ? 2 : 0) +
          (flags.ruined ? 2 : 0) +
          (flags.crypt ? 1 : 0);
        if (intensity <= 0) return [];
        const boundary = getBoundaryCells(region);
        const rng = createSeededRng(
          hashStringToSeed(config.seed, region.id, "wall-breaks"),
        );
        const selected = boundary
          .filter(
            (anchor) =>
              hashStringToSeed(
                config.seed,
                region.id,
                anchor.side,
                anchor.cell.x,
                anchor.cell.y,
                "break",
              ) %
                100 <
              10 + intensity * 7,
          )
          .slice(0, intensity + 2);
        return selected.map((anchor, index) => {
          const point = getAnchorHandlePoint(anchor, config.gridSize);
          const dx = anchor.side === "north" || anchor.side === "south" ? 1 : 0;
          const dy = anchor.side === "east" || anchor.side === "west" ? 1 : 0;
          const jitter = 3 + rng() * 4;
          const d = `M${point.x - dx * 5} ${point.y - dy * 5}l${dx * 4 + (rng() - 0.5) * jitter} ${dy * 4 + (rng() - 0.5) * jitter}l${dx * 5 + (rng() - 0.5) * jitter} ${dy * 5 + (rng() - 0.5) * jitter}`;
          return (
            <path
              key={`wall-break-${region.id}-${index}`}
              className={flags.hazard || flags.ruined ? "break" : "crack"}
              d={d}
            />
          );
        });
      })}
    </g>
  );
}

export function getDoorGeometry(door, gridSize) {
  const horizontal = Math.abs(door.x2 - door.x1) >= Math.abs(door.y2 - door.y1);
  const cx = (door.x1 + door.x2) / 2;
  const cy = (door.y1 + door.y2) / 2;
  const length = gridSize * 0.62;
  const thickness = gridSize * 0.24;
  const wallLength = gridSize * 0.96;
  return horizontal
    ? {
        horizontal,
        cx,
        cy,
        rect: {
          x: cx - length / 2,
          y: cy - thickness / 2,
          width: length,
          height: thickness,
        },
        line: {
          x1: cx - wallLength / 2,
          y1: cy,
          x2: cx + wallLength / 2,
          y2: cy,
        },
      }
    : {
        horizontal,
        cx,
        cy,
        rect: {
          x: cx - thickness / 2,
          y: cy - length / 2,
          width: thickness,
          height: length,
        },
        line: {
          x1: cx,
          y1: cy - wallLength / 2,
          x2: cx,
          y2: cy + wallLength / 2,
        },
      };
}

export function renderLockedDoorMark(geometry, index) {
  const pad = Math.min(geometry.rect.width, geometry.rect.height) * 0.16;
  const x1 = geometry.rect.x + pad;
  const y1 = geometry.rect.y + pad;
  const x2 = geometry.rect.x + geometry.rect.width - pad;
  const y2 = geometry.rect.y + geometry.rect.height - pad;
  return (
    <g className="locked-door-mark" key={`locked-door-mark-${index}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <line x1={x2} y1={y1} x2={x1} y2={y2} />
    </g>
  );
}

export function getDoorSquareCenter(door, gridSize) {
  if (door?.outsideCell) {
    return {
      x: (door.outsideCell.x + 0.5) * gridSize,
      y: (door.outsideCell.y + 0.5) * gridSize,
    };
  }
  const cx = (door.x1 + door.x2) / 2;
  const cy = (door.y1 + door.y2) / 2;
  if (door.side === "north") return { x: cx, y: cy + gridSize / 2 };
  if (door.side === "south") return { x: cx, y: cy - gridSize / 2 };
  if (door.side === "west") return { x: cx + gridSize / 2, y: cy };
  if (door.side === "east") return { x: cx - gridSize / 2, y: cy };
  return { x: cx, y: cy };
}

export function normalizeDirectionVector(vector) {
  const length = Math.hypot(vector?.x || 0, vector?.y || 0) || 1;
  return { x: (vector?.x || 0) / length, y: (vector?.y || 0) / length };
}

export function getDoorCorridorTravelDirection(door, generatedMap) {
  const fallback = normalizeDirectionVector(door?.normal || { x: 1, y: 0 });
  const corridor = generatedMap?.corridors?.find(
    (item) => item.id === door?.corridorId,
  );
  const cell = door?.outsideCell;
  if (
    !corridor ||
    !cell ||
    !Array.isArray(corridor.floorCells) ||
    corridor.floorCells.length < 2
  )
    return fallback;
  const topologyCells = getCorridorTopologyCells(corridor);
  const index = topologyCells.findIndex(
    (candidate) => candidate.x === cell.x && candidate.y === cell.y,
  );
  if (index < 0) return fallback;
  const next =
    index === 0
      ? topologyCells[1]
      : index === topologyCells.length - 1
        ? topologyCells[index - 1]
        : topologyCells[index + 1];
  if (!next) return fallback;
  return normalizeDirectionVector({ x: next.x - cell.x, y: next.y - cell.y });
}

export function createStairStepSegments(
  door,
  generatedMap,
  stairTransition,
  gridSize,
) {
  const center = getDoorSquareCenter(door, gridSize);
  const travel = getDoorCorridorTravelDirection(door, generatedMap);
  const descent =
    normalizeStairTransition(stairTransition, "none") === "up"
      ? { x: -travel.x, y: -travel.y }
      : travel;
  const tangent = { x: -descent.y, y: descent.x };
  const stepCount = 4;
  const maxLength = gridSize * 0.68;
  const minLength = gridSize * 0.34;
  const runSpan = gridSize * 0.66;
  const stepGap = runSpan / Math.max(1, stepCount - 1);
  return Array.from({ length: stepCount }, (_, stepIndex) => {
    const t = stepIndex / Math.max(1, stepCount - 1);
    const length = maxLength - (maxLength - minLength) * t;
    const offset = -runSpan / 2 + stepIndex * stepGap;
    const cx = center.x + descent.x * offset;
    const cy = center.y + descent.y * offset;
    return {
      x1: cx - (tangent.x * length) / 2,
      y1: cy - (tangent.y * length) / 2,
      x2: cx + (tangent.x * length) / 2,
      y2: cy + (tangent.y * length) / 2,
    };
  });
}

export function renderStairMark(door, stairTransition, index, generatedMap) {
  const transition = normalizeStairTransition(stairTransition, "none");
  if (transition === "none") return null;
  const segments = createStairStepSegments(
    door,
    generatedMap,
    transition,
    generatedMap.config.gridSize,
  );
  return (
    <g
      className={`stair-mark stair-mark--${transition}`}
      key={`stair-mark-${index}`}
    >
      <g className="stair-mark__main">
        {segments.map((segment, stepIndex) => (
          <path
            key={`stair-step-main-${index}-${stepIndex}`}
            d={createRoughWallPath(
              segment,
              generatedMap.config,
              `stair-main-${door.corridorId}-${door.endpoint}-${index}-${stepIndex}`,
              "door",
            )}
          />
        ))}
      </g>
      <g className="stair-mark__sketch">
        {segments.map((segment, stepIndex) => (
          <path
            key={`stair-step-sketch-${index}-${stepIndex}`}
            d={createRoughWallPath(
              segment,
              generatedMap.config,
              `stair-sketch-${door.corridorId}-${door.endpoint}-${index}-${stepIndex}`,
              "door-sketch",
            )}
          />
        ))}
      </g>
    </g>
  );
}

export function renderDoorSymbols(generatedMap) {
  const { config, dungeonMask } = generatedMap;
  return (
    <g className="door-symbols">
      {dungeonMask.doorSegments.map((door, index) => {
        const doorType = normalizeDoorType(
          door.doorType,
          door.secret ? "secret" : "default",
        );
        const stairTransition = normalizeStairTransition(
          door.stairTransition,
          "none",
        );
        if (door.breach && stairTransition === "none") return null;
        if (doorType === "open" && stairTransition === "none") return null;
        const geometry = getDoorGeometry(door, config.gridSize);
        const symbolClass = `door-symbol door-symbol--${doorType} ${stairTransition !== "none" ? `door-symbol--stairs-${stairTransition}` : ""}`;
        const panelClass = [
          "door-panel",
          doorType === "secret" ? "secret-door-panel" : "",
          doorType === "locked" ? "locked-door-panel" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <g key={`door-symbol-${index}`} className={symbolClass}>
            {doorType !== "open" && (
              <>
                <path
                  className="door-wall-line"
                  d={createRoughWallPath(
                    geometry.line,
                    config,
                    `door-${index}`,
                    "door",
                  )}
                />
                <path
                  className="door-wall-sketch"
                  d={createRoughWallPath(
                    geometry.line,
                    config,
                    `door-sketch-${index}`,
                    "door-sketch",
                  )}
                />
                <path
                  className={panelClass}
                  d={createRoughDoorPanelPath(
                    geometry.rect,
                    config,
                    `door-panel-${index}`,
                  )}
                />
                {doorType === "locked" && renderLockedDoorMark(geometry, index)}
              </>
            )}
            {renderStairMark(door, stairTransition, index, generatedMap)}
          </g>
        );
      })}
    </g>
  );
}

export function createMapAccessArrowHeadSegments(tip, tail, gridSize) {
  const dx = tip.x - tail.x;
  const dy = tip.y - tail.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const tx = -uy;
  const ty = ux;
  const headLength = gridSize * 0.3;
  const headWidth = gridSize * 0.2;
  const base = {
    x: tip.x - ux * headLength,
    y: tip.y - uy * headLength,
  };
  return [
    {
      x1: tip.x,
      y1: tip.y,
      x2: base.x + tx * headWidth,
      y2: base.y + ty * headWidth,
    },
    {
      x1: tip.x,
      y1: tip.y,
      x2: base.x - tx * headWidth,
      y2: base.y - ty * headWidth,
    },
  ];
}

export function renderMapAccessArrowHead(tip, tail, config, keyPrefix) {
  return createMapAccessArrowHeadSegments(tip, tail, config.gridSize).map(
    (segment, index) => (
      <React.Fragment key={`${keyPrefix}-${index}`}>
        <path
          className="map-access-head-line"
          d={createRoughWallPath(
            segment,
            config,
            `${keyPrefix}-main-${index}`,
            "door",
          )}
        />
        <path
          className="map-access-head-sketch"
          d={createRoughWallPath(
            segment,
            config,
            `${keyPrefix}-sketch-${index}`,
            "door-sketch",
          )}
        />
      </React.Fragment>
    ),
  );
}

export function getRenderableMapAccesses(generatedMap) {
  return (
    generatedMap?.dungeonMask?.mapAccesses || generatedMap?.mapAccesses || []
  );
}

export function renderMapAccessFloorExtensions(generatedMap) {
  const accesses = getRenderableMapAccesses(generatedMap).filter(
    (access) =>
      !access?.suppressFloorExtension &&
      (access?.floorExtension?.path || access?.caveAccessBoundary),
  );
  if (accesses.length === 0) return null;
  return (
    <g className="map-access-floor-extensions">
      {accesses.map((access, index) => {
        const d =
          createMapAccessOrganicFloorPath(access, generatedMap.config) ||
          access.floorExtension?.path;
        if (!d) return null;
        return (
          <path
            key={`map-access-floor-extension-${access.id || index}`}
            className="map-access-floor-extension"
            d={d}
            fillRule="nonzero"
          />
        );
      })}
    </g>
  );
}

export function createMapAccessWallMouthMaskPath(access, config) {
  if (!access?.wallGap) return "";
  const g = config.gridSize;
  const center = getMapAccessCenter(access);
  const { normal, tangent } = getMapAccessBasis(access);
  const halfWidth = g * 0.95;
  const halfDepth = g * 0.82;
  const points = [
    {
      x: center.x - tangent.x * halfWidth - normal.x * halfDepth,
      y: center.y - tangent.y * halfWidth - normal.y * halfDepth,
    },
    {
      x: center.x + tangent.x * halfWidth - normal.x * halfDepth,
      y: center.y + tangent.y * halfWidth - normal.y * halfDepth,
    },
    {
      x: center.x + tangent.x * halfWidth + normal.x * halfDepth,
      y: center.y + tangent.y * halfWidth + normal.y * halfDepth,
    },
    {
      x: center.x - tangent.x * halfWidth + normal.x * halfDepth,
      y: center.y - tangent.y * halfWidth + normal.y * halfDepth,
    },
  ];
  return `M ${roundTo(points[0].x, 2)} ${roundTo(points[0].y, 2)} ${points
    .slice(1)
    .map((point) => `L ${roundTo(point.x, 2)} ${roundTo(point.y, 2)}`)
    .join(" ")} Z`;
}

export function renderCaveWallAccessMask(generatedMap) {
  if (
    getContextKey(
      generatedMap?.config?.context || generatedMap?.config?.biome,
    ) !== "cave"
  )
    return null;
  if (isPureCaveMap(generatedMap)) return null;
  const accesses = getRenderableMapAccesses(generatedMap).filter(
    (access) => access?.wallGap,
  );
  if (accesses.length === 0) return null;
  const { config } = generatedMap;
  return (
    <mask
      id="cave-wall-access-mask"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={config.mapWidth}
      height={config.mapHeight}
    >
      <rect
        x={0}
        y={0}
        width={config.mapWidth}
        height={config.mapHeight}
        fill="white"
      />
      {accesses.map((access, index) => {
        const d = createMapAccessWallMouthMaskPath(access, config);
        return d ? (
          <path
            key={`cave-wall-access-mask-gap-${access.id || index}`}
            d={d}
            fill="black"
          />
        ) : null;
      })}
    </mask>
  );
}

export function renderMapAccessWallGaps(generatedMap) {
  const accesses = getRenderableMapAccesses(generatedMap).filter(
    (access) => !access?.suppressAccessWallGap && access?.wallGap,
  );
  if (accesses.length === 0) return null;
  return (
    <g className="map-access-wall-gaps">
      {accesses.map((access, index) => (
        <line
          key={`map-access-wall-gap-${access.id || index}`}
          className="map-access-wall-gap"
          x1={access.wallGap.x1}
          y1={access.wallGap.y1}
          x2={access.wallGap.x2}
          y2={access.wallGap.y2}
        />
      ))}
    </g>
  );
}

export function getMapAccessTunnelWallSegments(
  access,
  config = DEFAULT_CONFIG,
) {
  if (!access?.floorExtension && !access?.caveAccessBoundary) return [];
  const g = config.gridSize;
  const center = getMapAccessCenter(access);
  const { normal, tangent } = getMapAccessBasis(access);
  const seed = access.id || `${center.x}:${center.y}`;
  const jitter = (index, amount) =>
    ((hashStringToSeed(config.seed, seed, index, "access-organic-wall") %
      1000) /
      1000 -
      0.5) *
    amount;
  const point = (along, outward, tangentJitter = 0, normalJitter = 0) => ({
    x:
      center.x +
      tangent.x * (along + tangentJitter) +
      normal.x * (outward + normalJitter),
    y:
      center.y +
      tangent.y * (along + tangentJitter) +
      normal.y * (outward + normalJitter),
  });
  const mouthHalf = g * 0.7;
  const outerHalf = g * 0.44;
  const innerDepth = g * 0.04;
  const outerDepth = g * 1.12;
  const left = [
    point(-mouthHalf, innerDepth, jitter(1, g * 0.08), jitter(2, g * 0.05)),
    point(-mouthHalf * 0.78, g * 0.42, jitter(3, g * 0.16), jitter(4, g * 0.1)),
    point(
      -outerHalf * 1.05,
      outerDepth,
      jitter(5, g * 0.12),
      jitter(6, g * 0.08),
    ),
  ];
  const right = [
    point(mouthHalf, innerDepth, jitter(7, g * 0.08), jitter(8, g * 0.05)),
    point(mouthHalf * 0.78, g * 0.42, jitter(9, g * 0.16), jitter(10, g * 0.1)),
    point(
      outerHalf * 1.05,
      outerDepth,
      jitter(11, g * 0.12),
      jitter(12, g * 0.08),
    ),
  ];
  return [left, right].map((points, index) => ({
    points,
    id: `${seed}:side:${index}`,
  }));
}

export function createOrganicAccessWallPath(
  points,
  config,
  seed,
  layer = "main",
) {
  if (!Array.isArray(points) || points.length < 2) return "";
  const rng = createSeededRng(
    hashStringToSeed(config.seed, seed, layer, "organic-access-wall-path"),
  );
  const output = [];
  points.forEach((point, index) => {
    if (index === 0) {
      output.push(point);
      return;
    }
    const previous = points[index - 1];
    const dx = point.x - previous.x;
    const dy = point.y - previous.y;
    const length = Math.hypot(dx, dy) || 1;
    const tangent = { x: dx / length, y: dy / length };
    const normal = { x: -tangent.y, y: tangent.x };
    const steps = Math.max(2, Math.ceil(length / (config.gridSize * 0.38)));
    for (let step = 1; step <= steps; step += 1) {
      const t = step / steps;
      const endpointFactor = step === steps ? 0.28 : 1;
      const roughness = layer === "sketch" ? 1.35 : 0.86;
      output.push({
        x:
          previous.x +
          dx * t +
          normal.x * (rng() - 0.5) * roughness * endpointFactor +
          tangent.x * (rng() - 0.5) * 0.36 * endpointFactor,
        y:
          previous.y +
          dy * t +
          normal.y * (rng() - 0.5) * roughness * endpointFactor +
          tangent.y * (rng() - 0.5) * 0.36 * endpointFactor,
      });
    }
  });
  return output
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${roundTo(point.x, 2)} ${roundTo(point.y, 2)}`,
    )
    .join(" ");
}

export function renderMapAccessTunnelWalls(generatedMap) {
  if (isPureCaveMap(generatedMap)) return null;
  const accesses = getRenderableMapAccesses(generatedMap).filter(
    (access) =>
      !access?.suppressAccessTunnelWalls && access?.floorExtension?.points,
  );
  if (accesses.length === 0) return null;
  const segments = accesses.flatMap((access, accessIndex) =>
    getMapAccessTunnelWallSegments(access, generatedMap.config).map(
      (wall, segmentIndex) => ({
        access,
        accessIndex,
        wall,
        segmentIndex,
      }),
    ),
  );
  if (segments.length === 0) return null;
  return (
    <>
      <g className="map-access-tunnel-walls">
        {segments.map((item) => (
          <path
            key={`map-access-tunnel-wall-${item.access.id || item.accessIndex}-${item.segmentIndex}`}
            d={createOrganicAccessWallPath(
              item.wall.points,
              generatedMap.config,
              item.wall.id,
              "main",
            )}
          />
        ))}
      </g>
      <g className="map-access-tunnel-wall-sketch">
        {segments.map((item) => (
          <path
            key={`map-access-tunnel-wall-sketch-${item.access.id || item.accessIndex}-${item.segmentIndex}`}
            d={createOrganicAccessWallPath(
              item.wall.points,
              generatedMap.config,
              item.wall.id,
              "sketch",
            )}
          />
        ))}
      </g>
    </>
  );
}

export function renderMapAccessSymbols(generatedMap) {
  const accesses = getRenderableMapAccesses(generatedMap);
  if (accesses.length === 0) return null;
  const { config } = generatedMap;
  return (
    <g className="map-accesses">
      {accesses.map((access, index) => {
        const start = access.displayStart || access.start;
        const end = access.displayEnd || access.end;
        const normal = access.displayNormal || access.normal;
        const labelPoint = access.displayLabelPoint || {
          x: start.x + normal.x * config.gridSize * 0.32,
          y: start.y + normal.y * config.gridSize * 0.32,
        };
        return (
          <g
            key={access.id || `map-access-${index}`}
            className={`map-access map-access--${access.type}`}
          >
            <path
              className="map-access-stem-sketch"
              d={createRoughWallPath(
                { x1: start.x, y1: start.y, x2: end.x, y2: end.y },
                config,
                `map-access-stem-sketch-${access.id || index}`,
                "door-sketch",
              )}
            />
            <path
              className="map-access-line"
              d={createRoughWallPath(
                { x1: start.x, y1: start.y, x2: end.x, y2: end.y },
                config,
                `map-access-stem-${access.id || index}`,
                "door",
              )}
            />
            {renderMapAccessArrowHead(
              end,
              start,
              config,
              `map-access-head-${access.id || index}`,
            )}
            {access.doubleHeaded &&
              renderMapAccessArrowHead(
                start,
                end,
                config,
                `map-access-head-back-${access.id || index}`,
              )}
            {access.label && (
              <text
                className="map-access-label"
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
              >
                {access.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

export function getDoorCutSegment(door, config) {
  return door;
}

export function getOpenDoorWallGapSegment(door, config) {
  const horizontal = Math.abs(door.x2 - door.x1) >= Math.abs(door.y2 - door.y1);
  const cx = (door.x1 + door.x2) / 2;
  const cy = (door.y1 + door.y2) / 2;
  const length = config.gridSize * 1.12;
  return horizontal
    ? { x1: cx - length / 2, y1: cy, x2: cx + length / 2, y2: cy }
    : { x1: cx, y1: cy - length / 2, x2: cx, y2: cy + length / 2 };
}

export function splitWallSegmentByGap(wall, gap) {
  const epsilon = 0.01;
  const wallHorizontal = Math.abs(wall.y1 - wall.y2) < epsilon;
  const gapHorizontal = Math.abs(gap.y1 - gap.y2) < epsilon;
  if (wallHorizontal !== gapHorizontal) return [wall];

  if (wallHorizontal) {
    if (Math.abs(wall.y1 - gap.y1) > epsilon) return [wall];
    const y = wall.y1;
    const wallMin = Math.min(wall.x1, wall.x2);
    const wallMax = Math.max(wall.x1, wall.x2);
    const gapMin = Math.min(gap.x1, gap.x2);
    const gapMax = Math.max(gap.x1, gap.x2);
    const start = Math.max(wallMin, gapMin);
    const end = Math.min(wallMax, gapMax);
    if (end <= start) return [wall];
    return [
      start - wallMin > epsilon
        ? { x1: wallMin, y1: y, x2: start, y2: y }
        : null,
      wallMax - end > epsilon ? { x1: end, y1: y, x2: wallMax, y2: y } : null,
    ].filter(Boolean);
  }

  if (Math.abs(wall.x1 - gap.x1) > epsilon) return [wall];
  const x = wall.x1;
  const wallMin = Math.min(wall.y1, wall.y2);
  const wallMax = Math.max(wall.y1, wall.y2);
  const gapMin = Math.min(gap.y1, gap.y2);
  const gapMax = Math.max(gap.y1, gap.y2);
  const start = Math.max(wallMin, gapMin);
  const end = Math.min(wallMax, gapMax);
  if (end <= start) return [wall];
  return [
    start - wallMin > epsilon ? { x1: x, y1: wallMin, x2: x, y2: start } : null,
    wallMax - end > epsilon ? { x1: x, y1: end, x2: x, y2: wallMax } : null,
  ].filter(Boolean);
}

export function splitWallIntoGridSegments(wall, gridSize) {
  const epsilon = 0.01;
  const horizontal = Math.abs(wall.y1 - wall.y2) < epsilon;
  const vertical = Math.abs(wall.x1 - wall.x2) < epsilon;
  if (!horizontal && !vertical) return [wall];

  const segments = [];
  if (horizontal) {
    const y = wall.y1;
    const minX = Math.min(wall.x1, wall.x2);
    const maxX = Math.max(wall.x1, wall.x2);
    for (let x = minX; x < maxX - epsilon; x += gridSize) {
      segments.push({ x1: x, y1: y, x2: Math.min(x + gridSize, maxX), y2: y });
    }
    return segments.length > 0 ? segments : [wall];
  }

  const x = wall.x1;
  const minY = Math.min(wall.y1, wall.y2);
  const maxY = Math.max(wall.y1, wall.y2);
  for (let y = minY; y < maxY - epsilon; y += gridSize) {
    segments.push({ x1: x, y1: y, x2: x, y2: Math.min(y + gridSize, maxY) });
  }
  return segments.length > 0 ? segments : [wall];
}

export function segmentMatches(a, b) {
  const epsilon = 0.01;
  const direct =
    Math.abs(a.x1 - b.x1) < epsilon &&
    Math.abs(a.y1 - b.y1) < epsilon &&
    Math.abs(a.x2 - b.x2) < epsilon &&
    Math.abs(a.y2 - b.y2) < epsilon;
  const reverse =
    Math.abs(a.x1 - b.x2) < epsilon &&
    Math.abs(a.y1 - b.y2) < epsilon &&
    Math.abs(a.x2 - b.x1) < epsilon &&
    Math.abs(a.y2 - b.y1) < epsilon;
  return direct || reverse;
}

export function getCircleRoomGridBoundarySegments(region, gridSize) {
  if (region.shape !== "circle") return [];
  const cells = new Set(
    region.floorCells.map((cell) => cellKey(cell.x, cell.y)),
  );
  const seen = new Set();
  const segments = [];

  region.floorCells.forEach((cell) => {
    getCellNeighbors(cell).forEach((neighbor) => {
      if (cells.has(cellKey(neighbor.x, neighbor.y))) return;
      const segment = getSharedEdgeSegment(cell, neighbor, gridSize);
      if (!segment) return;
      const key = segmentKey(segment);
      if (seen.has(key)) return;
      seen.add(key);
      segments.push(segment);
    });
  });

  return segments;
}

export function isWallSegmentOnCircleRoom(segment, region, generatedMap) {
  if (region.shape !== "circle") return false;
  return getCircleRoomGridBoundarySegments(
    region,
    generatedMap.config.gridSize,
    generatedMap,
  ).some((edge) => segmentMatches(segment, edge));
}

export function getCircleRoomCellKeys(generatedMap) {
  const keys = new Set();
  generatedMap.regions.forEach((region) => {
    if (region.shape !== "circle") return;
    region.floorCells.forEach((cell) => keys.add(cellKey(cell.x, cell.y)));
  });
  return keys;
}

export function shouldHideCellWallForVectorRoom(segment, generatedMap) {
  const adjacent = getWallSegmentAdjacentCells(
    segment,
    generatedMap.config.gridSize,
  );
  if (!adjacent) return false;
  const hybridCells = getHybridLocalCaveRegionCellKeys(generatedMap);
  if (
    hybridCells.has(cellKey(adjacent.a.x, adjacent.a.y)) ||
    hybridCells.has(cellKey(adjacent.b.x, adjacent.b.y))
  )
    return true;
  if (
    !generatedMap.regions.some((region) =>
      isWallSegmentOnCircleRoom(segment, region, generatedMap),
    )
  )
    return false;
  const circleCells = getCircleRoomCellKeys(generatedMap);
  return (
    circleCells.has(cellKey(adjacent.a.x, adjacent.a.y)) ||
    circleCells.has(cellKey(adjacent.b.x, adjacent.b.y))
  );
}

export function getHybridLocalCaveRegionCellKeys(generatedMap) {
  const keys = new Set();
  if (isPureCaveMap(generatedMap)) return keys;
  if (
    getContextKey(
      generatedMap?.config?.context || generatedMap?.config?.biome,
    ) !== "mine"
  )
    return keys;
  const storedSurfaces =
    generatedMap?.finalGeometry?.kind === "final-hybrid-geometry"
      ? generatedMap.finalGeometry.regions || {}
      : {};
  generatedMap.regions
    .filter(
      (region) =>
        region.surfaceKind === "cave" || region.surfaceKind === "hybrid",
    )
    .forEach((region) => {
      const surface = storedSurfaces[region.id];
      (surface?.floorCells || region.floorCells || []).forEach((cell) =>
        keys.add(cellKey(cell.x, cell.y)),
      );
    });
  return keys;
}

export function getOrganicCorridorCellKeys(generatedMap) {
  const keys = new Set();
  generatedMap.corridors.filter(isOrganicCorridor).forEach((corridor) => {
    corridor.floorCells.forEach((cell) => keys.add(cellKey(cell.x, cell.y)));
  });
  return keys;
}

export function shouldHideCellWallForOrganicCorridor(segment, generatedMap) {
  const adjacent = getWallSegmentAdjacentCells(
    segment,
    generatedMap.config.gridSize,
  );
  if (!adjacent) return false;
  const organicCells = getOrganicCorridorCellKeys(generatedMap);
  return (
    organicCells.has(cellKey(adjacent.a.x, adjacent.a.y)) ||
    organicCells.has(cellKey(adjacent.b.x, adjacent.b.y))
  );
}

export function splitSegmentOutsideVectorRooms(segment, generatedMap) {
  return generatedMap.regions
    .filter((region) => region.shape === "circle")
    .reduce(
      (parts, region) => {
        const circle = getCircleGeometryFromRegion(
          region,
          generatedMap.config.gridSize,
        );
        return parts.flatMap((part) =>
          splitSegmentOutsideCircle(part, circle, generatedMap.config.gridSize),
        );
      },
      [segment],
    );
}

export function getCorridorWallSegmentsNearVectorRooms(generatedMap) {
  return computeBoundarySegments(
    generatedMap.dungeonMask.corridorFloorCells || [],
    generatedMap.config.gridSize,
  )
    .flatMap((wall) =>
      splitWallIntoGridSegments(wall, generatedMap.config.gridSize),
    )
    .filter((wall) => shouldHideCellWallForVectorRoom(wall, generatedMap))
    .flatMap((wall) => splitSegmentOutsideVectorRooms(wall, generatedMap));
}

export function splitSegmentOutsideCircle(segment, circle, gridSize) {
  const dx = segment.x2 - segment.x1;
  const dy = segment.y2 - segment.y1;
  const a = dx * dx + dy * dy;
  if (a <= 0) return [];

  const fx = segment.x1 - circle.cx;
  const fy = segment.y1 - circle.cy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - circle.r * circle.r;
  const discriminant = b * b - 4 * a * c;
  const cuts = [0, 1];

  if (discriminant > 0) {
    const root = Math.sqrt(discriminant);
    const t1 = (-b - root) / (2 * a);
    const t2 = (-b + root) / (2 * a);
    [t1, t2].forEach((t) => {
      if (t > 0.001 && t < 0.999) cuts.push(t);
    });
  }

  cuts.sort((p, q) => p - q);
  const segments = [];
  for (let index = 0; index < cuts.length - 1; index += 1) {
    const start = cuts[index];
    const end = cuts[index + 1];
    if (end - start <= 0.01) continue;
    const mid = (start + end) / 2;
    const mx = segment.x1 + dx * mid;
    const my = segment.y1 + dy * mid;
    const outside =
      Math.hypot(mx - circle.cx, my - circle.cy) >= circle.r - gridSize * 0.045;
    if (!outside) continue;
    const clipped = {
      x1: segment.x1 + dx * start,
      y1: segment.y1 + dy * start,
      x2: segment.x1 + dx * end,
      y2: segment.y1 + dy * end,
    };
    if (
      Math.hypot(clipped.x2 - clipped.x1, clipped.y2 - clipped.y1) >=
      gridSize * 0.08
    )
      segments.push(clipped);
  }
  return segments;
}

export function getCirclePortalSquareWallSegments(region, generatedMap) {
  if (region.shape !== "circle") return [];
  const circle = getCircleGeometryFromRegion(
    region,
    generatedMap.config.gridSize,
  );
  const portals = getCircleCompositeSquareCells(generatedMap, region);
  const extensionCellKeys = new Set(
    portals.map((cell) => cellKey(cell.x, cell.y)),
  );
  const seen = new Set();
  const segments = [];

  portals.forEach((portal) => {
    getCellBoundarySegmentsForCell(
      portal,
      generatedMap.config.gridSize,
    ).forEach((edge) => {
      const neighbor = getNeighborForCellSide(portal, edge.side);
      if (extensionCellKeys.has(cellKey(neighbor.x, neighbor.y))) return;
      splitSegmentOutsideCircle(
        edge,
        circle,
        generatedMap.config.gridSize,
      ).forEach((part) => {
        const key = segmentKey({
          x1: Math.round(part.x1 * 100) / 100,
          y1: Math.round(part.y1 * 100) / 100,
          x2: Math.round(part.x2 * 100) / 100,
          y2: Math.round(part.y2 * 100) / 100,
        });
        if (seen.has(key)) return;
        seen.add(key);
        segments.push(part);
      });
    });
  });

  return segments;
}

export function getDrawableWallSegments(generatedMap) {
  const gridWalls = trimWallSegmentsAgainstMineCaveOpenings(
    (generatedMap.dungeonMask.wallSegments || []).flatMap((wall) =>
      splitWallIntoGridSegments(wall, generatedMap.config.gridSize),
    ),
    generatedMap,
  )
    .filter((wall) => !shouldHideCellWallForVectorRoom(wall, generatedMap))
    .filter(
      (wall) => !shouldHideCellWallForOrganicCorridor(wall, generatedMap),
    );
  const corridorWallsNearCircles =
    getCorridorWallSegmentsNearVectorRooms(generatedMap);
  const baseWalls = trimWallSegmentsAgainstMineCaveOpenings(
    mergeCollinearWallSegments([...gridWalls, ...corridorWallsNearCircles]),
    generatedMap,
  );
  const openDoorGaps = (generatedMap.dungeonMask.doorSegments || [])
    .filter(
      (door) =>
        normalizeDoorType(door.doorType, door.secret ? "secret" : "default") ===
        "open",
    )
    .map((door) => getOpenDoorWallGapSegment(door, generatedMap.config));
  const mapAccessGaps = (
    generatedMap.dungeonMask.mapAccesses ||
    generatedMap.mapAccesses ||
    []
  )
    .map((access) => access.wallGap)
    .filter(Boolean);
  const wallGaps = [...openDoorGaps, ...mapAccessGaps];
  if (wallGaps.length === 0) return baseWalls;

  return baseWalls.flatMap((wall) => {
    let parts = [wall];
    wallGaps.forEach((gap) => {
      parts = parts.flatMap((part) => splitWallSegmentByGap(part, gap));
    });
    return parts;
  });
}

export function getDoorCutClassName(door) {
  const doorType = normalizeDoorType(
    door.doorType,
    door.secret ? "secret" : "default",
  );
  if (doorType === "secret") return "door-opening secret-door-opening";
  if (doorType === "open") return "door-opening open-door-opening";
  return "door-opening";
}

export function renderHexCaveUnifiedSurface(
  generatedMap,
  mapSurface,
  gridStyle = "solid",
) {
  const caveSurface =
    mapSurface.caveSurface || createHexCaveSurface(generatedMap);
  const floorPath = caveSurface.visualFloorPath;
  const wallPath = caveSurface.wallPath || floorPath;
  const sketchPath = caveSurface.sketchPath || wallPath;
  return (
    <>
      <path className="floor-fill" d={floorPath} fillRule="nonzero" />
      {createFloorTexture(generatedMap)}
      {renderFloorGrid(generatedMap, gridStyle)}
      <g
        className="wall-shadow cave-wall-shadow"
        clipPath="url(#clip-dungeon-floor)"
        aria-hidden="true"
      >
        <path d={wallPath} />
      </g>
      <g className="wall-main cave-surface-walls">
        <path d={wallPath} />
      </g>
      <g className="wall-sketch cave-surface-wall-sketch">
        <path d={sketchPath} />
      </g>
      {renderMapAccessSymbols(generatedMap)}
    </>
  );
}

export function renderOrganicCaveUnifiedSurface(
  generatedMap,
  mapSurface,
  gridStyle = "solid",
) {
  const caveSurface =
    mapSurface.caveSurface || createCellBasedCaveSurface(generatedMap);
  return (
    <>
      <path
        className="floor-fill"
        d={caveSurface.visualFloorPath}
        fillRule="nonzero"
      />
      {createFloorTexture(generatedMap)}
      {renderFloorGrid(generatedMap, gridStyle)}
      <g
        className="wall-shadow cave-wall-shadow"
        clipPath="url(#clip-dungeon-floor)"
        aria-hidden="true"
      >
        <path d={caveSurface.wallPath} />
      </g>
      <g className="wall-main cave-surface-walls">
        <path d={caveSurface.wallPath} />
      </g>
      <g className="wall-sketch cave-surface-wall-sketch">
        <path d={caveSurface.sketchPath} />
      </g>
      {renderMapAccessSymbols(generatedMap)}
    </>
  );
}

export function renderUnifiedDungeonSurface(generatedMap, gridStyle = "solid") {
  const { config, dungeonMask } = generatedMap;
  const mapSurface = getMapSurface(generatedMap);
  const floorPath = mapSurface.visualFloorPath;

  if (mapSurface.geometryKind === "hex-cave-map") {
    return renderHexCaveUnifiedSurface(generatedMap, mapSurface, gridStyle);
  }

  if (mapSurface.geometryKind === "organic-cave-map") {
    return renderOrganicCaveUnifiedSurface(generatedMap, mapSurface, gridStyle);
  }

  return (
    <>
      {renderExternalHatchingUnderlay(generatedMap)}
      {renderExternalHatching(generatedMap)}
      <path className="floor-fill" d={floorPath} fillRule="nonzero" />
      {createFloorTexture(generatedMap)}
      {renderVisualAccents(generatedMap)}
      {renderFloorGrid(generatedMap, gridStyle)}
      {renderWallShadows(generatedMap)}
      {renderRoughWalls(generatedMap)}
      {renderWallSketch(generatedMap)}
      {renderHybridLocalCaveRegionWalls(generatedMap)}
      {renderCircleRoomWalls(generatedMap)}
      {renderOrganicCorridorWalls(generatedMap)}
      {renderCrossLevelCorridorOverpasses(generatedMap)}
      <g className="door-cuts">
        {dungeonMask.doorSegments.map((door, index) => {
          const doorType = normalizeDoorType(
            door.doorType,
            door.secret ? "secret" : "default",
          );
          if (door.breach) return null;
          if (doorType === "open") return null;
          const cut = getDoorCutSegment(door, config);
          return (
            <line
              key={`door-opening-${index}`}
              x1={cut.x1}
              y1={cut.y1}
              x2={cut.x2}
              y2={cut.y2}
              className={getDoorCutClassName(door)}
            />
          );
        })}
      </g>
      {renderDoorSymbols(generatedMap)}
      {renderMapAccessSymbols(generatedMap)}
      {renderCorridorJunctionOverrides(generatedMap)}
    </>
  );
}

export function renderProp(prop) {
  const s = prop.size || 20;
  if (prop.kind === "pew") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <rect
          className="prop-fill"
          x={-s * 0.7}
          y={-s * 0.14}
          width={s * 1.4}
          height={s * 0.28}
          rx="1"
        />
        <line x1={-s * 0.62} y1={s * 0.18} x2={s * 0.62} y2={s * 0.18} />
      </g>
    );
  }
  if (prop.kind === "bed") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <rect
          className="prop-fill"
          x={-s * 0.48}
          y={-s * 0.56}
          width={s * 0.96}
          height={s * 1.12}
          rx="2"
        />
        <line x1={-s * 0.42} y1={-s * 0.22} x2={s * 0.42} y2={-s * 0.22} />
      </g>
    );
  }
  if (prop.kind === "desk") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <rect
          className="prop-fill"
          x={-s * 0.5}
          y={-s * 0.34}
          width={s}
          height={s * 0.68}
          rx="1"
        />
        <path
          d={`M${-s * 0.32} ${-s * 0.08}h${s * 0.64}M${-s * 0.24} ${s * 0.12}h${s * 0.38}`}
        />
      </g>
    );
  }
  if (prop.kind === "chest") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <rect
          className="prop-fill"
          x={-s * 0.42}
          y={-s * 0.28}
          width={s * 0.84}
          height={s * 0.56}
          rx="1"
        />
        <path d={`M${-s * 0.42} 0h${s * 0.84}M0 ${-s * 0.24}v${s * 0.48}`} />
      </g>
    );
  }
  if (prop.kind === "fireplace") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <path
          className="prop-fill"
          d={`M${-s * 0.5} ${s * 0.3}V${-s * 0.3}H${s * 0.5}V${s * 0.3}`}
        />
        <path
          d={`M${-s * 0.18} ${s * 0.22}C${-s * 0.1} ${-s * 0.1},${s * 0.1} ${-s * 0.1},${s * 0.18} ${s * 0.22}`}
        />
      </g>
    );
  }
  if (prop.kind === "mine-rail") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <line x1={-s * 0.62} y1={-s * 0.18} x2={s * 0.62} y2={-s * 0.18} />
        <line x1={-s * 0.62} y1={s * 0.18} x2={s * 0.62} y2={s * 0.18} />
        <line x1={-s * 0.42} y1={-s * 0.26} x2={-s * 0.42} y2={s * 0.26} />
        <line x1="0" y1={-s * 0.26} x2="0" y2={s * 0.26} />
        <line x1={s * 0.42} y1={-s * 0.26} x2={s * 0.42} y2={s * 0.26} />
      </g>
    );
  }
  if (prop.kind === "mine-support") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <path
          d={`M${-s * 0.5} ${s * 0.42}V${-s * 0.42}H${s * 0.5}V${s * 0.42}`}
        />
      </g>
    );
  }
  if (prop.kind === "stalagmite") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <polygon
          className="prop-fill"
          points={`0,${-s * 0.48} ${-s * 0.22},${s * 0.34} ${s * 0.2},${s * 0.32}`}
        />
        <polygon
          className="prop-fill"
          points={`${-s * 0.34},${-s * 0.12} ${-s * 0.52},${s * 0.36} ${-s * 0.16},${s * 0.28}`}
        />
      </g>
    );
  }
  if (prop.kind === "broken-wall") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <path
          d={`M${-s * 0.62} ${-s * 0.08}h${s * 0.38}m${s * 0.16} 0h${s * 0.46}`}
        />
        <path
          className="prop-crack"
          d={`M${-s * 0.12} ${-s * 0.24}l${s * 0.16} ${s * 0.22}l${-s * 0.12} ${s * 0.18}`}
        />
      </g>
    );
  }
  if (prop.kind === "shelf")
    return (
      <rect
        className="prop-shelf"
        x={prop.x - s * 0.66}
        y={prop.y - s * 0.18}
        width={s * 1.32}
        height={s * 0.36}
        transform={`rotate(${prop.rotation} ${prop.x} ${prop.y})`}
      />
    );
  if (prop.kind === "scroll-table") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <rect
          className="prop-fill"
          x={-s * 0.48}
          y={-s * 0.32}
          width={s * 0.96}
          height={s * 0.64}
          rx="1"
        />
        <path
          d={`M${-s * 0.28} ${-s * 0.05}h${s * 0.56}M${-s * 0.22} ${s * 0.12}h${s * 0.38}`}
        />
      </g>
    );
  }
  if (prop.kind === "pit")
    return <circle className="prop-pit" cx={prop.x} cy={prop.y} r={s * 0.42} />;
  if (prop.kind === "pillar")
    return (
      <circle
        className="prop-light-fill"
        cx={prop.x}
        cy={prop.y}
        r={s * 0.22}
      />
    );
  if (prop.kind === "statue") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <rect
          className="prop-fill"
          x={-s * 0.22}
          y={-s * 0.38}
          width={s * 0.44}
          height={s * 0.76}
          rx="2"
        />
        <circle cx="0" cy={-s * 0.24} r={s * 0.12} />
      </g>
    );
  }
  if (prop.kind === "tomb")
    return (
      <rect
        className="prop-tomb"
        x={prop.x - s * 0.52}
        y={prop.y - s * 0.28}
        width={s * 1.04}
        height={s * 0.56}
        rx="2"
        transform={`rotate(${prop.rotation} ${prop.x} ${prop.y})`}
      />
    );
  if (prop.kind === "altar") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <rect
          className="prop-altar"
          x={-s * 0.5}
          y={-s * 0.28}
          width={s}
          height={s * 0.56}
          rx="1"
        />
        <path d={`M${-s * 0.24} 0h${s * 0.48}M0 ${-s * 0.18}v${s * 0.36}`} />
      </g>
    );
  }
  if (prop.kind === "bones") {
    return (
      <g
        className="prop-bones"
        transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}
      >
        <line x1={-s * 0.36} y1="0" x2={s * 0.36} y2="0" />
        <line x1="0" y1={-s * 0.25} x2="0" y2={s * 0.25} />
        <circle cx={-s * 0.42} cy="0" r={s * 0.08} />
        <circle cx={s * 0.42} cy="0" r={s * 0.08} />
      </g>
    );
  }
  if (prop.kind === "rubble") {
    return (
      <g
        className="prop-rubble"
        transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}
      >
        <polygon
          points={`${-s * 0.38},${s * 0.2} ${-s * 0.14},${-s * 0.3} ${s * 0.2},${-s * 0.12} ${s * 0.4},${s * 0.28}`}
        />
        <polygon
          points={`${-s * 0.08},${s * 0.34} ${s * 0.14},${s * 0.04} ${s * 0.34},${s * 0.36}`}
        />
      </g>
    );
  }
  if (prop.kind === "water")
    return (
      <ellipse
        className="prop-water"
        cx={prop.x}
        cy={prop.y}
        rx={s * 0.72}
        ry={s * 0.42}
        transform={`rotate(${prop.rotation} ${prop.x} ${prop.y})`}
      />
    );
  if (prop.kind === "fog") {
    return (
      <g
        className="prop-fog"
        transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}
      >
        <path
          d={`M${-s * 0.7} ${-s * 0.08}C${-s * 0.36} ${-s * 0.28},${-s * 0.1} ${s * 0.16},${s * 0.28} ${-s * 0.06}S${s * 0.68} ${s * 0.08},${s * 0.78} ${-s * 0.02}`}
        />
        <path
          d={`M${-s * 0.52} ${s * 0.2}C${-s * 0.16} ${s * 0.02},${s * 0.18} ${s * 0.36},${s * 0.56} ${s * 0.16}`}
        />
      </g>
    );
  }
  if (prop.kind === "clue-marker") {
    return (
      <g transform={`translate(${prop.x} ${prop.y}) rotate(${prop.rotation})`}>
        <circle className="prop-light-fill" cx="0" cy="0" r={s * 0.28} />
        <path d={`M${-s * 0.18} 0h${s * 0.36}M0 ${-s * 0.18}v${s * 0.36}`} />
      </g>
    );
  }
  if (prop.kind === "table")
    return (
      <rect
        className="prop-fill"
        x={prop.x - s * 0.45}
        y={prop.y - s * 0.3}
        width={s * 0.9}
        height={s * 0.6}
        rx="1"
        transform={`rotate(${prop.rotation} ${prop.x} ${prop.y})`}
      />
    );
  return (
    <path
      className="prop-crack"
      d={`M${prop.x - s * 0.36} ${prop.y + s * 0.14}C${prop.x - s * 0.1} ${prop.y - s * 0.38},${prop.x + s * 0.2} ${prop.y + s * 0.4},${prop.x + s * 0.42} ${prop.y - s * 0.16}`}
    />
  );
}

export function renderProps(props) {
  return (
    <g className="props">
      {props.map((prop) => (
        <g key={prop.id}>{renderProp(prop)}</g>
      ))}
    </g>
  );
}

export function renderLabels(generatedMap, options) {
  return (
    <g className="labels">
      {generatedMap.regions.map((region) => (
        <g key={`label-${region.id}`}>
          <rect
            className="room-number-badge"
            x={region.labelPoint.x - 12}
            y={region.labelPoint.y - 9.5}
            width={24}
            height={19}
            rx={2}
          />
          <text
            className="room-number"
            x={region.labelPoint.x}
            y={region.labelPoint.y + 4}
            textAnchor="middle"
          >
            {region.number}
          </text>
          {options.showNames && (
            <text
              className="room-name"
              x={region.labelPoint.x}
              y={region.labelPoint.y + 27}
              textAnchor="middle"
            >
              {region.name}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

export function getRoomDragCells(region, gridSize) {
  const regionCells = new Set(
    region.floorCells.map((cell) => cellKey(cell.x, cell.y)),
  );
  const interiorCells = region.floorCells.filter(
    (cell) =>
      regionCells.has(cellKey(cell.x + 1, cell.y)) &&
      regionCells.has(cellKey(cell.x - 1, cell.y)) &&
      regionCells.has(cellKey(cell.x, cell.y + 1)) &&
      regionCells.has(cellKey(cell.x, cell.y - 1)),
  );
  if (interiorCells.length > 0) return interiorCells;
  const center = {
    x: region.labelPoint.x,
    y: region.labelPoint.y,
  };
  const fallback = [...region.floorCells]
    .map((cell) => {
      const px = (cell.x + 0.5) * gridSize;
      const py = (cell.y + 0.5) * gridSize;
      const dx = px - center.x;
      const dy = py - center.y;
      return { cell, score: dx * dx + dy * dy };
    })
    .sort((a, b) => a.score - b.score)[0]?.cell;
  return fallback ? [fallback] : [];
}

export function createOppositeSharedAnchor(anchor, adjacentRegionId) {
  if (!anchor || !adjacentRegionId) return null;
  return {
    regionId: adjacentRegionId,
    side:
      anchor.side === "north"
        ? "south"
        : anchor.side === "south"
          ? "north"
          : anchor.side === "east"
            ? "west"
            : "east",
    cell: { x: anchor.outsideCell.x, y: anchor.outsideCell.y },
    outsideCell: { x: anchor.cell.x, y: anchor.cell.y },
    normal: { x: -anchor.normal.x, y: -anchor.normal.y },
  };
}

export function getCellRegionOwnerMap(regions) {
  const owners = new Map();
  regions.forEach((region) => {
    region.floorCells.forEach((cell) =>
      owners.set(cellKey(cell.x, cell.y), region.id),
    );
  });
  return owners;
}

export function getHybridFinalWallConnectionZones(region, generatedMap) {
  if (isPureCaveMap(generatedMap)) return [];
  if (
    getContextKey(
      generatedMap?.config?.context || generatedMap?.config?.biome,
    ) !== "mine"
  )
    return [];
  if (region?.surfaceKind !== "cave" && region?.surfaceKind !== "hybrid")
    return [];
  const surface =
    generatedMap?.finalGeometry?.kind === "final-hybrid-geometry"
      ? generatedMap.finalGeometry.regions?.[region.id]
      : null;
  const segments =
    surface?.finalGeometry && Array.isArray(surface.boundarySegments)
      ? surface.boundarySegments
      : [];
  return segments
    .filter(
      (segment) =>
        Number.isFinite(segment.x1) &&
        Number.isFinite(segment.y1) &&
        Number.isFinite(segment.x2) &&
        Number.isFinite(segment.y2),
    )
    .map((segment, index) => {
      const anchor = createFinalAnchorFromSegment(
        segment,
        region,
        generatedMap,
        index,
      );
      const point = getAnchorHandlePoint(anchor, generatedMap.config.gridSize);
      return {
        id: `hybrid-cave-boundary:${region.id}:${index}`,
        regionId: region.id,
        adjacentRegionId: null,
        adjacentAnchor: null,
        anchor,
        point,
        ...segment,
      };
    });
}

export function getWallConnectionZones(
  region,
  regions,
  gridSize,
  generatedMap = null,
) {
  if (isPureCaveMap(generatedMap)) {
    const segments =
      generatedMap?.finalGeometry?.caveSurface?.boundarySegments || [];
    if (!Array.isArray(segments) || segments.length === 0) return [];
    const bounds = getCaveAccessBounds(segments, generatedMap);
    return segments
      .map((segment, index) => {
        const point = {
          x: (segment.x1 + segment.x2) / 2,
          y: (segment.y1 + segment.y2) / 2,
        };
        const owner =
          regions
            .map((candidate) => {
              const dx = candidate.labelPoint.x - point.x;
              const dy = candidate.labelPoint.y - point.y;
              return { region: candidate, score: dx * dx + dy * dy };
            })
            .sort((a, b) => a.score - b.score)[0]?.region || region;
        if (owner.id !== region.id) return null;
        const anchor = createCaveAccessBoundaryAnchor(
          segment,
          generatedMap,
          index,
          bounds,
        );
        return {
          id: `cave-boundary:${owner.id}:${index}`,
          regionId: owner.id,
          adjacentRegionId: null,
          adjacentAnchor: null,
          anchor,
          point,
          ...segment,
        };
      })
      .filter(Boolean);
  }
  const hybridFinalZones = getHybridFinalWallConnectionZones(
    region,
    generatedMap,
  );
  if (hybridFinalZones.length > 0) return hybridFinalZones;
  const ownerByCell = getCellRegionOwnerMap(regions);
  const finalAnchors = getFinalConnectionAnchors(generatedMap, region);
  const anchors =
    finalAnchors.length > 0 ? finalAnchors : getBoundaryCells(region);
  return anchors
    .map((anchor) => {
      const segment =
        anchor.segment ||
        getSharedEdgeSegment(anchor.cell, anchor.outsideCell, gridSize);
      const point = getAnchorHandlePoint(anchor, gridSize);
      const adjacentRegionId = ownerByCell.get(
        cellKey(anchor.outsideCell.x, anchor.outsideCell.y),
      );
      const adjacentAnchor =
        adjacentRegionId && adjacentRegionId !== region.id
          ? createOppositeSharedAnchor(anchor, adjacentRegionId)
          : null;
      return segment
        ? {
            id: `${region.id}:${anchor.side}:${anchor.cell.x}:${anchor.cell.y}`,
            regionId: region.id,
            adjacentRegionId: adjacentAnchor ? adjacentRegionId : null,
            adjacentAnchor,
            anchor,
            point,
            ...segment,
          }
        : null;
    })
    .filter(Boolean);
}

export function getClosestCorridorPathIndex(corridor, cell) {
  const topologyCells = getCorridorTopologyCells(corridor);
  if (topologyCells.length === 0 || !cell) return 0;
  let bestIndex = 0;
  let bestScore = Number.POSITIVE_INFINITY;
  topologyCells.forEach((pathCell, index) => {
    const dx = pathCell.x - cell.x;
    const dy = pathCell.y - cell.y;
    const score = dx * dx + dy * dy;
    if (score < bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return bestIndex;
}

export function getManualWaypointInsertIndex(corridor, cell) {
  const targetIndex = getClosestCorridorPathIndex(corridor, cell);
  const manualPoints = Array.isArray(corridor.manualWaypoints)
    ? corridor.manualWaypoints.filter(isValidPoint)
    : [];
  const manualPathIndexes = manualPoints.map((point) =>
    getClosestCorridorPathIndex(corridor, point),
  );
  const insertIndex = manualPathIndexes.findIndex(
    (pathIndex) => pathIndex > targetIndex,
  );
  return insertIndex === -1 ? manualPoints.length : insertIndex;
}

export function getCorridorInsertionZones(corridor, gridSize) {
  const topologyCells = getCorridorTopologyCells(corridor);
  if (corridor.isRoomLink || topologyCells.length < 3) return [];
  return topologyCells.slice(1, -1).map((cell, index) => ({
    id: `${corridor.id}:insert:${index}:${cell.x}:${cell.y}`,
    corridor,
    cell,
    insertIndex: getManualWaypointInsertIndex(corridor, cell),
    x: cell.x * gridSize,
    y: cell.y * gridSize,
    point: { x: (cell.x + 0.5) * gridSize, y: (cell.y + 0.5) * gridSize },
  }));
}

export function renderCorridorJunctionOverrides(generatedMap) {
  const junctions = getCorridorIntersectionCells(generatedMap.corridors);
  if (junctions.length === 0) return null;
  const manualJunctions = generatedMap.config.manualCorridorJunctions || {};
  const visible = junctions
    .map((junction) => {
      const override = getManualJunctionOverride(
        manualJunctions,
        junction.key,
        "merge",
      );
      return {
        ...junction,
        type: override.type,
        sideIndex: override.sideIndex,
      };
    })
    .filter((junction) => junction.type !== "merge");
  if (visible.length === 0) return null;
  return (
    <g className="corridor-junctions">
      {visible.map((junction, index) => {
        const geometry = getCorridorJunctionGeometry(
          junction,
          generatedMap.config,
          junction.sideIndex,
        );
        if (junction.type === "wall") {
          return (
            <g key={`junction-wall-${junction.key}`}>
              <path
                className="junction-wall-line"
                d={createRoughWallPath(
                  geometry.line,
                  generatedMap.config,
                  `junction-${junction.key}-${index}`,
                  "main",
                )}
              />
              <path
                className="junction-wall-sketch"
                d={createRoughWallPath(
                  geometry.line,
                  generatedMap.config,
                  `junction-sketch-${junction.key}-${index}`,
                  "sketch",
                )}
              />
            </g>
          );
        }
        return (
          <g key={`junction-door-${junction.key}`}>
            <path
              className="junction-wall-line"
              d={createRoughWallPath(
                geometry.line,
                generatedMap.config,
                `junction-door-${junction.key}-${index}`,
                "door",
              )}
            />
            <path
              className="junction-wall-sketch"
              d={createRoughWallPath(
                geometry.line,
                generatedMap.config,
                `junction-door-sketch-${junction.key}-${index}`,
                "door-sketch",
              )}
            />
            <path
              className="junction-door-panel"
              d={createRoughDoorPanelPath(
                geometry.panel,
                generatedMap.config,
                `junction-door-panel-${junction.key}-${index}`,
              )}
            />
          </g>
        );
      })}
    </g>
  );
}

export function renderCrossLevelCorridorOverpasses(generatedMap) {
  const crossings = getCrossLevelCorridorIntersectionCells(
    generatedMap.corridors,
  )
    .map((crossing) => {
      const topLevel = Math.max(...crossing.levels);
      const topCorridor =
        crossing.corridors.find(
          (corridor) => getCorridorPlanarLevel(corridor) === topLevel,
        ) || crossing.corridors[0];
      return {
        ...crossing,
        topLevel,
        topCorridor,
        topWalls: getCorridorLocalWallSegmentsForCell(
          topCorridor,
          crossing.cell,
          generatedMap.config.gridSize,
        ),
      };
    })
    .filter((crossing) => crossing.topCorridor && crossing.topWalls.length > 0)
    .sort((a, b) => a.topLevel - b.topLevel);

  if (crossings.length === 0) return null;
  const { config } = generatedMap;
  return (
    <g className="corridor-overpass-patches">
      {crossings.map((crossing, index) => (
        <g
          key={`cross-level-corridor-${crossing.key}-${index}`}
          className="corridor-overpass-patch"
        >
          <path
            className="overpass-corridor-floor"
            d={cellRectToPath(crossing.cell, config.gridSize)}
          />
          <g className="wall-main overpass-corridor-walls">
            {crossing.topWalls.map((wall, wallIndex) => (
              <path
                key={`cross-level-wall-${crossing.key}-${wallIndex}`}
                d={createRoughWallPath(
                  wall,
                  config,
                  `cross-level-top-${crossing.key}-${index}-${wallIndex}`,
                  "main",
                )}
              />
            ))}
          </g>
          <g className="wall-sketch overpass-corridor-wall-sketch">
            {crossing.topWalls.map((wall, wallIndex) => (
              <path
                key={`cross-level-wall-sketch-${crossing.key}-${wallIndex}`}
                d={createRoughWallPath(
                  wall,
                  config,
                  `cross-level-top-sketch-${crossing.key}-${index}-${wallIndex}`,
                  "sketch",
                )}
              />
            ))}
          </g>
        </g>
      ))}
    </g>
  );
}

export function renderRoomHoverHighlight(region, generatedMap) {
  if (!region) return null;
  if (isPureCaveMap(generatedMap)) return null;

  const shape = getRegionCompositeShape(
    region,
    generatedMap,
    generatedMap.config.gridSize,
  );
  const pathOnlyHighlight =
    Boolean(shape.hoverPath) &&
    (shape.surfaceKind === "cave" ||
      shape.geometryKind === "organic-cell-mask" ||
      isPureCaveMap(generatedMap));
  const haloSegments = pathOnlyHighlight
    ? []
    : shape.hoverSegments.map((segment, index) => (
        <line
          key={`room-hover-halo-${region.id}-${index}`}
          x1={segment.x1}
          y1={segment.y1}
          x2={segment.x2}
          y2={segment.y2}
        />
      ));
  const edgeSegments = pathOnlyHighlight
    ? []
    : shape.hoverSegments.map((segment, index) => (
        <line
          key={`room-hover-edge-${region.id}-${index}`}
          x1={segment.x1}
          y1={segment.y1}
          x2={segment.x2}
          y2={segment.y2}
        />
      ));

  return (
    <g className="room-hover-highlight">
      <g className="room-hover-highlight__halo">
        {shape.hoverPath ? <path d={shape.hoverPath} /> : null}
        {haloSegments}
      </g>
      <g className="room-hover-highlight__edge">
        {shape.hoverPath ? <path d={shape.hoverPath} /> : null}
        {edgeSegments}
      </g>
    </g>
  );
}

export function corridorPathD(corridor, gridSize) {
  let points = [];
  if (Array.isArray(corridor.centerline) && corridor.centerline.length >= 2) {
    points = corridor.centerline;
  } else {
    const startAnchor = corridor.fromAnchor;
    const endAnchor = corridor.toAnchor;
    if (startAnchor && endAnchor) {
      points = [
        getAnchorHandlePoint(startAnchor, gridSize),
        getAnchorHandlePoint(endAnchor, gridSize),
      ];
    }
  }
  if (points.length < 2) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join("");
}

export function renderCorridorHoverHighlight(corridor, gridSize) {
  if (!corridor) return null;
  const d = corridorPathD(corridor, gridSize);
  if (!d) return null;
  return (
    <g className="corridor-hover-highlight">
      <path className="corridor-hover-highlight__halo" d={d} />
      <path className="corridor-hover-highlight__line" d={d} />
    </g>
  );
}

export function getCaveEditorZonePath(region, generatedMap, gridSize) {
  const surface = getRegionSurface(region, generatedMap);
  return (
    surface?.hoverPath ||
    surface?.visualFloorPath ||
    buildOrganicCellBoundaryPath(region, generatedMap, gridSize) ||
    buildFloorPath(region.floorCells || [], gridSize)
  );
}

export function renderCaveEditorZoneOverlays(generatedMap, editorOptions = {}) {
  if (!isPureCaveMap(generatedMap)) return null;
  const { regions, config } = generatedMap;
  const { draggingRegionId, hoveredRegionId } = editorOptions;
  return (
    <g className="cave-zone-overlays" aria-hidden="true">
      {regions.map((region) => {
        const d = getCaveEditorZonePath(region, generatedMap, config.gridSize);
        if (!d) return null;
        const point = region.labelPoint || {
          x: region.x + region.w / 2,
          y: region.y + region.h / 2,
        };
        const classes = [
          "cave-zone-overlay",
          hoveredRegionId === region.id ? "cave-zone-overlay--hovered" : "",
          draggingRegionId === region.id ? "cave-zone-overlay--selected" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <g key={`cave-zone-${region.id}`} className={classes}>
            <path d={d} fillRule="nonzero" />
            <circle
              className="cave-zone-overlay__node"
              cx={point.x}
              cy={point.y}
              r={8}
            />
            <text
              className="cave-zone-overlay__label"
              x={point.x}
              y={point.y + 3.2}
              textAnchor="middle"
            >
              {region.number || ""}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function renderCaveTunnelTraces(generatedMap, activeCorridorId = null) {
  if (!isPureCaveMap(generatedMap)) return null;
  const { corridors, config } = generatedMap;
  const tunnelCorridors = corridors.filter(isOrganicCorridor);
  if (tunnelCorridors.length === 0) return null;
  return (
    <g className="cave-tunnel-traces" aria-hidden="true">
      {tunnelCorridors.map((corridor) => {
        const d = corridorPathD(corridor, config.gridSize);
        if (!d) return null;
        const classes = [
          "cave-tunnel-trace",
          corridor.id === activeCorridorId ? "cave-tunnel-trace--active" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <path
            key={`cave-tunnel-trace-${corridor.id}`}
            className={classes}
            d={d}
          />
        );
      })}
    </g>
  );
}

export function getCavePassageHandles(generatedMap) {
  if (!isPureCaveMap(generatedMap)) return [];
  const { corridors, config } = generatedMap;
  return corridors
    .flatMap((corridor) => {
      if (!isOrganicCorridor(corridor)) return [];
      return [
        { corridor, endpoint: "from", anchor: corridor.fromAnchor },
        { corridor, endpoint: "to", anchor: corridor.toAnchor },
      ];
    })
    .filter((item) => item.anchor)
    .map((item) => {
      const point = getAnchorHandlePoint(item.anchor, config.gridSize);
      return {
        id: `${item.corridor.id}:${item.endpoint}`,
        corridor: item.corridor,
        endpoint: item.endpoint,
        x: point.x,
        y: point.y,
      };
    });
}

export function renderEditorOverlays(generatedMap, editorOptions = {}) {
  const { regions, corridors, config } = generatedMap;
  const {
    draggingRegionId,
    hoveredRegionId,
    draggingCorridorHandle,
    draggingMapAccessId,
    mapAccessDragPreview,
    hoveredCorridorId,
    hoverWallHandle,
    connectionDraft,
    onRoomPointerDown,
    onRoomPointerEnter,
    onRoomPointerLeave,
    onRoomContextMenu,
    onDoorPointerDown,
    onWaypointPointerDown,
    onWaypointContextMenu,
    onDoorContextMenu,
    onCorridorZonePointerMove,
    onCorridorZonePointerLeave,
    onJunctionContextMenu,
    onCorridorAddPointerDown,
    onCorridorAddContextMenu,
    onCorridorAddPointerLeave,
    onWallZonePointerMove,
    onWallZonePointerLeave,
    onWallZonePointerDown,
    onWallZoneContextMenu,
    onWallHandlePointerDown,
    onWallHandlePointerLeave,
    onMapAccessPointerDown,
    onMapAccessContextMenu,
  } = editorOptions;
  const wallConnectionZones = regions.flatMap((region) =>
    getWallConnectionZones(region, regions, config.gridSize, generatedMap),
  );
  const corridorInsertionZones = corridors.flatMap((corridor) =>
    getCorridorInsertionZones(corridor, config.gridSize),
  );
  const junctionByCell = new Map(
    getCorridorIntersectionCells(corridors).map((junction) => [
      junction.key,
      junction,
    ]),
  );
  const endpointHandles = corridors
    .flatMap((corridor) => {
      if (isPureCaveMap(generatedMap) && isOrganicCorridor(corridor)) return [];
      if (corridor.isRoomLink && corridor.fromAnchor) {
        return [{ corridor, endpoint: "shared", anchor: corridor.fromAnchor }];
      }
      return [
        { corridor, endpoint: "from", anchor: corridor.fromAnchor },
        { corridor, endpoint: "to", anchor: corridor.toAnchor },
      ];
    })
    .filter((item) => item.anchor)
    .map((item) => {
      const door = createDoorFromAnchor(item.anchor, config.gridSize, false);
      return {
        id: `${item.corridor.id}:${item.endpoint}`,
        corridor: item.corridor,
        endpoint: item.endpoint,
        x: (door.x1 + door.x2) / 2,
        y: (door.y1 + door.y2) / 2,
      };
    });
  const waypointHandles = corridors.flatMap((corridor) => {
    const manualPoints = Array.isArray(corridor.manualWaypoints)
      ? corridor.manualWaypoints.filter(isValidPoint)
      : [];
    return manualPoints.map((cell, index) => ({
      id: `${corridor.id}:manual-waypoint:${index}`,
      corridor,
      index,
      source: "manual",
      x: (cell.x + 0.5) * config.gridSize,
      y: (cell.y + 0.5) * config.gridSize,
    }));
  });
  const accessHandles = (
    generatedMap.dungeonMask.mapAccesses ||
    generatedMap.mapAccesses ||
    []
  ).map((access) => {
    const preview =
      mapAccessDragPreview?.id === access.id ? mapAccessDragPreview : null;
    return {
      access,
      id: access.id,
      regionId: access.regionId,
      x:
        preview?.x ??
        access.displayPoint?.x ??
        ((access.displayWallGap || access.wallGap).x1 +
          (access.displayWallGap || access.wallGap).x2) /
          2,
      y:
        preview?.y ??
        access.displayPoint?.y ??
        ((access.displayWallGap || access.wallGap).y1 +
          (access.displayWallGap || access.wallGap).y2) /
          2,
    };
  });
  const highlightedRegion = regions.find(
    (region) => region.id === (draggingRegionId || hoveredRegionId),
  );
  const activeCorridorId =
    draggingCorridorHandle?.split(":")[0] ||
    editorOptions.hoverCorridorHandle?.corridor?.id ||
    hoveredCorridorId;
  const highlightedCorridor = corridors.find(
    (corridor) => corridor.id === activeCorridorId,
  );
  const cavePassageHandles = getCavePassageHandles(generatedMap);
  return (
    <g className="editor-overlays">
      {renderCaveEditorZoneOverlays(generatedMap, {
        draggingRegionId,
        hoveredRegionId,
      })}
      {renderCaveTunnelTraces(generatedMap, activeCorridorId)}
      {renderRoomHoverHighlight(highlightedRegion, generatedMap)}
      {renderCorridorHoverHighlight(highlightedCorridor, config.gridSize)}
      {regions.map((region) => (
        <path
          key={`overlay-${region.id}`}
          className={
            draggingRegionId === region.id
              ? "room-drag-handle is-dragging"
              : "room-drag-handle"
          }
          d={buildRegionVisualFloorPath(region, config.gridSize, generatedMap)}
          fillRule="nonzero"
          onPointerDown={(event) => onRoomPointerDown?.(event, region)}
          onPointerEnter={(event) => onRoomPointerEnter?.(event, region)}
          onPointerLeave={(event) => onRoomPointerLeave?.(event, region)}
          onContextMenu={(event) => onRoomContextMenu?.(event, region)}
          data-key="tooltip-room"
          data-tooltip={region.id}
          tabIndex={0}
          focusable="true"
          role="button"
          aria-label={
            region.name
              ? `${region.name} region`
              : `Region ${region.number || ""}`.trim()
          }
        />
      ))}
      {wallConnectionZones.map((zone) => (
        <line
          key={`wall-zone-${zone.id}`}
          className="wall-hover-zone"
          x1={zone.x1}
          y1={zone.y1}
          x2={zone.x2}
          y2={zone.y2}
          onPointerEnter={(event) => onWallZonePointerMove?.(event, zone)}
          onPointerMove={(event) => onWallZonePointerMove?.(event, zone)}
          onPointerLeave={(event) => onWallZonePointerLeave?.(event, zone)}
          onPointerDown={(event) => onWallZonePointerDown?.(event, zone)}
          onContextMenu={(event) => onWallZoneContextMenu?.(event, zone)}
        />
      ))}
      {corridorInsertionZones.map((zone) => (
        <rect
          key={`corridor-zone-${zone.id}`}
          className={
            junctionByCell.has(cellKey(zone.cell.x, zone.cell.y))
              ? "corridor-hover-zone is-junction"
              : "corridor-hover-zone"
          }
          x={zone.x}
          y={zone.y}
          width={config.gridSize}
          height={config.gridSize}
          onPointerEnter={(event) => onCorridorZonePointerMove?.(event, zone)}
          onPointerMove={(event) => onCorridorZonePointerMove?.(event, zone)}
          onPointerLeave={(event) => onCorridorZonePointerLeave?.(event, zone)}
          onContextMenu={(event) => onCorridorAddContextMenu?.(event, zone)}
        />
      ))}
      {connectionDraft && (
        <g className="connection-preview-layer">
          <line
            className="connection-preview"
            x1={connectionDraft.start.x}
            y1={connectionDraft.start.y}
            x2={connectionDraft.current.x}
            y2={connectionDraft.current.y}
          />
          <circle
            className="connection-preview__endpoint"
            cx={connectionDraft.start.x}
            cy={connectionDraft.start.y}
            r={4}
          />
          <circle
            className="connection-preview__endpoint"
            cx={connectionDraft.current.x}
            cy={connectionDraft.current.y}
            r={4}
          />
        </g>
      )}
      {editorOptions.hoverCorridorHandle &&
        !connectionDraft &&
        (() => {
          const handle = editorOptions.hoverCorridorHandle;
          const junction = junctionByCell.get(
            cellKey(handle.cell.x, handle.cell.y),
          );
          return (
            <circle
              key={`corridor-add-${handle.id}`}
              className={
                junction
                  ? "corridor-add-handle is-junction"
                  : "corridor-add-handle"
              }
              cx={handle.point.x}
              cy={handle.point.y}
              r={junction ? 6.5 : 5}
              onPointerDown={(event) =>
                onCorridorAddPointerDown?.(event, handle)
              }
              onPointerLeave={(event) =>
                onCorridorAddPointerLeave?.(event, handle)
              }
              onContextMenu={(event) =>
                onCorridorAddContextMenu?.(event, handle)
              }
            />
          );
        })()}
      {hoverWallHandle && !connectionDraft && (
        <circle
          key={`wall-connect-${hoverWallHandle.regionId}-${hoverWallHandle.anchor.cell.x}-${hoverWallHandle.anchor.cell.y}-${hoverWallHandle.anchor.side}`}
          className="wall-connect-handle"
          cx={hoverWallHandle.point.x}
          cy={hoverWallHandle.point.y}
          r={6}
          onPointerDown={(event) =>
            onWallHandlePointerDown?.(event, hoverWallHandle)
          }
          onPointerLeave={(event) =>
            onWallHandlePointerLeave?.(event, hoverWallHandle)
          }
        />
      )}
      {accessHandles.map((handle) => (
        <g
          key={`map-access-handle-${handle.id}`}
          onPointerDown={(event) => onMapAccessPointerDown?.(event, handle)}
          onContextMenu={(event) => onMapAccessContextMenu?.(event, handle)}
        >
          <circle
            className={
              draggingMapAccessId === handle.id
                ? "map-access-handle is-dragging"
                : "map-access-handle"
            }
            cx={handle.x}
            cy={handle.y}
            r={6}
          />
          <path
            className="map-access-handle__icon"
            d={`M${handle.x - 2.5} ${handle.y}H${handle.x + 2.5}M${handle.x + 0.8} ${handle.y - 2.2}L${handle.x + 3.1} ${handle.y}L${handle.x + 0.8} ${handle.y + 2.2}`}
          />
        </g>
      ))}
      {endpointHandles.map((handle) => (
        <circle
          key={`endpoint-${handle.id}`}
          className={
            draggingCorridorHandle === handle.id
              ? "endpoint-handle is-dragging"
              : "endpoint-handle"
          }
          cx={handle.x}
          cy={handle.y}
          r={5}
          onPointerEnter={(event) =>
            editorOptions.onCorridorHandlePointerEnter?.(event, handle)
          }
          onPointerLeave={(event) =>
            editorOptions.onCorridorHandlePointerLeave?.(event, handle)
          }
          onPointerDown={(event) => onDoorPointerDown?.(event, handle)}
          onContextMenu={(event) => onDoorContextMenu?.(event, handle)}
        />
      ))}
      {cavePassageHandles.map((handle) => (
        <circle
          key={`cave-passage-${handle.id}`}
          className={
            draggingCorridorHandle === handle.id
              ? "cave-passage-handle is-dragging"
              : "cave-passage-handle"
          }
          cx={handle.x}
          cy={handle.y}
          r={5.5}
          onPointerEnter={(event) =>
            editorOptions.onCorridorHandlePointerEnter?.(event, handle)
          }
          onPointerLeave={(event) =>
            editorOptions.onCorridorHandlePointerLeave?.(event, handle)
          }
          onPointerDown={(event) => onDoorPointerDown?.(event, handle)}
        />
      ))}
      {waypointHandles.map((handle) => {
        const cell = {
          x: Math.floor(handle.x / config.gridSize),
          y: Math.floor(handle.y / config.gridSize),
        };
        const isJunction = junctionByCell.has(cellKey(cell.x, cell.y));
        const classes = [
          "waypoint-handle",
          isJunction ? "is-junction" : "",
          draggingCorridorHandle === handle.id ? "is-dragging" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <rect
            key={`waypoint-${handle.id}`}
            className={classes}
            x={handle.x - (isJunction ? 5 : 4)}
            y={handle.y - (isJunction ? 5 : 4)}
            width={isJunction ? 10 : 8}
            height={isJunction ? 10 : 8}
            onPointerEnter={(event) =>
              editorOptions.onCorridorHandlePointerEnter?.(event, handle)
            }
            onPointerLeave={(event) =>
              editorOptions.onCorridorHandlePointerLeave?.(event, handle)
            }
            onPointerDown={(event) => onWaypointPointerDown?.(event, handle)}
            onContextMenu={(event) => onWaypointContextMenu?.(event, handle)}
          />
        );
      })}
    </g>
  );
}

export function MapSvg({
  generatedMap,
  showGrid,
  gridStyle,
  showEditor,
  showNames,
  showProps,
  levelView = LEVEL_VIEW_ALL,
  fadeOtherLevels = true,
  editorOptions = {},
  viewportViewBox = null,
}) {
  const { config } = generatedMap;
  const visualStyle = normalizeVisualStyle(config.visualStyle);
  const viewBox =
    viewportViewBox || `0 0 ${config.mapWidth} ${config.mapHeight}`;
  const availableLevels = getAvailableMapLevels(generatedMap);
  const normalizedLevelView = normalizeLevelView(levelView, availableLevels);
  const isLevelFiltered = normalizedLevelView !== LEVEL_VIEW_ALL;
  const activeMap = isLevelFiltered
    ? createLevelFilteredMap(generatedMap, normalizedLevelView, "active")
    : generatedMap;
  const fadedMap =
    isLevelFiltered && fadeOtherLevels
      ? createLevelFilteredMap(generatedMap, normalizedLevelView, "inactive")
      : null;
  const layerGridStyle = isLevelFiltered
    ? "none"
    : showGrid
      ? gridStyle
      : "none";
  const activeEditorMap = hasRenderableGeometry(activeMap)
    ? activeMap
    : generatedMap;

  return (
    <svg
      id="cruor-map-svg"
      className={`cruor-map-svg map-style-${visualStyle}`}
      viewBox={viewBox}
      role="img"
      aria-label="Generated Cruor location map"
      onPointerMove={editorOptions.onEditorPointerMove}
      onPointerUp={editorOptions.onEditorPointerUp}
      onPointerCancel={editorOptions.onEditorPointerUp}
    >
      <defs>
        <style>{`${SVG_STYLE}${MAP_VISUAL_STYLE}${EDITOR_CAVE_STYLE}`}</style>
        <linearGradient id="cruorMapBackground" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3d0712" />
          <stop offset="42%" stopColor="#160207" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        <linearGradient id="bloodMapBackground" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5f0716" />
          <stop offset="55%" stopColor="#210107" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        <linearGradient id="midnightMapBackground" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#071427" />
          <stop offset="58%" stopColor="#030711" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        <filter id="paperNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.06" />
          </feComponentTransfer>
        </filter>
        {renderRegionClipPaths(generatedMap)}
        {renderDungeonFloorClipPath(generatedMap)}
        {renderCaveWallAccessMask(generatedMap)}
      </defs>
      <rect
        className="paper"
        x="0"
        y="0"
        width={config.mapWidth}
        height={config.mapHeight}
      />
      <rect
        className="paper-texture"
        x="0"
        y="0"
        width={config.mapWidth}
        height={config.mapHeight}
        filter="url(#paperNoise)"
      />
      {showGrid && renderGrid(config, gridStyle)}
      {fadedMap && hasRenderableGeometry(fadedMap) && (
        <g className="level-layer level-layer--faded">
          {renderUnifiedDungeonSurface(fadedMap, "none")}
          {showProps && renderProps(fadedMap.props)}
          {renderLabels(fadedMap, { showNames })}
        </g>
      )}
      <g className="level-layer level-layer--active">
        {renderUnifiedDungeonSurface(activeMap, layerGridStyle)}
        {showProps && renderProps(activeMap.props)}
        {renderLabels(activeMap, { showNames })}
      </g>
      {showEditor && renderEditorOverlays(activeEditorMap, editorOptions)}
    </svg>
  );
}
