import { AUTH_ENTITLEMENTS, AUTH_ROLES } from "./auth.constants.js";
import { isValidAuthSession } from "./auth.session.js";

export function isAuthenticated(session) {
  return isValidAuthSession(session);
}

export function hasAuthRole(session, role) {
  return isAuthenticated(session) && session.user.role === role;
}

export function hasAuthEntitlement(session, entitlement) {
  return (
    isAuthenticated(session) && session.entitlements.includes(entitlement)
  );
}

export function canAccessCreatorStudio(session) {
  return (
    hasAuthRole(session, AUTH_ROLES.ADMIN) &&
    (hasAuthEntitlement(session, AUTH_ENTITLEMENTS.CREATOR_STUDIO) ||
      hasAuthEntitlement(session, AUTH_ENTITLEMENTS.CONTENT_STUDIO))
  );
}

export function canAccessContentStudio(session) {
  return (
    hasAuthRole(session, AUTH_ROLES.ADMIN) &&
    hasAuthEntitlement(session, AUTH_ENTITLEMENTS.CONTENT_STUDIO)
  );
}

export function canUseDebugMode(session) {
  return (
    hasAuthRole(session, AUTH_ROLES.ADMIN) &&
    hasAuthEntitlement(session, AUTH_ENTITLEMENTS.DEBUG_UI)
  );
}
