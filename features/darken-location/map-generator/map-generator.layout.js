import { DEFAULT_CONFIG, normalizeRoomCount } from "./map-generator.input.js";
import { LEVEL_VIEW_ALL } from "./map-generator.state.js";
import {
  classifyRegion,
  getContextKey,
  getPlacementProfile,
  getPlacementRole,
  getRegionSurfaceProfile,
  getRegionText,
  getRoomArchetypeResolutionSummary,
  resolveRoomArchetype,
  roleDepth,
} from "./map-generator.profile.js";
import { getGraphAdjacency } from "./map-generator.graph.js";
import {
  applyRoomDesignSizeConstraints,
  getRoomDesignShape,
  getRoomDesignShapeOptions,
  resolveRoomDesign,
} from "./map-generator.room-design.js";

const SIZE_PRESETS = {
  Tiny: { minW: 3, maxW: 4, minH: 3, maxH: 4 },
  Small: { minW: 4, maxW: 6, minH: 3, maxH: 5 },
  Medium: { minW: 5, maxW: 8, minH: 4, maxH: 6 },
  Large: { minW: 7, maxW: 11, minH: 5, maxH: 8 },
  Huge: { minW: 10, maxW: 14, minH: 7, maxH: 10 },
};

const ROOM_SIZE_MENU_PRESETS = {
  Tiny: { w: 3, h: 3, circleD: 3 },
  Small: { w: 5, h: 4, circleD: 5 },
  Medium: { w: 7, h: 5, circleD: 7 },
  Large: { w: 9, h: 7, circleD: 9 },
  Huge: { w: 12, h: 9, circleD: 12 },
};

function hashStringToSeed(...parts) {
  const text = parts.join("::");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resolveRoomArchetypeSize(region, contextKey, rng) {
  const archetype = resolveRoomArchetype(region, contextKey);
  const sizeByPreset = archetype?.sizeByPreset;
  if (!sizeByPreset) return null;
  const presetKey = sizeByPreset[region.size] ? region.size : "Medium";
  const preset = sizeByPreset[presetKey] || sizeByPreset.Medium;
  if (!preset) return null;
  return {
    w: randomInt(rng, preset.minW, preset.maxW),
    h: randomInt(rng, preset.minH, preset.maxH),
  };
}

function getRoomShapeOptions(region, contextKey, archetype = null, roomDesign = null) {
  const resolvedArchetype = archetype || resolveRoomArchetype(region, contextKey);
  const resolvedRoomDesign = roomDesign || resolveRoomDesign(region, contextKey, { archetype: resolvedArchetype });
  const roomDesignOptions = getRoomDesignShapeOptions(resolvedRoomDesign) || {};
  if (!resolvedArchetype && !Object.keys(roomDesignOptions).length) return region.shapeOptions || null;
  const hasExplicitRoomDesign = resolvedRoomDesign?.source === "room-design";
  return {
    ...(region.shapeOptions || {}),
    ...(resolvedArchetype
      ? {
          roomType: resolvedArchetype.roomType || region.shapeOptions?.roomType || "none",
          archetypeId: resolvedArchetype.id,
          archetypeLabel: resolvedArchetype.label,
          ...(!hasExplicitRoomDesign
            ? {
                maskProfile: resolvedArchetype.maskProfile || resolvedArchetype.id,
                detailProfile: resolvedArchetype.detailProfile || resolvedArchetype.id,
              }
            : {}),
        }
      : {}),
    ...roomDesignOptions,
  };
}

function rectsOverlapWithMargin(a, b, margin = 2) {
  return !(
    a.x + a.w + margin <= b.x ||
    b.x + b.w + margin <= a.x ||
    a.y + a.h + margin <= b.y ||
    b.y + b.h + margin <= a.y
  );
}

function getShapeAdjustedRoomSize(size, region, roomDesign) {
  let w = Number(size?.w);
  let h = Number(size?.h);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return size;

  const designShape = getRoomDesignShape(roomDesign);
  const shape = String(
    designShape || region.shape || region.preferredShape || "",
  ).toLowerCase();

  if (shape.includes("hall") || shape.includes("corridor")) {
    w = Math.max(w + 2, h + 3);
    h = Math.max(3, Math.min(h, 4));
  }

  if (
    shape.includes("shaft") ||
    shape.includes("oval") ||
    shape.includes("circular") ||
    shape.includes("circle") ||
    shape.includes("round")
  ) {
    const d = Math.max(w, h);
    w = d;
    h = d;
  }

  if (shape.includes("library") || shape.includes("archive")) {
    w = Math.max(w, 7);
    h = Math.max(h, 5);
  }

  return { ...size, w, h };
}

function resolveMenuPresetRoomSize(region, roomDesign) {
  const preset = ROOM_SIZE_MENU_PRESETS[region.size];
  if (!preset) return null;
  return getShapeAdjustedRoomSize(
    { w: preset.w, h: preset.h },
    region,
    roomDesign,
  );
}

export function resolveRoomSize(region, rng, config = null) {
  const contextKey = getContextKey(config?.context || config?.biome);
  const archetype = resolveRoomArchetype(region, contextKey);
  const roomDesign = resolveRoomDesign(region, contextKey, { archetype });
  if (isMineCaveLikeRegion(region, contextKey)) {
    const caveSize = resolveMineCaveRoomSize(region, rng, config);
    return applyRoomDesignSizeConstraints(
      getShapeAdjustedRoomSize(caveSize, region, roomDesign),
      roomDesign,
    );
  }

  const menuPresetSize = resolveMenuPresetRoomSize(region, roomDesign);
  if (menuPresetSize) {
    return applyRoomDesignSizeConstraints(menuPresetSize, roomDesign);
  }

  const preset = SIZE_PRESETS[region.size] || SIZE_PRESETS.Medium;
  const baseSize = {
    w: randomInt(rng, preset.minW, preset.maxW),
    h: randomInt(rng, preset.minH, preset.maxH),
  };

  return applyRoomDesignSizeConstraints(
    getShapeAdjustedRoomSize(baseSize, region, roomDesign),
    roomDesign,
  );
}

export function isMineCaveLikeRegion(region, contextKey = "mine") {
  if (contextKey !== "mine") return false;
  const surfaceKind = getRegionSurfaceProfile(region, contextKey);
  return surfaceKind === "cave" || surfaceKind === "hybrid";
}

export function getMineCaveChamberProfile(region, contextKey = "mine") {
  if (!isMineCaveLikeRegion(region, contextKey)) return null;
  const text = getRegionText(region);
  const role = getPlacementRole(region);
  const flags = classifyRegion(region);
  if (
    flags.hazard ||
    text.includes("collapse") ||
    text.includes("rubble") ||
    text.includes("broken")
  )
    return "collapsed-pocket";
  if (
    flags.secret ||
    text.includes("fissure") ||
    text.includes("crack") ||
    text.includes("crevice")
  )
    return "narrow-fissure";
  if (
    role === "connector" ||
    flags.connector ||
    text.includes("gallery") ||
    text.includes("tunnel") ||
    text.includes("rail")
  )
    return "rough-gallery";
  if (
    role === "final" ||
    flags.climax ||
    flags.outcome ||
    text.includes("cavern") ||
    text.includes("chamber")
  )
    return "widened-cavern";
  const variants = [
    "irregular-chamber",
    "branching-pocket",
    "rough-gallery",
    "clustered-alcoves",
  ];
  return variants[
    hashStringToSeed(region.id, text, "mine-cave-profile") % variants.length
  ];
}

export function resolveMineCaveRoomSize(region, rng, config = null) {
  const role = getPlacementRole(region);
  const preset = SIZE_PRESETS[region.size] || SIZE_PRESETS.Medium;
  const profile = getMineCaveChamberProfile(region, "mine");
  let w = randomInt(rng, preset.minW + 1, preset.maxW + 3);
  let h = randomInt(rng, preset.minH + 1, preset.maxH + 3);

  if (profile === "narrow-fissure") {
    const long = randomInt(rng, 8, 12);
    const short = randomInt(rng, 4, 6);
    if (hashStringToSeed(region.id, "mine-fissure-axis") % 2 === 0) {
      w = long;
      h = short;
    } else {
      w = short;
      h = long;
    }
  } else if (profile === "rough-gallery") {
    w = randomInt(rng, 8, 12);
    h = randomInt(rng, 4, 7);
    if (hashStringToSeed(region.id, "mine-gallery-axis") % 3 === 0)
      [w, h] = [h, w];
  } else if (profile === "collapsed-pocket") {
    w = randomInt(rng, 6, 9);
    h = randomInt(rng, 5, 8);
  } else if (
    profile === "branching-pocket" ||
    profile === "clustered-alcoves"
  ) {
    w = randomInt(rng, 7, 10);
    h = randomInt(rng, 5, 8);
  } else if (profile === "widened-cavern") {
    w = randomInt(rng, 8, 12);
    h = randomInt(rng, 6, 9);
  }

  if (role === "final" || role === "hazard") {
    w += randomInt(rng, 1, 2);
    h += randomInt(rng, 1, 2);
  }
  if (role === "secret") {
    w = Math.max(4, w - 1);
    h = Math.max(4, h - 1);
  }

  const gridW = Math.floor(
    (config?.mapWidth || DEFAULT_CONFIG.mapWidth) /
      (config?.gridSize || DEFAULT_CONFIG.gridSize),
  );
  const gridH = Math.floor(
    (config?.mapHeight || DEFAULT_CONFIG.mapHeight) /
      (config?.gridSize || DEFAULT_CONFIG.gridSize),
  );
  return {
    w: clamp(w, 4, Math.max(4, Math.min(13, gridW - 8))),
    h: clamp(h, 4, Math.max(4, Math.min(10, gridH - 8))),
  };
}

export function chooseRoomShape(region, contextKey = "") {
  const shape = region.preferredShape.toLowerCase();
  const role = getPlacementRole(region);
  const text = getRegionText(region);
  const archetype = resolveRoomArchetype(region, contextKey);
  const roomDesignShape = getRoomDesignShape(resolveRoomDesign(region, contextKey, { archetype }));
  if (roomDesignShape) return roomDesignShape;
  if (archetype?.shape) return archetype.shape;

  if (contextKey === "chapel") {
    if (role === "final") return "apse";
    if (role === "connector") return "hall";
    if (
      role === "secret" ||
      text.includes("archive") ||
      text.includes("library")
    )
      return "archive";
    return "rect";
  }

  if (contextKey === "noble-house") {
    if (
      role === "secret" ||
      text.includes("archive") ||
      text.includes("library")
    )
      return "archive";
    if (role === "connector" || role === "entrance") return "rect";
    if (shape.includes("l-shape") || shape.includes("l shape"))
      return "l-shape";
    return "rect";
  }

  if (contextKey === "cave") {
    if (
      shape.includes("shaft") ||
      text.includes("well") ||
      text.includes("vertical")
    )
      return "shaft";
    return "cave";
  }

  if (contextKey === "mine") {
    if (isMineCaveLikeRegion(region, contextKey)) return "cave";
    if (
      role === "connector" ||
      shape.includes("hall") ||
      shape.includes("corridor")
    )
      return "hall";
    if (
      shape.includes("shaft") ||
      text.includes("well") ||
      text.includes("vertical")
    )
      return "shaft";
    if (role === "hazard" || text.includes("collapse")) return "broken";
    return "notched";
  }

  if (contextKey === "ruins") {
    if (role === "connector") return "hall";
    if (
      role === "secret" ||
      text.includes("archive") ||
      text.includes("library")
    )
      return "archive";
    return role === "final" ? "broken" : "ruined-rect";
  }

  if (contextKey === "crypt") {
    if (
      role === "secret" ||
      text.includes("archive") ||
      text.includes("library")
    )
      return "archive";
    if (
      shape.includes("shaft") ||
      shape.includes("oval") ||
      shape.includes("circular") ||
      text.includes("well") ||
      text.includes("vertical")
    )
      return "shaft";
    if (role === "final" || text.includes("ossuary") || text.includes("crypt"))
      return "alcove";
    if (
      role === "connector" ||
      shape.includes("hall") ||
      shape.includes("corridor")
    )
      return "hall";
    if (role === "hazard") return "notched";
  }

  if (shape.includes("l-shape") || shape.includes("l shape")) return "l-shape";
  if (shape.includes("notch") || shape.includes("cutout")) return "notched";
  if (
    shape.includes("circular") ||
    shape.includes("circle") ||
    shape.includes("round")
  )
    return "circle";
  if (shape.includes("shaft") || shape.includes("oval")) return "shaft";
  if (shape.includes("irregular") || shape.includes("cave")) return "cave";
  if (shape.includes("hall") || shape.includes("corridor")) return "hall";
  if (shape.includes("ritual")) return "ritual";
  if (shape.includes("archive") || shape.includes("library")) return "archive";
  return "rect";
}


export function getProgressionScale(contextKey = "crypt", roomCount = 6) {
  const count = Math.max(1, Number(roomCount) || 1);
  const scaleByContext = {
    crypt: count <= 4 ? 0.42 : count <= 8 ? 0.52 : 0.62,
    mine: count <= 4 ? 0.48 : count <= 8 ? 0.58 : 0.68,
    ruins: count <= 4 ? 0.5 : count <= 8 ? 0.6 : 0.7,
    cave: count <= 4 ? 0.48 : count <= 8 ? 0.58 : 0.68,
  };
  return scaleByContext[contextKey] || 0.58;
}

export function getCompactDepthTarget(centerX, usableW, depth, profileKey, roomCount) {
  const progressionWidth = usableW * getProgressionScale(profileKey, roomCount);
  return centerX - progressionWidth / 2 + depth * progressionWidth;
}

export function getPlacementLane(region, profile, seed) {
  const role = getPlacementRole(region);
  const base = profile.roleLane[role] ?? 0;
  const variant = (hashStringToSeed(seed, region.id, "lane") % 3) - 1;
  if (role === "connector" || role === "entrance" || role === "final")
    return base + variant * 0.18;
  return base + variant * 0.42;
}

export function getPlacementDepth(region, profile, maxDepth, seed) {
  const role = getPlacementRole(region);
  const depth = Number.isFinite(region.graphDepth)
    ? region.graphDepth
    : roleDepth(region);
  const normalized = maxDepth <= 0 ? 0 : depth / maxDepth;
  const bias = profile.roleDepthBias[role] ?? 0;
  const jitter =
    ((hashStringToSeed(seed, region.id, "depth-jitter") % 100) / 100 - 0.5) *
    profile.depthJitter *
    0.05;
  return clamp(normalized * 0.88 + bias * 0.12 + jitter, 0, 1);
}

export function getPlacedNeighborCentroid(region, placed, adjacency) {
  const neighbors = adjacency.get(region.id) || [];
  const points = neighbors
    .map((neighbor) =>
      placed.find((placedRegion) => placedRegion.id === neighbor.id),
    )
    .filter(Boolean)
    .map((placedRegion) => ({
      x: placedRegion.cellRect.x + placedRegion.cellRect.w / 2,
      y: placedRegion.cellRect.y + placedRegion.cellRect.h / 2,
    }));
  if (points.length === 0) return null;
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  };
}

