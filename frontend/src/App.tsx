import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AutosaveIndicator } from "./components/AutosaveIndicator"; // Story 1.8
import { BoardCanvas, type BoardCanvasHandle } from "./components/BoardCanvas";
import { CanvasControls } from "./components/CanvasControls";
import { EmptyState } from "./components/EmptyState";
import { NoteCard } from "./components/NoteCard";
import { IdeaCard } from "./components/IdeaCard"; // Story 1.6
import { PlanCard } from "./components/PlanCard"; // Story 1.6
import { NoteCardSkeleton } from "./components/NoteCardSkeleton";
import { NewBoardDialog } from "./components/NewBoardDialog"; // Story 3.1
import { BoardSwitcher } from "./components/BoardSwitcher"; // Story 3.1
import { useNoteMutations } from "./hooks/useNoteMutations";
import { useBoardMutations } from "./hooks/useBoardMutations"; // Story 3.1
import { useZIndexManager } from "./hooks/useZIndexManager";
import { fetchNotes } from "./services/notesService";
import { fetchBoards } from "./services/boardsService"; // Story 3.1
import type { Note } from "./types/types";

function App() {
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<BoardCanvasHandle>(null);
  const [zoom, setZoom] = useState(1); // 1 = 100% zoom
  // Start canvas centered: canvas origin (0,0) appears at screen center
  const [panPosition, setPanPosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0
  });

  // Track newly created note ID for auto-focus (Story 1.3)
  const [newNoteId, setNewNoteId] = useState<string | null>(null);

  // Story 1.3 AC#8: Track pending note position for skeleton (optimistic feel)
  const [pendingNotePosition, setPendingNotePosition] = useState<{ x: number; y: number } | null>(null);

  // Story 3.1: Track current board (default to first board or null)
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);

  // Story 3.1: Fetch all boards
  const {
    data: boards = [],
  } = useQuery({
    queryKey: ["boards"],
    queryFn: fetchBoards,
  });

  const {
    data: notes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notes", currentBoardId],
    queryFn: fetchNotes,
    enabled: !!currentBoardId,
  });

  // Story 3.1: Set default board when boards are loaded
  useEffect(() => {
    if (boards.length > 0 && !currentBoardId) {
      setCurrentBoardId(boards[0].id);
    }
  }, [boards, currentBoardId]);

  // Story 3.3: Auto-switch to fallback board if current board is deleted
  useEffect(() => {
    if (currentBoardId && boards.length > 0) {
      const currentBoardExists = boards.some((b) => b.id === currentBoardId);
      if (!currentBoardExists) {
        // Current board was deleted, switch to first board alphabetically
        // Use [...boards] to avoid mutating the original array
        const fallbackBoard = [...boards].sort((a, b) => a.name.localeCompare(b.name))[0];
        setCurrentBoardId(fallbackBoard.id);
      }
    }
  }, [boards, currentBoardId]);

  const { addNote, editNote, updatePosition, updateColor, updateTextColor, updateType, deleteNote, archiveNote, restoreNote } = useNoteMutations();
  const { createBoard } = useBoardMutations(); // Story 3.1
  const { order, bringToFront } = useZIndexManager(notes);

  // Story 2.3: Toggle to show/hide archived items
  const [showArchived, setShowArchived] = useState(false);

  // Story 3.1: New board dialog state
  const [isNewBoardDialogOpen, setIsNewBoardDialogOpen] = useState(false);

  // Issue #4: Calculate archived count for badge
  const archivedCount = useMemo(() => {
    return notes.filter(note => (note.status ?? 'active') === 'archived').length;
  }, [notes]);

  // Story 1.3 & 1.5: Handle adding note with type selection and optional position (for double-click)
  const handleAddNote = useCallback((type: 'note' | 'idea' | 'plan', clickPositionX?: number, clickPositionY?: number) => {
    const offset = (notes.length % 5) * 25;
    // Use clicked position or default to canvas center (0, 0) with offset
    const positionX = clickPositionX !== undefined ? clickPositionX : offset;
    const positionY = clickPositionY !== undefined ? clickPositionY : offset;

    // AC #8: Show skeleton immediately for optimistic feel
    setPendingNotePosition({ x: positionX, y: positionY });

    // Create note with single space (backend requires non-empty content)
    // The space will be selected on focus so user can immediately type over it
    addNote.mutate(
      { content: " ", positionX, positionY, type, status: "active", boardId: currentBoardId ?? undefined },
      {
        onSuccess: (data) => {
          // Clear skeleton and set newNoteId to trigger auto-focus
          setPendingNotePosition(null);
          if (data?.id) {
            setNewNoteId(data.id);
          }
        },
        onError: () => {
          // Clear skeleton on error (could add error toast here)
          setPendingNotePosition(null);
        },
      }
    );
  }, [notes.length, addNote, currentBoardId]);

  // Story 1.3: Handle double-click on canvas to create note at clicked position
  const handleCanvasDoubleClick = useCallback((screenX: number, screenY: number) => {
    // Convert screen coordinates to canvas coordinates
    // Formula: canvasX = (screenX - panPosition.x) / zoom
    const canvasX = (screenX - panPosition.x) / zoom;
    const canvasY = (screenY - panPosition.y) / zoom;

    // Double-click defaults to 'note' type
    handleAddNote('note', canvasX, canvasY);
  }, [panPosition, zoom, handleAddNote]);

  // Story 1.3: Keyboard shortcut ⌘N/Ctrl+N for new note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // mod+n: Cmd+N on Mac, Ctrl+N on Windows
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleAddNote('note'); // Create note at center (default position)
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddNote]);

  // Story 1.3: Clear newNoteId after it's been used for auto-focus
  const handleClearNewNote = useCallback((noteId: string) => {
    if (newNoteId === noteId) {
      setNewNoteId(null);
    }
  }, [newNoteId]);

  // Story 3.1: Handle creating a new board and switch to it
  const handleCreateBoard = useCallback((name: string) => {
    createBoard.mutate(name, {
      onSuccess: (newBoard) => {
        // Story 3.1: Automatically switch to the newly created board
        setCurrentBoardId(newBoard.id);
      },
    });
  }, [createBoard]);

  // Zoom control handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2, prev + 0.1));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.25, prev - 0.1));
  };

  const handleResetHome = () => {
    canvasRef.current?.resetToHome();
  };

  // Story 1.9: Handle "Fit to Content"
  const handleFitToContent = () => {
    canvasRef.current?.fitToContent();
  };

  // Virtualization: Only render visible cards + buffer zone
  const visibleNotes = useMemo(() => {
    // Issue #6 fix: Larger buffer accounting for card size and zoom
    const CARD_WIDTH = 192; // w-48 = 12rem = 192px
    const buffer = Math.max(500, CARD_WIDTH * 2);
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Use panPosition state instead of ref
    const panX = panPosition.x;
    const panY = panPosition.y;

    // Calculate viewport bounds in canvas coordinates
    const viewportBounds = {
      minX: (-panX / zoom) - buffer,
      maxX: ((-panX + windowWidth) / zoom) + buffer,
      minY: (-panY / zoom) - buffer,
      maxY: ((-panY + windowHeight) / zoom) + buffer,
    };

    // Story 2.3: Filter by status (archived vs active) and viewport bounds
    return notes.filter((note: Note) => {
      // Issue #2 fix: Explicit default for status field
      const noteStatus = note.status ?? 'active';
      const statusMatch = showArchived ? true : noteStatus !== 'archived';

      // Then filter by viewport bounds
      const inViewport =
        note.positionX >= viewportBounds.minX &&
        note.positionX <= viewportBounds.maxX &&
        note.positionY >= viewportBounds.minY &&
        note.positionY <= viewportBounds.maxY;

      return statusMatch && inViewport;
    });
  }, [notes, zoom, panPosition, showArchived]);

  // Handle loading and error states after hooks
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading notes.</div>;
  }

  // Issue #1 fix: Show empty state only if no active notes AND no pending creation
  const hasActiveNotes = notes.some(note => (note.status ?? 'active') !== 'archived');
  if (!hasActiveNotes && !pendingNotePosition) {
    return (
      <div className="h-screen w-screen bg-background">
        <EmptyState onAdd={() => handleAddNote('note')} />
      </div>
    );
  } else {
    return (
      <>
        <BoardCanvas
          ref={canvasRef}
          zoom={zoom}
          onZoomChange={setZoom}
          onPanChange={setPanPosition}
          onDoubleClickCreate={handleCanvasDoubleClick}
          notes={notes} // Story 1.9: Pass notes for "Fit to Content" calculation
        >
          <div ref={boardRef} className="relative w-full h-full">
            <AnimatePresence>
              {/* Story 1.3 AC#8: Show skeleton while note is being created */}
              {pendingNotePosition && (
                <NoteCardSkeleton
                  key="pending-note"
                  positionX={pendingNotePosition.x}
                  positionY={pendingNotePosition.y}
                />
              )}
              {visibleNotes.map((note: Note) => {
                // Story 1.6: Conditionally render card type based on note.type
                  const cardProps = {
                    id: note.id,
                    key: note.id,
                    positionX: note.positionX ?? 0,
                    positionY: note.positionY ?? 0,
                    backgroundColor: note.backgroundColor ?? "yellow",
                    textColor: note.textColor ?? "black",
                    content: note.content,
                    type: note.type ?? "note",
                    status: note.status ?? "active", // Story 2.3
                    isNew: note.id === newNoteId,
                    onEdit: (id: string, newContent: string) =>
                      editNote.mutateAsync({ id, payload: { content: newContent }, boardId: currentBoardId ?? undefined }),
                    onColorChange: (backgroundColor: string) => updateColor.mutate({id:note.id, backgroundColor, boardId: currentBoardId ?? undefined}),
                    onTextColorChange: (textColor: string) => updateTextColor.mutate({id:note.id, textColor, boardId: currentBoardId ?? undefined}),
                    onTypeChange: (type: 'note' | 'idea' | 'plan') => updateType.mutate({id: note.id, type, boardId: currentBoardId ?? undefined}),
                    onDelete: (id: string) => deleteNote.mutate(id),
                    onArchive: (id: string) => archiveNote.mutate({id, boardId: currentBoardId ?? undefined}), // Story 2.3
                    onRestore: (id: string) => restoreNote.mutate({id, boardId: currentBoardId ?? undefined}), // Story 2.3
                    zIndex: order[note.id] ?? 0,
                    onBringToFront: () => bringToFront(note.id),
                    onDragEndSave: (id: string, positionX: number, positionY: number) =>
                      updatePosition.mutate({ id, positionX, positionY, boardId: currentBoardId ?? undefined }),
                    onNewNoteFocused: handleClearNewNote,
                  };

                // Render the appropriate card component based on type
                if (note.type === 'idea') {
                  return <IdeaCard {...cardProps} />;
                } else if (note.type === 'plan') {
                  return <PlanCard {...cardProps} />;
                } else {
                  return <NoteCard {...cardProps} />;
                }
              })}
            </AnimatePresence>
          </div>
        </BoardCanvas>

        {/* Story 3.1: Board Switcher - Top Left */}
        <div className="fixed top-4 left-4 z-10">
          <BoardSwitcher
            boards={boards}
            currentBoardId={currentBoardId}
            onBoardChange={setCurrentBoardId}
          />
        </div>

        <CanvasControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetHome={handleResetHome}
          onFitToContent={handleFitToContent} // Story 1.9
          onAddNote={handleAddNote}
          showArchived={showArchived} // Story 2.3
          onToggleArchived={() => setShowArchived(!showArchived)} // Story 2.3
          archivedCount={archivedCount} // Issue #4
          onNewBoard={() => setIsNewBoardDialogOpen(true)} // Story 3.1
          zoomMin={0.25}
          zoomMax={2}
        />

        {/* Story 1.8: Auto-save indicator */}
        <AutosaveIndicator />

        {/* Story 3.1: New Board Dialog */}
        <NewBoardDialog
          open={isNewBoardDialogOpen}
          onOpenChange={setIsNewBoardDialogOpen}
          onCreateBoard={handleCreateBoard}
          isLoading={createBoard.isPending}
        />
      </>
    );
  }
}

export default App;
