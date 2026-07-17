import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeContentPackV0_2,
  normalizeSemanticProvenance,
} from "../contracts/semantic/index.js";

export const SEDLEC_OSSUARY_SEMANTIC_V2_PACK_ID = "sedlec-ossuary-semantic-v2";
export const SEDLEC_OSSUARY_SEMANTIC_V2_MODULE_ID = "sedlec-ossuary";
export const SEDLEC_OSSUARY_SOURCE_ANCHOR_ID = "sedlec-ossuary";

const REVIEW_VERSION = "phase3-sedlec-editorial-draft-v1";

function createProvenance({
  legacyIds = [],
  relation = "derived",
  note = "Editorially re-authored from the Sedlec Ossuary project source dossier and the frozen v1 module.",
} = {}) {
  return normalizeSemanticProvenance({
    sources: [
      {
        sourceAnchorId: SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
        relation,
        note,
      },
    ],
    legacyIds,
    migration: {
      fromSchema: "legacy-inspiration-module-v1",
      method: "editorially-migrated",
      editorialDecision: "approved",
      reviewVersion: REVIEW_VERSION,
      note: "Historical framing, fictional transformation, and table mechanics approved by Danilo on 2026-07-16. Image provenance remains a separate publication blocker.",
    },
  });
}

const MODULE_PROVENANCE = createProvenance({
  legacyIds: ["sedlec-ossuary", "inspiration-sedlec-ossuary"],
  relation: "editorial-constraint",
  note: "Phase 3 separates historical source context from the fictional Litany Engine location model.",
});

function createComponent({
  id,
  title,
  semanticType,
  semantic,
  legacyIds = [],
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
    sourceAnchors: [SEDLEC_OSSUARY_SOURCE_ANCHOR_ID],
    sourceTypes: ["Architecture", "Sacred Site", "Material Culture"],
    themes: ["devotional bonework", "erased identity", "sacred display"],
    motifs,
    horror: ["Religious Horror", "Gothic"],
    contexts: ["ossuary", "chapel", "crypt"],
    compatibility: {
      capabilities: ["dark-places"],
      excludedCapabilities: ["monster-composer"],
    },
    generation: {
      phase: 3,
      ...generation,
    },
    semantic: {
      ...semantic,
      provenance,
    },
    provenance,
  };
}

