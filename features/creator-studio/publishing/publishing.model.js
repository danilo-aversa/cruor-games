import {
  ENGAGEMENT_BASELINES,
  ENGAGEMENT_HOURS,
  INITIAL_PUBLISHING_RELEASES,
  PUBLISHING_STORAGE_KEYS,
  RELEASE_DATE_OFFSETS,
} from "./publishing.data.js";

const DAY_RANKS = Object.freeze({
  MON: 0,
  TUE: 1,
  WED: 2,
  THU: 3,
  FRI: 4,
  SAT: 5,
  SUN: 6,
});

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readStoredJson(key, fallback) {
  if (!canUseStorage()) return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function parseLocalDate(value) {
  const parts = String(value || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
}

export function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysToDateValue(value, days) {
  const date = parseLocalDate(value);
  if (!date) return "";
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function getNextMondayValue(referenceDate = new Date()) {
  const date = new Date(referenceDate);
  date.setHours(12, 0, 0, 0);
  const daysUntilMonday = (8 - date.getDay()) % 7;
  date.setDate(date.getDate() + daysUntilMonday);
  return toDateInputValue(date);
}

export function getShortWeekday(value, locale = "en-US") {
  const date = parseLocalDate(value);
  return date
    ? new Intl.DateTimeFormat(locale, { weekday: "short" })
        .format(date)
        .toUpperCase()
    : "DATE";
}

export function formatCalendarDate(value, locale = "en-US") {
  const date = parseLocalDate(value);
  return date
    ? new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date)
    : "Date not set";
}

export function formatCompactDate(value, locale = "en-US") {
  const date = parseLocalDate(value);
  return date
    ? new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
      }).format(date)
    : "Unscheduled";
}

export function cloneInitialReleases() {
  return INITIAL_PUBLISHING_RELEASES.map((release) => ({
    ...release,
    image: { ...release.image },
    slides: release.slides.map((slide) => [...slide]),
  }));
}

export function applyReleaseCadence(releases, startValue) {
  const validStart = parseLocalDate(startValue)
    ? startValue
    : getNextMondayValue();
  const orderedIds = [...releases]
    .sort((left, right) => {
      if (left.week !== right.week) return left.week - right.week;
      return (DAY_RANKS[left.day] ?? 99) - (DAY_RANKS[right.day] ?? 99);
    })
    .map((release) => release.id);

  const indexById = new Map(orderedIds.map((id, index) => [id, index]));

  return releases.map((release) => {
    const cadenceIndex = indexById.get(release.id) ?? 0;
    const publishDate = addDaysToDateValue(
      validStart,
      RELEASE_DATE_OFFSETS[cadenceIndex] ?? cadenceIndex * 2,
    );

    return {
      ...release,
      publishDate,
      day: getShortWeekday(publishDate),
    };
  });
}

export function loadPublishingState() {
  const overrides = readStoredJson(
    PUBLISHING_STORAGE_KEYS.RELEASE_OVERRIDES,
    {},
  );
  const published = readStoredJson(
    PUBLISHING_STORAGE_KEYS.PUBLISHED_RELEASES,
    {},
  );
  const storedSeasonStart = canUseStorage()
    ? window.localStorage.getItem(PUBLISHING_STORAGE_KEYS.SEASON_START)
    : "";
  const seasonStart = parseLocalDate(storedSeasonStart)
    ? storedSeasonStart
    : getNextMondayValue();

  let releases = cloneInitialReleases().map((release) => ({
    ...release,
    ...(overrides[release.id] || {}),
    instagramKind:
      overrides[release.id]?.instagramKind || release.instagramKind || "post",
  }));

  if (releases.some((release) => !parseLocalDate(release.publishDate))) {
    releases = applyReleaseCadence(releases, seasonStart);
  }

  const activeReleaseId = canUseStorage()
    ? window.localStorage.getItem(PUBLISHING_STORAGE_KEYS.ACTIVE_RELEASE)
    : "";

  return {
    activeReleaseId: releases.some((release) => release.id === activeReleaseId)
      ? activeReleaseId
      : releases[0]?.id || "",
    published,
    releases,
    seasonStart,
  };
}

export function persistPublishingState({
  activeReleaseId,
  published,
  releases,
  seasonStart,
}) {
  if (!canUseStorage()) return;

  const overrides = Object.fromEntries(
    releases.map((release) => [
      release.id,
      {
        cta: release.cta,
        day: release.day,
        goal: release.goal,
        instagramKind: release.instagramKind || "post",
        publishDate: release.publishDate,
        publishTime: release.publishTime || "",
        summary: release.summary,
        title: release.title,
        type: release.type,
      },
    ]),
  );

  window.localStorage.setItem(
    PUBLISHING_STORAGE_KEYS.RELEASE_OVERRIDES,
    JSON.stringify(overrides),
  );
  window.localStorage.setItem(
    PUBLISHING_STORAGE_KEYS.PUBLISHED_RELEASES,
    JSON.stringify(published),
  );
  window.localStorage.setItem(
    PUBLISHING_STORAGE_KEYS.SEASON_START,
    seasonStart,
  );
  window.localStorage.setItem(
    PUBLISHING_STORAGE_KEYS.ACTIVE_RELEASE,
    activeReleaseId,
  );
}

export function getSeasonDateRange(releases, locale = "en-US") {
  const dates = releases
    .map((release) => release.publishDate)
    .filter((value) => parseLocalDate(value))
    .sort();
  if (!dates.length) return "Dates not set";

  return `${formatCalendarDate(dates[0], locale)} — ${formatCalendarDate(
    dates[dates.length - 1],
    locale,
  )}`;
}

export function getWeekDateRange(releases, locale = "en-US") {
  const dates = releases
    .map((release) => release.publishDate)
    .filter((value) => parseLocalDate(value))
    .sort();
  if (!dates.length) return "Dates not set";

  return `${formatCompactDate(dates[0], locale)}–${formatCompactDate(
    dates[dates.length - 1],
    locale,
  )}`;
}

export function buildEngagementForecast(release, platform = "instagram") {
  const platformKey = platform === "facebook" ? "facebook" : platform;
  const baseline =
    ENGAGEMENT_BASELINES[platformKey] || ENGAGEMENT_BASELINES.instagram;
  const date = parseLocalDate(release.publishDate);
  const weekday = date ? date.getDay() : 1;
  const seed = Math.max(
    1,
    INITIAL_PUBLISHING_RELEASES.findIndex(
      (candidate) => candidate.id === release.id,
    ) + 1,
  );
  const values = baseline.map((value, index) => {
    const variation = ((seed * 7 + weekday * 5 + index * 3) % 9) - 4;
    const fridayLift = weekday === 5 && index >= 5 ? 5 : 0;
    const sundayLift = weekday === 0 && index >= 6 ? 4 : 0;
    return Math.max(
      18,
      Math.min(100, value + variation + fridayLift + sundayLift),
    );
  });
  const bestIndex = values.indexOf(Math.max(...values));

  return {
    bestIndex,
    bestTime: ENGAGEMENT_HOURS[bestIndex],
    values,
  };
}

export function getCaptionText(caption = "") {
  return String(caption)
    .replace(/<strong>.*?<\/strong>\s*/i, "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
