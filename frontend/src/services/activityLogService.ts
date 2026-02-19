import type { ActivityLogEntry } from '../types/types';

const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchActivityLog(noteId: string): Promise<ActivityLogEntry[]> {
  const res = await fetch(`${API_URL}/api/notes/${noteId}/activity`);
  if (!res.ok) throw new Error('Failed to fetch activity log');
  const json = await res.json();
  return json.data;
}
