import { useMemo, useState } from "react";

import InspirationDossierModal from "../../inspirations/components/InspirationDossierModal.jsx";
import {
  INSPIRATION_DOMAIN_ORDER,
  INSPIRATION_OBSCURITY_ORDER,
  getInspirationCardMeta,
} from "../../inspirations/inspirations.card-config.js";
import "../../inspirations/inspirations.styles.css";
import {
  StudioCollectionEditor,
  StudioField,
  StudioFieldGrid,
  StudioIconButton,
  StudioInput,
  StudioPanelTitle,
  StudioSelect,
  StudioTextarea,
} from "../ui/index.js";
import "./StudioDossierAuthoringPanel.css";

const DOMAIN_OPTIONS = Object.freeze([
  ["", "Automatic from Source Type"],
  ...INSPIRATION_DOMAIN_ORDER.map((value) => [
    value,
    value.replace(/(^|[-_])([a-z])/g, (_match, _separator, letter) =>
      letter.toUpperCase(),
    ),
  ]),
]);

const OBSCURITY_OPTIONS = Object.freeze([
  ["", "Uncommon (default)"],
  ...INSPIRATION_OBSCURITY_ORDER.map((value) => [
    value,
    value.charAt(0).toUpperCase() + value.slice(1),
  ]),
]);

const IMAGE_RIGHTS_OPTIONS = Object.freeze([
  ["unverified", "Unverified"],
  ["public-domain", "Public Domain"],
  ["creative-commons", "Creative Commons"],
  ["licensed", "Licensed"],
  ["permission", "Used with Permission"],
  ["owned", "Owned by Cruor Games"],
]);

const COLLECTION_DEFAULTS = Object.freeze({
  sources: Object.freeze({ title: "", url: "", description: "", meta: "" }),
  furtherReading: Object.freeze({
    title: "",
    url: "",
    description: "",
    meta: "",
  }),
  relatedDossiers: Object.freeze({
    sourceAnchorId: "",
    title: "",
  }),
});

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cloneCollectionDefault(field) {
  const value = COLLECTION_DEFAULTS[field] || {};
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      Array.isArray(entry) ? [...entry] : entry,
    ]),
  );
}

function CollectionOrderControls({ index, itemCount, label, onMove }) {
  return (
    <div className="studio-dossier-authoring__order-controls">
      <StudioIconButton
        disabled={index === 0}
        icon="fa-arrow-up"
        label={`Move ${label} up`}
        onClick={() => onMove(index, index - 1)}
      />
      <StudioIconButton
        disabled={index >= itemCount - 1}
        icon="fa-arrow-down"
        label={`Move ${label} down`}
        onClick={() => onMove(index, index + 1)}
      />
    </div>
  );
}

function CollectionSection({ children, description, title }) {
  return (
    <section className="studio-dossier-authoring__collection-section">
      <header>
        <h3>{title}</h3>
        <p>{description}</p>
      </header>
      {children}
    </section>
  );
}

function ResearchCollection({
  addLabel,
  emptyLabel,
  field,
  items,
  onAdd,
  onMove,
  onRemove,
  onUpdate,
}) {
  return (
    <StudioCollectionEditor
      addLabel={addLabel}
      emptyLabel={emptyLabel}
      getItemKey={(_item, index) => `${field}-${index}`}
      getItemLabel={(item, index) => item.title || `${addLabel.replace(/^Add\s+/i, "")} ${index + 1}`}
      items={items}
      onAdd={onAdd}
      onRemove={onRemove}
    >
      {(item, index) => (
        <>
          <StudioFieldGrid>
            <StudioField label="Title" icon="fa-heading">
              <StudioInput
                value={item.title}
                onChange={(value) => onUpdate(index, "title", value)}
              />
            </StudioField>
            <StudioField label="URL" icon="fa-link">
              <StudioInput
                type="url"
                value={item.url}
                onChange={(value) => onUpdate(index, "url", value)}
                placeholder="https://…"
              />
            </StudioField>
            <StudioField fullWidth label="Description" icon="fa-align-left">
              <StudioTextarea
                rows={3}
                value={item.description}
                onChange={(value) => onUpdate(index, "description", value)}
              />
            </StudioField>
            <StudioField fullWidth label="Editorial Meta" icon="fa-tag">
              <StudioInput
                value={item.meta}
                onChange={(value) => onUpdate(index, "meta", value)}
                placeholder="Official institution · Primary source"
              />
            </StudioField>
          </StudioFieldGrid>
          <CollectionOrderControls
            index={index}
            itemCount={items.length}
            label={item.title || `${field} entry ${index + 1}`}
            onMove={onMove}
          />
        </>
      )}
    </StudioCollectionEditor>
  );
}

