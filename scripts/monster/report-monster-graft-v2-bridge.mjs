import assert from "node:assert/strict";
import { MONSTER_GRAFTS } from "../../features/monster-composer/data/monster-grafts.js";
import {
  buildMonsterAbilitiesFromFeatures,
  buildMonsterAbilityBundleFromGraft,
} from "../../features/monster-composer/model/monster-ability-model.js";
import { buildMonsterAttackRoutine } from "../../features/monster-composer/model/monster-attack-routine.js";
import { normalizeMonsterGraftRules } from "../../features/monster-composer/model/monster-graft-rules.schema.js";

function buildRules({ budgetRole = "mainAttack", budgetShare = 0.6 } = {}) {
  return {
    schemaVersion: "monster-graft-rules-v1.15",
    section: "action",
    actionEconomy: "action",
    usage: { type: "atWill" },
    trigger: null,
    resolution: {
      type: "attackRoll",
      attackType: "melee",
      abilityBasis: "strength",
      bonus: "monster",
    },
    secondaryResolution: null,
    targeting: { type: "single", targets: "one creature" },
    areaEffect: null,
    damage: {
      mode: "budget",
      budgetRole,
      budgetShare,
      expectedTargets: 1,
      roundWeight: [1, 1, 1],
      types: ["bludgeoning"],
      scale: "standard",
      parts: [],
    },
    condition: null,
    counterplay: {
      telegraph: true,
      breakCondition: false,
      positioningAnswer: true,
      nonDamageAnswer: false,
    },
    text: {},
    multiattack: null,
    multiattackParticipation: null,
    spellcasting: null,
    defense: null,
    summon: null,
    procedure: null,
    references: [],
    ongoing: null,
    migration: { source: "phase-2-audit", isStructured: true },
  };
}

function buildSyntheticAttackPattern() {
  return {
    schemaVersion: "monster-graft-v2.0",
    id: "phase-2-pressure-collapse",
    title: "Phase 2 Pressure Collapse",
    kind: "attackPattern",
    slot: "attack",
    source: "decomposition",
    sourceAnchors: ["decomposition"],
    identity: {
      fantasy: "A swollen corpse weaponizes its mass.",
      tacticalRole: "single-target displacement",
      signature: "impact and rupture",
    },
    abilities: [
      { id: "slam", title: "Heavy Slam", rules: buildRules() },
      {
        id: "grab",
        title: "Corpse Grab",
        rules: buildRules({ budgetRole: "secondaryAttack", budgetShare: 0.4 }),
      },
    ],
    routine: {
      mode: "authored",
      defaultSequence: ["slam", "grab"],
      multiattack: {
        enabled: true,
        attacks: 2,
        choices: ["slam", "grab"],
      },
    },
    migration: { status: "audit-only" },
  };
}

const strict = process.argv.includes("--strict");
const legacyModel = buildMonsterAbilitiesFromFeatures(MONSTER_GRAFTS);
const legacyIds = MONSTER_GRAFTS.map((graft) => graft.id);
const compiledLegacyIds = legacyModel.abilities.map((ability) => ability.id);
const syntheticPattern = buildSyntheticAttackPattern();
const syntheticBundle = buildMonsterAbilityBundleFromGraft(syntheticPattern);
const legacyProjectionMismatches = MONSTER_GRAFTS.flatMap((graft, index) => {
  const ability = legacyModel.abilities[index];
  const mismatches = [];
  if (ability?.id !== graft.id) mismatches.push("id");
  if (ability?.sourceGraftId !== graft.id) mismatches.push("sourceGraftId");
  if (ability?.localAbilityId !== graft.id) mismatches.push("localAbilityId");
  if (ability?.title !== graft.title) mismatches.push("title");
  if (ability?.source !== graft.source) mismatches.push("source");
  if (ability?.slot !== graft.slot) mismatches.push("slot");
  if (ability?.synthetic !== false) mismatches.push("synthetic");
  if (JSON.stringify(ability?.rules) !== JSON.stringify(normalizeMonsterGraftRules(graft))) {
    mismatches.push("rules");
  }
  return mismatches.length ? [{ graftId: graft.id, mismatches }] : [];
});

const syntheticRoutine = buildMonsterAttackRoutine({
  abilities: syntheticBundle.abilities,
  targetDpr: 20,
  targetCr: 2,
  computed: { categoryNoun: "zombie" },
});

const checks = {
  legacyCountPreserved: legacyModel.total === MONSTER_GRAFTS.length,
  legacyOrderPreserved:
    JSON.stringify(compiledLegacyIds) === JSON.stringify(legacyIds),
  legacyIdsUnique: new Set(compiledLegacyIds).size === compiledLegacyIds.length,
  allCurrentGraftsUseLegacyAdapter:
    legacyModel.legacyGrafts === MONSTER_GRAFTS.length && legacyModel.v2Grafts === 0,
  currentCatalogueHasNoSyntheticAbilities: legacyModel.synthetic === 0,
  currentCatalogueValidationHasNoErrors:
    legacyModel.validation.errors.length === 0,
  legacyProjectionPreservesRuntimeDomainFields:
    legacyProjectionMismatches.length === 0,
  syntheticBundlePasses: syntheticBundle.validation.errors.length === 0,
  syntheticBundleExpandsToThreeAbilities: syntheticBundle.abilities.length === 3,
  syntheticRuntimeIdsStable:
    JSON.stringify(syntheticBundle.abilities.map((ability) => ability.id)) ===
    JSON.stringify([
      "phase-2-pressure-collapse:multiattack",
      "phase-2-pressure-collapse:slam",
      "phase-2-pressure-collapse:grab",
    ]),
  authoredRoutineResolved: syntheticRoutine.source === "manual",
  authoredRoutineAllocationsDistinct:
    JSON.stringify(Object.keys(syntheticRoutine.allocations).sort()) ===
    JSON.stringify([
      "phase-2-pressure-collapse:grab",
      "phase-2-pressure-collapse:slam",
    ]),
};

const failures = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([id]) => id);
const report = {
  phase: "terrifying-monsters-phase-2",
  bridge: "monster-ability-bundle-v1.0",
  currentCatalogue: {
    grafts: MONSTER_GRAFTS.length,
    abilities: legacyModel.total,
    legacyGrafts: legacyModel.legacyGrafts,
    v2Grafts: legacyModel.v2Grafts,
    syntheticAbilities: legacyModel.synthetic,
    validation: legacyModel.validation.status,
    projectionMismatches: legacyProjectionMismatches,
  },
  syntheticV2: {
    abilities: syntheticBundle.abilities.map((ability) => ({
      id: ability.id,
      sourceGraftId: ability.sourceGraftId,
      localAbilityId: ability.localAbilityId,
      synthetic: ability.synthetic,
      compilation: ability.provenance.compilation,
    })),
    bundleValidation: syntheticBundle.validation.status,
    routineSource: syntheticRoutine.source,
    routineMode: syntheticRoutine.mode,
    allocationIds: Object.keys(syntheticRoutine.allocations).sort(),
  },
  checks,
  failures,
};

console.log(JSON.stringify(report, null, 2));

if (strict) {
  assert.deepEqual(failures, []);
}
