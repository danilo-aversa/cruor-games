import { StudioIcon } from "../components/StudioIcon.jsx";

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function SummaryCard({ icon, label, value, meta }) {
  return (
    <article className="studio-tool-summary-card">
      <span><StudioIcon name={icon} /></span>
      <strong>{formatNumber(value)}</strong>
      <em>{label}</em>
      {meta ? <small>{meta}</small> : null}
    </article>
  );
}

export function ContentHealthSummary({ report }) {
  const summary = report?.summary || {};
  const issues = summary.issues || {};
  const schemas = summary.schemas || {};

  return (
    <section className="studio-tool-summary-grid" aria-label="Content health summary">
      <SummaryCard icon="fa-box-open" label="Packs" value={summary.packs} />
      <SummaryCard
        icon="fa-id-card-clip"
        label="Source Anchors"
        value={summary.sourceAnchors}
      />
      <SummaryCard
        icon="fa-image"
        label="Inspirations"
        value={summary.inspirations}
      />
      <SummaryCard
        icon="fa-diagram-project"
        label="Components"
        value={summary.components}
      />
      <SummaryCard
        icon="fa-code-branch"
        label="Transitional v1"
        value={schemas.v1}
      />
      <SummaryCard
        icon="fa-file-code"
        label="Canonical v2"
        value={schemas.v2}
      />
      <SummaryCard
        icon="fa-circle-xmark"
        label="Errors"
        value={issues.error}
        meta="Blocking"
      />
      <SummaryCard
        icon="fa-triangle-exclamation"
        label="Warnings"
        value={issues.warning}
        meta="Editorial"
      />
    </section>
  );
}
