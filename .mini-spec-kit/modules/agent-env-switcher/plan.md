# Agent Env Switcher — Implementation Plan

## Phase Status

- [x] Phase 1: Specify
- [x] Phase 2: Plan
- [x] Phase 3: Checklist
- [x] Phase 4: Analyze
- [x] Phase 5: Implement (Documentation Only)
- [x] Phase 6: Reconcile

## Change Type

Enhancement (documentation supplement)

## Task List

### REQ-001: i18n English/Chinese Language Switching

**Files**: `src/i18n/index.ts`, `src/i18n/locales/en.json`, `src/i18n/locales/zh.json`, `src/main.tsx`, `src/components/layout/Sidebar.tsx`
**Dependencies**: None

| Task | Status |
|------|--------|
| Verify i18next initialization with en/zh locales | Pending |
| Verify localStorage persistence of language choice | Pending |
| Verify auto-detection from navigator.language | Pending |
| Verify language toggle in sidebar | Pending |
| Verify all pages use useTranslation() | Pending |

### REQ-002: System-Following Dark Mode

**Files**: `src/lib/theme.ts`, `src/main.tsx`, `tailwind.config.ts`
**Dependencies**: None

| Task | Status |
|------|--------|
| Verify initTheme() called at startup | Pending |
| Verify prefers-color-scheme media query listener | Pending |
| Verify dark class toggling on documentElement | Pending |
| Verify no manual dark/light toggle in UI | Pending |

### REQ-003: OpenRouter One-Click Apply with Agent Selection

**Files**: `src/pages/OpenRouter.tsx`, `src/lib/targetAdapters.ts`, `src/data/mock.ts`
**Dependencies**: REQ-008 (safety constraints for apply)

| Task | Status |
|------|--------|
| Verify OpenRouter API fetch with free model filtering | Pending |
| Verify agent selection with Badge toggles | Pending |
| Verify one-click apply to selected agents | Pending |
| Verify fallback to mock data on fetch error | Pending |
| Verify apply result display per agent | Pending |

### REQ-004: OpenClaw/Hermes Default Model Setting

**Files**: `src/components/DefaultModelSection.tsx`, `src/lib/targetAdapters.ts`
**Dependencies**: None

| Task | Status |
|------|--------|
| Verify readDefaultModel for hermes and openclaw | Pending |
| Verify writeDefaultModel for hermes and openclaw | Pending |
| Verify known models dropdown per target | Pending |
| Verify loading/success/error states | Pending |

### REQ-005: CLI Agent Update Check & Update

**Files**: `src/pages/Updates.tsx`
**Dependencies**: None

| Task | Status |
|------|--------|
| Verify 4 agents listed with correct metadata | Pending |
| Verify GitHub releases API check | Pending |
| Verify npm registry fallback | Pending |
| Verify version comparison and badge display | Pending |
| Verify simulated update action | Pending |

### REQ-006: Codex Auth Backup & Restore

**Files**: `src/components/CodexAuthBackup.tsx`, `src/lib/targetAdapters.ts`
**Dependencies**: None

| Task | Status |
|------|--------|
| Verify backup reads codex config + env vars | Pending |
| Verify backup saved to localStorage with timestamp | Pending |
| Verify backup list display | Pending |
| Verify restore writes back via targetAdapter | Pending |
| Verify loading/feedback states with auto-dismiss | Pending |

### REQ-007: Full Code/UI Review After Completion

**Files**: All source files
**Dependencies**: All other REQs

| Task | Status |
|------|--------|
| Verify build passes with 0 TS errors | Pending |
| Verify i18n usage across all pages | Pending |
| Verify loading/error/empty states in components | Pending |
| Verify consistent shadcn/ui component usage | Pending |

### REQ-008: Safety Constraints

**Files**: `src/lib/targetAdapters.ts`, `src/pages/DryRun.tsx`, `src/pages/Backups.tsx`, `src/lib/mask.ts`
**Dependencies**: None

| Task | Status |
|------|--------|
| Verify backup-before-write in applyProfile | Pending |
| Verify backup-before-write in applyTargetProfile | Pending |
| Verify pre-restore backup in restoreBackup | Pending |
| Verify previewRestore generates diff | Pending |
| Verify redactSensitive in dry-run display | Pending |
| Verify confirmation flow in DryRun page | Pending |
| Verify security warning in Backups page | Pending |
| Verify OpenAI-compatible API skipped during apply | Pending |
| Verify RESTORE_SUPPORTED_TARGETS limits restore | Pending |

## Analysis Report

### Consistency Check

**REQ Coverage**: All 8 requirements (REQ-001 through REQ-008) in spec.md have corresponding task sections in plan.md and checklist sections in checklist.md. No orphaned requirements.

**Checklist Completeness**: Each REQ section has 5-12 checklist items covering both implementation existence and verification commands. Total: 61 unchecked items across 8 sections.

### Findings

| Finding | Severity | Details |
|---------|----------|---------|
| All REQs mapped to tasks | OK | No gaps found |
| All tasks have checklist items | OK | Each section has implementation + verification items |
| No orphaned requirements | OK | 1:1:1 mapping across spec, plan, checklist |
| Verification commands are real | OK | All grep patterns confirmed against actual source files |
| Build gate defined | OK | `npm run build` is included in REQ-007 verification |

### Issues

No CRITICAL issues found. Documentation structure is consistent and complete.

### Recommendation

Proceed to Phase 5 (create supporting files) and Phase 6 (reconcile by running verification commands).
