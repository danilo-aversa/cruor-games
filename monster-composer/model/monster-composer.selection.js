export function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

export function uniqueArray(values) {
  return [...new Set(values.filter(Boolean))];
}

export function getSelectedIdsForSlot(selected, slotId) {
  const value = selected[slotId];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

export function hasSelectedSlot(selected, slotId) {
  return getSelectedIdsForSlot(selected, slotId).length > 0;
}

export function getFeaturesFromSelection(selected, features = []) {
  return Object.values(selected)
    .flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []))
    .map((id) => features.find((feature) => feature.id === id))
    .filter(Boolean);
}

export function collapseSelectedToSingle(current) {
  return Object.fromEntries(
    Object.entries(current)
      .map(([slotId, value]) => [slotId, getSelectedIdsForSlot(current, slotId)[0]])
      .filter(([, value]) => Boolean(value))
  );
}

export function trimSelectedToCaps(current, slotCaps, helpers = {}) {
  const getSlotCap = helpers.getSlotCap || (() => 1);
  return Object.fromEntries(
    Object.entries(current)
      .map(([slotId]) => {
        const cap = getSlotCap(slotCaps, slotId);
        const ids = getSelectedIdsForSlot(current, slotId).slice(0, cap);
        return [slotId, cap <= 1 ? ids[0] : ids];
      })
      .filter(([, value]) => (Array.isArray(value) ? value.length : Boolean(value)))
  );
}