export function getContextualTarget(
  region,
  size,
  config,
  graph,
  placed,
  rng,
  profile,
  adjacency,
  maxDepth,
) {
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const role = getPlacementRole(region);
  const depth = getPlacementDepth(region, profile, maxDepth, config.seed);
  const lane = getPlacementLane(region, profile, config.seed);
  const centerX = gridW / 2;
  const centerY = gridH / 2;
  const usableW = Math.max(8, gridW - size.w - 8);
  const usableH = Math.max(8, gridH - size.h - 8);
  const depthX = 4 + depth * usableW;
  const depthY = 4 + depth * usableH;
  const compactProgressionWidth = usableW * getProgressionScale(profile.key, config.roomCount);
  const compactProgressionStart = centerX - compactProgressionWidth / 2;
  const compactDepthX = compactProgressionStart + depth * compactProgressionWidth;
  const lateral = lane * profile.spread;
  const branch =
    ((hashStringToSeed(config.seed, region.id, "branch") % 100) / 100 - 0.5) *
    profile.branchSpread;
  const jitterX = randomInt(
    rng,
    -Math.round(profile.lateralJitter),
    Math.round(profile.lateralJitter),
  );
  const jitterY = randomInt(
    rng,
    -Math.round(profile.lateralJitter),
    Math.round(profile.lateralJitter),
  );
  let target = { x: depthX, y: centerY + lateral + branch * 0.32 };

  if (profile.key === "chapel") {
    target = { x: depthX, y: centerY + lateral };
    if (role === "final")
      target = { x: gridW - size.w - 5, y: centerY - size.h / 2 };
    if (role === "entrance") target = { x: 4, y: centerY - size.h / 2 };
    if (role === "secret")
      target = {
        x: centerX + depth * usableW * 0.35,
        y: centerY + profile.spread * 1.65,
      };
  }

  if (profile.key === "crypt") {
    target = {
      x: compactDepthX,
      y: centerY + lateral * 0.92 + branch * 0.26,
    };
    if (role === "entrance")
      target.x = Math.min(target.x, centerX - compactProgressionWidth * 0.42);
    if (role === "final")
      target.x = Math.max(target.x, centerX + compactProgressionWidth * 0.28);
    if (role === "secret")
      target = {
        x: centerX + compactProgressionWidth * 0.28,
        y: centerY + profile.spread * 1.55 + branch * 0.2,
      };
  }

  if (profile.key === "mine") {
    target = { x: compactDepthX, y: centerY + lateral * 0.82 + branch * 0.7 };
    if (role === "connector") target.y = centerY + lane * 2.2 + branch * 0.25;
    if (role === "hazard") target.y += profile.spread * 0.34;
    if (role === "secret") target.x = centerX + compactProgressionWidth * 0.26;
  }

  if (profile.key === "cave") {
    const angleSeed =
      hashStringToSeed(config.seed, region.id, "cave-angle") / 4294967296;
    const angle = angleSeed * Math.PI * 2 + depth * Math.PI * 0.85;
    const radius = 3 + depth * Math.min(gridW, gridH) * 0.36;
    target = {
      x: centerX + Math.cos(angle) * radius - size.w / 2 + lane * 0.8,
      y: centerY + Math.sin(angle) * radius * 0.72 - size.h / 2 + branch * 0.45,
    };
    if (role === "entrance")
      target = { x: 5, y: centerY - size.h / 2 + branch * 0.2 };
  }

  if (profile.key === "noble-house") {
    const floorLane = Math.round(lane);
    const column = Math.round(depth * 4);
    target = {
      x: 5 + column * Math.max(6, usableW / 4),
      y: centerY - size.h / 2 + floorLane * Math.max(4, profile.spread * 0.82),
    };
    if (role === "connector") target.y = centerY - size.h / 2;
    if (role === "secret")
      target = {
        x: centerX + usableW * 0.22,
        y: centerY + profile.spread * 1.5,
      };
  }

  if (profile.key === "ruins") {
    const cluster =
      hashStringToSeed(config.seed, region.id, "ruin-cluster") % 4;
    const clusterOffset = [
      { x: -profile.spread * 0.55, y: -profile.spread * 0.72 },
      { x: profile.spread * 0.48, y: -profile.spread * 0.82 },
      { x: -profile.spread * 0.42, y: profile.spread * 0.92 },
      { x: profile.spread * 0.58, y: profile.spread * 0.72 },
    ][cluster];
    target = {
      x: compactDepthX + clusterOffset.x,
      y: centerY + lateral * 0.72 + clusterOffset.y + branch * 0.18,
    };
    if (role === "secret") target.x = centerX + compactProgressionWidth * 0.22 + clusterOffset.x;
  }

  const centroid = getPlacedNeighborCentroid(region, placed, adjacency);
  if (centroid) {
    const pullByContext = {
      cave: 0.24,
      mine: 0.3,
      ruins: 0.28,
      crypt: 0.26,
      chapel: 0.16,
      "noble-house": 0.18,
    };
    const pull = pullByContext[profile.key] ?? 0.18;
    target = {
      x: target.x * (1 - pull) + centroid.x * pull - size.w / 2,
      y: target.y * (1 - pull) + centroid.y * pull - size.h / 2,
    };
  }

  return {
    x: target.x + jitterX,
    y: target.y + jitterY,
  };
}

