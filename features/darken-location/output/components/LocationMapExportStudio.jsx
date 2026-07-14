import { ComposerCollapsibleSection, ComposerRail } from "../../../../components/ui/composer-rail.jsx";
import { LEVEL_VIEW_ALL } from "../../map-generator/map-generator.state.js";
import {
  LOCATION_MAP_EXPORT_CROPS,
  LOCATION_MAP_EXPORT_FORMATS,
  LOCATION_MAP_EXPORT_PADDING,
  LOCATION_MAP_EXPORT_PNG_SCALES,
  LOCATION_MAP_EXPORT_PRESETS,
  getAvailableLocationMapExportLevels,
} from "../model/location-map-export.js";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatLevel(value) {
  const level = Number(value);
  if (!Number.isFinite(level) || level === 0) return "Ground · 0";
  return level > 0 ? `Above · +${level}` : `Below · ${level}`;
}

const PRESET_ICONS = {
  gm: "fa-user-shield",
  player: "fa-users",
  print: "fa-print",
};

const FORMAT_ICONS = {
  svg: "fa-bezier-curve",
  png: "fa-image",
};

const CROP_ICONS = {
  content: "fa-crop-simple",
  canvas: "fa-expand",
};

const BACKGROUND_OPTIONS = [
  { id: "style", label: "Map Style", icon: "fa-scroll" },
  { id: "white", label: "White", icon: "fa-file" },
  { id: "transparent", label: "Transparent", icon: "fa-chess-board" },
];

const LAYER_OPTIONS = [
  { key: "showGrid", label: "Grid", icon: "fa-border-all" },
  { key: "showRoomNumbers", label: "Room numbers", icon: "fa-list-ol" },
  { key: "showRoomNames", label: "Room names", icon: "fa-font" },
  { key: "showProps", label: "Props and markers", icon: "fa-location-dot" },
  { key: "showStairArrows", label: "Stair direction", icon: "fa-stairs" },
  { key: "showHatching", label: "External hatching", icon: "fa-lines-leaning" },
  { key: "showTexture", label: "Paper texture", icon: "fa-scroll" },
  { key: "hideSecrets", label: "Hide secret routes", icon: "fa-eye-slash" },
];

function getOptionLabel(options, value, fallback = "") {
  return options.find((option) => String(option.id) === String(value))?.label || fallback;
}

