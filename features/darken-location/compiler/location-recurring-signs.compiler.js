import { hashLocationCompilerKey } from "./location-compiler-rng.js";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function normalizeToken(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueStrings(values = []) {
  return [...new Set(values.map(cleanText).filter(Boolean))].sort();
}

export const hashSemanticAllocationKey = hashLocationCompilerKey;

function isEditoriallyAuthored(component = {}) {
  return component.provenance?.migration?.method !== "compatibility-normalized";
}

function isRoomAllowed(room, placement = {}) {
  const role = normalizeToken(room.role);
  const allowed = new Set(
    (placement.allowedRoomRoles || []).map(normalizeToken),
  );
  const forbidden = new Set(
    (placement.forbiddenRoomRoles || []).map(normalizeToken),
  );
  if (forbidden.has(role)) return false;
  return !allowed.size || allowed.has(role);
}

function scoreRoom(seed, component, room, allocatedCount) {
  const preferred = new Set(
    (component.semantic?.placement?.preferredFeatures || []).map(
      normalizeToken,
    ),
  );
  const roomFeatures = new Set(
    [room.role, room.shape, ...(room.sourceComponentIds || [])].map(
      normalizeToken,
    ),
  );
  const preferenceMatches = [...preferred].filter((feature) =>
    roomFeatures.has(feature),
  ).length;
  return (
    hashSemanticAllocationKey(`${seed}:${component.id}:${room.id}`) +
    preferenceMatches * 0x100000000 -
    allocatedCount * 0x20000000
  );
}

function createSummaryBlock(component) {
  const semantic = component.semantic || {};
  return {
    id: component.id,
    kind: "recurring-sign",
    subtype: component.semanticType,
    title: component.title,
    text: semantic.description,
    summary: "Recurring motif; individual variations are allocated to rooms.",
    audience: "gm",
    facets: [],
    sourceComponentId: component.id,
    sourceAnchorIds: [...component.sourceAnchors],
    mechanics: null,
    counterplay: "",
    narrative: "",
    provenance: semantic.provenance || component.provenance,
    metadata: {
      semanticType: component.semanticType,
      placement: semantic.placement,
      interaction: semantic.interaction,
      variationCount: semantic.variations?.length || 0,
      universalEffect: false,
    },
  };
}

function createRoomSignBlock(component, room, variation, placementIndex) {
  const semantic = component.semantic || {};
  return {
    id: `${component.id}-${room.id}`,
    kind: "recurring-sign",
    subtype: component.semanticType,
    title: component.title,
    text: variation || semantic.description,
    summary: semantic.description,
    audience: "gm",
    facets: [],
    sourceComponentId: component.id,
    sourceAnchorIds: [...component.sourceAnchors],
    mechanics: semantic.interaction,
    counterplay: semantic.interaction?.counterplay || "",
    narrative: "",
    provenance: semantic.provenance || component.provenance,
    metadata: {
      semanticType: component.semanticType,
      recurringSignId: semantic.id || component.id,
      placementIndex,
      revelationLink: semantic.revelationLink,
      universalEffect: false,
    },
  };
}

export function allocateRecurringSigns({
  rooms = [],
  components = [],
  seed = "",
} = {}) {
  const sortedRooms = [...rooms].sort(
    (left, right) =>
      left.number - right.number || left.id.localeCompare(right.id),
  );
  const allocationsByRoom = new Map(
    sortedRooms.map((room) => [room.id, [...(room.recurringSigns || [])]]),
  );
  const allocationCounts = new Map(sortedRooms.map((room) => [room.id, 0]));
  const diagnostics = [];
  const summaries = [];

  [...components]
    .filter(isEditoriallyAuthored)
    .sort((left, right) => left.id.localeCompare(right.id))
    .forEach((component) => {
      const semantic = component.semantic || {};
      const placement = semantic.placement || {};
      const candidates = sortedRooms.filter((room) =>
        isRoomAllowed(room, placement),
      );
      const minimum = Math.min(
        Number(placement.minimumRooms || 0),
        candidates.length,
      );
      const maximum = Math.min(
        Math.max(minimum, Number(placement.maximumRooms || minimum)),
        candidates.length,
      );
      if (candidates.length < Number(placement.minimumRooms || 0)) {
        diagnostics.push({
          code: "recurring-sign.minimum-unmet",
          severity: "error",
          path: `components.${component.id}.semantic.placement.minimumRooms`,
          message: `${component.title} requires ${placement.minimumRooms} compatible rooms but only ${candidates.length} are available.`,
        });
      }
      const range = maximum - minimum + 1;
      const placementCount = range
        ? minimum +
          (hashSemanticAllocationKey(`${seed}:${component.id}:count`) % range)
        : 0;
      const selectedRooms = candidates
        .map((room) => ({
          room,
          score: scoreRoom(
            seed,
            component,
            room,
            allocationCounts.get(room.id) || 0,
          ),
        }))
        .sort(
          (left, right) =>
            right.score - left.score ||
            left.room.number - right.room.number ||
            left.room.id.localeCompare(right.room.id),
        )
        .slice(0, placementCount)
        .map((entry) => entry.room);

      selectedRooms.forEach((room, placementIndex) => {
        const variations = semantic.variations || [];
        const variation = variations.length
          ? variations[
              hashSemanticAllocationKey(
                `${seed}:${component.id}:${room.id}:variation`,
              ) % variations.length
            ]
          : semantic.description;
        allocationsByRoom
          .get(room.id)
          .push(
            createRoomSignBlock(component, room, variation, placementIndex),
          );
        allocationCounts.set(room.id, (allocationCounts.get(room.id) || 0) + 1);
      });
      summaries.push(createSummaryBlock(component));
    });

  const compiledRooms = sortedRooms.map((room) => {
    const recurringSigns = allocationsByRoom
      .get(room.id)
      .sort((left, right) => left.id.localeCompare(right.id));
    return {
      ...room,
      recurringSigns,
      sourceComponentIds: uniqueStrings([
        ...(room.sourceComponentIds || []),
        ...recurringSigns.map((block) => block.sourceComponentId),
      ]),
    };
  });

  return deepFreeze({
    rooms: compiledRooms,
    summaries: summaries.sort((left, right) => left.id.localeCompare(right.id)),
    diagnostics,
    allocations: Object.fromEntries(
      compiledRooms.map((room) => [
        room.id,
        room.recurringSigns.map((block) => block.sourceComponentId),
      ]),
    ),
  });
}
