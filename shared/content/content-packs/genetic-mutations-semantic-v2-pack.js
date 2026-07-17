import { createPhase8SemanticCandidate } from "./phase8-semantic-candidate.factory.js";
import { GENETIC_MUTATIONS_INSPIRATION_MODULE } from "../inspiration-modules/genetic-mutations.js";

export const GENETIC_MUTATIONS_SEMANTIC_V2_PACK_ID = "genetic-mutations-semantic-v2";
export const GENETIC_MUTATIONS_SEMANTIC_V2_MODULE_ID = "genetic-mutations";
export const GENETIC_MUTATIONS_SEMANTIC_V2_SOURCE_ANCHOR_ID = "genetic-mutations";

const RESULT = createPhase8SemanticCandidate({
  slug: "genetic-mutations",
  title: "Genetic Mutations",
  legacyModule: GENETIC_MUTATIONS_INSPIRATION_MODULE,
  approval: { reviewer: "Danilo", reviewedAt: "2026-07-17", publicationBlockers: ["image-provenance-required"] },
  sourceKind: "object",
  citation: { label: "National Human Genome Research Institute, Mutation", url: "https://www.genome.gov/genetics-glossary/Mutation", reliability: "tertiary" },
  sourceSummary: "A genetics reference distinguishing DNA sequence changes, heritable germline variation, acquired somatic change, and the fact that many variants do not produce disease.",
  sourceTypes: [
  "Medical / Genetic Concept",
  "Biology",
  "Inheritance"
],
  themes: [
  "inheritance",
  "variation",
  "lineage records",
  "body autonomy"
],
  motifs: [
  "corrected portraits",
  "family ledgers",
  "repeated traits",
  "sealed nursery"
],
  horror: [
  "Body Horror",
  "Psychological Horror",
  "Gothic"
],
  contexts: [
  "noble-house",
  "archive",
  "village",
  "laboratory"
],
  reviewTag: "medical-language-review-required",
  publicationBlockers: [
  "human-editorial-signoff-required",
  "medical-language-review-required",
  "sample-qa-local-verification-required",
  "image-provenance-required"
],
  sourceBoundary: "Genetic variation, germline inheritance, and somatic change are bounded scientific context; compulsory lineage correction, hostile family archives, the Inheritance Index, and all mechanics are Cruor fiction. Difference is never treated as moral failure.",
  provenanceNote: "Editorially re-authored from the frozen Genetic Mutations module and its location, clue, hazard, atmosphere, and region vocabulary.",
  migrationNote: "AI-assisted editorial candidate. Source review, repeatable local sample QA, image provenance, and final human approval remain explicit publication gates. Historical or scientific context is separated from Cruor supernatural fiction.",
  editorialNotes: [
  "Scientific boundary: mutation means a DNA sequence change; variants can be inherited or acquired and many have no harmful effect.",
  "Ethical boundary: disability, congenital difference, and genetic variation are not signs of corruption, guilt, or evil.",
  "Design boundary: the horror targets coercive institutions, eugenic record-keeping, and loss of bodily autonomy rather than a person’s traits.",
  "Fictional transformation: animated portraits, compulsory correction, the Inheritance Index, and environmental inheritance are Cruor fiction.",
  "Ownership boundary: this module owns Archive and Dark Places only and contains no Monster grafts.",
  "Publication gate: medical-language review, repeatable local sample QA, human signoff, and image provenance remain required."
],
  sourceTags: [
  "corrected portraits",
  "family ledgers",
  "repeated traits",
  "sealed nursery"
],
  editorial: {
  "deck": "Family records and repeated traits become evidence of institutional coercion, while biological variation remains morally neutral.",
  "whatItIs": "A mutation is a change in DNA sequence. Some changes are inherited, others arise in body cells, and their effects range from none to significant. Inheritance patterns describe transmission probabilities, not destiny or worth.",
  "whyItDisturbs": "Cruor horror begins when an institution converts uncertainty into compulsory correction and treats family resemblance as property.",
  "creativeUses": [
    "Turn portraits and ledgers into contradictory lineage clues.",
    "Use repeated architectural traits to reveal a coercive program.",
    "Make consent and record correction the primary counterplay.",
    "Keep the affected people distinct from the institution harming them."
  ],
  "cautions": [
    "Do not equate genetic difference, disability, or congenital traits with evil.",
    "Do not present inheritance as perfectly deterministic.",
    "Do not use real diagnostic labels as monsters or curses.",
    "Make the coercive archive, family authority, or supernatural system the antagonist.",
    "Label environmental inheritance and animated records as fiction."
  ]
},
  media: {
  "imageKey": "card-mutations.webp",
  "imageProvider": "local",
  "imageAlt": "Genetic Mutations inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
  "imageCredit": "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep unpublished until provenance is verified or the image is replaced.",
  "icon": "fa-dna"
},
  identity: {
  "title": "The House of Corrected Lineage",
  "motifs": [
    "corrected portrait",
    "sealed nursery",
    "family index"
  ],
  "originalPurpose": "A family archive, nursery, and clinic recorded births, resemblances, inherited conditions, and consented care across generations.",
  "originalUsers": [
    "families maintaining voluntary health histories",
    "caretakers protecting private records",
    "healers comparing symptoms without assigning moral value"
  ],
  "historicalChange": "A later authority rewrote uncertain records as defects and used the archive to justify compulsory correction, confinement, and inheritance claims.",
  "horrorTruth": "The building now forces rooms, portraits, and records to repeat whichever lineage the authority declared acceptable.",
  "currentFunction": "The party can compare contradictory records, protect living subjects, restore consent marks, and separate observed traits from imposed conclusions.",
  "currentConflict": "An heir needs the corrected archive to validate power, while affected families need the original records released before the building fixes the false lineage permanently.",
  "playerEntryPoints": [
    "Recover the uncensored family ledger.",
    "Open the sealed nursery without activating compulsory correction.",
    "Return disputed records to the people they describe."
  ],
  "stakes": [
    "At Inheritance Index 4, the announced room imposes one visible false lineage pattern.",
    "Destroying the archive removes evidence of abuse.",
    "Restoring consent preserves useful history without preserving coercion."
  ],
  "toneKeywords": [
    "clinical",
    "familial",
    "controlled",
    "uncertain"
  ]
},
  atmosphere: {
  "title": "Portraits, Antiseptic Air, and Repeated Proportions",
  "motifs": [
    "portrait strain",
    "measured cradles",
    "repeated dimensions"
  ],
  "signature": "Clean rooms, measured furniture, corrected portraits, and repeated dimensions make family history feel mechanically enforced.",
  "manifestations": [
    {
      "id": "portraits-correct-themselves",
      "text": "Portraits subtly exchange features when a record is read aloud.",
      "senses": [
        "sight"
      ],
      "intensity": "low",
      "frequency": "recurring"
    },
    {
      "id": "nursery-antiseptic",
      "text": "The nursery smells clean enough to erase the scent of people.",
      "senses": [
        "smell"
      ],
      "intensity": "low",
      "frequency": "pervasive"
    },
    {
      "id": "matching-handles",
      "text": "Door handles repeat the same hand proportions throughout the house.",
      "senses": [
        "sight",
        "touch"
      ],
      "intensity": "medium",
      "frequency": "localized"
    },
    {
      "id": "ledger-pulse",
      "text": "A closed ledger vibrates when a living person contradicts its assigned lineage.",
      "senses": [
        "touch",
        "sound"
      ],
      "intensity": "medium",
      "frequency": "recurring"
    }
  ],
  "exclusions": [
    "difference as moral corruption",
    "real diagnoses used as curses",
    "perfectly deterministic heredity"
  ]
},
  rule: {
  "id": "inheritance-index",
  "title": "Inheritance Index",
  "stateLabel": "Index",
  "ability": "Intelligence",
  "skills": [
    "Investigation",
    "Medicine"
  ],
  "motifs": [
    "corrected record",
    "repeated trait",
    "consent mark"
  ],
  "events": [
    "accept-a-corrected-record-without-checking-its-source",
    "move-or-destroy-a-private-record-without-consent",
    "use-a-visible-trait-as-proof-of-guilt-or-worth",
    "remain-in-the-announced-room-after-the-correction-warning"
  ],
  "effect": "On a failed check, one already visible false pattern advances in the named room. The effect targets records, routes, and institutional restraints rather than defining a person by a trait.",
  "counterplay": [
    {
      "id": "restore-consent-mark",
      "actionCost": "one action or one exploration interaction",
      "check": {
        "ability": "Intelligence",
        "skills": [
          "Investigation",
          "Medicine"
        ],
        "dc": null,
        "scalingKey": "intrusion"
      },
      "success": "Restore a consent or uncertainty mark and reduce Inheritance Index by 1."
    },
    {
      "id": "compare-independent-records",
      "actionCost": "one action",
      "check": {
        "ability": "Wisdom",
        "skills": [
          "Insight",
          "Medicine"
        ],
        "dc": null,
        "scalingKey": "intrusion"
      },
      "success": "Identify an unsupported conclusion and prevent its next escalation."
    },
    {
      "id": "protect-the-living-subject",
      "actionCost": "movement along the visible safe route",
      "check": null,
      "success": "Escort an affected person or record out without increasing the track."
    }
  ],
  "reset": "The track returns to 0 when the original evidence is secured, consent is restored, or the party withdraws through the visible safe route.",
  "escalation": [
    "A corrected portrait identifies the family branch under pressure.",
    "One room repeats an imposed proportion and closes a named interaction.",
    "Announce the exact nursery, archive, or threshold that will enforce the false pattern.",
    "After one full round or exploration turn, the announced room imposes restraint, misdirection, or record substitution; withdrawal remains possible."
  ],
  "gmSummary": "Target coercive classification and institutional control, never the moral worth of biological variation.",
  "playerFacingSigns": [
    "The affected record and room are named before escalation.",
    "Contradictions remain physically discoverable.",
    "Consent, independent evidence, and withdrawal remain valid counterplay."
  ]
},
  signs: [
  {
    "id": "corrected-portrait",
    "title": "The Portrait Corrects a Hand",
    "motifs": [
      "portrait",
      "hand proportions"
    ],
    "description": "A family portrait changes one hand to match the official ledger rather than the painted sitter.",
    "variations": [
      "A sixth finger is painted over but still casts a shadow.",
      "Two siblings exchange the same scar.",
      "A restored hand points toward the uncensored archive."
    ],
    "interaction": {
      "trigger": "Compare the portrait with a living subject or older copy.",
      "effect": "Reveal which trait was added to support the official lineage.",
      "counterplay": "Document both versions without treating either body as proof of moral worth."
    },
    "revelationLink": "record-revelation"
  },
  {
    "id": "cradle-restraints",
    "title": "The Cradle Has Adult Restraints",
    "motifs": [
      "nursery",
      "restraints"
    ],
    "description": "A nursery cradle contains adjustable restraints sized for several ages.",
    "variations": [
      "The buckles bear dates instead of names.",
      "One strap was cut from inside.",
      "A consent tag is hidden beneath the padding."
    ],
    "interaction": {
      "trigger": "Inspect the fittings and dates.",
      "effect": "Reveal that correction continued beyond infancy.",
      "counterplay": "Release the mechanism or preserve it as evidence."
    },
    "revelationLink": "coercion-revelation"
  },
  {
    "id": "ledger-uncertainty",
    "title": "The Ledger Erases Uncertainty",
    "motifs": [
      "ledger",
      "redaction"
    ],
    "description": "Every uncertain observation has been rewritten as a fixed hereditary judgment.",
    "variations": [
      "Different inks converge on the same conclusion.",
      "Margins preserve cautious notes beneath scraping.",
      "A sealed appendix lists unaffected relatives."
    ],
    "interaction": {
      "trigger": "Compare ink, dates, and source notes.",
      "effect": "Reveal where observation became ideology.",
      "counterplay": "Restore the uncertainty marks and independent records."
    },
    "revelationLink": "method-revelation"
  },
  {
    "id": "repeated-doorway",
    "title": "Every Door Fits One Body",
    "motifs": [
      "architecture",
      "repeated proportion"
    ],
    "description": "Doorways and handles repeat one preferred body proportion across unrelated rooms.",
    "variations": [
      "A wheelchair route narrows at the same measurement.",
      "Mirrors crop every visitor to the same height.",
      "The safe exit retains mixed proportions."
    ],
    "interaction": {
      "trigger": "Measure or compare the repeated dimensions.",
      "effect": "Identify the route designed to exclude or restrain.",
      "counterplay": "Use the mixed-proportion route or alter the mechanism."
    },
    "revelationLink": "route-revelation"
  }
],
  sensoryTitle: "Corrected House Sensory Profile",
  sensorySignature: "Antiseptic air, strained portraits, measured surfaces, and repeated proportions make classification feel architectural.",
  sensoryMotifs: [
  "corrected portraits",
  "measured cradles",
  "ledger vibration",
  "repeated proportions"
],
  smellLow: "paper, soap, and faint antiseptic",
  smellMedium: "heated varnish and opened records",
  smellHigh: "sharp antiseptic and scorched ink",
  touchLow: "too smooth and carefully measured",
  touchMedium: "warm where a record was altered",
  touchHigh: "rigid around the announced false pattern",
  soundBeat: "A pencil scratches behind closed walls",
  sensoryExclusions: [
  "body difference as a scare cue",
  "diagnostic jargon as atmosphere",
  "random mutation imagery"
],
  readAloudTitle: "Corrected House Read-Aloud Profile",
  anchorA: "A portrait vestibule",
  anchorB: "A measured nursery and archive",
  safeAnchor: "A mixed-proportion service corridor",
  visibleA: "Corrected family portraits",
  visibleB: "The uncensored ledger seam",
  visibleC: "A consent-marked doorway",
  detailA: "One painted feature",
  detailB: "An erased uncertainty note",
  detailC: "A restraint date",
  motionA: "A portrait feature",
  motionB: "The ledger vibration",
  motionC: "The service corridor latch",
  exitA: "The narrow archive passage",
  exitB: "The mixed-proportion corridor",
  exitC: "The sealed nursery stair",
  session: {
  "title": "Running the House of Corrected Lineage",
  "motifs": [
    "uncensored ledger",
    "consent",
    "institutional coercion"
  ],
  "openingBeat": {
    "situation": "An heir prepares to authenticate a corrected family record while living relatives are confined by its conclusions.",
    "immediateSignal": "A portrait changes to match the ledger as the real sitter watches.",
    "playerDecision": "Recover the uncensored record, protect the affected family, or expose the coercive method before authentication."
  },
  "objectives": [
    "Map contradictions between people, portraits, and ledgers.",
    "Recover the consent and uncertainty records.",
    "Stop compulsory correction without erasing legitimate medical history."
  ],
  "revelations": [
    "record-revelation",
    "method-revelation",
    "coercion-revelation"
  ],
  "linkConditions": [
    "The altered portrait and ledger share the same later ink.",
    "The method notes lead to the restraint dates and missing consent forms."
  ],
  "fallbackClues": [
    "Heat reveals scraped uncertainty marks.",
    "A mixed-proportion doorway points to the original archive.",
    "A living relative identifies which record was written without consent."
  ],
  "stallMoves": [
    {
      "id": "advance-index",
      "trigger": "The table delays after a clear contradiction.",
      "action": "Advance Inheritance Index by 1 and name the room that will repeat the false pattern."
    },
    {
      "id": "heir-seals-record",
      "trigger": "The heir is left unchallenged.",
      "action": "Move the authentication seal toward the corrected ledger without completing it."
    },
    {
      "id": "portrait-repeats-error",
      "trigger": "A revelation is missed twice.",
      "action": "A portrait visibly repeats the unsupported conclusion beside the contrary evidence."
    }
  ],
  "climaxGuidance": "At Inheritance Index 4, resolve only the room announced at Index 3 after one full round or exploration turn. Keep the mixed-proportion withdrawal route and evidence-based counterplay open."
},
});

export const GENETIC_MUTATIONS_SEMANTIC_V2_PACK = RESULT.pack;
export const GENETIC_MUTATIONS_SEMANTIC_V2_MODULE = RESULT.module;
export const GENETIC_MUTATIONS_SEMANTIC_V2_LEGACY_IDS = RESULT.legacyIds;
export const GENETIC_MUTATIONS_SEMANTIC_V2_REVIEW_VERSION = RESULT.reviewVersion;
