import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface DeleteBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteBoard: () => void;
  boardName: string;
  cardCount: number;
  fallbackBoardName?: string;
  isLoading?: boolean;
}

export function DeleteBoardDialog({
  open,
  onOpenChange,
  onDeleteBoard,
  boardName,
  cardCount,
  fallbackBoardName,
  isLoading = false,
}: DeleteBoardDialogProps) {
  const handleDelete = () => {
    onDeleteBoard();
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter to confirm delete
    if (e.key === "Enter") {
      e.preventDefault();
      handleDelete();
    }
    // Escape to cancel
    if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          // Focus on Cancel button by default (safer)
          const target = e.currentTarget;
          if (target instanceof HTMLElement) {
            const cancelButton = target.querySelector<HTMLButtonElement>('[data-cancel-button]');
            cancelButton?.focus();
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle>Delete Board</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>"{boardName}"</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {cardCount > 0 && fallbackBoardName && (
            <p className="text-sm text-muted-foreground">
              {cardCount} {cardCount === 1 ? 'card' : 'cards'} will be moved to <strong>"{fallbackBoardName}"</strong>.
            </p>
          )}
          {cardCount === 0 && (
            <p className="text-sm text-muted-foreground">
              This board is empty and will be deleted.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            data-cancel-button
          >
            Cancel
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
