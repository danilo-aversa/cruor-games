import { describe, expect, it } from "vitest";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import { MONSTER_FAMILY_PRESETS } from "../data/monster-presets.js";
import {
  buildMonsterAbilityBundleFromGraft,
  expandMonsterFeaturesForStatBlock,
} from "./monster-ability-model.js";
import {
  buildMonsterAttackPatternCatalogAudit,
  buildMonsterAttackPatternReport,
  isMonsterAttackPattern,
} from "./monster-attack-pattern.js";
import { buildMonsterAttackRoutine } from "./monster-attack-routine.js";

const patterns = MONSTER_GRAFTS.filter(isMonsterAttackPattern);
const byId = new Map(patterns.map((pattern) => [pattern.id, pattern]));

describe("Monster Attack Patterns v2", () => {
  it("migrates every Attack-slot graft while preserving its public id", () => {
    const attackGrafts = MONSTER_GRAFTS.filter((graft) => graft.slot === "attack");
    expect(attackGrafts).toHaveLength(15);
    expect(patterns).toHaveLength(15);
    expect(patterns.map((pattern) => pattern.id)).toEqual(
      attackGrafts.map((graft) => graft.id),
    );
  });

  it("passes the complete editorial and runtime catalog gate", () => {
    const audit = buildMonsterAttackPatternCatalogAudit(MONSTER_GRAFTS);
    expect(audit.total).toBe(15);
    expect(audit.passing).toBe(15);
    expect(audit.error).toBe(0);
    expect(audit.checkpointSummary).toHaveLength(6);
    expect(audit.checkpointSummary.every((checkpoint) => checkpoint.calibrationPass)).toBe(true);
    expect(audit.pass).toBe(true);
  });

  it("projects repertoire and cadence from the target CR", () => {
    patterns.forEach((pattern) => {
      const low = buildMonsterAbilityBundleFromGraft(pattern, { targetCr: 1 });
      const apex = buildMonsterAbilityBundleFromGraft(pattern, { targetCr: 15 });
      const lowAuthored = low.abilities.filter((ability) => !ability.synthetic);
      const apexAuthored = apex.abilities.filter((ability) => !ability.synthetic);
      expect(low.validation.status).not.toBe("error");
      expect(apex.validation.status).not.toBe("error");
      expect(lowAuthored.length).toBeGreaterThanOrEqual(1);
      expect(apexAuthored).toHaveLength(pattern.abilities.length);
      expect(apexAuthored.length).toBeGreaterThanOrEqual(lowAuthored.length);
      expect(apex.abilities.some((ability) => ability.synthetic)).toBe(true);
      expect(apex.routine.multiattack.count).toBeGreaterThanOrEqual(2);
    });
  });

  it("resolves authored primary attacks by runtime/local ability id, not the shared graft id", () => {
    const pattern = byId.get("empowered-slam");
    const bundle = buildMonsterAbilityBundleFromGraft(pattern);
    const routine = buildMonsterAttackRoutine({
      abilities: bundle.abilities,
      targetCr: 6,
      targetDpr: 30,
      monsterTier: { id: "normal" },
    });
    expect(routine.authority).toBe("authored-pattern");
    expect(routine.allocations["empowered-slam:empowered-slam"]).toBeTruthy();
    expect(routine.allocations["empowered-slam:multiattack"]).toBeUndefined();
    expect(routine.attacks[0].featureId).toBe("empowered-slam");
    expect(routine.attacks[0].abilityId).toBe("empowered-slam:empowered-slam");
    expect(routine.authoredPlan.defaultSequence.every((entry) => entry.abilityId)).toBe(true);
  });

  it("keeps choice repertoires as distinct DPR allocations", () => {
    const choicePattern = patterns.find((pattern) => pattern.routine.multiattack.mode === "choice");
    expect(choicePattern).toBeTruthy();
    const report = buildMonsterAttackPatternReport(choicePattern);
    expect(report.pass).toBe(true);
    expect(report.multiattack.allocationKeys.length).toBeGreaterThanOrEqual(2);
    expect(new Set(report.multiattack.allocationKeys).size).toBe(
      report.multiattack.allocationKeys.length,
    );
  });

  it("allows repeated single-action Multiattack only when repetition is explicitly intentional", () => {
    patterns.forEach((pattern) => {
      const refs = new Set(pattern.routine.multiattack.attacks.map((attack) => attack.ref));
      if (pattern.routine.multiattack.count > 1 && refs.size === 1) {
        expect(pattern.routine.intentionalRepetition).toBe(true);
        expect(pattern.routine.repetitionReason).toBeTruthy();
      }
    });
  });

  it("expands a selected pattern into stat-block abilities without changing legacy features", () => {
    const pattern = byId.get("acid-vomit");
    const legacy = MONSTER_GRAFTS.find((graft) => graft.slot !== "attack");
    const low = expandMonsterFeaturesForStatBlock([legacy, pattern], { targetCr: 1 });
    const high = expandMonsterFeaturesForStatBlock([legacy, pattern], { targetCr: 15 });
    expect(low[0]).toBe(legacy);
    expect(high[0]).toBe(legacy);
    expect(low.slice(1).filter((ability) => !ability.synthetic).length).toBe(1);
    expect(high.slice(1).filter((ability) => !ability.synthetic)).toHaveLength(pattern.abilities.length);
    expect(high.slice(1).some((ability) => ability.synthetic)).toBe(true);
  });

  it("keeps every preset Attack selection resolvable after migration", () => {
    MONSTER_FAMILY_PRESETS.forEach((preset) => {
      const attackSelection = preset.selection?.attack;
      const ids = Array.isArray(attackSelection) ? attackSelection : [attackSelection].filter(Boolean);
      ids.forEach((id) => expect(byId.has(id)).toBe(true));
    });
  });
});
