import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { NoteCard } from "./components/NoteCard";

function App() {
  const [notes, setNotes] = useState([
    { id: 1, text: "Learn Tailwind" },
    { id: 2, text: "Learn Node.js" },
    { id: 3, text: "Build IdeaCanvas!" },
  ]);

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      text: `New note ${notes.length + 1}`,
    };
    setNotes([...notes, newNote]);
  };

  const editNote = (id: number, newText: string) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, text: newText } : note))
    );
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id));
  };
  const boardRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={boardRef} className="h-screen w-screen bg-black flex items-center justify-center gap-4 flex-wrap">
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
              text={note.text}
              onEdit={editNote} 
              onDelete={deleteNote}
              dragRef={boardRef}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default App;
