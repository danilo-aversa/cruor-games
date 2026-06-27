function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LocationMapToolbarButton({
  children,
  disabled = false,
  icon = "",
  onClick,
  title = "",
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
        `location-map-toolbar__button--${variant}`,
      )}
      type="button"
      disabled={disabled}
      onClick={onClick}
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

function LocationMapToolbarDivider() {
  return <span className="location-map-toolbar__divider" aria-hidden="true" />;
}

export function LocationMapToolbar({
  activeRegion = null,
  builderMode = "theme",
  canGoNextRoom = false,
  canGoPreviousRoom = false,
  generatedMapPreview = null,
  hasRooms = false,
  nextRoomSlot = null,
  exportIncompleteCount = 0,
  onAddMissingRoomSlot,
  onCopyMarkdown,
  onGenerateThemeRooms,
  onNewMapSeed,
  onOpenComponents,
  onSelectExport,
  onSelectFrame,
  onReviewMissing,
  onSelectNextRoom,
  onSelectPreviousRoom,
  onSelectRooms,
  onStartMapEditing,
}) {
  const mode = builderMode === "map" ? "theme" : builderMode;
  const hasMap = Boolean(generatedMapPreview);
  const roomName = activeRegion?.name || "Selected Room";
  const nextRoomSlotLabel = nextRoomSlot?.slot?.label || nextRoomSlot?.label || "Missing Detail";

  if (mode === "export") {
    return (
      <nav className="location-map-toolbar location-map-toolbar--export" aria-label="Location export toolbar" data-testid="dark-places-toolbar-export">
        <div className="location-map-toolbar__group location-map-toolbar__group--actions">
          <LocationMapToolbarButton
            icon="fa-copy"
            onClick={onCopyMarkdown}
            title="Copy the room key as Markdown"
            variant="primary"
            testId="dark-places-copy-markdown"
          >
            Copy Markdown
          </LocationMapToolbarButton>
          <LocationMapToolbarButton
            disabled={!exportIncompleteCount}
            icon="fa-circle-exclamation"
            onClick={onReviewMissing}
            title={exportIncompleteCount ? `Review ${exportIncompleteCount} incomplete room${exportIncompleteCount === 1 ? "" : "s"}` : "No missing room content"}
            testId="dark-places-review-missing"
          >
            Review Missing
          </LocationMapToolbarButton>
          <LocationMapToolbarButton icon="fa-arrow-left" onClick={onSelectRooms} title="Return to room work" testId="dark-places-toolbar-rooms-action">
            Rooms
          </LocationMapToolbarButton>
          <LocationMapToolbarButton icon="fa-map" onClick={onSelectFrame} title="Return to the place frame" testId="dark-places-toolbar-frame-action">
            Frame
          </LocationMapToolbarButton>
        </div>
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
          <span className="location-map-toolbar__target" title={roomName}>
            <small>Room Work</small>
            <strong>{roomName}</strong>
          </span>
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
        <LocationMapToolbarDivider />
        <div className="location-map-toolbar__group location-map-toolbar__group--actions">
          <LocationMapToolbarButton
            disabled={!activeRegion || !nextRoomSlot}
            icon="fa-plus"
            onClick={onAddMissingRoomSlot}
            title={nextRoomSlot ? `Add ${nextRoomSlotLabel}` : "Room required slots are filled"}
            variant="primary"
            testId="dark-places-add-missing-slot"
          >
            Add Missing Slot
          </LocationMapToolbarButton>
          <LocationMapToolbarButton
            disabled={!activeRegion}
            icon="fa-puzzle-piece"
            onClick={onOpenComponents}
            title="Open components for the active room slot"
            testId="dark-places-open-components"
          >
            Components
          </LocationMapToolbarButton>
          <LocationMapToolbarButton icon="fa-map" onClick={onSelectFrame} title="Edit the place frame" testId="dark-places-toolbar-frame-action">
            Frame
          </LocationMapToolbarButton>
          <LocationMapToolbarButton icon="fa-file-lines" onClick={onSelectExport} title="Review the location insert" testId="dark-places-toolbar-export-action">
            Export
          </LocationMapToolbarButton>
        </div>
      </nav>
    );
  }

  return (
    <nav className="location-map-toolbar location-map-toolbar--frame" aria-label="Map workbench toolbar" data-testid="dark-places-toolbar-frame">
      <div className="location-map-toolbar__group location-map-toolbar__group--actions">
        <LocationMapToolbarButton
          icon="fa-wand-magic-sparkles"
          onClick={onGenerateThemeRooms}
          title={hasMap ? "Regenerate the place map" : "Generate the place map"}
          variant="primary"
          testId="dark-places-generate"
        >
          {hasMap ? "Regenerate Place" : "Generate Place"}
        </LocationMapToolbarButton>
        <LocationMapToolbarButton icon="fa-dice" onClick={onNewMapSeed} title="Refresh the map seed" testId="dark-places-new-seed">
          New Seed
        </LocationMapToolbarButton>
        <LocationMapToolbarButton disabled={!hasMap} icon="fa-pen-ruler" onClick={onStartMapEditing} title="Open the map editor" testId="dark-places-edit-map">
          Edit Map
        </LocationMapToolbarButton>
        <LocationMapToolbarButton disabled={!hasRooms} icon="fa-list-check" onClick={onSelectRooms} title="Move to room-by-room work" testId="dark-places-toolbar-rooms-action">
          Rooms
        </LocationMapToolbarButton>
      </div>
    </nav>
  );
}
