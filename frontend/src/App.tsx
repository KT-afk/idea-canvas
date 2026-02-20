import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AutosaveIndicator } from "./components/AutosaveIndicator"; // Story 1.8
import { BoardCanvas, type BoardCanvasHandle } from "./components/BoardCanvas";
import { CanvasControls } from "./components/CanvasControls";
import { EmptyState } from "./components/EmptyState";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { NoteCard } from "./components/NoteCard";
import { IdeaCard } from "./components/IdeaCard"; // Story 1.6
import { PlanCard } from "./components/PlanCard"; // Story 1.6
import { NoteCardSkeleton } from "./components/NoteCardSkeleton";
import { NewBoardDialog } from "./components/NewBoardDialog"; // Story 3.1
import { Toolbar } from "./components/Toolbar"; // Professional toolbar
import { CommandPalette } from "./components/CommandPalette"; // Story 5.1
import { ConnectionSuggestionsPanel } from "./components/connections/ConnectionSuggestionsPanel"; // Story 6.3
import { ConnectionLines } from "./components/connections/ConnectionLines"; // Story 6.4
import { useNoteMutations } from "./hooks/useNoteMutations";
import { useBoardMutations } from "./hooks/useBoardMutations"; // Story 3.1
import { usePreferences } from "./hooks/usePreferences"; // Story 3.4
import { useZIndexManager } from "./hooks/useZIndexManager";
import { useResurfacing } from "./hooks/useResurfacing"; // Epic 7
import { fetchNotesByBoard } from "./services/notesService";
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

  // Story 3.4: Fetch user preferences
  const { preferences, setResurfaceFrequency, isUpdatingFrequency } = usePreferences();

  const {
    data: notes = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["notes", currentBoardId],
    queryFn: () => fetchNotesByBoard(currentBoardId ?? ""),
    enabled: !!currentBoardId,
  });

  // Initialize mutations before using them in effects
  const { addNote, editNote, updatePosition, updateColor, updateTextColor, updateType, deleteNote, archiveNote, restoreNote, moveNote } = useNoteMutations();
  const { createBoard } = useBoardMutations(); // Story 3.1
  const { order, bringToFront } = useZIndexManager(notes);

  // Story 3.4: Set default board when boards and preferences are loaded
  // Auto-create default board if none exist
  useEffect(() => {
    if (boards.length === 0 && !createBoard.isPending) {
      // Create a default "My Board" on first load
      createBoard.mutate("My Board", {
        onSuccess: (newBoard) => {
          setCurrentBoardId(newBoard.id);
        },
      });
      return;
    }

    if (boards.length > 0 && !currentBoardId) {
      // Try to use preferred default board (if available)
      if (preferences?.defaultBoardId) {
        const defaultBoardExists = boards.some(b => b.id === preferences.defaultBoardId);
        if (defaultBoardExists) {
          setCurrentBoardId(preferences.defaultBoardId);
          return;
        }
      }
      
      // Fallback to first board (don't wait for preferences to load)
      setCurrentBoardId(boards[0].id);
    }
  }, [boards, currentBoardId, preferences, createBoard]);

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

  // Story 2.3: Toggle to show/hide archived items
  const [showArchived, setShowArchived] = useState(false);

  // Story 3.1: New board dialog state
  const [isNewBoardDialogOpen, setIsNewBoardDialogOpen] = useState(false);

  // Story 5.1: Command palette state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Story 6.3: Connection suggestions panel state
  const [isConnectionsPanelOpen, setIsConnectionsPanelOpen] = useState(false);

  // Issue #4: Calculate archived count for badge
  const archivedCount = useMemo(() => {
    return notes.filter((note: Note) => (note.status ?? 'active') === 'archived').length;
  }, [notes]);

  // Story 1.3 & 1.5: Handle adding note with type selection and optional position (for double-click)
  const handleAddNote = useCallback((type: 'note' | 'idea' | 'plan', clickPositionX?: number, clickPositionY?: number) => {
    // BUG FIX: Ensure we have a valid board before creating a note
    if (!currentBoardId) {
      console.error('Cannot create note: No board selected');
      toast.error('Please wait for the board to be created');
      return;
    }

    const offset = (notes.length % 5) * 25;
    // Use clicked position or default to canvas center (0, 0) with offset
    const positionX = clickPositionX !== undefined ? clickPositionX : offset;
    const positionY = clickPositionY !== undefined ? clickPositionY : offset;

    // AC #8: Show skeleton immediately for optimistic feel
    setPendingNotePosition({ x: positionX, y: positionY });

    // Create note with single space (backend requires non-empty content)
    // The space will be selected on focus so user can immediately type over it
    addNote.mutate(
      { content: " ", positionX, positionY, type, status: "active", boardId: currentBoardId },
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
      // Story 5.1: ⌘K/Ctrl+K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

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

  // Story 5.4: Track highlighted note from search (for 3s glow effect)
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null);

  // Story 5.1: Handle selecting a note from command palette
  const handleSelectNote = useCallback((noteId: string) => {
    const note = notes.find((n: Note) => n.id === noteId);
    if (!note) return;

    // Pan and zoom to bring the note into view
    canvasRef.current?.panToCard(note.positionX, note.positionY);

    // Bring the note to front for visual emphasis
    bringToFront(noteId);

    // Story 5.4: Trigger 3s highlight glow
    setHighlightedNoteId(noteId);
    setTimeout(() => setHighlightedNoteId(null), 3100); // Clear after 3.1s (slightly longer than animation)
  }, [notes, bringToFront]);

  // Story 3.1: Handle creating a new board and switch to it
  const handleCreateBoard = useCallback((name: string) => {
    createBoard.mutate(name, {
      onSuccess: (newBoard) => {
        // Story 3.1: Automatically switch to the newly created board
        setCurrentBoardId(newBoard.id);
      },
    });
  }, [createBoard]);

  // Story 6.6: Navigate to a card from connections panel or connection line
  const handleNavigateTo = useCallback((positionX: number, positionY: number) => {
    canvasRef.current?.panToCard(positionX, positionY);
  }, []);

  // Epic 7: Resurface a forgotten idea 2s after load
  // Only enable once notes have loaded and at least one idea exists (avoids useless API call on empty boards)
  const hasIdeas = notes.some((n: Note) => n.type === 'idea' && (n.status ?? 'active') === 'active');
  useResurfacing({
    frequency: preferences?.resurfaceFrequency ?? 'normal',
    enabled: !!currentBoardId && !isLoading && hasIdeas,
    onView: (idea) => handleNavigateTo(idea.positionX, idea.positionY),
  });

  // Epic 8: Graduate an idea to a plan
  const handleGraduate = useCallback((id: string) => {
    updateType.mutate({ id, type: 'plan', boardId: currentBoardId ?? undefined });
  }, [updateType, currentBoardId]);

  // Story 2.4: Move a note to a different board
  const handleMoveNote = useCallback((id: string, targetBoardId: string, targetBoardName: string) => {
    if (!currentBoardId) return;
    const note = notes.find((n: Note) => n.id === id);
    if (!note) return;
    moveNote.mutate({ id, sourceBoardId: currentBoardId, targetBoardId, targetBoardName, note });
  }, [moveNote, currentBoardId, notes]);

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
    return <LoadingState message="Loading your ideas..." />;
  }

  if (isError) {
    return (
      <ErrorState 
        title="Couldn't load your notes"
        message="We're having trouble connecting to the server. Please check your internet connection and try again."
        onRetry={() => refetch()}
        onGoHome={() => window.location.reload()}
      />
    );
  }

  // Issue #1 fix: Show empty state only if no active notes AND no pending creation
  // BUG FIX: Don't show empty state if we don't have a valid board yet (board creation pending)
  const hasActiveNotes = notes.some((note: Note) => (note.status ?? 'active') !== 'archived');
  if (!hasActiveNotes && !pendingNotePosition) {
    // If currentBoardId is null, we're still creating the default board - show loading
    if (!currentBoardId) {
      return <LoadingState message="Setting up your workspace..." />;
    }
    
    return (
      <div className="h-screen w-screen bg-background flex flex-col">
        {/* Toolbar even in empty state */}
        <Toolbar
          boards={boards}
          currentBoardId={currentBoardId}
          onBoardChange={setCurrentBoardId}
          onSearch={() => setIsCommandPaletteOpen(true)}
          onFindConnections={() => setIsConnectionsPanelOpen(true)}
          resurfaceFrequency={preferences?.resurfaceFrequency}
          onResurfaceFrequencyChange={setResurfaceFrequency}
          isUpdatingFrequency={isUpdatingFrequency}
        />
        <div className="flex-1">
          <EmptyState onAdd={() => handleAddNote('note')} />
        </div>
      </div>
    );
  } else {
    return (
      <>
        {/* Professional Toolbar */}
        <Toolbar
          boards={boards}
          currentBoardId={currentBoardId}
          onBoardChange={setCurrentBoardId}
          onSearch={() => setIsCommandPaletteOpen(true)}
          onFindConnections={() => setIsConnectionsPanelOpen(true)}
          resurfaceFrequency={preferences?.resurfaceFrequency}
          onResurfaceFrequencyChange={setResurfaceFrequency}
          isUpdatingFrequency={isUpdatingFrequency}
        />
        
        <BoardCanvas
          ref={canvasRef}
          zoom={zoom}
          onZoomChange={setZoom}
          onPanChange={setPanPosition}
          onDoubleClickCreate={handleCanvasDoubleClick}
          notes={notes} // Story 1.9: Pass notes for "Fit to Content" calculation
        >
          <div ref={boardRef} className="relative w-full h-full">
            {/* Story 6.4: Connection Lines (SVG overlay behind cards) */}
            <ConnectionLines
              boardId={currentBoardId}
              zoom={zoom}
              onNavigateTo={handleNavigateTo}
            />
            
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
                  positionX: note.positionX ?? 0,
                  positionY: note.positionY ?? 0,
                  backgroundColor: note.backgroundColor ?? "yellow",
                  textColor: note.textColor ?? "black",
                  content: note.content,
                  type: note.type ?? "note",
                  status: note.status ?? "active", // Story 2.3
                  isNew: note.id === newNoteId,
                  shouldHighlight: note.id === highlightedNoteId, // Story 5.4: Trigger 3s glow
                  zoom: zoom, // Pass zoom for coordinate conversion during drag
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
                  onGraduate: handleGraduate,
                  // Story 2.4: Move to board
                  boards,
                  currentBoardId: currentBoardId ?? undefined,
                  onMove: handleMoveNote,
                };

                // Render the appropriate card component based on type
                if (note.type === 'idea') {
                  return <IdeaCard key={note.id} {...cardProps} />;
                } else if (note.type === 'plan') {
                  return <PlanCard key={note.id} {...cardProps} />;
                } else {
                  return <NoteCard key={note.id} {...cardProps} />;
                }
              })}
            </AnimatePresence>
          </div>
        </BoardCanvas>

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

        {/* Story 5.1: Command Palette */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          notes={notes}
          boards={boards}
          onSelectNote={handleSelectNote}
        />

        {/* Story 6.3: Connection Suggestions Panel */}
        <ConnectionSuggestionsPanel
          isOpen={isConnectionsPanelOpen}
          onClose={() => setIsConnectionsPanelOpen(false)}
          boardId={currentBoardId}
          onConnectionCreated={() => refetch()}
          onNavigateTo={handleNavigateTo}
        />
      </>
    );
  }
}

export default App;
