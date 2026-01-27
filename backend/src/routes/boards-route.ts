import express from "express";
import { getAllBoards, getBoardById, createBoard, updateBoard } from "../services/boards-service";

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
