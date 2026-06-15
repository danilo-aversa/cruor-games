import { SHARED_MONSTER_SLOTS } from "../../../shared/content/workflows.js";
import { SHARED_SOURCE_ANCHORS } from "../../../shared/content/source-anchors.js";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function formatPlainLabel(value) {
  return String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

const CANONICAL_MONSTER_SLOT_MAP = new Map(SHARED_MONSTER_SLOTS.map((slot) => [slot.id, slot]));
const SHARED_SOURCE_ANCHOR_BY_ID = new Map(SHARED_SOURCE_ANCHORS.map((sourceAnchor) => [sourceAnchor.id, sourceAnchor]));

function hasText(value) {
  return String(value || "").trim().length > 0;
}

function normalizeStatus(value) {
  return ["draft", "published", "archived"].includes(value) ? value : "draft";
}

export const GRAFT_LEDGER_ACTION_ORDER = [
  "passive",
  "freeTrigger",
  "action",
  "bonusAction",
  "reaction",
  "legendaryAction",
  "lairAction",
  "deathEffect",
];

export const GRAFT_LEDGER_RESOLUTION_ORDER = [
  "attackRoll",
  "savingThrow",
  "automatic",
  "contest",
  "choice",
  "none",
];

export const GRAFT_LEDGER_MAX_BUCKET_ROWS = 10;

export function normalizeLedgerString(value) {
  return String(value || "").trim();
}

export function normalizeLedgerArray(value) {
  return asArray(value)
    .flatMap((item) => Array.isArray(item) ? item : [item])
    .map((item) => normalizeLedgerString(item))
    .filter(Boolean);
}

export function uniqueLedgerArray(value) {
  return [...new Set(normalizeLedgerArray(value))];
}

export function getLedgerNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getLedgerMonsterBlock(graft = {}) {
  return graft.monster && typeof graft.monster === "object" ? graft.monster : {};
}

function getLedgerRules(graft = {}) {
  const monster = getLedgerMonsterBlock(graft);
  return monster.rules || graft.rules || {};
}

function getLedgerConstraints(graft = {}) {
  const monster = getLedgerMonsterBlock(graft);
  return monster.constraints || graft.constraints || graft.anatomyConstraints || {};
}

function getLedgerAnatomyGrants(graft = {}) {
  const monster = getLedgerMonsterBlock(graft);
  return monster.anatomyGrants || graft.anatomyGrants || {};
}

function getLedgerStats(graft = {}) {
  const monster = getLedgerMonsterBlock(graft);
  return monster.stats || graft.stats || {};
}

function getLedgerFit(graft = {}) {
  const monster = getLedgerMonsterBlock(graft);
  return monster.fit || graft.fit || graft.frameFit || {};
}

function getLedgerGraftId(graft = {}) {
  const monster = getLedgerMonsterBlock(graft);
  return normalizeLedgerString(monster.graftId || graft.id || graft.slug || graft.title);
}

function getLedgerSlot(graft = {}) {
  const monster = getLedgerMonsterBlock(graft);
  return normalizeLedgerString(monster.slot || graft.slot || asArray(graft.slots)[0] || "unassigned");
}

function getLedgerSection(graft = {}, rules = getLedgerRules(graft)) {
  const monster = getLedgerMonsterBlock(graft);
  return normalizeLedgerString(monster.section || graft.section || rules.section || "trait");
}

function getLedgerActionEconomy(graft = {}, rules = getLedgerRules(graft), section = getLedgerSection(graft, rules)) {
  const actionEconomy = normalizeLedgerString(rules.actionEconomy || rules.action || rules.type);
  if (actionEconomy) return actionEconomy;
  if (section === "bonusAction") return "bonusAction";
  if (section === "reaction") return "reaction";
  if (section === "legendaryAction") return "legendaryAction";
  if (section === "lairAction") return "lairAction";
  if (section === "deathEffect") return "deathEffect";
  if (section === "action") return "action";
  return section === "trait" ? "passive" : section || "passive";
}

function getLedgerResolution(graft = {}, rules = getLedgerRules(graft)) {
  return rules.resolution && typeof rules.resolution === "object" ? rules.resolution : {};
}

function getLedgerTargeting(graft = {}, rules = getLedgerRules(graft)) {
  return rules.targeting && typeof rules.targeting === "object" ? rules.targeting : {};
}

function getLedgerDamageTypes(graft = {}, rules = getLedgerRules(graft)) {
  const damage = rules.damage && typeof rules.damage === "object" ? rules.damage : {};
  return uniqueLedgerArray([
    ...normalizeLedgerArray(damage.types),
    ...asArray(damage.parts).flatMap((part) => normalizeLedgerArray(part?.types || part?.type)),
    ...normalizeLedgerArray(graft.damageTypes),
  ]);
}

function getLedgerConditions(graft = {}, rules = getLedgerRules(graft)) {
  const condition = rules.condition && typeof rules.condition === "object" ? rules.condition : {};
  return uniqueLedgerArray([
    ...normalizeLedgerArray(condition.names),
    ...normalizeLedgerArray(condition.special),
    ...normalizeLedgerArray(rules.conditions),
    ...normalizeLedgerArray(graft.conditions),
  ]);
}

function getLedgerCounterplayFlags(graft = {}, rules = getLedgerRules(graft)) {
  const counterplay = rules.counterplay && typeof rules.counterplay === "object" ? rules.counterplay : {};
  return Object.entries(counterplay)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key);
}

