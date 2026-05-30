# Agent Env Switcher — Checklist

## REQ-001: i18n English/Chinese Language Switching

**Implementation**:
- [x] `src/i18n/index.ts` exists and exports i18next instance
- [x] `src/i18n/locales/en.json` exists with translation keys
- [x] `src/i18n/locales/zh.json` exists with translation keys
- [x] `src/main.tsx` imports `./i18n`
- [x] `src/components/layout/Sidebar.tsx` has language toggle button

**Verification**:
- [x] `grep -n "initReactI18next" src/i18n/index.ts` returns matches
- [x] `grep -n "agent-env-switcher:language" src/i18n/index.ts` returns matches
- [x] `grep -n "navigator.language" src/i18n/index.ts` returns matches
- [x] `grep -n "toggleLang\|changeLanguage" src/components/layout/Sidebar.tsx` returns matches
- [x] `grep -rn "useTranslation" src/pages/ | wc -l` returns ≥ 20

**Verified on**: ___

## REQ-002: System-Following Dark Mode

**Implementation**:
- [x] `src/lib/theme.ts` exists and exports `initTheme`
- [x] `src/main.tsx` calls `initTheme()` before render

**Verification**:
- [x] `grep -n "prefers-color-scheme" src/lib/theme.ts` returns matches
- [x] `grep -n "classList.toggle.*dark" src/lib/theme.ts` returns matches
- [x] `grep -n "addEventListener.*change" src/lib/theme.ts` returns matches
- [x] `grep -n "initTheme()" src/main.tsx` returns matches
- [x] `grep -rn "darkMode" tailwind.config.ts` returns matches

**Verified on**: ___

## REQ-003: OpenRouter One-Click Apply with Agent Selection

**Implementation**:
- [x] `src/pages/OpenRouter.tsx` exists with full OpenRouter page
- [x] `src/data/mock.ts` exports `exampleFreeModels` fallback

**Verification**:
- [x] `grep -n "openrouter.ai/api/v1/models" src/pages/OpenRouter.tsx` returns matches
- [x] `grep -n "pricing.*prompt.*0" src/pages/OpenRouter.tsx` returns matches
- [x] `grep -n "toggleAgent\|selectedAgents" src/pages/OpenRouter.tsx` returns matches
- [x] `grep -n "handleApplyToSelected" src/pages/OpenRouter.tsx` returns matches
- [x] `grep -n "applyTargetProfileChanges" src/pages/OpenRouter.tsx` returns matches
- [x] `grep -n "exampleFreeModels" src/pages/OpenRouter.tsx` returns matches

**Verified on**: ___

## REQ-004: OpenClaw/Hermes Default Model Setting

**Implementation**:
- [x] `src/components/DefaultModelSection.tsx` exists with model selector UI
- [x] `src/lib/targetAdapters.ts` exports `readDefaultModel` and `writeDefaultModel`

**Verification**:
- [x] `grep -n "export async function readDefaultModel" src/lib/targetAdapters.ts` returns matches
- [x] `grep -n "export async function writeDefaultModel" src/lib/targetAdapters.ts` returns matches
- [x] `grep -n "knownModels" src/components/DefaultModelSection.tsx` returns matches
- [x] `grep -n "loading.*setting\|result.*success\|result.*error" src/components/DefaultModelSection.tsx` returns matches

**Verified on**: ___

## REQ-005: CLI Agent Update Check & Update

**Implementation**:
- [x] `src/pages/Updates.tsx` exists with update management UI

**Verification**:
- [x] `grep -n "api.github.com/repos" src/pages/Updates.tsx` returns matches
- [x] `grep -n "registry.npmjs.org" src/pages/Updates.tsx` returns matches
- [x] `grep -n "claude-code\|codex\|hermes\|openclaw" src/pages/Updates.tsx | grep "id:" | wc -l` returns 4
- [x] `grep -n "updateAvailable\|upToDate" src/pages/Updates.tsx` returns matches
- [x] `grep -n "simulateUpdate" src/pages/Updates.tsx` returns matches

**Verified on**: ___

## REQ-006: Codex Auth Backup & Restore

**Implementation**:
- [x] `src/components/CodexAuthBackup.tsx` exists with backup/restore UI

**Verification**:
- [x] `grep -n "codex-auth-backups" src/components/CodexAuthBackup.tsx` returns matches
- [x] `grep -n "handleBackup" src/components/CodexAuthBackup.tsx` returns matches
- [x] `grep -n "handleRestore" src/components/CodexAuthBackup.tsx` returns matches
- [x] `grep -n "targetAdapter.read.*codex" src/components/CodexAuthBackup.tsx` returns matches
- [x] `grep -n "targetAdapter.write.*codex" src/components/CodexAuthBackup.tsx` returns matches
- [x] `grep -n "setTimeout.*setResult.*null" src/components/CodexAuthBackup.tsx` returns matches

**Verified on**: ___

## REQ-007: Full Code/UI Review After Completion

**Implementation**:
- [x] All pages use `useTranslation()` for i18n
- [x] Build passes with 0 TypeScript errors

**Verification**:
- [x] `npm run build` exits with code 0
- [x] `grep -rn "useTranslation" src/pages/ | wc -l` returns ≥ 20
- [x] `grep -rn "any" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules\|\.d\.ts\|as any" | wc -l` returns low count (≤ 5)

**Verified on**: ___

## REQ-008: Safety Constraints

**Implementation**:
- [x] `src/lib/targetAdapters.ts` implements backup-before-write in apply functions
- [x] `src/pages/DryRun.tsx` implements confirmation flow
- [x] `src/pages/Backups.tsx` shows security warning
- [x] `src/lib/mask.ts` exports `redactSensitive` and `maskApiKey`

**Verification**:
- [x] `grep -n "backup.*= await targetAdapter.backup" src/lib/targetAdapters.ts` returns matches
- [x] `grep -n "preRestoreBackup" src/lib/targetAdapters.ts` returns matches
- [x] `grep -n "confirmApply" src/pages/DryRun.tsx` returns matches
- [x] `grep -n "securityWarning" src/pages/Backups.tsx` returns matches
- [x] `grep -n "skipped.*environment variable" src/lib/targetAdapters.ts` returns matches
- [x] `grep -n "RESTORE_SUPPORTED_TARGETS" src/types/index.ts` returns matches
- [x] `grep -n "export function redactSensitive" src/lib/mask.ts` returns matches
- [x] `grep -n "export function maskApiKey" src/lib/mask.ts` returns matches
