export function LocationDraftControls({
  canLoadDraft,
  canRedo = false,
  canUndo = false,
  draftStatus,
  onClearDraft,
  onLoadDraft,
  onRedo,
  onResetComposer,
  onSaveDraft,
  onUndo,
  uiMode = "simple",
}) {
  const isSimpleMode = uiMode === "simple";

  return (
    <section className="location-draft-strip" aria-label="Draft controls">
      <div className="location-draft-strip__actions">
        <button className="cruor-composer-control location-draft-btn" type="button" onClick={onSaveDraft}>
          Save
        </button>

        <button
          className="cruor-composer-control location-draft-btn location-draft-btn--ghost"
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
        >
          Undo
        </button>

        <button
          className="cruor-composer-control location-draft-btn location-draft-btn--ghost"
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
        >
          Redo
        </button>

        <button
          className="cruor-composer-control location-draft-btn"
          type="button"
          onClick={onLoadDraft}
          disabled={!canLoadDraft}
        >
          Load
        </button>

        {!isSimpleMode ? (
          <>
            <button
              className="cruor-composer-control location-draft-btn location-draft-btn--ghost"
              type="button"
              onClick={onClearDraft}
              disabled={!canLoadDraft}
            >
              Clear
            </button>

            <button
              className="cruor-composer-control location-draft-btn location-draft-btn--danger"
              type="button"
              onClick={onResetComposer}
            >
              Reset
            </button>
          </>
        ) : null}
      </div>

      {draftStatus ? (
        <p className="location-draft-strip__feedback" aria-live="polite">
          {draftStatus}
        </p>
      ) : null}
    </section>
  );
}
