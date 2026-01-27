import { getColorClass } from "@/utilities/utils";
import { motion, useDragControls, useMotionValue } from "framer-motion";
import { ClipboardList, Lightbulb, PaintBucket, StickyNote, Type, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ColorPickerPopover } from "./Popover";

// Story 1.4: Named constants for keyboard movement (replaces magic numbers)
const KEYBOARD_STEP_NORMAL = 10;
const KEYBOARD_STEP_FAST = 50;

// Story 1.6: Base card interface - shared by all card types
export interface CardProps {
  id: string;
  content: string;
  positionX: number;
  positionY: number;
  backgroundColor: string;
  textColor: string;
  zIndex: number;
  type?: 'note' | 'idea' | 'plan'; // Story 1.3: Card type
  isNew?: boolean; // Story 1.3: Flag for newly created notes to trigger auto-focus
  customClassName?: string; // Story 1.6: Type-specific styling classes
  onColorChange: (backgroundColor: string) => void;
  onTextColorChange: (textColor: string) => void;
  onTypeChange: (type: 'note' | 'idea' | 'plan') => void; // Story 1.5: Type toggle
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  onDragEndSave: (id: string, positionX: number, positionY: number) => void;
  onNewNoteFocused?: (id: string) => void; // Story 1.3: Callback when new note receives focus
}

