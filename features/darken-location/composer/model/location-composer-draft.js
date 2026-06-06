import { toArray } from "./location-composer-state.js";

const LOCATION_DRAFT_STORAGE_KEY = "cruor:darken-location-composer:draft:v1";

function getLocalStorage() {
  if (typeof window === "undefined" || !window.localStorage) return null;

  try {
    const testKey = `${LOCATION_DRAFT_STORAGE_KEY}:test`;
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

export function getLocalDraftStorageStatus() {
  const storage = getLocalStorage();
  return storage
    ? { ok: true, reason: "" }
    : { ok: false, reason: "Browser localStorage is unavailable for this session" };
}

function createDraftStorageResult(ok, draft = null, reason = "") {
  return { ok, draft, reason };
}

function createDraftStatePayload(state) {
  return {
    workflow: state.workflow,
    title: state.title,
    context: state.context,
    horror: state.horror,
    horrors: toArray(state.horrors),
    sourceAnchors: toArray(state.sourceAnchors),
    intrusion: state.intrusion,
    seed: state.seed || "",
    activeSlot: state.activeSlot,
    activeSlotScope: state.activeSlotScope,
    activeRegionId: state.activeRegionId,
    selectedComponentIds: Array.from(state.selectedComponentIds || []),
    slotAssignments: state.slotAssignments || {},
    locationRegions: Array.isArray(state.locationRegions) ? state.locationRegions : [],
  };
}

function createSerializedDraft(state) {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    state: createDraftStatePayload(state),
  };
}

export function createDraftFingerprint(state) {
  return JSON.stringify(createDraftStatePayload(state));
}

export function readStoredLocationDraft() {
  const storage = getLocalStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(LOCATION_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !parsed.state) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

export function getStoredDraftSummary() {
  const draft = readStoredLocationDraft();
  if (!draft) return null;
  return {
    savedAt: draft.savedAt,
    title: draft.state?.title || "Saved Draft",
    context: draft.state?.context || "Location",
    regionCount: Array.isArray(draft.state?.locationRegions)
      ? draft.state.locationRegions.length
      : 0,
  };
}

export function formatDraftTimestamp(value) {
  if (!value) return "No saved draft";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

export function restoreLocationDraftState(draft, fallbackState) {
  const draftState = draft?.state;
  if (!draftState) return fallbackState;

  return {
    ...fallbackState,
    ...draftState,
    sourceAnchors: new Set(draftState.sourceAnchors || []),
    horrors: new Set(draftState.horrors || []),
    selectedComponentIds: new Set(draftState.selectedComponentIds || []),
    slotAssignments: draftState.slotAssignments || {},
    locationRegions: Array.isArray(draftState.locationRegions) && draftState.locationRegions.length
      ? draftState.locationRegions
      : fallbackState.locationRegions,
  };
}

export function saveLocationDraftToStorage(state) {
  const storage = getLocalStorage();
  if (!storage) return null;
  const draft = createSerializedDraft(state);
  storage.setItem(LOCATION_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  return draft;
}

export function saveLocationDraftWithStatus(state) {
  const storage = getLocalStorage();
  if (!storage) {
    return createDraftStorageResult(false, null, "Browser localStorage is unavailable");
  }

  try {
    const draft = createSerializedDraft(state);
    storage.setItem(LOCATION_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return createDraftStorageResult(true, draft, "");
  } catch (error) {
    return createDraftStorageResult(false, null, "Unable to write local draft");
  }
}

export function deleteStoredLocationDraft() {
  const storage = getLocalStorage();
  if (!storage) return false;
  storage.removeItem(LOCATION_DRAFT_STORAGE_KEY);
  return true;
}

export function deleteStoredLocationDraftWithStatus() {
  const storage = getLocalStorage();
  if (!storage) {
    return { ok: false, reason: "Browser localStorage is unavailable" };
  }

  try {
    storage.removeItem(LOCATION_DRAFT_STORAGE_KEY);
    return { ok: true, reason: "" };
  } catch (error) {
    return { ok: false, reason: "Unable to clear local draft" };
  }
}
