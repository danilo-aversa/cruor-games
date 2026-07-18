import { StudioIcon } from "../components/StudioIcon.jsx";
import { StudioWarningList } from "../components/StudioWarningList.jsx";
import { summarizeStudioWarnings } from "../model/studio-warning-model.js";
import { StudioStatusBadge } from "./StudioControls.jsx";
import { StudioHelp } from "./StudioField.jsx";
import { StudioCollapsibleSection } from "./StudioSection.jsx";


export function StudioPanelTitle({
  children,
  eyebrow,
  help = "",
  icon = "",
  title,
}) {
  return (
    <div className="studio-panel__heading">
      <div className="studio-panel__title">
        <span>
          {icon ? <StudioIcon name={icon} /> : null}
          {eyebrow}
        </span>
        <h3>{title}</h3>
      </div>
      <div className="studio-panel__actions">
        <StudioHelp title={title} text={help} />
        {children}
      </div>
    </div>
  );
}

export function StudioEditorHeader({
  actions = null,
  className = "",
  coverageLabel = "",
  coverageStatus = "neutral",
  compact = false,
  description = "",
  icon = "fa-puzzle-piece",
  status = "",
  title,
  typeLabel = "Component",
}) {
  return (
    <header
      className={`studio-component-editor__topline studio-editor-header ${compact ? "studio-editor-header--compact" : ""} ${className}`.trim()}
      title={compact && description ? description : undefined}
    >
      <div className="studio-editor-header__identity">
        <span>
          <StudioIcon name={icon} /> {typeLabel}
        </span>
        <strong>{title}</strong>
        {description && !compact ? (
          <small className="studio-editor-header__description">
            {description}
          </small>
        ) : null}
      </div>
      <div className="studio-editor-header__status">
        {status ? <StudioStatusBadge status={status}>{status}</StudioStatusBadge> : null}
        {coverageLabel ? (
          <StudioStatusBadge status={coverageStatus}>{coverageLabel}</StudioStatusBadge>
        ) : null}
        {actions}
      </div>
    </header>
  );
}

export function StudioWarningSummary({
  defaultOpen = false,
  draft = {},
  warnings = [],
}) {
  const summary = summarizeStudioWarnings(warnings);
  if (!summary.total) return null;

  return (
    <details
      className="studio-warning-summary"
      open={defaultOpen || summary.blocking > 0 || undefined}
    >
      <summary>
        <span>
          <StudioIcon name={summary.blocking ? "fa-circle-xmark" : "fa-triangle-exclamation"} />
          Review warnings
        </span>
        <em>
          {summary.blocking} blocking · {summary.editorial} editorial · {summary.suggestion} suggestions · {summary.legacy} legacy
        </em>
      </summary>
      <StudioWarningList draft={draft} grouped={false} warnings={warnings} />
    </details>
  );
}

export function StudioPreviewSection({ children, defaultOpen = false, title = "Preview" }) {
  return (
    <StudioCollapsibleSection
      className="studio-preview-section"
      defaultOpen={defaultOpen}
      icon="fa-eye"
      title={title}
      zone="preview"
    >
      {children}
    </StudioCollapsibleSection>
  );
}

export function StudioDangerZone({ children, defaultOpen = false }) {
  return (
    <StudioCollapsibleSection
      className="studio-danger-zone"
      defaultOpen={defaultOpen}
      icon="fa-triangle-exclamation"
      title="Danger Zone"
      zone="danger"
    >
      {children}
    </StudioCollapsibleSection>
  );
}
