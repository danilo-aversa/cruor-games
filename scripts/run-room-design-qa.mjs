import fs from "node:fs";
import path from "node:path";
import { generateMap } from "../features/darken-location/map-generator/map-generator.pipeline.js";
import { createConfigFromNormalizedMapRequest } from "../features/darken-location/map-generator/map-generator.input.js";
import { createMapRequestFromDarkenLocationState } from "../features/darken-location/darken-location.map-request.js";
import {
  ROOM_DESIGN_SCHEMA_VERSION,
  normalizeRoomDesign,
} from "../features/darken-location/map-generator/map-generator.room-design.js";

const DIST_DIR = path.resolve("dist/qa");
const REPORT_PATH = path.join(DIST_DIR, "room-design-qa-report.json");

function createIssue(severity, scope, code, message, details = {}) {
  return { severity, scope, code, message, details };
}

function summarizeIssues(issues) {
  return issues.reduce(
    (summary, issue) => {
      summary.total += 1;
      summary[issue.severity] = (summary[issue.severity] || 0) + 1;
      return summary;
    },
    { total: 0, error: 0, warning: 0, info: 0 },
  );
}

function findRegion(map, id) {
  return map.regions.find((region) => region.id === id || region.sourceRegionId === id);
}

function area(region) {
  return region?.floorCells?.length || region?.cellRect?.w * region?.cellRect?.h || 0;
}

function createPrimitiveConfig() {
  return {
    seed: "room-design-qa-primitives",
    context: "Crypt",
    biome: "Crypt",
    roomCount: 12,
    gridSize: 20,
    mapWidth: 1800,
    mapHeight: 1000,
    contextGraphAdapterMode: "safe",
    regions: [
      {
        id: "room-design-circle",
        name: "Circular Well Room",
        role: "Clue Room",
        size: "Medium",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: "circle" },
          size: { minDiameterCells: 7, aspectRatio: "square" },
          props: { required: [{ kind: "well", placement: "center", minRadiusCells: 2 }] },
        },
      },
      {
        id: "room-design-l-shape",
        name: "L-Shaped Workroom",
        role: "Hazard Room",
        size: "Medium",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: "l-shape" },
          size: { minWidthCells: 6, minHeightCells: 5 },
        },
      },
      {
        id: "room-design-irregular",
        name: "Irregular Vault",
        role: "Hazard Room",
        size: "Large",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: "irregular" },
          size: { minAreaCells: 32 },
        },
      },
      {
        id: "room-design-hall",
        name: "Structured Hall",
        role: "Connector",
        size: "Medium",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: "hall" },
          size: { minWidthCells: 9, aspectRatio: "wide" },
        },
      },
      {
        id: "room-design-shaft",
        name: "Vertical Shaft Shrine",
        role: "Setpiece Room",
        size: "Medium",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: "shaft" },
          props: { required: [{ kind: "altar", placement: "far-wall" }] },
        },
      },
      {
        id: "room-design-rect",
        name: "Plain Rect Room",
        role: "Side Room",
        size: "Small",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: "rect" },
          size: { minAreaCells: 16 },
        },
      },
      {
        id: "room-design-modified-chamber",
        name: "Modified Pillared Chamber",
        role: "Setpiece Room",
        size: "Large",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: "rect", modifiers: ["central-void", "pillared", "partitioned", "chamfered-corners"] },
          size: { minWidthCells: 7, minHeightCells: 6, minAreaCells: 34 },
        },
      },
      {
        id: "room-design-recess-gallery",
        name: "Recessed Side Gallery",
        role: "Secret Room",
        size: "Medium",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: "gallery", modifiers: ["side-alcoves", "secret-recess", "collapsed-edge"] },
          size: { minWidthCells: 8, aspectRatio: "wide" },
        },
      },
      {
        id: "room-design-square",
        name: "Square Guard Room",
        role: "Side Room",
        size: "Small",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: "square" },
          size: { minWidthCells: 5 },
        },
      },
      {
        id: "room-design-t-shape",
        name: "T-Shaped Junction",
        role: "Connector",
        size: "Large",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: "t-shape" },
          size: { minWidthCells: 7, minHeightCells: 6 },
        },
      },
      {
        id: "room-design-cross",
        name: "Cruciform Vault",
        role: "Setpiece Room",
        size: "Large",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: "cross" },
          size: { minWidthCells: 7, minHeightCells: 7 },
        },
      },
      {
        id: "room-design-niche",
        name: "Reliquary Niche",
        role: "Secret Room",
        size: "Small",
        preferredShape: "rect",
        roomDesign: {
          shape: { kind: "niche" },
          size: { minWidthCells: 4, minHeightCells: 4 },
        },
      },
    ],
  };
}

