import { READ_ALOUD_FRAGMENT_GROUPS } from "../../../shared/content/contracts/semantic/index.js";
import {
  StudioArrayEditor,
  StudioEditorSection,
  StudioListField,
  StudioStructuredField,
} from "./StudioStructuredFields.jsx";

const LENGTHS = ["compact", "standard", "extended"];

function formatLabel(value = "") {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function StudioFragmentPoolEditor({ componentId, onChange, semantic }) {
  return (
    <>
      {READ_ALOUD_FRAGMENT_GROUPS.map((group) => {
        const fragments = semantic.fragments?.[group] || [];
        return (
          <StudioEditorSection
            key={group}
            icon="fa-quote-left"
            title={formatLabel(group)}
            description="Fragments are selected by the shared compiler using room role, geometry, visible features and intensity."
          >
            <StudioArrayEditor
              componentId={componentId}
              path={`semantic.fragments.${group}`}
              items={fragments}
              addLabel={`Add ${formatLabel(group)} Fragment`}
              onAdd={() =>
                onChange(
                  ["fragments", group],
                  [
                    ...fragments,
                    {
                      id: `${group}-${fragments.length + 1}`,
                      text: "",
                      roomRoles: [],
                      geometry: [],
                      visibleFeatures: [],
                      intensity: "",
                      tags: [],
                      sourceComponentId: "",
                      provenance: semantic.provenance,
                    },
                  ],
                )
              }
              onRemove={(index) =>
                onChange(
                  ["fragments", group],
                  fragments.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            >
              {(fragment, index) => (
                <>
                  <StudioStructuredField
                    componentId={componentId}
                    label="Fragment ID"
                    path={`semantic.fragments.${group}[${index}].id`}
                    value={fragment.id || ""}
                    onChange={(value) =>
                      onChange(["fragments", group, index, "id"], value)
                    }
                  />
                  <StudioStructuredField
                    componentId={componentId}
                    label="Player-Facing Text"
                    path={`semantic.fragments.${group}[${index}].text`}
                    multiline
                    rows={4}
                    value={fragment.text || ""}
                    onChange={(value) =>
                      onChange(["fragments", group, index, "text"], value)
                    }
                  />
                  <StudioListField
                    componentId={componentId}
                    label="Room Roles"
                    path={`semantic.fragments.${group}[${index}].roomRoles`}
                    value={fragment.roomRoles}
                    onChange={(value) =>
                      onChange(["fragments", group, index, "roomRoles"], value)
                    }
                  />
                  <StudioListField
                    componentId={componentId}
                    label="Geometry"
                    path={`semantic.fragments.${group}[${index}].geometry`}
                    value={fragment.geometry}
                    onChange={(value) =>
                      onChange(["fragments", group, index, "geometry"], value)
                    }
                  />
                  <StudioListField
                    componentId={componentId}
                    label="Visible Features"
                    path={`semantic.fragments.${group}[${index}].visibleFeatures`}
                    value={fragment.visibleFeatures}
                    onChange={(value) =>
                      onChange(
                        ["fragments", group, index, "visibleFeatures"],
                        value,
                      )
                    }
                  />
                  <StudioStructuredField
                    componentId={componentId}
                    label="Intensity"
                    path={`semantic.fragments.${group}[${index}].intensity`}
                    value={fragment.intensity || ""}
                    onChange={(value) =>
                      onChange(["fragments", group, index, "intensity"], value)
                    }
                  />
                  <StudioListField
                    componentId={componentId}
                    label="Tags"
                    path={`semantic.fragments.${group}[${index}].tags`}
                    value={fragment.tags}
                    onChange={(value) =>
                      onChange(["fragments", group, index, "tags"], value)
                    }
                  />
                  <StudioStructuredField
                    componentId={componentId}
                    label="Source Component ID"
                    path={`semantic.fragments.${group}[${index}].sourceComponentId`}
                    value={fragment.sourceComponentId || ""}
                    onChange={(value) =>
                      onChange(
                        ["fragments", group, index, "sourceComponentId"],
                        value,
                      )
                    }
                  />
                </>
              )}
            </StudioArrayEditor>
          </StudioEditorSection>
        );
      })}

      <StudioEditorSection
        icon="fa-ruler-horizontal"
        title="Composition Constraints"
        description="The compiler uses these limits for compact, standard and extended variants."
      >
        <StudioListField
          componentId={componentId}
          label="Forbidden Spoiler Tags"
          path="semantic.constraints.forbiddenSpoilerTags"
          value={semantic.constraints?.forbiddenSpoilerTags}
          onChange={(value) =>
            onChange(["constraints", "forbiddenSpoilerTags"], value)
          }
        />
        {LENGTHS.map((length) => (
          <fieldset className="studio-semantic-fieldset" key={length}>
            <legend>{formatLabel(length)}</legend>
            <StudioStructuredField
              componentId={componentId}
              label="Maximum Sentences"
              path={`semantic.constraints.maximumSentences.${length}`}
              type="number"
              min={1}
              max={12}
              value={semantic.constraints?.maximumSentences?.[length] ?? 1}
              onChange={(value) =>
                onChange(["constraints", "maximumSentences", length], value)
              }
            />
            <StudioStructuredField
              componentId={componentId}
              label="Minimum Words"
              path={`semantic.constraints.wordRanges.${length}[0]`}
              type="number"
              min={1}
              max={500}
              value={semantic.constraints?.wordRanges?.[length]?.[0] ?? 1}
              onChange={(value) =>
                onChange(["constraints", "wordRanges", length, 0], value)
              }
            />
            <StudioStructuredField
              componentId={componentId}
              label="Maximum Words"
              path={`semantic.constraints.wordRanges.${length}[1]`}
              type="number"
              min={1}
              max={500}
              value={semantic.constraints?.wordRanges?.[length]?.[1] ?? 1}
              onChange={(value) =>
                onChange(["constraints", "wordRanges", length, 1], value)
              }
            />
          </fieldset>
        ))}
      </StudioEditorSection>

      <StudioEditorSection icon="fa-spell-check" title="Grammar">
        <StudioListField
          componentId={componentId}
          label="Opening Order"
          path="semantic.grammar.openingOrder"
          value={semantic.grammar?.openingOrder}
          onChange={(value) => onChange(["grammar", "openingOrder"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Tense"
          path="semantic.grammar.tense"
          value={semantic.grammar?.tense || "present"}
          options={[
            ["present", "Present"],
            ["past", "Past"],
          ]}
          onChange={(value) => onChange(["grammar", "tense"], value)}
        />
        <StudioStructuredField
          componentId={componentId}
          label="Allow Second Person"
          path="semantic.grammar.allowSecondPerson"
          type="checkbox"
          checked={semantic.grammar?.allowSecondPerson === true}
          onChange={(value) =>
            onChange(["grammar", "allowSecondPerson"], value)
          }
        />
      </StudioEditorSection>
    </>
  );
}
