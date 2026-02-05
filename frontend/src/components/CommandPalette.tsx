import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, StickyNote, Lightbulb, FileText } from "lucide-react";
import type { Note } from "../types/types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (noteId: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  notes,
  onSelectNote,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return note.content.toLowerCase().includes(searchLower);
  });

  const handleSelect = (noteId: string) => {
    onSelectNote(noteId);
    onClose();
    setSearch(""); // Reset search
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm">
      <Command
        className="w-full max-w-2xl bg-card border border-border/50 rounded-lg shadow-2xl overflow-hidden"
        shouldFilter={false} // We handle filtering manually
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-border/50">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search notes and ideas..."
            className="flex-1 py-4 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground bg-muted rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          {/* Empty State */}
          {filteredNotes.length === 0 && search && (
            <Command.Empty className="py-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <Search className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No results found for "{search}"
                </p>
                <p className="text-xs text-muted-foreground/75">
                  Try different keywords or create a new note
                </p>
              </div>
            </Command.Empty>
          )}

          {/* Empty State - No Search */}
          {filteredNotes.length === 0 && !search && (
            <div className="py-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <Search className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Start typing to search your notes and ideas
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {filteredNotes.length > 0 && (
            <Command.Group heading="Results" className="text-xs font-medium text-muted-foreground px-2 py-1.5">
              {filteredNotes.map((note) => (
                <Command.Item
                  key={note.id}
                  value={note.id}
                  onSelect={() => handleSelect(note.id)}
                  className="flex items-start gap-3 px-3 py-3 rounded-md cursor-pointer transition-colors data-[selected=true]:bg-primary/10 hover:bg-primary/10"
                >
                  {/* Type Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {note.type === "idea" && (
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                    )}
                    {note.type === "plan" && (
                      <FileText className="w-4 h-4 text-blue-500" />
                    )}
                    {note.type === "note" && (
                      <StickyNote className="w-4 h-4 text-gray-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2 mb-1">
                      {highlightMatches(note.content, search)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{note.type}</span>
                      {note.boardId && (
                        <>
                          <span>•</span>
                          <span>Board</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Type Badge */}
                  <div className="flex-shrink-0">
                    {note.type === "idea" && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-yellow-500 text-yellow-950">
                        IDEA
                      </span>
                    )}
                    {note.type === "plan" && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-500 text-blue-950">
                        PLAN
                      </span>
                    )}
                    {note.type === "note" && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-500 text-gray-950">
                        NOTE
                      </span>
                    )}
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        {/* Footer Hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-background rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-background rounded">↵</kbd>
              Select
            </span>
          </div>
          <span>{filteredNotes.length} results</span>
        </div>
      </Command>
    </div>
  );
}

// Helper function to highlight matching text
function highlightMatches(text: string, search: string): React.ReactNode {
  if (!search) return text;

  const parts = text.split(new RegExp(`(${search})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300/50 text-foreground font-medium">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
