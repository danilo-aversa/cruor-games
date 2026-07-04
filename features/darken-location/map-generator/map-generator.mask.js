import { DEFAULT_CONFIG } from "./map-generator.input.js";
import { getContextKey } from "./map-generator.profile.js";

function hashStringToSeed(...parts) {
  const text = parts.join("::");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRng(seed) {
  let state =
    typeof seed === "number" ? seed >>> 0 : hashStringToSeed(String(seed));
  return function rng() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickOne(rng, values) {
  return values[Math.floor(rng() * values.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export const ORTHOGONAL_DIRECTIONS = Object.freeze([
  Object.freeze({ dx: 1, dy: 0 }),
  Object.freeze({ dx: -1, dy: 0 }),
  Object.freeze({ dx: 0, dy: 1 }),
  Object.freeze({ dx: 0, dy: -1 }),
]);

export function cellKey(x, y) {
  return `${x},${y}`;
}

export function parseCellKey(key) {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
}

export function addRectCells(cells, x, y, w, h) {
  for (let cy = y; cy < y + h; cy += 1) {
    for (let cx = x; cx < x + w; cx += 1) {
      cells.add(cellKey(cx, cy));
    }
  }
}

export function removeRectCells(cells, x, y, w, h) {
  for (let cy = y; cy < y + h; cy += 1) {
    for (let cx = x; cx < x + w; cx += 1) {
      cells.delete(cellKey(cx, cy));
    }
  }
}

export function getLargestConnectedCellSet(cells) {
  const unvisited = new Set(cells);
  let best = new Set();

  while (unvisited.size > 0) {
    const start = unvisited.values().next().value;
    const component = new Set([start]);
    const queue = [start];
    unvisited.delete(start);

    while (queue.length > 0) {
      const current = parseCellKey(queue.shift());
      getCellNeighbors(current).forEach((neighbor) => {
        const key = cellKey(neighbor.x, neighbor.y);
        if (!unvisited.has(key)) return;
        unvisited.delete(key);
        component.add(key);
        queue.push(key);
      });
    }

    if (component.size > best.size) best = component;
  }

  return best;
}

export function ensureRoomMaskViable(cells, room) {
  const { x, y, w, h } = room.cellRect;
  if (cells.size === 0) {
    cells.add(cellKey(x + Math.floor(w / 2), y + Math.floor(h / 2)));
  }
  const connected = getLargestConnectedCellSet(cells);
  const minCells = Math.max(4, Math.floor(w * h * 0.38));
  if (connected.size < minCells) {
    const fallback = new Set();
    addRectCells(fallback, x, y, w, h);
    return fallback;
  }
  return connected;
}

export function carveCorner(cells, x, y, w, h, corner, notchW, notchH) {
  if (corner === "nw") removeRectCells(cells, x, y, notchW, notchH);
  if (corner === "ne")
    removeRectCells(cells, x + w - notchW, y, notchW, notchH);
  if (corner === "sw")
    removeRectCells(cells, x, y + h - notchH, notchW, notchH);
  if (corner === "se")
    removeRectCells(cells, x + w - notchW, y + h - notchH, notchW, notchH);
}

export function buildRectMask(room) {
  const cells = new Set();
  const { x, y, w, h } = room.cellRect;
  addRectCells(cells, x, y, w, h);
  return cells;
}

export function buildLShapeMask(room, rng) {
  const cells = buildRectMask(room);
  const { x, y, w, h } = room.cellRect;
  if (w < 3 || h < 3) return cells;
  const notchW = clamp(Math.floor(w * 0.38), 1, Math.max(1, w - 2));
  const notchH = clamp(Math.floor(h * 0.42), 1, Math.max(1, h - 2));
  carveCorner(
    cells,
    x,
    y,
    w,
    h,
    pickOne(rng, ["nw", "ne", "sw", "se"]),
    notchW,
    notchH,
  );
  return cells;
}

export function buildNotchedMask(room, rng) {
  const cells = buildRectMask(room);
  const { x, y, w, h } = room.cellRect;
  if (w < 3 || h < 3) return cells;
  const side = pickOne(rng, ["north", "south", "east", "west"]);
  const notchLength =
    side === "north" || side === "south"
      ? clamp(Math.floor(w * 0.32), 1, Math.max(1, w - 2))
      : clamp(Math.floor(h * 0.32), 1, Math.max(1, h - 2));
  const offsetMax =
    side === "north" || side === "south"
      ? Math.max(1, w - notchLength - 1)
      : Math.max(1, h - notchLength - 1);
  const offset = randomInt(rng, 1, offsetMax);
  if (side === "north") removeRectCells(cells, x + offset, y, notchLength, 1);
  if (side === "south")
    removeRectCells(cells, x + offset, y + h - 1, notchLength, 1);
  if (side === "west") removeRectCells(cells, x, y + offset, 1, notchLength);
  if (side === "east")
    removeRectCells(cells, x + w - 1, y + offset, 1, notchLength);
  if (w >= 7 && h >= 5 && rng() > 0.45) {
    carveCorner(
      cells,
      x,
      y,
      w,
      h,
      pickOne(rng, ["nw", "ne", "sw", "se"]),
      1,
      1,
    );
  }
  return cells;
}

export function buildRuinedMask(room, rng) {
  const cells = buildRectMask(room);
  const { x, y, w, h } = room.cellRect;
  if (w < 5 || h < 5) return buildNotchedMask(room, rng);
  const corners = ["nw", "ne", "sw", "se"]
    .sort(() => rng() - 0.5)
    .slice(0, randomInt(rng, 1, 2));
  corners.forEach((corner) =>
    carveCorner(
      cells,
      x,
      y,
      w,
      h,
      corner,
      randomInt(rng, 1, 2),
      randomInt(rng, 1, 2),
    ),
  );
  const breaks = randomInt(rng, 1, 3);
  for (let i = 0; i < breaks; i += 1) {
    const side = pickOne(rng, ["north", "south", "east", "west"]);
    if (side === "north")
      cells.delete(cellKey(randomInt(rng, x + 1, x + w - 2), y));
    if (side === "south")
      cells.delete(cellKey(randomInt(rng, x + 1, x + w - 2), y + h - 1));
    if (side === "west")
      cells.delete(cellKey(x, randomInt(rng, y + 1, y + h - 2)));
    if (side === "east")
      cells.delete(cellKey(x + w - 1, randomInt(rng, y + 1, y + h - 2)));
  }
  return cells;
}

export function buildAlcoveMask(room, rng) {
  const cells = buildRectMask(room);
  const { x, y, w, h } = room.cellRect;
  if (w < 3 || h < 3) return cells;
  const northFirst = rng() > 0.5;
  const step = w >= 7 ? 3 : 2;
  for (let cx = x + 1; cx < x + w - 1; cx += step) {
    const useNorth = ((cx - x) % 2 === 0) === northFirst;
    if (useNorth) cells.delete(cellKey(cx, y));
    else cells.delete(cellKey(cx, y + h - 1));
  }
  if (h >= 5 && w <= 5) {
    const cy = y + Math.floor(h / 2);
    if (rng() > 0.5) cells.delete(cellKey(x, cy));
    else cells.delete(cellKey(x + w - 1, cy));
  }
  return cells;
}

export function buildArchiveMask(room, rng) {
  const cells = buildRectMask(room);
  const { x, y, w, h } = room.cellRect;
  if (w < 3 || h < 3) return cells;
  const sideInset = rng() > 0.5 ? "vertical" : "horizontal";
  if (sideInset === "vertical") {
    for (let cy = y + 1; cy < y + h - 1; cy += 2) {
      cells.delete(cellKey(x, cy));
      if (w >= 6) cells.delete(cellKey(x + w - 1, cy));
    }
  } else {
    for (let cx = x + 1; cx < x + w - 1; cx += 2) {
      cells.delete(cellKey(cx, y));
      if (h >= 5) cells.delete(cellKey(cx, y + h - 1));
    }
  }
  return cells;
}

export function buildApseMask(room) {
  const cells = buildRectMask(room);
  const { x, y, w, h } = room.cellRect;
  if (w < 5 || h < 5) return cells;
  cells.delete(cellKey(x + w - 1, y));
  cells.delete(cellKey(x + w - 1, y + h - 1));
  if (h >= 7) {
    cells.delete(cellKey(x + w - 2, y));
    cells.delete(cellKey(x + w - 2, y + h - 1));
  }
  return cells;
}

export function buildHallMask(room, rng) {
  const cells = new Set();
  const { x, y, w, h } = room.cellRect;
  if (w >= h) {
    const hallH = clamp(Math.min(h, Math.max(2, Math.round(h * 0.58))), 1, h);
    const startY = y + Math.floor((h - hallH) / 2);
    addRectCells(cells, x, startY, w, hallH);
    if (h >= 4 && rng() > 0.5)
      cells.delete(cellKey(x + randomInt(rng, 0, Math.max(0, w - 1)), startY));
  } else {
    const hallW = clamp(Math.min(w, Math.max(2, Math.round(w * 0.58))), 1, w);
    const startX = x + Math.floor((w - hallW) / 2);
    addRectCells(cells, startX, y, hallW, h);
    if (w >= 4 && rng() > 0.5)
      cells.delete(cellKey(startX, y + randomInt(rng, 0, Math.max(0, h - 1))));
  }
  return cells;
}

export function buildOvalMask(room) {
  const cells = new Set();
  const { x, y, w, h } = room.cellRect;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = Math.max(1.8, w / 2);
  const ry = Math.max(1.8, h / 2);
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const nx = (xx + 0.5 - cx) / rx;
      const ny = (yy + 0.5 - cy) / ry;
      if (nx * nx + ny * ny <= 1.02) cells.add(cellKey(xx, yy));
    }
  }
  return cells;
}

export function buildCircleMask(room) {
  const cells = new Set();
  const { x, y, w, h } = room.cellRect;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const radius = Math.max(1.8, Math.min(w, h) / 2);
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const dx = xx + 0.5 - cx;
      const dy = yy + 0.5 - cy;
      if (dx * dx + dy * dy <= radius * radius * 1.015)
        cells.add(cellKey(xx, yy));
    }
  }
  return cells;
}


export function getRoomMaskProfile(room = {}) {
  return String(
    room.shapeOptions?.maskProfile ||
      room.shapeOptions?.archetypeId ||
      room.roomArchetype ||
      "",
  ).trim();
}

export function buildOssuaryGalleryMask(room, rng) {
  const cells = buildRectMask(room);
  const { x, y, w, h } = room.cellRect;
  if (w < 5 || h < 3) return buildAlcoveMask(room, rng);
  const horizontal = w >= h;
  const long = horizontal ? w : h;
  const start = 1;
  const end = Math.max(start, long - 1);
  for (let offset = start; offset < end; offset += 2) {
    const useNearSide = ((offset + Math.floor(rng() * 2)) % 2) === 0;
    if (horizontal) {
      const cx = x + offset;
      const cy = useNearSide ? y : y + h - 1;
      cells.delete(cellKey(cx, cy));
    } else {
      const cy = y + offset;
      const cx = useNearSide ? x : x + w - 1;
      cells.delete(cellKey(cx, cy));
    }
  }
  return cells;
}

export function buildReliquaryNicheMask(room, rng) {
  const cells = buildRectMask(room);
  const { x, y, w, h } = room.cellRect;
  if (w < 4 || h < 3) return buildAlcoveMask(room, rng);
  const horizontal = w >= h;
  const side = rng() > 0.5 ? "far" : "near";
  if (horizontal) {
    const cx = side === "near" ? x : x + w - 1;
    cells.delete(cellKey(cx, y));
    cells.delete(cellKey(cx, y + h - 1));
    if (h >= 5) cells.delete(cellKey(cx, y + Math.floor(h / 2)));
  } else {
    const cy = side === "near" ? y : y + h - 1;
    cells.delete(cellKey(x, cy));
    cells.delete(cellKey(x + w - 1, cy));
    if (w >= 5) cells.delete(cellKey(x + Math.floor(w / 2), cy));
  }
  return cells;
}

export function buildCharnelVaultMask(room, rng) {
  const cells = buildNotchedMask(room, rng);
  const { x, y, w, h } = room.cellRect;
  if (w < 5 || h < 4) return cells;
  const corners = ["nw", "ne", "sw", "se"];
  const first = pickOne(rng, corners);
  const opposite = { nw: "se", ne: "sw", sw: "ne", se: "nw" }[first];
  carveCorner(cells, x, y, w, h, first, 1, 1);
  if (w >= 7 && h >= 5) carveCorner(cells, x, y, w, h, opposite, 1, 1);
  return cells;
}

export function buildBurialCellMask(room, rng) {
  const cells = buildRectMask(room);
  const { x, y, w, h } = room.cellRect;
  if (w >= 5 && h >= 4 && rng() > 0.55) {
    const corner = pickOne(rng, ["nw", "ne", "sw", "se"]);
    carveCorner(cells, x, y, w, h, corner, 1, 1);
  }
  return cells;
}

export function buildHiddenReliquaryMask(room, rng) {
  const cells = buildArchiveMask(room, rng);
  const { x, y, w, h } = room.cellRect;
  if (w >= 6 && h >= 4) {
    const horizontal = w >= h;
    if (horizontal) {
      const cx = rng() > 0.5 ? x : x + w - 1;
      cells.delete(cellKey(cx, y + Math.floor(h / 2)));
    } else {
      const cy = rng() > 0.5 ? y : y + h - 1;
      cells.delete(cellKey(x + Math.floor(w / 2), cy));
    }
  }
  return cells;
}

export function buildArchetypeRoomMask(room, rng) {
  const profile = getRoomMaskProfile(room);
  if (profile === "ossuary-gallery") return buildOssuaryGalleryMask(room, rng);
  if (profile === "reliquary-niche") return buildReliquaryNicheMask(room, rng);
  if (profile === "charnel-vault") return buildCharnelVaultMask(room, rng);
  if (profile === "burial-cell" || profile === "crypt-burial-cell") return buildBurialCellMask(room, rng);
  if (profile === "hidden-reliquary") return buildHiddenReliquaryMask(room, rng);
  if (profile === "sealed-family-tomb") return buildRectMask(room);
  if (profile === "processional-crypt-hall") return buildHallMask(room, rng);
  if (profile === "bone-well") return buildOvalMask(room);
  return null;
}

export function buildCaveMask(room, rng) {
  const cells = new Set();
  const { x, y, w, h } = room.cellRect;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = Math.max(2.15, w / 2);
  const ry = Math.max(2.15, h / 2);
  const lobeCount = clamp(randomInt(rng, 2, 4), 2, 5);
  const biteCount = clamp(randomInt(rng, 1, 3), 1, 4);
  const lobes = Array.from({ length: lobeCount }, (_, index) => {
    const angle = rng() * Math.PI * 2;
    const distance = 0.28 + rng() * 0.42;
    return {
      x: cx + Math.cos(angle) * rx * distance,
      y: cy + Math.sin(angle) * ry * distance,
      rx: Math.max(1.35, rx * (0.28 + rng() * 0.24)),
      ry: Math.max(1.35, ry * (0.28 + rng() * 0.24)),
      weight: 0.16 + rng() * 0.18,
      index,
    };
  });
  const bites = Array.from({ length: biteCount }, (_, index) => {
    const side = pickOne(rng, ["north", "south", "east", "west"]);
    const horizontal = side === "north" || side === "south";
    return {
      side,
      x: horizontal
        ? x + 1 + rng() * Math.max(1, w - 2)
        : side === "west"
          ? x - 0.35
          : x + w + 0.35,
      y: horizontal
        ? side === "north"
          ? y - 0.35
          : y + h + 0.35
        : y + 1 + rng() * Math.max(1, h - 2),
      rx: Math.max(1.1, w * (0.14 + rng() * 0.16)),
      ry: Math.max(1.1, h * (0.14 + rng() * 0.16)),
      index,
    };
  });

  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const px = xx + 0.5;
      const py = yy + 0.5;
      const nx = (px - cx) / rx;
      const ny = (py - cy) / ry;
      const superEllipse =
        Math.pow(Math.abs(nx), 2.15) + Math.pow(Math.abs(ny), 2.05);
      const edgeNoise =
        ((hashStringToSeed(room.id, xx, yy, "cave-edge-noise") % 100) / 100 -
          0.5) *
        0.38;
      const grainNoise =
        ((hashStringToSeed(room.id, xx, yy, "cave-grain-noise") % 100) / 100 -
          0.5) *
        0.12;
      const lobeBoost = lobes.reduce((boost, lobe) => {
        const lx = (px - lobe.x) / lobe.rx;
        const ly = (py - lobe.y) / lobe.ry;
        const influence = Math.max(0, 1 - (lx * lx + ly * ly));
        return boost + influence * lobe.weight;
      }, 0);
      const biteCut = bites.some((bite) => {
        const bx = (px - bite.x) / bite.rx;
        const by = (py - bite.y) / bite.ry;
        return bx * bx + by * by < 0.96;
      });
      const rimCell =
        xx === x || yy === y || xx === x + w - 1 || yy === y + h - 1;
      const threshold =
        0.88 + edgeNoise + lobeBoost + grainNoise - (rimCell ? 0.08 : 0);
      if (superEllipse <= threshold && !biteCut) cells.add(cellKey(xx, yy));
    }
  }

  const withinRoom = (cell) =>
    cell.x >= x && cell.y >= y && cell.x < x + w && cell.y < y + h;
  const countNeighbors8 = (set, cell) => {
    let count = 0;
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        if (set.has(cellKey(cell.x + dx, cell.y + dy))) count += 1;
      }
    }
    return count;
  };

  let draft = new Set(cells);
  for (let pass = 0; pass < 2; pass += 1) {
    const next = new Set(draft);
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) {
        const cell = { x: xx, y: yy };
        const key = cellKey(xx, yy);
        const neighbors = countNeighbors8(draft, cell);
        const nx = (xx + 0.5 - cx) / rx;
        const ny = (yy + 0.5 - cy) / ry;
        const radial =
          Math.pow(Math.abs(nx), 2.15) + Math.pow(Math.abs(ny), 2.05);
        if (draft.has(key) && neighbors <= 2) next.delete(key);
        if (!draft.has(key) && neighbors >= 5 && radial < 1.08) next.add(key);
      }
    }
    draft = next;
  }

  const connected = getLargestConnectedCellSet(draft);
  const minimum = Math.max(5, Math.floor(w * h * 0.36));
  if (connected.size < minimum) {
    const fallback = buildOvalMask(room);
    const fallbackCells = new Set(fallback);
    carveCorner(
      fallbackCells,
      x,
      y,
      w,
      h,
      pickOne(rng, ["nw", "ne", "sw", "se"]),
      1,
      1,
    );
    return ensureRoomMaskViable(fallbackCells, room);
  }

  const organic = new Set(
    Array.from(connected).filter((key) => withinRoom(parseCellKey(key))),
  );
  const area = w * h;
  if (organic.size > area * 0.9 && w >= 5 && h >= 4) {
    const corner = pickOne(rng, ["nw", "ne", "sw", "se"]);
    carveCorner(
      organic,
      x,
      y,
      w,
      h,
      corner,
      randomInt(rng, 1, Math.max(1, Math.floor(w * 0.22))),
      randomInt(rng, 1, Math.max(1, Math.floor(h * 0.22))),
    );
  }
  return ensureRoomMaskViable(organic, room);
}

