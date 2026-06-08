import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../../features/monster-composer/data/monster-grafts.js";
import { monsterGraftToSharedComponent } from "./monster-components.js";

function graft(id) {
  const feature = MONSTER_GRAFTS.find((item) => item.id === id);
  if (!feature) throw new Error(`Missing graft fixture: ${id}`);
  return feature;
}

describe("shared monster components", () => {
  it("preserves authored Decomposition structured rules without legacy inference", () => {
    const component = monsterGraftToSharedComponent(graft("swollen-corpse"));

    expect(component.monster.rules).toBeTruthy();
    expect(component.monster.rules.migration.isStructured).toBe(true);
    expect(component.monster.rules.migration.source).toBe("content-conversion-v1.1");
    expect(component.monster.rules.targeting).toMatchObject({ type: "area", size: 5 });
    expect(component.monster.rules.damage).toMatchObject({ mode: "none" });
  });

  it("preserves explicit structured recharge values", () => {
    const component = monsterGraftToSharedComponent(graft("acid-vomit"));

    expect(component.monster.rules.usage).toMatchObject({ type: "recharge", value: "5-6" });
  });
});
