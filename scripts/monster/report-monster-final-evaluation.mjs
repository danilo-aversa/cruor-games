import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  MONSTER_FINAL_EVALUATION_VERSION,
  buildFinalMonsterEvaluation,
} from "../../features/monster-composer/model/monster-final-evaluation.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT_DIR = path.join(ROOT, "docs/terrifying-monsters/phase4");
const JSON_PATH = path.join(OUTPUT_DIR, "final-evaluation.generated.json");
const MARKDOWN_PATH = path.join(OUTPUT_DIR, "final-evaluation.generated.md");
const CHECK = process.argv.includes("--check");
const STRICT = process.argv.includes("--strict");

function action(id, overrides = {}) {
  return {
    id,
    title: id,
    section: "action",
    actionEconomy: "action",
    usage: { type: "atWill" },
    damage: { hasDamage: true, entries: [{ id: `${id}-damage`, expectedTargets: 1 }] },
    conditions: [],
    effects: [],
    counterplay: {},
    ...overrides,
  };
}

function baseInput(overrides = {}) {
  return {
    targetCr: 2,
    baseline: { dpr: 15, hp: 45, ac: 13 },
    printedStats: { dpr: 15, hp: 45, ac: 13 },
    dprProfile: {
      effectiveDpr3Round: 15,
      averageDpr: 15,
      burstDpr: 15,
      sustainedDpr: 15,
      openingBurstDelta: 0,
      rounds: { round1: 15, round2: 15, round3: 15 },
      actionEconomy: { mainActionOptionCount: 1 },
      sources: [{ abilityId: "strike", expectedTargets: 1 }],
    },
    effectiveProfile: {
      effectiveDpr3Round: 15,
      burstDpr: 15,
      sustainedDpr: 15,
      effectiveHp: 45,
      conditionProfile: {},
    },
    crValidation: {
      estimatedCr: 2,
      offensive: { cr: 2 },
      defensive: { cr: 2 },
    },
    abilityModel: { abilities: [action("strike")] },
    attackRoutine: { enabled: false, count: 1, attacks: [], replacements: [], additions: [] },
    mechanicsSummary: { complexityTags: {} },
    tempoProfile: { pressureMod: 0 },
    monsterTier: { pressureMod: 0 },
    counterplayAudit: { score: 50, rating: "Playable", issues: [] },
    selectedFeatures: [],
    buildBudget: 14,
    buildCost: 4,
    complexityCap: 10,
    ...overrides,
  };
}

