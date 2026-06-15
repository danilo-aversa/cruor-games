import { getStudioWarningSeverityMeta, getStudioWarningState, summarizeStudioWarnings } from "../model/studio-warning-model.js";
import { StudioIcon } from "./StudioIcon.jsx";

export function StudioWarningBadge({ compact = false, label = "", warnings = [] }) {
  const state = getStudioWarningState(warnings);
  if (state === "clean") return null;

  const summary = summarizeStudioWarnings(warnings);
  const meta = getStudioWarningSeverityMeta(state);
  const count = summary[state] || summary.total;
  const visibleLabel = label || (compact ? String(count) : `${count} ${meta.label}`);

  return (
    <span className={`studio-warning-badge studio-warning-badge--${state}`} title={`${count} ${meta.label.toLowerCase()} warning${count === 1 ? "" : "s"}`}>
      <StudioIcon name={meta.icon} />
      <span>{visibleLabel}</span>
    </span>
  );
}
