export default {
  meta: {
    locale: "it",
    languageName: "Italiano",
  },
  settings: {
    label: "Impostazioni",
    aria: {
      openSettings: "Apri impostazioni",
      panel: "Impostazioni",
    },
    sections: {
      mode: "Modalità",
      language: "Lingua",
      accessibility: "Accessibilità",
    },
    languageLocked: "Il cambio lingua è bloccato per ora.",
    accessibilityPlaceholder: "Qui aggiungeremo le impostazioni di accessibilità.",
    accessibility: {
      reset: "Ripristina impostazioni accessibilità",
      theme: {
        label: "Tema",
        description: "Scegli il tema cromatico del sito.",
        options: {
          dark: {
            label: "Scuro",
            description: "Interfaccia Cruor scura di default.",
          },
          parchment: {
            label: "Pergamena",
            description: "Superficie chiara per lettura prolungata.",
          },
          system: {
            label: "Sistema",
            description: "Segue le preferenze di browser o sistema operativo.",
          },
        },
      },
      contrast: {
        label: "Contrasto",
        description: "Aumenta la separazione tra testi, bordi e controlli.",
        options: {
          default: {
            label: "Default",
            description: "Contrasto del brand.",
          },
          high: {
            label: "Alto",
            description: "Testi e bordi interfaccia più chiari.",
          },
          maximum: {
            label: "Massimo",
            description: "Contrasto più forte per la leggibilità.",
          },
        },
      },
      motion: {
        label: "Movimento",
        description: "Controlla animazioni, hover e pulsazioni.",
        options: {
          system: {
            label: "Sistema",
            description: "Segue la preferenza di movimento ridotto del sistema.",
          },
          reduced: {
            label: "Ridotto",
            description: "Disattiva quasi tutti i movimenti non essenziali.",
          },
          full: {
            label: "Completo",
            description: "Mantiene tutte le animazioni dell’interfaccia.",
          },
        },
      },
      text: {
        label: "Testo",
        description: "Aumenta la dimensione dei testi dell’interfaccia.",
        options: {
          default: {
            label: "Default",
            description: "Testo compatto standard.",
          },
          large: {
            label: "Grande",
            description: "Label e testi più grandi.",
          },
          extraLarge: {
            label: "Molto grande",
            description: "Scala massima per la lettura.",
          },
        },
      },
      focus: {
        label: "Focus",
        description: "Controlla la visibilità del focus da tastiera.",
        options: {
          default: {
            label: "Default",
            description: "Stile focus Cruor standard.",
          },
          strong: {
            label: "Forte",
            description: "Anello focus ad alta visibilità.",
          },
        },
      },
      tooltips: {
        label: "Tooltip",
        description: "Controlla quando appaiono i tooltip di aiuto.",
        options: {
          default: {
            label: "Default",
            description: "Mostra su hover e focus da tastiera.",
          },
          focus: {
            label: "Solo focus",
            description: "Mostra solo durante il focus da tastiera.",
          },
          off: {
            label: "Off",
            description: "Disattiva i tooltip di aiuto.",
          },
        },
      },
    },
  },
  app: {
    sections: {
      home: "Home",
      crucible: "Crucible",
      inspirations: "Ispirazioni",
      inspirationStudio: "Studio Ispirazioni",
    },
    aria: {
      goHome: "Vai alla home di Cruor Games",
      primarySections: "Sezioni principali",
      mobileNavigation: "Navigazione mobile",
      openInterfaceOptions: "Apri opzioni interfaccia",
      interfaceOptions: "Opzioni interfaccia",
      interfaceMode: "Modalità interfaccia",
      openNavigationMenu: "Apri menu navigazione",
      closeNavigationMenu: "Chiudi menu navigazione",
      crucibleWorkspace: "Area di lavoro Crucible",
      home: "Home",
      inspirations: "Ispirazioni",
      inspirationStudio: "Studio Ispirazioni",
    },
    labels: {
      interfaceMode: "Modalità Interfaccia",
      login: "Login",
      loginPlaceholder: "Login non ancora attivo",
      loadingMapGenerator: "Caricamento generatore mappa...",
    },
  },
  modes: {
    simple: {
      label: "Semplice",
      description: "Interfaccia pulita per l’uso normale al tavolo.",
    },
    advanced: {
      label: "Avanzata",
      description: "Mostra controlli di composizione più profondi.",
    },
    debug: {
      label: "Debug",
      description: "Mostra superfici diagnostiche e di sviluppo.",
    },
  },
  navigation: {
    home: "Home",
    crucible: "Crucible",
    inspirations: "Ispirazioni",
    locations: {
      label: "Luoghi",
      description: "Regioni, pericoli, indizi, atmosfera e flusso della mappa.",
      mobileDescription: "Oscurisce luoghi con regioni, pericoli, indizi e mappe.",
      previewTitle: "Oscurisci un Luogo",
      previewText:
        "Trasforma un dungeon, una cappella, una caverna, una rovina o un villaggio esistente in horror giocabile con regioni, pericoli, indizi, atmosfera e una mappa generata.",
    },
    monsters: {
      label: "Mostri",
      description: "Corpo, pressione, debolezza, graft e output pronto per la 5E.",
      mobileDescription: "Crea minacce horror con graft e meccaniche pronte al tavolo.",
      previewTitle: "Crea un Mostro",
      previewText:
        "Forgia una minaccia dark fantasy attraverso anatomia, pressione, complessità, debolezze, effetti di tana e meccaniche pronte al tavolo.",
    },
  },
  crucible: {
    generators: {
      darken: "Oscurisci un Luogo",
      monster: "Crea un Mostro",
    },
    views: {
      composer: "Composer",
      map: "Mappa",
      monsterComposer: "Composer",
    },
    messages: {
      refreshMapConfirm:
        "Aggiornare la mappa dalle regioni attuali del Composer? Questo sostituirà la mappa generata corrente.",
    },
  },
  home: {
    hero: {
      aria: "Hero della homepage Cruor Games",
      titleBefore: "Crea",
      titleHighlight: "Horror",
      titleAfter: "per le Tue Sessioni 5E",
      body:
        "Cruor trasforma fonti reali di inquietudine in contenuti horror giocabili: luoghi infestati, mostri disturbanti e flavour dark fantasy che puoi davvero usare al tavolo.",
      actionsAria: "Azioni principali della home",
      openWorkbench: "Apri la Workbench",
      browseInspirations: "Sfoglia le Ispirazioni",
      visualAria: "Anteprima della workbench Cruor",
      workbenchAlt:
        "Anteprima dell’interfaccia Cruor con strumenti dark fantasy e materiale horror ispirato a fonti reali.",
      mapAlt: "Ritaglio di una mappa dungeon dark fantasy dalla workbench dei luoghi Cruor.",
      inspirationAlt:
        "Ritaglio di una card ispirazione Cruor che mostra fonti reali trasformate in horror giocabile.",
    },
    statement: {
      aria: "Dichiarazione del progetto",
      title: "Pensato per la Sessione che Hai Già Preparato.",
      body:
        "Cruor non ti chiede di ricominciare da zero. Ti aiuta a trasformare un luogo, una minaccia o un’ispirazione esistente in materiale horror che puoi davvero usare al tavolo.",
    },
    tools: {
      ariaTitle: "Strumenti di Creazione Principali",
      intro: "Gli strumenti attuali sono solo le prime superfici della workbench, non l’intera idea.",
      imagePlaceholder: "Placeholder Immagine",
      dungeonVisual: "Visual Dungeon Generator",
      dungeonVisualNote: "Usa una preview forte della mappa o un crop UI da Darken a Location.",
      dungeonTitle: "Oscurisci un Dungeon",
      dungeonBody: "Costruisci un luogo infestato attorno alla sessione che hai già preparato.",
      dungeonAction: "Esplora il Dungeon Generator",
      monsterVisual: "Visual Monster Generator",
      monsterVisualNote: "Usa una silhouette mostro, vista slot Crucible o crop del composer.",
      monsterTitle: "Forgia un Mostro",
      monsterBody: "Crea una creatura disturbante con pressione, debolezza e flavour pronto al tavolo.",
      monsterAction: "Esplora il Monster Generator",
    },
    sources: {
      title: "Fonti Reali, Horror Giocabile.",
      body:
        "Cruor parte da cose che esistono davvero: folklore, storia, pratiche rituali, architettura, biologia e cultura materiale; poi le trasforma in contenuti giocabili e flavour dark fantasy per le tue sessioni.",
      action: "Sfoglia le Nostre Ispirazioni",
      stackAria: "Placeholder card ispirazioni",
      inspiration: "Ispirazione",
      historicalObject: "Oggetto Storico",
      biologicalProcess: "Processo Biologico",
      waxDeathMasks: "Maschere Mortuarie in Cera",
      waxDeathMasksBody: "Volti preservati, falsa presenza, lutto devozionale.",
      decomposition: "Decomposizione",
      decompositionBody: "Gas, dolcezza, pressione, decadimento impossibile.",
      hoverStack: "Stack Hover",
      sedlecOssuary: "Ossario di Sedlec",
      sedlecOssuaryBody:
        "Sostituisci questo stack con 3–4 card ispirazione sovrapposte. In hover, la card superiore può spostarsi o cambiare per rivelare un’altra fonte.",
    },
    support: {
      title: "Sostieni la Workbench",
      body:
        "Patreon aiuta Cruor a crescere con nuovi contenuti, strumenti più rifiniti e una libreria più profonda di materiale dark fantasy per la 5E.",
      action: "Unisciti al Patreon",
      visual: "Visual Supporto",
      visualNote: "Usa un collage soft di crop mappa, crop mostro e card ispirazioni.",
    },
  },
};
