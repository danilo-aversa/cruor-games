import { StudioIcon } from "../components/StudioIcon.jsx";
import { getStudioFieldDomId } from "../model/studio-field-links.js";

export function splitStudioLines(value = "") {
  return String(value || "")
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function joinStudioLines(value = []) {
  return Array.isArray(value) ? value.join("\n") : "";
}

export function StudioEditorSection({
  children,
  description = "",
  icon = "fa-pen-ruler",
  title,
}) {
  return (
    <section className="studio-semantic-editor__section">
      <header>
        <span>
          <StudioIcon name={icon} />
        </span>
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
      </header>
      <div className="studio-semantic-editor__fields">{children}</div>
    </section>
  );
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
  const id = getStudioFieldDomId(componentId, path);
  let control = null;

  if (type === "checkbox") {
    control = (
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  } else if (options.length) {
    control = (
      <select
        id={id}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => {
          const optionValue = Array.isArray(option) ? option[0] : option.value;
          const optionLabel = Array.isArray(option) ? option[1] : option.label;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    );
  } else if (multiline) {
    control = (
      <textarea
        id={id}
        rows={rows}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  } else {
    control = (
      <input
        id={id}
        type={type}
        min={min}
        max={max}
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            type === "number" && event.target.value !== ""
              ? Number(event.target.value)
              : event.target.value,
          )
        }
      />
    );
  }

  return (
    <label
      className={`studio-semantic-field ${type === "checkbox" ? "studio-semantic-field--checkbox" : ""}`.trim()}
      data-studio-field-path={path}
    >
      <span>{label}</span>
      {description ? <small>{description}</small> : null}
      {control}
    </label>
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

export function StudioArrayEditor({
  addLabel,
  children,
  componentId,
  emptyLabel = "No entries authored yet.",
  items = [],
  onAdd,
  onRemove,
  path,
}) {
  const id = getStudioFieldDomId(componentId, path);
  return (
    <div
      className="studio-semantic-array"
      id={id}
      data-studio-field-path={path}
    >
      {items.length ? (
        <div className="studio-semantic-array__items">
          {items.map((item, index) => (
            <article
              className="studio-semantic-array__item"
              key={item?.id || `${path}-${index}`}
            >
              <div className="studio-semantic-array__item-fields">
                {children(item, index)}
              </div>
              <button
                className="studio-semantic-array__remove"
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${addLabel} ${index + 1}`}
              >
                <StudioIcon name="fa-trash" />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="studio-semantic-array__empty">{emptyLabel}</p>
      )}
      <button
        className="studio-semantic-array__add"
        type="button"
        onClick={onAdd}
      >
        <StudioIcon name="fa-plus" /> {addLabel}
      </button>
    </div>
  );
}
