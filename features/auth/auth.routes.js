import { AUTH_PATHS } from "./auth.constants.js";

export function normalizeAuthReturnPath(value) {
  const candidate = String(value || "").trim();

  if (candidate === AUTH_PATHS.CONTENT_STUDIO) {
    return AUTH_PATHS.CONTENT_STUDIO;
  }

  return "";
}

export function buildLoginPath(returnTo = "") {
  const safeReturnPath = normalizeAuthReturnPath(returnTo);
  if (!safeReturnPath) return AUTH_PATHS.LOGIN;

  return `${AUTH_PATHS.LOGIN}?returnTo=${encodeURIComponent(safeReturnPath)}`;
}
