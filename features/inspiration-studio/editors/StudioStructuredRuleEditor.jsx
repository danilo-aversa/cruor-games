import {
  StudioArrayEditor,
  StudioButton,
  StudioEditorSection,
  StudioFieldset,
  StudioListField,
  StudioStructuredField,
} from "../ui/index.js";

function CheckEditor({ componentId, kind, label, onChange, value }) {
  const basePath = `semantic.resolution.${kind}`;
  if (!value) {
    return (
      <StudioButton
        icon="fa-plus"
        onClick={() =>
          onChange(["resolution", kind], {
            ability: "",
            skills: [],
            dc: null,
            scalingKey: "",
          })
        }
      >
        Add {label}
      </StudioButton>
    );
  }

  return (
    <StudioFieldset legend={label}>
      <StudioStructuredField
        componentId={componentId}
        label="Ability"
        path={`${basePath}.ability`}
        value={value.ability || ""}
        onChange={(next) => onChange(["resolution", kind, "ability"], next)}
      />
      <StudioListField
        componentId={componentId}
        label="Skills"
        path={`${basePath}.skills`}
        value={value.skills}
        onChange={(next) => onChange(["resolution", kind, "skills"], next)}
      />
      <StudioStructuredField
        componentId={componentId}
        label="Fixed DC"
        path={`${basePath}.dc`}
        type="number"
        min={0}
        max={99}
        value={value.dc ?? ""}
        onChange={(next) =>
          onChange(["resolution", kind, "dc"], next === "" ? null : next)
        }
      />
      <StudioStructuredField
        componentId={componentId}
        label="Scaling Key"
        description="Use a shared scaling key when the DC is not fixed."
        path={`${basePath}.scalingKey`}
        value={value.scalingKey || ""}
        onChange={(next) => onChange(["resolution", kind, "scalingKey"], next)}
      />
      <StudioButton
        danger
        icon="fa-trash"
        onClick={() => onChange(["resolution", kind], null)}
      >
        Remove {label}
      </StudioButton>
    </StudioFieldset>
  );
}

function AttackEditor({ componentId, onChange, value }) {
  const basePath = "semantic.resolution.attackRoll";
  if (!value) {
    return (
      <StudioButton
        icon="fa-plus"
        onClick={() =>
          onChange(["resolution", "attackRoll"], {
            bonus: null,
            scalingKey: "",
            target: "",
          })
        }
      >
        Add Attack Roll
      </StudioButton>
    );
  }
  return (
    <StudioFieldset legend="Attack Roll">
      <StudioStructuredField
        componentId={componentId}
        label="Fixed Bonus"
        path={`${basePath}.bonus`}
        type="number"
        min={-20}
        max={30}
        value={value.bonus ?? ""}
        onChange={(next) =>
          onChange(
            ["resolution", "attackRoll", "bonus"],
            next === "" ? null : next,
          )
        }
      />
      <StudioStructuredField
        componentId={componentId}
        label="Scaling Key"
        path={`${basePath}.scalingKey`}
        value={value.scalingKey || ""}
        onChange={(next) =>
          onChange(["resolution", "attackRoll", "scalingKey"], next)
        }
      />
      <StudioStructuredField
        componentId={componentId}
        label="Target"
        path={`${basePath}.target`}
        value={value.target || ""}
        onChange={(next) =>
          onChange(["resolution", "attackRoll", "target"], next)
        }
      />
      <StudioButton
        danger
        icon="fa-trash"
        onClick={() => onChange(["resolution", "attackRoll"], null)}
      >
        Remove Attack Roll
      </StudioButton>
    </StudioFieldset>
  );
}