export function isMineHybridCaveRoom(room) {
  return (
    room?.placementProfile === "mine" &&
    (room?.surfaceKind === "cave" || room?.surfaceKind === "hybrid")
  );
}

export function buildMineCaveChamberMask(room, rng) {
  const { x, y, w, h } = room.cellRect;
  const profile = room.caveChamberProfile || "irregular-chamber";
  const cells = buildCaveMask(room, rng);
  const center = {
    x: x + w / 2 + (rng() - 0.5) * Math.max(1, w * 0.18),
    y: y + h / 2 + (rng() - 0.5) * Math.max(1, h * 0.18),
  };
  const addEllipse = (cx, cy, rx, ry) => {
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) {
        const dx = (xx + 0.5 - cx) / Math.max(0.75, rx);
        const dy = (yy + 0.5 - cy) / Math.max(0.75, ry);
        if (dx * dx + dy * dy <= 1) cells.add(cellKey(xx, yy));
      }
    }
  };
  const removeEllipse = (cx, cy, rx, ry) => {
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) {
        const dx = (xx + 0.5 - cx) / Math.max(0.75, rx);
        const dy = (yy + 0.5 - cy) / Math.max(0.75, ry);
        if (dx * dx + dy * dy <= 1) cells.delete(cellKey(xx, yy));
      }
    }
  };

  const mainRx = Math.max(
    2.2,
    w * (profile === "narrow-fissure" ? 0.33 : 0.42),
  );
  const mainRy = Math.max(
    2.2,
    h * (profile === "narrow-fissure" ? 0.33 : 0.42),
  );
  addEllipse(center.x, center.y, mainRx, mainRy);

  const lobeCount =
    profile === "clustered-alcoves" || profile === "branching-pocket"
      ? randomInt(rng, 4, 6)
      : profile === "narrow-fissure"
        ? randomInt(rng, 2, 3)
        : randomInt(rng, 3, 5);
  const axis =
    profile === "narrow-fissure" || profile === "rough-gallery"
      ? w >= h
        ? 0
        : Math.PI / 2
      : rng() * Math.PI;

  for (let index = 0; index < lobeCount; index += 1) {
    const angle =
      profile === "narrow-fissure" || profile === "rough-gallery"
        ? axis + (index % 2 === 0 ? 0 : Math.PI) + (rng() - 0.5) * 0.75
        : rng() * Math.PI * 2;
    const distance =
      profile === "clustered-alcoves"
        ? 0.48 + rng() * 0.32
        : 0.38 + rng() * 0.34;
    const lobeRx = Math.max(
      1.35,
      w * (profile === "narrow-fissure" ? 0.18 : 0.18 + rng() * 0.12),
    );
    const lobeRy = Math.max(
      1.35,
      h * (profile === "narrow-fissure" ? 0.18 : 0.18 + rng() * 0.12),
    );
    addEllipse(
      center.x + Math.cos(angle) * w * distance * 0.45,
      center.y + Math.sin(angle) * h * distance * 0.45,
      lobeRx,
      lobeRy,
    );
  }

  const biteCount =
    profile === "collapsed-pocket"
      ? randomInt(rng, 3, 5)
      : randomInt(rng, 2, 4);
  for (let index = 0; index < biteCount; index += 1) {
    const side = pickOne(rng, ["north", "south", "east", "west"]);
    const horizontal = side === "north" || side === "south";
    removeEllipse(
      horizontal ? x + rng() * w : side === "west" ? x - 0.15 : x + w + 0.15,
      horizontal ? (side === "north" ? y - 0.15 : y + h + 0.15) : y + rng() * h,
      Math.max(1.1, w * (0.12 + rng() * 0.1)),
      Math.max(1.1, h * (0.12 + rng() * 0.1)),
    );
  }

  let draft = getLargestConnectedCellSet(cells);
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const key = cellKey(xx, yy);
      if (!draft.has(key)) continue;
      let neighbors = 0;
      ORTHOGONAL_DIRECTIONS.forEach((direction) => {
        if (draft.has(cellKey(xx + direction.dx, yy + direction.dy)))
          neighbors += 1;
      });
      if (neighbors <= 1 && rng() > 0.25) cells.delete(key);
    }
  }
  draft = getLargestConnectedCellSet(cells);
  const minimum = Math.max(6, Math.floor(w * h * 0.42));
  if (draft.size < minimum) {
    addEllipse(
      center.x,
      center.y,
      Math.max(2.2, w * 0.46),
      Math.max(2.1, h * 0.44),
    );
    draft = getLargestConnectedCellSet(cells);
  }
  return ensureRoomMaskViable(draft, room);
}

