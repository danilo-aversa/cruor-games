import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeContentPackV0_2,
  normalizeSemanticProvenance,
} from "../contracts/semantic/index.js";
import { DECOMPOSITION_MONSTER_GRAFT_V2_DEFINITIONS } from "./decomposition-monster-grafts-v2.js";

export const DECOMPOSITION_SEMANTIC_V2_PACK_ID = "decomposition-semantic-v2";
export const DECOMPOSITION_SEMANTIC_V2_MODULE_ID = "decomposition";
export const DECOMPOSITION_SEMANTIC_V2_SOURCE_ANCHOR_ID = "decomposition";

const REVIEW_VERSION = "phase8-decomposition-editorial-revision-v2";

function createProvenance({
  legacyIds = [],
  relation = "derived",
  note = "Editorially re-authored from the frozen Decomposition module and its structured forensic-decay design vocabulary.",
  migrationNote = "AI-assisted editorial revision. The source dossier, fantasy-facing terminology, exploration/combat cadence, and Stage 4 countdown require explicit human approval before publication.",
} = {}) {
  return normalizeSemanticProvenance({
    sources: [
      {
        sourceAnchorId: DECOMPOSITION_SEMANTIC_V2_SOURCE_ANCHOR_ID,
        relation,
        note,
      },
    ],
    legacyIds,
    migration: {
      fromSchema: "legacy-inspiration-module-v1",
      method: "editorially-migrated",
      editorialDecision: "needs-revision",
      reviewVersion: REVIEW_VERSION,
      note: migrationNote,
    },
  });
}

const MODULE_PROVENANCE = createProvenance({
  legacyIds: ["decomposition", "inspiration-decomposition", "Decomposition"],
  relation: "editorial-constraint",
  note: "The biological process is retained as source context; the Second Autopsy, accelerated decay clock, and all supernatural location events are fictional game content.",
});

function createDarkPlacesComponent({
  id,
  title,
  semanticType,
  semantic,
  legacyIds,
  motifs = [],
  generation = {},
}) {
  const provenance = createProvenance({ legacyIds });
  return {
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
    id,
    title,
    status: "in-review",
    contentType: "semantic-location-component",
    semanticType,
    workflows: ["darken-location"],
    slots: [],
    sourceAnchors: [DECOMPOSITION_SEMANTIC_V2_SOURCE_ANCHOR_ID],
    sourceTypes: ["Biological Process", "Forensic Science"],
    themes: [
      "corpse transformation",
      "contaminated evidence",
      "time made physical",
    ],
    motifs,
    horror: ["Body Horror", "Disease Horror"],
    contexts: ["mortuary", "crypt", "archive"],
    compatibility: {
      capabilities: ["dark-places"],
      excludedCapabilities: ["monster-composer"],
    },
    generation: { phase: 8, ...generation },
    semantic: { ...semantic, provenance },
    provenance,
  };
}

const MONSTER_RULE_CONVENTION_NOTES = Object.freeze({
  "dangerously-unstable":
    "Retained as a Cruor-specific setpiece convention: the 5-in-6 self-detonation and nested 40/80-foot blast radii are intentionally exceptional and do not define the default death-burst template.",
  "head-weak-spot":
    "Retained as a Cruor-specific called-shot exception for this graft. The -5 attack penalty and automatic critical hit do not establish a general called-shot subsystem for other creatures.",
});

function createMonsterComponent(definition) {
  const ruleConventionNote =
    MONSTER_RULE_CONVENTION_NOTES[definition.id] ||
    "The canonical v2 component preserves the authored Monster graft identity, slot, frame fit, structured rules, mechanics text, and counterplay without silently generalizing it into a site-wide rule convention.";
  const provenance = createProvenance({
    legacyIds: [definition.id],
    relation: "editorial-constraint",
    note: ruleConventionNote,
    migrationNote: `${ruleConventionNote} Human publication approval remains required.`,
  });
  return {
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
    id: definition.id,
    title: definition.title,
    status: "in-review",
    contentType: "monster-graft",
    semanticType: "monster-graft",
    workflows: ["monster-composer"],
    slots: [definition.slot],
    sourceAnchors: [DECOMPOSITION_SEMANTIC_V2_SOURCE_ANCHOR_ID],
    sourceTypes: ["Biological Process", "Forensic Science"],
    themes: ["corpse transformation", "physical decay"],
    motifs: ["bloating", "softening", "rupture", "grave wax"],
    horror: ["Body Horror", "Disease Horror"],
    contexts: ["undead", "aberration", "decay"],
    compatibility: {
      capabilities: ["monster-composer"],
      excludedCapabilities: [],
    },
    generation: {
      phase: 8,
      monster: { graftId: definition.id, slot: definition.slot },
    },
    semantic: {
      summary: definition.summary,
      tableText: definition.mechanics,
      mechanics: { text: definition.mechanics },
      narrative: "",
      details: {
        monster: definition.monster,
        counterplay: definition.counterplay,
      },
    },
    provenance,
  };
}

