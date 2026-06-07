const REGISTRY_COLLECTIONS = [
  "workflows",
  "slots",
  "components",
  "sourceAnchors",
  "inspirations",
  "taxonomies",
];

const DEFAULT_STATUS = "published";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeId(value) {
  return String(value || "").trim();
}

function normalizeStringArray(value) {
  return asArray(value).map((item) => String(item).trim()).filter(Boolean);
}

function normalizeEntry(entry, defaults = {}) {
  const id = normalizeId(entry?.id || entry?.slug);
  return {
    ...defaults,
    ...entry,
    id,
    status: entry?.status || defaults.status || DEFAULT_STATUS,
    locale: entry?.locale || defaults.locale || "en",
    workflows: normalizeStringArray(entry?.workflows || defaults.workflows),
    slots: normalizeStringArray(entry?.slots || defaults.slots),
    sourceAnchors: normalizeStringArray(entry?.sourceAnchors || defaults.sourceAnchors),
    sourceTypes: normalizeStringArray(entry?.sourceTypes || defaults.sourceTypes),
    themes: normalizeStringArray(entry?.themes || defaults.themes),
    motifs: normalizeStringArray(entry?.motifs || defaults.motifs),
    contexts: normalizeStringArray(entry?.contexts || defaults.contexts),
    horror: normalizeStringArray(entry?.horror || defaults.horror),
  };
}

function normalizeSourceAnchor(entry, defaults = {}) {
  const normalized = normalizeEntry(entry, defaults);
  return {
    ...normalized,
    label: entry?.label || entry?.title || normalized.id,
    type: entry?.type || entry?.sourceType || defaults.type || "Source Anchor",
  };
}

function byId(items) {
  return new Map(items.map((item) => [item.id, item]).filter(([id]) => Boolean(id)));
}

function matchesAny(value, accepted) {
  const values = normalizeStringArray(value);
  const acceptedValues = normalizeStringArray(accepted);
  if (!acceptedValues.length) return true;
  return values.some((item) => acceptedValues.includes(item));
}

function matchesString(value, accepted) {
  const acceptedValues = normalizeStringArray(accepted);
  if (!acceptedValues.length) return true;
  return acceptedValues.includes(String(value || ""));
}

function matchesText(entry, query) {
  const text = String(query || "").trim().toLowerCase();
  if (!text) return true;
  return [
    entry.id,
    entry.title,
    entry.uiTitle,
    entry.label,
    entry.summary,
    entry.tableText,
    entry.mechanics,
    entry.narrative,
    ...normalizeStringArray(entry.sourceAnchors),
    ...normalizeStringArray(entry.themes),
    ...normalizeStringArray(entry.motifs),
  ]
    .join(" ")
    .toLowerCase()
    .includes(text);
}

function matchesContentFilter(entry, filter = {}) {
  return (
    matchesString(entry.status, filter.status) &&
    matchesString(entry.locale, filter.locale) &&
    matchesString(entry.type, filter.type) &&
    matchesString(entry.contentType, filter.contentType || filter.contentTypes) &&
    matchesAny(entry.workflows, filter.workflow || filter.workflows) &&
    matchesAny(entry.slots, filter.slot || filter.slots) &&
    matchesAny(entry.sourceAnchors, filter.sourceAnchor || filter.sourceAnchors) &&
    matchesAny(entry.sourceTypes, filter.sourceType || filter.sourceTypes) &&
    matchesAny(entry.themes, filter.theme || filter.themes) &&
    matchesAny(entry.motifs, filter.motif || filter.motifs) &&
    matchesAny(entry.contexts, filter.context || filter.contexts) &&
    matchesAny(entry.horror, filter.horror) &&
    matchesText(entry, filter.query)
  );
}

function collectDuplicateIds(items) {
  const seen = new Set();
  const duplicates = new Set();
  items.forEach((item) => {
    if (!item.id) return;
    if (seen.has(item.id)) duplicates.add(item.id);
    seen.add(item.id);
  });
  return [...duplicates];
}

