/* @vitest-environment jsdom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InspirationDossierModal from "./InspirationDossierModal.jsx";

const CARD = {
  inspiration: {
    id: "inspiration-test",
    title: "Test Inspiration",
    summary: "A compact public deck.",
    editorial: {
      deck: "A compact public deck.",
      thesis: "The opening thesis.",
      whatItIs:
        "A factual description of the source.\n\n## Historical Context\n\nA second researched paragraph.",
      cruorLensThesis: "The Cruor interpretation in one sentence.",
      cruorLens: "The full Cruor editorial interpretation.",
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
      triggerWarnings: ["Human remains"],
      tableSafety: ["Discuss visual boundaries before play."],
      lowIntensityAlternative: "Replace remains with carved stone forms.",
      sources: [
        {
          title: "Test Source",
          url: "https://example.com/source",
          description: "A source used by the dossier.",
          meta: "Official source",
        },
      ],
      furtherReading: [],
      relatedDossiers: [
        {
          sourceAnchorId: "related-source",
          title: "Related Source",
          relationship: "Shared motif",
          description: "A connected dossier.",
        },
      ],
      whyItDisturbs: "Legacy text that should not become its own section.",
      creativeUses: ["Legacy table-use copy that must not be rendered."],
      cautions: ["Legacy caution fallback."],
    },
    media: {
      imageUrl: "/test-image.webp",
      imageTitle: "Archive photograph",
      imageAlt: "A test archive subject.",
      imageCredit: "Photo: Test Archive",
      icon: "fa-image",
    },
  },
  meta: {
    domain: {
      labelKey: "inspirations.domains.place",
      icon: "fa-landmark",
    },
    obscurity: {
      labelKey: "inspirations.obscurity.uncommon",
      symbol: "◆",
    },
    collectionLabel: "Test Collection",
    numberLabel: "Card 001",
    description: "Fallback description.",
  },
  sourceType: "Historical Place",
  sourceAnchor: {
    id: "test-source",
    title: "Test Source",
  },
  horror: ["confinement", "ritual"],
};

const LINKED_COMPONENTS = [
  {
    id: "test-location",
    title: "Test Location",
    summary: "A ritual room component.",
    contentType: "location-component",
    semanticType: "visual-sign",
    workflows: ["darken-location"],
    slots: ["visual-sign"],
  },
  {
    id: "test-graft",
    title: "Test Graft",
    summary: "A ritual monster component.",
    contentType: "monster-graft",
    semanticType: "monster-graft",
    workflows: ["monster-composer"],
    slots: ["horror"],
    monster: {
      slot: "horror",
      cost: 2,
      complexity: 1,
    },
  },
];

describe("InspirationDossierModal", () => {
  let container;
  let root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    container.id = "test-app-root";
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    document.body.innerHTML = "";
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  it("portals the modal above the app shell and keeps icon tabs external", async () => {
    await act(async () => {
      root.render(
        <InspirationDossierModal
          card={CARD}
          linkedComponents={LINKED_COMPONENTS}
          onClose={() => {}}
        />,
      );
    });

    const modal = document.body.querySelector(".inspiration-dossier");
    expect(modal).not.toBeNull();
    expect(modal.parentElement).toBe(document.body);
    expect(container.contains(modal)).toBe(false);
    expect(
      modal.querySelector(".inspiration-dossier__media figcaption strong")
        .textContent,
    ).toBe("Archive photograph");
    expect(modal.textContent).toContain("Photo: Test Archive");

    const stage = modal.querySelector(".inspiration-dossier__stage");
    const panel = modal.querySelector(".inspiration-dossier__panel");
    const tabs = modal.querySelector(".inspiration-dossier__tabs");
    expect(stage.contains(panel)).toBe(true);
    expect(stage.contains(tabs)).toBe(true);
    expect(panel.contains(tabs)).toBe(false);
    expect(tabs.previousElementSibling).toBe(panel);

    const tabButtons = [...tabs.querySelectorAll('[role="tab"]')];
    expect(tabButtons).toHaveLength(2);
    tabButtons.forEach((button) => {
      expect(button.classList.contains("tooltip-btn")).toBe(true);
      expect(button.dataset.key).toBe("tooltip-generic");
      expect(button.dataset.tooltip).toBe(button.getAttribute("aria-label"));
      expect(button.querySelector(":scope > .sr-only")).not.toBeNull();
    });
  });

  it("renders the editorial dossier without the retired At the Table section", async () => {
    const onOpenRelatedDossier = vi.fn();

    await act(async () => {
      root.render(
        <InspirationDossierModal
          card={CARD}
          linkedComponents={LINKED_COMPONENTS}
          onOpenRelatedDossier={onOpenRelatedDossier}
          onClose={() => {}}
        />,
      );
    });

    const modal = document.body.querySelector(".inspiration-dossier");
    expect(modal.textContent).toContain("The opening thesis.");
    expect(modal.textContent).toContain("A factual description of the source.");
    expect(modal.textContent).toContain("Historical Context");
    expect(modal.textContent).toContain("The Cruor Lens");
    expect(modal.textContent).toContain("Ritual Order");
    expect(modal.textContent).toContain("Trigger Warnings");
    expect(modal.textContent).toContain(
      "Discuss visual boundaries before play.",
    );
    expect(modal.textContent).toContain("Sources & Further Reading");
    expect(modal.textContent).toContain("Test Source");
    expect(modal.textContent).not.toContain(
      "Legacy table-use copy that must not be rendered.",
    );

    const relatedButton = modal.querySelector(
      "button.inspiration-dossier__related-card",
    );
    await act(async () => relatedButton.click());
    expect(onOpenRelatedDossier).toHaveBeenCalledWith("related-source");
  });

  it("shows the translation map, all generator families, and both actions", async () => {
    const onUseDarkPlaces = vi.fn();
    const onUseMonsterComposer = vi.fn();

    await act(async () => {
      root.render(
        <InspirationDossierModal
          card={CARD}
          linkedComponents={LINKED_COMPONENTS}
          canOpenDarkPlaces
          canOpenMonsterComposer
          onUseDarkPlaces={onUseDarkPlaces}
          onUseMonsterComposer={onUseMonsterComposer}
          onClose={() => {}}
        />,
      );
    });

    const modal = document.body.querySelector(".inspiration-dossier");
    const workbenchPanel = modal.querySelector(
      "#inspiration-dossier-panel-workbench",
    );
    expect(workbenchPanel.hidden).toBe(true);

    const workbenchTab = modal.querySelector(
      "#inspiration-dossier-tab-workbench",
    );
    await act(async () => workbenchTab.click());

    expect(workbenchPanel.hidden).toBe(false);
    expect(workbenchPanel.textContent).toContain("Translation Map");
    expect(workbenchPanel.textContent).toContain("Horror Texture");
    expect(workbenchPanel.textContent).toContain("Dark Places");
    expect(workbenchPanel.textContent).toContain("Terrifying Monsters");
    expect(workbenchPanel.textContent).toContain("Test Location");
    expect(workbenchPanel.textContent).toContain("Test Graft");
    expect(workbenchPanel.textContent).toContain("Technical Details");

    const actionButtons = [
      ...modal.querySelectorAll(".inspiration-dossier__actions button"),
    ];
    expect(actionButtons).toHaveLength(2);
    await act(async () => actionButtons[0].click());
    await act(async () => actionButtons[1].click());
    expect(onUseDarkPlaces).toHaveBeenCalledTimes(1);
    expect(onUseMonsterComposer).toHaveBeenCalledTimes(1);
  });
  it("keeps the portal mounted while the closing transition runs", async () => {
    const onClose = vi.fn();

    await act(async () => {
      root.render(
        <InspirationDossierModal
          card={CARD}
          linkedComponents={LINKED_COMPONENTS}
          onClose={onClose}
        />,
      );
    });

    const modal = document.body.querySelector(".inspiration-dossier");
    const closeButton = modal.querySelector(".inspiration-dossier__close");

    await act(async () => closeButton.click());

    expect(modal.classList.contains("is-closing")).toBe(true);
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      modal.dispatchEvent(new Event("transitionend", { bubbles: true }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

});
