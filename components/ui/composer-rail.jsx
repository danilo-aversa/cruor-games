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
    footer = null,
    className = "",
    children,
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
        footer ? "cruor-composer-rail--with-footer" : "",
        className,
      )}
      data-composer-rail-side={normalizedSide}
      data-composer-rail-variant={variant || undefined}
      {...props}
    >
      {footer ? (
        <>
          <div className="cruor-composer-rail__body">{children}</div>
          <div className="cruor-composer-rail__footer">{footer}</div>
        </>
      ) : children}
    </Element>
  );
});

export function ComposerRailCard({
  as: Element = "section",
  title = "",
  hero = false,
  className = "",
  children,
  ...props
}) {
  return (
    <Element
      className={joinClassNames(
        "cruor-composer-rail-card",
        hero ? "cruor-composer-rail-card--hero" : "",
        className,
      )}
      {...props}
    >
      {title ? (
        <span className={hero ? "cruor-composer-rail-card__eyebrow" : undefined}>
          {title}
        </span>
      ) : null}
      {children}
    </Element>
  );
}

export function ComposerFactRow({
  as: Element = "span",
  label,
  value,
  className = "",
  labelClassName = "",
  valueClassName = "",
  ...props
}) {
  return (
    <Element
      className={joinClassNames("cruor-composer-fact-row", className)}
      {...props}
    >
      <small
        className={joinClassNames(
          "cruor-composer-fact-label",
          labelClassName,
        )}
      >
        {label}
      </small>
      <strong
        className={joinClassNames(
          "cruor-composer-fact-value",
          valueClassName,
        )}
      >
        {value}
      </strong>
    </Element>
  );
}

export function ComposerCollapsibleSection({
  as: Element = "section",
  title,
  defaultExpanded = true,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  scrollBody = false,
  children,
  ...props
}) {
  const generatedId = React.useId();
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const sectionRef = React.useRef(null);
  const bodyRef = React.useRef(null);
  const bodyId = `${generatedId.replace(/:/g, "")}-body`;

  React.useLayoutEffect(() => {
    const sectionNode = sectionRef.current;
    const bodyNode = bodyRef.current;

    if (
      !scrollBody ||
      !expanded ||
      !sectionNode ||
      !bodyNode ||
      typeof window === "undefined"
    ) {
      sectionNode?.style.removeProperty("--cruor-composer-scroll-body-max-height");
      return undefined;
    }

    const railNode = sectionNode.closest(".cruor-composer-rail");
    let frame = 0;

    const updateBodyLimit = () => {
      frame = 0;
      const bodyRect = bodyNode.getBoundingClientRect();
      const sectionRect = sectionNode.getBoundingClientRect();
      let boundaryBottom = window.innerHeight || document.documentElement.clientHeight || 0;

      // Start outside the accordion itself. Its region intentionally uses
      // overflow:hidden, so including it here would make the previous body
      // max-height become its own boundary and permanently freeze the value.
      let ancestor = sectionNode.parentElement;

      while (ancestor && ancestor !== document.body) {
        const ancestorStyle = window.getComputedStyle(ancestor);
        const overflowY = ancestorStyle.overflowY;
        const clipsVertically = ["auto", "scroll", "hidden", "clip"].includes(overflowY);

        const ancestorRect = ancestor.getBoundingClientRect();
        const isRailBoundary = ancestor === railNode;
        const railHasRemainingTrackSpace =
          isRailBoundary && ancestorRect.bottom > sectionRect.bottom + 1;

        if (clipsVertically || railHasRemainingTrackSpace) {
          const ancestorPaddingBottom =
            Number.parseFloat(ancestorStyle.paddingBottom || "0") || 0;
          if (ancestorRect.height > 0) {
            boundaryBottom = Math.min(
              boundaryBottom,
              ancestorRect.bottom - ancestorPaddingBottom,
            );
          }
        }

        ancestor = ancestor.parentElement;
      }

      const availableHeight = Math.max(
        0,
        Math.floor(boundaryBottom - bodyRect.top),
      );

      sectionNode.style.setProperty(
        "--cruor-composer-scroll-body-max-height",
        `${availableHeight}px`,
      );
    };

    const scheduleBodyLimitUpdate = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateBodyLimit);
    };

    scheduleBodyLimitUpdate();
    window.addEventListener("resize", scheduleBodyLimitUpdate);
    window.addEventListener("scroll", scheduleBodyLimitUpdate, true);

    const resizeObserver = typeof ResizeObserver === "function"
      ? new ResizeObserver(scheduleBodyLimitUpdate)
      : null;

    // Observe the whole layout chain rather than only the rail. The rail can
    // have a fixed height while preceding accordion rows shrink or grow,
    // changing this section's top position without resizing the rail itself.
    let observedNode = sectionNode.parentElement;
    while (observedNode && observedNode !== document.body) {
      resizeObserver?.observe(observedNode);
      observedNode = observedNode.parentElement;
    }

    const mutationObserver = typeof MutationObserver === "function" && railNode
      ? new MutationObserver(scheduleBodyLimitUpdate)
      : null;
    mutationObserver?.observe(railNode, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "hidden", "data-collapsed"],
    });

    railNode?.addEventListener("transitionend", scheduleBodyLimitUpdate, true);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", scheduleBodyLimitUpdate);
      window.removeEventListener("scroll", scheduleBodyLimitUpdate, true);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      railNode?.removeEventListener("transitionend", scheduleBodyLimitUpdate, true);
      sectionNode.style.removeProperty("--cruor-composer-scroll-body-max-height");
    };
  }, [expanded, scrollBody]);

  return (
    <Element
      ref={sectionRef}
      className={joinClassNames(
        "cruor-composer-sidebar-block",
        "cruor-composer-collapsible-section",
        expanded ? "is-expanded" : "is-collapsed",
        scrollBody && "has-scrollable-body",
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
        hidden={!expanded}
      >
        <div
          ref={bodyRef}
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