export function StudioStructuredRuleEditor({
  componentId,
  onChange,
  semantic,
}) {
  const trigger = semantic.trigger || {};
  const state = semantic.state || {};
  const resolution = semantic.resolution || {};
  const effect = resolution.effect || {};

  return (
    <>
      <StudioEditorSection
        icon="fa-bolt"
        title="Trigger & State"
        description="Defines exactly when the site-wide rule advances and how its state is bounded."
      >
        <StudioStructuredField
          componentId={componentId}
          label="Rule ID"
          path="semantic.id"
          value={semantic.id || ""}
          onChange={(value) => onChange(["id"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Rule Title"
          path="semantic.title"
          value={semantic.title || ""}
          onChange={(value) => onChange(["title"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Scope"
          path="semantic.scope"
          value={semantic.scope || "location"}
          onChange={(value) => onChange(["scope"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Category"
          path="semantic.category"
          value={semantic.category || ""}
          onChange={(value) => onChange(["category"], value)}
        />
        <StudioListField
          componentId={componentId}
          label="Trigger Events"
          path="semantic.trigger.events"
          value={trigger.events}
          onChange={(value) => onChange(["trigger", "events"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Trigger Timing"
          path="semantic.trigger.timing"
          value={trigger.timing || ""}
          onChange={(value) => onChange(["trigger", "timing"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Frequency Limit"
          path="semantic.trigger.frequencyLimit"
          value={trigger.frequencyLimit || ""}
          onChange={(value) => onChange(["trigger", "frequencyLimit"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="State Label"
          path="semantic.state.label"
          value={state.label || ""}
          onChange={(value) => onChange(["state", "label"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Minimum"
          path="semantic.state.minimum"
          type="number"
          min={0}
          max={99}
          value={state.minimum ?? 0}
          onChange={(value) => onChange(["state", "minimum"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Maximum"
          path="semantic.state.maximum"
          type="number"
          min={0}
          max={99}
          value={state.maximum ?? 0}
          onChange={(value) => onChange(["state", "maximum"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Initial"
          path="semantic.state.initial"
          type="number"
          min={0}
          max={99}
          value={state.initial ?? 0}
          onChange={(value) => onChange(["state", "initial"], value)}
        />
      </StudioEditorSection>

      <StudioEditorSection
        icon="fa-dice-d20"
        title="Resolution & Effect"
        description="Author a complete save, check, attack, consequence, duration and action cost without raw JSON."
      >
        <StudioStructuredField
          componentId={componentId}
          label="Resolution Timing"
          path="semantic.resolution.timing"
          value={resolution.timing || ""}
          onChange={(value) => onChange(["resolution", "timing"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Threshold"
          path="semantic.resolution.threshold"
          type="number"
          min={0}
          max={99}
          value={resolution.threshold ?? ""}
          onChange={(value) =>
            onChange(["resolution", "threshold"], value === "" ? null : value)
          }
        />
        <CheckEditor
          componentId={componentId}
          kind="savingThrow"
          label="Saving Throw"
          value={resolution.savingThrow}
          onChange={onChange}
        />
        <CheckEditor
          componentId={componentId}
          kind="check"
          label="Ability Check"
          value={resolution.check}
          onChange={onChange}
        />
        <AttackEditor
          componentId={componentId}
          value={resolution.attackRoll}
          onChange={onChange}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Damage"
          path="semantic.resolution.effect.damage"
          value={effect.damage || ""}
          onChange={(value) =>
            onChange(["resolution", "effect", "damage"], value)
          }
        />
        <StudioStructuredField
          componentId={componentId}
          label="Damage Type"
          path="semantic.resolution.effect.damageType"
          value={effect.damageType || ""}
          onChange={(value) =>
            onChange(["resolution", "effect", "damageType"], value)
          }
        />
        <StudioStructuredField
          componentId={componentId}
          label="Healing"
          path="semantic.resolution.effect.healing"
          value={effect.healing || ""}
          onChange={(value) =>
            onChange(["resolution", "effect", "healing"], value)
          }
        />
        <StudioListField
          componentId={componentId}
          label="Conditions"
          path="semantic.resolution.effect.conditions"
          value={effect.conditions}
          onChange={(value) =>
            onChange(["resolution", "effect", "conditions"], value)
          }
        />
        <StudioStructuredField
          componentId={componentId}
          label="Additional Effect"
          path="semantic.resolution.effect.additionalText"
          multiline
          rows={4}
          value={effect.additionalText || ""}
          onChange={(value) =>
            onChange(["resolution", "effect", "additionalText"], value)
          }
        />
        <StudioStructuredField
          componentId={componentId}
          label="Duration"
          path="semantic.resolution.duration"
          value={resolution.duration || ""}
          onChange={(value) => onChange(["resolution", "duration"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Range"
          path="semantic.resolution.range"
          value={resolution.range || ""}
          onChange={(value) => onChange(["resolution", "range"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Area"
          path="semantic.resolution.area"
          value={resolution.area || ""}
          onChange={(value) => onChange(["resolution", "area"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Frequency"
          path="semantic.resolution.frequency"
          value={resolution.frequency || ""}
          onChange={(value) => onChange(["resolution", "frequency"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Action Economy"
          path="semantic.resolution.actionEconomy"
          value={resolution.actionEconomy || ""}
          onChange={(value) => onChange(["resolution", "actionEconomy"], value)}
        />
      </StudioEditorSection>

      <StudioEditorSection
        icon="fa-shield-halved"
        title="Counterplay & Escalation"
      >
        <StudioArrayEditor
          componentId={componentId}
          path="semantic.counterplay"
          items={semantic.counterplay || []}
          addLabel="Add Counterplay"
          onAdd={() =>
            onChange(
              ["counterplay"],
              [
                ...(semantic.counterplay || []),
                {
                  id: `counterplay-${(semantic.counterplay || []).length + 1}`,
                  actionCost: "",
                  check: null,
                  success: "",
                },
              ],
            )
          }
          onRemove={(index) =>
            onChange(
              ["counterplay"],
              (semantic.counterplay || []).filter(
                (_, itemIndex) => itemIndex !== index,
              ),
            )
          }
        >
          {(item, index) => (
            <>
              <StudioStructuredField
                componentId={componentId}
                label="ID"
                path={`semantic.counterplay[${index}].id`}
                value={item.id || ""}
                onChange={(value) =>
                  onChange(["counterplay", index, "id"], value)
                }
              />
              <StudioStructuredField
                componentId={componentId}
                label="Action Cost"
                path={`semantic.counterplay[${index}].actionCost`}
                value={item.actionCost || ""}
                onChange={(value) =>
                  onChange(["counterplay", index, "actionCost"], value)
                }
              />
              {item.check ? (
                <StudioFieldset legend="Counterplay Check">
                  <StudioStructuredField
                    componentId={componentId}
                    label="Ability"
                    path={`semantic.counterplay[${index}].check.ability`}
                    value={item.check.ability || ""}
                    onChange={(value) =>
                      onChange(
                        ["counterplay", index, "check", "ability"],
                        value,
                      )
                    }
                  />
                  <StudioListField
                    componentId={componentId}
                    label="Skills"
                    path={`semantic.counterplay[${index}].check.skills`}
                    value={item.check.skills}
                    onChange={(value) =>
                      onChange(["counterplay", index, "check", "skills"], value)
                    }
                  />
                  <StudioStructuredField
                    componentId={componentId}
                    label="Fixed DC"
                    path={`semantic.counterplay[${index}].check.dc`}
                    type="number"
                    min={0}
                    max={99}
                    value={item.check.dc ?? ""}
                    onChange={(value) =>
                      onChange(
                        ["counterplay", index, "check", "dc"],
                        value === "" ? null : value,
                      )
                    }
                  />
                  <StudioStructuredField
                    componentId={componentId}
                    label="Scaling Key"
                    path={`semantic.counterplay[${index}].check.scalingKey`}
                    value={item.check.scalingKey || ""}
                    onChange={(value) =>
                      onChange(
                        ["counterplay", index, "check", "scalingKey"],
                        value,
                      )
                    }
                  />
                  <StudioButton
                    danger
                    icon="fa-trash"
                    onClick={() =>
                      onChange(["counterplay", index, "check"], null)
                    }
                  >
                    Remove Counterplay Check
                  </StudioButton>
                </StudioFieldset>
              ) : (
                <StudioButton
                  icon="fa-plus"
                  onClick={() =>
                    onChange(["counterplay", index, "check"], {
                      ability: "",
                      skills: [],
                      dc: null,
                      scalingKey: "",
                    })
                  }
                >
                  Add Counterplay Check
                </StudioButton>
              )}
              <StudioStructuredField
                componentId={componentId}
                label="Success"
                path={`semantic.counterplay[${index}].success`}
                multiline
                value={item.success || ""}
                onChange={(value) =>
                  onChange(["counterplay", index, "success"], value)
                }
              />
            </>
          )}
        </StudioArrayEditor>
        <StudioStructuredField
          componentId={componentId}
          label="Reset Condition"
          path="semantic.reset.condition"
          value={semantic.reset?.condition || ""}
          onChange={(value) => onChange(["reset", "condition"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Reset Value"
          path="semantic.reset.value"
          type="number"
          min={0}
          max={99}
          value={semantic.reset?.value ?? ""}
          onChange={(value) =>
            onChange(["reset", "value"], value === "" ? null : value)
          }
        />
        <StudioArrayEditor
          componentId={componentId}
          path="semantic.escalation"
          items={semantic.escalation || []}
          addLabel="Add Escalation"
          onAdd={() =>
            onChange(
              ["escalation"],
              [...(semantic.escalation || []), { at: 1, effect: "" }],
            )
          }
          onRemove={(index) =>
            onChange(
              ["escalation"],
              (semantic.escalation || []).filter(
                (_, itemIndex) => itemIndex !== index,
              ),
            )
          }
        >
          {(item, index) => (
            <>
              <StudioStructuredField
                componentId={componentId}
                label="At State"
                path={`semantic.escalation[${index}].at`}
                type="number"
                min={0}
                max={99}
                value={item.at ?? 0}
                onChange={(value) =>
                  onChange(["escalation", index, "at"], value)
                }
              />
              <StudioStructuredField
                componentId={componentId}
                label="Effect"
                path={`semantic.escalation[${index}].effect`}
                multiline
                value={item.effect || ""}
                onChange={(value) =>
                  onChange(["escalation", index, "effect"], value)
                }
              />
            </>
          )}
        </StudioArrayEditor>
        <StudioStructuredField
          componentId={componentId}
          label="GM Summary"
          path="semantic.gmSummary"
          multiline
          rows={4}
          value={semantic.gmSummary || ""}
          onChange={(value) => onChange(["gmSummary"], value)}
        />
        <StudioListField
          componentId={componentId}
          label="Player-Facing Signs"
          path="semantic.playerFacingSigns"
          value={semantic.playerFacingSigns}
          onChange={(value) => onChange(["playerFacingSigns"], value)}
        />
      </StudioEditorSection>
    </>
  );
}
