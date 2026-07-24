import { describe, expect, it } from "vitest";

import { STATIC_CONTENT_REPOSITORY } from "./content-repository.adapter.js";
import {
  PUBLISHED_SEMANTIC_INSPIRATION_MODULES,
  TOWERS_OF_SILENCE_PUBLISHED_SEMANTIC_V2_MODULE,
} from "./published-inspiration-modules.js";
import { getProductionInspirationModule } from "./production-inspiration-modules.js";

const EXPECTED_THESIS =
  "A dakhma was not built to glorify death. It was built to keep death from passing into the rest of creation.";

describe("Towers of Silence Dossier publication", () => {
  it("publishes one reviewed semantic module without introducing a parallel content pack", () => {
    expect(PUBLISHED_SEMANTIC_INSPIRATION_MODULES).toEqual([
      TOWERS_OF_SILENCE_PUBLISHED_SEMANTIC_V2_MODULE,
    ]);
    expect(TOWERS_OF_SILENCE_PUBLISHED_SEMANTIC_V2_MODULE).toMatchObject({
      id: "towers-of-silence",
      status: "published",
      sourceAnchor: { status: "published" },
      inspiration: {
        status: "approved",
        card: {
          domain: "rite",
          obscurity: "uncommon",
          collectionId: "existing-inspirations",
          number: 1,
        },
        editorial: { thesis: EXPECTED_THESIS },
        media: {
          imageKey: "card-tower-of-silence.webp",
          imageCreator: "Henry Hobart Nichols Sr. (1838–1887)",
          imageRightsStatus: "public-domain",
          imageRightsVerifiedAt: "2026-07-23",
        },
      },
    });
  });

  it("feeds the reviewed Dossier to the public Inspirations registry", () => {
    const module = getProductionInspirationModule("towers-of-silence");

    expect(module).toMatchObject({
      id: "towers-of-silence",
      status: "published",
      inspiration: {
        status: "published",
        editorial: { thesis: EXPECTED_THESIS },
        media: {
          imageKey: "card-tower-of-silence.webp",
          imageRightsStatus: "public-domain",
        },
      },
      metadata: { promotedFromSemanticV2: true },
    });
  });

  it("feeds the same reviewed module to Inspiration Studio", () => {
    const module = STATIC_CONTENT_REPOSITORY.getInspirationModules().find(
      (entry) => entry.id === "towers-of-silence",
    );

    expect(module).toBe(TOWERS_OF_SILENCE_PUBLISHED_SEMANTIC_V2_MODULE);
    expect(module.inspiration.editorial.thesis).toBe(EXPECTED_THESIS);
    expect(module.inspiration.editorial.facts.length).toBeGreaterThanOrEqual(2);
    expect(module.inspiration.editorial.horrorStructures.length).toBeGreaterThanOrEqual(2);
    expect(module.inspiration.editorial.sources.length).toBeGreaterThanOrEqual(2);
  });
});
