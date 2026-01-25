import { Button } from './ui/button';

interface CanvasControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetHome: () => void;
  onAddNote: () => void;
  zoomMin: number;
  zoomMax: number;
}

export function CanvasControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetHome,
  onAddNote,
  zoomMin,
  zoomMax,
}: CanvasControlsProps) {
  const zoomPercent = Math.round(zoom * 100);
  const isZoomInDisabled = zoom >= zoomMax;
  const isZoomOutDisabled = zoom <= zoomMin;

  return (
    <div
      className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-background/90 p-2 backdrop-blur-sm shadow-lg border"
      role="toolbar"
      aria-label="Canvas controls"
    >
      {/* Zoom Out Button */}
      <Button
        onClick={onZoomOut}
        disabled={isZoomOutDisabled}
        size="sm"
        variant="ghost"
        aria-label="Zoom out (-)"
        title="Zoom out (-)"
      >
        <span className="text-lg">−</span>
      </Button>

      {/* Zoom Percentage Display */}
      <div
        className="min-w-[4rem] text-center text-sm font-medium"
        aria-live="polite"
        aria-atomic="true"
      >
        {zoomPercent}%
      </div>

      {/* Zoom In Button */}
      <Button
        onClick={onZoomIn}
        disabled={isZoomInDisabled}
        size="sm"
        variant="ghost"
        aria-label="Zoom in (+)"
        title="Zoom in (+)"
      >
        <span className="text-lg">+</span>
      </Button>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Add Note Button - Prominent purple styling */}
      <Button
        onClick={onAddNote}
        size="sm"
        variant="default"
        aria-label="Add new note"
        title="Add new note"
        className="group bg-[#A855F7] hover:bg-[#9333EA] text-white px-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform group-hover:rotate-90 duration-200"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="text-xs font-medium">New</span>
      </Button>

      {/* Home Button */}
      <Button
        onClick={onResetHome}
        size="sm"
        variant="ghost"
        aria-label="Return to home position (H)"
        title="Return to home position (H)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Button>
    </div>
  );
}
