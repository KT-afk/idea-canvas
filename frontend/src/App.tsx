import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { EmptyState } from "./components/EmptyState";
import { NoteCard } from "./components/NoteCard";
import { BoardCanvas, type BoardCanvasHandle } from "./components/BoardCanvas";
import { CanvasControls } from "./components/CanvasControls";
import { useNoteMutations } from "./hooks/useNoteMutations";
import { useZIndexManager } from "./hooks/useZIndexManager";
import { fetchNotes } from "./services/notesService";
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

  const {
    data: notes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  const { addNote, editNote, updatePosition, updateColor, updateTextColor, deleteNote } = useNoteMutations();
  const { order, bringToFront } = useZIndexManager(notes);

  const handleAddNote = () => {
    const offset = (notes.length % 5) * 25;
    // Position new notes at canvas center (0, 0) with offset
    const positionX = offset;
    const positionY = offset;
    addNote.mutate({ content: "New Note", positionX, positionY });
  };

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

    // Filter notes within viewport bounds
    return notes.filter(
      (note: Note) =>
        note.positionX >= viewportBounds.minX &&
        note.positionX <= viewportBounds.maxX &&
        note.positionY >= viewportBounds.minY &&
        note.positionY <= viewportBounds.maxY
    );
  }, [notes, zoom, panPosition]);

  // Handle loading and error states after hooks
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading notes.</div>;
  }

  if (notes.length === 0) {
    console.log("No notes found, rendering empty state.");
    return (
      <div className="h-screen w-screen bg-background">
        <EmptyState onAdd={handleAddNote} />
      </div>
    );
  } else {
    return (
      <>
        <BoardCanvas ref={canvasRef} zoom={zoom} onZoomChange={setZoom} onPanChange={setPanPosition}>
          <div ref={boardRef} className="relative w-full h-full">
            <AnimatePresence>
              {visibleNotes.map((note: Note) => {
                return (
                  <NoteCard
                    id={note.id}
                    key={note.id}
                    positionX={note.positionX ?? 0}
                    positionY={note.positionY ?? 0}
                    backgroundColor={note.backgroundColor ?? "yellow"}
                    textColor={note.textColor ?? "black"}
                    content={note.content}
                    onEdit={(id, newContent) =>
                      editNote.mutateAsync({ id, payload: { content: newContent } })
                    }
                    onColorChange={(backgroundColor) => updateColor.mutate({id:note.id, backgroundColor})}
                    onTextColorChange={(textColor) => updateTextColor.mutate({id:note.id, textColor})}
                    onDelete={(id) => deleteNote.mutate(id)}
                    zIndex={order[note.id] ?? 0}
                    onBringToFront={() => bringToFront(note.id)}
                    onDragEndSave={(id, positionX, positionY) => updatePosition.mutate({ id, positionX, positionY })}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </BoardCanvas>

        <CanvasControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetHome={handleResetHome}
          onAddNote={handleAddNote}
          zoomMin={0.25}
          zoomMax={2}
        />
      </>
    );
  }
}

export default App;
