# AGENTS.md

## Project Contract

Agent Env Switcher is a local-first AI profile manager for Claude Code, Hermes, OpenClaw, OpenAI-compatible APIs, DeepSeek, Kimi, OpenAI, Gemini-compatible endpoints, and local LLM Gateway targets.

## Agent Workflow

Agents must use the project flow:

1. Requirements
2. Design
3. Tasks
4. Acceptance
5. Implementation

## Hard Constraints

- Do not upload secrets.
- Do not add cloud sync.
- Do not add accounts.
- Do not add telemetry.
- Do not read Keychain.
- Do not read browser data.
- Do not modify system configuration by default.
- Do not kill processes.
- Do not introduce Electron.
- Do not switch the primary stack to SwiftUI.
- Keep macOS distribution focused on GitHub Release for MVP.

## Implementation Gate

Before implementation, the agent must:

1. Read `.mini-spec-kit/project-constraints.md`.
2. Read `.mini-spec-kit/project-spec.md`.
3. Read the relevant module files under `.mini-spec-kit/modules/`.
4. Confirm the intended change maps to checklist items.
5. Update verification notes after completing work.