const DARK_PLACES_COMPONENTS = [
  createDarkPlacesComponent({
    id: "decomposition-place-identity",
    title: "The Second Autopsy",
    semanticType: "place-identity",
    legacyIds: ["cave-breathing", "places-premise-breathing-burial"],
    motifs: ["sealed mortuary", "dated body tags", "lime chambers"],
    generation: { primary: true },
    semantic: {
      originalPurpose:
        "A subterranean mortuary archive received unidentified dead, documented ordinary postmortem change, and used lime rooms, drainage tables, and sealed ledgers to return evidence to families and magistrates.",
      originalUsers: [
        "death examiners and anatomists",
        "mortuary attendants",
        "gravediggers and court clerks",
      ],
      historicalChange:
        "During a season of mass death, officials demanded faster answers. The staff divided the mortuary into timed chambers and began forcing bodies through controlled stages of decay, then concealed contradictory results inside a second set of ledgers.",
      horrorTruth:
        "The abandoned mortuary now treats decay as a schedule rather than a consequence: every sealed chamber advances matter toward its assigned stage, including living tissue, while one impossible corpse moves backward through the record.",
      currentFunction:
        "The mortuary sorts intruders, evidence, food, wood, and flesh into a four-stage decay clock, using vents, warm walls, insects, and soft floors to announce each transition.",
      currentConflict:
        "A body tagged as the mortuary's chief death examiner has become fresher each night, while a living survivor bears the same registry number and is being drawn toward the sealed autopsy chamber.",
      playerEntryPoints: [
        "Recover the second ledger before a patron destroys proof of the forced-decay practice.",
        "Find the living person whose registry number appears on the corpse that is decomposing backward.",
      ],
      stakes: [
        "If Final Processing completes, the mortuary records every living visitor as processed evidence and seals the exits.",
        "If the backward corpse reaches apparent life, it takes the survivor's identity while the survivor assumes the corpse's decay.",
      ],
      toneKeywords: ["clinical", "humid", "incremental", "inevitable"],
    },
  }),
  createDarkPlacesComponent({
    id: "decomposition-site-atmosphere",
    title: "Warm Rooms, Patient Rot",
    semanticType: "site-atmosphere",
    legacyIds: ["wet-knuckles", "warm-iron-sour-milk"],
    motifs: ["sweet wet lime", "warm iron", "pressure behind stone"],
    semantic: {
      signature:
        "The mortuary is warm, damp, and methodical; every room smells like a different hour after death, yet the air never moves in the direction of the vents.",
      manifestations: [
        {
          id: "sweet-lime-breath",
          text: "Sweet wet lime coats the throat immediately after the walls release a slow breath.",
          senses: ["smell", "taste"],
          intensity: "low",
          frequency: "pervasive",
        },
        {
          id: "pulse-behind-plaster",
          text: "A soft pulse travels behind the plaster and pauses beneath any hand placed on the wall.",
          senses: ["touch", "sound"],
          intensity: "medium",
          frequency: "recurring",
        },
        {
          id: "iron-and-sour-milk",
          text: "Warm iron and sour milk rise together wherever the decay clock has advanced.",
          senses: ["smell", "temperature"],
          intensity: "medium",
          frequency: "recurring",
        },
      ],
      exclusions: [
        "constant gore without forensic purpose",
        "generic supernatural cold",
        "decay presented as instantaneous magic",
      ],
      escalationLinks: ["accelerated-decay-clock"],
    },
  }),
  createDarkPlacesComponent({
    id: "accelerated-decay-clock",
    title: "Accelerated Decay Clock",
    semanticType: "global-rule",
    legacyIds: [
      "cave-exhales",
      "places-hazard-gas-bloat-vent",
      "places-twist-bloat-burst-clock",
    ],
    motifs: ["swelling seams", "bloat gas", "four dated stages"],
    semantic: {
      id: "accelerated-decay-clock",
      title: "Accelerated Decay Clock",
      scope: "location",
      category: "pressure-track",
      trigger: {
        events: [
          "open-a-sealed-body-compartment",
          "damage-a-vent-or-warm-wall",
          "remain-in-one-room-for-ten-minutes",
        ],
        timing:
          "Immediately after a listed disturbance; outside combat, also check delay at the end of each ten-minute exploration turn.",
        frequencyLimit:
          "Once per combat round, or once per ten-minute exploration turn.",
      },
      state: { label: "Decay Stage", minimum: 0, maximum: 4, initial: 0 },
      resolution: {
        timing:
          "At the end of each combat round; outside combat, at the end of each ten-minute exploration turn.",
        threshold: 2,
        savingThrow: {
          ability: "Constitution",
          skills: [],
          dc: null,
          scalingKey: "intrusion",
        },
        check: null,
        attackRoll: null,
        effect: {
          damage: "",
          damageType: "poison",
          healing: "",
          conditions: ["poisoned"],
          additionalText:
            "On a failed save, the creature is Poisoned until the end of its next turn; while Final Processing is active at Decay Stage 4, its Speed is also reduced by 10 feet for that duration. On a success, it suffers no condition.",
        },
        duration: "until-end-of-next-turn",
        range: "location",
        area: "every-living-creature-in-a-room-with-an-open-vent-or-disturbed-body",
        frequency:
          "Once per combat round, or once per ten-minute exploration turn, at Decay Stage 2 or higher.",
        actionEconomy: "automatic",
      },
      counterplay: [
        {
          id: "restore-case-order",
          actionCost: "One action in combat, or one minute during exploration.",
          check: {
            ability: "Intelligence",
            skills: ["Investigation", "Medicine"],
            dc: null,
            scalingKey: "intrusion",
          },
          success:
            "Match a body tag to the correct ledger stage and reduce Decay Stage by 1.",
        },
        {
          id: "cross-ventilate",
          actionCost:
            "One minute during exploration, or one action from two creatures at opposed vents in the same combat round.",
          check: null,
          success:
            "Open two opposed vents without rupturing either seal and reduce Decay Stage by 1.",
        },
      ],
      reset: {
        condition:
          "Outside combat, all disturbed compartments are resealed and two opposed vents remain open for one full ten-minute exploration turn. During combat, the track can only be reduced through counterplay; it cannot fully reset.",
        value: 0,
      },
      escalation: [
        {
          at: 2,
          effect:
            "The vents exhale sweet gas. The Constitution save begins at the end of each combat round, or at the end of each ten-minute exploration turn outside combat.",
        },
        {
          at: 4,
          effect:
            "Final Processing begins. Announce a one-step countdown: exits seal and the identity exchange completes at the end of the next combat round or ten-minute exploration turn unless Decay Stage is reduced below 4 or the ledger decision resolves the process. Until then, floors soften, exits constrict, and failed saves also reduce Speed by 10 feet.",
        },
      ],
      gmSummary:
        "Disturbance and delay advance Decay Stage at most once per combat round or exploration turn. At 2+, exposed living creatures save on that cadence; at 4, announce Final Processing and one full round or exploration turn of counterplay before exits seal and the identity exchange completes.",
      playerFacingSigns: [
        "Date stamps darken one stage at a time.",
        "Warm walls pulse toward the nearest open compartment.",
        "Flies abandon the dead and settle on living skin.",
      ],
    },
  }),
  createDarkPlacesComponent({
    id: "decomposition-sign-living-veins",
    title: "Veins Beneath the Wall",
    semanticType: "recurring-sign",
    legacyIds: ["veins-under-rock", "places-sense-warm-wall-pulse"],
    motifs: ["blue wall veins", "warm pulse", "hidden pipes"],
    semantic: {
      id: "decomposition-sign-living-veins",
      description:
        "Branching blue lines beneath lime plaster fill and empty in time with the mortuary's pressure system.",
      placement: {
        frequency: "recurring",
        minimumRooms: 2,
        maximumRooms: 3,
        allowedRoomRoles: ["entrance", "connector", "clue"],
        forbiddenRoomRoles: ["final"],
        preferredFeatures: ["wall", "vent", "pipe"],
      },
      variations: [
        "Blue veins rise beneath the plaster and pulse once toward the deeper rooms.",
        "A warm line in the wall branches around a sealed registry number.",
        "The vein collapses under a hand, then refills on the far side of the door.",
      ],
      interaction: {
        trigger: "A creature follows the pulse through two connected rooms.",
        effect:
          "The line identifies the active vent and the room where Decay Stage will manifest next.",
        counterplay:
          "Cooling the plaster with clean water suppresses the pulse until Decay Stage next increases.",
      },
      revelationLink: "vent-route-revelation",
    },
  }),
  createDarkPlacesComponent({
    id: "decomposition-sign-unclaimed-corpse",
    title: "The Unclaimed Corpse",
    semanticType: "recurring-sign",
    legacyIds: ["moss-filled-corpse", "places-clue-insect-free-corpse"],
    motifs: ["empty eye sockets", "absent insects", "case twine"],
    semantic: {
      id: "decomposition-sign-unclaimed-corpse",
      description:
        "The same unclaimed body appears in several rooms at incompatible stages of decay, always untouched by insects.",
      placement: {
        frequency: "recurring",
        minimumRooms: 2,
        maximumRooms: 3,
        allowedRoomRoles: ["clue", "connector", "final"],
        forbiddenRoomRoles: ["entrance"],
        preferredFeatures: ["slab", "alcove", "shelf"],
      },
      variations: [
        "An insect-free corpse lies under a damp sheet, its case twine freshly knotted.",
        "The same scar appears on a drier body one room deeper, but the tag bears an earlier date.",
        "Moss fills the mouth and sockets while the clean fingertips remain warm.",
      ],
      interaction: {
        trigger:
          "A creature compares two appearances or records the registry number.",
        effect:
          "The repeated scar proves the mortuary is moving one identity through several decay stages.",
        counterplay:
          "Covering the body and leaving its tag attached prevents this sign from advancing Decay Stage.",
      },
      revelationLink: "repeated-body-revelation",
    },
  }),
  createDarkPlacesComponent({
    id: "decomposition-sign-wrong-order",
    title: "Decay in the Wrong Order",
    semanticType: "recurring-sign",
    legacyIds: [
      "wrong-corpse",
      "body-decayed-wrong-order",
      "places-clue-rot-timeline-wall",
    ],
    motifs: ["reversed dates", "fresh tissue", "forensic ledger"],
    semantic: {
      id: "decomposition-sign-wrong-order",
      description:
        "Evidence contradicts the ordinary sequence of postmortem change and points toward a body becoming progressively fresher.",
      placement: {
        frequency: "recurring",
        minimumRooms: 1,
        maximumRooms: 2,
        allowedRoomRoles: ["clue", "secret", "final"],
        forbiddenRoomRoles: ["entrance"],
        preferredFeatures: ["ledger", "slab", "cabinet"],
      },
      variations: [
        "A wall chart lists drying before swelling, with today's date written beside fresh skin.",
        "Old grave wax surrounds a wound that is still bleeding.",
        "The newest ledger entry describes a body that has regained its fingerprints.",
      ],
      interaction: {
        trigger:
          "A creature reconstructs the dates with Medicine or Investigation.",
        effect:
          "The sequence identifies the chief death examiner's body as the one moving backward through decay.",
        counterplay:
          "Correcting a false date in both ledgers prevents the next automatic stage advance.",
      },
      revelationLink: "backward-corpse-revelation",
    },
  }),
  createDarkPlacesComponent({
    id: "decomposition-sign-memory-floor",
    title: "The Floor Remembers Weight",
    semanticType: "recurring-sign",
    legacyIds: [
      "soft-floor-remembers-weight",
      "places-anomaly-softened-relief",
      "places-twist-soft-floor-grapple",
    ],
    motifs: ["soft stone", "retained footprints", "sunken relief"],
    semantic: {
      id: "decomposition-sign-memory-floor",
      description:
        "Lime floors soften like tissue, preserve the weight and posture of earlier occupants, and resist hurried movement.",
      placement: {
        frequency: "recurring",
        minimumRooms: 1,
        maximumRooms: 2,
        allowedRoomRoles: ["connector", "clue", "final"],
        forbiddenRoomRoles: [],
        preferredFeatures: ["threshold", "sump", "relief"],
      },
      variations: [
        "The floor holds a complete kneeling impression with no footprints leading to it.",
        "A softened wall relief sags toward the weight of whoever stands nearest.",
        "Each boot print closes slowly except one set that deepens toward the autopsy room.",
      ],
      interaction: {
        trigger: "A creature crosses at more than half its Speed.",
        effect:
          "The floor clings; on a failed Strength save the creature's Speed becomes 0 until it uses an action to pull free.",
        counterplay:
          "Move slowly along existing impressions or lay a rigid board across the softened surface.",
      },
      revelationLink: "survivor-route-revelation",
    },
  }),
  createDarkPlacesComponent({
    id: "decomposition-sensory-profile",
    title: "Forensic Decay Sensory Profile",
    semanticType: "sensory-profile",
    legacyIds: [
      "places-sense-sweet-wet-lime",
      "places-anomaly-grave-wax-bloom",
      "places-hazard-lime-pocket-collapse",
    ],
    motifs: ["sweet lime", "grave wax", "warm damp pressure"],
    semantic: {
      signature:
        "Warm humidity, sweet lime, and small pressure changes make the mortuary feel like a body proceeding through a measured transformation.",
      variants: {
        sight: [
          "Pale grave wax flowers along the lowest mortar seams.",
          "Dark moisture maps branching veins beneath the limewash.",
          "Date stamps deepen from gray to purple as the room warms.",
          "A clean outline remains wherever insects refuse to land.",
        ],
        sound: [
          "A vent membrane tightens with a wet knuckle-like crack.",
          "Gas moves behind the wall in three slow chambers.",
          "Ledger pages lift and settle with the room's exhalation.",
          "Soft flooring releases a delayed footstep after the walker stops.",
        ],
        smell: [
          "Sweet wet lime gives way to warm iron.",
          "Sour milk and damp paper gather near sealed compartments.",
          "A waxy, fatty odor clings to colder rooms.",
        ],
        touch: [
          "The plaster yields slightly before becoming hard again.",
          "Grave wax softens at body temperature without becoming liquid.",
          "A lime crust breaks over an unexpectedly warm hollow.",
        ],
        taste: [
          "A chalky sweetness dries the back of the tongue.",
          "The next breath tastes faintly of iron and spoiled cream.",
        ],
        temperature: [
          "Heat increases one room at a time toward the autopsy chamber.",
          "An open compartment cools while every living body nearby grows warmer.",
        ],
        proprioception: [
          "The floor seems to hold a foot for half a heartbeat after each step.",
        ],
      },
      intensityTiers: {
        low: [
          "One date stamp darkens at its edge.",
          "Sweet lime briefly catches in the throat.",
        ],
        medium: [
          "Warm lines pulse behind two adjoining walls.",
          "Flies lift from the dead and circle the nearest living face.",
        ],
        high: [
          "Every vent exhales together and the softened floor records all living weight.",
        ],
      },
      roomRoleBias: {
        entrance: ["Clean lime masks a deeper warm-iron odor."],
        threshold: ["The air changes stage across the doorway."],
        ritual: ["Body tags click against their hooks in date order."],
        secret: ["Cold wax seals a second ledger behind the wall."],
        climax: ["The room cycles rapidly through all four odors."],
        connector: ["The wall pulse moves ahead through hidden vents."],
      },
      geometryBias: {
        circular: ["Moisture rings the room like a spreading stain."],
        narrow: ["Warm plaster presses close enough to feel soft."],
        large: ["Several decay odors remain separate across the chamber."],
        vertical: ["Sweet gas gathers below while dry heat climbs."],
        ruined: ["Broken lime exposes wax-filled cavities."],
      },
      exclusions: [
        "generic sewer filth",
        "unrelated carrion",
        "cold ghost mist",
      ],
      repetitionPolicy: {
        exactTextCooldown: "all-rooms",
        senseCooldown: 1,
        allowSignatureRepeat: false,
      },
    },
  }),
  createDarkPlacesComponent({
    id: "decomposition-read-aloud-profile",
    title: "Second Autopsy Read-Aloud Profile",
    semanticType: "read-aloud-profile",
    legacyIds: [
      "location-region-soft-floored-tunnel",
      "location-region-grave-wax-sump",
      "location-region-rot-ledger-archive",
    ],
    motifs: ["drainage tables", "soft floors", "swollen ledgers"],
    semantic: {
      fragments: {
        spatialAnchors: [
          {
            id: "limewashed-corridor",
            text: "A limewashed corridor slopes between drainage channels toward a row of sealed mortuary doors.",
            roomRoles: ["entrance", "connector"],
            geometry: ["narrow"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "sunken-wax-sump",
            text: "The floor sinks into a pale waxy sump ringed by iron examination tables.",
            roomRoles: ["clue", "threshold"],
            visibleFeatures: ["sump"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "swollen-ledger-archive",
            text: "Shelves divide the room into narrow aisles of swollen ledgers and hanging registry tags.",
            roomRoles: ["clue", "secret", "final"],
            visibleFeatures: ["ledger"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "iron-table-drains",
            text: "Iron examination tables stand above a grid of narrow drains cut into the lime floor.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "numbered-mortuary-doors",
            text: "Numbered mortuary doors divide the wall into four carefully dated groups.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "lime-support-columns",
            text: "Thick support columns wear successive coats of limewash, each marked with a different year.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "ceiling-vent-manifold",
            text: "A branching manifold of sealed vents crosses the ceiling and descends behind the walls.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "case-tag-rail",
            text: "A brass rail carries paper registry tags from the entrance toward a closed autopsy chamber.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "sloped-drainage-floor",
            text: "The floor slopes through shallow channels toward a drain sealed with pale wax.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "partitioned-work-room",
            text: "Low tiled partitions divide the chamber into work bays joined by a single central aisle.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
        ],
        sensoryBeats: [
          {
            id: "sweet-wet-lime",
            text: "Sweet wet lime coats the air and dries the back of the tongue.",
            intensity: "low",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "warm-iron-breath",
            text: "A slow breath through the vents carries warm iron and sour milk.",
            roomRoles: ["connector", "clue"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "soft-delayed-step",
            text: "The floor releases each footstep a moment after the walker has stopped.",
            roomRoles: ["threshold", "final"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "ledger-page-breath",
            text: "Ledger pages lift together when the walls exhale.",
            visibleFeatures: ["ledger"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
        ],
        visibleFeatures: [
          {
            id: "four-stage-wall-chart",
            text: "A wall chart divides decay into four dated stages, with several entries overwritten in fresh ink.",
            visibleFeatures: ["chart"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "veins-in-plaster",
            text: "Blue branching lines show through the plaster around one sealed door.",
            visibleFeatures: ["wall", "door"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "insect-free-slab",
            text: "Flies cover every surface except the shrouded body on the central slab.",
            roomRoles: ["clue", "final"],
            visibleFeatures: ["slab"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "case-tag-hooks",
            text: "Brass hooks hold registry tags in neat columns from fresh white to dark purple.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "grave-wax-bloom",
            text: "Pale grave wax blooms from a cracked drain in layered petals.",
            roomRoles: ["connector", "clue"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
        ],
        unsettlingDetails: [
          {
            id: "warm-corpse-fingers",
            text: "The corpse's clean fingertips are warmer than the iron table beneath them.",
            roomRoles: ["clue", "final"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "living-case-number",
            text: "A new tag bears the same registry number as one member of the group.",
            tags: ["gm-only"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "kneeling-floor-print",
            text: "A complete kneeling impression remains in the soft floor without any tracks leading to it.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "backward-date-sequence",
            text: "Successive dates beside the same scar run backward toward today.",
            roomRoles: ["clue", "secret"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "flies-on-living",
            text: "The flies rise from the shelves and settle only on living skin.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
        ],
        motionOrChange: [
          {
            id: "pulse-crosses-room",
            text: "A warm pulse enters through one wall, crosses beneath the floor, and stops at a sealed compartment.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "floor-closes-print",
            text: "One old footprint closes slowly while a fresh impression deepens beside it.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
        ],
        exitsAndDepth: [
          {
            id: "vent-route-downward",
            text: "The vent pulse travels down a service passage and returns from behind a door marked FINAL EXAMINATION.",
            sourceComponentId: "decomposition-read-aloud-profile",
          },
          {
            id: "ledger-aisle-hidden-door",
            text: "The shelving continues across a narrow seam where the floor impressions disappear.",
            tags: ["future-reveal"],
            sourceComponentId: "decomposition-read-aloud-profile",
          },
        ],
      },
      constraints: {
        forbiddenSpoilerTags: ["secret", "solution", "true-identity"],
        maximumSentences: { compact: 2, standard: 4, extended: 6 },
        wordRanges: {
          compact: [20, 35],
          standard: [45, 75],
          extended: [80, 120],
        },
      },
      grammar: {
        openingOrder: ["spatial-anchors", "sensory-beats"],
        allowSecondPerson: false,
        tense: "present",
      },
    },
  }),
  createDarkPlacesComponent({
    id: "decomposition-session-guide",
    title: "Running the Second Autopsy",
    semanticType: "session-guide",
    legacyIds: [
      "dead-screams-one-round",
      "flies-choose-living",
      "black-throat-pearl",
      "places-reward-grave-wax-seal",
    ],
    motifs: ["second ledger", "backward corpse", "visible decay stage"],
    semantic: {
      openingBeat: {
        situation:
          "A survivor arrives with a mortuary registry number cut into an old scar just as the abandoned complex's vents begin operating again.",
        immediateSignal:
          "Flies leave a shrouded corpse and settle on the survivor while a wall chart darkens from Stage 0 to Stage 1.",
        playerDecision:
          "Follow the survivor toward the sealed autopsy chamber, secure the second ledger, or stop to reseal the first opened compartment.",
      },
      objectives: [
        "Identify why the survivor and the backward corpse share a registry number.",
        "Keep the Accelerated Decay Clock below its fourth stage.",
        "Recover the second ledger and decide whether to restore, expose, or destroy the mortuary's process.",
      ],
      alwaysOnRuleIds: ["accelerated-decay-clock"],
      pressureTrackId: "accelerated-decay-clock",
      clueFlow: {
        requiredRevelations: [
          "vent-route-revelation",
          "repeated-body-revelation",
          "backward-corpse-revelation",
        ],
        links: [
          {
            from: "vent-route-revelation",
            to: "repeated-body-revelation",
            condition:
              "The characters follow the warm pulse to two appearances of the unclaimed corpse.",
          },
          {
            from: "repeated-body-revelation",
            to: "backward-corpse-revelation",
            condition:
              "The characters compare the repeated scar with dates in either ledger.",
          },
        ],
        fallbackClues: [
          "The same registry number appears on two bodies at different stages.",
          "A warm wall pulse travels directly to the corrected ledger date.",
        ],
      },
      stallMoves: [
        {
          id: "advance-decay-stage",
          trigger:
            "The table debates after the site presents a clear route or registry number.",
          action:
            "Advance Decay Stage by 1 and move the wall pulse toward the survivor.",
        },
        {
          id: "flies-choose-a-living-host",
          trigger: "The characters ignore the survivor or repeated body.",
          action:
            "The flies form the shared registry number on one living character's skin.",
        },
        {
          id: "second-ledger-page",
          trigger: "A required clue has been missed twice.",
          action:
            "A vent blows loose the corresponding page from behind the archive shelving.",
        },
      ],
      pacing: {
        defaultRoute: [
          "location-region-1",
          "location-region-3",
          "location-region-4",
          "location-region-2",
          "location-region-5",
        ],
        escalationRooms: ["location-region-2", "location-region-5"],
        climaxGuidance:
          "At Decay Stage 4, announce Final Processing. The identity exchange and sealed exits resolve at the end of the next combat round or ten-minute exploration turn unless the characters reduce the track below 4 or settle the ledger decision; keep this countdown in the foreground instead of adding an unrelated combat.",
      },
    },
  }),
];

const MONSTER_COMPONENTS = DECOMPOSITION_MONSTER_GRAFT_V2_DEFINITIONS.map(
  createMonsterComponent,
);

export const DECOMPOSITION_SEMANTIC_V2_PACK = normalizeContentPackV0_2({
  schemaVersion: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
  id: DECOMPOSITION_SEMANTIC_V2_PACK_ID,
  title: "Decomposition Semantic Content Pack",
  version: "0.2.0-phase8-revision2",
  status: "draft",
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: [
    "dark-places",
    "inspiration-archive",
    "monster-composer",
    "decomposition",
    "phase8",
  ],
  modules: [
    {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
      id: DECOMPOSITION_SEMANTIC_V2_MODULE_ID,
      title: "Decomposition",
      packId: DECOMPOSITION_SEMANTIC_V2_PACK_ID,
      status: "in-review",
      locale: "en",
      capabilities: ["inspiration-archive", "dark-places", "monster-composer"],
      sourceAnchor: {
        schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SOURCE_ANCHOR,
        id: DECOMPOSITION_SEMANTIC_V2_SOURCE_ANCHOR_ID,
        title: "Decomposition",
        kind: "other",
        status: "in-review",
        citation: {
          label:
            "Iancu, Dean, and Purcarea (2018), Temperature Influence on Prevailing Necrophagous Diptera and Bacterial Taxa, Journal of Medical Entomology 55(6), doi:10.1093/jme/tjy136",
          url: "https://pubmed.ncbi.nlm.nih.gov/30124880/",
          accessedVersion: `Accessed 2026-07-17; ${REVIEW_VERSION}`,
        },
        summary:
          "A biological-process reference focused on ordinary postmortem stages, including autolysis, putrefaction, bloating, insect activity, tissue softening, drying, and grave wax; it does not present the fictional Second Autopsy as factual forensic science.",
        reliability: "secondary",
        editorialNotes: [
          "Evidence boundary: Iancu, Dean, and Purcarea (2018; doi:10.1093/jme/tjy136) summarize how temperature, humidity, precipitation, geography, injury, insects, and bacteria affect decomposition; the module therefore avoids treating one timeline as universal.",
          "Human-donor caution: Owings et al. (2022; doi:10.3390/insects13100879) document delayed and repeated blow-fly colonization, supporting the module's non-linear framing rather than a fixed biological clock.",
          "Fictional transformation: the self-operating mortuary, synchronized vents, four-stage pressure track, backward corpse, identity exchange, and accelerated effects are original game content.",
          "Rules convention: Dangerously Unstable and Head Weak Spot remain scoped Cruor exceptions, not general death-burst or called-shot rules.",
          "Publication gate: human sign-off and verifiable image provenance are still required.",
        ],
        tags: ["biological-process", "forensic-science", "postmortem-change"],
      },
      inspiration: {
        schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
        id: "inspiration-decomposition-v2",
        slug: "decomposition",
        title: "Decomposition",
        status: "in-review",
        sourceAnchors: [DECOMPOSITION_SEMANTIC_V2_SOURCE_ANCHOR_ID],
        sourceTypes: ["Biological Process", "Forensic Science"],
        themes: [
          "corpse transformation",
          "time made physical",
          "contaminated evidence",
          "loss of bodily boundaries",
        ],
        motifs: [
          "bloating",
          "skin slippage",
          "grave wax",
          "insect succession",
          "gas and seepage",
        ],
        horror: ["Body Horror", "Disease Horror"],
        contexts: ["mortuary", "crypt", "archive", "underground complex"],
        editorial: {
          deck: "Postmortem change becomes a language of pressure, evidence, contamination, and irreversible time, with the physical process kept distinct from the module's supernatural fiction.",
          whatItIs:
            "Decomposition is the set of biological and chemical changes that alter remains after death. Rate and appearance vary with environment, access, treatment, and many other conditions, so the source is used as a vocabulary rather than a universal clock.",
          whyItDisturbs:
            "The process makes mortality gradual and material: familiar human form becomes an environment for pressure, microbes, insects, fluids, drying, and transformation, while identity persists uneasily in records and recognizable details.",
          creativeUses: [
            "Make sequence and contradiction into clues rather than using decay only as decoration.",
            "Use visible stages and environmental controls as a pressure system with concrete counterplay.",
            "Translate swelling, softening, insects, and grave wax into distinct Monster and location behaviors.",
          ],
          cautions: [
            "Do not present a single postmortem timeline as universal forensic fact.",
            "Keep real biological description separate from supernatural acceleration and identity exchange.",
            "Avoid reducing human remains to anonymous gore; preserve evidence of personhood and handling.",
          ],
        },
        media: {
          imageKey: "card-decomposition.webp",
          imageProvider: "local",
          imageAlt:
            "Decomposition inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
          imageCredit:
            "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep the asset unpublished until provenance is verified or the image is replaced.",
          icon: "fa-biohazard",
        },
        tags: [
          "source:decomposition",
          "capability:dark-places",
          "capability:monster-composer",
        ],
        provenance: MODULE_PROVENANCE,
      },
      components: [...DARK_PLACES_COMPONENTS, ...MONSTER_COMPONENTS],
      metadata: {
        author: "Cruor Games",
        revision: 2,
        reviewedAt: "",
        sourceFile:
          "shared/content/content-packs/decomposition-semantic-v2-pack.js",
        capabilityWaivers: [],
      },
      provenance: MODULE_PROVENANCE,
    },
  ],
  metadata: {
    bundled: true,
    registryRole: "semantic-v2-editorial-revision",
    humanApprovalRequired: true,
    retainedLegacyPublicBehavior: true,
    biologicalSourceBoundary:
      "Variable postmortem biology is source context; accelerated stages, the Second Autopsy, and identity exchange are fictional.",
  },
});

export const DECOMPOSITION_SEMANTIC_V2_MODULE =
  DECOMPOSITION_SEMANTIC_V2_PACK.modules[0];
