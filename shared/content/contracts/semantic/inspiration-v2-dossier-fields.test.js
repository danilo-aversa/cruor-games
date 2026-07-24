import { describe, expect, it } from "vitest";

import {
  INSPIRATION_IMAGE_RIGHTS_STATUSES,
  normalizeInspirationV2,
  validateInspirationV2,
} from "./inspiration-v2.js";
import { createCompatibilityProvenance } from "./provenance-v1.js";
import { SEMANTIC_SCHEMA_VERSIONS } from "./schema-versions.js";

function makeInspiration() {
  return {
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
    id: "inspiration-test-source",
    slug: "test-source",
    title: "Test Source",
    status: "draft",
    sourceAnchors: ["test-source"],
    sourceTypes: ["Historical Site"],
    themes: ["mortality"],
    motifs: ["bones"],
    horror: ["ritual"],
    contexts: ["crypt"],
    card: {
      domain: "place",
      obscurity: "uncommon",
      collectionId: "existing-inspirations",
      collectionLabel: "Existing Inspirations",
      number: 3,
      description: "A concise public card description.",
    },
    editorial: {
      deck: "A compact public deck.",
      whatItIs: "A researched source article.",
      cruorLens: "A full Cruor interpretation.",
      facts: [{ label: "Place", value: "Test Place" }],
      horrorStructures: [
        {
          id: "ritual-order",
          title: "Ritual Order",
          description: "A reusable horror mechanism.",
          feeds: "Feeds ritual components.",
          keywords: ["ritual"],
          componentIds: [],
        },
      ],
      triggerWarnings: ["bones"],
      tableSafety: ["Discuss boundaries before play."],
      lowIntensityAlternative: "Use carved stone forms.",
      sources: [
        {
          title: "Official Source",
          url: "https://example.com/source",
          description: "Primary orientation.",
          meta: "Official institution",
        },
      ],
      furtherReading: [],
      relatedDossiers: [],
      whyItDisturbs: "",
      creativeUses: [],
      cautions: [],
    },
    media: {
      imageTitle: "Archive image",
      imageKey: "card-test.webp",
      imageProvider: "local",
      imageAlt: "A test archive subject.",
      imageCredit: "Photo: Test Archive",
      imageCreator: "Test Photographer",
      imageSourceTitle: "Test Collection",
      imageSourceUrl: "https://example.com/image",
      imageLicense: "CC BY 4.0",
      imageLicenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      imageRightsStatus: "creative-commons",
      imageRightsVerifiedAt: "2026-07-23",
      imageModifications: "Cropped and converted to monochrome.",
      icon: "fa-image",
    },
    tags: ["source:test-source"],
    provenance: createCompatibilityProvenance({
      sourceAnchorIds: ["test-source"],
      legacyIds: [],
      fromSchema: "test-fixture",
    }),
  };
}

describe("Inspiration v2 Dossier fields", () => {
  it("preserves archive card metadata and structured image provenance", () => {
    const value = makeInspiration();
    const normalized = normalizeInspirationV2(value);

    expect(normalized.card).toEqual(value.card);
    expect(normalized.editorial.triggerWarnings).toEqual(["Bones"]);
    expect(normalized.media).toMatchObject({
      imageCredit: "Photo: Test Archive",
      imageCreator: "Test Photographer",
      imageSourceUrl: "https://example.com/image",
      imageRightsStatus: "creative-commons",
      imageRightsVerifiedAt: "2026-07-23",
    });
    expect(INSPIRATION_IMAGE_RIGHTS_STATUSES).toContain("public-domain");
    expect(validateInspirationV2(value)).toEqual([]);
  });

  it("rejects invalid card metadata and provenance formats", () => {
    const value = makeInspiration();
    value.card.domain = "unknown";
    value.card.number = 0;
    value.media.imageSourceUrl = "relative/image";
    value.media.imageRightsStatus = "unknown";
    value.media.imageRightsVerifiedAt = "23/07/2026";

    const issueCodes = validateInspirationV2(value).map((issue) => issue.code);
    expect(issueCodes).toContain("inspiration.invalid-card-domain");
    expect(issueCodes).toContain("inspiration.invalid-card-number");
    expect(issueCodes).toContain("inspiration.invalid-image-url");
    expect(issueCodes).toContain("inspiration.invalid-image-rights-status");
    expect(issueCodes).toContain("inspiration.invalid-image-rights-date");
  });
});
