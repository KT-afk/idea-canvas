# Code Review — Priority 3: Verify New Features (Epics 6-8)

**Reviewed by:** Party Mode (Amelia + Winston + Sally + GLaDOS + John)  
**Date:** 2026-02-20  
**Branch:** development  
**Commit:** 869c923

---

## Summary

Priority 3 covered verification of all newly implemented features:
- Epic 6: Navigate connected items (ConnectionLine jump buttons)
- Epic 7: Resurfacing "Remember this?" toast
- Epic 8: Next Time Notes, Graduation flow, Idea Timeline

TypeScript: ✅ Clean (both frontend & backend)  
Tests: ✅ 38/38 passing, 1 skipped (pre-existing)

---

## Bugs Found & Fixed

### 🔴 Bug 1 — ConnectionLine card width mismatch
**File:** `frontend/src/components/connections/ConnectionLine.tsx`  
**Issue:** Card width was hardcoded as `208px` (`w-52`) but `Card.tsx` was updated to `w-56` (224px). Navigation jump buttons were landing 8px off per card.  
**Fix:** Updated to `224px`. ✅ Fixed in commit `869c923`

### 🔴 Bug 2 — Resurfacing firing on empty boards
**File:** `frontend/src/App.tsx`  
**Issue:** `useResurfacing` was enabled as soon as `currentBoardId` was set, even if there were no ideas. This caused a wasted API call on every empty board page load.  
**Fix:** Added `hasIdeas && !isLoading` guard. ✅ Fixed in commit `869c923`

---

## Issues to Review (Not Yet Fixed)

### 🟡 Issue 1 — No tests for new routes/hooks/components
**Severity:** Medium  
**Files:**
- `backend/src/routes/next-time-notes-route.ts`
- `backend/src/routes/activity-log-route.ts`
- `backend/src/routes/resurfacing-route.ts`
- `frontend/src/hooks/useNextTimeNotes.ts`
- `frontend/src/hooks/useActivityLog.ts`
- `frontend/src/hooks/useResurfacing.ts`
- `frontend/src/components/NextTimeNotes.tsx`
- `frontend/src/components/IdeaTimeline.tsx`

**Recommendation:** Add route-level unit tests for the 3 new backend routes. Frontend hook tests can be deferred.

---

### 🟡 Issue 2 — Card height can grow very tall
**Severity:** Medium (UX)  
**File:** `frontend/src/components/Card.tsx`  
**Issue:** An idea card can now render: textarea (h-24) + footer row + NextTimeNotes section + IdeaTimeline section + Graduate button. With multiple Next Time Notes added, the card becomes very tall on the canvas.  
**Recommendation:**
- Cap NextTimeNotes list at 3 visible items with a "Show more" toggle
- Consider showing NextTimeNotes only on card hover/focus
- IdeaTimeline is already collapsed by default ✅

---

### 🟡 Issue 3 — `updateNote` spreads all fields including `undefined`
**Severity:** Low  
**File:** `backend/src/services/notes-service.ts` (lines 68–82)  
**Issue:** The `Notes.update()` call spreads all possible fields even when they're `undefined`. Sequelize strips `undefined` values correctly so this doesn't cause data loss, but it's fragile and could be a bug footgun if Sequelize's behavior changes.  
**Recommendation:** Refactor to only include defined fields:
```ts
const updatePayload = Object.fromEntries(
  Object.entries(updates).filter(([, v]) => v !== undefined)
);
await Notes.update(updatePayload, { where: { id: notesId }, returning: true });
```

---

### 🟢 Issue 4 — ACTIVITY_LOG timestamps: false with manual CREATEDAT
**Severity:** Low  
**File:** `backend/src/models/ACTIVITY_LOG.ts`  
**Issue:** Using `timestamps: false` with a manually declared `CREATEDAT` column (`defaultValue: DataType.NOW`). This works correctly — Sequelize will include the column definition in `sync({ alter: true })` and Postgres will use `NOW()` as default. No action needed but worth monitoring on first deploy.

---

### 🟢 Issue 5 — Graduation doesn't set status: 'graduated'
**Severity:** Low  
**File:** `frontend/src/App.tsx`, `backend/src/services/notes-service.ts`  
**Issue:** `handleGraduate` calls `updateType.mutate({ id, type: 'plan' })`. The `status` field stays `'active'`. The model has a `'graduated'` enum value. Currently this is acceptable because the resurfacing query filters on `type: 'idea'` (so plans are excluded), and the UX treats `type: 'plan'` as the graduation indicator. However, if future analytics/filters use `status: 'graduated'`, this will be inconsistent.  
**Recommendation:** Consider also setting `status: 'graduated'` on graduation, or remove the `'graduated'` status enum value to avoid confusion.

---

## Verdict

All critical bugs fixed. New features are structurally sound. Key tech debt items (tests for new routes, card height capping) should be addressed when convenient. No blockers for continuing to Priority 4.
