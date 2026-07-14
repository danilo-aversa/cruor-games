import { describe, expect, it } from "vitest";
import { legacyDarkenComponentToSharedComponent } from "./adapters/darken-components.js";
import { legacyLocationRegionToSharedComponent } from "./adapters/location-regions.js";
import {
  createLegacyContentMigration,
  resolveLegacyFieldCandidates,
  resolveLegacyObjectField,
} from "./legacy-content-migration.js";

describe("legacy content migration", () => {
  it("selects fields by explicit precedence and reports divergent aliases", () => {
    const effect = resolveLegacyObjectField(
      {
        location: { effect: { render: { markerKind: "anomaly" } } },
        effect: { render: { markerKind: "clue" } },
      },
      "effect",
    );
    const migration = createLegacyContentMigration({
      fieldResolutions: { effect },
      sourceSchema: "legacy",
      targetSchema: "current",
    });

    expect(effect.sourcePath).toBe("location.effect");
    expect(effect.value).toEqual({ render: { markerKind: "anomaly" } });
    expect(effect.ambiguous).toBe(true);
    expect(migration).toMatchObject({
      status: "review-required",
      ambiguousFields: ["effect"],
      fieldSources: { effect: "location.effect" },
    });
  });

  it("adds migration metadata while preserving the selected Dark Places contract", () => {
    const component = legacyDarkenComponentToSharedComponent({
      id: "legacy-anomaly",
      title: "Legacy Anomaly",
      workflows: ["location"],
      slots: ["visibleAnomaly"],
      location: {
        effect: {
          scope: "map",
          render: { markerKind: "anomaly" },
        },
      },
      effect: {
        scope: "region",
        render: { markerKind: "clue" },
      },
    });

    expect(component.location.effect).toMatchObject({
      scope: "map",
      render: { markerKind: "anomaly" },
    });
    expect(component.migration).toMatchObject({
      sourceSchema: "crucible-location-component-v0",
      targetSchema: "location-component-v1",
      status: "review-required",
      ambiguousFields: ["effect"],
    });
  });

  it("normalizes region aliases and exposes ambiguity without changing precedence", () => {
    const mapInfluence = resolveLegacyFieldCandidates(
      [
        { path: "mapInfluence", value: { weight: 4 } },
        { path: "influence", value: { weight: 2 } },
      ],
      { objectOnly: true },
    );
    expect(mapInfluence).toMatchObject({
      value: { weight: 4 },
      sourcePath: "mapInfluence",
      ambiguous: true,
    });

    const component = legacyLocationRegionToSharedComponent({
      templateId: "legacy-region",
      name: "Legacy Region",
      mapInfluence: { weight: 4 },
      influence: { weight: 2 },
      interaction: "Primary interaction",
      interact: "Older interaction",
    });

    expect(component.locationRegion.mapInfluence).toEqual({ weight: 4 });
    expect(component.map.interaction).toBe("Primary interaction");
    expect(component.migration).toMatchObject({
      status: "review-required",
      ambiguousFields: ["mapInfluence", "interaction"],
    });
  });
});
