import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote, deleteNote, updateNote } from "../services/notesService";
import type { Note } from "../types/types";

export function useNoteMutations() {
  const queryClient = useQueryClient();

  // Story 1.3: Simple note creation - wait for server response
  // No optimistic UI to avoid ID mismatch issues with auto-focus
  const addNoteMutation = useMutation({
    mutationFn: (data: {
      content: string;
      positionX: number;
      positionY: number;
      type?: 'note' | 'idea' | 'plan';
      status?: 'active' | 'archived' | 'graduated';
    }) => createNote(data),
    onSuccess: (data) => {
      // Add the new note to the cache with server-assigned ID
      if (data) {
        queryClient.setQueryData<Note[]>(["notes"], (oldNotes = []) => [
          ...oldNotes,
          data,
        ]);
      }
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
        positionX: number;
        positionY: number;
        backgroundColor: string;
        textColor: string;
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
    mutationFn: ({ id, positionX, positionY }: { id: string; positionX: number; positionY: number }) =>
      updateNote(id, { positionX, positionY }),
    onMutate: async ({ id, positionX, positionY }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);

      queryClient.setQueryData<Note[]>(["notes"], (oldNotes = []) =>
        oldNotes.map((note) => (note.id === id ? { ...note, positionX, positionY } : note))
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
  const updateColorMutation = useMutation({
    mutationFn: ({ id, backgroundColor }: { id: string; backgroundColor: string }) =>
      updateNote(id, {backgroundColor}),
    onMutate: async ({ id, backgroundColor }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);

      queryClient.setQueryData<Note[]>(["notes"], (oldNotes = []) =>
        oldNotes.map((note) => (note.id === id ? { ...note, backgroundColor } : note))
      );

      return { previousNotes };
    },
    onError: (_err, _var, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes"], context.previousNotes);
      }
    },
    
  });
  const updateTextColorMutation = useMutation({
    mutationFn: ({ id, textColor }: { id: string; textColor: string }) =>
      updateNote(id, {textColor}),
    onMutate: async ({ id, textColor }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes"]);

      queryClient.setQueryData<Note[]>(["notes"], (oldNotes = []) =>
        oldNotes.map((note) => (note.id === id ? { ...note, textColor } : note))
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
    updateTextColor: updateTextColorMutation,
    deleteNote: deleteNoteMutation,
  };
}
