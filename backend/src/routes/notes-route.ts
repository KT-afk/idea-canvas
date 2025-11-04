import express from "express";
import { getAllNotes, insertNote, updateNote, deleteNote, getAllNotesByBoardId } from "../services/notes-service";

export const router = express.Router();

router.post("/update", async (req, res) => {
    try{
        const note = req.body;
        const result = await updateNote(note.id, note);
        res.status(200).json({ success: result });
    } catch (error) {
        console.error("❌ Error updating a note:", error);
        res.status(500).json({ success: false, error: "Failed to update note." });
    }
})
router.post("/insert", async (req, res) => {
    try {
        const note = req.body;
        const result = await insertNote(note);
        res.status(200).json({ success: result });
    } catch (error) {
        console.error("❌ Error inserting a note:", error);
        res.status(500).json({ success: false, error: "Failed to insert note." });
    }
});
router.get("/notes/board/:boardId", async (req, res) => {
    try {
        const notes = await getAllNotesByBoardId(req.params.boardId);
        res.status(200).json(notes);
    } catch (error) {
        console.error("❌ Error fetching all notes:", error);
        res.status(500).json({ error: "Failed to fetch notes." });
    }
});
router.get("/get/notes", async (req, res) => {
    try {
        const { id } = req.body;
        const result = await getAllNotes();
        res.status(200).json({ success: result });
    } catch (error) {
        console.error("❌ Error getting all notes:", error);
        res.status(500).json({ success: false, error: "Failed to delete note." });
    }
});
router.delete("/delete", async (req, res) => {
    try {
        const { id } = req.body;
        const result = await deleteNote(id);
        res.status(200).json({ success: result });
    } catch (error) {
        console.error("❌ Error deleting a note:", error);
        res.status(500).json({ success: false, error: "Failed to delete note." });
    }
});
