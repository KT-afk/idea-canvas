import express from "express";
import { sequelize } from "../config/db";
import Notes from "../models/NOTES";
import { updateLastOpenedAt } from "../services/boards-service";
import {
  deleteNote,
  getAllNotesByBoardId,
  getNoteById,
  insertNote,
  updateNote,
} from "../services/notes-service";

export const router = express.Router();

//Get all notes (optionally filtered by boardId query param)
router.get("/notes", async (req, res) => {
  try {
    const { boardId } = req.query;
    
    if (boardId && typeof boardId === 'string') {
      // Update last opened timestamp for the board
      updateLastOpenedAt(boardId).catch(err => {
        console.error("❌ Error updating last opened at for board:", err);
      });
      const notes = await getAllNotesByBoardId(boardId);
      return res.status(200).json({ data: notes });
    }
    
    // If no boardId provided, return empty array (or could return all notes)
    // For now, returning empty array as each note should belong to a board
    return res.status(200).json({ data: [] });
  } catch (error) {
    console.error("❌ Error fetching notes:", error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch notes' } });
  }
});

//Create a note
router.post("/notes", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, content, type, status, positionX, positionY, boardId, userId, backgroundColor, textColor, archivedAt } = req.body;

    // Validate required fields
    if (!content) {
      await transaction.rollback();
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Content is required' }
      });
    }

    if (positionX === undefined || positionY === undefined) {
      await transaction.rollback();
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Position coordinates (positionX, positionY) are required' }
      });
    }

    const Note = { title, content, type, status, positionX, positionY, boardId, userId, backgroundColor, textColor, archivedAt };
    const result = await insertNote(Note as Notes, { transaction });
    await transaction.commit();
    res.status(201).json({ data: result });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error inserting a note:", error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create note' } });
  }
});

//Update note content or position
router.put("/notes/:id", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { title, content, type, status, positionX, positionY, boardId, userId, backgroundColor, textColor, archivedAt } = req.body;
    const result = await updateNote(id, { title, content, type, status, positionX, positionY, boardId, userId, backgroundColor, textColor, archivedAt }, { transaction });
    await transaction.commit();
    res.status(200).json({ data: result });
  } catch (error: any) {
    await transaction.rollback();
    console.error("❌ Error updating a note:", error);
    if (error.message === "Note not found or no changes made.") {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update note' } });
  }
});

//Get notes by board ID
router.get("/notes/board/:boardId", async (req, res) => {
  try {
    const {boardId} = req.params;
    updateLastOpenedAt(boardId).catch(err => {
      console.error("❌ Error updating last opened at for board:", err);
    });
    const notes = await getAllNotesByBoardId(boardId);
    res.status(200).json({ data: notes });
  } catch (error) {
    console.error("❌ Error fetching notes by board:", error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch notes' } });
  }
});

//Get single note by ID
router.get("/notes/:id", async (req, res) => {
  try {
    const note = await getNoteById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } });
    }
    res.status(200).json({ data: note });
  } catch (error) {
    console.error("❌ Error fetching note by ID:", error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch note' } });
  }
});

//Delete a note
router.delete("/notes/:id", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.params.id;
    const result = await deleteNote(id, { transaction });
    await transaction.commit();
    res.status(200).json({ data: { deleted: true } });
  } catch (error: any) {
    await transaction.rollback();
    console.error("❌ Error deleting a note:", error);
    if (error.message === "Note not found.") {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete note' } });
  }
});
