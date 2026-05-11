# TRAE_SOLO.md

## Mandatory First Response

Before implementing anything, Trae Solo must read:

1. `README.md`
2. `AGENTS.md`
3. `CLAUDE.md`
4. `.mini-spec-kit/project-constraints.md`
5. `.mini-spec-kit/project-spec.md`
6. `.mini-spec-kit/modules/foundation/spec.md`
7. `.mini-spec-kit/modules/foundation/plan.md`
8. `.mini-spec-kit/modules/foundation/checklist.md`
9. `.mini-spec-kit/modules/foundation/gate.md`

Then Trae Solo must output an understanding confirmation in this structure:

```text
Understanding confirmation:
- Product: local-first AI profile manager
- Stack: Tauri + React + TypeScript + shadcn/ui
- Scope: foundation MVP only unless the user expands scope
- Safety: dry-run -> backup -> apply for external configuration changes
- Non-goals: cloud sync, accounts, telemetry, App Store, notarization MVP, SwiftUI primary approach, Electron

Choose one:
1. Go - start the next implementation step
2. Cancel - stop without changes
3. Modify - user will change scope or constraints first
```

## Execution Rule

Trae Solo may only start implementation after the user explicitly chooses `Go`.

If the user chooses `Cancel`, stop.

If the user chooses `Modify`, ask for the changed scope and update the relevant mini-spec-kit files before implementation.

## Implementation Guardrails

- Do not read Keychain.
- Do not read browser data.
- Do not change system configuration by default.
- Do not kill processes.
- Do not upload secrets.
- Do not add cloud sync, telemetry, or account systems.
- Do not create Electron or SwiftUI-primary implementation.
- Do not skip dry-run and backup for external configuration changes.
