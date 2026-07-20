import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LocationMapToolbarButton({
  active = false,
  children,
  disabled = false,
  icon = "",
  onClick,
  title = "",
  toggle = false,
  variant = "secondary",
  testId = "",
}) {
  const label = title || (typeof children === "string" ? children : "Map action");

  return (
    <button
      className={cx(
        "location-map-toolbar__button",
        "location-icon-toggle-button",
        "cruor-frame-icon-toggle",
        "cruor-square-icon-button",
        variant === "primary" && "cruor-square-icon-button--primary",
        `location-map-toolbar__button--${variant}`,
        active && "is-active",
      )}
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={toggle ? active : undefined}
      aria-label={label}
      title={undefined}
      data-key="tooltip-generic"
      data-tooltip={label}
      data-tooltip-description={label}
      data-testid={testId || undefined}
    >
      {icon ? <i className={`fa-solid ${icon}`} aria-hidden="true" /> : null}
    </button>
  );
}

function LocationMapInlineEditorToolsHost() {
  return (
    <span
      className="location-map-toolbar__inline-editor-tools"
      data-location-map-tools-host="true"
      aria-label="Map editing tools"
    />
  );
}

function getRoomStatusLabel(status = "empty") {
  if (status === "ready") return "Ready";
  if (status === "partial") return "Used";
  return "Empty";
}

function getRoomNumberLabel(room, index) {
  return room?.numberLabel || String((room?.index ?? index) + 1).padStart(2, "0");
}

const ROOM_MENU_WIDTH = 300;
const ROOM_MENU_MAX_HEIGHT = 430;
const ROOM_MENU_VIEWPORT_INSET = 12;
const ROOM_MENU_GAP = 10;

function getRoomMenuPosition(trigger, itemCount = 0) {
  if (!trigger || typeof window === "undefined") return null;

  const rect = trigger.getBoundingClientRect();
  const width = Math.min(
    ROOM_MENU_WIDTH,
    Math.max(180, window.innerWidth - ROOM_MENU_VIEWPORT_INSET * 2),
  );
  const estimatedHeight = Math.min(
    ROOM_MENU_MAX_HEIGHT,
    Math.max(80, itemCount * 59 + 16),
  );
  const availableBelow = Math.max(0, window.innerHeight - rect.bottom - ROOM_MENU_GAP - ROOM_MENU_VIEWPORT_INSET);
  const availableAbove = Math.max(0, rect.top - ROOM_MENU_GAP - ROOM_MENU_VIEWPORT_INSET);
  const openAbove = availableBelow < Math.min(estimatedHeight, 220) && availableAbove > availableBelow;
  const availableHeight = openAbove ? availableAbove : availableBelow;
  const maxHeight = Math.max(80, Math.min(ROOM_MENU_MAX_HEIGHT, availableHeight));
  const renderedHeight = Math.min(estimatedHeight, maxHeight);
  const rawLeft = rect.left + rect.width / 2 - width / 2;
  const left = Math.min(
    Math.max(rawLeft, ROOM_MENU_VIEWPORT_INSET),
    window.innerWidth - width - ROOM_MENU_VIEWPORT_INSET,
  );
  const top = openAbove
    ? Math.max(ROOM_MENU_VIEWPORT_INSET, rect.top - ROOM_MENU_GAP - renderedHeight)
    : rect.bottom + ROOM_MENU_GAP;

  return {
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(width),
    maxHeight: Math.round(maxHeight),
  };
}