export function scorePlacementCandidate(
  candidate,
  target,
  placed,
  graph,
  region,
  profile,
) {
  const dx = candidate.x - target.x;
  const dy = candidate.y - target.y;
  const overlapCount = placed.filter((room) =>
    rectsOverlapWithMargin(candidate, room.cellRect, 2),
  ).length;
  const nearCount = placed.filter((room) =>
    rectsOverlapWithMargin(candidate, room.cellRect, 5),
  ).length;
  const role = getPlacementRole(region);
  const graphBias = graph.some(
    (edge) => edge.from === region.id || edge.to === region.id,
  )
    ? -8
    : 0;
  const spacingPenalty =
    profile.key === "cave" || profile.key === "ruins"
      ? nearCount * 5
      : nearCount * 2;
  const axisPenalty =
    (profile.key === "chapel" || profile.key === "crypt") &&
    ["entrance", "connector", "final"].includes(role)
      ? Math.abs(dy) * 0.35
      : 0;
  return (
    dx * dx +
    dy * dy +
    overlapCount * 10000 +
    spacingPenalty +
    axisPenalty +
    graphBias
  );
}

export function createPlacedRegion(
  region,
  shape,
  cellRect,
  config,
  profileKey,
  number,
) {
  const surfaceKind = getRegionSurfaceProfile(region, profileKey);
  const archetype = resolveRoomArchetype(region, profileKey);
  const roomDesign = resolveRoomDesign(region, profileKey, { archetype });
  const roomArchetypeResolution = getRoomArchetypeResolutionSummary(region, profileKey, archetype);
  const roomShapeOptions = getRoomShapeOptions(region, profileKey, archetype, roomDesign);
  const caveChamberProfile =
    profileKey === "mine" &&
    (surfaceKind === "cave" || surfaceKind === "hybrid")
      ? getMineCaveChamberProfile(region, profileKey)
      : null;
  return {
    ...region,
    shape,
    cellRect,
    placementProfile: profileKey,
    surfaceKind,
    ...(archetype
      ? {
          roomArchetype: archetype.id,
          roomArchetypeLabel: archetype.label,
          roomArchetypeFamily: archetype.family,
          roomArchetypeSource: archetype.source,
          roomArchetypeResolution,
          roomType: archetype.roomType || region.roomType || "none",
          shapeOptions: roomShapeOptions,
        }
      : roomShapeOptions
        ? { roomArchetypeResolution, shapeOptions: roomShapeOptions }
        : { roomArchetypeResolution }),
    ...(roomDesign ? { roomDesign } : {}),
    ...(caveChamberProfile ? { caveChamberProfile } : {}),
    floorCells: [],
    wallSegments: [],
    doorAnchors: [],
    labelPoint: {
      x: (cellRect.x + cellRect.w / 2) * config.gridSize,
      y: (cellRect.y + cellRect.h / 2) * config.gridSize,
    },
    number,
  };
}

export function resolveStructuredRoomSize(region, contextKey, options = {}) {
  const role = getPlacementRole(region);
  if (contextKey === "chapel") {
    if (role === "entrance") return { w: 5, h: 5 };
    if (role === "connector")
      return options.primary
        ? { w: 12 + options.variant, h: 6 + (options.variant % 2) }
        : { w: 5, h: 4 };
    if (role === "final") return { w: 7 + (options.variant % 2), h: 7 };
    if (role === "secret") return { w: 5, h: 4 };
    if (role === "hazard") return { w: 6, h: 5 };
    return { w: 5, h: 4 };
  }
  if (contextKey === "noble-house") {
    if (role === "entrance") return { w: 7, h: 5 };
    if (role === "connector") return { w: 7, h: 4 };
    if (role === "final") return { w: 8, h: 6 };
    if (role === "secret") return { w: 5, h: 4 };
    return { w: 6, h: 5 };
  }
  return null;
}

export function rectsOverlapAny(rect, placed, margin = 0) {
  return placed.some((region) =>
    rectsOverlapWithMargin(rect, region.cellRect, margin),
  );
}

export function clampRoomRectToGrid(rect, gridW, gridH, margin = 3) {
  const safeW = clamp(Math.round(rect.w || 4), 3, Math.max(3, gridW - margin * 2));
  const safeH = clamp(Math.round(rect.h || 4), 3, Math.max(3, gridH - margin * 2));
  return {
    x: clamp(Math.round(rect.x || margin), margin, Math.max(margin, gridW - safeW - margin)),
    y: clamp(Math.round(rect.y || margin), margin, Math.max(margin, gridH - safeH - margin)),
    w: safeW,
    h: safeH,
  };
}

export function findNonOverlappingRoomRect(
  preferredRect,
  placed,
  gridW,
  gridH,
  rng,
  options = {},
) {
  const margin = Number.isFinite(options.margin) ? options.margin : 3;
  const overlapMargin = Number.isFinite(options.overlapMargin)
    ? options.overlapMargin
    : 0;
  const preferred = clampRoomRectToGrid(preferredRect, gridW, gridH, margin);
  if (!rectsOverlapAny(preferred, placed, overlapMargin)) return preferred;

  const offsets = [];
  const maxRadius = Math.max(
    12,
    Number.isFinite(options.maxRadius)
      ? options.maxRadius
      : Math.ceil(Math.max(gridW, gridH) / 2),
  );
  for (let radius = 1; radius <= maxRadius; radius += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      offsets.push({ dx, dy: -radius });
      offsets.push({ dx, dy: radius });
    }
    for (let dy = -radius + 1; dy <= radius - 1; dy += 1) {
      offsets.push({ dx: -radius, dy });
      offsets.push({ dx: radius, dy });
    }
  }

  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;
  offsets.forEach((offset) => {
    const candidate = clampRoomRectToGrid(
      { ...preferred, x: preferred.x + offset.dx, y: preferred.y + offset.dy },
      gridW,
      gridH,
      margin,
    );
    if (rectsOverlapAny(candidate, placed, overlapMargin)) return;
    const dx = candidate.x - preferred.x;
    const dy = candidate.y - preferred.y;
    const edgePenalty =
      candidate.x <= margin ||
      candidate.y <= margin ||
      candidate.x + candidate.w >= gridW - margin ||
      candidate.y + candidate.h >= gridH - margin
        ? 18
        : 0;
    const score = dx * dx + dy * dy + edgePenalty + (rng ? rng() : 0);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  });
  if (best) return best;

  for (let y = margin; y <= gridH - preferred.h - margin; y += 1) {
    for (let x = margin; x <= gridW - preferred.w - margin; x += 1) {
      const candidate = { ...preferred, x, y };
      if (!rectsOverlapAny(candidate, placed, overlapMargin)) return candidate;
    }
  }

  return preferred;
}

