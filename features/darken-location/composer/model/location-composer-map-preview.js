export function clampPercent(value, min = 8, max = 92) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function getGeneratedRoomForRegion(generatedMap, regionId) {
  if (!generatedMap?.regions?.length || !regionId) return null;
  return (
    generatedMap.regions.find((room) => room.sourceRegionId === regionId) ||
    generatedMap.regions.find((room) => room.requestMetadata?.sourceRegionId === regionId) ||
    generatedMap.regions.find((room) => room.id === regionId) ||
    null
  );
}

export function getGeneratedRoomForRegionIndex(generatedMap, regionId, index) {
  return getGeneratedRoomForRegion(generatedMap, regionId) || generatedMap?.regions?.[index] || null;
}

export function getGeneratedRoomVisualAnchorPoint(generatedMap, room) {
  if (!room) return null;

  const gridSize = Math.max(1, generatedMap?.config?.gridSize || 20);
  const cells = [
    ...(Array.isArray(room.floorCells) ? room.floorCells : []),
    ...(Array.isArray(room.extensionCells) ? room.extensionCells : []),
    ...(Array.isArray(generatedMap?.finalGeometry?.regions?.[room.id]?.floorCells)
      ? generatedMap.finalGeometry.regions[room.id].floorCells
      : []),
  ].filter((cell) => Number.isFinite(cell?.x) && Number.isFinite(cell?.y));

  if (cells.length > 0) {
    const average = cells.reduce(
      (sum, cell) => ({
        x: sum.x + (cell.x + 0.5) * gridSize,
        y: sum.y + (cell.y + 0.5) * gridSize,
      }),
      { x: 0, y: 0 },
    );
    const center = {
      x: average.x / cells.length,
      y: average.y / cells.length,
    };

    const closestInteriorCell = cells
      .map((cell) => {
        const x = (cell.x + 0.5) * gridSize;
        const y = (cell.y + 0.5) * gridSize;
        const dx = x - center.x;
        const dy = y - center.y;
        return { x, y, score: dx * dx + dy * dy };
      })
      .sort((a, b) => a.score - b.score)[0];

    if (closestInteriorCell) {
      return { x: closestInteriorCell.x, y: closestInteriorCell.y };
    }
  }

  if (room.labelPoint) {
    return { x: room.labelPoint.x, y: room.labelPoint.y };
  }

  if (room.cellRect) {
    return {
      x: (room.cellRect.x + room.cellRect.w / 2) * gridSize,
      y: (room.cellRect.y + room.cellRect.h / 2) * gridSize,
    };
  }

  return null;
}

export function getGeneratedRoomPositionStyle(generatedMap, room, index, viewportMetrics = null) {
  const anchor = getGeneratedRoomVisualAnchorPoint(generatedMap, room);
  if (!generatedMap || !anchor) {
    return {
      "--region-x": `${18 + (index % 3) * 31}%`,
      "--region-y": `${28 + Math.floor(index / 3) * 24}%`,
    };
  }

  const viewBox = viewportMetrics?.viewBox || null;
  const bounds = viewBox || generatedMap.contentBounds || {
    x: 0,
    y: 0,
    width: generatedMap.config?.mapWidth || 1000,
    height: generatedMap.config?.mapHeight || 640,
  };
  const normalizedX = (anchor.x - bounds.x) / Math.max(1, bounds.width);
  const normalizedY = (anchor.y - bounds.y) / Math.max(1, bounds.height);
  const xPercent = viewBox
    ? clampPercent(normalizedX * 100, 0, 100)
    : clampPercent(12 + normalizedX * 76, 10, 90);
  const yPercent = viewBox
    ? clampPercent(normalizedY * 100, 0, 100)
    : clampPercent(14 + normalizedY * 68, 14, 82);

  return {
    "--region-x": `${xPercent}%`,
    "--region-y": `${yPercent}%`,
  };
}

export function getGeneratedRoomSurfaceLabel(room) {
  return room?.surfaceKind || room?.placementProfile || room?.shape || "generated room";
}