export function buildBaseRoomMask(room, rng) {
  if (isMineHybridCaveRoom(room) && room.shape === "cave")
    return buildMineCaveChamberMask(room, rng);
  if (room.shape === "hall") return buildHallMask(room, rng);
  if (room.shape === "l-shape") return buildLShapeMask(room, rng);
  if (room.shape === "notched") return buildNotchedMask(room, rng);
  if (room.shape === "broken" || room.shape === "ruined-rect")
    return buildRuinedMask(room, rng);
  if (room.shape === "alcove") return buildAlcoveMask(room, rng);
  if (room.shape === "archive") return buildArchiveMask(room, rng);
  if (room.shape === "apse") return buildApseMask(room);
  if (room.shape === "circle") return buildCircleMask(room);
  if (
    room.shape === "oval" ||
    room.shape === "shaft" ||
    room.shape === "ritual"
  )
    return buildOvalMask(room);
  if (room.shape === "irregular" || room.shape === "cave")
    return buildCaveMask(room, rng);
  return buildRectMask(room);
}

export function applyMaskModifier(baseCells, room, rng, modifier) {
  const draft = new Set(baseCells);
  const proxyRoom = { ...room };
  if (modifier === "notch") {
    const notched = buildNotchedMask(proxyRoom, rng);
    baseCells.forEach((key) => {
      if (!notched.has(key)) draft.delete(key);
    });
  }
  if (modifier === "ruined") {
    const ruined = buildRuinedMask(proxyRoom, rng);
    baseCells.forEach((key) => {
      if (!ruined.has(key)) draft.delete(key);
    });
  }
  if (modifier === "alcove") {
    const alcove = buildAlcoveMask(proxyRoom, rng);
    baseCells.forEach((key) => {
      if (!alcove.has(key)) draft.delete(key);
    });
  }
  if (modifier === "archive") {
    const archive = buildArchiveMask(proxyRoom, rng);
    baseCells.forEach((key) => {
      if (!archive.has(key)) draft.delete(key);
    });
  }
  return draft;
}

