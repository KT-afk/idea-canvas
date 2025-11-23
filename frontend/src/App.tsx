import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
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
    //const rect = boardRef.current?.getBoundingClientRect();
    const offset = (notes.length % 5) * 25;
    // const x = (rect?.width ?? window.innerWidth) / 2 + offset - 96;
    // const y = (rect?.height ?? window.innerHeight) / 2 + offset - 48;
    const x = window.innerWidth / 2 + offset - 96;
    const y = window.innerHeight / 2 + offset - 48;
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
  const [boardRef, setBoardRef] = useState<HTMLDivElement | null>(null);

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
      <div ref={setBoardRef} className="fixed inset-0 overflow-hidden bg-black">
        <Button onClick={handleAddNote}>+</Button>
        <AnimatePresence>
          {boardRef && notes.map((note: Note) => {
            return (
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
            );
          })}
        </AnimatePresence>
      </div>
    );
  }
}

export default App;