export function createChapelSideSlots(
  naveRect,
  finalRect,
  gridW,
  gridH,
  variant,
) {
  const upperFirst = variant % 2 === 0;
  const transeptX = Math.max(naveRect.x + 2, finalRect.x - 4);
  const slots = [
    {
      id: "north-chapel-a",
      x: naveRect.x + 2,
      y: naveRect.y - 8,
      w: 5,
      h: 5,
      kind: "side",
    },
    {
      id: "south-chapel-a",
      x: naveRect.x + 2,
      y: naveRect.y + naveRect.h + 3,
      w: 5,
      h: 5,
      kind: "side",
    },
    {
      id: "north-chapel-b",
      x: naveRect.x + Math.max(6, Math.floor(naveRect.w / 2)),
      y: naveRect.y - 8,
      w: 5,
      h: 5,
      kind: "side",
    },
    {
      id: "south-chapel-b",
      x: naveRect.x + Math.max(6, Math.floor(naveRect.w / 2)),
      y: naveRect.y + naveRect.h + 3,
      w: 5,
      h: 5,
      kind: "side",
    },
    {
      id: "north-transept",
      x: transeptX,
      y: finalRect.y - 8,
      w: 6,
      h: 5,
      kind: "transept",
    },
    {
      id: "south-transept",
      x: transeptX,
      y: finalRect.y + finalRect.h + 3,
      w: 6,
      h: 5,
      kind: "transept",
    },
    {
      id: "sacristy",
      x: finalRect.x + Math.max(0, finalRect.w - 5),
      y: finalRect.y + finalRect.h,
      w: 5,
      h: 4,
      kind: "sacristy",
    },
    {
      id: "vestry",
      x: finalRect.x,
      y: finalRect.y - 4,
      w: 5,
      h: 4,
      kind: "vestry",
    },
    {
      id: "rear-crypt",
      x: finalRect.x + finalRect.w,
      y: finalRect.y + Math.floor((finalRect.h - 4) / 2),
      w: 5,
      h: 4,
      kind: "secret",
    },
  ].map((slot) => ({
    ...slot,
    x: clamp(slot.x, 3, gridW - slot.w - 3),
    y: clamp(slot.y, 3, gridH - slot.h - 3),
  }));

  return slots.sort((a, b) => {
    const aNorth = a.id.includes("north") || a.id.includes("vestry");
    const bNorth = b.id.includes("north") || b.id.includes("vestry");
    if (aNorth !== bNorth)
      return upperFirst ? (aNorth ? -1 : 1) : aNorth ? 1 : -1;
    return (
      hashStringToSeed(a.id, variant, "chapel-slot") -
      hashStringToSeed(b.id, variant, "chapel-slot")
    );
  });
}

export function placeRegionInFirstAvailableSlot(
  region,
  slots,
  placed,
  config,
  profileKey,
  shape = "rect",
) {
  const role = getPlacementRole(region);
  const preferred =
    role === "secret"
      ? slots.filter(
          (slot) => slot.kind === "secret" || slot.kind === "sacristy",
        )
      : slots;
  const candidates = preferred.length > 0 ? preferred : slots;
  for (const slot of candidates) {
    const size = resolveStructuredRoomSize(region, "chapel", {
      primary: false,
      variant: 0,
    }) || { w: slot.w, h: slot.h };
    const cellRect = {
      x: slot.x,
      y: slot.y,
      w: Math.min(size.w, slot.w),
      h: Math.min(size.h, slot.h),
    };
    if (rectsOverlapAny(cellRect, placed, 0)) continue;
    placed.push(
      createPlacedRegion(
        region,
        shape,
        cellRect,
        config,
        profileKey,
        placed.length + 1,
      ),
    );
    slots.splice(slots.indexOf(slot), 1);
    return true;
  }
  return false;
}

export function placeChapelRegions(config, graph, rng, profile) {
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const placed = [];
  const variant =
    hashStringToSeed(config.seed, config.roomCount, "chapel-blueprint") % 4;
  const axisShift = (hashStringToSeed(config.seed, "chapel-axis") % 5) - 2;
  const centerY = clamp(Math.floor(gridH / 2) + axisShift, 10, gridH - 10);
  const roleWeight = {
    entrance: 0,
    connector: 1,
    clue: 2,
    hazard: 3,
    side: 4,
    final: 5,
    secret: 6,
  };
  const ordered = [...config.regions].sort(
    (a, b) =>
      (roleWeight[getPlacementRole(a)] ?? 4) -
        (roleWeight[getPlacementRole(b)] ?? 4) ||
      roleDepth(a) - roleDepth(b) ||
      a.id.localeCompare(b.id),
  );
  const entrance =
    ordered.find((region) => getPlacementRole(region) === "entrance") ||
    ordered[0];
  const finalRoom =
    [...ordered]
      .reverse()
      .find((region) => getPlacementRole(region) === "final") ||
    ordered[ordered.length - 1];
  const connector = ordered.find(
    (region) =>
      getPlacementRole(region) === "connector" &&
      region.id !== entrance?.id &&
      region.id !== finalRoom?.id,
  );
  const naveRegion =
    connector ||
    ordered.find(
      (region) => region.id !== entrance?.id && region.id !== finalRoom?.id,
    ) ||
    entrance;
  const sideRegions = ordered.filter(
    (region) =>
      ![entrance?.id, finalRoom?.id, naveRegion?.id].includes(region.id),
  );
  const entranceSize = resolveStructuredRoomSize(entrance, "chapel", {
    variant,
    primary: false,
  });
  const naveSize = resolveStructuredRoomSize(naveRegion, "chapel", {
    variant,
    primary: true,
  });
  const finalSize = resolveStructuredRoomSize(finalRoom, "chapel", {
    variant,
    primary: false,
  });
  const startX = 4 + (variant === 3 ? 2 : 0);
  const entranceRect = {
    x: startX,
    y: centerY - Math.floor(entranceSize.h / 2),
    ...entranceSize,
  };
  const naveRect = {
    x: entranceRect.x + entranceRect.w,
    y: centerY - Math.floor(naveSize.h / 2),
    ...naveSize,
  };
  const finalYOffset = variant === 1 ? -1 : variant === 2 ? 1 : 0;
  const finalRect = {
    x: naveRect.x + naveRect.w,
    y: clamp(
      centerY - Math.floor(finalSize.h / 2) + finalYOffset,
      3,
      gridH - finalSize.h - 3,
    ),
    ...finalSize,
  };

  if (entrance)
    placed.push(
      createPlacedRegion(
        entrance,
        "rect",
        entranceRect,
        config,
        profile.key,
        placed.length + 1,
      ),
    );
  if (
    naveRegion &&
    naveRegion.id !== entrance?.id &&
    naveRegion.id !== finalRoom?.id
  )
    placed.push(
      createPlacedRegion(
        naveRegion,
        "hall",
        naveRect,
        config,
        profile.key,
        placed.length + 1,
      ),
    );
  if (
    finalRoom &&
    finalRoom.id !== entrance?.id &&
    finalRoom.id !== naveRegion?.id
  )
    placed.push(
      createPlacedRegion(
        finalRoom,
        "apse",
        finalRect,
        config,
        profile.key,
        placed.length + 1,
      ),
    );

  const slots = createChapelSideSlots(
    naveRect,
    finalRect,
    gridW,
    gridH,
    variant,
  );
  sideRegions.forEach((region) => {
    const role = getPlacementRole(region);
    const shape = role === "secret" ? "archive" : "rect";
    const placedInSlot = placeRegionInFirstAvailableSlot(
      region,
      slots,
      placed,
      config,
      profile.key,
      shape,
    );
    if (placedInSlot) return;
    const fallbackSize = resolveStructuredRoomSize(region, "chapel", {
      primary: false,
      variant,
    }) || { w: 5, h: 4 };
    const preferredRect = {
      x: finalRect.x + finalRect.w + 1 + (hashStringToSeed(config.seed, region.id, "chapel-fallback-x") % 5),
      y: centerY - Math.floor(fallbackSize.h / 2) +
        ((hashStringToSeed(config.seed, region.id, "chapel-fallback-y") % 9) - 4),
      ...fallbackSize,
    };
    const cellRect = findNonOverlappingRoomRect(
      preferredRect,
      placed,
      gridW,
      gridH,
      rng,
      { margin: 3, overlapMargin: 0 },
    );
    placed.push(
      createPlacedRegion(
        region,
        shape,
        cellRect,
        config,
        profile.key,
        placed.length + 1,
      ),
    );
  });

  return config.regions
    .map((region) =>
      placed.find((placedRegion) => placedRegion.id === region.id),
    )
    .filter(Boolean);
}

