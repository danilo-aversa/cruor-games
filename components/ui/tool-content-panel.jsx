import React from "react";

function joinClassNames(...values) {
  return values.filter(Boolean).join(" ");
}

export function ToolContentPanel({
  eyebrow,
  title,
  summary,
  children,
  actions,
  actionsLabel,
  className = "",
  headerSupplement = null,
  headerClassName = "",
  ...props
}) {
  const copy = (
    <div className="cruor-tool-copy">
      {eyebrow ? <span className="cruor-tool-copy__eyebrow">{eyebrow}</span> : null}
      {title ? <h3 className="cruor-tool-copy__title">{title}</h3> : null}
      {summary ? <p className="cruor-tool-summary">{summary}</p> : null}
    </div>
  );

  return (
    <div className={joinClassNames("cruor-tool-content-inner", className)} {...props}>
      {headerSupplement ? (
        <div className={joinClassNames("cruor-tool-header", headerClassName)}>
          <div className="cruor-tool-header__supplement">{headerSupplement}</div>
          {copy}
        </div>
      ) : copy}
      {children}
      {actions ? (
        <div className="cruor-tool-actions" aria-label={actionsLabel || undefined}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export function ToolFeatureBlock({
  as: Element = "section",
  label,
  children,
  className = "",
  ...props
}) {
  return (
    <Element className={joinClassNames("cruor-tool-feature-block", className)} {...props}>
      {label ? <span className="cruor-tool-feature-block__label">{label}</span> : null}
      {children}
    </Element>
  );
}

export function ToolOptionList({
  as: Element = "div",
  columns = 1,
  className = "",
  ...props
}) {
  return (
    <Element
      className={joinClassNames("cruor-tool-option-list", className)}
      data-columns={columns}
      {...props}
    />
  );
}

export const ToolOption = React.forwardRef(function ToolOption(
  {
    icon,
    label,
    description,
    active = false,
    stateIcon,
    className = "",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={joinClassNames("cruor-tool-option", active && "is-active", className)}
      type="button"
      {...props}
    >
      {icon ? (
        <span className="cruor-tool-option__icon" aria-hidden="true">
          <i className={`fa-solid ${icon}`} />
        </span>
      ) : null}
      <span className="cruor-tool-option__copy">
        <span className="cruor-tool-option__label">{label}</span>
        {description ? (
          <small className="cruor-tool-option__description">{description}</small>
        ) : null}
      </span>
      {stateIcon ? (
        <i className={`fa-solid ${stateIcon} cruor-tool-option__state`} aria-hidden="true" />
      ) : null}
    </button>
  );
});

export function ToolActions({ className = "", ...props }) {
  return <div className={joinClassNames("cruor-tool-actions", className)} {...props} />;
}

export const ToolButton = React.forwardRef(function ToolButton(
  {
    primary = false,
    icon,
    iconPosition = "end",
    className = "",
    children,
    ...props
  },
  ref,
) {
  const iconNode = icon ? <i className={`fa-solid ${icon}`} aria-hidden="true" /> : null;

  return (
    <button
      ref={ref}
      className={joinClassNames(
        "cruor-tool-button",
        primary && "cruor-tool-button--primary",
        className,
      )}
      type="button"
      {...props}
    >
      {iconPosition === "start" ? iconNode : null}
      <span>{children}</span>
      {iconPosition !== "start" ? iconNode : null}
    </button>
  );
});
