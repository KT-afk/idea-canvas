import { useState } from 'react'
import { NoteCard } from './components/NoteCard'

function App() {
  const [notes, setNotes] = useState([
    {id : 1, text: "Learn Tailwind"},
    {id : 2, text: "Learn Node.js"},
    {id: 3, text: "Build IdeaCanvas!"},
  ])

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      text: `New note ${notes.length + 1}`,
    };
    setNotes([...notes, newNote])
  }

  return (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center gap-4 flex-wrap">
      <Button onClick={addNote}>
        +
      </Button>
      {notes.map((note) => (
        <NoteCard key={note.id} text={note.text}/>
      ))}
    </div>
  )
}

export default App
