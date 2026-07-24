/* @vitest-environment jsdom */

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import StudioDossierAuthoringPanel from "./StudioDossierAuthoringPanel.jsx";

function makeDraft() {
  return {
    id: "test-source",
    title: "Test Source",
    packId: "existing-inspirations",
    status: "draft",
    sourceAnchor: {
      id: "test-source",
      title: "Test Source",
      kind: "historical site",
      summary: "A source summary.",
    },
    inspiration: {
      id: "inspiration-test-source",
      title: "Test Source",
      status: "draft",
      sourceTypes: ["Historical Site"],
      horror: ["ritual"],
      card: {
        domain: "place",
        obscurity: "uncommon",
        collectionId: "existing-inspirations",
        collectionLabel: "Existing Inspirations",
        number: 1,
        description: "A public card description.",
      },
      editorial: {
        deck: "A compact public deck.",
        whatItIs: "A researched source article.",
        cruorLens: "A full Cruor interpretation.",
        triggerWarnings: ["Human remains"],
        tableSafety: ["Discuss boundaries before play."],
        lowIntensityAlternative: "Use carved stone forms.",
        sources: [
          {
            title: "Official Source",
            url: "https://example.com/source",
            description: "A source used by the Dossier.",
            meta: "Official institution",
          },
        ],
        furtherReading: [],
        relatedDossiers: [],
      },
      media: {
        imageTitle: "Archive image",
        imageAlt: "A test archive subject.",
        imageCredit: "Photo: Test Archive",
        imageRightsStatus: "public-domain",
        imageSourceUrl: "https://example.com/image",
        imageRightsVerifiedAt: "2026-07-23",
      },
    },
    components: [],
  };
}

function Harness() {
  const [draft, setDraft] = React.useState(makeDraft());
  function updateDraft(updater) {
    setDraft((current) => {
      const next = structuredClone(current);
      updater(next);
      return next;
    });
  }
  return (
    <StudioDossierAuthoringPanel
      draft={draft}
      imageSource="/test-image.webp"
      updateDraft={updateDraft}
    />
  );
}

describe("StudioDossierAuthoringPanel", () => {
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
    container.remove();
    document.body.innerHTML = "";
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  it("authors structured collections without raw JSON", async () => {
    await act(async () => root.render(<Harness />));

    expect(container.textContent).toContain("Structured Sections");
    expect(container.textContent).toContain("Official Source");
    expect(container.textContent).not.toContain("Horror Structures");
    expect(container.textContent).not.toContain("Add Fact");

    const addSource = [...container.querySelectorAll("button")].find(
      (button) => button.textContent.trim() === "Add Source",
    );
    await act(async () => addSource.click());

    expect(container.textContent).toContain("Source 2");
  });

  it("opens the exact production Dossier modal from a button", async () => {
    await act(async () => root.render(<Harness />));

    const openButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent.trim() === "Open Dossier",
    );
    expect(openButton.classList.contains("inspiration-card__dossier-button")).toBe(
      true,
    );

    await act(async () => openButton.click());

    const modal = document.body.querySelector(".inspiration-dossier");
    expect(modal).not.toBeNull();
    expect(modal.textContent).toContain("An opening thesis.");
    expect(modal.textContent).toContain("Photo: Test Archive");
    expect(modal.textContent).toContain("Official Source");
  });
});