function validatePrimitiveMap(map, issues) {
  const expectations = [
    { id: "room-design-circle", shape: "circle", minW: 7, minH: 7, requiredProp: "pit" },
    { id: "room-design-l-shape", shape: "l-shape", minW: 6, minH: 5 },
    { id: "room-design-irregular", shape: "irregular", minArea: 32 },
    { id: "room-design-hall", shape: "hall", minW: 9 },
    { id: "room-design-shaft", shape: "shaft", requiredProp: "altar" },
    { id: "room-design-rect", shape: "rect", minArea: 16 },
    { id: "room-design-modified-chamber", shape: "rect", minW: 7, minH: 6, minArea: 34, modifierProps: ["central-void", "pillared", "partitioned", "chamfered-corners"] },
    { id: "room-design-recess-gallery", shape: "gallery", minW: 8, modifierProps: ["side-alcoves", "secret-recess", "collapsed-edge"] },
    { id: "room-design-square", shape: "square", minW: 5, minH: 5, equalDimensions: true },
    { id: "room-design-t-shape", shape: "t-shape", minW: 7, minH: 6 },
    { id: "room-design-cross", shape: "cross", minW: 7, minH: 7 },
    { id: "room-design-niche", shape: "niche", minW: 4, minH: 4 },
  ];

  expectations.forEach((expected) => {
    const region = findRegion(map, expected.id);
    if (!region) {
      issues.push(createIssue("error", "primitive", "missing-region", `${expected.id} did not generate.`));
      return;
    }
    if (region.shape !== expected.shape) {
      issues.push(createIssue("error", "primitive", "shape", `${expected.id} expected shape ${expected.shape}, got ${region.shape}.`, { region }));
    }
    if (region.roomDesign?.schemaVersion !== ROOM_DESIGN_SCHEMA_VERSION) {
      issues.push(createIssue("error", "primitive", "schema", `${expected.id} did not retain normalized roomDesign schema.`, { roomDesign: region.roomDesign }));
    }
    if (expected.minW && region.cellRect.w < expected.minW) {
      issues.push(createIssue("error", "primitive", "min-width", `${expected.id} width ${region.cellRect.w} is below ${expected.minW}.`));
    }
    if (expected.minH && region.cellRect.h < expected.minH) {
      issues.push(createIssue("error", "primitive", "min-height", `${expected.id} height ${region.cellRect.h} is below ${expected.minH}.`));
    }
    if (expected.equalDimensions && region.cellRect.w !== region.cellRect.h) {
      issues.push(createIssue("error", "primitive", "equal-dimensions", `${expected.id} expected equal dimensions, got ${region.cellRect.w}x${region.cellRect.h}.`));
    }
    if (expected.minArea && area(region) < expected.minArea) {
      issues.push(createIssue("error", "primitive", "min-area", `${expected.id} area ${area(region)} is below ${expected.minArea}.`));
    }
    if (expected.requiredProp) {
      const prop = map.props.find((item) => item.regionId === region.id && item.kind === expected.requiredProp && item.roomDesignRequired);
      if (!prop) {
        issues.push(createIssue("error", "primitive", "required-prop", `${expected.id} is missing required roomDesign prop ${expected.requiredProp}.`, { props: map.props.filter((item) => item.regionId === region.id) }));
      }
    }
    if (expected.modifierProps?.length) {
      expected.modifierProps.forEach((modifier) => {
        const prop = map.props.find((item) => item.regionId === region.id && item.roomDesignModifier === modifier);
        if (!prop) {
          issues.push(createIssue("error", "primitive", "modifier-prop", `${expected.id} is missing roomDesign modifier prop ${modifier}.`, { props: map.props.filter((item) => item.regionId === region.id) }));
        }
      });
    }
  });
}

