import { SHARED_DARKEN_LOCATION_SLOTS, SHARED_MONSTER_SLOTS } from "../../../shared/content/workflows.js";
import { STATIC_CONTENT_REGISTRY_DATA } from "../../../shared/content/static-registry.js";
import { normalizeModuleForDraft } from "../model/studio-draft.js";
import { buildStudioSemanticCoverageMatrix } from "../model/studio-semantic-coverage.js";
import {
  isStudioSpecializedSemanticType,
  listStudioSemanticEditorDefinitions,
} from "../schema/studio-semantic-editor-registry.js";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeString(value) {
  return String(value || "").trim();
}

function formatLabel(value) {
  return String(value || "unassigned")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function entryId(entry = {}) {
  return normalizeString(entry.id || entry.slug || entry.monster?.graftId || entry.title);
}

function getRules(entry = {}) {
  return entry.monster?.rules || entry.rules || {};
}

function getMonsterBlock(entry = {}) {
  return entry.monster && typeof entry.monster === "object" ? entry.monster : {};
}

function getMonsterSlot(entry = {}) {
  return normalizeString(getMonsterBlock(entry).slot || entry.slot || asArray(entry.slots)[0] || "unassigned");
}

function getActionEconomy(entry = {}) {
  const rules = getRules(entry);
  const section = normalizeString(getMonsterBlock(entry).section || entry.section || rules.section || "trait");
  const economy = normalizeString(rules.actionEconomy || rules.action || rules.type);
  if (economy) return economy;
  if (section === "bonusAction") return "bonusAction";
  if (section === "reaction") return "reaction";
  if (section === "legendaryAction") return "legendaryAction";
  if (section === "lairAction") return "lairAction";
  if (section === "deathEffect") return "deathEffect";
  if (section === "action") return "action";
  return section === "trait" ? "passive" : section || "passive";
}

function getResolutionType(entry = {}) {
  const resolution = getRules(entry).resolution;
  return normalizeString(resolution?.type || "none");
}

function getDamageTypes(entry = {}) {
  const damage = getRules(entry).damage || {};
  return unique([
    ...asArray(damage.types),
    ...asArray(damage.parts).flatMap((part) => asArray(part?.types || part?.type)),
    ...asArray(entry.damageTypes),
  ]);
}

function getConditions(entry = {}) {
  const condition = getRules(entry).condition || {};
  return unique([
    ...asArray(condition.names),
    ...asArray(condition.special),
    ...asArray(getRules(entry).conditions),
    ...asArray(entry.conditions),
  ]);
}

function getMonsterFamilies(entry = {}) {
  const constraints = getMonsterBlock(entry).constraints || entry.constraints || entry.anatomyConstraints || {};
  return unique([
    ...asArray(constraints.allowedFamilies),
    ...asArray(constraints.recommendedFamilies),
    ...asArray(constraints.exclusiveToFamilies),
    ...asArray(constraints.familyBias),
  ]);
}

function getMonsterRoles(entry = {}) {
  const fit = getMonsterBlock(entry).fit || entry.fit || entry.frameFit || {};
  return unique([
    ...asArray(getMonsterBlock(entry).roleBias),
    ...asArray(entry.roleBias),
    ...asArray(fit.encounterRoles?.allowed),
    ...asArray(fit.encounterRoles?.recommended),
  ]);
}

function getMonsterTypes(entry = {}) {
  const fit = getMonsterBlock(entry).fit || entry.fit || entry.frameFit || {};
  return unique([
    ...asArray(getMonsterBlock(entry).typeBias),
    ...asArray(entry.typeBias),
    ...asArray(fit.creatureTypes?.allowed),
    ...asArray(fit.creatureTypes?.recommended),
  ]);
}

function getLocationRegion(entry = {}) {
  return entry.locationRegion || entry.map || entry.location || {};
}

function getLocationOutputSection(entry = {}) {
  return normalizeString(entry.location?.outputSection || entry.outputSection || entry.type || asArray(entry.slots)[0] || "unassigned");
}

function unique(values = []) {
  return [...new Set(asArray(values).map(normalizeString).filter(Boolean))];
}

function collectComponents(registryData = {}, modules = [], nativeMonsterGrafts = []) {
  const moduleComponents = asArray(modules)
    .map(normalizeModuleForDraft)
    .flatMap((module) => asArray(module.components).map((component) => ({
      ...component,
      __origin: "studio-module",
      __moduleId: module.id,
      __moduleTitle: module.title,
    })));

  const nativeGrafts = asArray(nativeMonsterGrafts).map((graft) => ({
    ...graft,
    contentType: graft.contentType || "monster-graft",
    __origin: "native-monster-graft",
  }));

  return [
    ...asArray(registryData.components).map((component) => ({ ...component, __origin: "static-registry" })),
    ...moduleComponents,
    ...nativeGrafts,
  ];
}

function countBuckets(items = [], getter, knownOrder = []) {
  const buckets = new Map();
  knownOrder.forEach((id) => buckets.set(id, { id, label: formatLabel(id), count: 0, ids: [] }));

  asArray(items).forEach((item) => {
    const values = asArray(typeof getter === "function" ? getter(item) : item?.[getter]);
    const bucketValues = values.length ? values : ["unassigned"];
    bucketValues.forEach((value) => {
      const id = normalizeString(value) || "unassigned";
      const current = buckets.get(id) || { id, label: formatLabel(id), count: 0, ids: [] };
      current.count += 1;
      const idValue = entryId(item);
      if (idValue && !current.ids.includes(idValue)) current.ids.push(idValue);
      buckets.set(id, current);
    });
  });

  return [...buckets.values()].sort((a, b) => {
    const aIndex = knownOrder.indexOf(a.id);
    const bIndex = knownOrder.indexOf(b.id);
    if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    return b.count - a.count || a.label.localeCompare(b.label);
  });
}

function buildMatrix(items = [], rowGetter, columnGetter, rowOrder = [], columnOrder = []) {
  const rows = countBuckets(items, rowGetter, rowOrder).filter((row) => row.id !== "unassigned");
  const columns = countBuckets(items, columnGetter, columnOrder);
  return rows.map((row) => ({
    ...row,
    columns: columns.map((column) => ({
      ...column,
      count: asArray(items).filter((item) => asArray(rowGetter(item)).includes(row.id) && asArray(columnGetter(item)).includes(column.id)).length,
    })),
  }));
}

function getWeakBuckets(buckets = [], { threshold = 2, ignore = ["unassigned"] } = {}) {
  return asArray(buckets).filter((bucket) => !ignore.includes(bucket.id) && bucket.count < threshold);
}

function buildCoverageGaps(report = {}) {
  const gaps = [];
  asArray(report.semantic?.rows).forEach((row) => {
    Object.entries(row.semanticTypes || {}).forEach(
      ([semanticType, coverage]) => {
        if (!coverage.required || coverage.status === "covered") return;
        const label = formatLabel(semanticType);
        gaps.push({
          id: `semantic-${row.moduleId}-${semanticType}`,
          severity: coverage.status === "missing" ? "error" : "warning",
          area: "Semantic",
          title: `${row.title}: ${label} is ${coverage.status}`,
          detail: `${coverage.authored}/${coverage.count} authored components; complete the linked semantic editor coverage.`,
        });
      },
    );
  });
  getWeakBuckets(report.monster.bySlot, { threshold: 4 })
    .slice(0, 6)
    .forEach((bucket) => {
      gaps.push({
        id: `monster-slot-${bucket.id}`,
        severity: bucket.count === 0 ? "error" : "warning",
        area: "Monster",
        title: `${bucket.label} monster slot is undercovered`,
        detail: `${bucket.count} entries. Add at least four to keep generated monsters varied.`,
      });
    });
  getWeakBuckets(report.monster.byActionEconomy, { threshold: 1 })
    .slice(0, 4)
    .forEach((bucket) => {
      gaps.push({
        id: `monster-action-${bucket.id}`,
        severity: "warning",
        area: "Monster",
        title: `${bucket.label} action economy is missing`,
        detail: "No monster graft currently supports this action economy.",
      });
    });
  getWeakBuckets(report.location.bySlot, { threshold: 3 })
    .slice(0, 6)
    .forEach((bucket) => {
      gaps.push({
        id: `location-slot-${bucket.id}`,
        severity: bucket.count === 0 ? "error" : "warning",
        area: "Location",
        title: `${bucket.label} location slot is undercovered`,
        detail: `${bucket.count} entries. Add more content to keep Darken a Location outputs varied.`,
      });
    });
  getWeakBuckets(report.location.byRegionRole, { threshold: 2 })
    .slice(0, 4)
    .forEach((bucket) => {
      gaps.push({
        id: `region-role-${bucket.id}`,
        severity: "info",
        area: "Map",
        title: `${bucket.label} region role has low coverage`,
        detail:
          "Add more Location Region templates if this role should appear often in generated maps.",
      });
    });
  return gaps.slice(0, 30);
}

export function buildContentCoverageReport({
  registryData = STATIC_CONTENT_REGISTRY_DATA,
  modules = [],
  nativeMonsterGrafts = [],
} = {}) {
  const components = collectComponents(
    registryData,
    modules,
    nativeMonsterGrafts,
  );
  const monsterComponents = components.filter(
    (component) =>
      component.contentType === "monster-graft" ||
      component.monster ||
      component.slot,
  );
  const locationComponents = components.filter(
    (component) =>
      component.contentType === "location-component" ||
      component.contentType === "location-region" ||
      component.location ||
      component.locationRegion ||
      component.map ||
      isStudioSpecializedSemanticType(component.semanticType),
  );
  const monsterSlotOrder = SHARED_MONSTER_SLOTS.map((slot) => slot.id);
  const locationSlotOrder = SHARED_DARKEN_LOCATION_SLOTS.map((slot) => slot.id);
  const actionOrder = [
    "passive",
    "freeTrigger",
    "action",
    "bonusAction",
    "reaction",
    "legendaryAction",
    "lairAction",
    "deathEffect",
  ];
  const resolutionOrder = [
    "attackRoll",
    "savingThrow",
    "automatic",
    "contest",
    "choice",
    "none",
  ];
  const semanticDefinitions = listStudioSemanticEditorDefinitions();
  const semanticRows = buildStudioSemanticCoverageMatrix(modules);

  const report = {
    reportType: "cruor-studio-content-coverage-report",
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    summary: {
      components: components.length,
      monsterComponents: monsterComponents.length,
      locationComponents: locationComponents.length,
      moduleCount: asArray(modules).length,
      semanticModules: semanticRows.length,
      semanticGaps: semanticRows.reduce(
        (total, row) => total + row.summary.missing + row.summary.partial,
        0,
      ),
    },
    monster: {
      bySlot: countBuckets(monsterComponents, getMonsterSlot, monsterSlotOrder),
      byActionEconomy: countBuckets(monsterComponents, getActionEconomy, actionOrder),
      byResolution: countBuckets(monsterComponents, getResolutionType, resolutionOrder),
      byDamageType: countBuckets(monsterComponents, getDamageTypes),
      byCondition: countBuckets(monsterComponents, getConditions),
      bySourceAnchor: countBuckets(monsterComponents, "sourceAnchors"),
      byCreatureType: countBuckets(monsterComponents, getMonsterTypes),
      byFamily: countBuckets(monsterComponents, getMonsterFamilies),
      byRole: countBuckets(monsterComponents, getMonsterRoles),
      slotByActionMatrix: buildMatrix(monsterComponents, (item) => [getMonsterSlot(item)], (item) => [getActionEconomy(item)], monsterSlotOrder, actionOrder),
    },
    location: {
      bySlot: countBuckets(locationComponents, "slots", locationSlotOrder),
      byOutputSection: countBuckets(locationComponents, getLocationOutputSection),
      byRegionRole: countBuckets(locationComponents.filter((item) => item.contentType === "location-region" || item.locationRegion || item.map), (item) => getLocationRegion(item).role || "unassigned"),
      byRegionSize: countBuckets(locationComponents.filter((item) => item.contentType === "location-region" || item.locationRegion || item.map), (item) => getLocationRegion(item).size || "unassigned"),
      bySourceAnchor: countBuckets(locationComponents, "sourceAnchors"),
      slotBySourceMatrix: buildMatrix(locationComponents, (item) => asArray(item.slots), (item) => asArray(item.sourceAnchors), locationSlotOrder),
    },
    semantic: {
      columns: semanticDefinitions.map((definition) => ({
        id: definition.semanticType,
        label: definition.label,
        icon: definition.icon,
      })),
      rows: semanticRows,
      byType: countBuckets(
        locationComponents.filter((component) =>
          isStudioSpecializedSemanticType(component.semanticType),
        ),
        "semanticType",
        semanticDefinitions.map((definition) => definition.semanticType),
      ),
      byCapability: countBuckets(
        asArray(modules).map(normalizeModuleForDraft),
        "capabilities",
        ["inspiration-archive", "dark-places", "monster-composer"],
      ),
    },
  };

  report.gaps = buildCoverageGaps(report);
  return report;
}

export function getCoverageTopBuckets(rows = [], limit = 8) {
  return [...asArray(rows)].filter((row) => row.count > 0).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, limit);
}
