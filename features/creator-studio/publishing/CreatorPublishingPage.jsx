import { useEffect, useMemo, useState } from "react";
import {
  StudioTab,
  StudioTabs,
} from "../../inspiration-studio/ui/index.js";
import PublishingCalendarView from "./PublishingCalendarView.jsx";
import PublishingChecklistView from "./PublishingChecklistView.jsx";
import PublishingGuidelinesView from "./PublishingGuidelinesView.jsx";
import PublishingReleaseEditor from "./PublishingReleaseEditor.jsx";
import PublishingSimulatorView from "./PublishingSimulatorView.jsx";
import {
  EDITORIAL_RULES,
  PUBLISHING_RULES,
  PUBLISHING_TABS,
} from "./publishing.data.js";
import {
  addDaysToDateValue,
  applyReleaseCadence,
  getShortWeekday,
  loadPublishingState,
  persistPublishingState,
} from "./publishing.model.js";
import "./publishing.styles.css";

export default function CreatorPublishingPage() {
  const [activeView, setActiveView] = useState("calendar");
  const [state, setState] = useState(loadPublishingState);
  const [editingReleaseId, setEditingReleaseId] = useState("");
  const activeRelease = useMemo(
    () => state.releases.find((release) => release.id === state.activeReleaseId) || state.releases[0],
    [state.activeReleaseId, state.releases],
  );
  const editingRelease = state.releases.find(
    (release) => release.id === editingReleaseId,
  );

  useEffect(() => {
    persistPublishingState(state);
  }, [state]);

  function setActiveReleaseId(activeReleaseId) {
    setState((current) => ({ ...current, activeReleaseId }));
  }

  function updateRelease(releaseId, updater) {
    setState((current) => ({
      ...current,
      releases: current.releases.map((release) =>
        release.id === releaseId
          ? typeof updater === "function"
            ? updater(release)
            : { ...release, ...updater }
          : release,
      ),
    }));
  }

  function saveRelease(nextRelease) {
    updateRelease(nextRelease.id, {
      ...nextRelease,
      day: getShortWeekday(nextRelease.publishDate),
    });
    setEditingReleaseId("");
  }

  function applyCadence() {
    setState((current) => ({
      ...current,
      releases: applyReleaseCadence(current.releases, current.seasonStart),
    }));
  }

  function addRelease() {
    setState((current) => {
      const source = current.releases[current.releases.length - 1];
      const id = `release-${Date.now()}`;
      const publishDate = addDaysToDateValue(source?.publishDate, 2);
      const release = {
        ...(source || {}),
        id,
        week: 3,
        day: getShortWeekday(publishDate),
        publishDate,
        publishTime: "20:00",
        type: "Explainer",
        title: "Untitled Release",
        summary: "Define the purpose and content of this release.",
        goal: "Editorial goal",
        cta: "Add one clear audience action.",
        caption: "<strong>cruorgames</strong> Draft caption.",
        facebookCopy: "Draft Facebook adaptation.",
        slides: [
          ["New Release · 1/5", "Untitled Release", "Define the opening promise.", "Draft"],
          ["New Release · 2/5", "Context", "Add the first supporting point.", "Draft"],
          ["New Release · 3/5", "Explanation", "Add the central explanation.", "Draft"],
          ["New Release · 4/5", "Implication", "Explain why the information matters.", "Draft"],
          ["New Release · 5/5", "Conclusion", "Conclude before presenting the call to action.", "Draft"],
        ],
      };

      return {
        ...current,
        activeReleaseId: id,
        releases: [...current.releases, release],
      };
    });
    setActiveView("calendar");
  }

  function openSimulator(releaseId) {
    setActiveReleaseId(releaseId);
    setActiveView("simulator");
  }

  function togglePublished(releaseId) {
    setState((current) => ({
      ...current,
      published: {
        ...current.published,
        [releaseId]: !current.published[releaseId],
      },
    }));
  }

  return (
    <section
      className="creator-publishing inspiration-studio"
      aria-label="Publishing"
      data-creator-publishing-ready="true"
      data-active-publishing-view={activeView}
    >
      <StudioTabs
        className="inspiration-studio__section-tabs"
        label="Publishing sections"
      >
        {PUBLISHING_TABS.map((tab) => (
          <StudioTab
            active={activeView === tab.id}
            icon={tab.icon}
            key={tab.id}
            label={tab.label}
            onClick={() => setActiveView(tab.id)}
          />
        ))}
      </StudioTabs>

      <main className="inspiration-studio__main creator-publishing__main">
        {activeView === "calendar" ? (
          <PublishingCalendarView
            onAddRelease={addRelease}
            onApplyCadence={applyCadence}
            onEditRelease={setEditingReleaseId}
            onOpenSimulator={openSimulator}
            onSeasonStartChange={(seasonStart) =>
              setState((current) => ({ ...current, seasonStart }))
            }
            onTogglePublished={togglePublished}
            published={state.published}
            releases={state.releases}
            seasonStart={state.seasonStart}
          />
        ) : null}

        {activeView === "simulator" ? (
          <PublishingSimulatorView
            activeReleaseId={activeRelease?.id}
            onActiveReleaseChange={setActiveReleaseId}
            onReleaseTimeChange={(releaseId, publishTime) =>
              updateRelease(releaseId, { publishTime })
            }
            releases={state.releases}
          />
        ) : null}

        {activeView === "publishing" ? (
          <PublishingGuidelinesView mode="publishing" rules={PUBLISHING_RULES} />
        ) : null}

        {activeView === "editorial" ? (
          <PublishingGuidelinesView mode="editorial" rules={EDITORIAL_RULES} />
        ) : null}

        {activeView === "checklist" ? (
          <PublishingChecklistView onOpenView={setActiveView} />
        ) : null}
      </main>

      <PublishingReleaseEditor
        isOpen={Boolean(editingRelease)}
        onClose={() => setEditingReleaseId("")}
        onSave={saveRelease}
        release={editingRelease}
      />
    </section>
  );
}
