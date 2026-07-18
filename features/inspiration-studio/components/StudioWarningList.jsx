import {
  getStudioWarningSeverityMeta,
  groupStudioWarningsByComponent,
  summarizeStudioWarnings,
} from "../model/studio-warning-model.js";
import { openStudioDisclosuresForField } from "../ui/StudioSection.jsx";
import { StudioIcon } from "./StudioIcon.jsx";

export function StudioWarningList({ draft = {}, emptyLabel = "No Studio warnings.", grouped = true, maxGroups = 0, warnings = [] }) {
  const visibleGroups = grouped
    ? groupStudioWarningsByComponent(warnings, draft)
    : [{ key: "all", title: "Current Draft", area: "Studio", warnings, summary: summarizeStudioWarnings(warnings) }];
  const groups = maxGroups > 0 ? visibleGroups.slice(0, maxGroups) : visibleGroups;

  if (!warnings.length) {
    return (
      <div className="studio-warning-list__empty">
        <StudioIcon name="fa-circle-check" />
        <span>{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div className="studio-warning-list" role="list">
      {groups.map((group) => (
        <article className="studio-warning-group" key={group.key} role="listitem">
          <header className="studio-warning-group__header">
            <span>{group.area}</span>
            <strong>{group.title}</strong>
            <em>
              {group.summary.blocking} blocking · {group.summary.editorial}{" "}
              editorial · {group.summary.suggestion} suggestions ·{" "}
              {group.summary.legacy || 0} legacy
            </em>
          </header>
          <div className="studio-warning-group__items">
            {group.warnings.map((warning) => {
              const meta = getStudioWarningSeverityMeta(warning.severity);
              return (
                <div className={`studio-warning-item studio-warning-item--${warning.severity}`} key={warning.id}>
                  <span className="studio-warning-item__badge">
                    <StudioIcon name={meta.icon} />
                    {meta.label}
                  </span>
                  <div>
                    <strong>{warning.message}</strong>
                    <p>{warning.suggestedFix}</p>
                    {warning.fieldId ? (
                      <a
                        className="studio-warning-item__field-link"
                        href={`#${warning.fieldId}`}
                        onClick={(event) => {
                          const field = document.getElementById(warning.fieldId);
                          const editorRoot = field?.closest(
                            ".studio-component-editor-shell",
                          );
                          if (!field || !editorRoot) return;
                          event.preventDefault();
                          openStudioDisclosuresForField(
                            editorRoot,
                            warning.fieldId,
                          );
                          window.requestAnimationFrame(() => {
                            field.focus?.({ preventScroll: true });
                            field.scrollIntoView?.({
                              behavior: "smooth",
                              block: "center",
                            });
                          });
                        }}
                      >
                        <StudioIcon name="fa-arrow-up-right-from-square" />{" "}
                        {warning.path}
                      </a>
                    ) : (
                      <em>{warning.path}</em>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}
