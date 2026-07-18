# Live integration Phase 8 — final QA and closure

## Outcome

The Dark Places semantic v2 integration is complete at the live Composer
boundary. The Composer resolves one of the 14 canonical semantic modules,
compiles it deterministically, applies granular production-registry overrides,
hands semantic topology to Map Generator without erasing manual edits, and
renders/exports `cruor-location-document-v2` directly.

Editorial approval and publication status remain deliberately separate. All 14
migration records are editorially approved and complete. Module payloads may
remain `in-review` while an independent publication blocker, such as image
provenance, is still open.

## Final acceptance matrix

| Required behavior | Authoritative QA |
| --- | --- |
| Registry, canonical module resolution, all 14 Inspirations, no retired fallback | `inspiration-catalog-boundary.test.js`, `dark-places-runtime-content.test.js`, Phase 8 content-pack tests |
| Picker, all seven slots, source/context/horror/intrusion filters and exclusion reasons | `location-composer-selectors.test.js`, `LocationComponentPickerModal.test.jsx`, `dark-places-phase8-live-acceptance.test.js` |
| Slot and room assignment, move/remove, undo/redo, draft recovery | `location-room-assignment-transaction.test.js`, `location-composer-draft.test.js`, final live acceptance |
| Granular append/change/clear/remove and lock promotion | `dark-places-hybrid-overrides.test.js`, `dark-places-runtime-content.test.js`, final live acceptance |
| Semantic compiler, deterministic output, map intent/request | compiler directory tests, semantic preview tests, semantic map handoff tests |
| Manual override preservation across semantic changes | `location-composer-semantic-map-handoff.test.js`, final live acceptance |
| Location Document v2, explicit v1 read compatibility, Final Output and export | `location-document-output-v2.test.js`, `LocationOutputWorkspace.test.jsx`, `location-composer-output.test.js` |
| Import/export and save/restore | Studio v2 I/O tests, output serializer tests, Composer draft tests |
| Inspiration, source, seed, context and room changes | `dark-places-phase8-live-acceptance.test.js` |
| Runtime mount without console errors or warnings | `DarkenLocationComposerPage.test.jsx` |

## Impalement granular completion

Final live QA found that Impalement had no production candidates for `clue` or
`encounterTwist`. The canonical expansion pack now supplies:

- `places-clue-nameless-iron-ring`;
- `places-twist-stake-line-chokepoint`.

Both are granular production content, remain distinct from semantic baseline
ownership, and are included exactly once in migration provenance. All seven
picker slots are now reachable for every canonical source, and live resolution
of all 14 Inspirations emits zero diagnostics under the final acceptance input.

## Repeatable final gate

```powershell
npm run qa:dark-places:phase8-final
npm run lint
npm run build
npm run docs:repo-map
npm run docs:repo-map:check
git diff --check
```

`qa:dark-places:phase8-final` runs the 14-module editorial/catalog audit, all
canonical migration checks, semantic validation and coverage, 42 deterministic
sample builds with warnings treated as failures, the live Composer/compiler/map/
output acceptance suite, and static content validation.

## Closure rules

- `cruor-location-document-v2` is the only live Final Output/export document.
- The v1 document path is read-only historical compatibility and is not a live
  producer.
- The semantic module owns the macro baseline; the production registry owns
  granular picker components and regions.
- Manual Map Generator state remains a separate overlay.
- Monster grafts remain in their modern external owner and are not duplicated.
- A publication blocker does not roll back editorial migration completion.