async function validateBridge(issues) {
  const roomDesign = {
    shape: { kind: "circle" },
    size: { minDiameterCells: 7, aspectRatio: "square" },
    props: { required: [{ kind: "well", placement: "center" }] },
  };
  const snapshot = {
    seed: "room-design-bridge",
    context: "Crypt",
    horror: ["Gothic"],
    sourceAnchors: ["Sedlec Ossuary"],
    slotAssignments: {},
    selectedComponents: [],
    locationRegions: [
      {
        id: "bridge-room-design-region",
        name: "Bridge Room Design Region",
        role: "Clue Room",
        size: "Medium",
        shape: "rect",
        locationRegion: {
          roomDesign,
        },
      },
    ],
  };
  const mapRequest = createMapRequestFromDarkenLocationState(snapshot);
  const requiredRegion = mapRequest.requiredRegions?.[0];
  if (!requiredRegion?.metadata?.roomDesign && !requiredRegion?.roomDesign) {
    issues.push(createIssue("error", "bridge", "map-request-room-design", "roomDesign did not reach the map request required region.", { requiredRegion }));
    return;
  }
  const config = createConfigFromNormalizedMapRequest(mapRequest);
  const configRegion = config.regions?.[0];
  if (!configRegion?.roomDesign) {
    issues.push(createIssue("error", "bridge", "normalized-config-room-design", "roomDesign did not reach normalized map config.", { configRegion }));
    return;
  }
  const map = generateMap(config);
  const generatedRegion = findRegion(map, configRegion.id);
  if (generatedRegion?.shape !== "circle") {
    issues.push(createIssue("error", "bridge", "generated-shape", `Bridge roomDesign expected circle, got ${generatedRegion?.shape || "missing"}.`, { generatedRegion }));
  }
}

async function validateMultiComponentBridge(issues) {
  const selectedComponents = [
    {
      id: "qa-circle-pit",
      title: "QA Circle Pit",
      location: {
        roomDesign: {
          shape: { kind: "circle", modifiers: ["central-void"] },
          size: { minWidthCells: 7, minAreaCells: 30 },
          props: { required: [{ kind: "pit", placement: "center" }] },
          topology: { branchBias: "terminal" },
        },
      },
    },
    {
      id: "qa-pillared-altar",
      title: "QA Pillared Altar",
      location: {
        roomDesign: {
          shape: { kind: "circle", modifiers: ["pillared"] },
          size: { minHeightCells: 6 },
          props: { required: [{ kind: "altar", placement: "center" }] },
          topology: { secret: true },
        },
      },
    },
  ];
  const snapshot = {
    seed: "room-design-multi-component-bridge",
    context: "Crypt",
    slotAssignments: {
      hazard: [{ componentId: "qa-circle-pit", slotId: "hazard", regionId: "qa-room" }],
      clue: [{ componentId: "qa-pillared-altar", slotId: "clue", regionId: "qa-room" }],
    },
    selectedComponents,
    locationRegions: [
      {
        id: "qa-room",
        name: "QA Multi-component Room",
        role: "Clue Room",
        size: "Medium",
        shape: "rect",
      },
    ],
  };
  const mapRequest = createMapRequestFromDarkenLocationState(snapshot);
  const requiredRegion = mapRequest.requiredRegions?.[0];
  const resolution = requiredRegion?.roomConstraintResolution;
  const design = requiredRegion?.effectiveRoomDesign;

  if (resolution?.status !== "transforms-room" || resolution?.conflicts?.length) {
    issues.push(createIssue("error", "bridge", "multi-component-resolution", "Compatible component roomDesign contributions did not resolve cleanly.", { resolution }));
    return;
  }
  if (
    design?.shape?.kind !== "circle" ||
    !design?.shape?.modifiers?.includes("central-void") ||
    !design?.shape?.modifiers?.includes("pillared") ||
    design?.size?.minWidthCells !== 7 ||
    design?.size?.minHeightCells !== 6 ||
    design?.size?.minAreaCells !== 30 ||
    design?.topology?.branchBias !== "terminal" ||
    design?.topology?.secret !== true
  ) {
    issues.push(createIssue("error", "bridge", "multi-component-room-design", "Multiple component roomDesign fields were not preserved in the effective design.", { design }));
    return;
  }
  const requiredPropKinds = new Set((design?.props?.required || []).map((prop) => prop.kind));
  if (!requiredPropKinds.has("pit") || !requiredPropKinds.has("altar")) {
    issues.push(createIssue("error", "bridge", "multi-component-props", "Multiple component required props were not preserved.", { design }));
    return;
  }
  const config = createConfigFromNormalizedMapRequest(mapRequest);
  const map = generateMap(config);
  const generatedRegion = findRegion(map, config.regions?.[0]?.id);
  if (generatedRegion?.shape !== "circle") {
    issues.push(createIssue("error", "bridge", "multi-component-generated-shape", `Resolved multi-component room expected circle, got ${generatedRegion?.shape || "missing"}.`, { generatedRegion }));
    return;
  }
  for (const kind of ["pit", "altar"]) {
    const prop = map.props.find((item) => item.regionId === generatedRegion.id && item.kind === kind && item.roomDesignRequired);
    if (!prop) {
      issues.push(createIssue("error", "bridge", "multi-component-generated-prop", `Resolved multi-component room is missing required prop ${kind}.`, { props: map.props.filter((item) => item.regionId === generatedRegion.id) }));
    }
  }

  const conflictRequest = createMapRequestFromDarkenLocationState({
    ...snapshot,
    selectedComponents: [
      selectedComponents[0],
      {
        ...selectedComponents[1],
        location: { roomDesign: { shape: { kind: "l-shape" } } },
      },
    ],
  });
  const conflictResolution = conflictRequest.requiredRegions?.[0]?.roomConstraintResolution;
  if (
    conflictResolution?.status !== "incompatible" ||
    !conflictResolution?.conflicts?.some((conflict) => conflict.code === "ROOM_SHAPE_REQUIRED_CONFLICT")
  ) {
    issues.push(createIssue("error", "bridge", "multi-component-conflict-report", "Conflicting hard component shapes did not produce a structured blocking report.", { conflictResolution }));
  }
}

