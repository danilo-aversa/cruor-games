# Phase 4 — Sensory allocation and Read-Aloud composer

## Outcome

Phase 4 activates the authored Sensory Profile and Read-Aloud Profile in the
pure Dark Places compiler. Every Sedlec room now receives three deterministic,
room-specific Immediate Impressions and compact, standard, and extended
Read-Aloud variants. The temporary v2-to-v1 output view exports the standard
variant as one player-facing Read-Aloud block.

The active Composer producer and export bundle remain v1. No Studio path,
legacy content record, registry entry, React component contract, SVG, or Map
Generator implementation is imported by the new compiler stages. The Sedlec
module remains `in-review`; technical completion does not record human
editorial approval.

## Compiler stages

The staged pipeline now runs:

1. normalize canonical inputs;
2. resolve selected semantic components;
3. build Place Identity;
4. build site-wide systems;
5. allocate Recurring Signs;
6. allocate sensory impressions;
7. compose room Read-Aloud variants;
8. build the Location Document skeleton;
9. build semantic map intent;
10. validate the document;
11. emit Location Document v2.

`location-compiler-rng.js` supplies the dependency-free stable hash and ranking
helpers used by room derivation. It reads only the explicit session seed and
stable semantic identifiers; it never reads global randomness, time, browser
state, storage, or renderer geometry.

## Sensory allocation

`location-sensory.compiler.js`:

- canonicalizes room order by number and id;
- derives route depth from semantic room connections;
- resolves low, medium, or high intensity from role, depth, and level;
- allocates two exact-unique authored sense variants before pool exhaustion;
- avoids using the same dominant sense in adjacent rooms where alternatives
  exist;
- adds one room-specific contextual impression selected from geometry, role,
  then intensity biases;
- retains the source profile and fragment id in every block;
- replaces compatibility-normalized repeated sensory blocks only when an
  authored Sensory Profile is selected;
- emits a visible warning if a geometry fallback becomes necessary.

Base allocation keys depend on the seed, room id, slot, and fragment id. Role,
shape, intensity, and content affect only the changed room's contextual choice.
Changing room-local descriptive fields without changing room ids or the room
set therefore does not rewrite unrelated sensory allocations. Adding, removing,
or renumbering rooms is a new room program and may legitimately produce a new
allocation.

For the five-room Sedlec fixture the compiler emits 15 exact-unique Immediate
Impressions: two distinct sense channels and one contextual impression per
room, with no fallback or diagnostic.

## Read-Aloud composition

`location-read-aloud.compiler.js` combines tagged fragments with allocated
sensory impressions. Candidate ranking considers room role, semantic geometry,
visible feature tags, intensity, stable fragment id, and the explicit seed.
Each generated fragment block retains provenance, source component id, source
fragment id, fragment group, player audience, and the variants that use it.

The composition plans are:

| Variant  | Ordered beats                                                     | Target words | Maximum sentences |
| -------- | ----------------------------------------------------------------- | -----------: | ----------------: |
| Compact  | spatial anchor, sensory focus                                     |        20–35 |                 2 |
| Standard | spatial anchor, sensory focus, visible feature, unsettling detail |        45–75 |                 4 |
| Extended | standard beats, motion/change, exit/depth                         |       80–120 |                 6 |

The compiler evaluates compatible fragment combinations and chooses the
highest-ranked combination inside the authored word range. Out-of-range output
is retained only as a draft with an explicit diagnostic; the canonical Sedlec
fixture produces no such diagnostic.

Player-facing candidates are filtered against both profile constraints and the
compiler safety set: `secret`, `solution`, `hidden-creature`, `hidden-threat`,
`gm-only`, `gm-only-consequence`, `future-reveal`, and `true-name`. The Sedlec
profile intentionally contains `gm-only` and `future-reveal` candidates so the
snapshot proves they never reach compiled room text.

## Output and export compatibility

`dark-places-v1-compatibility.adapter.js` detects compiler-composed Read-Aloud
fragments and projects `room.readAloud.standard` as the sole renderer/export
block. Compact and extended text remain available as structured metadata for
future native v2 controls. Compatibility documents without a selected
Read-Aloud Profile keep their original fragment projection, preserving Phase 2
v1/v2 comparison behavior.

`LocationOutputWorkspace` therefore displays and copies the standard variant
for semantic v2 rooms without changing its public v1 renderer contract. This is
a read/output projection, not a v1 content writer.

## Deterministic fixtures

`scripts/content/snapshot-dark-places-semantic-v2-phase4.mjs` performs two
independent builds and verifies:

- `v2-phase4-location-document.json`;
- `v2-phase4-sensory-allocation.json`;
- `v2-phase4-export-view.json`;
- `v2-phase4-rooms.md`;
- `v2-phase4-fixture-files.sha256`.

The Phase 3 snapshot selects every Phase 3 semantic component except Sensory,
Read-Aloud, and Session Guide. The Phase 4 snapshot selects Sensory and
Read-Aloud but omits Session Guide. This preserves real regression boundaries
while the normal compiler path continues through all completed stages.

```powershell
npm run content:snapshot:dark-places-v2:phase4
npm run qa:dark-places:semantic-phase4
```

## Acceptance status

| Criterion                                                                  | Status                |
| -------------------------------------------------------------------------- | --------------------- |
| No exact repeated Immediate Impression before pool exhaustion              | Complete              |
| Room-local changes preserve unrelated sensory allocations                  | Complete              |
| Standard Read-Aloud meets 45–75 words for all normal Sedlec fixtures       | Complete              |
| Compact and extended variants meet their authored ranges                   | Complete              |
| Hidden and GM-only fragments never enter player-facing text                | Complete              |
| Standard variant is used in the temporary output/export view               | Complete              |
| Snapshots cover entrance, connector, clue, ritual, secret, and final roles | Complete              |
| Unit snapshots cover narrow, circular, vertical, and ruined shapes         | Complete              |
| Canonical output is deterministic, immutable, and input-order independent  | Complete              |
| Human editorial approval                                                   | Open publication gate |

## Deferred work

Phase 5 now owns and implements the operational Session Guide and At the Table
dashboard. Phase 6 later completed Studio v2-only writing; specialized Studio
editors remain Phase 7 and full Inspiration migration remains Phase 8. No
later-phase producer migration or legacy deletion is included here.
