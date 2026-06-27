import { AlertTriangle, CheckCircle2, Circle, Eye, Gem, Plus, RotateCcw, Search } from "lucide-react";
import { LOCATION_SLOT_SCOPE_REGION } from "../model/location-composer-state.js";
import {
  getDefaultSlotIdForScope,
  isSlotInScope,
} from "../model/location-composer-selectors.js";
import {
  getNextMissingRoomSlot,
  getRoomProgramEntries,
  getRoomSlotProgramRows,
  getRoomWorkProgress,
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

function LocationRoomStatusPill({ status = "empty" }) {
  const label = status === "ready" ? "Ready" : status === "partial" ? "Partial" : "Empty";
  const Icon = status === "ready" ? CheckCircle2 : status === "partial" ? AlertTriangle : Circle;

  return (
    <span className={cx("location-room-status-pill", `is-${status}`)}>
      <Icon aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

function LocationRoomWorkMeter({ progress }) {
  const completed = progress?.completed || 0;
  const total = progress?.total || 0;
  const percent = Math.max(0, Math.min(1, progress?.progress || 0));

  return (
    <div className="location-room-work-meter">
      <div className="location-room-work-meter__head">
        <span>Room Readiness</span>
        <span className="location-room-work-meter__value">
          <strong>{completed} / {total}</strong>
          <button
            className="tooltip-btn"
            type="button"
            aria-label="Room readiness explanation"
            data-key="tooltip-generic"
            data-tooltip="Room Readiness"
            data-tooltip-description="A room is ready when it has the required hazard, clue, and encounter twist slots filled."
          >
            ?
          </button>
        </span>
      </div>
      <div className="location-room-work-meter__track">
        <div style={{ width: `${Math.round(percent * 100)}%` }} />
      </div>
    </div>
  );
}

function LocationRoomNavigator({ activeRegionId = "", entries = [], onSelectRoom }) {
  if (!entries.length) return null;

  const readyCount = entries.filter((entry) => entry.status === "ready").length;

  return (
    <section
      className="location-room-inspector-card location-room-inspector-card--navigator"
      aria-label="Room navigator"
      data-testid="dark-places-room-navigator"
    >
      <div className="location-room-inspector-card__head">
        <span>Room Navigator</span>
        <small>{readyCount}/{entries.length} Ready</small>
      </div>
      <div className="location-room-mini-nav" role="list" aria-label="Room work queue">
        {entries.map((room) => {
          const active = activeRegionId === room.id;
          const label = `Room ${room.numberLabel || String(room.index + 1).padStart(2, "0")} — ${room.name}`;

          return (
            <button
              className={cx(
                "location-room-mini-nav__item",
                `is-${room.status || "empty"}`,
                active && "is-active",
              )}
              key={room.id}
              type="button"
              role="listitem"
              aria-label={`Select ${label}`}
              aria-pressed={active}
              data-testid="dark-places-room-nav-item"
              data-room-id={room.id}
              data-room-status={room.status || "empty"}
              onClick={() => onSelectRoom?.(room.id)}
              data-key="tooltip-generic"
              data-tooltip={label}
              data-tooltip-description={`${room.roleLabel || "Room"}. ${room.label || "Empty"}.`}
            >
              <span className="location-room-mini-nav__number">{room.numberLabel}</span>
              <span className="location-room-mini-nav__copy">
                <strong>{room.name}</strong>
                <small>{room.roleLabel}</small>
              </span>
              <span className="location-room-mini-nav__status" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function LocationRoomInspector({
  activeSlot,
  generatedMapPreview = null,
  onFocusSlot,
  onSelectRoom,
  state,
}) {
  const roomEntries = getRoomProgramEntries(state, generatedMapPreview);
  const entry = getSelectedRoomProgramEntry(state, generatedMapPreview);
  const roomRows = entry ? getRoomSlotProgramRows(state, entry.id) : [];
  const roomProgress = entry ? getRoomWorkProgress(state, entry.id) : { completed: 0, total: 0, progress: 0 };
  const nextMissingRow = entry ? getNextMissingRoomSlot(state, entry.id) : null;
  const activeSlotId = isSlotInScope(activeSlot?.id || state.activeSlot, LOCATION_SLOT_SCOPE_REGION)
    ? activeSlot?.id || state.activeSlot
    : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_REGION);

  function focusSlot(slotId) {
    onFocusSlot?.(slotId, LOCATION_SLOT_SCOPE_REGION, entry?.id || state.activeRegionId || "");
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
          {entry ? <LocationRoomStatusPill status={entry.status} /> : null}
        </div>
        <strong className="location-room-inspector-title">{entry ? entry.name : "No Room"}</strong>
        {entry ? (
          <>
            <div className="location-room-inspector-facts">
              <LocationInspectorFact label="Map" value={entry.mapLabel} />
              <LocationInspectorFact label="Role" value={entry.roleLabel} />
              <LocationInspectorFact label="Type" value={entry.roomTypeLabel} />
              <LocationInspectorFact label="Level" value={String(entry.level)} />
            </div>
          </>
        ) : (
          <div className="location-room-inspector-note">Generate or select a room program first.</div>
        )}
      </section>

      {entry ? (
        <section className="location-room-inspector-card location-room-inspector-card--status" aria-label="Room status">
          <div className="location-room-inspector-card__head">
            <span>Room Status</span>
            {nextMissingRow ? <small>Next: {nextMissingRow.slot.label}</small> : <small>Ready</small>}
          </div>
          <LocationRoomWorkMeter progress={roomProgress} />
          <div className="location-room-inspector-note">
            {entry.status === "ready"
              ? "This room has the required table-facing pieces. Move to the next room or review export."
              : entry.status === "partial"
                ? `Missing: ${entry.missingSlots.join(", ")}. Click the next empty slot below to open a filtered picker.`
                : "Start with the suggested slot below, then fill the remaining room work slots."}
          </div>
        </section>
      ) : null}

      {entry ? (
        <LocationRoomNavigator
          activeRegionId={entry.id}
          entries={roomEntries}
          onSelectRoom={onSelectRoom}
        />
      ) : null}

      <section className="location-room-inspector-card location-room-inspector-card--slots" aria-label="Room work slots">
        <div className="location-room-inspector-card__head">
          <span>Room Slots</span>
          {nextMissingRow ? (
            <button
              className="location-room-inspector-mini-btn"
              type="button"
              data-testid="dark-places-room-add-next"
              onClick={() => focusSlot(nextMissingRow.slot.id)}
            >
              <Plus aria-hidden="true" />
              Add Next
            </button>
          ) : null}
        </div>
        <div className="location-room-inspector-slot-stack">
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
                aria-pressed={active}
                onClick={() => focusSlot(row.slot.id)}
                data-key="tooltip-generic"
                data-tooltip={row.slot.label}
                data-tooltip-description={row.filled ? "Open this filled room slot." : "Open a filtered component picker for this room slot."}
              >
                <Icon aria-hidden="true" />
                <span className="location-room-inspector-slot__copy">
                  <strong>{row.slot.label}</strong>
                  <small>{row.components[0]?.title || row.slot.description || "Choose component"}</small>
                </span>
                <span className={cx("location-room-inspector-slot__state", row.filled ? "is-filled" : row.missing ? "is-missing" : "is-optional")}>
                  {row.statusLabel}
                </span>
              </button>
            );
          })}
          {!roomRows.length ? (
            <div className="location-room-inspector-note">Select a room to show its work slots.</div>
          ) : null}
        </div>
      </section>
    </aside>
  );
}
