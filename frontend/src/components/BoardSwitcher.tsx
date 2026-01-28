import { Check, ChevronDown, MoreVertical, Pencil, Trash, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useBoardMutations } from "../hooks/useBoardMutations";
import { DeleteBoardDialog } from "./DeleteBoardDialog";
import { getBoardCardCount } from "../services/boardsService";
import type { Board } from "../types/types";

interface BoardSwitcherProps {
  boards: Board[];
  currentBoardId: string | null;
  onBoardChange: (boardId: string) => void;
}

export function BoardSwitcher({
  boards,
  currentBoardId,
  onBoardChange,
}: BoardSwitcherProps) {
  const currentBoard = boards.find((b) => b.id === currentBoardId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [cardCount, setCardCount] = useState(0);
  const [fallbackBoardName, setFallbackBoardName] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { renameBoard, deleteBoard } = useBoardMutations();

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (board: Board, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(board.id);
    setEditName(board.name);
    setOriginalName(board.name);
    setValidationError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setOriginalName("");
    setValidationError("");
  };

  const saveEdit = (boardId: string) => {
    const trimmedName = editName.trim();

    // Validation
    if (!trimmedName) {
      setValidationError("Board name cannot be empty");
      return;
    }
    if (trimmedName.length > 100) {
      setValidationError("Board name must be 100 characters or less");
      return;
    }

    // Skip API call if name hasn't changed
    if (trimmedName === originalName) {
      cancelEditing();
      return;
    }

    // Save changes
    renameBoard.mutate(
      { id: boardId, name: trimmedName },
      {
        onSuccess: () => {
          cancelEditing();
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, boardId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(boardId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  const openDeleteDialog = async (board: Board, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionMenuOpen(null);
    setBoardToDelete(board);
    
    // Fetch card count
    try {
      const count = await getBoardCardCount(board.id);
      setCardCount(count);
      
      // Get fallback board name
      const fallbackBoard = boards
        .filter((b) => b.id !== board.id)
        .sort((a, b) => a.name.localeCompare(b.name))[0];
      setFallbackBoardName(fallbackBoard?.name || "");
      
      setDeleteDialogOpen(true);
    } catch (error) {
      console.error("Failed to get board info:", error);
      toast.error("Failed to load board information");
      setBoardToDelete(null);
    }
  };

  const handleDelete = () => {
    if (boardToDelete) {
      deleteBoard.mutate(boardToDelete.id);
      setBoardToDelete(null);
    }
  };

  if (boards.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            aria-label="Switch board"
          >
            <span className="max-w-[150px] truncate">
              {currentBoard?.name || "Select Board"}
            </span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px]">{boards.map((board) => (
          <DropdownMenuItem
            key={board.id}
            onSelect={(e) => {
              if (editingId === board.id) {
                e.preventDefault();
              } else {
                onBoardChange(board.id);
              }
            }}
            className="flex items-center justify-between cursor-pointer group"
          >
            {editingId === board.id ? (
              <div className="flex-1 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      setValidationError("");
                    }}
                    onKeyDown={(e) => handleKeyDown(e, board.id)}
                    onBlur={() => saveEdit(board.id)}
                    disabled={renameBoard.isPending}
                    className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Edit board name"
                    aria-invalid={!!validationError}
                    aria-describedby={validationError ? `error-${board.id}` : undefined}
                    maxLength={101}
                  />
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur from firing
                      e.stopPropagation();
                      cancelEditing();
                    }}
                    className="p-1 hover:bg-accent rounded"
                    aria-label="Cancel editing"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {validationError && (
                  <span
                    id={`error-${board.id}`}
                    className="text-xs text-red-500"
                    role="alert"
                  >
                    {validationError}
                  </span>
                )}
                {editName.length >= 90 && !validationError && (
                  <span className="text-xs text-muted-foreground">
                    {editName.length}/100 characters
                  </span>
                )}
              </div>
            ) : (
              <>
                <span className="truncate flex-1">{board.name}</span>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <DropdownMenu 
                    open={actionMenuOpen === board.id} 
                    onOpenChange={(open) => setActionMenuOpen(open ? board.id : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        disabled={editingId !== null}
                        className="p-1 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={`Board actions for ${board.name}`}
                        type="button"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem
                        onClick={(e) => {
                          startEditing(board, e);
                          setActionMenuOpen(null);
                        }}
                        disabled={renameBoard.isPending}
                      >
                        <Pencil className="w-3 h-3 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => openDeleteDialog(board, e)}
                        disabled={boards.length <= 1 || deleteBoard.isPending}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="w-3 h-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {board.id === currentBoardId && (
                    <Check className="w-4 h-4" />
                  )}
                </div>
              </>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    
    {boardToDelete && (
      <DeleteBoardDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleteBoard={handleDelete}
        boardName={boardToDelete.name}
        cardCount={cardCount}
        fallbackBoardName={fallbackBoardName}
        isLoading={deleteBoard.isPending}
      />
    )}
    </>
  );
}