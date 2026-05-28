# Agent Env Switcher

Local-first AI profile manager for macOS.

## Current Status

| Phase   | Description                                   | Status  |
| ------- | --------------------------------------------- | ------- |
| 1 / 1.1 | Tauri app skeleton + mock UI + profile CRUD   | ✅ Done |
| 2A      | localStorage persistence + data model cleanup | ✅ Done |
| 2B      | Tauri FS integration                          | ✅ Done |
| 3       | Target adapters + dry-run + apply             | ✅ Done |
| 4       | Backup record + restore + health check        | ✅ Done |
| 5       | Sensitive data safety + UX polish             | ✅ Done |

## v0.1 Scope

### Supported

- Claude Code JSON config (read/write/backup/restore)
- OpenClaw JSON config (read/write/backup/restore)
- Dry Run preview with sensitive data redaction
- Apply with automatic backup
- Restore with mandatory preview and pre-restore backup
- Health check (file existence, JSON validity, key fields)
- Local profile management (CRUD, import/export)
- Tauri FS persistence with localStorage fallback
- API key masking in UI (show/hide toggle)
- Confirmation required for all destructive operations

### Not Supported (Yet)

- Hermes apply (YAML format not supported)
- OpenAI-compatible env apply (environment variables not modified)
- Encrypted backups
- Cloud sync
- Signed macOS release
- App Store distribution
- Keychain / Tauri Stronghold integration
- Automatic rollback

## Security Notes

- **API keys are stored locally** in Tauri FS and localStorage. They are never sent to any server.
- **Backup files may contain secrets** (API keys, tokens). Keep backup files private.
- **Export files may contain secrets**. The app warns before export. Keep exported JSON files private.
- **Dry Run and Restore previews redact sensitive values** (API keys, Authorization headers). The actual config files written to disk contain real values.
- **No encryption** is applied to stored data, backups, or exports. Do not share these files.

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

### DMG Bundling (macOS)

DMG packaging requires `create-dmg`. If `npx tauri build` fails at the DMG step:

```bash
brew install create-dmg
```

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

| Target Type             | Description                    | Config Format | Apply | Restore |
| ----------------------- | ------------------------------ | ------------- | ----- | ------- |
| `claude-code`           | Anthropic's CLI coding agent   | JSON          | ✅    | ✅      |
| `openclaw`              | Open-source coding agent       | JSON          | ✅    | ✅      |
| `hermes`                | AI coding assistant            | YAML          | ❌    | ❌      |
| `openai-compatible-api` | OpenAI-compatible API endpoint | Env vars      | ❌    | ❌      |

A Profile selects a **Provider** and enables one or more **Targets**.

## Safety Principles

- Local-first by default
- No cloud sync
- No uploaded secrets
- No system configuration changes by default
- No keychain reads
- No browser data reads
- No process killing
- External configuration changes must follow: dry-run → backup → apply
- Restore requires preview first
- All destructive operations require confirmation
- Sensitive values redacted in UI previews

## Explicit Non-Goals

- Cloud sync
- Account system
- Telemetry
- App Store release
- Notarization in MVP
- SwiftUI as the primary app approach
- Electron
- Encrypted backups (future consideration)
- Keychain / Stronghold integration (future consideration)

## macOS Release Strategy

Initial distribution target is GitHub Releases. First-open documentation must explain macOS Gatekeeper behavior and the manual open flow for unsigned or non-notarized builds.
