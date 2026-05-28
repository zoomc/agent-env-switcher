# Bug Fixes Checklist

## REQ-001: OpenRouter Per-Row Apply Buttons
- [x] Each model row has an "Apply" button
- [x] Button triggers apply handler with the row's model ID
- [x] Select-then-apply card is removed
- [x] Result summary displayed after applying
- [x] No real config files modified
- [x] TypeScript compiles without errors

## REQ-002: Dashboard Wording Fix
- [x] "Legacy Active:" replaced with "Active Profile:"
- [x] "Legacy profile management" replaced with "Profile management"
- [x] No other "Legacy" references in UI text

## REQ-003: KeyInput Always Visible
- [x] Input field always rendered (not conditionally hidden)
- [x] Default type is "password" (dots shown)
- [x] Eye icon toggles between password and text
- [x] Masked `<code>` display removed
- [x] Label and layout consistent

## REQ-004: DMG Documentation
- [x] Documented that `create-dmg` is required for DMG bundling
- [x] Install command provided: `brew install create-dmg`
- [x] No system-level changes made

## Build Verification
- [x] `npx tsc --noEmit` passes with zero errors
- [x] `npx vite build` succeeds
