import {
  StudioButton,
  StudioIcon,
  StudioIconButton,
  StudioPanelTitle,
  StudioStatusBadge,
} from "../../inspiration-studio/ui/index.js";
import { PUBLISHING_WEEK_META } from "./publishing.data.js";
import {
  formatCalendarDate,
  getSeasonDateRange,
  getShortWeekday,
  getWeekDateRange,
} from "./publishing.model.js";

function PlatformOutputs({ release }) {
  const instagramKind = release.instagramKind || "post";

  return (
    <span className="creator-publishing__platforms" aria-label="Platform outputs">
      <span title={`Instagram ${instagramKind}`}>
        <i className="fa-brands fa-instagram" aria-hidden="true" />
      </span>
      <span title="Instagram Story">
        <StudioIcon name="fa-mobile-screen" />
      </span>
      <span title="Facebook Page post">
        <i className="fa-brands fa-facebook-f" aria-hidden="true" />
      </span>
    </span>
  );
}

function ReleaseCard({
  isPublished,
  onEdit,
  onOpenSimulator,
  onTogglePublished,
  release,
}) {
  return (
    <article
      className={`creator-publishing__release-card cruor-ui-card-surface${isPublished ? " is-published" : ""}`}
    >
      <div className="creator-publishing__release-topline">
        <span>
          <strong>{getShortWeekday(release.publishDate)}</strong>
          <small>{formatCalendarDate(release.publishDate)}</small>
        </span>
        <StudioStatusBadge status={isPublished ? "success" : "neutral"}>
          {isPublished ? "Published" : release.type}
        </StudioStatusBadge>
      </div>

      <div className="creator-publishing__release-copy">
        <h4>{release.title}</h4>
        <p>{release.summary}</p>
      </div>

      <dl className="creator-publishing__release-meta">
        <div>
          <dt>Goal</dt>
          <dd>{release.goal}</dd>
        </div>
        <div>
          <dt>CTA</dt>
          <dd>{release.cta}</dd>
        </div>
      </dl>

      <footer className="creator-publishing__release-footer">
        <PlatformOutputs release={release} />
        <span className="creator-publishing__release-actions">
          <StudioIconButton
            icon="fa-pen"
            label={`Edit ${release.title}`}
            onClick={() => onEdit(release.id)}
          />
          <StudioIconButton
            icon="fa-eye"
            label={`Open ${release.title} in simulator`}
            onClick={() => onOpenSimulator(release.id)}
          />
          <StudioIconButton
            className={isPublished ? "is-success" : ""}
            icon="fa-check"
            label={
              isPublished
                ? `Mark ${release.title} as not published`
                : `Mark ${release.title} as published`
            }
            aria-pressed={isPublished}
            onClick={() => onTogglePublished(release.id)}
          />
        </span>
      </footer>
    </article>
  );
}

export default function PublishingCalendarView({
  onAddRelease,
  onApplyCadence,
  onEditRelease,
  onOpenSimulator,
  onSeasonStartChange,
  onTogglePublished,
  published,
  releases,
  seasonStart,
}) {
  return (
    <section
      className="creator-publishing__view creator-publishing__calendar-view"
      aria-label="Publishing calendar"
    >
      <section className="studio-panel cruor-ui-panel-surface">
        <StudioPanelTitle
          eyebrow="Release Plan"
          help="Plan one three-week editorial season and keep its Instagram, Story and Facebook variants tied to the same release record."
          icon="fa-calendar-days"
          title="Three-week Calendar"
        >
          <StudioStatusBadge status="neutral">
            {releases.length} Releases
          </StudioStatusBadge>
        </StudioPanelTitle>

        <div className="creator-publishing__calendar-toolbar">
          <div className="creator-publishing__calendar-summary">
            <span><StudioIcon name="fa-calendar-week" /> 3 Weeks</span>
            <span><StudioIcon name="fa-file-lines" /> {releases.length} Releases</span>
            <span><StudioIcon name="fa-calendar" /> {getSeasonDateRange(releases)}</span>
          </div>
          <div className="creator-publishing__calendar-controls">
            <label className="studio-form-row creator-publishing__season-start">
              <span className="studio-field-head">
                <span className="studio-field-label">
                  <StudioIcon name="fa-calendar-day" /> First Release Date
                </span>
              </span>
              <input
                type="date"
                value={seasonStart}
                onChange={(event) => onSeasonStartChange(event.target.value)}
              />
            </label>
            <StudioButton icon="fa-calendar-plus" onClick={onApplyCadence}>
              Auto-date Season
            </StudioButton>
            <StudioButton icon="fa-plus" onClick={onAddRelease}>
              Add Release
            </StudioButton>
          </div>
        </div>
      </section>

      <div className="creator-publishing__calendar-board">
        {[1, 2, 3].map((week) => {
          const weekReleases = releases
            .filter((release) => release.week === week)
            .sort((left, right) =>
              String(left.publishDate || "").localeCompare(
                String(right.publishDate || ""),
              ),
            );
          const meta = PUBLISHING_WEEK_META[week];

          return (
            <section
              className="creator-publishing__week studio-panel cruor-ui-panel-surface"
              key={week}
            >
              <header className="creator-publishing__week-heading">
                <span>
                  Week {week} · {getWeekDateRange(weekReleases)}
                </span>
                <h3>{meta.title}</h3>
                <p>{meta.description}</p>
              </header>
              <div className="creator-publishing__week-releases">
                {weekReleases.map((release) => (
                  <ReleaseCard
                    isPublished={Boolean(published[release.id])}
                    key={release.id}
                    onEdit={onEditRelease}
                    onOpenSimulator={onOpenSimulator}
                    onTogglePublished={onTogglePublished}
                    release={release}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