export function createNobleHouseSlots(courtyard, gridW, gridH) {
  const rawSlots = [
    { side: "west", x: courtyard.x - 7, y: courtyard.y + 1, w: 7, h: 5 },
    { side: "north", x: courtyard.x, y: courtyard.y - 5, w: 6, h: 5 },
    { side: "north", x: courtyard.x + 6, y: courtyard.y - 5, w: 6, h: 5 },
    { side: "east", x: courtyard.x + courtyard.w, y: courtyard.y, w: 7, h: 5 },
    { side: "east", x: courtyard.x + courtyard.w, y: courtyard.y + 5, w: 7, h: 5 },
    { side: "south", x: courtyard.x + 4, y: courtyard.y + courtyard.h, w: 7, h: 5 },
    { side: "south", x: courtyard.x - 3, y: courtyard.y + courtyard.h, w: 7, h: 5 },
    { side: "west", x: courtyard.x - 7, y: courtyard.y + 6, w: 7, h: 5 },
    { side: "north", x: courtyard.x - 6, y: courtyard.y - 5, w: 6, h: 5 },
    { side: "north", x: courtyard.x + 12, y: courtyard.y - 5, w: 6, h: 5 },
    { side: "south", x: courtyard.x - 9, y: courtyard.y + courtyard.h, w: 6, h: 5 },
    { side: "south", x: courtyard.x + 11, y: courtyard.y + courtyard.h, w: 6, h: 5 },
    { side: "west", x: courtyard.x - 13, y: courtyard.y + 2, w: 6, h: 5 },
    { side: "east", x: courtyard.x + courtyard.w + 7, y: courtyard.y + 2, w: 6, h: 5 },
  ];
  return rawSlots.map((slot) => ({
    ...slot,
    ...clampRoomRectToGrid(slot, gridW, gridH, 3),
  }));
}


function getRectCenter(rect) {
  if (!rect) return null;
  return {
    x: Number(rect.x) + Number(rect.w || 0) / 2,
    y: Number(rect.y) + Number(rect.h || 0) / 2,
  };
}

function getNobleHouseConnectedPlacedCentroid(region, placed, graph) {
  const connected = graph
    .filter((edge) => edge.from === region.id || edge.to === region.id)
    .map((edge) => (edge.from === region.id ? edge.to : edge.from));
  const points = connected
    .map((id) => placed.find((placedRegion) => placedRegion.id === id))
    .filter(Boolean)
    .map((placedRegion) => getRectCenter(placedRegion.cellRect))
    .filter(Boolean);
  if (!points.length) return null;
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  };
}

function getNobleHouseRoleSlotBias(role, slot, courtyard) {
  const center = getRectCenter(slot);
  const courtyardCenter = getRectCenter(courtyard);
  if (!center || !courtyardCenter) return 0;
  const west = Math.max(0, courtyardCenter.x - center.x);
  const east = Math.max(0, center.x - courtyardCenter.x);
  const north = Math.max(0, courtyardCenter.y - center.y);
  const south = Math.max(0, center.y - courtyardCenter.y);
  if (role === "entrance") return slot.side === "west" ? -140 : east * 8 + Math.abs(center.y - courtyardCenter.y) * 3;
  if (role === "connector") return slot.side === "west" || slot.side === "north" ? -60 : 0;
  if (role === "final") return slot.side === "east" ? -90 : west * 6 + Math.abs(center.y - courtyardCenter.y) * 2;
  if (role === "secret") return slot.side === "south" || slot.side === "east" ? -45 : 20;
  if (role === "hazard") return east * -2 + south * -1;
  if (role === "clue") return north * -1.5 + west * -0.5;
  return 0;
}

function takeBestNobleHouseSlot(region, slots, placed, graph, courtyard, fallbackIndex = 0) {
  if (!slots.length) return null;
  const role = getPlacementRole(region);
  const connectedCentroid = getNobleHouseConnectedPlacedCentroid(region, placed, graph);
  const courtyardCenter = getRectCenter(courtyard);
  let bestIndex = 0;
  let bestScore = Number.POSITIVE_INFINITY;

  slots.forEach((slot, index) => {
    const center = getRectCenter(slot);
    const anchor = connectedCentroid || courtyardCenter || center;
    const dx = center.x - anchor.x;
    const dy = center.y - anchor.y;
    const connectionScore = connectedCentroid ? dx * dx + dy * dy : Math.abs(index - fallbackIndex) * 18;
    const roleBias = getNobleHouseRoleSlotBias(role, slot, courtyard);
    const reuseOrderBias = index * 0.04;
    const score = connectionScore + roleBias + reuseOrderBias;
    if (score < bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  const [slot] = slots.splice(bestIndex, 1);
  return slot;
}

function takeOrderedNobleHouseSlot(slots, fallbackIndex = 0) {
  if (!slots.length) return null;
  const safeIndex = Math.max(0, Math.min(slots.length - 1, fallbackIndex));
  const [slot] = slots.splice(safeIndex, 1);
  return slot;
}

export function placeNobleHouseRegions(config, graph, rng, profile) {
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const placed = [];
  const centerX = Math.floor(gridW / 2);
  const centerY = Math.floor(gridH / 2);
  const courtyard = { x: centerX - 5, y: centerY - 4, w: 10, h: 8 };
  const ordered = [...config.regions].sort(
    (a, b) => roleDepth(a) - roleDepth(b) || a.id.localeCompare(b.id),
  );
  const slots = createNobleHouseSlots(courtyard, gridW, gridH);
  const rolePriority = {
    entrance: 0,
    connector: 1,
    clue: 2,
    side: 3,
    hazard: 4,
    final: 5,
    secret: 6,
  };
  const arranged = [...ordered].sort(
    (a, b) =>
      (rolePriority[getPlacementRole(a)] ?? 3) -
        (rolePriority[getPlacementRole(b)] ?? 3) || a.id.localeCompare(b.id),
  );

  arranged.forEach((region, index) => {
    const role = getPlacementRole(region);
    const useCompactNobleSlotOrder = config.regions.length <= 5;
    const slot = (useCompactNobleSlotOrder
      ? takeOrderedNobleHouseSlot(slots, 0)
      : takeBestNobleHouseSlot(region, slots, placed, graph, courtyard, index)) || {
      x: courtyard.x,
      y: courtyard.y,
      w: 6,
      h: 5,
      side: "fallback",
    };
    const structuredSize = resolveStructuredRoomSize(region, "noble-house");
    const size = structuredSize || { w: slot.w, h: slot.h };
    let preferredRect = {
      x: slot.x,
      y: slot.y,
      w: Math.min(size.w, Math.max(size.w, slot.w)),
      h: Math.min(size.h, Math.max(size.h, slot.h)),
    };

    if (role === "final" && !getNobleHouseConnectedPlacedCentroid(region, placed, graph)) {
      preferredRect = {
        x: courtyard.x + courtyard.w,
        y: courtyard.y,
        w: 8,
        h: 6,
      };
    }
    if (role === "secret" && !getNobleHouseConnectedPlacedCentroid(region, placed, graph)) {
      preferredRect = {
        x: courtyard.x + courtyard.w - 2,
        y: courtyard.y + courtyard.h,
        w: 5,
        h: 4,
      };
    }

    const cellRect = findNonOverlappingRoomRect(
      preferredRect,
      placed,
      gridW,
      gridH,
      rng,
      { margin: 3, overlapMargin: 0 },
    );

    placed.push(
      createPlacedRegion(
        region,
        "rect",
        cellRect,
        config,
        profile.key,
        placed.length + 1,
      ),
    );
  });

  return config.regions
    .map((region) =>
      placed.find((placedRegion) => placedRegion.id === region.id),
    )
    .filter(Boolean);
}

export function resolveCaveRoomSize(region, rng, config = null) {
  const role = getPlacementRole(region);
  const preset = SIZE_PRESETS[region.size] || SIZE_PRESETS.Medium;
  const singleCaveRegion =
    getContextKey(config?.context || config?.biome) === "cave" &&
    normalizeRoomCount(config?.roomCount, config?.regions?.length || 1) <= 1;

  if (singleCaveRegion) {
    const gridW = Math.floor(
      (config?.mapWidth || DEFAULT_CONFIG.mapWidth) /
        (config?.gridSize || DEFAULT_CONFIG.gridSize),
    );
    const gridH = Math.floor(
      (config?.mapHeight || DEFAULT_CONFIG.mapHeight) /
        (config?.gridSize || DEFAULT_CONFIG.gridSize),
    );
    return {
      w: clamp(randomInt(rng, 21, 29), 14, Math.max(14, gridW - 8)),
      h: clamp(randomInt(rng, 14, 21), 10, Math.max(10, gridH - 8)),
    };
  }

  let w = randomInt(rng, preset.minW + 1, preset.maxW + 2);
  let h = randomInt(rng, preset.minH + 1, preset.maxH + 2);

  if (role === "connector") {
    w = randomInt(rng, 4, 6);
    h = randomInt(rng, 4, 6);
  }

  if (role === "final" || role === "hazard") {
    w += randomInt(rng, 1, 3);
    h += randomInt(rng, 1, 3);
  }

  if (role === "secret") {
    w = Math.max(4, w - 1);
    h = Math.max(4, h - 1);
  }

  const shapeText = String(region.preferredShape || "").toLowerCase();
  if (
    shapeText.includes("shaft") ||
    getRegionText(region).includes("vertical") ||
    getRegionText(region).includes("well")
  ) {
    const d = clamp(Math.max(w, h), 5, 9);
    return { w: d, h: d };
  }

  const average = Math.round((w + h) / 2);
  w = clamp(Math.round(w * 0.66 + average * 0.34), 4, 12);
  h = clamp(Math.round(h * 0.66 + average * 0.34), 4, 10);
  return { w, h };
}

export function getRectGap(a, b) {
  const dx = Math.max(0, Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w)));
  const dy = Math.max(0, Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h)));
  return dx + dy;
}

