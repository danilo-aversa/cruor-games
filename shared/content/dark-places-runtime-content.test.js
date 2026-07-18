import { describe, expect, it } from "vitest";
import {
  DARK_PLACES_COMPOSER_INPUT_SCHEMA_VERSION,
  DARK_PLACES_GRANULAR_SLOT_IDS,
  DARK_PLACES_RUNTIME_CONTENT_SCHEMA_VERSION,
  STATIC_SEMANTIC_CONTENT_PACKS,
  createContentRegistry,
  createDarkPlacesRuntimeContentResolver,
  getDarkPlacesSemanticModuleReference,
  getStaticContentRegistry,
  normalizeDarkPlacesComposerInput,
  resolveDarkPlacesRuntimeContent,
  validateDarkPlacesComposerInput,
} from "./content.index.js";

function getSemanticPack(moduleId) {
  return STATIC_SEMANTIC_CONTENT_PACKS.find((pack) =>
    pack.modules.some((module) => module.id === moduleId),
  );
}

function createInput(moduleId = "sedlec-ossuary", overrides = {}) {
  const pack = getSemanticPack(moduleId);
  return {
    schemaVersion: DARK_PLACES_COMPOSER_INPUT_SCHEMA_VERSION,
    moduleId,
    moduleVersion: pack.version,
    sourceAnchors: [moduleId],
    context: [],
    horror: [],
    intrusion: [],
    seed: "phase-2-runtime-seed",
    rooms: [{ id: "room-1", role: "entrance" }],
    mapState: { mode: "theme" },
    selectedGranularComponents: [],
    slotAssignments: {},
    locks: {},
    userOverrides: {},
    provenance: { source: "phase-2-test" },
    ...overrides,
  };
}

describe("Dark Places canonical Composer input", () => {
  it("normalizes structured selections without retaining transient assignment clocks", () => {
    const source = createInput("sedlec-ossuary", {
      moduleId: { id: "Sedlec Ossuary" },
      sourceAnchors: new Set([{ label: "Sedlec Ossuary" }]),
      context: { value: "Crypt" },
      horrors: new Set(["Religious Horror"]),
      intrusion: { title: "Medium" },
      selectedGranularComponents: [
        { id: "Bone Chapel Counts the Dead", slots: ["horrorPremise"] },
      ],
      slotAssignments: {
        hazard: [
          {
            componentId: "Loose Bone Chandelier",
            regionId: "Room 1",
            addedAt: 123456,
          },
        ],
      },
      locks: { componentIds: new Set(["Loose Bone Chandelier"]) },
    });

    const normalized = normalizeDarkPlacesComposerInput(source);

    expect(normalized).toMatchObject({
      schemaVersion: DARK_PLACES_COMPOSER_INPUT_SCHEMA_VERSION,
      moduleId: "sedlec-ossuary",
      sourceAnchors: ["sedlec-ossuary"],
      context: ["crypt"],
      horror: ["religious-horror"],
      intrusion: ["medium"],
    });
    expect(normalized.slotAssignments.hazard[0]).toEqual({
      componentId: "loose-bone-chandelier",
      slotId: "hazard",
      strategy: "append",
      scope: "region",
      regionId: "room-1",
      targetComponentIds: [],
      targetBlockIds: [],
    });
    expect(JSON.stringify(normalized)).not.toContain("addedAt");
    expect(Object.isFrozen(normalized)).toBe(true);
    expect(Object.isFrozen(normalized.rooms)).toBe(true);
    expect(validateDarkPlacesComposerInput(normalized)).toEqual([]);
    expect(source.slotAssignments.hazard[0].addedAt).toBe(123456);
  });
});

