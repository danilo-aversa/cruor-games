import { getStudioSemanticEditorDefinition } from "../schema/studio-semantic-editor-registry.js";
import { StudioFragmentPoolEditor } from "./StudioFragmentPoolEditor.jsx";
import { StudioPlacementPolicyEditor } from "./StudioPlacementPolicyEditor.jsx";
import { StudioSensoryPoolEditor } from "./StudioSensoryPoolEditor.jsx";
import { StudioSessionGuideEditor } from "./StudioSessionGuideEditor.jsx";
import {
  StudioArrayEditor,
  StudioArmedDeleteButton,
  StudioButton,
  StudioDangerZone,
  StudioEditorHeader,
  StudioEditorSection,
  StudioListField,
  StudioPreviewSection,
  StudioStructuredField,
} from "../ui/index.js";
import { StudioStructuredRuleEditor } from "./StudioStructuredRuleEditor.jsx";

const STATUS_OPTIONS = [
  ["draft", "Draft"],
  ["in-review", "In Review"],
  ["published", "Published"],
  ["retired", "Retired"],
];

function setNestedValue(target, path, value) {
  let current = target;
  path.slice(0, -1).forEach((key, index) => {
    const nextKey = path[index + 1];
    if (current[key] === null || current[key] === undefined) {
      current[key] = typeof nextKey === "number" ? [] : {};
    }
    current = current[key];
  });
  current[path[path.length - 1]] = value;
}

