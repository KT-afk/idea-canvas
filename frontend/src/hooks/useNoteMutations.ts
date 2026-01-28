import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
      boardId?: string; // Story 3.1: Support creating note in specific board
    }) => createNote(data),
    onSuccess: (data, variables) => {
      // Add the new note to the cache with server-assigned ID
      if (data) {
        // Fix: Use the correct query key including boardId
        const queryKey = variables.boardId 
          ? ["notes", variables.boardId] 
          : ["notes"];
          
        queryClient.setQueryData<Note[]>(queryKey, (oldNotes = []) => [
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
      boardId?: string; // Note: boardId not used in mutationFn, only in onMutate for cache key
    }) => updateNote(id, payload),
    onMutate: async (variables) => {
      const { id, payload, boardId } = variables;
      const queryKey = boardId ? ["notes", boardId] : ["notes"];
      await queryClient.cancelQueries({ queryKey });

      const previousNotes = queryClient.getQueryData<Note[]>(queryKey);

      queryClient.setQueryData<Note[]>(
        queryKey,
        (oldNotes) =>
          oldNotes?.map((note: Note) =>
            note.id === id ? { ...note, ...payload } : note
          ) ?? []
      );
      return { previousNotes, queryKey };
    },
    onSuccess: (updatedNote, { id }, context) => {
      // Update cache with server response to ensure consistency
      if (context?.queryKey) {
        queryClient.setQueryData<Note[]>(context.queryKey, (oldNotes = []) =>
          oldNotes.map((note) =>
            note.id === id ? { ...note, ...updatedNote } : note
          )
        );
      }
    },
    onError: (_err, _var, context) => {
      if (context?.previousNotes && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousNotes);
      }
      toast.error("Failed to save changes");
    },
  });

  // Story 1.4: Position update with optimistic UI, retry, and rollback on error
  const updatePositionMutation = useMutation({
    mutationFn: ({ id, positionX, positionY }: { id: string; positionX: number; positionY: number; boardId?: string }) =>
      updateNote(id, { positionX, positionY }),
    // Story 1.4 AC#5: Auto-retry once on failure
    retry: 1,
    retryDelay: 500,
    onMutate: async (variables) => {
      const { id, positionX, positionY, boardId } = variables;
      const queryKey = boardId ? ["notes", boardId] : ["notes"];
      await queryClient.cancelQueries({ queryKey });
      const previousNotes = queryClient.getQueryData<Note[]>(queryKey);

      // Optimistically update cache with new position
      queryClient.setQueryData<Note[]>(queryKey, (oldNotes = []) =>
        oldNotes.map((note) => (note.id === id ? { ...note, positionX, positionY } : note))
      );

      return { previousNotes, queryKey };
    },
    onSuccess: (updatedNote, { id }, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData<Note[]>(context.queryKey, (oldNotes = []) =>
          oldNotes.map((note) =>
            note.id === id ? { ...note, ...updatedNote } : note
          )
        );
      }
    },
    onError: (_err, _var, context) => {
      // Story 1.4 AC#5: Rollback position and show error toast after retries exhausted
      if (context?.previousNotes && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousNotes);
      }
      toast.error("Failed to save position");
    },
  });
  const updateColorMutation = useMutation({
    mutationFn: ({ id, backgroundColor }: { id: string; backgroundColor: string; boardId?: string }) =>
      updateNote(id, {backgroundColor}),
    onMutate: async (variables) => {
      const { id, backgroundColor, boardId } = variables;
      const queryKey = boardId ? ["notes", boardId] : ["notes"];
      await queryClient.cancelQueries({ queryKey });
      const previousNotes = queryClient.getQueryData<Note[]>(queryKey);

      queryClient.setQueryData<Note[]>(queryKey, (oldNotes = []) =>
        oldNotes.map((note) => (note.id === id ? { ...note, backgroundColor } : note))
      );

      return { previousNotes, queryKey };
    },
    onSuccess: (updatedNote, { id }, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData<Note[]>(context.queryKey, (oldNotes = []) =>
          oldNotes.map((note) =>
            note.id === id ? { ...note, ...updatedNote } : note
          )
        );
      }
    },
    onError: (_err, _var, context) => {
      if (context?.previousNotes && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousNotes);
      }
      toast.error("Failed to update color");
    },
  });
  const updateTextColorMutation = useMutation({
    mutationFn: ({ id, textColor }: { id: string; textColor: string; boardId?: string }) =>
      updateNote(id, {textColor}),
    onMutate: async (variables) => {
      const { id, textColor, boardId } = variables;
      const queryKey = boardId ? ["notes", boardId] : ["notes"];
      await queryClient.cancelQueries({ queryKey });
      const previousNotes = queryClient.getQueryData<Note[]>(queryKey);

      queryClient.setQueryData<Note[]>(queryKey, (oldNotes = []) =>
        oldNotes.map((note) => (note.id === id ? { ...note, textColor } : note))
      );

      return { previousNotes, queryKey };
    },
    onSuccess: (updatedNote, { id }, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData<Note[]>(context.queryKey, (oldNotes = []) =>
          oldNotes.map((note) =>
            note.id === id ? { ...note, ...updatedNote } : note
          )
        );
      }
    },
    onError: (_err, _var, context) => {
      if (context?.previousNotes && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousNotes);
      }
      toast.error("Failed to update text color");
    },
  });

  // Story 1.5: Type toggle with optimistic UI and error handling
  const updateTypeMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'note' | 'idea' | 'plan'; boardId?: string }) =>
      updateNote(id, { type }),
    onMutate: async (variables) => {
      const { id, type, boardId } = variables;
      const queryKey = boardId ? ["notes", boardId] : ["notes"];
      await queryClient.cancelQueries({ queryKey });
      const previousNotes = queryClient.getQueryData<Note[]>(queryKey);

      // Optimistically update cache with new type
      queryClient.setQueryData<Note[]>(queryKey, (oldNotes = []) =>
        oldNotes.map((note) => (note.id === id ? { ...note, type } : note))
      );

      return { previousNotes, queryKey };
    },
    onSuccess: (updatedNote, { id }, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData<Note[]>(context.queryKey, (oldNotes = []) =>
          oldNotes.map((note) =>
            note.id === id ? { ...note, ...updatedNote } : note
          )
        );
      }
    },
    onError: (_err, _var, context) => {
      // Story 1.5 AC: Rollback type and show error toast on failure
      if (context?.previousNotes && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousNotes);
      }
      toast.error("Failed to update type");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: (_, _variables, _context) => {
      // We don't have boardId in delete params usually, so we invalidate all.
      // Or we could pass boardId to deleteNote if we wanted to be specific.
      // For simplicity, invalidating ["notes"] (prefix) works for all boards if the cache is structured hierarchically?
      // No, react-query invalidation is fuzzy. ["notes"] invalidates ["notes", "1"], ["notes", "2"], etc.
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // Story 2.3: Archive note with optimistic UI and rollback
  const archiveNoteMutation = useMutation({
    mutationFn: ({ id }: { id: string; boardId?: string }) => updateNote(id, { status: 'archived' }),
    onMutate: async (variables) => {
      const { id, boardId } = variables;
      const queryKey = boardId ? ["notes", boardId] : ["notes"];
      await queryClient.cancelQueries({ queryKey });
      const previousNotes = queryClient.getQueryData<Note[]>(queryKey);

      // Optimistically update cache
      queryClient.setQueryData<Note[]>(queryKey, (oldNotes = []) =>
        oldNotes.map((note) =>
          note.id === id ? { ...note, status: 'archived' as const } : note
        )
      );

      return { previousNotes, queryKey };
    },
    onSuccess: (updatedNote, { id }, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData<Note[]>(context.queryKey, (oldNotes = []) =>
          oldNotes.map((note) =>
            note.id === id ? { ...note, ...updatedNote } : note
          )
        );
      }
      // Issue #3 fix: Show toast notification when item is archived
      toast.success("Item archived. Click the archive icon to view archived items.");
    },
    onError: (_err, _var, context) => {
      if (context?.previousNotes && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousNotes);
      }
      toast.error("Failed to archive");
    },
  });

  // Story 2.3: Restore note with optimistic UI and rollback
  const restoreNoteMutation = useMutation({
    mutationFn: ({ id }: { id: string; boardId?: string }) => updateNote(id, { status: 'active' }),
    onMutate: async (variables) => {
      const { id, boardId } = variables;
      const queryKey = boardId ? ["notes", boardId] : ["notes"];
      await queryClient.cancelQueries({ queryKey });
      const previousNotes = queryClient.getQueryData<Note[]>(queryKey);

      // Optimistically update cache
      queryClient.setQueryData<Note[]>(queryKey, (oldNotes = []) =>
        oldNotes.map((note) =>
          note.id === id ? { ...note, status: 'active' as const } : note
        )
      );

      return { previousNotes, queryKey };
    },
    onSuccess: (updatedNote, { id }, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData<Note[]>(context.queryKey, (oldNotes = []) =>
          oldNotes.map((note) =>
            note.id === id ? { ...note, ...updatedNote } : note
          )
        );
      }
      // Issue #3 fix: Show toast notification when item is restored
      toast.success("Item restored");
    },
    onError: (_err, _var, context) => {
      if (context?.previousNotes && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousNotes);
      }
      toast.error("Failed to restore");
    },
  });

  return {
    addNote: addNoteMutation,
    editNote: editNoteMutation,
    updatePosition: updatePositionMutation,
    updateColor: updateColorMutation,
    updateTextColor: updateTextColorMutation,
    updateType: updateTypeMutation,
    deleteNote: deleteNoteMutation,
    archiveNote: archiveNoteMutation,
    restoreNote: restoreNoteMutation,
  };
}
