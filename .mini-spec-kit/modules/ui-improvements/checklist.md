# UI Improvements Checklist

## Phase A: Remove Dashboard & Unnecessary Menu Items

- [x] A1.1: Dashboard.tsx deleted
- [x] A1.2: Dashboard route removed from App.tsx
- [x] A1.3: Default route `/` redirects to `/hermes`
- [x] A1.4: "仪表盘" removed from sidebar navItems
- [x] A2.1: "配置文件" (Profiles) removed from sidebar
- [x] A2.2: "目标信息" (Targets Info) removed from sidebar
- [x] A2.3: "模拟运行" (Dry Run) removed from sidebar
- [x] A2.4: Corresponding routes removed from App.tsx
- [ ] A2.5: Unused page components deleted (optional)

## Phase B: Minimalist Brand Icons

- [x] B1.1: Brand research documented
- [x] B2.1: HermesIcon.tsx created
- [x] B2.2: ClaudeCodeIcon.tsx created
- [x] B2.3: CodexIcon.tsx created
- [x] B2.4: OpenClawIcon.tsx created
- [x] B2.5: Icons use 24x24 viewBox
- [x] B2.6: Icons support light/dark mode
- [x] B3.1: Icons applied to sidebar

## Phase C: Drag-and-Drop Reordering

- [x] C1.1: @dnd-kit/core installed
- [x] C1.2: @dnd-kit/sortable installed
- [x] C1.3: @dnd-kit/utilities installed
- [x] C2.1: SortableTargetItem.tsx created
- [x] C2.2: SortableTargetList.tsx created
- [x] C2.3: Drag handle implemented
- [x] C2.4: Visual feedback during drag
- [x] C3.1: sidebarOrder.ts utility created
- [x] C3.2: localStorage persistence implemented
- [x] C3.3: Default order: hermes, claude-code, codex, openclaw
- [x] C3.4: Order survives page reload
- [x] C4.1: Sidebar uses SortableTargetList
- [x] C4.2: DndContext and SortableContext integrated

## Phase D: Rename Updates & Add App Update

- [x] D1.1: zh.json "更新" → "Agent 更新"
- [x] D1.2: en.json "Updates" → "Agent Updates"
- [x] D2.1: AppUpdateSection.tsx created
- [x] D2.2: Current version displayed
- [x] D2.3: Update logic implemented
- [x] D2.4: Progress/status UI added
- [x] D2.5: Section added to Settings page

## Phase E: i18n Updates

- [x] E1.1: en.json dashboard keys removed
- [x] E1.2: en.json sidebar keys updated
- [x] E1.3: en.json appUpdate keys added
- [x] E2.1: zh.json dashboard keys removed
- [x] E2.2: zh.json sidebar keys updated
- [x] E2.3: zh.json appUpdate keys added

## Phase F: Cleanup & Testing

- [x] F1.1: Unused imports cleaned up
- [x] F1.2: Sidebar imports updated
- [x] F2.1: `npm run build` — no TypeScript errors
- [ ] F2.2: `npm run dev` — app runs correctly
- [ ] F2.3: All routes work
- [ ] F2.4: Drag-and-drop persists after reload
- [ ] F2.5: Icons render in light mode
- [ ] F2.6: Icons render in dark mode
- [x] F2.7: "Agent 更新" label correct
- [x] F2.8: "更新应用" section in Settings
