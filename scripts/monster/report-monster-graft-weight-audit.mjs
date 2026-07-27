import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { MONSTER_GRAFTS } from "../../features/monster-composer/data/monster-grafts.js";
import { buildMonsterAbilitiesFromFeatures } from "../../features/monster-composer/model/monster-ability-model.js";
import {
  MONSTER_GRAFT_SLOT_WEIGHT_PROFILES,
  MONSTER_PRESSURE_COMPLEXITY_VERSION,
  buildDmComplexityProfile,
  buildPlayerPressureProfile,
  getPressureLimitForFrame,
} from "../../features/monster-composer/model/monster-pressure-complexity.js";
import {
  MONSTER_BASIC_ATTACK_VERSION,
  ensureMonsterBasicAttackFeature,
} from "../../features/monster-composer/model/monster-basic-attack.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT_DIR = path.join(ROOT, "docs/terrifying-monsters/phase10");
const JSON_PATH = path.join(OUTPUT_DIR, "graft-weight-audit.generated.json");
const MARKDOWN_PATH = path.join(OUTPUT_DIR, "graft-weight-audit.generated.md");
const CHECK = process.argv.includes("--check");
const STRICT = process.argv.includes("--strict");
const TARGET_CR = 5;

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function mean(values = []) {
  return values.length ? values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length : 0;
}

function scoreGraft(graft, targetCr = TARGET_CR) {
  const abilityModel = buildMonsterAbilitiesFromFeatures([graft], { targetCr });
  const pressureLimit = getPressureLimitForFrame({ targetCr });
  const rawPressure = buildPlayerPressureProfile({
    targetCr,
    limit: pressureLimit,
    abilityModel,
    selectedFeatures: [],
  });
  const rawComplexity = buildDmComplexityProfile({
    limit: 6,
    abilityModel,
    selectedFeatures: [],
  });
  const pressure = buildPlayerPressureProfile({
    targetCr,
    limit: pressureLimit,
    abilityModel,
    selectedFeatures: [graft],
  });
  const complexity = buildDmComplexityProfile({
    limit: 6,
    abilityModel,
    selectedFeatures: [graft],
  });
  return {
    id: graft.id,
    title: graft.title,
    slot: graft.slot,
    declaredComplexity: Number(graft.complexity || 0),
    abilityCount: abilityModel.abilities.length,
    rawPressure: rawPressure.score,
    pressure: pressure.score,
    pressureDelta: pressure.score - rawPressure.score,
    rawComplexity: rawComplexity.score,
    complexity: complexity.score,
    complexityDelta: complexity.score - rawComplexity.score,
    pressureBreakdown: pressure.breakdown,
    complexityBreakdown: complexity.breakdown,
  };
}

function summarizeSlots(rows) {
  const slots = [...new Set(rows.map((row) => row.slot))].sort();
  return slots.map((slot) => {
    const slotRows = rows.filter((row) => row.slot === slot);
    const profile = MONSTER_GRAFT_SLOT_WEIGHT_PROFILES[slot] || {};
    return {
      slot,
      grafts: slotRows.length,
      bestiaryPrevalence: profile.bestiaryPrevalence ?? null,
      pressureAverage: round(mean(slotRows.map((row) => row.pressure))),
      pressureMin: Math.min(...slotRows.map((row) => row.pressure)),
      pressureMax: Math.max(...slotRows.map((row) => row.pressure)),
      complexityAverage: round(mean(slotRows.map((row) => row.complexity))),
      complexityMin: Math.min(...slotRows.map((row) => row.complexity)),
      complexityMax: Math.max(...slotRows.map((row) => row.complexity)),
      rawPressureAverage: round(mean(slotRows.map((row) => row.rawPressure))),
      rawComplexityAverage: round(mean(slotRows.map((row) => row.rawComplexity))),
      rationale: profile.rationale || "No slot prior.",
    };
  });
}

