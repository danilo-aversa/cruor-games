import { createPhase8SemanticCandidate } from "./phase8-semantic-candidate.factory.js";
import {
  WAX_DEATH_MASKS_INSPIRATION_MODULE,
  WAX_DEATH_MASKS_LOCATION_COMPONENTS,
  WAX_DEATH_MASKS_LOCATION_REGION_COMPONENTS,
} from "../inspiration-modules/wax-death-masks.js";

export const WAX_DEATH_MASKS_SEMANTIC_V2_PACK_ID = "wax-death-masks-semantic-v2";
export const WAX_DEATH_MASKS_SEMANTIC_V2_MODULE_ID = "wax-death-masks";
export const WAX_DEATH_MASKS_SEMANTIC_V2_SOURCE_ANCHOR_ID = "wax-death-masks";

const RESULT = createPhase8SemanticCandidate({
  legacyModule: WAX_DEATH_MASKS_INSPIRATION_MODULE,
  legacyComponents: [
    ...WAX_DEATH_MASKS_LOCATION_COMPONENTS,
    ...WAX_DEATH_MASKS_LOCATION_REGION_COMPONENTS,
  ],
  "slug": "wax-death-masks",
  "modernCapabilityLinks": [
    {
      "capability": "monster-composer",
      "ownership": "external-modern-source",
      "sourceFile": "features/monster-composer/data/monster-grafts.js",
      "sourceAnchorId": "wax-death-masks",
      "expectedEntries": 7,
      "verification": "source-anchor-parity"
    }
  ],
  "title": "Wax Death Masks",
  "sourceKind": "object",
  "citation": {
    "label": "Smithsonian National Museum of American History, death mask collections",
    "url": "https://americanhistory.si.edu/collections/object/nmah_492232",
    "reliability": "primary"
  },
  "sourceSummary": "Smithsonian object records document death masks as material casts associated with named deceased people and later museum custody. The historical object preserves likeness; all identity transfer, responsive wax, and Likeness Heat procedures are Cruor fiction.",
  "sourceTypes": [
    "Historical Object",
    "Memorial Portraiture",
    "Museum Collection"
  ],
  "themes": [
    "likeness and identity",
    "custody of memory",
    "family authority",
    "portrait evidence"
  ],
  "motifs": [
    "wax face",
    "mismatched expression",
    "warm impression",
    "empty portrait label"
  ],
  "horror": [
    "Gothic",
    "Psychological Horror",
    "Occult Horror"
  ],
  "contexts": [
    "noble-house",
    "gallery",
    "archive",
    "chapel"
  ],
  "reviewTag": "museum-ethics-review-required",
  "publicationBlockers": [
    "human-editorial-signoff-required",
    "museum-ethics-review-required",
    "sample-qa-local-verification-required",
    "image-provenance-required"
  ],
  "sourceBoundary": "Historical death masks and museum object records provide bounded material context. Responsive wax, copied memory, identity displacement, and the Likeness Heat track are Cruor fiction. A mask never proves the character or wishes of the represented person.",
  "provenanceNote": "Editorially re-authored from the frozen Wax Death Masks location and region vocabulary while excluding seven already-modern Monster grafts from pack ownership.",
  "migrationNote": "AI-assisted editorial candidate. Smithsonian object context, local sample QA, image provenance, and final human approval remain explicit publication gates. Monster parity is external and never copied.",
  "editorialNotes": [
    "Object boundary: the cited Smithsonian record documents a physical death-mask cast and its museum custody, not supernatural memory.",
    "Identity boundary: resemblance is evidence of likeness, never proof of personality, consent, guilt, or inheritance.",
    "Museum boundary: labels, provenance, storage, and family claims are treated as contested custody systems.",
    "Fictional transformation: responsive expressions, transferred identities, and Likeness Heat are Cruor fiction.",
    "Ownership boundary: this module owns Archive and Dark Places only; seven modern Monster grafts remain external.",
    "Publication gate: museum-ethics review, repeatable local sample QA, human signoff, and image provenance remain required."
  ],
  "sourceTags": [
    "death-mask",
    "portraiture",
    "museum-object",
    "identity"
  ],
  "editorial": {
    "deck": "Preserved likeness becomes contested evidence inside a house that treats faces as inheritable property.",
    "whatItIs": "A death mask is a material cast preserving a deceased person’s facial likeness. Museum records can document the object, associated person, material, custody, and later interpretation without establishing the subject’s wishes or inner life.",
    "whyItDisturbs": "Cruor horror begins when families and institutions treat resemblance as possession and force the living to perform identities preserved by objects.",
    "creativeUses": [
      "Use labels and casts as contradictory identity evidence.",
      "Turn portrait galleries into routes of coercive inheritance.",
      "Make cooling, provenance, and removal from display practical counterplay.",
      "Let the represented dead remain unknowable beyond material evidence."
    ],
    "cautions": [
      "Do not treat facial resemblance as proof of personality or guilt.",
      "Do not imply that a museum label resolves consent or identity.",
      "Do not present supernatural speech as historical evidence.",
      "Keep the institution and inheritance claim—not bodily difference—as the antagonist.",
      "Label all responsive wax and identity transfer as fiction."
    ]
  },
  "media": {
    "imageKey": "card-wax-death-mask.webp",
    "imageProvider": "local",
    "imageAlt": "Wax Death Masks inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
    "imageCredit": "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep unpublished until provenance is verified or the image is replaced.",
    "icon": "fa-masks-theater"
  },
  "identity": {
    "title": "The House of Borrowed Faces",
    "motifs": [
      "portrait gallery",
      "cooling cabinet",
      "family label"
    ],
    "originalPurpose": "A memorial studio and family gallery preserved casts, portraits, names, and documented chains of custody for the dead.",
    "originalUsers": [
      "families commissioning memorial likenesses",
      "artisans recording material casts",
      "custodians maintaining labels and storage"
    ],
    "historicalChange": "A later heir treated resemblance as legal possession, relabeled uncertain masks, and used the gallery to assign the living to approved ancestors.",
    "horrorTruth": "The house now warms whichever mask supports the strongest current claim and presses that likeness onto rooms, records, and witnesses.",
    "currentFunction": "The party can compare casts, restore labels, cool unstable masks, and separate material resemblance from inherited identity claims.",
    "currentConflict": "An heir wants one mask accepted as proof of succession while displaced relatives need the original provenance recovered before the house fixes the false likeness.",
    "playerEntryPoints": [
      "Recover the missing studio register.",
      "Identify which labels were replaced.",
      "Escort a living witness through the gallery without accepting a borrowed identity."
    ],
    "stakes": [
      "At Likeness Heat 4, the announced gallery imposes one visible borrowed identity.",
      "Destroying masks erases evidence as well as coercive power.",
      "Restoring provenance preserves memory without validating possession."
    ],
    "toneKeywords": [
      "intimate",
      "gothic",
      "curated",
      "unstable"
    ]
  },
  "atmosphere": {
    "title": "Warm Wax, Quiet Labels, and Familiar Strangers",
    "motifs": [
      "wax warmth",
      "portrait silence",
      "repeated features"
    ],
    "signature": "Cool galleries contain masks that grow warm near disputed names, while portraits repeat features no living sitter remembers sharing.",
    "manifestations": [
      {
        "id": "wax-breathes",
        "text": "A thin sheen forms over one mask when its label is read aloud.",
        "senses": [
          "sight",
          "touch"
        ],
        "intensity": "low",
        "frequency": "recurring"
      },
      {
        "id": "labels-scrape",
        "text": "Paper labels shift against their pins after a family claim.",
        "senses": [
          "sound"
        ],
        "intensity": "low",
        "frequency": "localized"
      },
      {
        "id": "familiar-reflection",
        "text": "A mirror briefly gives one visitor the expression of a displayed mask.",
        "senses": [
          "sight"
        ],
        "intensity": "medium",
        "frequency": "recurring"
      },
      {
        "id": "cool-cabinet-stills",
        "text": "The documented storage cabinet remains cold and quiet even when the gallery reacts.",
        "senses": [
          "touch",
          "sound"
        ],
        "intensity": "medium",
        "frequency": "localized"
      }
    ],
    "exclusions": [
      "a mask as reliable testimony",
      "facial difference as corruption",
      "unannounced identity loss"
    ]
  },
  "rule": {
    "id": "likeness-heat",
    "title": "Likeness Heat",
    "stateLabel": "Heat",
    "ability": "Intelligence",
    "skills": [
      "Investigation",
      "History"
    ],
    "motifs": [
      "warming wax",
      "borrowed expression",
      "corrected label"
    ],
    "events": [
      "wear-or-move-a-mask-without-checking-its-provenance",
      "assign-a-living-person-an-identity-by-resemblance-alone",
      "expose-a-disputed-mask-to-heat-after-the-warning",
      "remain-in-the-announced-gallery-after-the-likeness-warning"
    ],
    "effect": "On a failed check, one already visible likeness claim advances in the named room. The effect alters labels, portraits, routes, or temporary presentation; it never reveals a deceased person’s true thoughts.",
    "counterplay": [
      {
        "id": "restore-label-chain",
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
        "success": "Restore one documented link in the chain of custody and reduce Likeness Heat by 1."
      },
      {
        "id": "cool-visible-mask",
        "actionCost": "one action or one exploration interaction",
        "check": {
          "ability": "Dexterity",
          "skills": [
            "Sleight of Hand"
          ],
          "dc": null,
          "scalingKey": "intrusion"
        },
        "success": "Place the announced mask in the visible cooling cabinet and prevent its next escalation."
      },
      {
        "id": "separate-witness-from-cast",
        "actionCost": "movement along the visible safe route",
        "check": null,
        "success": "Move a living witness or disputed mask along the documented safe route without increasing the track."
      }
    ],
    "reset": "The track returns to 0 when the disputed masks are cooled and correctly labeled, or when the party withdraws through the visible service route.",
    "escalation": [
      "One mask warms and identifies the claim under pressure.",
      "A portrait adopts the mask’s expression and closes one named interaction.",
      "Announce the exact gallery, mirror, or witness that will carry the borrowed likeness.",
      "After one full round or exploration turn, the announced target imposes temporary misidentification or route substitution; withdrawal remains possible."
    ],
    "gmSummary": "Treat likeness as contested material evidence. Never let resemblance become automatic truth or permanent character overwrite.",
    "playerFacingSigns": [
      "The warming mask and affected room are named before escalation.",
      "Labels and studio records remain discoverable.",
      "Cooling, provenance repair, and withdrawal remain valid counterplay."
    ]
  },
  "signs": [
    {
      "id": "mismatched-expression",
      "title": "The Expression Does Not Match",
      "motifs": [
        "expression",
        "portrait"
      ],
      "description": "A mask’s expression differs from every surviving portrait of the named person.",
      "variations": [
        "The mouth relaxes when the true label is nearby.",
        "One eye crease matches a different family portrait.",
        "The expression changes only after a claim is spoken."
      ],
      "interaction": "Comparing the mask with two independent portraits identifies a replaced label.",
      "revelationLink": "provenance-revelation"
    },
    {
      "id": "duplicate-fingerprint",
      "title": "A Fingerprint Repeats in the Wax",
      "motifs": [
        "fingerprint",
        "studio evidence"
      ],
      "description": "The same artisan fingerprint appears on masks supposedly made decades apart.",
      "variations": [
        "A thumbprint sits beneath the chin.",
        "The print repeats under a painted repair.",
        "Wax dust reveals the print on a label seal."
      ],
      "interaction": "Lifting or sketching the print connects the masks to one hidden workshop.",
      "revelationLink": "workshop-revelation"
    },
    {
      "id": "warm-wax-tear",
      "title": "A Wax Tear Stays Warm",
      "motifs": [
        "warm wax",
        "grief display"
      ],
      "description": "A bead of wax forms beneath one eye and remains warm without melting the face.",
      "variations": [
        "The tear points toward the cooling cabinet.",
        "The bead contains a paper fiber.",
        "The warmth rises when a false name is used."
      ],
      "interaction": "Cooling the tear preserves a fragment of the original label.",
      "revelationLink": "custody-revelation"
    },
    {
      "id": "empty-portrait-label",
      "title": "One Portrait Label Is Empty",
      "motifs": [
        "empty label",
        "family record"
      ],
      "description": "An empty label has pinholes matching a disputed mask’s current card.",
      "variations": [
        "The reverse bears an older catalog number.",
        "Dust outlines a longer surname.",
        "The label aligns with a service-door inventory."
      ],
      "interaction": "Restoring the label opens the documented service route.",
      "revelationLink": "route-revelation"
    }
  ],
  "sensoryTitle": "Wax, Linen, and Quiet Breath",
  "sensorySignature": "Warm wax, dry linen, faint studio oil, and labels scraping against pins create intimate pressure without making a mask reliable testimony.",
  "sensoryMotifs": [
    "warm wax",
    "linen wrapping",
    "paper label",
    "shallow breath"
  ],
  "smellLow": "cool wax and linen",
  "smellMedium": "warm wax and old studio oil",
  "smellHigh": "hot wax, paper glue, and enclosed air",
  "touchLow": "cool and powdery",
  "touchMedium": "soft at the edges",
  "touchHigh": "warm enough to hold a fingerprint",
  "soundBeat": "a label scraping against its pin",
  "sensoryExclusions": [
    "rotting faces",
    "automatic dead speech",
    "facial difference used as threat"
  ],
  "readAloudTitle": "Read-Aloud — The House of Borrowed Faces",
  "anchorA": "A cool receiving room lined with blank portrait hooks",
  "anchorB": "A central gallery divided by glass cases and family labels",
  "safeAnchor": "A documented service corridor beside the cooling cabinet",
  "visibleA": "Rows of masks angled toward disputed names",
  "visibleB": "One visibly warming mask and its altered label",
  "visibleC": "Blue storage marks leading to the cooling route",
  "detailA": "A wax expression",
  "detailB": "An artisan fingerprint",
  "detailC": "An empty label outline",
  "motionA": "A portrait reflection",
  "motionB": "The warming wax",
  "motionC": "The service-door indicator",
  "exitA": "The gallery aisle",
  "exitB": "The cooling-cabinet corridor",
  "exitC": "The inheritance salon",
  "session": {
    "title": "Session Guide — Borrowed Faces",
    "motifs": [
      "provenance",
      "likeness",
      "custody"
    ],
    "openingBeat": {
      "situation": "A memorial mask warms when a living witness enters while its paper label assigns the likeness to the wrong branch of the family.",
      "immediateSignal": "The wax softens only near one witness, and the reverse of the label shows an older catalog number.",
      "playerDecision": "Recover the original studio register, cool and secure the mask, or challenge the succession claim before Likeness Heat advances."
    },
    "objectives": [
      "Recover the original studio register.",
      "Separate material resemblance from the succession claim.",
      "Preserve or return the masks without accepting coerced identities."
    ],
    "revelations": [
      "provenance-revelation",
      "workshop-revelation",
      "custody-revelation"
    ],
    "linkConditions": [
      "The repeated fingerprint links the relabeling to one workshop.",
      "The warm tear preserves fiber from the original catalog card."
    ],
    "fallbackClues": [
      "A mirror shows the missing catalog number.",
      "Cold wax dust outlines the removed surname.",
      "The service inventory lists the disputed case."
    ],
    "stallMoves": [
      {
        "id": "advance-heat",
        "trigger": "The table delays after a clear label clue.",
        "action": "Advance Likeness Heat by 1 and name the gallery or witness that will carry the next effect."
      },
      {
        "id": "heir-moves-mask",
        "trigger": "The heir is left unchallenged.",
        "action": "Move the disputed mask toward the inheritance salon without resolving the claim."
      },
      {
        "id": "cabinet-clicks",
        "trigger": "A revelation is missed twice.",
        "action": "The cooling cabinet unlocks and exposes one original label fragment."
      }
    ],
    "climaxGuidance": "At Likeness Heat 4, resolve only the gallery or witness announced at Heat 3 after one full round or exploration turn. Keep the cooling cabinet, service corridor, and evidence-based invalidation open."
  }
});

export const WAX_DEATH_MASKS_SEMANTIC_V2_PACK = RESULT.pack;
export const WAX_DEATH_MASKS_SEMANTIC_V2_MODULE = RESULT.module;
export const WAX_DEATH_MASKS_SEMANTIC_V2_LEGACY_IDS = RESULT.legacyIds;
export const WAX_DEATH_MASKS_SEMANTIC_V2_REVIEW_VERSION = RESULT.reviewVersion;
