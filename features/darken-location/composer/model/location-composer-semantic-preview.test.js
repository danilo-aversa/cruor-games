import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { compileDarkPlacesSemanticLocation } from "../../compiler/index.js";
import {
  DARK_PLACES_COMPOSER_SEMANTIC_PREVIEW_SCHEMA_VERSION,
  createDarkPlacesComposerSemanticPreparation,
  createDarkPlacesComposerSemanticPreviewMemoizer,
} from "./location-composer-semantic-preview.js";

const LEGACY_DOCUMENT = JSON.parse(
  readFileSync(
    resolve(
      process.cwd(),
      "tests/fixtures/dark-places-semantic-v2/sedlec-ossuary/location-document-v1.json",
    ),
    "utf8",
  ),
);

function createState(overrides = {}) {
  return {
    title: LEGACY_DOCUMENT.meta.title,
    context: "Crypt",
    horrors: new Set(["Religious Horror"]),
    horror: "Religious Horror",
    sourceAnchors: new Set(["Sedlec Ossuary"]),
    intrusion: "Medium",
    seed: "phase3-live-semantic-preview",
    dungeonThemeId: "sedlec-ossuary",
    selectedComponentIds: new Set(),
    slotAssignments: {},
    mapManualOverrides: null,
    ...overrides,
  };
}

function createMapRequest(state) {
  return {
    source: "darken-location",
    seed: state.seed,
    title: state.title,
    context: state.context,
    mapType: "Crypt",
    requiredRegions: LEGACY_DOCUMENT.rooms.map((room) => ({
      id: room.id,
      sourceRegionId: room.sourceRegionId || room.id,
      name: room.name,
      role: room.role,
      level: room.level,
      shape: room.shape,
    })),
    connections: LEGACY_DOCUMENT.map.connections.map((connection) => ({
      id: connection.id,
      from: connection.fromRoomId,
      to: connection.toRoomId,
      kind: connection.kind,
      secret: connection.secret,
      locked: connection.locked,
    })),
    metadata: {},
  };
}

function createPreparation({ state = createState(), ...overrides } = {}) {
  return createDarkPlacesComposerSemanticPreparation({
    state,
    digest: { filledSlots: 0, totalSlots: 7 },
    mapRequest: createMapRequest(state),
    generatedMapPreview: null,
    ...overrides,
  });
}

