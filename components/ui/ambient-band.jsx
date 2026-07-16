import "./ambient-band.css";

function joinClassNames(...values) {
  return values.filter(Boolean).join(" ");
}

export default function AmbientBand({
  as: Element = "div",
  className = "",
  backdropClassName = "",
  contentClassName = "",
  children,
  ...props
}) {
  return (
    <Element className={joinClassNames("cruor-ambient-band", className)} {...props}>
      <span
        className={joinClassNames(
          "cruor-ambient-band__backdrop",
          backdropClassName,
        )}
        aria-hidden="true"
      />
      <div
        className={joinClassNames(
          "cruor-ambient-band__content",
          contentClassName,
        )}
      >
        {children}
      </div>
    </Element>
  );
}