function PlaceIdentityEditor({ componentId, onChange, semantic }) {
  return (
    <>
      <StudioEditorSection
        icon="fa-landmark"
        title="Historical Identity"
        description="Separate the original place, the historical change and the forbidden truth."
      >
        <StudioStructuredField
          componentId={componentId}
          label="Original Purpose"
          path="semantic.originalPurpose"
          multiline
          value={semantic.originalPurpose || ""}
          onChange={(value) => onChange(["originalPurpose"], value)}
        />
        <StudioListField
          componentId={componentId}
          label="Original Users"
          path="semantic.originalUsers"
          value={semantic.originalUsers}
          onChange={(value) => onChange(["originalUsers"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Historical Change"
          path="semantic.historicalChange"
          multiline
          rows={4}
          value={semantic.historicalChange || ""}
          onChange={(value) => onChange(["historicalChange"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Horror Truth"
          path="semantic.horrorTruth"
          multiline
          rows={4}
          value={semantic.horrorTruth || ""}
          onChange={(value) => onChange(["horrorTruth"], value)}
        />
      </StudioEditorSection>
      <StudioEditorSection
        icon="fa-people-arrows"
        title="Current Situation"
        description="Defines what the place does now and why the characters must act."
      >
        <StudioStructuredField
          componentId={componentId}
          label="Current Function"
          path="semantic.currentFunction"
          multiline
          value={semantic.currentFunction || ""}
          onChange={(value) => onChange(["currentFunction"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Current Conflict"
          path="semantic.currentConflict"
          multiline
          value={semantic.currentConflict || ""}
          onChange={(value) => onChange(["currentConflict"], value)}
        />
        <StudioListField
          componentId={componentId}
          label="Player Entry Points"
          path="semantic.playerEntryPoints"
          value={semantic.playerEntryPoints}
          onChange={(value) => onChange(["playerEntryPoints"], value)}
        />
        <StudioListField
          componentId={componentId}
          label="Stakes"
          path="semantic.stakes"
          value={semantic.stakes}
          onChange={(value) => onChange(["stakes"], value)}
        />
        <StudioListField
          componentId={componentId}
          label="Tone Keywords"
          path="semantic.toneKeywords"
          value={semantic.toneKeywords}
          onChange={(value) => onChange(["toneKeywords"], value)}
        />
      </StudioEditorSection>
    </>
  );
}

function SiteAtmosphereEditor({ componentId, onChange, semantic }) {
  const manifestations = semantic.manifestations || [];
  return (
    <>
      <StudioEditorSection
        icon="fa-cloud-moon"
        title="Atmosphere"
        description="Keep the signature concise and express it through bounded manifestations."
      >
        <StudioStructuredField
          componentId={componentId}
          label="Signature"
          path="semantic.signature"
          multiline
          rows={4}
          value={semantic.signature || ""}
          onChange={(value) => onChange(["signature"], value)}
        />
        <StudioArrayEditor
          componentId={componentId}
          path="semantic.manifestations"
          items={manifestations}
          addLabel="Add Manifestation"
          onAdd={() =>
            onChange(
              ["manifestations"],
              [
                ...manifestations,
                {
                  id: `manifestation-${manifestations.length + 1}`,
                  text: "",
                  senses: [],
                  intensity: "low",
                  frequency: "recurring",
                },
              ],
            )
          }
          onRemove={(index) =>
            onChange(
              ["manifestations"],
              manifestations.filter((_, itemIndex) => itemIndex !== index),
            )
          }
        >
          {(manifestation, index) => (
            <>
              <StudioStructuredField
                componentId={componentId}
                label="ID"
                path={`semantic.manifestations[${index}].id`}
                value={manifestation.id || ""}
                onChange={(value) =>
                  onChange(["manifestations", index, "id"], value)
                }
              />
              <StudioStructuredField
                componentId={componentId}
                label="Manifestation"
                path={`semantic.manifestations[${index}].text`}
                multiline
                value={manifestation.text || ""}
                onChange={(value) =>
                  onChange(["manifestations", index, "text"], value)
                }
              />
              <StudioListField
                componentId={componentId}
                label="Senses"
                path={`semantic.manifestations[${index}].senses`}
                value={manifestation.senses}
                onChange={(value) =>
                  onChange(["manifestations", index, "senses"], value)
                }
              />
              <StudioStructuredField
                componentId={componentId}
                label="Intensity"
                path={`semantic.manifestations[${index}].intensity`}
                value={manifestation.intensity || "low"}
                options={[
                  ["low", "Low"],
                  ["medium", "Medium"],
                  ["high", "High"],
                ]}
                onChange={(value) =>
                  onChange(["manifestations", index, "intensity"], value)
                }
              />
              <StudioStructuredField
                componentId={componentId}
                label="Frequency"
                path={`semantic.manifestations[${index}].frequency`}
                value={manifestation.frequency || "recurring"}
                options={[
                  ["pervasive", "Pervasive"],
                  ["recurring", "Recurring"],
                  ["rare", "Rare"],
                ]}
                onChange={(value) =>
                  onChange(["manifestations", index, "frequency"], value)
                }
              />
            </>
          )}
        </StudioArrayEditor>
        <StudioListField
          componentId={componentId}
          label="Exclusions"
          path="semantic.exclusions"
          value={semantic.exclusions}
          onChange={(value) => onChange(["exclusions"], value)}
        />
        <StudioListField
          componentId={componentId}
          label="Escalation Rule IDs"
          path="semantic.escalationLinks"
          value={semantic.escalationLinks}
          onChange={(value) => onChange(["escalationLinks"], value)}
        />
      </StudioEditorSection>
    </>
  );
}

function RecurringSignEditor({ componentId, onChange, semantic }) {
  return (
    <>
      <StudioEditorSection icon="fa-repeat" title="Recurring Sign">
        <StudioStructuredField
          componentId={componentId}
          label="Sign ID"
          path="semantic.id"
          value={semantic.id || ""}
          onChange={(value) => onChange(["id"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Description"
          path="semantic.description"
          multiline
          rows={4}
          value={semantic.description || ""}
          onChange={(value) => onChange(["description"], value)}
        />
        <StudioListField
          componentId={componentId}
          label="Variations"
          description="At least three editorially distinct variations are recommended."
          path="semantic.variations"
          value={semantic.variations}
          onChange={(value) => onChange(["variations"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Revelation Link"
          path="semantic.revelationLink"
          value={semantic.revelationLink || ""}
          onChange={(value) => onChange(["revelationLink"], value)}
        />
      </StudioEditorSection>
      <StudioPlacementPolicyEditor
        componentId={componentId}
        placement={semantic.placement}
        onChange={onChange}
      />
      <StudioEditorSection icon="fa-hand" title="Optional Interaction">
        {semantic.interaction ? (
          <>
            <StudioStructuredField
              componentId={componentId}
              label="Trigger"
              path="semantic.interaction.trigger"
              multiline
              value={semantic.interaction.trigger || ""}
              onChange={(value) => onChange(["interaction", "trigger"], value)}
            />
            <StudioStructuredField
              componentId={componentId}
              label="Effect"
              path="semantic.interaction.effect"
              multiline
              value={semantic.interaction.effect || ""}
              onChange={(value) => onChange(["interaction", "effect"], value)}
            />
            <StudioStructuredField
              componentId={componentId}
              label="Counterplay"
              path="semantic.interaction.counterplay"
              multiline
              value={semantic.interaction.counterplay || ""}
              onChange={(value) =>
                onChange(["interaction", "counterplay"], value)
              }
            />
            <StudioButton
              danger
              icon="fa-trash"
              onClick={() => onChange(["interaction"], null)}
            >
              Remove Interaction
            </StudioButton>
          </>
        ) : (
          <StudioButton
            icon="fa-plus"
            onClick={() =>
              onChange(["interaction"], {
                trigger: "",
                effect: "",
                counterplay: "",
              })
            }
          >
            Add Interaction
          </StudioButton>
        )}
      </StudioEditorSection>
    </>
  );
}

function SpecializedPayloadEditor({ component, onSemanticChange }) {
  const props = {
    componentId: component.id,
    semantic: component.semantic || {},
    onChange: onSemanticChange,
  };
  switch (component.semanticType) {
    case "place-identity":
      return <PlaceIdentityEditor {...props} />;
    case "site-atmosphere":
      return <SiteAtmosphereEditor {...props} />;
    case "global-rule":
      return <StudioStructuredRuleEditor {...props} />;
    case "recurring-sign":
      return <RecurringSignEditor {...props} />;
    case "sensory-profile":
      return <StudioSensoryPoolEditor {...props} />;
    case "read-aloud-profile":
      return <StudioFragmentPoolEditor {...props} />;
    case "session-guide":
      return <StudioSessionGuideEditor {...props} />;
    default:
      return null;
  }
}

export function StudioSemanticComponentEditor({
  component,
  onChange,
  onRemove,
}) {
  const definition = getStudioSemanticEditorDefinition(component.semanticType);
  if (!definition) return null;
  const coverage = definition.evaluateCoverage(component.semantic);
  const preview = definition.previewRenderer(component.semantic);

  function setComponentField(path, value) {
    onChange((nextComponent) => setNestedValue(nextComponent, path, value));
  }

  function setSemanticField(path, value) {
    onChange((nextComponent) => {
      nextComponent.semantic ||= {};
      setNestedValue(nextComponent.semantic, path, value);
    });
  }

  const coverageDescription = coverage.complete
    ? "Required authoring coverage is complete."
    : `${coverage.missingPaths.length} required fields and ${Math.max(0, coverage.targetCount - coverage.itemCount)} target entries remain.`;

  return (
    <div
      className="studio-component-editor studio-editor-stack"
      data-semantic-type={component.semanticType}
    >
      <StudioEditorHeader
        compact
        coverageLabel={coverage.complete ? "Covered" : "Needs Work"}
        coverageStatus={coverage.complete ? "covered" : "partial"}
        description={coverageDescription}
        icon={definition.icon}
        status={component.status || "draft"}
        title={component.title || definition.label}
        typeLabel={`${definition.navigationGroup} · ${definition.label}`}
      />

      <StudioEditorSection icon="fa-fingerprint" title="Component Identity">
        <StudioStructuredField
          componentId={component.id}
          label="Component Title"
          path="title"
          value={component.title || ""}
          onChange={(value) => setComponentField(["title"], value)}
        />
        <StudioStructuredField
          componentId={component.id}
          label="Component ID"
          path="id"
          value={component.id || ""}
          onChange={(value) => setComponentField(["id"], value)}
        />
        <StudioStructuredField
          componentId={component.id}
          label="Status"
          path="status"
          value={component.status || "draft"}
          options={STATUS_OPTIONS}
          onChange={(value) => setComponentField(["status"], value)}
        />
        <StudioListField
          componentId={component.id}
          label="Workflows"
          path="workflows"
          value={component.workflows}
          onChange={(value) => setComponentField(["workflows"], value)}
        />
        <StudioListField
          componentId={component.id}
          label="Generator Slots"
          path="slots"
          value={component.slots}
          onChange={(value) => setComponentField(["slots"], value)}
        />
        <StudioListField
          componentId={component.id}
          label="Source Anchors"
          path="sourceAnchors"
          value={component.sourceAnchors}
          onChange={(value) => setComponentField(["sourceAnchors"], value)}
        />
      </StudioEditorSection>

      <SpecializedPayloadEditor
        component={component}
        onSemanticChange={setSemanticField}
      />

      <StudioPreviewSection title="Deterministic Component Sample">
        <div
          className="studio-component-sample"
          aria-label={`${definition.label} sample`}
        >
          <strong>
            {preview.headline ||
              "Complete the structured fields to generate a sample."}
          </strong>
          {preview.detail ? <p>{preview.detail}</p> : null}
          <em>{preview.metrics.join(" / ")} authored coverage signals</em>
        </div>
      </StudioPreviewSection>

      <StudioDangerZone>
        <StudioArmedDeleteButton onConfirm={onRemove} />
      </StudioDangerZone>
    </div>
  );
}
