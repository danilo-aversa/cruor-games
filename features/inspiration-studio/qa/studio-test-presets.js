export const STUDIO_TEST_IDS = Object.freeze({
  monsterBatch: "monster-batch-qa",
  mapBatch: "map-batch-qa",
  monsterPerGraft: "monster-per-graft-qa",
});

export const STUDIO_TEST_PRESET_STORAGE_KEY = "cruor-studio-test-presets-v1";

const TEST_META = Object.freeze({
  [STUDIO_TEST_IDS.monsterBatch]: {
    label: "Monster Batch QA",
    icon: "fa-dragon",
  },
  [STUDIO_TEST_IDS.mapBatch]: {
    label: "Map Batch QA",
    icon: "fa-map-location-dot",
  },
  [STUDIO_TEST_IDS.monsterPerGraft]: {
    label: "Monster Per-Graft QA",
    icon: "fa-vials",
  },
});

const OFFICIAL_STUDIO_TEST_PRESETS = Object.freeze([
  {
    id: "official-map-qa-smoke-25",
    testId: STUDIO_TEST_IDS.mapBatch,
    name: "Map QA — Smoke 25",
    version: "map-batch-qa-v0.4-official",
    presetKind: "official",
    locked: true,
    createdAt: "2026-06-18T00:00:00.000Z",
    updatedAt: "2026-06-18T00:00:00.000Z",
    params: {
      count: 25,
      roomCountMin: 4,
      roomCountMax: 8,
      seed: "cruor-map-qa-smoke",
      qaMode: "realistic",
      themeId: "mixed",
      context: "mixed",
      includeFullPayloads: false,
      includeFailingSvg: true,
      exportMode: "debug",
    },
  },
  {
    id: "official-map-qa-standard-100",
    testId: STUDIO_TEST_IDS.mapBatch,
    name: "Map QA — Standard 100",
    version: "map-batch-qa-v0.4-official",
    presetKind: "official",
    locked: true,
    createdAt: "2026-06-18T00:00:00.000Z",
    updatedAt: "2026-06-18T00:00:00.000Z",
    params: {
      count: 100,
      roomCountMin: 4,
      roomCountMax: 12,
      seed: "cruor-map-qa-standard",
      qaMode: "realistic",
      themeId: "mixed",
      context: "mixed",
      includeFullPayloads: false,
      includeFailingSvg: true,
      exportMode: "debug",
    },
  },
  {
    id: "official-map-qa-regression-250",
    testId: STUDIO_TEST_IDS.mapBatch,
    name: "Map QA — Regression 250",
    version: "map-batch-qa-v0.4-official",
    presetKind: "official",
    locked: true,
    createdAt: "2026-06-18T00:00:00.000Z",
    updatedAt: "2026-06-18T00:00:00.000Z",
    params: {
      count: 250,
      roomCountMin: 4,
      roomCountMax: 12,
      seed: "cruor-map-qa-regression",
      qaMode: "realistic",
      themeId: "mixed",
      context: "mixed",
      includeFullPayloads: false,
      includeFailingSvg: true,
      exportMode: "debug",
    },
  },
  {
    id: "official-map-qa-stress-500",
    testId: STUDIO_TEST_IDS.mapBatch,
    name: "Map QA — Stress 500",
    version: "map-batch-qa-v0.4-official",
    presetKind: "official",
    locked: true,
    createdAt: "2026-06-18T00:00:00.000Z",
    updatedAt: "2026-06-18T00:00:00.000Z",
    params: {
      count: 500,
      roomCountMin: 4,
      roomCountMax: 16,
      seed: "cruor-map-qa-stress",
      qaMode: "stress",
      themeId: "mixed",
      context: "mixed",
      includeFullPayloads: false,
      includeFailingSvg: true,
      exportMode: "debug",
    },
  },
  {
    id: "official-map-qa-chapel-focus",
    testId: STUDIO_TEST_IDS.mapBatch,
    name: "Map QA — Chapel Focus",
    version: "map-batch-qa-v0.4-official",
    presetKind: "official",
    locked: true,
    createdAt: "2026-06-18T00:00:00.000Z",
    updatedAt: "2026-06-18T00:00:00.000Z",
    params: {
      count: 120,
      roomCountMin: 6,
      roomCountMax: 12,
      seed: "cruor-map-qa-chapel-focus",
      qaMode: "stress",
      themeId: "mixed",
      context: "Chapel",
      includeFullPayloads: false,
      includeFailingSvg: true,
      exportMode: "debug",
    },
  },
  {
    id: "official-map-qa-noble-house-focus",
    testId: STUDIO_TEST_IDS.mapBatch,
    name: "Map QA — Noble House Focus",
    version: "map-batch-qa-v0.4-official",
    presetKind: "official",
    locked: true,
    createdAt: "2026-06-18T00:00:00.000Z",
    updatedAt: "2026-06-18T00:00:00.000Z",
    params: {
      count: 120,
      roomCountMin: 6,
      roomCountMax: 12,
      seed: "cruor-map-qa-noble-house-focus",
      qaMode: "stress",
      themeId: "mixed",
      context: "Noble House",
      includeFullPayloads: false,
      includeFailingSvg: true,
      exportMode: "debug",
    },
  },
  {
    id: "official-map-qa-high-room-count",
    testId: STUDIO_TEST_IDS.mapBatch,
    name: "Map QA — High Room Count",
    version: "map-batch-qa-v0.4-official",
    presetKind: "official",
    locked: true,
    createdAt: "2026-06-18T00:00:00.000Z",
    updatedAt: "2026-06-18T00:00:00.000Z",
    params: {
      count: 160,
      roomCountMin: 10,
      roomCountMax: 16,
      seed: "cruor-map-qa-high-room-count",
      qaMode: "realistic",
      themeId: "mixed",
      context: "mixed",
      includeFullPayloads: false,
      includeFailingSvg: true,
      exportMode: "debug",
    },
  },
]);