describe("Dark Places live semantic preview", () => {
  it("keeps the Composer compiler boundary free from React and DOM access", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "features/darken-location/composer/model/location-composer-semantic-preview.js",
      ),
      "utf8",
    );

    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/(^|[^\w$?.-])document\s*(?:\.|\?\.)/m);
    expect(source).not.toMatch(/(^|[^\w$?.-])window\s*(?:\.|\?\.)/m);
    expect(source).not.toContain("createSessionStateFromLocationDocumentV1");
    expect(source).not.toContain("createLocationDocument");
    expect(source).not.toContain("legacyDocument");
  });

  it("compiles the real Sedlec v2 baseline into the Composer preview model", () => {
    const preparation = createPreparation();
    const preview = createDarkPlacesComposerSemanticPreviewMemoizer()(
      preparation,
    );

    expect(preview.schemaVersion).toBe(
      DARK_PLACES_COMPOSER_SEMANTIC_PREVIEW_SCHEMA_VERSION,
    );
    expect(preview.valid).toBe(true);
    expect(preview.input).toMatchObject({
      moduleId: "sedlec-ossuary",
      moduleVersion: "0.2.0-phase8-approved1",
      context: ["crypt"],
      horror: ["religious-horror"],
      intrusion: ["medium"],
    });
    expect(preview.baseline.components).toHaveLength(10);
    expect(preview.compilerInput.session.selectedComponentIds).toHaveLength(10);
    expect(preview.document.schemaVersion).toBe("cruor-location-document-v2");
    expect(preview.document.rooms).toHaveLength(5);
    expect(preview.mapRequest.source).toBe("semantic-map-intent");
    expect(preview.provenance.runtime.semanticPack.packId).toBe(
      "sedlec-ossuary-semantic-v2",
    );
    expect(preview.diagnostics).toEqual([]);
    expect(Object.isFrozen(preview)).toBe(true);
    expect(Object.isFrozen(preview.provenance)).toBe(true);
  });

  it("applies granular selections after the memoized semantic baseline", () => {
    const preparation = createPreparation({
      state: createState({
        selectedComponentIds: new Set(["bone-chapel-counts-the-dead"]),
        slotAssignments: {
          horrorPremise: [
            {
              componentId: "bone-chapel-counts-the-dead",
              slotId: "horrorPremise",
              regionId: "",
              addedAt: 1234,
            },
          ],
        },
      }),
      selectedComponents: [
        {
          id: "bone-chapel-counts-the-dead",
          slots: ["horrorPremise"],
        },
      ],
    });
    const preview = createDarkPlacesComposerSemanticPreviewMemoizer()(
      preparation,
    );

    expect(preview.input.selectedGranularComponents).toEqual([
      {
        componentId: "bone-chapel-counts-the-dead",
        slotId: "horrorPremise",
        strategy: "append",
        scope: "map",
        regionId: "",
        targetComponentIds: [],
        targetBlockIds: [],
      },
    ]);
    expect(JSON.stringify(preview.input)).not.toContain("addedAt");
    expect(preview.runtimeContent.resolvedGranularSelection).toHaveLength(1);
    expect(preview.compilerInput.session.selectedComponentIds).not.toContain(
      "bone-chapel-counts-the-dead",
    );
    preview.compilerInput.session.locationSeed.rooms.forEach((room) => {
      expect(room.hazards).toEqual([]);
      expect(room.clues).toEqual([]);
      expect(room.encounterTwists).toEqual([]);
      expect(room.rewards).toEqual([]);
    });
    expect(preview.overrides.operations).toEqual([
      expect.objectContaining({
        componentId: "bone-chapel-counts-the-dead",
        strategy: "append",
        scope: "map",
        targetPath: "siteWide.stakesAndConsequences",
      }),
    ]);
    expect(preview.document.siteWide.stakesAndConsequences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceComponentId: "bone-chapel-counts-the-dead",
        }),
      ]),
    );
  });

  it("memoizes compiler work by a deterministic semantic fingerprint", () => {
    const compileSpy = vi.fn(compileDarkPlacesSemanticLocation);
    const getPreview = createDarkPlacesComposerSemanticPreviewMemoizer({
      compileSemanticLocation: compileSpy,
    });
    const first = createPreparation();
    const uiOnlyChange = createPreparation({
      state: createState({
        activeSlot: "clue",
        activeRegionId: "room-4",
        mapManualOverrides: {
          roomPositions: { "room-1": { x: 22, y: 18 } },
        },
      }),
    });

    const firstPreview = getPreview(first);
    const secondPreview = getPreview(uiOnlyChange);

    expect(uiOnlyChange.compilerFingerprint).toBe(first.compilerFingerprint);
    expect(uiOnlyChange.inputFingerprint).not.toBe(first.inputFingerprint);
    expect(compileSpy).toHaveBeenCalledTimes(1);
    expect(secondPreview.baselineCompileResult).toBe(
      firstPreview.baselineCompileResult,
    );
    expect(secondPreview.compileResult).toStrictEqual(
      firstPreview.compileResult,
    );
    expect(secondPreview.input.mapState.manualOverrides).toEqual({
      roomPositions: { "room-1": { x: 22, y: 18 } },
    });

    const granularChange = createPreparation({
      state: createState({
        selectedComponentIds: new Set(["bone-chapel-counts-the-dead"]),
        slotAssignments: {
          horrorPremise: [
            {
              componentId: "bone-chapel-counts-the-dead",
              slotId: "horrorPremise",
              strategy: "append",
            },
          ],
        },
      }),
      selectedComponents: [
        {
          id: "bone-chapel-counts-the-dead",
          slots: ["horrorPremise"],
        },
      ],
    });
    const granularPreview = getPreview(granularChange);
    expect(granularChange.compilerFingerprint).toBe(first.compilerFingerprint);
    expect(granularChange.hybridOverrideFingerprint).not.toBe(
      first.hybridOverrideFingerprint,
    );
    expect(compileSpy).toHaveBeenCalledTimes(1);
    expect(
      granularPreview.document.siteWide.stakesAndConsequences.some(
        (block) =>
          block.sourceComponentId === "bone-chapel-counts-the-dead",
      ),
    ).toBe(true);

    getPreview(
      createPreparation({ state: createState({ seed: "changed-seed" }) }),
    );
    expect(compileSpy).toHaveBeenCalledTimes(2);
  });

  it("does not mutate the Composer draft or structural map request", () => {
    const state = createState({
      slotAssignments: {
        hazard: [
          {
            componentId: "loose-bone-chandelier",
            slotId: "hazard",
            regionId: "room-1",
            addedAt: 99,
          },
        ],
      },
    });
    const beforeState = JSON.stringify({
      ...state,
      horrors: [...state.horrors],
      sourceAnchors: [...state.sourceAnchors],
      selectedComponentIds: [...state.selectedComponentIds],
    });
    const mapRequest = createMapRequest(state);
    const beforeMapRequest = JSON.stringify(mapRequest);

    createDarkPlacesComposerSemanticPreviewMemoizer()(
      createPreparation({ state, mapRequest }),
    );

    expect(
      JSON.stringify({
        ...state,
        horrors: [...state.horrors],
        sourceAnchors: [...state.sourceAnchors],
        selectedComponentIds: [...state.selectedComponentIds],
      }),
    ).toBe(beforeState);
    expect(JSON.stringify(mapRequest)).toBe(beforeMapRequest);
  });

  it("fails closed with diagnostics when no semantic module can be resolved", () => {
    const preparation = createPreparation({
      state: createState({
        dungeonThemeId: "unknown-theme",
        sourceAnchors: new Set(["Unknown Source"]),
      }),
    });
    const preview = createDarkPlacesComposerSemanticPreviewMemoizer()(
      preparation,
    );

    expect(preview.valid).toBe(false);
    expect(preview.document).toBeNull();
    expect(preview.mapRequest).toBeNull();
    expect(preview.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "runtime.semantic-module-not-found",
          severity: "error",
        }),
      ]),
    );
  });
});
