import { buildMonsterAbilitiesFromFeatures } from "../../model/monster-ability-model.js";
import {
  buildThreeRoundDprProfile as buildBaseThreeRoundDprProfile,
} from "./monster-dpr-simulator.js";

export * from "./monster-dpr-simulator.js";

export const MONSTER_DPR_SIMULATOR_VERSION_CR_SCALED =
  "three-round-dpr-v0.6-cr-scaled-attack-patterns";

export function buildThreeRoundDprProfile(args = {}) {
  const targetCr = Number(args?.computed?.targetCr ?? 0);
  const projectedAbilityModel = buildMonsterAbilitiesFromFeatures(
    args.selectedFeatures || [],
    { targetCr },
  );
  return {
    ...buildBaseThreeRoundDprProfile({
      ...args,
      abilities: projectedAbilityModel.abilities,
    }),
    version: MONSTER_DPR_SIMULATOR_VERSION_CR_SCALED,
    abilityProjection: {
      targetCr,
      grafts: projectedAbilityModel.grafts,
      total: projectedAbilityModel.total,
      synthetic: projectedAbilityModel.synthetic,
      byGraft: projectedAbilityModel.byGraft,
    },
  };
}
