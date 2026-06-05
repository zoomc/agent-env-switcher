# Codex Profile Switching — Spec

## Requirement

Enable real Codex CLI profile switching: create, manage, and apply Codex configuration profiles through the Tauri app UI. When a user selects a profile and clicks "Apply", the app writes the correct config to `~/.codex/config.toml` and `~/.codex/auth.json` so that the `codex` CLI uses that profile's API key and model.

## Research Findings

### Actual Codex Config Format (from `~/.codex/config.toml`)

```toml
model = "gpt-5.5"
model_reasoning_effort = "medium"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[plugins."github@openai-curated"]
enabled = true

[projects."/path/to/project"]
trust_level = "trusted"

[desktop]
ambient-suggestions-enabled = true
```

**Critical**: There is NO `[model]` section, NO `[provider]` section, NO `api_key` or `base_url` fields in config.toml.

### Auth Storage (from `~/.codex/auth.json`)

```json
{
  "auth_mode": "chatgpt",
  "OPENAI_API_KEY": null,
  "tokens": { ... }
}
```

Two auth modes:
- `"auth_mode": "chatgpt"` — OAuth tokens (ChatGPT Plus subscription)
- `"auth_mode": "api-key"` with `"OPENAI_API_KEY": "sk-..."` — Direct API key

### Existing Code Issues

1. `formatCodexToml()` in `targetAdapters.ts` generates wrong format (fake `[model]`/`[provider]` sections)
2. `parseCodexToml()` parses the wrong format
3. `mergeCodexToml()` merges the wrong format
4. Tauri FS capabilities don't include `~/.codex/**` permissions
5. `checkTargetHealth()` for codex checks for `[model]` which doesn't exist

### Relay API Models

Available at `https://www.onetopai.asia/v1`:
- `gpt-5.3-codex`
- `gpt-5.4`
- `gpt-5.4-mini`
- `gpt-5.5`

## Scope

### In Scope

- Fix Codex TOML format to match real `config.toml` structure (top-level `model` key)
- Add `auth.json` management for API key switching
- Add `~/.codex/**` to Tauri FS capabilities
- Update health check for real Codex config format
- Update dry-run diff for real format
- Backup both `config.toml` and `auth.json` before apply
- Connection test via relay API
- UI: model dropdown with known models, apply button, status indicator
- i18n updates for new strings

### Out of Scope

- Custom base URL support (Codex CLI uses OpenAI SDK; relay works via OPENAI_API_KEY only)
- OAuth token management (read-only; don't modify ChatGPT OAuth flow)
- Plugin/MCP server configuration
- Project trust level management
- Rust backend commands (frontend-only using existing Tauri FS plugin)

## Design

### Config Write Strategy

When applying a profile:

1. **Backup** both `~/.codex/config.toml` and `~/.codex/auth.json`
2. **Update `config.toml`**: Change only the `model = "..."` line, preserve everything else
3. **Update `auth.json`**: Set `"auth_mode": "api-key"` and `"OPENAI_API_KEY": "sk-..."`, preserve tokens
4. **Verify**: Read back both files to confirm changes

### Profile Data Model

Use existing `TargetProfile` interface. For Codex:
- `providerType`: always `"openai"` (Codex is OpenAI-only)
- `baseUrl`: informational only (not written to config)
- `defaultModel`: written to `config.toml` as `model = "..."`
- `fastModel`: informational (Codex doesn't have fast model concept)
- `reasoningModel`: informational
- `apiKey`: written to `auth.json` as `OPENAI_API_KEY`

### Safety

- Backup before every write
- Never modify OAuth tokens in auth.json
- Never modify plugins, projects, or desktop sections in config.toml
- Validate config.toml structure before writing
- Redact API keys in UI previews

## Acceptance Criteria

1. User can create a Codex profile with name, model, and API key
2. User can apply a profile → `config.toml` model changes, `auth.json` API key changes
3. User can switch between profiles → different model and key active
4. Backup created before every apply
5. Connection test works with relay API
6. Existing profiles page, i18n, and other targets still work
7. No API keys committed to git
