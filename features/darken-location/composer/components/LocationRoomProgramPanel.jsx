import { getRoomProgramEntries, getRoomProgramMetrics } from "../model/location-room-program.js";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LocationRoomStatusPips({ entry }) {
  const pips = [
    { id: "hazard", label: "Hazard", icon: "fa-triangle-exclamation" },
    { id: "clue", label: "Clue", icon: "fa-magnifying-glass" },
    { id: "encounterTwist", label: "Twist", icon: "fa-shuffle" },
  ];

  return (
    <span className="location-room-program-pips" aria-label={`${entry.name} room readiness`}>
      {pips.map((pip) => {
        const filled = entry.assignedSlotIds?.has?.(pip.id);
        return (
          <span
            className={cx("location-room-program-pip", filled && "is-filled")}
            key={pip.id}
            title={pip.label}
            aria-label={`${pip.label}: ${filled ? "assigned" : "empty"}`}
            data-key="tooltip-generic"
            data-tooltip={pip.label}
            data-tooltip-description={filled ? "Assigned to this room." : "Still empty for this room."}
          >
            <i className={`fa-solid ${pip.icon}`} aria-hidden="true" />
          </span>
        );
      })}
    </span>
  );
}

export function LocationRoomProgramPanel({
  canEditRooms = false,
  side = "right",
  generatedMapPreview = null,
  state,
  onAddRoom,
  onGenerateMap,
  onRegenerateRoom,
  onRemoveRoom,
  onSelectMode,
  onSelectRoom,
}) {
  const entries = getRoomProgramEntries(state, generatedMapPreview);
  const metrics = getRoomProgramMetrics(state, generatedMapPreview);
  const hasRooms = entries.length > 0;

  const sideClass = side === "left" ? "location-composer__rail--left" : "location-composer__rail--right";

  return (
    <aside
      className={`cruor-composer-rail location-composer__rail ${sideClass} location-room-program-rail`}
      aria-label="Room program"
    >
      <section className="location-room-program-card" aria-label="Room program list">
        <div className="location-room-program-card__head">
          <span>
            <strong>Room Program</strong>
            <small>{metrics.label}</small>
          </span>
          <div className="location-room-program-card__actions">
            <button
              className="cruor-composer-control location-room-program-icon-btn"
              type="button"
              onClick={() => onSelectMode?.("scratch")}
              aria-label="Open room program editor"
              data-key="tooltip-generic"
              data-tooltip="Rooms"
              data-tooltip-description="Open the editable room program."
            >
              <i className="fa-solid fa-list-check" aria-hidden="true" />
            </button>
            {canEditRooms ? (
              <button
                className="cruor-composer-control location-room-program-icon-btn"
                type="button"
                onClick={onAddRoom}
                disabled={entries.length >= 16}
                aria-label="Add room"
                data-key="tooltip-generic"
                data-tooltip="Add Room"
                data-tooltip-description="Adds one room to the current room program."
              >
                <i className="fa-solid fa-plus" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="location-room-program-meter" aria-label="Room program completion">
          <span style={{ "--location-room-program-progress": metrics.progress }} />
        </div>

        <div className="location-room-program-list">
          {hasRooms ? entries.map((entry) => {
            const active = entry.id === state.activeRegionId;
            return (
              <article
                className={cx(
                  "location-room-program-row",
                  active && "is-active",
                  `is-${entry.status}`,
                )}
                key={entry.id}
              >
                <button
                  className="location-room-program-row__main"
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectRoom?.(entry.id)}
                >
                  <strong>{entry.numberLabel}</strong>
                  <span>
                    <em>{entry.name}</em>
                    <small>{entry.roleLabel} · {entry.roomTypeLabel}</small>
                  </span>
                </button>
                <LocationRoomStatusPips entry={entry} />
                {canEditRooms ? (
                  <div className="location-room-program-row__actions" aria-label={`${entry.name} actions`}>
                    <button
                      className="cruor-composer-control location-room-program-icon-btn"
                      type="button"
                      onClick={() => onRegenerateRoom?.(entry.id)}
                      aria-label={`Regenerate ${entry.name}`}
                    >
                      <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
                    </button>
                    <button
                      className="cruor-composer-control location-room-program-icon-btn"
                      type="button"
                      onClick={() => onRemoveRoom?.(entry.id)}
                      disabled={entries.length <= 1}
                      aria-label={`Remove ${entry.name}`}
                    >
                      <i className="fa-solid fa-trash-can" aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </article>
            );
          }) : (
            <div className="location-room-program-empty">
              <strong>No rooms yet</strong>
              <span>Generate a place frame or add scratch rooms.</span>
            </div>
          )}
        </div>
      </section>

      <section className="location-room-program-actions" aria-label="Room program actions">
        <button
          className="cruor-composer-control location-primary-action"
          type="button"
          onClick={onGenerateMap}
          disabled={!hasRooms}
        >
          Generate Map
        </button>
        <button
          className="cruor-composer-control location-secondary-action"
          type="button"
          onClick={() => onSelectMode?.("theme")}
        >
          Edit Frame
        </button>
      </section>
    </aside>
  );
}
