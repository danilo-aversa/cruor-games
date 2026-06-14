import en from "./locales/en.js";
import it from "./locales/it.js";

export const DEFAULT_LOCALE = "en";
export const FALLBACK_LOCALE = DEFAULT_LOCALE;
export const SUPPORTED_LOCALES = Object.freeze(["en", "it"]);

export const LOCALE_DICTIONARIES = Object.freeze({
  en,
  it,
});

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base = {}, override = {}) {
  const merged = { ...base };

  Object.entries(override || {}).forEach(([key, value]) => {
    if (isObject(value) && isObject(base[key])) {
      merged[key] = deepMerge(base[key], value);
      return;
    }

    merged[key] = value;
  });

  return merged;
}

function getNestedValue(source, key) {
  return String(key || "")
    .split(".")
    .filter(Boolean)
    .reduce((current, part) => (current && Object.prototype.hasOwnProperty.call(current, part) ? current[part] : undefined), source);
}

function interpolate(value, params = {}) {
  if (typeof value !== "string") return value;

  return value.replace(/\{(\w+)\}/g, (match, key) => {
    if (!Object.prototype.hasOwnProperty.call(params, key)) return match;
    return String(params[key]);
  });
}

export function normalizeLocale(locale) {
  const normalized = String(locale || DEFAULT_LOCALE)
    .trim()
    .toLowerCase()
    .replace("_", "-");
  const baseLocale = normalized.split("-")[0];

  if (SUPPORTED_LOCALES.includes(normalized)) return normalized;
  if (SUPPORTED_LOCALES.includes(baseLocale)) return baseLocale;
  return DEFAULT_LOCALE;
}

export function getLocaleDictionary(locale = DEFAULT_LOCALE) {
  const normalizedLocale = normalizeLocale(locale);
  const fallbackDictionary = LOCALE_DICTIONARIES[FALLBACK_LOCALE] || {};
  const localeDictionary = LOCALE_DICTIONARIES[normalizedLocale] || {};

  if (normalizedLocale === FALLBACK_LOCALE) return fallbackDictionary;
  return deepMerge(fallbackDictionary, localeDictionary);
}

export function getCurrentLocale() {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const storedLocale = window.localStorage?.getItem("cruor.locale");
  if (storedLocale) return normalizeLocale(storedLocale);

  const documentLocale = document.documentElement?.lang;
  if (documentLocale) return normalizeLocale(documentLocale);

  return DEFAULT_LOCALE;
}

export function setCurrentLocale(locale) {
  const normalizedLocale = normalizeLocale(locale);

  if (typeof window !== "undefined") {
    window.localStorage?.setItem("cruor.locale", normalizedLocale);
  }

  if (typeof document !== "undefined") {
    document.documentElement.lang = normalizedLocale;
  }

  return normalizedLocale;
}

export function t(key, params = {}, locale = getCurrentLocale()) {
  const dictionary = getLocaleDictionary(locale);
  const fallbackDictionary = getLocaleDictionary(FALLBACK_LOCALE);
  const value = getNestedValue(dictionary, key);
  const fallbackValue = getNestedValue(fallbackDictionary, key);
  const resolvedValue = value ?? fallbackValue ?? key;

  return interpolate(resolvedValue, params);
}

export const translate = t;
