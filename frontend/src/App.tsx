import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { createNote, deleteNote, updateNote } from "./api";
import { NoteCard } from "./components/NoteCard";
import type { Note } from "./types/types";
import { normalizeNote } from "./utilities/utils";

function App() {
  const [notes, setNotes] = useState<Note[]>([]);

  const addNote = async () => {
    const rect = boardRef.current?.getBoundingClientRect();
    const offset = (notes.length % 5) * 25;
    const x = (rect?.width ?? window.innerWidth) / 2 + offset - 96;
    const y = (rect?.height ?? window.innerHeight) / 2 + offset - 48;
    const newNote = await createNote({
      x,
      y,
      content: `New note`,
    });
    setNotes((prev) => [...prev, normalizeNote(newNote)]);
  };

  const editNote = async (id: string, newContent: string) => {
    const updated = await updateNote(id, { content: newContent });
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? normalizeNote(updated) : note))
    );
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const boardRef = useRef<HTMLDivElement>(null);

  const savePosition = async (id: string, x: number, y: number) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
    try {
      await updateNote(id, { x, y });
    } catch (e) {
      console.error(e);
      // optional: revert on failure
      // setNotes(prev => prev.map(n => (n.id === id ? { ...n, x: oldX, y: oldY } : n)));
    }
  };

  return (
    <div
      ref={boardRef}
      className="fixed h-screen inset-0 w-screen bg-black overflow-hidden"
      style={{ position: "relative" }}
    >
      <button
        onClick={addNote}
        className="fixed bottom-8 right-8 bg-blue-500 text-white text-3xl rounded-full w-14 h-14 text-3xl flex items-center justify-center shadow-lg hover:bg-blue-600 active:scale-95transition-transform"
      >
        +
      </button>
      <AnimatePresence>
        {notes.map((note) => (
          <motion.div
            key={note.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <NoteCard
              id={note.id}
              key={note.id}
              x={note.x ?? 0}
              y={note.y ?? 0}
              content={note.content}
              onEdit={editNote}
              onDelete={handleDeleteNote}
              onDragEndSave={savePosition}
              dragRef={boardRef}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default App;
