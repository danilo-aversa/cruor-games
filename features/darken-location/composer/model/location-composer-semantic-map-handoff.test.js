import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DARK_PLACES_SEMANTIC_MAP_HANDOFF_SCHEMA_VERSION,
  classifyDarkPlacesSemanticMapChange,
  createDarkPlacesSemanticMapHandoff,
} from "./location-composer-semantic-map-handoff.js";
import { createLocationPreviewModelFromMapRequest } from "./location-composer-preview.js";

function createRequest(overrides = {}) {
  return {
    schemaVersion: "dark-places-semantic-map-request-v1",
    source: "semantic-map-intent",
    seed: "selected-map-seed",
    title: "The Bone Chapel",
    context: "Crypt",
    mapType: "Crypt",
    requiredRegions: [
      {
        id: "room-1",
        sourceRegionId: "region-1",
        label: "Threshold",
        role: "entrance",
        level: 0,
        shape: "hall",
        size: "medium",
        roomArchetype: "processional-crypt-hall",
        metadata: { assignedComponentIds: ["component-a"] },
      },
      {
        id: "room-2",
        sourceRegionId: "region-2",
        label: "Reliquary",
        role: "setpiece",
        level: -1,
        shape: "circle",
        size: "large",
        metadata: { assignedComponentIds: [] },
      },
    ],
    connections: [
      { id: "edge-1-2", from: "room-1", to: "room-2", kind: "main" },
    ],
    componentPlacements: [],
    metadata: { moduleId: "sedlec-ossuary" },
    ...overrides,
  };
}

function createManualOverrides() {
  return {
    roomPositions: { "room-1": { x: 12, y: 8 } },
    doorAnchors: { "edge-1-2:from": { side: "east", cell: { x: 20, y: 10 } } },
    doorTypes: { "edge-1-2:from": "locked" },
    levels: {
      regions: { "room-2": -1 },
      corridors: { "edge-1-2": { level: -1 } },
      stairs: {
        "edge-1-2:from": {
          type: "stairs",
          direction: "down",
          placement: "from-endpoint",
        },
      },
    },
    stairMarkers: {
      "stair-marker:edge-1-2:0": {
        corridorId: "edge-1-2",
        markerIndex: 0,
        pathIndex: 2,
        normalizedOffset: 0.5,
        cell: { x: 28, y: 14 },
      },
    },
    mapAccesses: { "room-1": { side: "west" } },
    corridorJunctions: { "edge-1-2": [{ x: 24, y: 12 }] },
    corridorWaypoints: { "edge-1-2": [{ x: 30, y: 16 }] },
    corridorTypes: { "edge-1-2": "secret" },
    customConnections: [
      { id: "manual-edge", from: "room-1", to: "room-2", kind: "manual" },
    ],
    roomStyles: {
      "room-1": {
        shape: "octagon",
        sizePreset: "Large",
        roomType: "chamber",
        roomArchetype: "manual-reliquary",
      },
    },
    deletedConnections: ["edge-obsolete"],
    manualConnectionSequence: 3,
  };
}

