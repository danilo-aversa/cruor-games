import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeContentPackV0_2,
  normalizeSemanticProvenance,
} from "../contracts/semantic/index.js";
import {
  WOLF_SPIDERS_MONSTER_GRAFT_V2_DEFINITIONS,
  WOLF_SPIDERS_MONSTER_GRAFT_V2_SOURCE_MODE,
} from "./wolf-spiders-monster-grafts-v2.js";

export const WOLF_SPIDERS_SEMANTIC_V2_PACK_ID = "wolf-spiders-semantic-v2";
export const WOLF_SPIDERS_SEMANTIC_V2_MODULE_ID = "wolf-spiders";
export const WOLF_SPIDERS_SEMANTIC_V2_SOURCE_ANCHOR_ID = "wolf-spiders";

const REVIEW_VERSION = "phase8-wolf-spiders-editorial-candidate-v1";

function createProvenance({
  legacyIds = [],
  relation = "derived",
  note = "Editorially re-authored from the frozen Wolf Spiders module and its ground-hunting, eye-shine, maternal transport, vibration, and dispersal vocabulary.",
  migrationNote = "AI-assisted editorial candidate. Biological-source review, independent Monster graft snapshotting, image provenance, sample QA, and final human approval remain explicit publication gates.",
} = {}) {
  return normalizeSemanticProvenance({
    sources: [
      {
        sourceAnchorId: WOLF_SPIDERS_SEMANTIC_V2_SOURCE_ANCHOR_ID,
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
  legacyIds: ["wolf-spiders", "inspiration-wolf-spiders", "Wolf Spiders"],
  relation: "editorial-constraint",
  note: "Observed wolf-spider biology is retained as source context. The Broodward, Tremor Pressure, giant warrens, supernatural brood behavior, corrosive silk, and all game procedures are original Cruor fantasy extrapolations.",
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
    sourceAnchors: [WOLF_SPIDERS_SEMANTIC_V2_SOURCE_ANCHOR_ID],
    sourceTypes: ["Animal Behavior", "Arachnology", "Natural History"],
    themes: [
      "ground predation",
      "maternal transport",
      "vibration territory",
      "sudden dispersal",
    ],
    motifs,
    horror: ["Animal Horror", "Body Horror"],
    contexts: ["cave", "cellar", "forest", "ruins"],
    compatibility: {
      capabilities: ["dark-places"],
      excludedCapabilities: ["monster-composer"],
    },
    generation: { phase: 8, ...generation },
    semantic: { ...semantic, provenance },
    provenance,
  };
}

function createMonsterComponent(definition) {
  const provenance = createProvenance({
    legacyIds: [definition.id],
    relation: "editorial-constraint",
    note: "The canonical candidate preserves the authored Monster graft identity, structured rules, frame fit, mechanics, and counterplay exactly through the documented temporary bridge. Biological inspiration does not make corrosive webs, supernatural brood effects, or giant-spider tactics factual claims.",
    migrationNote: "Exact Monster graft parity is preserved through the legacy shared-component bridge. Replace the bridge with an independent frozen v2 snapshot before legacy removal; human publication approval also remains required.",
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
    sourceAnchors: [WOLF_SPIDERS_SEMANTIC_V2_SOURCE_ANCHOR_ID],
    sourceTypes: ["Animal Behavior", "Arachnology"],
    themes: ["predation", "maternal defense", "brood dispersal"],
    motifs: ["eye shine", "carried young", "ground hunting", "vibration"],
    horror: ["Animal Horror", "Body Horror"],
    contexts: ["beast", "aberration", "spider"],
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
    id: "wolf-spiders-place-identity",
    title: "The Broodward",
    semanticType: "place-identity",
    legacyIds: [
      "places-premise-burdened-brood-warren",
      "places-premise-hunting-floor-parallax",
      "location-region-spider-nursery-floor",
      "location-region-brood-nursery-floor",
      "location-region-eye-shine-hunting-gallery",
    ],
    motifs: ["low nursery hollows", "hunting lanes", "shuttered lamps"],
    generation: { primary: true },
    semantic: {
      originalPurpose:
        "A low storage complex joined root cellars, drying galleries, lamp rooms, and service passages beneath a woodland estate. Workers used raised boards and marked floor lanes to keep goods dry and carts moving through cramped ground-level routes.",
      originalUsers: [
        "estate workers and cellar keepers",
        "hunters storing lamps, cord, and winter provisions",
        "families sheltering livestock and food below ground",
      ],
      historicalChange:
        "After repeated flooding opened the foundation to burrows, the staff found egg sacs attached beneath carts and dense clusters of young riding larger bodies through the service lanes. Attempts to burn the infestation scattered it into the walls and taught the surviving colony to read footsteps, heat, and lamp angles.",
      horrorTruth:
        "The site is now a supernatural brood territory organized around vibration and maternal defense. Its inhabitants do not act like a wolf pack or a human society: they hunt mostly alone, converge on transmitted disturbance, and protect mobile nurseries that can become sudden swarms when threatened.",
      currentFunction:
        "The Broodward routes intruders across listening floors. Quiet marked lanes, altered light, weighted decoys, and intact nursery boundaries provide safe movement; impacts, fire, and careless silk contact raise Tremor Pressure and trigger interception.",
      currentConflict:
        "A brooding guardian has settled over the estate's only intact route key while workers trapped in a sealed lamp room believe fire is their last defense. Burning the central nursery would open the route briefly but scatter the young into every refuge.",
      playerEntryPoints: [
        "Recover the route key without forcing the brooding guardian to abandon its young.",
        "Escort survivors through the dustless hunting lanes before their lamp oil runs out.",
        "Identify which nursery hollow conceals the mother's bypass into the sealed rooms.",
      ],
      stakes: [
        "If Tremor Pressure reaches its final stage, an announced maternal intercept blocks the loudest route while the marked retreat remains open.",
        "If the nursery is burned, the brood disperses into adjacent rooms and converts one refuge into hazardous terrain.",
        "If the party preserves the nursery boundary, they may negotiate movement by redirecting vibration rather than killing every creature.",
      ],
      toneKeywords: ["low", "watchful", "tactile", "protective"],
    },
  }),
  createDarkPlacesComponent({
    id: "wolf-spiders-site-atmosphere",
    title: "Low Light, Listening Ground",
    semanticType: "site-atmosphere",
    legacyIds: [
      "places-sensory-many-pinpoint-eyes",
      "places-sensory-dry-skitter-under-debris",
      "places-anomaly-floor-that-flinches",
    ],
    motifs: ["green eye shine", "dry skitter", "moving dust"],
    semantic: {
      signature:
        "The site keeps attention near the floor: reflected eyes answer angled light, dust records repeated hunting lanes, fine strands carry vibration, and still debris sometimes recoils before settling again.",
      manifestations: [
        {
          id: "angled-eye-shine",
          text: "A low lamp angle returns rows of green-gold points from cracks that look empty in direct light.",
          senses: ["sight", "direction"],
          intensity: "low",
          frequency: "recurring",
        },
        {
          id: "dry-hidden-skitter",
          text: "A dry skitter passes beneath lint or leaf litter and stops exactly when weight shifts above it.",
          senses: ["sound", "proprioception"],
          intensity: "low",
          frequency: "recurring",
        },
        {
          id: "tension-through-floor",
          text: "Fine tension reaches the soles before a distant strand hums against wood or stone.",
          senses: ["touch", "sound"],
          intensity: "medium",
          frequency: "pervasive",
        },
        {
          id: "warm-nursery-air",
          text: "Nursery hollows hold a close animal warmth and the faint mineral smell of molts and damp silk.",
          senses: ["temperature", "smell"],
          intensity: "medium",
          frequency: "localized",
        },
      ],
      exclusions: [
        "constant sticky webbing used as a generic spider-room texture",
        "pack-hunting or wolf folklore presented as wolf-spider biology",
        "untelegraphed swarms that appear without a carrier, nursery, or vibration cue",
      ],
      escalationLinks: ["tremor-pressure"],
    },
  }),
  createDarkPlacesComponent({
    id: "tremor-pressure",
    title: "Tremor Pressure",
    semanticType: "global-rule",
    legacyIds: [
      "places-hazard-scattering-brood",
      "places-hazard-tripline-vibration-net",
      "places-twist-mother-guards-key",
      "places-twist-swarm-chooses-warmest",
    ],
    motifs: ["listening silk", "weighted decoy", "maternal intercept"],
    semantic: {
      id: "tremor-pressure",
      title: "Tremor Pressure",
      scope: "location",
      category: "pressure-track",
      trigger: {
        events: [
          "make-a-loud-impact-on-a-listening-floor",
          "cross-an-unmarked-vibration-line",
          "disturb-an-egg-sac-or-nursery-hollow",
          "use-open-fire-in-an-occupied-brood-region",
        ],
        timing:
          "Immediately after a listed event; outside combat, also check accumulated pressure at the end of each ten-minute exploration turn spent in an unquiet region.",
        frequencyLimit:
          "Once per combat round, or once per ten-minute exploration turn.",
      },
      state: { label: "Pressure", minimum: 0, maximum: 4, initial: 0 },
      resolution: {
        timing:
          "At the end of each combat round; outside combat, at the end of each ten-minute exploration turn.",
        threshold: 2,
        savingThrow: null,
        check: {
          ability: "Dexterity",
          skills: ["Stealth", "Survival"],
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
            "On a failed check outside combat, the group loses ten minutes and the nearest observed hunter occupies a stated low cover position. In combat, the acting creature's remaining movement ends at the last marked safe lane. The rule never creates an unseen creature, closes an exit, or changes real map topology without an announced sign.",
        },
        duration: "until-the-region-is-quieted-or-the-next-check-resolves",
        range: "location",
        area: "the-active-region-and-its-marked-connections",
        frequency:
          "Once per combat round, or once per ten-minute exploration turn, at Pressure 2 or higher.",
        actionEconomy: "automatic",
      },
      counterplay: [
        {
          id: "pad-and-pair-the-route",
          actionCost:
            "One action in combat, or one minute during exploration, with cloth, loose soil, boards, or similar material.",
          check: {
            ability: "Dexterity",
            skills: ["Stealth", "Survival"],
            dc: null,
            scalingKey: "intrusion",
          },
          success:
            "Mark one connection as a padded lane and reduce Pressure by 1. Moving together along that lane does not trigger pressure until the padding is disturbed.",
        },
        {
          id: "redirect-the-tremor",
          actionCost:
            "One action in combat, or one minute during exploration, to weight, pluck, or tension a visible line.",
          check: null,
          success:
            "Send the next vibration toward a named empty cover position, reduce Pressure by 1, and reveal which route the nearest hunter uses to investigate it.",
        },
        {
          id: "respect-the-nursery-boundary",
          actionCost:
            "One action in combat, or one minute during exploration, to replace cover, close a hollow, or move heat away without touching the brood.",
          check: null,
          success:
            "Stabilize one nursery boundary and reduce Pressure by 1. That nursery cannot trigger the track again unless directly harmed.",
        },
      ],
      reset: {
        condition:
          "Outside combat, the group spends one full ten-minute exploration turn in a marked refuge without transmitting a listed disturbance and with every used nursery boundary intact. During combat, Pressure can be reduced but cannot fully reset.",
        value: 0,
      },
      escalation: [
        {
          at: 2,
          effect:
            "Eye shine appears at one stated low cover position. Begin the end-of-round or end-of-turn movement check while unmarked floor remains in use.",
        },
        {
          at: 3,
          effect:
            "A carrier or brooding guardian changes position along a visible dustless lane. State whether it is hunting, relocating young, or guarding an object before the players act.",
        },
        {
          at: 4,
          effect:
            "Maternal Intercept begins. Announce the loudest unpadded route and a one-step countdown. At the end of the next combat round or ten-minute exploration turn, the guardian blocks that route and a brood scatter makes its adjacent floor difficult terrain unless Pressure is reduced below 4 or the disturbance is redirected. The last padded retreat remains available.",
        },
      ],
      gmSummary:
        "Advance Pressure only on listed disturbances and at most once per combat round or exploration turn. Every hunter begins at a stated cover position, every brood scatter has a carrier or nursery cue, and stage 4 names the threatened route one full step before resolution while preserving a marked retreat.",
      playerFacingSigns: [
        "Low eye shine gathers along the route carrying the strongest vibration.",
        "Dustless lanes and tensioned strands reveal where hunters will approach.",
        "Young shift toward the guardian's sheltered side before a maternal intercept.",
      ],
    },
  }),
  createDarkPlacesComponent({
    id: "wolf-spiders-sign-eye-shine-line",
    title: "Eye Shine Draws a Lane",
    semanticType: "recurring-sign",
    legacyIds: ["places-clue-dustless-hunting-lane"],
    motifs: ["green reflection", "low cracks", "safe cover"],
    semantic: {
      id: "wolf-spiders-sign-eye-shine-line",
      description:
        "Angled light catches eye shine in a pattern that reveals where a hunter can see, where low cover interrupts sight, and which lane it repeatedly crosses.",
      placement: {
        frequency: "recurring",
        minimumRooms: 2,
        maximumRooms: 3,
        allowedRoomRoles: [],
        forbiddenRoomRoles: [],
        preferredFeatures: ["floor", "crack", "lamp", "debris"],
      },
      variations: [
        "Three green points vanish in sequence along a dustless strip rather than all at once.",
        "A shuttered lamp reveals a line of eyes everywhere except behind one low stone bench.",
        "Reflections appear beside a hidden door only when the light is held near the floor.",
      ],
      interaction: {
        trigger:
          "A creature changes the angle or intensity of a light source while another watches the floor.",
        effect:
          "The group identifies one hunting lane, one safe cover position, or one concealed low opening before crossing the room.",
        counterplay:
          "Use angled light briefly, then move through revealed cover before watchers converge on the lamp.",
      },
      revelationLink: "hunting-lane-revelation",
    },
  }),
  createDarkPlacesComponent({
    id: "wolf-spiders-sign-molted-compass",
    title: "Molts Face the Nursery",
    semanticType: "recurring-sign",
    legacyIds: ["places-clue-molted-eye-husks"],
    motifs: ["translucent molt", "empty lenses", "hidden crack"],
    semantic: {
      id: "wolf-spiders-sign-molted-compass",
      description:
        "Shed skins preserve legs, hairs, and empty eye lenses in orientations that record repeated movement between shelter, hunting ground, and nursery.",
      placement: {
        frequency: "recurring",
        minimumRooms: 1,
        maximumRooms: 3,
        allowedRoomRoles: [],
        forbiddenRoomRoles: [],
        preferredFeatures: ["wall", "crack", "threshold", "shelf"],
      },
      variations: [
        "Several translucent husks cling head-first toward the same narrow wall crack.",
        "A larger molt faces away from the nursery while smaller skins point toward its sheltered side.",
        "Empty eye lenses catch the lamp in a sequence that matches the dustless route between rooms.",
      ],
      interaction: {
        trigger:
          "The characters compare the orientation and size of molts in two different rooms.",
        effect:
          "They distinguish the mother's bypass, the brood's dispersal route, and the hunters' ordinary patrol lane.",
        counterplay:
          "Follow the adult route only after checking whether small molts indicate an occupied nursery boundary.",
      },
      revelationLink: "nursery-route-revelation",
    },
  }),
  createDarkPlacesComponent({
    id: "wolf-spiders-sign-carried-brood",
    title: "One Body Becomes Many",
    semanticType: "recurring-sign",
    legacyIds: ["places-anomaly-back-brood-effigy"],
    motifs: ["carried young", "crowded back", "protective turn"],
    semantic: {
      id: "wolf-spiders-sign-carried-brood",
      description:
        "A carrier's back, an effigy, or a shadow first reads as one textured body, then resolves into many young arranged around a protected center.",
      placement: {
        frequency: "recurring",
        minimumRooms: 1,
        maximumRooms: 2,
        allowedRoomRoles: [],
        forbiddenRoomRoles: [],
        preferredFeatures: ["effigy", "body", "shadow", "altar"],
      },
      variations: [
        "A rough-backed silhouette turns and hundreds of smaller reflections rotate with it.",
        "Tiny carved bodies cling to an ancestor figure, all facing away from one protected hollow.",
        "A carrier raises its abdomen and the brood shifts to the side farthest from heat and impact.",
      ],
      interaction: {
        trigger:
          "The characters stop advancing and observe which side of the carrier or effigy the young protect.",
        effect:
          "The protected side identifies the nursery, guarded object, or safest direction for a nonviolent withdrawal.",
        counterplay:
          "Do not strike the carrier blindly; move heat and vibration away from the protected side or offer alternate shelter.",
      },
      revelationLink: "maternal-priority-revelation",
    },
  }),
  createDarkPlacesComponent({
    id: "wolf-spiders-sign-listening-silk",
    title: "Silk Announces, It Does Not Snare",
    semanticType: "recurring-sign",
    legacyIds: ["places-reward-brood-silk-marker", "places-reward-eye-shine-lantern"],
    motifs: ["alarm line", "weighted strand", "route marker"],
    semantic: {
      id: "wolf-spiders-sign-listening-silk",
      description:
        "Fine, non-sticky lines connect floor edges, debris, and low cracks as an alarm network that can be read, damped, or redirected.",
      placement: {
        frequency: "recurring",
        minimumRooms: 2,
        maximumRooms: 3,
        allowedRoomRoles: [],
        forbiddenRoomRoles: [],
        preferredFeatures: ["floor", "door", "debris", "crack"],
      },
      variations: [
        "Dusty silk at ankle height hums toward a low crack instead of tightening around the boot.",
        "A weighted strand points away from a nursery and toward an empty hunting lane.",
        "One cut line has been retied around a stone, redirecting every tremor toward a false route.",
      ],
      interaction: {
        trigger:
          "A character touches a visible strand with a tool, weight, or loose object rather than a bare hand or foot.",
        effect:
          "The strand reveals its destination and can redirect the next transmitted disturbance to a chosen empty position.",
        counterplay:
          "Damp or weight lines instead of burning them; fire disperses the brood and raises pressure.",
      },
      revelationLink: "tremor-network-revelation",
    },
  }),
  createDarkPlacesComponent({
    id: "wolf-spiders-sensory-profile",
    title: "Broodward Sensory Profile",
    semanticType: "sensory-profile",
    legacyIds: [],
    motifs: ["low reflections", "tension hum", "mineral molts"],
    semantic: {
      signature:
        "Low-angle vision, transmitted vibration, dry movement, animal warmth, and the close texture of molts make the site readable as a hunting and nursery territory rather than a generic web-filled lair.",
      variants: {
        sight: [
          "Green-gold points appear only when the lamp is held near the floor.",
          "Dust lies untouched except for one narrow polished hunting lane.",
          "A dark patch recoils in several tiny waves before imitating debris again.",
          "Translucent molts preserve empty eye clusters aimed toward a low crack.",
        ],
        sound: [
          "A dry skitter crosses beneath debris and stops when weight shifts.",
          "One silk line hums after the footstep that should have moved it.",
          "Small impacts answer from several hollows in a widening sequence.",
          "A larger body moves without the many light sounds riding across it.",
        ],
        smell: [
          "Damp silk, dry soil, and mineral molts gather in the low air.",
          "A nursery hollow smells warmer and more animal than the surrounding cellar.",
          "Scorched lint marks a route where fire drove the brood instead of killing it.",
          "An abandoned lane smells of lamp oil carried repeatedly along the floor.",
        ],
        touch: [
          "Fine tension reaches the sole before the visible strand moves.",
          "Loose dust trembles against the fingers without any nearby impact.",
          "A brood-silk marker vibrates toward the quieter of two exits.",
          "The floor's warmth shifts sideways as a carrier turns beneath cover.",
        ],
        taste: [
          "Dust leaves a dry mineral taste near fresh molts.",
          "Smoke carries a bitter trace of scorched silk long after the flame is gone.",
          "The air above a nursery is close and faintly salty.",
        ],
        temperature: [
          "A protected hollow holds steady warmth while the hunting lane stays cool.",
          "Heat drains from the floor a moment before young scatter away from it.",
          "The marked refuge remains cooler than the occupied brood region.",
        ],
        proprioception: [
          "The body feels an approaching tremor through bent knees before hearing it.",
          "Stillness makes every small shift of balance feel amplified across the room.",
          "A padded lane absorbs footfall so completely that the next hard surface feels abrupt.",
        ],
      },
      intensityTiers: {
        low: [
          "One eye-shine point vanishes behind known cover.",
          "A visible line hums toward an empty crack.",
        ],
        medium: [
          "Several hunters change cover along a readable dustless lane.",
          "Young shift across a carrier before the guardian turns.",
        ],
        high: [
          "Every low reflection faces the announced route while the padded retreat remains dark.",
        ],
      },
      roomRoleBias: {
        entrance: ["Old floor marks establish how workers once moved without transmitting vibration."],
        threshold: ["Fine lines reveal which opening carries disturbance into the next room."],
        ritual: ["An effigy translates maternal burden into an intentional human arrangement."],
        secret: ["Molts and eye shine outline a low bypass concealed by ordinary debris."],
        climax: ["The brooding guardian, protected object, and marked retreat remain visible together."],
        connector: ["Dustless lanes show repeated passage between cover positions."],
      },
      geometryBias: {
        circular: ["Eye shine forms an incomplete ring around the protected center."],
        narrow: ["One strand transmits every footstep farther than expected."],
        large: ["Separate low cover positions create readable hunting lanes."],
        vertical: ["Young and molts gather beneath ledges rather than above the main route."],
        ruined: ["Broken floor edges reveal burrows and tension lines without hiding all choices."],
      },
      exclusions: [
        "generic sticky-web descriptions in every room",
        "unreadable swarms with no carrier or nursery source",
        "wolf-pack language presented as arachnid behavior",
      ],
      repetitionPolicy: {
        exactTextCooldown: "all-rooms",
        senseCooldown: 1,
        allowSignatureRepeat: false,
      },
    },
  }),
  createDarkPlacesComponent({
    id: "wolf-spiders-read-aloud-profile",
    title: "Broodward Read-Aloud Profile",
    semanticType: "read-aloud-profile",
    legacyIds: [],
    motifs: ["low gallery", "nursery hollows", "angled lamp"],
    semantic: {
      fragments: {
        spatialAnchors: [
          { id: "raised-board-entry", text: "Raised boards mark a narrow route from the entrance across a floor of cracked earth and old cellar dust.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "nursery-hollow-room", text: "Shallow hollows gather beneath shelves and roots, each lined with lint, pale molts, and loose silk.", roomRoles: ["threshold", "clue"], sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "hunting-gallery", text: "A long low gallery runs between floor-level cracks and a sequence of shuttered lamp hooks.", geometry: ["narrow", "large"], sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "brooding-key-chamber", text: "The final chamber centers on a low stone plinth, a visible route key, and the dark body sheltering it.", roomRoles: ["final", "climax"], sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "padded-worker-lane", text: "Folded sacking and loose boards preserve an old worker lane along one wall.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "root-cellar-bypass", text: "A root-lined opening passes beneath the main floor and returns beside a sealed store door.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "lamp-angle-station", text: "A hooded lamp rests on a short stand designed to cast light almost parallel to the floor.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "weighted-line-bench", text: "Stones, hooks, and small weights are arranged on a bench beside a diagram of the cellar floor.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "cool-refuge-room", text: "A compact refuge is lined with thick cloth and separated from the bare floor by a shallow wooden platform.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "broken-foundation-court", text: "The foundation opens into a broad low court where burrows interrupt the original drainage channels.", geometry: ["large", "ruined"], sourceComponentId: "wolf-spiders-read-aloud-profile" },
        ],
        sensoryBeats: [
          { id: "green-low-reflections", text: "Pinpoint green reflections appear close to the floor when the lamp tilts.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "dry-skitter-stop", text: "A dry skitter passes under the debris and stops with the next breath.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "sole-tension", text: "A fine tension reaches the soles before one visible strand begins to hum.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "warm-hollow-air", text: "Close animal warmth rises from one hollow while the surrounding floor stays cool.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "mineral-molt-dust", text: "The air tastes faintly of mineral dust and old shed skin.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
        ],
        visibleFeatures: [
          { id: "dustless-route", text: "One narrow lane is polished clean through an otherwise even layer of dust.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "eye-husk-compass", text: "Translucent husks cling to the wall with every empty eye cluster facing the same crack.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "listening-lines", text: "Fine non-sticky lines cross between debris piles, floor edges, and low openings.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "crowded-effigy", text: "A carved ancestor carries dozens of tiny jointed bodies across its back.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "padded-retreat-mark", text: "Double chalk marks follow the only lane softened with cloth and loose soil.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
        ],
        unsettlingDetails: [
          { id: "floor-flinch", text: "A dark patch recoils in several small waves before becoming ordinary debris again.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "many-turn-with-one", text: "One rough-backed silhouette turns and a field of smaller reflections turns with it.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "wrong-fire-solution", text: "Scorch marks spread away from the old fire in branching routes that lead toward sealed rooms.", tags: ["gm-only"], sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "key-under-guardian", text: "The route key lies beneath the guardian exactly where a brood would shelter from impact.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "warmest-still-target", text: "The smallest shapes drift toward the warmest motionless body rather than the loudest one.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
        ],
        motionOrChange: [
          { id: "eye-line-repositions", text: "The line of reflected eyes shifts one cover position closer after the floor vibrates, and every smaller reflection follows the same route.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "brood-sheltered-side", text: "The young move across the carrier to the side farthest from the raised lamp, tightening around the sheltered center before it turns.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
        ],
        exitsAndDepth: [
          { id: "padded-return-lane", text: "The padded double-marked lane leads back to the cool refuge without crossing a nursery hollow or touching any line that enters the walls.", sourceComponentId: "wolf-spiders-read-aloud-profile" },
          { id: "maternal-intercept-route", text: "Every low reflection gathers beside one unpadded exit while the marked retreat remains empty, cool, and clearly visible behind the group.", tags: ["future-reveal"], sourceComponentId: "wolf-spiders-read-aloud-profile" },
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
    id: "wolf-spiders-session-guide",
    title: "Running the Broodward",
    semanticType: "session-guide",
    legacyIds: [],
    motifs: ["route key", "lamp refuge", "maternal boundary"],
    semantic: {
      openingBeat: {
        situation:
          "The group enters on an old padded worker lane while survivors in a sealed lamp room prepare to burn the central nursery.",
        immediateSignal:
          "A low lamp angle reveals a line of eye shine around the visible route key, then a rough-backed guardian turns and hundreds of smaller reflections turn with it.",
        playerDecision:
          "Approach the key, redirect the listening floor, or reach the survivors before they ignite the oil.",
      },
      objectives: [
        "Establish a padded route between the entrance, a cool refuge, and the key chamber.",
        "Distinguish hunting lanes, nursery routes, and the mother's bypass through molts and eye shine.",
        "Recover the route key or open an alternate path without causing a site-wide brood scatter.",
      ],
      alwaysOnRuleIds: ["tremor-pressure"],
      pressureTrackId: "tremor-pressure",
      clueFlow: {
        requiredRevelations: [
          "hunting-lane-revelation",
          "nursery-route-revelation",
          "maternal-priority-revelation",
        ],
        links: [
          {
            from: "hunting-lane-revelation",
            to: "nursery-route-revelation",
            condition:
              "The characters compare eye-shine cover with molt orientation and see that the brood route avoids the adult patrol lane.",
          },
          {
            from: "nursery-route-revelation",
            to: "maternal-priority-revelation",
            condition:
              "The characters follow the small molts to the guarded side and identify what the carrier protects before approaching the key.",
          },
        ],
        fallbackClues: [
          "The hooded lantern reveals a dustless lane and one safe cover position.",
          "A fresh molt preserves the direction of the mother's bypass.",
          "A weighted listening line redirects attention and exposes the protected side of the key chamber.",
        ],
      },
      stallMoves: [
        {
          id: "advance-pressure-with-cover",
          trigger:
            "The table debates after receiving a clear lane, molt, or listening-line cue.",
          action:
            "Advance Pressure by 1 and move one observed eye-shine line to a named low cover position.",
        },
        {
          id: "survivors-ready-the-fire",
          trigger: "The characters ignore the sealed lamp room or central nursery.",
          action:
            "The survivors spill lamp oil along one stated threshold, making the consequence of delay visible without igniting it yet.",
        },
        {
          id: "weighted-line-reveals-bypass",
          trigger: "A required revelation has been missed twice.",
          action:
            "A loose weight drops onto a listening line and draws the mother's exact bypass in dust without resolving the final choice.",
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
          "At Pressure 4, announce the exact Maternal Intercept route and one full combat round or ten-minute exploration turn of counterplay. Preserve the padded retreat, keep the key and protected brood visible, and resolve the climax through retrieval, redirection, alternate shelter, or deliberate scattering rather than an unexplained swarm.",
      },
    },
  }),
];

const MONSTER_COMPONENTS = WOLF_SPIDERS_MONSTER_GRAFT_V2_DEFINITIONS.map(
  createMonsterComponent,
);

export const WOLF_SPIDERS_SEMANTIC_V2_PACK = normalizeContentPackV0_2({
  schemaVersion: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
  id: WOLF_SPIDERS_SEMANTIC_V2_PACK_ID,
  title: "Wolf Spiders Semantic Content Pack",
  version: "0.2.0-phase8-candidate1",
  status: "draft",
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: [
    "dark-places",
    "inspiration-archive",
    "monster-composer",
    "wolf-spiders",
    "phase8",
  ],
  modules: [
    {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
      id: WOLF_SPIDERS_SEMANTIC_V2_MODULE_ID,
      title: "Wolf Spiders",
      packId: WOLF_SPIDERS_SEMANTIC_V2_PACK_ID,
      status: "in-review",
      locale: "en",
      capabilities: ["inspiration-archive", "dark-places", "monster-composer"],
      sourceAnchor: {
        schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SOURCE_ANCHOR,
        id: WOLF_SPIDERS_SEMANTIC_V2_SOURCE_ANCHOR_ID,
        title: "Wolf Spiders",
        kind: "other",
        status: "in-review",
        citation: {
          label:
            "Australian Museum, Wolf Spiders and Egg sacs, spiderlings and dispersal",
          url: "https://australian.museum/learn/animals/spiders/wolf-spiders/",
          accessedVersion: `Accessed 2026-07-17; ${REVIEW_VERSION}`,
        },
        summary:
          "A natural-history source for agile ground hunting, burrow and retreat use, eye shine, egg sacs carried from the spinnerets, and spiderlings transported on the female's back until dispersal.",
        reliability: "secondary",
        editorialNotes: [
          "Biological boundary: Australian Museum describes wolf spiders as robust ground hunters; some wander, some use burrows or temporary retreats, females carry egg sacs attached to spinnerets, and hatchlings ride on the mother's back until dispersal.",
          "Observation boundary: angled torchlight can reveal reflected eyes; the canonical module turns this into readable hunting lanes rather than claiming supernatural vision or coordinated pack tactics.",
          "Maternal-care boundary: peer-reviewed work on Pardosa species supports prolonged brood transport and gradual dispersal, but exact duration and behavior vary by species and conditions.",
          "Fictional transformation: giant warrens, Tremor Pressure, supernatural carrier swarms, corrosive webs, engineered alarm networks, and all Monster mechanics are original Cruor game content.",
          "Terminology correction: this module concerns wolf spiders, not wolves in folklore, social wolf packs, or lupine transformation.",
          "Publication gate: human biological-source review, independent Monster graft snapshotting, and verifiable image provenance are still required.",
        ],
        tags: ["animal-behavior", "arachnology", "maternal-care"],
      },
      inspiration: {
        schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
        id: "inspiration-wolf-spiders-v2",
        slug: "wolf-spiders",
        title: "Wolf Spiders",
        status: "in-review",
        sourceAnchors: [WOLF_SPIDERS_SEMANTIC_V2_SOURCE_ANCHOR_ID],
        sourceTypes: ["Animal Behavior", "Arachnology", "Natural History"],
        themes: [
          "ground predation",
          "maternal transport",
          "protective violence",
          "sudden dispersal",
          "vibration territory",
        ],
        motifs: [
          "eye shine",
          "carried egg sac",
          "spiderlings on the back",
          "dustless hunting lane",
          "listening silk",
        ],
        horror: ["Animal Horror", "Body Horror"],
        contexts: ["cave", "cellar", "forest", "ruins", "noble house"],
        editorial: {
          deck: "Ground hunting, reflected eyes, maternal transport, and sudden dispersal become a fair territorial pressure system without confusing wolf-spider biology with web-building stereotypes or wolf-pack folklore.",
          whatItIs:
            "Wolf spiders are a diverse family of mostly ground-associated active hunters. Females characteristically carry an egg sac attached to their spinnerets and later transport newly hatched young on the back before dispersal.",
          whyItDisturbs:
            "One moving body can conceal many smaller bodies, an apparently empty floor can hold low ambush routes, and ordinary movement becomes information transmitted through ground, silk, debris, and close cover.",
          creativeUses: [
            "Make low-angle light and eye shine reveal routes, cover, and concealed openings.",
            "Separate hunting lanes from nursery routes so ecological evidence becomes navigational information.",
            "Use maternal defense as a visible priority that creates alternatives to direct combat.",
            "Let vibration be redirected, padded, or interpreted instead of functioning as an unavoidable alarm.",
          ],
          cautions: [
            "Do not describe wolf spiders as social pack hunters or derive them from wolf folklore.",
            "Do not imply that real wolf spiders build elaborate prey-capture webs; clearly label engineered webs and corrosive silk as fantasy grafts.",
            "Do not treat all species as identical in size, habitat, maternal duration, or defensive behavior.",
            "Never trigger a brood scatter without a visible carrier, egg sac, nursery, or transmitted-disturbance cue.",
          ],
        },
        media: {
          imageKey: "card-wolf-spider.webp",
          imageProvider: "local",
          imageAlt:
            "Wolf Spiders inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
          imageCredit:
            "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep the asset unpublished until provenance is verified or the image is replaced.",
          icon: "fa-spider",
        },
        tags: [
          "source:wolf-spiders",
          "capability:dark-places",
          "capability:monster-composer",
          "biology-review-required",
        ],
        provenance: MODULE_PROVENANCE,
      },
      components: [...DARK_PLACES_COMPONENTS, ...MONSTER_COMPONENTS],
      metadata: {
        author: "Cruor Games",
        revision: 1,
        reviewedAt: "",
        sourceFile:
          "shared/content/content-packs/wolf-spiders-semantic-v2-pack.js",
        capabilityWaivers: [],
        monsterGraftSourceMode: WOLF_SPIDERS_MONSTER_GRAFT_V2_SOURCE_MODE,
      },
      provenance: MODULE_PROVENANCE,
    },
  ],
  metadata: {
    bundled: true,
    registryRole: "semantic-v2-editorial-candidate",
    humanApprovalRequired: true,
    retainedLegacyPublicBehavior: true,
    biologicalSourceBoundary:
      "Ground hunting, eye shine, egg-sac transport, and spiderling transport are source context; giant warrens, Tremor Pressure, supernatural brood behavior, and all mechanics are fictional.",
    monsterGraftSourceMode: WOLF_SPIDERS_MONSTER_GRAFT_V2_SOURCE_MODE,
  },
});

export const WOLF_SPIDERS_SEMANTIC_V2_MODULE =
  WOLF_SPIDERS_SEMANTIC_V2_PACK.modules[0];
