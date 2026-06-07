import { describe, expect, it } from "vitest";
import {
  DECOMPOSITION_INSPIRATION_MODULE,
  DECOMPOSITION_INSPIRATION_MODULE_CONTENT_PACK,
  getStaticInspirationModules,
  STATIC_CONTENT_PACK_ISSUES,
  STATIC_CONTENT_REGISTRY,
} from "../../shared/content/content.index.js";

describe("Inspiration Modules", () => {
  it("owns Decomposition as an explicit cross-generator module", () => {
    expect(DECOMPOSITION_INSPIRATION_MODULE.id).toBe("decomposition");
    expect(DECOMPOSITION_INSPIRATION_MODULE.sourceAnchor?.id).toBe("decomposition");
    expect(DECOMPOSITION_INSPIRATION_MODULE.inspiration?.id).toBe("inspiration-decomposition");
    expect(DECOMPOSITION_INSPIRATION_MODULE.monsterGrafts.length).toBeGreaterThan(0);
    expect(DECOMPOSITION_INSPIRATION_MODULE.locationComponents.length).toBeGreaterThan(0);
    expect(DECOMPOSITION_INSPIRATION_MODULE.locationRegions.length).toBeGreaterThan(0);
  });

  it("publishes Decomposition through the static registry without duplicate module rows", () => {
    const modules = getStaticInspirationModules().filter((module) => module.id === "decomposition");
    const registryComponents = STATIC_CONTENT_REGISTRY.getComponents({ sourceAnchor: "decomposition" });
    const registryInspirations = STATIC_CONTENT_REGISTRY.getInspirations({ sourceAnchor: "decomposition" });

    expect(modules).toHaveLength(1);
    expect(registryInspirations).toHaveLength(1);
    expect(registryComponents.length).toBe(DECOMPOSITION_INSPIRATION_MODULE.components.length);
    expect(DECOMPOSITION_INSPIRATION_MODULE_CONTENT_PACK.collections.components.length).toBe(
      DECOMPOSITION_INSPIRATION_MODULE.components.length,
    );
  });

  it("keeps the static content pack validation error-free", () => {
    const errors = STATIC_CONTENT_PACK_ISSUES.filter((issue) => issue.severity === "error");
    expect(errors).toEqual([]);
  });
});
