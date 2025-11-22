import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { createNote, deleteNote, fetchNotes, updateNote } from "./api";
import { Button } from "./components/Button";
import { EmptyState } from "./components/EmptyState";
import { NoteCard } from "./components/NoteCard";
import type { Note } from "./types/types";

function App() {
  const queryClient = useQueryClient();
  const {
    data: notes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  const addNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
  const handleAddNote = async () => {
    const rect = boardRef.current?.getBoundingClientRect();
    const offset = (notes.length % 5) * 25;
    const x = (rect?.width ?? window.innerWidth) / 2 + offset - 96;
    const y = (rect?.height ?? window.innerHeight) / 2 + offset - 48;
    addNoteMutation.mutate({ content: "New Note", x, y });
  };
  const editNoteMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{
        content: string;
        x: number;
        y: number;
        width: number;
        height: number;
      }>;
    }) => updateNote(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const handleEditNoteContent = async (id: string, newContent: string) => {
    editNoteMutation.mutateAsync({ id, payload: { content: newContent } });
  };
  const deleteNodeMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
  const handleDeleteNote = async (id: string) => {
    deleteNodeMutation.mutate(id);
  };
  const handleEditNotePosition = async (id: string, x: number, y: number) => {
    editNoteMutation.mutateAsync({ id, payload: { x, y } });
  };
  const boardRef = useRef<HTMLDivElement>(null);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error loading notes.</div>;
  }
  if (notes.length == 0) {
    console.log("No notes found, rendering empty state.");
    return (
      <div className="h-screen w-screen bg-black">
        <EmptyState onAdd={handleAddNote} />
      </div>
    );
  } else {
    return (
      <div
        ref={boardRef}
        className="fixed h-screen inset-0 w-screen bg-black overflow-hidden"
        style={{ position: "relative" }}
      >
        <Button onClick={handleAddNote}>+</Button>

        <AnimatePresence>
          {notes.map((note: Note) => {
            console.log("RENDER NOTE:", note);

            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <NoteCard
                  id={note.id}
                  key={note.id}
                  x={note.x ?? 0}
                  y={note.y ?? 0}
                  content={note.content}
                  onEdit={handleEditNoteContent}
                  onDelete={handleDeleteNote}
                  onDragEndSave={handleEditNotePosition}
                  dragRef={boardRef}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }
}

export default App;