function getLedgerSourceAnchors(graft = {}) {
  return uniqueLedgerArray([
    ...normalizeLedgerArray(graft.sourceAnchors),
    graft.source,
    ...normalizeLedgerArray(graft.sources),
  ]);
}

function getLedgerPack(graft = {}, origin = "Library") {
  if (graft.contentPack?.title || graft.contentPack?.id) {
    return {
      id: graft.contentPack.id || graft.contentPack.title,
      title: graft.contentPack.title || formatPlainLabel(graft.contentPack.id),
    };
  }

  if (origin === "Current Draft") return { id: "current-draft", title: "Current Draft" };
  return { id: "core-cruor", title: "Core Monster Composer" };
}

function getLedgerTypeBias(graft = {}) {
  const monster = getLedgerMonsterBlock(graft);
  const fit = getLedgerFit(graft);
  return uniqueLedgerArray([
    ...normalizeLedgerArray(monster.typeBias),
    ...normalizeLedgerArray(graft.typeBias),
    ...normalizeLedgerArray(fit.creatureTypes?.recommended),
    ...normalizeLedgerArray(fit.creatureTypes?.allowed),
  ]);
}

function getLedgerRoleBias(graft = {}) {
  const monster = getLedgerMonsterBlock(graft);
  const fit = getLedgerFit(graft);
  return uniqueLedgerArray([
    ...normalizeLedgerArray(monster.roleBias),
    ...normalizeLedgerArray(graft.roleBias),
    ...normalizeLedgerArray(fit.encounterRoles?.recommended),
    ...normalizeLedgerArray(fit.encounterRoles?.allowed),
  ]);
}

function getLedgerFamilies(graft = {}) {
  const constraints = getLedgerConstraints(graft);
  return uniqueLedgerArray([
    ...normalizeLedgerArray(constraints.allowedFamilies),
    ...normalizeLedgerArray(constraints.recommendedFamilies),
    ...normalizeLedgerArray(constraints.requiredFamilies),
    ...normalizeLedgerArray(constraints.familyBias),
  ]);
}

function getLedgerBodyPlans(graft = {}) {
  const constraints = getLedgerConstraints(graft);
  return uniqueLedgerArray([
    ...normalizeLedgerArray(constraints.allowedBodyPlans),
    ...normalizeLedgerArray(constraints.recommendedBodyPlans),
    ...normalizeLedgerArray(constraints.requiredBodyPlans),
  ]);
}

