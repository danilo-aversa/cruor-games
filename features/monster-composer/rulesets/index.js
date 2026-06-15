// Central registry for monster rulesets.
// Keep system-specific math behind this interface so Cruor grafts can later target D&D 2014, PF2E, or other engines.

import { dnd5e2024Ruleset } from "./dnd-5e-2024/index.js";
import { dnd5e2014Ruleset } from "./dnd-5e-2014/index.js";
import { pf2eRuleset } from "./pf2e/index.js";

export const DEFAULT_MONSTER_RULESET_ID = dnd5e2024Ruleset.id;

export const MONSTER_RULESETS = Object.freeze({
  [dnd5e2024Ruleset.id]: dnd5e2024Ruleset,
  [dnd5e2014Ruleset.id]: dnd5e2014Ruleset,
  [pf2eRuleset.id]: pf2eRuleset,
});

export const MONSTER_RULESET_OPTIONS = Object.freeze(
  [dnd5e2024Ruleset, dnd5e2014Ruleset, pf2eRuleset].map((ruleset) => ({
    id: ruleset.id,
    label: ruleset.label,
    system: ruleset.system,
    edition: ruleset.edition,
    status: ruleset.status,
  })),
);

export function getMonsterRulesetOption(rulesetId = DEFAULT_MONSTER_RULESET_ID) {
  return MONSTER_RULESET_OPTIONS.find((ruleset) => ruleset.id === rulesetId) || MONSTER_RULESET_OPTIONS[0];
}

export function getMonsterRuleset(rulesetId = DEFAULT_MONSTER_RULESET_ID) {
  const ruleset = MONSTER_RULESETS[rulesetId] || MONSTER_RULESETS[DEFAULT_MONSTER_RULESET_ID];
  if (ruleset?.status === "placeholder") {
    return MONSTER_RULESETS[DEFAULT_MONSTER_RULESET_ID];
  }
  return ruleset;
}
