import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "../..");
const GRAFTS_PATH = path.join(
  REPO_ROOT,
  "features/monster-composer/data/monster-grafts.js",
);
const RULES_SCHEMA_PATH = path.join(
  REPO_ROOT,
  "features/monster-composer/model/monster-graft-rules.schema.js",
);
const PACKAGE_PATH = path.join(REPO_ROOT, "package.json");
const OUTPUT_DIRECTORY = path.join(
  REPO_ROOT,
  "docs/terrifying-monsters/phase0",
);
const OUTPUT_JSON = path.join(OUTPUT_DIRECTORY, "graft-inventory.generated.json");
const OUTPUT_CSV = path.join(OUTPUT_DIRECTORY, "graft-inventory.generated.csv");
const OUTPUT_MARKDOWN = path.join(
  OUTPUT_DIRECTORY,
  "graft-inventory.generated.md",
);

const CHECK_MODE = process.argv.includes("--check");

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function lower(value) {
  return cleanString(value).toLowerCase();
}

function countBy(items, selector) {
  const counts = new Map();
  items.forEach((item) => {
    const key = cleanString(selector(item)) || "none";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function countValues(values) {
  return countBy(values, (value) => value);
}

function hashText(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function parseCurrentRulesSchemaVersion(source) {
  const match = source.match(
    /MONSTER_GRAFT_RULES_SCHEMA_VERSION\s*=\s*["']([^"']+)["']/,
  );
  return match?.[1] || "unknown";
}

function hasEnabledBlock(value) {
  return Boolean(value && typeof value === "object" && value.enabled);
}

function getDamageParts(damage = {}) {
  return asArray(damage?.parts);
}

function getDamageBlocks(rules = {}) {
  const blocks = [];
  const pushDamage = (damage, source) => {
    if (!damage || typeof damage !== "object") return;
    const parts = getDamageParts(damage);
    if (parts.length) {
      parts.forEach((part, index) => blocks.push({ ...part, source: `${source}.parts.${index}` }));
      return;
    }
    blocks.push({ ...damage, source });
  };

  pushDamage(rules.damage, "damage");
  if (hasEnabledBlock(rules.ongoing)) pushDamage(rules.ongoing.damage, "ongoing.damage");
  if (hasEnabledBlock(rules.areaEffect)) pushDamage(rules.areaEffect.damage, "areaEffect.damage");
  if (hasEnabledBlock(rules.procedure)) {
    pushDamage(rules.procedure?.entryEffect?.damage, "procedure.entryEffect.damage");
    pushDamage(rules.procedure?.ongoingDamage?.damage, "procedure.ongoingDamage.damage");
    pushDamage(rules.procedure?.releaseEffect?.damage, "procedure.releaseEffect.damage");
  }

  return blocks.filter((damage) => damage.mode && damage.mode !== "none");
}

function getRulesText(rules = {}) {
  const fragments = [];
  const collect = (value) => {
    if (!value) return;
    if (typeof value === "string") {
      fragments.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }
    if (typeof value === "object") Object.values(value).forEach(collect);
  };
  collect(rules.text);
  collect(rules.areaEffect?.text);
  collect(rules.ongoing?.text);
  collect(rules.procedure?.customText);
  collect(rules.procedure?.entryEffect?.text);
  collect(rules.procedure?.releaseEffect?.text);
  return fragments.join(" ");
}

function buildParityReviewFlags(graft) {
  const mechanics = lower(graft.mechanics);
  const rules = graft.rules || {};
  const rulesText = lower(getRulesText(rules));
  const conditionNames = asArray(rules.condition?.names).map(lower);
  const conditionSpecial = asArray(rules.condition?.special).map(lower);
  const damageParts = getDamageParts(rules.damage);
  const effectTypes = asArray(rules.effects).map((effect) => lower(effect?.type));
  const flags = [];
  const add = (flag) => {
    if (!flags.includes(flag)) flags.push(flag);
  };

  if (
    /\badvantage\b|\bdisadvantage\b/.test(mechanics) &&
    !effectTypes.some((type) => ["advantage", "disadvantage"].includes(type))
  ) {
    add("advantage-disadvantage-review");
  }

  if (
    /\b(extra|additional) damage die\b|\bextra damage\b|\badditional damage\b/.test(
      mechanics,
    ) &&
    damageParts.length === 0 &&
    !effectTypes.includes("custom")
  ) {
    add("conditional-extra-damage-review");
  }

  if (
    /\bpush(?:ed|es)?\b|\bpull(?:ed|s)?\b|forced movement/.test(mechanics) &&
    !conditionSpecial.some((entry) => /push|pull|forced/.test(entry)) &&
    !/push|pull|forced movement/.test(rulesText)
  ) {
    add("forced-movement-review");
  }

  if (
    /\bspeed\b|walking speed|flying speed|climbing speed|burrowing speed/.test(
      mechanics,
    ) &&
    !hasEnabledBlock(rules.procedure)
  ) {
    add("movement-state-review");
  }

  if (/\breach\b/.test(mechanics) && !rules.resolution?.reach) {
    add("reach-review");
  }

  if (/\barmor class\b|\bac\b/.test(mechanics) && !hasEnabledBlock(rules.defense)) {
    add("armor-class-state-review");
  }

  if (
    /cannot regain hit points|can(?:not|'t) regain hit points/.test(mechanics) &&
    !conditionSpecial.includes("healing-denial") &&
    !rulesText.includes("regain hit points")
  ) {
    add("healing-denial-review");
  }

  if (
    /\bregain(?:s|ed)? hit points\b|\bheal(?:s|ing|ed)?\b|temporary hit points/.test(
      mechanics,
    ) &&
    !hasEnabledBlock(rules.defense) &&
    !hasEnabledBlock(rules.ongoing) &&
    !hasEnabledBlock(rules.procedure)
  ) {
    add("healing-review");
  }

  if (
    /\bresistan(?:ce|t)\b|\bimmun(?:ity|e)\b|\bvulnerab(?:ility|le)\b/.test(
      mechanics,
    ) &&
    !hasEnabledBlock(rules.defense)
  ) {
    add("damage-defense-review");
  }

  if (
    /\bsummon\b|\bspawn\b|\bcreate[s]?\b[^.]{0,30}\bcreature|\bhatch(?:es|ed)?\b/.test(
      mechanics,
    ) &&
    !hasEnabledBlock(rules.summon) &&
    !hasEnabledBlock(rules.procedure)
  ) {
    add("summon-spawn-review");
  }

  if (
    /\bteleport\b|\bphase\b|\bbecome invisible\b|\binvisibility\b/.test(mechanics) &&
    !hasEnabledBlock(rules.procedure) &&
    !hasEnabledBlock(rules.defense)
  ) {
    add("special-state-review");
  }

  if (
    /\bgrapple(?:d|s)?\b/.test(mechanics) &&
    !conditionNames.includes("grappled") &&
    !hasEnabledBlock(rules.procedure) &&
    !rulesText.includes("grapple")
  ) {
    add("grapple-review");
  }

  if (/recharge\s*[456](?:\s*[-–]\s*[456])?/.test(mechanics) && rules.usage?.type !== "recharge") {
    add("recharge-usage-review");
  }

  if (/\bmultiattack\b/.test(mechanics) && !hasEnabledBlock(rules.multiattack)) {
    add("multiattack-review");
  }

  if (/\bcritical hit\b/.test(mechanics) && !rulesText.includes("critical")) {
    add("critical-trigger-review");
  }

  if (
    /\bproficiency bonus\b|\bpb\b/.test(mechanics) &&
    !rulesText.includes("proficiency") &&
    !rulesText.includes("{pb}")
  ) {
    add("proficiency-scaling-review");
  }

  if (
    /\bstart of (?:its|the target's|each) turn\b|\bend of (?:its|the target's|each) turn\b/.test(
      mechanics,
    ) &&
    !hasEnabledBlock(rules.ongoing) &&
    !hasEnabledBlock(rules.areaEffect) &&
    !hasEnabledBlock(rules.procedure) &&
    !rules.trigger &&
    !/start of|end of/.test(rulesText)
  ) {
    add("turn-timing-review");
  }

  return flags.sort();
}

function getBalanceProfileSource(graft) {
  if (graft.balanceProfile || graft.balance || graft.monster?.balanceProfile || graft.monster?.balance) {
    return "balanceProfile";
  }
  if (graft.stats || graft.monster?.stats) return "legacyStats";
  return "empty";
}

function getCurrentAbilityCount(graft) {
  if (Array.isArray(graft.abilities) && graft.abilities.length) return graft.abilities.length;
  return 1;
}

function getAttackPatternStatus(graft) {
  if (graft.slot !== "attack") return "not-applicable";
  if (Array.isArray(graft.abilities) && graft.abilities.length > 1) return "ability-bundle";
  if (hasEnabledBlock(graft.rules?.multiattack) || graft.routine) return "authored-routine";
  return "single-action";
}

function getInventoryAbilityFeatures(graft = {}) {
  if (!Array.isArray(graft.abilities) || !graft.abilities.length) return [graft];
  return graft.abilities.map((ability) => ({
    ...ability,
    id: `${graft.id}:${ability.id}`,
    source: graft.source,
    slot: graft.slot,
    cost: graft.cost,
    complexity: graft.complexity,
  }));
}

function getAggregateParityStatus(abilityFeatures = []) {
  const statuses = abilityFeatures.map((feature) => feature.rules?.parity?.status || "unreviewed");
  if (statuses.length && statuses.every((status) => status === "verified")) return "verified";
  if (statuses.some((status) => status === "verified")) return "mixed";
  return "unreviewed";
}

function buildInventoryRow(graft, index, overrides) {
  const abilityFeatures = getInventoryAbilityFeatures(graft);
  const abilityRules = abilityFeatures.map((feature) => feature.rules || {});
  const damageBlocks = abilityRules.flatMap(getDamageBlocks);
  const damageBudgetRoles = [
    ...new Set(damageBlocks.map((damage) => cleanString(damage.budgetRole)).filter(Boolean)),
  ];
  const damageTypes = [
    ...new Set(damageBlocks.flatMap((damage) => asArray(damage.types || damage.type)).map(cleanString).filter(Boolean)),
  ];
  const conditionNames = [
    ...new Set(abilityRules.flatMap((rules) => asArray(rules.condition?.names)).map(cleanString).filter(Boolean)),
  ];
  const flags = [
    ...new Set(abilityFeatures.flatMap((feature) => buildParityReviewFlags(feature))),
  ].sort();
  const ruleVersions = [...new Set(abilityRules.map((rules) => rules.schemaVersion || "none"))];
  const migrationSources = [...new Set(abilityRules.map((rules) => rules.migration?.source || "none"))];
  const convertedFrom = [...new Set(abilityRules.map((rules) => rules.migration?.convertedFrom || "none"))];
  const authoredRoutine = Boolean(graft.kind === "attackPattern" && graft.routine?.defaultSequence?.length);
  const authoredMultiattack = Boolean(graft.routine?.multiattack?.enabled) || abilityRules.some((rules) => hasEnabledBlock(rules.multiattack));
  const multiattackParticipation = abilityRules.some((rules) => Boolean(rules.multiattackParticipation?.enabled));
  const primaryRules = abilityRules[0] || graft.rules || {};

  return {
    index: index + 1,
    id: graft.id,
    title: graft.title,
    source: graft.source,
    slot: graft.slot,
    section: graft.section || primaryRules.section || "trait",
    cost: Number(graft.cost || 0),
    complexity: Number(graft.complexity || 0),
    rulesSchemaVersion: ruleVersions.join("|") || "none",
    migrationSource: migrationSources.join("|") || "none",
    convertedFrom: convertedFrom.join("|") || "none",
    isStructured: abilityRules.length > 0 && abilityRules.every((rules) => Boolean(rules.migration?.isStructured)),
    balanceProfileSource: getBalanceProfileSource(graft),
    currentAbilityCount: abilityFeatures.length,
    attackPatternStatus: graft.slot !== "attack"
      ? "not-applicable"
      : authoredRoutine
        ? "authored-routine"
        : abilityFeatures.length > 1
          ? "ability-bundle"
          : "single-action",
    actionEconomy: [...new Set(abilityRules.map((rules) => rules.actionEconomy || "passive"))].join("|"),
    usageType: [...new Set(abilityRules.map((rules) => rules.usage?.type || "passive"))].join("|"),
    damageBudgetRoles,
    damageTypes,
    conditionNames,
    parityStatus: getAggregateParityStatus(abilityFeatures),
    effectCount: abilityRules.reduce((sum, rules) => sum + asArray(rules.effects).length, 0),
    conditionalDamageCount: damageBlocks.filter(
      (damage) => damage.activation && damage.activation.type !== "always",
    ).length,
    hasAreaTargeting: abilityRules.some((rules) => rules.targeting?.type === "area"),
    hasAreaEffect: abilityRules.some((rules) => hasEnabledBlock(rules.areaEffect)),
    hasOngoing: abilityRules.some((rules) => hasEnabledBlock(rules.ongoing)),
    hasDefense: abilityRules.some((rules) => hasEnabledBlock(rules.defense)),
    hasSummon: abilityRules.some((rules) => hasEnabledBlock(rules.summon)),
    hasProcedure: abilityRules.some((rules) => hasEnabledBlock(rules.procedure)),
    hasMultiattack: authoredMultiattack,
    hasMultiattackParticipation: multiattackParticipation,
    referenceCount: abilityRules.reduce((sum, rules) => sum + asArray(rules.references).length, 0),
    fitPresent: Boolean(graft.fit),
    compatibilityOverride: Boolean(overrides.compatibility[graft.id]),
    anatomyConstraintOverride: Boolean(overrides.anatomyConstraints[graft.id]),
    anatomyGrantOverride: Boolean(overrides.anatomyGrants[graft.id]),
    mechanicOverride: Boolean(overrides.mechanics[graft.id]),
    parityReviewFlags: flags,
    parityReviewRequired: flags.length > 0,
  };
}

function buildSummary(rows, currentRulesSchemaVersion, overrideSummary) {
  const attackRows = rows.filter((row) => row.slot === "attack");
  const flaggedRows = rows.filter((row) => row.parityReviewRequired);
  return {
    totalGrafts: rows.length,
    totalSources: new Set(rows.map((row) => row.source)).size,
    totalSlots: new Set(rows.map((row) => row.slot)).size,
    bySource: countBy(rows, (row) => row.source),
    bySlot: countBy(rows, (row) => row.slot),
    bySection: countBy(rows, (row) => row.section),
    byActionEconomy: countBy(rows, (row) => row.actionEconomy),
    currentRulesSchemaVersion,
    embeddedRulesSchemaVersions: countBy(rows, (row) => row.rulesSchemaVersion),
    structuredRules: rows.filter((row) => row.isStructured).length,
    convertedFromLegacyMechanics: rows.filter((row) => row.convertedFrom === "legacy-mechanics").length,
    usingLegacyBalanceStats: rows.filter((row) => row.balanceProfileSource === "legacyStats").length,
    usingBalanceProfile: rows.filter((row) => row.balanceProfileSource === "balanceProfile").length,
    attackGrafts: attackRows.length,
    attackGraftsWithAbilityBundles: attackRows.filter(
      (row) => row.attackPatternStatus === "authored-routine" || row.currentAbilityCount > 1,
    ).length,
    attackGraftsWithAuthoredRoutine: attackRows.filter((row) => row.attackPatternStatus === "authored-routine").length,
    authoredAttackAbilities: attackRows.reduce((sum, row) => sum + row.currentAbilityCount, 0),
    attackGraftsWithMultiattack: attackRows.filter((row) => row.hasMultiattack).length,
    attackGraftsWithMultiattackParticipation: attackRows.filter((row) => row.hasMultiattackParticipation).length,
    parityVerified: rows.filter((row) => row.parityStatus === "verified").length,
    structuredEffectClauses: rows.reduce((sum, row) => sum + row.effectCount, 0),
    conditionalDamageClauses: rows.reduce(
      (sum, row) => sum + row.conditionalDamageCount,
      0,
    ),
    parityReviewCandidates: flaggedRows.length,
    parityReviewFlagCounts: countValues(flaggedRows.flatMap((row) => row.parityReviewFlags)),
    overrides: overrideSummary,
  };
}

function csvEscape(value) {
  const serialized = Array.isArray(value)
    ? value.join("|")
    : typeof value === "boolean"
      ? value
        ? "true"
        : "false"
      : String(value ?? "");
  return /[",\n\r]/.test(serialized) ? `"${serialized.replaceAll('"', '""')}"` : serialized;
}

function renderCsv(rows) {
  const headers = Object.keys(rows[0] || {});
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n") + "\n";
}

function renderCountTable(counts, label) {
  const rows = Object.entries(counts);
  return [
    `| ${label} | Count |`,
    "|---|---:|",
    ...rows.map(([key, value]) => `| ${key} | ${value} |`),
  ].join("\n");
}

function renderAttackTable(rows) {
  const attackRows = rows.filter((row) => row.slot === "attack");
  return [
    "| Source | ID | Title | Usage | Abilities | Authored routine | Parity review flags |",
    "|---|---|---|---|---:|---|---|",
    ...attackRows.map(
      (row) =>
        `| ${row.source} | \`${row.id}\` | ${row.title} | ${row.usageType} | ${row.currentAbilityCount} | ${row.attackPatternStatus} | ${row.parityReviewFlags.join(", ") || "—"} |`,
    ),
  ].join("\n");
}

function renderFlaggedGroups(rows) {
  const bySource = new Map();
  rows
    .filter((row) => row.parityReviewRequired)
    .forEach((row) => {
      if (!bySource.has(row.source)) bySource.set(row.source, []);
      bySource.get(row.source).push(row);
    });

  if (!bySource.size) return "No parity review candidates detected.";

  return [...bySource.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([source, sourceRows]) => {
      const items = sourceRows
        .map(
          (row) =>
            `- \`${row.id}\` — ${row.title}: ${row.parityReviewFlags.join(", ")}`,
        )
        .join("\n");
      return `### ${source}\n\n${items}`;
    })
    .join("\n\n");
}

function renderMarkdown(report) {
  const { metadata, summary, rows } = report;
  return `# Terrifying Monsters — Phase 0 Graft Inventory

**Generated by:** \`scripts/monster/report-monster-graft-phase0.mjs\`  
**Package version:** \`${metadata.packageVersion}\`  
**Monster graft source SHA-256:** \`${metadata.monsterGraftsSha256}\`  
**Current rules schema:** \`${summary.currentRulesSchemaVersion}\`

## Scope

This is a deterministic inventory of the current monster graft catalogue. It does not alter runtime behavior and does not inspect or modify UI files.

The parity flags are **review candidates**, not automatic proof of a defect. They identify legacy prose that appears to describe mechanics not obviously represented by the structured rules object.

## Summary

| Metric | Value |
|---|---:|
| Total grafts | ${summary.totalGrafts} |
| Sources | ${summary.totalSources} |
| Slots | ${summary.totalSlots} |
| Structured rules | ${summary.structuredRules} |
| Converted from legacy mechanics | ${summary.convertedFromLegacyMechanics} |
| Using legacy balance stats | ${summary.usingLegacyBalanceStats} |
| Using explicit balanceProfile | ${summary.usingBalanceProfile} |
| Attack-slot grafts | ${summary.attackGrafts} |
| Attack ability bundles | ${summary.attackGraftsWithAbilityBundles} |
| Authored Attack abilities | ${summary.authoredAttackAbilities} |
| Attack grafts with authored routine | ${summary.attackGraftsWithAuthoredRoutine} |
| Attack grafts with authored Multiattack | ${summary.attackGraftsWithMultiattack} |
| Attack grafts with Multiattack participation | ${summary.attackGraftsWithMultiattackParticipation} |
| Verified parity grafts | ${summary.parityVerified} |
| Structured effect clauses | ${summary.structuredEffectClauses} |
| Conditional damage clauses | ${summary.conditionalDamageClauses} |
| Parity review candidates | ${summary.parityReviewCandidates} |

## Distribution by source

${renderCountTable(summary.bySource, "Source")}

## Distribution by slot

${renderCountTable(summary.bySlot, "Slot")}

## Embedded schema versions

${renderCountTable(summary.embeddedRulesSchemaVersions, "Embedded schema")}

The source catalogue still embeds older rules versions even when the current normalizer schema is newer. This is a migration concern, not necessarily a runtime failure.

## Attack-slot inventory

${renderAttackTable(rows)}

Every Attack-slot graft now uses an authored Attack Pattern v2 contract. The table reports the authored repertoire, routine, Multiattack, and explicit participation state preserved by the compiler bridge.

## Side override inventory

| Override map | Entries | Unknown graft IDs |
|---|---:|---|
| Frame fit | ${summary.overrides.frameFit.entries} | ${summary.overrides.frameFit.unknownIds.join(", ") || "—"} |
| Compatibility | ${summary.overrides.compatibility.entries} | ${summary.overrides.compatibility.unknownIds.join(", ") || "—"} |
| Anatomy constraints | ${summary.overrides.anatomyConstraints.entries} | ${summary.overrides.anatomyConstraints.unknownIds.join(", ") || "—"} |
| Anatomy grants | ${summary.overrides.anatomyGrants.entries} | ${summary.overrides.anatomyGrants.unknownIds.join(", ") || "—"} |
| Mechanic metadata | ${summary.overrides.mechanics.entries} | ${summary.overrides.mechanics.unknownIds.join(", ") || "—"} |

## Parity review flag counts

${renderCountTable(summary.parityReviewFlagCounts, "Review flag")}

## Parity review candidates

${renderFlaggedGroups(rows)}

## Machine-readable outputs

- \`graft-inventory.generated.csv\` contains one row per graft.
- \`graft-inventory.generated.json\` contains metadata, summary, and the complete row set.

Run:

\`\`\`bash
npm run monster:audit:grafts
npm run monster:audit:grafts:check
\`\`\`
`;
}

function buildOverrideSummary(graftIds, maps) {
  const summarize = (map) => {
    const ids = Object.keys(map || {});
    return {
      entries: ids.length,
      unknownIds: ids.filter((id) => !graftIds.has(id)).sort(),
    };
  };
  return {
    frameFit: summarize(maps.frameFit),
    compatibility: summarize(maps.compatibility),
    anatomyConstraints: summarize(maps.anatomyConstraints),
    anatomyGrants: summarize(maps.anatomyGrants),
    mechanics: summarize(maps.mechanics),
  };
}

function writeOrCheck(filePath, expectedContent) {
  if (CHECK_MODE) {
    const actualContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
    if (actualContent !== expectedContent) {
      console.error(`Stale or missing generated inventory: ${path.relative(REPO_ROOT, filePath)}`);
      return false;
    }
    return true;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, expectedContent, "utf8");
  console.log(`Wrote ${path.relative(REPO_ROOT, filePath)}`);
  return true;
}

async function main() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf8"));
  const graftsSource = fs.readFileSync(GRAFTS_PATH, "utf8");
  const rulesSchemaSource = fs.readFileSync(RULES_SCHEMA_PATH, "utf8");
  const moduleUrl = `${pathToFileURL(GRAFTS_PATH).href}?inventory=${hashText(graftsSource).slice(0, 12)}`;
  const graftModule = await import(moduleUrl);
  const grafts = asArray(graftModule.MONSTER_GRAFTS);
  const graftIds = new Set(grafts.map((graft) => graft.id));
  const overrides = {
    frameFit: graftModule.FEATURE_FRAME_FIT_OVERRIDES || {},
    compatibility: graftModule.FEATURE_COMPATIBILITY_OVERRIDES || {},
    anatomyConstraints: graftModule.FEATURE_ANATOMY_CONSTRAINT_OVERRIDES || {},
    anatomyGrants: graftModule.FEATURE_ANATOMY_GRANT_OVERRIDES || {},
    mechanics: graftModule.FEATURE_MECHANIC_OVERRIDES || {},
  };
  const overrideSummary = buildOverrideSummary(graftIds, overrides);
  const rows = grafts.map((graft, index) => buildInventoryRow(graft, index, overrides));
  const currentRulesSchemaVersion = parseCurrentRulesSchemaVersion(rulesSchemaSource);
  const summary = buildSummary(rows, currentRulesSchemaVersion, overrideSummary);
  const report = {
    metadata: {
      schemaVersion: "terrifying-monsters-graft-inventory-v1.0",
      packageVersion: packageJson.version || "unknown",
      monsterGraftsPath: path.relative(REPO_ROOT, GRAFTS_PATH).replaceAll(path.sep, "/"),
      monsterGraftsSha256: hashText(graftsSource),
      generatorPath: path.relative(REPO_ROOT, SCRIPT_PATH).replaceAll(path.sep, "/"),
      deterministic: true,
    },
    summary,
    rows,
  };

  const expectedOutputs = [
    [OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`],
    [OUTPUT_CSV, renderCsv(rows)],
    [OUTPUT_MARKDOWN, renderMarkdown(report)],
  ];
  const results = expectedOutputs.map(([filePath, content]) => writeOrCheck(filePath, content));

  if (CHECK_MODE) {
    if (results.every(Boolean)) {
      console.log("Monster graft Phase 0 inventory is current.");
      return;
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
