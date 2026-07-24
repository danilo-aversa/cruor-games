import { describe, expect, it } from "vitest";

import { clone } from "./studio-component-normalizers.js";
import { EMPTY_DRAFT, normalizeModuleForDraft } from "./studio-draft.js";
import { buildContentPackExport } from "./studio-export.js";
import { validateStudioDraft } from "./studio-validation.js";

function validate(draft) {
  const normalized = normalizeModuleForDraft(draft);
  return validateStudioDraft(normalized, buildContentPackExport(normalized));
}

function makePublishedDraft() {
  const draft = clone(EMPTY_DRAFT);
  draft.status = "published";
  draft.sourceAnchor.status = "published";
  draft.inspiration.status = "approved";
  return draft;
}

function completeDossier(draft) {
  draft.title = "Complete Dossier";
  draft.sourceAnchor.title = "Complete Dossier";
  draft.sourceAnchor.summary = "A complete public source summary.";
  draft.inspiration.title = "Complete Dossier";
  draft.inspiration.sourceTypes = ["Historical Site"];
  draft.inspiration.themes = ["mortality"];
  draft.inspiration.horror = ["ritual"];
  draft.inspiration.card = {
    domain: "place",
    obscurity: "uncommon",
    collectionId: "existing-inspirations",
    collectionLabel: "Existing Inspirations",
    number: 1,
    description: "A complete card-back description.",
  };
  draft.inspiration.editorial = {
    ...draft.inspiration.editorial,
    deck: "A concise public summary for the completed Dossier.",
    whatItIs: "A researched source article with sufficient factual framing.",
    cruorLens: "A complete explanation of the reusable horror mechanism.",
    triggerWarnings: ["Bones"],
    tableSafety: ["Discuss boundaries before play."],
    sources: [
      {
        title: "Official Source",
        url: "https://example.com/source-1",
        description: "Primary orientation.",
        meta: "Official institution",
      },
      {
        title: "Academic Source",
        url: "https://example.com/source-2",
        description: "Historical analysis.",
        meta: "Academic publication",
      },
    ],
  };
  draft.inspiration.media = {
    ...draft.inspiration.media,
    imageTitle: "Archive image",
    imageKey: "card-complete-dossier.webp",
    imageProvider: "local",
    imageAlt: "A complete archive image description.",
    imageCredit: "Photo: Test Archive",
    imageCreator: "Test Photographer",
    imageSourceTitle: "Test Collection",
    imageSourceUrl: "https://example.com/image",
    imageLicense: "CC BY 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    imageRightsStatus: "creative-commons",
    imageRightsVerifiedAt: "2026-07-23",
    imageModifications: "Cropped and converted to monochrome.",
  };
  return draft;
}

describe("Studio public Dossier readiness", () => {
  it("blocks publication when editorial and image provenance are incomplete", () => {
    const report = validate(makePublishedDraft());
    const messages = report.issues.map((issue) => issue.message);

    expect(messages).toContain("Public Dossier is missing What It Is.");
    expect(messages).toContain("Public card metadata is missing Domain.");
    expect(messages).toContain("Publication image rights are still unverified.");
    expect(
      report.issues.some(
        (issue) =>
          issue.severity === "error" &&
          issue.path === "inspiration.editorial.whatItIs",
      ),
    ).toBe(true);
  });

  it("clears all Dossier-specific publication errors when the record is complete", () => {
    const report = validate(completeDossier(makePublishedDraft()));
    const dossierErrors = report.issues.filter(
      (issue) =>
        issue.severity === "error" &&
        (issue.path.startsWith("inspiration.editorial") ||
          issue.path.startsWith("inspiration.card") ||
          issue.path.startsWith("inspiration.media")),
    );

    expect(dossierErrors).toEqual([]);
  });
});
