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
          label: t("navigation.locations.label", {}, locale),
          description: t("navigation.locations.description", {}, locale),
          mobileDescription: t("navigation.locations.mobileDescription", {}, locale),
          icon: "fa-solid fa-location-dot",
          action: { type: "crucible-tool", toolId: "darken", viewId: "composer" },
          previewTitle: t("navigation.locations.previewTitle", {}, locale),
          previewText: t("navigation.locations.previewText", {}, locale),
          previewVariant: "locations",
        },
        {
          id: "monsters",
          label: t("navigation.monsters.label", {}, locale),
          description: t("navigation.monsters.description", {}, locale),
          mobileDescription: t("navigation.monsters.mobileDescription", {}, locale),
          icon: "fa-solid fa-skull",
          action: { type: "crucible-tool", toolId: "monster", viewId: "composer" },
          previewTitle: t("navigation.monsters.previewTitle", {}, locale),
          previewText: t("navigation.monsters.previewText", {}, locale),
          previewVariant: "monsters",
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
