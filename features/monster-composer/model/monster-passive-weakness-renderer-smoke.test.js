import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import { normalizeMonsterGraftRules } from "./monster-graft-rules.schema.js";
import { renderStructuredRulesText } from "./monster-graft-rules.render.js";

const COMPUTED_FIXTURE = Object.freeze({
  dc: 15,
  attack: 6,
  dpr: 30,
  damageText: "30 (4d12 + 4)",
  prof: 3,
});

function getGraft(id) {
  const graft = MONSTER_GRAFTS.find((entry) => entry.id === id);
  if (!graft) throw new Error(`Missing graft: ${id}`);
  return graft;
}

function assertIncludes(id, expected) {
  const text = renderStructuredRulesText(getGraft(id), COMPUTED_FIXTURE) || "";
  if (!text.includes(expected)) {
    throw new Error(`Expected ${id} to include ${JSON.stringify(expected)}. Got: ${text}`);
  }
}

function assertDirection(id, expected) {
  const rules = normalizeMonsterGraftRules(getGraft(id));
  const actual = rules.condition?.direction;
  if (actual !== expected) {
    throw new Error(`Expected ${id} condition.direction ${expected}, got ${actual}`);
  }
}

function assertNoMechanicsFallback(id) {
  const graft = getGraft(id);
  const text = renderStructuredRulesText(graft, COMPUTED_FIXTURE) || "";
  if (!text || text === graft.mechanics) {
    throw new Error(`Expected ${id} to render from structured rules, got mechanics fallback.`);
  }
}

assertDirection("umbral-skin", "self");
assertIncludes("umbral-skin", "the monster has the Invisible condition");
assertNoMechanicsFallback("umbral-skin");

assertDirection("vanish-spirit", "self");
assertIncludes("vanish-spirit", "The monster has the Invisible condition");
assertNoMechanicsFallback("vanish-spirit");

assertDirection("fear-of-fire", "weakness");
assertIncludes("fear-of-fire", "the monster has the Frightened condition");
assertNoMechanicsFallback("fear-of-fire");

assertDirection("eyes-weak-spot", "playerApplied");
assertIncludes("eyes-weak-spot", "the monster has the Blinded condition");
assertNoMechanicsFallback("eyes-weak-spot");

assertDirection("mechanical-stress", "referenceOnly");
assertIncludes("mechanical-stress", "the attacker chooses head, arms, or leg");
assertNoMechanicsFallback("mechanical-stress");

assertDirection("shameful-feeding", "weakness");
assertIncludes("shameful-feeding", "the monster has the Frightened condition");
assertNoMechanicsFallback("shameful-feeding");

console.log("monster-passive-weakness-renderer-smoke: ok");
