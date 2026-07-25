export const AUTH_ROLES = Object.freeze({
  ADMIN: "admin",
});

export const AUTH_ENTITLEMENTS = Object.freeze({
  CREATOR_STUDIO: "creator-studio",
  CONTENT_STUDIO: "content-studio",
  DEBUG_UI: "debug-ui",
});

export const AUTH_PATHS = Object.freeze({
  LOGIN: "/login",
  CREATOR_STUDIO: "/creator-studio",
  CONTENT_STUDIO: "/creator-studio/content",
  OPERATIONS: "/creator-studio/operations",
  PUBLISHING: "/creator-studio/publishing",
  LEGACY_CONTENT_STUDIO: "/inspiration-studio",
});

export const AUTH_SESSION_STORAGE_KEY = "cruor.auth.session";

export const HARD_CODED_ADMIN_CREDENTIALS = Object.freeze({
  username: "admin",
  password: "admin",
});
