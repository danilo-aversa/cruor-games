import React from "react";

function joinClassNames(...values) {
  return values.filter(Boolean).join(" ");
}

export const ComposerSlotCard = React.forwardRef(function ComposerSlotCard(
  {
    icon: Icon,
    label,
    value = "—",
    contentTitle = "Empty Slot",
    description = "",
    filled = false,
    active = false,
    className = "",
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={joinClassNames(
        "cruor-composer-slot-card",
        filled ? "is-filled" : "is-empty",
        active ? "is-active" : "",
        className,
      )}
      aria-pressed={active}
      {...props}
    >
      <span className="cruor-composer-slot-card__head">
        <span>
          {Icon ? <Icon aria-hidden="true" /> : null}
          {label}
        </span>
        <strong>{value}</strong>
      </span>

      <span className="cruor-composer-slot-card__body">
        <strong>{contentTitle}</strong>
        <em>{description}</em>
      </span>
    </button>
  );
});
