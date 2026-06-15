import { useMemo, useState } from "react";
import { StudioIcon } from "../components/StudioIcon.jsx";
import { filterContentHealthIssues, getContentHealthIssueAreas } from "./content-health.model.js";

const SEVERITY_OPTIONS = [
  { id: "all", label: "All severities" },
  { id: "error", label: "Errors" },
  { id: "warning", label: "Warnings" },
  { id: "info", label: "Info" },
];

function getSeverityIcon(severity) {
  if (severity === "error") return "fa-circle-xmark";
  if (severity === "info") return "fa-circle-info";
  return "fa-triangle-exclamation";
}

export function ContentHealthIssues({ issues = [] }) {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [area, setArea] = useState("all");
  const areas = useMemo(() => getContentHealthIssueAreas(issues), [issues]);
  const visibleIssues = useMemo(() => filterContentHealthIssues(issues, { search, severity, area }), [area, issues, search, severity]);

  return (
    <section className="studio-tool-issues" aria-label="Content health issues">
      <header className="studio-tool-section-header">
        <div>
          <span><StudioIcon name="fa-stethoscope" /> Content Health</span>
          <h3>{visibleIssues.length} visible issue{visibleIssues.length === 1 ? "" : "s"}</h3>
        </div>
      </header>
      <div className="studio-tool-filter-row">
        <label>
          <span>Search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search issues..." />
        </label>
        <label>
          <span>Severity</span>
          <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
            {SEVERITY_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Area</span>
          <select value={area} onChange={(event) => setArea(event.target.value)}>
            <option value="all">All areas</option>
            {areas.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="studio-tool-issue-list">
        {visibleIssues.length ? visibleIssues.slice(0, 80).map((issue, index) => (
          <article className={`studio-tool-issue studio-tool-issue--${issue.severity}`} key={`${issue.id}-${issue.path}-${index}`}>
            <span><StudioIcon name={getSeverityIcon(issue.severity)} /></span>
            <div>
              <strong>{issue.title || issue.id || issue.area}</strong>
              <p>{issue.message}</p>
              <em>{issue.suggestedFix}</em>
            </div>
            <small>{issue.area} · {issue.path}</small>
          </article>
        )) : <p className="studio-tool-empty">No issues match these filters.</p>}
      </div>
    </section>
  );
}
