import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import InspirationsPage from "./inspirations.page.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function findButtonByText(container, text) {
  return [...container.querySelectorAll("button")].find((button) =>
    button.textContent.includes(text),
  );
}

describe("InspirationsPage interactions", () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    document.body.style.overflow = "";
  });

  it("keeps one card flipped and opens a focus-managed dossier", async () => {
    await act(async () => {
      root.render(
        <InspirationsPage locale="en" onOpenMonsterComposer={() => {}} />,
      );
    });

    const cards = [...container.querySelectorAll(".inspiration-card")];
    expect(cards).toHaveLength(14);

    const jikininki = cards.find((card) =>
      card.textContent.includes("Jikininki"),
    );
    const flipButton = jikininki.querySelector(
      ".inspiration-card__flip-control",
    );

    await act(async () => flipButton.click());
    expect(jikininki.dataset.flipped).toBe("true");
    expect(
      container.querySelectorAll('.inspiration-card[data-flipped="true"]'),
    ).toHaveLength(1);

    const dossierButton = jikininki.querySelector(
      ".inspiration-card__dossier-button",
    );
    expect(dossierButton.classList.contains("cruor-square-icon-button")).toBe(
      true,
    );
    expect(
      dossierButton.classList.contains("cruor-square-icon-button--compact"),
    ).toBe(true);
    expect(dossierButton.getAttribute("aria-label")).toBe("Open dossier");
    await act(async () => dossierButton.click());

    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.body.style.overflow).toBe("hidden");

    const closeButton = container.querySelector(".inspiration-dossier__close");
    await act(async () => closeButton.click());

    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("uses the canonical dropdown family for archive listboxes", async () => {
    await act(async () => {
      root.render(<InspirationsPage locale="en" />);
    });

    const sortTrigger = container.querySelector(
      "#inspirations-sort-trigger.cruor-dropdown-trigger",
    );
    expect(sortTrigger).not.toBeNull();

    await act(async () => sortTrigger.click());

    const listbox = document.body.querySelector(
      "#inspirations-sort-menu.cruor-dropdown-menu--listbox",
    );
    expect(listbox).not.toBeNull();
    expect(listbox.getAttribute("role")).toBe("listbox");

    const options = [...listbox.querySelectorAll('[role="option"]')];
    expect(options.length).toBeGreaterThan(1);
    expect(
      options.some((option) => option.getAttribute("aria-selected") === "true"),
    ).toBe(true);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(document.body.querySelector("#inspirations-sort-menu")).toBeNull();
    expect(document.activeElement).toBe(sortTrigger);
  });

  it("filters the collection by Domain", async () => {
    await act(async () => {
      root.render(<InspirationsPage locale="en" />);
    });

    const bodyButton = findButtonByText(container, "Body");
    expect(bodyButton).toBeDefined();

    await act(async () => bodyButton.click());

    const visibleCards = [...container.querySelectorAll(".inspiration-card")];
    expect(visibleCards).toHaveLength(3);
    expect(visibleCards.map((card) => card.textContent)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Decomposition"),
        expect.stringContaining("Genetic Mutations"),
        expect.stringContaining("Wolf Spiders"),
      ]),
    );
  });
});