export function getRectIntersectionArea(a, b) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  if (x2 <= x1 || y2 <= y1) return 0;
  return (x2 - x1) * (y2 - y1);
}

export function createAdjacentCaveCandidate(
  anchorRect,
  size,
  direction,
  offset,
) {
  const overlapX = Math.max(
    1,
    Math.round(Math.min(anchorRect.w, size.w) * 0.28),
  );
  const overlapY = Math.max(
    1,
    Math.round(Math.min(anchorRect.h, size.h) * 0.28),
  );
  const alignX =
    anchorRect.x + Math.round((anchorRect.w - size.w) / 2) + offset;
  const alignY =
    anchorRect.y + Math.round((anchorRect.h - size.h) / 2) + offset;

  if (direction === "east")
    return { x: anchorRect.x + anchorRect.w - overlapX, y: alignY, ...size };
  if (direction === "west")
    return { x: anchorRect.x - size.w + overlapX, y: alignY, ...size };
  if (direction === "south")
    return { x: alignX, y: anchorRect.y + anchorRect.h - overlapY, ...size };
  if (direction === "north")
    return { x: alignX, y: anchorRect.y - size.h + overlapY, ...size };
  if (direction === "south-east")
    return {
      x: anchorRect.x + anchorRect.w - overlapX,
      y: anchorRect.y + anchorRect.h - overlapY,
      ...size,
    };
  if (direction === "north-east")
    return {
      x: anchorRect.x + anchorRect.w - overlapX,
      y: anchorRect.y - size.h + overlapY,
      ...size,
    };
  if (direction === "south-west")
    return {
      x: anchorRect.x - size.w + overlapX,
      y: anchorRect.y + anchorRect.h - overlapY,
      ...size,
    };
  return {
    x: anchorRect.x - size.w + overlapX,
    y: anchorRect.y - size.h + overlapY,
    ...size,
  };
}

export function isAcceptableCavePlacement(candidate, anchorRect, placed) {
  const area = Math.max(1, candidate.w * candidate.h);
  let anchorOverlap = 0;
  let foreignOverlap = 0;

  placed.forEach((room) => {
    const overlap = getRectIntersectionArea(candidate, room.cellRect);
    if (overlap <= 0) return;
    if (room.cellRect === anchorRect) anchorOverlap += overlap;
    else foreignOverlap += overlap;
  });

  return anchorOverlap <= area * 0.46 && foreignOverlap <= area * 0.2;
}

export function scoreCavePlacementCandidate(
  candidate,
  anchorRect,
  placed,
  center,
  gridW,
  gridH,
  rng,
) {
  const area = Math.max(1, candidate.w * candidate.h);
  let anchorOverlap = 0;
  let foreignOverlap = 0;

  placed.forEach((room) => {
    const overlap = getRectIntersectionArea(candidate, room.cellRect);
    if (overlap <= 0) return;
    if (room.cellRect === anchorRect) anchorOverlap += overlap;
    else foreignOverlap += overlap;
  });

  const near = placed.filter(
    (room) => getRectGap(candidate, room.cellRect) <= 1,
  ).length;
  const anchorGap = getRectGap(candidate, anchorRect);
  const candidateCenter = {
    x: candidate.x + candidate.w / 2,
    y: candidate.y + candidate.h / 2,
  };
  const centerDx = candidateCenter.x - center.x;
  const centerDy = candidateCenter.y - center.y;
  const edgePenalty =
    candidate.x < 2 ||
    candidate.y < 2 ||
    candidate.x + candidate.w > gridW - 2 ||
    candidate.y + candidate.h > gridH - 2
      ? 900
      : 0;
  const desiredAnchorOverlap = area * 0.18;
  const overlapPenalty = Math.abs(anchorOverlap - desiredAnchorOverlap) * 38;
  return (
    foreignOverlap * 1800 +
    anchorGap * 2600 +
    overlapPenalty -
    near * 220 +
    centerDx * centerDx +
    centerDy * centerDy +
    edgePenalty +
    rng() * 4
  );
}

export function chooseCaveAnchorRegion(region, placed, graph, seed) {
  const connectedIds = graph
    .filter((edge) => edge.from === region.id || edge.to === region.id)
    .map((edge) => (edge.from === region.id ? edge.to : edge.from));
  const connectedPlaced = placed.filter((candidate) =>
    connectedIds.includes(candidate.id),
  );
  if (connectedPlaced.length > 0) {
    return connectedPlaced.sort(
      (a, b) =>
        getRectGap(a.cellRect, { x: 0, y: 0, w: 0, h: 0 }) -
        getRectGap(b.cellRect, { x: 0, y: 0, w: 0, h: 0 }),
    )[
      hashStringToSeed(seed, region.id, "cave-anchor") % connectedPlaced.length
    ];
  }
  return (
    placed[
      hashStringToSeed(seed, region.id, "fallback-cave-anchor") % placed.length
    ] || null
  );
}

export function chooseCavePlacement(
  region,
  size,
  anchor,
  placed,
  config,
  rng,
  index,
) {
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const center = { x: gridW * 0.48, y: gridH * 0.5 };
  const margin = 2;
  const directionSeed = hashStringToSeed(
    config.seed,
    region.id,
    "cave-direction",
  );
  const baseDirections = [
    "east",
    "south",
    "north",
    "west",
    "south-east",
    "north-east",
    "south-west",
    "north-west",
  ];
  const directions = [...baseDirections].sort(
    (a, b) =>
      hashStringToSeed(directionSeed, a) - hashStringToSeed(directionSeed, b),
  );
  const offsets = [0, -1, 1, -2, 2, -3, 3];
  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;

  directions.forEach((direction) => {
    offsets.forEach((offset) => {
      const raw = createAdjacentCaveCandidate(
        anchor.cellRect,
        size,
        direction,
        offset,
      );
      const candidate = {
        ...raw,
        x: clamp(raw.x, margin, gridW - size.w - margin),
        y: clamp(raw.y, margin, gridH - size.h - margin),
      };
      const score = scoreCavePlacementCandidate(
        candidate,
        anchor.cellRect,
        placed,
        center,
        gridW,
        gridH,
        rng,
      );
      if (score < bestScore) {
        best = candidate;
        bestScore = score;
      }
    });
  });

  if (best && isAcceptableCavePlacement(best, anchor.cellRect, placed))
    return best;

  const spiralRadius = 2 + Math.floor(index / 2);
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const angle = (attempt / 18) * Math.PI * 2 + (directionSeed % 100) / 100;
    const radius = spiralRadius + Math.floor(attempt / 18);
    const candidate = {
      x: clamp(
        Math.round(center.x + Math.cos(angle) * radius - size.w / 2),
        margin,
        gridW - size.w - margin,
      ),
      y: clamp(
        Math.round(center.y + Math.sin(angle) * radius * 0.78 - size.h / 2),
        margin,
        gridH - size.h - margin,
      ),
      ...size,
    };
    if (isAcceptableCavePlacement(candidate, anchor.cellRect, placed))
      return candidate;
  }

  return best || { x: margin, y: margin, ...size };
}

