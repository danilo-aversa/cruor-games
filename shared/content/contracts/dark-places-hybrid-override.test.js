import { describe, expect, it } from "vitest";
import {
  DARK_PLACES_HYBRID_OVERRIDE_SCHEMA_VERSION,
  DARK_PLACES_HYBRID_OVERRIDE_STRATEGIES,
  normalizeDarkPlacesHybridOverride,
  parseDarkPlacesHybridOverride,
} from "./dark-places-hybrid-override.js";

describe("Dark Places hybrid override contract", () => {
  it.each(DARK_PLACES_HYBRID_OVERRIDE_STRATEGIES)(
    "normalizes the %s strategy as an explicit map-scoped directive",
    (strategy) => {
      const override = normalizeDarkPlacesHybridOverride({
        componentId: "Bone Chapel Counts the Dead",
        slotId: "horrorPremise",
        strategy,
      });

      expect(override).toMatchObject({
        schemaVersion: DARK_PLACES_HYBRID_OVERRIDE_SCHEMA_VERSION,
        componentId: "bone-chapel-counts-the-dead",
        slotId: "horrorPremise",
        strategy,
        scope: "map",
        regionId: "",
      });
      expect(Object.isFrozen(override)).toBe(true);
      expect(parseDarkPlacesHybridOverride(override).issues).toEqual([]);
    },
  );

  it("keeps region scope and targets structurally distinct from map scope", () => {
    const regionOverride = normalizeDarkPlacesHybridOverride({
      componentId: "Whispering Reliquary",
      slotId: "clue",
      strategy: "replace",
      regionId: "Room 4",
      targetComponentIds: ["Ossuary Litany", "ossuary-litany"],
      targetBlockIds: ["Litany Block"],
    });

    expect(regionOverride).toMatchObject({
      scope: "region",
      regionId: "room-4",
      targetComponentIds: ["ossuary-litany"],
      targetBlockIds: ["litany-block"],
    });
    expect(regionOverride.id).toContain("region-room-4-clue");
  });

  it("reports invalid strategies and missing region targets", () => {
    const parsed = parseDarkPlacesHybridOverride({
      componentId: "invalid-override",
      slotId: "hazard",
      strategy: "concatenate",
    });

    expect(parsed.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "hybrid-override.strategy-invalid",
        }),
        expect.objectContaining({
          code: "hybrid-override.region-required",
        }),
      ]),
    );
  });
});
