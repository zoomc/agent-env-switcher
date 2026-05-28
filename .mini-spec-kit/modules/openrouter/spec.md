# OpenRouter Module Spec

## Requirement

Manage OpenRouter API key and provide a free model discovery interface. Users can view free models, select one, and apply it to all configured targets simultaneously.

## Scope

- OpenRouter API key management
- Free model list fetched from OpenRouter API
- One-click apply to all 4 targets
- Auto-update script reference

## REQ IDs

- REQ-OR-01: OpenRouter key input/display with masking
- REQ-OR-02: Fetch free models from OpenRouter API
- REQ-OR-03: Display model list with name, context length, modality
- REQ-OR-04: One-click apply selected free model to all targets
- REQ-OR-05: Auto-update script for periodic refresh

## Non-Goals

- Real API connections during development (mock data)
- Actual model inference
- Usage tracking

## Acceptance Criteria

- OpenRouter key is stored and masked in display
- Free model list displays correctly
- Selected model can be applied to all targets
- Apply flow follows dry-run -> backup -> apply
