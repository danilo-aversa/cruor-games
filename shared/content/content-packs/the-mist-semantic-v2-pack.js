import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeContentPackV0_2,
  normalizeSemanticProvenance,
} from "../contracts/semantic/index.js";

export const THE_MIST_SEMANTIC_V2_PACK_ID = "the-mist-semantic-v2";
export const THE_MIST_SEMANTIC_V2_MODULE_ID = "the-mist";
export const THE_MIST_SEMANTIC_V2_SOURCE_ANCHOR_ID = "the-mist";

const REVIEW_VERSION = "phase8-the-mist-editorial-candidate-v1";

function createProvenance({
  legacyIds = [],
  relation = "derived",
  note = "Editorially re-authored from the frozen The Mist module and its visibility, enclosure, threshold, and social-pressure vocabulary.",
  migrationNote = "Transformative source framing, fair navigation, and recurring-sign policy approved by Danilo on 2026-07-17. Image provenance remains a separate publication blocker.",
} = {}) {
  return normalizeSemanticProvenance({
    sources: [
      {
        sourceAnchorId: THE_MIST_SEMANTIC_V2_SOURCE_ANCHOR_ID,
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
  legacyIds: ["the-mist", "inspiration-the-mist", "The Mist"],
  relation: "editorial-constraint",
  note: "The published novella is retained only as high-level source context for enclosure, obscured danger, threshold pressure, and fear-driven social fracture. The White Refuge, Orientation Drift, copied routes, borrowed memories, and all game procedures are original Cruor content.",
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
    sourceAnchors: [THE_MIST_SEMANTIC_V2_SOURCE_ANCHOR_ID],
    sourceTypes: ["Literary Work", "Horror Fiction"],
    themes: [
      "obscured danger",
      "threshold pressure",
      "spatial uncertainty",
      "social fracture",
    ],
    motifs,
    horror: ["Cosmic Horror", "Survival Horror", "Psychological Horror"],
    contexts: ["village", "refuge", "forest", "ruins"],
    compatibility: {
      capabilities: ["dark-places"],
      excludedCapabilities: ["monster-composer"],
    },
    generation: { phase: 8, ...generation },
    semantic: { ...semantic, provenance },
    provenance,
  };
}

const COMPONENTS = [
  createComponent({
    id: "the-mist-place-identity",
    title: "The White Refuge",
    semanticType: "place-identity",
    legacyIds: [
      "forest-knows-names",
      "places-premise-white-wall-siege",
      "location-region-fog-return-corridor",
      "location-region-white-window-parlor",
    ],
    motifs: ["sealed windows", "named landmarks", "white thresholds"],
    generation: { primary: true },
    semantic: {
      originalPurpose:
        "A roadside refuge and clustered settlement joined travelers, storehouses, workshops, and homes around a well-marked route. Painted signs, bell codes, window lamps, and named doorways made movement legible in poor weather.",
      originalUsers: [
        "travelers and guides",
        "households sheltering behind shared walls",
        "watchkeepers responsible for roads, bells, and shutters",
      ],
      historicalChange:
        "A white mist enclosed the settlement after a night of violent weather. Familiar distances stopped agreeing with footsteps, voices arrived from the wrong side of walls, and every attempt to map a route produced a second version with one altered threshold.",
      horrorTruth:
        "The mist does not secretly rewrite the physical site. It learns how observers expect rooms and people to connect, then overlays false distance, copied voices, and anticipated silhouettes until travelers abandon reliable evidence for the route they fear or desire.",
      currentFunction:
        "The refuge now tests whether intruders can keep a shared account of direction. Stable routes survive through named landmarks, paired observation, sealed thresholds, and physical anchors; unverified movement feeds Orientation Drift and invites a breach.",
      currentConflict:
        "The remaining inhabitants disagree over whether to keep every threshold sealed, open a route for people calling from outside, or deliberately lead the mist through one expendable wing. Several callers know private details that only the missing should know.",
      playerEntryPoints: [
        "Reach a person whose repeated signal comes from beyond the white boundary without losing the return route.",
        "Recover the watchkeepers' route board and determine which copied landmark was added after the enclosure.",
        "Escort inhabitants between two refuges before a failing window becomes a full breach.",
      ],
      stakes: [
        "If Orientation Drift reaches its final stage, one announced threshold becomes a breach and the safest room stops being sealed.",
        "If the group trusts copied memory over shared evidence, the mist can place a false witness inside the refuge without changing the map at all.",
        "If every route is sealed, people still outside lose their last verified way back.",
      ],
      toneKeywords: ["enclosed", "muted", "watchful", "uncertain"],
    },
  }),
  createComponent({
    id: "the-mist-site-atmosphere",
    title: "White Air, Borrowed Distance",
    semanticType: "site-atmosphere",
    legacyIds: [
      "fog-counts-breaths",
      "mist-smells-of-cold-iron-rain",
      "mist-dampens-the-skin-from-inside",
      "places-sense-distant-glass-tap",
      "places-sense-white-cotton-silence",
    ],
    motifs: ["extra breath", "cold iron rain", "distant glass"],
    semantic: {
      signature:
        "The refuge remains physically recognizable, but white air shortens sight, flattens sound, and makes every measured distance feel like a remembered estimate rather than a fact.",
      manifestations: [
        {
          id: "returned-breath",
          text: "Each breath returns from the mist a moment late, followed occasionally by one that belongs to nobody present.",
          senses: ["sound", "proprioception"],
          intensity: "low",
          frequency: "pervasive",
        },
        {
          id: "iron-rain-without-wetness",
          text: "The air smells of cold rain on iron while cloth and skin remain dry on the surface.",
          senses: ["smell", "touch", "temperature"],
          intensity: "low",
          frequency: "recurring",
        },
        {
          id: "patient-glass-tapping",
          text: "A patient tapping crosses sealed windows in an order that suggests something walking around the building from outside.",
          senses: ["sound", "direction"],
          intensity: "medium",
          frequency: "recurring",
        },
        {
          id: "cotton-distance",
          text: "Shouts lose their echoes after a few paces, but whispers sometimes arrive from farther away than sight allows.",
          senses: ["sound", "distance"],
          intensity: "medium",
          frequency: "recurring",
        },
      ],
      exclusions: [
        "constant featureless fog with no actionable difference",
        "arbitrary teleportation presented without evidence or counterplay",
        "copied plot scenes, named characters, or distinctive creatures from the source work",
      ],
      escalationLinks: ["orientation-drift"],
    },
  }),
  createComponent({
    id: "orientation-drift",
    title: "Orientation Drift",
    semanticType: "global-rule",
    legacyIds: [
      "mist-erases-distance",
      "places-hazard-white-out-step",
      "places-hazard-inside-window-break",
      "places-twist-mist-repositions-exits",
      "places-twist-glass-pressure-breach",
    ],
    motifs: ["route anchors", "moving white edge", "announced breach"],
    semantic: {
      id: "orientation-drift",
      title: "Orientation Drift",
      scope: "location",
      category: "pressure-track",
      trigger: {
        events: [
          "cross-an-unanchored-mist-threshold",
          "follow-an-unverified-voice-or-silhouette",
          "lose-mutual-sight-with-the-group",
          "leave-a-breached-window-or-door-unsealed",
        ],
        timing:
          "Immediately after a listed event; outside combat, also check for accumulated drift at the end of each ten-minute exploration turn spent beyond a stable landmark.",
        frequencyLimit:
          "Once per combat round, or once per ten-minute exploration turn.",
      },
      state: { label: "Drift", minimum: 0, maximum: 4, initial: 0 },
      resolution: {
        timing:
          "At the end of each combat round; outside combat, at the end of each ten-minute exploration turn.",
        threshold: 2,
        savingThrow: null,
        check: {
          ability: "Wisdom",
          skills: ["Survival", "Perception"],
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
            "On a failed check outside combat, the group returns to its last stable landmark and loses ten minutes. In combat, the acting creature's movement toward an unanchored exit ends at the last clearly seen landmark and its remaining movement is lost. Orientation Drift never silently changes the map's real topology.",
        },
        duration: "until-the-route-is-anchored-or-the-next-check-resolves",
        range: "location",
        area: "the-active-navigator-or-any-separated-group",
        frequency:
          "Once per combat round, or once per ten-minute exploration turn, at Drift 2 or higher.",
        actionEconomy: "automatic",
      },
      counterplay: [
        {
          id: "name-and-mark-the-route",
          actionCost: "One action in combat, or one minute during exploration.",
          check: {
            ability: "Intelligence",
            skills: ["Investigation", "Survival"],
            dc: null,
            scalingKey: "intrusion",
          },
          success:
            "Name the previous and next landmark, leave a visible physical marker, and reduce Drift by 1. That connection counts as anchored until the marker is removed or contradicted in view of the group.",
        },
        {
          id: "paired-observation",
          actionCost:
            "One action from two creatures in the same combat round, or one minute of shared observation during exploration.",
          check: null,
          success:
            "Two observers independently confirm the same threshold and reduce Drift by 1. The GM states which visible evidence both observers agree on.",
        },
        {
          id: "seal-the-breach",
          actionCost:
            "One action with suitable material in combat, or one minute of work during exploration.",
          check: null,
          success:
            "Close or cover the announced failing threshold and reduce Drift by 1. This cannot erase an already active encounter, but it prevents that opening from advancing the track again until disturbed.",
        },
      ],
      reset: {
        condition:
          "Outside combat, the group remains for one full ten-minute exploration turn inside a refuge with every used exit physically marked and every breach sealed. During combat, Drift can be reduced through counterplay but cannot fully reset.",
        value: 0,
      },
      escalation: [
        {
          at: 2,
          effect:
            "Unanchored routes begin folding perception back toward the last stable landmark. Start the navigation check at the end of each combat round or ten-minute exploration turn.",
        },
        {
          at: 3,
          effect:
            "The mist presents one copied voice, silhouette, or doorway beside a real route. State one physical discrepancy that can expose the copy before anyone chooses it.",
        },
        {
          at: 4,
          effect:
            "White Breach begins. Announce one unanchored threshold and a one-step countdown. At the end of the next combat round or ten-minute exploration turn, mist enters through that threshold and activates the selected hazard or encounter pressure unless Drift is reduced below 4 or the opening is sealed. The anchored route to the last stable refuge remains available.",
        },
      ],
      gmSummary:
        "Advance Drift only on listed events and at most once per combat round or exploration turn. At 2+, failed navigation returns the group to evidence it already established rather than teleporting it randomly. At 3, every false route has a stated discrepancy. At 4, announce the exact breach and allow one full round or exploration turn of counterplay while preserving an anchored retreat.",
      playerFacingSigns: [
        "Route markers return altered but remain physically present.",
        "A copied voice knows a private detail but misplaces one visible landmark.",
        "The white edge gathers around one named threshold before a breach.",
      ],
    },
  }),
  createComponent({
    id: "the-mist-sign-advancing-white-edge",
    title: "The White Edge Advances",
    semanticType: "recurring-sign",
    legacyIds: ["white-wall-walks", "places-anomaly-door-to-white"],
    motifs: ["white wall", "wrong door", "unobserved advance"],
    semantic: {
      id: "the-mist-sign-advancing-white-edge",
      description:
        "The visible boundary of the mist advances only across unverified space, gathering around doors or windows that no two observers are watching together.",
      placement: {
        frequency: "recurring",
        minimumRooms: 2,
        maximumRooms: 3,
        allowedRoomRoles: ["entrance", "threshold", "connector"],
        forbiddenRoomRoles: ["final"],
        preferredFeatures: ["door", "window", "corridor"],
      },
      variations: [
        "A doorway that led to a lit room now holds flat white air, while the chalk mark on its frame remains untouched.",
        "The fogline stands one flagstone closer after both watchers look away.",
        "A window turns white from the edges inward, leaving one clear hand-sized circle at its center.",
      ],
      interaction: {
        trigger:
          "Two creatures compare the threshold with a physical route marker or observe it from separate positions.",
        effect:
          "The real connection remains fixed, and the observers identify whether the white edge is an overlay, an active breach, or harmless obscuration.",
        counterplay:
          "Keep paired observation, mark both sides of the threshold, or seal it before White Breach completes.",
      },
      revelationLink: "stable-route-revelation",
    },
  }),
  createComponent({
    id: "the-mist-sign-expected-figure",
    title: "The Figure Someone Expected",
    semanticType: "recurring-sign",
    legacyIds: [
      "wrong-silhouettes-stand-still",
      "places-anomaly-handprint-in-mist",
    ],
    motifs: ["anticipated silhouette", "inside handprint", "sealed glass"],
    semantic: {
      id: "the-mist-sign-expected-figure",
      description:
        "The mist offers a still human outline or a wet handprint shaped by whoever a nearby observer most expects, fears, or hopes to find.",
      placement: {
        frequency: "recurring",
        minimumRooms: 2,
        maximumRooms: 3,
        allowedRoomRoles: ["threshold", "clue", "secret"],
        forbiddenRoomRoles: ["entrance"],
        preferredFeatures: ["window", "glass", "door"],
      },
      variations: [
        "A familiar silhouette stands beyond the pane but casts no interruption in the light behind it.",
        "A wet handprint blooms on the inside of sealed glass where nobody is standing.",
        "The figure copies a missing person's posture but waits on the wrong side of a named doorway.",
      ],
      interaction: {
        trigger:
          "A creature names the figure and states one verifiable detail before approaching.",
        effect:
          "The false figure cannot reproduce the relationship between that detail and a visible landmark, revealing the safer route or the observer whose expectation shaped it.",
        counterplay:
          "Do not open a threshold for resemblance alone; require a shared fact and a physical route confirmation.",
      },
      revelationLink: "expectation-copy-revelation",
    },
  }),
  createComponent({
    id: "the-mist-sign-borrowed-memory",
    title: "Borrowed Memory Arrives Late",
    semanticType: "recurring-sign",
    legacyIds: [
      "witness-from-fog",
      "places-clue-fog-shadow-delay",
      "fog-death-echo",
    ],
    motifs: ["memory without witness", "delayed shadow", "last action"],
    semantic: {
      id: "the-mist-sign-borrowed-memory",
      description:
        "A witness, shadow, or vapor outline repeats an event it did not experience, always delayed enough for the group to compare the copy with physical evidence.",
      placement: {
        frequency: "recurring",
        minimumRooms: 1,
        maximumRooms: 3,
        allowedRoomRoles: ["clue", "connector", "final"],
        forbiddenRoomRoles: [],
        preferredFeatures: ["lamp", "body", "wall", "footprint"],
      },
      variations: [
        "A person's shadow finishes turning several heartbeats after the person has stopped.",
        "A witness describes words spoken beyond the fogline but places every speaker beside the wrong landmark.",
        "A vapor outline repeats a fallen creature's last movement without repeating its target or result.",
      ],
      interaction: {
        trigger:
          "The characters compare the copied account with tracks, object positions, or a second observer.",
        effect:
          "The mismatch identifies what the mist can copy—shape, motion, or memory—and what remained outside its view.",
        counterplay:
          "Record positions before questioning a witness and treat repeated action as evidence, not as a second full attack or automatic truth.",
      },
      revelationLink: "borrowed-memory-revelation",
    },
  }),
  createComponent({
    id: "the-mist-sign-breath-script",
    title: "The Window Writes a Warning",
    semanticType: "recurring-sign",
    legacyIds: [
      "places-clue-window-breath-script",
      "places-reward-mist-safe-phrase",
    ],
    motifs: ["condensation script", "safe phrase", "doorframe warning"],
    semantic: {
      id: "the-mist-sign-breath-script",
      description:
        "Condensation reveals fragments of an old route protocol when a living creature breathes near sealed glass or a marked doorframe.",
      placement: {
        frequency: "recurring",
        minimumRooms: 2,
        maximumRooms: 3,
        allowedRoomRoles: ["entrance", "clue", "secret", "final"],
        forbiddenRoomRoles: [],
        preferredFeatures: ["window", "mirror", "doorframe", "sign"],
      },
      variations: [
        "Breath reveals half a sentence on the glass: NAME WHAT STAYS.",
        "A doorframe warning appears only when two people recite different route descriptions aloud.",
        "The same phrase is scratched beside several exits, but one copy reverses the order of the landmarks.",
      ],
      interaction: {
        trigger:
          "The group reconstructs the phrase from at least two independently placed fragments.",
        effect:
          "Reciting the complete protocol while pointing to its physical landmarks anchors one connection or exposes one copied lure.",
        counterplay:
          "A phrase used without matching visible evidence has no effect; the words support observation rather than replacing it.",
      },
      revelationLink: "route-protocol-revelation",
    },
  }),
  createComponent({
    id: "the-mist-sensory-profile",
    title: "Obscured Refuge Sensory Profile",
    semanticType: "sensory-profile",
    legacyIds: [],
    motifs: ["white air", "cold iron", "flattened echoes"],
    semantic: {
      signature:
        "Dry surfaces, internal dampness, flattened echoes, and small directional contradictions make the mist feel physical while keeping every important route cue available to attentive players.",
      variants: {
        sight: [
          "The white air stops at a sharp line around a chalk mark.",
          "A silhouette has the right height but stands between two objects that should overlap it.",
          "Moisture beads on the inside of sealed glass in the shape of fingertips.",
          "A route marker returns with one letter reversed and the same scratch beneath it.",
        ],
        sound: [
          "A breath returns one beat late from the nearest threshold.",
          "Glass taps continue around the building without crossing a corner naturally.",
          "A whisper names the correct person from the wrong direction.",
          "Footsteps repeat the group's pace but omit whichever member is carrying the route marker.",
        ],
        smell: [
          "Cold iron and rain hang in air that leaves clothing dry.",
          "A sealed refuge smells faintly of lamp oil; an unanchored exit smells of wet stone that is not nearby.",
          "Fresh wood smoke appears without warmth whenever a copied refuge is near.",
        ],
        touch: [
          "Skin remains dry while the chest feels damp and cold beneath each breath.",
          "A marked doorframe is solid on both sides even when the opening looks featureless.",
          "Mist against glass presses like cool cloth without leaving moisture outside.",
        ],
        taste: [
          "The air leaves a clean metallic taste that strengthens near an active breach.",
          "A false route tastes faintly of smoke from a hearth the group has not reached.",
        ],
        temperature: [
          "The last stable landmark is always a little warmer than the copied route.",
          "Cold gathers around one threshold during the White Breach countdown.",
        ],
        proprioception: [
          "The body expects one more step before reaching a wall already within arm's length.",
          "Turning back feels farther than walking forward until a physical marker comes into view.",
        ],
      },
      intensityTiers: {
        low: [
          "One echo fails to return.",
          "A white edge holds exactly at a painted route mark.",
        ],
        medium: [
          "A copied voice and a delayed shadow disagree about the same doorway.",
          "The last stable landmark appears several paces too near but remains physically unchanged.",
        ],
        high: [
          "One named threshold whitens completely while every route marker points back to the same refuge.",
        ],
      },
      roomRoleBias: {
        entrance: ["Visible route marks establish how stable space is recorded."],
        threshold: ["The mist gathers around openings without hiding their frames."],
        ritual: ["Several witnesses must describe the same route independently."],
        secret: ["A copied landmark hides the discrepancy that reveals a concealed path."],
        climax: ["The announced breach and anchored retreat remain simultaneously visible."],
        connector: ["Repeated marks test whether distance or direction has drifted."],
      },
      geometryBias: {
        circular: ["Silhouettes appear equally distant until one crosses a marked radius."],
        narrow: ["Flattened sound makes a short corridor seem much longer."],
        large: ["Separate pools of visibility preserve several competing routes."],
        vertical: ["Voices arrive from the correct height but the wrong stair."],
        ruined: ["Broken walls expose white air without creating a traversable opening."],
      },
      exclusions: [
        "opaque description that conceals all choices",
        "randomized exits without physical continuity",
        "constant monster noises that make every cue equivalent",
      ],
      repetitionPolicy: {
        exactTextCooldown: "all-rooms",
        senseCooldown: 1,
        allowSignatureRepeat: false,
      },
    },
  }),
  createComponent({
    id: "the-mist-read-aloud-profile",
    title: "White Refuge Read-Aloud Profile",
    semanticType: "read-aloud-profile",
    legacyIds: [],
    motifs: ["sealed parlor", "route board", "white corridor"],
    semantic: {
      fragments: {
        spatialAnchors: [
          {
            id: "route-board-entry",
            text: "A painted route board faces the entrance, its arrows paired with names carved into the surrounding doorframes.",
            roomRoles: ["entrance", "clue"],
            visibleFeatures: ["route-board"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "sealed-window-parlor",
            text: "A narrow parlor gathers around shuttered windows whose frames have been reinforced from inside.",
            roomRoles: ["threshold", "connector"],
            visibleFeatures: ["window"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "white-return-corridor",
            text: "A straight corridor passes three painted marks before the first mark appears again beside an unchanged crack in the plaster.",
            roomRoles: ["connector", "clue"],
            geometry: ["narrow"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "lamp-ring-hall",
            text: "Low lamps form a measured ring around a hall whose center disappears into white air.",
            roomRoles: ["threshold", "final"],
            geometry: ["large", "circular"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "paired-watch-chairs",
            text: "Two watch chairs face the same doorway from opposite walls, each fitted with a slate and a piece of chalk.",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "bell-code-landing",
            text: "A stair landing holds four small bells labeled with route names instead of numbers.",
            geometry: ["vertical"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "shutter-bar-store",
            text: "Wooden bars, waxed cloth, lamp oil, and coils of marking cord fill a store beside the outer rooms.",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "shared-wall-refuges",
            text: "Several small rooms share one thick wall, each joined by an interior hatch marked with the same household sign.",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "well-court-white-roof",
            text: "The central well court remains open above, but a flat white brightness hides the roofline and sky.",
            geometry: ["large", "vertical"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "threshold-record-wall",
            text: "A record wall lists every door opened since the enclosure, with two witnesses beside each entry.",
            roomRoles: ["clue", "secret", "final"],
            visibleFeatures: ["ledger"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
        ],
        sensoryBeats: [
          {
            id: "extra-returned-breath",
            text: "Breathing returns from the white air a moment late, followed by one soft breath too many.",
            intensity: "low",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "cold-iron-rain",
            text: "The room smells of cold rain on iron, though every surface remains dry.",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "patient-window-tap",
            text: "Three patient taps move from one sealed pane to the next.",
            visibleFeatures: ["window"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "flattened-call",
            text: "A call from the next room reaches the doorway without echo or direction.",
            roomRoles: ["connector", "threshold"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "internal-dampness",
            text: "Clothing stays dry while each breath leaves a cool wetness behind the ribs.",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
        ],
        visibleFeatures: [
          {
            id: "paired-chalk-arrows",
            text: "Every reliable route is marked twice: one arrow at eye level and another near the floor.",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "inside-handprint",
            text: "A wet handprint spreads across the inside of a sealed window.",
            visibleFeatures: ["window"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "white-edge-at-cord",
            text: "The fog stops along a cord stretched across the floor, whitening everything beyond it.",
            visibleFeatures: ["route-mark"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "witness-slates",
            text: "Two slates beside the doorway describe the same route in different handwriting.",
            visibleFeatures: ["slate", "door"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "condensation-phrase",
            text: "Condensation gathers into three words on the glass, with space left for a fourth.",
            visibleFeatures: ["window", "writing"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
        ],
        unsettlingDetails: [
          {
            id: "expected-silhouette",
            text: "A familiar outline stands beyond the window in a place where the ground should be empty.",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "wrong-landmark-order",
            text: "The copied route board names every landmark correctly but places the well before the entrance.",
            tags: ["gm-only"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "delayed-shadow-point",
            text: "A shadow finishes pointing toward a closed door after its owner lowers their hand.",
            roomRoles: ["clue", "secret"],
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "private-detail-wrong-room",
            text: "A voice outside repeats a private sentence but claims it was spoken in the wrong room.",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "marker-returned-altered",
            text: "A personal route marker lies ahead with the same damage it had when left behind, plus one fresh white thread.",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
        ],
        motionOrChange: [
          {
            id: "white-edge-one-stone",
            text: "The white edge crosses one floor stone only after both watchers look toward the tapping window.",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "silhouette-finishes-step",
            text: "A still silhouette completes one delayed step when the lamp is shuttered.",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
        ],
        exitsAndDepth: [
          {
            id: "anchored-return-route",
            text: "A double line of chalk and cord leads back to the last warm lamp without interruption.",
            sourceComponentId: "the-mist-read-aloud-profile",
          },
          {
            id: "breach-threshold-gathers",
            text: "White air gathers around one unmarked threshold while the marked retreat remains visible behind it.",
            tags: ["future-reveal"],
            sourceComponentId: "the-mist-read-aloud-profile",
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
  createComponent({
    id: "the-mist-session-guide",
    title: "Running the White Refuge",
    semanticType: "session-guide",
    legacyIds: ["lantern-last-shape"],
    motifs: ["failing window", "route protocol", "borrowed witness"],
    semantic: {
      openingBeat: {
        situation:
          "The group reaches a refuge whose inhabitants have kept one route stable with paired chalk marks, witness slates, and a white-flamed route lantern.",
        immediateSignal:
          "A handprint appears inside a sealed window while a voice outside recites a private fact and names the wrong room where it happened.",
        playerDecision:
          "Open a verified rescue route, reinforce the failing window, or follow the route board to the place where a second set of directions was added.",
      },
      objectives: [
        "Establish at least one anchored route between the entrance, a stable refuge, and the final threshold.",
        "Determine whether the outside caller is a person, a copied memory, or a lure shaped by expectation.",
        "Recover the complete route protocol and decide which threshold, if any, may be opened.",
      ],
      alwaysOnRuleIds: ["orientation-drift"],
      pressureTrackId: "orientation-drift",
      clueFlow: {
        requiredRevelations: [
          "stable-route-revelation",
          "borrowed-memory-revelation",
          "route-protocol-revelation",
        ],
        links: [
          {
            from: "stable-route-revelation",
            to: "borrowed-memory-revelation",
            condition:
              "The characters compare a copied route with physical markers and identify the one relationship the mist placed incorrectly.",
          },
          {
            from: "borrowed-memory-revelation",
            to: "route-protocol-revelation",
            condition:
              "The characters test the caller's account against witness slates or a delayed shadow and locate the missing phrase fragment.",
          },
        ],
        fallbackClues: [
          "Two independent route marks agree while the copied sign reverses one landmark pair.",
          "Condensation writes the next fragment when two witnesses describe the same threshold aloud.",
          "The white route lantern reveals the last stable outline of every marked doorway.",
        ],
      },
      stallMoves: [
        {
          id: "advance-drift-with-discrepancy",
          trigger:
            "The table debates after receiving a clear route cue or physical discrepancy.",
          action:
            "Advance Drift by 1 and present one copied route beside the real one, explicitly naming the evidence that distinguishes them.",
        },
        {
          id: "caller-moves-to-next-window",
          trigger: "The characters ignore the outside caller or failing glass.",
          action:
            "Move the tapping to the next threshold and add one private detail paired with one visibly false landmark.",
        },
        {
          id: "lantern-reveals-last-outline",
          trigger: "A required revelation has been missed twice.",
          action:
            "The white route lantern outlines the last stable position of the relevant person, object, or doorway without resolving the conclusion for the players.",
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
          "At Drift 4, announce the exact White Breach and one full combat round or ten-minute exploration turn of counterplay. Keep the anchored retreat visible, activate pressure through the named opening only if the countdown completes, and resolve the final decision around rescue, containment, or deliberate release rather than random spatial reversal.",
      },
    },
  }),
];

export const THE_MIST_SEMANTIC_V2_PACK = normalizeContentPackV0_2({
  schemaVersion: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
  id: THE_MIST_SEMANTIC_V2_PACK_ID,
  title: "The Mist Semantic Content Pack",
  version: "0.2.0-phase8-approved1",
  status: "draft",
  locale: "en",
  author: "Cruor Games",
  license: "internal-prototype",
  tags: [
    "dark-places",
    "inspiration-archive",
    "the-mist",
    "phase8",
  ],
  modules: [
    {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
      id: THE_MIST_SEMANTIC_V2_MODULE_ID,
      title: "The Mist",
      packId: THE_MIST_SEMANTIC_V2_PACK_ID,
      status: "in-review",
      locale: "en",
      capabilities: ["inspiration-archive", "dark-places"],
      sourceAnchor: {
        schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SOURCE_ANCHOR,
        id: THE_MIST_SEMANTIC_V2_SOURCE_ANCHOR_ID,
        title: "The Mist",
        kind: "text",
        status: "in-review",
        citation: {
          label:
            "Stephen King, The Mist (novella, first published 1980) — official Stephen King works page",
          url: "https://stephenking.com/works/novella/mist.html",
          accessedVersion: `Accessed 2026-07-17; ${REVIEW_VERSION}`,
        },
        summary:
          "A literary horror source in which an obscuring mist encloses a community, conceals unknown threats, pressures the boundary between shelter and exposure, and intensifies fear-driven social division. The canonical Cruor module uses only those high-level design principles.",
        reliability: "primary",
        editorialNotes: [
          "Source boundary: the official Stephen King works page identifies the novella, its 1980 release, enclosure by strange mist, concealed creatures, and the deterioration of trust among trapped people.",
          "Transformative use: the White Refuge, Orientation Drift, route anchors, paired observation, copied landmarks, borrowed memories, safe protocol, and announced breach are original game structures rather than retellings.",
          "Copyright boundary: do not use source character names, town or shop names, quoted prose, distinctive scene order, adaptation-specific imagery, or recognizable creature designs.",
          "Fair-play boundary: the mist may distort perception and expectation, but the GM must preserve real map topology, state discrepancies, maintain an anchored retreat, and announce every final breach.",
          "Transformative-use and editorial review were approved by Danilo on 2026-07-17; verifiable image provenance and final visual review remain required.",
        ],
        tags: ["literary-work", "horror-fiction", "obscured-threat"],
      },
      inspiration: {
        schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
        id: "inspiration-the-mist-v2",
        slug: "the-mist",
        title: "The Mist",
        status: "approved",
        sourceAnchors: [THE_MIST_SEMANTIC_V2_SOURCE_ANCHOR_ID],
        sourceTypes: ["Literary Work", "Horror Fiction"],
        themes: [
          "obscured danger",
          "threshold breach",
          "temporary shelter",
          "fear-driven social fracture",
          "uncertain distance",
        ],
        motifs: [
          "white boundary",
          "shapes beyond glass",
          "copied voices",
          "sealed thresholds",
          "route markers",
        ],
        horror: ["Cosmic Horror", "Survival Horror", "Psychological Horror"],
        contexts: ["village", "refuge", "forest", "ruins", "road"],
        editorial: {
          deck: "Obscured threat turns shelter, routes, testimony, and collective trust into a readable pressure system where uncertainty remains frightening without becoming arbitrary.",
          whatItIs:
            "The Mist is used as a literary reference for enclosure by an opaque environment, danger beyond reliable sight, and the rapid social strain created when a refuge may be safer than the unknown but cannot remain closed forever.",
          whyItDisturbs:
            "The source removes reliable distance and evidence at the same moment that survival requires collective decisions. People can see too little to verify danger, yet every opening, rescue attempt, accusation, and delay has consequences.",
          creativeUses: [
            "Make thresholds and lines of sight into explicit resources rather than treating fog as decorative concealment.",
            "Use paired observation, route markers, and visible discrepancies to keep spatial uncertainty fair and playable.",
            "Repeat voices, silhouettes, and landmarks with changed relationships so recurrence builds knowledge instead of noise.",
            "Let social disagreement determine which route is opened, sealed, sacrificed, or trusted.",
          ],
          cautions: [
            "Do not retell the novella or reproduce its characters, locations, dialogue, creature designs, or scene sequence.",
            "Never use the mist as permission for untelegraphed teleportation, arbitrary separation, or invalidating player maps.",
            "Vary recurring signs by sense, placement, and revealed information rather than repeating identical scares.",
            "Keep hidden threats unknown until play establishes evidence; do not imply every obscured space contains the same creature.",
          ],
        },
        media: {
          imageKey: "card-the-mist.webp",
          imageProvider: "local",
          imageAlt:
            "The Mist inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
          imageCredit:
            "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep the asset unpublished until provenance is verified or the image is replaced.",
          icon: "fa-cloud",
        },
        tags: [
          "source:the-mist",
          "capability:dark-places",
          "copyright-review-required",
        ],
        provenance: MODULE_PROVENANCE,
      },
      components: COMPONENTS,
      metadata: {
        author: "Cruor Games",
        revision: 1,
        reviewedAt: "2026-07-17",
        sourceFile:
          "shared/content/content-packs/the-mist-semantic-v2-pack.js",
        capabilityWaivers: [],
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
    transformativeSourceBoundary:
      "Enclosure, obscured threat, threshold pressure, and social fracture are source context; the White Refuge, Orientation Drift, copied routes, and all mechanics are original Cruor content.",
  },
});

export const THE_MIST_SEMANTIC_V2_MODULE =
  THE_MIST_SEMANTIC_V2_PACK.modules[0];