function LocationRoomTargetDropdown({
  activeRegionId = "",
  hasActiveRoom = false,
  onSelectRoom,
  roomEntries = [],
  roomName = "Select Room",
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const hasRooms = roomEntries.length > 0;
  const triggerLabel = hasActiveRoom ? roomName : "Select Room";

  function toggleMenu() {
    if (open) {
      setOpen(false);
      return;
    }

    setMenuPosition(getRoomMenuPosition(rootRef.current, roomEntries.length));
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return undefined;

    function updatePosition() {
      setMenuPosition(getRoomMenuPosition(rootRef.current, roomEntries.length));
    }

    function handlePointerDown(event) {
      if (rootRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    updatePosition();
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, roomEntries.length]);

  return (
    <span className="location-map-toolbar__target-menu" ref={rootRef}>
      <button
        className="location-map-toolbar__target location-map-toolbar__target-button"
        type="button"
        title={triggerLabel}
        aria-label="Choose room"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={!hasRooms}
        onClick={toggleMenu}
        data-key="tooltip-generic"
        data-tooltip="Room Work"
        data-tooltip-description="Choose a room to edit."
      >
        <small>Room Work</small>
        <strong>{triggerLabel}</strong>
      </button>
      {open && hasRooms && menuPosition && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className="location-map-toolbar__room-menu-panel cruor-dropdown-menu cruor-dropdown-menu--context"
              data-style-floating="portal"
              role="menu"
              aria-label="Room work queue"
              style={menuPosition}
              onMouseDown={(event) => event.preventDefault()}
            >
              <div className="location-map-toolbar__room-menu-options cruor-dropdown-options" role="none">
                {roomEntries.map((room, index) => {
                  const active = activeRegionId === room.id;
                  const numberLabel = getRoomNumberLabel(room, index);
                  const status = room.status || "empty";
                  return (
                    <button
                      className={cx(
                        "location-map-toolbar__room-menu-item",
                        "cruor-dropdown-option",
                        `is-${status}`,
                        active && "is-active",
                      )}
                      key={room.id || `${numberLabel}-${room.name}`}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => {
                        onSelectRoom?.(room.id);
                        setOpen(false);
                      }}
                      data-room-id={room.id || undefined}
                      data-room-status={status}
                    >
                      <span className="location-map-toolbar__room-menu-number">
                        {numberLabel}
                      </span>
                      <span className="location-map-toolbar__room-menu-copy">
                        <strong>{room.name || `Room ${numberLabel}`}</strong>
                        <small>{room.roleLabel || room.mapLabel || "Room"}</small>
                      </span>
                      <span className="location-map-toolbar__room-menu-status">
                        {getRoomStatusLabel(status)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}

export function LocationMapToolbar({
  activeRegion = null,
  builderMode = "theme",
  canGoNextRoom = false,
  canGoPreviousRoom = false,
  onSelectNextRoom,
  onSelectPreviousRoom,
  onSelectRoom,
  onToggleImmersiveMode,
  roomEntries = [],
  immersiveMode = false,
}) {
  const mode = builderMode === "map" ? "theme" : builderMode;
  const hasActiveRoom = Boolean(activeRegion?.id) && (
    roomEntries.length <= 1 || canGoPreviousRoom || canGoNextRoom
  );
  const roomName = hasActiveRoom ? activeRegion?.name || "Selected Room" : "Select Room";
  const immersiveControl = (
    <div className="location-map-toolbar__group location-map-toolbar__group--view">
      <LocationMapToolbarButton
        active={immersiveMode}
        icon={immersiveMode ? "fa-compress" : "fa-expand"}
        onClick={onToggleImmersiveMode}
        title={immersiveMode ? "Exit immersive mode" : "Enter immersive mode"}
        testId="dark-places-immersive-mode"
        toggle
      >
        Immersive Mode
      </LocationMapToolbarButton>
    </div>
  );

  if (mode === "export") {
    return (
      <nav className="location-map-toolbar location-map-toolbar--export" aria-label="Location export toolbar" data-testid="dark-places-toolbar-export">
        <div className="location-map-toolbar__group location-map-toolbar__group--actions">
          <LocationMapInlineEditorToolsHost />
        </div>
        {immersiveControl}
      </nav>
    );
  }

  if (mode === "scratch") {
    return (
      <nav className="location-map-toolbar location-map-toolbar--rooms" aria-label="Selected room toolbar" data-testid="dark-places-toolbar-rooms">
        <div className="location-map-toolbar__group location-map-toolbar__group--room-nav">
          <LocationMapToolbarButton
            disabled={!canGoPreviousRoom}
            icon="fa-chevron-left"
            onClick={onSelectPreviousRoom}
            title="Select previous room"
            testId="dark-places-previous-room"
          >
            Previous
          </LocationMapToolbarButton>
          <LocationRoomTargetDropdown
            activeRegionId={hasActiveRoom ? activeRegion?.id || "" : ""}
            hasActiveRoom={hasActiveRoom}
            onSelectRoom={onSelectRoom}
            roomEntries={roomEntries}
            roomName={roomName}
          />
          <LocationMapToolbarButton
            disabled={!canGoNextRoom}
            icon="fa-chevron-right"
            onClick={onSelectNextRoom}
            title="Select next room"
            testId="dark-places-next-room"
          >
            Next
          </LocationMapToolbarButton>
        </div>
        <div className="location-map-toolbar__group location-map-toolbar__group--actions">
          <LocationMapInlineEditorToolsHost />
        </div>
        {immersiveControl}
      </nav>
    );
  }

  return (
    <nav className="location-map-toolbar location-map-toolbar--frame" aria-label="Map workbench toolbar" data-testid="dark-places-toolbar-frame">
      <div className="location-map-toolbar__group location-map-toolbar__group--actions">
        <LocationMapInlineEditorToolsHost />
      </div>
      {immersiveControl}
    </nav>
  );
}
