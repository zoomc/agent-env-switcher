# OpenRouter Checklist

## Data Model

- [x] FreeModel type defined (src/types/index.ts)
- [x] Mock free model data created (src/data/mock.ts)
- [x] OpenRouter key storage via KeyInput component

## UI

- [x] OpenRouter page renders (src/pages/OpenRouter.tsx)
- [x] Key input with masking (src/components/KeyInput.tsx)
- [x] Free model list displays (src/pages/OpenRouter.tsx)
- [x] Model selection works (src/pages/OpenRouter.tsx)
- [x] One-click apply button (src/pages/OpenRouter.tsx)

## Integration

- [x] Apply updates Hermes config (via applyTargetProfileChanges)
- [x] Apply updates Claude Code config (via applyTargetProfileChanges)
- [x] Apply updates Codex config (via applyTargetProfileChanges)
- [x] Apply updates OpenClaw config (via applyTargetProfileChanges)

## Security

- [x] API key masked in display (KeyInput component)
- [x] No full key in console/logs
