import type { Note } from '../types/types';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Fetch one "forgotten" idea to resurface.
 * Returns null if no idea qualifies (204 No Content) or on error.
 */
export async function fetchResurfaceIdea(frequency = 'normal'): Promise<Note | null> {
  const res = await fetch(`${API_URL}/api/ideas/resurface?frequency=${frequency}`);
  if (res.status === 204) return null;
  if (!res.ok) throw new Error('Failed to fetch resurface idea');
  const json = await res.json();
  return json.data;
}

/**
 * Mark that the user viewed a resurfaced idea (clicked "View" on the toast).
 */
export async function markResurfaceActedOn(noteId: string): Promise<Note> {
  const res = await fetch(`${API_URL}/api/ideas/${noteId}/resurface-acted`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to mark resurface acted on');
  const json = await res.json();
  return json.data;
}
