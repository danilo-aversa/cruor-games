import {
  DEFAULT_LOCALE,
  getLocalizedField,
  hasLocalizedContent,
  normalizeLocale,
  resolveLocalizedContentEntry,
  resolveLocalizedContentList,
} from "../i18n/index.js";

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
    locale: normalizeLocale(entry?.locale || defaults.locale || DEFAULT_LOCALE),
    i18n: entry?.i18n || entry?.translations || defaults.i18n || defaults.translations || {},
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

function matchesLocale(entry, accepted) {
  const acceptedValues = normalizeStringArray(accepted).map(normalizeLocale);
  if (!acceptedValues.length) return true;

  const entryLocale = normalizeLocale(entry.locale || DEFAULT_LOCALE);
  if (acceptedValues.includes(entryLocale)) return true;

  return acceptedValues.some(
    (locale) => hasLocalizedContent(entry, locale) || (entryLocale === DEFAULT_LOCALE && locale !== DEFAULT_LOCALE),
  );
}

function getTranslationSearchText(entry) {
  return Object.values(entry.i18n || {})
    .flatMap((translation) => [
      translation?.title,
      translation?.uiTitle,
      translation?.label,
      translation?.summary,
      translation?.caption,
      translation?.description,
      translation?.tableText,
      translation?.mechanics,
      translation?.narrative,
    ])
    .filter(Boolean);
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
    ...getTranslationSearchText(entry),
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
    matchesLocale(entry, filter.locale) &&
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
      normalizeStringArray(entry.sourceAnchors).map((sourceAnchorId) => ({ entry, sourceAnchorId })),
    )
    .filter(({ sourceAnchorId }) => !knownSourceAnchors.has(sourceAnchorId))
    .map(({ entry, sourceAnchorId }) => ({
      severity: "warning",
      collection: collectionName,
      id: entry.id,
      message: `Unknown Source Anchor: ${sourceAnchorId}`,
    }));
}

function localizeEntry(entry, locale) {
  if (!entry || !locale) return entry || null;
  return resolveLocalizedContentEntry(entry, locale);
}

function localizeEntries(entries, locale) {
  if (!locale) return entries;
  return resolveLocalizedContentList(entries, locale);
}

function getFilterLocale(filter = {}) {
  return filter.locale ? normalizeLocale(filter.locale) : null;
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
    getWorkflow: (id, locale) => localizeEntry(registry.workflowById.get(id), locale),
    getSlot: (id, locale) => localizeEntry(registry.slotById.get(id), locale),
    getComponent: (id, locale) => localizeEntry(registry.componentById.get(id), locale),
    getSourceAnchor: (id, locale) => localizeEntry(registry.sourceAnchorById.get(id), locale),
    getInspiration: (id, locale) => localizeEntry(registry.inspirationById.get(id), locale),
    getTaxonomy: (id, locale) => localizeEntry(registry.taxonomyById.get(id), locale),
    getLocalizedField: (entry, field, locale, options) => getLocalizedField(entry, field, locale, options),
    getComponents: (filter = {}) =>
      localizeEntries(registry.components.filter((entry) => matchesContentFilter(entry, filter)), getFilterLocale(filter)),
    getInspirations: (filter = {}) =>
      localizeEntries(registry.inspirations.filter((entry) => matchesContentFilter(entry, filter)), getFilterLocale(filter)),
    getSourceAnchors: (filter = {}) =>
      localizeEntries(registry.sourceAnchors.filter((entry) => matchesContentFilter(entry, filter)), getFilterLocale(filter)),
    getLinkedComponents: (sourceAnchorId, filter = {}) =>
      localizeEntries(
        registry.components.filter(
          (entry) =>
            normalizeStringArray(entry.sourceAnchors).includes(sourceAnchorId) &&
            matchesContentFilter(entry, filter),
        ),
        getFilterLocale(filter),
      ),
    getLinkedInspirations: (sourceAnchorId, filter = {}) =>
      localizeEntries(
        registry.inspirations.filter(
          (entry) =>
            normalizeStringArray(entry.sourceAnchors).includes(sourceAnchorId) &&
            matchesContentFilter(entry, filter),
        ),
        getFilterLocale(filter),
      ),
    localize: (locale) =>
      createContentRegistry(
        Object.fromEntries(
          REGISTRY_COLLECTIONS.map((collectionName) => [
            collectionName,
            localizeEntries(registry[collectionName] || [], locale),
          ]),
        ),
      ),
    summarize: () => summarizeContentRegistry(registry),
    validate: () => validateContentRegistry(registry),
  });
}

export function summarizeContentRegistry(registry) {
  return Object.fromEntries(
    REGISTRY_COLLECTIONS.map((collectionName) => [collectionName, registry[collectionName]?.length || 0]),
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
      REGISTRY_COLLECTIONS.map((collectionName) => [collectionName, asArray(data[collectionName])]),
    ),
  );
}
