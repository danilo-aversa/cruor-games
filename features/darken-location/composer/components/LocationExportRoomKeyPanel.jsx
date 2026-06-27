function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ExportRoomKeyMetric({ label, value }) {
  return (
    <span className="location-export-room-key-metric">
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function ExportRoomKeySlot({ slotRow }) {
  const filled = Boolean(slotRow?.filled);
  const components = Array.isArray(slotRow?.components) ? slotRow.components : [];

  return (
    <div className={cx("location-export-room-key-slot", filled ? "is-filled" : "is-missing")}>
      <span>{slotRow?.heading || slotRow?.label || "Room Detail"}</span>
      {filled ? (
        <div className="location-export-room-key-slot__components">
          {components.map((component) => (
            <p key={component.id || component.title}>
              <b>{component.title}</b>
              <span>{component.text || component.summary || "No table text yet."}</span>
            </p>
          ))}
        </div>
      ) : (
        <em>Missing</em>
      )}
    </div>
  );
}

function ExportRoomKeyCard({ section, onSelectRoom }) {
  const missing = Array.isArray(section?.missingSlotLabels) ? section.missingSlotLabels : [];
  const slotRows = Array.isArray(section?.roomKeySlotRows) ? section.roomKeySlotRows : [];

  return (
    <article
      className={cx(
        "location-export-room-key-card",
        `is-${section?.readinessStatus || "empty"}`,
        missing.length && "has-missing-content",
      )}
    >
      <header className="location-export-room-key-card__head">
        <span>Room {String(section?.roomNumber || "—").padStart(2, "0")}</span>
        <strong>{section?.region?.name || "Unnamed Room"}</strong>
        <button
          className="location-export-room-key-card__jump"
          type="button"
          onClick={() => onSelectRoom?.(section?.region?.id)}
          data-key="tooltip-generic"
          data-tooltip="Review room"
          data-tooltip-description="Return to Rooms and select this room."
        >
          <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
        </button>
      </header>

      <div className="location-export-room-key-card__meta">
        <span>{section?.role || "Room"}</span>
        <span>{section?.readinessLabel || "Empty"} · {section?.readySlotCount || 0}/{section?.readySlotTotal || 0}</span>
      </div>

      {missing.length ? (
        <div className="location-export-room-key-card__missing">
          <small>Missing</small>
          <span>{missing.join(", ")}</span>
        </div>
      ) : null}

      {section?.readAloud ? (
        <div className="location-export-room-key-readaloud">
          <span>Read-Aloud</span>
          <p>{section.readAloud}</p>
        </div>
      ) : null}

      <div className="location-export-room-key-slot-grid">
        {slotRows.map((slotRow) => (
          <ExportRoomKeySlot key={slotRow.slotId} slotRow={slotRow} />
        ))}
      </div>
    </article>
  );
}

export function LocationExportRoomKeyPanel({
  compilePreview,
  copyStatus = "",
  onCopyMarkdown,
  onCopyTable,
  onReviewMissing,
  onSelectRoom,
}) {
  const roomSections = Array.isArray(compilePreview?.roomSections) ? compilePreview.roomSections : [];
  const readyRoomCount = Number(compilePreview?.readyRoomCount || 0);
  const incompleteRoomCount = Number(compilePreview?.incompleteRoomCount || 0);
  const statusLabel = incompleteRoomCount > 0
    ? `${incompleteRoomCount} incomplete`
    : roomSections.length
      ? "Ready to Export"
      : "No rooms";

  return (
    <section className="location-export-room-key-panel" aria-label="Export room key">
      <header className="location-export-room-key-panel__head">
        <div className="location-export-room-key-panel__title">
          <p className="location-kicker">Export Room Key</p>
          <h2>{compilePreview?.title || "Cursed Location Build"}</h2>
          <small>{compilePreview?.contextLine || "Location export"}</small>
        </div>

        <div className="location-export-room-key-actions" aria-label="Room key export actions">
          <button className="location-export-room-key-action" type="button" onClick={onCopyMarkdown}>
            <i className="fa-solid fa-copy" aria-hidden="true" />
            <span>Copy Markdown</span>
          </button>
          <button className="location-export-room-key-action" type="button" onClick={onCopyTable}>
            <i className="fa-solid fa-table-list" aria-hidden="true" />
            <span>Copy Table</span>
          </button>
          <button
            className="location-export-room-key-action"
            type="button"
            disabled={!incompleteRoomCount}
            onClick={onReviewMissing}
          >
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
            <span>Review Missing</span>
          </button>
        </div>
      </header>

      <div className="location-export-room-key-summary" aria-label="Export readiness summary">
        <ExportRoomKeyMetric label="Status" value={statusLabel} />
        <ExportRoomKeyMetric label="Ready Rooms" value={`${readyRoomCount}/${roomSections.length || 0}`} />
        <ExportRoomKeyMetric label="Missing Rooms" value={String(incompleteRoomCount)} />
      </div>

      <span className={cx("location-export-room-key-copy-status", copyStatus && "is-visible")} aria-live="polite">
        {copyStatus || "Markdown export ready"}
      </span>

      <div className="location-export-room-key-list">
        {roomSections.map((section) => (
          <ExportRoomKeyCard key={section.region.id} section={section} onSelectRoom={onSelectRoom} />
        ))}
        {!roomSections.length ? (
          <div className="location-export-room-key-empty">Generate a place map before exporting a room key.</div>
        ) : null}
      </div>
    </section>
  );
}
