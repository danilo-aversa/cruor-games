import { COMPONENT_SEMANTIC_TYPES } from "../../../shared/content/content.index.js";
import { getStudioSemanticEditorDefinition } from "../schema/studio-semantic-editor-registry.js";

function formatLabel(value = "") {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function createDefinition(semanticType) {
  const specialized = getStudioSemanticEditorDefinition(semanticType);
  if (specialized) {
    return Object.freeze({
      ...specialized,
      componentFamily: "location-component",
      preservesLegacyWorkflow: false,
    });
  }
  if (semanticType === "monster-graft") {
    return Object.freeze({
      semanticType,
      editorId: "monster-graft",
      label: "Monster Graft",
      componentFamily: "monster-graft",
      availability: "active",
      preservesLegacyWorkflow: true,
    });
  }
  if (semanticType === "location-region") {
    return Object.freeze({
      semanticType,
      editorId: "location-region",
      label: "Location Region",
      componentFamily: "location-region",
      availability: "active",
      preservesLegacyWorkflow: true,
    });
  }
  return Object.freeze({
    semanticType,
    editorId: "location-component",
    label: formatLabel(semanticType),
    componentFamily: "location-component",
    availability: "active",
    preservesLegacyWorkflow: false,
  });
}

export const STUDIO_EDITOR_REGISTRY = Object.freeze(
  Object.fromEntries(
    COMPONENT_SEMANTIC_TYPES.map((semanticType) => [
      semanticType,
      createDefinition(semanticType),
    ]),
  ),
);

export function getStudioEditorDefinition(componentOrSemanticType = {}) {
  const semanticType =
    typeof componentOrSemanticType === "string"
      ? componentOrSemanticType
      : componentOrSemanticType.semanticType ||
        (componentOrSemanticType.contentType === "monster-graft"
          ? "monster-graft"
          : componentOrSemanticType.contentType === "location-region"
            ? "location-region"
            : "interaction");
  return (
    STUDIO_EDITOR_REGISTRY[semanticType] || STUDIO_EDITOR_REGISTRY.interaction
  );
}

export function getStudioComponentFamily(component = {}) {
  return getStudioEditorDefinition(component).componentFamily;
}

export function listStudioEditorDefinitions() {
  return Object.values(STUDIO_EDITOR_REGISTRY);
}
