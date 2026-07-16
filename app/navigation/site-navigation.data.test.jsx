import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SiteMegaMenu from "./SiteMegaMenu.jsx";
import { getSiteNavItems } from "./site-navigation.data.js";

function getCrucibleMenu(locale) {
  return getSiteNavItems(locale).find((item) => item.id === "crucible");
}

function getCrucibleItem(locale, itemId) {
  return getCrucibleMenu(locale)?.items?.find((item) => item.id === itemId);
}

describe("localized Crucible navigation", () => {
  it("uses the concise English catchphrases", () => {
    expect(getCrucibleItem("en", "locations")?.catchPhrase).toBe("Generate playable maps.");
    expect(getCrucibleItem("en", "monsters")?.catchPhrase).toBe("Build playable monsters.");
  });

  it("resolves all user-facing item copy from the Italian dictionary", () => {
    const locations = getCrucibleItem("it", "locations");
    const monsters = getCrucibleItem("it", "monsters");

    expect(locations).toMatchObject({
      label: "Dark Places",
      description:
        "Costruisci luoghi horror strutturati con regioni, indizi, pericoli, atmosfera e intento della mappa.",
      catchPhrase: "Genera mappe giocabili.",
      mobileDescription:
        "Crea luoghi horror con regioni, indizi, pericoli e una struttura consapevole della mappa.",
      previewTitle: "Dark Places",
    });
    expect(locations?.engineFeatures).toEqual([
      "Scegli la logica delle fonti e la direzione horror.",
      "Costruisci regioni, percorsi, indizi e pericoli.",
      "Genera una mappa procedurale giocabile.",
      "Esporta note per un uso rapido al tavolo.",
    ]);

    expect(monsters).toMatchObject({
      label: "Terrifying Monsters",
      description:
        "Crea creature horror consapevoli delle regole con frame, graft, pressione, debolezze e validazione.",
      catchPhrase: "Costruisci mostri giocabili.",
      mobileDescription:
        "Costruisci mostri horror con frame, graft, pressione, debolezze e validazione.",
      previewTitle: "Terrifying Monsters",
    });
    expect(monsters?.engineFeatures).toEqual([
      "Scegli concetto, ruolo, tier e pericolosità.",
      "Aggiungi graft, attacchi, difese e debolezze.",
      "Controlla pressione, complessità e contromisure.",
      "Esporta uno stat block 5E completo.",
    ]);
  });

  it("localizes the megamenu accessible labels", () => {
    const menu = getCrucibleMenu("it");
    const markup = renderToStaticMarkup(
      <SiteMegaMenu menu={menu} activeItemId="locations" selectedItemId="locations" locale="it" />
    );

    expect(markup).toContain('aria-label="Strumenti di Crucible"');
    expect(markup).toContain('aria-label="Opzioni di Crucible"');
    expect(markup).toContain('aria-label="Anteprima di Dark Places"');
    expect(markup).toContain('aria-label="Funzioni del motore di Dark Places"');
  });
});
