import { uniqueById } from "./inspiration-module-schema.js";
import { CORE_INSPIRATION_MODULES } from "./inspiration-modules/core-inspiration-modules.js";
import {
  DECOMPOSITION_INSPIRATION_MODULE,
  DECOMPOSITION_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/decomposition.js";
import {
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
  SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
} from "./inspiration-modules/sedlec-ossuary.js";

/**
 * Production v0.1 Inspiration catalog.
 *
 * This module deliberately imports no semantic v2 candidate. Public registry
 * assembly therefore remains stable while Inspiration Studio selects separate
 * semantic migration modules.
 */
export const PRODUCTION_EXPLICIT_INSPIRATION_MODULES = Object.freeze([
  DECOMPOSITION_INSPIRATION_MODULE,
  SEDLEC_OSSUARY_INSPIRATION_MODULE,
]);

export const PRODUCTION_EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS =
  Object.freeze([
    DECOMPOSITION_SOURCE_ANCHOR_ID,
    SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
  ]);

export const PRODUCTION_EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET =
  new Set(PRODUCTION_EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_IDS);

export const PRODUCTION_CONVERTED_CORE_INSPIRATION_MODULES = Object.freeze(
  CORE_INSPIRATION_MODULES.filter(
    (module) =>
      !PRODUCTION_EXPLICIT_INSPIRATION_MODULE_SOURCE_ANCHOR_ID_SET.has(
        module.id,
      ),
  ),
);

export const PRODUCTION_INSPIRATION_MODULES = Object.freeze(
  uniqueById([
    ...PRODUCTION_EXPLICIT_INSPIRATION_MODULES,
    ...PRODUCTION_CONVERTED_CORE_INSPIRATION_MODULES,
  ]),
);
