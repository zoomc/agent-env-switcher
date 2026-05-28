# Bug Fixes Spec

## REQ-001: OpenRouter "Apply to All Targets" — Per-Row Apply Buttons

**Current state:** OpenRouter page has a select-then-apply pattern: user clicks a model row to select it, then a separate "Apply to All Targets" card appears with a single button. This requires two clicks and is not discoverable.

**Required change:** Add an "Apply" button directly to each free model row. When clicked:
1. Take that row's model ID
2. Create/update profiles in Hermes, Claude Code, Codex, and OpenClaw with that model as the `defaultModel`
3. Show a toast/notification with the result summary
4. Do NOT write to real config files — just update the app's internal profile storage

**Files:** `src/pages/OpenRouter.tsx`

**Acceptance criteria:**
- [ ] Each free model row has an "Apply" button
- [ ] Clicking "Apply" triggers `handleApplyToAll` for that specific model
- [ ] The separate select-then-apply card is removed (the per-row button replaces it)
- [ ] A result summary is shown after applying (reuse existing result display)
- [ ] No real config files are modified — only internal state

---

## REQ-002: Dashboard "Legacy Active" Wording Fix

**Current state:** Dashboard shows "Legacy Active: {name}" as a heading, and "Legacy profile management" as a card description.

**Required change:** Replace "Legacy Active:" with "Active Profile:" and "Legacy profile management" with "Profile management".

**Files:** `src/pages/Dashboard.tsx`

**Acceptance criteria:**
- [ ] Line 116: "Legacy Active:" → "Active Profile:"
- [ ] Line 211: "Legacy profile management" → "Profile management"
- [ ] No other "Legacy" references remain in the UI

---

## REQ-003: KeyInput Always Visible with Password Toggle

**Current state:** KeyInput component hides the input field entirely when `showKey=false`. User must click an eye icon to reveal an editable text input. This is not obvious and prevents direct editing.

**Required change:** Always render a password-style input (`type="password"`). Keep the eye icon toggle to switch between `type="password"` and `type="text"`. Remove the masked `<code>` display entirely.

**Files:** `src/components/KeyInput.tsx`

**Acceptance criteria:**
- [ ] Input field is always visible and editable
- [ ] Default state shows password dots (type="password")
- [ ] Eye icon toggles between password and plain text
- [ ] The `(not set)` masked code display is removed
- [ ] Label and layout remain consistent

---

## REQ-004: DMG Bundling Documentation

**Current state:** `npx tauri build` fails at DMG bundling because `create-dmg` is not installed. The system has `hdiutil` but Tauri's bundle script requires `create-dmg`.

**Required change:** Document this as a known limitation. Do not attempt system-level changes.

**Files:** `README.md` or project docs (if applicable)

**Acceptance criteria:**
- [ ] Note added about DMG bundling requiring `create-dmg`
- [ ] Install command documented: `brew install create-dmg`
- [ ] No system-level changes made
