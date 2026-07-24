import { describe, expect, it } from "vitest";

import { adaptPublishedSemanticInspirationModule } from "./production-inspiration-modules.js";

const PUBLISHED_MODULE = {
  id: "test-source",
  title: "Test Source",
  packId: "test-pack",
  status: "published",
  capabilities: ["inspiration-archive"],
  sourceAnchor: {
    id: "test-source",
    title: "Test Source",
    kind: "place",
    status: "published",
    summary: "A source summary.",
  },
  inspiration: {
    id: "inspiration-test-source-v2",
    slug: "test-source",
    title: "Test Source",
    status: "approved",
    sourceAnchors: ["test-source"],
    sourceTypes: ["Historical Site"],
    themes: ["memory"],
    motifs: ["memorial"],
    horror: ["Gothic"],
    contexts: [],
    card: {
      domain: "place",
      obscurity: "uncommon",
      collectionId: "test-pack",
      collectionLabel: "Test Pack",
      number: 1,
      description: "A public card description.",
    },
    editorial: {
      deck: "A public deck.",
      whatItIs: "A researched article.",
      cruorLens: "A Cruor interpretation.",
      facts: [],
      horrorStructures: [],
      triggerWarnings: [],
      tableSafety: [],
      lowIntensityAlternative: "",
      sources: [],
      furtherReading: [],
      relatedDossiers: [],
      whyItDisturbs: "",
      creativeUses: [],
      cautions: [],
    },
    media: {
      imageTitle: "Test image",
      imageKey: "card-test-source.webp",
      imageProvider: "local",
      imageAlt: "A test image.",
      imageCredit: "Photo: Test Archive",
      imageCreator: "Test Photographer",
      imageSourceTitle: "Test Archive",
      imageSourceUrl: "https://example.com/image",
      imageRightsStatus: "licensed",
      imageRightsVerifiedAt: "2026-07-23",
      imageLicense: "Example License",
      imageLicenseUrl: "https://example.com/license",
      imageModifications: "Cropped.",
      icon: "fa-image",
    },
    tags: [],
  },
  components: [],
  metadata: { author: "Cruor Games" },
};

describe("published Inspiration v2 promotion boundary", () => {
  it("adapts an explicitly published semantic module for the public v0.1 registry", () => {
    const module = adaptPublishedSemanticInspirationModule(PUBLISHED_MODULE);

    expect(module).toMatchObject({
      id: "test-source",
      status: "published",
      sourceAnchor: {
        id: "test-source",
        label: "Test Source",
        workflows: ["inspiration-archive"],
      },
      inspiration: {
        id: "inspiration-test-source-v2",
        contentType: "source-inspiration-card",
        status: "published",
        workflows: ["inspiration-archive"],
        card: PUBLISHED_MODULE.inspiration.card,
        editorial: PUBLISHED_MODULE.inspiration.editorial,
        media: {
          imageCredit: "Photo: Test Archive",
          imageRightsStatus: "licensed",
        },
      },
      metadata: { promotedFromSemanticV2: true },
    });
    expect(module.inspiration.media.imageUrl).toMatch(
      /assets\/inspiration-cards\/card-test-source\.webp$/,
    );
  });
});
