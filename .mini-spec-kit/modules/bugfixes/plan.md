# Bug Fixes Plan

## Task 1: REQ-001 — OpenRouter Per-Row Apply Buttons

**File:** `src/pages/OpenRouter.tsx`

**Changes:**
1. Add an "Apply" button (`Button` component) inside each model row's flex container (line 119-130 area)
2. The button calls a modified apply handler that takes a model ID directly (no selection needed)
3. Remove the conditional card at lines 137-169 (the separate select-then-apply pattern)
4. Keep the `applyResult` state and display it after the model list
5. Show result as an inline notification below the model list

**Estimated diff:** ~40 lines changed

---

## Task 2: REQ-002 — Dashboard Wording Fix

**File:** `src/pages/Dashboard.tsx`

**Changes:**
1. Line 116: Change `Legacy Active: {activeProfile.name}` → `Active Profile: {activeProfile.name}`
2. Line 211: Change `Legacy profile management` → `Profile management`

**Estimated diff:** 2 lines changed

---

## Task 3: REQ-003 — KeyInput Always Visible

**File:** `src/components/KeyInput.tsx`

**Changes:**
1. Remove the `showKey` conditional rendering (lines 38-53)
2. Always render an `<input>` element with `type={showKey ? "text" : "password"}`
3. Keep the eye icon toggle for show/hide
4. Remove the `<code>` masked display entirely

**Estimated diff:** ~15 lines changed

---

## Task 4: REQ-004 — DMG Documentation

**File:** No code changes. Add a note in conversation output only.

**Changes:**
1. Document that DMG bundling requires `create-dmg` (`brew install create-dmg`)
2. This is a known limitation, not a code bug

**Estimated diff:** 0 lines (documentation only)
