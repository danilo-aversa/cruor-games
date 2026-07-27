import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import {
  buildMonsterAbilitiesFromFeatures,
  buildMonsterAbilityBundleFromGraft,
} from "./monster-ability-model.js";
import {
  getMonsterAttackPatternProgressionBand,
  projectMonsterAbilityModelForCr,
} from "./monster-attack-pattern-progression.js";
import { buildMonsterAttackRoutine } from "./monster-attack-routine.js";

const patterns = MONSTER_GRAFTS.filter((graft) => graft.kind === "attackPattern");

describe("CR-scaled Monster Attack Patterns", () => {
  it("uses contiguous progression bands from CR 0 through CR 30", () => {
    patterns.forEach((pattern) => {
      const bands = pattern.progression.bands;
      expect(bands[0].minCr).toBe(0);
      expect(bands.at(-1).maxCr).toBe(30);
      bands.slice(1).forEach((band, index) => {
        expect(band.minCr).toBe(bands[index].maxCr + 1);
      });
    });
  });

  it("never reduces repertoire or cadence as CR rises", () => {
    patterns.forEach((pattern) => {
      let previousOptions = 0;
      let previousCadence = 0;
      [1, 2, 5, 8, 10, 15].forEach((targetCr) => {
        const band = getMonsterAttackPatternProgressionBand(pattern, targetCr);
        const cadence = band.multiattack.enabled ? band.multiattack.count : 1;
        expect(band.abilityIds.length).toBeGreaterThanOrEqual(previousOptions);
        expect(cadence).toBeGreaterThanOrEqual(previousCadence);
        previousOptions = band.abilityIds.length;
        previousCadence = cadence;
      });
    });
  });

  it("updates the full Ability Model, including the synthetic Multiattack count", () => {
    const pattern = patterns.find((entry) => entry.id === "empowered-slam");
    const full = buildMonsterAbilitiesFromFeatures([pattern]);
    const low = projectMonsterAbilityModelForCr(full, 1);
    const apex = projectMonsterAbilityModelForCr(full, 15);
    const apexMultiattack = apex.abilities.find((ability) => ability.synthetic);

    expect(low.abilities.map((ability) => ability.localAbilityId)).toEqual([
      "empowered-slam",
    ]);
    expect(apex.abilities.filter((ability) => !ability.synthetic)).toHaveLength(3);
    expect(apexMultiattack.rules.multiattack.count).toBe(3);
    expect(
      apexMultiattack.rules.multiattack.attacks.reduce(
        (sum, attack) => sum + Number(attack.count || 0),
        0,
      ),
    ).toBe(3);
  });

  it("does not let the automatic planner recreate a disabled low-CR Multiattack", () => {
    const pattern = patterns.find((entry) => entry.id === "empowered-slam");
    const fullBundle = buildMonsterAbilityBundleFromGraft(pattern);
    const lowRoutine = buildMonsterAttackRoutine({
      abilities: fullBundle.abilities,
      targetCr: 1,
      targetDpr: 30,
      monsterTier: { id: "normal" },
      computed: { targetCr: 1, categoryNoun: "zombie" },
    });
    const highRoutine = buildMonsterAttackRoutine({
      abilities: fullBundle.abilities,
      targetCr: 15,
      targetDpr: 30,
      monsterTier: { id: "normal" },
      computed: { targetCr: 15, categoryNoun: "zombie" },
    });

    expect(lowRoutine).toMatchObject({
      enabled: false,
      authority: "cr-progression",
      count: 1,
    });
    expect(highRoutine).toMatchObject({
      enabled: true,
      authority: "authored-pattern",
      count: 3,
    });
  });
});