export function buildRoomMask(room, rng) {
  const type = room.shapeOptions?.roomType || "none";
  const archetypeCells = buildArchetypeRoomMask(room, rng);
  let cells =
    archetypeCells ||
    (type === "apse"
      ? buildApseMask(room)
      : type === "ruined"
        ? buildRuinedMask(room, rng)
        : buildBaseRoomMask(room, rng));
  if (!archetypeCells && type === "alcove" && room.shape !== "alcove")
    cells = applyMaskModifier(cells, room, rng, "alcove");
  if (!archetypeCells && type === "archive" && room.shape !== "archive")
    cells = applyMaskModifier(cells, room, rng, "archive");
  if (
    room.shapeOptions?.notch &&
    !["notched", "ruined-rect", "broken"].includes(room.shape)
  )
    cells = applyMaskModifier(cells, room, rng, "notch");
  if (
    room.shapeOptions?.ruined &&
    type !== "ruined" &&
    !["ruined-rect", "broken"].includes(room.shape)
  )
    cells = applyMaskModifier(cells, room, rng, "ruined");
  return ensureRoomMaskViable(cells, room);
}

export function getFloorCellCentroid(floorCells, gridSize, fallbackPoint) {
  if (!Array.isArray(floorCells) || floorCells.length === 0)
    return fallbackPoint;
  return {
    x:
      (floorCells.reduce((sum, cell) => sum + cell.x + 0.5, 0) /
        floorCells.length) *
      gridSize,
    y:
      (floorCells.reduce((sum, cell) => sum + cell.y + 0.5, 0) /
        floorCells.length) *
      gridSize,
  };
}

