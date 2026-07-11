# Dependency Graph

The exhaustive import graph is generated in [repository-map.json](repository-map.json). This document summarizes the graph by subsystem.

## Feature Level

```mermaid
flowchart TD
  App[app/router.jsx and AppShell] --> Home
  App --> Darken
  App --> MapGenerator
  App --> MonsterComposer
  App --> Inspirations
  App --> InspirationStudio
  Darken --> MapBridge[darken-location.map-request.js]
  MapBridge --> MapGenerator
  SharedContent --> Darken
  SharedContent --> MonsterComposer
  SharedContent --> Inspirations
  SharedContent --> InspirationStudio
  RoomContracts[shared room contracts] --> InspirationStudio
  RoomContracts --> MapGenerator
  RoomContracts --> RoomResolver[pure room constraint resolver]
  RoomResolver --> DungeonBrief[Darken Dungeon Brief handoff]
  RoomResolver --> RoomEvaluation[Dark Places candidate and override evaluation]
  RoomEvaluation --> AssignmentTx[Atomic assignment transaction]
  AssignmentTx --> Darken
  RoomEvaluation --> MapGenerator
  SharedI18n --> App
  SharedStyles --> App
```

## Shared Content

```mermaid
flowchart LR
  Schema[content-pack-schema.js] --> Packs[content-packs]
  Packs --> StaticRegistry[static-registry.js]
  StaticRegistry --> Registry[registry.js]
  Registry --> Adapter[content-repository.adapter.js]
  Registry --> Modules[inspiration modules]
  Contracts[room archetype/design/shape/compatibility contracts] --> Resolver[room-constraint-resolver.js]
  Contracts --> Features[Studio and Map Generator]
  Resolver --> DungeonBrief[Darken Dungeon Brief]
  Resolver --> RoomEvaluation[room-constraint-evaluation.js]
  RoomEvaluation --> AssignmentTx[location-room-assignment-transaction.js]
  AssignmentTx --> ComposerState[Composer assignments and derived room state]
  RoomEvaluation --> Features
  Adapter --> Features
```

## Map Generator

```mermaid
flowchart TD
  Page[map-generator.page.jsx] --> Input[map-generator.input.js]
  Page --> State[map-generator.state.js]
  Page --> Pipeline[map-generator.pipeline.js]
  Pipeline --> Graph[graph.js]
  Pipeline --> Layout[layout.js]
  Pipeline --> Masks[mask.js]
  Pipeline --> Corridors[corridors.js]
  Pipeline --> Details[details.js]
  Pipeline --> Geometry[geometry.js]
  Page --> Render[map-generator.render.jsx]
  Page --> Export[map-generator.export.js]
```

## Monster Composer

```mermaid
flowchart TD
  Page[monster-composer.page.jsx] --> NativeData[monster-grafts.js]
  Page --> Rules[monster-graft-rules.schema.js]
  Page --> Feed[monster-content-pack-feed.js]
  Feed --> SharedRegistry[shared content registry]
  Page --> QAData[qa builders and reports]
  Page --> Export[stat block and debug payloads]
```

## Central Modules

High fan-in baseline from the generated graph includes:

- `features/darken-location/map-generator/map-generator.input.js`
- `features/inspiration-studio/components/StudioIcon.jsx`
- `features/monster-composer/data/monster-content-pack-feed.js`
- `features/monster-composer/model/monster-graft-rules.schema.js`
- `shared/content/content-pack-schema.js`
- `shared/content/inspiration-modules/inspiration-module.factory.js`

High fan-out baseline includes:

- `features/inspiration-studio/InspirationStudioPage.jsx`
- `shared/content/content.index.js`
- `features/monster-composer/monster-composer.page.jsx`
- `shared/content/inspiration-modules.js`
- `features/darken-location/composer/DarkenLocationComposerPage.jsx`
- `features/darken-location/map-generator/map-generator.page.jsx`

## Cycles And Boundary Notes

No static circular dependency candidates were detected in the generated baseline. Cross-feature imports are mainly intentional through app routing, shared content adapters, and the Darken-to-map bridge. Room metadata now crosses Studio, Dungeon Brief, and Map Generator through `shared/content/contracts/`, while the former generator modules remain compatibility wrappers. The pure constraint resolver is invoked by the feature-local `dungeon-room-constraints.js` boundary; Composer candidate evaluation and Map Generator manual-override validation pass through `room-constraint-evaluation.js`. Region assignment commits pass through `composer/model/location-room-assignment-transaction.js`, while `location-room-constraint-state.js` owns signatures, sanitation, and atomic history snapshots. New cross-feature imports should prefer `shared/` contracts or explicit bridge modules.
