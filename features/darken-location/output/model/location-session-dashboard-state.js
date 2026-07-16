export const LOCATION_SESSION_DASHBOARD_STATE_SCHEMA_VERSION =
  "cruor-location-session-dashboard-state-v1";

const STORAGE_PREFIX = "cruor:dark-places:session-dashboard";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function getTrackRange(track = {}) {
  const dashboard = track.metadata?.dashboard || {};
  const minimum = Number.isFinite(Number(dashboard.minimum))
    ? Number(dashboard.minimum)
    : 0;
  const maximum = Number.isFinite(Number(dashboard.maximum))
    ? Math.max(minimum, Number(dashboard.maximum))
    : minimum;
  const initial = Number.isFinite(Number(dashboard.initial))
    ? Math.min(maximum, Math.max(minimum, Number(dashboard.initial)))
    : minimum;
  return { minimum, maximum, initial };
}

function clampTrackValue(track, value) {
  const { minimum, maximum, initial } = getTrackRange(track);
  const number = Number(value);
  return Math.min(
    maximum,
    Math.max(minimum, Number.isFinite(number) ? number : initial),
  );
}

export function getLocationSessionDashboardStorageKey({
  buildId,
  documentVersion,
} = {}) {
  return [
    STORAGE_PREFIX,
    encodeURIComponent(cleanText(buildId, "unknown-build")),
    encodeURIComponent(cleanText(documentVersion, "unknown-document")),
  ].join(":");
}

export function createLocationSessionDashboardState({
  buildId,
  documentVersion,
  guide = {},
  state = {},
} = {}) {
  const normalizedBuildId = cleanText(buildId, "unknown-build");
  const normalizedDocumentVersion = cleanText(
    documentVersion,
    "unknown-document",
  );
  const matchesIdentity =
    state.buildId === normalizedBuildId &&
    state.documentVersion === normalizedDocumentVersion;
  const pressureValues = Object.fromEntries(
    asArray(guide.pressureTracks)
      .map((track) => [
        track.id,
        clampTrackValue(
          track,
          matchesIdentity ? state.pressureValues?.[track.id] : undefined,
        ),
      ])
      .sort(([left], [right]) => left.localeCompare(right)),
  );
  const validNodeIds = new Set(
    asArray(guide.clueFlow?.nodes).map((node) => node.id),
  );
  const discoveredClueIds = matchesIdentity
    ? [...new Set(asArray(state.discoveredClueIds))]
        .filter((id) => validNodeIds.has(id))
        .sort()
    : [];

  return deepFreeze({
    schemaVersion: LOCATION_SESSION_DASHBOARD_STATE_SCHEMA_VERSION,
    buildId: normalizedBuildId,
    documentVersion: normalizedDocumentVersion,
    pressureValues,
    discoveredClueIds,
  });
}

export function updateLocationSessionPressure(state, guide, trackId, delta) {
  const track = asArray(guide?.pressureTracks).find(
    (candidate) => candidate.id === trackId,
  );
  if (!track) return state;
  return createLocationSessionDashboardState({
    buildId: state.buildId,
    documentVersion: state.documentVersion,
    guide,
    state: {
      ...state,
      pressureValues: {
        ...state.pressureValues,
        [trackId]: clampTrackValue(
          track,
          Number(state.pressureValues?.[trackId] || 0) + Number(delta || 0),
        ),
      },
    },
  });
}

export function toggleLocationSessionClue(state, guide, clueId) {
  const validNodeIds = new Set(
    asArray(guide?.clueFlow?.nodes).map((node) => node.id),
  );
  if (!validNodeIds.has(clueId)) return state;
  const discovered = new Set(state.discoveredClueIds);
  if (discovered.has(clueId)) discovered.delete(clueId);
  else discovered.add(clueId);
  return createLocationSessionDashboardState({
    buildId: state.buildId,
    documentVersion: state.documentVersion,
    guide,
    state: {
      ...state,
      discoveredClueIds: [...discovered],
    },
  });
}

export function resetLocationSessionDashboardState(state, guide) {
  return createLocationSessionDashboardState({
    buildId: state.buildId,
    documentVersion: state.documentVersion,
    guide,
  });
}

export function loadLocationSessionDashboardState(storage, identity, guide) {
  if (!storage?.getItem) {
    return createLocationSessionDashboardState({ ...identity, guide });
  }
  try {
    const stored = JSON.parse(
      storage.getItem(getLocationSessionDashboardStorageKey(identity)) ||
        "null",
    );
    return createLocationSessionDashboardState({
      ...identity,
      guide,
      state: stored || {},
    });
  } catch {
    return createLocationSessionDashboardState({ ...identity, guide });
  }
}

export function saveLocationSessionDashboardState(storage, state) {
  if (!storage?.setItem) return false;
  try {
    storage.setItem(
      getLocationSessionDashboardStorageKey(state),
      JSON.stringify(state),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearLocationSessionDashboardState(storage, identity) {
  if (!storage?.removeItem) return false;
  try {
    storage.removeItem(getLocationSessionDashboardStorageKey(identity));
    return true;
  } catch {
    return false;
  }
}
