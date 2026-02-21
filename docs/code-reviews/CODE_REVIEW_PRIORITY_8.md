# Party Mode Code Review — Priority 8: Epic 8 (Plan Differentiation, Analytics, Export)

**Commits:** `bd7a02a`, `d00cdda`
**Date:** 2026-02-21
**Reviewer:** Dev Agent (party mode)

---

## Summary

Epic 8 added three stories across frontend and backend:

- **Story 8.4** — Plan differentiation: auto-connection service excludes plans from suggestions; `PlanCard` gets a stronger visual ring/shadow.
- **Story 8.5** — Idea lifecycle analytics dashboard: new `GET /api/analytics` backend route; `analyticsService.ts`; `InsightsDashboard` dialog with lifecycle bar + 6 stat cards.
- **Story 8.6** — Export idea history: `ExportMenu` component renders inside `IdeaTimeline`, supporting Markdown and JSON downloads.

A fast-follow fix commit (`d00cdda`) addressed the initial code review (P7): removed a misleading `connectedNotes` stat, removed the flawed `resurfaceActedOnRate` percentage, and added a user-visible toast on export failure.

---

## Files Changed

| File | Change |
|---|---|
| `backend/src/routes/analytics-route.ts` | NEW — `/api/analytics` route; 4 DB queries, lifecycle metrics |
| `backend/src/services/auto-connection-service.ts` | Exclude `type = 'plan'` from suggestion queries |
| `backend/src/index.ts` | Register `analyticsRouter` |
| `frontend/src/services/analyticsService.ts` | NEW — `fetchAnalytics()` + `AnalyticsData` type |
| `frontend/src/components/InsightsDashboard.tsx` | NEW — dialog, `LifecycleBar`, `StatCard`, `EmptyInsights` |
| `frontend/src/components/ExportMenu.tsx` | NEW — MD + JSON export, `triggerDownload`, `buildMarkdown`, `buildJSON` |
| `frontend/src/components/IdeaTimeline.tsx` | Accept optional `note` prop; render `ExportMenu` when history open |
| `frontend/src/components/Card.tsx` | Pass `note` object to `IdeaTimeline` |
| `frontend/src/components/PlanCard.tsx` | Stronger amber ring + shadow for visual weight |
| `frontend/src/components/Toolbar.tsx` | Add `onInsights` prop + Insights button |
| `frontend/src/App.tsx` | Wire `isInsightsDashboardOpen` state + `InsightsDashboard` |

---

## Issues Found

### 🔴 HIGH

**P8-H1: `analyticsService.ts` — no response shape validation**
- `json.data` is cast directly to `AnalyticsData` without any guard. If the backend returns an error body or empty response, `.data` will be `undefined` and all numeric fields will be `undefined`, silently producing `NaN` in the UI.
- **Fix:** Add `if (!json || typeof json.data !== 'object' || json.data === null) throw new Error(...)` before the cast.
- **Status: Fixed** in this review pass.

**P8-H2: `usePreferences.ts` — `invalidateQueries` in `onSuccess` races with optimistic update**
- `setThemeMutation` and `setResurfaceFrequencyMutation` both call `invalidateQueries` in `onSuccess`. Because `onSuccess` fires before the query is refetched, the cache can briefly revert the optimistic update while the refetch is in-flight, causing a flash of the old theme.
- **Fix:** Move `invalidateQueries` to `onSettled` so it fires regardless of success/error and always after the optimistic state is confirmed or rolled back.
- **Status: Fixed** in this review pass.

**P8-H3: `usePreferences.ts` — `staleTime: Infinity` blocks re-sync**
- With `staleTime: Infinity` the preferences query will never be considered stale. If another tab changes the theme the local tab will never re-fetch unless manually invalidated.
- **Fix:** Change to `5 * 60 * 1000` (5 min) — stable but will eventually sync.
- **Status: Fixed** in this review pass.

---

### 🟡 MEDIUM

**P8-M1: `analyticsService.ts` — no `AbortSignal` support**
- `fetchAnalytics` accepts no `signal` parameter. React Query cancels queries via an `AbortSignal` but the underlying `fetch` will keep running after component unmount or query cancellation, wasting bandwidth.
- **Fix:** Add `signal?: AbortSignal` param and pass to `fetch`.
- **Status: Fixed** in this review pass.

