import { getColorClass } from "@/utilities/utils";
import { motion, useMotionValue } from "framer-motion";
import { Archive, ClipboardList, GraduationCap, Lightbulb, PaintBucket, RotateCcw, StickyNote, Type, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ColorPickerPopover } from "./Popover";
import { NextTimeNotes } from "./NextTimeNotes";
import { IdeaTimeline } from "./IdeaTimeline";
import { MoveToBoardPopover } from "./MoveToBoardPopover";
import type { Board } from "@/types/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

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
  zoom?: number; // Canvas zoom level for coordinate conversion
  type?: 'note' | 'idea' | 'plan'; // Story 1.3: Card type
  status?: 'active' | 'archived' | 'graduated'; // Story 2.3: Card status
  isNew?: boolean; // Story 1.3: Flag for newly created notes to trigger auto-focus
  shouldHighlight?: boolean; // Story 5.4: Trigger 3s highlight glow when selected from search
  customClassName?: string; // Story 1.6: Type-specific styling classes
  onColorChange: (backgroundColor: string) => void;
  onTextColorChange: (textColor: string) => void;
  onTypeChange: (type: 'note' | 'idea' | 'plan') => void; // Story 1.5: Type toggle
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void; // Story 2.3: Archive card
  onRestore: (id: string) => void; // Story 2.3: Restore card
  onBringToFront: (id: string) => void;
  onDragEndSave: (id: string, positionX: number, positionY: number) => void;
  onNewNoteFocused?: (id: string) => void; // Story 1.3: Callback when new note receives focus
  onGraduate?: (id: string) => void; // Epic 8: Promote idea to plan
  // Story 2.4: Move to different board
  boards?: Board[];
  currentBoardId?: string;
  onMove?: (id: string, targetBoardId: string, targetBoardName: string) => void;
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
  zoom = 1,
  type = 'note',
  status = 'active',
  isNew = false,
  shouldHighlight = false,
  customClassName = '',
  onColorChange,
  onTextColorChange,
  onTypeChange,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onBringToFront,
  onDragEndSave,
  onNewNoteFocused,
  onGraduate,
  boards,
  currentBoardId,
  onMove,
}: Readonly<CardProps>) {
  // Story 1.3: Type indicator icon
  const TypeIcon = type === 'idea' ? Lightbulb : type === 'plan' ? ClipboardList : StickyNote;
  const [editableText, setEditableText] = useState(content);
  const [isDragging, setIsDragging] = useState(false);
  const [isKeyboardMoving, setIsKeyboardMoving] = useState(false); // Story 1.4: Visual feedback for keyboard movement
  const [ariaAnnouncement, setAriaAnnouncement] = useState(''); // Story 1.4: Screen reader announcements
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // Story 1.3: Track if user has typed
  const [justFinishedDrag, setJustFinishedDrag] = useState(false); // Prevent flicker after drag
  const [isHighlighted, setIsHighlighted] = useState(false); // Story 5.4: 3s highlight glow from search
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Story 1.3: Ref for auto-focus
  const lastSavedPos = useRef({ positionX, positionY });
  const dragStateRef = useRef<{ startX: number; startY: number; cardX: number; cardY: number } | null>(null);
  const zoomRef = useRef(zoom);
  const isDraggingRef = useRef(false);
  
  // Story 5.4: Trigger 3s highlight when shouldHighlight changes
  useEffect(() => {
    if (shouldHighlight) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [shouldHighlight]);
  
  // Keep zoom ref updated
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Use motion values for smooth dragging without re-renders
  // Cards use CANVAS coordinates because they're inside transformed BoardCanvas
  const motionX = useMotionValue(positionX);
  const motionY = useMotionValue(positionY);

  useEffect(() => {
    // Don't sync position from props if we're dragging or just finished dragging
    if (isDragging || justFinishedDrag) return;

    const currentX = motionX.get();
    const currentY = motionY.get();
    const deltaX = Math.abs(positionX - currentX);
    const deltaY = Math.abs(positionY - currentY);

    // Only update if position changed significantly
    if (deltaX > 2 || deltaY > 2) {
      motionX.set(positionX);
      motionY.set(positionY);
      lastSavedPos.current = { positionX, positionY };
    }
  }, [positionX, positionY, isDragging, justFinishedDrag, motionX, motionY]);
  
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

  // Custom drag handlers using native events for maximum performance
  useEffect(() => {
    const element = noteRef.current;
    if (!element) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Don't start drag on interactive elements
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || 
          target.tagName === 'BUTTON' ||
          target.closest('button')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      
      isDraggingRef.current = true;
      setIsDragging(true);
      onBringToFront(id);
      
      element.setPointerCapture(e.pointerId);
      
      dragStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        cardX: motionX.get(),
        cardY: motionY.get()
      };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !dragStateRef.current) return;
      
      const dragState = dragStateRef.current;
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      const canvasX = dragState.cardX + (deltaX / zoomRef.current);
      const canvasY = dragState.cardY + (deltaY / zoomRef.current);
      
      motionX.set(canvasX);
      motionY.set(canvasY);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current || !dragStateRef.current) return;
      
      element.releasePointerCapture(e.pointerId);
      
      const finalX = motionX.get();
      const finalY = motionY.get();
      
      // Update lastSavedPos to prevent position reset
      lastSavedPos.current = { positionX: finalX, positionY: finalY };
      
      // Save to backend
      onDragEndSave(id, Math.round(finalX), Math.round(finalY));
      
      isDraggingRef.current = false;
      setIsDragging(false);
      dragStateRef.current = null;
      
      // Prevent position sync from props for 100ms after drag ends
      // This avoids flicker when server hasn't responded yet
      setJustFinishedDrag(true);
      setTimeout(() => {
        setJustFinishedDrag(false);
      }, 100);
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [id, onBringToFront, onDragEndSave, motionX, motionY]);

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

  // Epic 8: Graduation celebration state
  const [isGraduating, setIsGraduating] = useState(false);

  const handleGraduate = () => {
    if (isGraduating) return;
    setIsGraduating(true);
    // Trigger parent mutation (idea → plan)
    onGraduate?.(id);
    toast.success('Graduated to Plan!', {
      description: 'Your idea has levelled up.',
      duration: 4000,
    });
    setTimeout(() => setIsGraduating(false), 800);
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
      initial={isNew ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        x: motionX,
        y: motionY,
        zIndex: zIndex ?? 0,
        backgroundColor: getColorClass(backgroundColor),
        color: getColorClass(textColor),
        pointerEvents: "auto", // Issue #13 fix: Ensure notes capture pointer events
        cursor: isDragging ? 'grabbing' : 'grab', // Story 1.4: Cursor during drag
        opacity: status === 'archived' ? 0.6 : 1, // Story 2.3: Grayed out for archived
        filter: status === 'archived' ? 'grayscale(80%)' : undefined, // Issue #6: Stronger grayscale for clearer distinction
        touchAction: 'none', // Prevent default touch behaviors
        transition: isDragging ? 'none' : undefined, // Disable transitions during drag for instant response
      }}
      className={`relative p-4 rounded-lg w-56 shadow-lg hover:shadow-2xl transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none ${isKeyboardMoving ? 'ring-2 ring-primary/50' : ''} ${isHighlighted ? 'ring-4 ring-primary/70 ring-offset-2' : ''} ${customClassName}`}
    >
      {/* Story 1.4: ARIA live region for screen reader announcements */}
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {ariaAnnouncement}
      </span>

      <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10">
        <ColorPickerPopover 
          icon={PaintBucket} 
          selectedColor={backgroundColor} 
          onColorChange={onColorChange}
          onTextColorChange={onTextColorChange} // Pass this to enable auto-contrast
        />
        <ColorPickerPopover icon={Type} selectedColor={textColor} onColorChange={onTextColorChange} />
      </div>
      {/* Story 2.2: Delete confirmation dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none transition-colors z-10"
            aria-label="Delete note"
          >
            <X className="w-5 h-5" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {type}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your {type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(id)}
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* BMAD UX: Type badge in top-right corner */}
      <div className="absolute top-2.5 right-10 z-10">
        <span 
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full ${
            type === 'idea' ? 'bg-yellow-500 text-yellow-950' :
            type === 'plan' ? 'bg-blue-500 text-blue-950' :
            'bg-gray-500 text-gray-950'
          }`}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <TypeIcon className="w-2.5 h-2.5" />
          {type}
        </span>
      </div>

      <div className="h-px bg-black/15 mb-4 mt-8 -mx-4" />

      <textarea
        ref={textareaRef}
        style={{color: getColorClass(textColor)}}
        className="w-full h-24 bg-transparent resize-none border-0 focus:outline-none focus:ring-0 text-base leading-relaxed placeholder:text-current placeholder:opacity-40"
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

      {/* Card footer: Archive/Restore + Move + Type toggle — inline so dynamic sections below don't overlap */}
      <div className="flex items-center justify-between mt-1">
        {/* Story 2.3: Archive/Restore button - Issue #5: Hide for new/empty notes */}
        {(status === 'archived' || (!isNew && editableText.trim() !== '')) ? (
          <button
            onClick={() => status === 'archived' ? onRestore(id) : onArchive(id)}
            className="flex items-center gap-1 text-xs bg-black/5 hover:bg-black/10 px-2 py-1 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors cursor-pointer"
            aria-label={status === 'archived' ? 'Restore this item' : 'Archive this item'}
          >
            {status === 'archived' ? (
              <>
                <RotateCcw className="w-3 h-3" />
                <span>Restore</span>
              </>
            ) : (
              <>
                <Archive className="w-3 h-3" />
                <span>Archive</span>
              </>
            )}
          </button>
        ) : <span />}

        {/* Story 2.4: Move to board button — only shown when there are other boards and card has content */}
        {onMove && boards && currentBoardId && !isNew && editableText.trim() !== '' && (
          <MoveToBoardPopover
            boards={boards}
            currentBoardId={currentBoardId}
            onMove={(targetBoardId, targetBoardName) => onMove(id, targetBoardId, targetBoardName)}
          />
        )}

        {/* Story 1.5: Interactive type toggle button */}
        <button
          onClick={handleTypeToggle}
          className="flex items-center gap-1 text-xs bg-black/5 hover:bg-black/10 px-2 py-1 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors cursor-pointer"
          aria-label={`Type: ${type}. Click to toggle to ${getNextType()}`}
        >
          <TypeIcon className="w-3 h-3" />
          <span className="capitalize">{type}</span>
        </button>
      </div>

      {/* Epic 8: Next Time Notes — shown only on idea and plan cards */}
      {(type === 'idea' || type === 'plan') && !isNew && editableText.trim() !== '' && (
        <NextTimeNotes parentNoteId={id} textColor={textColor} />
      )}

      {/* Epic 8: Idea History Timeline — shown on idea and plan cards */}
      {(type === 'idea' || type === 'plan') && !isNew && editableText.trim() !== '' && (
        <IdeaTimeline noteId={id} />
      )}

      {/* Epic 8: Graduate to Plan button — shown only on idea cards */}
      {type === 'idea' && status === 'active' && !isNew && editableText.trim() !== '' && (
        <div className="mt-2 border-t border-black/10 pt-2" onPointerDown={(e) => e.stopPropagation()}>
          <motion.button
            onClick={handleGraduate}
            disabled={isGraduating}
            animate={isGraduating ? { scale: [1, 1.15, 0.95, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 rounded-md hover:from-blue-600 hover:to-purple-600 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none transition-all disabled:opacity-60 cursor-pointer"
            aria-label="Graduate this idea to a plan"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Graduate to Plan
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}