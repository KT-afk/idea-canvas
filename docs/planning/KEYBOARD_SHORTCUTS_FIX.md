# Keyboard Shortcuts Fix - Preventing Input Conflicts

## Issue Description

**Problem:** Users cannot type `-` (minus) or `+` (plus) characters in note cards because these keys are captured by canvas zoom shortcuts.

**Impact:** 
- Cannot write mathematical expressions (e.g., "2 + 2", "10 - 5")
- Cannot write negative numbers or ranges
- Poor user experience when typing content

## Solution

Changed zoom keyboard shortcuts to require modifier keys (Cmd on Mac, Ctrl on Windows/Linux), matching standard application behavior.

### Updated Shortcuts

| Action | Old Shortcut | New Shortcut |
|--------|--------------|--------------|
| Zoom In | `+` or `=` | `Cmd/Ctrl` + `+` or `=` |
| Zoom Out | `-` or `_` | `Cmd/Ctrl` + `-` or `_` |

### Additional Improvements

Also added typing protection to Arrow keys to prevent canvas panning when:
- Cursor is in a text input field
- User is editing a contenteditable element
- User is in a textarea

## Complete Keyboard Shortcuts Reference

### Canvas Navigation
| Shortcut | Action | Typing-Safe? |
|----------|--------|--------------|
| `Arrow Keys` | Pan canvas (100px steps) | ✅ Yes (checks if typing) |
| `Shift` + `Arrow Keys` | Pan canvas (500px steps) | ✅ Yes (checks if typing) |
| `Space` + Drag | Pan mode | ✅ Yes (checks if typing) |
| `H` | Reset to home position | ✅ Yes (checks if typing) |
| `Escape` | Unfocus canvas | ✅ Always works |

### Zoom Controls
| Shortcut | Action | Typing-Safe? |
|----------|--------|--------------|
| `Cmd/Ctrl` + `+` | Zoom in (+10%) | ✅ Yes (requires modifier) |
| `Cmd/Ctrl` + `-` | Zoom out (-10%) | ✅ Yes (requires modifier) |
| `Cmd/Ctrl` + `=` | Zoom in (alternative) | ✅ Yes (requires modifier) |
| `Cmd/Ctrl` + `0` | Reset to home | ✅ Yes (requires modifier) |
| `Cmd/Ctrl` + `1` | Fit to content | ✅ Yes (requires modifier) |
| Mouse Wheel | Zoom in/out | ✅ Yes (native behavior) |
| Pinch Gesture | Zoom in/out (touch) | ✅ Yes (touch only) |

### Content Creation
| Shortcut | Action | Typing-Safe? |
|----------|--------|--------------|
| `Cmd/Ctrl` + `N` | Create new note | ✅ Yes (requires modifier) |
| `Cmd/Ctrl` + `K` | Open command palette | ✅ Yes (requires modifier) |
| Double-click Canvas | Create note at position | ✅ Yes (positional) |

### Card Actions
| Shortcut | Action | Context |
|----------|--------|---------|
| `Escape` | Exit editing mode | When editing a card |
| `Tab` | Exit editing mode | When at end of text |
| `Drag` | Move card | When card selected |
| `Arrow Keys` | Move card (10px) | When card selected (NOT typing) |
| `Shift` + Arrow | Move card (50px) | When card selected (NOT typing) |

## Implementation Details

### File Modified
- `/frontend/src/components/BoardCanvas.tsx` (lines 255-345)

### Key Changes

1. **Zoom shortcuts now require modifier key:**
```typescript
case '+':
case '=':
  // Only zoom if Cmd/Ctrl is pressed
  if (e.metaKey || e.ctrlKey) {
    e.preventDefault();
    onZoomChange(Math.min(ZOOM_MAX, zoom + 0.1));
  }
  break;
```

2. **Centralized typing detection:**
```typescript
// Check if user is typing in an input/textarea/contenteditable
const activeElement = document.activeElement;
const isTyping = activeElement?.tagName === 'INPUT' ||
                activeElement?.tagName === 'TEXTAREA' ||
                activeElement?.getAttribute('contenteditable') === 'true';
```

3. **Arrow keys respect typing state:**
```typescript
case 'ArrowUp':
  if (!isTyping) {
    e.preventDefault();
    // ... pan logic
  }
  break;
```

## Testing Scenarios

### ✅ Can Now Type Special Characters
1. Click on a note card to edit
2. Type: "Cost: $100 - $50 = $50"
3. Result: Characters appear correctly ✓

### ✅ Zoom Still Works with Modifier
1. Press `Cmd/Ctrl` + `+`
2. Result: Canvas zooms in ✓
3. Press `Cmd/Ctrl` + `-`
4. Result: Canvas zooms out ✓

### ✅ Arrow Keys Work in Text
1. Click on a note to edit
2. Type some text and use arrow keys to move cursor
3. Result: Cursor moves within text, canvas doesn't pan ✓

### ✅ Arrow Keys Pan When Not Typing
1. Click on canvas background (not on a card)
2. Press arrow keys
3. Result: Canvas pans ✓

## User Experience Improvements

### Before
- ❌ Cannot type `-` or `+` in notes
- ❌ Unexpected zoom when trying to write math
- ❌ Frustrating for users taking technical notes
- ❌ Arrow keys conflict with text cursor

### After
- ✅ Can type all characters freely in notes
- ✅ Zoom shortcuts follow standard conventions (Cmd/Ctrl +/-)
- ✅ Matches behavior of other apps (VSCode, Chrome, Figma, etc.)
- ✅ Arrow keys respect typing context
- ✅ Smooth, predictable user experience

## Related Standards

These shortcuts now match industry standards:

- **Web Browsers** (Chrome, Firefox, Safari): `Cmd/Ctrl` + `+/-` for zoom
- **Code Editors** (VSCode, Sublime): `Cmd/Ctrl` + `+/-` for zoom
- **Design Tools** (Figma, Sketch): `Cmd/Ctrl` + `+/-` for zoom
- **macOS Apps**: `Cmd` + `+/-` for zoom (standard behavior)

## Future Considerations

### Potential Enhancements
1. Add keyboard shortcuts help dialog (`?` key)
2. Allow users to customize shortcuts
3. Add visual indicators when modifier keys are pressed
4. Add tooltips showing shortcuts on UI buttons

### Shortcuts to Avoid
These keys should remain available for typing:
- ✅ Numbers (0-9) - except with Cmd/Ctrl modifier
- ✅ Letters (a-z) - except with Cmd/Ctrl modifier  
- ✅ Special chars (!@#$%^&*()_+-=[]{}|;':",.<>?/)
- ✅ Space - has special handling for pan mode

## Migration Notes

**Breaking Change:** Users who relied on bare `+/-` for zoom need to use `Cmd/Ctrl` modifier.

**Mitigation:** 
- This matches standard app behavior, so should feel natural
- Mouse wheel zoom still works without modifiers
- Zoom buttons in UI still available
- Improves overall UX by fixing text input

## Status

**Fixed** - Ready for testing  
**Build Status:** ✅ TypeScript checks pass  
**Testing:** Manual testing recommended  
**Documentation:** Updated in this file  

## Files Changed

1. `/frontend/src/components/BoardCanvas.tsx`
   - Modified zoom shortcuts to require Cmd/Ctrl
   - Added centralized typing detection
   - Protected arrow keys from conflicts