**P8-M2: `InsightsDashboard.tsx` — error state has no retry affordance**
- The error state displays a plain text message with no way for the user to retry. `useQuery` exposes a `refetch` function that could be wired to a button.
- **Fix:** Add a "Try again" button that calls `refetch()`.
- **Status: Fixed** in this review pass.

**P8-M3: `InsightsDashboard.tsx` — `staleTime: 30_000` shows stale data on reopen**
- With a 30-second stale time, reopening the dashboard within 30s of a previous open will show cached (potentially outdated) data with no indication it may be stale.
- **Fix:** Use `staleTime: 0` + `refetchOnMount: 'always'` to always fetch fresh data when the dialog opens.
- **Status: Fixed** in this review pass.

**P8-M4: `ExportMenu.tsx` — `URL.revokeObjectURL` called synchronously**
- `URL.revokeObjectURL(url)` is called immediately after `a.click()`. On some browsers (especially Safari) this can revoke the URL before the download has been initiated.
- **Fix:** Wrap `revokeObjectURL` in `setTimeout(..., 100)`.
- **Status: Fixed** in this review pass.

**P8-M5: `Card.tsx` — hardcoded `"Note:"` in `aria-label`**
- The card's `aria-label` is `Note: {content...}` regardless of whether the card is an idea or a plan. Screen reader users are always told "Note" even for ideas and plans.
- **Fix:** Use the `type` prop: `` `${type.charAt(0).toUpperCase() + type.slice(1)}: ...` ``
- **Status: Fixed** in this review pass.

**P8-M6: `ThemeSwitcherPopover.tsx` — `aria-haspopup="dialog"` is incorrect**
- The trigger button opens a `Popover`, not a dialog. `aria-haspopup="dialog"` is semantically wrong; screen readers may announce this as a dialog trigger and confuse users.
- **Fix:** Change to `aria-haspopup="true"` (generic menu/popup).
- **Status: Fixed** in this review pass.

**P8-M7: `usePreferences.ts` — no `enabled` guard for undefined `userId`**
- When `userId` is `undefined`, the query runs with key `['preferences', undefined]` and calls `preferencesService.getPreferences(undefined)`. This may result in a backend call for an unauthenticated state.
- **Fix:** Add `enabled: !!userId`.
- **Status: Fixed** in this review pass.

---

### 🟢 MINOR

**P8-m1: `InsightsDashboard.tsx` — `graduatedW` can go negative**
- `graduatedW = 100 - activeW - archivedW`. Due to `Math.round` rounding up both `activeW` and `archivedW`, their sum can exceed 100, making `graduatedW` negative. A negative `width` style is silently ignored by the browser but is a latent bug.
- **Fix:** `Math.max(0, 100 - activeW - archivedW)`.
- **Status: Fixed** in this review pass.

**P8-m2: `InsightsDashboard.tsx` — `React.ElementType` used without importing React**
- `icon: React.ElementType` in `StatCardProps` relies on the global `React` namespace. This works in JSX transform mode but is not explicit.
- **Fix:** `import type { ElementType } from 'react'` and use `ElementType` directly.
- **Status: Fixed** in this review pass.

**P8-m3: `Card.tsx` — `getNextType` defined as inline arrow inside component**
- `getNextType` is a pure function of `type` with no closure over component state. Redefining it on every render adds a tiny allocation cost and makes the function harder to unit-test.
- **Fix:** Move it outside the component as a named function accepting `type` as a parameter.
- **Status: Fixed** in this review pass.

**P8-m4: `ExportMenu.tsx` — catch block silently swallows the error object**
- `catch (_err)` shows a toast but does not log the error, making it impossible to debug export failures from the browser console.
- **Fix:** Add `console.error('Export failed:', _err)`.
- **Status: Fixed** in this review pass.

**P8-m5: `useTheme.ts` — `isValidTheme` uses `includes` on a readonly tuple**
- `ALL_THEMES.includes(value as Theme)` casts the input before checking, which always passes TypeScript but is not a true O(1) guard.
- **Fix:** Use `const THEME_SET = new Set<string>(ALL_THEMES)` and check `THEME_SET.has(value ?? '')`.
- **Status: Fixed** in this review pass.

