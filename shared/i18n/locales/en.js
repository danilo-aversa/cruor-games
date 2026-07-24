export default {
  meta: {
    locale: "en",
    languageName: "English",
  },
  settings: {
    label: "Settings",
    aria: {
      openSettings: "Open settings",
      panel: "Settings",
    },
    sections: {
      mode: "Mode",
      language: "Language",
      accessibility: "Accessibility",
    },
    languageLocked: "Language switching is locked for now.",
    accessibilityPlaceholder: "Accessibility settings will live here later.",
    accessibility: {
      reset: "Reset accessibility settings",
      theme: {
        label: "Theme",
        description: "Choose the site color theme.",
        options: {
          dark: {
            label: "Dark",
            description: "Default Cruor dark interface.",
          },
          parchment: {
            label: "Parchment",
            description: "Light reading surface for long sessions.",
          },
          system: {
            label: "System",
            description: "Follow your browser or OS preference.",
          },
        },
      },
      contrast: {
        label: "Contrast",
        description: "Increase separation between text, borders, and controls.",
        options: {
          default: {
            label: "Default",
            description: "Brand contrast.",
          },
          high: {
            label: "High",
            description: "Clearer text and interface borders.",
          },
          maximum: {
            label: "Maximum",
            description: "Strongest contrast for readability.",
          },
        },
      },
      motion: {
        label: "Motion",
        description: "Control animation, hover motion, and pulsing effects.",
        options: {
          system: {
            label: "System",
            description: "Follow reduced-motion system preference.",
          },
          reduced: {
            label: "Reduced",
            description: "Disable most nonessential motion.",
          },
          full: {
            label: "Full",
            description: "Keep full interface motion.",
          },
        },
      },
      text: {
        label: "Text Size",
        description: "Increase interface text size.",
        options: {
          default: {
            label: "Default",
            description: "Standard compact UI text.",
          },
          large: {
            label: "Large",
            description: "Larger labels and body text.",
          },
          extraLarge: {
            label: "Extra Large",
            description: "Maximum text scale for reading.",
          },
        },
      },
      focus: {
        label: "Focus",
        description: "Control keyboard focus visibility.",
        options: {
          default: {
            label: "Default",
            description: "Standard Cruor focus style.",
          },
          strong: {
            label: "Strong",
            description: "High-visibility keyboard focus ring.",
          },
        },
      },
      tooltips: {
        label: "Tooltips",
        description: "Control when helper tooltips appear.",
        options: {
          default: {
            label: "Default",
            description: "Show on hover and keyboard focus.",
          },
          focus: {
            label: "Focus Only",
            description: "Show only during keyboard focus.",
          },
          off: {
            label: "Off",
            description: "Disable helper tooltips.",
          },
        },
      },
      scrollbar: {
        label: "Scrollbar",
        description:
          "Choose between Cruor's custom page progress and the native browser scrollbar.",
        options: {
          custom: {
            label: "Custom",
            description:
              "Use Cruor's custom scroll progress and hide the browser scrollbar.",
          },
          browser: {
            label: "Browser",
            description: "Use the native browser scrollbar for the homepage.",
          },
        },
      },
    },
  },
  app: {
    sections: {
      home: "Home",
      crucible: "Crucible",
      inspirations: "Inspirations",
      inspirationStudio: "Inspiration Studio",
      login: "Login",
    },
    aria: {
      goHome: "Go to Cruor Games home",
      primarySections: "Primary sections",
      mobileNavigation: "Mobile navigation",
      openInterfaceOptions: "Open interface options",
      interfaceOptions: "Interface options",
      interfaceMode: "Interface mode",
      openNavigationMenu: "Open navigation menu",
      closeNavigationMenu: "Close navigation menu",
      crucibleWorkspace: "Crucible workspace",
      home: "Home",
      inspirations: "Inspirations",
      inspirationStudio: "Inspiration Studio",
      login: "Login",
    },
    labels: {
      interfaceMode: "Interface Mode",
      login: "Login",
      account: "Account",
      loadingMapGenerator: "Loading map generator...",
    },
  },
  auth: {
    eyebrow: "Restricted Access",
    title: "Enter the Studio",
    description:
      "Sign in to access Cruor's Content Studio and development-only interface tools.",
    scopeLabel: "Admin access includes",
    scope: {
      studio: "Content Studio",
      debug: "Debug interface",
    },
    formEyebrow: "Administrator",
    formTitle: "Sign in to continue",
    username: "Username",
    password: "Password",
    signIn: "Sign In",
    signingIn: "Signing In",
    cancel: "Return Home",
    logout: "Log Out",
    loginAria: "Open login",
    logoutAria: "Log out {username}",
    debugLocked: "Debug mode requires an administrator login.",
    errors: {
      invalidCredentials: "Incorrect username or password.",
      unknown: "Authentication failed. Try again.",
    },
  },
  modes: {
    simple: {
      label: "Simple",
      description: "Quiet interface for default table use.",
    },
    advanced: {
      label: "Advanced",
      description: "Expose deeper composition controls.",
    },
    debug: {
      label: "Debug",
      description: "Show diagnostic and development-only surfaces.",
    },
  },
  navigation: {
    home: "Home",
    crucible: "Crucible",
    inspirations: "Inspirations",
    studio: "Studio",
    crucibleMenu: {
      aria: {
        tools: "{label} tools",
        options: "{label} options",
        preview: "{label} preview",
        engineFeatures: "{label} engine features",
      },
      items: {
        locations: {
          label: "Dark Places",
          description:
            "Build structured horror sites with regions, clues, hazards, atmosphere, and map intent.",
          catchPhrase: "Generate playable maps.",
          engineFeatures: {
            sourceLogic: "Choose source logic and horror direction.",
            structure: "Build regions, routes, clues, hazards.",
            map: "Generate a procedural playable map.",
            export: "Export notes for fast table use.",
          },
          mobileDescription:
            "Create horror locations with regions, clues, hazards, and map-aware structure.",
          previewTitle: "Dark Places",
          previewText:
            "Compose a horror site from context, source anchors, intrusion level, location regions, hazards, clues, atmosphere, and map-readable structure.",
          previewImageAlt:
            "Dark fantasy map crop generated from the Dark Places workbench.",
        },
        monsters: {
          label: "Terrifying Monsters",
          description:
            "Create rules-aware horror creatures with frames, grafts, pressure, weakness, and validation.",
          catchPhrase: "Build playable monsters.",
          engineFeatures: {
            concept: "Choose concept, role, tier, danger.",
            grafts: "Add grafts, attacks, defenses, weakness.",
            validation: "Check pressure, complexity, counterplay.",
            export: "Export a complete 5E stat block.",
          },
          mobileDescription:
            "Build horror monsters with frames, grafts, pressure, weakness, and validation.",
          previewTitle: "Terrifying Monsters",
          previewText:
            "Build dark fantasy creatures through base frames, tactical roles, horror grafts, combat pressure, counterplay, readiness checks, and export-facing mechanics.",
          previewImageAlt:
            "Cruor workbench interface preview used for Terrifying Monsters.",
        },
      },
    },
    locations: {
      label: "Locations",
      description: "Regions, hazards, clues, atmosphere, and map flow.",
      mobileDescription:
        "Darken places with regions, hazards, clues, and maps.",
      previewTitle: "Darken a Location",
      previewText:
        "Turn an existing dungeon, chapel, cave, ruin, or village into playable horror with regions, hazards, clues, atmosphere, and a generated map.",
    },
    monsters: {
      label: "Monsters",
      description: "Body, pressure, weakness, grafts, and 5E-ready output.",
      mobileDescription:
        "Forge horror threats with grafts and table-ready mechanics.",
      previewTitle: "Build a Monster",
      previewText:
        "Forge a dark fantasy threat through anatomy, pressure, complexity, weaknesses, lair effects, and table-ready mechanics.",
    },
  },
  crucible: {
    generators: {
      darken: "Darken a Location",
      monster: "Build a Monster",
    },
    views: {
      composer: "Composer",
      map: "Map",
      monsterComposer: "Composer",
    },
    messages: {
      refreshMapConfirm:
        "Refresh the map from the current Composer regions? This will replace the current generated map.",
    },
  },
  inspirations: {
    aria: "Inspirations archive",
    hero: {
      eyebrow: "Source Archive",
      title: "Inspirations",
      body: "Explore real places, practices, objects, bodies, violence, and stories as collectible source cards for the Cruor workbench.",
      cards: "Cards",
      domains: "Domains",
    },
    domains: {
      all: "All",
      tale: "Tale",
      place: "Place",
      body: "Body",
      relic: "Relic",
      violence: "Violence",
      rite: "Rite",
    },
    obscurity: {
      familiar: "Familiar",
      uncommon: "Uncommon",
      esoteric: "Esoteric",
    },
    card: {
      aria: "{title} inspiration card",
      turnBack: "Turn {title} card over",
      turnFront: "Turn {title} card to the front",
      openDossier: "Open dossier",
      pendingReview: "Pending Review",
      number: "Card {number}",
    },
    filters: {
      aria: "Inspiration filters",
      searchLabel: "Search the archive",
      searchPlaceholder: "Search sources, themes, components...",
      sort: "Sort",
      more: "Filters",
      clear: "Clear",
      domain: "Domain",
      sourceType: "Source Type",
      obscurity: "Obscurity",
      collection: "Collection",
      anySourceType: "Any Source Type",
      anyObscurity: "Any Obscurity",
      anyCollection: "Any Collection",
    },
    sort: {
      collection: "Collection Order",
      az: "A–Z",
      za: "Z–A",
      sourceType: "Source Type",
      components: "Most Components",
    },
    collection: {
      eyebrow: "Inspiration Cards",
      resultSingle: "{count} source",
      resultPlural: "{count} sources",
      noResults: "No matching sources",
      searchingFor: "Searching for “{query}”",
      activeFilterSingle: "{count} active filter",
      activeFilterPlural: "{count} active filters",
      allSources: "Complete collection",
    },
    empty: {
      title: "No cards match this search.",
      body: "Clear the current filters or try a broader term to return to the complete Inspiration collection.",
    },
    dossier: {
      close: "Close inspiration dossier",
      eyebrow: "Inspiration Dossier",
      domain: "Domain",
      sourceType: "Source",
      obscurity: "Obscurity",
      collection: "Collection",
      tabsAria: "Inspiration dossier sections",
      tabs: {
        dossier: "Dossier",
        workbench: "Workbench",
      },
      whatItIs: "What It Is",
      cruorLens: "The Cruor Lens",
      tableSafety: "Trigger Warnings & Table Safety",
      triggerWarnings: "Trigger Warnings",
      triggerWarningsHint: "{count} warnings · Hover or focus for details.",
      runningThisMaterial: "Respectful Use",
      lowIntensityAlternative: "Low-intensity substitution:",
      sourcesAndReading: "Sources & Further Reading",
      sourcesUsed: "Sources Used",
      sourcesUsedDeck:
        "Materials directly informing the historical account and editorial context above.",
      furtherReading: "Further Reading",
      furtherReadingDeck:
        "Material for readers interested in the source beyond the scope of this dossier.",
      relatedDossiers: "Related Dossiers",
      workbenchTitle: "From researched source to playable systems.",
      workbenchDeck:
        "The Workbench shows how Cruor translates extracted horror mechanisms into components consumed by its generators.",
      linkedComponents: "linked components",
      components: "components",
      useDarkPlaces: "Use in Dark Places",
      atTheTable: "At the Table",
      noTableUses: "No table-facing uses have been published yet.",
      contentNotes: "Content Notes",
      horrorTexture: "Horror Texture",
      linkedContent: "Linked Content",
      noLinkedContent: "No generator content is linked to this source yet.",
      locationContent: "Dark Places",
      monsterContent: "Terrifying Monsters",
      otherContent: "Other Content",
      technicalDetails: "Technical Details",
      sourceAnchor: "Source Anchor",
      useMonsterComposer: "Use in Monster Composer",
    },
  },
  home: {
    hero: {
      aria: "Cruor Games homepage hero",
      titleBefore: "Build",
      titleHighlight: "Horror",
      titleAfter: "for Your 5E Sessions",
      body: "Cruor turns real sources of dread into playable horror content — haunted places, disturbing monsters, and dark fantasy flavour you can actually use at the table.",
      actionsAria: "Primary home actions",
      openWorkbench: "Open the Workbench",
      browseInspirations: "Browse Inspirations",
      visualAria: "Cruor workbench preview",
      workbenchAlt:
        "Cruor workbench interface preview with dark fantasy tools and source-inspired horror material.",
      mapAlt:
        "Dark fantasy dungeon map crop from the Cruor location workbench.",
      inspirationAlt:
        "Cruor inspiration card crop showing real sources transformed into playable horror.",
    },
    statement: {
      aria: "Project statement",
      title: "Built for the Session You Already Have.",
      body: "Cruor does not ask you to start over. It helps you turn an existing location, threat, or inspiration into horror material you can actually use at the table.",
    },
    tools: {
      ariaTitle: "Featured Creation Tools",
      intro:
        "The current tools are only the first surfaces of the workbench — not the whole idea.",
      imagePlaceholder: "Image Placeholder",
      dungeonVisual: "Dungeon Generator Visual",
      dungeonVisualNote:
        "Use a strong map preview or UI crop from Darken a Location.",
      dungeonTitle: "Darken a Dungeon",
      dungeonBody:
        "Build a haunted location around the session you already have.",
      dungeonAction: "Explore the Dungeon Generator",
      monsterVisual: "Monster Generator Visual",
      monsterVisualNote:
        "Use a monster silhouette, Crucible slot view, or composer crop.",
      monsterTitle: "Forge a Monster",
      monsterBody:
        "Create a disturbing creature with pressure, weakness, and table-ready flavour.",
      monsterAction: "Explore the Monster Generator",
    },
    sources: {
      title: "Real Sources, Playable Horror.",
      body: "Cruor draws from things that really exist — folklore, history, ritual practice, architecture, biology, and material culture — then transforms them into playable content and dark fantasy flavour for your sessions.",
      action: "Browse Our Inspirations",
      stackAria: "Inspiration cards placeholder",
      inspiration: "Inspiration",
      historicalObject: "Historical Object",
      biologicalProcess: "Biological Process",
      waxDeathMasks: "Wax Death Masks",
      waxDeathMasksBody: "Preserved faces, false presence, devotional grief.",
      decomposition: "Decomposition",
      decompositionBody: "Gas, sweetness, pressure, impossible decay.",
      hoverStack: "Hover Stack",
      sedlecOssuary: "Sedlec Ossuary",
      sedlecOssuaryBody:
        "Replace this stack with 3–4 overlapping inspiration cards. On hover, the top card can shift or swap to reveal another source.",
    },
    support: {
      title: "Support the Workbench",
      body: "Patreon helps Cruor grow through new content, sharper tools, and a deeper library of dark fantasy material for 5E.",
      action: "Join the Patreon",
      visual: "Support Visual",
      visualNote:
        "Use a soft collage of map crop, monster crop, and inspiration cards.",
    },
  },
};
