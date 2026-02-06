# Drag Fix Summary

## Problem
Cards had severe drag issues:
1. **Cursor offset** - Card stopped a distance away from cursor
2. **Laggy start** - Drag felt sluggish and inconsistent
3. **Wrong directions** - Sometimes dragged in unexpected directions

## Root Cause
The `BoardCanvas` applies a **transform** (pan + zoom/scale) to its children. When cards are inside this transformed parent, Framer Motion's drag calculations work in **screen coordinates**, but cards are positioned in **canvas coordinates**.

### The Math
```
Screen coordinates = Canvas coordinates × zoom + pan
Canvas coordinates = (Screen coordinates - pan) ÷ zoom
```

During drag:
- User moves mouse by X pixels on screen
- But with zoom = 0.5, the card should move 2X in canvas space
- With zoom = 2.0, the card should move 0.5X in canvas space

## Solution Implemented

### 1. Added `zoom` prop to Card component
```typescript
interface CardProps {
  // ... other props
  zoom?: number; // Canvas zoom level for coordinate conversion
}
```

### 2. Pass zoom from App.tsx to all cards
```typescript
const cardProps = {
  // ... other props
  zoom: zoom, // Pass zoom for coordinate conversion during drag
};
```

### 3. Compensate for zoom in `onDrag` handler
```typescript
onDrag={(event, info) => {
  // info.offset gives drag distance in SCREEN pixels
  // Divide by zoom to convert to CANVAS pixels
  const canvasX = positionX + (info.offset.x / zoom);
  const canvasY = positionY + (info.offset.y / zoom);
  motionX.set(canvasX);
  motionY.set(canvasY);
}}
```

## Key Changes Made

**File: `frontend/src/components/Card.tsx`**
- Added `zoom` prop with default value `1`
- Implemented custom `onDrag` handler that accounts for parent zoom
- Removed conflicting `dragTransition` and `dragPropagation` settings
- Simplified drag configuration

**File: `frontend/src/App.tsx`**
- Added `zoom: zoom` to cardProps object
- Now all cards (NoteCard, IdeaCard, PlanCard) receive zoom prop

## How It Works Now

1. User clicks and drags a card
2. Framer Motion calls `onDrag` with screen-space offset
3. We divide offset by zoom to get canvas-space delta
4. We add delta to original position to get new canvas position
5. We update motion values directly for instant visual feedback
6. On drag end, final position is saved to backend

## Testing Checklist

When you test, verify:
- [ ] Card follows cursor precisely (no offset)
- [ ] Drag feels instant and smooth (no lag at start)
- [ ] Works correctly at zoom = 1.0 (100%)
- [ ] Works correctly at zoom = 0.5 (50% - zoomed out)
- [ ] Works correctly at zoom = 2.0 (200% - zoomed in)
- [ ] Drag works in all directions consistently
- [ ] Position saves correctly to backend

## Potential Issues to Watch For

1. **Pan offset not accounted for** - Currently we only compensate for zoom, not pan. This might be okay since motion values are already in canvas space, but if cards still feel slightly off after panning, we may need to also account for pan position.

2. **Zoom changes during drag** - If user zooms while dragging (unlikely but possible), behavior might be unexpected.

3. **Performance** - The `onDrag` handler runs on every frame. Should be fine, but watch for any performance issues on slower devices.

## If Drag Still Feels Wrong

If after testing the drag still has issues, the next step would be to also account for pan position:

```typescript
// Would need to pass panPosition as prop
const canvasX = (info.point.x - panPosition.x) / zoom;
const canvasY = (info.point.y - panPosition.y) / zoom;
```

This converts screen coordinates directly to canvas coordinates without relying on offsets.

---

**Status**: Implementation complete, awaiting user testing.
