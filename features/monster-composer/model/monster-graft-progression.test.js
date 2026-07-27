import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import { buildMonsterAbilityBundleFromGraft } from "./monster-ability-model.js";

function getGraft(id) {
  return MONSTER_GRAFTS.find((graft) => graft.id === id);
}

function getPrimaryAbility(id, targetCr) {
  return buildMonsterAbilityBundleFromGraft(getGraft(id), { targetCr })
    .primaryAbility;
}

describe("generic CR-scaled Graft v2 progression", () => {
  it("scales summon count without adding extra ability entries", () => {
    const low = buildMonsterAbilityBundleFromGraft(getGraft("egg-carrier"), {
      targetCr: 1,
    });
    const apex = buildMonsterAbilityBundleFromGraft(getGraft("egg-carrier"), {
      targetCr: 15,
    });

    expect(low.abilities.filter((ability) => !ability.synthetic)).toHaveLength(1);
    expect(apex.abilities.filter((ability) => !ability.synthetic)).toHaveLength(1);
    expect(low.primaryAbility.rules.summon.count).toBe("1 egg");
    expect(apex.primaryAbility.rules.summon.count).toBe("1d3 eggs");
    expect(low.projection.bandId).not.toBe(apex.projection.bandId);
  });

  it("scales authored area and movement rules by CR", () => {
    const apparitionLow = getPrimaryAbility("horrific-apparition", 1);
    const apparitionHigh = getPrimaryAbility("horrific-apparition", 15);
    const jumpLow = getPrimaryAbility("shadow-jump", 1);
    const jumpHigh = getPrimaryAbility("shadow-jump", 15);

    expect(apparitionLow.rules.targeting.size).toBe(30);
    expect(apparitionHigh.rules.targeting.size).toBe(60);
    expect(jumpLow.rules.procedure.text).toContain("20 feet");
    expect(jumpLow.rules.usage.type).toBe("limited");
    expect(jumpHigh.rules.procedure.text).toContain("60 feet");
    expect(jumpHigh.rules.usage.type).toBe("atWill");
  });

  it("patches weakness mechanics without multiplying the number of actions", () => {
    const low = buildMonsterAbilityBundleFromGraft(
      getGraft("underbelly-weak-spot"),
      { targetCr: 1 },
    );
    const high = buildMonsterAbilityBundleFromGraft(
      getGraft("underbelly-weak-spot"),
      { targetCr: 15 },
    );

    expect(low.primaryAbility.rules.text.effect).toContain("1d6");
    expect(high.primaryAbility.rules.text.effect).toContain("3d6");
    expect(low.abilities).toHaveLength(1);
    expect(high.abilities).toHaveLength(1);
    expect(high.abilities.some((ability) => ability.synthetic)).toBe(false);
  });

  it("preserves the existing Attack Pattern progression contract", () => {
    const low = buildMonsterAbilityBundleFromGraft(getGraft("empowered-slam"), {
      targetCr: 1,
    });
    const apex = buildMonsterAbilityBundleFromGraft(
      getGraft("empowered-slam"),
      { targetCr: 15 },
    );

    expect(low.abilities.map((ability) => ability.localAbilityId)).toEqual([
      "empowered-slam",
    ]);
    expect(apex.abilities.filter((ability) => !ability.synthetic)).toHaveLength(3);
    expect(
      apex.abilities.find((ability) => ability.synthetic).rules.multiattack.count,
    ).toBe(3);
  });
});
