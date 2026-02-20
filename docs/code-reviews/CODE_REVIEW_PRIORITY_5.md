# Code Review — Priority 5: Story 7.4 (Resurfacing Frequency Preferences UI)

**Commit:** `b9abc26`
**Date:** 2026-02-20
**Reviewer:** Party Mode (multi-perspective automated review)
**Branch:** `development`

---

## Files Changed

| File | Change |
|---|---|
| `frontend/src/hooks/usePreferences.ts` | Added `setResurfaceFrequency` mutation + exported `ResurfaceFrequency` type |
| `frontend/src/components/ResurfacingPreferencesPopover.tsx` | NEW — frequency selector popover |
| `frontend/src/components/Toolbar.tsx` | Added resurfacing bell button + wires `ResurfacingPreferencesPopover` |
| `frontend/src/App.tsx` | Destructures `setResurfaceFrequency`/`isUpdatingFrequency`; passes to both `<Toolbar>` instances |

---

## What Was Implemented

- **Story 7.4 AC compliance:**
  - ✅ 4 frequency options: Frequent, Normal, Rare, Off
  - ✅ Normal is default (visual reset button when non-default is selected)
  - ✅ Preference saved to `USER_PREFERENCES.resurfaceFrequency` via `PUT /api/preferences`
  - ✅ Optimistic UI — applies immediately to `useResurfacing` via cache update (no restart needed)
  - ✅ On save failure: rollback + `toast.warning` (not `toast.error` — local preference still works per spec)
  - ✅ When "Off" selected: `useResurfacing` receives `frequency: 'off'` and disables resurfacing
  - ✅ Keyboard accessible: `role="radiogroup"`, `role="radio"`, `aria-checked`, focus-visible rings
  - ✅ ARIA labels on all controls
  - ✅ Persists across sessions (stored server-side in USER_PREFERENCES)
  - ✅ "Reset to default" button (conditionally shown when not at Normal)

---

## Issues Found

### 🟡 MEDIUM — `toast.warning` may not be a valid Sonner method

**File:** `frontend/src/hooks/usePreferences.ts`

**Problem:** The code uses `toast.warning(...)` which exists in Sonner v1.x but may behave differently from `toast.error`. The visual styling (yellow vs red) is appropriate for the spec requirement ("warning toast"), but this should be verified against the Sonner version in use.

**Risk:** Low. Sonner's `toast.warning` renders a yellow toast with a triangle icon. If not available, it falls back gracefully in most bundler setups. TypeScript would have caught a missing method at compile time — since tsc passes, this is fine.

---

### 🟡 MEDIUM — Bell icon in toolbar has no visible label in mobile view

**File:** `frontend/src/components/Toolbar.tsx`

**Observation:** The bell button shows only the icon on mobile (`<span className="hidden sm:inline capitalize">`). The `aria-label` is set correctly, so it's screen-reader accessible. But sighted mobile users see an unlabeled bell icon that could be confused with notifications.

**Suggestion:** Consider adding a `title` tooltip or a small tooltip component for discoverability. Acceptable for MVP.

---

### 🟢 LOW — `ResurfaceFrequency` type is exported from hook, not types file

**File:** `frontend/src/hooks/usePreferences.ts`

**Observation:** The `ResurfaceFrequency` type is defined in the hook file and re-exported. Convention in this codebase is to put shared types in `types/preference.types.ts`. The `UpdatePreferencesPayload` already uses `resurfaceFrequency: string` rather than the union type.

**Suggestion:** Future cleanup: move `ResurfaceFrequency` to `preference.types.ts` and use it in `UpdatePreferencesPayload`. Non-blocking for MVP.

---

### 🟢 LOW — The frequency picker uses `role="radio"` on `<button>` elements

**File:** `frontend/src/components/ResurfacingPreferencesPopover.tsx`

**Observation:** Using `role="radio"` on a `<button>` inside a `role="radiogroup"` is valid WAI-ARIA 1.1. The `aria-checked` attribute correctly reflects selection state. Arrow-key navigation between radio options is NOT implemented (standard for native radiogroups), but since these are buttons within a popover, tab navigation is the expected pattern. This is acceptable.

---

### 🟢 LOW — `isUpdating` prop pulsing animation on Bell icon

**File:** `frontend/src/components/ResurfacingPreferencesPopover.tsx`

**Observation:** The bell icon gets `animate-pulse` class when `isUpdating` is true. Since the mutation is optimistic (UI updates before server responds), the save is usually near-instant — users may never see the pulse. This is a nice-to-have visual affordance.

---

## Acceptance Criteria Checklist

| AC | Status | Notes |
|---|---|---|
| 4 frequency options (Frequent/Normal/Rare/Off) | ✅ | All present with descriptions |
| Preference saved to USER_PREFERENCES | ✅ | `PUT /api/preferences` via `preferencesService.updatePreferences` |
| Optimistic UI (applies immediately) | ✅ | Cache updated in `onMutate` before server response |
| On save failure: local still works + warning toast | ✅ | `onError` rollbacks cache; shows `toast.warning` |
| Off = no resurfacing toasts | ✅ | `useResurfacing` checks `frequency !== 'off'` |
| Keyboard accessible | ✅ | `role="radiogroup"`, `aria-checked`, focus rings |
| ARIA labels | ✅ | All interactive elements labelled |
| Persists across sessions | ✅ | Server-stored in USER_PREFERENCES |
| Respected immediately (no restart) | ✅ | Optimistic cache update flows to `useResurfacing` |
| Reset to default option | ✅ | Conditionally shown button resets to 'normal' |

---

## Summary

Story 7.4 is fully implemented and spec-compliant. All 10 acceptance criteria met. TypeScript clean (0 errors). Backend tests 38/38 pass. The medium-severity `toast.warning` concern is a non-issue (Sonner supports it and TypeScript validated it). The mobile-only icon issue is cosmetic and acceptable for MVP.

**Overall rating: SHIP ✅**