describe("Dark Places runtime content resolver", () => {
  it("returns a version-pinned module reference by module id or Source Anchor", () => {
    expect(
      getDarkPlacesSemanticModuleReference({ moduleId: "sedlec-ossuary" }),
    ).toMatchObject({
      moduleId: "sedlec-ossuary",
      moduleVersion: "0.2.0-phase8-approved1",
      packId: "sedlec-ossuary-semantic-v2",
      sourceAnchorId: "sedlec-ossuary",
    });
    expect(
      getDarkPlacesSemanticModuleReference({
        moduleId: "generic-dark-location",
        sourceAnchors: new Set([{ label: "Sedlec Ossuary" }]),
      }),
    ).toMatchObject({ moduleId: "sedlec-ossuary" });
    expect(
      getDarkPlacesSemanticModuleReference({
        moduleId: "missing",
        sourceAnchors: ["missing"],
      }),
    ).toBeNull();
  });

  it("resolves the Sedlec semantic baseline and the exact production granular pools", () => {
    const result = resolveDarkPlacesRuntimeContent(
      createInput("sedlec-ossuary", {
        context: [{ label: "Crypt" }],
        horror: new Set(["Religious Horror"]),
        intrusion: { value: "Medium" },
      }),
    );

    expect(result.schemaVersion).toBe(
      DARK_PLACES_RUNTIME_CONTENT_SCHEMA_VERSION,
    );
    expect(result.valid).toBe(true);
    expect(result.semanticBaseline.module.id).toBe("sedlec-ossuary");
    expect(result.semanticBaseline.components).toHaveLength(10);
    expect(Object.keys(result.semanticBaseline.componentsBySemanticType)).toEqual([
      "global-rule",
      "place-identity",
      "read-aloud-profile",
      "recurring-sign",
      "sensory-profile",
      "session-guide",
      "site-atmosphere",
    ]);
    expect(
      Object.fromEntries(
        Object.entries(result.granularCandidatePools).map(([slotId, entries]) => [
          slotId,
          entries.length,
        ]),
      ),
    ).toEqual({
      clue: 2,
      encounterTwist: 3,
      hazard: 3,
      horrorPremise: 3,
      reward: 3,
      sensoryLayer: 2,
      visibleAnomaly: 1,
    });
    expect(result.locationRegions).toHaveLength(3);
    expect(result.provenance.semanticPack).toMatchObject({
      packId: "sedlec-ossuary-semantic-v2",
      packVersion: getSemanticPack("sedlec-ossuary").version,
    });
    expect(result.provenance.granularComponents.length).toBeGreaterThan(0);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("resolves every migrated semantic module through the same repository boundary", () => {
    expect(STATIC_SEMANTIC_CONTENT_PACKS).toHaveLength(14);
    STATIC_SEMANTIC_CONTENT_PACKS.forEach((pack) => {
      const module = pack.modules[0];
      const result = resolveDarkPlacesRuntimeContent(createInput(module.id));
      expect(result.valid).toBe(true);
      expect(result.semanticBaseline.module.id).toBe(module.id);
      expect(result.semanticBaseline.pack.id).toBe(pack.id);
      expect(result.semanticBaseline.components).toHaveLength(10);
      expect(Object.keys(result.granularCandidatePools)).toEqual(
        [...DARK_PLACES_GRANULAR_SLOT_IDS].sort(),
      );
    });
  });

  it("is independent from registry and semantic-pack iteration order", () => {
    const registry = getStaticContentRegistry();
    const reversedRegistry = createContentRegistry({
      workflows: [...registry.workflows].reverse(),
      slots: [...registry.slots].reverse(),
      components: [...registry.components].reverse(),
      sourceAnchors: [...registry.sourceAnchors].reverse(),
      inspirations: [...registry.inspirations].reverse(),
      taxonomies: [...registry.taxonomies].reverse(),
    });
    const reversedResolver = createDarkPlacesRuntimeContentResolver({
      getRegistry: () => reversedRegistry,
      getSemanticPacks: () => [...STATIC_SEMANTIC_CONTENT_PACKS].reverse(),
    });
    const input = createInput("sedlec-ossuary", {
      context: ["crypt"],
      horror: ["religious-horror"],
      intrusion: ["medium"],
    });

    expect(JSON.stringify(reversedResolver(input))).toBe(
      JSON.stringify(resolveDarkPlacesRuntimeContent(input)),
    );
  });

  it("returns Monster ownership as external capability links without graft data", () => {
    const result = resolveDarkPlacesRuntimeContent(createInput("wolf-spiders"));

    expect(result.externalCapabilityLinks).toEqual([
      expect.objectContaining({
        capability: "monster-composer",
        expectedEntries: 32,
        ownership: "external-modern-source",
        sourceAnchorId: "wolf-spiders",
        sourceFile: "features/monster-composer/data/monster-grafts.js",
      }),
    ]);
    expect(JSON.stringify(result)).not.toContain('"contentType":"monster-graft"');
  });

  it("resolves assignment-only selections and reports unknown component ids", () => {
    const validSelection = resolveDarkPlacesRuntimeContent(
      createInput("sedlec-ossuary", {
        slotAssignments: {
          horrorPremise: ["bone-chapel-counts-the-dead"],
        },
      }),
    );
    expect(validSelection.resolvedGranularSelection).toHaveLength(1);
    expect(validSelection.resolvedGranularSelection[0].component.id).toBe(
      "bone-chapel-counts-the-dead",
    );
    expect(validSelection.hybridOverridePlan).toMatchObject({
      schemaVersion: "cruor-dark-places-hybrid-override-v1",
      mapScoped: [
        {
          override: {
            componentId: "bone-chapel-counts-the-dead",
            slotId: "horrorPremise",
            strategy: "append",
            scope: "map",
            regionId: "",
          },
        },
      ],
      regionScoped: {},
    });
    expect(
      validSelection.hybridOverridePlan.mapScoped[0].override
        .targetComponentIds,
    ).toEqual(expect.arrayContaining(["ossuary-litany"]));

    const missingSelection = resolveDarkPlacesRuntimeContent(
      createInput("sedlec-ossuary", {
        selectedGranularComponents: ["missing-component"],
      }),
    );
    expect(missingSelection.valid).toBe(false);
    expect(missingSelection.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "runtime.granular-component-not-found",
          severity: "error",
        }),
      ]),
    );
  });

  it("keeps map-scoped and region-scoped override plans separate", () => {
    const result = resolveDarkPlacesRuntimeContent(
      createInput("sedlec-ossuary", {
        slotAssignments: {
          horrorPremise: [
            {
              componentId: "bone-chapel-counts-the-dead",
              strategy: "replace",
            },
          ],
          clue: [
            {
              componentId: "sedlec-bone-has-a-name",
              strategy: "append",
              regionId: "room-2",
            },
          ],
        },
      }),
    );

    expect(result.hybridOverridePlan.mapScoped).toHaveLength(1);
    expect(result.hybridOverridePlan.mapScoped[0].override).toMatchObject({
      strategy: "replace",
      scope: "map",
      regionId: "",
    });
    expect(Object.keys(result.hybridOverridePlan.regionScoped)).toEqual([
      "room-2",
    ]);
    expect(result.hybridOverridePlan.regionScoped["room-2"][0].override).toMatchObject({
      strategy: "append",
      scope: "region",
      regionId: "room-2",
    });
  });

  it("promotes canonical slot locks into explicit lock strategies", () => {
    const result = resolveDarkPlacesRuntimeContent(
      createInput("sedlec-ossuary", {
        slotAssignments: {
          horrorPremise: ["bone-chapel-counts-the-dead"],
        },
        locks: { slotIds: ["horrorPremise"] },
      }),
    );

    expect(result.hybridOverridePlan.mapScoped[0].override.strategy).toBe(
      "lock",
    );
  });

  it("lets the explicit assignment win for multi-slot components", () => {
    const component = getStaticContentRegistry().getComponent(
      "blistering-yellow-cloud",
    );
    const result = resolveDarkPlacesRuntimeContent(
      createInput("mustard-gas", {
        selectedGranularComponents: [component],
        slotAssignments: {
          sensoryLayer: [
            {
              componentId: component.id,
              slotId: "sensoryLayer",
              strategy: "append",
            },
          ],
        },
      }),
    );

    expect(result.valid).toBe(true);
    expect(result.resolvedGranularSelection).toHaveLength(1);
    expect(result.resolvedGranularSelection[0].selection).toMatchObject({
      componentId: component.id,
      slotId: "sensoryLayer",
      scope: "map",
    });
  });

  it("fails closed for unknown modules and semantic pack version drift", () => {
    const unknown = resolveDarkPlacesRuntimeContent({
      ...createInput("sedlec-ossuary"),
      moduleId: "missing-module",
    });
    expect(unknown.valid).toBe(false);
    expect(unknown.semanticBaseline).toBeNull();
    expect(unknown.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "runtime.semantic-module-not-found" }),
      ]),
    );

    const stale = resolveDarkPlacesRuntimeContent(
      createInput("sedlec-ossuary", { moduleVersion: "0.1.0" }),
    );
    expect(stale.valid).toBe(false);
    expect(stale.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "runtime.semantic-module-version-mismatch",
        }),
      ]),
    );
  });
});
