/* @vitest-environment jsdom */

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import InspirationDossierModal from "./InspirationDossierModal.jsx";

const META = {
  domainId: "rite",
  obscurityId: "uncommon",
  numberLabel: "001",
  collectionLabel: "Existing Inspirations",
  domain: { icon: "fa-fire-flame-curved", labelKey: "inspirations.domains.rite" },
  obscurity: { symbol: "◆", labelKey: "inspirations.obscurity.uncommon" },
};

function makeCard() {
  return {
    inspiration: {
      id: "inspiration-test",
      title: "Test Inspiration",
      status: "published",
      sourceAnchors: ["test-source"],
      editorial: {
        deck: "A public deck.",
        thesis: "A legacy thesis that must not render.",
        whatItIs: "A researched article.",
        cruorLensThesis: "A legacy lens thesis that must not render.",
        cruorLens: "A continuous editorial interpretation.",
        facts: [{ label: "Hidden Fact", value: "Should not render." }],
        horrorStructures: [
          {
            id: "hidden-structure",
            title: "Hidden Structure",
            description: "Should not render.",
          },
        ],
        triggerWarnings: ["Death", "Bones"],
        tableSafety: ["Discuss boundaries before play."],
        sources: [],
        furtherReading: [],
        relatedDossiers: [{ sourceAnchorId: "related-source" }],
      },
      media: { icon: "fa-book-open" },
    },
    meta: META,
    sourceType: "Historical Practice",
    sourceAnchor: { id: "test-source", title: "Test Source" },
    horror: [],
  };
}

function makeRelatedCard() {
  return {
    sourceAnchorId: "related-source",
    inspiration: {
      id: "inspiration-related",
      title: "Related Inspiration",
      media: { icon: "fa-book-open" },
    },
    meta: { ...META, numberLabel: "002" },
  };
}

describe("InspirationDossierModal editorial hierarchy", () => {
  let container;
  let root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    document.body.innerHTML = "";
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  it("keeps facts and Horror Structures out of the public Dossier", async () => {
    await act(async () => {
      root.render(
        <InspirationDossierModal
          card={makeCard()}
          linkedComponents={[]}
          onClose={() => {}}
        />,
      );
    });

    const modal = document.body.querySelector(".inspiration-dossier");
    expect(modal.textContent).not.toContain("Hidden Fact");
    expect(modal.textContent).not.toContain("Hidden Structure");
    expect(modal.querySelector(".inspiration-dossier__trigger-warning-panel")).not.toBeNull();
    expect(modal.querySelector(".inspiration-dossier__scroll-region")).not.toBeNull();
    expect(modal.querySelector(".inspiration-dossier__scrollbar")).not.toBeNull();
    expect(modal.querySelector(".inspiration-dossier__scrollbar-thumb")).not.toBeNull();
    expect(modal.textContent).not.toContain("A legacy thesis that must not render.");
    expect(modal.textContent).not.toContain("A legacy lens thesis that must not render.");
    expect(modal.querySelector(".inspiration-dossier__opening-thesis")).toBeNull();
    expect(modal.querySelector(".inspiration-dossier__section-deck")).toBeNull();
    expect(modal.querySelector(".inspiration-dossier__lens")).toBeNull();
    expect(modal.querySelector(".inspiration-dossier__safety-practice")).not.toBeNull();
    expect(modal.textContent).toContain("Respectful Use");
    expect(
      modal.querySelectorAll(
        ".inspiration-dossier__section.inspiration-dossier__section--article",
      ),
    ).toHaveLength(2);
    const articleSections = modal.querySelectorAll(
      ".inspiration-dossier__section.inspiration-dossier__section--article",
    );
    expect(
      articleSections[0].querySelector(".inspiration-dossier__article-lead"),
    ).not.toBeNull();
    expect(
      articleSections[1].querySelector(".inspiration-dossier__article-lead"),
    ).toBeNull();
    expect(
      articleSections[1].querySelector(".inspiration-dossier__article-copy"),
    ).not.toBeNull();
    const warningIcons = [...modal.querySelectorAll(".inspiration-dossier__warning-tags i")].map(
      (icon) => icon.className,
    );
    expect(new Set(warningIcons).size).toBe(warningIcons.length);
  });

  it("does not revive removed thesis fields when the Cruor Lens is empty", async () => {
    const card = makeCard();
    card.inspiration.editorial.cruorLens = "";

    await act(async () => {
      root.render(
        <InspirationDossierModal
          card={card}
          linkedComponents={[]}
          onClose={() => {}}
        />,
      );
    });

    const modal = document.body.querySelector(".inspiration-dossier");
    expect(modal.textContent).not.toContain("A legacy thesis that must not render.");
    expect(modal.textContent).not.toContain("A legacy lens thesis that must not render.");
  });

  it("renders related Dossiers with the shared front-card component", async () => {
    const openRelated = vi.fn();
    await act(async () => {
      root.render(
        <InspirationDossierModal
          card={makeCard()}
          linkedComponents={[]}
          relatedCards={[makeRelatedCard()]}
          onOpenRelatedDossier={openRelated}
          onClose={() => {}}
        />,
      );
    });

    const related = document.body.querySelector(
      ".inspiration-dossier__related-card-shell",
    );
    expect(related.querySelector(".inspiration-card--front-only")).not.toBeNull();

    await act(async () => related.click());
    expect(openRelated).toHaveBeenCalledWith("related-source");
  });
});
