import { useCallback, useMemo, useState } from "react";
import {
  copyTextToClipboard,
  createJsonExportPayload,
  getClipboardStatusMessage,
  getCompilePreview,
  getComponentRulesText,
  getRegionSummaryText,
} from "../model/location-composer-output.js";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function LocationCompilePreview({ state, digest, mapRequest, generatedMapPreview, defaultOpen = false, uiMode = "simple" }) {
  const [copyState, setCopyState] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(() => Boolean(defaultOpen));
  const compilePreview = useMemo(
    () => getCompilePreview(state, digest, mapRequest, generatedMapPreview),
    [state, digest, mapRequest, generatedMapPreview],
  );
  const regionSummaryText = useMemo(
    () => getRegionSummaryText(compilePreview),
    [compilePreview],
  );
  const jsonSnapshotText = useMemo(
    () =>
      JSON.stringify(
        createJsonExportPayload(state, digest, mapRequest, generatedMapPreview, compilePreview),
        null,
        2,
      ),
    [state, digest, mapRequest, generatedMapPreview, compilePreview],
  );

  const handleCopy = useCallback(async (label, text) => {
    try {
      const result = await copyTextToClipboard(text);
      setCopyState(getClipboardStatusMessage(label, result));
    } catch (error) {
      setCopyState(`${label}: copy failed`);
    }

    window.clearTimeout(handleCopy.timeoutId);
    handleCopy.timeoutId = window.setTimeout(() => setCopyState(""), 2200);
  }, []);

  const showJson = uiMode === "debug";

  return (
    <section
      className={cx("cruor-composer-panel location-panel location-compile-preview", isPreviewOpen && "is-open", !isPreviewOpen && "is-collapsed")}
      aria-label="Compiled location preview"
    >
      <div className="location-compile-preview__header">
        <button
          className="location-compile-preview__summary"
          type="button"
          onClick={() => setIsPreviewOpen((current) => !current)}
          aria-expanded={isPreviewOpen}
        >
          <span>
            <p className="location-kicker">Location Export</p>
            <h2>{compilePreview.title}</h2>
            <small>{compilePreview.contextLine}</small>
          </span>
          <strong>{isPreviewOpen ? "Collapse" : "Expand"}</strong>
        </button>
        <div className="location-compile-preview__actions" aria-label="Compile actions">
          <div className="location-compile-preview__metrics" aria-label="Compile metrics">
            <span>Table View</span>
            <span>{compilePreview.regionCount} regions</span>
            <span>{compilePreview.componentSections.length} components</span>
          </div>

          <div className="location-compile-preview__buttons">
            <button
              className="cruor-composer-control location-copy-btn"
              type="button"
              onClick={() => handleCopy("Session Insert", compilePreview.sessionInsertText)}
              title="Copy the DM-facing session insert"
            >
              Copy Insert
            </button>
            <button
              className="cruor-composer-control location-copy-btn"
              type="button"
              onClick={() => handleCopy("Table Text", compilePreview.tableReadyText)}
              title="Copy the table-ready text"
            >
              Copy Table
            </button>
            <button
              className="cruor-composer-control location-copy-btn"
              type="button"
              onClick={() => handleCopy("Region Summary", regionSummaryText)}
              title="Copy region summary text"
            >
              Copy Regions
            </button>
            {showJson ? (
              <button
                className="cruor-composer-control location-copy-btn"
                type="button"
                onClick={() => handleCopy("JSON Snapshot", jsonSnapshotText)}
                title="Copy JSON snapshot"
              >
                Copy JSON
              </button>
            ) : null}
          </div>

          <span className={copyState ? "location-copy-status is-visible" : "location-copy-status"} aria-live="polite">
            {copyState || "Ready"}
          </span>
        </div>
      </div>

      {isPreviewOpen ? (
        <div className="location-compile-preview__body">
          <div className="location-compile-preview__grid location-compile-preview__grid--quality">
            <article className="location-compile-preview__card location-session-insert-card">
              <span>Session Insert</span>
              <div className="location-session-insert">
                <strong>{compilePreview.premiseSection.title}</strong>
                <p>{compilePreview.premiseSection.context} · {compilePreview.premiseSection.horrorLine} · {compilePreview.premiseSection.sourceLine}</p>
                <pre>{compilePreview.sessionInsertText}</pre>
              </div>
            </article>

            <article className="location-compile-preview__card">
              <span>Read-Aloud</span>
              <div className="location-session-insert">
                <pre>{compilePreview.readAloudText}</pre>
              </div>
            </article>

            <article className="location-compile-preview__card">
              <span>Regions</span>
              <div className="location-compile-preview__stack">
                {compilePreview.roomSections.map((section) => (
                  <div className="location-compile-region" key={section.region.id}>
                    <strong>{section.heading}</strong>
                    <small className="location-compile-sync-label">{section.syncLabel}</small>
                    <p><b>Role.</b> {section.role}</p>
                    {section.readAloud ? <p><b>Read-Aloud.</b> {section.readAloud}</p> : null}
                    <p><b>Feature.</b> {section.feature || "—"}</p>
                    <p><b>Danger.</b> {section.danger || "—"}</p>
                    <p><b>Secret.</b> {section.secret || "—"}</p>
                    <p><b>Reward.</b> {section.reward || "—"}</p>
                    {section.components.length ? (
                      <small>{section.components.map((component) => `${component.slotLabel}: ${component.title}`).join(" · ")}</small>
                    ) : (
                      <small>No attached components.</small>
                    )}
                  </div>
                ))}
              </div>
            </article>

            <article className="location-compile-preview__card">
              <span>Hazards</span>
              <div className="location-compile-preview__stack">
                {compilePreview.hazardSections.length ? (
                  compilePreview.hazardSections.map((component) => (
                    <div className="location-compile-slot" key={`${component.slotId}-${component.id}`}>
                      <strong>{component.reference}</strong>
                      <p>{component.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="location-empty location-empty--action">No hazards assigned.</p>
                )}
              </div>
            </article>

            <article className="location-compile-preview__card">
              <span>Clues</span>
              <div className="location-compile-preview__stack">
                {compilePreview.clueSections.length ? (
                  compilePreview.clueSections.map((component) => (
                    <div className="location-compile-slot" key={`${component.slotId}-${component.id}`}>
                      <strong>{component.reference}</strong>
                      <p>{component.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="location-empty location-empty--action">No clues assigned.</p>
                )}
              </div>
            </article>

            <article className="location-compile-preview__card">
              <span>Twists</span>
              <div className="location-compile-preview__stack">
                {compilePreview.twistSections.length ? (
                  compilePreview.twistSections.map((component) => (
                    <div className="location-compile-slot" key={`${component.slotId}-${component.id}`}>
                      <strong>{component.reference}</strong>
                      <p>{component.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="location-empty location-empty--action">No twists assigned.</p>
                )}
              </div>
            </article>

            <article className="location-compile-preview__card">
              <span>At the Table</span>
              <div className="location-map-notes-output">
                {compilePreview.atTheTableRows.map((row) => (
                  <p key={row.label}><b>{row.label}.</b> {row.value}</p>
                ))}
              </div>
            </article>

            <article className="location-compile-preview__card">
              <span>Components</span>
              <div className="location-compile-preview__stack">
                {compilePreview.componentSections.length ? (
                  compilePreview.componentSections.map((component) => (
                    <div className="location-compile-slot" key={`${component.slotId}-${component.id}`}>
                      <strong>{component.reference}</strong>
                      <p>{component.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="location-empty location-empty--action">No components assigned.</p>
                )}
              </div>
            </article>

            <article className="location-compile-preview__card">
              <span>Map Notes</span>
              <div className="location-map-notes-output">
                {compilePreview.mapNotes.map((note) => <p key={note}>{note}</p>)}
              </div>
            </article>
          </div>

          <div className="location-compile-preview__table" aria-label="Table ready text preview">
        <span>Table-Ready Text</span>
        <pre>{compilePreview.tableReadyText}</pre>
      </div>

          {showJson ? (
            <div className="location-compile-preview__table location-compile-preview__table--json" aria-label="JSON snapshot preview">
              <span>JSON Snapshot</span>
              <pre>{jsonSnapshotText}</pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
