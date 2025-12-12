import type { Note } from "../types/types";

// ✅ Fetch all notes
export async function fetchNotes() {
  const res = await fetch("/api/notes");
  if (!res.ok) throw new Error("Failed to fetch notes");
  const data = await res.json();
  return data.result.map((note: Note) => ({
      ...note,
      x: Number(note.x),
      y: Number(note.y),
      width: Number(note.width),
      height: Number(note.height),
    }
));
}

// ✅ Fetch notes by board
export async function fetchNotesByBoard(boardId: number) {
  const res = await fetch(`/api/notes/board/${boardId}`);
  if (!res.ok) throw new Error(`Failed to fetch notes for the board ${boardId}`);
  return res.json();
}

// ✅ Create a note
export async function createNote(note: unknown) {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to create note");
  const data = await res.json();
  return data.note;
}

// ✅ Update note content or position
export async function updateNote(id: string, payload: Partial<Pick<Note, "content" | "x" | "y" | "width" | "height" | "color" | "textColor" >>): Promise<Note> {
  const res = await fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

// ✅ Delete note
export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`/api/notes/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to delete note");
}
