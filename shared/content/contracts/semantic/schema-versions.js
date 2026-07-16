export const SEMANTIC_SCHEMA_VERSIONS = Object.freeze({
  CONTENT_PACK: "cruor-content-pack-v0.2",
  SOURCE_ANCHOR: "cruor-source-anchor-v1",
  INSPIRATION: "cruor-inspiration-v2",
  INSPIRATION_MODULE: "cruor-inspiration-module-v2",
  COMPONENT: "cruor-component-v2",
  PROVENANCE: "cruor-semantic-provenance-v1",
  PLACE_IDENTITY: "cruor-place-identity-v1",
  SITE_ATMOSPHERE: "cruor-site-atmosphere-v1",
  GLOBAL_RULE: "cruor-global-rule-v1",
  RECURRING_SIGN: "cruor-recurring-sign-v1",
  SENSORY_PROFILE: "cruor-sensory-profile-v1",
  READ_ALOUD_PROFILE: "cruor-read-aloud-profile-v1",
  SESSION_GUIDE: "cruor-session-guide-v1",
  MECHANICAL_SCALING: "cruor-mechanical-scaling-v1",
  LOCATION_DOCUMENT: "cruor-location-document-v2",
  SESSION_STATE: "cruor-session-state-v1",
});

export const SEMANTIC_CAPABILITIES = Object.freeze([
  "inspiration-archive",
  "dark-places",
  "monster-composer",
]);

export const DARK_PLACES_SEMANTIC_TYPES = Object.freeze([
  "place-identity",
  "site-atmosphere",
  "global-rule",
  "recurring-sign",
  "sensory-profile",
  "read-aloud-profile",
  "session-guide",
  "location-stake",
  "visible-feature",
  "interaction",
  "hazard",
  "clue",
  "encounter-twist",
  "secret",
  "reward",
  "room-design",
  "location-region",
]);

export const COMPONENT_SEMANTIC_TYPES = Object.freeze([
  ...DARK_PLACES_SEMANTIC_TYPES,
  "monster-graft",
]);

export const MODULE_STATUSES = Object.freeze([
  "draft",
  "in-review",
  "published",
  "retired",
]);

export const INSPIRATION_STATUSES = Object.freeze([
  "draft",
  "in-review",
  "approved",
  "rejected",
]);

export const COMPONENT_STATUSES = Object.freeze([
  "draft",
  "in-review",
  "published",
  "retired",
]);

export const PACK_STATUSES = Object.freeze(["draft", "published", "retired"]);
