import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createBoard, updateBoard } from "../services/boardsService";
import type { Board } from "../types/types";

export function useBoardMutations() {
  const queryClient = useQueryClient();

  // Story 3.1: Create board with optimistic UI
  const createBoardMutation = useMutation({
    mutationFn: (name: string) => createBoard(name),
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ["boards"] });
      const previousBoards = queryClient.getQueryData<Board[]>(["boards"]);

      // Generate temporary ID for optimistic UI
      const tempId = `temp-${Date.now()}`;
      const optimisticBoard: Board = {
        id: tempId,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically add board to cache
      queryClient.setQueryData<Board[]>(["boards"], (oldBoards = []) => [
        ...oldBoards,
        optimisticBoard,
      ]);

      return { previousBoards, tempId };
    },
    onSuccess: (newBoard, _name, context) => {
      // Replace temporary board with real board from server
      queryClient.setQueryData<Board[]>(["boards"], (oldBoards = []) =>
        oldBoards.map((board) =>
          board.id === context.tempId ? newBoard : board
        )
      );
      toast.success("Board created successfully");
    },
    onError: (_err, _var, context) => {
      // Rollback on error
      if (context?.previousBoards) {
        queryClient.setQueryData(["boards"], context.previousBoards);
      }
      toast.error("Failed to create board");
    },
  });

  // Story 3.2: Rename board with optimistic UI
  const renameBoardMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateBoard(id, name),
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: ["boards"] });
      const previousBoards = queryClient.getQueryData<Board[]>(["boards"]);

      // Optimistically update board name in cache
      queryClient.setQueryData<Board[]>(["boards"], (oldBoards = []) =>
        oldBoards.map((board) =>
          board.id === id ? { ...board, name, updatedAt: new Date().toISOString() } : board
        )
      );

      return { previousBoards };
    },
    onSuccess: (updatedBoard) => {
      // Replace with actual data from server
      queryClient.setQueryData<Board[]>(["boards"], (oldBoards = []) =>
        oldBoards.map((board) =>
          board.id === updatedBoard.id ? updatedBoard : board
        )
      );
      toast.success("Board renamed successfully");
    },
    onError: (_err, _var, context) => {
      // Rollback on error
      if (context?.previousBoards) {
        queryClient.setQueryData(["boards"], context.previousBoards);
      }
      toast.error("Failed to rename board");
    },
  });

  return {
    createBoard: createBoardMutation,
    renameBoard: renameBoardMutation,
  };
}