function validateSourceLinks(registry, collectionName) {
  const knownSourceAnchors = registry.sourceAnchorIds;
  return registry[collectionName]
    .flatMap((entry) =>
      normalizeStringArray(entry.sourceAnchors).map((sourceAnchorId) => ({ entry, sourceAnchorId }))
    )
    .filter(({ sourceAnchorId }) => !knownSourceAnchors.has(sourceAnchorId))
    .map(({ entry, sourceAnchorId }) => ({
      severity: "warning",
      collection: collectionName,
      id: entry.id,
      message: `Unknown Source Anchor: ${sourceAnchorId}`,
    }));
}

export function createContentRegistry(data = {}) {
  const workflows = asArray(data.workflows).map((entry) => normalizeEntry(entry));
  const slots = asArray(data.slots).map((entry) => normalizeEntry(entry));
  const components = asArray(data.components).map((entry) => normalizeEntry(entry));
  const sourceAnchors = asArray(data.sourceAnchors).map((entry) => normalizeSourceAnchor(entry));
  const inspirations = asArray(data.inspirations).map((entry) => normalizeEntry(entry));
  const taxonomies = asArray(data.taxonomies).map((entry) => normalizeEntry(entry));

  const registry = {
    workflows,
    slots,
    components,
    sourceAnchors,
    inspirations,
    taxonomies,
    workflowById: byId(workflows),
    slotById: byId(slots),
    componentById: byId(components),
    sourceAnchorById: byId(sourceAnchors),
    inspirationById: byId(inspirations),
    taxonomyById: byId(taxonomies),
  };

  registry.workflowIds = new Set(registry.workflowById.keys());
  registry.slotIds = new Set(registry.slotById.keys());
  registry.componentIds = new Set(registry.componentById.keys());
  registry.sourceAnchorIds = new Set(registry.sourceAnchorById.keys());
  registry.inspirationIds = new Set(registry.inspirationById.keys());
  registry.taxonomyIds = new Set(registry.taxonomyById.keys());

  return Object.freeze({
    ...registry,
    getWorkflow: (id) => registry.workflowById.get(id) || null,
    getSlot: (id) => registry.slotById.get(id) || null,
    getComponent: (id) => registry.componentById.get(id) || null,
    getSourceAnchor: (id) => registry.sourceAnchorById.get(id) || null,
    getInspiration: (id) => registry.inspirationById.get(id) || null,
    getTaxonomy: (id) => registry.taxonomyById.get(id) || null,
    getComponents: (filter = {}) => registry.components.filter((entry) => matchesContentFilter(entry, filter)),
    getInspirations: (filter = {}) => registry.inspirations.filter((entry) => matchesContentFilter(entry, filter)),
    getSourceAnchors: (filter = {}) =>
      registry.sourceAnchors.filter((entry) => matchesContentFilter(entry, filter)),
    getLinkedComponents: (sourceAnchorId, filter = {}) =>
      registry.components.filter(
        (entry) =>
          normalizeStringArray(entry.sourceAnchors).includes(sourceAnchorId) &&
          matchesContentFilter(entry, filter)
      ),
    getLinkedInspirations: (sourceAnchorId, filter = {}) =>
      registry.inspirations.filter(
        (entry) =>
          normalizeStringArray(entry.sourceAnchors).includes(sourceAnchorId) &&
          matchesContentFilter(entry, filter)
      ),
    summarize: () => summarizeContentRegistry(registry),
    validate: () => validateContentRegistry(registry),
  });
}

export function summarizeContentRegistry(registry) {
  return Object.fromEntries(
    REGISTRY_COLLECTIONS.map((collectionName) => [collectionName, registry[collectionName]?.length || 0])
  );
}

export function validateContentRegistry(registry) {
  const issues = [];

  REGISTRY_COLLECTIONS.forEach((collectionName) => {
    collectDuplicateIds(registry[collectionName] || []).forEach((id) => {
      issues.push({
        severity: "error",
        collection: collectionName,
        id,
        message: `Duplicate id: ${id}`,
      });
    });
  });

  issues.push(...validateSourceLinks(registry, "components"));
  issues.push(...validateSourceLinks(registry, "inspirations"));

  return issues;
}

export function defineContentRegistryData(data = {}) {
  return Object.freeze(
    Object.fromEntries(
      REGISTRY_COLLECTIONS.map((collectionName) => [collectionName, asArray(data[collectionName])])
    )
  );
}
