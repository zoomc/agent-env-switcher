# Agent Env Switcher — Feature Specification

## Overview

Documents all implemented features in the agent-env-switcher application as a post-implementation reference. This is a documentation-only supplement; no code changes.

## Requirements

### REQ-001: i18n English/Chinese Language Switching

**Description**: The app supports bilingual UI with English and Chinese (zh) translations. Language selection is persisted in localStorage and defaults to the system locale.

**Acceptance Criteria**:
- i18next is initialized with `en` and `zh` locales
- Language preference persists in localStorage under key `agent-env-switcher:language`
- Default language auto-detects from `navigator.language`
- Language toggle is accessible from the sidebar footer
- All UI text uses `useTranslation()` / `t()` for localization
- Language files exist at `src/i18n/locales/en.json` and `src/i18n/locales/zh.json`

**Implementation Files**:
- `src/i18n/index.ts` — i18next initialization
- `src/i18n/locales/en.json` — English translations
- `src/i18n/locales/zh.json` — Chinese translations
- `src/main.tsx` — imports `./i18n` at startup
- `src/components/layout/Sidebar.tsx` — language toggle button

### REQ-002: System-Following Dark Mode

**Description**: The app follows the OS dark/light preference automatically via `prefers-color-scheme` media query. There is no manual toggle — the theme tracks the system setting in real time.

**Acceptance Criteria**:
- `initTheme()` is called at app startup in `main.tsx`
- The `prefers-color-scheme: dark` media query is listened for changes
- `document.documentElement.classList.toggle('dark', isDark)` is called on system preference change
- Tailwind CSS uses the `dark:` variant for dark mode styling
- No manual dark/light toggle exists in the UI

**Implementation Files**:
- `src/lib/theme.ts` — theme initialization and listener
- `src/main.tsx` — calls `initTheme()` before render
- `tailwind.config.ts` — darkMode config (class-based)

### REQ-003: OpenRouter One-Click Apply with Agent Selection

**Description**: The OpenRouter page fetches free models from the OpenRouter API, lets users select target agents (hermes, claude-code, codex, openclaw), and applies a model to the active profile of each selected agent in one click.

**Acceptance Criteria**:
- Fetches models from `https://openrouter.ai/api/v1/models` on demand
- Filters for free models (pricing prompt === '0' and completion === '0')
- Displays model name, ID, context length, and modality
- Agent selection uses toggleable Badge components for each TargetType
- "Apply" button calls `applyTargetProfileChanges` for each selected agent's active profile
- Falls back to mock data (`exampleFreeModels`) if API fetch fails
- Shows fetch error as a warning banner
- Shows per-agent apply result after completion

**Implementation Files**:
- `src/pages/OpenRouter.tsx` — full OpenRouter page component
- `src/lib/targetAdapters.ts` — `applyTargetProfile` function
- `src/data/mock.ts` — `exampleFreeModels` fallback data

### REQ-004: OpenClaw/Hermes Default Model Setting

**Description**: The `DefaultModelSection` component allows users to read and set the default model for Hermes and OpenClaw targets directly from their config files.

**Acceptance Criteria**:
- `readDefaultModel(targetType)` reads current default from config file
- `writeDefaultModel(targetType, model)` writes new default to config file
- Hermes uses YAML format (`model.default` field)
- OpenClaw uses JSON format (`model` field)
- Displays a dropdown of known models for each target type
- Shows current default, loading state, and success/error feedback
- Setting a model is disabled when current equals selected

**Implementation Files**:
- `src/components/DefaultModelSection.tsx` — UI component
- `src/lib/targetAdapters.ts` — `readDefaultModel`, `writeDefaultModel` functions

### REQ-005: CLI Agent Update Check & Update

**Description**: The Updates page checks for latest versions of installed AI coding agents (Claude Code, Codex, Hermes, OpenClaw) via GitHub releases API and npm registry, and provides simulated update actions.

**Acceptance Criteria**:
- Lists 4 agents: Claude Code, Codex, Hermes, OpenClaw
- Checks GitHub releases API for latest version (tag_name)
- Falls back to npm registry if no GitHub repo
- Displays current version, latest version, release date per agent
- Shows "Update available" badge when versions differ
- Shows "Up to date" badge when versions match
- Update action is simulated (2s delay) — real updates would use Tauri shell
- "Check for Updates" button checks all agents sequentially
- Individual "Check" and "Update" buttons per agent

**Implementation Files**:
- `src/pages/Updates.tsx` — full updates page component

### REQ-006: Codex Auth Backup & Restore

**Description**: The CodexAuthBackup component lets users backup and restore Codex authentication credentials (API key, base URL, config content) to/from localStorage.

**Acceptance Criteria**:
- "Backup Auth" button reads current Codex config via `targetAdapter.read('codex')`
- Captures `VITE_OPENAI_API_KEY` and `VITE_OPENAI_BASE_URL` from env
- Saves backup with timestamp to localStorage under key `agent-env-switcher:codex-auth-backups`
- Displays list of existing backups with timestamp and size
- "Restore Auth" button writes backup data back via `targetAdapter.write('codex', ...)`
- Shows loading spinner, success/error feedback with auto-dismiss after 3s
- Backups are stored as JSON array in localStorage

**Implementation Files**:
- `src/components/CodexAuthBackup.tsx` — backup/restore UI component
- `src/lib/targetAdapters.ts` — `targetAdapter.read` and `targetAdapter.write` for codex

### REQ-007: Full Code/UI Review After Completion

**Description**: All features use consistent UI patterns (shadcn/ui cards, badges, buttons), type-safe TypeScript (no `any`), i18n for all user-facing text, and error states with actionable messages. The build passes with 0 TypeScript errors.

**Acceptance Criteria**:
- `npm run build` passes with 0 TypeScript errors
- All pages use `useTranslation()` for text
- All components handle loading, error, and empty states
- UI uses shadcn/ui components consistently (Card, Button, Badge, Separator)
- No `any` types without justification
- Responsive layout works at standard widths

### REQ-008: Safety Constraints

**Description**: All external configuration operations follow the dry-run → backup → apply → verify → restore path. Codex auth backup is mandatory before restore. Sensitive data (API keys) is redacted in dry-run previews.

**Acceptance Criteria**:
- `applyProfile()` creates backup before writing config for each target
- `applyTargetProfile()` creates backup before writing config
- `restoreBackup()` creates a pre-restore backup before writing
- `previewRestore()` generates a diff before allowing restore
- `redactSensitive()` masks API keys in dry-run display
- DryRun page requires confirmation before applying changes
- Backups page warns about secrets in backup files
- OpenAI-compatible API target is skipped during apply (env-var based)
- `RESTORE_SUPPORTED_TARGETS` limits which targets allow restore

**Implementation Files**:
- `src/lib/targetAdapters.ts` — backup, write, restore, preview functions
- `src/pages/DryRun.tsx` — dry-run UI with confirmation flow
- `src/pages/Backups.tsx` — backup management with security warning
- `src/lib/mask.ts` — `redactSensitive` and `maskApiKey` functions
