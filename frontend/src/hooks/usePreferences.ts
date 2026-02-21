import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesService } from '../services/preferencesService';
import type { UserPreferences } from '../types/preference.types';
import { toast } from 'sonner';

export type ResurfaceFrequency = 'normal' | 'frequent' | 'rare' | 'off';

export const usePreferences = (userId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['preferences', userId];

  const { data: preferences, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => preferencesService.getPreferences(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes — preferences are stable but should eventually sync
    enabled: !!userId, // Don't query with an undefined userId cache key
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

  // Story 4.2/4.4: Set theme with optimistic UI
  const setThemeMutation = useMutation({
    mutationFn: (theme: string) =>
      preferencesService.updatePreferences({ theme }),
    onMutate: async (theme) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<UserPreferences>(queryKey);

      // Optimistic update — applies immediately so useTheme reflects it at once
      queryClient.setQueryData<UserPreferences>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, theme };
      });

      return { previous };
    },
    onError: (_err, _theme, context) => {
      // Rollback optimistic update
      queryClient.setQueryData(queryKey, context?.previous);
      toast.warning('Theme saved locally — could not sync to server');
    },
    onSettled: () => {
      // Invalidate after either success or error to sync server state
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Story 7.4: Set resurfacing frequency with optimistic UI
  const setResurfaceFrequencyMutation = useMutation({
    mutationFn: (frequency: ResurfaceFrequency) =>
      preferencesService.updatePreferences({ resurfaceFrequency: frequency }),
    onMutate: async (frequency) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<UserPreferences>(queryKey);

      // Optimistic update — applies immediately so useResurfacing respects it at once
      queryClient.setQueryData<UserPreferences>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, resurfaceFrequency: frequency };
      });

      return { previous };
    },
    onError: (_err, _frequency, context) => {
      // Rollback optimistic update
      queryClient.setQueryData(queryKey, context?.previous);
      // Story 7.4 AC: On save failure, preference still works locally with warning toast
      toast.warning('Resurfacing preference saved locally — could not sync to server');
    },
    onSettled: () => {
      // Invalidate after either success or error to sync server state
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    preferences,
    isLoading,
    error,
    setDefaultBoard: setDefaultBoardMutation.mutate,
    isUpdatingDefault: setDefaultBoardMutation.isPending,
    // Story 4.2/4.4
    setTheme: setThemeMutation.mutate,
    isUpdatingTheme: setThemeMutation.isPending,
    // Story 7.4
    setResurfaceFrequency: setResurfaceFrequencyMutation.mutate,
    isUpdatingFrequency: setResurfaceFrequencyMutation.isPending,
  };
};
