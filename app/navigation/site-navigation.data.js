import { t } from "../../shared/i18n/index.js";

export function getAppModeOptions(locale) {
  return [
    {
      id: "simple",
      label: t("modes.simple.label", {}, locale),
      description: t("modes.simple.description", {}, locale),
    },
    {
      id: "advanced",
      label: t("modes.advanced.label", {}, locale),
      description: t("modes.advanced.description", {}, locale),
    },
    {
      id: "debug",
      label: t("modes.debug.label", {}, locale),
      description: t("modes.debug.description", {}, locale),
    },
  ];
}

export function getSiteNavItems(locale) {
  return [
    {
      id: "home",
      label: t("navigation.home", {}, locale),
      icon: "fa-solid fa-house-chimney",
      type: "section",
      sectionId: "home",
    },
    {
      id: "crucible",
      label: t("navigation.crucible", {}, locale),
      icon: "fa-solid fa-flask-vial",
      type: "mega",
      items: [
        {
          id: "locations",
          label: "Dark Places",
          description: "Build structured horror sites with regions, clues, hazards, atmosphere, and map intent.",
          catchPhrase: "Turn real sources into playable horror locations and procedural maps.",
          engineFeatures: [
            "Choose source logic and horror direction.",
            "Build regions, routes, clues, hazards.",
            "Generate a procedural playable map.",
            "Export notes for fast table use.",
          ],
          mobileDescription: "Create horror locations with regions, clues, hazards, and map-aware structure.",
          icon: "fa-solid fa-location-dot",
          action: { type: "crucible-tool", toolId: "darken", viewId: "composer" },
          previewTitle: "Dark Places",
          previewText:
            "Compose a horror site from context, source anchors, intrusion level, location regions, hazards, clues, atmosphere, and map-readable structure.",
          previewVariant: "locations",
          previewImage: "/assets/landing-page/hero-mapcrop.webp",
          previewImageAlt: "Dark fantasy map crop generated from the Dark Places workbench.",
        },
        {
          id: "monsters",
          label: "Terrifying Monster",
          description: "Create rules-aware horror creatures with frames, grafts, pressure, weakness, and validation.",
          catchPhrase: "Shape dark fantasy creatures into complete, table-ready 5E stat blocks.",
          engineFeatures: [
            "Choose concept, role, tier, danger.",
            "Add grafts, attacks, defenses, weakness.",
            "Check pressure, complexity, counterplay.",
            "Export a complete 5E stat block.",
          ],
          mobileDescription: "Build horror monsters with frames, grafts, pressure, weakness, and validation.",
          icon: "fa-solid fa-skull",
          action: { type: "crucible-tool", toolId: "monster", viewId: "composer" },
          previewTitle: "Terrifying Monster",
          previewText:
            "Build dark fantasy creatures through base frames, tactical roles, horror grafts, combat pressure, counterplay, readiness checks, and export-facing mechanics.",
          previewVariant: "monsters",
          previewImage: "/assets/landing-page/hero-workbench.webp",
          previewImageAlt: "Cruor workbench interface preview used for Terrifying Monster.",
        },
      ],
    },
    {
      id: "inspirations",
      label: t("navigation.inspirations", {}, locale),
      icon: "fa-solid fa-book-skull",
      type: "section",
      sectionId: "inspirations",
    },
  ];
}

export const APP_MODE_OPTIONS = getAppModeOptions();
export const SITE_NAV_ITEMS = getSiteNavItems();

export function getCrucibleMenuItemId(generatorId) {
  if (generatorId === "monster") return "monsters";
  return "locations";
}

export function getModeLabel(modeId, locale) {
  return getAppModeOptions(locale).find((mode) => mode.id === modeId)?.label || t("modes.simple.label", {}, locale);
}
