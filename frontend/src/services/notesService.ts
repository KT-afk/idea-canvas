import type { Note } from "../types/types";

const API_URL = import.meta.env.VITE_API_URL || "";

// ✅ Fetch all notes
export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(`${API_URL}/api/notes`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  const data = await res.json();
  return data.data.map((note: Note) => ({
      ...note,
      positionX: Number(note.positionX),
      positionY: Number(note.positionY),
    }
  ));
}

// ✅ Fetch notes by board
export async function fetchNotesByBoard(boardId: number) {
  const res = await fetch(`${API_URL}/api/notes/board/${boardId}`);
  if (!res.ok) throw new Error(`Failed to fetch notes for the board ${boardId}`);
  const data = await res.json();
  return data.data;
}

// ✅ Create a note
export async function createNote(note: {
  content: string;
  positionX: number;
  positionY: number;
  type?: 'note' | 'idea' | 'plan';
  status?: 'active' | 'archived' | 'graduated';
}): Promise<Note> {
  const res = await fetch(`${API_URL}/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to create note");
  const data = await res.json();
  // Ensure positions are numbers (consistent with fetchNotes)
  return {
    ...data.data,
    positionX: Number(data.data.positionX),
    positionY: Number(data.data.positionY),
  };
}

// ✅ Update note content or position
export async function updateNote(id: string, payload: Partial<Pick<Note, "content" | "positionX" | "positionY" | "backgroundColor" | "textColor" >>): Promise<Note> {
  const res = await fetch(`${API_URL}/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update note");
  const data = await res.json();
  return data.data;
}

// ✅ Delete note
export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/notes/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to delete note");
}
