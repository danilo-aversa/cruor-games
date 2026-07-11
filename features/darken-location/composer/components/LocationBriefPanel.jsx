import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ComposerCollapsibleSection, ComposerRail } from "../../../../components/ui/composer-rail.jsx";
import { getDungeonThemes } from "../../dungeon/dungeon.index.js";
import {
  SCRATCH_ROOM_ROLE_OPTIONS,
  SCRATCH_ROOM_TYPE_OPTIONS,
  normalizeScratchRoomCount,
} from "../model/location-composer-state.js";

const CONTEXT_OPTIONS = ["Crypt", "Chapel", "Cave", "Mine", "Ruins", "Noble House", "Village", "Forest"];
const HORROR_OPTIONS = ["Religious Horror", "Body Horror", "Gothic", "Folk Horror", "Psychological Horror", "Cosmic Horror", "Disease Horror"];
const DUNGEON_THEME_OPTIONS = getDungeonThemes()
  .map((theme) => ({
    value: theme.id,
    label: theme.name,
    description: theme.defaultArchetype?.replace(/_/g, " ") || "Theme profile",
    theme,
  }));
const DUNGEON_SCALE_OPTIONS = [
  { value: "small", label: "Small", icon: "fa-compress", description: "A compact site with 4–6 rooms." },
  { value: "medium", label: "Medium", icon: "fa-vector-square", description: "A balanced site with 7–10 rooms." },
  { value: "large", label: "Large", icon: "fa-expand", description: "A broad site with 11–16 rooms." },
  { value: "custom", label: "Custom", icon: "fa-sliders", description: "Choose the exact number of rooms." },
];
const DUNGEON_COMPLEXITY_OPTIONS = [
  { value: "simple", label: "Simple", icon: "fa-minus", description: "Fewer branches and a cleaner route." },
  { value: "standard", label: "Standard", icon: "fa-grip", description: "A balanced dungeon structure." },
  { value: "complex", label: "Complex", icon: "fa-code-branch", description: "More branches, loops, and routing pressure." },
];
const SCRATCH_ROOM_SIZE_ICON_OPTIONS = [
  { value: "Small", label: "Small", icon: "fa-compress", description: "A compact room or connector." },
  { value: "Medium", label: "Medium", icon: "fa-vector-square", description: "A standard room footprint." },
  { value: "Large", label: "Large", icon: "fa-expand", description: "A larger room or setpiece chamber." },
];
const SCRATCH_ROOM_LEVEL_ICON_OPTIONS = [
  { value: "-1", label: "Below", icon: "fa-arrow-down", description: "Below the main level." },
  { value: "0", label: "Ground", icon: "fa-minus", description: "Main dungeon level." },
  { value: "1", label: "Above", icon: "fa-arrow-up", description: "Above the main level." },
];
const LOCATION_FIELD_HELP = {
  theme: {
    title: "Theme",
    description: "Sets the internal room vocabulary, layout bias, and dark-fantasy texture used to generate the map.",
  },
  themeAssist: {
    title: "Theme Assist",
    description: "Keeps Scratch Mode guided by a theme while still letting you edit rooms manually.",
  },
  context: {
    title: "Context",
    description: "Defines what kind of place the generator should build, such as a crypt, chapel, cave, ruins, or noble house.",
  },
  horror: {
    title: "Horror",
    description: "Sets the main horror lens used when choosing atmosphere, threats, and room pressure.",
  },
  scale: {
    title: "Scale",
    description: "Small: 4–6 rooms. Medium: 7–10 rooms. Large: 11–16 rooms. Custom: choose the exact room count.",
  },
  complexity: {
    title: "Complexity",
    description: "Simple keeps the route cleaner. Standard balances branches. Complex creates more branching and loops.",
  },
  roomCount: {
    title: "Room Count",
    description: "Sets the exact number of rooms when Scale is Custom.",
  },
  scratchRooms: {
    title: "Rooms",
    description: "Sets how many hand-authored rooms Scratch Mode should send to the map generator.",
  },
  scratchRole: {
    title: "Role",
    description: "Defines the room's function in the location flow.",
  },
  scratchType: {
    title: "Room Type",
    description: "Defines the room vocabulary the map and export should use.",
  },
  scratchSize: {
    title: "Size",
    description: "Controls the requested footprint for this room.",
  },
  scratchLevel: {
    title: "Level",
    description: "Places the room below, on, or above the main level.",
  },
  scratchDetail: {
    title: "Detail",
    description: "Optional content note preserved for the room export.",
  },
};
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function toChoiceArray(value) {
  if (value instanceof Set) return Array.from(value);
  if (Array.isArray(value)) return value;
  if (value) return [value];
  return [];
}

