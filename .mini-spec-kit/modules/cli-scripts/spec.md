# CLI Scripts Module Spec

## Requirement

Create CLI scripts for Hermes and OpenClaw that allow profile management without exposing API keys. Scripts work with the same profile storage as the GUI.

## Scope

- Python CLI scripts for Hermes and OpenClaw
- Commands: list, switch, add, update, delete, apply
- Key masking in all output
- Shared storage with GUI

## REQ IDs

- REQ-CLI-01: List profiles for target
- REQ-CLI-02: Switch active profile
- REQ-CLI-03: Add new profile
- REQ-CLI-04: Update existing profile
- REQ-CLI-05: Delete profile
- REQ-CLI-06: Apply profile to target config
- REQ-CLI-07: Never print API keys to stdout/stderr

## Non-Goals

- GUI integration
- Real config file modification (mock mode)

## Acceptance Criteria

- All commands work with mock data
- API keys are never printed
- Output is human-readable
- Error messages are actionable