const COMPONENTS = [
  createComponent({
    id: "sedlec-place-identity",
    title: "The Litany Engine",
    semanticType: "place-identity",
    legacyIds: [
      "bone-chapel-counts-the-dead",
      "places-premise-ossuary-litany-engine",
    ],
    motifs: ["arranged remains", "measured niches", "anonymous dead"],
    generation: { primary: true },
    semantic: {
      originalPurpose:
        "The underground chapel was built to gather displaced human remains into a consecrated memorial where ordered bonework made the anonymous dead visible to the living.",
      originalUsers: [
        "chapel custodians",
        "pilgrims seeking intercession",
        "families of the unclaimed dead",
      ],
      historicalChange:
        "Successive custodians stopped treating the arrangements as memorial records and rebuilt them as a devotional counting machine, removing names so every skull and rib could occupy a perfect place in its prayer geometry.",
      horrorTruth:
        "The completed patterns now continue the litany without a priest and count each living visitor as unfinished material for an empty niche.",
      currentFunction:
        "The ossuary measures disturbance, confession, and blood, then rearranges signs and relics to pressure intruders into surrendering a true name or a body.",
      currentConflict:
        "A recently placed named bone interrupts the pattern, while the chapel's keepers try to complete the count before the contradiction wakes every anonymous dead at once.",
      playerEntryPoints: [
        "Recover the named bone of a missing pilgrim before the keepers erase its inscription.",
        "Find why the chapel has begun adding fresh remains although no burial has been authorized.",
      ],
      stakes: [
        "If the name is erased, the missing pilgrim becomes part of the engine and the chapel gains a new completed verse.",
        "If the count reaches its final measure, every living creature inside is assigned an empty niche and marked for collection.",
      ],
      toneKeywords: ["reverent", "dry", "measured", "accusatory"],
    },
  }),
  createComponent({
    id: "sedlec-site-atmosphere",
    title: "Dry Devotional Pressure",
    semanticType: "site-atmosphere",
    legacyIds: [
      "dust-of-polished-bone",
      "places-sense-bone-dust-breath",
      "places-sense-clicking-skull-seams",
    ],
    motifs: ["bone dust", "settling teeth", "spent incense"],
    semantic: {
      signature:
        "The chapel is dry, meticulously ordered, and never silent enough to feel empty; every pause is answered by the minute settling of teeth and wire.",
      manifestations: [
        {
          id: "bone-dust-aftertaste",
          text: "A mineral sweetness gathers on the tongue after every spoken name.",
          senses: ["taste", "smell"],
          intensity: "low",
          frequency: "pervasive",
        },
        {
          id: "answering-skull-seams",
          text: "Small clicks travel through skull seams a heartbeat after a voice stops.",
          senses: ["sound"],
          intensity: "medium",
          frequency: "recurring",
        },
        {
          id: "warm-reliquary-wire",
          text: "The wire holding the bonework is warm wherever the Litany has advanced.",
          senses: ["touch", "temperature"],
          intensity: "medium",
          frequency: "recurring",
        },
      ],
      exclusions: [
        "ordinary crypt rot",
        "constant screaming",
        "generic supernatural cold",
      ],
      escalationLinks: ["ossuary-litany"],
    },
  }),
  createComponent({
    id: "ossuary-litany",
    title: "The Ossuary Litany",
    semanticType: "global-rule",
    legacyIds: ["chapel-hungry", "bone-chapel-counts-the-dead"],
    motifs: ["counted prayers", "turning skulls", "empty niches"],
    semantic: {
      id: "ossuary-litany",
      title: "The Ossuary Litany",
      scope: "location",
      category: "pressure-track",
      trigger: {
        events: ["disturb-remains", "loud-noise", "speak-a-false-name"],
        timing: "immediately-after-event",
        frequencyLimit: "once-per-turn",
      },
      state: {
        label: "Litany",
        minimum: 0,
        maximum: 4,
        initial: 0,
      },
      resolution: {
        timing: "end-of-round",
        threshold: 2,
        savingThrow: {
          ability: "Wisdom",
          skills: [],
          dc: null,
          scalingKey: "intrusion",
        },
        check: null,
        attackRoll: null,
        effect: {
          damage: "",
          damageType: "psychic",
          healing: "",
          conditions: [],
          additionalText:
            "On a failed save, the creature cannot take reactions until the start of its next turn; on a success, it takes half damage and keeps its reactions.",
        },
        duration: "until-start-of-next-turn",
        range: "location",
        area: "every-creature-that-triggered-the-litany-this-round",
        frequency: "once-per-round-at-litany-2-or-higher",
        actionEconomy: "automatic",
      },
      counterplay: [
        {
          id: "restore-a-name",
          actionCost: "action",
          check: {
            ability: "Intelligence",
            skills: ["Investigation", "Religion"],
            dc: null,
            scalingKey: "intrusion",
          },
          success:
            "Restore a displaced name or bone to its recorded place and reduce Litany by 1.",
        },
        {
          id: "keep-reverent-silence",
          actionCost: "one-minute-activity",
          check: null,
          success:
            "If every creature remains silent and no remains are disturbed for one minute, reduce Litany by 1.",
        },
      ],
      reset: {
        condition:
          "The chapel remains silent for ten minutes and at least one displaced remain has been restored.",
        value: 0,
      },
      escalation: [
        {
          at: 2,
          effect:
            "Skulls turn toward the last triggering creature and the end-of-round save begins.",
        },
        {
          at: 4,
          effect:
            "Every empty niche opens; the first failed save each round also knocks the creature Prone.",
        },
      ],
      gmSummary:
        "Disturbance raises Litany; at 2+, triggering creatures save at round end, while restored names and sustained silence lower the track.",
      playerFacingSigns: [
        "Skulls turn toward the last disturbance.",
        "Bone dust rises in four measured pulses.",
        "Empty niches sound like held breath.",
      ],
    },
  }),
  createComponent({
    id: "sedlec-sign-prayer-slip-mortar",
    title: "Prayer-Slip Mortar",
    semanticType: "recurring-sign",
    legacyIds: ["places-anomaly-prayer-slip-mortar"],
    motifs: ["prayer slips", "pale hair", "mortar seams"],
    semantic: {
      id: "sedlec-sign-prayer-slip-mortar",
      description:
        "Folded prayer slips, ash, and pale hair have been pressed into selected mortar seams as private memorials the official arrangement tried to erase.",
      placement: {
        frequency: "recurring",
        minimumRooms: 1,
        maximumRooms: 2,
        allowedRoomRoles: ["entrance", "connector", "clue"],
        forbiddenRoomRoles: ["final"],
        preferredFeatures: ["alcove", "threshold"],
      },
      variations: [
        "A folded prayer slip protrudes from the mortar beside a strand of pale hair.",
        "Someone has picked ash and hair from one seam, exposing a hidden initial.",
        "Fresh wax seals a prayer slip into the wall where no candle can reach.",
      ],
      interaction: {
        trigger: "A creature carefully opens a prayer slip.",
        effect:
          "The slip supplies a forgotten name connected to this room or its nearest clue.",
        counterplay:
          "Return the slip to its seam to avoid disturbing the Litany; tearing or burning it raises Litany by 1.",
      },
      revelationLink: "named-bone-revelation",
    },
  }),
  createComponent({
    id: "sedlec-sign-turning-skull-garlands",
    title: "Turning Skull Garlands",
    semanticType: "recurring-sign",
    legacyIds: [
      "skulls-turn-toward-confession",
      "places-anomaly-skull-garland-gap",
    ],
    motifs: ["skull garlands", "confession", "measured gaps"],
    semantic: {
      id: "sedlec-sign-turning-skull-garlands",
      description:
        "Selected skull garlands reorient toward confession, false names, and gaps in the chapel's count.",
      placement: {
        frequency: "recurring",
        minimumRooms: 2,
        maximumRooms: 3,
        allowedRoomRoles: ["connector", "clue", "final"],
        forbiddenRoomRoles: [],
        preferredFeatures: ["alcove", "wall"],
      },
      variations: [
        "Every skull in one garland faces the last creature to speak a secret.",
        "A mouth-shaped gap travels one place along the garland when nobody watches.",
        "Only the skull above the correct route refuses to turn toward the confession.",
      ],
      interaction: null,
      revelationLink: "litany-count-revelation",
    },
  }),
  createComponent({
    id: "sedlec-sign-candlewax-tears",
    title: "Candlewax Tears",
    semanticType: "recurring-sign",
    legacyIds: ["bones-sweat-candlewax"],
    motifs: ["warm wax", "skull sockets", "handled relics"],
    semantic: {
      id: "sedlec-sign-candlewax-tears",
      description:
        "Bone ornaments sweat warm candlewax where recent acts have advanced the Litany.",
      placement: {
        frequency: "recurring",
        minimumRooms: 1,
        maximumRooms: 2,
        allowedRoomRoles: ["entrance", "clue", "final"],
        forbiddenRoomRoles: [],
        preferredFeatures: ["alcove", "reliquary"],
      },
      variations: [
        "Warm wax gathers in the eye sockets of a skull untouched by candlelight.",
        "A handled rib leaves a clean wax print shaped like a small open hand.",
        "Four wax drops descend in sequence and stop before striking the floor.",
      ],
      interaction: {
        trigger: "A creature traces the still-warm wax to its source.",
        effect:
          "The wax points toward the most recent room in which the Litany increased.",
        counterplay:
          "Cooling the ornament with holy water suppresses this sign until Litany next increases.",
      },
      revelationLink: "litany-source-revelation",
    },
  }),
  createComponent({
    id: "sedlec-sign-fresh-bone-count",
    title: "Fresh Bone in the Count",
    semanticType: "recurring-sign",
    legacyIds: ["chandelier-has-one-new-rib"],
    motifs: ["fresh rib", "red marrow", "recent replacement"],
    semantic: {
      id: "sedlec-sign-fresh-bone-count",
      description:
        "Fresh remains have been inserted into old devotional patterns, proving that the ossuary is still collecting material.",
      placement: {
        frequency: "recurring",
        minimumRooms: 1,
        maximumRooms: 2,
        allowedRoomRoles: ["clue", "final"],
        forbiddenRoomRoles: ["entrance"],
        preferredFeatures: ["chandelier", "reliquary", "alcove"],
      },
      variations: [
        "One rib in the yellowed arrangement is fresh enough for red marrow to shine at the cut.",
        "A polished finger bone still carries the indentation of a recently removed ring.",
        "A clean skull has been wired into a dusty row, but the empty wire beside it is still warm.",
      ],
      interaction: {
        trigger: "A creature examines the fresh remain without moving it.",
        effect:
          "A successful Medicine or Investigation check establishes that it was placed within the last day.",
        counterplay:
          "Removing it carelessly raises Litany by 1; recording its name before removal prevents that increase.",
      },
      revelationLink: "recent-collection-revelation",
    },
  }),
  createComponent({
    id: "sedlec-sensory-profile",
    title: "Ossuary Sensory Profile",
    semanticType: "sensory-profile",
    legacyIds: [
      "prayer-underwater",
      "dust-of-polished-bone",
      "places-sense-bone-dust-breath",
      "places-sense-clicking-skull-seams",
    ],
    motifs: ["dry sweetness", "bone clicks", "warm wire"],
    semantic: {
      signature:
        "Dry bone dust and the quiet movement of teeth make the chapel feel attentive rather than abandoned.",
      variants: {
        sight: [
          "Powder gathers in crescents beneath every speaking mouth.",
          "Fine cracks divide the bonework into measured groups of four.",
          "Candle flames lean toward the nearest empty niche.",
          "A clean wire glints among fittings blackened by age.",
        ],
        sound: [
          "Teeth settle one by one after the room becomes quiet.",
          "A prayer returns a heartbeat late from behind the wall.",
          "Thin wire hums at the edge of hearing when a name is spoken.",
          "Four dry taps answer a careless footstep.",
        ],
        smell: [
          "Spent incense hangs beneath a mineral sweetness.",
          "Warm wax carries the faint smell of singed hair.",
        ],
        touch: [
          "The reliquary wire is warmer than the surrounding stone.",
          "Polished bone leaves a film of dry powder on the fingertips.",
        ],
        taste: [
          "A chalky sweetness settles behind the teeth after a name is spoken.",
          "The air leaves a faint copper trace that vanishes outside the chapel.",
        ],
        temperature: [
          "One empty niche holds the warmth of a recently departed body.",
          "A measured draft cools each row of skulls from left to right.",
        ],
        proprioception: [],
      },
      intensityTiers: {
        low: [
          "One seam clicks after the last word.",
          "A trace of mineral sweetness lingers on the tongue.",
        ],
        medium: [
          "Several garlands turn by the width of a tooth.",
          "Warm wire hums through the nearest wall.",
        ],
        high: [
          "Every empty niche exhales bone dust in the same four-beat rhythm.",
        ],
      },
      roomRoleBias: {
        entrance: ["Candle flames lean deeper into the site."],
        threshold: ["The bone count changes across the doorway."],
        ritual: ["Prayer echoes return in strict sequence."],
        secret: ["Named fragments interrupt the anonymous pattern."],
        climax: ["Every garland faces the same empty niche."],
        connector: ["Clicks travel ahead along the route."],
      },
      geometryBias: {
        circular: ["The answering clicks complete a full circuit."],
        narrow: ["Dry powder brushes both shoulders."],
        large: ["The delayed prayer returns from several distances."],
        vertical: ["Bone dust descends before any step above is heard."],
        ruined: ["Broken patterns attempt to continue across the gap."],
      },
      exclusions: ["putrefaction", "generic grave cold"],
      repetitionPolicy: {
        exactTextCooldown: "all-rooms",
        senseCooldown: 1,
        allowSignatureRepeat: false,
      },
    },
  }),
  createComponent({
    id: "sedlec-read-aloud-profile",
    title: "Ossuary Read-Aloud Profile",
    semanticType: "read-aloud-profile",
    legacyIds: ["places-premise-ossuary-litany-engine"],
    motifs: ["bone architecture", "devotional geometry", "empty niches"],
    semantic: {
      fragments: {
        spatialAnchors: [
          {
            id: "bone-lined-chapel",
            text: "Bone-lined walls narrow toward a chapel arranged around a single empty niche.",
            roomRoles: ["entrance", "connector"],
            geometry: ["narrow"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "inscribed-skull-alcoves",
            text: "Alcoves cut into the stone hold skulls in rows precise enough to resemble writing.",
            roomRoles: ["clue", "threshold", "secret"],
            geometry: ["narrow"],
            visibleFeatures: ["alcove"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "rib-arch-threshold",
            text: "A low arch of wired ribs separates the public memorial from the deeper reliquary.",
            sourceComponentId: "sedlec-read-aloud-profile",
          },
        ],
        sensoryBeats: [
          {
            id: "sweet-mineral-air",
            text: "The air tastes faintly sweet and mineral.",
            intensity: "low",
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "clicks-after-voices",
            text: "Small clicks move through the walls after each voice stops.",
            roomRoles: ["connector", "clue"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "incense-and-polished-bone",
            text: "Spent incense clings beneath the dry smell of polished bone.",
            roomRoles: ["ritual", "final"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "warm-ornament-wire",
            text: "The wire in the nearest ornament radiates a trace of warmth.",
            intensity: "medium",
            visibleFeatures: ["wire"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
        ],
        visibleFeatures: [
          {
            id: "skull-garland-gap",
            text: "Skull garlands circle the room with one deliberate gap that remains level with the doorway.",
            visibleFeatures: ["skull-garland"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "prayer-slip-seams",
            text: "Prayer slips and pale hair protrude from selected mortar seams.",
            roomRoles: ["clue", "final"],
            visibleFeatures: ["prayer-slip"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "chandelier-room-plan",
            text: "A chandelier repeats the room plan in ribs and finger bones.",
            roomRoles: ["entrance", "connector"],
            visibleFeatures: ["chandelier"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "fresh-bone-row",
            text: "A fresh bone interrupts one row of yellowed remains.",
            roomRoles: ["clue", "final"],
            visibleFeatures: ["fresh-bone"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "rib-rosette-count",
            text: "Ribs form a numbered rosette around a dark iron pin, with each arc aligned to a different doorway.",
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "wire-counting-marks",
            text: "Short counting marks score the wire between each carefully separated cluster of remains.",
            sourceComponentId: "sedlec-read-aloud-profile",
          },
        ],
        unsettlingDetails: [
          {
            id: "living-body-niche",
            text: "The empty niche is proportioned for a living body.",
            roomRoles: ["final", "climax"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "teeth-follow-speaker",
            text: "Several teeth turn toward the last person who spoke.",
            roomRoles: ["connector", "clue", "ritual"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "hidden-rib-initial",
            text: "A hidden initial has been scratched inside a polished rib.",
            tags: ["gm-only"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "four-wax-drops",
            text: "Four drops of wax hang beneath a skull untouched by flame.",
            roomRoles: ["entrance", "clue"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "erased-name-scrape",
            text: "A name has been scraped away so recently that pale dust still rests inside the letters.",
            sourceComponentId: "sedlec-read-aloud-profile",
          },
        ],
        motionOrChange: [
          {
            id: "moving-mouth-gap",
            text: "A mouth-shaped gap shifts one place along the garland, leaving the surrounding skulls angled toward the newly opened space.",
            roomRoles: ["connector", "clue"],
            visibleFeatures: ["skull-garland"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "four-pulses-of-dust",
            text: "Bone dust rises in four measured pulses, circles the nearest empty niche, and settles in neat lines along the floor.",
            sourceComponentId: "sedlec-read-aloud-profile",
          },
        ],
        exitsAndDepth: [
          {
            id: "prayer-beyond-rib-arch",
            text: "Beyond the rib arch, the delayed prayer returns from a lower chamber, then repeats from a second depth where no stair is visible.",
            sourceComponentId: "sedlec-read-aloud-profile",
          },
          {
            id: "unmapped-chandelier-room",
            text: "The chandelier pattern includes a room that has no visible door.",
            tags: ["future-reveal"],
            sourceComponentId: "sedlec-read-aloud-profile",
          },
        ],
      },
      constraints: {
        forbiddenSpoilerTags: ["secret", "solution", "true-name"],
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
  createComponent({
    id: "sedlec-session-guide",
    title: "Running the Litany Engine",
    semanticType: "session-guide",
    legacyIds: ["sedlec-bone-has-a-name"],
    motifs: ["named bone", "rising litany", "restored memorial"],
    semantic: {
      openingBeat: {
        situation:
          "A custodian bars the chapel doors after discovering a fresh rib in the chandelier and a living pilgrim's name inside the bonework.",
        immediateSignal:
          "Four dry clicks answer the first voice, and every candle leans toward the sealed catacomb.",
        playerDecision:
          "Enter quietly to preserve the count, confront the custodian, or follow the name before it is erased.",
      },
      objectives: [
        "Identify the named bone and the person it belonged to.",
        "Prevent the Litany from completing its fourth measure.",
        "Choose whether to restore, expose, or dismantle the devotional count.",
      ],
      alwaysOnRuleIds: ["ossuary-litany"],
      pressureTrackId: "ossuary-litany",
      clueFlow: {
        requiredRevelations: [
          "named-bone-revelation",
          "litany-count-revelation",
          "recent-collection-revelation",
        ],
        links: [
          {
            from: "named-bone-revelation",
            to: "litany-count-revelation",
            condition:
              "The characters compare the hidden name with an empty niche.",
          },
          {
            from: "litany-count-revelation",
            to: "recent-collection-revelation",
            condition:
              "The characters inspect a fresh remain or the chandelier map.",
          },
        ],
        fallbackClues: [
          "A prayer slip repeats the hidden name.",
          "A turning garland points toward the fresh remain.",
        ],
      },
      stallMoves: [
        {
          id: "advance-the-litany",
          trigger: "The table debates without acting after a clear sign.",
          action:
            "Advance Litany by 1 and turn the nearest skulls toward the named bone.",
        },
        {
          id: "custodian-intervenes",
          trigger:
            "The characters prepare to damage the memorial without a plan.",
          action:
            "The custodian offers the register, but demands a true name as security.",
        },
        {
          id: "fresh-wire-tightens",
          trigger: "A clue has been missed twice.",
          action:
            "Fresh wire tightens audibly around the relevant bone and exposes its inscription.",
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
          "At Litany 4, make the choice about the named bone more urgent rather than adding unrelated enemies.",
      },
    },
  }),
];

export const SEDLEC_OSSUARY_SEMANTIC_V2_PACK = normalizeContentPackV0_2({
  schemaVersion: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
  id: SEDLEC_OSSUARY_SEMANTIC_V2_PACK_ID,
  title: "Sedlec Ossuary Semantic Content Pack",
  version: "0.2.0-phase8-approved1",
  status: "draft",
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: ["dark-places", "inspiration-archive", "sedlec-ossuary", "phase3"],
  modules: [
    {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
      id: SEDLEC_OSSUARY_SEMANTIC_V2_MODULE_ID,
      title: "Sedlec Ossuary",
      packId: SEDLEC_OSSUARY_SEMANTIC_V2_PACK_ID,
      status: "in-review",
      locale: "en",
      capabilities: ["inspiration-archive", "dark-places"],
      sourceAnchor: {
        schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SOURCE_ANCHOR,
        id: SEDLEC_OSSUARY_SOURCE_ANCHOR_ID,
        title: "Sedlec Ossuary",
        kind: "place",
        status: "in-review",
        citation: {
          label: "Sedlec Ossuary, Kutná Hora — Phase 3 project source dossier",
          accessedVersion: "phase3-editorial-draft-v1",
        },
        summary:
          "A historical ossuary chapel in which human remains form devotional ornament and architectural patterns; Phase 3 uses that material culture as a source boundary, not as proof of the fictional Litany Engine.",
        reliability: "secondary",
        editorialNotes: [
          "Historical source: arranged human remains, chapel architecture, devotional display, and the tension between memorial and ornament.",
          "Fictional transformation: the self-operating Litany, fresh collection, hostile counting, named-bone contradiction, pressure track, and all supernatural mechanics are original game content.",
          "The source framing was approved by Danilo on 2026-07-16; media credit and image provenance remain open before publication.",
        ],
        tags: ["architecture", "material-culture", "sacred-site"],
      },
      inspiration: {
        schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
        id: "inspiration-sedlec-ossuary-v2",
        slug: "sedlec-ossuary",
        title: "Sedlec Ossuary",
        status: "approved",
        sourceAnchors: [SEDLEC_OSSUARY_SOURCE_ANCHOR_ID],
        sourceTypes: ["Historical Site", "Architecture", "Material Culture"],
        themes: [
          "devotional bonework",
          "memorial versus ornament",
          "anonymous remains",
        ],
        motifs: [
          "bone chandelier",
          "skull garlands",
          "arranged remains",
          "chapel dust",
        ],
        horror: ["Religious Horror", "Gothic"],
        contexts: ["ossuary", "chapel", "crypt"],
        editorial: {
          deck: "Devotional architecture made from human remains becomes a study in memorial order, erased identity, and the unease of bodies transformed into ornament.",
          whatItIs:
            "Sedlec Ossuary is used here as a historical and material-culture reference for a chapel whose arranged remains remain visibly human even when they become architecture.",
          whyItDisturbs:
            "The source holds reverence and display together: the dead are preserved and given sacred order, yet their individual identities can disappear inside a beautiful collective design.",
          creativeUses: [
            "Build a location where architecture functions as a record of the dead.",
            "Turn missing names and altered arrangements into actionable clues.",
            "Use disturbance of remains as a visible pressure system with concrete counterplay.",
          ],
          cautions: [
            "Keep historical description separate from supernatural fiction.",
            "Treat human remains as people and memorial material, not disposable gore dressing.",
          ],
        },
        media: {
          imageKey: "card-sedlec-ossuary.webp",
          imageProvider: "local",
          imageAlt:
            "Interior devotional bonework associated with the Sedlec Ossuary inspiration card.",
          imageCredit:
            "Cruor Games local archive asset; original historical-site credit pending human editorial verification.",
          icon: "fa-church",
        },
        tags: ["source:sedlec-ossuary", "capability:dark-places"],
        provenance: MODULE_PROVENANCE,
      },
      components: COMPONENTS,
      metadata: {
        author: "Cruor Games",
        revision: 1,
        reviewedAt: "2026-07-16",
        sourceFile:
          "shared/content/content-packs/sedlec-ossuary-semantic-v2-pack.js",
        capabilityWaivers: [],
      },
      provenance: MODULE_PROVENANCE,
    },
  ],
  metadata: {
    bundled: true,
    registryRole: "semantic-v2-editorial-approved",
    humanApprovalRequired: false,
    editorialStatus: "approved",
    publicationBlockers: ["image-provenance-required"],
    historicalSourceBoundary:
      "Historical ossuary architecture and devotional bonework are source context; the Litany Engine and all mechanics are fictional.",
  },
});

export const SEDLEC_OSSUARY_SEMANTIC_V2_MODULE =
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK.modules[0];
