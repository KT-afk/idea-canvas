# Story 7.1: Card Resizing & Enhanced Usefulness

## 📋 Overview
Add resizable cards with flexible dimensions to accommodate different amounts of content, plus additional features to make cards more useful and feature-rich.

## 🎯 Acceptance Criteria

### Must Have
1. ✅ Cards can be resized by dragging corners/edges
2. ✅ Minimum and maximum size constraints
3. ✅ Width and height persist to database
4. ✅ Resize handles appear on hover
5. ✅ Smooth resize animation
6. ✅ Textarea auto-expands with card size
7. ✅ Resize preserves card position
8. ✅ Works with zoom levels

### Nice to Have
9. ⏳ Aspect ratio lock (optional)
10. ⏳ Double-click edge to auto-fit content
11. ⏳ Preset size buttons (small/medium/large)
12. ⏳ Resize handles respect card type styling

## 🏗️ Architecture

### Frontend Changes

#### 1. Update Card Component (`Card.tsx`)
- Add width/height state
- Add resize handlers (drag corner/edge)
- Add resize handle UI elements
- Update motion styles to respect dimensions
- Pass dimensions to textarea for proper sizing

#### 2. Update Database Schema
Use existing `metadata` JSONB field to store:
```typescript
{
  width?: number;  // in pixels, default 208 (w-52)
  height?: number; // in pixels, default 160 (approximate current height)
}
```

#### 3. Update API Types
```typescript
interface Note {
  // ... existing fields
  metadata?: {
    width?: number;
    height?: number;
  };
}
```

### Resize Interaction Design

```
┌─────────────────────┐
│  ┌─┐            ┌─┐ │  ← Top corners
│  │ │            │ │ │
│  └─┘  CONTENT   └─┘ │
│                     │
│  ┌─┐            ┌─┐ │  ← Bottom corners
│  │ │            │ │ │
│  └─┘            └─┘ │
└─────────────────────┘

Resize handles (8 total):
- 4 corners (diagonal resize)
- 4 edges (horizontal/vertical only)
```

## 🔧 Implementation Steps

### Step 1: Add Size Constants
```typescript
// Card size constraints
const MIN_CARD_WIDTH = 160;   // 10rem
const MAX_CARD_WIDTH = 480;   // 30rem
const MIN_CARD_HEIGHT = 120;  // 7.5rem
const MAX_CARD_HEIGHT = 600;  // 37.5rem
const DEFAULT_CARD_WIDTH = 208;  // w-52 (current)
const DEFAULT_CARD_HEIGHT = 160; // approximate current height
```

### Step 2: Update Card State
```typescript
const [cardDimensions, setCardDimensions] = useState({
  width: metadata?.width || DEFAULT_CARD_WIDTH,
  height: metadata?.height || DEFAULT_CARD_HEIGHT
});
const [isResizing, setIsResizing] = useState(false);
const [resizeHandle, setResizeHandle] = useState<string | null>(null); // 'se', 'sw', 'ne', 'nw', 's', 'n', 'e', 'w'
```

### Step 3: Add Resize Handlers
```typescript
const handleResizeStart = (e: React.MouseEvent, handle: string) => {
  e.stopPropagation(); // Prevent drag
  setIsResizing(true);
  setResizeHandle(handle);
  // Store initial mouse position and card dimensions
};

const handleResizeMove = (e: MouseEvent) => {
  if (!isResizing || !resizeHandle) return;
  
  // Calculate new dimensions based on:
  // - Mouse delta
  // - Resize handle direction
  // - Min/max constraints
  // - Zoom level (coordinate conversion)
  
  setCardDimensions({ width: newWidth, height: newHeight });
};

const handleResizeEnd = () => {
  setIsResizing(false);
  setResizeHandle(null);
  
  // Save to database
  onDimensionsChange(id, cardDimensions.width, cardDimensions.height);
};
```

### Step 4: Add Resize Handle UI
```tsx
{/* Resize handles - only show on hover when not dragging */}
{!isDragging && (
  <>
    {/* Corner handles */}
    <div
      className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
      onMouseDown={(e) => handleResizeStart(e, 'se')}
      style={{
        background: 'radial-gradient(circle at bottom right, rgba(0,0,0,0.3) 0%, transparent 70%)'
      }}
    />
    {/* Add other 7 handles... */}
  </>
)}
```

### Step 5: Update API/Mutations
```typescript
// Add dimensions to note mutations
const updateNoteDimensions = useMutation({
  mutationFn: ({ id, width, height }: { id: string; width: number; height: number }) =>
    updateNote(id, { 
      metadata: { width, height } 
    }),
  // ... optimistic updates
});
```

### Step 6: Update Card Wrapper Styles
```tsx
<motion.div
  style={{
    // ... existing styles
    width: cardDimensions.width,
    height: cardDimensions.height,
    minWidth: MIN_CARD_WIDTH,
    minHeight: MIN_CARD_HEIGHT,
    maxWidth: MAX_CARD_WIDTH,
    maxHeight: MAX_CARD_HEIGHT,
  }}
  className={`relative p-4 rounded-lg shadow-lg ... ${isResizing ? 'cursor-se-resize' : ''}`}
>
```

