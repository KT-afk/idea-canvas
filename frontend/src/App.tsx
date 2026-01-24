import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { Button } from "./components/Button";
import { EmptyState } from "./components/EmptyState";
import { NoteCard } from "./components/NoteCard";
import { useNoteMutations } from "./hooks/useNoteMutations";
import { useZIndexManager } from "./hooks/useZIndexManager";
import { fetchNotes } from "./services/notesService";
import type { Note } from "./types/types";

function App() {
  const boardRef = useRef<HTMLDivElement>(null);
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
    const positionX = window.innerWidth / 2 + offset - 96;
    const positionY = window.innerHeight / 2 + offset - 48;
    addNote.mutate({ content: "New Note", positionX, positionY });
  };

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
      <div ref={boardRef} className="fixed inset-0 overflow-hidden bg-background">
        <Button onClick={handleAddNote}>+</Button>
        <AnimatePresence>
          {boardRef &&
            notes.map((note: Note) => {
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
                  dragRef={boardRef}
                />
              );
            })}
        </AnimatePresence>
      </div>
    );
  }
}

export default App;