function buildSlotTierComparison(targetCrs = [2, 5, 15]) {
  return targetCrs.map((targetCr) => {
    const rows = MONSTER_GRAFTS.map((graft) => scoreGraft(graft, targetCr));
    const slots = summarizeSlots(rows);
    const bySlot = Object.fromEntries(slots.map((slot) => [slot.slot, slot]));
    return {
      targetCr,
      attack: {
        pressureAverage: bySlot.attack.pressureAverage,
        complexityAverage: bySlot.attack.complexityAverage,
      },
      movement: {
        pressureAverage: bySlot.movement.pressureAverage,
        complexityAverage: bySlot.movement.complexityAverage,
      },
    };
  });
}

function buildReport() {
  const rows = MONSTER_GRAFTS.map((graft) => scoreGraft(graft, TARGET_CR));
  const slots = summarizeSlots(rows);
  const slotMap = Object.fromEntries(slots.map((row) => [row.slot, row]));
  const tierComparison = buildSlotTierComparison();
  const tierMap = Object.fromEntries(tierComparison.map((row) => [row.targetCr, row]));
  const baselineCompilation = ensureMonsterBasicAttackFeature([], {
    category: "Zombie",
    typeId: "undead",
    sourceId: "decomposition",
    targetCr: 2,
  });
  const baselineAbilityModel = buildMonsterAbilitiesFromFeatures(
    baselineCompilation.features,
    { targetCr: 2 },
  );
  const baselinePressure = buildPlayerPressureProfile({
    targetCr: 2,
    limit: 6,
    abilityModel: baselineAbilityModel,
    selectedFeatures: baselineCompilation.features,
  });
  const baselineComplexity = buildDmComplexityProfile({
    limit: 6,
    abilityModel: baselineAbilityModel,
    selectedFeatures: baselineCompilation.features,
  });
  const authoredAttack = MONSTER_GRAFTS.find((graft) => graft.slot === "attack");
  const authoredCompilation = ensureMonsterBasicAttackFeature([authoredAttack], {
    category: "Zombie",
    typeId: "undead",
    targetCr: 2,
  });
  const cr2AttackRows = MONSTER_GRAFTS
    .filter((graft) => graft.slot === "attack")
    .map((graft) => {
      const abilityModel = buildMonsterAbilitiesFromFeatures([graft], { targetCr: 2 });
      const pressure = buildPlayerPressureProfile({
        targetCr: 2,
        limit: 6,
        abilityModel,
        selectedFeatures: [graft],
      });
      return { id: graft.id, title: graft.title, pressure: pressure.score };
    });

  const checks = [];
  const add = (id, pass, detail) => checks.push({ id, pass: Boolean(pass), detail });
  add("catalog-has-93-grafts", rows.length === 93, `${rows.length} grafts`);
  add("catalog-has-nine-slots", slots.length === 9, `${slots.length} slots`);
  add("baseline-attack-added", Boolean(baselineCompilation.fallbackFeature), baselineCompilation.profile.status);
  add("baseline-attack-is-an-action", baselineAbilityModel.abilities.some((ability) => ability.actionEconomy === "action" && ability.damage.hasDamage), `${baselineAbilityModel.abilities.length} compiled ability`);
  add("baseline-attack-pressure-zero", baselinePressure.score === 0, `${baselinePressure.score} Pressure`);
  add("baseline-attack-complexity-zero", baselineComplexity.score === 0, `${baselineComplexity.score} Complexity`);
  add("authored-attack-suppresses-fallback", !authoredCompilation.fallbackFeature && authoredCompilation.features.length === 1, authoredCompilation.profile.status);
  add("movement-pressure-heavier-than-attack", slotMap.movement.pressureAverage > slotMap.attack.pressureAverage, `${slotMap.movement.pressureAverage} > ${slotMap.attack.pressureAverage}`);
  add("movement-complexity-heavier-than-attack", slotMap.movement.complexityAverage > slotMap.attack.complexityAverage, `${slotMap.movement.complexityAverage} > ${slotMap.attack.complexityAverage}`);
  add("cr2-movement-pressure-heavier", tierMap[2].movement.pressureAverage > tierMap[2].attack.pressureAverage, `${tierMap[2].movement.pressureAverage} > ${tierMap[2].attack.pressureAverage}`);
  add("cr2-movement-complexity-heavier", tierMap[2].movement.complexityAverage > tierMap[2].attack.complexityAverage, `${tierMap[2].movement.complexityAverage} > ${tierMap[2].attack.complexityAverage}`);
  add("high-cr-attack-progression-visible", tierMap[15].attack.pressureAverage > tierMap[5].attack.pressureAverage, `${tierMap[15].attack.pressureAverage} > ${tierMap[5].attack.pressureAverage}`);
  add("weakness-complexity-remains-light", slotMap.weakness.complexityAverage <= 1, `${slotMap.weakness.complexityAverage}`);
  add("complex-attack-can-saturate-cr2", cr2AttackRows.some((row) => row.pressure >= 6), `${cr2AttackRows.filter((row) => row.pressure >= 6).length} patterns`);
  add("all-graft-scores-finite", rows.every((row) => Number.isFinite(row.pressure) && Number.isFinite(row.complexity)), "all finite");
  add("all-grafts-have-minimum-guidance", rows.every((row) => row.pressure >= 1 && row.complexity >= 1), "all >= 1");

  return {
    schemaVersion: "monster-graft-weight-audit-v1.0",
    pressureComplexityVersion: MONSTER_PRESSURE_COMPLEXITY_VERSION,
    basicAttackVersion: MONSTER_BASIC_ATTACK_VERSION,
    source: {
      file: "Bestiary.csv",
      corpus: "Monster Manual 2025",
      creatures: 503,
      methodology: "Regex-assisted classification of authored stat-block entries, followed by manual slot-purpose calibration. Prevalence informs but does not directly determine weight.",
      observedPrevalence: {
        basicAttack: 0.996,
        attackPattern: 0.714,
        specialMovement: 0.306,
        body: 0.338,
        mind: 0.258,
        twist: 0.121,
        horror: 0.121,
        weakness: 0.091,
        death: 0.02,
        lairOrRegional: 0.07,
      },
      lowCrComparison: {
        cr2To4AttackPattern: 0.82,
        cr2To4SpecialMovement: 0.23,
      },
    },
    targetCr: TARGET_CR,
    summary: {
      grafts: rows.length,
      slots: slots.length,
      checks: checks.length,
      passed: checks.filter((check) => check.pass).length,
      failed: checks.filter((check) => !check.pass).length,
      cr2AttackPatternsSaturating: cr2AttackRows.filter((row) => row.pressure >= 6).length,
    },
    baselineAttack: {
      title: baselineCompilation.fallbackFeature?.title || null,
      abilities: baselineAbilityModel.abilities.length,
      pressure: baselinePressure.score,
      complexity: baselineComplexity.score,
    },
    slots,
    tierComparison,
    grafts: rows.sort((a, b) => a.slot.localeCompare(b.slot) || b.pressure - a.pressure || b.complexity - a.complexity || a.title.localeCompare(b.title)),
    cr2AttackPatterns: cr2AttackRows.sort((a, b) => b.pressure - a.pressure || a.title.localeCompare(b.title)),
    checks,
  };
}

