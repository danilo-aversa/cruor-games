import { StudioIcon } from "../components/StudioIcon.jsx";

function BucketList({ title, icon, rows = [] }) {
  const visibleRows = rows.filter((row) => row.count > 0).slice(0, 8);
  return (
    <article className="studio-tool-bucket-card">
      <header>
        <h3><StudioIcon name={icon} /> {title}</h3>
      </header>
      <div className="studio-tool-bucket-card__rows">
        {visibleRows.length ? visibleRows.map((row) => (
          <p key={row.id}>
            <span>{row.label}</span>
            <strong>{row.count}</strong>
          </p>
        )) : <em>No entries.</em>}
      </div>
    </article>
  );
}

export function ContentHealthCoverage({ report }) {
  const coverage = report?.coverage || {};
  return (
    <section className="studio-tool-grid studio-tool-grid--two" aria-label="Content health coverage">
      <BucketList title="Components by Type" icon="fa-layer-group" rows={coverage.componentsByType} />
      <BucketList title="Components by Workflow" icon="fa-route" rows={coverage.componentsByWorkflow} />
      <BucketList title="Components by Slot" icon="fa-table-cells-large" rows={coverage.componentsBySlot} />
      <BucketList title="Components by Source" icon="fa-link" rows={coverage.componentsBySourceAnchor} />
    </section>
  );
}
