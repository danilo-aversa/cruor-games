# Studio QA Tests v1.19

## Scope

Follow-up pass after v1.18 export compaction.

## Changes

- Added explicit QA export modes:
  - Compact ZIP: small aggregate report only.
  - Debug ZIP: compact report plus full debug payload files for failed/outlier generated monsters.
  - Full ZIP: full in-browser report payload, intended only for heavy debugging.
- Changed default export mode to Debug ZIP.
- Updated the modal copy so `includeFullPayloads` clearly means keeping full payloads for every generated monster, mainly for Full ZIP.
- Preserved compact JSON as the lightweight aggregate analysis format.
- Added `debug/debug-index.json` and per-monster `debug/<id>.json` files for Debug ZIP.
- Added compatibility-relaxed required-slot fallback in the QA Forge.
- Changed Forge coverage to track raw candidates, initially eligible candidates, and strict simulated selected slots separately.
- Fixed the misleading case where raw body candidates existed but strict Forge still reported a missing Body without exposing why.

## Expected Result

- Compact ZIP stays small.
- Debug ZIP should be the best default to send for analysis: small enough to upload, but includes full payloads for the cases that matter.
- Full ZIP remains available but should be used only when explicitly needed.
- Realistic QA should produce fewer `missing body` failures; when a body must be selected through relaxed fallback, the report surfaces `forge/relaxed-required-slot` instead of hiding the metadata issue.
