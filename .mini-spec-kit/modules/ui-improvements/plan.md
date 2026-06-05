# UI Improvements Implementation Plan

## Module: ui-improvements

### Task List

#### Phase A: Remove Dashboard & Unnecessary Menu Items

- [ ] **A1**: Remove Dashboard route and component
  - Delete `src/pages/Dashboard.tsx`
  - Remove `/` route from `src/App.tsx`
  - Update default route to redirect to `/hermes`
  - Remove "仪表盘" from sidebar navItems

- [ ] **A2**: Remove unnecessary menu items
  - Remove "配置文件" (Profiles) from sidebar
  - Remove "目标信息" (Targets Info) from sidebar
  - Remove "模拟运行" (Dry Run) from sidebar
  - Remove corresponding routes from App.tsx
  - Optionally delete unused page components

#### Phase B: Minimalist Brand Icons

- [ ] **B1**: Research brand identities
  - Hermes: horse/herald icon, blue/white
  - Claude Code: Anthropic/Claude styling
  - CodeX: OpenAI branding
  - OpenClaw: claw/talon icon

- [ ] **B2**: Create SVG icon components
  - Create `src/components/icons/HermesIcon.tsx`
  - Create `src/components/icons/ClaudeCodeIcon.tsx`
  - Create `src/components/icons/CodexIcon.tsx`
  - Create `src/components/icons/OpenClawIcon.tsx`
  - Each icon: 24x24 viewBox, inline SVG, brand colors
  - Support light/dark mode via currentColor or CSS variables

- [ ] **B3**: Apply icons to sidebar
  - Replace Lucide Bot/Terminal/Box/Bug icons with custom SVGs
  - Update Dashboard cards if Dashboard still existed (it won't)

#### Phase C: Drag-and-Drop Reordering

- [ ] **C1**: Install DnD dependencies
  - `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

- [ ] **C2**: Create sortable sidebar component
  - Create `src/components/layout/SortableTargetItem.tsx`
  - Create `src/components/layout/SortableTargetList.tsx`
  - Implement drag handle, visual feedback
  - Only target items are draggable

- [ ] **C3**: Implement persistence
  - localStorage key: `sidebar-target-order`
  - Default order: hermes, claude-code, codex, openclaw
  - Load order on mount, save on change
  - Create `src/lib/sidebarOrder.ts` utility

- [ ] **C4**: Integrate into Sidebar
  - Replace static target list with SortableTargetList
  - Wrap with DndContext and SortableContext

#### Phase D: Rename Updates & Add App Update

- [ ] **D1**: Rename "更新" to "Agent 更新"
  - Update zh.json: `sidebar.updates` → "Agent 更新"
  - Update en.json: `sidebar.updates` → "Agent Updates"

- [ ] **D2**: Add "更新应用" section in Settings
  - Create `src/components/AppUpdateSection.tsx`
  - Add to Settings page as new Card
  - Show current version from package.json
  - Implement update logic (git pull + build)
  - Add progress/status UI
  - Add i18n translations

#### Phase E: i18n Updates

- [ ] **E1**: Update English translations (en.json)
  - Remove dashboard keys
  - Remove profiles/targetsInfo/dryRun sidebar keys
  - Add appUpdate section keys
  - Update settings section keys

- [ ] **E2**: Update Chinese translations (zh.json)
  - Same changes as en.json
  - Ensure consistent naming

#### Phase F: Cleanup & Testing

- [ ] **F1**: Remove unused imports
  - Clean up App.tsx imports
  - Remove unused icon imports from Sidebar

- [ ] **F2**: Test build
  - `npm run build` — no TypeScript errors
  - `npm run dev` — app runs correctly
  - Verify all routes work
  - Verify drag-and-drop persists
  - Verify icons render in light/dark mode

### Dependencies

- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities

### Files to Modify

- `src/App.tsx` — remove routes
- `src/components/layout/Sidebar.tsx` — icons, DnD, menu changes
- `src/pages/Settings.tsx` — add app update section
- `src/i18n/locales/en.json` — translation updates
- `src/i18n/locales/zh.json` — translation updates
- `src/pages/Dashboard.tsx` — DELETE
- `src/pages/Profiles.tsx` — DELETE (optional)
- `src/pages/Targets.tsx` — DELETE (optional)
- `src/pages/DryRun.tsx` — DELETE (optional)

### Files to Create

- `src/components/icons/HermesIcon.tsx`
- `src/components/icons/ClaudeCodeIcon.tsx`
- `src/components/icons/CodexIcon.tsx`
- `src/components/icons/OpenClawIcon.tsx`
- `src/components/layout/SortableTargetItem.tsx`
- `src/components/layout/SortableTargetList.tsx`
- `src/components/AppUpdateSection.tsx`
- `src/lib/sidebarOrder.ts`

---

## Analysis Report

### Critical Issues

**None identified.** The implementation plan is feasible with the current codebase.

### Potential Risks

1. **DnD Package Compatibility**: `@dnd-kit` works well with React 18 and Radix UI. No conflicts expected.
   - **Mitigation**: Install and test early in Phase C.

2. **Route Removal Impact**: Removing Dashboard route may affect deep links or browser history.
   - **Mitigation**: Add redirect from `/` to `/hermes` to preserve compatibility.

3. **Icon Rendering in Dark Mode**: Custom SVGs must handle both themes.
   - **Mitigation**: Use `currentColor` for foreground elements, CSS variables for brand colors.

4. **localStorage Persistence**: Drag order stored in localStorage may be cleared.
   - **Mitigation**: Graceful fallback to default order if localStorage is empty.

5. **App Update Implementation**: Running shell commands from Tauri requires careful sandboxing.
   - **Mitigation**: Use Tauri's shell plugin with allowlist, or implement as future enhancement with placeholder UI.

### Architectural Notes

- No changes to Tauri backend required for Phase A-D
- Phase D2 (App Update) may require Tauri shell plugin — verify if already configured
- All new components follow existing patterns (shadcn/ui cards, Tailwind classes)

### Decision Points

1. **App Update Implementation**: 
   - Option A: Use Tauri updater plugin (requires plugin setup)
   - Option B: Placeholder UI with "coming soon" (simpler, can be enhanced later)
   - **Recommendation**: Option B for now — implement placeholder UI, actual update logic can be added later

2. **Dashboard Deletion**:
   - Option A: Delete file entirely
   - Option B: Keep as unused backup
   - **Recommendation**: Option A — clean deletion, git history preserves if needed

### Recommendation

**PROCEED TO IMPLEMENTATION.** No critical issues found. All risks are manageable.