function OptionGroup({
  ariaLabel,
  columns = 2,
  disabled = false,
  onChange,
  options,
  value,
}) {
  return (
    <div
      className="location-map-export-option-grid"
      data-columns={columns}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
    >
      {options.map((option) => {
        const active = String(value) === String(option.id);
        return (
          <button
            className={cx(
              "location-map-export-option",
              "cruor-composer-control",
              active && "is-active",
            )}
            type="button"
            role="radio"
            key={option.id}
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(option.id)}
          >
            {option.icon ? <i className={`fa-solid ${option.icon}`} aria-hidden="true" /> : null}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FieldGroup({ label, valueLabel, children }) {
  return (
    <div className="location-field cruor-frame-select-field location-map-export-field">
      <div className="cruor-frame-field-head location-frame-field-head location-map-export-field__head">
        <span>{label}</span>
        {valueLabel ? <strong>{valueLabel}</strong> : null}
      </div>
      {children}
    </div>
  );
}

function LevelSelect({ levels, value, onChange }) {
  return (
    <label className="location-field location-choice-field cruor-frame-select-field location-map-export-field">
      <span className="cruor-frame-field-head location-frame-field-head location-map-export-field__head">
        <span>Level</span>
      </span>
      <select
        className="cruor-composer-control location-map-export-select"
        value={String(value ?? LEVEL_VIEW_ALL)}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue === LEVEL_VIEW_ALL ? LEVEL_VIEW_ALL : Number(nextValue));
        }}
      >
        <option value={LEVEL_VIEW_ALL}>All Levels</option>
        {levels.map((level) => (
          <option value={String(level)} key={level}>{formatLevel(level)}</option>
        ))}
      </select>
    </label>
  );
}

function LayerToggle({ checked, icon, label, onChange }) {
  return (
    <button
      className={cx(
        "location-map-export-layer",
        "cruor-composer-control",
        checked && "is-active",
      )}
      type="button"
      role="checkbox"
      aria-checked={Boolean(checked)}
      onClick={() => onChange(!checked)}
    >
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
      <span>{label}</span>
      <i className={`fa-solid ${checked ? "fa-check" : "fa-minus"}`} aria-hidden="true" />
    </button>
  );
}

export function LocationMapExportStudio({
  busy = false,
  generatedMap,
  onChange,
  onClose,
  onDownload,
  onPreset,
  settings,
  status = "",
}) {
  const levels = getAvailableLocationMapExportLevels(generatedMap);
  const format = settings?.format || "svg";
  const activePreset = LOCATION_MAP_EXPORT_PRESETS.find((preset) => preset.id === settings?.preset);
  const presetOptions = LOCATION_MAP_EXPORT_PRESETS.map((preset) => ({
    ...preset,
    icon: PRESET_ICONS[preset.id] || "fa-map",
  }));
  const formatOptions = LOCATION_MAP_EXPORT_FORMATS.map((option) => ({
    ...option,
    icon: FORMAT_ICONS[option.id] || "fa-file",
  }));
  const cropOptions = LOCATION_MAP_EXPORT_CROPS.map((option) => ({
    ...option,
    icon: CROP_ICONS[option.id] || "fa-crop-simple",
  }));
  const scaleOptions = LOCATION_MAP_EXPORT_PNG_SCALES.map((option) => ({
    ...option,
    label: option.label.replace(" · ", " "),
  }));

  return (
    <ComposerRail
      side="right"
      variant="controls"
      surface
      scrollable
      className="location-map-export-studio location-composer__rail location-composer__rail--right location-map-frame-rail"
      aria-label="Map export settings"
    >
      <section className="location-map-export-studio__header cruor-composer-sidebar-block" aria-label="Map export">
        <span className="cruor-composer-collapsible-section__title">Map Export</span>
        <button
          className="location-output-icon-action cruor-square-icon-button cruor-square-icon-button--compact"
          type="button"
          aria-label="Close map export settings"
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </section>

      <ComposerCollapsibleSection
        title="Profile"
        className="location-map-export-section location-frame-control-block"
        bodyClassName="location-map-export-section__body location-frame-selector-stack"
        aria-label="Map export profile"
      >
        <FieldGroup label="Audience" valueLabel={activePreset?.label || "Custom"}>
          <OptionGroup
            ariaLabel="Map export profile"
            columns={3}
            options={presetOptions}
            value={settings?.preset}
            onChange={(value) => onPreset?.(value)}
          />
        </FieldGroup>
      </ComposerCollapsibleSection>

      <ComposerCollapsibleSection
        title="File"
        className="location-map-export-section location-frame-control-block"
        bodyClassName="location-map-export-section__body location-frame-selector-stack"
        aria-label="Map export file settings"
      >
        <FieldGroup label="Format" valueLabel={format.toUpperCase()}>
          <OptionGroup
            ariaLabel="File format"
            options={formatOptions}
            value={format}
            onChange={(value) => onChange?.({ format: value })}
          />
        </FieldGroup>
        {format === "png" ? (
          <FieldGroup
            label="Resolution"
            valueLabel={getOptionLabel(LOCATION_MAP_EXPORT_PNG_SCALES, settings?.pngScale, "Print · 2×")}
          >
            <OptionGroup
              ariaLabel="PNG resolution"
              columns={3}
              options={scaleOptions}
              value={settings?.pngScale || 2}
              onChange={(value) => onChange?.({ pngScale: Number(value) })}
            />
          </FieldGroup>
        ) : null}
      </ComposerCollapsibleSection>

      <ComposerCollapsibleSection
        title="Framing"
        className="location-map-export-section location-frame-control-block"
        bodyClassName="location-map-export-section__body location-frame-selector-stack"
        aria-label="Map export framing"
      >
        <FieldGroup
          label="Crop"
          valueLabel={getOptionLabel(LOCATION_MAP_EXPORT_CROPS, settings?.crop, "Content Bounds")}
        >
          <OptionGroup
            ariaLabel="Crop area"
            options={cropOptions}
            value={settings?.crop || "content"}
            onChange={(value) => onChange?.({ crop: value })}
          />
        </FieldGroup>
        {settings?.crop !== "canvas" ? (
          <FieldGroup
            label="Padding"
            valueLabel={getOptionLabel(LOCATION_MAP_EXPORT_PADDING, settings?.padding, "Standard")}
          >
            <OptionGroup
              ariaLabel="Crop padding"
              columns={4}
              options={LOCATION_MAP_EXPORT_PADDING}
              value={settings?.padding ?? 48}
              onChange={(value) => onChange?.({ padding: Number(value) })}
            />
          </FieldGroup>
        ) : null}
        <LevelSelect
          levels={levels}
          value={settings?.levelView}
          onChange={(value) => onChange?.({ levelView: value })}
        />
      </ComposerCollapsibleSection>

      <ComposerCollapsibleSection
        title="Layers"
        className="location-map-export-section location-frame-control-block"
        bodyClassName="location-map-export-section__body location-frame-selector-stack"
        aria-label="Map export layers"
      >
        <div className="location-map-export-layer-list" role="group" aria-label="Map layers">
          {LAYER_OPTIONS.map((option) => (
            <LayerToggle
              key={option.key}
              checked={settings?.[option.key]}
              icon={option.icon}
              label={option.label}
              onChange={(value) => onChange?.({ [option.key]: value })}
            />
          ))}
        </div>
      </ComposerCollapsibleSection>

      <ComposerCollapsibleSection
        title="Background"
        className="location-map-export-section location-frame-control-block"
        bodyClassName="location-map-export-section__body location-frame-selector-stack"
        aria-label="Map export background"
      >
        <FieldGroup
          label="Surface"
          valueLabel={getOptionLabel(BACKGROUND_OPTIONS, settings?.background, "Map Style")}
        >
          <OptionGroup
            ariaLabel="Map background"
            columns={3}
            options={BACKGROUND_OPTIONS}
            value={settings?.background || "style"}
            onChange={(value) => onChange?.({ background: value })}
          />
        </FieldGroup>
      </ComposerCollapsibleSection>

      <section className="location-map-export-studio__footer cruor-composer-sidebar-block">
        <button
          className="cruor-composer-control location-map-export-download"
          type="button"
          disabled={busy || !generatedMap}
          onClick={onDownload}
          data-testid="dark-places-map-export-download"
        >
          <i className={`fa-solid ${busy ? "fa-spinner fa-spin" : "fa-download"}`} aria-hidden="true" />
          <span>{busy ? "Preparing" : `Download ${format.toUpperCase()}`}</span>
        </button>
        <span className={cx("location-map-export-status", status && "is-visible")} aria-live="polite">
          {status}
        </span>
      </section>
    </ComposerRail>
  );
}
