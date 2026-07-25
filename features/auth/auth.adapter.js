import {
  AUTH_ENTITLEMENTS,
  AUTH_ROLES,
  HARD_CODED_ADMIN_CREDENTIALS,
} from "./auth.constants.js";

function normalizeCredential(value) {
  return String(value ?? "").trim();
}

function createPrototypeAdminSession() {
  return {
    schemaVersion: 1,
    provider: "prototype",
    authenticatedAt: new Date().toISOString(),
    user: {
      id: "prototype-admin",
      username: HARD_CODED_ADMIN_CREDENTIALS.username,
      displayName: "Admin",
      role: AUTH_ROLES.ADMIN,
    },
    entitlements: [
      AUTH_ENTITLEMENTS.CREATOR_STUDIO,
      AUTH_ENTITLEMENTS.CONTENT_STUDIO,
      AUTH_ENTITLEMENTS.DEBUG_UI,
    ],
  };
}

/**
 * Prototype authentication boundary.
 * Replace this adapter with Supabase/Patreon orchestration without changing
 * the router, topbar, login page, session storage, or authorization policies.
 */
export async function authenticateCredentials({ username, password } = {}) {
  const normalizedUsername = normalizeCredential(username);
  const normalizedPassword = String(password ?? "");

  if (
    normalizedUsername !== HARD_CODED_ADMIN_CREDENTIALS.username ||
    normalizedPassword !== HARD_CODED_ADMIN_CREDENTIALS.password
  ) {
    return {
      ok: false,
      errorCode: "invalid-credentials",
    };
  }

  return {
    ok: true,
    session: createPrototypeAdminSession(),
  };
}
