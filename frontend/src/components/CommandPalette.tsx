import { useEffect, useState, useMemo } from "react";
import { Command } from "cmdk";
import { Search, StickyNote, Lightbulb, FileText, Sparkles, Filter, X } from "lucide-react";
import Fuse from "fuse.js";
import { toast } from "sonner";
import type { Note } from "../types/types";
import type { Board } from "../types/types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  boards: Board[];
  onSelectNote: (noteId: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  notes,
  boards,
  onSelectNote,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<"plain" | "smart">("plain");
  
  // Filter state
  const [filterBoard, setFilterBoard] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<Note["type"] | null>(null);
  const [filterStatus, setFilterStatus] = useState<Note["status"] | null>(null);

  // Track currently selected note ID for keyboard shortcuts
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(notes, {
      keys: ["content"],
      threshold: 0.4, // 0 = exact match, 1 = match anything
      ignoreLocation: true, // Search entire string
      minMatchCharLength: 2, // Min 2 chars to match
      includeScore: true,
      useExtendedSearch: false,
    });
  }, [notes]);

  // Filter notes based on search query, mode, and filters
  const filteredNotes = useMemo(() => {
    let results = notes;

    // Apply search (plain or smart)
    if (search) {
      if (searchMode === "plain") {
        // Plain keyword search
        const searchLower = search.toLowerCase();
        results = results.filter((note) =>
          note.content.toLowerCase().includes(searchLower)
        );
      } else {
        // Smart fuzzy search
        const fuseResults = fuse.search(search);
        results = fuseResults.map((result) => result.item);
      }
    }

    // Apply board filter
    if (filterBoard) {
      results = results.filter((note) => note.boardId === filterBoard);
    }

    // Apply type filter
    if (filterType) {
      results = results.filter((note) => (note.type ?? "note") === filterType);
    }

    // Apply status filter
    if (filterStatus) {
      results = results.filter((note) => (note.status ?? "active") === filterStatus);
    }

    return results;
  }, [notes, search, searchMode, fuse, filterBoard, filterType, filterStatus]);

  // Handle Escape key and keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyboard = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // ⌘C or Ctrl+C to copy
      if ((e.metaKey || e.ctrlKey) && e.key === "c" && selectedNoteId) {
        e.preventDefault();
        const note = filteredNotes.find((n) => n.id === selectedNoteId);
        if (note) {
          navigator.clipboard.writeText(note.content).then(() => {
            toast.success("Copied to clipboard!", {
              description: note.content.slice(0, 50) + (note.content.length > 50 ? "..." : ""),
            });
          }).catch(() => {
            toast.error("Failed to copy to clipboard");
          });
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [isOpen, onClose, selectedNoteId, filteredNotes]);

  const handleSelect = (noteId: string) => {
    onSelectNote(noteId);
    onClose();
    setSearch(""); // Reset search
  };

  const clearAllFilters = () => {
    setFilterBoard(null);
    setFilterType(null);
    setFilterStatus(null);
  };

  const hasActiveFilters = filterBoard || filterType || filterStatus;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm">
      <Command
        className="w-full max-w-2xl bg-card border border-border/50 rounded-lg shadow-2xl overflow-hidden"
        shouldFilter={false} // We handle filtering manually
        onValueChange={(value) => setSelectedNoteId(value)}
      >
        {/* Search Input */}
        <div className="flex flex-col border-b border-border/50">
          {/* Input Row */}
          <div className="flex items-center gap-3 px-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder={
                searchMode === "smart"
                  ? "Smart search: typos, word order, partial matches..."
                  : "Search notes and ideas..."
              }
              className="flex-1 py-4 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground bg-muted rounded">
              ESC
            </kbd>
          </div>

          {/* Mode Toggle Row */}
          <div className="flex items-center gap-2 px-4 pb-2">
            <button
              onClick={() => setSearchMode("plain")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                searchMode === "plain"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Search className="w-3 h-3" />
              Plain
            </button>
            <button
              onClick={() => setSearchMode("smart")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                searchMode === "smart"
                  ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Smart
              <span className="text-[10px] opacity-75">(typos, flexible)</span>
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="w-3 h-3" />
              <span>Filters:</span>
            </div>

            {/* Board Filter */}
            <select
              value={filterBoard ?? ""}
              onChange={(e) => setFilterBoard(e.target.value || null)}
              className="px-2 py-1 text-xs rounded-md border border-border/50 bg-background text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <option value="">All Boards</option>
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filterType ?? ""}
              onChange={(e) => setFilterType((e.target.value || null) as Note["type"] | null)}
              className="px-2 py-1 text-xs rounded-md border border-border/50 bg-background text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="note">Note</option>
              <option value="idea">Idea</option>
              <option value="plan">Plan</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus ?? ""}
              onChange={(e) => setFilterStatus((e.target.value || null) as Note["status"] | null)}
              className="px-2 py-1 text-xs rounded-md border border-border/50 bg-background text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="graduated">Graduated</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
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
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-background rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-background rounded">↵</kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-background rounded">⌘C</kbd>
              Copy
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>{filteredNotes.length} results</span>
            {searchMode === "smart" && (
              <span className="flex items-center gap-1 text-primary">
                <Sparkles className="w-3 h-3" />
                Smart
              </span>
            )}
          </div>
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
