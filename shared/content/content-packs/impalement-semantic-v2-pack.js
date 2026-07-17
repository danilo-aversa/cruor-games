import { createPhase8SemanticCandidate } from "./phase8-semantic-candidate.factory.js";
import { IMPALEMENT_INSPIRATION_MODULE } from "../inspiration-modules/impalement.js";

export const IMPALEMENT_SEMANTIC_V2_PACK_ID = "impalement-semantic-v2";
export const IMPALEMENT_SEMANTIC_V2_MODULE_ID = "impalement";
export const IMPALEMENT_SEMANTIC_V2_SOURCE_ANCHOR_ID = "impalement";

const RESULT = createPhase8SemanticCandidate({
  slug: "impalement",
  title: "Impalement",
  legacyModule: IMPALEMENT_INSPIRATION_MODULE,
  approval: { reviewer: "Danilo", reviewedAt: "2026-07-17", publicationBlockers: ["image-provenance-required"] },
  sourceKind: "practice",
  citation: { label: "Encyclopedia.com, Impalement", url: "https://www.encyclopedia.com/religion/encyclopedias-almanacs-transcripts-and-maps/impalement", reliability: "tertiary" },
  sourceSummary: "A general historical reference for impalement as a punitive and terrorizing practice in which display and political warning could be integral to the punishment.",
  sourceTypes: [
  "Punitive Practice",
  "Public Display",
  "Historical Violence"
],
  themes: [
  "border terror",
  "authority",
  "warning systems",
  "personhood erased into signage"
],
  motifs: [
  "empty stake",
  "crow air",
  "border markers",
  "weathered records"
],
  horror: [
  "Gothic",
  "Psychological Horror",
  "Folk Horror"
],
  contexts: [
  "road",
  "border",
  "village",
  "ruins"
],
  reviewTag: "historical-violence-review-required",
  publicationBlockers: [
  "human-editorial-signoff-required",
  "historical-violence-review-required",
  "sample-qa-local-verification-required",
  "image-provenance-required"
],
  sourceBoundary: "Historical impalement and punitive display are bounded context; self-turning stakes, claimed names, the Border Claim track, and all mechanics are Cruor fiction. No procedural injury instructions are included.",
  provenanceNote: "Editorially re-authored from the frozen Impalement module and its location, clue, hazard, atmosphere, and region vocabulary.",
  migrationNote: "AI-assisted editorial candidate. Source review, repeatable local sample QA, image provenance, and final human approval remain explicit publication gates. Historical or scientific context is separated from Cruor supernatural fiction.",
  editorialNotes: [
  "Historical boundary: impalement appeared in different punitive and terrorizing contexts and should not be assigned one universal method or culture.",
  "Violence boundary: the dossier excludes procedural injury detail, timing, and instructions.",
  "Personhood boundary: displayed victims remain named people rather than scenery.",
  "Design boundary: gameplay centers on borders, records, authority, witness routes, and dismantling warning systems.",
  "Fictional transformation: self-turning stakes, crow omens, and Border Claim are Cruor fiction.",
  "Ownership boundary: this module owns Archive and Dark Places only and contains no Monster grafts.",
  "Publication gate: historical-violence review, repeatable local sample QA, human signoff, and image provenance remain required."
],
  sourceTags: [
  "empty stake",
  "crow air",
  "border markers",
  "weathered records"
],
  editorial: {
  "deck": "A landscape of punitive signs becomes a border system that assigns guilt before anyone crosses it.",
  "whatItIs": "Impalement has been used in varied historical contexts as punishment, terror, and public display. The display of the victim could function as an announcement of authority as much as a sentence.",
  "whyItDisturbs": "A person is converted into infrastructure: a warning, boundary marker, and claim of power that continues acting on later witnesses.",
  "creativeUses": [
    "Turn roads and boundaries into readable systems of authority.",
    "Use one empty marker as a clue about the next intended victim.",
    "Let names, records, and dismantled claims reduce pressure.",
    "Keep victims identifiable and recoverable from the warning display."
  ],
  "cautions": [
    "Do not include procedural injury instructions.",
    "Do not assign the practice to one universal culture or period.",
    "Do not use displayed victims as anonymous decoration.",
    "Keep the authority and warning system—not bodily difference—the antagonist.",
    "Label moving stakes and supernatural border claims as fiction."
  ]
},
  media: {
  "imageKey": "card-impalement.webp",
  "imageProvider": "local",
  "imageAlt": "Impalement inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
  "imageCredit": "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep unpublished until provenance is verified or the image is replaced.",
  "icon": "fa-thumbtack"
},
  identity: {
  "title": "The Border Written in Bodies",
  "motifs": [
    "warning road",
    "empty marker",
    "authority ledger"
  ],
  "originalPurpose": "A fortified road and customs boundary marked jurisdiction, recorded travelers, and warned of penalties through official signs and guarded checkpoints.",
  "originalUsers": [
    "travelers presenting names and permits",
    "guards recording lawful passage",
    "families reclaiming bodies and belongings"
  ],
  "historicalChange": "A tyrant replaced legal signs with punitive displays and ordered one empty marker prepared for every disputed name.",
  "horrorTruth": "The border now treats each unanswered claim as permission to assign a living traveler to an empty marker.",
  "currentFunction": "The party can recover names, invalidate false claims, open unmarked routes, and dismantle the authority ledger without reenacting violence.",
  "currentConflict": "A border captain needs one final claimed name to preserve jurisdiction, while families need the displayed dead identified and returned.",
  "playerEntryPoints": [
    "Find whose name was removed from the border ledger.",
    "Cross without accepting a false claim.",
    "Return a displayed victim’s belongings and identity."
  ],
  "stakes": [
    "At Border Claim 4, the announced marker assigns one visible restraint or route denial.",
    "Destroying the border removes records needed by families.",
    "Invalidating the claims turns the road back into a navigable boundary."
  ],
  "toneKeywords": [
    "exposed",
    "authoritarian",
    "wind-cut",
    "watchful"
  ]
},
  atmosphere: {
  "title": "Crow Air, Weathered Wood, and Waiting Markers",
  "motifs": [
    "crow air",
    "empty stake",
    "roadside claim"
  ],
  "signature": "Wind, birds, weathered markers, and one conspicuously empty position make the road feel like a sentence waiting for a name.",
  "manifestations": [
    {
      "id": "crows-avoid-empty",
      "text": "Crows settle everywhere except the clean empty marker.",
      "senses": [
        "sight",
        "sound"
      ],
      "intensity": "low",
      "frequency": "pervasive"
    },
    {
      "id": "wood-turns",
      "text": "Weathered signs turn slightly toward whoever reads the border claim.",
      "senses": [
        "sight"
      ],
      "intensity": "low",
      "frequency": "recurring"
    },
    {
      "id": "iron-smells-of-rain",
      "text": "Old fittings smell of wet iron even under a dry sky.",
      "senses": [
        "smell"
      ],
      "intensity": "medium",
      "frequency": "recurring"
    },
    {
      "id": "road-narrows-by-name",
      "text": "The road seems narrower beside names missing from the ledger.",
      "senses": [
        "sight",
        "proprioception"
      ],
      "intensity": "medium",
      "frequency": "localized"
    }
  ],
  "exclusions": [
    "procedural injury detail",
    "anonymous body decoration",
    "one culture treated as uniquely cruel"
  ]
},
  rule: {
  "id": "border-claim",
  "title": "Border Claim",
  "stateLabel": "Claim",
  "ability": "Charisma",
  "skills": [
    "Persuasion",
    "Investigation"
  ],
  "motifs": [
    "empty marker",
    "false name",
    "visible route"
  ],
  "events": [
    "accept-a-border-claim-without-checking-the-ledger",
    "move-or-remove-a-victims-name-from-visible-evidence",
    "use-the-display-to-coerce-a-traveler",
    "remain-in-the-announced-marker-zone-after-the-warning"
  ],
  "effect": "On a failed check, one already visible marker, route denial, or authority record advances in the named area. The effect never simulates a historical injury procedure.",
  "counterplay": [
    {
      "id": "invalidate-false-claim",
      "actionCost": "one action or one exploration interaction",
      "check": {
        "ability": "Intelligence",
        "skills": [
          "Investigation",
          "History"
        ],
        "dc": null,
        "scalingKey": "intrusion"
      },
      "success": "Match the marker to contradictory records and reduce Border Claim by 1."
    },
    {
      "id": "return-the-name",
      "actionCost": "one action",
      "check": {
        "ability": "Charisma",
        "skills": [
          "Persuasion",
          "Religion"
        ],
        "dc": null,
        "scalingKey": "intrusion"
      },
      "success": "Restore a victim’s name and prevent the next escalation."
    },
    {
      "id": "take-the-unclaimed-route",
      "actionCost": "movement along the visible safe route",
      "check": null,
      "success": "Use the unmarked road without increasing the track."
    }
  ],
  "reset": "The track returns to 0 when the false authority record is invalidated, the displayed dead are identified, or the party withdraws along the visible unclaimed route.",
  "escalation": [
    "One marker turns toward the disputed traveler or name.",
    "The border closes one announced route or interaction.",
    "Announce the exact empty marker and claim that will carry the final effect.",
    "After one full round or exploration turn, the announced area imposes restraint, fear, or route denial; withdrawal remains possible."
  ],
  "gmSummary": "Make the border authority and its records the antagonist. Preserve victim names and exclude procedural violence.",
  "playerFacingSigns": [
    "The claimed name and marker are visible before escalation.",
    "Contradictory records remain recoverable.",
    "Invalidation, naming, alternate routes, and withdrawal remain possible."
  ]
},
  signs: [
  {
    "id": "empty-marker",
    "title": "One Marker Is Empty",
    "motifs": [
      "empty stake",
      "waiting claim"
    ],
    "description": "Among weathered warning markers, one clean position waits for a named person.",
    "variations": [
      "A fresh cord bears no body.",
      "The empty marker turns toward a spoken lie.",
      "Its shadow points to the altered ledger."
    ],
    "interaction": {
      "trigger": "Compare the marker with the border ledger.",
      "effect": "Reveal the next intended claim.",
      "counterplay": "Invalidate the claim or remove its authority seal."
    },
    "revelationLink": "claim-revelation"
  },
  {
    "id": "crow-air",
    "title": "The Crows Leave One Gap",
    "motifs": [
      "crows",
      "empty air"
    ],
    "description": "Carrion birds form a visible gap around the unfilled marker.",
    "variations": [
      "The gap follows one traveler.",
      "A dropped feather contains a scratched initial.",
      "The birds return when a name is restored."
    ],
    "interaction": {
      "trigger": "Track the gap or compare it with traveler records.",
      "effect": "Identify who the border has selected.",
      "counterplay": "Restore the missing name or use the unclaimed route."
    },
    "revelationLink": "selection-revelation"
  },
  {
    "id": "weathered-names",
    "title": "Names Weather at Different Speeds",
    "motifs": [
      "ledger",
      "wooden names"
    ],
    "description": "Victim names on old signs erode according to political favor rather than age.",
    "variations": [
      "One ancient name remains fresh.",
      "A recent name is nearly erased.",
      "Rain exposes a family relation beneath paint."
    ],
    "interaction": {
      "trigger": "Compare weathering, dates, and family records.",
      "effect": "Reveal deliberate erasure by the authority.",
      "counterplay": "Copy and return the names before altering the signs."
    },
    "revelationLink": "record-revelation"
  },
  {
    "id": "turning-road-sign",
    "title": "The Road Sign Watches the Living",
    "motifs": [
      "boundary sign",
      "turning wood"
    ],
    "description": "A border sign rotates without bending until its carved face follows the party.",
    "variations": [
      "It stops beside a lawful permit.",
      "It ignores the unclaimed side road.",
      "Its back contains the original jurisdiction mark."
    ],
    "interaction": {
      "trigger": "Present records or inspect the reverse carving.",
      "effect": "Reveal the difference between lawful boundary and punitive claim.",
      "counterplay": "Restore the original mark or take the side road."
    },
    "revelationLink": "authority-revelation"
  }
],
  sensoryTitle: "Punitive Border Sensory Profile",
  sensorySignature: "Crow calls, rain-metal, turning wood, and one empty marker make authority feel embedded in the road.",
  sensoryMotifs: [
  "crow gap",
  "empty marker",
  "weathered names",
  "turning signs"
],
  smellLow: "wet wood, road dust, and old iron",
  smellMedium: "rain-metal and opened earth",
  smellHigh: "sharp iron, storm air, and split timber",
  touchLow: "weathered and wind-polished",
  touchMedium: "warm beneath a disputed name",
  touchHigh: "rigid around the announced marker",
  soundBeat: "Crows fall silent in one moving gap",
  sensoryExclusions: [
  "procedural injury imagery",
  "anonymous displayed victims",
  "ethnicized cruelty"
],
  readAloudTitle: "Punitive Border Read-Aloud Profile",
  anchorA: "A road of weathered markers",
  anchorB: "A fortified customs yard",
  safeAnchor: "An unclaimed side road",
  visibleA: "Rows of warning signs",
  visibleB: "The altered border ledger",
  visibleC: "A marker without an authority seal",
  detailA: "One clean empty position",
  detailB: "An unevenly weathered name",
  detailC: "A hidden jurisdiction mark",
  motionA: "The empty marker",
  motionB: "The turning road signs",
  motionC: "The side-road gate",
  exitA: "The customs archive passage",
  exitB: "The unclaimed side road",
  exitC: "The captain’s marker yard",
  session: {
  "title": "Running the Border Written in Bodies",
  "motifs": [
    "false claim",
    "victim names",
    "unclaimed road"
  ],
  "openingBeat": {
    "situation": "A border captain prepares to assign a disputed traveler to the last empty marker.",
    "immediateSignal": "Crows leave a person-shaped gap while the empty marker turns toward the party.",
    "playerDecision": "Invalidate the claim, recover erased names, or open the unclaimed route before jurisdiction is fixed."
  },
  "objectives": [
    "Identify the selected traveler and false authority claim.",
    "Recover names and belongings of displayed victims.",
    "Restore lawful passage or dismantle the punitive border system."
  ],
  "revelations": [
    "claim-revelation",
    "record-revelation",
    "authority-revelation"
  ],
  "linkConditions": [
    "The empty marker’s seal matches the altered ledger entry.",
    "The weathered names preserve the original jurisdiction mark on their reverse."
  ],
  "fallbackClues": [
    "Rain reveals an erased name.",
    "A crow drops a permit fragment on the side road.",
    "The empty marker points toward the captain’s false seal."
  ],
  "stallMoves": [
    {
      "id": "advance-claim",
      "trigger": "The table delays after a clear border clue.",
      "action": "Advance Border Claim by 1 and name the marker or route that will carry the next effect."
    },
    {
      "id": "captain-seals-name",
      "trigger": "The captain is left unchallenged.",
      "action": "Move the authority seal toward the disputed name without resolving the claim yet."
    },
    {
      "id": "sign-repeats-jurisdiction",
      "trigger": "A revelation is missed twice.",
      "action": "A turning sign exposes the original boundary mark beside the false claim."
    }
  ],
  "climaxGuidance": "At Border Claim 4, resolve only the marker announced at Claim 3 after one full round or exploration turn. Keep the unclaimed side road, record-based invalidation, and withdrawal route open."
},
});

export const IMPALEMENT_SEMANTIC_V2_PACK = RESULT.pack;
export const IMPALEMENT_SEMANTIC_V2_MODULE = RESULT.module;
export const IMPALEMENT_SEMANTIC_V2_LEGACY_IDS = RESULT.legacyIds;
export const IMPALEMENT_SEMANTIC_V2_REVIEW_VERSION = RESULT.reviewVersion;
