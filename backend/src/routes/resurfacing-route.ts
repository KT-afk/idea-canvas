/**
 * Resurfacing Routes
 * Epic 7: "Remember this?" system
 *
 * GET   /api/ideas/resurface               — get one forgotten idea to resurface
 * PATCH /api/ideas/:noteId/resurface-acted — mark that the user acted on a resurface toast
 */

import express from 'express';
import { getForgottenIdea, markResurfaceActedOn } from '../services/resurfacing-service';

export const resurfacingRouter = express.Router();

// Get one forgotten idea to show in a toast (pass ?frequency=normal|low|high)
resurfacingRouter.get('/ideas/resurface', async (req, res) => {
  try {
    const frequency = typeof req.query.frequency === 'string' ? req.query.frequency : 'normal';
    const idea = await getForgottenIdea(frequency);

    if (!idea) {
      // No ideas qualify — return 204 No Content
      return res.status(204).send();
    }

    res.status(200).json({ data: idea });
  } catch (error) {
    console.error('❌ Error fetching idea to resurface:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch resurface idea' } });
  }
});

// Mark that the user acted on the resurface toast (clicked "View")
resurfacingRouter.patch('/ideas/:noteId/resurface-acted', async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await markResurfaceActedOn(noteId);
    res.status(200).json({ data: note });
  } catch (error: any) {
    console.error('❌ Error marking resurface acted on:', error);
    if (error.message === 'Note not found') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update note' } });
  }
});
