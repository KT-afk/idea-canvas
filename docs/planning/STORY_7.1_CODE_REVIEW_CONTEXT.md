# Code Review Context: Story 7.1 - Card Resizing Feature

## 🎯 Purpose
This document provides context for reviewing the card resizing feature implementation completed in Story 7.1.

## 📋 What Was Implemented

### Feature Overview
Added the ability to resize note/idea/plan cards on the infinite canvas by dragging 8 resize handles (4 corners + 4 edges). Card dimensions are persisted to the database and survive page refreshes.

### User Experience
- **Trigger:** Hover over any card to reveal resize handles
- **Interaction:** Click and drag any handle to resize the card
- **Visual Feedback:** Appropriate cursors (se-resize, n-resize, etc.)
- **Constraints:** Min 160×120px, Max 480×600px
- **Persistence:** Dimensions auto-save to database after 500ms
- **Zoom Support:** Works correctly at all canvas zoom levels (25%-200%)

## 📁 Files Changed

### 1. Frontend Type Definitions
**File:** `frontend/src/types/types.ts`

**Changes:**
- Added `CardMetadata` type with optional `width` and `height` fields
- Added `metadata?: CardMetadata | null` to `Note` type

**Purpose:** Define TypeScript types for card dimension storage

**Review Focus:**
- Type safety and consistency
- Optional fields handled properly

---

### 2. Card Component (Core Logic)
**File:** `frontend/src/components/Card.tsx`

**Changes:**
- Added size constants (MIN/MAX/DEFAULT dimensions)
- Added `ResizeHandle` type for 8 handle directions
- Added state: `cardDimensions`, `isResizing`, `resizeHandle`, `isHoveringCard`
- Added refs: `resizeStateRef`, `resizeSaveTimeout`
- Added prop: `metadata` (receives dimensions from DB)
- Added prop: `onDimensionsChange` (callback to save dimensions)
- Implemented `handleResizeStart()` function
- Added `useEffect` for resize move/end logic with window event listeners
- Updated `motion.div` style to use dynamic width/height
- Updated textarea to use dynamic height based on card size
- Added 8 resize handle UI elements (visible on hover)
- Updated cursor logic (grab/grabbing/resize cursors)
- Added hover handlers (`onMouseEnter`/`onMouseLeave`)

**Purpose:** Core resize functionality with optimistic UI

**Review Focus:**
- Resize calculation logic (accounting for zoom)
- Event handler cleanup (memory leaks)
- Debounced save implementation
- Min/max constraint enforcement
- Interaction with existing drag functionality
- Performance (event throttling)
- Accessibility (ARIA labels on handles)

**Key Functions to Review:**
```typescript
// Line ~262
handleResizeStart(e: React.PointerEvent, handle: ResizeHandle)

// Line ~279 (useEffect)
- handlePointerMove: Calculates new dimensions based on handle direction
- handlePointerUp: Debounced save to database
```

**Key UI Elements:**
```tsx
// Lines ~609-687: Eight resize handle divs
- 4 corner handles (diagonal resize)
- 4 edge handles (single-axis resize)
- Conditional rendering: !isDragging && isHoveringCard
```

---

### 3. Notes Service
**File:** `frontend/src/services/notesService.ts`

**Changes:**
- Updated `updateNote()` function signature to accept `"metadata"` in the Partial Pick type

**Purpose:** Allow API calls to include metadata field

**Review Focus:**
- Backward compatibility
- Type signature correctness

---

### 4. Note Mutations Hook
**File:** `frontend/src/hooks/useNoteMutations.ts`

**Changes:**
- Added `updateDimensionsMutation` with optimistic UI pattern
- Mutation updates note's metadata field with `{ width, height }`
- Includes onMutate (optimistic update), onSuccess (sync with server), onError (rollback)
- Added `updateDimensions` to returned hook object

**Purpose:** React Query mutation for persisting card dimensions

**Review Focus:**
- Optimistic update logic
- Error handling and rollback
- Cache invalidation strategy
- Query key consistency (boardId handling)
- Toast notification on error

