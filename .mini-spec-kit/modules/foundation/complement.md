# Foundation Complement

## Notes For Future Implementation

The project should favor explicit local files and reversible operations. When a target cannot be changed safely, generate a script instead of applying changes directly.

## Open Questions

- Exact local profile storage format.
- Whether secrets are stored as references, redacted values, or user-managed environment variables.
- Exact adapter behavior for Claude Code, Hermes, and OpenClaw.
- Exact script output format per target.
- Backup retention policy.

## Recommended Next Deliverable

Ask Trae Solo to perform only Phase 1 after Go confirmation:

- Scaffold Tauri + React + TypeScript.
- Add shadcn/ui baseline.
- Add placeholder local profile schema.
- Add a dry-run-only UI route.
- Do not implement external config mutation yet.
