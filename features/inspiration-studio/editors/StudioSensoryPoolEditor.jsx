import {
  SENSORY_CHANNELS,
  SENSORY_GEOMETRY_BIASES,
  SENSORY_INTENSITY_TIERS,
  SENSORY_ROOM_ROLES,
} from "../../../shared/content/contracts/semantic/index.js";
import {
  StudioEditorSection,
  StudioListField,
  StudioStructuredField,
} from "../ui/index.js";

function formatLabel(value = "") {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function StudioSensoryPoolEditor({ componentId, onChange, semantic }) {
  return (
    <>
      <StudioEditorSection
        icon="fa-ear-listen"
        title="Sensory Signature & Pool"
        description="Author reusable sensory material. Use one distinct line per row."
      >
        <StudioStructuredField
          componentId={componentId}
          label="Signature"
          path="semantic.signature"
          multiline
          value={semantic.signature || ""}
          onChange={(value) => onChange(["signature"], value)}
        />
        {SENSORY_CHANNELS.map((channel) => (
          <StudioListField
            key={channel}
            componentId={componentId}
            label={`${formatLabel(channel)} Variants`}
            path={`semantic.variants.${channel}`}
            value={semantic.variants?.[channel]}
            onChange={(value) => onChange(["variants", channel], value)}
          />
        ))}
        <StudioListField
          componentId={componentId}
          label="Prohibited Clichés / Exclusions"
          path="semantic.exclusions"
          value={semantic.exclusions}
          onChange={(value) => onChange(["exclusions"], value)}
        />
      </StudioEditorSection>

      <StudioEditorSection
        icon="fa-gauge-high"
        title="Pressure Variants"
        description="Assign sensory lines to low, medium and high pressure."
      >
        {SENSORY_INTENSITY_TIERS.map((tier) => (
          <StudioListField
            key={tier}
            componentId={componentId}
            label={formatLabel(tier)}
            path={`semantic.intensityTiers.${tier}`}
            value={semantic.intensityTiers?.[tier]}
            onChange={(value) => onChange(["intensityTiers", tier], value)}
          />
        ))}
      </StudioEditorSection>

      <StudioEditorSection icon="fa-door-open" title="Room Role Bias">
        {SENSORY_ROOM_ROLES.map((role) => (
          <StudioListField
            key={role}
            componentId={componentId}
            label={formatLabel(role)}
            path={`semantic.roomRoleBias.${role}`}
            value={semantic.roomRoleBias?.[role]}
            onChange={(value) => onChange(["roomRoleBias", role], value)}
          />
        ))}
      </StudioEditorSection>

      <StudioEditorSection icon="fa-shapes" title="Geometry Bias">
        {SENSORY_GEOMETRY_BIASES.map((geometry) => (
          <StudioListField
            key={geometry}
            componentId={componentId}
            label={formatLabel(geometry)}
            path={`semantic.geometryBias.${geometry}`}
            value={semantic.geometryBias?.[geometry]}
            onChange={(value) => onChange(["geometryBias", geometry], value)}
          />
        ))}
      </StudioEditorSection>

      <StudioEditorSection icon="fa-repeat" title="Repetition Policy">
        <StudioStructuredField
          componentId={componentId}
          label="Exact Text Cooldown"
          path="semantic.repetitionPolicy.exactTextCooldown"
          value={semantic.repetitionPolicy?.exactTextCooldown || "all-rooms"}
          onChange={(value) =>
            onChange(["repetitionPolicy", "exactTextCooldown"], value)
          }
        />
        <StudioStructuredField
          componentId={componentId}
          label="Sense Cooldown"
          path="semantic.repetitionPolicy.senseCooldown"
          type="number"
          min={0}
          max={99}
          value={semantic.repetitionPolicy?.senseCooldown ?? 1}
          onChange={(value) =>
            onChange(["repetitionPolicy", "senseCooldown"], value)
          }
        />
        <StudioStructuredField
          componentId={componentId}
          label="Allow Signature Repeat"
          path="semantic.repetitionPolicy.allowSignatureRepeat"
          type="checkbox"
          checked={semantic.repetitionPolicy?.allowSignatureRepeat === true}
          onChange={(value) =>
            onChange(["repetitionPolicy", "allowSignatureRepeat"], value)
          }
        />
      </StudioEditorSection>
    </>
  );
}
