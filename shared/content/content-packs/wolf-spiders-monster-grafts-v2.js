import { SHARED_MONSTER_COMPONENTS } from "../monster-components.js";

export const WOLF_SPIDERS_MONSTER_GRAFT_V2_SOURCE_MODE =
  "legacy-shared-component-bridge";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export const WOLF_SPIDERS_MONSTER_GRAFT_V2_DEFINITIONS = deepFreeze(
  SHARED_MONSTER_COMPONENTS.filter((component) =>
    component.sourceAnchors?.includes("wolf-spiders"),
  ).map((component) => ({
    id: component.id,
    title: component.title,
    slot: component.monster?.slot || component.slots?.[0] || "",
    summary: component.summary || "",
    mechanics: component.mechanics || component.tableText || "",
    counterplay: component.counterplay || "",
    monster: clone(component.monster),
  })),
);
