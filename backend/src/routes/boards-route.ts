import express from "express";
import { getAllBoards, getBoardById } from "../services/boards-service";

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