**Key Logic:**
```typescript
// Line ~308
updateDimensionsMutation = useMutation({
  mutationFn: ({ id, width, height }) => 
    updateNote(id, { metadata: { width, height } }),
  onMutate: // Optimistic update to cache
  onSuccess: // Sync with server response
  onError: // Rollback + toast
})
```

---

### 5. App Component Integration
**File:** `frontend/src/App.tsx`

**Changes:**
- Destructured `updateDimensions` from `useNoteMutations()` hook
- Added `metadata: note.metadata ?? null` to cardProps
- Added `onDimensionsChange` callback to cardProps that calls `updateDimensions.mutate()`

**Purpose:** Wire up resize functionality to state management

**Review Focus:**
- Props passed correctly to card components
- Callback includes boardId for proper cache updates
- No breaking changes to existing card props

---

### 6. Card Wrapper Components
**Files:** `frontend/src/components/NoteCard.tsx`, `IdeaCard.tsx`, `PlanCard.tsx`

**Changes:** None (they already spread `{...props}` so automatically pass new props)

**Review Focus:**
- Verify prop spreading still works correctly

---

## 🔍 Code Review Checklist

### Architecture & Design
- [ ] Separation of concerns maintained (UI vs logic vs state)
- [ ] Consistent with existing patterns (drag logic, mutations)
- [ ] Reusable across card types (Note/Idea/Plan)
- [ ] No tight coupling between components

### Functionality
- [ ] Resize handles work for all 8 directions
- [ ] Min/max constraints enforced correctly
- [ ] Zoom level accounted for in calculations
- [ ] Debounced save prevents excessive API calls
- [ ] Card position preserved during resize
- [ ] Textarea height adjusts dynamically
- [ ] Handles hidden during drag (no interference)
- [ ] Handles only visible on hover

### Performance
- [ ] Event listeners properly cleaned up
- [ ] No unnecessary re-renders during resize
- [ ] Refs used appropriately for non-reactive state
- [ ] Window event listeners removed on unmount
- [ ] Debounce timeout cleared on unmount
- [ ] Optimistic UI reduces perceived latency

### Error Handling
- [ ] Rollback on mutation failure
- [ ] User feedback via toast on error
- [ ] Graceful handling of missing metadata
- [ ] Default dimensions for old cards

### Type Safety
- [ ] TypeScript types correct throughout
- [ ] No `any` types used
- [ ] Optional fields handled safely
- [ ] Props interfaces updated correctly

### Accessibility
- [ ] ARIA labels on resize handles
- [ ] Keyboard accessibility considered
- [ ] Screen reader support
- [ ] Focus indicators present

### Database & Backend
- [ ] Metadata field used correctly (JSONB)
- [ ] No database migration required
- [ ] Backward compatible with existing cards
- [ ] API signature supports metadata

### Edge Cases
- [ ] Cards at minimum size
- [ ] Cards at maximum size
- [ ] Rapid resize movements
- [ ] Resize during zoom transitions
- [ ] Multiple cards resizing simultaneously
- [ ] Network failure during save
- [ ] Cards without metadata in database

### Testing Needs
- [ ] Manual: Resize from all 8 handles
- [ ] Manual: Test at various zoom levels
- [ ] Manual: Verify persistence after refresh
- [ ] Manual: Test with all card types
- [ ] Manual: Resize near canvas boundaries
- [ ] Unit: Resize calculation logic
- [ ] Unit: Min/max constraint enforcement
- [ ] Integration: Mutation success/failure flows

---

## 🐛 Potential Issues to Look For

### 1. Race Conditions
- Multiple rapid resizes before debounce completes
- Resize while previous save is pending
- Component unmount during resize

### 2. Memory Leaks
- Window event listeners not cleaned up
- Timeout references not cleared
- Refs holding stale closures

### 3. UI/UX Issues
- Handles interfering with drag
- Cursor flickering between states
- Resize jumps at zoom boundaries
- Visual artifacts during resize

### 4. Data Integrity
- Metadata field not initialized properly
- Width/height stored as strings instead of numbers
- Negative dimensions allowed
- Constraint violations

### 5. Cross-Browser Compatibility
- Pointer events on Safari/iOS
- CSS transforms with zoom
- Gradient backgrounds on handles

---

