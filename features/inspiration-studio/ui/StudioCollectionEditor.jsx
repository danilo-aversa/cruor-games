import { StudioIcon } from "../components/StudioIcon.jsx";
import { getStudioFieldDomId } from "../model/studio-field-links.js";
import { StudioButton, StudioIconButton } from "./StudioControls.jsx";
import { StudioFieldGrid } from "./StudioField.jsx";

function defaultItemKey(item, index) {
  return item?.id || `item-${index + 1}`;
}

function defaultItemLabel(_item, index) {
  return `Item ${index + 1}`;
}

export function StudioCollectionItem({
  children,
  className = "",
  defaultOpen = false,
  label,
  onRemove,
  removeLabel = "Remove item",
}) {
  return (
    <details
      className={`studio-collection-item studio-rules-group studio-rules-group--collapsible ${className}`.trim()}
      open={defaultOpen || undefined}
    >
      <summary className="studio-collapsible-group__heading studio-collection-item__heading">
        <span className="studio-rules-group__title">{label}</span>
        <span className="studio-rules-group__tools">
          {onRemove ? (
            <StudioIconButton
              className="studio-collection-item__remove"
              danger
              icon="fa-trash"
              label={removeLabel}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRemove();
              }}
            />
          ) : null}
          <StudioIcon name="fa-chevron-down" />
        </span>
      </summary>
      <div className="studio-rules-group__body studio-collection-item__body">
        {children}
      </div>
    </details>
  );
}

export function StudioCollectionEditor({
  addLabel = "Add Item",
  children,
  className = "",
  defaultOpenIndex = -1,
  emptyLabel = "No entries authored yet.",
  getItemKey = defaultItemKey,
  getItemLabel = defaultItemLabel,
  items = [],
  onAdd,
  onRemove,
  path = "",
  componentId = "",
  id = "",
}) {
  return (
    <div
      className={`studio-collection-editor ${className}`.trim()}
      id={
        id ||
        (componentId && path
          ? getStudioFieldDomId(componentId, path)
          : undefined)
      }
      data-studio-field-path={path || undefined}
      data-count={items.length}
    >
      {items.length ? (
        <div className="studio-collection-editor__items">
          {items.map((item, index) => (
            <StudioCollectionItem
              key={getItemKey(item, index)}
              label={getItemLabel(item, index)}
              defaultOpen={index === defaultOpenIndex}
              onRemove={onRemove ? () => onRemove(index) : undefined}
              removeLabel={`Remove ${getItemLabel(item, index)}`}
            >
              {children(item, index)}
            </StudioCollectionItem>
          ))}
        </div>
      ) : (
        <p className="studio-collection-editor__empty">{emptyLabel}</p>
      )}
      {onAdd ? (
        <StudioButton icon="fa-plus" onClick={onAdd}>
          {addLabel}
        </StudioButton>
      ) : null}
    </div>
  );
}

function getCollectionItemNoun(addLabel = "Add Item") {
  return (
    String(addLabel || "Item").replace(/^Add\s+/i, "").trim() || "Item"
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
  const itemNoun = getCollectionItemNoun(addLabel);
  return (
    <StudioCollectionEditor
      addLabel={addLabel}
      componentId={componentId}
      emptyLabel={emptyLabel}
      getItemLabel={(item, index) =>
        item?.title ||
        item?.label ||
        item?.name ||
        item?.id ||
        `${itemNoun} ${index + 1}`
      }
      items={items}
      onAdd={onAdd}
      onRemove={onRemove}
      path={path}
    >
      {(item, index) => (
        <StudioFieldGrid>{children(item, index)}</StudioFieldGrid>
      )}
    </StudioCollectionEditor>
  );
}