### Step 7: Update Textarea Sizing
```tsx
<textarea
  style={{
    color: getColorClass(textColor),
    // Dynamic height based on card height
    height: `${cardDimensions.height - 120}px`, // Subtract header/footer space
  }}
  className="w-full bg-transparent resize-none ..."
/>
```

## 📊 Additional Useful Features

### Phase 2 Enhancements (Separate Stories)

#### 1. **Rich Text Formatting** (Story 7.2)
- Bold, italic, underline
- Lists (ordered/unordered)
- Headings
- Use TipTap or Slate editor

#### 2. **Card Templates** (Story 7.3)
- Meeting notes template
- Task list template
- Pros/cons template
- Quick access via command palette

#### 3. **Attachments** (Story 7.4)
- Image uploads
- File attachments
- Store in cloud (Cloudinary/S3)
- Thumbnail previews

#### 4. **Due Dates** (Story 7.5)
- Add date picker for Plan cards
- Visual indicators (overdue, upcoming)
- Calendar view

#### 5. **Checklists** (Story 7.6)
- Inline checkboxes in content
- Progress indicator (3/5 complete)
- Especially useful for Plan cards

#### 6. **Card Linking** (Story 7.7)
- Reference other cards with @mention
- Create hierarchies (parent/child)
- Navigate between related cards

## 🧪 Testing Strategy

### Manual Testing
- [ ] Resize from each of 8 handles
- [ ] Min/max size constraints enforced
- [ ] Resize works at different zoom levels
- [ ] Resize preserves position
- [ ] Handles don't interfere with drag
- [ ] Dimensions persist after refresh
- [ ] Textarea adjusts correctly
- [ ] Archive/restore preserves size

### Edge Cases
- [ ] Very small cards (min size)
- [ ] Very large cards (max size)
- [ ] Rapid resize movements
- [ ] Resize near canvas boundary
- [ ] Resize while zoomed in/out
- [ ] Resize with keyboard shortcuts active

### Accessibility
- [ ] Resize handles are keyboard accessible (Tab + Enter/Space)
- [ ] Screen reader announces size changes
- [ ] Focus indicators visible
- [ ] Size constraints announced

## 🎨 UI/UX Considerations

### Visual Design
- **Resize Handles:** Subtle, only visible on hover
- **Cursor:** Changes to directional resize cursor
- **Feedback:** Smooth animation during resize
- **Grid Snap:** Optional snap to grid (defer to future)

### User Experience
- **Discoverability:** Hover shows handles
- **Predictability:** Corner = diagonal, edge = single axis
- **Performance:** Throttle resize events (60fps)
- **Consistency:** Same behavior across card types

### Performance
- **Throttling:** Use requestAnimationFrame for smooth resize
- **Debouncing:** Save to DB 500ms after resize complete
- **Optimistic UI:** Immediate visual feedback

## 📈 Success Metrics
- Users resize cards within first 5 minutes
- Average card size increases (users want more space)
- Fewer cards "overflowing" with content
- Positive feedback on flexibility

## 🚀 Implementation Priority

### This Story (7.1) - Card Resizing
**Estimated Time:** 4-6 hours

1. **Setup** (30min)
   - Add size constants
   - Update types
   
2. **Core Resize Logic** (2hrs)
   - Add state management
   - Implement resize handlers
   - Handle zoom coordinate conversion
   
3. **UI Components** (1hr)
   - Add resize handles
   - Style hover states
   - Add cursors
   
4. **Database Integration** (1hr)
   - Update mutation hooks
   - Save/load dimensions
   - Handle metadata field
   
5. **Testing & Polish** (1-2hrs)
   - Test all handles
   - Test edge cases
   - Accessibility review
   - Performance optimization

## 📝 Deliverables

**Frontend:**
- `frontend/src/components/Card.tsx` (MODIFIED)
- `frontend/src/hooks/useNoteMutations.ts` (MODIFIED)
- `frontend/src/types/types.ts` (MODIFIED - add metadata type)

**Backend:**
- Backend already supports `metadata` JSONB field ✅

**Documentation:**
- User guide on resizing cards
- GIF/video demonstration

## 🔄 Migration Strategy

**Existing Cards:**
- No migration needed
- Existing cards will use default dimensions
- Metadata field is optional

**Backward Compatibility:**
- Old cards work without dimensions
- System gracefully handles missing metadata
- No database migration required

---

## 💡 Next Steps After This Story

1. **Story 7.2:** Rich Text Formatting (TipTap integration)
2. **Story 7.3:** Card Templates (Meeting notes, tasks, etc.)
3. **Story 7.4:** Image Attachments (Cloudinary integration)
4. **Story 7.5:** Due Dates for Plans (Date picker + calendar)
5. **Story 7.6:** Checklists (Inline checkboxes)

**Ready to implement card resizing?** 🚀
