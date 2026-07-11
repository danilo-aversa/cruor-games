import { useMemo } from "react";
import { AlertTriangle, Eye, Gem, RotateCcw, Search, Skull, Sparkles } from "lucide-react";
import { ComposerRail } from "../../../../components/ui/composer-rail.jsx";
import {
  LOCATION_SLOT_SCOPE_DEFINITIONS,
  getAssignedComponentsForSlotScope,
  getDefaultSlotIdForScope,
  getLocationSlotsForScope,
  getSlotStatusForScope,
  isSlotInScope,
} from "../model/location-composer-selectors.js";
import {
  LOCATION_SLOT_SCOPE_MAP,
  LOCATION_SLOT_SCOPE_REGION,
  normalizeLocationSlotScope,
} from "../model/location-composer-state.js";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getSlotIcon(slotId) {
  if (slotId === "horrorPremise") return Skull;
  if (slotId === "sensoryLayer") return Eye;
  if (slotId === "visibleAnomaly") return Sparkles;
  if (slotId === "hazard") return AlertTriangle;
  if (slotId === "clue") return Search;
  if (slotId === "encounterTwist") return RotateCcw;
  if (slotId === "reward") return Gem;
  return Sparkles;
}

export function LocationSlotRail({ state, setState, modeControls, onFocusSlot }) {
  const activeScope = normalizeLocationSlotScope(state.activeSlotScope);
  const slots = useMemo(() => getLocationSlotsForScope(activeScope), [activeScope]);
  const activeSlotId = isSlotInScope(state.activeSlot, activeScope)
    ? state.activeSlot
    : getDefaultSlotIdForScope(activeScope);
  const activeRegion = state.locationRegions?.find((region) => region.id === state.activeRegionId);
  const targetLabel = activeScope === LOCATION_SLOT_SCOPE_REGION
    ? activeRegion?.name || "Select a region on the map"
    : "Whole Map";

  const selectedBySlot = useMemo(() => {
    return slots.reduce((acc, slot) => {
      acc[slot.id] = getAssignedComponentsForSlotScope(
        state,
        slot.id,
        activeScope,
        state.activeRegionId,
      );
      return acc;
    }, {});
  }, [activeScope, slots, state]);

  function focusScope(scope) {
    const nextScope = normalizeLocationSlotScope(scope);
    const nextSlotId = isSlotInScope(state.activeSlot, nextScope)
      ? state.activeSlot
      : getDefaultSlotIdForScope(nextScope);

    setState((current) => ({
      ...current,
      activeSlotScope: nextScope,
      activeSlot: nextSlotId,
      activeRegionId:
        nextScope === LOCATION_SLOT_SCOPE_REGION
          ? current.activeRegionId || current.locationRegions?.[0]?.id || ""
          : current.activeRegionId,
    }));
  }

  function focusSlot(slotId) {
    setState((current) => ({
      ...current,
      activeSlot: slotId,
      activeSlotScope: activeScope,
      activeRegionId:
        activeScope === LOCATION_SLOT_SCOPE_REGION
          ? current.activeRegionId || current.locationRegions?.[0]?.id || ""
          : current.activeRegionId,
    }));
    onFocusSlot?.(slotId, activeScope);
  }

  return (
    <ComposerRail
      side="left"
      variant="slots"
      surface
      className="location-composer__rail location-composer__rail--left location-composer__rail--picker location-map-slot-rail"
      aria-label="Location regions"
    >
      {modeControls ? modeControls : null}

      <div className="location-map-mode-switch location-slot-scope-switch" role="tablist" aria-label="Region target scope">
        {[LOCATION_SLOT_SCOPE_MAP, LOCATION_SLOT_SCOPE_REGION].map((scope) => {
          const definition = LOCATION_SLOT_SCOPE_DEFINITIONS[scope];
          const active = activeScope === scope;
          return (
            <button
              className={cx("location-map-mode-button", active && "is-active")}
              key={scope}
              type="button"
              role="tab"
              aria-selected={active}
              aria-pressed={active}
              onClick={() => focusScope(scope)}
            >
              {definition.label}
            </button>
          );
        })}
      </div>

      <div className="location-slot-scope-target" aria-label="Current region target">
        <span>{activeScope === LOCATION_SLOT_SCOPE_REGION ? "Selected" : "Target"}</span>
        <strong>{targetLabel}</strong>
      </div>

      <div className="location-slot-stack" aria-label={`${LOCATION_SLOT_SCOPE_DEFINITIONS[activeScope].label} content slots`}>
        {slots.map((slot, index) => {
          const status = getSlotStatusForScope(state, slot, activeScope, state.activeRegionId);
          const assigned = selectedBySlot[slot.id] || [];
          const active = activeSlotId === slot.id;
          const Icon = getSlotIcon(slot.id);
          return (
            <button
              className={cx(
                "cruor-composer-slot location-map-slot-card",
                index < 4 ? "is-right" : "is-left",
                assigned.length > 0 ? "is-filled" : "is-empty",
                active && "is-active",
                status === "partial" && "is-partial",
              )}
              key={slot.id}
              type="button"
              aria-label={`Focus ${LOCATION_SLOT_SCOPE_DEFINITIONS[activeScope].label} ${slot.label}`}
              aria-pressed={active}
              onClick={() => focusSlot(slot.id)}
            >
              <span className="location-map-slot-card__head">
                <span>
                  <Icon aria-hidden="true" />
                  {slot.label}
                </span>
                <strong>{assigned.length || "—"}</strong>
              </span>
              <span className="location-map-slot-card__body">
                {assigned[0] ? (
                  <>
                    <strong>{assigned[0].title || assigned[0].name}</strong>
                    <em>{assigned.length > 1 ? `${assigned.length} components assigned` : "Assigned"}</em>
                  </>
                ) : (
                  <>
                    <strong>No component</strong>
                    <em>{slot.hint || slot.description || "Choose one"}</em>
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </ComposerRail>
  );
}
