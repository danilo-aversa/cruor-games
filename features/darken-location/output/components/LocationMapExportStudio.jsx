import {
  ToolContentPanel,
  ToolFeatureBlock,
  ToolOption,
  ToolOptionList,
} from "../../../../components/ui/tool-content-panel.jsx";
import { LEVEL_VIEW_ALL } from "../../map-generator/map-generator.state.js";
import {
  LOCATION_MAP_EXPORT_CROPS,
  LOCATION_MAP_EXPORT_FORMATS,
  LOCATION_MAP_EXPORT_PADDING,
  LOCATION_MAP_EXPORT_PNG_SCALES,
  LOCATION_MAP_EXPORT_PRESETS,
  getAvailableLocationMapExportLevels,
} from "../model/location-map-export.js";

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

const FORMAT_DESCRIPTIONS = {
  svg: "Editable vector artwork with no fixed resolution.",
  png: "Raster image for sharing, printing, or VTT preparation.",
};

const CROP_ICONS = {
  content: "fa-crop-simple",
  canvas: "fa-expand",
};

const CROP_DESCRIPTIONS = {
  content: "Trim the file to the visible map and its selected padding.",
  canvas: "Keep the complete authored map canvas.",
};

const SCALE_DESCRIPTIONS = {
  1: "Fast export for screens and lightweight sharing.",
  2: "Balanced resolution for ordinary printing.",
  4: "Large raster for detailed print or VTT preparation.",
};

const PADDING_DESCRIPTIONS = {
  0: "No extra space around the content bounds.",
  24: "A narrow margin around the map.",
  48: "The standard breathing room for export.",
  96: "A broad margin for notes or page layout.",
};

const BACKGROUND_OPTIONS = [
  {
    id: "style",
    label: "Map Style",
    icon: "fa-scroll",
    description: "Keep the authored paper and map treatment.",
  },
  {
    id: "white",
    label: "White",
    icon: "fa-file",
    description: "Use a clean white surface for print and documents.",
  },
  {
    id: "transparent",
    label: "Transparent",
    icon: "fa-chess-board",
    description: "Remove the page background from the exported image.",
  },
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


function OptionGroup({
  ariaLabel,
  disabled = false,
  onChange,
  options,
  value,
}) {
  return (
    <ToolOptionList
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
    >
      {options.map((option) => {
        const active = String(value) === String(option.id);
        return (
          <ToolOption
            key={option.id}
            active={active}
            icon={option.icon}
            label={option.label}
            description={option.description}
            stateIcon={active ? "fa-check" : ""}
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(option.id)}
          />
        );
      })}
    </ToolOptionList>
  );
}

function LevelSelect({ levels, value, onChange }) {
  return (
    <div className="location-map-export-select-row">
      <span className="cruor-tool-option__icon" aria-hidden="true">
        <i className="fa-solid fa-layer-group" />
      </span>
      <label className="location-map-export-select-row__copy">
        <strong>Map Level</strong>
        <small>Export every floor together or isolate one level.</small>
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
    </div>
  );
}

function LayerToggle({ checked, icon, label, onChange }) {
  return (
    <ToolOption
      active={Boolean(checked)}
      icon={icon}
      label={label}
      stateIcon={checked ? "fa-check" : "fa-minus"}
      role="checkbox"
      aria-checked={Boolean(checked)}
      onClick={() => onChange(!checked)}
    />
  );
}

export function LocationMapExportStudio({
  generatedMap,
  onChange,
  onPreset,
  settings,
}) {
  const levels = getAvailableLocationMapExportLevels(generatedMap);
  const format = settings?.format || "svg";
  const presetOptions = LOCATION_MAP_EXPORT_PRESETS.map((preset) => ({
    ...preset,
    icon: PRESET_ICONS[preset.id] || "fa-map",
  }));
  const formatOptions = LOCATION_MAP_EXPORT_FORMATS.map((option) => ({
    ...option,
    icon: FORMAT_ICONS[option.id] || "fa-file",
    description: FORMAT_DESCRIPTIONS[option.id],
  }));
  const cropOptions = LOCATION_MAP_EXPORT_CROPS.map((option) => ({
    ...option,
    icon: CROP_ICONS[option.id] || "fa-crop-simple",
    description: CROP_DESCRIPTIONS[option.id],
  }));
  const scaleOptions = LOCATION_MAP_EXPORT_PNG_SCALES.map((option) => ({
    ...option,
    icon: option.id === 4 ? "fa-maximize" : option.id === 2 ? "fa-print" : "fa-display",
    description: SCALE_DESCRIPTIONS[option.id],
  }));
  const paddingOptions = LOCATION_MAP_EXPORT_PADDING.map((option) => ({
    ...option,
    icon: option.id === 0 ? "fa-compress" : option.id >= 96 ? "fa-expand" : "fa-border-none",
    description: PADDING_DESCRIPTIONS[option.id],
  }));

  return (
    <ToolContentPanel
      className="location-map-export-studio location-map-export-studio__content"
      data-testid="dark-places-map-export-studio"
      eyebrow="Map Export"
      title="Export Settings"
      summary="Choose the file, framing, visible layers, and visual treatment. The current export is summarized in the right rail."
    >
        <ToolFeatureBlock label="Export Profile" aria-label="Map export profile">
          <OptionGroup
            ariaLabel="Map export profile"
            options={presetOptions}
            value={settings?.preset}
            onChange={(value) => onPreset?.(value)}
          />
        </ToolFeatureBlock>

        <ToolFeatureBlock label="File Format" aria-label="Map export file settings">
          <OptionGroup
            ariaLabel="File format"
            options={formatOptions}
            value={format}
            onChange={(value) => onChange?.({ format: value })}
          />
          {format === "png" ? (
            <div className="location-map-export-subgroup">
              <span>Resolution</span>
              <OptionGroup
                ariaLabel="PNG resolution"
                options={scaleOptions}
                value={settings?.pngScale || 2}
                onChange={(value) => onChange?.({ pngScale: Number(value) })}
              />
            </div>
          ) : null}
        </ToolFeatureBlock>

        <ToolFeatureBlock label="Framing" aria-label="Map export framing">
          <OptionGroup
            ariaLabel="Crop area"
            options={cropOptions}
            value={settings?.crop || "content"}
            onChange={(value) => onChange?.({ crop: value })}
          />
          {settings?.crop !== "canvas" ? (
            <div className="location-map-export-subgroup">
              <span>Padding</span>
              <OptionGroup
                ariaLabel="Crop padding"
                options={paddingOptions}
                value={settings?.padding ?? 48}
                onChange={(value) => onChange?.({ padding: Number(value) })}
              />
            </div>
          ) : null}
          <LevelSelect
            levels={levels}
            value={settings?.levelView}
            onChange={(value) => onChange?.({ levelView: value })}
          />
        </ToolFeatureBlock>

        <ToolFeatureBlock label="Map Layers" aria-label="Map export layers">
          <ToolOptionList role="group" aria-label="Map layers">
            {LAYER_OPTIONS.map((option) => (
              <LayerToggle
                key={option.key}
                checked={settings?.[option.key]}
                icon={option.icon}
                label={option.label}
                onChange={(value) => onChange?.({ [option.key]: value })}
              />
            ))}
          </ToolOptionList>
        </ToolFeatureBlock>

        <ToolFeatureBlock label="Background" aria-label="Map export background">
          <OptionGroup
            ariaLabel="Map background"
            options={BACKGROUND_OPTIONS}
            value={settings?.background || "style"}
            onChange={(value) => onChange?.({ background: value })}
          />
        </ToolFeatureBlock>

    </ToolContentPanel>
  );
}
