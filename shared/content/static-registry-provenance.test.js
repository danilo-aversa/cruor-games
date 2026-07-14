import { describe, expect, it } from "vitest";
import {
  STATIC_CONTENT_COLLISION_REPORT,
  STATIC_CONTENT_PACKS,
  STATIC_CONTENT_PACK_PROVENANCE,
  STATIC_CONTENT_REGISTRY,
  STATIC_LEGACY_MIGRATION_REPORT,
  STATIC_RETIRED_CONTENT_PACKS,
} from "./static-registry.js";

describe("static content registry provenance", () => {
  it("retires the redundant legacy pack without changing active registry ownership", () => {
    expect(STATIC_CONTENT_PACKS.map((pack) => pack.id)).not.toContain("legacy-darken-location");
    expect(STATIC_RETIRED_CONTENT_PACKS.map((pack) => pack.id)).toContain("legacy-darken-location");

    const legacyPack = STATIC_LEGACY_MIGRATION_REPORT.packs.find(
      (pack) => pack.id === "legacy-darken-location",
    );
    expect(legacyPack).toMatchObject({
      activeEntries: 0,
      removable: true,
    });
    expect(STATIC_LEGACY_MIGRATION_REPORT.summary.canRemoveAllLegacyPacks).toBe(true);
  });

  it("annotates every active registry entry with the actual first winning pack", () => {
    for (const collectionName of [
      "workflows",
      "slots",
      "components",
      "sourceAnchors",
      "inspirations",
      "taxonomies",
    ]) {
      for (const entry of STATIC_CONTENT_REGISTRY[collectionName]) {
        const primaryPack = STATIC_CONTENT_PACK_PROVENANCE.getPrimaryPackForEntry(
          collectionName,
          entry,
        );
        expect(entry.contentProvenance?.primaryPackId).toBe(primaryPack?.id);
        expect(entry.contentProvenance?.mergePolicy).toBe("first-pack-wins");
      }
    }
  });

  it("keeps collision winners aligned with active registry provenance", () => {
    for (const collision of STATIC_CONTENT_COLLISION_REPORT.collisions) {
      const entry = STATIC_CONTENT_REGISTRY[collision.collection].find(
        (candidate) => candidate.id === collision.entryId,
      );
      expect(entry?.contentProvenance?.primaryPackId).toBe(collision.winnerPackId);
      expect(entry?.contentProvenance?.shadowedPackIds).toEqual(collision.shadowedPackIds);
    }
  });
});
