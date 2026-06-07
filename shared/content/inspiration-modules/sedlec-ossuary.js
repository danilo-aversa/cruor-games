import {
  getCoreInspirationModule,
  getCoreInspirationModuleReferencedSourceAnchors,
} from "./core-inspiration-modules.js";

export const SEDLEC_OSSUARY_SOURCE_ANCHOR_ID = "sedlec-ossuary";
export const SEDLEC_OSSUARY_INSPIRATION_MODULE_PACK_ID = "sedlec-ossuary-inspiration-module";

export const SEDLEC_OSSUARY_INSPIRATION_MODULE = getCoreInspirationModule(SEDLEC_OSSUARY_SOURCE_ANCHOR_ID);
export const SEDLEC_OSSUARY_SOURCE_ANCHOR = SEDLEC_OSSUARY_INSPIRATION_MODULE?.sourceAnchor || null;
export const SEDLEC_OSSUARY_INSPIRATION = SEDLEC_OSSUARY_INSPIRATION_MODULE?.inspiration || null;
export const SEDLEC_OSSUARY_MONSTER_GRAFT_COMPONENTS = Object.freeze(
  (SEDLEC_OSSUARY_INSPIRATION_MODULE?.monsterGrafts || []).filter(Boolean),
);
export const SEDLEC_OSSUARY_LOCATION_COMPONENTS = Object.freeze(
  (SEDLEC_OSSUARY_INSPIRATION_MODULE?.locationComponents || []).filter(Boolean),
);
export const SEDLEC_OSSUARY_LOCATION_REGION_COMPONENTS = Object.freeze(
  (SEDLEC_OSSUARY_INSPIRATION_MODULE?.locationRegions || []).filter(Boolean),
);
export const SEDLEC_OSSUARY_REFERENCED_SOURCE_ANCHORS = Object.freeze(
  getCoreInspirationModuleReferencedSourceAnchors(SEDLEC_OSSUARY_SOURCE_ANCHOR_ID),
);