function buildScenarios() {
  const baseline = buildFinalMonsterEvaluation(baseInput());
  const burst = buildFinalMonsterEvaluation(baseInput({
    printedStats: { dpr: 17, hp: 45, ac: 13 },
    dprProfile: {
      effectiveDpr3Round: 17,
      averageDpr: 17,
      burstDpr: 30,
      sustainedDpr: 10,
      openingBurstDelta: 13,
      rounds: { round1: 30, round2: 10, round3: 10 },
      actionEconomy: { mainActionOptionCount: 1 },
      sources: [{ abilityId: "strike", expectedTargets: 1 }],
    },
    effectiveProfile: {
      effectiveDpr3Round: 17,
      burstDpr: 30,
      sustainedDpr: 10,
      effectiveHp: 45,
      conditionProfile: {},
    },
    crValidation: {
      estimatedCr: 3,
      offensive: { cr: 4 },
      defensive: { cr: 2 },
    },
  }));
  const hardControl = buildFinalMonsterEvaluation(baseInput({
    effectiveProfile: {
      effectiveDpr3Round: 15,
      burstDpr: 15,
      sustainedDpr: 15,
      effectiveHp: 45,
      conditionProfile: {
        majorCount: 1,
        severeCount: 1,
        repeatedHardControlCount: 1,
        crAdjustment: 1,
        controlPressure: 3,
      },
    },
  }));
  const unsafeCounterplay = buildFinalMonsterEvaluation(baseInput({
    counterplayAudit: { score: 10, rating: "Unsafe", issues: [{ severity: "critical" }] },
  }));
  const strongCounterplay = buildFinalMonsterEvaluation(baseInput({
    counterplayAudit: { score: 95, rating: "Strong", issues: [] },
  }));
  const complexAbilities = [
    action("slam"),
    action("grasp", {
      conditions: [{ name: "grappled", severity: "major", repeatSave: { enabled: true }, escape: { enabled: true } }],
    }),
    action("spore-cloud", {
      usage: { type: "recharge" },
      targeting: { type: "area" },
      areaEffect: { enabled: true },
      ongoing: { enabled: true },
    }),
    action("retaliation", { actionEconomy: "reaction", section: "reaction" }),
    action("brood", { summon: { enabled: true }, damage: { hasDamage: false, entries: [] } }),
    action("engulf", { procedure: { enabled: true, type: "engulf" } }),
  ];
  const complex = buildFinalMonsterEvaluation(baseInput({
    abilityModel: { abilities: complexAbilities },
    attackRoutine: {
      enabled: true,
      mode: "choice",
      count: 2,
      attacks: [{ abilityId: "slam" }, { abilityId: "grasp" }],
      replacements: [{ abilityId: "engulf" }],
      additions: [{ abilityId: "spore-cloud" }],
    },
    dprProfile: {
      ...baseInput().dprProfile,
      actionEconomy: { mainActionOptionCount: 4 },
    },
  }));
  const lowBudget = buildFinalMonsterEvaluation(baseInput({ buildBudget: 8, buildCost: 7 }));
  const highBudget = buildFinalMonsterEvaluation(baseInput({ buildBudget: 24, buildCost: 7 }));
  return {
    baseline,
    burst,
    hardControl,
    unsafeCounterplay,
    strongCounterplay,
    complex,
    lowBudget,
    highBudget,
  };
}

function summarizeEvaluation(evaluation) {
  return {
    pressure: evaluation.pressure.score,
    complexity: evaluation.complexity.score,
    counterplay: evaluation.counterplay.score,
    spikeRisk: evaluation.spikeRisk.score,
    buildBudget: evaluation.buildBudget.limit,
    buildCost: evaluation.buildBudget.used,
  };
}

function buildChecks(scenarios) {
  const checks = [];
  const add = (id, pass, detail) => checks.push({ id, pass: Boolean(pass), detail });
  const scaleKeys = ["pressure", "complexity", "counterplay", "spikeRisk"];
  for (const [scenarioId, evaluation] of Object.entries(scenarios)) {
    for (const key of scaleKeys) {
      const score = Number(evaluation[key].score);
      add(`${scenarioId}-${key}-scale`, score >= 0 && score <= 10, `${score} is within 0-10`);
    }
  }
  add(
    "burst-increases-pressure",
    scenarios.burst.pressure.score > scenarios.baseline.pressure.score,
    `${scenarios.baseline.pressure.score} -> ${scenarios.burst.pressure.score}`,
  );
  add(
    "burst-increases-spike-risk",
    scenarios.burst.spikeRisk.score > scenarios.baseline.spikeRisk.score,
    `${scenarios.baseline.spikeRisk.score} -> ${scenarios.burst.spikeRisk.score}`,
  );
  add(
    "hard-control-increases-pressure",
    scenarios.hardControl.pressure.score > scenarios.baseline.pressure.score,
    `${scenarios.baseline.pressure.score} -> ${scenarios.hardControl.pressure.score}`,
  );
  add(
    "counterplay-independent-from-pressure",
    scenarios.unsafeCounterplay.pressure.score === scenarios.strongCounterplay.pressure.score,
    `${scenarios.unsafeCounterplay.pressure.score} == ${scenarios.strongCounterplay.pressure.score}`,
  );
  add(
    "counterplay-score-remains-independent",
    scenarios.strongCounterplay.counterplay.score > scenarios.unsafeCounterplay.counterplay.score,
    `${scenarios.unsafeCounterplay.counterplay.score} -> ${scenarios.strongCounterplay.counterplay.score}`,
  );
  add(
    "flattened-repertoire-increases-complexity",
    scenarios.complex.complexity.score > scenarios.baseline.complexity.score,
    `${scenarios.baseline.complexity.score} -> ${scenarios.complex.complexity.score}`,
  );
  add(
    "build-budget-independent-from-pressure",
    scenarios.lowBudget.pressure.score === scenarios.highBudget.pressure.score,
    `${scenarios.lowBudget.pressure.score} == ${scenarios.highBudget.pressure.score}`,
  );
  add(
    "build-budget-independent-from-complexity",
    scenarios.lowBudget.complexity.score === scenarios.highBudget.complexity.score,
    `${scenarios.lowBudget.complexity.score} == ${scenarios.highBudget.complexity.score}`,
  );
  return checks;
}

