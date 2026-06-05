# UI Improvements Specification

## Module: ui-improvements

### Overview

Improve the Agent Env Switcher UI with minimalist brand icons, streamlined navigation, drag-and-drop reordering, and an app update feature.

### Requirements

#### REQ-01: Minimalist Icons for 4 Targets

**Description**: Replace generic Lucide icons with minimalist, recognizable brand icons for Hermes, Claude Code, CodeX, and OpenClaw.

**Acceptance Criteria**:
- Research official brand identity for each target (colors, shapes, key elements)
- Create 4 custom SVG icons (24x24 or 32x32) that are:
  - Recognizable as the original brand but minimalist
  - Crisp in both light and dark mode
  - Use original brand color palette
- Apply icons to sidebar navigation and Dashboard target cards
- Icons must be inline SVG (no external file dependencies)

#### REQ-02: Remove Dashboard

**Description**: Remove the Dashboard/Home page entirely. App should open directly to Hermes target configuration.

**Acceptance Criteria**:
- Remove `/` route for Dashboard
- Remove Dashboard.tsx page component
- Remove sidebar "仪表盘" menu item
- Default route `/` redirects to `/hermes` (or `/hermes` is the default)
- App opens directly to Hermes target configuration view

#### REQ-03: Drag-and-Drop Reordering for Sidebar Targets

**Description**: The 4 targets in the left sidebar must support drag-and-drop reordering.

**Acceptance Criteria**:
- Install `@dnd-kit/core` and `@dnd-kit/sortable` packages
- Implement drag handle on target items in sidebar
- Default order: Hermes, Claude Code, CodeX, OpenClaw
- Persist order to localStorage (key: `sidebar-target-order`)
- Order survives page reload
- Visual feedback during drag (ghost, highlight drop zone)
- Only target items are draggable (not dividers or other menu items)

#### REQ-04: Remove Unnecessary Menu Items

**Description**: Remove 3 menu items from the sidebar tools section.

**Acceptance Criteria**:
- Remove "配置文件" (Profiles) — target config is per-target
- Remove "目标信息" (Targets Info) — no useful purpose
- Remove "模拟运行" (Dry Run) — no useful purpose
- Keep: 备份 (Backups), 更新 (Updates), 设置 (Settings)
- Remove corresponding routes from App.tsx
- Remove or keep page components (can be deleted if unused)

#### REQ-05: Rename "更新" to "Agent 更新"

**Description**: Rename the "更新" sidebar item to "Agent 更新" to distinguish from app updates.

**Acceptance Criteria**:
- Update sidebar label from "更新" to "Agent 更新" (zh)
- Update sidebar label from "Updates" to "Agent Updates" (en)
- Update i18n translation keys accordingly

#### REQ-06: Add "更新应用" in Settings

**Description**: Add a new "App Update" section in Settings for updating the application itself.

**Acceptance Criteria**:
- Add new Card section in Settings page: "更新应用" (App Update)
- Show current app version
- Implement update functionality using one of:
  - Option A: Tauri updater plugin (if configured)
  - Option B: Custom shell command: `git pull && npm install && npm run build && cargo tauri build`
- Show update progress (loading spinner, status messages)
- Show success/error states
- Separate from "Agent 更新" which updates agent configs
- Add i18n translations for new section

### Non-Goals

- Modifying system configuration
- Changing the underlying data model
- Adding new AI target types
- Modifying backup/restore functionality
- Changing the Tauri backend logic

### Constraints

- Keep Tauri + React + TypeScript + shadcn/ui as the fixed stack
- All changes must be backwards compatible with existing config files
- No breaking changes to existing functionality
- Icons must work in both light and dark mode
- Drag-and-drop order must persist across sessions
