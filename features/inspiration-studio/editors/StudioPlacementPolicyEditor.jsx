import {
  StudioEditorSection,
  StudioListField,
  StudioStructuredField,
} from "./StudioStructuredFields.jsx";

export function StudioPlacementPolicyEditor({
  componentId,
  onChange,
  placement = {},
}) {
  return (
    <StudioEditorSection
      icon="fa-location-crosshairs"
      title="Placement Policy"
      description="Controls how often the sign can appear and which rooms can receive it."
    >
      <StudioStructuredField
        componentId={componentId}
        label="Frequency"
        path="semantic.placement.frequency"
        value={placement.frequency || "recurring"}
        options={[
          ["recurring", "Recurring"],
          ["pervasive", "Pervasive"],
          ["rare", "Rare"],
          ["once", "Once"],
        ]}
        onChange={(value) => onChange(["placement", "frequency"], value)}
      />
      <StudioStructuredField
        componentId={componentId}
        label="Minimum Rooms"
        path="semantic.placement.minimumRooms"
        type="number"
        min={0}
        max={99}
        value={placement.minimumRooms ?? 1}
        onChange={(value) => onChange(["placement", "minimumRooms"], value)}
      />
      <StudioStructuredField
        componentId={componentId}
        label="Maximum Rooms"
        path="semantic.placement.maximumRooms"
        type="number"
        min={0}
        max={99}
        value={placement.maximumRooms ?? 1}
        onChange={(value) => onChange(["placement", "maximumRooms"], value)}
      />
      <StudioListField
        componentId={componentId}
        label="Allowed Room Roles"
        description="One role per line. Empty means any role not explicitly forbidden."
        path="semantic.placement.allowedRoomRoles"
        value={placement.allowedRoomRoles}
        onChange={(value) => onChange(["placement", "allowedRoomRoles"], value)}
      />
      <StudioListField
        componentId={componentId}
        label="Forbidden Room Roles"
        path="semantic.placement.forbiddenRoomRoles"
        value={placement.forbiddenRoomRoles}
        onChange={(value) =>
          onChange(["placement", "forbiddenRoomRoles"], value)
        }
      />
      <StudioListField
        componentId={componentId}
        label="Preferred Features"
        path="semantic.placement.preferredFeatures"
        value={placement.preferredFeatures}
        onChange={(value) =>
          onChange(["placement", "preferredFeatures"], value)
        }
      />
    </StudioEditorSection>
  );
}
