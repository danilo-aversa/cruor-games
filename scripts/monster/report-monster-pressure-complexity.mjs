import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { MONSTER_GRAFTS } from "../../features/monster-composer/data/monster-grafts.js";
import { buildMonsterAbilitiesFromFeatures } from "../../features/monster-composer/model/monster-ability-model.js";
import {
  MONSTER_PRESSURE_COMPLEXITY_VERSION,
  MONSTER_PRESSURE_CR_BANDS,
  buildDmComplexityProfile,
  buildPlayerPressureProfile,
  getComplexityLimitForFrame,
  getPressureLimitForFrame,
} from "../../features/monster-composer/model/monster-pressure-complexity.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT_DIR = path.join(ROOT, "docs/terrifying-monsters/phase9");
const JSON_PATH = path.join(OUTPUT_DIR, "pressure-complexity-v3.generated.json");
const MARKDOWN_PATH = path.join(OUTPUT_DIR, "pressure-complexity-v3.generated.md");
const CHECK = process.argv.includes("--check");
const STRICT = process.argv.includes("--strict");

function ability(id, overrides = {}) {
  return {
    id,
    title: id,
    section: "action",
    actionEconomy: "action",
    usage: { type: "atWill" },
    damage: { hasDamage: true, entries: [{ id: `${id}-damage`, average: 5 }] },
    conditions: [],
    effects: [],
    counterplay: {},
    ...overrides,
  };
}

function syntheticComplexAttackPattern() {
  const abilities = [
    ability("strike"),
    ability("pin", {
      conditions: [{ name: "restrained", severity: "major", repeatSave: { enabled: true }, escape: { enabled: true } }],
      counterplay: { breakCondition: "Escape the pin." },
    }),
    ability("burst", {
      usage: { type: "recharge" },
      targeting: { type: "area" },
      areaEffect: { enabled: true, timing: "startsTurnInArea" },
      ongoing: { enabled: true },
      counterplay: { positioningAnswer: "Leave the area." },
    }),
  ];
  return {
    abilityModel: { abilities },
    attackRoutine: {
      enabled: true,
      mode: "choice",
      count: 2,
      attacks: [{ abilityId: "strike" }, { abilityId: "pin" }],
      replacements: [{ abilityId: "burst" }],
      additions: [],
    },
  };
}

function attackPatternRows(targetCr) {
  const attackPatterns = MONSTER_GRAFTS.filter((graft) => graft.slot === "attack");
  const limit = getPressureLimitForFrame({ targetCr });
  return attackPatterns.map((graft) => {
    const abilityModel = buildMonsterAbilitiesFromFeatures([graft], { targetCr });
    const pressure = buildPlayerPressureProfile({ targetCr, limit, abilityModel, selectedFeatures: [graft] });
    const complexity = buildDmComplexityProfile({ limit: 6, abilityModel, selectedFeatures: [graft] });
    return {
      id: graft.id,
      title: graft.title,
      abilityCount: abilityModel.abilities.length,
      pressure: pressure.score,
      pressureLimit: pressure.limit,
      pressureStatus: pressure.label,
      complexity: complexity.score,
      saturatesPressure: pressure.score >= pressure.limit,
      exceedsPressure: pressure.overLimit,
    };
  }).sort((a, b) => b.pressure - a.pressure || b.complexity - a.complexity || a.title.localeCompare(b.title));
}

