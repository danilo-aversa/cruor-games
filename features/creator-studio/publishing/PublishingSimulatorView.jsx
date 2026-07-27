import { useEffect, useMemo, useState } from "react";
import {
  StudioIcon,
  StudioIconButton,
  StudioTab,
  StudioTabs,
} from "../../inspiration-studio/ui/index.js";
import {
  ENGAGEMENT_HOURS,
  PUBLISHING_ARCHIVE_ITEMS,
} from "./publishing.data.js";
import {
  buildEngagementForecast,
  formatCalendarDate,
  getCaptionText,
} from "./publishing.model.js";

const PLATFORM_TABS = [
  { id: "instagram", icon: "fa-images", label: "Instagram Post" },
  { id: "profile", icon: "fa-table-cells", label: "Instagram Profile" },
  { id: "facebook", icon: "fa-newspaper", label: "Facebook Post" },
];

function ReleaseIndex({ activeReleaseId, collapsed, onCollapse, onSelect, releases }) {
  return (
    <aside
      className={`creator-publishing__release-index studio-panel cruor-ui-panel-surface${collapsed ? " is-collapsed" : ""}`}
      aria-label="Season releases"
      aria-expanded={!collapsed}
      role={collapsed ? "button" : undefined}
      tabIndex={collapsed ? 0 : undefined}
      onClick={collapsed ? () => onCollapse(false) : undefined}
      onKeyDown={collapsed ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onCollapse(false);
        }
      } : undefined}
    >
      <div className="studio-library-panel__topline">
        <span className="studio-library-panel__title">
          <StudioIcon name="fa-list" />
          <span>Season Releases</span>
        </span>
        {!collapsed ? (
          <StudioIconButton
            className="studio-library-panel__collapse"
            icon="fa-chevron-left"
            label="Collapse season releases"
            onClick={() => onCollapse(true)}
          />
        ) : null}
      </div>

      {!collapsed ? (
        <div className="studio-library-list" role="list">
          {releases.map((release) => (
            <button
              className={release.id === activeReleaseId ? "is-active" : ""}
              key={release.id}
              type="button"
              title={release.title}
              onClick={() => onSelect(release.id)}
            >
              <span className="studio-list-button__topline">
                <strong>{release.title}</strong>
                <em><StudioIcon name="fa-file-lines" /></em>
              </span>
              <span>{formatCalendarDate(release.publishDate)} · {release.type}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="studio-library-panel__collapsed" aria-hidden="true">
          <StudioIcon name="fa-file-lines" />
          <span>{releases.length}</span>
        </div>
      )}
      {collapsed ? (
        <span className="studio-collapsed-rail-label" aria-hidden="true">
          Season Releases
        </span>
      ) : null}
    </aside>
  );
}

function SlideArtwork({ release, slide, muted = false }) {
  return (
    <>
      <span
        className="creator-publishing__slide-image"
        style={{ backgroundImage: `url("${release.image.fileUrl}")` }}
      />
      <span className="creator-publishing__slide-colour" />
      <span className={`creator-publishing__slide-shade${muted ? " is-muted" : ""}`} />
      <span className="creator-publishing__slide-copy">
        <small>{slide[0]}</small>
        <strong>{slide[1]}</strong>
        <span dangerouslySetInnerHTML={{ __html: slide[2] }} />
        <em><span>Cruor Games</span><span>{slide[3]}</span></em>
      </span>
    </>
  );
}

function InstagramPostPreview({ release }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const caption = getCaptionText(release.caption);

  useEffect(() => {
    setSlideIndex(0);
    setCaptionExpanded(false);
  }, [release.id]);

  function moveSlide(direction) {
    setSlideIndex((current) =>
      Math.max(0, Math.min(release.slides.length - 1, current + direction)),
    );
  }

  return (
    <div className="creator-publishing__phone" aria-label="Instagram post preview">
      <div className="creator-publishing__phone-screen">
        <div className="creator-publishing__phone-status" aria-hidden="true">
          <span>9:41</span>
          <i />
          <span><StudioIcon name="fa-signal" /><StudioIcon name="fa-wifi" /><StudioIcon name="fa-battery-three-quarters" /></span>
        </div>
        <div className="creator-publishing__instagram-bar" aria-hidden="true">
          <strong>Instagram</strong>
          <span><StudioIcon name="fa-heart" /><StudioIcon name="fa-paper-plane" /></span>
        </div>
        <article className="creator-publishing__instagram-post">
          <header className="creator-publishing__social-profile-line">
            <span className="creator-publishing__avatar">CG</span>
            <span><strong>cruorgames</strong><small>Abyssal Hymn · Cruor Archive</small></span>
            <StudioIcon name="fa-ellipsis" />
          </header>
          <div
            className="creator-publishing__carousel"
            role="group"
            tabIndex={0}
            aria-label="Instagram carousel preview"
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") moveSlide(-1);
              if (event.key === "ArrowRight") moveSlide(1);
            }}
          >
            <div
              className="creator-publishing__carousel-track"
              style={{ transform: `translateX(-${slideIndex * 100}%)` }}
            >
              {release.slides.map((slide, index) => (
                <section className="creator-publishing__instagram-slide" key={`${release.id}-${index}`}>
                  <SlideArtwork release={release} slide={slide} muted={index > 0} />
                </section>
              ))}
            </div>
            <span className="creator-publishing__carousel-counter">
              {slideIndex + 1}/{release.slides.length}
            </span>
            <button
              className="creator-publishing__carousel-control is-previous"
              type="button"
              aria-label="Previous slide"
              disabled={slideIndex === 0}
              onClick={() => moveSlide(-1)}
            >
              <StudioIcon name="fa-chevron-left" />
            </button>
            <button
              className="creator-publishing__carousel-control is-next"
              type="button"
              aria-label="Next slide"
              disabled={slideIndex === release.slides.length - 1}
              onClick={() => moveSlide(1)}
            >
              <StudioIcon name="fa-chevron-right" />
            </button>
          </div>
          <div className="creator-publishing__instagram-actions" aria-hidden="true">
            <span><StudioIcon name="fa-heart" /><StudioIcon name="fa-comment" /><StudioIcon name="fa-paper-plane" /></span>
            <span className="creator-publishing__carousel-dots">
              {release.slides.map((_, index) => (
                <i className={index === slideIndex ? "is-active" : ""} key={index} />
              ))}
            </span>
            <StudioIcon name="fa-bookmark" />
          </div>
          <div className="creator-publishing__instagram-copy">
            <strong>1,284 likes</strong>
            <p className={captionExpanded ? "is-expanded" : ""}>
              <b>cruorgames</b> {caption}
            </p>
            {caption.length > 105 ? (
              <button type="button" onClick={() => setCaptionExpanded((value) => !value)}>
                {captionExpanded ? "less" : "more"}
              </button>
            ) : null}
            <small>View all 24 comments</small>
            <small>2 hours ago</small>
          </div>
        </article>
        <nav className="creator-publishing__instagram-nav" aria-hidden="true">
          <StudioIcon name="fa-house" />
          <StudioIcon name="fa-magnifying-glass" />
          <StudioIcon name="fa-square-plus" />
          <StudioIcon name="fa-clapperboard" />
          <span className="creator-publishing__avatar">CG</span>
        </nav>
      </div>
    </div>
  );
}

