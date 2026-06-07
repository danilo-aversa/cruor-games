import {
  getCoreInspirationModule,
  getCoreInspirationModuleReferencedSourceAnchors,
} from "./core-inspiration-modules.js";

export const DECOMPOSITION_SOURCE_ANCHOR_ID = "decomposition";
export const DECOMPOSITION_INSPIRATION_MODULE_PACK_ID = "decomposition-inspiration-module";

export const DECOMPOSITION_INSPIRATION_MODULE = getCoreInspirationModule(DECOMPOSITION_SOURCE_ANCHOR_ID);
export const DECOMPOSITION_SOURCE_ANCHOR = DECOMPOSITION_INSPIRATION_MODULE?.sourceAnchor || null;
export const DECOMPOSITION_INSPIRATION = DECOMPOSITION_INSPIRATION_MODULE?.inspiration || null;
export const DECOMPOSITION_MONSTER_GRAFT_COMPONENTS = Object.freeze(
  (DECOMPOSITION_INSPIRATION_MODULE?.monsterGrafts || []).filter(Boolean),
);
export const DECOMPOSITION_LOCATION_COMPONENTS = Object.freeze(
  (DECOMPOSITION_INSPIRATION_MODULE?.locationComponents || []).filter(Boolean),
);
export const DECOMPOSITION_LOCATION_REGION_COMPONENTS = Object.freeze(
  (DECOMPOSITION_INSPIRATION_MODULE?.locationRegions || []).filter(Boolean),
);
export const DECOMPOSITION_REFERENCED_SOURCE_ANCHORS = Object.freeze(
  getCoreInspirationModuleReferencedSourceAnchors(DECOMPOSITION_SOURCE_ANCHOR_ID),
);
