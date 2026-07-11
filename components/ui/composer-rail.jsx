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
        surface ? "cruor-composer-rail--surface" : "",
        className,
      )}
      data-composer-rail-side={normalizedSide}
      data-composer-rail-variant={variant || undefined}
      {...props}
    />
  );
});
