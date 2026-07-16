import {
  rankLocationCompilerChoices,
  scoreLocationCompilerChoice,
} from "./location-compiler-rng.js";

const SENSES = Object.freeze([
  "sight",
  "sound",
  "smell",
  "touch",
  "taste",
  "temperature",
  "proprioception",
]);

const ROLE_BIAS_MAP = Object.freeze({
  entrance: "entrance",
  threshold: "threshold",
  connector: "connector",
  clue: "threshold",
  ritual: "ritual",
  secret: "secret",
  climax: "climax",
  final: "climax",
});

const ROLE_INTENSITY = Object.freeze({
  entrance: "low",
  threshold: "medium",
  connector: "low",
  clue: "medium",
  ritual: "medium",
  secret: "high",
  climax: "high",
  final: "high",
});

const GEOMETRY_BIAS_MAP = Object.freeze({
  circle: "circular",
  circular: "circular",
  rotunda: "circular",
  corridor: "narrow",
  narrow: "narrow",
  passage: "narrow",
  gallery: "large",
  hall: "large",
  large: "large",
  vertical: "vertical",
  shaft: "vertical",
  stair: "vertical",
  stairs: "vertical",
  ruined: "ruined",
  ruin: "ruined",
});

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
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueStrings(values = []) {
  return [...new Set(values.map(cleanText).filter(Boolean))].sort();
}

function isEditoriallyAuthored(component = {}) {
  return component.provenance?.migration?.method !== "compatibility-normalized";
}

function getRoomRole(room = {}) {
  return normalizeToken(room.role);
}

function getRoleBias(room = {}) {
  const role = getRoomRole(room);
  return ROLE_BIAS_MAP[role] || role;
}

function getGeometryBias(room = {}) {
  const candidates = [room.shape, room.role, room.name]
    .map(normalizeToken)
    .filter(Boolean);
  for (const candidate of candidates) {
    const direct = GEOMETRY_BIAS_MAP[candidate];
    if (direct) return direct;
    const matchingKey = Object.keys(GEOMETRY_BIAS_MAP).find((key) =>
      candidate.includes(key),
    );
    if (matchingKey) return GEOMETRY_BIAS_MAP[matchingKey];
  }
  return "";
}

function buildAdjacency(rooms = []) {
  const roomIds = new Set(rooms.map((room) => room.id));
  const adjacency = new Map(rooms.map((room) => [room.id, new Set()]));
  rooms.forEach((room) => {
    (room.connections || []).forEach((connection) => {
      const otherId =
        connection.fromRoomId === room.id
          ? connection.toRoomId
          : connection.fromRoomId;
      if (!roomIds.has(otherId) || otherId === room.id) return;
      adjacency.get(room.id).add(otherId);
      adjacency.get(otherId).add(room.id);
    });
  });
  return adjacency;
}

function getRouteDepths(rooms = [], adjacency = new Map()) {
  const entrance =
    rooms.find((room) => getRoomRole(room) === "entrance") || rooms[0];
  const depths = new Map(
    rooms.map((room) => [room.id, Number.MAX_SAFE_INTEGER]),
  );
  if (!entrance) return depths;
  depths.set(entrance.id, 0);
  const queue = [entrance.id];
  while (queue.length) {
    const roomId = queue.shift();
    const depth = depths.get(roomId);
    [...(adjacency.get(roomId) || [])].sort().forEach((neighborId) => {
      if (depths.get(neighborId) <= depth + 1) return;
      depths.set(neighborId, depth + 1);
      queue.push(neighborId);
    });
  }
  return depths;
}

function increaseIntensity(intensity) {
  if (intensity === "low") return "medium";
  return "high";
}

export function resolveRoomSensoryIntensity(room = {}, routeDepth = 0) {
  const role = getRoomRole(room);
  let intensity = ROLE_INTENSITY[role] || "medium";
  if (Number(routeDepth) >= 3 || Math.abs(Number(room.level || 0)) >= 1) {
    intensity = increaseIntensity(intensity);
  }
  return intensity;
}

function createVariantCandidates(components = []) {
  return components.flatMap((component) =>
    SENSES.flatMap((sense) =>
      (component.semantic?.variants?.[sense] || []).map((text, index) => ({
        id: `${component.id}-${sense}-${index + 1}`,
        text: cleanText(text),
        sense,
        sourceComponentId: component.id,
        sourceAnchorIds: [...(component.sourceAnchors || [])],
        provenance: component.semantic?.provenance || component.provenance,
      })),
    ),
  );
}

