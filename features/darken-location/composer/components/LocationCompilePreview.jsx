import { useCallback, useMemo, useState } from "react";
import {
  copyTextToClipboard,
  createJsonExportPayload,
  getClipboardStatusMessage,
  getCompilePreview,
  getRegionSummaryText,
} from "../model/location-composer-output.js";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ExportCard({ title, children, className = "" }) {
  return (
    <article className={cx("location-compile-preview__card", className)}>
      <span>{title}</span>
      {children}
    </article>
  );
}

function ExportTextBlock({ text }) {
  return (
    <div className="location-session-insert">
      <pre>{text}</pre>
    </div>
  );
}

function getCurrentMapSvgText() {
  if (typeof document === "undefined") return "";
  const svg = document.querySelector('[data-map-viewport-mode="composer-preview"] #cruor-map-svg') || document.querySelector("#cruor-map-svg");
  if (!svg || typeof XMLSerializer === "undefined") return "";
  return new XMLSerializer().serializeToString(svg);
}

function downloadTextFile(filename, text, mimeType = "text/plain;charset=utf-8") {
  if (typeof document === "undefined" || typeof URL === "undefined" || typeof Blob === "undefined") {
    return false;
  }

  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return true;
}

function safeFilename(value) {
  return String(value || "cruor-location")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "cruor-location";
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

  const handleCopySvg = useCallback(async () => {
    const svgText = getCurrentMapSvgText();
    await handleCopy("Map SVG", svgText || "");
  }, [handleCopy]);

  const handleDownloadSvg = useCallback(() => {
    const svgText = getCurrentMapSvgText();
    const downloaded = svgText
      ? downloadTextFile(`${safeFilename(compilePreview.title)}-map.svg`, svgText, "image/svg+xml;charset=utf-8")
      : false;
    setCopyState(downloaded ? "SVG downloaded" : "SVG unavailable");
    window.clearTimeout(handleDownloadSvg.timeoutId);
    handleDownloadSvg.timeoutId = window.setTimeout(() => setCopyState(""), 2200);
  }, [compilePreview.title]);

  const showJson = uiMode === "debug";
  const hasGeneratedMap = Boolean(generatedMapPreview);

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

        <div className="location-compile-preview__actions" aria-label="Export actions">
          <div className="location-compile-preview__buttons">
            <button
              className="cruor-composer-control location-copy-btn"
              type="button"
              onClick={() => handleCopy("Session Insert", compilePreview.sessionInsertText)}
              title="Copy the full DM-facing session insert"
            >
              Copy Insert
            </button>
            <button
              className="cruor-composer-control location-copy-btn"
              type="button"
              onClick={() => handleCopy("Table Text", compilePreview.tableReadyText)}
              title="Copy the table-facing quick reference"
            >
              Copy Table
            </button>
            <button
              className="cruor-composer-control location-copy-btn"
              type="button"
              onClick={() => handleCopy("Region Summary", regionSummaryText)}
              title="Copy only the mapped region notes"
            >
              Copy Rooms
            </button>
            <button
              className="cruor-composer-control location-copy-btn"
              type="button"
              disabled={!hasGeneratedMap}
              onClick={handleCopySvg}
              title="Copy the current map SVG"
            >
              Copy SVG
            </button>
            <button
              className="cruor-composer-control location-copy-btn"
              type="button"
              disabled={!hasGeneratedMap}
              onClick={handleDownloadSvg}
              title="Download the current map SVG"
            >
              Download SVG
            </button>
            {showJson ? (
              <button
                className="cruor-composer-control location-copy-btn"
                type="button"
                onClick={() => handleCopy("JSON Snapshot", jsonSnapshotText)}
                title="Copy debug JSON snapshot"
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
          <div className="location-compile-preview__grid location-compile-preview__grid--export">
            <ExportCard title="Session Insert" className="location-session-insert-card">
              <ExportTextBlock text={compilePreview.sessionInsertText} />
            </ExportCard>

            <ExportCard title="Read-Aloud">
              <ExportTextBlock text={compilePreview.readAloudText} />
            </ExportCard>

            <ExportCard title="Regions">
              <div className="location-compile-preview__stack">
                {compilePreview.roomSections.map((section) => (
                  <div className="location-compile-region" key={section.region.id}>
                    <strong>{section.mapLabel} — {section.region.name}</strong>
                    <p><b>Role.</b> {section.role}</p>
                    {section.readAloud ? <p><b>Read-Aloud.</b> {section.readAloud}</p> : null}
                    <p><b>Feature.</b> {section.feature || "—"}</p>
                    {section.danger && section.danger !== "—" ? <p><b>Danger.</b> {section.danger}</p> : null}
                    {section.secret && section.secret !== "—" ? <p><b>Secret.</b> {section.secret}</p> : null}
                    {section.reward && section.reward !== "—" ? <p><b>Reward.</b> {section.reward}</p> : null}
                    {section.components.length ? (
                      <small>{section.components.map((component) => `${component.slotLabel}: ${component.title}`).join(" · ")}</small>
                    ) : null}
                  </div>
                ))}
              </div>
            </ExportCard>

            <ExportCard title="Hazards">
              <ExportTextBlock text={compilePreview.hazardText} />
            </ExportCard>

            <ExportCard title="Clues">
              <ExportTextBlock text={compilePreview.clueText} />
            </ExportCard>

            <ExportCard title="Twists">
              <ExportTextBlock text={compilePreview.twistText} />
            </ExportCard>

            <ExportCard title="Map Notes">
              <div className="location-map-notes-output">
                {compilePreview.mapNotes.map((note) => <p key={note}>{note}</p>)}
              </div>
            </ExportCard>

            <ExportCard title="At the Table">
              <div className="location-map-notes-output">
                {compilePreview.atTheTableRows.map((row) => (
                  <p key={row.label}><b>{row.label}.</b> {row.value}</p>
                ))}
              </div>
            </ExportCard>
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