function buildChecks({ attackPatternsCr2, fullCatalogCr2, damageLow, damageHigh }) {
  const checks = [];
  const add = (id, pass, detail) => checks.push({ id, pass: Boolean(pass), detail });
  add("catalog-has-93-grafts", MONSTER_GRAFTS.length === 93, `${MONSTER_GRAFTS.length} grafts`);
  add("catalog-has-15-attack-patterns", attackPatternsCr2.length === 15, `${attackPatternsCr2.length} Attack Patterns`);
  add("pressure-curve-seven-bands", MONSTER_PRESSURE_CR_BANDS.length === 7, `${MONSTER_PRESSURE_CR_BANDS.length} bands`);
  add("cr2-pressure-limit-six", getPressureLimitForFrame({ targetCr: 2 }) === 6, `limit ${getPressureLimitForFrame({ targetCr: 2 })}`);
  add("cr20-pressure-limit-fourteen", getPressureLimitForFrame({ targetCr: 20 }) === 14, `limit ${getPressureLimitForFrame({ targetCr: 20 })}`);
  add("low-cr-tier-inflation-capped", getPressureLimitForFrame({ targetCr: 2, roleId: "boss", monsterTierId: "legendary" }) === 8, `limit ${getPressureLimitForFrame({ targetCr: 2, roleId: "boss", monsterTierId: "legendary" })}`);
  add("complexity-cr-independent", getComplexityLimitForFrame({ roleId: "standard", monsterTierId: "normal", tempoProfileId: "standard", targetCr: 2 }) === getComplexityLimitForFrame({ roleId: "standard", monsterTierId: "normal", tempoProfileId: "standard", targetCr: 20 }), "same frame gives same Complexity limit");
  const saturating = attackPatternsCr2.filter((row) => row.saturatesPressure);
  add("complex-attack-pattern-can-saturate-cr2", saturating.length > 0, `${saturating.length}/${attackPatternsCr2.length} Attack Patterns use at least 6 Pressure`);
  add("full-catalog-overloads-cr2", fullCatalogCr2.pressure > fullCatalogCr2.pressureLimit, `${fullCatalogCr2.pressure}/${fullCatalogCr2.pressureLimit}`);
  add("damage-magnitude-does-not-change-pressure", damageLow.pressure === damageHigh.pressure, `${damageLow.pressure} == ${damageHigh.pressure}`);
  add("damage-magnitude-does-not-change-complexity", damageLow.complexity === damageHigh.complexity, `${damageLow.complexity} == ${damageHigh.complexity}`);
  return checks;
}

function buildReport() {
  const attackPatternsCr2 = attackPatternRows(2);
  const attackPatternsByCr = Object.fromEntries([2, 5, 10, 15].map((cr) => [cr, attackPatternRows(cr)]));
  const fullAbilityModel = buildMonsterAbilitiesFromFeatures(MONSTER_GRAFTS, { targetCr: 2 });
  const fullPressure = buildPlayerPressureProfile({
    targetCr: 2,
    limit: getPressureLimitForFrame({ targetCr: 2 }),
    abilityModel: fullAbilityModel,
    selectedFeatures: MONSTER_GRAFTS,
  });
  const fullComplexity = buildDmComplexityProfile({
    limit: 10,
    abilityModel: fullAbilityModel,
    selectedFeatures: MONSTER_GRAFTS,
  });
  const lowDamageModel = { abilities: [ability("strike", { damage: { hasDamage: true, entries: [{ average: 4 }] } })] };
  const highDamageModel = { abilities: [ability("strike", { damage: { hasDamage: true, entries: [{ average: 80 }] } })] };
  const damageLow = {
    pressure: buildPlayerPressureProfile({ targetCr: 2, limit: 6, abilityModel: lowDamageModel }).score,
    complexity: buildDmComplexityProfile({ limit: 6, abilityModel: lowDamageModel }).score,
  };
  const damageHigh = {
    pressure: buildPlayerPressureProfile({ targetCr: 2, limit: 6, abilityModel: highDamageModel }).score,
    complexity: buildDmComplexityProfile({ limit: 6, abilityModel: highDamageModel }).score,
  };
  const synthetic = syntheticComplexAttackPattern();
  const syntheticPressure = buildPlayerPressureProfile({
    targetCr: 2,
    limit: 6,
    abilityModel: synthetic.abilityModel,
    attackRoutine: synthetic.attackRoutine,
  });
  const fullCatalogCr2 = {
    grafts: MONSTER_GRAFTS.length,
    abilities: fullAbilityModel.abilities.length,
    pressure: fullPressure.score,
    pressureLimit: fullPressure.limit,
    complexity: fullComplexity.score,
    complexityLimit: fullComplexity.limit,
  };
  const checks = buildChecks({ attackPatternsCr2, fullCatalogCr2, damageLow, damageHigh });

  return {
    schemaVersion: "monster-pressure-complexity-audit-v3.0",
    modelVersion: MONSTER_PRESSURE_COMPLEXITY_VERSION,
    generatedBy: "scripts/monster/report-monster-pressure-complexity.mjs",
    summary: {
      grafts: MONSTER_GRAFTS.length,
      attackPatterns: attackPatternsCr2.length,
      checks: checks.length,
      passed: checks.filter((check) => check.pass).length,
      failed: checks.filter((check) => !check.pass).length,
      cr2AttackPatternsSaturatingPressure: attackPatternsCr2.filter((row) => row.saturatesPressure).length,
      cr2AttackPatternsExceedingPressure: attackPatternsCr2.filter((row) => row.exceedsPressure).length,
    },
    pressureCurve: MONSTER_PRESSURE_CR_BANDS,
    frameExamples: {
      standardCr2: {
        pressureLimit: getPressureLimitForFrame({ targetCr: 2 }),
        complexityLimit: getComplexityLimitForFrame({ roleId: "standard", monsterTierId: "normal", tempoProfileId: "standard" }),
      },
      legendaryBossCr2: {
        pressureLimit: getPressureLimitForFrame({ targetCr: 2, roleId: "boss", monsterTierId: "legendary" }),
        complexityLimit: getComplexityLimitForFrame({ roleId: "boss", monsterTierId: "legendary", tempoProfileId: "legendary" }),
      },
      standardCr20: {
        pressureLimit: getPressureLimitForFrame({ targetCr: 20 }),
        complexityLimit: getComplexityLimitForFrame({ roleId: "standard", monsterTierId: "normal", tempoProfileId: "standard" }),
      },
    },
    syntheticComplexAttackPattern: {
      pressure: syntheticPressure.score,
      limit: syntheticPressure.limit,
      label: syntheticPressure.label,
      breakdown: syntheticPressure.breakdown,
    },
    fullCatalogCr2,
    damageIndependence: { lowDamage: damageLow, highDamage: damageHigh },
    attackPatternsByCr,
    checks,
  };
}