function markdown(report) {
  const slotRows = report.slots.map((row) =>
    `| ${row.slot} | ${(row.bestiaryPrevalence * 100).toFixed(1)}% | ${row.pressureAverage} | ${row.complexityAverage} | ${row.pressureMin}–${row.pressureMax} | ${row.complexityMin}–${row.complexityMax} |`,
  ).join("\n");
  const tierRows = report.tierComparison.map((row) =>
    `| ${row.targetCr} | ${row.attack.pressureAverage} | ${row.attack.complexityAverage} | ${row.movement.pressureAverage} | ${row.movement.complexityAverage} |`,
  ).join("\n");
  const checks = report.checks.map((check) => `| ${check.pass ? "PASS" : "FAIL"} | ${check.id} | ${check.detail} |`).join("\n");
  const grafts = report.grafts.map((row) =>
    `| ${row.slot} | ${row.title} | ${row.rawPressure} | ${row.pressure} | ${row.rawComplexity} | ${row.complexity} |`,
  ).join("\n");
  return `# Graft Weight and Basic Attack Audit\n\n- Pressure/Complexity model: \`${report.pressureComplexityVersion}\`\n- Basic Attack compiler: \`${report.basicAttackVersion}\`\n- Catalog: ${report.summary.grafts} grafts across ${report.summary.slots} slots\n- Bestiary corpus: ${report.source.creatures} Monster Manual 2025 creatures\n- Gate: **${report.summary.failed ? "FAIL" : "PASS"}** (${report.summary.passed}/${report.summary.checks})\n\n## Bestiary findings\n\nA basic attack appears on 99.6% of creatures and is treated as baseline, not graft load. A full Attack Pattern appears on 71.4% of the corpus, while special movement appears on 30.6%. In CR 2–4 specifically, the comparison is 82% Attack Pattern versus 23% special movement. Rarity is not used mechanically on its own: Weakness stays light because it grants counterplay, and Death stays conditional because it resolves only at the end of the creature's life.\n\n## Adjusted slot averages at CR ${report.targetCr}\n\n| Slot | Bestiary prevalence | Avg Pressure | Avg Complexity | Pressure range | Complexity range |\n|---|---:|---:|---:|---:|---:|\n${slotRows}\n\n## Attack Pattern versus Movement across CR\n\n| Target CR | Attack Pressure | Attack Complexity | Movement Pressure | Movement Complexity |\n|---:|---:|---:|---:|---:|\n${tierRows}\n\nAt low and mid CR, special Movement is heavier on both axes. At high CR, some Attack Patterns unlock additional actions and progression, so their player-facing Pressure can legitimately overtake a static Movement graft; this comes from the compiled repertoire rather than from the family prior.\n\n## Basic Attack fallback\n\n- Compiled title: **${report.baselineAttack.title}**\n- Compiled actions: ${report.baselineAttack.abilities}\n- Pressure contribution: ${report.baselineAttack.pressure}\n- Complexity contribution: ${report.baselineAttack.complexity}\n- An authored Attack Pattern removes the fallback rather than stacking with it.\n\n## Gate checks\n\n| Status | Check | Detail |\n|---|---|---|\n${checks}\n\n## Per-graft audit\n\n| Slot | Graft | Raw Pressure | Adjusted Pressure | Raw Complexity | Adjusted Complexity |\n|---|---|---:|---:|---:|---:|\n${grafts}\n`;
}