function getLedgerAnatomyTerms(graft = {}) {
  const constraints = getLedgerConstraints(graft);
  const grants = getLedgerAnatomyGrants(graft);
  return uniqueLedgerArray([
    ...normalizeLedgerArray(constraints.requiredAnatomy),
    ...normalizeLedgerArray(constraints.forbiddenAnatomy),
    ...normalizeLedgerArray(grants.requiredAnatomy),
    ...normalizeLedgerArray(grants.optionalAnatomy),
    ...normalizeLedgerArray(grants.tags),
  ]);
}

function formatLedgerTargeting(targeting = {}) {
  const type = normalizeLedgerString(targeting.type);
  const shape = normalizeLedgerString(targeting.shape);
  const size = normalizeLedgerString(targeting.size);
  const unit = normalizeLedgerString(targeting.unit);
  const targets = normalizeLedgerString(targeting.targets);
  const area = [shape, size && unit ? `${size} ${unit}` : size || unit].filter(Boolean).join(" ");
  return [type, area, targets].filter(Boolean).join(" · ") || "—";
}

export function formatLedgerArray(value, fallback = "—") {
  const values = normalizeLedgerArray(value);
  return values.length ? values.map(formatPlainLabel).join(", ") : fallback;
}

export function formatLedgerValue(value, fallback = "—") {
  const cleanValue = normalizeLedgerString(value);
  return cleanValue ? formatPlainLabel(cleanValue) : fallback;
}

function buildGraftLedgerItem(graft = {}, origin = "Library") {
  const rules = getLedgerRules(graft);
  const resolution = getLedgerResolution(graft, rules);
  const targeting = getLedgerTargeting(graft, rules);
  const stats = getLedgerStats(graft);
  const slot = getLedgerSlot(graft);
  const section = getLedgerSection(graft, rules);
  const actionEconomy = getLedgerActionEconomy(graft, rules, section);
  const sourceAnchors = getLedgerSourceAnchors(graft);
  const contentPack = getLedgerPack(graft, origin);
  const damageTypes = getLedgerDamageTypes(graft, rules);
  const conditions = getLedgerConditions(graft, rules);
  const counterplayFlags = getLedgerCounterplayFlags(graft, rules);
  const constraints = getLedgerConstraints(graft);
  const anatomyTerms = getLedgerAnatomyTerms(graft);
  const id = getLedgerGraftId(graft);

  return {
    id,
    title: graft.title || graft.label || formatPlainLabel(id),
    slot,
    slotLabel: CANONICAL_MONSTER_SLOT_MAP.get(slot)?.label || formatPlainLabel(slot),
    section,
    actionEconomy,
    usage: normalizeLedgerString(rules.usage?.type || rules.usage || ""),
    resolutionType: normalizeLedgerString(resolution.type || "none"),
    attackType: normalizeLedgerString(resolution.attackType || resolution.range || ""),
    saveAbility: normalizeLedgerString(resolution.ability || ""),
    targetingLabel: formatLedgerTargeting(targeting),
    damageTypes,
    conditions,
    sourceAnchors,
    sourceLabel: sourceAnchors.map((sourceAnchorId) => SHARED_SOURCE_ANCHOR_BY_ID.get(sourceAnchorId)?.label || formatPlainLabel(sourceAnchorId)).join(", ") || "—",
    contentPack,
    typeBias: getLedgerTypeBias(graft),
    roleBias: getLedgerRoleBias(graft),
    families: getLedgerFamilies(graft),
    bodyPlans: getLedgerBodyPlans(graft),
    anatomyTerms,
    cost: getLedgerNumber(getLedgerMonsterBlock(graft).cost ?? graft.cost),
    complexity: getLedgerNumber(getLedgerMonsterBlock(graft).complexity ?? graft.complexity),
    dpr: getLedgerNumber(stats.dpr),
    hp: getLedgerNumber(stats.hp),
    ac: getLedgerNumber(stats.ac),
    counterplayFlags,
    hasRules: Boolean(rules && Object.keys(rules).length),
    hasStructuredRules: Boolean(rules?.schemaVersion || rules?.migration?.isStructured || resolution.type || actionEconomy),
    hasCounterplayText: hasText(graft.counterplay || rules.text?.counterplay || rules.counterplayText),
    hasMechanicsText: hasText(graft.mechanics || graft.tableText || rules.text?.failure || rules.text?.success),
    hasSummary: hasText(graft.summary),
    hasAnatomyConstraint: Boolean(Object.keys(constraints || {}).length || anatomyTerms.length),
    status: normalizeStatus(graft.status || getLedgerMonsterBlock(graft).status || "published"),
    origin,
    raw: graft,
  };
}

