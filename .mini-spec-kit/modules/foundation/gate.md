# Foundation Gate

## Gate Name

foundation-initialization

## Gate Status

Open for documentation review. Closed for app implementation until the user explicitly authorizes the next phase.

## Entry Criteria

- Project directory exists.
- Documentation skeleton exists.
- Constraints are explicit.
- Trae Solo handoff exists.
- Git repository is initialized.

## Exit Criteria

- User reviews initialization output.
- User gives Trae Solo the handoff document.
- Trae Solo outputs understanding confirmation and asks Go, Cancel, or Modify.
- User explicitly chooses Go before implementation starts.

## Blockers

- Any request to read Keychain.
- Any request to read browser data.
- Any request to upload secrets.
- Any request to change system configuration without dry-run and backup.
- Any attempt to start implementation without Go confirmation.

## Verification

See `verify.log` and `gate-history.log`.