describe("Dark Places semantic map handoff", () => {
  it("keeps the handoff boundary pure and free from React or DOM access", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "features/darken-location/composer/model/location-composer-semantic-map-handoff.js",
      ),
      "utf8",
    );

    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/(^|[^\w$?.-])document\s*(?:\.|\?\.)/m);
    expect(source).not.toMatch(/(^|[^\w$?.-])window\s*(?:\.|\?\.)/m);
  });

  it("selects the semantic request while keeping every manual edit in a separate overlay", () => {
    const semanticRequest = createRequest({
      manualOverrides: { roomPositions: { "room-1": { x: 999, y: 999 } } },
    });
    const manualOverrides = createManualOverrides();
    const beforeRequest = JSON.stringify(semanticRequest);
    const beforeOverrides = JSON.stringify(manualOverrides);
    const handoff = createDarkPlacesSemanticMapHandoff({
      semanticPreview: {
        valid: true,
        compilerFingerprint: "semantic-compiler-key",
        mapRequest: semanticRequest,
      },
      fallbackMapRequest: createRequest({
        source: "darken-location",
        visualStyle: "ink",
        requiredRegions: semanticRequest.requiredRegions.map((room) =>
          room.id === "room-1"
            ? {
                ...room,
                size: "Large",
                roomArchetype: "fallback-reliquary",
                roomDesign: { shape: { kind: "octagon" } },
              }
            : room,
        ),
      }),
      manualOverrides,
    });

    expect(handoff.schemaVersion).toBe(
      DARK_PLACES_SEMANTIC_MAP_HANDOFF_SCHEMA_VERSION,
    );
    expect(handoff.mode).toBe("semantic");
    expect(handoff.mapRequest.source).toBe("semantic-map-intent");
    expect(handoff.mapRequest.seed).toBe("selected-map-seed");
    expect(handoff.mapRequest.visualStyle).toBe("ink");
    expect(handoff.mapRequest.requiredRegions[0]).toMatchObject({
      size: "Large",
      roomArchetype: "fallback-reliquary",
      roomDesign: { shape: { kind: "octagon" } },
    });
    expect(handoff.mapRequest).not.toHaveProperty("manualOverrides");
    expect(handoff.manualOverrides).toMatchObject(manualOverrides);
    expect(handoff.manualOverrides.roomStyles["room-1"]).toMatchObject({
      shape: "octagon",
      sizePreset: "Large",
      roomArchetype: "manual-reliquary",
    });
    expect(Object.isFrozen(handoff)).toBe(true);
    expect(Object.isFrozen(handoff.manualOverrides.roomPositions)).toBe(true);
    expect(JSON.stringify(semanticRequest)).toBe(beforeRequest);
    expect(JSON.stringify(manualOverrides)).toBe(beforeOverrides);
  });

  it("feeds the semantic request and manual overlay into the live map pipeline", () => {
    const manualOverrides = {
      roomPositions: { "room-1": { x: 8, y: 7 } },
      roomStyles: {
        "room-1": {
          shape: "circle",
          sizePreset: "Large",
          roomType: "chamber",
        },
      },
      corridorTypes: { "edge-1-2": "secret" },
      doorTypes: { "edge-1-2:from": "locked" },
    };
    const handoff = createDarkPlacesSemanticMapHandoff({
      semanticPreview: { valid: true, mapRequest: createRequest() },
      fallbackMapRequest: createRequest({ source: "darken-location" }),
      manualOverrides,
    });
    const livePreview = createLocationPreviewModelFromMapRequest(
      handoff.mapRequest,
      handoff.manualOverrides,
    );
    const editedRoom = livePreview.previewResult.generatedMap.regions.find(
      (room) => room.id === "room-1",
    );

    expect(livePreview.previewResult.error).toBe("");
    expect(livePreview.mapRequest.source).toBe("semantic-map-intent");
    expect(editedRoom).toMatchObject({
      id: "room-1",
      shape: "circle",
      size: "Large",
    });
    expect(
      livePreview.previewResult.generatedMap.config.manualRoomPositions["room-1"],
    ).toEqual({ x: 8, y: 7 });
    expect(
      livePreview.previewResult.generatedMap.corridors.some(
        (corridor) => corridor.corridorType === "secret",
      ),
    ).toBe(true);
  });

  it("falls back safely when semantic compilation is unavailable", () => {
    const fallback = createRequest({ source: "darken-location", seed: "fallback-seed" });
    const handoff = createDarkPlacesSemanticMapHandoff({
      semanticPreview: { valid: false, mapRequest: null },
      fallbackMapRequest: fallback,
      manualOverrides: createManualOverrides(),
    });

    expect(handoff.mode).toBe("legacy-fallback");
    expect(handoff.mapRequest.seed).toBe("fallback-seed");
    expect(handoff.manualOverrides.roomPositions["room-1"]).toEqual({ x: 12, y: 8 });
  });

  it("uses an emitted semantic map request even when unrelated document diagnostics remain", () => {
    const handoff = createDarkPlacesSemanticMapHandoff({
      semanticPreview: {
        valid: false,
        diagnostics: [
          { severity: "error", code: "document.duplicate-impression" },
        ],
        mapRequest: createRequest(),
      },
      fallbackMapRequest: createRequest({ source: "darken-location" }),
    });

    expect(handoff.mode).toBe("semantic");
    expect(handoff.mapRequest.source).toBe("semantic-map-intent");
  });

  it("classifies topology, content, metadata and room-constraint changes explicitly", () => {
    const baseline = createRequest();
    const titleOnly = createRequest({ title: "A Renamed Chapel" });
    const markersOnly = createRequest({
      componentPlacements: [{ id: "marker-a", regionId: "room-1" }],
    });
    const reshaped = createRequest({
      requiredRegions: baseline.requiredRegions.map((room) =>
        room.id === "room-2" ? { ...room, shape: "shaft" } : room,
      ),
    });

    expect(classifyDarkPlacesSemanticMapChange(baseline, baseline).effect).toBe("none");
    expect(classifyDarkPlacesSemanticMapChange(baseline, titleOnly)).toMatchObject({
      topologyChanged: false,
      contentChanged: true,
      metadataChanged: false,
      roomConstraintsInvalidated: false,
      effect: "update-content",
    });
    expect(classifyDarkPlacesSemanticMapChange(baseline, markersOnly)).toMatchObject({
      topologyChanged: false,
      contentChanged: false,
      metadataChanged: true,
      effect: "update-metadata-markers",
    });
    expect(classifyDarkPlacesSemanticMapChange(baseline, reshaped)).toMatchObject({
      topologyChanged: true,
      roomConstraintsInvalidated: true,
      invalidatedRoomIds: ["region-2"],
      effect: "regenerate-topology",
    });
  });

  it("keeps request fingerprints stable across object key order", () => {
    const first = createDarkPlacesSemanticMapHandoff({
      semanticPreview: { valid: true, mapRequest: createRequest() },
      manualOverrides: createManualOverrides(),
    });
    const reordered = Object.fromEntries(
      Object.entries(createRequest()).reverse(),
    );
    const second = createDarkPlacesSemanticMapHandoff({
      semanticPreview: { valid: true, mapRequest: reordered },
      manualOverrides: createManualOverrides(),
    });

    expect(second.requestFingerprint).toBe(first.requestFingerprint);
    expect(second.topologyFingerprint).toBe(first.topologyFingerprint);
  });
});
