import express from "express";
import Notes from "../models/NOTES";
import {
  deleteNote,
  getAllNotes,
  getAllNotesByBoardId,
  insertNote,
  updateNote,
} from "../services/notes-service";

export const router = express.Router();

//Get all notes
router.get("/notes", async (req, res) => {
  try {
    const result = await getAllNotes();
    console.log("Success in fetching all notes!");
    res.status(200).json({ result});
  } catch (error) {
    console.error("❌ Error getting all notes:", error);
    res.status(500).json({ success: false, error: "Failed to delete note." });
  }
});

//Create a note
router.post("/notes", async (req, res) => {
  try {
    const { content, x, y, width, height, color } = req.body;
    const Note = { content, x, y, width, height, color };
    const result = await insertNote(Note as Notes);
    res.status(200).json({ success: true, note: result });
  } catch (error) {
    console.error("❌ Error inserting a note:", error);
    res.status(500).json({ success: false, error: "Failed to insert note." });
  }
});

//Update note content or position
router.put("/notes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { content, x, y, width, height, color } = req.body;
    const result = await updateNote(id, { content, x, y, width, height, color });
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error updating a note:", error);
    res.status(500).json({ success: false, error: "Failed to update note." });
  }
});

//Get notes by board ID
router.get("/notes/board/:boardId", async (req, res) => {
  try {
    const notes = await getAllNotesByBoardId(req.params.boardId);
    res.status(200).json(notes);
  } catch (error) {
    console.error("❌ Error fetching all notes:", error);
    res.status(500).json({ error: "Failed to fetch notes." });
  }
});

//Delete a note
router.delete("/notes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await deleteNote(id);
    res.status(200).json({ success: result });
  } catch (error) {
    console.error("❌ Error deleting a note:", error);
    res.status(500).json({ success: false, error: "Failed to delete note." });
  }
});
