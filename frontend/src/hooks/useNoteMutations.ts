import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote, deleteNote, updateNote } from "../services/notesService";
import type { Note } from "../types/types";

export function useNoteMutations() {
  const queryClient = useQueryClient();

  const addNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

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
        color: string;
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
    
  });
  const updateColorMutation = useMutation({
    mutationFn: ({ id, color }: { id: string; color: string }) =>
      updateNote(id, {color}),
    onMutate: async ({ id, color }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);

      queryClient.setQueryData<Note[]>(["notes"], (oldNotes = []) =>
        oldNotes.map((note) => (note.id === id ? { ...note, color } : note))
      );

      return { previousNotes };
    },
    onError: (_err, _var, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes"], context.previousNotes);
      }
    },
    
  });
  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return {
    addNote: addNoteMutation,
    editNote: editNoteMutation,
    updatePosition: updatePositionMutation,
    updateColor: updateColorMutation,
    deleteNote: deleteNoteMutation,
  };
}