function ProfileShell({ releases }) {
  const planned = [...releases].reverse();
  const items = [
    ...planned.map((release, index) => ({
      id: release.id,
      label: `Towers of Silence · W${release.week}`,
      release,
      title: release.title,
      position: ["center 42%", "58% 42%", "42% 38%", "center 52%", "64% 48%", "38% 46%", "center 34%", "54% 58%", "44% 50%"][index % 9],
    })),
    ...PUBLISHING_ARCHIVE_ITEMS.map((item) => ({ ...item, archive: true, id: `archive-${item.mark}` })),
  ];

  return (
    <div className="creator-publishing__profile-shell">
      <header className="creator-publishing__profile-topbar">
        <strong>cruorgames</strong>
        <span><StudioIcon name="fa-square-plus" /><StudioIcon name="fa-bars" /></span>
      </header>
      <section className="creator-publishing__profile-header">
        <span className="creator-publishing__profile-avatar">CG</span>
        <div>
          <h3>cruorgames</h3>
          <div className="creator-publishing__profile-stats">
            <span><strong>84</strong> posts</span>
            <span><strong>2,418</strong> followers</span>
            <span><strong>183</strong> following</span>
          </div>
          <p><strong>Cruor Games</strong><br />Human-written dark fantasy tools and research for 5E creators.<br />Inspirations · Dark Places · Terrifying Monsters</p>
        </div>
      </section>
      <div className="creator-publishing__profile-highlights" aria-hidden="true">
        {[
          ["fa-book-skull", "Inspirations"],
          ["fa-dungeon", "Dark Places"],
          ["fa-spider", "Monsters"],
          ["fa-hammer", "Builds"],
          ["fa-box-archive", "Archive"],
        ].map(([icon, label]) => (
          <span key={label}><i><StudioIcon name={icon} /></i><small>{label}</small></span>
        ))}
      </div>
      <div className="creator-publishing__profile-tabs" aria-hidden="true">
        <StudioIcon name="fa-table-cells" />
        <StudioIcon name="fa-clapperboard" />
        <StudioIcon name="fa-id-badge" />
      </div>
      <div className="creator-publishing__profile-grid">
        {items.map((item) => (
          <article
            className={`creator-publishing__profile-tile${item.archive ? " is-archive" : ""}`}
            key={item.id}
            style={item.release ? { backgroundImage: `url("${item.release.image.fileUrl}")`, backgroundPosition: item.position } : undefined}
          >
            <span />
            <small>{item.label}</small>
            <strong>{item.title}</strong>
            {item.archive ? <em>{item.mark}</em> : <StudioIcon name="fa-clone" />}
          </article>
        ))}
      </div>
    </div>
  );
}

