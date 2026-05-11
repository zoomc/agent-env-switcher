# Project Constraints

## Product Positioning

Agent Env Switcher is a local-first AI profile manager for macOS.

## Fixed Technology Stack

- Tauri
- React
- TypeScript
- shadcn/ui

## Default Data Policy

- Store configuration locally by default.
- Do not cloud sync.
- Do not upload secrets.
- Do not read macOS Keychain.
- Do not read browser storage, cookies, profiles, or history.
- Do not change system configuration by default.

## External Configuration Policy

Any external target configuration operation must follow:

1. Dry-run
2. Backup
3. Apply
4. Verify
5. Restore path available

## Process Policy

- Do not kill processes.
- Do not restart user tools automatically.
- Provide generated scripts when direct changes are risky or user approval is needed.

## Provider And Target Coverage

- Claude Code
- Hermes
- OpenClaw
- OpenAI-compatible API
- DeepSeek
- Kimi
- OpenAI
- Gemini-compatible endpoint
- local LLM Gateway

## Explicit Non-Goals

- Cloud sync
- Account system
- Telemetry
- App Store release
- Notarization in MVP
- SwiftUI as the primary implementation path
- Electron

## macOS Release Constraint

MVP release channel is GitHub Release. Documentation must include first-open Gatekeeper instructions for unsigned or non-notarized builds.
