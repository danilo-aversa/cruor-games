import { createPhase8SemanticCandidate } from "./phase8-semantic-candidate.factory.js";
import {
  JIKININKI_INSPIRATION_MODULE,
  JIKININKI_LOCATION_COMPONENTS,
  JIKININKI_LOCATION_REGION_COMPONENTS,
} from "../inspiration-modules/jikininki.js";

export const JIKININKI_SEMANTIC_V2_PACK_ID = "jikininki-semantic-v2";
export const JIKININKI_SEMANTIC_V2_MODULE_ID = "jikininki";
export const JIKININKI_SEMANTIC_V2_SOURCE_ANCHOR_ID = "jikininki";

const RESULT = createPhase8SemanticCandidate({
  legacyModule: JIKININKI_INSPIRATION_MODULE,
  legacyComponents: [
    ...JIKININKI_LOCATION_COMPONENTS,
    ...JIKININKI_LOCATION_REGION_COMPONENTS,
  ],
  "slug": "jikininki",
  "modernCapabilityLinks": [
    {
      "capability": "monster-composer",
      "ownership": "external-modern-source",
      "sourceFile": "features/monster-composer/data/monster-grafts.js",
      "sourceAnchorId": "jikininki",
      "expectedEntries": 25,
      "verification": "source-anchor-parity"
    }
  ],
  "title": "Jikininki",
  "sourceKind": "text",
  "citation": {
    "label": "Lafcadio Hearn, Kwaidan: Stories and Studies of Strange Things — Jikininki (1904)",
    "url": "https://www.gutenberg.org/files/1210/1210-h/1210-h.htm",
    "reliability": "primary"
  },
  "sourceSummary": "This candidate is bounded to Lafcadio Hearn’s 1904 literary retelling “Jikininki” in Kwaidan, where selfish impiety is linked to rebirth as a corpse-eating being. It is not presented as exhaustive Japanese folklore or universal Buddhist doctrine.",
  "sourceTypes": [
    "Literary Folklore Retelling",
    "Ghost Story",
    "Funerary Tale"
  ],
  "themes": [
    "failed funerary duty",
    "shame and appetite",
    "restitution",
    "care for the dead"
  ],
  "motifs": [
    "opened grave",
    "uneaten offering",
    "weeping appetite",
    "missing name"
  ],
  "horror": [
    "Folk Horror",
    "Religious Horror",
    "Body Horror"
  ],
  "contexts": [
    "graveyard",
    "village",
    "crypt",
    "monastery"
  ],
  "reviewTag": "japanese-folklore-review-required",
  "publicationBlockers": [
    "human-editorial-signoff-required",
    "japanese-folklore-review-required",
    "sample-qa-local-verification-required",
    "image-provenance-required"
  ],
  "sourceBoundary": "The literary source is explicitly Lafcadio Hearn’s 1904 retelling, not a claim to universal Japanese belief or Buddhist doctrine. Grave Hunger, responsive offerings, and all location procedures are Cruor fiction. Players are never required to imitate a real funerary rite.",
  "provenanceNote": "Editorially re-authored from the frozen Jikininki location and region vocabulary while excluding twenty-five already-modern Monster grafts from pack ownership.",
  "migrationNote": "AI-assisted editorial candidate. Literary-source review, Japanese-folklore review, local sample QA, image provenance, and final human approval remain explicit publication gates. Monster parity is external and never copied.",
  "editorialNotes": [
    "Literary boundary: this dossier cites Hearn’s 1904 English-language retelling and does not claim exhaustive folklore authority.",
    "Religious boundary: the story’s moral vocabulary is not presented as universal Buddhist doctrine.",
    "Ritual boundary: players can restore names, evidence, shelter, and offerings already present without imitating real rites.",
    "Character boundary: shame, neglect, and institutional failure remain distinguishable from ordinary hunger or bereavement.",
    "Fictional transformation: Grave Hunger, responsive soil, and the location track are Cruor fiction.",
    "Ownership boundary: this module owns Archive and Dark Places only; twenty-five modern Monster grafts remain external.",
    "Publication gate: Japanese-folklore review, repeatable local sample QA, human signoff, and image provenance remain required."
  ],
  "sourceTags": [
    "kwaidan",
    "literary-retelling",
    "funerary-duty",
    "graveyard"
  ],
  "editorial": {
    "deck": "A graveyard feeds on neglected duties, while a hidden mourner’s shame turns evidence of care into appetite.",
    "whatItIs": "In Hearn’s “Jikininki,” a corpse-eating condition is tied to selfish impiety and funerary obligation. This module treats that text as one literary retelling rather than a comprehensive account of Japanese folklore or doctrine.",
    "whyItDisturbs": "Cruor horror begins when neglect of the dead is concealed, responsibility is displaced, and shame feeds a cycle that harms bodies and mourners.",
    "creativeUses": [
      "Build a graveyard mystery from missing names and disturbed offerings.",
      "Make restoration of evidence and care practical counterplay.",
      "Let the eater remain a morally legible person rather than a generic predator.",
      "Keep Monster combat grafts external to the location pack."
    ],
    "cautions": [
      "Do not present Hearn’s story as universal Japanese belief.",
      "Do not require players to imitate real funerary or Buddhist rites.",
      "Do not reduce grief, poverty, or hunger to innate evil.",
      "Keep cultural and literary framing visible.",
      "Label Grave Hunger and responsive graves as fiction."
    ]
  },
  "media": {
    "imageKey": "card-jikininki.webp",
    "imageProvider": "local",
    "imageAlt": "Jikininki inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
    "imageCredit": "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep unpublished until provenance is verified or the image is replaced.",
    "icon": "fa-skull"
  },
  "identity": {
    "title": "The Graveyard of Unfinished Duties",
    "motifs": [
      "opened grave",
      "offering table",
      "hidden mourner"
    ],
    "originalPurpose": "A village graveyard, offering house, and caretaker’s shelter supported mourning, names, and practical care for the dead.",
    "originalUsers": [
      "families tending graves",
      "caretakers recording names and repairs",
      "travelers seeking shelter without disturbing burials"
    ],
    "historicalChange": "A corrupt caretaker concealed neglected burials, consumed offerings, and shifted blame onto mourners until shame and appetite became inseparable.",
    "horrorTruth": "The graveyard now converts every concealed duty into hunger and directs that hunger toward the person who benefits from the neglect.",
    "currentFunction": "The party can restore names, preserve evidence, return stolen offerings, shelter remains, and confront the hidden beneficiary of neglect.",
    "currentConflict": "A village official needs the graves kept closed to hide diverted funds, while mourners need the missing names restored before Grave Hunger reaches the announced burial row.",
    "playerEntryPoints": [
      "Investigate offerings marked by human teeth.",
      "Find who tied a grave from inside.",
      "Restore the caretaker ledger and protect the hidden mourner."
    ],
    "stakes": [
      "At Grave Hunger 4, the announced burial row opens toward the named beneficiary.",
      "Destroying graves or offerings erases evidence and worsens neglect.",
      "Restoring names and custody can end the cycle without ritual imitation."
    ],
    "toneKeywords": [
      "mournful",
      "earthbound",
      "ashamed",
      "investigative"
    ]
  },
  "atmosphere": {
    "title": "Sweet Offerings, Warm Soil, and Careful Chewing",
    "motifs": [
      "sweet rice",
      "warm earth",
      "suppressed sobbing"
    ],
    "signature": "A well-tended graveyard contains small, precise signs that care has been diverted: bitten offerings, warm soil, reversed knots, and weeping beneath prayers.",
    "manifestations": [
      {
        "id": "chewing-under-bells",
        "text": "Soft chewing continues beneath the funeral bell.",
        "senses": [
          "sound"
        ],
        "intensity": "low",
        "frequency": "recurring"
      },
      {
        "id": "soil-warm",
        "text": "One grave row is warm a finger’s depth below the surface.",
        "senses": [
          "touch"
        ],
        "intensity": "low",
        "frequency": "localized"
      },
      {
        "id": "offering-bites",
        "text": "Carefully placed food bears the same human bite.",
        "senses": [
          "sight"
        ],
        "intensity": "medium",
        "frequency": "recurring"
      },
      {
        "id": "ledger-dry",
        "text": "The caretaker ledger stays dry and readable even beside opened earth.",
        "senses": [
          "sight",
          "touch"
        ],
        "intensity": "medium",
        "frequency": "localized"
      }
    ],
    "exclusions": [
      "a universal doctrine claim",
      "ritual imitation as required solution",
      "hunger or grief treated as innate evil"
    ]
  },
  "rule": {
    "id": "grave-hunger",
    "title": "Grave Hunger",
    "stateLabel": "Hunger",
    "ability": "Wisdom",
    "skills": [
      "Insight",
      "Religion"
    ],
    "motifs": [
      "missing name",
      "disturbed offering",
      "warm grave"
    ],
    "events": [
      "conceal-evidence-of-a-violated-grave",
      "take-an-offering-or-record-for-personal-gain",
      "speak-a-dead-persons-name-then-ignore-the-visible-duty",
      "remain-on-the-announced-burial-row-after-the-hunger-warning"
    ],
    "effect": "On a failed check, one already visible neglected duty advances in the named burial row. The effect changes offerings, soil, routes, or temporary compulsion; it does not require consumption or performance of a real rite.",
    "counterplay": [
      {
        "id": "restore-name-and-record",
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
        "success": "Restore one missing name or caretaker entry and reduce Grave Hunger by 1."
      },
      {
        "id": "return-existing-offering",
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
        "success": "Return or protect an offering already present and prevent the next escalation."
      },
      {
        "id": "shelter-remains",
        "actionCost": "movement along the visible safe route",
        "check": null,
        "success": "Move exposed remains or evidence along the visible shelter route without increasing the track."
      }
    ],
    "reset": "The track returns to 0 when the named duty is documented and restored, or when the party withdraws through the visible caretaker path.",
    "escalation": [
      "One offering or grave identifies the neglected duty under pressure.",
      "Warm soil opens one named evidence route and closes a false one.",
      "Announce the exact burial row, beneficiary, or witness that hunger will reach next.",
      "After one full round or exploration turn, the announced target imposes temporary compulsion, route pressure, or exposure; withdrawal remains possible."
    ],
    "gmSummary": "Center neglect, responsibility, evidence, and restitution. Do not require real ritual imitation or treat cultural difference as threat.",
    "playerFacingSigns": [
      "The neglected duty and affected burial row are named before escalation.",
      "Names, ledgers, and physical evidence remain discoverable.",
      "Restoration, shelter, confrontation, and withdrawal remain valid counterplay."
    ]
  },
  "signs": [
    {
      "id": "bitten-offering",
      "title": "The Offering Bears a Human Bite",
      "motifs": [
        "offering",
        "bite"
      ],
      "description": "A carefully placed funeral offering has been eaten by a living human after it was left for the dead.",
      "variations": [
        "All bites match one missing caretaker.",
        "A cloth beneath the food preserves ash fingerprints.",
        "The uneaten half points toward the shelter."
      ],
      "interaction": "Documenting the bite separates theft from supernatural predation.",
      "revelationLink": "beneficiary-revelation"
    },
    {
      "id": "inside-knot",
      "title": "The Grave Rope Was Tied from Inside",
      "motifs": [
        "rope",
        "opened grave"
      ],
      "description": "A grave cord is closed with a penitential knot on the side beneath the earth.",
      "variations": [
        "The knot contains a ledger fiber.",
        "Mud shows the grave was reopened carefully.",
        "One strand matches the caretaker shelter."
      ],
      "interaction": "Preserving the knot identifies concealment rather than random disturbance.",
      "revelationLink": "concealment-revelation"
    },
    {
      "id": "missing-name",
      "title": "One Grave Has No Name",
      "motifs": [
        "missing name",
        "ledger"
      ],
      "description": "A maintained grave lacks a marker even though the ledger reserves a line for it.",
      "variations": [
        "Rain reveals older lettering.",
        "The blank line has a payment seal.",
        "A nearby offering uses the missing initials."
      ],
      "interaction": "Restoring the name reveals which official diverted the burial funds.",
      "revelationLink": "duty-revelation"
    },
    {
      "id": "weeping-shadow",
      "title": "A Shadow Weeps Before It Eats",
      "motifs": [
        "shadow",
        "shame"
      ],
      "description": "A hunched shadow appears beside disturbed offerings and sobs before any food moves.",
      "variations": [
        "The shadow avoids the named grave.",
        "It points toward the official’s storehouse.",
        "It disappears when the ledger is opened."
      ],
      "interaction": "Addressing the concealed duty makes the shadow indicate evidence instead of hunger.",
      "revelationLink": "route-revelation"
    }
  ],
  "sensoryTitle": "Sweet Rice, Open Earth, and Quiet Sobbing",
  "sensorySignature": "Sweet offerings, damp soil, warm grave earth, and careful chewing keep hunger tied to evidence of neglected care.",
  "sensoryMotifs": [
    "sweet offering",
    "warm soil",
    "grave rope",
    "quiet sobbing"
  ],
  "smellLow": "sweet rice and damp soil",
  "smellMedium": "opened earth, ash, and copper",
  "smellHigh": "stale offerings, warm soil, and enclosed breath",
  "touchLow": "cool and granular",
  "touchMedium": "warm below the surface",
  "touchHigh": "shifting like a careful hand",
  "soundBeat": "chewing interrupted by a suppressed sob",
  "sensoryExclusions": [
    "generic exoticism",
    "ritual instructions",
    "gratuitous feeding detail"
  ],
  "readAloudTitle": "Read-Aloud — The Graveyard of Unfinished Duties",
  "anchorA": "A caretaker path lined with named graves",
  "anchorB": "An offering house divided by a dry ledger table",
  "safeAnchor": "A visible shelter route beside the caretaker’s room",
  "visibleA": "Rows of disturbed offerings and careful footprints",
  "visibleB": "One warm grave with a missing name",
  "visibleC": "Ledger marks leading toward the shelter path",
  "detailA": "A human bite",
  "detailB": "A reversed grave knot",
  "detailC": "A blank paid-for ledger line",
  "motionA": "A weeping shadow",
  "motionB": "The warm soil",
  "motionC": "The caretaker-path marker",
  "exitA": "The burial row",
  "exitB": "The shelter route",
  "exitC": "The official storehouse",
  "session": {
    "title": "Session Guide — Unfinished Duties",
    "motifs": [
      "grief",
      "neglect",
      "restitution"
    ],
    "openingBeat": {
      "situation": "A funeral bell rings over careful chewing while the caretaker ledger preserves payment for a grave whose name has been removed.",
      "immediateSignal": "Offerings bear human bite marks, and the rope on the disturbed grave is tied from below.",
      "playerDecision": "Protect the hidden mourner, restore the erased name, or confront the beneficiary before Grave Hunger advances."
    },
    "objectives": [
      "Identify the concealed burial duty.",
      "Protect evidence and the hidden mourner.",
      "Restore names, offerings, and accountability without ritual imitation."
    ],
    "revelations": [
      "beneficiary-revelation",
      "concealment-revelation",
      "duty-revelation"
    ],
    "linkConditions": [
      "The bite and ash print identify who handled the diverted offerings.",
      "The inside knot and payment seal connect the grave to the official ledger."
    ],
    "fallbackClues": [
      "Rain reveals the missing initials.",
      "The weeping shadow points toward the dry ledger.",
      "A shelter cloth matches the rope fiber."
    ],
    "stallMoves": [
      {
        "id": "advance-hunger",
        "trigger": "The table delays after a clear grave clue.",
        "action": "Advance Grave Hunger by 1 and name the burial row, witness, or beneficiary that will carry the next effect."
      },
      {
        "id": "official-moves-ledger",
        "trigger": "The official is left unchallenged.",
        "action": "Move the caretaker ledger toward the storehouse without resolving responsibility."
      },
      {
        "id": "bell-repeats-name",
        "trigger": "A revelation is missed twice.",
        "action": "The bell repeats the missing initials while the safe shelter path remains visible."
      }
    ],
    "climaxGuidance": "At Grave Hunger 4, resolve only the burial row, witness, or beneficiary announced at Hunger 3 after one full round or exploration turn. Keep the caretaker path, shelter route, and evidence-based restitution open."
  }
});

export const JIKININKI_SEMANTIC_V2_PACK = RESULT.pack;
export const JIKININKI_SEMANTIC_V2_MODULE = RESULT.module;
export const JIKININKI_SEMANTIC_V2_LEGACY_IDS = RESULT.legacyIds;
export const JIKININKI_SEMANTIC_V2_REVIEW_VERSION = RESULT.reviewVersion;
