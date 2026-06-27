import { describe, expect, it } from "vitest";

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

function expectRenderedTextToInclude(id, expected) {
  const text = renderStructuredRulesText(getGraft(id), COMPUTED_FIXTURE) || "";
  expect(text, `${id} rendered text`).toContain(expected);
}

function expectDirection(id, expected) {
  const rules = normalizeMonsterGraftRules(getGraft(id));
  expect(rules.condition?.direction, `${id} condition.direction`).toBe(expected);
}

function expectStructuredRulesRender(id) {
  const graft = getGraft(id);
  const text = renderStructuredRulesText(graft, COMPUTED_FIXTURE) || "";
  expect(text, `${id} rendered text`).toBeTruthy();
  expect(text, `${id} should not use mechanics fallback`).not.toBe(graft.mechanics);
}

describe("Monster passive weakness renderer smoke", () => {
  it("renders passive weakness rules from structured rules instead of mechanics fallback", () => {
    expectDirection("umbral-skin", "self");
    expectRenderedTextToInclude("umbral-skin", "the monster has the Invisible condition");
    expectStructuredRulesRender("umbral-skin");

    expectDirection("vanish-spirit", "self");
    expectRenderedTextToInclude("vanish-spirit", "The monster has the Invisible condition");
    expectStructuredRulesRender("vanish-spirit");

    expectDirection("fear-of-fire", "weakness");
    expectRenderedTextToInclude("fear-of-fire", "the monster has the Frightened condition");
    expectStructuredRulesRender("fear-of-fire");

    expectDirection("eyes-weak-spot", "playerApplied");
    expectRenderedTextToInclude("eyes-weak-spot", "the monster has the Blinded condition");
    expectStructuredRulesRender("eyes-weak-spot");

    expectDirection("mechanical-stress", "referenceOnly");
    expectRenderedTextToInclude("mechanical-stress", "the attacker chooses head, arms, or leg");
    expectStructuredRulesRender("mechanical-stress");

    expectDirection("shameful-feeding", "weakness");
    expectRenderedTextToInclude("shameful-feeding", "the monster has the Frightened condition");
    expectStructuredRulesRender("shameful-feeding");
  });
});
