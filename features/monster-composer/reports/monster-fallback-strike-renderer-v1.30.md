# Monster Composer v1.30 — Fallback Strike Renderer Fix + Low-CR Spike Hardening

## Summary

This pass fixes the publish blocker introduced by generated fallback Strike actions and makes low-CR DPR spike fitting choose the best spike-safe pass, not only the closest CR pass.

## Changes

- Generated fallback Strike actions now render numeric damage with `{damage} {damage-type}`.
- The attack renderer now repairs simple damage-type hit text when a damage model exists but no damage amount is present.
- Closed-loop CR fitting now scores low-CR passes with a DPR-spike penalty.
- Closed-loop CR fitting tracks the selected best pass state, so final targets match the selected result.
- Low-CR DPR spike clamp is stricter for CR 1–2.

## Expected QA Result

- `frame-fallback-strike-cr-*` should no longer fail parser checks for missing damage.
- `Publish Blocked` should return to 0 on Realistic QA unless a new real blocker appears.
- Low-CR DPR spike warnings should drop or remain as targeted actionable warnings only.
