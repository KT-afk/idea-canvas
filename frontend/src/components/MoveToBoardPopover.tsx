// Story 2.4: Move item to a different board
// Popover with board selector: type-to-filter, keyboard accessible, excludes current board
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Board } from "@/types/types";
import { FolderOpen } from "lucide-react";
import { useRef, useState } from "react";

interface MoveToBoardPopoverProps {
  /** All available boards */
  boards: Board[];
  /** The board this card currently lives on (excluded from the list) */
  currentBoardId: string;
  /** Called when the user confirms a target board */
  onMove: (targetBoardId: string, targetBoardName: string) => void;
}

export function MoveToBoardPopover({ boards, currentBoardId, onMove }: Readonly<MoveToBoardPopoverProps>) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Only show boards that are NOT the current board
  const otherBoards = boards.filter((b) => b.id !== currentBoardId);

  const filtered = filter.trim()
    ? otherBoards.filter((b) => b.name.toLowerCase().includes(filter.trim().toLowerCase()))
    : otherBoards;

  const handleSelect = (board: Board) => {
    onMove(board.id, board.name);
    setOpen(false);
    setFilter("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      // Reset filter on open; focus input after render
      setFilter("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Keyboard: Enter on focused item, Escape closes
  const handleKeyDown = (e: React.KeyboardEvent, board: Board) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(board);
    }
  };

  // Don't render at all if there are no other boards to move to
  if (otherBoards.length === 0) return null;

  return (
    // Stop pointer events from bubbling into the card drag handler
    <div onPointerDown={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-1 text-xs bg-black/5 hover:bg-black/10 px-2 py-1 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors cursor-pointer"
            aria-label="Move to a different board"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <FolderOpen className="w-3 h-3" />
            <span>Move</span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-56 p-2"
          align="start"
          // Prevent the popover from closing when the card drags below it
          onPointerDown={(e) => e.stopPropagation()}
        >
          <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">Move to board</p>

          {/* Type-to-filter input */}
          <input
            ref={inputRef}
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter boards…"
            aria-label="Filter boards"
            className="w-full text-xs px-2 py-1.5 mb-1.5 rounded-md border border-border bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                setOpen(false);
              }
            }}
          />

          {/* Board list */}
          <ul role="listbox" aria-label="Available boards" className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="text-xs text-muted-foreground px-2 py-1.5">No boards found</li>
            ) : (
              filtered.map((board) => (
                <li key={board.id} role="option" aria-selected={false}>
                  <button
                    onClick={() => handleSelect(board)}
                    onKeyDown={(e) => handleKeyDown(e, board)}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors cursor-pointer truncate"
                    aria-label={`Move to ${board.name}`}
                  >
                    {board.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
