// Active D&D 5E 2024 monster ruleset.
// The Monster Composer should import this through ../rulesets/index.js, not directly.

import {
  MONSTER_RULES_ENGINE_VERSION,
  abilityLabel,
  abilityMod,
  abilityName,
  buildAbilityRows,
  buildDndCompliantMonsterStats,
  buildLegalAbilityProfile,
  buildLegalDamageRoll,
  buildRulesValidation,
  getHitDieForSize,
  getLegalDamageRollForRules,
  getProficiencyBonusForCr,
  getStatBlockSize,
  legalizeHitPoints,
  modText,
  normalizeAbilityKey,
  resolveDamageAbilityModifier,
  scoreForAbilityMod,
} from "./monster-rules-engine.js";
import {
  MONSTER_DPR_SIMULATOR_VERSION,
  buildThreeRoundDprProfile,
} from "./monster-dpr-simulator.js";
import {
  MONSTER_CR_VALIDATOR_VERSION,
  buildMonsterCrValidation,
} from "./monster-cr-validator.js";
import {
  MONSTER_EFFECTIVE_PROFILE_VERSION,
  buildConditionImpactProfile,
  buildEffectiveDefenseProfile,
  buildEffectiveMonsterProfile,
} from "./monster-effective-profile.js";

export * from "./monster-rules-engine.js";
export * from "./monster-dpr-simulator.js";
export * from "./monster-cr-validator.js";
export * from "./monster-effective-profile.js";

export const DND_5E_2024_RULESET_ID = "dnd-5e-2024";

export const dnd5e2024Ruleset = Object.freeze({
  id: DND_5E_2024_RULESET_ID,
  label: "D&D 5E 2024",
  system: "dnd-5e",
  edition: "2024",
  status: "active",
  versions: {
    rulesEngine: MONSTER_RULES_ENGINE_VERSION,
    dprSimulator: MONSTER_DPR_SIMULATOR_VERSION,
    crValidator: MONSTER_CR_VALIDATOR_VERSION,
    effectiveProfile: MONSTER_EFFECTIVE_PROFILE_VERSION,
  },

  // Core math helpers.
  abilityLabel,
  abilityMod,
  abilityName,
  buildAbilityRows,
  buildLegalAbilityProfile,
  buildLegalDamageRoll,
  buildRulesValidation,
  getHitDieForSize,
  getLegalDamageRollForRules,
  getProficiencyBonusForCr,
  getStatBlockSize,
  legalizeHitPoints,
  modText,
  normalizeAbilityKey,
  resolveDamageAbilityModifier,
  scoreForAbilityMod,

  // Stable ruleset-level adapter interface.
  buildRulesProfile: buildDndCompliantMonsterStats,
  buildDndCompliantMonsterStats,
  simulateDpr: buildThreeRoundDprProfile,
  buildThreeRoundDprProfile,
  validateChallenge: buildMonsterCrValidation,
  buildMonsterCrValidation,
  buildEffectiveProfile: buildEffectiveMonsterProfile,
  buildEffectiveMonsterProfile,
  buildEffectiveDefenseProfile,
  buildConditionImpactProfile,
});