function getOptionValue(option) {
  return typeof option === "string" ? option : option.value;
}

function getOptionLabel(option) {
  return typeof option === "string" ? option : option.label || option.value;
}

function getOptionIcon(option, fallback = "fa-circle-dot") {
  return typeof option === "string" ? fallback : option.icon || fallback;
}

function getHelpPayload(help) {
  if (!help) return null;
  if (typeof help === "string") return { title: help, description: "" };
  return {
    title: help.title || "Help",
    description: help.description || "",
  };
}

function LocationFieldLabel({ help, label, value = "" }) {
  const payload = getHelpPayload(help);
  const valueLabel = typeof value === "string" && value.trim() ? value.trim() : "";

  return (
    <div className="cruor-frame-field-head location-frame-field-head">
      <span>{label}</span>
      {valueLabel ? <strong>{valueLabel}</strong> : null}
      {payload ? (
        <span
          className="cruor-frame-help location-field-help"
          tabIndex={0}
          role="button"
          aria-label={`${payload.title}: ${payload.description}`}
          data-key="tooltip-generic"
          data-tooltip={payload.title}
          data-tooltip-description={payload.description}
        >
          <span aria-hidden="true">?</span>
        </span>
      ) : null}
    </div>
  );
}

function normalizeCustomRoomCount(value, fallback = 8) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(16, parsed));
}

function LocationChoiceField({ help, icon = "fa-circle-dot", label, meta, onChange, options, placeholder = "Choose option", value }) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const fieldRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const selectedOption = useMemo(
    () => options.find((option) => String(getOptionValue(option)) === String(value)),
    [options, value],
  );
  const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : placeholder;

  function updateMenuPosition() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setMenuPosition({
      left: rect.left,
      top: rect.bottom + 6,
      width: rect.width,
    });
  }

  useLayoutEffect(() => {
    if (!open) return undefined;
    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (fieldRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const menu = open && menuPosition
    ? createPortal(
        <div
          className="location-choice-menu location-choice-menu--portal cruor-frame-select-menu"
          ref={menuRef}
          role="listbox"
          aria-label={label}
          style={{
            left: `${menuPosition.left}px`,
            top: `${menuPosition.top}px`,
            width: `${menuPosition.width}px`,
          }}
        >
          {options.map((option) => {
            const optionValue = getOptionValue(option);
            const optionLabel = getOptionLabel(option);
            const active = String(optionValue) === String(value);
            return (
              <button
                className={cx("location-choice-option cruor-frame-select-option", active && "is-active")}
                key={optionValue}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(optionValue);
                  setOpen(false);
                }}
              >
                <i className={`fa-solid ${getOptionIcon(option, icon)}`} aria-hidden="true" />
                <span>
                  <strong>{optionLabel}</strong>
                </span>
              </button>
            );
          })}
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="location-field location-choice-field cruor-frame-select-field" ref={fieldRef}>
      <LocationFieldLabel label={label} help={help} />
      <button
        className="cruor-composer-control location-choice-trigger cruor-frame-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        ref={triggerRef}
        onClick={() => setOpen((current) => !current)}
      >
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
        <strong>{selectedLabel}</strong>
        {meta ? <small>{meta}</small> : null}
      </button>
      {menu}
    </div>
  );
}

