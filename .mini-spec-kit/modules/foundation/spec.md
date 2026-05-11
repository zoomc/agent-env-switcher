# Foundation Module Spec

## Requirement

Create the foundation for a local-first AI profile manager that can later support multiple providers and targets without weakening safety constraints.

## Scope

Foundation includes:

- Project documentation
- Safety constraints
- Provider and target coverage list
- MVP capability list
- Implementation gate
- Verification records
- Trae Solo handoff

Foundation excludes:

- Tauri app scaffolding
- React implementation
- shadcn/ui installation
- Provider adapter implementation
- Config mutation implementation
- Build, signing, notarization, or packaging

## Supported Targets

- Claude Code
- Hermes
- OpenClaw
- OpenAI-compatible API
- DeepSeek
- Kimi
- OpenAI
- Gemini-compatible endpoint
- local LLM Gateway

## MVP Capability Contract

- Multiple profiles
- Active profile switching
- Dry-run preview
- Backup and restore
- Script generation
- Target-specific support

## Safety Contract

External changes must be performed only through a controlled flow:

1. Analyze target
2. Generate dry-run
3. Ask for confirmation
4. Create backup
5. Apply
6. Verify
7. Keep restore option available
