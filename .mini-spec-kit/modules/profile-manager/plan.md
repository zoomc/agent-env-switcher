# Profile Manager Plan

## Phase 1: Data Model

- [ ] Extend Profile type to include per-target configs
- [ ] Add TargetConfig type for per-target profile data
- [ ] Update mock data with per-target profiles

## Phase 2: Target Adapters

- [ ] Implement Hermes YAML read/write (REQ-PM-02)
- [ ] Implement Claude Code env var export (REQ-PM-03)
- [ ] Implement Codex TOML read/write (REQ-PM-04)
- [ ] Implement OpenClaw JSON read/write (REQ-PM-05)

## Phase 3: UI Components

- [ ] Create KeyInput component with masking (REQ-PM-11)
- [ ] Create ProfileEditor shared component (REQ-PM-08)
- [ ] Create HermesProfiles page (REQ-PM-06)
- [ ] Create ClaudeCodeProfiles page (REQ-PM-06)
- [ ] Create CodexProfiles page (REQ-PM-06)
- [ ] Create OpenClawProfiles page (REQ-PM-06)

## Phase 4: State Management

- [ ] Update AppContext for per-target profiles
- [ ] Update App.tsx routes
- [ ] Update Sidebar navigation
- [ ] Update Dashboard

## Phase 5: Apply Flow

- [ ] Dry-run -> backup -> apply per target
- [ ] Confirmation before apply
- [ ] Health check after apply
