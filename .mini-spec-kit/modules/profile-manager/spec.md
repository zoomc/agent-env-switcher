# Profile Manager Module Spec

## Requirement

Create a four-tab config management UI that allows per-target profile management. Each tab (Hermes, Claude Code, Codex, OpenClaw) provides profile listing, editing, and apply functionality specific to that target's config format.

## Scope

- Per-target profile storage model (each target stores independently)
- Tabbed UI with 4 target tabs
- Profile list, editor, and actions per target
- Profile switching per target
- Config format adapters: Hermes YAML, Claude Code env vars, Codex TOML, OpenClaw JSON
- API key masking (first 5 + last 3 chars)

## REQ IDs

- REQ-PM-01: Per-target profile data model
- REQ-PM-02: Hermes YAML read/write adapter
- REQ-PM-03: Claude Code env var export adapter
- REQ-PM-04: Codex TOML read/write adapter
- REQ-PM-05: OpenClaw JSON read/write adapter
- REQ-PM-06: Tabbed UI with 4 target tabs
- REQ-PM-07: Profile list with name, provider, active status per target
- REQ-PM-08: Profile editor with base URL, API key (masked), default/fast/reasoning models
- REQ-PM-09: Profile actions: create, delete, apply (dry-run -> backup -> apply)
- REQ-PM-10: Profile switching per target
- REQ-PM-11: API key masking in UI (first 5 + last 3)
- REQ-PM-12: Never expose full API keys in UI, logs, or console

## Non-Goals

- Encrypted key storage (future)
- Cloud sync
- Real API connections during development

## Acceptance Criteria

- All 4 tabs render with correct target config paths
- Profile CRUD works per target
- API keys are always masked in display
- Config files are read/written preserving existing structure
- Dry-run preview shows before/after for each target
- Apply flow follows dry-run -> backup -> apply
