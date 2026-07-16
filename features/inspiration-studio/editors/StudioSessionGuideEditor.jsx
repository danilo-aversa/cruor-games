import {
  StudioArrayEditor,
  StudioEditorSection,
  StudioListField,
  StudioStructuredField,
} from "./StudioStructuredFields.jsx";

export function StudioSessionGuideEditor({ componentId, onChange, semantic }) {
  const openingBeat = semantic.openingBeat || {};
  const clueFlow = semantic.clueFlow || {};
  const links = clueFlow.links || [];
  const stallMoves = semantic.stallMoves || [];
  const pacing = semantic.pacing || {};

  return (
    <>
      <StudioEditorSection
        icon="fa-door-open"
        title="Opening Beat"
        description="Give the GM a situation, an immediate signal and a decision for the players."
      >
        <StudioStructuredField
          componentId={componentId}
          label="Situation"
          path="semantic.openingBeat.situation"
          multiline
          rows={4}
          value={openingBeat.situation || ""}
          onChange={(value) => onChange(["openingBeat", "situation"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Immediate Signal"
          path="semantic.openingBeat.immediateSignal"
          multiline
          value={openingBeat.immediateSignal || ""}
          onChange={(value) =>
            onChange(["openingBeat", "immediateSignal"], value)
          }
        />
        <StudioStructuredField
          componentId={componentId}
          label="Player Decision"
          path="semantic.openingBeat.playerDecision"
          multiline
          value={openingBeat.playerDecision || ""}
          onChange={(value) =>
            onChange(["openingBeat", "playerDecision"], value)
          }
        />
      </StudioEditorSection>

      <StudioEditorSection icon="fa-bullseye" title="Objectives & Rules">
        <StudioListField
          componentId={componentId}
          label="Objectives"
          path="semantic.objectives"
          value={semantic.objectives}
          onChange={(value) => onChange(["objectives"], value)}
        />
        <StudioListField
          componentId={componentId}
          label="Always-On Rule IDs"
          path="semantic.alwaysOnRuleIds"
          value={semantic.alwaysOnRuleIds}
          onChange={(value) => onChange(["alwaysOnRuleIds"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Pressure Track ID"
          path="semantic.pressureTrackId"
          value={semantic.pressureTrackId || ""}
          onChange={(value) => onChange(["pressureTrackId"], value)}
        />
      </StudioEditorSection>

      <StudioEditorSection
        icon="fa-diagram-project"
        title="Clue Flow"
        description="Connect revelations and provide fallback clues so the investigation cannot stall."
      >
        <StudioListField
          componentId={componentId}
          label="Required Revelation IDs"
          path="semantic.clueFlow.requiredRevelations"
          value={clueFlow.requiredRevelations}
          onChange={(value) =>
            onChange(["clueFlow", "requiredRevelations"], value)
          }
        />
        <StudioArrayEditor
          componentId={componentId}
          path="semantic.clueFlow.links"
          items={links}
          addLabel="Add Clue Link"
          onAdd={() =>
            onChange(
              ["clueFlow", "links"],
              [...links, { from: "", to: "", condition: "" }],
            )
          }
          onRemove={(index) =>
            onChange(
              ["clueFlow", "links"],
              links.filter((_, itemIndex) => itemIndex !== index),
            )
          }
        >
          {(link, index) => (
            <>
              <StudioStructuredField
                componentId={componentId}
                label="From Revelation"
                path={`semantic.clueFlow.links[${index}].from`}
                value={link.from || ""}
                onChange={(value) =>
                  onChange(["clueFlow", "links", index, "from"], value)
                }
              />
              <StudioStructuredField
                componentId={componentId}
                label="To Revelation"
                path={`semantic.clueFlow.links[${index}].to`}
                value={link.to || ""}
                onChange={(value) =>
                  onChange(["clueFlow", "links", index, "to"], value)
                }
              />
              <StudioStructuredField
                componentId={componentId}
                label="Condition"
                path={`semantic.clueFlow.links[${index}].condition`}
                multiline
                value={link.condition || ""}
                onChange={(value) =>
                  onChange(["clueFlow", "links", index, "condition"], value)
                }
              />
            </>
          )}
        </StudioArrayEditor>
        <StudioListField
          componentId={componentId}
          label="Fallback Clues"
          path="semantic.clueFlow.fallbackClues"
          value={clueFlow.fallbackClues}
          onChange={(value) => onChange(["clueFlow", "fallbackClues"], value)}
        />
      </StudioEditorSection>

      <StudioEditorSection icon="fa-forward-step" title="Stall Moves">
        <StudioArrayEditor
          componentId={componentId}
          path="semantic.stallMoves"
          items={stallMoves}
          addLabel="Add Stall Move"
          onAdd={() =>
            onChange(
              ["stallMoves"],
              [
                ...stallMoves,
                {
                  id: `stall-move-${stallMoves.length + 1}`,
                  trigger: "",
                  action: "",
                },
              ],
            )
          }
          onRemove={(index) =>
            onChange(
              ["stallMoves"],
              stallMoves.filter((_, itemIndex) => itemIndex !== index),
            )
          }
        >
          {(move, index) => (
            <>
              <StudioStructuredField
                componentId={componentId}
                label="Move ID"
                path={`semantic.stallMoves[${index}].id`}
                value={move.id || ""}
                onChange={(value) =>
                  onChange(["stallMoves", index, "id"], value)
                }
              />
              <StudioStructuredField
                componentId={componentId}
                label="Trigger"
                path={`semantic.stallMoves[${index}].trigger`}
                multiline
                value={move.trigger || ""}
                onChange={(value) =>
                  onChange(["stallMoves", index, "trigger"], value)
                }
              />
              <StudioStructuredField
                componentId={componentId}
                label="GM Action"
                path={`semantic.stallMoves[${index}].action`}
                multiline
                value={move.action || ""}
                onChange={(value) =>
                  onChange(["stallMoves", index, "action"], value)
                }
              />
            </>
          )}
        </StudioArrayEditor>
      </StudioEditorSection>

      <StudioEditorSection icon="fa-route" title="Pacing">
        <StudioListField
          componentId={componentId}
          label="Default Route Room IDs"
          path="semantic.pacing.defaultRoute"
          value={pacing.defaultRoute}
          onChange={(value) => onChange(["pacing", "defaultRoute"], value)}
        />
        <StudioListField
          componentId={componentId}
          label="Escalation Room IDs"
          path="semantic.pacing.escalationRooms"
          value={pacing.escalationRooms}
          onChange={(value) => onChange(["pacing", "escalationRooms"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Climax Guidance"
          path="semantic.pacing.climaxGuidance"
          multiline
          rows={4}
          value={pacing.climaxGuidance || ""}
          onChange={(value) => onChange(["pacing", "climaxGuidance"], value)}
        />
      </StudioEditorSection>
    </>
  );
}