function normalizedText(value) {
  return String(value).replace(/\r\n/g, "\n");
}

function compareOrWrite(filePath, content) {
  if (CHECK) {
    if (!fs.existsSync(filePath)) return false;
    return normalizedText(fs.readFileSync(filePath, "utf8")) === normalizedText(content);
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return true;
}

const report = buildReport();
const json = `${JSON.stringify(report, null, 2)}\n`;
const md = markdown(report);
const jsonFresh = compareOrWrite(JSON_PATH, json);
const markdownFresh = compareOrWrite(MARKDOWN_PATH, md);
const failedChecks = report.checks.filter((check) => !check.pass);
console.log(`Graft Weight / Basic Attack: ${report.summary.passed}/${report.summary.checks} checks passed.`);
console.log(`Movement averages ${report.slots.find((row) => row.slot === "movement").pressureAverage} Pressure / ${report.slots.find((row) => row.slot === "movement").complexityAverage} Complexity.`);
console.log(`Attack averages ${report.slots.find((row) => row.slot === "attack").pressureAverage} Pressure / ${report.slots.find((row) => row.slot === "attack").complexityAverage} Complexity.`);
console.log(`Generated outputs: ${path.relative(ROOT, JSON_PATH)}, ${path.relative(ROOT, MARKDOWN_PATH)}`);
if (CHECK && (!jsonFresh || !markdownFresh)) {
  console.error("Generated Graft Weight audit files are stale. Run npm run monster:audit:graft-weight.");
  process.exitCode = 1;
}
if (STRICT && failedChecks.length) {
  failedChecks.forEach((check) => console.error(`FAIL ${check.id}: ${check.detail}`));
  process.exitCode = 1;
}
