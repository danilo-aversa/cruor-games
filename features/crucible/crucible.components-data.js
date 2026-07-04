import { SOURCE_DETAILS } from "./crucible.sources-data.js";

export const COMPONENTS = [
  {
    id: "cave-breathing",
    title: "The Cave Has Been Breathing",
    type: "Premise",
    workflows: ["location"],
    slots: ["horrorPremise"],
    contexts: ["Any", "Cave", "Mine", "Ruins"],
    horror: ["Body Horror", "Occult Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Decomposition"],
    motifs: ["gas", "bloating", "impossible decay"],
    summary:
      "The location feels alive, warm, and aware. Blood, fire, and loud sound make the stone react.",
    tableText:
      "The stone does not feel cold. It is warm under the palm, and something behind it answers every footstep with a slow, wet breath.",
    mechanics:
      "Whenever blood is spilled or thunderous noise echoes here, trigger one environmental reaction from the build.",
    narrative:
      "Use this to make an existing cave, mine, tunnel, or buried shrine feel organic without changing the party objective.",
  },
  {
    id: "chapel-hungry",
    title: "The Chapel Is Hungry",
    type: "Premise",
    workflows: ["location"],
    slots: ["horrorPremise"],
    contexts: ["Any", "Chapel", "Crypt", "Village"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Sedlec Ossuary"],
    motifs: ["sacred hunger", "false miracles"],
    summary:
      "The sacred place consumes offerings, secrets, prayers, and eventually flesh.",
    tableText:
      "Every candle leans toward the altar. The wax has pooled into shapes like tongues, and the silence waits like an open mouth.",
    mechanics:
      "A creature that willingly offers blood here gains advantage on one Religion check before the next dawn, but suffers 1d4 necrotic damage.",
    narrative:
      "Use this to darken any shrine, chapel, reliquary, or village church already present in the session.",
  },
  {
    id: "forest-knows-names",
    title: "The Forest Has Learned Names",
    type: "Premise",
    workflows: ["location"],
    slots: ["horrorPremise"],
    contexts: ["Any", "Forest", "Village", "Ruins"],
    horror: ["Folk Horror", "Psychological Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["The Mist"],
    motifs: ["muffled voices", "weather as predator"],
    summary:
      "The woods whisper true names and repeat private conversations the party never had aloud.",
    tableText:
      "The branches creak in syllables. Then the leaves say a name no one here should know.",
    mechanics:
      "Once per scene, a named creature must succeed on a DC 13 Wisdom saving throw or be unable to willingly move farther from the whispering source until the end of its next turn.",
    narrative:
      "Use this when travel, pursuit, or exploration needs immediate folk-horror pressure.",
  },
  {
    id: "wet-knuckles",
    title: "Wet Knuckles Behind Stone",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Sound",
    contexts: ["Any", "Cave", "Crypt", "Mine", "Ruins"],
    horror: ["Body Horror", "Gothic"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Decomposition"],
    motifs: ["skin slippage", "impossible decay"],
    summary:
      "A soft tapping follows the party from inside walls, coffins, or sealed stone.",
    tableText:
      "Something taps from the other side of the stone: not claws, not tools, but wet knuckles.",
    mechanics: "No mechanics required. Use as an omen before a hazard or clue.",
    narrative: "Use this as a recurring sensory motif.",
  },
  {
    id: "warm-iron-sour-milk",
    title: "Warm Iron and Sour Milk",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Smell",
    contexts: ["Any", "Cave", "Mine", "Chapel", "Village"],
    horror: ["Body Horror", "Disease Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Decomposition", "Genetic Mutations"],
    motifs: ["bloating", "false healing"],
    summary:
      "A nauseating smell suggests blood, birth, rot, and spoiled nourishment.",
    tableText:
      "The air smells of warm iron and sour milk, as if something wounded has been nursing in the dark.",
    mechanics:
      "A creature tracking by smell has disadvantage here unless it succeeds on a DC 12 Constitution saving throw.",
    narrative: "Use this to make a place feel organic and wrong.",
  },
  {
    id: "prayer-underwater",
    title: "Prayers Heard Underwater",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Sound",
    contexts: ["Any", "Chapel", "Crypt", "Village", "Ruins"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Sedlec Ossuary"],
    motifs: ["confession", "false miracles"],
    summary: "All prayers sound distant, submerged, and slightly delayed.",
    tableText:
      "A prayer rises from nowhere, muffled as if spoken from the bottom of a flooded grave.",
    mechanics:
      "The first Wisdom or Religion check made here has advantage if the character remains silent for one full round.",
    narrative: "Use this around altars, tombs, relics, or confession scenes.",
  },
  {
    id: "veins-under-rock",
    title: "Veins Under the Rock",
    type: "Visible Anomaly",
    workflows: ["location"],
    slots: ["visibleAnomaly"],
    contexts: ["Any", "Cave", "Mine", "Ruins"],
    horror: ["Body Horror", "Occult Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Decomposition", "Genetic Mutations"],
    motifs: ["hosts", "impossible decay"],
    summary:
      "Torchlight reveals branching veins beneath stone, pulsing slowly in the dark.",
    tableText:
      "Under the torchlight, thin veins appear beneath the rock. They pulse once, then vanish.",
    mechanics:
      "A DC 13 Medicine or Nature check confirms the pulse follows no natural rhythm.",
    narrative:
      "Use as foreshadowing for living architecture or buried corruption.",
  },
  {
    id: "saints-face-cracks",
    title: "The Saint’s Face Cracks",
    type: "Visible Anomaly",
    workflows: ["location"],
    slots: ["visibleAnomaly"],
    contexts: ["Any", "Chapel", "Crypt", "Noble House", "Village"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Sedlec Ossuary"],
    motifs: ["saint bones", "confession"],
    summary:
      "A statue, portrait, or icon splits like dry skin when a lie is spoken nearby.",
    tableText:
      "The painted saint smiles wider. Then a crack opens across its cheek like a cut.",
    mechanics:
      "When a creature lies within 30 feet of the icon, a visible crack appears. This does not identify the liar by itself.",
    narrative:
      "Use to pressure social scenes without solving them for the players.",
  },
  {
    id: "cave-exhales",
    title: "The Cave Exhales",
    type: "Hazard",
    workflows: ["location"],
    slots: ["hazard"],
    contexts: ["Any", "Cave", "Mine", "Ruins"],
    horror: ["Body Horror", "Occult Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Decomposition"],
    motifs: ["gas", "bloating"],
    summary:
      "After blood or loud noise, the cave releases a violent breath from hidden fissures.",
    tableText:
      "The passage flexes. A hot, rotten breath blasts through the tunnel and drags the torchflames sideways.",
    mechanics:
      "Trigger after blood is spilled or a thunderous sound occurs. Creatures in a narrow passage make a DC 14 Constitution save. On failure: pushed 10 feet toward the nearest fissure and frightened until the end of their next turn.",
    narrative: "Use this to add pressure without adding a new monster.",
  },
  {
    id: "altar-drinks",
    title: "The Altar Drinks First",
    type: "Hazard",
    workflows: ["location"],
    slots: ["hazard"],
    contexts: ["Any", "Chapel", "Crypt", "Village"],
    horror: ["Religious Horror", "Body Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Sedlec Ossuary"],
    motifs: ["sacred hunger", "martyrdom"],
    summary:
      "Blood, wine, holy water, and tears vanish into the altar before anyone can use them.",
    tableText:
      "The liquid touches the stone and disappears. A swallowing sound follows from somewhere below the altar.",
    mechanics:
      "A creature touching the altar must make a DC 14 Wisdom save. On failure, it takes 2d6 necrotic damage and cannot benefit from healing until the start of its next turn.",
    narrative: "Use this to make sacred terrain hostile and memorable.",
  },
  {
    id: "moss-filled-corpse",
    title: "The Moss-Filled Corpse",
    type: "Clue",
    workflows: ["location", "clue"],
    slots: ["clue", "clueForm", "disturbance"],
    contexts: ["Any", "Cave", "Mine", "Forest", "Corpse"],
    horror: ["Body Horror", "Disease Horror"],
    intrusion: "Low",
    prep: "5 minutes",
    sourceAnchors: ["Genetic Mutations", "Decomposition"],
    motifs: ["fungal bloom", "hosts", "impossible decay"],
    summary:
      "A corpse has lungs packed with pale moss, but no external wounds.",
    tableText:
      "The dead explorer is curled against the wall. His mouth is sewn shut from the inside. His lungs are packed with pale moss.",
    mechanics:
      "A DC 13 Medicine check reveals the moss grew while the victim was still breathing.",
    narrative:
      "Use as foreshadowing, villain clue, or warning that sleeping here is dangerous.",
  },
  {
    id: "wrong-corpse",
    title: "The Wrong Corpse",
    type: "Clue",
    workflows: ["location", "clue"],
    slots: ["clue", "clueForm", "reveal"],
    contexts: ["Any", "Corpse", "Crypt", "Ruins", "Noble House"],
    horror: ["Gothic", "Psychological Horror", "Cosmic Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Decomposition"],
    motifs: ["impossible decay"],
    summary:
      "The party finds a corpse identical to someone who is still alive.",
    tableText:
      "The corpse is unmistakable. Same face. Same scars. Same hands. But the person it resembles is still alive.",
    mechanics:
      "A creature touching the corpse makes a DC 14 Wisdom save. On failure, it sees one possible version of its own death and has disadvantage on its next death saving throw before the next long rest.",
    narrative: "Use as prophecy, decoy, temporal echo, or villain message.",
  },
  {
    id: "dead-screams-one-round",
    title: "The Dead Scream for One Round",
    type: "Encounter Twist",
    workflows: ["location", "encounter"],
    slots: ["encounterTwist", "combatTwist", "deathEffect"],
    contexts: ["Any", "Cave", "Crypt", "Undead", "Boss Fight"],
    horror: ["Body Horror", "Occult Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Decomposition"],
    motifs: ["impossible decay", "gas"],
    summary:
      "The first creature killed in the area rises briefly and screams with the location’s voice.",
    tableText:
      "The body snaps upright. Its mouth opens too wide, and something much larger screams through it.",
    mechanics:
      "The first creature killed here immediately stands with 1 hit point, screams, then collapses at the end of its next turn. Creatures within 15 feet make a DC 13 Wisdom save or become frightened until the end of their next turn.",
    narrative:
      "Use to make an existing encounter feel possessed by the environment.",
  },
  {
    id: "black-throat-pearl",
    title: "The Black Throat Pearl",
    type: "Reward",
    workflows: ["location", "reward"],
    slots: ["reward", "rewardType", "power", "temptation"],
    contexts: ["Any", "Cave", "Mine", "Relic", "Boon"],
    horror: ["Body Horror", "Occult Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Decomposition", "Genetic Mutations"],
    motifs: ["hosts", "grave wax"],
    summary:
      "A black pearl forms in the throat of someone who sleeps in the corrupted place.",
    tableText:
      "At dawn, the sleeper coughs up a black pearl. It is warm, wet, and whispering directions deeper underground.",
    mechanics:
      "The pearl can be consumed as a spell component to impose disadvantage on one saving throw against a divination or necromancy spell. After use, the caster cannot speak above a whisper until the next dawn.",
    narrative: "Use as a tempting reward that points deeper into danger.",
  },
  {
    id: "soft-floor-remembers-weight",
    title: "The Floor Remembers Weight",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Touch",
    contexts: ["Any", "Cave", "Crypt", "Mine", "Ruins"],
    horror: ["Body Horror", "Occult Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Decomposition"],
    motifs: ["grave wax", "skin slippage", "failed time"],
    summary:
      "The floor gives slightly underfoot, as if stone has learned the softness of old flesh.",
    tableText:
      "The floor gives beneath your boots. Not mud. Not moss. Something firmer, like cooled fat under a thin skin of stone.",
    mechanics:
      "A DC 13 Nature or Medicine check identifies the texture as closer to preserved tissue than mineral or soil.",
    narrative:
      "Use this as the tactile layer for a decomposing location without immediately adding danger.",
  },
  {
    id: "body-decayed-wrong-order",
    title: "The Body Decayed in the Wrong Order",
    type: "Clue",
    workflows: ["location", "clue"],
    slots: ["clue", "clueForm", "reveal"],
    contexts: ["Any", "Corpse", "Crypt", "Cave", "Mine"],
    horror: ["Body Horror", "Disease Horror", "Occult Horror"],
    intrusion: "Low",
    prep: "5 minutes",
    sourceAnchors: ["Decomposition"],
    motifs: ["impossible decay", "failed time", "insect succession"],
    summary:
      "A corpse shows early and late stages of decay at the same time, making the timeline impossible.",
    tableText:
      "The face is fresh. The hands are blackened. The abdomen has bloated and split, but the eyes are still wet enough to reflect the torch.",
    mechanics:
      "A DC 13 Medicine check reveals the body did not decay naturally. On a success, the examiner learns which stage is impossible for the time of death.",
    narrative:
      "Use this as a precise investigative clue when the party needs proof that natural time has failed.",
  },
  {
    id: "flies-choose-living",
    title: "The Flies Choose the Living",
    type: "Visible Anomaly",
    workflows: ["location", "encounter"],
    slots: ["visibleAnomaly", "encounterTwist"],
    contexts: ["Any", "Cave", "Crypt", "Village", "Ruins"],
    horror: ["Body Horror", "Disease Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Decomposition"],
    motifs: ["insect succession", "post-mortem ecology", "impossible decay"],
    summary:
      "Corpse flies ignore the dead and gather instead around the creature most likely to die next.",
    tableText:
      "The flies leave the corpse in a single black thread. They settle on the living instead.",
    mechanics:
      "At the start of a scene, the DM may place the flies on one creature. The next attack against that creature before the end of the round has advantage if the attacker can see the swarm.",
    narrative:
      "Use this to turn forensic insect behavior into foreshadowing and tactical pressure.",
  },
  {
    id: "tower-refuses-burial",
    title: "The Tower That Refuses Burial",
    type: "Premise",
    workflows: ["location"],
    slots: ["horrorPremise"],
    contexts: ["Any", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Towers of Silence"],
    motifs: ["height", "sun", "exposure", "refused corpses"],
    summary:
      "A funerary tower open to the sky no longer purifies the dead; it stores unfinished corpses in vertical silence.",
    tableText:
      "The tower has no roof. Sunlight falls into it like judgment, touching circles of white bone that should have been clean long ago.",
    mechanics:
      "Creatures in direct sunlight inside the tower cannot regain hit points from necromancy. Undead in shadow gain advantage on their next attack roll.",
    narrative:
      "Use this to turn a ruin, crypt shaft, or exposed chapel into a vertical funerary dungeon.",
  },
  {
    id: "dry-wings-stairwell",
    title: "Dry Wings Above the Stairwell",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Sound",
    contexts: ["Any", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Folk Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Towers of Silence"],
    motifs: ["vultures", "exposure", "bone dust"],
    summary:
      "Invisible carrion birds circle above the party, their wings sounding like parchment and old skin.",
    tableText:
      "Above the stairwell, something circles. You hear dry wings, but see only open air and a few drifting motes of bone dust.",
    mechanics:
      "No mechanics required. Use before undead movement, falling bones, or a failed purification clue.",
    narrative: "Use this as a sensory signature for sky burial spaces.",
  },
  {
    id: "bone-spirals-sun",
    title: "Sun-Bleached Bone Spirals",
    type: "Visible Anomaly",
    workflows: ["location"],
    slots: ["visibleAnomaly"],
    contexts: ["Any", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Towers of Silence"],
    motifs: ["sun", "purification", "refused corpses"],
    summary:
      "Bones are arranged in concentric spirals that point toward a corpse the sun refuses to touch.",
    tableText:
      "The bones are not scattered. They form pale spirals around a dark center where the sunlight bends away.",
    mechanics:
      "A DC 13 Religion or Investigation check reveals the spiral marks a body rejected by the rite.",
    narrative:
      "Use to point players toward the central impurity of a funerary site.",
  },
  {
    id: "carrion-descent",
    title: "The Carrion Descent",
    type: "Hazard",
    workflows: ["location"],
    slots: ["hazard"],
    contexts: ["Any", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Folk Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Towers of Silence"],
    motifs: ["vultures", "height", "exposure"],
    summary:
      "A sudden spiral of spectral carrion birds forces intruders downward through the tower.",
    tableText:
      "The open sky blackens with wings. They descend in a narrowing spiral, and every feather sounds like a knife drawn across bone.",
    mechanics:
      "Creatures in the exposed chamber make a DC 14 Dexterity save. On failure, they take 2d6 slashing damage and are pushed 10 feet toward the nearest stair, pit, or drop.",
    narrative:
      "Use this to make vertical movement dangerous without adding a full encounter.",
  },
  {
    id: "corpse-refused-sky",
    title: "The Corpse Refused by the Sky",
    type: "Clue",
    workflows: ["location", "clue"],
    slots: ["clue", "clueForm", "disturbance"],
    contexts: ["Any", "Corpse", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Low",
    prep: "5 minutes",
    sourceAnchors: ["Towers of Silence"],
    motifs: ["refused corpses", "purification", "impossible decay"],
    summary:
      "One corpse remains untouched by sun, birds, rot, and prayer, marking it as ritually impossible.",
    tableText:
      "Every body here has been opened by time, beak, or weather. Every body except one.",
    mechanics:
      "A DC 13 Religion or Medicine check reveals the body should have decayed or been consumed weeks ago.",
    narrative:
      "Use as the central clue that a funerary rite has failed or been corrupted.",
  },
  {
    id: "dead-rise-in-shadow",
    title: "The Dead Rise Only in Shadow",
    type: "Encounter Twist",
    workflows: ["location", "encounter"],
    slots: ["encounterTwist", "combatTwist", "deathEffect"],
    contexts: ["Any", "Undead", "Boss Fight", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Towers of Silence"],
    motifs: ["sun", "purification", "unfinished death"],
    summary:
      "Dead creatures collapse in sunlight but reassemble whenever shadow covers their bones.",
    tableText:
      "The corpse falls apart in the light. Then a shadow crosses it, and the bones begin choosing each other again.",
    mechanics:
      "The first undead reduced to 0 hit points in bright light stays destroyed. If reduced to 0 in dim light or darkness, it returns with 1 hit point at the start of its next turn.",
    narrative: "Use to make light positioning matter in a funerary encounter.",
  },
  {
    id: "vulture-saints-eye",
    title: "The Vulture-Saint’s Eye",
    type: "Reward",
    workflows: ["location", "reward"],
    slots: ["reward", "rewardType", "power", "visibleSign"],
    contexts: ["Any", "Relic", "Boon", "Chapel", "Ruins"],
    horror: ["Religious Horror", "Folk Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Towers of Silence"],
    motifs: ["vultures", "purification", "judgment"],
    summary:
      "A cloudy bead from a sacred carrion bird sees impurity in the living and the dead.",
    tableText:
      "The eye is dry, cloudy, and hard as a bead. When held to the light, something inside it circles.",
    mechanics:
      "Once per long rest, the bearer can sense whether a corpse, relic, or creature within 30 feet is ritually impure, cursed, or undead. After use, carrion birds become aware of the bearer for 24 hours.",
    narrative:
      "Use as a reward that reveals corruption while attracting unwanted attention.",
  },
  {
    id: "fog-counts-breaths",
    title: "The Fog Counts Breaths",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Sound",
    contexts: ["Any", "Forest", "Village", "Ruins", "Mine"],
    horror: ["Psychological Horror", "Cosmic Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["The Mist"],
    motifs: ["muffled voices", "weather as predator", "lost distance"],
    summary:
      "The fog repeats each breath a moment late, then begins adding extra breaths that belong to no one.",
    tableText:
      "You hear your own breathing return from the fog. Then one more breath joins in.",
    mechanics:
      "No mechanics required. Use before separation, pursuit, or a false direction.",
    narrative:
      "Use to make travel or approach scenes feel watched by the weather itself.",
  },
  {
    id: "white-wall-walks",
    title: "The White Wall Walks Closer",
    type: "Visible Anomaly",
    workflows: ["location"],
    slots: ["visibleAnomaly"],
    contexts: ["Any", "Forest", "Village", "Ruins", "Mine"],
    horror: ["Psychological Horror", "Cosmic Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["The Mist"],
    motifs: ["whiteout", "weather as predator"],
    summary:
      "The visible edge of the fog advances only when nobody looks directly at it.",
    tableText:
      "The fogline is closer than it was. No wind moves it. It waits until you blink.",
    mechanics:
      "A DC 13 Perception check confirms the fog moves in short advances when unobserved.",
    narrative:
      "Use as a visual sign that the environment is actively hunting space.",
  },
  {
    id: "mist-erases-distance",
    title: "The Mist Erases Distance",
    type: "Hazard",
    workflows: ["location"],
    slots: ["hazard"],
    contexts: ["Any", "Forest", "Village", "Ruins", "Mine"],
    horror: ["Psychological Horror", "Cosmic Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["The Mist"],
    motifs: ["lost distance", "returning footsteps", "whiteout"],
    summary:
      "Movement through the fog folds distance, returning travelers to places they already left.",
    tableText:
      "The path continues straight. After ten steps, the same broken branch appears underfoot again.",
    mechanics:
      "When creatures move more than 30 feet through the fog without a guide, one navigator makes a DC 14 Survival or Wisdom save. On failure, the group returns to the last landmark and loses 10 minutes.",
    narrative:
      "Use this to add pressure, clocks, and disorientation to travel without changing the map.",
  },
  {
    id: "witness-from-fog",
    title: "The Witness Who Never Entered",
    type: "Clue",
    workflows: ["location", "clue"],
    slots: ["clue", "clueForm", "falseReading"],
    contexts: ["Any", "Witness", "Village", "Crime Scene"],
    horror: ["Psychological Horror", "Cosmic Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["The Mist"],
    motifs: ["muffled voices", "memory", "weather as predator"],
    summary:
      "A witness remembers events inside the fog but insists they never crossed its edge.",
    tableText:
      "The witness knows what was said in the fog. They know who screamed first. They swear they never went in.",
    mechanics:
      "A DC 14 Insight check reveals the witness is not lying; the memory was placed in them from outside.",
    narrative:
      "Use as a clue that the fog transmits, copies, or harvests experience.",
  },
  {
    id: "fog-death-echo",
    title: "The Fog Keeps the Last Shape",
    type: "Encounter Twist",
    workflows: ["location", "encounter"],
    slots: ["encounterTwist", "combatTwist", "deathEffect"],
    contexts: [
      "Any",
      "Undead",
      "Beast",
      "Humanoid",
      "Boss Fight",
      "Forest",
      "Village",
    ],
    horror: ["Psychological Horror", "Occult Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["The Mist"],
    motifs: ["returning footsteps", "weather as predator", "last shape"],
    summary:
      "The first creature killed in the fog leaves a vapor silhouette that repeats its final action.",
    tableText:
      "The body falls. Its outline remains standing in the fog, still finishing the last thing it tried to do.",
    mechanics:
      "The first creature killed in fog leaves an echo until initiative count 20. The echo repeats its last attack or movement with disadvantage, then disperses.",
    narrative: "Use to make a normal fight feel haunted by the environment.",
  },
  {
    id: "lantern-last-shape",
    title: "The Lantern of the Last Shape",
    type: "Reward",
    workflows: ["location", "reward"],
    slots: ["reward", "rewardType", "power", "temptation"],
    contexts: ["Any", "Relic", "Boon", "Forest", "Village"],
    horror: ["Psychological Horror", "Occult Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["The Mist"],
    motifs: ["whiteout", "last shape", "lost distance"],
    summary:
      "A lantern parts unnatural fog, but it also reveals the last silhouette of anything that died nearby.",
    tableText:
      "The lantern flame is white and steady. In its light, the fog opens, and the dead briefly remember their outlines.",
    mechanics:
      "Once per short rest, the bearer can reveal invisible or obscured creatures within 20 feet until the end of their next turn. If a corpse is nearby, its final posture also appears and may draw attention.",
    narrative:
      "Use as a useful tool that keeps pulling the party back toward death scenes.",
  },
  {
    id: "larvae-under-blessing",
    title: "Larvae Under the Blessing",
    type: "Visible Anomaly",
    workflows: ["location", "reward"],
    slots: ["visibleAnomaly", "visibleSign"],
    contexts: ["Any", "Chapel", "Village", "Boon", "Mutation"],
    horror: ["Body Horror", "Disease Horror", "Religious Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Genetic Mutations", "Sedlec Ossuary"],
    motifs: ["larvae", "false healing", "hosts"],
    summary: "A healing mark twitches with tiny pale shapes beneath the skin.",
    tableText:
      "The blessing looks golden at first. Then something pale turns beneath it, as if the light has larvae.",
    mechanics:
      "A DC 13 Medicine or Religion check reveals the sign is alive, not infected in any ordinary sense.",
    narrative:
      "Use to make healing, blessing, or mutation feel parasitic instead of safe.",
  },
  {
    id: "host-knows-hive",
    title: "The Host Knows the Hive",
    type: "Creature Corruption",
    workflows: ["encounter"],
    slots: ["creatureCorruption"],
    contexts: ["Any", "Beast", "Humanoid", "Aberration", "Cultists"],
    horror: ["Body Horror", "Disease Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Genetic Mutations"],
    motifs: ["hosts", "incubation", "borrowed movement"],
    summary:
      "The creature is moved by something incubating inside it and reacts to harm before it understands pain.",
    tableText:
      "The body flinches before the mind notices. Something inside it is better at surviving than the person around it.",
    mechanics:
      "The first time the creature would be hit, it can use its reaction to impose disadvantage on the attack. Afterward, a visible larval movement crosses beneath its skin.",
    narrative: "Use to add parasitic survival logic to an existing stat block.",
  },
  {
    id: "totem-remembers-blood",
    title: "The Totem Remembers Blood",
    type: "Hazard",
    workflows: ["location"],
    slots: ["hazard", "visibleAnomaly"],
    contexts: ["Any", "Forest", "Village", "Ruins"],
    horror: ["Folk Horror", "Psychological Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Mortuary Totems"],
    motifs: ["carved faces", "boundary markers", "borrowed eyes"],
    summary:
      "A funerary marker watches a forbidden boundary and punishes trespass by repeating ancestral wounds.",
    tableText:
      "The carved face turns first. The wood does not bend, but the eyes find you all the same.",
    mechanics:
      "When a creature crosses the marked boundary without offering a name, it makes a DC 14 Wisdom save. On failure, it takes 2d6 psychic damage and hears an ancestor accuse it in a borrowed voice.",
    narrative:
      "Use this to make a threshold, grave marker, sacred grove, or village edge feel guarded by memory rather than by a conventional trap.",
  },
  {
    id: "blistering-yellow-cloud",
    title: "The Blistering Yellow Cloud",
    type: "Hazard",
    workflows: ["location"],
    slots: ["hazard", "sensoryLayer"],
    sensoryKind: "Touch",
    contexts: ["Any", "Mine", "Ruins", "Village"],
    horror: ["Disease Horror", "Body Horror", "War Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Mustard Gas"],
    motifs: ["yellow vapor", "burning lungs", "delayed agony"],
    summary:
      "A yellow vapor wounds the eyes, lungs, and skin, but its worst effects arrive after the party thinks they escaped.",
    tableText:
      "The cloud is almost golden at the edges. It smells wrong before it hurts, and then your eyes begin to burn.",
    mechanics:
      "A creature entering the cloud makes a DC 14 Constitution save. On failure, it is poisoned for 1 minute. At the end of that minute, it takes 2d6 acid damage unless it spent an action washing exposed skin and eyes.",
    narrative:
      "Use this as environmental horror where delayed consequences matter more than immediate damage.",
  },
  {
    id: "ancestor-beneath-tongue",
    title: "The Ancestor Beneath the Tongue",
    type: "Reward",
    workflows: ["reward", "clue"],
    slots: ["rewardType", "power", "cost", "temptation", "clueForm"],
    contexts: ["Any", "Boon", "Secret", "Relic", "Corpse"],
    horror: ["Folk Horror", "Body Horror", "Religious Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Endocannibalism"],
    motifs: ["ancestor meal", "inherited memory", "ash on the tongue"],
    summary:
      "A ritual fragment lets a character carry ancestral memory in the body, but the dead begin asking to be fed again.",
    tableText:
      "The ash tastes warm. For one breath, you remember dying in a room you have never entered.",
    mechanics:
      "Once before the next long rest, the character may gain advantage on one History, Insight, or Religion check tied to the dead. Afterward, they crave a funerary offering and suffer disadvantage on their next saving throw against fear until they provide one.",
    narrative:
      "Use this as a dark reward, family secret, or clue that turns mourning into literal inheritance.",
  },
  {
    id: "nails-still-warm",
    title: "The Nails Are Still Warm",
    type: "Visible Anomaly",
    workflows: ["location", "clue"],
    slots: ["visibleAnomaly", "sensoryLayer", "clueForm", "disturbance"],
    sensoryKind: "Touch",
    contexts: ["Any", "Chapel", "Village", "Crime Scene"],
    horror: ["Religious Horror", "Gothic", "Body Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Crucifixion"],
    motifs: ["nails", "raised bodies", "warm iron"],
    summary:
      "Execution nails remain warm long after the body is gone, as if pain stayed behind in the metal.",
    tableText:
      "The wood is empty. The nails remain, dark and warm, each one beaded with fresh blood.",
    mechanics:
      "A DC 13 Religion or Medicine check confirms the blood is new, but not from any creature currently present.",
    narrative:
      "Use this as religious foreshadowing, execution-site evidence, or a clue that suffering has become environmental.",
  },
  {
    id: "one-stake-empty",
    title: "One Stake Is Empty",
    type: "Visible Anomaly",
    workflows: ["location", "clue"],
    slots: ["visibleAnomaly", "hazard", "clueForm"],
    contexts: ["Any", "Village", "Ruins", "Forest", "Crime Scene"],
    horror: ["Gothic", "Folk Horror", "Psychological Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Impalement"],
    motifs: ["stakes", "empty poles", "warning display"],
    summary:
      "A field of execution stakes includes one empty pole that appears freshly prepared for someone specific.",
    tableText:
      "The bodies creak in the wind. One stake stands clean, sharpened, and waiting.",
    mechanics:
      "When a creature lies within sight of the empty stake, the wood turns toward it. A DC 14 Wisdom save prevents the creature from becoming frightened until the end of its next turn.",
    narrative:
      "Use this to turn a road, border, tyrant’s warning, or battlefield remnant into psychological pressure.",
  },
  {
    id: "mask-remembers-face",
    title: "The Mask Remembers the Face",
    type: "Reward",
    workflows: ["reward", "clue"],
    slots: ["rewardType", "power", "visibleSign", "clueForm", "reveal"],
    contexts: ["Any", "Relic", "Noble House", "Corpse"],
    horror: ["Gothic", "Psychological Horror", "Occult Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Wax Death Masks"],
    motifs: ["wax face", "preserved expression", "melting likeness"],
    summary:
      "A wax death mask can briefly answer as the dead, but it softens the wearer’s own identity each time.",
    tableText:
      "The wax is cold until it touches skin. Then the dead face remembers how to breathe.",
    mechanics:
      "Once per long rest, a creature wearing the mask may ask one question of the represented dead. Afterward, the wearer’s face becomes subtly similar to the mask until the next dawn.",
    narrative:
      "Use as a gothic clue device, noble-house relic, or reward that makes identity unstable.",
  },
  {
    id: "book-bound-in-skin",
    title: "The Book Bound in Skin",
    type: "Reward",
    workflows: ["reward", "clue"],
    slots: ["rewardType", "power", "cost", "temptation", "clueForm"],
    contexts: ["Any", "Relic", "Secret", "Inscription"],
    horror: ["Occult Horror", "Body Horror", "Gothic"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Anthropodermic Bibliopegy"],
    motifs: ["skin binding", "warm pages", "birthmarks on leather"],
    summary:
      "A forbidden book answers intimate questions, but the cover slowly learns the reader’s skin.",
    tableText:
      "The cover is too warm. A small mark in the leather matches a birthmark you have not shown anyone here.",
    mechanics:
      "Once per long rest, the reader may gain advantage on one Arcana, History, or Investigation check related to a named person. After use, the book records one visible mark from the reader’s body somewhere on its cover.",
    narrative:
      "Use as a dark knowledge reward, occult clue, or archive object that violates the boundary between body and text.",
  },
  {
    id: "mother-carries-brood",
    title: "The Mother Carries the Brood",
    type: "Creature Corruption",
    workflows: ["encounter"],
    slots: ["creatureCorruption", "deathEffect", "combatTwist"],
    contexts: ["Any", "Beast", "Aberration", "Boss Fight"],
    horror: ["Body Horror", "Folk Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Wolf Spiders"],
    motifs: ["carried young", "eye shine", "sudden scatter"],
    summary:
      "The creature carries countless young across its body; killing it only teaches the brood where warmth is.",
    tableText:
      "Its back is not furred. It is moving. Hundreds of tiny eyes open at once.",
    mechanics:
      "When the creature is first bloodied or reduced to half hit points, a brood scatters. Until initiative count 20, the ground within 10 feet is difficult terrain and creatures ending their turn there take 1d4 piercing damage.",
    narrative:
      "Use to turn an ordinary beast or aberration into a maternal swarm threat without replacing its stat block.",
  },
  {
    id: "mourner-eats-after-midnight",
    title: "The Mourner Eats After Midnight",
    type: "Clue",
    workflows: ["clue", "encounter", "location"],
    slots: [
      "clueForm",
      "disturbance",
      "creatureCorruption",
      "encounterTwist",
      "clue",
    ],
    contexts: ["Any", "Corpse", "Witness", "Village", "Crypt"],
    horror: ["Folk Horror", "Religious Horror", "Body Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Jikininki"],
    motifs: ["opened graves", "night feeding", "grave shame"],
    summary:
      "A grieving figure is cursed to consume the dead they failed to honor properly.",
    tableText:
      "The grave was opened carefully. Whoever did it wept the whole time, and ate with both hands.",
    mechanics:
      "A DC 14 Insight or Religion check reveals the culprit is driven by shame rather than hunger alone. If confronted beside a properly blessed corpse, it has disadvantage on its first hostile action.",
    narrative:
      "Use as a village mystery, graveyard encounter, or clue that links corpse hunger to failed funerary duty.",
  },
  {
    id: "battlefield-assembles-hand",
    title: "The Battlefield Assembles a Hand",
    type: "Boss Phase",
    workflows: ["location", "encounter"],
    slots: ["hazard", "encounterTwist", "bossPhase", "lairEffect"],
    contexts: ["Any", "Ruins", "Undead", "Boss Fight"],
    horror: ["Folk Horror", "Cosmic Horror", "Body Horror"],
    intrusion: "High",
    prep: "10 minutes",
    sourceAnchors: ["Gashadokuro"],
    motifs: ["giant skeleton", "rattling teeth", "battlefield bones"],
    summary:
      "Loose bones from the battlefield choose one enormous shape and begin reaching for the living.",
    tableText:
      "Every bone on the ground turns at once. The first thing they build is a hand.",
    mechanics:
      "At initiative count 20, loose bones assemble into a skeletal limb in a 15-foot area. Creatures there make a DC 15 Dexterity save or take 2d8 bludgeoning damage and become grappled until they spend an action breaking free.",
    narrative:
      "Use as a high-intrusion escalation for battlefields, mass graves, famine roads, or undead boss fights.",
  },
  {
    id: "bone-chapel-counts-the-dead",
    title: "The Bone Chapel Counts the Dead",
    type: "Premise",
    workflows: ["location"],
    slots: ["horrorPremise"],
    contexts: ["Any", "Chapel", "Crypt", "Ruins", "Village"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Sedlec Ossuary"],
    motifs: ["bone chandeliers", "anonymous remains", "sacred ornament"],
    summary:
      "The chapel treats bodies as sacred numbers, and every living visitor is counted as unfinished material.",
    tableText:
      "The bones are not decorations. They are arranged like a ledger, and the empty spaces seem measured for bodies that have not died yet.",
    mechanics:
      "When a creature is reduced below half hit points here, one nearby bone ornament turns toward it. The next Medicine or Religion check made to identify the chapel’s pattern has advantage.",
    narrative:
      "Use this when an existing chapel, ossuary, reliquary, or crypt needs a clear devotional horror identity.",
  },
  {
    id: "dust-of-polished-bone",
    title: "Dust of Polished Bone",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Smell",
    contexts: ["Any", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Sedlec Ossuary"],
    motifs: ["bone chandeliers", "bone architecture", "anonymous remains"],
    summary:
      "The air smells dry, polished, and faintly sweet, like old dust scraped from inside a skull.",
    tableText:
      "The air has no rot in it. Only dry sweetness, candle soot, and the powdery smell of bone polished by too many hands.",
    mechanics:
      "No mechanics required. Use as the smell layer for sacred bone architecture.",
    narrative:
      "Use this to distinguish ossuary horror from ordinary crypt rot.",
  },
  {
    id: "bones-sweat-candlewax",
    title: "The Bones Sweat Candlewax",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Touch",
    contexts: ["Any", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Sedlec Ossuary"],
    motifs: ["bone chandeliers", "sacred ornament", "false miracles"],
    summary:
      "Every bone ornament feels slick with wax, even where no candle has touched it.",
    tableText:
      "The skull is dry to the eye, but slick under your fingers. Warm wax gathers in the sockets and clings to your skin.",
    mechanics:
      "A creature handling the ornament has disadvantage on the next Sleight of Hand check made before it cleans its fingers.",
    narrative:
      "Use as tactile detail when players inspect reliquaries, bone altars, or ossuary walls.",
  },
  {
    id: "chandelier-has-one-new-rib",
    title: "The Chandelier Has One New Rib",
    type: "Visible Anomaly",
    workflows: ["location"],
    slots: ["visibleAnomaly"],
    contexts: ["Any", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Sedlec Ossuary"],
    motifs: ["bone chandeliers", "anonymous remains", "sacred ornament"],
    summary:
      "A bone chandelier contains one fresh rib with red marrow still visible at the cut.",
    tableText:
      "Among the yellowed ribs of the chandelier, one bone is fresh enough to glisten.",
    mechanics:
      "A DC 13 Medicine check reveals the rib was removed within the last day.",
    narrative:
      "Use as a visual sign that the ossuary is still collecting material.",
  },
  {
    id: "skulls-turn-toward-confession",
    title: "The Skulls Turn Toward Confession",
    type: "Encounter Twist",
    workflows: ["location", "encounter"],
    slots: ["encounterTwist", "combatTwist", "lairEffect"],
    contexts: ["Any", "Chapel", "Crypt", "Cultists", "Boss Fight"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Sedlec Ossuary"],
    motifs: ["skull garlands", "confession", "anonymous remains"],
    mapInfluence: {
      preferredRoomArchetypes: ["ossuary-gallery", "processional-crypt-hall"],
      weight: 2,
      source: "legacy-component:skulls-turn-toward-confession",
    },
    summary:
      "The skulls in the walls turn whenever someone speaks a secret, granting the room a brief judgmental focus.",
    tableText:
      "Every skull in the wall turns at once. Their empty sockets settle on the speaker.",
    mechanics:
      "Once per round, when a creature reveals a secret, confesses guilt, or names the dead, one enemy that can hear it has disadvantage on its next attack before the end of its turn.",
    narrative:
      "Use to make a social reveal affect an encounter without changing the monster stat blocks.",
  },
  {
    id: "reliquary-of-the-unclaimed",
    title: "The Reliquary of the Unclaimed",
    type: "Reward",
    workflows: ["location", "reward"],
    slots: ["reward", "rewardType", "power", "cost"],
    contexts: ["Any", "Chapel", "Crypt", "Relic"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Sedlec Ossuary"],
    motifs: ["anonymous remains", "sacred ornament", "bone architecture"],
    summary:
      "A small reliquary of anonymous bone protects the bearer, but only while the dead remain unnamed.",
    tableText:
      "The reliquary is made from no famous saint. No inscription. No lineage. Only a finger bone wrapped in tarnished silver.",
    mechanics:
      "Once per long rest, the bearer can add 1d4 to a failed death saving throw or saving throw against necrotic damage. If the bone is identified by name, the reliquary loses this property.",
    narrative:
      "Use as an outcome that rewards the party while preserving the theme of anonymous mass death.",
  },
  {
    id: "tower-smells-of-hot-lime",
    title: "The Tower Smells of Hot Lime",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Smell",
    contexts: ["Any", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Folk Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Towers of Silence"],
    motifs: ["sun", "bone dust", "ritual purity"],
    summary:
      "The air smells sun-baked, mineral, and clean in a way that makes death feel unfinished.",
    tableText:
      "The tower smells of hot stone, lime dust, and old sun. Nothing rots here properly.",
    mechanics:
      "No mechanics required. Use as the smell layer for exposed funerary spaces.",
    narrative:
      "Use to make the location feel purified and wrong at the same time.",
  },
  {
    id: "sun-warmed-bone-dust",
    title: "Sun-Warmed Bone Dust",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Touch",
    contexts: ["Any", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Folk Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Towers of Silence"],
    motifs: ["sun", "bone dust", "exposure"],
    summary:
      "Fine bone dust sticks warmly to skin and refuses to brush away until the rite is acknowledged.",
    tableText:
      "The dust is warm. It clings to your fingers like ash that remembers being a person.",
    mechanics:
      "A creature marked by the dust has disadvantage on Stealth checks against undead or carrion creatures until it spends an action cleaning itself with water or prayer.",
    narrative:
      "Use this as the tactile layer for sky burial ruins or exposed ossuaries.",
  },
  {
    id: "shadow-at-the-open-roof",
    title: "The Shadow at the Open Roof",
    type: "Visible Anomaly",
    workflows: ["location"],
    slots: ["visibleAnomaly"],
    contexts: ["Any", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Folk Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Towers of Silence"],
    motifs: ["sun", "vultures", "refused burial"],
    summary:
      "An impossible bird-shadow circles the roofless chamber even when the sky is empty.",
    tableText:
      "A winged shadow crosses the floor. Above you, the sky is empty.",
    mechanics:
      "A DC 13 Perception or Religion check reveals the shadow circles only above bodies that have not completed the rite.",
    narrative: "Use as a second visible sign for the Towers of Silence pack.",
  },
  {
    id: "mist-smells-of-cold-iron-rain",
    title: "Cold Iron Rain",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Smell",
    contexts: ["Any", "Forest", "Village", "Ruins", "Mine"],
    horror: ["Psychological Horror", "Cosmic Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["The Mist"],
    motifs: ["whiteout", "lost distance", "weather as predator"],
    summary:
      "The mist smells like rain on iron, though nothing here is wet except the inside of the lungs.",
    tableText:
      "The fog smells like cold rain on iron. When you breathe it in, the wetness seems to settle behind your ribs.",
    mechanics:
      "No mechanics required. Use as the smell layer for unnatural mist.",
    narrative:
      "Use this to make the fog feel physical without revealing its source.",
  },
  {
    id: "mist-dampens-the-skin-from-inside",
    title: "The Mist Dampens from Inside",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Touch",
    contexts: ["Any", "Forest", "Village", "Ruins", "Mine"],
    horror: ["Psychological Horror", "Cosmic Horror", "Disease Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["The Mist"],
    motifs: ["whiteout", "lost distance", "weather as predator"],
    summary:
      "The fog leaves skin dry outside, but the body feels damp beneath the ribs and behind the eyes.",
    tableText:
      "Your cloak stays dry. Your skin stays dry. But something inside your chest feels wet and cold.",
    mechanics:
      "A creature that spends a full minute in the mist has disadvantage on the next check made to track time or distance.",
    narrative:
      "Use as tactile unease during exploration, watches, or travel scenes.",
  },
  {
    id: "wrong-silhouettes-stand-still",
    title: "Wrong Silhouettes Stand Still",
    type: "Visible Anomaly",
    workflows: ["location"],
    slots: ["visibleAnomaly"],
    contexts: ["Any", "Forest", "Village", "Ruins", "Mine"],
    horror: ["Psychological Horror", "Cosmic Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["The Mist"],
    motifs: ["false silhouettes", "whiteout", "lost distance"],
    summary:
      "Human shapes appear in the fog, but they remain still when approached and vanish only when spoken to.",
    tableText:
      "A person stands ahead in the fog. They do not move, even when you call out. When you speak their name, they are gone.",
    mechanics:
      "A DC 13 Insight or Perception check reveals the silhouette is imitating someone the viewer expected to see.",
    narrative: "Use as a second visible anomaly for mist-bound locations.",
  },
  {
    id: "graveyard-eats-its-mourners",
    title: "The Graveyard Eats Its Mourners",
    type: "Premise",
    workflows: ["location"],
    slots: ["horrorPremise"],
    contexts: ["Any", "Crypt", "Village", "Ruins"],
    horror: ["Folk Horror", "Religious Horror", "Body Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Jikininki"],
    motifs: ["opened graves", "night feeding", "grave shame"],
    summary:
      "The dead are not the only ones being consumed; grief itself has become an appetite in the graveyard.",
    tableText:
      "Every grave has offerings. Every offering has bite marks. Every mourner looks hungry and ashamed.",
    mechanics:
      "A creature that spends 10 minutes mourning here must succeed on a DC 13 Wisdom save or feel compelled to hide evidence of the dead rather than report it.",
    narrative:
      "Use to turn an existing cemetery, village shrine, or burial site into a mystery about shame and appetite.",
  },
  {
    id: "chewing-below-the-prayers",
    title: "Chewing Below the Prayers",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Sound",
    contexts: ["Any", "Crypt", "Village", "Ruins"],
    horror: ["Folk Horror", "Religious Horror", "Body Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Jikininki"],
    motifs: ["night feeding", "opened graves", "grave shame"],
    summary:
      "Prayer bells and funeral chants are undercut by soft chewing from beneath the earth.",
    tableText:
      "Under the prayers, you hear chewing. Slow, careful, and ashamed.",
    mechanics:
      "No mechanics required. Use before the party discovers disturbed graves or a hidden mourner.",
    narrative:
      "Use as the sound layer for Jikininki-inspired graveyard horror.",
  },
  {
    id: "sweet-rice-and-open-earth",
    title: "Sweet Rice and Open Earth",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Smell",
    contexts: ["Any", "Crypt", "Village", "Ruins"],
    horror: ["Folk Horror", "Religious Horror", "Body Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Jikininki"],
    motifs: ["ancestor meal", "opened graves", "grave shame"],
    summary:
      "The air mixes funeral food, damp soil, and the coppery shame of opened bodies.",
    tableText:
      "The offerings smell sweet. The soil smells newly opened. Beneath both waits the copper smell no one names.",
    mechanics:
      "No mechanics required. Use as the smell layer near violated graves or funeral offerings.",
    narrative:
      "Use this when hunger and mourning need to occupy the same space.",
  },
  {
    id: "soil-warm-from-below",
    title: "Soil Warm from Below",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Touch",
    contexts: ["Any", "Crypt", "Village", "Ruins"],
    horror: ["Folk Horror", "Body Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Jikininki"],
    motifs: ["opened graves", "night feeding", "grave shame"],
    summary:
      "Fresh grave soil feels warm underneath, as if something below has been breathing hard.",
    tableText: "The soil is cold on top, but warm a finger’s depth down.",
    mechanics:
      "A DC 13 Survival or Medicine check reveals the warmth is recent and localized around disturbed graves.",
    narrative:
      "Use as tactile evidence before revealing the corpse-eating culprit.",
  },
  {
    id: "grave-offerings-have-teeth-marks",
    title: "Offerings Have Teeth Marks",
    type: "Visible Anomaly",
    workflows: ["location"],
    slots: ["visibleAnomaly"],
    contexts: ["Any", "Crypt", "Village", "Ruins"],
    horror: ["Folk Horror", "Religious Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Jikininki"],
    motifs: ["opened graves", "ancestor meal", "grave shame"],
    summary:
      "Funeral offerings have been eaten with human teeth, but only after being placed for the dead.",
    tableText:
      "The rice cakes are arranged with care. Each one bears the same human bite.",
    mechanics:
      "A DC 13 Investigation check shows the bites were made by someone alive at the time, not by a corpse or beast.",
    narrative:
      "Use as a visible sign that the hunger is tied to mourning rather than predation alone.",
  },
  {
    id: "grave-rope-tied-from-inside",
    title: "Grave Rope Tied from Inside",
    type: "Visible Anomaly",
    workflows: ["location"],
    slots: ["visibleAnomaly"],
    contexts: ["Any", "Crypt", "Village", "Ruins"],
    horror: ["Folk Horror", "Religious Horror", "Body Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Jikininki"],
    motifs: ["opened graves", "night feeding", "grave shame"],
    summary:
      "A grave has been opened and tied shut again from the inside with ritual cord.",
    tableText:
      "The grave rope is knotted on the wrong side. Whoever closed it was below the earth.",
    mechanics:
      "A DC 14 Religion check reveals the knot is penitential, not protective.",
    narrative:
      "Use as a stronger visual anomaly when the party needs proof of supernatural shame.",
  },
  {
    id: "hunger-follows-the-name",
    title: "Hunger Follows the Name",
    type: "Hazard",
    workflows: ["location"],
    slots: ["hazard"],
    contexts: ["Any", "Crypt", "Village", "Ruins"],
    horror: ["Folk Horror", "Religious Horror", "Body Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Jikininki"],
    motifs: ["grave shame", "night feeding", "opened graves"],
    summary:
      "Speaking the name of an improperly mourned dead person calls the corpse-hunger toward the speaker.",
    tableText:
      "The name leaves your mouth. Somewhere under the soil, something starts digging upward.",
    mechanics:
      "When a character speaks the true name of a violated corpse, they make a DC 14 Wisdom save. On failure, they are marked by hunger; the next undead or corpse-eating creature here has advantage on its first attack against them.",
    narrative:
      "Use as a hazard that makes investigation dangerous without forbidding clues.",
  },
  {
    id: "the-eater-weeps-first",
    title: "The Eater Weeps First",
    type: "Encounter Twist",
    workflows: ["location", "encounter"],
    slots: ["encounterTwist", "combatTwist", "openingSign"],
    contexts: ["Any", "Crypt", "Village", "Undead", "Humanoid"],
    horror: ["Folk Horror", "Religious Horror", "Body Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Jikininki"],
    motifs: ["grave shame", "night feeding", "monk hunger"],
    summary:
      "The corpse-eater begins combat by weeping, and its shame briefly weakens those who show disgust instead of compassion.",
    tableText:
      "The thing looks up with a mouth full of the dead and begins to sob.",
    mechanics:
      "At the start of combat, each creature that can see the eater chooses pity or disgust. A disgusted creature makes a DC 13 Wisdom save or cannot take reactions until the end of its next turn.",
    narrative:
      "Use to make the encounter morally uncomfortable rather than purely monstrous.",
  },
  {
    id: "bone-bowl-of-appeasement",
    title: "The Bone Bowl of Appeasement",
    type: "Reward",
    workflows: ["location", "reward"],
    slots: ["reward", "rewardType", "power", "cost"],
    contexts: ["Any", "Relic", "Boon", "Crypt", "Village"],
    horror: ["Folk Horror", "Religious Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Jikininki"],
    motifs: ["ancestor meal", "grave shame", "funerary taboo"],
    summary:
      "A small bone bowl can calm corpse-hunger, but each use demands a sincere funerary offering.",
    tableText:
      "The bowl is carved from a nameless rib. When filled, it trembles like a starving hand.",
    mechanics:
      "Once per long rest, placing a proper funerary offering in the bowl grants advantage on one check or save against undead hunger, possession, or fear. If used without a sincere offering, the bearer gains no benefit and has disadvantage on the next Wisdom save against fear.",
    narrative:
      "Use as an outcome that rewards compassion and ritual attention.",
  },
  {
    id: "mass-grave-wants-one-body",
    title: "The Mass Grave Wants One Body",
    type: "Premise",
    workflows: ["location"],
    slots: ["horrorPremise"],
    contexts: ["Any", "Ruins", "Village", "Crypt", "Forest"],
    horror: ["Folk Horror", "Cosmic Horror", "Body Horror"],
    intrusion: "High",
    prep: "10 minutes",
    sourceAnchors: ["Gashadokuro"],
    motifs: ["giant skeleton", "battlefield bones", "assembled dead"],
    summary:
      "The dead of famine or war are not resting separately; the grave is slowly assembling them into one enormous body.",
    tableText:
      "The bones are not scattered. They are arranged by function: hands with hands, teeth with teeth, spines pointing toward the same invisible neck.",
    mechanics:
      "Each time blood is spilled or a corpse is disturbed, the mass grave gains one Assembly. At 3 Assembly, trigger the selected hazard or encounter twist.",
    narrative:
      "Use this to turn any battlefield, famine pit, or mass grave into a location with escalating collective hunger.",
  },
  {
    id: "teeth-rattle-under-earth",
    title: "Teeth Rattle Under Earth",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Sound",
    contexts: ["Any", "Ruins", "Village", "Crypt", "Forest"],
    horror: ["Folk Horror", "Cosmic Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Gashadokuro"],
    motifs: ["rattling teeth", "battlefield bones", "assembled dead"],
    summary:
      "Thousands of buried teeth chatter beneath the ground when the living speak of hunger.",
    tableText: "The ground answers with teeth. Not one jaw. Thousands.",
    mechanics:
      "No mechanics required. Use before the grave begins assembling a larger body.",
    narrative: "Use as the sound layer for collective-dead locations.",
  },
  {
    id: "old-famine-breath",
    title: "Old Famine Breath",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Smell",
    contexts: ["Any", "Ruins", "Village", "Crypt", "Forest"],
    horror: ["Folk Horror", "Cosmic Horror", "Disease Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Gashadokuro"],
    motifs: ["famine dead", "battlefield bones", "giant hunger"],
    summary:
      "The air smells dry, empty, and sour, like a mouth that has had nothing to eat for years.",
    tableText:
      "The air has the sour dryness of an old mouth. It smells hungry without smelling alive.",
    mechanics:
      "A creature that has not eaten today has disadvantage on the first Wisdom save made in this location.",
    narrative:
      "Use as the smell layer for famine-dead or battlefield-dead horror.",
  },
  {
    id: "bones-shiver-through-boots",
    title: "Bones Shiver Through Boots",
    type: "Sensory Detail",
    workflows: ["location"],
    slots: ["sensoryLayer"],
    sensoryKind: "Touch",
    contexts: ["Any", "Ruins", "Village", "Crypt", "Forest"],
    horror: ["Folk Horror", "Cosmic Horror", "Body Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Gashadokuro"],
    motifs: ["battlefield bones", "assembled dead", "unburied bones"],
    summary:
      "The ground vibrates with tiny impacts as buried bones knock against each other below.",
    tableText:
      "Something shivers through your boots. It feels like bones knocking together under the soil.",
    mechanics:
      "A DC 13 Perception check detects the direction from which the buried motion is spreading.",
    narrative:
      "Use as tactile warning before a limb or skeleton shape assembles.",
  },
  {
    id: "ribcage-hill-opens",
    title: "The Ribcage Hill Opens",
    type: "Visible Anomaly",
    workflows: ["location"],
    slots: ["visibleAnomaly"],
    contexts: ["Any", "Ruins", "Village", "Crypt", "Forest"],
    horror: ["Folk Horror", "Cosmic Horror", "Body Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Gashadokuro"],
    motifs: ["giant skeleton", "battlefield bones", "assembled dead"],
    summary:
      "A hill reveals itself as a buried ribcage when rain, blood, or torchlight touches it.",
    tableText: "The hillside splits in pale arcs. Not roots. Ribs.",
    mechanics:
      "A DC 14 Nature or Medicine check reveals the bones are from many bodies arranged into the shape of one enormous chest.",
    narrative:
      "Use as the main visible anomaly for a giant skeleton source pack.",
  },
  {
    id: "all-skulls-face-one-way",
    title: "All Skulls Face One Way",
    type: "Visible Anomaly",
    workflows: ["location"],
    slots: ["visibleAnomaly"],
    contexts: ["Any", "Ruins", "Village", "Crypt", "Forest"],
    horror: ["Folk Horror", "Cosmic Horror"],
    intrusion: "Low",
    prep: "Instant",
    sourceAnchors: ["Gashadokuro"],
    motifs: ["rattling teeth", "battlefield bones", "collective resentment"],
    summary:
      "Every unearthed skull faces the same unseen center, no matter how often they are moved.",
    tableText:
      "The skulls have no eyes, but every face points toward the same place.",
    mechanics:
      "If moved, the skulls reorient after one minute unless blessed, buried, or broken.",
    narrative:
      "Use as a navigation clue toward the forming skeleton’s heart or head.",
  },
  {
    id: "the-grave-takes-height",
    title: "The Grave Takes Height",
    type: "Hazard",
    workflows: ["location"],
    slots: ["hazard"],
    contexts: ["Any", "Ruins", "Village", "Crypt", "Forest"],
    horror: ["Folk Horror", "Cosmic Horror", "Body Horror"],
    intrusion: "High",
    prep: "10 minutes",
    sourceAnchors: ["Gashadokuro"],
    motifs: ["giant skeleton", "assembled dead", "unburied bones"],
    summary:
      "The ground rises as buried bones stack beneath the living, trying to lift them into the forming giant.",
    tableText:
      "The earth rises under your feet. Bones push upward, stacking themselves into height.",
    mechanics:
      "Choose a 10-foot square. Creatures there make a DC 15 Dexterity save or are lifted 15 feet by assembling bones, knocked prone, and restrained until they use an action to break free.",
    narrative:
      "Use as the main environmental hazard for a Gashadokuro-inspired location.",
  },
  {
    id: "the-hungry-skull-shadow",
    title: "The Hungry Skull Shadow",
    type: "Encounter Twist",
    workflows: ["location", "encounter"],
    slots: ["encounterTwist", "combatTwist", "bossPhase"],
    contexts: ["Any", "Ruins", "Undead", "Boss Fight", "Village"],
    horror: ["Folk Horror", "Cosmic Horror", "Body Horror"],
    intrusion: "High",
    prep: "10 minutes",
    sourceAnchors: ["Gashadokuro"],
    motifs: ["giant skeleton", "midnight hunger", "rattling teeth"],
    summary:
      "A huge skull-shadow leans over the battlefield and bites through smaller creatures’ actions.",
    tableText:
      "A skull larger than the house appears in shadow above the fight. Its teeth close without sound.",
    mechanics:
      "At initiative count 20, choose one creature in dim light or darkness. It makes a DC 15 Wisdom save. On failure, it loses its reaction and takes 2d6 psychic damage as the shadow bites away its next instinct.",
    narrative:
      "Use to make the presence of the forming giant felt before it fully manifests.",
  },
  {
    id: "white-bone-of-the-hungry-road",
    title: "White Bone of the Hungry Road",
    type: "Reward",
    workflows: ["location", "reward"],
    slots: ["reward", "rewardType", "power", "cost"],
    contexts: ["Any", "Relic", "Boon", "Ruins", "Village"],
    horror: ["Folk Horror", "Cosmic Horror"],
    intrusion: "Medium",
    prep: "5 minutes",
    sourceAnchors: ["Gashadokuro"],
    motifs: ["famine dead", "unburied bones", "giant hunger"],
    summary:
      "A long white bone points toward places where the dead remain unburied, but it grows heavier when ignored.",
    tableText:
      "The bone is clean, white, and too long for any ordinary body. When laid on the ground, it turns like a compass needle.",
    mechanics:
      "Once per long rest, the bearer can learn the direction of the nearest mass grave, battlefield dead, or unburied corpse within 5 miles. If the bearer ignores the direction for 24 hours, their speed is reduced by 5 feet until they bury or bless the dead.",
    narrative:
      "Use as an outcome that turns the party toward unresolved collective death.",
  },
  {
    id: "sedlec-bone-has-a-name",
    title: "One Bone Still Has a Name",
    type: "Clue",
    workflows: ["location", "clue"],
    slots: ["clue", "clueForm", "reveal"],
    contexts: ["Any", "Chapel", "Crypt", "Ruins", "Corpse"],
    horror: ["Religious Horror", "Gothic"],
    intrusion: "Low",
    prep: "5 minutes",
    sourceAnchors: ["Sedlec Ossuary"],
    motifs: ["anonymous remains", "bone architecture", "sacred ornament"],
    summary:
      "Among anonymous decorative bones, one fragment still bears a hidden name, breaking the ossuary’s sacred anonymity.",
    tableText:
      "Every bone here has been made anonymous by arrangement, polish, and prayer. Every bone except one. A name is scratched inside the curve of the rib.",
    mechanics:
      "A DC 13 Investigation or Religion check reveals the named bone does not belong in the arrangement. Returning it to its proper grave suppresses one hazard or encounter twist in this location.",
    narrative:
      "Use as the actionable clue in a Sedlec-inspired location: the dead are decorative because their identities were erased.",
  },
  {
    id: "gashadokuro-map-of-empty-bellies",
    title: "A Map of Empty Bellies",
    type: "Clue",
    workflows: ["location", "clue"],
    slots: ["clue", "clueForm", "reveal"],
    contexts: ["Any", "Ruins", "Village", "Crypt", "Crime Scene"],
    horror: ["Folk Horror", "Cosmic Horror", "Body Horror"],
    intrusion: "Low",
    prep: "5 minutes",
    sourceAnchors: ["Gashadokuro"],
    motifs: ["famine dead", "battlefield bones", "collective resentment"],
    summary:
      "Bones are arranged like a map, marking where hunger killed people faster than burial could reach them.",
    tableText:
      "The bones are not random. They form roads, wells, storehouses, and houses. A village map made from the people who starved in it.",
    mechanics:
      "A DC 14 History, Survival, or Investigation check identifies the map’s center as the place where the collective skeleton will assemble next.",
    narrative:
      "Use as the investigative clue that turns the Gashadokuro from a spectacle into a solvable location problem.",
  },
];

COMPONENTS.forEach((component) => {
  component.sourceAnchors = Array.isArray(component.sourceAnchors)
    ? component.sourceAnchors
    : [];
  const anchorDetails = component.sourceAnchors
    .map((anchor) => SOURCE_DETAILS[anchor])
    .filter(Boolean);
  component.sourceTypes =
    Array.isArray(component.sourceTypes) && component.sourceTypes.length
      ? component.sourceTypes
      : Array.from(
          new Set(
            anchorDetails.map((details) => details.sourceType).filter(Boolean),
          ),
        );
  component.themes =
    Array.isArray(component.themes) && component.themes.length
      ? component.themes
      : Array.from(
          new Set(
            anchorDetails
              .flatMap((details) => details.themes || [])
              .slice(0, 5),
          ),
        );
  component.motifs =
    Array.isArray(component.motifs) && component.motifs.length
      ? component.motifs
      : Array.from(
          new Set(
            anchorDetails
              .flatMap((details) => details.motifs || [])
              .slice(0, 6),
          ),
        );
});
