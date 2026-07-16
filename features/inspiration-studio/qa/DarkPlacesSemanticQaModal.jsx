import { useMemo } from "react";
import { StudioIcon } from "../components/StudioIcon.jsx";
import { StudioToolModalShell } from "../components/StudioToolModalShell.jsx";
import { downloadJsonFile } from "../model/studio-export.js";
import {
  DARK_PLACES_SEMANTIC_SAMPLE_QA_VERSION,
  runDarkPlacesSemanticSampleQa,
} from "./dark-places-semantic-sample-qa.js";

export function DarkPlacesSemanticQaModal({ isOpen, module, onClose, pack }) {
  const report = useMemo(
    () => runDarkPlacesSemanticSampleQa({ pack, module }),
    [module, pack],
  );

  return (
    <StudioToolModalShell
      id="studio-dark-places-semantic-qa-modal"
      className="studio-tool-modal--semantic-qa"
      icon="fa-wand-magic-sparkles"
      title="Dark Places Semantic Sample QA"
      subtitle="Compiles the current v2 module across deterministic contexts, pressure and room programs."
      isOpen={isOpen}
      onClose={onClose}
      actions={
        <button
          className="studio-tool-action"
          type="button"
          onClick={() =>
            downloadJsonFile(
              `${module?.id || "dark-places"}-semantic-sample-qa.json`,
              report,
            )
          }
        >
          Download Report
        </button>
      }
    >
      <div className="studio-tool-workspace">
        <section
          className="studio-tool-summary-grid"
          aria-label="Semantic QA summary"
        >
          <article className="studio-tool-summary-card">
            <strong>{report.summary.passed}</strong>
            <em>Passed</em>
          </article>
          <article className="studio-tool-summary-card">
            <strong>{report.summary.failed}</strong>
            <em>Failed</em>
          </article>
          <article className="studio-tool-summary-card">
            <strong>{report.summary.error}</strong>
            <em>Compiler Errors</em>
          </article>
          <article className="studio-tool-summary-card">
            <strong>{report.summary.determinismFailures}</strong>
            <em>Determinism Failures</em>
          </article>
        </section>
        <section className="studio-semantic-qa-results">
          {report.results.map((result) => (
            <article key={result.id} data-status={result.status}>
              <header>
                <span>
                  <StudioIcon
                    name={
                      result.status === "passed"
                        ? "fa-circle-check"
                        : "fa-circle-xmark"
                    }
                  />
                </span>
                <div>
                  <strong>{result.id}</strong>
                  <small>
                    {result.controls.context} · {result.controls.intrusion} ·{" "}
                    {result.roomCount} rooms
                  </small>
                </div>
                <em>{result.fingerprint || "no output"}</em>
              </header>
              <p>
                {result.diagnostics.error} errors · {result.diagnostics.warning}{" "}
                warnings · deterministic {result.deterministic ? "yes" : "no"}
              </p>
              {result.issues
                .filter((issue) => issue.severity === "error")
                .map((issue, index) => (
                  <small key={`${issue.code}-${index}`}>
                    {issue.path}: {issue.message}
                  </small>
                ))}
            </article>
          ))}
        </section>
        <footer className="studio-tool-report-version">
          {DARK_PLACES_SEMANTIC_SAMPLE_QA_VERSION}
        </footer>
      </div>
    </StudioToolModalShell>
  );
}
