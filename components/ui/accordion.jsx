import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  useRef,
  useState,
} from "react";

function joinClassNames(...values) {
  return values.filter(Boolean).join(" ");
}

export function Accordion({
  children,
  defaultValue = null,
  className = "",
  ...props
}) {
  const items = Children.toArray(children).filter(isValidElement);
  const [openValue, setOpenValue] = useState(defaultValue);
  const triggerRefs = useRef([]);

  const focusTrigger = (index) => {
    const total = triggerRefs.current.length;
    if (!total) return;

    const normalizedIndex = (index + total) % total;
    triggerRefs.current[normalizedIndex]?.focus();
  };

  const handleTriggerKeyDown = (event, index) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusTrigger(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusTrigger(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTrigger(0);
        break;
      case "End":
        event.preventDefault();
        focusTrigger(items.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className={joinClassNames("cruor-accordion", className)} {...props}>
      {items.map((item, index) => {
        const value = item.props.value ?? `item-${index + 1}`;

        return cloneElement(item, {
          accordionIndex: index,
          isOpen: openValue === value,
          onToggle: () =>
            setOpenValue((currentValue) =>
              currentValue === value ? null : value,
            ),
          onTriggerKeyDown: (event) => handleTriggerKeyDown(event, index),
          triggerRef: (element) => {
            triggerRefs.current[index] = element;
          },
        });
      })}
    </div>
  );
}

export function AccordionItem({
  value: _value,
  title,
  children,
  className = "",
  isOpen = false,
  onToggle,
  onTriggerKeyDown,
  triggerRef,
  accordionIndex = 0,
  ...props
}) {
  const generatedId = useId().replace(/:/g, "");
  const triggerId = `cruor-accordion-${generatedId}-trigger`;
  const panelId = `cruor-accordion-${generatedId}-panel`;

  return (
    <section
      className={joinClassNames(
        "cruor-accordion__item",
        isOpen ? "is-open" : "is-closed",
        className,
      )}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      <h3 className="cruor-accordion__heading">
        <button
          ref={triggerRef}
          id={triggerId}
          className="cruor-accordion__trigger"
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          onKeyDown={onTriggerKeyDown}
        >
          <span className="cruor-accordion__index" aria-hidden="true">
            {String(accordionIndex + 1).padStart(2, "0")}
          </span>
          <span className="cruor-accordion__title">{title}</span>
          <span className="cruor-accordion__icon" aria-hidden="true" />
        </button>
      </h3>

      <div
        id={panelId}
        className="cruor-accordion__panel"
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!isOpen}
      >
        <div className="cruor-accordion__panel-inner">{children}</div>
      </div>
    </section>
  );
}
