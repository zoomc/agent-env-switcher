# Profile Manager Checklist

## Data Model

- [x] TargetProfile type defined with per-target fields (src/types/index.ts)
- [x] TargetProfileStore type for per-target profile storage (src/types/index.ts)
- [x] Mock data includes per-target profiles (src/data/mock.ts)
- [x] Storage functions support per-target profiles (src/lib/storage.ts)

## Target Adapters

- [x] Hermes: reads ~/.hermes/config.yaml (src/lib/targetAdapters.ts)
- [x] Hermes: writes YAML preserving existing structure (src/lib/targetAdapters.ts)
- [x] Claude Code: generates env var exports (src/lib/targetAdapters.ts)
- [x] Codex: reads/writes ~/.codex/config.toml (src/lib/targetAdapters.ts)
- [x] Codex: generates env var exports for provider (src/lib/targetAdapters.ts)
- [x] OpenClaw: reads/writes ~/.openclaw/settings.json (src/lib/targetAdapters.ts)

## UI

- [x] KeyInput component masks keys (first 5 + last 3) (src/components/KeyInput.tsx)
- [x] KeyInput never shows full key by default (src/components/KeyInput.tsx)
- [x] ProfileEditor shows all required fields (src/components/ProfileEditor.tsx)
- [x] 4 tab pages render correctly (src/pages/HermesProfiles.tsx, ClaudeCodeProfiles.tsx, CodexProfiles.tsx, OpenClawProfiles.tsx)
- [x] Profile list shows name, provider, active status (src/components/TargetProfilesPage.tsx)
- [x] Profile actions: create, delete, apply (src/components/TargetProfilesPage.tsx)

## Security

- [x] API keys masked in all UI display (src/lib/mask.ts, src/components/KeyInput.tsx)
- [x] No full API keys in console.log
- [x] No full API keys in error messages
- [x] Redaction applied in dry-run previews (src/lib/mask.ts)

## Apply Flow

- [x] Dry-run generates preview for each target (src/lib/targetAdapters.ts)
- [x] Backup created before apply (src/lib/targetAdapters.ts)
- [x] Config files merged (not overwritten) (src/lib/targetAdapters.ts)
- [x] Health check runs after apply (src/lib/targetAdapters.ts)
- [x] Confirmation required before apply (src/components/TargetProfilesPage.tsx)
