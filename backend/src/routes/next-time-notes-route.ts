/**
 * Next Time Notes Routes
 * Epic 8, Story 8.1
 *
 * GET    /api/notes/:noteId/next-time-notes          — list next-time notes for a card
 * POST   /api/notes/:noteId/next-time-notes          — add a next-time note to a card
 * PATCH  /api/next-time-notes/:id/complete           — mark a next-time note as complete
 * DELETE /api/next-time-notes/:id                    — delete a next-time note
 */

import express from 'express';
import {
  getNextTimeNotes,
  createNextTimeNote,
  completeNextTimeNote,
  deleteNextTimeNote,
} from '../services/next-time-notes-service';

export const nextTimeNotesRouter = express.Router();

// List next-time notes for a card
nextTimeNotesRouter.get('/notes/:noteId/next-time-notes', async (req, res) => {
  try {
    const { noteId } = req.params;
    const notes = await getNextTimeNotes(noteId);
    res.status(200).json({ data: notes });
  } catch (error) {
    console.error('❌ Error fetching next-time notes:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch next-time notes' } });
  }
});

// Add a next-time note to a card
nextTimeNotesRouter.post('/notes/:noteId/next-time-notes', async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Content is required' } });
    }

    const note = await createNextTimeNote(noteId, content.trim());
    res.status(201).json({ data: note });
  } catch (error) {
    console.error('❌ Error creating next-time note:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create next-time note' } });
  }
});

// Mark a next-time note as complete
nextTimeNotesRouter.patch('/next-time-notes/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const note = await completeNextTimeNote(id);
    res.status(200).json({ data: note });
  } catch (error: any) {
    console.error('❌ Error completing next-time note:', error);
    if (error.message === 'Next time note not found') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Next-time note not found' } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to complete next-time note' } });
  }
});

// Delete a next-time note
nextTimeNotesRouter.delete('/next-time-notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteNextTimeNote(id);
    res.status(200).json({ data: { deleted: true } });
  } catch (error: any) {
    console.error('❌ Error deleting next-time note:', error);
    if (error.message === 'Next time note not found') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Next-time note not found' } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete next-time note' } });
  }
});
