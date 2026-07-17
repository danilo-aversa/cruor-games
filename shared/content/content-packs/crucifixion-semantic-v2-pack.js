import { createPhase8SemanticCandidate } from "./phase8-semantic-candidate.factory.js";
import { CRUCIFIXION_INSPIRATION_MODULE } from "../inspiration-modules/crucifixion.js";

export const CRUCIFIXION_SEMANTIC_V2_PACK_ID = "crucifixion-semantic-v2";
export const CRUCIFIXION_SEMANTIC_V2_MODULE_ID = "crucifixion";
export const CRUCIFIXION_SEMANTIC_V2_SOURCE_ANCHOR_ID = "crucifixion";

const RESULT = createPhase8SemanticCandidate({
  slug: "crucifixion",
  title: "Crucifixion",
  legacyModule: CRUCIFIXION_INSPIRATION_MODULE,
  approval: { reviewer: "Danilo", reviewedAt: "2026-07-17", publicationBlockers: ["image-provenance-required"] },
  sourceKind: "practice",
  citation: { label: "Retief and Cilliers, The history and pathology of crucifixion", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1420788/", reliability: "secondary" },
  sourceSummary: "A historical and medical review describing crucifixion as a varied family of public suspension executions and emphasizing that methods and proposed causes of death differ across cases.",
  sourceTypes: [
  "Punitive Practice",
  "Public Execution",
  "Historical Violence"
],
  themes: [
  "public witness",
  "authority",
  "displayed suffering",
  "communal guilt"
],
  motifs: [
  "raised frames",
  "warm nails",
  "witness benches",
  "empty shadow"
],
  horror: [
  "Religious Horror",
  "Psychological Horror",
  "Gothic"
],
  contexts: [
  "chapel",
  "village",
  "road",
  "ruins"
],
  reviewTag: "historical-religious-review-required",
  publicationBlockers: [
  "human-editorial-signoff-required",
  "historical-religious-review-required",
  "sample-qa-local-verification-required",
  "image-provenance-required"
],
  sourceBoundary: "Historical crucifixion varied by period and authority, and proposed causes of death remain debated; witness architecture, transferred shame, the Witness Load track, and all mechanics are Cruor fiction. Christian symbolism is not reduced to gore.",
  provenanceNote: "Editorially re-authored from the frozen Crucifixion module and its location, clue, hazard, atmosphere, and region vocabulary.",
  migrationNote: "AI-assisted editorial candidate. Source review, repeatable local sample QA, image provenance, and final human approval remain explicit publication gates. Historical or scientific context is separated from Cruor supernatural fiction.",
  editorialNotes: [
  "Historical boundary: crucifixion covered varied public suspension and execution practices rather than one universal procedure.",
  "Medical boundary: historical evidence does not support asserting one universal cause or timetable of death.",
  "Religious boundary: Christian meanings and living devotion must not be reduced to spectacle or gore.",
  "Design boundary: gameplay centers on witness responsibility, public authority, evidence, and routes of display.",
  "Fictional transformation: transferred shame, speaking nails, and Witness Load are Cruor fiction.",
  "Ownership boundary: this module owns Archive and Dark Places only and contains no Monster grafts.",
  "Publication gate: historical/religious review, repeatable local sample QA, human signoff, and image provenance remain required."
],
  sourceTags: [
  "raised frames",
  "warm nails",
  "witness benches",
  "empty shadow"
],
  editorial: {
  "deck": "Raised frames and witness architecture turn public punishment into a system of coerced attention and communal responsibility.",
  "whatItIs": "Crucifixion describes varied historical punishments in which a person was publicly suspended or fixed to a structure. Methods, duration, and mechanisms differed, and historical medical explanations remain debated.",
  "whyItDisturbs": "The punishment converts a person into a message controlled by authority and forces witnesses to participate through attention, silence, or record.",
  "creativeUses": [
    "Make witness positions and sightlines part of the dungeon logic.",
    "Use records, benches, and empty frames as evidence of public coercion.",
    "Let testimony and interruption reduce supernatural pressure.",
    "Keep sacred meanings distinct from the fictional punitive system."
  ],
  "cautions": [
    "Do not claim one universal historical procedure or cause of death.",
    "Do not reduce Christian symbols or living faith to gore.",
    "Do not reproduce procedural instructions for harming a person.",
    "Keep victims person-centered rather than decorative.",
    "Label transferred shame and environmental witness effects as fiction."
  ]
},
  media: {
  "imageKey": "card-crucifixion.webp",
  "imageProvider": "local",
  "imageAlt": "Crucifixion inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
  "imageCredit": "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep unpublished until provenance is verified or the image is replaced.",
  "icon": "fa-cross"
},
  identity: {
  "title": "The Court of Forced Witness",
  "motifs": [
    "witness benches",
    "raised frame",
    "public record"
  ],
  "originalPurpose": "A civic and religious court staged sentences, recorded testimony, and organized public viewing so authority could be seen acting.",
  "originalUsers": [
    "official witnesses and record keepers",
    "families seeking testimony or remains",
    "clergy and civic officers contesting the sentence"
  ],
  "historicalChange": "A ruler replaced testimony with compulsory attendance and made silence count as consent to every sentence.",
  "horrorTruth": "The court now stores unspoken responsibility in benches, frames, nails, and sightlines, increasing Witness Load whenever harm is observed but left unnamed.",
  "currentFunction": "The party can identify the condemned, restore testimony, interrupt sightlines, and return records to families without reenacting punishment.",
  "currentConflict": "An authority wants one final public sentence to validate its rule, while witnesses need their suppressed testimony entered before the court fixes communal guilt permanently.",
  "playerEntryPoints": [
    "Find the missing witness roll.",
    "Open a route that does not force spectatorship.",
    "Return the condemned person’s name to the public record."
  ],
  "stakes": [
    "At Witness Load 4, the announced sightline transfers one visible restraint or shame effect.",
    "Destroying the court erases testimony as well as the punitive system.",
    "Restored records let the site become evidence rather than spectacle."
  ],
  "toneKeywords": [
    "public",
    "severe",
    "silent",
    "judgmental"
  ]
},
  atmosphere: {
  "title": "Splintered Prayer, Warm Iron, and Fixed Sightlines",
  "motifs": [
    "warm nail",
    "empty frame",
    "bench rows"
  ],
  "signature": "Raised frames, aligned benches, splintered wood, and warm iron make every room feel designed for compulsory attention.",
  "manifestations": [
    {
      "id": "benches-face-one-point",
      "text": "Every bench faces a single empty frame even when moved.",
      "senses": [
        "sight"
      ],
      "intensity": "low",
      "frequency": "pervasive"
    },
    {
      "id": "iron-stays-warm",
      "text": "Old iron fittings remain warm where testimony was suppressed.",
      "senses": [
        "touch"
      ],
      "intensity": "low",
      "frequency": "recurring"
    },
    {
      "id": "splintered-prayer",
      "text": "Wind through the beams breaks speech into repeated fragments.",
      "senses": [
        "sound"
      ],
      "intensity": "medium",
      "frequency": "recurring"
    },
    {
      "id": "shadow-remains-raised",
      "text": "An empty frame casts the shadow of a raised person.",
      "senses": [
        "sight"
      ],
      "intensity": "medium",
      "frequency": "localized"
    }
  ],
  "exclusions": [
    "procedural injury detail",
    "one universal cause of death",
    "sacred symbol reduced to gore"
  ]
},
  rule: {
  "id": "witness-load",
  "title": "Witness Load",
  "stateLabel": "Witness",
  "ability": "Wisdom",
  "skills": [
    "Insight",
    "Religion"
  ],
  "motifs": [
    "testimony",
    "sightline",
    "named victim"
  ],
  "events": [
    "observe-a-punitive-effect-and-refuse-to-record-or-name-it",
    "move-testimony-away-from-the-person-it-concerns",
    "use-a-witness-position-to-coerce-silence",
    "remain-in-the-announced-sightline-after-the-warning"
  ],
  "effect": "On a failed check, one already visible sightline, restraint, or record pressure advances in the named room. No effect reproduces a real execution procedure.",
  "counterplay": [
    {
      "id": "record-testimony",
      "actionCost": "one action or one exploration interaction",
      "check": {
        "ability": "Wisdom",
        "skills": [
          "Insight",
          "Religion"
        ],
        "dc": null,
        "scalingKey": "intrusion"
      },
      "success": "Enter a truthful testimony and reduce Witness Load by 1."
    },
    {
      "id": "break-the-forced-sightline",
      "actionCost": "one action",
      "check": {
        "ability": "Intelligence",
        "skills": [
          "Investigation",
          "Religion"
        ],
        "dc": null,
        "scalingKey": "intrusion"
      },
      "success": "Open cover or redirect the bench alignment and prevent the next escalation."
    },
    {
      "id": "return-the-name",
      "actionCost": "movement along the visible evidence route",
      "check": null,
      "success": "Carry the victim’s name or record to the archive without increasing the track."
    }
  ],
  "reset": "The track returns to 0 when testimony is secured, the forced sightline is dismantled, or the party withdraws through the visible non-spectator route.",
  "escalation": [
    "One bench or frame identifies the witness group under pressure.",
    "A recorded silence closes one named interaction.",
    "Announce the exact sightline and record that will carry the final transfer.",
    "After one full round or exploration turn, the announced room imposes restraint, silence, or forced attention; withdrawal remains possible."
  ],
  "gmSummary": "Focus on public coercion, testimony, and authority. Keep victims named and avoid procedural injury simulation.",
  "playerFacingSigns": [
    "The affected sightline is announced before escalation.",
    "Every pressure effect remains attached to visible records or architecture.",
    "Testimony, obstruction, naming, and withdrawal remain available."
  ]
},
  signs: [
  {
    "id": "warm-nail",
    "title": "The Nails Are Still Warm",
    "motifs": [
      "warm iron",
      "empty frame"
    ],
    "description": "Old iron fasteners remain warm beside an empty public frame.",
    "variations": [
      "Fresh blood appears without a body.",
      "One nail cools when a name is spoken.",
      "A removed nail points toward the witness roll."
    ],
    "interaction": {
      "trigger": "Compare the iron with the sentence record.",
      "effect": "Reveal which execution was removed from the archive.",
      "counterplay": "Record the evidence without reenacting the punishment."
    },
    "revelationLink": "record-revelation"
  },
  {
    "id": "empty-shadow",
    "title": "The Empty Frame Casts a Body",
    "motifs": [
      "shadow",
      "raised frame"
    ],
    "description": "An empty structure casts a human shadow that faces the benches.",
    "variations": [
      "The shadow changes when a witness speaks.",
      "It lacks the condemned person’s identifying mark.",
      "It turns toward the archive door at sunset."
    ],
    "interaction": {
      "trigger": "Alter the sightline or compare the shadow with testimony.",
      "effect": "Reveal that the public image was manufactured.",
      "counterplay": "Block the forced sightline or restore the missing name."
    },
    "revelationLink": "sightline-revelation"
  },
  {
    "id": "clean-hole",
    "title": "One Nail Hole Is Clean",
    "motifs": [
      "clean hole",
      "missing evidence"
    ],
    "description": "A beam bears many old marks but one recently cleaned hole.",
    "variations": [
      "Dust forms a name around it.",
      "The hole aligns with a sealed record niche.",
      "A witness token fits inside."
    ],
    "interaction": {
      "trigger": "Inspect the cleaned mark and surrounding dust.",
      "effect": "Reveal recent removal of evidence.",
      "counterplay": "Recover the token or preserve the mark."
    },
    "revelationLink": "tampering-revelation"
  },
  {
    "id": "witness-benches",
    "title": "The Benches Turn Toward Silence",
    "motifs": [
      "benches",
      "witnesses"
    ],
    "description": "Bench rows rotate toward the person withholding testimony.",
    "variations": [
      "Only the empty seats move.",
      "Names appear on the backs.",
      "A side aisle remains aligned with the exit."
    ],
    "interaction": {
      "trigger": "Compare bench movement with the witness roll.",
      "effect": "Identify who was compelled or erased.",
      "counterplay": "Open the side aisle and enter testimony."
    },
    "revelationLink": "witness-revelation"
  }
],
  sensoryTitle: "Forced Witness Sensory Profile",
  sensorySignature: "Warm iron, split speech, aligned benches, and impossible shadows make attention feel compulsory.",
  sensoryMotifs: [
  "warm iron",
  "splintered prayer",
  "bench alignment",
  "empty shadow"
],
  smellLow: "dry wood, dust, and old incense",
  smellMedium: "heated iron and opened records",
  smellHigh: "scorched timber and extinguished incense",
  touchLow: "splintered and sun-warmed",
  touchMedium: "warm where testimony was removed",
  touchHigh: "rigid along the announced sightline",
  soundBeat: "A broken phrase returns from the beams",
  sensoryExclusions: [
  "graphic procedural injury",
  "anonymous victim décor",
  "sacred symbols used only as gore"
],
  readAloudTitle: "Forced Witness Read-Aloud Profile",
  anchorA: "A bench-lined vestibule",
  anchorB: "A raised civic court",
  safeAnchor: "A side aisle outside the main sightline",
  visibleA: "Empty public frames",
  visibleB: "The missing witness roll",
  visibleC: "A broken bench alignment",
  detailA: "One warm fastener",
  detailB: "An erased testimony line",
  detailC: "A recently cleaned beam mark",
  motionA: "The empty shadow",
  motionB: "The turning benches",
  motionC: "The side aisle screen",
  exitA: "The witness archive passage",
  exitB: "The non-spectator side aisle",
  exitC: "The raised court stair",
  session: {
  "title": "Running the Court of Forced Witness",
  "motifs": [
    "testimony",
    "public authority",
    "named victim"
  ],
  "openingBeat": {
    "situation": "An authority prepares one final public sentence while the witness roll has been altered.",
    "immediateSignal": "The empty frame casts a body-shaped shadow and every bench turns toward a silent witness.",
    "playerDecision": "Recover testimony, break the forced sightline, or expose the missing sentence before the crowd is bound to it."
  },
  "objectives": [
    "Identify the erased condemned person and witnesses.",
    "Recover or reconstruct the missing testimony.",
    "Dismantle compulsory spectatorship without destroying the evidence."
  ],
  "revelations": [
    "record-revelation",
    "sightline-revelation",
    "tampering-revelation"
  ],
  "linkConditions": [
    "The warm fastener and empty shadow identify the same missing record.",
    "The sightline geometry leads to the recently cleaned evidence niche."
  ],
  "fallbackClues": [
    "A cooled nail reveals a scratched name.",
    "The side aisle exposes the original bench alignment.",
    "An empty seat repeats one line of suppressed testimony."
  ],
  "stallMoves": [
    {
      "id": "advance-witness",
      "trigger": "The table delays after a clear testimony clue.",
      "action": "Advance Witness Load by 1 and name the sightline that will carry the next effect."
    },
    {
      "id": "authority-calls-silence",
      "trigger": "The authority is left unchallenged.",
      "action": "Mark one visible silence as consent without resolving the sentence yet."
    },
    {
      "id": "shadow-repeats-testimony",
      "trigger": "A revelation is missed twice.",
      "action": "The empty shadow mouths the suppressed statement beside its physical evidence."
    }
  ],
  "climaxGuidance": "At Witness Load 4, resolve only the sightline announced at Load 3 after one full round or exploration turn. Keep the side aisle, truthful testimony, and withdrawal route open."
},
});

export const CRUCIFIXION_SEMANTIC_V2_PACK = RESULT.pack;
export const CRUCIFIXION_SEMANTIC_V2_MODULE = RESULT.module;
export const CRUCIFIXION_SEMANTIC_V2_LEGACY_IDS = RESULT.legacyIds;
export const CRUCIFIXION_SEMANTIC_V2_REVIEW_VERSION = RESULT.reviewVersion;
