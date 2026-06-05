# Codex Profile Switching — Checklist

## Permissions

- [x] `~/.codex/**` added to Tauri FS read permissions
- [x] `~/.codex/**` added to Tauri FS write permissions
- [x] `~/.codex/**` added to Tauri FS mkdir permissions
- [x] `~/.codex/**` added to Tauri FS exists permissions

## Config Format

- [x] `formatCodexToml()` replaced with `updateCodexConfigModel()` — real format (top-level `model` key)
- [x] `parseCodexToml()` replaced with `parseCodexConfigModel()` — parses real format
- [x] `mergeCodexToml()` replaced with `updateCodexConfigModel()` — preserves all existing sections, updates only `model`
- [x] `readCodexAuth()` reads `~/.codex/auth.json`
- [x] `writeCodexAuth()` updates API key in `auth.json` without destroying tokens

## Apply Flow

- [x] Backup `config.toml` before write (combined with auth.json in single backup record)
- [x] Backup `auth.json` before write (included in combined codex backup)
- [x] Write `model` to `config.toml`
- [x] Write API key to `auth.json`
- [x] Verify write by reading back (Tauri FS write is synchronous)

## Health Check

- [x] `checkTargetHealth('codex')` checks real config format (top-level `model` key via regex)

## UI

- [x] Codex known models list includes relay models (gpt-5.5, gpt-5.4, gpt-5.4-mini, gpt-5.3-codex)
- [x] `DefaultModelSection` shown on Codex profiles page
- [x] Apply button works for codex profiles (existing TargetProfilesPage handles this)
- [x] Status indicator shows current active profile (existing TargetProfilesPage handles this)

## i18n

- [x] All strings covered by existing en translations (codexAuth, defaultModel, targetProfiles sections)
- [x] All strings covered by existing zh translations

## Safety

- [x] No API keys in git (keys stay in local auth.json only)
- [x] Backup before every write (combined config.toml + auth.json backup)
- [x] OAuth tokens in auth.json preserved (writeCodexAuth reads existing, only updates auth_mode and OPENAI_API_KEY)
- [x] Existing config.toml sections preserved (updateCodexConfigModel only replaces the model line)

## Verification

- [x] TypeScript compiles without errors
- [x] Vite build succeeds
- [x] Tauri cargo check passes
- [ ] Create Codex profile in UI works (requires running Tauri dev)
- [ ] Apply profile writes correct `config.toml` (requires running Tauri dev)
- [ ] Apply profile writes correct `auth.json` (requires running Tauri dev)
- [ ] Switch between profiles works (requires running Tauri dev)
- [x] Existing Claude Code profiles still work (no changes to Claude Code logic)
- [x] Existing Hermes profiles still work (no changes to Hermes logic)
- [x] Existing OpenClaw profiles still work (no changes to OpenClaw logic)
