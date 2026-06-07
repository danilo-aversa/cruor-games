const SUPPORTED_MAP_TYPES = new Set([
  "Crypt",
  "Chapel",
  "Cave",
  "Mine",
  "Noble House",
  "Ruins",
]);
const SUPPORTED_REGION_SIZES = new Set(["Small", "Medium", "Large"]);

function normalizeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeConnectors(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(0, Math.round(parsed));
}

function normalizeSize(value) {
  const text = normalizeText(value);
  return SUPPORTED_REGION_SIZES.has(text) ? text : undefined;
}

function normalizeSlotAssignments(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).map(([slotId, assignments]) => [
      slotId,
      normalizeArray(assignments)
        .filter((assignment) => assignment && typeof assignment === "object")
        .map((assignment) => ({
          componentId: normalizeText(assignment.componentId),
          slotId: normalizeText(assignment.slotId, slotId),
          regionId: normalizeText(assignment.regionId),
        }))
        .filter((assignment) => assignment.componentId),
    ]),
  );
}

function createComponentIndex(components = []) {
  return new Map(
    normalizeArray(components)
      .filter((component) => component && typeof component === "object")
      .map((component) => [normalizeText(component.id), component])
      .filter(([id]) => Boolean(id)),
  );
}

function normalizeAssignedComponents(slotAssignments, selectedComponents = []) {
  const componentIndex = createComponentIndex(selectedComponents);
  const assignedComponents = Object.entries(slotAssignments)
    .flatMap(([slotId, assignments]) =>
      normalizeArray(assignments).map((assignment) => {
        const component = componentIndex.get(assignment.componentId) || {};
        return {
          id: normalizeText(assignment.componentId || component.id),
          title: normalizeText(component.title),
          type: normalizeText(component.type),
          summary: normalizeText(component.summary),
          slotId: normalizeText(assignment.slotId, slotId),
          regionId: normalizeText(assignment.regionId),
        };
      }),
    )
    .filter((component) => component.id || component.title || component.slotId);

  if (assignedComponents.length) return assignedComponents;

  return normalizeArray(selectedComponents)
    .map((component) => ({
      id: normalizeText(component?.id),
      title: normalizeText(component?.title),
      type: normalizeText(component?.type),
      summary: normalizeText(component?.summary),
      slotId: normalizeText(component?.slotId),
      regionId: normalizeText(component?.regionId),
    }))
    .filter((component) => component.id || component.title || component.slotId);
}

function getAssignedComponentsForRegion(regionId, assignedComponents) {
  return normalizeArray(assignedComponents).filter(
    (component) => component.regionId && component.regionId === regionId,
  );
}

export function mapDarkenLocationContextToMapType(context) {
  const text = String(context || "").toLowerCase();
  if (text.includes("cave") || text.includes("cavern")) return "Cave";
  if (text.includes("mine")) return "Mine";
  if (text.includes("crypt") || text.includes("catacomb")) return "Crypt";
  if (
    text.includes("chapel") ||
    text.includes("temple") ||
    text.includes("shrine")
  )
    return "Chapel";
  if (text.includes("ruin")) return "Ruins";
  if (
    text.includes("noble") ||
    text.includes("house") ||
    text.includes("manor")
  )
    return "Noble House";
  return "Crypt";
}

function createStableSeed(snapshot, requiredRegions) {
  const parts = [
    snapshot?.title,
    snapshot?.context,
    normalizeArray(snapshot?.sourceAnchors).join("|"),
    requiredRegions
      .map((region) => region.sourceRegionId || region.id || region.label)
      .join("|"),
  ].filter(Boolean);
  return `darken-${
    parts
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 72) || "location"
  }`;
}

function normalizeRequiredRegion(region, index, assignedComponents = []) {
  if (!region || typeof region !== "object") return null;
  const sourceRegionId = normalizeText(
    region.id,
    `location-region-${index + 1}`,
  );
  const label = normalizeText(
    region.name || region.label,
    `Location Region ${index + 1}`,
  );
  const shape = normalizeText(region.shape);
  const size = normalizeSize(region.size);
  const connectors = normalizeConnectors(region.connectors);
  const links = normalizeArray(region.links).map((link) => String(link));
  const contexts = normalizeArray(region.contexts).map((context) =>
    String(context),
  );
  const sourceAnchors = normalizeArray(region.sourceAnchors).map((anchor) =>
    String(anchor),
  );
  const horror = normalizeArray(region.horror).map((item) => String(item));
  const regionComponents = getAssignedComponentsForRegion(sourceRegionId, assignedComponents);

  return {
    id: `map-region-${index + 1}`,
    label,
    role: normalizeText(region.role, "Location Region"),
    ...(size ? { size } : {}),
    ...(shape ? { shape } : {}),
    ...(Number.isFinite(connectors) ? { connectors } : {}),
    density: normalizeText(region.density),
    links,
    sourceRegionId,
    metadata: {
      templateId: normalizeText(region.templateId),
      contexts,
      horror,
      sourceAnchors,
      feature: normalizeText(region.feature),
      interaction: normalizeText(region.interaction),
      interact: normalizeText(region.interact),
      danger: normalizeText(region.danger),
      secret: normalizeText(region.secret),
      reward: normalizeText(region.reward),
      read: normalizeText(region.read),
      readAloud:
        region.readAloud && typeof region.readAloud === "object"
          ? { ...region.readAloud }
          : region.readAloud || "",
      assignedComponents: regionComponents,
      assignedSlotIds: Array.from(
        new Set(regionComponents.map((component) => component.slotId).filter(Boolean)),
      ),
    },
  };
}

export function createMapRequestFromDarkenLocationState(crucibleSnapshot = {}) {
  const workflow = normalizeText(crucibleSnapshot.workflow, "darken-location");
  const context = normalizeText(crucibleSnapshot.context, "Crypt");
  const mapType = mapDarkenLocationContextToMapType(context);
  const slotAssignments = normalizeSlotAssignments(crucibleSnapshot.slotAssignments);
  const assignedComponents = normalizeAssignedComponents(
    slotAssignments,
    crucibleSnapshot.selectedComponents,
  );
  const requiredRegions = normalizeArray(crucibleSnapshot.locationRegions)
    .map((region, index) => normalizeRequiredRegion(region, index, assignedComponents))
    .filter(Boolean);
  const safeMapType = SUPPORTED_MAP_TYPES.has(mapType) ? mapType : "Crypt";

  return {
    source: "darken-location",
    workflow,
    title: normalizeText(crucibleSnapshot.title, "Cursed Location Build"),
    seed:
      normalizeText(crucibleSnapshot.seed) ||
      createStableSeed(crucibleSnapshot, requiredRegions),
    context,
    mapType: safeMapType,
    roomCount: requiredRegions.length || undefined,
    requiredRegions,
    metadata: {
      horror: normalizeArray(crucibleSnapshot.horrors).map((horror) =>
        String(horror),
      ),
      sourceAnchors: normalizeArray(crucibleSnapshot.sourceAnchors).map(
        (anchor) => String(anchor),
      ),
      intrusion: normalizeText(crucibleSnapshot.intrusion),
      activeSlot: normalizeText(crucibleSnapshot.activeSlot),
      activeRegionId: normalizeText(crucibleSnapshot.activeRegionId),
      slotAssignments,
      selectedComponents: assignedComponents,
      regionComponentLinks: assignedComponents
        .filter((component) => component.regionId)
        .map((component) => ({
          regionId: component.regionId,
          slotId: component.slotId,
          componentId: component.id,
          title: component.title,
        })),
    },
  };
}
