import { Search } from "lucide-react";
import { BoardSwitcher } from "./BoardSwitcher";
import { Button } from "./ui/button";
import type { Board } from "../types/types";

interface ToolbarProps {
  boards: Board[];
  currentBoardId: string | null;
  onBoardChange: (boardId: string) => void;
  onSearch?: () => void;
}

export function Toolbar({
  boards,
  currentBoardId,
  onBoardChange,
  onSearch,
}: ToolbarProps) {
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border/50"
      role="toolbar"
      aria-label="Main toolbar"
    >
      {/* Left: Logo + Board Switcher */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">i</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight hidden sm:block">
            idea-canvas
          </h1>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* Board Switcher */}
        <BoardSwitcher
          boards={boards}
          currentBoardId={currentBoardId}
          onBoardChange={onBoardChange}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search Button - Cmd+K hint */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSearch}
          className="gap-2 text-muted-foreground hover:text-foreground"
          aria-label="Search (Cmd+K)"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
    </div>
  );
}
