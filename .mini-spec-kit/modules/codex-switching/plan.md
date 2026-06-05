# Codex Profile Switching — Plan

## Task Breakdown

### Task 1: Tauri FS Permissions
**File**: `src-tauri/capabilities/default.json`
- Add `~/.codex/**` to `fs:allow-read`, `fs:allow-write`, `fs:allow-mkdir`, `fs:allow-exists`

### Task 2: Fix Codex TOML Format Functions
**File**: `src/lib/targetAdapters.ts`
- Rewrite `formatCodexToml()` to generate real format: top-level `model = "..."` key
- Rewrite `parseCodexToml()` to parse real format: extract `model` from top-level key
- Rewrite `mergeCodexToml()` to preserve all existing sections, only update `model` line
- Add `readCodexAuth()` function to read `~/.codex/auth.json`
- Add `writeCodexAuth()` function to update API key in `auth.json`
- Update `targetAdapter.write()` for codex to also update `auth.json`
- Update `targetAdapter.backup()` for codex to also backup `auth.json`
- Update `checkTargetHealth()` for codex to check real format

### Task 3: Add Codex-Specific DefaultModelSection
**File**: `src/components/DefaultModelSection.tsx`
- Add `codex` to `knownModels` with relay models: `gpt-5.5`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.3-codex`

### Task 4: Update CodexProfiles Page
**File**: `src/pages/CodexProfiles.tsx`
- Add `DefaultModelSection` for codex target (currently only shown for hermes/openclaw)

### Task 5: i18n Updates
**Files**: `src/i18n/locales/en.json`, `src/i18n/locales/zh.json`
- Add codex-specific strings if needed (likely already covered by existing keys)

### Task 6: Connection Test
**File**: `src/lib/targetAdapters.ts`
- Add `testCodexConnection()` function that makes a lightweight API call to verify key works

### Task 7: Verify & Test
- TypeScript compilation check
- Vite build check
- Manual test: create profile, apply, verify config files
- Verify existing features still work

## Dependencies

```
Task 1 (FS perms) ─→ Task 2 (format fix) ─→ Task 6 (connection test)
                                        ─→ Task 3 (model list)
                                        ─→ Task 4 (page update)
Task 5 (i18n) can run in parallel
Task 7 (verify) depends on all above
```

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Codex config format changes in future version | Medium | Parse is defensive, preserves unknown sections |
| auth.json format varies between Codex versions | Medium | Read-modify-write, preserve existing fields |
| Tauri FS permissions too broad | Low | Scoped to `~/.codex/**` only |
| Breaking existing codex target functionality | High | Backup before every write, test both paths |

## Analysis Report

### CRITICAL Issues Found

#### 1. Existing `formatCodexToml()` Generates Wrong Format (CRITICAL)
**Current code** generates:
```toml
[model]
provider = "openai"
model = "gpt-5.5"
fast_model = "gpt-4o-mini"
reasoning_model = "o3"

[provider]
base_url = "https://api.openai.com/v1"
api_key = "sk-..."
```

**Real Codex config.toml** has:
```toml
model = "gpt-5.5"
model_reasoning_effort = "medium"
approval_policy = "on-request"
```

**Impact**: Current code would CORRUPT the codex config if applied. The TOML parser would create nested sections that Codex CLI doesn't read.

**Fix**: Complete rewrite of format/parse/merge functions.

#### 2. API Key Not in config.toml (CRITICAL)
**Current assumption**: API key goes in config.toml `[provider]` section.
**Reality**: API key is in `~/.codex/auth.json` under `"OPENAI_API_KEY"` field.

**Impact**: Current apply flow would NOT switch the API key at all.

**Fix**: Add auth.json read/write functions, update apply flow.

#### 3. Tauri FS Missing ~/.codex/ Permissions (CRITICAL)
**Current capabilities**: Only `~/.claude/**`, `~/.hermes/**`, `~/.openclaw/**` are allowed.
**Impact**: Tauri will reject all file operations on `~/.codex/`.

**Fix**: Add `~/.codex/**` to all FS permission scopes.

#### 4. Health Check Looks for Wrong Format (WARNING)
**Current**: `checkTargetHealth('codex')` checks for `[model]` section and `model =` key.
**Reality**: `model = "..."` is a top-level key, not inside a `[model]` section.

**Fix**: Update health check to look for top-level `model =` pattern.

#### 5. No Claude Models on Relay (INFO)
The relay at `https://www.onetopai.asia/v1` only has GPT models:
- `gpt-5.3-codex`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.5`

**Impact**: Can only test with GPT models. This is expected for Codex (OpenAI-only tool).

### Implementation Decisions

1. **auth.json strategy**: Read-modify-write. Set `auth_mode` to `"api-key"` and `OPENAI_API_KEY` to the profile's key. Preserve `tokens` block (user may want to switch back to ChatGPT auth).

2. **config.toml strategy**: Line-by-line parse. Find `model = "..."` line and replace value. Preserve all other lines exactly. This is safer than TOML library parsing because it handles comments, formatting, and unknown sections.

3. **Connection test**: Use `fetch()` to call `/v1/models` endpoint with the API key. Lightweight, doesn't consume tokens.

4. **No Rust backend needed**: All operations can be done through the existing Tauri FS plugin from the frontend. No new Tauri commands required.

### Files to Modify

| File | Change Type |
|------|-------------|
| `src-tauri/capabilities/default.json` | Add ~/.codex/** permissions |
| `src/lib/targetAdapters.ts` | Rewrite codex format functions, add auth.json support |
| `src/components/DefaultModelSection.tsx` | Add codex models |
| `src/pages/CodexProfiles.tsx` | Add DefaultModelSection |
| `src/i18n/locales/en.json` | Add codex auth strings if missing |
| `src/i18n/locales/zh.json` | Add codex auth strings if missing |
