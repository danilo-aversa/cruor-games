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

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function titleCaseLabel(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)(\S)/g, (_, spacer, letter) => `${spacer}${letter.toUpperCase()}`);
}

function getComponentMapInfluence(component = {}) {
  return component?.mapInfluence || component?.location?.mapInfluence || component?.locationRegion?.mapInfluence || component?.map?.mapInfluence || null;
}

function getRoomSlotMapInfluenceLabel(row = {}) {
  const influences = toArray(row.components).map(getComponentMapInfluence).filter(Boolean);
  if (!influences.length) return "";
  const forced = influences.find((influence) => influence.forceRoomArchetype || influence.force || influence.required);
  const source = forced || influences[0];
  const preferred = [
    source.roomArchetype,
    source.roomArchetypeId,
    source.forcedRoomArchetype,
    source.forcedRoomArchetypeId,
    ...toArray(source.preferredRoomArchetypes),
    ...toArray(source.preferredRoomArchetypeIds),
  ].filter(Boolean)[0];
  if (!preferred) return `${influences.length} map influence${influences.length === 1 ? "" : "s"}`;
  return `${forced ? "Forces" : "Suggests"} ${titleCaseLabel(preferred)}`;
}
function getRoomSlotMapInfluenceTarget(row = {}) {
  const sourceEntry = getRoomSlotMapInfluenceSource(row);
  const influence = sourceEntry?.influence || null;
  return [
    influence?.roomArchetype,
    influence?.roomArchetypeId,
    influence?.forcedRoomArchetype,
    influence?.forcedRoomArchetypeId,
    ...toArray(influence?.preferredRoomArchetypes),
    ...toArray(influence?.preferredRoomArchetypeIds),
  ].filter(Boolean)[0] || "";
}

function getRoomMapInfluenceFact(entry = {}) {
  const count = Number(entry?.mapInfluenceCount || 0);
  if (count > 0) return `${count} Component${count === 1 ? "" : "s"}`;
  if (entry?.roomArchetypeHasMapInfluence) return "Map Influence";
  return "—";
}

function getRoomMapInfluenceStatus(entry = {}) {
  if (entry?.roomArchetypeForced) return "Forced";
  if (entry?.roomArchetypeHasMapInfluence) return "Suggested";
  return "Auto";
}


function getRoomSlotMapInfluenceSource(row = {}) {
  const components = toArray(row.components);
  const entries = components
    .map((component) => ({ component, influence: getComponentMapInfluence(component) }))
    .filter((entry) => entry.influence);
  if (!entries.length) return null;
  const forced = entries.find(
    ({ influence }) => influence.forceRoomArchetype || influence.force || influence.required,
  );
  return forced || entries[0];
}

function getRoomMapInfluenceNote(entry = {}, rows = []) {
  if (!entry?.roomArchetypeHasMapInfluence) return "";
  const sourceEntry = rows.map(getRoomSlotMapInfluenceSource).find(Boolean);
  const influence = sourceEntry?.influence || null;
  const component = sourceEntry?.component || null;
  const target =
    entry.roomArchetypeLabel ||
    titleCaseLabel(
      influence?.roomArchetype ||
        influence?.roomArchetypeId ||
        influence?.forcedRoomArchetype ||
        influence?.forcedRoomArchetypeId ||
        toArray(influence?.preferredRoomArchetypes)[0] ||
        toArray(influence?.preferredRoomArchetypeIds)[0] ||
        entry.roomArchetype ||
        "",
    );
  const componentLabel = component?.title || component?.label || influence?.source || "assigned component";
  const verb = influence?.forceRoomArchetype || influence?.force || influence?.required ? "forced" : "suggested";
  return target
    ? `Map influence ${verb} ${target} from ${componentLabel}.`
    : `Map influence from ${componentLabel}.`;
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
  const mapInfluenceNote = getRoomMapInfluenceNote(entry, roomRows);
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
          <LocationInspectorFact label="Archetype" value={entry.roomArchetypeLabel || "Auto"} />
          <LocationInspectorFact label="Source" value={entry.roomArchetypeHasMapInfluence ? "Map Influence" : titleCaseLabel(entry.roomArchetypeSource || "Inferred")} />
          <LocationInspectorFact label="Influence" value={getRoomMapInfluenceFact(entry)} />
          <LocationInspectorFact label="Mode" value={getRoomMapInfluenceStatus(entry)} />
          <LocationInspectorFact label="Level" value={String(entry.level)} />
        </div>
        {mapInfluenceNote ? <div className="location-room-inspector-note">{mapInfluenceNote}</div> : null}
      </section>

      <div className="location-room-inspector-slot-stack" role="list" aria-label="Room work slots">
          {roomRows.map((row) => {
            const Icon = getSlotIcon(row.slot.id);
            const active = activeSlotId === row.slot.id;
            const mapInfluenceLabel = getRoomSlotMapInfluenceLabel(row);
            const mapInfluenceTarget = getRoomSlotMapInfluenceTarget(row);
            return (
              <button
                data-testid="dark-places-room-slot"
                data-room-slot-id={row.slot.id}
                data-room-slot-status={row.filled ? "filled" : row.missing ? "missing" : "optional"}
                data-map-influence={mapInfluenceLabel ? "true" : "false"}
                data-map-influence-target={mapInfluenceTarget}
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
                data-tooltip-description={mapInfluenceLabel || (row.filled ? "Open this filled room slot." : "Open a filtered component picker for this room slot.")}
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
                  <em>{mapInfluenceLabel || row.components[0]?.description || row.slot.description || "Choose component"}</em>
                </span>
              </button>
            );
          })}
      </div>
    </aside>
  );
}