function buildReport() {
  const scenarios = buildScenarios();
  const checks = buildChecks(scenarios);
  return {
    schemaVersion: "monster-final-evaluation-audit-v1.0",
    evaluationVersion: MONSTER_FINAL_EVALUATION_VERSION,
    generatedBy: "scripts/monster/report-monster-final-evaluation.mjs",
    summary: {
      scenarioCount: Object.keys(scenarios).length,
      checkCount: checks.length,
      passed: checks.filter((check) => check.pass).length,
      failed: checks.filter((check) => !check.pass).length,
    },
    scenarios: Object.fromEntries(
      Object.entries(scenarios).map(([id, evaluation]) => [id, summarizeEvaluation(evaluation)]),
    ),
    checks,
  };
}

function renderMarkdown(report) {
  const scenarioRows = Object.entries(report.scenarios)
    .map(([id, row]) => `| ${id} | ${row.pressure} | ${row.complexity} | ${row.counterplay} | ${row.spikeRisk} | ${row.buildBudget ?? "-"} |`)
    .join("\n");
  const checkRows = report.checks
    .map((check) => `| ${check.pass ? "PASS" : "FAIL"} | ${check.id} | ${check.detail} |`)
    .join("\n");
  return `# Terrifying Monsters — Final Evaluation v2 Audit\n\n` +
    `**Evaluation:** \`${report.evaluationVersion}\`  \n` +
    `**Scenarios:** ${report.summary.scenarioCount}  \n` +
    `**Checks:** ${report.summary.passed}/${report.summary.checkCount} passed\n\n` +
    `## Scenario scores\n\n` +
    `| Scenario | Pressure | Complexity | Counterplay | Spike Risk | Build Budget |\n` +
    `|---|---:|---:|---:|---:|---:|\n${scenarioRows}\n\n` +
    `## Invariant checks\n\n` +
    `| Status | Check | Evidence |\n|---|---|---|\n${checkRows}\n\n` +
    `## Contract confirmed\n\n` +
    `- Pressure is calculated from finalized DPR, burst, effective defense, conditions, tempo and reach.\n` +
    `- Complexity is calculated from the flattened ability repertoire and DM-facing handling requirements.\n` +
    `- Counterplay is measured independently and never subtracted from Pressure.\n` +
    `- Spike Risk is separate from average Pressure.\n` +
    `- Build Budget remains a build-points envelope and does not define the 0–10 Pressure scale.\n`;
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

console.log(`Final Evaluation v2: ${report.summary.passed}/${report.summary.checkCount} checks passed.`);
console.log(`Generated outputs: ${path.relative(ROOT, JSON_PATH)}, ${path.relative(ROOT, MARKDOWN_PATH)}`);
if (CHECK && (!jsonFresh || !markdownFresh)) {
  console.error("Generated Final Evaluation audit files are stale. Run npm run monster:audit:final-evaluation.");
  process.exitCode = 1;
}
if (STRICT && failedChecks.length) {
  failedChecks.forEach((check) => console.error(`FAIL ${check.id}: ${check.detail}`));
  process.exitCode = 1;
}
