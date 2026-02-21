import { Button } from './ui/button';
import { TypePickerPopover } from './Popover';
import { Plus, Maximize, Archive, FolderPlus } from 'lucide-react';

interface CanvasControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetHome: () => void;
  onFitToContent: () => void; // Story 1.9
  onAddNote: (type: 'note' | 'idea' | 'plan') => void;
  showArchived: boolean; // Story 2.3
  onToggleArchived: () => void; // Story 2.3
  archivedCount: number; // Issue #4: Show count of archived items
  onNewBoard: () => void; // Story 3.1: Create new board
  zoomMin: number;
  zoomMax: number;
}

export function CanvasControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetHome,
  onFitToContent,
  onAddNote,
  showArchived,
  onToggleArchived,
  archivedCount,
  onNewBoard,
  zoomMin,
  zoomMax,
}: CanvasControlsProps) {
  const zoomPercent = Math.round(zoom * 100);
  const isZoomInDisabled = zoom >= zoomMax;
  const isZoomOutDisabled = zoom <= zoomMin;

  return (
    <div
      className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-background/80 p-2 backdrop-blur-md shadow-lg border border-border/50"
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

      {/* Story 3.1: New Board Button */}
      <Button
        onClick={onNewBoard}
        size="sm"
        variant="ghost"
        aria-label="Create new board"
        title="Create new board"
      >
        <FolderPlus className="w-4 h-4" />
      </Button>

      {/* Type Picker Button - Prominent purple styling */}
      <TypePickerPopover
        icon={Plus}
        onTypeSelect={onAddNote}
      />

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Story 2.3: Toggle Archived Button - Issue #4: Show count */}
      <Button
        onClick={onToggleArchived}
        size="sm"
        variant={showArchived ? "default" : "ghost"}
        aria-label={showArchived ? "Hide archived items" : `Show archived items (${archivedCount})`}
        title={showArchived ? "Hide archived items" : `Show archived items (${archivedCount})`}
        className="relative"
      >
        <Archive className="w-4 h-4" />
        {archivedCount > 0 && !showArchived && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {archivedCount > 9 ? '9+' : archivedCount}
          </span>
        )}
      </Button>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Fit to Content Button */}
      <Button
        onClick={onFitToContent}
        size="sm"
        variant="ghost"
        aria-label="Fit to content (Cmd+1)"
        title="Fit to content (Cmd+1)"
      >
        <Maximize className="w-4 h-4" />
      </Button>

      {/* Home Button */}
      <Button
        onClick={onResetHome}
        size="sm"
        variant="ghost"
        aria-label="Return to home position"
        title="Return to home position (H or Cmd+0)"
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