function mergeGraftLedgerItems(libraryGrafts = [], draftGrafts = []) {
  const byId = new Map();

  asArray(libraryGrafts).forEach((graft) => {
    const item = buildGraftLedgerItem(graft, "Library");
    if (item.id) byId.set(item.id, item);
  });

  asArray(draftGrafts).forEach((graft) => {
    const item = buildGraftLedgerItem(graft, "Current Draft");
    if (item.id) byId.set(item.id, item);
  });

  return [...byId.values()].sort((a, b) => a.title.localeCompare(b.title));
}

function countLedgerBuckets(items = [], getter, knownOrder = []) {
  const counts = new Map();

  knownOrder.forEach((id) => {
    if (id) counts.set(id, { id, label: formatPlainLabel(id), count: 0, items: [] });
  });

  asArray(items).forEach((item) => {
    const values = normalizeLedgerArray(typeof getter === "function" ? getter(item) : item?.[getter]);
    const bucketValues = values.length ? values : ["unassigned"];
    bucketValues.forEach((id) => {
      const key = normalizeLedgerString(id) || "unassigned";
      const current = counts.get(key) || { id: key, label: formatPlainLabel(key), count: 0, items: [] };
      current.count += 1;
      current.items.push(item);
      counts.set(key, current);
    });
  });

  return [...counts.values()].sort((a, b) => {
    const aIndex = knownOrder.indexOf(a.id);
    const bIndex = knownOrder.indexOf(b.id);
    if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label);
  });
}

