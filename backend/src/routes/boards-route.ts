import express from "express";
import {
  getAllBoards,
  getBoardById,
  createBoard,
  updateBoard,
  getBoardCardCount,
  getFallbackBoard,
  softDeleteBoard,
  restoreBoard,
  hardDeleteBoard
} from "../services/boards-service";

export const boardsRouter = express.Router();

//Get all boards
boardsRouter.get("/boards", async (req, res) => {
  try {
    const boards = await getAllBoards();
    res.status(200).json({ data: boards });
  } catch (error) {
    console.error("❌ Error fetching all boards:", error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch boards' } });
  }
});

//Get single board by ID
boardsRouter.get("/boards/:id", async (req, res) => {
  try {
    const board = await getBoardById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Board not found' } });
    }
    res.status(200).json({ data: board });
  } catch (error) {
    console.error("❌ Error fetching board by ID:", error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch board' } });
  }
});

// Story 3.1: Create new board
boardsRouter.post("/boards", async (req, res) => {
  try {
    const { name, userId } = req.body;
    
    // Validation: name must be non-empty and max 100 characters
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ 
        error: { code: 'INVALID_INPUT', message: 'Board name is required' } 
      });
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return res.status(400).json({ 
        error: { code: 'INVALID_INPUT', message: 'Board name cannot be empty' } 
      });
    }
    
    if (trimmedName.length > 100) {
      return res.status(400).json({ 
        error: { code: 'INVALID_INPUT', message: 'Board name must be 100 characters or less' } 
      });
    }
    
    const board = await createBoard({ name: trimmedName, userId: userId || null });
    res.status(201).json({ data: board });
  } catch (error) {
    console.error("❌ Error creating board:", error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create board' } });
  }
});

// Story 3.2: Update board name
boardsRouter.put("/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Validation: name must be non-empty and max 100 characters
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ 
        error: { code: 'INVALID_INPUT', message: 'Board name is required' } 
      });
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return res.status(400).json({ 
        error: { code: 'INVALID_INPUT', message: 'Board name cannot be empty' } 
      });
    }
    
    if (trimmedName.length > 100) {
      return res.status(400).json({ 
        error: { code: 'INVALID_INPUT', message: 'Board name must be 100 characters or less' } 
      });
    }
    
    const board = await updateBoard(id, trimmedName);
    res.status(200).json({ data: board });
  } catch (error: any) {
    console.error("❌ Error updating board:", error);
    if (error.message === "Board not found") {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Board not found' } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update board' } });
  }
});

// Story 3.3: Get board card count
boardsRouter.get("/boards/:id/card-count", async (req, res) => {
  try {
    const { id } = req.params;
    const count = await getBoardCardCount(id);
    res.status(200).json({ data: { count } });
  } catch (error) {
    console.error("❌ Error getting board card count:", error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to get card count' } });
  }
});

// Story 3.3: Soft delete a board
boardsRouter.delete("/boards/:id/soft", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string || "default-user";
    
    // Check if this is the last board
    const allBoards = await getAllBoards();
    if (allBoards.length <= 1) {
      return res.status(400).json({ 
        error: { code: 'INVALID_OPERATION', message: 'Cannot delete the last board' } 
      });
    }
    
    // Get fallback board (respects user's default board preference)
    const fallbackBoard = await getFallbackBoard(id, userId);
    if (!fallbackBoard) {
      return res.status(500).json({ 
        error: { code: 'INTERNAL_ERROR', message: 'No fallback board found' } 
      });
    }
    
    // Soft delete the board and move cards
    const deletedBoard = await softDeleteBoard(id, fallbackBoard.id);
    
    res.status(200).json({ 
      data: {
        board: deletedBoard,
        fallbackBoardId: fallbackBoard.id,
        fallbackBoardName: fallbackBoard.name
      }
    });
  } catch (error: any) {
    console.error("❌ Error soft deleting board:", error);
    if (error.message === "Board not found") {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Board not found' } });
    }
    if (error.message === "Board is already deleted") {
      return res.status(400).json({ error: { code: 'INVALID_OPERATION', message: 'Board is already deleted' } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete board' } });
  }
});

// Story 3.3: Restore a soft-deleted board
boardsRouter.post("/boards/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;
    const restoredBoard = await restoreBoard(id);
    res.status(200).json({ data: restoredBoard });
  } catch (error: any) {
    console.error("❌ Error restoring board:", error);
    if (error.message === "Board not found") {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Board not found' } });
    }
    if (error.message === "Board is not deleted") {
      return res.status(400).json({ error: { code: 'INVALID_OPERATION', message: 'Board is not deleted' } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to restore board' } });
  }
});

// Story 3.3: Permanently delete a board (hard delete)
boardsRouter.delete("/boards/:id/hard", async (req, res) => {
  try {
    const { id } = req.params;
    await hardDeleteBoard(id);
    res.status(204).send();
  } catch (error: any) {
    console.error("❌ Error permanently deleting board:", error);
    if (error.message === "Board not found") {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Board not found' } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to permanently delete board' } });
  }
});
