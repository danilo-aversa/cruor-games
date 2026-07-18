import { useState } from "react";

import { StudioIcon } from "../components/StudioIcon.jsx";

export function StudioButton({
  children,
  className = "",
  compact = false,
  danger = false,
  icon = "",
  variant = "default",
  ...props
}) {
  const resolvedDanger = danger || variant === "danger";
  return (
    <button
      {...props}
      className={`studio-inline-action ${compact ? "studio-inline-action--compact" : ""} ${resolvedDanger ? "studio-inline-action--danger" : ""} ${className}`.trim()}
      type={props.type || "button"}
      data-variant={variant}
    >
      {icon ? <StudioIcon name={icon} /> : null}
      {children}
    </button>
  );
}

export function StudioIconButton({
  className = "",
  danger = false,
  icon,
  label,
  ...props
}) {
  return (
    <button
      {...props}
      className={`studio-icon-button ${danger ? "studio-icon-button--danger" : ""} ${className}`.trim()}
      type={props.type || "button"}
      aria-label={label}
      title={props.title || label}
    >
      <StudioIcon name={icon} />
    </button>
  );
}

export function StudioTabs({ children, className = "", label, orientation = "horizontal" }) {
  return (
    <div
      className={`studio-tabs ${className}`.trim()}
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      data-orientation={orientation}
    >
      {children}
    </div>
  );
}

export function StudioTab({
  active = false,
  count,
  hint = "",
  icon = "",
  label,
  ...props
}) {
  const tooltip = hint ? `${label}: ${hint}` : label;
  return (
    <button
      {...props}
      className={`studio-tab-button ${props.className || ""}`.trim()}
      type={props.type || "button"}
      role="tab"
      aria-label={tooltip}
      aria-selected={active}
      title={tooltip}
    >
      <span className="studio-tab-button__label">
        {icon ? <StudioIcon name={icon} /> : null}
        <span>{label}</span>
        {typeof count === "number" ? <strong>{count}</strong> : null}
      </span>
    </button>
  );
}

export function StudioStatusBadge({ children, className = "", icon = "", status = "neutral" }) {
  return (
    <span
      className={`studio-status-badge studio-status-badge--${status} ${className}`.trim()}
      data-status={status}
    >
      {icon ? <StudioIcon name={icon} /> : null}
      <span>{children}</span>
    </span>
  );
}

export function StudioArmedDeleteButton({
  confirmDelay = 800,
  confirmWindow = 5000,
  confirmLabel = "Confirm Delete?",
  icon = "fa-trash",
  label = "Remove Component",
  onConfirm,
}) {
  const [armedAt, setArmedAt] = useState(0);
  const isArmed = Boolean(armedAt);

  function handleClick() {
    const now = Date.now();
    if (!isArmed) {
      setArmedAt(now);
      window.setTimeout(
        () => setArmedAt((current) => (current === now ? 0 : current)),
        confirmWindow,
      );
      return;
    }
    if (now - armedAt < confirmDelay) return;
    setArmedAt(0);
    onConfirm?.();
  }

  return (
    <StudioButton
      aria-live="polite"
      className={isArmed ? "is-armed" : ""}
      danger
      icon={isArmed ? "fa-triangle-exclamation" : icon}
      onClick={handleClick}
    >
      {isArmed ? confirmLabel : label}
    </StudioButton>
  );
}