export function placeCaveRegions(config, graph, rng, profile) {
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const placed = [];
  const rolePriority = {
    entrance: 0,
    connector: 1,
    clue: 2,
    hazard: 3,
    side: 4,
    final: 5,
    secret: 6,
  };
  const ordered = [...config.regions].sort((a, b) => {
    return (
      (rolePriority[getPlacementRole(a)] ?? 4) -
        (rolePriority[getPlacementRole(b)] ?? 4) ||
      roleDepth(a) - roleDepth(b) ||
      a.id.localeCompare(b.id)
    );
  });
  const singleCaveRegion = ordered.length <= 1;

  if (singleCaveRegion) {
    const region = ordered[0];
    if (!region) return [];
    const size = resolveCaveRoomSize(region, rng, config);
    const xBias = randomInt(rng, -3, 3);
    const yBias = randomInt(rng, -2, 2);
    const cellRect = {
      x: clamp(
        Math.round(gridW / 2 - size.w / 2 + xBias),
        3,
        gridW - size.w - 3,
      ),
      y: clamp(
        Math.round(gridH / 2 - size.h / 2 + yBias),
        3,
        gridH - size.h - 3,
      ),
      ...size,
    };
    return [
      createPlacedRegion(region, "cave", cellRect, config, profile.key, 1),
    ];
  }

  const adjacency = getGraphAdjacency(graph);
  const maxDepth = Math.max(
    1,
    ...config.regions.map((region) =>
      Number.isFinite(region.graphDepth)
        ? region.graphDepth
        : roleDepth(region),
    ),
  );
  const margin = 3;

  ordered.forEach((region, index) => {
    const size = resolveCaveRoomSize(region, rng, config);
    const shape = chooseRoomShape(region, profile.key);
    const target = getContextualTarget(
      region,
      size,
      config,
      graph,
      placed,
      rng,
      profile,
      adjacency,
      maxDepth,
    );
    const maxX = Math.max(margin, gridW - size.w - margin);
    const maxY = Math.max(margin, gridH - size.h - margin);
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let attempt = 0; attempt < 520; attempt += 1) {
      const radius = Math.floor(attempt / 18);
      const candidate = {
        x: clamp(
          Math.round(target.x) + randomInt(rng, -radius - 1, radius + 1),
          margin,
          maxX,
        ),
        y: clamp(
          Math.round(target.y) + randomInt(rng, -radius - 1, radius + 1),
          margin,
          maxY,
        ),
        ...size,
      };
      const overlap = placed.some((room) =>
        rectsOverlapWithMargin(candidate, room.cellRect, 2),
      );
      const nearCount = placed.filter((room) =>
        rectsOverlapWithMargin(candidate, room.cellRect, 5),
      ).length;
      const dx = candidate.x - target.x;
      const dy = candidate.y - target.y;
      const score =
        dx * dx + dy * dy + (overlap ? 100000 : 0) + nearCount * 72 + rng() * 3;
      if (score < bestScore) {
        best = candidate;
        bestScore = score;
      }
      if (!overlap && nearCount <= 1 && attempt > 18) break;
    }

    const cellRect = best || {
      x: clamp(margin + index * 3, margin, maxX),
      y: clamp(Math.round(gridH / 2 - size.h / 2), margin, maxY),
      ...size,
    };
    placed.push(
      createPlacedRegion(
        region,
        shape,
        cellRect,
        config,
        profile.key,
        placed.length + 1,
      ),
    );
  });

  return config.regions
    .map((region) =>
      placed.find((placedRegion) => placedRegion.id === region.id),
    )
    .filter(Boolean);
}

export function placeRegions(config, graph, rng) {
  const profile = getPlacementProfile(config);
  if (profile.key === "chapel")
    return placeChapelRegions(config, graph, rng, profile);
  if (profile.key === "noble-house")
    return placeNobleHouseRegions(config, graph, rng, profile);
  if (profile.key === "cave")
    return placeCaveRegions(config, graph, rng, profile);
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const margin = 3;
  const placed = [];
  const adjacency = getGraphAdjacency(graph);
  const maxDepth = Math.max(
    1,
    ...config.regions.map((region) =>
      Number.isFinite(region.graphDepth)
        ? region.graphDepth
        : roleDepth(region),
    ),
  );
  const orderedRegions = [...config.regions].sort((a, b) => {
    const roleWeight = {
      entrance: 0,
      connector: 1,
      clue: 2,
      hazard: 3,
      side: 4,
      final: 5,
      secret: 6,
    };
    return (
      (roleWeight[getPlacementRole(a)] ?? 4) -
        (roleWeight[getPlacementRole(b)] ?? 4) ||
      roleDepth(a) - roleDepth(b) ||
      a.id.localeCompare(b.id)
    );
  });

  orderedRegions.forEach((region, index) => {
    const size = resolveRoomSize(region, rng, config);
    const shape = chooseRoomShape(region, profile.key);
    const maxX = Math.max(margin, gridW - size.w - margin);
    const maxY = Math.max(margin, gridH - size.h - margin);
    const target = getContextualTarget(
      region,
      size,
      config,
      graph,
      placed,
      rng,
      profile,
      adjacency,
      maxDepth,
    );
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let attempt = 0; attempt < 420; attempt += 1) {
      const radius = Math.floor(attempt / 14);
      const candidate = {
        id: region.id,
        x: clamp(
          Math.round(target.x) + randomInt(rng, -radius - 1, radius + 1),
          margin,
          maxX,
        ),
        y: clamp(
          Math.round(target.y) + randomInt(rng, -radius - 1, radius + 1),
          margin,
          maxY,
        ),
        w: size.w,
        h: size.h,
      };
      const score = scorePlacementCandidate(
        candidate,
        target,
        placed,
        graph,
        region,
        profile,
      );
      if (score < bestScore) {
        best = candidate;
        bestScore = score;
      }
      if (
        !placed.some((room) =>
          rectsOverlapWithMargin(candidate, room.cellRect, 2),
        )
      )
        break;
    }

    const cellRect = best;
    placed.push(
      createPlacedRegion(
        region,
        shape,
        cellRect,
        config,
        profile.key,
        index + 1,
      ),
    );
  });

  return config.regions
    .map((region) =>
      placed.find((placedRegion) => placedRegion.id === region.id),
    )
    .filter(Boolean);
}

export function centerAutoPlacedRegions(regions, config) {
  if (!Array.isArray(regions) || regions.length === 0) return regions;

  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const margin = 3;
  const rects = regions
    .map((region) => region.cellRect)
    .filter(Boolean);

  if (rects.length === 0) return regions;

  const minX = Math.min(...rects.map((rect) => rect.x));
  const minY = Math.min(...rects.map((rect) => rect.y));
  const maxX = Math.max(...rects.map((rect) => rect.x + rect.w));
  const maxY = Math.max(...rects.map((rect) => rect.y + rect.h));
  const width = maxX - minX;
  const height = maxY - minY;

  const desiredMinX = Math.round((gridW - width) / 2);
  const desiredMinY = Math.round((gridH - height) / 2);
  const shiftX = clamp(
    desiredMinX - minX,
    margin - minX,
    gridW - margin - maxX,
  );
  const shiftY = clamp(
    desiredMinY - minY,
    margin - minY,
    gridH - margin - maxY,
  );

  if (shiftX === 0 && shiftY === 0) return regions;

  return regions.map((region) => {
    if (!region.cellRect) return region;
    const cellRect = {
      ...region.cellRect,
      x: region.cellRect.x + shiftX,
      y: region.cellRect.y + shiftY,
    };
    return {
      ...region,
      cellRect,
      labelPoint: {
        x: (cellRect.x + cellRect.w / 2) * config.gridSize,
        y: (cellRect.y + cellRect.h / 2) * config.gridSize,
      },
    };
  });
}

export function applyManualRoomPositions(regions, config) {
  const manualPositions = config.manualRoomPositions || {};
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);

  return regions.map((region) => {
    const position = manualPositions[region.id];
    if (!position) return region;
    const cellRect = {
      ...region.cellRect,
      x: clamp(
        Math.round(position.x),
        1,
        Math.max(1, gridW - region.cellRect.w - 1),
      ),
      y: clamp(
        Math.round(position.y),
        1,
        Math.max(1, gridH - region.cellRect.h - 1),
      ),
    };
    return {
      ...region,
      cellRect,
      labelPoint: {
        x: (cellRect.x + cellRect.w / 2) * config.gridSize,
        y: (cellRect.y + cellRect.h / 2) * config.gridSize,
      },
    };
  });
}

function getManualRoomStyleShape(region, style = {}) {
  return String(
    style.shape ||
      getRoomDesignShape(!style.shape ? region.roomDesign : null) ||
      region.shape ||
      region.preferredShape ||
      "",
  ).toLowerCase();
}

function isRoundRoomStyle(region, style = {}) {
  const shape = getManualRoomStyleShape(region, style);
  return (
    shape === "circle" ||
    shape === "shaft" ||
    shape === "oval" ||
    shape.includes("circle") ||
    shape.includes("circular") ||
    shape.includes("round") ||
    shape.includes("shaft") ||
    shape.includes("well")
  );
}

function normalizeManualDimension(value, fallback, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return clamp(Math.round(fallback), min, max);
  return clamp(Math.round(numeric), min, max);
}

