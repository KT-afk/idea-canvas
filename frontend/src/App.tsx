import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createNote, deleteNote, fetchNotes, updateNote } from "./api";
import { Button } from "./components/Button";
import { EmptyState } from "./components/EmptyState";
import { NoteCard } from "./components/NoteCard";
import type { Note } from "./types/types";

function App() {
  const MAX_Z_INDEX = 1000;
  const queryClient = useQueryClient();
  const [order, setOrder] = useState<Record<string, number>>({});
  const boardRef = useRef<HTMLDivElement>(null);
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
  const bringToFront = (id: string) => {
    setOrder((prev: Record<string, number>) => {
      const currentZIndices = Object.values(prev);
      if (currentZIndices.length === 0) return prev;
      const currentMaxZ = Math.max(...currentZIndices);
      if (prev[id] === currentMaxZ) return prev;

      const newOrder = { ...prev };
      newOrder[id] = currentMaxZ + 1;

      if (currentMaxZ > MAX_Z_INDEX) {
        const sortedNotes = Object.entries(newOrder)
          .sort((a, b) => a[1] - b[1])
          .map(([id, index]) => [id, index + 1]);
        return Object.fromEntries(sortedNotes);
      }
      return newOrder;
    });
  };
  const handleAddNote = async () => {
    const offset = (notes.length % 5) * 25;
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
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);

      queryClient.setQueryData<Note[]>(
        ["notes"],
        (oldNotes) =>
          oldNotes?.map((note: Note) =>
            note.id === id ? { ...note, ...payload } : note
          ) ?? []
      );
      return { previousNotes };
    },
    onError: (_err, _var, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes"], context.previousNotes);
      }
    },
    onSettled: () => {
      // Don't refetch immediately.
      // Wait a tiny tick so all overlapping updates finish.
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      }, 50);
    },
  });

  const handleEditNoteContent = async (id: string, newContent: string) => {
    editNoteMutation.mutateAsync({ id, payload: { content: newContent } });
  };

  // Separate mutation for position updates
  const updatePositionMutation = useMutation({
    mutationFn: ({ id, x, y }: { id: string; x: number; y: number }) =>
      updateNote(id, { x, y }),
    onMutate: async ({ id, x, y }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);

      queryClient.setQueryData<Note[]>(["notes"], (oldNotes = []) =>
        oldNotes.map((note) => (note.id === id ? { ...note, x, y } : note))
      );

      return { previousNotes };
    },
    onError: (_err, _var, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes"], context.previousNotes);
      }
    },
    // Remove or comment out onSettled to prevent refetch
    // The optimistic update is enough
  });
  const deleteNodeMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
  const handleDeleteNote = async (id: string) => {
    deleteNodeMutation.mutate(id);
  };
  const handleEditNotePosition = (id: string, x: number, y: number) => {
    updatePositionMutation.mutate({ id, x, y });
  };

  // Move all hooks to the top, before any conditional returns
  useEffect(() => {
    if (notes.length === 0) return;

    setOrder((prev) => {
      const newOrder = { ...prev };
      let maxZIndex = 0;

      Object.entries(prev).forEach(([id, zIndex]) => {
        if (notes.some((note: Note) => note.id === id)) {
          newOrder[id] = zIndex;
          maxZIndex = Math.max(maxZIndex, zIndex);
        }
      });
      notes.forEach((note: Note) => {
        if (newOrder[note.id] === undefined) {
          newOrder[note.id] = maxZIndex;
          maxZIndex++;
        }
      });
      return newOrder;
    });
  }, [notes]);

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
      <div className="h-screen w-screen bg-black">
        <EmptyState onAdd={handleAddNote} />
      </div>
    );
  } else {
    return (
      <div ref={boardRef} className="fixed inset-0 overflow-hidden bg-black">
        <Button onClick={handleAddNote}>+</Button>
        <AnimatePresence>
          {boardRef &&
            notes.map((note: Note) => {
              return (
                <NoteCard
                  id={note.id}
                  key={note.id}
                  x={note.x ?? 0}
                  y={note.y ?? 0}
                  content={note.content}
                  onEdit={handleEditNoteContent}
                  onDelete={handleDeleteNote}
                  zIndex={order[note.id] ?? 0}
                  onBringToFront={() => bringToFront(note.id)}
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
