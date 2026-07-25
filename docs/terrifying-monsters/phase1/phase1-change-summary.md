# Terrifying Monsters — Phase 1 Change Summary

## Added

- explicit per-source authority manifest;
- deterministic native/registry catalogue resolver;
- canonical-authoring provenance contract;
- runtime source-boundary audit;
- Graft v2 transport-field preservation across shared-component adapters;
- source-boundary QA rules;
- focused authority and adapter round-trip tests.

## Preserved

- all current production sources remain native-authoritative;
- one graft remains one selectable UI item;
- existing slot structure;
- current numerical engine;
- current rules, export and Run Mode consumers;
- Content Pack and registry provenance;
- existing UI and CSS.

## Intentionally deferred

- production Graft v2 content;
- ability bundle compilation;
- authored Attack Pattern routines;
- source-family cutovers;
- Pressure and Complexity v2;
- UI presentation changes.

## Verification performed in the supplied context

- syntax check for every modified/new JavaScript and MJS file;
- Phase 0 generated inventory freshness check;
- direct source-authority smoke tests with Node assertions;
- 90-graft compatibility simulation comparing the previous merge behavior with the new resolver;
- native-only and registry-only resolver cases checked.

The compatibility simulation produced the same 90 resolved graft objects and the same catalogue order as the previous merge path.