function getContextualCandidates(component, room, intensity) {
  const semantic = component.semantic || {};
  const roleBias = getRoleBias(room);
  const geometryBias = getGeometryBias(room);
  return [
    ...(semantic.geometryBias?.[geometryBias] || []).map((text, index) => ({
      id: `${component.id}-geometry-${geometryBias}-${index + 1}`,
      text,
      kind: "geometry",
      match: geometryBias,
      weight: 3,
    })),
    ...(semantic.roomRoleBias?.[roleBias] || []).map((text, index) => ({
      id: `${component.id}-role-${roleBias}-${index + 1}`,
      text,
      kind: "role",
      match: roleBias,
      weight: 2,
    })),
    ...(semantic.intensityTiers?.[intensity] || []).map((text, index) => ({
      id: `${component.id}-intensity-${intensity}-${index + 1}`,
      text,
      kind: "intensity",
      match: intensity,
      weight: 1,
    })),
  ].map((candidate) => ({
    ...candidate,
    sourceComponentId: component.id,
    sourceAnchorIds: [...(component.sourceAnchors || [])],
    provenance: component.semantic?.provenance || component.provenance,
  }));
}

function stripRoomNumber(value) {
  return cleanText(value).replace(/^\d+\s+/, "");
}

function lowerFirst(value) {
  const text = cleanText(value);
  return text ? `${text[0].toLowerCase()}${text.slice(1)}` : "";
}