export function buildAllRoomMasks(
  regions,
  seed,
  gridSize = DEFAULT_CONFIG.gridSize,
) {
  return regions.map((room) => {
    const rng = createSeededRng(hashStringToSeed(seed, room.id, "room-mask"));
    const floorCells = Array.from(buildRoomMask(room, rng)).map(parseCellKey);
    return {
      ...room,
      floorCells,
      labelPoint: ["cave", "broken", "ruined-rect"].includes(room.shape)
        ? getFloorCellCentroid(floorCells, gridSize, room.labelPoint)
        : room.labelPoint,
    };
  });
}

export function getCircleGeometryFromRegion(region, gridSize) {
  const { x, y, w, h } = region.cellRect;
  const radiusCells = Math.max(1.8, Math.min(w, h) / 2);
  return {
    cx: (x + w / 2) * gridSize,
    cy: (y + h / 2) * gridSize,
    r: radiusCells * gridSize,
    cxCells: x + w / 2,
    cyCells: y + h / 2,
    rCells: radiusCells,
  };
}

export function getCircularAnchorData(region, cell, normal) {
  if (region.shape !== "circle") return null;
  const cx = region.cellRect.x + region.cellRect.w / 2;
  const cy = region.cellRect.y + region.cellRect.h / 2;
  const radius = Math.max(
    1.8,
    Math.min(region.cellRect.w, region.cellRect.h) / 2,
  );
  const aim = {
    x: cell.x + 0.5 + normal.x * 0.72 - cx,
    y: cell.y + 0.5 + normal.y * 0.72 - cy,
  };
  const length = Math.hypot(aim.x, aim.y) || 1;
  return {
    cx,
    cy,
    r: radius,
    normal: { x: aim.x / length, y: aim.y / length },
  };
}