function InstagramProfilePreview({ releases }) {
  const [mode, setMode] = useState("mobile");

  return (
    <section className={`creator-publishing__profile-preview is-${mode}`}>
      <StudioTabs className="creator-publishing__profile-mode-tabs" label="Instagram profile viewport">
        <StudioTab active={mode === "mobile"} icon="fa-mobile-screen" label="Mobile · 3 Columns" onClick={() => setMode("mobile")} />
        <StudioTab active={mode === "desktop"} icon="fa-display" label="Desktop · 5 Columns" onClick={() => setMode("desktop")} />
      </StudioTabs>
      {mode === "mobile" ? (
        <div className="creator-publishing__phone creator-publishing__profile-phone">
          <div className="creator-publishing__phone-screen">
            <ProfileShell releases={releases} />
          </div>
        </div>
      ) : (
        <div className="creator-publishing__browser">
          <header aria-hidden="true"><span><i /><i /><i /></span><strong>instagram.com/cruorgames</strong><StudioIcon name="fa-ellipsis-vertical" /></header>
          <ProfileShell releases={releases} />
        </div>
      )}
    </section>
  );
}

function FacebookPreview({ release }) {
  return (
    <article className="creator-publishing__facebook-preview cruor-ui-card-surface">
      <header className="creator-publishing__social-profile-line">
        <span className="creator-publishing__avatar">CG</span>
        <span><strong>Cruor Games</strong><small>Public · Page post</small></span>
        <StudioIcon name="fa-ellipsis" />
      </header>
      <p>{release.facebookCopy}</p>
      <div className="creator-publishing__facebook-artwork">
        <SlideArtwork release={release} slide={["From the Cruor Archive", release.title, "", "Cruor Games"]} />
      </div>
      <footer><span>Like</span><span>Comment</span><span>Share</span></footer>
    </article>
  );
}

