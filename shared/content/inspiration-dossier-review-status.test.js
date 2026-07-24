import { describe, expect, it } from "vitest";

import { PUBLISHED_SEMANTIC_INSPIRATION_MODULES } from "./published-inspiration-modules.js";
import {
  PRODUCTION_INSPIRATION_MODULES,
  getProductionInspirationModule,
} from "./production-inspiration-modules.js";

const REVIEWED_MODULE_IDS = new Set(
  PUBLISHED_SEMANTIC_INSPIRATION_MODULES.map((module) => module.id),
);

describe("Inspiration Dossier review status", () => {
  it("keeps every card in production while marking unreviewed dossiers Pending Review", () => {
    expect(PRODUCTION_INSPIRATION_MODULES.length).toBeGreaterThan(1);

    PRODUCTION_INSPIRATION_MODULES.forEach((module) => {
      if (REVIEWED_MODULE_IDS.has(module.id)) {
        expect(module.status).toBe("published");
        expect(module.inspiration.status).toBe("published");
        return;
      }
      expect(module.status).toBe("pending-review");
      expect(module.inspiration.status).toBe("pending-review");
    });
  });

  it("keeps every explicitly reviewed Dossier available", () => {
    PUBLISHED_SEMANTIC_INSPIRATION_MODULES.forEach((reviewedModule) => {
      const module = getProductionInspirationModule(reviewedModule.id);
      expect(module).toMatchObject({
        id: reviewedModule.id,
        status: "published",
        inspiration: { status: "published" },
      });
    });
  });
});