export function StudioDossierAuthoringPanel({
  draft,
  imageSource = "",
  updateDraft,
}) {
  const [isDossierOpen, setDossierOpen] = useState(false);
  const inspiration = draft.inspiration || {};
  const editorial = inspiration.editorial || {};
  const media = inspiration.media || {};
  const card = inspiration.card || {};
  const sources = asArray(editorial.sources);
  const furtherReading = asArray(editorial.furtherReading);
  const relatedDossiers = asArray(editorial.relatedDossiers);

  const previewCard = useMemo(() => {
    const previewInspiration = {
      ...inspiration,
      title: draft.title || inspiration.title,
      label: draft.title || inspiration.label,
      media: {
        ...media,
        imageUrl: imageSource,
      },
    };
    const meta = getInspirationCardMeta(previewInspiration, {
      fallbackNumber: Number(card.number) || 1,
      collectionLabel:
        card.collectionLabel || draft.packId || "Existing Inspirations",
    });
    const sourceAnchor = {
      ...(draft.sourceAnchor || {}),
      label:
        draft.sourceAnchor?.label ||
        draft.sourceAnchor?.title ||
        draft.title ||
        inspiration.title,
    };
    const sourceType =
      inspiration.sourceTypes?.[0] || sourceAnchor.kind || "Inspiration";

    return {
      inspiration: previewInspiration,
      meta,
      sourceType,
      sourceAnchor,
      horror: [...new Set(asArray(inspiration.horror))],
    };
  }, [card.collectionLabel, card.number, draft, imageSource, inspiration, media]);

  function updateCollection(field, updater) {
    updateDraft((nextDraft) => {
      nextDraft.inspiration = nextDraft.inspiration || {};
      nextDraft.inspiration.editorial =
        nextDraft.inspiration.editorial || {};
      const items = asArray(nextDraft.inspiration.editorial[field]).map(
        (item) => ({
          ...item,
          ...(Array.isArray(item?.keywords)
            ? { keywords: [...item.keywords] }
            : {}),
          ...(Array.isArray(item?.componentIds)
            ? { componentIds: [...item.componentIds] }
            : {}),
        }),
      );
      updater(items);
      nextDraft.inspiration.editorial[field] = items;
    });
  }

  function addCollectionItem(field) {
    updateCollection(field, (items) => {
      items.push(cloneCollectionDefault(field));
    });
  }

  function removeCollectionItem(field, index) {
    updateCollection(field, (items) => {
      items.splice(index, 1);
    });
  }

  function moveCollectionItem(field, fromIndex, toIndex) {
    updateCollection(field, (items) => {
      if (
        fromIndex < 0 ||
        fromIndex >= items.length ||
        toIndex < 0 ||
        toIndex >= items.length
      ) {
        return;
      }
      const [item] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, item);
    });
  }

  function updateCollectionItem(field, index, key, value) {
    updateCollection(field, (items) => {
      items[index] = { ...items[index], [key]: value };
    });
  }

  function updateCardField(field, value) {
    updateDraft((nextDraft) => {
      nextDraft.inspiration = nextDraft.inspiration || {};
      nextDraft.inspiration.card = {
        ...(nextDraft.inspiration.card || {}),
        [field]: value,
      };
    });
  }

  function updateMediaField(field, value) {
    updateDraft((nextDraft) => {
      nextDraft.inspiration = nextDraft.inspiration || {};
      nextDraft.inspiration.media = {
        ...(nextDraft.inspiration.media || {}),
        [field]: value,
      };
    });
  }

  return (
    <div className="studio-dossier-authoring">
      <section
        className="studio-panel studio-panel--dossier-structure"
        aria-label="Dossier structured content"
      >
        <StudioPanelTitle
          eyebrow="Public Dossier"
          icon="fa-book-open"
          title="Structured Sections"
          help="Author research links, related Dossiers, card metadata, and image provenance without editing JSON."
        />

        <CollectionSection
          title="Sources Used"
          description="Research sources directly supporting the factual and interpretive claims in the Dossier."
        >
          <ResearchCollection
            addLabel="Add Source"
            emptyLabel="No sources authored yet."
            field="sources"
            items={sources}
            onAdd={() => addCollectionItem("sources")}
            onMove={(fromIndex, toIndex) =>
              moveCollectionItem("sources", fromIndex, toIndex)
            }
            onRemove={(index) => removeCollectionItem("sources", index)}
            onUpdate={(index, key, value) =>
              updateCollectionItem("sources", index, key, value)
            }
          />
        </CollectionSection>

        <CollectionSection
          title="Further Reading"
          description="Optional material that expands the topic without carrying a core factual claim."
        >
          <ResearchCollection
            addLabel="Add Further Reading"
            emptyLabel="No further reading authored yet."
            field="furtherReading"
            items={furtherReading}
            onAdd={() => addCollectionItem("furtherReading")}
            onMove={(fromIndex, toIndex) =>
              moveCollectionItem("furtherReading", fromIndex, toIndex)
            }
            onRemove={(index) =>
              removeCollectionItem("furtherReading", index)
            }
            onUpdate={(index, key, value) =>
              updateCollectionItem("furtherReading", index, key, value)
            }
          />
        </CollectionSection>

        <CollectionSection
          title="Related Dossiers"
          description="Select reviewed Dossiers to render with the same front-card component used by the public gallery."
        >
          <StudioCollectionEditor
            addLabel="Add Related Dossier"
            emptyLabel="No related Dossiers authored yet."
            getItemKey={(item, index) =>
              `related-${index}`
            }
            getItemLabel={(item, index) =>
              item.title || item.sourceAnchorId || `Related Dossier ${index + 1}`
            }
            items={relatedDossiers}
            onAdd={() => addCollectionItem("relatedDossiers")}
            onRemove={(index) =>
              removeCollectionItem("relatedDossiers", index)
            }
          >
            {(item, index) => (
              <>
                <StudioFieldGrid>
                  <StudioField label="Source Anchor ID" icon="fa-fingerprint">
                    <StudioInput
                      value={item.sourceAnchorId}
                      onChange={(value) =>
                        updateCollectionItem(
                          "relatedDossiers",
                          index,
                          "sourceAnchorId",
                          slugify(value),
                        )
                      }
                    />
                  </StudioField>
                  <StudioField label="Title" icon="fa-heading">
                    <StudioInput
                      value={item.title}
                      onChange={(value) =>
                        updateCollectionItem(
                          "relatedDossiers",
                          index,
                          "title",
                          value,
                        )
                      }
                    />
                  </StudioField>
                </StudioFieldGrid>
                <CollectionOrderControls
                  index={index}
                  itemCount={relatedDossiers.length}
                  label={item.title || `Related Dossier ${index + 1}`}
                  onMove={(fromIndex, toIndex) =>
                    moveCollectionItem(
                      "relatedDossiers",
                      fromIndex,
                      toIndex,
                    )
                  }
                />
              </>
            )}
          </StudioCollectionEditor>
        </CollectionSection>
      </section>

      <section
        className="studio-panel studio-panel--dossier-metadata"
        aria-label="Archive card metadata"
      >
        <StudioPanelTitle
          eyebrow="Archive Metadata"
          icon="fa-id-card"
          title="Card Classification"
          help="These fields drive the public card, Dossier metadata strip, filtering, collection order, and card-back description."
        />
        <StudioFieldGrid>
          <StudioField label="Domain" icon="fa-shapes">
            <StudioSelect
              options={DOMAIN_OPTIONS}
              value={card.domain}
              onChange={(value) => updateCardField("domain", value)}
            />
          </StudioField>
          <StudioField label="Obscurity" icon="fa-gem">
            <StudioSelect
              options={OBSCURITY_OPTIONS}
              value={card.obscurity}
              onChange={(value) => updateCardField("obscurity", value)}
            />
          </StudioField>
          <StudioField label="Collection ID" icon="fa-layer-group">
            <StudioInput
              value={card.collectionId}
              onChange={(value) =>
                updateCardField("collectionId", slugify(value))
              }
            />
          </StudioField>
          <StudioField label="Collection Label" icon="fa-heading">
            <StudioInput
              value={card.collectionLabel}
              onChange={(value) => updateCardField("collectionLabel", value)}
            />
          </StudioField>
          <StudioField label="Card Number" icon="fa-list-ol">
            <StudioInput
              min="1"
              step="1"
              type="number"
              value={card.number ?? ""}
              onChange={(value) =>
                updateCardField(
                  "number",
                  value === "" ? null : Math.max(1, Number(value) || 1),
                )
              }
            />
          </StudioField>
          <StudioField fullWidth label="Card-Back Description" icon="fa-align-left">
            <StudioTextarea
              rows={5}
              value={card.description}
              onChange={(value) => updateCardField("description", value)}
            />
          </StudioField>
        </StudioFieldGrid>
      </section>

      <section
        className="studio-panel studio-panel--image-provenance"
        aria-label="Image rights and provenance"
      >
        <StudioPanelTitle
          eyebrow="Image Provenance"
          icon="fa-copyright"
          title="Rights & Source Record"
          help="Keep the public credit line separate from the internal evidence needed to approve an image for publication."
        />
        <StudioFieldGrid>
          <StudioField label="Creator / Photographer" icon="fa-user-pen">
            <StudioInput
              value={media.imageCreator}
              onChange={(value) => updateMediaField("imageCreator", value)}
            />
          </StudioField>
          <StudioField label="Source Work / Collection" icon="fa-landmark">
            <StudioInput
              value={media.imageSourceTitle}
              onChange={(value) => updateMediaField("imageSourceTitle", value)}
            />
          </StudioField>
          <StudioField fullWidth label="Source URL" icon="fa-link">
            <StudioInput
              type="url"
              value={media.imageSourceUrl}
              onChange={(value) => updateMediaField("imageSourceUrl", value)}
              placeholder="https://…"
            />
          </StudioField>
          <StudioField label="Rights Status" icon="fa-scale-balanced">
            <StudioSelect
              options={IMAGE_RIGHTS_OPTIONS}
              value={media.imageRightsStatus || "unverified"}
              onChange={(value) => updateMediaField("imageRightsStatus", value)}
            />
          </StudioField>
          <StudioField label="Verified At" icon="fa-calendar-check">
            <StudioInput
              type="date"
              value={media.imageRightsVerifiedAt}
              onChange={(value) =>
                updateMediaField("imageRightsVerifiedAt", value)
              }
            />
          </StudioField>
          <StudioField label="License" icon="fa-file-contract">
            <StudioInput
              value={media.imageLicense}
              onChange={(value) => updateMediaField("imageLicense", value)}
              placeholder="CC BY-SA 4.0"
            />
          </StudioField>
          <StudioField label="License URL" icon="fa-link">
            <StudioInput
              type="url"
              value={media.imageLicenseUrl}
              onChange={(value) => updateMediaField("imageLicenseUrl", value)}
              placeholder="https://…"
            />
          </StudioField>
          <StudioField fullWidth label="Modifications" icon="fa-crop-simple">
            <StudioTextarea
              rows={3}
              value={media.imageModifications}
              onChange={(value) => updateMediaField("imageModifications", value)}
              placeholder="Crop, monochrome conversion, contrast adjustment…"
            />
          </StudioField>
        </StudioFieldGrid>
      </section>

      <section
        className="studio-panel studio-panel--dossier-preview-action"
        aria-label="Public Dossier preview"
      >
        <StudioPanelTitle
          eyebrow="Production Renderer"
          icon="fa-eye"
          title="Public Dossier Preview"
          help="Open the same modal component used by Inspirations. The preview is not embedded in the Studio workspace and does not use a duplicate renderer."
        />
        <div className="studio-dossier-authoring__preview-action">
          <p>
            Inspect the current draft with the exact public Dossier layout,
            including credits, research links, related Dossiers, safety tools,
            and linked generator content.
          </p>
          <button
            className="inspiration-card__dossier-button studio-dossier-authoring__preview-button"
            type="button"
            onClick={() => setDossierOpen(true)}
          >
            Open Dossier
          </button>
        </div>
      </section>

      {isDossierOpen ? (
        <InspirationDossierModal
          card={previewCard}
          linkedComponents={asArray(draft.components)}
          onClose={() => setDossierOpen(false)}
        />
      ) : null}
    </div>
  );
}

export default StudioDossierAuthoringPanel;