function AudienceActivity({ onTimeChange, platform, release }) {
  const forecast = useMemo(
    () => buildEngagementForecast(release, platform),
    [platform, release],
  );
  const plannedTime = release.publishTime || forecast.bestTime;
  const plannedIndex = Math.max(0, ENGAGEMENT_HOURS.indexOf(plannedTime));

  return (
    <aside className="creator-publishing__analytics-rail" aria-label="Audience activity">
      <section className="studio-panel cruor-ui-panel-surface">
        <div className="creator-publishing__analytics-heading">
          <span><StudioIcon name="fa-chart-column" /> Audience Activity</span>
          <small>{platform === "facebook" ? "Facebook" : "Instagram"} · {formatCalendarDate(release.publishDate)}</small>
        </div>
        <div className="creator-publishing__engagement-chart">
          {ENGAGEMENT_HOURS.map((hour, index) => (
            <button
              className={`${index === forecast.bestIndex ? "is-recommended" : ""}${hour === plannedTime ? " is-planned" : ""}`}
              key={hour}
              type="button"
              aria-label={`${hour}: activity ${forecast.values[index]} out of 100`}
              onClick={() => onTimeChange(hour)}
            >
              <span><i style={{ height: `${forecast.values[index]}%` }} /></span>
              <small>{hour.slice(0, 2)}</small>
            </button>
          ))}
        </div>
        <dl className="creator-publishing__analytics-metrics">
          <div><dt>Recommended</dt><dd>{forecast.bestTime}</dd></div>
          <div><dt>Planned</dt><dd>{plannedTime}</dd></div>
          <div><dt>Forecast</dt><dd>{forecast.values[plannedIndex] ?? forecast.values[forecast.bestIndex]}/100</dd></div>
        </dl>
        <p className="studio-empty-state">Illustrative forecast. Replace it with connected account analytics when integrations are available.</p>
      </section>
    </aside>
  );
}

export default function PublishingSimulatorView({
  activeReleaseId,
  onActiveReleaseChange,
  onReleaseTimeChange,
  releases,
}) {
  const [platform, setPlatform] = useState("instagram");
  const [releaseIndexCollapsed, setReleaseIndexCollapsed] = useState(false);
  const release = releases.find((candidate) => candidate.id === activeReleaseId) || releases[0];

  if (!release) return null;

  return (
    <section className="creator-publishing__view creator-publishing__simulator-view" aria-label="Post and profile simulator">
      <div
        className={`creator-publishing__simulator-layout${releaseIndexCollapsed ? " is-library-collapsed" : ""}`}
      >
        <ReleaseIndex
          activeReleaseId={release.id}
          collapsed={releaseIndexCollapsed}
          onCollapse={setReleaseIndexCollapsed}
          onSelect={onActiveReleaseChange}
          releases={releases}
        />

        <main className="creator-publishing__simulator-workspace">
          <div className="creator-publishing__preview-stage">
            {platform === "instagram" ? <InstagramPostPreview release={release} /> : null}
            {platform === "profile" ? <InstagramProfilePreview releases={releases} /> : null}
            {platform === "facebook" ? <FacebookPreview release={release} /> : null}
          </div>

          <StudioTabs
            className="studio-component-tabs studio-component-tabs--vertical creator-publishing__platform-tabs"
            label="Platform preview"
            orientation="vertical"
          >
            {PLATFORM_TABS.map((item) => (
              <StudioTab
                active={platform === item.id}
                hint={item.label}
                icon={item.icon}
                key={item.id}
                label={item.label}
                onClick={() => setPlatform(item.id)}
              />
            ))}
          </StudioTabs>
        </main>

        <AudienceActivity
          onTimeChange={(time) => onReleaseTimeChange(release.id, time)}
          platform={platform}
          release={release}
        />
      </div>
    </section>
  );
}
