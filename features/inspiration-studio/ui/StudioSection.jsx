import { StudioIcon } from "../components/StudioIcon.jsx";
import { StudioFieldGrid, StudioHelp } from "./StudioField.jsx";

function StudioSectionTitle({ actions, collapsible = false, help, icon, title }) {
  return (
    <>
      <span className="studio-rules-group__title">
        {icon ? <StudioIcon name={icon} /> : null}
        {title}
        <StudioHelp title={title} text={help} />
      </span>
      <span className="studio-rules-group__tools">
        {actions}
        {collapsible ? <StudioIcon name="fa-chevron-down" /> : null}
      </span>
    </>
  );
}


export function StudioDividerLabel({
  help = "",
  icon = "",
  title,
  zone = "",
}) {
  return (
    <div
      className="studio-divider-label"
      data-editor-zone={zone || undefined}
    >
      <span className="studio-divider-label__title">
        {icon ? <StudioIcon name={icon} /> : null}
        {title}
      </span>
      <StudioHelp title={title} text={help} />
    </div>
  );
}

export function StudioSection({
  actions = null,
  children,
  className = "",
  help = "",
  icon = "",
  title,
  zone = "",
}) {
  return (
    <section
      className={`studio-rules-group studio-rules-group--static ${className}`.trim()}
      data-editor-zone={zone || undefined}
    >
      <header className="studio-collapsible-group__heading">
        <StudioSectionTitle
          actions={actions}
          help={help}
          icon={icon}
          title={title}
        />
      </header>
      <div className="studio-rules-group__body">{children}</div>
    </section>
  );
}

export function StudioCollapsibleSection({
  actions = null,
  children,
  className = "",
  defaultOpen = false,
  help = "",
  icon = "",
  onToggle,
  open,
  title,
  zone = "",
}) {
  return (
    <details
      className={`studio-rules-group studio-rules-group--collapsible ${className}`.trim()}
      data-editor-zone={zone || undefined}
      open={typeof open === "boolean" ? open : defaultOpen || undefined}
      onToggle={(event) => onToggle?.(event.currentTarget.open, event)}
    >
      <summary className="studio-collapsible-group__heading">
        <StudioSectionTitle
          actions={actions}
          collapsible
          help={help}
          icon={icon}
          title={title}
        />
      </summary>
      <div className="studio-rules-group__body">{children}</div>
    </details>
  );
}

export function StudioAdvancedDetails({
  children,
  className = "",
  defaultOpen = false,
  icon = "fa-gear",
  label = "Advanced",
}) {
  return (
    <details
      className={`studio-advanced-details ${className}`.trim()}
      open={defaultOpen || undefined}
    >
      <summary>
        <StudioIcon name={icon} /> {label}
      </summary>
      <div className="studio-advanced-details__body">{children}</div>
    </details>
  );
}

export function StudioEditorSection({
  actions = null,
  children,
  className = "",
  defaultOpen = false,
  description = "",
  icon = "fa-pen-ruler",
  onToggle,
  open,
  title,
  zone = "",
}) {
  return (
    <StudioCollapsibleSection
      actions={actions}
      className={`studio-editor-section ${className}`.trim()}
      defaultOpen={defaultOpen}
      help={description}
      icon={icon}
      onToggle={onToggle}
      open={open}
      title={title}
      zone={zone}
    >
      <StudioFieldGrid>{children}</StudioFieldGrid>
    </StudioCollapsibleSection>
  );
}

export function openStudioDisclosuresForField(root, fieldId) {
  if (!root || !fieldId || typeof document === "undefined") return false;
  const field = document.getElementById(fieldId);
  if (!field || !root.contains(field)) return false;

  let current = field.parentElement;
  let opened = false;
  while (current && root.contains(current)) {
    if (current.tagName === "DETAILS" && !current.open) {
      current.open = true;
      opened = true;
    }
    if (current === root) break;
    current = current.parentElement;
  }
  return opened;
}