function LocationIconToggleField({ help, label, onChange, options, value }) {
  const selectedOption = options.find((option) => String(option.value) === String(value));
  const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : "";

  return (
    <div className="location-field location-icon-toggle-field cruor-frame-select-field cruor-frame-icon-field">
      <LocationFieldLabel label={label} help={help} value={selectedLabel} />
      <div className="location-icon-toggle-grid cruor-frame-icon-toggle-row" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const active = String(option.value) === String(value);
          const optionLabel = getOptionLabel(option);
          return (
            <button
              className={cx("location-icon-toggle-button cruor-frame-icon-toggle", active && "is-active")}
              key={option.value}
              type="button"
              role="radio"
              aria-label={optionLabel}
              aria-checked={active}
              aria-disabled="false"
              data-key="tooltip-generic"
              data-tooltip={optionLabel}
              data-tooltip-description={option.description || optionLabel}
              onClick={() => onChange(option.value)}
            >
              <i className={`fa-solid ${getOptionIcon(option)}`} aria-hidden="true" />
              <span className="sr-only">{optionLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LocationRoomCountSlider({ count, help = LOCATION_FIELD_HELP.roomCount, label = "Rooms", onChange }) {
  const value = normalizeCustomRoomCount(count, 8);

  return (
    <div className="location-field location-custom-room-count-field cruor-frame-range-control">
      <LocationFieldLabel label={label} help={help} />
      <div className="location-room-count-slider cruor-frame-range-row">
        <input
          className="cruor-frame-range location-room-count-range"
          type="range"
          min="1"
          max="16"
          step="1"
          value={value}
          aria-label="Custom room count slider"
          onChange={(event) => onChange(normalizeCustomRoomCount(event.target.value, value))}
        />
        <input
          className="cruor-frame-number location-room-count-number"
          type="number"
          min="1"
          max="16"
          value={value}
          aria-label="Custom room count number"
          onChange={(event) => onChange(normalizeCustomRoomCount(event.target.value, value))}
        />
      </div>
    </div>
  );
}

function LocationBuildModeField({ mode, onChange }) {
  return (
    <div className="location-field location-theme-mode-field">
      <span>Mode</span>
      <div className="location-map-mode-switch location-theme-mode-switch" role="group" aria-label="Dungeon build mode">
        {[
          { value: "theme", label: "Theme Mode" },
          { value: "scratch", label: "Scratch Mode" },
        ].map((option) => {
          const active = mode === option.value;
          return (
            <button
              className={cx("location-map-mode-button", active && "is-active")}
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LocationThemeRoomProgram({ regions = [] }) {
  const visibleRegions = Array.isArray(regions) ? regions.slice(0, 8) : [];
  if (!visibleRegions.length) return null;

  return (
    <section className="location-theme-room-program" aria-label="Generated room program">
      <div className="location-theme-room-program__head">
        <span>Room Program</span>
        <strong>{regions.length}</strong>
      </div>
      <div className="location-theme-room-program__list">
        {visibleRegions.map((region, index) => (
          <article className="location-theme-room-row" key={region.id || index}>
            <strong>{String(index + 1).padStart(2, "0")}</strong>
            <span>
              <em>{region.name || `Room ${index + 1}`}</em>
              <small>{region.role || region.roomType || region.shape || "Location Region"}</small>
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function LocationThemeLoadedProgram({ regions = [] }) {
  const roomCount = Array.isArray(regions) ? regions.length : 0;

  return (
    <section className="location-theme-ready-state" aria-label="Theme generation status">
      <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
      <span>
        <strong>{roomCount ? "Program Loaded" : "Ready"}</strong>
        <small>{roomCount ? `${roomCount} rooms ready for the map.` : "Generate a map from the selected theme."}</small>
      </span>
    </section>
  );
}

function normalizeRoomFieldValue(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function createChoiceOptions(values = []) {
  return values.map((value) => ({
    value,
    label: String(value)
      .replace(/[-_]+/g, " ")
      .replace(/(^|\s)(\S)/g, (_, spacer, letter) => `${spacer}${letter.toUpperCase()}`),
  }));
}

function LocationScratchRoomCountField({ count, onChange }) {
  return (
    <LocationRoomCountSlider
      count={count || 1}
      help={LOCATION_FIELD_HELP.scratchRooms}
      label="Rooms"
      onChange={(roomCount) => onChange(normalizeScratchRoomCount(roomCount, count || 1))}
    />
  );
}

function LocationScratchGenerateAction({ disabled = false, onGenerateMap }) {
  return (
    <button
      className="cruor-composer-control location-primary-action location-scratch-generate-button"
      type="button"
      disabled={disabled}
      onClick={onGenerateMap}
    >
      Generate Map
    </button>
  );
}

function LocationScratchTextField({ help = LOCATION_FIELD_HELP.scratchDetail, label, onChange, value }) {
  return (
    <label className="location-field location-scratch-text-field">
      <LocationFieldLabel label={label} help={help} />
      <input
        className="location-scratch-input"
        type="text"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function LocationScratchRoomList({ activeRegionId, onAddRoom, onRegenerateRoom, onRemoveRoom, onSelectRoom, regions = [] }) {
  const visibleRegions = Array.isArray(regions) ? regions : [];

  return (
    <section className="location-scratch-room-list" aria-label="Scratch room list">
      <div className="location-scratch-room-list__head">
        <span>Room List</span>
        <button
          className="cruor-composer-control location-scratch-icon-button"
          type="button"
          onClick={onAddRoom}
          disabled={visibleRegions.length >= 16}
          aria-label="Add room"
          data-key="tooltip-generic"
          data-tooltip="Add Room"
          data-tooltip-description="Adds one editable room to the Scratch program."
        >
          <i className="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
      </div>
      <div className="location-scratch-room-list__items">
        {visibleRegions.map((region, index) => {
          const active = region.id === activeRegionId;
          return (
            <article className={cx("location-scratch-room-row", active && "is-active")} key={region.id || index}>
              <button
                className="location-scratch-room-row__main"
                type="button"
                aria-pressed={active}
                onClick={() => onSelectRoom(region.id)}
              >
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <span>
                  <em>{region.name || `Room ${index + 1}`}</em>
                  <small>{region.role || region.roomType || region.shape || "Room"}</small>
                </span>
              </button>
              <div className="location-scratch-room-row__actions" aria-label={`Room ${index + 1} actions`}>
                <button
                  className="cruor-composer-control location-scratch-icon-button"
                  type="button"
                  onClick={() => onRegenerateRoom(region.id)}
                  aria-label={`Regenerate ${region.name || `room ${index + 1}`}`}
                  data-key="tooltip-generic"
                  data-tooltip="Regenerate Room"
                  data-tooltip-description="Rebuilds this room while keeping its position in the Scratch program."
                >
                  <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i>
                </button>
                <button
                  className="cruor-composer-control location-scratch-icon-button"
                  type="button"
                  onClick={() => onRemoveRoom(region.id)}
                  disabled={visibleRegions.length <= 1}
                  aria-label={`Remove ${region.name || `room ${index + 1}`}`}
                  data-key="tooltip-generic"
                  data-tooltip="Remove Room"
                  data-tooltip-description="Removes this room from the Scratch program."
                >
                  <i className="fa-solid fa-trash-can" aria-hidden="true"></i>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function LocationScratchRoomEditor({ className = "", onFocusSlot = null, onUpdateRoom, region }) {
  if (!region) {
    return (
      <section className={cx("location-scratch-room-editor", className)} aria-label="Selected room">
        <div className="location-scratch-room-editor__empty">Select a room.</div>
      </section>
    );
  }

  const roleOptions = createChoiceOptions(SCRATCH_ROOM_ROLE_OPTIONS);
  const typeOptions = createChoiceOptions(SCRATCH_ROOM_TYPE_OPTIONS);

  return (
    <section className={cx("location-scratch-room-editor", className)} aria-label="Selected room editor">
      <div className="location-scratch-room-editor__head">
        <span>Selected Room</span>
        <strong>{region.name || "Room"}</strong>
      </div>
      <LocationScratchTextField
        label="Name"
        value={region.name || ""}
        onChange={(name) => onUpdateRoom(region.id, { name })}
      />
      <LocationChoiceField
        help={LOCATION_FIELD_HELP.scratchRole}
        icon="fa-signs-post"
        label="Role"
        value={normalizeRoomFieldValue(region.role, "transition")}
        options={roleOptions}
        onChange={(role) => onUpdateRoom(region.id, { role, tags: [role, region.roomType || region.shape].filter(Boolean) })}
      />
      <LocationChoiceField
        help={LOCATION_FIELD_HELP.scratchType}
        icon="fa-vector-square"
        label="Room Type"
        value={normalizeRoomFieldValue(region.roomType || region.shape, "corridor")}
        options={typeOptions}
        onChange={(roomType) => onUpdateRoom(region.id, { roomType, shape: roomType, preferredShape: roomType, tags: [region.role, roomType].filter(Boolean) })}
      />
      <div className="location-scratch-room-feature-actions" aria-label="Selected room feature slots">
        <button
          className="cruor-composer-control location-scratch-room-feature-action"
          type="button"
          onClick={() => onFocusSlot?.("sensoryLayer")}
        >
          <i className="fa-solid fa-eye" aria-hidden="true" />
          <span>Sensory</span>
        </button>
        <button
          className="cruor-composer-control location-scratch-room-feature-action"
          type="button"
          onClick={() => onFocusSlot?.("hazard")}
        >
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <span>Hazard</span>
        </button>
        <button
          className="cruor-composer-control location-scratch-room-feature-action"
          type="button"
          onClick={() => onFocusSlot?.("clue")}
        >
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <span>Clue</span>
        </button>
        <button
          className="cruor-composer-control location-scratch-room-feature-action"
          type="button"
          onClick={() => onFocusSlot?.("reward")}
        >
          <i className="fa-solid fa-gem" aria-hidden="true" />
          <span>Reward</span>
        </button>
      </div>
    </section>
  );
}

export function LocationScratchRoomSizeLevelControls({ region, onUpdateRoom }) {
  if (!region || typeof onUpdateRoom !== "function") return null;
  const sizeValue = normalizeRoomFieldValue(region.size, "Medium");
  const levelValue = String(region.level ?? 0);

  function updateSize(size) {
    onUpdateRoom(region.id, { size });
  }

  function updateLevel(level) {
    onUpdateRoom(region.id, { level: Number(level) });
  }

  return (
    <div className="location-scratch-room-context-menu__size-level" aria-label={`Quick controls for ${region.name || "selected room"}`}>
      <div className="location-scratch-room-size-level-group" role="radiogroup" aria-label="Room size">
        {SCRATCH_ROOM_SIZE_ICON_OPTIONS.map((option) => (
          <button
            className={cx("location-scratch-room-size-level-toggle", option.value === sizeValue && "is-active")}
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === sizeValue}
            aria-label={`Size: ${option.label}`}
            title={`Size: ${option.label}`}
            onClick={(event) => {
              event.stopPropagation();
              updateSize(option.value);
            }}
          >
            <i className={`fa-solid ${option.icon}`} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="location-scratch-room-size-level-group" role="radiogroup" aria-label="Room level">
        {SCRATCH_ROOM_LEVEL_ICON_OPTIONS.map((option) => (
          <button
            className={cx("location-room-map-quick-toggle", option.value === levelValue && "is-active")}
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === levelValue}
            aria-label={`Level: ${option.label}`}
            title={`Level: ${option.label}`}
            onClick={(event) => {
              event.stopPropagation();
              updateLevel(option.value);
            }}
          >
            <i className={`fa-solid ${option.icon}`} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

export const LocationScratchRoomContextMenu = forwardRef(function LocationScratchRoomContextMenu(
  { region, x = 0, y = 0, onClose, onFocusSlot, onUpdateRoom },
  ref,
) {
  if (!region || typeof onUpdateRoom !== "function") return null;

  const roleOptions = createChoiceOptions(SCRATCH_ROOM_ROLE_OPTIONS);
  const typeOptions = createChoiceOptions(SCRATCH_ROOM_TYPE_OPTIONS);

  function focusSlot(slotId) {
    onFocusSlot?.(slotId, region.id);
  }

  return (
    <div
      ref={ref}
      className="location-scratch-room-context-menu"
      role="menu"
      aria-label={`Room options for ${region.name || "selected room"}`}
      style={{ left: `${Math.max(8, x)}px`, top: `${Math.max(8, y)}px` }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <div className="location-scratch-room-context-menu__head">
        <span>Room Options</span>
        <strong>{region.name || "Room"}</strong>
        <button type="button" aria-label="Close room options" onClick={onClose}>
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </div>
      <div className="location-scratch-room-context-menu__body">
        <LocationScratchTextField
          label="Name"
          value={region.name || ""}
          onChange={(name) => onUpdateRoom(region.id, { name })}
        />
        <LocationScratchRoomSizeLevelControls
          region={region}
          onUpdateRoom={onUpdateRoom}
        />
        <LocationChoiceField
          help={LOCATION_FIELD_HELP.scratchRole}
          icon="fa-signs-post"
          label="Role"
          value={normalizeRoomFieldValue(region.role, "transition")}
          options={roleOptions}
          onChange={(role) => onUpdateRoom(region.id, { role, tags: [role, region.roomType || region.shape].filter(Boolean) })}
        />
        <LocationChoiceField
          help={LOCATION_FIELD_HELP.scratchType}
          icon="fa-vector-square"
          label="Room Type"
          value={normalizeRoomFieldValue(region.roomType || region.shape, "corridor")}
          options={typeOptions}
          onChange={(roomType) => onUpdateRoom(region.id, { roomType, shape: roomType, preferredShape: roomType, tags: [region.role, roomType].filter(Boolean) })}
        />
        <div className="location-scratch-room-context-menu__actions" aria-label="Room feature slots">
          <button className="cruor-composer-control location-scratch-room-feature-action" type="button" onClick={() => focusSlot("sensoryLayer")}>
            <i className="fa-solid fa-eye" aria-hidden="true" />
            <span>Sensory</span>
          </button>
          <button className="cruor-composer-control location-scratch-room-feature-action" type="button" onClick={() => focusSlot("hazard")}>
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <span>Hazard</span>
          </button>
          <button className="cruor-composer-control location-scratch-room-feature-action" type="button" onClick={() => focusSlot("clue")}>
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <span>Clue</span>
          </button>
          <button className="cruor-composer-control location-scratch-room-feature-action" type="button" onClick={() => focusSlot("reward")}>
            <i className="fa-solid fa-gem" aria-hidden="true" />
            <span>Reward</span>
          </button>
        </div>
      </div>
    </div>
  );
});

export function LocationBriefPanel({
  state,
  setState,
  mapRequest,
  mapPlanDetails = null,
  draftControls,
  modeControls,
  forcedDungeonMode = "",
  showGenerateAction = true,
  uiMode = "simple",
  onAddScratchRoom,
  onGenerateScratchMap,
  onGenerateThemeRooms,
  onRegenerateScratchRoom,
  onRemoveScratchRoom,
  onSelectScratchRoom,
  onSetScratchRoomCount,
  onUpdateScratchRoom,
}) {
  const selectedHorror = toChoiceArray(state.horrors)[0] || state.horror || "";
  const forcedMode = forcedDungeonMode === "scratch" || forcedDungeonMode === "theme" ? forcedDungeonMode : "";
  const dungeonMode = forcedMode || (state.dungeonMode === "scratch" ? "scratch" : "theme");
  const selectedThemeId = state.dungeonThemeId || "generic-dark-location";
  const regions = Array.isArray(state.locationRegions) ? state.locationRegions : [];

  const themeChoiceField = dungeonMode === "theme" ? (
    <LocationChoiceField
      help={LOCATION_FIELD_HELP.theme}
      icon="fa-book-dead"
      label="Theme"
      value={selectedThemeId}
      placeholder="Choose dungeon theme"
      options={DUNGEON_THEME_OPTIONS}
      onChange={(themeId) => {
        const selectedTheme = DUNGEON_THEME_OPTIONS.find((option) => option.value === themeId)?.theme;
        setState((current) => ({
          ...current,
          dungeonThemeId: themeId,
          sourceAnchors: selectedTheme?.sourceAnchorIds?.length && selectedTheme?.name ? [selectedTheme.name] : current.sourceAnchors,
          context: selectedTheme?.mapTypeBias?.[0] || current.context,
          themeProgramCandidates: [],
          activeThemeProgramCandidateId: "",
        }));
      }}
    />
  ) : (
    <LocationChoiceField
      help={LOCATION_FIELD_HELP.themeAssist}
      icon="fa-book-dead"
      label="Theme Assist"
      value={selectedThemeId}
      placeholder="Choose optional theme"
      options={DUNGEON_THEME_OPTIONS}
      onChange={(themeId) => {
        const selectedTheme = DUNGEON_THEME_OPTIONS.find((option) => option.value === themeId)?.theme;
        setState((current) => ({
          ...current,
          dungeonThemeId: themeId,
          sourceAnchors: selectedTheme?.sourceAnchorIds?.length && selectedTheme?.name ? [selectedTheme.name] : current.sourceAnchors,
          context: selectedTheme?.mapTypeBias?.[0] || current.context,
          themeProgramCandidates: [],
          activeThemeProgramCandidateId: "",
        }));
      }}
    />
  );

  const contextChoiceField = (
    <LocationChoiceField
      help={LOCATION_FIELD_HELP.context}
      icon="fa-dungeon"
      label="Context"
      value={state.context || ""}
      options={CONTEXT_OPTIONS}
      onChange={(context) => setState((current) => ({
        ...current,
        context,
        themeProgramCandidates: [],
        activeThemeProgramCandidateId: "",
      }))}
    />
  );

  const horrorChoiceField = (
    <LocationChoiceField
      help={LOCATION_FIELD_HELP.horror}
      icon="fa-skull"
      label="Horror"
      value={selectedHorror}
      placeholder="Choose horror direction"
      options={HORROR_OPTIONS}
      onChange={(horror) =>
        setState((current) => ({
          ...current,
          horror,
          horrors: horror ? [horror] : [],
          themeProgramCandidates: [],
          activeThemeProgramCandidateId: "",
        }))
      }
    />
  );

  return (
    <ComposerRail
      side="left"
      variant="controls"
      surface
      scrollable={dungeonMode !== "theme"}
      className="location-composer__rail location-composer__rail--left location-map-frame-rail"
      aria-label="Location frame"
    >
      {modeControls ? modeControls : null}

      {!forcedMode ? (
        <ComposerCollapsibleSection
          className="location-frame-control-block location-frame-control-block--mode"
          title="Mode"
          headerClassName="location-frame-control-block__head"
          bodyClassName="location-frame-selector-stack"
          aria-label="Build mode"
        >
            <LocationBuildModeField
              mode={dungeonMode}
              onChange={(dungeonMode) =>
                setState((current) => ({
                  ...current,
                  dungeonMode,
                }))
              }
            />
        </ComposerCollapsibleSection>
      ) : null}

      {draftControls ? (
        <ComposerCollapsibleSection
          className="location-frame-control-block location-frame-control-block--draft"
          title="Draft"
          headerClassName="location-frame-control-block__head"
          bodyClassName="location-frame-selector-stack"
          aria-label="Draft controls"
        >
            {draftControls}
        </ComposerCollapsibleSection>
      ) : null}

      {dungeonMode === "theme" ? (
        <>
          <ComposerCollapsibleSection
          className="location-frame-control-block"
          title="Theme"
          headerClassName="location-frame-control-block__head"
          bodyClassName="location-frame-selector-stack"
          aria-label="Location theme controls"
        >
              {themeChoiceField}
              {contextChoiceField}
              {horrorChoiceField}
        </ComposerCollapsibleSection>

          <ComposerCollapsibleSection
          className="location-frame-control-block"
          title="Map Plan"
          headerClassName="location-frame-control-block__head"
          bodyClassName="location-frame-selector-stack"
          aria-label="Location map controls"
        >
              <LocationIconToggleField
                help={LOCATION_FIELD_HELP.scale}
                label="Scale"
                value={state.dungeonScale || "medium"}
                options={DUNGEON_SCALE_OPTIONS}
                onChange={(dungeonScale) => setState((current) => ({
                  ...current,
                  dungeonScale,
                  dungeonCustomRoomCount: dungeonScale === "custom"
                    ? normalizeCustomRoomCount(current.dungeonCustomRoomCount, Array.isArray(current.locationRegions) && current.locationRegions.length ? current.locationRegions.length : 8)
                    : current.dungeonCustomRoomCount,
                  themeProgramCandidates: [],
                  activeThemeProgramCandidateId: "",
                }))}
              />

              {(state.dungeonScale || "medium") === "custom" ? (
                <LocationRoomCountSlider
                  count={state.dungeonCustomRoomCount || 8}
                  onChange={(dungeonCustomRoomCount) => setState((current) => ({
                    ...current,
                    dungeonScale: "custom",
                    dungeonCustomRoomCount,
                    themeProgramCandidates: [],
                    activeThemeProgramCandidateId: "",
                  }))}
                />
              ) : null}

              <LocationIconToggleField
                help={LOCATION_FIELD_HELP.complexity}
                label="Complexity"
                value={state.dungeonComplexity || "standard"}
                options={DUNGEON_COMPLEXITY_OPTIONS}
                onChange={(dungeonComplexity) => setState((current) => ({
                  ...current,
                  dungeonComplexity,
                  themeProgramCandidates: [],
                  activeThemeProgramCandidateId: "",
                }))}
              />

              {showGenerateAction ? (
                <button
                  className="cruor-composer-control location-primary-action location-theme-generate-button"
                  type="button"
                  onClick={onGenerateThemeRooms}
                >
                  Generate Map
                </button>
              ) : null}
        </ComposerCollapsibleSection>

          {mapPlanDetails}

          {uiMode === "debug" && Array.isArray(state.locationRegions) && state.locationRegions.length ? (
            <ComposerCollapsibleSection
              className="location-frame-control-block location-frame-control-block--debug"
              title="Debug Program"
              headerClassName="location-frame-control-block__head"
              bodyClassName="location-frame-selector-stack"
              aria-label="Debug map program"
            >
                <LocationThemeLoadedProgram regions={state.locationRegions} />
            </ComposerCollapsibleSection>
          ) : null}
        </>
      ) : (
        <>
          <ComposerCollapsibleSection
          className="location-frame-control-block"
          title="Rooms"
          headerClassName="location-frame-control-block__head"
          bodyClassName="location-frame-selector-stack"
          aria-label="Scratch room controls"
        >
              {themeChoiceField}
              {contextChoiceField}
              {horrorChoiceField}
              <LocationScratchRoomCountField
                count={regions.length || 1}
                onChange={onSetScratchRoomCount}
              />
              <LocationScratchGenerateAction
                disabled={!regions.length}
                onGenerateMap={onGenerateScratchMap}
              />
        </ComposerCollapsibleSection>

          <ComposerCollapsibleSection
          className="location-frame-control-block location-frame-control-block--room-list"
          title="Room List"
          headerClassName="location-frame-control-block__head"
          bodyClassName="location-frame-selector-stack"
          aria-label="Scratch room navigation"
        >
              <LocationScratchRoomList
                activeRegionId={state.activeRegionId}
                regions={regions}
                onAddRoom={onAddScratchRoom}
                onRegenerateRoom={onRegenerateScratchRoom}
                onRemoveRoom={onRemoveScratchRoom}
                onSelectRoom={onSelectScratchRoom}
              />
        </ComposerCollapsibleSection>
        </>
      )}
    </ComposerRail>
  );
}
