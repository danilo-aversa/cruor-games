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
    const html = renderToStaticMarkup(<LocationOutputWorkspace {...BASE_PROPS} />);

    expect(html).toContain('data-testid="dark-places-final-output"');
    expect(html).toContain("cruor-composer-frame");
    expect(html).toContain("cruor-composer-stage");
    expect(html).toContain("cruor-composer-control");
    expect(html).toContain("cruor-composer-rail--controls");
    expect(html).toContain("cruor-composer-collapsible-section");
    expect(html).toContain("cruor-composer-sidebar-block");
    expect(html).toContain("location-output-content cruor-composer-panel cruor-scroll-surface");
    expect(html).toContain("location-output-document-hero");
    expect(html).toContain("location-output-entry__line");
    expect(html).toContain("Location Premise.");
    expect(html).toContain("Pressure.");
    expect(html).not.toContain("location-output-block cruor-composer-sidebar-block");
    expect(html).toContain("cruor-dropdown-trigger");
    expect(html).toContain("cruor-dropdown-menu--context");
    expect(html).toContain('role="menu"');
    expect(html).not.toContain("<details");
    expect(html).toContain("Final Output");
    expect(html).toContain("Overview");
    expect(html).toContain("At the Table");
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
    expect(html).toContain("Missing Disturbing Clue");
    expect(html).toContain("Edit Room");
    expect(html).toContain("cruor-square-icon-button");
    expect(html).toContain("cruor-composer-control");
    expect(html).not.toContain("What Is Here");
  });

  it("keeps JSON and session insert behind advanced mode", () => {
    const html = renderToStaticMarkup(
      <LocationOutputWorkspace {...BASE_PROPS} uiMode="advanced" />,
    );

    expect(html).toContain("Session Insert (.txt)");
    expect(html).toContain("Data (.json)");
  });

  it("opens the Map Export Studio with presets, file settings, and layer controls", () => {
    const html = renderToStaticMarkup(
      <LocationOutputWorkspace
        {...BASE_PROPS}
        initialMapExportOpen
      />,
    );

    expect(html).toContain('data-map-export-open="true"');
    expect(html).toContain("Map Export");
    expect(html).toContain("GM");
    expect(html).toContain("Player");
    expect(html).toContain("Print");
    expect(html).toContain("Format");
    expect(html).not.toContain("PNG resolution");
    expect(html).toContain("Content Bounds");
    expect(html).toContain("Room numbers");
    expect(html).toContain("Hide secret routes");
    expect(html).toContain("location-map-export-option");
    expect(html).toContain("location-map-export-layer");
    expect(html).toContain("cruor-square-icon-button");
    expect(html).toContain("cruor-composer-collapsible-section");
    expect(html).toContain("location-map-frame-rail");
    expect(html).toContain("location-frame-control-block");
    expect(html).toContain("location-frame-selector-stack");
    expect(html).toContain("location-frame-field-head");
    expect(html).toContain("location-map-export-studio__header cruor-composer-sidebar-block");
    expect(html).not.toContain("location-map-export-studio__header-copy");
    expect(html).not.toContain("location-map-export-card cruor-composer-panel");
    expect(html).toContain('data-testid="dark-places-map-export-download"');
  });
});
