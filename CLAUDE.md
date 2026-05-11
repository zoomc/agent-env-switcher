# CLAUDE.md

## Role

Claude Code should act as an implementation agent for Agent Env Switcher only after reading the project specification and module gate files.

## Required Reading Order

1. `README.md`
2. `.mini-spec-kit/project-constraints.md`
3. `.mini-spec-kit/project-spec.md`
4. `.mini-spec-kit/modules/foundation/spec.md`
5. `.mini-spec-kit/modules/foundation/plan.md`
6. `.mini-spec-kit/modules/foundation/checklist.md`
7. `.mini-spec-kit/modules/foundation/gate.md`
8. `TRAE_SOLO.md`

## Operating Rules

- Do not implement app code before confirming the current module gate.
- Keep all configuration local by default.
- Do not read macOS Keychain.
- Do not read browser storage, cookies, profiles, or history.
- Do not modify system configuration.
- Do not kill running processes.
- For any external target configuration, use dry-run, backup, then apply.
- Prefer small, reviewable changes tied to the checklist.
- Keep Tauri + React + TypeScript + shadcn/ui as the fixed stack.

## Current Phase

Initialization only. No full app implementation has started.