function resolveManualRoomSize(region, style = {}, config = DEFAULT_CONFIG) {
  const gridW = Math.max(4, Math.floor(config.mapWidth / config.gridSize));
  const gridH = Math.max(4, Math.floor(config.mapHeight / config.gridSize));
  const maxW = Math.max(2, gridW - 2);
  const maxH = Math.max(2, gridH - 2);
  const customSize =
    style.customSize && typeof style.customSize === "object"
      ? style.customSize
      : null;

  if (style.sizePreset === "Custom") {
    if (isRoundRoomStyle(region, style)) {
      const fallbackRadius = Math.max(1.5, Math.min(region.cellRect.w, region.cellRect.h) / 2);
      const radius = Number(customSize?.radiusCells ?? customSize?.radius);
      const diameter = normalizeManualDimension(
        Number.isFinite(radius) ? radius * 2 : null,
        fallbackRadius * 2,
        3,
        Math.min(maxW, maxH),
      );
      return { w: diameter, h: diameter, label: "Custom" };
    }
    return {
      w: normalizeManualDimension(
        customSize?.widthCells ?? customSize?.w ?? customSize?.width,
        region.cellRect.w,
        2,
        maxW,
      ),
      h: normalizeManualDimension(
        customSize?.heightCells ?? customSize?.h ?? customSize?.height,
        region.cellRect.h,
        2,
        maxH,
      ),
      label: "Custom",
    };
  }

  const preset = ROOM_SIZE_MENU_PRESETS[style.sizePreset];
  if (!preset) return null;
  if (isRoundRoomStyle(region, style)) {
    const diameter = normalizeManualDimension(
      preset.circleD || Math.max(preset.w, preset.h),
      Math.max(preset.w, preset.h),
      3,
      Math.min(maxW, maxH),
    );
    return { w: diameter, h: diameter, label: style.sizePreset };
  }
  const shapeAdjustedPreset = getShapeAdjustedRoomSize(
    { w: preset.w, h: preset.h },
    {
      ...region,
      ...(style.shape
        ? { shape: style.shape, preferredShape: style.shape }
        : {}),
    },
    style.shape ? null : region.roomDesign,
  );
  return {
    w: normalizeManualDimension(shapeAdjustedPreset.w, preset.w, 2, maxW),
    h: normalizeManualDimension(shapeAdjustedPreset.h, preset.h, 2, maxH),
    label: style.sizePreset,
  };
}

export function resizeRoomAroundCenter(region, sizePreset, config, style = null) {
  const effectiveStyle = { ...(style || {}), sizePreset };
  const size = resolveManualRoomSize(region, effectiveStyle, config);
  if (!size) return region;
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const centerX = region.cellRect.x + region.cellRect.w / 2;
  const centerY = region.cellRect.y + region.cellRect.h / 2;
  const cellRect = {
    ...region.cellRect,
    w: size.w,
    h: size.h,
    x: clamp(
      Math.round(centerX - size.w / 2),
      1,
      Math.max(1, gridW - size.w - 1),
    ),
    y: clamp(
      Math.round(centerY - size.h / 2),
      1,
      Math.max(1, gridH - size.h - 1),
    ),
  };
  return {
    ...region,
    size: size.label || sizePreset,
    cellRect,
    labelPoint: {
      x: (cellRect.x + cellRect.w / 2) * config.gridSize,
      y: (cellRect.y + cellRect.h / 2) * config.gridSize,
    },
  };
}

function withRoomCellRect(region, cellRect, config) {
  return {
    ...region,
    cellRect,
    labelPoint: {
      x: (cellRect.x + cellRect.w / 2) * config.gridSize,
      y: (cellRect.y + cellRect.h / 2) * config.gridSize,
    },
  };
}

function resolveNonOverlappingManualResize(region, resized, regions, config) {
  const gridW = Math.floor(config.mapWidth / config.gridSize);
  const gridH = Math.floor(config.mapHeight / config.gridSize);
  const overlaps = (cellRect) =>
    regions.some(
      (otherRegion) =>
        otherRegion.id !== region.id &&
        rectsOverlapWithMargin(cellRect, otherRegion.cellRect, 0),
    );
  if (!overlaps(resized.cellRect)) return resized;

  const base = resized.cellRect;
  const maxShift = 5;
  const shifts = [];
  for (let radius = 1; radius <= maxShift; radius += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        shifts.push({ dx, dy });
      }
    }
  }

  for (const shift of shifts) {
    const cellRect = {
      ...base,
      x: clamp(base.x + shift.dx, 1, Math.max(1, gridW - base.w - 1)),
      y: clamp(base.y + shift.dy, 1, Math.max(1, gridH - base.h - 1)),
    };
    if (!overlaps(cellRect)) return withRoomCellRect(resized, cellRect, config);
  }

  return region;
}

export function applyRoomSizeOverrides(regions, config) {
  const styles = config.manualRoomStyles || {};
  return regions.map((region) => {
    const style = styles[region.id];
    const sizePreset = style?.sizePreset;
    if (!sizePreset) return region;
    const resized = resizeRoomAroundCenter(region, sizePreset, config, style);
    return resolveNonOverlappingManualResize(region, resized, regions, config);
  });
}

export function applyRoomStyleOverrides(regions, config) {
  const styles = config.manualRoomStyles || {};
  const contextKey = getContextKey(config.context || config.biome);
  const supportsCavernStyles = contextKey === "cave" || contextKey === "mine";
  return regions.map((region) => {
    const style = styles[region.id];
    if (!style) return region;
    let shape = style.shape || region.shape;
    let surfaceKind = style.surfaceKind || region.surfaceKind;
    if (
      !supportsCavernStyles &&
      (shape === "cave" || surfaceKind === "cave" || surfaceKind === "hybrid")
    ) {
      shape = "rect";
      surfaceKind = "structure";
    }
    const generatedShape = region.shape || "rect";
    const generatedRoomType = region.roomType || "none";
    const shapeWasExplicitlyChanged =
      Boolean(style.shape) && style.shape !== generatedShape;
    const roomTypeWasExplicitlyChanged =
      Boolean(style.roomType) && style.roomType !== generatedRoomType;
    const preservedShapeOptions = shapeWasExplicitlyChanged || roomTypeWasExplicitlyChanged
      ? Object.fromEntries(
          Object.entries(region.shapeOptions || {}).filter(
            ([key]) =>
              ![
                "archetypeId",
                "archetypeLabel",
                "detailProfile",
                "maskProfile",
                "roomDesign",
                "roomDesignPresetId",
                "roomDesignSchemaVersion",
              ].includes(key),
          ),
        )
      : { ...(region.shapeOptions || {}) };
    return {
      ...region,
      shape,
      surfaceKind,
      roomType: style.roomType || region.roomType || "none",
      shapeOptions: {
        ...preservedShapeOptions,
        sizePreset: style.sizePreset || null,
        customSize: style.customSize || null,
        roomType:
          style.roomType ||
          preservedShapeOptions.roomType ||
          region.roomType ||
          "none",
        notch:
          "notch" in style
            ? Boolean(style.notch)
            : Boolean(preservedShapeOptions.notch),
        ruined:
          "ruined" in style
            ? Boolean(style.ruined)
            : Boolean(preservedShapeOptions.ruined),
      },
    };
  });
}

export function formatMapLevel(level) {
  const numeric = Number(level);
  if (!Number.isFinite(numeric)) return "All";
  if (numeric > 0) return `+${numeric}`;
  return String(numeric);
}

export function getRegionLevel(region) {
  return Number.isFinite(region?.level) ? region.level : 0;
}

export function getAvailableMapLevels(generatedMap) {
  const levels = new Set();
  (generatedMap?.regions || []).forEach((region) =>
    levels.add(getRegionLevel(region)),
  );
  (generatedMap?.corridors || []).forEach((corridor) => {
    if (Number.isFinite(corridor.level)) levels.add(corridor.level);
    if (Number.isFinite(corridor.fromLevel)) levels.add(corridor.fromLevel);
    if (Number.isFinite(corridor.toLevel)) levels.add(corridor.toLevel);
  });
  return Array.from(levels).sort((a, b) => a - b);
}

export function normalizeLevelView(value, availableLevels = []) {
  if (
    value === LEVEL_VIEW_ALL ||
    value === null ||
    typeof value === "undefined"
  )
    return LEVEL_VIEW_ALL;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return LEVEL_VIEW_ALL;
  const rounded = Math.round(parsed);
  if (availableLevels.length > 0 && !availableLevels.includes(rounded))
    return LEVEL_VIEW_ALL;
  return rounded;
}

export function hasRenderableGeometry(generatedMap) {
  return Boolean(
    generatedMap?.regions?.length ||
    generatedMap?.corridors?.length ||
    generatedMap?.dungeonMask?.floorCells?.length,
  );
}