**P8-m6: `useTheme.ts` — `useEffect` has no cleanup on unmount**
- When the component using `useTheme` unmounts, theme classes remain on `<html>`. In practice `App` never unmounts, but it is not hygienic.
- **Fix:** Return a cleanup function from `useEffect` that removes all theme classes.
- **Status: Fixed** in this review pass.

**P8-m7: `ThemeSwitcherPopover.tsx` — `onThemeChange` typed as `string` instead of `Theme`**
- The prop accepts any `string`, losing the type-safety of the `Theme` union.
- **Fix:** Type as `(theme: Theme) => void`.
- **Status: Fixed** in this review pass.

**P8-m8: `index.css` — no `prefers-reduced-motion` block**
- Custom CSS animations (framer-motion animations are opt-in but CSS transitions on `:root` theme switch and `animate-pulse` classes still fire) do not respect the user's motion preference.
- **Fix:** Add `@media (prefers-reduced-motion: reduce)` block setting `animation-duration: 0.01ms` and `transition-duration: 0.01ms` on `*, *::before, *::after`.
- **Status: Fixed** in this review pass.

---

## What's Good

- Clean service boundary: `analyticsService.ts` is a thin typed wrapper — all business logic stays in the backend route.
- `LifecycleBar` renders `null` when `total === 0` — no division by zero.
- `ExportMenu` is a pure UI component with no global state; it fetches only when the user explicitly clicks Export, not on mount.
- `buildMarkdown` and `buildJSON` are plain functions outside the component — easy to unit-test independently.
- `enabled: open` on the analytics query is correct — no background polling when the dashboard is closed.
- Plan differentiation in `auto-connection-service` is a targeted one-line guard — surgical and low-risk.
- `PlanCard` visual upgrade (amber ring + shadow) maintains the existing class-extension pattern.
- `safeFilename` in `ExportMenu` defensively strips special characters and falls back to `'idea'`.
- The fix commit (`d00cdda`) correctly removed the misleading `resurfaceActedOnRate` percentage rather than trying to patch a fundamentally flawed metric.

---

## Action Items

| ID | Severity | Action | Status |
|---|---|---|---|
| P8-H1 | High | Validate `json.data` shape before cast in `analyticsService.ts` | Fixed |
| P8-H2 | High | Move `invalidateQueries` to `onSettled` in `setThemeMutation` / `setResurfaceFrequencyMutation` | Fixed |
| P8-H3 | High | Change `staleTime: Infinity` to `5 * 60 * 1000` in `usePreferences` | Fixed |
| P8-M1 | Medium | Add `AbortSignal` support to `fetchAnalytics` | Fixed |
| P8-M2 | Medium | Add retry button to `InsightsDashboard` error state | Fixed |
| P8-M3 | Medium | Use `staleTime: 0` + `refetchOnMount: 'always'` in `InsightsDashboard` | Fixed |
| P8-M4 | Medium | Defer `URL.revokeObjectURL` with `setTimeout(100)` in `ExportMenu` | Fixed |
| P8-M5 | Medium | Use `type` variable in card `aria-label` instead of hardcoded `"Note:"` | Fixed |
| P8-M6 | Medium | Change `aria-haspopup="dialog"` to `aria-haspopup="true"` in `ThemeSwitcherPopover` | Fixed |
| P8-M7 | Medium | Add `enabled: !!userId` guard to `usePreferences` query | Fixed |
| P8-m1 | Minor | Guard `graduatedW` with `Math.max(0, ...)` in `LifecycleBar` | Fixed |
| P8-m2 | Minor | Replace `React.ElementType` with explicit `import type { ElementType }` | Fixed |
| P8-m3 | Minor | Move `getNextType` outside `Card` component | Fixed |
| P8-m4 | Minor | Log error in `ExportMenu` catch block with `console.error` | Fixed |
| P8-m5 | Minor | Strengthen `isValidTheme` with `Set` lookup in `useTheme` | Fixed |
| P8-m6 | Minor | Add `useEffect` cleanup to remove theme classes on unmount in `useTheme` | Fixed |
| P8-m7 | Minor | Tighten `onThemeChange` prop type to `Theme` in `ThemeSwitcherPopover` | Fixed |
| P8-m8 | Minor | Add `@media (prefers-reduced-motion: reduce)` block to `index.css` | Fixed |
