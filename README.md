# Agent Env Switcher

Local-first AI profile manager for macOS.

## Current Status

- Phase 1 / 1.1: Tauri app skeleton + mock UI + profile CRUD ✅
- Phase 2A: Local profile persistence (localStorage) + data model cleanup ✅
- Data is persisted via **localStorage** (Tauri FS integration planned for Phase 2B)
- This app **only manages its own profile data** — it does not modify Claude Code, Hermes, or OpenClaw configurations
- Real target adapters (Claude Code, Hermes, OpenClaw) are not yet implemented

## Positioning

Agent Env Switcher is a local-first AI profile manager for switching AI provider and target environment profiles without cloud sync, account systems, telemetry, keychain reads, browser data reads, or system-wide configuration changes by default.

## Target Stack

- Tauri
- React
- TypeScript
- shadcn/ui

## Getting Started

```bash
# Install dependencies
npm install

# Start Vite dev server (frontend only)
npm run dev

# Start Tauri desktop app (requires Rust toolchain + system libs)
npm run tauri dev

# Build for production
npm run build
```

### System Requirements for Tauri

- Rust toolchain (`rustup`)
- macOS: Xcode Command Line Tools
- Linux: `libgtk-3-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`

## Data Persistence (Phase 2A)

Currently using **localStorage** as the persistence layer:

- Profiles, settings, and backups are saved to `localStorage` automatically
- Data persists across page refreshes within the same browser/WebView
- Clearing browser data will reset to example profiles
- Tauri FS integration (`~/.config/agent-env-switcher/`) is planned for Phase 2B

## Provider / Target Model

**Providers** (API endpoints):
- `deepseek`, `kimi`, `openai`, `openrouter`, `local-gateway`, `openai-compatible`, `gemini-compatible`

**Targets** (AI coding tools):
- `claude-code`, `hermes`, `openclaw`, `openai-compatible-api`

A Profile selects a Provider and enables one or more Targets.

## Covered Providers And Targets

- Claude Code
- Hermes
- OpenClaw
- OpenAI-compatible API
- DeepSeek
- Kimi
- OpenAI
- Gemini-compatible endpoint
- local LLM Gateway

## MVP Scope

- Multiple local profiles
- Active profile switching
- Dry-run preview before changes
- Backup and restore
- Script generation
- Target support for the listed providers and tools

## Safety Principles

- Local-first by default
- No cloud sync
- No uploaded secrets
- No system configuration changes by default
- No keychain reads
- No browser data reads
- No process killing
- External configuration changes must follow: dry-run, backup, apply

## Explicit Non-Goals

- Cloud sync
- Account system
- Telemetry
- App Store release
- Notarization in MVP
- SwiftUI as the primary app approach
- Electron

## macOS Release Strategy

Initial distribution target is GitHub Releases. First-open documentation must explain macOS Gatekeeper behavior and the manual open flow for unsigned or non-notarized builds.

## Project Flow

The project follows a mini-spec-kit inspired flow:

1. Requirements
2. Design
3. Tasks
4. Acceptance
5. Implementation

See `.mini-spec-kit/` for the current project constraints, module specification, implementation plan, checklist, gate, and verification log.