function renderMarkdown(report) {
  const curveRows = report.pressureCurve.map((band) => `| ${band.minCr}–${band.maxCr} | ${band.limit} |`).join("\n");
  const attackRows = report.attackPatternsByCr[2]
    .map((row) => `| ${row.title} | ${row.abilityCount} | ${row.pressure}/${row.pressureLimit} | ${row.complexity}/6 | ${row.exceedsPressure ? "Over" : row.saturatesPressure ? "Saturated" : "Within"} |`)
    .join("\n");
  const checkRows = report.checks.map((check) => `| ${check.pass ? "PASS" : "FAIL"} | ${check.id} | ${check.detail} |`).join("\n");
  return `# Terrifying Monsters — Pressure / Complexity v3 Audit\n\n` +
    `**Model:** \`${report.modelVersion}\`\n\n` +
    `**Catalog:** ${report.summary.grafts} grafts\n\n` +
    `**Checks:** ${report.summary.passed}/${report.summary.checks} passed\n\n` +
    `## Pressure capacity by CR\n\n| Target CR | Pressure limit |\n|---|---:|\n${curveRows}\n\n` +
    `Role and Tier can modify this capacity, but CR 0–4 positive inflation is capped at +2.\n\n` +
    `## CR 2 Attack Pattern calibration\n\n` +
    `${report.summary.cr2AttackPatternsSaturatingPressure} of ${report.summary.attackPatterns} Attack Patterns consume at least the complete standard CR 2 Pressure allowance; ${report.summary.cr2AttackPatternsExceedingPressure} exceed it.\n\n` +
    `| Attack Pattern | Abilities | Pressure | Complexity | Guidance |\n|---|---:|---:|---:|---|\n${attackRows}\n\n` +
    `## Full-catalog stress case\n\n` +
    `Selecting all ${report.fullCatalogCr2.grafts} grafts at CR 2 compiles ${report.fullCatalogCr2.abilities} abilities and produces Pressure ${report.fullCatalogCr2.pressure}/${report.fullCatalogCr2.pressureLimit} and Complexity ${report.fullCatalogCr2.complexity}/${report.fullCatalogCr2.complexityLimit}. This is intentionally advisory rather than blocked.\n\n` +
    `## Checks\n\n| Status | Check | Evidence |\n|---|---|---|\n${checkRows}\n`;
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
const markdown = renderMarkdown(report);
const jsonFresh = compareOrWrite(JSON_PATH, json);
const markdownFresh = compareOrWrite(MARKDOWN_PATH, markdown);
const failedChecks = report.checks.filter((check) => !check.pass);

console.log(`Pressure / Complexity v3: ${report.summary.passed}/${report.summary.checks} checks passed.`);
console.log(`CR 2 Attack Patterns: ${report.summary.cr2AttackPatternsSaturatingPressure} saturated, ${report.summary.cr2AttackPatternsExceedingPressure} over.`);
console.log(`Generated outputs: ${path.relative(ROOT, JSON_PATH)}, ${path.relative(ROOT, MARKDOWN_PATH)}`);
if (CHECK && (!jsonFresh || !markdownFresh)) {
  console.error("Generated Pressure / Complexity audit files are stale. Run npm run monster:audit:pressure-complexity.");
  process.exitCode = 1;
}
if (STRICT && failedChecks.length) {
  failedChecks.forEach((check) => console.error(`FAIL ${check.id}: ${check.detail}`));
  process.exitCode = 1;
}
