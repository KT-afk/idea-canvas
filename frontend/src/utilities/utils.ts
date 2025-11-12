import type { Note } from "../types/types";

export const normalizeNote = (note: Note): Note => ({
  ...note,
  x: Number(note.x) || 0,
  y: Number(note.y) || 0,
  width: Number(note.width) || 192,
  height: Number(note.height) || 96,
});