## 📊 Key Metrics & Constraints

### Size Constraints
```typescript
MIN_CARD_WIDTH: 160px   (10rem)
MAX_CARD_WIDTH: 480px   (30rem)
MIN_CARD_HEIGHT: 120px  (7.5rem)
MAX_CARD_HEIGHT: 600px  (37.5rem)
DEFAULT_CARD_WIDTH: 208px  (13rem, w-52)
DEFAULT_CARD_HEIGHT: 160px (10rem)
```

### Database Schema
```typescript
// Stored in NOTES.metadata JSONB field
{
  width?: number;   // pixels
  height?: number;  // pixels
}
```

### Performance Targets
- Resize should feel instant (< 16ms per frame)
- Save debounce: 500ms after resize ends
- Optimistic UI: Immediate visual feedback
- Network save: Background, non-blocking

---

## 🔗 Related Documentation

1. **Implementation Plan:** `docs/planning/STORY_7.1_CARD_RESIZING.md`
2. **Implementation Summary:** `docs/planning/STORY_7.1_IMPLEMENTATION_SUMMARY.md`
3. **Original Codebase Docs:** `docs/architecture-frontend.md`

---

## 💡 Testing Suggestions

### Quick Smoke Test
1. Hover over a card → handles appear
2. Drag bottom-right corner → card resizes
3. Release → card maintains size
4. Refresh page → size persists
5. Zoom canvas → resize still works

### Comprehensive Test
1. Test all 8 handles individually
2. Test at zoom levels: 25%, 50%, 100%, 150%, 200%
3. Test with all card types (Note, Idea, Plan)
4. Test min/max constraints (drag beyond limits)
5. Test rapid resizing (stress test debounce)
6. Test concurrent operations (resize + drag)
7. Simulate network failure (check rollback)
8. Test with archived cards

### Regression Test
- [ ] Card drag still works
- [ ] Card editing still works
- [ ] Color picker still works
- [ ] Type toggle still works
- [ ] Archive/restore still works
- [ ] Delete still works
- [ ] Keyboard shortcuts still work

---

## 🎯 Success Criteria

The implementation is successful if:

1. ✅ All 8 resize handles work correctly
2. ✅ Dimensions persist after page refresh
3. ✅ Works at all zoom levels (25%-200%)
4. ✅ Min/max constraints enforced
5. ✅ No interference with existing drag functionality
6. ✅ No memory leaks or performance issues
7. ✅ TypeScript compiles without errors
8. ✅ Backward compatible with existing cards
9. ✅ Error handling works (rollback + toast)
10. ✅ Accessible (keyboard, screen reader)

---

## 📝 Review Questions

### Architecture
1. Does the resize logic follow existing patterns (e.g., drag implementation)?
2. Is the separation between UI and business logic clear?
3. Are there opportunities for further abstraction?

### Implementation
4. Is the coordinate conversion for zoom correct?
5. Could the resize handle rendering be simplified?
6. Is the debounce implementation optimal?

### Robustness
7. Are all edge cases handled?
8. What happens if metadata is corrupted in the database?
9. How does it handle concurrent resizes on the same card?

### Maintainability
10. Is the code well-commented and self-documenting?
11. Are magic numbers explained with constants?
12. Would a new developer understand this code?

---

## 🚀 Next Steps After Review

### If Approved
1. Merge to development branch
2. Deploy to staging environment
3. Perform QA testing with real users
4. Monitor for issues in production
5. Update user documentation

### If Changes Needed
1. Address review feedback
2. Re-test affected areas
3. Update documentation if needed
4. Request follow-up review

### Future Enhancements
- Story 7.2: Aspect ratio lock (Shift+drag)
- Story 7.3: Auto-fit content (double-click edge)
- Story 7.4: Preset size buttons (S/M/L)
- Story 7.5: Rich text formatting
- Story 7.6: Image attachments

---

**Review Priority:** High  
**Complexity:** Medium  
**Risk Level:** Low (no breaking changes, backward compatible)  
**Estimated Review Time:** 30-45 minutes

---

*Generated: 2026-02-09*  
*Story: 7.1 - Card Resizing*  
*Status: Ready for Review*
