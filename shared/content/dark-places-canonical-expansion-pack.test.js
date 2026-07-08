import { describe, expect, it } from "vitest";
import { validateContentPack } from "./content-pack-schema.js";
import { getStaticInspirationModules } from "./content-repository.js";
import { validateContentPackStrict } from "./content-validation.js";
import {
  DARK_PLACES_CANONICAL_EXPANSION_CONTENT_PACK,
  DARK_PLACES_CANONICAL_LOCATION_COMPONENTS,
  DARK_PLACES_CANONICAL_LOCATION_REGION_COMPONENTS,
  LOCATION_COMPONENT_SCHEMA_VERSION,
  LOCATION_REGION_SCHEMA_VERSION,
} from "./content-packs/dark-places-canonical-expansion-pack.js";

function countBySlot(components = []) {
  return components.reduce((counts, component) => {
    const slotId = component.slots?.[0] || "unknown";
    counts[slotId] = (counts[slotId] || 0) + 1;
    return counts;
  }, {});
}

describe("Dark Places canonical expansion pack", () => {
  it("adds a large authored pool of Supabase-ready Places content", () => {
    const slotCounts = countBySlot(DARK_PLACES_CANONICAL_LOCATION_COMPONENTS);

    expect(DARK_PLACES_CANONICAL_LOCATION_COMPONENTS.length).toBeGreaterThanOrEqual(100);
    expect(DARK_PLACES_CANONICAL_LOCATION_REGION_COMPONENTS.length).toBeGreaterThanOrEqual(12);
    expect(slotCounts.horrorPremise).toBeGreaterThanOrEqual(14);
    expect(slotCounts.sensoryLayer).toBeGreaterThanOrEqual(22);
    expect(slotCounts.visibleAnomaly).toBeGreaterThanOrEqual(22);
    expect(slotCounts.hazard).toBeGreaterThanOrEqual(18);
    expect(slotCounts.clue).toBeGreaterThanOrEqual(18);
    expect(slotCounts.encounterTwist).toBeGreaterThanOrEqual(18);
    expect(slotCounts.reward).toBeGreaterThanOrEqual(14);
  });

  it("keeps every authored Places entry in the canonical location/map shape", () => {
    DARK_PLACES_CANONICAL_LOCATION_COMPONENTS.forEach((component) => {
      expect(component.contentType).toBe("location-component");
      expect(component.workflows).toContain("darken-location");
      expect(component.location?.schemaVersion).toBe(LOCATION_COMPONENT_SCHEMA_VERSION);
      expect(component.location?.componentId).toBe(component.id);
      expect(component.registry?.schemaVersion).toBe(LOCATION_COMPONENT_SCHEMA_VERSION);
      expect(component.contentPack?.id).toBe("dark-places-canonical-expansion");
    });

    DARK_PLACES_CANONICAL_LOCATION_REGION_COMPONENTS.forEach((region) => {
      expect(region.contentType).toBe("location-region");
      expect(region.workflows).toContain("darken-location");
      expect(region.workflows).toContain("map-generator");
      expect(region.locationRegion?.schemaVersion).toBe(LOCATION_REGION_SCHEMA_VERSION);
      expect(region.map?.schemaVersion).toBe(LOCATION_REGION_SCHEMA_VERSION);
      expect(region.map?.templateId).toBeTruthy();
    });
  });

  it("surfaces authored canonical components in Inspiration Studio modules", () => {
    const modules = getStaticInspirationModules({ includeRegistryFallback: false });
    const moduleById = new Map(modules.map((module) => [module.id, module]));
    const waxDeathMasks = moduleById.get("wax-death-masks");
    const wolfSpiders = moduleById.get("wolf-spiders");

    expect(waxDeathMasks?.locationComponents?.length || 0).toBeGreaterThan(1);
    expect(wolfSpiders?.locationComponents?.length || 0).toBeGreaterThan(1);
    expect(wolfSpiders?.locationRegions?.length || 0).toBeGreaterThanOrEqual(2);
  });

  it("passes content pack validation", () => {
    const issues = [
      ...validateContentPack(DARK_PLACES_CANONICAL_EXPANSION_CONTENT_PACK, { strict: true }),
      ...validateContentPackStrict(DARK_PLACES_CANONICAL_EXPANSION_CONTENT_PACK),
    ];

    expect(issues).toEqual([]);
  });
});
