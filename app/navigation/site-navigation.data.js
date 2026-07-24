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

export function getSiteNavItems(locale, { includeStudio = false } = {}) {
  const items = [
    {
      id: "home",
      label: t("navigation.home", {}, locale),
      icon: "fa-solid fa-house-chimney",
      type: "section",
      sectionId: "home",
      href: "/",
    },
    {
      id: "crucible",
      label: t("navigation.crucible", {}, locale),
      icon: "fa-solid fa-flask-vial",
      type: "mega",
      items: [
        {
          id: "locations",
          label: t("navigation.crucibleMenu.items.locations.label", {}, locale),
          description: t(
            "navigation.crucibleMenu.items.locations.description",
            {},
            locale,
          ),
          catchPhrase: t(
            "navigation.crucibleMenu.items.locations.catchPhrase",
            {},
            locale,
          ),
          engineFeatures: [
            t(
              "navigation.crucibleMenu.items.locations.engineFeatures.sourceLogic",
              {},
              locale,
            ),
            t(
              "navigation.crucibleMenu.items.locations.engineFeatures.structure",
              {},
              locale,
            ),
            t(
              "navigation.crucibleMenu.items.locations.engineFeatures.map",
              {},
              locale,
            ),
            t(
              "navigation.crucibleMenu.items.locations.engineFeatures.export",
              {},
              locale,
            ),
          ],
          mobileDescription: t(
            "navigation.crucibleMenu.items.locations.mobileDescription",
            {},
            locale,
          ),
          icon: "fa-solid fa-location-dot",
          action: {
            type: "crucible-tool",
            toolId: "darken",
            viewId: "composer",
            href: "/darkplaces",
          },
          href: "/darkplaces",
          previewTitle: t(
            "navigation.crucibleMenu.items.locations.previewTitle",
            {},
            locale,
          ),
          previewText: t(
            "navigation.crucibleMenu.items.locations.previewText",
            {},
            locale,
          ),
          previewVariant: "locations",
          previewImage: "/assets/landing-page/hero-mapcrop.webp",
          previewImageAlt: t(
            "navigation.crucibleMenu.items.locations.previewImageAlt",
            {},
            locale,
          ),
        },
        {
          id: "monsters",
          label: t("navigation.crucibleMenu.items.monsters.label", {}, locale),
          description: t(
            "navigation.crucibleMenu.items.monsters.description",
            {},
            locale,
          ),
          catchPhrase: t(
            "navigation.crucibleMenu.items.monsters.catchPhrase",
            {},
            locale,
          ),
          engineFeatures: [
            t(
              "navigation.crucibleMenu.items.monsters.engineFeatures.concept",
              {},
              locale,
            ),
            t(
              "navigation.crucibleMenu.items.monsters.engineFeatures.grafts",
              {},
              locale,
            ),
            t(
              "navigation.crucibleMenu.items.monsters.engineFeatures.validation",
              {},
              locale,
            ),
            t(
              "navigation.crucibleMenu.items.monsters.engineFeatures.export",
              {},
              locale,
            ),
          ],
          mobileDescription: t(
            "navigation.crucibleMenu.items.monsters.mobileDescription",
            {},
            locale,
          ),
          icon: "fa-solid fa-skull",
          action: {
            type: "crucible-tool",
            toolId: "monster",
            viewId: "composer",
            href: "/terrifyingmonsters",
          },
          href: "/terrifyingmonsters",
          previewTitle: t(
            "navigation.crucibleMenu.items.monsters.previewTitle",
            {},
            locale,
          ),
          previewText: t(
            "navigation.crucibleMenu.items.monsters.previewText",
            {},
            locale,
          ),
          previewVariant: "monsters",
          previewImage: "/assets/landing-page/hero-workbench.webp",
          previewImageAlt: t(
            "navigation.crucibleMenu.items.monsters.previewImageAlt",
            {},
            locale,
          ),
        },
      ],
    },
    {
      id: "inspirations",
      label: t("navigation.inspirations", {}, locale),
      icon: "fa-solid fa-book-skull",
      type: "section",
      sectionId: "inspirations",
      href: "/inspirations",
    },
  ];

  if (includeStudio) {
    items.push({
      id: "studio",
      label: t("navigation.studio", {}, locale),
      icon: "fa-solid fa-pen-ruler",
      type: "section",
      sectionId: "inspiration-studio",
      href: "/inspiration-studio",
    });
  }

  return items;
}

export const APP_MODE_OPTIONS = getAppModeOptions();
export const SITE_NAV_ITEMS = getSiteNavItems();

export function getCrucibleMenuItemId(generatorId) {
  if (generatorId === "monster") return "monsters";
  return "locations";
}

export function getModeLabel(modeId, locale) {
  return (
    getAppModeOptions(locale).find((mode) => mode.id === modeId)?.label ||
    t("modes.simple.label", {}, locale)
  );
}
