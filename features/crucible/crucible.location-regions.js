export const LOCATION_REGION_TEMPLATES = [
  {
    templateId: "bone-lit-vestibule",
    name: "Bone-Lit Vestibule",
    role: "Entrance / Threshold",
    shape: "small hall",
    roomArchetype: "reliquary-niche",
    mapInfluence: {
      preferredRoomArchetypes: ["reliquary-niche", "processional-crypt-hall"],
      forceRoomArchetype: true,
      weight: 4,
      source: "legacy-region:bone-lit-vestibule",
    },
    size: "Small",
    connectors: 2,
    density: "interactive",
    contexts: ["Any", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Gothic"],
    sourceAnchors: ["Sedlec Ossuary"],
    readAloud: {
      compact:
        "The entrance is lit by candles fixed into skulls, each flame leaning toward the deeper dark.",
      extended:
        "The entrance is lit by candles fixed into skulls. Their flames do not rise straight; each one leans toward the deeper dark, as if the passage ahead is inhaling.",
    },
    feature:
      "Skulls arranged around the doorway mark each visitor as counted but not yet placed.",
    interaction:
      "A character may turn a skull away to suppress one omen here, but the next room gains a louder warning.",
    danger:
      "The first loud prayer or oath makes every candle gutter and reveals a hidden footprint trail in bone dust.",
    secret:
      "One skull is newer than the rest and still has a name scratched behind the jaw.",
    reward:
      "A loose finger bone can serve as a one-use focus for detecting undead or consecrated ground.",
    links: ["connector", "ritual room"],
  },
  {
    templateId: "soft-floored-tunnel",
    name: "Soft-Floored Tunnel",
    role: "Connector",
    shape: "corridor",
    size: "Medium",
    connectors: 2,
    density: "dangerous",
    contexts: ["Any", "Cave", "Mine", "Ruins"],
    horror: ["Body Horror", "Disease Horror"],
    sourceAnchors: ["Decomposition"],
    readAloud: {
      compact:
        "The floor gives underfoot like cooled fat beneath a skin of stone.",
      extended:
        "The passage narrows, and the floor begins to give under your boots. Not mud. Not moss. Something firmer, like cooled fat beneath a thin skin of stone.",
    },
    feature: "The tunnel records footprints as bruises that slowly darken.",
    interaction:
      "Cutting the floor releases warm gas and exposes calcified tissue beneath the stone.",
    danger:
      "A creature that runs here must succeed on a DC 13 Dexterity save or fall prone as the floor ripples.",
    secret:
      "Old bootprints beneath the surface show someone walked this tunnel before it became stone.",
    reward:
      "A hardened piece of grave wax can seal a wound, granting advantage on one Medicine check.",
    links: ["entrance", "side clue room"],
  },
  {
    templateId: "skyless-ossuary-well",
    name: "Skyless Ossuary Well",
    role: "Setpiece / Vertical Room",
    shape: "shaft",
    roomArchetype: "bone-well",
    mapInfluence: {
      preferredRoomArchetypes: ["bone-well", "charnel-vault"],
      forceRoomArchetype: true,
      weight: 4,
      source: "legacy-region:skyless-ossuary-well",
    },
    size: "Large",
    connectors: 3,
    density: "dangerous",
    contexts: ["Any", "Chapel", "Crypt", "Ruins"],
    horror: ["Religious Horror", "Folk Horror"],
    sourceAnchors: ["Towers of Silence"],
    readAloud: {
      compact:
        "A roofless shaft drops through rings of sun-whitened bone, though no sky is visible above.",
      extended:
        "The room is a vertical shaft lined with rings of sun-whitened bone. It has no roof, yet above it there is no sky, only pale brightness and the dry sound of distant wings.",
    },
    feature: "Bone rings mark old exposure levels like tide lines.",
    interaction:
      "Moving bones between rings changes which ledges are safe to stand on.",
    danger:
      "At initiative count 20 or after a failed climb, spectral wings push creatures toward the nearest drop.",
    secret: "The lowest ring contains a corpse the rite refused to finish.",
    reward:
      "A vulture-Saint bead reveals ritually impure remains within 30 feet once.",
    links: ["lower chamber", "secret ledge", "hazard passage"],
  },
  {
    templateId: "fog-return-corridor",
    name: "Fog-Return Corridor",
    role: "Loop / Disorientation",
    shape: "corridor",
    size: "Medium",
    connectors: 2,
    density: "interactive",
    contexts: ["Any", "Forest", "Village", "Ruins", "Mine"],
    horror: ["Psychological Horror", "Cosmic Horror"],
    sourceAnchors: ["The Mist"],
    readAloud: {
      compact:
        "The corridor continues straight, but the same broken mark keeps returning through the fog.",
      extended:
        "The corridor continues in a straight line. After a dozen steps, the same broken mark appears on the wall again, wet with fog, waiting as if it never moved.",
    },
    feature: "Landmarks repeat unless named aloud in the correct order.",
    interaction:
      "Players can anchor the path by leaving personal objects behind; the fog returns each object changed.",
    danger:
      "A failed navigation check costs 10 minutes and moves one region connection to a random exit.",
    secret:
      "The fog is copying the party’s route to lead someone else after them.",
    reward: "A white lantern shard can reveal the true exit for one round.",
    links: ["entrance", "false chamber", "secret reward"],
  },
  {
    templateId: "mourning-kitchen",
    name: "Mourning Kitchen",
    role: "Social Clue Room",
    shape: "room",
    size: "Small",
    connectors: 2,
    density: "interactive",
    contexts: ["Any", "Village", "Crypt", "Noble House"],
    horror: ["Folk Horror", "Religious Horror", "Body Horror"],
    sourceAnchors: ["Endocannibalism", "Jikininki"],
    readAloud: {
      compact:
        "A funeral meal waits on the table, still warm, with one place set for someone dead.",
      extended:
        "A funeral meal waits on the table, still warm. One place is set with care for someone dead, and every bowl has been tasted with the same careful shame.",
    },
    feature: "Offerings are arranged by family line rather than by guest.",
    interaction:
      "Eating reveals one inherited memory; refusing the meal makes the room colder and more hostile.",
    danger:
      "A creature that mocks the rite must make a DC 13 Wisdom save or become unable to speak the dead person’s name.",
    secret:
      "The meal was prepared to keep a corpse-eater from entering the house.",
    reward:
      "A pinch of funerary ash grants advantage on one History or Religion check about the dead.",
    links: ["grave room", "family shrine"],
  },
  {
    templateId: "ribcage-underhall",
    name: "Ribcage Underhall",
    role: "Main Horror Room",
    shape: "hall",
    size: "Large",
    connectors: 3,
    density: "dangerous",
    contexts: ["Any", "Ruins", "Village", "Crypt", "Forest"],
    horror: ["Folk Horror", "Cosmic Horror", "Body Horror"],
    sourceAnchors: ["Gashadokuro"],
    readAloud: {
      compact:
        "The hall arches with ribs too large for any one body, each bone made from smaller bones fused together.",
      extended:
        "The hall opens into a ribcage too large for any single body. Each rib is made from smaller bones fused end to end, all bending toward the same invisible spine.",
    },
    feature: "The architecture is assembling itself from mass death.",
    interaction:
      "Breaking a rib opens a shortcut but adds one Assembly to the location.",
    danger:
      "At 3 Assembly, a skeletal hand forms and attempts to restrain a creature in the room.",
    secret: "The ribs point toward the place where hunger began.",
    reward: "A long white bone acts as a compass toward unburied dead.",
    links: ["boss chamber", "mass grave", "side clue room"],
  },
  {
    templateId: "yellow-vapor-washroom",
    name: "Yellow Vapor Washroom",
    role: "Hazard Room",
    shape: "room",
    size: "Medium",
    connectors: 2,
    density: "dangerous",
    contexts: ["Any", "Mine", "Ruins", "Village"],
    horror: ["War Horror", "Disease Horror", "Body Horror"],
    sourceAnchors: ["Mustard Gas"],
    readAloud: {
      compact:
        "Yellow vapor pools below the basins, beautiful at the edges and painful in the eyes.",
      extended:
        "Yellow vapor pools below the cracked wash basins. It is almost beautiful at the edges, until your eyes start to sting and the air finds the wet places in your throat.",
    },
    feature:
      "Cloths hanging here are clean on one side and blistered on the other.",
    interaction:
      "Water disperses the vapor for one round but contaminates the basin.",
    danger:
      "Entering the cloud requires a DC 14 Constitution save or delayed acid damage after 1 minute.",
    secret:
      "The room was built to wash exposure away, but the drains now breathe it back out.",
    reward:
      "A sealed ceramic vial can neutralize one inhaled poison or gas effect.",
    links: ["hazard passage", "safe room"],
  },
  {
    templateId: "wax-portrait-room",
    name: "Wax Portrait Room",
    role: "Identity Clue Room",
    shape: "room",
    size: "Small",
    connectors: 1,
    density: "interactive",
    contexts: ["Any", "Noble House", "Chapel", "Crypt"],
    horror: ["Gothic", "Psychological Horror", "Occult Horror"],
    sourceAnchors: ["Wax Death Masks"],
    readAloud: {
      compact:
        "Wax faces hang where portraits should be, each one wearing an expression the dead never chose.",
      extended:
        "Wax faces hang where portraits should be. They have been mounted in frames, labeled in careful ink, and each one wears an expression the dead may not have chosen.",
    },
    feature:
      "One mask slowly changes to resemble the last person who lied in the room.",
    interaction:
      "Wearing a mask lets the wearer ask one question of the represented dead.",
    danger:
      "After use, the wearer’s face subtly resembles the mask until dawn.",
    secret:
      "The family tree in this room has been corrected by replacing faces, not names.",
    reward:
      "A cracked death mask can answer one yes/no question about its subject.",
    links: ["secret room"],
  },
  {
    templateId: "spider-nursery-floor",
    name: "Spider Nursery Floor",
    role: "Ambush / Nest",
    shape: "chamber",
    size: "Medium",
    connectors: 3,
    density: "dangerous",
    contexts: ["Any", "Cave", "Forest", "Ruins"],
    horror: ["Body Horror", "Folk Horror"],
    sourceAnchors: ["Wolf Spiders"],
    readAloud: {
      compact:
        "Tiny eyes glitter across the floor, then vanish beneath the dust like spilled stars.",
      extended:
        "Tiny eyes glitter across the floor, hundreds of them catching the light at once. Then they vanish beneath the dust like spilled stars hiding under skin.",
    },
    feature: "The floor is a living nursery disguised as debris.",
    interaction:
      "Soft steps avoid the brood; fire scatters it into adjacent regions.",
    danger:
      "A sudden scatter makes the area difficult terrain and deals 1d4 piercing damage to creatures ending their turn there.",
    secret: "The brood moves toward warmth, not toward noise.",
    reward:
      "A silk egg casing can stabilize one dying creature if wrapped around the wound.",
    links: ["side chamber", "hazard passage", "exit"],
  },
  {
    templateId: "skin-bound-archive",
    name: "Skin-Bound Archive",
    role: "Secret / Lore Room",
    shape: "library",
    roomArchetype: "hidden-reliquary",
    mapInfluence: {
      preferredRoomArchetypes: ["hidden-reliquary", "sealed-family-tomb"],
      forceRoomArchetype: true,
      weight: 4,
      source: "legacy-region:skin-bound-archive",
    },
    size: "Medium",
    connectors: 1,
    density: "interactive",
    contexts: ["Any", "Noble House", "Chapel", "Ruins"],
    horror: ["Occult Horror", "Body Horror", "Gothic"],
    sourceAnchors: ["Anthropodermic Bibliopegy"],
    readAloud: {
      compact:
        "The books are warm. One cover bears a scar that matches no animal leather.",
      extended:
        "The books are warm when you come near. One cover tightens slightly on the shelf, and a pale scar in the leather seems to avoid the light.",
    },
    feature: "The archive is organized by bodies, not subjects.",
    interaction:
      "Reading a book grants advantage on one Investigation, Arcana, or History check about a named person.",
    danger:
      "After use, the book records one visible mark from the reader’s body on its cover.",
    secret:
      "The newest volume is unfinished and already titled with a living person’s name.",
    reward:
      "A page torn from the index can locate one hidden confession or secret door.",
    links: ["secret room", "ritual chamber"],
  },
];
