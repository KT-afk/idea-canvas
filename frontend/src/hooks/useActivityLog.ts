import { useQuery } from '@tanstack/react-query';
import { fetchActivityLog } from '../services/activityLogService';

export function useActivityLog(noteId: string, enabled = true) {
  return useQuery({
    queryKey: ['activity-log', noteId],
    queryFn: () => fetchActivityLog(noteId),
    enabled: enabled && !!noteId,
  });
}
