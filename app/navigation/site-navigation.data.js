export const APP_MODE_OPTIONS = [
  {
    id: "simple",
    label: "Simple",
    description: "Quiet interface for default table use.",
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "Expose deeper composition controls.",
  },
  {
    id: "debug",
    label: "Debug",
    description: "Show diagnostic and development-only surfaces.",
  },
];

export const SITE_NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: "fa-solid fa-house-chimney",
    type: "section",
    sectionId: "home",
  },
  {
    id: "crucible",
    label: "Crucible",
    icon: "fa-solid fa-flask-vial",
    type: "mega",
    items: [
      {
        id: "locations",
        label: "Locations",
        description: "Regions, hazards, clues, atmosphere, and map flow.",
        mobileDescription: "Darken places with regions, hazards, clues, and maps.",
        icon: "fa-solid fa-location-dot",
        action: { type: "crucible-tool", toolId: "darken", viewId: "composer" },
        previewTitle: "Darken a Location",
        previewText:
          "Turn an existing dungeon, chapel, cave, ruin, or village into playable horror with regions, hazards, clues, atmosphere, and a generated map.",
        previewVariant: "locations",
      },
      {
        id: "monsters",
        label: "Monsters",
        description: "Body, pressure, weakness, grafts, and 5E-ready output.",
        mobileDescription: "Forge horror threats with grafts and table-ready mechanics.",
        icon: "fa-solid fa-skull",
        action: { type: "crucible-tool", toolId: "monster", viewId: "composer" },
        previewTitle: "Build a Monster",
        previewText:
          "Forge a dark fantasy threat through anatomy, pressure, complexity, weaknesses, lair effects, and table-ready mechanics.",
        previewVariant: "monsters",
      },
    ],
  },
  {
    id: "inspirations",
    label: "Inspirations",
    icon: "fa-solid fa-book-skull",
    type: "section",
    sectionId: "inspirations",
  },
];

export function getCrucibleMenuItemId(generatorId) {
  if (generatorId === "monster") return "monsters";
  return "locations";
}

export function getModeLabel(modeId) {
  return APP_MODE_OPTIONS.find((mode) => mode.id === modeId)?.label || "Simple";
}
