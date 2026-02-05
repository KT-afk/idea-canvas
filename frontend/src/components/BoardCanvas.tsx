import { animate, motion, useDragControls, useMotionValue } from 'framer-motion';
import type { ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Note } from '../types/types'; // Import Note type

interface BoardCanvasProps {
  children: ReactNode;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPanChange: (position: { x: number; y: number }) => void;
  onDoubleClickCreate?: (screenX: number, screenY: number) => void;
  notes?: Note[]; // Story 1.9: Need notes to calculate bounding box
}

export interface BoardCanvasHandle {
  resetToHome: () => void;
  fitToContent: () => void; // Story 1.9: New method
  panToCard: (cardX: number, cardY: number) => void; // Story 5.1: Pan and zoom to specific card
  getPanPosition: () => { x: number; y: number };
}

// Constants for canvas bounds and zoom limits
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.0;
const PAN_LIMIT = 10000;
const CARD_WIDTH = 192; // w-48
const CARD_HEIGHT = 400; // Issue #4 fix: Conservative estimate for dynamic card heights (header + expanded text + footer)
const VIEWPORT_PADDING = 100; // Padding around content when fitting

// Home position: canvas origin (0,0) centered on screen
const getHomePosition = () => ({
  x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
  y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  zoom: 1
});

export const BoardCanvas = forwardRef<BoardCanvasHandle, BoardCanvasProps>(
  ({ children, zoom, onZoomChange, onPanChange, onDoubleClickCreate, notes = [] }, ref) => {
  // Motion values for smooth dragging without re-renders
  // Start at home position (centered)
  const homePos = getHomePosition();
  const x = useMotionValue(homePos.x);
  const y = useMotionValue(homePos.y);

  // Track whether user prefers reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Track spacebar for pan mode
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Track canvas focus for keyboard navigation
  const canvasRef = useRef<HTMLDivElement>(null);

  // Issue #13 fix: Use drag controls to only enable drag on background
  const dragControls = useDragControls();
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Issue #8 fix: Use refs for touch gesture state instead of DOM attributes
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number | null>(null);

  // Helper to animate to position
  const animateTo = useCallback((targetX: number, targetY: number, targetZoom: number) => {
    if (prefersReducedMotion) {
      x.set(targetX);
      y.set(targetY);
      onZoomChange(targetZoom);
    } else {
      animate(x, targetX, { duration: 0.5, ease: 'easeOut' });
      animate(y, targetY, { duration: 0.5, ease: 'easeOut' });
      // Issue #7: Zoom changes instantly while pan animates (known limitation for MVP)
      // Ideally we'd animate zoom smoothly with pan, but requires coordinating with App.tsx state
      onZoomChange(targetZoom);
    }
  }, [prefersReducedMotion, onZoomChange]); // Issue #5 fix: Removed x, y from deps (they're refs)

  // Story 1.9: Reset to home position
  const resetToHome = useCallback(() => {
    const homePos = getHomePosition();
    animateTo(homePos.x, homePos.y, homePos.zoom);
  }, [animateTo]);

  // Story 1.9: Fit to content
  const fitToContent = useCallback(() => {
    if (notes.length === 0) {
      resetToHome();
      return;
    }

    // 1. Calculate bounding box of all notes
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    notes.forEach(note => {
      minX = Math.min(minX, note.positionX);
      maxX = Math.max(maxX, note.positionX + CARD_WIDTH);
      minY = Math.min(minY, note.positionY);
      maxY = Math.max(maxY, note.positionY + CARD_HEIGHT); // Approx height
    });

    // 2. Determine center of that bounding box
    const contentCenterX = minX + (maxX - minX) / 2;
    const contentCenterY = minY + (maxY - minY) / 2;

    // 3. Determine available viewport size
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 4. Calculate required zoom to fit (with padding)
    const contentWidth = maxX - minX + (VIEWPORT_PADDING * 2);
    const contentHeight = maxY - minY + (VIEWPORT_PADDING * 2);

    const scaleX = viewportWidth / contentWidth;
    const scaleY = viewportHeight / contentHeight;

    // Use the smaller scale to ensure everything fits, clamped to limits
    let targetZoom = Math.min(scaleX, scaleY);

    // Issue #6 fix: Track if zoom was clamped for user feedback
    const wasClampedDown = targetZoom > ZOOM_MAX;
    targetZoom = Math.max(ZOOM_MIN, Math.min(targetZoom, ZOOM_MAX));

    if (wasClampedDown) {
      console.warn('Content too dense to fit at max zoom (2.0x). Some content may be partially off-screen.');
    }

    // 5. Calculate new pan position
    // We want the content center to be at the screen center
    // Formula: ScreenCenter = ContentCenter * Zoom + Pan
    // Pan = ScreenCenter - (ContentCenter * Zoom)
    const screenCenterX = viewportWidth / 2;
    const screenCenterY = viewportHeight / 2;

    const targetX = screenCenterX - (contentCenterX * targetZoom);
    const targetY = screenCenterY - (contentCenterY * targetZoom);

    animateTo(targetX, targetY, targetZoom);

  }, [notes, resetToHome, animateTo]);

  // Story 5.1: Pan and zoom to specific card
  const panToCard = useCallback((cardX: number, cardY: number) => {
    // Center the card on screen at 100% zoom
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const screenCenterX = viewportWidth / 2;
    const screenCenterY = viewportHeight / 2;

    // Calculate card center
    const cardCenterX = cardX + CARD_WIDTH / 2;
    const cardCenterY = cardY + CARD_HEIGHT / 2;

    // Calculate pan position to center the card
    const targetZoom = 1; // Always zoom to 100% for clarity
    const targetX = screenCenterX - (cardCenterX * targetZoom);
    const targetY = screenCenterY - (cardCenterY * targetZoom);

    animateTo(targetX, targetY, targetZoom);
  }, [animateTo]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    resetToHome,
    fitToContent,
    panToCard,
    getPanPosition: () => ({ x: x.get(), y: y.get() }),
  }));

  // Detect prefers-reduced-motion on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Issue #1 fix: Notify parent when pan position changes
  useEffect(() => {
    const unsubscribeX = x.on('change', (latest) => {
      onPanChange({ x: latest, y: y.get() });
    });
    const unsubscribeY = y.on('change', (latest) => {
      onPanChange({ x: x.get(), y: latest });
    });

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y, onPanChange]);

  // Throttle state for wheel events (60fps max)
  const wheelTimeoutRef = useRef<number | null>(null);
  const pendingZoomRef = useRef<number | null>(null);

  // Mouse wheel zoom handler with zoom-to-cursor behavior and throttling
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Allow native browser zoom if Ctrl is NOT pressed (standard behavior is Ctrl+Wheel to zoom)
      // Actually, standard for canvas apps is Wheel to Pan, Ctrl+Wheel to Zoom.
      // Current impl: Wheel zooms always. Let's keep it for now as per Story 1.2.
      
      e.preventDefault();

      // Calculate zoom delta
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom * delta));

      // Only update if zoom actually changes
      if (newZoom !== zoom) {
        // Throttle zoom updates using requestAnimationFrame for 60fps
        if (wheelTimeoutRef.current === null) {
          wheelTimeoutRef.current = window.requestAnimationFrame(() => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Issue #4 fix: Apply pending zoom if it exists
            const zoomToApply = pendingZoomRef.current ?? newZoom;
            pendingZoomRef.current = null;

            // Calculate canvas coordinates before zoom
            const canvasX = (mouseX - x.get()) / zoom;
            const canvasY = (mouseY - y.get()) / zoom;

            // Calculate new pan position to keep mouse position fixed
            const newX = mouseX - canvasX * zoomToApply;
            const newY = mouseY - canvasY * zoomToApply;

            // Apply new zoom
            onZoomChange(zoomToApply);

            // Update pan position to maintain zoom-to-cursor behavior
            x.set(newX);
            y.set(newY);

            wheelTimeoutRef.current = null;
          });
        } else {
          // Store pending zoom for next frame
          pendingZoomRef.current = newZoom;
        }
      }
    },
    [zoom, onZoomChange, x, y]
  );

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const moveStep = e.shiftKey ? 500 : 100; // Larger jumps with Shift

      // Story 1.9: Handle Cmd+0 (Reset) and Cmd+1 (Fit)
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        resetToHome();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        fitToContent();
        return;
      }

      // Issue #1 & #2 fix: Space key handling moved to global window listener below

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          // Issue #9 fix: Update motion value and notify parent for virtualization
          {
            const newY = Math.min(PAN_LIMIT, y.get() + moveStep);
            y.set(newY);
            onPanChange({ x: x.get(), y: newY });
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          {
            const newY = Math.max(-PAN_LIMIT, y.get() - moveStep);
            y.set(newY);
            onPanChange({ x: x.get(), y: newY });
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          {
            const newX = Math.min(PAN_LIMIT, x.get() + moveStep);
            x.set(newX);
            onPanChange({ x: newX, y: y.get() });
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          {
            const newX = Math.max(-PAN_LIMIT, x.get() - moveStep);
            x.set(newX);
            onPanChange({ x: newX, y: y.get() });
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          onZoomChange(Math.min(ZOOM_MAX, zoom + 0.1));
          break;
        case '-':
        case '_':
          e.preventDefault();
          onZoomChange(Math.max(ZOOM_MIN, zoom - 0.1));
          break;
        case 'h':
        case 'H':
        { 
          const activeElement = document.activeElement;
          const isTyping = activeElement?.tagName === 'INPUT' ||
                          activeElement?.tagName === 'TEXTAREA' ||
                          activeElement?.getAttribute('contenteditable') === 'true';
          if (!isTyping) {
            e.preventDefault();
            resetToHome();
          }
          break; 
        }
        case 'Escape':
          // Remove focus from canvas
          if (canvasRef.current) {
            canvasRef.current.blur();
          }
          break;
      }
    },
    [zoom, onZoomChange, x, y, resetToHome, fitToContent, onPanChange]
  );

  // Issue #1 & #2 fix: Global space key handler to avoid conflicts with text input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && !isSpacePressed) {
        // Only enable pan mode if not typing in an input/textarea
        const activeElement = document.activeElement;
        const isTyping = activeElement?.tagName === 'INPUT' ||
                        activeElement?.tagName === 'TEXTAREA' ||
                        activeElement?.getAttribute('contenteditable') === 'true';

        if (!isTyping) {
          e.preventDefault();
          setIsSpacePressed(true);
        }
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [isSpacePressed]);

  // Story 1.3: Double-click handler - create note at clicked position OR reset home
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      // Only handle if clicking on canvas background, not on cards
      if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-background')) {
        // Story 1.3: If onDoubleClickCreate is provided, create a note at the clicked position
        if (onDoubleClickCreate) {
          onDoubleClickCreate(e.clientX, e.clientY);
        } else {
          // Fallback to home reset (original behavior)
          resetToHome();
        }
      }
    },
    [resetToHome, onDoubleClickCreate]
  );

  // Pinch gesture zoom for touch devices
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();

        // Calculate distance between two fingers
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        // Issue #8 fix: Use refs instead of DOM attributes
        if (pinchStartDistanceRef.current === null) {
          pinchStartDistanceRef.current = distance;
          pinchStartZoomRef.current = zoom;
        } else {
          const startDistance = pinchStartDistanceRef.current;
          const startZoom = pinchStartZoomRef.current || 1;

          // Calculate new zoom based on pinch ratio
          const ratio = distance / startDistance;
          const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, startZoom * ratio));

          onZoomChange(newZoom);
        }
      }
    },
    [zoom, onZoomChange]
  );

  const handleTouchEnd = useCallback(() => {
    // Reset pinch tracking when touch ends
    pinchStartDistanceRef.current = null;
    pinchStartZoomRef.current = null;
  }, []);

  return (
    <div
      ref={canvasRef}
      className={`fixed inset-0 overflow-hidden bg-background focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2 ${isSpacePressed ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      onDoubleClick={handleDoubleClick}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      aria-label="Infinite canvas workspace"
    >
      {/* Issue #13 fix: Background layer that captures drag for canvas panning */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing canvas-background"
        onPointerDown={(e) => {
          // Issue #8 fix: If Space is pressed, enable pan mode even when clicking on notes
          if (isSpacePressed) {
            e.stopPropagation(); // Prevent note drag when Space is pressed
            dragControls.start(e);
          } else if (e.target === backgroundRef.current) {
            // Normal background click without Space
            dragControls.start(e);
          }
        }}
        style={{ touchAction: 'none' }}
      />

      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false} // Disable automatic drag - only via dragControls
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{
          left: -PAN_LIMIT,
          right: PAN_LIMIT,
          top: -PAN_LIMIT,
          bottom: PAN_LIMIT,
        }}
        style={{
          x,
          y,
          scale: zoom,
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)', // Force GPU acceleration
        }}
        className="absolute inset-0 pointer-events-none" // Don't capture pointer events
        aria-hidden="true" // Hide from screen readers, canvas itself is labeled
      >
        {/* Issue #13 fix: No wrapper div - let children render directly so empty space falls through to background */}
        {children}
      </motion.div>
    </div>
  );
  }
);

BoardCanvas.displayName = 'BoardCanvas';
