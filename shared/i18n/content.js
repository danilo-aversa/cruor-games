import { DEFAULT_LOCALE, getCurrentLocale, normalizeLocale } from "./i18n.js";

export const LOCALIZED_CONTENT_FIELDS = Object.freeze([
  "title",
  "label",
  "uiTitle",
  "summary",
  "caption",
  "description",
  "tableText",
  "mechanics",
  "narrative",
  "counterplay",
  "altText",
]);

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanRecord(record) {
  if (!isObject(record)) return null;

  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

export function getLocalizedRecord(entry, locale = getCurrentLocale(), fallbackLocale = DEFAULT_LOCALE) {
  const translations = entry?.i18n || entry?.translations || {};
  const normalizedLocale = normalizeLocale(locale);
  const normalizedFallbackLocale = normalizeLocale(fallbackLocale);

  return (
    cleanRecord(translations[normalizedLocale]) ||
    cleanRecord(translations[normalizedFallbackLocale]) ||
    null
  );
}

export function hasLocalizedContent(entry, locale = getCurrentLocale()) {
  const translations = entry?.i18n || entry?.translations || {};
  return Boolean(cleanRecord(translations[normalizeLocale(locale)]));
}

export function getLocalizedField(
  entry,
  field,
  locale = getCurrentLocale(),
  { fallbackLocale = DEFAULT_LOCALE, fallbackValue = "" } = {},
) {
  if (!entry || !field) return fallbackValue;

  const translations = entry.i18n || entry.translations || {};
  const normalizedLocale = normalizeLocale(locale);
  const normalizedFallbackLocale = normalizeLocale(fallbackLocale);
  const localizedValue = translations[normalizedLocale]?.[field];
  const fallbackTranslationValue = translations[normalizedFallbackLocale]?.[field];
  const directValue = entry[field];

  return localizedValue ?? fallbackTranslationValue ?? directValue ?? fallbackValue;
}

export function resolveLocalizedContentEntry(
  entry,
  locale = getCurrentLocale(),
  { fallbackLocale = DEFAULT_LOCALE } = {},
) {
  if (!entry) return entry;

  const normalizedLocale = normalizeLocale(locale);
  const normalizedFallbackLocale = normalizeLocale(fallbackLocale);
  const translations = entry.i18n || entry.translations || {};
  const fallbackRecord = cleanRecord(translations[normalizedFallbackLocale]) || {};
  const localizedRecord = cleanRecord(translations[normalizedLocale]) || {};
  const hasRequestedLocale = Object.keys(localizedRecord).length > 0;

  return {
    ...entry,
    ...fallbackRecord,
    ...localizedRecord,
    locale: normalizedLocale,
    sourceLocale: entry.locale || normalizedFallbackLocale,
    translationLocale: hasRequestedLocale ? normalizedLocale : entry.locale || normalizedFallbackLocale,
  };
}

export function resolveLocalizedContentList(entries = [], locale = getCurrentLocale(), options = {}) {
  return entries.map((entry) => resolveLocalizedContentEntry(entry, locale, options));
}
