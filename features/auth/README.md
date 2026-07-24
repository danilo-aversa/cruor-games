# Cruor Auth

This folder owns authentication and authorization for Cruor Games.

## Current prototype

The prototype adapter accepts only `admin` / `admin`. It creates a normalized
session in `sessionStorage`; the password is never persisted.

This is UI-level prototype access control. It does not secure server data or
replace backend authorization.

## Boundaries

- `auth.adapter.js`: authenticates through the current provider.
- `auth.session.js`: reads, validates, saves, and clears normalized sessions.
- `auth.policy.js`: converts roles and entitlements into product permissions.
- `auth.routes.js`: validates post-login return destinations.
- `LoginPage.jsx`: provider-agnostic login interface.
- `auth.constants.js`: shared roles, entitlements, paths, and prototype config.

## Future provider integration

Supabase, Patreon memberships, one-time purchases, and donations should be
resolved inside provider adapters and normalized into the same session shape.
Provider-specific records should grant product entitlements such as:

- `content-studio`
- `debug-ui`
- future content packs, export capabilities, or patron-only tools

The router and topbar should continue consuming policy functions rather than
checking Patreon tiers, payment records, or provider names directly.
