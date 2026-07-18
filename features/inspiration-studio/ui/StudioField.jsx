import { StudioIcon } from "../components/StudioIcon.jsx";
import { getStudioFieldDomId } from "../model/studio-field-links.js";

function normalizeTooltipLine(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function StudioHelp({ items = "", text = "", title = "Info" }) {
  const tooltipText = [text, items].filter(Boolean).join("\n");
  if (!tooltipText) return null;

  return (
    <span
      className="studio-help"
      tabIndex={0}
      role="button"
      aria-label={`${title}: ${normalizeTooltipLine(tooltipText)}`}
      data-key="tooltip-generic"
      data-tooltip={title}
      data-tooltip-description={tooltipText}
    >
      <span aria-hidden="true">?</span>
    </span>
  );
}

export function StudioFieldGrid({ children, className = "", columns = "two" }) {
  return (
    <div
      className={`studio-form-grid ${className}`.trim()}
      data-columns={columns}
    >
      {children}
    </div>
  );
}

export function StudioField({
  children,
  className = "",
  componentId = "",
  fullWidth = false,
  helpItems = "",
  hint = "",
  icon = "",
  id = "",
  label,
  path = "",
}) {
  const controlId = id || getStudioFieldDomId(componentId, path);
  const control =
    typeof children === "function" ? children({ id: controlId }) : children;

  return (
    <div
      className={`studio-form-row ${fullWidth ? "studio-form-row--wide" : ""} ${className}`.trim()}
      data-studio-field-path={path || undefined}
    >
      <span className="studio-field-head">
        <label className="studio-field-label" htmlFor={controlId || undefined}>
          {icon ? <StudioIcon name={icon} /> : null}
          {label}
        </label>
        <StudioHelp title={label} text={hint} items={helpItems} />
      </span>
      {control}
    </div>
  );
}

export function StudioInput({ onChange, value, ...props }) {
  return (
    <input
      {...props}
      value={value ?? ""}
      onChange={(event) => onChange?.(event.target.value, event)}
    />
  );
}

export function StudioNumberInput({ onChange, value, ...props }) {
  return (
    <input
      {...props}
      type="number"
      value={value ?? ""}
      onChange={(event) => {
        const nextValue = event.target.value;
        onChange?.(nextValue === "" ? "" : Number(nextValue), event);
      }}
    />
  );
}

export function StudioTextarea({ onChange, value, ...props }) {
  return (
    <textarea
      {...props}
      value={value ?? ""}
      onChange={(event) => onChange?.(event.target.value, event)}
    />
  );
}

export function StudioSelect({ onChange, options = [], value, ...props }) {
  return (
    <select
      {...props}
      value={value ?? ""}
      onChange={(event) => onChange?.(event.target.value, event)}
    >
      {options.map((option) => {
        const optionValue = Array.isArray(option) ? option[0] : option.value;
        const optionLabel = Array.isArray(option) ? option[1] : option.label;
        const optionDisabled = Array.isArray(option)
          ? false
          : Boolean(option.disabled);
        return (
          <option
            key={String(optionValue)}
            value={optionValue}
            disabled={optionDisabled}
          >
            {optionLabel}
          </option>
        );
      })}
    </select>
  );
}

export function StudioCheckbox({ checked = false, onChange, ...props }) {
  return (
    <input
      {...props}
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange?.(event.target.checked, event)}
    />
  );
}

export function splitStudioLines(value = "") {
  return String(value || "")
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function joinStudioLines(value = []) {
  return Array.isArray(value) ? value.join("\n") : "";
}

export function StudioStructuredField({
  checked = false,
  componentId,
  description = "",
  label,
  max,
  min,
  multiline = false,
  onChange,
  options = [],
  path,
  rows = 3,
  type = "text",
  value = "",
}) {
  const checkbox = type === "checkbox";
  const fullWidth = multiline;

  return (
    <StudioField
      className={checkbox ? "studio-form-row--checkbox" : ""}
      componentId={componentId}
      fullWidth={fullWidth}
      hint={description}
      label={label}
      path={path}
    >
      {({ id }) => {
        if (checkbox) {
          return (
            <StudioCheckbox id={id} checked={checked} onChange={onChange} />
          );
        }
        if (options.length) {
          return (
            <StudioSelect
              id={id}
              options={options}
              value={value}
              onChange={onChange}
            />
          );
        }
        if (multiline) {
          return (
            <StudioTextarea
              id={id}
              rows={rows}
              value={value}
              onChange={onChange}
            />
          );
        }
        if (type === "number") {
          return (
            <StudioNumberInput
              id={id}
              min={min}
              max={max}
              value={value}
              onChange={onChange}
            />
          );
        }
        return (
          <StudioInput
            id={id}
            type={type}
            min={min}
            max={max}
            value={value}
            onChange={onChange}
          />
        );
      }}
    </StudioField>
  );
}

export function StudioListField(props) {
  return (
    <StudioStructuredField
      {...props}
      multiline
      value={joinStudioLines(props.value)}
      onChange={(value) => props.onChange(splitStudioLines(value))}
    />
  );
}

export function StudioFieldset({ children, className = "", legend }) {
  return (
    <fieldset className={`studio-fieldset ${className}`.trim()}>
      <legend>{legend}</legend>
      <StudioFieldGrid>{children}</StudioFieldGrid>
    </fieldset>
  );
}

