import {
  classifyRegion,
  getRegionText,
  getPlacementProfile,
  getPlacementRole,
  roleDepth,
} from "./map-generator.profile.js";

function hashStringToSeed(...parts) {
  const text = parts.join("::");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getRegionGraphScore(region, seed) {
  const flags = classifyRegion(region);
  if (flags.entrance) return 0;
  if (flags.connector)
    return 16 + (hashStringToSeed(seed, region.id, "connector-order") % 8);
  if (flags.clue)
    return 28 + (hashStringToSeed(seed, region.id, "clue-order") % 8);
  if (flags.hazard)
    return 42 + (hashStringToSeed(seed, region.id, "hazard-order") % 10);
  if (flags.climax)
    return 70 + (hashStringToSeed(seed, region.id, "climax-order") % 8);
  if (flags.outcome || flags.exit) return 88;
  if (flags.secret) return 96;
  return 48 + (hashStringToSeed(seed, region.id, "neutral-order") % 12);
}

export function createGraphEdge(config, from, to, options = {}) {
  const baseId =
    options.id ||
    `edge-${from}-${to}${options.suffix ? `-${options.suffix}` : ""}`;
  return {
    id: baseId,
    from,
    to,
    kind: options.kind || "main",
    secret: Boolean(options.secret),
    locked: Boolean(options.locked),
    reason: options.reason || "generated",
    manualWaypoints: Array.isArray(config.manualCorridorWaypoints?.[baseId])
      ? config.manualCorridorWaypoints[baseId]
      : [],
  };
}

export function addGraphEdge(edges, config, from, to, options = {}) {
  if (!from || !to || from === to) return null;
  const duplicate = options.allowDuplicate
    ? null
    : edges.find(
        (edge) =>
          (edge.from === from && edge.to === to) ||
          (edge.from === to && edge.to === from),
      );
  if (duplicate) return duplicate;
  const edge = createGraphEdge(config, from, to, options);
  edges.push(edge);
  return edge;
}

export function selectRegionByFlags(regions, predicate, fallback, seed) {
  const candidates = regions
    .filter(predicate)
    .sort(
      (a, b) => getRegionGraphScore(a, seed) - getRegionGraphScore(b, seed),
    );
  return candidates[0] || fallback || regions[0];
}

export function getFinalRegionPriority(region, seed) {
  const flags = classifyRegion(region);
  const text = getRegionText(region);
  let score = getRegionGraphScore(region, seed);
  if (flags.outcome) score += 80;
  if (flags.exit) score += 70;
  if (
    text.includes("final") ||
    text.includes("boss") ||
    text.includes("climax")
  )
    score += 60;
  if (text.includes("main")) score += 50;
  if (text.includes("setpiece")) score += 30;
  if (flags.hazard) score -= 8;
  return score;
}

export function selectFinalRegion(regions, seed) {
  const candidates = regions.filter((region) => {
    const flags = classifyRegion(region);
    return flags.outcome || flags.exit || flags.climax;
  });
  const pool = candidates.length > 0 ? candidates : regions;
  return (
    [...pool].sort(
      (a, b) =>
        getFinalRegionPriority(b, seed) - getFinalRegionPriority(a, seed),
    )[0] || null
  );
}

export function buildCriticalPathRegions(config, rng) {
  const regions = [...config.regions];
  if (regions.length === 0) return [];
  const flagsById = new Map(
    regions.map((region) => [region.id, classifyRegion(region)]),
  );
  const entrance = selectRegionByFlags(
    regions,
    (region) => flagsById.get(region.id).entrance,
    regions[0],
    config.seed,
  );
  const nonEntrance = regions.filter((region) => region.id !== entrance.id);
  const nonSecret = nonEntrance.filter(
    (region) => !flagsById.get(region.id).secret,
  );
  const finalRoom =
    selectFinalRegion(nonSecret, config.seed) ||
    [...nonSecret].sort(
      (a, b) =>
        getRegionGraphScore(b, config.seed) -
        getRegionGraphScore(a, config.seed),
    )[0];
  const middlePool = nonSecret.filter((region) => region.id !== finalRoom?.id);
  const required = [];
  const firstConnector = selectRegionByFlags(
    middlePool,
    (region) => flagsById.get(region.id).connector,
    null,
    config.seed,
  );
  const firstClue = selectRegionByFlags(
    middlePool,
    (region) => flagsById.get(region.id).clue,
    null,
    config.seed,
  );
  const firstHazard = selectRegionByFlags(
    middlePool,
    (region) => flagsById.get(region.id).hazard,
    null,
    config.seed,
  );
  [firstConnector, firstClue, firstHazard].forEach((region) => {
    if (region && !required.some((item) => item.id === region.id))
      required.push(region);
  });

  const remaining = middlePool
    .filter((region) => !required.some((item) => item.id === region.id))
    .sort(
      (a, b) =>
        getRegionGraphScore(a, config.seed) -
        getRegionGraphScore(b, config.seed),
    );
  const mainBudget = Math.max(
    0,
    Math.ceil(nonSecret.length * 0.68) - required.length - (finalRoom ? 1 : 0),
  );
  const mainExtras = remaining.slice(0, mainBudget);
  const orderedMiddle = [...required, ...mainExtras].sort(
    (a, b) =>
      getRegionGraphScore(a, config.seed) - getRegionGraphScore(b, config.seed),
  );
  return [entrance, ...orderedMiddle, finalRoom].filter(Boolean);
}

export function chooseSideAnchor(mainPath, sideRegion, seed) {
  const flags = classifyRegion(sideRegion);
  const usable =
    mainPath.slice(0, -1).length > 0 ? mainPath.slice(0, -1) : mainPath;
  if (flags.clue) return usable[Math.min(1, usable.length - 1)] || usable[0];
  if (flags.hazard) return usable[Math.min(2, usable.length - 1)] || usable[0];
  if (flags.connector || flags.loop)
    return usable[Math.max(0, Math.floor(usable.length / 2))] || usable[0];
  const index =
    hashStringToSeed(seed, sideRegion.id, "side-anchor") %
    Math.max(1, usable.length);
  return usable[index];
}

export function chooseSecretAnchor(mainPath, secretRegion, seed) {
  const clueAnchor = mainPath.find((region) => classifyRegion(region).clue);
  const hazardAnchor = mainPath.find((region) => classifyRegion(region).hazard);
  const deepAnchor = mainPath[Math.max(0, mainPath.length - 2)];
  return clueAnchor || hazardAnchor || deepAnchor || mainPath[0];
}

export function parseRegionLink(link) {
  if (typeof link === "string") return { to: link, kind: "link" };
  if (!link || typeof link !== "object") return null;
  return {
    to: link.to || link.id || link.regionId,
    kind: link.kind || link.type || "link",
    secret: Boolean(link.secret),
    locked: Boolean(link.locked),
    id: link.id,
  };
}

export function buildRegionGraph(config, rng) {
  const profile = getPlacementProfile(config);
  const regionIds = new Set(config.regions.map((region) => region.id));
  const edges = [];

  if (config.connections.length > 0) {
    config.connections
      .filter(
        (edge) =>
          regionIds.has(edge.from) &&
          regionIds.has(edge.to) &&
          edge.from !== edge.to,
      )
      .forEach((edge, index) => {
        const id = edge.id || `edge-${edge.from}-${edge.to}-${index}`;
        edges.push({
          id,
          from: edge.from,
          to: edge.to,
          kind: edge.kind || "main",
          secret: Boolean(edge.secret),
          locked: Boolean(edge.locked),
          reason: edge.reason || "explicit-connection",
          manualWaypoints: Array.isArray(config.manualCorridorWaypoints?.[id])
            ? config.manualCorridorWaypoints[id]
            : Array.isArray(edge.manualWaypoints)
              ? edge.manualWaypoints
              : [],
        });
      });
  }

  const mainPath = buildCriticalPathRegions(config, rng);
  for (let index = 0; index < mainPath.length - 1; index += 1) {
    addGraphEdge(edges, config, mainPath[index].id, mainPath[index + 1].id, {
      kind: "critical",
      reason: "critical-path",
    });
  }

  const mainPathIds = new Set(mainPath.map((region) => region.id));
  const unassigned = config.regions.filter(
    (region) => !mainPathIds.has(region.id),
  );
  const secretRegions = unassigned.filter(
    (region) => classifyRegion(region).secret,
  );
  const sideRegions = unassigned.filter(
    (region) => !classifyRegion(region).secret,
  );

  sideRegions.forEach((region) => {
    const anchor = chooseSideAnchor(mainPath, region, config.seed);
    if (!anchor) return;
    const flags = classifyRegion(region);
    addGraphEdge(edges, config, anchor.id, region.id, {
      kind: flags.loop || flags.connector ? "side" : "dead-end",
      suffix: flags.loop ? "side-loop-entry" : "side",
      reason: flags.loop ? "side-loop-entry" : "controlled-side-path",
    });
    if (flags.loop && mainPath.length > 2 && rng() < profile.sideLoopChance) {
      const anchorIndex = mainPath.findIndex((item) => item.id === anchor.id);
      const exitAnchor =
        mainPath[
          clamp(
            anchorIndex +
              1 +
              (hashStringToSeed(config.seed, region.id, "loop-exit") % 2),
            1,
            mainPath.length - 1,
          )
        ];
      if (exitAnchor) {
        addGraphEdge(edges, config, region.id, exitAnchor.id, {
          kind: "loop",
          suffix: "loop-exit",
          reason: "intentional-loop",
        });
      }
    }
  });

  secretRegions.forEach((region) => {
    const anchor = chooseSecretAnchor(mainPath, region, config.seed);
    if (!anchor) return;
    addGraphEdge(edges, config, anchor.id, region.id, {
      kind: "secret",
      secret: true,
      suffix: "secret",
      reason: "secret-branch",
    });
  });

  config.regions.forEach((region) => {
    region.links.forEach((rawLink, index) => {
      const link = parseRegionLink(rawLink);
      if (!link || !regionIds.has(link.to) || link.to === region.id) return;
      addGraphEdge(edges, config, region.id, link.to, {
        id: link.id || `edge-${region.id}-${link.to}-link-${index}`,
        kind: link.kind,
        secret: link.secret,
        locked: link.locked,
        reason: "region-link",
      });
    });
  });

  const loopBudget = Math.max(
    0,
    Math.floor((config.regions.length / 6) * profile.loopBudgetMultiplier),
  );
  for (let i = 0; i < loopBudget && mainPath.length > 4; i += 1) {
    const fromIndex =
      1 +
      (hashStringToSeed(config.seed, i, "loop-a") %
        Math.max(1, mainPath.length - 3));
    const toIndex = clamp(
      fromIndex + 2 + (hashStringToSeed(config.seed, i, "loop-b") % 2),
      fromIndex + 1,
      mainPath.length - 1,
    );
    addGraphEdge(edges, config, mainPath[fromIndex].id, mainPath[toIndex].id, {
      kind: "loop",
      suffix: `main-loop-${i}`,
      reason: "intentional-main-loop",
    });
  }

  return edges;
}

export function buildCorridorGraph(config, rng) {
  return buildRegionGraph(config, rng);
}

export function buildChapelPhysicalGraph(config) {
  const edges = [];
  const regions = [...config.regions];
  if (regions.length <= 1) return edges;
  const roleWeight = {
    entrance: 0,
    connector: 1,
    clue: 2,
    hazard: 3,
    side: 4,
    final: 5,
    secret: 6,
  };
  const ordered = [...regions].sort(
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
  const naveRegion =
    ordered.find(
      (region) =>
        getPlacementRole(region) === "connector" &&
        region.id !== entrance?.id &&
        region.id !== finalRoom?.id,
    ) ||
    ordered.find(
      (region) => region.id !== entrance?.id && region.id !== finalRoom?.id,
    ) ||
    entrance;

  if (entrance && naveRegion && entrance.id !== naveRegion.id) {
    addGraphEdge(edges, config, entrance.id, naveRegion.id, {
      kind: "critical",
      reason: "chapel-narthex-to-nave",
    });
  }
  if (naveRegion && finalRoom && naveRegion.id !== finalRoom.id) {
    addGraphEdge(edges, config, naveRegion.id, finalRoom.id, {
      kind: "critical",
      reason: "chapel-nave-to-sanctuary",
    });
  }

  regions
    .filter(
      (region) =>
        ![entrance?.id, naveRegion?.id, finalRoom?.id].includes(region.id),
    )
    .forEach((region) => {
      const role = getPlacementRole(region);
      const anchor = role === "secret" ? finalRoom : naveRegion;
      if (!anchor || anchor.id === region.id) return;
      addGraphEdge(edges, config, anchor.id, region.id, {
        kind: role === "secret" ? "secret" : "side",
        secret: role === "secret",
        suffix: role === "secret" ? "chapel-secret" : "chapel-side",
        reason:
          role === "secret" ? "chapel-hidden-sacristy" : "chapel-side-chamber",
      });
    });

  config.regions.forEach((region) => {
    region.links.forEach((rawLink, index) => {
      const link = parseRegionLink(rawLink);
      if (
        !link ||
        !regions.some((item) => item.id === link.to) ||
        link.to === region.id
      )
        return;
      addGraphEdge(edges, config, region.id, link.to, {
        id: link.id || `edge-${region.id}-${link.to}-link-${index}`,
        kind: link.kind,
        secret: link.secret,
        locked: link.locked,
        reason: "region-link",
      });
    });
  });

  return edges;
}


function getContextGraphAdapterMode(config = {}) {
  const rawMode =
    config.contextGraphAdapterMode ||
    config.dungeonBrief?.contextGraphAdapterMode ||
    config.normalizedMapRequest?.contextGraphAdapterMode ||
    config.normalizedMapRequest?.metadata?.contextGraphAdapterMode ||
    "off";
  const mode = String(rawMode || "off").trim().toLowerCase();
  if (mode === "enabled" || mode === "true" || mode === "adapter") return "hard";
  if (mode === "noble house") return "noble-house";
  return mode || "off";
}

function shouldUseContextGraphAdapter(config = {}, adapterKey = "") {
  const mode = getContextGraphAdapterMode(config);
  if (mode === "off" || mode === "metadata" || mode === "soft") return false;
  if (mode === "hard" || mode === "all") return true;
  return mode === adapterKey;
}

function getOrderedContextRegions(config) {
  return [...(Array.isArray(config.regions) ? config.regions : [])].sort(
    (a, b) =>
      roleDepth(a) - roleDepth(b) ||
      getRegionGraphScore(a, config.seed) - getRegionGraphScore(b, config.seed) ||
      String(a.id || "").localeCompare(String(b.id || "")),
  );
}

function selectContextEntrance(regions, fallback = null) {
  return regions.find((region) => getPlacementRole(region) === "entrance") || fallback || regions[0] || null;
}

function selectContextFinal(regions, fallback = null) {
  return (
    [...regions].reverse().find((region) => getPlacementRole(region) === "final") ||
    fallback ||
    regions[regions.length - 1] ||
    null
  );
}

function addContextPath(edges, config, path, options = {}) {
  const usablePath = path.filter(Boolean);
  for (let index = 0; index < usablePath.length - 1; index += 1) {
    addGraphEdge(edges, config, usablePath[index].id, usablePath[index + 1].id, {
      kind: options.kind || "critical",
      suffix: `${options.suffix || "context-path"}-${index}`,
      reason: options.reason || "context-graph-path",
    });
  }
}

function addContextBranches(edges, config, rooms, anchors, options = {}) {
  const usableAnchors = anchors.filter(Boolean);
  if (!usableAnchors.length) return;
  rooms.filter(Boolean).forEach((region, index) => {
    const role = getPlacementRole(region);
    const anchor =
      role === "secret"
        ? usableAnchors[Math.max(0, usableAnchors.length - 1)]
        : usableAnchors[index % usableAnchors.length];
    if (!anchor || anchor.id === region.id) return;
    addGraphEdge(edges, config, anchor.id, region.id, {
      kind: role === "secret" ? "secret" : options.kind || "side",
      secret: role === "secret",
      suffix: `${options.suffix || "context-branch"}-${index}`,
      reason: options.reason || "context-graph-branch",
    });
  });
}

function isConnectedGraph(regions, edges) {
  if (!regions.length) return true;
  if (regions.length === 1) return true;
  if (edges.length < regions.length - 1) return false;

  const regionIds = new Set(regions.map((region) => region.id));
  const adjacency = new Map(regions.map((region) => [region.id, []]));
  for (const edge of edges) {
    if (!regionIds.has(edge.from) || !regionIds.has(edge.to) || edge.from === edge.to) return false;
    adjacency.get(edge.from)?.push(edge.to);
    adjacency.get(edge.to)?.push(edge.from);
  }

  const start = regions[0].id;
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    for (const next of adjacency.get(current) || []) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return seen.size === regions.length;
}

function validateContextGraph(regions, edges) {
  const regionIds = new Set(regions.map((region) => region.id));
  if (!Array.isArray(edges) || edges.length === 0) return [];
  const deduped = [];
  const seen = new Set();
  edges.forEach((edge) => {
    if (!edge?.from || !edge?.to || edge.from === edge.to) return;
    if (!regionIds.has(edge.from) || !regionIds.has(edge.to)) return;
    const key = [edge.from, edge.to].sort().join("::");
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(edge);
  });
  return isConnectedGraph(regions, deduped) ? deduped : [];
}

function buildCryptContextGraph(config) {
  const regions = getOrderedContextRegions(config);
  if (regions.length <= 1) return [];
  const entrance = selectContextEntrance(regions);
  const finalRoom = selectContextFinal(regions);
  const middle = regions.filter((region) => ![entrance?.id, finalRoom?.id].includes(region.id));
  const spine = [
    entrance,
    ...middle.filter((region) => ["connector", "clue", "hazard"].includes(getPlacementRole(region))).slice(0, 3),
    finalRoom,
  ].filter(Boolean);
  const spineIds = new Set(spine.map((region) => region.id));
  const edges = [];
  addContextPath(edges, config, spine, {
    suffix: "crypt-spine",
    reason: "crypt-spine-and-side-crypts",
  });
  addContextBranches(
    edges,
    config,
    regions.filter((region) => !spineIds.has(region.id)),
    spine.slice(1, -1).length ? spine.slice(1, -1) : spine,
    { suffix: "crypt-side", reason: "crypt-side-crypt" },
  );
  return validateContextGraph(regions, edges);
}

function buildMineContextGraph(config) {
  const regions = getOrderedContextRegions(config);
  if (regions.length <= 1) return [];
  const entrance = selectContextEntrance(regions);
  const finalRoom = selectContextFinal(regions);
  const middle = regions.filter((region) => ![entrance?.id, finalRoom?.id].includes(region.id));
  const trunk = [
    entrance,
    ...middle.filter((region) => ["connector", "hazard"].includes(getPlacementRole(region))).slice(0, 3),
    finalRoom,
  ].filter(Boolean);
  const trunkIds = new Set(trunk.map((region) => region.id));
  const edges = [];
  addContextPath(edges, config, trunk, {
    suffix: "mine-trunk",
    reason: "mine-trunk-and-extraction-branches",
  });
  addContextBranches(
    edges,
    config,
    regions.filter((region) => !trunkIds.has(region.id)),
    trunk.slice(0, -1),
    { suffix: "mine-branch", reason: "mine-extraction-branch" },
  );
  return validateContextGraph(regions, edges);
}

function buildRuinsContextGraph(config) {
  const regions = getOrderedContextRegions(config);
  if (regions.length <= 1) return [];
  const entrance = selectContextEntrance(regions);
  const finalRoom = selectContextFinal(regions);
  const middle = regions.filter((region) => ![entrance?.id, finalRoom?.id].includes(region.id));
  const main = [entrance, ...middle.slice(0, Math.min(3, middle.length)), finalRoom].filter(Boolean);
  const mainIds = new Set(main.map((region) => region.id));
  const edges = [];
  addContextPath(edges, config, main, {
    suffix: "ruins-broken-loop-path",
    reason: "ruins-broken-loop-path",
  });
  if (main.length >= 4) {
    addGraphEdge(edges, config, main[1].id, main[main.length - 1].id, {
      kind: "loop",
      suffix: "ruins-collapsed-shortcut",
      reason: "ruins-collapsed-shortcut",
    });
  }
  addContextBranches(
    edges,
    config,
    regions.filter((region) => !mainIds.has(region.id)),
    main.slice(1, -1).length ? main.slice(1, -1) : main,
    { suffix: "ruins-fragment", reason: "ruins-fragment-branch" },
  );
  return validateContextGraph(regions, edges);
}

function buildNobleHouseContextGraph(config) {
  const regions = getOrderedContextRegions(config);
  if (regions.length <= 1) return [];
  const entrance = selectContextEntrance(regions);
  const finalRoom = selectContextFinal(regions);
  const circulation =
    regions.find((region) => getPlacementRole(region) === "connector" && region.id !== entrance?.id) ||
    regions.find((region) => ![entrance?.id, finalRoom?.id].includes(region.id)) ||
    entrance;
  const edges = [];
  if (entrance && circulation && entrance.id !== circulation.id) {
    addGraphEdge(edges, config, entrance.id, circulation.id, {
      kind: "critical",
      suffix: "noble-house-entry-circulation",
      reason: "noble-house-entry-circulation",
    });
  }
  if (circulation && finalRoom && circulation.id !== finalRoom.id) {
    addGraphEdge(edges, config, circulation.id, finalRoom.id, {
      kind: "critical",
      suffix: "noble-house-circulation-climax",
      reason: "noble-house-circulation-climax",
    });
  }
  addContextBranches(
    edges,
    config,
    regions.filter((region) => ![entrance?.id, circulation?.id, finalRoom?.id].includes(region.id)),
    [circulation || entrance],
    { suffix: "noble-house-room", reason: "noble-house-room-off-circulation" },
  );
  return validateContextGraph(regions, edges);
}

function buildContextGraphAdapter(config, adapterKey) {
  if (adapterKey === "crypt") return buildCryptContextGraph(config);
  if (adapterKey === "mine") return buildMineContextGraph(config);
  if (adapterKey === "ruins") return buildRuinsContextGraph(config);
  if (adapterKey === "noble-house") return buildNobleHouseContextGraph(config);
  return [];
}

export function applyManualConnectionsToGraph(config, graph) {
  const deletedConnections = new Set(
    Array.isArray(config.manualDeletedConnections)
      ? config.manualDeletedConnections
      : [],
  );
  const edges = graph.filter((edge) => !deletedConnections.has(edge.id));
  const manualConnections = Array.isArray(config.manualCustomConnections)
    ? config.manualCustomConnections
    : [];
  manualConnections.forEach((connection, index) => {
    if (
      !connection?.from ||
      !connection?.to ||
      connection.from === connection.to ||
      deletedConnections.has(connection.id)
    )
      return;
    addGraphEdge(edges, config, connection.from, connection.to, {
      id:
        connection.id ||
        `manual-edge-${connection.from}-${connection.to}-${index}`,
      kind: "manual",
      reason: "manual-editor-connection",
      secret: Boolean(connection.secret),
      locked: true,
      allowDuplicate: true,
    });
  });
  return edges;
}

export function adaptGeneratedGraphForContext(config, graph) {
  const profile = getPlacementProfile(config);
  if (profile.key === "chapel") return buildChapelPhysicalGraph(config);

  if (shouldUseContextGraphAdapter(config, profile.key)) {
    const contextGraph = buildContextGraphAdapter(config, profile.key);
    if (contextGraph.length > 0) return contextGraph;
  }

  return graph;
}

export function adaptGraphForContext(config, graph) {
  return applyManualConnectionsToGraph(
    config,
    adaptGeneratedGraphForContext(config, graph),
  );
}

export function computeGraphDepths(regions, graph) {
  if (regions.length === 0) return new Map();
  const entrance =
    regions.find((region) => classifyRegion(region).entrance) || regions[0];
  const adjacency = new Map(regions.map((region) => [region.id, []]));
  graph.forEach((edge) => {
    adjacency.get(edge.from)?.push(edge.to);
    adjacency.get(edge.to)?.push(edge.from);
  });
  const depth = new Map([[entrance.id, 0]]);
  const queue = [entrance.id];
  while (queue.length > 0) {
    const current = queue.shift();
    const nextDepth = (depth.get(current) || 0) + 1;
    (adjacency.get(current) || []).forEach((neighbor) => {
      if (depth.has(neighbor)) return;
      depth.set(neighbor, nextDepth);
      queue.push(neighbor);
    });
  }
  regions.forEach((region) => {
    if (!depth.has(region.id)) depth.set(region.id, roleDepth(region));
  });
  return depth;
}

export function annotateRegionsWithGraphMetadata(regions, graph) {
  const depthMap = computeGraphDepths(regions, graph);
  const maxDepth = Math.max(1, ...Array.from(depthMap.values()));
  return regions.map((region) => {
    const rawDepth = depthMap.get(region.id) || 0;
    const flags = classifyRegion(region);
    const normalizedDepth = flags.secret
      ? 6
      : clamp(Math.round((rawDepth / maxDepth) * 5), 0, 5);
    return {
      ...region,
      graphDepth: normalizedDepth,
      graphRole: flags.secret
        ? "secret"
        : flags.climax || flags.outcome || flags.exit
          ? "final"
          : flags.hazard
            ? "hazard"
            : flags.clue
              ? "clue"
              : flags.connector
                ? "connector"
                : flags.entrance
                  ? "entrance"
                  : "side",
    };
  });
}

export function getGraphAdjacency(graph) {
  const adjacency = new Map();
  graph.forEach((edge) => {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);
    adjacency.get(edge.from).push({ id: edge.to, edge });
    adjacency.get(edge.to).push({ id: edge.from, edge });
  });
  return adjacency;
}

export function getEdgeEndpointForRegion(edge, regionId) {
  if (!edge || !regionId) return null;
  if (edge.from === regionId) return "from";
  if (edge.to === regionId) return "to";
  return null;
}

export function findGraphEdgeBetween(graph, fromRegionId, toRegionId) {
  return (
    graph.find(
      (edge) =>
        (edge.from === fromRegionId && edge.to === toRegionId) ||
        (edge.from === toRegionId && edge.to === fromRegionId),
    ) || null
  );
}
