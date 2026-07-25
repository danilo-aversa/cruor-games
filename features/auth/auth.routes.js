import { AUTH_PATHS } from "./auth.constants.js";

export function normalizeAuthReturnPath(value) {
  const candidate = String(value || "").trim();

  if (candidate === AUTH_PATHS.LEGACY_CONTENT_STUDIO) {
    return AUTH_PATHS.CONTENT_STUDIO;
  }

  if (
    candidate === AUTH_PATHS.CREATOR_STUDIO ||
    candidate === AUTH_PATHS.CONTENT_STUDIO ||
    candidate === AUTH_PATHS.OPERATIONS ||
    candidate === AUTH_PATHS.PUBLISHING
  ) {
    return candidate;
  }

  return "";
}

export function buildLoginPath(returnTo = "") {
  const safeReturnPath = normalizeAuthReturnPath(returnTo);
  if (!safeReturnPath) return AUTH_PATHS.LOGIN;

  return `${AUTH_PATHS.LOGIN}?returnTo=${encodeURIComponent(safeReturnPath)}`;
}