function validateNormalizer(issues) {
  const normalized = normalizeRoomDesign({
    shape: { kind: "circular", modifiers: ["notched", "central-pit", "pillars"] },
    size: { minDiameterCells: "7", minAreaCells: "36" },
    props: { required: [{ kind: "well", placement: "center" }] },
  });
  if (normalized?.shape?.kind !== "circle") {
    issues.push(createIssue("error", "normalizer", "shape-alias", "roomDesign shape alias circular should normalize to circle.", { normalized }));
  }
  if (normalized?.size?.minDiameterCells !== 7 || normalized?.size?.minAreaCells !== 36) {
    issues.push(createIssue("error", "normalizer", "numeric-size", "roomDesign numeric size fields did not normalize.", { normalized }));
  }
  if (normalized?.props?.required?.[0]?.kind !== "pit") {
    issues.push(createIssue("error", "normalizer", "prop-alias", "roomDesign prop kind well should normalize to pit.", { normalized }));
  }
  if (!normalized?.shape?.modifiers?.includes("central-void") || !normalized?.shape?.modifiers?.includes("pillared")) {
    issues.push(createIssue("error", "normalizer", "modifier-alias", "roomDesign modifier aliases should normalize to central-void and pillared.", { normalized }));
  }
}

async function main() {
  const issues = [];
  validateNormalizer(issues);
  const map = generateMap(createPrimitiveConfig());
  validatePrimitiveMap(map, issues);
  await validateBridge(issues);
  await validateMultiComponentBridge(issues);

  fs.mkdirSync(DIST_DIR, { recursive: true });
  const summary = summarizeIssues(issues);
  fs.writeFileSync(REPORT_PATH, JSON.stringify({ summary, issues }, null, 2));
  console.log(`Room Design QA: ${summary.total} issues (${summary.error} errors, ${summary.warning} warnings, ${summary.info} info).`);
  if (summary.total) console.log(`Report: ${REPORT_PATH}`);
  if (summary.error || summary.warning) process.exit(1);
}

await main();
