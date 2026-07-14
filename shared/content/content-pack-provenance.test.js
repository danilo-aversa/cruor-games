import { describe, expect, it } from "vitest";
import { createContentPack } from "./content-pack-schema.js";
import {
  annotateRegistryDataWithContentPackProvenance,
  buildContentPackProvenance,
} from "./content-pack-provenance.js";

function pack(id, components, { legacy = false } = {}) {
  return createContentPack({
    id,
    title: id,
    status: "published",
    tags: legacy ? ["legacy-adapter"] : [],
    metadata: {
      registryRole: legacy ? "legacy-adapter" : "canonical",
    },
    collections: {
      workflows: [],
      slots: [],
      components,
      sourceAnchors: [],
      inspirations: [],
      taxonomies: [],
    },
  });
}

describe("content pack provenance", () => {
  it("uses the same first-pack-wins rule as mergeContentPacks", () => {
    const first = pack("first-pack", [{ id: "shared", title: "First" }]);
    const second = pack("second-pack", [{ id: "shared", title: "Second" }]);
    const provenance = buildContentPackProvenance([first, second]);

    expect(provenance.getPrimaryPackForEntry("components", "shared")?.id).toBe("first-pack");
    expect(provenance.getPackIdsForEntry("components", "shared")).toEqual([
      "first-pack",
      "second-pack",
    ]);
    expect(provenance.getCollisionForEntry("components", "shared")).toMatchObject({
      winnerPackId: "first-pack",
      shadowedPackIds: ["second-pack"],
      definitionsEquivalent: false,
      resolution: "kept-first-pack-entry",
    });
  });

  it("annotates merged registry entries with authoritative pack ownership", () => {
    const canonical = pack("canonical-pack", [{ id: "shared", title: "Canonical" }]);
    const legacy = pack(
      "legacy-pack",
      [
        { id: "shared", title: "Legacy duplicate" },
        {
          id: "fallback-only",
          title: "Legacy fallback",
          migration: { status: "normalized", warnings: [] },
        },
      ],
      { legacy: true },
    );
    const provenance = buildContentPackProvenance([canonical, legacy]);
    const registryData = annotateRegistryDataWithContentPackProvenance(
      {
        workflows: [],
        slots: [],
        components: [
          { id: "shared", title: "Canonical" },
          { id: "fallback-only", title: "Legacy fallback" },
        ],
        sourceAnchors: [],
        inspirations: [],
        taxonomies: [],
      },
      provenance,
    );

    expect(registryData.components[0].contentProvenance).toMatchObject({
      primaryPackId: "canonical-pack",
      shadowedPackIds: ["legacy-pack"],
      hasCollision: true,
      isLegacy: false,
      migrationStatus: "current",
    });
    expect(registryData.components[1].contentProvenance).toMatchObject({
      primaryPackId: "legacy-pack",
      hasCollision: false,
      isLegacy: true,
      isLegacyDerived: true,
      migrationStatus: "normalized",
    });
  });

  it("reports whether legacy packs still contain active fallback entries", () => {
    const canonical = pack("canonical-pack", [{ id: "shared", title: "Canonical" }]);
    const legacy = pack(
      "legacy-pack",
      [
        { id: "shared", title: "Legacy duplicate" },
        { id: "fallback-only", title: "Legacy fallback" },
      ],
      { legacy: true },
    );
    const provenance = buildContentPackProvenance([canonical, legacy]);
    const report = provenance.getLegacyMigrationReport();

    expect(report.summary).toMatchObject({
      legacyPacks: 1,
      activeEntries: 1,
      shadowedEntries: 1,
      canRemoveAllLegacyPacks: false,
    });
    expect(report.packs[0]).toMatchObject({
      id: "legacy-pack",
      activeEntries: 1,
      shadowedEntries: 1,
      removable: false,
    });
  });
});
