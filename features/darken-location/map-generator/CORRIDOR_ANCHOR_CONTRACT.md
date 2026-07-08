# Corridor and Anchor Contract

Dark Places treats the generated map as a structural model first and an SVG drawing second. Corridors, doors, and anchors must remain valid through generation, manual override, export/import, preview, debug validation, and render.

## Generated versus manual connections

Generated graph edges are deduped by unordered room pair. The procedural engine should not create two accidental corridors between the same two rooms.

Manual override connections may duplicate a generated pair or another manual pair. A duplicate manual corridor is an intentional user-authored feature: alternate passage, secret route, loop, service corridor, balcony path, vertical transition, or other edited structure.

## Rectangular room anchors

A rectangular room anchor is a wall-cell contract:

- `cell`: the room-side boundary cell
- `outsideCell`: the first grid cell outside the room
- `side`: the side crossed by the door/corridor
- door segment: the shared edge between `cell` and `outsideCell`

The corridor endpoint must route from the outside cell, not through the room interior.

## Circular room anchors

Circular rooms use a raccordo chain because a square grid corridor cannot connect directly to a vector circle edge.

A circular anchor is valid when the whole chain is valid, not necessarily when the preserved portal cell alone crosses the mathematical circle:

```text
circle visual boundary
→ optional support cell(s)
→ door-bearing portal/raccordo cell
→ corridorStartCell / routingOutsideCell
→ corridor path
```

Important fields:

- `portalRoomCell`: preserved user-facing portal identity. It may sit outside the mathematical circle.
- `raccordoCells`: ordered room-floor chain, including support cells and the door-bearing raccordo cell.
- `raccordoCell`: door-bearing raccordo cell, normally the last cell in `raccordoCells`.
- `corridorStartCell` / `routingOutsideCell` / `outsideCell`: first corridor-floor cell outside the raccordo.

Validity rules:

1. `raccordoCells` must be orthogonally contiguous.
2. At least one raccordo chain cell must touch/cross the visual circle boundary.
3. The door-bearing raccordo cell must be orthogonally adjacent to the corridor start cell.
4. The shared door edge between the door-bearing raccordo cell and corridor start cell must lie outside the visual circle.
5. The corridor start cell must not be rendered as room-extension floor.

## Manual override persistence

Manual overrides are the durable editor layer. They store user intent, not only final SVG geometry. Export/import must preserve:

- room positions
- door anchors, including circular `raccordoCells`
- corridor waypoints
- custom manual connections, including duplicate room pairs
- deleted generated connections
- manual connection sequence
- explicit level/stair snapshots

## Render and debug expectations

Render, debug, QA, and tests must use the same circular raccordo helpers. A stale/imported circular anchor should be normalized or interpreted through the shared raccordo chain contract before validating walls, door cuts, portal squares, or floor connectivity.

## Advanced corridor type contract

`corridorType` describes the authored meaning of a corridor without changing its routing topology. Pass 2A treats corridor type as metadata plus a render profile contract; visual rendering and editor controls are layered on top in later passes.

Supported values:

- `normal`: standard traversable passage.
- `narrow`: tight or claustrophobic passage; still physically open.
- `collapsed`: damaged, rubbled, or unstable passage; still physically open in this pass.
- `secret`: hidden/GM-only passage intent. Player export hiding is handled by render/export in a later pass.
- `gallery`: broad/processional/circulation passage or corridor-room intent.

Rules:

1. Every final corridor must expose a normalized `corridorType`.
2. Every final corridor must expose a matching `corridorRenderProfile.type`.
3. Manual overrides in `manualOverrides.corridorTypes` win over inferred types.
4. Type inference must not mutate `floorCells`, `pathCells`, doors, anchors, level metadata, or connectivity.
5. `stairs` are not a corridor type. Stairs remain a level-transition concept and are handled by the level/stair contract.

Pass 2B adds SVG visual accents for corridor types while preserving the topology contract:

- `narrow` renders an inset/edge accent over the existing corridor floor.
- `collapsed` renders scar and rubble marks over the existing corridor floor.
- `secret` renders a subdued GM/editor trace; player-export hiding remains a later export concern.
- `gallery` renders a broader/processional axis with light ornamental cross-marks.

These accents must never mutate `floorCells`, `pathCells`, doors, anchors, level metadata, or connectivity. True width changes, blocked collapsed routes, secret player hiding, gallery widening, and stair rendering remain future editor/export/level passes.

Pass 2C adds editor controls for the same contract:

- corridor type can be set from corridor point, waypoint, and endpoint context menus;
- setting `normal` is an explicit manual override and may override inferred `secret`, `collapsed`, or `gallery`;
- `Reset Type` removes the manual override and returns the corridor to inference;
- deleting a corridor must also remove its `manualOverrides.corridorTypes[corridorId]` entry;
- editor controls must only mutate `manualOverrides.corridorTypes`; they must not mutate corridor topology, doors, anchors, levels, or stairs.

