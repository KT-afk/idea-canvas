import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchNextTimeNotes,
  createNextTimeNote,
  completeNextTimeNote,
  deleteNextTimeNote,
} from '../services/nextTimeNotesService';

export function useNextTimeNotes(parentNoteId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['next-time-notes', parentNoteId];

  const { data: notes = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchNextTimeNotes(parentNoteId),
    enabled: !!parentNoteId,
  });

  const addNote = useMutation({
    mutationFn: (content: string) => createNextTimeNote(parentNoteId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const completeNote = useMutation({
    mutationFn: (id: string) => completeNextTimeNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeNote = useMutation({
    mutationFn: (id: string) => deleteNextTimeNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { notes, isLoading, addNote, completeNote, removeNote };
}
