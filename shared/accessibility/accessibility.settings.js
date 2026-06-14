export const ACCESSIBILITY_STORAGE_KEY = "cruor.accessibility";

export const DEFAULT_ACCESSIBILITY_SETTINGS = Object.freeze({
  theme: "dark",
  contrast: "default",
  motion: "system",
  text: "default",
  focus: "default",
  tooltips: "default",
});

export const ACCESSIBILITY_SETTING_GROUPS = Object.freeze([
  {
    id: "theme",
    labelKey: "settings.accessibility.theme.label",
    descriptionKey: "settings.accessibility.theme.description",
    options: [
      {
        id: "dark",
        labelKey: "settings.accessibility.theme.options.dark.label",
        descriptionKey: "settings.accessibility.theme.options.dark.description",
      },
      {
        id: "parchment",
        labelKey: "settings.accessibility.theme.options.parchment.label",
        descriptionKey: "settings.accessibility.theme.options.parchment.description",
      },
      {
        id: "system",
        labelKey: "settings.accessibility.theme.options.system.label",
        descriptionKey: "settings.accessibility.theme.options.system.description",
      },
    ],
  },
  {
    id: "contrast",
    labelKey: "settings.accessibility.contrast.label",
    descriptionKey: "settings.accessibility.contrast.description",
    options: [
      {
        id: "default",
        labelKey: "settings.accessibility.contrast.options.default.label",
        descriptionKey: "settings.accessibility.contrast.options.default.description",
      },
      {
        id: "high",
        labelKey: "settings.accessibility.contrast.options.high.label",
        descriptionKey: "settings.accessibility.contrast.options.high.description",
      },
      {
        id: "maximum",
        labelKey: "settings.accessibility.contrast.options.maximum.label",
        descriptionKey: "settings.accessibility.contrast.options.maximum.description",
      },
    ],
  },
  {
    id: "motion",
    labelKey: "settings.accessibility.motion.label",
    descriptionKey: "settings.accessibility.motion.description",
    options: [
      {
        id: "system",
        labelKey: "settings.accessibility.motion.options.system.label",
        descriptionKey: "settings.accessibility.motion.options.system.description",
      },
      {
        id: "reduced",
        labelKey: "settings.accessibility.motion.options.reduced.label",
        descriptionKey: "settings.accessibility.motion.options.reduced.description",
      },
      {
        id: "full",
        labelKey: "settings.accessibility.motion.options.full.label",
        descriptionKey: "settings.accessibility.motion.options.full.description",
      },
    ],
  },
  {
    id: "text",
    labelKey: "settings.accessibility.text.label",
    descriptionKey: "settings.accessibility.text.description",
    options: [
      {
        id: "default",
        labelKey: "settings.accessibility.text.options.default.label",
        descriptionKey: "settings.accessibility.text.options.default.description",
      },
      {
        id: "large",
        labelKey: "settings.accessibility.text.options.large.label",
        descriptionKey: "settings.accessibility.text.options.large.description",
      },
      {
        id: "extra-large",
        labelKey: "settings.accessibility.text.options.extraLarge.label",
        descriptionKey: "settings.accessibility.text.options.extraLarge.description",
      },
    ],
  },
  {
    id: "focus",
    labelKey: "settings.accessibility.focus.label",
    descriptionKey: "settings.accessibility.focus.description",
    options: [
      {
        id: "default",
        labelKey: "settings.accessibility.focus.options.default.label",
        descriptionKey: "settings.accessibility.focus.options.default.description",
      },
      {
        id: "strong",
        labelKey: "settings.accessibility.focus.options.strong.label",
        descriptionKey: "settings.accessibility.focus.options.strong.description",
      },
    ],
  },
  {
    id: "tooltips",
    labelKey: "settings.accessibility.tooltips.label",
    descriptionKey: "settings.accessibility.tooltips.description",
    options: [
      {
        id: "default",
        labelKey: "settings.accessibility.tooltips.options.default.label",
        descriptionKey: "settings.accessibility.tooltips.options.default.description",
      },
      {
        id: "focus",
        labelKey: "settings.accessibility.tooltips.options.focus.label",
        descriptionKey: "settings.accessibility.tooltips.options.focus.description",
      },
      {
        id: "off",
        labelKey: "settings.accessibility.tooltips.options.off.label",
        descriptionKey: "settings.accessibility.tooltips.options.off.description",
      },
    ],
  },
]);

const OPTION_IDS_BY_GROUP = ACCESSIBILITY_SETTING_GROUPS.reduce((accumulator, group) => {
  accumulator[group.id] = new Set(group.options.map((option) => option.id));
  return accumulator;
}, {});

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readStoredAccessibilitySettings() {
  if (typeof window === "undefined") return {};

  try {
    const rawValue = window.localStorage?.getItem(ACCESSIBILITY_STORAGE_KEY);
    if (!rawValue) return {};
    const parsedValue = JSON.parse(rawValue);
    return isObject(parsedValue) ? parsedValue : {};
  } catch {
    return {};
  }
}

export function normalizeAccessibilitySettings(value = {}) {
  const source = isObject(value) ? value : {};
  return Object.entries(DEFAULT_ACCESSIBILITY_SETTINGS).reduce(
    (settings, [key, defaultValue]) => {
      const candidate = source[key];
      settings[key] = OPTION_IDS_BY_GROUP[key]?.has(candidate) ? candidate : defaultValue;
      return settings;
    },
    {},
  );
}

export function readAccessibilitySettings() {
  return normalizeAccessibilitySettings(readStoredAccessibilitySettings());
}

export function saveAccessibilitySettings(settings) {
  const normalizedSettings = normalizeAccessibilitySettings(settings);

  if (typeof window !== "undefined") {
    try {
      window.localStorage?.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(normalizedSettings));
    } catch {
      // localStorage can be unavailable in private or restricted browser contexts.
    }
  }

  return normalizedSettings;
}

export function applyAccessibilitySettingsToDocument(settings) {
  if (typeof document === "undefined") return normalizeAccessibilitySettings(settings);

  const normalizedSettings = normalizeAccessibilitySettings(settings);
  const root = document.documentElement;

  Object.entries(normalizedSettings).forEach(([key, value]) => {
    root.dataset[`a11y${key.charAt(0).toUpperCase()}${key.slice(1)}`] = value;
  });

  document.dispatchEvent(
    new CustomEvent("cruor:accessibility-change", {
      detail: { settings: normalizedSettings },
    }),
  );

  return normalizedSettings;
}

export function updateAccessibilitySetting(settings, key, value) {
  if (!Object.prototype.hasOwnProperty.call(DEFAULT_ACCESSIBILITY_SETTINGS, key)) {
    return normalizeAccessibilitySettings(settings);
  }

  return normalizeAccessibilitySettings({
    ...settings,
    [key]: value,
  });
}
