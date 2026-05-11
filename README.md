# Agent Env Switcher

Local-first AI profile manager for macOS.

## Positioning

Agent Env Switcher is a local-first AI profile manager for switching AI provider and target environment profiles without cloud sync, account systems, telemetry, keychain reads, browser data reads, or system-wide configuration changes by default.

## Target Stack

- Tauri
- React
- TypeScript
- shadcn/ui

This repository is initialized as a project skeleton and specification package only. It does not contain the application implementation yet.

## Covered Providers And Targets

- Claude Code
- Hermes
- OpenClaw
- OpenAI-compatible API
- DeepSeek
- Kimi
- OpenAI
- Gemini-compatible endpoint
- local LLM Gateway

## MVP Scope

- Multiple local profiles
- Active profile switching
- Dry-run preview before changes
- Backup and restore
- Script generation
- Target support for the listed providers and tools

## Safety Principles

- Local-first by default
- No cloud sync
- No uploaded secrets
- No system configuration changes by default
- No keychain reads
- No browser data reads
- No process killing
- External configuration changes must follow: dry-run, backup, apply

## Explicit Non-Goals

- Cloud sync
- Account system
- Telemetry
- App Store release
- Notarization in MVP
- SwiftUI as the primary app approach
- Electron

## macOS Release Strategy

Initial distribution target is GitHub Releases. First-open documentation must explain macOS Gatekeeper behavior and the manual open flow for unsigned or non-notarized builds.

## Project Flow

The project follows a mini-spec-kit inspired flow:

1. Requirements
2. Design
3. Tasks
4. Acceptance
5. Implementation

See `.mini-spec-kit/` for the current project constraints, module specification, implementation plan, checklist, gate, and verification log.
