import { AUTH_SESSION_STORAGE_KEY } from "./auth.constants.js";

function getSessionStorage() {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function isValidAuthSession(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      value.schemaVersion === 1 &&
      typeof value.provider === "string" &&
      value.user &&
      typeof value.user === "object" &&
      typeof value.user.id === "string" &&
      typeof value.user.username === "string" &&
      typeof value.user.role === "string" &&
      Array.isArray(value.entitlements),
  );
}

export function readAuthSession() {
  const storage = getSessionStorage();
  if (!storage) return null;

  try {
    const serializedSession = storage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!serializedSession) return null;

    const session = JSON.parse(serializedSession);
    if (isValidAuthSession(session)) return session;
  } catch {
    // Invalid prototype sessions are discarded below.
  }

  storage.removeItem(AUTH_SESSION_STORAGE_KEY);
  return null;
}

export function saveAuthSession(session) {
  if (!isValidAuthSession(session)) {
    throw new TypeError("A valid Cruor auth session is required.");
  }

  getSessionStorage()?.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify(session),
  );

  return session;
}

export function clearAuthSession() {
  getSessionStorage()?.removeItem(AUTH_SESSION_STORAGE_KEY);
}
