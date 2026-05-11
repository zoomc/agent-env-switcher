# Project Spec

## Requirement

Build a local-first macOS app that manages AI provider and target profiles. Users can define multiple profiles, preview changes, switch the active profile, back up previous state, restore previous state, and generate scripts for supported targets.

## Design

The app should expose a desktop UI using Tauri + React + TypeScript + shadcn/ui. The domain model should separate:

- Profile definitions
- Provider credentials and endpoints
- Target adapters
- Dry-run diffs
- Backup snapshots
- Restore operations
- Script generation

Local configuration storage must be explicit, inspectable, and restorable.

## Tasks

- Initialize foundation documentation.
- Define provider and target model.
- Define dry-run and backup contracts.
- Define restore behavior.
- Define script generation behavior.
- Define target adapter acceptance gates.
- Later: scaffold app implementation.

## Acceptance

- Users can understand what the MVP will and will not do.
- Agents can follow a gated implementation flow.
- Safety constraints are explicit and testable.
- External configuration changes require dry-run and backup before apply.
- Trae Solo must ask for Go, Cancel, or Modify before implementation.

## Implementation Status

Project initialization only. No app implementation has started.
