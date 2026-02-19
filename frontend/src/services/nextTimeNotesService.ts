import type { NextTimeNote } from '../types/types';

const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchNextTimeNotes(parentNoteId: string): Promise<NextTimeNote[]> {
  const res = await fetch(`${API_URL}/api/notes/${parentNoteId}/next-time-notes`);
  if (!res.ok) throw new Error('Failed to fetch next-time notes');
  const json = await res.json();
  return json.data;
}

export async function createNextTimeNote(parentNoteId: string, content: string): Promise<NextTimeNote> {
  const res = await fetch(`${API_URL}/api/notes/${parentNoteId}/next-time-notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to create next-time note');
  const json = await res.json();
  return json.data;
}

export async function completeNextTimeNote(id: string): Promise<NextTimeNote> {
  const res = await fetch(`${API_URL}/api/next-time-notes/${id}/complete`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to complete next-time note');
  const json = await res.json();
  return json.data;
}

export async function deleteNextTimeNote(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/next-time-notes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete next-time note');
}
