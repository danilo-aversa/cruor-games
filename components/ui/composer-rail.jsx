import React from "react";

function joinClassNames(...values) {
  return values.filter(Boolean).join(" ");
}

export const ComposerRail = React.forwardRef(function ComposerRail(
  {
    as: Element = "aside",
    side,
    variant,
    scrollable = false,
    surface = false,
    className = "",
    ...props
  },
  ref,
) {
  const normalizedSide = side === "left" || side === "right" ? side : undefined;

  return (
    <Element
      ref={ref}
      className={joinClassNames(
        "cruor-composer-rail",
        normalizedSide ? `cruor-composer-rail--${normalizedSide}` : "",
        variant ? `cruor-composer-rail--${variant}` : "",
        scrollable ? "cruor-composer-rail--scroll" : "",
        scrollable ? "cruor-scroll-surface" : "",
        surface ? "cruor-composer-rail--surface" : "",
        className,
      )}
      data-composer-rail-side={normalizedSide}
      data-composer-rail-variant={variant || undefined}
      {...props}
    />
  );
});

export function ComposerCollapsibleSection({
  as: Element = "section",
  title,
  defaultExpanded = true,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  children,
  ...props
}) {
  const generatedId = React.useId();
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const bodyId = `${generatedId.replace(/:/g, "")}-body`;

  return (
    <Element
      className={joinClassNames(
        "cruor-composer-sidebar-block",
        "cruor-composer-collapsible-section",
        expanded ? "is-expanded" : "is-collapsed",
        className,
      )}
      data-collapsed={expanded ? "false" : "true"}
      {...props}
    >
      <button
        className={joinClassNames(
          "cruor-composer-collapsible-section__trigger",
          headerClassName,
        )}
        type="button"
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="cruor-composer-collapsible-section__title">{title}</span>
        <span className="cruor-composer-collapsible-section__chevron" aria-hidden="true" />
      </button>

      <div
        id={bodyId}
        className="cruor-composer-collapsible-section__region"
        aria-hidden={!expanded}
      >
        <div
          className={joinClassNames(
            "cruor-composer-collapsible-section__body",
            bodyClassName,
          )}
        >
          {children}
        </div>
      </div>
    </Element>
  );
}