// Story 1.6: Base Card component - handles all shared logic
export function Card({
  id,
  content,
  positionX,
  positionY,
  backgroundColor,
  textColor,
  zIndex,
  type = 'note',
  isNew = false,
  customClassName = '',
  onColorChange,
  onTextColorChange,
  onTypeChange,
  onEdit,
  onDelete,
  onBringToFront,
  onDragEndSave,
  onNewNoteFocused,
}: Readonly<CardProps>) {
  // Story 1.3: Type indicator icon
  const TypeIcon = type === 'idea' ? Lightbulb : type === 'plan' ? ClipboardList : StickyNote;
  const [editableText, setEditableText] = useState(content);
  const [isDragging, setIsDragging] = useState(false);
  const [isKeyboardMoving, setIsKeyboardMoving] = useState(false); // Story 1.4: Visual feedback for keyboard movement
  const [ariaAnnouncement, setAriaAnnouncement] = useState(''); // Story 1.4: Screen reader announcements
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // Story 1.3: Track if user has typed
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Story 1.3: Ref for auto-focus
  const lastSavedPos = useRef({ positionX, positionY });
  const dragControls = useDragControls();

  // Use motion values for smooth dragging without re-renders
  // Cards use CANVAS coordinates because they're inside transformed BoardCanvas
  const motionX = useMotionValue(positionX);
  const motionY = useMotionValue(positionY);

  useEffect(() => {
    // Only update if not dragging AND position actually changed significantly
    if (!isDragging) {
      const deltaX = Math.abs(positionX - lastSavedPos.current.positionX);
      const deltaY = Math.abs(positionY - lastSavedPos.current.positionY);

      // Only update if position changed by more than 2px (avoids rounding issues)
      if (deltaX > 2 || deltaY > 2) {
        motionX.set(positionX);
        motionY.set(positionY);
        lastSavedPos.current = { positionX, positionY };
      }
    }
  }, [positionX, positionY, isDragging, motionX, motionY]);
  
  useEffect(() => {
    setEditableText(content);
  }, [content]);

  // Story 1.3: Auto-focus textarea when note is newly created
  useEffect(() => {
    if (isNew && textareaRef.current) {
      textareaRef.current.focus();
      // Select all text so user can immediately type over the placeholder space
      textareaRef.current.select();
      // Notify parent that focus has been applied
      onNewNoteFocused?.(id);
    }
  }, [isNew, id, onNewNoteFocused]);

  // Story 1.3: Handle blur - save if content exists, delete if empty
  // Only delete if user has actually interacted (typed something then deleted it)
  // AND not during the settling period (prevents deletion during React Query refetch)
  const handleBlur = () => {
    const trimmedContent = editableText.trim();

    if (trimmedContent === '') {
      // Only discard if user has interacted (typed something then deleted it)
      if (hasUserInteracted) {
        onDelete(id);
      }
      // If user hasn't interacted, don't delete - they might not have started typing yet
    } else if (trimmedContent !== content) {
      // Save if changed
      onEdit(id, trimmedContent);
    }
  };

  // Story 1.4: Debounce ref for keyboard movement position saves
  const keyboardSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Story 1.4: Debounced save for keyboard movement (500ms delay)
  const debouncedSavePosition = useCallback((newX: number, newY: number) => {
    if (keyboardSaveTimeout.current) {
      clearTimeout(keyboardSaveTimeout.current);
    }
    // Show visual feedback during keyboard movement
    setIsKeyboardMoving(true);
    keyboardSaveTimeout.current = setTimeout(() => {
      onDragEndSave(id, Math.round(newX), Math.round(newY));
      lastSavedPos.current = { positionX: newX, positionY: newY };
      setIsKeyboardMoving(false); // Clear visual feedback after save
    }, 500);
  }, [id, onDragEndSave]);

  // Story 1.5: Toggle type - cycles through note → idea → plan → note
  const getNextType = (): 'note' | 'idea' | 'plan' => {
    const typeOrder: Array<'note' | 'idea' | 'plan'> = ['note', 'idea', 'plan'];
    const currentIndex = typeOrder.indexOf(type);
    const nextIndex = (currentIndex + 1) % typeOrder.length;
    return typeOrder[nextIndex];
  };

  const handleTypeToggle = () => {
    const newType = getNextType();
    onTypeChange(newType);
  };

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (keyboardSaveTimeout.current) {
        clearTimeout(keyboardSaveTimeout.current);
      }
    };
  }, []);

  // Story 1.3 & 1.4: Handle keyboard events - Escape and Arrow keys
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      const trimmedContent = editableText.trim();

      if (trimmedContent === '') {
        // Discard empty note - Escape is an explicit user action, so always delete
        onDelete(id);
      } else {
        // Save and blur
        if (trimmedContent !== content) {
          onEdit(id, trimmedContent);
        }
        textareaRef.current?.blur();
      }
    }
  };

  // Story 1.4 AC#9: Arrow key movement when card container is focused (not textarea)
  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    // Story 1.5: Handle Tab to move focus into card's first button (color picker)
    if (e.key === 'Tab' && !e.shiftKey && document.activeElement === noteRef.current) {
      // When Tab is pressed on the card container, move focus to first focusable child
      e.preventDefault();
      const firstButton = noteRef.current?.querySelector('button') as HTMLButtonElement;
      firstButton?.focus();
      return;
    }

    // Only handle arrow keys if the card container itself is focused (not textarea)
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }

    // Don't intercept if textarea or other input is focused
    if (document.activeElement !== noteRef.current) {
      return;
    }

    e.preventDefault();
    const step = e.shiftKey ? KEYBOARD_STEP_FAST : KEYBOARD_STEP_NORMAL;
    let newX = motionX.get();
    let newY = motionY.get();

    switch (e.key) {
      case 'ArrowUp': newY -= step; break;
      case 'ArrowDown': newY += step; break;
      case 'ArrowLeft': newX -= step; break;
      case 'ArrowRight': newX += step; break;
    }

    // Update motion values for immediate visual feedback
    motionX.set(newX);
    motionY.set(newY);

    // Bring card to front when moving with keyboard
    onBringToFront(id);

    // Announce position change to screen readers
    setAriaAnnouncement(`Moved ${e.key.replace('Arrow', '').toLowerCase()} by ${step} pixels`);

    // Debounced save to backend
    debouncedSavePosition(newX, newY);
  };

  return (
    <motion.div
      ref={noteRef}
      role="region"
      aria-label={`Note: ${editableText.substring(0, 30)}${editableText.length > 30 ? '...' : ''}`}
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
      style={{
        position: "absolute",
        x: motionX,
        y: motionY,
        zIndex: zIndex ?? 0,
        backgroundColor: getColorClass(backgroundColor),
        color: getColorClass(textColor),
        pointerEvents: "auto", // Issue #13 fix: Ensure notes capture pointer events
        cursor: isDragging ? 'grabbing' : undefined, // Story 1.4: Cursor during drag
      }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      // Issue #13 fix: Remove dragConstraints so notes can move anywhere in canvas space
      dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
      whileDrag={{ scale: 1.05, rotate: 2 }}
      onDragStart={() => {
        setIsDragging(true);
        onBringToFront(id);
      }}
      onDragEnd={() => {
        // Get the final position from Framer Motion's drag info
        const finalX = motionX.get();
        const finalY = motionY.get();

        // Update last saved position to prevent reset
        lastSavedPos.current = { positionX: finalX, positionY: finalY };

        // Save to backend (already in canvas coordinates)
        onDragEndSave(id, Math.round(finalX), Math.round(finalY));

        // Allow props to take over again
        setIsDragging(false);
      }}
      className={`relative p-4 rounded-xl w-48 shadow-[0_3px_10px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_20px_rgb(0,0,0,0.3)] transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none ${isKeyboardMoving ? 'ring-2 ring-primary/50' : ''} ${customClassName}`}
    >
      {/* Story 1.4: ARIA live region for screen reader announcements */}
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {ariaAnnouncement}
      </span>

      {/* Story 1.4: Invisible drag handle area - top section is draggable
          Height is 44px (h-11) to meet mobile touch target requirements (NFR17) */}
      <div
        className="absolute top-0 left-0 right-0 h-11 cursor-grab active:cursor-grabbing z-0"
        onPointerDown={(e) => {
          e.stopPropagation(); // Prevent BoardCanvas from capturing this event
          dragControls.start(e);
        }}
      />

      <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10">
        <ColorPickerPopover 
          icon={PaintBucket} 
          selectedColor={backgroundColor} 
          onColorChange={onColorChange}
          onTextColorChange={onTextColorChange} // Pass this to enable auto-contrast
        />
        <ColorPickerPopover icon={Type} selectedColor={textColor} onColorChange={onTextColorChange} />
      </div>
      <button
        onClick={() => onDelete(id)}
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none transition-colors z-10"
        aria-label="Delete note"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="h-px bg-black/15 mb-4 mt-8 -mx-4" />

      <textarea
        ref={textareaRef}
        style={{color: getColorClass(textColor)}}
        className="w-full h-24 bg-transparent resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 rounded text-base leading-relaxed"
        value={editableText}
        onChange={(e) => {
          setEditableText(e.target.value);
          setHasUserInteracted(true); // Mark that user has typed
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Type something..."
        aria-label="Note content"
      />

      {/* Story 1.5: Interactive type toggle button - placed after textarea for proper tab order */}
      <button
        onClick={handleTypeToggle}
        className="absolute bottom-2 right-2 flex items-center gap-1 text-xs opacity-60 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-opacity rounded px-1.5 py-0.5 z-10 cursor-pointer"
        aria-label={`Type: ${type}. Click to toggle to ${getNextType()}`}
      >
        <TypeIcon className="w-3 h-3" />
        <span className="capitalize">{type}</span>
      </button>
    </motion.div>
  );
}