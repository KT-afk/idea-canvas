// ✅ Fetch all notes
export async function fetchNotes() {
  const res = await fetch("/api/get/notes");
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

// ✅ Fetch notes by board
export async function fetchNotesByBoard(boardId: number) {
  const res = await fetch(`/api/notes/board/${boardId}`);
  if (!res.ok) throw new Error(`Failed to fetch notes for the board ${boardId}`);
  return res.json();
}

// ✅ Create a note
export async function createNote(note: unknown) {
  const res = await fetch("/api/insert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

// ✅ Update note content or position
export async function updateNoteContent(note: unknown) {
  const res = await fetch("/api/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

// ✅ Delete note
export async function deleteNote(id: number) {
  const res = await fetch("/api/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to delete note");
}