function cloneJson(value, fallback) {
  try {
    return JSON.parse(JSON.stringify(value ?? fallback));
  } catch (error) {
    return fallback;
  }
}

function cleanString(value) {
  return String(value || "").trim();
}

function createPresetId(testId) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `studio-test-preset-${testId}-${Date.now()}-${suffix}`;
}

function normalizePresetRecord(record) {
  if (!record || typeof record !== "object") return null;
  const testId = cleanString(record.testId);
  if (!TEST_META[testId]) return null;
  const name = cleanString(record.name);
  if (!name) return null;

  return {
    id: cleanString(record.id) || createPresetId(testId),
    testId,
    name,
    version: cleanString(record.version),
    createdAt: cleanString(record.createdAt) || new Date().toISOString(),
    updatedAt: cleanString(record.updatedAt) || cleanString(record.createdAt) || new Date().toISOString(),
    presetKind: cleanString(record.presetKind),
    locked: Boolean(record.locked),
    params: cloneJson(record.params, {}),
  };
}

export function getStudioTestMeta(testId) {
  return TEST_META[testId] || { label: "Studio Test", icon: "fa-vial" };
}

export function getStudioTestLabel(testId) {
  return getStudioTestMeta(testId).label;
}

export function getStudioTestIcon(testId) {
  return getStudioTestMeta(testId).icon;
}

export function getOfficialStudioTestPresets() {
  return OFFICIAL_STUDIO_TEST_PRESETS.map(normalizePresetRecord).filter(Boolean);
}

function readUserStudioTestPresets() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage?.getItem(STUDIO_TEST_PRESET_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizePresetRecord).filter(Boolean).filter((preset) => !preset.locked) : [];
  } catch (error) {
    return [];
  }
}

export function readStudioTestPresets() {
  const officialPresets = getOfficialStudioTestPresets();
  const userPresets = readUserStudioTestPresets();
  return [...officialPresets, ...userPresets];
}

export function writeStudioTestPresets(presets) {
  if (typeof window === "undefined") return [];
  const normalized = Array.isArray(presets) ? presets.map(normalizePresetRecord).filter(Boolean).filter((preset) => !preset.locked) : [];
  window.localStorage?.setItem(STUDIO_TEST_PRESET_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function saveStudioTestPreset(preset) {
  const normalized = normalizePresetRecord({
    ...preset,
    id: preset?.id || createPresetId(preset?.testId),
    createdAt: preset?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  if (!normalized) return null;
  const presets = readUserStudioTestPresets();
  const nextPresets = [normalized, ...presets.filter((item) => item.id !== normalized.id)].slice(0, 24);
  writeStudioTestPresets(nextPresets);
  return normalized;
}

export function deleteStudioTestPreset(presetId) {
  const presets = readUserStudioTestPresets();
  const nextPresets = presets.filter((item) => item.id !== presetId);
  writeStudioTestPresets(nextPresets);
  return readStudioTestPresets();
}