export function getLedgerTopBuckets(rows = [], limit = GRAFT_LEDGER_MAX_BUCKET_ROWS) {
  return [...rows]
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function getLedgerIssueList(item) {
  const issues = [];
  if (!item.slot || item.slot === "unassigned") issues.push("Missing monster slot");
  if (!item.sourceAnchors.length) issues.push("Missing source anchor");
  if (!item.hasStructuredRules) issues.push("Missing structured rules");
  if (!item.hasSummary) issues.push("Missing summary");
  if (!item.hasMechanicsText) issues.push("Missing mechanics text");
  if (!item.hasCounterplayText && item.actionEconomy !== "passive") issues.push("Missing counterplay text");
  if (item.resolutionType === "savingThrow" && !item.saveAbility) issues.push("Missing save ability");
  if (item.resolutionType === "attackRoll" && !item.attackType) issues.push("Missing attack type");
  if (item.dpr > 0 && !item.damageTypes.length) issues.push("DPR without damage type");
  if (item.conditions.length && !item.counterplayFlags.length) issues.push("Condition without structured counterplay flag");
  return issues;
}

export function getLedgerIssueSeverity(item) {
  const issues = getLedgerIssueList(item);
  if (issues.some((issue) => issue.startsWith("Missing monster slot") || issue.startsWith("Missing source anchor") || issue.startsWith("Missing structured rules"))) return "error";
  if (issues.length) return "warning";
  return "clean";
}

function buildLedgerMatrix(items = [], rowBuckets = [], columnBuckets = []) {
  return rowBuckets.map((row) => ({
    ...row,
    columns: columnBuckets.map((column) => ({
      ...column,
      count: items.filter((item) => item.slot === row.id && item.actionEconomy === column.id).length,
    })),
  }));
}

function buildGraftLedgerGaps({ items, bySlot, byAction, byResolution, byType, byDamageType, byCondition, bySource }) {
  const gaps = [];
  const total = items.length || 1;
  const sparseSlots = bySlot.filter((row) => row.id !== "unassigned" && row.count < 4);
  const missingActions = byAction.filter((row) => row.count === 0);
  const overloadedDamage = byDamageType.filter((row) => row.count >= Math.ceil(total * 0.22));
  const weakTypeCoverage = byType.filter((row) => row.id !== "unassigned" && row.count < 6);
  const draftItems = items.filter((item) => item.origin === "Current Draft").length;
  const issueItems = items.filter((item) => getLedgerIssueSeverity(item) !== "clean");

  sparseSlots.slice(0, 4).forEach((row) => gaps.push({
    id: `slot-${row.id}`,
    severity: row.count === 0 ? "error" : "warning",
    title: `${row.label} is underfilled`,
    detail: `${row.count} graft${row.count === 1 ? "" : "s"} in this slot. Add at least four to keep Composer picks varied.`,
  }));

  missingActions.slice(0, 3).forEach((row) => gaps.push({
    id: `action-${row.id}`,
    severity: "warning",
    title: `${row.label} coverage is missing`,
    detail: "No graft currently uses this action economy. Consider adding one if this economy should be available to generated monsters.",
  }));

  weakTypeCoverage.slice(0, 3).forEach((row) => gaps.push({
    id: `type-${row.id}`,
    severity: "info",
    title: `${row.label} has low type bias coverage`,
    detail: `${row.count} graft${row.count === 1 ? "" : "s"} explicitly bias toward this creature type.`,
  }));

  overloadedDamage.slice(0, 2).forEach((row) => gaps.push({
    id: `damage-${row.id}`,
    severity: "info",
    title: `${row.label} damage is dominant`,
    detail: `${row.count} grafts use this damage type. Review whether future packs should diversify damage expressions.`,
  }));

  if (!byResolution.some((row) => row.id === "savingThrow" && row.count > 0)) {
    gaps.push({ id: "no-saves", severity: "warning", title: "No saving throw grafts", detail: "The ledger has no save-based effects, reducing tactical variety." });
  }

  if (!byCondition.some((row) => row.count > 0)) {
    gaps.push({ id: "no-conditions", severity: "warning", title: "No condition pressure", detail: "No graft applies a condition, so monsters may feel too damage-only." });
  }

  if (issueItems.length) {
    gaps.push({
      id: "ledger-issues",
      severity: issueItems.some((item) => getLedgerIssueSeverity(item) === "error") ? "error" : "warning",
      title: `${issueItems.length} graft${issueItems.length === 1 ? "" : "s"} need editorial review`,
      detail: "Use the Issues filter in the ledger to locate entries with missing slot, source, rules, mechanics, or counterplay metadata.",
    });
  }

  if (draftItems) {
    gaps.push({
      id: "draft-overrides",
      severity: "info",
      title: `${draftItems} current draft graft${draftItems === 1 ? "" : "s"} included`,
      detail: "Draft entries override matching library ids inside this audit, so the ledger reflects what you are editing now.",
    });
  }

  const narrowSources = bySource.filter((row) => row.id !== "unassigned" && row.count === 1).length;
  if (narrowSources) {
    gaps.push({
      id: "single-source-grafts",
      severity: "info",
      title: `${narrowSources} source anchor${narrowSources === 1 ? "" : "s"} have one graft`,
      detail: "Single-graft sources work as seeds, but they offer little internal variation for Composer pulls.",
    });
  }

  return gaps.slice(0, 10);
}

export function buildGraftLedgerReport(libraryGrafts = [], draftGrafts = []) {
  const items = mergeGraftLedgerItems(libraryGrafts, draftGrafts);
  const slotOrder = SHARED_MONSTER_SLOTS.map((slot) => slot.id);
  const bySlot = countLedgerBuckets(items, "slot", slotOrder);
  const byAction = countLedgerBuckets(items, "actionEconomy", GRAFT_LEDGER_ACTION_ORDER);
  const byResolution = countLedgerBuckets(items, "resolutionType", GRAFT_LEDGER_RESOLUTION_ORDER);
  const byDamageType = countLedgerBuckets(items, "damageTypes");
  const byCondition = countLedgerBuckets(items, "conditions");
  const bySource = countLedgerBuckets(items, "sourceAnchors").map((row) => ({
    ...row,
    label: SHARED_SOURCE_ANCHOR_BY_ID.get(row.id)?.label || row.label,
  }));
  const byPack = countLedgerBuckets(items, (item) => item.contentPack?.id || "unassigned").map((row) => ({
    ...row,
    label: items.find((item) => item.contentPack?.id === row.id)?.contentPack?.title || row.label,
  }));
  const byType = countLedgerBuckets(items, "typeBias");
  const byRole = countLedgerBuckets(items, "roleBias");
  const byFamily = countLedgerBuckets(items, "families");
  const byComplexity = countLedgerBuckets(items, (item) => {
    if (item.complexity <= 1) return "low";
    if (item.complexity <= 3) return "medium";
    return "high";
  }, ["low", "medium", "high"]);
  const cleanItems = items.filter((item) => getLedgerIssueSeverity(item) === "clean");
  const warningItems = items.filter((item) => getLedgerIssueSeverity(item) === "warning");
  const errorItems = items.filter((item) => getLedgerIssueSeverity(item) === "error");
  const matrixColumns = GRAFT_LEDGER_ACTION_ORDER.map((id) => ({ id, label: formatPlainLabel(id) }));
  const matrix = buildLedgerMatrix(items, bySlot.filter((row) => row.id !== "unassigned"), matrixColumns);

  return {
    items,
    summary: {
      total: items.length,
      library: items.filter((item) => item.origin === "Library").length,
      draft: items.filter((item) => item.origin === "Current Draft").length,
      clean: cleanItems.length,
      warning: warningItems.length,
      error: errorItems.length,
      averageCost: items.length ? items.reduce((sum, item) => sum + item.cost, 0) / items.length : 0,
      averageComplexity: items.length ? items.reduce((sum, item) => sum + item.complexity, 0) / items.length : 0,
      structuredRules: items.filter((item) => item.hasStructuredRules).length,
      counterplayCoverage: items.filter((item) => item.hasCounterplayText || item.counterplayFlags.length).length,
      anatomyCoverage: items.filter((item) => item.hasAnatomyConstraint).length,
    },
    buckets: {
      bySlot,
      byAction,
      byResolution,
      byDamageType,
      byCondition,
      bySource,
      byPack,
      byType,
      byRole,
      byFamily,
      byComplexity,
    },
    matrix,
    gaps: buildGraftLedgerGaps({ items, bySlot, byAction, byResolution, byType, byDamageType, byCondition, bySource }),
  };
}


function serializeLedgerBucketRow(row = {}) {
  return {
    id: row.id || "unassigned",
    label: row.label || formatPlainLabel(row.id || "unassigned"),
    count: getLedgerNumber(row.count),
    itemIds: asArray(row.items).map((item) => item?.id).filter(Boolean),
  };
}

function serializeLedgerBuckets(buckets = {}) {
  return Object.fromEntries(
    Object.entries(buckets).map(([key, rows]) => [key, asArray(rows).map(serializeLedgerBucketRow)]),
  );
}

function serializeLedgerMatrix(rows = []) {
  return asArray(rows).map((row) => ({
    id: row.id,
    label: row.label,
    count: getLedgerNumber(row.count),
    columns: asArray(row.columns).map((column) => ({
      id: column.id,
      label: column.label,
      count: getLedgerNumber(column.count),
    })),
  }));
}

function serializeGraftLedgerItem(item = {}, { includeRaw = true } = {}) {
  const issues = getLedgerIssueList(item);
  const serialized = {
    id: item.id,
    title: item.title,
    origin: item.origin,
    status: item.status,
    slot: item.slot,
    slotLabel: item.slotLabel,
    section: item.section,
    actionEconomy: item.actionEconomy,
    usage: item.usage,
    resolutionType: item.resolutionType,
    attackType: item.attackType,
    saveAbility: item.saveAbility,
    targeting: item.targetingLabel,
    damageTypes: item.damageTypes,
    conditions: item.conditions,
    sourceAnchors: item.sourceAnchors,
    sourceLabel: item.sourceLabel,
    contentPack: item.contentPack,
    typeBias: item.typeBias,
    roleBias: item.roleBias,
    families: item.families,
    bodyPlans: item.bodyPlans,
    anatomyTerms: item.anatomyTerms,
    cost: item.cost,
    complexity: item.complexity,
    dpr: item.dpr,
    hp: item.hp,
    ac: item.ac,
    counterplayFlags: item.counterplayFlags,
    coverage: {
      hasRules: item.hasRules,
      hasStructuredRules: item.hasStructuredRules,
      hasCounterplayText: item.hasCounterplayText,
      hasMechanicsText: item.hasMechanicsText,
      hasSummary: item.hasSummary,
      hasAnatomyConstraint: item.hasAnatomyConstraint,
    },
    editorialState: {
      severity: getLedgerIssueSeverity(item),
      issues,
    },
  };

  if (includeRaw) serialized.rawGraft = item.raw || null;
  return serialized;
}

export function buildGraftLedgerDownloadReport(report = {}, filters = {}) {
  const items = asArray(report.items);
  const visibleItemIds = normalizeLedgerArray(filters.visibleItemIds);

  return {
    reportType: "cruor-monster-graft-ledger-report",
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    intendedUse: "Upload this JSON back into ChatGPT to audit Monster Composer graft coverage, metadata quality, content gaps, and next-pack priorities.",
    scope: {
      totalGrafts: getLedgerNumber(report.summary?.total),
      libraryGrafts: getLedgerNumber(report.summary?.library),
      currentDraftGrafts: getLedgerNumber(report.summary?.draft),
      visibleGrafts: getLedgerNumber(filters.visibleCount, visibleItemIds.length),
    },
    activeFilters: {
      search: filters.search || "",
      slot: filters.slot || "all",
      actionEconomy: filters.action || "all",
      source: filters.source || "all",
      issueState: filters.issueState || "all",
      viewMode: filters.viewMode || "list",
      visibleItemIds,
    },
    summary: report.summary || {},
    analytics: serializeLedgerBuckets(report.buckets || {}),
    matrix: serializeLedgerMatrix(report.matrix),
    gaps: asArray(report.gaps).map((gap) => ({
      id: gap.id,
      severity: gap.severity,
      title: gap.title,
      detail: gap.detail,
    })),
    issueIndex: items.map((item) => ({
      id: item.id,
      title: item.title,
      severity: getLedgerIssueSeverity(item),
      issues: getLedgerIssueList(item),
    })),
    inventory: items.map((item) => serializeGraftLedgerItem(item, { includeRaw: true })),
  };
}

function matchesGraftLedgerSearch(item, query) {
  const needle = normalizeLedgerString(query).toLowerCase();
  if (!needle) return true;
  const haystack = [
    item.id,
    item.title,
    item.slotLabel,
    item.section,
    item.actionEconomy,
    item.resolutionType,
    item.attackType,
    item.saveAbility,
    item.targetingLabel,
    item.sourceLabel,
    item.contentPack?.title,
    ...item.damageTypes,
    ...item.conditions,
    ...item.typeBias,
    ...item.roleBias,
    ...item.families,
    ...item.bodyPlans,
    ...item.anatomyTerms,
    ...getLedgerIssueList(item),
  ].join(" ").toLowerCase();
  return haystack.includes(needle);
}

export function getGraftLedgerFilteredItems(items = [], filters = {}) {
  return asArray(items).filter((item) => {
    if (!matchesGraftLedgerSearch(item, filters.search)) return false;
    if (filters.slot && filters.slot !== "all" && item.slot !== filters.slot) return false;
    if (filters.action && filters.action !== "all" && item.actionEconomy !== filters.action) return false;
    if (filters.source && filters.source !== "all" && !item.sourceAnchors.includes(filters.source)) return false;
    if (filters.issueState && filters.issueState !== "all" && getLedgerIssueSeverity(item) !== filters.issueState) return false;
    return true;
  });
}
