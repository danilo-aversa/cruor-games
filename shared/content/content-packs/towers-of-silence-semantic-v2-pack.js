import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeContentPackV0_2,
  normalizeSemanticProvenance,
} from "../contracts/semantic/index.js";

export const TOWERS_OF_SILENCE_SEMANTIC_V2_PACK_ID =
  "towers-of-silence-semantic-v2";
export const TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE_ID =
  "towers-of-silence";
export const TOWERS_OF_SILENCE_SEMANTIC_V2_SOURCE_ANCHOR_ID =
  "towers-of-silence";

const REVIEW_VERSION = "phase8-towers-of-silence-editorial-approved-v1";

function createProvenance({
  legacyIds = [],
  relation = "derived",
  note = "Editorially re-authored from the frozen Towers of Silence module and its exposure, open-sky, boundary, bone-receptacle, and scavenger vocabulary.",
  migrationNote = "AI-assisted editorial candidate. Cultural-source review, repeatable local sample QA, image provenance, and final human approval remain explicit publication gates. Historical funerary practice is separated from Cruor supernatural fiction.",
} = {}) {
  return normalizeSemanticProvenance({
    sources: [
      {
        sourceAnchorId: TOWERS_OF_SILENCE_SEMANTIC_V2_SOURCE_ANCHOR_ID,
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
      note: migrationNote,
    },
  });
}

const MODULE_PROVENANCE = createProvenance({
  legacyIds: [
    "towers-of-silence",
    "inspiration-towers-of-silence",
    "Towers of Silence",
  ],
  relation: "editorial-constraint",
  note: "Historical exposure structures and later bone-receptacle functions are retained as bounded source context. The Open Reliquary, Sky Measure, supernatural shadows, refused transformations, and all game procedures are original Cruor fantasy extrapolations.",
});

function createDarkPlacesComponent({
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
    sourceAnchors: [TOWERS_OF_SILENCE_SEMANTIC_V2_SOURCE_ANCHOR_ID],
    sourceTypes: ["Funerary Practice", "Ritual Architecture", "History"],
    themes: [
      "exposure",
      "ritual boundary",
      "open sky",
      "transformation of remains",
    ],
    motifs,
    horror: ["Religious Horror", "Gothic"],
    contexts: ["chapel", "crypt", "ruins", "tower"],
    compatibility: {
      capabilities: ["dark-places"],
      excludedCapabilities: ["monster-composer"],
    },
    generation: { phase: 8, ...generation },
    semantic: { ...semantic, provenance },
    provenance,
  };
}

const DARK_PLACES_COMPONENTS = [
  createDarkPlacesComponent({
    id: "towers-of-silence-place-identity",
    title: "The Open Reliquary",
    semanticType: "place-identity",
    legacyIds: [
      "tower-refuses-burial",
      "places-premise-sun-judgment-court",
      "location-region-skyless-ossuary-well",
      "location-region-exposure-court",
    ],
    motifs: ["open court", "bone channels", "sheltered retreat"],
    generation: { primary: true },
    semantic: {
      originalPurpose:
        "An elevated funerary complex separated the handling of remains from ordinary settlement life. Open courts exposed bodies to air and weather, while channels and later receptacles kept transformed remains within a controlled ritual boundary.",
      originalUsers: [
        "appointed funerary attendants working within a restricted boundary",
        "families and community members who remained outside the exposure court",
        "caretakers of the later bone receptacles and drainage channels",
      ],
      historicalChange:
        "A collapse split the outer boundary and blocked the drainage channels. The exposed courts no longer complete their intended material sequence, and the keepers abandoned the upper ring after shadows began circling bodies that had already been moved below.",
      horrorTruth:
        "The site now mistakes interruption for incompletion. Open sky, boundary marks, bone channels, and sheltered recesses form a supernatural measuring system that records every disturbance as unfinished passage rather than moral judgment.",
      currentFunction:
        "The Open Reliquary measures intrusion through Sky Measure. Restoring boundaries, following visible scratch paths, opening drainage, and preserving a sheltered retreat let the party navigate the site without imitating or performing a living religious rite.",
      currentConflict:
        "A sealed lower receptacle contains the proof that the collapse was deliberate, while trapped workers above intend to break the remaining boundary stones to escape. Doing so would expose the lower chamber to the final announced descent.",
      playerEntryPoints: [
        "Recover the keeper's record from the lower receptacle before the upper boundary is broken.",
        "Open a safe route through the exposure court by restoring drainage and reading the scratch paths.",
        "Identify which body was moved after the collapse and why the site still measures its absence.",
      ],
      stakes: [
        "If Sky Measure reaches 4, an announced descent occupies the named exposed route while the sheltered retreat remains open.",
        "If the final boundary is broken, one safe court becomes exposed until the drainage or ash line is restored.",
        "If the party preserves the remaining boundary, the trapped workers can leave without disturbing the lower receptacle.",
      ],
      toneKeywords: ["austere", "open", "measured", "solemn"],
    },
  }),
  createDarkPlacesComponent({
    id: "towers-of-silence-site-atmosphere",
    title: "Sun, Stone, and Unfinished Passage",
    semanticType: "site-atmosphere",
    legacyIds: [
      "dry-wings-stairwell",
      "tower-smells-of-hot-lime",
      "sun-warmed-bone-dust",
      "places-sense-high-carrion-shadow",
      "places-sense-sun-baked-stone",
    ],
    motifs: ["hot lime", "dry wings", "warm bone dust"],
    semantic: {
      signature:
        "Open brightness, mineral heat, dry wing sounds, and carefully bounded remains make the location feel exposed rather than abandoned; shade reads as shelter, not secrecy.",
      manifestations: [
        {
          id: "mineral-open-air",
          text: "Hot stone, lime dust, and dry air replace the smell of ordinary decay.",
          senses: ["smell", "temperature"],
          intensity: "low",
          frequency: "pervasive",
        },
        {
          id: "wing-sound-without-bird",
          text: "Dry wingbeats circle above a stair or court even when the visible sky is empty.",
          senses: ["sound", "direction"],
          intensity: "low",
          frequency: "recurring",
        },
        {
          id: "warm-clinging-dust",
          text: "Fine bone-colored dust clings warmly to skin and outlines every crossed boundary.",
          senses: ["touch", "sight"],
          intensity: "medium",
          frequency: "localized",
        },
        {
          id: "shade-as-refuge",
          text: "One sheltered recess remains visibly cooler and acoustically still while exposed paths carry every movement upward.",
          senses: ["temperature", "sound"],
          intensity: "medium",
          frequency: "recurring",
        },
      ],
      exclusions: [
        "presenting a living funerary practice as a generic evil cult",
        "claiming scavenger behavior reveals moral worth or spiritual success",
        "using exposed remains as decorative spectacle without personhood or context",
      ],
      escalationLinks: ["sky-measure"],
    },
  }),
  createDarkPlacesComponent({
    id: "sky-measure",
    title: "Sky Measure",
    semanticType: "global-rule",
    legacyIds: [
      "carrion-descent",
      "dead-rise-in-shadow",
      "places-hazard-exposure-edge",
      "places-hazard-carrion-drop",
      "places-twist-open-sky-no-privacy",
      "places-twist-scavenger-patience",
    ],
    motifs: ["measured exposure", "named route", "sheltered retreat"],
    semantic: {
      id: "sky-measure",
      title: "Sky Measure",
      scope: "location",
      category: "pressure-track",
      trigger: {
        events: [
          "cross-a-marked-boundary-without-reading-its-visible-route",
          "move-remains-or-bone-receptacles-without-first-stabilizing-the-area",
          "break-an-ash-line-drain-or-boundary-stone",
          "remain-in-an-exposed-court-after-the-announced-warning",
        ],
        timing:
          "Immediately after a listed event; outside combat, also check accumulated Measure at the end of each ten-minute exploration turn spent in an exposed region.",
        frequencyLimit:
          "Once per combat round, or once per ten-minute exploration turn.",
      },
      state: { label: "Measure", minimum: 0, maximum: 4, initial: 0 },
      resolution: {
        timing:
          "At the end of each combat round; outside combat, at the end of each ten-minute exploration turn.",
        threshold: 2,
        savingThrow: null,
        check: {
          ability: "Wisdom",
          skills: ["Religion", "Survival"],
          dc: null,
          scalingKey: "intrusion",
        },
        attackRoll: null,
        effect: {
          damage: "",
          damageType: "",
          healing: "",
          conditions: [],
          additionalText:
            "On a failed check, the GM advances one already visible shadow, falling-bone risk, or exposed obstacle onto a named route. The rule never creates an unseen creature, rewrites real map topology, removes every exit, or treats a historical rite as a spell the characters must perform.",
        },
        duration: "Until countered or until the next Measure check.",
        range: "location",
        area: "one announced exposed route or court",
        frequency: "cadence-bound",
        actionEconomy: "environmental procedure",
      },
      counterplay: [
        {
          id: "restore-the-visible-boundary",
          actionCost: "one action or one exploration interaction",
          check: {
            ability: "Intelligence",
            skills: ["Investigation", "Religion"],
            dc: null,
            scalingKey: "intrusion",
          },
          success:
            "Restore a displaced stone or ash line and reduce Measure by 1 without imitating a religious formula.",
        },
        {
          id: "open-the-drainage-path",
          actionCost: "one action or ten minutes outside combat",
          check: {
            ability: "Strength",
            skills: ["Athletics", "Survival"],
            dc: null,
            scalingKey: "intrusion",
          },
          success:
            "Clear a blocked channel, reveal one safe crossing, and prevent the next environmental advance on that route.",
        },
        {
          id: "follow-the-scratch-path",
          actionCost: "movement through a previously observed route",
          check: null,
          success:
            "Use repeated claw and tool scratches to move between cover points without increasing Measure.",
        },
      ],
      reset: {
        condition:
          "Measure returns to 0 when the lower record is recovered, the drainage and boundary are stabilized, or the party leaves through the sheltered retreat.",
        value: 0,
      },
      escalation: [
        {
          at: 1,
          effect:
            "Warm dust outlines the last crossed boundary and shows which sheltered recess remains safe.",
        },
        {
          at: 2,
          effect:
            "A visible bird-shadow or falling-bone risk occupies one named exposed point until countered.",
        },
        {
          at: 3,
          effect:
            "Announce the exact route that will receive the final descent and keep the sheltered retreat visible.",
        },
        {
          at: 4,
          effect:
            "After a one-step countdown ending at the next combat round or ten-minute exploration turn, the announced route becomes hazardous or occupied. The sheltered retreat and one restoration action remain available.",
        },
      ],
      gmSummary:
        "Advance only from named disturbances, announce every affected route, and preserve a visible retreat and non-ritual counterplay.",
      playerFacingSigns: [
        "warm dust outlining crossed boundaries",
        "a winged shadow circling a named exposed route",
        "scratch paths connecting shelter and drainage",
      ],
    },
  }),
  createDarkPlacesComponent({
    id: "towers-of-silence-sign-sun-ring",
    title: "Sun Rings Mark the Missing Center",
    semanticType: "recurring-sign",
    legacyIds: ["bone-spirals-sun", "places-anomaly-sun-ring-outline"],
    motifs: ["concentric bone", "bent sunlight", "missing center"],
    semantic: {
      id: "towers-of-silence-sign-sun-ring",
      description:
        "Concentric bone, dust, or sun marks identify a center that was deliberately left open or later emptied.",
      placement: {
        frequency: "recurring",
        minimumRooms: 1,
        maximumRooms: 3,
        allowedRoomRoles: [],
        forbiddenRoomRoles: [],
        preferredFeatures: ["floor", "court", "shaft", "receptacle"],
      },
      variations: [
        "A pale ring stops around one dark center the sunlight does not enter.",
        "Dust circles a missing object whose removal line points toward the lower court.",
        "Several bone fragments align into a ring only when viewed from the sheltered recess.",
      ],
      interaction: {
        trigger: "The characters compare ring centers or change their viewing height.",
        effect:
          "They identify the removed body, missing receptacle, or route used after the collapse.",
        counterplay:
          "Mark the center and follow its removal line rather than crossing the exposed court blindly.",
      },
      revelationLink: "missing-center-revelation",
    },
  }),
  createDarkPlacesComponent({
    id: "towers-of-silence-sign-birdless-shadow",
    title: "A Birdless Shadow Circles",
    semanticType: "recurring-sign",
    legacyIds: [
      "shadow-at-the-open-roof",
      "places-anomaly-birdless-feathers",
    ],
    motifs: ["empty sky", "circling shadow", "dry feather"],
    semantic: {
      id: "towers-of-silence-sign-birdless-shadow",
      description:
        "A winged shadow or dry feather appears over unfinished routes while the visible sky remains empty.",
      placement: {
        frequency: "recurring",
        minimumRooms: 2,
        maximumRooms: 3,
        allowedRoomRoles: [],
        forbiddenRoomRoles: [],
        preferredFeatures: ["opening", "stair", "court", "shaft"],
      },
      variations: [
        "A broad shadow circles only above the blocked drainage channel.",
        "A dry feather lands inside an intact room without crossing any opening.",
        "The shadow avoids the sheltered retreat and repeats over one damaged boundary.",
      ],
      interaction: {
        trigger: "The characters observe a full circuit instead of chasing the shadow.",
        effect:
          "The circuit names the next exposed route and confirms which recess remains outside Sky Measure.",
        counterplay:
          "Move through the shadow's blind interval or restore the damaged boundary it circles.",
      },
      revelationLink: "exposure-route-revelation",
    },
  }),
  createDarkPlacesComponent({
    id: "towers-of-silence-sign-scratch-path",
    title: "Scratches Lead Between Shelter and Receptacle",
    semanticType: "recurring-sign",
    legacyIds: ["corpse-refused-sky", "places-clue-bird-path-scratch"],
    motifs: ["claw path", "tool marks", "untouched remains"],
    semantic: {
      id: "towers-of-silence-sign-scratch-path",
      description:
        "Repeated claw and tool scratches connect a sheltered handling route to one body or receptacle that did not follow the later pattern.",
      placement: {
        frequency: "recurring",
        minimumRooms: 2,
        maximumRooms: 4,
        allowedRoomRoles: [],
        forbiddenRoomRoles: [],
        preferredFeatures: ["threshold", "wall", "drain", "ledge"],
      },
      variations: [
        "Parallel scratches stop where the exposed floor begins and resume beneath cover.",
        "Older claw marks are crossed by newer tool cuts leading down toward a sealed receptacle.",
        "One untouched body lies beside a path worn by handling rather than predation.",
      ],
      interaction: {
        trigger: "The characters compare the age and direction of scratches in two rooms.",
        effect:
          "They identify the keeper's safe route and distinguish ordinary handling from the later removal.",
        counterplay:
          "Use the repeated path as a crossing that does not increase Sky Measure.",
      },
      revelationLink: "keeper-route-revelation",
    },
  }),
  createDarkPlacesComponent({
    id: "towers-of-silence-sign-boundary-warning",
    title: "The Broken Boundary Names the Safe Side",
    semanticType: "recurring-sign",
    legacyIds: [
      "vulture-saints-eye",
      "places-clue-purity-ash-line",
      "places-reward-bird-shadow-warning",
    ],
    motifs: ["broken ash line", "warning bead", "threefold shadow"],
    semantic: {
      id: "towers-of-silence-sign-boundary-warning",
      description:
        "Ash lines, warning beads, and repeated shadows reveal which side of a boundary remains sheltered and which side has been disturbed.",
      placement: {
        frequency: "recurring",
        minimumRooms: 1,
        maximumRooms: 3,
        allowedRoomRoles: [],
        forbiddenRoomRoles: [],
        preferredFeatures: ["door", "line", "stone", "recess"],
      },
      variations: [
        "A broken ash line is cool on the sheltered side and warm on the exposed side.",
        "A cloudy bead shows three circling shadows only when aimed toward the damaged boundary.",
        "Dust settles everywhere except along one narrow line leading back to cover.",
      ],
      interaction: {
        trigger: "The characters test both sides of the boundary with dust, shade, or the warning bead.",
        effect:
          "They identify the safe side and one material repair that reduces Sky Measure.",
        counterplay:
          "Repair the visible line or remain on its sheltered side; no prayer, imitation, or moral test is required.",
      },
      revelationLink: "boundary-repair-revelation",
    },
  }),
  createDarkPlacesComponent({
    id: "towers-of-silence-sensory-profile",
    title: "Open Reliquary Sensory Profile",
    semanticType: "sensory-profile",
    legacyIds: [],
    motifs: ["hot stone", "dry wings", "mineral dust"],
    semantic: {
      signature:
        "Open brightness, dry mineral heat, warm clinging dust, and distant wing sounds make every route feel visible and measured while sheltered recesses remain cool and still.",
      variants: {
        sight: [
          "Sunlight stops at an exact ring around one missing center.",
          "A winged shadow crosses the court while the visible sky remains empty.",
          "Ash and dust outline every crossed boundary in pale detail.",
          "Scratch paths disappear in exposed light and resume under cover.",
        ],
        sound: [
          "Dry wingbeats circle above a stair with no visible bird.",
          "Loose bone taps once against a channel after each heavy footstep.",
          "The sheltered recess swallows echoes that the open court carries upward.",
          "Blocked drainage answers with a low mineral rattle.",
        ],
        smell: [
          "Hot lime and sun-baked stone replace the expected smell of decay.",
          "A sealed receptacle holds dry mineral air and old cloth.",
          "Freshly disturbed ash smells faintly wet despite the heat.",
        ],
        touch: [
          "Fine warm dust clings to the fingers and refuses to brush away cleanly.",
          "Boundary stones are cool on the sheltered side and hot on the exposed side.",
          "A drainage groove vibrates when loose material shifts above.",
        ],
        taste: [
          "The air leaves a chalky mineral taste near the upper court.",
          "Dust from the lower receptacle tastes colder and slightly metallic.",
          "Wind through the broken boundary carries dry bitterness without rot.",
        ],
        temperature: [
          "The open court radiates stored heat long after direct light moves on.",
          "One sheltered recess remains steadily cool enough to mark a safe retreat.",
          "A damaged ash line is warm only on the exposed side.",
        ],
        proprioception: [
          "The body leans away from the open shaft before the next shadow crosses it.",
          "Standing inside an intact boundary makes the upper court feel farther away.",
          "Following the scratch path produces a steady sense of descending rather than circling.",
        ],
      },
      intensityTiers: {
        low: [
          "One feather turns without wind beside a visible boundary.",
          "Warm dust outlines the last crossing.",
        ],
        medium: [
          "A birdless shadow repeats over one named route.",
          "Loose bone shifts toward a blocked channel.",
        ],
        high: [
          "Every exposed sign aligns over the announced route while the sheltered retreat stays still.",
        ],
      },
      roomRoleBias: {
        entrance: ["The first ash line establishes exposed and sheltered sides."],
        threshold: ["Scratch paths show how attendants crossed without entering the open center."],
        ritual: ["Boundary, drainage, and receptacle remain distinct physical functions."],
        secret: ["A cooler mineral draft reveals the lower record chamber."],
        climax: ["The named descent route and sheltered retreat remain visible together."],
        connector: ["Claw and tool scratches repeat along covered edges."],
      },
      geometryBias: {
        circular: ["Sun and dust form incomplete rings around a missing center."],
        narrow: ["Dry wingbeats seem to travel directly above the passage."],
        large: ["Separate exposed courts carry different shadow circuits."],
        vertical: ["Bone channels and scratch paths reveal movement between levels."],
        ruined: ["Broken boundaries show their safe side through heat and dust."],
      },
      exclusions: [
        "graphic spectacle presented without ritual or human context",
        "moralizing scavenger behavior",
        "generic evil-priest chanting as required counterplay",
      ],
      repetitionPolicy: {
        exactTextCooldown: "all-rooms",
        senseCooldown: 1,
        allowSignatureRepeat: false,
      },
    },
  }),
  createDarkPlacesComponent({
    id: "towers-of-silence-read-aloud-profile",
    title: "Open Reliquary Read-Aloud Profile",
    semanticType: "read-aloud-profile",
    legacyIds: [],
    motifs: ["open court", "bone channel", "sheltered shade"],
    semantic: {
      fragments: {
        spatialAnchors: [
          { id: "open-court", text: "An open circular court occupies the center, bounded by low stone and shallow channels.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "upper-ring", text: "A narrow upper ring overlooks the court from a sequence of exposed ledges.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "lower-receptacle", text: "A sealed stair descends toward a lower chamber cut beneath the drainage line.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "sheltered-recess", text: "One cool recess sits behind an intact boundary stone and remains outside the open center.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "broken-boundary", text: "A collapsed section interrupts the outer boundary and opens the court toward the ruins.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "channel-grid", text: "Shallow channels radiate from the center toward covered openings at the edge.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "covered-path", text: "A roofed handling path follows the wall without crossing the open center.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "empty-center", text: "The center has been cleared, leaving one dark circular absence in the dust.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
        ],
        sensoryBeats: [
          { id: "hot-lime", text: "The air smells of hot lime, old sun, and dry mineral dust.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "dry-wings", text: "Dry wings circle above the stair, though the visible sky is empty.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "warm-dust", text: "Fine pale dust clings warmly to the skin at every boundary.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "cool-retreat", text: "The sheltered recess holds a steady coolness and swallows the court's echo.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
        ],
        visibleFeatures: [
          { id: "sun-ring", text: "Pale rings of dust stop around a center the light does not enter.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "scratch-route", text: "Parallel claw and tool scratches connect the covered path to the lower stair.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "ash-line", text: "A broken ash line marks the exposed side of one threshold.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "blocked-drain", text: "Bone-colored fragments choke a channel that should lead out of the court.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
        ],
        unsettlingDetails: [
          { id: "empty-sky-shadow", text: "A winged shadow crosses the floor without any body above it.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "untouched-body", text: "One covered form shows no mark from weather, tool, or animal movement.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "moved-after-collapse", text: "Newer tool scratches cross the old handling path and descend after the collapse line.", tags: ["gm-only"], sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "dust-count", text: "The dust records one more crossing into the court than it records leaving.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
        ],
        motionOrChange: [
          { id: "shadow-circuit", text: "The birdless shadow completes one slow circuit and narrows around the damaged route.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "channel-shift", text: "A loose fragment slides into the drainage groove and every nearby bone taps once in reply.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
        ],
        exitsAndDepth: [
          { id: "sheltered-return", text: "The cool recess connects to a covered path leading back without crossing the open center.", sourceComponentId: "towers-of-silence-read-aloud-profile" },
          { id: "announced-descent", text: "Every shadow gathers over one exposed stair while the sheltered return remains visibly clear.", tags: ["future-reveal"], sourceComponentId: "towers-of-silence-read-aloud-profile" },
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
    id: "towers-of-silence-session-guide",
    title: "Running the Open Reliquary",
    semanticType: "session-guide",
    legacyIds: [],
    motifs: ["keeper record", "blocked drainage", "named descent"],
    semantic: {
      openingBeat: {
        situation:
          "The party reaches the open court while trapped workers prepare to break the last boundary stone and the lower keeper's record remains sealed below.",
        immediateSignal:
          "Warm dust records an extra crossing into the court, and a birdless shadow circles the blocked drainage route.",
        playerDecision:
          "Stabilize the boundary, follow the keeper's scratch path, or reach the workers before they open the exposed side.",
      },
      objectives: [
        "Establish which paths are exposed, sheltered, and physically damaged.",
        "Trace the moved remains and recover the keeper's record from the lower receptacle.",
        "Open a safe departure without breaking the final boundary or imitating a sacred rite.",
      ],
      alwaysOnRuleIds: ["sky-measure"],
      pressureTrackId: "sky-measure",
      clueFlow: {
        requiredRevelations: [
          "missing-center-revelation",
          "keeper-route-revelation",
          "boundary-repair-revelation",
        ],
        links: [
          {
            from: "missing-center-revelation",
            to: "keeper-route-revelation",
            condition:
              "The removal line from the sun rings matches the newer tool scratches on the covered handling path.",
          },
          {
            from: "keeper-route-revelation",
            to: "boundary-repair-revelation",
            condition:
              "The keeper's route reaches the cool side of the broken ash line and identifies the material repair.",
          },
        ],
        fallbackClues: [
          "A shifted fragment clears enough dust to reveal the missing-center removal line.",
          "A dry feather lands on the first scratch of the covered keeper route.",
          "The warning bead clouds only on the hot side of the broken boundary.",
        ],
      },
      stallMoves: [
        {
          id: "advance-measure-with-route",
          trigger:
            "The table delays after a clear sun-ring, scratch-path, or boundary cue.",
          action:
            "Advance Measure by 1 and move one visible shadow onto a named exposed route.",
        },
        {
          id: "workers-loosen-stone",
          trigger: "The characters ignore the trapped workers or damaged boundary.",
          action:
            "The workers loosen one stated stone, making the consequence visible without opening the court yet.",
        },
        {
          id: "drain-reveals-record",
          trigger: "A required revelation has been missed twice.",
          action:
            "A blocked channel releases a cold draft carrying a fragment of the keeper's record toward the covered path.",
        },
      ],
      pacing: {
        defaultRoute: [
          "location-region-1",
          "location-region-2",
          "location-region-4",
          "location-region-3",
          "location-region-5",
        ],
        escalationRooms: ["location-region-3", "location-region-5"],
        climaxGuidance:
          "At Measure 4, resolve only the route announced at Measure 3 after one full combat round or ten-minute exploration turn. Keep the sheltered retreat visible and allow restoration, drainage, record recovery, or withdrawal to alter the outcome.",
      },
    },
  }),
];

export const TOWERS_OF_SILENCE_SEMANTIC_V2_PACK = normalizeContentPackV0_2({
  schemaVersion: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
  id: TOWERS_OF_SILENCE_SEMANTIC_V2_PACK_ID,
  title: "Towers of Silence Semantic Content Pack",
  version: "0.2.0-phase8-approved1",
  status: "draft",
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: [
    "dark-places",
    "inspiration-archive",
    "towers-of-silence",
    "phase8",
  ],
  modules: [
    {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
      id: TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE_ID,
      title: "Towers of Silence",
      packId: TOWERS_OF_SILENCE_SEMANTIC_V2_PACK_ID,
      status: "in-review",
      locale: "en",
      capabilities: ["inspiration-archive", "dark-places"],
      sourceAnchor: {
        schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SOURCE_ANCHOR,
        id: TOWERS_OF_SILENCE_SEMANTIC_V2_SOURCE_ANCHOR_ID,
        title: "Towers of Silence",
        kind: "practice",
        status: "in-review",
        citation: {
          label:
            "Encyclopaedia Iranica, Burial iii. In Zoroastrianism",
          url: "https://www.iranicaonline.org/articles/burial-iii/",
          accessedVersion: `Accessed 2026-07-17; ${REVIEW_VERSION}`,
        },
        summary:
          "A bounded historical source for Zoroastrian exposure practices, later dakhma structures, avoidance of contaminating the elements, and the separation of exposure from later bone-receptacle functions.",
        reliability: "secondary",
        editorialNotes: [
          "Cultural boundary: dakhma exposure is a Zoroastrian funerary practice with religious, historical, regional, and chronological variation; it is not a generic dark-cult custom.",
          "Historical boundary: later roofless structures supported exposure and could be associated with the later collection or containment of bones, but no one layout or procedure should be treated as universal.",
          "Material boundary: open sky, drainage, boundary, and receptacle functions may inform spatial design without copying sacred formulae or asking players to perform a living rite.",
          "Ethical boundary: exposed remains are people, not decorative spectacle; scavenger behavior must never be framed as proof of moral worth or spiritual success.",
          "Fictional transformation: refused passage, supernatural shadows, Sky Measure, moving bones, and all game procedures are original Cruor fantasy.",
          "Ownership boundary: no modern Monster grafts use the towers-of-silence Source Anchor, and this module owns only Archive and Dark Places content.",
          "Editorial and cultural-source review approved by Danilo on 2026-07-17 after local QA. Verifiable image provenance remains required for publication.",
        ],
        tags: ["funerary-practice", "zoroastrianism", "ritual-architecture"],
      },
      inspiration: {
        schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
        id: "inspiration-towers-of-silence-v2",
        slug: "towers-of-silence",
        title: "Towers of Silence",
        status: "approved",
        sourceAnchors: [TOWERS_OF_SILENCE_SEMANTIC_V2_SOURCE_ANCHOR_ID],
        sourceTypes: ["Funerary Practice", "Ritual Architecture", "History"],
        themes: [
          "exposure",
          "ritual boundary",
          "open sky",
          "material transformation",
          "separation of remains",
        ],
        motifs: [
          "roofless court",
          "drainage channel",
          "bone receptacle",
          "boundary stone",
          "circling shadow",
        ],
        horror: ["Religious Horror", "Gothic"],
        contexts: ["chapel", "crypt", "ruins", "tower", "mountain"],
        editorial: {
          deck: "Open courts, strict boundaries, drainage, and later bone-receptacle functions become a fair spatial pressure system while the historical Zoroastrian practice remains distinct from Cruor supernatural fiction.",
          whatItIs:
            "In Zoroastrian funerary traditions, exposure of the dead developed within rules intended to prevent the corpse from contaminating earth, fire, or water. Later dakhma structures are often described as roofless, bounded exposure places, with historical practices varying across time and region and with bones later collected or contained.",
          whyItDisturbs:
            "The dead are handled through separation, exposure, and controlled material transformation rather than concealment. In the fictional module, horror begins when architecture meant to preserve boundaries can no longer complete its sequence and starts measuring every interruption as unfinished passage.",
          creativeUses: [
            "Use exposed and sheltered routes to make boundaries and cover mechanically readable.",
            "Turn drainage, scratch paths, and receptacles into investigative evidence rather than decorative corpses.",
            "Let restoring material order reduce pressure without requiring players to imitate a sacred rite.",
            "Use an announced sky-facing route as a fair climax while preserving a sheltered retreat.",
          ],
          cautions: [
            "Do not present Zoroastrian funerary practice as barbaric, evil, monolithic, or frozen outside history.",
            "Do not claim that carrion birds or speed of exposure reveal the moral or spiritual worth of the dead.",
            "Do not use exposed remains as spectacle without personhood, community, and material context.",
            "Clearly label supernatural refusal, judgment, shadows, and pressure mechanics as Cruor fantasy rather than historical belief.",
            "Do not require players to reproduce prayers, purity rules, or sacred procedures as a game solution.",
          ],
        },
        media: {
          imageKey: "card-tower-of-silence.webp",
          imageProvider: "local",
          imageAlt:
            "Towers of Silence inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
          imageCredit:
            "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep the asset unpublished until provenance is verified or the image is replaced.",
          icon: "fa-tower-observation",
        },
        tags: [
          "source:towers-of-silence",
          "capability:dark-places",
          "cultural-review-required",
        ],
        provenance: MODULE_PROVENANCE,
      },
      components: DARK_PLACES_COMPONENTS,
      metadata: {
        author: "Cruor Games",
        revision: 1,
        reviewedAt: "2026-07-17",
        sourceFile:
          "shared/content/content-packs/towers-of-silence-semantic-v2-pack.js",
        capabilityWaivers: [],
        modernCapabilityLinks: [],
      },
      provenance: MODULE_PROVENANCE,
    },
  ],
  metadata: {
    bundled: true,
    registryRole: "semantic-v2-editorial-approved",
    humanApprovalRequired: false,
    retainedLegacyPublicBehavior: true,
    editorialStatus: "approved",
    publicationBlockers: ["image-provenance-required"],
    culturalSourceBoundary:
      "Historical exposure, bounded architecture, drainage, and later bone handling are source context; the Open Reliquary, Sky Measure, supernatural shadows, refused passage, and all mechanics are fictional.",
    modernCapabilityLinks: [],
  },
});

export const TOWERS_OF_SILENCE_SEMANTIC_V2_MODULE =
  TOWERS_OF_SILENCE_SEMANTIC_V2_PACK.modules[0];
