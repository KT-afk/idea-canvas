import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface NewBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBoard: (name: string) => void;
  isLoading?: boolean; // Story 3.1: Loading state during board creation
}

export function NewBoardDialog({
  open,
  onOpenChange,
  onCreateBoard,
  isLoading = false,
}: NewBoardDialogProps) {
  const [boardName, setBoardName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setBoardName("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = boardName.trim();
    
    // Story 3.1: Generate default name if empty
    const finalName = trimmedName || `Untitled Board ${Date.now()}`;
    
    // Story 3.1: Validate max 100 characters
    if (finalName.length > 100) {
      return;
    }
    
    onCreateBoard(finalName);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Story 3.1: Enter to submit
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Give your board a name to organize your ideas. You can always rename it later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="board-name" className="text-sm font-medium">
                Board Name
              </label>
              <input
                ref={inputRef}
                id="board-name"
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Work Ideas, Side Projects"
                maxLength={100}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Board name"
                aria-invalid={boardName.length > 100}
                aria-describedby={boardName.length > 90 ? "char-count" : undefined}
              />
              {boardName.length > 90 && (
                <p id="char-count" className="text-xs text-muted-foreground">
                  {100 - boardName.length} characters remaining
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
