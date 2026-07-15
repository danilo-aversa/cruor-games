import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import InspirationsPage from "./inspirations.page.jsx";

describe("InspirationsPage", () => {
  it("renders the card collection as the central page surface", () => {
    const markup = renderToStaticMarkup(<InspirationsPage locale="en" />);

    expect(markup).toContain("Source Archive");
    expect(markup).toContain("Inspiration Cards");
    expect(markup.match(/class="inspiration-card(?: |")/g)).toHaveLength(14);
    expect(markup).toContain('class="inspirations-page__grid"');
    expect(markup).not.toContain("inspirations-page__dossier");
  });

  it("renders localized filter and card controls", () => {
    const markup = renderToStaticMarkup(<InspirationsPage locale="it" />);

    expect(markup).toContain("Archivio delle Fonti");
    expect(markup).toContain("Cerca nell’archivio");
    expect(markup).toContain('aria-label="Gira la card Towers of Silence"');
    expect(markup).toContain("Collezione completa");
    expect(markup).toContain("cruor-dropdown-trigger");
    expect(markup).toContain("cruor-square-icon-button");
    expect(markup).toContain("inspiration-card__front-paper-texture");
    expect(markup).toContain("inspiration-card__back-art");
    expect(markup).not.toContain("inspiration-card__back-window");
    expect(markup).not.toContain("inspiration-card__back-overlay");
    expect(markup).not.toContain("inspiration-card__back-texture");
    expect(markup).not.toContain("inspiration-card__front-fade--top");
    expect(markup).not.toContain("inspiration-card__flip-hint");
    expect(markup).not.toContain("<select");
  });
});
