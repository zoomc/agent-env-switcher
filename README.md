# Agent Env Switcher

Local-first AI profile manager for macOS.

## Current Status

| Phase   | Description                                            | Status         |
| ------- | ------------------------------------------------------ | -------------- |
| 1 / 1.1 | Tauri app skeleton + mock UI + profile CRUD            | ✅ Done        |
| 2A      | localStorage persistence + data model cleanup          | ✅ Done        |
| 2B      | Tauri FS integration (`~/.config/agent-env-switcher/`) | ✅ Done        |
| 3       | Target adapters + dry-run + apply                      | ⏳ In Progress |

**Important:**

- All API keys in the app are mock values (`MOCK_API_KEY_*_DO_NOT_USE`)
- Data is persisted via **Tauri FS** and **localStorage** (fallback)
- **Target adapters (reading/writing tool config files):**
  - Claude Code (JSON): support, safe merge of existing config
  - Hermes (YAML): dry run only (apply not supported yet)
  - OpenClaw (JSON): support, safe merge of existing config
  - OpenAI-compatible API: dry run only (no environment variable modification)
- External configuration changes follow: backup → apply
- **No automatic rollback implemented yet** (only backups before writes)

## Positioning

Agent Env Switcher is a local-first AI profile manager for switching AI provider and target environment profiles.

It does **not** include:

- Cloud sync
- Account systems
- Telemetry
- Keychain reads
- Browser data reads
- System-wide configuration changes by default

## Target Stack

- Tauri v2
- React
- TypeScript
- shadcn/ui + Tailwind CSS

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

- Profiles, active profile ID, settings, and backups are saved to `localStorage` automatically
- Data persists across page refreshes within the same browser/WebView
- Clearing browser data will reset to example profiles
- On load failure (corrupted data), the app falls back to default/example data and shows a warning

localStorage keys:

| Key                                    | Content           |
| -------------------------------------- | ----------------- |
| `agent-env-switcher:profiles`          | Profile list      |
| `agent-env-switcher:active-profile-id` | Active profile ID |
| `agent-env-switcher:settings`          | App settings      |
| `agent-env-switcher:backups`           | Backup records    |

Tauri FS integration (`~/.config/agent-env-switcher/`) is planned for Phase 2B.

## Provider / Target Model

**Providers** (API endpoints):

| Provider Type       | Description                        |
| ------------------- | ---------------------------------- |
| `openai-compatible` | Generic OpenAI-compatible endpoint |
| `deepseek`          | DeepSeek API                       |
| `kimi`              | Moonshot (Kimi) API                |
| `openai`            | OpenAI API                         |
| `gemini-compatible` | Gemini-compatible endpoint         |
| `local-gateway`     | Local LLM gateway                  |
| `openrouter`        | OpenRouter API                     |

**Targets** (AI coding tools):

| Target Type             | Description                        |
| ----------------------- | ---------------------------------- |
| `claude-code`           | Anthropic's CLI coding agent       |
| `hermes`                | AI coding assistant                |
| `openclaw`              | Open-source coding agent           |
| `openai-compatible-api` | Any OpenAI-compatible API endpoint |

A Profile selects a **Provider** and enables one or more **Targets**.

## MVP Scope

- Multiple local profiles
- Active profile switching (persisted via localStorage)
- Dry-run preview before changes (mock only)
- Backup and restore (mock only)
- Profile import/export (JSON with validation)
- Target support for the listed providers and tools

## Safety Principles

- Local-first by default
- No cloud sync
- No uploaded secrets
- No system configuration changes by default
- No keychain reads
- No browser data reads
- No process killing
- External configuration changes must follow: dry-run → backup → apply

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
