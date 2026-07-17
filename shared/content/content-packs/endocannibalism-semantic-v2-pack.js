import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeContentPackV0_2,
  normalizeSemanticProvenance,
} from "../contracts/semantic/index.js";

function countReadAloudWords(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function ensureReadAloudSentence(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function expandReadAloudFragments(fragments, expansions, minimumWords = 15) {
  return Object.fromEntries(
    Object.entries(fragments || {}).map(([group, entries]) => [
      group,
      (entries || []).map((entry) => {
        const text = ensureReadAloudSentence(entry.text);
        const currentWords = countReadAloudWords(text);
        if (currentWords >= minimumWords) return { ...entry, text };
        const suffix = String(expansions[group] || "")
          .replace(/[.!?]+$/, "")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, minimumWords - currentWords)
          .join(" ");
        return {
          ...entry,
          text: ensureReadAloudSentence(
            `${text.replace(/[.!?]+$/, "")}; ${suffix}`.trim(),
          ),
        };
      }),
    ]),
  );
}

export const ENDOCANNIBALISM_SEMANTIC_V2_PACK_ID = "endocannibalism-semantic-v2";
export const ENDOCANNIBALISM_SEMANTIC_V2_MODULE_ID = "endocannibalism";
export const ENDOCANNIBALISM_SEMANTIC_V2_SOURCE_ANCHOR_ID = "endocannibalism";

const REVIEW_VERSION = "phase8-endocannibalism-editorial-approved-v1";

function createProvenance({
  legacyIds = [],
  relation = "derived",
  note = "Editorially re-authored from the frozen Endocannibalism module and its funerary meal, ash, inherited memory, household obligation, and named-relationship vocabulary.",
  migrationNote = "AI-assisted editorial candidate. South Fore-specific anthropological review, repeatable local sample QA, image provenance, and final human approval remain explicit publication gates. Mortuary mourning is separated from Cruor coercive-memory fiction.",
} = {}) {
  return normalizeSemanticProvenance({
    sources: [{ sourceAnchorId: ENDOCANNIBALISM_SEMANTIC_V2_SOURCE_ANCHOR_ID, relation, note }],
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
  "endocannibalism",
  "inspiration-endocannibalism",
  "Endocannibalism"
],
  relation: "editorial-constraint",
  note: "South Fore mortuary transumption provides a bounded context of grief, kinship, and care for the dead. Literal inherited memories, Memory Burden, coercive household obligations, and all game procedures are original Cruor fantasy extrapolations.",
});

function createDarkPlacesComponent({ id, title, semanticType, semantic, legacyIds = [], motifs = [], generation = {} }) {
  const provenance = createProvenance({ legacyIds });
  return {
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
    id, title, status: "in-review", contentType: "semantic-location-component", semanticType,
    workflows: ["darken-location"], slots: [], sourceAnchors: [ENDOCANNIBALISM_SEMANTIC_V2_SOURCE_ANCHOR_ID],
    sourceTypes: [
  "Funerary Practice",
  "Ritual",
  "Anthropology"
],
    themes: [
  "mourning",
  "kinship continuity",
  "embodied memory",
  "consent and obligation"
], motifs, horror: [
  "Folk Horror",
  "Psychological Horror",
  "Body Horror"
], contexts: [
  "village",
  "noble-house",
  "crypt",
  "ritual"
],
    compatibility: { capabilities: ["dark-places"], excludedCapabilities: ["monster-composer"] },
    generation: { phase: 8, ...generation }, semantic: { ...semantic, provenance }, provenance,
  };
}

const DARK_PLACES_COMPONENTS = [
  createDarkPlacesComponent({
    "id": "endocannibalism-place-identity",
    "title": "The House That Carries the Dead",
    "semanticType": "place-identity",
    "legacyIds": [
      "places-premise-communion-of-ash",
      "location-region-funeral-feast-hall"
    ],
    "motifs": [
      "named bowl",
      "household relation",
      "borrowed memory"
    ],
    "generation": {
      "primary": true
    },
    "semantic": {
      "originalPurpose": "A communal house organized funerary meals, named offerings, seats, and household records so grief and obligations could be carried collectively rather than left with one mourner.",
      "originalUsers": [
        "kin groups responsible for named offerings and household records",
        "mourners gathering in assigned relationship groups",
        "caretakers preserving consent, sequence, and custody of funerary objects"
      ],
      "historicalChange": "A later household leader erased several relationships and reassigned their bowls to force disputed memories into a preferred family history. The house was sealed after mourners began speaking with memories they did not recognize.",
      "horrorTruth": "The house now treats remembrance as transferable property. Warm rooms, named bowls, and records impose Memory Burden whenever visitors accept a coerced relationship or move an offering without consent.",
      "currentFunction": "The party can identify kin relationships, return named objects, release borrowed memories, and follow the consented household route without consuming remains or imitating a mortuary rite.",
      "currentConflict": "A family faction wants the altered record preserved because it legitimizes their claim, while affected mourners need their coerced memories released before the house fixes them permanently.",
      "playerEntryPoints": [
        "Recover the original household record beneath the altered feast table.",
        "Return named bowls and seat markers to the relationships supported by evidence.",
        "Release coerced memories without destroying the communal house or repeating the practice."
      ],
      "stakes": [
        "At Memory Burden 4, the announced room forces one visible relationship into a coercive environmental effect.",
        "Destroying the records frees some memories but erases evidence of the manipulation.",
        "Restoring consent lets the house remain a place of mourning rather than a supernatural archive."
      ],
      "toneKeywords": [
        "intimate",
        "warm",
        "burdened",
        "familial"
      ]
    }
  }),
  createDarkPlacesComponent({
    "id": "endocannibalism-site-atmosphere",
    "title": "Warm Rooms, Named Bowls, and Grief Held Close",
    "semanticType": "site-atmosphere",
    "legacyIds": [
      "places-sense-ash-on-tongue",
      "places-sense-feast-room-warmth"
    ],
    "motifs": [
      "warm grain",
      "clean ash",
      "assigned seat"
    ],
    "semantic": {
      "signature": "Warm communal rooms, carefully named objects, clean ash, and relationship-based seating make grief feel materially organized rather than chaotic.",
      "manifestations": [
        {
          "id": "warm-without-fire",
          "text": "The communal room stays warm after every hearth has gone cold.",
          "senses": [
            "temperature",
            "touch"
          ],
          "intensity": "low",
          "frequency": "pervasive"
        },
        {
          "id": "names-finish-themselves",
          "text": "A second voice softly finishes familiar names spoken near the household record.",
          "senses": [
            "sound"
          ],
          "intensity": "low",
          "frequency": "recurring"
        },
        {
          "id": "bowls-by-relation",
          "text": "Bowls and seats are arranged by relationship, with one conspicuous blank in every sequence.",
          "senses": [
            "sight"
          ],
          "intensity": "medium",
          "frequency": "localized"
        },
        {
          "id": "borrowed-flavor",
          "text": "Clean ash leaves the memory of a meal or place the taster never knew.",
          "senses": [
            "taste",
            "proprioception"
          ],
          "intensity": "medium",
          "frequency": "recurring"
        }
      ],
      "exclusions": [
        "savage feast imagery",
        "consumption as required counterplay",
        "anonymous corpses without kinship context"
      ],
      "escalationLinks": [
        "memory-burden"
      ]
    }
  }),
  createDarkPlacesComponent({
    "id": "memory-burden",
    "title": "Memory Burden",
    "semanticType": "global-rule",
    "legacyIds": [
      "location-region-mourning-kitchen",
      "places-hazard-feast-bench-lock",
      "places-twist-feast-obligation"
    ],
    "motifs": [
      "borrowed memory",
      "named relationship",
      "consented release"
    ],
    "semantic": {
      "id": "memory-burden",
      "title": "Memory Burden",
      "scope": "location",
      "category": "pressure-track",
      "trigger": {
        "events": [
          "claim-a-memory-or-relationship-not-supported-by-visible-records",
          "move-a-named-bowl-seat-or-offering-without-preserving-its-relationship",
          "coerce-a-witness-to-carry-or-release-a-memory",
          "remain-in-the-announced-room-after-the-burden-warning"
        ],
        "timing": "Immediately after a listed event; outside combat, also check the track at the end of each ten-minute exploration turn in an affected region.",
        "frequencyLimit": "Once per combat round, or once per ten-minute exploration turn."
      },
      "state": {
        "label": "Memory",
        "minimum": 0,
        "maximum": 4,
        "initial": 0
      },
      "resolution": {
        "timing": "At the end of each combat round; outside combat, at the end of each ten-minute exploration turn.",
        "threshold": 2,
        "savingThrow": null,
        "check": {
          "ability": "Wisdom",
          "skills": [
            "Insight",
            "History"
          ],
          "dc": null,
          "scalingKey": "intrusion"
        },
        "attackRoll": null,
        "effect": {
          "damage": "",
          "damageType": "",
          "healing": "",
          "conditions": [],
          "additionalText": "On a failed check, advance one already visible borrowed memory, blocked seat, or household obligation in the named room. Counterplay uses consent, records, and returned offerings; the rule never requires consumption or imitation of a mortuary practice."
        },
        "duration": "Until countered or until the next track check.",
        "range": "location",
        "area": "one announced route, room, object group, or threshold",
        "frequency": "cadence-bound",
        "actionEconomy": "environmental procedure"
      },
      "counterplay": [
        {
          "id": "return-the-named-offering",
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
          "success": "Return a bowl, seat marker, or offering to the evidenced relationship and reduce Memory Burden by 1."
        },
        {
          "id": "release-the-coerced-memory",
          "actionCost": "one action",
          "check": {
            "ability": "Wisdom",
            "skills": [
              "Insight",
              "Religion"
            ],
            "dc": null,
            "scalingKey": "intrusion"
          },
          "success": "Acknowledge the memory as borrowed and release it without performing or imitating consumption."
        },
        {
          "id": "follow-the-consented-record",
          "actionCost": "movement along rooms supported by the household record",
          "check": null,
          "success": "Move through the named household route without increasing Memory Burden."
        }
      ],
      "reset": {
        "condition": "The track returns to 0 when the central evidence is secured, the damaged material system is stabilized, or the party withdraws through the visible safe route.",
        "value": 0
      },
      "escalation": [
        {
          "at": 1,
          "effect": "One warm bowl or seat identifies the relationship currently under strain."
        },
        {
          "at": 2,
          "effect": "A borrowed memory repeats through a visible household object and closes one named interaction until addressed."
        },
        {
          "at": 3,
          "effect": "Announce the exact room and relationship that will carry the final burden; keep a consent-based release route visible."
        },
        {
          "at": 4,
          "effect": "After one full round or ten-minute turn, the announced room imposes a coerced memory, social restraint, or environmental pressure. Returning the offering or withdrawing remains possible."
        }
      ],
      "gmSummary": "Frame every memory as attached to a named relationship and visible household evidence. Historical mortuary practice is not monster hunger, and no counterplay requires consumption.",
      "playerFacingSigns": [
        "The affected relationship is identified before escalation.",
        "Every borrowed memory is marked as borrowed rather than objective truth.",
        "Returning, documenting, or consensually releasing the memory remains possible."
      ]
    }
  }),
  createDarkPlacesComponent({
    "id": "endocannibalism-sign-bowl-residue",
    "title": "The Communion Bowl Residue",
    "semanticType": "recurring-sign",
    "legacyIds": [
      "places-anomaly-communion-bowl-residue"
    ],
    "motifs": [
      "named bowl",
      "clean ash"
    ],
    "semantic": {
      "id": "endocannibalism-sign-bowl-residue",
      "description": "A clean bowl preserves ash and food residue from a relationship that the current record denies.",
      "placement": {
        "frequency": "recurring",
        "minimumRooms": 1,
        "maximumRooms": 3,
        "allowedRoomRoles": [
          "entrance",
          "threshold",
          "clue",
          "ritual",
          "connector"
        ],
        "forbiddenRoomRoles": [],
        "preferredFeatures": []
      },
      "variations": [
        "The residue forms a name beneath warm water.",
        "A repair mark matches a seat assigned to another branch.",
        "The bowl cools when placed beside the altered record."
      ],
      "interaction": {
        "trigger": "Examine or return the bowl.",
        "effect": "Reveal the erased relationship and the original seat sequence.",
        "counterplay": "Place the bowl with the evidenced relationship without consuming its contents."
      },
      "revelationLink": "erased-relation-revelation"
    }
  }),
  createDarkPlacesComponent({
    "id": "endocannibalism-sign-tooth-row",
    "title": "The Family Tooth Row",
    "semanticType": "recurring-sign",
    "legacyIds": [
      "places-anomaly-family-tooth-row"
    ],
    "motifs": [
      "household inventory",
      "missing relation"
    ],
    "semantic": {
      "id": "endocannibalism-sign-tooth-row",
      "description": "A household inventory uses teeth or small personal tokens as custody markers, with one sequence rearranged after the dispute.",
      "placement": {
        "frequency": "recurring",
        "minimumRooms": 1,
        "maximumRooms": 3,
        "allowedRoomRoles": [
          "entrance",
          "threshold",
          "clue",
          "ritual",
          "connector"
        ],
        "forbiddenRoomRoles": [],
        "preferredFeatures": []
      },
      "variations": [
        "One token has a newer cord and no matching record.",
        "Empty spaces repeat the same relationship pattern as the bowls.",
        "A displaced marker warms beside the correct name."
      ],
      "interaction": {
        "trigger": "Compare the row with the household record.",
        "effect": "Reveal which family branch was removed or reassigned.",
        "counterplay": "Return the token or document the original custody without treating it as spectacle."
      },
      "revelationLink": "custody-revelation"
    }
  }),
  createDarkPlacesComponent({
    "id": "endocannibalism-sign-ash-note",
    "title": "The Ash Recipe Note",
    "semanticType": "recurring-sign",
    "legacyIds": [
      "places-clue-ash-recipe-note"
    ],
    "motifs": [
      "household note",
      "consent record"
    ],
    "semantic": {
      "id": "endocannibalism-sign-ash-note",
      "description": "A practical household note records who consented to carry which offering and where it should be returned.",
      "placement": {
        "frequency": "recurring",
        "minimumRooms": 1,
        "maximumRooms": 3,
        "allowedRoomRoles": [
          "entrance",
          "threshold",
          "clue",
          "ritual",
          "connector"
        ],
        "forbiddenRoomRoles": [],
        "preferredFeatures": []
      },
      "variations": [
        "The note lists relationships rather than ingredients.",
        "A later hand changes one consent mark into an obligation.",
        "The paper smells of smoke from a room that no longer has a hearth."
      ],
      "interaction": {
        "trigger": "Read the note beside the named bowls.",
        "effect": "Reveal the coercive alteration and the consented route through the house.",
        "counterplay": "Follow the original relationship record or restore the altered mark."
      },
      "revelationLink": "coercion-revelation"
    }
  }),
  createDarkPlacesComponent({
    "id": "endocannibalism-sign-shared-memory",
    "title": "The Shared Ash Memory",
    "semanticType": "recurring-sign",
    "legacyIds": [
      "places-reward-shared-ash-memory"
    ],
    "motifs": [
      "consented memory",
      "temporary insight"
    ],
    "semantic": {
      "id": "endocannibalism-sign-shared-memory",
      "description": "A sealed offering can share one bounded memory when its named relationship and consent record are intact.",
      "placement": {
        "frequency": "recurring",
        "minimumRooms": 1,
        "maximumRooms": 3,
        "allowedRoomRoles": [
          "entrance",
          "threshold",
          "clue",
          "ritual",
          "connector"
        ],
        "forbiddenRoomRoles": [],
        "preferredFeatures": []
      },
      "variations": [
        "The memory shows a place rather than a body.",
        "Two witnesses receive complementary details instead of identical visions.",
        "The offering cools and becomes inert after the memory is acknowledged."
      ],
      "interaction": {
        "trigger": "Open the sealed offering only with the matching record.",
        "effect": "Grant one clue or advantage tied to the dead without forcing identity onto the recipient.",
        "counterplay": "Decline or end the memory at any time and return the offering."
      },
      "revelationLink": "consented-memory-revelation"
    }
  }),
  createDarkPlacesComponent({
    "id": "endocannibalism-sensory-profile",
    "title": "Household Memory Sensory Profile",
    "semanticType": "sensory-profile",
    "legacyIds": [],
    "motifs": [
      "warm room",
      "clean ash",
      "borrowed certainty"
    ],
    "semantic": {
      "signature": "Warmth, names, and household order make every memory feel physically close but not necessarily owned.",
      "variants": {
        "sight": [
          "Named bowls and seats are grouped by relationship rather than status.",
          "Household records leave one relation blank where a memory has been coerced."
        ],
        "sound": [
          "A second voice finishes familiar names from inside the warm room.",
          "Empty bowls click softly whenever someone claims a memory that is not theirs."
        ],
        "smell": [
          "Warm grain, smoke, and clean ash replace the smell of decay.",
          "One sealed bowl smells of rain from a place outside the house."
        ],
        "touch": [
          "A named bowl stays warm without fire.",
          "A household record page feels damp where one name was erased."
        ],
        "taste": [
          "Clean ash leaves a remembered flavor with no matching meal.",
          "A bitter taste follows any coerced claim of kinship."
        ],
        "temperature": [
          "The communal room stays warm while the coerced-memory chamber is cold.",
          "One seat cools when its correct relation is spoken aloud."
        ],
        "proprioception": [
          "A borrowed memory arrives as certainty in the wrong body.",
          "Walking past the family record produces the sense of leaving someone behind."
        ]
      },
      "intensityTiers": {
        "low": [
          "One bowl remains warm without fire.",
          "A second voice completes a familiar name."
        ],
        "medium": [
          "A borrowed flavor arrives with a visible relationship cue.",
          "The altered record cools one assigned seat."
        ],
        "high": [
          "Every named object speaks through the wrong witness.",
          "The announced room fixes a coerced memory onto one relationship."
        ]
      },
      "roomRoleBias": {
        "entrance": [
          "Named bowls and seats are grouped by relationship rather than status."
        ],
        "threshold": [
          "A named bowl stays warm without fire."
        ],
        "ritual": [
          "A second voice finishes familiar names from inside the warm room."
        ],
        "secret": [
          "Warm grain, smoke, and clean ash replace the smell of decay."
        ],
        "climax": [
          "A borrowed memory arrives as certainty in the wrong body."
        ],
        "connector": [
          "The communal room stays warm while the coerced-memory chamber is cold."
        ]
      },
      "geometryBias": {
        "circular": [
          "Household records leave one relation blank where a memory has been coerced."
        ],
        "narrow": [
          "Empty bowls click softly whenever someone claims a memory that is not theirs."
        ],
        "large": [
          "One sealed bowl smells of rain from a place outside the house."
        ],
        "vertical": [
          "Walking past the family record produces the sense of leaving someone behind."
        ],
        "ruined": [
          "A household record page feels damp where one name was erased."
        ]
      },
      "exclusions": [
        "graphic feast spectacle",
        "anonymous primitive ritual",
        "consumption as player requirement"
      ],
      "repetitionPolicy": {
        "exactTextCooldown": "all-rooms",
        "senseCooldown": 1,
        "allowSignatureRepeat": false
      }
    }
  }),
  createDarkPlacesComponent({
    "id": "endocannibalism-read-aloud-profile",
    "title": "House That Carries the Dead Read-Aloud Profile",
    "semanticType": "read-aloud-profile",
    "legacyIds": [],
    "motifs": [
      "named bowls",
      "warm room",
      "household record"
    ],
    "semantic": {
      "fragments": {
        "spatialAnchors": [
          {
            "id": "feast-hall",
            "text": "A long communal room is arranged by household relationships rather than rank.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "mourning-kitchen",
            "text": "A warm kitchen holds sealed bowls, labels, and unused places for the dead.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "record-wall",
            "text": "A household record covers one wall with names linked to seats and offerings.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "release-room",
            "text": "A cool side room contains returned objects and blank consent slips.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          }
        ],
        "sensoryBeats": [
          {
            "id": "warm-grain",
            "text": "The room smells of warm grain, smoke, and clean ash.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "second-voice",
            "text": "A second voice quietly finishes names spoken near the table.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "warm-bowl",
            "text": "One named bowl stays warm against the cold wood.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "cold-erasure",
            "text": "The erased section of the record gives off a steady cold.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          }
        ],
        "visibleFeatures": [
          {
            "id": "relation-seats",
            "text": "Seats and bowls repeat the same relationship groups.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "blank-link",
            "text": "One relationship line ends in a conspicuous blank.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "altered-mark",
            "text": "A consent mark has been changed into an obligation by a later hand.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "returned-tokens",
            "text": "Small personal tokens wait in labeled spaces beside the cool room.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          }
        ],
        "unsettlingDetails": [
          {
            "id": "borrowed-place",
            "text": "A mourner describes a room they have never entered.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "wrong-childhood",
            "text": "Two relatives remember the same childhood from different bodies.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "ash-name",
            "text": "A name appears briefly in clean ash beneath warm water.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "extra-seat",
            "text": "The table sets one additional place whenever the altered record is read.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          }
        ],
        "motionOrChange": [
          {
            "id": "bowl-click",
            "text": "Empty bowls click toward the announced relationship.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "warmth-shift",
            "text": "The room warmth moves from one seat group to another.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          }
        ],
        "exitsAndDepth": [
          {
            "id": "consented-return",
            "text": "The cool release room remains open beyond the original record.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          },
          {
            "id": "announced-household",
            "text": "Every warm bowl turns toward one room while the return corridor stays clear.",
            "sourceComponentId": "endocannibalism-read-aloud-profile"
          }
        ]
      },
      "constraints": {
        "forbiddenSpoilerTags": [
          "secret",
          "solution",
          "true-identity"
        ],
        "maximumSentences": {
          "compact": 2,
          "standard": 4,
          "extended": 6
        },
        "wordRanges": {
          "compact": [
            20,
            35
          ],
          "standard": [
            45,
            75
          ],
          "extended": [
            80,
            120
          ]
        }
      },
      "grammar": {
        "openingOrder": [
          "spatial-anchors",
          "sensory-beats"
        ],
        "allowSecondPerson": false,
        "tense": "present"
      }
    }
  }),
  createDarkPlacesComponent({
    "id": "endocannibalism-session-guide",
    "title": "Running the House That Carries the Dead",
    "semanticType": "session-guide",
    "legacyIds": [],
    "motifs": [
      "altered record",
      "consent",
      "borrowed memory"
    ],
    "semantic": {
      "openingBeat": {
        "situation": "A family faction prepares to formalize an altered household record while mourners suffer memories assigned to the wrong relationships.",
        "immediateSignal": "One erased relationship stays cold on the wall while a warm bowl speaks a name no current record contains.",
        "playerDecision": "Recover the original record, return the named objects, or release the coerced memories before the new claim is fixed."
      },
      "objectives": [
        "Map bowls, seats, and offerings to their evidenced relationships.",
        "Find the alteration that converted consent into obligation.",
        "Release borrowed memories without requiring consumption or destroying the household record."
      ],
      "alwaysOnRuleIds": [
        "memory-burden"
      ],
      "pressureTrackId": "memory-burden",
      "clueFlow": {
        "requiredRevelations": [
          "erased-relation-revelation",
          "custody-revelation",
          "coercion-revelation"
        ],
        "links": [
          {
            "from": "erased-relation-revelation",
            "to": "custody-revelation",
            "condition": "The missing bowl and token row preserve the same erased relationship."
          },
          {
            "from": "custody-revelation",
            "to": "coercion-revelation",
            "condition": "The original custody marks match the consent note altered by the later hand."
          }
        ],
        "fallbackClues": [
          "Warm water reveals the erased name in one bowl.",
          "A returned token cools beside its correct relationship.",
          "A second voice reads the original consent mark when the note is placed on the record."
        ]
      },
      "stallMoves": [
        {
          "id": "advance-burden-in-named-room",
          "trigger": "The table delays after a clear relationship clue.",
          "action": "Advance Memory Burden by 1 and name the room or relationship that will carry the next effect."
        },
        {
          "id": "faction-reassigns-bowl",
          "trigger": "The claimant faction is left unchallenged.",
          "action": "Move one visible named bowl toward the altered seat without sealing the claim yet."
        },
        {
          "id": "memory-repeats-consent",
          "trigger": "A required revelation has been missed twice.",
          "action": "A borrowed memory repeats the original consent wording through a visible object."
        }
      ],
      "pacing": {
        "defaultRoute": [
          "location-region-1",
          "location-region-2",
          "location-region-3",
          "location-region-4",
          "location-region-5"
        ],
        "escalationRooms": [
          "location-region-3",
          "location-region-5"
        ],
        "climaxGuidance": "At Memory Burden 4, resolve only the relationship and room announced at Burden 3 after one full round or ten-minute turn. Keep the consent-based release room and withdrawal route open."
      }
    }
  }),
];

const ENDOCANNIBALISM_READ_ALOUD_EXPANSIONS = Object.freeze({
  spatialAnchors: "The documented release route remains visible behind it, preserving a way back toward witnesses and intact records.",
  sensoryBeats: "The change stays tied to named objects and consent records, allowing comparison without requiring ritual imitation.",
  visibleFeatures: "Seats, bowls, and labels keep the relationship legible while preserving evidence of coercion and later correction.",
  unsettlingDetails: "The alteration follows a disputed claim and leaves enough material evidence to identify whose memory was reassigned.",
  motionOrChange: "The movement advances only after Memory Burden rises and never closes the previously documented path of release.",
  exitsAndDepth: "The route remains legible from the current room and announces the final custody dispute before it resolves.",
});

const ENDOCANNIBALISM_READ_ALOUD_COMPONENT = DARK_PLACES_COMPONENTS.find(
  (component) => component.semanticType === "read-aloud-profile",
);

if (ENDOCANNIBALISM_READ_ALOUD_COMPONENT) {
  ENDOCANNIBALISM_READ_ALOUD_COMPONENT.semantic.fragments =
    expandReadAloudFragments(
      ENDOCANNIBALISM_READ_ALOUD_COMPONENT.semantic.fragments,
      ENDOCANNIBALISM_READ_ALOUD_EXPANSIONS,
    );
}

export const ENDOCANNIBALISM_SEMANTIC_V2_PACK = normalizeContentPackV0_2({
  schemaVersion: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
  id: ENDOCANNIBALISM_SEMANTIC_V2_PACK_ID,
  title: "Endocannibalism Semantic Content Pack",
  version: "0.2.0-phase8-approved1",
  status: "draft", locale: "en", author: "Cruor Games", license: "internal-prototype",
  tags: ["dark-places", "inspiration-archive", "endocannibalism", "phase8"],
  modules: [{
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    id: ENDOCANNIBALISM_SEMANTIC_V2_MODULE_ID, title: "Endocannibalism", packId: ENDOCANNIBALISM_SEMANTIC_V2_PACK_ID,
    status: "in-review", locale: "en", capabilities: ["inspiration-archive", "dark-places"],
    sourceAnchor: {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SOURCE_ANCHOR,
      id: ENDOCANNIBALISM_SEMANTIC_V2_SOURCE_ANCHOR_ID, title: "Endocannibalism", kind: "practice", status: "in-review",
      citation: { label: "Collinge et al., Kuru in the 21st century\u2014an acquired human prion disease with very long incubation periods", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2581657/", accessedVersion: `Accessed 2026-07-17; ${REVIEW_VERSION}` },
      summary: "A bounded anthropological and medical source discussing South Fore mortuary transumption as a complex practice tied to mourning, kinship, care for the dead, and the release of the deceased rather than aggression toward enemies.", reliability: "secondary",
      editorialNotes: [
  "Cultural boundary: endocannibalism is a broad analytical term covering different practices; this dossier is bounded to documented South Fore mortuary transumption and must not be generalized.",
  "Meaning boundary: the practice was embedded in mourning, kinship, care, and obligations to the dead; it is not reducible to hunger, savagery, or monster behavior.",
  "Language boundary: source terminology is retained only where needed for accuracy, while the internal legacy title remains a catalog label.",
  "Design boundary: gameplay uses household records, consent, named offerings, and memory custody; it never requires consumption or ritual imitation.",
  "Fictional transformation: literal inherited memories, coercive appetite, Memory Burden, and speaking household objects are Cruor fiction.",
  "Ownership boundary: no modern Monster grafts use the endocannibalism Source Anchor; this module owns only Archive and Dark Places content.",
  "Publication gate: South Fore-specific anthropological review, repeatable local sample QA, human signoff, and verifiable image provenance remain required."
], tags: [
  "south-fore",
  "mortuary-transumption",
  "mourning",
  "kinship"
],
    },
    inspiration: {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
      id: "inspiration-endocannibalism-v2", slug: "endocannibalism", title: "Endocannibalism", status: "approved",
      sourceAnchors: [ENDOCANNIBALISM_SEMANTIC_V2_SOURCE_ANCHOR_ID], sourceTypes: [
  "Funerary Practice",
  "Ritual",
  "Anthropology"
],
      themes: [
  "mourning",
  "kinship continuity",
  "embodied memory",
  "consent and obligation"
], motifs: [
  "named bowl",
  "household record",
  "clean ash",
  "warm communal room"
], horror: [
  "Folk Horror",
  "Psychological Horror",
  "Body Horror"
], contexts: [
  "village",
  "noble-house",
  "crypt",
  "ritual"
],
      editorial: {
  "deck": "Named offerings, household relationships, and embodied remembrance become a consent-centered memory system while South Fore mortuary practice remains distinct from Cruor coercive-memory fiction.",
  "whatItIs": "Endocannibalism is an analytical label for consuming members of one’s own community or kin, but meanings differ across societies. In documented South Fore mortuary transumption, care for the dead, grief, kinship obligations, and helping release the deceased were central; it should not be reduced to aggression or hunger.",
  "whyItDisturbs": "Mourning can cross the boundary between symbol and body. Cruor horror begins when remembrance loses consent and a household forces the living to carry memories, obligations, or identities that do not belong to them.",
  "creativeUses": [
    "Turn bowls, seats, and household records into relationship clues.",
    "Make memory custody and consent the core counterplay.",
    "Use warmth, ash, and repeated names without requiring consumption.",
    "Let returning an offering or releasing a coerced memory alter the climax."
  ],
  "cautions": [
    "Do not generalize one South Fore practice to all societies described by the term endocannibalism.",
    "Do not frame mortuary transumption as savage appetite, enemy violence, or monster behavior.",
    "Do not require players to consume remains or imitate funerary practice.",
    "Keep personhood, mourning, kinship, and community obligation visible.",
    "Clearly label literal inherited memory, coercive appetite, and Memory Burden as Cruor fiction."
  ]
},
      media: {
  "imageKey": "card-endocannibalism.webp",
  "imageProvider": "local",
  "imageAlt": "Endocannibalism inspiration artwork from the Cruor Games local archive; descriptive alt text requires visual review before publication.",
  "imageCredit": "Cruor Games local archive asset. Original creator, license, and source URL are not recorded; keep unpublished until provenance is verified or the image is replaced.",
  "icon": "fa-bowl-food"
},
      tags: [
  "source:endocannibalism",
  "capability:dark-places",
  "cultural-review-required"
], provenance: MODULE_PROVENANCE,
    },
    components: DARK_PLACES_COMPONENTS,
    metadata: { author: "Cruor Games", revision: 1, reviewedAt: "2026-07-17", sourceFile: "shared/content/content-packs/endocannibalism-semantic-v2-pack.js", capabilityWaivers: [], modernCapabilityLinks: [] },
    provenance: MODULE_PROVENANCE,
  }],
  metadata: {
    bundled: true, registryRole: "semantic-v2-approved", humanApprovalRequired: false,
    retainedLegacyPublicBehavior: true, editorialStatus: "approved",
    publicationBlockers: ["image-provenance-required"],
    culturalSourceBoundary: "South Fore mortuary transumption, mourning, and kinship obligations are bounded source context; literal inherited memory, coercive appetite, Memory Burden, and all mechanics are fictional.", modernCapabilityLinks: [],
  },
});

export const ENDOCANNIBALISM_SEMANTIC_V2_MODULE = ENDOCANNIBALISM_SEMANTIC_V2_PACK.modules[0];
