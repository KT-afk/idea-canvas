import { motion, useMotionValue, animate, useDragControls } from 'framer-motion';
import { useState, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { ReactNode } from 'react';

interface BoardCanvasProps {
  children: ReactNode;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPanChange: (position: { x: number; y: number }) => void;
  onDoubleClickCreate?: (screenX: number, screenY: number) => void; // Story 1.3: Create note on double-click
}

export interface BoardCanvasHandle {
  resetToHome: () => void;
  getPanPosition: () => { x: number; y: number };
}

// Constants for canvas bounds and zoom limits
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.0;
const PAN_LIMIT = 10000;
// Home position: canvas origin (0,0) centered on screen
const getHomePosition = () => ({
  x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
  y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  zoom: 1
});

export const BoardCanvas = forwardRef<BoardCanvasHandle, BoardCanvasProps>(
  ({ children, zoom, onZoomChange, onPanChange, onDoubleClickCreate }, ref) => {
  // Motion values for smooth dragging without re-renders
  // Start at home position (centered)
  const homePos = getHomePosition();
  const x = useMotionValue(homePos.x);
  const y = useMotionValue(homePos.y);

  // Track whether user prefers reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Track canvas focus for keyboard navigation
  const canvasRef = useRef<HTMLDivElement>(null);

  // Issue #13 fix: Use drag controls to only enable drag on background
  const dragControls = useDragControls();
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Issue #8 fix: Use refs for touch gesture state instead of DOM attributes
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number | null>(null);

  // Expose reset method to parent via ref
  useImperativeHandle(ref, () => ({
    resetToHome,
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

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          // Issue #10 fix: Clamp to bounds
          y.set(Math.min(PAN_LIMIT, y.get() + moveStep));
          break;
        case 'ArrowDown':
          e.preventDefault();
          y.set(Math.max(-PAN_LIMIT, y.get() - moveStep));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          x.set(Math.min(PAN_LIMIT, x.get() + moveStep));
          break;
        case 'ArrowRight':
          e.preventDefault();
          x.set(Math.max(-PAN_LIMIT, x.get() - moveStep));
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
          e.preventDefault();
          resetToHome();
          break;
        case 'Escape':
          // Remove focus from canvas
          if (canvasRef.current) {
            canvasRef.current.blur();
          }
          break;
      }
    },
    [zoom, onZoomChange, x, y]
  );

  // Reset to home position
  const resetToHome = useCallback(() => {
    const homePos = getHomePosition();
    // Issue #3 fix: Implement actual animation difference
    if (prefersReducedMotion) {
      // Instant reset if reduced motion preferred
      x.set(homePos.x);
      y.set(homePos.y);
      onZoomChange(homePos.zoom);
    } else {
      // Animated reset with smooth transitions
      animate(x, homePos.x, { duration: 0.3, ease: 'easeOut' });
      animate(y, homePos.y, { duration: 0.3, ease: 'easeOut' });
      onZoomChange(homePos.zoom);
    }
  }, [prefersReducedMotion, x, y, onZoomChange]);

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
      className="fixed inset-0 overflow-hidden bg-background focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
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
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          // Only start drag if clicking on background (not on children like notes)
          if (e.target === backgroundRef.current) {
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
