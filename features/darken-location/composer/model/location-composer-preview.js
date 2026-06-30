import { createMapRequestFromDarkenLocationState } from "../../darken-location.map-request.js";
import { DEFAULT_CONFIG, createConfigFromNormalizedMapRequest } from "../../map-generator/map-generator.input.js";
import { generateMap } from "../../map-generator/map-generator.pipeline.js";
import {
  createEmptyManualOverrides,
  normalizeManualOverrides,
} from "../../map-generator/map-generator.state.js";

function applyMapRequestConnectionsToConfig(config, mapRequest) {
  return {
    ...config,
    connections: Array.isArray(mapRequest?.connections) ? mapRequest.connections : [],
  };
}

let cachedPreviewGenerationKey = "";
let cachedPreviewGeneratedMap = null;

function stripPreviewOnlyConfigFields(config = {}) {
  const {
    gridStyle: _gridStyle,
    metadata: _metadata,
    showGrid: _showGrid,
    showNames: _showNames,
    showProps: _showProps,
    showRoomBadges: _showRoomBadges,
    ...generationConfig
  } = config || {};
  return generationConfig;
}

function createPreviewGenerationKey(previewConfig, previewManualOverrides) {
  return JSON.stringify({
    config: stripPreviewOnlyConfigFields(previewConfig),
    manualOverrides: previewManualOverrides,
  });
}

export function createLocationPreviewModel(snapshot, manualOverrides = createEmptyManualOverrides()) {
  const mapRequest = createMapRequestFromDarkenLocationState(snapshot);
  const previewConfig = applyMapRequestConnectionsToConfig(
    createConfigFromNormalizedMapRequest(mapRequest, DEFAULT_CONFIG),
    mapRequest,
  );
  const previewManualOverrides = normalizeManualOverrides(manualOverrides);
  const previewGenerationKey = createPreviewGenerationKey(
    previewConfig,
    previewManualOverrides,
  );

  try {
    const generatedMap =
      cachedPreviewGeneratedMap && cachedPreviewGenerationKey === previewGenerationKey
        ? cachedPreviewGeneratedMap
        : generateMap(previewConfig, previewManualOverrides);

    cachedPreviewGenerationKey = previewGenerationKey;
    cachedPreviewGeneratedMap = generatedMap;

    return {
      mapRequest,
      previewConfig,
      previewResult: {
        generatedMap,
        error: "",
      },
    };
  } catch (error) {
    cachedPreviewGenerationKey = "";
    cachedPreviewGeneratedMap = null;

    return {
      mapRequest,
      previewConfig,
      previewResult: {
        generatedMap: null,
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

function createAssignmentSignature(assignments = {}) {
  if (!assignments || typeof assignments !== "object") return "none";

  return Object.entries(assignments)
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([slotId, items]) =>
      (Array.isArray(items) ? items : [])
        .map((item) => [
          slotId,
          item?.componentId || "",
          item?.slotId || slotId,
          item?.regionId || "map",
        ].join("@")),
    )
    .sort()
    .join("|") || "none";
}

function createRegionSignature(regions = []) {
  if (!Array.isArray(regions) || !regions.length) return "no-regions";

  return regions.map((region) => [
    region.sourceRegionId || region.id || region.label || "region",
    region.label || "",
    region.role || "",
    region.size || "",
    region.shape || "",
    (region.links || []).join(","),
    (region.metadata?.assignedSlotIds || []).join(","),
  ].join("@"))
    .join("|");
}

function createConnectionSignature(connections = []) {
  if (!Array.isArray(connections) || !connections.length) return "no-connections";
  return connections
    .map((connection) => [
      connection?.from || "",
      connection?.to || "",
      connection?.kind || "main",
      connection?.locked ? "locked" : "open",
      connection?.secret ? "secret" : "visible",
    ].join("@"))
    .sort()
    .join("|");
}

export function getLocationPreviewResetKey(mapRequest, digest, state = {}) {
  const slotAssignments = state.slotAssignments || mapRequest.metadata?.slotAssignments || {};

  return [
    mapRequest.seed || "no-seed",
    mapRequest.context || "no-context",
    mapRequest.mapType || "no-map-type",
    createRegionSignature(mapRequest.requiredRegions),
    createConnectionSignature(mapRequest.connections),
    state.activeSlotScope || mapRequest.metadata?.activeSlotScope || "map",
    state.activeRegionId || mapRequest.metadata?.activeRegionId || "no-active-region",
    `${digest.filledSlots || 0}/${digest.totalSlots || 0}`,
    createAssignmentSignature(slotAssignments),
  ].join("::");
}
