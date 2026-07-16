import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocationOutputWorkspace } from "./LocationOutputWorkspace.jsx";

const DOCUMENT = {
  schemaVersion: "dark-places-document-v1",
  meta: {
    title: "The Breathing Ossuary",
    context: "Crypt",
    horror: ["Religious Horror"],
    sourceAnchors: ["Sedlec Ossuary"],
  },
  overview: {
    premise: [
      {
        id: "premise-1",
        kind: "premise",
        title: "Location Premise",
        text: "The crypt continues a prayer through the arrangement of its dead.",
      },
    ],
    sensory: [],
    visibleAnomalies: [],
    rewardConsequences: [],
    atTheTable: [
      {
        id: "table-1",
        kind: "note",
        title: "Pressure",
        text: "Every loud sound advances the litany.",
      },
    ],
  },
  map: {
    counts: { rooms: 1, connections: 0, levels: 1 },
    legend: [],
  },
  rooms: [
    {
      id: "room-a",
      sourceRegionId: "room-a",
      generatedRoomId: "generated-a",
      number: 1,
      name: "Bone-Lit Vestibule",
      role: "Entrance",
      level: 0,
      shape: "rect",
      readiness: {
        status: "partial",
        missingSlotIds: ["clue"],
        missingSlotLabels: ["Disturbing Clue"],
      },
      readAloud: [
        {
          id: "read-a",
          kind: "readAloud",
          title: "Read-Aloud",
          text: "Candlelight catches on hundreds of polished teeth.",
        },
      ],
      immediateImpressions: {
        sensory: [
          { id: "sensory-a", kind: "sensory", title: "Bone Dust", text: "Dry mineral dust coats the tongue." },
        ],
        features: [
          { id: "feature-a", kind: "feature", title: "Skull Arch", text: "A polished skull arch frames the eastern wall." },
        ],
        interactions: [
          { id: "interaction-a", kind: "interaction", title: "Rotating Skulls", text: "The skulls turn within hidden sockets." },
        ],
      },
      hazards: [
        {
          id: "hazard-a",
          kind: "hazard",
          subtype: "trap",
          title: "Weight of the Dead",
          text: "The floor gives way beneath sudden movement.",
          mechanics: "A creature crossing quickly must make a Dexterity saving throw or fall Prone.",
          counterplay: "Move slowly along the dustless edge.",
          narrative: "A hairline seam and quiet bone clicks telegraph the danger.",
        },
      ],
      clues: [
        {
          id: "clue-a",
          kind: "clue",
          title: "Tomorrow's Skull",
          text: "One skull carries tomorrow's date.",
          mechanics: "The date identifies the cult's next intended burial.",
          narrative: "Point this toward the ritual clock.",
        },
      ],
      encounterTwists: [
        {
          id: "twist-a",
          kind: "encounterTwist",
          title: "Reliquary Alarm Choir",
          text: "Every skull begins clicking when the reliquary opens.",
          mechanics: "Nearby enemies are alerted unless the sound is muffled.",
          narrative: "Escalate the clicking at the end of each round.",
        },
      ],
      secrets: [
        {
          id: "secret-a",
          kind: "secret",
          title: "The Missing Name",
          text: "The newest skull belongs to a living noble.",
          mechanics: "Removing it reveals a concealed latch.",
          narrative: "The noble funded the current ritual.",
        },
      ],
      rewards: [
        {
          id: "reward-a",
          kind: "reward",
          title: "Funerary Key",
          text: "A finger bone in a silver tube warms near sealed doors.",
          mechanics: "It opens one reliquary lock.",
          narrative: "The site can later invoke the bearer's name.",
        },
      ],
      connections: [
        {
          connectionId: "edge-a-b",
          targetRoomId: "room-b",
          targetRoomNumber: 2,
          targetRoomName: "Sealed Reliquary",
          kind: "main",
          secret: false,
          locked: true,
          crossLevel: true,
          levelDelta: -1,
        },
      ],
    },
  ],
  readiness: {
    incompleteRooms: [
      {
        roomId: "room-a",
        roomNumber: 1,
        roomName: "Bone-Lit Vestibule",
      },
    ],
  },
};

