# Foundation Plan

## Phase 0: Initialization

Status: complete

Tasks:

- Create project directory.
- Create local git repository.
- Add README and agent instructions.
- Add mini-spec-kit inspired project constraints and module docs.
- Add Trae Solo handoff.

## Phase 1: App Skeleton

Status: complete

Tasks:

- [x] Scaffold Tauri + React + TypeScript project.
- [x] Add shadcn/ui baseline.
- [x] Add local storage boundary (types and mock data defined).
- [x] Add placeholder profile model.
- [x] Add non-mutating dry-run view.
- [x] Add 6 navigable pages (Dashboard, Profiles, Targets, Dry Run, Backups, Settings).
- [x] Add left sidebar navigation.
- [x] Add dark mode support.
- [x] Add API key masking (first 3 + dots + last 2).
- [x] Add mock data for 5 profiles.
- [x] Verify TypeScript compilation, Vite build, and Tauri cargo check.

## Phase 2: Foundation MVP

Status: pending

Tasks:

- Implement profile CRUD.
- Implement active profile selection.
- Implement target adapter interface.
- Implement dry-run diff model.
- Implement backup and restore model.
- Implement script generation.

## Phase 3: Provider And Target Expansion

Status: pending

Tasks:

- Add Claude Code target.
- Add Hermes target.
- Add OpenClaw target.
- Add OpenAI-compatible provider model.
- Add DeepSeek, Kimi, OpenAI, Gemini-compatible endpoint presets.
- Add local LLM Gateway support.
