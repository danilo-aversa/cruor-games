import { AlertTriangle, Eye, Gem, RotateCcw, Search } from "lucide-react";
import { LOCATION_SLOT_SCOPE_REGION } from "../model/location-composer-state.js";
import {
  getDefaultSlotIdForScope,
  isSlotInScope,
} from "../model/location-composer-selectors.js";
import {
  getRoomSlotProgramRows,
  getSelectedRoomProgramEntry,
} from "../model/location-room-program.js";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getSlotIcon(slotId) {
  if (slotId === "sensoryLayer") return Eye;
  if (slotId === "hazard") return AlertTriangle;
  if (slotId === "clue") return Search;
  if (slotId === "encounterTwist") return RotateCcw;
  if (slotId === "reward") return Gem;
  return Eye;
}

function LocationInspectorFact({ label, value }) {
  return (
    <span className="location-room-inspector-fact">
      <small>{label}</small>
      <strong>{value || "—"}</strong>
    </span>
  );
}


export function LocationRoomInspector({
  activeSlot,
  generatedMapPreview = null,
  onFocusSlot,
  pickerOpen = false,
  state,
}) {
  const entry = getSelectedRoomProgramEntry(state, generatedMapPreview);
  const roomRows = entry ? getRoomSlotProgramRows(state, entry.id) : [];
  const activeSlotId = pickerOpen && isSlotInScope(activeSlot?.id || state.activeSlot, LOCATION_SLOT_SCOPE_REGION)
    ? activeSlot?.id || state.activeSlot
    : "";

  function focusSlot(slotId) {
    onFocusSlot?.(slotId, LOCATION_SLOT_SCOPE_REGION, entry?.id || state.activeRegionId || "");
  }

  if (!entry) {
    return (
      <aside
        className="cruor-composer-rail location-composer__rail location-composer__rail--left location-room-inspector-rail location-room-inspector-rail--rooms"
        aria-label="Select room"
        data-testid="dark-places-room-inspector"
      >
        <section className="location-room-inspector-card location-room-inspector-card--selected location-room-inspector-card--empty" aria-label="Select room prompt">
          <strong className="location-room-inspector-title">Select Room</strong>
          <div className="location-room-inspector-note">Click a room on the map to edit its slots.</div>
        </section>
      </aside>
    );
  }

  return (
    <aside
      className="cruor-composer-rail location-composer__rail location-composer__rail--left location-room-inspector-rail location-room-inspector-rail--rooms"
      aria-label="Selected room"
      data-testid="dark-places-room-inspector"
    >
      <section className="location-room-inspector-card location-room-inspector-card--selected" aria-label="Selected room summary">
        <div className="location-room-inspector-card__head">
          <span>Selected Room</span>
        </div>
        <strong className="location-room-inspector-title">{entry.name}</strong>
        <div className="location-room-inspector-facts">
          <LocationInspectorFact label="Map" value={entry.mapLabel} />
          <LocationInspectorFact label="Role" value={entry.roleLabel} />
          <LocationInspectorFact label="Type" value={entry.roomTypeLabel} />
          <LocationInspectorFact label="Level" value={String(entry.level)} />
        </div>
      </section>

      <div className="location-room-inspector-slot-stack" role="list" aria-label="Room work slots">
          {roomRows.map((row) => {
            const Icon = getSlotIcon(row.slot.id);
            const active = activeSlotId === row.slot.id;
            return (
              <button
                data-testid="dark-places-room-slot"
                data-room-slot-id={row.slot.id}
                data-room-slot-status={row.filled ? "filled" : row.missing ? "missing" : "optional"}
                className={cx(
                  "location-room-inspector-slot",
                  row.filled ? "is-filled" : "is-empty",
                  row.missing && "is-missing",
                  row.suggested && "is-suggested",
                  active && "is-active",
                )}
                key={row.slot.id}
                type="button"
                role="listitem"
                aria-pressed={active}
                onClick={() => focusSlot(row.slot.id)}
                data-key="tooltip-generic"
                data-tooltip={row.slot.label}
                data-tooltip-description={row.filled ? "Open this filled room slot." : "Open a filtered component picker for this room slot."}
              >
                <span className="location-room-inspector-slot__head">
                  <span>
                    <Icon aria-hidden="true" />
                    {row.slot.label}
                  </span>
                  <strong>{row.filled ? row.statusLabel : "—"}</strong>
                </span>
                <span className="location-room-inspector-slot__body">
                  <strong>{row.components[0]?.title || "Empty Slot"}</strong>
                  <em>{row.components[0]?.description || row.slot.description || "Choose component"}</em>
                </span>
              </button>
            );
          })}
      </div>
    </aside>
  );
}