function ensureSentence(value) {
  const text = cleanText(value);
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function contextualizeText(text, room) {
  const roomName = stripRoomNumber(room.name) || "room";
  const clause = lowerFirst(cleanText(text).replace(/[.!?]+$/, ""));
  return ensureSentence(`In the ${roomName}, ${clause}`);
}

function createImpressionBlock(
  candidate,
  room,
  intensity,
  index,
  metadata = {},
) {
  const text = ensureSentence(candidate.text);
  return {
    id: `sensory-${room.id}-${index + 1}-${candidate.id}`,
    kind: "sensory",
    subtype: candidate.sense || metadata.contextKind || "contextual",
    title: candidate.sense
      ? `${candidate.sense[0].toUpperCase()}${candidate.sense.slice(1)}`
      : "Room Signal",
    text,
    summary: text,
    audience: "both",
    facets: [
      {
        id: "impression",
        audience: "both",
        text,
        entries: [],
        items: [],
      },
    ],
    sourceComponentId: candidate.sourceComponentId,
    sourceAnchorIds: [...candidate.sourceAnchorIds],
    mechanics: null,
    counterplay: "",
    narrative: "",
    provenance: candidate.provenance,
    metadata: {
      compilerStage: "allocate-sensory-impressions",
      sourceFragmentId: candidate.id,
      sense: candidate.sense || "",
      intensity,
      routeDepth: metadata.routeDepth,
      contextKind: metadata.contextKind || "",
      contextMatch: metadata.contextMatch || "",
    },
  };
}

function pickContextualCandidate(components, room, intensity, seed) {
  const candidates = components.flatMap((component) =>
    getContextualCandidates(component, room, intensity),
  );
  return [...candidates].sort((left, right) => {
    const weightDelta = right.weight - left.weight;
    if (weightDelta) return weightDelta;
    const scoreDelta =
      scoreLocationCompilerChoice(seed, "sensory-context", room.id, right.id) -
      scoreLocationCompilerChoice(seed, "sensory-context", room.id, left.id);
    return scoreDelta || left.id.localeCompare(right.id);
  })[0];
}

function createGeometryFallback(room, component, intensity) {
  const shape = (cleanText(room.shape) || "enclosed").toLowerCase();
  const roomName = stripRoomNumber(room.name) || "room";
  return {
    id: `${component.id}-fallback-${room.id}`,
    text: `The ${shape} geometry of the ${roomName} makes every small sound return from a different distance.`,
    sense: "sound",
    sourceComponentId: component.id,
    sourceAnchorIds: [...(component.sourceAnchors || [])],
    provenance: component.semantic?.provenance || component.provenance,
    intensity,
  };
}

function selectVariantCandidates({
  available,
  room,
  seed,
  adjacentDominantSenses,
  count,
}) {
  const selected = [];
  for (let slot = 0; slot < count; slot += 1) {
    const ranked = [...available].sort((left, right) => {
      const leftPenalty =
        (selected.some((candidate) => candidate.sense === left.sense) ? 2 : 0) +
        (slot === 0 && adjacentDominantSenses.has(left.sense) ? 1 : 0);
      const rightPenalty =
        (selected.some((candidate) => candidate.sense === right.sense)
          ? 2
          : 0) +
        (slot === 0 && adjacentDominantSenses.has(right.sense) ? 1 : 0);
      if (leftPenalty !== rightPenalty) return leftPenalty - rightPenalty;
      const scoreDelta =
        scoreLocationCompilerChoice(
          seed,
          "sensory-variant",
          room.id,
          slot,
          right.id,
        ) -
        scoreLocationCompilerChoice(
          seed,
          "sensory-variant",
          room.id,
          slot,
          left.id,
        );
      return scoreDelta || left.id.localeCompare(right.id);
    });
    const candidate = ranked[0];
    if (!candidate) break;
    selected.push(candidate);
    available.splice(
      available.findIndex((entry) => entry.id === candidate.id),
      1,
    );
  }
  return selected;
}

export function allocateSensoryImpressions({
  rooms = [],
  components = [],
  seed = "",
  impressionsPerRoom = 3,
} = {}) {
  const authoredComponents = [...components]
    .filter(isEditoriallyAuthored)
    .sort((left, right) => left.id.localeCompare(right.id));
  if (!authoredComponents.length) {
    return deepFreeze({
      rooms: [...rooms],
      diagnostics: [],
      allocations: {},
    });
  }

  const sortedRooms = [...rooms].sort(
    (left, right) =>
      Number(left.number || 0) - Number(right.number || 0) ||
      left.id.localeCompare(right.id),
  );
  const adjacency = buildAdjacency(sortedRooms);
  const routeDepths = getRouteDepths(sortedRooms, adjacency);
  const allocatedByRoom = new Map();
  const dominantSenseByRoom = new Map();
  const diagnostics = [];
  const available = rankLocationCompilerChoices(
    createVariantCandidates(authoredComponents),
    { seed, scope: "sensory-pool", getId: (candidate) => candidate.id },
  );

  sortedRooms.forEach((room) => {
    const routeDepth = routeDepths.get(room.id);
    const resolvedDepth =
      Number.isFinite(routeDepth) && routeDepth < Number.MAX_SAFE_INTEGER
        ? routeDepth
        : 0;
    const intensity = resolveRoomSensoryIntensity(room, resolvedDepth);
    const adjacentDominantSenses = new Set(
      [...(adjacency.get(room.id) || [])]
        .map((roomId) => dominantSenseByRoom.get(roomId))
        .filter(Boolean),
    );
    const baseCount = Math.min(2, Math.max(1, impressionsPerRoom));
    const selected = selectVariantCandidates({
      available,
      room,
      seed,
      adjacentDominantSenses,
      count: baseCount,
    });
    while (selected.length < baseCount) {
      selected.push(
        createGeometryFallback(
          room,
          authoredComponents[selected.length % authoredComponents.length],
          intensity,
        ),
      );
      diagnostics.push({
        code: "sensory-allocation.pool-exhausted",
        severity: "warning",
        path: `rooms.${room.id}.immediateImpressions`,
        message: `Unique authored sensory variants were exhausted for ${room.name}; a room-specific geometry fallback was used.`,
      });
    }
    dominantSenseByRoom.set(room.id, selected[0]?.sense || "");

    const blocks = selected.map((candidate, index) =>
      createImpressionBlock(candidate, room, intensity, index, {
        routeDepth: resolvedDepth,
      }),
    );
    if (impressionsPerRoom >= 3) {
      const contextual = pickContextualCandidate(
        authoredComponents,
        room,
        intensity,
        seed,
      );
      if (contextual) {
        blocks.push(
          createImpressionBlock(
            {
              ...contextual,
              text: contextualizeText(contextual.text, room),
            },
            room,
            intensity,
            blocks.length,
            {
              routeDepth: resolvedDepth,
              contextKind: contextual.kind,
              contextMatch: contextual.match,
            },
          ),
        );
      }
    }
    allocatedByRoom.set(room.id, blocks);
  });

  const exactTexts = new Map();
  [...allocatedByRoom.entries()].forEach(([roomId, blocks]) => {
    blocks.forEach((block) => {
      const key = cleanText(block.text).toLowerCase();
      if (!exactTexts.has(key)) exactTexts.set(key, []);
      exactTexts.get(key).push(roomId);
    });
  });
  [...exactTexts.entries()]
    .filter(([, roomIds]) => new Set(roomIds).size > 1)
    .forEach(([text, roomIds]) => {
      diagnostics.push({
        code: "sensory-allocation.exact-repeat",
        severity: "error",
        path: "rooms",
        message: `Immediate Impression repeats across ${uniqueStrings(roomIds).join(", ")}: ${text}`,
      });
    });

  const compiledRooms = sortedRooms.map((room) => {
    const immediateImpressions = allocatedByRoom.get(room.id) || [];
    return {
      ...room,
      immediateImpressions,
      sourceComponentIds: uniqueStrings([
        ...(room.sourceComponentIds || []),
        ...immediateImpressions.map((block) => block.sourceComponentId),
      ]),
    };
  });

  return deepFreeze({
    rooms: compiledRooms,
    diagnostics,
    allocations: Object.fromEntries(
      compiledRooms.map((room) => [
        room.id,
        room.immediateImpressions.map((block) => ({
          id: block.id,
          sourceFragmentId: block.metadata.sourceFragmentId,
          sense: block.metadata.sense,
          intensity: block.metadata.intensity,
          contextKind: block.metadata.contextKind,
        })),
      ]),
    ),
  });
}
