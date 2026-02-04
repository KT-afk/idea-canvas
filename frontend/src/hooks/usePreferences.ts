import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesService } from '../services/preferencesService';
import type { UserPreferences } from '../types/preference.types';
import { toast } from 'sonner';

export const usePreferences = (userId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['preferences', userId];

  const { data: preferences, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => preferencesService.getPreferences(userId),
    staleTime: Infinity, // Preferences don't change often
  });

  const setDefaultBoardMutation = useMutation({
    mutationFn: (boardId: string) => preferencesService.setDefaultBoard(boardId, userId),
    onMutate: async (boardId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<UserPreferences>(queryKey);

      // Optimistic update
      queryClient.setQueryData<UserPreferences>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, defaultBoardId: boardId };
      });

      return { previous };
    },
    onError: (_err, _newBoardId, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error('Failed to set default board');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Default board updated');
    }
  });

  return {
    preferences,
    isLoading,
    error,
    setDefaultBoard: setDefaultBoardMutation.mutate,
    isUpdatingDefault: setDefaultBoardMutation.isPending
  };
};
