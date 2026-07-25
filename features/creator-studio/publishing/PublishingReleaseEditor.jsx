import { useEffect, useState } from "react";
import { StudioToolModalShell } from "../../inspiration-studio/components/StudioToolModalShell.jsx";
import {
  StudioButton,
  StudioField,
  StudioFieldGrid,
  StudioInput,
  StudioSelect,
  StudioTextarea,
} from "../../inspiration-studio/ui/index.js";

const INSTAGRAM_KIND_OPTIONS = [
  ["post", "Post"],
  ["story", "Story"],
  ["reel", "Reel"],
];

export default function PublishingReleaseEditor({
  isOpen,
  onClose,
  onSave,
  release,
}) {
  const [draft, setDraft] = useState(release || null);

  useEffect(() => {
    setDraft(release ? { ...release } : null);
  }, [release]);

  if (!draft) return null;

  function setField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSave?.({
      ...draft,
      cta: String(draft.cta || "").trim(),
      goal: String(draft.goal || "").trim(),
      summary: String(draft.summary || "").trim(),
      title: String(draft.title || "").trim(),
      type: String(draft.type || "").trim(),
    });
  }

  return (
    <StudioToolModalShell
      className="creator-publishing__release-editor"
      icon="fa-pen-to-square"
      id="creatorPublishingReleaseEditor"
      isOpen={isOpen}
      onClose={onClose}
      subtitle="Update the calendar record without changing the source carousel or asset provenance."
      title={draft.title || "Release Details"}
    >
      <form className="creator-publishing__release-form" onSubmit={submit}>
        <StudioFieldGrid>
          <StudioField label="Publication Date" icon="fa-calendar-day">
            <StudioInput
              required
              type="date"
              value={draft.publishDate}
              onChange={(value) => setField("publishDate", value)}
            />
          </StudioField>
          <StudioField label="Editorial Type" icon="fa-tag">
            <StudioInput
              value={draft.type}
              onChange={(value) => setField("type", value)}
            />
          </StudioField>
          <StudioField label="Instagram Format" icon="fa-images">
            <StudioSelect
              options={INSTAGRAM_KIND_OPTIONS}
              value={draft.instagramKind || "post"}
              onChange={(value) => setField("instagramKind", value)}
            />
          </StudioField>
          <StudioField label="Goal" icon="fa-bullseye">
            <StudioInput
              value={draft.goal}
              onChange={(value) => setField("goal", value)}
            />
          </StudioField>
          <StudioField fullWidth label="Title" icon="fa-heading">
            <StudioInput
              required
              value={draft.title}
              onChange={(value) => setField("title", value)}
            />
          </StudioField>
          <StudioField fullWidth label="Summary" icon="fa-align-left">
            <StudioTextarea
              required
              rows={4}
              value={draft.summary}
              onChange={(value) => setField("summary", value)}
            />
          </StudioField>
          <StudioField fullWidth label="Call to Action" icon="fa-comment-dots">
            <StudioTextarea
              required
              rows={3}
              value={draft.cta}
              onChange={(value) => setField("cta", value)}
            />
          </StudioField>
        </StudioFieldGrid>
        <footer className="creator-publishing__release-form-actions">
          <StudioButton onClick={onClose}>Cancel</StudioButton>
          <StudioButton icon="fa-floppy-disk" type="submit" variant="primary">
            Save Release
          </StudioButton>
        </footer>
      </form>
    </StudioToolModalShell>
  );
}
