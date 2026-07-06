import { useMemo } from "react";
import { STATIC_CONTENT_REGISTRY_DATA } from "../../../shared/content/static-registry.js";
import { ALL_MONSTER_GRAFTS } from "../../monster-composer/data/monster-content-pack-feed.js";
import { StudioToolModalShell } from "../components/StudioToolModalShell.jsx";
import { downloadJsonFile } from "../model/studio-export.js";
import { buildContentCoverageReport, getCoverageTopBuckets } from "./content-coverage.model.js";

function BucketPanel({ title, rows = [] }) {
  const visibleRows = getCoverageTopBuckets(rows, 8);
  return (
    <article className="studio-tool-bucket-card">
      <header><h3>{title}</h3></header>
      <div className="studio-tool-bucket-card__rows">
        {visibleRows.length ? visibleRows.map((row) => (
          <p key={row.id}>
            <span>{row.label}</span>
            <strong>{row.count}</strong>
          </p>
        )) : <em>No coverage.</em>}
      </div>
    </article>
  );
}

function MatrixTable({ title, rows = [] }) {
  const columns = rows[0]?.columns || [];
  return (
    <section className="studio-tool-matrix" aria-label={title}>
      <header className="studio-tool-section-header">
        <div>
          <span>Coverage Matrix</span>
          <h3>{title}</h3>
        </div>
      </header>
      <div className="studio-tool-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Row</th>
              {columns.map((column) => <th key={column.id}>{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th>{row.label}</th>
                {row.columns.map((column) => <td key={column.id} data-has-content={column.count > 0 ? "true" : "false"}>{column.count}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GapList({ gaps = [] }) {
  return (
    <section className="studio-tool-issues" aria-label="Coverage gaps">
      <header className="studio-tool-section-header">
        <div>
          <span>Planning Signals</span>
          <h3>{gaps.length} coverage gap{gaps.length === 1 ? "" : "s"}</h3>
        </div>
      </header>
      <div className="studio-tool-issue-list">
        {gaps.length ? gaps.map((gap) => (
          <article className={`studio-tool-issue studio-tool-issue--${gap.severity}`} key={gap.id}>
            <span>{gap.area}</span>
            <div>
              <strong>{gap.title}</strong>
              <p>{gap.detail}</p>
            </div>
            <small>{gap.severity}</small>
          </article>
        )) : <p className="studio-tool-empty">No coverage gaps detected.</p>}
      </div>
    </section>
  );
}

export function CoverageMatrixModal({ isOpen, onClose, modules = [] }) {
  const report = useMemo(() => buildContentCoverageReport({
    registryData: STATIC_CONTENT_REGISTRY_DATA,
    modules,
    nativeMonsterGrafts: ALL_MONSTER_GRAFTS,
  }), [modules]);

  function downloadReport() {
    downloadJsonFile("cruor-studio-coverage-report.json", report);
  }

  return (
    <StudioToolModalShell
      id="studio-coverage-matrix-modal"
      className="studio-tool-modal--coverage"
      icon="fa-table-cells-large"
      title="Coverage Matrix"
      subtitle="Global content distribution across monster, location, source, role, and map dimensions."
      isOpen={isOpen}
      onClose={onClose}
      actions={<button className="studio-tool-action" type="button" onClick={downloadReport}>Download Report</button>}
    >
      <div className="studio-tool-workspace">
        <section className="studio-tool-summary-grid" aria-label="Coverage summary">
          <article className="studio-tool-summary-card"><strong>{report.summary.components}</strong><em>Total Components</em></article>
          <article className="studio-tool-summary-card"><strong>{report.summary.monsterComponents}</strong><em>Monster Entries</em></article>
          <article className="studio-tool-summary-card"><strong>{report.summary.locationComponents}</strong><em>Location Entries</em></article>
          <article className="studio-tool-summary-card"><strong>{report.gaps.length}</strong><em>Coverage Gaps</em></article>
        </section>
        <section className="studio-tool-grid studio-tool-grid--two">
          <BucketPanel title="Monster Slots" rows={report.monster.bySlot} />
          <BucketPanel title="Action Economy" rows={report.monster.byActionEconomy} />
          <BucketPanel title="Damage Types" rows={report.monster.byDamageType} />
          <BucketPanel title="Location Slots" rows={report.location.bySlot} />
          <BucketPanel title="Region Roles" rows={report.location.byRegionRole} />
          <BucketPanel title="Location Sources" rows={report.location.bySourceAnchor} />
        </section>
        <MatrixTable title="Monster Slot × Action Economy" rows={report.monster.slotByActionMatrix} />
        <MatrixTable title="Location Slot × Source Anchor" rows={report.location.slotBySourceMatrix} />
        <GapList gaps={report.gaps} />
      </div>
    </StudioToolModalShell>
  );
}
