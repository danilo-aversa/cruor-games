import { LOCATION_SLOT_SCOPE_MAP } from "../model/location-composer-state.js";
import {
  getAssignedComponentsForSlotScope,
  getDefaultSlotIdForScope,
  getLocationSlotsForScope,
  isSlotInScope,
} from "../model/location-composer-selectors.js";
import { getLocationPlaceFrame, getRoomProgramMetrics } from "../model/location-room-program.js";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getMapSlotIconClass(slotId) {
  if (slotId === "sensoryLayer") return "fa-solid fa-eye";
  if (slotId === "visualSigns") return "fa-solid fa-signs-post";
  if (slotId === "lairEffect") return "fa-solid fa-wand-magic-sparkles";
  if (slotId === "creatureCorruption") return "fa-solid fa-skull";
  if (slotId === "hazard") return "fa-solid fa-triangle-exclamation";
  if (slotId === "clue") return "fa-solid fa-magnifying-glass";
  return "fa-solid fa-diamond";
}

function LocationFrameInfoRow({ label, value }) {
  return (
    <span className="location-frame-info-row">
      <small>{label}</small>
      <strong>{value || "—"}</strong>
    </span>
  );
}

function LocationFrameMeter({ description, label, max, value }) {
  const safeMax = Math.max(0, Number(max) || 0);
  const safeValue = Math.max(0, Math.min(Number(value) || 0, safeMax || 0));
  const percent = safeMax ? Math.round((safeValue / safeMax) * 100) : 0;

  return (
    <div className="location-meter">
      <div className="location-meter__head">
        <span>{label}</span>
        <span className="location-meter__value">
          <strong>{safeValue} / {safeMax}</strong>
          <button
            className="tooltip-btn"
            type="button"
            aria-label={`${label} explanation`}
            data-key="tooltip-generic"
            data-tooltip={label}
            data-tooltip-description={description}
          >
            ?
          </button>
        </span>
      </div>
      <div className="location-meter__track">
        <div style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function getSourceLabel(state) {
  const sources = Array.isArray(state?.sourceAnchors) ? state.sourceAnchors : [];
  return sources.find((source) => source && source !== "Any Source") || "Any Source";
}

function getHorrorLabel(state) {
  const horrors = Array.isArray(state?.horrors) ? state.horrors : [];
  return horrors[0] || state?.horror || "Horror";
}

export function LocationMapWideDetailsBlock({
  activeSlot,
  activeSlotScope,
  onFocusSlot,
  pickerOpen = false,
  state,
}) {
  const mapSlots = getLocationSlotsForScope(LOCATION_SLOT_SCOPE_MAP);
  const activeSlotId = isSlotInScope(activeSlot?.id || state.activeSlot, LOCATION_SLOT_SCOPE_MAP)
    ? activeSlot?.id || state.activeSlot
    : getDefaultSlotIdForScope(LOCATION_SLOT_SCOPE_MAP);
  const mapScopeActive = pickerOpen && activeSlotScope === LOCATION_SLOT_SCOPE_MAP;

  function focusMapSlot(slotId) {
    onFocusSlot?.(slotId, LOCATION_SLOT_SCOPE_MAP, state.activeRegionId || "");
  }

  return (
    <div className="location-map-wide-details-block" aria-label="Map-wide details">
      <div className="location-map-details-slot-stack">
        {mapSlots.map((slot) => {
          const assigned = getAssignedComponentsForSlotScope(state, slot.id, LOCATION_SLOT_SCOPE_MAP);
          const active = mapScopeActive && activeSlotId === slot.id;
          return (
            <button
              className={cx("location-map-details-slot", assigned.length ? "is-filled" : "is-empty", active && "is-active")}
              key={slot.id}
              type="button"
              aria-label={`Focus ${slot.label}`}
              aria-pressed={active}
              onClick={() => focusMapSlot(slot.id)}
            >
              <span className="location-map-details-slot__head">
                <span>
                  <i className={getMapSlotIconClass(slot.id)} aria-hidden="true" />
                  {slot.label}
                </span>
                <strong>{assigned.length ? "Filled" : "—"}</strong>
              </span>
              <span className="location-map-details-slot__body">
                <strong>{assigned[0]?.title || "Empty Slot"}</strong>
                <em>{assigned[0]?.description || slot.description || "Map-wide component"}</em>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LocationMapDetailsPanel({
  generatedMapPreview = null,
  mapRequest = null,
  onRenameLocation,
  side = "right",
  state,
}) {
  const frame = getLocationPlaceFrame(state, mapRequest);
  const metrics = getRoomProgramMetrics(state, generatedMapPreview);
  const readyRooms = metrics.ready ?? metrics.readyCount ?? 0;
  const sideClass = side === "left" ? "location-composer__rail--left" : "location-composer__rail--right";
  const sourceLabel = getSourceLabel(state);
  const horrorLabel = getHorrorLabel(state);
  const mapStatus = generatedMapPreview ? "Map Synced" : "Frame Draft";

  return (
    <aside
      className={`cruor-composer-rail location-composer__rail ${sideClass} location-map-details-rail location-frame-info`}
      aria-label="Current Place Frame"
    >
      <section className="location-frame-info-card location-frame-info-card--hero">
        <span>Current Frame</span>
        <label className="location-frame-name-editor location-map-details-name-editor">
          <span className="sr-only">Location name</span>
          <input
            type="text"
            aria-label="Location name"
            value={state.title || ""}
            onChange={(event) => onRenameLocation?.(event.target.value)}
          />
        </label>
        <em>{sourceLabel} · {horrorLabel}</em>
      </section>

      <section className="location-frame-info-card" aria-label="Place frame summary">
        <div className="location-frame-info-grid">
          <LocationFrameInfoRow label="Context" value={frame.context || state.context || "Context"} />
          <LocationFrameInfoRow label="Use" value={frame.use || "Ritual reveal"} />
          <LocationFrameInfoRow label="Route" value={frame.routePressure} />
          <LocationFrameInfoRow label="Scale" value={frame.scale} />
          <LocationFrameInfoRow label="Complexity" value={frame.complexity} />
          <LocationFrameInfoRow label="Status" value={mapStatus} />
        </div>
      </section>

      <section className="location-frame-info-card" aria-label="Location readiness">
        <LocationFrameMeter
          label="Ready Rooms"
          value={readyRooms}
          max={metrics.total || 0}
          description="Ready Rooms measures how many rooms have enough table-facing content to be used in the generated location."
        />
      </section>
    </aside>
  );
}