export function isCircleDoorEdgeInsidePerimeter(anchor) {
  if (!anchor?.circular) return false;
  const circle = anchor.circular;
  const samples =
    anchor.side === "north" || anchor.side === "south"
      ? [0.33, 0.5, 0.67].map((t) => ({
          x: anchor.cell.x + t,
          y: anchor.side === "north" ? anchor.cell.y : anchor.cell.y + 1,
        }))
      : [0.33, 0.5, 0.67].map((t) => ({
          x: anchor.side === "west" ? anchor.cell.x : anchor.cell.x + 1,
          y: anchor.cell.y + t,
        }));
  const insideCount = samples.filter((point) => {
    const dx = point.x - circle.cx;
    const dy = point.y - circle.cy;
    return Math.hypot(dx, dy) < circle.r - 0.035;
  }).length;
  return insideCount >= 2;
}

export function createCircleDoorRoomExtensionAnchor(
  region,
  anchor,
  gridW,
  gridH,
  reservedRoomCells = null,
) {
  if (!anchor || region.shape !== "circle") return anchor;
  const portalRoomCell = { x: anchor.outsideCell.x, y: anchor.outsideCell.y };
  const outsideCell = {
    x: portalRoomCell.x + anchor.normal.x,
    y: portalRoomCell.y + anchor.normal.y,
  };
  if (
    outsideCell.x < 1 ||
    outsideCell.y < 1 ||
    outsideCell.x >= gridW - 1 ||
    outsideCell.y >= gridH - 1
  )
    return anchor;
  if (reservedRoomCells?.has(cellKey(portalRoomCell.x, portalRoomCell.y)))
    return anchor;
  if (reservedRoomCells?.has(cellKey(outsideCell.x, outsideCell.y)))
    return anchor;
  return {
    ...anchor,
    cell: portalRoomCell,
    outsideCell,
    circular: null,
    expandedCircleDoor: true,
    portalRoomCell,
    originalCell: { x: anchor.cell.x, y: anchor.cell.y },
    originalOutsideCell: { x: anchor.outsideCell.x, y: anchor.outsideCell.y },
    wasCircleDoorEdgeInsidePerimeter: isCircleDoorEdgeInsidePerimeter(anchor),
  };
}

export function addCircleDoorRoomExtensionCellToSet(anchor, cells) {
  if (!anchor?.expandedCircleDoor || !anchor.portalRoomCell) return;
  cells.add(cellKey(anchor.portalRoomCell.x, anchor.portalRoomCell.y));
}

export function applyCircleDoorRoomExtensions(regions, corridors) {
  const extensionsByRegion = new Map();
  const addExtension = (regionId, anchor) => {
    if (!regionId || !anchor?.expandedCircleDoor || !anchor.portalRoomCell)
      return;
    if (!extensionsByRegion.has(regionId))
      extensionsByRegion.set(regionId, new Map());
    extensionsByRegion
      .get(regionId)
      .set(cellKey(anchor.portalRoomCell.x, anchor.portalRoomCell.y), {
        x: anchor.portalRoomCell.x,
        y: anchor.portalRoomCell.y,
      });
  };

  corridors.forEach((corridor) => {
    addExtension(corridor.from, corridor.fromAnchor);
    addExtension(corridor.to, corridor.toAnchor);
  });

  if (extensionsByRegion.size === 0) return regions;

  return regions.map((region) => {
    const extensions = extensionsByRegion.get(region.id);
    if (!extensions || region.shape !== "circle") return region;

    const previousExtensions = new Map(
      (Array.isArray(region.circleExtensionCells)
        ? region.circleExtensionCells
        : []
      ).map((cell) => [cellKey(cell.x, cell.y), { x: cell.x, y: cell.y }]),
    );
    extensions.forEach((cell, key) => previousExtensions.set(key, cell));

    const existingFloor = new Set(
      region.floorCells.map((cell) => cellKey(cell.x, cell.y)),
    );
    const addedFloorCells = Array.from(previousExtensions.values()).filter(
      (cell) => !existingFloor.has(cellKey(cell.x, cell.y)),
    );

    return {
      ...region,
      floorCells: [...region.floorCells, ...addedFloorCells],
      circleExtensionCells: Array.from(previousExtensions.values()),
    };
  });
}

export function getCircleExtensionCellKeys(region) {
  return new Set(
    (Array.isArray(region.circleExtensionCells)
      ? region.circleExtensionCells
      : []
    ).map((cell) => cellKey(cell.x, cell.y)),
  );
}

export function getCellNeighbors(cell) {
  return [
    { x: cell.x + 1, y: cell.y },
    { x: cell.x - 1, y: cell.y },
    { x: cell.x, y: cell.y + 1 },
    { x: cell.x, y: cell.y - 1 },
  ];
}

export function pointKey(point) {
  return `${Math.round(point.x * 10) / 10},${Math.round(point.y * 10) / 10}`;
}