const BASE_PROPS = {
  documentModel: DOCUMENT,
  exportBundle: {
    title: DOCUMENT.meta.title,
  },
  generatedMapPreview: null,
};

describe("LocationOutputWorkspace", () => {
  it("renders the final-output outline and overview as the primary surface", () => {
    const html = renderToStaticMarkup(
      <LocationOutputWorkspace {...BASE_PROPS} />,
    );

    expect(html).toContain('data-testid="dark-places-final-output"');
    expect(html).toContain("cruor-composer-stage");
    expect(html).toContain("location-composer__stage");
    expect(html).toContain("location-map-stage has-live-preview is-simple-surface is-map-synced location-map-stage--preview");
    expect(html).toContain('data-location-map-surface="preview"');
    expect(html).toContain('data-map-grid-visible="true"');
    expect(html).toContain("location-map-stage__center");
    expect(html).toContain("cruor-composer-control");
    expect(html).toContain("cruor-composer-rail--info");
    expect(html).toContain("cruor-composer-collapsible-section");
    expect(html).toContain("cruor-composer-sidebar-block");
    expect(html).toContain("location-output-details-rail");
    expect(html).toContain("location-output-document-stage");
    expect(html).toContain("location-output-map-preview");
    expect(html).not.toContain("location-output-map-panel");
    expect((html.match(/cruor-composer-rail--right/g) || []).length).toBe(1);
    expect(html).toContain("location-output-details-rail location-composer__rail location-composer__rail--right");
    expect(html).toContain("cruor-tool-content-inner");
    expect(html).toContain("cruor-tool-copy__title");
    expect(html).not.toContain("location-output-document-hero");
    expect(html).toContain("location-output-entry__line");
    expect(html).toContain("Location Premise.");
    expect(html).toContain("Pressure.");
    expect(html).not.toContain("location-output-block cruor-composer-sidebar-block");
    expect(html).not.toContain("location-output-main__toolbar");
    expect(html).not.toContain("location-output-actions");
    expect(html).not.toContain("cruor-dropdown-menu--context");
    expect(html).not.toContain("<details");
    expect(html).not.toContain("Current Export");
    expect(html).toContain("File &amp; Framing");
    expect(html).toContain("File Name");
    expect(html).toContain("the-breathing-ossuary-gm-map.svg");
    expect(html).toContain("Map Style");
    expect(html).toContain("Layers");
    expect(html).toContain('data-testid="dark-places-map-export-download"');
    expect(html).toContain("Final Output");
    expect(html).toContain("Overview");
    expect(html).toContain("At the Table");
    expect(html).toContain("Export Settings");
    expect(html).toContain('data-map-export-open="false"');
    expect(html).toContain("Bone-Lit Vestibule");
    expect(html).toContain("The crypt continues a prayer");
    expect(html).not.toContain("Data (.json)");
  });

  it("renders a selected room with read-aloud, hazard, missing content, and edit action", () => {
    const html = renderToStaticMarkup(
      <LocationOutputWorkspace
        {...BASE_PROPS}
        initialSectionId="room:room-a"
      />,
    );

    expect(html).toContain('data-testid="dark-places-output-room"');
    expect(html).toContain("Candlelight catches on hundreds of polished teeth.");
    expect(html).toContain("Immediate Impressions");
    expect(html).toContain("Hazards &amp; Traps");
    expect(html).toContain("Weight of the Dead");
    expect(html).toContain("What They Notice");
    expect(html).toContain("Resolution");
    expect(html).toContain("Avoid or Disable");
    expect(html).toContain("Disturbing Clues");
    expect(html).toContain("What It Reveals");
    expect(html).toContain("Encounter Twists");
    expect(html).toContain("What Changes");
    expect(html).toContain("Secrets — GM Only");
    expect(html).toContain("Reward / Consequence");
    expect(html).toContain("GM Guidance");
    expect(html).toContain("Sealed Reliquary");
    expect(html).toContain("Locked");
    expect(html).toContain("Down 1 level");
    expect(html).not.toContain("Missing Disturbing Clue");
    expect(html).not.toContain("Room Render");
    expect(html).toContain("Edit Room");
    expect(html).toContain("cruor-square-icon-button");
    expect(html).toContain("cruor-composer-control");
    expect(html).not.toContain("What Is Here");
  });

  it("removes the redundant output toolbar and its legacy format actions", () => {
    const html = renderToStaticMarkup(
      <LocationOutputWorkspace {...BASE_PROPS} />,
    );

    expect(html).not.toContain("location-output-main__toolbar");
    expect(html).not.toContain("Review Missing");
    expect(html).not.toContain("More export formats");
    expect(html).not.toContain("Room Key</span>");
    expect(html).not.toContain("Copy Table Text");
  });

  it("opens the Map Export Studio with presets, file settings, and layer controls", () => {
    const html = renderToStaticMarkup(
      <LocationOutputWorkspace {...BASE_PROPS} initialSectionId="export" />,
    );

    expect(html).toContain('data-map-export-open="true"');
    expect((html.match(/cruor-composer-rail--right/g) || []).length).toBe(1);
    expect(html).toContain("location-map-export-studio");
    expect(html).toContain("Export Settings");
    expect(html).toContain("Map Export");
    expect(html).toContain("GM");
    expect(html).toContain("Player");
    expect(html).toContain("Print");
    expect(html).toContain("Export Profile");
    expect(html).toContain("File Format");
    expect(html).not.toContain("PNG resolution");
    expect(html).toContain("Content Bounds");
    expect(html).toContain("Room numbers");
    expect(html).toContain("Hide secret routes");
    expect(html).toContain("cruor-tool-content-inner");
    expect(html).toContain("cruor-tool-copy");
    expect(html).toContain("cruor-tool-summary");
    expect(html).toContain("cruor-tool-feature-block");
    expect(html).toContain("cruor-tool-option");
    expect(html).not.toContain("cruor-tool-actions");
    expect(html).toContain("cruor-tool-button--primary");
    expect(html).not.toContain("location-map-frame-rail");
    expect(html).toContain('data-testid="dark-places-map-export-studio"');
    expect(html).not.toContain('data-testid="dark-places-output-overview"');
    expect(html).toContain("location-output-document-stage");
    expect(html).toContain("location-output-map-preview");
    expect(html).not.toContain("cruor-composer-rail-card--hero");
    expect(html).toContain("cruor-composer-fact-grid");
    expect(html).toContain("Profile");
    expect(html).toContain("Format");
    expect(html).toContain("Grid Style");
    expect(html).toContain("Secret Routes");
    expect(html.indexOf('data-testid="dark-places-map-export-studio"')).toBeLessThan(
      html.indexOf("location-output-details-rail"),
    );
    expect(html).not.toContain("location-map-export-option");
    expect(html).not.toContain("location-map-export-layer");
    expect(html).not.toContain("location-map-export-studio__header");
    expect(html).not.toContain("location-map-export-card cruor-composer-panel");
    expect(html).toContain('data-testid="dark-places-map-export-download"');
    expect(html.indexOf('data-testid="dark-places-map-export-download"')).toBeGreaterThan(
      html.indexOf("location-output-map-preview__frame"),
    );
    expect(html.indexOf('data-testid="dark-places-map-export-download"')).toBeLessThan(
      html.indexOf("File &amp; Framing"),
    );
    expect(html).toContain("File Name");
    expect(html).toContain("the-breathing-ossuary-gm-map.svg");
  });
  it("renders the enlarged map in a modal without adding another rail", () => {
    const html = renderToStaticMarkup(
      <LocationOutputWorkspace
        {...BASE_PROPS}
        initialMapPreviewOpen
      />,
    );

    expect(html).toContain('data-testid="dark-places-map-preview-modal"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("Open enlarged location map");
    expect((html.match(/cruor-composer-rail--right/g) || []).length).toBe(1);
  });

});
