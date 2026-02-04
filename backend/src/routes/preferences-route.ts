import express from "express";
import { getPreferences, updatePreferences, setDefaultBoard } from "../services/preferences-service";

export const preferencesRouter = express.Router();

// Get user preferences
preferencesRouter.get("/preferences", async (req, res) => {
  try {
    const userId = req.query.userId as string || "default-user";
    const prefs = await getPreferences(userId);
    res.json({ data: prefs });
  } catch (error) {
    console.error("❌ Error fetching preferences:", error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch preferences' } });
  }
});

// Update preferences (general)
preferencesRouter.put("/preferences", async (req, res) => {
  try {
    const userId = req.body.userId || "default-user";
    const updates = req.body;
    
    // Remove read-only fields if present
    delete updates.id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const prefs = await updatePreferences(userId, updates);
    res.json({ data: prefs });
  } catch (error) {
    console.error("❌ Error updating preferences:", error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update preferences' } });
  }
});

// Story 3.4: Set Default Home Board
preferencesRouter.put("/preferences/default-board", async (req, res) => {
  try {
    const { boardId, userId } = req.body;
    
    if (!boardId) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'boardId is required' } });
    }

    const prefs = await setDefaultBoard(boardId, userId || "default-user");
    res.json({ data: prefs });
  } catch (error: any) {
    console.error("❌ Error setting default board:", error);
    if (error.message === "Board not found") {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Board not found' } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to set default board' } });
  }
});