export function doorKey(door) {
  const a = `${Math.round(door.x1 * 10) / 10},${Math.round(door.y1 * 10) / 10}`;
  const b = `${Math.round(door.x2 * 10) / 10},${Math.round(door.y2 * 10) / 10}`;
  return `${a}|${b}|${door.doorType || (door.secret ? "secret" : "default")}`;
}

export function dedupePoints(points) {
  const seen = new Set();
  return points.filter((point) => {
    const key = pointKey(point);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getDoorOccupancyKey(door) {
  if (!door) return null;
  if (door.outsideCell) return cellKey(door.outsideCell.x, door.outsideCell.y);
  return null;
}

function getDoorDedupePriority(door) {
  return (
    Number(door?.doorOccupancyPriority || 0) +
    (door?.hasStairs || door?.stairTransition && door.stairTransition !== "none" ? 100 : 0) +
    (door?.doorType === "locked" || door?.locked ? 30 : 0) +
    (door?.doorType === "secret" || door?.secret ? 20 : 0)
  );
}

export function dedupeDoorSegments(doors, options = {}) {
  const seen = new Set();
  const exactDoors = doors.filter((door) => {
    if (!door) return false;
    const key = doorKey(door);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (!options.byOccupancy) return exactDoors;

  const output = [];
  const generatedDoorByCell = new Map();

  exactDoors.forEach((door) => {
    const occupancyKey = getDoorOccupancyKey(door);
    const isManual = Boolean(door.manualDoorAnchor || door.manual || door.userPlaced);
    if (!occupancyKey || isManual) {
      output.push(door);
      return;
    }

    const current = {
      door,
      index: output.length,
      score: getDoorDedupePriority(door),
    };
    const previous = generatedDoorByCell.get(occupancyKey);
    if (!previous) {
      generatedDoorByCell.set(occupancyKey, current);
      output.push(door);
      return;
    }

    if (current.score > previous.score) {
      output[previous.index] = door;
      generatedDoorByCell.set(occupancyKey, { ...current, index: previous.index });
    }
  });

  return output;
}

export function mergeDungeonSurfaces(regions, corridors) {
  const floor = new Set();
  const roomFloor = new Set();
  const corridorFloor = new Set();
  regions.forEach((region) =>
    region.floorCells.forEach((cell) => {
      const key = cellKey(cell.x, cell.y);
      floor.add(key);
      roomFloor.add(key);
    }),
  );
  corridors.forEach((corridor) =>
    corridor.floorCells.forEach((cell) => {
      const key = cellKey(cell.x, cell.y);
      floor.add(key);
      if (!roomFloor.has(key)) corridorFloor.add(key);
    }),
  );
  return {
    floorCells: Array.from(floor).map(parseCellKey),
    roomFloorCells: Array.from(roomFloor).map(parseCellKey),
    corridorFloorCells: Array.from(corridorFloor).map(parseCellKey),
  };
}

export function computeBoundarySegments(floorCells, gridSize) {
  const floor = new Set(floorCells.map((cell) => cellKey(cell.x, cell.y)));
  const segments = [];
  floorCells.forEach((cell) => {
    const x = cell.x * gridSize;
    const y = cell.y * gridSize;
    const g = gridSize;
    [
      {
        side: "north",
        neighbor: cellKey(cell.x, cell.y - 1),
        x1: x,
        y1: y,
        x2: x + g,
        y2: y,
      },
      {
        side: "east",
        neighbor: cellKey(cell.x + 1, cell.y),
        x1: x + g,
        y1: y,
        x2: x + g,
        y2: y + g,
      },
      {
        side: "south",
        neighbor: cellKey(cell.x, cell.y + 1),
        x1: x + g,
        y1: y + g,
        x2: x,
        y2: y + g,
      },
      {
        side: "west",
        neighbor: cellKey(cell.x - 1, cell.y),
        x1: x,
        y1: y + g,
        x2: x,
        y2: y,
      },
    ].forEach((segment) => {
      if (!floor.has(segment.neighbor)) segments.push(segment);
    });
  });
  return mergeCollinearWallSegments(segments);
}

export function mergeCollinearWallSegments(segments) {
  const horizontal = new Map();
  const vertical = new Map();

  segments.forEach((segment) => {
    if (segment.y1 === segment.y2) {
      const y = segment.y1;
      const a = Math.min(segment.x1, segment.x2);
      const b = Math.max(segment.x1, segment.x2);
      const key = `h-${y}`;
      if (!horizontal.has(key)) horizontal.set(key, []);
      horizontal.get(key).push({ y, a, b });
    } else if (segment.x1 === segment.x2) {
      const x = segment.x1;
      const a = Math.min(segment.y1, segment.y2);
      const b = Math.max(segment.y1, segment.y2);
      const key = `v-${x}`;
      if (!vertical.has(key)) vertical.set(key, []);
      vertical.get(key).push({ x, a, b });
    }
  });

  const merged = [];
  horizontal.forEach((parts) => {
    parts.sort((a, b) => a.a - b.a);
    let current = null;
    parts.forEach((part) => {
      if (!current) {
        current = { ...part };
        return;
      }
      if (part.a <= current.b) {
        current.b = Math.max(current.b, part.b);
      } else {
        merged.push({
          x1: current.a,
          y1: current.y,
          x2: current.b,
          y2: current.y,
        });
        current = { ...part };
      }
    });
    if (current)
      merged.push({
        x1: current.a,
        y1: current.y,
        x2: current.b,
        y2: current.y,
      });
  });

  vertical.forEach((parts) => {
    parts.sort((a, b) => a.a - b.a);
    let current = null;
    parts.forEach((part) => {
      if (!current) {
        current = { ...part };
        return;
      }
      if (part.a <= current.b) {
        current.b = Math.max(current.b, part.b);
      } else {
        merged.push({
          x1: current.x,
          y1: current.a,
          x2: current.x,
          y2: current.b,
        });
        current = { ...part };
      }
    });
    if (current)
      merged.push({
        x1: current.x,
        y1: current.a,
        x2: current.x,
        y2: current.b,
      });
  });

  return merged;
}

export function segmentKey(segment) {
  const a = `${segment.x1},${segment.y1}`;
  const b = `${segment.x2},${segment.y2}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function getSharedEdgeSegment(cell, neighbor, gridSize) {
  const x = cell.x * gridSize;
  const y = cell.y * gridSize;
  const g = gridSize;
  if (neighbor.x === cell.x + 1 && neighbor.y === cell.y)
    return { x1: x + g, y1: y, x2: x + g, y2: y + g };
  if (neighbor.x === cell.x - 1 && neighbor.y === cell.y)
    return { x1: x, y1: y + g, x2: x, y2: y };
  if (neighbor.x === cell.x && neighbor.y === cell.y + 1)
    return { x1: x + g, y1: y + g, x2: x, y2: y + g };
  if (neighbor.x === cell.x && neighbor.y === cell.y - 1)
    return { x1: x, y1: y, x2: x + g, y2: y };
  return null;
}

export function computeRoomCorridorWallSegments(
  roomFloorCells,
  corridorFloorCells,
  gridSize,
) {
  const corridorSet = new Set(
    corridorFloorCells.map((cell) => cellKey(cell.x, cell.y)),
  );
  const seen = new Set();
  const segments = [];

  roomFloorCells.forEach((cell) => {
    [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 },
    ].forEach((neighbor) => {
      if (!corridorSet.has(cellKey(neighbor.x, neighbor.y))) return;
      const segment = getSharedEdgeSegment(cell, neighbor, gridSize);
      if (!segment) return;
      const key = segmentKey(segment);
      if (seen.has(key)) return;
      seen.add(key);
      segments.push(segment);
    });
  });

  return segments;
}

export function computeRoomRoomWallSegments(regions, gridSize) {
  const ownerByCell = new Map();
  regions.forEach((region) => {
    region.floorCells.forEach((cell) =>
      ownerByCell.set(cellKey(cell.x, cell.y), region.id),
    );
  });
  const seen = new Set();
  const segments = [];
  regions.forEach((region) => {
    region.floorCells.forEach((cell) => {
      [
        { x: cell.x + 1, y: cell.y },
        { x: cell.x - 1, y: cell.y },
        { x: cell.x, y: cell.y + 1 },
        { x: cell.x, y: cell.y - 1 },
      ].forEach((neighbor) => {
        const owner = ownerByCell.get(cellKey(neighbor.x, neighbor.y));
        if (!owner || owner === region.id) return;
        const segment = getSharedEdgeSegment(cell, neighbor, gridSize);
        if (!segment) return;
        const key = segmentKey(segment);
        if (seen.has(key)) return;
        seen.add(key);
        segments.push(segment);
      });
    });
  });
  return segments;
}

export function buildDungeonMask(regions, corridors, gridSize) {
  const dungeonMask = mergeDungeonSurfaces(regions, corridors);
  const doorSegments = dedupeDoorSegments(
    corridors.flatMap((corridor) => corridor.doors),
    { byOccupancy: true },
  );
  const externalWallSegments = computeBoundarySegments(
    dungeonMask.floorCells,
    gridSize,
  );
  const corridorSeparationWallSegments = computeRoomCorridorWallSegments(
    dungeonMask.roomFloorCells,
    dungeonMask.corridorFloorCells,
    gridSize,
  );
  const roomSeparationWallSegments = computeRoomRoomWallSegments(
    regions,
    gridSize,
  );
  const wallSegments = mergeCollinearWallSegments([
    ...externalWallSegments,
    ...corridorSeparationWallSegments,
    ...roomSeparationWallSegments,
  ]);
  return {
    surfaceKind: "dungeon",
    ...dungeonMask,
    externalWallSegments,
    internalWallSegments: mergeCollinearWallSegments([
      ...corridorSeparationWallSegments,
      ...roomSeparationWallSegments,
    ]),
    wallSegments,
    doorSegments,
    mapAccesses: [],
  };
}

export function getRegionSurfaceKind(region, generatedMap = null) {
  const contextKey = generatedMap?.config
    ? getContextKey(generatedMap.config.context || generatedMap.config.biome)
    : getContextKey(region?.placementProfile || "");
  const explicit =
    region?.surfaceKind || region?.generationKind || region?.surface?.kind;
  if (["cave", "hybrid", "organic-cave", "natural"].includes(explicit)) {
    return contextKey === "cave" || contextKey === "mine" ? "cave" : "dungeon";
  }
  if (["structure", "dungeon", "structured", "room"].includes(explicit))
    return "dungeon";
  if (
    (region?.placementProfile === "cave" || region?.shape === "cave") &&
    (contextKey === "cave" || contextKey === "mine")
  )
    return "cave";
  return contextKey === "cave" ? "cave" : "dungeon";
}

export function getCellBoundarySegmentsForCell(cell, gridSize) {
  const x = cell.x * gridSize;
  const y = cell.y * gridSize;
  const g = gridSize;
  return [
    { side: "north", x1: x, y1: y, x2: x + g, y2: y },
    { side: "east", x1: x + g, y1: y, x2: x + g, y2: y + g },
    { side: "south", x1: x + g, y1: y + g, x2: x, y2: y + g },
    { side: "west", x1: x, y1: y + g, x2: x, y2: y },
  ];
}

export function getNeighborForCellSide(cell, side) {
  if (side === "north") return { x: cell.x, y: cell.y - 1 };
  if (side === "east") return { x: cell.x + 1, y: cell.y };
  if (side === "south") return { x: cell.x, y: cell.y + 1 };
  return { x: cell.x - 1, y: cell.y };
}
